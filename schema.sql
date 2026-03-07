-- Nexus Chat Database Schema
-- Design for Supabase (PostgreSQL)

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE conversation_type AS ENUM ('private', 'group');
CREATE TYPE member_role AS ENUM ('admin', 'member');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS policy for users: users can only access their own data
CREATE POLICY "Users can only access their own data" ON users
    FOR ALL USING (id = auth.uid());

-- Create index on users email
CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    type conversation_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CHECK (
        (type = 'private' AND name IS NULL) OR
        (type = 'group' AND name IS NOT NULL)
    )
);

-- Enable RLS for conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS policy for conversations: users can only access conversations they are members of
CREATE POLICY "Users can only access their own conversations" ON conversations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.conversation_id = conversations.id
            AND members.user_id = auth.uid()
        )
    );

-- Members table (join table between users and conversations)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role member_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, conversation_id)
);

-- Enable RLS for members table
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- RLS policy for members: users can view their own memberships
CREATE POLICY "Users can view their own memberships" ON members
    FOR SELECT USING (user_id = auth.uid());

-- RLS policy for members: admins can manage group members
CREATE POLICY "Admins can manage group members" ON members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members m
            WHERE m.conversation_id = members.conversation_id
            AND m.user_id = auth.uid()
            AND m.role = 'admin'
        )
    );

-- Create index on members table
CREATE INDEX IF NOT EXISTS idx_members_user_conversation
    ON members(user_id, conversation_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policy for messages: users can only access messages in conversations they are members of
CREATE POLICY "Users can only access messages in their conversations" ON messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.conversation_id = messages.conversation_id
            AND members.user_id = auth.uid()
        )
    );

-- Create composite index on messages table for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at
    ON messages(conversation_id, created_at);

-- Message read status table
CREATE TABLE IF NOT EXISTS message_read_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- Enable RLS for message_read_status table
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;

-- RLS policy for message_read_status: users can only access their own read status
CREATE POLICY "Users can only access their own read status" ON message_read_status
    FOR ALL USING (user_id = auth.uid());

-- Message mentions table
CREATE TABLE IF NOT EXISTS message_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for message_mentions table
ALTER TABLE message_mentions ENABLE ROW LEVEL SECURITY;

-- RLS policy for message_mentions: users can only access mentions in their conversations
CREATE POLICY "Users can only access mentions in their conversations" ON message_mentions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN members mem ON m.conversation_id = mem.conversation_id
            WHERE m.id = message_mentions.message_id
            AND mem.user_id = auth.uid()
        )
    );

-- Grant necessary permissions to authenticated users
GRANT ALL ON users TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON members TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON message_read_status TO authenticated;
GRANT ALL ON message_mentions TO authenticated;

-- Grant read permissions to public users (if needed)
GRANT SELECT ON users TO public;
