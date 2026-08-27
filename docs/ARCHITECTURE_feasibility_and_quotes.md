# Two documents, one study design

Raised by John, 2026-08-27: a feasibility builder is coming, it runs *before*
the quote for many studies, and its fields feed the quote. Most of the quote
builder's study design would also appear in feasibility — everything except
pricing.

This note records what that implies, because the implication is bigger than
"another form later."

## The load-bearing observation

Sort the eleven sections by who owns them:

| Section | Feasibility | Quote |
|---|---|---|
| 01 Header — sponsor, contacts, dates | ✓ | ✓ |
| 02 Quote approach — subject count vs. dollar amount | | ✓ |
| 03 Population & cohorts | ✓ | ✓ |
| 04 Collection timepoints | ✓ | ✓ |
| 05 Biospecimens | ✓ | ✓ |
| 06 Summary & name | ✓ | ✓ |
| 07 Clinical data | ✓ | ✓ |
| 08 Reports | ✓ | ✓ |
| 09 Timeline & logistics | ✓ | ✓ |
| 10 Pricing | | ✓ |
| 11 Additional details | ✓ | ✓ |

Nine of eleven sections are shared. **The study design is not a part of the
quote. The quote is one of two documents that reference a study design.** So is
feasibility.

Building the quote builder first and bolting feasibility on afterwards means
building those nine sections twice, or retrofitting them out of the quote once
they are finished — exactly the rework we have been avoiding by shaping the form
in a mockup first.

## What follows

**1. Study design becomes its own record, not a field inside a quote.**

Current shape — everything nested in the quote:

    Quote { ..., formData: { header, cohorts, specimens, pricing, ... } }

Proposed — a study the documents hang off:

    Study      { id, mtNumber, client, sponsorAcronym, design: Json }
    Feasibility{ id, studyId, ..., findings: Json }
    Quote      { id, studyId, ..., pricing: Json, designSnapshot: Json }

`Study.design` holds sections 01 and 03–09. `Quote` keeps 02 and 10.

**2. A Study entity was already earning its place.**

This is not speculative normalisation (build brief §2 warns against that). Two
things already built want it:

- **Extension lineage.** Extensions currently link quote → quote. What they
  actually mean is "another quote against the same study." A Study row makes
  that direct, and makes "show me everything under MT2291" a query rather than
  a scan.
- **Umbrella MT numbers.** The MT number *is* the study key — `MT9920` is the
  sole exception, covering 166 orders across 43 sponsors (spec §7). A Study row
  makes that exception cheap: each of those orders gets its own identity while
  still recording the umbrella number it sits under, instead of the key rule
  having to bend everywhere it is used.

**3. Copy forward, don't live-link.**

When a quote is created from a feasibility, it should take a **snapshot** of the
design, not a live reference. A sponsor negotiates scope down after feasibility;
the feasibility record should keep saying what was assessed, and the quote should
keep saying what was quoted. Both stay true.

This is the same shape as the extension flow already built — carry values
forward from a prior document, then let them diverge — so the pattern is proven
rather than invented. Store provenance (`fromFeasibilityId`, `copiedAt`) so a
rep can see where a value came from and re-pull if they want to.

**4. The form sections should be built as shared components from the start.**

`components/sections/` should hold study-design sections that both documents
render, not quote-specific ones. That costs nothing now — none of them are
built yet — and saves rewriting nine sections later.

## Recommended build order

Revises build brief §8. The change is that **Phase 3 stops being "the quote
intake form" and becomes "the shared study-design sections."**

| | Was | Now |
|---|---|---|
| 3 | Quote intake form, all 11 sections | **Shared study-design sections** (01, 03–09) as reusable components |
| 4 | Pricing & validation | **Feasibility builder** — study design + feasibility findings. Proves the shared sections against a simpler document, with no pricing to get wrong. |
| 5 | HubSpot | **Quote builder** — the same sections plus §02 approach and §10 pricing, seeded from a feasibility when one exists |
| 6 | Docx | Pricing & validation logic |
| 7+ | | HubSpot, docx generation, shared data, auth — unchanged |

Feasibility going first is deliberate: it is the simpler document, it comes
first in the real business process, and it exercises the shared sections before
pricing complexity lands on top of them. It is not a detour — it is the same
work, ordered so that nothing gets built twice.

## Answered, 2026-08-27

The real form is now in `docs/MTG_Feasibility_Request_Form.docx` and mapped
field by field in `docs/FEASIBILITY_spec_draft.md`. Summary:

- **Internal only**, so the sponsor-facing docx work in spec §3 is not shared.
  The request form does go out to **sites** though, so there may still be a
  document to generate — just without the letterhead treatment.
- **One feasibility informs many studies.** Results are reused on later studies
  that look the same. Snapshot-on-copy is therefore required, not optional.
- **A quote never depends on feasibility.** It can be completed without one
  ever starting or finishing. Feasibility is an input when present, never a
  precondition.
- **Feasibility captures site-level data** — which sites will participate,
  monthly enrolment, site costs — which roll up into average site cost,
  expected aggregate enrolment, and batched shipping cost.

## The two findings that change the model

**1. The current form is only half the process.** Every field in it is
something sent *out* to sites. The answers coming back — participation,
enrolment, cost — have nowhere to live, and those answers are exactly what
feeds a quote. So a feasibility is two halves:

    Request    the study design, sent to sites      ← the existing Word form
    Responses  one row per site, coming back        ← currently nowhere

Building only the request half would produce a nicer Word file. The responses
half is what turns feasibility into the quote's pricing input.

**2. The durable asset is site knowledge, not the document.** Reuse works
because knowledge about sites accumulates — this site does this kind of
collection, enrols at this rate, charges this much. Feasibilities collect it;
it outlives them, and it ages. So the model needs sites and site responses as
first-class records, and anything offered for reuse should carry its age:

    Site         { id, name, country, capabilities }
    SiteResponse { id, feasibilityId, siteId, willParticipate,
                   monthlyEnrollment, perSubjectCost, notes, respondedAt }

This is the same idea as the `CostLogEntry` and `FreshTissueRate` tables the
schema already has — cross-quote knowledge that grows — except site responses
would populate much of it as a by-product rather than by hand.

## Still open

1. Does the site request go out as a generated document, or as an email or
   form link? Decides whether docx work is needed for feasibility at all.
2. Is there an existing site list to seed from, or does it accumulate?
3. What are the options for "treatment status"?
4. Can a feasibility be run speculatively against a design with no sponsor?

## What is not changing

The quote builder work already done stands. Phases 1 and 2 — the scaffold, the
register, quote CRUD — are document-level concerns that survive this
restructuring untouched. The mockup remains the place to shape the sections
before they are built for real.
