import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/types";

async function requireAdmin() {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = new URL(request.url).searchParams.get("status");
  const supabase = createAdminClient();
  let query = supabase.from("listings").select("*").order("created_at", { ascending: false });
  if (status === "pending" || status === "approved" || status === "rejected") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ listings: data });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, category, description, contact_type, contact_value } = body;
  const descriptionValue = typeof description === "string" ? description.trim() : "";

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 120 ||
    typeof category !== "string" ||
    !(CATEGORIES as readonly string[]).includes(category) ||
    descriptionValue.length > 2000 ||
    typeof contact_type !== "string" ||
    !["phone", "whatsapp", "email"].includes(contact_type) ||
    typeof contact_value !== "string" ||
    !contact_value.trim() ||
    contact_value.length > 200
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .insert({
      name: name.trim(),
      category,
      description: descriptionValue,
      contact_type,
      contact_value: contact_value.trim(),
      status: "approved",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ listing: data }, { status: 201 });
}
