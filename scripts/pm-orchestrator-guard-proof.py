#!/usr/bin/env python3
"""DO sweep part 2A: the guard tables' matrix, their generated tool adapters and the guard-tool proof.

  matrix    every positive passes every row; every negative is refused by exactly one row, its target, across the
            whole boundary table (no early stop, no grouping); report rows with no single-defect negative
  generate  write one adapter per suite under scripts/do-guard-cases/ (the tool judges each file's table calls
            against that suite's own table, so every suite has its own file)
  check     the committed adapters equal the generated ones
  run       run the guard tool (scripts/pm_guard_isolation.py) on each suite, one at a time, and write the results

A suite is at most SUITE_SIZE consecutive rows of one stage table, with a projected value holding only the view keys
those rows read: the tool snapshots the whole value at every predicate instruction, so a full-lane value makes it
unusable (3.1 s per evaluation on one DO checkpoint case). The full-table matrix above is what proves isolation
across suites. Number-domain rows (NUMRULE, sweep part 2B) are tabled but not proved here.
"""
import argparse
import copy
import hashlib
import json
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_orchestrator_event_guards as guards  # noqa: E402
import pm_orchestrator_event_oracles as oracles  # noqa: E402
import importlib.util  # noqa: E402

_spec = importlib.util.spec_from_file_location('do_contracts', ROOT / 'scripts/pm-orchestrator-event-contracts.py')
contracts = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(contracts)

CASES_DIR = 'scripts/do-guards'
SUITE_SIZE = 5
NEGATIVES_PER_ROW = 2


# ---- Boundaries --------------------------------------------------------------------------------------------------

def checkpoint_tables():
    return [('RECIPE_ROWS', guards.RECIPE_ROWS)] + [(name, getattr(guards, name)) for name in oracles.CHECKPOINT_STAGES]


def recipe_negatives(case):
    """One single-defect negative per recipe row, from a valid retained case: each changes one evidence field, and
    the unsupported label is recorded with a witness for that label, so only the label is wrong."""
    def evidence(c):
        return c['historical_reader_state']['original_recipe_evidence']
    changes = (
        ('recipe_unsupported', 'recipe_supported', lambda c: oracles.record_recipe(c, 'ea-do-unsupported-v0')),
        ('recipe_unverified', 'recipe_evidence_verified', lambda c: evidence(c).update(verified=False)),
        ('recipe_value', 'recipe_evidence_value', lambda c: evidence(c)['value'].update(event_type='parser.error.foreign')),
        ('recipe_source_ref', 'recipe_evidence_source_ref', lambda c: evidence(c).update(
            source_ref='writer-recipe:evt_do_' + '0' * 64)),
        ('recipe_source_sha256', 'recipe_evidence_source_sha256', lambda c: evidence(c).update(
            source_sha256=oracles.foreign_hex(evidence(c)['source_sha256']))),
    )
    for name, target, change in changes:
        bad = copy.deepcopy(case)
        change(bad)
        yield 'recipe:' + name, bad, target


def token_schema_negative(case):
    bad = copy.deepcopy(case)
    bad['read']['read_token']['unregistered_probe'] = 'probe'
    return 'P2A:read_token_unknown_member', bad


# Negatives the lane checker keeps but that are not single-defect at the whole-table matrix, with the reason. They are
# reported, never credited, and never enter a tool suite.
LANE_ONLY = {
    'P1F05:bare_null_frame': 'schema-first form: the checkpoint schema allOf refuses a bare null frame before the '
                             'null-frame row, which also refuses it',
    'P1F05:incomplete_coverage': 'the pair of the schema const and its runtime duplicate `coverage_complete` (same '
                                 'field, same predicate, two codes): both refuse it',
}
TOKEN_LOOP = ('the read-token field loop of check_oracles asserts a non-empty refusal; its string forms also break '
              "the token schema's formats and patterns, so two rows refuse them (P1F06's token_* negatives are the "
              'single-defect ones)')


def checkpoint_inputs(fixtures):
    """(controls, negatives): controls are (id, case); negatives (id, case, expected codes or None, control id,
    lane-only reason or None)."""
    root, formats = contracts.ROOT, contracts.UTC_FORMAT
    events = fixtures['event_cases']
    bases = [next(c for c in events if c['logical_payload']['scope'] == 'project'),
             next(c for c in events if c['logical_payload']['scope'] == 'application')]
    controls = []
    for base in bases:
        controls.append((base['case_id'], base))
        controls.append((base['case_id'] + ':closed', oracles.closed_segment_case(base)))
        controls.append((base['case_id'] + ':compaction', oracles.compaction_control(base)))
        controls.append((base['case_id'] + ':gap', oracles.gap_control(base)))
    controls.append(('retained:' + fixtures['retained_event_cases'][0]['case_id'], fixtures['retained_event_cases'][0]))
    controls.append(('compatibility:' + fixtures['compatibility_event_cases'][0]['case_id'], fixtures['compatibility_event_cases'][0]))
    by_case = {id(case): cid for cid, case in controls}
    negatives = []
    for base in bases:
        closed = controls[[cid for cid, _ in controls].index(base['case_id'] + ':closed')][1]
        compaction = controls[[cid for cid, _ in controls].index(base['case_id'] + ':compaction')][1]
        for name, bad, codes, origin, _ in oracles.checkpoint_field_negatives(base):
            # The registry's bases are the case itself, its closed-segment control or its compaction control.
            control = base['case_id']
            if origin is not base:
                control = base['case_id'] + (':closed' if oracles.typed_tree(origin) == oracles.typed_tree(closed)
                                             else ':compaction' if oracles.typed_tree(origin) == oracles.typed_tree(compaction)
                                             else ':?')
            negatives.append((base['case_id'] + ':' + name, bad, codes, control, LANE_ONLY.get(name)))
        for name, bad, target in recipe_negatives(base):
            negatives.append((base['case_id'] + ':' + name, bad, ['historical_original_recipe'], base['case_id'], None))
        name, bad = token_schema_negative(base)
        negatives.append((base['case_id'] + ':' + name, bad, ['checkpoint_schema'], base['case_id'], None))
        for field in base['read']['read_token']:
            bad = copy.deepcopy(base)
            token = bad['read']['read_token']
            token[field] = (token[field] + 1 if isinstance(token[field], int) else
                            dict(token[field], manifest_generation=999) if isinstance(token[field], dict)
                            else token[field] + '-foreign')
            negatives.append((base['case_id'] + ':token:' + field, bad, None, base['case_id'], TOKEN_LOOP))
    view = lambda case: oracles.checkpoint_full_view(case, root, formats)
    return controls, negatives, view


BOUNDARIES = {
    'checkpoint': (checkpoint_tables, checkpoint_inputs),
}


# ---- Matrix ------------------------------------------------------------------------------------------------------

def all_rows(tables):
    return [row for _, rows in tables for row in rows]


def boundary_matrix(name, fixtures):
    tables_of, inputs_of = BOUNDARIES[name]
    tables = tables_of()
    rows = all_rows(tables)
    controls, negatives, view_of = inputs_of(fixtures)
    result = {'boundary': name, 'rows': [r[0] for r in rows], 'controls': [], 'negatives': [], 'errors': []}
    names = [r[0] for r in rows]
    assert len(set(names)) == len(names), 'duplicate row names'
    for cid, case in controls:
        refused = oracles.refusing_rows(rows, view_of(case))
        result['controls'].append({'id': cid, 'refused_by': refused})
        if refused:
            result['errors'].append(('control_refused', cid, refused))
    codes = {r[0]: r[3] for r in rows}
    for nid, case, expected, control, lane_only in negatives:
        view = view_of(case)
        refused = oracles.refusing_rows(rows, view)
        entry = {'id': nid, 'control': control, 'expected_codes': expected, 'refused_by': refused,
                 'view_keys': sorted(view)}
        if lane_only:
            entry['lane_only'] = lane_only
        elif len(refused) == 1 and (expected is None or codes[refused[0]] in expected):
            entry['target'] = refused[0]
        elif len(refused) > 1:
            entry['defect'] = 'refused_by_more_than_one_row'
        elif not refused:
            entry['defect'] = 'refused_by_no_row'
        else:
            entry['defect'] = 'refused_with_another_code'
        result['negatives'].append(entry)
    proved = {e['target'] for e in result['negatives'] if 'target' in e}
    result['unwitnessed_rows'] = [n for n in names if n not in proved]
    return result


def fixtures_now():
    return oracles.fixture_loads((ROOT / 'Plans/orchestrator_event_contract_fixtures.json').read_text())


def command_matrix(args):
    fixtures = fixtures_now()
    out = {}
    for name in args.boundary or BOUNDARIES:
        m = boundary_matrix(name, fixtures)
        out[name] = m
        defects = [e for e in m['negatives'] if 'defect' in e]
        print(json.dumps({'boundary': name, 'rows': len(m['rows']), 'controls': len(m['controls']),
                          'negatives': len(m['negatives']), 'control_errors': len(m['errors']),
                          'negative_defects': len(defects), 'unwitnessed_rows': m['unwitnessed_rows']}))
        for e in defects:
            print('  defect', e['id'], e['defect'], e['refused_by'], e['expected_codes'])
    if args.json:
        Path(args.json).write_text(json.dumps(out, indent=1, default=str) + '\n')


# ---- Adapters ----------------------------------------------------------------------------------------------------

FACTORY_MARKER = '# ---- generated factory ----\n'


def factory_text(rows):
    lines = ['', 'def factory():', '    table = g.GuardTable([']
    for name, subject, words, code, predicate, _reads, _group in rows:
        lines.append(f'        g.Guard({name!r}, g.Invariant({subject!r}, {words!r}), {code!r}, {predicate.__name__}),')
    lines += ['    ])', '    context = None', '', '    def check(complete):']
    lines += [f'        table.require({row[0]!r}, complete, context)' for row in rows]
    lines += ['        return True', '    return g.Case(table, check, context)', '']
    return '\n'.join(lines)


def suite_path(suite):
    return ROOT / CASES_DIR / ('do_' + suite + '.py')


def generated(suite, module):
    text = suite_path(suite).read_text()
    head, marker, _ = text.partition(FACTORY_MARKER)
    assert marker, ('factory marker missing', suite)
    return text, head + FACTORY_MARKER + factory_text(module.ROWS)


def adapter_errors():
    errors = []
    names = []
    for _table, suite, module in guards.SUITES:
        current, expected = generated(suite, module)
        if current != expected:
            errors.append('stale_adapter:' + suite)
        for row in module.ROWS:
            names.append(row[0])
            if row[0] != row[4].__name__ or row[4].__module__ != module.__name__:
                errors.append('row_predicate_name:' + row[0])
        defined = {n for n, v in vars(module).items() if callable(v) and getattr(v, '__module__', None) == module.__name__}
        if defined != {row[0] for row in module.ROWS} | {'factory'}:
            errors.append('suite_functions:' + suite + ':' + ','.join(sorted(defined ^ ({row[0] for row in module.ROWS} | {'factory'}))))
    if len(set(names)) != len(names):
        errors.append('duplicate_row_names')
    return errors


def command_generate(args):
    for _table, suite, module in guards.SUITES:
        current, expected = generated(suite, module)
        if current != expected:
            suite_path(suite).write_text(expected)
            print('wrote', suite_path(suite).relative_to(ROOT))
    return 0


def command_check(args):
    errors = adapter_errors()
    print(json.dumps({'adapters': len(guards.SUITES), 'errors': errors}))
    return 1 if errors else 0


# ---- Guard tool --------------------------------------------------------------------------------------------------

def suite_boundary(table):
    return next(name for name, (tables_of, _) in BOUNDARIES.items() if any(t == table for t, _ in tables_of()))


def suite_inputs(suite_name, fixtures):
    """The tool's controls and negatives for one suite, projected to the keys its rows read."""
    import pm_guard_isolation as g
    table, module = next((t, m) for t, s, m in guards.SUITES if s == suite_name)
    boundary = suite_boundary(table)
    matrix = boundary_matrix(boundary, fixtures)
    _, inputs_of = BOUNDARIES[boundary]
    controls, negatives, view_of = inputs_of(fixtures)
    rows = module.ROWS
    reads = sorted({key for row in rows for key in row[5]})
    project = lambda view: {key: view[key] for key in reads}
    targets = {row[0]: row[3] for row in rows}
    entries = {e['id']: e for e in matrix['negatives']}
    chosen, per_row = [], {}
    for nid, case, _codes, control, _lane in negatives:
        entry = entries[nid]
        target = entry.get('target')
        if target in targets and per_row.get(target, 0) < NEGATIVES_PER_ROW:
            per_row[target] = per_row.get(target, 0) + 1
            chosen.append((nid, case, target, control))
    used_controls = {c for *_, c in chosen}
    # Controls: every control a chosen negative was built from, plus the retained and compatibility originals (the
    # lane checker runs every positive through every row; the tool's controls are those the suite's negatives need).
    keep = used_controls | {cid for cid, _ in controls if cid.startswith(('retained:', 'compatibility:'))}
    tool_controls = [g.Control(cid, project(view_of(case)), 'retained_history') for cid, case in controls if cid in keep]
    tool_negatives = [g.Negative(nid, project(view_of(case)), target, targets[target], control,
                                 'lane negative ' + nid + ': one field changed from control ' + control)
                      for nid, case, target, control in chosen]
    missing = sorted(set(targets) - set(per_row))
    assert used_controls <= {c.id for c in tool_controls}, used_controls
    return module, tool_controls, tool_negatives, missing, reads


def run_suite(suite_name, out_dir):
    import pm_guard_isolation as g
    fixtures = fixtures_now()
    module, controls, negatives, missing, reads = suite_inputs(suite_name, fixtures)
    path = str(suite_path(suite_name).relative_to(ROOT))
    non_guards = [g.NonGuard(path, 'factory', 'return', 'return g.Case(table, check, context)',
                             'Plumbing: returns the fresh case object the engine runs; it decides no acceptance.')]
    suite = g.Suite('do:' + suite_name, module.factory, controls, negatives, (path,), ROOT, non_guards=non_guards)
    start = time.monotonic()
    report = g.run(suite, memory=g.MemoryGate(max_rss=4096, pause_when_low=10, resume_at=11, poll=30))
    seconds = time.monotonic() - start
    rows = [{'id': r['id'], 'proved': r.get('proved'), 'own': r.get('own'), 'flips': r.get('flips'),
             'stays': len(r.get('stays') or []), 'masked': r.get('masked'), 'unrelated_changes': r.get('unrelated_changes')}
            for r in report['rows']]
    summary = {'suite': suite_name, 'status': report['status'], 'seconds': round(seconds, 1),
               'evaluations': report.get('evaluations'), 'controls': [c.id for c in controls],
               'negatives': [[n.id, n.target] for n in negatives], 'rows_without_negative': missing, 'reads': reads,
               'failures': [{k: f[k] for k in f if k in ('kind', 'error', 'guards', 'modules', 'sites', 'errors')}
                            for f in report['failures']][:20],
               'rows': rows, 'static_status': report.get('static', {}).get('status'),
               'static_undeclared': [{k: s[k] for k in ('path', 'function', 'kind', 'source')}
                                     for s in report.get('static', {}).get('sites', []) if not s['non_guard']][:20],
               'static_errors': report.get('static', {}).get('errors', [])[:10],
               'source_sha256': hashlib.sha256(suite_path(suite_name).read_bytes()).hexdigest()}
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / (suite_name + '.json')).write_text(json.dumps(report, default=str) + '\n')
    (out / (suite_name + '.summary.json')).write_text(json.dumps(summary, indent=1, default=str) + '\n')
    print(json.dumps({k: summary[k] for k in ('suite', 'status', 'seconds', 'evaluations')}
                     | {'proved': sum(bool(r['proved']) for r in rows), 'rows': len(rows),
                        'failures': sorted({f['kind'] for f in summary['failures']})}), flush=True)
    return 0 if report['status'] == 'PASS' else 1


def command_run(args):
    import subprocess
    names = args.suite or [s for _t, s, _m in guards.SUITES]
    status = 0
    for name in names:
        done = Path(args.out) / (name + '.summary.json')
        if args.resume and done.exists():
            continue
        code = subprocess.call([sys.executable, '-B', __file__, 'run-suite', name, '--out', args.out])
        status = status or code
    return status


def command_run_suite(args):
    return run_suite(args.name, args.out)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('matrix')
    p.add_argument('--boundary', action='append')
    p.add_argument('--json')
    p.set_defaults(run=command_matrix)
    p = sub.add_parser('generate')
    p.set_defaults(run=command_generate)
    p = sub.add_parser('check')
    p.set_defaults(run=command_check)
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
