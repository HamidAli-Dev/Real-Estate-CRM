-- Migration to update LeadSource enum values
-- This script updates existing leads to use the new enum values

-- First, update any existing leads that use old enum values
UPDATE "Lead" 
SET "source" = 'Social' 
WHERE "source" = 'SocialMedia';

UPDATE "Lead" 
SET "source" = 'Cold' 
WHERE "source" = 'Advertisement';

UPDATE "Lead" 
SET "source" = 'Cold' 
WHERE "source" = 'Other';

-- Note: After running this migration, you'll need to update the Prisma schema
-- and run: npx prisma db push
-- or: npx prisma migrate dev --name update_lead_source_enum
