"use client";

import { useState, FormEvent } from "react";
import { CATEGORIES, ContactType, Listing } from "@/lib/types";

const inputClass =
  "rounded-lg border border-card-border bg-white px-3 py-2.5 text-sm text-navy-dark outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

type VerifiedListing = Pick<
  Listing,
  "id" | "name" | "category" | "description" | "contact_type" | "contact_value" | "kit_number" | "house"
>;

export default function EditListingForm({ id }: { id: string }) {
  const [confirmValue, setConfirmValue] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [listing, setListing] = useState<VerifiedListing | null>(null);

  const [draft, setDraft] = useState({
    name: "",
    category: "",
    description: "",
    contact_type: "phone" as ContactType,
    contact_value: "",
    kit_number: "",
    house: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch(`/api/listings/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_value: confirmValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not verify ownership");
      const l = data.listing as VerifiedListing;
      setListing(l);
      setDraft({
        name: l.name,
        category: l.category,
        description: l.description ?? "",
        contact_type: l.contact_type,
        contact_value: l.contact_value,
        kit_number: l.kit_number ?? "",
        house: l.house ?? "",
      });
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm_contact_value: confirmValue, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save changes");
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (!listing) {
    return (
      <form
        onSubmit={handleVerify}
        className="flex flex-col gap-4 rounded-xl border border-card-border bg-card p-6 shadow-sm sm:p-8"
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          Phone number or email on file
          <input
            value={confirmValue}
            onChange={(e) => setConfirmValue(e.target.value)}
            required
            placeholder="e.g. 03001234567 or name@email.com"
            className={inputClass}
            suppressHydrationWarning
          />
        </label>
        {verifyError && <p className="text-sm text-red-600">{verifyError}</p>}
        <button
          type="submit"
          disabled={verifying}
          className="rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-60"
          suppressHydrationWarning
        >
          {verifying ? "Checking..." : "Continue"}
        </button>
      </form>
    );
  }

  if (saved) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-2xl text-gold">
          ✓
        </div>
        <h2 className="font-display text-xl font-semibold text-navy-dark">Changes saved</h2>
        <p className="mt-2 text-sm text-muted">Your listing has been updated.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="flex flex-col gap-5 rounded-xl border border-card-border bg-card p-6 shadow-sm sm:p-8"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
        Name / business
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          required
          maxLength={120}
          className={inputClass}
          suppressHydrationWarning
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
        Category
        <select
          value={draft.category}
          onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
          required
          className={inputClass}
          suppressHydrationWarning
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
        Description <span className="font-normal text-muted">(optional)</span>
        <textarea
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          rows={4}
          maxLength={2000}
          className={inputClass}
          suppressHydrationWarning
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          Kit number <span className="font-normal text-muted">(optional)</span>
          <input
            value={draft.kit_number}
            onChange={(e) => setDraft((d) => ({ ...d, kit_number: e.target.value }))}
            maxLength={50}
            className={inputClass}
            suppressHydrationWarning
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          House <span className="font-normal text-muted">(optional)</span>
          <input
            value={draft.house}
            onChange={(e) => setDraft((d) => ({ ...d, house: e.target.value }))}
            maxLength={100}
            className={inputClass}
            suppressHydrationWarning
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          Contact method
          <select
            value={draft.contact_type}
            onChange={(e) => setDraft((d) => ({ ...d, contact_type: e.target.value as ContactType }))}
            required
            className={inputClass}
            suppressHydrationWarning
          >
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="phone_whatsapp">Phone &amp; WhatsApp (same number)</option>
            <option value="email">Email</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          Contact details
          <input
            value={draft.contact_value}
            onChange={(e) => setDraft((d) => ({ ...d, contact_value: e.target.value }))}
            required
            maxLength={200}
            className={inputClass}
            suppressHydrationWarning
          />
        </label>
      </div>

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-60"
        suppressHydrationWarning
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
