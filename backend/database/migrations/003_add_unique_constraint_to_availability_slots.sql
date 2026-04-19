-- Add unique constraint to availability_slots
-- This prevents duplicate slots for the same counselor at the same time

-- First, clean up any existing duplicates (keeping the oldest record)
DELETE FROM availability_slots a1
WHERE EXISTS (
    SELECT 1 FROM availability_slots a2
    WHERE a2.counselor_id = a1.counselor_id
      AND a2.start_time = a1.start_time
      AND a2.end_time = a1.end_time
      AND a2.id < a1.id
)
AND a1.status = 'available'
AND a1.id NOT IN (SELECT slot_id FROM bookings);

-- Add unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_slots_unique 
ON availability_slots (counselor_id, start_time, end_time);
