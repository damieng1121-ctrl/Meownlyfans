import Link from "next/link";
import { Plus, LogOut, Settings, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const user = await getCurrentUser();
  const openReports = user?.isAdmin
    ? (await db.report.groupBy({ by: ["postId", "commentId"], where: { resolvedAt: null } })).length
    : 0;
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-5xl items-center gap-2 px-4 sm:h-24 sm:gap-3">
        <Link href="/" className="shrink-0 transition hover:-rotate-2 hover:scale-105" aria-label="Meownly Fans home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.webp" alt="Meownly Fans" width={640} height={561} className="logo-mark h-16 w-auto sm:h-20" />
        </Link>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/new" className="btn-primary">
                <Plus size={18} /> <span className="hidden sm:inline">Post a cat</span>
              </Link>
              {user.isAdmin && (
                <Link href="/admin" title="Moderation" className="relative rounded-full p-2 text-ink-soft hover:bg-paper hover:text-ink">
                  <ShieldCheck size={22} />
                  {openReports > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-heart px-1 text-center text-xs font-bold leading-5 text-white">
                      {openReports}
                    </span>
                  )}
                </Link>
              )}
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
