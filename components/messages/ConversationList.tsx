'use client'

import Image from 'next/image'
import type { Conversation } from '@/types/messages'

interface Props {
  conversations: Conversation[]
  loading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function ConversationList({ conversations, loading, selectedId, onSelect }: Props) {
  return (
    <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
            <p>Aucune conversation</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left ${
                selectedId === conv.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                {conv.other_user?.avatar_url ? (
                  <Image
                    src={conv.other_user.avatar_url}
                    alt={conv.other_user.full_name || ''}
                    width={44}
                    height={44}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {conv.other_user?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                {(conv.unread_count || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conv.unread_count}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-gray-900 text-sm truncate">
                    {conv.other_user?.full_name || 'Utilisateur'}
                  </span>
                  {conv.last_message_at && (
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {new Date(conv.last_message_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate ${
                  (conv.unread_count || 0) > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {conv.last_message || 'Démarrer la conversation'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}