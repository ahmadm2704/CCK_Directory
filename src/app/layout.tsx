import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "CCK Directory",
  description: "The official classifieds and contact directory for the Cadet College Kohat community.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="bg-navy text-white shadow-[0_2px_12px_rgba(11,31,58,0.25)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/brand/cck-crest.png"
                alt="Cadet College Kohat crest"
                width={44}
                height={44}
                className="h-11 w-11"
                priority
              />
              <span>
                <span className="block font-display text-lg font-semibold leading-tight tracking-wide text-gold-light">
                  CCK Directory
                </span>
                <span className="block text-[11px] uppercase tracking-[0.2em] text-white/60">
                  Cadet College Kohat
                </span>
              </span>
            </Link>
            <nav className="flex items-center gap-2 text-sm sm:gap-4">
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                Browse
              </Link>
              <Link
                href="/submit"
                className="rounded-md bg-gold px-4 py-1.5 font-medium text-navy-dark shadow-sm transition hover:bg-gold-light"
              >
                Add a listing
              </Link>
            </nav>
          </div>
          <div className="gold-divider" />
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-card-border bg-navy text-white/70">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-8 text-center sm:px-6">
            <Image
              src="/brand/cck-crest.png"
              alt="Cadet College Kohat crest"
              width={32}
              height={32}
              className="mb-2 h-8 w-8 opacity-90"
            />
            <p className="font-display text-sm tracking-wide text-gold-light">
              &ldquo;From Darkness Unto Light&rdquo;
            </p>
            <p className="text-xs text-white/50">
              CCK Directory — a community classifieds &amp; contact directory for Kohatians.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
