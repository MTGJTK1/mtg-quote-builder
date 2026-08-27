import Link from 'next/link'

import { QuoteForm } from '@/components/quotes/QuoteForm'
import { emptyQuote } from '@/lib/quoteFormValues'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'New quote — MT Group' }

export default async function NewQuotePage() {
  const reps = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/quotes"
        className="text-sm opacity-60 underline-offset-4 hover:underline"
      >
        ← Quote register
      </Link>
      <h1 className="mt-4 mb-8 text-2xl font-semibold tracking-tight">New quote</h1>
      <QuoteForm reps={reps} initial={emptyQuote(reps)} />
    </main>
  )
}
