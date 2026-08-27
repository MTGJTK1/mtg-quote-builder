# MT number extraction — for review

**Nothing has been written to HubSpot.** This is a proposal for you to check.
Every MT number below was read out of the deal name; the field
`mt_study_id_number` is empty on all 2,843 deals.

Work through `mt_number_review.csv` alongside this note. Put your answer in the
**your_decision** column — that column is what I will write back, and only after
you say go.

## What came out

| | Deals | What it means |
|---|---|---|
| **OK** | 611 | One MT number, cleanly written, nothing odd. Safe to write. |
| **CHECK** | 232 | A number I am confident of, with something worth a glance. |
| **DECIDE** | 28 | I will not guess. Listed in full below. |
| **ASSIGN** | 68 | A **won** study with no MT number in its name. Needs one typed in. |
| **NO NUMBER** | 1,904 | No MT number, and not a won deal. Nothing to write. |
| | **2,843** | |

The headline: **836 of your 904 won deals already carry an MT number in the
name** — 92%. The 1,904 blanks are overwhelmingly deals that never became
studies, so they are correctly empty. The real manual work is 68 rows.

## CHECK — the 232 I would write anyway

| Reason | Deals |
|---|---|
| A known umbrella number (MT9920, MT9923, MT0893, MT0892, MT9925) | 203 |
| The number is not inside parentheses | 33 |
| A space between MT and the digits (`MT 0472`) | 2 |
| Written as `MT#1879` | 1 |

None of these change the number I read. They are flagged so you can confirm the
umbrella list is right and complete — you said there were "a few" beyond
MT9920, and those four are what the deal names show. If there are others,
tell me and I will re-run.

Worth knowing: **MT0424 is the only number used by two different sponsors**
(MRK and TRB) that is not on your umbrella list. Every other number in the
portal belongs to exactly one sponsor. That is a strong sign the rule is real
and MT0424 is a slip.

## DECIDE — 28 deals

### The MT0424 collision (10 deals)

Ten deals share MT0424 across two sponsors. Either it is a sixth umbrella
number, or one sponsor's deals were mis-numbered. I cannot tell from the names.

| Deal name | Sponsor | In HubSpot |
|---|---|---|
| MRK: Healthy skin - tissue  (MT0424 extension #6) | MRK | [open](https://app.hubspot.com/contacts/7423331/record/0-3/44081327894) |
| MRK: Normal - skin & blood (MT0424 extension #1) | MRK | [open](https://app.hubspot.com/contacts/7423331/record/0-3/8155560275) |
| MRK: Normal - skin & blood (MT0424 extension #2) | MRK | [open](https://app.hubspot.com/contacts/7423331/record/0-3/8445283954) |
| MRK: Normal - skin & blood (MT0424) | MRK | [open](https://app.hubspot.com/contacts/7423331/record/0-3/1903541733) |
| MRK: normal skin - tissue (MT0424 extension #1) | MRK | [open](https://app.hubspot.com/contacts/7423331/record/0-3/12652207245) |
| MRK: normal skin - tissue (MT0424 extension #4) | MRK | [open](https://app.hubspot.com/contacts/7423331/record/0-3/16506130727) |
| MRK: normal skin - tissue (MT0424 extension #5) | MRK | [open](https://app.hubspot.com/contacts/7423331/record/0-3/20410275093) |
| MRK: Normal skin - tissue (MT0424 extension #6) | MRK | [open](https://app.hubspot.com/contacts/7423331/record/0-3/44214833849) |
| MRK: normal skin - tissue (MT0424 extension #7) | MRK | [open](https://app.hubspot.com/contacts/7423331/record/0-3/60142043466) |
| TRB: 1-2g healthy trunk / face skin - tissue (MT0424 extension #1) | TRB | [open](https://app.hubspot.com/contacts/7423331/record/0-3/9325427625) |
| TRB: 1-2g healthy trunk / face skin - tissue (MT0424) | TRB | [open](https://app.hubspot.com/contacts/7423331/record/0-3/6310483299) |

### The other 18

Where I can see a defensible answer I have put it in **Suggested**; accept it by
copying it into `your_decision`, or overwrite it. A dash means I have no basis
for a guess.

| Deal name | Suggested | Why I stopped | In HubSpot |
|---|---|---|---|
| AKS: Prurigo Nodularis and healthy - skin biopsies MT0619 (previously MT0624 extension #2) (SEE NOTE) | MT0619 | names two different MT numbers: MT0619, MT0624 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/17435686707) |
| AMG: Colorectal cancer - fresh tissue, NAT, serum (MT9920 / MT7806) | MT7806 | names two different MT numbers: MT7806, MT9920 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/35801232926) |
| AMG: PDAC - fresh tumor tissue, NAT, whole blood to ABC (MT9920 / MT8373) | MT8373 | names two different MT numbers: MT8373, MT9920 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/39867122083) |
| ASB: Breast cancer metastatic to lung, liver, and brain - FFPE (MT6180 / MT6155) | — | names two different MT numbers: MT6155, MT6180 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/7481251637) |
| BMS: MT4095 & MT4087 call backs - blood | — | names two different MT numbers: MT4087, MT4095 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/16975861376) |
| BMS: Normal - Plasma (Healthy Subjects for MT4052) | — | the MT number is a cross-reference to a different study (“for MT4052”) | [open](https://app.hubspot.com/contacts/7423331/record/0-3/44576832783) |
| BMS: PDAC - tumor & blood (MTXNEW) | — | placeholder text sits where the MT number should be | [open](https://app.hubspot.com/contacts/7423331/record/0-3/2298787671) |
| BMS: Solid tumors - whole blood (MTXNEW) | — | placeholder text sits where the MT number should be | [open](https://app.hubspot.com/contacts/7423331/record/0-3/2265476724) |
| BMS: Various cancers - whole blood (MT4039/ MT9920) | MT4039 | names two different MT numbers: MT4039, MT9920 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/18245958745) |
| EXS: MT7026 & MT7045 FFPE screenfails - plasma & buffy coat (MT7045-EX2501) | MT7045-EX2501 | names two different MT numbers: MT7026, MT7045 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/32406302331) |
| GHI: Panc, melanoma, gastric, H&N SCC - tissue & plasma (MT1813/MT1875) | — | names two different MT numbers: MT1813, MT1875 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/6622930244) |
| MRK: Atopic derm & normal biopsies - tissue (MT0465 change order #1) | — | a change order rather than an extension | [open](https://app.hubspot.com/contacts/7423331/record/0-3/63027387258) |
| MRK: Gastric - tumor & blood (MT WHAT IS IT) | — | placeholder text sits where the MT number should be | [open](https://app.hubspot.com/contacts/7423331/record/0-3/1985215621) |
| MRK: Hidradenitis suppurativa biopsies & normal resection skin - tissue & serum (MT9920 and MT0467) | MT0467 | names two different MT numbers: MT0467, MT9920 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/59503362190) |
| NTA: Healthy geographically matched to MT2242 and MT2234 - blood (MT2228) | MT2228 | names two different MT numbers: MT2228, MT2234, MT2242 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/57668747105) |
| RCH: NAT - FFPE (Extension of MT2115 and MT5222) | — | names two different MT numbers: MT2115, MT5222 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/6885308738) |
| SVA: Subject MT0291—099 – Plasma (MT2355) | MT2355 | names two different MT numbers: MT0291, MT2355 | [open](https://app.hubspot.com/contacts/7423331/record/0-3/11604553282) |

Three of those are placeholders that were never filled in — `(MTXNEW)` twice and
`(MT WHAT IS IT)` once. Those studies presumably got real numbers somewhere;
the deal name never caught up.

## ASSIGN — 68 won studies with no number

These are real, won studies whose names carry no MT number. They are the actual
manual work in this exercise. They are in the CSV with confidence `ASSIGN`,
oldest first; the number will have to come from the quote or the PO rather than
from HubSpot.

## The rules I applied

- **The MT number is the study key.** A coded suffix is part of the key
  (`MT9923-EX2602`, `MT0893-GR2501`, `MT1801-B` — 40 deals), because those
  banked numbers carry many unrelated studies underneath them.
- **A prose extension is not.** `MT2875 extension #1` is study MT2875, and the
  extension number is recorded in its own column. 121 deals.
- **Umbrella numbers stay shared.** MT9920 and the four others are not errors
  and must not be de-duplicated.
- **A cross-reference is not this deal's number.** `Healthy Subjects for MT4052`
  names a different study; that deal gets nothing rather than a wrong number.
  This one case is exactly why I did not do a bulk write.

## What happens next

1. You work the CSV — the 28 DECIDE rows first, then the 68 ASSIGN rows.
2. Send it back.
3. I write `mt_study_id_number` in batches, starting with the 611 OK rows so
   you can spot-check a small batch before the rest goes in.
4. The write needs a second, temporary HubSpot key with
   `crm.objects.deals.write`. Delete it once the backfill is done — the
   permanent key stays read-only.

Once the field is populated, the quote builder can look up an MT number and
pull the sponsor, deal name and population fields without the rep re-typing
them. That is the whole point of the exercise.
