"""W3D guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py).

Collects the complete checker's observations (one boolean dict per phase per case)
through pm_w3d_bsd_events.RECORDER, deduplicates them, and builds one Method B
suite per phase. The synthetic boundary is the observation dict; the table module's
case() factory is the adapter. Entailed size rows sit in their own tables with no
single-defect witness (the proof is recorded in the lane report).

Usage:
  python3 scripts/pm_w3d_bsd_guard_suites.py --collect-only --json collected.json
  python3 scripts/pm_w3d_bsd_guard_suites.py --phase <name> --json report.json --markdown report.md
  python3 scripts/pm_w3d_bsd_guard_suites.py --all --out-dir <dir>
"""
import argparse
import copy
import hashlib
import importlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402
import pm_w3d_bsd_events as m  # noqa: E402
import pm_w3d_bsd_rows as rows_spec  # noqa: E402
import pm_w3d_bsd_spec as spec  # noqa: E402

TABLE_PREFIX = 'pm_w3d_bsd_table_'
RETURN_SOURCE = 'return g.Case(table, check, context)'


def table_rows(phase):
    module = importlib.import_module(TABLE_PREFIX + phase)
    case = module.case(None)
    return [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]


def _key(observed):
    return hashlib.sha256(json.dumps(observed, sort_keys=True).encode()).hexdigest()


def collect(progress=None):
    m.RECORDER = []
    counts = dict(records=0, accepted=0, refused=0, cases=0)
    collected = {}
    with m.exact_integer_digits():
        for fam in spec.FAMILIES:
            for case in m.all_cases(fam):
                counts['cases'] += 1
                m.run_case(fam, case)
            if progress:
                progress(fam['event_type'])
    for phase, observed, first in m.RECORDER:
        counts['records'] += 1
        slot = collected.setdefault(phase, dict(controls={}, negatives={}))
        key = _key(observed)
        if first is None:
            counts['accepted'] += 1
            slot['controls'].setdefault(key, dict(id=f'control/{phase}/{len(slot["controls"])}', value=observed))
        else:
            counts['refused'] += 1
            row, code = first
            slot['negatives'].setdefault(key, dict(id=f'negative/{phase}/{len(slot["negatives"])}',
                                                   value=observed, target=row, code=code))
    m.RECORDER = None
    return collected, counts


def lane_matrix(phase, controls, negatives):
    """Direct check of every row on every collected case (the tool repeats it)."""
    rows = table_rows(phase)
    problems = []
    for c in controls:
        failing = [name for name, predicate, ctx in rows if predicate(c['value'], ctx) is not None]
        if failing:
            problems.append(dict(case=c['id'], kind='control_refused', rows=failing))
    for n in negatives:
        failing = [name for name, predicate, ctx in rows if predicate(n['value'], ctx) is not None]
        if failing != [n['target']]:
            problems.append(dict(case=n['id'], kind='not_single_row', target=n['target'], rows=failing))
    return problems


def suite_for(phase, slot, negative_limit=3, control_limit=3):
    module = TABLE_PREFIX + phase
    controls = list(slot['controls'].values())[:control_limit]
    if not controls:
        return None
    negatives = []
    masked = {p['case'] for p in lane_matrix(phase, [], list(slot['negatives'].values()))}
    for row in sorted({n['target'] for n in slot['negatives'].values()}):
        own = [n for n in slot['negatives'].values() if n['target'] == row and n['id'] not in masked]
        negatives += own[:negative_limit]
    if not negatives:
        return None
    first = controls[0]['id']
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], first,
                     'complete-checker observation whose first refusal is this row')
          for n in negatives]
    path = f'scripts/{module}.py'
    factory = importlib.import_module(module).case
    return g.Suite(f'W3D {phase}', factory, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--phase')
    parser.add_argument('--all', action='store_true')
    parser.add_argument('--out-dir')
    parser.add_argument('--json')
    parser.add_argument('--markdown')
    parser.add_argument('--max-rss', type=int, default=2048)
    parser.add_argument('--pause-when-low', type=int, default=8)
    parser.add_argument('--resume-at', type=int, default=9)
    args = parser.parse_args(argv)

    collected, counts = collect(progress=lambda f: print(f'collected {f}', file=sys.stderr))
    if args.collect_only:
        text = json.dumps(dict(counts=counts, phases={p: dict(controls=len(s['controls']), negatives=len(s['negatives']))
                                                     for p, s in collected.items()}), indent=1, sort_keys=True)
        if args.json:
            Path(args.json).write_text(text + '\n')
        print(text)
        return 0

    phases = [args.phase] if args.phase else sorted(collected)
    results = {}
    exit_code = 0
    for phase in phases:
        slot = collected.get(phase)
        if slot is None:
            continue
        suite = suite_for(phase, slot)
        if suite is None:
            results[phase] = dict(status='no_witness', note='entailed or control-only table')
            continue
        gate = g.MemoryGate(max_rss=args.max_rss, pause_when_low=args.pause_when_low, resume_at=args.resume_at)
        report = g.run(suite, memory=gate)
        results[phase] = report
        if args.out_dir:
            out = Path(args.out_dir)
            out.mkdir(parents=True, exist_ok=True)
            (out / f'{phase}.json').write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
            (out / f'{phase}.md').write_text(g.markdown(report) + '\n')
        status = report.get('status')
        if status != 'pass':
            exit_code = 1
        print(f'{phase}: {status}', file=sys.stderr)
    summary = dict(counts=counts, phases={p: (r.get('status') if isinstance(r, dict) else str(r)) for p, r in results.items()})
    text = json.dumps(summary, indent=1, sort_keys=True, default=str)
    if args.json:
        Path(args.json).write_text(text + '\n')
    if args.markdown:
        Path(args.markdown).write_text('\n\n'.join(g.markdown(r) for r in results.values() if isinstance(r, dict) and 'status' in r) + '\n')
    print(text)
    return exit_code


if __name__ == '__main__':
    sys.exit(main())