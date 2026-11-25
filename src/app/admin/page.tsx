import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { aiModerationEnabled } from "@/lib/moderation";
import { timeAgo } from "@/lib/utils";
import { adminBanUser, adminRemoveComment, adminRemovePost, adminRestore, adminUnbanUser } from "@/app/actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export const metadata = { title: "Moderation" };

type Group = {
  key: string;
  target: { postId?: string; commentId?: string };
  reasons: Map<string, number>;
  latest: Date;
  hidden: boolean;
  author: { id: string; username: string; displayName: string; bannedAt: Date | null };
  postId: string;
  text: string;
  image?: string;
};

export default async function AdminPage() {
  const me = await requireUser("/admin");
  if (!me.isAdmin) notFound();

  const reports = await db.report.findMany({
    where: { resolvedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          author: { select: { id: true, username: true, displayName: true, bannedAt: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
      comment: { include: { author: { select: { id: true, username: true, displayName: true, bannedAt: true } } } },
    },
  });

  const groups = new Map<string, Group>();
  for (const r of reports) {
    const item = r.post ?? r.comment;
    if (!item) continue;
    const key = r.post ? `p:${r.post.id}` : `c:${r.comment!.id}`;
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        target: r.post ? { postId: r.post.id } : { commentId: r.comment!.id },
        reasons: new Map(),
        latest: r.createdAt,
        hidden: item.hidden,
        author: item.author,
        postId: r.post ? r.post.id : r.comment!.postId,
        text: r.post ? r.post.caption : r.comment!.body,
        image: r.post?.images[0]?.url,
      };
      groups.set(key, g);
    }
    g.reasons.set(r.reason, (g.reasons.get(r.reason) ?? 0) + 1);
  }

  const banned = await db.user.findMany({
    where: { bannedAt: { not: null } },
    select: { id: true, username: true, displayName: true, bannedAt: true },
    orderBy: { bannedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <ShieldCheck className="text-paw" /> Moderation
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Photo &amp; text checks:{" "}
          {aiModerationEnabled ? (
            <b className="text-ink">on</b>
          ) : (
            <b className="text-heart">word filter only. Add ANTHROPIC_API_KEY to turn on photo checks.</b>
          )}{" "}
          · Posts and comments hide automatically after 3 reports.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Reports to review ({groups.size})</h2>
        {groups.size === 0 && <div className="card p-8 text-center text-ink-soft">All clear! Nothing to review. 😺</div>}
        {[...groups.values()].map((g) => (
          <article key={g.key} className="card flex gap-4 p-4">
            {g.image && (
              <Link href={`/p/${g.postId}`} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.image} alt="" className="h-24 w-24 rounded-2xl object-cover" />
              </Link>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-cream px-2 py-0.5 font-semibold">{g.target.postId ? "Post" : "Comment"}</span>
                {g.hidden && <span className="rounded-full bg-heart/10 px-2 py-0.5 font-semibold text-heart">Hidden</span>}
                <span className="text-ink-soft">
                  by <Link href={`/u/${g.author.username}`} className="font-semibold text-paw">@{g.author.username}</Link>
                  {g.author.bannedAt && " (suspended)"} · {timeAgo(g.latest)}
                </span>
              </div>
              {g.text && <p className="line-clamp-3 whitespace-pre-wrap break-words">{g.text}</p>}
              <p className="text-sm text-ink-soft">
                {[...g.reasons].map(([reason, n]) => `${reason} ×${n}`).join(" · ")}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href={`/p/${g.postId}`} className="btn-ghost">View</Link>
                <ConfirmButton action={adminRestore.bind(null, g.target)} message="Dismiss the reports and make this visible?" className="btn-ghost">
                  Looks fine
                </ConfirmButton>
                <ConfirmButton
                  action={(g.target.postId ? adminRemovePost : adminRemoveComment).bind(null, (g.target.postId ?? g.target.commentId)!)}
                  message="Delete this for good?"
                  className="btn-ghost text-heart"
                >
                  Remove
                </ConfirmButton>
                {!g.author.bannedAt && g.author.id !== me.id && (
                  <ConfirmButton
                    action={adminBanUser.bind(null, g.author.id)}
                    message={`Suspend @${g.author.username}? They'll be logged out and everything they've posted will be hidden.`}
                    className="btn-ghost text-heart"
                  >
                    Suspend user
                  </ConfirmButton>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {banned.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Suspended accounts</h2>
          {banned.map((u) => (
            <div key={u.id} className="card flex items-center justify-between gap-3 p-4">
              <span>
                <Link href={`/u/${u.username}`} className="font-semibold text-paw">@{u.username}</Link>
                <span className="text-sm text-ink-soft"> · {timeAgo(u.bannedAt!)}</span>
              </span>
              <ConfirmButton action={adminUnbanUser.bind(null, u.id)} message={`Lift @${u.username}'s suspension? Their old posts stay hidden.`} className="btn-ghost">
                Unsuspend
              </ConfirmButton>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
