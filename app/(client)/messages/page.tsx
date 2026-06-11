'use client'

import { useState } from 'react'
import { useConversations } from '@/hooks/useMessages'
import ConversationList from '@/components/messages/ConversationList'
import ChatWindow from '@/components/messages/ChatWindow'

export default function MessagesPage() {
  const { conversations, loading, refetch } = useConversations()
  const [selectedId, setSelectedId] = useState<string | null>(null)

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