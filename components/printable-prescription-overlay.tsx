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
