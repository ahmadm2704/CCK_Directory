import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ContactType } from "@/lib/types";
import { contactValuesMatch } from "@/lib/contactMatch";

// Step 1 of self-service editing: check whether the supplied contact value
// matches the listing on file. On success, returns the full listing so the
// edit form can be pre-filled. This never mutates anything — the actual
// edit (PATCH on /api/listings/[id]) re-checks ownership itself.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const contactValue = body?.contact_value;

  if (typeof contactValue !== "string" || !contactValue.trim()) {
    return NextResponse.json({ error: "Enter the phone number or email on file" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .select("id, name, category, description, contact_type, contact_value, kit_number, house, status")
    .eq("id", id)
    .single();

  if (error || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (!contactValuesMatch(listing.contact_value, contactValue, listing.contact_type as ContactType)) {
    return NextResponse.json(
      { error: "That doesn't match the contact details on file for this listing" },
      { status: 403 }
    );
  }

  return NextResponse.json({ listing });
}
