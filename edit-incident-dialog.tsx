"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Incident } from "@/lib/types"

interface EditIncidentDialogProps {
  incident: Incident | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updated: Incident) => void
}

const inputClass =
  "w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)]"

const selectClass =
  "w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)]"

const labelClass = "mb-1.5 block text-sm font-semibold text-[hsl(var(--primary))]"

export function EditIncidentDialog({ incident, open, onOpenChange, onSave }: EditIncidentDialogProps) {
  const [form, setForm] = useState<Incident | null>(null)

  useEffect(() => {
    if (incident && open) {
      setForm({ ...incident })
    }
  }, [incident, open])

  if (!open || !form) return null

  const handleChange = (key: keyof Incident, value: string | string[]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form) onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-xl rounded-xl border border-[hsl(220_30%_18%)] bg-card shadow-2xl shadow-[hsl(187_92%_50%/0.05)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">Edit Incident</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Gangguan */}
          <div>
            <label className={labelClass}>
              {'Gangguan'} <span className="text-[hsl(var(--noc-red))]">*</span>
            </label>
            <input
              type="text"
              className={inputClass}
              value={form.ruas}
              onChange={(e) => handleChange("ruas", e.target.value)}
              required
            />
          </div>

          {/* Severity + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {'Severity'} <span className="text-[hsl(var(--noc-red))]">*</span>
              </label>
              <select
                className={selectClass}
                value={form.severity}
                onChange={(e) => handleChange("severity", e.target.value)}
              >
                <option value="LOW">LOW</option>
                <option value="MINOR">MINOR</option>
                <option value="MAJOR">MAJOR</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {'Status'} <span className="text-[hsl(var(--noc-red))]">*</span>
              </label>
              <select
                className={selectClass}
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {/* Start + End */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {'Start Time'} <span className="text-[hsl(var(--noc-red))]">*</span>
              </label>
              <input
                type="text"
                className={inputClass}
                value={form.start}
                onChange={(e) => handleChange("start", e.target.value)}
                placeholder="2026-02-13 10:02:12"
                required
              />
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input
                type="text"
                className={inputClass}
                value={form.end}
                onChange={(e) => handleChange("end", e.target.value)}
                placeholder="2026-02-13 13:56:00"
              />
              {form.status === "CLOSED" && !form.end && (
                <p className="mt-1 text-[10px] text-[hsl(var(--noc-yellow))]">
                  Kosongkan untuk auto-set waktu sekarang
                </p>
              )}
            </div>
          </div>

          {/* No Tiket */}
          <div>
            <label className={labelClass}>No Tiket (comma separated)</label>
            <input
              type="text"
              className={inputClass}
              value={form.tickets.join(", ")}
              onChange={(e) =>
                handleChange(
                  "tickets",
                  e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                )
              }
              placeholder="INC45913069, INC45828071"
            />
          </div>

          {/* RFO */}
          <div>
            <label className={labelClass}>RFO</label>
            <textarea
              className={`${inputClass} min-h-[72px] resize-y`}
              value={form.rfo}
              onChange={(e) => handleChange("rfo", e.target.value)}
              placeholder="FO putus di KM 2.5 dari STO EJIP"
            />
          </div>

          {/* Impact Service */}
          <div>
            <label className={labelClass}>Impact Service</label>
            <input
              type="text"
              className={inputClass}
              value={form.impact}
              onChange={(e) => handleChange("impact", e.target.value)}
              placeholder="Internet lambat dan IPTV putus-putus"
            />
          </div>

          {/* Progress */}
          <div>
            <label className={labelClass}>Progress</label>
            <textarea
              className={`${inputClass} min-h-[72px] resize-y`}
              value={form.progress}
              onChange={(e) => handleChange("progress", e.target.value)}
              placeholder="13:56 > sudah pemasangan kabel"
            />
          </div>

          {/* Nodes / GPON */}
          <div>
            <label className={labelClass}>GPON Nodes</label>
            <textarea
              className={`${inputClass} min-h-[72px] resize-y font-mono text-xs`}
              value={form.nodes}
              onChange={(e) => handleChange("nodes", e.target.value)}
              placeholder="GPON04-D2-CLS-4 2.522"
            />
          </div>

          {/* Total Customers (SSL) */}
          <div>
            <label className={labelClass}>Total Customers (SSL)</label>
            <input
              type="text"
              className={inputClass}
              value={form.ssl}
              onChange={(e) => handleChange("ssl", e.target.value)}
              placeholder="4830"
            />
          </div>

          {/* RCA (for closed) */}
          {form.status === "CLOSED" && (
            <>
              <div>
                <label className={labelClass}>RCA</label>
                <textarea
                  className={`${inputClass} min-h-[72px] resize-y`}
                  value={form.rca}
                  onChange={(e) => handleChange("rca", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Penanganan</label>
                <textarea
                  className={`${inputClass} min-h-[72px] resize-y`}
                  value={form.penanganan}
                  onChange={(e) => handleChange("penanganan", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[hsl(var(--primary))] py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-all hover:bg-[hsl(var(--primary)/0.85)] hover:shadow-[0_0_24px_hsl(var(--primary)/0.35)]"
            >
              Update Incident
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border bg-secondary px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
