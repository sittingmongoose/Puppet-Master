"""Goal oracle observation dispatch, following the W3 Method B adapters.

Derivation stays in the complete checker. Only the named table predicate
decides a refusal. A discovery run records rows; it never earns proof credit.
The runner supplies one complete-call segment, retaining the original input,
source location, result and independently copied store snapshot for witnesses.

C12-GH1 (2026-11-15): rows live in phase tables of at most eight rows
(scripts/pm_goal_phase_<id>.py). A phase groups rows that every complete call
evaluates together, so each call yields a complete observation vector for the
table; the gated tool is fed those real vectors, never a synthetic {name: bool}.
Legacy one-row tables (scripts/pm_goal_table_<id>.py) still dispatch for
manifests that name them. Every schema call observes every inventoried row of
its validator, on every call: a repeated outcome is never skipped, so a vector
is never partial. CUT disables decisions only; NO_CACHE makes the complete
checker re-execute instead of reusing a memoised result (restoration runs).
"""
import importlib
import inspect
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'pm_goal_table_'
PHASE_PREFIX = 'pm_goal_phase_'
COLLECTOR = None
ACTIVE = False
DISCOVERY = False
CUT = frozenset()
NO_CACHE = False
_ROWS = None
_PREDICATES = {}
_SITES = {}
_SCHEMAS = {}


def rows():
    global _ROWS
    if _ROWS is None:
        path = ROOT / 'scripts/pm_goal_guard_rows.json'
        _ROWS = json.loads(path.read_text()) if path.exists() else {}
    return _ROWS


def module_name(spec):
    return (PHASE_PREFIX if spec.get('phase') else PREFIX) + spec['table']


def predicates(spec):
    table = spec['table']
    if table not in _PREDICATES:
        module = importlib.import_module(module_name(spec))
        _PREDICATES[table] = {n: row.predicate for n, row in module.case(None).table.guards.items()}
    return _PREDICATES[table]


def decide(name, condition, *, site=None):
    holds = bool(condition)
    if not ACTIVE and COLLECTOR is None:
        # Standalone legacy suites retain their real predicate decisions.
        # Only the explicit shared runner earns gated-table credit.
        return None if holds else name
    if site is None:
        frame = inspect.currentframe().f_back.f_back
        key = (frame.f_code.co_filename, frame.f_lineno)
        if key not in _SITES:
            _SITES[key] = (str(Path(key[0]).relative_to(ROOT)), key[1])
        site = _SITES[key]
    if DISCOVERY:
        code = None if holds or name in CUT else name
    else:
        spec = rows().get(name)
        if spec is None and COLLECTOR is not None and getattr(COLLECTOR, 'replaying', False):
            # A cut replay may reach a real checker row that no uncut call
            # evaluates; decide it from its own condition and record it.
            COLLECTOR.replay_unknown_rows.add(name)
            code = None if holds or name in CUT else name
        else:
            if spec is None:
                raise KeyError(name)  # An uninventoried row is an error, never an implicit pass.
            predicate = predicates(spec)[name]
            # The phase predicate reads exactly its own observation field.
            code = None if name in CUT else predicate({name: holds}, None)
    if COLLECTOR is not None:
        COLLECTOR.observe(name, holds, site)
    return code


def schema(names, errors):
    key = (frozenset(names), frozenset(errors), CUT, DISCOVERY, ACTIVE)
    if key not in _SCHEMAS or NO_CACHE:
        decided = frozenset(name for name in sorted(names | errors)
            if decide(name, name not in errors) is not None)
        if not NO_CACHE:
            _SCHEMAS[key] = decided
        return set(decided)
    if COLLECTOR is not None:
        # A memoised outcome has identical pure row inputs; still observe every
        # row so the call's vector stays complete (C12-GH1: no partial vectors).
        frame = inspect.currentframe().f_back
        source = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
        for name in sorted(names | errors):
            COLLECTOR.observe(name, name not in errors, source)
    return set(_SCHEMAS[key])
