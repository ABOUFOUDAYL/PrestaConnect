export type NotificationType =
  | 'nouveau_message'
  | 'reponse_demande'
  | 'deblocage_contact'
  | 'validation_profil'
  | 'validation_document'
  | 'rejet_document'
  | 'systeme'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  is_read: boolean
  data: Record<string, unknown> | null
  created_at: string
}