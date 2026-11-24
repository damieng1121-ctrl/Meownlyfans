import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getPosts } from "@/lib/queries";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "@/components/FollowButton";
import { PostGrid } from "@/components/PostGrid";

export async function generateMetadata(props: PageProps<"/c/[id]">): Promise<Metadata> {
  const cat = await db.cat.findUnique({ where: { id: (await props.params).id } });
  return cat ? { title: cat.name, description: cat.bio || undefined } : {};
}

export default async function CatPage(props: PageProps<"/c/[id]">) {
  const { id } = await props.params;
  const page = Number((await props.searchParams).page) || 1;
  const user = await getCurrentUser();
  const cat = await db.cat.findUnique({
    where: { id },
    include: {
      owner: { select: { username: true, displayName: true } },
      _count: { select: { followers: true, posts: true } },
      followers: { where: { userId: user?.id ?? "" }, select: { userId: true } },
    },
  });
  if (!cat) notFound();
  const isOwner = user?.id === cat.ownerId;
  const { posts, hasMore } = await getPosts({ viewerId: user?.id ?? null, where: { catId: id }, page });

  return (
    <div>
      <section className="card mb-8 flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:items-start sm:text-left">
        <Avatar src={cat.avatarUrl} name={cat.name} size={128} cat />
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="text-3xl font-extrabold">{cat.name}</h1>
          <p className="text-sm text-ink-soft">
            {[cat.breed, cat.age].filter(Boolean).join(" · ")}
            {(cat.breed || cat.age) && " · "}
            Human: <Link href={`/u/${cat.owner.username}`} className="font-semibold text-paw">@{cat.owner.username}</Link>
          </p>
          {cat.bio && <p className="whitespace-pre-wrap">{cat.bio}</p>}
          <p className="text-sm text-ink-soft"><b className="text-ink">{cat._count.posts}</b> posts</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 sm:justify-start">
            {isOwner ? (
              <>
                <Link href={`/new?cat=${cat.id}`} className="btn-primary"><Plus size={16} /> Post {cat.name}</Link>
                <Link href={`/c/${cat.id}/edit`} className="btn-ghost"><Pencil size={16} /> Edit</Link>
                <span className="text-sm text-ink-soft"><b className="text-ink">{cat._count.followers}</b> fans</span>
              </>
            ) : (
              <FollowButton catId={cat.id} following={cat.followers.length > 0} count={cat._count.followers} />
            )}
          </div>
        </div>
      </section>
      <PostGrid
        posts={posts}
        hasMore={hasMore}
        page={page}
        baseHref={`/c/${cat.id}`}
        empty={`${cat.name} hasn't posted yet.`}
      />
    </div>
  );
}
