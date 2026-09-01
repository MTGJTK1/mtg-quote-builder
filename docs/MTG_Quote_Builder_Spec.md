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
- **Letterhead:** "The MT Group" / "7120 Hayvenhurst Avenue, Suite 317" /
  **"Los Angeles, CA 91406"**. Settled by John, 2026-08-28: four of the five real
  quotes read Van Nuys and one reads Los Angeles — same street, and Van Nuys is
  in Los Angeles, but Los Angeles is the one to print. Not configurable; one
  address, used everywhere.
- **Terms & Conditions are boilerplate**, not quote data. All five real quotes
  carry them word for word: IRB & HIPAA, Research Use, Deliveries, Applicable
  Laws, Quality Guarantee, Publications, Unknown Elements, Taxes ("There are
  none."), "Issue Purchase Orders to: THE MT GROUP, INC.", the preparer line, and
  "Payment terms are net 30 days. Invoices will be submitted the month after
  biospecimen deliveries." The generator emits them; the form must never ask.
  Deal-specific commitments are a different thing and live in §12.
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
- **After *each cohort's* inclusion / exclusion criteria, print "No additional
  inclusions or exclusions." on its own line, underlined.** It closes that
  cohort's criteria so a site cannot read an omission as an unstated allowance.
  Added 2026-08-28 on rep review; corrected the same day against
  `QTE NTA20260730`, which prints it after each cohort rather than once at the
  end, and words it "additional" rather than "other".
- **Shipping is stated per specimen type, never asked for on the form.** The
  form collects no storage state and no shipping temperature; the document says
  the following, fixed (`SPECIMEN_SPEC.says` in the mockup holds the same
  strings):

  | Specimen | The quote says |
  |---|---|
  | FFPE, slides, buccal swab | Shipped ambient. |
  | Fresh tissue, synovial tissue, fresh bone marrow | Shipped at 2-8 °C. |
  | Whole blood | Shipped ambient on gel packs. |
  | Flash frozen and frozen tissue, plasma, serum, buffy coat, urine, stool, saliva, nasal swab, synovial fluid, frozen marrow | Shipped on dry ice. |
  | PBMCs, BMMCs | Shipped in an LN2 dry shipper. |

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

### The rule, after review

Confirmed by the team: **the MT number is a key — `MT9920` is the exception.**

That reconciles with the measurements above once suffixes are counted as part
of the number. `MT0893-AL2603` and `MT9923-XXNNNN` are unique strings; it is
only the bare family number that repeats. `MT9920` is the sole umbrella that
carries no suffix, so it is the only value that cannot identify one study.

    Key            = MT number including any suffix
    Sole exception = a bare MT9920

`MT0424` (10 MRK, 1 TRB) and `MT0291` (CNH, SVA) are therefore data-entry slips
rather than umbrellas, and worth correcting in HubSpot.

So:

1. **Treat the full MT reference as the key, and special-case MT9920.** Under
   MT9920, disambiguate by sponsor — and where that is still not enough, by PO
   number.
2. **Never derive an extension number by counting the MT number.** Each sponsor
   runs its own sequence under an umbrella. MT9920 alone carries 37 distinct
   extension threads — MRK on #6, BMS on #4, IOV on #6, ATC on #4, all under the
   same number. Counting by MT number numbers a sponsor's first extension after
   someone else's sixth. Scope the count to the study, falling back to MT number
   **and** client.

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

---

## 9. Form revisions — rep review, 2026-08-27 (second pass)

Supersedes parts of §01, §05, §06 and §10.

### Section order

Quote name moves to the **end**, after pricing, because it drafts itself from
everything above it. Study summary sits with it, and a free-text notes section
closes the form:

    01 Quote header → 03 Population & cohorts → 05 Biospecimens →
    10 Pricing → 06 Study summary & quote name → 11 Additional quote details

### §05 Biospecimens — three columns, revised list

Replaces the single ordered dropdown. **The §10 pricing blocks numbered to match
§05's order must follow this grouping.**

| Tissue | Blood products | Everything else |
|---|---|---|
| Fresh tissue | Whole blood | Fresh bone marrow aspirate |
| Flash frozen tissue | Plasma | Frozen bone marrow aspirate |
| Frozen tissue in media | Serum | BMMCs |
| FFPE | Buffy coat | Urine |
| Slides | PBMCs | Saliva |
| | | Buccal swab |
| | | Nasal swab |
| | | Stool |
| | | Synovial fluid |
| | | Synovial tissue |
| | | Other |

Changes from the old list: "Frozen tissue" splits into flash-frozen and
frozen-in-media; "FFPE block" becomes "FFPE"; Slides, Synovial fluid and
Synovial tissue are new; "Fresh marrow"/"BMMC" become "Fresh/Frozen bone marrow
aspirate" and "BMMCs". **"Nasopharyngeal swab" was dropped** — deliberate per
the rep, but flagged here because the COVID-era deals use NP swabs heavily.

### Auto-fill

- **Sponsor acronym** fills from the sponsor name, and stops auto-filling once
  the rep types over it — a new sponsor may not have an acronym assigned yet.
- **Sponsor contact email** fills from the contact name via HubSpot, same
  override rule. Needs `crm.objects.contacts.read` added to the Private App
  scope, which build brief §4 left out until a phase required it.
- **Quote name and study summary** draft from the cohorts and specimens, and
  each stops rewriting itself once edited (§06's existing rule). A "redraft
  both" control re-enables it deliberately.

### Extension path

- **Original study quote is free text**, not a picker. It is ultimately
  cross-referenced against OneDrive; nothing in this tool should assume the
  parent quote already lives in the register.
- **The PO number and/or parent MT number drive the lookup** that populates the
  study design. Order of preference: the quote register, then OneDrive for
  pre-tool studies, then HubSpot. §7's measurements constrain this — `po_number`
  is filled on ~20% of deals, `mt_study_id_number` on none, and an MT number
  under an umbrella matches several studies. So: a PO match wins; a bare MT
  match only counts when unique; ambiguity says so and asks for the PO rather
  than guessing.
- **Cohorts always show**, whether or not the design changed. The lookup fills
  them when it can; the rep types them in when it cannot. Rows are addable and
  removable in both modes — never a dead end when the lookup misses.
- **Pricing flows from the cohorts**: additional subjects × the per-subject
  "Biospecimens & data" rate, carried over from the parent quote, giving the
  total. This is §10's extension-minimal mode made computed rather than typed.
- **Study summary appears in the extension path**, auto-drafted in the real
  extension phrasing from §06 and overwritable.

### Implementation note

The lookup must not re-render the fields it reads from. An earlier build
rebuilt the whole extension block on blur, which destroyed the input mid-typing
and left stale results on screen. Update values in place and swap only the
result banner.


---

## 10. Gaps found via the feasibility review, 2026-08-27

Working through what reps omit from a feasibility surfaced three study-design
elements the quote builder has no home for either. Full reasoning in
`docs/FEASIBILITY_spec_draft.md`; recorded here so §09 gains them.

- **Which days fresh cases can be received**, weekends included. §09 has
  delivery restrictions, but that is the shipping end. This is the receiving
  end, and it changes the enrolment estimate rather than the logistics: fresh
  collection is surgery-driven, and surgery does not stop for weekends.
- **Timeframe blackouts** — periods when subjects cannot be accepted at all
  (a closed month, a holiday shutdown, an instrument out for service). No
  equivalent exists today, and an unstated blackout makes every enrolment
  projection wrong.
- **EDC as a named data-delivery method.** §07 lists Excel / Paper CRF / EMR
  entry / Other. Sponsor EDC entry hides under "Other" and it should not — it
  is real site burden that gets priced, and some sites decline over it.

The remaining feasibility prompts (processing protocol, lab-value assay and
recency, therapy exclusions and washout, per-day delivery cap) map onto fields
the quote builder already has. They need better prompting, not new fields.

---

## 11. Extension revisions — rep review, 2026-08-27 (third pass)

- **The quote number is editable.** It builds itself from acronym, date and
  name, but a typed value sticks and stops following the fields. A "back to
  automatic" control restores the link. Same rule as quote name and summary.
- **The original-study-quote text is itself a lookup key.** Typing or pasting
  the reference fills the study in — the register first, then the standing
  index, then the sponsor acronym embedded in the number (`QTE NTA20260826…`)
  when nothing matches exactly. OneDrive becomes the real source. The PO and MT
  fields still work; the reference is simply tried first, being what the rep
  actually has to hand.
- **Cohorts carry over from the original quote** on any of those matches.
- **The extension cohort table shows the cohort and the additional subjects,
  nothing else.** The "already quoted" and "new total" columns were removed —
  three numbers per row read as confusing rather than informative. Only the
  total of additional subjects remains, because pricing derives from it.
- **Reps type the cohort description, not "Cohort 1".** The tool owns the
  numbering, so a typed `Cohort 1 - CRC` renders as "Cohort 1: Cohort 1 - CRC".
  A leading `Cohort N` is stripped on entry.

### §10 built properly, for both modes

Pricing was a single total; it is now the engine spec §2 describes, and the
extension path gets the same options as a full quote rather than a stripped one.

- **Extension:** one price for every cohort, or a price per cohort with its own
  subtotal. Per-cohort is the default, since cohorts rarely cost the same.
- **Full quote:** one block per specimen type, numbered `05.n` to match §05's
  order, each with price to quote, site cost as reference only, source, and
  internal pricing notes that never reach the sponsor document.
- **Screenfails:** rate, cap, applicable cohorts, explanation — and "are
  screenfails shipped?" inside that block only, never floating unconditionally.
- **Outcome data fee** appears only when §07 turns outcome data on.
- **Other costs:** repeatable label and amount.
- **Shipping:** lump sum or per line, with the frozen batch calculator appearing
  only when a frozen specimen exists. The calculator shows sites × batches as
  reference; the rep enters the price being quoted. No markup multiplier and no
  auto-cap — spec §4 records that as built and reverted.
- A running total lists every component and sums them, matching the "list each
  addend, then the grand total" convention in §3.

---

## 12. Fourth-pass revisions, 2026-08-27

**The quote name *is* the quote number.** There is only one. The separate quote
number is removed, and the name moves to the very end of the form — after §11 —
since it drafts itself from everything above it. §06 keeps the study summary
alone.

**Inclusion and exclusion criteria are per cohort, not per study.** A cancer
cohort and its healthy controls do not share criteria. This supersedes §03,
which listed them at section level.

**Extensions inherit their population.** Population group, subpopulation and
severity no longer appear per cohort in an extension — the parent study already
established them, and re-asking is work the rep should not repeat.

**The lookup runs while typing**, roughly 400ms after the rep stops, rather than
waiting for focus to leave the field. Waiting for blur meant someone who filled
in the quote reference, PO and MT and then stopped saw nothing happen at all.
Matching also widened: the register is consulted before the standing index, a
unique partial match on the quote reference counts, and an MT number alone
resolves against the register.

**Reps type the cohort description only** — the field is labelled "Cohort
description" and says so. The tool owns the numbering.

**Biospecimen columns lost their headings.** Tissue / blood products / other was
grouping for brevity, not information the rep needed.

### §10 shipping — real rates and real arithmetic

Replaces the lump-sum / per-line structure. Rates as of 2026-08:

| | |
|---|---|
| Frozen US shipment | **$300** |
| Frozen international shipment | **$2,000–4,000** (default $3,000) |
| Charged to the sponsor | **2× MTG cost** |

Two legs, both counted: sites to MTG, then MTG to the sponsor. The rep enters
how many inbound US shipments, how many inbound international, and how many
batches go out; a checkbox marks an international sponsor so the outbound leg
uses the right rate. Rates and the multiplier are adjustable behind a toggle so
the common case needs no attention.

Every line of the arithmetic shows, ending in cost and then the doubled price.

**The override matters as much as the calculator.** Where shipping is too
expensive to show, reps bury it in the per-specimen figure — so an override
field sits beside the result, and entering 0 there quotes zero shipping while
the specimen prices carry it.

Note this partially reverses §4's "shipping markup multiplier" entry. What was
reverted was an auto-multiply with a cap and overage-shifting; this is a visible
2× that always shows its working and can be overridden outright. Asked for
directly, 2026-08-27.

### Streamlining — done, and still open

Done: the quote number is gone, specimen column headings are gone, extensions
no longer re-ask for population, the stale "partial" note on §10 is gone now
that pricing is real, and the lookup fills more from less.

Also removed, on request:

- **"Prepared by" is no longer a field.** It is the signed-in rep, recorded
  without being asked, and still shown in the register as the audit trail
  build brief §6 wants. An extension deliberately does *not* inherit the
  original study's author — whoever writes this quote is writing it now.
  Until auth exists the mockup stands a session user in.
- **§07 "known gaps" is gone.** Too close to "additional data detail" for a rep
  to know which to use.

Still a candidate, not yet acted on:

- **§09 "maximum subjects per day" overlaps "delivery restrictions"**, which
  already takes "max 10/week, Tues-Fri only". Two fields for one idea, and the
  per-day cap was asked for explicitly, so it stays until someone decides.

---

## §13 — Fifth-pass revisions (2026-08-27, §05 build-out)

Made while John reviewed the MT number extraction. Nothing here was asked for
directly; it is the work the mockup had left.

### §05 stops being a checkbox list

§05 previously collected only *which* specimens, and carried a "Partial" marker
for storage state, media, tube type, volumes and FFPE specs. Those now exist.

Ticking a specimen opens a block for it holding: amount per subject, aliquots
per subject, container or tube, storage state, shipping temperature, and — where
it is a real decision — processing requirements. FFPE adds block age limit,
minimum tumour content and an H&E checkbox; slides add section thickness and
stain.

**Every block arrives prefilled** from `SPECIMEN_SPEC`, which records what MT
Group normally collects for that specimen type — plasma comes up as a spun EDTA
(K2) tube at −80 °C shipped on dry ice, FFPE as a paraffin block at ambient.
The rep confirms rather than types, and only a sponsor asking for something
unusual should cause an edit. This is the "auto collect as much as possible"
instruction applied to a section that previously collected almost nothing.

The amount field relabels itself per specimen — *Blocks per subject* for FFPE,
*Volume per subject* for plasma, *Cells per subject* for PBMCs — rather than
asking for a generic quantity the rep has to interpret.

### Processing requirements reach §06

A non-standard processing protocol is the single most common reason a site
declines (`FEASIBILITY_spec_draft.md`, prompt #1). Entering one now appends a
sentence to the drafted study summary — *"Processing is not standard: plasma
requires double-spin within 2 hours of draw…"* — rather than leaving it in §05
for someone downstream to notice.

### Specimen order is now shared, not coincidental

Spec §10 requires pricing blocks to be numbered to match the specimen order in
§05. They did not: §10 iterated `draft.specimenTypes`, which is the order the
rep happened to tick the boxes. The comment above it claimed "in §05 order".

`orderedSpecimens(d)` is now the single source of that order — the canonical
`ALL_SPECIMENS` sequence, filtered to what is selected — and §05, §10, the cost
breakdown, the drafted quote name and the drafted summary all read it. Ticking
specimens in any order cannot make the two sections disagree.

### Smaller

- **§09 lost "Delivery restrictions."** Its own example text (*"max 10/week,
  Tues-Fri only"*) asked for exactly what the two prompts below it already ask.
  The specific prompts name the consequence of getting it wrong; the catch-all
  did not.
- **The register column "Prepared by" is now "Rep."** The phrase was removed
  from the form on John's instruction; the column survives because it is derived
  from the signed-in user and costs the rep nothing, but it should not carry the
  name of a field that no longer exists.
- **"Partial" markers are gone.** No section of the form is unbuilt now, so the
  remaining notes are empty states ("tick the specimens above and each gets a
  block here"), and are styled as such.

### §13.1 — The extension rate was never actually carried

Traced from John's report that "things aren't autopopulating yet in the study
extension format". The lookup itself worked — sponsor, contacts, deal name,
specimens and cohorts all arrived from an MT number, a quote reference or a PO.
The **price** did not, in either pricing mode, while the field's own hint said
"Carried over from the original quote when the lookup finds it."

Cause: `applyParentQuote` read `header.perSubject` off the parent. Only an
extension holds that field. A **full** quote prices each specimen separately and
has no single per-subject figure, so every extension of a full quote — which is
most of them — carried an empty price.

`parentPerSubject(q)` now returns the flat figure when the parent is itself an
extension, and otherwise sums the parent's per-specimen prices. It deliberately
does **not** fall back to `totalCost ÷ subjects`: that total carries shipping and
other costs, which must not end up inside a per-subject specimen rate.

Per-cohort pricing also starts at the carried rate rather than blank, with the
figure named underneath, so the rep overrides the cohorts that differ instead of
typing all of them.

The demo data hid this — the seeded parent quote had no pricing at all. It now
carries the per-specimen prices it would really hold ($400 whole blood, $525
plasma, $300 buffy coat), which reconcile to the $612,500 total already on it.

Also: carried cohorts arrived with a literal `0` in *additional subjects* that a
rep had to clear before typing, and which read as an answer rather than an empty
box. They now start blank behind a `0` placeholder.

## §14 — Sixth-pass revisions, rep review 2026-08-27

Seven items from John, testing the mockup.

### Quote date auto-fills

It already defaulted to today; it did not say so. Now carries the `auto` badge
and "Today, unless you change it," so a rep knows it was filled for them rather
than wondering whether they left it blank.

### Real Merck deals behind the lookup

All 99 Merck deals whose HubSpot name carries an MT number are now in the
mockup, so the lookup can be tested against live data instead of three fixtures.

**What this makes visible is the point.** HubSpot holds the sponsor and the deal
name. It does not hold cohorts, subject counts, specimens, timepoints, criteria
or prices — spec §7 measured that. A HubSpot-sourced match therefore fills two
fields and says so plainly: *"cohorts, specimens and pricing are not stored
there, so those are yours to fill in."* Auto-fill from the register of past
quotes is worth far more, which is an argument for the tool, not against it.

Two behaviours fall out of the real data:

- **Extension numbering reads HubSpot.** `MT0404` already has an extension #1 in
  HubSpot, so the lookup proposes #2 — the register alone could not know that.
- **Umbrella numbers refuse to guess.** `MT9920` covers 25 Merck deals; the
  lookup names the problem and asks for the quote reference or PO instead.

### Population group, subpopulation and severity removed

Asked: *"do we need population group? the cohorts will be defined as free text."*
No. All five controls are gone from the cohort card.

They were lifted from HubSpot's `population_2` and `sub_population` enums, which
are 99% populated and describe a *deal*, not a cohort. On a cohort they repeated
what the description and the I/E criteria already carry, with less precision —
the same failure as the feasibility form's naive/treated dropdown, and the same
lesson as §4's reverted approaches. If HubSpot's fields ever need writing back,
that is one dropdown on the quote, not five controls on every cohort.

The allocation note now appears when a quote has more than one cohort, which is
what it was always really about.

### Specimens can differ by timepoint

Asked: *"what if the biospecimens are different at each timepoint?"* Each
specimen block in §05 now carries a **Collected at** row listing the timepoints,
all ticked by default. Blood at every visit, a biopsy only at baseline.

The count is priced. §11 shows "2 collections per subject" on the block, the
field reads **$ per collection**, and the cost line spells it out —
`Plasma — 100 × 2 collections × $200.00`. A specimen at one timepoint shows no
multiplier, so the common case reads exactly as it did before.

### Shipping becomes §10, and is quoted per leg

Asked for, in three parts: its own section; cost inputs for every leg, prompted
with MT Group's numbers but overwritable; and a choice between lump sum and per
subject. Sections renumber — Shipping 10, Pricing 11, Additional details 12.

- **Ship-to address(es)**, moved out of §09. There was previously nowhere to say
  a frozen shipment was going to Cambridge rather than Boston, while the price
  turns on exactly that.
- **A table of legs**, two by default, each with a destination, a shipment count
  and a rate. A blank rate uses the standard for that destination and shows it
  as the placeholder, so a rep types only the ones that differ. International is
  a per-leg tick, because one study can have both.
- **Standard rates stay editable** — $300 US, $3,000 international, 2× markup —
  but they are now defaults behind per-leg figures rather than the only inputs.
  International genuinely varies by country.
- **Lump sum or per subject**, with the division shown, and an override on
  whichever is chosen. A per-subject quote still reconciles to a total so the
  arithmetic on the document adds up.

### A defect this uncovered

The old shipping block displayed **"Batches out to the sponsor: 1"** and charged
**$0** for it. The field's `get` returned `'1'` for display but never assigned
it, so the calculation read `undefined` as zero. Every quote that accepted the
default under-charged by one outbound shipment — $600 at the standard rate.

Same class as the `pr.extMode` mismatch in §12: a default that exists for the
eye and not for the arithmetic. Worth a standing check — where a field displays
a default, confirm the maths reads the same value.

## §15 — Seventh-pass revisions, rep review 2026-08-28

### Subcohorts reach the extension track

The full quote has had subcohorts since the third review; the extension track
never got them, so a rep extending a study that has subcohorts had nowhere to
put the split. Each cohort in §03 now takes subcohorts, labelled `1a`, `1b`, and
the cohort's own figure locks and shows their sum — the same behaviour as the
full quote, so the two tracks no longer disagree about what a cohort is.

`extAdditional(c)` is the single reader of an extension cohort's subject count,
used by the §03 total, the per-cohort pricing, the quote total and the
per-subject shipping division. One helper rather than five call sites reading
`c.additionalSubjects` directly, which is how the two tracks drifted apart in
the first place.

### The US-destination undertaking

Ship-to addresses are often not known when the quote is written, and John did
not want that gap to become a surprise international delivery later. A checkbox
— *"The sponsor's destination is US-based"* — puts a sentence in the quote:

> Shipped to a US-based destination designated by Merck.

The sponsor's name comes from §01. Ticking it also fixes the MTG-to-sponsor leg
at the US rate and disables that leg's international tick, since the quote now
says otherwise. The rendered sentence is shown under the checkbox so the rep
sees the wording that will appear, not just a tick.

This is the cheap half of a real commercial problem: it does not discover the
address, it makes the assumption explicit and priced.

### Legs named as reps name them

"Collection sites to MT Group" and "MT Group to the sponsor" become
**Site(s) to MTG leg** and **MTG to sponsor leg**.

### Tighter vertical rhythm

The form was running long on negative space. Section margins, field gaps, label
gaps, input padding, card padding, fieldset margins and the calculation blocks
all come in. A representative quote — one cohort, two specimens — drops from
7,937px to 7,127px, about 10%, with no change to type size or line length.

### Also fixed

§09 still carried **Delivery address(es)** after §10 gained **Ship-to
address(es)**, so the form asked for the same thing twice. §09's copy is gone.

## §16 — Eighth-pass revisions, rep review 2026-08-28

Nineteen items. The last one was a defect.

### The bug: # subjects went dead with no explanation

Adding a subcohort disables the cohort's own subject count — correct, it is
summed from the subcohorts. But the explanatory hint only rendered if the
cohort *already had* subcohorts when the card was built, so a rep who added one
watched the field stop accepting input and say nothing about why.

`field()` now exposes its hint node, and the subcohort handlers keep it
truthful: *"Summed from the subcohorts below — edit them instead"* against
*"Or add subcohorts below and this adds itself up."* The field explains itself
in both states rather than only one.

### Required fields, and being honest about them

Two fields wore a required asterisk that `submit()` never checked — cohort
description and # subjects. Marking is now aligned to what is actually
enforced: **client / sponsor, quote date, quote name**. A required field shows
an amber label and border while empty and goes quiet once filled, with a key
under the form title.

Deliberately not enforced: cohorts, specimens, prices. A rep saves partial
drafts and comes back, which the form promises in its own subtitle.

### Criteria

- The standalone *"Prose, one criterion per line"* note is gone. It sat above
  the fields it described; the message now rides on each box, where the rep is
  looking: **"Put each criterion on its own line — every line becomes a bullet
  in the quote."**
- **Subcohorts take their own inclusion and exclusion criteria**, in both the
  full quote and the extension track, prompted for *"only what differs from the
  cohort above."*
- The subcohort's free-text field is labelled a **description**.

### Biospecimens

- **"Other tissue"** ends the tissue column and **"Other blood product"** ends
  the blood column, rather than one "Other" stranded in the third.
- **Fresh tissue** loses aliquots, container and storage state. It ships as
  collected; there is nothing to aliquot it into and nothing to store it in.
- **Fresh blood** likewise loses storage state and defaults to ambient gel
  packs. PAXgene is the exception, so both fresh types carry a **"Frozen before
  shipping"** tick that brings container and storage back.
- **Blood is described by its tubes**, because a 10 mL tube does not always
  fill: *"3 × 10 mL EDTA"* rather than a volume nobody can promise. A tick
  switches to a volume instead, where a range like *8–10 mL* is fine.
- **Shipping temperatures** are the four MT Group actually ships in — ambient
  gel packs, 2–8 °C Nanocool, dry ice, LN2 dry shipper — plus **Other**, which
  opens a field rather than quietly standing for something nobody wrote down.

### Wording

| Was | Now |
|---|---|
| Site / study initiation | Study initiation |
| "The leading number drives batching below" | "This range guides the batching plan below" |
| Legs | Shipping legs |
| Cost | Our cost |
| MT Group cost | MT Group internal cost |
| Shipping on this quote | Shipping price for sponsor |

§07's **Delivery detail** now prompts *"Reference the processing instruction
file if there is one."* §10's ship-to box prompts **"To a US location designated
by Merck"** — the sponsor's name, following §01 as it is typed, so a rep who has
no address still records the undertaking.

## §17 — Ninth-pass revisions, 2026-08-28

### Hints that told the rep nothing

Removed: *"Today, unless you change it"* on the quote date, *"Fills in from the
sponsor name when we know it"* on the acronym, *"Looked up from the contact name
in HubSpot. Always editable"* on the contact email, *"Blank if the sponsor has
not issued one yet"* on the PO, and *"Shown because this quote has more than one
cohort"* on the allocation note. The `auto` badge already says a field filled
itself; saying it twice is noise. *"Up to this number (not a firm target)"*
becomes **"Up to this number."**

The lookup hint keeps only its non-obvious half: **"Any one of these three finds
the study."**

The test for what stays: does it name a consequence the rep would not otherwise
know? *"Non-standard processing is one of the most common reasons a site
declines"* earns its place. *"Free text — type or paste the reference"* does not.

### Sponsor contact fills from the HubSpot deal

Asked whether the contact could auto-fill once the deal name is entered.
Measured first, on portal 7423331, 2026-08-28:

| | Deals |
|---|---|
| Carry at least one associated contact | **2,610 of 2,843 (92%)** |
| Carry more than one | **7** |

So the deal identifies exactly one contact in 2,603 cases. Auto-fill is
reliable, not a guess.

The HubSpot deal name is now a lookup key in its own right, alongside the quote
reference, the PO and the MT number. Leaving the field fills the sponsor, the
contact name and the contact email — **but only where they are still blank.** A
rep who has typed a contact keeps it; the lookup fills the gaps around it.

Matching is deliberately forgiving. Reps retype these names as often as they
paste them, so casing, punctuation, curly apostrophes and whether the MT number
sits in brackets are all normalised away before comparing, and a typed name that
is a superset or subset of the stored one still matches.

Three real contacts are seeded from the portal so the behaviour can be
exercised. The real app reads the association live rather than holding a copy.

### Also fixed

Section renumbering in §14 left three stale references to "§10" that now mean
shipping: the outcome-data hint in §07 and two validation messages. They point
at §11.

## §18 — Tenth-pass revisions, 2026-08-28

### The HubSpot deal name leads §01

It is the first field on the form, full width, in both the full quote and the
extension. Everything HubSpot holds follows from it — sponsor, acronym, contact
name, contact email — filled as the rep types, on a 400 ms debounce rather than
waiting for them to leave the field.

It fills blanks only. A rep who typed a contact first keeps it.

**The trap this walked into, and the fix.** Filling those fields by calling
`renderBody()` rebuilt the header underneath the rep, taking focus out of the
field they were still typing into and swallowing everything they typed after the
lookup fired. Verified in a browser: focus landed on `BODY` and two trailing
keystrokes vanished.

The lookup now writes into the existing inputs and never touches the one that
has focus. This is the third time this form has been bitten by a repaint during
typing (§9's extension lookup, and the pricing repaint before it) — the rule is
now explicit: **a background lookup updates inputs in place; only a deliberate
user action rebuilds a section.**

### Sponsor-selected cases move to §03

They were a textarea in the header, shown only for retrospective studies. They
belong with the population: when the sponsor has already picked the cases, that
*is* the population definition, and the cohorts below describe what was picked.

A checkbox at the top of §03 — *"The sponsor has selected the cases"* — opens
two ways to record them:

- **List the biospecimens here** — one case or biospecimen number per line.
- **Name the document that lists them** — a reference, named in the quote so
  both sides agree which list was priced.

The two seeded quotes that carried a case list now carry it as a named document,
which is what both of them actually were.

## §19 — Eleventh-pass revisions, 2026-08-28

The governing idea, stated by John across fifteen items: **if the quote always
says the same thing, it is a statement in the document, not a question on the
form.** Applied to §05, it removed more fields than it added.

### §03 — a picked-cases quote counts units, not subjects

- **Sponsor-selected cases appears only for a retrospective study.** A
  prospective study cannot have cases already chosen.
- **When it is ticked, cohort description and # subjects disappear** and
  **# units** takes their place — *"140 blocks, 300 mL, 60 slides"*. Nothing is
  being enrolled; a list already exists and what is being priced is its size.
- **Inclusion and exclusion stay**, with prompts that match: *"Block age ≤ 5
  years, fully consented"* rather than geography and treatment status.
- Subcohorts follow the same rule — units, not subjects.

### §05 — what each specimen actually needs asked

| Specimen | Now asks |
|---|---|
| FFPE | Blocks per subject, additional processing |
| Fresh tissue | Size or weight, additional processing |
| Flash frozen tissue | Size or weight, additional processing |
| Frozen tissue in media | Size or weight, **media**, additional processing |
| Slides | One box: *"5 unstained slides and 1 H&E slide with each subject"* |
| Other tissue | One box, everything in it |
| Whole blood and blood products | Tubes per subject, then a block per tube |

Gone from every one of them: aliquots-per-subject as a standing field, container
/ tube, storage state, shipping temperature, block age limit, minimum tumour
content, the matching-H&E tick, and the *"frozen before shipping"* tick — which
was wrong on its own terms, since frozen tissue is a different specimen type and
whole blood is never frozen before shipping.

Block age and tumour content moved where they belong: the inclusion criteria.

**Tubes get their own blocks.** Entering "3" opens three blocks, each asking
tube type, tube size and processing instructions. Blood is drawn into named
tubes and each can be handled differently, which a single "container" field
could not express. Aliquots are part of processing, not a separate count.

**Aliquots survive only where they are a real question:** a blood product
described by volume rather than by tubes. Whole blood is never aliquoted, so it
never asks.

Each card shows what the quote will say about shipping — *"Shipped on dry ice."*
— so a rep can see the information was not lost, only moved.

## §20 — Register extract for analysis, 2026-08-28

A button on the register produces one CSV row per document, fit to hand to an
analyst — or to Claude — without handing over who the sponsors are.

### What the file does and does not carry

John set the boundary, 2026-08-28: **confidential is the company name, the
contact name and the email address.** Nothing else, unless it identifies the
company by another route.

**Not in the file.** Those three, and the sponsor acronym.

**The acronym is the "another route."** It is not a name, but it is the name's
key: `QTE NTA20260826 Pan-cancer - blood` and `NTA: 500 healthies - blood` both
identify Natera to anyone who has seen one other quote. So the acronym is
stripped out of the study and deal labels and the description survives —
*"Pan-cancer - blood"* is the analysable half and gives nothing away.

**Pseudonymised rather than dropped.** Each sponsor becomes a stable code
(`S01`) and each study becomes one (`ST001`), consistent across rows, so *"the
same sponsor"* and *"this study and its extensions"* remain analysable.

**Everything else travels.** MT and PO numbers, dates, status, validity, study
design, cohort descriptions, units, timepoints, shipping destinations, every
figure — and, behind a toggle that defaults on, the free text: inclusion and
exclusion criteria, processing requirements, pricing notes, summary and notes.

**The free-text caveat, stated on the panel.** No rule can guarantee those are
clean: a rep may have typed a company or a person into a notes box. The toggle
turns them off in one click, and the panel says to skim before sending.

### The study code is keyed on sponsor *and* MT number

Keyed on the MT number alone, `MT9920` — one number across 43 sponsors — would
have merged unrelated studies under a single code and quietly corrupted any
grouping done downstream. Caught in the first run of the export against the
sample register, where two sponsors came back as one study.

### Columns

`document_type`, `study_code`, `sponsor_code`, `quote_date`, `status`,
`is_extension`, `extension_number`, `design_changed`, `service_type`,
`sponsor_selected_cases`, `cohort_count`, `subcohort_count`, `subject_count`,
`specimen_types`, `specimen_type_count`, `timepoint_count`,
`max_collections_per_subject`, `price_per_collection_min`,
`price_per_collection_max`, `screenfail_rate`, `shipping_legs`,
`shipping_internal_cost`, `shipping_markup`, `shipping_quoted_as`,
`us_destination_stated`, `total_cost`.

`document_type` already distinguishes quotes from feasibilities, so the
feasibility builder needs no change to this export when it arrives.

### Copy, not download, inside the preview

The published artifact runs sandboxed and blocks any download the page starts
itself, so the extract is shown as selectable text with a **Copy** button, which
always works. The **Download .csv** button beside it works in the real app and
when the file is opened locally. In the real app this becomes a route handler
and the textarea is unnecessary.

## §21 — Building the gaps the five real quotes exposed, 2026-08-28

All five Natera quotes now reproduce to the cent.

| Quote | Real total | Builder |
|---|---|---|
| Butterfly vs. straight needle | $90,000 | $90,000 |
| Clean colonoscopy & advanced adenoma | $366,000 | $366,000 |
| CRC & healthy — stool | $180,000 | $180,000 |
| Healthy confirmed colonoscopy | $18,000 | $18,000 |
| Pan-cancer & benign diseases | $948,425 | $948,425 |

### §11 prices a full quote per cohort

Per cohort is now the default and per specimen type the alternative, because
four of the five real quotes price the first way and one prices the second.
Both are needed: the colonoscopy quote prices plasma and buffy coat separately
inside a single cohort.

### A price carries its unit, and units are not always subjects

Each cohort price names what it is quoted per — subject, draw, case,
collection, stool, aliquot, block, slide, report, shipper — and how many of
them each subject yields.

That second number is the one that would have been missed. The adenoma quote is
one draw per subject, so the count matches. The stool quote collects **25
subjects but prices 50 stools**, two from each. Priced on the subject count it
would have come out at $87,500 against a real $180,000 — half the quote, and
wrong in a way that reads as plausible. The cost line now prints
*"CRC — 25 subjects × 2 stools × $2,000.00"*.

### Cost lines are a rate times a count

`Other costs` were flat amounts. Medrio entry at $100 a subject is **$53,200 of
the $948,425 pan-cancer quote**; shipping kits out to sites is $50 a stool;
translated colonoscopy reports are $150 each. A line now takes a rate, a count
and a unit, and prints *"At Enrollment Medrio Entry — 532 subjects × $100.00"*.
Leave the count blank and it is a lump sum, as before.

### Smaller, all confirmed against a real quote

- **A cohort count can be marked an estimate.** The pan-cancer quote prices a
  "negative bladder" cohort that exists only if suspicion cases come back
  non-cancer, and totals it as *"estimating 7 cases"*.
- **The total states what it assumes** — *"$180,000 (estimating that 100% of
  subjects provide two stools)"*.
- **What the sponsor provides** (§05). Streck tubes, kits, boxes, labels: named
  in four of five quotes, and it gates the timeline — one study starts only once
  the tubes arrive.
- **Named documents.** A processing protocol in §05, a collection protocol in
  §03, and §07's delivery detail now prompts for the data-format example.
- **Where a section differs by cohort** (§05 and §07), shown only once a quote
  has more than one cohort. The lighter of the two options in the gap note:
  a per-cohort override in both sections would double the form for a case that
  arises in two quotes out of five.

### Still open

`GAP 9` — deal-specific commitments in prose: no early termination while
enrolling as expected, halt on four weeks' notice, freight escalation, invoice
on actual delivery, cross-study enrolment. All five quotes carry some. §12's
notes box holds them as one block; a short list of named clauses would make them
consistent. Not built — it is a real choice, not an oversight.

Also open: the letterhead reads Van Nuys in four quotes and Los Angeles in the
fifth, same street.

## §22 — Study conditions, and the last of the five-quote gaps, 2026-08-28

### The commitments that were living in prose

`GAP 9` is built. §12 now carries **Study conditions**: eleven clauses, each
lifted verbatim from one of the five real quotes, with the sponsor's name
substituted. Ticking one reveals the wording, editable.

| | |
|---|---|
| No early termination while enrolling as expected | *"{S} will not terminate this study early if MT Group is enrolling subjects as expected."* |
| Sponsor may halt the study on notice | *"{S} may halt the study with 4 weeks' notice."* |
| Regular enrollment updates | *"MT Group will provide {S} with regular enrollment updates."* |
| Shipping costs may rise with freight charges | *"…if freight charges increase dramatically during the study execution, shipping & handling costs may also be increased."* |
| Invoiced on samples actually delivered | *"MT Group will invoice based upon the actual samples delivered."* |
| Subjects may enroll in another study | *"It is acceptable that subjects enrolled in this study also enroll (or be enrolled) in another {S} study with MT Group."* |
| Subjects may have been collected before | *"It is acceptable for subjects to have been previously collected for another {S} study."* |
| Subjects may be drawn more than once | *"It is acceptable for MT Group sites to draw subjects at multiple times as long as the inclusion / exclusion criteria are met."* |
| Changes are mutually agreed | *"Any changes to the approach described herein will be mutually agreed by {S} and MT Group."* |
| Site draw limit per visit | *"MT Group sites can only draw 4 x 10 mL tubes' worth of blood per draw and each draw has the same site cost."* |
| Diagnosis may be confirmed after enrollment | *"For suspected cancer subjects, it is acceptable that definitive confirmation of cancer / non-cancer can occur up to 6 months after enrollment."* |

These are **not** the Terms & Conditions. Those are identical in all five quotes
and belong to the generator. These are the deal-specific ones — and they are the
terms most likely to be argued about a year later, which is why they are prompted
rather than remembered. The same reasoning as the feasibility prompt catalogue:
make the rep consider each, let them dismiss the ones that do not apply.

### All five quotes are now writable end to end

Numbers matched after §21. With the conditions built and the letterhead settled,
every narrative term in the five quotes has a field to live in. What remains
before one could be printed is the Word generation itself, which is Phase 6 and
was never in question here.

## §23 — Audit for superfluous and automatable fields, 2026-08-28

Every control in the form, counted and judged: **128 down to 110**, with two
defaults corrected and one lost link restored.

### Two defaults that every real quote contradicted

- **Validity opened on "30 Day Quote". All five real quotes are 60 Day Quotes.**
  60 is now first in the list and therefore the default.
- **The kick-off call** was changed to start ticked on the same evidence, then
  **reverted** the same day: John's five samples are the complicated studies
  that warrant a call, and more than half of MT Group's do not. It stays off.

The first change was right and the second was wrong, from identical reasoning.
Five quotes are enough to fix a default that every one of them contradicts, and
not enough to set one that merely suits all five — a sample chosen because it is
interesting is not a sample of the ordinary case.

### A link lost in a refactor

§09's delivery batching used to drive the outbound shipment count. When shipping
moved out of §11 into its own §10, the link went with it and nobody noticed —
the leg count became a hard-coded `1`. Choosing "2 batches (midpoint + end)" now
sets the MTG-to-sponsor leg to 2, still overridable by typing.

### Fewer controls for the same information

- **Clinical data: sixteen checkboxes become eight rows of three.** The same
  eight categories were listed twice, as "Required" and "If available" columns —
  double the height, and nothing stopped a rep ticking both. One row per
  category with three states says the same thing in half the space and cannot
  contradict itself.
- **Two hedges on one number become one dropdown.** "Up to this number" and
  "This count is an estimate" were separate checkboxes qualifying the same
  count, and both could be ticked. Now `This count is: exact / a maximum — up to
  this number / an estimate`, which is also the wording the quote prints.
- **"Additional costs not itemised above" is gone.** It duplicated the other-cost
  table, which since §21 takes a rate, a count and a unit and can carry anything
  that used to be typed into a box beneath it.
- **Status moved out of §11 to sit beside the save buttons.** Where a quote sits
  in the pipeline is not a price, and it was the only workflow field buried in a
  pricing section.

### Left alone deliberately

- **§02 Quote approach** — confirmed real by John, 2026-08-28: *"I quote $500K
  for as many cases as possible, with fresh tissue most commonly."* None of the
  five sample quotes uses it, which is exactly why it was flagged rather than
  cut. Verified working: $500,000 against a $3,400 fresh-tissue case gives 147
  subjects.
- **The 23 specimen checkboxes.** A vocabulary list, not redundancy.
- **The 11 study-condition clauses.** Long, but each is a real term from a real
  quote and the whole point is prompting.

### Specimens suggested from the deal name — built

Approved by John, 2026-08-28, on the condition it stays changeable.

Typing a deal name ticks the specimens it names. Longest phrases match first, so
*"flash frozen tissue"* is not read as *"tissue"* and *"whole blood"* is not read
as *"blood"*. Checked against eight real deal names:

| Deal name | Suggested |
|---|---|
| NTA: 500 healthies - blood | Whole blood |
| GHI: Non-advanced & advanced adenoma - plasma, & buffy | Plasma, Buffy coat |
| XRA: Dermatologic disease & normal - tissue, plasma, PBMCs | Fresh tissue, Plasma, PBMCs |
| SBS: Multiple Myeloma and Normal - bone marrow aspirate, plasma | Plasma, Fresh bone marrow aspirate |

Three rules keep it a suggestion rather than an answer: it fills only an **empty**
§05, a banner over the specimens says where they came from, and touching any
checkbox clears the banner. It also ticks in place rather than repainting §05,
so it cannot pull focus out of the field being typed in.

It runs on **any** deal name, not only the Merck deals held in the mockup — the
first build had it behind the HubSpot lookup, so six of the eight names above
produced nothing.

Known limitation: *"frozen and FFPE biopsies"* suggests fresh tissue and FFPE
rather than frozen tissue, because a bare *"frozen"* matches things like a
frozen shipment. A wrong suggestion costs one click.

## §24 — The register was fabricated; rebuilt from the real quotes, 2026-08-28

John, on the sample register: *"why do you say 'Elsevier Biobank'? these are
exact sciences quotes. how did you pick the sales rep for each quote (many are
wrong)."*

Both fair. The register was invented. The acronyms were lifted from real HubSpot
deal titles, but everything hung on them was made up:

- **Sponsor names guessed from initials.** "Elsevier Biobank" for ELS and "EMC
  Biosciences" for EMC were guesses at what the letters stood for. EXS is Exact
  Sciences.
- **Reps assigned at random** from a list of four, three of whom do not exist.
- **Totals, PO numbers and MT numbers** invented to look plausible.
- **A contact directory of five people who do not exist**, at real companies,
  with plausible work email addresses.

That last one is the worst of it. Plausible-looking records are worse than
obviously fake ones, because nobody checks them.

### What replaced it

The five real Natera quotes, transcribed from the PDFs. Client, requestor,
date, quote number, cohorts, specimens, prices and totals exactly as issued;
John Kibler on all five, because all five say *"prepared and approved by John
Kibler"*. The generated quote numbers come out matching the real ones.

Status is **sent** on all five, because the documents record no outcome.
Guessing won or lost would repeat the mistake. That leaves the register's status
filter with one populated bucket, which is honest and slightly less pretty.

Draft samples are gone: they existed to demonstrate the draft state, and John
does not need them before launch.

Also removed: the invented contact directory, now five real people (the two
Natera requestors on the quotes, three Merck contacts from portal 7423331), and
the three fabricated pre-tool studies in `STUDY_INDEX`, which is now empty —
extension lookups run off the register of real quotes and the real HubSpot deal
index instead.

### The rule this should have followed

**Sample data in a tool that displays records must be real or obviously
synthetic — never plausible invention.** A register of quotes is a record; a
reader has no way to tell a transcribed row from an imagined one. Where real
data is not available, leave the field empty and say so.

## §25 — "Reset sample data" never worked in the published mockup, 2026-08-28

John: *"why does the register still say Karen Krantz and Elsevier Biobank? … I've
been trying to reset but that button doesn't work."*

Not caching. A real defect, and mine.

`window.confirm()` is suppressed inside a sandboxed frame — which is exactly how
the mockup is published — and it **returns false**. So

```js
if (!confirm('Reset the mockup back to its sample quotes?')) return;
```

returned every time, silently. The button had never worked for John in the
published artifact. Delete quote had the same guard and the same fault.

Both are now a two-step button in the page: the first click arms it and shows
the question, the second does it, and either can be cancelled. No native dialog.

### Why the tests missed it

Every browser test ran the file directly, where `confirm()` works, and
Playwright auto-accepted the dialog. The tests proved the reset worked in a
context no user is ever in.

There is now a sandboxed-frame harness — the mockup loaded inside
`<iframe sandbox="allow-scripts allow-same-origin">`, without `allow-modals`,
which is the artifact viewer's configuration. Run against the previous commit it
reproduces the failure exactly: click reset, and Karen Krantz is still there.

**The rule: test the mockup the way it is published, not the way it is
convenient to load.** Anything that depends on a browser capability — dialogs,
downloads, clipboard, storage — behaves differently in the sandbox, and the
download button in the export panel is already known to be inert there for the
same reason.

## §26 — Internal draft preview, and four fixes from rep review, 2026-08-31

Five items from John, all of them from actually using the form.

### 1 & 3. "Other" biospecimens had no name

Ticking **Other tissue**, **Other blood product** or **Other** recorded only
that a box was ticked. There was nowhere to say *what* it was, so the study
summary read "…collect and evaluate other from ovarian cancer subjects."

Those three types now carry `named: true` and a **What is it** field
(`specimenDetail[type].otherName`), with a placeholder drawn from what MT Group
actually collects — ascites, CSF, synovial biopsy; leukopak, PAXgene RNA, dried
blood spot; skin tape strips, aqueous humor, tonsil.

A module-scope `specimenLabel(draft, type)` returns that name when it is set and
the type name otherwise. It is used by the quote name, the study summary (both
the specimen list and the processing sentence) and the internal draft, so the
name flows everywhere the type used to. Verified: the summary reads "…collect
and evaluate ascites from ovarian cancer subjects."

### 2. The lump-sum shipping box took one character at a time

The shipping override's `then:` handler called `paintMode()`, which rebuilt the
container holding the input being typed into. The input was destroyed on every
keystroke, so the field kept only the last character.

The total line is now a `totalV` span updated directly; nothing repaints. This
is the **fourth** occurrence of this trap. The rule, restated: **a `then:`
handler must never repaint its own container.** Update the specific node that
changed.

### 4. Nowhere to record site costs

**Site cost + stipend**, **Source** and **Pricing notes (internal)** existed
only on the per-specimen pricing blocks. Switching the default to per-cohort —
which is how four of the five real quotes price — left a rep with no field for
what a site charges. Per-cohort rows now carry the same three fields
(`pricing.cohortInternal[key]`), and the analysis export gained a `site_costs`
column and reads cohort notes into `pricing_notes`.

### 5. The internal draft preview

`renderInternalDraft()` lays the quote out as the document will read: letterhead,
requestor, client, quote date and validity, quote number, summary, service type,
cohorts with subcohorts and bulleted I/E, biospecimens with their fixed shipping
statements, processing, sponsor-provided materials, clinical data, timeline,
shipping, the cost table, study conditions, notes and the T&C footnote.

The cost table carries two extra columns — **Site cost** and **Internal note** —
in the accent colour and a sans face, because they are annotations on the
document rather than part of it. *The sponsor quote is this document with those
two columns removed.* This is not the `.docx`; that is Phase 6 and has
formatting rules of its own (§3). This shows what the document will **contain**.

It previews **what is on the form, not what was last saved** — a rep wants to
see the document before committing to it. `previewDraft` holds the in-progress
quote for the preview and `resumeDraft` carries the half-filled form back, so
nothing is retyped. Leaving by the top nav clears both.

Verified on the pan-cancer quote: the preview reproduces the issued document,
$948,425.00 to the cent.

### Two regressions found while verifying

**Extensions carried no price.** `parentPerSubject()` only read
`pricing.specimenPrices`, but every real quote prices per cohort, so an
extension of any of them started at zero. Each extension cohort now resumes at
**its own** rate from the parent (`header.parentCohortPrices`); a single blended
figure would be wrong wherever cohorts were priced differently, which is most of
them. `parentPerSubject()` returns a flat rate only when every cohort was
charged the same. Verified: an extension of the pan-cancer quote adding 50
Cancer subjects prices at $1,650 each.

**The analysis export leaked the sponsor's name.** `shipping_destinations`
carried "US-based Natera location" — a structured column, so it travelled even
with free text switched off. Patching that one field would only have left the
next one. Every row now goes through `redactSponsor()` as a last pass, which
replaces the sponsor's name and acronym with its code in **every** string value,
longest term first. Verified: no company name or acronym anywhere in the file.

### Sample data unchanged

`SAMPLES_VERSION` is deliberately **not** bumped. Nothing in the seeded quotes
changed, and bumping it would discard the quotes John has been testing with.

## §27 — Extension track, shipping, and the document rewrite, 2026-08-31

Twelve items from rep review. The extension track and the document output were
both wrong in ways only visible from using them.

### The minimal extension track (items 1, 2, 4, 5)

An extension whose study design is unchanged collapses to a short form. That
form showed a subset of the sections but kept the **full track's numbers**, so
it read 01, 03, 10, 11, 06, 12. Numbers are load-bearing *within* a track, so
each track now gets its own consecutive run (`secNum()` maps the canonical id
onto the minimal sequence). The minimal track is 01 Quote header, 02 Additional
subjects, 03 Biospecimens, 04 Shipping, 05 Pricing, 06 Study summary,
07 Additional quote details.

**Biospecimens now appear in the minimal track** (§03). They were omitted on the
assumption that an unchanged design means unchanged specimens, but an extension
can add subjects across several specimen types at different rates. Pricing
follows: each cohort now carries **one priced row per biospecimen**
(`pricing.cohortSpecimenPrices[cohort][type]`), and a cohort's per-subject
charge is the sum of them (`extCohortRate()`).

**Shipping is streamlined.** The legs, standard rates, markup and the internal
cost build-up were all settled in the original quote, so the minimal track shows
only the mode and the figure. The field is labelled "Shipping price" rather than
"Override the shipping price" — there is no calculated figure to override.

**"What the total assumes" is hidden.** It prints in brackets after the total on
the quote — the stool quote reads "$180,000 (estimating that 100% of subjects
provide two stools)". A streamlined extension carries no such caveat.

### Item 3 — pricing mode names

"One price for every cohort" / "Price per cohort" → **"Same pricing for all
cohorts"** / **"Different prices per cohort"**.

### Item 6 — $600 of shipping on every untouched quote

`legCount()` returned `batchCount()` for the sponsor leg when nothing was typed,
and `batchCount()` returned 1 whether or not a batching plan had been chosen.
With the standard US rate ($300) and the 2× markup, every new quote carried $600
of shipping before the rep had entered anything. The sponsor leg now follows §09
batching **only once a batching plan has actually been chosen**, and counts zero
otherwise.

### Item 7 — the extension summary lost its MT number

`applyStudy()` set `draft.header.parentMtNumber = study.mt` unconditionally. The
parent quote reference is tried first and register quotes carry no MT number, so
a typed MT was blanked the moment a quote reference was also present. It now
only overwrites when the lookup actually has one. The drafted extension summary
cites both: *"…ordered under PO 4500123456 / MT Group study MT0438."*

### Item 8 — US destination before the address

The checkbox now sits **above** the ship-to box and fills it with the sentence
the quote would carry anyway. It only ever fills a blank box, and unticking
clears it only if it still holds that exact sentence — anything typed survives.
The explanatory paragraph underneath is gone.

### Item 9 — legs only where there is something to batch

Fresh specimens ship site-to-sponsor overnight. When **every** selected specimen
is fresh (`Shipped at 2-8 °C`), the legs block is replaced by a one-line note and
the internal cost is zero. One non-fresh specimen brings the legs back, since
that one still needs batching.

### Items 10–12 — the document

The preview was laid out as a web table and did not read like an MT Group quote.
Rebuilt against the five real PDFs:

- **Left-justified letterhead** with the two horizontal rules.
- `Label:` / value in two columns, in the document's serif.
- **Whole dollars.** No quote in the set shows cents; `docMoney()` prints them
  only if a figure somehow carries them, rather than rounding silently.
- **Long dates** — "July 24, 2025", not "Jul 24, 2025" (`docDate()`).
- **Costs as labelled lines, not a table**, in the quotes' two-part shape: a rate
  block ("Biospecimen Costs: $1,650 / subject (Cancer)") and then a
  **Total Study Cost** breakdown of the extended amounts ending "(Total)". A
  single-line quote just states its total. Other costs print as a rate —
  "$50 / subject stool" — with the count left to the breakdown.
- **The full terms**, all eight clauses verbatim, the purchase-order line, the
  prepared-by line, payment terms and the signature block.
- Site cost and internal notes hang off the right of their cost line in the
  accent colour. *The sponsor quote is this document with those removed.*

**`draftCostLines()` ignored extensions.** It priced against `cohortSubjects()`,
the parent study's whole population, rather than the additional subjects, and
knew nothing of `extMode`. That is what made the output wrong. It is now
extension-aware, and the shipping figure comes from one `quoteShippingTotal()`
that agrees with the form rather than a second copy of the arithmetic that had
already drifted (it still counted an untyped sponsor leg as a shipment).

Verified: all five real quotes reproduce to the cent, and an extension adding 50
Cancer subjects at $1,000 whole blood + $250 plasma with $5,000 shipping totals
$67,500 with each line named.

### Payment terms

Confirmed as **net 30 days** by default. It is a field rather than fixed text
because the quotes themselves vary — four of the five are net 30 and the adenoma
quote is net 45. It sits in §12 with net 30 as the placeholder, so a rep only
touches it on the quote that differs.

## §28 — Extension shipping, screenfails, and conditions in context, 2026-09-01

Eight items from rep review.

### 1. Extension shipping is per biospecimen

An extension ships biospecimens, not subjects — a subject giving whole blood and
plasma is two things to ship. On the minimal track the second mode is now
**"Quote per biospecimen"**, and it lists one rate per type ticked in §03
(`shipping.specimenRates[type]`). `extShippingPerSubject()` sums them, and the
document names each rate and its extended amount separately.

### 2. Screenfails are a case count, not a percentage

"Cap (%)" is replaced by **"Estimated max screenfail cases"**
(`pricing.screenfail.maxCases`). A percentage had to be turned back into a
number of cases to be quoted anyway, and the quote states a number.

### 3. Shipping sits below pricing on an extension

Shipping is the small tail of an extension quote, not something to settle before
the price. Minimal track order is now 01 Quote header, 02 Additional subjects,
03 Biospecimens, 04 Pricing, 05 Shipping, 06 Study summary, 07 Additional
details.

### 4. "Screenfails are shipped" did nothing

The checkbox stored `pricing.screenfail.shipped` and **nothing ever read it**.
Screenfail cases that get shipped are shipped subjects, so they now count
towards the per-subject shipping charge in the form, in the document and in the
export. Verified: 100 subjects at $50 shipping is $5,000; adding 10 shipped
screenfails makes it $5,500.

### 5. The extension header had no requestor

`renderMinimalHeader()` omitted the sponsor contact name and email, so the
document's Requestor block was blank unless a lookup happened to fill it. Both
fields are now on the extension header.

### 6. Summary wording

Now: *"This study is an extension to MT0438 that was quoted under
"QTE NTA20250724" and ordered under "4500123456"."*

### 7. Fresh specimens cannot be retrospective

Two properties are now explicit on `SPECIMEN_SPEC` rather than inferred from the
shipping sentence:

- `direct` — ships site-to-sponsor overnight, so there are no legs to cost.
- `noRetro` — has to be collected from a live subject, so it cannot appear on a
  retrospective-only quote.

`noRetro` is set on **Fresh tissue, Whole blood, Fresh bone marrow aspirate and
Synovial tissue**. When retrospective is the only service type those four are
withdrawn from §05, any already ticked are dropped, and a warning says why.
Adding a prospective service type brings them back. *This list is a judgement
call and John should correct it* — everything else in the list can plausibly come
out of a bank (FFPE, slides, frozen tissue, plasma/serum/buffy/PBMC aliquots,
urine, saliva, swabs, stool, synovial fluid).

### 8. Study conditions live where they apply

Each clause carries the section it belongs to and is asked there, next to the
thing it qualifies:

| Section | Clauses |
|---|---|
| §03 Population & cohorts | cross-enrollment, previously collected, diagnosis confirmed after enrollment |
| §04 Collection timepoints | subjects may be drawn more than once |
| §05 Biospecimens | site draw limit per visit |
| §09 Timeline & logistics | no early termination, sponsor may halt, enrollment updates |
| §10 Shipping | freight charges may rise |
| §11 Pricing | invoiced on samples actually delivered |
| §12 Additional details | changes are mutually agreed (no better home) |

All eleven are offered exactly once. `conditionsFor(sec)` is the single renderer.

### The header repaint trap — fourth site, fifth occurrence

Typing a requestor name after the MT number sent the keystrokes into the **MT
number field**. `afterLookup()` called `renderBody()`, which rebuilt the header —
and the lookup fires on blur, by which time the rep has already moved into the
next header field. Replacing the inputs underneath them sends what they type to
whichever node the browser was left holding.

`renderBody(keepHeader)` now leaves the header alone when a lookup calls it, and
the header's values are written in place by `setUnfocused()`, which never touches
the input holding focus. `applyStudy()` also stopped overwriting a requestor the
rep had typed — the same fault the MT number had.

**The rule, restated once more: nothing may rebuild a container while the rep
could be typing in it.** Update the specific node instead.

### Also

`screenfail_rate` in the analysis export read `pricing.screenfail.rate`, which
was never a field — the column had always been empty. Replaced by
`screenfail_price`, `screenfail_max_cases` and `screenfails_shipped`.

## §29 — Four more real quotes checked against the tool, 2026-09-01

John supplied four more: Classic Hodgkin's lymphoma, 500 healthies, and two
extensions (MT2234 #2 and MT2230 #1). All four now reproduce to the cent —
$36,000, $600,000, $500,500 and $150,300 — but each exposed something.

### Screenfails and outcome fees never reached the document

`draftCostLines()` emitted cohort/specimen lines, other costs and shipping, but
**not** screenfails or the outcome-data fee. The form counted them in its total
and the document did not, so any quote carrying either printed a total lower
than the one the rep had agreed. MT2230 extension #1 has $10,800 of screenfails
inside a $150,300 total — the document would have said $139,500.

Both now print as their own labelled lines. The screenfail line carries the
caveat from "How it is applied" alongside the rate, which is how the real quote
reads: *"Screenfail Rate: $600 / subject (capped at 20% of enrollment)"*. The
percentage wording survives even though §28 replaced the % field with a case
count — the count drives the arithmetic, the sentence carries the caveat.

### Per-subject shipping had been removed from extensions

§28 replaced the extension's "Quote per subject" with "Quote per biospecimen".
Both of these extension quotes charge **$100 / subject** and **$150 / subject**,
so that was a regression. Extensions now offer all three: lump sum, per subject,
per biospecimen.

### A pooled extension population

MT2234 extension #2 enrols *"Up to 286 total subjects with the following cancers"*
across ten named cancers, with allocations agreed later — one count, a bulleted
list of types, and a sentence of prose. The cohort/count table could express none
of it. The extension track gains **"This count is a maximum"**, a
**Population note** and a **Types enrolled** list (one per line, printed as
bullets). The document prints them as `Populations and Size`, with the noun taken
from the cohort name so it reads "the following cancers".

### "Up to" belongs on the total too

500 healthies ends *"Total Study Cost: Up to $600,000"*. A capped cohort — or a
capped extension count — now carries that prefix onto the total.

### The breakdown under the total is a choice, not a rule

Pan-cancer and MT2230 list every line under the total; Hodgkin's and 500
healthies state one figure; MT2234 breaks down on only two lines. There is no
rule to infer, so it is a checkbox — **"Break the total down by cost line"** —
defaulting to on above two lines. A total with no breakdown drops the "(Total)"
label, since nothing precedes it to total up.

### Conditions belong in their paragraph, not a list

§28 moved the conditions into the form section each one qualifies. These quotes
show the document does the same: Hodgkin's states *"Natera will not terminate
this study early…"* inside **Study Timeline** and the freight clause inside
**Shipping & Handling**. `condText(q, sec)` now folds each section's ticked
conditions into that section's paragraph, and only the clauses with no home
section (just "changes are mutually agreed") remain in a trailing block.

### The US-destination sentence printed twice

§27 auto-fills the ship-to box with *"Shipped to a US-based destination
designated by X."* — and the document printed it again above the address. It is
now only added when the address box does not already contain it.

### Still not reproducible, and left alone deliberately

- **Section labels vary between quotes** — "Summary" vs "Study Objectives",
  "Size" vs "Cohorts" vs "Populations and Size", "I/E Criteria" vs "Inclusions /
  Exclusions", "Timeline" vs "Study Timeline", and "No other inclusions or
  exclusions" vs "No additional…". The tool prints one label per row. Worth
  raising with John rather than guessing a rule.
- **Per-week collection caps.** §09 has "Maximum subjects delivered per day";
  500 healthies also caps 75/week for the first two weeks. It fits in free text
  today.

## §30 — Fourth-pass tidy-up of the specimen section, 2026-09-01

### Population note and types enrolled, removed from the extension form

§29 added them so MT2234 extension #2's pooled population could be built. John's
call is that they do not belong on an extension that keeps its study design, so
both fields are gone and the document branch that read them has gone with them —
it was unreachable once nothing could set them.

**Consequence, for John to rule on:** MT2234's bulleted list of ten cancers can
no longer be captured. Its size line still reads "Cancer (up to 286 additional
subjects)" and the total still comes to $500,500, but the list of cancer types
is lost. On the full track the same list would go in the inclusion criteria,
which already print as bullets; the extension track has no I/E fields.

### "Provided by the sponsor" is part of the Biospecimens paragraph

The document printed it as a row of its own. Every real quote states it inside
Biospecimens — *"Natera will provide all Streck tubes / collection kits."*,
*"All Streck tubes will be provided by Natera (PaxGene tubes will be provided by
MT Group)."* The form field stays where it is, in §05; only the output moved.
The sentence is composed from the sponsor name plus what the rep typed.

### No processing protocol for unprocessed specimens

Whole blood is delivered as drawn, so asking for a processing protocol document
is a question with no answer. `isProcessed(type)` is true when a specimen is
worked up (`process`) or split into aliquots (`aliquoted`); the field appears
only when something selected qualifies, and repaints as the selection changes —
ticking plasma brings it back, unticking takes it away.

By that rule the field is hidden for whole blood, fresh bone marrow aspirate,
slides, and the freeform "other" types; it shows for tissue, FFPE, all the
aliquoted blood products, urine, saliva, swabs, stool and synovial fluid.

### Tube type and size are lists

Free text on a field with a dozen real answers. `TUBE_TYPES` is Streck, K2EDTA,
EDTA, PaxGene DNA, PaxGene RNA, sodium and lithium heparin, ACD, SST, CPT and
Tempus — the first three plus PaxGene DNA are the ones the real quotes name.
`TUBE_SIZES` runs 2.5 mL to 10 mL.

`pickOrType()` is the shared control: a dropdown that turns into a text box when
"Other" is chosen, so the list covers the common case without becoming a cage.
Each tube block keeps its own type and size, which is what MT2230 extension #1
needs — 2 x 10 mL Streck **and** 2 x 2.5 mL PaxGene DNA on one collection.

## §31 — Fifth-pass rep review, 2026-09-01

Thirteen items. The three condition removals and the two pricing changes take
more out of the form than they put in: 114 controls down to 111.

### Cohorts and specimens

**"Up to" is per cohort** (item 1). It was one tick for the whole extension;
one cohort can be capped while another is exact. The box now sits between the
cohort name and its count, and the document reads each cohort's own flag again.

**Fresh tissue is specified by weight** (item 2). `MASS` was "Minimum size or
weight … e.g. 100 mg, or 0.5 cm³"; it is now "Minimum weight … e.g. 100 mg".
Nobody quotes tissue by volume.

### Three conditions retired (items 3, 7, 10)

Site draw limit per visit, invoiced on samples actually delivered, and changes
are mutually agreed. All three are rare enough to belong in the notes box rather
than as standing checkboxes. Eight remain, every one of them with a home
section — so **§12's conditions block is gone entirely**, as are the document's
"Collection conditions" and "Pricing conditions" rows and the trailing
unplaced-clause block. `conditionsFor()` now returns null for a section with
nothing left, so its call sites go through `appendIf()`.

### Extension pricing (items 4, 5, 6)

The modes are **"Same biospecimen pricing for all cohorts"** and **"Different
biospecimen pricing per cohort"** — naming what is priced, not just how.

"Same pricing" used to be one box, *Biospecimens & data ($ per subject)*. It is
now a rate **per biospecimen**, applied to every cohort
(`pricing.flatSpecimenPrices[type]`), with the carried-over parent rate seeding
the first type. `extFlatRate()` sums them for the form and the document alike.

That box was also the only place in the tool that said "biospecimens & data".
Every biospecimen price includes its initial data, so the phrase is gone and the
hint says so once.

### Shipping cost builder restored on extensions (item 8)

§28 hid the legs, rates, markup and internal-cost calc on an extension, on the
grounds that the original quote had settled them. In use that was wrong — the
rep still has to work out what shipping costs before naming a price — so the
whole build-up is back, and the per-subject field reads as an override again
because there is once more a calculated figure behind it. **This reverses §28's
item 2; the newer instruction wins.**

### Summary wording (item 9)

*"This study is an extension to **the** MT2222 **study** that was quoted
under…"*

### The document (items 11, 12, 13)

**Single-spaced** (item 11). Rows had 4px of padding each, which read as loose
6-point spacing throughout. Padding is now zero, the line height is 1.45, and
`.draft-row + .draft-row` carries a `1.45em` top margin — one blank line between
sections, none inside them. Every other gap in the document is expressed in the
same `1.45em` unit so the rhythm holds.

**Handling temperature moved to Shipping & Handling** (item 12). "Shipped on dry
ice" was appended to each biospecimen; it is a shipping statement. The document
now groups the specimens by handling temperature and states them there —
*"Whole blood shipped ambient on gel packs. Plasma shipped on dry ice."*

**The breakdown toggle moved to §12** (item 13). It is a presentation choice, so
it sits with payment terms and notes rather than in pricing.

## §32 — Sixth-pass rep review, 2026-09-01

### The cohort name box emptied as you typed it (item 2)

`cleanCohortName()` strips a numbering prefix, because the document adds one.
It was running on **every keystroke**, so typing "Cohort…" cleared the box
letter by letter — the rep could never get past the word. It now runs on blur,
once the word is finished, on both the full and the extension track.

The regex was also too eager: `^\s*cohort\s*\d*\s*[:.–-]?\s*` matched the bare
word, so "Cohort of healthy donors" became "of healthy donors". It now requires
a real prefix — a number ("Cohort 2: x", "Cohort 1 x") or a separator
("Cohort: x") — and leaves a description that merely opens with the word alone.

**Fifth site of the repaint-during-typing family, and a new variant: it is not
only repainting that eats input — transforming the value on every keystroke does
the same.**

### Form (items 1, 3, 5, 11, 12)

- **"+ Add cohort" sits above the total**, inside the table, where the row it
  adds will appear.
- **Slides** comes off the tissue list; the free-text "other" boxes carry it
  with a price of their own. A **second "Other"** is added for a study needing
  two unlisted things at once.
- **"Provided by the sponsor"** now appears only when something selected is
  collected into a tube or a kit (`needsCollectionKit`). Tissue and FFPE come
  from theatre and the block archive; there is nothing to send.
- **Processing protocol** loses `process` on Fresh tissue and FFPE, so it is
  hidden for both.
- **Screenfails** are hidden when everything selected is `archival` (FFPE,
  slides) — an archive pull screens nobody — and the flag is cleared so a
  stale rate cannot survive in the total.

Both blocks live in containers repainted by the specimen selection. Gating a
field on `orderedSpecimens()` at build time only works until the rep ticks
something; three fields were caught by that in this pass alone.

### FFPE is priced per block (item 4)

The per-cohort table gains a fourth column when a `blocks` specimen is selected:
**Cohort | Subjects | Blocks / subject | $ per block | Subtotal**. Blocks per
subject is read from §05 rather than retyped, seeds `pricing.cohortPer` and sets
the unit to "block". 40 subjects × 2 blocks × $300 = $24,000. The §05 amount
field now calls `pricingRefresh()` so the column follows it.

### Extension shipping build-up removed again (item 6)

**This re-reverses §31's item 8, which had reverted §28.** The position is now
settled: an extension quotes a shipping figure and does not rebuild the cost
behind it, because the override field is the price. If it moves a third time,
the deciding question is whether the rep works out shipping cost inside an
extension or carries it over from the parent.

### Document (items 7, 8, 9, 10)

- **"Net 30 days"** capitalised.
- **The header block is one group.** Requestor, client, quote date and quote
  number sit on consecutive lines, as the quotes print them; the blank line is
  saved for between sections (`.draft-tight`).
- **Acronyms keep their capitals in prose.** `specimenProse()` lowercases a
  specimen name to sit in a sentence unless it is all-caps — "ffpe" read as a
  typo. Applied at all nine prose sites.
- **The total breakdown reads "$618,750 (Cancer)"** with a single space.
  `.draft-amt` had a 96px minimum width, which set the descriptor across a tab
  stop.
- A bare count now carries its noun: "FFPE — 2" is meaningless, so specs whose
  amount is a number gain `amountReads` ("blocks per subject", "swabs per
  subject") and it prints as "FFPE — 2 blocks per subject".

## §33 — Seventh-pass rep review, 2026-09-01

### Data entry, third report — fixed and now guarded by a sweep

Two more fields dropped everything after the first keystroke:

- **A shipping leg's count and rate** called `refresh()`, which repaints the
  legs. Each row now updates its own "our cost" cell through `refreshDerived()`,
  which does the totals without touching the leg rows. The list is repainted
  only when a leg is added or removed.
- **"Tubes per subject"** repainted the whole specimen card to add tube blocks,
  taking its own input with it. The blocks live in their own container now.

Three reports of the same class of bug is a process failure, not three
coincidences. There is now **`sweep.js`**: it types a multi-character value into
**every** text input the form offers, across a prospective quote, a
retrospective quote and a minimal extension — 116 inputs — re-querying the list
before each field so a repaint caused by one cannot be blamed on the next. It
reports any field that does not hold what was typed. It found both faults above
and now passes clean. **Run it after any change that touches a paint function.**

### Retrospective quotes stop asking prospective questions

A retrospective pull collects nothing, so: **no collection protocol document**
(§03), **no collection timepoints section** at all, and the specimens that must
come from a live subject are simply **not listed** — the notice explaining what
had been removed was itself the clutter.

**Sponsor-selected cases removes the cohort cards entirely.** With the cases
already chosen there is no population to describe and nothing to count; §03
shows only the case list or the document naming it.

### Conditions

Two more retired: **"subjects may have been collected before"** (redundant) and
**"diagnosis may be confirmed after enrollment"** (rare enough for the notes
box). Six remain.

Clauses can now be limited by context, and one that cannot apply is not offered:

- `prospectiveOnly` — hidden on a retrospective-only quote.
- `bloodOnly` — hidden unless a blood product is selected.

**"Subjects may enroll in another study"** is now *"Subjects may be enrolled in
another {S} study."* — naming the sponsor and reading as something done to the
subject. **"Subjects may be drawn more than once"** moved from §04 to §05, is
prospective- and blood-only, and reads *"Subjects may be drawn more than once to
meet the blood volume requirements."*

### Pricing and shipping

- **The outcome / follow-up data fee** appears in §11 as soon as the box is
  ticked in §07. It was decided when §11 was built, so ticking it later left
  nowhere to price it.
- **The shipping legs block is named** "Shipping pricing — MT Group's internal
  shipping cost estimates".
- **The shipping price is a proposal, not a fixed figure.** The box comes
  pre-filled with what the legs work out to (cost × markup) and the rep types
  over it. It was a placeholder before, which read as "empty box beside a number
  you cannot change".

### The preview will not open on an unfinished quote

`missingForQuote()` lists what is still needed and the preview shows that
instead of a document: the client and a service type (§01), at least one
biospecimen, a cohort with a description and a count, and a price. Cohorts and
counts are skipped when the sponsor has picked the cases, since there is no
population to count. Anything a real quote could legitimately omit is not on the
list.

### A caution recorded

Removing the three conditions by cutting from `{ id: '…',` to the next `' },`
silently ate the closing `];` and five constants that followed
(`STATUSES`, `PRICE_UNITS`, `CRITERIA_HINT`, `SERVICE_TYPES`, `TUBE_TYPES`,
`TUBE_SIZES`). `node --check` passed — they were only missing declarations, not
a syntax error — and the failure showed up as `STATUSES is not defined` at
runtime. **A structural edit needs a page load, not just a syntax check.**

## §34 — Eighth-pass rep review, 2026-09-01

The biggest structural change since the document rewrite: pricing and shipping
both collapse to one table each. 109 controls down to 101.

### Pricing is one table (item 17)

The choice between "price per cohort" and "price per specimen type" is gone.
Every cohort now lists the biospecimens it collects, each with its own **unit**,
**units per subject** and **price per unit**:

| Biospecimen | Unit | Units / subject | $ per unit | Subtotal |

That covers every shape the real quotes take — $1,650 a subject, $2,000 a stool
with two stools each, $1,250 a draw — without asking which mode the rep is in.
`pricing.lines[cohort][type] = { unit, per, price }` replaces `cohortPrices`,
`cohortUnits`, `cohortPer` and `specimenPrices`, and the five seeded quotes are
migrated to it. `cohortLineTotal()` is the one piece of arithmetic, shared by
the form, the document and the extension carry-over.

A block-counted specimen still fills its own "units per subject" from §05.

### Shipping is one table (items 10–16)

- **"Quote per subject" is "Quote per biospecimen"**, with a rate for each type
  and a column showing **how many there are to ship** — 25 subjects giving two
  stools each ships 50. `specimenUnitCount()` counts them, including shipped
  screenfails.
- The per-leg **international toggle** and the **"adjust the standard rates and
  markup"** block are gone. A leg's rate is whatever is typed on it.
- The internal cost is stated; **the 2× markup line is not**. The price box is
  still pre-filled with twice cost, but the document no longer explains where
  that came from, because the rep can change it.
- **"Shipping price"**, not "override the shipping price", and sized for a
  figure rather than the full width.
- The block is headed **"How is shipping quoted"**.

### Sponsor-selected cases (items 3, 4)

With the cases already chosen, §05 is not a set of types to describe but a list
of IDs. It becomes a table — **Specimen ID | What it is | Detail** — with the
type from a short list (FFPE, plasma aliquot, buffy coat aliquot, PBMC aliquot,
other) and a "what kind" box appearing under any row set to *other*. The list
counts itself, and so does the pasted case list in §03.

### Timeline (items 5–8)

- The kickoff trigger is pre-filled with **"Scheduled ~1 week after receipt of
  PO"**.
- **Biospecimen delivery** and **clinical data delivery** are separate boxes;
  they run on different clocks.
- The receiving caps — **per day and now per week** — appear only on a
  prospective collection of fresh tissue, whole blood or urine
  (`collectsFresh`).
- **"Blackout delivery days"**.

### Conditions (item 9)

No early termination, sponsor may halt, and enrollment updates are removed.
Three remain: freight, cross-enrollment and repeat draws. §09 has none.

### Hints (item 2)

Ten hints that restated the label or the placeholder are gone, along with
"subject counts come from the cohorts below" and "the count above comes from
§03". A hint now earns its place by saying something the control does not.

### FFPE and tissue (item 1)

Confirmed already correct after §32: FFPE asks only for blocks per subject, and
the three tissue types ask for a minimum weight and nothing else.
