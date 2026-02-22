"use client"

import {
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Timer,
  BarChart3,
  Flame,
  ShieldAlert,
  Bell,
  ShieldCheck,
} from "lucide-react"
import type { SummaryData } from "@/lib/types"

interface SummaryCardsProps {
  summary: SummaryData
}

function SeverityIcon({ severity }: { severity: string }) {
  switch (severity) {
    case "CRITICAL":
      return <Flame className="h-3.5 w-3.5 text-[hsl(var(--noc-red))]" />
    case "MAJOR":
      return <ShieldAlert className="h-3.5 w-3.5 text-[hsl(var(--noc-orange))]" />
    case "MINOR":
      return <Bell className="h-3.5 w-3.5 text-[hsl(var(--noc-yellow))]" />
    default:
      return <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--noc-cyan))]" />
  }
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const TrendIcon =
    summary.trendDirection === "up"
      ? TrendingUp
      : summary.trendDirection === "down"
      ? TrendingDown
      : Minus

  const trendColor =
    summary.trendDirection === "up"
      ? "text-[hsl(var(--noc-green))]"
      : summary.trendDirection === "down"
      ? "text-[hsl(var(--noc-red))]"
      : "text-muted-foreground"

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

      {/* ================= INCIDENT ================= */}
      <CardWrapper>
        <CardHeader
          icon={<Activity className="h-4 w-4 text-[hsl(var(--primary))]" />}
          title="INCIDENT"
          
        />

        <StatGrid cols={3}>
          <StatItem label="ALL" value={summary.total} />
          <StatItem
            label="ONGOING"
            value={summary.open}
            valueColor="text-[hsl(var(--noc-orange))]"
          />
          <StatItem
            label="CLOSED"
            value={summary.closed}
            valueColor="text-[hsl(var(--noc-green))]"
          />
        </StatGrid>
      </CardWrapper>

      {/* ================= SEVERITY ================= */}
      <CardWrapper>
        <CardHeader
          icon={<AlertTriangle className="h-4 w-4 text-[hsl(var(--noc-yellow))]" />}
          title="SEVERITY"
        />

        <StatGrid cols={4}>
          <StatItem
            label="LOW"
            value={summary.sevLow}
            valueColor="text-[hsl(var(--noc-green))]"
          />
          <StatItem
            label="MINOR"
            value={summary.sevMinor}
            valueColor="text-[hsl(var(--noc-yellow))]"
          />
          <StatItem
            label="MAJOR"
            value={summary.sevMajor}
            valueColor="text-[hsl(var(--noc-orange))]"
          />
          <StatItem
            label="CRITICAL"
            value={summary.sevCritical}
            valueColor="text-[hsl(var(--noc-red))]"
          />
        </StatGrid>
      </CardWrapper>

      {/* ================= TTR ================= */}
      <CardWrapper>
        <CardHeader
          icon={<Timer className="h-4 w-4 text-[hsl(var(--noc-cyan))]" />}
          title="TTR"
        />

        <StatGrid cols={2}>
          <StatItem
            label="LONGEST OPEN"
            value={summary.ttrLongest}
            mono
            valueColor="text-[hsl(var(--noc-red))]"
          />
          <StatItem
            label="AVG CLOSED"
            value={summary.ttrAvg}
            mono
            valueColor="text-[hsl(var(--noc-green))]"
          />
        </StatGrid>
      </CardWrapper>

      {/* ================= TREND ================= */}
      <CardWrapper>
        <CardHeader
          icon={<BarChart3 className="h-4 w-4 text-[hsl(var(--noc-blue))]" />}
          title="TREND"
        />

        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <div className="flex items-center gap-2">
            <TrendIcon className={`h-5 w-5 ${trendColor}`} />
            <span className={`text-2xl font-semibold ${trendColor}`}>
              {summary.trendValue}
            </span>
          </div>

          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {summary.trendDesc}
          </p>
        </div>
      </CardWrapper>

    </div>
  )
}

/* ========================================================= */
/* ================= UI WRAPPER ============================= */
/* ========================================================= */

function CardWrapper({ children }: { children: React.ReactNode }) {
  const childArray = Array.isArray(children) ? children : [children]

  return (
    <div
      className="
      relative
      rounded-2xl
      bg-gradient-to-b from-[#0f2a44] via-[#0c243b] to-[#081c2d]
      overflow-hidden
      shadow-[0_8px_30px_rgba(0,0,0,0.45),inset_0_0_40px_rgba(56,189,248,0.05)]
      transition-all duration-300 ease-out
      hover:border-cyan-300/40
      hover:shadow-[0_0_35px_rgba(0,200,255,0.15)]
     hover:scale-[1.02]
transition-all duration-300
      backdrop-blur-sm
    "
    >
      {/* HEADER (lebih pendek & warna sama) */}
      <div className="relative py-2.5 overflow-hidden">

        {/* TOP LINE (full) */}
        <div className="absolute top-0 left-0 w-full h-[2px]
          bg-gradient-to-r from-transparent via-[#93c5fd] to-transparent
          opacity-80 blur-[0.4px]
          shadow-[0_0_14px_rgba(147,197,253,0.8)]
        " />

        {/* BOTTOM LINE (short & center) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px]
          bg-gradient-to-r from-transparent via-[#93c5fd] to-transparent
          opacity-80 blur-[0.4px]
          shadow-[0_0_14px_rgba(147,197,253,0.8)]
        " />

        <div className="relative z-10 flex justify-center">
          {childArray[0]}
        </div>
      </div>

      {/* BODY */}
      <div className="relative z-10 p-4 space-y-4">
        {childArray.slice(1)}
      </div>
    </div>
  )
}

function CardHeader({
  icon,
  title
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="flex w-full justify-center">
  <div className="flex items-center justify-center gap-2 text-[#7dd3fc]">
    {icon}
    <span className="text-xs tracking-widest">
      {title}
    </span>
  </div>
</div>
  )
}

function StatGrid({
  cols,
  children
}: {
  cols: number
  children: React.ReactNode
}) {
  return (
    <div
      className={`grid text-center divide-x divide-white/25`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  )
}

function StatItem({
  label,
  value,
  valueColor = "text-foreground",
  mono = false
}: {
  label: string
  value: string | number
  valueColor?: string
  mono?: boolean
}) {
  return (
    <div className="px-2 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>

      <span
        className={`
          ${mono ? "font-mono" : ""}
          text-l font-semibold
          ${valueColor}
        `}
      >
        {value}
      </span>
    </div>
  )
}

