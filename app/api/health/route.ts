import { prisma } from '@/lib/db'

// Reads the database at request time — must never be prerendered at build.
export const dynamic = 'force-dynamic'

/**
 * Deploy smoke test and monitoring endpoint.
 *
 * Returns 503 when Postgres is unreachable so that a monitor, or an nginx
 * upstream check, treats it as down. It reported 200 in either case while the
 * scaffold predated the database; that is no longer true and would have read
 * as healthy with nothing behind it.
 *
 * The connection error is logged, never returned — it names the database host
 * and port, and this endpoint is not behind authentication.
 */
export async function GET() {
  let database: 'connected' | 'unreachable' = 'unreachable'

  try {
    await prisma.$queryRaw`SELECT 1`
    database = 'connected'
  } catch (error) {
    console.error('[health] database unreachable:', error)
  }

  const ok = database === 'connected'

  return Response.json(
    {
      status: ok ? 'ok' : 'degraded',
      app: 'mtg-quote-builder',
      database,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  )
}
