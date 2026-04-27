-- Update counselor_payouts table with new fields
ALTER TABLE counselor_payouts 
  ALTER COLUMN status TYPE VARCHAR(20),
  ALTER COLUMN status SET DEFAULT 'pending';

-- Add new columns to counselor_payouts
ALTER TABLE counselor_payouts 
  ADD COLUMN IF NOT EXISTS payout_method VARCHAR(50),
  ADD COLUMN IF NOT EXISTS payout_details JSONB,
  ADD COLUMN IF NOT EXISTS admin_note TEXT;

-- For existing records (if any), set a default payout_method
UPDATE counselor_payouts SET payout_method = 'bank_transfer' WHERE payout_method IS NULL;
ALTER TABLE counselor_payouts ALTER COLUMN payout_method SET NOT NULL;
ALTER TABLE counselor_payouts ALTER COLUMN payout_details SET NOT NULL;
