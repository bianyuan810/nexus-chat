import { readBody } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supabaseService = serverSupabaseServiceRole(event);
  try {
    const body = await readBody(event);
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return {
        ok: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Email, password, and name are required",
        },
      };
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseService.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return {
        ok: false,
        error: {
          code: "AUTH_ERROR",
          message:
            authError.message || "Failed to create user in Supabase Auth",
          details: authError,
        },
      };
    }

    // Create user in users table
    const { data: userData, error: userError } = await supabaseService
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        name,
      })
      .select()
      .single();

    if (userError) {
      // If user creation fails, delete the auth user
      await supabaseService.auth.admin.deleteUser(authData.user.id);
      return {
        ok: false,
        error: {
          code: "DATABASE_ERROR",
          message: userError.message,
        },
      };
    }

    return {
      ok: true,
      data: {
        user: userData,
        token: "",
      },
    };
  } catch  {
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    };
  }
});
