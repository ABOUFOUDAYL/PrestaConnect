"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { MessageCircle, Heart, Unlock, CheckCircle2, Phone, Mail, Loader2 } from "lucide-react"

interface ArtisanActionsProps {
  artisanId: string
  artisanName: string
}

const TARIF_DEBLOCAGE = 1000

export default function ArtisanActions({ artisanId, artisanName }: ArtisanActionsProps) {
  const [favori, setFavori] = useState(false)
  const [contactDebloque, setContactDebloque] = useState(false)
  const [coordonnees, setCoordonnees] = useState<{ telephone: string; email: string } | null>(null)
  const [loadingCheck, setLoadingCheck] = useState(true)
  const [loadingPaiement, setLoadingPaiement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    async function verifierDeblocage() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingCheck(false)
        return
      }

      const { data: deblocage } = await supabase
        .from("deblocages_prestataires")
        .select("id")
        .eq("client_id", user.id)
        .eq("prestataire_id", artisanId)
        .maybeSingle()

      if (deblocage) {
        const { data: prestataire } = await supabase
          .from("prestataires")
          .select("telephone, user_id")
          .eq("id", artisanId)
          .maybeSingle()

        let email = ""
        if (prestataire?.user_id) {
          const { data: profil } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", prestataire.user_id)
            .maybeSingle()
          email = profil?.email ?? ""
        }

        setCoordonnees({ telephone: prestataire?.telephone ?? "Non renseigné", email })
        setContactDebloque(true)
      }
      setLoadingCheck(false)
    }
    verifierDeblocage()
  }, [artisanId])

  async function handleDeblocage() {
    setErreur(null)
    setLoadingPaiement(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErreur("Vous devez être connecté pour débloquer un contact.")
      setLoadingPaiement(false)
      return
    }

    const { data: prestataire } = await supabase
      .from("prestataires")
      .select("user_id")
      .eq("id", artisanId)
      .maybeSingle()

    if (!prestataire) {
      setErreur("Artisan introuvable.")
      setLoadingPaiement(false)
      return
    }

    try {
      const res = await fetch("/api/fedapay/deblocage-prestataire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: user.id,
          prestataire_id: artisanId,
          prestataire_user_id: prestataire.user_id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création du paiement")
      window.location.href = data.payment_url
    } catch (e: any) {
      setErreur(e.message)
      setLoadingPaiement(false)
    }
  }

  const btnPrimary = {
    padding: "var(--space-3) var(--space-6)",
    borderRadius: "var(--radius-lg)",
    border: "none",
    background: "var(--color-primary-500)",
    color: "white",
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-semibold)",
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    width: "100%",
    marginBottom: "var(--space-3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-2)",
  }

  const btnSecondary = {
    padding: "var(--space-3) var(--space-6)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--color-neutral-300)",
    background: "var(--color-neutral-0)",
    color: "var(--color-neutral-700)",
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-medium)",
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    width: "100%",
    marginBottom: "var(--space-3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-2)",
  }

  return (
    <div style={{
      background: "var(--color-neutral-0)",
      border: "1px solid var(--color-neutral-200)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-6)",
    }}>
      <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)", color: "var(--color-neutral-900)" }}>
        Contacter {artisanName}
      </h3>

      <button style={btnPrimary} onClick={() => alert("Redirection vers messagerie...")}>
        <MessageCircle size={16} /> Envoyer un message
      </button>

      <button
        style={{ ...btnSecondary, color: favori ? "var(--color-error-600)" : "var(--color-neutral-700)", borderColor: favori ? "var(--color-error-300)" : "var(--color-neutral-300)" }}
        onClick={() => setFavori(!favori)}
      >
        <Heart size={16} fill={favori ? "var(--color-error-600)" : "none"} />
        {favori ? "Retiré des favoris" : "Ajouter aux favoris"}
      </button>

      {loadingCheck ? (
        <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--color-neutral-400)" }} />
        </div>
      ) : !contactDebloque ? (
        <div>
          <button
            style={{ ...btnSecondary, background: "var(--color-secondary-50)", borderColor: "var(--color-secondary-300)", color: "var(--color-secondary-700)", opacity: loadingPaiement ? 0.6 : 1 }}
            onClick={handleDeblocage}
            disabled={loadingPaiement}
          >
            <Unlock size={16} /> {loadingPaiement ? "Redirection en cours…" : "Débloquer les coordonnées"}
          </button>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-400)", textAlign: "center", margin: 0 }}>
            Coût : {TARIF_DEBLOCAGE} FCFA via paiement Mobile Money
          </p>
          {erreur && (
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-error-600)", textAlign: "center", marginTop: "var(--space-2)" }}>
              {erreur}
            </p>
          )}
        </div>
      ) : (
        <div style={{ background: "var(--color-success-50)", border: "1px solid var(--color-success-200)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)" }}>
          <p style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-xs)", color: "var(--color-success-700)", fontWeight: "var(--font-semibold)", display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
            <CheckCircle2 size={14} /> Coordonnées débloquées
          </p>
          <p style={{ margin: "0 0 var(--space-1)", fontSize: "var(--text-sm)", color: "var(--color-neutral-700)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Phone size={14} /> {coordonnees?.telephone}
          </p>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-neutral-700)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Mail size={14} /> {coordonnees?.email || "Non renseigné"}
          </p>
        </div>
      )}
    </div>
  )
}