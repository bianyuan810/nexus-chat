import {  serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import type { Database } from "@@/types/supabase";
type User = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
};

export default defineEventHandler(async (event) => {
  
  try {
    const user = await serverSupabaseUser(event);
    const supabase = await serverSupabaseServiceRole<Database>(event);

    if (!user) {
      return {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      };
    }

    if (!user.sub) {
      return {
        ok: false,
        error: {
          code: "INVALID_USER_ID",
          message: "User ID is missing",
        },
      };
    }

    // Get search parameters from query
    const { query } = getQuery(event);

    if (!query || typeof query !== "string") {
      return {
        ok: false,
        error: {
          code: "INVALID_QUERY",
          message: "Search query is required",
        },
      };
    }

    // Use parameterized query to prevent SQL injection
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, avatar_url")
      .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
      .neq("id", user.sub)
      .limit(10);

    if (error) {
      return {
        ok: false,
        error: {
          code: "DATABASE_ERROR",
          message: error.message,
        },
      };
    }

    return {
      ok: true,
      data: users as User[],
    };
  } catch {
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    };
  }
});
