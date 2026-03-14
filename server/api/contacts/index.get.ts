import {  serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

type ConversationMember = {
  conversation_id: string
  conversation: {
    id: string
    type: string
    name: string | null
  }
}

type UserMember = {
  user_id: string
  user: {
    id: string
    name: string | null
    email: string
    avatar_url: string | null
  }
}

type Contact = {
  id: string
  name: string | null
  email: string
  avatar_url: string | null
  conversation_id: string
  conversation_type: string
  conversation_name: string | null
  last_message: {
    content: string
    created_at: string
    user_id: string
  } | null
}

export default defineEventHandler(async (event) => {

  
  try {
    const user = await serverSupabaseUser(event)
    const supabase = await serverSupabaseServiceRole(event)

    if (!user) {
      return {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        }
      }
    }

    // Get all conversations the user is part of
    if (!user.sub) {
      return {
        ok: false,
        error: {
          code: 'INVALID_USER_ID',
          message: 'User ID is missing'
        }
      }
    }
    
    const { data: conversations, error: conversationsError } = await supabase
      .from('members')
      .select(`
        conversation_id,
        conversation:conversations(
          id,
          type,
          name
        )
      `)
      .eq('user_id', user.sub)

    if (conversationsError) {
      return {
        ok: false,
        error: {
          code: 'DATABASE_ERROR',
          message: conversationsError.message
        }
      }
    }

    // For each conversation, get the other members (contacts)
    const contacts: Contact[] = []
    
    for (const member of conversations as ConversationMember[]) {
      const { data: otherMembers, error: membersError } = await supabase
        .from('members')
        .select(`
          user_id,
          user:users(
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('conversation_id', member.conversation_id)
        .neq('user_id', user.sub)

      if (membersError) {
        continue
      }

      // For group conversations, add all other members as contacts
      // For private conversations, add the single other member
      for (const otherMember of otherMembers as UserMember[]) {
        if (otherMember.user) {
          // Get the last message for this conversation
          const { data: lastMessage, error: messageError } = await supabase
            .from('messages')
            .select('content, created_at, user_id')
            .eq('conversation_id', member.conversation_id)
            .order('created_at', { ascending: false })
            .limit(1)

          contacts.push({
            id: otherMember.user.id,
            name: otherMember.user.name,
            email: otherMember.user.email,
            avatar_url: otherMember.user.avatar_url,
            conversation_id: member.conversation_id,
            conversation_type: member.conversation.type,
            conversation_name: member.conversation.name,
            last_message: messageError ? null : lastMessage[0] || null
          })
        }
      }
    }

    // Remove duplicates (same contact in multiple conversations)
    const uniqueContacts = contacts.filter((contact, index, self) =>
      index === self.findIndex(c => c.id === contact.id)
    )

    // Sort contacts by name
    uniqueContacts.sort((a, b) => {
      const nameA = a.name || a.email
      const nameB = b.name || b.email
      return nameA.localeCompare(nameB)
    })

    return {
      ok: true,
      data: uniqueContacts
    }
  } catch {
    return {
      ok: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    }
  }
})
