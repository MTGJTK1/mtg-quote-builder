import { prisma } from '@/lib/db'

// Reads the database at request time — must never be prerendered at build.
export const dynamic = 'force-dynamic'

/**
 * Deploy smoke test: confirms the app is serving and reports whether it can
 * reach Postgres. Deliberately returns 200 with `database: "unreachable"`
 * rather than failing, so the scaffold is verifiable before a database exists.
 */
export async function GET() {
  let database: 'connected' | 'unreachable' = 'unreachable'
  let detail: string | undefined

  try {
    await prisma.$queryRaw`SELECT 1`
    database = 'connected'
  } catch (error) {
    detail = error instanceof Error ? error.message : String(error)
  }

  return Response.json({
    status: 'ok',
    app: 'mtg-quote-builder',
    database,
    ...(detail ? { detail } : {}),
    timestamp: new Date().toISOString(),
  })
}
