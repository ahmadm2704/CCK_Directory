"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Login failed");
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-sm flex-col items-center justify-center px-4 py-16">
      <Image src="/brand/cck-crest.png" alt="Cadet College Kohat crest" width={64} height={64} className="h-16 w-16" />
      <p className="mt-4 font-display text-xs uppercase tracking-[0.3em] text-gold">Restricted access</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-navy-dark">Admin sign in</h1>

      <form onSubmit={handleSubmit} className="mt-6 w-full rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-dark">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            required
            className="rounded-lg border border-card-border bg-white px-3 py-2.5 text-sm text-navy-dark outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
