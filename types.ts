export interface Incident {
  ruas: string
  area: string
  regional: string
  severity: "LOW" | "MINOR" | "MAJOR" | "CRITICAL"
  status: "OPEN" | "CLOSED"
  start: string
  end: string
  tickets: string[]
  rfo: string
  impact: string
  progress: string
  nodes: string
  ssl: string
  rca: string
  penanganan: string
}

export interface FilterState {
  area: string
  regional: string
  severity: string
  status: string
  dateFrom: string
  dateTo: string
  period: "daily" | "weekly" | "monthly"
}

export interface SummaryData {
  total: number
  open: number
  closed: number
  sevLow: number
  sevMinor: number
  sevMajor: number
  sevCritical: number
  ttrLongest: string
  ttrAvg: string
  trendValue: string
  trendDirection: "up" | "down" | "neutral"
  trendDesc: string
  trendPercent: number
  trendLabel: string
}
