"use client";

import { useState } from "react";
import { ContactType } from "@/lib/types";

function contactLabel(contact_type: ContactType) {
  if (contact_type === "phone") return "Phone";
  if (contact_type === "whatsapp") return "WhatsApp";
  if (contact_type === "phone_whatsapp") return "Phone & WhatsApp";
  return "Email";
}

export default function RevealContact({ id }: { id: string }) {
  const [contact, setContact] = useState<{ type: ContactType; value: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reveal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load contact details");
      setContact({ type: data.listing.contact_type, value: data.listing.contact_value });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (contact) {
    return (
      <div className="rounded-lg border border-gold/30 bg-gold/10 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          {contactLabel(contact.type)}
        </p>
        <p className="mt-1 font-display text-lg font-semibold text-navy-dark">{contact.value}</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={reveal}
        disabled={loading}
        className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy-dark transition hover:bg-gold-light disabled:opacity-60"
      >
        {loading ? "Loading..." : "Reveal contact details"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
