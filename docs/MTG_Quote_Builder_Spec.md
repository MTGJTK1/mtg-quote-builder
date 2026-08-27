# MT Group Quote Builder — Build Spec

Source of truth for building the real (option 2) version. Derived from an extended
prototyping session using a Claude.ai HTML artifact. The artifact
(`mtg_quote_builder_prototype.html`) is the working reference implementation of
everything below — when in doubt about exact UI behavior, read its source.

---

## 1. Purpose

Replace the current quoting workflow (search HubSpot/OneDrive for comparable past
quotes, manually reconstruct pricing, hand-type a Word doc) with a structured intake
tool that produces two outputs per quote:

1. **Internal Draft** — full pricing math, sourcing notes, T&Cs check, for John's review.
2. **Sponsor Quote** — clean document matching MTG's real letterhead format exactly,
   sent to the sponsor after review.

Both are generated from one structured intake, section by section, matching the real
quote structure end to end.

---

## 2. Section-by-section field spec

**01 — Quote Header**
- Is this a study extension? (checkbox, top of form) → reveals: Original Study PO#,
  Original Study Quote (reference), Parent MT Number, Extension #, and a second
  checkbox "Has the study design changed?"
  - If unchecked (design unchanged): Sections 04/05/07/08/09 (below) hide entirely;
    generated output is minimal (Summary, Population and Size, Costs, T&Cs only) —
    matches real extension quotes exactly (see `QTE_NTA20260825` sample).
  - If checked: full form, all sections active.
- Sponsor Contact Name / Email (the sponsor-side requester — distinct from Prepared By)
- HubSpot Deal Name (manual paste for now; real app should pull this live)
- Client / Sponsor, Sponsor Acronym (autocomplete seeded from real HubSpot deal-title
  prefixes — see §6)
- Prepared By (rep dropdown: John Kibler, Heather Shahzade, Joshua Taylor, Karen Krantz)
- Quote / Draft Date, Validity (30/60 Day Quote)
- Service Type: Retrospective / Prospective (checkboxes, either or both)
  - If Retrospective checked → reveals "Sponsor-selected cases" free text (document
    name or case/biospecimen #s)

**02 — Quote Approach**
- Defined Subject Count (default) vs. Defined Dollar Amount (radio)
- Defined Dollar Amount reveals: PO Total, repeatable tumor/case-type rows (label +
  $/case, autocomplete from shared fresh-tissue rate card), optional matched-blood
  add-on. Subject-count estimate = conservative, based on **highest**-priced type
  (PO ÷ highest price), not an average — this is a lump-sum/unknown-mix scenario.
  Do NOT require subcohort attribution here — the whole point is the mix is unknown.

**03 — Population & Cohorts**
- Repeatable cohorts, each with: name, # subjects, "Up to N" checkbox (inline, next
  to # subjects), Population Group (dropdown — real HubSpot `population_2` values),
  Subpopulation(s) (multi-select checklist filtered by group — real HubSpot
  `sub_population` values; any option starting with "Other" reveals its own inline
  free-text detail, e.g. "Other solid tumor" → "Small intestine")
  - Population Group "Other" skips the subpop list entirely, goes straight to free text.
- Severity/Stage: multi-select, options depend on Population Group (oncology →
  Stage I-IV; everything else → Mild/Moderate/Severe) plus subpopulation-specific
  clinical gates from reference doc §5 (Hurley, PASI, EASI, mRSS, CLASI) when
  applicable. Union across all selected subpopulations. Plus a free-text "additional
  detail" field for precision the checkboxes can't capture (e.g. "Stage Ia").
- Inclusion / Exclusion criteria (free text, one per line → renders as real bullets)
- Allocation note (free text, appears only when >1 subpopulation selected — for
  sentences like "MT Group and Natera will mutually agree in writing on enrollment
  allocations per cancer type")
- Subcohorts (optional, per cohort): auto-labeled 1a/1b/1c, own # subjects + note.
  Parent cohort's # subjects becomes a **live, disabled, auto-summed** display once
  subcohorts exist — never allow manual entry that could contradict the sum.
  (We tried tying subcohorts to tumor-type-specific pricing attribution — don't;
  see §4, that need is better served by inline counts in the pricing section.)

**04 — Collection Timepoints**
- Toggle: single draw vs. multiple timepoints
- All timepoint labels are free text (no anchor/offset system — reps type dates/labels
  directly, e.g. "1st trimester, weeks 11-13"). We tried a structured anchor+offset
  system; it didn't match how reps actually think about timing — don't rebuild it.

**05 — Biospecimens**
- Repeatable specimen blocks. Type dropdown, ordered: Fresh tissue, Frozen tissue,
  FFPE block, Whole blood, Plasma, Serum, Buffy coat, PBMC, Fresh marrow, BMMC, Urine,
  Saliva, Buccal swab, Nasal swab, Nasopharyngeal swab, Stool, Other (free text).
- Storage/shipping state defaults by type (Fresh tissue → Fresh chilled 2-8°C;
  Frozen tissue/Plasma/Serum/Buffy coat/PBMC → Frozen dry ice; else Ambient),
  overridable.
- Storage media dropdown (Hypothermosol, DMSO, CS10, None, Other+freetext) — this is
  biological preservation media, distinct from shipping coolant.
- Size field: weight for tissue types, volume for liquid types, hidden for FFPE
  (has its own spec box) and swabs.
- Aliquot count/volume: liquid products only, explicitly **excluding Whole blood**
  (whole blood is the raw draw, not itself aliquoted — the *processed* derivatives are).
- Whole blood gets a "Processed to" free text field (e.g. "plasma and buffy coat, per
  Natera's instructions") instead.
- Tube type: multi-select checklist (Streck cfDNA, K2 EDTA, SST, BD P100, Sodium
  Heparin, Li Heparin, Other), applies to Plasma/Serum/Whole blood/Buffy
  coat/PBMC/Fresh marrow/BMMC. Multiple selectable (e.g. banked Streck + EDTA both).
- FFPE block gets a specs sub-box: Tumor content %, Necrosis %, Thickness by default,
  removable, "+ Add spec row" for more. Only appears when type = FFPE block.
- Processing protocol: none / free text / reference file(s) — file mode supports
  multiple file references (add/remove rows).
- When timepoints > 1: specimens grouped per timepoint, with "same as previous
  timepoint" checkbox to inherit rather than re-enter.

**06 — Quote Name & Summary**
- Both auto-draft from population + specimen entries above (won't populate until a
  Population Group + Subpopulation + at least one specimen exist — this is expected
  behavior, not a bug).
- Quote Name format: `{indication} - {specimen types}` e.g. "CRC - plasma & buffy",
  extension studies append `(MT#### extension #N)`.
- Summary auto-draft mirrors real phrasing: "The goal of this study is to
  collect/evaluate [specimens] from [population] subjects." Extension studies get:
  "This study is an extension to that quoted under '[original quote]' and ordered
  under '[original PO#].' All study design elements remain the same except as noted
  below (pricing repeated for clarity)." — pulled near-verbatim from real extension
  quotes.
- Both editable; editing either stops further auto-updating for that field.

**07 — Clinical Data**
- Data List, two columns: Required vs. If Available (checking an item in one
  auto-unchecks it in the other). Categories: Demographics, Medical history,
  Therapeutic history, Family history, Lifestyle factors (smoking, alcohol),
  Disease scoring (e.g. EASI, PASI, IHS4), Biomarkers, Other+freetext.
- Additional data detail free text (e.g. "EASI score collected on day of biopsy")
- Delivery method: Excel spreadsheet / Paper CRF / EMR entry / Other (in that order)
  + delivery detail free text
- Known gaps free text
- Outcome/follow-up data: toggle + description (separate from at-enrollment data;
  pricing for it lives in §10, description lives here)

**08 — Reports**
- Multi-select: Pathology (report OR summary — one line item with a format
  sub-select, not two separate options — matches real phrasing "de-identified path
  report or summary"), Radiology report, Biomarkers, Other
- Per selected type: timepoint(s) covered (free text), notes (free text)
- General report notes (delivery timing, optional vs. required, etc.)

**09 — Timeline & Logistics**
- Kickoff call: yes/no → reveals trigger free text if yes
- Site/study initiation, Enrollment completion, Data/specimen delivery: all **free
  text** fields (support ranges like "3-4") not rigid numbers — we tried numeric
  fields with a separate "detail" field for ranges; it was redundant, don't rebuild.
  Enrollment completion's number (parse leading digits) still drives the batching
  threshold below.
- Delivery restrictions (renamed from "cadence cap" — e.g. max/week, Tues-Fri only)
- Delivery address(es) — free text, supports multiple
- Delivery batching: only shown/relevant when a frozen specimen exists. <3 months
  enrollment → 1 batch (end of study) locked; ≥3 months → option for 2 batches
  (midpoint + end). Syncs to the shipping calculator's batch count.
- No live "composed summary" box needed here — we built one, then removed it for
  consistency since no other section has an equivalent live preview.

**10 — Pricing Engine**
- Historical Comparables: NOT live-connected to OneDrive (no access). Static seed
  of 6 real uploaded quotes + rep-added entries (client, indication, price, **date**
  — must be manually enterable, don't default to today). Filter dropdown
  auto-populates from actual specimen types in §05, not a hardcoded list.
- Per-biospecimen pricing: one block per distinct specimen type from §05, numbered
  to match §05's order. Each has: Price to Quote ($/unit), optional Site cost plus
  stipend (context only), source (who/when + "save to shared cost log" button),
  and a **Pricing notes (internal)** free text field for draft-only context like
  "already floated $1,600, sponsor pushed back" or "sponsor is price-sensitive" —
  this must NOT appear in the sponsor-facing document, internal draft only.
  - Tissue types (Fresh tissue, Frozen tissue, FFPE block) additionally offer "Price
    differs by tumor type" when >1 tumor type is selected in cohorts: inline price +
    count per type, entered directly in this section — **not** derived from
    subcohorts. This is for a fixed/known split; the unknown-mix lump-sum case is
    §02, not this.
  - Extension-minimal mode: §05 is hidden, so pricing collapses to one flat
    "Biospecimens & Data ($/subject)" field instead of the per-type table.
- Screenfail rate: $/subject, cap %, applicable cohort(s) (multi-select synced to
  §03 cohort names), free-text explanation of how it's applied, "Are screenfails
  shipped?" (Yes/No — was previously a confusingly-placed unconditional checkbox;
  must live inside the screenfail-enabled block only).
- Outcome data fee: $/subject (description lives in §07)
- Other costs: repeatable label + $ line items (startup fee, media shipping, etc.)
- Shipping: structure choice — "Lump sum for study" vs. "Per subject / specimen"
  (numbered lines matching §05's specimen order when per-specimen). Frozen batch
  calculator **only appears when a frozen specimen actually exists** — never offered
  as an option otherwise. Frozen calculator shows ops cost (sites × batches) as
  reference only; the rep enters a **direct final shipping price** — no markup
  multiplier, no auto-cap logic. (We built and then removed an auto-multiply +
  cap-with-overage-shift mechanism; it was needless complexity once pricing moved to
  per-specimen granularity.) Each line has a free-text "additional shipping detail"
  field (courier, service level, TempTale, etc.).
- Additional costs not itemized above: free text catch-all.

**11 — Review & Generate**
- Additional Notes: free text, appears on both generated documents.
- Hard validation before either "Generate" button works: checks required fields
  (client, rep, population, subject count or PO total, specimen pricing, shipping
  price, quote name/summary) and lists exactly what's missing with section
  references — never a silent failure or a vague error.
- Two buttons: Generate Internal Draft, Generate Sponsor Quote.

---

## 3. Document generation — formatting rules (critical, verified against real samples)

This is the part most likely to be gotten wrong by guessing instead of comparing.
**Always render a real sample and compare page-by-page against an actual uploaded
quote before considering formatting "done."** Rules below were derived that way.

- **Two-column layout**, not inline "Label: text": bold label in a fixed-width left
  column (~2 inches from margin), content in a right column at a consistent tab
  stop. Wrapped/continued lines in the content column stay indented at that same
  position — achieved via a hanging indent + tab stop, not manual spacing.
- **Font:** Times New Roman throughout. Main body 11pt. **Terms & Conditions
  section is 10.5pt** — deliberately smaller so it fits well, per real convention.
- **Line spacing:** single, zero extra space between lines by default. Paragraph
  spacing (~one blank line) is added *only* before a new section label — never
  applied generically. The header contact block (Requestor/Client/Date/Number)
  stacks tight with zero gap between lines; a small gap belongs above the first
  line after each horizontal rule.
- **Horizontal rules** (the two separator lines under the letterhead and after the
  header block): a paragraph bottom border, not literal underscore characters and
  not a CSS/visual approximation — real Word documents use a paragraph border for
  this, confirmed against the real PDFs.
- **Signature line** at the very end *is* literal underscore text (short, ~20
  characters) — different from the horizontal rules above.
- **Letterhead:** "The MT Group" / "7120 Hayvenhurst Ave. Suite 317" (one line) /
  "Los Angeles, CA 91406" (note: some real quotes show Van Nuys, CA — sponsor-quote
  generation should probably make this configurable rather than hardcoded, TBD).
- **Content breaks get a blank line**, not just section breaks: e.g. after a bullet
  list before the next sentence within the same section, before "Exclusions" when
  it follows "Inclusions," before a concluding line like "No additional I/E
  criteria." Rule of thumb: a visual break wherever the *content* shifts register,
  not only at section boundaries.
- **Pricing block must never split across a page break.** Biospecimen & Data Costs
  → Shipping and Handling → Total Study Costs is one visual unit; use "keep with
  next" on every paragraph in that block except the last.
- **"Total Study Costs" convention:** list each cost component as its own line,
  underline the *last* addend line, then the grand total on its own unstyled line
  below (matches real convention — the underline marks "add these up," not the
  answer itself).
- **Terms & Conditions forced onto its own page** via an explicit page break —
  never let it flow naturally from whatever content precedes it. Heading is plain
  text, left-aligned, not bold, not centered (a common wrong guess).
- **Page footer:** "Page X of Y", centered, bottom of every page (not a header, not
  top-of-page — confirmed against real PDFs).
- **Content style:** flowing sentences in real prose ("Fresh tumor tissue will be
  collected and shipped fresh at 2-8°C in Hypothermosol media, with a minimum of
  200 mg provided per specimen"), not clipped fragments strung together. Bullets
  are reserved for genuine list items (I/E criteria, cancer type lists, spec
  values) — never used as a substitute for writing full sentences elsewhere. The
  cost section is the one place short labeled lines (not sentences) are correct,
  matching real convention.
- Native `.docx` generation (via the `docx` npm library or a server-side
  equivalent) is required to hit this spec precisely — the artifact prototype's
  in-browser export currently uses an HTML-based `.doc` trick as a stopgap, which
  cannot achieve tab-stop columns, keep-with-next, or forced page breaks. Building
  real `.docx` output (client-side via a bundled JS library, or server-side) is a
  concrete, well-scoped task for the real app — proven achievable in this session
  (see `/mnt/user-data/outputs/QTE_EXB20260826_Multi-tumor_fresh_tissue_sample.docx`
  as a working reference render, verified by rendering to PDF and visually
  comparing against a real uploaded quote page-by-page).

---

## 4. Things we tried and deliberately reverted (don't rebuild without a new reason)

- **Subcohort tumor-type tagging** to attribute subject counts for per-type pricing.
  Doesn't match either real scenario (lump-sum unknown-mix, or uniform-price
  multi-type list) — removed in favor of §02 for the first case and inline
  price+count in §10 for the rare fixed-split case.
- **Structured timepoint anchor + offset system.** Reps think in free-text dates,
  not "N weeks after timepoint X." Reverted to plain free-text labels.
- **Numeric timeline fields + separate range-detail field.** Redundant — made the
  main fields free text instead, supporting ranges directly.
- **Shipping markup multiplier + auto-cap-with-overage-shift.** Overcomplicated
  once pricing became per-specimen; replaced with direct final-price entry, ops
  cost shown as reference only.
- **A live "composed summary" preview box in Timeline.** Inconsistent with every
  other section; removed.
- **Global single confirmedPrice field.** Replaced with per-specimen-type pricing,
  numbered to match §05.

---

## 5. HubSpot findings (portal 7423331) — verified live, not assumed

- Population/subpopulation **do** exist as deal fields, just not under guessable
  names: `population_2` (population group) and `sub_population` (the actual
  subpopulation value), plus per-cohort `cohort_1_indication` through
  `cohort_5_indication`. The real app should read these live rather than using the
  static seed list the prototype uses.
- No structured field exists for: indication as a standalone concept beyond the
  above, deal-level specimen type, or collection model — these are free text in
  deal names only (pattern: `"CODE: description"`, e.g. "NTA: 500 healthies - blood").
- Client-code prefixes (NTA, EXS, MRK, JNJ, BMS, RGN, GHI, and dozens more) were
  extracted from a live sample of ~200 real deal titles — a real app should query
  this dynamically/periodically rather than hardcoding, since the sample is not
  exhaustive of all ~2,833 deals.
- No live OneDrive access was available in this session — Historical Comparables
  and the quote register described in the reference doc §11 remain a build item,
  not something this prototype could wire up.

---

## 6. Recommended real-app architecture (option 2)

1. **Hosting:** a real URL, not dependent on Claude.ai sessions (e.g. Vercel).
2. **Database:** real persistent store for the quote register (§11 of the
   reference doc), replacing the prototype's `window.storage` (which is a
   Claude-artifact-specific feature, shared only with people who open that exact
   artifact link — not a real multi-user backend).
3. **Auth:** restrict to your team; map to the "routes to John for approval" workflow.
4. **HubSpot integration:** live API connection using the field names in §5, not
   a manually-refreshed static list.
5. **Document generation:** native `.docx` per §3, likely server-side.
6. **Ownership:** decide before launch who maintains it — pricing-formula changes,
   new sponsors, bug fixes, hosting costs.

**Suggested sequence:** finish beta-testing the current artifact with Josh and
Heather → once field logic is stable, build the real app (a good fit for Claude
Code against this spec, as a proper repo with version control) → soft-launch to
the same three testers before wider rollout.

---

## 7. HubSpot field audit (portal 7423331) — measured 2026-08-27

Adds to §5. Field *definitions* existing is not the same as fields being
*filled in*, so these were counted across all 2,843 deals rather than sampled.

| Field | Filled | Verdict for pre-fill |
|---|---|---|
| `population_2` | 2,821 / 2,843 (99%) | **Reliable.** Pre-fill from it. |
| `sub_population` | ~99% | **Reliable.** Semicolon-separated multi-value, e.g. `Normal;Colorectal cancer;Crohn's disease`. Split on `;`. |
| `po_number` | 558 / 2,843 (20%) | **Partly usable.** Present mainly on deals that reached an order, which is exactly the extension case. Values are inconsistent: `PO15216`, `EM1706`. |
| `mt_study_id_number` | **0 / 2,843** | **Unusable.** The property exists but has never been populated. |
| `cohort_1..5_indication` | 0 in a 12-deal sample | Defined but unused. |
| `cohort_1..5_amount` | 0 in a 12-deal sample | Defined but unused. Not previously documented — noted here in case it gets adopted. |
| `multiple_cohorts_` | 0 in a 12-deal sample | Defined but unused. |
| `quote_date` | ~25% in sample | Occasional. |
| `total_number_of_patients` | ~8% in sample | Occasional. |

**The MT number lives in the deal name, not in its field.** Real examples:

    EMC: PDAC - Fresh Tissue (MT9920)
    ELS: NSCLC - Fresh Tissue (MT9920)
    NTA: Multi-cancer - blood (MT2234 extension #2)

So extension lineage is recoverable by regex on `dealname` — `\(MT(\d+)` for the
parent study, and `extension #(\d+)` for the sequence — the same
extract-from-the-title technique §5 already uses for client-code prefixes.
Prefer the quote register itself as the source once parent quotes live in it;
treat HubSpot as the fallback for studies quoted before this tool existed.

### Umbrella MT numbers

Most MT numbers identify one sponsor's study and are unique. A small set are
**umbrella numbers for banked/inventory programs**, shared across many sponsors
— confirmed by the team, then measured across all 2,843 deal titles. 886 of
them carry an MT number; 510 distinct numbers appear.

**Spanning more than one sponsor is the signature of an umbrella**, so this set
can be derived rather than hardcoded — which matters when a new one is created.

| Number | Deals | Sponsors | Suffixed | Read |
|---|---|---|---|---|
| `MT9920` | 166 | **43** | no | Fresh tumor tissue. The big one. |
| `MT9923` | 21 | 9 | 20 / 21 | Banked programme, `MT9923-XXNNNN`. |
| `MT0893` | 17 | 9 | 17 / 17 | FFPE blocks, `MT0893-AL2603`. |
| `MT0892` | 2 | 2 | 2 / 2 | Small, same suffixed family as MT0893. |
| `MT9925` | 2 | 2 | 2 / 2 | Small, same suffixed family as MT9923. |
| `MT0424` | 11 | 2 (MRK ×10, TRB ×1) | no | **Ambiguous** — probably an MRK study with one TRB deal mislabelled, not an umbrella. Worth a human look. |
| `MT0291` | 2 | 2 (CNH, SVA) | no | **Ambiguous** — likelier a collision than an umbrella. |

The suffixed umbrellas cluster into two families, `MT089x` and `MT992x`, which
looks deliberate. `MT9920` is the outlier: umbrella-scale but unsuffixed, so it
is the only one where the number alone cannot identify an order.

Everything else behaves: **409 of 510 numbers appear exactly once**, and the 94
that repeat all stay within a single sponsor — ordinary study-plus-extension
lineage, not umbrellas.

Three deals carry a placeholder instead of a number — `(MTXNEW)` twice and
`(MT WHAT IS IT)` once. Treat an unparseable MT number as absent, not as an
error.

Two rules follow, and the first one bites:

1. **Never derive an extension number by counting the MT number.** Each sponsor
   runs its own sequence under an umbrella. MT9920 alone carries 37 distinct
   extension threads — MRK is on #6, BMS on #4, IOV on #6, ATC on #4, all under
   the same number. Counting by MT number numbers a sponsor's first extension
   after someone else's sixth. Scope the count to the parent quote, falling
   back to MT number **and** client.
2. **Never use an MT number as a lookup key.** It is a reference to display.
   Link an extension to the specific parent quote. Where a suffix is present
   the full string *is* unique, so parse `MT\d+(-[A-Z0-9]+)?` and keep it.

Coverage note: all 2,843 titles were scanned. 2,662 were machine-aggregated;
the final 243 were read directly and the 63 carrying MT numbers transcribed, so
the MT statistics cover the full set while the raw name count reads 2,662.

---

## 8. Extension path — revised 2026-08-27

Supersedes the extension behavior in §01 and §02, from rep review of the
Phase 2 mockup. The change is that an unchanged-design extension is a
*different, much shorter form*, not the full form with sections hidden.

**Order.** Original study quote comes **before** the PO number. The rep
identifies the study by its quote; the PO may not exist yet, which is also why
the PO field is optional with an explicit "blank if none issued yet" hint.

**Linking carries detail forward.** Picking the original study quote populates
client, sponsor acronym, prepared-by, sponsor contacts, specimen types, parent
MT number, and the cohorts with their quoted sizes. The extension number is
derived by counting existing extensions of the same parent MT number and adding
one. The quote register is the source for this, not HubSpot — see §7: PO number
is filled on only ~20% of deals and `mt_study_id_number` on none at all.

**"The study design has changed" defaults to CHECKED.** The rep opts *into* the
short form. Defaulting the other way makes fields vanish from under someone who
has just ticked "this is an extension", which reads as a malfunction.

**Unchecked (design unchanged) collapses the form to:**

- the extension identifiers (quote, PO, MT number, extension #)
- a read-only summary of what carried over from the parent quote
- Validity, HubSpot deal name, Quote date — the only header fields still
  genuinely per-extension
- **§03 Additional subjects**: each parent cohort listed with its already-quoted
  count, an editable "additional" box, and a computed new total, plus a total
  across all cohorts
- §06 Quote name
- §10 the repeated cost

Everything else hides — client, rep, contacts, service type, biospecimens, and
the §02/04/07/08/09/11 sections.

The additional-subjects-per-cohort table is new; §01 previously said only that
the generated output is minimal. It is the one thing an unchanged-design
extension actually changes, so it deserves to be the centre of that form rather
than something recovered from a free-text note.
