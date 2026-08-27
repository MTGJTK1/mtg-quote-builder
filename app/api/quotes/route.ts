import { prisma } from '@/lib/db'
import { parseQuoteInput } from '@/lib/quoteInput'

export const dynamic = 'force-dynamic'

/** GET /api/quotes — the register list. */
export async function GET() {
  const quotes = await prisma.quote.findMany({
    // Newest quote first; last-edited breaks ties within a day.
    orderBy: [{ quoteDate: 'desc' }, { updatedAt: 'desc' }],
    include: { preparedBy: { select: { name: true } } },
  })

  return Response.json(
    quotes.map((q) => ({
      id: q.id,
      quoteNumber: q.quoteNumber,
      quoteName: q.quoteName,
      client: q.client,
      sponsorAcronym: q.sponsorAcronym,
      preparedBy: q.preparedBy.name,
      quoteDate: q.quoteDate,
      status: q.status,
      totalCost: q.totalCost?.toString() ?? null,
      specimenTypes: q.specimenTypes,
      isExtension: q.isExtension,
      updatedAt: q.updatedAt,
    })),
  )
}

/** POST /api/quotes — create a quote. */
export async function POST(request: Request) {
  const parsed = parseQuoteInput(await request.json().catch(() => null))
  if (!parsed.ok) {
    return Response.json({ errors: parsed.errors }, { status: 400 })
  }

  const quote = await prisma.quote.create({ data: parsed.value })
  return Response.json({ id: quote.id, quoteNumber: quote.quoteNumber }, { status: 201 })
}
