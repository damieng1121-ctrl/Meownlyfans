import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { NewPostForm } from "./NewPostForm";

export const metadata = { title: "Post a cat" };

export default async function NewPostPage(props: PageProps<"/new">) {
  const user = await requireUser("/new");
  const cats = await db.cat.findMany({
    where: { ownerId: user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
  const sp = await props.searchParams;
  const preselect = typeof sp.cat === "string" && cats.some((c) => c.id === sp.cat) ? sp.cat : cats[0]?.id ?? "";

  return (
    <div className="card mx-auto max-w-xl p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold">Post a cat 📸</h1>
      {cats.length === 0 && (
        <p className="mt-2 rounded-2xl bg-paw/10 px-4 py-3 text-sm">
          Tip: <Link href="/cats/new" className="font-semibold text-paw">add your cat&apos;s profile</Link> first so
          fans can follow them.
        </p>
      )}
      <NewPostForm cats={cats} defaultCatId={preselect} />
    </div>
  );
}
