import { requireUser } from "@/lib/auth";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  return (
    <div className="card mx-auto max-w-xl p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold">Your profile</h1>
      <SettingsForm user={user} />
    </div>
  );
}
