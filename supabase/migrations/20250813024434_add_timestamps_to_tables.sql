-- Add timestamps to insurers table
ALTER TABLE insurers
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add timestamps to InsuranceOffer table
ALTER TABLE "InsuranceOffer"
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Create function and trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for insurers
CREATE TRIGGER update_insurers_updated_at
BEFORE UPDATE ON insurers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for InsuranceOffer
CREATE TRIGGER update_insurance_offer_updated_at
BEFORE UPDATE ON "InsuranceOffer"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();