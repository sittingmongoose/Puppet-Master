#!/usr/bin/env python3
"""DR static contracts: real hashes over fixture bytes, bounded custody/append models.

Install scripts/requirements-runtime-artifact-drafts.txt in a venv. No native
storage, transaction, source authentication, receipt issuance or admission runs.
"""
import copy
import base64
import hashlib
import json
import math
from pathlib import Path
import re
import struct
import sys
from types import SimpleNamespace
from urllib.parse import urldefrag, urljoin

from blake3 import blake3
import msgpack
import rfc8785
from jsonschema import Draft202012Validator, FormatChecker, ValidationError, validators
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012

from pm_event_index_binding import binding_digest
from pm_runtime_artifact_guard_cases import accepted as guard_accepted, cases as guard_cases

ROOT = Path(__file__).resolve().parents[1]
INLINE_LIMIT = 16384
SEMANTIC_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id',
    'causation_event_id', 'parent_event_id', 'idempotency_key',
    'payload_schema_id', 'payload', 'payload_ref', 'redaction_profile', 'migration',
)
STORAGE_FIELDS = ('sequence_id', 'observed_at_utc', 'persisted_at_utc')
PACK_REF = re.compile(r'pm\.payload_pack\.v1:blake3:([0-9a-f]{64}):([1-9][0-9]*):application/json\Z')
CHECKPOINT_SCHEMA = 'Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint'
CHECKPOINT_KEY = 'event_record_index_checkpoint.v1:{storage_instance_id}'
PROVIDER_HASH_PATHS = {
    'runtime_artifact.cost_usage': ('type_payload', 'authority', 'provider_payload_hash'),
    'runtime_artifact.tool_llm_trace': ('type_payload', 'raw_payload', 'provider_payload_hash'),
}
CURRENT_WRITER = 'current-writer'
HISTORICAL_V1 = 'historical-v1-before-provider-hash'


class SchemaReferences:
    """Preflight whole schema documents, including unused definitions/branches.

    Resolve declared IDs, relative files, JSON pointers and anchors locally;
    never fetch an unknown URI. Instance traversal cannot establish this rule.
    """
    def __init__(self):
        self.documents = {str(p.relative_to(ROOT)): load(str(p.relative_to(ROOT)))
                          for p in sorted((ROOT / 'Plans').glob('*.schema.json'))}
        self.registry, self.owners = self.register(self.documents)

    @staticmethod
    def register(documents, registry=None):
        resources, owners = [], {}

        def register(resource, base, owner):
            uri = urljoin(base, resource.id()) if resource.id() else base
            owners[uri] = owner
            for child in resource.subresources():
                register(child, uri, owner)

        for path, schema in documents.items():
            uri = (ROOT / path).as_uri()
            owners[uri] = path
            canonical_uri = 'https://puppetmaster.local/' + path
            owners[canonical_uri] = path
            resource = Resource.from_contents(schema, default_specification=DRAFT202012)
            resources.append((uri, resource))
            resources.append((canonical_uri, resource))
            register(resource, uri, path)
            if resource.id():
                resources.append((urljoin(uri, resource.id()), resource))
        return (registry or Registry()).with_resources(resources).crawl(), owners

    def errors(self, paths, overrides=None):
        documents = dict(self.documents, **(overrides or {}))
        registry, owners = self.registry, dict(self.owners)
        if overrides:
            # Remove aliases/anchors of replaced resources as well as their file
            # routes; an old registry entry must never redeem a removed target.
            for uri, owner in self.owners.items():
                if owner in overrides and uri in registry:
                    registry = registry.remove(uri)
                    owners.pop(uri, None)
            registry, replaced = self.register(overrides, registry)
            owners.update(replaced)
        errors, visited = [], set()

        def visit(path):
            if path in visited:
                return
            visited.add(path)
            if path not in documents:
                errors.append(path + ': missing schema')
                return

            def walk(node, base, pointer=''):
                if isinstance(node, dict):
                    if '$id' in node:
                        base = urljoin(base, node['$id'])
                    if '$ref' in node:
                        ref = node['$ref']
                        try:
                            target = registry.resolver(base).lookup(ref)
                            if not isinstance(target.contents, (dict, bool)):
                                raise ValueError('reference target is not a schema')
                            uri = urldefrag(base if ref.startswith('#') else urljoin(base, ref))[0]
                            if uri in owners:
                                visit(owners[uri])  # Walk its entire document, not only the fragment.
                        except (Unresolvable, ValueError, TypeError) as error:
                            errors.append(f'{path}{pointer}/$ref: {ref!r}: {error}')
                    for key, child in node.items():
                        walk(child, base, pointer + '/' + key.replace('~', '~0').replace('/', '~1'))
                elif isinstance(node, list):
                    for index, child in enumerate(node):
                        walk(child, base, pointer + '/' + str(index))
            walk(documents[path], (ROOT / path).as_uri())

        for path in paths:
            visit(path)
        return errors


def exact_pattern(validator_, pattern, instance, schema):
    """Keep every schema rule; anchored identifiers additionally require fullmatch.

    Python's `$` admits a final LF. Historical schema IDs/bytes stay unchanged;
    this stricter adopted boundary applies to payloads and stored values alike.
    """
    yield from Draft202012Validator.VALIDATORS['pattern'](validator_, pattern, instance, schema)
    if isinstance(instance, str) and pattern.startswith('^') and pattern.endswith('$'):
        if re.search(pattern, instance) and re.fullmatch(pattern, instance) is None:
            yield ValidationError('identifier must match the entire value')


def exact_pattern_properties(validator_, patterns, instance, schema):
    yield from Draft202012Validator.VALIDATORS['patternProperties'](validator_, patterns, instance, schema)
    if isinstance(instance, dict):
        for pattern in patterns:
            if pattern.startswith('^') and pattern.endswith('$'):
                for key in instance:
                    if re.search(pattern, key) and re.fullmatch(pattern, key) is None:
                        yield ValidationError('identifier key must match the entire value', path=[key])


ExactValidator = validators.extend(Draft202012Validator, {
    'pattern': exact_pattern, 'patternProperties': exact_pattern_properties,
})


def load(path):
    return json.loads((ROOT / path).read_text())


def validator(schema, definition=None, *, validation=CURRENT_WRITER):
    # CV-526/CV-537 current-writer lexical overlays. Historical schema files and
    # explicitly versioned historical decoders retain their original contracts.
    if validation not in (CURRENT_WRITER, HISTORICAL_V1):
        raise ValueError('unsupported historical decoder')
    if validation == CURRENT_WRITER and schema.get('$id') in ('pm.runtime_artifact.cost_usage.schema.v1',
                             'pm.runtime_artifact.tool_llm_trace.schema.v1'):
        schema = copy.deepcopy(schema)
        digest = {'type': ['string', 'null'], 'pattern': '^sha256:[0-9a-f]{64}$',
                  'minLength': 71, 'maxLength': 71}
        if schema['$id'] == 'pm.runtime_artifact.cost_usage.schema.v1':
            fields = schema['$defs']['authorityFields']['properties']
        else:
            fields = schema['properties']['type_payload']['properties']['raw_payload']['properties']
        fields['provider_payload_hash'] = {'allOf': [fields['provider_payload_hash'], digest]}
    if definition:
        schema = dict(schema, **{'$ref': '#/$defs/' + definition})
    return ExactValidator(schema, format_checker=FormatChecker())


EVENT_VALIDATOR = validator(load('Plans/event_record.schema.json'))
RECEIPT_SCHEMA = load('Plans/event_append_receipt_contracts.schema.json')
RECEIPT_VALIDATOR = validator(RECEIPT_SCHEMA, 'AppendReceipt')
CUSTODY_VALIDATOR = validator(RECEIPT_SCHEMA, 'custody_v2')
RESULT_VALIDATOR = validator(RECEIPT_SCHEMA, 'full_value_result')


def identity(event, payload, revision=None):
    members = [event, payload['project_id'], payload['artifact_id'], payload['schema_id']]
    prefix = 'ra1:'
    if event == 'runtime_artifact.restore_point':
        if type(revision) is not int or revision < 0:
            raise ValueError('missing original observation revision')
        members.append(str(revision))
        prefix = 'ra-observation1:'
    encoded = [v.encode('utf-8', errors='strict') for v in members]
    return prefix + hashlib.sha256(b''.join(struct.pack('>I', len(v)) + v for v in encoded)).hexdigest()


def grouping_identity(event, payload):
    """RAP-113's four-member artifact group, without the observation ordinal."""
    members = [event, payload['project_id'], payload['artifact_id'], payload['schema_id']]
    encoded = [v.encode('utf-8', errors='strict') for v in members]
    return 'ra1:' + hashlib.sha256(b''.join(struct.pack('>I', len(v)) + v for v in encoded)).hexdigest()


def semantic_digest(event):
    # The exact Contracts §1.2 producer-owned preimage, including required nulls.
    return hashlib.sha256(rfc8785.dumps({k: event[k] for k in SEMANTIC_FIELDS})).hexdigest()


def value_bytes(value):
    """Canonical MessagePack fixture codec; shortest lossless floats, UTF-8 maps."""
    packer = msgpack.Packer(use_bin_type=True)
    if type(value) is dict:
        keys = sorted(value, key=lambda k: k.encode('utf-8', errors='strict'))
        return packer.pack_map_header(len(keys)) + b''.join(value_bytes(k) + value_bytes(value[k]) for k in keys)
    if type(value) is list:
        return packer.pack_array_header(len(value)) + b''.join(value_bytes(v) for v in value)
    if type(value) is float:
        if not math.isfinite(value):
            raise ValueError('nonfinite')
        try:
            single = struct.pack('>f', value)
            if struct.unpack('>f', single)[0] == value:
                return b'\xca' + single
        except OverflowError:
            pass
        return b'\xcb' + struct.pack('>d', value)
    if type(value) not in (str, int, bool, type(None)):
        raise ValueError('unsupported value')
    return packer.pack(value)


def commitment(event):
    domain = 'pm.storage.original_event_value_commitment.v1'
    codec = 'pm.seglog_frame_v2.event_value.canonical_msgpack.v1'
    preimage = [domain, '1.0.0', codec, event['schema_id'], event['schema_version'], event]
    return dict(schema_id=domain, schema_version='1.0.0', codec=codec, domain=domain,
                event_schema_id=event['schema_id'], event_schema_version=event['schema_version'],
                sha256=hashlib.sha256(value_bytes(preimage)).hexdigest())


def storage_form(payload, packs):
    body = rfc8785.dumps(payload)
    if len(body) <= INLINE_LIMIT:
        return copy.deepcopy(payload), None
    digest = blake3(body).hexdigest()
    packs[digest] = dict(body=body, durable=True, authorized=True)
    return {}, f'pm.payload_pack.v1:blake3:{digest}:{len(body)}:application/json'


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('duplicate key')
        result[key] = value
    return result


def decode(row, event, packs, *, validation=CURRENT_WRITER):
    """Validate actual fixture EventRecord and its resolved unchanged logical schema."""
    if list(EVENT_VALIDATOR.iter_errors(event)):
        raise ValueError('invalid EventRecord')
    if event['event_type'] != row['event_type'] or event['payload_schema_id'] != row['payload_schema_id']:
        raise ValueError('wrong family/schema')
    if event['scope_kind'] != 'project' or event['replay_policy'] != 'dedupe_by_idempotency_key' or event['redaction_profile'] != 'no_secrets':
        raise ValueError('wrong scope/replay/redaction')
    ref = event['payload_ref']
    if ref is None:
        payload = event['payload']
        if len(rfc8785.dumps(payload)) > INLINE_LIMIT:
            raise ValueError('oversized inline')
    else:
        match = PACK_REF.fullmatch(ref)
        if not match or event['payload'] != {}:
            raise ValueError('wrong reference/placeholder')
        digest, size = match.groups()
        source = packs.get(digest)
        if not source or not source['durable'] or not source['authorized']:
            raise ValueError('pack unavailable')
        body = source['body']
        if len(body) != int(size) or blake3(body).hexdigest() != digest:
            raise ValueError('pack integrity')
        payload = json.loads(body.decode('utf-8', errors='strict'), object_pairs_hook=unique_object)
        if rfc8785.dumps(payload) != body or len(body) <= INLINE_LIMIT:
            raise ValueError('noncanonical storage route')
    schema = load(row['payload_schema_ref'])
    if list(validator(schema, validation=validation).iter_errors(payload)):
        raise ValueError('invalid logical payload')
    if payload['project_id'] != event['project_id']:
        raise ValueError('Project join')
    for field in ('run_id', 'attempt_id', 'thread_id', 'node_id'):
        if event[field] != payload.get(field):
            raise ValueError(field + ' join')
    if event['occurred_at_utc'] != payload['created_at_utc']:
        raise ValueError('authored time join')
    if 'actor_ref' in payload and payload['actor_ref'] != event['actor_ref']:
        raise ValueError('actor join')
    if event['idempotency_key'] != identity(row['event_type'], payload, event['producer_sequence_id']):
        raise ValueError('identity join')
    if row['event_type'] == 'runtime_artifact.restore_point':
        point = payload['type_payload']
        if point['project_id'] != payload['project_id']:
            raise ValueError('point Project join')
    return payload


def inspect(row, payload, source):
    """Original source/body checks retained; full-envelope checks run separately."""
    if source['withdrawn'] or not source['authorized']:
        return 'unavailable'
    if not source['source_valid'] or not source['receipt_valid']:
        return 'unavailable'
    if source['project_id'] != payload['project_id'] or source['event_type'] != row['event_type']:
        return 'identity_conflict'
    if source['original_payload'] != payload:
        return 'identity_conflict'
    return 'metadata_only' if source['body_deleted'] else 'metadata_and_authorized_refs'


def full_value_matches(candidate, original, result, custody, *, validation=CURRENT_WRITER):
    if (not stored_event_valid(candidate, validation=validation) or not stored_event_valid(original['event'], validation=validation)
            or list(RECEIPT_VALIDATOR.iter_errors(result['first_append_receipt']))
            or list(CUSTODY_VALIDATOR.iter_errors(custody)) or list(RESULT_VALIDATOR.iter_errors(result))
            or list(CUSTODY_VALIDATOR.iter_errors(original['custody']))
            or list(RESULT_VALIDATOR.iter_errors(original['result']))):
        return False
    receipt = result['first_append_receipt']
    stored = original['event']
    return (value_bytes(candidate) == value_bytes(stored)
            and result == original['result'] and custody == original['custody']
            and receipt == custody['first_append_receipt']
            and receipt['event_id'] == candidate['event_id'] == custody['event_id']
            and custody['scope_partition'] == scope_partition(candidate['project_id'])
            and custody['event_type'] == candidate['event_type']
            and custody['idempotency_key'] == candidate['idempotency_key']
            and receipt['sequence_id'] == candidate['sequence_id']
            and result['original_segment_ref'] == custody['original_segment_ref']
            and commitment(candidate) == custody['original_event_value_commitment'] == result['original_event_value_commitment']
            and semantic_digest(candidate) == custody['producer_semantic_digest'])


def stored_event_valid(event, *, validation=CURRENT_WRITER):
    """Lexical/schema validation of original copies, without changing hash domains."""
    if list(EVENT_VALIDATOR.iter_errors(event)):
        return False
    if event['scope_kind'] != 'project' or event['replay_policy'] != 'dedupe_by_idempotency_key':
        return False
    if event['payload_ref'] is not None:
        return bool(PACK_REF.fullmatch(event['payload_ref'])) and event['payload'] == {}
    for row in load('Plans/runtime_artifact_event_drafts.json')['rows']:
        if event['event_type'] == row['event_type'] and event['payload_schema_id'] == row['payload_schema_id']:
            return (len(rfc8785.dumps(event['payload'])) <= INLINE_LIMIT
                    and validator(load(row['payload_schema_ref']), validation=validation).is_valid(event['payload']))
    return False


def resolve_history(row, original, source, packs, *, decoder):
    """Explicit historical route over assumed-authentic ORIGINAL custody.

    No current-writer fallback, new receipt or rehash/rewrite of retained data.
    Source/receipt authentication is modeled by the source adapter, as in inspect.
    """
    if decoder != HISTORICAL_V1:
        return 'unavailable'
    try:
        event = original['event']
        payload = decode(row, event, packs, validation=decoder)
        if not full_value_matches(event, source['authenticated_original'], original['result'], original['custody'], validation=decoder):
            return 'unavailable'
        return inspect(row, payload, source)
    except (ValueError, KeyError, TypeError, UnicodeError):
        return 'unavailable'


def scope_partition(project_id):
    return 'project~' + base64.urlsafe_b64encode(project_id.encode()).decode().rstrip('=')


class AppendModel:
    """Hypothetical admitted append only; registry absence still refuses by default."""
    def __init__(self, row, packs, receipt, custody):
        self.row, self.packs = row, packs
        self.receipt, self.custody = receipt, custody
        self.scoped, self.global_ids = {}, {}

    def append(self, event, admission=False, source_valid=True, dedupe_available=True):
        if not admission:
            return 'withdrawn'
        if not source_valid or not dedupe_available:
            return 'unavailable'
        if list(EVENT_VALIDATOR.iter_errors(event)):
            return 'invalid'
        # Replay policy is deliberately outside the canonical semantic digest.
        # Validate it before either global or scoped dedupe can return success.
        if event['replay_policy'] == 'projector_replay_only':
            return 'replay_only_not_appendable'
        if event['replay_policy'] != 'dedupe_by_idempotency_key':
            return 'invalid'
        digest = semantic_digest(event)
        if event['event_id'] in self.global_ids and self.global_ids[event['event_id']] != digest:
            return 'idempotency_conflict'
        key = (event['project_id'], event['event_type'], event['idempotency_key'])
        if key in self.scoped:
            original = self.scoped[key]
            return original if original['custody']['producer_semantic_digest'] == digest else 'idempotency_conflict'
        try:
            decode(self.row, event, self.packs)
        except (ValueError, KeyError, UnicodeError):
            return 'invalid'
        receipt = copy.deepcopy(self.receipt)
        receipt.update(event_id=event['event_id'], sequence_id=event['sequence_id'])
        custody = copy.deepcopy(self.custody)
        partition = scope_partition(event['project_id'])
        custody.update(event_id=event['event_id'], scope_partition=partition, event_type=event['event_type'],
                       idempotency_key=event['idempotency_key'], producer_semantic_digest=digest,
                       first_append_receipt=receipt, original_event_value_commitment=commitment(event))
        result = {k: copy.deepcopy(custody[k]) for k in ('first_append_receipt', 'original_segment_ref', 'original_event_value_commitment')}
        original = dict(event=copy.deepcopy(event), result=result, custody=custody)
        if not full_value_matches(event, original, result, custody):
            return 'invalid'
        self.scoped[key] = original
        self.global_ids[event['event_id']] = digest
        return original


def policies_match(row, index_policy, checkpoint_policy):
    return (row.get('index_retention_policy_ref') == index_policy
            and row.get('checkpoint_retention_policy_ref') == checkpoint_policy
            and 'derived_retention_policy_ref' not in row)


def checkpoint_matches(row, event, original, bundle):
    """Bounded SP-278 initial-generation join, using its real schema and codec.

    The single-segment source adapter is synthetic and assumed verified. This
    exercises identities/bytes, never native controls, CRC, redb, sync or CAS.
    """
    try:
        if row['checkpoint_key'] != CHECKPOINT_KEY or row['checkpoint_schema_ref'] != CHECKPOINT_SCHEMA:
            return False
        path, pointer = row['checkpoint_schema_ref'].split('#', 1)
        schema = load(path)
        definition = schema
        for member in pointer.lstrip('/').split('/'):
            definition = definition[member.replace('~1', '/').replace('~0', '~')]
        if definition != schema['$defs']['checkpoint']:
            return False
        checkpoint, token, source = (bundle[k] for k in ('checkpoint', 'read_token', 'selected_source'))
        if not validator(schema, 'checkpoint').is_valid(checkpoint) or not validator(schema, 'read_token').is_valid(token):
            return False
        custody, receipt = original['custody'], original['result']['first_append_receipt']
        storage = custody['storage_instance_id']
        key = CHECKPOINT_KEY.format(storage_instance_id=storage)
        if not (bundle['checkpoint_key'] == key == token['checkpoint_key']
                and storage == checkpoint['storage_instance_id'] == token['storage_instance_id'] == source['storage_instance_id']):
            return False
        generation = checkpoint['current_generation_id']
        node = checkpoint['generations'][generation]
        anchor, frontier = node['anchor'], node['frontier']
        selection = source['source_selection']
        if (node['generation_id'] != generation or node['state'] != 'current'
                or sum(n['state'] == 'current' for n in checkpoint['generations'].values()) != 1
                or selection['storage_instance_id'] != storage
                or anchor['source_selection']['storage_instance_id'] != storage
                or selection != frontier['source_selection'] or selection != token['source_selection']
                or source['verified'] is not True or source['redb_snapshot_id'] != token['redb_snapshot_id']):
            return False
        expected_generation = 'eig_' + binding_digest(dict(
            domain='pm.event_index.generation.v1', storage_instance_id=storage,
            projector_version=node['projector_version'], birth_source_selection=anchor['source_selection'],
            generation_seed_sha256=anchor['generation_seed_sha256']))
        expected_token = dict(storage_instance_id=storage, checkpoint_key=key,
            checkpoint_ref=key + '#/generations/' + generation, generation_id=generation,
            generation_anchor_sha256=binding_digest(anchor), frontier_revision=frontier['publication_revision'],
            frontier_sha256=binding_digest(frontier), index_dataset_name='event_record_index.v2@' + generation,
            source_selection=selection, redb_snapshot_id=source['redb_snapshot_id'])
        if generation != expected_generation or token != expected_token or node['index_dataset_name'] != token['index_dataset_name']:
            return False
        if not full_value_matches(event, original, original['result'], custody) or source['event'] != event:
            return False
        partition = scope_partition(event['project_id'])
        if (source['scope_partition'] != partition or custody['scope_partition'] != partition
                or source['event_value_sha256'] != hashlib.sha256(value_bytes(event)).hexdigest()
                or source['source_locator'] != {k: receipt[k] for k in ('segment_generation','segment_name','byte_offset','sequence_id')}
                or selection['selected_segment_generation'] != receipt['segment_generation']):
            return False
        manifest, current = source['manifest'], source['current']
        if (selection['current_bytes_sha256'] != hashlib.sha256(value_bytes(current)).hexdigest()
                or selection['manifest_bytes_sha256'] != hashlib.sha256(value_bytes(manifest)).hexdigest()
                or current['selected_segment_generation'] != selection['selected_segment_generation']
                or manifest['selected_segment_generation'] != selection['selected_segment_generation']
                or manifest['manifest_generation'] != selection['manifest_generation']
                or manifest['recovery_epoch'] != selection['recovery_epoch']
                or manifest['survivor_prefix_sha256'] != selection['manifest_survivor_prefix_sha256']
                or manifest['retained_inventory'] != source['segments']
                or selection['retained_inventory_sha256'] != binding_digest(manifest['retained_inventory'])
                or selection['durable_watermarks_sha256'] != binding_digest(manifest['durable_watermarks'])
                or selection['excluded_ranges_sha256'] != binding_digest(manifest['excluded_ranges'])
                or selection['retired_inputs_sha256'] != binding_digest(manifest['retired_inputs'])):
            return False
        # This fixture edition represents one complete initial source/dataset.
        # It cannot be used to claim a translated or partial/multi-segment read.
        prefix = binding_digest(dict(domain='pm.event_index.retained_prefix.v1', entries=[dict(
            sequence_id=event['sequence_id'], event_id=event['event_id'], scope_partition=partition,
            source_value_bytes_sha256=source['event_value_sha256'])]))
        coverage = frontier['coverage']
        if (anchor['source_selection'] != selection or node['translation'] is not None
                or anchor['retained_event_count'] != 1 or anchor['first_retained_sequence_id'] != event['sequence_id']
                or anchor['through_sequence_id'] != event['sequence_id'] or anchor['retained_event_prefix_sha256'] != prefix
                or anchor['sequence_gaps_sha256'] != binding_digest([])
                or coverage['retained_event_count'] != 1 or not coverage['complete_to_captured_boundary']
                or coverage['empty_retained_source'] or coverage['sequence_gaps'] != []
                or coverage['retained_event_prefix_sha256'] != prefix
                or coverage['first_retained_sequence_id'] != event['sequence_id'] or coverage['through_sequence_id'] != event['sequence_id']):
            return False
        last = dict(segment_generation=receipt['segment_generation'], segment_name=receipt['segment_name'],
                    byte_offset=receipt['byte_offset'], frame_end_offset=source['frame_end_offset'],
                    last_sequence_id=event['sequence_id'], last_event_id=event['event_id'])
        if coverage['last_frame'] != last or coverage['segments'] != source['segments'] or len(source['segments']) != 1:
            return False
        segment = source['segments'][0]
        if (segment['segment_generation'] != receipt['segment_generation'] or segment['segment_name'] != receipt['segment_name']
                or segment['scan_start_offset'] != 0 or segment['scanned_through_offset'] != source['frame_end_offset']
                or segment['source_durable_end_offset'] != receipt['durable_end_offset']
                or segment['source_durable_bytes_sha256'] != source['event_value_sha256']
                or source['frame_end_offset'] != len(value_bytes(event))
                or source['frame_end_offset'] > receipt['durable_end_offset']
                or segment['retained_event_count'] != 1 or segment['first_sequence_id'] != event['sequence_id']
                or segment['last_sequence_id'] != event['sequence_id']):
            return False
        row_key = f"event_record_index.v2:{partition}:{event['sequence_id']:020}:{event['event_id']}"
        expected_row = dict(schema_id='pm.storage_value.event_record_index.v2', schema_version='2.0.0',
            scope_kind='project', project_id=event['project_id'], scope_partition=partition,
            sequence_id=event['sequence_id'], event_id=event['event_id'], event_type=event['event_type'],
            source_locator=source['source_locator'], publication_locator=dict(
                manifest_generation=selection['manifest_generation'], recovery_epoch=selection['recovery_epoch'],
                survivor_prefix_sha256=selection['manifest_survivor_prefix_sha256'],
                checkpoint_ref=token['checkpoint_ref'], compaction_translation_manifest_ref=None),
            payload_sha256=hashlib.sha256(value_bytes(event['payload'])).hexdigest(),
            producer_semantic_digest=semantic_digest(event), idempotency_key=event['idempotency_key'],
            correlation_id=event['correlation_id'], causation_event_id=event['causation_event_id'],
            persisted_at_utc=event['persisted_at_utc'], redaction_profile=event['redaction_profile'],
            source_schema_id=event['schema_id'], source_schema_version=event['schema_version'], projector_replay_only=False)
        dataset = {row_key: expected_row}
        return (bundle['datasets'] == {token['index_dataset_name']: dataset}
                and frontier['index_row_count'] == 1
                and frontier['index_row_set_sha256'] == binding_digest(dict(
                    domain='pm.event_index.row_set.v1', entries=[dict(key=row_key, value=expected_row)])))
    except (KeyError, ValueError, TypeError, OSError):
        return False


def checkpoint_negative(name, row, event, original, bundle):
    """Independent, schema-valid where possible, identity/route fault injection."""
    row, event, original, bundle = copy.deepcopy((row, event, original, bundle))
    foreign = '22222222-2222-4222-8222-222222222222'
    cp, token, source = (bundle[k] for k in ('checkpoint', 'read_token', 'selected_source'))
    node = cp['generations'][cp['current_generation_id']]
    if name == 'wrong_store_key': bundle['checkpoint_key'] = CHECKPOINT_KEY.format(storage_instance_id=foreign)
    elif name == 'wrong_checkpoint_store': cp['storage_instance_id'] = foreign
    elif name == 'wrong_token_store': token['storage_instance_id'] = foreign
    elif name == 'wrong_source_store': source['storage_instance_id'] = foreign
    elif name == 'wrong_anchor_store': node['anchor']['source_selection']['storage_instance_id'] = foreign
    elif name == 'wrong_frontier_store': node['frontier']['source_selection']['storage_instance_id'] = foreign
    elif name == 'wrong_token_source_store': token['source_selection']['storage_instance_id'] = foreign
    elif name == 'wrong_source_selection': source['source_selection']['manifest_bytes_sha256'] = '0'*64
    elif name == 'wrong_event': source['event']['event_id'] += '-other'
    elif name == 'wrong_custody_store': original['custody']['storage_instance_id'] = foreign
    elif name == 'wrong_custody_event': original['custody']['event_id'] += '-other'
    elif name == 'wrong_partition': source['scope_partition'] = event['project_id']
    elif name == 'wrong_locator': source['source_locator']['byte_offset'] += 1
    elif name == 'wrong_schema_ref': row['checkpoint_schema_ref'] = 'Plans/DOES_NOT_EXIST.schema.json#/$defs/checkpoint'
    elif name == 'wrong_key_route': row['checkpoint_key'] = CHECKPOINT_KEY.format(storage_instance_id=foreign)
    elif name == 'wrong_pointer': token['checkpoint_ref'] += '-missing'
    elif name == 'missing_dataset': bundle['datasets'] = {}
    elif name == 'wrong_frontier': node['frontier']['publication_revision'] += 1
    elif name == 'unverified_source': source['verified'] = False
    elif name == 'wrong_live_snapshot': token['redb_snapshot_id'] += '-other'
    else: raise ValueError('unknown checkpoint fault: ' + name)
    return row, event, original, bundle


def at_path(value, path):
    for key in path:
        value = value[key]
    return value


def set_path(value, path, replacement):
    at_path(value, path[:-1])[path[-1]] = replacement


def identifier_paths(value, schema):
    """Enumerate concrete identifier strings accepted by an adopted pattern.

    Includes local $defs and patternProperties; const/enum joins are still
    checked independently. Unselected application definitions supply no values.
    """
    def values(node, selected, path=()):
        if not isinstance(selected, dict):
            return
        if '$ref' in selected:
            target = schema
            for key in selected['$ref'].removeprefix('#/').split('/'):
                target = target[key.replace('~1','/').replace('~0','~')]
            yield from values(node, target, path)
        if isinstance(node, str) and 'pattern' in selected and re.fullmatch(selected['pattern'], node):
            yield path
        if isinstance(node, dict):
            for key, child in node.items():
                if key in selected.get('properties', {}):
                    yield from values(child, selected['properties'][key], path + (key,))
                for pattern, child_schema in selected.get('patternProperties', {}).items():
                    if re.fullmatch(pattern, key): yield from values(child, child_schema, path + (key,))
        if isinstance(node, list) and 'items' in selected:
            for key, child in enumerate(node): yield from values(child, selected['items'], path + (key,))
        for keyword in ('allOf', 'anyOf', 'oneOf'):
            for child_schema in selected.get(keyword, []): yield from values(node, child_schema, path)
    return sorted(set(values(value, schema)), key=str)


def standing_oracles(check, row, full, first, fixtures, references):
    event = row['event_type']
    check(event, 'S2_project_only_contract', row['scope_policy'] == 'project_only')
    for key in fixtures['application_keys']:
        bad = copy.deepcopy(full); bad.update(scope_kind='application', project_id=None, idempotency_key=key)
        model = AppendModel(row, {}, fixtures['first_append_receipts'][event], fixtures['custody_template'])
        check(event, 'S2_application_refused_' + key, not isinstance(model.append(bad, True), dict) and not model.scoped and not model.global_ids)
    # Compute the expected partition independently of the writer helper.
    expected_partition = 'project~' + base64.urlsafe_b64encode(full['project_id'].encode()).decode().rstrip('=')
    check(event, 'S3_encoded_project_partition', first['custody']['scope_partition'] == expected_partition)
    bad = copy.deepcopy(first); bad['custody']['scope_partition'] = full['project_id']
    check(event, 'S3_stored_raw_partition_refused', not full_value_matches(full,bad,bad['result'],bad['custody']))
    check(event, 'S3_raw_project_partition_refused', not checkpoint_matches(row, full, bad, fixtures['checkpoint_positives'][event]))
    check(event, 'S8_failure_oracle_rejects_success', not rejected(lambda: 0))

    # Every family must catch a reference in an optional property, an unused
    # definition and external documents/fragments, before instance traversal.
    schema_path = row['payload_schema_ref']
    for name, ref in fixtures['unresolved_schema_refs'].items():
        bad_schema = copy.deepcopy(references.documents[schema_path])
        if name == 'unused_definition':
            bad_schema.setdefault('$defs', {})['DR_UNUSED'] = {'$ref': ref}
        else:
            bad_schema['properties']['actor_ref'] = {'$ref': ref}
        check(event, 'S9_unresolved_' + name,
              bool(references.errors([schema_path], {schema_path: bad_schema})))
    # The referenced external document must be walked in full as well.
    external_path = 'Plans/event_record.schema.json'
    bad_schema = copy.deepcopy(references.documents[schema_path])
    bad_schema['properties']['actor_ref'] = {'$ref': references.documents[external_path]['$id'] + '#/properties/event_id'}
    check(event, 'S9_declared_external_id_positive', not references.errors([schema_path], {schema_path: bad_schema}))
    external = copy.deepcopy(references.documents[external_path])
    external.setdefault('$defs', {})['DR_UNUSED'] = {'$ref': '#/$defs/DR_MISSING'}
    check(event, 'S9_unresolved_in_external_unused_definition', bool(references.errors(
        [schema_path], {schema_path: bad_schema, external_path: external})))

    for case in fixtures['history_cases']:
        source = source_for(row, full['payload']); source.update(case['overrides'])
        check(event, 'S10_' + case['id'], inspect(row, full['payload'], source) == case['expected'])
    historical_source = history_source_for(row,full['payload'],first)
    historical_source['current_live_state'] = {'owner_active':False,'status':'deleted','revision':999}
    original_bytes = value_bytes(first)
    check(event,'S10_original_custody_full_resolution',resolve_history(row,first,historical_source,{},decoder=HISTORICAL_V1)
          == 'metadata_and_authorized_refs' and value_bytes(first) == original_bytes)

    for case in fixtures['historical_originals']['cases']:
        if case['event_type'] != event:
            continue
        original = copy.deepcopy(case['original'])
        before = value_bytes(original)
        packs = {k: dict(v, body=v['body'].encode()) for k,v in case['packs'].items()}
        source = history_source_for(row, case['logical_payload'], original)
        source['current_live_state'] = {'owner_active': False, 'status': 'deleted', 'revision': 999}
        label = 'S10_older_original_' + case['route']
        check(event, label + '_preserved', resolve_history(row, original, source, packs, decoder=HISTORICAL_V1)
              == 'metadata_and_authorized_refs' and value_bytes(original) == before)
        check(event, label + '_full_value', full_value_matches(original['event'], original,
              original['result'], original['custody'], validation=HISTORICAL_V1))
        current = AppendModel(row, packs, fixtures['first_append_receipts'][event], fixtures['custody_template'])
        check(event, label + '_current_write_refused', current.append(original['event'], True) == 'invalid' and not current.scoped)
        for flag in ('withdrawn', 'authorized', 'source_valid', 'receipt_valid'):
            bad_source = copy.deepcopy(source); bad_source[flag] = flag == 'withdrawn'
            check(event, label + '_' + flag + '_refused', resolve_history(row, original, bad_source, packs,
                  decoder=HISTORICAL_V1) == 'unavailable')
        for decoder in ('unknown-decoder', CURRENT_WRITER):
            check(event, label + '_' + decoder + '_refused', resolve_history(row,original,source,packs,decoder=decoder) == 'unavailable')
        deleted = dict(source, body_deleted=True)
        check(event, label + '_body_deleted', resolve_history(row,original,deleted,packs,decoder=HISTORICAL_V1) == 'metadata_only')
        forged = copy.deepcopy(original); forged['custody']['original_event_value_commitment']['sha256'] = '0'*64
        check(event, label + '_forged_custody_refused', resolve_history(row,forged,source,packs,decoder=HISTORICAL_V1) == 'unavailable')
        forged = copy.deepcopy(original); forged['event']['observed_at_utc'] = '2026-07-03T00:00:00Z'
        check(event, label + '_forged_event_refused', resolve_history(row,forged,source,packs,decoder=HISTORICAL_V1) == 'unavailable')
        forged = copy.deepcopy(original); forged['custody']['group_digest'] = '0'*64
        check(event, label + '_forged_well_formed_custody_refused',resolve_history(row,forged,source,packs,decoder=HISTORICAL_V1) == 'unavailable')
        forged = copy.deepcopy(original); forged['result']['first_append_receipt']['acknowledged_at_utc'] = '2026-07-03T00:00:00Z'
        check(event,label + '_forged_well_formed_receipt_refused',resolve_history(row,forged,source,packs,decoder=HISTORICAL_V1) == 'unavailable')

    if event in PROVIDER_HASH_PATHS:
        path = PROVIDER_HASH_PATHS[event]
        adopted = validator(load(schema_path))
        for name, digest in fixtures['provider_hash_values'].items():
            permitted = name in ('valid', 'unknown')
            for route in ('inline', 'packed'):
                bad = copy.deepcopy(full); set_path(bad['payload'], path, digest)
                check(event, 'S5_provider_hash_schema_' + name + '_' + route,
                      adopted.is_valid(bad['payload']) == permitted)
                packs = {}
                if route == 'packed':
                    bad['payload']['summary'] = 'x' * 17000
                    bad['payload'], bad['payload_ref'] = storage_form(bad['payload'], packs)
                check(event, 'S5_provider_hash_decode_' + name + '_' + route,
                      rejected(lambda: decode(row, bad, packs)) != permitted)
                model = AppendModel(row, packs, fixtures['first_append_receipts'][event], fixtures['custody_template'])
                result = model.append(bad, True)
                check(event, 'S5_provider_hash_append_' + name + '_' + route,
                      isinstance(result, dict) == permitted and bool(model.scoped) == permitted)
            bad = copy.deepcopy(full); set_path(bad['payload'], path, digest)
            stored = copy.deepcopy(first); stored['event'] = bad
            stored['custody']['producer_semantic_digest'] = semantic_digest(bad)
            stored['custody']['original_event_value_commitment'] = commitment(bad)
            stored['result']['original_event_value_commitment'] = commitment(bad)
            check(event, 'S5_provider_hash_stored_' + name,
                  full_value_matches(bad, stored, stored['result'], stored['custody']) == permitted)

    # All concrete identifier patterns, including original stored copies.
    for label, value, schema in [('event', full, EVENT_VALIDATOR.schema),
                                  ('payload', full['payload'], load(row['payload_schema_ref'])),
                                  ('custody', first['custody'], RECEIPT_SCHEMA),
                                  ('result', first['result'], RECEIPT_SCHEMA)]:
        valid = {'event': EVENT_VALIDATOR, 'payload': validator(schema),
                 'custody': CUSTODY_VALIDATOR, 'result': RESULT_VALIDATOR}[label]
        for path in identifier_paths(value, valid.schema):
            bad = copy.deepcopy(value); set_path(bad, path, at_path(value, path) + '\n')
            check(event, 'S5_' + label + '_LF_' + '/'.join(map(str, path)), not valid.is_valid(bad))
    for field in fixtures['payload_digest_fields'].get(event, []):
        for name, digest in fixtures['malformed_identifiers'].items():
            bad = copy.deepcopy(full); bad['payload']['type_payload'][field] = digest
            check(event, 'S5_payload_schema_' + field + '_' + name, not validator(load(row['payload_schema_ref'])).is_valid(bad['payload']))
            for route in ('inline', 'packed'):
                packs = {}
                if route == 'packed':
                    bad['payload']['summary'] = 'x'*17000
                    bad['payload'], bad['payload_ref'] = storage_form(bad['payload'], packs)
                check(event, 'S5_payload_decode_' + field + '_' + name + '_' + route, rejected(lambda: decode(row, bad, packs)))
                model = AppendModel(row, packs, fixtures['first_append_receipts'][event], fixtures['custody_template'])
                check(event, 'S5_payload_append_' + field + '_' + name + '_' + route, model.append(bad, True) == 'invalid' and not model.scoped)
            # Self-consistent hashes/equality cannot redeem invalid stored payloads.
            bad = copy.deepcopy(full); bad['payload']['type_payload'][field] = digest
            stored = copy.deepcopy(first); stored['event'] = bad
            stored['custody']['producer_semantic_digest'] = semantic_digest(bad)
            stored['custody']['original_event_value_commitment'] = commitment(bad)
            stored['result']['original_event_value_commitment'] = commitment(bad)
            check(event, 'S5_stored_payload_' + field + '_' + name, not full_value_matches(bad, stored, stored['result'], stored['custody']))
    for name, digest in fixtures['malformed_identifiers'].items():
        for path in [('group_digest',), ('producer_semantic_digest',), ('original_event_value_commitment', 'sha256')]:
            stored = copy.deepcopy(first); set_path(stored['custody'], path, digest)
            if path[0] == 'original_event_value_commitment':
                stored['result']['original_event_value_commitment']['sha256'] = digest
            check(event, 'S5_stored_custody_' + '/'.join(path) + '_' + name,
                  not CUSTODY_VALIDATOR.is_valid(stored['custody']) and not full_value_matches(full, stored, stored['result'], stored['custody']))
        template = copy.deepcopy(fixtures['custody_template']); template['group_digest'] = digest
        model = AppendModel(row, {}, fixtures['first_append_receipts'][event], template)
        check(event, 'S5_custody_append_' + name, model.append(full, True) == 'invalid' and not model.scoped and not model.global_ids)

    bundle = fixtures['checkpoint_positives'][event]
    check(event, 'S7_checkpoint_positive', checkpoint_matches(row, full, first, bundle))
    for name in fixtures['checkpoint_negative_cases']:
        args = checkpoint_negative(name, row, full, first, bundle)
        check(event, 'S7_' + name, not checkpoint_matches(*args))
    cp_schema = load(CHECKPOINT_SCHEMA.split('#')[0])
    for label, value, definition in [('checkpoint', bundle['checkpoint'], 'checkpoint'), ('read_token', bundle['read_token'], 'read_token')]:
        valid = validator(cp_schema, definition)
        for path in identifier_paths(value, valid.schema):
            bad = copy.deepcopy(value); set_path(bad, path, at_path(value, path) + '\n')
            check(event, 'S5_' + label + '_LF_' + '/'.join(map(str,path)), not valid.is_valid(bad))
        if label == 'checkpoint':
            bad = copy.deepcopy(value); key = bad['current_generation_id']; bad['generations'][key+'\n'] = bad['generations'].pop(key)
            check(event, 'S5_checkpoint_map_key_LF', not valid.is_valid(bad))


def source_for(row, payload):
    return dict(project_id=payload['project_id'], event_type=row['event_type'], original_payload=copy.deepcopy(payload),
                authorized=True, source_valid=True, receipt_valid=True, withdrawn=False, body_deleted=False)


def history_source_for(row, payload, authentic_original):
    """Freeze the synthetic source adapter's independently authenticated read.

    Caller-supplied candidate/custody is compared to this original, never used
    to authenticate itself. Real authentication/receipt issuance stays NOT_RUN.
    """
    return dict(source_for(row,payload),authenticated_original=copy.deepcopy(authentic_original))


def rejected(action):
    try:
        action()
    except (ValueError, KeyError, UnicodeError, TypeError):
        return True
    return False


def observation_admissible(candidate, previous, row, packs, source):
    """Ordinal/predecessor/source model; not a native owner fence or read proof."""
    if not source['proof_valid'] or not source['predecessor_complete'] or not source['snapshot_current']:
        return False
    try:
        payload = decode(row, candidate, packs)
    except (ValueError, KeyError):
        return False
    if candidate['correlation_id'] != grouping_identity(row['event_type'], payload):
        return False
    if payload['type_payload'] != source['canonical_point']:
        return False
    if previous is None:
        return candidate['producer_sequence_id'] == 0 and candidate['parent_event_id'] is None
    old = decode(row, previous, packs)
    immutable = ('restore_point_id', 'project_id', 'record_ref', 'record_sha256', 'source_thread_id', 'source_branch_id', 'source_message_id')
    if payload['artifact_id'] != old['artifact_id'] or any(payload['type_payload'][k] != old['type_payload'][k] for k in immutable):
        return False
    if payload['type_payload'] == old['type_payload']:
        return False  # Unchanged source returns original, never allocates the proposed next ordinal.
    old_status = old['type_payload']['status']
    if old_status != 'available' and payload['type_payload']['status'] != old_status:
        return False
    return (candidate['producer_sequence_id'] == previous['producer_sequence_id'] + 1
            and candidate['parent_event_id'] == previous['event_id']
            and candidate['correlation_id'] == previous['correlation_id'])


def main():
    document = load('Plans/runtime_artifact_event_drafts.json')
    fixtures = load('Plans/runtime_artifact_event_drafts.fixtures.json')
    references = SchemaReferences()
    failures, counts, unresolved_families = [], {}, set()
    def check(family, name, passed):
        counts[family] = counts.get(family, 0) + 1
        if not passed:
            failures.append(family + ':' + name)

    # An independently frozen CV-339 complete-value vector catches codec/preimage drift.
    known = load('Plans/event_append_receipt_full_value_fixtures.json')
    check('shared', 'full_value_known_answer', commitment(known['base_original_event'])['sha256'] == known['commitment_sha256'])
    a, b = dict(project_id='bc', artifact_id='d', schema_id='e'), dict(project_id='c', artifact_id='d', schema_id='e')
    check('shared', 'length_framing', identity('a', a) != identity('ab', b))
    check('shared', 'blake3_known_answer', blake3(b'').hexdigest() == 'af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262')
    check('shared', 'rfc8785_known_answer', rfc8785.dumps({'\U0001f600':1, '\ue000':2}) == '{"\U0001f600":1,"\ue000":2}'.encode())
    check('shared', 'all_19_rows', len(document['rows']) == 19 and {r['event_type'] for r in document['rows']} == set(fixtures['positive_payloads']) == set(fixtures['positive_events']) == set(fixtures['checkpoint_positives']) == set(fixtures['first_append_receipts']))
    check('shared', 'inline_limit_exact', INLINE_LIMIT == 16384)
    generic = load('Plans/event_record_index_checkpoint_contract_fixtures.json')['positive']['initial_mixed_scope']['checkpoint']
    node = generic['generations'][generic['current_generation_id']]
    check('shared', 'SP278_generation_known_answer', generic['current_generation_id'] == 'eig_' + binding_digest(dict(
        domain='pm.event_index.generation.v1', storage_instance_id=generic['storage_instance_id'],
        projector_version=node['projector_version'], birth_source_selection=node['anchor']['source_selection'],
        generation_seed_sha256=node['anchor']['generation_seed_sha256'])))
    check('shared', 'all_semantic_fields_tested', set(fixtures['semantic_mutations']) == set(SEMANTIC_FIELDS))
    check('shared', 'all_receipt_fields_tested', set(fixtures['receipt_mutations']) == set(RECEIPT_SCHEMA['$defs']['AppendReceipt']['required']))
    registry = load('Plans/storage_value_registry.json')['families']
    index_policy = next(f['retention_policy_ref'] for f in registry if f['family_id'] == 'event_record_index')
    checkpoint_policy = next(f['retention_policy_ref'] for f in registry if f['family_id'] == 'event_record_index_checkpoint')
    for row in document['rows']:
        event = row['event_type']
        ref_errors = references.errors([row['payload_schema_ref'], 'Plans/event_record.schema.json',
                                       'Plans/event_append_receipt_contracts.schema.json',
                                       CHECKPOINT_SCHEMA.split('#')[0]])
        check(event, 'S9_schema_reference_preflight' + (': ' + '; '.join(ref_errors) if ref_errors else ''), not ref_errors)
        if ref_errors:
            unresolved_families.add(event)
            continue  # Fail closed before any payload or optional branch is visited.
        check(event, 'prepared_contract', row['outcome'] == 'register (prepared)')
        check(event, 'index_retention', row['index_retention_policy_ref'] == index_policy == 'RP-EVENT-INDEX-SOURCE')
        check(event, 'checkpoint_retention', policies_match(row, index_policy, checkpoint_policy) and checkpoint_policy == 'RP-PROJECTION-3GEN')
        # Negative policy cases would have caught B1's conflated derived assignment.
        check(event, 'wrong_index_policy_rejected', not policies_match(dict(row, index_retention_policy_ref='RP-PROJECTION-3GEN'), index_policy, checkpoint_policy))
        schema = load(row['payload_schema_ref'])
        check(event, 'closed_schema', schema['additionalProperties'] is False and schema['$id'] == row['payload_schema_id'])
        Draft202012Validator.check_schema(schema)
        valid = validator(schema)
        payload = fixtures['positive_payloads'][event]
        check(event, 'valid', not list(valid.iter_errors(payload)))
        for name, field, value in [('closed_root','unexpected_event_extension',True), ('wrong_type','artifact_type','wrong_type')]:
            bad = copy.deepcopy(payload); bad[field] = value
            check(event, name, bool(list(valid.iter_errors(bad))))
        bad = copy.deepcopy(payload); del bad['artifact_id']
        check(event, 'missing_identity', bool(list(valid.iter_errors(bad))))
        for case in fixtures['source_cases']:
            source = source_for(row, payload); source.update(case['overrides'])
            check(event, case['id'], inspect(row, payload, source) == case['expected'])
        changed = copy.deepcopy(payload); changed['summary'] = 'changed semantic summary'
        revision = 0 if event.endswith('.restore_point') else None
        check(event, 'immutable_payload', identity(event, payload, revision) == identity(event, changed, revision)
              and inspect(row, changed, source_for(row, payload)) == 'identity_conflict')
        other = copy.deepcopy(payload); other['project_id'] += '-other'
        check(event, 'cross_project_identity', identity(event, payload, revision) != identity(event, other, revision))
        packs = {}
        full = copy.deepcopy(fixtures['positive_events'][event])
        check(event, 'full_envelope', not rejected(lambda: decode(row, full, packs)) and decode(row, full, packs) == payload)
        check(event, 'semantic_known_answer', semantic_digest(full) == fixtures['known_answers'][event]['producer_semantic_digest'])
        check(event, 'full_value_known_answer', commitment(full)['sha256'] == fixtures['known_answers'][event]['full_value_sha256'])
        receipt = fixtures['first_append_receipts'][event]
        model = AppendModel(row, packs, receipt, fixtures['custody_template'])
        first = model.append(full, admission=True)
        check(event, 'full_first_receipt', isinstance(first, dict) and full_value_matches(full, first, first['result'], first['custody']))
        if not isinstance(first, dict):
            unresolved_families.add(event)
            continue  # Invalid positive inputs must produce a structured failure, never false success.
        standing_oracles(check, row, full, first, fixtures, references)
        replay = model.append(copy.deepcopy(full), admission=True)
        check(event, 'lost_ack_exact_result', first is replay and len(model.scoped) == 1)
        alternate = copy.deepcopy(full); alternate['event_id'] += '-other-delivery'
        check(event, 'alternate_event_id_returns_original', model.append(alternate, admission=True) is first and len(model.scoped) == 1)
        for policy, expected in fixtures['append_policy_refusals'].items():
            bad = copy.deepcopy(full); bad['replay_policy'] = policy
            fresh = AppendModel(row, packs, receipt, fixtures['custody_template'])
            before = copy.deepcopy((model.scoped, model.global_ids))
            check(event, 'policy_schema_valid_' + policy, not list(EVENT_VALIDATOR.iter_errors(bad)))
            check(event, 'policy_digest_unchanged_' + policy, semantic_digest(bad) == semantic_digest(full))
            check(event, 'fresh_policy_refused_' + policy, fresh.append(bad, True) == expected and not fresh.scoped and not fresh.global_ids)
            check(event, 'retry_policy_refused_' + policy, model.append(bad, True) == expected and (model.scoped, model.global_ids) == before)
            bad['event_id'] += '-other-delivery'
            check(event, 'alternate_id_policy_refused_' + policy, model.append(bad, True) == expected and (model.scoped, model.global_ids) == before)
        check(event, 'withdrawal_no_append', model.append(full) == 'withdrawn' and len(model.scoped) == 1)
        check(event, 'unproven_source_no_append', model.append(full, True, False) == 'unavailable' and len(model.scoped) == 1)
        check(event, 'dedupe_unavailable_no_append', model.append(full, True, True, False) == 'unavailable' and len(model.scoped) == 1)
        mutated = copy.deepcopy(full); mutated['payload'] = changed
        check(event, 'retry_conflict_no_append', model.append(mutated, True) == 'idempotency_conflict' and len(model.scoped) == 1)
        for field in EVENT_VALIDATOR.schema['required']:
            bad = copy.deepcopy(full); del bad[field]
            check(event, 'missing_envelope_' + field, bool(list(EVENT_VALIDATOR.iter_errors(bad))))
        bad = copy.deepcopy(full); bad['unknown_envelope'] = True
        check(event, 'closed_envelope', bool(list(EVENT_VALIDATOR.iter_errors(bad))))
        for field, value in fixtures['semantic_mutations'].items():
            bad = copy.deepcopy(full); bad[field] = value
            if field == 'scope_kind':
                bad['project_id'] = None
            check(event, 'semantic_digest_' + field, semantic_digest(bad) != semantic_digest(full))
            check(event, 'semantic_conflict_' + field, model.append(bad, True) == 'idempotency_conflict' and len(model.scoped) == 1)
        for field in STORAGE_FIELDS:
            bad = copy.deepcopy(full); bad[field] = fixtures['storage_mutations'][field]
            check(event, 'storage_excluded_' + field, semantic_digest(bad) == semantic_digest(full) and model.append(bad, True) is first)
            check(event, 'full_value_binds_' + field, not full_value_matches(bad, first, first['result'], first['custody']))
        for field, value in fixtures['receipt_mutations'].items():
            bad_result, bad_custody = copy.deepcopy(first['result']), copy.deepcopy(first['custody'])
            bad_result['first_append_receipt'][field] = value
            bad_custody['first_append_receipt'][field] = value
            check(event, 'receipt_binds_' + field, not full_value_matches(full, first, bad_result, bad_custody))
            del bad_result['first_append_receipt'][field]
            check(event, 'receipt_requires_' + field, bool(list(RECEIPT_VALIDATOR.iter_errors(bad_result['first_append_receipt']))))
        bad_result = copy.deepcopy(first['result']); bad_result['original_event_value_commitment']['sha256'] = '0'*64
        check(event, 'corrupt_full_commitment', not full_value_matches(full, first, bad_result, first['custody']))
        bad_custody = copy.deepcopy(first['custody']); bad_custody['schema_id']='pm.storage_value.event_append_receipt_custody.v1'; bad_custody['schema_version']='1.0.0'
        check(event, 'v1_custody_no_full_value_fallback', not full_value_matches(full, first, first['result'], bad_custody))
        bad = copy.deepcopy(full); bad['event_id'] += '-semantic-duplicate'
        check(event, 'full_value_requires_original_event_id', not full_value_matches(bad, first, first['result'], first['custody']))
        bad_result = copy.deepcopy(first['result']); bad_result['first_append_receipt']['unexpected']=True
        check(event, 'closed_first_receipt', not full_value_matches(full,first,bad_result,first['custody']))
        for field in ('schema_version','payload_schema_id','event_type','project_id','run_id','attempt_id','thread_id','node_id','occurred_at_utc','idempotency_key'):
            bad = copy.deepcopy(full); bad[field] = 'unsupported' if field != 'occurred_at_utc' else '2026-07-03T00:00:00Z'
            check(event, 'dispatch_join_' + field, rejected(lambda: decode(row, bad, packs)))
        for size in (16383, 16384, 16385, 17000):
            large = copy.deepcopy(payload); large['summary'] = ''
            padding = size - len(rfc8785.dumps(large))
            large['summary'] = 'x' * padding
            check(event, 'size_valid_' + str(size), not list(valid.iter_errors(large)) and len(rfc8785.dumps(large)) == size)
            candidate = copy.deepcopy(full)
            candidate['payload'], candidate['payload_ref'] = storage_form(large, packs)
            check(event, 'size_dispatch_' + str(size), decode(row, candidate, packs) == large and (candidate['payload_ref'] is None) == (size <= 16384))
            if size > 16384:
                bad = copy.deepcopy(candidate); bad['payload'], bad['payload_ref'] = large, None
                check(event, 'oversized_inline_rejected_' + str(size), rejected(lambda: decode(row, bad, packs)))
                stored = copy.deepcopy(first); stored['event'] = bad
                stored['custody']['producer_semantic_digest'] = semantic_digest(bad)
                stored['custody']['original_event_value_commitment'] = commitment(bad)
                stored['result']['original_event_value_commitment'] = commitment(bad)
                check(event, 'S4_stored_oversized_inline_' + str(size), not full_value_matches(bad,stored,stored['result'],stored['custody']))
        # The review's exact 17,000-byte-summary counterexample, independently of total size.
        large = copy.deepcopy(payload); large['summary'] = 'x' * 17000
        candidate = copy.deepcopy(full); candidate['payload'], candidate['payload_ref'] = storage_form(large, packs)
        check(event, 'review_17000_summary_externalized', decode(row, candidate, packs) == large and candidate['payload_ref'] is not None)
        packed = copy.deepcopy(packs)
        digest = PACK_REF.fullmatch(candidate['payload_ref']).group(1)
        # Digest corruption preserves reachability, size, JSON canonicality and
        # the logical schema. Missing bytes and size faults have separate cases.
        corrupt = copy.deepcopy(large); corrupt['summary'] = 'y' + corrupt['summary'][1:]
        corrupt_body = rfc8785.dumps(corrupt)
        check(event, 'corrupt_pack_other_guards_valid', len(corrupt_body) == len(packed[digest]['body'])
              and valid.is_valid(corrupt) and rfc8785.dumps(json.loads(corrupt_body)) == corrupt_body)
        for name, update in [('missing_pack',None), ('corrupt_pack',{'body':corrupt_body}), ('unsynced_pack',{'durable':False}), ('unauthorized_pack',{'authorized':False})]:
            broken = copy.deepcopy(packed)
            if update is None:
                del broken[digest]
            else:
                broken[digest].update(update)
            check(event, name, rejected(lambda: decode(row, candidate, broken)))
        for name, ref in [('missing_digest',candidate['payload_ref'].replace(digest,'0'*64)),
                          ('wrong_size',candidate['payload_ref'].replace(':'+str(len(rfc8785.dumps(large)))+':', ':1:')),
                          ('wrong_media',candidate['payload_ref'].replace('application/json','text/plain')),
                          ('S5_pack_reference_LF',candidate['payload_ref']+'\n')]:
            bad = copy.deepcopy(candidate); bad['payload_ref'] = ref
            check(event, name, rejected(lambda: decode(row, bad, packed)))
        bad = copy.deepcopy(candidate); bad['payload'] = copy.deepcopy(payload)
        check(event, 'both_payload_routes', rejected(lambda: decode(row, bad, packed)))
        bad = copy.deepcopy(candidate); bad['payload_ref'] = None
        check(event, 'neither_payload_route', rejected(lambda: decode(row, bad, packed)))
        # Correctly hashed, otherwise well-formed pack containing the wrong logical family.
        wrong = copy.deepcopy(large); wrong['artifact_type'] = 'wrong_type'
        bad = copy.deepcopy(full); bad['payload'],bad['payload_ref'] = storage_form(wrong, packs)
        check(event, 'external_schema_dispatch', rejected(lambda: decode(row, bad, packs)))
        for name, body in [('duplicate_json_key', rfc8785.dumps(large)[:-1]+b',"summary":"'+b'x'*17000+b'"}'),
                           ('noncanonical_json', json.dumps(large, indent=2).encode())]:
            digest_bad = blake3(body).hexdigest(); packs[digest_bad] = dict(body=body,durable=True,authorized=True)
            bad = copy.deepcopy(full); bad['payload'] = {}; bad['payload_ref'] = f'pm.payload_pack.v1:blake3:{digest_bad}:{len(body)}:application/json'
            check(event, name, rejected(lambda: decode(row, bad, packs)))
        # External replay also binds original reference bytes and all receipt fields.
        external_model = AppendModel(row, packed, receipt, fixtures['custody_template'])
        external = external_model.append(candidate, True)
        check(event, 'external_full_receipt_replay', isinstance(external,dict) and full_value_matches(candidate,external,external['result'],external['custody']) and external_model.append(copy.deepcopy(candidate),True) is external)
        bad = copy.deepcopy(candidate); bad['payload_ref'] += '\n'
        stored = copy.deepcopy(external); stored['event'] = bad
        stored['custody']['producer_semantic_digest'] = semantic_digest(bad)
        stored['custody']['original_event_value_commitment'] = commitment(bad)
        stored['result']['original_event_value_commitment'] = commitment(bad)
        check(event, 'S5_stored_pack_reference_LF', not full_value_matches(bad,stored,stored['result'],stored['custody']))
        for policy, expected in fixtures['append_policy_refusals'].items():
            bad = copy.deepcopy(candidate); bad['replay_policy'] = policy
            fresh = AppendModel(row, packed, receipt, fixtures['custody_template'])
            before = copy.deepcopy((external_model.scoped, external_model.global_ids))
            check(event, 'external_fresh_policy_refused_' + policy, fresh.append(bad, True) == expected and not fresh.scoped and not fresh.global_ids)
            check(event, 'external_retry_policy_refused_' + policy, external_model.append(bad, True) == expected and (external_model.scoped, external_model.global_ids) == before)
        if event.endswith('.restore_point'):
            source = dict(proof_valid=True, predecessor_complete=True, snapshot_current=True, canonical_point=payload['type_payload'])
            check(event, 'first_observation', observation_admissible(full,None,row,packs,source))
            check(event, 'grouping_known_answer', grouping_identity(event, payload) == full['correlation_id'])
            other_group = copy.deepcopy(payload); other_group['artifact_id'] += '-other-group'
            for name, correlation in [('incorrect', 'not-the-ra1-grouping-key'), ('cross_group', grouping_identity(event, other_group))]:
                bad = copy.deepcopy(full); bad['correlation_id'] = correlation
                check(event, 'first_' + name + '_correlation_schema_valid', decode(row, bad, packs) == payload)
                check(event, 'first_' + name + '_correlation_refused', not observation_admissible(bad,None,row,packs,source))
            successor = copy.deepcopy(fixtures['restore_successor'])
            source['canonical_point'] = successor['payload']['type_payload']
            check(event, 'next_lifecycle_observation', observation_admissible(successor,full,row,packs,source))
            for name, correlation in [('incorrect', 'not-the-ra1-grouping-key'), ('cross_group', grouping_identity(event, other_group))]:
                bad = copy.deepcopy(successor); bad['correlation_id'] = correlation
                check(event, 'next_' + name + '_correlation_refused', not observation_admissible(bad,full,row,packs,source))
                predecessor = copy.deepcopy(full); predecessor['correlation_id'] = correlation
                check(event, 'matching_wrong_' + name + '_correlations_refused', not observation_admissible(bad,predecessor,row,packs,source))
            check(event, 'same_point_artifact_new_event_identity', successor['payload']['artifact_id'] == payload['artifact_id'] and successor['payload']['type_payload']['restore_point_id'] == payload['type_payload']['restore_point_id'] and successor['idempotency_key'] != full['idempotency_key'])
            second = model.append(successor,True)
            check(event, 'successor_replay', isinstance(second,dict) and model.append(copy.deepcopy(successor),True) is second and len(model.scoped)==2)
            for field,value in [('producer_sequence_id',0),('producer_sequence_id',2),('parent_event_id',None),('parent_event_id','other-event')]:
                bad = copy.deepcopy(successor); bad[field] = value
                if field == 'producer_sequence_id':
                    bad['idempotency_key'] = identity(event, bad['payload'], value)
                check(event, 'stale_predecessor_dispatch_'+field+'_'+str(value), decode(row,bad,packs) == bad['payload'])
                check(event, 'stale_predecessor_'+field+'_'+str(value), not observation_admissible(bad,full,row,packs,source))
            for flag in ('proof_valid','predecessor_complete','snapshot_current'):
                bad_source = dict(source); bad_source[flag] = False
                check(event, 'observation_'+flag, not observation_admissible(successor,full,row,packs,bad_source))
            refresh = copy.deepcopy(successor); refresh['payload'] = copy.deepcopy(payload)
            refresh['payload']['projection_freshness']='current'; refresh['payload']['summary']='viewer refresh'
            unchanged = dict(source,canonical_point=payload['type_payload'])
            check(event, 'refresh_does_not_advance', not observation_admissible(refresh,full,row,packs,unchanged))
            bad = copy.deepcopy(successor); bad['payload']['type_payload']['restore_point_id'] += '-other'
            check(event, 'cross_point_observation', not observation_admissible(bad,full,row,packs,dict(source,canonical_point=bad['payload']['type_payload'])))
            bad = copy.deepcopy(successor); bad['payload']['type_payload']['actions']['apply']['availability']='available'
            check(event, 'terminal_action_remains_unavailable', bool(list(valid.iter_errors(bad['payload']))))
            for status, terminal in fixtures['restore_terminal_observations'].items():
                actual = dict(source, canonical_point=terminal['payload']['type_payload'])
                check(event, 'terminal_' + status, observation_admissible(terminal,full,row,packs,actual))
                for action in ('apply','branch','delete'):
                    broken = copy.deepcopy(terminal['payload']); broken['type_payload']['actions'][action]['availability']='available'
                    check(event, 'terminal_'+status+'_'+action+'_refused', bool(list(valid.iter_errors(broken))))
            for flag in ('mutates_source_thread','mutates_source_branch','mutates_source_worktree','mutates_git_index','mutates_runtime_safe_points','restores_files'):
                broken = copy.deepcopy(payload); broken['type_payload']['workspace_effects'][flag]=True
                check(event, 'no_source_effect_' + flag, bool(list(valid.iter_errors(broken))))
    boundary = SimpleNamespace(**globals())
    boundary.SchemaReferences = lambda: references
    for guard, family, name, positive, negative in guard_cases(boundary, excluded=unresolved_families):
        check(family, 'S11_' + guard + '_' + name + '_positive', guard_accepted(lambda: positive(boundary)))
        check(family, 'S11_' + guard + '_' + name + '_negative', not guard_accepted(lambda: negative(boundary)))
    print(json.dumps(dict(status='fail' if failures else 'pass', cases=sum(counts.values()), per_family=counts,
                          failures=failures, native_execution='NOT_RUN', admission='NONE',
                          scope='static full-envelope/schema/receipt/hash and bounded source/append/observation models'),indent=2))
    return bool(failures)


if __name__ == '__main__':
    sys.exit(main())
