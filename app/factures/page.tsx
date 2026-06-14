'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FacturesPage() {
  const [factures, setFactures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<'client' | 'artisan'>('client')

  useEffect(() => {
    const fetchFactures = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const res = await fetch(`/api/factures?user_id=${user.id}&type=${type}`)
      const data = await res.json()
      setFactures(data.factures || [])
      setLoading(false)
    }
    fetchFactures()
  }, [type])

  const handleDownload = (id: string) => {
    window.open(`/api/factures/${id}`, '_blank')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes Factures</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setType('client')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          En tant que client
        </button>
        <button
          onClick={() => setType('artisan')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'artisan' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          En tant qu'artisan
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : factures.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Aucune facture disponible</div>
      ) : (
        <div className="space-y-3">
          {factures.map((f) => (
            <div key={f.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div>
                <p className="font-medium text-gray-900">Facture #{f.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">{new Date(f.created_at).toLocaleDateString('fr-FR')} — {f.description || 'Prestation'}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-900">{f.montant} FCFA</span>
                <button
                  onClick={() => handleDownload(f.id)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Télécharger PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}