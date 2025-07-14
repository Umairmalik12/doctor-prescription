import { createClient } from "@supabase/supabase-js"

// Your Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

// Test the connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("prescriptions").select("count").limit(1)
    if (error) throw error
    console.log("Supabase connection successful")
    return true
  } catch (error) {
    console.error("Supabase connection failed:", error)
    return false
  }
}

export type Prescription = {
  id?: string
  patient_name: string
  patient_age?: number
  patient_sex?: string
  patient_weight?: number
  patient_contact?: string
  patient_address?: string
  allergies?: string
  symptoms?: string
  findings?: string
  diagnosis?: string
  ref_no?: string
  visit_no?: number
  visit_date?: string
  created_at?: string
  updated_at?: string
}

export type PrescriptionMedicine = {
  id?: string
  prescription_id?: string
  medicine_name: string
  medicine_type: string
  dosage_amount: string
  morning_dose: number
  afternoon_dose: number
  evening_dose: number
  duration_days?: number
  instructions?: string
  created_at?: string
  // Urdu fields
  medicine_name_urdu?: string
  dose_urdu?: string
}

// Mock Supabase functions for demo mode
export const mockSupabase = {
  savePrescription: async (prescription: Prescription) => {
    // Simulate saving a prescription and returning data
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
    const id = Math.random().toString(36).substring(7) // Generate a random ID
    return { data: { ...prescription, id }, error: null }
  },
  saveMedicines: async (medicines: PrescriptionMedicine[]) => {
    // Simulate saving medicines
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { data: medicines, error: null }
  },
}

// Flag to determine if the app is running in demo mode
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
