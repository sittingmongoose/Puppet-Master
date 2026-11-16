#!/usr/bin/env python3
"""C3-W12 original-input closure preflight; TEST_ONLY, native NOT_RUN.

This is a failing prerequisite check, not another partial family oracle suite.
It never changes an original source, resource bank, URI, digest or issuer map.
Exit 2 means that the selected original inputs cannot run the requested suite.
No guard-removal engine, numerical recipe or substitute authority is provided.
"""
from __future__ import annotations

import argparse
import copy
import importlib
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True

from referencing import Resource
from referencing.jsonschema import DRAFT202012

from pm_goal_own_c_oracles import ApprovalOwner, ROOT, SCHEMA, SchemaBank
from pm_goal_own_c_roots import OriginalBank, digest
from pm_goal_own_c_source_oracles import load_originals
from pm_goal_current_writer_oracles import recipe


PACKET_SHA256 = 'afa83115a8d39ad8dc6cb911ae8c9cc6985ac705eb792d8ed962dce31159e839'
MISSING_URI = 'https://puppetmaster.local/Plans/shared_integration_runtime.schema.json'
SELECTED_BANKS = (
    ('goal.updated', 'Plans/goal_update_schema_resources.json', None),
    ('goal.updated', 'Plans/goal_updated_consumer_resources.json', None),
    ('goal.cancelled', 'Plans/goal_cancel_schema_resources.json', None),
    ('goal.cancelled', 'Plans/goal_workflow_cancel_current_inspection_schema_resources.v2.json',
     'goal_current_inspection'),
)


class ReferenceInventory(OriginalBank):
    """Collect exact unresolved sites without suppressing the closure failure.

    Resource loading, URI-origin checks and all whole-byte pins are inherited
    unchanged. Lookup remains offline in each bank's own registry. The inventory
    is not returned as a usable bank and cannot validate a method argument.
    """

    def __init__(self, declaration, locations):
        self.unresolved = []
        self.reference_sites = []
        super().__init__(declaration, locations)

    def _refs(self, node, resolver, pointer=''):
        if isinstance(node, dict):
            if '$id' in node:
                resolver = resolver.in_subresource(
                    Resource.from_contents(node, default_specification=DRAFT202012))
            if '$ref' in node:
                site = dict(base_uri=resolver._base_uri, pointer=pointer + '/$ref',
                            reference=node['$ref'])
                self.reference_sites.append(site)
                try:
                    resolver.lookup(node['$ref'])
                except Exception as error:
                    self.unresolved.append({**site, 'error_type': type(error).__name__})
            # Walk all nested values, including unused/embedded original schemas.
            for key, value in node.items():
                if isinstance(value, (dict, list)):
                    escaped = key.replace('~', '~0').replace('/', '~1')
                    self._refs(value, resolver, pointer + '/' + escaped)
        elif isinstance(node, list):
            for index, value in enumerate(node):
                self._refs(value, resolver, pointer + '/' + str(index))


def bank_preflight():
    locations = json.loads((ROOT / 'Plans/goal_own_c_contracts/whole-root-banks.json')
                           .read_text())['whole_resource_locations']
    results = []
    for family, path, realm in SELECTED_BANKS:
        raw = (ROOT / path).read_bytes()
        declaration = json.loads(raw)
        if realm is not None:
            declaration = declaration['realms'][realm]
        inventory = ReferenceInventory(declaration, locations)
        # Also execute the unmodified qualifier. The diagnostic collector is
        # never allowed to turn its failed lookup into a qualified bank.
        try:
            qualified = OriginalBank(declaration, locations)
            ordinary_result = 'PASS'
            ordinary_error = None
            assert not inventory.unresolved
            assert len(qualified.documents) == len(inventory.documents)
        except Exception as error:
            ordinary_result = 'BLOCKED'
            ordinary_error = str(error)
            assert inventory.unresolved, 'non-reference prerequisite failure'
        results.append(dict(
            event_type=family, path=path, sha256=digest(raw), realm=realm,
            result=ordinary_result, ordinary_qualifier_error=ordinary_error,
            whole_resource_count=len(inventory.documents),
            unresolved=inventory.unresolved,
            missing_uri_declared=MISSING_URI in inventory.documents,
        ))
    return results


def qualify_packet(directory):
    raw = (directory / 'manifest.json').read_bytes()
    if digest(raw) != PACKET_SHA256:
        raise ValueError('original packet manifest hash differs')
    packet = json.loads(raw)
    for row in packet['files']:
        actual = (directory / row['path']).read_bytes()
        if len(actual) != row['bytes'] or digest(actual) != row['sha256']:
            raise ValueError('original packet member differs: ' + row['path'])
    return packet


def source_preflight():
    inputs, codec = load_originals()
    directory = Path(inputs['original_codec']).parent
    packet = qualify_packet(directory)
    capture = Path(inputs['original_update_capture'])
    phase0 = json.loads((capture / '01-U0.json').read_text())
    source = phase0['source']
    direct_request = phase0['input']['request']
    identity = copy.deepcopy(source['normalized_identity'])
    fields = ('storage_instance_id', 'dispatch_id', 'command_outcome_ref', 'acceptance',
              'owner_epoch', 'stop_epoch', 'prior_objective_revision', 'prior_revision_hash',
              'source_authority_ref')
    metadata = {key: copy.deepcopy(source[key]) for key in fields}
    metadata.update(producer_metadata=copy.deepcopy(phase0['progress']['producer_metadata']),
                    result_ref='result:c3-w12:preflight',
                    terminal_authority_ref='terminal:c3-w12:preflight')
    sys.path.insert(0, str(directory))
    try:
        original_source = importlib.import_module('goal_source')
        original_support = importlib.import_module('goal_update_support')
        if Path(original_source.__file__).resolve() != (directory / 'goal_source.py').resolve():
            raise ValueError('substituted original source module')
        if Path(original_support.__file__).resolve() != (directory / 'goal_update_support.py').resolve():
            raise ValueError('substituted original support module')
        # Valid complete Direct Save control. This creates source state only;
        # no Goal, body, receipt, append or terminal owner is constructed.
        direct = original_source.GoalSource(copy.deepcopy(direct_request),
            copy.deepcopy(identity), copy.deepcopy(metadata), None, now=source['captured_at'])
        codec.check(direct._update_state['source'], 'SourceAudit')

        request = copy.deepcopy(direct_request)
        request.update(change_source='agent_proposed_user_approved',
                       source_message_id='message:c3-w12:agent',
                       approval_id='approval:1',
                       command_instance_id='command:c3-w12:agent',
                       idempotency_key='sir-idempotency:c3-w12:agent')
        identity.update(command_instance_id=request['command_instance_id'],
                        operation_id='goal-operation:c3-w12:agent',
                        request_ref='request:c3-w12:agent',
                        dispatch_frame_id='frame:c3-w12:agent',
                        idempotency_key=request['idempotency_key'])
        identity['owner_identity'].update(
            command_instance_id=identity['command_instance_id'],
            operation_id=identity['operation_id'])
        proposal = dict(schema_id='pm.goal.update.proposal_request.v1',
            schema_version='1.0.0', command_id='cmd.chat.goal.propose_update',
            command_instance_id='proposal:c3-w12',
            target=dict(scope={key: source[key] for key in
                ('storage_instance_id', 'project_id', 'thread_id', 'goal_id')},
                expected_revision=request['expected_revision'],
                expected_currentness_hash=request['expected_currentness_hash'],
                objective_text=request['objective_text']),
            actor_ref=request['actor_ref'],
            permission_snapshot_ref=request['permission_snapshot_ref'],
            source_message_id=request['source_message_id'],
            instruction_message_id='message:c3-w12:explicit-user-instruction',
            return_route_ref=request['return_route_ref'])
        provider = ApprovalOwner(proposal, SchemaBank(SCHEMA))
        provider.capture(copy.deepcopy(proposal))
        resolution = provider.resolve_for_mutation(copy.deepcopy(proposal),
                                                   copy.deepcopy(provider.resolution))
        identity['payload_sha256'] = codec.h(request)
        metadata.update(dispatch_id='dispatch:c3-w12:agent',
                        command_outcome_ref='outcome:c3-w12:agent',
                        source_authority_ref='source:c3-w12:agent')
        metadata['acceptance'].update(
            change_source=request['change_source'],
            source_message_id=request['source_message_id'], approval_id=request['approval_id'],
            original_change_authority_ref=resolution['protected_person_decision_ref'])
        metadata['acceptance']['origin']['source_message_refs'] = [request['source_message_id']]
        event_id, event_key = recipe('goal.updated', {
            **{key: source[key] for key in
               ('storage_instance_id', 'project_id', 'thread_id', 'goal_id')},
            **{key: identity[key] for key in
               ('command_id', 'command_instance_id', 'operation_id')}})
        metadata['producer_metadata'].update(event_id=event_id, idempotency_key=event_key)
        # Keep the request hash and SourceAudit acceptance coherent. The complete
        # roots pass before calling the original source; this is not a schema
        # or stale-copy negative masquerading as a provider integration failure.
        candidate = copy.deepcopy(source)
        for key in fields:
            candidate[key] = copy.deepcopy(metadata[key])
        candidate['normalized_identity'] = copy.deepcopy(identity)
        candidate['nonterminal_outcome'].update(
            identity=copy.deepcopy(identity['owner_identity']),
            payload_sha256=identity['payload_sha256'],
            idempotency_key=identity['idempotency_key'],
            dispatch_frame_id=identity['dispatch_frame_id'])
        codec.check(request, 'GoalUpdateRequestV2')
        codec.check(identity, 'NormalizedIdentity')
        codec.check(metadata['producer_metadata'], 'ProducerMetadata')
        codec.check(candidate, 'SourceAudit')
        try:
            original_source.GoalSource(request, identity, metadata, None,
                                       now=source['captured_at'])
        except original_support.Unavailable as error:
            observed = str(error)
        else:
            raise AssertionError('selected original source unexpectedly accepted agent route')
        if observed != 'agent approval provider unavailable in this finite original Direct Save profile':
            raise AssertionError('agent route failed for another defect: ' + observed)
        return dict(
            result='BLOCKED', direct_source_control='PASS', provider_component='PASS',
            complete_request_and_source_roots='PASS', observed_refusal=observed,
            selected_source=str(directory / 'goal_source.py'),
            selected_source_sha256=digest((directory / 'goal_source.py').read_bytes()),
            selected_packet_manifest_sha256=PACKET_SHA256,
            qualified_packet_members=len(packet['files']),
            source_births_after_probe=original_source._SOURCE_EVER_ENTERED,
            body_or_append_owners_constructed=False,
            mutated_original_files=False,
        )
    finally:
        sys.path.remove(str(directory))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    result = dict(status='BLOCKED_ORIGINAL_INPUTS', native_execution='NOT_RUN',
                  family_oracle_closure='NOT_CLAIMED', new_product_guards={},
                  new_complete_path_oracles=0)
    try:
        result['banks'] = bank_preflight()
        result['goal_updated_source'] = source_preflight()
        if not any(row['unresolved'] for row in result['banks']):
            raise AssertionError('recorded cancellation prerequisite defect no longer reproduces')
    except Exception as error:
        result['status'] = 'PREFLIGHT_ERROR'
        result['error'] = dict(type=type(error).__name__, message=str(error))
    raw = json.dumps(result, indent=2, ensure_ascii=False) + '\n'
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(raw)
    print(raw, end='')
    return 2


if __name__ == '__main__':
    raise SystemExit(main())
