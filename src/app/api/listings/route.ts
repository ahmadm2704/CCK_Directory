import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";

  const supabase = createPublicClient();
  let query = supabase
    .from("listings")
    .select("id, name, category, description, contact_type, contact_value, photo_url, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    query = query.eq("category", category);
  }
  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ listings: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, category, description, contact_type, contact_value, photo_url } = body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof category !== "string" ||
    !(CATEGORIES as readonly string[]).includes(category) ||
    typeof description !== "string" ||
    !description.trim() ||
    typeof contact_type !== "string" ||
    !["phone", "whatsapp", "email"].includes(contact_type) ||
    typeof contact_value !== "string" ||
    !contact_value.trim()
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  if (name.length > 120 || description.length > 2000 || contact_value.length > 200) {
    return NextResponse.json({ error: "One or more fields are too long" }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("listings")
    .insert({
      name: name.trim(),
      category,
      description: description.trim(),
      contact_type,
      contact_value: contact_value.trim(),
      photo_url: typeof photo_url === "string" && photo_url.trim() ? photo_url.trim() : null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
