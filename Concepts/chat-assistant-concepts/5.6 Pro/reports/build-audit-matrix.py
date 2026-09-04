#!/usr/bin/env python3
"""Render reports/AUDIT_MATRIX.md from reports/independent-audit-v5.json.

Nothing here decides a verdict. Every row comes from the JSON the harness
wrote, so the matrix cannot say something the probes did not.
"""
import json, pathlib, collections, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'reports' / 'independent-audit-v5.json'
OUT = ROOT / 'reports' / 'AUDIT_MATRIX.md'

d = json.loads(SRC.read_text(encoding='utf-8'))
reqs = d['requirements']

FAMILY_DOC = {
    'AUTH': 'v2 · Authority and preservation', 'COMPOSER': 'v2 · Composer persistence and targeting',
    'ATT': 'v2 · Attachments, files and artifacts', 'TITLE': 'v2 · Thread title and spellcheck',
    'GOAL': 'v2 · Simplified Goal Runtime', 'PLAN': 'v2 · Regular Assistant Plan',
    'DPLAN': 'v2 · Deep Plan', 'TODO': 'v2 · To-Do Runtime',
    'COLLAB': 'v2 · Shared collaborative workflows', 'CREW': 'v2 · Crew and Crew Auto',
    'BRAIN': 'v2 · BrainStorm', 'REVIEW': 'v2 · Review and Multi-Pass Review',
    'ROOM': 'v2 · Chat Room', 'WONDER': 'v2 · Wonderer and Grill Me',
    'BSD': 'v2 · Back Seat Driver', 'BROWSER': 'v2 · Browser capture and DevTools',
    'SCHED': 'v2 · Scheduling and quota resume', 'FEATURE': 'v2 · Teach/Teacher/memory/Debug/ELI5/Revert/Lens',
    'PROVIDER': 'v2 · Provider control', 'GUI': 'v2 · Concept and GUI integration',
    'DRY': 'v2 · DRY, commands, wiring and proof',
    'QMAX': 'v4 · Question budget and Grill Me', 'PPROG': 'v4 · Real-time Plan progress',
    'PFAIL': 'v4 · Plan failure and recovery', 'PDET': 'v4 · Plan details, storage, embeds',
    'PGOAL': 'v4 · Build as Goal', 'PSCHED': 'v4 · Scheduled Plan build topology',
    'GREPLAY': 'v4 · Simple Goal replay and completion', 'MODAL': 'v4 · Workflow modal transaction boundary',
    'PART': 'v4 · Participant outcomes and quorum', 'SMSG': 'v4 · Scheduled message projection',
    'BSTALE': 'v4 · Browser component currentness', 'FOLDER': 'v4 · Folder attachment command',
    'TDG': 'v4 · To-Do graph and replacement', 'WONV': 'v4 · Wonderer convergence boundary',
    'CONCEPT': 'v4 · 5.6 Pro concept correction', 'CDRY': 'v4 · Commands, wiring, DRY, migration, proof',
}
MARK = {'pass': 'pass', 'failed': '**failed**', 'blocked': 'blocked',
        'not_implemented': '**not implemented**', 'superseded': 'superseded'}

fam = collections.defaultdict(list)
for r in reqs:
    fam[r['id'].split('-')[0]].append(r)

counts = collections.Counter(r['verdict'] for r in reqs)
v2fams = [f for f in fam if FAMILY_DOC.get(f, '').startswith('v2')]
v4fams = [f for f in fam if FAMILY_DOC.get(f, '').startswith('v4')]
v2n = sum(len(fam[f]) for f in v2fams)
v4n = sum(len(fam[f]) for f in v4fams)


def esc(x):
    return str(x).replace('|', '\\|').replace('\n', ' ')


def short(ev, n=210):
    s = json.dumps(ev, ensure_ascii=False) if not isinstance(ev, str) else ev
    return esc(s[:n] + ('…' if len(s) > n else ''))


lines = []
lines.append('# Independent audit matrix — Puppet Master Assistant')
lines.append('')
lines.append(f"Generated {d['generated']} by `tests/independent-audit-v5.mjs`. "
             f"{len(reqs)} requirements: {v2n} from the implemented v2 packet and {v4n} from "
             '`PM_Assistant_v2_Additive_Correction_v4`.')
lines.append('')
lines.append('## Method, and what a verdict is worth')
lines.append('')
lines.append('Every row below was decided by a probe that drove the built page in a real browser '
             'and read the resulting state or rendered DOM. No prior report, delivery manifest, '
             'screenshot or fixture toast was an input to any verdict; `REPAIR_STATUS.md`, '
             '`DELIVERY_MANIFEST.json` and the packet\'s own test matrix were deliberately not read '
             'by the harness.')
lines.append('')
lines.append('| verdict | meaning |')
lines.append('|---|---|')
lines.append('| `pass` | the behaviour was driven and observed on this surface |')
lines.append('| `failed` | the behaviour was driven and the surface did not do it |')
lines.append('| `blocked` | closing it needs a native handler, storage engine, scheduler, provider adapter or branch census that does not exist in a `file://` concept. The blocker is stated per row and is never recorded as a pass |')
lines.append('| `superseded` | a v2 rule the correction explicitly retires. Recorded only with the replacing requirement AND proof that the new value is what the surface holds |')
lines.append('| `not implemented` | absent, with nothing standing in for it |')
lines.append('')
lines.append('## Totals')
lines.append('')
lines.append('| verdict | count |')
lines.append('|---|---:|')
for k in ['pass', 'failed', 'not_implemented', 'blocked', 'superseded']:
    if counts.get(k):
        lines.append(f'| {k.replace("_", " ")} | {counts[k]} |')
lines.append(f'| **total** | **{len(reqs)}** |')
lines.append('')
lines.append(f"Probes run: {d['probes_total']} "
             f"({', '.join(f'{k} {v}' for k, v in sorted(d['probe_counts'].items()))}). "
             f"Console errors during the whole run: {len(d['console_errors'])}.")
lines.append('')

lines.append('## Readiness, in three independent columns')
lines.append('')
lines.append('A concept pass closes the **concept** column only. It never closes the native column, '
             'and it never certifies the canonical `Plans/**` owner document.')
lines.append('')
lines.append('| column | what this audit establishes |')
lines.append('|---|---|')
lines.append(f'| canonical (`Plans/**`) | not established here. This audit inspects the concept implementation, not the owner documents. `python3 scripts/pm-plans-verify.py run-gates` owns that verdict. |')
lines.append(f'| concept (5.6 Pro) | {counts.get("pass", 0)} of {len(reqs)} requirements driven and observed; {counts.get("superseded", 0)} superseded with the replacement proven; {counts.get("failed", 0)} failed; {counts.get("not_implemented", 0)} not implemented. |')
lines.append(f'| native (Puppet Master runtime) | **nothing is closed.** {counts.get("blocked", 0)} requirements are blocked on native infrastructure and every other row is fixture-backed. Every `cmd.*` this concept names is `handler_unavailable`. |')
lines.append('')

lines.append('## Blocked rows, and the exact blocker')
lines.append('')
lines.append('| requirement | blocker |')
lines.append('|---|---|')
for r in sorted([r for r in reqs if r['verdict'] == 'blocked'], key=lambda x: x['id']):
    lines.append(f"| `{r['id']}` | {short(r['evidence'], 300)} |")
lines.append('')

sup = [r for r in reqs if r['verdict'] == 'superseded']
if sup:
    lines.append('## Superseded rows')
    lines.append('')
    lines.append('| v2 requirement | superseded by | proof the replacement is what the surface holds |')
    lines.append('|---|---|---|')
    for r in sorted(sup, key=lambda x: x['id']):
        lines.append(f"| `{r['id']}` | `{r.get('superseded_by')}` | {short(r['evidence'], 220)} |")
    lines.append('')

bad = [r for r in reqs if r['verdict'] in ('failed', 'not_implemented')]
lines.append('## Unclosed rows')
lines.append('')
if bad:
    lines.append('| requirement | verdict | evidence |')
    lines.append('|---|---|---|')
    for r in sorted(bad, key=lambda x: x['id']):
        lines.append(f"| `{r['id']}` | {MARK[r['verdict']]} | {short(r['evidence'], 300)} |")
else:
    lines.append('None. No requirement is `failed` or `not implemented`.')
lines.append('')

lines.append('## Full matrix')
lines.append('')
for f in sorted(fam, key=lambda x: (0 if FAMILY_DOC.get(x, '').startswith('v2') else 1, x)):
    c = collections.Counter(r['verdict'] for r in fam[f])
    lines.append(f"### {f} — {FAMILY_DOC.get(f, f)}")
    lines.append('')
    lines.append('  '.join(f'{k}: {v}' for k, v in sorted(c.items())))
    lines.append('')
    lines.append('| requirement | verdict | canonical | concept | native | evidence |')
    lines.append('|---|---|---|---|---|---|')
    for r in sorted(fam[f], key=lambda x: x['id']):
        rd = r.get('readiness') or {}
        lines.append(f"| `{r['id']}` | {MARK[r['verdict']]} | {esc(rd.get('canonical', '—'))} | "
                     f"{esc(rd.get('concept', '—'))} | {esc(rd.get('native', '—'))} | {short(r['evidence'])} |")
    lines.append('')

OUT.write_text('\n'.join(lines) + '\n', encoding='utf-8', newline='\r\n')
print(f'Wrote {OUT.relative_to(ROOT)} — {len(reqs)} requirements, {len(lines)} lines.')
