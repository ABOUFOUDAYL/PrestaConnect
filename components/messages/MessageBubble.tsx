'use client'

import { useEffect, useState } from 'react'
import { Check, CheckCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Message } from '@/types/messages'

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null)
    })
  }, [])

  const isOwn = currentUserId === (message.sender_id || message.auteur_id)
  const content = message.content || message.texte || ''

  const time = new Date(message.created_at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
        isOwn
          ? 'bg-primary-500 text-white rounded-br-sm'
          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
      }`}>
        <p className="leading-relaxed">{content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isOwn ? 'text-primary-100' : 'text-gray-400'}`}>
            {time}
          </span>
          {isOwn && (
            message.lu
              ? <CheckCheck size={13} className="text-primary-100" />
              : <Check size={13} className="text-primary-200" />
          )}
        </div>
      </div>
    </div>
  )
}