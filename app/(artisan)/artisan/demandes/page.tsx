'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, MapPin, Calendar, Wallet, X, Send } from 'lucide-react'

const STATUTS = ['Toutes', 'Nouvelle', 'En cours', 'Terminée', 'Refusée']

const STATUT_COLORS: Record<string, { color: string; bg: string }> = {
  'Nouvelle': { color: '#2563eb', bg: '#eff6ff' },
  'En cours': { color: '#f97316', bg: '#fff7ed' },
  'Terminée': { color: '#16a34a', bg: '#f0fdf4' },
  'Refusée': { color: '#dc2626', bg: '#fef2f2' },
}

export default function ArtisanDemandesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [prestataire, setPrestataire] = useState<any>(null)
  const [demandes, setDemandes] = useState<any[]>([])
  const [filtre, setFiltre] = useState('Toutes')

  const [selected, setSelected] = useState<any>(null)
  const [montant, setMontant] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sentIds, setSentIds] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data: presta } = await supabase
        .from('prestataires')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setPrestataire(presta)

      if (presta) {
        const { data: list } = await supabase
          .from('demandes')
          .select('*')
          .eq('prestataire_id', presta.id)
          .order('created_at', { ascending: false })

        setDemandes(list || [])

        // Pour savoir si un devis a déjà été envoyé pour chaque demande
        const { data: devisList } = await supabase
          .from('devis')
          .select('demande_id')
          .eq('prestataire_id', presta.id)

        setSentIds((devisList || []).map((d: any) => d.demande_id))
      }

      setIsLoading(false)
    }

    load()
  }, [])

  const filtered = demandes.filter((d) =>
    filtre === 'Toutes' ? true : d.statut === filtre
  )

  const openModal = (d: any) => {
    setSelected(d)
    setMontant('')
    setMessage('')
  }

  const closeModal = () => setSelected(null)

  const handleSendDevis = async () => {
    if (!selected || !prestataire || !montant) return
    setSending(true)

    const { error } = await supabase.from('devis').insert({
      demande_id: selected.id,
      prestataire_id: prestataire.id,
      montant: parseFloat(montant),
      message,
      statut: 'En attente',
    })

    setSending(false)

    if (!error) {
      setSentIds((prev) => [...prev, selected.id])
      closeModal()
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ color: '#64748b', marginTop: '16px' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Demandes</h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          {demandes.length} demande{demandes.length !== 1 ? 's' : ''} reçue{demandes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {STATUTS.map((s) => (
          <button
            key={s}
            onClick={() => setFiltre(s)}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              border: filtre === s ? '1px solid #f97316' : '1px solid #e2e8f0',
              background: filtre === s ? '#fff7ed' : 'white',
              color: filtre === s ? '#f97316' : '#64748b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '40px', textAlign: 'center' }}>
          <FileText size={32} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Aucune demande pour le moment</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filtered.map((d) => {
            const statutStyle = STATUT_COLORS[d.statut] || { color: '#64748b', bg: '#f1f5f9' }
            const alreadySent = sentIds.includes(d.id)

            return (
              <div
                key={d.id}
                onClick={() => openModal(d)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  border: '1px solid #f1f5f9',
                  padding: '18px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {d.titre || 'Demande sans titre'}
                    </p>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', color: statutStyle.color, background: statutStyle.bg }}>
                      {d.statut || 'Nouvelle'}
                    </span>
                    {alreadySent && (
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', color: '#16a34a', background: '#f0fdf4' }}>
                        Devis envoyé
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                    {d.ville && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} /> {d.ville}
                      </span>
                    )}
                    {d.budget && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Wallet size={13} /> {d.budget} FCFA
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {new Date(d.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal détail + envoi de devis */}
      {selected && (
        <div
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{selected.titre}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '16px' }}>
              {selected.description}
            </p>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8', marginBottom: '20px', flexWrap: 'wrap' }}>
              {selected.ville && <span><MapPin size={13} style={{ verticalAlign: '-2px' }} /> {selected.ville}</span>}
              {selected.budget && <span><Wallet size={13} style={{ verticalAlign: '-2px' }} /> Budget: {selected.budget} FCFA</span>}
            </div>

            {sentIds.includes(selected.id) ? (
              <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '14px', textAlign: 'center', color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>
                Devis déjà envoyé pour cette demande
              </div>
            ) : (
              <>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Montant proposé (FCFA)</label>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="Ex: 25000"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', marginBottom: '14px', boxSizing: 'border-box' }}
                />

                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Message (optionnel)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Précisez votre proposition..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', marginBottom: '18px', boxSizing: 'border-box', resize: 'vertical' }}
                />

                <button
                  onClick={handleSendDevis}
                  disabled={!montant || sending}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: !montant || sending ? '#cbd5e1' : 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: !montant || sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Send size={16} /> {sending ? 'Envoi...' : 'Envoyer le devis'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}