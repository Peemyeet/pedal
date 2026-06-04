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

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = ALLOWED_TYPES[file.type];
  const filename = `${productId}-${Date.now()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  return `/uploads/products/${filename}`;
}
