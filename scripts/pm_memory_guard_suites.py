"""DMEM guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py).

Adapter only: no table module imports it, so the tool scans just the phase table
under test. Every witness call of the complete DMEM checkers (the eight-family
maintenance checker and the four-family Card 1b archive checker, each per
family, including the Card 6 policy, boundary-domain, write-recipe, Storage
uint64, custody-matrix, writer, history and archive guard-case corpora) runs
once with the checker's observation recorder on. Calls are segmented at the
outermost model entry point. A segment whose records contain a refusal gives
the observation of its FIRST refusing phase as that row's negative; every
passing record gives a control of its phase. Records made outside any entry
point (oracle helpers) are their own segments. Nothing here repairs, caches or
decides a checker result; the tool's own report rows are the only credit.
"""
import contextlib
import copy
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import types

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402

MAINTENANCE = ('memory.dedup_sweep.completed', 'memory.dedup_sweep.started',
               'memory.index.lexical.rebuild.completed', 'memory.index.lexical.rebuild.started',
               'memory.index.semantic.rebuild.completed', 'memory.index.semantic.rebuild.started',
               'memory.verification_sweep.completed', 'memory.verification_sweep.started')
ARCHIVE = ('memory.monthly_summary.completed', 'memory.monthly_summary.started',
           'memory.prune_archive.completed', 'memory.prune_archive.started')
FAMILIES = MAINTENANCE + ARCHIVE
RETURN_SOURCE = 'return g.Case(table, check, context)'
CORE_ENTRIES = ('accept', 'accept_check', 'checkpoint_check', 'append_current', 'transition', 'read_history', 'read_canonical_history',
                'checkpoint_identity_matches', 'valid_operation', 'valid_target', 'valid_selector',
                'start_custody_gate', 'matrix_call')
ARCHIVE_ENTRIES = ('archive_candidate', 'archive_validate', 'cutoff_gate', 'transition',
                   'append_current', 'accept', 'read_history', 'probe')
POLICY_ENTRIES = ('dedup_candidate', 'dedup_validate', 'selection_require', 'instant')

# Lane-matrix sets that are two rows by construction, with the reason; each row of each set is
# also proved by its own single-row witnesses. Filled from the collection (see the report).
EXCLUDED = {}


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def key(value):
    return hashlib.sha256(json.dumps(tagged(value), separators=(',', ':')).encode()).hexdigest()


def tagged(x):
    t = type(x)
    if x is None or t in (bool, int, str):
        return [t.__name__, x]
    if t is float:
        return ['float', x.hex()]
    if t is dict:
        return ['dict', [[tagged(k), tagged(v)] for k, v in x.items()]]
    if t in (list, tuple):
        return [t.__name__, [tagged(v) for v in x]]
    return [t.__name__, str(x)]


def tool_safe(x):
    """The tool reconstructs exact builtin JSON-like data only; Decimal or Fraction observations fail closed."""
    t = type(x)
    if x is None or t in (bool, int, float, str):
        return True
    if t is list:
        return all(tool_safe(v) for v in x)
    if t is dict:
        return all(type(k) is str and tool_safe(v) for k, v in x.items())
    return False


class Collector:
    """Segments recorder output at the outermost wrapped entry point of one checker run."""

    def __init__(self):
        self.depth = 0
        self.segment = None
        self.family = None
        self.phases = {}
        self.calls = 0
        self.refused_calls = 0
        self.findings = []
        self.sequence = 0

    def slot(self, phase):
        return self.phases.setdefault(phase, {'controls': {}, 'negatives': {}})

    def close(self, entry, records):
        self.calls += 1
        self.sequence += 1
        label = f'{self.family}#{self.sequence}:{entry}'
        refused = [r for r in records if r[2] is not None]
        for phase, observed, refusal in records:
            if refusal is None:
                s = self.slot(phase)
                k = key(observed)
                if k not in s['controls']:
                    s['controls'][k] = {'id': f'control/{phase}/{len(s["controls"])}', 'value': observed,
                                        'families': set(), 'witnesses': []}
                s['controls'][k]['families'].add(self.family)
                if len(s['controls'][k]['witnesses']) < 3:
                    s['controls'][k]['witnesses'].append(label)
        if refused:
            self.refused_calls += 1
            phase, observed, (row, code) = refused[0]
            s = self.slot(phase)
            k = key([row, observed])
            if k not in s['negatives']:
                s['negatives'][k] = {'id': f'negative/{phase}/{row}/{len(s["negatives"])}', 'value': observed,
                                     'target': row, 'code': code, 'families': set(), 'witnesses': [], 'count': 0}
            n = s['negatives'][k]
            n['families'].add(self.family)
            n['count'] += 1
            if len(n['witnesses']) < 3:
                n['witnesses'].append(label)

    def wrap(self, module, name, label):
        original = getattr(module, name, None)
        if original is None or not callable(original) or getattr(original, '_dmem_segment', False):
            return
        collector = self

        def wrapped(*args, **kwargs):
            if collector.depth:
                return original(*args, **kwargs)
            collector.depth += 1
            records = collector.flush_outside()
            try:
                return original(*args, **kwargs)
            finally:
                collector.depth -= 1
                mine = collector.take()
                collector.close(label + '.' + name, mine)
                del records
        wrapped._dmem_segment = True
        wrapped.__name__ = getattr(original, '__name__', name)
        setattr(module, name, wrapped)

    # Recorder lists of every live core instance (maintenance module, archive custody instance).
    recorders = ()

    def flush_outside(self):
        """Records made outside an entry point before this one become their own segments."""
        for rec in self.recorders:
            outside = list(rec)
            rec.clear()
            for record in outside:
                self.close('outside:' + record[0], [record])
        return None

    def take(self):
        mine = []
        for rec in self.recorders:
            mine.extend(rec)
            rec.clear()
        return mine


def instrument(collector, core, top=None):
    core.RECORDER = []
    collector.recorders = tuple(collector.recorders) + (core.RECORDER,)
    raw_policy = core.memory_policy

    def memory_policy():
        policy = raw_policy()
        for n in POLICY_ENTRIES:
            collector.wrap(policy, n, 'policy')
        return policy
    core.memory_policy = memory_policy
    for n in CORE_ENTRIES:
        collector.wrap(core, n, 'core')
    if top is not None:
        for n in POLICY_ENTRIES:
            collector.wrap(top.POLICY, n, 'policy')
        for n in ARCHIVE_ENTRIES:
            collector.wrap(top, n, 'archive')


def run_main(module, family):
    argv = sys.argv
    sys.argv = ['checker', '--family', family]
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            module.main()
    finally:
        sys.argv = argv
    return json.loads(out.getvalue())


def collect(families=None):
    """Run each selected family's complete checker once under the recorder."""
    collector = Collector()
    wanted = [f for f in FAMILIES if families is None or f in families]
    maintenance = archive = None
    for family in wanted:
        if family in MAINTENANCE:
            if maintenance is None:
                maintenance = load(ROOT / 'scripts/pm_memory_maintenance_events.py', 'dmem_suite_maintenance')
                instrument(collector, maintenance)
            module = maintenance
        else:
            if archive is None:
                archive = load(ROOT / 'scripts/pm_memory_archive_events.py', 'dmem_suite_archive')
                instrument(collector, archive.core, archive)
            module = archive
        collector.family = family
        result = run_main(module, family)
        collector.flush_outside()
        if result.get('status') != 'pass':
            collector.findings.append({'kind': 'checker_failed', 'family': family})
    core = maintenance or archive.core
    return collector, core


def lane_matrix(core, phase, controls, negatives):
    """Uncapped direct check of every row on every case (the tool repeats it under certification)."""
    rows = core.table_rows(phase)
    problems = []
    for c in controls:
        failing = [n for n, p, ctx in rows if p(c['value'], ctx) is not None]
        if failing:
            problems.append({'case': c['id'], 'kind': 'control_refused', 'rows': failing})
    for n in negatives:
        failing = [name for name, p, ctx in rows if p(n['value'], ctx) is not None]
        if failing[:1] != [n['target']] or len(failing) != 1:
            problems.append({'case': n['id'], 'kind': 'not_single_row', 'target': n['target'], 'rows': failing})
    return problems


def select(core, phase, controls, negatives, per_row=5, max_controls=4):
    """Tool cases: per row up to per_row tool-safe negatives, families round-robin; up to max_controls controls."""
    chosen = []
    for row, _, _ in core.table_rows(phase):
        mine = [n for n in negatives if n['target'] == row and tool_safe(n['value'])]
        by_family = {}
        for n in mine:
            by_family.setdefault(sorted(n['families'])[0], []).append(n)
        order = []
        while len(order) < per_row and any(by_family.values()):
            for family in sorted(by_family):
                if by_family[family] and len(order) < per_row:
                    order.append(by_family[family].pop(0))
        chosen.extend(order)
    safe = [c for c in controls if tool_safe(c['value'])]
    picked, seen = [], set()
    for c in safe:
        family = sorted(c['families'])[0]
        if family not in seen and len(picked) < max_controls:
            picked.append(c)
            seen.add(family)
    for c in safe:
        if len(picked) >= max_controls:
            break
        if c not in picked:
            picked.append(c)
    return picked, chosen


def suite_for(core, phase, controls, negatives):
    if not controls:
        return None
    module = core.table_module(phase)
    first = controls[0]['id']
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], first,
                     'first refusal of a complete DMEM checker witness: ' + '; '.join(n['witnesses'][:2]))
          for n in negatives]
    path = f'scripts/pm_memory_table_{phase}.py'
    return g.Suite(f'DMEM {phase}', module.case, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
