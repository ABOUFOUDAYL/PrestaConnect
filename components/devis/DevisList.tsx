'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { CheckCircle, Loader2, AlertCircle, XCircle } from 'lucide-react'

interface ArtisanProfile {
  nom?: string
  prenom?: string
  specialite?: string
}

interface Devis {
  id: string
  demande_id: string
  artisan_id: string
  montant: number
  message: string
  statut: 'en_attente' | 'accepte' | 'refuse'
  profiles?: ArtisanProfile
}

interface DevisListProps {
  demandeId: string
  clientId: string
  initialDevis: Devis[]
}

export default function DevisList({ demandeId, clientId, initialDevis }: DevisListProps) {
  const router = useRouter()
  const [devisList, setDevisList] = useState<Devis[]>(initialDevis)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleAccepterDevis = async (devisId: string) => {
    setLoadingId(devisId)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc('accepter_devis', {
        p_devis_id: devisId,
        p_demande_id: demandeId,
        p_client_id: clientId,
      })

      if (rpcError) throw rpcError

      if (data) {
        setDevisList((prevList) =>
          prevList.map((d) => ({
            ...d,
            statut: d.id === devisId ? 'accepte' : 'refuse',
          }))
        )
        router.refresh()
      }
    } catch (err: any) {
      console.error('Erreur RPC:', err)
      setError(err.message || "Une erreur est survenue lors de l'acceptation du devis.")
    } finally {
      setLoadingId(null)
    }
  }

  if (devisList.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center text-gray-500">
        Aucun devis n'a encore été proposé pour cette demande.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {devisList.map((devis) => {
        const artisanNom = devis.profiles?.nom || 'Prestataire'
        const artisanPrenom = devis.profiles?.prenom || ''
        const specialite = devis.profiles?.specialite || 'Artisan'

        return (
          <div 
            key={devis.id} 
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border p-5 transition
              ${devis.statut === 'accepte' ? 'border-green-500 bg-green-50/50' : 
                devis.statut === 'refuse' ? 'border-gray-200 bg-gray-50/50 opacity-60' : 'border-gray-200 bg-white hover:border-primary-300'}`}
          >
            <div className="flex-1 space-y-1 w-full">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">
                  {artisanPrenom} {artisanNom}
                </h4>
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                  {specialite}
                </span>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line">{devis.message}</p>
              <div className="pt-2 font-bold text-gray-900">
                {devis.montant?.toLocaleString('fr-FR')} FCFA
              </div>
            </div>

            <div className="w-full sm:w-auto flex flex-col items-center gap-2">
              {devis.statut === 'en_attente' && (
                <button
                  onClick={() => handleAccepterDevis(devis.id)}
                  disabled={loadingId !== null}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingId === devis.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Accepter ce devis
                </button>
              )}

              {devis.statut === 'accepte' && (
                <div className="flex items-center gap-2 text-green-700 font-semibold text-sm bg-green-100 px-4 py-2 rounded-xl">
                  <CheckCircle className="h-4 w-4" />
                  Devis sélectionné
                </div>
              )}

              {devis.statut === 'refuse' && (
                <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm">
                  <XCircle className="h-4 w-4" />
                  Refusé
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}