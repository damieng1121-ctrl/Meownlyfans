/**
 * Browser-side: scales a photo down so uploads stay small (hosts like Vercel
 * cap request bodies at 4.5 MB). GIFs become a still JPEG of their first frame,
 * since only still photos can be content-checked.
 * Falls back to the original file if the browser can't decode it.
 */
export async function shrinkImage(file: File, maxSide = 1600, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const mustConvert = file.type === "image/gif";
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1024 * 1024 && !mustConvert) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (!blob || (blob.size >= file.size && !mustConvert)) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** Replaces the file in an <input type=file> with a shrunk copy. */
export async function shrinkInputFile(input: HTMLInputElement, maxSide: number) {
  const f = input.files?.[0];
  if (!f) return;
  const small = await shrinkImage(f, maxSide);
  if (small === f) return;
  const dt = new DataTransfer();
  dt.items.add(small);
  input.files = dt.files;
}
