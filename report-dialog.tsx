"use client"

import { useState } from "react"
import { X, Copy, CheckCircle2 } from "lucide-react"

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportText: string
}

export function ReportDialog({ open, onOpenChange, reportText }: ReportDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-xl border border-[hsl(220_30%_18%)] bg-card shadow-2xl shadow-[hsl(187_92%_50%/0.05)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">WhatsApp Report</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {reportText ? (
            <>
              <pre className="max-h-[400px] overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-secondary/50 p-4 font-mono text-xs text-foreground">
                {reportText}
              </pre>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-all hover:bg-[hsl(var(--primary)/0.85)] hover:shadow-[0_0_24px_hsl(var(--primary)/0.35)]"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-lg border border-border bg-secondary px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <p className="text-sm">Tidak ada data incident untuk di-report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
