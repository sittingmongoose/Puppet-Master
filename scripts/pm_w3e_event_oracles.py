#!/usr/bin/env python3
"""W3E wave-3 phase 2: the complete Server / Remote Access / Backup-and-restore lane checker.

Twenty NEWLY AUTHORED families (CV-1400..1419, SP-1400..1419, BRS-1400/1401/1410, RAS-1402..1409,
SRV-1411..1419, ATS-1240/1241), prepared without admission. Every family is an executable oracle over a
complete case: the owner-issued source manifest (owner_fact), the EventRecord with its closed payload,
Storage's own record, CV-339 first-receipt custody, the SP-14xx custody value, the derived history row and
checkpoint, the SP-1101 sealed store and the retained read.

Structure (Method B, the W3F file layout with predicates that are the checker's own comparisons):
- ROWS below is the guard table. Every row is ONE predicate over one subject. Its decision code is generated
  from the row's template into scripts/pm_w3e_table_<table>.py by scripts/pm-w3e-table-generate.py; those
  table modules are what the gated guard tool (scripts/pm_guard_isolation.py, 004bdedd63) scans and cuts.
- The checker refuses ONLY through those table predicates (evaluate()): for a boundary it projects each row's
  inputs from the complete case, calls the table predicates in table order, and the refusals they return are
  its result.
- A row's inputs are the presented field value and the independent reference it must equal (the owner-issued
  manifest, the owner's own held state, Storage's own record, a recomputed identity), or a shared helper's own
  result where the rule IS that helper (full owner-schema validation with the shared CV-1101 date-time
  checker, pm_event_datetime.date_time, storage_uint64, current_integer, storage_value_bytes,
  verify_payload_bytes, RetainedDispatcher). An input is never a row verdict.
- 'applies' is the row's precondition: its families, and readiness gates (an earlier row owns a malformed
  input). Gates are derived from the case, never from table results, so a cut row changes only that row.

Owner rules are validated with the full owner schemas (pattern, format, not, allOf, oneOf all kept) and the
shared CV-1101 format checker. Named rows restore what Python's validator cannot see: an anchored owner
pattern without a CR/LF guard accepts a trailing LF (one fullmatch row per subject, from the same owner
schemas with each final `$` read as end-of-string), and the 'uuid' format's own check accepts '}', '_' and
extra hyphens.

No lane-local number cap, serializer or timestamp parser. No admission, no registry append, no native
execution. Deterministic: no clock, network, randomness or machine-dependent input.
"""
import base64
import copy
from decimal import Decimal
import functools
import hashlib
import importlib
import json
import re
import sys
from pathlib import Path

import blake3

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))

from jsonschema import Draft202012Validator  # noqa: E402
from referencing import Registry, Resource  # noqa: E402
from referencing.jsonschema import DRAFT202012  # noqa: E402

import pm_event_numbers  # noqa: E402
from pm_event_numbers import (  # noqa: E402
    EVENT_VALUE, Refusal,
    storage_uint64, current_integer, current_append_policy, loads_current_json,
    producer_semantic_digest, storage_value_bytes, decode_storage_value, full_value_commitment,
    verify_payload_bytes,
    RecipeTuple, OriginalBinding, OriginalCustody, FrozenRecipe, RetainedDispatcher,
)
from pm_event_datetime import date_time, format_checker, EVENT_RECORD, STORAGE_UTC_Z  # noqa: E402

TABLE_PREFIX = 'pm_w3e_table_'
PLAN = json.loads((ROOT / 'Plans/event_authority_w3e_oracle_plan.json').read_text())
FAMILIES = tuple(f['event_type'] for f in PLAN['families'])
PLAN_BY_FAMILY = {f['event_type']: f for f in PLAN['families']}
SLUG = {f: f.replace('.', '_') for f in FAMILIES}

STORAGE_INSTANCE_ID = '7c1e2a94-3b5d-4f60-8a71-92b3c4d5e6f7'
OTHER_INSTANCE_ID = '0d9e8f7a-6b5c-4d3e-9f2a-1b0c9d8e7f6a'
WRITER_SERVER_ID = 'server:home-01'
PROJECT_ID = 'project:alpha-01'
WRITER_LEASE = 'lease:writer-home-01-g7'
WRITER_PERMISSION = 'permission:service-authority-g3'
OCCURRED_TIME = '2026-11-05T10:00:00Z'
OBSERVED_TIME = '2026-11-05T10:00:01.123456789Z'
PERSISTED_TIME = '2026-11-05T10:00:02Z'
ACK_TIME = '2026-11-05T10:00:03Z'
INLINE_LIMIT = 16384
UINT64_MAX = (1 << 64) - 1
PACK_MEDIA = 'application/json'
CHECKPOINT_MEDIA = 'application/msgpack'
# CV-339 AppendReceipt.acknowledged_at_utc: the owner schema declares only format date-time and no owner text
# binds a validator profile (W3I recheck 2, "Questions for Jared" 2). It takes the broad EventRecord profile for
# now, through this single switch, until Jared decides.
RECEIPT_ACK_PROFILE = EVENT_RECORD


def hx(text):
    """Owner recipes' hex(): lowercase hexadecimal of the exact UTF-8 bytes, no normalization."""
    return text.encode('utf-8').hex()


def partition_of(scope_kind, project_id):
    """Storage scope_partition: app, or project~base64url_no_pad(UTF8(project_id)) (SP-1401/SP-1410)."""
    if scope_kind == 'application':
        return 'app'
    return 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')


# ---- Owner schemas: one closed preloaded registry, validated in full with the shared CV-1101 checker ------------

def _load(rel):
    return json.loads((ROOT / rel).read_text())


RESOURCE_FILES = (
    'Plans/event_record.schema.json',
    'Plans/event_append_receipt_contracts.schema.json',
    'Plans/event_record_index_checkpoint.schema.json',
    'Plans/server_system_contracts.schema.json',
    'Plans/remote_access_system_contracts.schema.json',
    'Plans/backup_restore_system_contracts.schema.json',
) + tuple(PLAN_BY_FAMILY[f]['payload_schema'] for f in FAMILIES)
RESOURCES = {rel: _load(rel) for rel in RESOURCE_FILES}
EVENT_RECORD_SCHEMA = RESOURCES['Plans/event_record.schema.json']
RECEIPT_SCHEMA = RESOURCES['Plans/event_append_receipt_contracts.schema.json']
EVENT_RECORD_ID = EVENT_RECORD_SCHEMA['$id']
RECEIPT_ID = RECEIPT_SCHEMA['$id']
PAYLOAD_SCHEMA = {f: RESOURCES[PLAN_BY_FAMILY[f]['payload_schema']] for f in FAMILIES}
PAYLOAD_ID = {f: PAYLOAD_SCHEMA[f]['$id'] for f in FAMILIES}
PAYLOAD_SCHEMA_IDS = {f: PAYLOAD_SCHEMA[f]['properties']['schema_id']['const'] for f in FAMILIES}
PRODUCERS = {f: PLAN_BY_FAMILY[f]['producer'] for f in FAMILIES}
ROLES = {f: tuple(PLAN_BY_FAMILY[f]['fixed_source_evidence_roles']) for f in FAMILIES}
SCOPES = {f: tuple(PAYLOAD_SCHEMA[f]['properties']['scope_kind'].get('enum')
                   or [PAYLOAD_SCHEMA[f]['properties']['scope_kind']['const']]) for f in FAMILIES}
CONSUMERS = {f: PAYLOAD_SCHEMA[f]['$defs']['checkpoint_body']['properties']['consumer_id']['const'] for f in FAMILIES}
VALUE_SCHEMA_IDS = {f: {k: PAYLOAD_SCHEMA[f]['$defs'][k]['properties']['schema_id']['const']
                        for k in ('custody', 'history', 'checkpoint')} for f in FAMILIES}
FACT_SCHEMA_IDS = {f: PAYLOAD_SCHEMA[f]['$defs']['owner_fact']['properties']['schema_id']['const'] for f in FAMILIES}


def _registry(resources):
    return Registry().with_resources([(doc['$id'], Resource.from_contents(doc, default_specification=DRAFT202012))
                                      for doc in resources.values()])


REGISTRY = _registry(RESOURCES)


def _strict(node, under_not=False):
    """The same owner schema with every final `$` of an anchored, not-negated pattern read as end-of-string
    (`\\Z`): Python's `$` also matches before a final LF, so the owner's full-consumption rule (CV-1400..1419:
    "identifier/digest strings require full consumption without trailing LF") is otherwise unenforced."""
    if isinstance(node, dict):
        out = {}
        for k, v in node.items():
            if (k == 'pattern' and not under_not and type(v) is str and v.startswith('^') and v.endswith('$')
                    and not v.endswith('\\$')):
                out[k] = v[:-1] + '\\Z'
            else:
                out[k] = _strict(v, under_not or k == 'not')
        return out
    if isinstance(node, list):
        return [_strict(v, under_not) for v in node]
    return node


STRICT_REGISTRY = _registry({rel: _strict(doc) for rel, doc in RESOURCES.items()})
# CV-1101: the shared helper's explicitly registered date-time predicate. Every owner date-time format in these
# resources (EventRecord date_time_string, the owner records' timestamp, the AppendReceipt, the index cursor) is
# checked with the broad EventRecord profile (RFC 3339); Storage's observed/persisted times add CV-253
# storage_utc_z at their own rows.
DATETIME_FORMATS = format_checker(profile=EVENT_RECORD)


@functools.lru_cache(maxsize=None)
def _validator(root_id, pointer, strict=False):
    ref = root_id + (('#' + pointer) if pointer else '')
    return Draft202012Validator({'$ref': ref}, registry=STRICT_REGISTRY if strict else REGISTRY,
                                format_checker=DATETIME_FORMATS)


def schema_errors(root_id, pointer, value):
    """Full owner validation (every keyword, every format the shared checker owns). Callers run it only on a
    value that encodes physically (SP-1100), so no integer exceeds Python's conversion limit."""
    return sorted('/'.join(str(p) for p in e.absolute_path) + ':' + str(e.validator)
                  for e in _validator(root_id, pointer).iter_errors(value))


def strict_errors(root_id, pointer, value):
    """The full-consumption restoration: errors of the strict copy of the same owner schemas. Callers run it only
    on a value the owner schema already accepts, so every error is an anchored pattern that matched only up to a
    final LF."""
    return sorted('/'.join(str(p) for p in e.absolute_path) + ':' + str(e.validator)
                  for e in _validator(root_id, pointer, True).iter_errors(value))


# The fixture oracle's own copy of the owner schemas, loaded separately from disk: generated negatives take their
# expected row from it, so a weakened validation copy in the checker (RESOURCES, REGISTRY, STRICT_REGISTRY) cannot
# also move the expectation.
ORACLE_RESOURCES = {rel: _load(rel) for rel in RESOURCE_FILES}
ORACLE_REGISTRY = _registry(ORACLE_RESOURCES)
ORACLE_STRICT_REGISTRY = _registry({rel: _strict(doc) for rel, doc in ORACLE_RESOURCES.items()})


@functools.lru_cache(maxsize=None)
def _oracle_validator(root_id, pointer, strict=False):
    ref = root_id + (('#' + pointer) if pointer else '')
    return Draft202012Validator({'$ref': ref}, registry=ORACLE_STRICT_REGISTRY if strict else ORACLE_REGISTRY,
                                format_checker=format_checker(profile=EVENT_RECORD))


def oracle_refuses(root_id, pointer, value, strict=False):
    return any(True for _e in _oracle_validator(root_id, pointer, strict).iter_errors(value))


def eager_refs(schema):
    """Resolve every $ref reachable from a root eagerly, transitively across resources, including dormant
    definitions and unvisited branches of every reached node (standing check 9). Raises on any dangling one."""
    root = REGISTRY.resolver_with_root(Resource.from_contents(schema, default_specification=DRAFT202012))
    count, seen, pending = 0, set(), [(schema, root)]
    while pending:
        node, resolver = pending.pop()
        if id(node) in seen:
            continue
        seen.add(id(node))
        stack = [node]
        while stack:
            cur = stack.pop()
            if isinstance(cur, dict):
                if '$ref' in cur:
                    resolved = resolver.lookup(cur['$ref'])
                    count += 1
                    pending.append((resolved.contents, resolved.resolver))
                stack.extend(cur.values())
            elif isinstance(cur, list):
                stack.extend(cur)
    return count


# JSON Schema 'uuid' (RFC 4122 string form; hex case-insensitive on input). The shared format checker runs the
# jsonschema 'uuid' check, uuid.UUID() plus four hyphen positions, which accepts a trailing '}', an extra hyphen
# and '_' (int() syntax). The owner's two token uuid formats are restored in full at their own row.
UUID_RE = re.compile(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', re.ASCII)


def fullmatch(regex, value):
    return type(value) is str and regex.fullmatch(value) is not None


# ---- Shared-rule wrappers: the refusal reason or None (never a verdict) ------------------------------------------

def reason_of(fn, *args, **kwargs):
    try:
        fn(*args, **kwargs)
        return None
    except Refusal as refusal:
        return refusal.reason


def physical_reason(value):
    return reason_of(storage_value_bytes, value, profile=EVENT_VALUE)


def pack_value(value):
    return storage_value_bytes(value, profile=EVENT_VALUE)


def _sha(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def _canon(value):
    """A typed structural form any JSON-shaped value has, integers of any size included (hex, never decimal text)."""
    if type(value) is int:
        return {'$int': hex(value)}
    if type(value) is float:
        return {'$float': value.hex()}
    if isinstance(value, Decimal):
        return {'$decimal': str(value), 'kind': getattr(value, 'numeric_kind', None)}
    if type(value) is dict:
        return {'$obj': [[k, _canon(v)] for k, v in sorted(value.items(), key=lambda kv: str(kv[0]))]}
    if type(value) in (list, tuple):
        return [_canon(v) for v in value]
    return value


def _structural_digest(value):
    return hashlib.sha256(json.dumps(_canon(value), ensure_ascii=True, separators=(',', ':')).encode()).hexdigest()


def owner_operation_of(method, original_operation_id, immutable_fact_id):
    """SRV/RAS/BRS-14xx Identity: family-operation@1: + SHA-256 of "pm.w3e.owner_fact.v1\\0" + hex(owner_method) +
    "\\0" + hex(original_operation_id) + "\\0" + hex(immutable_fact_id)."""
    return 'family-operation@1:' + _sha('pm.w3e.owner_fact.v1\0' + hx(method) + '\0' + hx(original_operation_id)
                                        + '\0' + hx(immutable_fact_id))


def event_id_of(family, scope_partition, server_id, owner_operation_id):
    """event_id is w3e@1: + SHA-256 of "pm.event.<family>.identity.v1\\0" + scope_partition + "\\0" +
    hex(server_id) + "\\0" + hex(owner_operation_id). String-only: no number or timestamp is serialized."""
    return 'w3e@1:' + _sha('pm.event.' + family + '.identity.v1\0' + scope_partition + '\0' + hx(server_id)
                           + '\0' + hx(owner_operation_id))


def idempotency_key_of(scope_kind, server_id, project_id, owner_operation_id):
    """CV-366 application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project (BRS-1401/BRS-1410):
    project@1:{hex(server_id)}:{hex(project_id)}:{hex(owner_operation_id)}."""
    if scope_kind == 'application':
        return 'application@1:' + hx(server_id) + ':' + hx(owner_operation_id)
    return 'project@1:' + hx(server_id) + ':' + hx(project_id) + ':' + hx(owner_operation_id)


def value_key(family, kind, scope_partition, server_id, owner_operation_id=None):
    """SP-14xx physical keys: w3e_<family>_<kind>.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
    [:{hex(owner_operation_id)}] (the checkpoint key has no operation segment)."""
    key = ('w3e_' + SLUG[family] + '_' + kind + '.v1:' + hx(STORAGE_INSTANCE_ID) + ':' + scope_partition + ':'
           + hx(server_id))
    return key if owner_operation_id is None else key + ':' + hx(owner_operation_id)


def first_receipt_ref(event_id):
    """The SP-286 first-append-result custody reference, computed from Storage's instance and the event."""
    return 'sp286:first_receipt:' + STORAGE_INSTANCE_ID + ':' + str(event_id)


def original_ref_of(event_id):
    return 'original:' + str(event_id)


# ---- Original owner records (the before/after records the source manifest embeds) ---------------------------------
# Taken from each owner's own valid contract fixtures (Plans/*_contract_fixtures.json), re-pointed at the writing
# Server; three definitions have no owner fixture and are written here against their owner schema. Every record is
# validated against its full owner definition when this module loads.

def _owner_fixture(doc, definition, name=None):
    data = _load('Plans/%s_contract_fixtures.json' % doc)
    for case in data['valid']:
        if case.get('definition') == definition and 'value' in case and (name is None or case['name'] == name):
            return copy.deepcopy(case['value'])
    raise KeyError((doc, definition, name))


SOURCE_DEF = {f: PLAN_BY_FAMILY[f]['source_schema_ref'] for f in FAMILIES}
SOURCE_DOC_ID = {
    'Plans/server_system_contracts.schema.json': RESOURCES['Plans/server_system_contracts.schema.json']['$id'],
    'Plans/remote_access_system_contracts.schema.json':
        RESOURCES['Plans/remote_access_system_contracts.schema.json']['$id'],
    'Plans/backup_restore_system_contracts.schema.json':
        RESOURCES['Plans/backup_restore_system_contracts.schema.json']['$id'],
}


def source_pointer(family):
    rel, pointer = SOURCE_DEF[family].split('#')
    return SOURCE_DOC_ID[rel], pointer


HAND_RECORDS = {
    'backup_destination': {
        'schema_id': 'pm.backup_restore_system.backup_destination.v2', 'schema_version': '2.0.0',
        'backup_destination_id': 'backup-destination:nas-01', 'display_name': 'Home NAS',
        'destination_family': 'local_nas', 'destination_adapter_id': 'adapter:restic-local-nas',
        'location_ref': 'location:nas:home-01', 'owning_server_id': WRITER_SERVER_ID,
        'auth_profile_ref': None, 'credential_ref': 'credential-ref:nas:home-01', 'oauth_registration_ref': None,
        'destination_generation': 5, 'state': 'configured',
        'capabilities': None, 'existing_repository_disposition': 'none_found',
        'repository_refs': ['repository:nas:home-01'], 'capacity_observation_ref': None,
        'last_test_receipt_ref': None, 'failure_ref': None, 'runtime_evidence_status': 'NOT_RUN',
        'created_at_utc': '2026-09-01T00:00:00Z', 'updated_at_utc': '2026-09-01T00:05:00Z',
        'currentness_ref': 'currentness:backup-destination:nas-01:5'},
    'remote_access_test_receipt': {
        'schema_id': None, 'schema_version': None, 'receipt_id': 'route-test-receipt:tailscale-01-7',
        'server_id': WRITER_SERVER_ID, 'server_endpoint_id': 'server-endpoint:tailscale-01',
        'remote_route_id': 'remote-route:tailscale-01', 'route_type': 'tailscale_private', 'route_generation': 4,
        'transport_generation': 3, 'identity_result': 'verified', 'protocol_result': 'compatible',
        'api_result': 'passed', 'websocket_result': 'passed', 'stream_result': 'passed',
        'file_transfer_result': 'passed', 'public_security_result': 'not_applicable',
        'observed_server_fingerprint': 'a' * 64, 'expected_server_fingerprint': 'a' * 64,
        'terminal_status': 'passed', 'failure_refs': [], 'started_at_utc': '2026-09-02T00:00:00Z',
        'completed_at_utc': '2026-09-02T00:00:09Z', 'redaction_profile': None},
    'revocation_record': {
        'schema_id': 'pm.server_system.revocation_record.v1', 'schema_version': '1.0.0',
        'revocation_record_id': 'revocation:desktop-01:3', 'server_id': WRITER_SERVER_ID,
        'client_id': 'client:desktop-01', 'previous_trust_generation': 2, 'effective_trust_generation': 3,
        'reason_code': 'user_revoked', 'actor_ref': 'actor:owner:01',
        'revoked_session_ids': ['session:desktop-01:2', 'session:desktop-01:3'],
        'revoked_at_utc': '2026-08-31T12:06:00Z', 'receipt_ref': 'receipt:client-revoke:desktop-01-3'},
}


def _definition_node(family):
    doc_id, pointer = source_pointer(family)
    node = REGISTRY.resolver().lookup(doc_id + '#' + pointer).contents
    return node


def _fill_hand(definition, family):
    record = copy.deepcopy(HAND_RECORDS[definition])
    node = _definition_node(family)
    props = node['properties']
    for key in ('schema_id', 'schema_version'):
        if record.get(key) is None and 'const' in props[key]:
            record[key] = props[key]['const']
    if definition == 'backup_destination' and record['capabilities'] is None:
        record['capabilities'] = {k: 'not_run' for k in props['capabilities']['required']}
    if definition == 'remote_access_test_receipt' and record['redaction_profile'] is None:
        rp = props['redaction_profile']
        record['redaction_profile'] = rp.get('const') or (rp.get('enum') or [None])[0]
    return record


RECORD_SOURCES = {
    'backup.destination_changed': ('hand', 'backup_destination'),
    'backup.state_changed': ('backup_restore_system', 'backup_run', None),
    'remote_access.private_endpoint_state_changed':
        ('remote_access_system', 'tailscale_private_endpoint_projection', None),
    'remote_access.proxy_state_changed': ('remote_access_system', 'remote_route_record',
                                          'private_tailscale_route_is_verified_beneath_existing_server'),
    'remote_access.public_security_violation_detected':
        ('remote_access_system', 'public_ingress_security_policy', 'funnel_security_policy_prohibits_internal_surfaces'),
    'remote_access.remote_link_state_changed': ('remote_access_system', 'remote_link_configuration',
                                                'remote_link_is_accountless_outbound_and_stores_no_content'),
    'remote_access.route_migration_state_changed': ('remote_access_system', 'remote_route_migration_record', None),
    'remote_access.route_preference_changed': ('remote_access_system', 'remote_route_record',
                                               'private_tailscale_route_is_verified_beneath_existing_server'),
    'remote_access.route_state_changed': ('remote_access_system', 'remote_route_record',
                                          'private_tailscale_route_is_verified_beneath_existing_server'),
    'remote_access.route_test_completed': ('hand', 'remote_access_test_receipt'),
    'restore.state_changed': ('backup_restore_system', 'restore_run', 'restore_run_phase_complete'),
    'server.catalog_changed': ('server_system', 'server_catalog',
                               'catalog_keeps_only_small_registration_and_reference_state'),
    'server.client_pairing_state_changed': ('server_system', 'pairing_run',
                                            'completed_pairing_has_identity_approval_and_receipt'),
    'server.client_revoked': ('hand', 'revocation_record'),
    'server.client_trust_changed': ('server_system', 'client_trust_record',
                                    'revoked_trust_links_durable_revocation_record'),
    'server.connection_state_changed': ('server_system', 'server_connection_projection', None),
    'server.discovery_expired': ('server_system', 'discovery_observation',
                                 'mdns_discovery_is_minimal_observation_not_trust'),
    'server.discovery_observed': ('server_system', 'discovery_observation',
                                  'mdns_discovery_is_minimal_observation_not_trust'),
    'server.endpoint_changed': ('server_system', 'server_endpoint_record',
                                'identity_mismatch_endpoint_fails_closed_and_is_not_preferred'),
    'server.identity_mismatch_detected': ('server_system', 'server_endpoint_record',
                                          'identity_mismatch_endpoint_fails_closed_and_is_not_preferred'),
}
SERVER_FIELDS = ('server_id', 'owning_server_id', 'target_server_id')
# Owner-held public identity material (SRV-1419: both fingerprints are recomputed from it; supplied digests prove
# nothing).
IDENTITY_MATERIAL = {'expected': 'ed25519-public:home-01:expected-key-7', 'observed': 'ed25519-public:mitm:observed-key-9'}
# Per-family adjustments that keep the owner record valid and make every joined value a distinct non-null value
# (a copy row reading a sibling field then fails), or select the owner branch the family's source rule names.
RECORD_PATCHES = {
    'remote_access.private_endpoint_state_changed': {'connector_revision': 6},
    'remote_access.proxy_state_changed': {'route_type': 'reverse_proxy_public', 'public_ingress': True,
                                          'visibility': 'public', 'route_generation': 7, 'transport_generation': 5,
                                          'remote_route_id': 'remote-route:proxy-01',
                                          'server_endpoint_id': 'server-endpoint:proxy-01',
                                          'configuration_ref': 'proxy-config:caddy-home-01'},
    'remote_access.route_preference_changed': {'preferred': True, 'policy_generation': 6},
    'remote_access.route_state_changed': {'route_generation': 9},
    'server.identity_mismatch_detected': {'expected_fingerprint': _sha(IDENTITY_MATERIAL['expected']),
                                          'observed_fingerprint': _sha(IDENTITY_MATERIAL['observed'])},
    'server.endpoint_changed': {'endpoint_generation': 6},
    'backup.state_changed': {'state': 'completed', 'manifest_ref': 'manifest:backup:project-alpha-02',
                             'integrity_verification_level': 'full_data_read_passed',
                             'verification_receipt_ref': 'receipt:verification:project-alpha-02',
                             'failure_ref': None},
    'server.catalog_changed': {'catalog_revision': 8},
}


def owner_record(family):
    spec = RECORD_SOURCES[family]
    if spec[0] == 'hand':
        record = _fill_hand(spec[1], family)
    else:
        record = _owner_fixture(spec[0], spec[1], spec[2])
    for field in SERVER_FIELDS:
        if field in record:
            record[field] = WRITER_SERVER_ID
    record.update(copy.deepcopy(RECORD_PATCHES.get(family, {})))
    if family == 'backup.state_changed':
        for attempt in record['destination_attempts']:
            if attempt['upload_state'] != 'committed':
                attempt.update(upload_state='committed', remote_snapshot_id='snapshot:project-alpha-b2-02',
                               commit_receipt_ref='receipt:destination-commit:b2-02', failure_ref=None,
                               terminal_at_utc=attempt['updated_at_utc'])
        record['project_ids'] = [PROJECT_ID]
    doc_id, pointer = source_pointer(family)
    errors = schema_errors(doc_id, pointer, record)
    assert not errors, (family, errors)
    return record


def _state_field(family):
    node = _definition_node(family)['properties']
    for name in ('state', 'phase', 'transport_state', 'terminal_status'):
        if name in node:
            return name
    return None


def predecessor_record(family, after):
    """A valid predecessor of the same subject: every generation one lower and, where the record has a state,
    a different owner-valid state (so prior_state and state are distinct non-null values)."""
    doc_id, pointer = source_pointer(family)
    before = copy.deepcopy(after)
    for key, value in list(before.items()):
        if type(value) is int and key not in ('port',) and value >= 2 and (
                key.endswith('generation') or key.endswith('revision') or key == 'catalog_revision'):
            before[key] = value - 1
    if family == 'server.client_revoked':
        before.update(previous_trust_generation=1, effective_trust_generation=2,
                      revocation_record_id='revocation:desktop-01:2', receipt_ref='receipt:client-revoke:desktop-01-2')
    if family == 'server.client_trust_changed':
        before.update(state='active', revocation_record_id=None, revoked_at_utc=None)
    if family in ('server.endpoint_changed', 'server.identity_mismatch_detected'):
        before.update(identity_verification='verified', observed_fingerprint=before['expected_fingerprint'],
                      state='ready')
    if family == 'remote_access.route_preference_changed':
        before.update(remote_route_id='remote-route:lan-01', server_endpoint_id='server-endpoint:lan-01',
                      route_type='lan', preferred=False, policy_generation=5,
                      currentness_ref='currentness:remote-route:lan-01:3')
    state = _state_field(family)
    if state is not None and before[state] == after[state]:
        node = _definition_node(family)['properties'][state]
        options = node.get('enum') or REGISTRY.resolver().lookup(doc_id + '#/$defs/' + node['$ref'].split('/')[-1]
                                                                 ).contents.get('enum', [])
        for option in options:
            if option == after[state]:
                continue
            trial = copy.deepcopy(before)
            trial[state] = option
            if not schema_errors(doc_id, pointer, trial):
                before = trial
                break
    assert not schema_errors(doc_id, pointer, before), (family, schema_errors(doc_id, pointer, before))
    return before


# ---- Per-family payload joins: each subject field and the immutable original owner fact it copies ------------------
# (payload field, source kind, argument). Source kinds: 'after'/'before' read that original record (null when the
# record is absent), 'subject' reads the after record or, for a removal, the last fenced before record, 'role' reads
# the fixed authority_evidence role, 'fact' reads the manifest's own field, 'change' derives created/updated/removed
# from which records are present (BRS-1400/SRV-1418). A payload field listed in UNJOINED has no owner_fact source
# today; it is schema-checked only and recorded as a contract gap in the report.
JOINS = {
    'backup.destination_changed': (
        ('backup_destination_id', 'subject', 'backup_destination_id'),
        ('destination_generation', 'subject', 'destination_generation'),
        ('prior_destination_ref', 'before', 'location_ref'),
        ('destination_ref', 'after', 'location_ref'),
        ('change_kind', 'fact', 'change_kind')),
    'backup.state_changed': (
        ('backup_run_id', 'after', 'backup_run_id'), ('backup_id', 'after', 'backup_id'),
        ('backup_type', 'after', 'backup_type'), ('prior_state', 'before', 'state'), ('state', 'after', 'state'),
        ('phase_journal_ref', 'role', 'phase_journal_entry'), ('manifest_ref', 'after', 'manifest_ref'),
        ('verification_receipt_ref', 'after', 'verification_receipt_ref')),
    'remote_access.private_endpoint_state_changed': (
        ('server_endpoint_id', 'after', 'server_endpoint_id'), ('remote_route_id', 'after', 'remote_route_id'),
        ('connector_id', 'after', 'connector_id'), ('prior_state', 'before', 'state'), ('state', 'after', 'state'),
        ('route_generation', 'after', 'route_generation'), ('connector_revision', 'after', 'connector_revision')),
    'remote_access.proxy_state_changed': (
        ('remote_route_id', 'after', 'remote_route_id'), ('server_endpoint_id', 'after', 'server_endpoint_id'),
        ('configuration_ref', 'after', 'configuration_ref'), ('prior_state', 'before', 'state'),
        ('state', 'after', 'state'), ('route_generation', 'after', 'route_generation')),
    'remote_access.public_security_violation_detected': (
        ('remote_route_id', 'after', 'remote_route_id'), ('policy_id', 'after', 'policy_id'),
        ('policy_generation', 'after', 'policy_generation'), ('detection_id', 'fact', 'immutable_fact_id'),
        ('detection_evidence_ref', 'role', 'violation_detection')),
    'remote_access.remote_link_state_changed': (
        ('configuration_id', 'after', 'configuration_id'), ('prior_state', 'before', 'transport_state'),
        ('state', 'after', 'transport_state'), ('transport_evidence_ref', 'role', 'transport_result')),
    'remote_access.route_migration_state_changed': (
        ('migration_id', 'after', 'migration_id'), ('from_remote_route_id', 'after', 'from_remote_route_id'),
        ('to_remote_route_id', 'after', 'to_remote_route_id'), ('prior_phase', 'before', 'phase'),
        ('phase', 'after', 'phase'), ('journal_ref', 'after', 'journal_ref')),
    'remote_access.route_preference_changed': (
        ('remote_route_id', 'after', 'remote_route_id'), ('previous_route_id', 'before', 'remote_route_id'),
        ('policy_ref', 'role', 'route_policy'), ('policy_generation', 'after', 'policy_generation'),
        ('preference_receipt_ref', 'role', 'preference_switch_receipt')),
    'remote_access.route_state_changed': (
        ('remote_route_id', 'after', 'remote_route_id'), ('server_endpoint_id', 'after', 'server_endpoint_id'),
        ('route_type', 'after', 'route_type'), ('prior_state', 'before', 'state'), ('state', 'after', 'state'),
        ('route_generation', 'after', 'route_generation'), ('test_receipt_ref', 'after', 'last_test_receipt_ref')),
    'remote_access.route_test_completed': (
        ('receipt_id', 'after', 'receipt_id'), ('remote_route_id', 'after', 'remote_route_id'),
        ('server_endpoint_id', 'after', 'server_endpoint_id'), ('route_type', 'after', 'route_type'),
        ('route_generation', 'after', 'route_generation'), ('terminal_status', 'after', 'terminal_status'),
        ('test_receipt_ref', 'role', 'test_receipt')),
    'restore.state_changed': (
        ('restore_run_id', 'after', 'restore_run_id'), ('mode', 'after', 'mode'), ('prior_state', 'before', 'state'),
        ('state', 'after', 'state'), ('phase_journal_ref', 'role', 'phase_journal_entry'),
        ('preview_receipt_ref', 'after', 'preview_receipt_ref')),
    'server.catalog_changed': (
        ('catalog_id', 'after', 'catalog_id'), ('previous_catalog_revision', 'before', 'catalog_revision'),
        ('catalog_revision', 'after', 'catalog_revision')),
    'server.client_pairing_state_changed': (
        ('pairing_session_id', 'after', 'pairing_session_id'), ('pairing_candidate_id', 'after', 'pairing_candidate_id'),
        ('candidate_client_id', 'after', 'candidate_client_id'), ('pairing_generation', 'after', 'pairing_generation'),
        ('prior_state', 'before', 'state'), ('state', 'after', 'state'), ('pairing_receipt_ref', 'after', 'receipt_ref')),
    'server.client_revoked': (
        ('client_id', 'after', 'client_id'), ('revocation_record_id', 'after', 'revocation_record_id'),
        ('previous_trust_generation', 'after', 'previous_trust_generation'),
        ('effective_trust_generation', 'after', 'effective_trust_generation'),
        ('reason_code', 'after', 'reason_code'), ('revocation_receipt_ref', 'after', 'receipt_ref')),
    'server.client_trust_changed': (
        ('client_trust_id', 'after', 'client_trust_id'), ('client_id', 'after', 'client_id'),
        ('client_access_policy_id', 'after', 'client_access_policy_id'),
        ('policy_generation', 'after', 'policy_generation'), ('trust_generation', 'after', 'trust_generation'),
        ('prior_state', 'before', 'state'), ('state', 'after', 'state'),
        ('trust_receipt_ref', 'role', 'protected_grant_or_mutation')),
    'server.connection_state_changed': (
        ('projection_id', 'after', 'projection_id'), ('client_id', 'after', 'client_id'),
        ('server_endpoint_id', 'after', 'server_endpoint_id'), ('remote_route_id', 'after', 'remote_route_id'),
        ('prior_state', 'before', 'state'), ('state', 'after', 'state'),
        ('connection_source_ref', 'role', 'connection_attempt')),
    'server.discovery_expired': (
        ('observation_id', 'after', 'observation_id'), ('discovery_source', 'after', 'discovery_source'),
        ('server_identity_fingerprint', 'after', 'server_identity_fingerprint'),
        ('expiry_decision_ref', 'role', 'expiry_decision')),
    'server.discovery_observed': (
        ('observation_id', 'after', 'observation_id'), ('discovery_source', 'after', 'discovery_source'),
        ('server_identity_fingerprint', 'after', 'server_identity_fingerprint'),
        ('observation_ref', 'role', 'original_observation')),
    'server.endpoint_changed': (
        ('server_endpoint_id', 'subject', 'server_endpoint_id'),
        ('endpoint_generation', 'subject', 'endpoint_generation'),
        ('identity_verification', 'subject', 'identity_verification'), ('change_kind', 'fact', 'change_kind')),
    'server.identity_mismatch_detected': (
        ('server_endpoint_id', 'after', 'server_endpoint_id'), ('expected_fingerprint', 'after', 'expected_fingerprint'),
        ('observed_fingerprint', 'after', 'observed_fingerprint'), ('detection_id', 'fact', 'immutable_fact_id'),
        ('mismatch_evidence_ref', 'role', 'mismatch_detection')),
}
COMMON_PAYLOAD = ('schema_id', 'schema_version', 'scope_kind', 'project_id', 'server_id', 'owner_operation_id',
                  'source_custody_ref', 'source_evidence_ref')
# Payload fields fixed by a const in both the payload and the owner record (server.discovery_observed grants_trust:
# const false on both sides) need no join row: the two schema consts decide them.
CONST_COPIES = {'server.discovery_observed': ('grants_trust',)}
UNJOINED = {f: tuple(k for k in PAYLOAD_SCHEMA[f]['required']
                     if k not in COMMON_PAYLOAD and k not in {j[0] for j in JOINS[f]}
                     and k not in CONST_COPIES.get(f, ())) for f in FAMILIES}
# The record field naming the writing Server (SP-14xx/CV-14xx: "Server ID is actual owner/writer identity").
RECORD_SERVER = {f: next((k for k in SERVER_FIELDS if k in _definition_node(f)['properties']), None)
                 for f in FAMILIES}
# The record field naming the subject the before and after records share (same subject predecessor).
SUBJECT_ID = {
    'backup.destination_changed': 'backup_destination_id', 'backup.state_changed': 'backup_run_id',
    'remote_access.private_endpoint_state_changed': 'server_endpoint_id',
    'remote_access.proxy_state_changed': 'remote_route_id',
    'remote_access.public_security_violation_detected': 'policy_id',
    'remote_access.remote_link_state_changed': 'configuration_id',
    'remote_access.route_migration_state_changed': 'migration_id',
    'remote_access.route_state_changed': 'remote_route_id', 'remote_access.route_test_completed': 'remote_route_id',
    'restore.state_changed': 'restore_run_id', 'server.catalog_changed': 'catalog_id',
    'server.client_pairing_state_changed': 'pairing_session_id', 'server.client_revoked': 'client_id',
    'server.client_trust_changed': 'client_trust_id', 'server.connection_state_changed': 'projection_id',
    'server.discovery_expired': 'observation_id', 'server.discovery_observed': 'observation_id',
    'server.endpoint_changed': 'server_endpoint_id', 'server.identity_mismatch_detected': 'server_endpoint_id',
}   # route_preference_changed has none: its predecessor is the previously preferred route (another subject).


def join_source(source, kind, arg):
    """The owner fact value a payload field copies (reads only the source manifest)."""
    before, after = source['before_record'], source['after_record']
    if kind == 'after':
        return after[arg] if type(after) is dict else None
    if kind == 'before':
        return before[arg] if type(before) is dict else None
    if kind == 'subject':
        record = after if type(after) is dict else before
        return record[arg] if type(record) is dict else None
    if kind == 'role':
        return source['authority_evidence'][arg]
    if kind == 'fact':
        return source[arg]
    assert kind == 'change', kind
    if before is None:
        return 'created'
    return 'removed' if after is None else 'updated'


def record_scope(family, source):
    """BRS-1401/BRS-1410: a Project Backup (or Project Restore) has its one actual Project; Full Server Backup and
    server_full Restore are application scope even when they include Projects."""
    after = source['after_record']
    if family == 'backup.state_changed':
        if after['backup_type'] == 'project_backup':
            return 'project', after['project_ids'][0]
        return 'application', None
    if family == 'restore.state_changed':
        if after['mode'] == 'server_full':
            return 'application', None
        return 'project', after['target_project_ids'][0]
    return 'application', None


# ---- Deterministic builders -------------------------------------------------------------------------------------------

def build_source(family, scope, with_before):
    """The owner-issued source manifest (CV-14xx owner_fact), complete and original."""
    after = owner_record(family)
    if family == 'restore.state_changed':
        if scope == 'application':
            after.update(mode='server_full', target_project_ids=[], source_project_ids=[], recovery_safe_mode=True)
        else:
            after.update(target_project_ids=[PROJECT_ID])
        doc_id, pointer = source_pointer(family)
        assert not schema_errors(doc_id, pointer, after), schema_errors(doc_id, pointer, after)
    if family == 'backup.state_changed' and scope == 'application':
        after.update(backup_type='full_server_backup', project_ids=[PROJECT_ID, 'project:beta-02'],
                     project_vault_ids=['project-vault:alpha', 'project-vault:beta'], catalog_revision=8)
        doc_id, pointer = source_pointer(family)
        assert not schema_errors(doc_id, pointer, after), schema_errors(doc_id, pointer, after)
    before = predecessor_record(family, after) if with_before else None
    slug = SLUG[family]
    fact_id = 'fact:' + slug + ':' + ('g2' if with_before else 'g1')
    roles = {role: 'evidence:' + slug + ':' + role for role in ROLES[family]}
    roles['writer_fence'] = WRITER_LEASE
    roles['permission_or_service_authority'] = WRITER_PERMISSION
    source = {
        'schema_id': FACT_SCHEMA_IDS[family], 'schema_version': '1.0.0', 'source_method': PRODUCERS[family],
        'original_operation_id': 'operation:' + slug + ':0007', 'immutable_fact_id': fact_id,
        'server_id': WRITER_SERVER_ID, 'scope_kind': 'application', 'project_id': None,
        'before_record': before, 'after_record': after,
        'original_result_ref': 'owner-result:' + slug + ':0007',
        'source_schema_uri': PAYLOAD_SCHEMA[family]['$defs']['owner_fact']['properties']['source_schema_uri']['const'],
        'source_recipe_ref': 'recipe:' + slug + ':owner-edition-1', 'authority_evidence': roles,
    }
    source['scope_kind'], source['project_id'] = record_scope(family, source)
    if 'change_kind' in PAYLOAD_SCHEMA[family]['$defs']['owner_fact']['properties']:
        source['change_kind'] = join_source(source, 'change', None)
    return source


def source_ref_of(source):
    return 'w3e-fact:' + _sha(str(source.get('source_method')) + '\0' + str(source.get('immutable_fact_id')))[:40]


def build_payload(family, source, partition):
    owner_operation_id = owner_operation_of(source['source_method'], source['original_operation_id'],
                                            source['immutable_fact_id'])
    payload = {
        'schema_id': PAYLOAD_SCHEMA_IDS[family], 'schema_version': '1.0.0', 'scope_kind': source['scope_kind'],
        'project_id': source['project_id'], 'server_id': source['server_id'],
        'owner_operation_id': owner_operation_id,
        'source_custody_ref': owner_custody_refs(family, source)['custody_ref'],
        'source_evidence_ref': source_ref_of(source),
    }
    for field, kind, arg in JOINS[family]:
        payload[field] = copy.deepcopy(join_source(source, kind, arg))
    for field in UNJOINED[family]:
        payload[field] = UNJOINED_VALUES[(family, field)]
    for field in CONST_COPIES.get(family, ()):
        payload[field] = PAYLOAD_SCHEMA[family]['properties'][field]['const']
    return payload


UNJOINED_VALUES = {
    ('remote_access.public_security_violation_detected', 'server_endpoint_id'): 'server-endpoint:funnel-01',
    ('remote_access.public_security_violation_detected', 'violated_control'): 'origin',
    ('remote_access.remote_link_state_changed', 'remote_route_id'): 'remote-route:remote-link-01',
    ('remote_access.remote_link_state_changed', 'provider_ref'): 'remote-link-provider-ref:initial',
    ('remote_access.route_migration_state_changed', 'migration_receipt_ref'): 'receipt:route-migration:0007',
    ('restore.state_changed', 'restore_receipt_ref'): 'receipt:restore:0007',
    ('server.catalog_changed', 'catalog_ref'): 'catalog-ref:server-catalog:home:8',
    ('server.endpoint_changed', 'endpoint_ref'): 'endpoint-ref:manual-01:6',
    ('server.endpoint_changed', 'prior_endpoint_ref'): None,
}


def build_envelope(family, payload, event_id, key, sequence_id):
    return {
        'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': payload['scope_kind'],
        'event_id': event_id, 'event_type': family, 'project_id': payload['project_id'],
        'thread_id': None, 'run_id': None, 'node_id': None, 'attempt_id': None,
        'actor_ref': 'service:' + PRODUCERS[family].split('.')[0], 'requested_account_ref': None,
        'effective_account_ref': None, 'occurred_at_utc': OCCURRED_TIME, 'observed_at_utc': OBSERVED_TIME,
        'persisted_at_utc': PERSISTED_TIME, 'sequence_id': sequence_id, 'producer_sequence_id': None,
        'correlation_id': payload['owner_operation_id'], 'causation_event_id': None, 'parent_event_id': None,
        'idempotency_key': key, 'payload_schema_id': PAYLOAD_SCHEMA_IDS[family], 'payload': copy.deepcopy(payload),
        'payload_ref': None, 'redaction_profile': 'no_secrets', 'replay_policy': 'dedupe_by_idempotency_key',
        'migration': {'migrated_from_schema_id': None, 'migrated_from_schema_version': None, 'migration_id': None,
                      'compatibility_event_type': None},
    }


RECEIPT_FIELDS = ('event_id', 'sequence_id', 'segment_generation', 'segment_name', 'byte_offset', 'commit_group_id',
                  'durability_class', 'durable_end_offset', 'durability_state', 'manifest_generation',
                  'acknowledged_at_utc')
RECEIPT_SLOTS = ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')


def build_storage_record(event):
    """Storage's own assigned record (authority). Built once with the event; resync never rebuilds it."""
    return {
        'event_id': event['event_id'], 'sequence_id': event['sequence_id'], 'segment_generation': 3,
        'segment_name': 'seg-000003-00000000000000000041.active', 'byte_offset': 512,
        'commit_group_id': 'group-w3e-41', 'durability_class': 'barrier', 'durable_end_offset': 2304,
        'durability_state': 'synced', 'manifest_generation': 17, 'acknowledged_at_utc': ACK_TIME,
        'observed_at_utc': event['observed_at_utc'], 'persisted_at_utc': event['persisted_at_utc'],
    }


def build_receipt_custody(event, record, scope_partition):
    return {
        'schema_id': 'pm.storage_value.event_append_receipt_custody.v2', 'schema_version': '2.0.0',
        'original_event_value_commitment': {
            'schema_id': 'pm.storage.original_event_value_commitment.v1', 'schema_version': '1.0.0',
            'codec': EVENT_VALUE, 'domain': 'pm.storage.original_event_value_commitment.v1',
            'event_schema_id': 'pm.event.v0', 'event_schema_version': '2.0.0', 'sha256': full_value_commitment(event)},
        'storage_instance_id': STORAGE_INSTANCE_ID, 'event_id': event['event_id'], 'scope_partition': scope_partition,
        'event_type': event['event_type'], 'idempotency_key': event['idempotency_key'],
        'producer_semantic_digest': producer_semantic_digest(event),
        'group_digest': _sha('w3e-group:' + str(event['event_id'])),
        'first_append_receipt': {k: record[k] for k in RECEIPT_FIELDS},
        'redaction_profile': 'no_secrets', 'original_segment_ref': 'segment:w3e-original-41',
    }


def owner_custody_refs(family, source):
    """The owner's own custody references for one original (SP-14xx custody retains them; never reconstructed from
    the event)."""
    slug, fact = SLUG[family], str(source.get('immutable_fact_id'))
    return {'custody_ref': 'custody:' + slug + ':' + fact,
            'intent_ref': 'intent:' + slug + ':' + fact, 'after_source_ref': 'source-after:' + slug + ':' + fact,
            'before_source_ref': (None if source.get('before_record') is None
                                  else 'source-before:' + slug + ':' + fact),
            'semantic_input_ref': 'semantic-input:' + slug + ':' + fact}


def build_custody_value(family, event, case):
    payload, refs = event['payload'], case['owner']['custody_refs']
    return {
        'schema_id': VALUE_SCHEMA_IDS[family]['custody'], 'schema_version': '1.0.0',
        'storage_instance_id': STORAGE_INSTANCE_ID, 'server_id': payload['server_id'],
        'scope_partition': case['scope_partition'], 'owner_operation_id': payload['owner_operation_id'],
        'source_method': PRODUCERS[family], 'intent_ref': refs['intent_ref'],
        'before_source_ref': refs['before_source_ref'], 'after_source_ref': refs['after_source_ref'],
        'original_owner_result_ref': case['source']['original_result_ref'],
        'semantic_input_ref': refs['semantic_input_ref'], 'event_id': event['event_id'],
        'producer_semantic_digest': producer_semantic_digest(event),
        'append_result_ref': first_receipt_ref(event['event_id']), 'state': 'settled',
    }


def build_history(family, event, case):
    payload = event['payload']
    return {
        'schema_id': VALUE_SCHEMA_IDS[family]['history'], 'schema_version': '1.0.0',
        'storage_instance_id': STORAGE_INSTANCE_ID, 'server_id': payload['server_id'],
        'scope_partition': case['scope_partition'], 'owner_operation_id': payload['owner_operation_id'],
        'event_id': event['event_id'], 'sequence_id': event['sequence_id'],
        'payload_ref': history_payload_ref(event), 'source_custody_ref': payload['source_custody_ref'],
        'projection_generation_ref': case['projection_generation'],
    }


def history_payload_ref(event):
    """The original payload's reference: the SP-337 payload_ref when the body is externalized, else the original
    stored record that carries it inline (its SP-1101 original reference)."""
    return event['payload_ref'] if event.get('payload_ref') is not None else original_ref_of(event.get('event_id'))


def build_index_state(label, dataset_name=None):
    """Storage's live SP-278 generic read state (authority for the nine durable token fields)."""
    generation_id = 'eig_' + _sha('w3e-generation-' + label)
    return {
        'storage_instance_id': STORAGE_INSTANCE_ID,
        'checkpoint_key': 'event_record_index_checkpoint.v1:' + STORAGE_INSTANCE_ID,
        'checkpoint_ref': 'checkpoint:' + generation_id, 'generation_id': generation_id,
        'generation_anchor_sha256': _sha('w3e-anchor-' + label), 'frontier_revision': 41,
        'frontier_sha256': _sha('w3e-frontier-' + label),
        'index_dataset_name': dataset_name or ('event_record_index.v2@' + generation_id),
        'source_selection': {
            'storage_instance_id': STORAGE_INSTANCE_ID, 'current_ref': 'storage/seglog/CURRENT',
            'current_bytes_sha256': _sha('w3e-current-' + label), 'selected_segment_generation': 3,
            'manifest_ref': 'storage/seglog/manifest.v1.msgpack', 'manifest_bytes_sha256': _sha('w3e-manifest-' + label),
            'manifest_generation': 17, 'recovery_epoch': 2,
            'manifest_survivor_prefix_sha256': _sha('w3e-survivor-' + label),
            'retained_inventory_sha256': _sha('w3e-retained-' + label),
            'durable_watermarks_sha256': _sha('w3e-watermarks-' + label),
            'excluded_ranges_sha256': _sha('w3e-excluded-' + label),
            'retired_inputs_sha256': _sha('w3e-retired-' + label)},
    }


def build_checkpoint_body(family, event, case):
    record = case['storage_record']
    return {
        'consumer_id': CONSUMERS[family], 'publication_revision': case['prior_publication_revision'] + 1,
        'status': 'current', 'generic_read_token': copy.deepcopy(case['index_state']),
        'last_examined_cursor': {
            'segment_generation': record['segment_generation'], 'segment_name': record['segment_name'],
            'byte_offset': record['byte_offset'], 'frame_end_offset': record['durable_end_offset'],
            'last_sequence_id': record['sequence_id'], 'last_event_id': record['event_id']},
        'filter_complete': True, 'projection_generation_ref': case['projection_generation'],
    }


def build_checkpoint(family, event, case, body):
    payload = event['payload']
    wrapper = {'schema_id': VALUE_SCHEMA_IDS[family]['checkpoint'], 'schema_version': '1.0.0',
               'storage_instance_id': STORAGE_INSTANCE_ID, 'server_id': payload['server_id'],
               'scope_partition': case['scope_partition'], 'body_inline': body, 'body_ref': None}
    case['checkpoint_body_pack'] = None
    if case['checkpoint_route'] == 'ref':
        raw = pack_value(body)
        wrapper['body_inline'] = None
        wrapper['body_ref'] = {'blake3_id': blake3.blake3(raw).hexdigest(), 'byte_size': len(raw),
                               'media_type': CHECKPOINT_MEDIA}
        case['checkpoint_body_pack'] = {'raw_hex': raw.hex()}
    return wrapper


# ---- Payload integer slots (CV-1100 current_integer at every schema integer slot) ---------------------------------

def _resolve(node, resolver):
    while isinstance(node, dict) and '$ref' in node:
        resolved = resolver.lookup(node['$ref'])
        node, resolver = resolved.contents, resolved.resolver
    return node, resolver


def _integer_bounds(node, resolver=None):
    """(minimum, maximum) of an integer slot, or None when the slot admits no integer."""
    node, resolver = _resolve(node, resolver or REGISTRY.resolver())
    if not isinstance(node, dict):
        return None
    for branch in node.get('anyOf', []) + node.get('oneOf', []):
        found = _integer_bounds(branch, resolver)
        if found is not None:
            return found
    kind = node.get('type')
    if kind == 'integer' or (type(kind) is list and 'integer' in kind):
        return node.get('minimum'), node.get('maximum')
    return None


PAYLOAD_SLOTS = {f: tuple((k, _integer_bounds(v)) for k, v in PAYLOAD_SCHEMA[f]['properties'].items()
                          if _integer_bounds(v) is not None) for f in FAMILIES}
SLOT_NAMES = tuple(sorted({k for f in FAMILIES for k, _b in PAYLOAD_SLOTS[f]}))


def slot_bounds(family, field):
    return dict(PAYLOAD_SLOTS[family])[field]


# ---- The complete case ------------------------------------------------------------------------------------------------

def record_digest(record):
    return None if record is None else _structural_digest(record)


def build_case(family, case_id, scope=None, with_before=False, sequence_id=41, route='inline'):
    """One complete valid case: the owner-issued manifest and the owner's own held state, the writer context,
    envelope, Storage record, receipt custody, SP-14xx custody, history, checkpoint and sealed store."""
    scope = scope or SCOPES[family][0]
    source = build_source(family, scope, with_before)
    partition = partition_of(source['scope_kind'], source['project_id'])
    payload = build_payload(family, source, partition)
    event = build_envelope(family, payload, 'pending', 'pending', sequence_id)
    case = {
        'case_id': case_id, 'family': family,
        'live': {'admitted': True},
        'writer': {'server_id': WRITER_SERVER_ID, 'lease_ref': WRITER_LEASE, 'permission_ref': WRITER_PERMISSION},
        'source_ref': payload['source_evidence_ref'],
        'source': source,
        'owner': {
            'issued_digest': record_digest(source),
            'roles': copy.deepcopy(source['authority_evidence']),
            'current_before': record_digest(source['before_record']),
            'settled_after': record_digest(source['after_record']),
            'custody_refs': owner_custody_refs(family, source),
            'identity_material': dict(IDENTITY_MATERIAL),
            'active_sessions': (list(source['after_record']['revoked_session_ids'])
                                if family == 'server.client_revoked' else []),
            'current_generations': {k: source['after_record'][k] for k in ('trust_generation', 'policy_generation')
                                    if family == 'server.client_trust_changed'},
        },
        'event': event,
        'storage_record': None,
        'scope_partition': partition,
        'dedupe_caught_up': True,
        'payload_pack': None,
        'checkpoint_route': route,
        'index_state': build_index_state('1'),
        'prior_publication_revision': 6,
        'projection_generation': 'projection-generation:' + SLUG[family] + ':7',
        'cas_expected_matches': True,
        'transaction_committed': True,
        'family_withdrawn': False,
        'original_withdrawn': False,
        'disclosure_allowed': True,
        'retained_recipe_override': None,
        'owner_impl': 'sealed_store',
        'frozen_map': 'installed',
        'rebuild_matches': True,
        'replay_effects': [],
        'writer_cutoff_applied': True,
        'withdrawal_marks': 1,
        'reader_fenced': True,
        'successor_verified': True,
        'reported_outcome': 'success',
        'actual_outcome': 'success',
        'retry_sequence_unchanged': True,
    }
    resync(case, identity=True)
    case['storage_record'] = build_storage_record(case['event'])
    return resync(case, identity=True)


def rebuild_payload(case):
    """The payload as the producer derives it from the (possibly changed) owner fact; source_evidence_ref keeps
    naming the stored manifest."""
    family, source = case['family'], case['source']
    payload = build_payload(family, source, partition_of(source['scope_kind'], source['project_id']))
    payload['source_evidence_ref'] = case['source_ref']
    for field in UNJOINED[family]:
        payload[field] = copy.deepcopy(case['event']['payload'].get(field))
    case['event']['payload'] = payload
    case['event']['scope_kind'] = payload['scope_kind']
    case['event']['project_id'] = payload['project_id']
    case['event']['correlation_id'] = payload['owner_operation_id']
    case['scope_partition'] = partition_of(payload['scope_kind'], payload['project_id'])


def reissue(case):
    """The owner genuinely issued and settled this (possibly changed) fact: its issuance digest and its own held
    predecessor/settled records follow the manifest. The genuine role evidence the owner holds does not."""
    source = case['source']
    case['owner']['issued_digest'] = record_digest(source)
    if type(source) is dict:
        case['owner']['current_before'] = record_digest(source.get('before_record'))
        case['owner']['settled_after'] = record_digest(source.get('after_record'))


def resync(case, identity=True):
    """Recompute every dependent copy from the authorities (the payload's identity inputs, Storage's record, the
    owner's held refs): event identity (optional), receipt custody, SP-14xx custody, sealed store, retry candidate,
    history and checkpoint. Storage's record, the source manifest and the owner's held state are never rebuilt
    here: they are the independent authority."""
    event, family = case['event'], case['family']
    payload = event.get('payload') if type(event) is dict else None
    if identity and type(payload) is dict and family in FAMILIES and all(
            type(payload.get(k)) is str for k in ('server_id', 'owner_operation_id', 'scope_kind')) and (
            payload['scope_kind'] == 'application' or type(payload.get('project_id')) is str):
        partition = partition_of(payload['scope_kind'], payload.get('project_id'))
        event['event_id'] = event_id_of(family, partition, payload['server_id'], payload['owner_operation_id'])
        event['idempotency_key'] = idempotency_key_of(payload['scope_kind'], payload['server_id'],
                                                      payload.get('project_id') or '', payload['owner_operation_id'])
        if case.get('storage_record') is not None:
            case['storage_record']['event_id'] = event['event_id']
    record = case.get('storage_record')
    if record is None:
        return case
    try:
        receipt = build_receipt_custody(event, record, case['scope_partition'])
        case['receipt_custody'] = receipt
        case['custody'] = build_custody_value(family, event, case)
        case['sealed_store'] = [build_sealed_receipt(event, receipt, family)]
        case['original_ref'] = case['sealed_store'][0]['original_ref']
        case['retry_returned_receipt_hex'] = case['sealed_store'][0]['receipt_hex']
    except (Refusal, KeyError, TypeError, AttributeError):
        # The changed value cannot be committed (the shared codec refuses it, or a dependent field is missing).
        # Keep the copies Storage would have written consistent field by field, so only the row that owns the
        # changed value refuses.
        receipt = case.get('receipt_custody') or {}
        receipt['first_append_receipt'] = {k: record.get(k) for k in RECEIPT_FIELDS}
        for k in ('event_id', 'idempotency_key', 'event_type'):
            receipt[k] = event.get(k) if type(event) is dict else None
        receipt['scope_partition'] = case['scope_partition']
        case['receipt_custody'] = receipt
        case.setdefault('custody', None)
        case.setdefault('sealed_store', [])
        case.setdefault('original_ref', original_ref_of(event.get('event_id') if type(event) is dict else None))
        case.setdefault('retry_returned_receipt_hex', None)
    case['retry_event'] = copy.deepcopy(event)
    if type(payload) is dict and type(event) is dict:
        try:
            case['history'] = build_history(family, event, case)
            body = build_checkpoint_body(family, event, case)
            case['checkpoint'] = build_checkpoint(family, event, case, body)
        except (Refusal, KeyError, TypeError):
            pass
    return case


def with_pack(case):
    """Externalize the event body through SP-337: an immutable BLAKE3 payload pack and exact payload_ref. The
    logical body and semantic digest are unchanged; the pack holds its canonical SP-236 bytes."""
    raw = pack_value(case['event']['payload'])
    payload_id = blake3.blake3(raw).digest().hex()
    case['payload_pack'] = {'raw_hex': raw.hex(), 'byte_size': len(raw), 'payload_id': payload_id,
                            'media_type': PACK_MEDIA}
    case['event']['payload_ref'] = 'blake3:' + payload_id
    return resync(case)


def set_storage_time(case, field, value):
    """A Storage-assigned time as Storage assigned it: its own record and the event carry the same value."""
    case['storage_record'][field] = value
    case['event'][field] = value


def set_sequence(case, value):
    case['storage_record']['sequence_id'] = value
    case['event']['sequence_id'] = value


# ---- Retained reads: SP-1101 sealed-receipt dispatch ------------------------------------------------------------------

RESOURCE_MANIFEST_SHA256 = _structural_digest(RESOURCES)
RECIPE_FIELDS = ('envelope_schema_id', 'envelope_schema_version', 'payload_schema_id', 'payload_schema_version',
                 'owner_source_id', 'owner_edition', 'registry_revision', 'identity_recipe', 'producer_recipe',
                 'physical_profile', 'full_value_profile', 'local_source_profile', 'payload_profile',
                 'resource_manifest_sha256')
BINDING_FIELDS = ('storage_instance_id', 'scope_kind', 'server_id', 'project_id', 'event_type', 'event_id',
                  'idempotency_key', 'owner_operation_id', 'source_commitment')
SEALED_KEYS = ('original_ref', 'binding', 'recipe', 'record_hex', 'result_hex', 'receipt_hex')


def recipe_tuple(family):
    return RecipeTuple(
        envelope_schema_id='pm.event.v0', envelope_schema_version='2.0.0',
        payload_schema_id=PAYLOAD_SCHEMA_IDS[family], payload_schema_version='1.0.0',
        owner_source_id=PRODUCERS[family], owner_edition='w3e-owner-edition-1',
        registry_revision='w3e-prepared-no-admission', identity_recipe='w3e-string-identity-sha256-v1',
        producer_recipe='cv-317-producer-semantic-v1', physical_profile=EVENT_VALUE,
        full_value_profile='pm.storage.original_event_value_commitment.v1', local_source_profile='w3e-owner-fact-v1',
        payload_profile=PAYLOAD_SCHEMA_IDS[family], resource_manifest_sha256=RESOURCE_MANIFEST_SHA256)


def original_binding(event):
    payload = event['payload']
    return OriginalBinding(
        storage_instance_id=STORAGE_INSTANCE_ID, scope_kind=event['scope_kind'], server_id=payload['server_id'],
        project_id=event['project_id'], event_type=event['event_type'], event_id=event['event_id'],
        idempotency_key=event['idempotency_key'], owner_operation_id=payload['owner_operation_id'],
        source_commitment=full_value_commitment(event))


def append_result(event):
    return {'schema_id': 'pm.storage_value.w3e_append_result.v1', 'schema_version': '1.0.0',
            'event_id': event['event_id'], 'sequence_id': event['sequence_id'], 'status': 'appended'}


def build_sealed_receipt(event, receipt, family):
    """The independently sealed receipt Storage wrote for one exact original. Reading never creates one."""
    binding, recipe = original_binding(event), recipe_tuple(family)
    return {'original_ref': original_ref_of(event['event_id']),
            'binding': {f: getattr(binding, f) for f in BINDING_FIELDS},
            'recipe': {f: getattr(recipe, f) for f in RECIPE_FIELDS},
            'record_hex': pack_value(event).hex(), 'result_hex': pack_value(append_result(event)).hex(),
            'receipt_hex': pack_value(receipt).hex()}


def _custody_from_sealed(sealed):
    """Build the authenticated original from one sealed store row; a malformed row refuses with a code. A member of
    the wrong type or value makes the shared constructors refuse (RecipeTuple: recipe_tuple, recipe_resource_hash;
    OriginalBinding: original_binding, original_scope; scripts/pm_event_numbers.py:442-485). Those are defects of
    the sealed row itself, so they refuse here as sealed_receipt_malformed."""
    if (type(sealed) is not dict or set(sealed) != set(SEALED_KEYS) or type(sealed['binding']) is not dict
            or set(sealed['binding']) != set(BINDING_FIELDS) or type(sealed['recipe']) is not dict
            or set(sealed['recipe']) != set(RECIPE_FIELDS)
            or any(type(sealed[k]) is not str or len(sealed[k]) % 2 or sealed[k].strip('0123456789abcdef')
                   for k in ('record_hex', 'result_hex', 'receipt_hex'))):
        raise Refusal('sealed_receipt_malformed')
    try:
        binding, recipe = OriginalBinding(**sealed['binding']), RecipeTuple(**sealed['recipe'])
    except Refusal:
        raise Refusal('sealed_receipt_malformed') from None
    return OriginalCustody(binding=binding, recipe=recipe, record_bytes=bytes.fromhex(sealed['record_hex']),
                           result_bytes=bytes.fromhex(sealed['result_hex']),
                           receipt_bytes=bytes.fromhex(sealed['receipt_hex']))


class SealedReceiptOwner:
    """Resolves the sealed receipt for one exact original_ref from Storage's sealed store. Trusted composition: it
    reads the store, never a caller-supplied custody object, and never writes it."""

    def __init__(self, store):
        self._store = store

    def authenticated_original(self, original_ref):
        matches = [r for r in self._store if type(r) is dict and r.get('original_ref') == original_ref]
        if not matches:
            raise Refusal('original_receipt_missing')
        if len(matches) > 1:
            raise Refusal('original_receipt_ambiguous')
        return _custody_from_sealed(matches[0])


class AccessLoggingOwner(SealedReceiptOwner):
    """A faulty owner composition (negative only): it writes an access receipt into the sealed store while
    resolving. The store snapshot row refuses it; no fixture field reports it."""

    def authenticated_original(self, original_ref):
        original = super().authenticated_original(original_ref)
        logged = copy.deepcopy(self._store[0])
        logged['original_ref'] = 'access-log:' + original_ref
        self._store.append(logged)
        return original


OWNERS = {'sealed_store': SealedReceiptOwner, 'access_logging': AccessLoggingOwner}


def frozen_components(custody):
    """The frozen w3e@1 verifier's checks over the sealed original, each its own (presented, expected) pair or
    shared-helper result. A component is computed only when the components it depends on hold, so one defect yields
    one failing component. Only the sealed bytes and the sealed recipe are read: no live source, no live admission,
    no current writer gate."""
    out = {}
    try:
        record = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
        receipt = decode_storage_value(custody.receipt_bytes, profile=EVENT_VALUE)
        result = decode_storage_value(custody.result_bytes, profile=EVENT_VALUE)
        decodes = type(record) is dict and type(receipt) is dict and type(result) is dict
    except Refusal:
        decodes = False
    out['decodes'] = decodes
    if not decodes:
        return out
    out['envelope_schema'] = schema_errors(EVENT_RECORD_ID, '', record)
    if out['envelope_schema']:
        return out
    family = record['event_type']
    out['family'] = family in FAMILIES
    out['recipe_family'] = (custody.recipe.payload_schema_id, record['payload_schema_id'])
    out['observed_utc_z'] = reason_of(date_time, record['observed_at_utc'], profile=STORAGE_UTC_Z)
    out['persisted_utc_z'] = reason_of(date_time, record['persisted_at_utc'], profile=STORAGE_UTC_Z)
    commitment = full_value_commitment(record)
    out['source_commitment'] = (custody.binding.source_commitment, commitment)
    out['result_event_id'] = (result.get('event_id'), record['event_id'])
    out['receipt_schema'] = schema_errors(RECEIPT_ID, '/$defs/custody_v2', receipt)
    if not out['receipt_schema']:
        out['receipt_full_value'] = (receipt['original_event_value_commitment']['sha256'], commitment)
        out['receipt_event_id'] = (receipt['event_id'], record['event_id'])
    if out['family']:
        out['payload_schema_id'] = (record['payload_schema_id'], PAYLOAD_SCHEMA_IDS[family])
        out['payload_schema'] = schema_errors(PAYLOAD_ID[family], '', record['payload'])
        if not out['payload_schema']:
            out['payload_full_consumption'] = strict_errors(PAYLOAD_ID[family], '', record['payload'])
            payload = record['payload']
            partition = partition_of(payload['scope_kind'], payload['project_id'])
            out['identity'] = (record['event_id'], event_id_of(family, partition, payload['server_id'],
                                                               payload['owner_operation_id']))
            out['key'] = (record['idempotency_key'],
                          idempotency_key_of(payload['scope_kind'], payload['server_id'], payload['project_id'] or '',
                                             payload['owner_operation_id']))
            if not out['receipt_schema']:
                try:
                    semantic = producer_semantic_digest(record)
                except Refusal as refusal:
                    semantic = 'unqualified:' + refusal.reason   # a forged original whose projection cannot qualify
                out['receipt_semantic'] = (receipt['producer_semantic_digest'], semantic)
    return out


def component_holds(name, value):
    if name in ('decodes', 'family'):
        return value is True
    if name in ('envelope_schema', 'payload_schema', 'receipt_schema', 'payload_full_consumption'):
        return value == []
    if name in ('observed_utc_z', 'persisted_utc_z'):
        return value is None
    return type(value[0]) is type(value[1]) and value[0] == value[1]


def _frozen_verify(custody):
    """w3e@1 frozen verifier: every component holds. Exactly the conjunction of the frozen rows."""
    components = frozen_components(custody)
    return all(component_holds(name, value) for name, value in components.items())


def _current_gated_verify(custody):
    """A faulty frozen verifier (negative only): it runs the current writer gate on the retained original."""
    record = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
    current_append_policy(record['replay_policy'])
    return _frozen_verify(custody)


FROZEN_MAPS = {
    'installed': {recipe_tuple(f): FrozenRecipe(verify_original=_frozen_verify) for f in FAMILIES},
    'current_gated': {recipe_tuple(f): FrozenRecipe(verify_original=_current_gated_verify) for f in FAMILIES},
}


class _RecordingOwner:
    """Records the original the dispatcher received from the owner, so the frozen rows read exactly it."""

    def __init__(self, inner):
        self.inner, self.seen = inner, None

    def authenticated_original(self, original_ref):
        original = self.inner.authenticated_original(original_ref)
        self.seen = original
        return original


def retained_request(event):
    """The expected binding of the original the read asks for, or None when the request cannot name one original
    (its shape is wrong, or the shared full-value commitment refuses it). None goes to the shared dispatcher, which
    refuses it as original_query itself."""
    if (type(event) is not dict or any(type(event.get(k)) is not str for k in ('event_type', 'event_id',
                                                                                 'idempotency_key', 'scope_kind'))
            or type(event.get('payload')) is not dict
            or any(type(event['payload'].get(k)) is not str for k in ('server_id', 'owner_operation_id'))):
        return None
    try:
        return original_binding(event)
    except Refusal:
        return None


def resolve_retained(case):
    """One SP-1101 resolution through the shared RetainedDispatcher, instrumented: the sealed store is snapshotted
    before and after, and every call of the shared current writer gate during the read is counted."""
    store = case['sealed_store']
    before = _structural_digest(store)
    owner = _RecordingOwner(OWNERS[case['owner_impl']](store))
    recipes = FROZEN_MAPS[case['frozen_map']]
    calls = []
    real = pm_event_numbers.current_append_policy
    module = sys.modules[__name__]

    def counting(value):
        calls.append(value)
        return real(value)
    pm_event_numbers.current_append_policy = counting
    module.current_append_policy = counting
    try:
        expected = retained_request(case['event'])
        RetainedDispatcher(owner, recipes).resolve(
            case['original_ref'], expected, disclose=lambda binding: case['disclosure_allowed'] is True,
            recipe_override=case['retained_recipe_override'])
        reason = None
    except Refusal as refusal:
        reason = refusal.reason
    finally:
        pm_event_numbers.current_append_policy = real
        module.current_append_policy = real
    after = _structural_digest(store)
    return {'reason': reason, 'store_before': before, 'store_after': after, 'gate_calls': len(calls),
            'seen': owner.seen}


# ---- Per-case derivations (decide nothing; rows read them) -------------------------------------------------------------

class Memo:
    def __init__(self, case):
        self.case, self.values = case, {}

    def get(self, name):
        if name not in self.values:
            self.values[name] = DERIVED[name](self.case, self)
        return self.values[name]


DERIVED = {}


def derived(fn):
    DERIVED[fn.__name__] = fn
    return fn


def E(c):
    return c['event']


def P(c):
    return c['event']['payload']


def S(c):
    return c['source']


def ROLE(c, name):
    return c['source']['authority_evidence'][name]


def AFTER(c):
    return c['source']['after_record']


def BEFORE(c):
    return c['source']['before_record']


def SUBJECT(c):
    after = AFTER(c)
    return after if type(after) is dict else BEFORE(c)


def RC(c):
    return c['receipt_custody']


def FR(c):
    return c['receipt_custody']['first_append_receipt']


def CUS(c):
    return c['custody']


def H(c):
    return c['history']


def CK(c):
    return c['checkpoint']


def PAYLOAD_PTR(c):
    return PAYLOAD_ID[c['family']]


@derived
def fam(c, m):
    return c['family'] in FAMILIES and type(c['event']) is dict and type(c['event'].get('payload')) is dict


@derived
def seq_ok(c, m):
    return m.get('fam') and ('sequence_id' not in E(c) or reason_of(storage_uint64, E(c)['sequence_id']) is None)


@derived
def phys_ok(c, m):
    return m.get('seq_ok') and physical_reason(E(c)) is None


@derived
def pslots_ok(c, m):
    return m.get('phys_ok') and all(reason_of(current_integer, P(c)[k], minimum=b[0], maximum=b[1]) is None
                                    for k, b in PAYLOAD_SLOTS[c['family']] if k in P(c) and P(c)[k] is not None)


@derived
def env_errors(c, m):
    return schema_errors(EVENT_RECORD_ID, '', E(c))


@derived
def env_ok(c, m):
    return m.get('phys_ok') and m.get('env_errors') == []


@derived
def pay_errors(c, m):
    return schema_errors(PAYLOAD_PTR(c), '', P(c))


@derived
def pay_ok(c, m):
    return m.get('env_ok') and m.get('pslots_ok') and m.get('pay_errors') == []


@derived
def pay_strict_ok(c, m):
    return m.get('pay_ok') and strict_errors(PAYLOAD_PTR(c), '', P(c)) == []


@derived
def src_present(c, m):
    return m.get('pay_strict_ok') and P(c)['source_evidence_ref'] == c['source_ref']


@derived
def src_auth(c, m):
    return m.get('src_present') and record_digest(S(c)) == c['owner']['issued_digest']


@derived
def src_phys(c, m):
    return m.get('src_auth') and physical_reason(S(c)) is None


@derived
def src_ok(c, m):
    return m.get('src_phys') and schema_errors(PAYLOAD_PTR(c), '/$defs/owner_fact', S(c)) == []


@derived
def src_strict_ok(c, m):
    return m.get('src_ok') and strict_errors(PAYLOAD_PTR(c), '/$defs/owner_fact', S(c)) == []


@derived
def joins_ok(c, m):
    return m.get('pay_strict_ok') and m.get('src_strict_ok')


@derived
def has_before(c, m):
    return m.get('joins_ok') and type(BEFORE(c)) is dict and type(AFTER(c)) is dict


@derived
def digest(c, m):
    try:
        return producer_semantic_digest(E(c))
    except Refusal:
        return None


@derived
def full_value(c, m):
    try:
        return full_value_commitment(E(c))
    except Refusal:
        return None


@derived
def policy_reason(c, m):
    return reason_of(current_append_policy, E(c)['replay_policy'])


def _receipt_or_none(c):
    receipt = c.get('receipt_custody')
    first = receipt.get('first_append_receipt') if type(receipt) is dict else None
    return first if type(first) is dict else None


@derived
def producer_ok(c, m):
    """The event can be committed at all: its CV-317 producer projection qualifies (append_producer_route owns the
    refusal). Storage writes no receipt or custody for an event it cannot commit, so their rows wait for this."""
    return m.get('fam') and m.get('digest') is not None


@derived
def rc_slots_ok(c, m):
    first = _receipt_or_none(c)
    return m.get('producer_ok') and (first is None or all(reason_of(storage_uint64, first[k]) is None for k in RECEIPT_SLOTS if k in first))


@derived
def rc_phys_ok(c, m):
    return m.get('rc_slots_ok') and physical_reason(c.get('receipt_custody')) is None


@derived
def rc_ok(c, m):
    return m.get('rc_phys_ok') and schema_errors(RECEIPT_ID, '/$defs/custody_v2', RC(c)) == []


@derived
def rc_strict_ok(c, m):
    return m.get('rc_ok') and strict_errors(RECEIPT_ID, '/$defs/custody_v2', RC(c)) == []


@derived
def partition_ok(c, m):
    return m.get('pay_strict_ok') and c['scope_partition'] == partition_of(P(c)['scope_kind'], P(c)['project_id'])


@derived
def custody_inputs_ok(c, m):
    """The custody value copies the payload, the manifest's original result and the partition; its own rows run only
    once those copies' sources passed their rows."""
    return m.get('joins_ok') and m.get('partition_ok') and m.get('producer_ok')


@derived
def cus_phys_ok(c, m):
    return m.get('custody_inputs_ok') and physical_reason(c.get('custody')) is None


@derived
def cus_ok(c, m):
    return m.get('cus_phys_ok') and schema_errors(PAYLOAD_PTR(c), '/$defs/custody', CUS(c)) == []


@derived
def cus_strict_ok(c, m):
    return m.get('cus_ok') and strict_errors(PAYLOAD_PTR(c), '/$defs/custody', CUS(c)) == []


@derived
def pack_route(c, m):
    return m.get('env_ok') and E(c)['payload_ref'] is not None


PACK_KEYS = ('raw_hex', 'byte_size', 'payload_id', 'media_type')


@derived
def pack_shape(c, m):
    pack = c.get('payload_pack')
    return (type(pack) is dict and set(pack) == set(PACK_KEYS) and type(pack['raw_hex']) is str
            and type(pack['payload_id']) is str)


@derived
def pack_raw(c, m):
    try:
        return bytes.fromhex(c['payload_pack']['raw_hex'])
    except ValueError:
        return None


@derived
def pack_reason(c, m):
    pack = c['payload_pack']
    return reason_of(verify_payload_bytes, m.get('pack_raw'), byte_size=pack['byte_size'],
                     payload_id=pack['payload_id'], media_type=pack['media_type'], expected_media_type=PACK_MEDIA)


@derived
def retry_phys_ok(c, m):
    return type(c['retry_event']) is dict and physical_reason(c['retry_event']) is None


@derived
def retry_ok(c, m):
    return m.get('retry_phys_ok') and schema_errors(EVENT_RECORD_ID, '', c['retry_event']) == []


@derived
def retry_digest(c, m):
    try:
        return producer_semantic_digest(c['retry_event'])
    except Refusal:
        return None


@derived
def retry_policy_reason(c, m):
    return reason_of(current_append_policy, c['retry_event'].get('replay_policy'))


@derived
def sealed_matches(c, m):
    return [r for r in c['sealed_store'] if type(r) is dict and r.get('original_ref') == c['original_ref']]


# derived boundary --------------------------------------------------------------------------------------------------------

@derived
def hist_slot_ok(c, m):
    history = c.get('history')
    return type(history) is dict and ('sequence_id' not in history
                                      or reason_of(storage_uint64, history['sequence_id']) is None)


@derived
def hist_phys_ok(c, m):
    return m.get('hist_slot_ok') and physical_reason(H(c)) is None


@derived
def hist_ok(c, m):
    return m.get('hist_phys_ok') and schema_errors(PAYLOAD_PTR(c), '/$defs/history', H(c)) == []


@derived
def hist_strict_ok(c, m):
    return m.get('hist_ok') and strict_errors(PAYLOAD_PTR(c), '/$defs/history', H(c)) == []


@derived
def ck_wphys_ok(c, m):
    return type(c.get('checkpoint')) is dict and physical_reason(CK(c)) is None


@derived
def ck_ref_route(c, m):
    return m.get('ck_wphys_ok') and CK(c).get('body_inline') is None and type(CK(c).get('body_ref')) is dict


@derived
def ck_raw(c, m):
    pack = c.get('checkpoint_body_pack')
    if type(pack) is not dict or type(pack.get('raw_hex')) is not str:
        return None
    try:
        return bytes.fromhex(pack['raw_hex'])
    except ValueError:
        return None


@derived
def ck_decoded(c, m):
    raw = m.get('ck_raw')
    if raw is None:
        return {'reason': 'checkpoint_body_unavailable', 'body': None}
    try:
        return {'reason': None, 'body': decode_storage_value(raw, profile=EVENT_VALUE)}
    except Refusal as refusal:
        return {'reason': refusal.reason, 'body': None}


@derived
def body(c, m):
    """The checkpoint body the reader validates: inline, or the resolved SP-337 body on the ref route."""
    if not m.get('ck_wphys_ok'):
        return None
    if m.get('ck_ref_route'):
        return m.get('ck_decoded')['body']
    return CK(c).get('body_inline')


BODY_SLOTS = (
    ('publication_revision', ('publication_revision',)),
    ('frontier_revision', ('generic_read_token', 'frontier_revision')),
    ('selected_segment_generation', ('generic_read_token', 'source_selection', 'selected_segment_generation')),
    ('manifest_generation', ('generic_read_token', 'source_selection', 'manifest_generation')),
    ('recovery_epoch', ('generic_read_token', 'source_selection', 'recovery_epoch')),
    ('cursor_segment_generation', ('last_examined_cursor', 'segment_generation')),
    ('cursor_byte_offset', ('last_examined_cursor', 'byte_offset')),
    ('cursor_frame_end_offset', ('last_examined_cursor', 'frame_end_offset')),
    ('cursor_last_sequence_id', ('last_examined_cursor', 'last_sequence_id')),
)


def at_path(node, path):
    """(present, value) at a path of dict keys; absent when a container is not a dict or a key is missing."""
    for part in path:
        if type(node) is not dict or part not in node:
            return False, None
        node = node[part]
    return True, node


def slot_reason(node, path):
    present, value = at_path(node, path)
    return reason_of(storage_uint64, value) if present else None


@derived
def body_resolved(c, m):
    """The body is available: inline, or a ref route whose pack decodes canonically and matches its descriptor."""
    if not m.get('ck_wphys_ok'):
        return False
    if not m.get('ck_ref_route'):
        return type(CK(c).get('body_inline')) is dict
    raw, ref = m.get('ck_raw'), CK(c)['body_ref']
    return (raw is not None and m.get('ck_decoded')['reason'] is None and type(m.get('body')) is dict
            and blake3.blake3(raw).hexdigest() == ref.get('blake3_id') and len(raw) == ref.get('byte_size'))


@derived
def body_slots_ok(c, m):
    return m.get('body_resolved') and all(slot_reason(m.get('body'), p) is None for _n, p in BODY_SLOTS)


@derived
def ck_wrapper_ok(c, m):
    return (m.get('ck_wphys_ok') and reason_of(current_integer, (CK(c).get('body_ref') or {}).get('byte_size', 1),
                                                minimum=1) is None
            and (m.get('ck_ref_route') or m.get('body_slots_ok'))
            and schema_errors(PAYLOAD_PTR(c), '/$defs/checkpoint', CK(c)) == [])


@derived
def body_ok(c, m):
    return (m.get('ck_wrapper_ok') and m.get('body_slots_ok')
            and schema_errors(PAYLOAD_PTR(c), '/$defs/checkpoint_body', m.get('body')) == [])


@derived
def body_strict_ok(c, m):
    return m.get('body_ok') and strict_errors(PAYLOAD_PTR(c), '/$defs/checkpoint_body', m.get('body')) == []


def wrapper_without_body(c):
    wrapper = dict(CK(c))
    wrapper['body_inline'] = None
    if wrapper.get('body_ref') is None:
        wrapper['body_ref'] = {'blake3_id': '0' * 64, 'byte_size': 1, 'media_type': CHECKPOINT_MEDIA}
    return wrapper


@derived
def ck_wstrict_ok(c, m):
    return m.get('ck_wrapper_ok') and strict_errors(PAYLOAD_PTR(c), '/$defs/checkpoint', wrapper_without_body(c)) == []


@derived
def token_uuid_ok(c, m):
    token = m.get('body')['generic_read_token'] if m.get('body_strict_ok') else None
    return (token is not None and fullmatch(UUID_RE, token['storage_instance_id'])
            and fullmatch(UUID_RE, token['source_selection']['storage_instance_id']))


@derived
def ck_ref_ok(c, m):
    return (m.get('ck_ref_route') and m.get('ck_raw') is not None
            and reason_of(current_integer, CK(c)['body_ref'].get('byte_size'), minimum=1) is None)


def TOKEN(m):
    return m.get('body')['generic_read_token']


def CURSOR(m):
    return m.get('body')['last_examined_cursor']


@derived
def retained(c, m):
    return resolve_retained(c)


@derived
def frozen(c, m):
    seen = m.get('retained')['seen']
    return frozen_components(seen) if seen is not None else {}


# ---- Row specification ---------------------------------------------------------------------------------------------------
# Every row: one predicate over one subject. `inputs(c, m)` returns the template's inputs (the presented value and
# the independent reference it is compared with, or a shared helper's own result). It runs only when the row applies.

TEMPLATES = {
    # template: (input keys, refusal condition over `record`)
    'eq': (('presented', 'expected'),
           "type(record['presented']) is not type(record['expected']) or record['presented'] != record['expected']"),
    'ne': (('presented', 'forbidden'),
           "type(record['presented']) is type(record['forbidden']) and record['presented'] == record['forbidden']"),
    'true': (('presented',), "record['presented'] is not True"),
    'false': (('presented',), "record['presented'] is not False"),
    'none': (('presented',), "record['presented'] is not None"),
    'empty': (('presented',), "type(record['presented']) is not list or len(record['presented']) != 0"),
    'member': (('presented', 'collection'),
               "type(record['collection']) is not list or record['presented'] not in record['collection']"),
    'at_most': (('presented', 'limit'),
                "type(record['presented']) is not int or record['presented'] > record['limit']"),
    'gt': (('presented', 'floor'),
           "type(record['presented']) is not int or type(record['floor']) is not int or "
           "record['presented'] <= record['floor']"),
    'handled': (('presented', 'handled'),
                "record['presented'] is not None and record['presented'] not in record['handled']"),
}

ROWS = []
ROW_BY_ID = {}
ENTAILED = {}   # row id -> (rows that always refuse first, written proof)
BOUNDARIES = ('append', 'retry', 'derived', 'withdrawal', 'retained')


def row(boundary, table, rid, code, field, words, kind, inputs, gates=(), families=None, when=None):
    assert rid not in ROW_BY_ID, rid
    assert kind in TEMPLATES, kind
    entry = {'boundary': boundary, 'table': table, 'id': rid, 'code': code, 'field': field, 'words': words,
             'kind': kind, 'inputs': inputs, 'gates': tuple(gates),
             'families': None if families is None else tuple(families), 'when': when,
             'line': sys._getframe(1).f_lineno}
    ROWS.append(entry)
    ROW_BY_ID[rid] = entry
    return entry


def entailed(rid, first, proof):
    ENTAILED[rid] = (tuple(first), proof)


def record_for(r, c, m):
    applies = (r['families'] is None or c['family'] in r['families']) and all(m.get(g) for g in r['gates'])
    if applies and r['when'] is not None:
        applies = r['when'](c, m) is True
    record = {'applies': applies is True}
    if record['applies']:
        values = r['inputs'](c, m)
        assert set(values) == set(TEMPLATES[r['kind']][0]), (r['id'], sorted(values))
        record.update(values)
    return record


def EQ(presented, expected):
    return {'presented': presented, 'expected': expected}


def NE(presented, forbidden):
    return {'presented': presented, 'forbidden': forbidden}


def V(presented):
    return {'presented': presented}


def chunk(prefix, index, size=8):
    return '%s_%d' % (prefix, 1 + index // size)


def families_with(predicate):
    return tuple(f for f in FAMILIES if predicate(f))


A = 'append'

# append: scenario and admission ---------------------------------------------------------------------------------------
row(A, 'append_admission', 'append_event_object', 'event_schema', '/event',
    'the presented EventRecord is a JSON object with an object payload', 'true',
    lambda c, m: V(type(E(c)) is dict and type(E(c).get('payload')) is dict))
row(A, 'append_admission', 'append_family_known', 'unknown_family', '/family',
    'the family is one of the twenty W3E families', 'member',
    lambda c, m: {'presented': c['family'], 'collection': list(FAMILIES)})
row(A, 'append_admission', 'append_admitted', 'missing_event_registration', '/live/admitted',
    'the current writer has this exact family/version/scope admission (a labelled hypothetical admitted fixture '
    'context; the live registry is never changed)', 'true', lambda c, m: V(c['live']['admitted']))
row(A, 'append_admission', 'append_dedupe', 'dedupe_unavailable', '/dedupe_caught_up',
    'authoritative dedupe is resolved through the verified tail before append', 'true',
    lambda c, m: V(c['dedupe_caught_up']))

# append: numbers (SP-1100 / CV-1100) before any shape check -----------------------------------------------------------
row(A, 'append_numbers', 'append_sequence_uint64', 'shared_number_rule_refusal', '/event/sequence_id',
    'sequence_id is Storage\'s exact uint64 (shared storage_uint64)', 'none',
    lambda c, m: V(reason_of(storage_uint64, E(c)['sequence_id'])), gates=('fam',),
    when=lambda c, m: 'sequence_id' in E(c))
row(A, 'append_numbers', 'append_event_physical', 'shared_number_rule_refusal', '/event',
    'the whole event value encodes under SP-1100 EVENT_VALUE (every integer in the physical range; nothing raises)',
    'none', lambda c, m: V(physical_reason(E(c))), gates=('seq_ok',))
for _i, _name in enumerate(SLOT_NAMES):
    row(A, chunk('append_slots', _i), 'append_slot_' + _name, 'shared_number_rule_refusal', '/event/payload/' + _name,
        'payload ' + _name + ' is a current integer in its owner schema domain (shared current_integer with the '
        'schema minimum/maximum, no lane-local bound)', 'none',
        (lambda k: lambda c, m: V(reason_of(current_integer, P(c)[k], minimum=slot_bounds(c['family'], k)[0],
                                            maximum=slot_bounds(c['family'], k)[1])))(_name),
        gates=('phys_ok',), families=families_with(lambda f, k=_name: k in dict(PAYLOAD_SLOTS[f])),
        when=(lambda k: lambda c, m: k in P(c) and P(c)[k] is not None)(_name))

# append: envelope ---------------------------------------------------------------------------------------------------------
row(A, 'append_envelope', 'append_envelope_schema', 'event_schema', '/event',
    'the full EventRecord owner schema accepts the event (shared CV-1101 date-time checker)', 'empty',
    lambda c, m: V(m.get('env_errors')), gates=('phys_ok',))
row(A, 'append_envelope', 'append_event_type', 'family_dispatch_mismatch', '/event/event_type',
    'event_type is this exact family (also refuses a trailing-LF spelling the anchored owner pattern accepts)', 'eq',
    lambda c, m: EQ(E(c)['event_type'], c['family']), gates=('env_ok',))
row(A, 'append_envelope', 'append_payload_schema_id', 'family_dispatch_mismatch', '/event/payload_schema_id',
    'payload_schema_id selects this family\'s closed payload', 'eq',
    lambda c, m: EQ(E(c)['payload_schema_id'], PAYLOAD_SCHEMA_IDS[c['family']]), gates=('env_ok',))
row(A, 'append_envelope', 'append_observed_utc_z', 'shared_timestamp_rule_refusal', '/event/observed_at_utc',
    'the Storage-assigned observed_at_utc passes shared date_time with the CV-253 storage_utc_z profile', 'none',
    lambda c, m: V(reason_of(date_time, E(c)['observed_at_utc'], profile=STORAGE_UTC_Z)), gates=('env_ok',))
row(A, 'append_envelope', 'append_persisted_utc_z', 'shared_timestamp_rule_refusal', '/event/persisted_at_utc',
    'the Storage-assigned persisted_at_utc passes shared date_time with the CV-253 storage_utc_z profile', 'none',
    lambda c, m: V(reason_of(date_time, E(c)['persisted_at_utc'], profile=STORAGE_UTC_Z)), gates=('env_ok',))
row(A, 'append_envelope', 'append_replay_only', 'replay_only_not_appendable', '/event/replay_policy',
    'a current append refuses projector_replay_only (shared current_append_policy)', 'ne',
    lambda c, m: NE(m.get('policy_reason'), 'replay_only_not_appendable'), gates=('env_ok',))
for _i, _k in enumerate(('thread_id', 'run_id', 'node_id', 'attempt_id')):
    row(A, 'append_links', 'append_' + _k + '_null', 'out_of_scope_join', '/event/' + _k,
        'no fabricated ' + _k + ': the out-of-scope EventRecord join is null (CV-1400..1419 owner units)', 'none',
        (lambda k: lambda c, m: V(E(c)[k]))(_k), gates=('env_ok',))
for _k in ('event_id', 'sequence_id', 'observed_at_utc', 'persisted_at_utc'):
    row(A, 'append_storage', 'append_storage_' + _k.replace('_at_utc', ''), 'storage_metadata_mismatch',
        '/event/' + _k, 'the event ' + _k + ' equals Storage\'s own record, never the caller\'s', 'eq',
        (lambda k: lambda c, m: EQ(E(c)[k], c['storage_record'][k]))(_k), gates=('env_ok',))

# append: payload, scope and identity ----------------------------------------------------------------------------------------
row(A, 'append_payload', 'append_payload_schema', 'payload_schema', '/event/payload',
    'the full closed family payload owner schema accepts the payload (every $ref, pattern, not, allOf, enum)', 'empty',
    lambda c, m: V(m.get('pay_errors')), gates=('env_ok', 'pslots_ok'))
row(A, 'append_payload', 'append_payload_full_consumption', 'invalid_exact_string', '/event/payload',
    'every anchored owner pattern in the payload consumes its whole string (no trailing LF)', 'empty',
    lambda c, m: V(strict_errors(PAYLOAD_PTR(c), '', P(c))), gates=('pay_ok',))
row(A, 'append_payload', 'append_project', 'scope_mismatch', '/event/project_id',
    'the envelope project_id is the payload project_id', 'eq',
    lambda c, m: EQ(E(c)['project_id'], P(c)['project_id']), gates=('pay_strict_ok',))
row(A, 'append_payload', 'append_partition', 'scope_mismatch', '/scope_partition',
    'the Storage partition appended to is app or project~base64url_no_pad(UTF8(project_id))', 'eq',
    lambda c, m: EQ(c['scope_partition'], partition_of(P(c)['scope_kind'], P(c)['project_id'])),
    gates=('pay_strict_ok',))
row(A, 'append_payload', 'append_event_id', 'identity_mismatch', '/event/event_id',
    'event_id is w3e@1: + SHA-256 of the family identity preimage (partition, hex(server_id), hex(owner_operation_id))',
    'eq', lambda c, m: EQ(E(c)['event_id'], event_id_of(c['family'], partition_of(P(c)['scope_kind'], P(c)['project_id']),
                                                       P(c)['server_id'], P(c)['owner_operation_id'])),
    gates=('pay_strict_ok',))
row(A, 'append_payload', 'append_idempotency_key', 'idempotency_conflict', '/event/idempotency_key',
    'idempotency_key is exactly CV-366 application@1 (or the BRS project@1 key) of the payload identity', 'eq',
    lambda c, m: EQ(E(c)['idempotency_key'], idempotency_key_of(P(c)['scope_kind'], P(c)['server_id'],
                                                                P(c)['project_id'] or '', P(c)['owner_operation_id'])),
    gates=('pay_strict_ok',))
row(A, 'append_payload', 'append_producer_route', 'shared_number_rule_refusal', '/event',
    'the CV-317 producer projection qualifies under the shared producer_semantic_digest route (an unrepresentable '
    'semantic digest refuses before new event effects, without narrowing the source schema)', 'none',
    lambda c, m: V(reason_of(producer_semantic_digest, E(c))), gates=('pay_strict_ok',))
row(A, 'append_payload', 'append_writer_server', 'stale_owner', '/event/payload/server_id',
    'server_id is the actual writing Server (the writer context), not a label or an observed unverified identity', 'eq',
    lambda c, m: EQ(P(c)['server_id'], c['writer']['server_id']), gates=('pay_strict_ok',))

row(A, 'entailed_scope_kind', 'append_scope_kind', 'scope_mismatch', '/event/scope_kind',
    'the envelope scope_kind is the payload scope_kind', 'eq',
    lambda c, m: EQ(E(c)['scope_kind'], P(c)['scope_kind']), gates=('pay_strict_ok',),
    when=lambda c, m: E(c)['project_id'] == P(c)['project_id'])
entailed('append_scope_kind', ['append_project'],
         'Both schemas tie the scope kind to the Project: Plans/event_record.schema.json allOf makes project_id null '
         'for application and a non-empty string for project; every W3E payload schema either fixes scope_kind const '
         'application with project_id type null, or (Backup/Restore) carries the allOf if scope_kind project then '
         'project_id a string, else null. The row is gated on pay_strict_ok (both schemas passed) and applies only '
         'when the envelope and payload project_id are equal; equal project_id values (both null, or the same '
         'string) force the same scope_kind under those two allOf rules. A differing scope_kind therefore always has '
         'differing project_id values, which append_project refuses.')

# append: the owner-issued source manifest ---------------------------------------------------------------------------------
row(A, 'append_source', 'append_source_present', 'source_unavailable', '/event/payload/source_evidence_ref',
    'source_evidence_ref names the stored original owner manifest', 'eq',
    lambda c, m: EQ(P(c)['source_evidence_ref'], c['source_ref']), gates=('pay_strict_ok',))
row(A, 'append_source', 'append_source_authentic', 'source_unavailable', '/source',
    'the manifest is the one the owner issued (its digest equals the owner\'s own issuance record; a consistent '
    'rehash of a substituted snapshot is refused)', 'eq',
    lambda c, m: EQ(record_digest(S(c)), c['owner']['issued_digest']), gates=('src_present',))
row(A, 'append_source', 'append_source_physical', 'shared_number_rule_refusal', '/source',
    'the source manifest encodes under SP-1100 EVENT_VALUE', 'none',
    lambda c, m: V(physical_reason(S(c))), gates=('src_auth',))
row(A, 'append_source', 'append_source_schema', 'source_schema', '/source',
    'the full owner_fact schema accepts the manifest, with each existing owner record schema in full (every '
    'pattern, not, allOf, oneOf and date-time format through the shared CV-1101 checker)', 'empty',
    lambda c, m: V(schema_errors(PAYLOAD_PTR(c), '/$defs/owner_fact', S(c))), gates=('src_phys',))
row(A, 'append_source', 'append_source_full_consumption', 'invalid_exact_string', '/source',
    'every anchored owner pattern in the manifest and its embedded owner records consumes its whole string', 'empty',
    lambda c, m: V(strict_errors(PAYLOAD_PTR(c), '/$defs/owner_fact', S(c))), gates=('src_ok',))
row(A, 'append_source', 'append_owner_operation', 'identity_mismatch', '/event/payload/owner_operation_id',
    'owner_operation_id is family-operation@1: of the owner method, original operation and immutable fact IDs', 'eq',
    lambda c, m: EQ(P(c)['owner_operation_id'], owner_operation_of(S(c)['source_method'],
                                                                    S(c)['original_operation_id'],
                                                                    S(c)['immutable_fact_id'])),
    gates=('joins_ok',))
row(A, 'append_source', 'append_source_custody_ref', 'source_identity_mismatch', '/event/payload/source_custody_ref',
    'source_custody_ref is the owner\'s own custody reference for this original', 'eq',
    lambda c, m: EQ(P(c)['source_custody_ref'], c['owner']['custody_refs']['custody_ref']), gates=('pay_strict_ok',))
row(A, 'append_source', 'append_source_server', 'source_identity_mismatch', '/source/server_id',
    'the manifest server_id is the payload server_id', 'eq',
    lambda c, m: EQ(P(c)['server_id'], S(c)['server_id']), gates=('joins_ok',))

row(A, 'append_source_scope', 'append_source_project', 'scope_mismatch', '/source/project_id',
    'the payload project_id is the original owner Project (null for application scope)', 'eq',
    lambda c, m: EQ(P(c)['project_id'], S(c)['project_id']), gates=('joins_ok',))
row(A, 'entailed_source_scope_kind', 'append_source_scope_kind', 'scope_mismatch', '/source/scope_kind',
    'the payload scope_kind is the original owner scope', 'eq',
    lambda c, m: EQ(P(c)['scope_kind'], S(c)['scope_kind']), gates=('joins_ok',),
    when=lambda c, m: P(c)['project_id'] == S(c)['project_id'])
entailed('append_source_scope_kind', ['append_source_project'],
         'The owner_fact schema ties scope_kind to project_id exactly as the payload schema does (const application '
         'with project_id type null, or the Backup/Restore allOf if scope_kind project then project_id a string, else '
         'null; Plans/event_payloads/w3e/*.schema.json #/$defs/owner_fact). The row is gated on joins_ok (both '
         'schemas passed) and applies only when the payload and manifest project_id are equal, which forces equal '
         'scope_kind; a differing scope_kind always has differing project_id values, which append_source_project '
         'refuses.')
row(A, 'append_source_scope', 'append_record_scope', 'scope_mismatch', '/source/after_record',
    'Project Backup/Restore carries its one actual Project; Full Server Backup and server_full Restore are '
    'application scope (BRS-1401/BRS-1410)', 'eq',
    lambda c, m: EQ([S(c)['scope_kind'], S(c)['project_id']], list(record_scope(c['family'], S(c)))),
    gates=('joins_ok',), families=('backup.state_changed', 'restore.state_changed'))
row(A, 'append_source_scope', 'append_record_server', 'source_identity_mismatch', '/source/after_record',
    'the original record names the writing Server (server_id, owning_server_id or target_server_id)', 'eq',
    lambda c, m: EQ(SUBJECT(c)[RECORD_SERVER[c['family']]], P(c)['server_id']), gates=('joins_ok',),
    families=families_with(lambda f: RECORD_SERVER[f] is not None))
row(A, 'append_source_scope', 'append_writer_fence', 'stale_owner', '/source/authority_evidence/writer_fence',
    'writer_fence is the actual writer lease of the current writer context', 'eq',
    lambda c, m: EQ(ROLE(c, 'writer_fence'), c['writer']['lease_ref']), gates=('joins_ok',))
row(A, 'append_source_scope', 'append_permission', 'permission_denied',
    '/source/authority_evidence/permission_or_service_authority',
    'permission_or_service_authority is the actually granted owner authority', 'eq',
    lambda c, m: EQ(ROLE(c, 'permission_or_service_authority'), c['writer']['permission_ref']), gates=('joins_ok',))
row(A, 'append_source_scope', 'append_roles_genuine', 'authority_evidence_mismatch', '/source/authority_evidence',
    'every other fixed role equals the genuine evidence the owner holds for it, role by role (null only where the '
    'owner holds none; no all-true flag or substituted receipt)', 'eq',
    lambda c, m: EQ([ROLE(c, r) for r in ROLES[c['family']][2:]],
                    [c['owner']['roles'][r] for r in ROLES[c['family']][2:]]), gates=('joins_ok',))

row(A, 'append_source_state', 'append_before_current', 'predecessor_mismatch', '/source/before_record',
    'the before record is the owner\'s own current predecessor (or null where the owner holds none)', 'eq',
    lambda c, m: EQ(record_digest(BEFORE(c)), c['owner']['current_before']), gates=('joins_ok',))
row(A, 'append_source_state', 'append_after_settled', 'postcondition_mismatch', '/source/after_record',
    'the after record is the owner\'s settled original after-state', 'eq',
    lambda c, m: EQ(record_digest(AFTER(c)), c['owner']['settled_after']), gates=('joins_ok',))
row(A, 'append_source_state', 'append_before_subject', 'predecessor_mismatch', '/source/before_record',
    'the predecessor is the same subject as the after record', 'eq',
    lambda c, m: EQ(BEFORE(c)[SUBJECT_ID[c['family']]], AFTER(c)[SUBJECT_ID[c['family']]]), gates=('has_before',),
    families=tuple(SUBJECT_ID))

# append: each payload subject field and the original owner fact it copies (one row per field name) --------------------
JOIN_FIELDS = tuple(sorted({j[0] for f in FAMILIES for j in JOINS[f]}))
JOIN_SPEC = {(f, j[0]): (j[1], j[2]) for f in FAMILIES for j in JOINS[f]}
for _i, _field in enumerate(JOIN_FIELDS):
    row(A, chunk('append_join', _i), 'append_join_' + _field, 'source_identity_mismatch', '/event/payload/' + _field,
        'payload ' + _field + ' equals the immutable original owner fact it copies (per-family source in JOINS)', 'eq',
        (lambda k: lambda c, m: EQ(P(c)[k], join_source(S(c), *JOIN_SPEC[(c['family'], k)])))(_field),
        gates=('joins_ok',), families=families_with(lambda f, k=_field: (f, k) in JOIN_SPEC))

# append: owner domain predicates the owner record schemas do not already decide (one predicate per row) -------------------
DOMAIN = 'owner_predicate_failed'
F_REV, F_CAT, F_MIS, F_PREF = ('server.client_revoked', 'server.catalog_changed', 'server.identity_mismatch_detected',
                               'remote_access.route_preference_changed')
F_PROXY, F_TEST, F_TRUST, F_END = ('remote_access.proxy_state_changed', 'remote_access.route_test_completed',
                                   'server.client_trust_changed', 'server.endpoint_changed')
F_PAIR, F_BACKUP = 'server.client_pairing_state_changed', 'backup.state_changed'
PUBLIC_ROUTES = ['funnel_public', 'reverse_proxy_public']
DATA_VERIFIED = ['sampled_data_passed', 'full_data_read_passed']
row(A, 'append_domain_1', 'dom_revoked_generation', DOMAIN, '/source/after_record/effective_trust_generation',
    'SRV-1413: effective_trust_generation equals previous_trust_generation plus one', 'eq',
    lambda c, m: EQ(AFTER(c)['effective_trust_generation'], AFTER(c)['previous_trust_generation'] + 1),
    gates=('joins_ok',), families=(F_REV,))
row(A, 'append_domain_1', 'dom_revoked_sessions', DOMAIN, '/source/after_record/revoked_session_ids',
    'SRV-1413: every actual active session at the revocation fence is terminated (the owner\'s own enumeration, never '
    'a conveniently incomplete caller set)', 'eq',
    lambda c, m: EQ(sorted(AFTER(c)['revoked_session_ids']), sorted(c['owner']['active_sessions'])),
    gates=('joins_ok',), families=(F_REV,))
row(A, 'append_domain_1', 'dom_catalog_increases', DOMAIN, '/source/after_record/catalog_revision',
    'SRV-1411: a changed Catalog revision strictly increases over the exact prior revision', 'gt',
    lambda c, m: {'presented': AFTER(c)['catalog_revision'], 'floor': BEFORE(c)['catalog_revision']},
    gates=('has_before',), families=(F_CAT,))
row(A, 'append_domain_1', 'dom_mismatch_unequal', DOMAIN, '/source/after_record/observed_fingerprint',
    'SRV-1419: a mismatch requires unequal expected and observed fingerprints', 'ne',
    lambda c, m: NE(AFTER(c)['observed_fingerprint'], AFTER(c)['expected_fingerprint']),
    gates=('joins_ok',), families=(F_MIS,))
row(A, 'append_domain_1', 'dom_mismatch_expected_material', DOMAIN, '/source/after_record/expected_fingerprint',
    'SRV-1419: the expected fingerprint is recomputed from the owner-held expected public identity material', 'eq',
    lambda c, m: EQ(AFTER(c)['expected_fingerprint'], _sha(c['owner']['identity_material']['expected'])),
    gates=('joins_ok',), families=(F_MIS,))
row(A, 'append_domain_1', 'dom_mismatch_observed_material', DOMAIN, '/source/after_record/observed_fingerprint',
    'SRV-1419: the observed fingerprint is recomputed from the owner-held observed public identity material', 'eq',
    lambda c, m: EQ(AFTER(c)['observed_fingerprint'], _sha(c['owner']['identity_material']['observed'])),
    gates=('joins_ok',), families=(F_MIS,))
row(A, 'append_domain_1', 'dom_preference_changed', DOMAIN, '/source/after_record/remote_route_id',
    'RAS-1407: an unchanged selection creates no event (the new preferred route differs from the previous one)', 'ne',
    lambda c, m: NE(AFTER(c)['remote_route_id'], BEFORE(c)['remote_route_id']), gates=('has_before',),
    families=(F_PREF,))
row(A, 'append_domain_1', 'dom_preference_verified', DOMAIN, '/source/after_record/identity_verification',
    'RAS-1407: the preferred target route is identity-verified', 'eq',
    lambda c, m: EQ(AFTER(c)['identity_verification'], 'verified'), gates=('joins_ok',), families=(F_PREF,))
row(A, 'append_domain_2', 'dom_proxy_route_type', DOMAIN, '/source/after_record/route_type',
    'RAS-1403: a proxy state is a reverse_proxy_public RemoteRouteRecord', 'eq',
    lambda c, m: EQ(AFTER(c)['route_type'], 'reverse_proxy_public'), gates=('joins_ok',), families=(F_PROXY,))
row(A, 'append_domain_2', 'dom_test_fingerprints', DOMAIN, '/source/after_record/observed_server_fingerprint',
    'RAS-1409: a passed test has equal observed and expected Server fingerprints', 'eq',
    lambda c, m: EQ(AFTER(c)['observed_server_fingerprint'], AFTER(c)['expected_server_fingerprint']),
    gates=('joins_ok',), families=(F_TEST,), when=lambda c, m: AFTER(c)['terminal_status'] == 'passed')
row(A, 'append_domain_2', 'dom_test_public_security', DOMAIN, '/source/after_record/public_security_result',
    'RAS-1409: a passed public-route test needs its public-security checks passed', 'eq',
    lambda c, m: EQ(AFTER(c)['public_security_result'], 'passed'), gates=('joins_ok',), families=(F_TEST,),
    when=lambda c, m: AFTER(c)['terminal_status'] == 'passed' and AFTER(c)['route_type'] in PUBLIC_ROUTES)
row(A, 'append_domain_2', 'dom_trust_generation_current', DOMAIN, '/source/after_record/trust_generation',
    'SRV-1414: the mutation uses the owner\'s current trust generation', 'eq',
    lambda c, m: EQ(AFTER(c)['trust_generation'], c['owner']['current_generations']['trust_generation']),
    gates=('joins_ok',), families=(F_TRUST,))
row(A, 'append_domain_2', 'dom_trust_policy_current', DOMAIN, '/source/after_record/policy_generation',
    'SRV-1414: the mutation uses the owner\'s current policy generation', 'eq',
    lambda c, m: EQ(AFTER(c)['policy_generation'], c['owner']['current_generations']['policy_generation']),
    gates=('joins_ok',), families=(F_TRUST,))
row(A, 'append_domain_2', 'dom_endpoint_same_server', DOMAIN, '/source/after_record/server_id',
    'SRV-1418: an endpoint change preserves its parent Server', 'eq',
    lambda c, m: EQ(AFTER(c)['server_id'], BEFORE(c)['server_id']), gates=('has_before',), families=(F_END,))
row(A, 'append_domain_2', 'dom_pairing_identity_words', DOMAIN, '/source/after_record/observed_server_fingerprint',
    'SRV-1412: complete pairing requires the matching identity (observed equals expected Server fingerprint)', 'eq',
    lambda c, m: EQ(AFTER(c)['observed_server_fingerprint'], AFTER(c)['expected_server_fingerprint']),
    gates=('joins_ok',), families=(F_PAIR,), when=lambda c, m: AFTER(c)['state'] == 'complete')
row(A, 'append_domain_3', 'dom_backup_verified_receipt', DOMAIN, '/source/after_record/verification_receipt_ref',
    'BRS-1401: a data-verified level requires an actual verification receipt', 'ne',
    lambda c, m: NE(AFTER(c)['verification_receipt_ref'], None), gates=('joins_ok',), families=(F_BACKUP,),
    when=lambda c, m: AFTER(c)['integrity_verification_level'] in DATA_VERIFIED)

# append: first-receipt custody (SP-286 / CV-339 v2) ---------------------------------------------------------------------
for _k in RECEIPT_SLOTS:
    row(A, 'append_receipt_slots', 'append_receipt_slot_' + _k, 'shared_number_rule_refusal',
        '/receipt_custody/first_append_receipt/' + _k,
        'the receipt ' + _k + ' is Storage\'s exact uint64 (shared storage_uint64)', 'none',
        (lambda k: lambda c, m: V(reason_of(storage_uint64, FR(c)[k])))(_k), gates=('producer_ok',),
        when=(lambda k: lambda c, m: _receipt_or_none(c) is not None and k in FR(c))(_k))
row(A, 'append_receipt_slots', 'append_receipt_physical', 'shared_number_rule_refusal', '/receipt_custody',
    'the receipt custody value encodes under SP-1100 EVENT_VALUE', 'none',
    lambda c, m: V(physical_reason(c.get('receipt_custody'))), gates=('rc_slots_ok',))
row(A, 'append_receipt_slots', 'append_receipt_schema', 'receipt_mismatch', '/receipt_custody',
    'the full CV-339 custody_v2 owner schema accepts it (closed eleven-field AppendReceipt; acknowledged_at_utc '
    'through the shared date-time checker)', 'empty',
    lambda c, m: V(schema_errors(RECEIPT_ID, '/$defs/custody_v2', RC(c))), gates=('rc_phys_ok',))
row(A, 'append_receipt_join_1', 'append_receipt_full_consumption', 'invalid_exact_string', '/receipt_custody',
    'every anchored owner pattern in the receipt custody consumes its whole string (digests, no trailing LF)', 'empty',
    lambda c, m: V(strict_errors(RECEIPT_ID, '/$defs/custody_v2', RC(c))), gates=('rc_ok',))
for _i, _k in enumerate(RECEIPT_FIELDS):
    row(A, chunk('append_receipt_join', _i + 1), 'append_receipt_' + _k, 'receipt_mismatch',
        '/receipt_custody/first_append_receipt/' + _k,
        'the original first receipt ' + _k + ' equals Storage\'s own record', 'eq',
        (lambda k: lambda c, m: EQ(FR(c)[k], c['storage_record'][k]))(_k), gates=('rc_strict_ok',))
for _i, (_k, _words, _expected, _code) in enumerate((
        ('event_id', 'custody names this event', lambda c, m: E(c)['event_id'], 'receipt_mismatch'),
        ('idempotency_key', 'custody carries this event\'s idempotency_key', lambda c, m: E(c)['idempotency_key'],
         'receipt_mismatch'),
        ('event_type', 'custody carries this event\'s event_type', lambda c, m: E(c)['event_type'], 'receipt_mismatch'),
        ('scope_partition', 'custody names the partition appended to', lambda c, m: c['scope_partition'],
         'receipt_mismatch'),
        ('storage_instance_id', 'custody is in this Storage instance', lambda c, m: STORAGE_INSTANCE_ID,
         'receipt_mismatch'),
        ('producer_semantic_digest', 'custody commits the CV-317 producer-semantic digest recomputed from the event',
         lambda c, m: m.get('digest'), 'receipt_mismatch'))):
    row(A, 'append_receipt_custody', 'append_receipt_custody_' + _k, _code, '/receipt_custody/' + _k, _words, 'eq',
        (lambda k, x: lambda c, m: EQ(RC(c)[k], x(c, m)))(_k, _expected), gates=('rc_strict_ok', 'env_ok'),
        when=None if _k != 'producer_semantic_digest' else (lambda c, m: m.get('digest') is not None))
row(A, 'append_receipt_custody', 'append_receipt_full_value', 'full_value_mismatch',
    '/receipt_custody/original_event_value_commitment/sha256',
    'custody commits the CV-339 full-value commitment recomputed from the event', 'eq',
    lambda c, m: EQ(RC(c)['original_event_value_commitment']['sha256'], m.get('full_value')),
    gates=('rc_strict_ok', 'env_ok'))
row(A, 'entailed_receipt_ack_profile', 'append_receipt_ack_profile', 'shared_timestamp_rule_refusal',
    '/receipt_custody/first_append_receipt/acknowledged_at_utc',
    'acknowledged_at_utc passes shared date_time with the receipt profile switch (RECEIPT_ACK_PROFILE)', 'none',
    lambda c, m: V(reason_of(date_time, FR(c)['acknowledged_at_utc'], profile=RECEIPT_ACK_PROFILE)),
    gates=('rc_ok',))
entailed('append_receipt_ack_profile', ['append_receipt_schema'],
         'RECEIPT_ACK_PROFILE (scripts/pm_w3e_event_oracles.py, the single switch) is EVENT_RECORD while Jared decides '
         'the AppendReceipt profile. Plans/event_append_receipt_contracts.schema.json $defs/AppendReceipt declares '
         'acknowledged_at_utc {"type":"string","minLength":1,"format":"date-time"}, and append_receipt_schema validates '
         'custody_v2 with format_checker(profile=EVENT_RECORD) (DATETIME_FORMATS), whose date-time check is '
         'date_time(value, profile=EVENT_RECORD) == value (scripts/pm_event_datetime.py:98-115). This row is gated on '
         'rc_ok (that schema passed), so any value it would refuse under EVENT_RECORD is refused first by '
         'append_receipt_schema. Switching RECEIPT_ACK_PROFILE to STORAGE_UTC_Z makes this row reachable ('
         '+00:00, lowercase z) with no other change.')

# append: the SP-14xx custody value (canonical source/pending/terminal custody) ----------------------------------------
row(A, 'append_custody_1', 'append_custody_physical', 'shared_number_rule_refusal', '/custody',
    'the custody value encodes under SP-1100 EVENT_VALUE', 'none', lambda c, m: V(physical_reason(c.get('custody'))),
    gates=('custody_inputs_ok',))
row(A, 'append_custody_1', 'append_custody_schema', 'custody_schema', '/custody',
    'the family $defs/custody owner schema accepts the custody value in full (state allOf kept)', 'empty',
    lambda c, m: V(schema_errors(PAYLOAD_PTR(c), '/$defs/custody', CUS(c))), gates=('cus_phys_ok',))
row(A, 'append_custody_1', 'append_custody_full_consumption', 'invalid_exact_string', '/custody',
    'every anchored owner pattern in the custody value consumes its whole string', 'empty',
    lambda c, m: V(strict_errors(PAYLOAD_PTR(c), '/$defs/custody', CUS(c))), gates=('cus_ok',))
CUSTODY_JOINS = (
    ('storage_instance_id', 'custody is in this Storage instance', lambda c: STORAGE_INSTANCE_ID),
    ('server_id', 'custody names the payload\'s writing Server', lambda c: P(c)['server_id']),
    ('scope_partition', 'custody names the partition appended to', lambda c: c['scope_partition']),
    ('owner_operation_id', 'custody names the payload\'s owner operation', lambda c: P(c)['owner_operation_id']),
    ('event_id', 'custody names this event', lambda c: E(c)['event_id']),
    ('append_result_ref', 'settled custody names the SP-286 first-append result of this event',
     lambda c: first_receipt_ref(E(c)['event_id'])),
    ('state', 'custody is settled only with the actual CV-339 first full-value result', lambda c: 'settled'),
    ('intent_ref', 'custody retains the owner\'s original intent reference', lambda c: c['owner']['custody_refs']['intent_ref']),
    ('before_source_ref', 'custody retains the owner\'s before-source reference (null exactly when no predecessor)',
     lambda c: c['owner']['custody_refs']['before_source_ref']),
    ('after_source_ref', 'custody retains the owner\'s after-source reference',
     lambda c: c['owner']['custody_refs']['after_source_ref']),
    ('semantic_input_ref', 'custody retains the owner\'s semantic-input reference',
     lambda c: c['owner']['custody_refs']['semantic_input_ref']),
    ('original_owner_result_ref', 'custody retains the manifest\'s original owner result',
     lambda c: S(c)['original_result_ref']),
)
for _i, (_k, _words, _x) in enumerate(CUSTODY_JOINS):
    row(A, chunk('append_custody_join', _i), 'append_custody_' + _k, 'custody_mismatch', '/custody/' + _k, _words,
        'eq', (lambda k, x: lambda c, m: EQ(CUS(c)[k], x(c)))(_k, _x),
        gates=(('cus_strict_ok', 'joins_ok') if _k == 'original_owner_result_ref' else ('cus_strict_ok', 'pay_strict_ok')))
row(A, 'append_custody_digest', 'append_custody_semantic_digest', 'custody_mismatch',
    '/custody/producer_semantic_digest', 'custody commits the CV-317 producer-semantic digest recomputed from the event',
    'eq', lambda c, m: EQ(CUS(c)['producer_semantic_digest'], m.get('digest')), gates=('cus_strict_ok', 'env_ok'),
    when=lambda c, m: m.get('digest') is not None)

# append: body, SP-337 pack ----------------------------------------------------------------------------------------------
PACK = lambda c: c['payload_pack']  # noqa: E731
row(A, 'append_body_1', 'append_pack_shape', 'payload_mismatch', '/payload_pack',
    'a referenced body has its four-member SP-337 descriptor (raw bytes, size, id, media type)', 'true',
    lambda c, m: V(m.get('pack_shape')), gates=('pack_route',))
row(A, 'append_body_1', 'append_pack_ref', 'payload_mismatch', '/event/payload_ref',
    'payload_ref is blake3:<payload_id> of that descriptor', 'eq',
    lambda c, m: EQ(E(c)['payload_ref'], 'blake3:' + PACK(c)['payload_id']), gates=('pack_route', 'pack_shape'))
row(A, 'append_body_1', 'append_pack_hex', 'payload_unavailable', '/payload_pack/raw_hex',
    'the pack bytes are present (hex decodes)', 'true', lambda c, m: V(m.get('pack_raw') is not None),
    gates=('pack_route', 'pack_shape'))
row(A, 'append_body_1', 'append_pack_size', 'payload_mismatch', '/payload_pack/byte_size',
    'byte_size is the exact current integer length of the pack bytes (shared verify_payload_bytes)', 'member',
    lambda c, m: {'presented': m.get('pack_reason'),
                  'collection': [None, 'payload_id_type', 'payload_digest', 'payload_media']},
    gates=('pack_route', 'pack_shape'), when=lambda c, m: m.get('pack_raw') is not None)
row(A, 'append_body_1', 'append_pack_id', 'payload_mismatch', '/payload_pack/payload_id',
    'payload_id is 64 lowercase hex (shared verify_payload_bytes)', 'ne',
    lambda c, m: NE(m.get('pack_reason'), 'payload_id_type'), gates=('pack_route', 'pack_shape'),
    when=lambda c, m: m.get('pack_raw') is not None)
row(A, 'append_body_2', 'append_pack_digest', 'payload_mismatch', '/payload_pack/payload_id',
    'payload_id is the BLAKE3 digest of the pack bytes (shared verify_payload_bytes)', 'ne',
    lambda c, m: NE(m.get('pack_reason'), 'payload_digest'), gates=('pack_route', 'pack_shape'),
    when=lambda c, m: m.get('pack_raw') is not None)
row(A, 'append_body_2', 'append_pack_media', 'payload_mismatch', '/payload_pack/media_type',
    'the pack media type is application/json (shared verify_payload_bytes)', 'ne',
    lambda c, m: NE(m.get('pack_reason'), 'payload_media'), gates=('pack_route', 'pack_shape'),
    when=lambda c, m: m.get('pack_raw') is not None)
row(A, 'append_body_2', 'append_pack_body', 'payload_mismatch', '/payload_pack/raw_hex',
    'the pack bytes are exactly the SP-236 encoding of the logical payload body', 'eq',
    lambda c, m: EQ(PACK(c)['raw_hex'], pack_value(P(c)).hex()), gates=('pack_route', 'pack_shape'),
    when=lambda c, m: m.get('pack_raw') is not None and m.get('pack_reason') is None)

# append/derived: whole-value 16 KiB limits (SP-337 inline body; SP-340 each stored value) --------------------------------

def _pattern_is_ascii(pattern):
    """True when every string the pattern can consume is ASCII: the pattern text is ASCII and, outside character
    classes and (?!...) lookaheads (which consume nothing), it has no '.', \\S, \\W, \\D or negated class."""
    if any(ord(ch) > 127 for ch in pattern):
        return False
    i, depth_skip, in_class = 0, 0, False
    while i < len(pattern):
        ch = pattern[i]
        if ch == '\\':
            if not in_class and depth_skip == 0 and pattern[i + 1:i + 2] in ('S', 'W', 'D'):
                return False
            i += 2
            continue
        if in_class:
            in_class = ch != ']'
        elif pattern.startswith('(?!', i):
            depth_skip += 1
            i += 3
            continue
        elif ch == '(' and depth_skip:
            depth_skip += 1
        elif ch == ')' and depth_skip:
            depth_skip -= 1
        elif ch == '[':
            if depth_skip == 0 and pattern[i + 1:i + 2] == '^':
                return False
            in_class = True
        elif ch == '.' and depth_skip == 0:
            return False
        i += 1
    return True


def max_encoded_bytes(node, resolver=None):
    """An upper bound on the SP-236 MessagePack size of any value the schema node accepts, or None when the schema
    does not bound it. A string costs at most 5 header bytes plus maxLength UTF-8 characters (4 bytes each, 1 when its
    owner pattern consumes only ASCII); an integer at most 9 bytes; a closed object its 5-byte header plus every
    declared member's key and value."""
    node, resolver = _resolve(node, resolver or REGISTRY.resolver())
    if not isinstance(node, dict):
        return None
    if 'const' in node:
        return len(pack_value(node['const']))
    if 'enum' in node:
        return max(len(pack_value(v)) for v in node['enum'])
    branches = node.get('anyOf') or node.get('oneOf')
    if branches and 'type' not in node:
        sizes = [max_encoded_bytes(b, resolver) for b in branches]
        return None if None in sizes else max(sizes)
    kind = node.get('type')
    kinds = kind if type(kind) is list else [kind]
    sizes = []
    for k in kinds:
        if k == 'string':
            fixed = re.fullmatch(r'\^\[[^\]]+\]\{(\d+)\}\$', node.get('pattern', ''))
            if 'maxLength' not in node and fixed is not None:
                sizes.append(5 + int(fixed.group(1)) + 1)   # the anchored pattern admits one trailing LF
                continue
            if 'maxLength' not in node and node.get('pattern', '').startswith('^(?:app|project~'):
                # SP-1401/SP-1410 scope_partition: no schema maxLength; its value is joined to the encoded payload
                # project_id (append_partition, *_scope_partition rows), at most 256 characters of at most 4 UTF-8
                # bytes each: 'project~' plus ceil(1024 * 4 / 3) base64url characters.
                sizes.append(5 + 8 + 1366)
                continue
            if 'maxLength' not in node:
                return None
            per = 1 if ('pattern' in node and _pattern_is_ascii(node['pattern'])) else 4
            sizes.append(5 + per * node['maxLength'])
        elif k in ('integer', 'number'):
            sizes.append(9)
        elif k in ('boolean', 'null'):
            sizes.append(1)
        elif k == 'object':
            if node.get('additionalProperties') is not False:
                return None
            total = 5
            for key, sub in node.get('properties', {}).items():
                value = max_encoded_bytes(sub, resolver)
                if value is None:
                    return None
                total += len(pack_value(key)) + value
            sizes.append(total)
        elif k == 'array':
            if 'maxItems' not in node:
                return None
            item = max_encoded_bytes(node.get('items', {}), resolver)
            if item is None:
                return None
            sizes.append(5 + node['maxItems'] * item)
        else:
            return None
    return max(sizes) if sizes else None


def value_bound(family, pointer):
    return max_encoded_bytes({'$ref': PAYLOAD_ID[family] + ('#' + pointer if pointer else '')})


PAYLOAD_BOUND = {f: value_bound(f, '') for f in FAMILIES}
CUSTODY_BOUND = {f: value_bound(f, '/$defs/custody') for f in FAMILIES}
HISTORY_BOUND = {f: value_bound(f, '/$defs/history') for f in FAMILIES}
assert all(PAYLOAD_BOUND[f] is not None and PAYLOAD_BOUND[f] < INLINE_LIMIT for f in FAMILIES), PAYLOAD_BOUND
assert all(CUSTODY_BOUND[f] is not None and CUSTODY_BOUND[f] < INLINE_LIMIT for f in FAMILIES), CUSTODY_BOUND
assert all(HISTORY_BOUND[f] is not None and HISTORY_BOUND[f] < INLINE_LIMIT for f in FAMILIES), HISTORY_BOUND

row(A, 'entailed_inline_limit', 'append_inline_limit', 'value_too_large', '/event/payload',
    'an inline body (payload_ref null) is at most 16 KiB of SP-236 bytes (SP-337)', 'at_most',
    lambda c, m: {'presented': len(pack_value(P(c))), 'limit': INLINE_LIMIT}, gates=('pay_ok',),
    when=lambda c, m: E(c)['payload_ref'] is None)
entailed('append_inline_limit', ['append_payload_schema'],
         'Every one of the twenty closed payload schemas bounds its SP-236 encoding below 16384 bytes: '
         'max_encoded_bytes (scripts/pm_w3e_event_oracles.py) walks each schema with every $ref resolved and charges a '
         'string 5 + maxLength * 4 bytes (1 per character when its owner pattern consumes only ASCII, checked by '
         '_pattern_is_ascii), an integer 9, a closed object its header plus every declared member; the largest bound '
         'is ' + str(max(PAYLOAD_BOUND.values())) + ' bytes (restore.state_changed), asserted at module load. The row '
         'is gated on pay_ok (append_payload_schema passed), so a larger inline body is always refused first by '
         'append_payload_schema. W3E has no owner-valid payload above 16 KiB; the SP-337 pack route is exercised by '
         'the pack controls with genuine externalized bodies.')
row(A, 'entailed_custody_size', 'append_custody_size', 'value_too_large', '/custody',
    'the custody value is at most 16 KiB of SP-236 bytes (SP-340)', 'at_most',
    lambda c, m: {'presented': len(pack_value(CUS(c))), 'limit': INLINE_LIMIT}, gates=('cus_strict_ok', 'pay_strict_ok'),
    when=lambda c, m: CUS(c)['scope_partition'] == c['scope_partition'])
entailed('append_custody_size', ['append_custody_schema', 'append_custody_scope_partition'],
         'max_encoded_bytes bounds every $defs/custody below 16384 bytes (largest ' + str(max(CUSTODY_BOUND.values()))
         + ', asserted at module load). The one member the schema leaves unbounded, the SP-1401/SP-1410 '
         'scope_partition, is charged 1379 bytes because this row applies only when it equals the case partition, '
         'which append_partition joins to the encoded payload project_id (at most 256 characters, 1024 UTF-8 bytes, '
         '1374 partition characters); a different partition is refused first by append_custody_scope_partition.')

# retry ----------------------------------------------------------------------------------------------------------------------
R = 'retry'
RE_ = lambda c: c['retry_event']  # noqa: E731
row(R, 'retry_1', 'retry_event_object', 'retry_event_schema', '/retry_event',
    'the retry candidate is a JSON object', 'true', lambda c, m: V(type(RE_(c)) is dict))
row(R, 'retry_1', 'retry_event_physical', 'shared_number_rule_refusal', '/retry_event',
    'the retry candidate encodes under SP-1100 EVENT_VALUE', 'none',
    lambda c, m: V(physical_reason(RE_(c))), when=lambda c, m: type(RE_(c)) is dict)
row(R, 'retry_1', 'retry_envelope_schema', 'retry_event_schema', '/retry_event',
    'the full EventRecord owner schema accepts the retry candidate (shared CV-1101 date-time checker)', 'empty',
    lambda c, m: V(schema_errors(EVENT_RECORD_ID, '', RE_(c))), gates=('retry_phys_ok',))
row(R, 'retry_1', 'retry_event_id', 'idempotency_conflict', '/retry_event/event_id',
    'the retry preserves the original event_id', 'eq', lambda c, m: EQ(RE_(c).get('event_id'), E(c)['event_id']),
    gates=('retry_ok',))
row(R, 'retry_1', 'retry_idempotency_key', 'idempotency_conflict', '/retry_event/idempotency_key',
    'the retry preserves the original idempotency_key', 'eq',
    lambda c, m: EQ(RE_(c).get('idempotency_key'), E(c)['idempotency_key']), gates=('retry_ok',))
row(R, 'retry_1', 'retry_replay_only', 'replay_only_not_appendable', '/retry_event/replay_policy',
    'a retry never selects projector_replay_only (shared current_append_policy)', 'ne',
    lambda c, m: NE(m.get('retry_policy_reason'), 'replay_only_not_appendable'), gates=('retry_ok',))
row(R, 'retry_1', 'retry_semantic', 'idempotency_conflict', '/retry_event',
    'the retry\'s complete CV-317 producer-semantic digest equals the original\'s (Storage metadata excluded)', 'eq',
    lambda c, m: EQ(m.get('retry_digest'), m.get('digest')), gates=('retry_ok',),
    when=lambda c, m: (RE_(c).get('event_id') == E(c)['event_id'] and
                       RE_(c).get('idempotency_key') == E(c)['idempotency_key'] and
                       m.get('retry_policy_reason') != 'replay_only_not_appendable'))
row(R, 'retry_2', 'retry_sealed_count', 'receipt_mismatch', '/sealed_store',
    'exactly one sealed receipt holds the original start record', 'eq',
    lambda c, m: EQ(len(m.get('sealed_matches')), 1))
row(R, 'retry_2', 'retry_custody', 'receipt_mismatch', '/retry_returned_receipt_hex',
    'a lost-ack retry returns the original sealed receipt', 'eq',
    lambda c, m: EQ(c['retry_returned_receipt_hex'], m.get('sealed_matches')[0]['receipt_hex']),
    when=lambda c, m: len(m.get('sealed_matches')) == 1)
row(R, 'retry_2', 'retry_no_new_event', 'replay_side_effect', '/retry_sequence_unchanged',
    'an unchanged original creates no new event (re-delivery returns the immutable original result)', 'true',
    lambda c, m: V(c['retry_sequence_unchanged']))

# derived: history row ------------------------------------------------------------------------------------------------------
D = 'derived'
row(D, 'history_1', 'history_slot_sequence', 'shared_number_rule_refusal', '/history/sequence_id',
    'history sequence_id is Storage\'s exact uint64 (shared storage_uint64)', 'none',
    lambda c, m: V(reason_of(storage_uint64, H(c)['sequence_id'])),
    when=lambda c, m: type(c.get('history')) is dict and 'sequence_id' in H(c))
row(D, 'history_1', 'history_physical', 'shared_number_rule_refusal', '/history',
    'the history value encodes under SP-1100 EVENT_VALUE', 'none',
    lambda c, m: V(physical_reason(H(c))), gates=('hist_slot_ok',))
row(D, 'history_1', 'history_schema', 'history_schema', '/history',
    'the family $defs/history owner schema accepts the row in full', 'empty',
    lambda c, m: V(schema_errors(PAYLOAD_PTR(c), '/$defs/history', H(c))), gates=('hist_phys_ok',))
row(D, 'history_1', 'history_full_consumption', 'invalid_exact_string', '/history',
    'every anchored owner pattern in the history row consumes its whole string', 'empty',
    lambda c, m: V(strict_errors(PAYLOAD_PTR(c), '/$defs/history', H(c))), gates=('hist_ok',))
HISTORY_JOINS = (
    ('storage_instance_id', 'history is in this Storage instance', lambda c: STORAGE_INSTANCE_ID),
    ('server_id', 'history names the payload\'s writing Server', lambda c: P(c)['server_id']),
    ('scope_partition', 'history names the event\'s Storage partition', lambda c: c['scope_partition']),
    ('owner_operation_id', 'history names the payload\'s owner operation', lambda c: P(c)['owner_operation_id']),
    ('event_id', 'history references the original event', lambda c: E(c)['event_id']),
    ('sequence_id', 'history carries Storage\'s canonical sequence', lambda c: c['storage_record']['sequence_id']),
    ('payload_ref', 'history references the original payload (SP-337 ref, or the inline original record)',
     lambda c: history_payload_ref(E(c))),
    ('source_custody_ref', 'history references the original custody named by the payload',
     lambda c: P(c)['source_custody_ref']),
    ('projection_generation_ref', 'history carries the publication generation it is projected under',
     lambda c: c['projection_generation']),
)
for _i, (_k, _words, _x) in enumerate(HISTORY_JOINS):
    row(D, chunk('history_join', _i), 'history_' + _k, 'history_mismatch', '/history/' + _k, _words, 'eq',
        (lambda k, x: lambda c, m: EQ(H(c)[k], x(c)))(_k, _x), gates=('hist_strict_ok',))
row(D, 'entailed_history_size', 'history_size', 'value_too_large', '/history',
    'the history value is at most 16 KiB of SP-236 bytes (SP-340)', 'at_most',
    lambda c, m: {'presented': len(pack_value(H(c))), 'limit': INLINE_LIMIT}, gates=('hist_strict_ok',),
    when=lambda c, m: H(c)['scope_partition'] == c['scope_partition'])
entailed('history_size', ['history_schema', 'history_scope_partition'],
         'max_encoded_bytes bounds every $defs/history below 16384 bytes (largest ' + str(max(HISTORY_BOUND.values()))
         + ', asserted at module load); its unbounded scope_partition is charged 1379 bytes because this row applies '
         'only when it equals the case partition (see append_custody_size), and a different partition is refused first '
         'by history_scope_partition.')

# derived: checkpoint wrapper and body ---------------------------------------------------------------------------------------
row(D, 'checkpoint_1', 'checkpoint_physical', 'shared_number_rule_refusal', '/checkpoint',
    'the checkpoint wrapper encodes under SP-1100 EVENT_VALUE', 'none',
    lambda c, m: V(physical_reason(CK(c))), when=lambda c, m: type(c.get('checkpoint')) is dict)
row(D, 'checkpoint_1', 'checkpoint_ref_byte_size', 'shared_number_rule_refusal', '/checkpoint/body_ref/byte_size',
    'body_ref.byte_size is a current integer of at least 1 (shared current_integer)', 'none',
    lambda c, m: V(reason_of(current_integer, CK(c)['body_ref']['byte_size'], minimum=1)), gates=('ck_wphys_ok',),
    when=lambda c, m: type(CK(c).get('body_ref')) is dict and 'byte_size' in CK(c)['body_ref'])
row(D, 'checkpoint_1', 'checkpoint_body_pack', 'checkpoint_body_unavailable', '/checkpoint_body_pack',
    'a referenced body\'s SP-337 bytes are held (hex decodes)', 'true', lambda c, m: V(m.get('ck_raw') is not None),
    gates=('ck_ref_route',))
row(D, 'checkpoint_1', 'checkpoint_body_decodes', 'checkpoint_body_unavailable', '/checkpoint_body_pack',
    'the referenced body bytes decode as canonical SP-236 (shared decode_storage_value)', 'none',
    lambda c, m: V(m.get('ck_decoded')['reason']), gates=('ck_ref_ok',))
row(D, 'checkpoint_1', 'checkpoint_body_id', 'checkpoint_body_mismatch', '/checkpoint/body_ref/blake3_id',
    'body_ref.blake3_id is the BLAKE3 of the held body bytes', 'eq',
    lambda c, m: EQ(CK(c)['body_ref'].get('blake3_id'), blake3.blake3(m.get('ck_raw')).hexdigest()),
    gates=('ck_ref_ok',))
row(D, 'checkpoint_1', 'checkpoint_body_size', 'checkpoint_body_mismatch', '/checkpoint/body_ref/byte_size',
    'body_ref.byte_size is the exact length of the held body bytes', 'eq',
    lambda c, m: EQ(CK(c)['body_ref'].get('byte_size'), len(m.get('ck_raw'))), gates=('ck_ref_ok',))
for _i, (_n, _p) in enumerate(BODY_SLOTS):
    row(D, chunk('checkpoint_slots', _i), 'checkpoint_slot_' + _n, 'shared_number_rule_refusal',
        '/checkpoint_body/' + '/'.join(_p), 'checkpoint body ' + '.'.join(_p) + ' is Storage\'s exact uint64 '
        '(shared storage_uint64)', 'none', (lambda p: lambda c, m: V(slot_reason(m.get('body'), p)))(_p),
        gates=('body_resolved',))
row(D, 'checkpoint_2', 'checkpoint_schema', 'checkpoint_schema', '/checkpoint',
    'the family $defs/checkpoint owner schema accepts the wrapper in full (oneOf route; an inline body through its '
    '$defs/checkpoint_body)', 'empty', lambda c, m: V(schema_errors(PAYLOAD_PTR(c), '/$defs/checkpoint', CK(c))),
    gates=('ck_wphys_ok',),
    when=lambda c, m: (reason_of(current_integer, (CK(c).get('body_ref') or {}).get('byte_size', 1), minimum=1) is None
                       and (m.get('ck_ref_route') or m.get('body_slots_ok'))))
row(D, 'checkpoint_2', 'checkpoint_body_schema', 'checkpoint_schema', '/checkpoint_body',
    'the resolved SP-337 body passes the same $defs/checkpoint_body schema (ref route)', 'empty',
    lambda c, m: V(schema_errors(PAYLOAD_PTR(c), '/$defs/checkpoint_body', m.get('body'))),
    gates=('ck_wrapper_ok', 'ck_ref_route', 'body_resolved', 'body_slots_ok'))
row(D, 'checkpoint_2', 'checkpoint_full_consumption', 'invalid_exact_string', '/checkpoint',
    'every anchored owner pattern in the wrapper consumes its whole string', 'empty',
    lambda c, m: V(strict_errors(PAYLOAD_PTR(c), '/$defs/checkpoint', wrapper_without_body(c))), gates=('ck_wrapper_ok',))
row(D, 'checkpoint_2', 'checkpoint_body_full_consumption', 'invalid_exact_string', '/checkpoint_body',
    'every anchored owner pattern in the body consumes its whole string (generation id, digests, segment name)',
    'empty', lambda c, m: V(strict_errors(PAYLOAD_PTR(c), '/$defs/checkpoint_body', m.get('body'))), gates=('body_ok',))
row(D, 'checkpoint_2', 'checkpoint_inline_size', 'value_too_large', '/checkpoint',
    'an inline-body wrapper is at most 16 KiB of SP-236 bytes (SP-340, the entire stored wrapper); a larger body takes '
    'the body_ref route', 'at_most', lambda c, m: {'presented': len(pack_value(CK(c))), 'limit': INLINE_LIMIT},
    gates=('ck_wrapper_ok',), when=lambda c, m: CK(c).get('body_inline') is not None)
for _i, (_k, _x) in enumerate((('storage_instance_id', lambda c: STORAGE_INSTANCE_ID),
                               ('server_id', lambda c: P(c)['server_id']),
                               ('scope_partition', lambda c: c['scope_partition']))):
    row(D, 'checkpoint_2', 'checkpoint_' + _k, 'checkpoint_mismatch', '/checkpoint/' + _k,
        'the checkpoint ' + _k + ' is the original\'s', 'eq', (lambda k, x: lambda c, m: EQ(CK(c)[k], x(c)))(_k, _x),
        gates=('ck_wstrict_ok',))
for _i, _site in enumerate(('storage_instance_id', 'source_selection')):
    row(D, 'checkpoint_uuid', 'checkpoint_uuid_' + _site, 'invalid_exact_string',
        '/checkpoint_body/generic_read_token/' + ('' if _i == 0 else 'source_selection/') + 'storage_instance_id',
        'the token uuid is the RFC 4122 string form in full (the jsonschema uuid check accepts }, _ and extra '
        'hyphens)', 'true',
        (lambda i: lambda c, m: V(fullmatch(UUID_RE, TOKEN(m)['storage_instance_id'] if i == 0
                                            else TOKEN(m)['source_selection']['storage_instance_id'])))(_i),
        gates=('body_strict_ok',))
TOKEN_FIELDS = ('storage_instance_id', 'checkpoint_key', 'checkpoint_ref', 'generation_id', 'generation_anchor_sha256',
                'frontier_revision', 'frontier_sha256', 'index_dataset_name', 'source_selection')
for _i, _k in enumerate(TOKEN_FIELDS):
    row(D, chunk('checkpoint_token', _i), 'checkpoint_token_' + _k, 'stale_read_token',
        '/checkpoint_body/generic_read_token/' + _k,
        'the persisted durable token ' + _k + ' equals Storage\'s actual SP-278 read state', 'eq',
        (lambda k: lambda c, m: EQ(TOKEN(m)[k], c['index_state'][k]))(_k), gates=('token_uuid_ok',))
CURSOR_FIELDS = (('segment_generation', 'segment_generation'), ('segment_name', 'segment_name'),
                 ('byte_offset', 'byte_offset'), ('frame_end_offset', 'durable_end_offset'),
                 ('last_sequence_id', 'sequence_id'), ('last_event_id', 'event_id'))
for _i, (_k, _s) in enumerate(CURSOR_FIELDS):
    row(D, 'checkpoint_cursor', 'checkpoint_cursor_' + _k, 'cursor_mismatch', '/checkpoint_body/last_examined_cursor/' + _k,
        'inclusive restart: the last examined frame ' + _k + ' is Storage\'s own frame ' + _s, 'eq',
        (lambda k, s: lambda c, m: EQ(CURSOR(m)[k], c['storage_record'][s]))(_k, _s), gates=('body_strict_ok',))
row(D, 'checkpoint_publication', 'checkpoint_projection_generation', 'checkpoint_mismatch',
    '/checkpoint_body/projection_generation_ref', 'the checkpoint publishes the projection generation the history row '
    'is projected under', 'eq', lambda c, m: EQ(m.get('body')['projection_generation_ref'], c['projection_generation']),
    gates=('body_strict_ok',))
row(D, 'checkpoint_publication', 'checkpoint_revision_cas', 'checkpoint_cas_failed',
    '/checkpoint_body/publication_revision', 'the publication revision advances exactly one over the prior checkpoint '
    '(prior-value CAS)', 'eq',
    lambda c, m: EQ(m.get('body')['publication_revision'], c['prior_publication_revision'] + 1), gates=('body_strict_ok',))
row(D, 'checkpoint_publication', 'checkpoint_status_current', 'checkpoint_mismatch', '/checkpoint_body/status',
    'a current advance publishes status current (degraded and withdrawn never advance)', 'eq',
    lambda c, m: EQ(m.get('body')['status'], 'current'), gates=('body_strict_ok',))
row(D, 'checkpoint_publication', 'checkpoint_cas_expected', 'checkpoint_cas_failed', '/cas_expected_matches',
    'the stored prior checkpoint is exactly the expected prior value', 'true',
    lambda c, m: V(c['cas_expected_matches']))
row(D, 'checkpoint_publication', 'checkpoint_atomic', 'checkpoint_cas_failed', '/transaction_committed',
    'history rows and the checkpoint commit in one redb transaction', 'true', lambda c, m: V(c['transaction_committed']))

# withdrawal / rebuild (scenario model) --------------------------------------------------------------------------------------
W_ = 'withdrawal'
row(W_, 'withdrawal', 'withdrawal_cutoff', 'withdrawn', '/writer_cutoff_applied',
    'writers are fenced (cutoff recorded) before withdrawal', 'true', lambda c, m: V(c['writer_cutoff_applied']))
row(W_, 'withdrawal', 'withdrawal_once', 'withdrawn', '/withdrawal_marks',
    'the publication is withdrawn exactly once', 'eq', lambda c, m: EQ(c['withdrawal_marks'], 1))
row(W_, 'withdrawal', 'withdrawal_fence', 'withdrawn', '/reader_fenced',
    'readers/projectors are fenced from the withdrawn publication', 'true', lambda c, m: V(c['reader_fenced']))
row(W_, 'withdrawal', 'successor_rebuild', 'withdrawn', '/successor_verified',
    'a verified shadow successor is rebuilt before the atomic switch', 'true', lambda c, m: V(c['successor_verified']))
row(W_, 'withdrawal', 'replay_side_effects', 'replay_side_effect', '/replay_effects',
    'replay changes only the owned derived projection/checkpoint (no command, network test, pairing or canonical '
    'write)', 'empty', lambda c, m: V(c['replay_effects']))
row(W_, 'withdrawal', 'outcome_honest', 'outcome_mismatch', '/reported_outcome',
    'a failed or unavailable outcome is never reported as success', 'eq',
    lambda c, m: EQ(c['reported_outcome'], c['actual_outcome']))

# retained history: SP-1101 dispatch, the frozen verifier's checks and read effects ---------------------------------------
T = 'retained'
RES = lambda m: m.get('retained')['reason']  # noqa: E731
DISPATCH_ROWS = (
    ('retained_recipe_override', 'caller_recipe_override', '/retained_recipe_override',
     'a caller-supplied recipe override is refused by the shared dispatcher (resolve(recipe_override=...))'),
    ('retained_query', 'original_query', '/original_ref', 'the request names one original'),
    ('retained_receipt_present', 'original_receipt_missing', '/sealed_store',
     'a sealed receipt exists for this exact original (missing: bytes preserved, unavailable)'),
    ('retained_receipt_unique', 'original_receipt_ambiguous', '/sealed_store',
     'exactly one sealed receipt resolves the original (ambiguous: unavailable, never guessed)'),
    ('retained_receipt_wellformed', 'sealed_receipt_malformed', '/sealed_store',
     'the sealed receipt row is complete and well formed (members of the right type)'),
    ('retained_binding', 'original_binding', '/sealed_store/*/binding',
     'the sealed receipt binds this exact original (not another original)'),
    ('retained_recipe_known', 'recipe_unknown', '/sealed_store/*/recipe',
     'the sealed recipe is in the frozen map installed outside the request'),
    ('retained_disclosure', 'current_disclosure', '/disclosure_allowed',
     'current read permission and deletion visibility allow the disclosure'),
)
for _rid, _reason, _field, _words in DISPATCH_ROWS:
    row(T, 'retained_dispatch', _rid, _reason, _field, _words, 'ne',
        (lambda reason: lambda c, m: NE(RES(m), reason))(_reason))
FZ = lambda m: m.get('frozen')  # noqa: E731
FROZEN_ROWS = (
    ('frozen_decodes', 'decodes', 'true', 'the sealed record, receipt and result bytes decode (SP-236)'),
    ('frozen_envelope_schema', 'envelope_schema', 'empty',
     'the original passes the frozen EventRecord schema with the shared date-time checker'),
    ('frozen_family', 'family', 'true', 'the original is one of the twenty W3E families'),
    ('frozen_payload_schema_id', 'payload_schema_id', 'eq', 'the original payload_schema_id is its family\'s'),
    ('frozen_recipe_family', 'recipe_family', 'eq', 'the sealed recipe is the recipe of the original\'s payload schema'),
    ('frozen_observed_utc_z', 'observed_utc_z', 'none',
     'the retained Storage observed_at_utc keeps CV-253 storage_utc_z (CV-1101)'),
    ('frozen_persisted_utc_z', 'persisted_utc_z', 'none',
     'the retained Storage persisted_at_utc keeps CV-253 storage_utc_z (CV-1101)'),
    ('frozen_payload_schema', 'payload_schema', 'empty', 'the original payload passes its frozen family schema'),
    ('frozen_payload_full_consumption', 'payload_full_consumption', 'empty',
     'the original payload\'s anchored patterns consume their whole strings'),
    ('frozen_identity', 'identity', 'eq', 'the original event_id is its recomputed w3e@1 identity'),
    ('frozen_key', 'key', 'eq', 'the original idempotency_key is its recomputed key'),
    ('frozen_source_commitment', 'source_commitment', 'eq',
     'the sealed binding commits the original\'s full value (CV-339)'),
    ('frozen_result_event_id', 'result_event_id', 'eq', 'the sealed append result names the original'),
    ('frozen_receipt_schema', 'receipt_schema', 'empty', 'the sealed custody passes the frozen custody_v2 schema'),
    ('frozen_receipt_semantic', 'receipt_semantic', 'eq',
     'the sealed custody commits the original\'s producer-semantic digest'),
    ('frozen_receipt_full_value', 'receipt_full_value', 'eq', 'the sealed custody commits the original\'s full value'),
    ('frozen_receipt_event_id', 'receipt_event_id', 'eq', 'the sealed custody names the original'),
)
for _i, (_rid, _comp, _kind, _words) in enumerate(FROZEN_ROWS):
    if _kind == 'eq':
        _inputs = (lambda comp: lambda c, m: EQ(FZ(m)[comp][0], FZ(m)[comp][1]))(_comp)
    else:
        _inputs = (lambda comp: lambda c, m: V(FZ(m)[comp]))(_comp)
    row(T, chunk('retained_frozen', _i, 6), _rid, 'original_verification', '/sealed_store/*/record_hex',
        _words, _kind, _inputs, when=(lambda comp: lambda c, m: comp in FZ(m))(_comp))
row(T, 'retained_effects', 'retained_dispatcher_verdict', 'original_verification', '/sealed_store',
    'the shared dispatcher itself refuses original_verification exactly when a frozen component fails (the installed '
    'verifier, as RetainedDispatcher ran it)', 'eq',
    lambda c, m: EQ(RES(m) == 'original_verification',
                    any(not component_holds(k, v) for k, v in FZ(m).items())),
    when=lambda c, m: RES(m) in (None, 'original_verification', 'current_disclosure') and bool(FZ(m)))
row(T, 'retained_effects', 'retained_no_receipt_creation', 'receipt_created_on_read', '/sealed_store',
    'reading creates no receipt: the sealed store is identical before and after resolve', 'eq',
    lambda c, m: EQ(m.get('retained')['store_after'], m.get('retained')['store_before']))
row(T, 'retained_effects', 'retained_no_current_gate', 'retained_current_gate', '/event/replay_policy',
    'the shared current writer gate (current_append_policy) is never called during a retained read', 'eq',
    lambda c, m: EQ(m.get('retained')['gate_calls'], 0))
row(T, 'retained_effects', 'retained_family_withdrawn', 'withdrawn', '/family_withdrawn',
    'the family is not withdrawn for readers', 'false', lambda c, m: V(c['family_withdrawn']))
row(T, 'retained_effects', 'retained_original_withdrawn', 'withdrawn', '/original_withdrawn',
    'the original is not withdrawn', 'false', lambda c, m: V(c['original_withdrawn']))
row(T, 'retained_effects', 'retained_rebuild', 'historical_rebuild', '/rebuild_matches',
    'a verified rebuild yields the same derived state', 'true', lambda c, m: V(c['rebuild_matches']))
HANDLED_REASONS = sorted({r for _r, r, _f, _w in DISPATCH_ROWS} | {'original_verification'})
row(T, 'entailed_retained_resolved', 'retained_resolved', 'unsupported_history_recipe', '/sealed_store',
    'the dispatcher returned the original or a refusal an earlier row owns', 'handled',
    lambda c, m: {'presented': RES(m), 'handled': HANDLED_REASONS})


def _line(fn):
    import inspect
    return inspect.getsourcelines(fn)[1]


def _span(fn):
    import inspect
    lines, start = inspect.getsourcelines(fn)
    return '%d-%d' % (start, start + len(lines) - 1)


_SELF = 'scripts/pm_w3e_event_oracles.py'
entailed('retained_resolved', [r for r, _x, _f, _w in DISPATCH_ROWS] + [r[0] for r in FROZEN_ROWS] +
         ['retained_no_current_gate'],
         'RetainedDispatcher.resolve (scripts/pm_event_numbers.py:523-545) refuses itself only with '
         'caller_recipe_override, original_query, original_authority, original_binding, recipe_selection, '
         'recipe_unknown, original_bytes_type, original_verification or current_disclosure; any other reason is raised '
         'by the owner or by the frozen verifier. (1) Owner: SealedReceiptOwner.authenticated_original (' + _SELF + ':'
         + _span(SealedReceiptOwner.authenticated_original) + ') raises only original_receipt_missing and '
         'original_receipt_ambiguous, then _custody_from_sealed (' + _SELF + ':' + _span(_custody_from_sealed) + '), '
         'which refuses sealed_receipt_malformed unless the row has exactly SEALED_KEYS, a binding with exactly '
         'BINDING_FIELDS, a recipe with exactly RECIPE_FIELDS and three even-length lowercase-hex strings (so '
         'bytes.fromhex cannot raise). The shared constructors refuse a wrong-typed or wrong-valued member by '
         'themselves (scripts/pm_event_numbers.py:442-485: RecipeTuple.__post_init__ recipe_tuple :460 or '
         'recipe_resource_hash :462; OriginalBinding.__post_init__ original_binding :481 or original_scope :484), and '
         '_custody_from_sealed catches every such Refusal and re-raises it as sealed_receipt_malformed. So the owner '
         'raises only original_receipt_missing, original_receipt_ambiguous and sealed_receipt_malformed, and '
         'otherwise returns an OriginalCustody of an OriginalBinding, a RecipeTuple and three bytes values, so '
         'original_authority, recipe_selection and original_bytes_type cannot occur. AccessLoggingOwner raises '
         'exactly what its parent raises. (2) Request: retained_request (' + _SELF + ':' + _span(retained_request) +
         ') returns an OriginalBinding or None, and None is refused by the dispatcher as original_query. (3) Frozen '
         'verifier: _frozen_verify is the conjunction of frozen_components (' + _SELF + ':' + _span(frozen_components)
         + '), which raises no Refusal: decoding refusals are caught; the date-time checks go through reason_of; '
         'producer_semantic_digest refusals are caught; full_value_commitment (scripts/pm_event_numbers.py:405-412) '
         'runs only on a record that decoded canonically and passed the frozen EventRecord schema, whose schema_id and '
         'schema_version consts exclude full_value_edition; event_id_of and idempotency_key_of hash schema-valid '
         'strings. So the verifier returns True or False, and the dispatcher reports False as original_verification. '
         'The negative-only frozen map current_gated may raise the current writer gate\'s own reason; it calls the '
         'instrumented gate whenever the verifier runs, so retained_no_current_gate refuses first. Every reason that '
         'remains has its own dispatch row. So this catch-all never refuses first.')


# ---- Tables, the checker's refusal path -------------------------------------------------------------------------------

def build_tables():
    tables, order = {}, []
    for r in ROWS:
        if r['table'] not in tables:
            tables[r['table']] = []
            order.append(r['table'])
        tables[r['table']].append(r)
    for table, rows in tables.items():
        assert len(rows) <= 8, (table, len(rows))
        assert len({r['boundary'] for r in rows}) == 1, table
        entailed_rows = [r['id'] for r in rows if r['id'] in ENTAILED]
        assert not entailed_rows or (table.startswith('entailed_') and len(rows) == 1), table
    boundary_tables = {b: [t for t in order if tables[t][0]['boundary'] == b] for b in BOUNDARIES}
    return tables, order, boundary_tables


TABLE_ROWS, TABLES, BOUNDARY_TABLES = build_tables()
ROW_TABLE = {r['id']: r['table'] for r in ROWS}
ENTAILED_TABLES = frozenset(t for t in TABLES if t.startswith('entailed_'))


@functools.lru_cache(maxsize=None)
def table_module(table):
    return importlib.import_module(TABLE_PREFIX + table)


def project_table(table, case, memo):
    return {r['id']: record_for(r, case, memo) for r in TABLE_ROWS[table]}


def evaluate(case, boundary, memo=None):
    """The complete checker for one boundary: every table predicate in table order. Returns
    ([(row, code), ...] refusals in order, {table: projected value})."""
    memo = memo or Memo(case)
    refusals, values = [], {}
    for table in BOUNDARY_TABLES[boundary]:
        module = table_module(table)
        value = project_table(table, case, memo)
        values[table] = value
        for name in module.FIELDS:
            code = getattr(module, name)(value, None)
            if code is not None:
                refusals.append((name, code))
    return refusals, values


def boundary_errors(case, boundary):
    return [code for _row, code in evaluate(case, boundary)[0]]


CONTROL_BOUNDARY = {'append': 'append', 'append-before': 'append', 'append-project': 'append',
                    'append-project-before': 'append', 'append-public': 'append', 'pack': 'append',
                    'retry': 'retry', 'retry-storage-meta': 'retry', 'derived': 'derived', 'derived-ref': 'derived',
                    'derived-large': 'derived', 'append-longref': 'append', 'derived-longref': 'derived',
                    'withdrawal': 'withdrawal', 'retained': 'retained',
                    'retained-live': 'retained', 'compatibility': 'retained', 'retained-offset': 'retained',
                    'retained-project': 'retained'}


def case_boundary(case_id):
    return CONTROL_BOUNDARY[case_id.split(':')[0]]


# ---- Controls (valid originals) ---------------------------------------------------------------------------------------

def other_family(family):
    return FAMILIES[(FAMILIES.index(family) + 1) % len(FAMILIES)]


LONG_DATASET = 'event_record_index.v2@' + 'd' * 17000


def set_index_dataset(case, name):
    """Storage's live index generation names a long dataset (owner-valid: index_dataset_name has no maximum)."""
    case['index_state']['index_dataset_name'] = name


def build_controls():
    controls = []
    for family in FAMILIES:
        base = build_case(family, 'control:' + family)
        controls.append(('append:' + family, copy.deepcopy(base)))
        before = build_case(family, 'control-before:' + family, with_before=True)
        controls.append(('append-before:' + family, copy.deepcopy(before)))
        if 'project' in SCOPES[family]:
            project = build_case(family, 'control-project:' + family, scope='project')
            controls.append(('append-project:' + family, copy.deepcopy(project)))
            controls.append(('append-project-before:' + family,
                             build_case(family, 'control-project-before:' + family, scope='project', with_before=True)))
            controls.append(('retained-project:' + family, copy.deepcopy(project)))
        if family == F_TEST:
            public = copy.deepcopy(base)
            public['source']['after_record'].update(route_type='funnel_public', public_security_result='passed')
            reissue(public)
            rebuild_payload(public)
            controls.append(('append-public:' + family, resync(public)))
        controls.append(('pack:' + family, with_pack(copy.deepcopy(base))))
        controls.append(('retry:' + family, copy.deepcopy(base)))
        # Standing check 6: Storage-assigned metadata is outside the retry comparison.
        meta = copy.deepcopy(base)
        meta['retry_event'].update(sequence_id=77, observed_at_utc='2026-11-05T11:00:01Z',
                                   persisted_at_utc='2026-11-05T11:00:02Z')
        controls.append(('retry-storage-meta:' + family, meta))
        controls.append(('derived:' + family, copy.deepcopy(before)))
        ref = copy.deepcopy(before)
        ref['checkpoint_route'] = 'ref'
        controls.append(('derived-ref:' + family, resync(ref)))
        # SP-1400..1419: a checkpoint body above 16 KiB takes its closed body_inline=null / body_ref route, and the
        # complete resolved body is validated under the same token fence.
        large = copy.deepcopy(before)
        set_index_dataset(large, LONG_DATASET)
        large['checkpoint_route'] = 'ref'
        controls.append(('derived-large:' + family, resync(large)))
        # The longest owner-valid custody reference (payload source_custody_ref maxLength 2048) is copied unchanged into
        # the history row (its schema domain now matches the payload's).
        longref = copy.deepcopy(before)
        long_ref = 'custody:' + 'r' * 2040
        longref['owner']['custody_refs']['custody_ref'] = long_ref
        longref['event']['payload']['source_custody_ref'] = long_ref
        resync(longref)
        controls.append(('append-longref:' + family, longref))
        controls.append(('derived-longref:' + family, copy.deepcopy(longref)))
        controls.append(('withdrawal:' + family, copy.deepcopy(base)))
        controls.append(('retained:' + family, copy.deepcopy(before)))
        # A later live-state change: the live writer admission, the writer lease and permission, the owner's current
        # predecessor/settled records and its issuance record all change after the write. The retained original
        # still verifies from its sealed receipt alone.
        live = copy.deepcopy(before)
        live['live']['admitted'] = False
        live['writer'].update(server_id='server:home-02', lease_ref='lease:writer-home-02-g9',
                              permission_ref='permission:revoked')
        live['owner'].update(issued_digest=_sha('later-issuance'), current_before=_sha('later-before'),
                             settled_after=_sha('later-after'))
        live['dedupe_caught_up'] = False
        controls.append(('retained-live:' + family, live))
        compat = copy.deepcopy(before)
        compat['event']['replay_policy'] = 'projector_replay_only'
        controls.append(('compatibility:' + family, resync(compat)))
        # Valid when written under the broad EventRecord profile: lowercase t, a nonzero offset and a long fraction
        # on the occurrence time (CV-1101); the retained read keeps the exact original string.
        offset = copy.deepcopy(before)
        offset['event']['occurred_at_utc'] = '2026-11-05t12:00:00.123456789012+02:00'
        controls.append(('retained-offset:' + family, resync(offset)))
    return controls


# ---- Negatives: one defect each, built from a named control -------------------------------------------------------------

OTHER_UUID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d'
UUID_DEFECTS = ((lambda v: v + '}', 'trailing brace (accepted by the jsonschema uuid check)'),
                (lambda v: v[:28] + '-' + v[28:], 'extra hyphen (accepted by the jsonschema uuid check)'),
                (lambda v: v[:3] + '_' + v[4:], 'underscore digit separator (accepted by the jsonschema uuid check)'))
LONG_INT = 10 ** 4399
WRONG_TYPES_STR = ((7, 'an integer'), (None, 'null'), (['x'], 'an array'), ({'k': 'v'}, 'an object'))


def _set_path(node, path, value):
    for part in path[:-1]:
        node = node[part]
    node[path[-1]] = value


def _get_path(node, path):
    for part in path:
        node = node[part]
    return node


def _value(path, value):
    return lambda c: _set_path(c, path, copy.deepcopy(value))


def _suffix(path, suffix):
    return lambda c: _set_path(c, path, _get_path(c, path) + suffix)


def _repack(sealed, field, value):
    sealed[field] = pack_value(value).hex()


def _decoded(sealed, field):
    return decode_storage_value(bytes.fromhex(sealed[field]), profile=EVENT_VALUE)


def leaf_paths(node, path=()):
    """Every string and boolean leaf (with its path) of a JSON value, arrays included."""
    if type(node) is dict:
        for k, v in node.items():
            yield from leaf_paths(v, path + (k,))
    elif type(node) is list:
        for i, v in enumerate(node):
            yield from leaf_paths(v, path + (i,))
    elif type(node) in (str, bool):
        yield path, node


def string_defects(value, light=False):
    if light:
        return [(value + '\n', 'trailing LF'), (7, 'an integer'), (None, 'null')]
    out = [(value + '\n', 'trailing LF'), (value + ' ', 'trailing space'), ('', 'empty'), ('a' * 3000, '3000 chars')]
    return out + [(v, label) for v, label in WRONG_TYPES_STR]


def bool_defects(value):
    return (('true' if value else 'false', 'string boolean'), (1 if value else 0, 'integer for a boolean'),
            (None, 'null'))


def subject_site_negatives(value, oracle, budget=None, light=False):
    """(path, defect value, label, expected row) for each string/boolean leaf of a subject: the defect is kept only
    when the owner schema (or its full-consumption copy) refuses it, and the row it names is the one that refuses."""
    out = []
    for path, leaf in leaf_paths(value):
        defects = string_defects(leaf, light) if type(leaf) is str else bool_defects(leaf)[:2 if light else 3]
        for bad, label in defects:
            trial = copy.deepcopy(value)
            _set_path(trial, path, bad)
            expected = oracle(trial, path)
            if expected is not None:
                out.append((path, bad, label, expected))
    return out[:budget] if budget else out


def _root_object_negatives(value, oracle):
    out = []
    trial = copy.deepcopy(value)
    trial['unexpected_member'] = 'x'
    expected = oracle(trial, ('unexpected_member',))
    if expected is not None:
        out.append(('add', 'unexpected_member', 'unknown member', expected))
    for key in list(value):
        trial = copy.deepcopy(value)
        trial.pop(key)
        expected = oracle(trial, (key,))
        if expected is not None:
            out.append(('pop', key, 'missing ' + key, expected))
    return out


def _schema_oracle(root_id, pointer, schema_row, strict_row):
    def oracle(trial, _path):
        if physical_reason(trial) is not None:
            return None
        if oracle_refuses(root_id, pointer, trial):
            return schema_row
        if oracle_refuses(root_id, pointer, trial, strict=True):
            return strict_row
        return None
    return oracle


def _enum_values(family, field):
    """The enum/const values the payload schema admits at a field (through $ref and anyOf/oneOf)."""
    out = []

    def walk(node, resolver):
        node, resolver = _resolve(node, resolver)
        if not isinstance(node, dict):
            return
        if 'const' in node:
            out.append(node['const'])
        out.extend(node.get('enum', []))
        for branch in node.get('anyOf', []) + node.get('oneOf', []):
            walk(branch, resolver)
    walk(PAYLOAD_SCHEMA[family]['properties'][field],
         REGISTRY.resolver_with_root(Resource.from_contents(PAYLOAD_SCHEMA[family], default_specification=DRAFT202012)))
    return out


def _join_alternatives(value):
    """Schema-valid stand-ins for a joined value (the join row then refuses)."""
    if type(value) is bool:
        return [not value]
    if type(value) is int:
        return [value + 1]
    if type(value) is str:
        if re.fullmatch(r'[0-9a-f]{64}', value):
            return [('0' if value[0] != '0' else '1') * 64]
        return [value + 'x']
    return []


def _always_false_verify(custody):
    """A faulty frozen verifier (negative only): it rejects a genuine original. The dispatcher verdict row refuses it;
    every frozen component still holds."""
    return False


FROZEN_MAPS['always_false'] = {recipe_tuple(f): FrozenRecipe(verify_original=_always_false_verify) for f in FAMILIES}


# Families whose structurally identical subjects (receipt custody, custody, history, checkpoint: the same closed
# shapes in every family apart from the schema ids, consumer and the Backup/Restore partition grammar) get the full
# per-leaf defect set; every other family gets the light set (trailing LF, integer, null) on each leaf.
SITE_SAMPLE = ('backup.state_changed', 'remote_access.route_test_completed', 'server.client_revoked',
               'server.discovery_observed')


def build_negatives(controls, families=None):
    by_id = dict(controls)
    negatives = []

    def add(rid, family, control_id, mutate, mode, defect):
        bad = copy.deepcopy(by_id[control_id])
        mutate(bad)
        if mode == 'full':
            resync(bad)
        elif mode == 'no_identity':
            resync(bad, identity=False)
        elif mode == 'reissue':
            reissue(bad)
            resync(bad)
        elif mode == 'source':
            reissue(bad)
            rebuild_payload(bad)
            resync(bad)
        else:
            assert mode == 'none', mode
        negatives.append({'row': rid, 'boundary': ROW_BY_ID[rid]['boundary'], 'family': family,
                          'control': control_id, 'defect': defect, 'case': bad})

    for family in (families or FAMILIES):
        other = other_family(family)
        ac, bc, pc, rc = 'append:' + family, 'append-before:' + family, 'pack:' + family, 'retry:' + family
        dc, drc, dlc, wc = 'derived:' + family, 'derived-ref:' + family, 'derived-large:' + family, 'withdrawal:' + family
        tc = 'retained:' + family
        project = 'project' in SCOPES[family]
        apc, apbc = 'append-project:' + family, 'append-project-before:' + family
        base, before_case = by_id[ac], by_id[bc]

        def N(rid, mutate, mode, defect, control=ac):
            add(rid, family, control, mutate, mode, defect)

        # ---- append: admission and numbers --------------------------------------------------------------------
        N('append_event_object', _value(('event',), 'not-an-event'), 'none', 'EventRecord is a string')
        N('append_event_object', _value(('event',), []), 'none', 'EventRecord is an array')
        N('append_event_object', _value(('event', 'payload'), 'x'), 'none', 'payload is a string')
        N('append_family_known', lambda c: c.update(family='server.unknown_family'), 'none', 'unknown family')
        N('append_admitted', lambda c: c['live'].update(admitted=False), 'none', 'current writer lacks admission')
        N('append_admitted', lambda c: c['live'].update(admitted='true'), 'none', 'string boolean admission')
        N('append_dedupe', lambda c: c.update(dedupe_caught_up=False), 'none', 'dedupe not caught up')
        N('append_dedupe', lambda c: c.update(dedupe_caught_up=1), 'none', 'integer for a boolean')
        for value, label in ((1 << 64, '2**64'), (-1, '-1'), (LONG_INT, '10**4399'), (-LONG_INT, '-10**4399'),
                             ('41', 'string number'), (41.5, 'float'), (41.0, 'integral float'), (True, 'boolean'),
                             (None, 'null'), ([41], 'array'), ({'v': 41}, 'object')):
            N('append_sequence_uint64', _value(('event', 'sequence_id'), value), 'none', 'sequence_id ' + label)
        for value, label in ((1 << 64, '2**64'), (LONG_INT, '10**4399'), (-(1 << 63) - 1, '-(2**63)-1'),
                             (-LONG_INT, '-10**4399')):
            N('append_event_physical', _value(('event', 'payload', 'extra_member'), value), 'none',
              'payload extra member ' + label)
            N('append_event_physical', _value(('event', 'payload', 'server_id'), value), 'none',
              'payload server_id (a string slot) holds integer ' + label)
            for slot, _b in PAYLOAD_SLOTS[family]:
                N('append_event_physical', _value(('event', 'payload', slot), value), 'none',
                  'payload integer slot ' + slot + ' holds ' + label)
        N('append_event_physical', _value(('event', 'migration', 'migration_id'), 1 << 64), 'none',
          'envelope migration_id holds integer 2**64')
        for slot, (low, high) in PAYLOAD_SLOTS[family]:
            control = ac if base['event']['payload'].get(slot) is not None else bc
            current = by_id[control]['event']['payload'][slot]
            variants = [(float(current), 'integral float (jsonschema accepts it as integer)'), (True, 'boolean'),
                        (str(current), 'string number')]
            if low is not None:
                variants.append((low - 1, 'below the owner minimum %d' % low))
            if high is not None:
                variants.append((high + 1, 'above the owner maximum'))
            for value, label in variants:
                N('append_slot_' + slot, _value(('event', 'payload', slot), value), 'full', slot + ' ' + label,
                  control=control)

        # ---- append: envelope ---------------------------------------------------------------------------------
        N('append_envelope_schema', _value(('event', 'schema_version'), '1.0.0'), 'full', 'envelope schema_version')
        N('append_envelope_schema', _value(('event', 'producer_sequence_id'), -1), 'full', 'producer_sequence_id -1')
        N('append_envelope_schema', _value(('event', 'event_type'), 'Server.X'), 'full', 'event_type pattern')
        N('append_envelope_schema', _value(('event', 'redaction_profile'), 'bogus'), 'full', 'redaction_profile enum')
        N('append_envelope_schema', _value(('event', 'payload_ref'), 7), 'full', 'payload_ref integer')
        for value, label in (('2026-11-05T10:00:01', 'missing zone'), ('2026-11-05T10:00:01Z\n', 'trailing LF'),
                             ('2026-11-05T24:00:01Z', 'hour 24'), ('2026-11-05 10:00:01Z', 'space separator'),
                             ('2026-11-05T10:00:60Z', 'false leap second'), ('2026-11-31T10:00:01Z', 'day 31')):
            N('append_envelope_schema', lambda c, v=value: set_storage_time(c, 'observed_at_utc', v), 'full',
              'observed_at_utc ' + label)
        N('append_envelope_schema', lambda c: set_storage_time(c, 'persisted_at_utc', '2026-11-05T10:00:02+24:00'),
          'full', 'persisted_at_utc offset hour 24')
        N('append_envelope_schema', _value(('event', 'occurred_at_utc'), '2026-02-30T10:00:00Z'), 'full',
          'occurred_at_utc 30 February')
        N('append_envelope_schema', _value(('event', 'occurred_at_utc'), '2026-11-05T10:00:00.Z'), 'full',
          'occurred_at_utc empty fraction')
        N('append_envelope_schema', lambda c: c['event'].update(scope_kind='application', project_id='project:x')
          if c['event']['scope_kind'] == 'application' else c['event'].update(project_id=None), 'full',
          'envelope scope allOf: project_id against scope_kind')
        N('append_event_type', _value(('event', 'event_type'), other), 'full', 'event_type of another family')
        N('append_event_type', _value(('event', 'event_type'), family + '\n'), 'full',
          'event_type with trailing LF (the anchored owner pattern accepts it)')
        N('append_payload_schema_id', _value(('event', 'payload_schema_id'), PAYLOAD_SCHEMA_IDS[other]), 'full',
          'payload_schema_id of another family')
        for field in ('observed_at_utc', 'persisted_at_utc'):
            rid = 'append_' + field.replace('_at_utc', '') + '_utc_z'
            for value, label in (('2026-11-05T10:00:01+00:00', '+00:00'), ('2026-11-05T10:00:01-00:00', '-00:00'),
                                 ('2026-11-05T10:00:01z', 'lowercase z'), ('2026-11-05T12:00:01+02:00', 'offset')):
                N(rid, lambda c, f=field, v=value: set_storage_time(c, f, v), 'full', field + ' ' + label)
        N('append_replay_only', _value(('event', 'replay_policy'), 'projector_replay_only'), 'full',
          'current write selects projector_replay_only')
        for link in ('thread_id', 'run_id', 'node_id', 'attempt_id'):
            N('append_' + link + '_null', _value(('event', link), link.split('_')[0] + ':fabricated-1'), 'full',
              'fabricated ' + link)
        N('append_storage_event_id', _value(('storage_record', 'event_id'), 'w3e@1:' + '1' * 64), 'no_identity',
          'Storage record names another event')
        N('append_storage_sequence_id', _value(('storage_record', 'sequence_id'), 42), 'no_identity',
          'event sequence differs from Storage\'s')
        N('append_storage_observed', _value(('storage_record', 'observed_at_utc'), '2026-11-05T10:00:05Z'),
          'no_identity', 'event observed time differs from Storage\'s')
        N('append_storage_persisted', _value(('storage_record', 'persisted_at_utc'), '2026-11-05T10:00:06Z'),
          'no_identity', 'event persisted time differs from Storage\'s')

        # ---- append: payload, scope, identity ------------------------------------------------------------------
        N('append_payload_schema', _value(('event', 'payload', 'extra_member'), 'x'), 'full', 'unknown member')
        N('append_payload_schema', _value(('event', 'payload', 'schema_version'), '1.0.1'), 'full', 'schema_version')
        oracle = _schema_oracle(PAYLOAD_ID[family], '', 'append_payload_schema', 'append_payload_full_consumption')
        for path, bad, label, expected in subject_site_negatives(base['event']['payload'], oracle):
            if path[0] in dict(PAYLOAD_SLOTS[family]):
                continue
            N(expected, _value(('event', 'payload') + path, bad), 'full', 'payload ' + '/'.join(map(str, path)) +
              ' ' + label)
        for kind, key, label, expected in _root_object_negatives(base['event']['payload'], oracle):
            N(expected, (lambda k: lambda c: c['event']['payload'].pop(k))(key) if kind == 'pop'
              else _value(('event', 'payload', key), 'x'), 'full', 'payload ' + label)
        if project:
            N('append_project', _value(('event', 'project_id'), 'project:other-09'), 'full',
              'envelope Project differs from the payload Project', control=apc)
            N('append_partition', _value(('scope_partition',), PROJECT_ID), 'full', 'raw project id partition',
              control=apc)
            N('append_partition', lambda c: c.update(scope_partition=c['scope_partition'] + '='), 'full',
              'padded base64url partition', control=apc)
            N('append_partition', _value(('scope_partition',), 'app'), 'full', 'application partition for a Project',
              control=apc)
        N('append_partition', lambda c: c.update(scope_partition=partition_of('project', 'project:x'))
          if c['scope_partition'] == 'app' else c.update(scope_partition='app'), 'full', 'wrong Storage partition')
        N('append_event_id', lambda c: (c['event'].update(event_id='w3e@1:' + '0' * 64),
                                        c['storage_record'].update(event_id='w3e@1:' + '0' * 64)),
          'no_identity', 'supplied event_id digest (Storage stored it under that id)')
        N('append_event_id', lambda c: (c['event'].update(event_id=event_id_of(other, c['scope_partition'],
                                                                                P(c)['server_id'],
                                                                                P(c)['owner_operation_id'])),
                                        c['storage_record'].update(event_id=c['event']['event_id'])),
          'no_identity', 'event_id recomputed under another family\'s identity domain')
        N('append_idempotency_key', _value(('event', 'idempotency_key'), 'application@1:00:00'), 'no_identity',
          'supplied idempotency_key')
        N('append_idempotency_key', lambda c: c['event'].update(
            idempotency_key=c['event']['idempotency_key'].replace(hx(P(c)['server_id']), hx('server:home-02'))),
          'no_identity', 'idempotency_key of another Server')
        N('append_writer_server', lambda c: c['writer'].update(server_id='server:home-02'), 'none',
          'payload Server is not the actual writing Server')
        for slot, _b in PAYLOAD_SLOTS[family]:
            kind, arg = JOIN_SPEC.get((family, slot), (None, None))
            if kind not in ('after', 'subject') or family in (F_REV, F_TRUST, F_CAT):
                continue   # those slots also carry an owner-domain relation (generation +1, current generation)
            for value, label in (((1 << 53) + 1, '2**53+1'), (1 << 60, '2**60'), (UINT64_MAX, 'uint64 max')):
                N('append_producer_route', _value(('source', 'after_record', arg), value), 'source',
                  'owner-valid ' + slot + ' ' + label + ' (copied into the payload): the producer route refuses it')

        # ---- append: the owner-issued source -------------------------------------------------------------------
        N('append_source_present', _value(('event', 'payload', 'source_evidence_ref'), 'w3e-fact:' + 'f' * 40),
          'full', 'source_evidence_ref names no stored manifest')
        N('append_source_authentic', _value(('source', 'source_recipe_ref'), 'recipe:substituted-edition-2'), 'none',
          'substituted manifest recipe (not owner-issued)')
        sid = SUBJECT_ID.get(family) or 'remote_route_id'
        N('append_source_authentic', lambda c, k=sid: c['source']['after_record'].update({k: AFTER(c)[k] + 'x'}),
          'none', 'substituted after-record subject (not owner-issued)')
        N('append_source_authentic', lambda c: c['source']['authority_evidence'].update(
            writer_fence='lease:forged-g1'), 'none', 'substituted writer fence (not owner-issued)')
        int_fields = [k for k, v in base['source']['after_record'].items() if type(v) is int]
        int_path = ('after_record', int_fields[0]) if int_fields else ('original_result_ref',)
        for value, label in ((1 << 64, '2**64'), (LONG_INT, '10**4399')):
            N('append_source_physical', _value(('source',) + int_path, value), 'reissue',
              'manifest ' + '.'.join(int_path) + ' holds ' + label)
        oracle = _schema_oracle(PAYLOAD_ID[family], '/$defs/owner_fact', 'append_source_schema',
                                'append_source_full_consumption')
        for control in (ac, bc):
            for path, bad, label, expected in subject_site_negatives(by_id[control]['source'], oracle, light=True):
                if path[0] == 'before_record' and control == ac:
                    continue
                if path[0] != 'before_record' and control == bc and path[0] != 'after_record':
                    continue
                N(expected, _value(('source',) + path, bad), 'reissue',
                  'manifest ' + '/'.join(map(str, path)) + ' ' + label, control=control)
        for kind, key, label, expected in _root_object_negatives(base['source'], oracle):
            N(expected, (lambda k: lambda c: c['source'].pop(k))(key) if kind == 'pop'
              else _value(('source', key), 'x'), 'reissue', 'manifest ' + label)
        for entry in OWNER_SCHEMA_DOMAIN.get(family, ()):
            path, bad, label = entry[:3]
            N('append_source_schema', _value(('source',) + path, bad), entry[3] if len(entry) > 3 else 'source',
              'owner record rule: ' + label)
        N('append_owner_operation', _value(('event', 'payload', 'owner_operation_id'), 'family-operation@1:' + '0' * 64),
          'full', 'supplied owner_operation_id')
        if not any(j[1] == 'fact' and j[2] == 'immutable_fact_id' for j in JOINS[family]):
            N('append_owner_operation', _value(('source', 'immutable_fact_id'), 'fact:other-original'), 'reissue',
              'owner operation of another immutable fact')
        N('append_source_custody_ref', _value(('event', 'payload', 'source_custody_ref'), 'custody:other-original'),
          'full', 'payload names another original\'s custody')
        N('append_source_custody_ref', lambda c: c['owner']['custody_refs'].update(custody_ref='custody:owner-other'),
          'none', 'the owner holds a different custody reference')
        N('append_source_server', _value(('source', 'server_id'), 'server:home-02'), 'reissue',
          'manifest names another Server')
        if project:
            def _other_project(c):
                c['source']['project_id'] = 'project:other-09'
                after = c['source']['after_record']
                after['project_ids' if family == F_BACKUP else 'target_project_ids'] = ['project:other-09']
            N('append_source_project', _other_project, 'reissue', 'manifest of another Project', control=apc)
            if family == F_BACKUP:
                N('append_record_scope', lambda c: c['source']['after_record'].update(
                    backup_type='full_server_backup', catalog_revision=8), 'source',
                  'Full Server Backup presented as Project scope', control=apc)
                N('append_record_scope', lambda c: c['source']['after_record'].update(
                    project_ids=['project:other-09']), 'source',
                  'Project Backup of another Project', control=apc)
            else:
                N('append_record_scope', lambda c: c['source']['after_record'].update(
                    mode='server_full', recovery_safe_mode=True), 'source',
                  'server_full Restore presented as Project scope', control=apc)
            N('append_record_scope', lambda c: c['source']['after_record'].update(
                backup_type='project_backup', project_ids=[PROJECT_ID], project_vault_ids=['project-vault:alpha'])
              if family == F_BACKUP else c['source']['after_record'].update(mode='as_new', target_project_ids=[PROJECT_ID],
                                                                              recovery_safe_mode=False),
              'source', 'Project-scoped record presented as application scope')
        if RECORD_SERVER[family] is not None:
            N('append_record_server', _value(('source', 'after_record', RECORD_SERVER[family]), 'server:home-02'),
              'reissue', 'original record of another Server')
        N('append_writer_fence', _value(('source', 'authority_evidence', 'writer_fence'), 'lease:stale-g6'), 'reissue',
          'stale writer lease')
        N('append_permission', _value(('source', 'authority_evidence', 'permission_or_service_authority'),
                                      'permission:not-granted'), 'reissue', 'permission not granted')
        joined_roles = {j[2]: j[0] for j in JOINS[family] if j[1] == 'role'}
        for role in ROLES[family][2:]:
            N('append_roles_genuine', _value(('source', 'authority_evidence', role), 'evidence:substituted:' + role),
              'source', 'substituted ' + role)
            nullable = role not in joined_roles or 'null' in json.dumps(
                PAYLOAD_SCHEMA[family]['properties'][joined_roles[role]])
            if nullable:
                N('append_roles_genuine', _value(('source', 'authority_evidence', role), None), 'source',
                  role + ' nulled while the owner holds genuine evidence')
        N('append_before_current', lambda c: c['owner'].update(current_before=_sha('later-predecessor')), 'none',
          'the predecessor is no longer the owner\'s current record', control=bc)
        N('append_before_current', lambda c: c['owner'].update(current_before=_sha('existing-record')), 'none',
          'first creation without proven absence (the owner holds a current record)')
        N('append_after_settled', lambda c: c['owner'].update(settled_after=_sha('other-settled')), 'none',
          'after-record is not the owner\'s settled state')
        if family in SUBJECT_ID:
            sid = SUBJECT_ID[family]
            N('append_before_subject', lambda c, k=sid: c['source']['before_record'].update(
                {k: BEFORE(c)[k] + 'x' if type(BEFORE(c)[k]) is str else BEFORE(c)[k]}), 'reissue',
              'predecessor of another subject', control=bc)

        # ---- append: per-field joins (foreign value and sibling swap) -------------------------------------------
        for field, kind, arg in JOINS[family]:
            control = bc if kind == 'before' or base['event']['payload'].get(field) is None else ac
            case = by_id[control]
            current = case['event']['payload'][field]
            siblings = [case['event']['payload'][f2] for f2, k2, a2 in JOINS[family]
                        if f2 != field and type(case['event']['payload'][f2]) is type(current)
                        and case['event']['payload'][f2] != current]
            enum_alts = [v for v in _enum_values(family, field) if v != current and type(v) is type(current)][:2]
            for alt, label in ([(a, 'a foreign value') for a in (enum_alts or _join_alternatives(current))] +
                               [(sv, 'the sibling value ' + repr(sv)[:40]) for sv in siblings]):
                trial = copy.deepcopy(case['event']['payload'])
                trial[field] = alt
                if oracle_refuses(PAYLOAD_ID[family], '', trial) or oracle_refuses(PAYLOAD_ID[family], '', trial, True):
                    continue
                N('append_join_' + field, _value(('event', 'payload', field), alt), 'full',
                  field + ' carries ' + label, control=control)

        # ---- append: owner domain predicates ---------------------------------------------------------------------
        for rid, mutate, mode, label, control in DOMAIN_WITNESSES.get(family, ()):
            N(rid, mutate, mode, label, control=(bc if control == 'before' else
                                                 ('append-public:' + family if control == 'public' else ac)))

        # ---- append: first-receipt custody -----------------------------------------------------------------------
        for k in RECEIPT_SLOTS:
            for value, label in ((1 << 64, '2**64'), (-1, '-1'), (3.0, 'integral float'), ('3', 'string number'),
                                 (LONG_INT, '10**4399')):
                N('append_receipt_slot_' + k, _value(('receipt_custody', 'first_append_receipt', k), value), 'none',
                  'receipt ' + k + ' ' + label)
        N('append_receipt_physical', _value(('receipt_custody', 'group_digest'), LONG_INT), 'none',
          'receipt group_digest holds 10**4399')
        N('append_receipt_physical', _value(('receipt_custody', 'extra_member'), 1 << 64), 'none',
          'receipt extra member 2**64')
        for value, label in (('garbage', 'not a time'), ('2026-11-05T10:00:03', 'missing zone'),
                             ('2026-11-05T10:00:03Z\n', 'trailing LF'), ('2026-02-30T10:00:03Z', '30 February')):
            N('append_receipt_schema', _value(('receipt_custody', 'first_append_receipt', 'acknowledged_at_utc'), value),
              'none', 'acknowledged_at_utc ' + label)
        oracle = _schema_oracle(RECEIPT_ID, '/$defs/custody_v2', 'append_receipt_schema',
                                'append_receipt_full_consumption')
        for path, bad, label, expected in (subject_site_negatives(base['receipt_custody'], oracle)
                                           if family in SITE_SAMPLE else ()):
            N(expected, _value(('receipt_custody',) + path, bad), 'none', 'receipt ' + '/'.join(map(str, path)) +
              ' ' + label)
        for kind, key, label, expected in _root_object_negatives(base['receipt_custody'], oracle):
            N(expected, (lambda k: lambda c: c['receipt_custody'].pop(k))(key) if kind == 'pop'
              else _value(('receipt_custody', key), 'x'), 'none', 'receipt ' + label)
        for k in RECEIPT_FIELDS:
            stored = base['storage_record'][k]
            if k in ('event_id', 'sequence_id'):
                alt = stored + 1 if type(stored) is int else stored + 'x'
                N('append_receipt_' + k, _value(('receipt_custody', 'first_append_receipt', k), alt), 'none',
                  'receipt ' + k + ' differs from Storage\'s record')
                continue
            alt = {'durability_class': 'ordinary', 'durability_state': 'pending',
                   'acknowledged_at_utc': '2026-11-05T10:00:04Z'}.get(k, stored + 1 if type(stored) is int else
                                                                       str(stored) + 'x')
            N('append_receipt_' + k, _value(('storage_record', k), alt), 'none',
              'Storage\'s own record has another ' + k + ' than the receipt')
        for k, alt in (('event_id', 'w3e@1:' + '1' * 64), ('idempotency_key', 'application@1:00:01'),
                       ('event_type', other), ('scope_partition', 'project~b3RoZXI'),
                       ('storage_instance_id', OTHER_INSTANCE_ID), ('producer_semantic_digest', 'a' * 64)):
            N('append_receipt_custody_' + k, _value(('receipt_custody', k), alt), 'none', 'receipt custody ' + k)
        N('append_receipt_full_value', _value(('receipt_custody', 'original_event_value_commitment', 'sha256'), 'b' * 64),
          'none', 'receipt full-value commitment of another value')

        # ---- append: SP-14xx custody value -------------------------------------------------------------------------
        N('append_custody_physical', _value(('custody', 'intent_ref'), 1 << 64), 'none', 'custody intent_ref 2**64')
        N('append_custody_physical', _value(('custody', 'extra_member'), LONG_INT), 'none', 'custody member 10**4399')
        oracle = _schema_oracle(PAYLOAD_ID[family], '/$defs/custody', 'append_custody_schema',
                                'append_custody_full_consumption')
        for path, bad, label, expected in subject_site_negatives(base['custody'], oracle,
                                                                 light=family not in SITE_SAMPLE):
            N(expected, _value(('custody',) + path, bad), 'none', 'custody ' + '/'.join(map(str, path)) + ' ' + label)
        for kind, key, label, expected in _root_object_negatives(base['custody'], oracle):
            N(expected, (lambda k: lambda c: c['custody'].pop(k))(key) if kind == 'pop'
              else _value(('custody', key), 'x'), 'none', 'custody ' + label)
        N('append_custody_schema', _value(('custody', 'append_result_ref'), None), 'none',
          'settled custody without its first append result (state allOf)')
        for k, _w, _x in CUSTODY_JOINS:
            current = base['custody'][k]
            for alt in ([None, 'source-before:x'] if k == 'before_source_ref' else
                        ['pending_append', 'recovery_required'] if k == 'state' else
                        [current + 'x'] if k not in ('scope_partition',) else
                        ['project~b3RoZXI' if current == 'app' else 'app']):
                if alt == current:
                    continue
                control = bc if (k == 'before_source_ref' and alt is None) else ac
                if k == 'before_source_ref' and alt is not None and control == ac:
                    pass
                N('append_custody_' + k, _value(('custody', k), alt), 'none', 'custody ' + k + ' ' + repr(alt)[:30],
                  control=control)
        N('append_custody_semantic_digest', _value(('custody', 'producer_semantic_digest'), '0' * 64), 'none',
          'custody producer digest of another event')

        # ---- append: SP-337 pack ----------------------------------------------------------------------------------
        N('append_pack_shape', lambda c: c['payload_pack'].pop('media_type'), 'none', 'descriptor without media type',
          control=pc)
        N('append_pack_shape', _value(('payload_pack',), None), 'none', 'no descriptor', control=pc)
        N('append_pack_ref', _value(('event', 'payload_ref'), 'blake3:' + '0' * 64), 'full', 'payload_ref of other bytes',
          control=pc)
        N('append_pack_hex', _value(('payload_pack', 'raw_hex'), 'zz'), 'none', 'pack bytes not hex', control=pc)
        N('append_pack_size', lambda c: c['payload_pack'].update(byte_size=c['payload_pack']['byte_size'] + 1), 'none',
          'byte_size one too large', control=pc)
        N('append_pack_size', lambda c: c['payload_pack'].update(byte_size=float(c['payload_pack']['byte_size'])),
          'none', 'byte_size integral float', control=pc)
        N('append_pack_id', lambda c: (c['payload_pack'].update(payload_id=c['payload_pack']['payload_id'].upper()),
                                       c['event'].update(payload_ref='blake3:' + c['payload_pack']['payload_id'])),
          'full', 'payload_id uppercase (payload_ref follows it)', control=pc)
        N('append_pack_digest', lambda c: (c['payload_pack'].update(payload_id='0' * 64),
                                           c['event'].update(payload_ref='blake3:' + '0' * 64)), 'full',
          'payload_id is not the BLAKE3 of the bytes (ref follows it)', control=pc)
        N('append_pack_media', _value(('payload_pack', 'media_type'), 'application/msgpack'), 'none',
          'pack media type', control=pc)

        def _other_body(c):
            other_body = dict(P(c), extra='x')
            raw = pack_value(other_body)
            pid = blake3.blake3(raw).hexdigest()
            c['payload_pack'].update(raw_hex=raw.hex(), byte_size=len(raw), payload_id=pid)
            c['event']['payload_ref'] = 'blake3:' + pid
        N('append_pack_body', _other_body, 'full', 'pack holds another body (descriptor consistent)', control=pc)

        # ---- retry ------------------------------------------------------------------------------------------------
        def R_(rid, mutate, mode, defect):
            add(rid, family, rc, mutate, mode, defect)
        R_('retry_event_object', _value(('retry_event',), 'not-an-event'), 'none', 'retry candidate is a string')
        R_('retry_event_object', _value(('retry_event',), []), 'none', 'retry candidate is an array')
        R_('retry_event_physical', _value(('retry_event', 'payload', 'extra_member'), 1 << 64), 'none',
           'retry payload member 2**64')
        R_('retry_event_physical', _value(('retry_event', 'sequence_id'), LONG_INT), 'none', 'retry sequence 10**4399')
        R_('retry_envelope_schema', _value(('retry_event', 'schema_version'), '1.0.0'), 'none', 'retry edition')
        R_('retry_event_id', _value(('retry_event', 'event_id'), 'w3e@1:' + '2' * 64), 'none', 'retry event_id')
        R_('retry_idempotency_key', _value(('retry_event', 'idempotency_key'), 'application@1:00:02'), 'none',
           'retry key')
        R_('retry_replay_only', _value(('retry_event', 'replay_policy'), 'projector_replay_only'), 'none',
           'retry selects projector_replay_only')
        first_join = JOINS[family][0][0]
        R_('retry_semantic', lambda c, k=first_join: c['retry_event']['payload'].update(
            {k: _join_alternatives(c['retry_event']['payload'][k])[0]}), 'none',
           'same identity, different semantic body (' + first_join + ')')
        R_('retry_semantic', _value(('retry_event', 'occurred_at_utc'), '2026-11-05T10:00:09Z'), 'none',
           'same identity, different occurred_at_utc')
        R_('retry_sealed_count', _value(('sealed_store',), []), 'none', 'no sealed start record')
        R_('retry_sealed_count', lambda c: c['sealed_store'].append(copy.deepcopy(c['sealed_store'][0])), 'none',
           'two sealed start records')
        R_('retry_custody', _value(('retry_returned_receipt_hex',), pack_value({'other': 'receipt'}).hex()), 'none',
           'lost-ack retry returns another receipt')
        R_('retry_no_new_event', _value(('retry_sequence_unchanged',), False), 'none', 'retry created a new event')

        # ---- derived: history -------------------------------------------------------------------------------------
        def D_(rid, mutate, mode, defect, control=dc):
            add(rid, family, control, mutate, mode, defect)
        for value, label in ((1 << 64, '2**64'), (-1, '-1'), (41.0, 'integral float'), ('41', 'string number'),
                             (LONG_INT, '10**4399')):
            D_('history_slot_sequence', _value(('history', 'sequence_id'), value), 'none', 'history sequence ' + label)
        D_('history_physical', _value(('history', 'extra_member'), LONG_INT), 'none', 'history member 10**4399')
        oracle = _schema_oracle(PAYLOAD_ID[family], '/$defs/history', 'history_schema', 'history_full_consumption')
        for path, bad, label, expected in subject_site_negatives(by_id[dc]['history'], oracle,
                                                                 light=family not in SITE_SAMPLE):
            D_(expected, _value(('history',) + path, bad), 'none', 'history ' + '/'.join(map(str, path)) + ' ' + label)
        for kind, key, label, expected in _root_object_negatives(by_id[dc]['history'], oracle):
            D_(expected, (lambda k: lambda c: c['history'].pop(k))(key) if kind == 'pop'
               else _value(('history', key), 'x'), 'none', 'history ' + label)
        for k, _w, _x in HISTORY_JOINS:
            current = by_id[dc]['history'][k]
            alt = (current + 1 if type(current) is int else
                   ('project~b3RoZXI' if current == 'app' else 'app') if k == 'scope_partition' else current + 'x')
            D_('history_' + k, _value(('history', k), alt), 'none', 'history ' + k + ' ' + repr(alt)[:30])
        # ---- derived: checkpoint ----------------------------------------------------------------------------------
        D_('checkpoint_physical', _value(('checkpoint', 'extra_member'), 1 << 64), 'none', 'wrapper member 2**64')
        D_('checkpoint_physical', _value(('checkpoint', 'body_inline', 'publication_revision'), LONG_INT), 'none',
           'inline body publication_revision 10**4399')
        for value, label in ((1.0, 'integral float'), (True, 'boolean'), (0, 'zero'), ('12', 'string number')):
            D_('checkpoint_ref_byte_size', _value(('checkpoint', 'body_ref', 'byte_size'), value), 'none',
               'body_ref.byte_size ' + label, control=drc)
        D_('checkpoint_body_pack', _value(('checkpoint_body_pack',), None), 'none', 'body bytes not held', control=drc)
        D_('checkpoint_body_pack', _value(('checkpoint_body_pack', 'raw_hex'), 'zz'), 'none', 'body bytes not hex',
           control=drc)

        def _noncanonical(c):
            raw = b'\xc1'
            c['checkpoint_body_pack']['raw_hex'] = raw.hex()
            c['checkpoint']['body_ref'].update(blake3_id=blake3.blake3(raw).hexdigest(), byte_size=len(raw))
        D_('checkpoint_body_decodes', _noncanonical, 'none', 'body bytes are not canonical SP-236 (ref consistent)',
           control=drc)
        D_('checkpoint_body_id', _value(('checkpoint', 'body_ref', 'blake3_id'), 'c' * 64), 'none',
           'body_ref id of other bytes', control=drc)
        D_('checkpoint_body_size', lambda c: c['checkpoint']['body_ref'].update(
            byte_size=c['checkpoint']['body_ref']['byte_size'] + 1), 'none', 'body_ref size one too large', control=drc)

        def _repack_body(edit):
            def mutate(c):
                body_value = decode_storage_value(bytes.fromhex(c['checkpoint_body_pack']['raw_hex']), profile=EVENT_VALUE)
                edit(body_value)
                raw = pack_value(body_value)
                c['checkpoint_body_pack']['raw_hex'] = raw.hex()
                c['checkpoint']['body_ref'].update(blake3_id=blake3.blake3(raw).hexdigest(), byte_size=len(raw))
            return mutate
        for name, path in BODY_SLOTS:
            for value, label in ((1.0, 'integral float'), (True, 'boolean'), (-1, '-1')):
                D_('checkpoint_slot_' + name, _value(('checkpoint', 'body_inline') + path, value), 'none',
                   'inline body ' + '.'.join(path) + ' ' + label)
            D_('checkpoint_slot_' + name, _repack_body(lambda b, p=path: _set_path(b, p, 2.0)), 'none',
               'referenced body ' + '.'.join(path) + ' integral float (ref consistent)', control=drc)
        D_('checkpoint_schema', lambda c: c['checkpoint'].update(
            body_ref={'blake3_id': '0' * 64, 'byte_size': 1, 'media_type': CHECKPOINT_MEDIA}), 'none',
           'both body routes present (oneOf)')
        D_('checkpoint_schema', _value(('checkpoint', 'body_inline', 'generic_read_token', 'redb_snapshot_id'), 'snap-1'),
           'none', 'live redb_snapshot_id persisted in the durable token')
        D_('checkpoint_schema', _value(('checkpoint', 'body_inline', 'filter_complete'), False), 'none',
           'filter not complete')
        D_('checkpoint_schema', _value(('checkpoint', 'body_inline', 'consumer_id'), CONSUMERS[other]), 'none',
           'another family\'s consumer')
        D_('checkpoint_schema', _value(('checkpoint', 'body_ref', 'media_type'), 'application/json'), 'none',
           'body_ref media type', control=drc)
        oracle_w = _checkpoint_oracle(family)
        for path, bad, label, expected in (subject_site_negatives(by_id[dc]['checkpoint'], oracle_w)
                                           if family in SITE_SAMPLE else
                                           subject_site_negatives(by_id[dc]['checkpoint'], oracle_w, light=True)[:12]):
            D_(expected, _value(('checkpoint',) + path, bad), 'none', 'checkpoint ' + '/'.join(map(str, path)) + ' ' +
               label)
        D_('checkpoint_body_schema', _repack_body(lambda b: b['generic_read_token'].update(redb_snapshot_id='snap-1')),
           'none', 'referenced body persists redb_snapshot_id (ref consistent)', control=drc)
        D_('checkpoint_body_schema', _repack_body(lambda b: b.update(status='bogus')), 'none',
           'referenced body status enum (ref consistent)', control=drc)
        for key in ('generation_id', 'frontier_sha256'):
            D_('checkpoint_body_full_consumption', _repack_body(
                lambda b, k=key: b['generic_read_token'].update({k: b['generic_read_token'][k] + '\n'})), 'none',
               'referenced body token ' + key + ' trailing LF (ref consistent)', control=drc)

        def _inline_large(c):
            set_index_dataset(c, LONG_DATASET)
            c['checkpoint_route'] = 'inline'
            resync(c)
        D_('checkpoint_inline_size', _inline_large, 'none', 'inline wrapper above 16 KiB (body must take body_ref)')
        for k, alt in (('storage_instance_id', OTHER_INSTANCE_ID), ('server_id', 'server:home-02'),
                       ('scope_partition', 'project~b3RoZXI' if by_id[dc]['scope_partition'] == 'app' else 'app')):
            D_('checkpoint_' + k, _value(('checkpoint', k), alt), 'none', 'checkpoint ' + k)
        for fn, label in UUID_DEFECTS:
            D_('checkpoint_uuid_storage_instance_id', lambda c, f=fn: c['checkpoint']['body_inline']['generic_read_token'].update(
                storage_instance_id=f(STORAGE_INSTANCE_ID)), 'none', 'token storage_instance_id ' + label)
            D_('checkpoint_uuid_source_selection', lambda c, f=fn: c['checkpoint']['body_inline']['generic_read_token'][
                'source_selection'].update(storage_instance_id=f(STORAGE_INSTANCE_ID)), 'none',
               'selection storage_instance_id ' + label)
        token = by_id[dc]['index_state']
        for k in TOKEN_FIELDS:
            if k == 'source_selection':
                for member, value in token['source_selection'].items():
                    alt = (OTHER_INSTANCE_ID if member == 'storage_instance_id' else value + 1 if type(value) is int else
                           ('0' if value[0] != '0' else '1') * 64 if re.fullmatch(r'[0-9a-f]{64}', value) else None)
                    if alt is None:
                        continue
                    D_('checkpoint_token_source_selection', lambda c, mm=member, a=alt: c['checkpoint']['body_inline'][
                        'generic_read_token']['source_selection'].update({mm: a}), 'none',
                       'token selection ' + member + ' is not Storage\'s')
                continue
            value = token[k]
            alt = (OTHER_INSTANCE_ID if k == 'storage_instance_id' else value + 1 if type(value) is int else
                   'eig_' + '0' * 64 if k == 'generation_id' else
                   ('0' if value[0] != '0' else '1') * 64 if re.fullmatch(r'[0-9a-f]{64}', value) else value + 'x')
            D_('checkpoint_token_' + k, lambda c, kk=k, a=alt: c['checkpoint']['body_inline'][
                'generic_read_token'].update({kk: a}), 'none', 'token ' + k + ' is not Storage\'s')
        cursor = by_id[dc]['checkpoint']['body_inline']['last_examined_cursor']
        for k, _s in CURSOR_FIELDS:
            value = cursor[k]
            alt = value + 1 if type(value) is int else (
                'seg-000003-00000000000000000040.active' if k == 'segment_name' else value + 'x')
            D_('checkpoint_cursor_' + k, lambda c, kk=k, a=alt: c['checkpoint']['body_inline'][
                'last_examined_cursor'].update({kk: a}), 'none', 'cursor ' + k + ' is not Storage\'s frame')
        D_('checkpoint_projection_generation', lambda c: c['checkpoint']['body_inline'].update(
            projection_generation_ref=c['projection_generation'] + 'x'), 'none', 'checkpoint publishes another generation')
        D_('checkpoint_revision_cas', lambda c: c['checkpoint']['body_inline'].update(
            publication_revision=c['prior_publication_revision'] + 2), 'none', 'publication revision skips one')
        D_('checkpoint_revision_cas', lambda c: c['checkpoint']['body_inline'].update(
            publication_revision=c['prior_publication_revision']), 'none', 'publication revision does not advance')
        D_('checkpoint_status_current', _value(('checkpoint', 'body_inline', 'status'), 'degraded'), 'none',
           'a degraded checkpoint advances')
        D_('checkpoint_cas_expected', _value(('cas_expected_matches',), False), 'none', 'prior value changed')
        D_('checkpoint_atomic', _value(('transaction_committed',), False), 'none', 'history and checkpoint split')

        # ---- withdrawal -------------------------------------------------------------------------------------------
        for rid, key, value, label in (('withdrawal_cutoff', 'writer_cutoff_applied', False, 'no cutoff'),
                                       ('withdrawal_once', 'withdrawal_marks', 2, 'withdrawn twice'),
                                       ('withdrawal_once', 'withdrawal_marks', True, 'boolean count'),
                                       ('withdrawal_fence', 'reader_fenced', False, 'readers not fenced'),
                                       ('successor_rebuild', 'successor_verified', False, 'unverified successor'),
                                       ('replay_side_effects', 'replay_effects', ['network_test'], 'replay effect'),
                                       ('outcome_honest', 'reported_outcome', 'failed', 'outcome substituted')):
            add(rid, family, wc, _value((key,), value), 'none', label)
        add('outcome_honest', family, wc, lambda c: c.update(actual_outcome='failed'), 'none',
            'a failed outcome reported as success')

        # ---- retained -------------------------------------------------------------------------------------------
        build_retained_negatives(add, family, tc, by_id)
    return negatives


# Owner-record rules the owner schemas already decide (allOf/const in the existing owner definitions). Each witness
# changes the one record field in an owner-issued manifest (the payload copies follow it); append_source_schema
# refuses it. (path inside the manifest, value, the rule.)
OWNER_SCHEMA_DOMAIN = {
    'remote_access.private_endpoint_state_changed': (
        (('after_record', 'enrollment_state'), 'pending', 'ready requires approved enrollment'),
        (('after_record', 'pm_ingress_validation'), 'failed', 'ready requires passed PM ingress validation'),
        (('after_record', 'independent_from_funnel'), False, 'the private listener stays independent from Funnel')),
    'backup.state_changed': (
        (('after_record', 'capture_completeness'), 'partial', 'completed implies complete capture'),
        (('after_record', 'manifest_ref'), None, 'completed implies an actual non-null manifest'),
        (('after_record', 'destination_attempts', 1, 'upload_state'), 'failed',
         'completed implies each required attempt committed')),
    'remote_access.route_state_changed': (
        (('after_record', 'identity_verification'), 'unverified', 'ready/active require verified identity'),
        (('after_record', 'last_test_receipt_ref'), None, 'ready/active require a current route test')),
    'remote_access.route_test_completed': (
        (('after_record', 'identity_result'), 'not_run', 'passed implies verified identity'),
        (('after_record', 'protocol_result'), 'mismatch', 'passed implies a compatible protocol'),
        (('after_record', 'api_result'), 'failed', 'passed implies API passed'),
        (('after_record', 'websocket_result'), 'failed', 'passed implies WebSocket passed'),
        (('after_record', 'stream_result'), 'failed', 'passed implies stream passed'),
        (('after_record', 'file_transfer_result'), 'failed', 'passed implies transfer passed'),
        (('after_record', 'failure_refs'), ['failure:x'], 'passed carries no failure refs')),
    'server.client_pairing_state_changed': (
        (('after_record', 'explicit_approval'), False, 'complete requires explicit approval'),),
    'server.endpoint_changed': (
        (('after_record', 'preferred'), True, 'an identity mismatch cannot be preferred'),),
    'server.identity_mismatch_detected': (
        (('after_record', 'preferred'), True, 'a mismatched endpoint cannot become preferred'),),
    'server.discovery_observed': (
        (('after_record', 'grants_trust'), True, 'an observation grants no trust', 'reissue'),),
    'remote_access.route_migration_state_changed': (
        (('after_record', 'preference_switched'), False, 'complete requires a switched preference'),
        (('after_record', 'old_route_drained'), False, 'complete requires the drained old route'),
        (('after_record', 'identity_verified'), False, 'complete requires durable same-Server identity')),
    'remote_access.remote_link_state_changed': (
        (('after_record', 'pairing_required'), False, 'direct/relay require pairing'),
        (('after_record', 'application_e2e_required'), False, 'direct/relay require application E2E')),
}


def _src(path, value):
    return _value(('source',) + path, value)


DOMAIN_WITNESSES = {
    F_REV: (('dom_revoked_generation', _src(('after_record', 'effective_trust_generation'), 4), 'source',
             'effective generation is previous plus two', 'base'),
            ('dom_revoked_sessions', lambda c: c['owner']['active_sessions'].append('session:desktop-01:4'), 'none',
             'an active session at the fence is not terminated', 'base')),
    F_CAT: (('dom_catalog_increases', lambda c: c['source']['after_record'].update(
        catalog_revision=c['source']['before_record']['catalog_revision']), 'source',
             'changed Catalog keeps the prior revision', 'before'),
            ('dom_catalog_increases', lambda c: c['source']['after_record'].update(
                catalog_revision=c['source']['before_record']['catalog_revision'] - 1), 'source',
             'Catalog revision decreases', 'before')),
    F_MIS: (('dom_mismatch_unequal', lambda c: (c['source']['after_record'].update(
        observed_fingerprint=c['source']['after_record']['expected_fingerprint']),
        c['owner']['identity_material'].update(observed=c['owner']['identity_material']['expected'])), 'source',
             'equal fingerprints reported as a mismatch (owner material consistent)', 'base'),
            ('dom_mismatch_expected_material', lambda c: c['owner']['identity_material'].update(
                expected='ed25519-public:home-01:rotated-key-8'), 'none',
             'expected digest does not derive from the held expected key', 'base'),
            ('dom_mismatch_observed_material', lambda c: c['owner']['identity_material'].update(
                observed='ed25519-public:mitm:other-key-3'), 'none',
             'observed digest does not derive from the held observed key', 'base')),
    F_PREF: (('dom_preference_changed', lambda c: c['source']['before_record'].update(
        remote_route_id=c['source']['after_record']['remote_route_id']), 'source',
              'unchanged selection presented as a preference change', 'before'),
             ('dom_preference_verified', lambda c: c['source']['after_record'].update(
                 state='configured', identity_verification='unverified'), 'source',
              'preferred route is not identity-verified', 'base')),
    F_PROXY: (('dom_proxy_route_type', lambda c: c['source']['after_record'].update(
        route_type='tailscale_private', public_ingress=False, visibility='private'), 'source',
               'proxy state on a non-proxy route', 'base'),),
    F_TEST: (('dom_test_fingerprints', _src(('after_record', 'observed_server_fingerprint'), 'b' * 64), 'source',
              'passed test with unequal fingerprints', 'base'),
             ('dom_test_public_security', _src(('after_record', 'public_security_result'), 'failed'), 'source',
              'passed public test with failed public security', 'public'),
             ('dom_test_public_security', _src(('after_record', 'public_security_result'), 'not_run'), 'source',
              'passed public test without public security checks', 'public')),
    F_TRUST: (('dom_trust_generation_current', lambda c: c['owner']['current_generations'].update(trust_generation=9),
               'none', 'mutation under a stale trust generation', 'base'),
              ('dom_trust_policy_current', lambda c: c['owner']['current_generations'].update(policy_generation=9),
               'none', 'mutation under a stale policy generation', 'base')),
    F_END: (('dom_endpoint_same_server', _src(('before_record', 'server_id'), 'server:home-02'), 'reissue',
             'endpoint moved from another Server', 'before'),),
    F_PAIR: (('dom_pairing_identity_words', _src(('after_record', 'observed_server_fingerprint'), 'b' * 64), 'source',
              'complete pairing with non-matching identity', 'base'),),
    F_BACKUP: (('dom_backup_verified_receipt', _src(('after_record', 'verification_receipt_ref'), None), 'source',
                'data-verified backup without a verification receipt', 'base'),),
}


def _checkpoint_oracle(family):
    """Expected row for a defect inside the inline-route checkpoint wrapper (its body included)."""
    def oracle(trial, path):
        if physical_reason(trial) is not None:
            return None
        body_value = trial.get('body_inline')
        if type(body_value) is dict and any(slot_reason(body_value, p) is not None for _n, p in BODY_SLOTS):
            return None
        if oracle_refuses(PAYLOAD_ID[family], '/$defs/checkpoint', trial):
            return 'checkpoint_schema'
        bare = dict(trial, body_inline=None, body_ref={'blake3_id': '0' * 64, 'byte_size': 1,
                                                       'media_type': CHECKPOINT_MEDIA})
        if oracle_refuses(PAYLOAD_ID[family], '/$defs/checkpoint', bare, strict=True):
            return 'checkpoint_full_consumption'
        if oracle_refuses(PAYLOAD_ID[family], '/$defs/checkpoint_body', body_value, strict=True):
            return 'checkpoint_body_full_consumption'
        return None
    return oracle


def build_retained_negatives(add, family, tc, by_id):
    other = other_family(family)

    def T_(rid, mutate, mode, defect, control=tc):
        add(rid, family, control, mutate, mode, defect)
    T_('retained_recipe_override', _value(('retained_recipe_override',), 'caller-selected-recipe'), 'none',
       'caller recipe override (through resolve(recipe_override=...))')
    T_('retained_query', _value(('original_ref',), ''), 'none', 'empty original reference')
    T_('retained_query', _value(('event',), 'not-an-event'), 'none', 'the request names no original')
    T_('retained_query', _value(('event', 'schema_version'), '1.0.0'), 'none',
       'the request names another envelope edition (the shared full-value commitment refuses it)')
    T_('retained_receipt_present', _value(('sealed_store',), []), 'none', 'missing receipt (empty store)')
    T_('retained_receipt_present',
       lambda c, fam=other: c.update(sealed_store=[copy.deepcopy(build_case(fam, 'other-original')['sealed_store'][0])]),
       'none', 'missing receipt: the store holds only another original\'s receipt, under that original\'s own ref')
    T_('retained_receipt_unique', lambda c: c['sealed_store'].append(copy.deepcopy(c['sealed_store'][0])), 'none',
       'ambiguous receipt')
    T_('retained_receipt_wellformed', _value(('sealed_store', 0, 'record_hex'), 'zz'), 'none', 'sealed bytes not hex')
    T_('retained_receipt_wellformed', lambda c: c['sealed_store'][0].pop('result_hex'), 'none',
       'sealed row without its result')
    for part, key, value, reason in (('recipe', 'identity_recipe', 7, 'recipe_tuple'),
                                     ('recipe', 'physical_profile', None, 'recipe_tuple'),
                                     ('recipe', 'resource_manifest_sha256', 'zz', 'recipe_resource_hash'),
                                     ('binding', 'server_id', 7, 'original_binding'),
                                     ('binding', 'project_id', 'project:x', 'original_scope')):
        T_('retained_receipt_wellformed', _value(('sealed_store', 0, part, key), value), 'none',
           'sealed %s.%s = %r (the shared constructor refuses %s)' % (part, key, value, reason))

    def _wrong_original(c, fam=other):
        wrong = copy.deepcopy(build_case(fam, 'other-original')['sealed_store'][0])
        wrong['original_ref'] = c['original_ref']
        c['sealed_store'] = [wrong]
    T_('retained_binding', _wrong_original, 'none', 'receipt for another original under this reference')
    T_('retained_recipe_known', _value(('sealed_store', 0, 'recipe', 'owner_edition'), 'w3e-owner-edition-0'), 'none',
       'sealed recipe not installed (an unknown edition)')
    T_('retained_disclosure', _value(('disclosure_allowed',), False), 'none', 'current read permission refused')
    T_('frozen_decodes', lambda c: c['sealed_store'][0].update(record_hex='c1' + c['sealed_store'][0]['record_hex'][2:]),
       'none', 'sealed record bytes corrupt')
    T_('frozen_envelope_schema', _value(('event', 'redaction_profile'), 'bogus'), 'full',
       'original fails the frozen EventRecord schema')
    T_('frozen_family', _value(('event', 'event_type'), 'server.unknown_family'), 'full', 'original of an unknown family')

    def _psid(c):
        c['event']['payload_schema_id'] = PAYLOAD_SCHEMA_IDS[other]
        resync(c)
        c['sealed_store'][0]['recipe'] = {f: getattr(recipe_tuple(other), f) for f in RECIPE_FIELDS}
    T_('frozen_payload_schema_id', _psid, 'none', 'original names another family\'s payload schema (sealed with that '
       'recipe)')
    T_('frozen_recipe_family', _value(('sealed_store', 0, 'recipe'),
                                      {f: getattr(recipe_tuple(other), f) for f in RECIPE_FIELDS}), 'none',
       'sealed recipe of another family')
    T_('frozen_observed_utc_z', lambda c: set_storage_time(c, 'observed_at_utc', '2026-11-05T10:00:01+00:00'), 'full',
       'retained observed_at_utc +00:00')
    T_('frozen_persisted_utc_z', lambda c: set_storage_time(c, 'persisted_at_utc', '2026-11-05T10:00:02z'), 'full',
       'retained persisted_at_utc lowercase z')
    T_('frozen_payload_schema', _value(('event', 'payload', 'extra_member'), 'x'), 'full',
       'original payload fails its frozen schema')
    T_('frozen_payload_full_consumption', lambda c: c['event']['payload'].update(
        server_id=c['event']['payload']['server_id'] + '\n'), 'full',
       'original payload server_id with a trailing LF (the anchored owner pattern accepts it)')
    T_('frozen_identity', lambda c: (c['event'].update(event_id='w3e@1:' + '0' * 64),
                                     c['storage_record'].update(event_id='w3e@1:' + '0' * 64)),
       'no_identity', 'original sealed under a forged event_id (consistent everywhere)')
    T_('frozen_key', _value(('event', 'idempotency_key'), 'application@1:' + '0' * 8), 'no_identity',
       'original sealed under a forged key')

    def _record_variant(c):
        variant = copy.deepcopy(c['event'])
        variant['occurred_at_utc'] = '2026-11-05T10:00:09Z'
        sealed = c['sealed_store'][0]
        _repack(sealed, 'record_hex', variant)
        _repack(sealed, 'result_hex', append_result(variant))
        _repack(sealed, 'receipt_hex', build_receipt_custody(variant, c['storage_record'], c['scope_partition']))
    T_('frozen_source_commitment', _record_variant, 'none', 'sealed bytes are another record than the binding commits')
    T_('frozen_result_event_id', lambda c: _repack(c['sealed_store'][0], 'result_hex',
                                                   dict(append_result(c['event']), event_id='w3e@1:other')),
       'none', 'sealed result names another event')

    def _receipt_edit(**changes):
        def edit(c):
            sealed = c['sealed_store'][0]
            receipt_value = _decoded(sealed, 'receipt_hex')
            for path, value in changes.items():
                _set_path(receipt_value, tuple(path.split('.')), value)
            _repack(sealed, 'receipt_hex', receipt_value)
        return edit
    T_('frozen_receipt_schema', _receipt_edit(extra_member='x'), 'none', 'sealed custody unknown member')
    T_('frozen_receipt_semantic', _receipt_edit(producer_semantic_digest='0' * 64), 'none', 'sealed producer digest')
    T_('frozen_receipt_full_value', _receipt_edit(**{'original_event_value_commitment.sha256': '0' * 64}), 'none',
       'sealed custody full-value commitment')
    T_('frozen_receipt_event_id', _receipt_edit(event_id='w3e@1:other'), 'none', 'sealed custody event')
    T_('retained_dispatcher_verdict', _value(('frozen_map',), 'always_false'), 'none',
       'the installed verifier rejects a genuine original (every frozen component holds)')
    T_('retained_no_receipt_creation', _value(('owner_impl',), 'access_logging'), 'none',
       'owner writes an access receipt while reading (seen only by the store snapshot)')
    T_('retained_no_current_gate', _value(('frozen_map',), 'current_gated'), 'none',
       'frozen verifier runs the current writer gate (seen only by the instrumented gate)')
    T_('retained_family_withdrawn', _value(('family_withdrawn',), True), 'none', 'family withdrawn')
    T_('retained_original_withdrawn', _value(('original_withdrawn',), True), 'none', 'original withdrawn')
    T_('retained_rebuild', _value(('rebuild_matches',), False), 'none', 'rebuild differs')
    if 'project' in SCOPES[family]:
        tpc = 'retained-project:' + family
        T_('retained_receipt_wellformed', _value(('sealed_store', 0, 'binding', 'project_id'), 7), 'none',
           'sealed binding.project_id = 7 in Project scope (original_scope)', control=tpc)
        T_('retained_binding', _value(('sealed_store', 0, 'binding', 'project_id'), 'project:other-09'), 'none',
           'sealed binding of another Project', control=tpc)


# ---- Timestamp fields, derived from the owner schemas (CV-1101) ----------------------------------------------------------

def _date_time_paths(node, resolver, path, out, seen):
    """Every `format: date-time` location reachable from node through properties, items, $ref (across the closed
    registry), anyOf/oneOf/allOf and if/then/else, as an instance path (* for array items)."""
    if not isinstance(node, dict):
        return
    if node.get('format') == 'date-time':
        out.add(path)
    if '$ref' in node:
        resolved = resolver.lookup(node['$ref'])
        key = (id(resolved.contents), path)
        if key not in seen:
            seen.add(key)
            _date_time_paths(resolved.contents, resolved.resolver, path, out, seen)
    for name, sub in node.get('properties', {}).items():
        _date_time_paths(sub, resolver, path + '/' + name, out, seen)
    for key in ('anyOf', 'oneOf', 'allOf'):
        for sub in node.get(key, []):
            _date_time_paths(sub, resolver, path, out, seen)
    for key in ('then', 'else'):
        if key in node:
            _date_time_paths(node[key], resolver, path, out, seen)
    if isinstance(node.get('items'), dict):
        _date_time_paths(node['items'], resolver, path + '/*', out, seen)


def subject_date_time_paths(root_id, pointer):
    resolved = REGISTRY.resolver().lookup(root_id + ('#' + pointer if pointer else ''))
    out = set()
    _date_time_paths(resolved.contents, resolved.resolver, '', out, set())
    return sorted(out)


# subject -> (resource, pointer); per-family subjects use the family payload resource.
TIMESTAMP_SUBJECTS = {
    'event': (EVENT_RECORD_ID, ''),
    'receipt_custody': (RECEIPT_ID, '/$defs/custody_v2'),
}
FAMILY_SUBJECTS = {'payload': '', 'owner_fact': '/$defs/owner_fact', 'custody': '/$defs/custody',
                   'history': '/$defs/history', 'checkpoint': '/$defs/checkpoint',
                   'checkpoint_body': '/$defs/checkpoint_body'}
# The shared check and profile that covers each derived timestamp field (no lane-local parser).
TIMESTAMP_COVERAGE = {
    ('event', '/occurred_at_utc'): ('event_record', 'format_checker(EVENT_RECORD) in append_envelope_schema / '
                                                    'retry_envelope_schema / frozen_envelope_schema'),
    ('event', '/observed_at_utc'): ('event_record + storage_utc_z', 'append_envelope_schema (format) + '
                                    'append_observed_utc_z date_time(STORAGE_UTC_Z) / frozen_observed_utc_z; Storage '
                                    'record join append_storage_observed'),
    ('event', '/persisted_at_utc'): ('event_record + storage_utc_z', 'append_envelope_schema (format) + '
                                     'append_persisted_utc_z date_time(STORAGE_UTC_Z) / frozen_persisted_utc_z; Storage '
                                     'record join append_storage_persisted'),
    ('receipt_custody', '/first_append_receipt/acknowledged_at_utc'): (
        'RECEIPT_ACK_PROFILE (event_record, pending Jared)', 'format_checker(EVENT_RECORD) in append_receipt_schema / '
        'frozen_receipt_schema; entailed append_receipt_ack_profile (the switch); Storage join '
        'append_receipt_acknowledged_at_utc'),
}


def timestamp_inventory():
    """Re-derive every date-time field from the owner schemas; each must have a declared covering check."""
    derived_paths, problems = {}, []
    for subject, (root, pointer) in TIMESTAMP_SUBJECTS.items():
        paths = subject_date_time_paths(root, pointer)
        derived_paths[subject] = paths
        for path in paths:
            if (subject, path) not in TIMESTAMP_COVERAGE:
                problems.append({'subject': subject, 'path': path, 'problem': 'no covering check declared'})
    per_family = {}
    for family in FAMILIES:
        for subject, pointer in FAMILY_SUBJECTS.items():
            paths = subject_date_time_paths(PAYLOAD_ID[family], pointer)
            per_family.setdefault(subject, {})[family] = paths
            if subject != 'owner_fact' and paths:
                problems.append({'subject': subject, 'family': family, 'paths': paths,
                                 'problem': 'a new timestamp field without a declared covering check'})
    derived_paths['owner_fact'] = per_family['owner_fact']
    return derived_paths, problems


OWNER_FACT_TIMESTAMP_CHECK = ('owner_schema (RFC 3339 date-time; other-owner observation)',
                              'format_checker(EVENT_RECORD) inside append_source_schema (the full owner record '
                              'schemas through the closed registry); witnesses per field: trailing LF, empty, 3000 '
                              'chars and 30 February')


def source_timestamp_paths(source):
    """Concrete manifest paths of every owner-record date-time field the schemas declare (array items expanded)."""
    family_paths = timestamp_inventory_cache()['owner_fact']
    out = []
    for family, paths in family_paths.items():
        for path in paths:
            out.append((family, path))
    return out


@functools.lru_cache(maxsize=None)
def _timestamp_inventory_cached():
    return timestamp_inventory()


def timestamp_inventory_cache():
    return _timestamp_inventory_cached()[0]


def expand_instance_paths(value, schema_path):
    """Instance paths (tuples) in value matching a schema path with '*' array wildcards; absent members skipped."""
    parts = [p for p in schema_path.split('/') if p]
    results = [((), value)]
    for part in parts:
        nxt = []
        for prefix, node in results:
            if part == '*':
                if type(node) is list:
                    nxt += [(prefix + (i,), v) for i, v in enumerate(node)]
            elif type(node) is dict and part in node:
                nxt.append((prefix + (part,), node[part]))
        results = nxt
    return [p for p, v in results if type(v) is str]


# ---- Shared number corpus through the complete checker -------------------------------------------------------------------

def corpus_number_values():
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    raws, ints = [], []
    for case in corpus['cases']:
        if case.get('date_time_profile'):
            continue
        op = case.get('op')
        if op in ('token', 'parse', 'parse_token', 'slot') and type(case.get('raw')) is str:
            raws.append(case['raw'])
        if op == 'json_number' and type(case.get('token')) is str:
            raws.append(case['token'])
        if op in ('integer', 'uint64') and type(case.get('value')) is dict and '@int' in case['value']:
            ints.append(case['value']['@int'])
    long = '1' + '0' * 4399
    raws += [long, '-' + long]
    ints += [long, str(UINT64_MAX), str(1 << 64)]
    return list(dict.fromkeys(raws)), list(dict.fromkeys(ints))


def _expected_slot_accept(token, slot, base_event=None):
    """The expectation, composed from the shared helpers alone: the raw token parses (loads_current_json), the event
    still encodes physically (SP-1100), and the slot's own shared call accepts it."""
    try:
        value = loads_current_json(token)
    except Refusal:
        return False
    if physical_reason({'v': value}) is not None:
        return False
    if slot is None:
        return reason_of(storage_uint64, value) is None
    family, field = slot
    low, high = slot_bounds(family, field)
    if reason_of(current_integer, value, minimum=low, maximum=high) is not None:
        return False
    probe = copy.deepcopy(base_event)
    probe['payload'][field] = value
    return reason_of(producer_semantic_digest, probe) is None


def _load_case_slot(base, token, slot):
    case = copy.deepcopy(base)
    if slot is None:
        case['event']['sequence_id'] = '__W3E_SLOT__'
        case['storage_record']['sequence_id'] = '__W3E_SLOT__'
    else:
        case['event']['payload'][slot[1]] = '__W3E_SLOT__'
        case['source']['after_record'][slot[1]] = '__W3E_SLOT__'
    return loads_current_json(json.dumps(case).replace('"__W3E_SLOT__"', token))


CORPUS_SLOT_FAMILIES = ('remote_access.proxy_state_changed', 'remote_access.private_endpoint_state_changed')


def corpus_number_checks(controls):
    """Every shared number spelling enters through the checker's own raw ingress (loads_current_json) at Storage's
    sequence slot (as Storage assigned it) and at a payload integer slot (the owner record carries the same value, as
    the producer copies it), then runs the complete append route. Any disagreement with the composed expectation
    fails the run; nothing may raise."""
    raws, ints = corpus_number_values()
    totals = {'accepted': 0, 'refused': 0, 'load_refused': 0, 'raised': 0}
    disagreements = []
    by_id = dict(controls)
    routes = [('append:' + f, None) for f in CORPUS_SLOT_FAMILIES]
    routes += [('append:' + f, (f, 'route_generation' if f == CORPUS_SLOT_FAMILIES[0] else 'connector_revision'))
               for f in CORPUS_SLOT_FAMILIES]
    for cid, slot in routes:
        base = by_id[cid]
        for token in raws + ints:
            expected = _expected_slot_accept(token, slot, base['event'])
            try:
                loaded = _load_case_slot(base, token, slot)
            except Refusal:
                if expected:
                    disagreements.append((cid, str(slot), token[:40], 'load_refused'))
                totals['load_refused'] += 1
                continue
            try:
                if slot is not None:
                    reissue(loaded)
                resync(loaded)
                actual = evaluate(loaded, 'append')[0] == []
            except Exception as exc:  # noqa: BLE001 - a raise is a finding, recorded and failed
                totals['raised'] += 1
                disagreements.append((cid, str(slot), token[:40], 'raised ' + type(exc).__name__))
                continue
            if actual != expected:
                disagreements.append((cid, str(slot), token[:40], actual))
            totals['accepted' if actual else 'refused'] += 1
    return totals, len(raws), len(ints), disagreements


# ---- Running the complete checker ------------------------------------------------------------------------------------------

def timestamp_witnesses(controls, families=None):
    """30 February at every owner-record date-time field of every family's manifest (format enforced, not just
    type): each is refused at append_source_schema through the shared CV-1101 checker."""
    by_id = dict(controls)
    out = []
    inventory = timestamp_inventory_cache()['owner_fact']
    for family in (families or FAMILIES):
        for control in ('append:' + family, 'append-before:' + family):
            source = by_id[control]['source']
            for schema_path in inventory[family]:
                for path in expand_instance_paths(source, schema_path):
                    if control.startswith('append:') and path[0] == 'before_record':
                        continue
                    if control.startswith('append-before:') and path[0] != 'before_record':
                        continue
                    bad = copy.deepcopy(by_id[control])
                    _set_path(bad['source'], path, '2026-02-30T00:00:00Z')
                    reissue(bad)
                    resync(bad)
                    out.append({'row': 'append_source_schema', 'boundary': 'append', 'family': family,
                                'control': control, 'defect': 'manifest ' + '/'.join(map(str, path)) + ' 30 February',
                                'case': bad})
    return out


def check_controls_and_negatives(controls, negatives, fail_fast=False):
    failures, refused_rows = [], {}
    for cid, case in controls:
        try:
            refusals, _ = evaluate(case, case_boundary(cid))
        except Exception as exc:  # noqa: BLE001 - an exception is a finding, never a refusal
            refusals = [('RAISED', type(exc).__name__ + ': ' + str(exc)[:120])]
        if refusals:
            failures.append({'control': cid, 'refusals': refusals})
            if fail_fast:
                return failures, refused_rows
    for n in negatives:
        try:
            refusals, _ = evaluate(n['case'], n['boundary'])
        except Exception as exc:  # noqa: BLE001
            refusals = [('RAISED', type(exc).__name__ + ': ' + str(exc)[:120])]
        want = [(n['row'], ROW_BY_ID[n['row']]['code'])]
        for rid, _code in refusals:
            refused_rows[rid] = refused_rows.get(rid, 0) + 1
        if refusals != want:
            failures.append({'negative': n['row'], 'family': n['family'], 'defect': n['defect'],
                             'want': want, 'refusals': refusals})
            if fail_fast:
                return failures, refused_rows
    return failures, refused_rows


def all_cases():
    controls = build_controls()
    negatives = build_negatives(controls) + timestamp_witnesses(controls)
    return controls, negatives


def main(argv=None):
    import argparse
    parser = argparse.ArgumentParser(description='W3E complete checker')
    parser.add_argument('--json', help='write the summary here as well')
    parser.add_argument('--fail-fast', action='store_true', help='stop at the first failure (mutation runs)')
    args = parser.parse_args(argv)
    eager = {rel: eager_refs(RESOURCES[rel]) for rel in RESOURCE_FILES
             if rel.startswith('Plans/event_payloads/') or rel in ('Plans/event_record.schema.json',)}
    eager['receipt custody_v2'] = eager_refs({'$ref': RECEIPT_ID + '#/$defs/custody_v2'})
    if args.fail_fast:
        # Mutation runs: build and check one family at a time and stop at the first failure.
        controls = build_controls()
        failures, _ = check_controls_and_negatives(controls, [], True)
        for family in ([] if failures else FAMILIES):
            batch = build_negatives(controls, [family]) + timestamp_witnesses(controls, [family])
            failures, _ = check_controls_and_negatives([], batch, True)
            if failures:
                break
        if failures:
            print(json.dumps({'status': 'fail', 'first_failure': failures[0]}, default=str)[:2000])
            return 1
    controls, negatives = all_cases()
    failures, refused_rows = check_controls_and_negatives(controls, negatives)
    witnessed = {n['row'] for n in negatives}
    rows = [r['id'] for r in ROWS]
    unwitnessed = sorted(set(rows) - witnessed)
    if sorted(ENTAILED) != unwitnessed:
        failures.append({'witness_inventory': 'rows without a witness must be exactly the entailed rows',
                         'unwitnessed': unwitnessed, 'entailed': sorted(ENTAILED)})
    for rid in ENTAILED:
        if refused_rows.get(rid):
            failures.append({'entailed_row_refused': rid})
    timestamp_paths, timestamp_problems = _timestamp_inventory_cached()
    if timestamp_problems:
        failures.append({'timestamp_inventory': timestamp_problems})
    corpus_totals, raws, ints, disagreements = corpus_number_checks(controls)
    if disagreements:
        failures.append({'number_corpus_disagreements': disagreements[:20]})
    per_family = {}
    for n in negatives:
        per_family[n['family']] = per_family.get(n['family'], 0) + 1
    summary = {
        'status': 'pass' if not failures else 'fail',
        'families': len(FAMILIES),
        'eager_refs': eager,
        'rows': len(rows),
        'tables': len(TABLES),
        'rows_with_witness': len(witnessed),
        'entailed_rows': sorted(ENTAILED),
        'controls': len(controls),
        'negatives': len(negatives),
        'negatives_by_boundary': {b: sum(1 for n in negatives if n['boundary'] == b) for b in BOUNDARIES},
        'negatives_by_family': per_family,
        'unjoined_payload_fields': {f: list(v) for f, v in UNJOINED.items() if v},
        'timestamp_fields': {
            'event': {p: TIMESTAMP_COVERAGE[('event', p)][0] for p in timestamp_paths['event']},
            'receipt_custody': {p: TIMESTAMP_COVERAGE[('receipt_custody', p)][0]
                                for p in timestamp_paths['receipt_custody']},
            'owner_fact': {f: paths for f, paths in timestamp_paths['owner_fact'].items()},
            'owner_fact_check': OWNER_FACT_TIMESTAMP_CHECK[1],
            'payload/custody/history/checkpoint': 'no date-time field (derived from the schemas each run)',
        },
        'receipt_ack_profile': RECEIPT_ACK_PROFILE,
        'size_bounds': {'payload_max': max(PAYLOAD_BOUND.values()), 'custody_max': max(CUSTODY_BOUND.values()),
                        'history_max': max(HISTORY_BOUND.values())},
        'number_corpus': corpus_totals,
        'number_corpus_disagreements': len(disagreements),
        'raw_spellings': raws,
        'exact_integers': ints,
        'failures': failures[:60],
        'failure_count': len(failures),
    }
    text = json.dumps(summary, indent=2, default=str)
    if args.json:
        Path(args.json).write_text(text + '\n')
    print(text if not failures else json.dumps({k: summary[k] for k in ('status', 'failure_count', 'failures')},
                                               indent=1, default=str)[:20000])
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
