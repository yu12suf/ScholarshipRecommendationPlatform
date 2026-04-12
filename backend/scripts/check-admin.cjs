const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password123',
  database: 'EAPS'
});

async function checkAdmin() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, email, role, is_active 
      FROM users 
      WHERE email = 'adminscholarship@gmail.com'
    `);
    
    if (result.rows.length > 0) {
      console.log('Admin found:', result.rows[0]);
    } else {
      console.log('No admin. Creating...');
      const hash = await bcrypt.hash('Admin12345@Scholarship', 10);
      await client.query(`
        INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
        VALUES ('Admin', 'adminscholarship@gmail.com', $1, 'admin', true, NOW(), NOW())
      `, [hash]);
      console.log('Admin created!');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

checkAdmin().catch(console.error).finally(() => process.exit());