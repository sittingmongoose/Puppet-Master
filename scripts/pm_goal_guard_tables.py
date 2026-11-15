"""Goal oracle observation dispatch, following the W3 Method B adapters.

Derivation stays in the complete checker. Only the named table predicate
decides a refusal. A discovery run records rows; it never earns proof credit.
The runner supplies one complete-call segment, retaining the original input,
source location, result and independently copied store snapshot for witnesses.
"""
import importlib
import inspect
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'pm_goal_table_'
COLLECTOR = None
DISCOVERY = False
CUT = frozenset()
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


def decide(name, condition, *, site=None):
    holds = bool(condition)
    if site is None:
        frame = inspect.currentframe().f_back.f_back
        key = (frame.f_code.co_filename, frame.f_lineno)
        if key not in _SITES:
            _SITES[key] = (str(Path(key[0]).relative_to(ROOT)), key[1])
        site = _SITES[key]
    if DISCOVERY:
        code = None if holds or name in CUT else name
    else:
        spec = rows()[name]  # An uninventoried row is an error, never an implicit pass.
        if spec['table'] not in _PREDICATES:
            module = importlib.import_module(PREFIX + spec['table'])
            _PREDICATES[spec['table']] = {n: row.predicate for n, row in module.case(None).table.guards.items()}
        predicate = _PREDICATES[spec['table']][name]
        code = None if name in CUT else predicate({name: holds}, None)
    if COLLECTOR is not None:
        COLLECTOR.observe(name, holds, site)
    return code


def schema(names, errors):
    key = (frozenset(names), frozenset(errors), CUT, DISCOVERY)
    if key not in _SCHEMAS:
        _SCHEMAS[key] = frozenset(name for name in sorted(names | errors)
            if decide(name, name not in errors) is not None)
    elif COLLECTOR is not None:
        # Repeated schema outcomes have identical pure row inputs. Retain the
        # first complete positive witnesses and every refusal; never cache
        # across a cut, or turn a prior refusal into a positive observation.
        frame = inspect.currentframe().f_back
        source = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
        for name in sorted(names | errors):
            slot = COLLECTOR.rows.get(name)
            if name in errors or slot is None or len(slot['controls']) < 2:
                COLLECTOR.observe(name, name not in errors, source)
    return set(_SCHEMAS[key])
