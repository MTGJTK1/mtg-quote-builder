# Feasibility builder — first-pass spec

Derived from `MTG_Feasibility_Request_Form.docx` (the current Word form, sent to
sites) plus John's description of how feasibility is actually used, 2026-08-27.
The current form is acknowledged as "not great"; this note separates what it
captures from what the process actually needs.

## What this tool is for

Ops already sends the request to sites as a fillable form, and the responses
flow back into HubSpot. The responses are not missing and this tool does not
need to capture them.

**The problem is the front of the process, not the back.** The Word form is what
a sales rep fills in, and it is hard to complete well.

Note what the failure is *not*. Blank fields are mostly correct — those elements
genuinely do not apply to that study. The failure is narrower and worse:

> Sales omits something critical because it did not occur to them it mattered.

John's example: a specific plasma processing protocol that many sites cannot
perform. Nobody withheld it. The rep did not know it was the kind of thing that
decides whether a site can participate, so it never got written down — and the
feasibility went out wrong.

So the feasibility builder's job:

> A form a sales rep finds easy to complete, that makes them **consider** every
> element that could invalidate a feasibility — and lets them dismiss the ones
> that do not apply.

The prompting is the product. A prettier version of the same boxes would not
fix anything.

## The design move: dismissal must be explicit

Today a blank field is ambiguous. It means either:

- "I considered processing requirements; this study has none", or
- "I never looked at that field."

Ops cannot tell those apart, and neither can the rep reviewing their own work.
The first is complete information. The second is the failure mode above.

**So make dismissal an action, not an absence.** Each element gets a considered
state:

    ( ) Not applicable        ← an answer, and a record that it was considered
    ( ) Details: ___________  ← an answer

Nothing is *required* in the sense of blocking — that would push reps to type
"n/a" to get past it, which is the same blank wearing a disguise. But an
un-touched element is visibly un-touched, and the form can say so before
submission: "3 elements not yet considered."

This is what turns the form from a container into a checklist, and it is the
one mechanism that addresses the actual failure.

### Each prompt must carry why it matters

"Processing requirements" as a bare label does not prompt anyone. The rep who
omitted the plasma protocol would omit it again.

What catches it is the question naming its own consequence:

> **Processing requirements** — e.g. double-spin plasma, specific centrifuge
> speeds, on-site aliquoting. *Non-standard processing is one of the most
> common reasons a site declines.*

Every element carries a short line like this. Writing them is most of the
design work in this tool, and it wants ops's input rather than guesswork —
they know which omissions have actually cost a re-run.

### Weight the elements by risk

If ops can name the handful of omissions that most often invalidate a
feasibility, those get the strongest treatment — surfaced first, prompted
hardest, flagged loudest when untouched. The rest can stay quiet. A form that
shouts equally about everything trains people to ignore it.

## Where the site responses fit

Responses landing in HubSpot is what makes "feasibility results feed the quote"
technically possible: the quote builder reads them back rather than the rep
re-keying them. Average site cost, expected aggregate enrolment and batched
shipping cost all derive from that data.

**Unverified:** whether those response fields exist as HubSpot deal properties,
or live somewhere else in the portal. Spec §7 measured the deal properties for
study design and found the population fields reliable; the site-response fields
were not part of that audit. Worth measuring before Phase 5 assumes they are
readable.

## Feasibility results age

John: *"we don't have to re-run feasibility on future studies that look the same
… but there is so much variation and things change with our sites over time that
we regularly rerun."*

Anything offered for reuse should carry its age — "assessed 14 months ago" is a
different proposition from "assessed in March". That applies whether the data is
read from HubSpot or held here.

## Field mapping — the current form against the quote builder

| Feasibility form | Quote builder | Note |
|---|---|---|
| Sponsor | §01 Client / sponsor | shared |
| Submission date | §01 (quote date equivalent) | shared |
| **Feasibility response deadline** | — | feasibility only |
| **Additional questions for site(s)** | — | feasibility only |
| Study collection type (prospective/retrospective) | §01 Service type | shared |
| **Approved geographical site locations** | — | feasibility only — in a quote this lives inside the inclusion criteria |
| Indications / cohort descriptions / # subjects | §03 Population & cohorts | shared |
| **Treatment status** | — | belongs in the inclusion criteria, not its own field — see below |
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

### The quote builder needs none of these three

An earlier draft of this note proposed adding geography, treatment status and
site questions to the quote builder. All three are wrong:

- **Geography** already lives in the inclusion criteria — "where we are
  collecting" is an inclusion, not a separate field.
- **Treatment status** likewise. And the feasibility form's naive/treated
  dropdown is the weak part of that form, not a model to copy: the real
  population is defined by *which* therapies are excluded, washout periods, and
  similar detail that no dropdown holds.
- **Additional questions for sites** is feasibility-only, and deliberately free
  text — the point is asking things nothing else captures, like "do you treat
  subjects with X therapeutic."

### Do not structure the inclusion/exclusion criteria

This is the load-bearing conclusion. I/E criteria carry geography, treatment
history, washout periods, disease severity and one-off requirements — and reps
write them as prose because that is what the sponsor sends and what a site
needs to read.

Every attempt to lift a piece out into its own field (a geography picker, a
treatment-status dropdown) produces a field that captures a fraction of the
truth while implying it captured all of it. The feasibility form's treatment
status is exactly that failure, and John names it as why the form is weak.

Same lesson as spec §4's reverted approaches: structure that does not match how
reps actually think makes the form worse, not better. Keep I/E as free text,
one criterion per line, rendering as real bullets.

## Answers recorded, 2026-08-27

- **Sponsor-facing?** No — internal only. Ops sends the request to sites as a
  fillable form of their own, so this tool generates no site-facing document.
  Its output is a complete, correct request handed to ops.
- **Where do responses go?** Back into HubSpot, through the ops fillable form.
  Not this tool's job to capture.
- **One feasibility → many quotes?** Yes, in effect — results are reused on
  later studies that look the same. Snapshot-on-copy therefore required.
- **Quote without feasibility?** Yes. A quote can be completed without
  feasibility ever starting or finishing. Never a precondition.
- **Quote from an in-progress feasibility?** Implied yes, given reps "cut
  corners" on well-known designs. The link should carry the feasibility's state
  so a quote drawing on an incomplete assessment says so.

## Still open

1. **Do the site-response fields exist as HubSpot properties?** Site
   participation, monthly enrolment and site cost were not part of the spec §7
   audit. This decides whether the quote builder can read feasibility results
   or the rep re-keys them.
2. **Which omissions have actually cost a re-run?** Not "which fields are
   blank" — blanks are usually correct. The list worth having is the study
   elements that, when missed, invalidated a feasibility: the plasma protocol
   case and its siblings. That list decides which prompts get written, how
   hard, and in what order. Ops holds it; it is not written down anywhere.
3. Can a feasibility be run speculatively against a design with no sponsor?
