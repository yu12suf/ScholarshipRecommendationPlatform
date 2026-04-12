const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'eaps',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

async function createCommunityTables() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    console.log('Creating community_groups table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS community_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        avatar VARCHAR(500),
        type VARCHAR(20) NOT NULL DEFAULT 'group',
        privacy VARCHAR(20) NOT NULL DEFAULT 'public',
        created_by INTEGER NOT NULL,
        invite_link VARCHAR(50) UNIQUE,
        member_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Creating community_members table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS community_members (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'member',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(group_id, user_id, status)
      )
    `);

    console.log('Creating community_messages table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS community_messages (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        message_type VARCHAR(20) NOT NULL DEFAULT 'text',
        attachment_url VARCHAR(500),
        attachment_name VARCHAR(255),
        is_pinned BOOLEAN NOT NULL DEFAULT false,
        is_edited BOOLEAN NOT NULL DEFAULT false,
        reply_to_id INTEGER,
        reactions_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Creating community_message_reactions table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS community_message_reactions (
        id SERIAL PRIMARY KEY,
        message_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(message_id, user_id, emoji)
      )
    `);

    console.log('Adding foreign keys...');
    await sequelize.query(`ALTER TABLE community_groups ADD CONSTRAINT fk_cg_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE`);
    await sequelize.query(`ALTER TABLE community_members ADD CONSTRAINT fk_cm_group FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE`);
    await sequelize.query(`ALTER TABLE community_members ADD CONSTRAINT fk_cm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`);
    await sequelize.query(`ALTER TABLE community_messages ADD CONSTRAINT fk_msg_group FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE`);
    await sequelize.query(`ALTER TABLE community_messages ADD CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE`);
    await sequelize.query(`ALTER TABLE community_message_reactions ADD CONSTRAINT fk_react_msg FOREIGN KEY (message_id) REFERENCES community_messages(id) ON DELETE CASCADE`);
    await sequelize.query(`ALTER TABLE community_message_reactions ADD CONSTRAINT fk_react_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`);

    console.log('Creating indexes...');
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_cg_active ON community_groups(is_active)`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_cm_group ON community_members(group_id)`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_cm_user ON community_members(user_id)`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_msg_group ON community_messages(group_id)`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_msg_sender ON community_messages(sender_id)`);

    console.log('\n✅ All community tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createCommunityTables();