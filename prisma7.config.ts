import 'dotenv/config'
import { defineConfig } from 'prisma/config'

/**
 * Migrations need a direct connection, not a pooled one.
 *
 * Neon (and Vercel Postgres) hand out two connection strings: a pooled one
 * whose host contains `-pooler`, and a direct one without it. The pooled
 * endpoint runs PgBouncer in transaction mode, which cannot hold the
 * session-level locks a migration takes, so `prisma migrate` must use the
 * direct URL while the running app uses the pooled one.
 *
 * Set DIRECT_URL to the unpooled string. On a plain Postgres with no pooler
 * — local development, for instance — leave it unset and DATABASE_URL is
 * used for both.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DIRECT_URL'] || process.env['DATABASE_URL'],
  },
})
