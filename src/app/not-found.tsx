import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Logo } from "@/components/site/Logo";
import { Arrow } from "@/components/ui/Arrow";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <Header logo={<Logo priority />} />
      <main data-header-theme="dark" className="theme-dark flex min-h-svh flex-col">
        <div className="shell flex flex-1 flex-col justify-end pb-16 pt-32">
          <p className="label">404</p>
          <h1 className="display mt-8">
            Nothing
            <br />
            here<span className="accent-text">.</span>
          </h1>
          <p className="lead mt-10 max-w-[26ch] text-fg-soft">
            The page you were looking for doesn’t exist, or has moved.
          </p>
          <Link href="/" className="btn btn-primary mt-10 self-start">
            Back to Nulle
            <Arrow />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
