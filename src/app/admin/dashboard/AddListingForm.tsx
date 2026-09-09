"use client";

import { useState, FormEvent } from "react";
import { CATEGORIES, Listing } from "@/lib/types";

const inputClass =
  "rounded-lg border border-card-border bg-white px-3 py-2 text-sm text-navy-dark outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

export default function AddListingForm({ onCreated }: { onCreated: (listing: Listing) => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add listing");
      onCreated(data.listing as Listing);
      (e.target as HTMLFormElement).reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy-dark transition hover:bg-gold-light"
      >
        + Add listing directly
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-card-border bg-card p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-navy-dark">
          Add listing (published immediately)
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted hover:underline"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          required
          maxLength={120}
          placeholder="Name / business"
          className={inputClass}
          suppressHydrationWarning
        />
        <select name="category" required defaultValue="" className={inputClass} suppressHydrationWarning>
          <option value="" disabled>
            Category
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <textarea
        name="description"
        rows={2}
        maxLength={2000}
        placeholder="Description (optional)"
        className={`${inputClass} mt-3 w-full`}
        suppressHydrationWarning
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <select name="contact_type" required defaultValue="phone" className={inputClass} suppressHydrationWarning>
          <option value="phone">Phone</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>
        <input
          name="contact_value"
          required
          maxLength={200}
          placeholder="Contact details"
          className={inputClass}
          suppressHydrationWarning
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-60"
        suppressHydrationWarning
      >
        {submitting ? "Adding..." : "Add & publish"}
      </button>
    </form>
  );
}
