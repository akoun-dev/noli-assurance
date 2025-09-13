-- Add soft delete columns to main tables

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add soft delete to users table
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Add soft delete to assures table
ALTER TABLE "assures"
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Add soft delete to insurers table
ALTER TABLE "insurers"
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Add soft delete to InsuranceOffer table
ALTER TABLE "InsuranceOffer"
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Add soft delete to Quote table
ALTER TABLE "Quote"
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Add soft delete to QuoteOffer table
ALTER TABLE "QuoteOffer"
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Create indexes for better performance on soft delete queries
CREATE INDEX IF NOT EXISTS users_deleted_at_idx ON "users" (deleted_at) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS users_is_deleted_idx ON "users" (is_deleted);

CREATE INDEX IF NOT EXISTS assures_deleted_at_idx ON "assures" (deleted_at) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS assures_is_deleted_idx ON "assures" (is_deleted);

CREATE INDEX IF NOT EXISTS insurers_deleted_at_idx ON "insurers" (deleted_at) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS insurers_is_deleted_idx ON "insurers" (is_deleted);

CREATE INDEX IF NOT EXISTS insurance_offer_deleted_at_idx ON "InsuranceOffer" (deleted_at) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS insurance_offer_is_deleted_idx ON "InsuranceOffer" (is_deleted);

CREATE INDEX IF NOT EXISTS quote_deleted_at_idx ON "Quote" (deleted_at) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS quote_is_deleted_idx ON "Quote" (is_deleted);

CREATE INDEX IF NOT EXISTS quote_offer_deleted_at_idx ON "QuoteOffer" (deleted_at) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS quote_offer_is_deleted_idx ON "QuoteOffer" (is_deleted);

-- Create function for soft delete
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = NOW();
    NEW.is_deleted = true;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function for restore
CREATE OR REPLACE FUNCTION restore()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = NULL;
    NEW.is_deleted = false;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for soft delete on each table
CREATE TRIGGER users_soft_delete
BEFORE UPDATE ON "users"
FOR EACH ROW
WHEN (OLD.is_deleted = false AND NEW.is_deleted = true)
EXECUTE FUNCTION soft_delete();

CREATE TRIGGER users_restore
BEFORE UPDATE ON "users"
FOR EACH ROW
WHEN (OLD.is_deleted = true AND NEW.is_deleted = false)
EXECUTE FUNCTION restore();

CREATE TRIGGER assures_soft_delete
BEFORE UPDATE ON "assures"
FOR EACH ROW
WHEN (OLD.is_deleted = false AND NEW.is_deleted = true)
EXECUTE FUNCTION soft_delete();

CREATE TRIGGER assures_restore
BEFORE UPDATE ON "assures"
FOR EACH ROW
WHEN (OLD.is_deleted = true AND NEW.is_deleted = false)
EXECUTE FUNCTION restore();

CREATE TRIGGER insurers_soft_delete
BEFORE UPDATE ON "insurers"
FOR EACH ROW
WHEN (OLD.is_deleted = false AND NEW.is_deleted = true)
EXECUTE FUNCTION soft_delete();

CREATE TRIGGER insurers_restore
BEFORE UPDATE ON "insurers"
FOR EACH ROW
WHEN (OLD.is_deleted = true AND NEW.is_deleted = false)
EXECUTE FUNCTION restore();

CREATE TRIGGER insurance_offer_soft_delete
BEFORE UPDATE ON "InsuranceOffer"
FOR EACH ROW
WHEN (OLD.is_deleted = false AND NEW.is_deleted = true)
EXECUTE FUNCTION soft_delete();

CREATE TRIGGER insurance_offer_restore
BEFORE UPDATE ON "InsuranceOffer"
FOR EACH ROW
WHEN (OLD.is_deleted = true AND NEW.is_deleted = false)
EXECUTE FUNCTION restore();

CREATE TRIGGER quote_soft_delete
BEFORE UPDATE ON "Quote"
FOR EACH ROW
WHEN (OLD.is_deleted = false AND NEW.is_deleted = true)
EXECUTE FUNCTION soft_delete();

CREATE TRIGGER quote_restore
BEFORE UPDATE ON "Quote"
FOR EACH ROW
WHEN (OLD.is_deleted = true AND NEW.is_deleted = false)
EXECUTE FUNCTION restore();

CREATE TRIGGER quote_offer_soft_delete
BEFORE UPDATE ON "QuoteOffer"
FOR EACH ROW
WHEN (OLD.is_deleted = false AND NEW.is_deleted = true)
EXECUTE FUNCTION soft_delete();

CREATE TRIGGER quote_offer_restore
BEFORE UPDATE ON "QuoteOffer"
FOR EACH ROW
WHEN (OLD.is_deleted = true AND NEW.is_deleted = false)
EXECUTE FUNCTION restore();

-- Create views for easy access to non-deleted records
CREATE OR REPLACE VIEW active_users AS
SELECT * FROM "users" WHERE is_deleted = false;

CREATE OR REPLACE VIEW active_assures AS
SELECT * FROM "assures" WHERE is_deleted = false;

CREATE OR REPLACE VIEW active_insurers AS
SELECT * FROM "insurers" WHERE is_deleted = false;

CREATE OR REPLACE VIEW active_insurance_offers AS
SELECT * FROM "InsuranceOffer" WHERE is_deleted = false;

CREATE OR REPLACE VIEW active_quotes AS
SELECT * FROM "Quote" WHERE is_deleted = false;

CREATE OR REPLACE VIEW active_quote_offers AS
SELECT * FROM "QuoteOffer" WHERE is_deleted = false;

-- Create views for deleted records
CREATE OR REPLACE VIEW deleted_users AS
SELECT * FROM "users" WHERE is_deleted = true;

CREATE OR REPLACE VIEW deleted_assures AS
SELECT * FROM "assures" WHERE is_deleted = true;

CREATE OR REPLACE VIEW deleted_insurers AS
SELECT * FROM "insurers" WHERE is_deleted = true;

CREATE OR REPLACE VIEW deleted_insurance_offers AS
SELECT * FROM "InsuranceOffer" WHERE is_deleted = true;

CREATE OR REPLACE VIEW deleted_quotes AS
SELECT * FROM "Quote" WHERE is_deleted = true;

CREATE OR REPLACE VIEW deleted_quote_offers AS
SELECT * FROM "QuoteOffer" WHERE is_deleted = true;
