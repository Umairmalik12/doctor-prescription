-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS prescription_medicines CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;

-- Create prescriptions table
CREATE TABLE prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  patient_age INTEGER,
  patient_sex VARCHAR(10) CHECK (patient_sex IN ('Male', 'Female')),
  patient_weight DECIMAL(5,2),
  patient_contact VARCHAR(20),
  patient_address TEXT,
  allergies TEXT,
  symptoms TEXT,
  findings TEXT,
  diagnosis TEXT,
  ref_no VARCHAR(50),
  visit_no INTEGER DEFAULT 1,
  visit_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescription_medicines table
CREATE TABLE prescription_medicines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_name VARCHAR(255) NOT NULL,
  medicine_type VARCHAR(20) NOT NULL CHECK (medicine_type IN ('tablet', 'capsule', 'injection', 'syrup', 'drops', 'cream', 'ointment')),
  dosage_amount VARCHAR(20) NOT NULL, -- 500mg, 1g, 5ml, etc.
  morning_dose INTEGER DEFAULT 0 CHECK (morning_dose >= 0),
  afternoon_dose INTEGER DEFAULT 0 CHECK (afternoon_dose >= 0),
  evening_dose INTEGER DEFAULT 0 CHECK (evening_dose >= 0),
  duration_days INTEGER CHECK (duration_days > 0),
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_prescriptions_patient_name ON prescriptions(patient_name);
CREATE INDEX idx_prescriptions_created_at ON prescriptions(created_at DESC);
CREATE INDEX idx_prescriptions_ref_no ON prescriptions(ref_no);
CREATE INDEX idx_prescription_medicines_prescription_id ON prescription_medicines(prescription_id);
CREATE INDEX idx_prescription_medicines_medicine_name ON prescription_medicines(medicine_name);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_prescriptions_updated_at 
    BEFORE UPDATE ON prescriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medicines ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Allow all operations for authenticated users (you can make this more restrictive based on your needs)
CREATE POLICY "Allow all operations for authenticated users" ON prescriptions
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON prescription_medicines
  FOR ALL USING (true);

-- Insert some sample data for testing
INSERT INTO prescriptions (
  patient_name, 
  patient_age, 
  patient_sex, 
  patient_weight, 
  patient_contact, 
  patient_address, 
  allergies, 
  symptoms, 
  findings, 
  diagnosis, 
  ref_no, 
  visit_no
) VALUES 
(
  'Ahmed Ali', 
  35, 
  'Male', 
  70.5, 
  '+92-300-1234567', 
  'House 123, Street 5, Multan', 
  'No known allergies', 
  'Fever, headache, body aches', 
  'Temperature 101°F, BP 120/80', 
  'Viral fever', 
  'REF-001', 
  1
),
(
  'Fatima Khan', 
  28, 
  'Female', 
  55.0, 
  '+92-301-9876543', 
  'Flat 45, Block A, Lahore', 
  'Penicillin allergy', 
  'Cough, sore throat', 
  'Throat inflammation, no fever', 
  'Upper respiratory tract infection', 
  'REF-002', 
  1
);

-- Get the prescription IDs for sample medicines
WITH sample_prescriptions AS (
  SELECT id, patient_name FROM prescriptions WHERE ref_no IN ('REF-001', 'REF-002')
)
INSERT INTO prescription_medicines (
  prescription_id, 
  medicine_name, 
  medicine_type, 
  dosage_amount, 
  morning_dose, 
  afternoon_dose, 
  evening_dose, 
  duration_days, 
  instructions
) 
SELECT 
  p.id,
  m.medicine_name,
  m.medicine_type,
  m.dosage_amount,
  m.morning_dose,
  m.afternoon_dose,
  m.evening_dose,
  m.duration_days,
  m.instructions
FROM sample_prescriptions p
CROSS JOIN (
  VALUES 
    ('Paracetamol', 'tablet', '500mg', 1, 0, 1, 5, 'Take after meals'),
    ('Ibuprofen', 'tablet', '400mg', 1, 0, 1, 3, 'Take with water'),
    ('Vitamin C', 'tablet', '1000mg', 1, 0, 0, 7, 'Take in morning')
) AS m(medicine_name, medicine_type, dosage_amount, morning_dose, afternoon_dose, evening_dose, duration_days, instructions)
WHERE p.patient_name = 'Ahmed Ali'

UNION ALL

SELECT 
  p.id,
  m.medicine_name,
  m.medicine_type,
  m.dosage_amount,
  m.morning_dose,
  m.afternoon_dose,
  m.evening_dose,
  m.duration_days,
  m.instructions
FROM sample_prescriptions p
CROSS JOIN (
  VALUES 
    ('Azithromycin', 'tablet', '250mg', 1, 0, 0, 5, 'Take before meals'),
    ('Lozenges', 'tablet', '1mg', 0, 1, 1, 3, 'Dissolve in mouth')
) AS m(medicine_name, medicine_type, dosage_amount, morning_dose, afternoon_dose, evening_dose, duration_days, instructions)
WHERE p.patient_name = 'Fatima Khan';

-- Create a view for easy prescription retrieval with medicine details
CREATE VIEW prescription_details AS
SELECT 
  p.id as prescription_id,
  p.patient_name,
  p.patient_age,
  p.patient_sex,
  p.patient_weight,
  p.patient_contact,
  p.patient_address,
  p.allergies,
  p.symptoms,
  p.findings,
  p.diagnosis,
  p.ref_no,
  p.visit_no,
  p.visit_date,
  p.created_at,
  pm.id as medicine_id,
  pm.medicine_name,
  pm.medicine_type,
  pm.dosage_amount,
  pm.morning_dose,
  pm.afternoon_dose,
  pm.evening_dose,
  pm.duration_days,
  pm.instructions
FROM prescriptions p
LEFT JOIN prescription_medicines pm ON p.id = pm.prescription_id
ORDER BY p.created_at DESC, pm.created_at ASC;

-- Grant necessary permissions (adjust based on your user roles)
GRANT ALL PRIVILEGES ON prescriptions TO postgres;
GRANT ALL PRIVILEGES ON prescription_medicines TO postgres;
GRANT SELECT ON prescription_details TO postgres;

-- Display table information
SELECT 'Prescriptions table created successfully' as status;
SELECT 'Prescription medicines table created successfully' as status;
SELECT 'Sample data inserted successfully' as status;

-- Show sample data
SELECT 
  patient_name, 
  ref_no, 
  visit_no, 
  created_at::date as date_created
FROM prescriptions;

SELECT 
  p.patient_name,
  pm.medicine_name,
  pm.medicine_type,
  pm.dosage_amount,
  CONCAT(pm.morning_dose, '+', pm.afternoon_dose, '+', pm.evening_dose) as dosage_pattern,
  pm.duration_days
FROM prescriptions p
JOIN prescription_medicines pm ON p.id = pm.prescription_id
ORDER BY p.patient_name, pm.medicine_name;
