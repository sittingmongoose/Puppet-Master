#!/usr/bin/env python3
"""C12-GO per-family coverage matrix (lane 18; s3ao conformance gap G1).

One row per checker or owner-schema row that a family's complete calls evaluate, in
a pm_goal_go_sweep.py proof directory:
  owner clause or branch -> predicate -> control -> negative -> cut -> restoration.

* owner clause: the owner units the family's grade cell for the row's concern cites
  (path, line, quote, from reports/event-authority-20261115/PNC019-S3AO-grades-core.json,
  whose quotes the grade checker verifies), plus, for a whole-definition schema row,
  its owner definition and that root's clause closure (pm_goal_go_schema_closure.py);
* predicate: GO phase table, gated-tool status (004bdedd63 on real vectors), sites with
  their source line;
* control: the family's accepted complete calls that evaluated the row, and the gated
  control vector's witnesses;
* negative: the family's declared-target attempts by outcome class and the best exact
  witness (label, input SHA-256, kill class);
* cut / restoration: that witness's complete-checker replays.

Status: CLOSED = gated PASS and a KILLED or DUPLICATE_SET_KILLED witness of this
family; CLOSED_BY_PROOF = a recorded source-bound proof (gated run) or a declared
justification (pm_goal_go_declarations.JUSTIFIED) whose evidence the run confirms;
OPEN otherwise, with its reason.
Usage: python3 scripts/pm_goal_go_matrix.py PROOF_DIR --closure CLOSURE.json --out matrix.json
"""
import argparse
import collections
import gzip
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRADES = ROOT / 'reports/event-authority-20261115/PNC019-S3AO-grades-core.json'
FAMILIES = ('goal.created', 'restore_point.deleted', 'run.started')


def concern(name):
    if (name.startswith(('complete/owner_schema/', 'restore_point.deleted/original/schema/'))
            or name.endswith((' schema', '_schema', '/request_schema')) or '/schema/' in name):
        return 'closed_payload_schema'
    if name.startswith('retained/') or '/retained/' in name or name.startswith('goal.created/member/'):
        return 'redaction_custody'
    if name.startswith('goal.created/reader/cursor/'):
        return 'compatibility_withdrawal'
    if name.startswith('goal.created/reader/'):
        return 'consumers_checkpoints'
    if name.startswith(('goal.created/identity/', 'goal.created/envelope/', 'run.started/adoption/domain/')):
        return 'scope_identity'
    if name.startswith(('goal.created/payload/', 'goal.created/result/', 'goal.created/digest/', 'goal.created/source/')):
        return 'producer'
    if name.startswith(('goal.created/publication/', 'goal.created/order/', 'goal.created/outcome/', 'goal.created/response/')):
        return 'transitions'
    if name.startswith('run.started/retention/') or 'retention' in name or 'cleanup' in name:
        return 'retention'
    if name.startswith('restore_point.deleted/original/SP274'):
        return 'replay_idempotency'
    return 'consumers_checkpoints'


def provider_proof(name, reports):
    import pm_goal_go_deleted
    import pm_goal_go_run_started
    for provider in (pm_goal_go_deleted.earlier_clause_proof, pm_goal_go_run_started.earlier_clause_proof):
        try:
            proof = provider(name, reports)
        except Exception:  # a provider that cannot evaluate is no proof
            proof = None
        if proof:
            earlier = proof.get('earlier_guards', [])
            if earlier and all(any(r['guard'] == e and r['status'] == 'PASS' for r in reports) for e in earlier):
                return proof
    return None


def line_text(path, line):
    try:
        return (ROOT / path).read_text().splitlines()[line - 1].strip() if not Path(path).is_absolute() \
            else Path(path).read_text().splitlines()[line - 1].strip()
    except (OSError, IndexError):
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('proof', type=Path)
    parser.add_argument('--closure', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--extra-ledger', type=Path, action='append', default=[],
                        help='ledger.json.gz of a declared supplement run on the same code and tables; its declared attempts '
                             'and replays join the family columns (gated status stays the main run\'s), as GH1\'s matrix does')
    args = parser.parse_args()
    import pm_goal_go_declarations as declarations
    proof = args.proof
    ledger = json.load(gzip.open(proof / 'ledger.json.gz', 'rt'))
    for extra in args.extra_ledger:
        for record in json.load(gzip.open(extra, 'rt')):
            if record.get('target') is not None and record.get('valid') is not True:
                ledger.append(dict(record, id=len(ledger), sig=None, label='supplement:' + record['label']))
    signatures = [set(x) for x in json.load(gzip.open(proof / 'signatures.json.gz', 'rt'))]
    family_rows = json.loads((proof / 'family-rows.json').read_text())
    rows = {r['guard']: r for r in json.loads((proof / 'tables/rows.json').read_text())}
    tables = {t['table']: t for t in json.loads((proof / 'tables/summary.json').read_text())}
    collection = json.loads((proof / 'collection.json').read_text())
    closure = json.loads(args.closure.read_text())
    grades = {r['event_type']: r for r in json.loads(GRADES.read_text())['rows']}
    root_of_row = collections.defaultdict(list)
    for root, entry in closure['roots'].items():
        for row in entry['rows']:
            root_of_row[row].append(root)
        for file, line in entry['sites']:
            for name, info in collection['rows'].items():
                if any(Path(f).name == Path(file).name and l == line for f, l in info['sites']):
                    root_of_row[name].append(root)
    out = dict(schema_id='pm.pnc019.c12_go.coverage_matrix.v1', proof_dir=str(proof), closure=str(args.closure), families={},
               rule='CLOSED = gated PASS and a KILLED/DUPLICATE_SET_KILLED witness of this family; CLOSED_BY_PROOF = recorded '
                    'source-bound proof or a declared justification the run confirms; OPEN otherwise.')
    for family in FAMILIES:
        names = sorted(family_rows.get(family, []))
        records = [r for r in ledger if r['family'] == family]
        controls = collections.Counter()
        for record in records:
            if record.get('outcome') == 'control' and record.get('sig') is not None:
                for name in signatures[record['sig']]:
                    controls[name] += 1
        attempts = collections.defaultdict(list)
        for record in records:
            target = record.get('target')
            if target is None or record.get('valid') is True:
                continue
            for name in ([target] if isinstance(target, str) else target):
                attempts[name].append(record)
        cells = (grades.get(family) or {}).get('cells', {})
        matrix = []
        for name in names:
            row = rows.get(name, {})
            table = tables.get(row.get('table'), {})
            tries = attempts.get(name, [])
            by_outcome = collections.Counter(r.get('outcome') for r in tries)
            kills = collections.Counter(r.get('kill') for r in tries if r.get('kill'))
            exact = [r for r in tries if r.get('outcome') == 'exact_expected']
            best = None
            for preference in ('KILLED', 'DUPLICATE_SET_KILLED', 'COVERED_LATER', 'CUT_LEFT_EFFECT', 'CANNOT_DECIDE',
                               'CUT_EXCEPTION', 'NOT_REPLAYED_CAP'):
                best = next((r for r in exact if r.get('kill') == preference), None)
                if best:
                    break
            gated = row.get('status')
            killed = any(r.get('kill') in ('KILLED', 'DUPLICATE_SET_KILLED') for r in exact)
            justified = declarations.JUSTIFIED.get(name)
            if justified and family not in justified.get('families', []):
                justified = None  # a justification closes a row only for the family whose witness confirmed it
            confirmed = None
            if justified:
                need = justified.get('requires_kill_class')
                confirmed = any(r.get('kill') == need for r in exact) if need else True
            proof = row.get('proof')
            if proof is None and gated == 'PASS' and not killed:
                # prove() consults the proof providers only for gated-UNPROVED rows; a gated-PASS row without
                # a kill gets the same source-bound providers here (their earlier guards must be CLOSED below).
                proof = provider_proof(name, list(rows.values()))
            if gated == 'PASS' and killed:
                status, reason = 'CLOSED', None
            elif proof:
                status, reason = 'CLOSED_BY_PROOF', proof.get('kind')
            elif justified and confirmed and gated in ('PASS', 'UNPROVED'):
                status, reason = 'CLOSED_BY_PROOF', 'declared_' + justified['kind']
            else:
                status = 'OPEN'
                reason = ('gated ' + str(gated)) if gated != 'PASS' else ('no exact witness' if not exact else
                                                                         'no killing witness: ' + ','.join(sorted(kills)))
            c = concern(name)
            cell = cells.get(c, {})
            owner = [dict(path=e['path'], line=e['line_start'], unit=e.get('unit'), quote=e['quote']) for e in cell.get('evidence', [])][:4]
            schema_roots = sorted(set(root_of_row.get(name, [])))
            matrix.append(dict(
                guard=name, concern=c, owner=owner,
                owner_schema=[dict(root=r, counts=closure['roots'][r]['counts'],
                                   uncovered=sum(1 for e in closure['roots'][r]['clauses'].values() if e['cls'] == 'UNCOVERED'))
                              for r in schema_roots],
                predicate=dict(table=row.get('table'), gated=gated, table_status=table.get('status'),
                               table_rows=len(table.get('rows', [])),
                               sites=[dict(path=s[0], line=s[1], text=line_text(s[0], s[1]))
                                      for s in sorted(collection['rows'].get(name, {}).get('sites', []))[:3]]),
                control=dict(family_accepted_calls=controls.get(name, 0),
                             gated_control=(table.get('controls') or [{}])[0].get('witnesses', [])[:2]),
                negative=dict(declared_attempts=len(tries), outcomes=dict(by_outcome), kills=dict(kills),
                              witness=None if best is None else dict(label=best['label'], input_sha256=best['input_sha256'],
                                                                     target=best['target'], kill=best.get('kill'))),
                cut=None if best is None else best.get('cut_errors'),
                restoration=None if best is None else best.get('restoration_errors'),
                site_cuts=None if best is None else best.get('site_cuts'),
                proof=proof or (justified if justified and status == 'CLOSED_BY_PROOF' else None),
                status=status, reason=reason))
        # A proof closes its row only while every earlier guard it names is CLOSED in this family.
        for _ in range(3):
            closed = {r['guard'] for r in matrix if r['status'] == 'CLOSED'}
            for r in matrix:
                earlier = (r['proof'] or {}).get('earlier_guards') or ([r['proof']['earlier_guard']] if (r['proof'] or {}).get('earlier_guard') else [])
                if r['status'] == 'CLOSED_BY_PROOF' and earlier and not set(earlier) <= closed | {x['guard'] for x in matrix
                                                                                                 if x['status'] == 'CLOSED_BY_PROOF' and x is not r}:
                    r['status'], r['reason'] = 'OPEN', 'proof dependency not closed in this family: ' + ', '.join(sorted(set(earlier) - closed))
        status = collections.Counter(r['status'] for r in matrix)
        fam_closure = closure['families'].get(family, {})
        out['families'][family] = dict(rows=len(matrix), status=dict(status), open=[r['guard'] for r in matrix if r['status'] == 'OPEN'],
                                       schema_rows=sum(r['concern'] == 'closed_payload_schema' for r in matrix),
                                       schema_closure=dict(roots=len(fam_closure.get('roots', [])),
                                                           occurrence_counts=fam_closure.get('occurrence_counts'),
                                                           distinct_counts=fam_closure.get('distinct_counts'),
                                                           uncovered=fam_closure.get('uncovered')),
                                       matrix=matrix)
    args.out.write_text(json.dumps(out, indent=1, default=list) + '\n')
    print(json.dumps({f: dict(rows=v['rows'], status=v['status'], schema_uncovered=len(v['schema_closure']['uncovered'] or []))
                      for f, v in out['families'].items()}, indent=1))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
