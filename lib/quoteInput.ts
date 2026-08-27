import { Prisma } from '@/lib/generated/prisma/client'

import { QUOTE_STATUS_VALUES, buildQuoteNumber, type QuoteFormData } from './quotes'

export type QuoteInput = {
  client: string
  quoteName: string
  sponsorAcronym?: string | null
  preparedById: string
  quoteDate: Date
  status: string
  specimenTypes: string[]
  totalCost: Prisma.Decimal | null
  isExtension: boolean
  hubspotDealName?: string | null
  // Prisma types JSON columns as InputJsonValue, which no interface with an
  // index signature satisfies structurally. Cast at the boundary below.
  formData: Prisma.InputJsonValue
  quoteNumber: string
}

export type ParseResult =
  | { ok: true; value: QuoteInput }
  | { ok: false; errors: string[] }

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Validates and normalizes a quote payload from the intake form.
 *
 * This is deliberately the light structural check — "can we store this?" — not
 * the full pre-generation validation from spec §11, which checks pricing and
 * population completeness and arrives in Phase 4.
 */
export function parseQuoteInput(body: unknown): ParseResult {
  const errors: string[] = []
  const raw = (body ?? {}) as Record<string, unknown>

  const client = str(raw.client)
  if (!client) errors.push('Client / sponsor is required (§01).')

  const quoteName = str(raw.quoteName)
  if (!quoteName) errors.push('Quote name is required (§06).')

  const preparedById = str(raw.preparedById)
  if (!preparedById) errors.push('Prepared by is required (§01).')

  const quoteDateRaw = str(raw.quoteDate)
  const quoteDate = quoteDateRaw ? new Date(`${quoteDateRaw}T00:00:00Z`) : null
  if (!quoteDate || Number.isNaN(quoteDate.getTime())) {
    errors.push('Quote date is required and must be a real date (§01).')
  }

  const status = str(raw.status) || 'draft'
  if (!QUOTE_STATUS_VALUES.includes(status)) {
    errors.push(`Status must be one of: ${QUOTE_STATUS_VALUES.join(', ')}.`)
  }

  const specimenTypes = Array.isArray(raw.specimenTypes)
    ? raw.specimenTypes.filter((t): t is string => typeof t === 'string' && t.trim() !== '')
    : []

  // Money is Decimal, never a JS float — see AGENTS.md.
  let totalCost: Prisma.Decimal | null = null
  const totalCostRaw = str(raw.totalCost)
  if (totalCostRaw) {
    try {
      totalCost = new Prisma.Decimal(totalCostRaw.replace(/[$,]/g, ''))
      if (totalCost.isNegative()) errors.push('Total cost cannot be negative (§10).')
    } catch {
      errors.push('Total cost must be a number (§10).')
    }
  }

  if (errors.length > 0) return { ok: false, errors }

  const sponsorAcronym = str(raw.sponsorAcronym) || null
  const hubspotDealName = str(raw.hubspotDealName) || null
  const formData = (raw.formData ?? {}) as QuoteFormData

  return {
    ok: true,
    value: {
      client,
      quoteName,
      sponsorAcronym,
      preparedById,
      quoteDate: quoteDate!,
      status,
      specimenTypes,
      totalCost,
      isExtension: raw.isExtension === true,
      hubspotDealName,
      formData: formData as Prisma.InputJsonValue,
      quoteNumber: buildQuoteNumber({
        sponsorAcronym,
        client,
        quoteDate: quoteDate!,
        quoteName,
      }),
    },
  }
}
