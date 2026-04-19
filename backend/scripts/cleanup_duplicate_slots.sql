-- Clean up duplicate availability slots
-- Only removes AVAILABLE slots that are not referenced by any booking
-- Keeps all booked slots even if they are duplicates (maintains referential integrity)

-- First, let's see what duplicates exist
SELECT counselor_id, start_time, end_time, COUNT(*) as count, 
       ARRAY_AGG(id ORDER BY id) as slot_ids,
       ARRAY_AGG(status ORDER BY id) as statuses
FROM availability_slots
GROUP BY counselor_id, start_time, end_time
HAVING COUNT(*) > 1
ORDER BY counselor_id, start_time;

-- Then delete duplicates, keeping the oldest (lowest id) available slot
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

-- Verify cleanup
SELECT counselor_id, start_time, end_time, COUNT(*) as count
FROM availability_slots
GROUP BY counselor_id, start_time, end_time
HAVING COUNT(*) > 1;
