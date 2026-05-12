import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createDirectUpload } from "@/lib/mux";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UploadRequestZ = z
  .object({
    visibility: z.enum(["public", "unlisted"]).optional(),
  })
  .optional();

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let visibility: "public" | "unlisted" = "public";
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = UploadRequestZ.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid visibility value." }, { status: 400 });
    }
    visibility = parsed.data?.visibility ?? "public";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const created = await createDirectUpload({
      corsOrigin: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      visibility,
    });
    return NextResponse.json({ uploadId: created.uploadId, url: created.uploadUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create upload URL.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
