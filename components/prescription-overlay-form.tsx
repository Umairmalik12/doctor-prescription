"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Printer, Plus, Trash2, List } from "lucide-react"
import { supabase, type Prescription, type PrescriptionMedicine } from "@/lib/supabase"
import { COMMON_MEDICINES, MEDICINE_TYPES } from "@/lib/medicines-data"
import { useToast } from "@/hooks/use-toast"
import PrescriptionListModal from "./prescription-list-modal"

interface MedicineFormData extends Omit<PrescriptionMedicine, "id" | "prescription_id"> { }

export default function PrescriptionOverlayForm() {
  const { toast } = useToast()

  const [prescription, setPrescription] = useState<Prescription>({
    patient_name: "",
    patient_age: undefined,
    patient_sex: "",
    patient_weight: undefined,
    patient_contact: "",
    patient_address: "",
    allergies: "",
    symptoms: "",
    findings: "",
    diagnosis: "",
    ref_no: "",
    visit_no: 1,
  })

  const [medicines, setMedicines] = useState<MedicineFormData[]>([
    {
      medicine_name: "",
      medicine_type: "tablet",
      dosage_amount: "",
      morning_dose: 1,
      afternoon_dose: 0,
      evening_dose: 1,
      duration_days: 7,
      instructions: "",
    },
  ])

  const [relationField, setRelationField] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [savedPrescriptionId, setSavedPrescriptionId] = useState<string | null>(null)
  // Hydration-safe date
  const [currentDate, setCurrentDate] = useState("")
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString())
  }, [])

  useEffect(() => {
    // set date once
    setCurrentDate(new Date().toLocaleDateString())

    // update time every second
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Optimized handlers with useCallback to prevent re-renders
  const updatePrescriptionField = useCallback((field: keyof Prescription, value: any) => {
    setPrescription((prev) => ({ ...prev, [field]: value }))
  }, [])

  const addMedicine = useCallback(() => {
    setMedicines((prev) => [
      ...prev,
      {
        medicine_name: "",
        medicine_type: "tablet",
        dosage_amount: "",
        morning_dose: 1,
        afternoon_dose: 0,
        evening_dose: 1,
        duration_days: 7,
        instructions: "",
      },
    ])
  }, [])

  const removeMedicine = useCallback((index: number) => {
    setMedicines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }, [])

  const updateMedicine = useCallback((index: number, field: keyof MedicineFormData, value: any) => {
    setMedicines((prev) => prev.map((med, i) => (i === index ? { ...med, [field]: value } : med)))
  }, [])

  const savePrescription = useCallback(async () => {
    if (!prescription.patient_name.trim()) {
      toast({
        title: "Error",
        description: "Patient name is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const prescriptionData = {
        patient_name: prescription.patient_name,
        patient_age: prescription.patient_age || null,
        patient_sex: prescription.patient_sex?.trim() || null,
        patient_weight: prescription.patient_weight || null,
        patient_contact: prescription.patient_contact?.trim() || null,
        patient_address: prescription.patient_address?.trim() || null,
        allergies: prescription.allergies?.trim() || null,
        symptoms: prescription.symptoms?.trim() || null,
        findings: prescription.findings?.trim() || null,
        diagnosis: prescription.diagnosis?.trim() || null,
        ref_no: prescription.ref_no?.trim() || null,
        visit_no: prescription.visit_no || 1,
        visit_date: new Date().toISOString().split("T")[0],
      }

      const { data: savedPrescription, error: prescriptionError } = await supabase
        .from("prescriptions")
        .insert([prescriptionData])
        .select()
        .single()

      if (prescriptionError) throw prescriptionError

      const validMedicines = medicines.filter((med) => med.medicine_name.trim() !== "")

      if (validMedicines.length > 0) {
        const medicinesWithPrescriptionId = validMedicines.map((med) => ({
          prescription_id: savedPrescription.id,
          medicine_name: med.medicine_name,
          medicine_type: med.medicine_type,
          dosage_amount: med.dosage_amount,
          morning_dose: med.morning_dose,
          afternoon_dose: med.afternoon_dose,
          evening_dose: med.evening_dose,
          duration_days: med.duration_days || null,
          instructions: med.instructions?.trim() || null,
        }))

        const { error: medicinesError } = await supabase
          .from("prescription_medicines")
          .insert(medicinesWithPrescriptionId)

        if (medicinesError) throw medicinesError
      }

      setSavedPrescriptionId(savedPrescription.id)
      toast({
        title: "Success",
        description: `Prescription saved successfully!`,
      })
    } catch (error) {
      console.error("Error saving prescription:", error)
      toast({
        title: "Error",
        description: `Failed to save prescription`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [prescription, medicines, toast])

  const resetForm = useCallback(() => {
    setPrescription({
      patient_name: "",
      patient_age: undefined,
      patient_sex: "",
      patient_weight: undefined,
      patient_contact: "",
      patient_address: "",
      allergies: "",
      symptoms: "",
      findings: "",
      diagnosis: "",
      ref_no: "",
      visit_no: 1,
    })
    setMedicines([
      {
        medicine_name: "",
        medicine_type: "tablet",
        dosage_amount: "",
        morning_dose: 1,
        afternoon_dose: 0,
        evening_dose: 1,
        duration_days: 7,
        instructions: "",
      },
    ])
    setRelationField("")
    setSavedPrescriptionId(null)
  }, [])

  const printCurrentForm = useCallback(() => {
    if (!prescription.patient_name.trim()) {
      toast({
        title: "Error",
        description: "Patient name is required for printing",
        variant: "destructive",
      })
      return
    }

    const validMedicines = medicines.filter((med) => med.medicine_name.trim() !== "")
    const formatDate = () => new Date().toLocaleDateString()

    const formateTime = () => {
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    };

    const getDosageText = (medicine: MedicineFormData) =>
      `${medicine.morning_dose}+${medicine.afternoon_dose}+${medicine.evening_dose}`

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
<!DOCTYPE html>
<html>
  <head>
    <title>Prescription - ${prescription.patient_name}</title>
    <style>
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @media print {
        body { 
          margin: 0 !important; 
          padding: 0 !important;
        }
        @page { 
          margin: 0 !important; 
          size: A4 !important; 
        }
        .prescription-container {
          width: 794px !important;
          height: 1123px !important;
          position: relative !important;
        }
        .background-image {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 1 !important;
        }
        .content-overlay {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 2 !important;
        }
      }
      body { 
        font-family: Arial, sans-serif; 
        margin: 0; 
        padding: 0; 
      }
      .prescription-container {
        position: relative; 
        width: 794px; 
        height: 1123px; 
        margin: 0 auto;
      }
      .background-image {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        object-fit: cover;
      }
      .content-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
      }
      .print-text { 
        position: absolute; 
        color: #000 !important; 
        font-weight: 600; 
        font-size: 14px; 
        line-height: 1.2;
        z-index: 2;
      }
      .medicine-text { 
        font-size: 14px; 
        margin-bottom: 12px; 
        color: #000; 
      }
      .medicine-number { 
        color: #1e40af; 
        font-weight: bold; 
        margin-right: 8px; 
      }
      .medicine-name { 
        font-weight: 600; 
      }
      .medicine-details { 
        font-size: 12px; 
        margin-top: 4px; 
        margin-left: 16px; 
        color: #374151; 
      }
    </style>
  </head>
  <body>
    <div class="prescription-container">
      <img src="/prescription-bg.jpg" alt="Prescription Background" class="background-image" />
      <div class="content-overlay">
        ${prescription.ref_no ? `<div class="print-text" style="top: 258px; left: 63px;">${prescription.ref_no}</div>` : ""}
        <div class="print-text" style="top: 260px; left: 430px;">${formatDate()}</div>
                <div class="print-text" style="top: 259px; left: 271px;">${formateTime()}</div>

        
        <div class="print-text" style="top: 254px; left: 632px; width: 80px; text-align: center;">${prescription.visit_no || 1}</div>
        ${prescription.patient_name ? `<div class="print-text" style="top: 291px; left: 127px;">${prescription.patient_name}</div>` : ""}
        ${relationField ? `<div class="print-text" style="top: 292px; left: 480px;">${relationField}</div>` : ""}
        ${prescription.patient_age ? `<div class="print-text" style="top: 324px; left: 60px;">${prescription.patient_age}</div>` : ""}
        ${prescription.patient_sex ? `<div class="print-text" style="top: 324px; left: 232px;">${prescription.patient_sex}</div>` : ""}
        ${prescription.patient_weight ? `<div class="print-text" style="top: 325px; left: 414px;">${prescription.patient_weight}</div>` : ""}
        ${prescription.patient_contact ? `<div class="print-text" style="top: 325px; left: 588px;">${prescription.patient_contact}</div>` : ""}
        ${prescription.patient_address ? `<div class="print-text" style="top: 356px; left: 83px; max-width: 320px;">${prescription.patient_address}</div>` : ""}
        ${prescription.allergies ? `<div class="print-text" style="top: 357px; left: 480px; max-width: 270px;">${prescription.allergies}</div>` : ""}
        ${prescription.symptoms ? `<div class="print-text" style="top: 386px; left: 104px; width: 300px;">${prescription.symptoms}</div>` : ""}
        ${prescription.findings ? `<div class="print-text" style="top: 389px; left: 474px; width: 300px;">${prescription.findings}</div>` : ""}
        ${prescription.diagnosis ? `<div class="print-text" style="top: 421px; left: 193px; width: 500px;">${prescription.diagnosis}</div>` : ""}
        <div style="position: absolute;
    top: 477px;
    left: 327px;
    right: 50px;">
          ${validMedicines
        .map(
          (medicine, index) => `
            <div class="medicine-text">
              <span class="medicine-number">${index + 1}.</span>
              <span class="medicine-name">${medicine.medicine_name} ${medicine.dosage_amount} (${medicine.medicine_type})</span>
              <div class="medicine-details">
                <strong>Dosage:</strong> ${getDosageText(medicine)}
                ${medicine.duration_days ? ` for ${medicine.duration_days} days` : ""}
                ${medicine.instructions ? ` - ${medicine.instructions}` : ""}
              </div>
            </div>
          `,
        )
        .join("")}
        </div>
      </div>
    </div>
    <script>
      setTimeout(function() {
        window.print();
      }, 1000);
    </script>
  </body>
</html>
`)
    printWindow.document.close()
  }, [prescription, medicines, relationField, toast])

  const printSavedPrescription = useCallback(() => {
    if (savedPrescriptionId) {
      window.open(`/prescription/print/${savedPrescriptionId}`, "_blank")
    } else {
      toast({
        title: "Save Required",
        description: "Please save the prescription before printing.",
        variant: "destructive",
      })
    }
  }, [savedPrescriptionId, toast])

  // Memoized components to prevent unnecessary re-renders
  const medicineComponents = useMemo(
    () =>
      medicines.map((medicine, index) => (
        <div
          key={index}
          className="w-full bg-white/90 border border-blue-100 rounded-lg p-1 mb-1 flex flex-wrap items-center gap-1 shadow-sm text-xs"
          style={{ minWidth: 0 }}
        >
          {index > 0 && <hr className="w-full border-blue-100 my-2" />}
          <span className="text-sm font-bold w-6 text-blue-800 bg-blue-50 px-2 py-1 rounded">{index + 1}.</span>

          <Select
            value={medicine.medicine_name}
            onValueChange={(value) => updateMedicine(index, "medicine_name", value)}
          >
            <SelectTrigger className="w-32 h-8 text-xs border-2 border-blue-300 bg-white/95 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
              <SelectValue placeholder="Medicine" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_MEDICINES.map((med) => (
                <SelectItem key={med} value={med}>
                  {med}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={medicine.dosage_amount}
            onChange={(e) => updateMedicine(index, "dosage_amount", e.target.value)}
            className="w-16 h-8 text-xs border-2 border-blue-300 bg-white/95 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="500mg"
          />

          <Select
            value={medicine.medicine_type}
            onValueChange={(value) => updateMedicine(index, "medicine_type", value)}
          >
            <SelectTrigger className="w-20 h-8 text-xs border-2 border-blue-300 bg-white/95 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEDICINE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 bg-blue-50 p-2 rounded-lg border border-blue-200">
            <Input
              type="number"
              value={medicine.morning_dose}
              onChange={(e) =>
                updateMedicine(index, "morning_dose", Number.parseInt(e.target.value) || 0)
              }
              className="w-12 h-7 text-xs text-center border border-blue-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              min="0"
              max="9"
            />
            <span className="text-xs font-semibold text-blue-700">+</span>
            <Input
              type="number"
              value={medicine.afternoon_dose}
              onChange={(e) =>
                updateMedicine(index, "afternoon_dose", Number.parseInt(e.target.value) || 0)
              }
              className="w-12 h-7 text-xs text-center border border-blue-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              min="0"
              max="9"
            />
            <span className="text-xs font-semibold text-blue-700">+</span>
            <Input
              type="number"
              value={medicine.evening_dose}
              onChange={(e) =>
                updateMedicine(index, "evening_dose", Number.parseInt(e.target.value) || 0)
              }
              className="w-12 h-7 text-xs text-center border border-blue-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              min="0"
              max="9"
            />
          </div>


          <Input
            type="number"
            value={medicine.duration_days || ""}
            onChange={(e) => updateMedicine(index, "duration_days", Number.parseInt(e.target.value) || undefined)}
            className="w-12 h-8 text-xs border-2 border-blue-300 bg-white/95 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Days"
          />

          <div className="w-full">
            <Input
              value={medicine.instructions || ""}
              onChange={(e) =>
                updateMedicine(index, "instructions", e.target.value)
              }
              className="w-full h-8 text-xs border-2 border-blue-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Instructions"
            />
          </div>

          {medicines.length > 1 && (
            <Button onClick={() => removeMedicine(index)} size="sm" variant="destructive" className="h-8 w-8 p-0 hover:bg-red-600 transition-colors">
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      )),
    [medicines, updateMedicine, removeMedicine],
  )

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      {/* Control Panel */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Digital Prescription System</h1>
          <div className="flex flex-wrap gap-2">
            <Button onClick={savePrescription} disabled={isLoading} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button onClick={resetForm} variant="outline" disabled={isLoading} size="sm">
              Reset
            </Button>
            <PrescriptionListModal
              trigger={
                <Button variant="outline" disabled={isLoading} size="sm">
                  <List className="w-4 h-4 mr-2" />
                  View List
                </Button>
              }
            />
            <Button onClick={printCurrentForm} variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            {savedPrescriptionId && (
              <Button onClick={printSavedPrescription} variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print Saved
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Form */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Desktop View */}
          <div className="hidden lg:block">
            <div
              className="relative mx-auto"
              style={{
                backgroundImage: "url('/prescription-bg.jpg')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                width: "794px",
                height: "1123px",
              }}
            >


              {/* Prescription Form */}
              <div className="absolute inset-0">
                {/* Row 1: Ref No., Date, No of Visit */}
                <Input
                  value={prescription.ref_no || ""}
                  onChange={(e) => updatePrescriptionField("ref_no", e.target.value)}
                  className="absolute border-2 border-blue-300 bg-white/95 text-sm p-2 h-8 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  style={{
                    top: '243px',
                    left: '76px',
                    width: '149px'
                  }}
                  placeholder="Ref No."
                />
                <Input
                  value={currentDate}
                  className="absolute border-2 border-gray-300 bg-gray-50/95 text-sm p-2 h-8 rounded-md"
                  style={{ top: "243px", left: "422px", width: "119px" }}
                  readOnly
                />

                <Input
                  value={currentTime}
                  className="absolute border-2 border-gray-300 bg-gray-50/95 text-sm p-2 h-8 rounded-md"
                  style={{ top: "243px", left: "279px", width: "100px" }}
                  readOnly
                />
                <Input
                  value={prescription.visit_no?.toString() || "1"}
                  onChange={(e) => updatePrescriptionField("visit_no", Number.parseInt(e.target.value) || 1)}
                  className="absolute border-2 border-blue-300 bg-white/95 text-sm p-2 h-8 rounded-md text-center shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  style={{ top: "243px", left: "640px", width: "60px" }}
                  placeholder="No of Visit"
                />
                {/* More fields to be aligned in the next step */}
                {/* Row 2: Patient Name and Relation */}
                <Input
                  value={prescription.patient_name}
                  onChange={(e) => updatePrescriptionField("patient_name", e.target.value)}
                  className="absolute border-2 border-blue-300 bg-white/95 text-sm p-2 h-8 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  style={{ top: "278px", left: "133px", width: "225px" }}
                  placeholder="Patient Name"
                />

                <Input
                  value={relationField}
                  onChange={(e) => setRelationField(e.target.value)}
                  className="absolute border-2 border-blue-300 bg-white/95 text-sm p-2 h-8 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  style={{ top: "278px", left: "473px", width: "280px" }}
                  placeholder="S/o, D/o, W/o"
                />

                {/* Row 3: Age, Sex, Weight, Contact No */}
                <Input
                  value={prescription.patient_age?.toString() || ""}
                  onChange={(e) => updatePrescriptionField("patient_age", Number.parseInt(e.target.value) || undefined)}
                  className="absolute border-none bg-transparent text-sm p-2 h-8 focus:ring-0 focus:outline-none"
                  style={{ top: "314px", left: "87px", width: "43px" }}
                  placeholder="Age"
                />
                <div className="absolute" style={{ top: "313px", left: "220px", width: "85px" }}>
                  <Select
                    value={prescription.patient_sex || ""}
                    onValueChange={(value) => updatePrescriptionField("patient_sex", value)}
                  >
                    <SelectTrigger className="border-none bg-transparent text-sm h-8 focus:ring-0 focus:outline-none">
                      <SelectValue placeholder="Sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={prescription.patient_weight?.toString() || ""}
                  onChange={(e) => updatePrescriptionField("patient_weight", Number.parseFloat(e.target.value) || undefined)}
                  className="absolute border-none bg-transparent text-sm p-2 h-8 focus:ring-0 focus:outline-none"
                  style={{ top: "314px", left: "415px", width: "60px" }}
                  placeholder="Weight"
                />
                <Input
                  value={prescription.patient_contact || ""}
                  onChange={(e) => updatePrescriptionField("patient_contact", e.target.value)}
                  className="absolute border-none bg-transparent text-sm p-2 h-8 focus:ring-0 focus:outline-none"
                  style={{ top: "316px", left: "571px", width: "170px" }}
                  placeholder="Contact No"
                />
                {/* Row 4: Address, Allergies */}
                <Input
                  value={prescription.patient_address || ""}
                  onChange={(e) => updatePrescriptionField("patient_address", e.target.value)}
                  className="absolute border-none bg-transparent text-sm p-2 h-8 focus:ring-0 focus:outline-none"
                  style={{ top: "344px", left: "95px", width: "315px" }}
                  placeholder="Address"
                />
                <Input
                  value={prescription.allergies || ""}
                  onChange={(e) => updatePrescriptionField("allergies", e.target.value)}
                  className="absolute border-none bg-transparent text-sm p-2 h-8 focus:ring-0 focus:outline-none"
                  style={{ top: "348px", left: "480px", width: "270px" }}
                  placeholder="Allergies"
                />
                {/* Row 5: Symptoms, Findings */}
                <Textarea
                  value={prescription.symptoms || ""}
                  onChange={(e) => updatePrescriptionField("symptoms", e.target.value)}
                  className="absolute border-none bg-transparent text-sm p-2 rounded-md resize-none focus:ring-0 focus:outline-none"
                  style={{ top: "376px", left: "111px", width: "320px", height: "32px" }}
                  placeholder="Symptoms"
                  rows={2}
                />
                <Textarea
                  value={prescription.findings || ""}
                  onChange={(e) => updatePrescriptionField("findings", e.target.value)}
                  className="absolute border-none bg-transparent text-sm p-2 rounded-md resize-none focus:ring-0 focus:outline-none"
                  style={{ top: "377px", left: "464px", width: "270px", height: "32px" }}
                  placeholder="Findings"
                  rows={2}
                />
                {/* Row 6: Provisional/Diagnosis */}
                <Textarea
                  value={prescription.diagnosis || ""}
                  onChange={(e) => updatePrescriptionField("diagnosis", e.target.value)}
                  className="absolute border-none bg-transparent text-sm p-2 rounded-md resize-none focus:ring-0 focus:outline-none"
                  style={{ top: "410px", left: "200px", width: "500px", height: "32px" }}
                  placeholder="Provisional/Diagnosis"
                  rows={2}
                />

                {/* Medicines */}
                <div className="absolute" style={{ top: "520px", left: "140px", right: "50px", height: "320px", overflowY: "auto" }}>
                  <div className="space-y-1 flex flex-col items-center">
                    {medicineComponents}
                    {/* Illustration Image Section */}
                    {/* <img
                      src="/prescription-bg.png"
                      alt="Kidneys Illustration"
                      style={{ maxWidth: "180px", margin: "24px auto 8px auto", display: "block", opacity: 0.7 }}
                    /> */}
                    <div className="flex justify-center">
                      <Button
                        onClick={addMedicine}
                        size="sm"
                        className="h-10 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medicine
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View - Simplified */}
          <div className="lg:hidden p-4 space-y-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-lg font-bold text-blue-800">Dr. Tanveer-ul-Haq</h2>
              <p className="text-sm text-gray-600">M.R.B.S., F.C.P.S.</p>
            </div>

            {/* Patient Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Patient Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={prescription.ref_no || ""}
                  onChange={(e) => updatePrescriptionField("ref_no", e.target.value)}
                  placeholder="Ref No"
                />
                <Input
                  value={prescription.visit_no?.toString() || "1"}
                  onChange={(e) => updatePrescriptionField("visit_no", Number.parseInt(e.target.value) || 1)}
                  type="number"
                  placeholder="Visit No"
                />
                <Input
                  value={prescription.patient_name}
                  onChange={(e) => updatePrescriptionField("patient_name", e.target.value)}
                  placeholder="Patient Name *"
                  className="sm:col-span-2"
                />
                <Input
                  value={relationField}
                  onChange={(e) => setRelationField(e.target.value)}
                  placeholder="S/o, D/o, W/o"
                  className="sm:col-span-2"
                />
                <Input
                  value={prescription.patient_age?.toString() || ""}
                  onChange={(e) => updatePrescriptionField("patient_age", Number.parseInt(e.target.value) || undefined)}
                  type="number"
                  placeholder="Age"
                />
                <Select
                  value={prescription.patient_sex || ""}
                  onValueChange={(value) => updatePrescriptionField("patient_sex", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={prescription.patient_weight?.toString() || ""}
                  onChange={(e) =>
                    updatePrescriptionField("patient_weight", Number.parseFloat(e.target.value) || undefined)
                  }
                  type="number"
                  step="0.1"
                  placeholder="Weight (kg)"
                />
                <Input
                  value={prescription.patient_contact || ""}
                  onChange={(e) => updatePrescriptionField("patient_contact", e.target.value)}
                  placeholder="Contact No"
                />
                <Input
                  value={prescription.patient_address || ""}
                  onChange={(e) => updatePrescriptionField("patient_address", e.target.value)}
                  placeholder="Address"
                  className="sm:col-span-2"
                />
                <Textarea
                  value={prescription.allergies || ""}
                  onChange={(e) => updatePrescriptionField("allergies", e.target.value)}
                  placeholder="Allergies"
                  rows={2}
                  className="sm:col-span-2"
                />
              </div>
            </div>

            {/* Clinical Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Clinical Information</h3>
              <Textarea
                value={prescription.symptoms || ""}
                onChange={(e) => updatePrescriptionField("symptoms", e.target.value)}
                placeholder="Symptoms"
                rows={2}
              />
              <Textarea
                value={prescription.findings || ""}
                onChange={(e) => updatePrescriptionField("findings", e.target.value)}
                placeholder="Findings"
                rows={2}
              />
              <Textarea
                value={prescription.diagnosis || ""}
                onChange={(e) => updatePrescriptionField("diagnosis", e.target.value)}
                placeholder="Provisional/Diagnosis"
                rows={2}
              />
            </div>

            {/* Medicines - Mobile */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Medicines</h3>
              {medicines.map((medicine, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Medicine {index + 1}</h4>
                    {medicines.length > 1 && (
                      <Button onClick={() => removeMedicine(index)} size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={medicine.medicine_name}
                      onValueChange={(value) => updateMedicine(index, "medicine_name", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_MEDICINES.map((med) => (
                          <SelectItem key={med} value={med}>
                            {med}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={medicine.medicine_type}
                      onValueChange={(value) => updateMedicine(index, "medicine_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDICINE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={medicine.dosage_amount}
                      onChange={(e) => updateMedicine(index, "dosage_amount", e.target.value)}
                      placeholder="500mg"
                    />
                    <Input
                      type="number"
                      value={medicine.duration_days || ""}
                      onChange={(e) =>
                        updateMedicine(index, "duration_days", Number.parseInt(e.target.value) || undefined)
                      }
                      placeholder="Days"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={medicine.morning_dose}
                      onChange={(e) => updateMedicine(index, "morning_dose", Number.parseInt(e.target.value) || 0)}
                      placeholder="Morning"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={medicine.afternoon_dose}
                      onChange={(e) => updateMedicine(index, "afternoon_dose", Number.parseInt(e.target.value) || 0)}
                      placeholder="Afternoon"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={medicine.evening_dose}
                      onChange={(e) => updateMedicine(index, "evening_dose", Number.parseInt(e.target.value) || 0)}
                      placeholder="Evening"
                    />
                  </div>
                  <Textarea
                    value={medicine.instructions || ""}
                    onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
                    placeholder="Instructions"
                    rows={1}
                  />
                </div>
              ))}
              <Button onClick={addMedicine} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine   1112
              </Button>
            </div>

            {/* Mobile Print Button */}
            <div className="flex justify-center pt-4">
              <Button onClick={printCurrentForm} className="w-full sm:w-auto">
                <Printer className="w-4 h-4 mr-2" />
                Print Prescription
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
