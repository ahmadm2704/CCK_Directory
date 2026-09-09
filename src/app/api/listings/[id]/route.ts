import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, name, category, description, contact_type, contact_value, photo_url, created_at")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  return NextResponse.json({ listing: data });
}
