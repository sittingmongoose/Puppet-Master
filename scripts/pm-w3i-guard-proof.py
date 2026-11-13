#!/usr/bin/env python3
"""W3I guard-table proof driver (wave-3 phase 2).

  generate  write one Method-B adapter per suite under scripts/w3i-guards/
  check     the committed adapters equal the generated ones
  matrix    every control passes every row of its boundary; every negative is
            refused by exactly one row (its target) across the whole boundary
  run       run the gated guard tool (scripts/pm_guard_isolation.py) on each
            suite, one at a time, and write the results

A suite is at most SUITE_SIZE consecutive rows of one boundary table. The
projected value holds only the verdict keys those rows read. The complete
checker (pm_w3i_continuity_oracles.main) is what proves the validation logic;
this driver proves refusal attribution with the shared tool.
"""
import argparse
import hashlib
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3i_continuity_oracles as oracles  # noqa: E402

CASES_DIR = 'scripts/w3i-guards'
SUITE_SIZE = 5
BOUNDARY_LABEL = {'append': 'append', 'retry': 'append', 'derived': 'append',
                  'withdrawal': 'append', 'retained': 'retained_history'}


def boundary_rows(boundary):
    return [(row, code, fn) for row, b, code, fn in oracles.CHECKS if b == boundary]


def suites():
    witnessed = {row for row, _b, _f, _c, _n in oracles.negatives}
    out = []
    for boundary in oracles.BOUNDARIES:
        rows = boundary_rows(boundary)
        provable = [r for r in rows if r[0] in witnessed]
        unprovable = [r for r in rows if r[0] not in witnessed]
        for i in range(0, len(provable), SUITE_SIZE):
            chunk = provable[i:i + SUITE_SIZE]
            name = '%s_%d' % (boundary, i // SUITE_SIZE + 1)
            out.append((boundary, name, chunk))
        # An unproved row sits alone in its own table with a written proof.
        for row, code, fn in unprovable:
            out.append((boundary, '%s_unproved_%s' % (boundary, row), [(row, code, fn)]))
    return out


def predicate_source(row, code):
    return (
        "def %s(value, context):\n"
        "    return %r if value['verdicts'].get(%r) is not True else None\n"
    ) % (row, code, row)


def factory_source(rows):
    lines = ['', 'def factory():', '    table = g.GuardTable([']
    for row, code, _fn in rows:
        invariant = INVARIANTS[row]
        lines.append("        g.Guard(%r, g.Invariant(%r, %r), %r, %s)," % (
            row, invariant[0], invariant[1], code, row))
    lines += ['    ])', '    context = None', '', '    def check(complete):']
    for row, _code, _fn in rows:
        lines.append("        table.require(%r, complete, context)" % row)
    lines += ['        return True', '    return g.Case(table, check, context)', '']
    return '\n'.join(lines)


# One declared invariant per row: (field path, predicate in words).
INVARIANTS = {
    'append_admission': ('/admitted', "this exact family/version is admitted before any effect"),
    'append_envelope_schema': ('/event', "validates against the EventRecord shape"),
    'append_payload_schema': ('/event/payload', "validates against the family's closed payload shape"),
    'append_id_tokens': ('/event/payload', "every ID/ref is a bounded ASCII token without CR/LF (full-match)"),
    'append_timestamps': ('/event', "each timestamp meets its owner profile (event_record / storage_utc_z)"),
    'append_scope': ('/event/scope_kind', "Project scope and the exact original Project"),
    'append_partition': ('/scope_partition', "equals project~base64url_no_pad(UTF8(project_id))"),
    'append_source_resolved': ('/source/resolved', "the original source observation is independently resolved"),
    'append_source_identity': ('/event/payload/source_event_id', "equals the durably issued original, never this event"),
    'append_fact_actor': ('/event/payload/actor_ref', "actor_ref/actor_kind equal the resolved original principal/kind"),
    'append_fact_provenance': ('/event/payload/provenance_ref', "provenance resolves the retained output naming the source"),
    'append_fact_redaction': ('/event/payload/redaction_decision', "equals the actual applied original redaction result"),
    'append_fact_replay': ('/event/payload/replay_checkpoint_ref', "resolves an upstream checkpoint whose prefix includes the source"),
    'append_envelope_copies': ('/event', "causation/parent/correlation/occurred and source copies join exactly"),
    'append_event_id': ('/event/event_id', "equals evt_continuity_ + SHA-256 of the recomputed tuple"),
    'append_idempotency_key': ('/event/idempotency_key', "equals continuity@1: + the same digest"),
    'append_replay_only': ('/event/replay_policy', "current write/retry is never projector_replay_only"),
    'append_replay_policy': ('/event/replay_policy', "selects dedupe_by_idempotency_key"),
    'append_dedupe': ('/dedupe_caught_up', "authoritative lifetime dedupe catch-up is verified"),
    'append_semantic_digest': ('/custody_receipt/producer_semantic_digest', "equals the CV-317 producer-semantic digest"),
    'append_sequence_uint64': ('/event/sequence_id', "is Storage's exact uint64 (storage_uint64)"),
    'append_full_value': ('/custody_receipt/original_event_value_commitment/sha256', "equals the CV-339 full-value commitment"),
    'append_receipt': ('/custody_receipt/first_append_receipt', "the eleven receipt fields equal Storage's own record"),
    'append_pack': ('/payload_pack', "SP-337 pack ID/size/media-type/body relation recomputed from actual bytes"),
    'append_inline_limit': ('/event/payload', "an inline body is at most 16 KiB encoded"),
    'retry_identity': ('/retry_event/event_id', "the retry preserves the original identity"),
    'retry_semantic': ('/retry_event', "the caller-semantic body equals the original (no conflict)"),
    'retry_replay_only': ('/retry_event/replay_policy', "a retry is never projector_replay_only"),
    'retry_custody': ('/retry_returned_receipt_hex', "lost-ack returns the original sealed receipt"),
    'retry_no_new_event': ('/retry_sequence_unchanged', "an unchanged observation creates no new event"),
    'retained_receipt_present': ('/sealed_receipts', "a sealed receipt exists for this exact original"),
    'retained_receipt_unique': ('/sealed_receipts', "exactly one sealed receipt resolves the original"),
    'retained_receipt_binding': ('/sealed_receipts/0/binding', "the receipt binds this exact original"),
    'retained_recipe_override': ('/retained_recipe_override', "no caller-supplied recipe override"),
    'retained_recipe_known': ('/sealed_receipts/0/recipe', "the sealed recipe is in the frozen map"),
    'retained_frozen_verify': ('/sealed_receipts/0/record_hex', "the frozen verifier recomputes every original join"),
    'retained_disclosure': ('/disclosure_allowed', "current permitted disclosure allows the read"),
    'retained_no_current_gate': ('/retained_current_gate_applied', "the current writer gate never runs on a retained original"),
    'retained_no_receipt_creation': ('/receipt_created_on_read', "reading creates no receipt"),
    'retained_withdrawn': ('/family_withdrawn', "the family/original is not withdrawn"),
    'retained_rebuild': ('/rebuild_matches', "compatibility/replay-only rebuild yields the same derived state"),
    'projection_schema': ('/projection', "validates against the projection shape"),
    'projection_join': ('/projection', "key/body/sequence/publication joins equal the original"),
    'checkpoint_schema': ('/checkpoint', "validates against the checkpoint shape"),
    'checkpoint_token': ('/checkpoint/index_read_token', "the nine-field durable token joins exactly"),
    'checkpoint_prefix': ('/checkpoint', "complete inclusive global prefix through the event"),
    'checkpoint_cursor': ('/checkpoint/source_cursor', "segment/offset/last-sequence/last-event joins"),
    'checkpoint_cas': ('/cas_expected', "the prior publication matches the CAS expectation"),
    'checkpoint_atomic': ('/transaction_committed', "projection and checkpoint commit together"),
    'checkpoint_size': ('/checkpoint', "each derived value is at most 16 KiB encoded"),
    'checkpoint_retired': ('/checkpoint/retired_publications', "at most two retired cores hold original tokens"),
    'checkpoint_state': ('/checkpoint/state', "current has null withdrawn_at; withdrawn has a valid time"),
    'derived_numbers': ('/checkpoint', "every derived integer slot is Storage's exact uint64"),
    'withdrawal_cutoff': ('/writer_cutoff_applied', "writers are cut off before withdrawal"),
    'withdrawal_once': ('/withdrawal_marks', "the publication is withdrawn exactly once"),
    'withdrawal_fence': ('/reader_fenced', "readers/projectors are fenced from the withdrawn publication"),
    'successor_rebuild': ('/successor_verified', "the successor is rebuilt and verified before the CAS switch"),
    'replay_audit_only': ('/replay_effects', "replay produces no external effect or publication"),
    'outcome_honest': ('/reported_outcome', "a failed/unavailable outcome is never reported as success"),
}


def adapter_text(boundary, name, rows):
    header = ('"""W3I guard suite `%s` (wave-3 phase 2). Boundary: %s.\n\n'
              'Generated by scripts/pm-w3i-guard-proof.py generate; do not edit.\n'
              'Each row reads its verdict from the complete checker.\n"""\n'
              'import pm_guard_isolation as g\n\n\n') % (name, boundary)
    preds = '\n\n'.join(predicate_source(row, code) for row, code, _fn in rows)
    return header + preds + '\n' + factory_source(rows)


def suite_path(name):
    return ROOT / CASES_DIR / ('w3i_' + name + '.py')


def command_generate(args):
    (ROOT / CASES_DIR).mkdir(parents=True, exist_ok=True)
    for boundary, name, rows in suites():
        suite_path(name).write_text(adapter_text(boundary, name, rows))
    init = ROOT / CASES_DIR / '__init__.py'
    if not init.exists():
        init.write_text('')
    print('generated %d suites' % len(suites()))
    return 0


def command_check(args):
    bad = []
    for boundary, name, rows in suites():
        want = adapter_text(boundary, name, rows)
        path = suite_path(name)
        if not path.exists() or path.read_text() != want:
            bad.append(name)
    print(json.dumps({'status': 'pass' if not bad else 'fail', 'mismatched': bad}))
    return 0 if not bad else 1


def project(case, rows):
    verdicts = oracles.compute_verdicts(case)
    return {'verdicts': {row: verdicts[row] for row, _code, _fn in rows}}


def suite_inputs(boundary, name, rows):
    import pm_guard_isolation as g
    targets = {row: code for row, code, _fn in rows}
    controls = []
    for cid, case in oracles.controls:
        cb = cid.split(':')[0]
        if oracles_boundary(cb) == boundary:
            controls.append(g.Control(cid, project(case, rows), BOUNDARY_LABEL[boundary]))
    negatives = []
    for idx, (row, b, family, control_id, bad) in enumerate(oracles.negatives):
        if b == boundary and row in targets:
            negatives.append(g.Negative(
                '%s:%s:%s:%d' % (row, family, control_id, idx), project(bad, rows), row,
                targets[row], control_id,
                'single-defect witness for %s from control %s' % (row, control_id)))
    return controls, negatives


def oracles_boundary(control_prefix):
    return {'append': 'append', 'pack': 'append', 'retry': 'retry', 'derived': 'derived',
            'withdrawal': 'withdrawal', 'retained': 'retained', 'retained-live': 'retained',
            'compatibility': 'retained'}[control_prefix]


def run_suite(boundary, name, rows, out_dir):
    import pm_guard_isolation as g
    import importlib.util
    path = suite_path(name)
    spec = importlib.util.spec_from_file_location('w3i_' + name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules['w3i_' + name] = module
    spec.loader.exec_module(module)
    controls, negatives = suite_inputs(boundary, name, rows)
    rel = str(path.relative_to(ROOT))
    non_guards = [g.NonGuard(rel, 'factory', 'return', 'return g.Case(table, check, context)',
                             'Plumbing: returns the fresh case object the engine runs; it decides no acceptance.')]
    suite = g.Suite('w3i:' + name, module.factory, controls, negatives, (rel,), ROOT, non_guards=non_guards)
    start = time.monotonic()
    report = g.run(suite, memory=g.MemoryGate(max_rss=1536, pause_when_low=10, resume_at=11, poll=30))
    seconds = time.monotonic() - start
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / (name + '.json')).write_text(json.dumps(report, default=str) + '\n')
    rows_summary = [{'id': r['id'], 'proved': r.get('proved'), 'flips': r.get('flips'),
                     'stays': len(r.get('stays') or []), 'masked': r.get('masked')} for r in report['rows']]
    summary = {'suite': name, 'boundary': boundary, 'status': report['status'],
               'seconds': round(seconds, 1), 'controls': [c.id for c in controls],
               'negatives': [[n.id, n.target] for n in negatives], 'rows': rows_summary,
               'failures': [{k: f[k] for k in f if k in ('kind', 'error', 'guards')} for f in report['failures']][:20],
               'source_sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
    (out / (name + '.summary.json')).write_text(json.dumps(summary, indent=1, default=str) + '\n')
    print(json.dumps({'suite': name, 'status': report['status'], 'seconds': round(seconds, 1),
                      'proved': sum(bool(r['proved']) for r in rows_summary), 'rows': len(rows_summary)}), flush=True)
    return 0 if report['status'] == 'PASS' else 1


def command_run(args):
    status = 0
    for boundary, name, rows in suites():
        if args.suite and name not in args.suite:
            continue
        done = Path(args.out) / (name + '.summary.json')
        if args.resume and done.exists():
            continue
        code = subprocess.call([sys.executable, '-B', __file__, 'run-suite', name, '--out', args.out])
        status = status or code
    return status


def command_run_suite(args):
    for boundary, name, rows in suites():
        if name == args.name:
            return run_suite(boundary, name, rows, args.out)
    print('unknown suite: ' + args.name)
    return 2


def command_matrix(args):
    failures = []
    codes = {row: code for row, _b, code, _fn in oracles.CHECKS}
    for boundary in oracles.BOUNDARIES:
        rows = boundary_rows(boundary)
        for cid, case in oracles.controls:
            if oracles_boundary(cid.split(':')[0]) != boundary:
                continue
            verdicts = oracles.compute_verdicts(case)
            for row, _code, _fn in rows:
                if verdicts[row] is not True:
                    failures.append({'control': cid, 'row': row})
        for row, b, family, control_id, bad in oracles.negatives:
            if b != boundary:
                continue
            verdicts = oracles.compute_verdicts(bad)
            failing = [r for r, _c, _f in rows if verdicts[r] is not True]
            if failing != [row]:
                failures.append({'negative': row, 'family': family, 'failing': failing})
    print(json.dumps({'status': 'pass' if not failures else 'fail', 'failures': failures[:50]}, indent=1))
    return 0 if not failures else 1


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('generate').set_defaults(run=command_generate)
    sub.add_parser('check').set_defaults(run=command_check)
    sub.add_parser('matrix').set_defaults(run=command_matrix)
    p = sub.add_parser('run')
    p.add_argument('--suite', action='append')
    p.add_argument('--out', required=True)
    p.add_argument('--resume', action='store_true')
    p.set_defaults(run=command_run)
    p = sub.add_parser('run-suite')
    p.add_argument('name')
    p.add_argument('--out', required=True)
    p.set_defaults(run=command_run_suite)
    args = parser.parse_args(argv)
    return args.run(args)


if __name__ == '__main__':
    sys.exit(main())