"use client"

import { useState } from "react"
import { X, ClipboardPaste, CheckCircle2, AlertCircle } from "lucide-react"
import type { Incident } from "@/lib/types"

interface PasteRawDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (raw: string) => Incident | null
  onSave: (incident: Incident) => void
}

export function PasteRawDialog({ open, onOpenChange, onSubmit, onSave }: PasteRawDialogProps) {
  const [raw, setRaw] = useState("")
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!open) return null

  const handleSubmit = () => {
    if (!raw.trim()) return

    const parsed = onSubmit(raw.trim())
    if (parsed) {
      setResult({
        success: true,
        message: `Incident "${parsed.ruas}" berhasil diproses (${parsed.status})`,
      })
      setRaw("")
      setTimeout(() => {
        setResult(null)
      }, 3000)
    } else {
      setResult({
        success: false,
        message: "Gagal parse data. Pastikan format sesuai template WhatsApp dan ada nomor INC.",
      })
    }
  }

  const handleClose = () => {
    setRaw("")
    setResult(null)
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-xl border border-[hsl(220_30%_18%)] bg-card shadow-2xl shadow-[hsl(187_92%_50%/0.05)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <ClipboardPaste className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-bold text-foreground">Paste Raw WhatsApp</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="mb-3 text-xs text-muted-foreground">
            Paste raw text dari grup WhatsApp NOC. Format harus mengandung nomor tiket INC, severity, status, dan waktu.
          </p>

          <textarea
            className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)]"
            rows={12}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={`Laporan Gangguan Ruas XXX\nSeverity IndiHome : MAJOR\nStatus : Open\nOpen Tiket Insera : 2026-02-13 10:02:12\nNo Tiket : INC45913069\n...\nGPON04-D2-CLS-4 2.522\n...`}
          />

          {/* Result */}
          {result && (
            <div
              className={`mt-3 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs ${
                result.success
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {result.message}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={!raw.trim()}
              className="flex-1 rounded-lg bg-[hsl(var(--primary))] py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-all hover:bg-[hsl(var(--primary)/0.85)] hover:shadow-[0_0_24px_hsl(var(--primary)/0.35)] disabled:opacity-40 disabled:hover:shadow-none"
            >
              Process & Save
            </button>
            <button
              onClick={handleClose}
              className="rounded-lg border border-border bg-secondary px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
