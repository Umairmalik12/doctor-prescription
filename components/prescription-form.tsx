"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, Printer } from "lucide-react"
import { supabase, mockSupabase, isDemoMode, type Prescription, type PrescriptionMedicine } from "@/lib/supabase"
import { MEDICINE_TYPES, COMMON_MEDICINES, DOSAGE_PATTERNS } from "@/lib/medicines-data"
import { useToast } from "@/hooks/use-toast"

interface MedicineFormData extends Omit<PrescriptionMedicine, "id" | "prescription_id"> {}

export default function PrescriptionForm() {
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
      morning_dose: 0,
      afternoon_dose: 0,
      evening_dose: 0,
      duration_days: undefined,
      instructions: "",
    },
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [savedPrescriptionId, setSavedPrescriptionId] = useState<string | null>(null)

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        medicine_name: "",
        medicine_type: "tablet",
        dosage_amount: "",
        morning_dose: 0,
        afternoon_dose: 0,
        evening_dose: 0,
        duration_days: undefined,
        instructions: "",
      },
    ])
  }

  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index))
    }
  }

  const updateMedicine = (index: number, field: keyof MedicineFormData, value: any) => {
    const updated = medicines.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    setMedicines(updated)
  }

  const parseDosagePattern = (pattern: string) => {
    const [morning, afternoon, evening] = pattern.split("+").map(Number)
    return { morning, afternoon, evening }
  }

  const savePrescription = async () => {
    setIsLoading(true)
    try {
      let prescriptionData: Prescription & { id: string }

      if (isDemoMode) {
        // Use mock functions in demo mode
        const result = await mockSupabase.savePrescription(prescription)
        prescriptionData = result.data

        // Mock save medicines
        const medicinesWithPrescriptionId = medicines
          .filter((med) => med.medicine_name.trim() !== "")
          .map((med) => ({
            ...med,
            prescription_id: prescriptionData.id,
          }))

        if (medicinesWithPrescriptionId.length > 0) {
          await mockSupabase.saveMedicines(medicinesWithPrescriptionId)
        }
      } else {
        // Use real Supabase in production
        const { data: realPrescriptionData, error: prescriptionError } = await supabase
          .from("prescriptions")
          .insert([prescription])
          .select()
          .single()

        if (prescriptionError) throw prescriptionError
        prescriptionData = realPrescriptionData

        // Save medicines
        const medicinesWithPrescriptionId = medicines
          .filter((med) => med.medicine_name.trim() !== "")
          .map((med) => ({
            ...med,
            prescription_id: prescriptionData.id,
          }))

        if (medicinesWithPrescriptionId.length > 0) {
          const { error: medicinesError } = await supabase
            .from("prescription_medicines")
            .insert(medicinesWithPrescriptionId)

          if (medicinesError) throw medicinesError
        }
      }

      setSavedPrescriptionId(prescriptionData.id)
      toast({
        title: "Success",
        description: isDemoMode ? "Prescription saved successfully! (Demo Mode)" : "Prescription saved successfully!",
      })
    } catch (error) {
      console.error("Error saving prescription:", error)
      toast({
        title: "Error",
        description: "Failed to save prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const printPrescription = () => {
    if (savedPrescriptionId) {
        window.open(`/prescription/print/${savedPrescriptionId}? patient_name=${prescription.patient_name} &patient_age=${prescription.patient_age} &patient_sex=${prescription.patient_sex} &patient_weight=${prescription.patient_weight} &patient_contact=${prescription.patient_contact} &patient_address=${prescription.patient_address} &allergies=${prescription.allergies} &symptoms=${prescription.symptoms} &findings=${prescription.findings} &diagnosis=${prescription.diagnosis} &medicines=${medicines}`, "_blank")
    } else {
      toast({
        title: "Save Required",
        description: "Please save the prescription before printing.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {isDemoMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This is running in demo mode. To use with real data, configure your Supabase environment variables.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Digital Prescription System</h1>
        <div className="flex gap-2">
          <Button onClick={savePrescription} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button onClick={printPrescription} variant="outline" disabled={!savedPrescriptionId}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="ref_no">Ref. No.</Label>
            <Input
              id="ref_no"
              value={prescription.ref_no || ""}
              onChange={(e) => setPrescription({ ...prescription, ref_no: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="visit_no">Visit No.</Label>
            <Input
              id="visit_no"
              type="number"
              value={prescription.visit_no || ""}
              onChange={(e) => setPrescription({ ...prescription, visit_no: Number.parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <Label htmlFor="patient_name">Patient Name *</Label>
            <Input
              id="patient_name"
              value={prescription.patient_name}
              onChange={(e) => setPrescription({ ...prescription, patient_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={prescription.patient_age || ""}
              onChange={(e) =>
                setPrescription({ ...prescription, patient_age: Number.parseInt(e.target.value) || undefined })
              }
            />
          </div>
          <div>
            <Label htmlFor="sex">Sex</Label>
            <Select
              value={prescription.patient_sex || ""}
              onValueChange={(value) => setPrescription({ ...prescription, patient_sex: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={prescription.patient_weight || ""}
              onChange={(e) =>
                setPrescription({ ...prescription, patient_weight: Number.parseFloat(e.target.value) || undefined })
              }
            />
          </div>
          <div>
            <Label htmlFor="contact">Contact No.</Label>
            <Input
              id="contact"
              value={prescription.patient_contact || ""}
              onChange={(e) => setPrescription({ ...prescription, patient_contact: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={prescription.patient_address || ""}
              onChange={(e) => setPrescription({ ...prescription, patient_address: e.target.value })}
            />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={prescription.allergies || ""}
              onChange={(e) => setPrescription({ ...prescription, allergies: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clinical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              value={prescription.symptoms || ""}
              onChange={(e) => setPrescription({ ...prescription, symptoms: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="findings">Findings</Label>
            <Textarea
              id="findings"
              value={prescription.findings || ""}
              onChange={(e) => setPrescription({ ...prescription, findings: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="diagnosis">Provisional/Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={prescription.diagnosis || ""}
              onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Medicines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Prescription Medicines
            <Button onClick={addMedicine} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {medicines.map((medicine, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Medicine {index + 1}</h4>
                {medicines.length > 1 && (
                  <Button onClick={() => removeMedicine(index)} size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Medicine Name</Label>
                  <Select
                    value={medicine.medicine_name}
                    onValueChange={(value) => updateMedicine(index, "medicine_name", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_MEDICINES.map((med) => (
                        <SelectItem key={med} value={med}>
                          {med} dsfdsf
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Type</Label>
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
                </div>

                <div>
                  <Label>Dosage</Label>
                  <Input
                    value={medicine.dosage_amount}
                    onChange={(e) => updateMedicine(index, "dosage_amount", e.target.value)}
                    placeholder="e.g., 500mg, 1g, 5ml"
                  />
                </div>

                <div>
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    value={medicine.duration_days || ""}
                    onChange={(e) =>
                      updateMedicine(index, "duration_days", Number.parseInt(e.target.value) || undefined)
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Dosage Pattern</Label>
                <Select
                  value={`${medicine.morning_dose}+${medicine.afternoon_dose}+${medicine.evening_dose}`}
                  onValueChange={(value) => {
                    const { morning, afternoon, evening } = parseDosagePattern(value)
                    updateMedicine(index, "morning_dose", morning)
                    updateMedicine(index, "afternoon_dose", afternoon)
                    updateMedicine(index, "evening_dose", evening)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOSAGE_PATTERNS.map((pattern) => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Morning</Label>
                  <Input
                    type="number"
                    min="0"
                    value={medicine.morning_dose}
                    onChange={(e) => updateMedicine(index, "morning_dose", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Afternoon</Label>
                  <Input
                    type="number"
                    min="0"
                    value={medicine.afternoon_dose}
                    onChange={(e) => updateMedicine(index, "afternoon_dose", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Evening</Label>
                  <Input
                    type="number"
                    min="0"
                    value={medicine.evening_dose}
                    onChange={(e) => updateMedicine(index, "evening_dose", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label>Instructions</Label>
                <Textarea
                  value={medicine.instructions || ""}
                  onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
                  placeholder="e.g., Take after meals, Take with water"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
