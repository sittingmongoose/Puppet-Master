#!/usr/bin/env python3
"""C12-SR2 evidence tables for restore_point.created: coverage matrix, mutation ledger, retained reads.

Reads a completed bundle (matrix.json, corpus.json and the per-table guard
reports) and writes, for every restore_point.created predicate (the owner's
sr_cre_* rows and the DL-693 sr2_cap_* co-extension rows): owner clause ->
predicate -> controls -> single-defect negatives -> gated cut (own flip, peer
stays) -> restoration; the exact expected-code mutation ledger; the separately
executed INVALID (multi-refusal) mutations that earn no kill; and the retained
read observations of every restore_point.created control. --guard-dirs first
merges parallel guard runs and re-verifies every reused table proof against
this tree with C12-SR's verifier. Writes nothing into the repository.
"""
import argparse
import collections
import copy
import gzip
import importlib.util
import json
from pathlib import Path

import pm_s3bo_oracles as w
import pm_s3bo_cases as c
import pm_s3bo_ext_sr2_capture as x

FAMILY = 'restore_point.created'
ACD = 'ACD-465 Capture selection (DL-693)'
CLAUSES = {
    'sr2_cap_shape': [ACD + ': selection reads persisted owner records', 'ACD section 11 message taxonomy (closed properties)'],
    'sr2_cap_range': [ACD + ': the range is the resolved source branch through source_message_id inclusive',
                      'ACD-086 l.1236: one inclusive message boundary in one current conversation branch'],
    'sr2_cap_context': [ACD + ': context_refs, items in the chat context at the boundary in the order of those additions'],
    'sr2_cap_provenance': [ACD + ': provenance_refs, every answer in range, tool calls then model run'],
    'sr2_cap_attachments': [ACD + ': attachment_refs, attachments[] of every message in range'],
    'sr2_cap_citations': [ACD + ': citation_refs, citations[] of every answer in range'],
    'sr2_cap_merged': [ACD + ': context_provenance_refs is context_refs followed by provenance refs not already in it'],
    'sr2_cap_admission': [ACD + ': unplaceable, unresolved or forbidden selected material refuses or quarantines; nothing dropped',
                          'ACD-465 l.26444: no new redaction transform; forbidden material'],
    'sr_cre_hash': ['ACD-465 Immutable capture hash', 'Plans/restore_point_created_hash_vectors.json'],
    'sr_cre_union': ['ACD-465 consumers: union and set equalities', 'RSC-N01'],
    'sr_cre_split': ['ACD-465: preserve frozen capture categories; no manufactured split'],
    'sr_cre_identity': ['ACD-465 rpc_ identity'],
    'sr_cre_joins': ['ACD-465 create admission joins', 'RSC-P01/P02'],
    'sr_cre_barriers': ['ACD-465 three-barrier protocol', 'ACD-465 crash recovery', ACD + ': selection runs once, at barrier 1'],
    'sr_cre_events': ['RSC-P03', 'ACD-465 appends at most once'],
    'sr_cre_completion': ['ACD-465 native completion predicate', 'ACD-465 acceptance: rp.available without proof'],
}


def sr_report():
    spec = importlib.util.spec_from_file_location('s3bo_sr_report', str(w.ROOT / 'scripts/pm-s3bo-sr-report.py'))
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module


def invalid_mutations(controls):
    """Executed one-change mutations that trip more than one independent row: recorded, never credited."""
    by_id = {ctl['id']: ctl for ctl in controls}; out = []
    bases = {'cited-boundary-overlap': (x.V1, x.V1_CAPTURE, x.V1_MERGED)}
    for label, row, lists, why in x.INVALID:
        conv, capture, merged = bases[label]
        value = x.build(x.changed(capture, **lists), merged, conv)
        errors, _ = w.evaluate(value)
        out.append({'control': FAMILY + '/sr2/' + label, 'control_present': FAMILY + '/sr2/' + label in by_id,
                    'intended_row': row, 'capture_change': lists, 'actual': errors, 'kill': False,
                    'disposition': 'INVALID: multiple independent refusals', 'why': why})
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bundle', type=Path, required=True)
    parser.add_argument('--guard-dirs', type=Path, nargs='*', default=[],
                        help='merge and verify parallel guard runs into the bundle first (C12-SR verifier)')
    args = parser.parse_args()
    if args.guard_dirs:
        print(json.dumps(sr_report().assemble(args.bundle, args.guard_dirs)))
    matrix = json.loads((args.bundle / 'matrix.json').read_text())
    controls, _negatives = c.cases()
    rows = [r for r in w.ROWS if r[0].startswith(('sr_cre_', 'sr2_'))]
    created = [ctl for ctl in controls if ctl['value']['family'] == FAMILY]
    applies = collections.Counter(); accepted_reads = 0; preserved = 0
    for ctl in created:
        _errors, values = w.evaluate(ctl['value'])
        for row, *_ in rows:
            applies[row] += bool(values[row]['applies'])
        accepted_reads += values['sealed_dispatch']['left'] is None
        preserved += values['store_snapshot']['left'] == values['store_snapshot']['right']
    guard_rows = {}
    for path in sorted(args.bundle.glob('*.json.gz')):
        if not path.name.startswith(('sr_created_', 'sr2_capture_')):
            continue
        report = json.load(gzip.open(path, 'rt'))
        for r in report['rows']:
            guard_rows[r['id']] = {'table': path.name[:-8], 'proved': r['proved'], 'own_witness': r['own'],
                                   'flips': len(r['flips']), 'stays': len(r['stays']),
                                   'restoration_cases': len(r['restoration']),
                                   'restoration_ok': all(o['outcome'].get('accepted') is True or o['outcome'].get('guard')
                                                         for o in r['restoration'])}
    mutations = [m for m in matrix['mutations'] if m['family'] == FAMILY]
    coverage = []; ledger = []
    for row, group, kind, text in rows:
        own = [m for m in mutations if m['guard'] == row]
        coverage.append({'predicate': row, 'table_group': group, 'kind': kind, 'invariant': text,
                         'owner_clauses': CLAUSES.get(row, []), 'controls_applying': applies[row],
                         'negatives': [m['id'] for m in own], 'guard': guard_rows.get(row)})
        ledger.append({'guard': row, 'expected_code': w.code_for(row), 'attempted': len(own),
                       'killed_exact': sum(m['killed'] for m in own), 'unexpected': [m['id'] for m in own if not m['killed']]})
    retained = [{'id': m['id'], 'guard': m['guard'], 'defect': m['defect'], 'actual': m['actual'], 'killed': m['killed']}
                for m in mutations if m['guard'] in ('sealed_dispatch', 'store_snapshot')]
    sr2 = [r for r in ledger if r['guard'].startswith('sr2_')]
    out = {'family': FAMILY, 'coverage_matrix': coverage, 'mutation_ledger': ledger,
           'common_row_mutations_on_created_controls': dict(collections.Counter(
               m['guard'] for m in mutations if not m['guard'].startswith(('sr_', 'sr2_')))),
           'invalid_mutations': invalid_mutations(controls),
           'retained': {'created_controls': len(created), 'accepted_reads_unique_sealed_original': accepted_reads,
                        'store_snapshot_preserved': preserved, 'refused_read_mutations': retained},
           'totals': {'rows': len(rows), 'sr2_rows': len(sr2), 'sr2_negatives': sum(r['attempted'] for r in sr2),
                      'sr2_killed_exact': sum(r['killed_exact'] for r in sr2),
                      'family_negatives_own_rows': sum(r['attempted'] for r in ledger),
                      'family_killed_exact_own_rows': sum(r['killed_exact'] for r in ledger),
                      'rows_proved': sum(1 for r in rows if (guard_rows.get(r[0]) or {}).get('proved')),
                      'family_mutations_all_rows': len(mutations),
                      'family_mutations_all_rows_killed': sum(m['killed'] for m in mutations)}}
    (args.bundle / 'sr2-evidence.json').write_text(json.dumps(out, indent=1, sort_keys=True, default=repr) + '\n')
    print(json.dumps(out['totals']), json.dumps({k: v for k, v in out['retained'].items() if k != 'refused_read_mutations'}))


if __name__ == '__main__':
    main()
