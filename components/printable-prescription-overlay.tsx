"use client"

import { useEffect, useState } from "react"
import type { Prescription, PrescriptionMedicine } from "@/lib/supabase"

interface PrintablePrescriptionProps {
  prescription: Prescription
  medicines: PrescriptionMedicine[]
  relation?: string // Add this line
}

export default function PrintablePrescriptionOverlay({ prescription, medicines, relation }: PrintablePrescriptionProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    setFormattedDate(
      prescription.created_at
        ? new Date(prescription.created_at).toLocaleDateString()
        : new Date().toLocaleDateString()
    )
  }, [prescription.created_at])

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageLoaded(true)
      setTimeout(() => {
        window.print()
      }, 1000)
    }
    img.onerror = () => {
      setImageLoaded(true)
      setTimeout(() => {
        window.print()
      }, 500)
    }
    img.src = "/prescription-form-bg.png"
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString()
    return new Date(dateString).toLocaleDateString()
  }

  const getDosageText = (medicine: PrescriptionMedicine) => {
    return `${medicine.morning_dose}+${medicine.afternoon_dose}+${medicine.evening_dose}`
  }

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body { 
            margin: 0 !important; 
            padding: 0 !important;
          }
          .no-print { 
            display: none !important; 
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
          .print-text {
            color: #000 !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            line-height: 1.2 !important;
            position: absolute !important;
          }
        }
        .prescription-container {
          width: 794px;
          height: 1123px;
          position: relative;
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
          color: #000;
          font-weight: 600;
          font-size: 14px;
          line-height: 1.2;
          position: absolute;
        }
      `}</style>

      {!imageLoaded && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prescription template...</p>
          </div>
        </div>
      )}

      {imageLoaded && (
        <div className="prescription-container">
          {/* Background Image - This WILL print */}
          <img
            src="/prescription-form-bg.png"
            alt="Prescription Form Background"
            className="background-image"
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: "0",
              left: "0",
              zIndex: 1,
              objectFit: "cover",
            }}
          />

          {/* Content Overlay */}
          <div className="content-overlay">
            {/* Row 1: Ref No, Date, Visit No */}
            {prescription.ref_no && (
              <div className="print-text" style={{ top: "283px", left: "98px", width: "220px", zIndex: 2 }}>
                {prescription.ref_no}
              </div>
            )}

            <div className="print-text" style={{ top: "275px", left: "390px", width: "140px", zIndex: 2 }}>
              {formattedDate}
            </div>

            <div
              className="print-text"
              style={{ top: "275px", left: "620px", width: "60px", textAlign: "center", zIndex: 2 }}
            >
              {prescription.visit_no || 1}
            </div>

            {/* Row 2: Patient Name */}
            {prescription.patient_name && (
              <div className="print-text" style={{ top: "319px", left: "140px", width: "280px", zIndex: 2 }}>
                {prescription.patient_name}
              </div>
            )}

            {/* Row 2: Relation Field (S/o, D/o, W/o) */}
            {relation && (
              <div className="print-text" style={{ top: "317px", left: "493px", width: "280px", zIndex: 2 }}>
                {relation}
              </div>
            )}

            {/* Row 3: Age, Sex, Weight, Contact */}
            {prescription.patient_age && (
              <div className="print-text" style={{ top: "353px", left: "87px", width: "60px", zIndex: 2 }}>
                {prescription.patient_age}
              </div>
            )}

            {prescription.patient_sex && (
              <div className="print-text" style={{ top: "352px", left: "220px", width: "85px", zIndex: 2 }}>
                {prescription.patient_sex}
              </div>
            )}

            {prescription.patient_weight && (
              <div className="print-text" style={{ top: "351px", left: "423px", width: "60px", zIndex: 2 }}>
                {prescription.patient_weight}
              </div>
            )}

            {prescription.patient_contact && (
              <div className="print-text" style={{ top: "355px", left: "593px", width: "170px", zIndex: 2 }}>
                {prescription.patient_contact}
              </div>
            )}

            {/* Row 4: Address, Allergies */}
            {prescription.patient_address && (
              <div className="print-text" style={{ top: "390px", left: "98px", width: "320px", zIndex: 2 }}>
                {prescription.patient_address}
              </div>
            )}

            {prescription.allergies && (
              <div className="print-text" style={{ top: "390px", left: "480px", width: "270px", zIndex: 2 }}>
                {prescription.allergies}
              </div>
            )}

            {/* Row 5: Symptoms, Findings */}
            {prescription.symptoms && (
              <div
                className="print-text"
                style={{
                  top: "419px",
                  left: "116px",
                  width: "320px",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  zIndex: 2,
                }}
              >
                {prescription.symptoms}
              </div>
            )}

            {prescription.findings && (
              <div
                className="print-text"
                style={{
                  top: "421px",
                  left: "493px",
                  width: "270px",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  zIndex: 2,
                }}
              >
                {prescription.findings}
              </div>
            )}

            {/* Row 6: Diagnosis */}
            {prescription.diagnosis && (
              <div
                className="print-text"
                style={{
                  top: "455px",
                  left: "200px",
                  width: "500px",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  zIndex: 2,
                }}
              >
                {prescription.diagnosis}
              </div>
            )}

            {/* Medicines - Prescription Area */}
            <div style={{ position: "absolute", top: "620px", left: "50px", right: "50px", zIndex: 2 }}>
              {medicines.map((medicine, index) => (
                <div key={medicine.id || index} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <span style={{ color: "#1e40af", fontWeight: "bold", marginRight: "8px", fontSize: "14px" }}>
                      {index + 1}.
                    </span>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#000" }}>
                        {medicine.medicine_name} {medicine.dosage_amount} ({medicine.medicine_type})
                      </div>
                      <div style={{ fontSize: "12px", marginTop: "4px", marginLeft: "8px", color: "#374151" }}>
                        <span style={{ fontWeight: "500" }}>Dosage:</span> {getDosageText(medicine)}
                        {medicine.duration_days && <span> for {medicine.duration_days} days</span>}
                        {medicine.instructions && <span> - {medicine.instructions}</span>}
                      </div>
                      {/* Urdu Name and Dose */}
                      {(medicine.medicine_name_urdu || medicine.dose_urdu) && (
                        <div style={{
                          fontSize: "15px",
                          marginTop: "6px",
                          color: "#0a0a0a",
                          fontFamily: "'Noto Nastaliq Urdu', serif",
                          direction: "rtl",
                          textAlign: "right"
                        }}>
                          {medicine.medicine_name_urdu && <div>{medicine.medicine_name_urdu}</div>}
                          {medicine.dose_urdu && <div>{medicine.dose_urdu}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Print Button - Hidden during print */}
      <div className="no-print fixed bottom-4 right-4 z-50">
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700"
            disabled={!imageLoaded}
          >
            {imageLoaded ? "Print Prescription" : "Loading..."}
          </button>
          <button
            onClick={() => window.close()}
            className="bg-gray-600 text-white px-4 py-2 rounded shadow-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
