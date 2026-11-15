#!/usr/bin/env python3
"""PNC-019 C12-GC: schema clause closure for every whole-definition row of DG-OWN-A and DG-OWN-B.

For each owner definition root that a checker row validates (the exact validator object the complete call used,
pm_goal_gc_adapter.validator: every keyword, owner formats, shared date-time profiles, CV-1100 current integers,
ECMA patterns), every reachable assertion clause gets one class:

  KILLED          a valid control and a single-field defect at the clause's own instance location: the definition
                  refuses and reports the clause; with only that clause cut it ACCEPTS; restored, it refuses again;
  COVERED_LATER   the clause is reported, but with it cut a named other clause of the same definition still
                  refuses (that clause is named); no kill credit;
  UNREACHABLE     a checked proof that no valid instance reaches the clause (the proof kind and its check);
  UNCOVERED       none of the above.

Controls are the accepted boundary instances the suites' complete calls produced, plus generated branch controls
(optional members, array items, anyOf/oneOf alternatives, forced if/then and if/else conditions), each accepted by
the whole definition. Clauses inside an `if` (a selector, never a refusal) and inside a `not` (the `not` keyword is
the assertion) are listed apart, not counted as assertion clauses. The clause cut uses the validator's own
per-keyword disable context (pm_goal_oracle_common._SCHEMA_CONTEXT); nothing is edited. Schema-boundary controls
and witnesses earn no lifecycle or row credit; the rows themselves are gated-proved by scripts/pm-goal-gc-guard-tables.py.

Usage: python3 scripts/pm-goal-gc-schema-closure.py --out FILE [--source own_a|own_b]...
       python3 scripts/pm-goal-gc-schema-closure.py --self-test
"""
import argparse
import collections
import copy
import hashlib
import importlib.util
import itertools
import json
import pickle
import re
import re._constants as C
import re._parser as P
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_goal_gc_adapter as adapter  # noqa: E402
import pm_goal_oracle_common as common  # noqa: E402

ASSERT = {'type', 'enum', 'const', 'required', 'minLength', 'maxLength', 'pattern', 'format', 'minimum', 'maximum',
          'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems', 'minProperties',
          'maxProperties', 'dependentRequired', 'anyOf', 'oneOf', 'not', 'contains'}
SEED_CAP = 24


# ---------------------------------------------------------------- example strings for a pattern

def _gen_tokens(tokens, choice):
    out = []
    for op, av in tokens:
        if op is C.LITERAL:
            out.append(chr(av))
        elif op is C.NOT_LITERAL:
            out.append('a' if av != ord('a') else 'b')
        elif op is C.ANY:
            out.append('a')
        elif op is C.IN:
            out.append(_gen_class(av, choice))
        elif op in (C.MAX_REPEAT, C.MIN_REPEAT):
            low, high, sub = av
            count = low if low > 0 or choice == 0 else 1
            out.append(''.join(_gen_tokens(sub, choice) for _ in range(count)))
        elif op is C.SUBPATTERN:
            out.append(_gen_tokens(av[3], choice))
        elif op is C.BRANCH:
            alts = av[1]
            out.append(_gen_tokens(alts[min(choice, len(alts) - 1)], choice))
        elif op in (C.AT, C.ASSERT, C.ASSERT_NOT, C.GROUPREF):
            continue
        else:
            out.append('a')
    return ''.join(out)


def _gen_class(items, choice):
    negate = any(op is C.NEGATE for op, _ in items)
    members = [(op, av) for op, av in items if op is not C.NEGATE]
    def contains(ch):
        for op, av in members:
            if op is C.LITERAL and ord(ch) == av:
                return True
            if op is C.RANGE and av[0] <= ord(ch) <= av[1]:
                return True
            if op is C.CATEGORY and re.fullmatch({C.CATEGORY_DIGIT: r'\d', C.CATEGORY_NOT_DIGIT: r'\D', C.CATEGORY_WORD: r'\w',
                                                 C.CATEGORY_NOT_WORD: r'\W', C.CATEGORY_SPACE: r'\s',
                                                 C.CATEGORY_NOT_SPACE: r'\S'}.get(av, r'(?!)'), ch):
                return True
        return False
    pool = ['a', 'b', '0', '1', 'f', 'A', 'z', '-', '_', ':', '.', ' ', 'x', '9', '/']
    if negate:
        pool = [c for c in pool if not contains(c)]
    else:
        pool = [c for c in pool if contains(c)] or [chr(av[0]) for op, av in members if op is C.RANGE] + \
               [chr(av) for op, av in members if op is C.LITERAL]
    return pool[min(choice, len(pool) - 1)] if pool else 'a'


def pattern_examples(pattern):
    try:
        parsed = P.parse(pattern)
    except Exception:  # noqa: BLE001
        return []
    out = []
    for choice in range(3):
        text = _gen_tokens(list(parsed), choice)
        if adapter.ecma_pattern(pattern).search(text) and text not in out:
            out.append(text)
    return out


# ---------------------------------------------------------------- schema walk

def deref(node, resolver, seen=None):
    seen = seen or set()
    while isinstance(node, dict) and '$ref' in node and len(node) <= 2:  # {$ref, x-pm-oracle-id}
        if node['$ref'] in seen:
            break
        seen.add(node['$ref'])
        resolved = resolver.lookup(node['$ref'])
        node, resolver = resolved.contents, resolved.resolver
    return node, resolver


def ctx_key(entry):
    """A reach's context entry by its owner node, not only (kind, instance depth, index).

    Shared origin: lane GO found this defect in this file at c0482747da (pm-mail 1115152853-9ecb) and fixed its own
    copy, scripts/pm_goal_go_schema_closure.py, at eb10b969cf; this is the same key (GC2 port). Keyed by
    (kind, depth, index) alone, a node reached through two different conditionals (or unions) at the same depth kept
    only its first reach, with that reach's steps, owners and empty domain; every class that quantifies over all of a
    clause's reaches (the empty-domain UNREACHABLE, SELECTOR_OR_NEGATED) then read an incomplete list. GO's second
    part, pins scoped to the branches a reach also takes, has no counterpart here: this tool keeps no value pins.
    The owner stays alive in the reach list, so its id is never reused during a walk."""
    return (entry[0], entry[1], entry[2], id(entry[3]))


def walk(v):
    """Every schema node with: the instance path patterns that reach it and the conditions on the way."""
    nodes = {}
    def visit(node, resolver, ipath, ctx, steps, depth, obj=None, empty=None):
        if not isinstance(node, dict) or depth > 40:
            return
        location = node.get('x-pm-oracle-id', json.dumps(node, sort_keys=True))
        key = (location, ipath, tuple(ctx_key(c) for c in ctx))  # GC2: owner node in the key (shared with GO eb10b969cf)
        if key in seen:
            return
        seen.add(key)
        if 'properties' in node:
            obj = (node, resolver)
        nodes.setdefault(location, dict(node=node, resolver=resolver, reach=[]))['reach'].append(
            dict(ipath=ipath, ctx=ctx, steps=steps, obj=obj, empty_domain=empty))
        if '$ref' in node:
            resolved = resolver.lookup(node['$ref'])
            visit(resolved.contents, resolved.resolver, ipath, ctx, steps, depth + 1, obj, empty)
        for name, sub in node.get('properties', {}).items():
            visit(sub, resolver, ipath + (name,), ctx, steps + ((name, sub, resolver),), depth + 1, None, empty)
        for key2 in ('additionalProperties', 'unevaluatedProperties'):
            if isinstance(node.get(key2), dict):
                visit(node[key2], resolver, ipath + ('*',), ctx, steps + (('*', node[key2], resolver),), depth + 1, None, empty)
        for sub in node.get('patternProperties', {}).values():
            visit(sub, resolver, ipath + ('*',), ctx, steps + (('*', sub, resolver),), depth + 1, None, empty)
        inner_empty = empty or (location if node.get('maxItems') == 0 else None)
        if isinstance(node.get('items'), dict):
            visit(node['items'], resolver, ipath + ('#',), ctx, steps + (('#', node['items'], resolver),), depth + 1, None, inner_empty)
        for index, sub in enumerate(node.get('prefixItems', [])):
            visit(sub, resolver, ipath + (index,), ctx, steps + ((index, sub, resolver),), depth + 1, None, inner_empty)
        for sub in node.get('allOf', []):
            visit(sub, resolver, ipath, ctx, steps, depth + 1, obj, empty)
        for word in ('anyOf', 'oneOf'):
            for index, sub in enumerate(node.get(word, [])):
                visit(sub, resolver, ipath, ctx + ((word, len(ipath), index, node, resolver, obj),), steps, depth + 1, None, empty)
        if isinstance(node.get('if'), dict):
            visit(node['if'], resolver, ipath, ctx + (('if', len(ipath), 0, node, resolver, obj),), steps, depth + 1, obj, empty)
            for branch in ('then', 'else'):
                if isinstance(node.get(branch), dict):
                    visit(node[branch], resolver, ipath, ctx + ((branch, len(ipath), 0, node, resolver, obj),), steps, depth + 1, obj, empty)
        if isinstance(node.get('not'), dict):
            visit(node['not'], resolver, ipath, ctx + (('not', len(ipath), 0, node, resolver, obj),), steps, depth + 1, obj, empty)
        if isinstance(node.get('contains'), dict):
            visit(node['contains'], resolver, ipath + ('#',), ctx + (('contains', len(ipath), 0, node, resolver, obj),), steps, depth + 1, None, empty)
    seen = set()
    visit(v.schema, v._resolver, (), (), (), 0)
    return nodes


def conditionals(obj_node, resolver):
    """Every if/then/else member of an object definition (the node itself and its allOf members)."""
    out = []
    for sub in [obj_node] + [deref(x, resolver)[0] for x in obj_node.get('allOf', [])]:
        if isinstance(sub, dict) and isinstance(sub.get('if'), dict):
            out.append(sub)
    return out


def apply_conditionals(target, obj, keep=()):
    """Make the object's other members satisfy each conditional branch its current values select."""
    if obj is None or CURRENT[0] is None or not isinstance(target, dict):
        return
    obj_node, resolver = obj
    props = obj_node.get('properties', {})
    for _ in range(2):
        for member in conditionals(obj_node, resolver):
            condition = deref(member['if'], resolver)[0]
            branch = member.get('then') if holds(CURRENT[0], condition, target) else member.get('else')
            if not isinstance(branch, dict):
                continue
            branch = deref(branch, resolver)[0]
            for k, extra in branch.get('properties', {}).items():
                if k in keep or not (k in target or k in branch.get('required', [])):
                    continue
                extra = deref(extra, resolver)[0]
                if holds(CURRENT[0], extra, target.get(k)):
                    continue
                base = deref(props.get(k, {}), resolver)[0]
                merged = {**{a: b for a, b in base.items() if a not in ('anyOf', 'oneOf')}, **extra}
                target[k] = gen(merged, resolver, 0)


def clauses_of(node):
    out = []
    for keyword in node:
        if keyword in ASSERT:
            out.append(keyword)
        elif keyword in ('additionalProperties', 'unevaluatedProperties') and node[keyword] is False:
            out.append(keyword)
    return out


def name_of(keyword):
    return 'closed_members' if keyword in ('additionalProperties', 'unevaluatedProperties') else keyword


# ---------------------------------------------------------------- values

FORMATS = {'date-time': '2026-11-05T00:00:00Z', 'uuid': '00000000-0000-4000-8000-000000000001', 'date': '2026-11-05',
           'uri': 'urn:gc:1', 'uri-reference': 'urn:gc:1', 'email': 'gc@example.com'}


def gen(node, resolver, depth=0, variant=0):
    node, resolver = deref(node, resolver)
    if not isinstance(node, dict) or depth > 14:
        return None
    if '$ref' in node:
        resolved = resolver.lookup(node['$ref'])
        base = gen(resolved.contents, resolved.resolver, depth + 1, variant)
        rest = {k: v for k, v in node.items() if k != '$ref'}
        if isinstance(base, dict) and rest.get('properties'):
            return {**base, **gen(dict(rest, type='object'), resolver, depth + 1, variant)}
        return base
    if 'const' in node:
        return copy.deepcopy(node['const'])
    if 'enum' in node:
        choices = [x for x in node['enum'] if x is not None] or node['enum']
        return copy.deepcopy(choices[min(variant, len(choices) - 1)])
    for word in ('anyOf', 'oneOf'):
        if node.get(word):
            branches = node[word]
            order = sorted(range(len(branches)), key=lambda i: deref(branches[i], resolver)[0].get('type') == 'null')
            return gen(branches[order[min(variant, len(order) - 1)]], resolver, depth + 1, 0)
    kinds = node.get('type')
    if isinstance(kinds, list):
        kinds = next((k for k in kinds if k != 'null'), kinds[0])
    props, required = dict(node.get('properties', {})), list(node.get('required', []))
    for sub in node.get('allOf', []):
        sub, _ = deref(sub, resolver)
        props.update(sub.get('properties', {}))
        required += [r for r in sub.get('required', []) if r not in required]
        kinds = kinds or sub.get('type')
    if kinds is None and (props or required):
        kinds = 'object'
    if kinds == 'object':
        obj = {k: gen(props.get(k, {}), resolver, depth + 1) for k in required}
        # Apply the object's own conditionals, so generated sub-objects satisfy their if/then/else.
        for sub in [node] + [deref(x, resolver)[0] for x in node.get('allOf', [])]:
            members = [sub] if 'if' in sub else [deref(x, resolver)[0] for x in sub.get('allOf', []) if 'if' in deref(x, resolver)[0]]
            for member in members:
                if 'if' not in member or CURRENT[0] is None:
                    continue
                condition = deref(member['if'], resolver)[0]
                branch = member.get('then') if holds(CURRENT[0], condition, obj) else member.get('else')
                if not isinstance(branch, dict):
                    continue
                branch = deref(branch, resolver)[0]
                for k, extra in branch.get('properties', {}).items():
                    if k in obj or k in branch.get('required', []):
                        base = deref(props.get(k, {}), resolver)[0]
                        merged = {**{a: b for a, b in base.items() if a not in ('anyOf', 'oneOf')}, **deref(extra, resolver)[0]}
                        obj[k] = gen(merged, resolver, depth + 1)
        return obj
    if kinds == 'array':
        item = node.get('items', {})
        count = max(node.get('minItems', 0), 1 if variant else 0)
        values = []
        for i in range(count):
            value = gen(item, resolver, depth + 1, i)
            if isinstance(value, str) and value in values:
                value = value + str(i)
            values.append(value)
        return values
    if kinds == 'string':
        if node.get('format') in FORMATS:
            text = FORMATS[node['format']]
        elif 'pattern' in node:
            examples = pattern_examples(node['pattern'])
            text = examples[min(variant, len(examples) - 1)] if examples else 'gc'
        else:
            text = 'gc' + (str(variant) if variant else '')
        low, high = node.get('minLength', 0), node.get('maxLength')
        if len(text) < low:
            text = text + text[-1:] * (low - len(text)) if text else 'a' * low
        if high is not None and len(text) > high:
            text = text[:high]
        return text
    if kinds in ('integer', 'number'):
        low = node.get('minimum', node.get('exclusiveMinimum', -1) + 1 if 'exclusiveMinimum' in node else 0)
        return int(low) + variant
    if kinds == 'boolean':
        return bool(variant == 0)
    if kinds == 'null':
        return None
    return 'gc'


def get(value, path):
    for part in path:
        value = value[part]
    return value


def put(value, path, new):
    if not path:
        return new
    parent = get(value, path[:-1])
    parent[path[-1]] = new
    return value


def concrete(value, ipath, prefix=()):
    """Concrete paths in value matching a pattern ('#' any index, '*' any key)."""
    if not ipath:
        yield prefix
        return
    head, rest = ipath[0], ipath[1:]
    if head == '#':
        if isinstance(value, list):
            for index, item in enumerate(value[:3]):
                yield from concrete(item, rest, prefix + (index,))
    elif head == '*':
        if isinstance(value, dict):
            for key in list(value)[:3]:
                yield from concrete(value[key], rest, prefix + (key,))
    elif isinstance(head, int):
        if isinstance(value, list) and len(value) > head:
            yield from concrete(value[head], rest, prefix + (head,))
    elif isinstance(value, dict) and head in value:
        yield from concrete(value[head], rest, prefix + (head,))


CURRENT = [None]  # the root validator of the definition being closed (for conditional generation)


def holds(v, node, value):
    try:
        return not any(True for _ in v.evolve(schema=node).iter_errors(value))
    except Exception:  # noqa: BLE001
        return False


def realize(control, reach, variant, v=None):
    """A branch control: create the missing members on the way and force the conditions on the way."""
    value = copy.deepcopy(control)
    path = ()
    steps = reach['steps']
    for number, (segment, child, resolver) in enumerate(steps):
        here = get(value, path)
        last = number == len(steps) - 1
        # A step that must hold a container on the way down is (re)built from the non-null alternative.
        if segment == '#':
            if not isinstance(here, list):
                return None, None
            if not here:
                here.append(gen(child, resolver, 0, 0))
            path += (0,)
        elif segment == '*':
            if not isinstance(here, dict):
                return None, None
            if not here:
                here['gc_key'] = gen(child, resolver, 0, 0)
            path += (next(iter(here)),)
        elif isinstance(segment, int):
            if not isinstance(here, list) or len(here) <= segment:
                return None, None
            path += (segment,)
        else:
            if not isinstance(here, dict):
                return None, None
            if segment not in here or (not last and here[segment] is None) or (last and variant >= 2 and here[segment] is None):
                here[segment] = gen(child, resolver, 0, 0)
            path += (segment,)
    for kind, depth, index, owner, resolver, obj in reach['ctx']:
        at = path[:depth]
        target = get(value, at)
        if kind in ('anyOf', 'oneOf'):
            branch, branch_resolver = deref(owner[kind][index], resolver)
            if variant % 2 == 1 or not isinstance(target, dict):
                value = put(value, at, gen(branch, branch_resolver, 0, variant // 2))
        elif kind in ('then', 'else') and isinstance(target, dict):
            condition, _ = deref(owner['if'], resolver)
            obj_node = obj[0] if obj else owner
            forced = set()
            for prop, sub in condition.get('properties', {}).items():
                sub, _ = deref(sub, resolver)
                forced.add(prop)
                base, base_resolver = deref(obj_node.get('properties', {}).get(prop, {}), resolver)
                allowed = sub.get('enum', [sub['const']] if 'const' in sub else None)
                if kind == 'then':
                    if allowed is not None:
                        target[prop] = copy.deepcopy(allowed[min(variant, len(allowed) - 1)])
                    elif v is None or not holds(v, sub, target.get(prop)):
                        merged = {**{k: x for k, x in base.items() if k not in ('anyOf', 'oneOf')}, **sub}
                        if 'type' not in merged and base.get('anyOf'):
                            merged['type'] = sub.get('type', 'null')
                        target[prop] = gen(merged, base_resolver, 0, variant % 2)
                else:
                    candidates = [x for x in base.get('enum', []) if allowed is None or x not in allowed]
                    candidates += [gen(base, base_resolver, 0, k) for k in range(3)]
                    if v is not None:
                        candidates = [x for x in candidates if not holds(v, sub, x)]
                    if candidates:
                        target[prop] = copy.deepcopy(candidates[min(variant, len(candidates) - 1)])
            branch, branch_resolver = deref(owner[kind], resolver)
            for prop, sub in branch.get('properties', {}).items():
                if prop in target or prop in branch.get('required', []):
                    if variant >= 2 or prop not in target or (v is not None and not holds(v, deref(sub, resolver)[0], target.get(prop))):
                        base = deref(obj_node.get('properties', {}).get(prop, {}), resolver)[0]
                        merged = {**{a: b for a, b in base.items() if a not in ('anyOf', 'oneOf')}, **deref(sub, branch_resolver)[0]}
                        target[prop] = gen(merged, branch_resolver, 0, variant % 2)
                    forced.add(prop)
            apply_conditionals(target, obj or (owner, resolver), keep=forced)
    return value, path


def repair(v, value, path, parents):
    """An invalid branch control: switch one enum member of the enclosing object and re-apply its conditionals,
    keeping the realized member."""
    if not path:
        return None
    parent_path, member = path[:-1], path[-1]
    for obj_node, resolver in parents:
        for k, sub in obj_node.get('properties', {}).items():
            sub = deref(sub, resolver)[0]
            choices = sub.get('enum', [])[:8]
            for choice in choices:
                candidate = copy.deepcopy(value)
                try:
                    target = get(candidate, parent_path)
                except (KeyError, IndexError, TypeError):
                    return None
                if not isinstance(target, dict) or k == member or target.get(k) == choice:
                    continue
                target[k] = copy.deepcopy(choice)
                apply_conditionals(target, (obj_node, resolver), keep={k, member})
                if not errors_of(v, candidate):
                    return candidate
    return None


def defects(keyword, node, here):
    """Single-field defects aimed at one clause (value replacements; ('remove', k) / ('add', k))."""
    out = []
    if keyword == 'type':
        kinds = node['type'] if isinstance(node['type'], list) else [node['type']]
        table = {'null': None, 'boolean': True, 'integer': 7, 'number': 1.5, 'string': 'gc', 'array': [], 'object': {}}
        out = [v for k, v in table.items() if k not in kinds and not (k == 'integer' and 'number' in kinds)
               and not (k == 'number' and 'integer' in kinds and False)]
        if 'integer' in kinds and 'number' not in kinds:
            out.insert(0, 1.5)
    elif keyword in ('enum', 'const'):
        members = node['enum'] if keyword == 'enum' else [node['const']]
        sample = members[0]
        if isinstance(sample, str):
            out = [sample + 'x', 'gc:not-a-member']
        elif type(sample) is bool:
            out = [not sample]
        elif isinstance(sample, int):
            out = [max(members) + 1]
        else:
            out = ['gc:not-a-member']
    elif keyword == 'minLength':
        n = node['minLength']
        base = here if isinstance(here, str) and here else 'a'
        out = [base[:max(n - 1, 0)], ''] if n > 0 else []
    elif keyword == 'maxLength':
        n = node['maxLength']
        base = here if isinstance(here, str) and here else 'a'
        out = [(base * (n // max(len(base), 1) + 2))[:n + 1]]
    elif keyword == 'pattern':
        base = here if isinstance(here, str) else 'gc'
        out = [base + '\n', base[:-1] + '!' if base else '!', '!' + base, base.upper() if base != base.upper() else base.lower(), base + ' ']
    elif keyword == 'format':
        out = ['not-a-' + node['format'], '2026-02-30T00:00:00Z']
    elif keyword in ('minimum', 'exclusiveMinimum'):
        bound = node[keyword]
        out = [bound - 1 if keyword == 'minimum' else bound]
    elif keyword in ('maximum', 'exclusiveMaximum'):
        bound = node[keyword]
        out = [bound + 1 if keyword == 'maximum' else bound]
    elif keyword == 'minItems':
        n = node['minItems']
        out = [list(here)[:n - 1] if isinstance(here, list) else []] if n > 0 else []
    elif keyword == 'maxItems':
        n = node['maxItems']
        if isinstance(here, list):
            item = here[-1] if here else 'gc'
            grown = list(here) + [(item + str(i)) if isinstance(item, str) else copy.deepcopy(item) for i in range(n + 1 - len(here))]
            out = [grown]
    elif keyword == 'uniqueItems':
        if isinstance(here, list):
            item = here[0] if here else 'gc'
            out = [list(here) + [copy.deepcopy(item)] * (2 if not here else 1)]
    elif keyword == 'required':
        out = [('remove', k) for k in node['required']]
    elif keyword in ('additionalProperties', 'unevaluatedProperties'):
        out = [('add', 'gc_extra_member')]
    elif keyword in ('anyOf', 'oneOf'):
        out = [None, True, 7, 1.5, 'gc', [], {}]
    elif keyword == 'not':
        inner = node['not']
        if 'pattern' in inner and isinstance(here, str):
            out = [here + '\x01', here + '\n']
        else:
            out = [None, 'gc']
    elif keyword == 'minProperties':
        out = [{}]
    elif keyword == 'contains':
        out = [[]]
    elif keyword == 'multipleOf':
        out = [node['multipleOf'] + 1]
    return out


def apply(control, path, edit):
    value = copy.deepcopy(control)
    if isinstance(edit, tuple) and edit and edit[0] in ('remove', 'add'):
        target = get(value, path)
        if not isinstance(target, dict):
            return None
        if edit[0] == 'remove':
            if edit[1] not in target:
                return None
            del target[edit[1]]
        else:
            target[edit[1]] = 'gc'
        return value
    return put(value, path, copy.deepcopy(edit))


def errors_of(v, value, cut=frozenset()):
    token = common._SCHEMA_CONTEXT.set(('', frozenset(cut)))
    try:
        return list(v.iter_errors(value))
    finally:
        common._SCHEMA_CONTEXT.reset(token)


def locations(errors):
    return set(adapter.clause_locations(errors))


# ---------------------------------------------------------------- closure

def siblings(location, ipath, by_ipath):
    """Values valid for the other schema nodes at the same instance location (they isolate a conditional or
    branch clause: the base definition accepts them, the target clause does not)."""
    out = []
    for other, node, resolver in by_ipath.get(ipath, [])[:8]:
        if other == location:
            continue
        for variant in (0, 1):
            try:
                value = gen(node, resolver, 0, variant)
            except Exception:  # noqa: BLE001
                continue
            if value not in out:
                out.append(value)
    return out[:10]


VACUOUS = {'minItems': 0, 'minLength': 0, 'minProperties': 0}


def static_class(info, keyword):
    """The classes that need no witness: they quantify over every reach of the clause's node (UNREACHABLE,
    SELECTOR_OR_NEGATED) or read the owner node only (VACUOUS). None when the clause needs a witness."""
    node = info['node']
    if all(r['empty_domain'] for r in info['reach']):
        return dict(cls='UNREACHABLE', reaches=len(info['reach']), proof='every instance location of the clause is an item of '
                    'an array whose owner node has maxItems 0 (' + info['reach'][0]['empty_domain'] + '): no valid instance holds an item')
    inside = sorted({c[0] for r in info['reach'] for c in r['ctx'] if c[0] in ('if', 'not')})
    if inside and all(any(c[0] in ('if', 'not') for c in r['ctx']) for r in info['reach']):
        return dict(cls='SELECTOR_OR_NEGATED', inside=inside, reaches=len(info['reach']),
                    note='inside an `if` selector or a `not` operand: it never refuses on its own')
    if keyword in VACUOUS and node.get(keyword) == VACUOUS[keyword]:
        return dict(cls='VACUOUS', proof=f'{keyword} is 0: no instance can fail it (checked on the owner node)')
    return None


def close_root(root, v, seeds, budget):
    CURRENT[0] = v
    nodes = walk(v)
    by_ipath = collections.defaultdict(list)
    for location, info in nodes.items():
        for reach in info['reach']:
            if not any(c[0] in ('if', 'not') for c in reach['ctx']):
                by_ipath[reach['ipath']].append((location, info['node'], info['resolver']))
    entries, controls = {}, list(seeds)
    known = {hashlib.sha256(pickle.dumps(c, protocol=5)).hexdigest() for c in controls}
    branch_controls = []
    spent = 0
    for location, info in nodes.items():
        node = info['node']
        for keyword in clauses_of(node):
            clause = location + '/' + name_of(keyword)
            ident = common.schema_guard(node, keyword)
            static = static_class(info, keyword)
            if static:
                entries[clause] = static
                continue
            best = None
            attempts = 0
            start = spent
            for reach in [r for r in info['reach'] if not any(c[0] in ('if', 'not') for c in r['ctx'])][:6]:
                pools = [(c, None) for c in controls[:40]]
                for variant in range(4):
                    for control in seeds[:6]:
                        pools.append((control, variant))
                for control, variant in pools:
                    if spent > budget or spent - start > 900:
                        break
                    if variant is None:
                        paths = list(concrete(control, reach['ipath']))
                        base = control
                    else:
                        attempts += 1
                        try:
                            base, path = realize(control, reach, variant, v)
                        except Exception:  # noqa: BLE001 - a failed construction attempt
                            continue
                        if base is None:
                            continue
                        spent += 1
                        if errors_of(v, base):
                            parents = [(n, res) for loc2, n, res in by_ipath.get(reach['ipath'][:-1], []) if 'properties' in n]
                            try:
                                base = repair(v, base, path, parents)
                            except Exception:  # noqa: BLE001 - a failed construction attempt
                                base = None
                            spent += 8
                            if base is None:
                                continue
                        paths = [path]
                        fingerprint = hashlib.sha256(pickle.dumps(base, protocol=5)).hexdigest()
                        if fingerprint not in known:
                            known.add(fingerprint)
                            controls.append(base)
                            branch_controls.append(dict(clause=clause, variant=variant,
                                                        sha256=hashlib.sha256(pickle.dumps(base, protocol=5)).hexdigest()))
                    for path in paths[:2]:
                        try:
                            here = get(base, path)
                        except (KeyError, IndexError, TypeError):
                            continue
                        for edit in defects(keyword, node, here) + siblings(location, reach['ipath'], by_ipath):
                            mutated = apply(base, path, edit)
                            if mutated is None:
                                continue
                            spent += 1
                            try:
                                errs = errors_of(v, mutated)
                            except Exception:  # noqa: BLE001
                                continue
                            failing = locations(errs)
                            if clause not in failing:
                                continue
                            cut = errors_of(v, mutated, {ident})
                            tops = sorted({common._SCHEMA_LOCATIONS.get(getattr(e, 'oracle_guard', None)) for e in errs} - {None})
                            witness = dict(path=[str(p) for p in path], edit=repr(edit)[:80], top_level=tops,
                                           input_sha256=hashlib.sha256(pickle.dumps(mutated, protocol=5)).hexdigest(),
                                           control='branch' if variant is not None else 'suite')
                            if not cut:
                                restored = errors_of(v, mutated)
                                if restored:
                                    best = dict(cls='KILLED', **witness)
                                    break
                            elif best is None:
                                later = locations(cut)
                                leaves = sorted(x for x in later if x.rsplit('/', 1)[-1] not in ('anyOf', 'oneOf') and not
                                                re.search(r'/(anyOf|oneOf)/\d+/type$', x))
                                best = dict(cls='COVERED_LATER', still_refused_by=(leaves or sorted(later))[:4],
                                            same_node=any(x.rsplit('/', 1)[0] == location for x in leaves), **witness)
                        if best and best['cls'] == 'KILLED':
                            break
                    if best and best['cls'] == 'KILLED':
                        break
                if best and best['cls'] == 'KILLED':
                    break
            entries[clause] = best or dict(cls='UNCOVERED', construction_attempts=attempts)
    return entries, branch_controls, spent


def collect(source):
    spec = importlib.util.spec_from_file_location('gc_runner', ROOT / 'scripts/pm-goal-gc-guard-tables.py')
    runner = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(runner)
    original = adapter.seed

    def seed(root, v, value):  # a larger seed pool for this evidence run only; the checker is unchanged
        if adapter.RECORDER is None or adapter.RECORDER.active is None:
            return
        adapter.SCHEMA_VALIDATORS.setdefault(root, v)
        slot = adapter.SCHEMA_SEEDS.setdefault(root, {})
        if len(slot) < SEED_CAP:
            slot.setdefault(hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest(), copy.deepcopy(value))
    adapter.seed = seed
    try:
        adapter.GATED = False
        rec, code, summary = runner.run_source(source)
    finally:
        adapter.seed = original
    return code


def self_test():
    """Standing trials for the reach walk (--self-test). The first is GO's (eb10b969cf): two conditionals at the same
    instance depth reach one shared node and must give two reaches. The second is GO's standing trial in this tool's
    UNREACHABLE terms, a negative: a clause that one live conditional reaches must not classify UNREACHABLE."""
    import jsonschema
    shared = {"x-pm-oracle-id": "S", "type": "string", "minLength": 3}
    schema = {"x-pm-oracle-id": "R", "type": "object", "required": ["kind", "a"], "properties": {
        "kind": {"x-pm-oracle-id": "K", "enum": ["x", "y"]},
        "a": {"x-pm-oracle-id": "A", "type": "object", "required": ["k2", "v"], "properties": {"k2": {"x-pm-oracle-id": "K2", "enum": ["p", "q"]}, "v": {"x-pm-oracle-id": "V"}},
              "allOf": [
                  {"x-pm-oracle-id": "C0", "if": {"x-pm-oracle-id": "C0if", "properties": {"k2": {"x-pm-oracle-id": "C0ifk", "const": "p"}}}, "then": {"x-pm-oracle-id": "C0then", "properties": {"v": shared}}},
                  {"x-pm-oracle-id": "C1", "if": {"x-pm-oracle-id": "C1if", "properties": {"k2": {"x-pm-oracle-id": "C1ifk", "const": "q"}}}, "then": {"x-pm-oracle-id": "C1then", "properties": {"v": shared}}}]}}}
    nodes = walk(jsonschema.Draft202012Validator(schema))
    owners = sorted(r['ctx'][-1][3]['x-pm-oracle-id'] for r in nodes['S']['reach'])
    print('trial 1: S reaches', owners)
    assert owners == ['C0', 'C1'], 'two conditionals at the same depth must give two reaches'

    # Trial 2 (negative): the shared item clause S2/minLength sits under `then` of C0 (v is an array with maxItems 0)
    # and under `then` of C1 (v is an array without that bound). C1 is live (k2 = q selects it), so a valid instance
    # holds an item that S2 constrains: the clause is reachable and must not be UNREACHABLE. The defective walk kept
    # only the C0 reach (same (then, 1, 0) key) and claimed UNREACHABLE.
    item = {"x-pm-oracle-id": "S2", "type": "string", "minLength": 3}
    schema2 = {"x-pm-oracle-id": "R2", "type": "object", "required": ["a"], "properties": {
        "a": {"x-pm-oracle-id": "A2", "type": "object", "required": ["k2", "v"], "properties": {"k2": {"x-pm-oracle-id": "K22", "enum": ["p", "q"]}, "v": {"x-pm-oracle-id": "V2", "type": "array"}},
              "allOf": [
                  {"x-pm-oracle-id": "D0", "if": {"x-pm-oracle-id": "D0if", "properties": {"k2": {"x-pm-oracle-id": "D0ifk", "const": "p"}}}, "then": {"x-pm-oracle-id": "D0then", "properties": {"v": {"x-pm-oracle-id": "E0", "maxItems": 0, "items": item}}}},
                  {"x-pm-oracle-id": "D1", "if": {"x-pm-oracle-id": "D1if", "properties": {"k2": {"x-pm-oracle-id": "D1ifk", "const": "q"}}}, "then": {"x-pm-oracle-id": "D1then", "properties": {"v": {"x-pm-oracle-id": "E1", "items": item}}}}]}}}
    v2 = jsonschema.Draft202012Validator(schema2)
    live = {"a": {"k2": "q", "v": ["abc"]}}
    assert not list(v2.iter_errors(live)) and list(v2.iter_errors({"a": {"k2": "q", "v": ["ab"]}})), 'C1 reaches S2 live'
    n2 = walk(v2)
    domains = sorted(str(r['empty_domain']) for r in n2['S2']['reach'])
    got = static_class(n2['S2'], 'minLength')
    print('trial 2: S2 reach empty domains', domains, 'static class', got and got['cls'])
    assert domains == ['E0', 'None'], 'both conditional reaches of the item clause must be kept'
    assert got is None or got['cls'] != 'UNREACHABLE', 'must not claim UNREACHABLE: the D1 reach is live'

    # Trial 3 (positive control): with only D0, every reach is an item of a maxItems-0 array: UNREACHABLE holds.
    schema3 = copy.deepcopy(schema2)
    del schema3['properties']['a']['allOf'][1]
    n3 = walk(jsonschema.Draft202012Validator(schema3))
    got3 = static_class(n3['S2'], 'minLength')
    print('trial 3: D0 only, static class', got3 and got3['cls'])
    assert got3 and got3['cls'] == 'UNREACHABLE'
    print('closure self-test pass: two same-depth conditionals keep two reaches; no UNREACHABLE while one reach is live; '
          'UNREACHABLE kept when every reach is an empty domain')
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path)
    parser.add_argument('--self-test', action='store_true', help='run the walk standing trials and exit')
    parser.add_argument('--source', action='append', choices=('own_a', 'own_b'))
    parser.add_argument('--budget', type=int, default=40000, help='validations per root')
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    if args.out is None:
        parser.error('--out is required')
    report = dict(method=__doc__.split('\n\n')[0], sources={}, native_execution='NOT_RUN')
    for source in args.source or ['own_a', 'own_b']:
        adapter.SCHEMA_SEEDS.clear(); adapter.SCHEMA_VALIDATORS.clear(); adapter.ROOT_ROWS.clear()
        code = collect(source)
        roots = {}
        for root, v in sorted(adapter.SCHEMA_VALIDATORS.items()):
            seeds = list(adapter.SCHEMA_SEEDS.get(root, {}).values())
            entries, branch_controls, spent = close_root(root, v, seeds, args.budget)
            counts = collections.Counter(e['cls'] for e in entries.values())
            roots[root] = dict(rows=sorted(adapter.ROOT_ROWS.get(root, ())), seeds=len(seeds), branch_controls=branch_controls,
                               validations=spent, counts=dict(counts), clauses=entries)
            print(f'{source} {root.rsplit("/", 1)[-1]}: {dict(counts)}', file=sys.stderr, flush=True)
        distinct = {}
        for e in roots.values():
            for clause, entry in e['clauses'].items():
                rank = {'KILLED': 0, 'COVERED_LATER': 1, 'UNREACHABLE': 2, 'VACUOUS': 3, 'SELECTOR_OR_NEGATED': 4, 'UNCOVERED': 5}
                if clause not in distinct or rank[entry['cls']] < rank[distinct[clause]['cls']]:
                    distinct[clause] = entry
        report['sources'][source] = dict(suite_exit=code, roots=roots,
                                         occurrence_counts=dict(sum((collections.Counter(e['counts']) for e in roots.values()), collections.Counter())),
                                         distinct_counts=dict(collections.Counter(e['cls'] for e in distinct.values())),
                                         uncovered=sorted(c for c, e in distinct.items() if e['cls'] == 'UNCOVERED'))
    args.out.write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps({s: dict(occurrences=v['occurrence_counts'], distinct=v['distinct_counts'], uncovered=len(v['uncovered']))
                      for s, v in report['sources'].items()}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
