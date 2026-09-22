import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createAdminClient } from "@/lib/supabase/server";
import { CATEGORIES, ContactType } from "@/lib/types";
import { contactValuesMatch } from "@/lib/contactMatch";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, name, category, description, contact_type, contact_value, photo_url, kit_number, house, created_at"
    )
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  return NextResponse.json({ listing: data });
}

// Self-service edit: anyone who can supply the contact value on file for this
// listing (phone/email) is treated as its owner, since listings aren't tied
// to a real account. This lets the original submitter fix or fill in their
// own details — including on listings created before "Kit Number"/"House"
// existed — without needing admin help. Only content fields are editable
// here; moderation status stays admin-only (see /api/admin/listings/[id]).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { confirm_contact_value } = body;
  if (typeof confirm_contact_value !== "string" || !confirm_contact_value.trim()) {
    return NextResponse.json(
      { error: "Enter the phone number or email on file to verify it's your listing" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: existing, error: fetchError } = await supabase
    .from("listings")
    .select("id, contact_type, contact_value")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (!contactValuesMatch(existing.contact_value, confirm_contact_value, existing.contact_type as ContactType)) {
    return NextResponse.json(
      { error: "That doesn't match the contact details on file for this listing" },
      { status: 403 }
    );
  }

  const update: Record<string, string | null> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.length > 120) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    update.name = body.name.trim();
  }
  if (body.category !== undefined) {
    if (!(CATEGORIES as readonly string[]).includes(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    update.category = body.category;
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string" || body.description.length > 2000) {
      return NextResponse.json({ error: "Invalid description" }, { status: 400 });
    }
    update.description = body.description.trim();
  }
  if (body.contact_type !== undefined) {
    if (!["phone", "whatsapp", "phone_whatsapp", "email"].includes(body.contact_type)) {
      return NextResponse.json({ error: "Invalid contact type" }, { status: 400 });
    }
    update.contact_type = body.contact_type;
  }
  if (body.contact_value !== undefined) {
    if (
      typeof body.contact_value !== "string" ||
      !body.contact_value.trim() ||
      body.contact_value.length > 200
    ) {
      return NextResponse.json({ error: "Invalid contact value" }, { status: 400 });
    }
    update.contact_value = body.contact_value.trim();
  }
  if (body.kit_number !== undefined) {
    if (typeof body.kit_number !== "string" || body.kit_number.length > 50) {
      return NextResponse.json({ error: "Invalid kit number" }, { status: 400 });
    }
    update.kit_number = body.kit_number.trim() || null;
  }
  if (body.house !== undefined) {
    if (typeof body.house !== "string" || body.house.length > 100) {
      return NextResponse.json({ error: "Invalid house" }, { status: 400 });
    }
    update.house = body.house.trim() || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { error: updateError } = await supabase.from("listings").update(update).eq("id", id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
