"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import DevisList from "@/components/devis/DevisList"
import { Loader2, ArrowLeft, MapPin, Calendar, Tag, CheckCircle } from "lucide-react"

interface DemandeDetails {
  id: string
  titre: string
  description: string
  categorie: string
  ville: string
  quartier?: string
  telephone: string
  type_intervention: string
  statut: string
  dateCreation: string
}

export default function DetailDemandePage() {
  const params = useParams()
  const router = useRouter()
  const demandeId = params?.id as string

  const [demande, setDemande] = useState<DemandeDetails | null>(null)
  const [devisList, setDevisList] = useState<any[]>([])
  const [clientId, setClientId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDemandeDetails = async () => {
      if (!demandeId) return
      setIsLoading(true)

      // 1. Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setClientId(user.id)

      // 2. Récupérer les détails de la demande
      const { data: demandeData, error: demandeError } = await supabase
        .from("demandes")
        .select("*")
        .eq("id", demandeId)
        .single()

      if (demandeError || !demandeData) {
        console.error("Erreur récupération demande:", demandeError)
        setIsLoading(false)
        return
      }

      setDemande({
        id: demandeData.id,
        titre: demandeData.titre || demandeData.description?.slice(0, 50) || "Demande sans titre",
        description: demandeData.description || "",
        categorie: demandeData.metier_type || "Non renseigné",
        ville: demandeData.ville || "Non renseignée",
        quartier: demandeData.quartier,
        telephone: demandeData.telephone,
        type_intervention: demandeData.type_intervention || "urgent",
        statut: demandeData.status || "Ouvert",
        dateCreation: new Date(demandeData.created_at).toLocaleDateString("fr-FR"),
      })

      // 3. Récupérer les devis associés avec le profil de l'artisan
      const { data: devisData, error: devisError } = await supabase
        .from("devis")
        .select(`
          *,
          profiles:artisan_id (nom, prenom, specialite)
        `)
        .eq("demande_id", demandeId)

      if (!devisError && devisData) {
        setDevisList(devisData)
      }

      setIsLoading(false)
    }

    fetchDemandeDetails()
  }, [demandeId, router])

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-500" />
          <p style={{ color: "var(--color-neutral-500)", marginTop: "16px" }}>Chargement des détails...</p>
        </div>
      </div>
    )
  }

  if (!demande) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Demande introuvable.</p>
        <button onClick={() => router.back()} className="mt-4 text-primary-600 font-semibold">
          ← Retour à mes demandes
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Bouton de retour */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à mes demandes
      </button>

      {/* Carte des détails de la demande */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 mb-2">
              {demande.categorie}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{demande.titre}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            demande.statut === 'Ouvert' ? 'bg-green-100 text-green-700' : 
            demande.statut === 'Annulé' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {demande.statut}
          </span>
        </div>

        <p className="text-gray-600 text-sm whitespace-pre-line border-t border-b border-gray-50 py-4">
          {demande.description}
        </p>

        <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {demande.ville} {demande.quartier ? `(${demande.quartier})` : ''}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Créée le {demande.dateCreation}</span>
          <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> {demande.type_intervention}</span>
        </div>
      </div>

      {/* Section des devis des artisans */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-gray-900">
          Propositions des artisans ({devisList.length})
        </h2>

        <DevisList 
          demandeId={demande.id} 
          clientId={clientId} 
          initialDevis={devisList} 
        />
      </div>
    </div>
  )
}