-- Community Tables Migration
-- Run this script to create the community tables

-- Community Groups table
CREATE TABLE IF NOT EXISTS community_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar VARCHAR(500),
    type VARCHAR(20) NOT NULL DEFAULT 'group' CHECK (type IN ('group', 'channel')),
    privacy VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
    created_by INTEGER NOT NULL,
    invite_link VARCHAR(50) UNIQUE,
    member_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    add_members_permission VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (add_members_permission IN ('admin', 'all')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community Members table
CREATE TABLE IF NOT EXISTS community_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, user_id, status)
);

-- Community Messages table
CREATE TABLE IF NOT EXISTS community_messages (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'link')),
    attachment_url VARCHAR(500),
    attachment_name VARCHAR(255),
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_edited BOOLEAN NOT NULL DEFAULT false,
    reply_to_id INTEGER,
    reactions_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community Message Reactions table
CREATE TABLE IF NOT EXISTS community_message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Add foreign key constraints
ALTER TABLE community_groups ADD CONSTRAINT fk_community_groups_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE community_members ADD CONSTRAINT fk_community_members_group_id FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE;
ALTER TABLE community_members ADD CONSTRAINT fk_community_members_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE community_messages ADD CONSTRAINT fk_community_messages_group_id FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE;
ALTER TABLE community_messages ADD CONSTRAINT fk_community_messages_sender_id FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE community_message_reactions ADD CONSTRAINT fk_community_message_reactions_message_id FOREIGN KEY (message_id) REFERENCES community_messages(id) ON DELETE CASCADE;
ALTER TABLE community_message_reactions ADD CONSTRAINT fk_community_message_reactions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_groups_is_active ON community_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_community_groups_created_by ON community_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_community_members_group_id ON community_members(group_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_status ON community_members(status);
CREATE INDEX IF NOT EXISTS idx_community_messages_group_id ON community_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_sender_id ON community_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_community_message_reactions_message_id ON community_message_reactions(message_id);

SELECT 'Community tables created successfully!' as result;