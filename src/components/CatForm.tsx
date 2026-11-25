"use client";

import { useActionState, useState } from "react";
import { Camera } from "lucide-react";
import { saveCat } from "@/app/actions";
import { shrinkInputFile } from "@/lib/shrinkImage";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { Avatar } from "@/components/Avatar";

type Cat = { id: string; name: string; breed: string; age: string; bio: string; avatarUrl: string | null };

export function CatForm({ cat }: { cat?: Cat }) {
  const [state, action] = useActionState(saveCat, undefined);
  const [preview, setPreview] = useState<string | null>(cat?.avatarUrl ?? null);
  const v = state?.values;
  return (
    <form action={action} className="mt-6 space-y-4">
      {cat && <input type="hidden" name="catId" value={cat.id} />}
      <label className="flex cursor-pointer items-center gap-4">
        <span className="relative">
          <Avatar src={preview} name={cat?.name ?? "cat"} size={88} cat />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-paw p-1.5 text-white shadow">
            <Camera size={16} />
          </span>
        </span>
        <span className="text-sm font-semibold text-paw">{preview ? "Change photo" : "Add a profile photo"}</span>
        <input
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="sr-only"
          onChange={async (e) => {
            const input = e.currentTarget;
            await shrinkInputFile(input, 600);
            const f = input.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
        />
      </label>
      <div>
        <label className="label" htmlFor="name">Name</label>
        <input id="name" name="name" required maxLength={40} defaultValue={v?.name ?? cat?.name} className="input" placeholder="Sir Fluffington" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="breed">Breed</label>
          <input id="breed" name="breed" maxLength={60} defaultValue={v?.breed ?? cat?.breed} className="input" placeholder="Tuxedo, Maine Coon, mystery…" />
        </div>
        <div>
          <label className="label" htmlFor="age">Age</label>
          <input id="age" name="age" maxLength={40} defaultValue={v?.age ?? cat?.age} className="input" placeholder="3 years" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="bio">About</label>
        <textarea id="bio" name="bio" rows={3} maxLength={500} defaultValue={v?.bio ?? cat?.bio} className="input resize-y" placeholder="Loves boxes. Hates Mondays." />
      </div>
      <FormError error={state?.error} />
      <SubmitButton className="btn-primary w-full py-3" pendingText="Checking…">{cat ? "Save changes" : "Add cat"}</SubmitButton>
    </form>
  );
}
