import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { path } = await req.json();

  if (!path) {
    return NextResponse.json({ error: "Chemin manquant" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from("Documents")
    .createSignedUrl(path, 60 * 10);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Impossible de générer le lien" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: data.signedUrl });
}