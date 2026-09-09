import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import RevealContact from "./RevealContact";

export const revalidate = 0;

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, name, category, description, created_at")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/" className="text-sm font-medium text-navy/70 hover:text-navy hover:underline">
        ← Back to directory
      </Link>

      <div className="mt-6 rounded-xl border border-card-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-display text-2xl font-semibold text-navy-dark sm:text-3xl">
            {listing.name}
          </h1>
          <span className="shrink-0 rounded-full bg-gold/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-navy-dark">
            {listing.category}
          </span>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
          {listing.description}
        </p>

        <div className="mt-8 border-t border-card-border pt-6">
          <RevealContact id={listing.id} />
        </div>
      </div>
    </div>
  );
}
