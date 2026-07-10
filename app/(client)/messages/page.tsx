'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useConversations, getOrCreateConversation } from '@/hooks/useMessages'
import ConversationList from '@/components/messages/ConversationList'
import ChatWindow from '@/components/messages/ChatWindow'

export default function MessagesPage() {
  const { conversations, loading, refetch } = useConversations()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const artisanId = searchParams.get('with')

  useEffect(() => {
    if (!artisanId) return

    const openConversation = async () => {
      const conversationId = await getOrCreateConversation(artisanId)
      if (conversationId) {
        await refetch()
        setSelectedId(conversationId)
      }
    }

    openConversation()
  }, [artisanId])

  const selectedConversation = conversations.find(c => c.id === selectedId) || null

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white rounded-xl border border-gray-200">
      <ConversationList
        conversations={conversations}
        loading={loading}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
      />
      <ChatWindow
        conversation={selectedConversation}
        onMessageSent={refetch}
      />
    </div>
  )
}