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
  optionnel?: boolean
}

const statusConfig = {
  manquant: { label: 'Manquant', bg: '#FEF2F2', color: '#DC2626', icon: <XCircle size={14} /> },
  soumis:   { label: 'En vérification', bg: '#FFF7ED', color: '#D97706', icon: <Clock size={14} /> },
  vérifié:  { label: 'Vérifié', bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={14} /> },
  rejeté:   { label: 'Rejeté', bg: '#FEF2F2', color: '#DC2626', icon: <XCircle size={14} /> },
}

const DEFAULT_DOCUMENTS: Document[] = [
  {
    id: '1',
    nom: "Pièce d'identité",
    description: "CIP ou carte biométrique en cours de validité",
    status: 'manquant',
  },
  {
    id: '2',
    nom: "Diplôme du métier",
    description: "Attestation ou CQM (Certificat de Qualification au Métier)",
    status: 'manquant',
  },
  {
    id: '3',
    nom: "Casier judiciaire",
    description: "Pour les métiers ne possédant pas de diplôme",
    status: 'manquant',
    optionnel: true,
  },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(DEFAULT_DOCUMENTS)
  const [uploading, setUploading] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('artisan_documents')
      .select('*')
      .eq('artisan_id', user.id)

    if (data && data.length > 0) {
      setDocuments(prev => prev.map(doc => {
        const found = data.find((d: any) => d.document_id === doc.id)
        return found ? { ...doc, status: found.status, date: found.created_at ? new Date(found.created_at).toLocaleDateString('fr-FR') : undefined } : doc
      }))
    }
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

  const obligatoires = documents.filter(d => !d.optionnel)
  const verified = obligatoires.filter(d => d.status === 'vérifié').length
  const total = obligatoires.length
  const progress = total > 0 ? Math.round((verified / total) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <span className="text-gray-500">Chargement…</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Documents & Validation</h1>
        <p className="text-sm text-gray-500">Soumettez vos documents pour valider votre profil professionnel</p>
      </div>

      {/* Progression */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">Progression du profil</span>
          <span className="text-sm font-bold text-orange-600">{verified}/{total} documents vérifiés</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: progress === 100 ? '#16A34A' : '#EA580C',
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {progress === 100
            ? '✅ Profil complet — votre compte est vérifié'
            : `${progress}% — complétez vos documents pour apparaître dans les recherches`}
        </p>
      </div>

      {/* Liste des documents */}
      <div className="flex flex-col gap-3">
        {documents.map(doc => {
          const cfg = statusConfig[doc.status]
          return (
            <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <FileText size={16} className="text-gray-400" />
                  <span className="font-semibold text-gray-900">{doc.nom}</span>
                  {doc.optionnel && (
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Optionnel</span>
                  )}
                  <span
                    className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{doc.description}</p>
                {doc.date && (
                  <p className="text-xs text-gray-400 mt-1">Soumis le {doc.date}</p>
                )}
                {success === doc.id && (
                  <p className="text-xs text-green-600 mt-1">✅ Document soumis, en cours de vérification</p>
                )}
              </div>

              {(doc.status === 'manquant' || doc.status === 'rejeté') && (
                <button
                  onClick={() => handleUpload(doc.id)}
                  disabled={uploading === doc.id}
                  className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition whitespace-nowrap disabled:opacity-60"
                >
                  <Upload size={14} />
                  {uploading === doc.id ? '⏳ Envoi...' : 'Soumettre'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}