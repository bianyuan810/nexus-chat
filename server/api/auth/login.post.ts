import { readBody } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'
export default defineEventHandler(async (event) => {
  const supabaseService = serverSupabaseServiceRole(event)
  
  try {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
      return {
        ok: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email and password are required'
        }
      }
    }

    // Sign in with email and password
    const { data, error } = await supabaseService.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return {
        ok: false,
        error: {
          code: 'AUTH_ERROR',
          message: error.message
        }
      }
    }

    // Get user from database
    const { data: userData, error: userError } = await supabaseService  
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError) {
      return {
        ok: false,
        error: {
          code: 'DATABASE_ERROR',
          message: userError.message
        }
      }
    }

    return {
      ok: true,
      data: {
        user: userData,
        token: data.session?.access_token,
        refresh_token: data.session?.refresh_token
      }
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
