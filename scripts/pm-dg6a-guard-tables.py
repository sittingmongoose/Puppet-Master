#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over the DG6A guard-table phase suites.

Sweep part 2A phases so far, both in pm-card5-event-contracts-check.py:
`decision_citation` (pm_dg6a_table_decision_citation.py) and `storage_schema`
(pm_dg6a_table_storage_schema.py, one suite row per registered surface row).
Witnesses are collected by running the checker's own one-defect case builders
(decision_citation_cases, storage_schema_cases) for all nine Card 5 families
under its recorders: an accepted observation is a control, a refused one is
a negative targeted at its first refusing row. This runner is unscanned
adapter code; the tool scans only the table module of the phase under test.
Credit is copied from the tool's own report; this driver adds none.

Usage: python3 scripts/pm-dg6a-guard-tables.py --out <dir> [--phase <phase>]...
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

RETURN_SOURCE = 'return g.Case(table, check, context)'


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


PHASES = {
    'decision_citation': (decision_table, 'scripts/pm_dg6a_table_decision_citation.py', collect_decision_citation),
    'storage_schema': (storage_table, 'scripts/pm_dg6a_table_storage_schema.py', collect_storage_schema),
    'current_header': (current_table, 'scripts/pm_dg6a_table_current_header.py', collect_current_header),
}


def available_gib():
    for line in Path('/proc/meminfo').read_text().splitlines():
        if line.startswith('MemAvailable:'):
            return int(line.split()[1]) / 1048576
    return 0.0


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
    if available_gib() < 13.5:
        raise SystemExit('refusing to start the tool run under 13.5 GiB available')
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
    parser.add_argument('--phase', action='append', choices=list(PHASES), dest='phases')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--max-rss', type=int, default=6144)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    summaries = {phase: run_phase(phase, args.out, args.max_rss) for phase in (args.phases or list(PHASES))}
    (args.out / 'summary.json').write_text(json.dumps(summaries, indent=1, sort_keys=True) + '\n')
    print(json.dumps(summaries, indent=1, sort_keys=True))
    return 0 if all(s['tool_status'] == 'PASS' for s in summaries.values()) else 1


if __name__ == '__main__':
    raise SystemExit(main())
