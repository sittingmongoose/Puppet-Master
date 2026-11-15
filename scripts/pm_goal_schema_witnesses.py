"""Declared single-defect witnesses for every reached owner-schema assertion (C12-GH1, G2/G4).

For each real accepted seed of each owner validator (collected by the sweep),
walk the owner schema along the seed: properties, items, $ref, allOf, the
seed's own valid oneOf/anyOf branches and the if-selected then/else branch.
Every assertion keyword of every applied node gets edits that `emit` that
keyword: the declared target is schema_guard(node, keyword), computed from the
owner schema and the seed before the edited input runs. The complete owner
schema boundary (all keywords, shared number/date-time profiles) then judges
it; only an exact single refusal of the declared row is replayed for a kill.
Edits that refuse elsewhere, refuse twice, raise or pass are INVALID attempts
and stay listed in the ledger. Generation per (row, family) stops at the first
KILLED-eligible exact witness, after at most ATTEMPTS edits.

No edit is chosen by looking at a refusal; the generator never reads errors to
pick a target. It reads the outcome only to stop searching for a row.
"""
import collections
import copy
import hashlib
import pickle

import pm_goal_oracle_common as common

ATTEMPTS = 12          # edits that still declare the row, per (row, family, validator)
TOTAL_ATTEMPTS = 48    # every edit for the row, per (row, family, validator)
JSON_VALUES = (('null', None), ('boolean', False), ('object', {}), ('array', []),
               ('string', 'c12'), ('number', 1.5), ('integer', 7))
INVALID_FORMATS = {'date-time': '2026-02-30T12:00:00Z', 'uuid': 'c12c12c1-zzzz-4zzz-8zzz-c12c12c12c12',
                   'date': '2026-02-30', 'time': '25:00:00Z', 'email': 'no-at-sign', 'ipv4': '999.1.1.1',
                   'uri': 'not a uri', 'uri-reference': '\\\\bad', 'hostname': '-bad-'}


def json_type(value):
    if value is None:return 'null'
    if type(value) is bool:return 'boolean'
    if type(value) is int:return 'integer'
    if type(value) is float:return 'number'
    if isinstance(value, str):return 'string'
    if isinstance(value, list):return 'array'
    if isinstance(value, dict):return 'object'
    return 'opaque'


def applications(v, instance):
    """(instance path, node, context) the owner schema applies to this valid seed.

    context: `conditional` when reached through an anyOf/oneOf branch or an
    if-selected branch; `siblings` the other alternatives of that union.
    """
    out = []
    seen = set()
    def valid(sub, inst, resolver):
        try:
            return v.evolve(schema=sub, _resolver=resolver).is_valid(inst)
        except Exception:
            return False
    def kinds(sub, resolver):
        while isinstance(sub, dict) and '$ref' in sub and 'type' not in sub:
            resolved = resolver.lookup(sub['$ref'])
            sub, resolver = resolved.contents, resolved.resolver
        value = sub.get('type') if isinstance(sub, dict) else None
        return {value} if isinstance(value, str) else set(value or ())
    def walk(schema, inst, path, resolver, context, depth=0):
        if not isinstance(schema, dict) or depth > 64:
            return
        marker = (path, schema.get('x-pm-oracle-id', id(schema)))
        if marker in seen:
            return
        seen.add(marker)
        out.append((path, schema, dict(context, resolver=resolver)))
        if '$ref' in schema:
            resolved = resolver.lookup(schema['$ref'])
            walk(resolved.contents, inst, path, resolved.resolver, context, depth+1)
        for sub in schema.get('allOf', []):
            walk(sub, inst, path, resolver, context, depth+1)
        for key in ('anyOf', 'oneOf'):
            branches = schema.get(key, [])
            for number, sub in enumerate(branches):
                if valid(sub, inst, resolver):
                    siblings = set().union(*[kinds(b, resolver) for i, b in enumerate(branches) if i != number]) if len(branches) > 1 else set()
                    walk(sub, inst, path, resolver, dict(conditional=True, sibling_types=context['sibling_types'] | siblings,
                         unions=context.get('unions', ()) + (common.schema_guard(schema, key),)), depth+1)
        if 'if' in schema:
            branch = 'then' if valid(schema['if'], inst, resolver) else 'else'
            if branch in schema:
                walk(schema[branch], inst, path, resolver, dict(context, conditional=True), depth+1)
        if isinstance(inst, dict):
            for name, sub in schema.get('properties', {}).items():
                if name in inst:
                    walk(sub, inst[name], path + (name,), resolver, dict(conditional=context['conditional'], sibling_types=set(),
                         unions=context.get('unions', ())), depth+1)
        if isinstance(inst, list) and isinstance(schema.get('items'), dict):
            for index, item in enumerate(inst):
                walk(schema['items'], item, path + (index,), resolver, dict(conditional=context['conditional'], sibling_types=set(),
                     unions=context.get('unions', ())), depth+1)
    walk(v.schema, instance, (), v._resolver, dict(conditional=False, sibling_types=set(), unions=()))
    return out


def at(value, path):
    for key in path:
        value = value[key]
    return value


def put(value, path, item):
    if not path:
        return copy.deepcopy(item)
    out = copy.deepcopy(value)
    parent = out
    for key in path[:-1]:
        parent = parent[key]
    parent[path[-1]] = copy.deepcopy(item)
    return out


def different(value):
    kind = json_type(value)
    if kind == 'string':
        tweak = value[:-1] + ('b' if value[-1:] == 'a' else 'a') if value else 'a'
        return [tweak, value + '-c12', 'c12-' + value[::-1]]
    if kind == 'boolean':return [not value]
    if kind == 'integer':return [value + 1, value - 1]
    if kind == 'number':return [value + 1.0]
    if kind == 'null':return [False]
    if kind == 'array':return [value + ['c12']] if value else [['c12']]
    if kind == 'object':return [dict(value, c12_other=True)]
    return []


def edits(node, keyword, inst, pool, context=None, peers=(), pools=None):
    """Candidate replacement values (or ('remove', member) / ('add', member, value)).

    peers: const/enum values other owner nodes allow at the same instance
    path; a const or enum edit tries those first, so the edit leaves every
    other node at that location satisfied (owner text, not an observed error).
    """
    value = node[keyword]
    kind = json_type(inst)
    context = context or dict(sibling_types=set())
    if keyword == 'type':
        allowed = {value} if isinstance(value, str) else set(value)
        # A union alternative is violated only by a type no sibling allows.
        allowed |= context.get('sibling_types', set())
        if 'number' in allowed:allowed.add('integer')
        return [('replace', v) for t, v in JSON_VALUES if t not in allowed]
    if keyword == 'const':
        return [('replace', v) for v in [p for p in peers if p != value and json_type(p) == json_type(value)] + different(value)]
    if keyword == 'enum':
        out = [p for p in peers if p not in value and json_type(p) == kind]
        if kind == 'string':out += ['c12-not-in-enum']
        elif kind == 'integer':out += [max([x for x in value if type(x) is int] or [0]) + 1]
        elif kind == 'boolean':out += [x for x in (True, False) if x not in value]
        out += [v for v in different(inst) if v not in value]
        return [('replace', v) for v in out]
    if keyword == 'required' and kind == 'object':
        return [('remove', member) for member in value if member in inst]
    if keyword in ('additionalProperties', 'unevaluatedProperties') and kind == 'object':
        return [('add', 'c12_unknown_member', True)]
    if keyword == 'pattern' and kind == 'string':
        return [('replace', inst + '\n'), ('replace', '\n' + inst), ('replace', inst + ' '), ('replace', '#' + inst)]
    if keyword == 'format' and kind == 'string':
        bad = INVALID_FORMATS.get(value)
        out = [bad] if bad else []
        if value == 'uuid' and len(inst) == 36:
            out.insert(0, inst[:-1] + 'z')
        return [('replace', x) for x in out]
    if keyword == 'minLength' and kind == 'string' and value >= 1:
        return [('replace', inst[:value - 1])]
    if keyword == 'maxLength' and kind == 'string':
        return [('replace', inst + 'x' * (value - len(inst) + 1))]
    if keyword in ('minimum', 'exclusiveMinimum') and kind in ('integer', 'number'):
        below = value - 1 if keyword == 'minimum' else value
        return [('replace', below if type(value) is int else value - 0.5)]
    if keyword in ('maximum', 'exclusiveMaximum') and kind in ('integer', 'number'):
        above = value + 1 if keyword == 'maximum' else value
        return [('replace', above if type(value) is int else value + 0.5)]
    if keyword == 'minItems' and kind == 'array' and value >= 1:
        return [('replace', inst[:value - 1])]
    if keyword == 'maxItems' and kind == 'array' and not inst:
        name = context.get('member')
        pooled = (pools or {}).get(name, []) if name else []
        flat = [y for x in pooled for y in (x if isinstance(x, list) else [x]) if not isinstance(y, (list, dict))]
        items = list(dict.fromkeys(flat))[:value + 1]
        return [('replace', items)] if len(items) == value + 1 else [('replace', ['c12-item-' + str(i) for i in range(value + 1)])]
    if keyword in ('anyOf', 'oneOf'):
        # A value no alternative accepts (the union's own refusal): first by
        # removing the member, or flipping the enum member, that lets the
        # seed's alternative hold; then whole-value replacements.
        out = []
        if kind == 'object':
            for name, values in (context.get('member_enums') or {}).items():
                if name in inst:
                    out += [('merge', {name: other}) for other in values if other != inst[name]]
            required = set(node.get('required', [])) | set(context.get('required_here', ()))
            out += [('remove', member) for member in inst if member not in required]
        if kind == 'array':
            out += [('replace', [])]
        return out + [('replace', v) for _, v in JSON_VALUES + (('negative', -1),) if v != inst]
    if keyword == 'maxItems' and kind == 'array' and inst:
        extra = value - len(inst) + 1
        items = [copy.deepcopy(inst[-1]) for _ in range(extra)]
        distinct = [(x + '-c12-' + str(i)) if isinstance(x, str) else x for i, x in enumerate(items)]
        return [('replace', inst + distinct), ('replace', inst + items)]
    if keyword == 'uniqueItems' and value is True and kind == 'array' and inst:
        return [('replace', inst + [copy.deepcopy(inst[0])]), ('replace', [copy.deepcopy(inst[0])] + inst)]
    if keyword == 'not' and isinstance(value, dict):
        out = []
        if 'required' in value and kind == 'object':
            members = {m: pool.get(m, 'c12') for m in value['required'] if m not in inst}
            if members:
                out.append(('merge', members))
        if 'const' in value:out.append(('replace', value['const']))
        if 'enum' in value and value['enum']:out.append(('replace', value['enum'][0]))
        if kind == 'object':
            # A not-clause pinning members to constants: give them those values.
            pinned = {name: sub['const'] for name, sub in value.get('properties', {}).items()
                      if isinstance(sub, dict) and 'const' in sub}
            if pinned and all(name in inst or name in value.get('required', []) for name in pinned):
                out.append(('merge', pinned))
        return out
    return []


def apply(seed, path, edit):
    op = edit[0]
    if op == 'replace':
        return put(seed, path, edit[1])
    target = copy.deepcopy(at(seed, path))
    if op == 'remove':
        del target[edit[1]]
    elif op == 'add':
        target[edit[1]] = edit[2]
    elif op == 'merge':
        target.update(copy.deepcopy(edit[1]))
    return put(seed, path, target)


def value_pool(seeds):
    pool = {}
    def visit(value):
        if isinstance(value, dict):
            for key, item in value.items():
                pool.setdefault(key, copy.deepcopy(item))
                visit(item)
        elif isinstance(value, list):
            for item in value:
                visit(item)
    for _, seed, _ in seeds:
        visit(seed)
    return pool


def peer_values(nodes):
    peers = {}
    for path, node, _ in nodes:
        bucket = peers.setdefault(path, [])
        if 'const' in node:
            bucket.append(node['const'])
        for item in node.get('enum', []) if isinstance(node.get('enum'), list) else []:
            bucket.append(item)
    return peers


def synthesize(schema, resolver, name, pool, depth=0):
    """A minimal candidate instance for an owner node (seed construction only;
    every derived seed is kept only if the complete owner schema accepts it)."""
    if depth > 12 or not isinstance(schema, dict):
        return None
    while '$ref' in schema and depth < 24:
        resolved = resolver.lookup(schema['$ref'])
        schema, resolver = resolved.contents, resolved.resolver
        depth += 1
    if 'const' in schema:
        return copy.deepcopy(schema['const'])
    if isinstance(schema.get('enum'), list) and schema['enum']:
        return copy.deepcopy(schema['enum'][0])
    for branch in schema.get('allOf', []):
        if isinstance(branch, dict) and ('$ref' in branch or 'type' in branch):
            found = synthesize(dict(branch, **{k: v for k, v in schema.items() if k not in ('allOf',)}), resolver, name, pool, depth + 1)
            if found is not None:
                return found
    kinds = schema.get('type')
    kinds = [kinds] if isinstance(kinds, str) else list(kinds or [])
    if not kinds:
        for key in ('oneOf', 'anyOf'):
            for branch in schema.get(key, []):
                found = synthesize(branch, resolver, name, pool, depth + 1)
                if found is not None:
                    return found
        for candidate in pool.get(name, [])[:1]:
            return copy.deepcopy(candidate)
        return None
    kind = kinds[0]
    if kind == 'object':
        out = {}
        for member in schema.get('required', []):
            sub = schema.get('properties', {}).get(member, {})
            value = next((copy.deepcopy(x) for x in pool.get(member, [])[:1]), None)
            if value is None:
                value = synthesize(sub, resolver, member, pool, depth + 1)
            if value is None:
                return None
            out[member] = value
        return out
    if kind == 'array':
        count = schema.get('minItems', 0)
        if not count:
            return []
        item = synthesize(schema.get('items', {}), resolver, name, pool, depth + 1)
        return None if item is None else [item] + [(item + '-' + str(i)) if isinstance(item, str) else copy.deepcopy(item)
                                                     for i in range(1, count)]
    if kind == 'string':
        pooled = [x for x in pool.get(name, []) if isinstance(x, str)]
        return pooled[0] if pooled else 'c12-' + str(name or 'value') + 'x' * max(0, schema.get('minLength', 0) - 4)
    if kind == 'integer':
        return schema.get('minimum', 0) if type(schema.get('minimum', 0)) is int else 0
    if kind == 'number':
        return schema.get('minimum', 0)
    if kind == 'boolean':
        return False
    if kind == 'null':
        return None
    return None


def resolved(sub, resolver):
    for _ in range(24):
        if not (isinstance(sub, dict) and '$ref' in sub and 'enum' not in sub):
            break
        found = resolver.lookup(sub['$ref'])
        sub, resolver = found.contents, found.resolver
    return sub


def enum_of(sub, resolver):
    sub = resolved(sub, resolver)
    return sub.get('enum') if isinstance(sub, dict) and isinstance(sub.get('enum'), list) else None


def derived_seeds(v, seed, pool, limit=120):
    """Seeds that also populate optional members or empty arrays, or take
    another enum member, kept only when the complete owner schema accepts them
    (seed construction, never a witness). They let a $def or a conditional
    branch that no authored original reaches be applied."""
    out = []
    for path, node, context in applications(v, seed):
        inst = at(seed, path)
        resolver = context.get('resolver', v._resolver)
        if isinstance(inst, dict):
            # Pair flips: two enum-valued members together (transition pairs).
            enums = [(name, enum_of(sub, resolver)) for name, sub in node.get('properties', {}).items()
                     if name in inst and enum_of(sub, resolver)]
            for (left, left_values), (right, right_values) in zip(enums, enums[1:2]):
                for a_value in left_values:
                    for b_value in right_values:
                        if (a_value, b_value) == (inst[left], inst[right]) or len(out) >= limit:
                            continue
                        changed = dict(inst, **{left: a_value, right: b_value})
                        derived = put(seed, path, changed)
                        if v.is_valid(derived):
                            out.append(derived)
            for name, sub in node.get('properties', {}).items():
                if name in inst:
                    values = enum_of(sub, resolver)
                    if values:
                        for other in values:
                            if other != inst[name]:
                                derived = put(seed, path + (name,), other)
                                if v.is_valid(derived):
                                    out.append(derived)
                                    continue
                                # Flip and fill: also populate every absent member, so a
                                # branch requiring one (oneOf resteer -> new_scope) is reached.
                                filled = dict(at(derived, path))
                                for member, member_schema in node.get('properties', {}).items():
                                    if member not in filled:
                                        made = synthesize(member_schema, resolver, member, pool)
                                        if made is not None:
                                            filled[member] = made
                                derived = put(seed, path, filled)
                                if v.is_valid(derived):
                                    out.append(derived)
                    continue
                candidates = list(pool.get(name, [])[:4])
                built = synthesize(sub, resolver, name, pool)
                if built is not None:
                    candidates.append(built)
                if isinstance(sub, dict) and 'default' in sub:
                    candidates.append(copy.deepcopy(sub['default']))
                for candidate in candidates:
                    derived = put(seed, path + (name,), candidate)
                    if v.is_valid(derived):
                        out.append(derived)
                        break
        if isinstance(inst, list) and not inst and path and isinstance(path[-1], str):
            candidates = [c for c in pool.get(path[-1], [])[:4] if isinstance(c, list) and c]
            if isinstance(node.get('items'), dict):
                item = synthesize(node['items'], resolver, path[-1], pool)
                if item is not None:
                    candidates.append([item])
            for candidate in candidates:
                derived = put(seed, path, candidate)
                if v.is_valid(derived):
                    out.append(derived)
                    break
        if len(out) >= limit:
            break
    return out


def classify_accepted(v, seed, changed, path, node, context):
    """Why a declared-invalid edit passed; a FALSE_PASS candidate must be zero."""
    try:
        node_valid = v.evolve(schema=node).is_valid(at(changed, path))
    except Exception:
        node_valid = None
    if node_valid:
        return 'INVALID_EDIT_SATISFIES_NODE'
    if context.get('conditional'):
        return 'INVALID_ENCLOSING_BRANCH_ACCEPTS'
    return 'UNCONDITIONAL_FALSE_PASS_CANDIDATE'


def value_pool_lists(seeds):
    pool = {}
    def visit(value):
        if isinstance(value, dict):
            for key, item in value.items():
                bucket = pool.setdefault(key, [])
                if len(bucket) < 6 and all(item != x for x in bucket):
                    bucket.append(copy.deepcopy(item))
                visit(item)
        elif isinstance(value, list):
            for item in value:
                visit(item)
    for _, seed, _ in seeds:
        visit(seed)
    # Prefer non-empty values when a member is populated in any seed.
    for key, bucket in pool.items():
        bucket.sort(key=lambda x: (x in ([], {}, None, ''),))
    return pool


LOCAL_KEYWORDS = ('const', 'enum', 'type', 'pattern', 'minLength', 'maxLength', 'minimum', 'maximum',
                  'exclusiveMinimum', 'exclusiveMaximum', 'format', 'required', 'minItems', 'maxItems',
                  'uniqueItems', 'minProperties', 'maxProperties', 'dependentRequired', 'not',
                  'additionalProperties')


def keyword_violated(node, word, value, resolver=None, v=None):
    """One owner keyword, alone, on the value at its node (owner text; no attribution)."""
    schema = {word: node[word]}
    if word == 'additionalProperties':
        if node[word] is not False:
            return False
        schema['properties'] = {name: True for name in node.get('properties', {})}
        schema['patternProperties'] = {name: True for name in node.get('patternProperties', {})}
    try:
        if v is not None and resolver is not None:
            return not v.evolve(schema=schema, _resolver=resolver).is_valid(value)
        return not common.StrictValidator(schema, format_checker=common.FORMATS).is_valid(value)
    except Exception:
        return False


def same_duplicate_group(left, right):
    for guard, members in common._SCHEMA_DUPLICATES.items():
        group = {guard} | set(members)
        if left in group and right in group:
            return True
    return False


def declared_target(ident, node, keyword, context, path, changed, fresh, seed_nodes, assertions, v):
    """The declared refusal set of an edit, fixed before it runs, from owner text.

    The emitted keyword, reported as its innermost enclosing union when the
    edited value at that union's location violates every alternative; plus
    every owner keyword on the nodes that apply to the edited instance, at the
    edit location or an ancestor of it, that the edited instance violates on
    its own (registered type/enum/const duplicates and same-location equal
    type declarations are one unit); plus every union there that rejects.
    """
    unit = ident
    for union in reversed(context.get('unions', ())):
        holder = next(((q, n, c, w) for q, n, c in seed_nodes for w in ('anyOf', 'oneOf')
                       if w in n and len(q) <= len(path) and tuple(path[:len(q)]) == tuple(q)
                       and common.schema_guard(n, w) == union), None)
        if holder is not None and union_rejects(v, holder[1], holder[3], at(changed, holder[0]), holder[2]):
            unit = union
        break
    out = {unit}
    types_at = {}
    if keyword == 'type':
        types_at[tuple(path)] = repr(node['type'])
    for q, other, other_context in fresh:
        if len(q) > len(path) or tuple(path[:len(q)]) != tuple(q):
            continue
        value = at(changed, q)
        resolver = other_context.get('resolver')
        for word in LOCAL_KEYWORDS:
            if word not in other:
                continue
            peer = common.schema_guard(other, word)
            if peer not in assertions or peer in (ident, unit) or same_duplicate_group(peer, ident):
                continue
            if word == 'type' and types_at.get(tuple(q)) == repr(other['type']):
                continue  # the same type declared twice at one location is one assertion
            if keyword_violated(other, word, value, resolver, v):
                out.add(peer)
                if word == 'type':
                    types_at.setdefault(tuple(q), repr(other['type']))
        for word in ('anyOf', 'oneOf'):
            if word in other:
                peer = common.schema_guard(other, word)
                if peer in assertions and peer != unit and union_rejects(v, other, word, value, other_context):
                    out.add(peer)
    return out


def peer_targets_seed(ident, node, keyword, value, nodes_at_path, assertions, context=None, v=None):
    """The declared refusal set of a replace edit, fixed before it runs: the
    emitted keyword plus every other owner keyword at the same instance
    location that the new value violates on its own. Owner text decides the
    reporting unit: a registered type/enum/const duplicate is one assertion,
    and a keyword inside a union alternative reports as that union (only when
    the value violates every alternative)."""
    out = {ident}
    own_unions = set((context or {}).get('unions', ()))
    if keyword in ('anyOf', 'oneOf'):
        own_unions.add(ident)
    for other, other_context in nodes_at_path:
        unions = [u for u in other_context.get('unions', ()) if u not in own_unions]
        inside_own = bool(set(other_context.get('unions', ())) & own_unions - set((context or {}).get('unions', ())))
        for word in LOCAL_KEYWORDS:
            if word not in other or (other is node and word == keyword):
                continue
            peer = common.schema_guard(other, word)
            if peer not in assertions or same_duplicate_group(peer, ident) or not keyword_violated(other, word, value):
                continue
            if inside_own:
                continue  # an alternative of the union being edited reports as that union
            if unions:
                # Reported as its innermost union, and only if the value
                # violates every alternative of that union (owner text).
                union = unions[-1]
                holder = next(((n, c, w) for n, c in nodes_at_path for w in ('anyOf', 'oneOf')
                               if w in n and common.schema_guard(n, w) == union), None)
                if holder is not None and v is not None and union_rejects(v, holder[0], holder[2], value, holder[1]):
                    out.add(union)
            else:
                out.add(peer)
    return out


def union_rejects(v, node, keyword, value, context):
    """A union edit is declared only for a value every owner alternative refuses."""
    try:
        return all(not v.evolve(schema=branch, _resolver=context['resolver']).is_valid(value) for branch in node[keyword])
    except Exception:
        return False


def run(collector):
    """Declared keyword witnesses for every seeded validator and family."""
    stats = dict(validators=0, seeds=0, derived_seeds=0, applications=0, attempts=0, exact=0, rows_targeted=0,
                 set_targets=0, union_targets=0)
    done = {}
    exact = set()
    targeted = set()
    accepted = collections.Counter()
    groups = list(collector.schema_seeds.items())
    every = [seed for _, seeds in groups for seed in seeds]
    pool = value_pool(every)
    pools = value_pool_lists(every)
    for (schema_digest, version, family), seeds in groups:
        stats['validators'] += 1
        expanded = []
        for v, seed, prefix in seeds:
            expanded.append((v, seed, prefix))
        seen_seeds = set()
        for v, seed, prefix in seeds[:4]:
            first = derived_seeds(v, seed, pools)
            second = [d for derived in first[:8] for d in derived_seeds(v, derived, pools, limit=40)]
            for derived in first + second:
                key = hashlib.sha256(pickle.dumps(derived, protocol=5)).hexdigest()
                if key in seen_seeds:
                    continue
                seen_seeds.add(key)
                expanded.append((v, derived, prefix))
                stats['derived_seeds'] += 1
        for number, (v, seed, prefix) in enumerate(expanded):
            stats['seeds'] += 1
            assertions = common._SCHEMA_VALIDATOR_ASSERTIONS.get(id(v), set())
            def check(value, v=v, prefix=prefix):
                gate = common.Gates()
                gate.schema(v, value, prefix)
                return gate.errors
            nodes = applications(v, seed)
            peers = peer_values(nodes)
            by_path = collections.defaultdict(list)
            for path, node, context in nodes:
                by_path[path].append((node, context))
            for path, node, context in nodes:
                stats['applications'] += 1
                inst = at(seed, path)
                member_enums, required_here = {}, set()
                if isinstance(inst, dict):
                    for other, other_context in by_path[path]:
                        required_here |= set(other.get('required', []) if isinstance(other.get('required'), list) else [])
                        for name, sub in other.get('properties', {}).items():
                            values = enum_of(sub, other_context.get('resolver', v._resolver))
                            if values and name not in member_enums:
                                member_enums[name] = values
                context = dict(context, member=path[-1] if path and isinstance(path[-1], str) else None,
                               member_enums=member_enums, required_here=required_here)
                for keyword in list(node):
                    if keyword not in common._KEYWORDS:
                        continue
                    ident = common.schema_guard(node, keyword)
                    if ident not in assertions:
                        continue
                    targeted.add(ident)
                    # Budget per validator, so every owner boundary that holds
                    # the row gets its own attempts; stop once one exact
                    # single-row witness exists for the family.
                    slot = done.setdefault((ident, family, schema_digest), dict(attempts=0, total=0))
                    if (ident, family) in exact or slot['attempts'] >= ATTEMPTS or slot['total'] >= TOTAL_ATTEMPTS:
                        continue
                    for index, edit in enumerate(edits(node, keyword, inst, pool, context, peers.get(path, ()), pools)):
                        if (ident, family) in exact or slot['attempts'] >= ATTEMPTS or slot['total'] >= TOTAL_ATTEMPTS:
                            break
                        changed = apply(seed, path, edit)
                        if keyword in ('anyOf', 'oneOf') and not union_rejects(v, node, keyword, at(changed, path), context):
                            continue
                        try:
                            fresh = applications(v, changed)
                        except Exception:
                            fresh = []
                        target = declared_target(ident, node, keyword, context, path, changed, fresh,
                                                 nodes, assertions, v)
                        declared = ident if len(target) == 1 else tuple(sorted(target))
                        stats['set_targets'] += len(target) > 1
                        stats['union_targets'] += keyword in ('anyOf', 'oneOf')
                        # The row's budget counts only edits that still declare it;
                        # an edit reported through its union never uses it up.
                        if ident in target:
                            slot['attempts'] += 1
                        slot['total'] += 1
                        stats['attempts'] += 1
                        label = f'schema-keyword/{family}/{prefix}/{keyword}/{"/".join(map(str, path))}/{edit[0]}/{index}/{number}'
                        collector.invoke(label, check, changed, False, target=declared, family=family, generated=True)
                        record = collector.ledger[-1]
                        record['schema_location'] = node.get('x-pm-oracle-id')
                        record['instance_path'] = list(map(str, path))
                        if record.get('outcome') == 'exact_expected':
                            stats['exact'] += 1
                            if len(target) == 1:
                                exact.add((ident, family))
                        elif record.get('outcome') == 'accepted':
                            reason = classify_accepted(v, seed, changed, path, node, context)
                            record['generator_reason'] = reason
                            accepted[reason] += 1
    stats['rows_targeted'] = len(targeted)
    stats['row_families_attempted'] = len({(i, f) for i, f, _ in done})
    stats['row_families_exact'] = len(exact)
    stats['accepted_edits'] = dict(accepted)
    return stats
