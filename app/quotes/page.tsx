import Link from 'next/link'

import { prisma } from '@/lib/db'
import { formatCurrency, formatQuoteDate, statusLabel } from '@/lib/quotes'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Quote register — MT Group' }

export default async function RegisterPage() {
  const quotes = await prisma.quote.findMany({
    // Newest quote first; last-edited breaks ties within a day.
    orderBy: [{ quoteDate: 'desc' }, { updatedAt: 'desc' }],
    include: { preparedBy: { select: { name: true } } },
  })

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest opacity-50">
            The MT Group
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Quote register
          </h1>
        </div>
        <Link
          href="/quotes/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          New quote
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/20 px-6 py-16 text-center dark:border-white/20">
          <p className="text-sm opacity-70">No quotes yet.</p>
          <Link
            href="/quotes/new"
            className="mt-2 inline-block text-sm underline underline-offset-4"
          >
            Create the first one
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left dark:border-white/15">
                <Th>Quote</Th>
                <Th>Client</Th>
                <Th>Prepared by</Th>
                <Th>Date</Th>
                <Th className="text-right">Total</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-b border-black/5 last:border-b-0 dark:border-white/10"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/quotes/${quote.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {quote.quoteName}
                    </Link>
                    <div className="mt-0.5 font-mono text-xs opacity-50">
                      {quote.quoteNumber}
                    </div>
                    {quote.specimenTypes.length > 0 && (
                      <div className="mt-1 text-xs opacity-50">
                        {quote.specimenTypes.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {quote.client}
                    {quote.isExtension && (
                      <span className="ml-2 rounded border border-black/15 px-1.5 py-0.5 text-xs opacity-60 dark:border-white/20">
                        extension
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">{quote.preparedBy.name}</td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    {formatQuoteDate(quote.quoteDate)}
                  </td>
                  <td className="px-4 py-3 text-right align-top tabular-nums whitespace-nowrap">
                    {formatCurrency(quote.totalCost?.toString())}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    {statusLabel(quote.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs opacity-40">
        {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'}
      </p>
    </main>
  )
}

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={`px-4 py-2.5 font-medium text-xs uppercase tracking-wide opacity-50 ${className}`}
    >
      {children}
    </th>
  )
}
