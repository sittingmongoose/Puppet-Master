#!/usr/bin/env python3
"""DCN synthetic contract oracles. No native execution or writer admission.

Every negative has one logical defect. Mutation mode removes its individual
rule (or explicitly named redundant pair) and verifies every other refusal.
"""
from __future__ import annotations
import argparse
import base64
import copy
import json
import hashlib
import rfc8785
import blake3
import msgpack
from datetime import datetime
import re
from functools import lru_cache, wraps
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

from pm_event_index_binding import binding_digest, binding_bytes

# During removal/restoration the scenario objects are immutable. Cache only
# derived bytes/digests/deltas, never guard results. Guards still execute on
# every case; every run clears the cache, and independent predicate mutants
# outside run() always compute afresh.
_PROOF_INPUT_IDS = set()
_PROOF_VALUES = None


def proof_value(function):
    @wraps(function)
    def derive(value):
        if _PROOF_VALUES is None or id(value) not in _PROOF_INPUT_IDS:
            return function(value)
        key = (function, id(value))
        if key not in _PROOF_VALUES:
            _PROOF_VALUES[key] = function(value)
        return _PROOF_VALUES[key]
    return derive


binding_bytes = proof_value(binding_bytes)
binding_digest = proof_value(binding_digest)
validation_json = proof_value(json.dumps)


def freeze_proof_inputs(values):
    global _PROOF_INPUT_IDS, _PROOF_VALUES
    _PROOF_INPUT_IDS = set()
    def visit(value):
        if type(value) in (dict, list):
            _PROOF_INPUT_IDS.add(id(value))
            for member in (value.values() if type(value) is dict else value): visit(member)
    for value in values: visit(value)
    _PROOF_VALUES = {}


def timestamp_valid(value):
    if type(value) is not str or re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?(?:Z|[+-](?:[01][0-9]|2[0-3]):[0-5][0-9])",value) is None:
        return False
    try:
        return datetime.fromisoformat(value.replace('Z','+00:00')).tzinfo is not None
    except ValueError:
        return False


# jsonschema's optional RFC3339 dependency is absent on some workers. Never
# silently accept every timestamp because a FormatChecker plugin is missing.
FormatChecker.checkers['date-time'] = (timestamp_valid, ValueError)


ROOT = Path(__file__).resolve().parents[1]
SEMANTIC_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
    'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload', 'payload_ref',
    'redaction_profile', 'migration',
)

@lru_cache(maxsize=None)
def load(name):
    return json.loads((ROOT / 'Plans' / name).read_text())


def local_refs_resolve(schema):
    """Fail closed, including refs in unselected definitions; no network fallback."""
    def visit(node):
        if isinstance(node, dict):
            if '$ref' in node:
                ref = node['$ref']
                if not ref.startswith('#/'):
                    raise ValueError('unresolved reference: ' + ref)
                target = schema
                try:
                    for part in ref[2:].split('/'):
                        target = target[part.replace('~1', '/').replace('~0', '~')]
                except (KeyError, TypeError) as exc:
                    raise ValueError('unresolved reference: ' + ref) from exc
            for value in node.values():
                visit(value)
        elif isinstance(node, list):
            for value in node:
                visit(value)
    visit(schema)
    Draft202012Validator.check_schema(schema)


def pattern_failures(value, schema, root):
    """Full match is additional to schema validation, never Python $ matching."""
    if '$ref' in schema:
        target = root
        for part in schema['$ref'][2:].split('/'):
            target = target[part]
        return pattern_failures(value, target, root)
    if 'anyOf' in schema:
        selected = [s for s in schema['anyOf'] if Draft202012Validator(s).is_valid(value)]
        return bool(selected) and all(pattern_failures(value, s, root) for s in selected)
    if isinstance(value, str):
        if 'pattern' in schema and re.fullmatch(schema['pattern'], value) is None:
            return True
    if isinstance(value, dict):
        return any(pattern_failures(v, schema.get('properties', {}).get(k, {}), root)
                   for k, v in value.items())
    if isinstance(value, list):
        return any(pattern_failures(v, schema.get('items', {}), root) for v in value)
    return False


def contract(c):
    return next(f for f in load('card2_event_contracts.json')['families']
                if f['event_type'] == c['event']['event_type'])


def expected_key(e):
    p = e['payload']
    # Exact declared operation component precedes hex encoding (CV-366).
    operation = e['event_type'] + ':' + p['owner_operation_id']
    return ('application@1:' if e['scope_kind'] == 'application' else 'card2@1:') + \
        p['server_id'].encode().hex() + ':' + operation.encode().hex()


def partition(e):
    return 'app' if e['scope_kind'] == 'application' else 'project~' + \
        base64.urlsafe_b64encode(e['project_id'].encode()).decode().rstrip('=')


@lru_cache(maxsize=None)
def payload_validator(event_type):
    s = load('card2_event_payloads.schema.json')['$defs'][event_type.replace('.', '_')]
    return Draft202012Validator(s, format_checker=FormatChecker())


@lru_cache(maxsize=None)
def event_validator():
    return Draft202012Validator(load('event_record.schema.json'), format_checker=FormatChecker())


@lru_cache(maxsize=None)
def token_validator():
    s = copy.deepcopy(load('event_record_index_checkpoint.schema.json')['$defs']['read_token'])
    s['required'].remove('redb_snapshot_id'); del s['properties']['redb_snapshot_id']
    return Draft202012Validator(s, format_checker=FormatChecker())


# Each named rule below is independently removed by run(). Source dictionaries
# are synthetic *owner/Storage adapter witnesses*, never caller authority or
# native authentication. Current subject state is deliberately not a source.
GUARDS = {}
PATHS = {}


def rule(name, paths, predicate):
    GUARDS[name] = predicate
    PATHS[name] = set(paths.split())


rule('scenario_path', '*', lambda c:type(c.get('path')) is not str or c['path'] not in {'append','retry','history','no_event'})
rule('scenario_shape', '*', lambda c: ('event' in c)!=(c.get('path')!='no_event'))

def event_views(c):
    yield c['event']
    if c['path'] == 'retry':
        # Validate Storage's original independently, before using its result.
        yield c['storage']['event']


def event_rule(name, predicate, paths='append retry history'):
    # Payload field predicates have no value to inspect until an object exists.
    # The two structural schema guards always inspect the original value.
    rule(name, paths, lambda c: any(predicate(e, c) for e in event_views(c)
         if name in {'envelope_schema','payload_schema','payload_fullmatch','inline_size','inline_reference',
                     'scope_partition','private_thread','lineage_shape'} or name.startswith('lineage_')
         or type(e.get('payload')) is dict))


def payload_schema(e):
    return load('card2_event_payloads.schema.json')['$defs'][e['event_type'].replace('.', '_')]


def family(e):
    return next(f for f in load('card2_event_contracts.json')['families'] if f['event_type'] == e['event_type'])


def expected_event_id(e):
    p = e['payload']
    return 'card2:' + ':'.join(v.encode().hex() for v in
        [p['storage_instance_id'], p['server_id'], p['owner_operation_id'], e['event_type']])


def records(c):
    o = c['owner']; rows = c['source_records']
    return (None if o['before_record_ref'] is None else rows[o['before_record_ref']], rows[o['after_record_ref']])


def strict_equal(a,b):
    if type(a) is not type(b): return False
    if isinstance(a,dict): return a.keys()==b.keys() and all(strict_equal(a[k],b[k]) for k in a)
    if isinstance(a,list): return len(a)==len(b) and all(strict_equal(x,y) for x,y in zip(a,b))
    return a==b


# browser_session_state.v1 (Storage session record): identity/scope live in the resolved
# record metadata and are joined by record_*; facts contain the original body.
# Optional string? members preserve absence and null. No live-state default,
# numeric range, serializer or new historical recipe is introduced here.
BROWSER_REQUIRED_FACTS = {
    'session_class': (str,), 'requested_browser_runtime': (str,),
    'effective_browser_runtime': (str,), 'requested_capabilities': (list,),
    'effective_capabilities': (list,), 'capability_degradations': (list,),
    'blocked_actions': (list,), 'permission_tier': (str,), 'profile_scope': (str,),
    'restore_policy': (str,), 'takeover_state': (str,), 'url': (str,),
    'viewport': (dict,), 'scroll_position': (dict,), 'zoom_level': (int, float),
    'dev_tools_open': (bool,), 'lifecycle_state': (str,),
}
BROWSER_OPTIONAL_FACTS = {
    'workspace_tab_id': (str, type(None)), 'preview_subject_id': (str, type(None)),
    'last_error': (str, type(None)),
}
BROWSER_ENUMS = {
    'session_class': {'workspace_preview', 'detached_preview', 'automation_session', 'normal_browsing'},
    'permission_tier': {'always_allowed', 'session_granted', 'explicit_confirmation'},
    'restore_policy': {'restore_intent', 'restore_session', 'do_not_restore'},
    'takeover_state': {'none', 'offered', 'paused_for_user', 'promoted', 'stopped_keep_browser'},
    'lifecycle_state': {'open', 'closed'},
}
BROWSER_STRING_LISTS = {'requested_capabilities', 'effective_capabilities',
                        'capability_degradations', 'blocked_actions'}


def browser_field_bad(facts, key):
    if type(facts) is not dict:
        return False  # the independent object guard owns this prerequisite
    if '.' in key:
        parent, member = key.split('.')
        value = facts.get(parent)
        if type(value) is not dict:
            return False  # parent type/missing guard owns this prerequisite
        kinds = (int,) if parent == 'viewport' else (int, float)
        return type(value.get(member)) not in kinds
    if key not in facts:
        return key in BROWSER_REQUIRED_FACTS
    value = facts[key]
    if type(value) not in BROWSER_REQUIRED_FACTS.get(key, BROWSER_OPTIONAL_FACTS[key] if key in BROWSER_OPTIONAL_FACTS else ()):
        return True
    if key in BROWSER_ENUMS and value not in BROWSER_ENUMS[key]:
        return True
    if key in BROWSER_STRING_LISTS and any(type(v) is not str for v in value):
        return True
    return False


def browser_fact_bad(e, c, payload_key, fact_key, side):
    if not e['event_type'].startswith('browser.session.'):
        return False
    record = records(c)[side]
    # A missing/malformed value is refused by its source-field guard before
    # it can be used as a state observation; it is never filled or coerced.
    if record is not None and (type(record.get('facts')) is not dict or browser_field_bad(record['facts'], fact_key)):
        return False
    return not strict_equal(e['payload'][payload_key], record['facts'][fact_key] if record else None)


# §3.1 required semantic facts; identity/scope/revision are the resolved
# record metadata checked by record_* and source_* below. Optional absence is
# preserved, never filled with null or a default to make an incomplete record pass.
MEMORY_REQUIRED_FACTS = {
    'kind': str, 'status': str, 'pinned': bool, 'verification_state': str,
    'created_at': str, 'updated_at': str, 'last_access_at': str,
    'access_count': int, 'half_life_days': (int, type(None)), 'tags': list, 'claims': list,
    'summary': str, 'evidence_refs': list, 'source': str,
    'embedding_version': str, 'embed_text_hash': str, 'text_hash': str,
}
MEMORY_OPTIONAL_FACTS = {
    'details': (str, type(None)), 'run_id': (str, type(None)),
    'thread_id': (str, type(None)), 'claim_support': (list,),
    'currentness': (str,), 'deleted': (bool,),
}
CLAIM_REQUIRED = {'claim_id': str, 'text': str, 'created_at': str,
                  'evidence_support': list, 'support_scope': str, 'currentness': str}
CURRENTNESS = {'current', 'needs_revalidation', 'source_unavailable'}
EVIDENCE_MEDIA_TYPE = 'application/vnd.puppetmaster.memory-evidence-refs+msgpack'


def evidence_list_bad(value):
    return (type(value) is not list or any(type(v) is not str or
            re.fullmatch(r'[A-Za-z0-9_.:/-]{1,192}', v) is None for v in value)
            or len(value) != len(set(value)))


def memory_claims_bad(facts):
    # AMS-044/045 and section 5.3: these are actual per-claim facts, never
    # inferred from the optional gist-level summaries or the owner boolean.
    claims = facts['claims']
    ids = []
    for claim in claims:
        if type(claim) is not dict or any(type(claim.get(k)) is not kind
                                        for k, kind in CLAIM_REQUIRED.items()):
            return True
        if (not claim['claim_id'] or not claim['text'] or not timestamp_valid(claim['created_at'])
                or not claim['support_scope'].strip() or claim['currentness'] not in CURRENTNESS
                or evidence_list_bad(claim['evidence_support'])
                or not set(claim['evidence_support']) <= set(facts['evidence_refs'])):
            return True
        ids.append(claim['claim_id'])
    return len(ids) != len(set(ids))


def memory_facts_bad(facts):
    if type(facts) is not dict or not MEMORY_REQUIRED_FACTS.keys() <= facts.keys():
        return True
    for key, value in facts.items():
        kinds = MEMORY_REQUIRED_FACTS.get(key, MEMORY_OPTIONAL_FACTS.get(key, ()))
        if type(kinds) is not tuple:
            kinds = (kinds,)
        if type(value) not in kinds:
            return True
    if facts['access_count'] < 0 or (facts['half_life_days'] is not None and facts['half_life_days'] < 1):
        return True
    if facts['kind'] not in {'CurrentThread','Blocker','Constraint','Outcome','Handoff','Note','Decision','Preference','Landmine'}:
        return True
    if facts['status'] not in {'Active','Done','Archived'} or facts['verification_state'] not in {'Unverified','Verified','Discarded'}:
        return True
    if facts['source'] not in {'AutoRunBoundary','AutoMilestone','UserManual','Import'}:
        return True
    if any(not timestamp_valid(facts[k]) for k in ['created_at','updated_at','last_access_at']):
        return True
    if any(re.fullmatch('[0-9a-f]{64}',facts[k]) is None for k in ['embed_text_hash','text_hash']):
        return True
    if not facts['embedding_version'] or not facts['claims']:
        return True
    for key in ['tags', 'evidence_refs', 'claim_support']:
        if key in facts and any(type(v) is not str for v in facts[key]):
            return True
    if evidence_list_bad(facts['evidence_refs']):
        return True
    if 'claim_support' in facts and (evidence_list_bad(facts['claim_support']) or
                                    not set(facts['claim_support']) <= set(facts['evidence_refs'])):
        return True
    if 'currentness' in facts and facts['currentness'] not in CURRENTNESS:
        return True
    return memory_claims_bad(facts)


def memory_evidence(e, c):
    value = e['payload']['evidence_refs']
    if type(value) is not dict:
        return value
    # Applicability only: custody below independently validates the pack source,
    # bytes, commitment and descriptor before accepting any reference route.
    try:
        resolved = msgpack.unpackb(bytes.fromhex(c['payload_store'][value['id']]['bytes_hex']), raw=False)
        return None if evidence_list_bad(resolved) else resolved
    except (KeyError, TypeError, ValueError, msgpack.UnpackException):
        return None


def evidence_custody_bad(e, c):
    value = e['payload']['evidence_refs']
    if type(value) is list:
        return False
    row = c['payload_store'][value['id']]
    raw = bytes.fromhex(row['bytes_hex'])
    resolved = memory_evidence(e, c)
    if resolved is None:
        return True
    inline = dict(e['payload'], evidence_refs=resolved)
    return (row['authentic'] is not True or row['durable'] is not True or
            any(not strict_equal(row[k], c['owner'][k]) for k in
                ['storage_instance_id', 'server_id', 'scope_kind', 'project_id', 'thread_id']) or
            type(value['size_bytes']) is not int or value['size_bytes'] != len(raw) or
            value['media_type'] != EVIDENCE_MEDIA_TYPE or value['id'] != blake3.blake3(raw).hexdigest() or
            evidence_list_bad(resolved) or raw != binding_bytes(resolved) or
            len(binding_bytes(inline)) <= 16384)


def verified_claims_bad(e, c):
    p = e['payload']
    if (e['event_type'] != 'memory.gist_state_changed' or p['verification_state'] != 'Verified' or
            (p['operation'] != 'verify' and p['previous_verification_state'] == 'Verified') or
            (p['operation'] == 'verify' and c['owner']['manual_override'] is True)):
        return False
    facts = records(c)[1]['facts']
    # Read only values in their declared domains. Source shape rejects missing
    # or malformed fields; an unrelated malformed field never masks a genuine
    # empty-support or noncurrent claim in this independent transition guard.
    if type(facts) is not dict or type(facts.get('claims')) is not list:
        return False
    for claim in facts['claims']:
        if type(claim) is not dict:
            continue
        support = claim.get('evidence_support')
        currentness = claim.get('currentness')
        if type(support) is list and not evidence_list_bad(support) and not support:
            return True
        if type(currentness) is str and currentness in CURRENTNESS and currentness != 'current':
            return True
    return False


def verification_support_bad(e, c):
    p = e['payload']
    if (e['event_type'] != 'memory.gist_state_changed' or p['verification_state'] != 'Verified' or
            (p['operation'] != 'verify' and p['previous_verification_state'] == 'Verified')):
        return False
    o = c['owner']
    refs = memory_evidence(e, c)
    unresolved_pack = type(p['evidence_refs']) is dict and refs is None
    return (type(o['manual_override']) is not bool or type(o['claim_support_current']) is not bool or
            (o['manual_override'] and p['operation'] != 'verify') or
            (not o['manual_override'] and
             ((not unresolved_pack and not refs) or o['claim_support_current'] is not True)))


def memory_fact_bad(e, c, payload_key, fact_key, side):
    if e['event_type'] != 'memory.gist_state_changed':
        return False
    actual = memory_evidence(e, c) if fact_key == 'evidence_refs' else e['payload'][payload_key]
    if fact_key == 'evidence_refs' and type(e['payload']['evidence_refs']) is dict and actual is None:
        # No decoded observation exists until the mandatory pack custody guard
        # succeeds. Other field/lineage/record guards still execute normally.
        return False
    record = records(c)[side]
    if record is not None:
        facts = record.get('facts')
        # Completeness and exact types belong to the mandatory source-shape
        # predicate. Do not turn a missing field into a second join exception.
        kinds = MEMORY_REQUIRED_FACTS[fact_key]
        if type(kinds) is not tuple: kinds = (kinds,)
        if type(facts) is not dict or fact_key not in facts or type(facts[fact_key]) not in kinds:
            return False
        if fact_key == 'evidence_refs' and evidence_list_bad(facts[fact_key]): return False
        if fact_key == 'source' and facts[fact_key] not in {'AutoRunBoundary','AutoMilestone','UserManual','Import'}: return False
        if fact_key == 'verification_state' and facts[fact_key] not in {'Unverified','Verified','Discarded'}: return False
    expected = record['facts'][fact_key] if record else (False if fact_key == 'pinned' else None)
    return not strict_equal(actual, expected)


def semantic_digest(e):
    """The adopted EventRecord RFC 8785 recipe, not a Python equality proxy."""
    return hashlib.sha256(rfc8785.dumps({k: e[k] for k in SEMANTIC_FIELDS})).hexdigest()


@proof_value
def exact_delta(c):
    before, after = records(c)
    # Absence is distinct from a field with a null value. The canonical revision
    # is outside these semantic facts and is checked separately.
    return sorted(k for k in set(before['facts'] if before else {}) | set(after['facts'])
                  if before is None or k not in before['facts'] or k not in after['facts']
                  or not strict_equal(before['facts'][k],after['facts'][k]))


def source_metadata(e, c, key):
    return not strict_equal(e['payload'][key],c['owner'][key])


@lru_cache(maxsize=4096)
def envelope_bad(encoded):
    return not event_validator().is_valid(json.loads(encoded))


@lru_cache(maxsize=4096)
def payload_bad(event_type,encoded):
    return not payload_validator(event_type).is_valid(json.loads(encoded))


@lru_cache(maxsize=4096)
def fullmatch_bad(event_type,encoded):
    return pattern_failures(json.loads(encoded),payload_schema({'event_type':event_type}),load('card2_event_payloads.schema.json'))


event_rule('envelope_schema', lambda e,c: envelope_bad(validation_json(e)))
event_rule('payload_schema', lambda e,c: payload_bad(e['event_type'],validation_json(e['payload'])))
event_rule('payload_fullmatch', lambda e,c: fullmatch_bad(e['event_type'],validation_json(e['payload'])))
event_rule('inline_size', lambda e,c: len(binding_bytes(e['payload'])) > 16384)
event_rule('inline_reference', lambda e,c: e['payload_ref'] is not None)
for key in ['scope_kind', 'project_id', 'thread_id']:
    event_rule('scope_' + key, lambda e,c,k=key: not strict_equal(e[k],e['payload'][k]))
event_rule('scope_schema', lambda e,c: e['payload_schema_id'] != e['payload']['schema_id'] or
           e['payload']['schema_id'] != family(e)['application_payload_schema_id' if e['scope_kind']=='application' else 'payload_schema_id'])
event_rule('scope_partition', lambda e,c: c['scope_partition'] != partition(e))
event_rule('private_thread', lambda e,c: e['event_type']=='memory.gist_state_changed' and
           e['scope_kind']=='application' and e['thread_id'] is None)
for key in ['storage_instance_id', 'server_id', 'computer_id', 'thread_id', 'project_id', 'scope_kind']:
    event_rule('source_' + key, lambda e,c,k=key: source_metadata(e,c,k))
event_rule('lineage_shape', lambda e,c: (e['run_id'] is None)!=(e['attempt_id'] is None) or (e['run_id'] is None and e['node_id'] is not None))
for key in ['run_id', 'node_id', 'attempt_id']:
    event_rule('lineage_' + key, lambda e,c,k=key: not strict_equal(e[k],c['owner'][k]))
for payload_key, owner_key in [('owner_operation_id','operation_id'), ('owner_change_id','change_id'),
                               ('revision_before','before_revision'), ('revision_after','after_revision'),
                               ('before_record_ref','before_record_ref'), ('after_record_ref','after_record_ref')]:
    event_rule('source_' + payload_key, lambda e,c,p=payload_key,o=owner_key: not strict_equal(e['payload'][p],c['owner'][o]))
event_rule('source_subject', lambda e,c: e['payload'].get('gist_id',e['payload'].get('browser_session_id')) != c['owner']['subject_id'])
event_rule('source_workspace', lambda e,c: 'workspace_id' in e['payload'] and e['payload']['workspace_id'] != c['owner']['workspace_id'])
rule('source_authentic', 'append retry history', lambda c: c['owner']['authentic'] is not True)
rule('source_committed', 'append retry history', lambda c: c['owner']['committed'] is not True)
rule('current_stop', 'append retry', lambda c: c['live']['stop_generation_current'] is not True)
rule('record_resolution', 'append retry history', lambda c: any(ref is not None and ref not in c['source_records']
     for ref in [c['owner']['before_record_ref'],c['owner']['after_record_ref']]))
# Record resolution failures short circuit only dependent rules, never unrelated
# guards. This prevents malformed/unresolved sources from being dereferenced.
for key in ['subject_id','storage_instance_id','server_id','computer_id','project_id','thread_id','scope_kind','run_id','node_id','attempt_id']:
    rule('record_' + key, 'append retry history', lambda c,k=key: any(r is not None and not strict_equal(r[k],c['owner'][k]) for r in records(c)))
rule('record_revision', 'append retry history', lambda c: any(r is not None and not strict_equal(r['revision'],c['owner'][k])
     for r,k in zip(records(c),['before_revision','after_revision'])))
rule('record_ref', 'append retry history', lambda c: any(r is not None and r['record_ref'] != c['owner'][k]
     for r,k in zip(records(c),['before_record_ref','after_record_ref'])))
rule('record_workspace', 'append retry history', lambda c: any(r is not None and r.get('workspace_id') != c['owner'].get('workspace_id') for r in records(c)))
rule('command_source', 'append retry history', lambda c: c['command'] != c['owner']['command'] or c['command'] not in contract(c)['commands'])
MEMORY_COMMAND = {'verify':'cmd.chat.memory.verify','edit':'cmd.chat.memory.edit','pin':'cmd.chat.memory.pin',
                  'unpin':'cmd.chat.memory.pin','discard':'cmd.chat.memory.discard'}
event_rule('memory_command', lambda e,c: e['event_type']=='memory.gist_state_changed' and
           (not c['command'].startswith('RealMemoryProvider.') if e['payload']['operation']=='automatic'
            else c['command'] != MEMORY_COMMAND[e['payload']['operation']]))
event_rule('revision_step', lambda e,c: e['payload']['revision_after'] != e['payload']['revision_before']+1)
rule('real_change', 'append retry history', lambda c: c['owner']['real_change'] is not True)


# One field predicate per site keeps completeness/type proof independent of
# peer fields. Applied to both immutable records on all three paths, including
# retained replay-only originals; no current writer policy is consulted.
rule('browser_source_object', 'append retry history',
     lambda c: c['event']['event_type'].startswith('browser.session.') and
     any(r is not None and type(r.get('facts')) is not dict for r in records(c)))
for key in [*BROWSER_REQUIRED_FACTS, *BROWSER_OPTIONAL_FACTS,
            'viewport.width', 'viewport.height', 'scroll_position.x', 'scroll_position.y']:
    rule('browser_source_' + key, 'append retry history',
         lambda c,k=key: c['event']['event_type'].startswith('browser.session.') and
         any(r is not None and browser_field_bad(r.get('facts'), k) for r in records(c)))


def transition_bad(e, c):
    p=e['payload']; n=e['event_type']
    if n=='browser.session.created':
        return (p['revision_before']!=0 or p['before_record_ref'] is not None or
                any(p[k] is not None for k in ['previous_lifecycle_state','previous_session_class','previous_takeover_state'])
                or p['lifecycle_state']!='open' or p['changed_fields']!=['created'])
    if n=='memory.gist_state_changed' and p['revision_before']==0:
        return p['operation']!='automatic' or p['previous_verification_state'] is not None or p['before_record_ref'] is not None
    if p['revision_before']==0 or p['before_record_ref'] is None: return True
    if n=='browser.session.closed': return p['previous_lifecycle_state']!='open' or p['lifecycle_state']!='closed' or 'lifecycle_state' not in p['changed_fields']
    if n=='browser.session.promoted': return p['previous_session_class']=='normal_browsing' or p['session_class']!='normal_browsing' or 'session_class' not in p['changed_fields']
    if n=='browser.session.takeover_state_changed': return p['previous_takeover_state']==p['takeover_state'] or 'takeover_state' not in p['changed_fields']
    if n=='memory.gist_state_changed':
        op=p['operation']
        if op=='verify': return c['owner']['verification_succeeded'] is not True or c['owner']['verification_request_only'] is not False or p['verification_state']!='Verified'
        if op=='pin': return p['previous_pinned'] or not p['pinned'] or 'pinned' not in p['changed_fields']
        if op=='unpin': return not p['previous_pinned'] or p['pinned'] or 'pinned' not in p['changed_fields']
        if op=='discard': return p['previous_verification_state']=='Discarded' or p['verification_state']!='Discarded' or 'verification_state' not in p['changed_fields']
    return False


event_rule('transition', transition_bad)
event_rule('verification_support', verification_support_bad)
event_rule('memory_evidence_custody', lambda e,c: e['event_type']=='memory.gist_state_changed' and evidence_custody_bad(e,c))
event_rule('memory_verified_claims', verified_claims_bad)
rule('memory_source_shape', 'append retry history', lambda c: c['event']['event_type']=='memory.gist_state_changed' and
     any(r is not None and memory_facts_bad(r['facts']) for r in records(c)))
event_rule('memory_delta', lambda e,c: e['event_type']=='memory.gist_state_changed' and
           (not exact_delta(c) or sorted(e['payload']['changed_fields']) != exact_delta(c)))
for payload_key, fact_key, side in [('previous_pinned','pinned',0),('pinned','pinned',1),
                                   ('previous_verification_state','verification_state',0),('verification_state','verification_state',1),
                                   ('source','source',1),('evidence_refs','evidence_refs',1)]:
    event_rule('memory_fact_' + payload_key, lambda e,c,p=payload_key,k=fact_key,s=side:
               memory_fact_bad(e,c,p,k,s))

for payload_key,fact_key,side in [('previous_session_class','session_class',0),('session_class','session_class',1),
                                  ('previous_takeover_state','takeover_state',0),('takeover_state','takeover_state',1),
                                  ('previous_lifecycle_state','lifecycle_state',0),('lifecycle_state','lifecycle_state',1)]:
    event_rule('browser_fact_'+payload_key, lambda e,c,p=payload_key,k=fact_key,s=side:
               browser_fact_bad(e,c,p,k,s))
event_rule('browser_delta', lambda e,c: e['event_type'].startswith('browser.session.') and
           e['event_type']!='browser.session.created' and
           all(r is None or type(r.get('facts')) is dict for r in records(c)) and
           sorted(e['payload']['changed_fields'])!=exact_delta(c))

rule('double_record', 'append retry', lambda c: type(c['other_events']) is not list or (type(c['event']['payload']) is dict and any(o['owner_operation_id']==c['event']['payload']['owner_operation_id'] and
     o['change_id']==c['event']['payload']['owner_change_id'] and
     o['event_type'].startswith(('browser.workspace.','browser.controller_lease.') if c['event']['event_type'].startswith('browser.session.') else ('memory.gist.',))
     for o in c['other_events'])))
# Only the candidate is a current writer. Historical original policy is never
# passed to this guard, even during a current retry.
rule('replay_only', 'append retry', lambda c: c['event']['replay_policy'] != contract(c)['replay_policy'])
event_rule('idempotency', lambda e,c: e['idempotency_key'] != expected_key(e))
event_rule('event_identity', lambda e,c: e['event_id'] != expected_event_id(e))
rule('first_receipt', 'append', lambda c: type(c['publication']['terminal_published']) is not bool or type(c['publication']['append_receipt_issued']) is not bool or
     (c['publication']['terminal_published'] and not c['publication']['append_receipt_issued']))
rule('storage_authentic', 'retry history', lambda c: c['storage']['authentic'] is not True)
# The original observation is compared to a Storage-owned record, not itself.
rule('original_record', 'retry', lambda c: not strict_equal(c['retry']['original_event'],c['storage']['event']))
rule('historical_record', 'history', lambda c: not strict_equal(c['event'],c['storage']['event']))
for key in ['event_id','sequence_id','observed_at_utc','persisted_at_utc']:
    rule('storage_' + key, 'retry history', lambda c,k=key: not strict_equal(c['storage']['receipt'][k],c['storage']['event'][k]))
for key in ['observed_at_utc','persisted_at_utc']:
    rule('storage_format_'+key, 'retry history', lambda c,k=key: not isinstance(c['storage']['event'][k],str) or not FormatChecker().conforms(c['storage']['event'][k],'date-time'))
rule('storage_receipt_issued', 'retry history', lambda c: c['storage']['receipt']['issued'] is not True)
rule('retry', 'retry', lambda c: type(c['retry']['effects']) is not int or c['retry']['effects'] != 0 or type(c['retry']['dedupe_available']) is not bool or c['retry']['result'] !=
     ('dedupe_unavailable' if not c['retry']['dedupe_available'] else
      'original' if semantic_digest(c['event']) == semantic_digest(c['storage']['event']) else 'idempotency_conflict'))


@lru_cache(maxsize=4096)
def token_bad(encoded):
    v=token_validator(); value=json.loads(encoded)
    return not v.is_valid(value) or pattern_failures(value,v.schema,v.schema)


def token_schema_bad(c):
    return any(token_bad(validation_json(c['reader'][k])) for k in ['index_read_token','current_index_read_token'])


def t(c): return c['reader']['index_read_token']


rule('token_schema','history',token_schema_bad)
rule('token_observation','history',lambda c:t(c)!=c['reader']['current_index_read_token'])
rule('snapshot','history',lambda c:type(c['reader']['snapshot_id']) is not str or type(c['reader']['current_snapshot_id']) is not str or
     c['reader']['snapshot_id']!=c['reader']['current_snapshot_id'])
rule('token_storage','history',lambda c:t(c)['storage_instance_id']!=c['event']['payload']['storage_instance_id'])
rule('token_source_identity','history',lambda c:t(c)['source_selection']['storage_instance_id']!=t(c)['storage_instance_id'])
rule('token_key','history',lambda c:t(c)['checkpoint_key']!='event_record_index_checkpoint.v1:'+t(c)['storage_instance_id'])
rule('token_ref','history',lambda c:t(c)['checkpoint_ref']!=t(c)['checkpoint_key']+'#/generations/'+t(c)['generation_id'])
rule('token_dataset','history',lambda c:t(c)['index_dataset_name']!='event_record_index.v2@'+t(c)['generation_id'])
rule('reader_partition','history',lambda c:c['reader']['scope_partition']!=c['scope_partition'])
for key in ['event_id','event_type','sequence_id']:
    rule('reader_'+key,'history',lambda c,k=key:not strict_equal(c['reader'][k],c['event'][k]))
# Hash raw control bytes, and use the existing SP-278 canonical MessagePack
# binding codec for owner adapter values. No local JSON hashing substitutes.
SOURCE_BYTES = ['current_bytes_sha256','manifest_bytes_sha256']
SOURCE_VALUES = ['manifest_survivor_prefix_sha256','retained_inventory_sha256','durable_watermarks_sha256',
                 'excluded_ranges_sha256','retired_inputs_sha256']
for key in SOURCE_BYTES:
    rule('digest_'+key,'history',lambda c,k=key:t(c)['source_selection'][k]!=hashlib.sha256(bytes.fromhex(c['reader']['source_bytes'][k])).hexdigest())
for key in SOURCE_VALUES:
    rule('digest_'+key,'history',lambda c,k=key:t(c)['source_selection'][k]!=binding_digest(c['reader']['source_values'][k]))
for key in ['selected_segment_generation','manifest_generation','recovery_epoch']:
    rule('selection_'+key,'history',lambda c,k=key:not strict_equal(t(c)['source_selection'][k],c['reader']['source_facts'][k]))
rule('digest_anchor','history',lambda c:t(c)['generation_anchor_sha256']!=binding_digest(c['reader']['anchor']))
rule('digest_frontier','history',lambda c:t(c)['frontier_sha256']!=binding_digest(c['reader']['frontier']))
rule('frontier_revision','history',lambda c:not strict_equal(t(c)['frontier_revision'],c['reader']['frontier']['publication_revision']))
def generation_source(reader):
    anchor=reader['anchor']
    return {'domain':'pm.event_index.generation.v1',
            'storage_instance_id':anchor['source_selection']['storage_instance_id'],
            'projector_version':'1.0.0','source_selection':anchor['source_selection'],
            'generation_seed_sha256':anchor['generation_seed_sha256']}


rule('generation_identity','history',lambda c:t(c)['generation_id']!='eig_'+binding_digest(generation_source(c['reader'])))
rule('anchor_storage','history',lambda c:c['reader']['anchor']['source_selection']['storage_instance_id']!=t(c)['storage_instance_id'])
rule('frontier_selection','history',lambda c:not strict_equal(c['reader']['frontier']['source_selection'],t(c)['source_selection']))
rule('historical_authentic','history',lambda c:c['reader']['authentic_historical_source'] is not True)
rule('withdrawn','retry history',lambda c:c['storage']['withdrawn'] is not False)
rule('reader_withdrawn','history',lambda c:c['reader']['withdrawn'] is not False)
rule('access','history',lambda c:c['reader']['access_allowed'] is not True)
rule('deleted_disclosure','history',lambda c:c['reader']['deleted_content_requested'] is not False)
rule('reader_effect','history',lambda c:c['reader']['side_effects']!=[])
rule('family_checkpoint','history',lambda c:c['reader']['family_checkpoint'] is not None or c['reader']['prior_family_checkpoint'] is not None)
rule('command_only_count','no_event',lambda c:type(c['event_count']) is not int or c['event_count']!=0)
rule('command_only_result','no_event',lambda c:c['command_result_retained'] is not True)
rule('command_only_command','no_event',lambda c:c['command']!='cmd.chat.memory.verify')
rule('command_only_outcome','no_event',lambda c:c['outcome'] not in ['requested','failed','success_without_real_change'])
rule('command_only_source_shape','no_event',lambda c:memory_facts_bad(c['before_facts']) or memory_facts_bad(c['after_facts']))
rule('command_only_delta','no_event',lambda c:not strict_equal(c['before_facts'],c['after_facts']))
rule('command_only_verified','no_event',lambda c:c['outcome']=='success_without_real_change' and
     type(c['before_facts']) is dict and type(c['before_facts'].get('verification_state')) is str and c['before_facts']['verification_state'] in {'Unverified','Verified','Discarded'} and
     c['before_facts']['verification_state']!='Verified')


GUARDS_ORIGINAL_RESOLUTION = GUARDS['record_resolution']

def failures(c):
    result=[]
    valid_path=type(c.get('path')) is str and c['path'] in {'append','retry','history','no_event'}
    for name,guard in GUARDS.items():
        if name=='scenario_shape' and not valid_path: continue
        if name not in ['scenario_path','scenario_shape'] and (not valid_path or ('event' in c)!=(c.get('path')!='no_event')): continue
        if '*' not in PATHS[name] and c.get('path') not in PATHS[name]: continue
        if name != 'record_resolution' and name.startswith(('record_', 'memory_source_shape', 'memory_verified_claims', 'memory_delta','memory_fact_','browser_source_','browser_fact_','browser_delta')) and GUARDS_ORIGINAL_RESOLUTION(c): continue
        try:
            if guard(c): result.append(name)
        except (KeyError,TypeError,ValueError,IndexError,StopIteration,AttributeError):
            # Malformed observations never become successes through exceptions.
            result.append(name)
    return result


def mutate(base, changes):
    c=copy.deepcopy(base)
    for pointer,value in changes:
        parts=pointer.strip('/').split('/'); target=c
        for part in parts[:-1]: target=target[int(part)] if isinstance(target,list) else target[part]
        target[int(parts[-1]) if isinstance(target,list) else parts[-1]]=copy.deepcopy(value)
    return c


def _run(fixtures=None, event_type=None):
    for name in ['card2_event_payloads.schema.json','event_record.schema.json','event_record_index_checkpoint.schema.json']:
        local_refs_resolve(load(name))
    fixtures=fixtures or load('card2_event_fixtures.json')
    if event_type is not None:
        fixtures = copy.deepcopy(fixtures)
        fixtures['positives'] = [c for c in fixtures['positives'] if c['event']['event_type'] == event_type]
        fixtures['no_event_cases'] = fixtures['no_event_cases'] if event_type == 'memory.gist_state_changed' else []
        selected = {c['id'] for c in fixtures['positives'] + fixtures['no_event_cases']}
        fixtures['negative_cases'] = [c for c in fixtures['negative_cases'] if c['base'] in selected]
    # json.loads consumes the entire number, so 01/00/-01 never enter an
    # identity, canonical digest or retry as an alternative spelling.
    for case in fixtures.get('parse_rejections', []):
        try:
            json.loads(case['json_number'])
        except json.JSONDecodeError:
            continue
        raise ValueError('non-JSON number accepted: ' + case['id'])
    bases={c['id']:c for c in fixtures['positives']+fixtures['no_event_cases']}
    errors=[]; negatives=[]; table=[]
    for c in bases.values():
        f=failures(c)
        if f: errors.append({'case':c['id'],'unexpected_failures':f})
    for case in fixtures['negative_cases']:
        if not case.get('defect'): errors.append({'case':case['id'],'error':'missing single-defect explanation'})
        c=mutate(bases[case['base']],case['changes']); f=failures(c)
        expected=case.get('guards',[case['guard']])
        if set(f)!=set(expected): errors.append({'case':case['id'],'expected':expected,'actual':f})
        negatives.append((case,c))
    freeze_proof_inputs([*bases.values(), *(c for case,c in negatives)])
    for name in GUARDS:
        # Explicit intentional duplicate sets are removed together, not hidden by
        # suppressing a composite function. Every other predicate still runs.
        groups={tuple(sorted(case.get('guards',[case['guard']]))) for case,c in negatives if name in case.get('guards',[case['guard']])}
        if not groups and event_type is None: errors.append({'guard':name,'error':'unproved guard'})
        # A named duplicate is also removed site by site. Removing one site
        # alone must leave the same-defect refusal at every remaining site.
        groups |= {(name,)} if groups else set()
        for group in sorted(groups):
            saved={g:GUARDS[g] for g in group}; flipped=[]; stayed=[]
            try:
                for g in group: GUARDS[g]=lambda c:False
                for case,c in negatives:
                    expected=set(case.get('guards',[case['guard']]))-set(group); actual=set(failures(c))
                    if actual!=expected: errors.append({'removed':group,'case':case['id'],'expected':sorted(expected),'actual':sorted(actual)})
                    if not expected: flipped.append(case['id'])
                    else: stayed.append(case['id'])
            finally: GUARDS.update(saved)
            restored=all(set(failures(c))==set(case.get('guards',[case['guard']])) for case,c in negatives)
            table.append({'guard':name,'removed_together':list(group),'negatives_that_flip':flipped,
                          'negatives_that_stay_rejected':stayed,'restored':restored})
            if not restored: errors.append({'guard':name,'error':'restoration failed'})
    for f in load('card2_event_contracts.json')['families']:
        if event_type is not None and f['event_type'] != event_type: continue
        for scope in ['project','application']:
            for path in ['append','retry','history']:
                if not any(c.get('path')==path and c['event']['event_type']==f['event_type'] and c['event']['scope_kind']==scope for c in bases.values()):
                    errors.append({'missing_positive':[f['event_type'],scope,path]})
    return {'status':'FAIL' if errors else 'PASS','native_execution':'NOT_RUN','admission':'ABSENT',
            'positives':len(bases),'negatives':len(negatives),'guard_removal_table':table,'errors':errors}


def run(fixtures=None, event_type=None):
    global _PROOF_VALUES, _PROOF_INPUT_IDS
    try:
        return _run(fixtures, event_type)
    finally:
        _PROOF_VALUES = None
        _PROOF_INPUT_IDS = set()


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path);parser.add_argument('--fixtures',type=Path);parser.add_argument('--family',choices=[f['event_type'] for f in load('card2_event_contracts.json')['families']]);args=parser.parse_args()
    try: result=run(json.loads(args.fixtures.read_text()) if args.fixtures else None, args.family)
    except Exception as exc: result={'status':'FAIL','errors':[str(exc)]}
    if args.output:args.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='guard_removal_table'},indent=2))
    raise SystemExit(0 if result['status']=='PASS' else 1)
