#!/usr/bin/env python3
"""C12-SS evidence tables: coverage matrix, mutation ledger and retained-store observations.

Reads a completed bundle (matrix.json and the per-table guard reports) and
writes, for the five SS families: owner clause -> predicate -> controls ->
single-defect negatives -> gated cut (own flip, peer stays) -> restoration; the
exact expected-code mutation ledger, with separately executed INVALID
(multi-refusal) mutations that earn no kill; and the retained read observations
of every SS control. --guard-dirs merges parallel guard runs into the bundle
after checking every table's consumed inputs, module and tool digest against
this tree. Writes nothing into the repository.
"""
import argparse
import collections
import copy
import gzip
import hashlib
import importlib.util
import json
import shutil
from pathlib import Path

import pm_guard_isolation as g
import pm_s3bo_oracles as w
import pm_s3bo_cases as c

SS = {'platform.capability_evaluated', 'seglog.event_appended', 'storage.boot_recovery', 'storage.integrity_detected',
      'storage.recovery_applied'}
CLAUSES = {
    'ss_pf_outcome': ['N2-157 original evaluation authority', 'CAP-POS-001', 'CAP-NEG-001/002/006/007/008/009/010/011/014', 'RSC-017 capture closure', 'DL-082 empty catalog'],
    'ss_pf_decision': ['Platform evaluation contract precedence', 'CAP-POS-002..007', 'v2 payload oneOf products'],
    'ss_pf_ref': ['N2-157 frozen revision and entry', 'CAP-POS-001', 'CAP-POS-010'],
    'ss_pf_identity': ['SP-290 event/idempotency identity', 'SP-290 physical key', 'SP-290 restricted JSON codec'],
    'ss_pf_envelope': ['N2-157 frozen producer input', 'CAP-POS-010'],
    'ss_pf_row': ['SP-290 14-field decision row', 'SP-290 Capture, recovery and exact publication'],
    'ss_pf_retry': ['SP-290 Already committed receipt retry', 'SP-290 Installed operation support'],
    'ss_pf_read': ['SP-2209 read output', 'SP-290 Passive read and complete source coverage', 'CAP-POS-008'],
    'ss_pf_context': ['N2-157 run-context consumer joins', 'platform.capability_run_context.consume.v1'],
    'ss_pf_legacy': ['MIG-PLATFORM-CAPABILITY-EVALUATED-PAYLOAD-001', 'CAP-NEG-012', 'CAP-POS-009 (no admissible pre-release input)'],
    'ss_pf_schema': ['decision / evaluation_request / read_output closed schemas', 'CAP-NEG-003/004/005/013'],
    'ss_pf_time': ['CV-1101 event_record (E5-2)'],
    'ss_seg_obligation': ['SP-270 Producer authority, introduction boundary and no recursion', 'SEA-NATIVE-02/03'],
    'ss_seg_events': ['SP-270 exactly one append-observability fact', 'SEA-NATIVE-04'],
    'ss_seg_order': ['SP-270 Strict source-first append', 'SP-270 Producer reconciliation order'],
    'ss_seg_identity': ['SP-270 identity_digest recipe'],
    'ss_seg_payload': ['SP-270 deterministic semantic mapping'],
    'ss_seg_envelope': ['SP-270 envelope bindings', 'SP-270 Exact producer projection'],
    'ss_seg_original': ['SP-270 original source remains authoritative', 'SEA-NATIVE-05'],
    'ss_seg_retry': ['SP-270 same identity/digest, idempotency_conflict, dedupe_unavailable'],
    'ss_seg_reader': ['SP-270 Concrete read consumers and publication', 'SP-2210', 'DL-076'],
    'ss_seg_schema': ['SP-2210 stored-snapshot negative', 'seglog reader_checkpoint closed schema'],
    'ss_seg_time': ['CV-1101 event_record (E5-2)'],
    'ss_boot_outcome': ['SP-291 Six original source captures', 'SP-291 Exact work-set and episode bytes', 'SP-2205 post-restore admission', 'DL-083 fail-closed overflow'],
    'ss_boot_events': ['SP-291 no-work emits no EventRecord', 'SP-2205 restored pending intent never first-mints'],
    'ss_boot_workset': ['SP-291 sorted unique work set'],
    'ss_boot_identity': ['SP-291 W/S, event ID, idempotency key, recovery_set_id, actor'],
    'ss_boot_repeat': ['SP-291 repeat_of earliest matching original', 'SP-292 Earliest original first-receipt resolution'],
    'ss_boot_floor': ['SP-292 Original receipt/floor publication', 'SP-2205 floor and anchor after restore'],
    'ss_boot_anchor': ['SP-292 anchor equals floor; pending consumed', 'SP-2205 anchor never rolled back'],
    'ss_boot_earliest': ['SP-292 resolve_earliest result', 'SP-2205 unavailable after older restore'],
    'ss_boot_bucket': ['SP-291 application-wide count buckets (DL-083, DL-089, DL-401)'],
    'ss_boot_reader': ['SP-2205 reader.storage.boot_recovery_history@1.0.0'],
    'ss_boot_schema': ['storage_boot_history_floor closed schema'],
    'ss_boot_time': ['CV-1101 event_record (E5-2)'],
    'ss_int_outcome': ['SP-279 section 2 relations', 'SP-279 section 3 retry/conflict/torn', 'SP-279 section 5 pending sink', 'CV-1100 refusal before effects', 'IN-P03/IN-P04'],
    'ss_int_events': ['SP-279 section 5 no duplicate append'],
    'ss_int_order': ['SP-279 section 3 write/sync/promote/readback', 'SP-279 section 5 barrier append and first receipt'],
    'ss_int_effects': ['SP-279 section 1 detection records a finding only'],
    'ss_int_codec': ['SP-279 section 4 canonical_uint_json.v1'],
    'ss_int_finding': ['SP-279 section 3 finding content and immutability'],
    'ss_int_identity': ['SP-279 section 3/4 identities'],
    'ss_int_payload': ['SP-279 section 1 unchanged payload projection'],
    'ss_int_envelope': ['SP-279 section 4 exact envelope'],
    'ss_int_witness': ['SP-279 section 2 exact_event corroboration', 'SP-279 2026-11-15 amendment'],
    'ss_int_downstream': ['SP-279 section 10 and 2026-11-15 amendment', 'CV-1100 JCS route qualification'],
    'ss_int_receipt': ['SP-279 section 5 original eleven-field receipt and result'],
    'ss_int_read': ['SP-279 section 6 storage.integrity_history_reader.v1'],
    'ss_int_numbers': ['CV-1100 current_integer (finding input, reader page size)'],
    'ss_int_time': ['CV-1101 event_record (E5-2)'],
    'ss_int_schema': ['storage_integrity_finding closed schema'],
    'ss_rec_identity': ['SP-293 Exact identities'],
    'ss_rec_projection': ['SP-293 complete producer input'],
    'ss_rec_payload': ['SP-293 payload equals the physical receipt effect projection'],
    'ss_rec_phase': ['SP-293 capsule phase table', 'RA-N05'],
    'ss_rec_immutable': ['SP-293 physical receipt immutable; original actor/time immutable on retry'],
    'ss_rec_events': ['SP-293 one semantic append', 'RA-P05'],
    'ss_rec_receipt': ['SP-293 publish.v1 completion', 'RA-N04'],
    'ss_rec_aftermath': ['SP-2207 and 2026-11-15 clarification', 'RA-P02', 'RA-P03', 'RA-P06', 'RA-N06'],
    'ss_rec_read': ['SP-293 passive selector and result', 'Storage projection freshness/health model'],
    'ss_rec_schema': ['storage_recovery_action_custody capsule closed schema'],
    'ss_rec_numbers': ['SP-1100 storage_uint64 (first receipt copies)'],
    'ss_rec_time': ['CV-1101 event_record (E5-2) and storage_utc_z custody times'],
}


def invalid_mutations(controls):
    """Mutations that change one source value but trip two or more independent rows: run, recorded, no kill."""
    by_id = {x['id']: x for x in controls}
    specs = [
        ('storage.recovery_applied/ss/main', 'ss_rec_identity', ('ss', 'capsules', 4, 'recovery_id'), 'pm.storage.recovery.v1:' + 'c' * 64,
         'Rewrite recovery_id in the committed capsule only: the identity row, the immutability row, the publish response and the read selector all refuse.'),
        ('storage.boot_recovery/ss/main', 'ss_boot_workset', ('ss', 'steps', 0, 'event', 'payload', 'recovery_ids'), [],
         'Drop every recovery id without recomputing W and S: the work-set row and the identity row both refuse.'),
        ('platform.capability_evaluated/ss/main', 'ss_pf_row', ('ss', 'store', None, 'original_storage_fields', 'sequence_id'), 40,
         'Change the row assignment when a read and a run-context consumer share the row: the row, read and context rows refuse.'),
        ('storage.integrity_detected/ss/main', 'ss_int_codec', ('ss', 'store', None), None,
         'Corrupt the stored finding file that the replay and the reader also use: the finding, outcome and read rows refuse.'),
        ('seglog.event_appended/ss/main', 'ss_seg_payload', ('ss', 'items', 0, 'metadata', 'payload', 'type'), 'seglog.event_appended',
         'Rename the payload type of an emitted fact to the metadata family: the payload row and the reader one-hop join both refuse.'),
    ]
    out = []
    for control_id, row, path, replacement, why in specs:
        value = copy.deepcopy(by_id[control_id]['value'])
        if path[:2] == ('ss', 'store') and path[2] is None:
            key = next(iter(value['ss']['store']))
            if len(path) == 3:
                hexed = value['ss']['store'][key]; value['ss']['store'][key] = hexed[:-8] + ('0' * 8 if not hexed.endswith('0' * 8) else '1' * 8)
            else:
                c.set_path(value['ss']['store'][key], path[3:], replacement)
        else:
            c.set_path(value, path, replacement)
        if control_id.startswith('seglog'):
            value['ss']['reader']['sources'][0]['metadata']['payload']['type'] = replacement
        errors, _ = w.evaluate(value)
        if len(errors) < 2:
            raise SystemExit('expected an INVALID multi-refusal for ' + control_id + ': ' + json.dumps(errors))
        out.append({'control': control_id, 'intended_row': row, 'path': [str(p) for p in path], 'replacement': repr(replacement)[:80],
                    'actual': errors, 'kill': False, 'disposition': 'INVALID: multiple independent refusals', 'why': why})
    return out


def assemble(bundle, guard_dirs):
    """Merge parallel guard runs; every table must have a proof whose inputs match this tree exactly."""
    spec = importlib.util.spec_from_file_location('s3bo_check', str(w.ROOT / 'scripts/pm-s3bo-check.py'))
    check = importlib.util.module_from_spec(spec); spec.loader.exec_module(check)
    tool = hashlib.sha256((w.ROOT / 'scripts/pm_guard_isolation.py').read_bytes()).hexdigest()
    verified = []
    for name in w.table_names():
        source = next((d for d in guard_dirs if (d / (name + '.summary.json')).exists()), None)
        if source is None:
            raise SystemExit('no guard report for ' + name)
        for suffix in ('.summary.json', '.json.gz'):
            shutil.copyfile(source / (name + suffix), bundle / (name + suffix))
        report = json.load(gzip.open(bundle / (name + '.json.gz'), 'rt'))
        cs, ns = check.selected(name)
        now = sorted((x.id, g.digest(x.value)) for x in cs + ns)
        then = sorted((x['id'], x['sha256']) for x in report['controls'] + report['negatives'])
        module = 'scripts/pm_s3bo_table_' + name + '.py'
        files = {f['path']: f.get('sha256') for f in report['static'].get('files', [])}
        module_ok = files.get(module) in (None, hashlib.sha256((w.ROOT / module).read_bytes()).hexdigest())
        ok = now == then and report['tool_sha256'] == tool and report['status'] == 'PASS' and module_ok
        verified.append({'table': name, 'source': str(source), 'inputs_match': now == then, 'tool_match': report['tool_sha256'] == tool,
                         'module_match': module_ok, 'status': report['status'], 'reused': ok})
        if not ok:
            raise SystemExit('guard proof does not match this tree for ' + name + ': ' + json.dumps(verified[-1]))
    guards = check.summarize(bundle, 0)
    guards['input_verification'] = verified
    (bundle / 'guards.json').write_text(json.dumps(guards, indent=1, sort_keys=True) + '\n')
    parts = {k: json.loads((bundle / f).read_text()) for k, f in
             (('matrix', 'matrix.json'), ('batteries', 'batteries.json'), ('corpus', 'corpus.json'), ('evidence', 'extension-evidence.json'))}
    summary = {'status': 'pass' if all(v['status'] == 'pass' for v in parts.values()) and guards['status'] == 'pass' else 'fail',
               'matrix': {k: parts['matrix'][k] for k in ('status', 'controls', 'negatives')},
               'batteries': {k: parts['batteries'][k] for k in ('status', 'cases', 'passed')},
               'corpus': {k: parts['corpus'][k] for k in ('status', 'cases', 'passed')},
               'evidence': {'status': parts['evidence']['status']},
               'guards': {k: guards[k] for k in ('status', 'tables', 'rows', 'proved', 'unproved', 'flips', 'stays', 'max_rows')}}
    (bundle / 'summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True) + '\n')
    return summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bundle', type=Path, required=True)
    parser.add_argument('--guard-dirs', type=Path, nargs='*', default=[])
    args = parser.parse_args()
    if args.guard_dirs:
        print(json.dumps(assemble(args.bundle, args.guard_dirs)))
    matrix = json.loads((args.bundle / 'matrix.json').read_text())
    corpus = json.loads((args.bundle / 'corpus.json').read_text())
    controls, negatives = c.cases()
    ss_rows = [r for r in w.ROWS if r[0].startswith('ss_')]
    applies = collections.Counter()
    for control in controls:
        if control['value']['family'] not in SS:
            continue
        _errors, values = w.evaluate(control['value'])
        for row, *_ in ss_rows:
            if values[row]['applies']:
                applies[row] += 1
    guard_rows = {}
    for path in sorted(args.bundle.glob('ss_*.json.gz')):
        report = json.load(gzip.open(path, 'rt'))
        for r in report['rows']:
            guard_rows[r['id']] = {'table': path.name[:-8], 'proved': r['proved'], 'own_witness': r['own'],
                                   'flips': len(r['flips']), 'stays': len(r['stays']), 'restoration_cases': len(r['restoration']),
                                   'restoration_ok': all(x['outcome'].get('accepted') is True or x['outcome'].get('guard') for x in r['restoration'])}
    mutations = [m for m in matrix['mutations'] if m['family'] in SS]
    coverage = []; ledger = []
    for row, group, kind, text in ss_rows:
        own = [m for m in mutations if m['guard'] == row]
        coverage.append({'predicate': row, 'table_group': group, 'kind': kind, 'invariant': text, 'owner_clauses': CLAUSES.get(row, []),
                         'controls_applying': applies[row], 'negatives': [m['id'] for m in own], 'guard': guard_rows.get(row)})
        ledger.append({'guard': row, 'expected_code': w.code_for(row), 'attempted': len(own), 'killed_exact': sum(m['killed'] for m in own),
                       'unexpected': [m['id'] for m in own if not m['killed']]})
    common = collections.Counter(m['guard'] for m in mutations if not m['guard'].startswith('ss_'))
    retained = [{'id': m['id'], 'guard': m['guard'], 'defect': m['defect'], 'actual': m['actual'], 'killed': m['killed']}
                for m in mutations if m['guard'] in ('sealed_dispatch', 'store_snapshot')]
    ss_controls = [x for x in controls if x['value']['family'] in SS]
    accepted = preserved = 0
    for control in ss_controls:
        _errors, values = w.evaluate(control['value'])
        accepted += values['sealed_dispatch']['left'] is None
        preserved += values['store_snapshot']['left'] == values['store_snapshot']['right']
    per_family = {}
    for family in sorted(SS):
        fm = [m for m in mutations if m['family'] == family]
        per_family[family] = {'controls': sum(1 for x in ss_controls if x['value']['family'] == family),
                              'mutations_all_rows': len(fm), 'killed_exact': sum(m['killed'] for m in fm),
                              'ss_row_negatives': sum(1 for m in fm if m['guard'].startswith('ss_')),
                              'corpus_cases': sum(1 for r in corpus['results'] if r['control'].startswith(family + '/')),
                              'corpus_passed': sum(1 for r in corpus['results'] if r['control'].startswith(family + '/') and r['pass'])}
    out = {'families': sorted(SS), 'coverage_matrix': coverage, 'mutation_ledger': ledger, 'per_family': per_family,
           'common_row_mutations_on_ss_controls': dict(common), 'invalid_mutations': invalid_mutations(controls),
           'retained': {'ss_controls': len(ss_controls), 'accepted_reads_unique_sealed_original': accepted,
                        'store_snapshot_preserved': preserved, 'refused_read_mutations': retained},
           'totals': {'ss_rows': len(ss_rows), 'ss_negatives': sum(x['attempted'] for x in ledger),
                      'ss_killed_exact': sum(x['killed_exact'] for x in ledger),
                      'ss_rows_proved': sum(1 for r in ss_rows if (guard_rows.get(r[0]) or {}).get('proved')),
                      'ss_mutations_all_rows': len(mutations), 'ss_mutations_all_rows_killed': sum(m['killed'] for m in mutations)}}
    (args.bundle / 'ss-evidence.json').write_text(json.dumps(out, indent=1, sort_keys=True, default=repr) + '\n')
    print(json.dumps(out['totals']), json.dumps({k: v for k, v in out['retained'].items() if k != 'refused_read_mutations'}))


if __name__ == '__main__':
    main()
