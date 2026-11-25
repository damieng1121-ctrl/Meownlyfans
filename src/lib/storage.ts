import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "./db";
import { checkImage } from "./moderation";

/**
 * Photo storage. Photos are kept in the database (StoredImage) and served by
 * src/app/uploads/[...path]/route.ts, so the app runs on any host, serverless
 * included, with nothing but a Postgres URL. Browsers shrink photos before
 * upload (src/lib/shrinkImage.ts), so each one is typically a few hundred KB.
 * Every photo goes through checkUpload (format + content moderation) first.
 * To move to a cloud bucket later, reimplement storeImage/deleteImage/readImage.
 */
// Under the 5 MB the photo check accepts once base64-encoded. Browsers shrink photos well below this.
export const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;

type Kind = { ext: string; type: "image/jpeg" | "image/png" | "image/webp"; test: (b: Buffer) => boolean; animated?: (b: Buffer) => boolean };

// Still images only: the photo check sees a single frame, so animations could hide anything after it.
const SIGNATURES: Kind[] = [
  { ext: "jpg", type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: "png",
    type: "image/png",
    test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    animated: (b) => b.includes("acTL"), // APNG animation control chunk
  },
  {
    ext: "webp",
    type: "image/webp",
    test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
    animated: (b) => b.subarray(12, 16).toString("ascii") === "VP8X" && (b[20] & 0x02) !== 0,
  },
];

export class UploadError extends Error {}

export type CheckedImage = { buf: Buffer; kind: Kind };

/**
 * Validates an uploaded photo by its contents and runs the content check.
 * Throws UploadError with a friendly message if it can't be posted.
 */
export async function checkUpload(file: File, opts: { requireCat: boolean }): Promise<CheckedImage> {
  if (file.size === 0) throw new UploadError("That file is empty.");
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError(`"${file.name}" is too big (max 3.5 MB).`);
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = SIGNATURES.find((s) => s.test(buf));
  if (!kind) throw new UploadError(`"${file.name}" isn't a JPEG, PNG or WebP photo.`);
  if (kind.animated?.(buf)) throw new UploadError(`"${file.name}" is animated. Please upload a still photo.`);
  const verdict = await checkImage(buf, kind.type, file.name, opts.requireCat);
  if (!verdict.ok) throw new UploadError(verdict.message);
  return { buf, kind };
}

/** Stores a photo that has passed checkUpload. Returns its public URL. */
export async function storeImage({ buf, kind }: CheckedImage, folder: "posts" | "avatars"): Promise<string> {
  const id = `${folder}-${randomBytes(12).toString("hex")}`;
  await db.storedImage.create({ data: { id, contentType: kind.type, data: new Uint8Array(buf) } });
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
