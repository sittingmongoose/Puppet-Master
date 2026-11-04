#!/usr/bin/env python3
"""DR static contracts: real hashes over fixture bytes, bounded custody/append models.

Install scripts/requirements-runtime-artifact-drafts.txt in a venv. No native
storage, transaction, source authentication, receipt issuance or admission runs.
"""
import copy
import hashlib
import json
import math
from pathlib import Path
import re
import struct
import sys

from blake3 import blake3
import msgpack
import rfc8785
from jsonschema import Draft202012Validator, FormatChecker

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


def load(path):
    return json.loads((ROOT / path).read_text())


def validator(schema, definition=None):
    if definition:
        schema = dict(schema, **{'$ref': '#/$defs/' + definition})
    return Draft202012Validator(schema, format_checker=FormatChecker())


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


def decode(row, event, packs):
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
    if list(validator(schema).iter_errors(payload)):
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


def full_value_matches(candidate, original, result, custody):
    if (list(EVENT_VALIDATOR.iter_errors(candidate)) or list(RECEIPT_VALIDATOR.iter_errors(result['first_append_receipt']))
            or list(CUSTODY_VALIDATOR.iter_errors(custody)) or list(RESULT_VALIDATOR.iter_errors(result))):
        return False
    receipt = result['first_append_receipt']
    stored = original['event']
    return (value_bytes(candidate) == value_bytes(stored)
            and result == original['result'] and custody == original['custody']
            and receipt == custody['first_append_receipt']
            and receipt['event_id'] == candidate['event_id'] == custody['event_id']
            and receipt['sequence_id'] == candidate['sequence_id']
            and result['original_segment_ref'] == custody['original_segment_ref']
            and commitment(candidate) == custody['original_event_value_commitment'] == result['original_event_value_commitment']
            and semantic_digest(candidate) == custody['producer_semantic_digest'])


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
        import base64
        partition = 'project~' + base64.urlsafe_b64encode(event['project_id'].encode()).decode().rstrip('=')
        custody.update(event_id=event['event_id'], scope_partition=partition, event_type=event['event_type'],
                       idempotency_key=event['idempotency_key'], producer_semantic_digest=digest,
                       first_append_receipt=receipt, original_event_value_commitment=commitment(event))
        result = {k: copy.deepcopy(custody[k]) for k in ('first_append_receipt', 'original_segment_ref', 'original_event_value_commitment')}
        original = dict(event=copy.deepcopy(event), result=result, custody=custody)
        self.scoped[key] = original
        self.global_ids[event['event_id']] = digest
        return original


def policies_match(row, index_policy, checkpoint_policy):
    return (row.get('index_retention_policy_ref') == index_policy
            and row.get('checkpoint_retention_policy_ref') == checkpoint_policy
            and 'derived_retention_policy_ref' not in row)


def source_for(row, payload):
    return dict(project_id=payload['project_id'], event_type=row['event_type'], original_payload=copy.deepcopy(payload),
                authorized=True, source_valid=True, receipt_valid=True, withdrawn=False, body_deleted=False)


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
    failures, counts = [], {}
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
    check('shared', 'all_19_rows', len(document['rows']) == 19 and {r['event_type'] for r in document['rows']} == set(fixtures['positive_payloads']) == set(fixtures['positive_events']))
    check('shared', 'all_semantic_fields_tested', set(fixtures['semantic_mutations']) == set(SEMANTIC_FIELDS))
    check('shared', 'all_receipt_fields_tested', set(fixtures['receipt_mutations']) == set(RECEIPT_SCHEMA['$defs']['AppendReceipt']['required']))
    registry = load('Plans/storage_value_registry.json')['families']
    index_policy = next(f['retention_policy_ref'] for f in registry if f['family_id'] == 'event_record_index')
    checkpoint_policy = next(f['retention_policy_ref'] for f in registry if f['family_id'] == 'event_record_index_checkpoint')
    for row in document['rows']:
        event = row['event_type']
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
        check(event, 'full_envelope', decode(row, full, packs) == payload)
        check(event, 'semantic_known_answer', semantic_digest(full) == fixtures['known_answers'][event]['producer_semantic_digest'])
        check(event, 'full_value_known_answer', commitment(full)['sha256'] == fixtures['known_answers'][event]['full_value_sha256'])
        receipt = fixtures['first_append_receipt']
        model = AppendModel(row, packs, receipt, fixtures['custody_template'])
        first = model.append(full, admission=True)
        check(event, 'full_first_receipt', isinstance(first, dict) and full_value_matches(full, first, first['result'], first['custody']))
        replay = model.append(copy.deepcopy(full), admission=True)
        check(event, 'lost_ack_exact_result', first is replay and len(model.scoped) == 1)
        alternate = copy.deepcopy(full); alternate['event_id'] += '-other-delivery'
        check(event, 'alternate_event_id_returns_original', model.append(alternate, admission=True) is first and len(model.scoped) == 1)
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
            check(event, 'size_dispatch_' + str(size), decode(row, candidate, packs) == large and (candidate['payload_ref'] is None) == (size <= INLINE_LIMIT))
            if size > INLINE_LIMIT:
                bad = copy.deepcopy(candidate); bad['payload'], bad['payload_ref'] = large, None
                check(event, 'oversized_inline_rejected_' + str(size), rejected(lambda: decode(row, bad, packs)))
        # The review's exact 17,000-byte-summary counterexample, independently of total size.
        large = copy.deepcopy(payload); large['summary'] = 'x' * 17000
        candidate = copy.deepcopy(full); candidate['payload'], candidate['payload_ref'] = storage_form(large, packs)
        check(event, 'review_17000_summary_externalized', decode(row, candidate, packs) == large and candidate['payload_ref'] is not None)
        packed = copy.deepcopy(packs)
        digest = PACK_REF.fullmatch(candidate['payload_ref']).group(1)
        for name, update in [('missing_pack',None), ('corrupt_pack',{'body':b'{}'}), ('unsynced_pack',{'durable':False}), ('unauthorized_pack',{'authorized':False})]:
            broken = copy.deepcopy(packed)
            if update is None:
                del broken[digest]
            else:
                broken[digest].update(update)
            check(event, name, rejected(lambda: decode(row, candidate, broken)))
        for name, ref in [('wrong_digest',candidate['payload_ref'].replace(digest,'0'*64)),
                          ('wrong_size',candidate['payload_ref'].replace(':'+str(len(rfc8785.dumps(large)))+':', ':1:')),
                          ('wrong_media',candidate['payload_ref'].replace('application/json','text/plain'))]:
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
        for name, body in [('duplicate_json_key', b'{"summary":"'+b'x'*17000+b'","summary":"duplicate"}'),
                           ('noncanonical_json', json.dumps(large, indent=2).encode())]:
            digest_bad = blake3(body).hexdigest(); packs[digest_bad] = dict(body=body,durable=True,authorized=True)
            bad = copy.deepcopy(full); bad['payload'] = {}; bad['payload_ref'] = f'pm.payload_pack.v1:blake3:{digest_bad}:{len(body)}:application/json'
            check(event, name, rejected(lambda: decode(row, bad, packs)))
        # External replay also binds original reference bytes and all receipt fields.
        external_model = AppendModel(row, packed, receipt, fixtures['custody_template'])
        external = external_model.append(candidate, True)
        check(event, 'external_full_receipt_replay', isinstance(external,dict) and full_value_matches(candidate,external,external['result'],external['custody']) and external_model.append(copy.deepcopy(candidate),True) is external)
        if event.endswith('.restore_point'):
            source = dict(proof_valid=True, predecessor_complete=True, snapshot_current=True, canonical_point=payload['type_payload'])
            check(event, 'first_observation', observation_admissible(full,None,row,packs,source))
            successor = copy.deepcopy(fixtures['restore_successor'])
            source['canonical_point'] = successor['payload']['type_payload']
            check(event, 'next_lifecycle_observation', observation_admissible(successor,full,row,packs,source))
            check(event, 'same_point_artifact_new_event_identity', successor['payload']['artifact_id'] == payload['artifact_id'] and successor['payload']['type_payload']['restore_point_id'] == payload['type_payload']['restore_point_id'] and successor['idempotency_key'] != full['idempotency_key'])
            second = model.append(successor,True)
            check(event, 'successor_replay', isinstance(second,dict) and model.append(copy.deepcopy(successor),True) is second and len(model.scoped)==2)
            for field,value in [('producer_sequence_id',0),('producer_sequence_id',2),('parent_event_id',None),('parent_event_id','other-event')]:
                bad = copy.deepcopy(successor); bad[field] = value
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
    print(json.dumps(dict(status='fail' if failures else 'pass', cases=sum(counts.values()), per_family=counts,
                          failures=failures, native_execution='NOT_RUN', admission='NONE',
                          scope='static full-envelope/schema/receipt/hash and bounded source/append/observation models'),indent=2))
    return bool(failures)


if __name__ == '__main__':
    sys.exit(main())
