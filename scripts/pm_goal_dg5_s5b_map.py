#!/usr/bin/env python3
"""C12-DG5 S5b selector map for MERGE2-APPLY (mail 1116044133-d773).

For each DG Goal successor family: the exact registered row it applies (registry pointer, every row
field, canonical row SHA-256), the owner clauses that row's owner fields resolve to (as cited by the
DG and DG-OWN-C grades, re-quoted from this tree with line numbers), and the canonical Plans subject of
the criterion-12 (positive/negative oracle) cell. The family revision stays 3.0.0: the switch pins the
existing row bytes and their owner clauses; it invents no SemVer bump.

Usage: python3 scripts/pm_goal_dg5_s5b_map.py --out reports/event-authority-20261116/PNC019-C12-DG5-s5b-map.json
"""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FAMILIES = ('goal.updated', 'goal.cancelled', 'goal_run.started', 'goal_run.cancelled', 'goal_run.certified')
GRADES = ROOT / 'reports/event-authority-20261104/DG-self-grade.json'
C12_SUBJECT = dict(path='Plans/Automated_Testing_System.md', unit='ATS-210')


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()


def quote(path, line):
    try:
        return (ROOT / path).read_text().splitlines()[line - 1].strip()[:300]
    except (OSError, IndexError, TypeError):
        return None


def unit_line(path, unit):
    """First line of a Plans file that names the unit id (for re-anchoring a citation on this tree)."""
    try:
        for number, text in enumerate((ROOT / path).read_text().splitlines(), 1):
            if unit and unit in text:
                return number
    except OSError:
        return None
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    registry_path = ROOT / 'Plans/event_family_registry.json'
    registry = json.loads(registry_path.read_text())
    grades = {r['event_type']: r for r in json.loads(GRADES.read_text())['rows']}
    out = dict(schema_id='pm.pnc019.c12_dg5.s5b_selector_map.v1',
               registry=dict(path=str(registry_path.relative_to(ROOT)),
                             file_sha256=hashlib.sha256(registry_path.read_bytes()).hexdigest(),
                             registry_revision=registry.get('registry_revision')),
               rule=__doc__.split('\n\n')[1], families={})
    for family in FAMILIES:
        index, row = next((i, r) for i, r in enumerate(registry['families']) if r['event_type'] == family)
        cells = grades[family]['cells']
        owners = []
        for cell in ('membership_version', 'owner_doc', 'producer', 'transitions'):
            for e in cells.get(cell, {}).get('evidence', []):
                if not e['path'].startswith('Plans/') or e['path'].endswith('event_family_registry.json'):
                    continue
                line = e.get('line_start')
                current = quote(e['path'], line)
                if current is None or e.get('quote', '')[:60] not in (current or ''):
                    line = unit_line(e['path'], e.get('quote', '')[:60]) or unit_line(e['path'], e.get('unit'))
                    current = quote(e['path'], line)
                owners.append(dict(cell=cell, path=e['path'], unit=e.get('unit'), line=line, quote=current))
        ats = unit_line(C12_SUBJECT['path'], C12_SUBJECT['unit'])
        out['families'][family] = dict(
            registry_pointer='#/families/%d' % index, family_id=row['family_id'], family_revision=row['family_revision'],
            row_canonical_sha256=hashlib.sha256(canonical(row)).hexdigest(), row=row,
            selectors=dict(semantic_owner_doc=row.get('semantic_owner_doc'), payload_owner_doc=row.get('payload_owner_doc'),
                           payload_schema_ref=row.get('payload_schema_ref'), payload_versions=row.get('payload_versions'),
                           payload_selection_policy=row.get('payload_selection_policy'), source_refs=row.get('source_refs')),
            owner_clauses=owners,
            c12_canonical_subject=dict(path=C12_SUBJECT['path'], unit=C12_SUBJECT['unit'], line=ats,
                                       quote=quote(C12_SUBJECT['path'], ats)),
            change='none to the row bytes: the S5b switch pins this exact row (canonical SHA-256 above) and these owner clauses')
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(out, indent=1, ensure_ascii=False) + '\n')
    print(json.dumps({f: dict(pointer=v['registry_pointer'], sha=v['row_canonical_sha256'][:16], owners=len(v['owner_clauses']))
                      for f, v in out['families'].items()}))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
