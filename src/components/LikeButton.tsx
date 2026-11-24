"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import clsx from "clsx";
import { toggleLike } from "@/app/actions";

export function LikeButton({ postId, liked, count }: { postId: string; liked: boolean; count: number }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, setState] = useOptimistic({ liked, count });

  return (
    <button
      type="button"
      aria-pressed={state.liked}
      aria-label={state.liked ? "Unlike" : "Like"}
      onClick={() =>
        startTransition(async () => {
          setState({ liked: !state.liked, count: state.count + (state.liked ? -1 : 1) });
          const res = await toggleLike(postId);
          if ("error" in res) router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
          else router.refresh();
        })
      }
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition",
        state.liked ? "bg-heart/10 text-heart" : "text-ink-soft hover:bg-cream",
      )}
    >
      <Heart size={20} className={clsx("transition", state.liked && "scale-110 fill-heart")} />
      {state.count}
    </button>
  );
}
