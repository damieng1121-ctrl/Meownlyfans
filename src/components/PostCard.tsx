import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { FeedPost } from "@/lib/queries";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { ImageCarousel } from "./ImageCarousel";
import { LikeButton } from "./LikeButton";
import { ReportButton } from "./ReportButton";

export function PostCard({
  post,
  viewerId,
  full = false,
}: {
  post: FeedPost;
  viewerId: string | null;
  full?: boolean;
}) {
  const who = post.cat?.name ?? post.author.displayName;
  return (
    <article className="card overflow-hidden">
      {post.hidden && (
        <p className="bg-heart/10 px-4 py-2 text-sm font-semibold text-heart">
          Hidden from everyone else while it&apos;s reviewed
        </p>
      )}
      <div className="flex items-center gap-3 p-3">
        {post.cat ? (
          <Link href={`/c/${post.cat.id}`}>
            <Avatar src={post.cat.avatarUrl} name={post.cat.name} cat />
          </Link>
        ) : (
          <Link href={`/u/${post.author.username}`}>
            <Avatar src={post.author.avatarUrl} name={post.author.displayName} />
          </Link>
        )}
        <div className="min-w-0 flex-1 leading-tight">
          {post.cat ? (
            <Link href={`/c/${post.cat.id}`} className="font-bold hover:underline">{post.cat.name}</Link>
          ) : (
            <Link href={`/u/${post.author.username}`} className="font-bold hover:underline">{post.author.displayName}</Link>
          )}
          <div className="truncate text-xs text-ink-soft">
            {post.cat && (
              <>
                with{" "}
                <Link href={`/u/${post.author.username}`} className="hover:underline">@{post.author.username}</Link>
                {" · "}
              </>
            )}
            <Link href={`/p/${post.id}`} className="hover:underline">
              <time dateTime={post.createdAt.toISOString()}>{timeAgo(post.createdAt)}</time>
            </Link>
          </div>
        </div>
        {viewerId !== post.authorId && <ReportButton target={{ postId: post.id }} />}
      </div>

      {full ? (
        <ImageCarousel images={post.images} alt={`Photo of ${who}`} />
      ) : (
        <Link href={`/p/${post.id}`} className="block">
          <ImageCarousel images={post.images} alt={`Photo of ${who}`} />
        </Link>
      )}

      <div className="space-y-2 p-3">
        <div className="flex items-center gap-1">
          <LikeButton postId={post.id} liked={post.likes.length > 0} count={post._count.likes} />
          <Link
            href={`/p/${post.id}#comments`}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-ink-soft hover:bg-cream"
          >
            <MessageCircle size={20} /> {post._count.comments}
          </Link>
        </div>
        {post.caption && (
          <p className={full ? "whitespace-pre-wrap" : "line-clamp-3 whitespace-pre-wrap"}>{post.caption}</p>
        )}
      </div>
    </article>
  );
}
