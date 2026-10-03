import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, kit_number, description } = body;
  const descriptionValue = typeof description === "string" ? description.trim() : "";
  const kitNumberValue = typeof kit_number === "string" ? kit_number.trim() : "";

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  if (name.length > 300 || descriptionValue.length > 2000 || kitNumberValue.length > 50) {
    return NextResponse.json({ error: "One or more fields are too long" }, { status: 400 });
  }

  // No .select(): the row is inserted as "pending" and the anon SELECT policy
  // only allows approved rows, so RETURNING would fail (see /api/listings).
  const supabase = createPublicClient();
  const { error } = await supabase.from("welfare_entries").insert({
    name: name.trim(),
    kit_number: kitNumberValue || null,
    description: descriptionValue,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
