"""C12-GO whole-definition schema rows and their root registry (for the clause closure).

A whole-definition row is the shared owner validator over the complete owner
definition with every keyword kept (owner formats, shared date-time profiles,
CV-1100 current integers where the boundary is current, ECMA patterns). The
row refuses through the gated phase table like any checker row. Each root the
GO complete calls validate is recorded with the exact validator object and the
accepted instances it saw, so scripts/pm_goal_go_schema_closure.py can close
every reachable assertion clause of that root (lane GC's standard).
"""
import copy
import hashlib
import inspect
import pickle
from pathlib import Path

import pm_goal_oracle_common as c

ROOT = Path(__file__).resolve().parents[1]
SEED_CAP = 8
ROOTS = {}
# Seeds come only from complete calls declared valid (controls); pm_goal_go_sweep.install sets this
# around every invoke, so negatives, transfers and search edits never add a seed.
CONTROL = [False]
# ROOTS: root id -> dict(validator, seeds{sha: value}, rows set, sites set, kind)


def record(root, v, value, *, row=None, site=None, kind='go'):
    slot = ROOTS.setdefault(root, dict(validator=v, seeds={}, rows=set(), sites=set(), kind=kind))
    if row:
        slot['rows'].add(row)
    if site:
        slot['sites'].add(site)
    if value is not None and CONTROL[0] and len(slot['seeds']) < SEED_CAP:
        try:
            key = hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()
        except Exception:  # an unpicklable instance is never a seed
            return
        slot['seeds'].setdefault(key, copy.deepcopy(value))


def row_name(path, pointer):
    return 'complete/owner_schema/' + str(Path(path).relative_to(ROOT)) + pointer


def checker(path, pointer, registry, *, current=True, row=None, schema=None):
    """One whole-definition owner row; `row` defaults to the s3ao row name."""
    document = schema if schema is not None else c.load(path)
    target = {'$ref': document['$id'] + pointer} if schema is None else document
    v = c.validator(target, registry, current=current)
    name = row or row_name(path, pointer)
    root = 'go:' + name

    def check(value):
        gates = c.Gates()
        holds = v.is_valid(value)
        gates.require(name, holds)
        record(root, v, value if holds else None, row=name)
        return gates.errors
    check.row = name
    check.validator = v
    check.root = root
    record(root, v, None, row=name)
    return check


def install_frozen_hooks(frozen):
    """Record every frozen Schema validator (restore_point.deleted and the run.started
    adoption dependency) with the accepted instances its complete calls validate.
    Observation only: the decision path (tables.decide over is_valid) is unchanged."""
    if getattr(frozen.Schema, '_go_hooked', False):
        return
    original_validate = frozen.Schema.validate
    original_is_valid = frozen.Schema.is_valid

    def root_of(schema_object):
        return 'frozen:' + frozen.frozen_fingerprint(schema_object.original.schema)

    def validate(self, value):
        holds = False
        try:
            result = original_validate(self, value)
            holds = True
            return result
        finally:
            name = 'restore_point.deleted/original/schema/' + frozen.frozen_fingerprint(self.original.schema)
            record(root_of(self), self.validator, value if holds else None, row=name, kind='frozen')

    def is_valid(self, value):
        holds = original_is_valid(self, value)
        frame = inspect.currentframe().f_back
        record(root_of(self), self.validator, value if holds else None,
               site=(frame.f_code.co_filename, frame.f_lineno), kind='frozen')
        return holds

    frozen.Schema.validate = validate
    frozen.Schema.is_valid = is_valid
    frozen.Schema._go_hooked = True


def summary():
    return {root: dict(rows=sorted(slot['rows']), sites=sorted(map(list, slot['sites'])), seeds=len(slot['seeds']),
                       kind=slot['kind'], schema_id=(slot['validator'].schema or {}).get('$id')
                       if isinstance(slot['validator'].schema, dict) else None)
            for root, slot in sorted(ROOTS.items())}
