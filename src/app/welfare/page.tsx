import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";

export const revalidate = 0;

export const metadata = {
  title: "Charity / Welfare | CCK Directory",
  description: "Good deeds, charity and welfare projects by Kohatians for the common man.",
};

export default async function WelfarePage() {
  const supabase = createPublicClient();
  const { data: entries, error } = await supabase
    .from("welfare_entries")
    .select("id, name, kit_number, description, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  return (
    <div>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="font-display text-sm uppercase tracking-[0.35em] text-gold-light">
            Charity / Welfare
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Good deeds by Kohatians
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
            Good deeds, charity and projects for the welfare of the common man by the Kohatians.
            Know someone who belongs on this list? Please add them.
          </p>
          <Link
            href="/welfare/submit"
            className="mt-6 inline-block rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy-dark transition hover:bg-gold-light"
          >
            Add a name
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Couldn&apos;t load the list: {error.message}
          </p>
        )}

        {!error && entries && entries.length === 0 && (
          <div className="rounded-xl border border-dashed border-card-border bg-card p-10 text-center">
            <p className="text-sm text-muted">Nothing here yet.</p>
          </div>
        )}

        <ol className="flex flex-col gap-4">
          {entries?.map((entry, i) => (
            <li
              key={entry.id}
              className="flex gap-4 rounded-xl border border-card-border bg-card p-5 shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-sm font-semibold text-navy-dark">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-semibold text-navy-dark">{entry.name}</h2>
                {entry.kit_number && (
                  <p className="mt-0.5 text-xs text-muted">Kit no. {entry.kit_number}</p>
                )}
                {entry.description && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                    {entry.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
