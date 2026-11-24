"use client";

import { useActionState } from "react";
import { addComment } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";

export function CommentForm({ postId, parentId, placeholder }: { postId: string; parentId?: string; placeholder: string }) {
  const [state, action] = useActionState(addComment, undefined);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="postId" value={postId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <div className="flex gap-2">
        <textarea
          name="body"
          required
          rows={1}
          maxLength={1000}
          placeholder={placeholder}
          defaultValue={state?.values?.body}
          className="input min-h-11 resize-y text-ink"
        />
        <SubmitButton pendingText="…">Post</SubmitButton>
      </div>
      <FormError error={state?.error} />
    </form>
  );
}
