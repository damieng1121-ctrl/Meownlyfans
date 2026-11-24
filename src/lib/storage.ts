import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "./db";

/**
 * Photo storage. Photos are kept in the database (StoredImage) and served by
 * src/app/uploads/[...path]/route.ts, so the app runs on any host, serverless
 * included, with nothing but a Postgres URL. Browsers shrink photos before
 * upload (src/lib/shrinkImage.ts), so each one is typically a few hundred KB.
 * To move to a cloud bucket later, reimplement saveImage/deleteImage/readImage.
 */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const SIGNATURES: { ext: string; type: string; test: (b: Buffer) => boolean }[] = [
  { ext: "jpg", type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", type: "image/png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "gif", type: "image/gif", test: (b) => b.subarray(0, 4).toString("ascii") === "GIF8" },
  { ext: "webp", type: "image/webp", test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
];

export class UploadError extends Error {}

/** Validates an uploaded image by its contents and stores it. Returns its public URL. */
export async function saveImage(file: File, folder: "posts" | "avatars"): Promise<string> {
  if (file.size === 0) throw new UploadError("That file is empty.");
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError(`"${file.name}" is over 4 MB.`);
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = SIGNATURES.find((s) => s.test(buf));
  if (!kind) throw new UploadError(`"${file.name}" isn't a JPEG, PNG, GIF or WebP image.`);

  const id = `${folder}-${randomBytes(12).toString("hex")}`;
  await db.storedImage.create({ data: { id, contentType: kind.type, data: buf } });
  return `/uploads/${id}.${kind.ext}`;
}

function idFromUrl(url: string | null | undefined) {
  const m = url?.match(/^\/uploads\/((?:posts|avatars)-[0-9a-f]{24})\.\w+$/);
  return m?.[1] ?? null;
}

export async function deleteImage(url: string | null | undefined) {
  const id = idFromUrl(url);
  if (id) await db.storedImage.deleteMany({ where: { id } });
}

export async function readImage(url: string) {
  const id = idFromUrl(url);
  return id ? db.storedImage.findUnique({ where: { id } }) : null;
}
