"""DG6A guard-table dispatch for the complete checkers (sweep part 2A, Method B).

Every refusal of a generated phase table (scripts/pm_dg6a_table_<phase>.py,
written by scripts/pm-dg6a-table-generate.py) is decided only by that table's
rows, evaluated in declared table order over an observation holding exactly
the table's FIELDS. Checkers derive observations (recomputed digests,
identities and sizes, typed joins, presence) and decide nothing themselves.

`first` is for an early-return chain (at most one refusal); `every` is for a
collect-all site whose pre-table code appended one error per failed check.
RECORDER is set only by the unscanned witness runner
(scripts/pm-dg6a-guard-tables.py); it receives (phase, observed, refusals).
No table module imports this file, so the guard tool scans only the table.
"""
import copy
import importlib

PREFIX = 'pm_dg6a_table_'
RECORDER = None
_ROWS = {}
_FIELDS = {}


def rows(phase):
    """The phase's (row, predicate) list in declared table order."""
    entries = _ROWS.get(phase)
    if entries is None:
        module = importlib.import_module(PREFIX + phase)
        case = module.case(None)
        entries = _ROWS[phase] = [(name, guard.predicate) for name, guard in case.table.guards.items()]
        _FIELDS[phase] = module.FIELDS
    return entries


def observation(phase, facts):
    rows(phase)
    fields = _FIELDS[phase]
    if set(facts) != set(fields):
        raise KeyError(('observation fields', phase, sorted(set(facts) ^ set(fields))))
    return {k: facts[k] for k in fields}


def _record(phase, observed, refusals):
    if RECORDER is not None:
        RECORDER.append((phase, copy.deepcopy(observed), list(refusals)))


def first(phase, **facts):
    """First refusing row's code (early-return chain), or None."""
    observed = observation(phase, facts)
    refusal = None
    for name, predicate in rows(phase):
        code = predicate(observed, None)
        if code is not None:
            refusal = (name, code)
            break
    _record(phase, observed, [refusal] if refusal else [])
    return refusal[1] if refusal else None


def every(phase, **facts):
    """Every refusing row's code in table order (collect-all site)."""
    observed = observation(phase, facts)
    refusals = []
    for name, predicate in rows(phase):
        code = predicate(observed, None)
        if code is not None:
            refusals.append((name, code))
    _record(phase, observed, refusals)
    return [code for _, code in refusals]


def fields(phase):
    """The table's FIELDS (for per-field rows whose facts the checker derives in a loop)."""
    rows(phase)
    return _FIELDS[phase]
