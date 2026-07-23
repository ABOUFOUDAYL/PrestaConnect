'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Upload, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'

const DOC_TYPES = [
  { key: 'piece_identite_url', label: "Piece d'identite", hint: 'CNI, passeport ou permis' },
  { key: 'diplome_url', label: 'Diplome / Certification', hint: 'Preuve de qualification' },
  { key: 'casier_judiciaire_url', label: 'Casier judiciaire', hint: "Extrait de moins de 3 mois" },
  { key: 'selfie_identite_url', label: "Selfie d'identite", hint: "Photo de vous avec votre piece" },
]

const STATUT_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  valide: { label: 'Valide', icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4' },
  en_attente: { label: 'En attente de verification', icon: Clock, color: '#ca8a04', bg: '#fefce8' },
  rejete: { label: 'Rejete - a refaire', icon: XCircle, color: '#dc2626', bg: '#fef2f2' },
}

export default function ArtisanDocumentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [prestataireId, setPrestataireId] = useState<string | null>(null)
  const [docs, setDocs] = useState<Record<string, string | null>>({})
  const [statut, setStatut] = useState<string | null>(null)
  const [verifie, setVerifie] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }
      setUserId(user.id)

      const { data: presta, error: prestaError } = await supabase
        .from('prestataires')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (prestaError) {
        console.error('Erreur chargement prestataire:', prestaError)
        setError(`Erreur chargement profil: ${prestaError.message}`)
      }

      if (presta) {
        setPrestataireId(presta.id)
        setStatut(presta.statut)
        setVerifie(presta.verifie)
        setDocs({
          piece_identite_url: presta.piece_identite_url,
          diplome_url: presta.diplome_url,
          casier_judiciaire_url: presta.casier_judiciaire_url,
          selfie_identite_url: presta.selfie_identite_url,
        })
      }

      setIsLoading(false)
    }
    load()
  }, [])

  const handleUpload = async (key: string, file: File) => {
    if (!userId) return
    setError('')
    setUploadingKey(key)

    const ext = file.name.split('.').pop()
    const path = `${userId}/${key}_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(`Erreur upload: ${uploadError.message}`)
      setUploadingKey(null)
      return
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
    const publicUrl = urlData.publicUrl

    const { error: updateError } = await supabase
      .from('prestataires')
      .update({ [key]: publicUrl, statut: 'en_attente' })
      .eq('user_id', userId)

    if (updateError) {
      setError(`Erreur enregistrement: ${updateError.message}`)
    } else {
      setDocs((prev) => ({ ...prev, [key]: publicUrl }))
      setStatut('en_attente')
    }

    setUploadingKey(null)
  }

  const config = statut ? STATUT_CONFIG[statut] : null

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
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Mes documents</h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          Ces documents sont necessaires pour verifier votre profil
        </p>
      </div>

      {/* Statut global */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: verifie ? '#f0fdf4' : (config?.bg || '#f1f5f9'),
        border: `1px solid ${verifie ? '#bbf7d0' : '#f1f5f9'}`,
        borderRadius: '14px', padding: '14px 18px', marginBottom: '20px',
      }}>
        {verifie ? (
          <CheckCircle2 size={20} color="#16a34a" />
        ) : config ? (
          <config.icon size={20} color={config.color} />
        ) : (
          <AlertCircle size={20} color="#64748b" />
        )}
        <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: verifie ? '#16a34a' : (config?.color || '#64748b') }}>
          {verifie ? 'Profil verifie' : (config?.label || 'Documents non soumis')}
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Liste des documents */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {DOC_TYPES.map((doc) => {
          const url = docs[doc.key]
          const isUploading = uploadingKey === doc.key

          return (
            <div key={doc.key} style={{
              background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9',
              padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px',
                background: url ? '#f0fdf4' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FileText size={18} color={url ? '#16a34a' : '#94a3b8'} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>
                  {doc.label}
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                  {url ? 'Document soumis' : doc.hint}
                </p>
              </div>

              <input
                ref={(el) => { fileInputs.current[doc.key] = el }}
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(doc.key, file)
                }}
              />

              <button
                onClick={() => fileInputs.current[doc.key]?.click()}
                disabled={isUploading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px',
                  border: '1px solid #e2e8f0', background: 'white',
                  fontSize: '12px', fontWeight: 600, color: '#475569',
                  cursor: isUploading ? 'not-allowed' : 'pointer', flexShrink: 0,
                }}
              >
                <Upload size={13} />
                {isUploading ? 'Envoi...' : url ? 'Remplacer' : 'Ajouter'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}