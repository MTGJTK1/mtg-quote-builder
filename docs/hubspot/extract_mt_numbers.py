# -*- coding: utf-8 -*-
"""Propose an MT study number for each HubSpot deal, from the deal name.

Read-only. Produces a review file for John to rule on. Writes nothing to HubSpot.
"""
import json, re, csv, unicodedata
from collections import Counter, defaultdict

URL = "https://app.hubspot.com/contacts/7423331/record/0-3/{}"
# Numbers John has confirmed, or spec 7 measured, as shared across sponsors by
# design rather than by mistake. MT9920 covers all fresh tumour orders.
UMBRELLA = {"MT9920", "MT9923", "MT0893", "MT0892", "MT9925"}
WON_NO_MT = set(open('/tmp/won_no_mt.txt').read().split())

deals = json.load(open('/tmp/deals_by_id.json'))

TOKEN        = re.compile(r'\bMT\s*#?\s*(\d{3,4})\b', re.I)
CODED        = re.compile(r'\bMT\s*#?\s*(\d{3,4})\s*-\s*([A-Z]{2}\d{3,4})\b', re.I)
LETTER       = re.compile(r'\bMT\s*#?\s*(\d{3,4})-([A-Z])\b')
EXT_NUMBERED = re.compile(r'\bext(?:ension)?\.?\s*#?\s*(\d+)\b', re.I)
EXT_ORDINAL  = re.compile(r'\b(\d+)(?:st|nd|rd|th)\s+extension\b', re.I)
EXT_WORD     = re.compile(r'\bextension\b', re.I)
CALLBACK     = re.compile(r'\bcall\s*backs?\b', re.I)
CHANGE_ORDER = re.compile(r'\bchange\s*order\s*#?\s*(\d+)?', re.I)
FOREIGN_REF  = re.compile(r'\b(?:for|from|under|per|see|same as)\s+MT\s*#?\s*\d{3,4}\b', re.I)
PLACEHOLDER  = re.compile(r'\bMT\s*(?:X\s*NEW|XNEW|TBD|WHAT\s+IS\s+IT)\b', re.I)
HASH_FORM    = re.compile(r'\bMT\s*#\s*\d', re.I)
SPACE_FORM   = re.compile(r'\bMT\s+\d')

def norm(s):
    return unicodedata.normalize('NFKC', s or '').replace('’', "'").strip()

def sponsor_of(name):
    m = re.match(r'\s*([A-Z0-9&]{2,4})\s*[:\-]', name)
    return m.group(1) if m else ''

rows = []
for did, raw in deals.items():
    name  = norm(raw)
    notes, conf, proposed, suffix, ext = [], None, '', '', ''

    tokens   = TOKEN.findall(name)
    distinct = sorted(set(tokens))
    coded    = CODED.findall(name)
    letter   = LETTER.findall(name)
    foreign  = FOREIGN_REF.search(name)
    chg      = CHANGE_ORDER.search(name)

    if PLACEHOLDER.search(name):
        conf = 'DECIDE'; notes.append('placeholder text sits where the MT number should be')
    elif not tokens:
        conf = 'NO NUMBER'; notes.append('no MT number in the deal name')
    elif len(distinct) > 1:
        conf = 'DECIDE'
        notes.append('names two different MT numbers: ' + ', '.join('MT'+t for t in distinct))
    else:
        proposed = 'MT' + distinct[0]
        conf = 'OK'
        if coded:
            suffix = coded[0][1].upper()
            proposed = 'MT{}-{}'.format(coded[0][0], suffix)
        elif letter:
            suffix = letter[0][1]
            proposed = 'MT{}-{}'.format(letter[0][0], suffix)

    # extension / follow-on detection (does not change the base number)
    m = EXT_NUMBERED.search(name) or EXT_ORDINAL.search(name)
    if m:
        ext = m.group(1)
    is_followon = bool(m or EXT_WORD.search(name) or CALLBACK.search(name) or suffix)

    if foreign:
        conf = 'DECIDE'; proposed = ''
        notes.append("the MT number is a cross-reference to a different study "
                     "(“%s”)" % foreign.group(0).strip())
    if chg:
        conf = 'DECIDE'
        notes.append('a change order rather than an extension')
    if tokens and any(len(t) == 3 for t in distinct):
        conf = 'DECIDE'; notes.append('three-digit MT number, which is unusual')

    if proposed:
        quirk = False
        if HASH_FORM.search(name):
            notes.append('written as MT#nnnn'); quirk = True
        if SPACE_FORM.search(name):
            notes.append('a space sits between MT and the digits'); quirk = True
        if not re.search(r'\([^()]*MT', name, re.I):
            notes.append('the MT number is not inside parentheses'); quirk = True
        if proposed.split('-')[0] in UMBRELLA:
            notes.append('a known umbrella number, shared across sponsors on purpose')
            quirk = True
        if quirk and conf == 'OK':
            conf = 'CHECK'

    rows.append({
        'deal_id': did,
        'deal_name': raw,
        'sponsor': sponsor_of(name),
        'proposed_mt_number': proposed,
        'base_mt_number': proposed.split('-')[0] if proposed else '',
        'suffix': suffix,
        'is_extension_or_followon': 'yes' if is_followon else '',
        'extension_number': ext,
        'confidence': conf,
        'why_flagged': '; '.join(notes),
        'won_deal': '',
        'suggested_mt_number': '',
        'suggestion_basis': '',
        'your_decision': '',
        'hubspot_url': URL.format(did),
    })

# --- cross-sponsor collisions: the same base number used by different sponsors
bysponsor = defaultdict(set)
for r in rows:
    if r['base_mt_number'] and r['base_mt_number'] not in UMBRELLA:
        bysponsor[r['base_mt_number']].add(r['sponsor'])
collisions = {k for k, v in bysponsor.items() if len(v) > 1}
for r in rows:
    if r['base_mt_number'] in collisions:
        others = sorted(bysponsor[r['base_mt_number']] - {r['sponsor']})
        r['confidence'] = 'DECIDE'
        r['why_flagged'] = ('; '.join(filter(None, [
            r['why_flagged'],
            '%s is also used by %s — MT numbers should not cross sponsors'
            % (r['base_mt_number'], ', '.join(others))])))

for r in rows:
    if r['deal_id'] in WON_NO_MT:
        r['won_deal'] = 'yes'
        if r['confidence'] == 'NO NUMBER':
            r['confidence'] = 'ASSIGN'
            r['why_flagged'] = ('a won study with no MT number in its name — '
                                'needs one looked up and typed in')
    else:
        r['won_deal'] = ''

# ---------------------------------------------------------------------------
# Suggestions for the DECIDE rows. These are proposals for John to accept or
# reject in the your_decision column. Nothing here is applied automatically.
TRAILING = re.compile(r'\(\s*MT\s*#?\s*(\d{3,4})(?:\s*-\s*([A-Z]{2}\d{3,4}))?[^()]*\)\s*$', re.I)
SUBJECT_ID = re.compile(r'\bsubject\s+MT\s*#?\s*(\d{3,4})\s*[\u2014\u2013-]\s*\d+', re.I)
PREVIOUSLY = re.compile(r'\bpreviously\s+MT\s*#?\s*(\d{3,4})', re.I)
COMPARATOR = re.compile(r'\b(?:matched to|screenfails?|for)\b', re.I)

for r in rows:
    if r['confidence'] != 'DECIDE' or r['proposed_mt_number']:
        continue
    name = norm(r['deal_name'])
    found = sorted(set(TOKEN.findall(name)))
    sug, basis = '', ''

    if 'MT9920' in {'MT'+f for f in found} and len(found) == 2:
        other = [f for f in found if 'MT'+f != 'MT9920'][0]
        sug, basis = 'MT'+other, ("MT9920 is the umbrella for fresh tumour orders, so "
                                  "MT%s looks like this study's own number" % other)
    elif SUBJECT_ID.search(name):
        sid = SUBJECT_ID.search(name).group(1)
        rest = [f for f in found if f != sid]
        if len(rest) == 1:
            sug, basis = 'MT'+rest[0], ("MT%s appears as part of a subject ID, not a "
                                        "study number" % sid)
    elif PREVIOUSLY.search(name):
        old = PREVIOUSLY.search(name).group(1)
        rest = [f for f in found if f != old]
        if len(rest) == 1:
            sug, basis = 'MT'+rest[0], ("MT%s is named as the previous number" % old)
    elif COMPARATOR.search(name):
        m = TRAILING.search(name)
        if m:
            sug = 'MT'+m.group(1) + ('-'+m.group(2).upper() if m.group(2) else '')
            basis = ("the other numbers read as comparator studies; %s is the one in "
                     "the trailing parentheses" % sug)
    r['suggested_mt_number'] = sug
    r['suggestion_basis'] = basis

for r in rows:
    r.setdefault('suggested_mt_number', '')
    r.setdefault('suggestion_basis', '')

order = {'DECIDE': 0, 'ASSIGN': 1, 'CHECK': 2, 'NO NUMBER': 4, 'OK': 3}
rows.sort(key=lambda r: (order[r['confidence']], r['sponsor'], r['deal_name'].lower()))

out = '/home/user/mtg-quote-builder/docs/hubspot/mt_number_review.csv'
with open(out, 'w', newline='', encoding='utf-8-sig') as f:
    cols = ['deal_id','deal_name','sponsor','confidence','proposed_mt_number',
            'suggested_mt_number','your_decision','why_flagged','suggestion_basis',
            'base_mt_number','suffix','is_extension_or_followon','extension_number',
            'won_deal','hubspot_url']
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(rows)

json.dump(rows, open('/tmp/rows.json', 'w'))
c = Counter(r['confidence'] for r in rows)
print('total', len(rows), dict(c))
print('cross-sponsor collisions:', len(collisions), sorted(collisions))
print('OK that are extensions/follow-ons:', sum(1 for r in rows if r['confidence']=='OK' and r['is_extension_or_followon']))
print('OK on umbrella MT9920:', sum(1 for r in rows if r['confidence']=='OK' and r['base_mt_number']=='MT9920'))
print('distinct base numbers proposed:', len({r['base_mt_number'] for r in rows if r['base_mt_number']}))
