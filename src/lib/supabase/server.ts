import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Public, anon-key client for server-side reads (respects RLS: approved listings only).
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Service-role client for admin API routes only. Bypasses RLS — never import
// this into client components or expose the key to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
