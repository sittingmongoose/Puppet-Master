"""Per-site, per-keyword enforcement of the W3I-owned continuity schema.

Each schema location is a separate guard. $ref is resolved eagerly; all owner
keywords remain in the validator. Boolean combinators retain their exact JSON
Schema semantics. Error lists are the full validator's results, not decisions
supplied by a fixture. Shared/inherited envelope and receipt validators remain
on the complete lane checker and are not copied into this owned-schema layer.
"""
import copy
import hashlib
import importlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator
import pm_w3i_continuity_oracles as w

ROOT = Path(__file__).resolve().parents[1]
SUBJECTS = {**{'payload_' + slug: '/$defs/' + slug for slug in w.PAYLOAD_DEFS.values()},
            'projection': '/$defs/projection', 'checkpoint': '/$defs/checkpoint'}
KEYWORDS = ('type', 'const', 'enum', 'required', 'additionalProperties', 'minLength', 'maxLength',
            'pattern', 'not', 'format', 'minimum', 'maximum', 'minItems', 'maxItems', 'uniqueItems',
            'anyOf', 'oneOf', 'multipleOf', 'contains', 'minProperties', 'maxProperties')


def inventory():
    sites = []
    for subject, pointer in SUBJECTS.items():
        resolved = w.REGISTRY.resolver().lookup(w.CONTINUITY_ID + '#' + pointer)

        def walk(node, path, instance, resolver, parents=()):
            if not isinstance(node, dict):
                return
            if '$ref' in node:
                target = resolver.lookup(node['$ref'])
                walk(target.contents, path, instance, target.resolver, parents)
            for keyword in KEYWORDS:
                if keyword not in node:
                    continue
                members = node[keyword] if keyword == 'required' else [None]
                for member in members:
                    signature = path + (keyword,) + ((member,) if member is not None else ())
                    key = subject + ':' + json.dumps(signature, separators=(',', ':'))
                    sid = 'sc_' + hashlib.sha256(key.encode()).hexdigest()[:16]
                    sites.append({'id': sid, 'subject': subject, 'schema_path': list(signature),
                                  'instance_path': list(instance), 'keyword': keyword, 'member': member,
                                  'constraint': copy.deepcopy(node[keyword]), 'local': copy.deepcopy(node),
                                  'table': None, 'parents': list(parents)})
            for name, child in node.get('properties', {}).items():
                walk(child, path + ('properties', name), instance + (name,), resolver, parents)
            if isinstance(node.get('items'), dict):
                walk(node['items'], path + ('items',), instance + ('*',), resolver, parents)
            for index, child in enumerate(node.get('allOf', [])):
                walk(child, path + ('allOf', index), instance, resolver, parents)
            # if selects a branch; it is not itself a refusal. The full validator
            # supplies a then/else error only when that original branch applies.
            for branch in ('then', 'else'):
                if branch in node:
                    walk(node[branch], path + (branch,), instance, resolver, parents)
        walk(resolved.contents, (), (), resolved.resolver)
    return sites


EAGER_REF_COUNT = w.eager_refs(w.CONTINUITY_SCHEMA)
SITES = inventory()
BY_ID = {s['id']: s for s in SITES}
SIGNATURES = {(s['subject'], tuple(s['schema_path'])): s['id'] for s in SITES}


def implication(site):
    local, keyword = site['local'], site['keyword']
    prefix = tuple(site['schema_path'][:-1])
    domain = [local['const']] if 'const' in local else local.get('enum')
    if domain is not None and keyword not in ('const', 'enum', 'required', 'additionalProperties'):
        guard = Draft202012Validator({keyword: site['constraint']}, format_checker=w.DATETIME_FORMATS)
        if all(guard.is_valid(value) for value in domain):
            deciding = 'const' if 'const' in local else 'enum'
            return {'earlier': SIGNATURES[(site['subject'], prefix + (deciding,))], 'proof':
                'The finite ' + deciding + ' domain ' + repr(domain) + ' satisfies this exact ' + keyword +
                ' clause. Its violation therefore violates ' + deciding + ' at this same instance path.'}
    if keyword == 'type' and site['constraint'] == 'string' and set(local.get('not', {})) == {'pattern'}:
        return {'earlier': SIGNATURES[(site['subject'], prefix + ('not',))], 'proof':
            'JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only '
            'schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.'}
    if keyword == 'minLength' and site['constraint'] == 1 and local.get('pattern', '').endswith('+$'):
        return {'earlier': SIGNATURES[(site['subject'], prefix + ('pattern',))], 'proof':
            'The same-field anchored + pattern requires at least one character. Every minLength:1 failure is '
            'an empty string and fails that pattern. Non-strings do not trigger minLength.'}
    if keyword == 'format' and 'else' in site['schema_path'] and site['instance_path'][-1] == 'withdrawn_at_utc':
        outer = tuple(site['schema_path'][:site['schema_path'].index('allOf')])
        peer = SIGNATURES[(site['subject'], outer + ('properties', 'withdrawn_at_utc', 'anyOf'))]
        return {'earlier': peer, 'proof':
            'The earlier same-field anyOf(timestamp,null) rejects every string that violates date-time. '
            'This conditional else format applies only to strings; null and other types cannot violate format. '
            'Both use the same shared date-time profile and the unchanged timestamp definition.'}
    return None


IMPLIED = {s['id']: proof for s in SITES if (proof := implication(s)) is not None}


def expand(value, path):
    if not path:
        yield (), value
        return
    head, *tail = path
    if head == '*':
        if type(value) is list:
            for i, child in enumerate(value):
                for suffix, leaf in expand(child, tail):
                    yield (i,) + suffix, leaf
    elif type(value) is dict and head in value:
        for suffix, leaf in expand(value[head], tail):
            yield (head,) + suffix, leaf


def errors(subject, value, oracle=False):
    # Oracle expectation uses a separately loaded owner schema and registry.
    # Weakening the enforcement registry cannot move the expected target.
    validator = ORACLE_VALIDATORS[subject] if oracle else w._validator(w.CONTINUITY_ID, SUBJECTS[subject])
    result = {}
    for error in validator.iter_errors(value):
        path = tuple(error.absolute_schema_path)
        if error.validator == 'required':
            signatures = [path + (name,) for name in error.validator_value if name not in error.instance]
        else:
            signatures = [path]
        for signature in signatures:
            sid = SIGNATURES.get((subject, signature))
            if sid is None:
                raise AssertionError(('uninventoried_owner_predicate', subject, signature))
            result.setdefault(sid, []).append(list(error.absolute_path))
    # The shared format checker owns date-time. The existing W3I UUID predicate
    # restores uuid format, which that checker intentionally does not register.
    for site in SITES:
        if site['subject'] == subject and site['keyword'] == 'format' and site['constraint'] == 'uuid':
            for path, instance in expand(value, site['instance_path']):
                if type(instance) is str and not w.fullmatch(w.UUID_RE, instance):
                    result.setdefault(site['id'], []).append(list(path))
    return result


# Reload the owner bytes independently; use the same explicitly registered
# shared timestamp profile, never jsonschema's annotation-only default.
ORACLE_SCHEMA = json.loads((ROOT / 'Plans/continuity_event_contracts.schema.json').read_text())
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
ORACLE_REGISTRY = Registry().with_resource(w.CONTINUITY_ID, Resource.from_contents(
    ORACLE_SCHEMA, default_specification=DRAFT202012))
ORACLE_VALIDATORS = {subject: Draft202012Validator({'$ref': w.CONTINUITY_ID + '#' + pointer},
                      registry=ORACLE_REGISTRY, format_checker=w.DATETIME_FORMATS)
                     for subject, pointer in SUBJECTS.items()}


def projected(subject, value):
    failed = errors(subject, value)
    return {s['id']: failed.get(s['id'], []) for s in SITES if s['subject'] == subject}


def require(subject, value, trace=None):
    observed = projected(subject, value)
    refused = []
    for table in TABLES:
        if TABLE_SUBJECT[table] != subject:
            continue
        module = importlib.import_module('pm_pnc019_s4o3_schema_' + table)
        record = {sid: observed[sid] for sid in TABLES[table]}
        for sid in TABLES[table]:
            if sid in IMPLIED:
                record[IMPLIED[sid]['earlier']] = observed[IMPLIED[sid]['earlier']]
        own = [(sid, code) for sid in TABLES[table]
               if (code := getattr(module, sid)(record, None)) is not None]
        if trace is not None:
            trace.append((table, record, own))
        refused.extend(own)
    return refused


def controls():
    result = []
    for cid, case in w.build_controls():
        slug = w.PAYLOAD_DEFS[case['family']]
        result.extend([(cid + '/payload', 'payload_' + slug, copy.deepcopy(case['event']['payload'])),
                       (cid + '/projection', 'projection', copy.deepcopy(case['projection'])),
                       (cid + '/checkpoint', 'checkpoint', copy.deepcopy(case['checkpoint']))])
    # Exercise the accepted withdrawn branch with its original timestamp.
    for cid, subject, value in list(result):
        if subject == 'checkpoint' and value['state'] == 'current':
            value = copy.deepcopy(value)
            value.update(state='withdrawn', withdrawn_at_utc=w.WITHDRAW_TIME)
            result.append((cid + '/withdrawn', subject, value))
        if subject.startswith('payload_') and 'replay_checkpoint_ref' not in value:
            candidate = dict(value, replay_checkpoint_ref='a')
            if not errors(subject, candidate, oracle=True):
                result.append((cid + '/optional-ref', subject, candidate))
        if subject == 'checkpoint':
            held = copy.deepcopy(value)
            held['hold_refs'] = ['h']
            result.append((cid + '/held', subject, held))
            if held['retired_publications']:
                held = copy.deepcopy(held)
                for core in held['retired_publications']:
                    core.update(state='current', withdrawn_at_utc=None)
                result.append((cid + '/core-current-schema-only', subject, held))
    distinct = {}
    for cid, subject, value in result:
        key = subject + ':' + json.dumps(value, sort_keys=True)
        distinct.setdefault(key, (cid, subject, value))
    return list(distinct.values())


def set_path(value, path, replacement):
    if not path:
        return copy.deepcopy(replacement)
    value = copy.deepcopy(value)
    target = value
    for key in path[:-1]:
        target = target[key]
    target[path[-1]] = copy.deepcopy(replacement)
    return value


def variants(site, current):
    keyword, constraint = site['keyword'], site['constraint']
    if keyword == 'type':
        return [None, 7, True, 'other', [], {}, w.SOURCE_TIME]
    if keyword in ('const', 'enum'):
        return ['other', None, 7, True]
    if keyword == 'minLength':
        return ['' if constraint else 'x']
    if keyword == 'maxLength':
        return ['a' * (constraint + 1)]
    if keyword == 'pattern':
        return ['!', 'other', '', 'a\n']
    if keyword == 'not':
        return ['a\n', 'a\r', 'r', 'n', '\\']
    if keyword == 'format':
        return ['not-a-time', '2026-11-05T10:00:00', w.STORAGE_INSTANCE_ID + '}']
    if keyword == 'minimum':
        return [constraint - 1]
    if keyword == 'maximum':
        return [constraint + 1]
    if keyword == 'minItems':
        return [[]]
    if keyword == 'maxItems':
        item = current[0] if current else 'h'
        return [[copy.deepcopy(item) for _ in range(constraint + 1)]]
    if keyword == 'uniqueItems':
        return [[current[0], current[0]] if current else ['h', 'h']]
    if keyword in ('anyOf', 'oneOf'):
        return [7, 'invalid', [], True]
    return []


def fixtures():
    valid = controls()
    witnesses, missed, entailed = {}, [], dict(IMPLIED)
    for site in SITES:
        sid, keyword = site['id'], site['keyword']
        if sid in entailed:
            continue
        for cid, subject, base in valid:
            if subject != site['subject']:
                continue
            for path, current in expand(base, site['instance_path']):
                candidates = []
                if keyword == 'required' and type(current) is dict and site['member'] in current:
                    changed = copy.deepcopy(current)
                    changed.pop(site['member'])
                    candidates = [changed]
                elif keyword == 'additionalProperties' and type(current) is dict:
                    candidates = [dict(current, extra_member='x')]
                else:
                    candidates = variants(site, current)
                for candidate in candidates:
                    bad = set_path(base, path, candidate)
                    refused = errors(subject, bad, oracle=True)
                    if set(refused) - set(entailed) == {sid}:
                        witnesses[sid] = {'site': sid, 'subject': subject, 'control': cid,
                                          'value': bad, 'instance_path': list(path)}
                        break
                if sid in witnesses:
                    break
            if sid in witnesses:
                break
        if sid not in witnesses:
            local = site['local']
            # Exact finite-domain implication proof, not "no witness found".
            domain = [local['const']] if 'const' in local else local.get('enum')
            if domain is not None and keyword not in ('const', 'enum', 'required', 'additionalProperties'):
                guard = Draft202012Validator({keyword: site['constraint']},
                                             format_checker=w.DATETIME_FORMATS)
                if all(guard.is_valid(value) for value in domain):
                    deciding = 'const' if 'const' in local else 'enum'
                    signature = tuple(site['schema_path'][:-1]) + (deciding,)
                    peer = SIGNATURES[(site['subject'], signature)]
                    entailed[sid] = {'earlier': peer, 'proof':
                        'The finite ' + deciding + ' domain ' + repr(domain) + ' satisfies this exact ' + keyword +
                        ' clause. Its violation therefore violates ' + deciding + ' at the same instance path.'}
                    continue
            # ^[alphabet]+$ consumes at least one character whenever it matches;
            # the owner's explicit minimum of one cannot independently refuse.
            if keyword == 'minLength' and site['constraint'] == 1 and local.get('pattern', '').endswith('+$'):
                peer = SIGNATURES[(site['subject'], tuple(site['schema_path'][:-1]) + ('pattern',))]
                entailed[sid] = {'earlier': peer, 'proof':
                    'The same-field anchored + pattern requires at least one character. Every minLength:1 failure '
                    'is an empty string and fails that pattern. Non-strings do not trigger minLength.'}
                continue
            missed.append(sid)
    return valid, witnesses, entailed, missed


# Keep every field/keyword occurrence separate. Entailed rows are moved into
# single-row tables by the generator once the finite-domain proofs are known.
TABLES, TABLE_SUBJECT = {}, {}
for subject in SUBJECTS:
    own = [s for s in SITES if s['subject'] == subject and s['id'] not in IMPLIED]
    for i in range(0, len(own), 8):
        table = subject + '_' + str(i // 8)
        TABLES[table] = [s['id'] for s in own[i:i + 8]]
        TABLE_SUBJECT[table] = subject
        for site in own[i:i + 8]:
            site['table'] = table
for sid in IMPLIED:
    table = 'entailed_' + sid
    TABLES[table] = [sid]
    TABLE_SUBJECT[table] = BY_ID[sid]['subject']
    BY_ID[sid]['table'] = table
