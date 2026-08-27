# Intake form sections (Phase 3)

One component per numbered section of the quote intake, matching the spec's
numbering and order exactly (spec §2). Ported from the prototype section by
section:

    01-Header.tsx          06-QuoteNameSummary.tsx
    02-QuoteApproach.tsx   07-ClinicalData.tsx
    03-Cohorts.tsx         08-Reports.tsx
    04-Timepoints.tsx      09-Timeline.tsx
    05-Biospecimens.tsx    10-Pricing.tsx
                           11-ReviewGenerate.tsx

Section numbering is load-bearing: §10 pricing blocks are numbered to match the
specimen order in §05, and validation messages in §11 refer to sections by
number. Keep them in sync.
