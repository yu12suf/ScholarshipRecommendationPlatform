import { pool } from './database/database.js';

async function checkCounselors() {
  try {
    const result = await pool.query(`
      SELECT c.id, c.verification_status, c.is_active, u.name, u.email, u.role 
      FROM counselors c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.verification_status = 'verified' AND c.is_active = true
    `);
    console.log('Verified & Active Counselors:', result.rows);
    
    if (result.rows.length === 0) {
      console.log('\nNo verified active counselors found. Checking all counselors:');
      const allResult = await pool.query(`
        SELECT c.id, c.verification_status, c.is_active, u.name, u.email, u.role 
        FROM counselors c 
        JOIN users u ON c.user_id = u.id
      `);
      console.log('All counselors:', allResult.rows);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkCounselors();
