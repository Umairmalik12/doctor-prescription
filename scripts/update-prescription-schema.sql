-- Update the prescriptions table to allow NULL for patient_sex
-- This removes the constraint issue when sex is not selected

ALTER TABLE prescriptions 
DROP CONSTRAINT IF EXISTS prescriptions_patient_sex_check;

-- Add a new constraint that allows NULL or the specified values
ALTER TABLE prescriptions 
ADD CONSTRAINT prescriptions_patient_sex_check 
CHECK (patient_sex IS NULL OR patient_sex IN ('Male', 'Female'));

-- Also ensure other optional fields can be NULL
ALTER TABLE prescriptions 
ALTER COLUMN patient_age DROP NOT NULL,
ALTER COLUMN patient_sex DROP NOT NULL,
ALTER COLUMN patient_weight DROP NOT NULL,
ALTER COLUMN patient_contact DROP NOT NULL,
ALTER COLUMN patient_address DROP NOT NULL,
ALTER COLUMN allergies DROP NOT NULL,
ALTER COLUMN symptoms DROP NOT NULL,
ALTER COLUMN findings DROP NOT NULL,
ALTER COLUMN diagnosis DROP NOT NULL,
ALTER COLUMN ref_no DROP NOT NULL;

-- Update the prescription_medicines table to allow NULL for optional fields
ALTER TABLE prescription_medicines 
ALTER COLUMN duration_days DROP NOT NULL,
ALTER COLUMN instructions DROP NOT NULL;

SELECT 'Schema updated successfully - NULL values now allowed for optional fields' as status;
