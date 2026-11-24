import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/utils";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const next = safeNext((await props.searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return (
    <div className="card mx-auto max-w-md p-8">
      <h1 className="text-2xl font-extrabold">Welcome back 😺</h1>
      <p className="mt-1 text-ink-soft">The cats missed you.</p>
      <LoginForm next={next} />
      <p className="mt-6 text-center text-sm text-ink-soft">
        New here? <Link href="/signup" className="font-semibold text-paw">Create an account</Link>
      </p>
    </div>
  );
}
