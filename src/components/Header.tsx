import Link from "next/link";
import { Plus, LogOut, Settings } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions";
import { Avatar } from "./Avatar";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Meownly Fans home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="" width={44} height={44} className="h-11 w-11 rounded-full bg-white object-cover object-top" />
          <span className="text-xl font-extrabold tracking-tight">
            Meownly <span className="text-paw">Fans</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link href="/new" className="btn-primary">
                <Plus size={18} /> <span className="hidden sm:inline">Post a cat</span>
              </Link>
              <Link href={`/u/${user.username}`} title="Your profile" className="rounded-full">
                <Avatar src={user.avatarUrl} name={user.displayName} size={36} />
              </Link>
              <Link href="/settings" className="hidden rounded-full p-2 text-ink-soft hover:bg-paper sm:block" title="Settings">
                <Settings size={20} />
              </Link>
              <form action={logout}>
                <button className="rounded-full p-2 text-ink-soft hover:bg-paper" title="Log out">
                  <LogOut size={20} />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Log in</Link>
              <Link href="/signup" className="btn-primary">Join</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
