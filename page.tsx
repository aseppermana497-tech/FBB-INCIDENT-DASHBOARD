"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Radio } from "lucide-react"
import type { Incident, FilterState } from "@/lib/types"
import {
  applyFilters,
  calculateSummary,
  processRawWA,
  generateReport,
  calcTTR,
} from "@/lib/incident-store"
import { getStoMapping } from "@/lib/sto-mapping-loader"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { IncidentTable } from "@/components/dashboard/incident-table"
import { ReportDialog } from "@/components/dashboard/report-dialog"
import { EditIncidentDialog } from "@/components/dashboard/edit-incident-dialog"
import { PasteRawDialog } from "@/components/dashboard/paste-raw-dialog"
import { RealtimeClock } from "@/components/dashboard/realtime-clock"

const STORAGE_KEY = "noc_incidents"
const FILTER_KEY = "noc_filters"

function loadIncidents(): Incident[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveIncidents(incidents: Incident[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents))
}

function loadFilters(): FilterState {
  const today = new Date().toISOString().slice(0, 10)
  const defaults: FilterState = { area: "", regional: "", severity: "", status: "", dateFrom: today, dateTo: today, period: "daily" }
  if (typeof window === "undefined") return defaults
  try {
    const data = localStorage.getItem(FILTER_KEY)
    const saved = data ? JSON.parse(data) : {}
    // Migrate old single 'date' field to dateFrom/dateTo
    if (saved.date && !saved.dateFrom) {
      saved.dateFrom = saved.date
      saved.dateTo = saved.date
      delete saved.date
    }
    return { ...defaults, ...saved }
  } catch {
    return defaults
  }
}

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filters, setFilters] = useState<FilterState>(loadFilters)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editDialogIncident, setEditDialogIncident] = useState<Incident | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [detailIndex, setDetailIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  const stoMapping = useMemo(() => getStoMapping(), [])

  const regionals = useMemo(() => {
    const set = new Set<string>()
    Object.values(stoMapping).forEach((r) => set.add(r))
    return Array.from(set).sort()
  }, [stoMapping])

  useEffect(() => {
    setIncidents(loadIncidents())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) saveIncidents(incidents)
  }, [incidents, mounted])

  useEffect(() => {
    if (mounted) localStorage.setItem(FILTER_KEY, JSON.stringify(filters))
  }, [filters, mounted])

  const filtered = useMemo(() => applyFilters(incidents, filters), [incidents, filters])
  const summary = useMemo(
  () => calculateSummary(filtered, incidents, filters.period, filters.dateFrom),
  [filtered, incidents, filters.period, filters.dateFrom]
)
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handlePasteRaw = useCallback(
    (raw: string) => {
      const result = processRawWA(raw, incidents, stoMapping)
      if (result.updated) {
        setIncidents(result.incidents)
      }
      return result.parsed
    },
    [incidents, stoMapping]
  )

  const handlePasteSave = useCallback(
    (incident: Incident) => {
      const existing = incidents.findIndex((x) =>
        Array.isArray(x.tickets) && x.tickets.some((t) => incident.tickets.includes(t))
      )
      let newIncidents: Incident[]
      if (existing >= 0) {
        newIncidents = [...incidents]
        newIncidents[existing] = incident
      } else {
        newIncidents = [...incidents, incident]
      }
      setIncidents(newIncidents)
    },
    [incidents]
  )

  const handleDetail = useCallback(
    (index: number) => {
      setDetailIndex(detailIndex === index ? null : index)
      setReportOpen(false)
    },
    [detailIndex]
  )

  const handleEdit = useCallback(
    (index: number) => {
      const target = filtered[index]
      if (!target) return
      setEditDialogIncident(target)
      setEditIndex(index)
      setEditDialogOpen(true)
    },
    [filtered]
  )

  const handleDelete = useCallback(
    (index: number) => {
      const target = filtered[index]
      if (!target) return
      if (!window.confirm("Hapus incident ini?")) return
      const newIncidents = incidents.filter((x) => x !== target)
      setIncidents(newIncidents)
      setDetailIndex(null)
    },
    [incidents, filtered]
  )

  const handleUpdateIncident = useCallback(
  (updated: Incident) => {
    if (editIndex === null) return

    const target = filtered[editIndex]
    const idx = incidents.indexOf(target)
    if (idx < 0) return

    const wasOpen = target.status === "OPEN"
    const nowClosed = updated.status === "CLOSED"

    // Auto end time
    if (wasOpen && nowClosed && !updated.end) {
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, "0")
      updated.end = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    }

    // ⭐ CLEAR FILTER DULU
    if (filters.status === "OPEN" && updated.status === "CLOSED") {
  setFilters((prev) => ({ ...prev, status: "" }))
}


    const newIncidents = [...incidents]
    newIncidents[idx] = updated

    setIncidents(newIncidents)
    setEditDialogOpen(false)
    setEditIndex(null)
  },
  [incidents, filtered, editIndex, filters.status]
)


  const handleReport = useCallback(() => {
    setReportOpen(true)
    setDetailIndex(null)
  }, [])

  const handleExport = useCallback(() => {
    const headers = [
      "No", "Incident", "Area", "Regional", "Severity", "Status",
      "Start", "End", "TTR", "Ticket", "RFO", "Impact", "Nodes",
      "SSL", "RCA", "Penanganan",
    ]
    const rows = filtered.map((x, i) => [
  String(i + 1),
  `Gangguan ${x.ruas}`,
      x.area, x.regional, x.severity, x.status,
      x.start, x.end, calcTTR(x.start, x.end),
      x.tickets.join(", "), x.rfo, x.impact, x.nodes,
      x.ssl, x.rca, x.penanganan,
    ])
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Incident_List_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  const reportText = useMemo(() => generateReport(filtered), [filtered])

  if (!mounted) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="flex items-center gap-3 text-white/70">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
        <span className="text-sm font-medium">Loading Dashboard...</span>
      </div>
    </div>
  )
}

return (
 <main
  className="min-h-screen w-full text-white
             bg-[url('/wow.jpg')]
             bg-no-repeat
             bg-top
             bg-[length:100%_auto]"
>

    {/* ===== HEADER ===== */}
   <header className="w-full flex justify-center">
  <div className="w-full max-w-[1600px] px-6 pt-6">

    {/* ===== TITLE ===== */}
    <div className="flex justify-center mb-0">
  <div className="flex items-center gap-3">

    {/* ICON */}
    <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/20">
      <Radio className="h-5 w-5 text-blue-400" />
      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400" />
      </span>
    </div>

    {/* TITLE + CLOCK */}
    <div className="flex flex-col leading-none">

      <h1 className="text-sm md:text-sm font-bold tracking-[0.10em] text-[#7dd3fc]">
        FBB INCIDENT DASHBOARD
      </h1>

      <div className="text-xs text-[#7dd3fc]">
        <RealtimeClock />
      </div>
</div>
      </div>
    </div>

    {/* ===== FILTER + CLOCK ===== */}
    <div className="space-y-0">

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onPasteRaw={() => setPasteOpen(true)}
        regionals={regionals}
      />

    </div>

  </div> {/* ← PENUTUP div max-w */}
</header>


    {/* ===== CONTENT ===== */}
<div className="mx-auto max-w-[1500px] space-y-0 px-1 py-1 lg:px-6">

  {/* SUMMARY */}
  <div className="p-4">
    <SummaryCards summary={summary} />
  </div>

  {/* GARIS PEMISAH FULL */}
  <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-900/60 to-transparent" />

      {/* TABLE */}
      <div className="relative w-full px-4 py-3">
  <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-sky-400/70 to-transparent blur-sm" />
  <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300 to-transparent" />

        <IncidentTable
          incidents={filtered}
          activeDetail={detailIndex}
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReport={handleReport}
          onExport={handleExport}
        />
      </div>

    </div>


    {/* ===== DIALOGS ===== */}
    <EditIncidentDialog
      incident={editDialogIncident}
      open={editDialogOpen}
      onOpenChange={(open) => {
        setEditDialogOpen(open)
        if (!open) {
          setEditIndex(null)
          setEditDialogIncident(null)
        }
      }}
      onSave={handleUpdateIncident}
    />

    <ReportDialog
      open={reportOpen}
      onOpenChange={setReportOpen}
      reportText={reportText}
    />

    <PasteRawDialog
      open={pasteOpen}
      onOpenChange={setPasteOpen}
      onSubmit={handlePasteRaw}
      onSave={handlePasteSave}
    />

  </main>
)
}
