"""Lane DS guard-table dispatch (Method B, scripts/pm_guard_isolation.py).

Every DS checker refusal is one named row of a generated phase table
(scripts/pm_ds_table_<phase>.py, from the row spec in scripts/pm-ds-table-generate.py).
A checker derives one boolean observation per row from its complete input
(``True`` when the row's invariant holds) and then asks the table which rows
refuse. Derivation never decides a result: the only refusals a checker returns
are the codes of the table rows that refuse, in table order.

Two evaluation forms keep each checker's original result exactly:

* ``Facts(phase)``: every row is observed and every refusing row is reported
  (the checkers that return a list of every failure).
* ``Facts(phase, chain=True)`` with ``stop(row, thunk)``: rows are observed in
  table order, each only while every earlier row holds (the checkers that
  return at their first failure). ``stop`` records the row and returns True
  exactly when the table then refuses; the caller returns that refusal. Rows
  after the first refusing row, and rows of a branch the original check never
  reaches on this input, are recorded as holding without being evaluated.
  ``done()`` records an accepted observation (every row holds).

RECORDER is set only by the guard-table suite builder
(scripts/pm_ds_guard_suites.py). It records (phase, observation, refusing rows)
and never changes a result.
"""
from __future__ import annotations

import importlib

TABLE_PREFIX = 'pm_ds_table_'
RECORDER = None
_ROWS = {}


def table(phase):
    """(fields, [(row, predicate, code), ...]) of one phase table, in table order."""
    cached = _ROWS.get(phase)
    if cached is None:
        module = importlib.import_module(TABLE_PREFIX + phase)
        case = module.case(None)
        rows = [(name, guard.predicate, guard.refusal_code) for name, guard in case.table.guards.items()]
        cached = _ROWS[phase] = (tuple(module.FIELDS), rows, case.context)
    return cached


class Facts:
    """One observation of one phase table."""

    def __init__(self, phase, *, chain=False):
        self.phase = phase
        self.chain = chain
        self.values = {}
        self.broken = False
        self._result = None

    def __setitem__(self, row, holds):
        if self.chain:
            raise TypeError('chain observations use hold()')
        self._set(row, holds)

    def _set(self, row, holds):
        if type(holds) is not bool:
            raise TypeError(f'{self.phase}/{row}: an observation is an exact bool, not {type(holds).__name__}')
        if row in self.values:
            raise KeyError(f'{self.phase}/{row} observed twice')
        fields = table(self.phase)[0]
        if row not in fields:
            raise KeyError(f'{self.phase}/{row} is not a row of its table')
        if self.chain:
            index = fields.index(row)
            last = max((fields.index(r) for r in self.values), default=-1)
            if index <= last:
                raise KeyError(f'{self.phase}: chain row {row} observed out of table order')
            for skipped in fields[last + 1:index]:
                self.values[skipped] = True  # a branch this input never reaches
        self.values[row] = holds

    def stop(self, row, thunk):
        """Chain form: observe one row; True exactly when the table then refuses."""
        if not self.chain:
            raise TypeError('stop() is for chain observations')
        if self.broken or self._result is not None:
            raise RuntimeError(f'{self.phase}/{row}: observed after the chain ended')
        holds = thunk()
        if type(holds) is not bool:
            raise TypeError(f'{self.phase}/{row}: an observation is an exact bool, not {type(holds).__name__}')
        self._set(row, holds)
        if holds:
            return False
        self.broken = True
        return bool(self.refusing())

    def done(self):
        """Chain form: record the observation with every remaining row holding; first code or None."""
        return self.first_code()

    def refusing(self):
        """Every refusing row as (row, code), in table order; recorded once."""
        if self._result is not None:
            return self._result
        fields, rows, context = table(self.phase)
        if self.chain:
            for row in fields[len(self.values):]:
                self._set(row, True)
        if set(self.values) != set(fields):
            missing = sorted(set(fields) - set(self.values))
            raise KeyError(f'{self.phase}: rows not observed: {missing}')
        observed = {field: self.values[field] for field in fields}
        result = []
        for name, predicate, _ in rows:
            code = predicate(observed, context)
            if code is not None:
                result.append((name, code))
        self._result = result
        if RECORDER is not None:
            RECORDER.append((self.phase, dict(observed), [name for name, _ in result]))
        return result

    def codes(self):
        """Codes of the refusing rows, each once, in table order."""
        out = []
        for _, code in self.refusing():
            if code not in out:
                out.append(code)
        return out

    def rows(self):
        return [name for name, _ in self.refusing()]

    def first(self):
        """The first refusing (row, code), or None."""
        refused = self.refusing()
        return refused[0] if refused else None

    def first_code(self):
        refused = self.refusing()
        return refused[0][1] if refused else None
