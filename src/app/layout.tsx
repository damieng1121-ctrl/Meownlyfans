import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: { default: "Meownly Fans", template: "%s · Meownly Fans" },
  description: "The cat appreciation network. Share your cats, love everyone else's.",
  icons: { icon: "/logo.webp" },
};

export const viewport: Viewport = { themeColor: "#fdfbf5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <Header />
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6">{children}</main>
        <footer className="pb-10 text-center text-sm text-ink-soft">
          Made with 🐾 for cats everywhere
        </footer>
      </body>
    </html>
  );
}
