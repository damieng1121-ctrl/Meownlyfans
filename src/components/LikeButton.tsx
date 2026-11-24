"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import clsx from "clsx";
import { toggleLike } from "@/app/actions";

export function LikeButton({ postId, liked, count }: { postId: string; liked: boolean; count: number }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, setState] = useOptimistic({ liked, count });
  const [burst, setBurst] = useState(0);

  return (
    <button
      type="button"
      aria-pressed={state.liked}
      aria-label={state.liked ? "Unlike" : "Like"}
      onClick={() =>
        startTransition(async () => {
          if (!state.liked) setBurst((b) => b + 1);
          setState({ liked: !state.liked, count: state.count + (state.liked ? -1 : 1) });
          const res = await toggleLike(postId);
          if ("error" in res) router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
          else router.refresh();
        })
      }
      className={clsx(
        "relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition",
        state.liked ? "bg-heart/10 text-heart" : "text-ink-soft hover:bg-cream",
      )}
    >
      <Heart size={20} key={`h${burst}`} className={clsx("transition", state.liked && "heart-pop scale-110 fill-heart")} />
      {burst > 0 &&
        state.liked &&
        [-14, 0, 14].map((dx, i) => (
          <span
            key={`${burst}-${i}`}
            aria-hidden
            className="paw-burst text-xs"
            style={{ "--dx": `${dx}px`, "--r": `${dx * 1.5}deg`, animationDelay: `${i * 70}ms` } as React.CSSProperties}
          >
            🐾
          </span>
        ))}
      {state.count}
    </button>
  );
}
