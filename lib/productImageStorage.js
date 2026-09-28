import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

async function saveUploadedImage(file, folder) {
  const extension =
    path.extname(file.name || "").toLowerCase() ||
    ".jpg";
  const filename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    folder
  );

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}

export function saveProductImage(file) {
  return saveUploadedImage(file, "products");
}

export function saveCategoryImage(file) {
  return saveUploadedImage(file, "categories");
}