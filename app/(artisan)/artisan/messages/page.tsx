'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Send, MessageCircle, Search, Lock, Wallet } from 'lucide-react'

const TARIF_CONTACT_DIRECT = 300

function MessagesContent() {
  const searchParams = useSearchParams()
  const initialConv = searchParams.get('conversation')

  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(initialConv)
  const [messages, setMessages] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [solde, setSolde] = useState(0)
  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadConversations = async (uid: string) => {
    const { data: convs, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('artisan_id', uid)
      .order('last_message_at', { ascending: false })

    if (error) {
      console.error('Erreur chargement conversations:', error)
      return []
    }

    const clientIds = (convs || []).map((c) => c.client_id)

    let clientsMap = new Map<string, any>()
    if (clientIds.length > 0) {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .in('user_id', clientIds)
      clientsMap = new Map((clientsData || []).map((c) => [c.user_id, c]))
    }

    let unlockedSet = new Set<string>()
    if (clientIds.length > 0) {
      const { data: deblocages } = await supabase
        .from('deblocages_contacts')
        .select('client_id')
        .eq('artisan_id', uid)
        .in('client_id', clientIds)
      unlockedSet = new Set((deblocages || []).map((d) => d.client_id))
    }

    return (convs || []).map((c) => ({
      ...c,
      clients: clientsMap.get(c.client_id) || null,
      isUnlocked: unlockedSet.has(c.client_id),
    }))
  }

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }
      setUserId(user.id)

      const enriched = await loadConversations(user.id)
      setConversations(enriched)
      if (!initialConv && enriched.length > 0) {
        setSelectedId(enriched[0].id)
      }

      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('solde')
        .eq('user_id', user.id)
        .maybeSingle()

      if (walletError) {
        console.error('Erreur chargement wallet:', walletError)
      }
      setSolde(wallet?.solde || 0)

      setIsLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedId) return

    const selectedConv = conversations.find((c) => c.id === selectedId)
    if (!selectedConv?.isUnlocked) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedId)
        .order('created_at', { ascending: true })

      setMessages(msgs || [])

      if (userId) {
        await supabase
          .from('messages')
          .update({ lu: true })
          .eq('conversation_id', selectedId)
          .eq('lu', false)
          .neq('sender_id', userId)
      }
    }
    loadMessages()

    const channel = supabase
      .channel(`messages-${selectedId}`)
      .on('postgres_changes' as any, {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${selectedId}`,
      }, (payload: any) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedId, userId, conversations])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedId || !userId) return
    setSending(true)

    const text = newMessage.trim()
    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedId,
      sender_id: userId,
      content: text,
      texte: text,
      lu: false,
    })

    if (!error) {
      await supabase
        .from('conversations')
        .update({ last_message: text, last_message_at: new Date().toISOString() })
        .eq('id', selectedId)

      setNewMessage('')
      setConversations((prev) =>
        prev.map((c) => c.id === selectedId
          ? { ...c, last_message: text, last_message_at: new Date().toISOString() }
          : c
        ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      )
    }

    setSending(false)
  }

  const handleDebloquer = async () => {
    if (!selectedId || !userId) return
    const selectedConv = conversations.find((c) => c.id === selectedId)
    if (!selectedConv) return

    setUnlockError(null)
    setUnlocking(true)

    const { data, error } = await supabase.rpc('debloquer_contact_direct', {
      p_artisan_id: userId,
      p_client_id: selectedConv.client_id,
      p_montant: TARIF_CONTACT_DIRECT,
      p_description: `Déblocage contact · ${selectedConv.clients?.prenom || 'Client'}`,
    })

    if (error) {
      console.error(error)
      setUnlockError("Erreur lors du déblocage. Réessayez.")
      setUnlocking(false)
      return
    }

    if (!data?.success) {
      if (data?.error === 'solde_insuffisant') {
        setUnlockError('Solde insuffisant. Rechargez votre portefeuille pour débloquer ce contact.')
      } else {
        setUnlockError("Erreur lors du déblocage. Réessayez.")
      }
      setUnlocking(false)
      return
    }

    setSolde(data.nouveau_solde)
    setConversations((prev) =>
      prev.map((c) => c.id === selectedId ? { ...c, isUnlocked: true } : c)
    )
    setUnlocking(false)
  }

  const filtered = conversations.filter((c) => {
    const client = c.clients
    if (!client) return false
    const full = `${client.nom || ''} ${client.prenom || ''}`.toLowerCase()
    return full.includes(query.toLowerCase())
  })

  const selectedConv = conversations.find((c) => c.id === selectedId)
  const selectedClient = selectedConv?.clients

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

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
    <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 140px)', minHeight: '500px' }}>

      <div style={{
        width: '320px', flexShrink: 0, background: 'white', borderRadius: '16px',
        border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>Messages</h1>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '30px 16px' }}>
              Aucune conversation
            </p>
          ) : (
            filtered.map((c) => {
              const client = c.clients
              const initiale = (client?.prenom?.[0] || client?.nom?.[0] || '?').toUpperCase()
              const isActive = c.id === selectedId

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', background: isActive ? '#fff7ed' : 'transparent',
                    borderBottom: '1px solid #f8fafc',
                  }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0,
                    position: 'relative',
                  }}>
                    {initiale}
                    {!c.isUnlocked && (
                      <div style={{
                        position: 'absolute', bottom: -2, right: -2, width: '16px', height: '16px',
                        borderRadius: '50%', background: '#f97316', border: '2px solid white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Lock size={8} color="white" />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>
                      {c.isUnlocked ? `${client?.prenom || ''} ${client?.nom || ''}` : 'Contact verrouillé'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.isUnlocked
                        ? (c.last_message || 'Nouvelle conversation')
                        : (c.last_message ? `${c.last_message.slice(0, 28)}...` : 'Nouveau contact')}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div style={{
        flex: 1, background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {!selectedConv ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px' }}>
            <MessageCircle size={32} color="#cbd5e1" />
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Selectionnez une conversation</p>
          </div>
        ) : !selectedConv.isUnlocked ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{
              maxWidth: '360px', textAlign: 'center', background: '#fff7ed',
              border: '1px solid #fed7aa', borderRadius: '16px', padding: '32px 24px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: '#fed7aa',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <Lock size={22} color="#ea580c" />
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                Contact verrouillé
              </p>
              <p style={{ fontSize: '13px', color: '#78716c', margin: '0 0 16px', lineHeight: 1.5 }}>
                Débloquez ce contact pour voir son nom et pouvoir échanger des messages avec lui.
              </p>

              {selectedConv.last_message && (
                <div style={{
                  background: 'white', border: '1px solid #fed7aa', borderRadius: '10px',
                  padding: '12px 14px', marginBottom: '16px', textAlign: 'left',
                }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#ea580c', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Aperçu du message
                  </p>
                  <p style={{ fontSize: '13px', color: '#44403c', margin: 0, lineHeight: 1.5 }}>
                    "{selectedConv.last_message.slice(0, 35)}
                    {selectedConv.last_message.length > 35 && (
                      <span style={{ filter: 'blur(3.5px)', userSelect: 'none' }}>
                        {selectedConv.last_message.slice(35, 90)}
                      </span>
                    )}"
                  </p>
                </div>
              )}

              {unlockError && (
                <p style={{ fontSize: '12px', color: '#dc2626', marginBottom: '12px' }}>{unlockError}</p>
              )}

              <p style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
                <Wallet size={13} /> Solde : {solde.toLocaleString('fr-FR')} FCFA
              </p>

              <button
                onClick={handleDebloquer}
                disabled={unlocking}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                  background: unlocking ? '#fdba74' : 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: 'white', fontWeight: 700, fontSize: '14px',
                  cursor: unlocking ? 'not-allowed' : 'pointer',
                }}
              >
                {unlocking ? 'Déblocage...' : `Débloquer pour ${TARIF_CONTACT_DIRECT} FCFA`}
              </button>

              {solde < TARIF_CONTACT_DIRECT && (
                <a href="/artisan/recharge" style={{ display: 'block', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#ea580c', marginTop: '12px', textDecoration: 'none' }}>
                  Recharger mon portefeuille →
                </a>
              )}
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '13px',
              }}>
                {(selectedClient?.prenom?.[0] || '?').toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {selectedClient?.prenom} {selectedClient?.nom}
                </p>
                {selectedClient?.ville && (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{selectedClient.ville}</p>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: 'auto' }}>
                  Aucun message, demarrez la conversation
                </p>
              ) : (
                messages.map((m) => {
                  const isMine = (m.sender_id || m.auteur_id) === userId
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%', padding: '10px 14px', borderRadius: '14px',
                        background: isMine ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#f1f5f9',
                        color: isMine ? 'white' : '#0f172a',
                      }}>
                        <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{m.content || m.texte}</p>
                        <p style={{ fontSize: '10px', margin: '4px 0 0', opacity: 0.7, textAlign: 'right' }}>
                          {formatTime(m.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                placeholder="Ecrire un message..."
                style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                style={{
                  width: '44px', height: '44px', borderRadius: '10px', border: 'none',
                  background: !newMessage.trim() || sending ? '#cbd5e1' : 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer', flexShrink: 0,
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ArtisanMessagesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chargement...</div>}>
      <MessagesContent />
    </Suspense>
  )
}