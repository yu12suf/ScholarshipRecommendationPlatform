-- Step 1: Find ALL duplicate (counselor_id, start_time, end_time) groups
-- regardless of status or bookings
SELECT 
    counselor_id, 
    start_time, 
    end_time, 
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY id) as all_ids,
    ARRAY_AGG(status ORDER BY id) as all_statuses,
    STRING_AGG(
        CASE 
            WHEN id IN (SELECT slot_id FROM bookings) THEN 'HAS_BOOKING'
            ELSE 'no_booking'
        END, ', ' ORDER BY id
    ) as booking_status
FROM availability_slots
GROUP BY counselor_id, start_time, end_time
HAVING COUNT(*) > 1
ORDER BY counselor_id, start_time;

-- Step 2: For safety, let's see which IDs are truly safe to delete
-- These are slots that are: 
-- 1. NOT the smallest id (we keep the earliest one)
-- 2. status = 'available'
-- 3. NOT referenced in any booking
SELECT 
    a1.id, a1.counselor_id, a1.start_time, a1.end_time, a1.status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM bookings WHERE slot_id = a1.id) 
        THEN 'REFERENCED - CANNOT DELETE'
        ELSE 'SAFE TO DELETE'
    END as safety_status
FROM availability_slots a1
WHERE EXISTS (
    SELECT 1 FROM availability_slots a2
    WHERE a2.counselor_id = a1.counselor_id
      AND a2.start_time = a1.start_time
      AND a2.end_time = a1.end_time
      AND a2.id < a1.id
)
ORDER BY a1.counselor_id, a1.start_time, a1.id;
