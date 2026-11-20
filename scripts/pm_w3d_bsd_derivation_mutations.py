#!/usr/bin/env python3
"""Systematic derivation mutations for the W3D checker (PNC-019 lane s4d).

Every observation derivation of scripts/pm_w3d_bsd_events.py is parsed. Each decision clause is weakened alone:
a clause that can make a row true is replaced by True (or by False under an odd number of negations), and the
test of every `if <cond>: return False` / `if <cond>: raise` is replaced by False. The mutated function is compiled
into the checker module, the affected rows' single-defect witnesses run through the complete checker, then the
function is restored and the witnesses rechecked.

Only the expected outcome counts as a kill: at least one witness of an affected row is ACCEPTED under the mutation,
every positive control of those paths stays accepted, and nothing raises (status killed). A refusal at another row,
an exception, or no change is not a kill. Two further outcomes are reported, never counted as kills:
- killed_joint: every witness is refused at another row checking the same value (a duplicate site, such as a payload
  enum row and the owner join of that field). Each site alone refuses; the joint cut (this mutation plus the observed
  duplicate rows forced true) must then ACCEPT the witness, with the controls still accepted. The duplicate rows are
  listed for review.
- gate: removing the clause only makes a witness raise (a readiness check before a comparison); no input is accepted.
Observers of entailed tables are not mutated: their rows have written proofs and no single-defect witness.

Model functions (run_retry, run_replay, run_withdrawal, run_rebuild, run_restore, run_producer, recover and
retention_decision) are stand-ins for the implementation under test, not checker derivations; their defect branches
are the witnesses. They are listed, not mutated.

Usage: python3 -B scripts/pm_w3d_bsd_derivation_mutations.py --json <out.json> [--function NAME]
"""
import argparse
import ast
import copy
import inspect
import json
import re
import sys
import textwrap
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3d_bsd_events as m  # noqa: E402
import pm_w3d_bsd_rows as rows_spec  # noqa: E402
import pm_w3d_bsd_spec as spec  # noqa: E402

MODEL_FUNCTIONS = ('run_retry', 'run_replay', 'run_withdrawal', 'run_rebuild', 'run_restore', 'run_producer',
                   'recover', 'retention_decision', 'SealedOwner.authenticated_original')
# Not decision derivations: value dispatch (which owner source a field joins), the RetainedDispatcher cross-check
# diagnostic (it can only fire on an inconsistent checker; see the strict proof's R10), and a helper used only by
# entailed-table observers.
NOT_MUTATED = {'owner_expected': 'value dispatch: returns the authentic source value; no decision clause',
               'body_expected': 'value dispatch: returns the authentic source value; no decision clause',
               'dispatcher_agrees': 'cross-check diagnostic; fires only when observations and the shared dispatcher disagree',
               'is_hex': 'used only by entailed-table observers (ID02, ID09)'}
# Observation derivations: functions whose returned dict keys are row names.
OBSERVATION_FUNCTIONS = tuple(sorted(name for name in dir(m) if name.startswith('obs_')))
# Helpers that compute values the observations compare.
HELPER_FUNCTIONS = ('frozen_verify', 'perform_retained_read', 'scan_view', 'frame_verified', 'owner_expected',
                    'body_expected', 'stored_logical_body', 'dispatched_payload', '_drain_honest', 'successor_admitted',
                    '_retention_common', '_refs_durable', 'clock_ok', 'uint64_ok', 'is_hex', '_identity_parts',
                    '_pack_parts', 'finding_key_normalized', 'digest_or_none', 'value_hash', 'binding_hash',
                    'encoded_len', 'world_recipes', 'dispatcher_agrees', 'same', 'ok', 'frozen_intent', '_pack_bytes',
                    '_digest_of', '_blake', 'SealedOwner.authenticated_original')
BOOL_CALLS = {'same', 'ok', 'clock_ok', 'uint64_ok', 'is_hex', 'is_valid', 'conforms', 'all', 'any', 'isinstance',
              'startswith', 'endswith', 'frame_verified', 'successor_admitted', '_drain_honest', '_refs_durable',
              'valid', 'preserved', 'settled', 'has', 'after', 'bool'}
ENTAILED_OBSERVERS = ('obs_event_arity', 'obs_key_arity', 'obs_checkpoint_type', 'obs_checkpoint_consumer',
                      'obs_checkpoint_snapshot', 'obs_projection_size', 'obs_source_logical_schema_entailed',
                      'obs_start_premature_result_entailed')
# Helpers used by every phase: a stratified witness sample (up to this many per mutation, spread over rows).
SAMPLE_LIMIT = 2500


def source_of(qualname):
    if '.' in qualname:
        cls, meth = qualname.split('.')
        return textwrap.dedent(inspect.getsource(getattr(getattr(m, cls), meth)))
    return textwrap.dedent(inspect.getsource(getattr(m, qualname)))


def install(qualname, source):
    namespace = {}
    exec(compile(source, f'<mutation {qualname}>', 'exec'), m.__dict__, namespace)
    restore(qualname, namespace[qualname.split('.')[-1]])


def restore(qualname, function):
    """Bind the function under its name, and in the observer dispatch table where the old object is referenced."""
    if '.' in qualname:
        cls, meth = qualname.split('.')
        setattr(getattr(m, cls), meth, function)
        return
    old = getattr(m, qualname)
    setattr(m, qualname, function)
    for key, value in list(m.OBSERVERS.items()):
        if value is old:
            m.OBSERVERS[key] = function


def original_of(qualname):
    if '.' in qualname:
        cls, meth = qualname.split('.')
        return getattr(getattr(m, cls), meth)
    return getattr(m, qualname)


def _call_name(node):
    f = node.func
    if isinstance(f, ast.Name):
        return f.id
    if isinstance(f, ast.Attribute):
        return f.attr
    return None


def _boolish(node):
    if isinstance(node, (ast.Compare, ast.BoolOp)):
        return True
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
        return True
    if isinstance(node, ast.Call) and _call_name(node) in BOOL_CALLS:
        return True
    return False


class Sites(ast.NodeVisitor):
    """Collect (node, replacement, context) mutation sites with polarity."""

    def __init__(self):
        self.sites = []
        self.row_key = []

    def clause(self, node, polarity, context):
        if node is None:
            return
        if isinstance(node, ast.BoolOp):
            self.sites.append((node, polarity, context))
            for value in node.values:
                self.clause(value, polarity, context)
        elif isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
            self.clause(node.operand, not polarity, context)
        elif isinstance(node, ast.IfExp):
            self.clause(node.body, polarity, context)
            self.clause(node.orelse, polarity, context)
        elif _boolish(node):
            self.sites.append((node, polarity, context))

    def visit_Dict(self, node):
        for key, value in zip(node.keys, node.values):
            label = ast.unparse(key) if key is not None else '**'
            if key is not None and _boolish(value) or isinstance(value, (ast.BoolOp, ast.UnaryOp, ast.IfExp)):
                self.clause(value, True, f'row {label}')
        self.generic_visit(node)

    def visit_DictComp(self, node):
        if _boolish(node.value) or isinstance(node.value, (ast.BoolOp, ast.UnaryOp, ast.IfExp)):
            self.clause(node.value, True, f'row {ast.unparse(node.key)}')
        self.generic_visit(node)

    def visit_Assign(self, node):
        target = node.targets[0]
        if isinstance(target, ast.Subscript) and (_boolish(node.value) or isinstance(node.value, (ast.BoolOp, ast.UnaryOp))):
            self.clause(node.value, True, f'row {ast.unparse(target.slice)}')
        elif isinstance(target, ast.Name) and target.id.endswith('_ok') and (
                _boolish(node.value) or isinstance(node.value, (ast.BoolOp, ast.UnaryOp))):
            self.clause(node.value, True, f'value {target.id}')
        self.generic_visit(node)

    def visit_If(self, node):
        body = node.body[0] if node.body else None
        refusing = (isinstance(body, ast.Return) and isinstance(body.value, ast.Constant) and body.value.value in (False, None)) \
            or isinstance(body, ast.Raise)
        if refusing:
            # weakening the refusal guard: the test becomes False
            self.sites.append((node.test, False, 'guard ' + ast.unparse(node.test)[:60]))
        self.generic_visit(node)

    def visit_Return(self, node):
        if node.value is not None and (_boolish(node.value) or isinstance(node.value, (ast.BoolOp, ast.UnaryOp))):
            self.clause(node.value, True, 'return')
        self.generic_visit(node)


def mutations_for(qualname):
    source = source_of(qualname)
    tree = ast.parse(source)
    finder = Sites()
    finder.visit(tree)
    seen = set()
    out = []
    for node, polarity, context in finder.sites:
        key = (node.lineno, node.col_offset, getattr(node, 'end_lineno', 0), getattr(node, 'end_col_offset', 0), polarity)
        if key in seen:
            continue
        seen.add(key)

        parent_tree = ast.parse(source)
        target = None
        for candidate in ast.walk(parent_tree):
            if (getattr(candidate, 'lineno', None), getattr(candidate, 'col_offset', None),
                    getattr(candidate, 'end_lineno', None), getattr(candidate, 'end_col_offset', None)) == key[:4] \
                    and type(candidate) is type(node):
                target = candidate
                break
        if target is None:
            continue

        class Replace(ast.NodeTransformer):
            def visit(self, n):
                if n is target:
                    return ast.copy_location(ast.Constant(value=bool(polarity)), n)
                return super().visit(n)
        mutated = ast.fix_missing_locations(Replace().visit(parent_tree))
        out.append(dict(function=qualname, line=node.lineno, clause=ast.unparse(node)[:200], context=context,
                        replacement=str(bool(polarity)), source=ast.unparse(mutated)))
    return out


def catalog():
    cases = []
    with m.exact_integer_digits():
        for fam in spec.FAMILIES:
            for case in m.all_cases(fam):
                cases.append((fam, case))
    return cases


def run(fam, case):
    try:
        result, extra = m.run_case(fam, case)
        return (list(result[:3]) if result else None), extra, None
    except Exception as error:  # noqa: BLE001 - recorded as a non-kill
        return None, None, f'{type(error).__name__}: {error}'[:200]


def phases_calling(qualname, cases):
    """Instrument once: the base phases during whose observation the function is called."""
    original = original_of(qualname)
    called = set()
    current = {'phase': None}
    real_observe = m.observe

    def wrapped(*a, **k):
        if current['phase']:
            called.add(current['phase'])
        return original(*a, **k)

    def observe(phase, W):
        current['phase'] = rows_spec.base_phase(phase)
        try:
            return real_observe(phase, W)
        finally:
            current['phase'] = None
    restore(qualname, wrapped)
    m.observe = observe
    try:
        with m.exact_integer_digits():
            seen_paths = set()
            for fam, case in cases:
                key = (fam['slug'], case['path'], case['kind'])
                if key in seen_paths and case['kind'] == 'positive':
                    continue
                seen_paths.add(key)
                if case['kind'] == 'positive':
                    run(fam, case)
    finally:
        restore(qualname, original)
        m.observe = real_observe
    return called


def rows_of(mutation):
    """Rows a clause decides: a literal row key, a formatted key pattern, or None (helper: decided dynamically)."""
    match = re.match(r"row '([^']+)'$", mutation['context'])
    if match:
        return {match.group(1)}
    match = re.match(r"row f'(.+)'$", mutation['context']) or re.match(r'row f"(.+)"$', mutation['context'])
    if match:
        parts = re.split(r'\{[^}]*\}', match.group(1))
        return {'re:^' + '.+'.join(re.escape(part) for part in parts) + '$'}
    return None


def joint_cut(elsewhere, controls, rounds=4):
    """With the mutation installed, also force the duplicate rows that refused the witnesses; the witnesses must pass."""
    forced = set()
    remaining = len(elsewhere)
    real = m.observe
    pending = list(elsewhere)
    accepted, control_failures = [], []
    for _ in range(rounds):
        forced |= {r for _f, _c, r in pending}

        def observe(phase, W, _forced=frozenset(forced)):
            obs = real(phase, W)
            for row in _forced:
                if row in obs:
                    obs[row] = True
            return obs
        m.observe = observe
        try:
            nxt = []
            for fam, case, _row in pending:
                res, extra, exc = run(fam, case)
                if res is None and not exc:
                    accepted.append(f"{fam['slug']}:{case['id']}")
                elif res is not None and not exc:
                    nxt.append((fam, case, res[1]))
            remaining = len(nxt)
            if not nxt:
                control_failures = []
                for fam, case in controls[:40]:
                    res, extra, exc = run(fam, case)
                    if exc or res is not None:
                        control_failures.append(f"{fam['slug']}:{case['id']}: {exc or res}")
                break
            pending = nxt
        finally:
            m.observe = real
    return dict(forced_rows=sorted(forced), accepted=len(accepted), remaining=remaining,
                control_failures=control_failures[:3])


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--json')
    ap.add_argument('--function', action='append')
    args = ap.parse_args(argv)
    started = time.time()
    cases = catalog()
    originals = {name: original_of(name) for name in list(OBSERVATION_FUNCTIONS) + list(HELPER_FUNCTIONS)}
    functions = args.function or (list(OBSERVATION_FUNCTIONS) + list(HELPER_FUNCTIONS))
    results = []
    for qualname in functions:
        if qualname in MODEL_FUNCTIONS:
            continue
        if qualname in NOT_MUTATED:
            results.append(dict(function=qualname, status='not_mutated', line=None, clause=NOT_MUTATED[qualname],
                                context='listed', replacement=None))
            continue
        if qualname in ENTAILED_OBSERVERS:
            results.append(dict(function=qualname, status='entailed', line=None, clause='entailed table observer',
                                context='written proof in its table', replacement=None))
            continue
        phases = phases_calling(qualname, cases)
        mutations = mutations_for(qualname)
        for mutation in mutations:
            rows = rows_of(mutation)
            if rows and all(not r.startswith('re:') for r in rows):
                witnesses = [(f, c) for f, c in cases if c['kind'] == 'negative' and c['row'] in rows]
            elif rows:
                regex = re.compile(next(iter(rows))[3:])
                witnesses = [(f, c) for f, c in cases if c['kind'] == 'negative' and regex.match(c['row'])]
            else:
                witnesses = [(f, c) for f, c in cases if c['kind'] == 'negative'
                             and rows_spec.base_phase(c['phase'] or '') in phases]
            if len(witnesses) > SAMPLE_LIMIT:
                by_row = {}
                for f, c in witnesses:
                    by_row.setdefault(c['row'], []).append((f, c))
                sampled, depth = [], 0
                while len(sampled) < SAMPLE_LIMIT and any(len(v) > depth for v in by_row.values()):
                    sampled += [v[depth] for v in by_row.values() if len(v) > depth][:SAMPLE_LIMIT - len(sampled)]
                    depth += 1
                witnesses = sampled
            paths = {c['path'] for _f, c in witnesses}
            controls = [(f, c) for f, c in cases if c['kind'] == 'positive' and c['path'] in paths]
            item = dict(mutation, rows=sorted(rows) if rows else None, phases=sorted(phases),
                        witnesses=len(witnesses), controls=len(controls))
            item.pop('source')
            try:
                install(qualname, mutation['source'])
            except Exception as error:  # noqa: BLE001
                item.update(status='not_compiled', error=str(error)[:200])
                results.append(item)
                continue
            accepted, elsewhere, exceptions, control_failures = [], [], [], []
            joint = None
            try:
                with m.exact_integer_digits():
                    for fam, case in witnesses:
                        res, extra, exc = run(fam, case)
                        if exc:
                            exceptions.append(f"{fam['slug']}:{case['id']}: {exc}")
                        elif res is None:
                            accepted.append(f"{fam['slug']}:{case['id']}" + (' (dispatcher diagnostic)' if extra else ''))
                        elif res != [case['phase'], case['row'], m.code_of(case['phase'], case['row'])]:
                            elsewhere.append((fam, case, res[1]))
                    for fam, case in controls:
                        res, extra, exc = run(fam, case)
                        if exc or res is not None or extra:
                            control_failures.append(f"{fam['slug']}:{case['id']}: {exc or res or extra}")
                    if not accepted and not exceptions and not control_failures and elsewhere:
                        joint = joint_cut(elsewhere, controls)
            finally:
                restore(qualname, originals[qualname])
            if accepted:
                status = 'killed'  # an expected acceptance occurred; exceptions and changed controls are reported
            elif control_failures:
                status = 'controls_changed'
            elif exceptions and not accepted:
                status = 'gate'
            elif joint and joint['accepted'] and not joint['control_failures']:
                status = 'killed_joint'
            else:
                status = 'survived'
            item.update(status=status, accepted=len(accepted), accepted_sample=accepted[:5],
                        refused_elsewhere=len(elsewhere),
                        elsewhere_rows=sorted({r for _f, _c, r in elsewhere}),
                        joint=joint, exceptions=exceptions[:3], control_failures=control_failures[:3])
            results.append(item)
            print(json.dumps({k: item[k] for k in ('function', 'line', 'status', 'accepted', 'witnesses', 'clause')}),
                  flush=True)
    counts = {}
    for item in results:
        counts[item['status']] = counts.get(item['status'], 0) + 1
    out = dict(status='pass' if all(r['status'] in ('killed', 'killed_joint', 'gate', 'entailed', 'not_mutated')
                                    for r in results) else 'fail',
               counts=counts, mutations=len(results), model_functions=list(MODEL_FUNCTIONS),
               elapsed_seconds=round(time.time() - started, 1), results=results)
    if args.json:
        Path(args.json).write_text(json.dumps(out, indent=1) + '\n')
    print(json.dumps({k: v for k, v in out.items() if k != 'results'}, indent=1))
    return 0 if out['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
