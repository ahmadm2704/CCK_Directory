# CCK Directory

A community classifieds/contact directory: members submit listings (name, category,
description, contact info), an admin approves them, and everyone can browse/search
approved listings and reveal contact details.

## Stack

- Next.js (App Router) + Tailwind CSS
- Supabase (Postgres + `@supabase/supabase-js`) for storage
- Deployed on Vercel

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL editor, run `supabase/schema.sql` from this repo — it creates
   the `listings` table and row-level security policies (public can insert pending
   listings and read approved ones only; moderation is done server-side).
3. Grab your project's `Project URL`, `anon` public key, and `service_role` key from
   **Project Settings → API**.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase. **Server-side only, never expose to the browser.**
- `ADMIN_PASSWORD` — the password used to log into `/admin`.
- `ADMIN_SESSION_SECRET` — random string used to sign the admin session cookie. Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to browse the directory, and
[http://localhost:3000/submit](http://localhost:3000/submit) to add a listing.
Log into [http://localhost:3000/admin](http://localhost:3000/admin) with `ADMIN_PASSWORD`
to approve, reject, or delete listings.

## 4. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the same environment variables from `.env.local` in the Vercel project settings.
4. Deploy.

## How it works

- Anyone can submit a listing (`/submit`) — it's inserted with `status = "pending"`
  and isn't publicly visible yet (enforced by Supabase row-level security).
- The directory homepage (`/`) only shows `status = "approved"` listings, with search
  and category filtering.
- A listing's contact details are only fetched when a visitor clicks "Reveal contact
  details" on the listing page — this keeps them out of the server-rendered HTML so
  they're not trivially scraped.
- `/admin` is a simple password-gated dashboard (cookie-based session, signed with
  `ADMIN_SESSION_SECRET`) to approve, reject, or delete listings. Moderation actions
  go through the Supabase `service_role` key server-side, bypassing row-level security.
