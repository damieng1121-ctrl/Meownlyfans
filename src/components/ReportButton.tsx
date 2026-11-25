"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import clsx from "clsx";
import { reportContent } from "@/app/actions";
import { REPORT_REASONS } from "@/lib/reports";

export function ReportButton({
  target,
  className,
  compact = false,
}: {
  target: { postId?: string; commentId?: string };
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (done) return <span className={clsx("text-xs font-semibold text-ink-soft", className)}>Reported. Thanks! 🐾</span>;

  return (
    <div ref={ref} className={clsx("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Report"
        onClick={() => setOpen(!open)}
        className={clsx(
          "inline-flex items-center gap-1 rounded-full text-ink-soft hover:text-heart",
          compact ? "text-xs font-semibold" : "p-2 hover:bg-cream",
        )}
      >
        {compact ? "Report" : <Flag size={18} aria-label="Report" />}
      </button>
      {open && (
        <div role="menu" className="card absolute right-0 z-30 mt-1 w-56 p-1.5 text-sm shadow-lg">
          <p className="px-3 py-1.5 text-xs font-semibold text-ink-soft">What&apos;s wrong with it?</p>
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              role="menuitem"
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await reportContent(target, r);
                  if ("error" in res && res.error === "signin") {
                    router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
                    return;
                  }
                  setOpen(false);
                  setDone(true);
                  router.refresh();
                })
              }
              className="block w-full rounded-xl px-3 py-2 text-left text-ink hover:bg-cream"
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
