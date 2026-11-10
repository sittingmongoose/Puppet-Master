#!/usr/bin/env python3
"""DCN synthetic contract oracles. No native execution or writer admission.

Method B guard tables (sweep part 2A). Every refusal is decided by one named row
of a generated table module ``scripts/pm_card2_table_<table>.py`` (generator:
``scripts/pm-card2-table-generate.py``; the row specification is ``ROWS`` below).
Derivation code computes one boolean observation per row from the complete
scenario: True when the row's single predicate holds or the row does not apply
(wrong path, wrong family, or a precondition that an earlier row owns). It never
decides acceptance. ``refusal`` evaluates the table predicates in table order and
returns the first refusing row. Check 11 is proved by ``scripts/pm_guard_isolation.py``
through ``scripts/pm-card2-guard-tables.py``.

Numbers (sweep part 2B numbers): fixture text is parsed with the shared
``loads_exact`` and every integer token becomes an exact integer through
``current_integer`` (CV-1100); schema integer slots are admitted through
``current_integer``; Storage ``sequence_id`` through ``storage_uint64`` (SP-1100);
the retry comparison uses the shared ``producer_semantic_digest`` (CV-317/CV-1100),
qualified before any effect. Timestamps keep the interim lane grammar below
(``timestamp_valid``); CV-1101 adoption is part 2B.
"""
from __future__ import annotations
import argparse
import base64
import copy
import importlib
import json
import hashlib
import math
import sys
import ast
import blake3
import msgpack
from datetime import datetime
import re
from functools import lru_cache
from contextlib import contextmanager
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker, validators

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pm_event_index_binding import binding_digest, binding_bytes  # noqa: E402
from pm_event_numbers import (  # noqa: E402
    JsonNumber, Refusal, current_integer, loads_exact, producer_semantic_bytes,
    producer_semantic_digest, storage_uint64,
)


# Interim timestamp grammar (part 2B adopts CV-1101 datetime_validator/date_time).
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
TABLE_PREFIX = 'pm_card2_table_'
PATH_NAMES = ('append', 'retry', 'history', 'no_event')
EVENT_PATHS = 'append retry history'
CAUGHT = (KeyError, TypeError, ValueError, IndexError, StopIteration, AttributeError, OverflowError)
U32_MAX = 2**32 - 1


def materialize(value):
    """Exact numbers from the shared lossless tree: integers through current_integer
    (CV-1100 integer token, no digit limit, '-0' refused), finite JSON floats as floats."""
    if type(value) is JsonNumber:
        return current_integer(value) if value.integer else float(value.token)
    if type(value) is list:
        return [materialize(v) for v in value]
    if type(value) is dict:
        return {k: materialize(v) for k, v in value.items()}
    return value


def loads_fixture(text):
    return materialize(loads_exact(text))


@lru_cache(maxsize=None)
def load(name):
    if name == 'card2_event_p2a_cases.json' and not (ROOT / 'Plans' / name).exists():
        return {'cases': []}
    text = (ROOT / 'Plans' / name).read_text()
    return loads_fixture(text) if name.startswith('card2_event_') and name.endswith('fixtures.json') or name == 'card2_event_p2a_cases.json' else json.loads(text)


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
        return bool(selected) and all([pattern_failures(value, s, root) for s in selected])
    if isinstance(value, str):
        if 'pattern' in schema and re.fullmatch(schema['pattern'], value) is None:
            return True
    if isinstance(value, dict):
        return any([pattern_failures(v, schema.get('properties', {}).get(k, {}), root)
                    for k, v in value.items()])
    if isinstance(value, list):
        return any([pattern_failures(v, schema.get('items', {}), root) for v in value])
    return False


def contract(c):
    return next(f for f in load('card2_event_contracts.json')['families']
                if f['event_type'] == c['event']['event_type'])


def family(e):
    return next(f for f in load('card2_event_contracts.json')['families'] if f['event_type'] == e['event_type'])


def expected_key(e):
    p = e['payload']
    # Exact declared operation component precedes hex encoding (CV-366).
    operation = e['event_type'] + ':' + p['owner_operation_id']
    return ('application@1:' if e['scope_kind'] == 'application' else 'card2@1:') + \
        p['server_id'].encode().hex() + ':' + operation.encode().hex()


def expected_event_id(e):
    p = e['payload']
    return 'card2:' + ':'.join([v.encode().hex() for v in
        [p['storage_instance_id'], p['server_id'], p['owner_operation_id'], e['event_type']]])


def partition(e):
    return 'app' if e['scope_kind'] == 'application' else 'project~' + \
        base64.urlsafe_b64encode(e['project_id'].encode()).decode().rstrip('=')


def payload_schema(event_type):
    return load('card2_event_payloads.schema.json')['$defs'][event_type.replace('.', '_')]


@lru_cache(maxsize=None)
def payload_validator(event_type):
    return Draft202012Validator(payload_schema(event_type), format_checker=FormatChecker())


@lru_cache(maxsize=None)
def event_validator():
    return Draft202012Validator(load('event_record.schema.json'), format_checker=FormatChecker())


@lru_cache(maxsize=None)
def token_schema():
    s = copy.deepcopy(load('event_record_index_checkpoint.schema.json')['$defs']['read_token'])
    s['required'].remove('redb_snapshot_id'); del s['properties']['redb_snapshot_id']
    return s


@lru_cache(maxsize=None)
def token_validator():
    return Draft202012Validator(token_schema(), format_checker=FormatChecker())


# CV-1100 integer slots: the stock Draft 2020-12 'integer' type also admits an
# integral float (1.0). A recording type checker collects every instance the
# stock check admitted as an integer; each must then be an exact current integer.
_SLOTS = []
_STOCK_TYPES = Draft202012Validator.TYPE_CHECKER


def _recording_integer(checker, instance):
    admitted = _STOCK_TYPES.is_type(instance, 'integer')
    if admitted:
        _SLOTS.append(instance)
    return admitted


SlotValidator = validators.extend(
    Draft202012Validator, type_checker=_STOCK_TYPES.redefine('integer', _recording_integer))


@lru_cache(maxsize=None)
def slot_validator(kind, event_type=None):
    schema = {'envelope': lambda: load('event_record.schema.json'), 'token': token_schema,
              'payload': lambda: payload_schema(event_type)}[kind]()
    return SlotValidator(schema)


def integer_slots_exact(kind, instance, event_type=None):
    del _SLOTS[:]
    slot_validator(kind, event_type).is_valid(instance)
    found = list(_SLOTS)
    del _SLOTS[:]
    for value in found:
        current_integer(value)          # raises Refusal on 1.0 / 1e0 forms
    return True


def strict_equal(a, b):
    """Exact typed equality: bool is never int, int never float, and floats
    compare by their IEEE754 bits so signed zero is never erased (SP-1100)."""
    if type(a) is not type(b): return False
    if isinstance(a, dict): return a.keys() == b.keys() and all([strict_equal(a[k], b[k]) for k in a])
    if isinstance(a, list): return len(a) == len(b) and all([strict_equal(x, y) for x, y in zip(a, b)])
    if type(a) is float: return a.hex() == b.hex()
    return a == b


def records(c):
    o = c['owner']; rows = c['source_records']
    return (None if o['before_record_ref'] is None else rows[o['before_record_ref']], rows[o['after_record_ref']])


def resolved(c):
    """Record resolution (rows record_resolution_*) owns unresolved references."""
    o = c['owner']
    return all([ref is None or ref in c['source_records'] for ref in [o['before_record_ref'], o['after_record_ref']]])


def is_browser(e):
    return e['event_type'].startswith('browser.session.')


def is_memory(e):
    return e['event_type'] == 'memory.gist_state_changed'


# browser_session_state.v1 (Storage session record): identity/scope live in the resolved
# record metadata and are joined by record_*; facts contain the original body.
# Nullable string? slots are required and accept null.
BROWSER_REQUIRED_FACTS = {
    'session_class': (str,), 'requested_browser_runtime': (str,),
    'effective_browser_runtime': (str,), 'requested_capabilities': (list,),
    'effective_capabilities': (list,), 'capability_degradations': (list,),
    'blocked_actions': (list,), 'permission_tier': (str,), 'profile_scope': (str,),
    'restore_policy': (str,), 'takeover_state': (str,), 'url': (str,),
    'viewport': (dict,), 'scroll_position': (dict,), 'zoom_level': (int, float),
    'dev_tools_open': (bool,), 'lifecycle_state': (str,),
}
BROWSER_NULLABLE_FACTS = {
    'workspace_tab_id': (str, type(None)), 'preview_subject_id': (str, type(None)),
    'last_error': (str, type(None)),
}
BROWSER_KINDS = {**BROWSER_REQUIRED_FACTS, **BROWSER_NULLABLE_FACTS}
BROWSER_ENUMS = {
    'session_class': {'workspace_preview', 'detached_preview', 'automation_session', 'normal_browsing'},
    'permission_tier': {'always_allowed', 'session_granted', 'explicit_confirmation'},
    'restore_policy': {'restore_intent', 'restore_session', 'do_not_restore'},
    'takeover_state': {'none', 'offered', 'paused_for_user', 'promoted', 'stopped_keep_browser'},
    'lifecycle_state': {'open', 'closed'},
}
BROWSER_STRING_LISTS = ('requested_capabilities', 'effective_capabilities',
                        'capability_degradations', 'blocked_actions')
BROWSER_NESTED = {'viewport.width': (int,), 'viewport.height': (int,),
                  'scroll_position.x': (int, float), 'scroll_position.y': (int, float)}


def browser_value_ok(facts, key):
    """The field is present and of its declared type (its own type rows own the rest)."""
    if '.' in key:
        parent, member = key.split('.')
        return type(facts.get(parent)) is dict and type(facts[parent].get(member)) in BROWSER_NESTED[key]
    return key in facts and type(facts[key]) in BROWSER_KINDS[key]


def f64_exact(value):
    """SP-1100 physical f64: a finite IEEE754 value; an integer only when exactly representable."""
    if type(value) is float:
        return math.isfinite(value)
    as_float = float(value)
    return math.isfinite(as_float) and int(as_float) == value


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
MEMORY_ENUMS = {
    'kind': {'CurrentThread', 'Blocker', 'Constraint', 'Outcome', 'Handoff', 'Note', 'Decision', 'Preference', 'Landmine'},
    'status': {'Active', 'Done', 'Archived'}, 'verification_state': {'Unverified', 'Verified', 'Discarded'},
    'source': {'AutoRunBoundary', 'AutoMilestone', 'UserManual', 'Import'},
}
CLAIM_REQUIRED = {'claim_id': str, 'text': str, 'created_at': str,
                  'evidence_support': list, 'support_scope': str, 'currentness': str}
CURRENTNESS = {'current', 'needs_revalidation', 'source_unavailable'}
EVIDENCE_MEDIA_TYPE = 'application/vnd.puppetmaster.memory-evidence-refs+msgpack'
EVIDENCE_PATTERN = r'[A-Za-z0-9_.:/-]{1,192}'


def kinds_of(table, key):
    kinds = table[key]
    return kinds if type(kinds) is tuple else (kinds,)


def memory_typed(facts, key):
    """Present with its declared type: value rows on this field are applicable."""
    table = MEMORY_REQUIRED_FACTS if key in MEMORY_REQUIRED_FACTS else MEMORY_OPTIONAL_FACTS
    return key in facts and type(facts[key]) in kinds_of(table, key)


def string_list(value):
    return type(value) is list and all([type(v) is str for v in value])


def memory_shape_ok(facts):
    """Every memory source-shape row holds (used only as a precondition of the
    dependent delta rows; the shape rows themselves refuse malformed records)."""
    for fn in MEMORY_SHAPE.values():
        try:
            if fn(facts) is not True:
                return False
        except CAUGHT:
            return False
    return True


def memory_evidence(e, c):
    value = e['payload']['evidence_refs']
    if type(value) is not dict:
        return value
    try:
        resolved_value = msgpack.unpackb(bytes.fromhex(c['payload_store'][value['id']]['bytes_hex']), raw=False)
    except (KeyError, TypeError, ValueError, msgpack.UnpackException):
        return None
    if (not string_list(resolved_value) or
            any([re.fullmatch(EVIDENCE_PATTERN, v) is None for v in resolved_value]) or
            len(resolved_value) != len(set(resolved_value))):
        return None
    return resolved_value


def exact_delta(c):
    before, after = records(c)
    # Absence is distinct from a field with a null value. The canonical revision
    # is outside these semantic facts and is checked separately.
    return sorted(k for k in set(before['facts'] if before else {}) | set(after['facts'])
                  if before is None or k not in before['facts'] or k not in after['facts']
                  or not strict_equal(before['facts'][k], after['facts'][k]))


def schema_valid(e):
    return event_validator().is_valid(e)


def envelope_ready(e):
    """Envelope stock verdict and its CV-1100 integer slots hold."""
    try:
        return schema_valid(e) and integer_slots_exact('envelope', e)
    except CAUGHT:
        return False


def payload_ready(e):
    """Object payload, stock payload verdict and its CV-1100 integer slots hold."""
    try:
        p = e['payload']
        return type(p) is dict and payload_validator(e['event_type']).is_valid(p) and \
            integer_slots_exact('payload', p, e['event_type'])
    except CAUGHT:
        return False


def token_ready(token):
    try:
        return token_validator().is_valid(token)
    except CAUGHT:
        return False


# ---------------------------------------------------------------------------
# Row specification. Every row: one predicate over one subject. ``fn(c)`` is
# True when the predicate holds or does not apply. Codes keep the original guard
# names so every pre-existing negative still names its row by code.
# ---------------------------------------------------------------------------
ROWS = []
TABLES = []
ENTAILED = {}   # row id -> (rows that always refuse first, proof)


def row(table, rid, code, field, words, fn, paths=EVENT_PATHS):
    if table not in TABLES:
        TABLES.append(table)
    if any([r['id'] == rid for r in ROWS]):
        raise ValueError('duplicate row ' + rid)
    ROWS.append({'table': table, 'id': rid, 'code': code, 'field': field, 'words': words,
                 'fn': fn, 'paths': frozenset(paths.split())})


def entailed(rid, code, field, words, fn, paths, first, proof):
    """An unprovable row: alone in its own table, with the proof that an earlier
    row always refuses first."""
    row('entailed_' + rid, rid, code, field, words, fn, paths)
    ENTAILED[rid] = (tuple(first), proof)


# scenario ------------------------------------------------------------------
row('scenario', 'scenario_path_type', 'scenario_path', '/path', 'the path is a string',
    lambda c: type(c.get('path')) is str, '*')
row('scenario', 'scenario_path_member', 'scenario_path', '/path', 'the path is append, retry, history or no_event',
    lambda c: type(c.get('path')) is not str or c['path'] in PATH_NAMES, '*')
row('scenario', 'scenario_shape', 'scenario_shape', '/event', 'an event is present exactly on event paths',
    lambda c: type(c.get('path')) is not str or c['path'] not in PATH_NAMES or
    ('event' in c) == (c['path'] != 'no_event'), '*')


# event views: candidate on every event path, Storage's original on retry ---
VIEWS = (('cand', '/event', EVENT_PATHS, lambda c: c['event']),
         ('orig', '/storage/event', 'retry', lambda c: c['storage']['event']))


def view_holds(fn, structural, get):
    def holds(c):
        e = get(c)
        if not structural and type(e.get('payload')) is not dict:
            return True     # payload field predicates need an object (envelope/payload rows own it)
        return fn(e, c)
    return holds


def view_rule(group, name, code, field, words, fn, structural=False, entail=None):
    """One row per view. The Storage-original row applies when its candidate row holds:
    a defect in an input both views read (owner, records, pack, command, partition) is
    the candidate row's refusal, so the original row never repeats it."""
    cand = view_holds(fn, structural, VIEWS[0][3])
    orig = view_holds(fn, structural, VIEWS[1][3])
    def orig_after_cand(c):
        try:
            if c['storage']['event']['event_type'] != c['event']['event_type'] or cand(c) is not True:
                return True     # orig_family owns another family's original; the candidate row owns a shared defect
        except CAUGHT:
            return True
        return orig(c)
    for view, base, paths, _ in VIEWS:
        words_view = ('Storage original: ' if view == 'orig' else '') + words
        fn_view = cand if view == 'cand' else orig_after_cand
        if entail is None:
            row(view + '_' + group, view + '_' + name, code, base + field, words_view, fn_view, paths)
        else:
            first = [view + '_' + f for f in entail[0]] + ([] if view == 'cand' else ['cand_' + f for f in entail[0]])
            proof = entail[1] + ('' if view == 'cand' else ' For the Storage original the same holds view by view; a row gated '
                                 'off because its candidate row refuses leaves that candidate row as the earlier refusal.')
            entailed(view + '_' + name, code, base + field, words_view, fn_view, paths, first, proof)


# schema group: envelope, payload, numbers, producer route, inline body
view_rule('schema', 'envelope_schema', 'envelope_schema', '', 'the EventRecord stock schema verdict accepts the event',
          lambda e, c: schema_valid(e), structural=True)
view_rule('schema', 'envelope_numbers', 'current_integer', '', 'every EventRecord integer slot is an exact current integer (CV-1100)',
          lambda e, c: not schema_valid(e) or integer_slots_exact('envelope', e), structural=True)
view_rule('schema', 'sequence_u64', 'storage_uint64', '/sequence_id', 'the Storage sequence_id is uint64 (SP-1100 storage_uint64)',
          lambda e, c: not envelope_ready(e) or storage_uint64(e['sequence_id']) is not None, structural=True)
view_rule('schema', 'payload_schema', 'payload_schema', '/payload', 'the family payload stock schema verdict accepts the object payload',
          lambda e, c: payload_validator(e['event_type']).is_valid(e['payload']))
view_rule('schema', 'payload_numbers', 'current_integer', '/payload', 'every payload integer slot is an exact current integer (CV-1100)',
          lambda e, c: not payload_validator(e['event_type']).is_valid(e['payload']) or
          integer_slots_exact('payload', e['payload'], e['event_type']))
view_rule('schema', 'payload_fullmatch', 'payload_fullmatch', '/payload', 'payload patterns match in full (no trailing LF)',
          lambda e, c: not payload_validator(e['event_type']).is_valid(e['payload']) or
          not pattern_failures(e['payload'], payload_schema(e['event_type']), load('card2_event_payloads.schema.json')))
view_rule('schema', 'producer_route', 'producer_route', '', 'the CV-317 producer projection qualifies under CV-1100 (producer_semantic_bytes)',
          lambda e, c: not (envelope_ready(e) and payload_ready(e)) or producer_semantic_bytes(e) is not None,
          structural=True)
view_rule('schema', 'inline_size', 'inline_size', '/payload', 'the inline payload binding bytes are at most 16 KiB',
          lambda e, c: not payload_ready(e) or len(binding_bytes(e['payload'])) <= 16384)
view_rule('schema', 'inline_reference', 'inline_reference', '/payload_ref', 'payload_ref is null for the inline body',
          lambda e, c: e['payload_ref'] is None, structural=True)

# scope group
for key in ['scope_kind', 'project_id', 'thread_id']:
    view_rule('scope', 'scope_' + key, 'scope_' + key, '/' + key, 'the envelope ' + key + ' equals the payload copy',
              lambda e, c, k=key: strict_equal(e[k], e['payload'][k]))
view_rule('scope', 'scope_schema_payload_id', 'scope_schema', '/payload_schema_id', 'the envelope payload_schema_id equals payload.schema_id',
          lambda e, c: e['payload_schema_id'] == e['payload']['schema_id'])
view_rule('scope', 'scope_schema_family', 'scope_schema', '/payload/schema_id', 'payload.schema_id is the family schema for the scope',
          lambda e, c: e['payload']['schema_id'] == family(e)['application_payload_schema_id' if e['scope_kind'] == 'application' else 'payload_schema_id'])
view_rule('scope', 'scope_partition', 'scope_partition', '/scope_partition', 'the scenario partition is the event partition',
          lambda e, c: c['scope_partition'] == partition(e), structural=True)
view_rule('scope', 'private_thread', 'private_thread', '/thread_id', 'an application memory event names its private thread',
          lambda e, c: not (is_memory(e) and e['scope_kind'] == 'application' and e['thread_id'] is None), structural=True)
for key in ['storage_instance_id', 'server_id', 'computer_id', 'thread_id', 'project_id', 'scope_kind']:
    view_rule('scope', 'source_' + key, 'source_' + key, '/payload/' + key, 'payload ' + key + ' equals the owner source',
              lambda e, c, k=key: strict_equal(e['payload'][k], c['owner'][k]))
view_rule('scope', 'lineage_run_attempt', 'lineage_shape', '/run_id', 'run_id and attempt_id are null together',
          lambda e, c: (e['run_id'] is None) == (e['attempt_id'] is None), structural=True)
view_rule('scope', 'lineage_node', 'lineage_shape', '/node_id', 'node_id is null when run_id is null',
          lambda e, c: not (e['run_id'] is None and e['node_id'] is not None), structural=True)
for key in ['run_id', 'node_id', 'attempt_id']:
    view_rule('scope', 'lineage_' + key, 'lineage_' + key, '/' + key, key + ' equals the owner lineage',
              lambda e, c, k=key: strict_equal(e[k], c['owner'][k]), structural=True)
for payload_key, owner_key in [('owner_operation_id', 'operation_id'), ('owner_change_id', 'change_id'),
                               ('revision_before', 'before_revision'), ('revision_after', 'after_revision'),
                               ('before_record_ref', 'before_record_ref'), ('after_record_ref', 'after_record_ref')]:
    view_rule('scope', 'source_' + payload_key, 'source_' + payload_key, '/payload/' + payload_key,
              'payload ' + payload_key + ' equals owner ' + owner_key,
              lambda e, c, p=payload_key, o=owner_key: strict_equal(e['payload'][p], c['owner'][o]))
view_rule('scope', 'source_subject', 'source_subject', '/payload/gist_id', 'the payload subject is the owner subject',
          lambda e, c: e['payload'].get('gist_id', e['payload'].get('browser_session_id')) == c['owner']['subject_id'])
view_rule('scope', 'source_workspace', 'source_workspace', '/payload/workspace_id', 'a payload workspace equals the owner workspace',
          lambda e, c: 'workspace_id' not in e['payload'] or e['payload']['workspace_id'] == c['owner']['workspace_id'])
MEMORY_COMMAND = {'verify': 'cmd.chat.memory.verify', 'edit': 'cmd.chat.memory.edit', 'pin': 'cmd.chat.memory.pin',
                  'unpin': 'cmd.chat.memory.pin', 'discard': 'cmd.chat.memory.discard'}
view_rule('scope', 'memory_command_automatic', 'memory_command', '/command', 'an automatic memory change comes from RealMemoryProvider',
          lambda e, c: not is_memory(e) or e['payload']['operation'] != 'automatic' or c['command'].startswith('RealMemoryProvider.'))
view_rule('scope', 'memory_command_manual', 'memory_command', '/command', 'a manual memory change comes from its exact command',
          lambda e, c: not is_memory(e) or e['payload']['operation'] not in MEMORY_COMMAND or
          c['command'] == MEMORY_COMMAND[e['payload']['operation']])
view_rule('scope', 'revision_step', 'revision_step', '/payload/revision_after', 'revision_after is revision_before + 1',
          lambda e, c: e['payload']['revision_after'] == e['payload']['revision_before'] + 1)
view_rule('scope', 'idempotency', 'idempotency', '/idempotency_key', 'the idempotency key is the recomputed CV-366 key',
          lambda e, c: e['idempotency_key'] == expected_key(e))
view_rule('scope', 'event_identity', 'event_identity', '/event_id', 'the event_id is the recomputed global identity',
          lambda e, c: e['event_id'] == expected_event_id(e))


# transition group: one row per clause of the original transition predicate
def tr(name, words, applies, holds, entail=None):
    view_rule('transition', 'transition_' + name, 'transition', '/payload', words,
              lambda e, c: not applies(e) or holds(e['payload'], c), entail=entail)


def changed_proof(field, value_rows, fact_rows, delta_row):
    rows = ['transition_' + r for r in value_rows] + fact_rows + [delta_row, 'memory_command_manual', 'memory_command_automatic']
    return (rows, field + ' missing from changed_fields: when ' + delta_row + ' holds, changed_fields is the exact record delta, '
            'so the before and after records agree on ' + field + '; when the record-join rows (' + ', '.join(fact_rows) + ') hold, '
            'the payload previous and current values equal those records and so each other, which refuses at '
            + ' or '.join('transition_' + r for r in value_rows) + '. Every one of these rows precedes this entailed table.')


CREATED = lambda e: e['event_type'] == 'browser.session.created'
MEM0 = lambda e: is_memory(e) and e['payload']['revision_before'] == 0
MEMN = lambda e: is_memory(e) and e['payload']['revision_before'] != 0
tr('created_revision', 'created: revision_before is 0', CREATED, lambda p, c: p['revision_before'] == 0)
tr('created_before_ref', 'created: no before record', CREATED, lambda p, c: p['before_record_ref'] is None,
   entail=(['source_before_record_ref', 'browser_fact_previous_session_class', 'transition_created_previous_session_class'],
           'A created event that names a before record: source_before_record_ref refuses unless the owner names the same '
           'reference; then record_resolution_before refuses unless it resolves, and the browser_before_* rows refuse unless '
           'the record holds a valid session_class string; then browser_fact_previous_session_class refuses a null '
           'previous_session_class and transition_created_previous_session_class refuses a non-null one. record_resolution_before '
           'and browser_before_* precede this entailed table as well.'))
for k in ['previous_lifecycle_state', 'previous_session_class', 'previous_takeover_state']:
    tr('created_' + k, 'created: ' + k + ' is null', CREATED, lambda p, c, k=k: p[k] is None)
tr('created_lifecycle', 'created: lifecycle_state is open', CREATED, lambda p, c: p['lifecycle_state'] == 'open')
tr('created_changed_fields', 'created: changed_fields is exactly [created]', CREATED, lambda p, c: p['changed_fields'] == ['created'])
tr('memory_initial_operation', 'initial memory gist: operation is automatic', MEM0, lambda p, c: p['operation'] == 'automatic')
tr('memory_initial_previous_verification', 'initial memory gist: no previous verification state', MEM0,
   lambda p, c: p['previous_verification_state'] is None)
tr('memory_initial_before_ref', 'initial memory gist: no before record', MEM0, lambda p, c: p['before_record_ref'] is None,
   entail=(['source_before_record_ref', 'memory_fact_previous_verification_state', 'transition_memory_initial_previous_verification'],
           'An initial gist that names a before record: source_before_record_ref refuses unless the owner names the same '
           'reference; then record_resolution_before refuses unless it resolves, and the memory_before_* shape rows refuse unless '
           'the record holds a verification_state in its domain; then memory_fact_previous_verification_state refuses a null '
           'previous_verification_state and transition_memory_initial_previous_verification refuses a non-null one. '
           'record_resolution_before and memory_before_* precede this entailed table as well.'))
tr('successor_revision', 'a browser successor has revision_before above 0',
   lambda e: is_browser(e) and not CREATED(e), lambda p, c: p['revision_before'] != 0)
tr('successor_before_ref', 'a successor names its before record',
   lambda e: not CREATED(e) and not MEM0(e), lambda p, c: p['before_record_ref'] is not None)
CLOSED = lambda e: e['event_type'] == 'browser.session.closed'
tr('closed_previous', 'closed: previous lifecycle is open', CLOSED, lambda p, c: p['previous_lifecycle_state'] == 'open')
tr('closed_lifecycle', 'closed: lifecycle is closed', CLOSED, lambda p, c: p['lifecycle_state'] == 'closed')
tr('closed_changed', 'closed: lifecycle_state changed', CLOSED, lambda p, c: 'lifecycle_state' in p['changed_fields'],
   entail=changed_proof('lifecycle_state', ['closed_previous', 'closed_lifecycle'],
                        ['browser_fact_previous_lifecycle_state', 'browser_fact_lifecycle_state'], 'browser_delta'))
PROMOTED = lambda e: e['event_type'] == 'browser.session.promoted'
tr('promoted_previous', 'promoted: previous class is not normal_browsing', PROMOTED,
   lambda p, c: p['previous_session_class'] != 'normal_browsing')
tr('promoted_class', 'promoted: class is normal_browsing', PROMOTED, lambda p, c: p['session_class'] == 'normal_browsing')
tr('promoted_changed', 'promoted: session_class changed', PROMOTED, lambda p, c: 'session_class' in p['changed_fields'],
   entail=changed_proof('session_class', ['promoted_previous', 'promoted_class'],
                        ['browser_fact_previous_session_class', 'browser_fact_session_class'], 'browser_delta'))
TAKEOVER = lambda e: e['event_type'] == 'browser.session.takeover_state_changed'
tr('takeover_value', 'takeover: the takeover state changes', TAKEOVER,
   lambda p, c: p['previous_takeover_state'] != p['takeover_state'])
tr('takeover_changed', 'takeover: takeover_state changed', TAKEOVER, lambda p, c: 'takeover_state' in p['changed_fields'],
   entail=changed_proof('takeover_state', ['takeover_value'],
                        ['browser_fact_previous_takeover_state', 'browser_fact_takeover_state'], 'browser_delta'))
OP = lambda op: (lambda e: MEMN(e) and e['payload']['operation'] == op)
tr('verify_succeeded', 'verify: the owner verification succeeded', OP('verify'),
   lambda p, c: c['owner']['verification_succeeded'] is True)
tr('verify_not_request_only', 'verify: not a request-only verification', OP('verify'),
   lambda p, c: c['owner']['verification_request_only'] is False)
tr('verify_state', 'verify: verification_state is Verified', OP('verify'), lambda p, c: p['verification_state'] == 'Verified')
tr('pin_previous', 'pin: previously unpinned', OP('pin'), lambda p, c: not p['previous_pinned'])
tr('pin_pinned', 'pin: now pinned', OP('pin'), lambda p, c: bool(p['pinned']))
tr('pin_changed', 'pin: pinned changed', OP('pin'), lambda p, c: 'pinned' in p['changed_fields'],
   entail=changed_proof('pinned', ['pin_previous', 'pin_pinned'], ['memory_fact_previous_pinned', 'memory_fact_pinned'],
                        'memory_delta_matches'))
tr('unpin_previous', 'unpin: previously pinned', OP('unpin'), lambda p, c: bool(p['previous_pinned']))
tr('unpin_pinned', 'unpin: now unpinned', OP('unpin'), lambda p, c: not p['pinned'])
tr('unpin_changed', 'unpin: pinned changed', OP('unpin'), lambda p, c: 'pinned' in p['changed_fields'],
   entail=changed_proof('pinned', ['unpin_previous', 'unpin_pinned'], ['memory_fact_previous_pinned', 'memory_fact_pinned'],
                        'memory_delta_matches'))
tr('discard_previous', 'discard: not previously discarded', OP('discard'),
   lambda p, c: p['previous_verification_state'] != 'Discarded')
tr('discard_state', 'discard: verification_state is Discarded', OP('discard'),
   lambda p, c: p['verification_state'] == 'Discarded')
tr('discard_changed', 'discard: verification_state changed', OP('discard'),
   lambda p, c: 'verification_state' in p['changed_fields'],
   entail=changed_proof('verification_state', ['discard_previous', 'discard_state'],
                        ['memory_fact_previous_verification_state', 'memory_fact_verification_state'], 'memory_delta_matches'))


# memory group (verification support, SP-337 evidence custody, claims, delta, facts)
def verifying(e):
    p = e['payload']
    return is_memory(e) and p['verification_state'] == 'Verified' and \
        not (p['operation'] != 'verify' and p['previous_verification_state'] == 'Verified')


def vs(name, words, holds):
    view_rule('memory', 'verification_' + name, 'verification_support', '/owner', words,
              lambda e, c: not verifying(e) or holds(e, c))


vs('override_type', 'manual_override is a boolean', lambda e, c: type(c['owner']['manual_override']) is bool)
vs('support_type', 'claim_support_current is a boolean', lambda e, c: type(c['owner']['claim_support_current']) is bool)
vs('override_verify', 'a manual override verifies only through verify',
   lambda e, c: type(c['owner']['manual_override']) is not bool or not (c['owner']['manual_override'] and e['payload']['operation'] != 'verify'))
view_rule('memory', 'verification_evidence', 'verification_support', '/payload/evidence_refs',
          'without override, verification has evidence references',
          lambda e, c: not verifying(e) or type(c['owner']['manual_override']) is not bool or c['owner']['manual_override'] or
          (type(e['payload']['evidence_refs']) is dict and memory_evidence(e, c) is None) or bool(memory_evidence(e, c)),
          entail=(['memory_fact_evidence_refs', 'verified_claims_support', 'verification_override_type'],
                  'Empty references without override: memory_fact_evidence_refs refuses unless the after record evidence_refs '
                  'is also empty; the memory_after_* shape rows require at least one claim and every claim evidence_support '
                  'within evidence_refs, so every claim has empty support, and verified_claims_support refuses (its scope is '
                  'the same verifying change without a verify-with-override). All these rows precede this entailed table.'))
vs('support_current', 'without override, claim support is current',
   lambda e, c: type(c['owner']['manual_override']) is not bool or type(c['owner']['claim_support_current']) is not bool or
   c['owner']['manual_override'] or c['owner']['claim_support_current'] is True)


def packed(e):
    return is_memory(e) and type(e['payload']['evidence_refs']) is dict


def pack_row(e, c):
    return c['payload_store'][e['payload']['evidence_refs']['id']]


def pack_raw(e, c):
    return bytes.fromhex(pack_row(e, c)['bytes_hex'])


def raw_ok(e, c):
    try:
        pack_raw(e, c)
        return True
    except CAUGHT:
        return False


def decoded(e, c):
    try:
        return msgpack.unpackb(pack_raw(e, c), raw=False)
    except CAUGHT + (msgpack.UnpackException,):
        return None


def ec(name, words, holds, entail=None):
    view_rule('memory', 'custody_' + name, 'memory_evidence_custody', '/payload/evidence_refs', words,
              lambda e, c: not packed(e) or holds(e, c), entail=entail)


ec('row', 'the descriptor resolves to a pack row with hex bytes', lambda e, c: raw_ok(e, c))
ec('decode', 'the pack bytes decode as MessagePack', lambda e, c: not raw_ok(e, c) or decoded(e, c) is not None)
ec('list_type', 'the decoded evidence is a list of strings',
   lambda e, c: not raw_ok(e, c) or decoded(e, c) is None or string_list(decoded(e, c)))
ec('list_pattern', 'every decoded reference matches the evidence pointer grammar',
   lambda e, c: not string_list(decoded(e, c)) or all([re.fullmatch(EVIDENCE_PATTERN, v) is not None for v in decoded(e, c)]))
ec('list_unique', 'decoded references are unique',
   lambda e, c: not string_list(decoded(e, c)) or len(decoded(e, c)) == len(set(decoded(e, c))))
ec('authentic', 'the pack row is authentic', lambda e, c: not raw_ok(e, c) or pack_row(e, c)['authentic'] is True)
ec('durable', 'the pack row is durable', lambda e, c: not raw_ok(e, c) or pack_row(e, c)['durable'] is True)
for key in ['storage_instance_id', 'server_id', 'scope_kind', 'project_id', 'thread_id']:
    ec('owner_' + key, 'the pack row ' + key + ' equals the owner',
       lambda e, c, k=key: not raw_ok(e, c) or strict_equal(pack_row(e, c)[k], c['owner'][k]))
ec('size_value', 'size_bytes is the exact pack byte length',
   lambda e, c: not raw_ok(e, c) or type(e['payload']['evidence_refs']['size_bytes']) is not int or
   e['payload']['evidence_refs']['size_bytes'] == len(pack_raw(e, c)))
ec('id', 'the descriptor id is the BLAKE3 digest of the pack bytes',
   lambda e, c: not raw_ok(e, c) or e['payload']['evidence_refs']['id'] == blake3.blake3(pack_raw(e, c)).hexdigest())
ec('canonical', 'the pack bytes are the canonical SP-278 binding bytes of the list',
   lambda e, c: memory_evidence(e, c) is None or pack_raw(e, c) == binding_bytes(memory_evidence(e, c)))
ec('route', 'the inline body would exceed 16 KiB, so the SP-337 route applies',
   lambda e, c: memory_evidence(e, c) is None or len(binding_bytes(dict(e['payload'], evidence_refs=memory_evidence(e, c)))) > 16384)


def verified_scope(e, c):
    p = e['payload']
    if (not is_memory(e) or p['verification_state'] != 'Verified' or
            (p['operation'] != 'verify' and p['previous_verification_state'] == 'Verified') or
            (p['operation'] == 'verify' and c['owner']['manual_override'] is True) or not resolved(c)):
        return None
    facts = records(c)[1]['facts']
    if type(facts) is not dict or type(facts.get('claims')) is not list:
        return None
    return [claim for claim in facts['claims'] if type(claim) is dict]


view_rule('memory', 'verified_claims_support', 'memory_verified_claims', '/source_records/after/facts/claims',
          'a verified gist has no claim with empty evidence support',
          lambda e, c: verified_scope(e, c) is None or not any([
              string_list(cl.get('evidence_support')) and
              all([re.fullmatch(EVIDENCE_PATTERN, v) is not None for v in cl['evidence_support']]) and
              len(cl['evidence_support']) == len(set(cl['evidence_support'])) and not cl['evidence_support']
              for cl in verified_scope(e, c)]))
view_rule('memory', 'verified_claims_current', 'memory_verified_claims', '/source_records/after/facts/claims',
          'a verified gist has no noncurrent claim',
          lambda e, c: verified_scope(e, c) is None or not any([
              type(cl.get('currentness')) is str and cl['currentness'] in CURRENTNESS and cl['currentness'] != 'current'
              for cl in verified_scope(e, c)]))


def memory_records_shaped(c):
    return resolved(c) and all([r is None or memory_shape_ok(r.get('facts')) for r in records(c)])


view_rule('memory', 'memory_delta_nonempty', 'memory_delta', '/payload/changed_fields', 'the memory change has a nonempty exact delta',
          lambda e, c: not is_memory(e) or not memory_records_shaped(c) or bool(exact_delta(c)))
view_rule('memory', 'memory_delta_matches', 'memory_delta', '/payload/changed_fields', 'changed_fields is the exact record delta',
          lambda e, c: not is_memory(e) or not memory_records_shaped(c) or not exact_delta(c) or
          sorted(e['payload']['changed_fields']) == exact_delta(c))


def memory_fact_holds(e, c, payload_key, fact_key, side):
    if not is_memory(e) or not resolved(c):
        return True
    actual = memory_evidence(e, c) if fact_key == 'evidence_refs' else e['payload'][payload_key]
    if fact_key == 'evidence_refs' and type(e['payload']['evidence_refs']) is dict and actual is None:
        return True     # no decoded observation until the custody rows hold
    record = records(c)[side]
    if record is None and side == 0 and fact_key == 'verification_state':
        return True     # no before record: transition_memory_initial_previous_verification owns the null previous state
    if record is not None:
        facts = record.get('facts')
        if type(facts) is not dict or fact_key not in facts or type(facts[fact_key]) not in kinds_of(MEMORY_REQUIRED_FACTS, fact_key):
            return True     # the source-shape rows own a missing or mistyped field
        if fact_key == 'evidence_refs' and not MEMORY_SHAPE['evidence_pattern'](facts): return True
        if fact_key == 'evidence_refs' and not MEMORY_SHAPE['evidence_unique'](facts): return True
        if fact_key in MEMORY_ENUMS and facts[fact_key] not in MEMORY_ENUMS[fact_key]: return True
    expected = record['facts'][fact_key] if record else (False if fact_key == 'pinned' else None)
    return strict_equal(actual, expected)


for payload_key, fact_key, side in [('previous_pinned', 'pinned', 0), ('pinned', 'pinned', 1),
                                    ('previous_verification_state', 'verification_state', 0), ('verification_state', 'verification_state', 1),
                                    ('source', 'source', 1), ('evidence_refs', 'evidence_refs', 1)]:
    view_rule('memory', 'memory_fact_' + payload_key, 'memory_fact_' + payload_key, '/payload/' + payload_key,
              payload_key + ' equals the ' + ('before' if side == 0 else 'after') + ' record ' + fact_key,
              lambda e, c, p=payload_key, k=fact_key, s=side: memory_fact_holds(e, c, p, k, s))


# browser group (record fact joins and delta)
def browser_fact_holds(e, c, payload_key, fact_key, side):
    if not is_browser(e) or not resolved(c):
        return True
    record = records(c)[side]
    if record is None and side == 0:
        return True     # no before record: transition_created_previous_* / successor_before_ref own the previous state
    if record is not None and (type(record.get('facts')) is not dict or not browser_value_ok(record['facts'], fact_key) or
                               (fact_key in BROWSER_ENUMS and record['facts'][fact_key] not in BROWSER_ENUMS[fact_key])):
        return True     # the source-field rows own a missing or malformed value
    return strict_equal(e['payload'][payload_key], record['facts'][fact_key] if record else None)


for payload_key, fact_key, side in [('previous_session_class', 'session_class', 0), ('session_class', 'session_class', 1),
                                    ('previous_takeover_state', 'takeover_state', 0), ('takeover_state', 'takeover_state', 1),
                                    ('previous_lifecycle_state', 'lifecycle_state', 0), ('lifecycle_state', 'lifecycle_state', 1)]:
    view_rule('browser', 'browser_fact_' + payload_key, 'browser_fact_' + payload_key, '/payload/' + payload_key,
              payload_key + ' equals the ' + ('before' if side == 0 else 'after') + ' record ' + fact_key,
              lambda e, c, p=payload_key, k=fact_key, s=side: browser_fact_holds(e, c, p, k, s))
view_rule('browser', 'browser_delta', 'browser_delta', '/payload/changed_fields', 'changed_fields is the exact record delta',
          lambda e, c: not is_browser(e) or e['event_type'] == 'browser.session.created' or not resolved(c) or
          not all([r is None or type(r.get('facts')) is dict for r in records(c)]) or
          sorted(e['payload']['changed_fields']) == exact_delta(c))


# owner / command --------------------------------------------------------------
row('owner', 'source_authentic', 'source_authentic', '/owner/authentic', 'the owner source is authentic',
    lambda c: c['owner']['authentic'] is True)
row('owner', 'source_committed', 'source_committed', '/owner/committed', 'the owner change is committed',
    lambda c: c['owner']['committed'] is True)
row('owner', 'current_stop', 'current_stop', '/live/stop_generation_current', 'the current stop generation admits the writer',
    lambda c: c['live']['stop_generation_current'] is True, 'append retry')
row('owner', 'real_change', 'real_change', '/owner/real_change', 'the owner reports a real change',
    lambda c: c['owner']['real_change'] is True)
row('owner', 'command_owner', 'command_source', '/command', 'the command equals the owner command',
    lambda c: c['command'] == c['owner']['command'])
row('owner', 'command_contract', 'command_source', '/command', 'the command is one of the family commands',
    lambda c: c['command'] in contract(c)['commands'])


# records ------------------------------------------------------------------------
row('records', 'record_resolution_before', 'record_resolution', '/owner/before_record_ref', 'the before reference resolves',
    lambda c: c['owner']['before_record_ref'] is None or c['owner']['before_record_ref'] in c['source_records'])
row('records', 'record_resolution_after', 'record_resolution', '/owner/after_record_ref', 'the after reference resolves',
    lambda c: c['owner']['after_record_ref'] is None or c['owner']['after_record_ref'] in c['source_records'])
SIDES = (('before', 0), ('after', 1))


def side_record(c, side):
    """The resolved record of one side, or None when absent or unresolved (resolution rows own it)."""
    return records(c)[side] if resolved(c) else None


for side_name, side in SIDES:
    for key in ['subject_id', 'storage_instance_id', 'server_id', 'computer_id', 'project_id', 'thread_id',
                'scope_kind', 'run_id', 'node_id', 'attempt_id']:
        row('records', 'record_' + side_name + '_' + key, 'record_' + key, '/source_records/' + side_name + '/' + key,
            'the ' + side_name + ' record ' + key + ' equals the owner',
            lambda c, k=key, s=side: side_record(c, s) is None or strict_equal(side_record(c, s)[k], c['owner'][k]))
    row('records', 'record_' + side_name + '_revision', 'record_revision', '/source_records/' + side_name + '/revision',
        'the ' + side_name + ' record revision equals the owner revision',
        lambda c, s=side: side_record(c, s) is None or strict_equal(side_record(c, s)['revision'], c['owner'][('before_revision', 'after_revision')[s]]))
    row('records', 'record_' + side_name + '_ref', 'record_ref', '/source_records/' + side_name + '/record_ref',
        'the ' + side_name + ' record reference equals the owner reference',
        lambda c, s=side: side_record(c, s) is None or side_record(c, s)['record_ref'] == c['owner'][('before_record_ref', 'after_record_ref')[s]])
    row('records', 'record_' + side_name + '_workspace', 'record_workspace', '/source_records/' + side_name + '/workspace_id',
        'the ' + side_name + ' record workspace equals the owner workspace',
        lambda c, s=side: side_record(c, s) is None or side_record(c, s).get('workspace_id') == c['owner'].get('workspace_id'))


# browser source records: one row per field, clause and side ----------------------
def browser_facts(c, side):
    """The facts object of a browser record side, or a sentinel when not applicable."""
    if not is_browser(c['event']):
        return NOT_APPLICABLE
    record = side_record(c, side)
    return NOT_APPLICABLE if record is None else record.get('facts')


NOT_APPLICABLE = object()


def browser_rule(side_name, side, rid, code, field, words, holds):
    def fn(c):
        facts = browser_facts(c, side)
        if facts is NOT_APPLICABLE:
            return True
        if rid != 'object' and type(facts) is not dict:
            return True     # the object row owns it
        return holds(facts)
    row('browser_' + side_name, 'browser_' + side_name + '_' + rid, code, '/source_records/' + side_name + '/facts' + field,
        'the ' + side_name + ' browser record: ' + words, fn)


for side_name, side in SIDES:
    browser_rule(side_name, side, 'object', 'browser_source_object', '', 'facts is an object', lambda f: type(f) is dict)
    for key in BROWSER_KINDS:
        code = 'browser_source_' + key
        browser_rule(side_name, side, key + '_present', code, '/' + key, key + ' is present', lambda f, k=key: k in f)
        browser_rule(side_name, side, key + '_type', code, '/' + key, key + ' has its declared type',
                     lambda f, k=key: k not in f or type(f[k]) in BROWSER_KINDS[k])
        if key in BROWSER_ENUMS:
            browser_rule(side_name, side, key + '_domain', code, '/' + key, key + ' is in its owner domain',
                         lambda f, k=key: not browser_value_ok(f, k) or f[k] in BROWSER_ENUMS[k])
        if key in BROWSER_STRING_LISTS:
            browser_rule(side_name, side, key + '_members', code, '/' + key, key + ' members are strings',
                         lambda f, k=key: not browser_value_ok(f, k) or all([type(v) is str for v in f[k]]))
    for key, kinds in BROWSER_NESTED.items():
        parent, member = key.split('.')
        code = 'browser_source_' + key
        browser_rule(side_name, side, parent + '_' + member + '_type', code, '/' + parent + '/' + member,
                     key + ' has its declared type',
                     lambda f, k=key, p=parent: type(f.get(p)) is not dict or browser_value_ok(f, k))
    for member in ['width', 'height']:
        browser_rule(side_name, side, 'viewport_' + member + '_u32', 'browser_source_viewport.' + member,
                     '/viewport/' + member, 'viewport.' + member + ' is u32 (current_integer 0..2^32-1)',
                     lambda f, m=member: not browser_value_ok(f, 'viewport.' + m) or
                     current_integer(f['viewport'][m], minimum=0, maximum=U32_MAX) is not None)
    for member in ['x', 'y']:
        browser_rule(side_name, side, 'scroll_position_' + member + '_f64', 'browser_source_scroll_position.' + member,
                     '/scroll_position/' + member, 'scroll_position.' + member + ' is a finite f64 (SP-1100)',
                     lambda f, m=member: not browser_value_ok(f, 'scroll_position.' + m) or f64_exact(f['scroll_position'][m]))
    browser_rule(side_name, side, 'zoom_level_f64', 'browser_source_zoom_level', '/zoom_level',
                 'zoom_level is a finite f64 (SP-1100)',
                 lambda f: not browser_value_ok(f, 'zoom_level') or f64_exact(f['zoom_level']))


# memory source shape: one row per predicate and subject ---------------------------
def facts_dict(f):
    return type(f) is dict


def evidence_ok(f, key):
    return memory_typed(f, key) and string_list(f[key])


def pointers(value):
    return string_list(value) and all([re.fullmatch(EVIDENCE_PATTERN, v) is not None for v in value])


def pointer_list(f, key):
    """A typed list whose entries all match the pointer grammar (its pattern rows own the rest)."""
    return memory_typed(f, key) and pointers(f[key])


def claims_of(f):
    return [cl for cl in f['claims'] if type(cl) is dict and
            all([type(cl.get(k)) is kind for k, kind in CLAIM_REQUIRED.items()])] if memory_typed(f, 'claims') else []


MEMORY_SHAPE = {
    'object': lambda f: facts_dict(f),
    'required': lambda f: not facts_dict(f) or MEMORY_REQUIRED_FACTS.keys() <= f.keys(),
    'known': lambda f: not facts_dict(f) or f.keys() <= MEMORY_REQUIRED_FACTS.keys() | MEMORY_OPTIONAL_FACTS.keys(),
    'types': lambda f: not facts_dict(f) or all([memory_typed(f, k) for k in f
                                                 if k in MEMORY_REQUIRED_FACTS or k in MEMORY_OPTIONAL_FACTS]),
    'access_count': lambda f: not facts_dict(f) or not memory_typed(f, 'access_count') or
    current_integer(f['access_count'], minimum=0) is not None,
    'half_life': lambda f: not facts_dict(f) or not memory_typed(f, 'half_life_days') or f['half_life_days'] is None or
    current_integer(f['half_life_days'], minimum=1) is not None,
    'enums': lambda f: not facts_dict(f) or all([f[k] in domain for k, domain in MEMORY_ENUMS.items() if memory_typed(f, k)]),
    'currentness': lambda f: not facts_dict(f) or not memory_typed(f, 'currentness') or f['currentness'] in CURRENTNESS,
    'timestamps': lambda f: not facts_dict(f) or all([timestamp_valid(f[k]) for k in ['created_at', 'updated_at', 'last_access_at']
                                                      if memory_typed(f, k)]),
    'hashes': lambda f: not facts_dict(f) or all([re.fullmatch('[0-9a-f]{64}', f[k]) is not None
                                                  for k in ['embed_text_hash', 'text_hash'] if memory_typed(f, k)]),
    'embedding_version': lambda f: not facts_dict(f) or not memory_typed(f, 'embedding_version') or bool(f['embedding_version']),
    'claims_nonempty': lambda f: not facts_dict(f) or not memory_typed(f, 'claims') or bool(f['claims']),
    'string_members': lambda f: not facts_dict(f) or all([string_list(f[k]) for k in ['tags', 'evidence_refs', 'claim_support']
                                                          if memory_typed(f, k)]),
    'evidence_pattern': lambda f: not facts_dict(f) or not evidence_ok(f, 'evidence_refs') or
    all([re.fullmatch(EVIDENCE_PATTERN, v) is not None for v in f['evidence_refs']]),
    'evidence_unique': lambda f: not facts_dict(f) or not evidence_ok(f, 'evidence_refs') or
    len(f['evidence_refs']) == len(set(f['evidence_refs'])),
    'support_pattern': lambda f: not facts_dict(f) or not evidence_ok(f, 'claim_support') or
    all([re.fullmatch(EVIDENCE_PATTERN, v) is not None for v in f['claim_support']]),
    'support_unique': lambda f: not facts_dict(f) or not evidence_ok(f, 'claim_support') or
    len(f['claim_support']) == len(set(f['claim_support'])),
    'support_subset': lambda f: not facts_dict(f) or not pointer_list(f, 'claim_support') or not pointer_list(f, 'evidence_refs') or
    set(f['claim_support']) <= set(f['evidence_refs']),
    'claim_shape': lambda f: not facts_dict(f) or not memory_typed(f, 'claims') or
    all([type(cl) is dict and all([type(cl.get(k)) is kind for k, kind in CLAIM_REQUIRED.items()]) for cl in f['claims']]),
    'claim_id': lambda f: not facts_dict(f) or all([bool(cl['claim_id']) for cl in claims_of(f)]),
    'claim_text': lambda f: not facts_dict(f) or all([bool(cl['text']) for cl in claims_of(f)]),
    'claim_created_at': lambda f: not facts_dict(f) or all([timestamp_valid(cl['created_at']) for cl in claims_of(f)]),
    'claim_scope': lambda f: not facts_dict(f) or all([bool(cl['support_scope'].strip()) for cl in claims_of(f)]),
    'claim_currentness': lambda f: not facts_dict(f) or all([cl['currentness'] in CURRENTNESS for cl in claims_of(f)]),
    'claim_evidence_pattern': lambda f: not facts_dict(f) or all([
        all([type(v) is str and re.fullmatch(EVIDENCE_PATTERN, v) is not None for v in cl['evidence_support']])
        for cl in claims_of(f)]),
    'claim_evidence_unique': lambda f: not facts_dict(f) or all([
        not string_list(cl['evidence_support']) or len(cl['evidence_support']) == len(set(cl['evidence_support']))
        for cl in claims_of(f)]),
    'claim_evidence_subset': lambda f: not facts_dict(f) or not pointer_list(f, 'evidence_refs') or all([
        not pointers(cl['evidence_support']) or set(cl['evidence_support']) <= set(f['evidence_refs'])
        for cl in claims_of(f)]),
    'claim_ids_unique': lambda f: not facts_dict(f) or
    len([cl['claim_id'] for cl in claims_of(f)]) == len({cl['claim_id'] for cl in claims_of(f)}),
}
MEMORY_SHAPE_WORDS = {
    'object': 'facts is an object', 'required': 'every required semantic fact is present',
    'known': 'no undeclared fact is present', 'types': 'every present fact has its declared exact type',
    'access_count': 'access_count is a current integer at least 0', 'half_life': 'half_life_days is null or a current integer at least 1',
    'enums': 'kind, status, verification_state and source are in their owner domains',
    'currentness': 'currentness is in its owner domain', 'timestamps': 'created/updated/last-access are date-times (interim grammar)',
    'hashes': 'both text hashes are 64 lowercase hex', 'embedding_version': 'embedding_version is nonempty',
    'claims_nonempty': 'there is at least one claim', 'string_members': 'tags, evidence_refs and claim_support members are strings',
    'evidence_pattern': 'evidence_refs match the pointer grammar', 'evidence_unique': 'evidence_refs are unique',
    'support_pattern': 'claim_support matches the pointer grammar', 'support_unique': 'claim_support is unique',
    'support_subset': 'claim_support is within evidence_refs', 'claim_shape': 'every claim is an object with its typed required fields',
    'claim_id': 'every claim_id is nonempty', 'claim_text': 'every claim text is nonempty',
    'claim_created_at': 'every claim created_at is a date-time (interim grammar)', 'claim_scope': 'every support_scope is nonblank',
    'claim_currentness': 'every claim currentness is in its owner domain',
    'claim_evidence_pattern': 'every claim evidence_support entry matches the pointer grammar',
    'claim_evidence_unique': 'every claim evidence_support is unique',
    'claim_evidence_subset': 'every claim evidence_support is within evidence_refs', 'claim_ids_unique': 'claim ids are unique',
}


def memory_subject_rows(table, prefix, code, base_field, get_facts, paths):
    for name, predicate in MEMORY_SHAPE.items():
        def fn(c, predicate=predicate):
            facts = get_facts(c)
            return facts is NOT_APPLICABLE or predicate(facts)
        row(table, prefix + '_' + name, code, base_field, MEMORY_SHAPE_WORDS[name], fn, paths)


def memory_record_facts(side):
    def get(c):
        if not is_memory(c['event']):
            return NOT_APPLICABLE
        record = side_record(c, side)
        return NOT_APPLICABLE if record is None else record.get('facts')
    return get


for side_name, side in SIDES:
    memory_subject_rows('memory_' + side_name, 'memory_' + side_name, 'memory_source_shape',
                        '/source_records/' + side_name + '/facts', memory_record_facts(side), EVENT_PATHS)


# publication -------------------------------------------------------------------------
row('publication', 'double_record_list', 'double_record', '/other_events', 'other_events is a list',
    lambda c: type(c['other_events']) is list, 'append retry')
row('publication', 'double_record_unique', 'double_record', '/other_events',
    'no event of the other vocabulary records the same operation and change',
    lambda c: type(c['other_events']) is not list or type(c['event']['payload']) is not dict or not any([
        o['owner_operation_id'] == c['event']['payload']['owner_operation_id'] and
        o['change_id'] == c['event']['payload']['owner_change_id'] and
        o['event_type'].startswith(('browser.workspace.', 'browser.controller_lease.') if is_browser(c['event']) else ('memory.gist.',))
        for o in c['other_events']]), 'append retry')
# Only the candidate is a current writer. Historical original policy is never
# passed to this row, even during a current retry.
row('publication', 'replay_only', 'replay_only', '/event/replay_policy', 'the candidate replay policy is the family current policy',
    lambda c: c['event']['replay_policy'] == contract(c)['replay_policy'], 'append retry')
row('publication', 'first_receipt_terminal_type', 'first_receipt', '/publication/terminal_published', 'terminal_published is a boolean',
    lambda c: type(c['publication']['terminal_published']) is bool, 'append')
row('publication', 'first_receipt_issued_type', 'first_receipt', '/publication/append_receipt_issued', 'append_receipt_issued is a boolean',
    lambda c: type(c['publication']['append_receipt_issued']) is bool, 'append')
row('publication', 'first_receipt_order', 'first_receipt', '/publication', 'terminal publication follows the first receipt',
    lambda c: type(c['publication']['terminal_published']) is not bool or type(c['publication']['append_receipt_issued']) is not bool or
    not (c['publication']['terminal_published'] and not c['publication']['append_receipt_issued']), 'append')


# storage --------------------------------------------------------------------------------
row('storage', 'orig_family', 'original_family', '/storage/event/event_type',
    'Storage\'s original for this retry is of the candidate family',
    lambda c: c['storage']['event']['event_type'] == c['event']['event_type'], 'retry')
row('storage', 'storage_authentic', 'storage_authentic', '/storage/authentic', 'Storage authenticates the original',
    lambda c: c['storage']['authentic'] is True, 'retry history')
row('storage', 'withdrawn', 'withdrawn', '/storage/withdrawn', 'the original is not withdrawn',
    lambda c: c['storage']['withdrawn'] is False, 'retry history')
# The original observation is compared to a Storage-owned record, not itself.
row('storage', 'original_record', 'original_record', '/retry/original_event', 'the retry original observation is Storage\'s record',
    lambda c: strict_equal(c['retry']['original_event'], c['storage']['event']), 'retry')
row('storage', 'historical_record', 'historical_record', '/event', 'the retained event is Storage\'s record',
    lambda c: strict_equal(c['event'], c['storage']['event']), 'history')
for key in ['event_id', 'sequence_id', 'observed_at_utc', 'persisted_at_utc']:
    row('storage', 'storage_' + key, 'storage_' + key, '/storage/receipt/' + key, 'the receipt ' + key + ' equals Storage\'s record',
        lambda c, k=key: strict_equal(c['storage']['receipt'][k], c['storage']['event'][k]), 'retry history')
row('storage', 'storage_receipt_issued', 'storage_receipt_issued', '/storage/receipt/issued', 'Storage issued the first receipt',
    lambda c: c['storage']['receipt']['issued'] is True, 'retry history')


# retry ------------------------------------------------------------------------------------
def retry_expected(c):
    if not c['retry']['dedupe_available']:
        return 'dedupe_unavailable'
    return 'original' if producer_semantic_digest(c['event']) == producer_semantic_digest(c['storage']['event']) else 'idempotency_conflict'


def digests_available(c):
    try:
        producer_semantic_digest(c['event']); producer_semantic_digest(c['storage']['event'])
        return True
    except CAUGHT:
        return False


row('retry', 'retry_effects_type', 'retry', '/retry/effects', 'retry effects is an integer',
    lambda c: type(c['retry']['effects']) is int, 'retry')
row('retry', 'retry_effects_zero', 'retry', '/retry/effects', 'retry has zero effects',
    lambda c: type(c['retry']['effects']) is not int or c['retry']['effects'] == 0, 'retry')
row('retry', 'retry_dedupe_type', 'retry', '/retry/dedupe_available', 'dedupe_available is a boolean',
    lambda c: type(c['retry']['dedupe_available']) is bool, 'retry')
row('retry', 'retry_result', 'retry', '/retry/result', 'the retry result is the producer-digest comparison (CV-317/CV-1100)',
    lambda c: type(c['retry']['dedupe_available']) is not bool or
    (c['retry']['dedupe_available'] and not digests_available(c)) or c['retry']['result'] == retry_expected(c), 'retry')


# retained reader ---------------------------------------------------------------------------
def t(c): return c['reader']['index_read_token']


row('token', 'token_schema_index_read_token', 'token_schema', '/reader/index_read_token',
    'the read token stock schema verdict accepts it', lambda c: token_validator().is_valid(t(c)), 'history')
# Exact typed equality: 1 and 1.0 are different observations (one field read one way).
row('token', 'token_observation', 'token_observation', '/reader/index_read_token', 'the read token is exactly the current token',
    lambda c: strict_equal(t(c), c['reader']['current_index_read_token']), 'history')
row('token', 'snapshot_type', 'snapshot', '/reader/snapshot_id', 'snapshot_id is a string',
    lambda c: type(c['reader']['snapshot_id']) is str, 'history')
row('token', 'snapshot_current_type', 'snapshot', '/reader/current_snapshot_id', 'current_snapshot_id is a string',
    lambda c: type(c['reader']['current_snapshot_id']) is str, 'history')
row('token', 'snapshot_equal', 'snapshot', '/reader/snapshot_id', 'the snapshot is the current snapshot',
    lambda c: type(c['reader']['snapshot_id']) is not str or type(c['reader']['current_snapshot_id']) is not str or
    c['reader']['snapshot_id'] == c['reader']['current_snapshot_id'], 'history')
row('token', 'token_storage', 'token_storage', '/reader/index_read_token/storage_instance_id', 'the token Storage is the event Storage',
    lambda c: t(c)['storage_instance_id'] == c['event']['payload']['storage_instance_id'], 'history')
row('token', 'token_source_identity', 'token_source_identity', '/reader/index_read_token/source_selection/storage_instance_id',
    'the source selection names the token Storage', lambda c: t(c)['source_selection']['storage_instance_id'] == t(c)['storage_instance_id'], 'history')
row('token', 'token_key', 'token_key', '/reader/index_read_token/checkpoint_key', 'the checkpoint key is the generic index key',
    lambda c: t(c)['checkpoint_key'] == 'event_record_index_checkpoint.v1:' + t(c)['storage_instance_id'], 'history')
row('token', 'token_ref', 'token_ref', '/reader/index_read_token/checkpoint_ref', 'the checkpoint ref names the generation',
    lambda c: t(c)['checkpoint_ref'] == t(c)['checkpoint_key'] + '#/generations/' + t(c)['generation_id'], 'history')
row('token', 'token_dataset', 'token_dataset', '/reader/index_read_token/index_dataset_name', 'the dataset names the generation',
    lambda c: t(c)['index_dataset_name'] == 'event_record_index.v2@' + t(c)['generation_id'], 'history')
row('token', 'reader_partition', 'reader_partition', '/reader/scope_partition', 'the reader partition is the event partition',
    lambda c: c['reader']['scope_partition'] == c['scope_partition'], 'history')
for key in ['event_id', 'event_type', 'sequence_id']:
    row('token', 'reader_' + key, 'reader_' + key, '/reader/' + key, 'the reader ' + key + ' equals the event',
        lambda c, k=key: strict_equal(c['reader'][k], c['event'][k]), 'history')
# Hash raw control bytes, and use the existing SP-278 canonical MessagePack
# binding codec for owner adapter values. No local JSON hashing substitutes.
SOURCE_BYTES = ['current_bytes_sha256', 'manifest_bytes_sha256']
SOURCE_VALUES = ['manifest_survivor_prefix_sha256', 'retained_inventory_sha256', 'durable_watermarks_sha256',
                 'excluded_ranges_sha256', 'retired_inputs_sha256']
for key in SOURCE_BYTES:
    row('reader_source', 'digest_' + key, 'digest_' + key, '/reader/index_read_token/source_selection/' + key,
        key + ' is the SHA-256 of the raw control bytes',
        lambda c, k=key: t(c)['source_selection'][k] == hashlib.sha256(bytes.fromhex(c['reader']['source_bytes'][k])).hexdigest(), 'history')
for key in SOURCE_VALUES:
    row('reader_source', 'digest_' + key, 'digest_' + key, '/reader/index_read_token/source_selection/' + key,
        key + ' is the SP-278 binding digest of the source value',
        lambda c, k=key: t(c)['source_selection'][k] == binding_digest(c['reader']['source_values'][k]), 'history')
for key in ['selected_segment_generation', 'manifest_generation', 'recovery_epoch']:
    row('reader_source', 'selection_' + key, 'selection_' + key, '/reader/index_read_token/source_selection/' + key,
        key + ' equals the authenticated source fact',
        lambda c, k=key: strict_equal(t(c)['source_selection'][k], c['reader']['source_facts'][k]), 'history')
row('reader_source', 'digest_anchor', 'digest_anchor', '/reader/index_read_token/generation_anchor_sha256',
    'the anchor digest is the SP-278 binding digest of the anchor', lambda c: t(c)['generation_anchor_sha256'] == binding_digest(c['reader']['anchor']), 'history')
row('reader_source', 'digest_frontier', 'digest_frontier', '/reader/index_read_token/frontier_sha256',
    'the frontier digest is the SP-278 binding digest of the frontier', lambda c: t(c)['frontier_sha256'] == binding_digest(c['reader']['frontier']), 'history')
row('reader_source', 'frontier_revision', 'frontier_revision', '/reader/index_read_token/frontier_revision',
    'the token frontier revision equals the frontier publication revision',
    lambda c: strict_equal(t(c)['frontier_revision'], c['reader']['frontier']['publication_revision']), 'history')


def generation_source(reader):
    anchor = reader['anchor']
    return {'domain': 'pm.event_index.generation.v1',
            'storage_instance_id': anchor['source_selection']['storage_instance_id'],
            'projector_version': '1.0.0', 'source_selection': anchor['source_selection'],
            'generation_seed_sha256': anchor['generation_seed_sha256']}


row('reader_source', 'generation_identity', 'generation_identity', '/reader/index_read_token/generation_id',
    'the generation id is recomputed from its anchor', lambda c: t(c)['generation_id'] == 'eig_' + binding_digest(generation_source(c['reader'])), 'history')
row('reader_source', 'anchor_storage', 'anchor_storage', '/reader/anchor/source_selection/storage_instance_id',
    'the anchor names the token Storage', lambda c: c['reader']['anchor']['source_selection']['storage_instance_id'] == t(c)['storage_instance_id'], 'history')
row('reader_source', 'frontier_selection', 'frontier_selection', '/reader/frontier/source_selection',
    'the frontier selection is the token selection', lambda c: strict_equal(c['reader']['frontier']['source_selection'], t(c)['source_selection']), 'history')
row('reader_access', 'historical_authentic', 'historical_authentic', '/reader/authentic_historical_source', 'the historical source is authentic',
    lambda c: c['reader']['authentic_historical_source'] is True, 'history')
row('reader_access', 'reader_withdrawn', 'reader_withdrawn', '/reader/withdrawn', 'the reader is not withdrawn',
    lambda c: c['reader']['withdrawn'] is False, 'history')
row('reader_access', 'access', 'access', '/reader/access_allowed', 'access is allowed', lambda c: c['reader']['access_allowed'] is True, 'history')
row('reader_access', 'deleted_disclosure', 'deleted_disclosure', '/reader/deleted_content_requested', 'no deleted content is disclosed',
    lambda c: c['reader']['deleted_content_requested'] is False, 'history')
row('reader_access', 'reader_effect', 'reader_effect', '/reader/side_effects', 'the reader has no side effects',
    lambda c: c['reader']['side_effects'] == [], 'history')
row('reader_access', 'family_checkpoint_current', 'family_checkpoint', '/reader/family_checkpoint', 'no family checkpoint is used',
    lambda c: c['reader']['family_checkpoint'] is None, 'history')
row('reader_access', 'family_checkpoint_prior', 'family_checkpoint', '/reader/prior_family_checkpoint', 'no prior family checkpoint is used',
    lambda c: c['reader']['prior_family_checkpoint'] is None, 'history')


# command-only verification outcomes ---------------------------------------------------------
row('no_event', 'command_only_count_type', 'command_only_count', '/event_count', 'event_count is an integer',
    lambda c: type(c['event_count']) is int, 'no_event')
row('no_event', 'command_only_count_zero', 'command_only_count', '/event_count', 'no event is recorded',
    lambda c: type(c['event_count']) is not int or c['event_count'] == 0, 'no_event')
row('no_event', 'command_only_result', 'command_only_result', '/command_result_retained', 'the command result is retained',
    lambda c: c['command_result_retained'] is True, 'no_event')
row('no_event', 'command_only_command', 'command_only_command', '/command', 'the command is memory verify',
    lambda c: c['command'] == 'cmd.chat.memory.verify', 'no_event')
row('no_event', 'command_only_outcome', 'command_only_outcome', '/outcome', 'the outcome is requested, failed or success without change',
    lambda c: c['outcome'] in ['requested', 'failed', 'success_without_real_change'], 'no_event')
row('no_event', 'command_only_delta', 'command_only_delta', '/after_facts', 'the facts are unchanged',
    lambda c: not memory_shape_ok(c['before_facts']) or not memory_shape_ok(c['after_facts']) or strict_equal(c['before_facts'], c['after_facts']),
    'no_event')
row('no_event', 'command_only_verified', 'command_only_verified', '/before_facts/verification_state',
    'a success without change was already verified',
    lambda c: not (c['outcome'] == 'success_without_real_change' and type(c['before_facts']) is dict and
                   type(c['before_facts'].get('verification_state')) is str and
                   c['before_facts']['verification_state'] in MEMORY_ENUMS['verification_state'] and
                   c['before_facts']['verification_state'] != 'Verified'), 'no_event')
for side_name in ['before', 'after']:
    memory_subject_rows('no_event_' + side_name, 'command_only_' + side_name, 'command_only_source_shape',
                        '/' + side_name + '_facts', lambda c, s=side_name: c[s + '_facts'], 'no_event')


# Entailed rows: always refused first by an earlier row (proofs cite path:line).
ec('size_type', 'size_bytes is an exact integer', lambda e, c: type(e['payload']['evidence_refs']['size_bytes']) is int,
   entail=(('payload_schema', 'payload_numbers'),
           'Plans/card2_event_payloads.schema.json evidence_refs anyOf/1 size_bytes {"type": "integer"} refuses every '
           'non-integer and bool through payload_schema; an integral float the stock type admits is refused by payload_numbers '
           '(current_integer). Both rows precede this one; custody applies only to an object payload, the payload_schema precondition.'))
ec('media_type', 'the descriptor media type is the owner constant', lambda e, c: e['payload']['evidence_refs']['media_type'] == EVIDENCE_MEDIA_TYPE,
   entail=(('payload_schema',),
           'Plans/card2_event_payloads.schema.json evidence_refs anyOf/1 media_type {"const": EVIDENCE_MEDIA_TYPE}: a descriptor '
           'with another media type matches neither anyOf branch, so payload_schema (same object payload, earlier table) refuses first.'))
CURRENT_TOKEN_PROOF = ('token_observation requires the current token to equal the read token exactly (strict_equal). '
                       'If they differ, token_observation refuses; if they are equal, the read-token row on the same '
                       'predicate ({0}) refuses the identical value first. Both rows are in the token table, before this one.')
entailed('token_schema_current_index_read_token', 'token_schema', '/reader/current_index_read_token',
         'the current token stock schema verdict accepts it', lambda c: token_validator().is_valid(c['reader']['current_index_read_token']),
         'history', ['token_observation', 'token_schema_index_read_token'], CURRENT_TOKEN_PROOF.format('token_schema_index_read_token'))
TOKEN_FULLMATCH_PROOF = (
    'Every patterned read_token field (Plans/event_record_index_checkpoint.schema.json $defs/read_token: generation_id, '
    'generation_anchor_sha256, frontier_sha256 and the seven source_selection digests) is compared for equality with a value '
    'recomputed from its source: generation_identity (eig_ + SP-278 binding digest), digest_anchor, digest_frontier and the '
    'seven digest_* rows. Each recomputed value is a lowercase hex digest that matches its pattern in full, so a value that '
    'fails only the full match (a trailing LF the stock $ admits) differs from it and that row refuses. All of them are in '
    'the reader_source table, before this entailed table.')
entailed('token_fullmatch_index_read_token', 'token_schema', '/reader/index_read_token', 'the read token patterns match in full',
         lambda c: not token_ready(t(c)) or not pattern_failures(t(c), token_schema(), token_schema()), 'history',
         ['token_schema_index_read_token', 'generation_identity', 'digest_anchor', 'digest_frontier'] +
         ['digest_' + k for k in SOURCE_BYTES + SOURCE_VALUES], TOKEN_FULLMATCH_PROOF)
entailed('token_fullmatch_current_index_read_token', 'token_schema', '/reader/current_index_read_token',
         'the current token patterns match in full',
         lambda c: not token_ready(c['reader']['current_index_read_token']) or
         not pattern_failures(c['reader']['current_index_read_token'], token_schema(), token_schema()),
         'history', ['token_observation', 'token_schema_index_read_token', 'generation_identity', 'digest_anchor', 'digest_frontier'] +
         ['digest_' + k for k in SOURCE_BYTES + SOURCE_VALUES],
         'token_observation refuses any difference from the read token (strict_equal); an identical value fails the read-token '
         'full match too, which is itself always refused first by a join row: ' + TOKEN_FULLMATCH_PROOF)
TOKEN_NUMBERS_PROOF = (
    'The read_token integer slots (Plans/event_record_index_checkpoint.schema.json $defs/read_token: frontier_revision and '
    'source_selection.selected_segment_generation/manifest_generation/recovery_epoch, each integer 0..2^64-1) are each joined '
    'exactly to an SP-278 binding value: frontier_revision to frontier.publication_revision (frontier_revision row), the three '
    'selection integers to source_facts (selection_* rows) and, through frontier_selection, to frontier.source_selection. An '
    'integral float at a slot is refused by that strict join when its partner is an integer; when the partner is the same float, '
    'the SP-278 binding codec cannot encode it (pm_event_index_binding.binding_bytes accepts only uint64 integers), so '
    'digest_frontier refuses. A value outside 0..2^64-1 is refused by the token stock verdict. All these rows precede this one.')
for key, first in [('index_read_token', ['token_schema_index_read_token', 'frontier_revision', 'selection_selected_segment_generation',
                                         'selection_manifest_generation', 'selection_recovery_epoch', 'frontier_selection', 'digest_frontier']),
                   ('current_index_read_token', ['token_observation', 'token_schema_index_read_token', 'frontier_revision',
                                                 'selection_selected_segment_generation', 'selection_manifest_generation',
                                                 'selection_recovery_epoch', 'frontier_selection', 'digest_frontier'])]:
    entailed('token_numbers_' + key, 'current_integer', '/reader/' + key,
             'every ' + key + ' integer slot is an exact current integer (CV-1100)',
             lambda c, k=key: not token_ready(c['reader'][k]) or integer_slots_exact('token', c['reader'][k]),
             'history', first, TOKEN_NUMBERS_PROOF + (' For the current token, token_observation also refuses any difference '
                                                      'from the read token first.' if key.startswith('current') else ''))
for key in ['observed_at_utc', 'persisted_at_utc']:
    entailed('storage_format_' + key, 'storage_format_' + key, '/storage/event/' + key,
             'Storage\'s ' + key + ' is a date-time string (interim grammar; part 2B adopts CV-1101 storage_utc_z)',
             lambda c, k=key: isinstance(c['storage']['event'][k], str) and FormatChecker().conforms(c['storage']['event'][k], 'date-time'),
             'retry history', ['orig_envelope_schema', 'cand_envelope_schema', 'historical_record'],
             'Plans/event_record.schema.json properties.' + key + ' -> $defs/date_time_string (type string, format date-time) with '
             'the same registered FormatChecker. On retry the Storage record is the original view, so orig_envelope_schema refuses '
             'first. On history the retained event equals the Storage record (historical_record) or historical_record refuses; '
             'when equal, cand_envelope_schema refuses the same value first.')


# Storage-original rows that never refuse first. Each runs only when the candidate row on the
# same predicate holds and the original is of the candidate family (orig_family); the inputs
# it reads are then either shared with the candidate (owner, records, pack store, command) or
# joined exactly to them, so a defect refuses first at the named earlier join row.
SAME = ('The Storage original row runs only when the candidate row on the same predicate holds and the original is of '
        'the candidate family (orig_family). ')


def orig_entail(name, first, proof):
    rid = 'orig_' + name
    r = ROW_SPEC[rid]
    r['table'] = 'entailed_' + rid
    ENTAILED[rid] = (tuple(['orig_' + f for f in first] + ['cand_' + f for f in first]), SAME + proof)


ROW_SPEC = {r['id']: r for r in ROWS}
FACT_JOIN = {'previous_lifecycle_state': 'browser_fact_previous_lifecycle_state', 'lifecycle_state': 'browser_fact_lifecycle_state',
             'previous_session_class': 'browser_fact_previous_session_class', 'session_class': 'browser_fact_session_class',
             'previous_takeover_state': 'browser_fact_previous_takeover_state', 'takeover_state': 'browser_fact_takeover_state',
             'previous_pinned': 'memory_fact_previous_pinned', 'pinned': 'memory_fact_pinned',
             'previous_verification_state': 'memory_fact_previous_verification_state', 'verification_state': 'memory_fact_verification_state'}
PATTERN_JOINS = ['source_storage_instance_id', 'source_server_id', 'source_computer_id', 'source_owner_operation_id',
                 'source_owner_change_id', 'source_before_record_ref', 'source_after_record_ref', 'source_subject', 'source_workspace',
                 'scope_project_id', 'scope_thread_id', 'scope_partition', 'source_thread_id', 'memory_fact_evidence_refs',
                 'payload_schema']
orig_entail('payload_fullmatch', PATTERN_JOINS,
            'Every patterned payload string (Plans/card2_event_payloads.schema.json: computer_id, server_id, storage_instance_id, '
            'owner_operation_id, browser_session_id/gist_id, workspace_id, project_id, thread_id, before/after_record_ref, '
            'owner_change_id, inline evidence_refs items) is joined exactly to an owner or record value (the source_*, scope_* and '
            'memory_fact_evidence_refs rows). The candidate holds those joins and its own full match, so each joined value matches '
            'in full; an original value that fails only the full match differs from it and the join refuses first.')
orig_entail('source_project_id', ['scope_project_id', 'scope_partition', 'envelope_schema'],
            'The candidate payload project_id equals the owner. An original payload project_id that differs: if the original '
            'envelope project_id differs from it, scope_project_id refuses; if equal, the original envelope project differs from '
            'the candidate envelope project, so its partition (project~ base64url, injective) differs from the scenario partition '
            'the candidate holds (scope_partition); in application scope the envelope project must be null (envelope_schema allOf) '
            'and scope_project_id refuses.')
orig_entail('source_scope_kind', ['scope_scope_kind', 'scope_partition', 'scope_project_id', 'envelope_schema', 'scope_schema_family'],
            'The candidate payload scope_kind equals the owner. An original payload scope_kind that differs either differs from its '
            'own envelope scope_kind (scope_scope_kind) or the original envelope scope differs from the candidate: application '
            'needs a null project_id (envelope_schema allOf, else scope_project_id against the payload), and the partition changes '
            "between 'app' and project~ (scope_partition).")
orig_entail('private_thread', ['scope_thread_id', 'source_thread_id', 'scope_scope_kind', 'scope_partition', 'envelope_schema'],
            'An application memory original with a null envelope thread: the candidate of the same family and scope holds the rule, so '
            'its thread, equal to the owner thread (source_thread_id), is non-null; the original payload thread differs from the null '
            'envelope thread (scope_thread_id) or, when also null, from the owner (source_thread_id). An original of another scope '
            'refuses at the scope rows first.')
orig_entail('lineage_run_attempt', ['lineage_run_id', 'lineage_attempt_id'],
            'The candidate holds the shape, so the owner run_id and attempt_id (equal to the candidate, lineage_* joins) are null '
            'together or set together; an original with only one null differs from the owner there and that join refuses.')
orig_entail('lineage_node', ['lineage_node_id', 'lineage_run_id'],
            'An original with a null run_id and a node: if the owner run is set, lineage_run_id refuses; if null, the candidate '
            '(holding the shape and joins) has a null node equal to the owner, so lineage_node_id refuses.')
orig_entail('revision_step', ['source_revision_before', 'source_revision_after'],
            'The candidate holds the step and both revision joins, so owner after = owner before + 1; an original that breaks the '
            'step differs from the owner in revision_before or revision_after and that join refuses.')
for name, joins, words in [
        ('transition_closed_previous', ['previous_lifecycle_state'], 'previous lifecycle open'),
        ('transition_closed_lifecycle', ['lifecycle_state'], 'lifecycle closed'),
        ('transition_promoted_previous', ['previous_session_class'], 'previous class not normal_browsing'),
        ('transition_promoted_class', ['session_class'], 'class normal_browsing'),
        ('transition_takeover_value', ['previous_takeover_state', 'takeover_state'], 'a takeover state change'),
        ('transition_created_lifecycle', ['lifecycle_state'], 'lifecycle open'),
        ('transition_verify_state', ['verification_state'], 'verification_state Verified'),
        ('transition_discard_previous', ['previous_verification_state'], 'previous state not Discarded'),
        ('transition_discard_state', ['verification_state'], 'state Discarded')]:
    orig_entail(name, [FACT_JOIN[j] for j in joins] + ['memory_command_manual', 'memory_command_automatic', 'payload_schema'],
                'The operation command is shared, so an original of another operation than the candidate fails memory_command_* '
                '(browser families have one transition per family). With the same operation, the candidate holds the clause (' +
                words + ') with values equal to the before/after records (' + ', '.join(FACT_JOIN[j] for j in joins) + '); an '
                'original that breaks the clause differs from those records and the record join refuses first.')
for name, joins in [('transition_pin_pinned', ['pinned', 'previous_pinned']), ('transition_unpin_pinned', ['pinned', 'previous_pinned'])]:
    op = name.split('_')[1]
    other = 'unpin' if op == 'pin' else 'pin'
    orig_entail(name, [FACT_JOIN[j] for j in joins] + ['memory_command_manual', 'transition_' + op + '_previous', 'payload_schema'],
                'pin and unpin share cmd.chat.memory.pin, so the candidate is a pin or an unpin. A ' + op + ' candidate holds this '
                'clause with pinned equal to the after record, so an original that breaks it refuses at memory_fact_pinned. An ' + other +
                ' candidate has previous_pinned equal to the before record and opposite to what ' + op + ' needs, so the original '
                'refuses first at memory_fact_previous_pinned or at transition_' + op + '_previous (an earlier row of the transition table).')
orig_entail('transition_created_revision', ['source_revision_before'],
            'The candidate created event holds revision_before 0, equal to the owner before revision; an original with another '
            'revision_before refuses at source_revision_before.')
orig_entail('transition_successor_revision', ['source_revision_before'],
            'The candidate holds a nonzero revision_before equal to the owner; an original with revision_before 0 refuses at '
            'source_revision_before.')
orig_entail('transition_successor_before_ref', ['source_before_record_ref'],
            'The candidate names its before record, equal to the owner reference; an original with a null before_record_ref refuses '
            'at source_before_record_ref.')
for name in ['transition_verify_succeeded', 'transition_verify_not_request_only']:
    orig_entail(name, ['memory_command_manual', 'memory_command_automatic', 'payload_schema'],
                'The clause reads only the shared owner verification facts. A candidate verify holds it; an original verify on a '
                'candidate of another operation fails memory_command_* (cmd.chat.memory.verify is the verify command only).')
orig_entail('transition_memory_initial_operation', ['memory_command_manual', 'payload_schema'],
            'The candidate initial gist is automatic, so the shared command starts with RealMemoryProvider.; an original manual '
            'operation fails memory_command_manual, and an operation outside the enum fails payload_schema.')
VERIFY_FIRST = ['memory_fact_verification_state', 'memory_fact_previous_verification_state', 'memory_command_manual',
                'memory_command_automatic', 'payload_schema']
for name in ['verification_override_type', 'verification_support_type', 'verification_override_verify', 'verification_support_current',
             'verified_claims_support', 'verified_claims_current']:
    orig_entail(name, VERIFY_FIRST,
                'The row reads the shared owner facts and after record, scoped by the event verification_state, '
                'previous_verification_state and operation. When the original and the candidate agree on those three, the row is '
                'the candidate row on the same inputs. They cannot differ otherwise: the states are joined to the records '
                '(memory_fact_*verification_state) and the operation to the shared command (memory_command_*).')
CUSTODY_FIRST = ['memory_fact_evidence_refs', 'custody_id', 'custody_canonical', 'custody_row', 'custody_decode', 'custody_list_type',
                 'custody_list_pattern', 'custody_list_unique']
for name in ['custody_authentic', 'custody_durable', 'custody_owner_storage_instance_id', 'custody_owner_server_id',
             'custody_owner_scope_kind', 'custody_owner_project_id', 'custody_owner_thread_id', 'custody_route']:
    orig_entail(name, CUSTODY_FIRST,
                'An original naming the candidate pack reads the identical pack row and decoded list, which the candidate row accepts. '
                'An original naming another pack row: that row decodes to the after-record list only if its bytes are the canonical '
                'bytes of that list (custody_canonical), whose BLAKE3 digest is the candidate pack id (custody_id); otherwise '
                'memory_fact_evidence_refs, or the row/decode/list rows, refuse first.')
orig_entail('memory_delta_nonempty', ['memory_delta_matches'],
            'The row reads only the shared before/after records of the same family, so with the candidate row holding it holds; it '
            'cannot refuse for a Storage original at all.')

for view in ['cand', 'orig']:
    first, proof = ENTAILED[view + '_verification_evidence']
    ENTAILED[view + '_verification_evidence'] = (tuple(first) + tuple('memory_after_' + k for k in MEMORY_SHAPE) +
                                                 ('record_resolution_after',), proof)


# ---------------------------------------------------------------------------
# Table evaluation
# ---------------------------------------------------------------------------
# Tables hold at most TABLE_ROWS rows (the shared tool's cost grows steeply with table size);
# a longer phase is split into consecutive parts evaluated in the same order.
TABLE_ROWS = 8
_groups = {}
for _r in ROWS:
    _groups.setdefault(_r['table'], []).append(_r)
for _table, _rows in _groups.items():
    if len(_rows) > TABLE_ROWS and not _table.startswith('entailed_'):
        for _i, _r in enumerate(_rows):
            _r['table'] = _table + '_' + str(_i // TABLE_ROWS + 1)
# Entailed tables run after every other table: each entailing row is earlier.
_order = []
for _r in ROWS:
    if _r['table'] not in _order:
        _order.append(_r['table'])
TABLES[:] = [t for t in _order if not t.startswith('entailed_')] + [t for t in _order if t.startswith('entailed_')]
_TABLE_ROWS = {}
_TABLE_FIELDS = {}
ROW_BY_ID = {r['id']: r for r in ROWS}


def table_rows(table):
    rows = _TABLE_ROWS.get(table)
    if rows is None:
        module = importlib.import_module(TABLE_PREFIX + table)
        case = module.case(None)
        rows = _TABLE_ROWS[table] = [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]
        _TABLE_FIELDS[table] = module.FIELDS
    return rows


@contextmanager
def exact_digits():
    """Integers render exactly while observing: a 4,400-digit integer must reach its refusal
    row, never raise ValueError out of jsonschema's error text (CV-1100 sets no global cap)."""
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        yield
    finally:
        sys.set_int_max_str_digits(previous)


def observe(c):
    """One boolean observation per row from the complete scenario."""
    with exact_digits():
        return _observe(c)


def _observe(c):
    facts = {}
    valid_path = type(c.get('path')) is str and c['path'] in PATH_NAMES
    shape = valid_path and ('event' in c) == (c['path'] != 'no_event')
    for r in ROWS:
        if r['table'] != 'scenario' and (not shape or c['path'] not in r['paths']):
            facts[r['id']] = True
            continue
        try:
            facts[r['id']] = r['fn'](c) is True
        except CAUGHT:
            facts[r['id']] = False      # a malformed observation never succeeds through an exception
    return facts


def table_refusals(table, facts):
    rows = table_rows(table)
    observed = {k: facts[k] for k in _TABLE_FIELDS[table]}
    refused = []
    for name, predicate, context in rows:
        code = predicate(observed, context)
        if code is not None:
            refused.append((name, code))
    return observed, refused


def evaluate(c):
    """(first refusing row and code or None, every refusing row) through the tables in order."""
    facts = observe(c)
    first, failing = None, []
    for table in TABLES:
        observed, refused = table_refusals(table, facts)
        if refused and first is None:
            first = refused[0]
        failing += [name for name, _ in refused]
    return first, failing


def refusal(c):
    return evaluate(c)[0]


def table_order_errors():
    """Each generated factory requires exactly its spec rows, in spec order."""
    errors = []
    for table in TABLES:
        path = ROOT / 'scripts' / (TABLE_PREFIX + table + '.py')
        if not path.exists():
            errors.append({'table': table, 'error': 'missing module'}); continue
        tree = ast.parse(path.read_text())
        factory = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'case')
        check = next(n for n in factory.body if isinstance(n, ast.FunctionDef) and n.name == 'check')
        required = [c.args[0].value for c in ast.walk(check) if isinstance(c, ast.Call) and ast.unparse(c.func) == 'table.require']
        spec = [r['id'] for r in ROWS if r['table'] == table]
        if required != spec or [name for name, _, _ in table_rows(table)] != spec:
            errors.append({'table': table, 'error': 'rows differ from the spec'})
    return errors


def mutate(base, changes):
    c = copy.deepcopy(base)
    for pointer, value in changes:
        parts = pointer.strip('/').split('/'); target = c
        for part in parts[:-1]: target = target[int(part)] if isinstance(target, list) else target[part]
        target[int(parts[-1]) if isinstance(target, list) else parts[-1]] = copy.deepcopy(value)
    return c


def expected_rows(case):
    """Rows a negative may refuse: its target row, or every row of its code(s), plus rows entailed by them."""
    if 'target' in case:
        return {case['target']}
    return set(case.get('guards', [case['guard']]))


def judge(case, first, failing):
    """A negative is refused first at its target, and every other refusing row is entailed by the first."""
    if first is None:
        return 'accepted'
    name, code = first
    if name in ENTAILED:
        return 'entailed_row_first:' + name
    if 'target' in case:
        if name != case['target']:
            return 'wrong_first_row'
    elif code not in set(case.get('guards', [case['guard']])):
        return 'wrong_first_code'
    others = [n for n in failing if n != name]
    bad = [n for n in others if n not in ENTAILED or name not in ENTAILED[n][0]]
    if bad:
        return 'second_row:' + ','.join(bad)
    codes = {ROW_BY_ID[n]['code'] for n in failing}
    if 'target' not in case and codes != set(case.get('guards', [case['guard']])):
        return 'codes_differ'
    return None


def _check_parse_rejections(fixtures, errors):
    # The shared current parser consumes whole tokens: 01/00/-01 are JSON syntax
    # errors and -0 is refused by the CV-1100 integer token grammar; NaN/Infinity
    # are refused as non-finite. None enters an identity, digest or retry.
    for case in fixtures.get('parse_rejections', []):
        try:
            loads_fixture(case['json_number'])
        except Refusal:
            continue
        errors.append({'case': case['id'], 'error': 'non-JSON or non-current number accepted'})


def _run(fixtures=None, event_type=None, p2a=None):
    for name in ['card2_event_payloads.schema.json', 'event_record.schema.json', 'event_record_index_checkpoint.schema.json']:
        local_refs_resolve(load(name))
    errors = [{'table_order': e} for e in table_order_errors()]
    fixtures = fixtures or load('card2_event_fixtures.json')
    p2a = p2a if p2a is not None else load('card2_event_p2a_cases.json')
    if event_type is not None:
        fixtures = dict(fixtures)
        fixtures['positives'] = [c for c in fixtures['positives'] if c['event']['event_type'] == event_type]
        fixtures['no_event_cases'] = fixtures['no_event_cases'] if event_type == 'memory.gist_state_changed' else []
        selected = {c['id'] for c in fixtures['positives'] + fixtures['no_event_cases']}
        fixtures['negative_cases'] = [c for c in fixtures['negative_cases'] if c['base'] in selected]
    _check_parse_rejections(fixtures, errors)
    bases = {c['id']: c for c in fixtures['positives'] + fixtures['no_event_cases']}
    refused_rows = set()
    for c in bases.values():
        first, failing = evaluate(c)
        if failing:
            errors.append({'case': c['id'], 'unexpected_failures': failing})
    witnesses = [*fixtures['negative_cases']]
    controls = 0
    for case in p2a.get('cases', []):
        if case['base'] not in bases:
            continue
        if case.get('expect') == 'accept':
            first, failing = evaluate(mutate(bases[case['base']], case['changes']))
            controls += 1
            if failing:
                errors.append({'case': case['id'], 'unexpected_failures': failing})
        else:
            witnesses.append(case)
    for case in witnesses:
        if not case.get('defect'):
            errors.append({'case': case['id'], 'error': 'missing single-defect explanation'})
        first, failing = evaluate(mutate(bases[case['base']], case['changes']))
        verdict = judge(case, first, failing)
        if verdict:
            errors.append({'case': case['id'], 'error': verdict, 'first': first, 'failing': failing})
        elif first is not None:
            refused_rows.add(first[0])
    for f in load('card2_event_contracts.json')['families']:
        if event_type is not None and f['event_type'] != event_type: continue
        for scope in ['project', 'application']:
            for path in ['append', 'retry', 'history']:
                if not any([c.get('path') == path and c['event']['event_type'] == f['event_type'] and c['event']['scope_kind'] == scope
                            for c in bases.values() if 'event' in c]):
                    errors.append({'missing_positive': [f['event_type'], scope, path]})
    without = sorted(r['id'] for r in ROWS if r['id'] not in refused_rows and r['id'] not in ENTAILED)
    return {'status': 'FAIL' if errors else 'PASS', 'native_execution': 'NOT_RUN', 'admission': 'ABSENT',
            'positives': len(bases), 'p2a_controls': controls, 'negatives': len(witnesses), 'rows': len(ROWS),
            'tables': len(TABLES), 'entailed_rows': sorted(ENTAILED), 'rows_refused_first': len(refused_rows),
            'rows_without_first_refusal_in_this_run': without, 'errors': errors}


def run(fixtures=None, event_type=None, p2a=None):
    return _run(fixtures, event_type, p2a)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--output', type=Path); parser.add_argument('--fixtures', type=Path)
    parser.add_argument('--family', choices=[f['event_type'] for f in load('card2_event_contracts.json')['families']]); args = parser.parse_args()
    try: result = run(loads_fixture(args.fixtures.read_text()) if args.fixtures else None, args.family)
    except Exception as exc: result = {'status': 'FAIL', 'errors': [type(exc).__name__ + ': ' + str(exc)[:500]]}
    if args.output: args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'rows_without_first_refusal_in_this_run'}, indent=2)[:20000])
    raise SystemExit(0 if result['status'] == 'PASS' else 1)
