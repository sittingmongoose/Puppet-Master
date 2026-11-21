#!/usr/bin/env python3
"""C12-DG5 site work list from one discovery run (lead decision 1116061157-ad82, option A).

Every row a family's complete calls evaluate is classified by its best evidence in this run:

  KILLED            a declared single-site negative was KILLED (cut accepts, restoration repeats)
  DUP_KILLED        a declared duplicate set containing the site was DUPLICATE_SET_KILLED
  DUP_CANDIDATE     COVERED_LATER, and the evidence chain's widened cut accepted; a duplicate only if
                    every member checks the same field with the same predicate (members' source lines
                    are listed for that reading) and a judging run's site cuts pass
  PRESENCE_CANDIDATE CUT_EXCEPTION with the raising frame recorded; closes only by a presence
                    justification bound to the exact source bytes
  COVERED_LATER     a later refusal, no accepting chain: needs a new single-defect negative or a proof
  KILLED_CODE       the cut refused with a different owner refusal code, the declared target is the
                    row's own guard and code, restoration repeats (addendum 1): a kill, shown apart
  CANNOT_DECIDE     a later refusal that is neither: a different-code refusal missing a KILLED_CODE
                    condition, or a same-code one whose after-state differs or cannot be compared
                    (no owner-state hook, a missing digest, a non-repeating intact trial): no credit
  NEEDS_NEGATIVE    no declared negative targets the site: needs a new authored negative
  SCHEMA_ROOT       a whole-root schema row: closes by clause closure (GC) plus its gated row

Sites in pm_goal_test_* (shared adapter/storage/source) are listed in their own section. Per-code
counts are reported as data only.

Usage: python3 scripts/pm_goal_dg5_sites.py RUN_DIR --family F --out sites.json
"""
import argparse
import collections
import gzip
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RANK = {'KILLED': 0, 'DUP_KILLED': 1, 'KILLED_CODE': 1, 'PRESENCE_CANDIDATE': 3, 'DUP_CANDIDATE': 2,
        'COVERED_LATER': 4, 'CANNOT_DECIDE': 5, 'NEEDS_NEGATIVE': 6}


def source_line(path, line):
    try:
        return (ROOT / path).read_text().splitlines()[line - 1].strip()[:220]
    except (OSError, IndexError):
        return None


def file_sha(path, memo={}):  # noqa: B006
    if path not in memo:
        memo[path] = hashlib.sha256((ROOT / path).read_bytes()).hexdigest()
    return memo[path]


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('run', type=Path)
    parser.add_argument('--family', required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    collection = json.loads((args.run / 'collection.json').read_text())
    ledger = json.load(gzip.open(args.run / 'ledger.json.gz', 'rt'))
    family_rows = set(json.loads((args.run / 'family-rows.json').read_text()).get(args.family, []))
    best, evidence = {}, collections.defaultdict(list)
    for record in ledger:
        target = record.get('target')
        if record['family'] != args.family or target is None or record.get('valid') is True:
            continue
        names = [target] if isinstance(target, str) else list(target)
        kill = record.get('kill')
        for name in names:
            if kill == 'KILLED':
                cls = 'KILLED'
            elif kill == 'DUPLICATE_SET_KILLED':
                cls = 'DUP_KILLED'
            elif kill == 'COVERED_LATER':
                cls = 'DUP_CANDIDATE' if (record.get('dg5_chain') or {}).get('result') == 'accepts' else 'COVERED_LATER'
            elif kill in ('KILLED_CODE', 'CANNOT_DECIDE'):
                cls = kill
            elif kill == 'CUT_EXCEPTION':
                cls = 'PRESENCE_CANDIDATE'
            else:
                cls = 'COVERED_LATER' if record.get('outcome') == 'exact_expected' else None
            if cls is None:
                continue
            if name not in best or RANK[cls] < RANK[best[name]]:
                best[name] = cls
            if len(evidence[name]) < 3:
                evidence[name].append(dict(label=record['label'], kill=kill, outcome=record.get('outcome'),
                                           chain=record.get('dg5_chain'), cut_errors=record.get('cut_errors'),
                                           exception=(record.get('cut_exception_site') or {}).get('detail')))
    def member_lines(row):
        slot = collection['rows'].get(row, {})
        return [dict(path=p, line=l, source=source_line(p, l)) for p, l in slot.get('sites', [])[:3]]
    for items in evidence.values():
        for item in items:
            if item.get('chain'):
                item['chain_members'] = {row: member_lines(row) for step in item['chain']['rows'] for row in step}
    owner, shared = [], []
    for name in sorted(family_rows):
        slot = collection['rows'].get(name, {})
        sites = [dict(path=p, line=l, source=source_line(p, l), file_sha256=file_sha(p)) for p, l in slot.get('sites', [])[:4]]
        cls = best.get(name) or ('SCHEMA_ROOT' if name.endswith('/schema') else 'NEEDS_NEGATIVE')
        entry = dict(row=name, cls=cls, sites=sites, evidence=evidence.get(name, []))
        is_shared = bool(sites) and all(Path(s['path']).name.startswith('pm_goal_test_') for s in sites)
        (shared if is_shared else owner).append(entry)
    report = dict(family=args.family, run=str(args.run), rule=__doc__.split('\n\n')[1],
                  owner=dict(counts=dict(collections.Counter(e['cls'] for e in owner)), rows=owner),
                  shared=dict(counts=dict(collections.Counter(e['cls'] for e in shared)), rows=shared))
    args.out.write_text(json.dumps(report, indent=1) + '\n')
    print(json.dumps(dict(family=args.family, owner=report['owner']['counts'], shared=report['shared']['counts'])))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
