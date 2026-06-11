export interface Conversation {
    id: string
    client_id: string
    artisan_id: string
    created_at: string
    updated_at: string
    last_message: string | null
    last_message_at: string | null
    other_user?: {
      id: string
      full_name: string | null
      avatar_url: string | null
    }
    unread_count?: number
  }
  
  export interface Message {
    id: string
    conversation_id: string
    sender_id: string
    auteur_id: string
    content: string | null
    texte: string | null
    lu: boolean
    created_at: string
    updated_at: string | null
    topic: string | null
    extension: string | null
    payload: Record<string, unknown> | null
    event: string | null
    private: boolean | null
  }
  
  export interface SendMessagePayload {
    conversation_id: string
    content: string
  }