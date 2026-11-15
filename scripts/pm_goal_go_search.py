"""C12-GO kill-seeking witness search over the frozen restore_point.deleted / run.started helpers.

For each row a family's complete calls evaluate that has no single-row kill yet
(no remembered exact witness whose whole-checker cut of that row accepts and
whose restoration refuses again), edit real accepted helper inputs of the frozen
function that holds the row (coherent hash re-derivation, pm_goal_deleted_case_ops
Editor v5, immutable schema/codec context unchanged). Every attempt is a
complete call registered with its declared target (the searched row) *before*
it runs, so every attempt, whatever its outcome, is a ledger entry; the sweep's
judge alone grants kill credit.

The search reads an attempt's outcome only to stop searching for that row. If
a row's exact witnesses all refuse later under the cut, the witness is
re-registered with the declared duplicate set (row, later row) and, when that
joint cut refuses at one more row, (row, later, next): the judge then requires
the joint cut to accept and every site to refuse alone (DUPLICATE_SET_KILLED).
Decisions use only complete-checker replays, so pass 1 (discovery) and pass 2
(gated predicates) make identical choices.
"""
import ast
import collections
import copy
import inspect
import json
import re
from pathlib import Path

import pm_goal_go_declare as declare

BUDGET = 48          # declared attempts per (row, family)
COMPLETE_BUDGET = 32 # of those, attempts on whole-checker seeds (rows no helper seed holds)
TREES = {}
DUP_TRIES = 2        # exact witnesses tried as duplicate-set candidates per row


def family_rows(collector, family):
    rows = set()
    for record in collector.ledger:
        if record.get('family') == family and record.get('sig') is not None:
            rows |= collector.signature_list[record['sig']]
    return rows


def killed(collector, evaluate, value, row):
    cut = collector._replay(evaluate, value, {row})
    if cut != []:
        return False, cut
    return collector._replay(evaluate, value, ()) == [row], cut


def seed_index(seeds):
    out = []
    for fn, base, label in seeds:
        code = fn.__func__.__code__ if inspect.ismethod(fn) else fn.__code__
        lines = [line for _, _, line in code.co_lines() if line is not None]
        out.append((fn, base, label, code.co_filename, code.co_firstlineno, max(lines)))
    return out


def evaluator(fn, frozen):
    def evaluate(value):
        try:
            fn(*value['args'], **value['kwargs'])
        except frozen.ExpectedRefusal as refusal:
            return refusal.errors
        return set()
    return evaluate


def candidates(fn, base, row, sites, frozen, alternatives):
    """(path, mode) edits relevant to the row: members named in the row's predicate first."""
    from pm_goal_deleted_case_ops import at, nodes
    code = fn.__func__.__code__ if inspect.ismethod(fn) else fn.__code__
    parameters = list(inspect.signature(fn).parameters)
    fixed = {'admission_schema', 'receipt_schema', 'routes', 'compat', 'sid', 'mp', 'bdig', 'schema', 'registry'}

    def mutable(path):
        if not path or path[0] == 'args' and len(path) <= 2:
            return False
        if path[0] == 'args' and path[1] < len(parameters) and parameters[path[1]] in fixed:
            return False
        if path[0] == 'kwargs' and (len(path) < 2 or path[1] in fixed):
            return False
        return True
    tail = row.rsplit('/', 1)[-1]
    keys = set()
    # The predicate's own source lines (any file that holds the row), not only the seed function's file.
    for file in sorted({f for f, _ in sites}):
        try:
            tree = TREES.setdefault(file, ast.parse(Path(file).read_text()))
        except (OSError, SyntaxError):
            continue
        lines = {line for f, line in sites if f == file}
        calls = [x for x in ast.walk(tree) if isinstance(x, ast.Call) and x.lineno in lines and len(x.args) > 1]
        matching = [x for x in calls if isinstance(x.args[1], ast.Constant) and x.args[1].value == tail]
        keys |= {y.value for x in (matching or calls) for y in ast.walk(x.args[0]) if isinstance(y, ast.Constant) and type(y.value) is str}
        keys |= {y.attr for x in (matching or calls) for y in ast.walk(x.args[0]) if isinstance(y, ast.Attribute)}
    if re.fullmatch('[A-Za-z_][A-Za-z0-9_]*', tail.split()[-1]):
        keys.add(tail.split()[-1])
    paths = [(p, v) for p, v in nodes(base) if mutable(p)]
    relevant = [(p, v) for p, v in paths if any(k in keys for k in p if type(k) is str)]
    if not relevant:  # the predicate names no member (e.g. v.is_valid(x)): every mutable leaf, shallow first
        relevant = [(p, v) for p, v in paths if not isinstance(v, (dict, list))]
    relevant.sort(key=lambda item: (isinstance(item[1], (dict, list)), item[0][-1] not in keys, len(item[0]), repr(item[0])))
    for path, original in relevant:
        modes = ['coherent', 'simple', 'coherent_hash_claim', 'coherent_remove', 'remove', 'coherent_rename']
        if path[-1] == 'replayed' and type(original) is bool:
            modes = ['coherent_replay'] + modes
        choices = []
        if type(original) in (str, int, float, bool):
            choices = alternatives.get((type(original), original), [])
        if type(original) in (int, float):
            choices = [0, 1, -1] + choices
        if isinstance(original, (dict, list)):
            choices = [None, []] + choices
        encoded = list(dict.fromkeys(json.dumps(v, separators=(',', ':')) for v in choices))[:10]
        modes += ['coherent_value:' + value for value in encoded]
        for mode in modes:
            yield path, mode


def run(collector, family, seed_sets, frozen, complete=()):
    """Search for the family's uncovered rows; returns evidence counts (no credit)."""
    from pm_goal_deleted_case_ops import Editor
    import pm_goal_guard_sweep as sweep
    stats = collections.Counter()
    rows = sorted(family_rows(collector, family))
    covered, later = set(), {}
    for row in rows:
        for evaluate, value, label in declare.EXACT.get((row, family), []):
            ok, cut = killed(collector, evaluate, value, row)
            stats['coverage_replays'] += 1
            if ok:
                covered.add(row)
                break
            if isinstance(cut, list) and cut:
                later.setdefault(row, []).append((evaluate, value, label, cut))
    stats['rows'] = len(rows)
    stats['covered_before_search'] = len(covered)
    alternatives = {}

    def enums(value):
        if isinstance(value, dict):
            choices = [x for x in value.get('enum', []) if type(x) in (str, int, float, bool)]
            for choice in choices:
                alternatives.setdefault((type(choice), choice), []).extend(
                    x for x in choices if type(x) is not type(choice) or x != choice)
            for child in value.values():
                enums(child)
        elif isinstance(value, list):
            for child in value:
                enums(child)
    for resource in frozen.RESOURCES.values():
        enums(resource.contents)
    seeds = []
    for group, _files in seed_sets:
        seeds.extend(seed_index(group))
    complete_seeds = seed_index(complete)
    editors = {}
    outcome = {}
    for row in rows:
        if row in covered:
            continue
        sites = collector.rows.get(row, {}).get('sites', set())
        holders = [s for s in seeds if any(f == s[3] and s[4] <= line <= s[5] for f, line in sites)]
        # Rows no captured helper holds are searched on the family's whole-checker positives.
        holders += [s for s in complete_seeds if s not in holders]
        attempts, done, whole = 0, False, 0
        tried = set()
        for holder in holders:
            fn, base, label = holder[:3]
            if done or attempts >= BUDGET:
                break
            is_complete = holder in complete_seeds
            evaluate = evaluator(fn, frozen)
            key = (label, id(fn))
            if key not in editors:
                editors[key] = Editor(base, frozen.helper_hash_functions(5), version=5)
            editor = editors[key]
            for path, mode in candidates(fn, base, row, sites, frozen, alternatives):
                if attempts >= BUDGET or (is_complete and whole >= COMPLETE_BUDGET):
                    break
                if (label, path, mode) in tried:
                    continue
                tried.add((label, path, mode))
                try:
                    value = editor.edit(path, mode)
                except (TypeError, ValueError, KeyError, IndexError, AttributeError):
                    continue
                if not frozen.fixed_context_unchanged(fn, base, value):
                    continue
                attempts += 1
                whole += is_complete
                stats['attempts'] += 1
                stats['whole_checker_attempts'] += is_complete
                source = f'go-search/{family}/{mode}/{label}/{path!r}'
                collector.invoke(source, evaluate, value, False, target=row, family=family, generated=True)
                record = collector.ledger[-1]
                record['declared_rule'] = 'go_search_row'
                record['search'] = dict(seed=label, path=[str(p) for p in path], mode=mode,
                                        input_digest=sweep.digest(value))
                if record.get('outcome') != 'exact_expected':
                    continue
                ok, cut = killed(collector, evaluate, value, row)
                if ok:
                    done = True
                    stats['search_killed'] += 1
                    break
                if isinstance(cut, list) and cut:
                    later.setdefault(row, []).append((evaluate, value, source, cut))
        if done:
            covered.add(row)
            outcome[row] = 'search_killed'
            continue
        # Duplicate-set declarations from the row's exact witnesses whose cut refuses later.
        declared = False
        for evaluate, value, source, cut in later.get(row, [])[:DUP_TRIES]:
            chain = {row} | set(cut)
            for depth in range(6):
                joint = collector._replay(evaluate, value, chain)
                if joint == [] or not isinstance(joint, list) or len(chain) > 8:
                    break
                chain |= set(joint)
            target = tuple(sorted(chain))
            collector.invoke('go-duplicate/' + family + '/' + source, evaluate, value, False,
                             target=target, family=family, generated=True)
            record = collector.ledger[-1]
            record['declared_rule'] = 'go_duplicate_chain'
            record['duplicate_chain_from'] = row
            stats['duplicate_declarations'] += 1
            declared = True
            if collector._replay(evaluate, value, set(target)) == []:
                outcome[row] = 'duplicate_set'
                break
        if row not in outcome:
            outcome[row] = 'duplicate_attempted' if declared else ('no_exact_witness' if not later.get(row) else 'uncovered')
    stats['covered_after_search'] = len(covered)
    counts = collections.Counter(outcome.values())
    return dict(family=family, stats=dict(stats), outcomes=dict(counts),
                rows={row: outcome.get(row, 'covered_before_search') for row in rows})
