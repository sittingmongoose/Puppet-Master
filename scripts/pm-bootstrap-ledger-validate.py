#!/usr/bin/env python3
"""Minimal validator for PM Bootstrap Planning Ledger v2."""
from __future__ import annotations
import argparse, json, sys
from pathlib import Path

def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except Exception as e:
        raise SystemExit(f"INVALID JSON: {path}: {e}")

def load_jsonl(path: Path):
    rows=[]
    if not path.exists():
        raise SystemExit(f"MISSING: {path}")
    for i,line in enumerate(path.read_text(encoding='utf-8').splitlines(),1):
        if not line.strip():
            continue
        try:
            rows.append(json.loads(line))
        except Exception as e:
            raise SystemExit(f"INVALID JSONL: {path}:{i}: {e}")
    return rows

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('ledger_dir', help='Plans/ledgers/v2/<ledger_id>')
    args=ap.parse_args()
    d=Path(args.ledger_dir)
    errors=[]; warnings=[]
    required=[d/'manifest.json',d/'events.jsonl',d/'records/design_atoms.jsonl',d/'records/decisions.jsonl',d/'records/questions.jsonl',d/'records/blockers.jsonl',d/'state/current.json',d/'state/handoff.json',d/'state/open_items.json',d/'state/compile_queue.json',d/'state/operating_capsule.json']
    for p in required:
        if not p.exists(): errors.append(f"missing {p}")
    if errors:
        print(json.dumps({'status':'fail','errors':errors},indent=2)); return 1
    manifest=load_json(d/'manifest.json'); lid=manifest.get('ledger_id')
    events=load_jsonl(d/'events.jsonl'); atoms=load_jsonl(d/'records/design_atoms.jsonl'); decisions=load_jsonl(d/'records/decisions.jsonl')
    ids={}
    for kind, rows, field in [('event',events,'event_id'),('atom',atoms,'atom_id'),('decision',decisions,'decision_id')]:
        seen=set()
        for r in rows:
            if r.get('ledger_id') != lid: errors.append(f"{kind} wrong ledger_id: {r.get(field)}")
            rid=r.get(field)
            if not rid: errors.append(f"{kind} missing id")
            if rid in seen: errors.append(f"duplicate {kind} id {rid}")
            seen.add(rid)
        ids[kind]=seen
    import re
    gui_re = re.compile(r'\b(gui|ui|screen|page|panel|form|layout|styling|icon|svg|image|screenshot|visual|button|modal)\b', re.I)
    for a in atoms:
        if a.get('status') in {'accepted','ready_for_plan_compile','compiled_to_plan'} and not a.get('source_refs'):
            errors.append(f"atom missing source_refs: {a.get('atom_id')}")
        if 'gui_related' not in a:
            errors.append(f"atom missing gui_related: {a.get('atom_id')}")
        elif not isinstance(a.get('gui_related'), bool):
            errors.append(f"atom gui_related must be boolean: {a.get('atom_id')}")
        hay = ' '.join(str(a.get(k,'')) for k in ('title','canonical_summary')) + ' ' + ' '.join(map(str,a.get('exact_tokens',[])))
        reason = str(a.get('gui_classification_reason','')).lower()
        explicitly_non_gui_rule = 'not gui' in reason or 'not itself gui' in reason or 'not gui/ui' in reason or 'backend/orchestration' in reason or 'metadata/classification' in reason
        if gui_re.search(hay) and a.get('gui_related') is False and not explicitly_non_gui_rule:
            warnings.append(f"review gui_related=false on GUI-looking atom: {a.get('atom_id')}")
        if a.get('atom_type') == 'negative_constraint' and not a.get('negative_constraints'):
            warnings.append(f"negative_constraint atom lacks negative_constraints list: {a.get('atom_id')}")
    current=load_json(d/'state/current.json'); handoff=load_json(d/'state/handoff.json')
    if current.get('ledger_id') != lid: errors.append('current.json ledger_id mismatch')
    if handoff.get('ledger_id') != lid: errors.append('handoff.json ledger_id mismatch')
    last_event=handoff.get('cursor',{}).get('last_event_id')
    if last_event and last_event not in ids['event']: errors.append(f"handoff last_event_id not found: {last_event}")
    status='pass' if not errors else 'fail'
    print(json.dumps({'schema_id':'pm.bootstrap_ledger_validator_report.v1','ledger_id':lid,'status':status,'summary':{'events':len(events),'atoms':len(atoms),'decisions':len(decisions)},'errors':errors,'warnings':warnings},indent=2))
    return 0 if not errors else 1
if __name__ == '__main__':
    raise SystemExit(main())
