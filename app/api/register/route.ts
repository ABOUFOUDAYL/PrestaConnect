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
      email, password, role, first_name, last_name,
      telephone, ville, metier,
      carte_identite_url, casier_judiciaire_url,
      latitude, longitude
    } = body;

    if (!email || !password || !role || !first_name || !last_name) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const normalizedRole = role === 'prestataire' ? 'artisan' : role;
    if (!['client', 'artisan', 'admin', 'ambassadeur'].includes(normalizedRole)) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      );
    }

    const full_name = `${first_name} ${last_name}`.trim();

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { full_name, role: normalizedRole },
      });
    if (authError) throw authError;

    const userId = authData.user?.id;
    if (!userId) throw new Error("User non créé");

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        user_id: userId,
        nom: last_name,
        prenom: first_name,
        telephone: telephone || null,
        email,
        role: normalizedRole,
        ville: ville || null,
        metier: metier || null,
        carte_identite_url: carte_identite_url || null,
        casier_judiciaire_url: casier_judiciaire_url || null,
        statut_verification: normalizedRole === 'client' ? 'valide' : 'en_attente_validation',
      }, { onConflict: "id" });
    if (profileError) throw profileError;

    if (normalizedRole === 'artisan') {
      const { error: prestaError } = await supabaseAdmin
        .from("prestataires")
        .insert({
          user_id: userId,
          nom: full_name,
          metier: metier || "Non renseigné",
          ville: ville || null,
          telephone: telephone || null,
          statut: "en_attente",
          latitude: latitude || null,
          longitude: longitude || null,
        });
      if (prestaError) throw prestaError;

      try {
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
      } catch (emailError) {
        console.error("Email admin error:", emailError);
      }

    } else if (normalizedRole === 'client') {
      const { error: clientError } = await supabaseAdmin
        .from("clients")
        .insert({
          user_id: userId,
          nom: last_name,
          prenom: first_name,
          telephone: telephone || null,
          email,
        });
      if (clientError) throw clientError;
    }

    try {
      await resend.emails.send({
        from: "PrestaConnect <onboarding@resend.dev>",
        to: email,
        subject: "Bienvenue sur PrestaConnect !",
        html: `
          <h2>Bienvenue ${first_name} !</h2>
          <p>Votre compte ${normalizedRole === 'artisan' ? 'artisan' : 'client'} a bien été créé.</p>
          ${normalizedRole === 'artisan'
            ? `<p>Votre profil est en cours de validation par notre équipe. Vous recevrez un email dès que votre compte sera activé.</p>`
            : `<p>Vous pouvez dès maintenant vous connecter et publier vos demandes.</p>`
          }
          <a href="https://presta-connect.vercel.app/login">Se connecter</a>
        `,
      });
    } catch (emailError) {
      console.error("Email confirmation error:", emailError);
    }

    return NextResponse.json({ success: true, userId });

  } catch (err: any) {
    console.error("❌ Register error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}