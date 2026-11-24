import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { CatPun } from "@/components/CatPun";

export const metadata: Metadata = {
  title: { default: "Meownly Fans", template: "%s · Meownly Fans" },
  description: "The cat appreciation network. Share your cats, love everyone else's.",
  icons: { icon: "/logo-mark.webp" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfbf5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1c24" },
  ],
};

// Runs before first paint so there's no flash of the wrong theme.
// Uses the saved choice, otherwise follows the device setting.
const themeScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <Header />
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6">{children}</main>
        <footer className="pb-10 text-center text-sm text-ink-soft">
          <CatPun />
        </footer>
      </body>
    </html>
  );
}
