import { Pool } from 'pg';
import dbConfig from '../src/config/configs.js';

async function forceMergeDuplicates() {
  const pool = new Pool(dbConfig);
  const client = await pool.connect();

  try {
    console.log('🔍 Finding all duplicate groups...\n');
    
    // Find all duplicates
    const dupResult = await client.query(`
      SELECT 
        counselor_id, 
        start_time, 
        end_time, 
        COUNT(*) as cnt,
        ARRAY_AGG(id ORDER BY id) as ids
      FROM availability_slots
      GROUP BY counselor_id, start_time, end_time
      HAVING COUNT(*) > 1
      ORDER BY counselor_id, start_time;
    `);

    const duplicates = dupResult.rows;
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found in database.');
      return;
    }

    console.log(`Found ${duplicates.length} duplicate group(s):\n`);
    
    for (const group of duplicates) {
      const { counselor_id, start_time, end_time, ids } = group;
      const sortedIds = [...ids].sort((a, b) => a - b);
      const keepId = sortedIds[0];
      const deleteIds = sortedIds.slice(1);

      console.log(`Group: counselor=${counselor_id}, start=${start_time}, end=${end_time}`);
      console.log(`  Keep: id=${keepId}`);
      console.log(`  Delete: ${deleteIds.join(', ')}`);

      // Check booking references on deleteIds
      const bookingCheck = await client.query(`
        SELECT 
          b.id as booking_id,
          b.student_id,
          b.status,
          b.slot_id as old_slot_id
        FROM bookings b
        WHERE b.slot_id = ANY($1)
        ORDER BY b.id
      `, [deleteIds]);

      if (bookingCheck.rows.length > 0) {
        console.log(`  ⚠️  Found ${bookingCheck.rows.length} booking(s) on duplicates:`);
        for (const booking of bookingCheck.rows) {
          console.log(`    Booking #${booking.booking_id} (student=${booking.student_id}, status=${booking.status})`);
        }

        console.log(`  → Reassigning these ${bookingCheck.rows.length} booking(s) to slot ${keepId}...`);
        
        await client.query(`
          UPDATE bookings 
          SET slot_id = $1 
          WHERE slot_id = ANY($2)
        `, [keepId, deleteIds]);
        
        console.log(`  ✅ Bookings reassigned to slot ${keepId}`);
      }

      // Now delete duplicates (no longer referenced)
      const delResult = await client.query(`
        DELETE FROM availability_slots 
        WHERE id = ANY($1)
        RETURNING id
      `, [deleteIds]);
      
      console.log(`  ✅ Deleted ${delResult.rows.length} duplicate slot(s)\n`);
    }

    // Final verification
    const verifyResult = await client.query(`
      SELECT counselor_id, start_time, end_time, COUNT(*) as cnt
      FROM availability_slots
      GROUP BY counselor_id, start_time, end_time
      HAVING COUNT(*) > 1;
    `);

    if (verifyResult.rows.length === 0) {
      console.log('✅ All duplicates successfully merged/removed.\n');
      
      // Try to create index
      try {
        await client.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_slots_unique 
          ON availability_slots (counselor_id, start_time, end_time);
        `);
        console.log('✅ Unique index created successfully.');
        console.log('\n🎉 Cleanup complete!');
      } catch (idxErr) {
        if (idxErr.code === '42P07') {
          console.log('✅ Index already exists.');
          console.log('\n🎉 Cleanup complete!');
        } else {
          console.error('❌ Index creation failed:', idxErr.message);
        }
      }
    } else {
      console.log('⚠️  Some duplicates remain (unexpected):');
      console.table(verifyResult.rows);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

forceMergeDuplicates().catch(console.error);