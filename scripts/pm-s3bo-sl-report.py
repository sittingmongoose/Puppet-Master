#!/usr/bin/env python3
"""C12-SL evidence tables: coverage matrix, mutation ledger and retained-store observations.

Reads a completed bundle (matrix.json, corpus.json and the per-table guard
reports) and writes, for the four SL Storage families: owner clause ->
predicate -> controls -> single-defect negatives -> gated cut (own flip, peer
stays) -> restoration; the exact expected-code mutation ledger, with the
separately executed INVALID (multi-refusal) mutations that earn no kill; the
retained read observations of every SL control; and, with --guard-dirs, the
merge and reuse verification of guard reports produced elsewhere (for example
the C12-SR bundle for the common and SR tables). Writes nothing into the
repository.
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

SL = {'storage.compaction_lifecycle_changed', 'storage.deletion_lifecycle_changed', 'storage.retention_hold_changed',
      'storage.value_quarantine_changed'}
SP = 'Plans/storage-plan.md'
CLAUSES = {
    'sl_del_decision': ['Thread/project deletion: ordinary graph and failure ingress', 'Case L-3 retry successor failed -> logically_hidden only (DL-695, E11-1 A)', 'admission order is fail closed', 'K37 deletion negatives (edges, holds, tombstone, generation, scope, writer)'],
    'sl_del_zero': ['Thread/project deletion: every refusal has zero append/mutation/projection/checkpoint/dispatch/hold clear'],
    'sl_del_record': ['SP-2200 Producer (2) record CAS + event_refs + event_obligation in the same row', 'storage_deletion_record schema (purge_state, generation, hide receipt, event_obligation)'],
    'sl_del_order': ['SP-2200 Producer (1)-(5)', 'ATS-2200 Producer and order negatives'],
    'sl_del_effects': ['SP-2200 Producer (5) hide / purge dispatch', 'UI/command acceptance is not purge authority'],
    'sl_del_payload': ['Thread/project deletion: payload spine and state conditionals', 'CV deletion row (Contracts_V0)'],
    'sl_del_identity': ['SP-2200 Identity (component, CV-366 / storage-deletion@1 key, er_del_)'],
    'sl_del_envelope': ['SP-2200 Identity: envelope project/thread/run/attempt', 'CV-319 dual scope'],
    'sl_del_retry': ['Thread/project deletion: retry reuses deletion_id and request identity, revalidates holds, tombstone, scope, writer and purge/compaction authority', 'Case L-3 retry successor logically_hidden (DL-695)', 'SP-2200 next ordinal after failed'],
    'sl_del_replay': ['SP-2200 Replay', 'ATS-2200 Replay'],
    'sl_del_resume': ['SP-2200 Producer: crash before (3) resumes the obligation stored in event_obligation; after the commit frame resolves the original receipt'],
    'sl_del_handler': ['SP-2200 Producer: handlers only submit', 'Remove project from list is a registry/UI tombstone', 'separately confirmed destructive intent'],
    'sl_del_reader': ['SP-2200 Consumer and checkpoint', 'ATS-2200 Consumer'],
    'sl_del_withdrawal': ['SP-2200 Compatibility and withdrawal', 'ATS-2200 Withdrawal'],
    'sl_del_restore': ['Thread/project deletion: backups at most 30 days unless held, tombstone replay before visibility'],
    'sl_del_deadline': ['Thread/project deletion: purge within 24 hours unless held'],
    'sl_del_numbers': ['SP-2200 Numbers (CV-1100)'],
    'sl_del_time': ['SP-2200 Numbers and timestamps (CV-1101 profiles)'],
    'sl_qtn_detect': ['SP-2201 Identity: occurrence and re-detection', 'ATS-2201 Identity'],
    'sl_qtn_decision': ['Invalid-value quarantine: closed edges, resettable-only reset, unknown schema stays recovery_blocked', 'K37 quarantine class/state pairs', 'DL-068 disposal boundary', 'SP-2211 holds still apply'],
    'sl_qtn_zero': ['K37 quarantine: each refusal has zero append/live mutation/purge/hold action'],
    'sl_qtn_record': ['SP-2201 Producer (2) record CAS + event_obligation in the same row', 'storage_quarantine_record transition_receipts continuity and event_obligation', 'E8-5 resolution output binding'],
    'sl_qtn_order': ['Invalid-value quarantine: raw custody synchronized before live-key mutation', 'SP-2201 Producer (1)-(5)'],
    'sl_qtn_effects': ['SP-2201 Producer (5)', 'DL-068 raw content removal'],
    'sl_qtn_payload': ['SP-2201 Custody and redaction (hashes and refs only)', 'CV quarantine row'],
    'sl_qtn_identity': ['SP-2201 Identity (component with state, er_qtn_)'],
    'sl_qtn_envelope': ['SP-2201 Identity: envelope thread only for the source thread'],
    'sl_qtn_retire': ['DL-068: operational records retire after settled purge and released dependencies; Source evidence unavailable'],
    'sl_qtn_cap': ['Invalid-value quarantine: unresolved critical never cap-evicted; cap pressure blocks new mutation-capable writes'],
    'sl_qtn_disclosure': ['SP-2201 Custody and redaction: read-time recheck; protected explicit export'],
    'sl_qtn_restore': ['SP-2201 Custody: backup/restore raw custody or unavailable; never re-run a live-key effect'],
    'sl_qtn_resume': ['SP-2201 Producer: crash resumes the obligation stored in event_obligation, never re-copies, repeats a live-key mutation or purges twice'],
    'sl_qtn_withdrawal': ['SP-2201 Compatibility and withdrawal'],
    'sl_qtn_replay': ['SP-2201 Replay'],
    'sl_qtn_numbers': ['SP-2201 Numbers (CV-1100)'],
    'sl_qtn_time': ['SP-2201 Numbers and timestamps (CV-1101)'],
    'sl_hold_admission': ['SP-288 Protected command, scope and lifetime: admission conditions', 'SP-2208 post-restore acceptance', 'K37 hold negatives'],
    'sl_hold_zero': ['SP-288: a pre-admission refusal creates no append, mutation or hold action', 'original command replay'],
    'sl_hold_identity': ['SP-288 Immutable intent, event and result: hold-transition binding, evt_hold_, logical receipt'],
    'sl_hold_event': ['SP-288: the full EventRecord and payload equal the original producer intent'],
    'sl_hold_core': ['SP-288: set and clear cores; other hold values untouched'],
    'sl_hold_phase': ['SP-288 HoldV2 phases; one set and at most one clear; cleared terminal'],
    'sl_hold_result': ['SP-288 OwnerResult; only a fully committed slot exposes SIR success'],
    'sl_hold_order': ['SP-288 Pending admission, barrier append and terminal publication (1)-(6)'],
    'sl_hold_sir': ['SP-288 Same-row original and current SIR custody (no regression)', 'accepted without acknowledgement cannot append'],
    'sl_hold_union': ['Holds and recovery anchors: union, never clear automatically', 'K37: clearing one hold never clears another'],
    'sl_hold_resume': ['SP-288 First-receipt adoption and crash cuts', 'failed commit never reports success'],
    'sl_hold_restore': ['SP-288 Whole-row backup and restore: no first-mint', 'SP-2208'],
    'sl_hold_history': ['SP-288 Passive current history'],
    'sl_hold_legacy': ['SP-288 legacy_admitted_v1_protection, null original_set_receipt'],
    'sl_hold_numbers': ['CV-339 receipt integers (storage_uint64)'],
    'sl_hold_time': ['CV-1101 date_time (SIR capture times)'],
    'sl_cmp_admission': ['SP-296 Original admission, immutable identity (G02, G03)', 'Compaction lifecycle: retry after failed is a new compaction_id'],
    'sl_cmp_graph': ['phases.json complete adjacency', 'G17'],
    'sl_cmp_phase': ['Compaction phase meanings', 'exceptional predicates', 'G18', 'G20'],
    'sl_cmp_disposition': ['SP-296 unresolved reservation disposition', 'G04', 'G19'],
    'sl_cmp_identity': ['identity.json transition recipe', 'Phase observations: evt_storage_compaction_ and key'],
    'sl_cmp_event': ['G06 Producer', 'frozen_producer schema', 'failure_reason exactly for recovery_required|failed'],
    'sl_cmp_actions': ['Compaction lifecycle event action contract (checkpoint_action, projection_action)'],
    'sl_cmp_aftermath': ['Action tokens and phase claims', 'failed forbids activation/checkpoint/source deletion', 'G21'],
    'sl_cmp_publication': ['Immutable-segment compaction: publication order 1-4', 'DL-270 split activation', 'G13', 'G16'],
    'sl_cmp_authority': ['Authority order: CURRENT sole selector', 'G09', 'G32', 'SP-2206 passive consumer'],
    'sl_cmp_core': ['Builder: exact retained set', 'G11 Core and removal'],
    'sl_cmp_restart': ['Compaction lifecycle: restart rules', 'G20'],
    'sl_cmp_delivery': ['Phase observations: drain in legal predecessor order', 'G22'],
    'sl_cmp_terminal': ['Settlement: original terminal publisher', 'G25', 'SP-297'],
    'sl_cmp_detail': ['DL-049 RP-COMPACTION-DETAIL-7D', 'G26', 'SP-297'],
    'sl_cmp_members': ['Settlement: eligible and forbidden detail', 'G27', 'G28'],
    'sl_cmp_retirement': ['Settlement: retirement intent id, recheck, receipt then intent clear', 'G29', 'G30'],
    'sl_cmp_backup': ['Settlement: coherent backup and restore', 'G31'],
    'sl_cmp_role': ['SP-295 original installed role', 'G01'],
    'sl_cmp_effect_plan': ['identity.json effect recipe', 'SP-296 effect plans before each effect', 'G05', 'G07'],
    'sl_cmp_groups': ['G08 Shared admission (one-event barrier lifecycle groups, DL-270)'],
    'sl_cmp_bytes': ['Source, candidate and visibility publication: scan from byte zero', 'G10', 'G12'],
    'sl_cmp_translation': ['G14 Original translation source', 'G15 Current versus historical locators'],
    'sl_cmp_continuation': ['Phase observations: G21 narrow internal continuation'],
    'sl_cmp_source_successor': ['Phase observations: source-side successor after a sealed carrier', 'G23'],
    'sl_cmp_final_fence': ['Phase observations: G24 inside every original publisher'],
    'sl_cmp_journal': ['Settlement: mutable journal with a needed member', 'G28'],
    'sl_cmp_numbers': ['storage_uint64 (u64 detail member lengths)'],
    'sl_cmp_time': ['CV-1101 date_time (proof capture / occurrence)'],
}
# Rows dropped as entailed (no independent single-defect witness can exist).
ENTAILED = [
    {'row': 'sl_del_event_schema', 'entailed_by': 'sl_del_payload', 'proof': 'sl_del_payload compares each appended payload to the owner-derived payload, which validates under the complete registered schema in every control (extension evidence); any schema violation is therefore also a payload inequality.'},
    {'row': 'sl_del_record_schema', 'entailed_by': 'sl_del_record / sl_del_zero', 'proof': 'Every presented record is compared whole to its unchanged preimage (sl_del_zero) or, for an admitted step, to the owner-derived record without its obligation, with the stored obligation compared on its identity, payload and envelope to the owner-derived values and on every other producer field to the appended event (sl_del_record, C12-SL2). Every derived record, obligation included, validates under the complete storage_deletion_record schema (extension evidence), so a single-copy schema violation is also an inequality.'},
    {'row': 'sl_qtn_once', 'entailed_by': 'sl_qtn_identity + common quarantine_edge', 'proof': 'The event identity of a quarantine state is a function of (quarantine_id, state) and the edge set is acyclic, so a repeated state either reuses the identity (a replay, sl_qtn_replay/sl_qtn_payload count) or needs a forbidden edge.'},
]


def invalid_mutations(controls):
    by_id = {x['id']: x for x in controls}
    out = []
    specs = [
        ('storage.deletion_lifecycle_changed/sl/project-held', 'sl_del_payload', ('sl', 'runs', 1, 'events_appended'), [],
         'Drop the appended event of an admitted step: the payload row, the record row (its stored obligation no longer matches an appended event) and the replay of that event refuse.'),
        ('storage.deletion_lifecycle_changed/sl/retry-hides-then-holds', 'sl_del_decision', ('sl', 'runs', 3, 'to'), 'requested',
         'Present the admitted retry as a retry to requested (DL-695 option B, not chosen): the edge stage refuses it, so the decision and zero-effect rows refuse together with the rows built on its hidden state.'),
        ('storage.value_quarantine_changed/sl/resettable-lifecycle', 'sl_qtn_detect', ('sl', 'value', 'raw_sha256'), 'c' * 64,
         'Change the held raw hash: identity, payload and record expectations all move, so several rows refuse.'),
        ('storage.compaction_lifecycle_changed/sl/recovery-to-committed', 'sl_cmp_phase', ('sl', 'runs', 5, 'facts', 'activation'), 'incomplete',
         'Withdraw the activation proof of the recovery exit: the whole later walk changes, so graph, phase, disposition and event rows refuse.'),
        ('storage.retention_hold_changed/sl/set-clear', 'sl_hold_identity', ('sl', 'runs', 0, 'request', 'arguments', 'reason'), 'other reason',
         'Change the original request reason: the transition binding, event, core and result expectations all move, so several rows refuse.'),
    ]
    for control_id, row, path, replacement, why in specs:
        value = copy.deepcopy(by_id[control_id]['value']); c.set_path(value, path, replacement)
        errors, _ = w.evaluate(value)
        out.append({'control': control_id, 'intended_row': row, 'path': list(path), 'replacement': repr(replacement),
                    'actual': errors, 'kill': errors == [(row, w.code_for(row))],
                    'disposition': 'INVALID: multiple independent refusals' if len(errors) > 1 else 'single refusal (not INVALID)', 'why': why})
    return out


def assemble(bundle, guard_dirs):
    """Merge guard runs into the bundle; reuse a table proof only when its consumed inputs, module and tool are unchanged."""
    spec = importlib.util.spec_from_file_location('s3bo_check', str(w.ROOT / 'scripts/pm-s3bo-check.py'))
    check = importlib.util.module_from_spec(spec); spec.loader.exec_module(check)
    tool = hashlib.sha256((w.ROOT / 'scripts/pm_guard_isolation.py').read_bytes()).hexdigest()
    verified = []
    for name in w.table_names():
        source = next((d for d in guard_dirs if (d / (name + '.summary.json')).exists()), None)
        if source is None:
            raise SystemExit('no guard report for ' + name)
        if source.resolve() != bundle.resolve():
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
            raise SystemExit('guard proof cannot be reused for ' + name + ': ' + json.dumps(verified[-1]))
    guards = check.summarize(bundle, 0)
    guards['reuse_verification'] = verified
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
    controls, _negatives = c.cases()
    sl_rows = [r for r in w.ROWS if r[0].startswith('sl_')]
    applies = collections.Counter()
    for control in controls:
        if control['value']['family'] not in SL:
            continue
        _errors, values = w.evaluate(control['value'])
        for row, *_ in sl_rows:
            if values[row]['applies']:
                applies[row] += 1
    guard_rows = {}
    for path in sorted(args.bundle.glob('sl_*.json.gz')):
        report = json.load(gzip.open(path, 'rt'))
        for r in report['rows']:
            guard_rows[r['id']] = {'table': path.name[:-8], 'proved': r['proved'], 'own_witness': r['own'],
                                   'flips': len(r['flips']), 'stays': len(r['stays']), 'restoration_cases': len(r['restoration'])}
    mutations = [m for m in matrix['mutations'] if m['family'] in SL]
    coverage = []; ledger = []
    for row, group, kind, text in sl_rows:
        own = [m for m in mutations if m['guard'] == row]
        coverage.append({'predicate': row, 'table_group': group, 'kind': kind, 'invariant': text, 'owner_clauses': CLAUSES.get(row, []),
                         'controls_applying': applies[row], 'negatives': [m['id'] for m in own], 'guard': guard_rows.get(row)})
        ledger.append({'guard': row, 'expected_code': w.code_for(row), 'attempted': len(own),
                       'killed_exact': sum(m['killed'] for m in own), 'unexpected': [m['id'] for m in own if not m['killed']]})
    common = collections.Counter(m['guard'] for m in mutations if not m['guard'].startswith('sl_'))
    retained = [{'id': m['id'], 'guard': m['guard'], 'defect': m['defect'], 'actual': m['actual'], 'killed': m['killed']}
                for m in mutations if m['guard'] in ('sealed_dispatch', 'store_snapshot')]
    sl_controls = [x for x in controls if x['value']['family'] in SL]
    accepted = preserved = 0
    for control in sl_controls:
        _errors, values = w.evaluate(control['value'])
        accepted += values['sealed_dispatch']['left'] is None
        preserved += values['store_snapshot']['left'] == values['store_snapshot']['right']
    per_family = {f: {'controls': sum(1 for x in sl_controls if x['value']['family'] == f),
                      'mutations': sum(1 for m in mutations if m['family'] == f),
                      'killed': sum(m['killed'] for m in mutations if m['family'] == f)} for f in sorted(SL)}
    out = {'families': sorted(SL), 'coverage_matrix': coverage, 'mutation_ledger': ledger, 'entailed_rows_removed': ENTAILED,
           'common_row_mutations_on_sl_controls': dict(common), 'invalid_mutations': invalid_mutations(controls),
           'per_family': per_family,
           'retained': {'sl_controls': len(sl_controls), 'accepted_reads_unique_sealed_original': accepted,
                        'store_snapshot_preserved': preserved, 'refused_read_mutations': retained},
           'totals': {'sl_rows': len(sl_rows), 'sl_negatives': sum(x['attempted'] for x in ledger),
                      'sl_killed_exact': sum(x['killed_exact'] for x in ledger),
                      'sl_rows_with_witness': sum(1 for x in ledger if x['attempted']),
                      'sl_rows_proved': sum(1 for r in sl_rows if (guard_rows.get(r[0]) or {}).get('proved')),
                      'sl_mutations_all_rows': len(mutations), 'sl_mutations_all_rows_killed': sum(m['killed'] for m in mutations)}}
    (args.bundle / 'sl-evidence.json').write_text(json.dumps(out, indent=1, sort_keys=True, default=repr) + '\n')
    print(json.dumps(out['totals']), json.dumps({k: v for k, v in out['retained'].items() if k != 'refused_read_mutations'}))


if __name__ == '__main__':
    main()
