"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { createPost } from "@/app/actions";
import { shrinkImage } from "@/lib/shrinkImage";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";

const MAX = 6;
const MAX_BYTES = 4 * 1024 * 1024;

type Picked = { file: File; url: string };

export function NewPostForm({ cats, defaultCatId }: { cats: { id: string; name: string }[]; defaultCatId: string }) {
  const [state, formAction] = useActionState(createPost, undefined);
  const [picked, setPicked] = useState<Picked[]>([]);
  const [localError, setLocalError] = useState<string>();
  const [preparing, setPreparing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickedRef = useRef(picked);
  useEffect(() => {
    pickedRef.current = picked;
  }, [picked]);
  useEffect(() => () => pickedRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  async function add(files: FileList | null) {
    if (!files) return;
    setLocalError(undefined);
    const chosen = Array.from(files);
    if (inputRef.current) inputRef.current.value = "";
    const next = [...picked];
    setPreparing(true);
    for (const original of chosen) {
      if (!original.type.startsWith("image/")) continue;
      if (next.length >= MAX) {
        setLocalError(`Up to ${MAX} photos per post.`);
        break;
      }
      const file = await shrinkImage(original);
      if (file.size > MAX_BYTES) {
        setLocalError(`"${file.name}" is over 4 MB.`);
        continue;
      }
      next.push({ file, url: URL.createObjectURL(file) });
    }
    setPicked(next);
    setPreparing(false);
  }

  function remove(i: number) {
    URL.revokeObjectURL(picked[i].url);
    setPicked(picked.filter((_, n) => n !== i));
  }

  // Files live in React state, not the input, so they survive form resets after an error.
  function submit(fd: FormData) {
    fd.delete("photos");
    picked.forEach((p) => fd.append("photos", p.file));
    return formAction(fd);
  }

  return (
    <form action={submit} className="mt-6 space-y-5">
      <div>
        <span className="label">Photos ({picked.length}/{MAX})</span>
        <div className="grid grid-cols-3 gap-2">
          {picked.map((p, i) => (
            <div key={p.url} className="relative aspect-square overflow-hidden rounded-2xl bg-ink/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-[#0b1a22] shadow"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {picked.length < MAX && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line text-sm font-semibold text-ink-soft hover:border-paw hover:text-paw">
              <ImagePlus size={28} />
              Add photos
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="sr-only"
                onChange={(e) => add(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>

      {cats.length > 0 && (
        <div>
          <label className="label" htmlFor="catId">Who&apos;s in it?</label>
          <select id="catId" name="catId" defaultValue={state?.values?.catId ?? defaultCatId} className="input">
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="">Some other cat</option>
          </select>
        </div>
      )}

      <div>
        <label className="label" htmlFor="caption">Caption</label>
        <textarea
          id="caption"
          name="caption"
          rows={3}
          maxLength={2000}
          placeholder="Caught mid-zoomies…"
          defaultValue={state?.values?.caption}
          className="input resize-y"
        />
      </div>

      <FormError error={localError ?? state?.error} />
      {preparing ? (
        <button type="button" disabled className="btn-primary w-full py-3">Preparing photos…</button>
      ) : (
        <SubmitButton className="btn-primary w-full py-3" pendingText="Uploading…">Share with the fans</SubmitButton>
      )}
    </form>
  );
}
