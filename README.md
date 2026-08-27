# MT Group Quote Builder

Structured quote intake for The MT Group. One form produces two documents:

1. **Internal Draft** — full pricing math, sourcing notes, T&Cs check, for review.
2. **Sponsor Quote** — clean document matching MTG's letterhead format exactly.

Replaces the current workflow of searching HubSpot/OneDrive for comparable past
quotes, reconstructing pricing by hand, and typing a Word document.

## Source documents

Both live in [`docs/`](docs/) and are the source of truth — read them before
changing behavior:

- [`docs/MTG_Quote_Builder_Spec.md`](docs/MTG_Quote_Builder_Spec.md) — what the
  tool does: field-by-field spec for all eleven sections, document formatting
  rules, and a list of approaches that were tried and deliberately reverted.
- [`docs/MTG_Quote_Builder_Build_Brief.md`](docs/MTG_Quote_Builder_Build_Brief.md)
  — how to build it: stack, schema, folder layout, phased build order.
- [`docs/ARCHITECTURE_feasibility_and_quotes.md`](docs/ARCHITECTURE_feasibility_and_quotes.md)
  — why a feasibility builder changes the shape: nine of the eleven sections are
  shared, so study design lives in its own record and the sections serve both
  documents. Revises the build order below.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript + Tailwind 4 |
| Database | Postgres (Vercel Postgres / Neon) |
| ORM | Prisma 7 with the `@prisma/adapter-pg` driver adapter |
| Auth | Auth.js magic link, allowlisted to the MTG team *(Phase 8)* |
| HubSpot | `@hubspot/api-client`, Private App token, portal 7423331 *(Phase 5)* |
| Docx | `docx` npm package, server-side *(Phase 6)* |
| Hosting | Vercel |

## Local setup

Requires Node 20+ and a Postgres database.

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL at minimum
npm run db:migrate        # apply migrations
npm run dev               # http://localhost:3000
```

`GET /api/health` reports app and database status — use it to confirm a
deployment is wired up correctly.

### Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create and apply a migration (development) |
| `npm run db:deploy` | Apply existing migrations (production/CI) |
| `npm run db:studio` | Browse the database |
| `npm run db:seed` | Create the four reps (idempotent) |

`prisma generate` runs on `postinstall`; the generated client lives in
`lib/generated/prisma` and is not committed.

## Connecting a hosted database

The app runs on any Postgres. On Neon or Vercel Postgres, which put a
connection pooler in front of the database, set **two** variables:

| Variable | Which connection string | Used by |
|---|---|---|
| `DATABASE_URL` | pooled — host contains `-pooler` | the running app |
| `DIRECT_URL` | direct — the same string with `-pooler` removed | `prisma migrate` only |

Migrations take session-level locks that a transaction-mode pooler cannot
hold, which is the whole reason for the split. On a plain Postgres with no
pooler, leave `DIRECT_URL` unset and `DATABASE_URL` is used for both.

Change the `sslmode=require` Neon hands out to `sslmode=verify-full`. Both
verify the server certificate today, but a future driver release downgrades
`require` to encrypt-without-verifying; spelling out `verify-full` keeps the
check.

On Vercel, set both variables in the project's environment settings. The
`vercel-build` script applies pending migrations before building, so a deploy
brings the database up to date on its own — there is no separate migration
step to remember.

## Build phases

Each phase is independently demoable. Don't move on until the current one
actually works, not just compiles. Full detail in build brief §8.

| | Phase | Status |
|---|---|---|
| 1 | Scaffold — Next.js + TypeScript + Tailwind + Prisma | **Done** |
| 2 | Quote CRUD — schema migrated, save/load, register list | **Done** |
| 3 | Intake form — the eleven sections, ported from the prototype | Next |
| 4 | Pricing & validation — as pure, unit-tested functions | |
| 5 | HubSpot — deal pre-fill, live population options, quote-code cron | |
| 6 | Docx generation — internal draft and sponsor quote | |
| 7 | Shared data — cost log, comparables, rate card, quote codes | |
| 8 | Auth + deploy to a real URL | |
| 9 | Handoff — extend access to the rest of the team | |

## Decisions that need a human

Carried forward from build brief §9 — these can't be made from code:

- **HubSpot Private App.** A HubSpot admin on portal 7423331 must create the
  Private App and generate the token (Settings → Integrations → Private Apps).
- **Hosting account.** Does MTG have an existing Vercel/GitHub org, or does one
  get created? Determines who owns billing and access long-term.
- **Transactional email** for magic-link auth (Resend, Postmark, etc.) — needed
  before Phase 8.
- **Domain.** A real subdomain (e.g. `quotes.mtgroupbio.com`) or a Vercel URL?
  A subdomain needs DNS access for mtgroupbio.com.
