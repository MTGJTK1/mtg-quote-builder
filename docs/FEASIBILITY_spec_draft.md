# Feasibility builder — first-pass spec

Derived from `MTG_Feasibility_Request_Form.docx` (the current Word form, sent to
sites) plus John's description of how feasibility is actually used, 2026-08-27.
The current form is acknowledged as "not great"; this note separates what it
captures from what the process actually needs.

## The observation that shapes everything

**The current form is a request, and the answers have nowhere to live.**

Every field in the Word document is something MTG sends *out* to sites — the
study design, the deadline, the questions. What comes *back* is:

- which sites will participate
- what monthly enrollment each can manage
- what each site will charge

And that is precisely the part that feeds a quote — average site cost, expected
aggregate enrollment, and shipping cost when specimens are batched. None of it
has a home in the form. It presumably lives in email threads and someone's
memory.

So the feasibility builder is not one document. It is two halves:

    Request   the study design, sent to sites          ← the current Word form
    Responses one row per site, coming back            ← currently nowhere

The responses half is the reason to build this at all. A tool that only
reproduces the request form would be a nicer version of a Word file. A tool that
captures the responses turns feasibility into the quote's pricing input.

## The durable asset is site knowledge, not the document

John: *"we don't have to re-run feasibility on future studies that look the same
… but there is so much variation and things change with our sites over time that
we regularly rerun."*

Two things follow.

**Feasibility results age.** Site costs and enrolment rates drift. A feasibility
result carries a date, and the tool should say how old it is when offering it —
"assessed 14 months ago" is a different proposition from "assessed in March."

**The reusable unit is the site response, not the feasibility.** What makes
"we don't have to re-run this one" possible is accumulated knowledge about
sites: this site does dermatology punch biopsies, enrolls ~8/month, charges
$X per subject. Feasibilities are how that knowledge is collected; the knowledge
outlives any one of them.

That means a third entity beyond Study/Feasibility/Quote:

    Site         { id, name, country, capabilities }
    SiteResponse { id, feasibilityId, siteId, willParticipate,
                   monthlyEnrollment, perSubjectCost, notes, respondedAt }

This connects to tables the schema already has. `CostLogEntry` and
`FreshTissueRate` are the same idea — cross-quote knowledge that grows — and
site responses are where much of that knowledge would come from rather than
being typed in by hand.

**Prior-feasibility search follows naturally.** Given a new study, find earlier
feasibilities with similar population, specimen types and geography, and show
their site responses with ages attached. That is the feature that lets a rep
skip a re-run with their eyes open, and it only works if responses are captured
as data.

## Field mapping — the current form against the quote builder

| Feasibility form | Quote builder | Note |
|---|---|---|
| Sponsor | §01 Client / sponsor | shared |
| Submission date | §01 (quote date equivalent) | shared |
| **Feasibility response deadline** | — | feasibility only |
| **Additional questions for site(s)** | — | feasibility only |
| Study collection type (prospective/retrospective) | §01 Service type | shared |
| **Approved geographical site locations** | — | feasibility only, and a quote input |
| Indications / cohort descriptions / # subjects | §03 Population & cohorts | shared |
| **Treatment status** | — | belongs in §03; missing from the quote builder |
| Inclusion criteria | §03 Inclusion | shared |
| Exclusion criteria | §03 Exclusion | shared |
| Type of biospecimen w/ description | §05 Biospecimens | shared |
| FFPE specifications | §05 FFPE spec box | shared |
| Collection timepoint(s) | §04 Timepoints | shared |
| Processing requirements | §05 Processing protocol | shared |
| Shipping requirements | §05 / §09 | shared |
| Storage requirements | §05 Storage state & media | shared |
| Clinical data requirements | §07 Clinical data | shared |
| Clinical report requirements | §08 Reports | shared |
| Clinical data format | §07 Delivery method | shared |
| Additional notes | §11 | shared |

Confirms the architecture note: the overlap is nearly total, and it runs in the
direction expected — feasibility captures study design, the quote adds approach
and pricing.

**Three fields the quote builder is missing** and should gain, since they are
study design rather than feasibility mechanics:

- **Approved geographical site locations** — drives site selection and shipping,
  and belongs on the quote too.
- **Treatment status** (treatment-naive, on-treatment, post-treatment…) — a
  real cohort attribute, currently absent from §03.
- **Additional questions for sites** — arguably feasibility-only, but worth
  confirming.

## Answers recorded, 2026-08-27

- **Sponsor-facing?** No — internal only. *But note:* the request form is sent
  to **sites**, so there is still a document to generate, just without the
  sponsor letterhead treatment from spec §3. Worth confirming whether sites
  receive a generated document or something lighter.
- **One feasibility → many quotes?** Yes, in effect — feasibility results are
  reused across similar future studies. Snapshot-on-copy is therefore required,
  not merely preferred.
- **Quote without feasibility?** Yes. A quote can be completed without
  feasibility ever starting or finishing. Feasibility must never be a
  precondition; it is an input when present.
- **Quote from an in-progress feasibility?** Implied yes, given reps "cut
  corners" on well-known designs. The link should carry the feasibility's state
  so a quote drawing on an incomplete assessment says so.

## Still open

1. Does the site request go out as a generated document, or as something else
   (email body, form link)? Changes whether docx work is needed here at all.
2. Is there a site list to seed from, or does it accumulate from use?
3. What does "treatment status" offer as options?
4. Does a feasibility belong to one sponsor's study, or can it be run
   speculatively against a design with no sponsor attached?
