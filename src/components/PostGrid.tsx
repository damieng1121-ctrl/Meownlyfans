import Link from "next/link";
import type { FeedPost } from "@/lib/queries";
import { PostCard } from "./PostCard";

export function PostGrid({
  posts,
  hasMore,
  page,
  baseHref,
  empty,
}: {
  posts: FeedPost[];
  hasMore: boolean;
  page: number;
  baseHref: string;
  empty: React.ReactNode;
}) {
  if (posts.length === 0 && page === 1) {
    return <div className="card p-10 text-center text-ink-soft">{empty}</div>;
  }
  const sep = baseHref.includes("?") ? "&" : "?";
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      <nav className="mt-8 flex justify-center gap-3">
        {page > 1 && (
          <Link href={`${baseHref}${sep}page=${page - 1}`} className="btn-ghost">← Newer</Link>
        )}
        {hasMore && (
          <Link href={`${baseHref}${sep}page=${page + 1}`} className="btn-ghost">More cats →</Link>
        )}
      </nav>
    </>
  );
}
