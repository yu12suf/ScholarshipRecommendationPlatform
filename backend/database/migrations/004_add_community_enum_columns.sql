-- Add missing enum columns to community tables
-- These columns will be converted to proper ENUM types by sequelize.ts migrateToEnum on startup

-- Add message_type to community_messages (VARCHAR initially, will be converted to ENUM)
ALTER TABLE community_messages
    ADD COLUMN IF NOT EXISTS message_type VARCHAR(50) DEFAULT 'text' NOT NULL;

-- Add type to community_groups (VARCHAR initially, will be converted to ENUM)
ALTER TABLE community_groups
    ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'group' NOT NULL;

-- Add role to community_members (VARCHAR initially, will be converted to ENUM)
ALTER TABLE community_members
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member' NOT NULL;
