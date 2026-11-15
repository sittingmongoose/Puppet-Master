#!/usr/bin/env python3
"""DG-OWN-D / ATS-1119: conditional, TEST_ONLY historical reader boundaries.

The owner adapter below supplies independent complete logical records. It is not
a native Storage implementation, a historical admission, or a new wire recipe.
The separately vendored MessagePack codec is an unchanged copy of SP-286's
existing frozen full-value oracle codec. Number/format and isolation-tool sweep
work is deliberately not replaced here.
"""
from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import json
from pathlib import Path
import zlib
import struct
import blake3

import pm_goal_own_d_event_value_codec as wire
from pm_goal_oracle_common import (
    Gates, ROOT, load, materialize_cases, schema_registry, semantic_digest,
    validator, same_json_value,
)
from pm_goal_history_reader_fixtures import (
    FAMILIES, PAYLOAD_FILE, OUT_SCHEMA, ER_SCHEMA, CKPT_SCHEMA, history_guards,
)

STAGES = ('entry', 'resolver', 'row_validator', 'answer_builder', 'inspection', 'disclosure')
DOMAIN = 'pm.storage.original_event_value_commitment.v1'
CODEC = 'pm.seglog_frame_v2.event_value.canonical_msgpack.v1'
PLANS = ROOT / 'Plans'


def clone(value):
    return copy.deepcopy(value)


def exact(left, right):
    """Pure typed equality, including physical signed-zero observations."""
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return left.keys() == right.keys() and all(exact(left[k], right[k]) for k in left)
    if isinstance(left, list):
        return len(left) == len(right) and all(exact(a, b) for a, b in zip(left, right))
    if type(left) is float:
        return struct.pack('>d', left) == struct.pack('>d', right)
    return left == right


def commitment(event):
    """Reuse CV-339's existing full-value tuple and unmodified physical codec."""
    wire.pack(event, max_bytes=wire.MAX_PAYLOAD)  # Existing full-value recipe's FrameV2 bound.
    preimage = [DOMAIN, '1.0.0', CODEC, event['schema_id'], event['schema_version'], event]
    return dict(schema_id=DOMAIN, schema_version='1.0.0', codec=CODEC,
                domain=DOMAIN, event_schema_id=event['schema_id'],
                event_schema_version=event['schema_version'],
                sha256=hashlib.sha256(wire.pack(preimage)).hexdigest())


def partition(event):
    return 'project~' + base64.urlsafe_b64encode(event['project_id'].encode()).decode().rstrip('=')


def evidence_bytes():
    return b'TEST_ONLY original evidence line.\n' * 64


def artifact_bytes(ref):
    return ('TEST_ONLY original artifact: ' + ref).encode()


def provenance_original(key, protocol):
    """Supply real hash inputs for conditional evidence/artifact originals."""
    value = clone(protocol)
    event = value['source']['event']
    body = event['payload']['payload']
    facts = value['original']['facts']
    if key == 'evidence_captured':
        digest = hashlib.sha256(evidence_bytes()).hexdigest()
        body['content_hash'] = digest
        facts['original_evidence']['content_hash'] = digest
    if key == 'progressed':
        for artifact in body['artifact_hashes']:
            artifact['sha256'] = hashlib.sha256(artifact_bytes(artifact['artifact_ref'])).hexdigest()
        facts['resolved_artifact_hashes'] = clone(body['artifact_hashes'])
        if 'no_progress_marker' in body:
            body['no_progress_marker']['unchanged_artifact_hashes'] = clone(body['artifact_hashes'])
    value['answer']['original_event'] = clone(event)
    value['original']['producer_digest'] = semantic_digest(event)
    return value


def logical_store(key, protocol):
    """Trusted TEST_ONLY owner-adapter input; never accepted from a read caller.

    Keep receipt, accepted-at-issue source/checkpoint, physical frame, reference
    records and present access/source state separate from the presented input.
    This fixture constructor is not an authentication operation.
    """
    ev = protocol['source']['event']
    old = protocol['original']
    first = dict(event_id=ev['event_id'], sequence_id=ev['sequence_id'],
                 segment_generation=3, segment_name='fixture-original.seg', byte_offset=48,
                 commit_group_id='TEST_ONLY-original-group', durability_class='barrier',
                 durable_end_offset=8192, durability_state='synced', manifest_generation=3,
                 acknowledged_at_utc=ev['persisted_at_utc'])
    custody = dict(schema_id='pm.storage_value.event_append_receipt_custody.v2',
                   schema_version='2.0.0', storage_instance_id=protocol['source']['token']['storage_instance_id'],
                   event_id=ev['event_id'], scope_partition=partition(ev), event_type=ev['event_type'],
                   idempotency_key=ev['idempotency_key'], producer_semantic_digest=semantic_digest(ev),
                   group_digest='a' * 64, first_append_receipt=first, redaction_profile='no_secrets',
                   original_segment_ref='TEST_ONLY-original-segment',
                   original_event_value_commitment=commitment(ev))
    admission = old['admission']
    edition = dict(owner_unit=admission['owner_unit'], event_type=ev['event_type'],
                   payload_schema_id=ev['payload_schema_id'], registry_checkpoint=admission['registry_checkpoint'],
                   source_contract=clone(old['resolved_records']['source_contract']),
                   recipe_ref='CV-339/RFC8785;SP-286/original-full-value-v1')
    raw = wire.pack(ev)
    body = ev['payload']['payload']
    provenance = {}
    if key == 'evidence_captured':
        provenance = dict(bytes=evidence_bytes(), evidence_ref=body['evidence_ref'],
            source_spans=clone(body['source_spans']), currentness_state=body['currentness_state'],
            redaction_profile=body['redaction_profile'])
    if key == 'progressed':
        provenance = {a['artifact_ref']: artifact_bytes(a['artifact_ref']) for a in body['artifact_hashes']}
    if key == 'stopped':
        provenance = {f: clone(body.get(f)) for f in ('interruption_boundary', 'resumable',
            'safe_point_ref', 'child_settlement_refs', 'tool_settlement_refs')}
    if key == 'tool_check_recorded':
        provenance = {f: body[f] for f in ('tool_call_id', 'tool_name', 'check_kind', 'check_result', 'policy_decision')}
    original_protocol = {field: clone(protocol[field]) for field in ('source', 'original')}
    return dict(key=key, protocol=original_protocol, custody=custody,
                editions={admission['owner_unit']: edition},
                checkpoints={admission['registry_checkpoint']: clone(edition)},
                frame=dict(cursor=[3, 'fixture-original.seg', 48, ev['sequence_id']],
                           value=raw, crc32=zlib.crc32(raw), durable_end_offset=8192),
                selected_source=dict(cursor=[3, 'fixture-original.seg', 48, ev['sequence_id']], durable_end_offset=8192),
                translation=None,
                original_value=clone(ev), references=clone(old['resolved_records']),
                original_facts=clone(old['facts']), source=clone(protocol['source']),
                selector=clone(protocol['answer']['selector']), missing_obligations=[],
                content_permitted=True, installed_binding=protocol['answer']['reader_binding'],
                provenance=provenance, referenced_bodies={}, durable_effects={}, external_actions=[],
                current_runtime=dict(live_goal_state=protocol.get('current_live_state'),
                                     current_writer=protocol.get('current_writer')))


def conditional_original(key, base, payload):
    """Build one full TEST_ONLY original from a declared historical shape.

    All observational copies, original source facts and semantic commitments are
    changed together. This never manufactures real original admission.
    """
    payload = clone(payload)
    if key == 'replanned':
        payload['goal_revision'] = payload['payload']['new_revision']
        payload['expected_goal_revision'] = payload['goal_revision'] - 1
    value = clone(base)
    ev = value['source']['event']
    ev['payload'] = clone(payload)
    for outer, inner in [('event_type', 'event_name'), ('payload_schema_id', 'schema_version'),
                         ('project_id', 'project_id'), ('thread_id', 'thread_id'), ('actor_ref', 'actor_ref'),
                         ('requested_account_ref', 'requested_account_ref'),
                         ('effective_account_ref', 'effective_account_ref'),
                         ('occurred_at_utc', 'occurred_at_utc'), ('correlation_id', 'correlation_id'),
                         ('idempotency_key', 'idempotency_key')]:
        if inner in payload:
            ev[outer] = payload[inner]
    value['answer']['original_event'] = clone(ev)
    value['answer']['selector'].update(project_id=ev['project_id'])
    if 'goal_id' in value['answer']['selector']:
        value['answer']['selector']['goal_id'] = payload['goal_id']
    old = value['original']
    old['predecessor'].update(goal_id=payload['goal_id'], project_id=payload['project_id'],
                              goal_revision=payload['expected_goal_revision'])
    for field in old['runtime']:
        old['runtime'][field] = payload[field]
    for field in ('event_type', 'payload_schema_id', 'event_id', 'idempotency_key'):
        old['first_receipt'][field] = ev[field]
    for field in ('event_type', 'payload_schema_id'):
        old['admission'][field] = ev[field]
    old['producer_digest'] = semantic_digest(ev)
    b = payload['payload']
    facts = old['facts']
    if key == 'child_status':
        facts['child'].update(goal_id=b['child_goal_id'], state_before=b['previous_status'], state_after=b['next_status'])
        facts['original_child_contract']['allowed_edges'] = [[b['previous_status'], b['next_status']]]
    elif key == 'degraded':
        facts.update(tier='lightweight', exception_required=bool(b.get('exception_refs')),
                     risk_accepted=bool(b.get('approval_refs')))
    elif key == 'progressed':
        facts.update(state_before=b['status_before'], state_after=b['status_after'],
                     resolved_artifact_hashes=clone(b['artifact_hashes']))
    elif key == 'replanned':
        facts.update(state_after={'continue_running': 'running', 'remain_paused': 'paused',
            'remain_blocked': 'blocked', 'stop': 'stopped', 'cancel': 'cancelled',
            'begin_verification': 'verifying', 'repair': 'repairing'}[b['next_action']],
            current_evidence_refs=clone(b['remaining_evidence_refs']))
    elif key == 'stopped':
        facts['settled_refs'] = b['child_settlement_refs'] + b['tool_settlement_refs']
    elif key == 'verification_decided':
        before, after = {'passed': ('running', 'verifying'), 'failed': ('verifying', 'repairing'),
                         'blocked': ('running', 'blocked')}[b['decision']]
        facts.update(state_before=before, state_after=after, assigned_verifier=b['verifier_ref'],
                     cycle_id=b.get('verification_cycle_id', b.get('audit_cycle_id')),
                     current_evidence_refs=clone(b['closure_refs']))
    elif key == 'evidence_captured':
        facts['original_evidence'].update(content_hash=b['content_hash'], evidence_ref=b['evidence_ref'])
        ev['redaction_profile'] = b['redaction_profile']
        value['answer']['original_event'] = clone(ev)
        old['producer_digest'] = semantic_digest(ev)
    elif key == 'receipt_recorded':
        facts['original_receipt'].update(receipt_id=b['receipt_id'], certifier_decision=b['certifier_decision'],
            required_dependency_refs=b['child_receipt_refs'] + b['worknode_receipt_refs'])
        if b['certifier_decision'] == 'certified_with_approved_exception':
            facts['residual_risk_refs'] = ['risk:TEST_ONLY-original']
    elif key == 'tool_check_recorded':
        facts['original_tool_call']['tool_call_id'] = b['tool_call_id']
        facts['original_permission']['decision'] = b['policy_decision']
    return value


def branch_originals(key, base):
    """Separate full-path positives for original semantic branches.

    These are declared TEST_ONLY accepted-at-issue source facts, never a new
    current transition table, original writer or reconstructed receipt.
    """
    result = []
    def add(label, body_changes=None, common_changes=None, facts_changes=None):
        payload = clone(base['source']['event']['payload'])
        payload['payload'].update(body_changes or {})
        payload.update(common_changes or {})
        value = conditional_original(key, base, payload)
        value['original']['facts'].update(facts_changes or {})
        result.append(dict(id='original_branch/' + label, input=value))
    if key == 'child_status':
        for status in ('completed', 'failed', 'blocked', 'degraded'):
            add('child_' + status, dict(previous_status='verifying' if status == 'completed' else 'running', next_status=status, receipt_ref='receipt:original-child'))
    elif key == 'degraded':
        add('strong_optional_check', dict(degraded_reason='optional_check_unavailable'), facts_changes={'tier': 'strong'})
        add('new_risk_on_repeat', facts_changes={'state_before': 'degraded', 'risk_before': ['risk:previous']})
        add('exception_required', dict(exception_refs=['exception:original']), facts_changes={'exception_required': True})
        add('risk_accepted', dict(approval_refs=['approval:original']),
            {'approval_refs': ['approval:original']}, {'risk_accepted': True})
    elif key == 'scheduled':
        for before in ('paused', 'blocked', 'stopped'):
            add('recover_from_' + before, facts_changes={'state_before': before})
    elif key == 'progressed':
        for before, after in [('scheduled', 'running'), ('running', 'running'),
                              ('repairing', 'repairing'), ('repairing', 'verifying')]:
            add(before + '_to_' + after, dict(status_before=before, status_after=after))
    elif key == 'replanned':
        for action in ('continue_running', 'remain_paused', 'remain_blocked', 'stop',
                       'cancel', 'begin_verification', 'repair'):
            add(action, dict(next_action=action))
    elif key == 'stopped':
        for boundary in ('before_mutation', 'at_safe_point', 'after_mutation_before_settlement', 'after_settlement'):
            body = clone(base['source']['event']['payload']['payload'])
            body['interruption_boundary'] = boundary
            if boundary == 'before_mutation':
                body.update(child_settlement_refs=[], tool_settlement_refs=[], resumable=False)
                body.pop('safe_point_ref', None)
            if boundary == 'after_mutation_before_settlement':
                body['resumable'] = False
                body.pop('safe_point_ref', None)
            payload = clone(base['source']['event']['payload'])
            payload['payload'] = body
            result.append(dict(id='original_branch/' + boundary, input=conditional_original(key, base, payload)))
        add('new_boundary_on_repeat', facts_changes={'state_before': 'stopped',
            'previous_boundary': 'previous-safe-point', 'current_boundary': 'new-safe-point'})
    elif key == 'verification_decided':
        add('failed', dict(decision='failed', finding_refs=['finding:original'], closure_refs=[]))
        add('strong_third_repeat', dict(adjudicator_ref='adjudicator:1'),
            facts_changes={'tier': 'strong', 'failure_count': 3})
    elif key == 'evidence_captured':
        for currentness in ('current', 'stale', 'superseded', 'unknown'):
            add('original_' + currentness, dict(currentness_state=currentness))
    elif key == 'receipt_recorded':
        for decision in ('rejected', 'blocked'):
            add(decision, dict(certifier_decision=decision), {'evidence_refs': ['reason:original']})
        add('complete_dependencies', dict(child_receipt_refs=['receipt:child'], worknode_receipt_refs=['receipt:worknode']))
    elif key == 'tool_check_recorded':
        for outcome in ('failed', 'blocked', 'unknown'):
            add(outcome, dict(check_result=outcome, log_ref='log:original'))
        add('not_applicable', dict(policy_decision='not_applicable'))
        add('denied', dict(policy_decision='deny', check_result='blocked', log_ref='log:original'), {'block_refs': ['block:original']})
        add('approval_required', dict(policy_decision='approval_required', check_result='blocked', log_ref='log:original'),
            {'approval_refs': ['approval:original'], 'block_refs': ['block:original']})
    return result


class ReaderOracles:
    def __init__(self):
        self.paths = [OUT_SCHEMA, ER_SCHEMA, CKPT_SCHEMA,
                      PLANS / 'event_append_receipt_contracts.schema.json']
        self.paths += [PLANS / 'event_payloads/goal_runtime' /
                       (PAYLOAD_FILE.get(k, 'goal_' + k) + '.schema.json') for k in FAMILIES]
        self.registry = schema_registry(self.paths)  # resolves ALL refs eagerly
        self.payloads = {}
        self.answers = {}
        for key in FAMILIES:
            self.payloads[key] = validator(load(PLANS / 'event_payloads/goal_runtime' /
                (PAYLOAD_FILE.get(key, 'goal_' + key) + '.schema.json')), self.registry)
            self.answers[key] = validator({'$ref': load(OUT_SCHEMA)['$id'] +
                '#/$defs/goal_' + key + '_history_answer'}, self.registry)
        receipt = load(PLANS / 'event_append_receipt_contracts.schema.json')
        self.custody = validator({'$ref': receipt['$id'] + '#/$defs/custody_reader'}, self.registry)
        self.roles = {key: set(load(PLANS / ('goal_' + key + '_history_contract_fixtures.json'))['protocol_cases'][0]['input']['original']['resolved_records']) for key in FAMILIES}

    def expected(self, key, store):
        # Construct the closed answer independently. No candidate/template
        # answer is retained as owner authority, including on unavailable reads.
        answer = dict(kind='verified_historical', reader_binding=store['installed_binding'],
                      selector=clone(store['selector']), original_event=clone(store['original_value']),
                      original_validation='verified', unresolved_obligations=[],
                      read_token=clone(store['source']['token']), action_authority='none')
        missing = list(store['missing_obligations'])
        if not store['editions'] or not store['checkpoints']:
            missing.append('original_admission')
        source = store['source']
        inaccessible = not store['content_permitted'] or any(source.get(f) is not True for f in
            ('authorized', 'retained', 'reader_available', 'secret_safe', 'frame_verified', 'translation_verified'))
        # Each existing reader owns its own unavailable/unresolved disposition.
        if inaccessible or ('original_admission' in missing and FAMILIES[key][2] == 'unavailable'):
            answer.update(kind='unavailable', original_event=None, read_token=None,
                          original_validation='unavailable', unresolved_obligations=[])
        elif missing:
            answer.update(kind='unresolved_historical_validation', original_validation='unresolved',
                          unresolved_obligations=sorted(set(missing)))
        else:
            answer.update(kind='verified_historical', original_validation='verified', unresolved_obligations=[])
        return answer

    def establish(self, key, presented, store):
        """Independently resolve original values BEFORE candidate builders/helpers."""
        g = Gates()
        expected = self.expected(key, store)
        g.require('request/selector', same_json_value(presented['answer']['selector'], store['selector']))
        g.require('request/binding', presented['answer']['reader_binding'] == store['installed_binding'])
        g.schema(self.answers[key], expected, key + '/independent_answer')
        if expected['kind'] == 'unavailable':
            return expected, g.errors
        g.require('request/family_dispatch', store['original_value']['event_type'] == FAMILIES[key][0])
        source = store['source']
        actual = store['original_value']
        g.schema(self.payloads[key], actual['payload'], key + '/actual_original_payload')
        g.require('references/complete_roles', set(store['references']) == self.roles[key])
        body = actual['payload']['payload']
        provenance = store['provenance']
        required_provenance = {
            'evidence_captured': {'bytes', 'evidence_ref', 'source_spans', 'currentness_state', 'redaction_profile'},
            'stopped': {'interruption_boundary', 'resumable', 'safe_point_ref', 'child_settlement_refs', 'tool_settlement_refs'},
            'tool_check_recorded': {'tool_call_id', 'tool_name', 'check_kind', 'check_result', 'policy_decision'},
        }
        if key in required_provenance:
            g.require(key + '/provenance_members', set(provenance) == required_provenance[key])
            if g.errors:
                return expected, g.errors
        if key == 'evidence_captured':
            g.require('evidence/content_hash', body['content_hash'] ==
                      hashlib.sha256(provenance['bytes']).hexdigest())
            for field in ('evidence_ref', 'source_spans', 'currentness_state', 'redaction_profile'):
                g.require('evidence/original/' + field, exact(body[field], provenance[field]))
            for span in body['source_spans']:
                if span['locator_kind'] == 'line_range':
                    g.require('evidence/source_line_bounds',
                              span['end_line'] <= len(provenance['bytes'].splitlines()))
        if key == 'progressed':
            g.require('progress/artifact_set', set(provenance) ==
                      {a['artifact_ref'] for a in body['artifact_hashes']})
            for artifact in body['artifact_hashes']:
                raw_artifact = provenance.get(artifact['artifact_ref'])
                if artifact['artifact_ref'] in provenance:
                    g.require('progress/artifact_bytes/' + artifact['artifact_ref'],
                              isinstance(raw_artifact, bytes) and artifact['sha256'] == hashlib.sha256(raw_artifact).hexdigest())
        if key in ('stopped', 'tool_check_recorded'):
            for field, value in provenance.items():
                g.require(key + '/original/' + field, exact(body.get(field), value))
        for ref, body in store['referenced_bodies'].items():
            g.require('reference/ref/' + ref, body['ref'] == ref)
            g.require('reference/declared/' + ref,
                      ref in {r['requested_ref'] for r in store['references'].values()})
            g.require('reference/owner/' + ref,
                      body['owner_ref'] == store['references']['source_contract']['owner_ref'])
            g.require('reference/size/' + ref, type(body['byte_size']) is int and body['byte_size'] == len(body['bytes']))
            g.require('reference/blake3/' + ref, body['blake3'] == blake3.blake3(body['bytes']).hexdigest())
            g.require('reference/media_type/' + ref, body['media_type'] == 'text/plain; charset=utf-8')
            g.require('reference/access/' + ref, body['authorized'] is True)
            g.require('reference/retained/' + ref, body['retained'] is True)
        # Each source field has a complete independent owner value, not a supplied
        # all-true descriptor. Every nested member participates in exact comparison.
        g.require('source/owner/members', set(presented['source']) == set(source))
        for field in source:
            g.require('source/owner/' + field, same_json_value(presented['source'].get(field), source[field]))
        g.require('source/full_original', exact(source['event'], actual))
        raw = store['frame']['value']
        g.require('frame/crc32', zlib.crc32(raw) == store['frame']['crc32'])
        decoded = wire.unpack(raw)
        g.require('frame/original_value', exact(decoded, actual))
        expected_cursor = [store['custody']['first_append_receipt'][f] for f in
                           ('segment_generation', 'segment_name', 'byte_offset', 'sequence_id')]
        selected = store['selected_source']
        g.require('frame/selected_cursor', exact(store['frame']['cursor'], selected['cursor']))
        if store['translation'] is None:
            g.require('frame/full_cursor', exact(selected['cursor'], expected_cursor))
        else:
            translation = store['translation']
            g.require('translation/original_cursor', exact(translation['original_cursor'], expected_cursor))
            g.require('translation/selected_cursor', exact(translation['selected_cursor'], selected['cursor']))
            g.require('translation/original_value', exact(translation['original_value'], actual))
            g.require('translation/selected_value', exact(translation['selected_value'], actual))
        g.require('frame/durable_end', store['frame']['durable_end_offset'] == selected['durable_end_offset'])
        g.require('frame/within_watermark', selected['cursor'][2] + len(raw) <= selected['durable_end_offset'])
        # Historical custody dispatch accepts exact retained v1 and v2. Never
        # fabricate a v2 commitment for v1. Physical bytes do not use semantic JCS.
        g.schema(self.custody, store['custody'], key + '/actual_custody')
        custody = store['custody']
        for field, value in [('storage_instance_id', source['token']['storage_instance_id']),
                             ('event_id', actual['event_id']), ('event_type', actual['event_type']),
                             ('idempotency_key', actual['idempotency_key']),
                             ('scope_partition', partition(actual))]:
            g.require('receipt/' + field, same_json_value(custody[field], value))
        for field in ('event_id', 'sequence_id'):
            g.require('receipt/first/' + field,
                      same_json_value(custody['first_append_receipt'][field], actual[field]))
        g.require('receipt/semantic_digest', custody['producer_semantic_digest'] == semantic_digest(actual))
        if custody['schema_version'] == '2.0.0':
            g.require('receipt/full_value_commitment',
                      same_json_value(custody['original_event_value_commitment'], commitment(actual)))
        old = presented['original']
        g.require('original/owner/members', set(old) == set(store['protocol']['original']))
        for field in ('first_receipt', 'admission', 'predecessor', 'runtime', 'producer_digest'):
            g.require('original/owner/' + field,
                      same_json_value(old[field], store['protocol']['original'][field]))
        g.require('original/owner/facts', same_json_value(old['facts'], store['original_facts']))
        g.require('original/owner/references', same_json_value(old['resolved_records'], store['references']))
        admission = old['admission']
        edition = store['editions'].get(admission['owner_unit'])
        checkpoint = store['checkpoints'].get(admission['registry_checkpoint'])
        if 'original_admission' not in expected['unresolved_obligations']:
            g.require('admission/accepted_edition', edition is not None)
            g.require('admission/approved_checkpoint', checkpoint is not None)
            if edition is not None and checkpoint is not None:
                for field, value in [('owner_unit', admission['owner_unit']),
                                     ('registry_checkpoint', admission['registry_checkpoint']),
                                     ('event_type', actual['event_type']),
                                     ('payload_schema_id', actual['payload_schema_id']),
                                     ('source_contract', store['references']['source_contract'])]:
                    g.require('admission/edition/' + field, same_json_value(edition[field], value))
                    g.require('admission/checkpoint/' + field, same_json_value(checkpoint[field], value))
                g.require('admission/recipe_selection', edition['recipe_ref'] == checkpoint['recipe_ref'] ==
                          'CV-339/RFC8785;SP-286/original-full-value-v1')
        if not expected['unresolved_obligations']:
            # Full original payload, row, runtime, revision, reference and joins,
            # using actual separately supplied owner originals.
            actual_protocol = clone(store['protocol'])
            actual_protocol['answer'] = clone(expected)
            actual_protocol['source'] = clone(source)
            actual_protocol['original']['facts'] = clone(store['original_facts'])
            actual_protocol['original']['resolved_records'] = clone(store['references'])
            g.errors.update(history_guards(actual_protocol, self.payloads[key], self.answers[key]))
        g.schema(self.answers[key], expected, key + '/independent_answer')
        return expected, g.errors

    def _guarded(self, stage, key, presented, store, helper=None):
        """Each named entry/helper is directly callable with the complete input.

        Establish an independent expectation, call a possibly replaceable helper,
        then compare the whole result and current owner state. After the final
        comparison, return directly; no copy/hash/response helper runs there.
        """
        if stage not in STAGES:
            raise ValueError(stage)
        before = clone(store)
        try:
            expected, errors = self.establish(key, presented, before)
        except (KeyError, TypeError, ValueError, wire.WireError) as exc:
            return {'errors': ['malformed_input/' + type(exc).__name__], 'answer': None}
        if errors:
            return {'errors': sorted(errors), 'answer': None}
        candidate = clone(presented['answer'])
        if helper is not None:
            helper(candidate, presented, store)
        # Pure final comparisons. In production these run under the actual
        # owner's exclusion/lease; this fixture models the logical obligation.
        errors = []
        if not exact(candidate, expected):
            errors.append(stage + '/final_candidate')
        # Present Goal lifecycle/writer state is not original history or read
        # permission. Actual access, installed READER and all source fences stay
        # in this comparison; only the explicitly separate live runtime does not.
        if not exact({k: v for k, v in store.items() if k != 'current_runtime'},
                     {k: v for k, v in before.items() if k != 'current_runtime'}):
            errors.append(stage + '/final_owner_fence')
        if errors:
            return {'errors': errors, 'answer': None}
        return {'errors': [], 'answer': candidate}

    def entry(self, key, presented, store, helper=None):
        return self._guarded('entry', key, presented, store, helper)

    def resolver(self, key, presented, store, helper=None):
        return self._guarded('resolver', key, presented, store, helper)

    def row_validator(self, key, presented, store, helper=None):
        return self._guarded('row_validator', key, presented, store, helper)

    def answer_builder(self, key, presented, store, helper=None):
        return self._guarded('answer_builder', key, presented, store, helper)

    def inspection(self, key, presented, store, helper=None):
        return self._guarded('inspection', key, presented, store, helper)

    def disclosure(self, key, presented, store, helper=None):
        return self._guarded('disclosure', key, presented, store, helper)

    def boundary(self, stage, key, presented, store, helper=None):
        return getattr(self, stage)(key, presented, store, helper)


def leaves(value, path=()):
    if isinstance(value, dict) and value:
        for key, item in value.items():
            yield from leaves(item, path + (key,))
    elif isinstance(value, list) and value:
        for key, item in enumerate(value):
            yield from leaves(item, path + (key,))
    else:
        yield path, value


def replace(value, path, item):
    for key in path[:-1]:
        value = value[key]
    value[path[-1]] = clone(item)


def different(value):
    if type(value) is str:
        return value + ':forged'
    if type(value) is bool:
        return not value
    if type(value) in (int, float):
        return value + 1
    return 'forged'


def run(output=None):
    suite = ReaderOracles()
    known = load(PLANS / 'event_append_receipt_full_value_fixtures.json')
    if commitment(known['base_original_event'])['sha256'] != known['commitment_sha256']:
        raise ValueError('existing SP-286 full-value commitment vector mismatch')
    counts = {}
    failures = []
    inventory = {}
    observations = []

    def check(name, result, valid, guard=None):
        ok = not result['errors']
        if ok != valid:
            failures.append(dict(case=name, expected=valid, errors=result['errors']))
        observations.append(dict(case=name, valid=valid, errors=result['errors']))
        if not valid:
            for actual_guard in result['errors']:
                inventory.setdefault(actual_guard, []).append(name)

    for key in FAMILIES:
        start = len(observations)
        fixture = load(PLANS / ('goal_' + key + '_history_contract_fixtures.json'))
        positives = [c for c in materialize_cases(fixture['protocol_cases']) if c['valid']]
        base = positives[0]['input']
        positives += [dict(id='full_original/' + c['id'],
                           input=conditional_original(key, base, c['value']))
                      for c in fixture['schema_cases'] if c['valid']]
        positives += branch_originals(key, base)
        for case in positives:
            case['input'] = provenance_original(key, case['input'])
        base = positives[0]['input']
        for case in positives:
            value = case['input']
            store = logical_store(key, value)
            for stage in STAGES:
                check(key + '/' + stage + '/' + case['id'],
                      suite.boundary(stage, key, clone(value), clone(store)), True)
        store = logical_store(key, base)
        for stage in STAGES:
            for path, item in leaves(store['provenance']):
                if not path:
                    continue
                changed = clone(store)
                replace(changed['provenance'], path, item + b'x' if isinstance(item, bytes) else different(item))
                label = '/'.join(map(str, path))
                check(f'{key}/{stage}/original_provenance/{label}',
                      suite.boundary(stage, key, clone(base), changed), False)
            if key in ('evidence_captured', 'stopped', 'tool_check_recorded'):
                for field in store['provenance']:
                    changed = clone(store)
                    del changed['provenance'][field]
                    check(f'{key}/{stage}/missing_provenance_member/{field}',
                          suite.boundary(stage, key, clone(base), changed), False)
            # Forged presented source/original observations never replace the
            # independently resolved actual originals, even at a direct helper.
            for top in ('source', 'original'):
                for path, item in leaves(base[top]):
                    forged = clone(base)
                    replace(forged[top], path, different(item))
                    label = '/'.join(map(str, path))
                    check(f'{key}/{stage}/presented_{top}/{label}',
                          suite.boundary(stage, key, forged, clone(store)), False,
                          top + '/owner/' + str(path[0]))
                forged = clone(base)
                forged[top]['foreign_member'] = 'forged'
                check(f'{key}/{stage}/presented_{top}/foreign_member',
                      suite.boundary(stage, key, forged, clone(store)), False, top + '/owner/members')
            changed = clone(store)
            changed['original_value']['event_type'] = 'foreign.event'
            check(f'{key}/{stage}/foreign_family_dispatch',
                  suite.boundary(stage, key, clone(base), changed), False, 'request/family_dispatch')
            # Complete output mutations, before entry and AFTER the last helper.
            # Each changes one independent candidate member; no stale source,
            # hash, mirrored original or second field is manufactured.
            for path, item in leaves(base['answer']):
                label = '/'.join(map(str, path))
                forged = clone(base)
                replace(forged['answer'], path, different(item))
                check(f'{key}/{stage}/input/{label}',
                      suite.boundary(stage, key, forged, clone(store)), False,
                      stage + '/final_candidate')
                def poison(candidate, presented, current, path=path, item=item):
                    replace(candidate, path, different(item))
                check(f'{key}/{stage}/last_helper/{label}',
                      suite.boundary(stage, key, clone(base), clone(store), poison), False,
                      stage + '/final_candidate')
            # Every actual owner/source/fence leaf is independently changed
            # after the final returning helper, including same-generation
            # nonmatching appends, permissions, deletion/hold and maintenance.
            for path, item in leaves(store):
                if path[0] == 'current_runtime':
                    continue
                if isinstance(item, bytes):
                    replacement = item + b'\x00'
                else:
                    replacement = different(item)
                def change_owner(candidate, presented, current, path=path, replacement=replacement):
                    replace(current, path, replacement)
                label = '/'.join(map(str, path))
                check(f'{key}/{stage}/owner_after_helper/{label}',
                      suite.boundary(stage, key, clone(base), clone(store), change_owner), False,
                      stage + '/final_owner_fence')
            for live_state in ('active', 'paused', 'blocked', 'completed', None):
                for writer in ('retired', 'unavailable'):
                    def live_change(candidate, presented, current, live_state=live_state, writer=writer):
                        current['current_runtime'].update(live_goal_state=live_state, current_writer=writer)
                    check(f'{key}/{stage}/live_change_after_helper/{live_state}/{writer}',
                          suite.boundary(stage, key, clone(base), clone(store), live_change), True)
            # Missing/withdrawn authority produces each reader's exact closed
            # answer; copying a prior verified answer cannot override it.
            for field in ('authorized', 'retained', 'reader_available', 'secret_safe',
                          'frame_verified', 'translation_verified'):
                changed = clone(store)
                changed['source'][field] = False
                value = clone(base)
                value['answer'] = suite.expected(key, changed)
                check(f'{key}/{stage}/truthful_unavailable/{field}',
                      suite.boundary(stage, key, value, changed), True)
                check(f'{key}/{stage}/forged_verified/{field}',
                      suite.boundary(stage, key, clone(base), changed), False,
                      stage + '/final_candidate')
            for missing in ('editions', 'checkpoints'):
                changed = clone(store)
                changed[missing] = {}
                value = clone(base)
                value['answer'] = suite.expected(key, changed)
                check(f'{key}/{stage}/missing_admission/{missing}',
                      suite.boundary(stage, key, value, changed), True)
                check(f'{key}/{stage}/missing_admission_verified/{missing}',
                      suite.boundary(stage, key, clone(base), changed), False,
                      stage + '/final_candidate')
            absent = clone(store)
            absent['source'].update(retained=False, event=None, token=None)
            absent['original_value'] = None
            absent['frame'] = None
            value = clone(base)
            value['answer'] = suite.expected(key, absent)
            check(f'{key}/{stage}/actual_missing_source',
                  suite.boundary(stage, key, value, clone(absent)), True)
            check(f'{key}/{stage}/actual_missing_source_forged_verified',
                  suite.boundary(stage, key, clone(base), clone(absent)), False)
            # A coherent forged admission pair does not resolve a real edition.
            value = clone(base)
            value['original']['admission']['registry_checkpoint'] = 'forged.weaker.checkpoint'
            value['original']['first_receipt']['registry_checkpoint'] = 'forged.weaker.checkpoint'
            check(f'{key}/{stage}/coherent_forged_checkpoint',
                  suite.boundary(stage, key, value, clone(store)), False,
                  'admission/approved_checkpoint')
            value = clone(base)
            value['original']['admission']['owner_unit'] = 'forged.weaker.writer'
            value['original']['first_receipt']['writer_owner_unit'] = 'forged.weaker.writer'
            check(f'{key}/{stage}/coherent_forged_writer',
                  suite.boundary(stage, key, value, clone(store)), False,
                  'admission/accepted_edition')
        # Current canon's absence outcome is distinct from conditional positives.
        # Retained v1 receipt/source is supported without inventing a commitment.
        legacy = clone(store)
        legacy['custody'].pop('original_event_value_commitment')
        legacy['custody'].update(schema_id='pm.storage_value.event_append_receipt_custody.v1', schema_version='1.0.0')
        for stage in STAGES:
            check(f'{key}/{stage}/retained_v1_receipt',
                  suite.boundary(stage, key, clone(base), clone(legacy)), True)
            replay = clone(base)
            replay['answer']['original_event']['replay_policy'] = 'projector_replay_only'
            replay['source']['event']['replay_policy'] = 'projector_replay_only'
            replay_store = logical_store(key, replay)
            check(f'{key}/{stage}/retained_replay_only',
                  suite.boundary(stage, key, replay, replay_store), True)
            # Missing original semantics is explicitly unresolved, with the
            # complete original retained only while current source/access allow.
            missing = clone(store)
            missing['missing_obligations'] = ['original_referenced_record']
            value = clone(base)
            value['answer'] = suite.expected(key, missing)
            check(f'{key}/{stage}/unresolved_original_reference',
                  suite.boundary(stage, key, value, missing), True)
            # Coherent identity-preserving backup restoration changes the
            # selected source generation/token, never the original receipt.
            restored = clone(store)
            restored['source']['token']['redb_snapshot_id'] = 'TEST_ONLY-restored-snapshot'
            restored['source']['captured_fence']['root'] = 'TEST_ONLY-restored-root'
            restored['source']['final_fence']['root'] = 'TEST_ONLY-restored-root'
            value = clone(base)
            value['source'] = clone(restored['source'])
            value['answer'] = suite.expected(key, restored)
            check(f'{key}/{stage}/identity_preserving_restore',
                  suite.boundary(stage, key, value, restored), True)
            # Existing SP-337 source-owner references can resolve large bodies
            # without embedding them in the EventRecord or adding a new codec.
            ref = store['references']['source_contract']['requested_ref']
            large = clone(store)
            raw = ('TEST_ONLY original source contract.\n' * 1100).encode()
            large['referenced_bodies'][ref] = dict(ref=ref,
                owner_ref=large['references']['source_contract']['owner_ref'],
                byte_size=len(raw), blake3=blake3.blake3(raw).hexdigest(),
                media_type='text/plain; charset=utf-8', bytes=raw,
                authorized=True, retained=True)
            check(f'{key}/{stage}/large_referenced_source',
                  suite.boundary(stage, key, clone(base), clone(large)), True)
            for field in large['referenced_bodies'][ref]:
                mutated = clone(large)
                body = mutated['referenced_bodies'][ref]
                body[field] = body[field] + b'x' if field == 'bytes' else different(body[field])
                if field == 'bytes':
                    # Size is kept coherent: this negative concerns hash
                    # authenticity, not an accidental stale length mirror.
                    body['byte_size'] = len(body['bytes'])
                check(f'{key}/{stage}/reference/{field}',
                      suite.boundary(stage, key, clone(base), mutated), False,
                      'reference/' + ('blake3' if field == 'bytes' else field) + '/' + ref)
            foreign = clone(large)
            body = foreign['referenced_bodies'].pop(ref)
            body['ref'] = 'foreign:source'
            foreign['referenced_bodies']['foreign:source'] = body
            check(f'{key}/{stage}/reference/foreign',
                  suite.boundary(stage, key, clone(base), foreign), False,
                  'reference/declared/foreign:source')
            # Every new original-source guard has a direct full-path witness.
            for field in ('storage_instance_id', 'event_id', 'scope_partition', 'event_type', 'idempotency_key'):
                changed = clone(store)
                changed['custody'][field] += ':foreign'
                check(f'{key}/{stage}/receipt/{field}',
                      suite.boundary(stage, key, clone(base), changed), False, 'receipt/' + field)
            for field in ('event_id', 'sequence_id'):
                changed = clone(store)
                changed['custody']['first_append_receipt'][field] = different(
                    changed['custody']['first_append_receipt'][field])
                if field == 'sequence_id':
                    changed['frame']['cursor'][3] = changed['custody']['first_append_receipt'][field]
                    changed['selected_source']['cursor'][3] = changed['custody']['first_append_receipt'][field]
                check(f'{key}/{stage}/receipt/first/{field}',
                      suite.boundary(stage, key, clone(base), changed), False, 'receipt/first/' + field)
            for field in ('producer_semantic_digest', 'original_event_value_commitment'):
                changed = clone(store)
                if field == 'producer_semantic_digest':
                    changed['custody'][field] = 'b' * 64
                    guard = 'receipt/semantic_digest'
                else:
                    changed['custody'][field]['sha256'] = 'b' * 64
                    guard = 'receipt/full_value_commitment'
                check(f'{key}/{stage}/receipt/{field}',
                      suite.boundary(stage, key, clone(base), changed), False, guard)
            for field in ('crc32', 'cursor', 'durable_end_offset'):
                changed = clone(store)
                if field == 'cursor':
                    changed['frame'][field][2] += 1
                    guard = 'frame/full_cursor'
                else:
                    changed['frame'][field] += 1
                    guard = 'frame/' + ('durable_end' if field == 'durable_end_offset' else field)
                check(f'{key}/{stage}/frame/{field}',
                      suite.boundary(stage, key, clone(base), changed), False, guard)
            changed = clone(store)
            changed_event = clone(changed['original_value'])
            changed_event['observed_at_utc'] = '2020-01-01T00:00:01Z'
            changed['frame']['value'] = wire.pack(changed_event)
            changed['frame']['crc32'] = zlib.crc32(changed['frame']['value'])
            check(f'{key}/{stage}/frame/coherent_forged_bytes',
                  suite.boundary(stage, key, clone(base), changed), False, 'frame/original_value')
            below = clone(store)
            below['selected_source']['durable_end_offset'] = len(below['frame']['value']) - 1
            below['frame']['durable_end_offset'] = below['selected_source']['durable_end_offset']
            check(f'{key}/{stage}/frame/beyond_watermark',
                  suite.boundary(stage, key, clone(base), below), False, 'frame/within_watermark')
            moved = clone(store)
            original_cursor = clone(moved['selected_source']['cursor'])
            moved['selected_source']['cursor'] = [4, 'fixture-translated.seg', 96, base['source']['event']['sequence_id']]
            moved['frame']['cursor'] = clone(moved['selected_source']['cursor'])
            moved['translation'] = dict(original_cursor=original_cursor,
                selected_cursor=clone(moved['selected_source']['cursor']),
                original_value=clone(moved['original_value']), selected_value=clone(moved['original_value']))
            check(f'{key}/{stage}/authenticated_relocation',
                  suite.boundary(stage, key, clone(base), clone(moved)), True)
            unproved_move = clone(moved)
            unproved_move['translation'] = None
            check(f'{key}/{stage}/relocation_without_translation',
                  suite.boundary(stage, key, clone(base), unproved_move), False, 'frame/full_cursor')
            for field in moved['translation']:
                broken = clone(moved)
                if field.endswith('cursor'):
                    broken['translation'][field][2] += 1
                else:
                    broken['translation'][field]['event_id'] += ':foreign'
                check(f'{key}/{stage}/translation/{field}',
                      suite.boundary(stage, key, clone(base), broken), False, 'translation/' + field)
            appended = clone(store)
            appended['frame']['durable_end_offset'] += 4096
            appended['selected_source']['durable_end_offset'] += 4096
            appended['source']['token']['frontier_revision'] += 1
            appended['source']['token']['frontier_sha256'] = 'b' * 64
            appended['source']['captured_fence']['source_token'] = 'c' * 64
            appended['source']['final_fence']['source_token'] = 'c' * 64
            value = clone(base)
            value['source'] = clone(appended['source'])
            value['answer'] = suite.expected(key, appended)
            check(f'{key}/{stage}/later_nonmatching_append',
                  suite.boundary(stage, key, value, appended), True)
            if key == 'progressed' and store['provenance']:
                missing_artifact = clone(store)
                missing_artifact['provenance'].pop(next(iter(missing_artifact['provenance'])))
                check(f'{key}/{stage}/missing_artifact_source',
                      suite.boundary(stage, key, clone(base), missing_artifact), False, 'progress/artifact_set')
            for group in ('editions', 'checkpoints'):
                ident = next(iter(store[group]))
                for field in store[group][ident]:
                    changed = clone(store)
                    value = changed[group][ident][field]
                    changed[group][ident][field] = different(value)
                    check(f'{key}/{stage}/admission/{group}/{field}',
                          suite.boundary(stage, key, clone(base), changed), False,
                          'admission/' + ('recipe_selection' if field == 'recipe_ref' else
                              ('edition/' if group == 'editions' else 'checkpoint/') + field))
            # No missing own reference role can disappear from the validator's
            # iteration: keep all copies coherent while removing this one role.
            for role in store['references']:
                changed = clone(store)
                value = clone(base)
                del changed['references'][role]
                del changed['protocol']['original']['resolved_records'][role]
                del value['original']['resolved_records'][role]
                check(f'{key}/{stage}/missing_required_role/{role}',
                      suite.boundary(stage, key, value, changed), False, 'references/complete_roles')
        if key == 'degraded':
            for wrong in materialize_cases(fixture['protocol_cases']):
                if wrong['id'].startswith('typed_boolean_') and '_wrong_' in wrong['id']:
                    value = wrong['input']
                    # Coherent complete owner originals, with exactly one
                    # wrong-type flag; equality/custody cannot mask its guard.
                    changed = logical_store(key, value)
                    for stage in STAGES:
                        check(f'{key}/{stage}/original_type/{wrong["id"]}',
                              suite.boundary(stage, key, clone(value), clone(changed)), False,
                              'row/degraded_boolean/' + wrong['changes'][0]['path'].rsplit('/', 1)[1])
        if key == 'evidence_captured':
            # A valid span shape with coherent copies/hash/receipt, but an
            # end line beyond the independently resolved original source.
            span_case = next(c['input'] for c in positives
                             if c['input']['source']['event']['payload']['payload']['source_spans']
                             and c['input']['source']['event']['payload']['payload']['source_spans'][0]['locator_kind'] == 'line_range')
            beyond = clone(span_case)
            beyond['source']['event']['payload']['payload']['source_spans'][0]['end_line'] = len(evidence_bytes().splitlines()) + 1
            beyond['answer']['original_event'] = clone(beyond['source']['event'])
            beyond['original']['producer_digest'] = semantic_digest(beyond['source']['event'])
            for stage in STAGES:
                check(f'{key}/{stage}/span_beyond_original_source',
                      suite.boundary(stage, key, clone(beyond), logical_store(key, beyond)), False,
                      'evidence/source_line_bounds')
        # Current writer refusal must run BEFORE any historical dedupe result.
        from pm_goal_history_reader_fixtures import append_guards
        for scope in ('project', 'application'):
            for mode in ('new', 'equal_retry'):
                check(f'{key}/current_writer/{scope}/{mode}',
                      dict(errors=sorted(append_guards({'mode': mode, 'scope': scope}))), False,
                      'current_writer/prohibited')
        counts[FAMILIES[key][0]] = dict(cases=len(observations) - start,
            positives=sum(c['valid'] for c in observations[start:]),
            negatives=sum(not c['valid'] for c in observations[start:]))
    result = dict(status='fail' if failures else 'pass', fixture_only=True, native_execution='NOT_RUN',
                  existing_full_value_vector='pass',
                  families=counts, cases=len(observations),
                  positives=sum(c['valid'] for c in observations),
                  negatives=sum(not c['valid'] for c in observations),
                  guard_negative_inventory=inventory, failures=failures,
                  sweep_items=['S1/formats', 'O12/S2/shared-number-and-retained-recipe',
                               'C3-F1/C3-F3/shared-guard-isolation-tool'],
                  observations=observations)
    if output:
        Path(output).write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k not in
                      ('observations', 'guard_negative_inventory')}, indent=2))
    return 1 if failures else 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', help='External evidence JSON; not a production record')
    args = parser.parse_args()
    raise SystemExit(run(args.output))
