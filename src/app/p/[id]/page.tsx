import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { postInclude } from "@/lib/queries";
import { timeAgo } from "@/lib/utils";
import { adminRemovePost, adminRestore, deleteComment, deletePost } from "@/app/actions";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ReportButton } from "@/components/ReportButton";
import { CommentForm } from "./CommentForm";

export async function generateMetadata(props: PageProps<"/p/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const post = await db.post.findUnique({ where: { id }, include: { cat: true, images: { take: 1, orderBy: { position: "asc" } } } });
  if (!post || post.hidden) return {};
  return {
    title: post.cat ? `${post.cat.name}'s post` : "Cat post",
    description: post.caption.slice(0, 160) || undefined,
    openGraph: { images: post.images[0] ? [post.images[0].url] : undefined },
  };
}

export default async function PostPage(props: PageProps<"/p/[id]">) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  const post = await db.post.findUnique({ where: { id }, include: postInclude(user?.id ?? null) });
  const isAuthor = user?.id === post?.authorId;
  const isAdmin = !!user?.isAdmin;
  if (!post || (post.hidden && !isAuthor && !isAdmin)) notFound();

  // Hidden comments are shown only to the person who wrote them and to admins.
  const visible = isAdmin ? {} : { OR: [{ hidden: false }, { authorId: user?.id ?? "" }] };
  const comments = await db.comment.findMany({
    where: { postId: id, parentId: null, ...visible },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      replies: {
        where: visible,
        orderBy: { createdAt: "asc" },
        include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
      },
    },
  });

  type C = (typeof comments)[number] | (typeof comments)[number]["replies"][number];
  const renderComment = (c: C, topId: string) => (
    <div key={c.id} className="flex gap-3">
      <Link href={`/u/${c.author.username}`}>
        <Avatar src={c.author.avatarUrl} name={c.author.displayName} size={34} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className={c.hidden ? "rounded-2xl bg-heart/10 px-3.5 py-2" : "rounded-2xl bg-cream px-3.5 py-2"}>
          {c.hidden && <p className="text-xs font-semibold text-heart">Hidden while it&apos;s reviewed</p>}
          <Link href={`/u/${c.author.username}`} className="text-sm font-bold hover:underline">
            {c.author.displayName}
          </Link>
          <p className="whitespace-pre-wrap break-words">{c.body}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 px-2 text-xs text-ink-soft">
          <span>{timeAgo(c.createdAt)}</span>
          {user && (
            <details className="open:order-last open:basis-full">
              <summary className="cursor-pointer list-none font-semibold hover:text-paw">Reply</summary>
              <div className="mt-2">
                <CommentForm postId={post.id} parentId={topId} placeholder={`Reply to ${c.author.displayName}…`} />
              </div>
            </details>
          )}
          {user && user.username !== c.author.username && !c.hidden && (
            <ReportButton target={{ commentId: c.id }} compact />
          )}
          {(user?.username === c.author.username || isAuthor || isAdmin) && (
            <ConfirmButton action={deleteComment.bind(null, c.id)} message="Delete this comment?" className="font-semibold hover:text-heart">
              Delete
            </ConfirmButton>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PostCard post={post} viewerId={user?.id ?? null} full />

      {isAdmin && post.hidden && (
        <div className="card flex flex-wrap items-center gap-3 p-4">
          <span className="font-semibold">Admin:</span>
          <ConfirmButton action={adminRestore.bind(null, { postId: post.id })} message="Make this post visible again?" className="btn-ghost">
            Restore post
          </ConfirmButton>
          <ConfirmButton action={adminRemovePost.bind(null, post.id)} message="Delete this post for good?" className="btn-ghost text-heart">
            Remove post
          </ConfirmButton>
        </div>
      )}

      {isAuthor && (
        <div className="flex justify-end">
          <ConfirmButton action={deletePost.bind(null, post.id)} message="Delete this post for good?" className="btn-ghost text-heart">
            Delete post
          </ConfirmButton>
        </div>
      )}

      <section id="comments" className="card space-y-4 p-5">
        <h2 className="text-lg font-bold">Comments ({post._count.comments})</h2>
        {comments.length === 0 && <p className="text-ink-soft">No comments yet. Say something nice!</p>}
        {comments.map((c) => (
          <div key={c.id} className="space-y-3">
            {renderComment(c, c.id)}
            {c.replies.length > 0 && <div className="ml-11 space-y-3">{c.replies.map((r) => renderComment(r, c.id))}</div>}
          </div>
        ))}
        {user ? (
          <CommentForm postId={post.id} placeholder="Add a comment…" />
        ) : (
          <p className="text-sm text-ink-soft">
            <Link href={`/login?next=/p/${post.id}`} className="font-semibold text-paw">Log in</Link> to comment.
          </p>
        )}
      </section>
    </div>
  );
}
