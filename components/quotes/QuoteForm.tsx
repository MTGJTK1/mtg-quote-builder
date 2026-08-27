'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'

import type { QuoteFormValues, Rep } from '@/lib/quoteFormValues'
import {
  QUOTE_STATUSES,
  SERVICE_TYPES,
  SPECIMEN_TYPES,
  VALIDITY_OPTIONS,
} from '@/lib/quotes'

const label = 'block text-sm font-medium mb-1.5'
const field =
  'w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/50 dark:border-white/20 dark:focus:border-white/50'

/**
 * Pairs a <label> with its control via a generated id, so screen readers
 * announce the field and clicking the label focuses the input. Sibling
 * label/input markup without this association reads as an unlabelled box.
 */
function Field({
  label: text,
  required,
  hint,
  className = '',
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  className?: string
  children: (id: string) => React.ReactNode
}) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className={label}>
        {text} {required && <Required />}
      </label>
      {children(id)}
      {hint && <p className="mt-1.5 text-xs opacity-50">{hint}</p>}
    </div>
  )
}

export function QuoteForm({
  reps,
  initial,
  quoteId,
}: {
  reps: Rep[]
  initial: QuoteFormValues
  quoteId?: string
}) {
  const router = useRouter()
  const [values, setValues] = useState<QuoteFormValues>(initial)
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function set<K extends keyof QuoteFormValues>(key: K, value: QuoteFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function setHeader(key: string, value: unknown) {
    setValues((v) => ({
      ...v,
      formData: { ...v.formData, header: { ...v.formData.header, [key]: value } },
    }))
  }

  const header = values.formData.header ?? {}
  const serviceTypes = header.serviceTypes ?? []

  function toggleSpecimen(type: string) {
    set(
      'specimenTypes',
      values.specimenTypes.includes(type)
        ? values.specimenTypes.filter((t) => t !== type)
        : [...values.specimenTypes, type],
    )
  }

  function toggleServiceType(type: string) {
    setHeader(
      'serviceTypes',
      serviceTypes.includes(type)
        ? serviceTypes.filter((t) => t !== type)
        : [...serviceTypes, type],
    )
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setErrors([])

    const response = await fetch(
      quoteId ? `/api/quotes/${quoteId}` : '/api/quotes',
      {
        method: quoteId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          formData: {
            ...values.formData,
            summary: { ...values.formData.summary, quoteName: values.quoteName },
          },
        }),
      },
    )

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      setErrors(body.errors ?? [body.error ?? 'Could not save this quote.'])
      setSaving(false)
      return
    }

    const { id } = await response.json()
    router.push(`/quotes/${quoteId ?? id}`)
    router.refresh()
  }

  async function remove() {
    if (!quoteId) return
    if (!confirm('Delete this quote? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/quotes/${quoteId}`, { method: 'DELETE' })
    router.push('/quotes')
    router.refresh()
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-8">
      {errors.length > 0 && (
        <div
          role="alert"
          className="rounded-md border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm"
        >
          <p className="mb-1.5 font-medium">This quote can&apos;t be saved yet:</p>
          <ul className="list-disc pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <Section number="01" title="Quote header">
        <label className="mb-5 flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={values.isExtension}
            onChange={(e) => set('isExtension', e.target.checked)}
            className="size-4"
          />
          This is a study extension
        </label>

        {values.isExtension && (
          <div className="mb-5 grid gap-4 rounded-md border border-black/10 p-4 sm:grid-cols-2 dark:border-white/15">
            <Field label="Original study quote">
              {(id) => (
                <input
                  id={id}
                  className={field}
                  value={header.originalStudyQuote ?? ''}
                  onChange={(e) => setHeader('originalStudyQuote', e.target.value)}
                />
              )}
            </Field>
            <Field label="Original study PO #">
              {(id) => (
                <input
                  id={id}
                  className={field}
                  value={header.originalStudyPo ?? ''}
                  onChange={(e) => setHeader('originalStudyPo', e.target.value)}
                />
              )}
            </Field>
            <Field label="Parent MT number">
              {(id) => (
                <input
                  id={id}
                  className={field}
                  value={header.parentMtNumber ?? ''}
                  onChange={(e) => setHeader('parentMtNumber', e.target.value)}
                />
              )}
            </Field>
            <Field label="Extension #">
              {(id) => (
                <input
                  id={id}
                  className={field}
                  value={header.extensionNumber ?? ''}
                  onChange={(e) => setHeader('extensionNumber', e.target.value)}
                />
              )}
            </Field>
            <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={header.designChanged ?? true}
                onChange={(e) => setHeader('designChanged', e.target.checked)}
                className="size-4"
              />
              The study design has changed
            </label>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client / sponsor" required>
            {(id) => (
              <input
                id={id}
                className={field}
                value={values.client}
                onChange={(e) => set('client', e.target.value)}
                placeholder="Natera"
              />
            )}
          </Field>
          <Field label="Sponsor acronym">
            {(id) => (
              <input
                id={id}
                className={field}
                value={values.sponsorAcronym}
                onChange={(e) => set('sponsorAcronym', e.target.value.toUpperCase())}
                placeholder="NTA"
              />
            )}
          </Field>
          <Field label="Prepared by" required>
            {(id) => (
              <select
                id={id}
                className={field}
                value={values.preparedById}
                onChange={(e) => set('preparedById', e.target.value)}
              >
                {reps.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    {rep.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Quote date" required>
            {(id) => (
              <input
                id={id}
                type="date"
                className={field}
                value={values.quoteDate}
                onChange={(e) => set('quoteDate', e.target.value)}
              />
            )}
          </Field>
          <Field label="Validity">
            {(id) => (
              <select
                id={id}
                className={field}
                value={header.validity ?? VALIDITY_OPTIONS[0]}
                onChange={(e) => setHeader('validity', e.target.value)}
              >
                {VALIDITY_OPTIONS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="HubSpot deal name">
            {(id) => (
              <input
                id={id}
                className={field}
                value={values.hubspotDealName}
                onChange={(e) => set('hubspotDealName', e.target.value)}
                placeholder="NTA: 500 healthies - blood"
              />
            )}
          </Field>
          <Field label="Sponsor contact name">
            {(id) => (
              <input
                id={id}
                className={field}
                value={header.sponsorContactName ?? ''}
                onChange={(e) => setHeader('sponsorContactName', e.target.value)}
              />
            )}
          </Field>
          <Field label="Sponsor contact email">
            {(id) => (
              <input
                id={id}
                type="email"
                className={field}
                value={header.sponsorContactEmail ?? ''}
                onChange={(e) => setHeader('sponsorContactEmail', e.target.value)}
              />
            )}
          </Field>
        </div>

        <fieldset className="mt-5">
          <legend className={label}>Service type</legend>
          <div className="flex flex-wrap gap-4">
            {SERVICE_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={serviceTypes.includes(type)}
                  onChange={() => toggleServiceType(type)}
                  className="size-4"
                />
                {type}
              </label>
            ))}
          </div>
        </fieldset>

        {serviceTypes.includes('Retrospective') && (
          <Field label="Sponsor-selected cases" className="mt-4">
            {(id) => (
              <textarea
                id={id}
                className={field}
                rows={2}
                value={header.sponsorSelectedCases ?? ''}
                onChange={(e) => setHeader('sponsorSelectedCases', e.target.value)}
                placeholder="Document name, or case / biospecimen numbers"
              />
            )}
          </Field>
        )}
      </Section>

      <Section number="05" title="Biospecimens">
        <PartialNote>
          Which specimen types this quote covers — that is all this captures
          today. Storage state, media, tube type, volumes, aliquots and FFPE
          specs arrive in Phase 3.
        </PartialNote>
        <div className="grid gap-2 sm:grid-cols-3">
          {SPECIMEN_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={values.specimenTypes.includes(type)}
                onChange={() => toggleSpecimen(type)}
                className="size-4"
              />
              {type}
            </label>
          ))}
        </div>
      </Section>

      <Section number="06" title="Quote name">
        <Field
          label="Quote name"
          required
          hint="Auto-drafting from population and specimens arrives in Phase 3."
        >
          {(id) => (
            <input
              id={id}
              className={field}
              value={values.quoteName}
              onChange={(e) => set('quoteName', e.target.value)}
              placeholder="CRC - plasma &amp; buffy"
            />
          )}
        </Field>
      </Section>

      <Section number="10" title="Pricing">
        <PartialNote>
          One total for the whole study — that is all this captures today.
          Per-specimen pricing, shipping, screenfails, historical comparables
          and internal pricing notes arrive in Phase 4.
        </PartialNote>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Total study cost"
          >
            {(id) => (
              <input
                id={id}
                className={field}
                value={values.totalCost}
                onChange={(e) => set('totalCost', e.target.value)}
                placeholder="125000.00"
                inputMode="decimal"
              />
            )}
          </Field>
          <Field label="Status">
            {(id) => (
              <select
                id={id}
                className={field}
                value={values.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {QUOTE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/10 pt-6 dark:border-white/15">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {saving ? 'Saving…' : quoteId ? 'Save changes' : 'Create quote'}
        </button>
        <Link
          href={quoteId ? `/quotes/${quoteId}` : '/quotes'}
          className="rounded-md border border-black/15 px-4 py-2 text-sm dark:border-white/20"
        >
          Cancel
        </Link>
        {quoteId && (
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            className="ml-auto text-sm text-red-600 underline underline-offset-4 disabled:opacity-50 dark:text-red-400"
          >
            {deleting ? 'Deleting…' : 'Delete quote'}
          </button>
        )}
      </div>
    </form>
  )
}

/**
 * Marks a section that renders but only captures part of what it eventually
 * will. Without this the stubs read as broken rather than unfinished.
 */
function PartialNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline gap-2 rounded-r-md border-l-[3px] border-black/20 bg-black/[.03] px-3 py-2.5 text-xs opacity-70 dark:border-white/25 dark:bg-white/[.04]">
      <span className="rounded border border-black/20 px-1.5 py-px text-[10px] font-semibold tracking-widest uppercase dark:border-white/25">
        Partial
      </span>
      <span className="flex-1">{children}</span>
    </div>
  )
}

function Required() {
  return (
    <span className="text-red-600 dark:text-red-400" aria-hidden>
      *
    </span>
  )
}

function Section({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-4 flex items-baseline gap-2.5 border-b border-black/10 pb-2 dark:border-white/15">
        <span className="font-mono text-xs opacity-40">{number}</span>
        <span className="text-base font-semibold">{title}</span>
      </h2>
      {children}
    </section>
  )
}
