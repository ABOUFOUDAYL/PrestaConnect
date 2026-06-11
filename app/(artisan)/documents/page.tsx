'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Document {
  id: string
  nom: string
  description: string
  status: 'manquant' | 'soumis' | 'vérifié' | 'rejeté'
  date?: string
}

const statusConfig = {
  manquant: { label: 'Manquant', bg: '#FEF2F2', color: '#DC2626', icon: <XCircle size={14} /> },
  soumis:   { label: 'En vérification', bg: '#FFF7ED', color: '#D97706', icon: <Clock size={14} /> },
  vérifié:  { label: 'Vérifié', bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={14} /> },
  rejeté:   { label: 'Rejeté', bg: '#FEF2F2', color: '#DC2626', icon: <XCircle size={14} /> },
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('artisan_documents')
      .select('*')
      .eq('artisan_id', user.id)

    if (data) setDocuments(data)
    else setDocuments([
      { id: '1', nom: "Pièce d'identité", description: "CNI ou passeport en cours de validité", status: 'manquant' },
      { id: '2', nom: "Kbis ou extrait SIRENE", description: "Moins de 3 mois", status: 'manquant' },
      { id: '3', nom: "Assurance décennale", description: "Attestation en cours de validité", status: 'manquant' },
      { id: '4', nom: "Qualification RGE", description: "Si applicable à votre métier", status: 'manquant' },
    ])
    setLoading(false)
  }

  async function handleUpload(docId: string) {
    setUploading(docId)
    setSuccess(null)

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.jpg,.jpeg,.png'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) { setUploading(null); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setUploading(null); return }

      const path = `documents/${user.id}/${docId}/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('artisan-documents')
        .upload(path, file, { upsert: true })

      if (!uploadError) {
        await supabase
          .from('artisan_documents')
          .upsert({ artisan_id: user.id, document_id: docId, status: 'soumis', file_path: path })

        setDocuments(prev =>
          prev.map(d => d.id === docId ? { ...d, status: 'soumis', date: new Date().toLocaleDateString('fr-FR') } : d)
        )
        setSuccess(docId)
      }
      setUploading(null)
    }
    input.click()
  }

  const total = documents.length
  const verified = documents.filter(d => d.status === 'vérifié').length
  const progress = total > 0 ? Math.round((verified / total) * 100) : 0

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <span style={{ color: 'var(--color-gray-500)' }}>Chargement…</span>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* En-tête */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-1)' }}>
          Documents & Validation
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
          Soumettez vos documents pour valider votre profil professionnel
        </p>
      </div>

      {/* Progression */}
      <div style={{
        background: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--space-5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
            Progression du profil
          </span>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-600)', fontWeight: 'var(--font-weight-bold)' }}>
            {verified}/{total} documents vérifiés
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--color-gray-100)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: progress === 100 ? 'var(--color-success-500)' : 'var(--color-primary-500)',
            borderRadius: 99,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginTop: 6 }}>
          {progress === 100
            ? '✅ Profil complet — votre compte est vérifié'
            : `${progress}% — complétez vos documents pour apparaître dans les recherches`}
        </p>
      </div>

      {/* Liste des documents */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {documents.map(doc => {
          const cfg = statusConfig[doc.status]
          return (
            <div
              key={doc.id}
              style={{
                background: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-4)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                  <FileText size={16} color="var(--color-gray-400)" />
                  <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{doc.nom}</span>
                  <span style={{
                    background: cfg.bg,
                    color: cfg.color,
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 10px',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                  {doc.description}
                </div>
                {doc.date && (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginTop: 4 }}>
                    Soumis le {doc.date}
                  </div>
                )}
                {success === doc.id && (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success-600)', marginTop: 4 }}>
                    ✅ Document soumis, en cours de vérification
                  </div>
                )}
              </div>

              {(doc.status === 'manquant' || doc.status === 'rejeté') && (
                <button
                  onClick={() => handleUpload(doc.id)}
                  disabled={uploading === doc.id}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--color-primary-500)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    whiteSpace: 'nowrap',
                    opacity: uploading === doc.id ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Upload size={14} />
                  {uploading === doc.id ? '⏳ Envoi...' : '📎 Soumettre'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}