#!/usr/bin/env python3
"""C12-SR evidence tables: coverage matrix, mutation ledger and retained-store observations.

Reads a completed bundle (matrix.json, corpus.json and the per-table guard
reports) and writes, for the five SR families: owner clause -> predicate ->
controls -> single-defect negatives -> gated cut (own flip, peer stays) ->
restoration; the exact expected-code mutation ledger, with the separately
executed INVALID (multi-refusal) mutations that earn no kill; and the retained
read observations of every SR control. Writes nothing into the repository.
"""
import argparse
import collections
import copy
import gzip
import json
from pathlib import Path

import pm_s3bo_oracles as w
import pm_s3bo_cases as c

SR = {'restore_point.applied', 'restore_point.corrupt', 'restore_point.created', 'restore_point.expired',
      'safe_point.recovery_unavailable'}
# Owner clause (unit / oracle id) for every SR predicate.
CLAUSES = {
    'sr_app_result': ['SP-2202 order (1)-(2)', 'ACD-086 l.1238', 'UCC-126', 'ATS K37 applied: refused/failed command result'],
    'sr_app_reason': ['UCC-126 l.11313 reason tokens'],
    'sr_app_record': ['SP-2202 order (2)/(4)', 'SP-2202 Replay and result custody'],
    'sr_app_events': ['SP-2202 order (5)', 'ATS-2202 Order: an event for refused or failed', 'PGF-010'],
    'sr_app_branches': ['SP-2202 order (3)', 'ATS-2202 Order: a second branch on a resumed step'],
    'sr_app_targets': ['ACD-086 l.1238', 'ATS K37 applied: refused/failed no target IDs'],
    'sr_app_order': ['SP-2202 order (1)-(7)', 'ATS-2202 Order: a result before the receipt'],
    'sr_app_replay': ['SP-2202 Replay and result custody', 'ATS K37 applied: Replay'],
    'sr_app_request': ['SP-2202 Identity (normalized request digest)', 'application_commit schema'],
    'sr_app_identity': ['SP-2202 Identity (rpa_)', 'ATS-2202 Identity: reused application_id for a new key'],
    'sr_app_preflight': ['SP-2202 order (2) preflight'],
    'sr_app_event_join': ['ATS K37 applied: Project and source joins', 'ATS-2202 Identity: envelope thread_id'],
    'sr_app_obligation': ['SP-2202 order (4) frozen EventRecord obligation'],
    'sr_app_receipt': ['SP-2202 order (6)-(7)', 'SP-286/CV-339'],
    'sr_app_schema': ['ATS-2202 Result custody: closed schema, three results'],
    'sr_app_time': ['CV-1101 storage_utc_z (ATS-2206)'],
    'sr_app_protect': ['SP-2202 order (4) protecting ref', 'SP-2202 Custody'],
    'sr_app_point': ['ACD-086 l.1240 (application is not a lifecycle transition)'],
    'sr_app_source': ['ACD-086 l.1238', 'ATS-2202 Order: any source change'],
    'sr_app_conflict': ['SP-2202 Replay: different digest idempotency_conflict'],
    'sr_cor_outcome': ['ACD Known-37 completion precedence', 'EA-OC-004-POS-01..04', 'EA-OC-004-NEG-01/02/03/06/09/10'],
    'sr_cor_events': ['SP-2203 Producer', 'ATS-2203 reader appending', 'EA-OC-004-POS-05'],
    'sr_cor_payload': ['ACD Known-37 reason/evidence table', 'EA-OC-004-NEG-05/06/07'],
    'sr_cor_evidence': ['FileSafe Known-37 corruption evidence', 'SP-2203 Custody', 'EA-OC-004-NEG-05/08'],
    'sr_cor_order': ['SP-2203 Producer order (1)-(6)'],
    'sr_cor_identity': ['SP-2203 Identity (rpx_)', 'ATS-2203 second corruption_id'],
    'sr_cor_thread': ['SP-2203 Identity: envelope thread_id'],
    'sr_cor_terminal': ['SP-2203 Transition order', 'ATS-2203 commit when deletion/expiry exists and the reverse'],
    'sr_cor_once': ['SP-2203 Identity: re-detection mints nothing', 'ATS-2203 re-detection changing the first reason'],
    'sr_cor_status': ['SP-2203 Producer: status in the commit, not a record rewrite'],
    'sr_cor_reader': ['SP-2203 Producer: readers only report'],
    'sr_cor_receipt': ['SP-2203 order (5)', 'EA-OC-004-POS-05'],
    'sr_cor_conflict': ['SP-2203 Replay', 'EA-OC-004-POS-05'],
    'sr_cor_schema': ['ATS-2203 corruption_commit closed schema', 'EA-OC-004-NEG-04'],
    'sr_cor_time': ['CV-1101 storage_utc_z (ATS-2206)'],
    'sr_cor_numbers': ['CV-1100 current_integer (material lengths)'],
    'sr_cor_event_schema': ['EA-OC-004-NEG-04/07', 'v2 payload schema oneOf'],
    'sr_cor_upgrade': ['MIG-RESTORE-POINT-CORRUPT-PAYLOAD-001', 'EA-OC-004-POS-06', 'EA-OC-004-NEG-11'],
    'sr_cor_upgrade_source': ['Storage v1-to-v2 bindings: preserve source bytes and cardinality'],
    'sr_cor_stored': ['common EventRecord custody join'],
    'sr_cre_hash': ['ACD-465 Immutable capture hash', 'Plans/restore_point_created_hash_vectors.json'],
    'sr_cre_union': ['ACD-465 consumers: union and set equalities', 'RSC-N01'],
    'sr_cre_split': ['ACD-465: preserve frozen capture categories; no manufactured split'],
    'sr_cre_identity': ['ACD-465 rpc_ identity'],
    'sr_cre_joins': ['ACD-465 create admission joins', 'RSC-P01/P02'],
    'sr_cre_barriers': ['ACD-465 three-barrier protocol', 'ACD-465 crash recovery'],
    'sr_cre_events': ['RSC-P03', 'ACD-465 appends at most once'],
    'sr_cre_completion': ['ACD-465 native completion predicate', 'ACD-465 acceptance: rp.available without proof'],
    'sr_exp_eligible': ['SP-275 Exact eligibility', 'RSE-P01', 'RSE-P02', 'RSE-N02', 'RSE-N03'],
    'sr_exp_events': ['SP-275 E2', 'RSE-N01'],
    'sr_exp_order': ['SP-275 E1/E2/E3'],
    'sr_exp_point': ['SP-275 E1 changes only status', 'RSE-N02'],
    'sr_exp_identity': ['SP-275 rpe_ identity'],
    'sr_exp_payload': ['SP-275 frozen append input', 'RSE-P01'],
    'sr_exp_evidence': ['SP-275 closed eligibility object (eleven classes)'],
    'sr_exp_resume': ['SP-275 frozen identity/input survives every crash boundary'],
    'sr_exp_replay': ['SP-275 identity/digest replay'],
    'sr_sru_order': ['SP-2204 Producer order (1)-(5)', 'ATS-2204 append before anchor commit; actions before receipt'],
    'sr_sru_reason': ['FileSafe five reasons', 'P03', 'N03', 'ATS-2204 recovery changes the reason'],
    'sr_sru_actions': ['Contracts action arrays', 'P04', 'P08', 'N04', 'N05'],
    'sr_sru_attempt': ['Executor Known-37 pre/post attempt', 'P01', 'P02', 'N01', 'N02'],
    'sr_sru_anchor': ['recovery_anchor_record', 'SP-2204 Producer (2)'],
    'sr_sru_episode': ['Executor Known-37 episode facts', 'P01'],
    'sr_sru_events': ['SP-2204 one episode one event', 'N15'],
    'sr_sru_identity': ['SP-2204 Identity (sru_)', 'ATS-2204 second event identity'],
    'sr_sru_outcome': ['FileSafe locate/abandon', 'P05', 'P09', 'N07', 'N08', 'N10'],
    'sr_sru_receipt_reason': ['receipt reason enum', 'N07', 'N10'],
    'sr_sru_release': ['Storage release reasons', 'P05', 'P07', 'P08', 'P09', 'N09'],
    'sr_sru_snapshots': ['receipt $comment snapshot equalities', 'P05'],
    'sr_sru_replay': ['receipt replay_behavior', 'P06', 'N12'],
    'sr_sru_conflict': ['receipt replay_behavior: invalid_args', 'N12'],
    'sr_sru_no_release': ['N06', 'N14', 'SP-2204 withdrawal never releases'],
    'sr_sru_effects': ['FileSafe abandon: no cleanup/abort/detach', 'N11'],
    'sr_sru_receipt_join': ['recovery_unavailable_resolution_receipt fields', 'P02'],
    'sr_sru_receipt_schema': ['receipt closed schema (allOf/oneOf)'],
    'sr_sru_anchor_schema': ['recovery_anchor_record closed schema'],
    'sr_sru_numbers': ['CV-1100 current_integer (blocked_sequence)'],
    'sr_sru_time': ['CV-1101 storage_utc_z (completed_at_utc)'],
    'sr_sru_ui': ['P10', 'N13', 'ACD Known-37 recovery UI'],
    'sr_sru_stored': ['common EventRecord custody join'],
}


def invalid_mutations(controls):
    """Mutations that change one source value but trip two independent rows: run, record, no kill."""
    by_id = {x['id']: x for x in controls}
    out = []
    specs = [
        ('restore_point.corrupt/sr/record-hash-mismatch', 'sr_cor_evidence', ('sr', 'runs', 1, 'commit_after', 'evidence', 'evidence_kind'),
         'record_decode_failure', 'Swap evidence_kind between reason rows (EA-OC-004-NEG-05): both the evidence join and the closed schema refuse.'),
        ('restore_point.applied/sr/failed-at-reserve', 'sr_app_record', ('sr', 'runs', 0, 'companion_after'), None,
         'Drop the terminal step-2 row: the record row and the replay row (which reads that row) both refuse.'),
        ('safe_point.recovery_unavailable/sr/episode', 'sr_sru_numbers', ('sr', 'runs', 15, 'receipt', 'blocked_sequence'), True,
         'Boolean blocked_sequence in one receipt copy only: the number row and the replay copy join both refuse.'),
    ]
    for control_id, row, path, replacement, why in specs:
        control = by_id[control_id]
        value = copy.deepcopy(control['value']); c.set_path(value, path, replacement)
        errors, _ = w.evaluate(value)
        out.append({'control': control_id, 'intended_row': row, 'path': list(path), 'replacement': repr(replacement),
                    'actual': errors, 'kill': False, 'disposition': 'INVALID: multiple independent refusals', 'why': why})
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bundle', type=Path, required=True)
    args = parser.parse_args()
    matrix = json.loads((args.bundle / 'matrix.json').read_text())
    controls, negatives = c.cases()
    sr_rows = [r for r in w.ROWS if r[0].startswith('sr_')]
    applies = collections.Counter()
    for control in controls:
        if control['value']['family'] not in SR:
            continue
        _errors, values = w.evaluate(control['value'])
        for row, *_ in sr_rows:
            if values[row]['applies']:
                applies[row] += 1
    guard_rows = {}
    for path in sorted(args.bundle.glob('sr_*.json.gz')):
        report = json.load(gzip.open(path, 'rt'))
        for r in report['rows']:
            guard_rows[r['id']] = {'table': path.name[:-8], 'proved': r['proved'], 'own_witness': r['own'],
                                   'flips': len(r['flips']), 'stays': len(r['stays']),
                                   'restoration_cases': len(r['restoration']),
                                   'restoration_ok': all(x['outcome'].get('accepted') is True or x['outcome'].get('guard')
                                                         for x in r['restoration'])}
    mutations = [m for m in matrix['mutations'] if m['family'] in SR]
    coverage = []; ledger = []
    for row, group, kind, text in sr_rows:
        own = [m for m in mutations if m['guard'] == row]
        coverage.append({'predicate': row, 'table_group': group, 'kind': kind, 'invariant': text,
                         'owner_clauses': CLAUSES.get(row, []), 'controls_applying': applies[row],
                         'negatives': [m['id'] for m in own], 'guard': guard_rows.get(row)})
        ledger.append({'guard': row, 'expected_code': w.code_for(row), 'attempted': len(own),
                       'killed_exact': sum(m['killed'] for m in own), 'unexpected': [m['id'] for m in own if not m['killed']]})
    common = collections.Counter(m['guard'] for m in mutations if not m['guard'].startswith('sr_'))
    retained = []
    for m in mutations:
        if m['guard'] in ('sealed_dispatch', 'store_snapshot'):
            retained.append({'id': m['id'], 'guard': m['guard'], 'defect': m['defect'], 'actual': m['actual'], 'killed': m['killed']})
    sr_controls = [x for x in controls if x['value']['family'] in SR]
    accepted_reads = 0; preserved = 0
    for control in sr_controls:
        _errors, values = w.evaluate(control['value'])
        accepted_reads += values['sealed_dispatch']['left'] is None
        preserved += values['store_snapshot']['left'] == values['store_snapshot']['right']
    out = {'families': sorted(SR), 'coverage_matrix': coverage, 'mutation_ledger': ledger,
           'common_row_mutations_on_sr_controls': dict(common), 'invalid_mutations': invalid_mutations(controls),
           'retained': {'sr_controls': len(sr_controls), 'accepted_reads_unique_sealed_original': accepted_reads,
                        'store_snapshot_preserved': preserved, 'refused_read_mutations': retained},
           'totals': {'sr_rows': len(sr_rows), 'sr_negatives': sum(x['attempted'] for x in ledger),
                      'sr_killed_exact': sum(x['killed_exact'] for x in ledger),
                      'sr_rows_proved': sum(1 for r in sr_rows if (guard_rows.get(r[0]) or {}).get('proved')),
                      'sr_mutations_all_rows': len(mutations), 'sr_mutations_all_rows_killed': sum(m['killed'] for m in mutations)}}
    (args.bundle / 'sr-evidence.json').write_text(json.dumps(out, indent=1, sort_keys=True, default=repr) + '\n')
    print(json.dumps(out['totals']), json.dumps({k: v for k, v in out['retained'].items() if k != 'refused_read_mutations'}))


if __name__ == '__main__':
    main()
