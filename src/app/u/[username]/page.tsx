import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getPosts } from "@/lib/queries";
import { Avatar } from "@/components/Avatar";
import { PostGrid } from "@/components/PostGrid";

export async function generateMetadata(props: PageProps<"/u/[username]">): Promise<Metadata> {
  const u = await db.user.findUnique({ where: { username: (await props.params).username } });
  return u ? { title: `${u.displayName} (@${u.username})` } : {};
}

export default async function UserPage(props: PageProps<"/u/[username]">) {
  const { username } = await props.params;
  const page = Number((await props.searchParams).page) || 1;
  const viewer = await getCurrentUser();
  const user = await db.user.findUnique({
    where: { username },
    include: {
      cats: { orderBy: { createdAt: "asc" }, include: { _count: { select: { followers: true } } } },
      _count: { select: { posts: true } },
    },
  });
  if (!user) notFound();
  const isMe = viewer?.id === user.id;
  const { posts, hasMore } = await getPosts({ viewerId: viewer?.id ?? null, where: { authorId: user.id }, page });

  return (
    <div className="space-y-8">
      <section className="card flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:text-left">
        <Avatar src={user.avatarUrl} name={user.displayName} size={96} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold">{user.displayName}</h1>
          <p className="text-ink-soft">@{user.username} · {user._count.posts} posts</p>
          {user.bio && <p className="mt-2 whitespace-pre-wrap">{user.bio}</p>}
        </div>
        {isMe && <Link href="/settings" className="btn-ghost">Edit profile</Link>}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">{isMe ? "Your cats" : `${user.displayName}'s cats`}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {user.cats.map((c) => (
            <Link key={c.id} href={`/c/${c.id}`} className="card flex w-32 shrink-0 flex-col items-center gap-2 p-4 text-center hover:border-paw">
              <Avatar src={c.avatarUrl} name={c.name} size={72} cat />
              <span className="w-full truncate font-bold">{c.name}</span>
              <span className="text-xs text-ink-soft">{c._count.followers} fans</span>
            </Link>
          ))}
          {isMe && (
            <Link href="/cats/new" className="flex w-32 shrink-0 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line p-4 text-sm font-semibold text-ink-soft hover:border-paw hover:text-paw">
              <Plus size={28} /> Add a cat
            </Link>
          )}
          {!isMe && user.cats.length === 0 && <p className="text-ink-soft">No cat profiles yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Posts</h2>
        <PostGrid
          posts={posts}
          hasMore={hasMore}
          page={page}
          baseHref={`/u/${user.username}`}
          empty={isMe ? <>Nothing yet. <Link href="/new" className="font-semibold text-paw">Post your first cat</Link></> : "No posts yet."}
        />
      </section>
    </div>
  );
}
