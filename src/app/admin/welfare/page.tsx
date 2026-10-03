"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WelfareEntry, ListingStatus } from "@/lib/types";

type Tab = "all" | ListingStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const STATUS_STYLES: Record<ListingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminWelfarePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [entries, setEntries] = useState<WelfareEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/welfare");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load entries");
      setEntries(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Standard fetch-on-mount (same pattern as the listings dashboard).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const visible = tab === "all" ? entries : entries.filter((e) => e.status === tab);
  const pendingCount = entries.filter((e) => e.status === "pending").length;

  async function updateStatus(id: string, status: ListingStatus) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/welfare/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update entry");
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/welfare/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete entry");
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/admin/dashboard" className="text-sm font-medium text-navy/70 hover:text-navy hover:underline">
        ← Back to dashboard
      </Link>
      <p className="mt-6 font-display text-xs uppercase tracking-[0.3em] text-gold">Control panel</p>
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy-dark sm:text-3xl">
        Charity / Welfare entries
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t.key
                ? "bg-navy text-white"
                : "border border-card-border text-navy-dark hover:bg-black/5"
            }`}
          >
            {t.label}
            {t.key === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-muted">Loading...</p>}
      {!loading && visible.length === 0 && (
        <p className="text-sm text-muted">No {tab === "all" ? "" : tab} entries.</p>
      )}

      <ul className="flex flex-col gap-4">
        {visible.map((entry) => (
          <li key={entry.id} className="rounded-xl border border-card-border bg-card p-5 shadow-sm">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-navy-dark">{entry.name}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[entry.status]}`}
              >
                {entry.status}
              </span>
            </div>
            {entry.kit_number && <p className="text-xs text-muted">Kit no. {entry.kit_number}</p>}
            {entry.description && <p className="mt-1 text-sm text-muted">{entry.description}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              {entry.status !== "approved" && (
                <button
                  disabled={busyId === entry.id}
                  onClick={() => updateStatus(entry.id, "approved")}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  Approve
                </button>
              )}
              {entry.status !== "rejected" && (
                <button
                  disabled={busyId === entry.id}
                  onClick={() => updateStatus(entry.id, "rejected")}
                  className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  Reject
                </button>
              )}
              {entry.status !== "pending" && (
                <button
                  disabled={busyId === entry.id}
                  onClick={() => updateStatus(entry.id, "pending")}
                  className="rounded-md border border-card-border px-3 py-1.5 text-xs font-medium text-navy-dark hover:bg-black/5"
                >
                  Move to pending
                </button>
              )}
              <button
                disabled={busyId === entry.id}
                onClick={() => remove(entry.id)}
                className="ml-auto rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
