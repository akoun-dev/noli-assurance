-- Migration to standardize role naming from INSURER to ASSUREUR
-- This aligns the database schema with the French business context

-- Update Role enum type
DROP TYPE IF EXISTS "public"."Role";
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ASSUREUR', 'ADMIN');

-- Update existing users with INSURER role to ASSUREUR
UPDATE "public"."users"
SET role = 'ASSUREUR'::"public"."Role"
WHERE role = 'INSURER'::"public"."Role";

-- Add a check constraint to ensure only valid roles
ALTER TABLE "public"."users"
ADD CONSTRAINT "users_role_check"
CHECK (role = 'USER'::"public"."Role" OR role = 'ASSUREUR'::"public"."Role" OR role = 'ADMIN'::"public"."Role");