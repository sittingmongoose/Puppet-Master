#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over the DG6A guard-table phase suites.

Sweep part 2A, first slice: one phase, `decision_citation`
(scripts/pm_dg6a_table_decision_citation.py, refused only through its rows by
pm-card5-event-contracts-check.py::decision_citation_errors). Witnesses are
collected by running the checker's own decision_citation_cases for all nine
Card 5 families under its DECISION_RECORDER: an accepted observation is a
control, a refused one is a negative targeted at its first refusing row.
This runner is unscanned adapter code; the tool scans only the table module.
Credit is copied from the tool's own report; this driver adds none.

Usage: python3 scripts/pm-dg6a-guard-tables.py --out <dir> [--phase decision_citation]
"""
import argparse
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

RETURN_SOURCE = 'return g.Case(table, check, context)'


def load_checker(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def collect_decision_citation():
    """(controls, negatives, collected_count) from the complete checker cases."""
    checker = load_checker('dg6a_card5_for_guard_tables', 'pm-card5-event-contracts-check.py')
    manifest = checker.load('Plans/card5_event_contracts/manifest.json')
    log = (ROOT / 'Plans/Decision_Log.md').read_text()
    controls, negatives, seen = {}, {}, {}
    collected = 0
    for family in manifest['families']:
        records = []
        checker.DECISION_RECORDER = records
        try:
            observations = checker.decision_citation_cases(manifest, family, log)
        finally:
            checker.DECISION_RECORDER = None
        assert len(records) == len(observations), (family['event_type'], len(records), len(observations))
        control_key = None
        for observation, (observed, first) in zip(observations, records):
            collected += 1
            key = json.dumps(observed, sort_keys=True)
            case_id = family['event_type'] + '/' + observation['name']
            if first is None:
                control_key = key
                slot = controls.setdefault(key, dict(id=case_id, value=observed, families=[]))
            else:
                slot = negatives.setdefault(key, dict(id=case_id, value=observed, target=first[0], code=first[1],
                                                      control_key=control_key, families=[],
                                                      defect=observation['name']))
                assert slot['target'] == first[0] and slot['code'] == first[1], (case_id, slot, first)
            if family['event_type'] not in slot['families']:
                slot['families'].append(family['event_type'])
            seen.setdefault(key, []).append(case_id)
    return list(controls.values()), list(negatives.values()), collected


def available_gib():
    for line in Path('/proc/meminfo').read_text().splitlines():
        if line.startswith('MemAvailable:'):
            return int(line.split()[1]) / 1048576
    return 0.0


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--phase', choices=['decision_citation'], default='decision_citation')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--max-rss', type=int, default=6144)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    controls, negatives, collected = collect_decision_citation()
    control_ids = {json.dumps(c['value'], sort_keys=True): c['id'] for c in controls}
    gc = [g.Control(c['id'], c['value'], 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], n['value'], n['target'], n['code'], control_ids[n['control_key']],
                     'checker witness ' + n['id'] + ' (' + n['defect'] + ')') for n in negatives]
    path = 'scripts/pm_dg6a_table_decision_citation.py'
    suite = g.Suite('DG6A decision_citation', decision_table.case, gc, gn, (path,), ROOT,
                    non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                           'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
    if available_gib() < 13.5:
        raise SystemExit('refusing to start the tool run under 13.5 GiB available')
    stops = [e for e in g.prescan_sources(ROOT / path) if e['kind'] in g.STATIC_STOP_KINDS]
    if stops:
        raise SystemExit('prescan stop kinds: ' + json.dumps(stops, indent=1, default=str))
    gate = g.MemoryGate(args.max_rss, 10, 11, 30, 2700)
    report = g.run(suite, memory=gate)
    (args.out / 'decision_citation.json').write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    (args.out / 'decision_citation.md').write_text(g.markdown(report))
    rows = report.get('rows', [])
    summary = dict(phase=args.phase, tool_status=report['status'], collected=collected,
                   controls=len(gc), negatives=len(gn),
                   control_families={c['id']: c['families'] for c in controls},
                   negative_families={n['id']: n['families'] for n in negatives},
                   proved=sorted(r['id'] for r in rows if r.get('proved')),
                   unproved=sorted(report.get('unproved_guards', [])),
                   failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                   evaluations=report.get('evaluations'), seconds=round(time.monotonic() - started, 1),
                   report_sha256=hashlib.sha256((args.out / 'decision_citation.json').read_bytes()).hexdigest())
    (args.out / 'summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True) + '\n')
    print(json.dumps(summary, indent=1, sort_keys=True))
    return 0 if report['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(main())
