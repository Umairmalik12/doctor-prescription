"use client"

import { useEffect } from "react"
import type { Prescription, PrescriptionMedicine } from "@/lib/supabase"

interface PrintablePrescriptionProps {
  prescription: Prescription
  medicines: PrescriptionMedicine[]
}

export default function PrintablePrescription({ prescription, medicines }: PrintablePrescriptionProps) {
  useEffect(() => {
    // Auto-print when component loads
    const timer = setTimeout(() => {
      window.print()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString()
    return new Date(dateString).toLocaleDateString()
  }

  const getDosageText = (medicine: PrescriptionMedicine) => {
    const doses = []
    if (medicine.morning_dose > 0) doses.push(`${medicine.morning_dose} morning`)
    if (medicine.afternoon_dose > 0) doses.push(`${medicine.afternoon_dose} afternoon`)
    if (medicine.evening_dose > 0) doses.push(`${medicine.evening_dose} evening`)
    return doses.join(", ")
  }

  return (
    <div className="min-h-screen bg-white p-8 print:p-0">
      <style jsx global>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-blue-600 pb-4">
        <div className="flex justify-between items-start">
          <div className="text-left">
            <h1 className="text-xl font-bold text-blue-800">P-Associate Professor</h1>
            <h2 className="text-2xl font-bold text-blue-900">Dr. Tanveer-ul-Haq</h2>
            <p className="text-sm">M.B.B.S., F.C.P.S.</p>
            <p className="text-sm">Senior Consultant</p>
            <p className="text-sm">Head of Urology Department</p>
            <p className="text-sm">Multan Institute of Kidney Diseases</p>
            <p className="text-sm">PHC Reg No 26970</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 border-2 border-blue-600 rounded-full flex items-center justify-center mb-2">
              <div className="text-blue-600 font-bold text-xs">UROCARE</div>
            </div>
          </div>

          <div className="text-right text-blue-800">
            <h3 className="text-xl font-bold">ڈاکٹر تنویر الحق</h3>
            <p className="text-sm">ایم بی بی ایس، ایف سی پی ایس</p>
            <p className="text-sm">سینئر کنسلٹنٹ</p>
            <p className="text-sm">صدر شعبہ یورولوجی</p>
            <p className="text-sm">ملتان انسٹی ٹیوٹ آف کڈنی ڈزیزز</p>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="space-y-2">
          <div className="flex">
            <span className="font-semibold w-24">Ref. No:</span>
            <span className="border-b border-gray-400 flex-1 px-2">{prescription.ref_no || ""}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">Patient Name:</span>
            <span className="border-b border-gray-400 flex-1 px-2">{prescription.patient_name}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">Age:</span>
            <span className="border-b border-gray-400 w-20 px-2">{prescription.patient_age || ""}</span>
            <span className="font-semibold ml-4 w-16">Sex:</span>
            <span className="border-b border-gray-400 w-20 px-2">{prescription.patient_sex || ""}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">Address:</span>
            <span className="border-b border-gray-400 flex-1 px-2">{prescription.patient_address || ""}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex">
            <span className="font-semibold w-20">Time:</span>
            <span className="border-b border-gray-400 w-24 px-2"></span>
            <span className="font-semibold ml-4 w-16">Date:</span>
            <span className="border-b border-gray-400 w-24 px-2">{formatDate(prescription.created_at)}</span>
            <span className="font-semibold ml-4">No of Visit:</span>
            <span className="border-b border-gray-400 w-16 px-2">{prescription.visit_no || 1}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-20">S/o, D/o, W/o:</span>
            <span className="border-b border-gray-400 flex-1 px-2"></span>
          </div>
          <div className="flex">
            <span className="font-semibold w-20">Weight (kg):</span>
            <span className="border-b border-gray-400 w-24 px-2">{prescription.patient_weight || ""}</span>
            <span className="font-semibold ml-4 w-20">Contact No:</span>
            <span className="border-b border-gray-400 flex-1 px-2">{prescription.patient_contact || ""}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-20">Allergies:</span>
            <span className="border-b border-gray-400 flex-1 px-2">{prescription.allergies || ""}</span>
          </div>
        </div>
      </div>

      {/* Clinical Information */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <div className="flex mb-2">
            <span className="font-semibold w-24">Symptoms:</span>
            <span className="border-b border-gray-400 flex-1 px-2">{prescription.symptoms || ""}</span>
          </div>
        </div>
        <div>
          <div className="flex mb-2">
            <span className="font-semibold w-20">Findings:</span>
            <span className="border-b border-gray-400 flex-1 px-2">{prescription.findings || ""}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 text-sm">
        <div className="flex">
          <span className="font-semibold w-32">Provisional/Diagnosis:</span>
          <span className="border-b border-gray-400 flex-1 px-2">{prescription.diagnosis || ""}</span>
        </div>
      </div>

      {/* Prescription Medicines */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4">Rx</h3>
        <div className="space-y-4">
          {medicines.map((medicine, index) => (
            <div key={medicine.id || index} className="border-l-2 border-blue-600 pl-4">
              <div className="font-semibold text-base">
                {index + 1}. {medicine.medicine_name} {medicine.dosage_amount} ({medicine.medicine_type})
              </div>
              <div className="text-sm text-gray-700 ml-4">
                <div>Dosage: {getDosageText(medicine)}</div>
                {medicine.duration_days && <div>Duration: {medicine.duration_days} days</div>}
                {medicine.instructions && <div>Instructions: {medicine.instructions}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t-2 border-blue-600">
        <div className="flex justify-between text-sm">
          <div className="text-blue-800">
            <p className="font-bold">حق میڈیکل سنٹر</p>
            <p>Rescue 1122 کے سامنے، گلی نمبر 2، سیکٹر ایچ، ڈی ایچ اے ملتان</p>
          </div>
          <div className="text-blue-800 text-right">
            <p>فون نمبر: آپ کے لیے 24 گھنٹے (آمین)</p>
          </div>
        </div>
      </div>

      {/* Print Button - Hidden in print */}
      <div className="no-print fixed bottom-4 right-4">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700"
        >
          Print Prescription
        </button>
      </div>
    </div>
  )
}
