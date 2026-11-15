#!/usr/bin/env python3
"""C12-DCW closure evidence over the unchanged DCW checkers; native execution stays NOT_RUN.

This is DCW's whole-definition Method B adapter (the W3H route the C12 scope
allows), not a replacement validator. Every credited schema mutation is decided
by the real `pm_dcw_event_oracles.check_schema` call at its real site, in the
historical/current mode the complete checker used for that site, and refused by
the real OE001 row with its exact code. The OE001 cut must then accept the
mutation and restoration must refuse it again. A mutation that the real checker
accepts, or that raises anything else, is exported as INVALID and earns no
credit. Clause attribution uses a mirror of check_schema's validator whose
accept/refuse outcome is asserted equal to the real call on every proposal.

Other modes (boundary, retained, joins, datetime, entailments) are in
pm_dcw_c12_boundary.py and pm_dcw_c12_retained.py; this file owns schema sites.
"""
from collections import Counter, defaultdict
from contextlib import contextmanager
import argparse
import copy
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dcw_event_oracles as m
import pm_dcw_guard_rows as guard_rows
import pm_dcw_guard_suites as suites
from referencing import Registry, Resource

FAMILIES = ('bundle.revision_requested', 'bundle.revision_started', 'bundle.revision_completed',
            'bundle.revision_interrupted', 'wizard.opened', 'wizard.deferred_payload.loaded',
            'wizard.blocked', 'wizard.unblocked')
CHECKPOINT = 'Plans/event_record_index_checkpoint.schema.json'
ENVELOPE = 'Plans/event_record.schema.json'
ASSERTIONS = {'type', 'const', 'enum', 'required', 'minLength', 'maxLength', 'pattern', 'format',
              'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
              'minItems', 'maxItems', 'uniqueItems', 'minProperties', 'maxProperties',
              'minContains', 'maxContains', 'dependentRequired'}
# Applicators whose failure is itself a clause (closed objects, branch selection, negation).
APPLICATOR_CLAUSES = {'additionalProperties', 'oneOf', 'anyOf', 'not', 'contains', 'unevaluatedProperties',
                      'unevaluatedItems', 'items', 'prefixItems', 'if', 'allOf', 'dependentSchemas'}
MAPS = {'properties', 'patternProperties', '$defs', 'dependentSchemas'}
LISTS = {'allOf', 'anyOf', 'oneOf', 'prefixItems'}
# `if`, `not` and `contains` subschemas never report their own keywords: their
# outcome is reported by the `then`/`else` arm, by `not` or by `contains`.
SINGLE = {'items', 'then', 'else', 'additionalProperties', 'propertyNames',
          'unevaluatedProperties', 'unevaluatedItems'}
OPAQUE = {'if', 'not', 'contains'}
STORAGE_CLAUSE = ('Plans/event_record.schema.json', '#require_storage_timestamps', 'storage_utc_z')


def rel(path):
    return str(Path(path).resolve().relative_to(ROOT))


SCHEMA_RELS = tuple(rel(p) for p in m.SCHEMAS)


def encoded(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'), default=repr).encode()


def sha(value):
    return hashlib.sha256(encoded(value)).hexdigest()


def pin(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def write(path, value):
    Path(path).write_text(json.dumps(value, indent=1, sort_keys=True, default=repr) + '\n')


def pointer(parts):
    return '/' + '/'.join(str(x).replace('~', '~0').replace('/', '~1') for x in parts) if parts else ''


# ---------------------------------------------------------------- real site capture

CAPTURE = None


def _capturing(original):
    def check_schema(path, value, definition=None):
        snapshot = copy.deepcopy(value)
        historical = m.HISTORICAL.get()
        original(path, value, definition)
        if CAPTURE is not None:
            CAPTURE.append((path, definition, bool(historical), snapshot))
    check_schema.__wrapped__ = original
    return check_schema


@contextmanager
def capture_sites():
    """Record the value at every real check_schema call that accepts.

    The wrapper is installed on the oracle module global, which every DCW
    checker (bundle legacy validator, blockage, registered) calls through.
    """
    global CAPTURE
    original = m.check_schema
    m.check_schema = _capturing(original)
    CAPTURE = []
    try:
        yield CAPTURE
    finally:
        m.check_schema = original
        CAPTURE = None


def accepting_witnesses(family):
    """Authored complete-path inputs: the lane's accepting cases and repairs, plus C12 witnesses.

    A site control is a value the real check_schema accepted at that site; a C12
    witness refused later (for example O234's translated generation) still
    supplies an accepted checkpoint value. Configured or sealed witnesses that
    replace owner documents or store state are not used.
    """
    from itertools import chain
    for w in chain(suites.witnesses(family), suites.p2a_witnesses(family)):
        if w['expected'] == 'accept' and w.get('kind') is None:
            yield w
    for w in suites.c12_witnesses(family):
        if w.get('kind') is None and w.get('row') is not None or w['family'] in ('wizard.blocked', 'wizard.unblocked') and w.get('kind') is None:
            yield w


DISCRIMINATORS = {'kind', 'status', 'state', 'phase', 'event_type', 'replay_policy', 'scope_kind', 'schema_version',
                  'durability_state', 'durability_class', 'representation', 'trigger', 'reason', 'subject_kind',
                  'source_selection_kind', 'media_type', 'publication', 'mode', 'outcome'}
MAX_CONTROLS = 8
PATH_BUDGET = 2


def branch_signature(value, parts=()):
    """Shape, types, nullable arms and discriminator values; list positions collapse."""
    if isinstance(value, dict):
        return tuple(sorted((k, branch_signature(v, parts + (k,))) for k, v in value.items()))
    if isinstance(value, list):
        return ('list', tuple(sorted({repr(branch_signature(v, parts + ('*',))) for v in value})), len(value) == 0)
    key = parts[-1] if parts else None
    if value is None or type(value) is bool or key in DISCRIMINATORS:
        return (type(value).__name__, value)
    return type(value).__name__


def controls_for(family):
    """Authored accepting controls per real site, one per distinct branch signature (at most 8)."""
    sites = defaultdict(list)
    signatures = defaultdict(set)
    count = 0
    for w in accepting_witnesses(family):
        with capture_sites() as captured:
            try:
                outcome = suites.invoke(w)
            except m.Refusal as exc:
                outcome = str(exc)
        assert outcome == w['expected'], (w['id'], outcome)
        count += 1
        for path, definition, historical, value in captured:
            key = (path, definition, historical)
            signature = branch_signature(value)
            if signature in signatures[key] or len(sites[key]) >= MAX_CONTROLS:
                continue
            signatures[key].add(signature)
            sites[key].append(dict(value=value, witness=w['id']))
    return sites, count


# ---------------------------------------------------------------- mirror validator

def mirror(path, definition, historical):
    """check_schema's exact validator construction, on fresh document objects."""
    hist = historical and path != CHECKPOINT
    raw = {p: json.loads((ROOT / p).read_text()) for p in SCHEMA_RELS}
    docs = dict(raw) if hist else {p: m.current_schema(v) for p, v in raw.items()}
    if hist or path.startswith('Plans/dcw/'):
        for p in m.SHARED_SCHEMAS:
            docs[p] = m.frozen_shared(raw[p])
    registry = Registry().with_resources((d['$id'], Resource.from_contents(d)) for d in docs.values())
    root = docs[path] if definition is None else {'$ref': docs[path]['$id'] + '#/$defs/' + definition}
    cls = m.FrozenValidator if hist else m.CurrentValidator
    validator = cls(root, registry=registry, format_checker=m.FORMAT)
    locations = {}
    for p, doc in docs.items():
        for parts, node in walk(doc):
            locations.setdefault(id(node), (p, pointer(parts)))
    return dict(validator=validator, docs=docs, root=root, locations=locations, hist=hist,
                storage=path == ENVELOPE and definition is None)


def walk(value, parts=()):
    if isinstance(value, dict):
        yield parts, value
        for k, v in value.items():
            yield from walk(v, parts + (k,))
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from walk(v, parts + (i,))


def mirror_errors(site, value):
    """(source, pointer, keyword) clauses that refuse `value`, including branch context."""
    found = []

    def flatten(error):
        where = site['locations'].get(id(error.schema), ('?', '?'))
        found.append((where[0], where[1], str(error.validator)))
        for child in error.context or ():
            flatten(child)
    try:
        for error in site['validator'].iter_errors(value):
            flatten(error)
    except m.numbers.Refusal as exc:
        found.append(('?', '?', 'numbers.Refusal:' + exc.reason))
    if site['storage'] and not found and isinstance(value, dict):
        for field in ('observed_at_utc', 'persisted_at_utc'):
            item = value.get(field)
            if isinstance(item, str):
                try:
                    m.event_datetime.date_time(item, profile=m.event_datetime.STORAGE_UTC_Z)
                except m.numbers.Refusal:
                    found.append(STORAGE_CLAUSE)
    return found


def closure(site):
    """Every clause reachable from the site root, following each $ref eagerly once."""
    docs, registry_docs = site['docs'], {d['$id']: p for p, d in site['docs'].items()}
    clauses, visited = [], set()

    def resolve(source, ref):
        from urllib.parse import urldefrag, urljoin, unquote
        base = docs[source]['$id'] if source != '<root>' else docs[site_path]['$id']
        uri, fragment = urldefrag(urljoin(base, ref))
        target = registry_docs[uri] if uri else source
        node = docs[target]
        parts = ()
        for part in fragment.split('/')[1:]:
            part = unquote(part).replace('~1', '/').replace('~0', '~')
            part = int(part) if isinstance(node, list) else part
            node = node[part]
            parts += (part,)
        return target, parts, node

    def visit(source, parts, node):
        key = (source, parts)
        if key in visited or not isinstance(node, dict):
            return
        visited.add(key)
        for keyword in sorted(set(node) & (ASSERTIONS | APPLICATOR_CLAUSES)):
            if keyword == 'additionalProperties' and node[keyword] is not False:
                continue
            if keyword in ('items', 'if', 'allOf', 'prefixItems', 'dependentSchemas'):
                continue
            clauses.append((source, pointer(parts), keyword))
        if '$ref' in node:
            target, tparts, tnode = resolve(source, node['$ref'])
            visit(target, tparts, tnode)
        for k, v in node.items():
            if k in MAPS and k != '$defs' and isinstance(v, dict):
                for name, item in v.items():
                    visit(source, parts + (k, name), item)
            elif k in LISTS and isinstance(v, list):
                for i, item in enumerate(v):
                    visit(source, parts + (k, i), item)
            elif k in SINGLE and isinstance(v, dict):
                visit(source, parts + (k,), v)
    site_path = site['path']
    if site['definition'] is None:
        visit(site_path, (), docs[site_path])
    else:
        visit(site_path, ('$defs', site['definition']), docs[site_path]['$defs'][site['definition']])
    if site['storage']:
        clauses.append(STORAGE_CLAUSE)
    return sorted(set(clauses))


# ---------------------------------------------------------------- proposals

def locations(value, parts=()):
    yield parts, value
    if isinstance(value, dict):
        for key, item in value.items():
            yield from locations(item, parts + (key,))
    elif isinstance(value, list):
        for i, item in enumerate(value):
            yield from locations(item, parts + (i,))


def at(value, parts):
    for part in parts:
        value = value[part]
    return value


def replaced(value, parts, new):
    if not parts:
        return copy.deepcopy(new)
    value = copy.deepcopy(value)
    at(value, parts[:-1])[parts[-1]] = copy.deepcopy(new)
    return value


def removed(value, parts):
    value = copy.deepcopy(value)
    del at(value, parts[:-1])[parts[-1]]
    return value


def proposals(value):
    """Finite data probes; none changes a schema, helper or predicate."""
    yield 'null', None
    yield 'boolean', True
    yield 'integer-negative', -1
    yield 'fraction', 0.5
    yield 'empty-string', ''
    yield 'punctuation', '!'
    yield 'empty-array', []
    yield 'empty-object', {}
    if isinstance(value, str):
        yield 'trailing-lf', value + '\n'
        yield 'nonmatching', '!' * max(1, len(value))
        yield 'long-string', 'x' * 513
        yield 'very-long-string', 'x' * 4097
        yield 'upper', value.upper() if value.upper() != value else value + 'X'
        yield 'truncated', value[:-1]
        if 'T' in value or 't' in value:
            yield 'invalid-hour', '2026-08-07T24:00:00Z'
            yield 'offset', '2026-08-07T00:00:00+00:00'
            yield 'lowercase-z', '2026-08-07T00:00:00z'
    if type(value) is int:
        yield 'above-u64', 18446744073709551616
        yield 'above-safe', 9007199254740992
        yield 'integral-float', float(value)
        yield 'next', value + 1
        if value > 0:
            yield 'zero', 0
    if type(value) is bool:
        yield 'flip', not value
    if isinstance(value, list):
        if value:
            yield 'duplicate-item', value + [copy.deepcopy(value[0])]
            yield 'above-64-items', [copy.deepcopy(value[0]) for _ in range(65)]
        yield 'one-string-item', ['x']


def object_proposals(value):
    if isinstance(value, dict):
        for key in value:
            yield 'missing/' + key, ('remove', key)
        yield 'extra-property', ('add', '__c12_unknown__')


def mutations(control):
    for parts, original in locations(control):
        for label, proposal in proposals(original):
            yield parts, label, replaced(control, parts, proposal)
        for label, (op, key) in object_proposals(original):
            if op == 'remove':
                yield parts + (key,), label, removed(control, parts + (key,))
            else:
                yield parts, label, replaced(control, parts, {**copy.deepcopy(original), key: True})


# ---------------------------------------------------------------- real-boundary outcomes

def real(path, definition, historical, value):
    token = m.HISTORICAL.set(historical)
    try:
        m.check_schema(path, copy.deepcopy(value), definition)
    except m.Refusal as exc:
        return ['refused', getattr(exc, 'guard', None), str(exc)]
    except Exception as exc:  # recorded, never credited
        return ['ERROR', type(exc).__name__, str(exc)[:200]]
    finally:
        m.HISTORICAL.reset(token)
    return ['accepted']


def cut(path, definition, historical, value):
    saved = guard_rows.DISABLED
    guard_rows.DISABLED = saved | {'OE001'}
    try:
        return real(path, definition, historical, value)
    finally:
        guard_rows.DISABLED = saved


EXPECTED = ['refused', 'OE001', 'schema']


def audit_site(family, key, controls, out_rows):
    path, definition, historical = key
    site = mirror(path, definition, historical)
    site.update(path=path, definition=definition)
    inventory = closure(site)
    witnessed = defaultdict(list)
    credited, invalid, parity = [], [], 0
    seen = set()
    budget = Counter()
    for control in controls:
        value = control['value']
        assert real(path, definition, historical, value) == ['accepted'], (family, key, control['witness'])
        assert not mirror_errors(site, value), (family, key, control['witness'], mirror_errors(site, value))
        cid = sha([key, value])
        print('  control', control['witness'], 'credited so far', len(credited), flush=True)
        for parts, label, changed in mutations(value):
            # One probe per structural path and label: repeated list items and
            # repeated controls reach the same subschema, so they add no clause.
            shape = (tuple('*' if type(x) is int and x >= 1 else x for x in parts), label)
            if budget[shape] >= PATH_BUDGET:
                continue
            digest = sha(changed)
            if digest in seen:
                continue
            seen.add(digest)
            budget[shape] += 1
            baseline = real(path, definition, historical, changed)
            clauses = mirror_errors(site, changed)
            parity += baseline[0] != 'ERROR'
            if baseline[0] != 'ERROR' and (baseline == ['accepted']) != (not clauses):
                raise AssertionError(('mirror parity', family, key, parts, label, baseline, clauses))
            item = dict(id=sha([family, key, cid, parts, label]), family=family, schema=path, definition=definition,
                        historical=historical, control=cid, instance_path=list(parts), proposal=label,
                        mutation_sha256=digest, expected=EXPECTED, baseline=baseline)
            if baseline != EXPECTED:
                item['classification'] = 'INVALID_NO_SCHEMA_DEFECT' if baseline == ['accepted'] else 'INVALID_OTHER_OUTCOME'
                invalid.append(item)
                continue
            after_cut = cut(path, definition, historical, changed)
            restored = real(path, definition, historical, changed)
            item.update(cut=after_cut, restored=restored, clauses=sorted(set(clauses)),
                        killed=after_cut == ['accepted'] and restored == EXPECTED)
            if not item['killed']:
                item['classification'] = 'INVALID_CUT_OR_RESTORE'
                invalid.append(item)
                continue
            item['classification'] = 'WHOLE_DEFINITION_OE001'
            credited.append(item)
            for clause in set(clauses):
                if len(witnessed[clause]) < 3:
                    witnessed[clause].append(dict(id=item['id'], changed=changed, solo=len(set(clauses)) == 1))
    targeted_pass(family, key, site, controls, inventory, witnessed, credited, invalid, seen)
    return site, inventory, witnessed, credited, invalid, parity


def clause_node(site, clause):
    source, ptr, _ = clause
    node = site['docs'][source]
    for part in ptr.split('/')[1:]:
        part = part.replace('~1', '/').replace('~0', '~')
        node = node[int(part)] if isinstance(node, list) else node[part]
    return node


def targeted_values(node, keyword):
    """Values aimed at one clause, derived only from that clause's own schema node."""
    value = node.get(keyword)
    if keyword == 'maxLength':
        yield 'x' * (value + 1)
    elif keyword == 'minLength' and value:
        yield 'x' * (value - 1)
    elif keyword == 'maxItems':
        yield ['x'] * (value + 1)
        yield [0] * (value + 1)
    elif keyword == 'minItems' and value:
        yield []
        yield ['x'] * (value - 1)
    elif keyword == 'uniqueItems' and value:
        yield ['x', 'x']
        yield [{'a': 1}, {'a': 1}]
        yield [0, 0]
    elif keyword == 'type':
        types = [value] if isinstance(value, str) else value
        for name, sample in (('string', 'x'), ('integer', 7), ('number', 0.5), ('boolean', True),
                             ('null', None), ('array', []), ('object', {})):
            if name not in types and not (name == 'integer' and 'number' in types):
                yield sample
    elif keyword == 'const':
        yield '__c12_not_const__'
        yield None
    elif keyword == 'enum':
        yield '__c12_not_in_enum__'
    elif keyword == 'pattern':
        for candidate in ('', ' ', '!', 'x', 'X', '0', 'a b', 'x\n', '-', '/', 'Z', 'evt_', 'x' * 65):
            yield candidate
    elif keyword == 'format':
        yield '2026-08-07T24:00:00Z'
        yield 'not-a-value'
    elif keyword in ('minimum', 'exclusiveMinimum'):
        yield value - 1 if isinstance(value, int) else -1
        yield value
    elif keyword in ('maximum', 'exclusiveMaximum'):
        yield value + 1
        yield value
    elif keyword in ('required', 'additionalProperties', 'minProperties', 'maxProperties'):
        yield {}
        yield {'__c12_unknown__': True}
    for item in ('x', 7, None, {}, {'__c12_unknown__': True}):
        yield [item]


def arm_controls(site, clause, control):
    """For a clause inside an if/then arm, the control with that arm's const condition selected.

    The arm's own `if` constants are set on each instance object that carries
    them; nothing else changes. The unchanged control is always included.
    """
    yield control
    source, ptr, _ = clause
    if '/then/' not in ptr:
        return
    parent = ptr[:ptr.rindex('/then/')]
    condition = clause_node(site, (source, parent + '/if', None))
    consts = {k: v['const'] for k, v in condition.get('properties', {}).items() if isinstance(v, dict) and 'const' in v}
    if not consts:
        return
    for parts, original in locations(control):
        if isinstance(original, dict) and set(consts) <= set(original) and any(original[k] != v for k, v in consts.items()):
            yield replaced(control, parts, {**original, **consts})


def instance_suffix(pointer_text):
    """The instance key path a schema pointer validates, from its last $defs entry onward.

    properties/<name> -> name, items/additionalProperties/patternProperties -> any
    key; applicators (allOf, anyOf, oneOf, then, else, $ref targets) add nothing.
    """
    parts = [x.replace('~1', '/').replace('~0', '~') for x in pointer_text.split('/')[1:]]
    if '$defs' in parts:
        last = len(parts) - 1 - parts[::-1].index('$defs')
        parts = parts[last + 2:]
    suffix, i = [], 0
    while i < len(parts):
        part = parts[i]
        if part == 'properties' and i + 1 < len(parts):
            suffix.append(parts[i + 1]); i += 2
        elif part in ('patternProperties',) and i + 1 < len(parts):
            suffix.append(None); i += 2
        elif part in ('items', 'additionalProperties', 'contains', 'prefixItems'):
            suffix.append(None); i += 2 if part == 'prefixItems' else 1
        elif part in ('allOf', 'anyOf', 'oneOf'):
            i += 2
        else:
            i += 1
    return suffix


def matches(parts, suffix):
    if len(parts) < len(suffix):
        return False
    tail = parts[len(parts) - len(suffix):] if suffix else ()
    return all(want is None or want == got for want, got in zip(suffix, tail))


def targeted_mutations(control, node, keyword, suffix=None):
    """Each targeted value at each location the clause can govern, plus as the sole item of empty slots."""
    yield (), 'targeted/arm-control', control
    values = list(targeted_values(node, keyword))
    for parts, original in locations(control):
        if suffix is not None and not (matches(parts, suffix) or matches(parts, suffix[:-1]) and suffix):
            continue
        for value in values:
            yield parts, 'targeted/' + keyword, replaced(control, parts, value)
            if isinstance(original, list) and not original and not isinstance(value, list):
                yield parts, 'targeted-item/' + keyword, replaced(control, parts, [value])
        if keyword == 'maxProperties' and isinstance(original, dict) and original:
            first = next(iter(original))
            grown = dict(original)
            for i in range(node.get('maxProperties', 0) + 1 - len(original)):
                grown[(first[:-6] if len(first) > 6 else first) + '%06x' % (i + 1)] = copy.deepcopy(original[first])
            yield parts, 'targeted/maxProperties', replaced(control, parts, grown)
        if keyword == 'required' and isinstance(original, dict):
            for key in node.get('required', ()):
                if key in original:
                    yield parts + (key,), 'targeted/required', removed(control, parts + (key,))


TARGETED_SCAN = 4000


def targeted_pass(family, key, site, controls, inventory, witnessed, credited, invalid, seen):
    path, definition, historical = key
    for clause in inventory:
        if clause in witnessed or clause == STORAGE_CLAUSE:
            continue
        node = clause_node(site, clause)
        suffix = instance_suffix(clause[1])
        scanned = 0
        for control, armed in ((c, a) for c in controls for a in arm_controls(site, clause, c['value'])):
            cid = sha([key, control['value']])
            for parts, label, changed in targeted_mutations(armed, node, clause[2], suffix):
                scanned += 1
                if scanned > TARGETED_SCAN or clause in witnessed:
                    break
                if clause not in mirror_errors(site, changed):
                    continue
                digest = sha(changed)
                if digest in seen:
                    continue
                seen.add(digest)
                baseline = real(path, definition, historical, changed)
                clauses = mirror_errors(site, changed)
                item = dict(id=sha([family, key, cid, parts, label, digest]), family=family, schema=path,
                            definition=definition, historical=historical, control=cid, instance_path=list(parts),
                            proposal=label, mutation_sha256=digest, expected=EXPECTED, baseline=baseline,
                            target_clause=list(clause))
                if baseline != EXPECTED:
                    item['classification'] = 'INVALID_OTHER_OUTCOME'
                    invalid.append(item)
                    continue
                after_cut = cut(path, definition, historical, changed)
                restored = real(path, definition, historical, changed)
                item.update(cut=after_cut, restored=restored, clauses=sorted(set(clauses)),
                            killed=after_cut == ['accepted'] and restored == EXPECTED)
                if not item['killed']:
                    item['classification'] = 'INVALID_CUT_OR_RESTORE'
                    invalid.append(item)
                    continue
                item['classification'] = 'WHOLE_DEFINITION_OE001_TARGETED'
                credited.append(item)
                for hit in set(clauses):
                    if len(witnessed[hit]) < 3:
                        witnessed[hit].append(dict(id=item['id'], changed=changed, solo=len(set(clauses)) == 1))


def vacuous(site, clause):
    """A clause no JSON value can violate (for example minItems: 0)."""
    node = clause_node(site, clause)
    keyword, value = clause[2], node.get(clause[2])
    return (keyword in ('minItems', 'minLength', 'minProperties') and value == 0) or \
           (keyword == 'uniqueItems' and value is False)


def clause_cut(site, clause, changed):
    """Remove only this keyword at this node and re-validate the witness mutation."""
    source, ptr, keyword = clause
    if clause == STORAGE_CLAUSE:
        return 'isolated' if not [c for c in mirror_errors(dict(site, storage=False), changed)] else 'masked'
    docs = copy.deepcopy(site['docs'])
    node = docs[source]
    for part in [p for p in ptr.split('/')[1:]]:
        part = part.replace('~1', '/').replace('~0', '~')
        node = node[int(part)] if isinstance(node, list) else node[part]
    if keyword not in node:
        return 'not_found'
    del node[keyword]
    registry = Registry().with_resources((d['$id'], Resource.from_contents(d)) for d in docs.values())
    root = docs[site['path']] if site['definition'] is None else {'$ref': docs[site['path']]['$id'] + '#/$defs/' + site['definition']}
    cls = m.FrozenValidator if site['hist'] else m.CurrentValidator
    validator = cls(root, registry=registry, format_checker=m.FORMAT)
    try:
        ok = validator.is_valid(changed)
    except m.numbers.Refusal:
        ok = False
    if ok and site['storage'] and isinstance(changed, dict):
        try:
            m.require_storage_timestamps(changed)
        except m.numbers.Refusal:
            ok = False
    return 'isolated' if ok else 'masked'


def schema_audit(family, out):
    sites, witnesses_run = controls_for(family)
    print(family, 'controls captured from', witnesses_run, 'accepting witnesses at', len(sites), 'sites', flush=True)
    summary = dict(family=family, accepting_witnesses=witnesses_run, sites=[], credited=0, invalid=0,
                   clauses=0, witnessed=0, unwitnessed=0, mirror_parity_checks=0)
    ledger, invalid_all, coverage = [], [], []
    for key in sorted(sites, key=repr):
        controls = sites[key]
        site, inventory, witnessed, credited, invalid, parity = audit_site(family, key, controls, ledger)
        rows = []
        for clause in inventory:
            entry = dict(source=clause[0], schema_pointer=clause[1], keyword=clause[2])
            if clause in witnessed:
                first = witnessed[clause][0]
                entry.update(status='witnessed', witnesses=[w['id'] for w in witnessed[clause]],
                             clause_cut=clause_cut(site, clause, first['changed']),
                             row='OE001', code='schema', row_cut='accepted', restored='refused')
            elif vacuous(site, clause):
                entry.update(status='vacuous', reason='no JSON value violates this keyword value')
            else:
                entry.update(status='unwitnessed')
            rows.append(entry)
        extra = sorted({c for c in witnessed if c not in set(inventory)})
        path, definition, historical = key
        coverage.append(dict(family=family, schema=path, definition=definition, historical=historical,
                             schema_sha256=pin(path), controls=[dict(witness=c['witness'], sha256=sha(c['value'])) for c in controls],
                             clauses=rows, attributed_outside_closure=[list(c) for c in extra],
                             credited=len(credited), invalid=len(invalid), mirror_parity_checks=parity,
                             route='whole-definition Method B at OE001; keyword independence is not claimed'))
        ledger.extend(credited)
        invalid_all.extend(invalid)
        summary['sites'].append(dict(schema=path, definition=definition, historical=historical, controls=len(controls),
                                     credited=len(credited), invalid=len(invalid), clauses=len(rows),
                                     unwitnessed=sum(r['status'] == 'unwitnessed' for r in rows)))
        summary['credited'] += len(credited)
        summary['invalid'] += len(invalid)
        summary['clauses'] += len(rows)
        summary['witnessed'] += sum(r['status'] == 'witnessed' for r in rows)
        summary['unwitnessed'] += sum(r['status'] == 'unwitnessed' for r in rows)
        summary['mirror_parity_checks'] += parity
        print(family, path, definition, historical, len(controls), len(credited), len(invalid),
              sum(r['status'] == 'unwitnessed' for r in rows), flush=True)
    stem = out / family
    write(stem.with_suffix('.schema-coverage.json'), coverage)
    write(stem.with_suffix('.schema-ledger.json'), dict(credited=ledger, invalid=invalid_all))
    return summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', choices=FAMILIES, action='append')
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    summaries = [schema_audit(f, args.out) for f in (args.family or FAMILIES)]
    write(args.out / 'schema-summary.json', dict(status='pass', families=summaries,
          pins={p: pin(p) for p in (*SCHEMA_RELS, 'scripts/pm_dcw_event_oracles.py', 'scripts/pm_dcw_c12.py',
                                    'scripts/pm_dcw_guard_rows.py', 'scripts/pm_guard_isolation.py')},
          native='NOT_RUN', admission='ABSENT'))


if __name__ == '__main__':
    main()
