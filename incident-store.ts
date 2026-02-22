import type { Incident, FilterState, SummaryData } from "./types"

// ============ AREA DETECTION ============
export function detectArea(text: string): string {
  const m = text.match(/GPON\d+-D(\d)/i)
  if (!m) return "Unknown"
  const d = parseInt(m[1])
  if (d === 1) return "Area 1"
  if (d <= 3) return "Area 2"
  if (d <= 5) return "Area 3"
  return "Area 4"
}

// ============ STO & REGIONAL (FIXED) ============
export function getSTOFromNodes(nodes: string): string {
  if (!nodes) return ""
  // Extract ALL STO names from all GPON lines
  const matches = nodes.match(/GPON\d+-D\d+-([A-Z0-9]+)/gi)
  if (!matches || matches.length === 0) return ""
  // Get the first STO
  const firstMatch = matches[0].match(/GPON\d+-D\d+-([A-Z0-9]+)/i)
  return firstMatch ? firstMatch[1].toUpperCase() : ""
}

export function getAllSTOsFromNodes(nodes: string): string[] {
  if (!nodes) return []
  const matches = nodes.match(/GPON\d+-D\d+-([A-Z0-9]+)/gi)
  if (!matches) return []
  const stos = new Set<string>()
  for (const m of matches) {
    const sto = m.match(/GPON\d+-D\d+-([A-Z0-9]+)/i)
    if (sto) stos.add(sto[1].toUpperCase())
  }
  return Array.from(stos)
}

export function getRegionalFromNodes(nodes: string, stoMapping: Record<string, string>): string {
  const sto = getSTOFromNodes(nodes)
  if (!sto) return ""
  return stoMapping[sto] || ""
}

// ============ TTR CALCULATION ============
export function calcTTRMinutes(start: string, end: string): number | null {
  if (!start) return null
  const s = new Date(start.replace(" ", "T"))
  const e = end ? new Date(end.replace(" ", "T")) : new Date()
  const diff = e.getTime() - s.getTime()
  if (diff < 0) return null
  return Math.floor(diff / (1000 * 60))
}

export function formatMinutes(min: number | null): string {
  if (min == null) return "-"
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function calcTTR(start: string, end: string): string {
  const min = calcTTRMinutes(start, end)
  return formatMinutes(min)
}

export function getDurationClass(start: string, end: string): string {
  if (!start) return "bg-sky-500/20 text-sky-400"
  const s = new Date(start.replace(" ", "T"))
  const e = end ? new Date(end.replace(" ", "T")) : new Date()
  const hours = (e.getTime() - s.getTime()) / (1000 * 60 * 60)
  if (hours < 12) return "bg-sky-500/20 text-sky-400"
  if (hours < 20) return "bg-yellow-500/20 text-yellow-400"
  if (hours < 24) return "bg-orange-500/20 text-orange-400"
  return "bg-red-500/20 text-red-400"
}

// ============ GPON BLOCK EXTRACT ============
export function extractGponBlock(raw: string): string {
  const lines = raw.split(/\r?\n/)
  let collecting = false
  const result: string[] = []
  for (const line of lines) {
    const l = line.trim()
    if (/^GPON/i.test(l)) collecting = true
    if (collecting) {
      if (/^Total\s+/i.test(l)) break
      result.push(l)
    }
  }
  return result.join("\n").trim()
}

// ============ PROGRESS PARSER ============
export function parseProgress(raw: string): string {
  const penanganan = raw.match(/Penanganan\s*:\s*([\s\S]+?)(\n\n|$)/i)?.[1]?.trim()
  if (!penanganan) return ""
  const update = raw.match(/Update terakhir\s*:\s*([0-9:\-\s]+)/i)?.[1] || ""
  const jam = update.match(/\d{2}:\d{2}/)?.[0] || ""
  if (!jam) return `* ${penanganan}`
  return `* ${jam} > ${penanganan}`
}

// ============ SSL PARSER ============
function parseSSL(raw: string, isClosed: boolean): string {
  if (isClosed) return ""
  const m1 = raw.match(/Potensi\s+Impacted\s+Service\s*:\s*([\d.,]+)/i)
  if (m1) return m1[1].replace(/\./g, "").replace(/,/g, "")
  const m2 = raw.match(/\b(?:total(?:\s+all(?:\s+gpon)?)?|all)\s+([\d.,]+)/i)
  if (m2) return m2[1].replace(/\./g, "").replace(/,/g, "")
  const m3 = raw.match(/Total\s+([\d.,]+)/i)
  if (m3) return m3[1].replace(/\./g, "").replace(/,/g, "")
  return ""
}

// ============ RAW WA PROCESSOR ============
export interface ParseResult {
  incident: Incident
  isNew: boolean
  formatted: string
}

export function parseRawWA(
  raw: string,
  stoMapping: Record<string, string>
): Incident | null {
  const ruas = raw.match(/Laporan Gangguan\s+(.+)/i)?.[1]?.trim() || "Unknown"
  const severity = (
    raw.match(/Severity\s+IndiHome\s*:\s*([A-Z]+)/i)?.[1] || "LOW"
  ).toUpperCase() as Incident["severity"]
  const status = raw.match(/Status\s*(?::)?\s*(Open|Closed)/i)?.[1] || "Open"
  const isClosed = status.toLowerCase() === "closed"
  const start = raw.match(/(?:Waktu Open Insera|Open Tiket Insera)\s*:\s*([0-9:\-\s]+)/i)?.[1]?.trim() || ""
  const end = isClosed
    ? (raw.match(/Closed Tiket Insera\s*:\s*([0-9:\-\s]+)/i)?.[1]?.trim() ||
       raw.match(/Waktu Awal Gangguan\s*:\s*([0-9:\-\s]+)/i)?.[1]?.trim() || "")
    : ""

  const tickets = [...new Set(raw.match(/INC\d+/gi) || [])]
  if (!tickets.length) return null

  const rca = raw.match(/Root Cause.*?:\s*([\s\S]+?)(\n\n|$)/i)?.[1]?.trim() || ""
  const penanganan = raw.match(/Penanganan\s*:\s*([\s\S]+?)(\n\n|$)/i)?.[1]?.trim() || ""
  const rfo = !isClosed ? raw.match(/RFO\s*:\s*([\s\S]+?)(\n\n|$)/i)?.[1]?.trim() || "" : ""
  const impact = !isClosed
    ? raw.match(/Potensi\s+dampak\s+Layanan\s*:\s*([^;\n]+)/i)?.[1]?.trim() || ""
    : ""
  const ssl = parseSSL(raw, isClosed)
  const nodes = !isClosed ? extractGponBlock(raw) : ""
  const progress = !isClosed ? parseProgress(raw) : ""

  const area = detectArea(nodes || "")
  const regional = getRegionalFromNodes(nodes, stoMapping)

  return {
    ruas,
    area,
    regional,
    severity,
    status: status.toUpperCase() as Incident["status"],
    start,
    end,
    tickets,
    rfo,
    impact,
    progress: progress || "",
    nodes,
    ssl,
    rca,
    penanganan,
  }
}

export function processRawWA(
  raw: string,
  existingIncidents: Incident[],
  stoMapping: Record<string, string>
): { incidents: Incident[]; updated: boolean; isNew: boolean; parsed: Incident | null } {
  const parsed = parseRawWA(raw, stoMapping)
  if (!parsed) return { incidents: existingIncidents, updated: false, isNew: false, parsed: null }

  const newIncidents = [...existingIncidents]
  const idx = newIncidents.findIndex((x) =>
    Array.isArray(x.tickets) && x.tickets.some((t) => parsed.tickets.includes(t))
  )

  if (idx >= 0) {
    const o = { ...newIncidents[idx] }
    o.severity = parsed.severity
    o.status = parsed.status
    if (parsed.start) o.start = parsed.start
    if (parsed.end) o.end = parsed.end
    if (parsed.rca) o.rca = parsed.rca
    if (parsed.penanganan) o.penanganan = parsed.penanganan
    if (parsed.ssl) o.ssl = parsed.ssl
    if (parsed.nodes) o.nodes = parsed.nodes
    if (parsed.rfo) o.rfo = parsed.rfo
    if (parsed.impact) o.impact = parsed.impact
    if (parsed.area && parsed.area !== "Unknown") o.area = parsed.area
    if (parsed.regional) o.regional = parsed.regional

    if (parsed.progress) {
      const old = (o.progress || "").split("\n").map((l) => l.trim()).filter(Boolean)
      const times = old.map((l) => l.match(/\*\s*(\d{2}:\d{2})/)?.[1]).filter(Boolean)
      const t = parsed.progress.match(/\*\s*(\d{2}:\d{2})/)?.[1]
      if (t && !times.includes(t)) old.push(parsed.progress)
      o.progress = old.join("\n")
    }
    newIncidents[idx] = o
    return { incidents: newIncidents, updated: true, isNew: false, parsed: o }
  } else {
    newIncidents.push(parsed)
    return { incidents: newIncidents, updated: true, isNew: true, parsed }
  }
}

// ============ DATE RANGE HELPERS ============
function getDateRange(date: string, period: "daily" | "weekly" | "monthly"): { start: Date; end: Date } {
  const d = date ? new Date(date) : new Date()
  d.setHours(0, 0, 0, 0)

  if (period === "daily") {
    const end = new Date(d)
    end.setHours(23, 59, 59, 999)
    return { start: d, end }
  }
  if (period === "weekly") {
    const dayOfWeek = d.getDay()
    const start = new Date(d)
    start.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

function getPreviousRange(date: string, period: "daily" | "weekly" | "monthly"): { start: Date; end: Date } {
  const d = date ? new Date(date) : new Date()
  d.setHours(0, 0, 0, 0)

  if (period === "daily") {
    const prev = new Date(d)
    prev.setDate(d.getDate() - 1)
    const end = new Date(prev)
    end.setHours(23, 59, 59, 999)
    return { start: prev, end }
  }
  if (period === "weekly") {
    const dayOfWeek = d.getDay()
    const thisMonday = new Date(d)
    thisMonday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const prevMonday = new Date(thisMonday)
    prevMonday.setDate(thisMonday.getDate() - 7)
    const prevSunday = new Date(prevMonday)
    prevSunday.setDate(prevMonday.getDate() + 6)
    prevSunday.setHours(23, 59, 59, 999)
    return { start: prevMonday, end: prevSunday }
  }
  const start = new Date(d.getFullYear(), d.getMonth() - 1, 1)
  const end = new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999)
  return { start, end }
}

function countInRange(incidents: Incident[], start: Date, end: Date): number {
  return incidents.filter((x) => {
    if (!x.start) return false
    const d = new Date(x.start.replace(" ", "T"))
    return d >= start && d <= end
  }).length
}

// ============ FILTER LOGIC (FIXED) ============
export function applyFilters(incidents: Incident[], filters: FilterState): Incident[] {
  // Build date range from dateFrom / dateTo
  let rangeStart: Date | null = null
  let rangeEnd: Date | null = null

  if (filters.dateFrom) {
    rangeStart = new Date(filters.dateFrom)
    rangeStart.setHours(0, 0, 0, 0)
  }
  if (filters.dateTo) {
    rangeEnd = new Date(filters.dateTo)
    rangeEnd.setHours(23, 59, 59, 999)
  }

  return incidents.filter((x) => {
  if (filters.area && x.area !== filters.area) return false
  if (filters.severity && x.severity !== filters.severity) return false
  if (filters.regional && x.regional !== filters.regional) return false
  if (filters.status && x.status !== filters.status.toUpperCase()) return false

  // OPEN selalu tampil
  if (x.status === "OPEN") return true

  const startDate = x.start ? new Date(x.start.replace(" ", "T")) : null
  const endDate = x.end ? new Date(x.end.replace(" ", "T")) : null

  // CLOSED tampil jika start ATAU end ada di range
  if (rangeStart && startDate && startDate >= rangeStart && (!rangeEnd || startDate <= rangeEnd)) {
    return true
  }

  if (rangeStart && endDate && endDate >= rangeStart && (!rangeEnd || endDate <= rangeEnd)) {
    return true
  }

  return false
})
}

// ============ SUMMARY CALCULATION (FIXED) ============
export function calculateSummary(
  filtered: Incident[],
  all: Incident[],
  period: "daily" | "weekly" | "monthly",
  dateFrom: string
): SummaryData {

  const total = filtered.length
  const open = filtered.filter((x) => x.status === "OPEN").length
  const closed = filtered.filter((x) => x.status === "CLOSED").length

  const sevLow = filtered.filter((x) => x.severity === "LOW").length
  const sevMinor = filtered.filter((x) => x.severity === "MINOR").length
  const sevMajor = filtered.filter((x) => x.severity === "MAJOR").length
  const sevCritical = filtered.filter((x) => x.severity === "CRITICAL").length

  let longest = 0
  let totalClosedMinutes = 0
  let closedCount = 0

  filtered.forEach((x) => {
    const ttrMin = calcTTRMinutes(x.start, x.end)
    if (ttrMin == null) return

    if (ttrMin > longest) longest = ttrMin

    if (x.status === "CLOSED" && x.end) {
      totalClosedMinutes += ttrMin
      closedCount++
    }
  })

  const safeDate = dateFrom || new Date().toISOString().slice(0, 10)

  const currentRange = getDateRange(safeDate, period)
  const prevRange = getPreviousRange(safeDate, period)

  const currentCount = countInRange(all, currentRange.start, currentRange.end)
  const prevCount = countInRange(all, prevRange.start, prevRange.end)

  const diff = currentCount - prevCount

  let percent = 0
  if (currentCount !== 0 || prevCount !== 0) {
    percent = Math.round((Math.abs(diff) / ((currentCount + prevCount) / 2)) * 100)
    percent = Math.min(percent, 100)
  }

  const trendLabelMap = { daily: "DoD", weekly: "WoW", monthly: "MoM" }
  const comparisonMap = { daily: "Yesterday", weekly: "Last Week", monthly: "Last Month" }

  let trendDirection: "up" | "down" | "neutral" = "neutral"
  let trendValue = "0%"
  let trendDesc = `No Change vs ${comparisonMap[period]}`

  if (diff > 0) {
    trendDirection = "down"
    trendValue = `${percent}%`
    trendDesc = `${diff} Higher vs ${comparisonMap[period]}`
  }

  if (diff < 0) {
    trendDirection = "up"
    trendValue = `${percent}%`
    trendDesc = `${Math.abs(diff)} Fewer vs ${comparisonMap[period]}`
  }

  return {
    total,
    open,
    closed,
    sevLow,
    sevMinor,
    sevMajor,
    sevCritical,
    ttrLongest: longest ? formatMinutes(longest) : "-",
    ttrAvg: closedCount ? formatMinutes(Math.round(totalClosedMinutes / closedCount)) : "-",
    trendValue,
    trendDirection,
    trendDesc,
    trendPercent: percent,
    trendLabel: trendLabelMap[period],
  }
}


// ============ REPORT GENERATOR (WITH TTR) ============
export function generateReport(incidents: Incident[]): string {
  if (!incidents.length) return ""

  const hari = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  let text = `*Update Ticket Gangguan Indihome Fixed Broadband*\n*${hari}*\n`

  incidents.forEach((x, i) => {
    const status = (x.status || "").toUpperCase()
    const severity = (x.severity || "").toUpperCase()
    const ttr = calcTTR(x.start, x.end)

    text += `\n*${i + 1}. Gangguan ${x.ruas}*\n`
    text += `Severity : *${severity}*\n`
    text += `Current Status : *${status}${status === "CLOSED" ? " ✅" : ""}*\n`
    text += `Start Time : ${x.start}\n`
    text += `End Time : ${x.end || "-"}\n`
    text += `No Tiket : ${x.tickets.join(" , ")}\n`

    if (status === "CLOSED") {
      if (x.rca) text += `RCA : ${x.rca}\n`
      if (x.penanganan) text += `Penanganan : ${x.penanganan}\n`
    }

    if (status === "OPEN") {
      if (x.rfo) text += `RFO : ${x.rfo}\n`
      if (x.impact) text += `Potensi Impact Service : *${x.impact}*\n`
      if (x.progress) text += `Progress :\n${x.progress}\n`
      if (x.nodes) text += `Potensi Node terdampak :\n${x.nodes}\n`
      if (x.ssl) {
        const formatted = Number(x.ssl).toLocaleString("id-ID")
        text += `Estimasi Impacted Customer : *${formatted} SSL*\n`
      }
    }
  })

  text += `\n*Catatan :*\n`
  text += `*Informasi ini untuk internal Telkom Group.*\n`
  text += `*Mohon kakak-kakak tidak menyebarluaskan secara umum.*\n`
  text += `\n*Demikian disampaikan, Terima Kasih.*`

  return text
}

// ============ FORMAT SINGLE INCIDENT FOR WA ============
export function formatIncidentForWA(x: Incident, index: number): string {
  const status = (x.status || "").toUpperCase()
  const severity = (x.severity || "").toUpperCase()
  const ttr = calcTTR(x.start, x.end)

  let text = `*${index}. Gangguan ${x.ruas}*\n`
  text += `Severity : *${severity}*\n`
  text += `Current Status : *${status}${status === "CLOSED" ? " ✅" : ""}*\n`
  text += `Start Time : ${x.start}\n`
  text += `End Time : ${x.end || "-"}\n`
  text += `TTR : ${ttr}\n`
  text += `No Tiket : ${x.tickets.join(" , ")}\n`

  if (status === "CLOSED") {
    if (x.rca) text += `RCA : ${x.rca}\n`
    if (x.penanganan) text += `Penanganan : ${x.penanganan}\n`
  }

  if (status === "OPEN") {
    if (x.rfo) text += `RFO : ${x.rfo}\n`
    if (x.impact) text += `Potensi Impact Service : *${x.impact}*\n`
    if (x.progress) text += `Progress :\n${x.progress}\n`
    if (x.nodes) text += `Potensi Node terdampak :\n${x.nodes}\n`
    if (x.ssl) {
      const formatted = Number(x.ssl).toLocaleString("id-ID")
      text += `Estimasi Impacted Customer : *${formatted} SSL*\n`
    }
  }

  return text
}
