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
      .select(`
        *,
        client:client_id ( id, full_name, avatar_url ),
        artisan:artisan_id ( id, full_name, avatar_url )
      `)
      .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const enriched = await Promise.all(
      (data || []).map(async (conv) => {
        const other = conv.client_id === user.id ? conv.artisan : conv.client
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

    if (error) console.error(error)
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