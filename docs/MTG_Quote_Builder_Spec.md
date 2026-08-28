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
