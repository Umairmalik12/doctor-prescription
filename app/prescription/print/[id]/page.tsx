import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import PrintablePrescriptionOverlay from "@/components/printable-prescription-overlay"

interface PageProps {
  params: {
    id: string
  }
}

export default async function PrintPrescriptionPage({ params }: PageProps) {
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

  return <PrintablePrescriptionOverlay prescription={prescription} medicines={medicines || []} />
}
