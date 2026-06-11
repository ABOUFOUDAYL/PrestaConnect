'use client'

import { useEffect, useRef } from 'react'
import { useMessages } from '@/hooks/useMessages'
import type { Conversation } from '@/types/messages'
import MessageBubble from '@/components/messages/MessageBubble'
import MessageInput from '@/components/messages/MessageInput'

interface Props {
  conversation: Conversation | null
  onMessageSent: () => void
}

export default function ChatWindow({ conversation, onMessageSent }: Props) {
  const { messages, loading, sendMessage, markAsRead } = useMessages(conversation?.id || null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (conversation?.id) markAsRead()
  }, [conversation?.id, messages.length, markAsRead])

  const handleSend = async (content: string) => {
    await sendMessage(content)
    onMessageSent()
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <p className="text-sm">Sélectionnez une conversation</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
        {conversation.other_user?.avatar_url ? (
          <img
            src={conversation.other_user.avatar_url}
            alt={conversation.other_user.full_name || ''}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
            {conversation.other_user?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {conversation.other_user?.full_name || 'Utilisateur'}
          </p>
          <p className="text-xs text-gray-400">En ligne</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <p>Aucun message. Démarrez la conversation !</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  )
}