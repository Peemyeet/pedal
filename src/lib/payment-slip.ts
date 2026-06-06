import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/payments");
const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export async function savePaymentSlipFile(orderId: string, file: File) {
  if (!ALLOWED_TYPES[file.type]) {
    throw new Error("UNSUPPORTED_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("TOO_LARGE");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = ALLOWED_TYPES[file.type];
  const safeId = orderId.replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `${safeId}-${Date.now()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  return `/uploads/payments/${filename}`;
}
