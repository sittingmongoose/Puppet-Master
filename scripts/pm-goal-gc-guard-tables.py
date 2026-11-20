#!/usr/bin/env python3
"""PNC-019 C12-GC: real-vector Method B proof for the four GC Goal families.

Families: goal_run.stopped and goal_run.blocked (DG-OWN-A suite, scripts/pm_goal_own_a_oracles.py,
ATS-1110..1112) and goal.blocked and goal.completed (DG-OWN-B suite, scripts/pm_goal_own_b_oracles.py,
ATS-1113..1115). This runner does not use pm_goal_guard_sweep.py or its prove(); it follows the reference
lanes (scripts/pm-dg6a-guard-tables.py).

1. Discovery: each suite's own main() runs under pm_goal_gc_adapter.RECORDER. Every top-level checker call is
   one complete call with its sealed input, the ordered observations of every owner predicate it evaluated and
   its result. Each case's declared target is the suite's authored expected refusal, never the observed one.
2. Kill test: every negative case's final call (the call whose refusal is its declared target) is replayed with
   only that row cut. A kill is counted only when the cut complete checker ACCEPTS and the restored checker
   returns the same refusal again. A later refusal or an exception earns nothing.
3. Tables: rows reached by exactly the same accepted evaluations (controls and accepted cut runs) are one phase,
   in evaluation order, at most eight rows per table (scripts/pm_goal_gc_table_<phase>.py, rows in
   scripts/pm_goal_gc_rows.json). Generation is deterministic; --check compares without writing.
4. Gated proof: in a gated pass every decision comes only from the generated tables. Each table is given to the
   gated guard tool (scripts/pm_guard_isolation.py, pinned 004bdedd63) with real observation vectors: controls
   from accepted complete calls, negatives from the accepted cut runs (every other row of the phase was computed
   on the defective input and held). The lane matrix requires every negative to fail exactly its own row.
   Credit is copied from the tool's report.
5. Ledger: every negative case, uncapped, with declared target and outcome class; invalid mutations (target not
   the actual first refusal, accepted, exception, harness-only) are listed separately.

Usage: python3 scripts/pm-goal-gc-guard-tables.py --out DIR [--source own_a|own_b]... [--generate | --check]
Native execution is NOT_RUN. Run under systemd-run --user --scope -p MemoryMax=2G -p MemorySwapMax=0.
"""
import argparse
import collections
import contextlib
import copy
import gzip
import hashlib
import importlib
import io
import json
import pickle
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402
import pm_goal_gc_adapter as adapter  # noqa: E402

SOURCES = {'own_a': 'pm_goal_own_a_oracles', 'own_b': 'pm_goal_own_b_oracles'}
FAMILIES = {'own_a': ('goal_run.stopped', 'goal_run.blocked'), 'own_b': ('goal.blocked', 'goal.completed')}
RETURN_SOURCE = 'return g.Case(table, check, context)'
# Declared duplicate sets (Method B `Duplicate` shape): the same owner invariant enforced again at a later site of
# the same complete call. A row whose own cut is refused only by a declared later site earns a duplicate-set kill
# when the joint cut of the set lets the complete checker accept and restoring it brings back the same refusal;
# each later site needs its own single-row kill. Never counted as a single-row kill.
from pm_goal_gc_declarations import DUPLICATES, JUSTIFIED  # noqa: E402
TOOL_COMMIT = '004bdedd63'
MAX_ROWS = 8


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def family_of(source, case):
    for family in FAMILIES[source]:
        if case.startswith(family + '/'):
            return family
    if source == 'own_b':
        route = case.split('/', 1)[0]
        return {'blocked': 'goal.blocked', 'completed': 'goal.completed', 'exception': 'goal.completed'}.get(route, 'shared')
    return 'shared'


def run_source(source):
    module = importlib.import_module(SOURCES[source])
    rec = adapter.Recorder(source)
    adapter.RECORDER = rec
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            code = module.main([]) if 'argv' in module.main.__code__.co_varnames[:module.main.__code__.co_argcount] else module.main()
    finally:
        adapter.RECORDER = None
    text = out.getvalue()
    summary = json.loads(text[text.index('{'):]) if '{' in text else {}
    return rec, code, summary


def target_of(expected):
    if expected is None:
        return None
    return expected[5:] if expected.startswith('halt:') else expected


def merged(observations):
    facts = {}
    for key, holds, _site in observations:
        facts[key] = facts.get(key, True) and holds
    return facts


def analyse(source, rec, *, replay):
    """Classify every case; replay cut and restore runs for the negatives."""
    adapter.RECORDER = rec
    try:
        ledger, positives = [], []
        for case in rec.cases:
            target = target_of(case['expected'])
            family = family_of(source, case['name'])
            calls = [rec.calls[i] for i in case['calls']]
            if target is None:
                positives.append(dict(case=case['name'], family=family, calls=[c['label'] for c in calls], got=case['got']))
                continue
            entry = dict(case=case['name'], family=family, declared_target=target,
                         row=adapter.row_key(source, target), suite_result=case['got'])
            final = [c for c in calls if c['outcome'].get('refusal') == target]
            if not final:
                kinds = sorted({c['outcome']['kind'] + (':' + str(c['outcome'].get('refusal')) if c['outcome'].get('refusal') else '') for c in calls})
                entry.update(outcome_class='harness_only' if case['got'] == case['expected'] else 'declared_target_mismatch',
                             calls=[c['label'] for c in calls], call_kinds=kinds)
                ledger.append(entry)
                continue
            call = final[-1]
            first_failing = next((k for k, h, _ in call['outcome']['observations'] if not h), None)
            entry.update(final_call=call['label'], input_sha256=call['input_sha256'], first_failing_row=first_failing)
            if first_failing != entry['row']:
                entry['outcome_class'] = 'declared_target_mismatch'
                ledger.append(entry)
                continue
            if replay:
                cut = rec.replay(call, cut={entry['row']})
                facts = merged(cut['observations'])
                entry['cut'] = dict(kind=cut['kind'], refusal=cut.get('refusal'), exception=cut.get('exception'),
                                    failing_rows=sorted(k for k, h in facts.items() if not h))
                restore = rec.replay(call)
                entry['restore'] = dict(kind=restore['kind'], refusal=restore.get('refusal'))
                restored = restore.get('refusal') == target and restore['kind'] in ('refused', 'halt')
                duplicate = DUPLICATES.get(source, {}).get(target)
                if cut['kind'] == 'accepted' and restored:
                    entry['outcome_class'] = 'kill'
                    entry['_cut_observations'] = cut['observations']
                elif cut['kind'] == 'exception':
                    entry['outcome_class'] = 'cut_exception'
                elif cut['kind'] in ('refused', 'halt') and duplicate and cut.get('refusal') in duplicate['rows'] and restored:
                    joint_rows = {entry['row']} | {adapter.row_key(source, d) for d in duplicate['rows']}
                    joint = rec.replay(call, cut=joint_rows)
                    entry['joint_cut'] = dict(rows=sorted(joint_rows), kind=joint['kind'], refusal=joint.get('refusal'),
                                              exception=joint.get('exception'))
                    if joint['kind'] == 'accepted':
                        entry['outcome_class'] = 'duplicate_set_kill'
                        entry['_cut_observations'] = joint['observations']
                    else:
                        entry['outcome_class'] = 'cut_refuses_later'
                elif cut['kind'] in ('refused', 'halt'):
                    entry['outcome_class'] = 'cut_refuses_later'
                else:
                    entry['outcome_class'] = 'restore_mismatch'
            ledger.append(entry)
        return ledger, positives
    finally:
        adapter.RECORDER = None


def evaluations(source, rec, ledger):
    """Accepted evaluations: normal accepted calls and accepted cut runs (each with every observation)."""
    out = []
    for call in rec.calls:
        if call['outcome']['kind'] == 'accepted':
            out.append(dict(id=call['label'], kind='control', case=call['case'], observations=call['outcome']['observations'],
                            input_sha256=call['input_sha256']))
    for entry in ledger:
        if entry.get('outcome_class') in ('kill', 'duplicate_set_kill'):
            out.append(dict(id=entry['final_call'] + '#cut', kind='cut', case=entry['case'], target=entry['row'],
                            observations=entry['_cut_observations'], input_sha256=entry['input_sha256']))
    return out


def field_name(code, taken):
    base = re.sub(r'[^0-9A-Za-z]+', '_', code).strip('_') or 'row'
    name, n = base, 2
    while name in taken:
        name, n = f'{base}_{n}', n + 1
    taken.add(name)
    return name


def plan_tables(source, evals, first_seen, killable):
    """Killable rows (a single-row or duplicate-set kill) share phase tables by identical reach; every other row
    is alone in its own table with its written justification (the tool proves a table only when each row has a
    real negative)."""
    reach = collections.defaultdict(set)
    sites = collections.defaultdict(set)
    for index, e in enumerate(evals):
        for key, _holds, site in e['observations']:
            reach[key].add(index)
            sites[key].add(site)
    # A row killed only through a declared duplicate set is alone in its table: its joint-cut vector also fails the
    # duplicate rows, which must never share its table.
    groups = collections.defaultdict(list)
    for key in first_seen:
        groups[(frozenset(reach.get(key, ())), key if key not in killable else None)].append(key)
    ordered = sorted(groups.values(), key=lambda keys: first_seen[keys[0]])
    tables, mapping = [], {}
    for keys in ordered:
        keys = sorted(keys, key=lambda k: first_seen[k])
        for start in range(0, len(keys), MAX_ROWS):
            chunk = keys[start:start + MAX_ROWS]
            name = f'{source}_{len(tables) + 1:03d}'
            taken = set()
            rows = []
            for key in chunk:
                code = key.split(':', 1)[1]
                field = field_name(code, taken)
                rows.append(dict(key=key, code=code, field=field, sites=sorted(sites.get(key, ())) or ['not-reached-in-accepted-evaluation']))
                mapping[key] = dict(table=name, field=field, code=code)
            tables.append(dict(name=name, rows=rows, reached_by=len(reach.get(chunk[0], ()))))
    return tables, mapping


def module_text(table):
    lines = [f'"""Goal GC guard table {table["name"]} (PNC-019 C12-GC Method B; generated by scripts/pm-goal-gc-guard-tables.py --generate).',
             '',
             'One owner predicate per row, in the complete checker\'s evaluation order. Every row of this table is',
             'evaluated by exactly the same accepted complete calls. Predicates read only their own derived observation;',
             'the checker derives each observation from the complete input and decides nothing itself.',
             '"""',
             'import pm_guard_isolation as g',
             '',
             'FIELDS = (' + ''.join(repr(r['field']) + ', ' for r in table['rows']).rstrip(' ') + ')',
             '']
    for i, r in enumerate(table['rows'], 1):
        lines += ['', f'def R{i:02d}_{r["field"]}(value, context):',
                  f'    return {r["code"]!r} if value[{r["field"]!r}] is not True else None', '']
    lines += ['', 'def case(value):', '    context = None', '    table = g.GuardTable([']
    for i, r in enumerate(table['rows'], 1):
        lines.append(f'        g.Guard({"R%02d_%s" % (i, r["field"])!r}, g.Invariant({"/" + r["field"]!r}, '
                     f'{("owner predicate " + r["code"] + " at " + r["sites"][0])!r}), {r["code"]!r}, R{i:02d}_{r["field"]}),')
    lines += ['    ])', '', '    def check(value):']
    for i, r in enumerate(table['rows'], 1):
        lines.append(f'        table.require({"R%02d_%s" % (i, r["field"])!r}, value, context)')
    lines += ['        return True', '    return g.Case(table, check, context)', '']
    return '\n'.join(lines)


def write_tables(tables, mapping, *, check):
    texts = {ROOT / 'scripts' / (adapter.PREFIX + t['name'] + '.py'): module_text(t) for t in tables}
    rows_text = json.dumps(mapping, indent=1, sort_keys=True) + '\n'
    problems = []
    if check:
        for path, text in texts.items():
            if not path.exists() or path.read_text() != text:
                problems.append(str(path.relative_to(ROOT)))
        if not adapter.ROWS_PATH.exists() or adapter.ROWS_PATH.read_text() != rows_text:
            problems.append(str(adapter.ROWS_PATH.relative_to(ROOT)))
        stale = [p for p in (ROOT / 'scripts').glob(adapter.PREFIX + '*.py') if p not in texts]
        problems += [str(p.relative_to(ROOT)) for p in stale]
        return problems
    for path in (ROOT / 'scripts').glob(adapter.PREFIX + '*.py'):
        if path not in texts:
            path.unlink()
    for path, text in texts.items():
        path.write_text(text)
    adapter.ROWS_PATH.write_text(rows_text)
    return problems


def vectors(tables, evals):
    """Real observation vectors per table: a control is an accepted call that reached every row; a negative is
    an accepted cut run of one of the table's rows (every row computed on the defective input)."""
    out = {}
    for t in tables:
        keys = [r['key'] for r in t['rows']]
        field = {r['key']: r['field'] for r in t['rows']}
        slot = dict(controls={}, negatives={}, incomplete=[])
        for e in evals:
            facts = merged(e['observations'])
            if e['kind'] == 'cut' and e['target'] not in keys:
                continue
            if not all(k in facts for k in keys):
                if e['kind'] == 'cut':
                    slot['incomplete'].append(dict(id=e['id'], missing=[k for k in keys if k not in facts]))
                continue
            value = {field[k]: facts[k] for k in keys}
            text = json.dumps(value, sort_keys=True)
            if e['kind'] == 'control':
                slot['controls'].setdefault(text, dict(id='control/' + e['id'], value=value, cases=[], inputs=[]))
                entry = slot['controls'][text]
            else:
                slot['negatives'].setdefault(e['target'] + text, dict(id='negative/' + e['id'], value=value, target=e['target'],
                                                                     cases=[], inputs=[]))
                entry = slot['negatives'][e['target'] + text]
            if len(entry['cases']) < 64:
                entry['cases'].append(e['case'])
                entry['inputs'].append(e['input_sha256'])
        out[t['name']] = slot
    return out


def lane_matrix(table, slot):
    rows = [(r['key'], r['field']) for r in table['rows']]
    problems = []
    for c in slot['controls'].values():
        failing = [k for k, f in rows if c['value'][f] is not True]
        if failing:
            problems.append(dict(case=c['id'], kind='control_refused', rows=failing))
    for n in slot['negatives'].values():
        failing = [k for k, f in rows if n['value'][f] is not True]
        if failing != [n['target']]:
            problems.append(dict(case=n['id'], kind='not_single_row', target=n['target'], rows=failing))
    return problems


def field_of(table, key):
    return next(r['field'] for r in table['rows'] if r['key'] == key)


def run_tool(table, slot, out, per_row):
    started = time.monotonic()
    names = {r['key']: 'R%02d_%s' % (i, r['field']) for i, r in enumerate(table['rows'], 1)}
    code = {r['key']: r['code'] for r in table['rows']}
    controls = list(slot['controls'].values())[:10]
    negatives = []
    single = [n for n in slot['negatives'].values()
              if [k for k in (x['key'] for x in table['rows']) if n['value'][field_of(table, k)] is not True] == [n['target']]]
    for r in table['rows']:
        negatives += [n for n in single if n['target'] == r['key']][:per_row]
    summary = dict(table=table['name'], rows=[r['key'] for r in table['rows']], controls=len(controls), negatives=len(negatives),
                   rows_without_negative=[r['key'] for r in table['rows'] if not any(n['target'] == r['key'] for n in negatives)],
                   lane_matrix=lane_matrix(table, slot), incomplete_cut_vectors=slot['incomplete'][:20],
                   incomplete_cut_vector_count=len(slot['incomplete']))
    if not controls or not negatives:
        source = table['name'].rsplit('_', 1)[0]
        justified = {r['key']: JUSTIFIED.get(source, {}).get(r['code']) for r in table['rows']}
        summary.update(tool_status='NOT_RUN', reason='no control' if not controls else 'no negative', proved=[],
                       unproved=summary['rows'], justification=justified,
                       unjustified=[k for k, v in justified.items() if not v])
        return summary
    path = 'scripts/' + adapter.PREFIX + table['name'] + '.py'
    module = importlib.import_module(adapter.PREFIX + table['name'])
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), names[n['target']], code[n['target']], gc[0].id,
                     'complete-checker cut-run witness of ' + n['cases'][0] + ' input ' + n['inputs'][0][:16]) for n in negatives]
    suite = g.Suite('Goal GC ' + table['name'], module.case, gc, gn, (path,), ROOT,
                    non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                           'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
    stops = [e for e in g.prescan_sources(ROOT / path) if e['kind'] in g.STATIC_STOP_KINDS]
    if stops:
        raise SystemExit('prescan stop kinds: ' + json.dumps(stops, indent=1, default=str))
    report = g.run(suite, memory=g.MemoryGate(1800, 10, 11, 30, 2700))
    raw = json.dumps(report, indent=1, sort_keys=True, default=str).encode() + b'\n'
    with gzip.GzipFile(out / (table['name'] + '.json.gz'), 'wb', mtime=0) as handle:
        handle.write(raw)
    by_name = {v: k for k, v in names.items()}
    summary.update(tool_status=report['status'], tool_sha256=report.get('tool_sha256'),
                   proved=sorted(by_name[r['id']] for r in report.get('rows', []) if r.get('proved')),
                   unproved=sorted(by_name.get(x, x) for x in report.get('unproved_guards', [])),
                   failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                   seconds=round(time.monotonic() - started, 1), report_sha256=sha(raw))
    return summary


def strip(entry):
    return {k: v for k, v in entry.items() if not k.startswith('_')}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--source', action='append', choices=sorted(SOURCES))
    parser.add_argument('--generate', action='store_true', help='write the table modules and the row inventory')
    parser.add_argument('--check', action='store_true', help='regenerate in memory and compare with the checked-in tables')
    parser.add_argument('--per-row', type=int, default=4)
    args = parser.parse_args()
    sources = args.source or sorted(SOURCES)
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    bindings_before = {str(p.relative_to(ROOT)): sha(p.read_bytes()) for p in sorted((ROOT / 'scripts').glob('pm_goal*.py'))
                       + [ROOT / 'scripts/pm_guard_isolation.py', ROOT / 'scripts/pm-goal-gc-guard-tables.py',
                          ROOT / 'scripts/pm_event_numbers.py', ROOT / 'scripts/pm_event_datetime.py']
                       if not p.name.startswith(adapter.PREFIX)}  # table modules are bound after generation
    # ---- pass A: discovery (plain decisions), kill replays, table plan
    adapter.GATED = False
    discovery, all_tables, all_mapping, result = {}, [], {}, dict(sources={}, native_execution='NOT_RUN')
    for source in sources:
        rec, code, summary = run_source(source)
        ledger, positives = analyse(source, rec, replay=True)
        evals = evaluations(source, rec, ledger)
        first_seen = {}
        for call in rec.calls:
            for key, _h, _s in call['outcome']['observations']:
                first_seen.setdefault(key, len(first_seen))
        killable = {e['row'] for e in ledger if e.get('outcome_class') == 'kill'}
        tables, mapping = plan_tables(source, evals, first_seen, killable)
        discovery[source] = dict(rec=rec, ledger=ledger, evals=evals, tables=tables)
        all_tables += tables
        all_mapping.update(mapping)
        result['sources'][source] = dict(suite_exit=code, suite_status=summary.get('status'),
                                         suite_cases=summary.get('case_count', summary.get('cases')), calls=len(rec.calls), rows=len(mapping),
                                         tables=len(tables))
        print(f'{source}: calls={len(rec.calls)} rows={len(mapping)} tables={len(tables)} suite={summary.get("status")}', file=sys.stderr, flush=True)
    if args.check:
        problems = write_tables(all_tables, all_mapping, check=True)
        (args.out / 'check.json').write_text(json.dumps(dict(problems=problems), indent=1) + '\n')
        print(json.dumps(dict(check_problems=len(problems))))
        return int(bool(problems))
    if args.generate:
        write_tables(all_tables, all_mapping, check=False)
    adapter.reset_tables()
    importlib.invalidate_caches()
    for path in sorted((ROOT / 'scripts').glob(adapter.PREFIX + '*.py')) + [adapter.ROWS_PATH]:
        bindings_before[str(path.relative_to(ROOT))] = sha(path.read_bytes())
    # ---- pass B: gated replay; every decision comes only from the generated tables
    adapter.GATED = True
    tool_out = args.out / 'tables'
    tool_out.mkdir(exist_ok=True)
    table_summaries, ledgers, store_rows = [], {}, []
    for source in sources:
        rec, code, summary = run_source(source)
        ledger, positives = analyse(source, rec, replay=True)
        before = [(e['case'], e.get('outcome_class')) for e in discovery[source]['ledger']]
        after = [(e['case'], e.get('outcome_class')) for e in ledger]
        evals = evaluations(source, rec, ledger)
        slots = vectors(discovery[source]['tables'], evals)
        for table in discovery[source]['tables']:
            table_summaries.append(run_tool(table, slots[table['name']], tool_out, args.per_row))
            print(f'{table["name"]}: {table_summaries[-1]["tool_status"]} proved {len(table_summaries[-1]["proved"])}/{len(table["rows"])}',
                  file=sys.stderr, flush=True)
        ledgers[source] = [strip(e) for e in ledger]
        for call in rec.calls:
            if call['read']:
                store_rows.append(dict(source=source, call=call['label'], case=call['case'], kind=call['outcome']['kind'],
                                       refusal=call['outcome'].get('refusal'), input_sha256=call['input_sha256'],
                                       store_before=call['outcome'].get('store_before'), store_after=call['outcome'].get('store_after'),
                                       store_pickle_sha256=sha(call['store_pickle'])))
        with gzip.GzipFile(args.out / f'{source}-calls.json.gz', 'wb', mtime=0) as handle:
            handle.write(json.dumps([dict(label=c['label'], case=c['case'], entry=c['entry'], input_sha256=c['input_sha256'],
                            kind=c['outcome']['kind'], refusal=c['outcome'].get('refusal'), exception=c['outcome'].get('exception'),
                            observations=[[k, h, s] for k, h, s in c['outcome']['observations']],
                            schema_clauses=c['outcome'].get('schema_clauses')) for c in rec.calls]).encode())
        with gzip.GzipFile(args.out / f'{source}-inputs.pickle.gz', 'wb', mtime=0) as handle:
            pickle.dump({c['input_sha256']: c['input_pickle'] for c in rec.calls}, handle, protocol=5)
        result['sources'][source].update(gated_suite_exit=code, gated_suite_status=summary.get('status'),
                                         discovery_equals_gated=before == after,
                                         ledger=dict(collections.Counter(e.get('outcome_class') for e in ledger)),
                                         positives=len(positives))
    (args.out / 'tables.json').write_text(json.dumps(table_summaries, indent=1) + '\n')
    (args.out / 'ledger.json').write_text(json.dumps(ledgers, indent=1) + '\n')
    (args.out / 'retained-store-snapshots.json').write_text(json.dumps(store_rows, indent=1) + '\n')
    bindings_after = {path: sha((ROOT / path).read_bytes()) for path in bindings_before}
    drift = sorted(p for p in bindings_before if bindings_before[p] != bindings_after[p])
    rows_total = sum(len(t['rows']) for t in table_summaries)
    proved = sum(len(t['proved']) for t in table_summaries)
    result.update(tables=len(table_summaries), rows=rows_total, proved=proved,
                  tool_failure_tables=sorted(t['table'] for t in table_summaries if t.get('tool_status') not in ('PASS', 'NOT_RUN')),
                  lane_matrix_problems=sum(len(t['lane_matrix']) for t in table_summaries),
                  unproved_justified=sorted(k for t in table_summaries for k in t['unproved'] if t.get('justification', {}).get(k)),
                  unproved_unjustified=sorted(k for t in table_summaries for k in t['unproved'] if not t.get('justification', {}).get(k)),
                  source_bindings=bindings_before, changed_during_run=drift, seconds=round(time.monotonic() - started, 1))
    (args.out / 'summary.json').write_text(json.dumps(result, indent=1, sort_keys=True) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'source_bindings'}, sort_keys=True))
    return int(bool(drift) or any(s.get('gated_suite_exit') for s in result['sources'].values()))


if __name__ == '__main__':
    sys.exit(main())
