import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/types";

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

  const update: Record<string, string> = {};

  if (body.status !== undefined) {
    if (!["approved", "rejected", "pending"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status;
  }
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
    if (!["phone", "whatsapp", "email"].includes(body.contact_type)) {
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

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("listings").update(update).eq("id", id);
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
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
