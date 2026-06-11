'use client'

import type { Message } from '@/types/messages'
import MessageBubble from './MessageBubble'

interface Props {
  messages: Message[]
  loading: boolean
}

export default function MessageThread({ messages, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        <p>Aucun message. Démarrez la conversation !</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  )
}