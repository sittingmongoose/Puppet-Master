"""DR criterion-12 closure over the unmodified DR checker (pm-runtime-artifact-event-drafts.py).

A witness builder and ledger writer, never a second oracle. Every acceptance
and refusal is the original checker's: its TableValidator rows for schema
occurrences, its complete routes (decode, AppendModel.append,
full_value_matches, checkpoint_matches, resolve_history, observation_admissible)
for boundaries. The table rows remain the gated Method B rows; this module only
records which row refused first (the checker's RECORDER), cuts that one row in
the complete checker, and restores it.

Credit rules (C12-RUN quality bar):
- A schema clause witness names its target keyword and expected row BEFORE it
  is evaluated. It counts only when the whole occurrence validator refuses at
  exactly that row with that code AND every structural error sits at the target
  keyword, instance location and source-hashed rule (isolation). Anything else
  is INVALID and listed separately with no credit.
- A complete-boundary kill needs the exact expected first refusal, acceptance
  (or a named later refusal, which is never a kill) with only that row cut, and
  the same exact refusal after restoration.
- No owner schema keyword is dropped: the occurrence validators are the
  checker's own, built from the unchanged owner documents.
"""
import copy
import hashlib
import json
import re
from urllib.parse import unquote, urldefrag, urljoin

import pm_runtime_artifact_guard_suites as suites

dr = suites.dr

ASSERTIONS = frozenset((
    'type', 'const', 'enum', 'required', 'minLength', 'maxLength', 'pattern', 'format', 'minimum', 'maximum',
    'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems', 'minProperties',
    'maxProperties', 'dependentRequired', 'minContains', 'maxContains'))
APPLICATORS = frozenset((
    'properties', 'patternProperties', 'additionalProperties', 'items', 'prefixItems', 'contains', 'propertyNames',
    'allOf', 'anyOf', 'oneOf', 'not', 'if', 'then', 'else', '$ref', 'dependentSchemas', 'unevaluatedProperties',
    'unevaluatedItems'))
ANNOTATIONS = frozenset(('$schema', '$id', 'title', 'description', '$comment', 'default', 'examples', '$defs',
                         'deprecated', 'readOnly', 'writeOnly', '$anchor', 'contentMediaType', 'contentEncoding'))
SCHEMA_ROW = 'schema.case'
ROW_CODES = {'S07_structural': 'schema_structural', 'S08_date_time': 'schema_date_time',
             'S02_identifier_fullmatch': 'schema_identifier_fullmatch',
             'S04_identifier_key_fullmatch': 'schema_identifier_key_fullmatch',
             'N01_integer_slots': 'schema_integer_slot', 'S03_provider_hash_overlay': 'schema_provider_hash'}


def fingerprint(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), default=repr).encode()).hexdigest()


def esc(key):
    return str(key).replace('~', '~0').replace('/', '~1')


def unesc(token):
    return token.replace('~1', '/').replace('~0', '~')


def resolve_pointer(document, pointer):
    node = document
    for token in pointer.split('/')[1:] if pointer else []:
        token = unesc(token)
        node = node[int(token)] if isinstance(node, list) else node[token]
    return node


class Graph:
    """Reachable schema graph of one occurrence root, through the checker's own registry.

    Nodes are (document, JSON pointer) locations of the unchanged owner
    documents. $ref targets resolve with SchemaReferences' local registry; a
    reference that leaves the local registry is recorded, never fetched.
    """
    def __init__(self, references):
        self.references = references
        self.unresolved = []

    def doc_uri(self, doc):
        schema = self.references.documents[doc]
        return urljoin((dr.ROOT / doc).as_uri(), schema.get('$id', '')) if schema.get('$id') else (dr.ROOT / doc).as_uri()

    def target(self, doc, ref):
        if ref.startswith('#'):
            fragment = unquote(ref[1:])
            if fragment and not fragment.startswith('/'):
                self.unresolved.append(dict(document=doc, ref=ref))
                return None
            return doc, fragment
        uri = urljoin(self.doc_uri(doc), ref)
        base, fragment = urldefrag(uri)
        owner = self.references.owners.get(base)
        if owner is None and ref.startswith('#'):
            owner = doc
        if owner is None or (fragment and not fragment.startswith('/')):
            self.unresolved.append(dict(document=doc, ref=ref))
            return None
        return owner, fragment

    def walk(self, doc, pointer, instance=(), stack=(), branches=(), mode='assert'):
        """Yield every reachable node with its instance pattern.

        branches: the anyOf/oneOf ancestors (node, branch index, instance pattern)
        that report a child's error as their own. mode is 'condition' under an
        'if' (selects a branch, never refuses) and 'negated' under a 'not'.
        """
        node = resolve_pointer(self.references.documents[doc], pointer)
        entry = dict(document=doc, pointer=pointer, instance=instance, node=node, branches=branches, mode=mode)
        if (doc, pointer) in stack:
            yield dict(entry, cycle=True)
            return
        yield dict(entry, cycle=False)
        if not isinstance(node, dict):
            return
        here = stack + ((doc, pointer),)

        def go(d, p, inst, br=branches, md=mode):
            return self.walk(d, p, inst, here, br, md)
        for key, child in node.items():
            at = pointer + '/' + esc(key)
            if key == 'properties':
                for name in child:
                    yield from go(doc, at + '/' + esc(name), instance + (name,))
            elif key == 'patternProperties':
                for pattern in child:
                    yield from go(doc, at + '/' + esc(pattern), instance + ('~' + pattern,))
            elif key in ('additionalProperties', 'unevaluatedProperties') and isinstance(child, dict):
                yield from go(doc, at, instance + ('*',))
            elif key in ('items', 'contains', 'unevaluatedItems') and isinstance(child, dict):
                yield from go(doc, at, instance + ('[]',))
            elif key == 'prefixItems':
                for i in range(len(child)):
                    yield from go(doc, at + '/' + str(i), instance + (i,))
            elif key == 'propertyNames' and isinstance(child, dict):
                yield from go(doc, at, instance + ('<name>',))
            elif key == 'allOf':
                for i in range(len(child)):
                    yield from go(doc, at + '/' + str(i), instance)
            elif key in ('anyOf', 'oneOf'):
                for i in range(len(child)):
                    yield from go(doc, at + '/' + str(i), instance, branches + ((node, key, i, instance),))
            elif key == 'if' and isinstance(child, dict):
                yield from go(doc, at, instance, md='condition')
            elif key == 'not' and isinstance(child, dict):
                yield from go(doc, at, instance, md='negated')
            elif key in ('then', 'else') and isinstance(child, dict):
                yield from go(doc, at, instance)
            elif key == 'dependentSchemas':
                for name in child:
                    yield from go(doc, at + '/' + esc(name), instance)
            elif key == '$ref' and isinstance(child, str):
                target = self.target(doc, child)
                if target is not None:
                    yield from go(target[0], target[1], instance)


def unreachable_defs(references, doc, reached):
    """Document $defs no occurrence root reaches: walked by S01 preflight only, never by validation."""
    schema = references.documents[doc]
    return sorted('/$defs/' + esc(k) for k in schema.get('$defs', {})
                  if not any(p == '/$defs/' + esc(k) or p.startswith('/$defs/' + esc(k) + '/') for d, p in reached if d == doc))


def locations(value, pattern, path=()):
    """Concrete instance paths in a seed that match one schema instance pattern."""
    if not pattern:
        yield path, value
        return
    head, rest = pattern[0], pattern[1:]
    if head == '[]':
        if type(value) is list:
            for i, item in enumerate(value):
                yield from locations(item, rest, path + (i,))
    elif head == '*':
        if type(value) is dict:
            for key, item in value.items():
                yield from locations(item, rest, path + (key,))
    elif head == '<name>':
        return
    elif type(head) is int:
        if type(value) is list and head < len(value):
            yield from locations(value[head], rest, path + (head,))
    elif head.startswith('~'):
        if type(value) is dict:
            for key, item in value.items():
                if re.search(head[1:], key):
                    yield from locations(item, rest, path + (key,))
    elif type(value) is dict and head in value:
        yield from locations(value[head], rest, path + (head,))


def value_at(value, path):
    for key in path:
        value = value[key]
    return value


def set_at(value, path, replacement):
    value = copy.deepcopy(value)
    if not path:
        return replacement
    node = value
    for key in path[:-1]:
        node = node[key]
    node[path[-1]] = replacement
    return value


def other_type_value(allowed):
    allowed = set(allowed if isinstance(allowed, list) else [allowed])
    if 'number' in allowed:
        allowed.add('integer')
    for kind, value in (('object', {}), ('array', []), ('string', 'c12'), ('boolean', True), ('null', None), ('integer', 7)):
        if kind not in allowed:
            return kind, value
    return None, None


def foreign_scalar(value):
    if type(value) is bool:
        return not value
    if type(value) is int:
        return value + 1
    if type(value) is float:
        return value + 1.5
    if value is None:
        return 'c12-not-null'
    if type(value) is str:
        return value + '-c12'
    if type(value) is list:
        return value + ['c12']
    return dict(value, c12_member=True)


def proposals(keyword, rule, value):
    """Directed single-site proposals: (target keyword, label, expected row, new value). Named before evaluation."""
    out = []
    if keyword == 'type':
        kind, bad = other_type_value(rule['type'])
        if kind is not None:
            out.append(('type', 'wrong_' + kind, 'S07_structural', bad))
        allowed = rule['type'] if isinstance(rule['type'], list) else [rule['type']]
        if 'integer' in allowed and 'number' not in allowed and type(value) is int:
            out.append(('type', 'integral_float', 'N01_integer_slots', float(value)))
    elif keyword == 'const':
        out.append(('const', 'other_value', 'S07_structural', foreign_scalar(rule['const'])))
    elif keyword == 'enum':
        literals = rule['enum']
        if all(type(x) is str for x in literals):
            out.append(('enum', 'outside_enum', 'S07_structural', 'c12-outside-enum'))
        elif all(type(x) is int for x in literals):
            out.append(('enum', 'outside_enum', 'S07_structural', max(literals) + 1))
        else:
            out.append(('enum', 'outside_enum', 'S07_structural', foreign_scalar(value)))
    elif keyword == 'required' and type(value) is dict:
        for name in rule['required']:
            if name in value:
                changed = dict(value)
                del changed[name]
                out.append(('required', 'missing/' + name, 'S07_structural', changed))
    elif keyword == 'additionalProperties' and rule['additionalProperties'] is False and type(value) is dict:
        out.append(('additionalProperties', 'extra_property', 'S07_structural', dict(value, c12_unexpected=True)))
    elif keyword == 'minLength' and type(value) is str and rule['minLength'] > 0:
        out.append(('minLength', 'below_minimum', 'S07_structural', value[:rule['minLength'] - 1]))
    elif keyword == 'maxLength' and type(value) is str and rule['maxLength'] < 100000:
        n = rule['maxLength'] + 1 - len(value)
        out.append(('maxLength', 'above_maximum', 'S07_structural', value + (value[-1:] or 'x') * max(1, n)))
    elif keyword == 'pattern' and type(value) is str:
        pattern = rule['pattern']
        if pattern.startswith('^') and pattern.endswith('$'):
            out.append(('pattern', 'trailing_lf', 'S02_identifier_fullmatch', value + '\n'))
        for foreign in ('!', ' ', 'Z', '0'):
            candidate = foreign + value[1:] if value else foreign
            if not re.search(pattern, candidate):
                out.append(('pattern', 'same_length_foreign_' + repr(foreign), 'S07_structural', candidate))
                break
    elif keyword == 'format' and type(value) is str:
        if rule['format'] == 'date-time':
            for label, candidate in (('hour_24', value[:11] + '24' + value[13:] if len(value) > 13 else None),
                                     ('february_30', '2026-02-30' + value[10:] if len(value) > 10 else None),
                                     ('not_a_date', 'not-a-date')):
                if candidate is not None:
                    out.append(('format', 'date_time_' + label, 'S08_date_time', candidate))
        elif rule['format'] == 'uuid':
            out.append(('format', 'uuid_non_hex', 'S07_structural', 'g' + value[1:] if value else 'g'))
    elif keyword in ('minimum', 'exclusiveMinimum') and type(value) in (int, float) and type(value) is not bool:
        bound = rule[keyword]
        out.append((keyword, 'adjacent_below', 'S07_structural', bound - 1 if keyword == 'minimum' else bound))
    elif keyword in ('maximum', 'exclusiveMaximum') and type(value) in (int, float) and type(value) is not bool:
        bound = rule[keyword]
        out.append((keyword, 'adjacent_above', 'S07_structural', bound + 1 if keyword == 'maximum' else bound))
    elif keyword == 'minItems' and type(value) is list and rule['minItems'] > 0:
        out.append(('minItems', 'too_few_items', 'S07_structural', value[:rule['minItems'] - 1]))
    elif keyword == 'maxItems' and type(value) is list and value:
        out.append(('maxItems', 'too_many_items', 'S07_structural', value + [copy.deepcopy(value[-1])] * (rule['maxItems'] + 1 - len(value))))
    elif keyword == 'uniqueItems' and rule['uniqueItems'] and type(value) is list and value:
        out.append(('uniqueItems', 'duplicate_item', 'S07_structural', value + [copy.deepcopy(value[0])]))
    elif keyword == 'minProperties' and type(value) is dict and rule['minProperties'] > 0:
        out.append(('minProperties', 'too_few_properties', 'S07_structural', {}))
    elif keyword == 'dependentRequired' and type(value) is dict:
        for name, needed in rule['dependentRequired'].items():
            if name in value:
                for other in needed:
                    if other in value:
                        changed = dict(value)
                        del changed[other]
                        out.append(('dependentRequired', 'missing_dependent/' + other, 'S07_structural', changed))
    elif keyword in ('anyOf', 'oneOf'):
        for label, candidate in (('object', {}), ('array', []), ('string', 'c12-foreign'), ('boolean', True),
                                 ('integer', -7), ('null', None)):
            out.append((keyword, 'no_branch_' + label, 'S07_structural', candidate))
    elif keyword == 'contains' and type(value) is list:
        out.append(('contains', 'no_contained_item', 'S07_structural', []))
    elif keyword == 'patternProperties' and type(value) is dict:
        for pattern in rule['patternProperties']:
            if pattern.startswith('^') and pattern.endswith('$'):
                for key in value:
                    if re.fullmatch(pattern, key):
                        changed = {(k + '\n' if k == key else k): v for k, v in value.items()}
                        out.append(('patternProperties', 'key_trailing_lf', 'S04_identifier_key_fullmatch', changed))
                        break
    elif keyword == 'not' and type(value) is dict and isinstance(rule['not'], dict) and 'required' in rule['not']:
        out.append(('not', 'forbidden_members', 'S07_structural', dict(value, **{k: 'c12' for k in rule['not']['required']})))
    elif keyword == 'propertyNames' and type(value) is dict:
        out.append(('propertyNames', 'foreign_name', 'S07_structural', dict(value, **{'C12 foreign name\n': True})))
    return out


def structural_isolated(tv, instance, keyword, location, node, branches=()):
    """All stock errors sit at the target keyword, instance location and source-hashed rule.

    Inside exactly one anyOf/oneOf the validator reports the child's error as
    the parent's: then the only top-level error must be that parent at its
    location, and the selected branch's sub-errors must all be the target.
    """
    with dr.exact_digits():
        errors = list(tv.structural.iter_errors(instance))
    pin = fingerprint(node)

    def at_target(e):
        return e.validator == keyword and tuple(e.absolute_path) == location and fingerprint(e.schema) == pin
    if not branches:
        return bool(errors) and all(at_target(e) for e in errors), len(errors)
    if len(branches) != 1:
        return False, len(errors)
    parent, applicator, index, _ = branches[0]
    if len(errors) != 1:
        return False, len(errors)
    e = errors[0]
    if e.validator != applicator or fingerprint(e.schema) != fingerprint(parent) or not location[:len(e.absolute_path)] == tuple(e.absolute_path):
        return False, 1
    chosen = [c for c in e.context if c.relative_schema_path and c.relative_schema_path[0] == index]
    return bool(chosen) and all(at_target(c) for c in chosen), 1


def overlay_isolated(validator_, instance, keyword, location):
    with dr.exact_digits():
        errors = list(validator_.iter_errors(instance))
    return bool(errors) and all(e.validator == keyword and tuple(e.absolute_path) == location for e in errors), len(errors)


def isolated(tv, instance, keyword, expected, location, node, branches=()):
    if expected == 'S07_structural':
        return structural_isolated(tv, instance, keyword, location, node, branches)
    if expected == 'S08_date_time':
        return overlay_isolated(tv.datetime, instance, 'format', location)
    if expected == 'S02_identifier_fullmatch':
        return overlay_isolated(tv.lf_value, instance, 'pattern', location)
    if expected == 'S04_identifier_key_fullmatch':
        return overlay_isolated(tv.lf_key, instance, 'patternProperties', location)
    if expected == 'N01_integer_slots':
        return overlay_isolated(tv.integer_slot, instance, 'type', location)
    if expected == 'S03_provider_hash_overlay':
        return overlay_isolated(tv.overlay, instance, keyword, location)
    return False, 0


def predicate_for(keyword, rule):
    """The checker row(s) enforcing one keyword site (schema.case table, sweep part 2A/2B)."""
    if keyword == 'format' and rule.get('format') == 'date-time':
        return ['S08_date_time']
    rows = ['S07_structural']
    if keyword == 'pattern' and str(rule.get('pattern', '')).startswith('^') and str(rule.get('pattern', '')).endswith('$'):
        rows.append('S02_identifier_fullmatch')
    if keyword == 'patternProperties':
        rows.append('S04_identifier_key_fullmatch')
    if keyword == 'type' and 'integer' in (rule['type'] if isinstance(rule['type'], list) else [rule['type']]):
        rows.append('N01_integer_slots')
    return rows


def first_refusal(records):
    return next(([phase, *refusal] for phase, _, refusal in records if refusal is not None), None)


def run_route(route):
    """(result, first table refusal, records) of one complete route under the checker's RECORDER."""
    dr.RECORDER = records = []
    try:
        try:
            result = route()
        except dr.TableRefusal as refusal:
            result = 'refused:' + refusal.phase + ':' + refusal.row
        except (ValueError, KeyError, TypeError, UnicodeError, OverflowError, AttributeError, IndexError, AssertionError) as error:
            result = 'exception:' + type(error).__name__
    finally:
        dr.RECORDER = None
    return result, first_refusal(records), records


def accepted_result(result):
    return result not in (False, None, 'invalid', 'unavailable', 'withdrawn', 'idempotency_conflict', 'identity_conflict',
                          'replay_only_not_appendable') and not (type(result) is str and result.startswith(('refused:', 'exception:')))


def cut_and_restore(route, phase, row, expected):
    """Cut exactly one row in the complete checker, rerun, restore, rerun."""
    entries = dr.table_rows(phase)
    dr._TABLE_ROWS[phase] = [(n, (lambda value, context: None) if n == row else p, c) for n, p, c in entries]
    try:
        result, refusal, _ = run_route(route)
    finally:
        dr._TABLE_ROWS[phase] = entries
    cut = 'accepted' if accepted_result(result) and refusal is None else (
        'refused_later:' + ':'.join(refusal[:2]) if refusal else 'refused_later:untracked:' + str(result))
    restored_result, restored, _ = run_route(route)
    return cut, restored == expected and not accepted_result(restored_result)


def store_digest(store):
    def encode(value):
        if type(value) is bytes:
            return {'$bytes': value.hex()}
        if type(value) is dict:
            return {k: encode(v) for k, v in value.items()}
        if type(value) in (list, tuple):
            return [encode(v) for v in value]
        if type(value) is float:
            return {'$float': value.hex()}
        if type(value) is int and type(value) is not bool:
            return {'$int': str(value)}
        return value
    with dr.exact_digits():
        return hashlib.sha256(json.dumps(encode(store), sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def receipt_count(value):
    if type(value) is dict:
        return sum(1 for k in value if k == 'first_append_receipt') + sum(receipt_count(v) for v in value.values())
    if type(value) is list:
        return sum(receipt_count(v) for v in value)
    return 0


GENERIC_STRINGS = ('x', 'abc', 'fixture-id', 'fixture-project', 'artifact:x', '2026-07-02T00:00:00Z',
                   '11111111-1111-4111-8111-111111111111', '0' * 64, 'sha256:' + '0' * 64, 'blake3:' + '0' * 64,
                   'pm.x.v1', '1.0.0', 'ra1:' + '0' * 64, 'https://example.invalid/x', 'a' * 8)


def candidate_values(rule):
    values = []
    if 'const' in rule:
        values.append(rule['const'])
    values += list(rule.get('enum', []))
    for key in ('minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum'):
        n = rule.get(key)
        if type(n) in (int, float):
            values += [n, n + 1, n - 1]
    for key in ('minLength', 'maxLength'):
        n = rule.get(key)
        if type(n) is int and n < 10000:
            values.append('x' * n)
    pattern = rule.get('pattern')
    if type(pattern) is str:
        # Simple literal-prefix + fixed hex/digit run patterns (e.g. ^eig_[0-9a-f]{64}$): one matching string.
        match = re.fullmatch(r'\^([A-Za-z0-9_:.~-]*)\[0-9a-f\]\{(\d+)\}\$', pattern)
        if match:
            values.append(match.group(1) + '0' * int(match.group(2)))
    values += [None, False, True, 0, 1, 7, 64, 0.5, *GENERIC_STRINGS, [], {}]
    return values


def representative(validator_, rule, depth=0):
    """A locally valid control for one rule body (construction only; the stock validator decides)."""
    if depth > 12 or not isinstance(rule, dict):
        return None, False
    local = validator_.evolve(schema=rule)
    for value in candidate_values(rule):
        if local.is_valid(value):
            return copy.deepcopy(value), True
    if '$ref' in rule:
        try:
            target = validator_._resolver.lookup(rule['$ref']).contents
        except Exception:  # an unresolvable reference has no local control
            return None, False
        value, ok = representative(validator_, target, depth + 1)
        if ok and local.is_valid(value):
            return value, True
    for key in ('anyOf', 'oneOf', 'allOf'):
        for branch in rule.get(key, []):
            value, ok = representative(validator_, branch, depth + 1)
            if ok and local.is_valid(value):
                return value, True
            if ok and key == 'allOf' and type(value) is dict:
                # Overlay the sibling branches' property literals (e.g. a $ref body plus a const selector).
                merged = dict(value)
                for other in rule['allOf']:
                    for name, child in (other.get('properties') or {}).items() if isinstance(other, dict) else ():
                        if isinstance(child, dict) and 'const' in child:
                            merged[name] = copy.deepcopy(child['const'])
                if local.is_valid(merged):
                    return merged, True
    kind = rule.get('type')
    kinds = kind if isinstance(kind, list) else [kind]
    if 'object' in kinds or 'properties' in rule or 'required' in rule:
        value = {}
        for name in rule.get('required', []):
            child, _ = representative(validator_, rule.get('properties', {}).get(name, {}), depth + 1)
            value[name] = child
        if local.is_valid(value):
            return value, True
    if 'array' in kinds or 'items' in rule:
        child, ok = representative(validator_, rule.get('items', {}), depth + 1)
        value = [child] * max(1, rule.get('minItems', 0)) if ok else []
        if local.is_valid(value):
            return value, True
    return None, False


def local_isolated(validator_, rule, instance, keyword):
    local = validator_.evolve(schema=rule)
    with dr.exact_digits():
        errors = list(local.iter_errors(instance))
    pin = fingerprint(rule)
    return bool(errors) and all(e.validator == keyword and tuple(e.absolute_path) == () and fingerprint(e.schema) == pin
                                for e in errors), len(errors)
