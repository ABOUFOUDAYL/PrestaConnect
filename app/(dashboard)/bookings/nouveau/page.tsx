'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const SERVICES = ['Plomberie', 'Electricite', 'Menage', 'Coiffure', 'Maconnerie', 'Menuiserie', 'Peinture', 'Climatisation', 'Livraison', 'Reparation auto']

const QUARTIERS = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Cadjehoun', 'Akpakpa', 'Fidjrosse', 'Dantokpa', 'Godomey', 'Calavi']

export default function NouvelleReservationPage() {
  const [statut, setStatut] = useState<'formulaire' | 'succes'>('formulaire')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    client_nom: '',
    client_telephone: '',
    client_email: '',
    service: '',
    description: '',
    adresse: '',
    quartier: '',
    date_souhaitee: '',
  })

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit() {
    if (!form.client_nom || !form.client_telephone || !form.service || !form.description || !form.quartier) {
      alert('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('bookings').insert({
      client_nom: form.client_nom,
      client_telephone: form.client_telephone,
      client_email: form.client_email,
      service: form.service,
      description: form.description,
      adresse: form.adresse,
      quartier: form.quartier,
      date_souhaitee: form.date_souhaitee || null,
      statut: 'en_attente',
      contact_debloque: false,
    })
    setLoading(false)
    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      setStatut('succes')
    }
  }

  if (statut === 'succes') {
    return (
      <div className="max-w-md mx-auto mt-16 text-center px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
        <h2 className="text-xl font-bold text-green-800 mb-2">Demande envoyee !</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Votre demande a bien ete transmise. Un artisan vous contactera bientot.
          Le service est 100% gratuit pour vous. Vous payez l artisan en cash apres satisfaction.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 mb-6">
          Aucun paiement en ligne requis de votre part.
        </div>
        <a href="/dashboard" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold">
          Retour au tableau de bord
        </a>
      </div>
    )
  }

  const inputClass = "w-full border border-border rounded-lg px-4 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
  const labelClass = "block text-sm font-medium mb-1"

  return (
    <div className="max-w-lg mx-auto py-6 px-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Nouvelle demande</h1>
        <p className="text-muted-foreground text-sm mt-1">Service 100% gratuit — vous payez l artisan en cash apres le travail</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-3">
        <span className="text-green-600 text-lg">✓</span>
        <div>
          <p className="text-sm font-semibold text-green-800">Gratuit pour vous</p>
          <p className="text-xs text-green-700">Aucun paiement sur PrestaConnect. Vous reglez directement l artisan.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-semibold">Vos informations</h2>
        <div>
          <label className={labelClass}>Nom complet *</label>
          <input value={form.client_nom} onChange={(e) => setField('client_nom', e.target.value)}
            placeholder="Ex: Kossi Adjovi" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Telephone *</label>
          <input value={form.client_telephone} onChange={(e) => setField('client_telephone', e.target.value)}
            placeholder="Ex: 97 XX XX XX" className={inputClass} type="tel" />
        </div>
        <div>
          <label className={labelClass}>Email (optionnel)</label>
          <input value={form.client_email} onChange={(e) => setField('client_email', e.target.value)}
            placeholder="votre@email.com" className={inputClass} type="email" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-semibold">Votre besoin</h2>
        <div>
          <label className={labelClass}>Type de service *</label>
          <select value={form.service} onChange={(e) => setField('service', e.target.value)} className={inputClass}>
            <option value="">Choisir un service...</option>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Description du travail *</label>
          <textarea value={form.description} onChange={(e) => setField('description', e.target.value)}
            placeholder="Ex: Fuite sous l evier de la cuisine..." rows={3}
            className={inputClass + " resize-none"} />
        </div>
        <div>
          <label className={labelClass}>Quartier *</label>
          <select value={form.quartier} onChange={(e) => setField('quartier', e.target.value)} className={inputClass}>
            <option value="">Choisir un quartier...</option>
            {QUARTIERS.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Adresse precise</label>
          <input value={form.adresse} onChange={(e) => setField('adresse', e.target.value)}
            placeholder="Rue, repere visible..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date souhaitee</label>
          <input value={form.date_souhaitee} onChange={(e) => setField('date_souhaitee', e.target.value)}
            className={inputClass} type="date" />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-base hover:bg-primary/90 transition disabled:opacity-50"
      >
        {loading ? 'Envoi en cours...' : 'Envoyer ma demande gratuitement'}
      </button>
    </div>
  )
}
