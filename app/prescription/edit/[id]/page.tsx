import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import PrescriptionEditForm from "@/components/prescription-edit-form"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditPrescriptionPage({ params }: PageProps) {
  const { data: prescription, error: prescriptionError } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("id", params.id)
    .single()

  if (prescriptionError || !prescription) {
    notFound()
  }

  const { data: medicines, error: medicinesError } = await supabase
    .from("prescription_medicines")
    .select("*")
    .eq("prescription_id", params.id)
    .order("created_at")

  if (medicinesError) {
    console.error("Error fetching medicines:", medicinesError)
  }

  return (
    <PrescriptionEditForm 
      prescription={prescription} 
      medicines={medicines || []} 
      prescriptionId={params.id}
    />
  )
}