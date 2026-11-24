import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deleteCat } from "@/app/actions";
import { CatForm } from "@/components/CatForm";
import { ConfirmButton } from "@/components/ConfirmButton";

export const metadata = { title: "Edit cat" };

export default async function EditCatPage(props: PageProps<"/c/[id]/edit">) {
  const { id } = await props.params;
  const user = await requireUser(`/c/${id}/edit`);
  const cat = await db.cat.findFirst({ where: { id, ownerId: user.id } });
  if (!cat) notFound();
  return (
    <div className="card mx-auto max-w-xl p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold">Edit {cat.name}</h1>
      <CatForm cat={cat} />
      <div className="mt-8 border-t border-line pt-6">
        <ConfirmButton
          action={deleteCat.bind(null, cat.id)}
          message={`Remove ${cat.name}'s profile? Their posts stay up but won't be linked to them.`}
          className="btn-ghost text-heart"
        >
          Remove {cat.name}&apos;s profile
        </ConfirmButton>
      </div>
    </div>
  );
}
