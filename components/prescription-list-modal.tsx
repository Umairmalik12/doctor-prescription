"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  List,
  Grid,
  Eye,
  Printer,
  Search,
  Calendar,
  User,
  FileText,
  Pill,
} from "lucide-react"

import {
  supabase,
  type Prescription,
  type PrescriptionMedicine,
} from "@/lib/supabase"

import { useToast } from "@/hooks/use-toast"

interface PrescriptionWithMedicines
  extends Prescription {
  medicines: PrescriptionMedicine[]
}

interface PrescriptionListModalProps {
  trigger?: React.ReactNode
}

export default function PrescriptionListModal({
  trigger,
}: PrescriptionListModalProps) {
  const { toast } = useToast()

  const [prescriptions, setPrescriptions] =
    useState<PrescriptionWithMedicines[]>([])

  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionWithMedicines | null>(
      null
    )

  const [isLoading, setIsLoading] =
    useState(false)

  const [searchTerm, setSearchTerm] =
    useState("")

  const [viewMode, setViewMode] = useState<
    "list" | "grid"
  >("list")

  const [isOpen, setIsOpen] = useState(false)

  const [detailsOpen, setDetailsOpen] =
    useState(false)

  // ✅ FIXED: ONLY ONE DATABASE REQUEST
  const fetchPrescriptions = async () => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          medicines:prescription_medicines(*)
        `)
        .order("created_at", {
          ascending: false,
        })

      if (error) {
        throw error
      }

      setPrescriptions(
        (data as PrescriptionWithMedicines[]) ||
        []
      )
    } catch (error) {
      console.error(
        "Error fetching prescriptions:",
        error
      )

      toast({
        title: "Error",
        description:
          "Failed to fetch prescriptions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchPrescriptions()
    }
  }, [isOpen])

  // ✅ FIXED: NO EXTRA STATE / NO EXTRA REQUESTS
  const filteredPrescriptions = useMemo(() => {
    const search =
      searchTerm.toLowerCase()

    return prescriptions.filter(
      (prescription) =>
        prescription.patient_name
          ?.toLowerCase()
          .includes(search) ||
        prescription.ref_no
          ?.toLowerCase()
          .includes(search) ||
        prescription.diagnosis
          ?.toLowerCase()
          .includes(search)
    )
  }, [searchTerm, prescriptions])

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) return "N/A"

    return new Date(
      dateString
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDosageText = (
    medicine: PrescriptionMedicine
  ) => {
    return `${medicine.morning_dose}+${medicine.afternoon_dose}+${medicine.evening_dose}`
  }

  const handleViewDetails = (
    prescription: PrescriptionWithMedicines
  ) => {
    setSelectedPrescription(prescription)
    setDetailsOpen(true)
  }

  // ✅ FIXED: SAFE WINDOW USAGE
  const handlePrint = (
    prescription: PrescriptionWithMedicines
  ) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "prescription",
        JSON.stringify(prescription)
      )

      window.open("/", "_blank")
    }
  }

  const PrescriptionCard = ({
    prescription,
  }: {
    prescription: PrescriptionWithMedicines
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-blue-800">
              {prescription.patient_name}
            </CardTitle>

            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-xs"
              >
                {prescription.ref_no ||
                  "No Ref"}
              </Badge>

              <Badge
                variant="secondary"
                className="text-xs"
              >
                Visit #
                {prescription.visit_no}
              </Badge>
            </div>
          </div>

          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />

              {formatDate(
                prescription.created_at || ""
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />

            <span>
              {prescription.patient_age}{" "}
              years,{" "}
              {prescription.patient_sex}
              {prescription.patient_weight &&
                `, ${prescription.patient_weight}kg`}
            </span>
          </div>

          {prescription.diagnosis && (
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />

              <span className="text-gray-700">
                {prescription.diagnosis}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-gray-400" />

            <span className="text-gray-600">
              {
                prescription.medicines
                  ?.length
              }{" "}
              medicine(s) prescribed
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="flex-1"
            onClick={() =>
              handleViewDetails(
                prescription
              )
            }
          >
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handlePrint(prescription)
            }
          >
            <Printer className="w-3 h-3 mr-1" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const PrescriptionListItem = ({
    prescription,
  }: {
    prescription: PrescriptionWithMedicines
  }) => (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-blue-800">
              {prescription.patient_name}
            </h3>

            <Badge
              variant="outline"
              className="text-xs"
            >
              {prescription.ref_no ||
                "No Ref"}
            </Badge>

            <Badge
              variant="secondary"
              className="text-xs"
            >
              Visit #
              {prescription.visit_no}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
            <div>
              <span className="font-medium">
                Age/Sex:
              </span>{" "}
              {prescription.patient_age}{" "}
              years,{" "}
              {prescription.patient_sex}
            </div>

            <div>
              <span className="font-medium">
                Contact:
              </span>{" "}
              {prescription.patient_contact ||
                "N/A"}
            </div>

            <div>
              <span className="font-medium">
                Date:
              </span>{" "}
              {formatDate(
                prescription.created_at || ""
              )}
            </div>

            <div>
              <span className="font-medium">
                Medicines:
              </span>{" "}
              {
                prescription.medicines
                  ?.length
              }{" "}
              prescribed
            </div>
          </div>

          {prescription.diagnosis && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">
                Diagnosis:
              </span>{" "}
              <span className="text-gray-600">
                {prescription.diagnosis}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            size="sm"
            onClick={() =>
              handleViewDetails(
                prescription
              )
            }
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handlePrint(prescription)
            }
          >
            <Printer className="w-3 h-3 mr-1" />
            Print
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline">
              <List className="w-4 h-4 mr-2" />
              View Prescriptions
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Saved Prescriptions (
              {
                filteredPrescriptions.length
              }
              )
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

                <Input
                  placeholder="Search by patient name, ref no, or diagnosis..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  className="pl-10"
                />
              </div>

              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  size="sm"
                  variant={
                    viewMode === "list"
                      ? "default"
                      : "ghost"
                  }
                  onClick={() =>
                    setViewMode("list")
                  }
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant={
                    viewMode === "grid"
                      ? "default"
                      : "ghost"
                  }
                  onClick={() =>
                    setViewMode("grid")
                  }
                  className="h-8 px-3"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* LIST */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500">
                    Loading prescriptions...
                  </div>
                </div>
              ) : filteredPrescriptions.length ===
                0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "No prescriptions found."
                    : "No prescriptions found."}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPrescriptions.map(
                    (prescription) => (
                      <PrescriptionCard
                        key={
                          prescription.id
                        }
                        prescription={
                          prescription
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPrescriptions.map(
                    (prescription) => (
                      <PrescriptionListItem
                        key={
                          prescription.id
                        }
                        prescription={
                          prescription
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DETAILS MODAL */}
      <Dialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Prescription Details -
              {
                selectedPrescription?.patient_name
              }
            </DialogTitle>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              <Tabs
                defaultValue="patient"
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="patient">
                    Patient Info
                  </TabsTrigger>

                  <TabsTrigger value="clinical">
                    Clinical Info
                  </TabsTrigger>

                  <TabsTrigger value="medicines">
                    Medicines
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="patient">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Patient Information
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium">
                          Name:
                        </label>

                        <p>
                          {
                            selectedPrescription.patient_name
                          }
                        </p>
                      </div>

                      <div>
                        <label className="font-medium">
                          Ref No:
                        </label>

                        <p>
                          {selectedPrescription.ref_no ||
                            "N/A"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() =>
                    setDetailsOpen(false)
                  }
                >
                  Close
                </Button>

                <Button
                  onClick={() =>
                    handlePrint(
                      selectedPrescription
                    )
                  }
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Prescription
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
