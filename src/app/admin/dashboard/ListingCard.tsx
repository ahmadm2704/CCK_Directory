"use client";

import { useState } from "react";
import { CATEGORIES, Listing, ListingStatus } from "@/lib/types";

const inputClass =
  "rounded-lg border border-card-border bg-white px-3 py-2 text-sm text-navy-dark outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

const STATUS_STYLES: Record<ListingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

export default function ListingCard({
  listing,
  busy,
  onSave,
  onStatusChange,
  onDelete,
}: {
  listing: Listing;
  busy: boolean;
  onSave: (id: string, fields: Partial<Listing>) => Promise<void>;
  onStatusChange: (id: string, status: ListingStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: listing.name,
    category: listing.category,
    description: listing.description,
    contact_type: listing.contact_type,
    contact_value: listing.contact_value,
  });

  async function save() {
    await onSave(listing.id, draft);
    setEditing(false);
  }

  return (
    <li className="rounded-xl border border-card-border bg-card p-5 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold text-navy-dark">{listing.name}</h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[listing.status]}`}
          >
            {listing.status}
          </span>
        </div>
        <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-navy-dark">
          {listing.category}
        </span>
      </div>

      {!editing ? (
        <>
          {listing.description && <p className="text-sm text-muted">{listing.description}</p>}
          <p className="mt-2 text-xs font-medium text-navy/70">
            {listing.contact_type}: {listing.contact_value}
          </p>
        </>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <input
            className={inputClass}
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <select
            className={inputClass}
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            className={inputClass}
            rows={3}
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className={inputClass}
              value={draft.contact_type}
              onChange={(e) =>
                setDraft((d) => ({ ...d, contact_type: e.target.value as Listing["contact_type"] }))
              }
            >
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>
            <input
              className={inputClass}
              value={draft.contact_value}
              onChange={(e) => setDraft((d) => ({ ...d, contact_value: e.target.value }))}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {editing ? (
          <>
            <button
              disabled={busy}
              onClick={save}
              className="rounded-md bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-dark disabled:opacity-60"
            >
              Save changes
            </button>
            <button
              disabled={busy}
              onClick={() => setEditing(false)}
              className="rounded-md border border-card-border px-3 py-1.5 text-xs font-medium text-navy-dark hover:bg-black/5"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            disabled={busy}
            onClick={() => setEditing(true)}
            className="rounded-md border border-card-border px-3 py-1.5 text-xs font-medium text-navy-dark hover:bg-black/5"
          >
            Edit
          </button>
        )}

        {listing.status !== "approved" && (
          <button
            disabled={busy}
            onClick={() => onStatusChange(listing.id, "approved")}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            Approve
          </button>
        )}
        {listing.status !== "rejected" && (
          <button
            disabled={busy}
            onClick={() => onStatusChange(listing.id, "rejected")}
            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            Reject
          </button>
        )}
        {listing.status !== "pending" && (
          <button
            disabled={busy}
            onClick={() => onStatusChange(listing.id, "pending")}
            className="rounded-md border border-card-border px-3 py-1.5 text-xs font-medium text-navy-dark hover:bg-black/5"
          >
            Move to pending
          </button>
        )}
        <button
          disabled={busy}
          onClick={() => onDelete(listing.id)}
          className="ml-auto rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
