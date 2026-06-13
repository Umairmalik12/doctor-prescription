"use client"

import { useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "custom-medicines-v1"

function safeParseJSON(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x) => typeof x === "string")
  } catch {
    return []
  }
}

export function useMedicineDrafts(baseMedicines: string[]) {
  const baseSet = useMemo(() => new Set(baseMedicines.map((m) => m.trim()).filter(Boolean)), [baseMedicines])
  const [custom, setCustom] = useState<string[]>([])

  useEffect(() => {
    // load persisted custom medicines
    setCustom((prev) => {
      // initial load
      const loaded = safeParseJSON(typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null)
      // merge+dedupe with base
      return Array.from(new Set([...loaded]))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allMedicines = useMemo(() => {
    const merged = new Set<string>()
    for (const m of baseSet) merged.add(m)
    for (const m of custom) merged.add(m.trim())
    return Array.from(merged).filter(Boolean).sort((a, b) => a.localeCompare(b))
  }, [baseSet, custom])

  const addCustomMedicine = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    setCustom((prev) => {
      const next = Array.from(new Set([...prev, trimmed]))
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      }
      return next
    })
  }

  return { allMedicines, addCustomMedicine }
}

