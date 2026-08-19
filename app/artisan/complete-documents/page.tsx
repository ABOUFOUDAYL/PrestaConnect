'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const DOCUMENT_TYPES = [
  { id: 'cni', label: "Carte d'identité (CNI)" },
  { id: 'cip', label: 'Carte d\'Identification Personnelle (CIP)' },
  { id: 'diplome', label: 'Diplôme' },
  { id: 'casier', label: 'Casier judiciaire' },
]

const COLUMN_MAP: Record<string, string> = {
  cni: 'piece_identite_url',
  cip: 'carte_artisan_url',
  diplome: 'diplome_url',
  casier: 'casier_judiciaire_url',
}

export default function CompleteDocumentsPage() {
  const router = useRouter()
  const [loadingData, setLoadingData] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [qualificationType, setQualificationType] = useState('diplome')

  const [documents, setDocuments] = useState<Record<string, File | null>>({
    cni: null, cip: null, diplome: null, casier: null,
  })

  // Récupérer les infos de l'artisan connecté
  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const { data: prestataire, error } = await supabase
        .from('prestataires')
        .select('qualification_type')
        .eq('user_id', user.id)
        .single()

      if (prestataire) {
        setQualificationType(prestataire.qualification_type || 'diplome')
      }
      setLoadingData(false)
    }
    fetchUserData()
  }, [router])

  // Déterminer les documents à afficher
  const visibleDocuments = qualificationType === 'diplome' 
    ? DOCUMENT_TYPES.filter(doc => ['cni', 'cip', 'diplome'].includes(doc.id))
    : DOCUMENT_TYPES.filter(doc => ['cni', 'cip', 'casier'].includes(doc.id))

  const handleFileChange = (type: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [type]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setUploading(true)
    setError('')

    const updates: Record<string, string> = {}
    let uploadedCount = 0

    // Upload des fichiers sélectionnés
    for (const [type, file] of Object.entries(documents)) {
      if (file && visibleDocuments.find(doc => doc.id === type)) {
        const path = `documents/${userId}/${type}/${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('Documents')
          .upload(path, file, { upsert: true })

        if (uploadError) {
          console.error(`Erreur upload document ${type}:`, uploadError)
          continue
        }

        const column = COLUMN_MAP[type]
        if (column) {
          updates[column] = path
          uploadedCount++
        }
      }
    }

    if (uploadedCount === 0) {
      setError("Veuillez sélectionner au moins un document pour valider votre profil.")
      setUploading(false)
      return
    }

    // Mise à jour de la base de données
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('prestataires')
        .update(updates)
        .eq('user_id', userId)

      if (updateError) {
        setError("Erreur lors de l'enregistrement de vos documents. Veuillez réessayer.")
        setUploading(false)
        return
      }
    }

    // Si tout est ok, on le renvoie sur son tableau de bord
    router.push('/artisan/dashboard')
  }

  if (loadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-lg mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-full mb-4 mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dossier incomplet</h1>
            <p className="text-gray-500 text-sm mt-2">
              Pour que votre profil soit examiné et validé par notre équipe, vous devez fournir vos documents justificatifs.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {visibleDocuments.map(doc => (
              <div key={doc.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-900 mb-2">{doc.label}</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => handleFileChange(doc.id, e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-orange-700 file:border file:border-orange-200 hover:file:bg-orange-50 cursor-pointer"
                />
              </div>
            ))}

            <button 
              type="submit" 
              disabled={uploading}
              className="w-full mt-6 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Envoyer mes documents"
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}