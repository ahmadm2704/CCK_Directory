"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "rounded-lg border border-card-border bg-white px-3 py-2.5 text-sm text-navy-dark outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

export default function SubmitWelfarePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      kit_number: form.get("kit_number"),
      description: form.get("description"),
    };

    try {
      const res = await fetch("/api/welfare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setDone(true);
      setTimeout(() => router.push("/welfare"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-2xl text-gold">
          ✓
        </div>
        <h1 className="font-display text-2xl font-semibold text-navy-dark">Submitted for review</h1>
        <p className="mt-2 text-sm text-muted">
          Thank you! This will appear on the list once an admin approves it. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <p className="font-display text-xs uppercase tracking-[0.3em] text-gold">Charity / Welfare</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-navy-dark sm:text-3xl">
        Add a name to the list
      </h1>
      <p className="mt-2 text-sm text-muted">
        Tell us about a Kohatian (or a group) doing good deeds, charity or welfare work. Entries are
        reviewed by an admin before they go live.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-5 rounded-xl border border-card-border bg-card p-6 shadow-sm sm:p-8"
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          Name
          <input name="name" required maxLength={300} className={inputClass} suppressHydrationWarning />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          Kit number <span className="font-normal text-muted">(optional)</span>
          <input name="kit_number" maxLength={50} className={inputClass} suppressHydrationWarning />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          Good deeds / work done <span className="font-normal text-muted">(optional)</span>
          <textarea
            name="description"
            rows={5}
            maxLength={2000}
            placeholder="What have they done for the welfare of others?"
            className={inputClass}
            suppressHydrationWarning
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-60"
          suppressHydrationWarning
        >
          {submitting ? "Submitting..." : "Submit for review"}
        </button>
      </form>
    </div>
  );
}
