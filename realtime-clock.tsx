"use client"

import { useState, useEffect } from "react"

export function RealtimeClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!now) return null

  const formatted = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const time = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  return (
    <span className="text-xs text-muted-foreground">
      {formatted}{" "}
      <span className="font-mono font-bold text-[hsl(var(--primary))]">{time}</span>
    </span>
  )
}
