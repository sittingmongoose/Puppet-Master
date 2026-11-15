#!/usr/bin/env python3
"""PNC-019 C12-GC: owner-schema clause coverage for the whole-definition rows (W3H route covering evidence).

Every whole-definition row of the DG-OWN-A and DG-OWN-B checkers validates one owner definition root with every
keyword (pm_goal_gc_adapter.validator). For each root this lists every reachable assertion keyword occurrence
and the evidence for it:
  isolated   - a refused input with exactly one top-level failing clause, which is this one: from the suites' own
               complete calls (`suite`) or from a single-field change of an accepted boundary instance (`field`);
  alternative- the clause is an alternative of a union (anyOf/oneOf) whose single top-level refusal was witnessed
               with this clause failing inside it (a union alternative cannot fail alone by JSON Schema semantics);
  co_located - the clause refuses only together with another clause at the same schema node (a `type` beside an
               `enum`/`const`, a `minLength` 1 beside a `^[^\\r\\n]+$` pattern): the node's conjunction is witnessed;
  together   - any other clause that refused only together with clauses at other nodes, with its partners;
  unreached  - no lawful instance of these families reaches the clause's location (an alternative branch or a
               definition these families never instantiate), so no single-field change can make it fail.
Field witnesses validate the root only; they are clause evidence for the row, never guard rows or kills.

Usage: python3 scripts/pm-goal-gc-clause-coverage.py --out FILE [--source own_a|own_b]... [--budget N]
"""
import argparse
import collections
import copy
import hashlib
import importlib.util
import json
import pickle
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_goal_gc_adapter as adapter  # noqa: E402
import pm_goal_oracle_common as common  # noqa: E402

ASSERTIONS = {'type', 'enum', 'const', 'required', 'minLength', 'maxLength', 'pattern', 'format', 'minimum', 'maximum',
              'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems',
              'minProperties', 'maxProperties', 'closed_members', 'dependentRequired', 'minContains', 'maxContains',
              'anyOf', 'oneOf', 'not'}
LEAF = ASSERTIONS - {'anyOf', 'oneOf', 'not'}


def keyword(location):
    return location.rsplit('/', 1)[-1]


def leaves(value, path=()):
    yield path, value
    if isinstance(value, dict):
        for key, child in value.items():
            yield from leaves(child, path + (key,))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from leaves(child, path + (index,))


def edits(value):
    out = [('null', None), ('false', False), ('zero', 0), ('fraction', 1.5), ('empty', ''), ('text', 'foreign'),
           ('array', []), ('object', {})]
    if isinstance(value, str):
        out += [('lf', value + '\n'), ('long', 'x' * 1100), ('upper', value.upper()), ('drop_last', value[:-1])]
    if type(value) is int:
        out += [('minus', -1), ('float', float(value)), ('huge', 1 << 64), ('plus', value + 1)]
    if isinstance(value, list):
        out += [('duplicate', value + value[:1]), ('drop', value[1:]), ('long_list', value * 40 if value else [None])]
    if isinstance(value, dict):
        out += [('extra_member', {**value, '__gc_extra__': 1})]
    return out


def mutate(base, path, op, replacement):
    changed = copy.deepcopy(base)
    if not path:
        return replacement
    parent = changed
    for part in path[:-1]:
        parent = parent[part]
    if op == 'remove':
        del parent[path[-1]]
    else:
        parent[path[-1]] = replacement
    return changed


def failing(v, value):
    errors = list(v.iter_errors(value))
    tops = [common._SCHEMA_LOCATIONS.get(getattr(e, 'oracle_guard', None)) for e in errors]
    alternatives = set()
    if len(errors) == 1 and errors[0].validator in ('anyOf', 'oneOf'):
        alternatives = set(adapter.clause_locations(errors[0].context))
    return {loc for loc in adapter.clause_locations(errors)}, [t for t in tops if t], alternatives


def node(location):
    return location.rsplit('/', 1)[0]


def inventory(v):
    common.schema_type_inventory(v)
    return {common._SCHEMA_LOCATIONS[g] for g in common._SCHEMA_VALIDATOR_GUARDS[id(v)]
            if keyword(common._SCHEMA_LOCATIONS[g]) in ASSERTIONS}


def collect(source):
    spec = importlib.util.spec_from_file_location('gc_runner', ROOT / 'scripts/pm-goal-gc-guard-tables.py')
    runner = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(runner)
    adapter.GATED = False
    rec, code, summary = runner.run_source(source)
    return rec, code


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--source', action='append', choices=('own_a', 'own_b'))
    parser.add_argument('--budget', type=int, default=6000, help='single-field validations per root')
    args = parser.parse_args()
    sources = args.source or ['own_a', 'own_b']
    report = dict(method=__doc__.split('\n\n')[0], sources={}, native_execution='NOT_RUN')
    for source in sources:
        adapter.SCHEMA_SEEDS.clear(); adapter.SCHEMA_VALIDATORS.clear(); adapter.ROOT_ROWS.clear()
        rec, code = collect(source)
        suite_sets = collections.defaultdict(list)
        for call in rec.calls:
            for root, clauses in call['outcome'].get('schema_clauses') or []:
                suite_sets[root].append((call['label'], call['outcome'].get('refusal'), set(clauses)))
        roots = {}
        for root, v in sorted(adapter.SCHEMA_VALIDATORS.items()):
            clauses = inventory(v)
            isolated, alternative, together = {}, {}, collections.defaultdict(set)
            for label, refusal, failed in suite_sets.get(root, []):
                leaf = {c for c in failed if keyword(c) in LEAF}
                if len(leaf) == 1:
                    isolated.setdefault(next(iter(leaf)), dict(kind='suite', call=label, refusal=refusal))
                for c in failed:
                    together[c] |= failed - {c}
            spent = 0
            seeds = list(adapter.SCHEMA_SEEDS.get(root, {}).values())
            for base in seeds:
                if spent >= args.budget or clauses <= set(isolated):
                    break
                for path, value in list(leaves(base)):
                    attempts = [('replace', r) for r in edits(value)] + ([('remove', ('remove', None))] if path else [])
                    for op, (name, replacement) in attempts:
                        if spent >= args.budget:
                            break
                        changed = mutate(base, path, op, replacement)
                        try:
                            failed, tops, alternatives = failing(v, changed)
                        except Exception as exc:  # noqa: BLE001 - recorded, never credit
                            together.setdefault('__exceptions__', set()).add(type(exc).__name__)
                            continue
                        spent += 1
                        witness = dict(kind='field', path=list(map(str, path)), edit=name,
                                       input_sha256=hashlib.sha256(pickle.dumps(changed, protocol=5)).hexdigest())
                        if len(tops) == 1:
                            isolated.setdefault(tops[0], witness)
                            for c in alternatives:
                                alternative.setdefault(c, dict(witness, union=tops[0]))
                        leaf = {c for c in failed if keyword(c) in LEAF}
                        if len(leaf) == 1:
                            isolated.setdefault(next(iter(leaf)), witness)
                        for c in failed:
                            together[c] |= failed - {c}
            rows = sorted(adapter.ROOT_ROWS.get(root, ()))
            entry = dict(rows=rows, seeds=len(seeds), validations=spent, assertion_clauses=len(clauses),
                         isolated=len(clauses & set(isolated)), alternative=0, co_located=[], together=[], unreached=[])
            for c in sorted(clauses - set(isolated)):
                if c in alternative:
                    entry['alternative'] += 1
                elif together.get(c) and any(node(q) == node(c) and q in isolated for q in together[c]):
                    entry['co_located'].append(dict(clause=c, with_=sorted(q for q in together[c] if node(q) == node(c))[:4]))
                elif together.get(c):
                    entry['together'].append(dict(clause=c, partners=sorted(together[c])[:6]))
                else:
                    entry['unreached'].append(c)
            entry['witnesses'] = {c: isolated[c] for c in sorted(clauses & set(isolated))}
            roots[root] = entry
            print(f'{source} {root.rsplit("/", 1)[-1]}: {entry["isolated"]}/{len(clauses)} isolated, {entry["alternative"]} alternative, '
                  f'{len(entry["co_located"])} co-located, {len(entry["together"])} together, {len(entry["unreached"])} unreached',
                  file=sys.stderr, flush=True)
        totals = collections.Counter()
        for e in roots.values():
            totals['clauses'] += e['assertion_clauses']; totals['isolated'] += e['isolated']; totals['alternative'] += e['alternative']
            totals['co_located'] += len(e['co_located']); totals['together'] += len(e['together']); totals['unreached'] += len(e['unreached'])
        distinct = collections.defaultdict(set)
        for e in roots.values():
            distinct['clauses'] |= set(e['witnesses']) | {x['clause'] for x in e['together'] + e['co_located']} | set(e['unreached'])
            distinct['isolated'] |= set(e['witnesses'])
        report['sources'][source] = dict(suite_exit=code, roots=roots, totals=dict(totals),
                                         distinct_clauses=len(distinct['clauses']),
                                         distinct_isolated=len(distinct['isolated']))
    args.out.write_text(json.dumps(report, indent=1, sort_keys=True) + '\n')
    print(json.dumps({s: dict(totals=v['totals'], distinct=v['distinct_clauses'], distinct_isolated=v['distinct_isolated'])
                      for s, v in report['sources'].items()}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
