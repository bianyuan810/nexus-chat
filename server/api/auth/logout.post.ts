import { serverSupabaseClient } from '#supabase/server'
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        ok: false,
        error: {
          code: 'AUTH_ERROR',
          message: error.message
        }
      }
    }

    return {
      ok: true,
      data: { message: 'Successfully logged out' }
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
