#!/usr/bin/env python3
"""Static DG6A payload/custody oracle; grants no admission or native proof."""
import copy
import argparse
import hashlib
from datetime import datetime
import importlib.util
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote
from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import SchemaError

ROOT = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location('pm_dg6a_readiness_codec', ROOT / 'scripts/pm-implementation-readiness.py')
_codec = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = _codec
_spec.loader.exec_module(_codec)

_domain_spec = importlib.util.spec_from_file_location('pm_dg6a_domain', ROOT / 'scripts/pm-dg6a-domain.py')
domain = importlib.util.module_from_spec(_domain_spec)
_domain_spec.loader.exec_module(domain)
Draft202012Validator = domain.validator

# Sweep part 2A guard tables (Method B, scripts/pm_guard_isolation.py). Table
# modules are underscore modules imported normally; witness collection stays
# in the unscanned runner (scripts/pm-dg6a-guard-tables.py).
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dg6a_table_profile as _profile_table  # noqa: E402
import pm_dg6a_table_writer_policy as _writer_table  # noqa: E402
import pm_dg6a_table_cursor as _cursor_table  # noqa: E402
import pm_dg6a_tables as tables  # noqa: E402
from pm_event_numbers import Refusal, current_integer, producer_semantic_digest  # noqa: E402
import pm_dg6a_p2a_witnesses as p2a_witnesses  # noqa: E402
import pm_dg6a_custody as custody  # noqa: E402
import pm_dg6a_p2b_witnesses as p2b_witnesses  # noqa: E402

_PROFILE_ROWS = [(name, guard.predicate) for name, guard in _profile_table.case(None).table.guards.items()]
PROFILE_RECORDER = None
_WRITER_ROWS = [(name, guard.predicate) for name, guard in _writer_table.case(None).table.guards.items()]
WRITER_RECORDER = None
_CURSOR_ROWS = [(name, guard.predicate) for name, guard in _cursor_table.case(None).table.guards.items()]
CURSOR_RECORDER = None

def load(path):
    return domain.loads((ROOT / path).read_text())

def payload_observation(payload, guard):
    """alert_payload FIELDS; derived only (schema-accepted payload, fixture guard).

    The three flags are read with .get, as the pre-table any() never read a
    later flag after an earlier one failed; a missing flag is the False fact.
    """
    return dict(successor=payload['result_revision'] == payload['prior_revision'] + 1,
                current=guard.get('current') is True, allowed=guard.get('allowed') is True,
                committed=guard.get('committed') is True,
                protection_is_bool=type(guard['protected']) is bool,
                snooze_live=not snooze_expired(payload),
                interrupting_command=payload['command_id'] in ('cmd.alert.snooze', 'cmd.alert.mute_rule'),
                protected_truthy=bool(guard['protected']))


def errors(payload, schema, guard):
    """Refuses only through sch_alert_payload, writer_policy and alert_payload rows."""
    found = list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(payload))
    refused = found if tables.first('sch_alert_payload', schema_errors=len(found)) else []
    refused += writer_policy_errors(guard.get('replay_policy', 'dedupe_by_idempotency_key'))
    if not refused:
        refused += tables.every('alert_payload', **payload_observation(payload, guard))
    return refused

def snooze_expired(payload):
    return 'snooze_until' in payload and domain.instant_le(payload['snooze_until'], payload['ts'])


def packed(value):
    return _codec.canonical_messagepack_bytes(value)


def encoded_size(value):
    """Canonical MessagePack size, or None when the recipe cannot encode the value.

    CV-1100 sets no schema integer cap, so an integer outside the recipe's
    -2^63..2^64-1 domain (or a fractional carrier) reaches the physical route;
    SP-1100 makes that a route refusal, never a crash.
    """
    try:
        return len(packed(value))
    except (ValueError, TypeError):
        return None

def reference_observation(schema, ref):
    """schema_ref FIELDS for one $ref occurrence; derived only.

    A non-string reference is not local (the pre-table code raised an
    uncaught AttributeError there); later facts are False once an earlier
    one fails, and the chained rows ignore them.
    """
    local = type(ref) is str and (ref == '#' or ref.startswith('#/'))
    target, resolves = schema, False
    if local:
        resolves = True
        if ref != '#':
            try:
                for part in unquote(ref[2:]).split('/'):
                    part = part.replace('~1', '/').replace('~0', '~')
                    target = target[int(part)] if isinstance(target, list) else target[part]
            except (KeyError, IndexError, TypeError, ValueError):
                resolves = False
    return dict(local=local, resolves=resolves, target_schema=resolves and isinstance(target, (dict, bool)))


def schema_ref_errors(schema):
    """Resolve every local reference, including unused definitions and optional leaves.

    Each occurrence refuses only through the schema_ref rows (code + ': ' + ref).
    """
    found = []
    def visit(node):
        if isinstance(node, dict):
            if '$ref' in node:
                code = tables.first('schema_ref', **reference_observation(schema, node['$ref']))
                if code:
                    found.append(code + ': ' + str(node['$ref']))
            for child in node.values():
                visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)
    visit(schema)
    return found

def check_schema(schema):
    """The metaschema refuses through schema_document; references through schema_ref."""
    try:
        Draft202012Validator.check_schema(schema)
        valid = True
    except SchemaError:
        valid = False
    code = tables.first('schema_document', metaschema_valid=valid)
    assert code is None, code
    unresolved = schema_ref_errors(schema)
    assert not unresolved, unresolved

OPERATION_PHASES = ('alert_operation_identity', 'alert_command_keys_a', 'alert_command_keys_b', 'alert_command_keys_entailed',
                    'alert_operation_joins',
                    'alert_owner_prior', 'alert_owner_candidate', 'alert_candidate_state')


def operation_observation(value, schema):
    """Facts of every OPERATION_PHASES table for one schema- and size-accepted operation.

    Digests and identities are recomputed from their sources. A command field
    outside a family's schema cannot occur (each original_command schema is
    closed; main checks the per-field rows cover every declared command field),
    and a row whose field the family does not have holds (not applicable).
    """
    payload, command = value['payload'], value['original_command']
    event_type = schema['properties']['schema_id']['const'].removeprefix('pm.storage_value.').removesuffix('_operation.v1').replace('alert_', 'alert.', 1)
    h = hashlib.sha256(packed([value['storage_instance_id'], value['project_id'], event_type,
                               value['idempotency_key']])).hexdigest()
    expected_command_fields = {key for key in payload if key not in ('schema_id', 'schema_version') and not key.startswith('result_')}
    facts = dict(operation_digest_exact=value['operation_digest'] == h,
                 event_id_exact=value['event_id'] == 'evt_' + event_type.replace('.', '_') + '_' + h,
                 request_digest_exact=value['request_digest'] == request_digest(command, payload),
                 command_fields_present=not (expected_command_fields - command.keys()))
    keys = {key: key not in command or not (command[key] != payload.get(key))
            for phase in ('alert_command_keys_a', 'alert_command_keys_b', 'alert_command_keys_entailed') for key in tables.fields(phase)}
    joins = dict(project_exact=value['project_id'] == payload['project_id'],
                 key_exact=value['idempotency_key'] == payload['idempotency_key'],
                 successor=payload['result_revision'] == payload['prior_revision'] + 1)
    prior, candidate = value['prior_owner_state'], value['candidate_owner_state']
    rule = event_type == 'alert.rule_muted'
    subject, source = ('alert_rule_id', 'alert_rule_ref') if rule else ('alert_id', 'alert_record_ref')
    state_key = 'mute_state' if rule else 'acknowledgement_state'
    prefix = 'mute_state' if rule else ('acknowledgement_state' if event_type == 'alert.acknowledged' else 'alert_state')
    owners = {}
    for name, snapshot, revision, state in [('prior', prior, 'prior_revision', 'prior_' + prefix),
                                             ('candidate', candidate, 'result_revision', 'result_' + prefix)]:
        expected = {'project_id': payload['project_id'], subject: payload[subject], 'source_record_ref': payload[source],
                    'revision': payload[revision], state_key: payload[state]}
        owners[name] = {field: field not in expected or not (snapshot[field] != expected[field])
                        for field in tables.fields('alert_owner_' + name)}
    if rule:
        state = dict(root_cause_ref=not (candidate['root_cause_ref'] != prior['root_cause_ref']),
                     mute_expires_at=not (candidate['mute_expires_at'] != payload.get('mute_expires_at')),
                     unread=True, inbox_visible=True, snooze_until=True)
    else:
        expected_unread = False if event_type == 'alert.acknowledged' else prior['unread']
        expected_visible = prior['inbox_visible'] if event_type == 'alert.acknowledged' else False
        expected_snooze = payload['snooze_until'] if event_type == 'alert.snoozed' else prior['snooze_until']
        state = dict(root_cause_ref=True, mute_expires_at=True,
                     unread=not (candidate['unread'] != expected_unread),
                     inbox_visible=not (candidate['inbox_visible'] != expected_visible),
                     snooze_until=not (candidate['snooze_until'] != expected_snooze))
    state['snooze_live'] = not snooze_expired(payload)
    return {'alert_operation_identity': facts, 'alert_command_keys_a': {k: keys[k] for k in tables.fields('alert_command_keys_a')},
            'alert_command_keys_b': {k: keys[k] for k in tables.fields('alert_command_keys_b')},
            'alert_command_keys_entailed': {k: keys[k] for k in tables.fields('alert_command_keys_entailed')},
            'alert_operation_joins': joins, 'alert_owner_prior': owners['prior'],
            'alert_owner_candidate': owners['candidate'], 'alert_candidate_state': state}


def operation_errors(value, schema):
    """Refuses only through sch_alert_operation, alert_operation_size and OPERATION_PHASES rows."""
    found = list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(value))
    if tables.first('sch_alert_operation', schema_errors=len(found)):
        return found
    code = tables.first('alert_operation_size', encoded_bytes=encoded_size(value))
    if code:
        return [code]
    facts = operation_observation(value, schema)
    found = []
    for phase in OPERATION_PHASES:
        found += tables.every(phase, **facts[phase])
    return found


def semantic_packed(value):
    domain.semantic_numbers(value)
    domain.semantic_formats(value)
    return packed(value)


def request_digest(command, payload):
    return hashlib.sha256(semantic_packed(dict(original_command=command, candidate_payload=payload))).hexdigest()


def isolated_cases(kind, owner, family, fixture):
    spec = importlib.util.spec_from_file_location('dg6a_guard_vectors', ROOT / 'scripts/pm-dg6a-guard-check.py')
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    return helper.vectors(kind, owner, family, fixture)


RETAINED_RETRY_FACTS = ('admission_evidence',) + custody.CUSTODY_FACTS + (
    'stored_valid', 'payload_is_stored', 'original_digest_valid', 'body_unchanged')


def retained_retry_observation(command, payload, operation, original_event):
    """retry_retained_* FIELDS plus the entailed digest fact; derived only.

    SP-1101 (sweep part 2B): the original is resolved through the shared
    RetainedDispatcher (scripts/pm_dg6a_custody.py) from Storage's sealed
    custody at its event_ref, and the payload edition and its exact frozen
    validator come from that custody's recipe tuple; caller fields never select
    the edition or the recipe, and there is no current-then-legacy probing. The
    request digest keeps the existing exact MessagePack recipe of the original.
    A fact is computed only when every earlier fact holds (otherwise False, which
    the chained rows ignore), so no read reaches a member an earlier fact refuses.
    Append resolution/source custody is checked separately by append_result_errors.
    """
    facts = dict.fromkeys(RETAINED_RETRY_FACTS + ('stored_object', 'digest_equal'), False)
    if not (type(original_event) is dict and original_event.get('valid_when_written') is True):
        return facts
    facts['admission_evidence'] = True
    custody_facts, original = custody.resolve(original_event)
    facts.update(custody_facts)
    if original is None:
        return facts
    stored = original_event.get('payload')
    facts['stored_object'] = type(stored) is dict
    facts['stored_valid'] = not list(custody.frozen_validator(original).iter_errors(stored))
    facts['payload_is_stored'] = facts['stored_valid'] and exact_value(operation['payload'], stored)
    if not facts['payload_is_stored']:
        return facts
    # The earlier recipe already owned by the lane, with no new cap, serializer,
    # coercion, or current-write semantic-number validation.
    frozen = dict(original_command=operation['original_command'], candidate_payload=stored)
    facts['original_digest_valid'] = hashlib.sha256(packed(frozen)).hexdigest() == operation['request_digest']
    facts['body_unchanged'] = facts['original_digest_valid'] and exact_value(command, operation['original_command']) and exact_value(payload, stored)
    if facts['body_unchanged']:
        facts['digest_equal'] = hashlib.sha256(packed(dict(original_command=command, candidate_payload=payload))).hexdigest() == operation['request_digest']
    return facts


def retry_refusals(caller, command, payload, original_digest, operation=None, original_event=None):
    """Retry body comparison; refuses only through retry_current_/retry_retained_<caller> rows.

    `original_digest` is always the original operation's request_digest at
    both call sites (alert and panel protocol_errors), which makes RR08 entailed.
    """
    if operation is not None and operation['state'] in ('committed', 'settled'):
        facts = retained_retry_observation(command, payload, operation, original_event)
        code = tables.first('retry_retained_' + caller, **{k: facts[k] for k in RETAINED_RETRY_FACTS})
        if code is None:
            code = tables.first('retry_retained_' + caller + '_entailed', stored_object=facts['stored_object'],
                                digest_equal=facts['digest_equal'])
        return [code] if code else []
    try:
        digest, preimage_ok = request_digest(command, payload), True
    except (KeyError, TypeError, ValueError):
        digest, preimage_ok = None, False
    code = tables.first('retry_current_' + caller, preimage_ok=preimage_ok, digest_equal=preimage_ok and digest == original_digest)
    return [code] if code else []


def protocol_shape(context, original, kind):
    """Navigation containers before any indexing, comparison or hashing.

    Returns the protocol_shape row's refusal code, or None. Facts that do not
    apply to the kind hold; facts after a failed earlier fact are not read.
    """
    common = {'replay_policy', 'receipt_event_id', 'append_resolution', 'append_original'}
    fields = {
        'alert': {'admitted', 'allowed', 'current', 'source_verified', 'retry_command', 'retry_payload'},
        'panel': {'admitted', 'desktop', 'source_verified', 'original_event_id', 'session', 'window',
                  'retry_command', 'retry_payload', 'publication_state', 'cursor', 'frontier'},
        'concern': {'admitted', 'authority_verified', 'source_current', 'permission_allowed',
                    'subject_already_active', 'concern_key_exists', 'authority', 'retry_digest', 'retry_body', 'publication_state'},
    }[kind]
    facts = dict(context_object=type(context) is dict, members=False, retry_command_object=True,
                 retry_payload_object=True, authority_object=True, authority_members=True)
    facts['members'] = facts['context_object'] and common | fields <= context.keys()
    if facts['members'] and kind == 'concern':
        authority = context['authority']
        facts['authority_object'] = type(authority) is dict
        facts['authority_members'] = facts['authority_object'] and {'actor_ref', 'creator_kind', 'project_id', 'authority_basis_ref',
                'currentness_basis_ref', 'permission_snapshot_ref', 'source_refs'} <= authority.keys()
    elif facts['members']:
        facts['retry_command_object'] = type(context['retry_command']) is dict
        facts['retry_payload_object'] = type(context['retry_payload']) is dict
    return tables.first('protocol_shape', **facts)


def protocol_errors(context, original):
    """Current retry evidence; the retained historical reader never calls this.

    Refuses only through protocol_shape, writer_policy, alert_protocol,
    retry_*_alert and append_result rows.
    """
    shape = protocol_shape(context, original, 'alert')
    if shape:
        return [shape]
    found = writer_policy_errors(context['replay_policy'])
    found += tables.every('alert_protocol', admitted=context['admitted'] is True, allowed=context['allowed'] is True,
                          current=context['current'] is True, source_verified=context['source_verified'] is True,
                          receipt_exact=context['receipt_event_id'] == original['event_id'])
    found += retry_refusals('alert', context['retry_command'], context['retry_payload'], original['request_digest'],
                            original, context.get('append_original'))
    family = original['schema_id'].removeprefix('pm.storage_value.').removesuffix('_operation.v1').replace('_', '.', 1)
    found += append_result_errors(original, context.get('append_resolution'), context.get('append_original'), family)
    return found


def append_result_errors(operation, resolved, expected, event_type):
    """Join current recovery/return evidence to a separately retained Storage original.

    The resolver output is an input, not authority. Its complete event, source,
    eleven-field first receipt and four-field result must equal independent evidence.
    Native authentication of that evidence remains NOT_RUN. A prepared operation
    has no append yet (path selection, not a refusal). Refuses only through the
    append_result rows.
    """
    if operation['state'] == 'prepared':
        return []
    bindings = dict(event_type=event_type, event_id=operation['event_id'],
                    storage_instance_id=operation['storage_instance_id'], project_id=operation['project_id'],
                    payload=operation['payload'])
    if 'scope_partition' in operation:
        bindings['scope_partition'] = operation['scope_partition']
    expected_object = type(expected) is dict
    facts = dict(resolved_exact=exact_value(resolved, expected), expected_object=expected_object)
    for key in ('event_type', 'event_id', 'storage_instance_id', 'project_id', 'payload', 'scope_partition'):
        facts[key] = key not in bindings or (expected_object and exact_value(expected.get(key), bindings[key]))
    receipt = expected.get('receipt') if expected_object else None
    facts.update(settled=operation['state'] == 'settled', receipt_object=type(receipt) is dict,
                 receipt_ref_exact=type(receipt) is dict and exact_value(operation['original_append_result_ref'],
                                                                          receipt.get('original_append_result_ref')),
                 committed=operation['state'] == 'committed', append_ref_null=operation['original_append_result_ref'] is None)
    return tables.every('append_result', **facts)


def append_context(fixture, event_type):
    # These are separately supplied inputs. Never derive either from a candidate.
    return dict(append_family=event_type, append_resolution=copy.deepcopy(fixture['append_resolution']),
                append_original=copy.deepcopy(fixture['history']['expected']['event']))


def cursor_observation(after, frontier):
    """The cursor table's FIELDS; comparisons run only on exact integers."""
    after_is_int = type(after) is int
    frontier_is_int = type(frontier) is int
    return {
        'after_is_int': after_is_int,
        'frontier_is_int': frontier_is_int,
        'after_nonnegative': bool(after_is_int and after >= 0),
        'after_le_frontier': bool(after_is_int and frontier_is_int and after <= frontier),
        'frontier_le_u64max': bool(frontier_is_int and frontier <= 18446744073709551615),
    }


def cursor_errors(after, frontier):
    """Unsigned sequence cursors have one exact JSON type and the complete u64 domain.

    Refuses only through scripts/pm_dg6a_table_cursor.py rows, in order.
    """
    observed = cursor_observation(after, frontier)
    first = None
    for name, predicate in _CURSOR_ROWS:
        code = predicate(observed, None)
        if code is not None:
            first = (name, code)
            break
    if CURSOR_RECORDER is not None:
        CURSOR_RECORDER.append((copy.deepcopy(observed), first))
    return [first[1]] if first else []


def cursor_cases():
    """One-defect cursor controls, through the complete cursor_errors."""
    uint64_max = 18446744073709551615
    cases = (
        ('zero', 0, 0, []),
        ('within', 5, 10, []),
        ('equal', 7, 7, []),
        ('uint64_max', uint64_max, uint64_max, []),
        ('after_string', '0', 10, ['invalid unsigned cursor/frontier']),
        ('frontier_string', 0, '10', ['invalid unsigned cursor/frontier']),
        ('after_negative', -1, 10, ['invalid unsigned cursor/frontier']),
        ('after_beyond_frontier', 11, 10, ['invalid unsigned cursor/frontier']),
        ('frontier_over_uint64', 0, uint64_max + 1, ['invalid unsigned cursor/frontier']),
    )
    for name, after, frontier, expected in cases:
        actual = cursor_errors(after, frontier)
        assert actual == expected, (name, actual)
    return len(cases)

def operation_size_cases(original, schema, cases):
    for case in cases:
        value = copy.deepcopy(original)
        value.update(state='committed', owner_commit_ref='x', result_ref='original', dispatch_receipt_ref='original')
        target = case['encoded_bytes']
        for _ in range(4):
            ref = value['owner_commit_ref']
            delta = target - len(packed(value))
            value['owner_commit_ref'] = ref + 'x' * delta if delta >= 0 else ref[:delta]
        assert len(packed(value)) == target
        # Ensure an oversized negative reaches the physical guard with a valid shape.
        assert not list(Draft202012Validator(schema).iter_errors(value))
        assert (not operation_errors(value, schema)) == case['valid'], case['name']
    value = copy.deepcopy(original)
    value.update(state='committed', owner_commit_ref='x' * 17000, result_ref='original', dispatch_receipt_ref='original')
    assert not list(Draft202012Validator(schema).iter_errors(value))
    assert operation_errors(value, schema), 'oversized owner snapshots accepted'
    return len(cases) + 1

def checkpoint_errors(value, schema, original_context):
    """Join the synthetic checkpoint to independently supplied original-event context.

    Internal token agreement alone cannot authenticate its Storage instance. Native
    source authentication remains a separate NOT_RUN obligation. Refuses only
    through sch_checkpoint, checkpoint_size and checkpoint_token rows; a
    checkpoint without a token (schema-permitted) has no token joins.
    """
    found = list(Draft202012Validator(schema).iter_errors(value))
    if tables.first('sch_checkpoint', schema_errors=len(found)):
        return found
    size = encoded_size(value)
    code = tables.first('checkpoint_encoding_entailed', encoded_bytes=size) or tables.first('checkpoint_size', encoded_bytes=size)
    if code:
        return [code]
    if 'index_read_token' not in value:
        return []
    token = value['index_read_token']
    facts = dict(token_storage=value['storage_instance_id'] == token['storage_instance_id'],
                 selection_storage=token['storage_instance_id'] == token['source_selection']['storage_instance_id'])
    for field in ('storage_instance_id', 'project_id', 'server_id', 'scope_partition'):
        facts[field] = not (field in value and field in original_context) or not (value[field] != original_context[field])
    return tables.every('checkpoint_token', **facts)

def checkpoint_encoding_entailment(schema):
    """checkpoint_encoding_entailed (CZ00) is unreachable for this checkpoint schema.

    Every integer slot is bounded inside 0..2^64-1 (SP-1100 Storage sequences) or fixed by
    const/enum, and no slot admits a fractional number, so sch_checkpoint refuses every value
    the canonical MessagePack recipe cannot encode before the encoding row is reached.
    """
    def walk(node):
        if type(node) is dict:
            kind = node.get('type')
            kinds = kind if type(kind) is list else [kind]
            assert 'number' not in kinds, node
            if 'integer' in kinds and 'const' not in node and 'enum' not in node:
                assert node.get('minimum') is not None and node['minimum'] >= 0, node
                assert node.get('maximum') is not None and node['maximum'] <= 18446744073709551615, node
            for child in node.values():
                walk(child)
        elif type(node) is list:
            for child in node:
                walk(child)
    walk(schema)
    return 1


def checkpoint_context_cases(value, schema, original_context, checker=checkpoint_errors):
    count = 0
    foreign = '00000000-0000-4000-8000-000000000002'
    for coherent in (False, True):
        altered = copy.deepcopy(value)
        altered['index_read_token']['storage_instance_id'] = foreign
        if coherent:
            altered['storage_instance_id'] = foreign
            altered['index_read_token']['source_selection']['storage_instance_id'] = foreign
        assert checker(altered, schema, original_context), 'foreign checkpoint accepted'
        count += 1
    return count

def profile_observation(registry, fid, kind, group):
    """The profile table's FIELDS for one call, derived only.

    Profile reads use .get on a dict-or-empty view so a missing key is the
    False fact; the maximum keeps the pre-table default of 0 when absent.
    """
    profile = registry['storage_profile']['family_profiles'].get(fid)
    present = bool(profile)
    row = profile if type(profile) is dict else {}
    expected_file = 'derived' if kind == 'redb_checkpoint' else 'canonical'
    maximum = row.get('max_value_bytes', 0)
    return {
        'profile_present': present,
        'redb_file_matches': bool(present and row.get('redb_file') == expected_file),
        'storage_group_matches': bool(present and row.get('storage_group') == group),
        'maximum_is_int': type(maximum) is int,
        'maximum_in_range': bool(type(maximum) is int and 1 <= maximum <= 16384),
    }


def profile_errors(registry, fid, kind, group):
    """Refuses only through scripts/pm_dg6a_table_profile.py rows, in order."""
    observed = profile_observation(registry, fid, kind, group)
    first = None
    for name, predicate in _PROFILE_ROWS:
        code = predicate(observed, None)
        if code is not None:
            first = (name, code)
            break
    if PROFILE_RECORDER is not None:
        PROFILE_RECORDER.append(((fid, kind, group), copy.deepcopy(observed), first))
    return [first[1]] if first else []


def profile_cases(registry, fid, kind, group):
    """One-defect profile controls, through the complete profile_errors."""
    assert not profile_errors(registry, fid, kind, group), fid
    expected_file = 'derived' if kind == 'redb_checkpoint' else 'canonical'
    other_file = 'canonical' if expected_file == 'derived' else 'derived'
    cases = (
        ('missing', 'missing profile', lambda profiles: profiles.pop(fid)),
        ('wrong_file', 'wrong physical binding', lambda profiles: profiles[fid].update(redb_file=other_file)),
        ('wrong_group', 'wrong physical binding', lambda profiles: profiles[fid].update(storage_group='foreign_group')),
        ('maximum_string', 'non-integer maximum', lambda profiles: profiles[fid].update(max_value_bytes='16384')),
        ('maximum_float', 'non-integer maximum', lambda profiles: profiles[fid].update(max_value_bytes=16384.0)),
        ('maximum_missing', 'missing/oversized maximum', lambda profiles: profiles[fid].pop('max_value_bytes', None)),
        ('maximum_zero', 'missing/oversized maximum', lambda profiles: profiles[fid].update(max_value_bytes=0)),
        ('maximum_oversized', 'missing/oversized maximum', lambda profiles: profiles[fid].update(max_value_bytes=16385)),
    )
    for name, code, change in cases:
        value = copy.deepcopy(registry)
        change(value['storage_profile']['family_profiles'])
        actual = profile_errors(value, fid, kind, group)
        assert actual == [code], (fid, name, actual)
    return 1 + len(cases)

def writer_policy_observation(policy):
    """The writer_policy table's FIELDS for one policy value, derived only."""
    return {
        'policy_is_replay_only': bool(policy == 'projector_replay_only'),
        'policy_is_dedupe': bool(policy == 'dedupe_by_idempotency_key'),
    }


def writer_policy_errors(policy):
    """Refuses only through scripts/pm_dg6a_table_writer_policy.py rows."""
    observed = writer_policy_observation(policy)
    first = None
    for name, predicate in _WRITER_ROWS:
        code = predicate(observed, None)
        if code is not None:
            first = (name, code)
            break
    if WRITER_RECORDER is not None:
        WRITER_RECORDER.append((copy.deepcopy(observed), first))
    return [first[1]] if first else []


def writer_policy_cases():
    """One-defect writer-policy controls, through the complete guard.

    The fixtures exercise only dedupe and replay-only; the unsupported and
    wrong-type spellings below are the missing WP02 negatives.
    """
    cases = (
        ('dedupe', 'dedupe_by_idempotency_key', []),
        ('replay_only', 'projector_replay_only', ['replay_only_not_appendable']),
        ('unknown', 'append_once', ['unsupported current writer policy']),
        ('trailing_space', 'dedupe_by_idempotency_key ', ['unsupported current writer policy']),
        ('wrong_type_list', ['dedupe_by_idempotency_key'], ['unsupported current writer policy']),
        ('wrong_type_none', None, ['unsupported current writer policy']),
    )
    for name, policy, expected in cases:
        actual = writer_policy_errors(policy)
        assert actual == expected, (name, actual)
    return len(cases)

def producer_observation(record, integer_paths):
    """producer_route FIELDS and the digest; derived only (each fact after a failed one is False)."""
    facts, digest = dict(formats_valid=False, storage_instants_valid=False, sequence_ok=False, qualified=False), None
    try:
        domain.semantic_formats(record['payload'])
        domain.semantic_formats({'occurred_at_utc': record['occurred_at_utc']})
        facts['formats_valid'] = True
    except ValueError:
        return facts, digest
    # CV-253 / CV-1101: the record's Storage-assigned instants take the strict storage_utc_z profile. The producer
    # projection excludes them, so a record without them (a producer-only record) has none to check.
    facts['storage_instants_valid'] = all(domain.instant(record[field], domain.STORAGE_UTC_Z)
                                          for field in ('observed_at_utc', 'persisted_at_utc') if field in record)
    if not facts['storage_instants_valid']:
        return facts, digest
    sequence = record['producer_sequence_id']
    try:
        facts['sequence_ok'] = sequence is None or current_integer(sequence, minimum=0) == sequence
    except Refusal:
        return facts, digest
    paths = {('producer_sequence_id',)} | {('payload', key) for key in integer_paths}
    try:
        digest = producer_semantic_digest(record, type_sensitive_paths=frozenset(paths))
        facts['qualified'] = True
    except Refusal:
        pass
    return facts, digest


def producer_digest(record, integer_paths=()):
    """The CV-317 producer digest via the shared producer_semantic_digest (CV-1100).

    type_sensitive_paths are the owner integer paths: producer_sequence_id and the
    payload's integer fields. Refuses only through the producer_route rows.
    """
    facts, digest = producer_observation(record, integer_paths)
    code = tables.first('producer_route', **facts)
    if code:
        raise ValueError(code)
    return digest


def producer_cases(fixtures, event_type, payload):
    """Exercise the canonical partition codec and EventRecord semantic preimage.

    This is static coverage of existing owners, never an admitted EventRecord writer.
    """
    count = 0
    partition = _codec.scope_partition('project', payload['project_id'])
    for case in fixtures['partition_cases']:
        assert (case['value'] == partition) == case['valid'], case['name']
        count += 1
    record = dict(event_type=event_type, scope_kind='project', project_id=payload['project_id'],
                  thread_id=None, run_id=None, node_id=None, attempt_id=None,
                  actor_ref=payload['actor_ref'], requested_account_ref=None, effective_account_ref=None,
                  occurred_at_utc=payload.get('ts', payload.get('settled_at_utc')), producer_sequence_id=None,
                  correlation_id=payload['correlation_id'], causation_event_id=None, parent_event_id=None,
                  idempotency_key=payload['idempotency_key'], payload_schema_id=payload['schema_id'],
                  payload=payload, payload_ref=None, redaction_profile='secret_refs_only', migration=None,
                  sequence_id=1, observed_at_utc='2026-11-04T18:00:00Z', persisted_at_utc='2026-11-04T18:00:00Z')
    # The payload's integer fields (schema-accepted fixture payload) are the owner integer paths.
    integer_paths = tuple(key for key, value in payload.items() if type(value) is int)
    original = producer_digest(record, integer_paths)
    # The shared helper's digest is byte-identical to the pre-adoption JCS codec on valid records.
    assert original == _codec.event_producer_semantic_digest(record)
    for case in fixtures['semantic_digest_cases']:
        retry = copy.deepcopy(record)
        retry.update(case['envelope_changes'])
        retry['payload'].update(case['payload_changes'])
        assert (original == producer_digest(retry, integer_paths)) == case['same_digest'], case['name']
        count += 1
    # Exercise the actual producer digest codec, not an independent JSON codec.
    numeric_key = next(key for key, value in payload.items() if type(value) is int)
    for spelling in ('1', '1.0', '1e0', '-0', '-0.0', '01'):
        try:
            number = json.loads(spelling)
        except json.JSONDecodeError:
            assert spelling == '01'
        else:
            candidate = copy.deepcopy(record)
            candidate['payload'][numeric_key] = number
            if type(number) is float:
                try:
                    producer_digest(candidate, integer_paths)
                except ValueError:
                    pass
                else:
                    raise AssertionError(('noncanonical numeric digest accepted', spelling))
            else:
                canonical = copy.deepcopy(record)
                canonical['payload'][numeric_key] = int(number)
                assert producer_digest(candidate, integer_paths) == producer_digest(canonical, integer_paths)
        count += 1
    # One-defect producer_route witnesses (sweep part 2A/2B numbers): each refuses at exactly its row.
    timestamp_key = next(key for key in ('ts', 'settled_at_utc') if key in payload)
    for name, change, code in (
            ('payload_timestamp', lambda r: r['payload'].update({timestamp_key: '2026-11-04T25:00:00Z'}), 'invalid semantic timestamp'),
            ('negative_sequence', lambda r: r.update(producer_sequence_id=-1), 'producer_sequence_id is not a current integer'),
            ('payload_beyond_binary64', lambda r: r['payload'].update({numeric_key: 2 ** 53 + 1}),
             'producer projection has no qualified JCS')):
        candidate = copy.deepcopy(record)
        change(candidate)
        try:
            producer_digest(candidate, integer_paths)
        except ValueError as error:
            assert str(error) == code, (name, str(error))
        else:
            raise AssertionError(('producer route accepted', name))
        count += 1
    # Sweep part 2B (CV-1101, CV-253): occurred_at_utc takes the EventRecord profile (PD01); the record's
    # Storage-assigned observed_at_utc/persisted_at_utc take storage_utc_z (PD04). One field changes per case.
    for field, values, code in (('occurred_at_utc', [v for v, _ in p2b_witnesses.DATETIME_REFUSALS], 'invalid semantic timestamp'),
                                ('observed_at_utc', p2b_witnesses.STORAGE_REFUSALS, 'invalid Storage timestamp'),
                                ('persisted_at_utc', p2b_witnesses.STORAGE_REFUSALS, 'invalid Storage timestamp')):
        for value in values:
            candidate = dict(copy.deepcopy(record), **{field: value})
            try:
                producer_digest(candidate, integer_paths)
            except ValueError as error:
                assert str(error) == code, (field, value, str(error))
            else:
                raise AssertionError(('producer route accepted', field, value))
            count += 1
    for field, values in (('occurred_at_utc', p2b_witnesses.DATETIME_ACCEPTS),
                          ('observed_at_utc', p2b_witnesses.STORAGE_ACCEPTS),
                          ('persisted_at_utc', p2b_witnesses.STORAGE_ACCEPTS)):
        for value in values:
            producer_digest(dict(copy.deepcopy(record), **{field: value}), integer_paths)
            count += 1
    return count

def history_page(events, event_type, project_id, after, frontier, publication_id, index_read_token):
    """Static reference oracle for bounded read-through; not native source authentication."""
    def response(refs, cursor):
        return dict(publication_id=publication_id, index_read_token=index_read_token,
                    after_sequence_id=cursor, event_refs=refs, complete=cursor == frontier)
    if cursor_errors(after, frontier):
        raise ValueError('invalid cursor/frontier')
    code = tables.first('history_page_bytes', empty_page_bytes=len(packed(response([], after))))
    if code:
        raise ValueError(code)
    result, scanned, cursor = [], 0, after
    for event in events:
        seq = event['sequence_id']
        if not after < seq <= frontier:
            continue
        match = event['event_type'] == event_type and event['project_id'] == project_id
        candidate = result + [event['event_ref']] if match else result
        if scanned == 256 or len(candidate) > 64:
            break
        fits = len(packed(response(candidate, seq))) <= 16384
        code = tables.first('history_page_ref', candidate_fits=fits, result_empty=not result)
        if code:
            raise ValueError(code)
        if not fits:
            break
        result, scanned, cursor = candidate, scanned + 1, seq
    return response(result, cursor)

class HistoryUnavailable(ValueError):
    def __init__(self, guards):
        self.guards = guards
        super().__init__('historical read unavailable: ' + ', '.join(guards))


def history_shape_refusal(request, expected):
    """Only inspect a member after its containing object and presence are proved.

    Leaf values belong to the distinct custody/publication guards. This checks
    the navigation shape, so malformed input has a modeled refusal. Returns the
    history_shape row's code, or None; a fact is read only when every earlier
    fact holds (otherwise False, which the chained rows ignore).
    """
    names = tables.fields('history_shape')
    facts = dict.fromkeys(names, False)
    facts['request_object'] = type(request) is dict
    facts['request_members'] = facts['request_object'] and {'checkpoint', 'event', 'disclosure', 'after_sequence_id'} <= request.keys()
    if facts['request_members']:
        for key in ('checkpoint', 'event', 'disclosure'):
            facts[key + '_object'] = type(request[key]) is dict
    if facts['checkpoint_object'] and facts['event_object'] and facts['disclosure_object']:
        cp, event, disclosure = request['checkpoint'], request['event'], request['disclosure']
        facts['checkpoint_members'] = {'state', 'through_sequence_id', 'publication_id', 'index_read_token'} <= cp.keys()
        facts['event_members'] = set(expected['event']) <= event.keys()
        facts['payload_object'] = facts['event_members'] and type(event['payload']) is dict
        facts['disclosure_members'] = {'permission_allowed', 'membership_allowed', 'source_access_allowed', 'deleted',
                                       'withdrawn'} <= disclosure.keys()
    return tables.first('history_shape', **facts)


def history_shape(request, expected):
    """Boolean view of history_shape_refusal for the older drivers (no decision here)."""
    return history_shape_refusal(request, expected) is None


def stored_instants_valid(value):
    try:
        domain.semantic_formats(value)
    except ValueError:
        return False
    return True


HISTORY_PHASES = ('history_checkpoint', 'history_event', 'history_original', 'history_disclosure')


def historical_observation(request, expected, payload_schemas, cp_schema, cp_checker, original_custody=None):
    """Facts of every HISTORY_PHASES table for a shape- and custody-accepted retained read.

    Synthetic retained-original evidence, independent of current writer predicates.
    Expected event/receipt/source/publication are separately supplied fixture evidence,
    never reconstructed from the candidate being checked. This is not native auth.
    SP-1101 (sweep part 2B): the payload edition and its exact frozen validator are
    the custody-selected recipe's (history_custody passed). Only when a custody row
    is cut (guard-tool runs) is there no custody; the facts are then computed with
    the pre-SP-1101 selection by the original's declared edition, so every later
    row still reads a defined fact. Exact original equality still checks both.
    """
    cp, event, disclosure = request['checkpoint'], request['event'], request['disclosure']
    original = expected['event']
    publication = {k: v for k, v in cp.items() if k != 'state'}
    expected_publication = {k: v for k, v in expected['checkpoint'].items() if k != 'state'}
    identity_fields = set(original) - {'payload', 'receipt', 'source_selection', 'state', 'valid_when_written'}
    payload = event['payload']
    if original_custody is not None:
        payload_validator = custody.frozen_validator(original_custody)
    else:
        schema_key = (original['payload'].get('schema_id'), original['payload'].get('schema_version'))
        schema = payload_schemas.get(schema_key) if all(type(v) is str for v in schema_key) else None
        payload_validator = Draft202012Validator(schema, format_checker=FormatChecker()) if schema is not None else None
    checkpoint_valid = not cp_checker(cp, cp_schema, original)
    members_equal = set(event) == set(original)
    instants = {k: event[k] for k in ('observed_at_utc', 'persisted_at_utc') if k in event}
    event_facts = dict(instants_valid=stored_instants_valid(instants), members_equal=members_equal)
    # Every original identity member has its own row (a member without one would be a silent pass).
    assert identity_fields <= set(tables.fields('history_event')[2:]), sorted(identity_fields)
    for field in tables.fields('history_event')[2:]:
        event_facts[field] = field not in identity_fields or (members_equal and exact_value(event[field], original[field]))
    payload_schema_valid = payload_validator is not None and not list(payload_validator.iter_errors(payload))
    return {
        'history_checkpoint': dict(checkpoint_current=cp['state'] == 'current', checkpoint_valid=checkpoint_valid,
                                   publication_exact=exact_value(publication, expected_publication),
                                   event_current=event['state'] == 'current'),
        'history_event': event_facts,
        'history_original': dict(payload_schema_valid=payload_schema_valid,
                                 payload_exact=exact_value(payload, original['payload']),
                                 receipt_instants_valid=stored_instants_valid(event['receipt']),
                                 receipt_exact=exact_value(event['receipt'], original['receipt']),
                                 source_exact=exact_value(event['source_selection'], original['source_selection']),
                                 original_admitted=original['valid_when_written'] is True,
                                 event_admitted=event['valid_when_written'] is True),
        'history_disclosure': dict(permission_allowed=disclosure['permission_allowed'] is True,
                                   membership_allowed=disclosure['membership_allowed'] is True,
                                   source_access_allowed=disclosure['source_access_allowed'] is True,
                                   not_deleted=disclosure['deleted'] is False,
                                   not_withdrawn=disclosure['withdrawn'] is False),
    }


def historical_refusals(request, expected, payload_schemas, cp_schema, cp_checker):
    """Failed retained-read guard names, only through history_shape, history_custody and HISTORY_PHASES rows.

    Every name is a row code; each guard of the pre-table dict appears at most
    once (rows of one guard are chained), in the pre-table guard order.
    """
    shape = history_shape_refusal(request, expected)
    if shape:
        return [shape]
    # SP-1101: every retained read first obtains its original from the authenticated owner.
    custody_facts, original_custody = custody.resolve(expected['event'])
    code = tables.first('history_custody', **custody_facts)
    if code:
        return [code]
    facts = historical_observation(request, expected, payload_schemas, cp_schema, cp_checker, original_custody)
    failed = []
    for phase in HISTORY_PHASES:
        failed += tables.every(phase, **facts[phase])
    return failed


def historical_page(request, expected, payload_schemas, cp_schema, cp_checker, event_type):
    """Admit the actual checkpoint and original before feeding refs to byte paging."""
    def validate():
        failed = historical_refusals(request, expected, payload_schemas, cp_schema, cp_checker)
        if failed:
            raise HistoryUnavailable(failed)
    validate()
    cp, event = request['checkpoint'], request['event']
    # The gate has already authenticated exact family/scope membership. Pass its
    # accepted ref into paging; the byte helper is not a second authority filter.
    accepted = dict(sequence_id=event['sequence_id'], event_type=event_type,
                    project_id=expected['event']['project_id'], event_ref=event['event_ref'])
    response = history_page([accepted], event_type, expected['event']['project_id'], request['after_sequence_id'],
                            cp['through_sequence_id'], cp['publication_id'], cp['index_read_token'])
    # Returning a helper must not bypass current permission/deletion/publication fences.
    validate()
    return response


def history_request(fixture, checkpoint):
    history = fixture['history']
    return dict(checkpoint=copy.deepcopy(checkpoint), event=copy.deepcopy(history['event']),
                disclosure=copy.deepcopy(history['disclosure']), live=copy.deepcopy(history['live']),
                after_sequence_id=0)


def history_patch(request, case):
    parent = request
    for key in case['path'][:-1]:
        parent = parent[key]
    parent[case['path'][-1]] = copy.deepcopy(case['value'])


def exact_value(left, right):
    """Immutable evidence equality includes JSON value types, not Python coercions."""
    if type(left) is not type(right):
        return False
    if isinstance(left, dict) and isinstance(right, dict):
        return left.keys() == right.keys() and all(exact_value(left[k], right[k]) for k in left.keys() & right.keys())
    if isinstance(left, list) and isinstance(right, list):
        return len(left) == len(right) and all(exact_value(a, b) for a, b in zip(left, right))
    return left == right


def changed_leaves(left, right):
    if isinstance(left, dict) and isinstance(right, dict) and left.keys() == right.keys():
        return sum(changed_leaves(left[k], right[k]) for k in left)
    if isinstance(left, list) and isinstance(right, list) and len(left) == len(right):
        return sum(changed_leaves(a, b) for a, b in zip(left, right))
    # This evidence counter must not depend on the authentication predicate
    # being weakened in a source-comparison mutation trial.
    return int(type(left) is not type(right) or left != right)


def historical_reader_cases(fixture, checkpoint, reader, observations=None):
    """Check 10 composition and check 11 one-defect/guard-weakening witnesses."""
    base = history_request(fixture, checkpoint)
    expected = fixture['history']['expected']
    original = expected['event']
    assert original['state'] == expected['checkpoint']['state'] == 'current'
    assert original['receipt']['event_id'] == original['event_id']
    assert original['receipt']['sequence_id'] == original['sequence_id']
    assert original['receipt']['storage_instance_id'] == original['storage_instance_id']
    assert original['source_selection'] == expected['checkpoint']['index_read_token']['source_selection']
    assert 0 < original['sequence_id'] <= expected['checkpoint']['through_sequence_id']
    before = copy.deepcopy(base)
    for cursor in (-1, 2, 18446744073709551615, 18446744073709551616, True, False, '0', 'false', 'true', None,
                   [], {}, {'nested': 0}, 0.0, 1.0):
        malformed = copy.deepcopy(base)
        malformed['after_sequence_id'] = cursor
        try:
            reader(malformed, expected)
        except ValueError:
            pass
        else:
            raise AssertionError(('invalid cursor accepted', cursor))
    for cursor in (0, checkpoint['through_sequence_id']):
        boundary = copy.deepcopy(base)
        boundary['after_sequence_id'] = cursor
        page = reader(boundary, expected)
        assert type(page['after_sequence_id']) is int and page['complete']
    maximum_request, maximum_original = copy.deepcopy(base), copy.deepcopy(expected)
    # The independently declared compact publication leaves room for the wider
    # frontier. An exact-cap publication cannot grow even by one encoded byte.
    for publication in (maximum_request['checkpoint'], maximum_original['checkpoint']):
        publication['index_read_token']['checkpoint_ref'] = fixture['history']['case_checkpoint_ref']
    maximum_request['checkpoint']['through_sequence_id'] = 18446744073709551615
    maximum_original['checkpoint']['through_sequence_id'] = 18446744073709551615
    maximum_request['after_sequence_id'] = 18446744073709551615
    maximum_page = reader(maximum_request, maximum_original)
    assert maximum_page['event_refs'] == [] and maximum_page['complete']
    response = reader(base, expected)
    assert response['event_refs'] == [original['event_ref']] and response['complete']
    assert base == before, 'historical read mutated its inputs'
    # Keep the ACTUAL checkpoint baseline above, including exact-16-KiB positives.
    # Isolated negatives use a separately declared compact publication witness:
    # changing "current" to "withdrawn" must not ALSO exceed the physical cap.
    # This alternate synthetic ref is supplied by the fixture, not by the candidate.
    base = copy.deepcopy(base)
    expected = copy.deepcopy(expected)
    case_ref = fixture['history']['case_checkpoint_ref']
    base['checkpoint']['index_read_token']['checkpoint_ref'] = case_ref
    expected['checkpoint']['index_read_token']['checkpoint_ref'] = case_ref
    assert reader(base, expected)['event_refs'] == [original['event_ref']]
    count = 20  # Two originals, fifteen refusals, two cursor endpoints and u64 max.
    for case in fixture['history']['cases']:
        request = copy.deepcopy(base)
        history_patch(request, case)
        assert changed_leaves(base, request) == 1, ('non-isolated history case', case['name'])
        if case['valid']:
            assert reader(request, expected)['event_refs'] == [original['event_ref']], case['name']
        else:
            try:
                reader(request, expected)
            except HistoryUnavailable as error:
                assert error.guards == [case['guard']], (case['name'], error.guards)
            else:
                raise AssertionError(('historical negative accepted', case['name']))
            # Guard removal is the guard tool's row cut (scripts/pm-dg6a-guard-tables.py),
            # not an in-checker rewrite of historical_guards.
        if observations is not None:
            observations.append(dict(name=case['name'], valid=case['valid'], changed_leaves=1,
                                     guard=case.get('guard'), isolated_rejection=not case['valid'], passed=True))
        assert checkpoint == before['checkpoint'], 'reader changed persisted checkpoint'
        count += 1
    # Model access/deletion/withdrawal changing while the read helper returns.
    for section, field, denied, guard in [('disclosure', 'permission_allowed', False, 'current_permission'),
                                          ('disclosure', 'deleted', True, 'source_retained'),
                                          ('disclosure', 'withdrawn', True, 'current_withdrawal'),
                                          ('checkpoint', 'state', 'withdrawn', 'checkpoint_publication'),
                                          ('event', 'state', 'staged', 'event_publication')]:
        request = copy.deepcopy(base)
        byte_pager = history_page
        def returning_helper(*args):
            page = byte_pager(*args)
            request[section][field] = denied
            return page
        try:
            globals()['history_page'] = returning_helper
            try:
                reader(request, expected)
            except HistoryUnavailable as error:
                assert error.guards == [guard], (field, error.guards)
            else:
                raise AssertionError(('disclosed after returning helper revoked access', field))
            assert changed_leaves(base, request) == 1
        finally:
            globals()['history_page'] = byte_pager
        if observations is not None:
            observations.append(dict(name='after_helper_' + section + '_' + field, valid=False, changed_leaves=1, guard=guard,
                                     isolated_rejection=True, passed=True))
        count += 1
    return count


def historical_alert_page(request, expected, family, payload_schema, cp_schema):
    # Each manifest row selects only its own historical payload schema and family.
    schemas = {(payload_schema['properties']['schema_id']['const'], '1.0.0'): payload_schema}
    return historical_page(request, expected, schemas, cp_schema, checkpoint_errors, family['event_type'])


def retained_revision_cases(kind, owner, family, fixture, reader, observations=None):
    """Old-valid originals and retries; each refusal changes exactly one leaf.

    Digests and payload byte hashes are pinned from the independent cycle-8
    earlier-codec witnesses, rather than recomputed as expected values here.
    """
    count = 0
    for case in fixture['retained_revision_cases']:
        operation = copy.deepcopy(fixture['append_operations']['settled'])
        prior = case['prior_revision']
        if kind == 'alert':
            operation['payload']['prior_revision'] = operation['original_command']['prior_revision'] = prior
            operation['prior_owner_state']['revision'] = prior
            operation['payload']['result_revision'] = operation['candidate_owner_state']['revision'] = prior + 1
        else:
            operation['payload']['prior_host_revision'] = operation['original_command']['prior_host_revision'] = prior
            operation['prior_host_snapshot']['host_revision'] = prior
            operation['payload']['new_host_revision'] = operation['candidate_host_snapshot']['host_revision'] = prior + 1
        operation['request_digest'] = case['request_digest']
        assert hashlib.sha256(packed(operation['payload'])).hexdigest() == case['payload_bytes_sha256']
        assert hashlib.sha256(packed(dict(original_command=operation['original_command'],
                                         candidate_payload=operation['payload']))).hexdigest() == case['request_digest']
        history = copy.deepcopy(fixture['history'])
        history['event']['payload'] = copy.deepcopy(operation['payload'])
        history['expected']['event']['payload'] = copy.deepcopy(operation['payload'])
        expected = history['expected']
        # The retained original was written under the earlier codec: it is Storage history (SP-1101 custody).
        writer_history = custody.written([expected['event']])
        writer_history.__enter__()
        request = history_request(dict(history=history), expected['checkpoint'])
        proof = copy.deepcopy(next(c['value'] for c in fixture['isolated_cases'] if c['name'] == 'valid_protocol'))
        proof.update(retry_command=copy.deepcopy(operation['original_command']), retry_payload=copy.deepcopy(operation['payload']),
                     append_original=copy.deepcopy(expected['event']), append_resolution=copy.deepcopy(expected['event']))
        before = copy.deepcopy((operation, expected, request, proof))
        assert reader(request, expected)['event_refs'] == [expected['event']['event_ref']]
        assert not owner.protocol_errors(proof, operation), case['name']
        results = [dict(name='retained_original', valid=True), dict(name='exact_retry', valid=True)]
        for name, path, bad, guard in (
                ('mismatched_edition', ['event', 'payload', 'schema_version'], '9.0.0', 'historical_payload'),
                ('mismatched_source', ['event', 'source_selection', 'current_bytes_sha256'], 'b' * 64, 'original_source')):
            altered = copy.deepcopy(request)
            history_patch(altered, dict(path=path, value=bad))
            assert changed_leaves(request, altered) == 1
            try:
                reader(altered, expected)
            except HistoryUnavailable as error:
                assert error.guards == [guard], (name, error.guards)
            else:
                raise AssertionError(('retained forgery accepted', name))
            results.append(dict(name='history_' + name, valid=False, changed_leaves=1, guard=guard))
        retry_guard = 'idempotency_conflict' if kind == 'alert' else 'retry changed'
        for name, path, bad, guards in (
                ('mismatched_edition', ['retry_payload', 'schema_version'], '9.0.0', [retry_guard]),
                ('mismatched_source', ['append_resolution', 'source_selection', 'current_bytes_sha256'], 'b' * 64,
                 ['resolved original append evidence mismatch']),
                ('forged_original_digest', ['request_digest'], 'b' * 64, [retry_guard])):
            altered, original = copy.deepcopy(proof), copy.deepcopy(operation)
            target = original if path == ['request_digest'] else altered
            history_patch(target, dict(path=path, value=bad))
            assert changed_leaves((operation if target is original else proof), target) == 1
            assert owner.protocol_errors(altered, original) == guards, name
            results.append(dict(name='retry_' + name, valid=False, changed_leaves=1, guards=guards))
        # Missing admission is a different invariant from resolver equality:
        # keep the resolver's observational copy coherent with the original.
        altered = copy.deepcopy(proof)
        for key in ('append_original', 'append_resolution'):
            altered[key]['valid_when_written'] = False
        assert changed_leaves(proof, altered) == 2
        assert not append_result_errors(operation, altered['append_resolution'], altered['append_original'], family['event_type'])
        assert owner.protocol_errors(altered, operation) == [retry_guard]
        results.append(dict(name='retry_missing_admission', valid=False, semantic_defects=1,
                            reconciled_copies=2, guards=[retry_guard]))
        # One unsupported original edition, with EVERY observational copy and
        # its old-codec digest reconciled. No stale body/digest masks selection.
        altered, original = copy.deepcopy(proof), copy.deepcopy(operation)
        for body in (original['payload'], altered['retry_payload'], altered['append_original']['payload'],
                     altered['append_resolution']['payload']):
            body['schema_version'] = '9.0.0'
        original['request_digest'] = hashlib.sha256(packed(dict(original_command=original['original_command'],
                                                               candidate_payload=original['payload']))).hexdigest()
        assert not append_result_errors(original, altered['append_resolution'], altered['append_original'], family['event_type'])
        # Storage holds it, sealed with its own write-time tuple, which names an edition no frozen verifier
        # is installed for: SP-1101 refuses the recipe (RQ04), never a fallback edition.
        with custody.written([altered['append_original']]):
            assert owner.protocol_errors(altered, original) == [retry_guard]
        results.append(dict(name='unsupported_original_edition', valid=False, semantic_defects=1,
                            reconciled_copies=4, digest_recomputed=True, guards=[retry_guard]))
        writer_history.__exit__(None, None, None)
        assert (operation, expected, request, proof) == before, 'retained case mutated original evidence'
        if observations is not None:
            observations.append(dict(family=family['event_type'], prior_revision=prior,
                                     result_revision=prior + 1, results=results, status='pass'))
        count += len(results)
    return count

def p2b_alert(family, fixtures, schema, cp_schema, checkpoint):
    """Sweep part 2B witnesses for one alert family (CV-1101 date-time, SP-1101 history and retry custody)."""
    case = fixtures['payload_cases'][0]
    count = p2b_witnesses.datetime_payload(lambda p: errors(p, schema, case['guard']),
                                           lambda p: list(Draft202012Validator(schema).iter_errors(p)), case['payload'],
                                           lambda p: not snooze_expired(p))
    base, expected = history_request(fixtures, checkpoint), copy.deepcopy(fixtures['history']['expected'])
    for publication in (base['checkpoint'], expected['checkpoint']):
        publication['index_read_token']['checkpoint_ref'] = fixtures['history']['case_checkpoint_ref']
    reader = lambda request, original: historical_alert_page(request, original, family, schema, cp_schema)
    count += p2b_witnesses.history_all(base, expected, reader, HistoryUnavailable, family['event_type'])
    protocol = next(c for c in fixtures['isolated_cases'] if c['name'] == 'valid_protocol')
    retained = copy.deepcopy(fixtures['append_operations']['settled'])
    event = copy.deepcopy(fixtures['history']['expected']['event'])
    proof = dict(copy.deepcopy(protocol['value']), retry_command=copy.deepcopy(retained['original_command']),
                 retry_payload=copy.deepcopy(retained['payload']), append_original=copy.deepcopy(event),
                 append_resolution=copy.deepcopy(event), receipt_event_id=retained['event_id'])
    count += p2b_witnesses.retry_all(protocol_errors, proof, retained, 'idempotency_conflict', family['event_type'])
    return count


def trailing_lf_cases(value, schema):
    """Each currently present patterned leaf gets an independent trailing-LF regression."""
    schema = domain.checkpoint_source_constraints(schema)
    count = 0
    def resolve(contract):
        while '$ref' in contract:
            ref = contract['$ref']
            assert ref.startswith('#/')
            contract = schema
            for part in ref[2:].split('/'):
                contract = contract[part.replace('~1', '/').replace('~0', '~')]
        return contract
    def visit(node, contract, path):
        nonlocal count
        contract = resolve(contract)
        if isinstance(node, dict):
            for key, child in node.items():
                visit(child, contract.get('properties', {}).get(key, {}), path + [key])
        elif isinstance(node, list):
            for i, child in enumerate(node):
                visit(child, contract.get('items', {}), path + [i])
        elif isinstance(node, str) and 'pattern' in contract:
            altered = copy.deepcopy(value)
            parent = altered
            for key in path[:-1]:
                parent = parent[key]
            # A full checker must refuse LF on every identifier, including embedded tokens.
            parent[path[-1]] = node + '\n'
            assert list(Draft202012Validator(schema).iter_errors(altered)), ('trailing LF accepted', path)
            count += 1
    visit(value, schema, [])
    return count

def pattern_leaf_cases(schema):
    """Exercise every effective owner pattern, including the preserved source-selector profile."""
    schema = domain.checkpoint_source_constraints(schema)
    count = 0
    def visit(node):
        nonlocal count
        if isinstance(node, dict):
            if 'pattern' in node:
                validator = Draft202012Validator(node)
                samples = ('fixture', 'pmref:test:fixture', 'a' * 64, 'eig_' + 'a' * 64)
                sample = next((s for s in samples if re.fullmatch(node['pattern'], s) and not list(validator.iter_errors(s))), None)
                assert sample is not None, ('missing pattern positive', node)
                assert list(validator.iter_errors(sample + '\n')), ('trailing LF accepted', node)
                count += 2
            for child in node.values():
                visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)
    visit(schema)
    return count

def history_response_cases(checkpoint, schema, event_type, project_id, original_context):
    """Complete-byte boundaries with real closed checkpoint metadata; no fixed allowance."""
    large = copy.deepcopy(checkpoint)
    ref = large['index_read_token']['checkpoint_ref']
    for _ in range(3):
        ref += 'x' * max(0, 16384 - len(packed(large)))
        large['index_read_token']['checkpoint_ref'] = ref
        delta = 16384 - len(packed(large))
        if delta < 0:
            ref = ref[:delta]
            large['index_read_token']['checkpoint_ref'] = ref
    assert len(packed(large)) == 16384 and not checkpoint_errors(large, schema, original_context)
    events = [dict(sequence_id=i + 1, event_type=event_type, project_id=project_id,
                   event_ref='event_' + str(i) + '_' + 'a' * 64) for i in range(64)]
    cursor, seen = 0, []
    while cursor < 64:
        page = history_page(events, event_type, project_id, cursor, 64,
                            large['publication_id'], large['index_read_token'])
        assert len(packed(page)) <= 16384 and page['after_sequence_id'] > cursor
        if cursor == 0:
            assert len(page['event_refs']) < 64
        cursor = page['after_sequence_id']
        seen += page['event_refs']
    assert seen == [event['event_ref'] for event in events]
    single = events[:1]
    for _ in range(3):
        page = history_page(single, event_type, project_id, 0, 1,
                            checkpoint['publication_id'], checkpoint['index_read_token'])
        single[0]['event_ref'] += 'x' * max(0, 16384 - len(packed(page)))
        size = len(packed(dict(page, event_refs=[single[0]['event_ref']])))
        if size > 16384:
            single[0]['event_ref'] = single[0]['event_ref'][:16384 - size]
    page = history_page(single, event_type, project_id, 0, 1,
                        checkpoint['publication_id'], checkpoint['index_read_token'])
    assert len(packed(page)) == 16384 and page['complete']
    single[0]['event_ref'] += 'x'
    for publication, token, source in [
            (checkpoint['publication_id'], checkpoint['index_read_token'], single),
            ('x' * 16384, checkpoint['index_read_token'], []),
            (checkpoint['publication_id'], dict(checkpoint['index_read_token'], checkpoint_ref='x' * 16384), [])]:
        try:
            history_page(source, event_type, project_id, 0, len(source), publication, token)
        except ValueError:
            pass
        else:
            raise AssertionError('unpageable metadata/ref accepted')
    return 5

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--family', choices=[f['event_type'] for f in load('Plans/alert_event_contracts/manifest.json')['families']])
    selected = parser.parse_args().family
    count = 0
    for path in (ROOT / 'Plans/alert_event_contracts').glob('*.schema.json'):
        check_schema(json.loads(path.read_text()))
    registry = load('Plans/event_family_registry.json')
    # Exact serialized event name cannot appear as an admitted event_type.
    admitted = {x.get('event_type') for x in registry['families']}
    values = load('Plans/storage_value_registry.json')
    for family in load('Plans/alert_event_contracts/manifest.json')['families']:
        if selected and selected != family['event_type']:
            continue
        schema = load(family['payload_schema'])
        check_schema(schema)
        fixtures = load(f"Plans/alert_event_contracts/{family['slug']}.fixtures.json")
        count += isolated_cases('alert', sys.modules[__name__], family, fixtures)
        original_context = fixtures['operation_cases'][0]['value']
        count += producer_cases(fixtures, family['event_type'], original_context['payload'])
        for case in fixtures['writer_policy_cases']:
            assert (not writer_policy_errors(case['policy'])) == case['valid']
            guard = dict(fixtures['payload_cases'][0]['guard'], replay_policy=case['policy'])
            assert (not errors(fixtures['payload_cases'][0]['payload'], schema, guard)) == case['valid']
            count += 1
        count += trailing_lf_cases(fixtures['payload_cases'][0]['payload'], schema)
        count += pattern_leaf_cases(schema)
        for case in fixtures['payload_cases']:
            actual = not errors(case['payload'], schema, case['guard'])
            assert actual == case['valid'], (family['event_type'], case['name'], actual)
            count += 1
        for key in ('operation', 'checkpoint'):
            path = f"Plans/alert_event_contracts/{family[key]}.schema.json"
            value_schema = load(path)
            check_schema(value_schema)
            count += pattern_leaf_cases(value_schema)
            count += trailing_lf_cases(fixtures[key + '_cases'][0]['value'], value_schema)
            for case in fixtures[key + '_cases']:
                valid = not (checkpoint_errors(case['value'], value_schema, original_context) if key == 'checkpoint'
                             else operation_errors(case['value'], value_schema))
                assert valid == case['valid'], (family['event_type'], key, case['name'])
                if key == 'operation' and case['valid']:
                    assert not append_result_errors(case['value'], fixtures['append_resolution'],
                                                    fixtures['history']['expected']['event'], family['event_type'])
                count += 1
            if key == 'operation':
                count += operation_size_cases(original_context, value_schema, fixtures['operation_size_cases'])
            if key == 'checkpoint':
                baseline = copy.deepcopy(fixtures['checkpoint_cases'][0]['value'])
                count += retained_revision_cases('alert', sys.modules[__name__], family, fixtures,
                    lambda request, expected: historical_alert_page(request, expected, family, schema, value_schema))
                count += historical_reader_cases(fixtures, baseline, lambda request, expected:
                    historical_alert_page(request, expected, family, schema, value_schema))
                for case in fixtures['history']['cases']:
                    if case['valid'] and case['path'][0] == 'live':
                        request = history_request(fixtures, baseline)
                        history_patch(request, case)
                        original_payload = request['event']['payload']
                        guard = dict(fixtures['payload_cases'][0]['guard'], current=request['live']['current'] and
                                     request['live']['owner_revision'] == original_payload['prior_revision'])
                        assert errors(original_payload, schema, guard), ('live writer should refuse', case['name'])
                        count += 1
                count += checkpoint_context_cases(baseline, value_schema, original_context)
                count += checkpoint_encoding_entailment(value_schema)
                regression = copy.deepcopy(baseline)
                regression['event_refs'] = ['event_0']
                assert len(packed(regression)) < 16384 and checkpoint_errors(regression, value_schema, original_context)
                count += 1
                for case in fixtures['checkpoint_size_cases']:
                    value = copy.deepcopy(baseline)
                    # Vary a legitimate ref, keeping the complete closed token and all joins.
                    target = case['encoded_bytes']
                    value['index_read_token']['checkpoint_ref'] = 'x'
                    value['index_read_token']['checkpoint_ref'] = 'x' * (target - len(packed(value)) + 1)
                    # MessagePack string header changes at 32/256 bytes.
                    delta = target - len(packed(value))
                    value['index_read_token']['checkpoint_ref'] += 'x' * max(delta, 0)
                    if delta < 0:
                        value['index_read_token']['checkpoint_ref'] = value['index_read_token']['checkpoint_ref'][:delta]
                    assert len(packed(value)) == target
                    assert (not checkpoint_errors(value, value_schema, original_context)) == case['valid'], case['name']
                    count += 1
                for case in fixtures['read_through_cases']:
                    events = [{'sequence_id': i + 1, 'event_type': family['event_type'] if i < case['matches'] else 'other',
                               'project_id': 'fixture', 'event_ref': 'event_' + str(i) + '_' + 'a' * 64}
                              for i in range(case['matches'] + case.get('nonmatches', 0))]
                    cursor, refs, complete = 0, [], False
                    while not complete:
                        response = history_page(events, family['event_type'], 'fixture', cursor, len(events),
                                                baseline['publication_id'], baseline['index_read_token'])
                        page, next_cursor, complete = response['event_refs'], response['after_sequence_id'], response['complete']
                        assert next_cursor > cursor
                        assert len(page) <= 64 and len(packed(response)) <= 16384
                        refs += page
                        cursor = next_cursor
                    assert len(refs) == len(set(refs)) == case['expected_matches']
                    assert len(packed(baseline)) < 16384 and 'event_refs' not in baseline
                    count += 1
                count += history_response_cases(baseline, value_schema, family['event_type'], 'fixture', original_context)
                # Sweep part 2A one-defect witnesses for rows no earlier case refused alone.
                op_schema = load(f"Plans/alert_event_contracts/{family['operation']}.schema.json")
                count += p2a_witnesses.alert_all(sys.modules[__name__], tables, family, fixtures, schema, op_schema, value_schema)
                count += p2b_alert(family, fixtures, schema, value_schema, baseline)
            group = 'event_log' if key == 'checkpoint' else 'coordination_and_storage'
            row = next(x for x in values['families'] if x['family_id'] == family[key])
            check_schema(row['value_schema'])
            count += profile_cases(values, family[key], row['storage_kind'], group)
        assert family['event_type'] not in admitted
        for key in ('operation', 'checkpoint'):
            row = next(x for x in load('Plans/storage_value_registry.json')['families'] if x['family_id'] == family[key])
            assert row['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
            external = load(row['value_schema_ref'])
            assert row['value_schema'] == {k:v for k,v in external.items() if k != '$schema'}
        text = (ROOT / 'Plans/storage-plan.md').read_text().split(f"### {family['sp']} -", 1)[1].split('\n### ', 1)[0]
        for required in ('SP-278', 'SP-286', 'CV-339', 'storage.first_append_receipt.resolve.v2', 'PENDING_RETENTION_DECISION', family['handler'], family['event_type']):
            assert required in text, (family['event_type'], required)
    for fid in ('shared_alert_state', 'shared_alert_rule_state'):
        row = next(row for row in values['families'] if row['family_id'] == fid)
        check_schema(row['value_schema'])
        count += profile_cases(values, fid, 'redb', 'settings_and_layout')
    count += writer_policy_cases()
    count += cursor_cases()
    print(json.dumps({'status':'pass','cases':count,'families':1 if selected else 4,'admission':'ABSENT','native':'NOT_RUN','retention':'PENDING_RETENTION_DECISION'}))

if __name__ == '__main__':
    main()
