import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email, password, role, full_name,
      telephone, ville, metier,
      carte_identite_url, casier_judiciaire_url
    } = body;

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role },
      });
    if (authError) throw authError;

    const userId = authData.user?.id;
    if (!userId) throw new Error("User non créé");

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        user_id: userId,
        role: "artisan",
        full_name,
        telephone,
        email,
        ville: ville || null,
        metier: metier || null,
        carte_identite_url: carte_identite_url || null,
        casier_judiciaire_url: casier_judiciaire_url || null,
        statut_verification: "en_attente_validation",
      }, { onConflict: "id" });
    if (profileError) throw profileError;

    if (role === "prestataire" || role === "artisan") {
      const { error: prestaError } = await supabaseAdmin
        .from("prestataires")
        .insert({
          user_id: userId,
          nom: full_name,
          metier: metier || "Non renseigné",
          statut: "en_attente",
        });
      if (prestaError) throw prestaError;
    }

    await resend.emails.send({
      from: "PrestaConnect <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL!,
      subject: "Nouvel artisan en attente de validation",
      html: `
        <h2>Nouvel artisan inscrit sur PrestaConnect</h2>
        <p><strong>Nom :</strong> ${full_name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${telephone}</p>
        <p><strong>Métier :</strong> ${metier}</p>
        <p><strong>Ville :</strong> ${ville}</p>
        <br/>
        <p>Connectez-vous au tableau de bord admin pour valider ce compte.</p>
        <a href="https://presta-connect.vercel.app/admin-ambassadeur">
          Voir le tableau de bord
        </a>
      `,
    });

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}