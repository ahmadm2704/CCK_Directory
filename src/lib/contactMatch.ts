import { ContactType } from "@/lib/types";

// Lightweight ownership check for self-service edits: a listing has no
// account attached to it, so we treat "knows the contact info on file"
// as proof it's theirs. Phone-ish values are compared digit-only so
// formatting (spaces, dashes, +country code) doesn't cause false mismatches.
export function contactValuesMatch(
  stored: string,
  provided: string,
  contactType: ContactType
): boolean {
  const a = stored.trim();
  const b = provided.trim();
  if (!a || !b) return false;

  if (contactType === "email") {
    return a.toLowerCase() === b.toLowerCase();
  }

  const digitsOnly = (s: string) => s.replace(/\D/g, "");
  const da = digitsOnly(a);
  const db = digitsOnly(b);
  return da.length > 0 && da === db;
}
