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

Carry (GO addition): `--carry FILE@TOOL_COMMIT ...` closes the selected roots again but copies only the clauses
FILE classified by a witness (KILLED, COVERED_LATER: a recorded input and real validations), with `carried_from`
(report, its tool commit, its class), so a carried witness keeps the tool version that produced it. Every other
clause (UNREACHABLE, VACUOUS, SELECTOR_OR_NEGATED, COVERED_BY_CONST, UNCOVERED) is classified again by this tool,
because those classes quantify over the walk's reaches. Provenance: `closure_tool_sha256` is the hash of this file
when the run imported it (the code that ran), not when the run ended.

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
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_goal_oracle_common as common  # noqa: E402

TOOL_SHA256 = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()  # the code this process imported
WITNESSED = ('KILLED', 'COVERED_LATER')  # classes resting on a recorded input and real validations (--carry copies only these)

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


def ctx_key(entry):
    """GO fix: a context entry names its owner node, not only (kind, instance depth, index). GC's walk keyed reaches by
    (kind, depth, index), so a node reached through two different conditionals (or unions) at the same depth kept
    only the first: every proof that quantifies over all reaches of a clause read an incomplete list."""
    return (entry[0], entry[1], entry[2], id(entry[3]))


def walk(v):
    """Every schema node with: the instance path patterns that reach it and the conditions on the way."""
    nodes = {}
    def visit(node, resolver, ipath, ctx, steps, depth, obj=None, empty=None):
        if not isinstance(node, dict) or depth > 40:
            return
        if depth and isinstance(node.get('$id'), str):
            # GO fix: an inline subschema with its own $id is a new base, exactly as the owner validators (jsonschema
            # Draft 2020-12, `runtime_schema` keeps $id) resolve; a ref that is dangling under that base is recorded in
            # UNRESOLVED below, as the validator itself could never resolve it.
            try:
                from referencing.jsonschema import DRAFT202012
                resolver = resolver.in_subresource(DRAFT202012.create_resource(node))
            except Exception:  # noqa: BLE001 - keep the enclosing resolver
                pass
        location = node.get('x-pm-oracle-id', json.dumps(node, sort_keys=True))
        RESOLVERS.setdefault(id(node), resolver)
        key = (location, ipath, tuple(ctx_key(c) for c in ctx))
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


RESOLVERS = {}  # GO fix: id(schema node) -> the resolver of the document that node belongs to (filled by walk)


def holds(v, node, value, resolver=None):
    COUNT[0] += 1
    resolver = resolver if resolver is not None else RESOLVERS.get(id(node))
    try:
        evolved = v.evolve(schema=node, _resolver=resolver) if resolver is not None else v.evolve(schema=node)
        return not any(True for _ in evolved.iter_errors(value))
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
            if selector_clash(reach['ipath'], reach['ipath'][:depth], condition):
                continue
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


def excluded_by_cases(info, nodes):
    """GO addition, a checked UNREACHABLE proof by case analysis: every reach of the clause passes a `then` whose `if`
    requires member P of object O (member m of its parent A) to be const X, while A unconditionally requires a selector
    S with a finite enum, and for every value e of S an unconditional `if S == e` member of A pins m.P to a const other
    than X. Then no valid instance satisfies the `if`, so the branch, and the clause, is unreachable."""
    def unconditional(path):
        return [(loc, n) for loc, n in nodes.items() if any(r['ipath'] == path and not r['ctx'] for r in n['reach'])]
    reasons = []
    for reach in info['reach']:
        found = None
        for kind, depth, _, owner, resolver, obj in reach['ctx']:
            if kind != 'then' or depth == 0:
                continue
            condition = deref(owner.get('if', {}), resolver)[0]
            object_path = reach['ipath'][:depth]
            if selector_clash(reach['ipath'], object_path, condition):
                continue
            parent, member = object_path[:-1], object_path[-1]
            for prop, sub in condition.get('properties', {}).items():
                sub = deref(sub, resolver)[0]
                if 'const' not in sub:
                    continue
                wanted = sub['const']
                at_parent = unconditional(parent)
                for selector in {s for _, n in at_parent for s in (n['node'].get('required') or [])}:
                    enums = [n['node'].get('enum') for _, n in unconditional(parent + (selector,)) if isinstance(n['node'].get('enum'), list)]
                    if not enums:
                        continue
                    cases, pinned = enums[0], {}
                    for loc, n in at_parent:
                        cond = n['node'].get('if')
                        then = n['node'].get('then')
                        if not isinstance(cond, dict) or not isinstance(then, dict):
                            continue
                        res = n['resolver']
                        cond = deref(cond, res)[0]
                        value = deref(cond.get('properties', {}).get(selector, {}), res)[0]
                        if 'const' not in value:
                            continue
                        branch = deref(then, res)[0]
                        member_node = deref(branch.get('properties', {}).get(member, {}), res)[0]
                        pin = deref(member_node.get('properties', {}).get(prop, {}), res)[0]
                        if 'const' in pin and pin['const'] != wanted:
                            pinned[json.dumps(value['const'])] = (loc, pin['const'])
                    if cases and all(json.dumps(e) in pinned for e in cases):
                        found = ('case analysis: `' + selector + '` is required with enum ' + json.dumps(cases) + ' and every case pins `'
                                 + member + '.' + prop + '` to a value other than ' + json.dumps(wanted) + ' ('
                                 + '; '.join(f"{k} -> {v[1]!r} at {v[0]}" for k, v in sorted(pinned.items())) + ')')
                        break
                if found:
                    break
            if found:
                break
        if not found:
            return None
        reasons.append(found)
    return reasons[0] if reasons else None


def applies(r, scope):
    """A node reached by r constrains every instance the scoped reach is evaluated for: r is only inside union
    alternatives and conditional branches the scoped reach is also inside (whenever the scoped clause is evaluated
    in its alternative those branches are taken, so r's node is evaluated too); never inside if/not/contains."""
    unions, branches = scope
    keys = [ctx_key(c) for c in r['ctx']]
    return (all(k in unions for k in keys if k[0] in ('anyOf', 'oneOf'))
            and all(k in branches for k in keys if k[0] in ('then', 'else'))
            and not any(k[0] in APART or k[0] == 'if' for k in keys))


def null_at(branch, resolver, relative):
    """Whether a conditional branch requires the member at a relative instance path to be null."""
    sub_node, res = deref(branch, resolver)
    for segment in relative:
        if not isinstance(segment, str) or segment in ('*', '#') or not isinstance(sub_node, dict):
            return False
        nxt = sub_node.get('properties', {}).get(segment)
        if nxt is None:
            return False
        sub_node, res = deref(nxt, res)
    return isinstance(sub_node, dict) and requires_null(sub_node)


SCOPES = {}


def scope_of(reach, nodes):
    """The scope a reach is evaluated in: the union alternatives and conditional branches (by owner node) it is inside,
    plus implied branches (GO addition): when a conditional X that is evaluated whenever the reach is (at the reach's
    location or an ancestor) has a branch requiring a strict ancestor of the reach's location to be null, every
    valid instance that holds the reach's location takes X's other branch (the ancestor holds an object, so that
    branch would fail). Iterated to a fixed point."""
    key = id(reach)
    if key in SCOPES and SCOPES[key][0] is reach:
        return SCOPES[key][1]
    unions = frozenset(ctx_key(c) for c in reach['ctx'] if c[0] in ('anyOf', 'oneOf'))
    branches = set(ctx_key(c) for c in reach['ctx'] if c[0] in ('then', 'else'))
    ipath = reach['ipath']
    for _ in range(4):
        added = False
        for n in nodes.values():
            node = n['node']
            if not isinstance(node.get('if'), dict):
                continue
            for r in n['reach']:
                depth = len(r['ipath'])
                if depth >= len(ipath) or ipath[:depth] != r['ipath'] or not applies(r, (unions, frozenset(branches))):
                    continue
                for branch, other in (('then', 'else'), ('else', 'then')):
                    implied = (other, depth, 0, id(node))
                    if implied in branches or not isinstance(node.get(branch), dict) or not isinstance(node.get(other), dict):
                        continue
                    if any(null_at(node[branch], n['resolver'], ipath[depth:end]) for end in range(depth + 1, len(ipath))):
                        branches.add(implied)
                        added = True
        if not added:
            break
    scope = (unions, frozenset(branches))
    SCOPES[key] = (reach, scope)
    return scope


def value_key(x):
    """JSON-Schema equality key: 1 and 1.0 are the same value."""
    if isinstance(x, float) and x.is_integer():
        x = int(x)
    if isinstance(x, dict):
        return '{' + ','.join(json.dumps(k) + ':' + value_key(v) for k, v in sorted(x.items())) + '}'
    if isinstance(x, list):
        return '[' + ','.join(value_key(v) for v in x) + ']'
    return json.dumps(x)


def project(values, relative):
    """The values at a relative instance path inside each pinned value ('#' every item, '*' every member value), or
    None when some pinned value does not hold that path (then the ancestor pin says nothing usable here)."""
    out = []
    for value in values:
        frontier = [value]
        for segment in relative:
            nxt = []
            for item in frontier:
                if segment == '#' and isinstance(item, list):
                    nxt.extend(item)
                elif segment == '*' and isinstance(item, dict):
                    nxt.extend(item.values())
                elif isinstance(segment, int) and isinstance(item, list) and len(item) > segment:
                    nxt.append(item[segment])
                elif isinstance(segment, str) and segment not in ('#', '*') and isinstance(item, dict) and segment in item:
                    nxt.append(item[segment])
                else:
                    return None
            frontier = nxt
        out.extend(frontier)
    return out


def absent_under_pin(nodes, ipath, union):
    """GO addition: an ancestor of the location is pinned (const/enum/null type, in scope) to values none of which
    holds the location, so the location is never present in a valid instance and no clause there is evaluated."""
    for n in nodes.values():
        node = n['node']
        if 'const' in node:
            values = [node['const']]
        elif isinstance(node.get('enum'), list):
            values = list(node['enum'])
        elif node.get('type') == 'null':
            values = [None]
        else:
            continue
        for r in n['reach']:
            here = r['ipath']
            if len(here) >= len(ipath) or ipath[:len(here)] != here or not applies(r, union):
                continue
            relative = ipath[len(here):]
            if all(project([x], relative) is None for x in values):
                return (n['node'].get('x-pm-oracle-id', '') or '?', values[:2])
    return None


def pinned(nodes, ipath, union, exclude=None):
    """Allowed values at an instance location from nodes whose reach there applies to the scope (see applies): the
    intersection of their const/enum/null-type constraints, or None when nothing pins it. `exclude` = (node id,
    keyword): that keyword of that node is not a pin (a clause never vouches for itself)."""
    allowed = None
    for n in nodes.values():
        for r in n['reach']:
            here = r['ipath']
            if len(here) > len(ipath) or ipath[:len(here)] != here or not applies(r, union):
                continue
            relative = ipath[len(here):]
            node = n['node']
            skip = exclude[1] if exclude and exclude[0] == id(node) and not relative else None
            if 'const' in node and skip != 'const':
                values = [node['const']]
            elif isinstance(node.get('enum'), list) and skip != 'enum':
                values = list(node['enum'])
            elif node.get('type') == 'null' and skip != 'type' and not relative:
                values = [None]
            else:
                continue
            if relative:  # GO addition: an ancestor pinned by const/enum pins each member to its projected values
                values = project(values, relative)
                if values is None:
                    continue
            keyed = {value_key(x): x for x in values}
            allowed = keyed if allowed is None else {k: x for k, x in allowed.items() if k in keyed}
    return allowed


def required_at(nodes, ipath, prop, union):
    return any(prop in (n['node'].get('required') or []) for n in nodes.values() for r in n['reach']
               if r['ipath'] == ipath and applies(r, union))


def condition_values(sub):
    if 'const' in sub:
        return {value_key(sub['const'])}
    if isinstance(sub.get('enum'), list):
        return {value_key(x) for x in sub['enum']}
    if sub.get('type') == 'null':
        return {value_key(None)}
    return None


def selector_clash(ipath, object_path, condition):
    """GO safety rule for branch proofs: when the clause's instance location and a member the `if` reads are
    prefix-related, a single-field defect at the clause's location can switch the branch on (and so kill the
    clause), so no unreachability claim is made for that reach."""
    for prop in condition.get('properties', {}):
        member = object_path + (prop,)
        n = min(len(member), len(ipath))
        if member[:n] == ipath[:n]:
            return True
    return False


def pinned_proof(info, nodes, v, keyword=None):  # noqa: C901
    """GO addition, two checked proofs over members pinned by const/enum inside the same union alternative:
    (1) UNREACHABLE: every reach passes a `then` whose `if` requires a present member P to take values the definition
        pins P away from (or an `else` whose `if` the pin makes always true);
    (2) COVERED_BY_CONST: every reach's own instance location is pinned to one value V that the clause's node accepts,
        so any instance the clause refuses differs from V and the pinning const refuses it as well (the structural
        form of COVERED_LATER; no kill credit)."""
    branch_reasons, covered = [], []
    for reach in info['reach']:
        reason = None
        for kind, depth, _, owner, resolver, obj in reach['ctx']:
            if kind not in ('then', 'else'):
                continue
            condition = deref(owner.get('if', {}), resolver)[0]
            object_path = reach['ipath'][:depth]
            if selector_clash(reach['ipath'], object_path, condition):
                continue
            union = scope_of(reach, nodes)
            props = condition.get('properties', {})
            taken = deref(owner.get(kind, {}), resolver)[0]
            for prop in (taken.get('properties', {}) if isinstance(taken, dict) else {}):
                # GO addition, contradicted branch: the pins in scope (the branch's own member constraint among them)
                # leave a present member no value, so no valid instance takes this branch.
                allowed = pinned(nodes, object_path + (prop,), union)
                present = prop in (taken.get('required') or []) or required_at(nodes, object_path, prop, union)
                if allowed == {} and present:
                    reason = (f'contradicted branch: inside the `{kind}` at {owner.get("x-pm-oracle-id", "")} the pins in scope '
                              f'leave the present member `{prop}` no value')
                    break
            if reason:
                break
            if kind == 'then':
                for prop, sub in props.items():
                    wanted = condition_values(deref(sub, resolver)[0])
                    allowed = pinned(nodes, object_path + (prop,), union)
                    present = prop in (condition.get('required') or []) or required_at(nodes, object_path, prop, union)
                    if wanted is not None and allowed is not None and present and not (wanted & set(allowed)):
                        reason = (f'pinned selector: the `if` at {owner.get("x-pm-oracle-id", "")} requires `{prop}` in '
                                  f'{sorted(wanted)} but the definition pins it to {sorted(allowed)} at the same object')
                        break
            elif props and set(condition) - {'x-pm-oracle-id'} <= {'properties', 'required'}:
                always = True
                for prop, sub in props.items():
                    wanted = condition_values(deref(sub, resolver)[0])
                    allowed = pinned(nodes, object_path + (prop,), union)
                    if wanted is None or allowed is None or not set(allowed) <= wanted or not required_at(nodes, object_path, prop, union):
                        always = False
                        break
                if always:
                    reason = (f'pinned selector: the definition pins every member of the `if` at {owner.get("x-pm-oracle-id", "")} '
                              'to values it accepts, so the `else` branch is never taken')
            if reason:
                break
        if reason:
            branch_reasons.append(reason)
            continue
        union = scope_of(reach, nodes)
        absent = absent_under_pin(nodes, reach['ipath'], union)
        if absent:
            branch_reasons.append(f'absent location: its ancestor is pinned at {absent[0]} to values without it '
                                  f'({json.dumps(absent[1], sort_keys=True)[:80]}), so no valid instance holds it')
            continue
        allowed = pinned(nodes, reach['ipath'], union, exclude=(id(info['node']), keyword))
        if allowed is None or len(allowed) != 1:
            return None
        value = next(iter(allowed.values()))
        try:
            COUNT[0] += 1
            accepted = not any(True for _ in v.evolve(schema=info['node'], _resolver=info['resolver']).iter_errors(value))
        except Exception:  # noqa: BLE001 - an evaluation that cannot run proves nothing
            return None
        if not accepted:
            branch_reasons.append('the clause node rejects the only value pinned at its location, so no valid instance '
                                  'reaches it in this union alternative')
            continue
        covered.append(json.dumps(value, sort_keys=True)[:120])
    if branch_reasons and not covered:
        return dict(cls='UNREACHABLE', proof=branch_reasons[0] + (f' (+{len(branch_reasons) - 1} more reaches)' if len(branch_reasons) > 1 else ''))
    if covered or branch_reasons:
        return dict(cls='COVERED_BY_CONST', proof='every reach is either an unreachable branch or a location pinned to one value '
                    'the clause accepts (' + '; '.join(covered[:2]) + '); any value the clause refuses also fails the pin')
    return None


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
            node_resolver = RESOLVERS.get(id(node), v._resolver)  # GO fix: the failing node's own document, not the root's
            try:
                target = get(value, where)
            except (KeyError, IndexError, TypeError):
                continue
            if error.validator == 'required' and isinstance(target, dict):
                for name in error.validator_value:
                    if name not in target:
                        target[name] = gen(node.get('properties', {}).get(name, {}), node_resolver, 0, 0)
                        changed = True
            elif error.validator in ('additionalProperties', 'unevaluatedProperties') and isinstance(target, dict):
                allowed = set(node.get('properties', {}))
                for name in [k for k in target if k not in allowed and not any(re.search(pat, k) for pat in node.get('patternProperties', {}))]:
                    if where + (name,) != keep[:len(where) + 1]:
                        del target[name]
                        changed = True
            elif where != keep[:len(where)]:
                generated = gen(node, node_resolver, 0, 0)
                if generated != target:
                    value = put(value, where, generated)
                    changed = True
        if not changed:
            return None
    return value if not errors_of(v, value) else None


def selectors_of(path, ipath, by_ipath):
    """(object prefix, member, choices) for every boolean/enum member of the realized member's ancestor objects,
    never on the realized member's own path; nearest ancestors first."""
    out = []
    for depth in range(len(path) - 1, -1, -1):
        prefix, on_path = path[:depth], path[depth]
        for obj_node, resolver in [(n, res) for _, n, res in by_ipath.get(tuple(ipath[:depth]), []) if 'properties' in n]:
            for k, sub in obj_node.get('properties', {}).items():
                if k == on_path:
                    continue
                sub = deref(sub, resolver)[0]
                choices = sub.get('enum', [])[:8] or ([True, False] if sub.get('type') == 'boolean' else [])
                if choices:
                    out.append((prefix, k, choices))
    return out


def flip_repair(v, value, path, ipath, by_ipath, limit=48, pair_limit=96):
    """GO addition: switch one boolean or enum member (a branch selector) of the realized member's parent object or of
    any ancestor object, never on the realized member's own path, then error-guided repair; if no single switch
    yields a value the whole definition accepts, try pairs of switches. Returns that value or None."""
    selectors = selectors_of(path, ipath, by_ipath)

    def apply(candidate, prefix, k, choice):
        try:
            target = get(candidate, prefix)
        except (KeyError, IndexError, TypeError):
            return False
        if not isinstance(target, dict) or target.get(k) == choice:
            return False
        target[k] = copy.deepcopy(choice)
        return True
    tried = 0
    for prefix, k, choices in selectors:
        for choice in choices:
            candidate = copy.deepcopy(value)
            if not apply(candidate, prefix, k, choice):
                continue
            tried += 1
            repaired = error_repair(v, candidate, path, rounds=8)
            if repaired is not None:
                return repaired
            if tried >= limit:
                break
        if tried >= limit:
            break
    tried = 0
    for i, (p1, k1, c1) in enumerate(selectors):
        for p2, k2, c2 in selectors[i + 1:]:
            for a in c1:
                for b in c2:
                    candidate = copy.deepcopy(value)
                    if not (apply(candidate, p1, k1, a) and apply(candidate, p2, k2, b)):
                        continue
                    tried += 1
                    repaired = error_repair(v, candidate, path, rounds=8)
                    if repaired is not None:
                        return repaired
                    if tried >= pair_limit:
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


CLAUSE_CAP = [900]  # GC's per-clause search cap (validations); --clause-cap lowers it for very large roots
SUITE_SHARE = 450  # GO addition: unmodified suite controls get at most half of a clause's cap (450 of the default 900)


def swap_candidates(v, controls, reach, limit=6):
    """GO addition: branch controls for a clause inside union alternatives. Innermost alternative first, the value at
    the alternative's instance location in a real control is replaced by a generated instance of that alternative
    (then error-guided repair, never at or above that location); only candidates the owner definition accepts and
    that hold the clause's location are returned."""
    out = []
    for kind, depth, index, owner, resolver, obj in reversed(reach['ctx']):
        if kind not in ('anyOf', 'oneOf'):
            continue
        alternatives = owner.get(kind) if isinstance(owner, dict) else None
        if not isinstance(alternatives, list) or index >= len(alternatives):
            continue
        location = reach['ipath'][:depth]
        for control in controls[:40]:
            for path in list(concrete(control, location))[:2]:
                for variant in range(2):
                    try:
                        built = gen(alternatives[index], resolver, 0, variant)
                        if built is None:
                            continue
                        candidate = put(copy.deepcopy(control), path, built)
                        if errors_of(v, candidate):
                            candidate = error_repair(v, candidate, path)
                    except Exception:  # noqa: BLE001 - a failed construction attempt
                        candidate = None
                    if candidate is None or errors_of(v, candidate):
                        continue
                    if any(True for _ in concrete(candidate, reach['ipath'])):
                        out.append(candidate)
                        if len(out) >= limit:
                            return out
    return out


def close_root(root, v, seeds, budget, carried=None, elsewhere=None, deadline=None,
               *, clause_name=None, nodes=None):
    carried = carried or {}
    elsewhere = elsewhere or {}
    CURRENT[0] = v
    if nodes is None:
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
    total = sum(len(clauses_of(info['node'])) for info in nodes.values())
    done = [0, time.monotonic()]
    for location, info in nodes.items():
        node = info['node']
        for keyword in clauses_of(node):
            done[0] += 1
            if time.monotonic() - done[1] > 300:  # GO addition: progress line every five minutes
                done[1] = time.monotonic()
                print(f'  {root[:60]}: clause {done[0]}/{total}, validations {COUNT[0] - root0}', file=sys.stderr, flush=True)
            name = clause_name(node, keyword) if clause_name else name_of(keyword)
            clause = location + '/' + name
            if clause in carried:  # --carry: a clause the earlier report did not leave UNCOVERED
                entries[clause] = carried[clause]
                continue
            if clause in elsewhere:  # --distinct-from: a witness for this clause exists in another root of every family
                entries[clause] = dict(cls='SEARCHED_ELSEWHERE', closed_in=elsewhere[clause])
                continue
            ident = common.schema_guard(node, keyword, clause_name=name)
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
            try:
                entries[clause] = search_clause(clause, keyword, location, info, node, ident, v, nodes, seeds, controls, known,
                                                branch_controls, by_ipath, budget, root0, deadline)
            except Exception as exc:  # noqa: BLE001 - GO: one clause's failure is recorded on that clause, never the root
                entries[clause] = dict(cls='UNCOVERED', error=(type(exc).__name__ + ': ' + str(exc))[:240])
    return entries, branch_controls, COUNT[0] - root0


def search_clause(clause, keyword, location, info, node, ident, v, nodes, seeds, controls, known, branch_controls, by_ipath,
                  budget, root0, deadline):
    """One clause's witness search and proofs (GC's loop body, unchanged apart from the GO additions marked)."""
    if True:
        if True:
            best = None
            attempts = 0
            spent = 0
            start = COUNT[0]
            out_of_time = deadline is not None and time.monotonic() > deadline
            covered_at = None  # GO addition: once COVERED_LATER is shown, search COVERED_EXTRA more for a kill
            for reach in [r for r in info['reach'] if not any(c[0] in APART for c in r['ctx'])][:6] if not out_of_time else []:
                pools = [(c, None) for c in controls[:40]]
                for variant in range(4):
                    for control in seeds[:6]:
                        pools.append((control, variant))
                pools.append((None, 'swap'))  # GO addition: union-alternative swaps once the constructions found nothing
                for control, variant in pools:
                    if COUNT[0] - root0 > budget or COUNT[0] - start > CLAUSE_CAP[0] or (
                            covered_at is not None and COUNT[0] - covered_at > COVERED_EXTRA):
                        break
                    if variant is None and COUNT[0] - start > CLAUSE_CAP[0] // 2:
                        continue  # GO addition: suite controls that never enter the branch leave room for constructions
                    if variant == 'swap':
                        if best is None:
                            pools.extend((candidate, 'swapped') for candidate in swap_candidates(v, controls, reach))
                        continue
                    if variant is None or variant == 'swapped':
                        paths = list(concrete(control, reach['ipath']))
                        base = control
                        if variant == 'swapped':
                            attempts += 1
                            fingerprint = hashlib.sha256(pickle.dumps(base, protocol=5)).hexdigest()
                            if fingerprint not in known:
                                known.add(fingerprint)
                                controls.append(base)
                                branch_controls.append(dict(clause=clause, variant='swap', sha256=fingerprint))
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
                                           control='suite' if variant is None else 'swap' if variant == 'swapped' else 'branch')
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
                proof = contradicted_branch(info, nodes) or forbidden_member(info, nodes) or excluded_by_cases(info, nodes)
                if proof:
                    best = dict(cls='UNREACHABLE', proof=proof)
                else:
                    pinned = pinned_proof(info, nodes, v, keyword)
                    if pinned:
                        best = pinned
            return best or (dict(cls='UNCOVERED', not_searched='wall-clock budget (--root-seconds) spent before this clause')
                            if out_of_time else dict(cls='UNCOVERED', construction_attempts=attempts))


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


def self_test():
    """GO standing trials for the reach walk and the scoped pins (run with --self-test)."""
    import jsonschema
    shared = {"x-pm-oracle-id": "S", "type": "string", "minLength": 3}
    schema = {"x-pm-oracle-id": "R", "type": "object", "required": ["kind", "a"], "properties": {
        "kind": {"x-pm-oracle-id": "K", "enum": ["x", "y"]},
        "a": {"x-pm-oracle-id": "A", "type": "object", "required": ["k2", "v"], "properties": {"k2": {"x-pm-oracle-id": "K2", "enum": ["p", "q"]}, "v": {"x-pm-oracle-id": "V"}},
              "allOf": [
                  {"x-pm-oracle-id": "C0", "if": {"x-pm-oracle-id": "C0if", "properties": {"k2": {"x-pm-oracle-id": "C0ifk", "const": "p"}}}, "then": {"x-pm-oracle-id": "C0then", "properties": {"v": shared}}},
                  {"x-pm-oracle-id": "C1", "if": {"x-pm-oracle-id": "C1if", "properties": {"k2": {"x-pm-oracle-id": "C1ifk", "const": "q"}}}, "then": {"x-pm-oracle-id": "C1then", "properties": {"v": shared}}}]}},
        "allOf": [{"x-pm-oracle-id": "P", "properties": {"a": {"x-pm-oracle-id": "Pa", "properties": {"k2": {"x-pm-oracle-id": "Pk2", "const": "q"}}}}}]}
    v = jsonschema.Draft202012Validator(schema)
    nodes = walk(v)
    reaches = nodes['S']['reach']
    print('S reaches', len(reaches), [[(c[0], c[1], c[3].get('x-pm-oracle-id')) for c in r['ctx']] for r in reaches])
    assert len(reaches) == 2, 'two conditionals at the same depth must give two reaches'
    # The clause S/minLength: reach via C0 is unreachable (k2 pinned to q), via C1 reachable -> no UNREACHABLE proof allowed
    proof = pinned_proof(nodes['S'], nodes, v)
    print('S proof', proof)
    assert proof is None or proof['cls'] != 'UNREACHABLE', 'must not claim UNREACHABLE: the C1 reach is live'
    # A node only under C0: unreachable
    schema2 = json.loads(json.dumps(schema).replace('"properties": {"v": {"x-pm-oracle-id": "S", "type": "string", "minLength": 3}}}}, {"x-pm-oracle-id": "C1"', '"properties": {"v": {"x-pm-oracle-id": "S0", "type": "string", "minLength": 3}}}}, {"x-pm-oracle-id": "C1"', 1))
    v2 = jsonschema.Draft202012Validator(schema2)
    n2 = walk(v2)
    p2 = pinned_proof(n2['S0'], n2, v2)
    print('S0 proof', p2)
    assert p2 and p2['cls'] == 'UNREACHABLE'
    # a pin under an else the reach is also under
    schema3 = {"x-pm-oracle-id": "R3", "type": "object", "required": ["state", "r"], "properties": {"state": {"x-pm-oracle-id": "st", "enum": ["a", "b"]}, "r": {"x-pm-oracle-id": "r"}},
      "if": {"x-pm-oracle-id": "if3", "properties": {"state": {"x-pm-oracle-id": "if3s", "const": "a"}}},
      "then": {"x-pm-oracle-id": "then3", "properties": {"r": {"x-pm-oracle-id": "rnull", "type": "null"}}},
      "else": {"x-pm-oracle-id": "else3", "properties": {"r": {"x-pm-oracle-id": "rU", "allOf": [
          {"x-pm-oracle-id": "U", "type": "object", "required": ["cid"], "properties": {"cid": {"x-pm-oracle-id": "cid", "type": ["string", "null"]}, "kind": {"x-pm-oracle-id": "kind"}},
           "allOf": [{"x-pm-oracle-id": "U0", "if": {"x-pm-oracle-id": "U0if", "properties": {"cid": {"x-pm-oracle-id": "U0c", "type": "null"}}}, "then": {"x-pm-oracle-id": "U0then", "properties": {"kind": {"x-pm-oracle-id": "U0kind", "const": "rej"}}}}]},
          {"x-pm-oracle-id": "pin", "properties": {"cid": {"x-pm-oracle-id": "pincid", "const": "cmd"}}}]}}}}
    v3 = jsonschema.Draft202012Validator(schema3)
    n3 = walk(v3)
    p3 = pinned_proof(n3['U0kind'], n3, v3)
    print('U0kind proof', p3)
    assert p3 and p3['cls'] == 'UNREACHABLE'
    # implied else: the root `then` requires `r` null, so any instance holding r.cid takes the root `else`, whose pin
    # applies to the reach through the plain anyOf member as well
    schema4 = {"x-pm-oracle-id": "R4", "type": "object", "required": ["state", "r"], "properties": {
        "state": {"x-pm-oracle-id": "st4", "enum": ["a", "b"]},
        "r": {"x-pm-oracle-id": "r4", "anyOf": [{"x-pm-oracle-id": "r4ref", "$ref": "#/$defs/U"}, {"x-pm-oracle-id": "r4null", "type": "null"}]}},
        "if": {"x-pm-oracle-id": "if4", "properties": {"state": {"x-pm-oracle-id": "if4s", "const": "a"}}},
        "then": {"x-pm-oracle-id": "then4", "properties": {"r": {"x-pm-oracle-id": "r4n", "type": "null"}}},
        "else": {"x-pm-oracle-id": "else4", "properties": {"r": {"x-pm-oracle-id": "r4pin", "properties": {"cid": {"x-pm-oracle-id": "cid4pin", "const": "cmd"}}}}},
        "$defs": {"U": {"x-pm-oracle-id": "U4", "type": "object", "required": ["cid"], "properties": {"cid": {"x-pm-oracle-id": "cid4", "type": ["string", "null"]}, "kind": {"x-pm-oracle-id": "kind4"}},
                        "allOf": [{"x-pm-oracle-id": "U4c", "if": {"x-pm-oracle-id": "U4if", "properties": {"cid": {"x-pm-oracle-id": "U4ifc", "type": "null"}}},
                                   "then": {"x-pm-oracle-id": "U4then", "properties": {"kind": {"x-pm-oracle-id": "U4kind", "const": "rej"}}}}]}}}
    v4 = jsonschema.Draft202012Validator(schema4)
    n4 = walk(v4)
    p4 = pinned_proof(n4['U4kind'], n4, v4, 'const')
    print('U4kind proof', p4)
    assert p4 and p4['cls'] == 'UNREACHABLE', 'the implied root else applies to the anyOf reach'
    # selector clash: `if p == d then p const c`; a single defect at p (p = d) enters the branch and kills the clause
    schema5 = {"x-pm-oracle-id": "R5", "type": "object", "required": ["p"], "properties": {"p": {"x-pm-oracle-id": "p5", "enum": ["c", "d", "e"]}},
               "if": {"x-pm-oracle-id": "if5", "properties": {"p": {"x-pm-oracle-id": "if5p", "const": "d"}}},
               "then": {"x-pm-oracle-id": "then5", "properties": {"p": {"x-pm-oracle-id": "then5p", "const": "c"}}}}
    v5 = jsonschema.Draft202012Validator(schema5)
    n5 = walk(v5)
    p5 = pinned_proof(n5['then5p'], n5, v5, 'const')
    print('then5p proof', p5)
    assert not p5 or p5['cls'] != 'UNREACHABLE', 'a defect at the selector itself can enter the branch'
    # a clause never vouches for itself: the only pin at a const clause's location is that const
    schema6 = {"x-pm-oracle-id": "R6", "type": "object", "properties": {"k": {"x-pm-oracle-id": "k6", "const": "x"}}}
    v6 = jsonschema.Draft202012Validator(schema6)
    n6 = walk(v6)
    p6 = pinned_proof(n6['k6'], n6, v6, 'const')
    print('k6 proof', p6)
    assert p6 is None, 'no COVERED_BY_CONST from the clause itself'
    # contradicted branch: the branch's own member constraint (null) meets an outside pin (a string const)
    schema7 = {"x-pm-oracle-id": "R7", "type": "object", "required": ["cid", "err"], "properties": {
        "cid": {"x-pm-oracle-id": "cid7", "const": "cmd"}, "err": {"x-pm-oracle-id": "err7"}, "kind": {"x-pm-oracle-id": "kind7"}},
        "allOf": [{"x-pm-oracle-id": "C7", "if": {"x-pm-oracle-id": "C7if", "properties": {"err": {"x-pm-oracle-id": "C7ife", "const": "unknown"}}},
                   "then": {"x-pm-oracle-id": "C7then", "properties": {"cid": {"x-pm-oracle-id": "C7cid", "type": "null"}, "kind": {"x-pm-oracle-id": "C7kind", "const": "rej"}}}}]}
    v7 = jsonschema.Draft202012Validator(schema7)
    n7 = walk(v7)
    p7 = pinned_proof(n7['C7kind'], n7, v7, 'const')
    print('C7kind proof', p7)
    assert p7 and p7['cls'] == 'UNREACHABLE', 'a branch the pins leave no value for a present member is never taken'
    # alternative swap: a real control holds alternative 0; the clause sits in alternative 1
    schema8 = {"x-pm-oracle-id": "R8", "type": "object", "required": ["e"], "properties": {"e": {"x-pm-oracle-id": "e8", "oneOf": [
        {"x-pm-oracle-id": "e8a", "type": "object", "additionalProperties": False, "required": ["d"], "properties": {"d": {"x-pm-oracle-id": "e8ad", "const": "u"}}},
        {"x-pm-oracle-id": "e8b", "type": "object", "additionalProperties": False, "required": ["d", "ref"], "properties": {"d": {"x-pm-oracle-id": "e8bd", "const": "n"}, "ref": {"x-pm-oracle-id": "e8bref", "type": "string", "minLength": 1}}}]}}}
    v8 = jsonschema.Draft202012Validator(schema8)
    n8 = walk(v8)
    reach8 = n8['e8bref']['reach'][0]
    swapped = swap_candidates(v8, [{"e": {"d": "u"}}], reach8)
    print('swap', swapped[:1])
    assert swapped and v8.is_valid(swapped[0]) and swapped[0]['e']['d'] == 'n'
    # an ancestor pinned by const pins each member to its projected value: a member clause is COVERED_BY_CONST
    schema9 = {"x-pm-oracle-id": "R9", "type": "object", "required": ["ref"], "properties": {"ref": {"x-pm-oracle-id": "ref9", "$ref": "#/$defs/Ref"}},
               "allOf": [{"x-pm-oracle-id": "pin9", "properties": {"ref": {"x-pm-oracle-id": "pin9ref", "const": {"path": "a.json", "ptr": "#/x"}}}}],
               "$defs": {"Ref": {"x-pm-oracle-id": "Ref9", "type": "object", "properties": {"path": {"x-pm-oracle-id": "path9", "type": "string", "pattern": "[.]json$"}, "ptr": {"x-pm-oracle-id": "ptr9", "type": "string"}}}}}
    v9 = jsonschema.Draft202012Validator(schema9)
    n9 = walk(v9)
    p9 = pinned_proof(n9['path9'], n9, v9, 'pattern')
    print('path9 proof', p9)
    assert p9 and p9['cls'] == 'COVERED_BY_CONST'
    # a document reached through a $ref: repair resolves its `#/$defs/...` in that document, not in the root
    from referencing import Registry
    from referencing.jsonschema import DRAFT202012
    inner = {"$id": "urn:go-selftest:inner", "x-pm-oracle-id": "X10", "type": "object", "required": ["a"],
             "properties": {"a": {"x-pm-oracle-id": "A10", "$ref": "#/$defs/Id"}}, "$defs": {"Id": {"x-pm-oracle-id": "Id10", "type": "string", "minLength": 1}}}
    schema10 = {"$id": "urn:go-selftest:root", "x-pm-oracle-id": "R10", "type": "object", "required": ["x"],
                "properties": {"x": {"x-pm-oracle-id": "x10", "$ref": "urn:go-selftest:inner"}}}
    v10 = jsonschema.Draft202012Validator(schema10, registry=Registry().with_resource("urn:go-selftest:inner", DRAFT202012.create_resource(inner)))
    walk(v10)
    repaired = error_repair(v10, {"x": {}}, ("x", "zz"))
    print('embedded repair', repaired)
    assert repaired is not None and v10.is_valid(repaired)
    # a member of an object whose location is pinned null is never present: UNREACHABLE
    schema11 = {"x-pm-oracle-id": "R11", "type": "object", "properties": {"o": {"x-pm-oracle-id": "o11", "oneOf": [
        {"x-pm-oracle-id": "o11ref", "$ref": "#/$defs/O"}, {"x-pm-oracle-id": "o11null", "type": "null"}]}},
        "allOf": [{"x-pm-oracle-id": "pin11", "properties": {"o": {"x-pm-oracle-id": "pin11o", "type": "null"}}}],
        "$defs": {"O": {"x-pm-oracle-id": "O11", "type": "object", "properties": {"m": {"x-pm-oracle-id": "m11", "type": "string"}}}}}
    v11 = jsonschema.Draft202012Validator(schema11)
    n11 = walk(v11)
    p11 = pinned_proof(n11['m11'], n11, v11, 'type')
    print('m11 proof', p11)
    assert p11 and p11['cls'] == 'UNREACHABLE'
    # an inline subschema with its own $id is a new base (Draft 2020-12, as the owner validators resolve)
    schema12 = {"$id": "urn:go-selftest:root12", "x-pm-oracle-id": "R12", "type": "object", "required": ["x"], "properties": {"x": {
        "$id": "urn:go-selftest:inner12", "x-pm-oracle-id": "X12", "type": "object", "required": ["a"],
        "properties": {"a": {"x-pm-oracle-id": "A12", "$ref": "#/$defs/Id"}}, "$defs": {"Id": {"x-pm-oracle-id": "Id12", "type": "string", "minLength": 1}}}}}
    v12 = jsonschema.Draft202012Validator(schema12)
    assert v12.is_valid({"x": {"a": "z"}}) and not v12.is_valid({"x": {"a": ""}}), 'the validator resolves the inline base'
    walk(v12)
    repaired12 = error_repair(v12, {"x": {}}, ("x", "zz"))
    print('inline-$id repair', repaired12)
    assert repaired12 is not None and v12.is_valid(repaired12)
    print('closure self-test pass: same-depth conditionals keep their reaches; no UNREACHABLE while one reach is live; '
          'shared and implied branch pins apply; selector clash and self-pins make no claim; contradicted branches; alternative swap; ancestor pins; absent locations; embedded-document repair')
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path)
    parser.add_argument('--self-test', action='store_true', help='run the walk and pin standing trials and exit')
    parser.add_argument('--budget', type=int, default=40000, help='validations per root')
    parser.add_argument('--shard', default='0/1', help='i/n: close only the roots whose sorted index is i mod n')
    parser.add_argument('--roots', nargs='*', help='close only roots containing one of these substrings')
    parser.add_argument('--per-clause', type=int, default=0, help='raise a root budget to this many validations per clause')
    parser.add_argument('--seeds', choices=('controls', 'authored'), default='controls', help='seed policy (see collect)')
    parser.add_argument('--skip-roots', nargs='*', default=[], help='skip roots containing one of these substrings')
    parser.add_argument('--distinct-from', nargs='*', default=[], help='reports whose witness classes (KILLED, COVERED_LATER) '
                        'close a clause for a family: in the selected roots such a clause is recorded SEARCHED_ELSEWHERE (naming '
                        'the root) when every family of the root has that witness, and not searched again')
    parser.add_argument('--seed-cap', type=int, default=0, help='accepted authored instances kept per root (GO schema rows '
                        'keep 8 by default; closure only, the sweep is unchanged)')
    parser.add_argument('--clause-cap', type=int, default=900, help='per-clause search cap in validations (GC: 900)')
    parser.add_argument('--root-seconds', type=int, default=0, help='wall-clock search budget per root; clauses reached after it '
                        'still get the static classes and proofs, otherwise UNCOVERED (not searched)')
    parser.add_argument('--carry', nargs='*', default=[], help='FILE@TOOL_COMMIT: for the selected roots found in FILE, '
                        'copy the clauses FILE classified by a witness (KILLED, COVERED_LATER; across files a KILLED witness wins) and '
                        'classify every other clause again')
    parser.add_argument('--merge', nargs='*', help='merge reports into --out (no collection); FILE or FILE@TOOL_COMMIT; '
                        'repeated roots must make identical closure claims')
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    if args.out is None:
        parser.error('--out is required')
    if args.merge:
        return merge(args.merge, args.out)
    part, total = map(int, args.shard.split('/'))
    SEED_POLICY[0] = args.seeds
    if args.seed_cap:
        import pm_goal_go_schema as schema_rows
        schema_rows.SEED_CAP = args.seed_cap
    CLAUSE_CAP[0] = args.clause_cap
    carry = {}
    for item in args.carry:
        path, _, commit = item.partition('@')
        if not commit:
            raise SystemExit('--carry needs FILE@TOOL_COMMIT')
        data = json.loads(Path(path).read_text())
        for root, entry in data['roots'].items():
            if entry.get('error'):
                continue
            label = dict(report=Path(path).name, report_sha256=hashlib.sha256(Path(path).read_bytes()).hexdigest(),
                         closure_tool=entry.get('closure_tool') or commit)
            labels, kept = carry.setdefault(root, ([], {}))
            labels.append(label)
            for c, x in entry['clauses'].items():  # every file's witnesses join; a KILLED witness beats COVERED_LATER
                if x['cls'] in WITNESSED and (c not in kept or (kept[c]['cls'] != 'KILLED' and x['cls'] == 'KILLED')):
                    kept[c] = dict(x, carried_from=dict(x.get('carried_from') or label, cls=x['cls']))
    witnessed = collections.defaultdict(dict)  # family -> clause -> 'report:root (class)'
    for item in args.distinct_from:
        data = json.loads(Path(item.partition('@')[0]).read_text())
        for other, entry in data['roots'].items():
            for c, x in entry['clauses'].items():
                if x['cls'] in WITNESSED:
                    for family in entry['families']:
                        witnessed[family].setdefault(c, f"{Path(item.partition('@')[0]).name}:{other} ({x['cls']})")
    collector, roots = collect()
    families = family_roots(collector, roots)
    print(f'roots {len(roots)}; shard {part}/{total}', file=sys.stderr, flush=True)
    report = dict(method=__doc__.split('\n\n')[0], adapted_from='scripts/pm-goal-gc-schema-closure.py@c0482747da',
                  calls=collector.calls, failures=collector.failures, roots={}, native_execution='NOT_RUN')
    for number, (root, slot) in enumerate(sorted(roots.items())):
        if number % total != part or (args.roots and not any(s in root for s in args.roots)) or any(s in root for s in args.skip_roots):
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
            fams = sorted(families.get(root, ()))
            elsewhere = {}
            if fams and args.distinct_from:
                common_clauses = set.intersection(*(set(witnessed[f]) for f in fams))
                elsewhere = {c: witnessed[fams[0]][c] for c in common_clauses if root not in witnessed[fams[0]][c]}
            deadline = time.monotonic() + args.root_seconds if args.root_seconds else None
            entries, branch_controls, spent = close_root(root, v, seeds, budget, carry.get(root, (None, {}))[1], elsewhere, deadline)
        except Exception as exc:  # noqa: BLE001 - a root that cannot be closed is reported, never skipped
            report['roots'][root] = dict(kind=slot['kind'], rows=sorted(slot['rows']), families=sorted(families.get(root, ())),
                                         seeds=len(seeds), error=type(exc).__name__ + ': ' + str(exc)[:300],
                                         counts={'UNCOVERED_ROOT_ERROR': 1}, clauses={root + '/<root>': dict(cls='UNCOVERED', error=str(exc)[:300])})
            print(f'{root[:90]}: ERROR {exc!r}'[:300], file=sys.stderr, flush=True)
            continue
        counts = collections.Counter(e['cls'] for e in entries.values())
        if args.distinct_from or args.root_seconds:
            counts_note = dict(distinct_from=list(args.distinct_from), root_seconds=args.root_seconds, clause_cap=args.clause_cap)
        else:
            counts_note = None
        report['roots'][root] = dict(kind=slot['kind'], rows=sorted(slot['rows']), sites=sorted(map(list, slot['sites']))[:12], search_limits=counts_note,
                                     families=sorted(families.get(root, ())), seeds=len(seeds),
                                     branch_controls=branch_controls, validations=spent, counts=dict(counts), clauses=entries,
                                     unresolved_refs=list(UNRESOLVED))
        if root in carry:
            report['roots'][root]['carried'] = dict(reports=carry[root][0], clauses=sum(1 for e in entries.values() if e.get('carried_from')))
        print(f'{root[:90]}: seeds={len(seeds)} {dict(counts)}', file=sys.stderr, flush=True)
        partial = dict(report, all_roots={r: sorted(families.get(r, ())) for r in sorted(roots)}, partial=True)
        args.out.with_suffix('.partial.json').write_text(json.dumps(partial, indent=1, sort_keys=True, default=str) + '\n')
    report['shard'] = args.shard
    report['seed_policy'] = args.seeds
    report['closure_tool_sha256'] = TOOL_SHA256
    for root, entry in report['roots'].items():
        entry['seed_sha256'] = sorted(roots[root]['seeds'])
        entry['seed_policy'] = args.seeds
        entry['budget_args'] = dict(budget=args.budget, per_clause=args.per_clause, clause_cap=args.clause_cap, root_seconds=args.root_seconds,
                                    seed_cap=args.seed_cap or 8)
    report['all_roots'] = {root: sorted(families.get(root, ())) for root in sorted(roots)}
    summarize(report)
    args.out.write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps({f: dict(roots=len(v['roots']), occurrences=v['occurrence_counts'], uncovered=len(v['uncovered']))
                      for f, v in report['families'].items()}))
    return 0


def merge(paths, out):
    def claim(record):
        # The source filename is assigned by this merge. The rest pins
        # the root inventory, tool, seeds, and per-clause replay claims.
        return json.dumps({k: v for k, v in record.items() if k != 'source_report'}, sort_keys=True)

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
        for root, entry in r['roots'].items():
            previous = report['roots'].get(root)
            if previous is not None and claim(previous) != claim(entry):
                print(f"duplicate root {root!r} has conflicting closure claims in "
                      f"{previous['source_report']} and {entry['source_report']}", file=sys.stderr)
                return 1
            report['roots'][root] = entry
    expected = set(reports[0]['all_roots'])
    report['missing_roots'] = sorted(expected - set(report['roots']))
    summarize(report)
    out.write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps(dict(roots=len(report['roots']), missing=len(report['missing_roots']),
                          families={f: dict(roots=len(v['roots']), uncovered=len(v['uncovered'])) for f, v in report['families'].items()})))
    return 0 if not report['missing_roots'] else 1


def summarize(report):
    rank = {'KILLED': 0, 'COVERED_LATER': 1, 'COVERED_BY_CONST': 2, 'UNREACHABLE': 3, 'VACUOUS': 4, 'SELECTOR_OR_NEGATED': 5, 'UNCOVERED': 6,
            'SEARCHED_ELSEWHERE': 7}  # SEARCHED_ELSEWHERE: the clause's witness is in another root of the family (never the best)
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
