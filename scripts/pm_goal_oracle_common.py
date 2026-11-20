"""Shared static-oracle machinery; no native admission or runtime evidence.

Strict validation deliberately leaves retained schema bytes unchanged. Guard removal
disables a predicate, never changes the expected result or the input observation.
"""
from __future__ import annotations

import copy
import ast
import inspect
import contextvars
from functools import lru_cache
import datetime
import hashlib
import json
import re
import math
import multiprocessing
import os
import sys
import pickle
from decimal import Decimal
from pathlib import Path
from urllib.parse import urldefrag, unquote

import jsonschema
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
import pm_event_numbers as numbers
import pm_event_datetime as dates
import pm_goal_guard_tables as tables

ROOT = Path(__file__).resolve().parents[1]
FORMATS = jsonschema.FormatChecker()  # Preserve owner UUID/URI/etc. assertions.
DATETIME_PROFILE = contextvars.ContextVar('goal_datetime_profile', default=dates.EVENT_RECORD)


@FORMATS.checks("date-time")
def utc(value):
    if not isinstance(value, str):
        return True
    try:
        dates.date_time(value, profile=DATETIME_PROFILE.get())
        return True
    except numbers.Refusal:
        return False


# ECMA-262 (JSON Schema 2020-12 section 6.3.3) differs from Python `re` here:
# `$` is end of input only (Python also matches before one final LF); `.`
# excludes all four ECMA line terminators; \d \w are ASCII; \s is ECMA's own
# whitespace set. A pattern is an unanchored search, never a fullmatch.
ECMA_LINE_TERMINATORS = '\n\r\u2028\u2029'
ECMA_WHITESPACE = '\t\n\x0b\x0c\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff'
_CLASS_ESCAPES = {'d': '0-9', 'w': 'A-Za-z0-9_', 's': ECMA_WHITESPACE}
_ANY = '[\\s\\S]'  # Python's own any-character class; the union of complements agrees in both dialects.


@lru_cache(maxsize=None)
def ecma_pattern(pattern):
    """Compile an owner `pattern` with ECMA-262 semantics (C12-GH1, from lane GC's report).

    Unsupported constructs (word boundaries, a negated class escape inside a
    class other than a complementary any-character pair) raise ValueError, so
    an owner pattern outside this adapter fails closed instead of silently
    taking Python semantics.
    """
    out, index, in_class = [], 0, False
    while index < len(pattern):
        char = pattern[index]
        if char == '\\':
            escape = pattern[index + 1:index + 2]
            if escape in ('b', 'B'):
                raise ValueError('unsupported ECMA word boundary in owner pattern: ' + pattern)
            if escape in ('d', 'w', 's'):
                out.append(_CLASS_ESCAPES[escape] if in_class else '[' + _CLASS_ESCAPES[escape] + ']')
            elif escape in ('D', 'W', 'S'):
                if in_class:
                    raise ValueError('unsupported negated class escape inside a class: ' + pattern)
                out.append('[^' + _CLASS_ESCAPES[escape.lower()] + ']')
            else:
                out.append(pattern[index:index + 2])
            index += 2
            continue
        if in_class:
            if char == ']':
                in_class = False
            out.append(char)
            index += 1
            continue
        if char == '[':
            for pair in ('[\\s\\S]', '[\\S\\s]', '[\\d\\D]', '[\\D\\d]', '[\\w\\W]', '[\\W\\w]'):
                if pattern.startswith(pair, index):
                    out.append(_ANY)
                    index += len(pair)
                    break
            else:
                if pattern.startswith('[]', index):
                    out.append('(?!)')  # ECMA empty class: matches nothing
                    index += 2
                elif pattern.startswith('[^]', index):
                    out.append(_ANY)    # ECMA [^]: any character
                    index += 3
                else:
                    in_class = True
                    out.append(char)
                    index += 1
                    if pattern[index:index + 1] == '^':
                        out.append('^')
                        index += 1
            continue
        if char == '$':
            out.append('\\Z')
        elif char == '.':
            out.append('[^' + ECMA_LINE_TERMINATORS + ']')
        else:
            out.append(char)
        index += 1
    return re.compile(''.join(out))


def strict_pattern(validator, pattern, value, schema):
    # Unanchored ECMA search (was re.fullmatch: a false pass for unanchored
    # owner clauses such as not: {pattern: '[\u0000-\u001f]'}).
    if isinstance(value, str) and ecma_pattern(pattern).search(value) is None:
        yield jsonschema.ValidationError(f"{value!r} does not match {pattern!r}")


def pattern_self_test():
    """Standing ECMA pattern trials, including the fullmatch false pass."""
    cases = [
        ('unanchored control char under not refuses trailing LF', {'not': {'pattern': '[\u0000-\u001f]'}}, 'checkpoint-key\n', False),
        ('unanchored control char under not accepts clean value', {'not': {'pattern': '[\u0000-\u001f]'}}, 'checkpoint-key', True),
        ('anchored $ refuses one final LF (ECMA end of input)', {'pattern': '^[^\r\n]+$'}, 'abc\n', False),
        ('anchored hex digest refuses trailing LF', {'pattern': '^[0-9a-f]{64}$'}, 'a' * 64 + '\n', False),
        ('anchored hex digest accepts', {'pattern': '^[0-9a-f]{64}$'}, 'a' * 64, True),
        ('unanchored start: suffix search accepts', {'pattern': '#/owner_result$'}, 'goal:x#/owner_result', True),
        ('unanchored secret-name search refuses under not', {'not': {'pattern': '(^|[._:/-])(raw|password|secret)([._:/-]|$)'}}, 'my.password.ref', False),
        ('ECMA dot excludes U+2028', {'pattern': '^a.b$'}, 'a\u2028b', False),
        ('ECMA \\d is ASCII', {'pattern': '^\\d+$'}, '\u0661\u0662', False),
        ('ECMA \\s includes U+FEFF', {'pattern': '^\\s$'}, '\ufeff', True),
        ('end-of-input idiom (?![\\s\\S]) refuses trailing LF', {'pattern': '^abc(?![\\s\\S])'}, 'abc\n', False),
        ('ECMA empty class matches nothing', {'pattern': 'a[]'}, 'a]', False),
    ]
    rows = []
    for name, schema, value, valid in cases:
        actual = StrictValidator(schema, format_checker=FORMATS).is_valid(value)
        # Contrast: the replaced whole-string fullmatch decision for the same clause.
        inner = schema.get('not', schema)['pattern']
        try:
            legacy = re.fullmatch(inner, value) is not None
            legacy = (not legacy) if 'not' in schema else legacy
        except re.error:
            legacy = 'python_compile_error'
        rows.append(dict(case=name, schema=schema, value=value, expected_valid=valid, actual_valid=actual,
                         legacy_fullmatch_valid=legacy))
    huge = 10 ** 4400 - 1
    for name, schema, value, valid in [
            ('4,400-digit integer refused by not without a rendering crash', {'not': {'type': 'integer'}}, huge, False),
            ('4,400-digit integer refused by enum without a rendering crash', {'enum': [1, 2]}, huge, False),
            ('4,400-digit integer inside an object refused by oneOf', {'oneOf': [{'type': 'string'}, {'type': 'array'}]}, {'n': huge}, False),
            ('4,400-digit integer accepted by an integer type', {'type': 'integer', 'minimum': 0}, huge, True)]:
        try:
            actual = StrictValidator(schema, format_checker=FORMATS).is_valid(value)
        except ValueError as exc:
            actual = 'crash:' + type(exc).__name__
        rows.append(dict(case=name, schema=schema, value='<4400 digits>', expected_valid=valid, actual_valid=actual))
    try:
        ecma_pattern('\\bword')
        boundary = 'compiled'
    except ValueError:
        boundary = 'refused'
    rows.append(dict(case='unsupported word boundary fails closed', expected_valid='refused', actual_valid=boundary))
    ok = all(r['expected_valid'] == r['actual_valid'] for r in rows)
    return dict(status='pass' if ok else 'fail', cases=rows)


def timestamp_roles(schema):
    """The gated inventory's source-role criteria, independent of data values.

    Lane trees use explicit predicates while the global inventory is stale;
    these are the same schema identities/required markers the inventory checks.
    """
    properties=schema.get('properties',{});required=set(schema.get('required',[]))
    identity=properties.get('schema_id',{}).get('const')
    event=identity=='pm.event.v0'or {'event_type','payload_schema_id','replay_policy'}<=required
    storage=(event or identity=='pm.storage_value.event_record_index.v2'
        or {'source_schema_id','producer_semantic_digest','publication_locator'}<=required
        or 'original_storage_fields'in schema.get('x-pm-oracle-id','').split('/')
        or {'first_append_receipt','original_event_value_commitment'}<=required)
    fields={name:dates.STORAGE_UTC_Z for name in ('observed_at_utc','persisted_at_utc')if storage and name in properties}
    if event and 'occurred_at_utc'in properties:fields['occurred_at_utc']=dates.EVENT_RECORD
    return fields



def timestamp_target(schema,resolver):
    # A shared semantic profile and its referenced owner date-time assertion
    # are the same effective clause under this field's profile context.
    target=schema;seen=set()
    while isinstance(target,dict)and '$ref'in target:
        ref=target['$ref']
        if ref in seen:raise ValueError('cyclic timestamp reference')
        seen.add(ref);resolved=resolver.lookup(ref);target=resolved.contents;resolver=resolved.resolver
    return target


def owned_properties(v, properties, instance, schema):
    """Compose shared metadata/source clocks even without an owner format tag.

    All owner keywords still execute. E5-2 acknowledgement remains on the
    broad EventRecord format profile; input field names never choose a role.
    """
    if not v.is_type(instance,'object'):return
    profiles=timestamp_roles(schema)
    disabled=_SCHEMA_CONTEXT.get()[1]
    for name,subschema in properties.items():
        if name not in instance:continue
        profile=profiles.get(name,dates.EVENT_RECORD)
        if name in profiles:
            keyword='format'if v.is_type(instance[name],'string')else'type'
            ident=schema_guard(timestamp_target(subschema,v._resolver),keyword)
            if ident not in disabled:
                try:dates.date_time(instance[name],profile=profile)
                except numbers.Refusal as refusal:
                    error=jsonschema.ValidationError('shared timestamp profile refused',validator=keyword,
                        validator_value='date-time'if keyword=='format'else'string',instance=instance[name],schema=subschema,
                        path=(name,),schema_path=(name,keyword),cause=refusal)
                    error.oracle_guard=ident
                    yield error
        token=DATETIME_PROFILE.set(profile)
        try:yield from v.descend(instance[name],subschema,path=name,schema_path=name)
        finally:DATETIME_PROFILE.reset(token)


_SCHEMA_LOCATIONS = {}
_SCHEMA_ASSERTION_LOCATIONS = {}
_SCHEMA_TYPES = {}
_SCHEMA_DUPLICATES = {}
_SCHEMA_SITES = {}
_INVENTORIED_VALIDATORS = set()
_SCHEMA_VALIDATOR_GUARDS = {}
_SCHEMA_REFUSAL_GUARDS = {}
_SCHEMA_INACTIVE_TYPES = {}
_SCHEMA_REGISTRY_PATHS = []
# C12-GH1: every reached owner assertion keyword is a row (G2), not only type
# assertions and keywords that happened to refuse. Applicators are not rows.
ASSERTION_KEYWORDS = frozenset({'type', 'const', 'enum', 'required', 'additionalProperties', 'unevaluatedProperties',
    'format', 'pattern', 'minLength', 'maxLength', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum',
    'multipleOf', 'minItems', 'maxItems', 'uniqueItems', 'minProperties', 'maxProperties', 'dependentRequired',
    'contains', 'minContains', 'maxContains', 'not', 'oneOf', 'anyOf', 'propertyNames'})
_SCHEMA_VALIDATOR_ASSERTIONS = {}
_SCHEMA_ASSERTION_INFO = {}
# Innermost union (anyOf/oneOf guard) each assertion is reached through, per
# schema path from a validator root (None: reached outside any union), and
# union guards whose alternatives only hold type/minimum/minLength/required
# (schema_guards reports such a union, never an alternative's keyword).
_SCHEMA_UNION_CONTEXTS = {}
_SCHEMA_SIMPLE_UNIONS = set()
_SCHEMA_CONTEXT = contextvars.ContextVar('goal_schema_guards', default=('', frozenset()))


def schema_guard(schema, keyword, *, clause_name=None):
    location = schema.get('x-pm-oracle-id')
    if location is None:
        location = json.dumps(schema, sort_keys=True)
    name = clause_name or ('closed_members' if keyword in ('additionalProperties','unevaluatedProperties') else keyword)
    ident = 'schema/' + hashlib.sha256(location.encode()).hexdigest()[:16] + '/' + name
    _SCHEMA_LOCATIONS[ident] = location + '/' + name
    _SCHEMA_ASSERTION_LOCATIONS.setdefault(ident, set()).add(location + '/' + keyword)
    return ident


def guard_for_location(location):
    node, keyword = location.rsplit('/', 1)
    return schema_guard({'x-pm-oracle-id': node}, keyword)


def schema_type_inventory(v):
    """Walk validation schemas and resolved refs, independently of instance errors.

    Definitions are entered through refs, not by guessing which name is live.
    An `if` subschema selects a branch; its assertions do not reject instances.
    Both validation branches are inventoried, even if no fixture visits them.
    """
    if id(v) in _INVENTORIED_VALIDATORS:
        return
    _INVENTORIED_VALIDATORS.add(id(v))
    visited = set()
    guards = set()
    assertions = set()
    def assertion(schema, key):
        # Applicators (properties, items, allOf, $ref, if/then/else) refuse only
        # through their children; a schema-valued additionalProperties likewise.
        if key in ('additionalProperties', 'unevaluatedProperties'):
            return schema[key] is False
        return key in ASSERTION_KEYWORDS
    def selectors(schema):
        if not isinstance(schema, dict):
            return
        guards.update(schema_guard(schema, key) for key in schema if key in _KEYWORDS)
        for key in ('properties', 'patternProperties'):
            for child in schema.get(key, {}).values(): selectors(child)
        for key in ('not', 'if', 'then', 'else', 'items'):
            selectors(schema.get(key))
        for key in ('allOf', 'anyOf', 'oneOf', 'prefixItems'):
            for child in schema.get(key, []): selectors(child)
    def visit(schema, resolver, empty_domain=None, *, entered=False, union=None):
        if not isinstance(schema, dict):
            return
        if not entered:
            resolver = resolver.in_subresource(Resource.from_contents(schema, default_specification=DRAFT202012))
        location = schema.get('x-pm-oracle-id')
        if location is None:
            location = json.dumps(schema, sort_keys=True)
        if (location, union) in visited:
            return
        visited.add((location, union))
        for key in schema:
            if key in _KEYWORDS and assertion(schema, key):
                _SCHEMA_UNION_CONTEXTS.setdefault(schema_guard(schema, key), set()).add(union)
        if isinstance(schema.get('anyOf'), list) and all(isinstance(branch, dict) and set(branch) - {'x-pm-oracle-id'} <= {'type', 'minimum', 'minLength', 'required'} for branch in schema['anyOf']):
            _SCHEMA_SIMPLE_UNIONS.add(schema_guard(schema, 'anyOf'))
        guards.update(schema_guard(schema, key) for key in schema if key in _KEYWORDS)
        for key in schema:
            if key in _KEYWORDS and assertion(schema, key):
                ident = schema_guard(schema, key)
                assertions.add(ident)
                _SCHEMA_ASSERTION_INFO.setdefault(ident, dict(location=location, keyword=key,
                    value=schema[key] if not isinstance(schema[key], (dict, list)) or key in ('required', 'enum', 'type') else '<subschema>'))
        for field in timestamp_roles(schema):
            target = timestamp_target(schema['properties'][field],resolver)
            for keyword in ('type','format'):
                ident = schema_guard(target, keyword)
                guards.add(ident)
                # The shared profile composed at this field is a real refusal
                # predicate even where the owner node carries no format tag.
                assertions.add(ident)
                _SCHEMA_ASSERTION_INFO.setdefault(ident, dict(location=_SCHEMA_LOCATIONS[ident].rsplit('/',1)[0],
                    keyword=keyword, value='date-time' if keyword=='format' else 'string', shared_profile=field))
        selectors(schema.get('if'))
        if 'type' in schema:
            ident = schema_guard(schema, 'type')
            _SCHEMA_TYPES[ident] = {'location': _SCHEMA_LOCATIONS[ident], 'type': schema['type']}
            if empty_domain is not None:
                _SCHEMA_INACTIVE_TYPES[ident] = {'reason':'items cannot occur in any schema-valid array',
                    'dominating_schema_guard':empty_domain, 'proof':'ancestor maxItems is exactly zero'}
            # Enum/const deliberately also enforce the type at this same node.
            duplicates = {schema_guard(schema, k) for k in ('enum', 'const') if k in schema}
            if duplicates:
                _SCHEMA_DUPLICATES[ident] = frozenset({ident} | duplicates | set(_SCHEMA_DUPLICATES.get(ident, ())))
        if '$ref' in schema:
            resolved = resolver.lookup(schema['$ref'])
            visit(resolved.contents, resolved.resolver, entered=True, union=union)
        for key in ('properties', 'patternProperties', 'dependentSchemas'):
            for child in schema.get(key, {}).values():
                visit(child, resolver, union=union)
        for key in ('items', 'additionalProperties', 'unevaluatedProperties', 'contains', 'propertyNames', 'then', 'else', 'unevaluatedItems', 'additionalItems', 'contentSchema'):
            visit(schema.get(key), resolver, schema_guard(schema, 'maxItems') if key == 'items' and schema.get('maxItems') == 0 else empty_domain, union=union)
        for key in ('allOf', 'prefixItems'):
            for child in schema.get(key, []):
                visit(child, resolver, union=union)
        for key in ('anyOf', 'oneOf'):
            for child in schema.get(key, []):
                visit(child, resolver, union=schema_guard(schema, key))
    visit(v.schema, v._resolver, entered=True)
    # A nullable declaration may be deliberately refined by both branches of
    # a conditional at the same property. Name those exact duplicate type
    # assertions together; never combine constraints on different properties.
    for name, prop in v.schema.get('properties', {}).items():
        branch_types = {schema_guard(branch['properties'][name], 'type')
            for clause in v.schema.get('allOf', []) for branch in (clause.get('then', {}), clause.get('else', {}))
            if 'type' in branch.get('properties', {}).get(name, {})}
        if branch_types:
            for alternative in prop.get('anyOf', []):
                if 'type' in alternative:
                    ident = schema_guard(alternative, 'type')
                    _SCHEMA_DUPLICATES[ident] = frozenset({ident} | branch_types | set(_SCHEMA_DUPLICATES.get(ident, ())))
    _SCHEMA_VALIDATOR_GUARDS[id(v)] = guards
    _SCHEMA_VALIDATOR_ASSERTIONS[id(v)] = assertions - set(_SCHEMA_INACTIVE_TYPES)


def expanded_guards(disabled):
    return set(disabled) | {member for guard in disabled for member in _SCHEMA_DUPLICATES.get(guard, ())}

def _keyword_guard(keyword, function, *, identify=schema_guard):
    def guarded(v, expected, value, schema):
        prefix, disabled = _SCHEMA_CONTEXT.get()
        ident = None
        if disabled:
            ident = identify(schema, keyword)
            if ident in disabled:
                return
        try:
            for error in function(v, expected, value, schema):
                if not hasattr(error, "oracle_guard"):
                    if ident is None:
                        ident = identify(schema, keyword)
                    error.oracle_guard = ident
                yield error
        except ValueError as exc:
            # C12-GH1 (W3-P2 4,400-digit check): stock keywords render
            # repr(instance) only after deciding a failure (not, enum, type,
            # oneOf/anyOf, uniqueItems, minItems...). Python's 4,300-digit
            # rendering limit is not an owner rule: keep the decided refusal,
            # never crash. Nested keywords are guarded separately, so this
            # exception is this keyword's own diagnostic.
            if 'integer string conversion' not in str(exc):
                raise
            error = jsonschema.ValidationError('owner assertion refused; instance not rendered (arbitrary-precision integer)',
                validator=keyword, validator_value=expected, instance=value, schema=schema)
            error.oracle_guard = ident or identify(schema, keyword)
            yield error
    guarded._goal_keyword_source = function
    return guarded

_KEYWORDS = dict(jsonschema.Draft202012Validator.VALIDATORS)
_KEYWORDS['pattern'] = strict_pattern
_KEYWORDS['properties'] = owned_properties
StrictValidator = jsonschema.validators.extend(jsonschema.Draft202012Validator,
    {key:_keyword_guard(key, fn) for key,fn in _KEYWORDS.items()})


def current_type(v, expected, value, schema):
    kinds = [expected] if isinstance(expected, str) else expected
    if 'integer' in kinds and 'number' not in kinds and not (value is None and 'null' in kinds):
        try:
            if schema.get('minimum')==0 and schema.get('maximum')==(1<<64)-1:
                numbers.storage_uint64(value)
            else:
                numbers.current_integer(value)
        except numbers.Refusal:
            yield jsonschema.ValidationError('current integer primitive required')
            return
    yield from _KEYWORDS['type'](v, expected, value, schema)


def numeric_bound(keyword):
    def check(v, expected, value, schema):
        # Keep owner bounds. Never stringify an arbitrary-precision integer in
        # a diagnostic (Python's 4,300-digit rendering limit is not a rule).
        if type(value) is int:
            predicates = {
                'minimum': lambda: value >= expected,
                'maximum': lambda: value <= expected,
                'exclusiveMinimum': lambda: value > expected,
                'exclusiveMaximum': lambda: value < expected,
            }
            if not predicates[keyword]():
                yield jsonschema.ValidationError('owner numeric bound')
            return
        yield from _KEYWORDS[keyword](v, expected, value, schema)
    return check


# Preserve retained numeric grammar while avoiding Python's diagnostic digit cap.
StrictValidator = jsonschema.validators.extend(StrictValidator,
    {key: _keyword_guard(key, numeric_bound(key)) for key in
     ('minimum','maximum','exclusiveMinimum','exclusiveMaximum')})


CurrentValidator = jsonschema.validators.extend(StrictValidator,
    {'type': _keyword_guard('type', current_type),
     **{key: _keyword_guard(key, numeric_bound(key)) for key in
        ('minimum','maximum','exclusiveMinimum','exclusiveMaximum')}})


SOURCE_BINDINGS = {}


def load(path):
    path=Path(path);raw=path.read_bytes()
    key=str(path.relative_to(ROOT))if path.is_relative_to(ROOT)else str(path)
    sha256=hashlib.sha256(raw).hexdigest()
    if key in SOURCE_BINDINGS and SOURCE_BINDINGS[key]!=sha256:
        raise ValueError('source changed during oracle run: '+key)
    SOURCE_BINDINGS[key]=sha256
    return json.loads(raw.decode('utf-8'))


def canonical(value):
    # Preserve historical numeric values, but give equal JSON numbers one form.
    # In particular, integral floats/exponents and negative zero cannot fork a
    # digest. This bounded oracle is not a general RFC 8785 binary64 codec.
    return numbers.qualified_jcs(value)


def current_revision_text(value):
    return str(Decimal(numbers.current_integer(value)))


def revision_text(value):
    """Compatibility fixture formatter; current producers use current_revision_text.

    Keep the untouched ATS-212/213 identity fixture constructors usable while
    their independent current-write numeric sweep is still pending.
    """
    if not retained_integer_number(value):
        raise ValueError('revision must be an integer JSON number')
    return str(Decimal(int(value)))


def current_integer_number(value):
    try:
        numbers.current_integer(value)
        return True
    except numbers.Refusal:
        return False


def integer_number(value):
    """Compatibility alias for existing unswept fixture suites, not new writes."""
    return retained_integer_number(value)


def retained_integer_number(value):
    """The frozen JSON-schema integer grammar; never a current-write choice."""
    return type(value) is int or type(value) is float and value.is_integer()


def same_json_value(left, right):
    # Python equates True with 1, including inside lists/dicts. JSON does not.
    # Full values also carry uint64 metadata that is outside semantic JCS.
    try:
        return numbers.storage_value_bytes(left) == numbers.storage_value_bytes(right)
    except numbers.Refusal:
        return False


def number_codec_checks():
    """Raw JSON spelling vectors exercise the real digest/identity codecs."""
    failures = []
    for spelling, expected in [('1', b'1'), ('1.0', b'1'), ('1e0', b'1'),
                               ('-0', b'0'), ('-0.0', b'0'), ('0', b'0')]:
        value = json.loads(spelling)
        if canonical(value) != expected:
            failures.append('numeric canonical bytes: ' + spelling)
        if canonical({'nested': [value]}) != b'{"nested":[' + expected + b']}':
            failures.append('numeric nested digest bytes: ' + spelling)
        try:
            text = current_revision_text(value)
        except numbers.Refusal as error:
            if type(value) is int or error.reason != 'integer_type':
                failures.append('numeric identity text: ' + spelling)
        else:
            if type(value) is not int or text != expected.decode():
                failures.append('numeric identity text: ' + spelling)
    try:
        json.loads('01')
    except json.JSONDecodeError:
        pass
    else:
        failures.append('invalid JSON number 01 accepted')
    return failures


def sha(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def schema_registry(paths, disabled=(), *, aliases=None):
    """Eagerly resolve every reference, including unused definitions. No network."""
    _SCHEMA_REGISTRY_PATHS[:] = list(paths)
    docs = [load(p) for p in paths]
    by_id = {d["$id"]: d for d in docs}
    by_id.update({uri: load(path) for uri, path in (aliases or {}).items()})
    by_name = {Path(p).name: d for p, d in zip(paths, docs)}
    for doc in docs:
        StrictValidator.check_schema(doc)
        def visit(node, base=None):
            base = doc if base is None else base
            if isinstance(node, dict):
                if "$id" in node: base=node
                if "$ref" in node:
                    uri, fragment = urldefrag(node["$ref"])
                    target = base if not uri else by_id.get(uri, by_name.get(uri))
                    if target is None:
                        raise ValueError(f"unresolved schema resource: {node['$ref']}")
                    if fragment:
                        if not fragment.startswith("/"):
                            raise ValueError(f"unsupported schema anchor: {node['$ref']}")
                        try:
                            for part in unquote(fragment)[1:].split("/"):
                                part = part.replace("~1", "/").replace("~0", "~")
                                target = target[int(part)] if isinstance(target, list) else target[part]
                        except (KeyError, IndexError, ValueError, TypeError) as exc:
                            raise ValueError(f"unresolved schema reference: {node['$ref']}") from exc
                for item in node.values():
                    visit(item,base)
            elif isinstance(node, list):
                for item in node:
                    visit(item,base)
        if "schema/references" not in disabled:visit(doc)
    resources = [(d['$id'], Resource.from_contents(runtime_schema(d), default_specification=DRAFT202012)) for d in docs]
    resources += [(uri, Resource.from_contents(runtime_schema(load(path)), default_specification=DRAFT202012))
                  for uri,path in (aliases or {}).items()]
    return Registry().with_resources(resources)


def runtime_schema(schema, path=None):
    """Annotate schema locations only, never enum/const/default instance data."""
    if not isinstance(schema,dict):return schema
    path=path or schema.get('$id','anonymous')
    out=copy.deepcopy(schema);out.pop('$schema',None);out['x-pm-oracle-id']=path
    for key in ('properties','patternProperties','$defs','definitions','dependentSchemas'):
        if key in out:out[key]={name:runtime_schema(value,path+'/'+key+'/'+name) for name,value in out[key].items()}
    for key in ('items','additionalProperties','unevaluatedProperties','contains','propertyNames','not','if','then','else','unevaluatedItems','additionalItems','contentSchema'):
        if key in out and isinstance(out[key],dict):out[key]=runtime_schema(out[key],path+'/'+key)
    for key in ('allOf','anyOf','oneOf','prefixItems'):
        if key in out:out[key]=[runtime_schema(value,path+'/'+key+'/'+str(i)) for i,value in enumerate(out[key])]
    return out


def validator(schema, registry=None, *, current=False):
    cls = CurrentValidator if current else StrictValidator
    return cls(runtime_schema(schema), registry=registry or Registry(), format_checker=FORMATS)


_SCHEMA_CACHE = {}
def schema_guards(v, value, prefix, disabled=()):
    schema_type_inventory(v)
    _SCHEMA_SITES[(id(v), prefix)] = v
    relevant=frozenset(expanded_guards(disabled)&_SCHEMA_VALIDATOR_GUARDS[id(v)])
    # Cache instance bytes, not the normalized semantic digest: 1 and 1.0 may
    # have different schema/type observations even when their digests agree.
    encoded=pickle.dumps(value, protocol=5)
    key=(id(v),hashlib.sha256(encoded).digest(),prefix,relevant)
    if key in _SCHEMA_CACHE:return set(_SCHEMA_CACHE[key])
    def errors_without(disabled):
        token=_SCHEMA_CONTEXT.set((prefix,frozenset(disabled)))
        try:return list(v.iter_errors(value))
        finally:_SCHEMA_CONTEXT.reset(token)
    errors=errors_without(relevant)
    if not errors:
        _SCHEMA_CACHE[key]=frozenset();return set()
    if relevant:
        # A removal run needs the actual rejection stream, not a second causal
        # search with additional guards disabled. The full validator above ran
        # with exactly the requested guard/set off. Baseline runs below still
        # prove each negative's independently sufficient removal witnesses.
        out={error.oracle_guard for error in errors}
        _SCHEMA_CACHE[key]=frozenset(out)
        return out
    def candidates(error,depth=0):
        for child in error.context:yield from candidates(child,depth+1)
        if hasattr(error,'oracle_guard'):yield (depth,error.oracle_guard)
    # Record every independently sufficient leaf removal. Union alternatives
    # can provide several witnesses for the same one-field defect.
    options=sorted(set(x for e in errors for x in candidates(e)),reverse=True)
    causal=[]
    failing_guards={guard for _,guard in options}
    for depth,guard in options:
        if not errors_without(relevant|{guard}):causal.append((depth,guard))
    for guard, members in _SCHEMA_DUPLICATES.items():
        # A duplicate cut cannot make a *holding* type predicate fail merely
        # because its enum/const companion rejects a same-type value.
        if guard in failing_guards and not errors_without(relevant|members):
            causal.append((1,guard))
    if causal:
        # Composition keywords delegate rejection to their child assertions.
        out={g for _,g in causal if not g.endswith(('/anyOf','/oneOf'))}
        if not out:out={causal[0][1]}
    else:
        out={e.oracle_guard for e in errors}
    # JSON Schema's public validate boundary refuses at its first error. A
    # union's branch types select alternatives; its complete OR is the actual
    # refusal predicate. Keep the owner clauses and report that composed
    # predicate rather than pretending its failed alternatives are independent.
    union_errors=[e for e in errors if e.validator=='anyOf' and all(
        isinstance(branch,dict) and set(branch)-{'x-pm-oracle-id'} <= {'type','minimum','minLength','required'}
        for branch in e.schema.get('anyOf',[]))]
    union_errors += [e for e in errors if e.validator=='anyOf' and e.schema.get('x-pm-oracle-id','').endswith('/$defs/nullable_non_empty_string')]
    union_errors += [e for e in errors if e.validator in ('anyOf','oneOf') and not isinstance(e.instance,dict) and e.context and all(child.validator=='type' and child.validator_value=='object' for child in e.context)]
    # C12-GH1: a composed union replaces only the refusals that are its own
    # alternatives (descendants, plus their declared duplicates). An
    # independent owner assertion that also refuses stays reported: hiding it
    # let a cut of the union row accept a value another clause refuses
    # (goal_run.certified validator_output: property enum and oneOf, lane GC).
    def inside(error):
        found, stack = set(), list(error.context)
        while stack:
            child = stack.pop()
            if hasattr(child, 'oracle_guard'):
                found.add(child.oracle_guard)
            stack.extend(child.context)
        return found | {member for guard in found for member in _SCHEMA_DUPLICATES.get(guard, ())}
    if union_errors:
        union=union_errors[0]
        out=(out-inside(union))|{union.oracle_guard}
    elif not any(name in _SCHEMA_TYPES for name in out):
        composed=[e for e in errors if e.validator=='oneOf']
        if composed:
            out=(out-inside(composed[0]))|{composed[0].oracle_guard}
    _SCHEMA_CACHE[key]=frozenset(out)
    return out


_SEEN_GUARDS = contextvars.ContextVar("goal_seen_guards", default=None)


class Gates:
    def __init__(self, disabled=()):
        self.disabled = set(disabled)
        self.errors = set()

    def require(self, name, condition):
        seen=_SEEN_GUARDS.get()
        if seen is not None:seen.add(name)
        if name not in self.disabled and tables.decide(name, condition) is not None:
            self.errors.add(name)

    def schema(self, v, value, prefix):
        errors = schema_guards(v, value, prefix, self.disabled)
        known = _SCHEMA_REFUSAL_GUARDS.setdefault(id(v),set())
        known.update(errors)
        if tables.COLLECTOR is not None and not errors:
            tables.COLLECTOR.schema_seed(v, value, prefix)
        # C12-GH1 (G2): every inventoried owner assertion keyword of this
        # validator is a row on every call, plus every actual refusal. All owner
        # schema keywords still execute above. Applicator traversal is not a row.
        names = set(_SCHEMA_VALIDATOR_ASSERTIONS.get(id(v), set()))
        names |= known
        refused = tables.schema(names, errors)
        self.errors.update(refused)
        # The decided refusals of this boundary: a caller may stop at a
        # structural precondition only on a decided refusal, so a row cut lets
        # the complete checker continue exactly as if the row were removed.
        return refused


_GUARD_AUDIT_NEGATIVES = ()


def _union_parent(guard):
    """The composed union whose alternative type this guard is, or None."""
    location = _SCHEMA_LOCATIONS.get(guard, '')
    match = re.fullmatch(r'(.*)/(anyOf|oneOf)/\d+/type', location)
    return guard_for_location(match.group(1) + '/' + match.group(2)) if match else None


def _removal_scope(guard):
    """Reported refusal rows that one cut can lawfully weaken (lane GC's fix, adopted by C12-GH1).

    The cut removes the guard's declared duplicate set. schema_guards reports
    an enum/const companion, or the composed union of nullable alternatives,
    as the refusal for those same assertions; a negative refused there is
    therefore related to this cut. No other row is excused.
    """
    members = set(_SCHEMA_DUPLICATES.get(guard, ())) | {guard}
    # C12-GH1: also every union this assertion is reached through by a $ref
    # (schema_type_inventory union contexts), not only a literal anyOf/N/type.
    unions = {u for member in members for u in _SCHEMA_UNION_CONTEXTS.get(member, ()) if u}
    return members | unions | {parent for member in members for parent in (_union_parent(member),) if parent}


def _guard_removal_row(guard):
    """Run one complete mutant in this process, with exactly one disabled id.

    Fork workers inherit the validators and case closures after the baseline.
    Each has its own schema context and reference loader; no process removes a
    second guard except the explicitly recorded duplicate set for this id.
    """
    flips, stays, masked, failures = [], [], [], []
    # A composed union row stands for its alternatives' declared duplicate
    # sets (the conditional refinements of the same alternative types).
    cut = {guard} | {member for alternative, members in _SCHEMA_DUPLICATES.items()
                     if _union_parent(alternative) == guard for member in members}
    for name, evaluate, value, errors in _GUARD_AUDIT_NEGATIVES:
        weakened = evaluate(value, cut)
        if not weakened:
            flips.append(name)
        else:
            stays.append(name)
        if guard in errors and weakened:
            masked.append(name)
        if not (set(errors) & (_removal_scope(guard) | cut)) and not weakened:
            failures.append(f"{guard}: unrelated negative {name} passed")
    if not flips or masked:
        failures.append(f"{guard}: surviving guard mutant; masked={masked}")
    row = {"guard": guard, "schema_location": _SCHEMA_LOCATIONS.get(guard),
           "removed_together": sorted(set(_SCHEMA_DUPLICATES.get(guard, {guard})) | cut),
           "removed_schema_assertions": sorted({location
               for member in _SCHEMA_DUPLICATES.get(guard, {guard})
               for location in _SCHEMA_ASSERTION_LOCATIONS.get(member, ())}),
           "negatives_that_flip": flips,
           "negatives_that_stay_rejected": stays, "masked": masked}
    return row, failures


class Audit:
    """Check negatives and actually rerun the complete corpus with each guard off."""
    def __init__(self):
        self.cases = []
        self.failures = []
        source=Path(inspect.currentframe().f_back.f_code.co_filename)
        self.suite = source.stem
        fixture_path = ROOT / 'Plans/goal_oracle_schema_type_fixtures.json'
        self.explicit_duplicates = []
        if fixture_path.exists():
            self.explicit_duplicates = load(fixture_path).get('suites', {}).get(self.suite, {}).get('duplicate_sets', [])
            for pair in self.explicit_duplicates:
                target = guard_for_location(pair['type_location'])
                members = {target} | {guard_for_location(loc) for loc in pair['duplicate_locations']}
                _SCHEMA_DUPLICATES[target] = frozenset(members | set(_SCHEMA_DUPLICATES.get(target, ())))
        self.literal_guards=set()
        for guard_source in (source, Path(__file__)):
            if not guard_source.is_file():
                continue
            tree=ast.parse(guard_source.read_text())
            self.literal_guards.update(node.args[0].value for node in ast.walk(tree)
                if isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute)
                and node.func.attr=='require' and node.args
                and isinstance(node.args[0],ast.Constant) and isinstance(node.args[0].value,str))
            uses_append = guard_source == source or 'append_result' in source.read_text()
            self.literal_guards.update(node.left.value for node in ast.walk(tree)
                if isinstance(node, ast.Compare) and isinstance(node.left, ast.Constant)
                and isinstance(node.left.value, str) and '/' in node.left.value
                and (uses_append or not node.left.value.startswith('append/'))
                and any(isinstance(rhs, ast.Name) and rhs.id == 'disabled' for rhs in node.comparators))

    def case(self, name, evaluate, value, valid, *, base=None, target=None):
        # target: the row a negative is authored to refuse (C12-GH1 G4), fixed
        # by the source from owner text and the table, never from a result.
        self.cases.append((name, evaluate, copy.deepcopy(value), valid, copy.deepcopy(base), target))

    def run(self):
        if tables.COLLECTOR is not None:
            return tables.COLLECTOR.audit(self)
        self.failures.extend(number_codec_checks())
        paths = list(_SCHEMA_REGISTRY_PATHS)
        if paths:
            original_schema = load(paths[0]); reference_cache = {}
            def references(document, disabled):
                key = (sha(document), 'schema/references' in disabled)
                if key not in reference_cache:
                    original_load = globals()['load']
                    try:
                        globals()['load'] = lambda path: document if Path(path) == Path(paths[0]) else original_load(path)
                        try:
                            schema_registry(paths, disabled); errors = set()
                        except ValueError:
                            errors = {'schema/references'}
                    finally:
                        globals()['load'] = original_load
                    reference_cache[key] = errors
                return reference_cache[key]
            self.case('schema/eager_refs_valid', references, original_schema, True)
            dangling = copy.deepcopy(original_schema)
            dangling.setdefault('$defs', {})['unused_type_audit_dangling_ref'] = {'$ref':'#/$defs/DOES_NOT_EXIST'}
            self.case('schema/eager_refs_unused_dangling', references, dangling, False, base=original_schema)
        # Register schemas from the ordinary cases first; fixture witnesses use
        # exactly these full validators, including their actual ref registry.
        for case in self.cases:
            _, evaluate, value, valid = case[:4]
            if valid:
                evaluate(value, set())
        fixture_path = ROOT / 'Plans/goal_oracle_schema_type_fixtures.json'
        if fixture_path.exists():
            fixtures = load(fixture_path).get('suites', {}).get(self.suite, {})
            for case in fixtures.get('cases', []):
                site = next((v for (_, prefix), v in _SCHEMA_SITES.items() if prefix == case['site']), None)
                if site is None:
                    self.failures.append('unknown schema fixture site: ' + case['site'])
                    continue
                baseline = fixtures['bases'][case['base_id']]
                values = materialize_cases([{'id':'base', 'valid':True, 'input':baseline},
                    {'id':case['id'], 'base_id':'base', 'changes':case['changes'], 'valid':False}])
                def schema_case(value, disabled, v=site, prefix=case['site']):
                    g = Gates(disabled); g.schema(v, value, prefix); return g.errors
                self.case(case['id'], schema_case, values[1]['input'], False, base=baseline)
        negatives = []
        seen=set()
        seen_token=_SEEN_GUARDS.set(seen)
        for case in self.cases:
            name, evaluate, value, valid, base = case[:5]
            errors = evaluate(value, set())
            if bool(errors) == valid:
                self.failures.append(f"{name}: expected valid={valid}, guards={sorted(errors)}")
            if not valid:
                if base is not None and evaluate(base, set()):
                    self.failures.append(f"{name}: negative's baseline is invalid")
                negatives.append((name, evaluate, value, errors))
        _SEEN_GUARDS.reset(seen_token)
        inventory=seen|self.literal_guards|(set(_SCHEMA_TYPES)-set(_SCHEMA_INACTIVE_TYPES))
        actual_schema_guards = set().union(*_SCHEMA_VALIDATOR_GUARDS.values())
        for pair in self.explicit_duplicates:
            target = guard_for_location(pair['type_location'])
            members = {target} | {guard_for_location(loc) for loc in pair['duplicate_locations']}
            if target not in _SCHEMA_TYPES or not members <= actual_schema_guards:
                self.failures.append('unknown actual schema assertion in named duplicate set: ' + pair['type_location'])
        covered={g for _,_,_,errors in negatives for g in errors}
        missing=inventory-covered
        # A nullable alternative's type never refuses first: schema_guards
        # reports the composed union. It is entailed only when that union has
        # its own isolated negative; the gated sweep proves the same relation.
        entailed={g for g in missing if _union_parent(g) in covered
                  or (_SCHEMA_UNION_CONTEXTS.get(g) and None not in _SCHEMA_UNION_CONTEXTS[g]
                      and _SCHEMA_UNION_CONTEXTS[g] <= covered)}
        missing-=entailed
        if missing:self.failures.append("guards without isolated negatives: "+", ".join(sorted(missing)))
        table = []
        guards = sorted(inventory|{g for _, _, _, errors in negatives for g in errors})
        if '--guard-table' in sys.argv:
            print(f'{self.suite}: {len(negatives)} negatives, {len(guards)} guard rows; '
                  f'{len(self.failures)} baseline failures, {len(missing)} unproved guards', file=sys.stderr, flush=True)
        workers = int(os.environ.get('PM_GOAL_AUDIT_WORKERS', '1'))
        if workers < 1:
            raise ValueError('PM_GOAL_AUDIT_WORKERS must be positive')
        global _GUARD_AUDIT_NEGATIVES
        _GUARD_AUDIT_NEGATIVES = negatives
        pool = None
        try:
            if workers > 1:
                pool = multiprocessing.get_context('fork').Pool(workers)
                rows = pool.imap(_guard_removal_row, guards, chunksize=1)
            else:
                rows = map(_guard_removal_row, guards)
            for index, (row, failures) in enumerate(rows):
                if '--guard-table' in sys.argv and index % 25 == 0:
                    print(f'{self.suite}: guard row {index + 1}/{len(guards)}', file=sys.stderr, flush=True)
                table.append(row)
                self.failures.extend(failures)
        finally:
            if pool is not None:
                pool.close()
                pool.join()
            _GUARD_AUDIT_NEGATIVES = ()
        return {"status": "fail" if self.failures else "pass", "cases": len(self.cases),
                "negative_cases": len(negatives), "guard_removal": table, "unproved_guards":sorted(missing),
                "union_entailed_guards": {g: _union_parent(g) or sorted(_SCHEMA_UNION_CONTEXTS.get(g, ())) for g in sorted(entailed)},
                "schema_type_inventory": _SCHEMA_TYPES,
                "inactive_schema_type_guards": _SCHEMA_INACTIVE_TYPES,
                "failures": self.failures, "native_execution": "NOT_RUN"}


SEMANTIC_FIELDS = ("event_type", "scope_kind", "project_id", "thread_id", "run_id", "node_id", "attempt_id",
                   "actor_ref", "requested_account_ref", "effective_account_ref", "occurred_at_utc",
                   "producer_sequence_id", "correlation_id", "causation_event_id", "parent_event_id",
                   "idempotency_key", "payload_schema_id", "payload", "payload_ref", "redaction_profile", "migration")


def semantic_digest(event):
    return numbers.producer_semantic_digest(event)


def append_result(case, disabled=()):
    # Admission/policy always precedes lookup, including an equal-body retry.
    if "append/replay_policy" not in disabled and case["event"]["replay_policy"] == "projector_replay_only":
        return "replay_only_not_appendable"
    if "append/admission" not in disabled and case["admitted"] is not True:
        return "refused_before_dedupe"
    if "append/payload_type" not in disabled and not (case['event']['payload'] is None or isinstance(case['event']['payload'], dict)):
        return 'invalid_payload_type'
    if "append/inline_limit" not in disabled and case['event']['payload'] is not None and len(canonical(case['event']['payload']))>16*1024:
        return 'inline_payload_limit'
    if "append/dedupe_proof" not in disabled and case["proof_available"] is not True:
        return "dedupe_unavailable"
    if case["original"] is None:
        return "append_new"
    return "return_original_receipt" if "append/semantic_body" in disabled or semantic_digest(case["event"]) == semantic_digest(case["original"]) else "idempotency_conflict"


def print_result(result, argv):
    if "--guard-table" in argv:
        path = Path(argv[argv.index("--guard-table") + 1])
        path.write_text(json.dumps(result, indent=2) + "\n")
    small = {k: v for k, v in result.items() if k not in ("guard_removal", "schema_type_inventory")}
    small['schema_type_guards_inventoried'] = len(result.get('schema_type_inventory', {}))
    small["guards_removed"] = len(result["guard_removal"])
    print(json.dumps(small, indent=2))
    return 0 if result["status"] == "pass" else 1


def append_guards(case, disabled=()):
    result=append_result(case,disabled)
    guards={'replay_only_not_appendable':'append/replay_policy',
            'refused_before_dedupe':'append/admission',
            'dedupe_unavailable':'append/dedupe_proof',
            'idempotency_conflict':'append/semantic_body',
            'inline_payload_limit':'append/inline_limit'}
    guards['invalid_payload_type']='append/payload_type'
    return {guards[result]} if result in guards else set()


def materialize_cases(cases):
    """Apply explicit JSON-pointer edits to a prior valid fixture, without IO."""
    by_id={};out=[]
    for case in cases:
        c=copy.deepcopy(case)
        if 'base_id' in c:
            baseline=by_id[c['base_id']]
            if not baseline['valid']:raise ValueError('negative fixture base must be valid')
            value=copy.deepcopy(baseline['input'])
            for edit in c['changes']:
                if edit['path'] == '' and edit['op'] == 'replace':
                    value=copy.deepcopy(edit['value']);continue
                path=[x.replace('~1','/').replace('~0','~') for x in edit['path'].split('/')[1:]]
                parent=value
                for part in path[:-1]:parent=parent[int(part)] if isinstance(parent,list) else parent[part]
                key=int(path[-1]) if isinstance(parent,list) else path[-1]
                if edit['op']=='remove':del parent[key]
                elif edit['op'] in ('add','replace'):parent[key]=copy.deepcopy(edit['value'])
                else:raise ValueError('unknown fixture edit')
            c['input']=value;c['base']=copy.deepcopy(baseline['input'])
        if c['id'] in by_id:raise ValueError('duplicate fixture id: '+c['id'])
        by_id[c['id']]=c;out.append(c)
    return out


def audit_scope_self_test():
    """Standing trials for the private removal audit scope (lane GC's fix) and
    the union attribution (C12-GH1). Synthetic owner-shaped schemas only."""
    global _GUARD_AUDIT_NEGATIVES
    rows = []
    v = validator({'$id': 'c12-selftest-scope', 'type': 'object', 'additionalProperties': False,
                   'properties': {'a': {'type': 'string', 'enum': ['x', 'y']}, 'b': {'type': 'integer'}}})
    def evaluate(value, disabled):
        gate = Gates(disabled); gate.schema(v, value, 'c12-selftest-scope'); return gate.errors
    evaluate({'a': 'x', 'b': 1}, set())
    type_a = guard_for_location('c12-selftest-scope/properties/a/type')
    enum_a = guard_for_location('c12-selftest-scope/properties/a/enum')
    enum_negative = ('enum_companion', evaluate, {'a': 'z', 'b': 1}, evaluate({'a': 'z', 'b': 1}, set()))
    type_negative = ('other_field', evaluate, {'a': 'x', 'b': 's'}, evaluate({'a': 'x', 'b': 's'}, set()))
    def unrelated(value, disabled):
        return set() if type_a in expanded_guards(disabled) else {'selftest/unrelated_row'}
    unrelated_negative = ('unrelated_row', unrelated, {}, {'selftest/unrelated_row'})
    saved = _GUARD_AUDIT_NEGATIVES
    try:
        _GUARD_AUDIT_NEGATIVES = (enum_negative, type_negative)
        _, failures = _guard_removal_row(type_a)
        rows.append(dict(case='enum companion refused negative is related to its type cut',
                         expected='no unrelated failure', actual=failures, ok=not any('unrelated' in f for f in failures)))
        _GUARD_AUDIT_NEGATIVES = (enum_negative, type_negative, unrelated_negative)
        _, failures = _guard_removal_row(type_a)
        rows.append(dict(case='a truly unrelated negative passing under the cut is still reported',
                         expected='unrelated failure', actual=failures,
                         ok=any('unrelated negative unrelated_row passed' in f for f in failures)))
    finally:
        _GUARD_AUDIT_NEGATIVES = saved
    u = validator({'$id': 'c12-selftest-union', 'type': 'object',
                   'properties': {'outcome': {'type': 'string', 'enum': ['passed', 'failed']}, 'evidence_ref': {'type': 'string'}},
                   'oneOf': [{'properties': {'outcome': {'const': 'passed'}}, 'required': ['outcome', 'evidence_ref']},
                             {'properties': {'outcome': {'enum': ['failed']}}, 'required': ['outcome']}]})
    enum_outcome = guard_for_location('c12-selftest-union/properties/outcome/enum')
    one_of = guard_for_location('c12-selftest-union/oneOf')
    both = schema_guards(u, {'outcome': 'neither'}, 'c12-selftest-union')
    rows.append(dict(case='out-of-enum outcome keeps the independent property enum beside the oneOf',
                     expected=sorted({enum_outcome, one_of}), actual=sorted(both), ok=both == {enum_outcome, one_of}))
    branch = schema_guards(u, {'outcome': 'passed'}, 'c12-selftest-union')
    rows.append(dict(case='a branch-only defect is reported as the composed oneOf',
                     expected=[one_of], actual=sorted(branch), ok=branch == {one_of}))
    return dict(status='pass' if all(r['ok'] for r in rows) else 'fail', cases=rows)
