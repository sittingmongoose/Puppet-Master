#!/usr/bin/env python3
"""C12-DG6A: every bounded DG6A phase equals its unsplit table at the base revision.

For each phase split into parts of at most eight rows (pm_dg6a_phase_groups.ALIASES, and the
hand-written current_context / current_context__2 pair) this checks, against the table module
at --base (git show, never the working tree):
  - the same row names in the same order, each with byte-identical predicate source, the same
    refusal code and the same invariant (field and words);
  - the same first-refusal (`first`) and collect-all (`every`) results through
    pm_dg6a_tables on every Boolean observation vector (all of them up to 2^10 fields, else
    1024 seeded vectors), the base evaluated by its own rows in declared order.
It credits nothing; the gated tool proves the parts. Exit 0 only when every phase is equal.

Usage: python3 scripts/pm-dg6a-c12-split-equivalence.py --base <rev> --out <dir>
"""
import argparse
import hashlib
import inspect
import itertools
import json
import random
import subprocess
import sys
import types
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dg6a_tables as tables  # noqa: E402
import pm_dg6a_phase_groups as groups  # noqa: E402

PREFIX = 'pm_dg6a_table_'


def base_module(base, phase):
    source = subprocess.run(['git', 'show', f'{base}:scripts/{PREFIX}{phase}.py'], cwd=ROOT, capture_output=True,
                            text=True, check=True).stdout
    module = types.ModuleType('dg6a_base_' + phase)
    module.__file__ = f'<{base}:scripts/{PREFIX}{phase}.py>'
    exec(compile(source, module.__file__, 'exec'), module.__dict__)
    return module, source


def described(module, source):
    rows = []
    for name, guard in module.case(None).table.guards.items():
        text = inspect.getsource(guard.predicate) if not source else function_source(source, name)
        rows.append(dict(name=name, code=guard_code(guard), invariant=repr(guard.invariant), predicate=text))
    return rows


def guard_code(guard):
    for attribute in ('refusal_code', 'code', 'refusal', 'message'):
        if hasattr(guard, attribute):
            return repr(getattr(guard, attribute))
    return repr(guard)


def function_source(source, name):
    lines = source.splitlines()
    start = next(i for i, line in enumerate(lines) if line.startswith(f'def {name}('))
    end = start + 1
    while end < len(lines) and (lines[end].startswith(' ') or not lines[end].strip()):
        end += 1
    return '\n'.join(lines[start:end]).rstrip()


def current_rows(parts):
    rows = []
    for part in parts:
        module = __import__(PREFIX + part)
        source = (ROOT / 'scripts' / (PREFIX + part + '.py')).read_text()
        rows += described(module, source)
    return rows


def vectors(fields):
    if len(fields) <= 10:
        for bits in itertools.product((True, False), repeat=len(fields)):
            yield dict(zip(fields, bits))
    else:
        rng = random.Random(20261115)
        for _ in range(1024):
            yield {f: rng.random() < 0.8 for f in fields}


def evaluate(rows, value, mode):
    found = []
    for name, predicate in rows:
        code = predicate(value, None)
        if code is not None:
            found.append(code)
            if mode == 'first':
                break
    return found[0] if mode == 'first' and found else (None if mode == 'first' else found)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--base', required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    phases = dict(groups.ALIASES)
    phases['current_context'] = ('current_context', 'current_context__2')
    report = []
    for phase, parts in sorted(phases.items()):
        module, source = base_module(args.base, phase)
        base_rows = described(module, source)
        now_rows = current_rows(parts)
        base_entries = [(name, guard.predicate) for name, guard in module.case(None).table.guards.items()]
        if phase == 'current_context':
            current = [(n, p) for part in parts for n, p in
                       ((n, g.predicate) for n, g in __import__(PREFIX + part).case(None).table.guards.items())]
            first = lambda value: evaluate(current, value, 'first')
            every = lambda value: evaluate(current, value, 'every')
        else:
            first = lambda value: tables.first(phase, **{k: value[k] for k in tables.fields(phase)})
            every = lambda value: tables.every(phase, **{k: value[k] for k in tables.fields(phase)})
        fields = list(module.FIELDS)
        mismatches, count = [], 0
        for value in vectors(fields):
            count += 1
            for mode, actual in (('first', first(value)), ('every', every(value))):
                expected = evaluate(base_entries, value, mode)
                if actual != expected:
                    mismatches.append(dict(mode=mode, value=value, expected=expected, actual=actual))
        static = [b == c for b, c in zip(base_rows, now_rows)]
        entry = dict(phase=phase, parts=list(parts), part_rows=[len(__import__(PREFIX + p).case(None).table.guards)
                                                                  for p in parts],
                     base=args.base, base_source_sha256=hashlib.sha256(source.encode()).hexdigest(),
                     part_source_sha256={p: hashlib.sha256((ROOT / 'scripts' / (PREFIX + p + '.py')).read_bytes()).hexdigest()
                                         for p in parts},
                     rows=len(base_rows), same_row_order=[r['name'] for r in base_rows] == [r['name'] for r in now_rows],
                     predicates_codes_invariants_equal=len(base_rows) == len(now_rows) and all(static),
                     fields_equal=set(module.FIELDS) == set(f for p in parts for f in __import__(PREFIX + p).FIELDS),
                     observations=count, mismatches=mismatches[:5], mismatch_count=len(mismatches),
                     max_part_rows=max(len(__import__(PREFIX + p).case(None).table.guards) for p in parts))
        entry['ok'] = (entry['same_row_order'] and entry['predicates_codes_invariants_equal'] and entry['fields_equal']
                       and not mismatches and entry['max_part_rows'] <= 8)
        report.append(entry)
        print(json.dumps({k: entry[k] for k in ('phase', 'rows', 'part_rows', 'observations', 'mismatch_count', 'ok')}))
    (args.out / 'split-equivalence.json').write_text(json.dumps(report, indent=1, sort_keys=True) + '\n')
    return int(not all(e['ok'] for e in report))


if __name__ == '__main__':
    raise SystemExit(main())
