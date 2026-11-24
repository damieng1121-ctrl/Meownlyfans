import "server-only";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Photo storage. Files go to UPLOAD_DIR on local disk and are served by
 * src/app/uploads/[...path]/route.ts. To move to cloud storage (S3, R2,
 * Vercel Blob, Neon storage...), reimplement saveImage/deleteImage here;
 * nothing else in the app touches the filesystem.
 */
export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "./uploads");

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const SIGNATURES: { ext: string; test: (b: Buffer) => boolean }[] = [
  { ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "gif", test: (b) => b.subarray(0, 4).toString("ascii") === "GIF8" },
  { ext: "webp", test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
];

export class UploadError extends Error {}

/** Validates an uploaded image by its contents and stores it. Returns its public URL. */
export async function saveImage(file: File, folder: "posts" | "avatars"): Promise<string> {
  if (file.size === 0) throw new UploadError("That file is empty.");
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError(`"${file.name}" is over 8 MB.`);
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = SIGNATURES.find((s) => s.test(buf));
  if (!kind) throw new UploadError(`"${file.name}" isn't a JPEG, PNG, GIF or WebP image.`);

  const name = `${randomBytes(12).toString("hex")}.${kind.ext}`;
  const dir = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), buf);
  return `/uploads/${folder}/${name}`;
}

export async function deleteImage(url: string | null | undefined) {
  if (!url?.startsWith("/uploads/")) return;
  const target = path.resolve(/*turbopackIgnore: true*/ UPLOAD_DIR, url.slice("/uploads/".length));
  if (!target.startsWith(UPLOAD_DIR + path.sep)) return;
  await unlink(target).catch(() => {});
}
