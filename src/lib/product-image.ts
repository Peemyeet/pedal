import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/products");
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isLocalProductImage(image: string) {
  return image.startsWith("/uploads/products/");
}

export async function deleteLocalProductImage(image: string) {
  if (!isLocalProductImage(image)) return;
  const filepath = path.join(process.cwd(), "public", image);
  try {
    await unlink(filepath);
  } catch {
    // file may already be gone
  }
}

export async function saveProductImageFile(productId: string, file: File) {
  if (!ALLOWED_TYPES[file.type]) {
    throw new Error("UNSUPPORTED_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("TOO_LARGE");
  }

  const ext = ALLOWED_TYPES[file.type];
  const filename = `${productId}-${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${filename}`, bytes, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const filepath = path.join(UPLOAD_DIR, filename);
    await writeFile(filepath, bytes);
    return `/uploads/products/${filename}`;
  } catch {
    if (process.env.VERCEL) {
      throw new Error("READ_ONLY_FS");
    }
    throw new Error("UPLOAD_FAILED");
  }
}
