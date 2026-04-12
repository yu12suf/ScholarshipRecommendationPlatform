-- Add add_members_permission column to community_groups table
ALTER TABLE community_groups ADD COLUMN IF NOT EXISTS add_members_permission VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (add_members_permission IN ('admin', 'all'));

-- Also update existing groups to ensure they have the permission set
UPDATE community_groups SET add_members_permission = 'admin' WHERE add_members_permission IS NULL;

-- Verify the table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'community_groups' AND column_name = 'add_members_permission';
