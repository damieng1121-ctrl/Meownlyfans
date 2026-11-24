import Link from "next/link";
import clsx from "clsx";
import { getCurrentUser } from "@/lib/auth";
import { feedFilter, getPosts } from "@/lib/queries";
import { PostGrid } from "@/components/PostGrid";

const TABS = [
  { id: "latest", label: "Latest" },
  { id: "top", label: "Top this week" },
  { id: "following", label: "Following" },
] as const;

export default async function FeedPage(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const tab = TABS.find((t) => t.id === sp.tab)?.id ?? "latest";
  const page = Number(sp.page) || 1;
  const user = await getCurrentUser();

  const { posts, hasMore } = await getPosts({ viewerId: user?.id ?? null, ...feedFilter(tab, user?.id ?? null), page });

  return (
    <div>
      {!user && (
        <section className="card mb-8 flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="Meownly Fans" width={180} height={180} className="h-44 w-44 shrink-0" />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold sm:text-4xl">The internet runs on cats. Now they have their own place.</h1>
            <p className="mt-3 text-lg text-ink-soft">
              Make a profile for your cat, post their finest moments, and shower everyone else&apos;s cats with paws and comments.
            </p>
            <div className="mt-5 flex justify-center gap-3 sm:justify-start">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">Join Meownly Fans</Link>
              <Link href="/login" className="btn-ghost px-6 py-3 text-base">Log in</Link>
            </div>
          </div>
        </section>
      )}

      <div className="mb-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id === "latest" ? "/" : `/?tab=${t.id}`}
            className={clsx(
              "btn shrink-0",
              tab === t.id ? "bg-ink text-white" : "border border-line bg-paper hover:bg-cream",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <PostGrid
        posts={posts}
        hasMore={hasMore}
        page={page}
        baseHref={tab === "latest" ? "/" : `/?tab=${tab}`}
        empty={
          tab === "following" ? (
            user ? (
              <>You aren&apos;t following any cats yet. Tap <b>Follow</b> on a cat&apos;s page to see them here.</>
            ) : (
              <><Link href="/login?next=/?tab=following" className="font-semibold text-paw">Log in</Link> to see cats you follow.</>
            )
          ) : tab === "top" ? (
            "No posts this week yet. Be the first!"
          ) : (
            <>No cats yet! <Link href="/new" className="font-semibold text-paw">Post the very first one</Link> 🐾</>
          )
        }
      />
    </div>
  );
}
