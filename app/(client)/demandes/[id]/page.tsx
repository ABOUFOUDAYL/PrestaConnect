'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'

interface DemandeDetail {
  id: string
  service_nom: string | null
  description: string | null
  ville: string | null
  quartier: string | null
  metier_type: string | null
  status: string | null
  created_at: string
}

interface DevisArtisan {
  nom: string | null
  prenom: string | null
  telephone: string | null
  metier: string | null
}

interface DevisDetail {
  id: string
  artisan_id: string
  montant: number
  message: string | null
  statut: string
  created_at: string
  artisan: DevisArtisan | null
}

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  accepte: 'Accepté',
  refuse: 'Refusé',
}

export default function DemandeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const demandeId = params?.id as string

  const [demande, setDemande] = useState<DemandeDetail | null>(null)
  const [devisList, setDevisList] = useState<DevisDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function loadData() {
    setIsLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: demandeData, error: demandeError } = await supabase
      .from('demandes')
      .select('id, service_nom, description, ville, quartier, metier_type, status, created_at')
      .eq('id', demandeId)
      .eq('client_id', user.id)
      .maybeSingle()

    if (demandeError) {
      console.error('Erreur récupération demande:', demandeError)
      setError("Impossible de charger cette demande.")
      setIsLoading(false)
      return
    }

    if (!demandeData) {
      setError("Demande introuvable.")
      setIsLoading(false)
      return
    }

    setDemande(demandeData)

    const { data: devisData, error: devisError } = await supabase
      .from('devis')
      .select('id, artisan_id, montant, message, statut, created_at')
      .eq('demande_id', demandeId)
      .order('created_at', { ascending: false })

    if (devisError) {
      console.error('Erreur récupération devis:', devisError)
      setDevisList([])
      setIsLoading(false)
      return
    }

    const artisanIds = Array.from(new Set((devisData || []).map(d => d.artisan_id)))
    let artisansMap: Record<string, DevisArtisan> = {}

    if (artisanIds.length > 0) {
      const { data: artisansData, error: artisansError } = await supabase
        .from('profiles')
        .select('user_id, nom, prenom, telephone, metier')
        .in('user_id', artisanIds)

      if (artisansError) {
        console.error('Erreur récupération artisans:', artisansError)
      } else if (artisansData) {
        artisansMap = Object.fromEntries(
          artisansData.map((a: any) => [a.user_id, { nom: a.nom, prenom: a.prenom, telephone: a.telephone, metier: a.metier }])
        )
      }
    }

    const combined: DevisDetail[] = (devisData || []).map((d: any) => ({
      id: d.id,
      artisan_id: d.artisan_id,
      montant: d.montant,
      message: d.message,
      statut: d.statut,
      created_at: d.created_at,
      artisan: artisansMap[d.artisan_id] || null,
    }))

    setDevisList(combined)
    setIsLoading(false)
  }

  useEffect(() => {
    if (demandeId) loadData()
  }, [demandeId])

  async function handleAccepter(devisId: string) {
    setActionError(null)
    setAcceptingId(devisId)

    const { data, error: rpcError } = await supabase.rpc('accepter_devis', { p_devis_id: devisId })

    if (rpcError) {
      console.error('Erreur RPC accepter_devis:', rpcError)
      setActionError("Une erreur est survenue lors de l'acceptation du devis.")
      setAcceptingId(null)
      return
    }

    if (data && data.success === false) {
      const messages: Record<string, string> = {
        devis_introuvable: "Ce devis n'existe plus.",
        non_autorise: "Vous n'êtes pas autorisé à accepter ce devis.",
        devis_deja_traite: "Ce devis a déjà été traité.",
      }
      setActionError(messages[data.error] || "Impossible d'accepter ce devis.")
      setAcceptingId(null)
      return
    }

    await loadData()
    setAcceptingId(null)
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e63946', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ color: 'var(--color-neutral-500)', marginTop: '16px' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !demande) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-16) 0', color: 'var(--color-neutral-400)' }}>
        <p>{error || "Demande introuvable."}</p>
        <Link href="/demandes" style={{ color: 'var(--color-primary-500)', fontSize: 'var(--text-sm)' }}>
          ← Retour à mes demandes
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Link href="/demandes" style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
        color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)',
        textDecoration: 'none', marginBottom: 'var(--space-5)',
      }}>
        <ArrowLeft className="h-4 w-4" /> Retour à mes demandes
      </Link>

      <div style={{
        background: 'var(--color-neutral-0)', border: '1px solid var(--color-neutral-200)',
        borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', marginBottom: 'var(--space-6)',
      }}>
        <h1 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
          {demande.service_nom || 'Demande sans titre'}
        </h1>
        <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
          📍 {demande.ville || 'Non renseignée'}{demande.quartier ? ` · ${demande.quartier}` : ''} · 🗂️ {demande.metier_type || 'Non renseigné'} · 📅 {new Date(demande.created_at).toLocaleDateString('fr-FR')}
        </p>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', lineHeight: 'var(--leading-relaxed)' }}>
          {demande.description}
        </p>
      </div>

      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', marginBottom: 'var(--space-4)' }}>
        Devis reçus ({devisList.length})
      </h2>

      {actionError && (
        <div style={{ background: 'var(--color-error-50)', border: '1px solid var(--color-error-200)', color: 'var(--color-error-700)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
          {actionError}
        </div>
      )}

      {devisList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16) 0', color: 'var(--color-neutral-400)' }}>
          <p style={{ fontSize: '3rem' }}>📄</p>
          <p>Aucun devis reçu pour le moment</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {devisList.map((d) => (
            <div key={d.id} style={{
              background: 'var(--color-neutral-0)', border: '1px solid var(--color-neutral-200)',
              borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>
                    {d.artisan ? `${d.artisan.prenom || ''} ${d.artisan.nom || ''}`.trim() || 'Artisan' : 'Artisan'}
                  </p>
                  {d.artisan?.metier && (
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>{d.artisan.metier}</p>
                  )}
                  {d.artisan?.telephone && (
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>📞 {d.artisan.telephone}</p>
                  )}
                </div>
                <span style={{
                  fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)',
                  background: d.statut === 'accepte' ? 'var(--color-success-50)' : d.statut === 'refuse' ? 'var(--color-error-50)' : 'var(--color-primary-50)',
                  color: d.statut === 'accepte' ? 'var(--color-success-700)' : d.statut === 'refuse' ? 'var(--color-error-700)' : 'var(--color-primary-700)',
                }}>
                  {STATUT_LABELS[d.statut] || d.statut}
                </span>
              </div>

              <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
                {d.montant.toLocaleString('fr-FR')} FCFA
              </p>

              {d.message && (
                <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>
                  {d.message}
                </p>
              )}

              {d.statut === 'en_attente' && (
                <button
                  onClick={() => handleAccepter(d.id)}
                  disabled={acceptingId === d.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-lg)',
                    border: 'none', background: 'var(--color-primary-600)', color: 'white',
                    fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', cursor: 'pointer',
                    opacity: acceptingId === d.id ? 0.6 : 1,
                  }}
                >
                  {acceptingId === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {acceptingId === d.id ? 'Traitement...' : 'Accepter ce devis'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}