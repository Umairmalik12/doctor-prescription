"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface OptimizedBackgroundProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function OptimizedBackground({ children, className, style }: OptimizedBackgroundProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setImageLoaded(true)
    img.src = "/prescription-bg.png"
  }, [])

  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundImage: imageLoaded ? "url('/prescription-bg.png')" : "none",
        backgroundColor: imageLoaded ? "transparent" : "#f8f9fa",
      }}
    >
      {children}
    </div>
  )
}
