"""PNC-019 lane GC: complete-call recording and Method B dispatch for the Goal protocol oracles.

The DG-OWN-A (goal_run.stopped/blocked) and DG-OWN-B (goal.blocked/completed)
suites refuse by exception at their first failed owner predicate. Under the GC
runner (`scripts/pm-goal-gc-guard-tables.py`) every predicate is a named row of
a generated phase table `scripts/pm_goal_gc_table_<phase>.py` and, once the
tables exist, is decided only by that table. Each top-level checker entry is
recorded as one complete call: its whole input (owner store plus request), the
ordered observations of every row it evaluated, its result, and for reads the
whole store before and after. Nothing here decides a refusal by itself.

Standalone (no recorder) the suites keep their original predicates exactly.
Harness assertions (test-body checks outside a complete call, and the
checkers' own `assert/...` output-shape self-checks) never become rows.
This module does not use pm_goal_guard_sweep.py or its tables. Native
execution stays NOT_RUN.
"""
from __future__ import annotations

import copy
import functools
import hashlib
import importlib
import inspect
import json
import pickle
import re
from dataclasses import asdict
from functools import lru_cache
from pathlib import Path

import jsonschema

import pm_event_numbers as numbers
import pm_goal_oracle_common as common
import pm_goal_retained as retained

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'pm_goal_gc_table_'
ROWS_PATH = ROOT / 'scripts/pm_goal_gc_rows.json'

RECORDER = None          # set only by the GC runner
CUT = frozenset()        # row codes whose table decision is suppressed (whole-checker cut)
GATED = False            # True once tables exist: decisions come only from table predicates
CASE = ['']
SCHEMA_CLAUSES: list = []
_TABLES = {}
_ROWS = None


# ---------------------------------------------------------------- shared validator with ECMA patterns

@lru_cache(maxsize=None)
def ecma_pattern(pattern):
    """JSON Schema `pattern` is an unanchored ECMA-262 search whose `$` matches
    only at the end of input. Python's `$` also matches before one final newline,
    so outside a character class it becomes `\\Z`. (The shared common's
    whole-string fullmatch inverts unanchored clauses such as the
    contains-a-control-character `not` clause; reported to GH1, not edited here.)"""
    out, index, in_class = [], 0, False
    while index < len(pattern):
        char = pattern[index]
        if char == '\\':
            out.append(pattern[index:index + 2]); index += 2; continue
        if in_class:
            if char == ']':
                in_class = False
        elif char == '[':
            in_class = True
            out.append(char); index += 1
            if pattern[index:index + 1] == '^':
                out.append('^'); index += 1
            if pattern[index:index + 1] == ']':
                out.append(']'); index += 1
            continue
        elif char == '$':
            out.append('\\Z'); index += 1; continue
        out.append(char); index += 1
    return re.compile(''.join(out))


def _ecma_pattern_keyword(validator, pattern, value, schema):
    if isinstance(value, str) and ecma_pattern(pattern).search(value) is None:
        yield jsonschema.ValidationError(f"{value!r} does not match {pattern!r}")


GCValidator = jsonschema.validators.extend(common.CurrentValidator,
                                           {'pattern': common._keyword_guard('pattern', _ecma_pattern_keyword)})


def validator(schema, registry):
    """Every owner keyword, owner formats, the shared date-time profiles (owned_properties), the CV-1100 current
    integer grammar (CurrentValidator) and ECMA pattern semantics."""
    return GCValidator(common.runtime_schema(schema), registry=registry, format_checker=common.FORMATS)


def clause_locations(errors):
    for error in errors:
        ident = getattr(error, 'oracle_guard', None)
        if ident in common._SCHEMA_LOCATIONS:
            yield common._SCHEMA_LOCATIONS[ident]
        yield from clause_locations(error.context)


SCHEMA_SEEDS = {}       # root -> accepted boundary instances (clause-coverage seeds; evidence, never credit)
SCHEMA_VALIDATORS = {}
ROOT_ROWS = {}          # root -> owner rows whose predicate is that whole definition


def root_row(root, code):
    if RECORDER is not None:
        ROOT_ROWS.setdefault(root, set()).add(RECORDER.source + ':' + code)


def caller_row(depth=3):
    """The require('<row>', valid(...)) code at the calling line (own-A's whole-definition rows)."""
    frame = inspect.currentframe()
    for _ in range(depth):
        frame = frame.f_back
    if frame.f_code.co_name == 'root_check':
        return frame.f_locals.get('name')
    import linecache
    for lineno in range(frame.f_lineno, max(frame.f_lineno - 4, 0), -1):  # a require may span lines
        match = re.search(r"require\('([^']+)'", linecache.getline(frame.f_code.co_filename, lineno))
        if match:
            return match.group(1)
    return None


def seed(root, v, value):
    if RECORDER is None or RECORDER.active is None:
        return
    SCHEMA_VALIDATORS.setdefault(root, v)
    slot = SCHEMA_SEEDS.setdefault(root, {})
    if len(slot) < 6:
        slot.setdefault(hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest(), copy.deepcopy(value))


def check_schema(v, value, root):
    if RECORDER is not None:
        code = caller_row()
        if code:
            root_row(root, code)
    errors = list(v.iter_errors(value))
    if errors and RECORDER is not None and RECORDER.active is not None:
        SCHEMA_CLAUSES.append((root, sorted(set(clause_locations(errors)))))
    elif not errors:
        seed(root, v, value)
    return not errors


# ---------------------------------------------------------------- rows and table dispatch

def rows():
    global _ROWS
    if _ROWS is None:
        _ROWS = json.loads(ROWS_PATH.read_text()) if ROWS_PATH.exists() else {}
    return _ROWS


def reset_tables():
    global _ROWS
    _ROWS = None
    _TABLES.clear()


def row_key(source, code):
    """Rows are per checker: the same code in two checkers is two rows."""
    return source + ':' + code


def _predicate(key):
    spec = rows()[key]  # an uninventoried row in gated mode is an error, never an implicit pass
    table = spec['table']
    if table not in _TABLES:
        module = importlib.import_module(PREFIX + table)
        _TABLES[table] = {guard.invariant.subject.lstrip('/'): guard.predicate
                          for guard in module.case(None).table.guards.values()}
    return _TABLES[table][spec['field']], spec['field']


def _site():
    frame = inspect.currentframe().f_back.f_back.f_back
    return str(Path(frame.f_code.co_filename).relative_to(ROOT)) + ':' + str(frame.f_lineno)


def gated(code, condition):
    """Return the refusal code or None for one owner predicate."""
    holds = bool(condition)
    if code.startswith(('assert/', 'test/')) or RECORDER is None or RECORDER.active is None:
        return None if holds else code
    key = row_key(RECORDER.source, code)
    RECORDER.active.append((key, holds, _site()))
    if key in CUT:
        return None
    if GATED:
        predicate, field = _predicate(key)
        refusal = predicate({field: holds}, None)
        if refusal is not None and refusal != code:
            raise ValueError('table refusal code differs from the checker row: ' + key)
        return refusal
    return None if holds else code


# ---------------------------------------------------------------- complete calls

def sync(original, new):
    """Copy a complete call's resulting store back without breaking aliases the
    test body holds into it (the call ran on an isolated deep copy)."""
    if isinstance(original, dict) and isinstance(new, dict):
        for key in [k for k in original if k not in new]:
            del original[key]
        for key, value in new.items():
            if key in original and type(original[key]) is type(value) and isinstance(value, (dict, list)):
                sync(original[key], value)
            else:
                original[key] = value
    elif isinstance(original, list) and isinstance(new, list) and len(original) == len(new):
        for index, value in enumerate(new):
            if type(original[index]) is type(value) and isinstance(value, (dict, list)):
                sync(original[index], value)
            else:
                original[index] = value
    elif isinstance(original, list) and isinstance(new, list):
        original[:] = new
    else:
        raise TypeError('cannot synchronize ' + type(original).__name__)


def store_digest(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


class Recorder:
    """One record per top-level complete call; replay re-runs it from its sealed input."""

    def __init__(self, source):
        self.source = source
        self.calls = []
        self.cases = []
        self.active = None
        self._case_start = 0

    def begin_case(self, name):
        CASE[0] = name
        self._case_start = len(self.calls)

    def end_case(self, name, expected, got):
        self.cases.append(dict(name=name, expected=expected, got=got, calls=list(range(self._case_start, len(self.calls)))))

    def execute(self, call, value, cut=frozenset()):
        global CUT
        observations = []
        previous, self.active, CUT = self.active, observations, frozenset(cut)
        del SCHEMA_CLAUSES[:]
        try:
            outcome = call['evaluate'](value)
        except Exception as exc:  # noqa: BLE001 - an unexpected error is recorded, never a refusal or a kill
            outcome = dict(kind='exception', exception=type(exc).__name__, detail=str(exc)[:300])
        finally:
            self.active, CUT = previous, frozenset()
        outcome['observations'] = observations
        outcome['schema_clauses'] = [list(x) for x in SCHEMA_CLAUSES]
        return outcome

    def replay(self, call, cut=frozenset()):
        return self.execute(call, pickle.loads(call['input_pickle']), cut)


def begin_case(name):
    CASE[0] = name
    if RECORDER is not None:
        RECORDER.begin_case(name)


def end_case(name, expected, got):
    """The suite's authored expectation for one case: the declared target, never the observed error."""
    if RECORDER is not None:
        RECORDER.end_case(name, expected, got)


def complete_entry(fn, prefix, refusal_type, *, store=None, halt=None, state=None, restore=None, is_read=None):
    """Record each top-level call of `fn` as one complete checker call.

    `store(args)` is the owner store a read must leave unchanged; `halt(result)`
    maps a consumer halt result to its refusal code; `state(obj)`/`restore(data)`
    turn a stateful receiver into data so the whole input is a value.
    """
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        rec = RECORDER
        if rec is None or rec.active is not None:
            return fn(*args, **kwargs)
        if state is not None:
            value = dict(state=state(args[0]), args=list(args[1:]), kwargs=dict(kwargs))
        else:
            value = dict(state=None, args=list(args), kwargs=dict(kwargs))

        def evaluate(value):
            call_args = ([restore(value['state'])] if restore is not None else []) + list(value['args'])
            before = store_digest(store(call_args)) if store else None
            try:
                out = fn(*call_args, **value['kwargs'])
                refusal = halt(out) if halt is not None else None
                kind = 'halt' if refusal is not None else 'accepted'
            except refusal_type as exc:
                out, refusal, kind = None, str(exc), 'refused'
            result = dict(kind=kind, refusal=refusal, out=out, args=call_args, kwargs=value['kwargs'])
            if store:
                result.update(store_before=before, store_after=store_digest(store(call_args)))
            return result

        sealed = pickle.dumps(value, protocol=5)
        read = store is not None and (is_read is None or is_read(list(args)))
        call = dict(label=f'{prefix}/{CASE[0]}/{fn.__name__}/{len(rec.calls)}', case=CASE[0], entry=fn.__name__,
                    evaluate=evaluate, input_pickle=sealed, input_sha256=hashlib.sha256(sealed).hexdigest(), read=read)
        outcome = rec.execute(call, pickle.loads(sealed))
        call['outcome'] = {k: v for k, v in outcome.items() if k not in ('out', 'args', 'kwargs')}
        if read:
            call['store_pickle'] = pickle.dumps(store([restore(pickle.loads(sealed)['state'])] + value['args'] if restore else value['args']), protocol=5)
        rec.calls.append(call)
        if outcome['kind'] == 'exception':
            return fn(*args, **kwargs)  # raise the unexpected exception at its own site
        new_args = outcome['args']
        if state is not None:
            receiver = args[0]
            if new_args[0] is not receiver:
                receiver.__dict__.clear()
                receiver.__dict__.update(new_args[0].__dict__)
            pairs = zip(args[1:], new_args[1:])
        else:
            pairs = zip(args, new_args)
        for original, new in pairs:
            if isinstance(original, (dict, list)):
                sync(original, new)
        for key, new in outcome['kwargs'].items():
            if isinstance(kwargs.get(key), (dict, list)):
                sync(kwargs[key], new)
        if outcome['kind'] == 'refused':
            raise refusal_type(outcome['refusal'])
        return outcome['out']
    return wrapper


# ---------------------------------------------------------------- sealed original receipts (SP-1101 composition)

def recipe_for(event, payload_resource):
    """TEST_ONLY installed recipe: the envelope and the exact payload resource bytes."""
    resources = (ROOT / 'Plans/event_record.schema.json').read_bytes()
    if payload_resource is not None:
        resources += (ROOT / payload_resource).read_bytes()
    version = event['payload_schema_id'].rsplit('.v', 1)[-1]
    return numbers.RecipeTuple(
        event['schema_id'], event['schema_version'], event['payload_schema_id'],
        version + '.0.0' if version.isdigit() else 'unversioned', event['event_type'], 'conditional-original',
        'original-receipt-checkpoint', 'original-identity', 'CV-339/RFC8785', numbers.EVENT_VALUE,
        'SP-286/original-full-value-v1', 'event_record', 'owner-schema', hashlib.sha256(resources).hexdigest())


def issue(event, storage, receipt, payload_resource):
    """Writer-side issuance at append; reads never call this."""
    original = numbers.OriginalCustody(retained.binding(event, storage), recipe_for(event, payload_resource),
                                       numbers.storage_value_bytes(event), numbers.qualified_jcs(receipt),
                                       numbers.qualified_jcs(receipt))
    return dict(original=asdict(original), seal=retained.seal(original)), asdict(original.recipe)


RETAINED_REASONS = ('original_receipt_missing', 'original_receipt_ambiguous', 'original_receipt_seal',
                    'original_receipt_shape', 'original_binding', 'recipe_unknown', 'original_verification',
                    'caller_recipe_override', 'current_disclosure', 'recipe_catalog')


def retained_reason(snapshot, event, storage, *, recipe_override=None):
    """Exact receipt-selected read; returns None or the dispatcher's refusal."""
    try:
        retained.resolve(snapshot, event, storage, recipe_override=recipe_override)
        return None
    except numbers.Refusal as refusal:
        if refusal.reason not in RETAINED_REASONS:
            raise ValueError('unexpected retained refusal: ' + refusal.reason)
        return refusal.reason


def representable(event):
    """CV-1100: the producer RFC8785 projection and the physical full value."""
    try:
        numbers.producer_semantic_bytes(event)
    except numbers.Refusal:
        return 'producer'
    try:
        numbers.storage_value_bytes(event)
    except numbers.Refusal:
        return 'storage'
    return None
