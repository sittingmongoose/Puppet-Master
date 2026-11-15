#!/usr/bin/env python3
"""C12-DCW schema-site supplement: path-novel controls beyond the main ledger's per-site cap.

The main ledger (pm_dcw_c12.py) keeps at most eight branch-distinct controls per
site. A later authored control can instantiate a branch none of those eight has
(for example non-empty checkpoint sequence_gaps items, or a translation body).
This supplement re-audits the named sites with exactly the accepted controls
that add instance path patterns the first eight do not have, using the same
real check_schema boundary, OE001 cut/restoration, mirror parity and strict
classification. Its kills are reported separately and merged clause by clause.
"""
import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dcw_c12 as c12
import pm_dcw_event_oracles as m


def patterns(value, parts=()):
    out = set()
    for where, item in c12.locations(value, parts):
        out.add(tuple('*' if type(x) is int else x for x in where))
    return out


def capture(family, keys):
    """All accepted values at the named sites, in witness order, with the first-eight set marked."""
    first, rest, signatures = defaultdict(list), defaultdict(list), defaultdict(set)
    for w in c12.accepting_witnesses(family):
        with c12.capture_sites() as captured:
            try:
                outcome = c12.suites.invoke(w)
            except m.Refusal as exc:
                outcome = str(exc)
        assert outcome == w['expected'], (w['id'], outcome)
        for path, definition, historical, value in captured:
            key = (path, definition, historical)
            if key not in keys:
                continue
            signature = c12.branch_signature(value)
            if signature in signatures[key]:
                continue
            signatures[key].add(signature)
            (first if len(first[key]) < c12.MAX_CONTROLS else rest)[key].append(dict(value=value, witness=w['id']))
    return first, rest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', choices=c12.FAMILIES, action='append')
    parser.add_argument('--site', action='append', required=True, help='schema|definition|historical, e.g. '
                        'Plans/event_record_index_checkpoint.schema.json|checkpoint|True')
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    keys = set()
    for text in args.site:
        path, definition, historical = text.split('|')
        keys.add((path, None if definition == 'None' else definition, historical == 'True'))
    args.out.mkdir(parents=True, exist_ok=True)
    summary = []
    for family in args.family or c12.FAMILIES:
        first, rest = capture(family, keys)
        report = []
        for key in sorted(keys, key=repr):
            covered = set().union(*(patterns(c['value']) for c in first[key])) if first[key] else set()
            novel, extra = [], set()
            for control in rest[key]:
                new = patterns(control['value']) - covered - extra
                if new:
                    novel.append(control)
                    extra |= new
            if not novel:
                report.append(dict(schema=key[0], definition=key[1], historical=key[2], novel_controls=0))
                continue
            site, inventory, witnessed, credited, invalid, parity = c12.audit_site(family, key, novel, [])
            clauses = []
            for clause in inventory:
                if clause in witnessed:
                    first_hit = witnessed[clause][0]
                    clauses.append(dict(source=clause[0], schema_pointer=clause[1], keyword=clause[2], status='witnessed',
                                        witnesses=[w['id'] for w in witnessed[clause]],
                                        clause_cut=c12.clause_cut(site, clause, first_hit['changed'])))
            report.append(dict(schema=key[0], definition=key[1], historical=key[2], schema_sha256=c12.pin(key[0]),
                               novel_controls=len(novel), controls=[dict(witness=c['witness'], sha256=c12.sha(c['value'])) for c in novel],
                               credited=len(credited), invalid=len(invalid), mirror_parity_checks=parity,
                               witnessed_clauses=clauses))
            c12.write(args.out / (family + '.supplement-ledger.json'), dict(credited=credited, invalid=invalid))
            print(family, key, 'novel', len(novel), 'credited', len(credited), 'invalid', len(invalid),
                  'witnessed', len(clauses), flush=True)
        c12.write(args.out / (family + '.supplement.json'), report)
        summary.append(dict(family=family, sites=report))
    c12.write(args.out / 'supplement-summary.json', dict(status='pass', families=[
        dict(family=s['family'], sites=[{k: v for k, v in r.items() if k != 'witnessed_clauses'} for r in s['sites']])
        for s in summary], pins={p: c12.pin(p) for p in ('scripts/pm_dcw_c12.py', 'scripts/pm_dcw_c12_supplement.py',
                                                         'scripts/pm_dcw_event_oracles.py')}))


if __name__ == '__main__':
    main()
