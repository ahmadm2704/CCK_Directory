import Link from "next/link";
import Image from "next/image";
import { createPublicClient } from "@/lib/supabase/server";
import { CATEGORIES, Listing } from "@/lib/types";

export const revalidate = 0;

function contactLabel(contact_type: Listing["contact_type"]) {
  if (contact_type === "phone") return "Phone";
  if (contact_type === "whatsapp") return "WhatsApp";
  if (contact_type === "phone_whatsapp") return "Phone & WhatsApp";
  return "Email";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;

  const supabase = createPublicClient();
  let query = supabase
    .from("listings")
    .select("id, name, category, description, contact_type, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    query = query.eq("category", category);
  }
  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data: listings, error } = await query;

  return (
    <div>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <Image src="/brand/cck-crest.png" alt="" fill priority className="object-contain object-right" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="font-display text-sm uppercase tracking-[0.35em] text-gold-light">
            Kohatian Association
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            The community directory, done properly.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/70 sm:text-base">
            Find trusted contacts across medicine, law, business and more — shared by fellow
            Kohatians, reviewed before they go live.
          </p>

          <form className="mt-8 flex flex-col gap-3 rounded-xl bg-white/95 p-3 shadow-lg sm:flex-row" action="/" method="get">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by name or description..."
              className="flex-1 rounded-lg border border-transparent bg-transparent px-3 py-2.5 text-sm text-navy-dark outline-none placeholder:text-muted"
              suppressHydrationWarning
            />
            <select
              name="category"
              defaultValue={category}
              className="rounded-lg border border-card-border bg-white px-3 py-2.5 text-sm text-navy-dark outline-none"
              suppressHydrationWarning
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-navy-dark transition hover:bg-gold-light"
              suppressHydrationWarning
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Couldn&apos;t load listings: {error.message}
          </p>
        )}

        {!error && listings && listings.length === 0 && (
          <div className="rounded-xl border border-dashed border-card-border bg-card p-10 text-center">
            <p className="text-sm text-muted">
              No listings found{q || category ? " for this search" : " yet"}.
            </p>
            <Link
              href="/submit"
              className="mt-3 inline-block rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-dark"
            >
              Be the first to add one
            </Link>
          </div>
        )}

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings?.map((listing) => (
            <li key={listing.id}>
              <Link
                href={`/listing/${listing.id}`}
                className="group flex h-full flex-col rounded-xl border border-card-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold text-navy-dark group-hover:text-navy">
                    {listing.name}
                  </h2>
                  <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-navy-dark">
                    {listing.category}
                  </span>
                </div>
                {listing.description && (
                  <p className="line-clamp-3 flex-1 text-sm text-muted">{listing.description}</p>
                )}
                <p className="mt-4 text-xs font-medium text-navy/70">
                  {contactLabel(listing.contact_type)} · tap to reveal
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
