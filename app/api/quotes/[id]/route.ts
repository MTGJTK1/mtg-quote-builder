import { prisma } from '@/lib/db'
import { parseQuoteInput } from '@/lib/quoteInput'

export const dynamic = 'force-dynamic'

/** GET /api/quotes/[id] — load one quote for editing. */
export async function GET(_request: Request, ctx: RouteContext<'/api/quotes/[id]'>) {
  const { id } = await ctx.params
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { preparedBy: { select: { id: true, name: true } } },
  })

  if (!quote) return Response.json({ error: 'Quote not found.' }, { status: 404 })

  return Response.json({
    ...quote,
    totalCost: quote.totalCost?.toString() ?? null,
  })
}

/** PUT /api/quotes/[id] — save edits. */
export async function PUT(request: Request, ctx: RouteContext<'/api/quotes/[id]'>) {
  const { id } = await ctx.params
  const parsed = parseQuoteInput(await request.json().catch(() => null))
  if (!parsed.ok) {
    return Response.json({ errors: parsed.errors }, { status: 400 })
  }

  const existing = await prisma.quote.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return Response.json({ error: 'Quote not found.' }, { status: 404 })

  const quote = await prisma.quote.update({ where: { id }, data: parsed.value })
  return Response.json({ id: quote.id, quoteNumber: quote.quoteNumber })
}

/** DELETE /api/quotes/[id] */
export async function DELETE(_request: Request, ctx: RouteContext<'/api/quotes/[id]'>) {
  const { id } = await ctx.params
  const existing = await prisma.quote.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return Response.json({ error: 'Quote not found.' }, { status: 404 })

  await prisma.quote.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
