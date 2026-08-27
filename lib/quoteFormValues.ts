import type { QuoteFormData } from './quotes'

/**
 * Values shared between the server pages (which load a quote and build the
 * starting values) and the client form component that edits them.
 *
 * These live outside the `'use client'` component on purpose: a server
 * component cannot call a function exported from a client module, so keeping
 * `emptyQuote` here is what lets /quotes/new build its initial state.
 */
export type Rep = { id: string; name: string }

export type QuoteFormValues = {
  client: string
  sponsorAcronym: string
  quoteName: string
  preparedById: string
  quoteDate: string
  status: string
  totalCost: string
  specimenTypes: string[]
  isExtension: boolean
  hubspotDealName: string
  formData: QuoteFormData
}

export function emptyQuote(reps: Rep[]): QuoteFormValues {
  return {
    client: '',
    sponsorAcronym: '',
    quoteName: '',
    preparedById: reps[0]?.id ?? '',
    quoteDate: new Date().toISOString().slice(0, 10),
    status: 'draft',
    totalCost: '',
    specimenTypes: [],
    isExtension: false,
    hubspotDealName: '',
    formData: {},
  }
}
