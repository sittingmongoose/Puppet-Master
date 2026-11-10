#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over the DG6A guard-table phase suites.

Sweep part 2A phases so far, all in pm-card5-event-contracts-check.py:
`decision_citation`, `storage_schema` (one suite row per registered surface
row), `current_header` and `current_context` (the first and second chains of
current_errors); table modules are pm_dg6a_table_<phase>.py. Witnesses are
collected by running the checker's own one-defect cases for all nine Card 5
families under its recorders: an accepted observation is a control, a
refused one is a negative targeted at its first (for current_context: its
only) refusing row. This runner is unscanned
adapter code; the tool scans only the table module of the phase under test.
Credit is copied from the tool's own report; this driver adds none.

Generated phases (scripts/pm-dg6a-table-generate.py; dispatched by
scripts/pm_dg6a_tables.py) are collected in one pass: every complete family
suite (alert x4, panel x2, concern.created, Card 5 x9) runs its own main()
under pm_dg6a_tables.RECORDER. A passing phase evaluation is a control; an
evaluation refused by exactly one row is a negative of that row; one refused
by two or more rows is reported (not_single_row) and never used as proof.
The lane matrix checks every distinct negative against every row of its
table; the tool then runs per table on up to --per-row negatives per row
(families round-robin) and up to ten controls.

Usage: python3 scripts/pm-dg6a-guard-tables.py --out <dir> [--phase <phase>]... [--generic-only|--handwritten-only]
With no --phase, every phase runs serially in declaration order.
"""
import argparse
import copy
import hashlib
import importlib.util
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402
import pm_dg6a_table_decision_citation as decision_table  # noqa: E402
import pm_dg6a_table_storage_schema as storage_table  # noqa: E402
import pm_dg6a_table_current_header as current_table  # noqa: E402
import pm_dg6a_table_current_context as context_table  # noqa: E402
import pm_dg6a_table_profile as profile_table  # noqa: E402
import pm_dg6a_table_writer_policy as writer_table  # noqa: E402
import pm_dg6a_table_cursor as cursor_table  # noqa: E402
import pm_dg6a_table_panel_scope as panel_scope_table  # noqa: E402
import pm_dg6a_table_concern_scope as concern_scope_table  # noqa: E402

import pm_dg6a_tables as tables  # noqa: E402

RETURN_SOURCE = 'return g.Case(table, check, context)'
SUITES = (
    [('pm-alert-event-contracts-check.py', f) for f in ('alert.acknowledged', 'alert.dismissed', 'alert.rule_muted', 'alert.snoozed')]
    + [('pm-panel-event-contracts-check.py', f) for f in ('panel.redocked', 'panel.undocked')]
    + [('pm-concern-created-contracts-check.py', 'concern.created')]
    + [('pm-card5-event-contracts-check.py', f) for f in (
        'bundle.annotation_state_changed', 'bundle.note_created', 'bundle.note_status_changed', 'concern.assigned',
        'concern.evidence_linked', 'concern.promoted', 'concern.reopened', 'concern.resolved', 'concern.updated')])


def generated_phases():
    spec = importlib.util.spec_from_file_location('dg6a_table_spec', ROOT / 'scripts/pm-dg6a-table-generate.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return list(module.MODULES)


class Collector:
    """pm_dg6a_tables.RECORDER: dedupes (phase, observation) records as they arrive."""

    def __init__(self):
        self.slots, self.family, self.records = {}, None, 0

    def append(self, record):
        phase, observed, refusals = record
        self.records += 1
        slot = self.slots.setdefault(phase, dict(controls={}, negatives={}, multi={}, records=0))
        slot['records'] += 1
        key = json.dumps(observed, sort_keys=True)
        if not refusals:
            entry = slot['controls'].setdefault(key, dict(id=f'control/{phase}/{len(slot["controls"])}', value=observed, families=[]))
        elif len(refusals) == 1:
            row, code = refusals[0]
            entry = slot['negatives'].setdefault(row + key, dict(id=f'negative/{phase}/{len(slot["negatives"])}', value=observed,
                                                                 target=row, code=code, families=[]))
        else:
            entry = slot['multi'].setdefault(key, dict(value=observed, rows=[r for r, _ in refusals], families=[]))
        if self.family not in entry['families']:
            entry['families'].append(self.family)


def collect_generic():
    """Run every complete family suite once under the recorder."""
    import contextlib
    import io
    collector = Collector()
    argv, results = sys.argv, {}
    try:
        tables.RECORDER = collector
        for filename, family in SUITES:
            name = 'dg6a_generic_' + family.replace('.', '_')
            checker = load_checker(name, filename)
            sys.modules[name] = checker  # the alert/panel/concern mains pass sys.modules[__name__] to their drivers
            collector.family = family
            sys.argv = [str(ROOT / 'scripts' / filename), '--family', family]
            out = io.StringIO()
            try:
                with contextlib.redirect_stdout(out):
                    checker.main()
            finally:
                sys.modules.pop(name, None)
            text = out.getvalue()
            results[family] = json.loads(text[text.index('{'):])['cases'] if '{' in text else None
    finally:
        tables.RECORDER = None
        sys.argv = argv
    return collector, results


def lane_matrix(phase, slot):
    rows = tables.rows(phase)
    problems = []
    for c in slot['controls'].values():
        failing = [n for n, pred in rows if pred(c['value'], None) is not None]
        if failing:
            problems.append(dict(case=c['id'], kind='control_refused', rows=failing))
    for n in slot['negatives'].values():
        failing = [name for name, pred in rows if pred(n['value'], None) is not None]
        if failing != [n['target']]:
            problems.append(dict(case=n['id'], kind='not_single_row', target=n['target'], rows=failing))
    return problems


def select(items, limit):
    buckets = {}
    for item in items:
        buckets.setdefault(item['families'][0], []).append(item)
    out, order = [], sorted(buckets)
    while len(out) < limit and any(buckets.values()):
        for name in order:
            if buckets[name] and len(out) < limit:
                out.append(buckets[name].pop(0))
    return out


def run_generic_phase(phase, slot, out, max_rss, per_row):
    started = time.monotonic()
    names = [n for n, _ in tables.rows(phase)]
    controls = select(list(slot['controls'].values()), 10)
    single = [n for n in slot['negatives'].values()]
    negatives = []
    for row in names:
        negatives += select([n for n in single if n['target'] == row], per_row)
    summary = dict(phase=phase, rows=names, records=slot['records'], controls_distinct=len(slot['controls']),
                   negatives_distinct=len(slot['negatives']), multi_row=[dict(rows=m['rows'], families=m['families'])
                                                                         for m in slot['multi'].values()],
                   rows_without_negative=[r for r in names if not any(n['target'] == r for n in single)],
                   lane_matrix=lane_matrix(phase, slot))
    if not controls or not negatives:
        summary.update(tool_status='NOT_RUN', reason='no control' if not controls else 'no negative', proved=[],
                       unproved=names, seconds=round(time.monotonic() - started, 1))
        return summary
    path = 'scripts/' + tables.PREFIX + phase + '.py'
    module = importlib.import_module(tables.PREFIX + phase)
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], gc[0].id,
                     'checker witness ' + n['id'] + ' (' + ','.join(n['families'][:3]) + ')') for n in negatives]
    suite = g.Suite('DG6A ' + phase, module.case, gc, gn, (path,), ROOT,
                    non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                           'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
    pause_when_low()
    stops = [e for e in g.prescan_sources(ROOT / path) if e['kind'] in g.STATIC_STOP_KINDS]
    if stops:
        raise SystemExit('prescan stop kinds: ' + json.dumps(stops, indent=1, default=str))
    report = g.run(suite, memory=g.MemoryGate(max_rss, 10, 11, 30, 2700))
    (out / (phase + '.json')).write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    (out / (phase + '.md')).write_text(g.markdown(report))
    rows = report.get('rows', [])
    summary.update(tool_status=report['status'], tool_controls=len(gc), tool_negatives=len(gn),
                   proved=sorted(r['id'] for r in rows if r.get('proved')),
                   unproved=sorted(report.get('unproved_guards', [])),
                   failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                   evaluations=report.get('evaluations'), seconds=round(time.monotonic() - started, 1),
                   report_sha256=hashlib.sha256((out / (phase + '.json')).read_bytes()).hexdigest())
    return summary


def load_checker(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def dedupe(records):
    """Records are (case_id, family, observed, first, defect); first is None or (row, code)."""
    controls, negatives = {}, {}
    for case_id, family, observed, first, defect in records:
        key = json.dumps(observed, sort_keys=True)
        if first is None:
            slot = controls.setdefault(key, dict(id=case_id, value=observed, families=[]))
        else:
            slot = negatives.setdefault(key, dict(id=case_id, value=observed, target=first[0], code=first[1],
                                                   families=[], defect=defect))
            assert slot['target'] == first[0] and slot['code'] == first[1], (case_id, slot, first)
        if family not in slot['families']:
            slot['families'].append(family)
    return list(controls.values()), list(negatives.values())


def collect_decision_citation():
    checker = load_checker('dg6a_card5_for_guard_tables', 'pm-card5-event-contracts-check.py')
    manifest = checker.load('Plans/card5_event_contracts/manifest.json')
    log = (ROOT / 'Plans/Decision_Log.md').read_text()
    records = []
    for family in manifest['families']:
        collected = []
        checker.DECISION_RECORDER = collected
        try:
            observations = checker.decision_citation_cases(manifest, family, log)
        finally:
            checker.DECISION_RECORDER = None
        assert len(collected) == len(observations), (family['event_type'], len(collected), len(observations))
        for observation, (observed, first) in zip(observations, collected):
            records.append((family['event_type'] + '/' + observation['name'], family['event_type'],
                            observed, first, observation['name']))
    controls, negatives = dedupe(records)
    return controls, negatives, len(records)


def collect_storage_schema():
    checker = load_checker('dg6a_card5_for_guard_tables_storage', 'pm-card5-event-contracts-check.py')
    manifest = checker.load('Plans/card5_event_contracts/manifest.json')
    registry = checker.load('Plans/storage_value_registry.json')
    records = []
    for family in manifest['families']:
        schemas = {k: checker.load(family[k]) for k in ('payload_schema', 'checkpoint_schema')}
        if family['operation_schema']:
            schemas['operation_schema'] = checker.load(family['operation_schema'])
        collected = []
        checker.STORAGE_RECORDER = collected
        try:
            assert not checker.storage_schema_errors(registry, family, schemas)
            checker.storage_schema_cases(registry, family, schemas)
        finally:
            checker.STORAGE_RECORDER = None
        counters = {}
        for fid, observed, first in collected:
            index = counters[fid] = counters.get(fid, 0) + 1
            records.append((fid + '/record-' + str(index), family['event_type'], observed, first,
                            'storage_schema_cases witness ' + fid + ' #' + str(index)))
    controls, negatives = dedupe(records)
    return controls, negatives, len(records)


def collect_current_header():
    """Every fixture current-stage case through the complete current_errors.

    Setup and patch application mirror the checker's main; each current_errors
    call records exactly one header observation, and its full result is
    asserted against the fixture expectation, as main asserts it.
    """
    checker = load_checker('dg6a_card5_for_guard_tables_current', 'pm-card5-event-contracts-check.py')
    manifest = checker.load('Plans/card5_event_contracts/manifest.json')
    registry = checker.load('Plans/storage_value_registry.json')
    records = []
    for family in manifest['families']:
        fixture = checker.load(family['fixture'])
        schemas = {k: checker.load(family[k]) for k in ('payload_schema', 'checkpoint_schema')}
        if family['operation_schema']:
            schemas['operation_schema'] = checker.load(family['operation_schema'])
        for schema in schemas.values():
            checker.shared.check_schema(schema)
        for surface in ('operation', 'checkpoint'):
            if family[surface + '_schema'] is not None:
                row = next(r for r in registry['families'] if r['family_id'] == family['slug'] + '_' + surface)
                schemas[surface + '_schema'] = row['value_schema']
        collected = []
        checker.CURRENT_RECORDER = collected
        cases = []
        try:
            for case in fixture['cases']:
                if case['stage'] != 'current':
                    continue
                value = copy.deepcopy(fixture['bases'][case['base']])
                for patch in case['patches']:
                    if not patch['path']:
                        value = copy.deepcopy(patch['value'])
                        continue
                    target = value
                    for part in patch['path'][:-1]:
                        target = target[part]
                    target[patch['path'][-1]] = copy.deepcopy(patch['value'])
                actual = checker.current_errors(value['operation'], value['context'], family,
                                                  schemas.get('operation_schema'))
                assert actual == case['expected'], (family['event_type'], case['name'], actual, case['expected'])
                cases.append(case)
        finally:
            checker.CURRENT_RECORDER = None
        assert len(collected) == len(cases), (family['event_type'], len(collected), len(cases))
        for case, (observed, first) in zip(cases, collected):
            records.append((family['event_type'] + '/' + case['name'], family['event_type'],
                            observed, first, case['name']))
    controls, negatives = dedupe(records)
    return controls, negatives, len(records)


def collect_current_context():
    """Fixture current-stage cases that reach the context phase, via current_errors.

    Setup and patch application mirror collect_current_header; the recorder
    is reset per case because only cases passing the header and the operation
    guards reach this phase. A case refusing more than one context row would
    fail the fixture-expectation assert first (every expected list is a
    singleton or empty), so each reached case is a control or a one-row
    negative.
    """
    checker = load_checker('dg6a_card5_for_guard_tables_context', 'pm-card5-event-contracts-check.py')
    manifest = checker.load('Plans/card5_event_contracts/manifest.json')
    registry = checker.load('Plans/storage_value_registry.json')
    records = []
    for family in manifest['families']:
        fixture = checker.load(family['fixture'])
        schemas = {k: checker.load(family[k]) for k in ('payload_schema', 'checkpoint_schema')}
        if family['operation_schema']:
            schemas['operation_schema'] = checker.load(family['operation_schema'])
        for schema in schemas.values():
            checker.shared.check_schema(schema)
        for surface in ('operation', 'checkpoint'):
            if family[surface + '_schema'] is not None:
                row = next(r for r in registry['families'] if r['family_id'] == family['slug'] + '_' + surface)
                schemas[surface + '_schema'] = row['value_schema']
        for case in fixture['cases']:
            if case['stage'] != 'current':
                continue
            value = copy.deepcopy(fixture['bases'][case['base']])
            for patch in case['patches']:
                if not patch['path']:
                    value = copy.deepcopy(patch['value'])
                    continue
                target = value
                for part in patch['path'][:-1]:
                    target = target[part]
                target[patch['path'][-1]] = copy.deepcopy(patch['value'])
            collected = []
            checker.CONTEXT_RECORDER = collected
            try:
                actual = checker.current_errors(value['operation'], value['context'], family,
                                                  schemas.get('operation_schema'))
            finally:
                checker.CONTEXT_RECORDER = None
            assert actual == case['expected'], (family['event_type'], case['name'], actual, case['expected'])
            if not collected:
                continue
            assert len(collected) == 1, (family['event_type'], case['name'], collected)
            observed, refused = collected[0]
            assert len(refused) <= 1, (family['event_type'], case['name'], refused)
            records.append((family['event_type'] + '/' + case['name'], family['event_type'],
                            observed, refused[0] if refused else None, case['name']))
    controls, negatives = dedupe(records)
    return controls, negatives, len(records)


def collect_profile():
    """Every alert-main profile call site through profile_cases, complete checker."""
    checker = load_checker('dg6a_alert_for_guard_tables_profile', 'pm-alert-event-contracts-check.py')
    values = checker.load('Plans/storage_value_registry.json')
    sites = []
    for family in checker.load('Plans/alert_event_contracts/manifest.json')['families']:
        for key in ('operation', 'checkpoint'):
            row = next(x for x in values['families'] if x['family_id'] == family[key])
            group = 'event_log' if key == 'checkpoint' else 'coordination_and_storage'
            sites.append((family['event_type'], family[key], row['storage_kind'], group))
    for fid in ('shared_alert_state', 'shared_alert_rule_state'):
        sites.append((fid, fid, 'redb', 'settings_and_layout'))
    records = []
    for family, fid, kind, group in sites:
        collected = []
        checker.PROFILE_RECORDER = collected
        try:
            count = checker.profile_cases(values, fid, kind, group)
        finally:
            checker.PROFILE_RECORDER = None
        assert len(collected) == count, (fid, len(collected), count)
        for index, (site, observed, first) in enumerate(collected, 1):
            assert site == (fid, kind, group), (site, fid, kind, group)
            records.append((fid + '/record-' + str(index), family, observed, first,
                            'profile_cases witness ' + fid + ' #' + str(index)))
    controls, negatives = dedupe(records)
    return controls, negatives, len(records)


def collect_writer_policy():
    """The checker's writer_policy_cases builder, as run by every alert suite."""
    checker = load_checker('dg6a_alert_for_guard_tables_writer', 'pm-alert-event-contracts-check.py')
    collected = []
    checker.WRITER_RECORDER = collected
    try:
        count = checker.writer_policy_cases()
    finally:
        checker.WRITER_RECORDER = None
    assert len(collected) == count, (len(collected), count)
    names = ('dedupe', 'replay_only', 'unknown', 'trailing_space', 'wrong_type_list', 'wrong_type_none')
    records = [('writer_policy/' + name, 'alert', observed, first, name)
               for name, (observed, first) in zip(names, collected)]
    controls, negatives = dedupe(records)
    return controls, negatives, len(records)


def collect_cursor():
    """The checker's cursor_cases builder, as run by every alert suite."""
    checker = load_checker('dg6a_alert_for_guard_tables_cursor', 'pm-alert-event-contracts-check.py')
    collected = []
    checker.CURSOR_RECORDER = collected
    try:
        count = checker.cursor_cases()
    finally:
        checker.CURSOR_RECORDER = None
    assert len(collected) == count, (len(collected), count)
    names = ('zero', 'within', 'equal', 'uint64_max', 'after_string', 'frontier_string',
             'after_negative', 'after_beyond_frontier', 'frontier_over_uint64')
    records = [('cursor/' + name, 'alert', observed, first, name)
               for name, (observed, first) in zip(names, collected)]
    controls, negatives = dedupe(records)
    return controls, negatives, len(records)


def collect_panel_scope():
    """Each panel family's checkpoint_scope_cases through its complete wrapper."""
    checker = load_checker('dg6a_panel_for_guard_tables_scope', 'pm-panel-event-contracts-check.py')
    records = []
    names = ('positive', 'coherent_app_scope', 'coherent_foreign_partition')
    for family in checker.load('Plans/panel_event_contracts/manifest.json')['families']:
        fixture = checker.load('Plans/panel_event_contracts/' + family['slug'] + '.fixtures.json')
        cp_schema = checker.load('Plans/panel_event_contracts/' + family['checkpoint'] + '.schema.json')
        collected = []
        checker.PANEL_SCOPE_RECORDER = collected
        try:
            count = checker.checkpoint_scope_cases(fixture['checkpoint'], cp_schema, fixture['settled_operation'])
        finally:
            checker.PANEL_SCOPE_RECORDER = None
        assert len(collected) == count, (family['event_type'], len(collected), count)
        for name, (observed, first) in zip(names, collected):
            records.append((family['event_type'] + '/' + name, family['event_type'], observed, first, name))
    controls, negatives = dedupe(records)
    return controls, negatives, len(records)


def collect_concern_scope():
    """The concern family's checkpoint_scope_cases through its complete wrapper."""
    checker = load_checker('dg6a_concern_for_guard_tables_scope', 'pm-concern-created-contracts-check.py')
    fixture = checker.load('Plans/concern_created_contracts/concern_created.fixtures.json')
    cp_schema = checker.load('Plans/concern_created_contracts/concern_created_checkpoint.schema.json')
    collected = []
    checker.CONCERN_SCOPE_RECORDER = collected
    try:
        count = checker.checkpoint_scope_cases(fixture['checkpoint'], cp_schema, fixture['settled_operation'])
    finally:
        checker.CONCERN_SCOPE_RECORDER = None
    assert len(collected) == count, (len(collected), count)
    names = ('positive', 'coherent_app_scope', 'coherent_foreign_partition')
    records = [('concern.created/' + name, 'concern.created', observed, first, name)
               for name, (observed, first) in zip(names, collected)]
    controls, negatives = dedupe(records)
    return controls, negatives, len(records)


PHASES = {
    'decision_citation': (decision_table, 'scripts/pm_dg6a_table_decision_citation.py', collect_decision_citation),
    'storage_schema': (storage_table, 'scripts/pm_dg6a_table_storage_schema.py', collect_storage_schema),
    'current_header': (current_table, 'scripts/pm_dg6a_table_current_header.py', collect_current_header),
    'current_context': (context_table, 'scripts/pm_dg6a_table_current_context.py', collect_current_context),
    'profile': (profile_table, 'scripts/pm_dg6a_table_profile.py', collect_profile),
    'writer_policy': (writer_table, 'scripts/pm_dg6a_table_writer_policy.py', collect_writer_policy),
    'cursor': (cursor_table, 'scripts/pm_dg6a_table_cursor.py', collect_cursor),
    'panel_scope': (panel_scope_table, 'scripts/pm_dg6a_table_panel_scope.py', collect_panel_scope),
    'concern_scope': (concern_scope_table, 'scripts/pm_dg6a_table_concern_scope.py', collect_concern_scope),
}


def available_gib():
    for line in Path('/proc/meminfo').read_text().splitlines():
        if line.startswith('MemAvailable:'):
            return int(line.split()[1]) / 1048576
    return 0.0


def pause_when_low():
    """Between tables: pause below 10 GiB available and resume at 11 GiB (the start check is 13.5 GiB)."""
    if available_gib() < 10:
        print('paused: under 10 GiB available', file=sys.stderr, flush=True)
        while available_gib() < 11:
            time.sleep(30)
        print('resumed', file=sys.stderr, flush=True)


def run_phase(phase, out, max_rss):
    table, path, collect = PHASES[phase]
    started = time.monotonic()
    controls, negatives, collected = collect()
    gc = [g.Control(c['id'], c['value'], 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], n['value'], n['target'], n['code'], gc[0].id,
                     'checker witness ' + n['id'] + ' (' + n['defect'] + ')') for n in negatives]
    suite = g.Suite('DG6A ' + phase, table.case, gc, gn, (path,), ROOT,
                    non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                           'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
    pause_when_low()
    stops = [e for e in g.prescan_sources(ROOT / path) if e['kind'] in g.STATIC_STOP_KINDS]
    if stops:
        raise SystemExit('prescan stop kinds: ' + json.dumps(stops, indent=1, default=str))
    report = g.run(suite, memory=g.MemoryGate(max_rss, 10, 11, 30, 2700))
    (out / (phase + '.json')).write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    (out / (phase + '.md')).write_text(g.markdown(report))
    rows = report.get('rows', [])
    return dict(phase=phase, tool_status=report['status'], collected=collected,
                controls=len(gc), negatives=len(gn),
                control_families={c['id']: c['families'] for c in controls},
                negative_families={n['id']: n['families'] for n in negatives},
                proved=sorted(r['id'] for r in rows if r.get('proved')),
                unproved=sorted(report.get('unproved_guards', [])),
                failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                evaluations=report.get('evaluations'), seconds=round(time.monotonic() - started, 1),
                report_sha256=hashlib.sha256((out / (phase + '.json')).read_bytes()).hexdigest())


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    generic = generated_phases()
    parser.add_argument('--phase', action='append', choices=list(PHASES) + generic, dest='phases')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--max-rss', type=int, default=6144)
    parser.add_argument('--per-row', type=int, default=5)
    parser.add_argument('--generic-only', action='store_true')
    parser.add_argument('--handwritten-only', action='store_true')
    parser.add_argument('--collect-only', action='store_true', help='collect and lane-check generated phases; no tool run')
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    if not args.collect_only and available_gib() < 13.5:
        raise SystemExit('refusing to start the tool run under 13.5 GiB available')
    chosen = args.phases or ([] if args.generic_only else list(PHASES)) + ([] if args.handwritten_only else generic)
    summaries = {}

    def save():
        (args.out / 'summary.json').write_text(json.dumps(summaries, indent=1, sort_keys=True) + '\n')
    for phase in chosen:
        if phase in PHASES:
            summaries[phase] = run_phase(phase, args.out, args.max_rss)
            save()
    wanted = [phase for phase in chosen if phase in generic]
    if wanted:
        collector, counts = collect_generic()
        (args.out / 'suite-counts.json').write_text(json.dumps(counts, indent=1) + '\n')
        for phase in wanted:
            slot = collector.slots.get(phase, dict(controls={}, negatives={}, multi={}, records=0))
            if args.collect_only:
                names = [n for n, _ in tables.rows(phase)]
                summaries[phase] = dict(phase=phase, records=slot['records'], controls_distinct=len(slot['controls']),
                                        negatives_distinct=len(slot['negatives']),
                                        multi_row=[dict(rows=m['rows'], families=m['families']) for m in slot['multi'].values()],
                                        rows_without_negative=[r for r in names if not any(n['target'] == r for n in slot['negatives'].values())],
                                        lane_matrix=lane_matrix(phase, slot), tool_status='NOT_RUN')
            else:
                summaries[phase] = run_generic_phase(phase, slot, args.out, args.max_rss, args.per_row)
            save()
    (args.out / 'summary.json').write_text(json.dumps(summaries, indent=1, sort_keys=True) + '\n')
    brief = {p: (s['tool_status'], len(s.get('proved', [])), s.get('unproved'), s.get('rows_without_negative'),
                 len(s.get('lane_matrix', [])), len(s.get('multi_row', []))) for p, s in summaries.items()}
    print(json.dumps(brief, indent=1, sort_keys=True))
    return 0 if all(s['tool_status'] == 'PASS' for s in summaries.values()) else 1


if __name__ == '__main__':
    raise SystemExit(main())
