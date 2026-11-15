#!/usr/bin/env python3
"""DG6A-only C12 closure: whole-definition Method B clause witnesses at the real checker calls.

Scope (PNC-019 C12-DG6A). This adapter runs each exact family's unchanged complete
checker main() (pm-alert-/pm-panel-/pm-concern-created-/pm-card5-event-contracts-check.py)
and observes every schema evaluation it makes through the lane validator
(scripts/pm-dg6a-domain.py ExactSchemaValidator: CV-1100 exact integers, CV-1101
EventRecord date-time, lane uuid) together with the guard-table row that consumes it
(scripts/pm_dg6a_tables.py `first`/`every`). It does not replace a schema, add an
acceptance predicate, or credit a non-targeting mutation.

For every evaluated (schema node, keyword, instance location) that a control accepts,
finite proposals change only that instance leaf. A proposal earns KILLED_EXPECTED only
when the complete original definition reports exactly that clause at exactly that
location, the consuming phase's actual row returns its exact code, the in-memory cut
of that one clause (and, separately, of the whole-definition row) behaves as recorded,
and restoration refuses again with the control still accepted. When the call came from
a module-level checker function, the mutant is also replayed through that unchanged
function and must refuse first at the same row (boundary_first_refusal); a replay that
refuses elsewhere first earns no boundary credit. Everything else is INVALID with a
reason. Applicators and selectors receive no invented scalar credit. Clause cuts never
touch the owner files: the lane validator composes its own copy of every schema.

Evidence belongs outside the repository; run in the lane's capped long-job.
"""
from __future__ import annotations

import argparse
import contextlib
import copy
import gc
import hashlib
import importlib.util
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dg6a_tables as tables  # noqa: E402
from pm_event_datetime import EVENT_RECORD, date_time  # noqa: E402
from pm_event_numbers import Refusal  # noqa: E402

ALERT = ('alert.acknowledged', 'alert.dismissed', 'alert.rule_muted', 'alert.snoozed')
PANEL = ('panel.redocked', 'panel.undocked')
CONCERN = ('concern.created',)
CARD5 = ('bundle.annotation_state_changed', 'bundle.note_created', 'bundle.note_status_changed',
         'concern.assigned', 'concern.evidence_linked', 'concern.promoted', 'concern.reopened',
         'concern.resolved', 'concern.updated')
FAMILIES = ALERT + PANEL + CONCERN + CARD5
SCRIPT = {**{f: 'pm-alert-event-contracts-check.py' for f in ALERT},
          **{f: 'pm-panel-event-contracts-check.py' for f in PANEL},
          **{f: 'pm-concern-created-contracts-check.py' for f in CONCERN},
          **{f: 'pm-card5-event-contracts-check.py' for f in CARD5}}
CHECKER_FILES = {str(ROOT / 'scripts' / name) for name in set(SCRIPT.values())}
# Schema facts the checkers hand to a guard row: (fact, kind). `count` facts are
# len(errors); `valid` facts are `not errors`.
SCHEMA_FACTS = (('schema_errors', 'count'), ('payload_schema_valid', 'valid'), ('stored_valid', 'valid'))
APPLICATORS = frozenset(('$ref', '$dynamicRef', 'properties', 'patternProperties', 'items', 'prefixItems',
                         'allOf', 'anyOf', 'oneOf', 'if', 'then', 'else', 'dependentSchemas', 'not',
                         'contains', 'additionalItems', 'unevaluatedItems', 'unevaluatedProperties',
                         'propertyNames'))


# ------------------------------------------------------------------ small exact helpers
@contextlib.contextmanager
def exact_text():
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        yield
    finally:
        sys.set_int_max_str_digits(previous)


def _default(value):
    if isinstance(value, (set, frozenset)):
        return sorted(value)
    return repr(value)


def _keys(value):
    if type(value) is dict and any(type(k) is not str for k in value):
        return {repr(k): _keys(v) for k, v in value.items()}
    if type(value) is dict:
        return {k: _keys(v) for k, v in value.items()}
    if type(value) in (list, tuple):
        return [_keys(v) for v in value]
    return value


def digest(value):
    with exact_text():
        try:
            raw = json.dumps(value, sort_keys=True, ensure_ascii=True, default=_default).encode()
        except TypeError:
            raw = json.dumps(_keys(value), sort_keys=True, ensure_ascii=True, default=_default).encode()
    return hashlib.sha256(raw).hexdigest()


def write(path, value):
    with exact_text():
        path.write_text(json.dumps(value, indent=1, sort_keys=True, default=_default) + '\n')


def pointer(path):
    return '/' + '/'.join(str(x).replace('~', '~0').replace('/', '~1') for x in path) if path else ''


def walk(value, path=()):
    yield path, value
    if isinstance(value, dict):
        for k, v in value.items():
            yield from walk(v, path + (k,))
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from walk(v, path + (i,))


def at(value, path):
    for k in path:
        value = value[k]
    return value


def replaced(value, path, replacement):
    if not path:
        return copy.deepcopy(replacement)
    value = copy.deepcopy(value)
    at(value, path[:-1])[path[-1]] = copy.deepcopy(replacement)
    return value


def leaves(found):
    for error in found:
        yield error
        yield from leaves(error.context)


def sha256_file(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


# ------------------------------------------------------------------ owner schema sources
def owner_sources():
    """Every DG6A owner schema document, by $id: (repository path, JSON pointer prefix).

    The registry mirror rows of Plans/storage_value_registry.json are separate copies;
    their equality join is proved in --mode copies, not here.
    """
    found = {}
    globs = ('Plans/alert_event_contracts/*.schema.json', 'Plans/panel_event_contracts/*.schema.json',
             'Plans/concern_created_contracts/*.schema.json', 'Plans/card5_event_contracts/*.schema.json',
             'Plans/event_payloads/**/*.schema.json')
    for pattern in globs:
        for path in sorted(ROOT.glob(pattern)):
            try:
                doc = json.loads(path.read_text())
            except ValueError:
                continue
            if isinstance(doc, dict) and isinstance(doc.get('$id'), str):
                found.setdefault(doc['$id'], (str(path.relative_to(ROOT)), doc))
    constraints = json.loads((ROOT / 'Plans/dg6a_checkpoint_source_constraints.json').read_text())
    return found, constraints


SOURCES, CONSTRAINTS = owner_sources()


def owner_location(root, schema_pointer_path, keyword):
    """Map a node of the lane's composed copy to the owner bytes it came from.

    The composition removes nested `$schema` keys and replaces the checkpoint
    index_read_token selector with the preserved source-constraint profile
    (pm-dg6a-domain.py checkpoint_source_constraints). Both are reported exactly.
    """
    rid = root.get('$id') if isinstance(root, dict) else None
    source = SOURCES.get(rid)
    if source is None:
        located = subschema_source(root)
        if located is None:
            return dict(owner='UNMAPPED', root_id=rid, pointer=pointer(schema_pointer_path), match=False)
        (path, doc), prefix = located
        full = composed_owner(path, doc)
        result = owner_location_in(path, doc, full, tuple(prefix) + tuple(schema_pointer_path), keyword)
        result['subschema_root'] = pointer(prefix)
        return result
    path, doc = source
    return owner_location_in(path, doc, root, schema_pointer_path, keyword)


_SUBSCHEMA = {}


def subschema_source(root):
    """A root without $id (a field node validated on its own): find the owner node it equals."""
    key = digest(root)
    if key not in _SUBSCHEMA:
        _SUBSCHEMA[key] = None
        for source in SOURCES.values():
            for path, node in walk(composed_owner(*source)):
                if isinstance(node, dict) and path and node == root:
                    _SUBSCHEMA[key] = (source, path)
                    break
            if _SUBSCHEMA[key]:
                break
    return _SUBSCHEMA[key]


def owner_location_in(path, doc, root, schema_pointer_path, keyword):
    strict = CONSTRAINTS['source_constraint_schema']
    for i in range(len(schema_pointer_path)):
        if schema_pointer_path[i] == 'index_read_token' and i and schema_pointer_path[i - 1] == 'properties':
            try:
                node = at(root, schema_pointer_path[:i + 1])
            except (KeyError, IndexError, TypeError):
                break
            if node == {k: v for k, v in strict.items() if k != '$schema'} or node == strict:
                rest = schema_pointer_path[i + 1:]
                try:
                    match = at(strict, rest).get(keyword) == at(root, schema_pointer_path).get(keyword)
                except (KeyError, IndexError, TypeError, AttributeError):
                    match = False
                return dict(owner='Plans/dg6a_checkpoint_source_constraints.json',
                            pointer='/source_constraint_schema' + pointer(rest), match=match,
                            composed_from=path + '#' + pointer(schema_pointer_path[:i + 1]))
    try:
        node = at(doc, schema_pointer_path)
        raw = isinstance(node, dict) and keyword in node and node[keyword] == at(root, schema_pointer_path)[keyword]
        composed = at(composed_owner(path, doc), schema_pointer_path)
        match = isinstance(composed, dict) and keyword in composed and composed[keyword] == at(root, schema_pointer_path)[keyword]
    except (KeyError, IndexError, TypeError):
        raw = match = False
    return dict(owner=path, pointer=pointer(schema_pointer_path), match=match, raw_bytes_match=raw)


_DOMAIN = None
_COMPOSED = {}


def strip_schema(node):
    if type(node) is dict:
        return {k: strip_schema(v) for k, v in node.items() if k != '$schema'}
    if type(node) is list:
        return [strip_schema(v) for v in node]
    return node


def composed_owner(path, doc):
    """The owner document as the unchanged lane validator composes it (pm-dg6a-domain.py validator())."""
    global _DOMAIN
    if _DOMAIN is None:
        spec = importlib.util.spec_from_file_location('dg6a_c12_domain', ROOT / 'scripts/pm-dg6a-domain.py')
        _DOMAIN = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_DOMAIN)
    key = (path, id(doc))
    if key not in _COMPOSED:
        _COMPOSED[key] = (doc, strip_schema(_DOMAIN.checkpoint_source_constraints(doc)))
    return _COMPOSED[key][1]


# ------------------------------------------------------------------ trace of the unchanged checker
class Trace:
    """Observe the unchanged lane validator and guard-table dispatch during one family main()."""

    def __init__(self):
        self.records = []          # unique (root, instance) schema controls with bindings
        self.by_key = {}
        self.calls = []            # every schema evaluation, in order (lightweight)
        self.recent = []           # unbound recent calls (index into self.calls)
        self.roots = {}            # root digest -> canonical ExactSchemaValidator
        self.root_index = {}       # root digest -> {id(node): pointer path}
        self.events = None
        self.path = ()
        self.patched = {}
        self.wrappers = []
        self.bindings = 0
        self.orphans = 0

    # --- class patching
    def _patch_validator_class(self, cls):
        if cls in self.patched:
            return
        old_validators = dict(cls.VALIDATORS)
        old_descend = cls.descend
        trace = self

        def descend(validator, instance, schema, path=None, *args, **kwargs):
            previous = trace.path
            if path is not None:
                trace.path = previous + (path,)
            try:
                yield from old_descend(validator, instance, schema, path, *args, **kwargs)
            finally:
                trace.path = previous

        def wrapped(keyword, original):
            def check(validator, constraint, instance, schema):
                current = trace.path
                found = list(original(validator, constraint, instance, schema) or ())
                if trace.events is not None:
                    trace.events.append((id(schema), keyword, current, len(found)))
                yield from found
            return check

        cls.descend = descend
        cls.VALIDATORS.update({k: wrapped(k, v) for k, v in old_validators.items()})
        self.patched[cls] = (old_validators, old_descend)

    def _wrap_esv(self, esv_cls):
        original = esv_cls.iter_errors
        trace = self

        def iter_errors(esv, instance):
            trace._patch_validator_class(type(esv._inner))
            outer_events, outer_path = trace.events, trace.path
            trace.events, trace.path = [], ()
            try:
                found = list(original(esv, instance))
                events = trace.events
            finally:
                trace.events, trace.path = outer_events, outer_path
            trace.note(esv, instance, events, found)
            return iter(found)

        esv_cls.iter_errors = iter_errors
        self.wrappers.append((esv_cls, original))

    def _wrap_tables(self):
        old_first, old_every = tables.first, tables.every
        trace = self

        def first(phase, **facts):
            trace.bind(phase, 'first', facts)
            return old_first(phase, **facts)

        def every(phase, **facts):
            trace.bind(phase, 'every', facts)
            return old_every(phase, **facts)

        tables.first, tables.every = first, every
        self.table_originals = (old_first, old_every)

    @contextlib.contextmanager
    def installed(self):
        self._wrap_tables()
        try:
            yield self
        finally:
            tables.first, tables.every = self.table_originals
            for cls, original in self.wrappers:
                cls.iter_errors = original
            for cls, (validators, descend) in self.patched.items():
                cls.VALIDATORS.clear()
                cls.VALIDATORS.update(validators)
                cls.descend = descend
            self.wrappers, self.patched = [], {}

    def hook_classes(self):
        hooked = {cls for cls, _ in self.wrappers}
        for obj in gc.get_objects():
            if isinstance(obj, type) and obj.__name__ == 'ExactSchemaValidator' and obj not in hooked \
                    and hasattr(obj, 'iter_errors') and obj.__module__ not in ('builtins',):
                self._wrap_esv(obj)
                hooked.add(obj)
        return len(hooked)

    # --- recording
    def _root_digest(self, esv):
        value = getattr(esv, '_c12_root', None)
        if value is None:
            value = digest(esv._inner.schema)
            esv._c12_root = value
            esv._c12_index = {id(node): path for path, node in walk(esv._inner.schema) if isinstance(node, dict)}
        if value not in self.roots:
            self.roots[value] = esv
            self.root_index[value] = esv._c12_index
        return value

    def _frame(self, instance):
        """The nearest unchanged checker function that consumes this evaluation through a guard table."""
        frame = sys._getframe(3)
        while frame is not None:
            code = frame.f_code
            if code.co_filename in CHECKER_FILES and 'tables' in code.co_names \
                    and ('first' in code.co_names or 'every' in code.co_names):
                break
            frame = frame.f_back
        if frame is None:
            return None
        code = frame.f_code
        function = frame.f_globals.get(code.co_name)
        info = dict(file=Path(code.co_filename).name, function=code.co_name, line=frame.f_lineno)
        if getattr(function, '__code__', None) is not code or not isinstance(instance, (dict, list)):
            return dict(info, replayable=False)
        args = [frame.f_locals.get(n) for n in code.co_varnames[:code.co_argcount]]
        for index, arg in enumerate(args):
            if isinstance(arg, (dict, list)):
                for path, node in walk(arg):
                    if node is instance:
                        return dict(info, replayable=True, function_object=function, arg_index=index,
                                    prefix=path, args=args)
        return dict(info, replayable=False)

    @staticmethod
    def _finalize(frame):
        if not frame or not frame.get('replayable'):
            return frame
        args = list(frame['args'])
        args[frame['arg_index']] = copy.deepcopy(args[frame['arg_index']])
        return dict(frame, args=args)

    def note(self, esv, instance, events, found):
        call = dict(errors=len(found), record=None, frame=None)
        self.calls.append(call)
        self.recent.append(len(self.calls) - 1)
        del self.recent[:-64]
        if found:
            return
        call['frame'] = self._frame(instance)
        root = self._root_digest(esv)
        try:
            key = (root, digest(instance))
        except (TypeError, ValueError):
            return
        index = self.by_key.get(key)
        if index is None:
            nodes = esv._c12_index
            translated = []
            for node_id, keyword, path, count in events:
                if node_id in nodes:
                    translated.append((nodes[node_id], keyword, path, count))
            record = dict(root=root, instance=copy.deepcopy(instance), events=translated, bindings=[],
                          caller={k: v for k, v in (call['frame'] or {}).items()
                                  if k in ('file', 'function', 'line')})
            index = len(self.records)
            self.records.append(record)
            self.by_key[key] = index
        call['record'] = index

    def bind(self, phase, mode, facts):
        if '__' in phase:
            return  # a bounded part, dispatched from its phase (pm_dg6a_phase_groups); the phase call bound it
        for fact, kind in SCHEMA_FACTS:
            if fact not in facts:
                continue
            want = facts[fact]
            for position in range(len(self.recent) - 1, -1, -1):
                call = self.calls[self.recent[position]]
                matches = (call['errors'] == want) if kind == 'count' else ((call['errors'] == 0) == (want is True))
                if matches:
                    del self.recent[position]
                    self.bindings += 1
                    accepted = (want == 0) if kind == 'count' else (want is True)
                    if call['record'] is not None and accepted:
                        passing = codes(phase, mode, facts) == []
                        record = self.records[call['record']]
                        key = (phase, mode, fact)
                        if passing and all((b['phase'], b['mode'], b['fact']) != key for b in record['bindings']):
                            record['bindings'].append(dict(phase=phase, mode=mode, fact=fact, kind=kind,
                                                           facts=copy.deepcopy(facts),
                                                           caller=self._finalize(call['frame'])))
                    break
            else:
                self.orphans += 1


def codes(phase, mode, facts, table_rows=None):
    """Actual row codes of one phase for the given facts (first: at most one)."""
    observed = tables.observation(phase, facts)
    found = []
    for name, predicate in (table_rows or tables.rows(phase)):
        code = predicate(observed, None)
        if code is not None:
            found.append((name, code))
            if mode == 'first':
                break
    return found


def load_checker(family):
    name = 'dg6a_c12_' + re.sub(r'\W', '_', family)
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / SCRIPT[family])
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def run_main(module, family):
    argv = sys.argv
    sys.argv = [SCRIPT[family], '--family', family]
    buffer = io.StringIO()
    try:
        with contextlib.redirect_stdout(buffer):
            try:
                module.main()
                code = 0
            except SystemExit as stop:
                code = stop.code or 0
    finally:
        sys.argv = argv
    text = buffer.getvalue().strip()
    status = dict(raw=text[-400:])
    for i in range(len(text) - 1, -1, -1):
        if text[i] == '{' and (i == 0 or text[i - 1] == '\n'):
            try:
                status = json.loads(text[i:])
                break
            except ValueError:
                continue
    return code, status


def observe(family):
    module = load_checker(family)
    trace = Trace()
    with trace.installed():
        hooked = trace.hook_classes()
        code, status = run_main(module, family)
    if code != 0 or status.get('status') != 'pass':
        raise AssertionError(('family checker did not pass under observation', family, code, status))
    return module, trace, dict(exit=code, status=status, validator_classes=hooked,
                               schema_calls=len(trace.calls), bindings=trace.bindings, orphans=trace.orphans)


# ------------------------------------------------------------------ proposals
def local_validator(esv, schema):
    return type(esv)(type(esv._inner)(schema, format_checker=esv._inner.format_checker))


DATE_TIME_PROPOSALS = (('invalid_calendar', '2026-02-30T12:00:00Z'), ('missing_zone', '2026-11-04T12:00:00'),
                       ('trailing_lf', '2026-11-04T12:00:00Z\n'), ('space_separator', '2026-11-04 12:00:00Z'),
                       ('hour_24', '2026-11-04T24:00:00Z'), ('bad_leap', '2026-06-30T23:59:60Z'))
UUID_PROPOSALS = (('not_uuid', 'not-a-uuid'), ('trailing_lf', '00000000-0000-4000-8000-000000000000\n'),
                  ('short', '0000000-0000-4000-8000-000000000000'))


def proposals(esv, keyword, node, value):
    """Finite DG6A clause probes at one instance leaf. Failed targeting earns no credit."""
    constraint = node[keyword]
    if keyword == 'required' and isinstance(value, dict):
        for key in constraint:
            if key in value:
                result = copy.deepcopy(value)
                del result[key]
                yield 'missing:' + key, result
    elif keyword == 'additionalProperties' and constraint is False and isinstance(value, dict):
        yield 'extra', {**value, '__c12_dg6a_unknown__': 1}
    elif keyword == 'type':
        probe = local_validator(esv, {'type': constraint})
        for result in (None, False, 0, 1.5, '', [], {}, 'x', 7):
            if not probe.is_valid(result):
                yield 'primitive_' + type(result).__name__, result
    elif keyword in ('const', 'enum'):
        probe = local_validator(esv, {keyword: constraint})
        original = value
        for result in (original + '_c12' if isinstance(original, str) else None, '__c12_dg6a_other__',
                       None, False, 2, 'x'):
            if not probe.is_valid(result):
                yield 'value', result
                break
    elif keyword in ('minimum', 'exclusiveMinimum') and type(constraint) is int:
        yield 'below', constraint - 1 if keyword == 'minimum' else constraint
    elif keyword in ('maximum', 'exclusiveMaximum') and type(constraint) is int:
        yield 'above', constraint + 1 if keyword == 'maximum' else constraint
    elif keyword == 'multipleOf':
        yield 'off_multiple', constraint + 1 if type(constraint) is int and constraint > 1 else 1
    elif keyword == 'minLength' and constraint > 0:
        yield 'short', (value if isinstance(value, str) else 'a')[:constraint - 1] if isinstance(value, str) \
            and len(value) >= constraint - 1 else 'a' * (constraint - 1)
    elif keyword == 'maxLength':
        base = value if isinstance(value, str) and value else 'a'
        yield 'long', (base * (constraint // len(base) + 2))[:constraint + 1]
    elif keyword == 'pattern':
        original = value if isinstance(value, str) else '00'
        width = max(len(original), node.get('minLength', 1))
        for tag, result in (('invalid_ascii', '!' * width), ('empty', ''), ('trailing_lf', original + '\n'),
                            ('leading_space', ' ' + original), ('upper', original.upper()),
                            ('newline', '\n'), ('truncated', original[:-1])):
            if node.get('maxLength') is not None and len(result) > node['maxLength']:
                continue
            if not re.search(constraint, result):
                yield tag, result
    elif keyword == 'format' and constraint == 'date-time':
        yield from DATE_TIME_PROPOSALS
    elif keyword == 'format' and constraint == 'uuid':
        yield from UUID_PROPOSALS
    elif keyword == 'minItems' and constraint > 0 and isinstance(value, list):
        yield 'short', value[:constraint - 1]
    elif keyword == 'maxItems' and isinstance(value, list):
        yield 'long', (value or [None]) * (constraint + 1)
    elif keyword == 'uniqueItems' and constraint and isinstance(value, list) and value:
        yield 'duplicate', value + [copy.deepcopy(value[0])]
    elif keyword == 'minProperties' and constraint > 0 and isinstance(value, dict):
        yield 'small', {}
    elif keyword == 'maxProperties' and isinstance(value, dict):
        yield 'large', {**value, **{f'__c12_{i}': None for i in range(constraint + 1)}}
    elif keyword == 'dependentRequired' and isinstance(value, dict):
        for trigger, needed in constraint.items():
            if trigger in value:
                for key in needed:
                    if key in value:
                        result = copy.deepcopy(value)
                        del result[key]
                        yield f'dependent:{trigger}:{key}', result


def expected_error(found, node, keyword, path):
    return any(e.schema is node and e.validator == keyword and tuple(e.absolute_path) == tuple(path)
               for e in leaves(found))


def fact_value(binding, found):
    return len(found) if binding['kind'] == 'count' else not found


def phase_codes(binding, found, table_rows=None):
    facts = dict(binding['facts'])
    facts[binding['fact']] = fact_value(binding, found)
    return codes(binding['phase'], binding['mode'], facts, table_rows)


def schema_row(binding):
    """The phase rows that read the schema fact (the consuming whole-definition rows)."""
    facts = dict(binding['facts'])
    facts[binding['fact']] = 1 if binding['kind'] == 'count' else False
    return [name for name, _ in codes(binding['phase'], 'every', facts)]


def replay(caller, mutant_instance):
    """Run the unchanged module-level checker function on the mutant; return the first refusal."""
    args = list(caller['args'])
    args[caller['arg_index']] = replaced(args[caller['arg_index']], caller['prefix'], mutant_instance) \
        if caller['prefix'] else copy.deepcopy(mutant_instance)
    recorder, tables.RECORDER = tables.RECORDER, []
    try:
        caller['function_object'](*args)
        outcome = 'returned'
    except Exception as error:  # an exception is never a kill
        outcome = 'EXCEPTION:' + type(error).__name__
    finally:
        recorded, tables.RECORDER = tables.RECORDER, recorder
    first = next(((phase, refusals) for phase, _, refusals in recorded if refusals), None)
    return outcome, first


# ------------------------------------------------------------------ schema coverage
def definition_inventory(root_digest, esv, label):
    """Every assertion reachable from the selected root through refs and branches."""
    from referencing import Resource
    from referencing.jsonschema import DRAFT202012
    result = []
    root = esv._inner.schema
    index = {id(node): path for path, node in walk(root) if isinstance(node, dict)}
    maps = ('properties', 'patternProperties', 'dependentSchemas')
    sequences = ('allOf', 'anyOf', 'oneOf', 'prefixItems')
    single = ('additionalProperties', 'unevaluatedProperties', 'items', 'unevaluatedItems', 'contains',
              'propertyNames', 'not', 'if', 'then', 'else')
    known = type(esv._inner).VALIDATORS

    def visit(node, resolver, route, active):
        if not isinstance(node, dict) or id(node) in active:
            return
        active = active | {id(node)}
        if '$id' in node:
            resolver = resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
        path = index.get(id(node))
        for keyword in node:
            if keyword in known:
                result.append(dict(phase=label, root=root_digest, pointer=pointer(path) if path is not None else None,
                                   route=route, keyword=keyword,
                                   owner=owner_location(root, path, keyword) if path is not None else None))
        for keyword in ('$ref', '$dynamicRef'):
            if keyword in node:
                resolved = resolver.lookup(node[keyword])
                visit(resolved.contents, resolved.resolver, route + '/' + keyword + ':' + node[keyword], active)
        for keyword in maps:
            for name, child in (node.get(keyword) or {}).items():
                visit(child, resolver, route + '/' + keyword + '/' + name, active)
        for keyword in sequences:
            for i, child in enumerate(node.get(keyword) or []):
                visit(child, resolver, route + '/' + keyword + '/' + str(i), active)
        for keyword in single:
            if keyword in node:
                visit(node[keyword], resolver, route + '/' + keyword, active)

    visit(root, esv._inner._resolver, '', set())
    return result


GENERIC_STRINGS = ('a', 'abc', 'a1', 'x', 'c12', '0', '1', 'A', 'ref:a', 'evt_a', 'a' * 8, '0' * 64, 'a' * 64,
                   'f' * 64, '0' * 40, '2026-11-04T12:00:00Z', '00000000-0000-4000-8000-000000000000')


def sub_valid(esv, node, value):
    with exact_text():
        return esv._inner.evolve(schema=node).is_valid(value)


def string_pool(records):
    pool = []
    for record in records:
        for _, node in walk(record['instance']):
            if type(node) is str and node not in pool and len(pool) < 4000:
                pool.append(node)
    return list(GENERIC_STRINGS) + pool


def sample(esv, node, pool, depth=0):
    """A value the selected owner node accepts (checked by the unchanged validator), or (False, None)."""
    if depth > 10:
        return False, None
    if node is True or node == {}:
        return True, 'c12'
    if not isinstance(node, dict):
        return False, None
    candidates = []
    if '$ref' in node:
        target = esv._inner._resolver.lookup(node['$ref']).contents
        ok, value = sample(esv, target, pool, depth + 1)
        if ok:
            candidates.append(value)
    if 'const' in node:
        candidates.append(copy.deepcopy(node['const']))
    if 'enum' in node:
        candidates.extend(copy.deepcopy(node['enum'][:3]))
    for keyword in ('allOf', 'anyOf', 'oneOf'):
        for branch in node.get(keyword) or []:
            ok, value = sample(esv, branch, pool, depth + 1)
            if ok:
                candidates.append(value)
    types = node.get('type')
    types = [types] if isinstance(types, str) else list(types or [])
    if not types and 'properties' in node:
        types = ['object']
    for kind in sorted(types, key=lambda t: t == 'null'):
        if kind == 'null':
            candidates.append(None)
        elif kind == 'boolean':
            candidates.extend([False, True])
        elif kind in ('integer', 'number'):
            low = node.get('minimum', node.get('exclusiveMinimum', -1) + 1)
            candidates.extend([low, low + 1])
        elif kind == 'string':
            fmt = node.get('format')
            for text in pool:
                if fmt == 'date-time' and text != '2026-11-04T12:00:00Z':
                    continue
                if fmt == 'uuid' and text != '00000000-0000-4000-8000-000000000000':
                    continue
                if len(text) < node.get('minLength', 0) or len(text) > node.get('maxLength', 10 ** 9):
                    continue
                if 'pattern' in node and not re.search(node['pattern'], text):
                    continue
                candidates.append(text)
                if len(candidates) > 6:
                    break
        elif kind == 'array':
            items = node.get('items', True)
            ok, value = sample(esv, items, pool, depth + 1)
            count = max(node.get('minItems', 0), 1)
            if node.get('maxItems') == 0:
                candidates.append([])
            elif ok:
                values = [copy.deepcopy(value) for _ in range(count)]
                if node.get('uniqueItems') and count > 1:
                    values = None
                if values is not None:
                    candidates.append(values)
            candidates.append([])
        elif kind == 'object':
            result = {}
            good = True
            for name in node.get('required', []):
                child = (node.get('properties') or {}).get(name, True)
                ok, value = sample(esv, child, pool, depth + 1)
                if not ok:
                    good = False
                    break
                result[name] = value
            if good:
                candidates.append(result)
    for value in candidates:
        if sub_valid(esv, node, value):
            return True, value
    return False, None


def force_condition(esv, condition, value, want, pool):
    """Make an object instance satisfy (want) or fail an `if` built from property const/enum clauses."""
    result = copy.deepcopy(value)
    properties = condition.get('properties') or {}
    if want:
        for name in condition.get('required', []):
            if name not in result:
                ok, item = sample(esv, properties.get(name, True), pool)
                if not ok:
                    return None
                result[name] = item
        for name, clause in properties.items():
            if isinstance(clause, dict) and 'const' in clause:
                result[name] = copy.deepcopy(clause['const'])
            elif isinstance(clause, dict) and 'enum' in clause:
                result[name] = copy.deepcopy(clause['enum'][0])
        return result if sub_valid(esv, condition, result) else None
    return None


def satisfy(esv, target, value, parent, pool):
    """Adjust properties so a `then`/`else` branch holds, each value also meeting the base property schema."""
    result = copy.deepcopy(value)
    base = parent.get('properties') or {}
    properties = target.get('properties') or {}
    names = list(properties) + [n for n in target.get('required', []) if n not in properties]
    for name in names:
        clause = properties.get(name, True)
        if name in result and sub_valid(esv, clause, result[name]) and sub_valid(esv, base.get(name, True), result[name]):
            continue
        ok, item = sample(esv, {'allOf': [base.get(name, True), clause]}, pool)
        if ok:
            result[name] = item
    return result


def evaluate_events(esv, value):
    """Keyword events of one evaluation by the unchanged validator, as pointer paths."""
    trace = Trace()
    trace._patch_validator_class(type(esv._inner))
    trace.events, trace.path = [], ()
    try:
        with exact_text():
            found = list(esv._inner.iter_errors(value))
    finally:
        cls = type(esv._inner)
        validators, descend = trace.patched[cls]
        cls.VALIDATORS.clear()
        cls.VALIDATORS.update(validators)
        cls.descend = descend
    index = esv._c12_index
    return found, [(index[n], k, p, c) for n, k, p, c in trace.events if n in index]


def branch_controls(esv, record, pool, limit=400):
    """Schema-boundary controls for branches the fixtures leave unvisited.

    Each is the recorded control with one optional property added, one empty array
    given one item, or one anyOf/oneOf/type-list alternative taken, using a value the
    selected owner node accepts. The complete selected definition must accept the new
    control. These are schema-boundary controls only: their edited values are not
    asserted to pass later digest/source/receipt joins, and earn no lifecycle credit.
    """
    root = esv._inner.schema
    control = record['instance']
    made, seen = [], set()

    def offer(tag, value):
        key = digest(value)
        if key in seen or value == control or len(made) >= limit:
            return
        seen.add(key)
        found, events = evaluate_events(esv, value)
        if not found:
            made.append(dict(record, instance=value, events=events, branch_control=tag,
                             parent=digest(control)))

    for schema_path, keyword, path, count in record['events']:
        if count:
            continue
        node = at(root, schema_path)
        try:
            value = at(control, path)
        except (KeyError, IndexError, TypeError):
            continue
        if keyword == 'properties' and isinstance(value, dict):
            for name, child in node['properties'].items():
                if name not in value:
                    ok, item = sample(esv, child, pool)
                    if ok:
                        offer(f'add:{pointer(path)}/{name}', replaced(control, path + (name,), item))
        elif keyword == 'items' and value == [] and isinstance(node.get('items'), dict):
            ok, item = sample(esv, node['items'], pool)
            if ok:
                offer(f'item:{pointer(path)}', replaced(control, path, [item]))
        elif keyword in ('anyOf', 'oneOf'):
            for i, branch in enumerate(node[keyword]):
                if not sub_valid(esv, branch, value):
                    ok, item = sample(esv, branch, pool)
                    if ok:
                        offer(f'{keyword}{i}:{pointer(path)}', replaced(control, path, item))
        elif keyword == 'if' and isinstance(value, dict) and isinstance(node['if'], dict):
            for want in (True, False):
                if sub_valid(esv, node['if'], value) == want:
                    continue
                forced = force_condition(esv, node['if'], value, want, pool)
                if forced is None:
                    continue
                target = node.get('then' if want else 'else')
                parent = at(root, schema_path[:-2]) if len(schema_path) >= 2 and schema_path[-2] == 'allOf' else node
                if isinstance(target, dict):
                    forced = satisfy(esv, target, forced, parent, pool)
                offer(f'if_{want}:{pointer(path)}', replaced(control, path, forced))
        elif keyword == 'type' and isinstance(node['type'], list):
            for kind in node['type']:
                ok, item = sample(esv, {**{k: v for k, v in node.items() if k != 'type'}, 'type': kind}, pool)
                if ok and not sub_valid(esv, {'type': kind}, value):
                    offer(f'type:{kind}:{pointer(path)}', replaced(control, path, item))
    return made


def timestamp_samples():
    """The shared date-time corpus: the CV-1101 battery and the number corpus's date-time cases (strings)."""
    battery = json.loads((ROOT / 'scripts/pm_event_datetime_timestamp_battery.json').read_text())['samples']
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())['cases']
    found = {}
    for value in [c['value'] for c in battery] + [c['value'] for c in corpus if c['op'] in ('datetime', 'datetime_direct')]:
        if type(value) is str:
            found.setdefault(value, None)
    return list(found)


def accepts(value, profile):
    try:
        date_time(value, profile=profile)
        return True
    except Refusal:
        return False


def datetime_schema_corpus(family, timestamps, out):
    """Every evaluated `format: date-time` clause, through its complete selected definition, on the corpus."""
    samples = timestamp_samples()
    inventory, failures, stricter = [], [], 0
    for binding, esv, control, path, schema_path, owner in timestamps:
        checked = accepted = 0
        for sample in samples:
            candidate = replaced(control, path, sample)
            found = list(esv.iter_errors(candidate))
            want, got = accepts(sample, EVENT_RECORD), not found
            checked += 1
            accepted += got
            if got == want:
                continue
            others = sorted({str(e.validator) for e in leaves(found)} - {'format', 'anyOf', 'oneOf'})
            if want and not got and others:
                stricter += 1  # an owner clause beside the format (pattern, length, const) refuses it
                continue
            failures.append(dict(phase=binding['phase'], owner=owner, instance_pointer=pointer(path), value=sample,
                                 expected=want, actual=got, errors=sorted({str(e.validator) for e in leaves(found)})))
        inventory.append(dict(phase=binding['phase'], fact=binding['fact'], owner=owner, schema_pointer=pointer(schema_path),
                              instance_pointer=pointer(path), profile=EVENT_RECORD, checks=checked, accepted=accepted))
    write(out / f"{family.replace('.', '_')}.datetime-inventory.json", dict(inventory=inventory, failures=failures))
    return dict(nodes=len(inventory), owner_nodes=len({(i['owner'].get('owner'), i['owner'].get('pointer')) for i in inventory}),
                checks=sum(i['checks'] for i in inventory), owner_stricter=stricter, samples=len(samples),
                failures=len(failures))


def schema_coverage(family, out):
    module, trace, run = observe(family)
    matrix, ledger, seen, inventory_roots, definitions, pending = [], [], set(), set(), [], {}
    timestamps = []
    bound = [r for r in trace.records if r['bindings']]
    pool = string_pool(bound)
    work, generated = list(bound), 0
    control_keys = {(r['root'], digest(r['instance'])) for r in bound}
    position = 0
    while position < len(work):
        record = work[position]
        position += 1
        esv = trace.roots[record['root']]
        root = esv._inner.schema
        before = len(seen)
        for binding in record['bindings']:
            label = binding['phase'] + ':' + binding['fact']
            rows = schema_row(binding)
            if (label, record['root']) not in inventory_roots:
                inventory_roots.add((label, record['root']))
                definitions.extend(definition_inventory(record['root'], esv, label))
            control = record['instance']
            for schema_path, keyword, path, count in record['events']:
                occurrence = (label, record['root'], schema_path, keyword, path)
                if occurrence in seen or count:
                    continue
                if occurrence in pending:
                    matrix.remove(pending.pop(occurrence))
                seen.add(occurrence)
                node = at(root, schema_path)
                row = dict(family=family, phase=binding['phase'], fact=binding['fact'], rows=rows,
                           root=record['root'], root_id=root.get('$id') if isinstance(root, dict) else None,
                           schema_pointer=pointer(schema_path), keyword=keyword, instance_pointer=pointer(path),
                           owner=owner_location(root, schema_path, keyword),
                           caller={k: v for k, v in (binding['caller'] or {}).items()
                                   if k in ('file', 'function', 'line', 'replayable')},
                           control_sha256=digest(control), branch_control=record.get('branch_control'),
                           witnesses=[])
                matrix.append(row)
                try:
                    original_value = at(control, path)
                except (KeyError, IndexError, TypeError):
                    raise AssertionError(('trace path drift', family, label, path))
                if keyword in ('required', 'additionalProperties', 'minProperties', 'maxProperties',
                               'dependentRequired') and not isinstance(original_value, dict):
                    row.update(coverage='inapplicable_object_value',
                               reason='Object keyword on a non-object control makes no assertion; no kill.')
                    continue
                if keyword in ('minItems', 'maxItems', 'uniqueItems') and not isinstance(original_value, list):
                    row.update(coverage='inapplicable_array_value',
                               reason='Array keyword on a non-array control makes no assertion; no kill.')
                    continue
                if keyword in ('minLength', 'maxLength', 'pattern', 'format') and not isinstance(original_value, str):
                    row.update(coverage='inapplicable_string_value',
                               reason='String keyword on a non-string control makes no assertion; no kill.')
                    continue
                if keyword in ('minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf') \
                        and (type(original_value) is bool or not isinstance(original_value, (int, float))):
                    row.update(coverage='inapplicable_number_value',
                               reason='Number keyword on a non-number control makes no assertion; no kill.')
                    continue
                if keyword in APPLICATORS:
                    row.update(coverage='complete_definition_applicator',
                               reason='Applicator dispatching to its unchanged child/referenced assertions; '
                                      'their own occurrences carry the witnesses. No scalar-row credit.')
                    continue
                if keyword == 'additionalProperties' and node[keyword] is not False:
                    row.update(coverage='explicitly_unrestricted' if node[keyword] is True else 'complete_definition_applicator',
                               reason='Owner permits or delegates additional properties here; nothing to isolate.')
                    continue
                if '/if/' in pointer(schema_path) or pointer(schema_path).endswith('/if'):
                    row.update(coverage='conditional_selector',
                               reason='Inside `if`: selects then/else and never refuses by itself.')
                    continue
                if keyword in ('$schema', '$id', '$anchor', '$comment', 'title', 'description', 'default',
                               'examples', '$defs', 'deprecated', 'readOnly', 'writeOnly', 'contentMediaType',
                               'contentEncoding'):
                    row.update(coverage='annotation', reason='Annotation keyword: no assertion.')
                    continue
                if keyword == 'format' and node[keyword] == 'date-time' and isinstance(original_value, str):
                    timestamps.append((binding, esv, control, path, schema_path, row['owner']))
                candidates = list(proposals(esv, keyword, node, original_value))
                first_new = len(ledger)
                for tag, changed in candidates:
                    mutant = replaced(control, path, changed)
                    found = list(esv.iter_errors(mutant))
                    entry = dict(id=f'{family}/clause/{len(ledger)}', phase=binding['phase'], fact=binding['fact'],
                                 root=record['root'], schema_pointer=pointer(schema_path), keyword=keyword,
                                 instance_pointer=pointer(path), tag=tag, mutant_sha256=digest(mutant),
                                 status='INVALID', reason='complete definition did not refuse at the expected clause')
                    ledger.append(entry)
                    if not expected_error(found, node, keyword, path):
                        local = local_validator(esv, {keyword: node[keyword]})
                        entry['local_clause_refuses'] = bool(list(local.iter_errors(changed)))
                        entry['full_definition_accepts'] = not found
                        continue
                    actual = phase_codes(binding, found)
                    if not actual or actual[0][0] not in rows:
                        entry['reason'] = 'consuming phase refused at another row: ' + repr(actual)
                        continue
                    entry.update(status='KILLED_EXPECTED', reason=None, expected_row=actual[0][0],
                                 expected_code=actual[0][1], schema_errors=len(found),
                                 covering_clauses=[dict(pointer=pointer(trace.root_index[record['root']].get(id(e.schema), ())),
                                                        keyword=str(e.validator), instance_pointer=pointer(e.absolute_path))
                                                   for e in leaves(found)])
                    saved = node.pop(keyword)
                    try:
                        cut = list(esv.iter_errors(mutant))
                        entry['clause_cut_accepts'] = not cut
                        entry['clause_cut_remaining'] = sorted({str(e.validator) for e in leaves(cut)})
                    finally:
                        node[keyword] = saved
                    restored = list(esv.iter_errors(mutant))
                    entry['restored_exact_refusal'] = expected_error(restored, node, keyword, path)
                    cut_rows = [(n, (lambda v, c: None) if n in rows else p) for n, p in tables.rows(binding['phase'])]
                    entry['whole_definition_cut_accepts'] = phase_codes(binding, found, cut_rows) == []
                    entry['control_restored'] = not list(esv.iter_errors(control))
                    caller = binding['caller'] or {}
                    if caller.get('replayable') and binding['fact'] == 'schema_errors':
                        outcome, first = replay(caller, mutant)
                        entry['boundary_replay'] = dict(function=caller['function'], outcome=outcome,
                                                        first=list(first) if first else None)
                        entry['boundary_first_refusal'] = bool(first and first[0] == binding['phase']
                                                               and first[1] and first[1][0][0] in rows)
                    else:
                        entry['boundary_first_refusal'] = None
                    if not all(entry[k] for k in ('restored_exact_refusal', 'whole_definition_cut_accepts',
                                                  'control_restored')):
                        raise AssertionError(('cut/restoration failed', entry))
                    row['witnesses'].append(entry['id'])
                    if keyword == 'type':
                        break
                if row['witnesses']:
                    row['coverage'] = 'clause_witness'
                    continue
                alternatives = [x['id'] for x in ledger[first_new:]
                                if x.get('local_clause_refuses') and x.get('full_definition_accepts')]
                if alternatives:
                    row.update(coverage='alternative_branch_witness', alternative_branch_witnesses=alternatives,
                               reason='The local clause refuses these values but the complete original definition '
                                      'accepts them through another branch; the clause is branch-selected, not an '
                                      'unconditional refusal. No kill credit.')
                elif not candidates and keyword in ('minLength', 'minItems', 'minProperties') and node[keyword] == 0:
                    row.update(coverage='vacuous_lower_bound', reason='A zero lower bound asserts nothing.')
                elif not candidates and keyword == 'uniqueItems' and node[keyword] is False:
                    row.update(coverage='vacuous', reason='uniqueItems false asserts nothing.')
                else:
                    seen.discard(occurrence)
                    pending[occurrence] = row
                    row.update(coverage='complete_definition_covering',
                               reason='No exact clause witness from this control: ' +
                                      ('every proposal was refused elsewhere first' if candidates else 'no proposal applies'))
        level = record.get('round', 0)
        if level < 3 and (level == 0 or len(seen) > before):
            for extra in branch_controls(esv, record, pool):
                key = (extra['root'], digest(extra['instance']))
                if key in control_keys:
                    continue
                control_keys.add(key)
                extra['round'] = level + 1
                work.append(extra)
                generated += 1
    covered = {}
    for entry in ledger:
        if entry['status'] == 'KILLED_EXPECTED':
            for clause in entry['covering_clauses']:
                covered.setdefault((entry['phase'] + ':' + entry['fact'], entry['root'], clause['pointer'],
                                    clause['keyword']), []).append(entry['id'])
    observed = {(r['phase'] + ':' + r['fact'], r['root'], r['schema_pointer'], r['keyword']) for r in matrix}
    witnessed = {(r['phase'] + ':' + r['fact'], r['root'], r['schema_pointer'], r['keyword'])
                 for r in matrix if r['coverage'] in ('clause_witness',)}
    for item in definitions:
        key = (item['phase'], item['root'], item['pointer'], item['keyword'])
        item['observed'] = key in observed
        item['witnessed'] = key in witnessed
        item['covering_witnesses'] = covered.get(key, [])[:5]
        item['covered'] = item['observed'] or bool(item['covering_witnesses'])
    uncovered = [x for x in definitions if not x['covered']]
    weak = [r for r in matrix if r['coverage'] == 'complete_definition_covering']
    unmapped = [r for r in matrix if not r['owner'].get('match')]
    boundary = [x for x in ledger if x['status'] == 'KILLED_EXPECTED']
    summary = dict(family=family, run=run, roots=len(trace.roots), bound_controls=len(bound),
                   branch_controls=generated,
                   occurrences=len(matrix),
                   coverage={k: sum(r['coverage'] == k for r in matrix) for k in sorted({r['coverage'] for r in matrix})},
                   killed=len(boundary), invalid=sum(x['status'] == 'INVALID' for x in ledger),
                   boundary_first_refusal=sum(x.get('boundary_first_refusal') is True for x in boundary),
                   boundary_not_first=sum(x.get('boundary_first_refusal') is False for x in boundary),
                   boundary_not_replayable=sum(x.get('boundary_first_refusal') is None for x in boundary),
                   reachable_clauses=len(definitions), uncovered_clauses=len(uncovered),
                   weak_occurrences=len(weak), unmapped_owner=len(unmapped),
                   phases=sorted({r['phase'] + ':' + r['fact'] for r in matrix}),
                   method='original whole-definition Method B with exact clause witnesses; no per-keyword guard-row claim')
    datetime_summary = datetime_schema_corpus(family, timestamps, out)
    unbound = sorted({(r['caller'] or {}).get('file', '?') + ':' + (r['caller'] or {}).get('function', '?') + ':' +
                      str((r['caller'] or {}).get('line', '?')) for r in trace.records if not r['bindings']})
    summary['schema_calls_without_refusal_row'] = unbound
    summary['datetime'] = datetime_summary
    summary['failures'] = len(uncovered) + len(weak) + len(unmapped) + datetime_summary['failures']
    stem = family.replace('.', '_')
    write(out / f'{stem}.schema-matrix.json', matrix)
    write(out / f'{stem}.definition-inventory.json', definitions)
    write(out / f'{stem}.uncovered-clauses.json', uncovered)
    write(out / f'{stem}.mutation-ledger.json', ledger)
    write(out / f'{stem}.schema-summary.json', summary)
    return summary


# ------------------------------------------------------------------ copies, retained custody, timestamps
MIRROR_CODES = dict(row='storage_row_count', ref='storage_companion_ref', id='storage_schema_id',
                    invalid='storage_schema_invalid', reference='storage_schema_reference', drift='storage_schema_drift')
OTHER_TYPE = {'string': 'integer', 'integer': 'string', 'number': 'string', 'boolean': 'string', 'object': 'array',
              'array': 'object', 'null': 'string'}


def mirror_targets(module, family):
    """(family_id, refusal function) for every registered Storage copy the family checker reads."""
    if family in CARD5:
        manifest = module.load('Plans/card5_event_contracts/manifest.json')
        row = next(f for f in manifest['families'] if f['event_type'] == family)
        schemas = {k: module.load(row[k]) for k in ('payload_schema', 'checkpoint_schema')}
        if row['operation_schema']:
            schemas['operation_schema'] = module.load(row['operation_schema'])
        out = []
        for surface in ('operation', 'checkpoint'):
            if row[surface + '_schema'] is not None:
                fid = row['slug'] + '_' + surface
                out.append((fid, lambda registry, fid=fid: [e for e in module.storage_schema_errors(registry, row, schemas)
                                                             if e.endswith(':' + fid)]))
        return out
    shared = module if family in ALERT else module.shared
    if family in ALERT:
        slug = family.replace('.', '_')
        names = [(slug + '_operation', 'alert_event_contracts'), (slug + '_checkpoint', 'alert_event_contracts'),
                 ('shared_alert_state', 'alert_event_contracts'), ('shared_alert_rule_state', 'alert_event_contracts')]
    elif family in PANEL:
        slug = family.replace('.', '_')
        names = [(slug + '_operation', 'panel_event_contracts'), (slug + '_checkpoint', 'panel_event_contracts')]
    else:
        names = [(fid, 'concern_created_contracts') for fid in
                 ('concern_record', 'concern_created_operation', 'concern_created_checkpoint')]
    return [(fid, lambda registry, fid=fid, folder=folder: shared.registry_mirror_errors(
        registry, fid, f'Plans/{folder}/{fid}.schema.json')) for fid, folder in names]


def mirror_mutations(schema):
    """One independent change per clause of a registered copy, with the refusal it must produce."""
    for path, node in walk(schema):
        if not isinstance(node, dict):
            continue
        for key, value in node.items():
            if path and path[-1] in ('properties', '$defs', 'patternProperties'):
                continue  # names under these maps are handled as property removal below
            where = path + (key,)
            if key == '$ref' and isinstance(value, str):
                yield where, value + '_c12', 'reference'
            elif key == 'type' and isinstance(value, str):
                yield where, OTHER_TYPE.get(value, 'string'), 'drift'
            elif key in ('pattern', 'format', 'const', 'title', 'description', '$comment', '$id') and isinstance(value, str):
                yield where, value + ('|c12' if key == 'pattern' else '_c12'), 'drift'
            elif key in ('const', 'default') and not isinstance(value, (dict, list)):
                yield where, '__c12__', 'drift'
            elif key in ('minLength', 'maxLength', 'minimum', 'maximum', 'minItems', 'maxItems',
                         'minProperties', 'maxProperties') and type(value) is int:
                yield where, value + 1, 'drift'
            elif key in ('additionalProperties', 'uniqueItems', 'unevaluatedProperties') and type(value) is bool:
                yield where, not value, 'drift'
            elif key == 'enum' and isinstance(value, list):
                yield where, value + ['__c12__'], 'drift'
            elif key == 'required' and isinstance(value, list):
                yield where, value[:-1] if value else ['__c12__'], 'drift'
            elif key in ('properties', '$defs') and isinstance(value, dict) and value:
                last = sorted(value)[-1]
                if key == '$defs' and any(isinstance(n, str) and n.endswith('/' + last) for _, n in walk(schema)):
                    continue  # removing a referenced definition is a reference defect, covered by $ref rows
                yield where, {k: v for k, v in value.items() if k != last}, 'drift'


def mirror_cases(module, family, out_rows):
    registry = module.load('Plans/storage_value_registry.json') if hasattr(module, 'load') else None
    ledger = []
    for fid, refuse in mirror_targets(module, family):
        base = copy.deepcopy(registry)
        if refuse(base):
            raise AssertionError(('registered copy refused unmodified', family, fid, refuse(base)))
        index = next(i for i, row in enumerate(base['families']) if row['family_id'] == fid)
        stored = base['families'][index]['value_schema']
        before = digest(base)
        row_cases = [('missing_row', 'row', lambda r: r['families'].pop(index)),
                     ('duplicate_row', 'row', lambda r: r['families'].append(copy.deepcopy(r['families'][index]))),
                     ('companion_ref', 'ref', lambda r: r['families'][index].__setitem__('value_schema_ref', 'Plans/c12.schema.json')),
                     ('schema_id', 'id', lambda r: r['families'][index].__setitem__('value_schema_id', 'pm.c12.v1')),
                     ('invalid_schema', 'invalid', lambda r: r['families'][index]['value_schema'].__setitem__('type', 0)),
                     ('unvisited_ref', 'reference', lambda r: r['families'][index]['value_schema'].setdefault('$defs', {})
                      .__setitem__('c12_dangling', {'$ref': '#/$defs/c12_missing'}))]
        cases = [(name, kind, change) for name, kind, change in row_cases]
        for where, value, kind in mirror_mutations(stored):
            cases.append(('clause:' + pointer(where), kind,
                          lambda r, where=where, value=value: at(r['families'][index]['value_schema'], where[:-1])
                          .__setitem__(where[-1], copy.deepcopy(value))))
        for name, kind, change in cases:
            mutated = copy.deepcopy(base)
            change(mutated)
            expected = [MIRROR_CODES[kind] + ':' + fid]
            try:
                actual = refuse(mutated)
            except Exception as error:  # never a kill
                actual = ['EXCEPTION:' + type(error).__name__]
            ledger.append(dict(family=family, copy='registry:' + fid, case=name, expected=expected, actual=actual,
                               status='KILLED_EXPECTED' if actual == expected else 'INVALID'))
        if digest(base) != before:
            raise AssertionError(('base registry changed', fid))
    out_rows.extend(ledger)
    return ledger


def distinct(value):
    """A different value of the same JSON type that keeps common lexical forms (digits, case, hex, timestamps)."""
    if type(value) is bool:
        return not value
    if type(value) is int:
        return value + 1 if value < 2 ** 63 - 2 else value - 1
    if type(value) is str and value:
        chars = list(value)
        if re.fullmatch(r'\d{4}-\d\d-\d\d[Tt].*', value):
            chars[3] = str((int(chars[3]) + 1) % 10)  # another year keeps every timestamp form valid
            return ''.join(chars)
        for i in range(len(chars) - 1, -1, -1):
            c = chars[i]
            if c.isdigit():
                chars[i] = str((int(c) + 1) % 10)
                return ''.join(chars)
            if 'a' <= c <= 'z':
                chars[i] = 'a' if c == 'f' and re.fullmatch(r'[0-9a-f]+', value) else chr((ord(c) - 97 + 1) % 26 + 97)
                return ''.join(chars)
            if 'A' <= c <= 'Z':
                chars[i] = chr((ord(c) - 65 + 1) % 26 + 65)
                return ''.join(chars)
        return value + 'x'
    return None


class Capture:
    """Record accepted calls of the unchanged join functions in every loaded alert-module copy."""

    NAMES = ('historical_refusals', 'append_result_errors', 'retry_refusals')

    def __init__(self, module, limit=6):
        self.calls = {n: [] for n in self.NAMES}
        self.keys = set()
        self.limit = limit
        self.saved = []
        shared = [m for m in {id(x): x for x in (module, getattr(module, 'shared', None)) if x}.values()
                  if hasattr(m, 'historical_refusals')]
        for target in shared:
            for name in self.NAMES:
                original = getattr(target, name)
                setattr(target, name, self._wrap(name, original))
                self.saved.append((target, name, original))
        self.shared = shared[0]

    def _wrap(self, name, original):
        def wrapper(*args):
            result = original(*args)
            if not result and len(self.calls[name]) < self.limit:
                if name == 'retry_refusals' and not (len(args) > 4 and args[4] and args[4].get('state') in ('committed', 'settled')):
                    return result
                if name == 'append_result_errors' and args[0].get('state') == 'prepared':
                    return result  # path selection: a prepared operation has no append to join
                key = (name, digest([a for a in args if not callable(a)]))
                if key not in self.keys:
                    self.keys.add(key)
                    self.calls[name].append(dict(function=original, args=copy.deepcopy(list(args))))
            return result
        return wrapper

    def restore(self):
        for target, name, original in self.saved:
            setattr(target, name, original)


def recorded(function, args):
    recorder, tables.RECORDER = tables.RECORDER, []
    try:
        result = function(*args)
        outcome = 'returned'
    except Exception as error:  # never a kill
        result, outcome = None, 'EXCEPTION:' + type(error).__name__
    finally:
        records, tables.RECORDER = tables.RECORDER, recorder
    rows = [(phase, name, code) for phase, _, refusals in records for name, code in refusals]
    return outcome, result, rows


# Each join's compared copies: (label, argument index, prefix, members or None for the whole copy).
# Operation members a join does not read are checked by the operation schema and operation joins instead.
JOIN_COPIES = {
    'historical_refusals': (('request', 0, ('event',), None), ('request', 0, ('checkpoint',), None),
                            ('request', 0, ('disclosure',), None), ('expected', 1, ('event',), None),
                            # The expected checkpoint is compared as its publication, without `state`
                            # (pm-alert-event-contracts-check.py historical_observation); the request's own state
                            # must be current (history_checkpoint checkpoint_current).
                            ('expected', 1, ('checkpoint',), ('-state',))),
    'append_result_errors': (('operation', 0, (), ('event_id', 'storage_instance_id', 'project_id', 'payload',
                                                   'scope_partition', 'original_append_result_ref')),
                             ('resolved', 1, (), None), ('expected', 2, (), None)),
    'retry_refusals': (('command', 1, (), None), ('payload', 2, (), None),
                       ('operation', 4, (), ('original_command', 'payload', 'request_digest')),
                       ('original_event', 5, (), None)),
}


def join_cases(family, capture, out_rows):
    """Independently change each leaf of each copy a join compares; only one exact refusing row is a kill."""
    ledger = []
    for name, calls in capture.calls.items():
        for call_index, call in enumerate(calls):
            for label, arg_index, prefix, members in JOIN_COPIES[name]:
                if arg_index >= len(call['args']):
                    continue
                try:
                    base = at(call['args'][arg_index], prefix)
                except (KeyError, IndexError, TypeError):
                    continue
                for path, leaf in walk(base):
                    if isinstance(leaf, (dict, list)) or leaf is None or not path:
                        continue
                    if members is not None and ('-' + str(path[0]) in members if members[0].startswith('-')
                                                else path[0] not in members):
                        continue
                    changed = distinct(leaf)
                    if changed is None or changed == leaf:
                        continue
                    args = copy.deepcopy(call['args'])
                    target = at(args[arg_index], prefix + path[:-1]) if prefix + path[:-1] else args[arg_index]
                    target[path[-1]] = changed
                    outcome, result, rows = recorded(call['function'], args)
                    entry = dict(family=family, join=name, call=call_index, copy=label + pointer(prefix + path),
                                 outcome=outcome, rows=[list(r) for r in rows[:4]], refused=bool(result))
                    if outcome != 'returned':
                        entry['status'] = 'INVALID'
                    elif not rows:
                        entry['status'] = 'ACCEPTED'
                    elif len(rows) == 1:
                        entry.update(status='KILLED_EXPECTED', expected_row=rows[0][1], expected_code=rows[0][2])
                    else:
                        entry['status'] = 'MULTI_ROW'
                    ledger.append(entry)
    out_rows.extend(ledger)
    return ledger


def custody_module():
    return sys.modules['pm_dg6a_custody']


def store_snapshot(custody):
    return digest(sorted((ref, sorted((k, repr(v)) for k, v in entries.items()))
                         for ref, entries in custody.SEALED.items()))


def retained_cases(family, capture, out_rows):
    """SP-1101 retained reads and retries against Storage's sealed custody, with before/after store snapshots."""
    import dataclasses
    custody = custody_module()
    custody._install()
    ledger = []
    reads = [('historical_refusals', c) for c in capture.calls['historical_refusals']] + \
            [('retry_refusals', c) for c in capture.calls['retry_refusals']]
    for name, call in reads:
        args = call['args']
        original = args[1]['event'] if name == 'historical_refusals' else args[5]
        ref = original['event_ref']
        raw = custody.record_bytes(original)
        key = hashlib.sha256(raw).hexdigest()
        declared = key in (custody.SEALED.get(ref) or {})
        # A captured read of a test-declared Storage history is replayed inside that same declaration.
        scope = contextlib.nullcontext() if declared else custody.written([original])
        with scope:
            ledger.extend(retained_variants(family, name, call, args, original, ref, key, custody))
    out_rows.extend(ledger)
    return ledger


def retained_variants(family, name, call, args, original, ref, key, custody):
    import dataclasses
    ledger = []
    if True:
        binding, recipe = custody.SEALED[ref][key]
        other = next(e for e in custody.EDITIONS.values() if e.event_type != original['event_type'] and not e.legacy)
        variants = {
            'original': (None, []),
            'missing_receipt': (lambda: custody.SEALED.pop(ref), 'original_located'),
            'receipt_for_other_bytes': (lambda: custody.SEALED.__setitem__(ref, {'0' * 64: (binding, recipe)}), 'original_authentic'),
            'receipt_for_other_original': (lambda: custody.SEALED[ref].__setitem__(key, (dataclasses.replace(
                binding, event_id=binding.event_id + 'x'), recipe)), 'binding_exact'),
            'ambiguous_edition': (lambda: custody.SEALED[ref].__setitem__(key, (binding, dataclasses.replace(
                recipe, payload_schema_version=recipe.payload_schema_version + '|other'))), 'recipe_installed'),
            'replaced_resource': (lambda: custody.SEALED[ref].__setitem__(key, (binding, custody.replaced_resource_recipe(original))),
                                  'recipe_installed'),
            'foreign_recipe': (lambda: custody.SEALED[ref].__setitem__(key, (binding, other.recipe())), 'original_verified'),
            'ambiguous_receipt': (lambda: custody.SEALED[ref].__setitem__(key, [(binding, recipe), (binding, other.recipe())]),
                                  'original_authentic'),
        }
        for variant, (change, failing) in variants.items():
            saved = copy.copy(custody.SEALED.get(ref))
            try:
                if change:
                    change()
                before = store_snapshot(custody)
                args_before = digest([a for a in args if not callable(a)])
                outcome, result, rows = recorded(call['function'], copy.deepcopy(args))
                after = store_snapshot(custody)
                args_after = digest([a for a in args if not callable(a)])
            finally:
                if saved is None:
                    custody.SEALED.pop(ref, None)
                else:
                    custody.SEALED[ref] = saved
            if variant == 'original':
                ok = outcome == 'returned' and not result and not rows
            else:
                # The refusing row must be the custody row of exactly the fact the variant breaks:
                # HC0n (history_custody) or RQ0n (retry), n = position in CUSTODY_FACTS.
                step = f'{custody.CUSTODY_FACTS.index(failing) + 1:02d}'
                ok = (outcome == 'returned' and len(rows) == 1 and bool(result)
                      and (rows[0][0] == 'history_custody' or rows[0][0].startswith('retry_retained_'))
                      and rows[0][1][:2] in ('HC', 'RQ') and rows[0][1][2:4] == step)
            entry = dict(family=family, read=name, event_ref=ref, variant=variant, outcome=outcome,
                         rows=[list(r) for r in rows[:4]], expected_failing_fact=failing,
                         store_before=before, store_after=after, store_unchanged=before == after,
                         input_unchanged=args_before == args_after,
                         status='KILLED_EXPECTED' if ok and variant != 'original' else ('ACCEPTED_CONTROL' if ok else 'INVALID'))
            if not entry['store_unchanged']:
                entry['status'] = 'INVALID'
            ledger.append(entry)
    return ledger


def sealed_invalid_history(family, capture, out_rows, limit=24):
    """Owner-invalid history at the authenticated boundary: Storage holds a sealed original whose payload breaks
    one clause of its frozen edition (as a writer that skipped validation would leave it); the read must refuse
    at HG15 alone, with the store unchanged by the read."""
    custody = custody_module()
    ledger = []
    for call in capture.calls['historical_refusals'][:1]:
        request, expected = call['args'][0], call['args'][1]
        payload = expected['event']['payload']
        changes = [('missing:' + k, k, None) for k in sorted(payload) if k not in ('schema_id', 'schema_version')]
        changes += [('extra', '__c12__', 1)]
        for name, key, value in changes[:limit]:
            args = copy.deepcopy(call['args'])
            for holder in (args[0]['event'], args[1]['event']):
                if value is None:
                    holder['payload'].pop(key, None)
                else:
                    holder['payload'][key] = value
            if custody.record_bytes(args[1]['event']) is None:
                continue
            original = args[1]['event']
            edition = custody.EDITIONS.get((original['event_type'], original['payload'].get('schema_id'),
                                            original['payload'].get('schema_version')))
            if edition is not None and not list(edition.validator.iter_errors(original['payload'])):
                ledger.append(dict(family=family, case=name, status='NOT_A_VIOLATION',
                                   reason='the frozen edition accepts it (an optional member); not owner-invalid'))
                continue
            with custody.written([args[1]['event']]):
                before = store_snapshot(custody)
                outcome, result, rows = recorded(call['function'], args)
                after = store_snapshot(custody)
            first = rows[0] if rows else None
            ok = outcome == 'returned' and first is not None and first[1] == 'HG15_payload_schema'
            status = 'KILLED_EXPECTED' if ok else ('REFUSED_EARLIER' if outcome == 'returned' and result else 'INVALID')
            if before != after:
                status = 'INVALID'
            # REFUSED_EARLIER: the frozen verifier needs the member to recompute the original identity
            # (pm_dg6a_custody.expected_event_id), so custody refuses first; no kill credit, not an acceptance.
            ledger.append(dict(family=family, case=name, outcome=outcome, rows=[list(r) for r in rows[:4]],
                               store_unchanged=before == after, single_row=len(rows) == 1, status=status))
    out_rows.extend(ledger)
    return ledger


def retained_timestamp_cases(family, capture, out_rows):
    """Storage-assigned observed_at_utc/persisted_at_utc (storage_utc_z) and the first-receipt acknowledged_at_utc
    (EventRecord, E5-2) at the authenticated retained boundary: both copies carry the sample, Storage holds the
    sealed original, and the read accepts exactly what the shared predicate accepts under the field's profile."""
    from pm_event_datetime import STORAGE_UTC_Z
    custody = custody_module()
    ledger = []
    samples = timestamp_samples()
    for call in capture.calls['historical_refusals'][:1]:
        event = call['args'][1]['event']
        sites = [(('event', field), field, STORAGE_UTC_Z, 'HG05_event_instants') for field in ('observed_at_utc', 'persisted_at_utc')]
        sites += [(('event', 'receipt') + path, 'acknowledged_at_utc', EVENT_RECORD, 'HG17_receipt_instants')
                  for path, node in walk(event['receipt']) if path and path[-1] == 'acknowledged_at_utc']
        for where, field, profile, row in sites:
            for sample in samples:
                args = [copy.deepcopy(a) for a in call['args']]
                for holder in (args[0], args[1]):
                    at(holder, where[:-1])[where[-1]] = sample
                if custody.record_bytes(args[1]['event']) is None:
                    continue
                with custody.written([args[1]['event']]):
                    before = store_snapshot(custody)
                    outcome, result, rows = recorded(call['function'], args)
                    after = store_snapshot(custody)
                want = accepts(sample, profile)
                got = outcome == 'returned' and not result
                ok = got == want and before == after and (want or (rows and rows[0][1] == row))
                ledger.append(dict(family=family, field=field, site=pointer(where), profile=profile, value=sample,
                                   expected=want, accepted=got, rows=[list(r) for r in rows[:3]],
                                   store_unchanged=before == after, status='OK' if ok else 'FAILURE'))
    out_rows.extend(ledger)
    return ledger


def copies_mode(family, out):
    module = load_checker(family)
    capture = Capture(module)
    try:
        code, status = run_main(module, family)
    finally:
        capture.restore()
    if code != 0 or status.get('status') != 'pass':
        raise AssertionError(('family checker failed', family, code, status))
    import time
    rows, seconds = [], {}
    started = time.monotonic()
    mirror = mirror_cases(module, family, rows)
    seconds['mirror'] = round(time.monotonic() - started, 1)
    joins = join_cases(family, capture, rows)
    seconds['joins'] = round(time.monotonic() - started - sum(seconds.values()), 1)
    retained = retained_cases(family, capture, rows)
    seconds['retained'] = round(time.monotonic() - started - sum(seconds.values()), 1)
    invalid_history = sealed_invalid_history(family, capture, rows)
    seconds['sealed_invalid_history'] = round(time.monotonic() - started - sum(seconds.values()), 1)
    timestamps = retained_timestamp_cases(family, capture, rows)
    seconds['retained_timestamps'] = round(time.monotonic() - started - sum(seconds.values()), 1)
    stem = family.replace('.', '_')
    write(out / f'{stem}.copies-ledger.json', dict(mirror=mirror, joins=joins, retained=retained,
                                                   sealed_invalid_history=invalid_history,
                                                   retained_timestamps=timestamps))

    def tally(items):
        result = {}
        for item in items:
            result[item['status']] = result.get(item['status'], 0) + 1
        return result
    summary = dict(family=family, seconds=seconds, captured={k: len(v) for k, v in capture.calls.items()},
                   mirror=tally(mirror), joins=tally(joins), retained=tally(retained),
                   sealed_invalid_history=tally(invalid_history), retained_timestamps=tally(timestamps),
                   retained_timestamp_fields=sorted({(t['field'], t['profile']) for t in timestamps}),
                   retained_store_observations=len(retained) + sum('store_unchanged' in x for x in invalid_history) + len(timestamps),
                   retained_store_changed=sum(not x.get('store_unchanged', True) for x in retained + invalid_history + timestamps))
    summary['failures'] = (summary['mirror'].get('INVALID', 0) + summary['retained'].get('INVALID', 0)
                           + summary['sealed_invalid_history'].get('INVALID', 0) + summary['retained_store_changed']
                           + summary['joins'].get('ACCEPTED', 0) + summary['joins'].get('INVALID', 0)
                           + summary['retained_timestamps'].get('FAILURE', 0))
    write(out / f'{stem}.copies-summary.json', summary)
    return summary


def bigint_mode(family, out):
    """A valid 4,400-digit integer (CV-1100 sets no global cap) at every evaluated integer slot: the complete
    definition and the unchanged consuming checker function must refuse or accept it without an exception
    (the crash DX, DS15, DF, DM and DCO each found)."""
    module, trace, run = observe(family)
    big = 10 ** 4399
    ledger, seen = [], set()
    for record in trace.records:
        esv = trace.roots[record['root']]
        root = esv._inner.schema
        for binding in record['bindings']:
            for schema_path, keyword, path, count in record['events']:
                if keyword != 'type' or count:
                    continue
                node = at(root, schema_path)
                kinds = node['type'] if isinstance(node['type'], list) else [node['type']]
                value = at(record['instance'], path)
                if 'integer' not in kinds or type(value) is not int:
                    continue
                key = (binding['phase'], record['root'], schema_path, path)
                if key in seen:
                    continue
                seen.add(key)
                for sign in (1, -1):
                    mutant = replaced(record['instance'], path, sign * big)
                    entry = dict(family=family, phase=binding['phase'], schema_pointer=pointer(schema_path),
                                 instance_pointer=pointer(path), digits=4400, sign=sign)
                    try:
                        found = list(esv.iter_errors(mutant))
                        entry['schema_keywords'] = sorted({str(e.validator) for e in leaves(found)})
                        entry['schema_accepts'] = not found
                    except Exception as error:
                        entry['schema_exception'] = type(error).__name__
                    caller = binding['caller'] or {}
                    if caller.get('replayable') and binding['fact'] == 'schema_errors':
                        outcome, first = replay(caller, mutant)
                        entry['boundary'] = dict(function=caller['function'], outcome=outcome,
                                                 first=list(first) if first else None)
                    entry['status'] = 'FAILURE' if ('schema_exception' in entry or
                                                    entry.get('boundary', {}).get('outcome', 'returned') != 'returned') else 'OK'
                    ledger.append(entry)
    stem = family.replace('.', '_')
    write(out / f'{stem}.bigint.json', ledger)
    summary = dict(family=family, slots=len(seen), checks=len(ledger),
                   replayed=sum('boundary' in x for x in ledger),
                   accepted_by_schema=sum(x.get('schema_accepts') is True for x in ledger),
                   failures=sum(x['status'] == 'FAILURE' for x in ledger))
    write(out / f'{stem}.bigint-summary.json', summary)
    return summary


def self_test(out):
    """Adversarial checks of the adapter's own accounting (no family checker is needed)."""
    spec = importlib.util.spec_from_file_location('dg6a_c12_selftest_domain', ROOT / 'scripts/pm-dg6a-domain.py')
    domain = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(domain)
    schema = {'type': 'object', 'additionalProperties': False, 'required': ['a', 't'],
              'properties': {'a': {'type': 'string', 'pattern': '^x+$', 'maxLength': 3},
                             't': {'type': 'string', 'format': 'date-time'}}}
    esv = domain.validator(schema)
    root = esv._inner.schema
    node_a, node_t = root['properties']['a'], root['properties']['t']
    control = {'a': 'xx', 't': '2026-11-04T12:00:00Z'}
    checks = {}
    found = list(esv.iter_errors({'a': 1, 't': control['t']}))
    checks['other_clause_not_credited'] = (expected_error(found, node_a, 'type', ('a',))
                                           and not expected_error(found, node_a, 'pattern', ('a',)))
    found = list(esv.iter_errors({'a': 'xx', 't': '2026-11-04T12:00:00Z', 'b': 1}))
    checks['wrong_location_not_credited'] = not expected_error(found, node_a, 'pattern', ('a',))
    found = list(esv.iter_errors({'a': 'xx', 't': '2026-02-30T12:00:00Z'}))
    checks['format_is_the_shared_predicate'] = expected_error(found, node_t, 'format', ('t',))
    saved = node_a.pop('pattern')
    try:
        checks['clause_cut_accepts'] = not list(esv.iter_errors({'a': 'yy', 't': control['t']}))
    finally:
        node_a['pattern'] = saved
    checks['restoration_refuses'] = bool(list(esv.iter_errors({'a': 'yy', 't': control['t']})))
    checks['distinct_keeps_types'] = all(type(distinct(v)) is type(v) and distinct(v) != v
                                         for v in ('abc', 'A1', 'f0', 7, True))
    checks['distinct_keeps_timestamps'] = accepts(distinct('2026-11-04T12:00:00Z'), EVENT_RECORD)
    mutants = dict(proposals(esv, 'pattern', node_a, 'xx'))
    checks['pattern_proposals_violate'] = bool(mutants) and all(not re.search('^x+$', v) for v in mutants.values())
    checks['bool_is_not_integer'] = bool(list(domain.validator({'type': 'integer'}).iter_errors(True)))
    checks['huge_integer_no_exception'] = not list(domain.validator({'type': 'integer'}).iter_errors(10 ** 4399))
    write(out / 'selftest.json', checks)
    return dict(family='selftest', checks=len(checks), failures=sum(not v for v in checks.values()),
                failed=[k for k, v in checks.items() if not v])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', choices=FAMILIES, action='append')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--mode', choices=('schema', 'copies', 'bigint', 'selftest'), default='schema')
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    result = []
    if args.mode == 'selftest':
        row = self_test(args.out)
        print(json.dumps(row))
        return int(bool(row['failures']))
    for family in args.family or FAMILIES:
        row = {'schema': schema_coverage, 'copies': copies_mode, 'bigint': bigint_mode}[args.mode](family, args.out)
        result.append(row)
        print(json.dumps(row, default=_default), flush=True)
    write(args.out / f'{args.mode}-summary.json', result)
    return int(any(r.get('failures', 0) for r in result))


if __name__ == '__main__':
    raise SystemExit(main())
