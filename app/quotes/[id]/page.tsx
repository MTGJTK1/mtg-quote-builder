import Link from 'next/link'
import { notFound } from 'next/navigation'

import { QuoteForm } from '@/components/quotes/QuoteForm'
import type { QuoteFormValues } from '@/lib/quoteFormValues'
import { prisma } from '@/lib/db'
import { formatQuoteDate, type QuoteFormData } from '@/lib/quotes'

export const dynamic = 'force-dynamic'

export default async function EditQuotePage({
  params,
}: PageProps<'/quotes/[id]'>) {
  const { id } = await params

  const [quote, reps] = await Promise.all([
    prisma.quote.findUnique({ where: { id } }),
    prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  if (!quote) notFound()

  const initial: QuoteFormValues = {
    client: quote.client,
    sponsorAcronym: quote.sponsorAcronym ?? '',
    quoteName: quote.quoteName,
    preparedById: quote.preparedById,
    quoteDate: quote.quoteDate.toISOString().slice(0, 10),
    status: quote.status,
    totalCost: quote.totalCost?.toString() ?? '',
    specimenTypes: quote.specimenTypes,
    isExtension: quote.isExtension,
    hubspotDealName: quote.hubspotDealName ?? '',
    formData: (quote.formData ?? {}) as QuoteFormData,
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/quotes"
        className="text-sm opacity-60 underline-offset-4 hover:underline"
      >
        ← Quote register
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {quote.quoteName}
        </h1>
        <p className="mt-1.5 font-mono text-sm opacity-50">{quote.quoteNumber}</p>
        <p className="mt-1 text-xs opacity-40">
          Last saved {formatQuoteDate(quote.updatedAt)}
        </p>
      </div>

      <QuoteForm reps={reps} initial={initial} quoteId={quote.id} />
    </main>
  )
}
