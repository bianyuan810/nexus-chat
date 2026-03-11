import { readBody } from "h3";
import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
// import type { Database } from '@/types/supabase'
// import { Database } from "@/types/database.types";
import type{ Database } from '@@/types/supabase';
// 定义SQL表结构对应的类型
type User = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
};

type Conversation = {
  id: string;
  name: string | null;
  type: "private" | "group";
  created_at: string;
};

type _Member = {
  id: string;
  user_id: string;
  conversation_id: string;
  role: "admin" | "member";
  created_at: string;
};

type ConversationWithMembers = {
  conversation_id: string;
  conversation: Conversation | null;
};

type MemberWithUserId = {
  user_id: string;
};

type NewConversation = {
  id: string;
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
          code: "UNAUTHORIZED",
          message: "User ID is missing",
        },
      };
    }

    // Get contact ID from request body
    const body = await readBody(event);
    const contactId = body.contact_id;

    if (!contactId || typeof contactId !== "string") {
      return {
        ok: false,
        error: {
          code: "INVALID_CONTACT_ID",
          message: "Contact ID is required",
        },
      };
    }

    // Check if contact exists
    const { data: contact, error: contactError } = await supabase
      .from("users")
      .select("id, name, email, avatar_url")
      .eq("id", contactId)
      .single();

    if (contactError || !contact) {
      return {
        ok: false,
        error: {
          code: "CONTACT_NOT_FOUND",
          message: "Contact not found",
        },
      };
    }

    const contactData = contact as User;

    // Check if conversation already exists between the two users
    const { data: existingConversations, error: conversationsError } =
      await supabase
        .from("members")
        .select(
          `
        conversation_id,
        conversation:conversations(
          id,
          type
        )
      `,
        )
        .eq("user_id", user.sub);

    if (conversationsError) {
      return {
        ok: false,
        error: {
          code: "DATABASE_ERROR",
          message: conversationsError.message,
        },
      };
    }

    let conversationId: string | null = null;

    // Check if there's a private conversation with the contact
    for (const member of existingConversations as ConversationWithMembers[]) {
      if (member.conversation && member.conversation.type === "private") {
        const { data: otherMembers, error: membersError } = await supabase
          .from("members")
          .select("user_id")
          .eq("conversation_id", member.conversation_id)
          .neq("user_id", user.sub);

        if (!membersError && otherMembers && otherMembers.length === 1) {
          const firstMember = otherMembers[0] as unknown as MemberWithUserId;
          if (firstMember && firstMember.user_id === contactId) {
            conversationId = member.conversation_id;
            break;
          }
        }
      }
    }

    // If conversation doesn't exist, create a new one
    if (!conversationId) {
      const { data: newConversation, error: createConversationError } =
        await supabase
          .from("conversations")
          .insert({
            type: "private",
            name: null,
          })
          .select("id")
          .single();

      if (createConversationError || !newConversation) {
        return {
          ok: false,
          error: {
            code: "DATABASE_ERROR",
            message:
              createConversationError?.message ||
              "Failed to create conversation",
          },
        };
      }

      conversationId = (newConversation as NewConversation).id;
    }

    // Add both users as members of the conversation if they're not already
    // Use transaction to ensure atomicity
    const { error: transactionError } = await supabase.from("members").upsert(
      [
        {
          user_id: user.sub,
          conversation_id: conversationId,
          role: "member" as const,
        },
        {
          user_id: contactId,
          conversation_id: conversationId,
          role: "member" as const,
        },
      ],
      { onConflict: "user_id,conversation_id" },
    );

    if (transactionError) {
      return {
        ok: false,
        error: {
          code: "DATABASE_ERROR",
          message: transactionError.message,
        },
      };
    }

    return {
      ok: true,
      data: {
        contact: {
          id: contactData.id,
          name: contactData.name,
          email: contactData.email,
          avatar_url: contactData.avatar_url,
        },
        conversation_id: conversationId,
      },
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
