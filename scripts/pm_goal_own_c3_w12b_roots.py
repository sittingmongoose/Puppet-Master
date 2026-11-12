"""W12b isolated original roots and deterministic schema specimens.

Specimens are shape data, never native issuance or a cancellation success.
The factory does not alter any schema, URI, reference, bank or source hash.
It is deliberately separate from the source/transaction witnesses.
"""
from __future__ import annotations

import copy
import json
from re import _parser as regex_parser, _constants as regex_constants

from pm_goal_own_c_oracles import ROOT, require, Validator, FORMAT
from pm_goal_own_c_roots import digest
from pm_goal_own_c3_w12_bank import selected_bank, ScopedResolverV2, ScopedBankV2

DIRECTORY = ROOT / 'Plans/goal_own_c_contracts/w12-successor-v2'
CANCEL = 'https://puppetmaster.local/schemas/goal_cancel_command_custody/1.0.0/goal_cancel_command_custody.schema.json'
BINDING = 'https://puppetmaster.local/schemas/goal_execution_binding_custody/1.0.0/schema.json'


class Roots:
    def __init__(self):
        self.selection = json.loads((DIRECTORY / 'cancel-methods.v2.json').read_text())
        locations_raw = (ROOT / self.selection['whole_resource_locations']).read_bytes()
        require('w12b/locations_hash', digest(locations_raw) == self.selection['whole_resource_locations_sha256'])
        locations = json.loads(locations_raw)['whole_resource_locations']
        self.banks = {}
        self.selection_rows = {}
        for row in self.selection['resource_selections']:
            raw = (ROOT / row['path']).read_bytes()
            require('w12b/selection_hash/' + row['path'], digest(raw) == row['sha256'])
            declaration = json.loads(raw)
            if row['realm'] is not None:
                declaration = declaration['realms'][row['realm']]
            key = row['realm'] or ('plan' if 'assistant_plan' in row['path'] else 'producer')
            self.banks[key] = selected_bank(declaration, locations, row, self.selection)
            self.selection_rows[key] = copy.deepcopy(row)

    def check(self, realm, ref, value):
        self.banks[realm].validate(ref, value)
        return value

    def make(self, realm, ref, seed=None):
        bank = self.banks[realm]
        resolver = bank.registry.resolver()
        if isinstance(bank, ScopedBankV2):
            resolver = ScopedResolverV2(resolver, bank)
        value = specimen({'$ref': ref}, resolver, seed)
        self.check(realm, ref, value)
        return value


def _join(left, right):
    """Construct conjunctions for fixtures; validation uses the original schema."""
    result = copy.deepcopy(left)
    for key, value in right.items():
        if key in ('properties', 'patternProperties', '$defs'):
            result.setdefault(key, {})
            for name, child in value.items():
                result[key][name] = _join(result[key].get(name, {}), child)
        elif key == 'required':
            result[key] = list(dict.fromkeys(result.get(key, []) + value))
        elif key in ('allOf',):
            result[key] = result.get(key, []) + copy.deepcopy(value)
        elif key in ('minLength', 'minItems', 'minimum', 'exclusiveMinimum', 'minProperties'):
            result[key] = max(result.get(key, value), value)
        elif key in ('maxLength', 'maxItems', 'maximum', 'exclusiveMaximum', 'maxProperties'):
            result[key] = min(result.get(key, value), value)
        elif key == 'type' and key in result:
            left_types = result[key] if isinstance(result[key], list) else [result[key]]
            right_types = value if isinstance(value, list) else [value]
            overlap = [t for t in left_types if t in right_types]
            if not overlap:
                raise ValueError('uninhabitable specimen type conjunction')
            result[key] = overlap[0] if len(overlap) == 1 else overlap
        else:
            result[key] = copy.deepcopy(value)
    return result


def _regex_sample(pattern):
    def walk(tokens):
        value = ''
        for op, arg in tokens:
            if op is regex_constants.LITERAL:
                value += chr(arg)
            elif op is regex_constants.IN:
                for kind, item in arg:
                    if kind is regex_constants.LITERAL:
                        value += chr(item); break
                    if kind is regex_constants.RANGE:
                        value += chr(item[0]); break
                    if kind is regex_constants.CATEGORY:
                        value += '0' if item is regex_constants.CATEGORY_DIGIT else 'a'; break
            elif op in (regex_constants.MAX_REPEAT, regex_constants.MIN_REPEAT):
                value += walk(arg[2]) * arg[0]
            elif op is regex_constants.SUBPATTERN:
                value += walk(arg[-1])
            elif op is regex_constants.BRANCH:
                value += walk(arg[1][0])
            elif op is regex_constants.ANY:
                value += 'a'
            elif op is regex_constants.CATEGORY:
                value += '0' if arg is regex_constants.CATEGORY_DIGIT else 'a'
            elif op in (regex_constants.ASSERT, regex_constants.ASSERT_NOT):
                pass  # the unmodified original validator checks the assertion
            elif op is not regex_constants.AT:
                raise ValueError('unsupported specimen regex token ' + str(op))
        return value
    return walk(regex_parser.parse(pattern))


def specimen(schema, resolver, seed=None, depth=0):
    """Construct a full structural specimen, checking every selected constraint.

    This is not a validator, authority provider, product codec, or proof engine.
    Seeds are complete/partial fixtures, not caller-owned source authority.
    """
    if depth > 80:
        raise ValueError('recursive specimen requires an explicit finite seed')
    if schema is True:
        return copy.deepcopy(seed)
    if schema is False:
        raise ValueError('uninhabitable specimen')
    schema = copy.deepcopy(schema)
    if '$id' in schema:
        from referencing import Resource
        from referencing.jsonschema import DRAFT202012
        resolver = resolver.in_subresource(Resource.from_contents(schema, default_specification=DRAFT202012))
    if '$ref' in schema:
        hit = resolver.lookup(schema.pop('$ref'))
        if not schema:
            return specimen(hit.contents, hit.resolver, seed, depth + 1)
        # Sibling constraints retain their original base URI. In particular a
        # local UI OwnerIdentity reference must not be resolved in full-thread.
        local = specimen(schema, resolver, seed, depth + 1)
        base = specimen(hit.contents, hit.resolver, _overlay(local, seed), depth + 1)
        return specimen(schema, resolver, base, depth + 1)
    references, conditions = [], []
    for child in schema.pop('allOf', []):
        if '$ref' in child:
            references.append(child)
        elif 'if' in child:
            conditions.append(child)
        else:
            schema = _join(schema, child)
    if references:
        # Apply the local restrictions first, so an allOf's Project constraint
        # selects the original Project arm rather than default application/null.
        value = specimen(schema, resolver, seed, depth + 1)
        for child in references:
            value = specimen(child, resolver, value, depth + 1)
        value = specimen(schema, resolver, value, depth + 1)
        for condition in conditions:
            branch = condition.get('then' if Validator(condition['if'], _resolver=resolver, format_checker=FORMAT).is_valid(value) else 'else', {})
            if branch:
                value = specimen(_join(schema, branch), resolver, value, depth + 1)
        return value
    for keyword in ('oneOf', 'anyOf'):
        if keyword in schema:
            branches = schema.pop(keyword)
            errors = []
            # A supplied seed chooses a valid arm. Otherwise prefer finite null.
            if seed is None:
                branches = sorted(branches, key=lambda x: x.get('type') != 'null')
            for branch in branches:
                if type(seed) is dict and any(
                    name in seed and 'const' in child and not (
                        type(seed[name]) is type(child['const']) and seed[name] == child['const'])
                    for name, child in branch.get('properties', {}).items()):
                    continue
                if seed is not None and branch.get('type') == 'null':
                    continue
                try:
                    result = specimen(_join(schema, branch), resolver, seed, depth + 1)
                    if seed is not None and not _extends_seed(result, seed):
                        continue
                    complete = _join(schema, {keyword: branches})
                    if not list(Validator(complete, _resolver=resolver, format_checker=FORMAT).iter_errors(result)):
                        return result
                except (ValueError, RecursionError, KeyError) as error:
                    errors.append(str(error)[:160])
            raise ValueError('no finite specimen arm: ' + repr(errors[:3]))
    if 'const' in schema:
        return copy.deepcopy(schema['const'])
    if 'enum' in schema:
        return copy.deepcopy(seed if any(type(seed) is type(v) and seed == v for v in schema['enum']) else schema['enum'][0])
    kind = schema.get('type')
    if isinstance(kind, list):
        kind = 'null' if 'null' in kind and seed is None else next(k for k in kind if k != 'null')
    if kind is None:
        kind = 'object' if 'properties' in schema or 'required' in schema else ('array' if 'items' in schema else None)
    if kind == 'object':
        result = copy.deepcopy(seed) if type(seed) is dict else {}
        properties = schema.get('properties', {})
        if schema.get('additionalProperties') is False:
            result = {k: v for k, v in result.items() if k in properties}
        for key in dict.fromkeys(schema.get('required', []) + list(result)):
            result[key] = specimen(properties.get(key, schema.get('additionalProperties', {})), resolver, result.get(key), depth + 1)
        for condition in conditions:
            branch = condition.get('then' if Validator(condition['if'], _resolver=resolver, format_checker=FORMAT).is_valid(result) else 'else', {})
            if branch:
                result = specimen(_join(schema, branch), resolver, result, depth + 1)
        if 'if' in schema:
            test = Validator(schema['if'], _resolver=resolver, format_checker=FORMAT)
            branch = schema.get('then' if test.is_valid(result) else 'else', {})
            if branch:
                other = {k: v for k, v in schema.items() if k not in ('if', 'then', 'else')}
                return specimen(_join(other, branch), resolver, result, depth + 1)
        return result
    if kind == 'array':
        count = max(len(seed) if type(seed) is list else 0, schema.get('minItems', 0))
        if 'maxItems' in schema:
            count = min(count, schema['maxItems'])
        return [specimen(schema.get('prefixItems', [])[i] if i < len(schema.get('prefixItems', [])) else schema.get('items', {}), resolver,
                         seed[i] if type(seed) is list and i < len(seed) else None, depth + 1) for i in range(count)]
    if kind == 'null':
        return None
    if kind == 'boolean':
        return seed if type(seed) is bool else False
    if kind in ('integer', 'number'):
        value = seed if type(seed) is int else schema.get('minimum', 0)
        value = max(value, schema.get('minimum', value))
        if 'exclusiveMinimum' in schema:
            value = max(value, schema['exclusiveMinimum'] + 1)
        if 'maximum' in schema:
            value = min(value, schema['maximum'])
        return value
    if kind == 'string':
        candidates = [seed] if type(seed) is str else []
        if schema.get('format') == 'date-time':
            candidates.append('2026-11-05T00:00:00Z')
        if schema.get('format') == 'uuid':
            candidates.append('11111111-1111-4111-8111-111111111111')
        if schema.get('format') in ('uri', 'uri-reference'):
            candidates.append('https://puppetmaster.local/test-only/w12b')
        if 'pattern' in schema:
            candidates.append(_regex_sample(schema['pattern']))
        candidates += ['x' * max(1, schema.get('minLength', 0)), '']
        for value in candidates:
            if len(value) < schema.get('minLength', 0):
                value += '0' * (schema['minLength'] - len(value))
            if not list(Validator(schema, _resolver=resolver, format_checker=FORMAT).iter_errors(value)):
                return value
        raise ValueError('string specimen needs explicit seed: ' + repr(schema))
    return copy.deepcopy(seed)


def _overlay(value, seed):
    if type(value) is dict and type(seed) is dict:
        return {**value, **{k: _overlay(value.get(k), v) for k, v in seed.items()}}
    return copy.deepcopy(seed if seed is not None else value)


def _extends_seed(value, seed):
    if type(seed) is dict:
        return type(value) is dict and all(k in value and _extends_seed(value[k], v) for k, v in seed.items())
    if type(seed) is list:
        return type(value) is list and len(value) >= len(seed) and all(_extends_seed(a, b) for a, b in zip(value, seed))
    return type(value) is type(seed) and value == seed
