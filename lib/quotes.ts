/**
 * Shared vocabulary for quotes.
 *
 * Values and ordering here come straight from the spec — the specimen list is
 * spec §05's dropdown order, and the status values match the Quote.status
 * column documented in build brief §2. Keep them in sync with the spec rather
 * than reordering for convenience: §10's pricing blocks are numbered to match
 * §05's specimen order.
 */

/** Spec §05 — biospecimen type dropdown, in the order reps see it. */
export const SPECIMEN_TYPES = [
  'Fresh tissue',
  'Frozen tissue',
  'FFPE block',
  'Whole blood',
  'Plasma',
  'Serum',
  'Buffy coat',
  'PBMC',
  'Fresh marrow',
  'BMMC',
  'Urine',
  'Saliva',
  'Buccal swab',
  'Nasal swab',
  'Nasopharyngeal swab',
  'Stool',
  'Other',
] as const

/** Spec §01 — quote validity options. */
export const VALIDITY_OPTIONS = ['30 Day Quote', '60 Day Quote'] as const

/** Spec §01 — service type, either or both. */
export const SERVICE_TYPES = ['Retrospective', 'Prospective'] as const

export const QUOTE_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'internal_reviewed', label: 'Internally reviewed' },
  { value: 'sent', label: 'Sent to sponsor' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
] as const

export type QuoteStatus = (typeof QUOTE_STATUSES)[number]['value']

export const QUOTE_STATUS_VALUES: readonly string[] = QUOTE_STATUSES.map(
  (s) => s.value,
)

export function statusLabel(value: string): string {
  return QUOTE_STATUSES.find((s) => s.value === value)?.label ?? value
}

/**
 * The nested state blob stored in Quote.formData.
 *
 * Phase 2 fills in only the header and summary sections; the remaining
 * sections arrive in Phase 3. Every key is optional so a quote saved by an
 * earlier phase still loads once later phases add their sections — that
 * forward-compatibility is the reason this lives in a JSON column at all
 * (build brief §2).
 */
export type QuoteFormData = {
  header?: {
    sponsorContactName?: string
    sponsorContactEmail?: string
    hubspotDealName?: string
    validity?: string
    serviceTypes?: string[]
    sponsorSelectedCases?: string
    originalStudyPo?: string
    originalStudyQuote?: string
    parentMtNumber?: string
    extensionNumber?: string
    designChanged?: boolean
  }
  summary?: {
    quoteName?: string
    summaryText?: string
  }
  // Sections 02–11 land here in later phases.
  [section: string]: unknown
}

/**
 * Quote number, per the format in build brief §2:
 *   "QTE NTA20260826 Pan-cancer - blood"
 * Falls back to the client name when no sponsor acronym is known yet.
 */
export function buildQuoteNumber(input: {
  sponsorAcronym?: string | null
  client: string
  quoteDate: Date
  quoteName: string
}): string {
  const prefix = (input.sponsorAcronym?.trim() || input.client.trim())
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6)

  const y = input.quoteDate.getUTCFullYear()
  const m = String(input.quoteDate.getUTCMonth() + 1).padStart(2, '0')
  const d = String(input.quoteDate.getUTCDate()).padStart(2, '0')

  return `QTE ${prefix}${y}${m}${d} ${input.quoteName}`.trim()
}

/** Formats a Decimal/string/number as US currency without floating-point drift. */
export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const asString = typeof value === 'string' ? value : String(value)
  const n = Number(asString)
  if (Number.isNaN(n)) return '—'
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatQuoteDate(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
