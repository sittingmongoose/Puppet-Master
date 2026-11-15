#!/usr/bin/env python3
"""PNC-019 C12-GO (lane 18): schema clause closure for every whole-definition row of the GO checkers.

Adapted from lane GC's scripts/pm-goal-gc-schema-closure.py (branch plans/ea-pnc-c12-gc-20261114 at
c0482747da, "the coverage standard"); the closure algorithm, classes and branch-control construction are
GC's, unchanged. GO differences: the roots and their accepted seeds come from the GO complete calls
(pm_goal_go_schema.ROOTS: the GO whole-definition rows of goal.created, the restore_point.deleted
value shapes, the run.started consumer copies, and every frozen restore_point.deleted / run.started
adoption Schema object), and ECMA patterns / clause locations use pm_goal_oracle_common directly.

For each owner definition root that a checker row validates (the exact validator object the complete call used:
every keyword, owner formats, shared date-time profiles, CV-1100 current integers where the boundary is current,
ECMA patterns), every reachable assertion clause gets one class:

  KILLED          a valid control and a single-field defect at the clause's own instance location: the definition
                  refuses and reports the clause; with only that clause cut it ACCEPTS; restored, it refuses again;
  COVERED_LATER   the clause is reported, but with it cut a named other clause of the same definition still
                  refuses (that clause is named); no kill credit;
  UNREACHABLE     a checked proof that no valid instance reaches the clause (the proof kind and its check);
  VACUOUS         minItems/minLength/minProperties of 0 (checked on the owner node);
  UNCOVERED       none of the above.

Clauses inside an `if` (a selector) and inside a `not` (the `not` keyword is the assertion) are listed apart.
The clause cut uses the validator's own per-keyword disable context (pm_goal_oracle_common._SCHEMA_CONTEXT);
nothing is edited. Schema-boundary controls and witnesses earn no lifecycle or row credit.

Usage: python3 scripts/pm_goal_go_schema_closure.py --out FILE [--budget N]
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
        if common.ecma_pattern(pattern).search(text) and text not in out:
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


UNRESOLVED = []  # (location, ref) of $refs the root's own resolver cannot resolve (GO addition)


def walk(v):
    """Every schema node with: the instance path patterns that reach it and the conditions on the way."""
    nodes = {}
    def visit(node, resolver, ipath, ctx, steps, depth, obj=None, empty=None):
        if not isinstance(node, dict) or depth > 40:
            return
        location = node.get('x-pm-oracle-id', json.dumps(node, sort_keys=True))
        key = (location, ipath, tuple(c[:3] for c in ctx))
        if key in seen:
            return
        seen.add(key)
        if 'properties' in node:
            obj = (node, resolver)
        nodes.setdefault(location, dict(node=node, resolver=resolver, reach=[]))['reach'].append(
            dict(ipath=ipath, ctx=ctx, steps=steps, obj=obj, empty_domain=empty))
        if '$ref' in node:
            try:
                resolved = resolver.lookup(node['$ref'])
            except Exception as exc:  # noqa: BLE001 - a dangling ref: recorded per root, never descended
                UNRESOLVED.append(dict(location=location, ref=node['$ref'], error=type(exc).__name__))
                resolved = None
            if resolved is not None:
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
        if isinstance(node.get('contains'), dict):  # GO addition: satisfy `contains` with one matching item
            values.append(gen({**deref(item, resolver)[0], **deref(node['contains'], resolver)[0]}, resolver, depth + 1, 0))
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


COUNT = [0]  # GO addition: every schema validation the closure performs (GC charged repair() a flat 8)


def holds(v, node, value):
    COUNT[0] += 1
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
            if not choices and sub.get('type') == 'boolean':
                choices = [True, False]  # GO addition: boolean selectors switch branches as enum members do
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


NONNULL = {'string', 'object', 'array', 'integer', 'number', 'boolean'}


def requires_null(sub):
    kinds = sub.get('type')
    return kinds == 'null' or sub.get('const', 0) is None or sub.get('enum') == [None]


def contradicted_branch(info, nodes):
    """GO addition, a checked UNREACHABLE proof: every reach of the clause passes a `then` whose `if` requires an
    object member P to be null (type null / const null), while the same definition unconditionally requires P at
    that object and types it non-null there (a node reached with no conditional or union context). No valid
    instance can then satisfy the `if`, so the branch, and the clause, is unreachable."""
    proofs = []
    for reach in info['reach']:
        found = None
        for kind, depth, _, owner, resolver, obj in reach['ctx']:
            if kind != 'then':
                continue
            condition = deref(owner.get('if', {}), resolver)[0]
            for prop, sub in condition.get('properties', {}).items():
                sub = deref(sub, resolver)[0]
                if not requires_null(sub):
                    continue
                at = reach['ipath'][:depth] + (prop,)
                parent = reach['ipath'][:depth]
                typed = [loc for loc, n in nodes.items() for r in n['reach']
                         if r['ipath'] == at and not r['ctx'] and isinstance(n['node'].get('type'), str) and n['node']['type'] in NONNULL]
                required = [loc for loc, n in nodes.items() for r in n['reach']
                            if r['ipath'] == parent and not r['ctx'] and prop in (n['node'].get('required') or [])]
                if typed and required:
                    found = dict(member=prop, null_condition=owner.get('x-pm-oracle-id', '') + '/if', nonnull_type=typed[0],
                                 required_by=required[0])
                    break
            if found:
                break
        if not found:
            return None
        proofs.append(found)
    first = proofs[0]
    return ('contradicted branch: its `if` requires `' + first['member'] + '` null (' + first['null_condition'] + ') but the '
            'definition unconditionally requires it (' + first['required_by'] + ') and types it non-null (' + first['nonnull_type'] + ')')


def forbidden_member(info, nodes):
    """GO addition, a checked UNREACHABLE proof: every reach of the clause lies at (or under) an object member P that
    the same definition unconditionally forbids at that object (a node reached with no conditional or union context
    holding `not: {required: [..P..]}` and nothing else under `not`), so no valid instance has the member."""
    reasons = []
    for reach in info['reach']:
        found = None
        for depth in range(len(reach['ipath'])):
            member, parent = reach['ipath'][depth], reach['ipath'][:depth]
            if not isinstance(member, str):
                continue
            for loc, n in nodes.items():
                negated = n['node'].get('not') if isinstance(n['node'].get('not'), dict) else None
                if (negated and set(negated) - {'x-pm-oracle-id'} == {'required'} and member in negated['required']
                        and any(r['ipath'] == parent and not r['ctx'] for r in n['reach'])):
                    found = ('forbidden member: `' + member + '` is excluded unconditionally by ' + loc + '/not (required '
                             + json.dumps(negated['required']) + '), so no valid instance reaches this clause')
                    break
            if found:
                break
        if not found:
            return None
        reasons.append(found)
    return reasons[0] if reasons else None


def error_repair(v, value, keep, rounds=16):
    """GO addition: error-guided branch-control repair. Each round fixes the deepest failing nodes the owner
    validator itself reports (a missing required member is generated from its owner subschema, an unexpected
    member is removed, any other failing node is regenerated from the failing subschema), never at or above
    the realized member `keep`. Returns a value the whole definition accepts, or None."""
    value = copy.deepcopy(value)
    keep = tuple(keep)
    for _ in range(rounds):
        errs = errors_of(v, value)
        if not errs:
            return value
        leaves = []
        def flatten(error):
            if error.context and error.validator in ('anyOf', 'oneOf'):
                leaves.append(error)
                return
            leaves.append(error)
        for error in errs:
            flatten(error)
        changed = False
        for error in sorted(leaves, key=lambda e: -len(e.absolute_path))[:8]:
            where = tuple(error.absolute_path)
            if where == keep[:len(where)] and error.validator not in ('required', 'additionalProperties', 'unevaluatedProperties'):
                continue  # never regenerate the member under test or one of its ancestors
            node = error.schema if isinstance(error.schema, dict) else {}
            try:
                target = get(value, where)
            except (KeyError, IndexError, TypeError):
                continue
            if error.validator == 'required' and isinstance(target, dict):
                for name in error.validator_value:
                    if name not in target:
                        target[name] = gen(node.get('properties', {}).get(name, {}), v._resolver, 0, 0)
                        changed = True
            elif error.validator in ('additionalProperties', 'unevaluatedProperties') and isinstance(target, dict):
                allowed = set(node.get('properties', {}))
                for name in [k for k in target if k not in allowed and not any(re.search(pat, k) for pat in node.get('patternProperties', {}))]:
                    if where + (name,) != keep[:len(where) + 1]:
                        del target[name]
                        changed = True
            elif where != keep[:len(where)]:
                generated = gen(node, v._resolver, 0, 0)
                if generated != target:
                    value = put(value, where, generated)
                    changed = True
        if not changed:
            return None
    return value if not errors_of(v, value) else None


def flip_repair(v, value, path, ipath, by_ipath, limit=48):
    """GO addition: switch one boolean or enum member (a branch selector) of the realized member's parent object or of
    any ancestor object, never on the realized member's own path, then error-guided repair; returns a value the
    whole definition accepts, or None. Nearest ancestors first; at most `limit` switches."""
    tried = 0
    for depth in range(len(path) - 1, -1, -1):
        prefix = path[:depth]
        on_path = path[depth]
        for obj_node, resolver in [(n, res) for _, n, res in by_ipath.get(tuple(ipath[:depth]), []) if 'properties' in n]:
            for k, sub in obj_node.get('properties', {}).items():
                if k == on_path:
                    continue
                sub = deref(sub, resolver)[0]
                choices = sub.get('enum', [])[:8] or ([True, False] if sub.get('type') == 'boolean' else [])
                for choice in choices:
                    candidate = copy.deepcopy(value)
                    try:
                        target = get(candidate, prefix)
                    except (KeyError, IndexError, TypeError):
                        return None
                    if not isinstance(target, dict) or target.get(k) == choice:
                        continue
                    target[k] = copy.deepcopy(choice)
                    tried += 1
                    repaired = error_repair(v, candidate, path, rounds=8)
                    if repaired is not None:
                        return repaired
                    if tried >= limit:
                        return None
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
        out.append(base + '\ud800')  # GO addition: a lone surrogate (patterns such as ^[^\ud800-\udfff]+$)
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
    elif keyword == 'maxProperties' and isinstance(here, dict) and here:  # GO addition
        n = node['maxProperties']
        grown = dict(here)
        first = next(iter(here))
        index = 0
        while len(grown) <= n and index <= 64:
            key = first[:-1] + format(index % 16, 'x') if first else 'k' + str(index)
            index += 1
            if key not in grown:
                grown[key] = copy.deepcopy(here[first])
        out = [grown]
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
    COUNT[0] += 1
    token = common._SCHEMA_CONTEXT.set(('', frozenset(cut)))
    try:
        return list(v.iter_errors(value))
    finally:
        common._SCHEMA_CONTEXT.reset(token)


def clause_locations(errors):
    for error in errors:
        ident = getattr(error, 'oracle_guard', None)
        if ident in common._SCHEMA_LOCATIONS:
            yield common._SCHEMA_LOCATIONS[ident]
        yield from clause_locations(error.context)


def locations(errors):
    return set(clause_locations(errors))


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
# Clauses listed apart: inside an `if` (a selector), a `not` operand (the `not` keyword is the assertion) and,
# GO addition, a `contains` operand (the validator reports only `contains`; operand failures never refuse).
APART = ('if', 'not', 'contains')
COVERED_EXTRA = 120


def close_root(root, v, seeds, budget):
    CURRENT[0] = v
    nodes = walk(v)
    by_ipath = collections.defaultdict(list)
    for location, info in nodes.items():
        for reach in info['reach']:
            if not any(c[0] in APART for c in reach['ctx']):
                by_ipath[reach['ipath']].append((location, info['node'], info['resolver']))
    entries, controls = {}, list(seeds)
    known = {hashlib.sha256(pickle.dumps(c, protocol=5)).hexdigest() for c in controls}
    branch_controls = []
    spent = 0
    root0 = COUNT[0]
    for location, info in nodes.items():
        node = info['node']
        for keyword in clauses_of(node):
            clause = location + '/' + name_of(keyword)
            ident = common.schema_guard(node, keyword)
            if all(r['empty_domain'] for r in info['reach']):
                entries[clause] = dict(cls='UNREACHABLE', proof='every instance location of the clause is an item of an array '
                                       'whose owner node has maxItems 0 (' + info['reach'][0]['empty_domain'] + '): no valid instance holds an item')
                continue
            inside = sorted({c[0] for r in info['reach'] for c in r['ctx'] if c[0] in APART})
            if inside and all(any(c[0] in APART for c in r['ctx']) for r in info['reach']):
                entries[clause] = dict(cls='SELECTOR_OR_NEGATED', inside=inside,
                                       note='inside an `if` selector, a `not` operand or a `contains` operand: it never refuses on its own')
                continue
            if keyword in VACUOUS and node.get(keyword) == VACUOUS[keyword]:
                entries[clause] = dict(cls='VACUOUS', proof=f'{keyword} is 0: no instance can fail it (checked on the owner node)')
                continue
            best = None
            attempts = 0
            start = COUNT[0]
            covered_at = None  # GO addition: once COVERED_LATER is shown, search COVERED_EXTRA more for a kill
            for reach in [r for r in info['reach'] if not any(c[0] in APART for c in r['ctx'])][:6]:
                pools = [(c, None) for c in controls[:40]]
                for variant in range(4):
                    for control in seeds[:6]:
                        pools.append((control, variant))
                for control, variant in pools:
                    if COUNT[0] - root0 > budget or COUNT[0] - start > 900 or (
                            covered_at is not None and COUNT[0] - covered_at > COVERED_EXTRA):
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
                            realized = base
                            try:
                                base = repair(v, base, path, parents)
                            except Exception:  # noqa: BLE001 - a failed construction attempt
                                base = None
                            spent += 8
                            if base is None:
                                try:
                                    base = error_repair(v, realized, path)
                                    if base is None:
                                        base = flip_repair(v, realized, path, reach['ipath'], by_ipath)
                                except Exception:  # noqa: BLE001 - a failed construction attempt
                                    base = None
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
                                covered_at = COUNT[0]
                                best = dict(cls='COVERED_LATER', still_refused_by=(leaves or sorted(later))[:4],
                                            same_node=any(x.rsplit('/', 1)[0] == location for x in leaves), **witness)
                        if best and best['cls'] == 'KILLED':
                            break
                    if best and best['cls'] == 'KILLED':
                        break
                if best and best['cls'] == 'KILLED':
                    break
            if best is None:
                proof = contradicted_branch(info, nodes) or forbidden_member(info, nodes)
                if proof:
                    best = dict(cls='UNREACHABLE', proof=proof)
            entries[clause] = best or dict(cls='UNCOVERED', construction_attempts=attempts)
    return entries, branch_controls, COUNT[0] - root0


SEED_POLICY = ['controls']


def collect():
    """Run the GO sources once (discovery, no judge, no witness search) to record every root and its seeds.

    Seed policy `controls` (default): accepted instances from complete calls declared valid. Policy `authored`:
    also accepted instances of the root inside authored negative calls (lane GC's adapter seeded every accepted
    boundary instance its suites' complete calls produced); generated calls (search, transfer, keyword edits)
    and judge replays never seed."""
    import os
    import pm_goal_guard_sweep as sweep
    import pm_goal_guard_tables as tables
    import pm_goal_go_schema as schemas
    import pm_goal_go_sweep as go
    os.environ['PNC019_GO_NO_SEARCH'] = '1'
    go.install(prove=False)
    if SEED_POLICY[0] == 'authored':
        import copy as copy_module
        import pickle as pickle_module
        import hashlib as hashlib_module
        import pm_goal_go_schema as schemas_module
        authored = [False]
        base = sweep.Collector.invoke

        def seeding_invoke(self, label, evaluate, value, valid=None, **kwargs):
            saved = authored[0]
            authored[0] = not kwargs.get('generated') and not self.replaying
            try:
                return base(self, label, evaluate, value, valid, **kwargs)
            finally:
                authored[0] = saved
        sweep.Collector.invoke = seeding_invoke

        def record(root, v, value, *, row=None, site=None, kind='go'):
            slot = schemas_module.ROOTS.setdefault(root, dict(validator=v, seeds={}, rows=set(), sites=set(), kind=kind))
            if row:
                slot['rows'].add(row)
            if site:
                slot['sites'].add(site)
            if value is not None and (authored[0] or schemas_module.CONTROL[0]) and len(slot['seeds']) < schemas_module.SEED_CAP:
                try:
                    key = hashlib_module.sha256(pickle_module.dumps(value, protocol=5)).hexdigest()
                except Exception:
                    return
                slot['seeds'].setdefault(key, copy_module.deepcopy(value))
        schemas_module.record = record
    tables.DISCOVERY = True
    collector = sweep.collect(go.SOURCES, fuzz=False, judge=False, keyword_witnesses=False)
    return collector, schemas.ROOTS


def family_roots(collector, roots):
    """Which families' complete calls validated each root (from the ledger and row signatures)."""
    out = collections.defaultdict(set)
    row_family = collections.defaultdict(set)
    for record in collector.ledger:
        if record.get('sig') is not None:
            for name in collector.signature_list[record['sig']]:
                row_family[name].add(record['family'])
    for root, slot in roots.items():
        for row in slot['rows']:
            out[root] |= row_family.get(row, set())
        for file, line in slot['sites']:
            for name, info in collector.rows.items():
                if any(Path(f).name == Path(file).name and l == line for f, l in info['sites']):
                    out[root] |= row_family.get(name, set())
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--budget', type=int, default=40000, help='validations per root')
    parser.add_argument('--shard', default='0/1', help='i/n: close only the roots whose sorted index is i mod n')
    parser.add_argument('--roots', nargs='*', help='close only roots containing one of these substrings')
    parser.add_argument('--per-clause', type=int, default=0, help='raise a root budget to this many validations per clause')
    parser.add_argument('--seeds', choices=('controls', 'authored'), default='controls', help='seed policy (see collect)')
    parser.add_argument('--merge', nargs='*', help='merge reports into --out (no collection); FILE or FILE@TOOL_COMMIT; '
                        'later files replace earlier ones root by root')
    args = parser.parse_args()
    if args.merge:
        return merge(args.merge, args.out)
    part, total = map(int, args.shard.split('/'))
    SEED_POLICY[0] = args.seeds
    collector, roots = collect()
    families = family_roots(collector, roots)
    print(f'roots {len(roots)}; shard {part}/{total}', file=sys.stderr, flush=True)
    report = dict(method=__doc__.split('\n\n')[0], adapted_from='scripts/pm-goal-gc-schema-closure.py@c0482747da',
                  calls=collector.calls, failures=collector.failures, roots={}, native_execution='NOT_RUN')
    for number, (root, slot) in enumerate(sorted(roots.items())):
        if number % total != part or (args.roots and not any(s in root for s in args.roots)):
            continue
        v = slot['validator']
        seeds = list(slot['seeds'].values())
        UNRESOLVED.clear()
        budget = args.budget
        if args.per_clause:
            CURRENT[0] = v
            clauses = sum(len(clauses_of(info['node'])) for info in walk(v).values())
            budget = max(budget, args.per_clause * clauses)
        try:
            entries, branch_controls, spent = close_root(root, v, seeds, budget)
        except Exception as exc:  # noqa: BLE001 - a root that cannot be closed is reported, never skipped
            report['roots'][root] = dict(kind=slot['kind'], rows=sorted(slot['rows']), families=sorted(families.get(root, ())),
                                         seeds=len(seeds), error=type(exc).__name__ + ': ' + str(exc)[:300],
                                         counts={'UNCOVERED_ROOT_ERROR': 1}, clauses={root + '/<root>': dict(cls='UNCOVERED', error=str(exc)[:300])})
            print(f'{root[:90]}: ERROR {exc!r}'[:300], file=sys.stderr, flush=True)
            continue
        counts = collections.Counter(e['cls'] for e in entries.values())
        report['roots'][root] = dict(kind=slot['kind'], rows=sorted(slot['rows']), sites=sorted(map(list, slot['sites']))[:12],
                                     families=sorted(families.get(root, ())), seeds=len(seeds),
                                     branch_controls=branch_controls, validations=spent, counts=dict(counts), clauses=entries,
                                     unresolved_refs=list(UNRESOLVED))
        print(f'{root[:90]}: seeds={len(seeds)} {dict(counts)}', file=sys.stderr, flush=True)
        partial = dict(report, all_roots={r: sorted(families.get(r, ())) for r in sorted(roots)}, partial=True)
        args.out.with_suffix('.partial.json').write_text(json.dumps(partial, indent=1, sort_keys=True, default=str) + '\n')
    report['shard'] = args.shard
    report['seed_policy'] = args.seeds
    report['closure_tool_sha256'] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    for root, entry in report['roots'].items():
        entry['seed_sha256'] = sorted(roots[root]['seeds'])
        entry['seed_policy'] = args.seeds
        entry['budget_args'] = dict(budget=args.budget, per_clause=args.per_clause)
    report['all_roots'] = {root: sorted(families.get(root, ())) for root in sorted(roots)}
    summarize(report)
    args.out.write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps({f: dict(roots=len(v['roots']), occurrences=v['occurrence_counts'], uncovered=len(v['uncovered']))
                      for f, v in report['families'].items()}))
    return 0


def merge(paths, out):
    reports = []
    for item in paths:
        path, _, commit = str(item).partition('@')
        data = json.loads(Path(path).read_text())
        for entry in data['roots'].values():
            entry.setdefault('closure_tool', commit or data.get('closure_tool_sha256'))
            entry.setdefault('seed_policy', data.get('seed_policy', 'controls'))
            entry['source_report'] = Path(path).name
        reports.append(data)
    report = dict(reports[0], roots={}, shard='merged:' + ','.join(r['shard'] for r in reports))
    for r in reports:
        report['roots'].update(r['roots'])
    expected = set(reports[0]['all_roots'])
    report['missing_roots'] = sorted(expected - set(report['roots']))
    summarize(report)
    out.write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps(dict(roots=len(report['roots']), missing=len(report['missing_roots']),
                          families={f: dict(roots=len(v['roots']), uncovered=len(v['uncovered'])) for f, v in report['families'].items()})))
    return 0 if not report['missing_roots'] else 1


def summarize(report):
    rank = {'KILLED': 0, 'COVERED_LATER': 1, 'UNREACHABLE': 2, 'VACUOUS': 3, 'SELECTOR_OR_NEGATED': 4, 'UNCOVERED': 5}
    per_family = {}
    for family in ('goal.created', 'restore_point.deleted', 'run.started'):
        occurrences, distinct = collections.Counter(), {}
        for root, entry in report['roots'].items():
            if family not in entry['families']:
                continue
            for clause, item in entry['clauses'].items():
                occurrences[item['cls']] += 1
                if clause not in distinct or rank[item['cls']] < rank[distinct[clause]['cls']]:
                    distinct[clause] = item
        per_family[family] = dict(roots=sorted(r for r, e in report['roots'].items() if family in e['families']),
                                  occurrence_counts=dict(occurrences),
                                  distinct_counts=dict(collections.Counter(e['cls'] for e in distinct.values())),
                                  uncovered=sorted(c for c, e in distinct.items() if e['cls'] == 'UNCOVERED'))
    report['families'] = per_family
    report['roots_without_family_call'] = sorted(r for r, e in report['roots'].items() if not e['families'])


if __name__ == '__main__':
    sys.exit(main())
