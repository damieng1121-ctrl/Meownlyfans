import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

export const PAGE_SIZE = 12;

/** Everything a PostCard needs. `viewerId` decides whether the viewer has liked it. */
export function postInclude(viewerId: string | null) {
  return {
    author: { select: { username: true, displayName: true, avatarUrl: true } },
    cat: { select: { id: true, name: true, avatarUrl: true } },
    images: { orderBy: { position: "asc" } },
    _count: { select: { likes: true, comments: true } },
    likes: { where: { userId: viewerId ?? "" }, select: { userId: true } },
  } satisfies Prisma.PostInclude;
}

export type FeedPost = Prisma.PostGetPayload<{ include: ReturnType<typeof postInclude> }>;

export async function getPosts(opts: {
  viewerId: string | null;
  where?: Prisma.PostWhereInput;
  orderBy?: Prisma.PostOrderByWithRelationInput[];
  page?: number;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const rows = await db.post.findMany({
    where: opts.where,
    orderBy: opts.orderBy ?? [{ createdAt: "desc" }],
    include: postInclude(opts.viewerId),
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE + 1,
  });
  return { posts: rows.slice(0, PAGE_SIZE), hasMore: rows.length > PAGE_SIZE, page };
}

export type FeedTab = "latest" | "top" | "following";

export function feedFilter(tab: FeedTab, viewerId: string | null) {
  if (tab === "top") {
    return {
      where: { createdAt: { gte: new Date(Date.now() - 7 * 864e5) } },
      orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
    } satisfies { where: Prisma.PostWhereInput; orderBy: Prisma.PostOrderByWithRelationInput[] };
  }
  if (tab === "following") {
    return { where: { cat: { followers: { some: { userId: viewerId ?? "" } } } } };
  }
  return {};
}
