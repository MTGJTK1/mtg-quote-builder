# MT Group Quote Builder — Build-Ready Brief (for Claude Code)

Companion to `MTG_Quote_Builder_Spec.md` (the field-by-field/business-logic spec) and
`MT_Group_Reference_v2.md` (company reference doc). This document makes the technical
decisions the spec deliberately left open, so a Claude Code session can start building
immediately instead of re-deriving architecture. Read the spec first for *what* the
tool does; read this for *how* to build it.

---

## 1. Tech stack, with rationale

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router, TypeScript)** | One deployable unit for both UI and API routes — no separate backend service to stand up or operate, for a 3–4 person internal tool that doesn't need one. |
| Database | **Postgres** (Vercel Postgres / Neon) | Relational fits the quote register concept directly; both integrate frictionlessly with Vercel hosting. |
| ORM | **Prisma** | Type-safe queries matching Next.js/TypeScript, built-in migrations. |
| Auth | **Auth.js (NextAuth) — Email magic link**, allowlisted to known team emails | Zero password management for 4 users; still gives a real login and an audit trail of who created/edited each quote. |
| HubSpot | **`@hubspot/api-client`, Private App token** (not OAuth) | This only ever talks to one portal (7423331) for one team — OAuth's multi-tenant complexity buys nothing here. A Private App token is simpler to set up and rotate. |
| Docx generation | **`docx` npm package, server-side** | Already validated in this session — produces the exact two-column/tab-stop letterhead layout, verified by rendering to PDF and comparing against your real quotes page-by-page. Runs as a Next.js API route, returns the file as a download. |
| Hosting | **Vercel** | Native fit for Next.js; GitHub-connected auto-deploy on push to `main`. |

**Deliberate non-choice:** no separate backend framework (Express/Fastify/etc.), no
microservices. This is a small internal tool; a monolith in Next.js is the right size.

---

## 2. Database schema

Hybrid approach, not full normalization of every form field into its own table — this
is a deliberate call, not a shortcut taken by accident. The prototype already models
the whole quote as one nested JS object; keeping that shape in a JSON column means
porting the prototype's existing logic almost directly, while still pulling the fields
that actually need to be queried/reported on (client, price, date, specimen types) into
real columns on the parent row.

```prisma
model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  hubspotOwnerId String?
  role          String   @default("rep") // rep | admin
  quotes        Quote[]
  createdAt     DateTime @default(now())
}

model Quote {
  id              String   @id @default(cuid())
  quoteNumber     String   // e.g. "QTE NTA20260826 Pan-cancer - blood"
  quoteName       String
  client          String
  sponsorAcronym  String?
  hubspotDealId   String?
  hubspotDealName String?
  preparedById    String
  preparedBy      User     @relation(fields: [preparedById], references: [id])
  quoteDate       DateTime
  status          String   @default("draft") // draft | internal_reviewed | sent | won | lost
  totalCost       Decimal? // last computed grand total, for register list/sort/filter
  specimenTypes   String[] // denormalized for filtering the register
  isExtension     Boolean  @default(false)
  formData        Json     // full nested state: cohorts, specimens, pricing, timeline, etc.
                            // — same shape as the prototype's `state` object
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// --- Shared/growing tables — multi-user, cross-quote (the prototype's window.storage keys) ---

model CostLogEntry {
  id        String   @id @default(cuid())
  client    String
  kind      String   // "site cost — Fresh tissue", "shipping cost", "enrollment timeline"
  detail    String
  person    String
  date      DateTime
  createdAt DateTime @default(now())
}

model HistoricalComparable {
  id         String   @id @default(cuid())
  client     String
  indication String
  type       String?
  unit       String
  price      Decimal
  date       DateTime
  source     String   // "rep-added" or a real quote number once the register is seeded
  addedBy    String?
}

model FreshTissueRate {
  tumorType String   @id
  price     Decimal
  updatedBy String?
  updatedAt DateTime @updatedAt
}

model QuoteCode {
  clientNameLower String @id
  code            String
  learnedAt       DateTime @default(now())
}
```

**Why `formData` as JSON instead of ~15 normalized tables:** faster to build and ports
the prototype's logic directly; the register/reporting use case only needs a handful of
top-level fields (already pulled out above), not every nested field queryable. If usage
later demands real ad-hoc reporting across cohort/specimen internals, migrate those
specific pieces out of JSON at that point — don't pre-normalize speculatively now.

---

## 3. Folder structure

```
/app
  /api
    /hubspot
      /deal/[id]/route.ts        — fetch one deal's fields for pre-fill
      /deal-search/route.ts      — typeahead search by deal name
      /population-options/route.ts — live population_2 / sub_population enum values
    /quotes
      /route.ts                  — POST create, GET list (register)
      /[id]/route.ts             — GET/PUT/DELETE one quote
      /[id]/generate/route.ts    — POST → returns .docx (internal or sponsor, via ?type=)
    /cost-log/route.ts
    /historical/route.ts
    /rate-card/route.ts
    /quote-codes/route.ts
    /cron/refresh-quote-codes/route.ts  — nightly: sample recent deal titles, extract codes
    /auth/[...nextauth]/route.ts
  /quotes
    /new/page.tsx                — intake form
    /[id]/page.tsx                — edit existing quote
    /page.tsx                     — register / list view
  /login/page.tsx
/components
  /sections/
    01-Header.tsx  02-QuoteApproach.tsx  03-Cohorts.tsx  04-Timepoints.tsx
    05-Biospecimens.tsx  06-QuoteNameSummary.tsx  07-ClinicalData.tsx
    08-Reports.tsx  09-Timeline.tsx  10-Pricing.tsx  11-ReviewGenerate.tsx
  /ui/  — shared checklist, tag-input, currency-input, etc.
/lib
  /docx/
    shared.ts          — row(), cont(), hr(), bulletRow(), plain() (ported from the
                          validated build.js — same 2in column, keepNext, page-break rules)
    sponsorQuote.ts     — port of generateSponsorQuote()
    internalDraft.ts    — port of generateInternalDraft()
  /pricing.ts           — computeShipping, updateSummary, tumorTypePricingTotal (pure
                          functions, ported directly from the prototype's JS)
  /validation.ts        — validateQuote(), same rules and messages as the prototype
  /hubspot.ts           — thin client wrapper around @hubspot/api-client
  /db.ts                — Prisma client singleton
/prisma
  schema.prisma
  /migrations
```

---

## 4. HubSpot integration specifics

- **Auth:** Private App on portal 7423331, scope `crm.objects.deals.read` (add
  `crm.objects.companies.read` / `crm.objects.contacts.read` only if a later phase
  needs them). Token stored as `HUBSPOT_PRIVATE_APP_TOKEN` env var, never in code.
- **Deal lookup / pre-fill:** `GET /crm/v3/objects/deals/{id}` requesting properties
  `dealname, population_2, sub_population, cohort_1_indication` through
  `cohort_5_indication`. These are the confirmed real field names from §5 of the spec
  — don't re-guess names, they were verified live against the portal.
- **Live population dropdown:** `GET /crm/v3/properties/deals/population_2` and
  `.../sub_population` return the current enum option lists directly from HubSpot,
  replacing the prototype's hardcoded `POPULATION_MAP`. Cache with a short TTL
  (these change rarely) rather than hitting HubSpot on every form render.
- **Quote-code learning:** don't call HubSpot live on every page load for this. Run
  a nightly Vercel Cron (`/api/cron/refresh-quote-codes`) that samples ~200 recent
  deal names, regex-extracts the `^([A-Z0-9]{2,6}):` prefix, and upserts into
  `QuoteCode`. The intake form reads only from that table, staying fast regardless
  of HubSpot API latency.

---

## 5. Docx generation

Port `/home/claude/quote_docx/build.js` (validated in this session) into
`/lib/docx/shared.ts` almost directly — the helper functions (`row`, `cont`, `hr`,
`bulletRow`, `plain`) already encode every formatting rule from spec §3: Times New
Roman, 11pt body / 10.5pt T&Cs, the 2-inch hanging-indent column, `keepNext` on the
pricing block, forced page break before Terms & Conditions, footer page numbering.

`sponsorQuote.ts` and `internalDraft.ts` are ports of `generateSponsorQuote()` /
`generateInternalDraft()` from the prototype — same section order, same conditional
logic for minimal-extension mode, same T&Cs branching (confirmed-MSA vs.
flagged-vs-unconfirmed vs. standard).

**Verification workflow** (carry this forward — it's how every formatting bug in this
session actually got caught, by comparing rendered output against a real sample rather
than guessing):
```bash
soffice --headless --convert-to pdf output.docx
pdftoppm -jpeg -r 100 output.pdf page
# view page-1.jpg etc. next to a real uploaded quote, side by side
```
Needs LibreOffice + Poppler available in whatever environment tests this (local dev
machine or CI) — worth installing early rather than discovering the gap later.

**Storage decision:** don't store generated `.docx` binaries. Regenerate on demand
from `Quote.formData` — cheaper, and guarantees the download always reflects the
latest edits. If an audit trail of exactly-what-was-sent becomes a real need later,
add blob storage (Vercel Blob) at that point rather than building it speculatively now.

---

## 6. Auth

Auth.js Email provider (magic link), sender restricted to an allowlist of the four
known team emails (`jkibler@`, `hshahzade@`, `jtaylor@`, `kkrantz@mtgroupbio.com`) —
reject sign-in attempts from any other address. This gives real per-user sessions and
an audit trail (`Quote.preparedById`) without password management overhead.

**Faster shortcut if beta testing needs to start before auth is built:** a single
shared secret plus a name-select dropdown (no real login) gets the intake form usable
in an afternoon. Only use this as a v0 stopgap for John's own solo beta testing — real
auth is required before Heather and Josh get access, since login is what makes
`preparedBy` and the audit trail meaningful.

---

## 7. Environment variables

```
DATABASE_URL=
HUBSPOT_PRIVATE_APP_TOKEN=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
EMAIL_SERVER=            # or RESEND_API_KEY if using Resend for magic-link delivery
EMAIL_FROM=
```

---

## 8. Phased build order

Each phase should be independently demoable — don't move to the next until the
current one actually works, not just compiles.

1. **Scaffold.** Next.js + TypeScript + Tailwind + Prisma initialized, deployed to
   Vercel as a bare "hello world." Confirms the whole pipeline (repo → build → deploy)
   works before any real logic gets written.
2. **Quote CRUD.** Database schema migrated; create/save/load a quote's `formData`;
   bare-bones register list view (table of client/date/total/status).
3. **Intake form.** Port the eleven sections from the prototype, same numbering and
   order, wired to save into `formData`. This is the biggest phase — go section by
   section, matching the prototype's field-by-field behavior from spec §2.
4. **Pricing & validation logic.** Port `computeShipping`, `updateSummary`,
   `tumorTypePricingTotal`, and `validateQuote` as pure functions. These are
   self-contained enough to unit test directly against known inputs/outputs from the
   prototype's own behavior.
5. **HubSpot integration.** Deal lookup/pre-fill, live population dropdown, the
   nightly quote-code cron.
6. **Docx generation.** Both documents, verified visually against real uploaded
   quotes per the workflow in §5 — not considered done until that comparison passes.
7. **Shared/global data.** Cost log, historical comparables, rate card, quote codes
   — the tables that need to work correctly across multiple concurrent users, since
   this is the one area where "it worked in the single-user prototype" doesn't
   guarantee "it works with four people using it at once."
8. **Auth + deploy to a real URL.** Soft launch to John.
9. **Handoff.** Once John's satisfied, extend access to Heather and Josh.

---

## 9. Decisions that need a human before or during the build

Things Claude Code shouldn't decide unilaterally — flag these back to John:

- **HubSpot Private App creation.** Someone with HubSpot admin access on portal
  7423331 needs to create the Private App and generate the token — this can't be
  done from code. (Settings → Integrations → Private Apps in HubSpot.)
- **Hosting account.** Does MTG have an existing Vercel/GitHub org, or does one get
  created for this project? Affects who owns billing and access long-term.
- **Email sending for magic-link auth.** Needs a transactional email service
  (Resend, Postmark, etc.) — pick one and get an API key before Phase 8.
- **Domain.** Does this get a real subdomain (e.g. `quotes.mtgroupbio.com`) or live
  on a Vercel-provided URL? Affects DNS setup, which needs whoever manages
  mtgroupbio.com's DNS.
