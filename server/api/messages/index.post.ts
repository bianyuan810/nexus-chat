import { readBody } from 'h3'
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

    const body = await readBody(event)
    const { content, conversation_id } = body

    if (!content || !conversation_id) {
      return {
        ok: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Content and conversation_id are required'
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

    // Insert message into database
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        content,
        user_id: user.sub,
        conversation_id
      })
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
      .single()

    if (messageError) {
      return {
        ok: false,
        error: {
          code: 'DATABASE_ERROR',
          message: messageError.message
        }
      }
    }

    return {
      ok: true,
      data: message
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
