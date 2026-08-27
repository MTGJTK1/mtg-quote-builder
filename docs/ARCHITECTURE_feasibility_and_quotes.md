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
- **Umbrella MT numbers.** Spec §7 established that MT9920 covers 166 orders
  across 43 sponsors, so an MT number is not a key. A Study row gives each of
  those orders a real identity while still recording the umbrella number it sits
  under.

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

## Open questions

These change the model, so they want answering before Phase 3 starts.

1. **Does feasibility produce a sponsor-facing document**, or is it internal
   only? If it is sponsor-facing, the docx work in §3 of the spec is shared
   too, and should be built once.
2. **Can one feasibility lead to more than one quote?** (Different scenarios,
   revised scope, a second sponsor request against the same assessment.) If
   yes, the snapshot model above is required rather than merely preferable.
3. **What does feasibility capture that a quote does not?** Site counts,
   specimen availability, site responses, turnaround estimates — this is the
   part with no equivalent in the quote builder, and it is unspecified.
4. **Can a quote start from a feasibility that is still in progress**, or only
   from a completed one?

## What is not changing

The quote builder work already done stands. Phases 1 and 2 — the scaffold, the
register, quote CRUD — are document-level concerns that survive this
restructuring untouched. The mockup remains the place to shape the sections
before they are built for real.
