"use client"

import { useEffect } from "react"
import type { Prescription, PrescriptionMedicine } from "@/lib/supabase"

interface PrintablePrescriptionProps {
  prescription: Prescription
  medicines: PrescriptionMedicine[]
}

export default function PrintablePrescription({ prescription, medicines }: PrintablePrescriptionProps) {
  useEffect(() => {
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
    <div
      className="min-h-screen bg-white p-10 print:p-0"
      style={{
        backgroundImage: `url('/prescription-bg.jpeg')`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        backgroundSize: "cover"
      }}
    >
      <style jsx global>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        .field-line {
          border-bottom: 1px solid #444;
          flex: 1;
          padding: 0 6px;
          min-height: 18px;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between mb-6">
        {/* Left English */}
        <div className="text-left leading-tight">
          <div className="text-sm font-semibold">P-Associate Professor p</div>
          <div className="text-lg font-bold text-blue-900">Dr. Tanveer-ul-Haq</div>
          <div className="text-xs">M.B.B.S., F.C.P.S.</div>
          <div className="text-xs">Senior Consultant</div>
          <div className="text-xs">Head of Urology Department</div>
          <div className="text-xs">Multan Institute of Kidney Diseases</div>
          <div className="text-xs">PHC Reg No: 26970</div>
        </div>

        {/* Center Logo */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-2 border-blue-700 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
            UROCARE
          </div>
        </div>

        {/* Right Urdu */}
 
      </div>

      {/* Patient Info */}
      <div className="grid grid-cols-2 gap-6 text-xs mb-6">
        <div className="space-y-2">
          <div className="flex items-center"><span className="w-24 font-semibold">Ref No:</span><div className="field-line">{prescription.ref_no || ""}</div></div>
          <div className="flex items-center"><span className="w-24 font-semibold">Patient Name:</span><div className="field-line">{prescription.patient_name}</div></div>
          <div className="flex items-center">
            <span className="w-24 font-semibold">Age:</span><div className="field-line w-16">{prescription.patient_age || ""}</div>
            <span className="w-16 font-semibold ml-4">Sex:</span><div className="field-line w-16">{prescription.patient_sex || ""}</div>
          </div>
          <div className="flex items-center"><span className="w-24 font-semibold">Address:</span><div className="field-line">{prescription.patient_address || ""}</div></div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-16 font-semibold">Time:</span><div className="field-line w-20"></div>
            <span className="w-16 font-semibold ml-4">Date:</span><div className="field-line w-20">{formatDate(prescription.created_at)}</div>
            <span className="w-20 font-semibold ml-4">No. of Visits:</span><div className="field-line w-12">{prescription.visit_no || 1}</div>
          </div>
          <div className="flex items-center"><span className="w-20 font-semibold">S/o, D/o, W/o:</span><div className="field-line"></div></div>
          <div className="flex items-center">
            <span className="w-20 font-semibold">Weight:</span><div className="field-line w-20">{prescription.patient_weight || ""}</div>
            <span className="w-24 font-semibold ml-4">Contact No:</span><div className="field-line">{prescription.patient_contact || ""}</div>
          </div>
          <div className="flex items-center"><span className="w-20 font-semibold">Allergies:</span><div className="field-line">{prescription.allergies || ""}</div></div>
        </div>
      </div>

      {/* Clinical Info */}
      <div className="grid grid-cols-2 gap-6 text-xs mb-6">
        <div className="flex items-center"><span className="w-24 font-semibold">Symptoms:</span><div className="field-line">{prescription.symptoms || ""}</div></div>
        <div className="flex items-center"><span className="w-20 font-semibold">Findings:</span><div className="field-line">{prescription.findings || ""}</div></div>
      </div>

      {/* Diagnosis */}
      <div className="mb-6 text-xs flex items-center">
        <span className="w-40 font-semibold">Provisional / Diagnosis:</span>
        <div className="field-line">{prescription.diagnosis || ""}</div>
      </div>

      {/* Medicines */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4">Rx</h3>
        <div className="space-y-4">
          {medicines.map((medicine, index) => (
            <div key={medicine.id || index} className="border-l-2 border-blue-600 pl-4">
              <div className="font-semibold text-sm">
                {index + 1}. {medicine.medicine_name} {medicine.dosage_amount} ({medicine.medicine_type})
              </div>
              <div className="text-xs text-gray-700 ml-4">
                <div>Dosage: {getDosageText(medicine)}</div>
                {medicine.duration_days && <div>Duration: {medicine.duration_days} days</div>}
                {medicine.instructions && <div>Instructions: {medicine.instructions}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      {/* <div className="mt-12 pt-4 border-t-2 border-blue-600 flex justify-between text-xs text-blue-900">
        <div>
          <p className="font-bold">حق میڈیکل سنٹر / Haq Medical Center</p>
          <p>Kidney Center - Urology & Nephrology Care</p>
          <p>Rescue 1122 کے سامنے، گلی نمبر 2، سیکٹر ایچ، ڈی ایچ اے ملتان</p>
        </div>
        <div className="text-right">
          <p>فون: 24 گھنٹے دستیاب</p>
          <p>دعا: اللہ آپ کو صحت و سلامتی عطا فرمائے۔ آمین</p>
        </div>
      </div> */}

      {/* Print Button */}
      {/* <div className="no-print fixed bottom-4 right-4">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700"
        >
          Print Prescription
        </button>
      </div> */}
    </div>
  )
}
