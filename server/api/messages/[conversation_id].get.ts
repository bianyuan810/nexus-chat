import { getQuery, getRouterParam } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
export default defineEventHandler(async (event) => {

  
  try {
    const user = await serverSupabaseUser(event)
    const supabase = await serverSupabaseClient(event)

    if (!user) {
      return {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        }
      }
    }
    
    if (!user.sub) {
      return {
        ok: false,
        error: {
          code: 'INVALID_USER_ID',
          message: 'User ID is missing'
        }
      }
    }

   const conversation_id = getRouterParam(event, 'conversation_id')
    const { page = 1, limit = 50 } = getQuery(event)

    if (!conversation_id) {
      return {
        ok: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'conversation_id is required'
        }
      }
    }

    // Check if user is a member of the conversation
    const { data: membership, error: membershipError } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.sub)
      .eq('conversation_id', conversation_id)
      .single()

    if (membershipError) {
      return {
        ok: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not a member of this conversation'
        }
      }
    }

    // Calculate offset for pagination
    const offset = (Number(page) - 1) * Number(limit)

    // Get messages with pagination
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        user_id,
        conversation_id,
        created_at,
        user:users(
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    if (messagesError) {
      return {
        ok: false,
        error: {
          code: 'DATABASE_ERROR',
          message: messagesError.message
        }
      }
    }

    // Reverse messages to show oldest first
    const reversedMessages = messages.reverse()

    return {
      ok: true,
      data: reversedMessages
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    }
  }
})
