import rawMapping from "./sto-mapping.json"

export interface StoEntry {
  STO: string
  REGIOANAL: string
}

let cachedMapping: Record<string, string> | null = null

export function getStoMapping(): Record<string, string> {
  if (cachedMapping) return cachedMapping

  const mapping: Record<string, string> = {}
  const entries = rawMapping as StoEntry[]

  for (const entry of entries) {
    if (entry.STO && entry.REGIOANAL) {
      mapping[entry.STO.toUpperCase()] = entry.REGIOANAL
    }
  }

  cachedMapping = mapping
  return mapping
}
