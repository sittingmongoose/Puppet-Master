"""Method B guard tables for the DF (FileSafe) checkers, sweep part 2A.

Every product refusal of pm_filesafe_event_authority, pm_filesafe_event_contracts,
pm_filesafe_schema_graph and pm_filesafe_retention is one named row of one phase
table (scripts/pm_filesafe_table_<phase>.py, generated from the row spec in
scripts/pm-filesafe-table-generate.py). A checker derives the observation of the
phase it is about to evaluate (recomputed digests, decoded values, resolved
routes, presence) and refuses only through the rows returned here. Derivation
code never decides acceptance; when an observation depends on an earlier row,
that row sits in an earlier phase and the later phase is evaluated only when it
passes. The guard-table suite builder sets RECORDER; no checker path does.
"""
import ast
import copy
import importlib
from pathlib import Path

from pm_filesafe_table_index import PHASES

ROOT = Path(__file__).resolve().parents[1]
_ROWS = {}
_FIELDS = {}
# Set to a list only by scripts/pm_filesafe_guard_suites.py; never by a checker path.
RECORDER = None
# Protocol step marker the suite builder appends between steps of a recorded trace.
STEP = ('__step__', None, ())
# Entailed rows in tables of their own, evaluated immediately after their phase
# from the same observation, so the proved rows keep their tool credit.
FOLLOWERS = {
    'payload_jcs': ('payload_jcs_other',),
    'descriptor_jcs': ('descriptor_jcs_other',),
    'full_value_bytes': ('full_value_bytes_other',),
    'app_capture_scm_absent': ('app_capture_scm_absent_id',),
    'mat_capture_worktree': ('mat_capture_worktree_rest',),
}


def module(phase):
    if phase not in PHASES:
        raise KeyError('unknown DF guard-table phase ' + phase)
    return importlib.import_module('pm_filesafe_table_' + phase)


def rows(phase):
    """The phase's (row, predicate, context) list in declared table order."""
    entries = _ROWS.get(phase)
    if entries is None:
        case = module(phase).case(None)
        entries = _ROWS[phase] = [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]
    return entries


def fields(phase):
    names = _FIELDS.get(phase)
    if names is None:
        names = _FIELDS[phase] = module(phase).FIELDS
    return names


def refusals(phase, facts):
    """Every refusing row of one phase, in table order, as (row, code) pairs.

    The observation passed to the rows holds exactly the module's FIELDS.
    """
    observed = {k: facts[k] for k in fields(phase)}
    found = []
    for name, predicate, context in rows(phase):
        code = predicate(observed, context)
        if code is not None:
            found.append((name, code))
    if RECORDER is not None:
        RECORDER.append((phase, copy.deepcopy(observed), tuple(found)))
    for follower in FOLLOWERS.get(phase, ()):
        found += refusals(follower, facts)
    return found


def first(phase, facts):
    """The first refusing row's code, or None (first-refusal boundaries)."""
    found = refusals(phase, facts)
    return found[0][1] if found else None


def codes(phase, facts):
    """Distinct refusal codes of one phase in table order (accumulating boundaries)."""
    result = []
    for _, code in refusals(phase, facts):
        if code not in result:
            result.append(code)
    return result


def refused(phase, facts):
    return bool(refusals(phase, facts))


def table_order_errors():
    """Each factory's check() requires its rows in exactly the table order."""
    errors = []
    for phase in PHASES:
        source = Path(module(phase).__file__).read_text()
        tree = ast.parse(source)
        factory = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'case')
        check = next(n for n in factory.body if isinstance(n, ast.FunctionDef) and n.name == 'check')
        required = [c.args[0].value for c in ast.walk(check) if isinstance(c, ast.Call)
                    and ast.unparse(c.func) == 'table.require']
        if required != [name for name, _, _ in rows(phase)]:
            errors.append(phase)
    return errors
