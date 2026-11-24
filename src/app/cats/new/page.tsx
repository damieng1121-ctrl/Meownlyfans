import { requireUser } from "@/lib/auth";
import { CatForm } from "@/components/CatForm";

export const metadata = { title: "Add a cat" };

export default async function NewCatPage(props: PageProps<"/cats/new">) {
  await requireUser("/cats/new");
  const { welcome } = await props.searchParams;
  return (
    <div className="card mx-auto max-w-xl p-6 sm:p-8">
      {welcome && <p className="mb-4 rounded-2xl bg-paw/10 px-4 py-3 font-semibold">Welcome to Meownly Fans! 🎉 Let&apos;s meet your cat.</p>}
      <h1 className="text-2xl font-extrabold">Add a cat 🐱</h1>
      <p className="mt-1 text-ink-soft">Each cat gets their own profile that fans can follow.</p>
      <CatForm />
    </div>
  );
}
