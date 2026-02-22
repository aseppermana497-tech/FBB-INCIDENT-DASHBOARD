"use client"

import { useState, useEffect, Fragment } from "react"
import {
  Trash2,
  FileText,
  Download,
  Flame,
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  ShieldAlert,
  Bell,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  X,
  List,
} from "lucide-react"
import type { Incident } from "@/lib/types"
import { calcTTR, calcTTRMinutes, formatMinutes, getDurationClass } from "@/lib/incident-store"

interface IncidentTableProps {
  incidents: Incident[]
  activeDetail: number | null
  onDetail: (index: number) => void
  onEdit: (index: number) => void
  onDelete: (index: number) => void
  onReport: () => void
  onExport: () => void
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    LOW: "bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20",
    MINOR: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
    MAJOR: "bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20",
    CRITICAL: "bg-red-600/10 text-red-400 ring-1 ring-inset ring-red-600/20",
  }

  const Icons: Record<string, any> = {
    LOW: Bell,
    MINOR: ShieldAlert,
    MAJOR: ShieldAlert,
    CRITICAL: Flame,
  }

  const Icon = Icons[severity] || Bell

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${styles[severity] || styles.LOW}`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      {severity}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isOpen = status === "OPEN"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${
        isOpen
          ? "bg-orange-500/10 text-orange-400 ring-orange-500/20"
          : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
      }`}
    >
      {isOpen ? (
        <Clock className="h-3.5 w-3.5" strokeWidth={2.3} />
      ) : (
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      )}

      {isOpen ? "OPEN" : "CLOSED"}
    </span>
  )
}

function RealtimeTTR({ start, end }: { start: string; end: string }) {
  const [ttr, setTtr] = useState(() => calcTTR(start, end))
  const [durationClass, setDurationClass] = useState(() => getDurationClass(start, end))

  useEffect(() => {
    if (end) {
      setTtr(calcTTR(start, end))
      setDurationClass(getDurationClass(start, end))
      return
    }
    const update = () => {
      setTtr(calcTTR(start, ""))
      setDurationClass(getDurationClass(start, ""))
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [start, end])

  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${durationClass}`}>
      {ttr}
    </span>
  )
}

function EmptyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  )
}

function DetailPanel({ incident, onClose, onEdit }: { incident: Incident; onClose: () => void; onEdit: () => void }) {
  const gponLines = incident.nodes ? incident.nodes.split("\n").filter((l) => l.trim()) : []

  const handleCopyNodes = () => {
    if (incident.nodes) {
      navigator.clipboard.writeText(incident.nodes)
    }
  }

  return (
    <div className="border-t border-[hsl(220_30%_15%)] bg-[hsl(220_45%_6%)] px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-bold text-[hsl(var(--primary))]">
          Detail: {incident.ruas}
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex h-7 items-center gap-1 rounded-md border border-[hsl(220_30%_15%)] bg-secondary px-2.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
          >
            Edit
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-[100px_1fr] gap-1">
            <span className="text-muted-foreground">Area:</span>
            <span className="text-foreground">{incident.area || "-"}</span>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-1">
            <span className="text-muted-foreground">Regional:</span>
            <span className="text-foreground">{incident.regional || "-"}</span>
          </div>
          {incident.rfo && (
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">RFO:</span>
              <span className="text-foreground">{incident.rfo}</span>
            </div>
          )}
          {incident.impact && (
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">Impact:</span>
              <span className="font-medium text-[hsl(var(--noc-orange))]">{incident.impact}</span>
            </div>
          )}
          {incident.ssl && (
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">SSL:</span>
              <span className="font-mono font-semibold text-[hsl(var(--noc-red))]">
                {Number(incident.ssl).toLocaleString("id-ID")} SSL
              </span>
            </div>
          )}
          {incident.rca && (
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">RCA:</span>
              <span className="text-foreground">{incident.rca}</span>
            </div>
          )}
          {incident.penanganan && (
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">Penanganan:</span>
              <span className="text-foreground">{incident.penanganan}</span>
            </div>
          )}
          {incident.progress && (
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-muted-foreground">Progress:</span>
              <span className="whitespace-pre-wrap text-foreground">{incident.progress}</span>
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-[hsl(var(--primary))]">
              GPON List ({gponLines.length} nodes)
            </span>
            {gponLines.length > 0 && (
              <button
                onClick={handleCopyNodes}
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-[hsl(var(--primary))]"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            )}
          </div>
          {gponLines.length > 0 ? (
            <div className="max-h-[200px] overflow-y-auto rounded-lg border border-[hsl(220_30%_15%)] bg-[hsl(220_50%_5%/0.5)] p-2">
              <div className="space-y-0.5 font-mono text-[10px]">
                {gponLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded px-1.5 py-0.5 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  >
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-[hsl(220_30%_15%)] text-[10px] text-muted-foreground">
              No GPON data
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function IncidentTable({
  incidents,
  activeDetail,
  onDetail,
  onEdit,
  onDelete,
  onReport,
  onExport,
}: IncidentTableProps) {
  return (
  <div className="noc-card rounded-xl border border-[#93c5fd]/20 bg-gradient-to-b from-[#0f2a44] via-[#0c243b] to-[#081c2d]">
    <div className="relative z-10">

      {/* Table header */}
      <div className="flex items-center border-b border-[#93c5fd]/20 px-5 py-2 bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 hover:bg-white/5 transition-colors">

        {/* Title Section */}
        <div className="flex items-center gap-1 text-[#93c5fd] font-semibold">
          <List className="h-4 w-4 text-[#93c5fd]" />

          <span className="text-sm tracking-wide">
            Incident List
          </span>

          <span className="ml-2 rounded-md bg-[#93c5fd]/10 px-2 py-[2px] text-[10px] font-bold text-[#93c5fd] border border-[#93c5fd]/30">
            {incidents.length}
          </span>
        </div>
      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-2">
        <div className="flex w-[180px] items-center justify-end gap-2">
          <button
            onClick={onReport}
            className="flex h-9 items-center gap-1.5 rounded-lg
  border border-blue-900/80
  bg-[linear-gradient(to_bottom,_rgba(6,15,35,1)_0%,_rgba(25,50,100,1)_50%,_rgba(6,15,35,1)_100%)]
  px-3 text-xs
  text-[#7dd3fc]
  shadow-[inset_0_0_14px_rgba(37,99,235,0.25)]
  transition-all duration-200
  hover:shadow-[inset_0_0_18px_rgba(37,99,235,0.35)]
  focus:outline-none focus:ring-1 focus:ring-blue-500/40"
          >
            <FileText className="h-3.5 w-3.5" />
            Report
          </button>

          <button
            onClick={onExport}
            className="flex h-9 items-center gap-1.5 rounded-lg
  border border-blue-900/80
  bg-[linear-gradient(to_bottom,_rgba(6,15,35,1)_0%,_rgba(25,50,100,1)_50%,_rgba(6,15,35,1)_100%)]
  px-3 text-xs
  text-[#7dd3fc]
  shadow-[inset_0_0_14px_rgba(37,99,235,0.25)]
  transition-all duration-200
  hover:shadow-[inset_0_0_18px_rgba(37,99,235,0.35)]
  focus:outline-none focus:ring-1 focus:ring-blue-500/40"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>
    </div>

   <div className="overflow-x-auto rounded-xl bg-gradient-to-b from-[#0f2a44] via-[#0c243b] to-[#081c2d] hover:bg-[#93c5fd]/5 transition-colors">
  <table className="w-full text-sm text-slate-200 border-collapse">
    
   <thead className="bg-slate-900/50 border-b border-slate-700/70">
      <tr className="text-xs uppercase tracking-wider text-slate-400 text-left border-b border-[#93c5fd]/30">
        <th className="px-4 py-3 font-semibold">Incident</th>
        <th className="px-4 py-3 font-semibold">Severity</th>
        <th className="px-4 py-3 font-semibold">Status</th>
        <th className="px-4 py-3 font-semibold">Start</th>
        <th className="px-4 py-3 font-semibold">End</th>
        <th className="px-4 py-3 font-semibold">TTR</th>
        <th className="px-4 py-3 font-semibold">No Tiket</th>
        <th className="px-4 py-3 font-semibold">SSL</th>
        <th className="px-4 py-3 font-semibold">Action</th>
      </tr>
    </thead>

    <tbody className="bg-[#0f172a] divide-y divide-slate-800">
  {incidents.length === 0 ? (
        <tr className="border-b border-[#93c5fd]/20">
          <td
            colSpan={9}
            className="px-4 py-16 text-center text-muted-foreground"
          >
            <div className="flex flex-col items-center gap-2">
                      <EmptyIcon className="h-8 w-8 opacity-30" />
                      <p className="text-sm">Belum ada incident. Paste raw data WhatsApp untuk memulai.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                incidents.map((x, i) => (
                  <Fragment key={`incident-${x.tickets.join("-")}-${i}`}>
                    <tr
                     className={`border-b border-[#93c5fd]/30 text-center 
text-xs font-medium tracking-wide text-blue-200
transition-all duration-200
hover:bg-[hsl(220_35%_12%)] 
hover:text-blue-100
${activeDetail === i ? "bg-[hsl(var(--primary)/0.08)] text-blue-100" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-400 text-left border-b border-[#93c5fd]/30" title={x.ruas}>
                        {x.ruas.startsWith("Gangguan")
    ? x.ruas
    : `Gangguan ${x.ruas}`}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-400 text-left border-b border-[#93c5fd]/30">
                        <SeverityBadge severity={x.severity} />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-400 text-left border-b border-[#93c5fd]/30">
                        <StatusBadge status={x.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-400 text-start border-b border-[#93c5fd]/30">{x.start}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-400 text-start border-b border-[#93c5fd]/30">{x.end || "-"}</td>
                      <td className="px-4 py-3 font-medium text-slate-400 text-start border-b border-[#93c5fd]/30">
                        <RealtimeTTR start={x.start} end={x.end} />
                      </td>
                      <td className="max-w-[170px] truncate px-4 py-3 font-medium text-slate-400 text-start border-b border-[#93c5fd]/30" title={x.tickets.join(", ")}>
                        {x.tickets.join(", ")}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-400 text-start border-b border-[#93c5fd]/30">
                        {x.ssl ? Number(x.ssl).toLocaleString("id-ID") : "-"}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-400 text-start border-b border-[#93c5fd]/30">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onDetail(i)}
                            className={`rounded-lg p-1.5 transition-colors ${
                              activeDetail === i
                                ? "bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]"
                                : "text-muted-foreground hover:bg-secondary hover:text-[hsl(var(--primary))]"
                            }`}
                            aria-label={`Detail incident ${x.ruas}`}
                          >
                            {activeDetail === i ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => onDelete(i)}
                            className="rounded-lg p-1.5 text-slate-400 font-medium transition-colors hover:bg-[hsl(var(--noc-red)/0.1)] hover:text-[hsl(var(--noc-red))]"
                            aria-label={`Delete incident ${x.ruas}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {activeDetail === i && (
                      <tr>
                        <td colSpan={9} className="p-0">
                          <DetailPanel
                            incident={x}
                            onClose={() => onDetail(i)}
                            onEdit={() => onEdit(i)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
