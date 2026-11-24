"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

export function ThemeToggle() {
  // Server render shows the light icon; the real theme is applied before paint by the script in layout.tsx.
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = theme === "dark" ? "Lights on (light mode)" : "Night prowl (dark mode)";

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("theme", next);
        } catch {}
        listeners.forEach((l) => l());
      }}
      className="group rounded-full p-2 text-ink-soft transition hover:bg-paper hover:text-ink"
    >
      <span className="block transition-transform duration-500 group-active:rotate-[360deg]">
        {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
      </span>
    </button>
  );
}
