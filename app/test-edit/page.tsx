import PrescriptionEditForm from "@/components/prescription-edit-form"

// Test data to verify parameter binding
const testPrescription = {
  id: "test-123",
  patient_name: "John Doe",
  patient_age: 35,
  patient_sex: "Male",
  patient_weight: 70,
  patient_contact: "123-456-7890",
  patient_address: "123 Main St, City, State",
  allergies: "None",
  symptoms: "Fever and cough",
  findings: "Normal vitals",
  diagnosis: "Common cold",
  ref_no: "REF001",
  visit_no: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const testMedicines = [
  {
    id: "med-1",
    prescription_id: "test-123",
    medicine_name: "Paracetamol",
    medicine_type: "tablet",
    dosage_amount: "500mg",
    morning_dose: 1,
    afternoon_dose: 0,
    evening_dose: 1,
    duration_days: 5,
    instructions: "Take after meals",
    created_at: new Date().toISOString(),
  },
  {
    id: "med-2", 
    prescription_id: "test-123",
    medicine_name: "Cough Syrup",
    medicine_type: "syrup",
    dosage_amount: "5ml",
    morning_dose: 1,
    afternoon_dose: 1,
    evening_dose: 1,
    duration_days: 7,
    instructions: "Take as needed",
    created_at: new Date().toISOString(),
  }
]

export default function TestEditPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold p-4">Test Edit Prescription with Parameters</h1>
      <PrescriptionEditForm 
        prescription={testPrescription}
        medicines={testMedicines}
        prescriptionId="test-123"
      />
    </div>
  )
}