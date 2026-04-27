-- Add escrow_status to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS escrow_status VARCHAR(20) DEFAULT 'pending';

-- Add unique constraint to counselor_reviews to prevent duplicate releases
ALTER TABLE counselor_reviews ADD CONSTRAINT unique_booking_review UNIQUE (booking_id);
