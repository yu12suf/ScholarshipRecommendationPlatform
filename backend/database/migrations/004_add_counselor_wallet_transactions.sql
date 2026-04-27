CREATE TABLE IF NOT EXISTS counselor_wallet_transactions (
    id SERIAL PRIMARY KEY,
    counselor_id INTEGER NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('deposit', 'withdrawal')),
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL DEFAULT 0,
    reference VARCHAR(120) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_counselor ON counselor_wallet_transactions(counselor_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_booking ON counselor_wallet_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_payment ON counselor_wallet_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_entry_type ON counselor_wallet_transactions(entry_type);
