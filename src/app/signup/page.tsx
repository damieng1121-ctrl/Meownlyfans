import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Join" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <div className="card mx-auto max-w-md p-8">
      <h1 className="text-2xl font-extrabold">Join Meownly Fans 🐾</h1>
      <p className="mt-1 text-ink-soft">Free forever. Cats don&apos;t carry wallets.</p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account? <Link href="/login" className="font-semibold text-paw">Log in</Link>
      </p>
    </div>
  );
}
