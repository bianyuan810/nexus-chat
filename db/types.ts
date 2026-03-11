export type ConversationType = 'private' | 'group'
export type MemberRole = 'admin' | 'member'

export interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  created_at: string
}

export interface Conversation {
  id: string
  name?: string
  type: ConversationType
  created_at: string
}

export interface Member {
  id: string
  user_id: string
  conversation_id: string
  role: MemberRole
  created_at: string
}

export interface Message {
  id: string
  content: string
  user_id: string
  conversation_id: string
  reply_to_id?: string
  created_at: string
  user?: User
}

export interface MessageReadStatus {
  id: string
  message_id: string
  user_id: string
  read_at: string
}

export interface MessageMention {
  id: string
  message_id: string
  user_id: string
  created_at: string
}
