#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STEMS = [
    "concept-05-directory-take-1", "concept-06-directory-take-2",
    "concept-07-compendium-workspace", "concept-08-directory-take-3",
    "concept-09-tome-tabs", "concept-10-command-suite",
    "concept-11-tabbed-organizer",
]
EVIDENCE = [
    "impact-register.json", "manager-coverage.json", "candidate-command-delta.json",
    "candidate-wiring-delta.json", "candidate-dry-delta.json", "plan-owner-delta.md",
    "search-route-matrix.json", "manager-route-matrix.json", "test-evidence.json",
]
REPORTS = [
    "reference-review-report.json", "REFERENCE_REVIEW_2026-08-18.json",
    "SEVEN_NEW_CONCEPTS_TEST_REPORT.md", "SEVEN_NEW_CONCEPTS_FINDINGS.md",
    "SEVEN_NEW_CONCEPTS_IMPACT_REGISTER.json", "SEVEN_NEW_CONCEPTS_AUDIT_REPORT.md",
    "SEVEN_NEW_CONCEPTS_AUDIT_REPORT.json", "SEVEN_NEW_CONCEPTS_VISUAL_AUDIT.json",
]

def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()

failures=[]
for stem in STEMS:
    html=ROOT/f"{stem}.html"
    if not html.exists(): failures.append(f"missing {html.name}"); continue
    text=html.read_text(errors="replace")
    if '<iframe' in text.lower(): failures.append(f"iframe in {html.name}")
    if re.search(r'(?:href|src)=["\'][^"\']*concept-0[1-4]', text, re.I): failures.append(f"cross frozen link in {html.name}")
    if 'data-concept-model="5.6 Sol"' not in text: failures.append(f"model attribution in {html.name}")
    for name in EVIDENCE:
        if not (ROOT/stem/name).exists(): failures.append(f"missing {stem}/{name}")
    for p in [ROOT/stem/f"{stem}.js", ROOT/stem/f"{stem}.css"]:
        if not p.exists(): failures.append(f"missing {p.relative_to(ROOT)}")
for name in REPORTS:
    if not (ROOT/name).exists(): failures.append(f"missing report {name}")

# JSON parse.
for p in ROOT.rglob('*.json'):
    try: json.loads(p.read_text(encoding='utf-8'))
    except Exception as exc: failures.append(f"invalid JSON {p.relative_to(ROOT)}: {exc}")

# Frozen hashes.
baseline=json.loads((ROOT/'_seven/frozen-baseline.json').read_text())['hashes']
for rel, expected in baseline.items():
    p=ROOT/rel
    if not p.exists(): failures.append(f"frozen missing {rel}")
    elif sha(p)!=expected: failures.append(f"frozen mismatch {rel}")

# Inventory snapshot byte identity.
repo=ROOT.parents[2]
canonical=repo/'Plans/settings_inventory.json'
snapshot=ROOT/'_seven/data/settings-inventory-snapshot.json'
if canonical.exists() and snapshot.read_bytes()!=canonical.read_bytes(): failures.append('inventory snapshot differs from Plans/settings_inventory.json')

# Visible source scans.
visible=[]
for stem in STEMS:
    visible += [ROOT/f'{stem}.html', ROOT/stem/f'{stem}.js', ROOT/stem/f'{stem}.css']
visible += [ROOT/'_seven/lib/pmv2.js', ROOT/'_seven/lib/pm-shell.js', ROOT/'_seven/lib/pm-bridge.js', ROOT/'_seven/css/pm-shell.css', ROOT/'_seven/css/pm-themes.css', ROOT/'_seven/css/chrome.css']
all_text='\n'.join(p.read_text(errors='replace') for p in visible if p.exists())
if 'CursorAuto' in all_text: failures.append('foreign model attribution remains')
if 'shared/v2' in all_text: failures.append('foreign shared renderer path remains')
forbidden={
    'concept-09-tome-tabs': ['steampunk','parchment','brass','gears','sepia'],
    'concept-10-command-suite': ['terminal green','terminal-green','crt','fake shell','fake-shell'],
    'concept-11-tabbed-organizer': ['binder','staples','parchment','office-supply'],
}
for stem, words in forbidden.items():
    t='\n'.join([
        (ROOT/f'{stem}.html').read_text(errors='replace'),
        (ROOT/stem/f'{stem}.css').read_text(errors='replace'),
        (ROOT/stem/f'{stem}.js').read_text(errors='replace'),
    ]).lower()
    for word in words:
        # The implementation should not use these as visual classes/copy. Evidence reports are excluded.
        if word in t: failures.append(f"forbidden visual token {word!r} in {stem}")

# Candidate summary consistency.
for stem in STEMS:
    d=json.loads((ROOT/stem/'candidate-command-delta.json').read_text())
    detailed={x['candidate_id'] for x in d.get('entries',[]) if x.get('census')=='new-candidate'}
    if set(d.get('new_candidates',[]))!=detailed: failures.append(f"new_candidates mismatch in {stem}")

# JS syntax.
js=[ROOT/'_seven/lib/pmv2.js', ROOT/'_seven/lib/pm-shell.js', ROOT/'_seven/lib/pm-bridge.js', ROOT/'_seven/lib/pm-motion-director.js']+[ROOT/stem/f'{stem}.js' for stem in STEMS]
for p in js:
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if r.returncode: failures.append(f"node --check failed {p.relative_to(ROOT)}: {r.stderr.strip()}")

report={
    'schema_id':'pm.settings_seven_new_concepts_static_validation.v1',
    'model_folder':str(ROOT),
    'status':'fail' if failures else 'pass',
    'checks':{
        'concepts':len(STEMS), 'evidence_files_per_concept':len(EVIDENCE),
        'frozen_files':len(baseline), 'json_files':len(list(ROOT.rglob('*.json'))),
        'javascript_files_checked':len(js),
    },
    'failures':failures,
}
print(json.dumps(report,indent=2))
sys.exit(1 if failures else 0)
