"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Listing, ListingStatus } from "@/lib/types";
import ListingCard from "./ListingCard";
import AddListingForm from "./AddListingForm";

type Tab = "all" | ListingStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/listings");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load listings");
      setListings(data.listings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Standard fetch-on-mount; the rule below wants a data-fetching library instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const stats = useMemo(
    () => ({
      total: listings.length,
      pending: listings.filter((l) => l.status === "pending").length,
      approved: listings.filter((l) => l.status === "approved").length,
      rejected: listings.filter((l) => l.status === "rejected").length,
    }),
    [listings]
  );

  const visible = tab === "all" ? listings : listings.filter((l) => l.status === tab);

  async function updateStatus(id: string, status: ListingStatus) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update listing");
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function saveFields(id: string, fields: Partial<Listing>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("Failed to save changes");
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...fields } : l)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteListing(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete listing");
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function approveAll() {
    const pendingIds = listings.filter((l) => l.status === "pending").map((l) => l.id);
    if (pendingIds.length === 0) return;
    setApprovingAll(true);
    try {
      const results = await Promise.all(
        pendingIds.map((id) =>
          fetch(`/api/admin/listings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "approved" }),
          }).then((res) => ({ id, ok: res.ok }))
        )
      );
      const approvedIds = new Set(results.filter((r) => r.ok).map((r) => r.id));
      setListings((prev) =>
        prev.map((l) => (approvedIds.has(l.id) ? { ...l, status: "approved" } : l))
      );
      if (approvedIds.size < pendingIds.length) {
        setError("Some listings failed to approve. Please retry.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setApprovingAll(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-gold">Control panel</p>
          <h1 className="font-display text-2xl font-semibold text-navy-dark sm:text-3xl">
            Directory administration
          </h1>
        </div>
        <button
          onClick={logout}
          className="rounded-md border border-card-border px-3 py-1.5 text-sm font-medium text-navy-dark hover:bg-black/5"
        >
          Log out
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "Approved", value: stats.approved },
          { label: "Rejected", value: stats.rejected },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-card-border bg-card p-4 text-center shadow-sm">
            <p className="font-display text-2xl font-semibold text-navy-dark">{s.value}</p>
            <p className="text-xs uppercase tracking-wide text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <AddListingForm onCreated={(listing) => setListings((prev) => [listing, ...prev])} />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
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
            </button>
          ))}
        </div>
        {stats.pending > 0 && (
          <button
            onClick={approveAll}
            disabled={approvingAll}
            className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {approvingAll ? "Approving..." : `Approve all (${stats.pending})`}
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-muted">Loading...</p>}
      {!loading && visible.length === 0 && (
        <p className="text-sm text-muted">No {tab === "all" ? "" : tab} listings.</p>
      )}

      <ul className="flex flex-col gap-4">
        {visible.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            busy={busyId === listing.id}
            onSave={saveFields}
            onStatusChange={updateStatus}
            onDelete={deleteListing}
          />
        ))}
      </ul>
    </div>
  );
}
