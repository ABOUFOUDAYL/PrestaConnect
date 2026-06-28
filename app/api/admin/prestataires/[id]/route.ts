import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { statut } = await req.json();

  if (!["approuve", "refuse", "en_attente"].includes(statut)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const { error } = await supabase
    .from("prestataires")
    .update({
      statut,
      verifie: statut === "approuve",
    })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}