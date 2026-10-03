import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const update: Record<string, string | null> = {};

  if (body.status !== undefined) {
    if (!["approved", "rejected", "pending"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.length > 300) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    update.name = body.name.trim();
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string" || body.description.length > 2000) {
      return NextResponse.json({ error: "Invalid description" }, { status: 400 });
    }
    update.description = body.description.trim();
  }
  if (body.kit_number !== undefined) {
    if (typeof body.kit_number !== "string" || body.kit_number.length > 50) {
      return NextResponse.json({ error: "Invalid kit number" }, { status: 400 });
    }
    update.kit_number = body.kit_number.trim() || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("welfare_entries").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("welfare_entries").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
