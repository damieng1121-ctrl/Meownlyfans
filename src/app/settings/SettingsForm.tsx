"use client";

import { useActionState, useState } from "react";
import { Camera } from "lucide-react";
import { updateProfile } from "@/app/actions";
import { shrinkInputFile } from "@/lib/shrinkImage";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { Avatar } from "@/components/Avatar";

export function SettingsForm({ user }: { user: { displayName: string; bio: string; avatarUrl: string | null } }) {
  const [state, action] = useActionState(updateProfile, undefined);
  const [preview, setPreview] = useState(user.avatarUrl);
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="flex cursor-pointer items-center gap-4">
        <span className="relative">
          <Avatar src={preview} name={user.displayName} size={80} />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-paw p-1.5 text-white shadow"><Camera size={16} /></span>
        </span>
        <span className="text-sm font-semibold text-paw">Change photo</span>
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
        <label className="label" htmlFor="displayName">Name</label>
        <input id="displayName" name="displayName" required maxLength={50} defaultValue={state?.values?.displayName ?? user.displayName} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="bio">About you</label>
        <textarea id="bio" name="bio" rows={3} maxLength={300} defaultValue={state?.values?.bio ?? user.bio} className="input resize-y" placeholder="Cat parent of 3. Professional lap." />
      </div>
      <FormError error={state?.error} />
      <SubmitButton className="btn-primary w-full py-3" pendingText="Checking…">Save</SubmitButton>
    </form>
  );
}
