'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Conversation, Message } from '@/types/messages'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    let filteredData = data || []

    // Si l'utilisateur connecté est artisan sur au moins une conversation,
    // on vérifie que le client a bien été débloqué avant d'afficher la conversation
    const asArtisanConvs = filteredData.filter((conv) => conv.artisan_id === user.id)

    if (asArtisanConvs.length > 0) {
      // Récupérer l'id interne prestataire correspondant à l'utilisateur connecté
      const { data: monPrestataire } = await supabase
        .from('prestataires')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (monPrestataire) {
        const clientUserIds = asArtisanConvs.map((c) => c.client_id)

        // Récupérer les ids internes clients correspondant aux user_id
        const { data: clientsRows } = await supabase
          .from('clients')
          .select('id, user_id')
          .in('user_id', clientUserIds)

        const clientIdByUserId = new Map(
          (clientsRows || []).map((c) => [c.user_id, c.id])
        )

        // Récupérer tous les déblocages de ce prestataire
        const { data: deblocagesRows } = await supabase
          .from('deblocages')
          .select('client_id')
          .eq('prestataire_id', monPrestataire.id)

        const deblockedClientIds = new Set(
          (deblocagesRows || []).map((d) => d.client_id)
        )

        // Filtrer : ne garder que les conversations où le client est débloqué
        filteredData = filteredData.filter((conv) => {
          if (conv.artisan_id !== user.id) return true // conversation où l'utilisateur est client : toujours visible
          const clientInternalId = clientIdByUserId.get(conv.client_id)
          return clientInternalId ? deblockedClientIds.has(clientInternalId) : false
        })
      } else {
        // Pas de profil prestataire trouvé : aucune conversation artisan visible
        filteredData = filteredData.filter((conv) => conv.artisan_id !== user.id)
      }
    }

    // auth.users n'est pas accessible via jointure PostgREST,
    // on récupère les profils séparément depuis public.profiles
    const otherUserIds = filteredData.map((conv) =>
      conv.client_id === user.id ? conv.artisan_id : conv.client_id
    )

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, nom, prenom, photo_url')
      .in('user_id', otherUserIds)

    const profilesMap = new Map(
      (profiles || []).map((p) => [
        p.user_id,
        {
          id: p.user_id,
          nom: p.nom,
          prenom: p.prenom,
          full_name: `${p.prenom || ''} ${p.nom || ''}`.trim() || 'Utilisateur',
          photo_url: p.photo_url,
          avatar_url: p.photo_url,
        },
      ])
    )

    const enriched = await Promise.all(
      filteredData.map(async (conv) => {
        const otherUserId = conv.client_id === user.id ? conv.artisan_id : conv.client_id
        const other = profilesMap.get(otherUserId) || null

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('lu', false)
          .neq('auteur_id', user.id)

        return { ...conv, other_user: other, unread_count: count || 0 }
      })
    )

    setConversations(enriched)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return { conversations, loading, refetch: fetchConversations }
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (!error) setMessages(data || [])
    setLoading(false)
  }, [conversationId])

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      auteur_id: user.id,
      sender_id: user.id,
      texte: content.trim(),
      content: content.trim(),
      lu: false,
    })

    if (error) {
      console.error(error)
      return
    }

    // Mettre à jour la conversation pour que la liste affiche le dernier message
    await supabase
      .from('conversations')
      .update({
        last_message: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
  }, [conversationId])

  const markAsRead = useCallback(async () => {
    if (!conversationId) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('messages')
      .update({ lu: true })
      .eq('conversation_id', conversationId)
      .eq('lu', false)
      .neq('auteur_id', user.id)
  }, [conversationId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  return { messages, loading, sendMessage, markAsRead, refetch: fetchMessages }
}

export async function getOrCreateConversation(artisanId: string): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('client_id', user.id)
    .eq('artisan_id', artisanId)
    .single()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ client_id: user.id, artisan_id: artisanId })
    .select('id')
    .single()

  if (error) { console.error(error); return null }
  return created.id
}