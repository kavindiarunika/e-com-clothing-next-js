import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const uploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "products"
);

export async function saveProductImage(file) {
  const extension =
    path.extname(file.name || "").toLowerCase() ||
    ".jpg";
  const filename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), buffer);

  return `/uploads/products/${filename}`;
}