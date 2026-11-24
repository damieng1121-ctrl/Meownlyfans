import { formatDistanceToNowStrict } from "date-fns";

export function timeAgo(d: Date) {
  return formatDistanceToNowStrict(d, { addSuffix: true });
}

export function safeNext(next: unknown, fallback = "/") {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export type FormState = { error?: string; ok?: boolean; values?: Record<string, string> } | undefined;

/** Error result that echoes text fields back, since React resets the form after an action. */
export function fail(fd: FormData, error: string): FormState {
  const values: Record<string, string> = {};
  for (const [k, v] of fd) if (typeof v === "string" && k !== "password" && !k.startsWith("$")) values[k] = v;
  return { error, values };
}
