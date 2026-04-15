DO $$
BEGIN
    ALTER TYPE "public"."enum_visa_mock_interviews_status" ADD VALUE IF NOT EXISTS 'Failed';
EXCEPTION
    WHEN undefined_object THEN
        -- Enum type does not exist yet in this environment; table creation will define it later.
        NULL;
END $$;
