"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/types";

const inputClass =
  "rounded-lg border border-card-border bg-white px-3 py-2.5 text-sm text-navy-dark outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

export default function SubmitPage() {
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
      category: form.get("category"),
      description: form.get("description"),
      contact_type: form.get("contact_type"),
      contact_value: form.get("contact_value"),
    };

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setDone(true);
      setTimeout(() => router.push("/"), 2500);
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
          Your listing will appear in the directory once an admin approves it. Redirecting you home...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <p className="font-display text-xs uppercase tracking-[0.3em] text-gold">New listing</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-navy-dark sm:text-3xl">
        Add to the directory
      </h1>
      <p className="mt-2 text-sm text-muted">
        Submitted listings are reviewed by an admin before they go live.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-5 rounded-xl border border-card-border bg-card p-6 shadow-sm sm:p-8"
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          Name / business
          <input name="name" required maxLength={120} className={inputClass} suppressHydrationWarning />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          Category
          <select name="category" required defaultValue="" className={inputClass} suppressHydrationWarning>
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          Description
          <textarea
            name="description"
            required
            rows={4}
            maxLength={2000}
            className={inputClass}
            suppressHydrationWarning
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
            Contact method
            <select name="contact_type" required defaultValue="phone" className={inputClass} suppressHydrationWarning>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
            Contact details
            <input
              name="contact_value"
              required
              maxLength={200}
              placeholder="Number or email"
              className={inputClass}
              suppressHydrationWarning
            />
          </label>
        </div>

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
