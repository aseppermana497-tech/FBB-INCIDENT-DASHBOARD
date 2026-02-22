"use client"

import { ClipboardPaste } from "lucide-react"
import type { FilterState } from "@/lib/types"


interface FilterBarProps {
  filters: FilterState
  onFilterChange: (key: keyof FilterState, value: string) => void
  onPasteRaw: () => void
  regionals?: string[]
}

const selectClass = 
  `h-9 w-[100px] rounded-lg border border-blue-900/80
   bg-[linear-gradient(to_bottom,_rgba(6,15,35,1)_0%,_rgba(25,50,100,1)_50%,_rgba(6,15,35,1)_100%)]
   px-3 text-[#7dd3fc] text-xs
   transition-all duration-200
   hover:shadow-[inset_0_0_18px_rgba(37,99,235,0.35)]
   focus:outline-none focus:ring-1 focus:ring-blue-500/40`

export function FilterBar({ filters, onFilterChange, onPasteRaw, regionals = [] }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
  {/* Left group: Paste Raw + Period + Date */}
  <button
  onClick={onPasteRaw}
  className="flex h-9 items-center gap-1.5 rounded-lg
  border border-blue-900/80
  bg-[linear-gradient(to_bottom,_rgba(6,15,35,1)_0%,_rgba(0,50,100,1)_50%,_rgba(6,15,35,1)_100%)]
  px-3 text-xs
  text-[#7dd3fc]
  shadow-[inset_0_0_14px_rgba(37,99,235,0.25)]
  transition-all duration-200
  hover:shadow-[inset_0_0_18px_rgba(37,99,235,0.35)]
  focus:outline-none focus:ring-1 focus:ring-blue-500/40"
  >
    <ClipboardPaste className="h-3 w-3" />
    Paste Raw
  </button>

      <select
        className={selectClass} 
        value={filters.period}
        onChange={(e) => onFilterChange("period", e.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <div className="flex items-center gap-1.5">
  <input
    type="date"
    className={`${selectClass} w-[120px]`}
    value={filters.dateFrom}
    onChange={(e) => onFilterChange("dateFrom", e.target.value)}
  />

  <span className="text-[10px] text-muted-foreground">-</span>

  <input
    type="date"
    className={`${selectClass} w-[120px]`}
    value={filters.dateTo}
    onChange={(e) => onFilterChange("dateTo", e.target.value)}
  />
</div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right group: Area + Regional + Severity + Status */}
      <select
        className={selectClass}
        value={filters.area}
        onChange={(e) => onFilterChange("area", e.target.value)}
      >
        <option value="">Area</option>
        <option value="Area 1">Area 1</option>
        <option value="Area 2">Area 2</option>
        <option value="Area 3">Area 3</option>
        <option value="Area 4">Area 4</option>
      </select>

      <select
        className={selectClass}
        value={filters.regional}
        onChange={(e) => onFilterChange("regional", e.target.value)}
      >
        <option value="">Regional</option>
        {regionals.map((r) => (
          <option key={r} value={r}>
  R{r.replace(/\D/g, "")}
</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.severity}
        onChange={(e) => onFilterChange("severity", e.target.value)}
      >
        <option value="">Severity</option>
        <option value="CRITICAL">CRITICAL</option>
        <option value="MAJOR">MAJOR</option>
        <option value="MINOR">MINOR</option>
        <option value="LOW">LOW</option>
      </select>

      <select
        className={selectClass}
        value={filters.status}
        onChange={(e) => onFilterChange("status", e.target.value)}
      >
        <option value="">Status</option>
        <option value="OPEN">Open</option>
        <option value="CLOSED">Closed</option>
      </select>
    </div>
  )
}