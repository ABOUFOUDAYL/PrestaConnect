'use client'

import { MessageCircle, ClipboardList, Unlock, CheckCircle2, FileText, XCircle, Bell } from 'lucide-react'
import type { Notification, NotificationType } from '@/types/notifications'

interface Props {
  notification: Notification
  onRead: (id: string) => void
}

const icons: Record<NotificationType, React.ElementType> = {
  nouveau_message: MessageCircle,
  reponse_demande: ClipboardList,
  deblocage_contact: Unlock,
  validation_profil: CheckCircle2,
  validation_document: FileText,
  rejet_document: XCircle,
  systeme: Bell,
}

const colors: Record<NotificationType, string> = {
  nouveau_message: 'bg-primary-50 border-primary-100 text-primary-600',
  reponse_demande: 'bg-purple-50 border-purple-100 text-purple-600',
  deblocage_contact: 'bg-green-50 border-green-100 text-green-600',
  validation_profil: 'bg-green-50 border-green-100 text-green-600',
  validation_document: 'bg-green-50 border-green-100 text-green-600',
  rejet_document: 'bg-red-50 border-red-100 text-red-600',
  systeme: 'bg-gray-50 border-gray-100 text-gray-600',
}

export default function NotificationItem({ notification, onRead }: Props) {
  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return "À l'instant"
    if (mins < 60) return `Il y a ${mins} min`
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${days}j`
  }

  const Icon = icons[notification.type]

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
        !notification.is_read ? 'bg-primary-50/50' : ''
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${
        colors[notification.type]
      }`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
          )}
        </div>
        {notification.message && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.created_at)}</p>
      </div>
    </button>
  )
}