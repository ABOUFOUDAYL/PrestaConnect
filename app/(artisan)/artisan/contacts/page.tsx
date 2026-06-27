'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Search, Phone, Mail, MapPin, MessageCircle, Users } from 'lucide-react'

export default function ArtisanContactsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [contacts, setContacts] = useState<any[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      // ⚠️ Si vide alors qu'il devrait y avoir des contacts, remplace
      // user.id par prestataire.id ici (voir note ci-dessus)
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*, clients(*)')
        .eq('artisan_id', user.id)
        .order('last_message_at', { ascending: false })

      setContacts(conversations || [])
      setIsLoading(false)
    }

    load()
  }, [])

  const filtered = contacts.filter((c) => {
    const client = c.clients
    if (!client) return false
    const full = `${client.nom || ''} ${client.prenom || ''} ${client.telephone || ''}`.toLowerCase()
    return full.includes(query.toLowerCase())
  })

  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    return isToday
      ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
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
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Contacts</h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Recherche */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un contact..."
          style={{
            width: '100%',
            padding: '12px 14px 12px 40px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            boxSizing: 'border-box',
            background: 'white',
          }}
        />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '40px', textAlign: 'center' }}>
          <Users size={32} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            {query ? 'Aucun contact trouvé' : 'Aucun contact pour le moment'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {filtered.map((c) => {
            const client = c.clients
            const initiale = (client?.prenom?.[0] || client?.nom?.[0] || '?').toUpperCase()

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/artisan/messages?conversation=${c.id}`)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  border: '1px solid #f1f5f9',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '46px', height: '46px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0,
                }}>
                  {initiale}
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {client?.prenom} {client?.nom}
                    </p>
                    <span style={{ fontSize: '11px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                      {formatDate(c.last_message_at)}
                    </span>
                  </div>

                  {c.last_message && (
                    <p style={{
                      fontSize: '12px', color: '#94a3b8', margin: '2px 0 6px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <MessageCircle size={12} /> {c.last_message}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#94a3b8' }}>
                    {client?.telephone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={11} /> {client.telephone}
                      </span>
                    )}
                    {client?.ville && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} /> {client.ville}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}