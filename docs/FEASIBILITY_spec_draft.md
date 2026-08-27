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

## The prompt catalogue

Eight omissions named by John, 2026-08-27, that have gone out wrong. This is the
seed list the form is built around. **Most are prompts attached to sections that
already exist, not new fields** — consistent with not structuring the I/E
criteria.

### 1. Processing protocol

> **Processing requirements** — double-spin plasma, specific centrifuge speeds,
> on-site aliquoting, time-to-process limits.
> *Non-standard processing is a common reason a site declines.*

Lives in §05. Missed → sites accept, then cannot perform the protocol.

### 2. A lab value used as an inclusion

> If a lab result gates enrolment: **which assay**, and **how recent must the
> result be** to still count?
> *A site with the right patients may run a different assay, or only hold
> results older than your window.*

Lives in the inclusion criteria. Missed → sites over-report eligible patients
against a test you will not accept.

### 3. Which therapies are excluded, and any washout

> Name the excluded therapies individually, and say whether any become
> acceptable after a washout period — and how long.
> *"Treatment-naive" over-excludes; sites screen out patients you would have
> taken.*

Lives in the exclusion criteria. This is the detail the old form's
naive/treated dropdown destroys.

### 4. Which days fresh cases can be received

> Can the sponsor receive fresh collections **every day of the week, including
> Saturday and Sunday?**
> *Fresh collection is surgery-driven and surgery does not stop for weekends.
> A weekday-only receiver silently discards a share of eligible cases.*

Lives in §09. Related to the existing delivery-restrictions field but distinct:
this is about the receiving end, and it changes the enrolment estimate, not just
logistics.

### 5. Maximum subjects deliverable per day

> Is there a cap on how many subjects can be delivered in a single day?
> *A site enrolling in bursts will exceed a downstream processing limit nobody
> stated.*

Lives in §09, alongside the existing cadence cap.

### 6. Clinical data format or EDC

> Must data be entered in a specific format, or into the sponsor's EDC?
> *EDC entry is real site burden. Some sites decline outright; others need it
> priced.*

Lives in §07, which has a delivery-method field — the EDC case needs naming
explicitly rather than hiding under "Other".

### 7. Timeframe blackouts

> Any period when subjects cannot be accepted — a closed month, a holiday
> shutdown, an instrument down for service?
> *An unstated blackout makes every enrolment projection wrong.*

Lives in §09. New; the spec has no equivalent.

### 8. Is the design possible under standard of care?

The different one. Not a missing field — a check on whether the study can exist.

> **At the moment of collection, will the site actually know this about the
> subject?**

John's example: you cannot enrol treatment-naive **stage II** CRC subjects into a
blood study, because staging happens at surgery. At diagnosis — the only moment
a treatment-naive subject exists — nobody is staged yet. The design asks for a
subject who cannot be identified at the time you need them.

This class of error survives every other check: each criterion is individually
reasonable, and only their combination is impossible. It is also the most
expensive to miss, because feasibility goes out and burns site goodwill proving
something unenrollable.

**#2 and #8 share a root** — does the information exist at the moment it is
needed? A lab value nobody has yet, and a stage nobody has assigned yet, are the
same failure. That makes the timing question worth asking once, prominently,
over the whole population definition rather than field by field:

> Walk through the moment of collection. Does the site know each of these
> things about the subject *at that point* — not eventually, but then?

### Where this list needs to go next

Eight is a seed, not a catalogue. It came from one person's recall. Ops holds
more, and the ones they can name from recent re-runs are the ones worth adding
first. Each entry needs the same three parts: the question, the consequence, and
the section it attaches to.

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
2. **More entries for the prompt catalogue.** Eight are recorded above from
   John's recall. Ops will hold others — particularly from recent re-runs.
   Each wants the question, the consequence, and the section it attaches to.
3. **Should the standard-of-care check (#8) be a step of its own?** It is not a
   field, and burying it among field prompts may waste it. A single review
   step — "walk through the moment of collection" — before submission might
   serve better than a prompt attached to §03.
4. Can a feasibility be run speculatively against a design with no sponsor?
