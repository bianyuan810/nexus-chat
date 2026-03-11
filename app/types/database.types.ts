export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          name: string | null
          type: 'private' | 'group'
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          type: 'private' | 'group'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          type?: 'private' | 'group'
          created_at?: string
        }
      }
      members: {
        Row: {
          id: string
          user_id: string
          conversation_id: string
          role: 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          conversation_id: string
          role: 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          conversation_id?: string
          role?: 'admin' | 'member'
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          user_id: string
          conversation_id: string
          reply_to_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          content: string
          user_id: string
          conversation_id: string
          reply_to_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          conversation_id?: string
          reply_to_id?: string | null
          created_at?: string
        }
      }
      message_read_status: {
        Row: {
          id: string
          message_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          id: string
          message_id: string
          user_id: string
          read_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          read_at?: string
        }
      }
      message_mentions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id: string
          message_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      conversation_type: 'private' | 'group'
      member_role: 'admin' | 'member'
    }
  }
}
