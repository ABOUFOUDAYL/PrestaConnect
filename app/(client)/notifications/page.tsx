'use client'

import { useNotifications } from '@/hooks/useNotifications'
import NotificationItem from '@/components/notifications/NotificationItem'

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <p className="text-sm">Aucune notification pour le moment</p>
          </div>
        ) : (
          notifications.map(n => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={markAsRead}
            />
          ))
        )}
      </div>
    </div>
  )
}