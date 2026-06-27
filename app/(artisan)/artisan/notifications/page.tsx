'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell, FileText, Send, MessageCircle, Wallet, CheckCheck } from 'lucide-react'

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  demande: { icon: FileText, color: '#2563eb', bg: '#eff6ff' },
  devis: { icon: Send, color: '#f97316', bg: '#fff7ed' },
  message: { icon: MessageCircle, color: '#16a34a', bg: '#f0fdf4' },
  paiement: { icon: Wallet, color: '#ca8a04', bg: '#fefce8' },
}

const DEFAULT_CONFIG = { icon: Bell, color: '#64748b', bg: '#f1f5f9' }

export default function ArtisanNotificationsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setNotifications(data || [])
      setIsLoading(false)
    }
    load()
  }, [])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffH = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffH / 24)

    if (diffMin < 1) return 'A l\'instant'
    if (diffMin < 60) return `Il y a ${diffMin} min`
    if (diffH < 24) return `Il y a ${diffH}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ color: '#64748b', marginTop: '16px' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Notifications</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount !== 1 ? 's' : ''}` : 'Tout est lu'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px',
              padding: '8px 14px', fontSize: '13px', fontWeight: 600, color: '#475569',
              cursor: 'pointer',
            }}
          >
            <CheckCheck size={15} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '40px', textAlign: 'center' }}>
          <Bell size={32} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Aucune notification</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {notifications.map((n) => {
            const config = TYPE_CONFIG[n.type] || DEFAULT_CONFIG
            const Icon = config.icon

            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markAsRead(n.id)}
                style={{
                  background: n.is_read ? 'white' : '#fffbf5',
                  borderRadius: '14px',
                  border: n.is_read ? '1px solid #f1f5f9' : '1px solid #fde8d4',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  cursor: n.is_read ? 'default' : 'pointer',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: config.bg, color: config.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {n.title}
                    </p>
                    <span style={{ fontSize: '11px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                      {formatDate(n.created_at)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                </div>

                {!n.is_read && (
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#f97316', flexShrink: 0, marginTop: '6px',
                  }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}