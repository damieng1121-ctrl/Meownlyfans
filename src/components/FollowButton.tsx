"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "@/app/actions";

export function FollowButton({ catId, following, count }: { catId: string; following: boolean; count: number }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, setState] = useOptimistic({ following, count });
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            setState({ following: !state.following, count: state.count + (state.following ? -1 : 1) });
            const res = await toggleFollow(catId);
            if ("error" in res) router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
            else router.refresh();
          })
        }
        className={state.following ? "btn-ghost" : "btn-primary"}
      >
        {state.following ? "Following" : "Follow"}
      </button>
      <span className="text-sm text-ink-soft">
        <b className="text-ink">{state.count}</b> {state.count === 1 ? "fan" : "fans"}
      </span>
    </div>
  );
}
