#!/usr/bin/env python3
"""ATS-1113..1115 planning protocol oracle. Every backend is TEST_ONLY.

Native authentication, installation, transactions and durability are NOT_RUN.
Requires jsonschema, referencing, blake3 and msgpack. No guard-proof machinery lives here;
oracle_vectors.json supplies semantic witnesses to the shared isolation sweep.
"""
from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import importlib.util
import json
import sys
from pathlib import Path
from urllib.parse import urldefrag, unquote

import blake3
import msgpack
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
from pm_goal_oracle_common import ROOT, canonical, validator, semantic_digest, revision_text
from pm_goal_lifecycle_successor_oracles import identity

PACKAGE = ROOT / 'Plans/goal_lifecycle_host_contracts'
CONTRACT = 'https://puppetmaster.local/schemas/goal_lifecycle_host/1.0.0/contracts.schema.json'
BODY = 'https://puppetmaster.local/schemas/goal_body_custody/1.0.0/goal_body_custody.schema.json'
EVENT = 'https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json'
RECEIPTS = 'https://puppetmaster.local/schemas/event_append_receipt_contracts/2.0.0'
ROUTES = ('blocked', 'completed', 'exception')
METHODS = ('capture', 'reserve', 'commit_body', 'freeze_event', 'append', 'resolve', 'publish', 'inspect')
BOUNDARIES = ('entry', 'before_helper', 'after_helper', 'final')
NOW = '2026-11-05T00:00:00Z'
_spec=importlib.util.spec_from_file_location('pm_goal_own_b_shared_wire', ROOT/'scripts/pm-implementation-readiness.py')
_wire=importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_wire)


def physical_bytes(value):
    return _wire.canonical_messagepack_bytes(value)


def physical_value(raw):
    try:
        value=msgpack.unpackb(raw,raw=False,strict_map_key=True)
        need('physical/bytes',physical_bytes(value)==raw)
        return value
    except (ValueError,TypeError,msgpack.UnpackException):
        raise Refused('physical/bytes')


def full_commitment(event):
    value=['pm.storage.original_event_value_commitment.v1','1.0.0',
           'pm.seglog_frame_v2.event_value.canonical_msgpack.v1',
           event['schema_id'],event['schema_version'],event]
    return sha(_wire.canonical_messagepack_bytes(value))


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def digest(value):
    return sha(canonical(value))


def equal(a, b):
    return canonical(a) == canonical(b)


def currentness(body):
    return sha(b'pm.goal.currentness.v1\n' + canonical({k: v for k, v in body.items() if k != 'currentness_hash'}))


class Refused(Exception):
    pass


def need(code, condition):
    if not condition:
        raise Refused(code)


class Schemas:
    """Whole original resources with explicit retrieval aliases; no network."""
    def __init__(self):
        self.docs = {}
        manifest=json.loads((PACKAGE / 'resources.json').read_text())
        self.resources = manifest['resources']
        bank=manifest['method_bank'];raw=(ROOT/bank['path']).read_bytes()
        need('resource/method_bank_hash',sha(raw)==bank['sha256'])
        self.methods=json.loads(raw)
        for row in self.resources:
            raw = (ROOT / row['path']).read_bytes()
            need('resource/hash', sha(raw) == row['sha256'])
            doc = json.loads(raw)
            resource = Resource.from_contents(doc, default_specification=DRAFT202012)
            for name in {row['id'], *row.get('aliases', [])}:
                self.docs[name] = resource
        self.registry = Registry().with_resources(self.docs.items())
        # Visit every original $ref, including definitions not reached by positives.
        self.reference_count = 0
        def visit(node, base):
            if isinstance(node, dict):
                if '$id' in node:
                    base = node
                if '$ref' in node:
                    uri, fragment = urldefrag(node['$ref'])
                    target = self.docs[uri].contents if uri else base
                    if fragment:
                        need('resource/pointer', fragment.startswith('/'))
                        for part in unquote(fragment)[1:].split('/'):
                            part=part.replace('~1','/').replace('~0','~')
                            target=target[int(part)] if isinstance(target,list) else target[part]
                    self.reference_count += 1
                for v in node.values():
                    visit(v, base)
            elif isinstance(node, list):
                for v in node:
                    visit(v, base)
        for resource in self.docs.values():
            visit(resource.contents, resource.contents)
        for route in self.methods.values():
            for method in route.get('methods',{}).values():
                for field in ('request_root','result_root'):
                    self.registry.resolver().lookup(method[field])
        self.validators = {}
        self.checked = {}

    def check(self, root, value, code='schema'):
        if root not in self.validators:
            self.validators[root] = validator({'$ref': root}, self.registry)
        cache_key=(root,json.dumps(value,sort_keys=True,ensure_ascii=False))
        if cache_key not in self.checked:
            self.checked[cache_key]=not list(self.validators[root].iter_errors(value))
        need(code,self.checked[cache_key])

    def own(self, name, value):
        self.check(CONTRACT + '#/$defs/' + name, value, 'schema/' + name)


class Realm:
    """A closed fixture realm. Request values never authorize their own origin.

    sources/origins, caller records, current owner records, and Storage receipt
    custody are independent test adapters. They are not native authority services.
    """
    def __init__(self, schemas, route):
        self.schemas = schemas
        self.route = route
        bank_key='goal.blocked' if route=='blocked' else 'goal.completed.approved_exception' if route=='exception' else 'goal.completed'
        self.method_bank=schemas.methods[bank_key]
        self.family = 'goal.blocked' if route == 'blocked' else 'goal.completed'
        self.source_id = 'pm.goal.host.' + route + '_source.v1'
        self.source_ref = 'source:' + route
        self.phase = None
        self.reservation = self.pending = self.result = None
        self.issued_result_sha256 = None
        self.event = self.frozen = None
        self.original_receipts = {}
        self.append_custody = {}
        self.body_effect_resolution = 'none'
        self.effects = 0
        self.appends = 0
        self.physical_rows = {}
        self.physical_keys = {}
        self.sources = {}
        self.origins = {}
        self.packs = {}
        self.content_visible = True
        self.current_writer = True
        self.original_resolver_available = True
        self.installed_source = self.source_id
        self.generation = 7
        self.partition = 'project~' + base64.urlsafe_b64encode(b'project:alpha').decode().rstrip('=')
        self.target = dict(storage_instance_id='storage:1', project_id='project:alpha', thread_id='thread:1', goal_id='goal:1', owning_run_id='run:1')
        self.fence = dict(owner_epoch=1, continuation_epoch=1, user_stop_epoch=2, manual_stop_latched=False, permission='write', writer_epoch=1, root_generation=7, maintenance_epoch=0, deletion_epoch=0, hold_epoch=0, secret_epoch=0)
        before = dict(goal_id='goal:1', project_id='project:alpha', thread_id='thread:1', objective_text='Fixture objective.', revision=3, state='active', blocked_reason_ref=None, active_run_ref='run:1', created_at=NOW, updated_at=NOW, currentness_hash='')
        before['currentness_hash'] = currentness(before)
        after = {**before, 'revision': 4, 'state': 'blocked' if route == 'blocked' else 'completed', 'blocked_reason_ref': 'blocker:1' if route == 'blocked' else None}
        after['currentness_hash'] = currentness(after)
        self.body = copy.deepcopy(before)
        control = dict(schema_id='pm.goal.body_control.v2', **{k: self.target[k] for k in ('storage_instance_id', 'project_id', 'thread_id', 'goal_id')}, body_key='goal_record.v2:'+self.target['project_id'].encode().hex()+':'+self.target['goal_id'].encode().hex(), body_sha256=digest(before), current_revision=3, currentness_hash=before['currentness_hash'], latest_objective_revision=1, latest_revision_hash='0'*64, origin_key='goal_origin.v1:'+self.target['project_id'].encode().hex()+':'+self.target['goal_id'].encode().hex()+':1', control_epoch=1, cancellation_receipt_ref=None, pending=None, cancellation_pending=None)
        self.control = copy.deepcopy(control)
        revision=dict(goal_id='goal:1',revision=1,objective_text=before['objective_text'],change_source='user_direct',source_message_id='message:1',approval_id=None,prior_revision_hash=None,revision_hash='',created_at=NOW)
        revision['revision_hash']=sha(b'pm.goal.objective_revision.v1\n'+canonical({k:v for k,v in revision.items() if k!='revision_hash'}))
        self.history = [revision]
        self.objective_origin=dict(goal_id='goal:1',goal_revision=1,origin_kind='internal_workflow',source_message_refs=[],source_context_manifest_ref='context:1',bound_plan_ref=None,owning_workflow_ref='workflow:1')
        control['latest_revision_hash']=revision['revision_hash'];self.control=copy.deepcopy(control)
        self.accepted_origin = dict(origin_key=control['origin_key'],revision=control['latest_objective_revision'],sha256=control['latest_revision_hash'],history=copy.deepcopy(self.history))
        self.caller = dict(ref='caller:1', revision=1, target=copy.deepcopy(self.target), owner='host.goal.continuation', continuation_id='continuation:1', actor_ref='user:1', effective_account_ref='account:1', correlation_id='correlation:1', causation_event_id=None, evidence_refs=['evidence:1'], blocker_ref='blocker:1', blocker_evidence=['evidence:blocker:1'])
        self.caller.update(goal_revision=before['revision'],goal_currentness_hash=before['currentness_hash'],next_attempt_ref=None,captured_stop_epoch=2,captured_continuation_epoch=1,captured_owner_epoch=1,decision='blocked' if route=='blocked' else 'complete',completion_route='approved_verification_exception' if route=='exception' else 'ordinary')
        self.caller['required_todo_ids']=['todo:1']
        self.caller.update(requested_account_ref=None,parent_event_id=None,node_id=None,attempt_id=None,producer_sequence_id=None,occurred_at_utc=NOW)
        self.todo = dict(list_id='todo:list:1',project_id=self.target['project_id'],thread_id=self.target['thread_id'],revision=3, items=[dict(todo_id='todo:1',revision=3, required=True, status='completed', accepted_skip_ref=None)])
        self.work = [dict(ref='background:1', status='settled')]
        self.plan = dict(ref='plan:1', status='settled')
        self.recovery = dict(ref='recovery:1', status='clear')
        self.internal = dict(ref='predicate:1', owner='caller:1', revision=1, result='met')
        self.dispositions = {}
        self.disposition_custody = {}
        self.evidence = {'evidence:1': {'owner': 'caller:1', 'revision': 1, 'target': copy.deepcopy(self.target)}}
        self.workgraph=dict(ref='graph:1',revision=1,required_worknodes=[],required_validators=['check:1'],required_criteria=['criterion:1'],child_requirements=[])
        self.request_provenance=dict(effective_account_id='account:1',requested_account=None,requested_account_id=None,execution_role='controller',permission_posture='regular',actor_identity='controller:1',lane_identity=None,attempt_id=None,approval_scope_key='approval:1',approver_identity=None)
        self.resolution_provenance={**self.request_provenance,'effective_account_id':None,'execution_role':'human','actor_identity':'user:owner','approver_identity':'user:owner'}
        self.approval_request = dict(request_ref='approval:1',original_provenance=copy.deepcopy(self.request_provenance), target=copy.deepcopy(self.target), source_ref='workflow:1', graph_revision=1, graph_sha256=digest(self.workgraph), currentness_hash=before['currentness_hash'], risk_refs=['risk:1'], dispositions=['disposition:check:1'])
        self.approval = dict(request_ref='approval:1',original_provenance=copy.deepcopy(self.resolution_provenance), request_sha256=digest(self.approval_request), approver='user:owner', status='approved', risk_refs=['risk:1'], dispositions=['disposition:check:1'])
        self.project_owner = 'user:owner'
        self.approval_current = dict(revoked=False, expired=False, graph_revision=1)
        self.workflow = dict(source_id='pm.workflow.approved_verification_exception.v1', source_ref='workflow:1', target=copy.deepcopy(self.target), graph_revision=1, graph_sha256=digest(self.workgraph), required_checks=['check:1'], checks=[dict(check_id='check:1', outcome='failed', evidence_ref='evidence:check:1', disposition_ref='disposition:check:1')], risk_refs=['risk:1'], approval_ref='approval:1', certifier='controller:1', decision='certified_with_approved_exception', truthful_label='completed_with_approved_verification_exception')
        cert=copy.deepcopy(json.loads((ROOT/'Plans/goal_certification_custody_fixtures.json').read_text())['cases'][0]['value']['original_certification'])
        cert.update(receipt_id='exception-receipt:1',project_id=self.target['project_id'],goal_id=self.target['goal_id'],goal_run_id=self.target['owning_run_id'],source_workflow_ref='workflow:1',source_schema_ref='Plans/plans_to_code_handoff.schema.json#/$defs/goal_completion_receipt',certifier_ref='controller:1',workgraph_revision=1,workgraph_sha256=digest(self.workgraph),issued_at_utc=NOW,final_certifier_decision='certified_with_approved_exception',truthful_result_label='completed_with_approved_verification_exception',unresolved_risk_refs=['risk:1'],approval_refs=['approval:1'],child_receipt_refs=[],worknode_receipt_refs=[],required_worknode_receipt_refs=[])
        cert['authority_checks'][0].update(target_ref=self.target['owning_run_id'],certifier_ref='controller:1')
        self.workflow_source_inputs=dict(source_ref='workflow:1',graph_revision=1,graph_sha256=digest(self.workgraph),required_worknodes=[],required_validators=['check:1'],required_criteria=['criterion:1'],child_requirements=[],source_control_ref='scm:1',rollback_ref='rollback:1',safe_point_ref='safe:1',recovery_ref='recovery:1')
        self.validator_records={'check:1':dict(validator_id='check:1',outcome='failed',evidence_ref='evidence:check:1',reason_code='known_verification_gap')}
        cert.update(source_workflow_sha256=digest(self.workflow_source_inputs),validator_outputs=[self.validator_records['check:1']],validator_source_bindings=[dict(validator_id='check:1',source_ref='validator:check:1',source_sha256=digest(self.validator_records['check:1']))],acceptance_criteria_disposition=[dict(criterion_ref='criterion:1',disposition='not_applicable',evidence_refs=['disposition:check:1'])])
        self.workflow['original_certification']=cert
        self.certification_owner_records=copy.deepcopy(cert)
        self.workflow_original = copy.deepcopy(self.workflow)
        if route=='exception':
            self.caller['evidence_refs']=['exception-receipt:1'];self.evidence={'exception-receipt:1':dict(owner='caller:1',revision=1,target=copy.deepcopy(self.target))}
        self.owner_snapshots = {}
        source = dict(schema_id=self.source_id, schema_version='1.0.0', target=copy.deepcopy(self.target), operation_id='operation:1', continuation_id='continuation:1', next_attempt_ref=None, caller_ref='caller:1', caller_revision=1, origin_kind='internal_workflow', decision='blocked' if route == 'blocked' else 'complete', completion_route='approved_verification_exception' if route == 'exception' else 'ordinary', body_before=before, body_after=after, control_before=control, fence=copy.deepcopy(self.fence), evidence_refs=[] if route=='blocked' else copy.deepcopy(self.caller['evidence_refs']), blocker_ref='blocker:1' if route=='blocked' else None, blocker_evidence_before=[], blocker_evidence_after=['evidence:blocker:1'], todo_ref='todo:list:1', work_ref='work:1', plan_ref='plan:1', recovery_ref='recovery:1', internal_predicate_ref='predicate:1', exception_ref='exception-receipt:1' if route=='exception' else None)
        self.install(source)
        self.selection = dict(family=self.family, payload_schema_id='pm.goal_runtime_event.'+self.family.replace('.', '_')+'.schema.v3', scope='project', source_id=self.source_id, edition='TEST_ONLY.v3', generation=7)
        self.admitted_selection = copy.deepcopy(self.selection)
        self.catalog={(self.selection['scope'],self.selection['family'],self.selection['payload_schema_id'],self.selection['source_id']):copy.deepcopy(self.selection)}

    def caller_context(self):
        return {k:self.caller[k] for k in ('actor_ref','requested_account_ref','effective_account_ref','correlation_id','causation_event_id','parent_event_id','node_id','attempt_id','producer_sequence_id','occurred_at_utc')}

    def caller_decision(self):
        keys=('ref','revision','target','owner','continuation_id','goal_revision','goal_currentness_hash','next_attempt_ref','captured_stop_epoch','captured_continuation_epoch','captured_owner_epoch','decision','completion_route','evidence_refs','required_todo_ids','blocker_ref','blocker_evidence')
        return {**{k:self.caller[k] for k in keys},'context':self.caller_context()}

    def install(self, source):
        """Test-only source issuer; called only by fixture construction."""
        source=copy.deepcopy(source)
        source['caller_context']=self.caller_context()
        if self.route!='blocked':source.update(todo_snapshot=copy.deepcopy(self.todo),required_todo_ids=copy.deepcopy(self.caller['required_todo_ids']),admitted_work_snapshot=copy.deepcopy(self.work),bound_plan_snapshot=copy.deepcopy(self.plan),recovery_snapshot=copy.deepcopy(self.recovery),internal_predicate_snapshot=copy.deepcopy(self.internal))
        raw = canonical(source)
        self.sources[self.source_ref] = raw
        self.store_part('source',source)
        self.origins[self.source_ref] = dict(sha256=sha(raw), source_id=self.source_id, target=copy.deepcopy(self.target))
        self.request = dict(operation_id=source['operation_id'], source_ref=self.source_ref, source_sha256=sha(raw))
        self.owner_snapshots = copy.deepcopy(dict(todo=self.todo, work=self.work, plan=self.plan, recovery=self.recovery, internal=self.internal))

    def source(self, request, retained=False):
        self.schemas.own('request', request)
        if retained:need('resolver/available',self.original_resolver_available is True)
        need('source/available', request['source_ref'] in self.sources and request['source_ref'] in self.origins)
        raw = self.sources[request['source_ref']]
        origin = self.origins[request['source_ref']]
        need('source/origin', sha(raw) == origin['sha256'] == request['source_sha256'])
        source = json.loads(raw)
        need('source/physical',equal(source,self.read_part('source')))
        self.schemas.own(self.route+'_source', source)
        need('source/edition', source['schema_id'] == origin['source_id'] == self.source_id and (retained or self.installed_source==self.source_id))
        need('source/target', equal(source['target'], origin['target']) and equal(source['target'], self.target))
        need('source/operation', source['operation_id'] == request['operation_id'])
        return source

    def authority(self, source, retained=False):
        need('access/disclosure', self.content_visible is True)
        if retained:
            return
        self.schemas.own('caller_decision',self.caller_decision())
        need('writer/available', self.current_writer is True)
        need('source/caller', source['caller_ref']==self.caller['ref'] and equal(source['caller_revision'],self.caller['revision']) and equal(self.caller['target'],self.target) and source['continuation_id']==self.caller['continuation_id'])
        need('source/host', self.caller['owner']=='host.goal.continuation')
        need('source/caller_context',equal(source['caller_context'],self.caller_context()))
        need('source/continuation_cas',equal(source['body_before']['revision'],self.caller['goal_revision']) and source['body_before']['currentness_hash']==self.caller['goal_currentness_hash'])
        need('source/continuation_tuple',equal(source['next_attempt_ref'],self.caller['next_attempt_ref']))
        need('source/original_epochs',equal(source['fence']['user_stop_epoch'],self.caller['captured_stop_epoch']) and equal(source['fence']['continuation_epoch'],self.caller['captured_continuation_epoch']) and equal(source['fence']['owner_epoch'],self.caller['captured_owner_epoch']))
        need('source/decision',source['decision']==self.caller['decision'] and source['completion_route']==self.caller['completion_route'])
        for key in self.fence:
            need('fence/'+key, equal(source['fence'][key],self.fence[key]))
        need('authority/stop', self.fence['manual_stop_latched'] is False)
        need('authority/permission', self.fence['permission']=='write')
        need('authority/cancellation', self.control['cancellation_receipt_ref'] is None and self.control['cancellation_pending'] is None)
        need('authority/generation', equal(self.generation,source['fence']['root_generation']))
        if self.route=='exception':
            self.exception(source)

    def exception(self, source):
        self.schemas.own('approval_request', self.approval_request)
        self.schemas.own('approval_resolution', self.approval)
        self.schemas.own('exception', self.workflow)
        self.schemas.own('exception_workflow_inputs',self.workflow_source_inputs)
        native_receipt=dict(schema_id='pm.workflow.approved_verification_exception_receipt.v1',schema_version='1.0.0',target=copy.deepcopy(self.target),receipt_id='exception-receipt:1',original_source=copy.deepcopy(self.workflow_source_inputs),original_result=copy.deepcopy(self.workflow_original),original_approval=copy.deepcopy(self.approval))
        self.schemas.own('workflow_exception_receipt',native_receipt)
        self.store_workflow_receipt(native_receipt)
        need('exception/approval_provenance',equal(self.approval_request['original_provenance'],self.request_provenance) and equal(self.approval['original_provenance'],self.resolution_provenance))
        need('exception/original_workflow', equal(self.workflow,self.workflow_original))
        cert=self.workflow['original_certification']
        need('exception/certification_original',equal(cert,self.certification_owner_records))
        need('exception/certification_target',all(cert[k]==source['target'][k] for k in ('project_id','goal_id')) and cert['goal_run_id']==source['target']['owning_run_id'] and cert['source_workflow_ref']==self.workflow['source_ref'] and equal(cert['workgraph_revision'],self.workflow['graph_revision']) and cert['workgraph_sha256']==self.workflow['graph_sha256'] and cert['final_certifier_decision']==self.workflow['decision'] and cert['truthful_result_label']==self.workflow['truthful_label'] and cert['certifier_ref']==self.workflow['certifier'] and equal(cert['unresolved_risk_refs'],self.workflow['risk_refs']) and cert['approval_refs']==[self.workflow['approval_ref']])
        need('exception/current_children',cert['child_receipt_refs']==[] and self.workflow_source_inputs['child_requirements']==[])
        need('exception/graph_origin',self.workflow['graph_sha256']==digest(self.workgraph) and self.workflow['graph_revision']==self.workgraph['revision'] and self.workflow_source_inputs['graph_sha256']==digest(self.workgraph) and all(self.workflow_source_inputs[k]==self.workgraph[k] for k in ('required_worknodes','required_validators','required_criteria','child_requirements')))
        need('exception/source_inputs',cert['source_workflow_sha256']==digest(self.workflow_source_inputs) and cert['required_worknode_receipt_refs']==self.workflow_source_inputs['required_worknodes'] and sorted(self.workflow['required_checks'])==sorted(self.workflow_source_inputs['required_validators']) and sorted(c['criterion_ref'] for c in cert['acceptance_criteria_disposition'])==sorted(self.workflow_source_inputs['required_criteria']) and all(equal(self.validator_records[v['validator_id']],v) for v in cert['validator_outputs']))
        need('exception/source', source['exception_ref']==self.workflow['original_certification']['receipt_id'] and self.workflow['source_ref']==self.approval_request['source_ref'])
        need('exception/target', equal(self.workflow['target'],source['target']) and equal(self.approval_request['target'],source['target']))
        need('exception/approval_origin', self.approval['request_ref']==self.approval_request['request_ref']==self.workflow['approval_ref'] and self.approval['request_sha256']==digest(self.approval_request))
        need('exception/approved', self.approval['status']=='approved')
        need('exception/person', self.approval['approver']==self.project_owner)
        need('exception/revoked', self.approval_current['revoked'] is False)
        need('exception/expired', self.approval_current['expired'] is False)
        need('exception/currentness', equal(self.approval_current['graph_revision'],self.workflow['graph_revision']) and equal(self.workflow['graph_revision'],self.approval_request['graph_revision']) and self.workflow['graph_sha256']==self.approval_request['graph_sha256'] and source['body_before']['currentness_hash']==self.approval_request['currentness_hash'])
        need('exception/risks', equal(self.workflow['risk_refs'],self.approval_request['risk_refs']) and equal(self.workflow['risk_refs'],self.approval['risk_refs']))
        need('exception/complete_checks', sorted(self.workflow['required_checks'])==sorted(c['check_id'] for c in self.workflow['checks']))
        needs=sorted(c['disposition_ref'] for c in self.workflow['checks'] if c['outcome']!='passed' and c['disposition_ref'] is not None)
        need('exception/dispositions', len(needs)==sum(c['outcome']!='passed' for c in self.workflow['checks']) and needs==sorted(self.approval['dispositions'])==sorted(self.approval_request['dispositions']))

    def body_predicates(self, source):
        before, after = source['body_before'], source['body_after']
        expected_control=copy.deepcopy(source['control_before'])
        if self.phase=='reserved':
            expected_control.update(pending=copy.deepcopy(self.reservation['intent']),control_epoch=expected_control['control_epoch']+1)
        need('body/preimage', equal(before,self.body) and equal(expected_control,self.control))
        need('body/control', self.control['body_sha256']==digest(self.body) and equal(self.control['current_revision'],self.body['revision']) and self.control['currentness_hash']==self.body['currentness_hash'])
        for revision in self.history:self.schemas.check(BODY+'#/$defs/revision',revision)
        self.schemas.check(BODY+'#/$defs/origin',self.objective_origin)
        need('body/accepted_history',self.control['origin_key']==self.accepted_origin['origin_key'] and equal(self.control['latest_objective_revision'],self.accepted_origin['revision']) and self.control['latest_revision_hash']==self.accepted_origin['sha256'] and equal(self.history,self.accepted_origin['history']) and self.objective_origin['goal_id']==before['goal_id'] and self.objective_origin['goal_revision']==self.history[-1]['revision'] and self.history[-1]['goal_id']==before['goal_id'] and self.history[-1]['objective_text']==before['objective_text'] and self.control['latest_revision_hash']==self.history[-1]['revision_hash'] and all(v['revision_hash']==sha(b'pm.goal.objective_revision.v1\n'+canonical({k:x for k,x in v.items() if k!='revision_hash'})) for v in self.history))
        need('body/currentness', before['currentness_hash']==currentness(before) and after['currentness_hash']==currentness(after))
        need('body/revision', equal(after['revision'],before['revision']+1))
        for k in ('goal_id','project_id','thread_id','objective_text','created_at','active_run_ref'):
            need('body/preserve/'+k, equal(before[k],after[k]))
        need('body/identity', all(before[k]==source['target'][k] for k in ('goal_id','project_id','thread_id')) and before['active_run_ref']==source['target']['owning_run_id'])
        if self.route=='blocked':
            need('blocked/edge', before['state'] in ('active','blocked') and after['state']=='blocked')
            need('blocked/reason', after['blocked_reason_ref']==source['blocker_ref']==self.caller['blocker_ref'] and equal(source['blocker_evidence_after'],self.caller['blocker_evidence']))
            need('blocked/changed', before['state']!='blocked' or before['blocked_reason_ref']!=after['blocked_reason_ref'] or source['blocker_evidence_before']!=source['blocker_evidence_after'])
        else:
            need('completed/edge', before['state']=='active' and after['state']=='completed' and after['blocked_reason_ref'] is None)
            need('completed/evidence', equal(source['evidence_refs'],self.caller['evidence_refs']) and all(ref in self.evidence and self.evidence[ref]['owner']==source['caller_ref'] and equal(self.evidence[ref]['revision'],source['caller_revision']) and equal(self.evidence[ref]['target'],source['target']) for ref in source['evidence_refs']))
            if self.route=='exception':need('completed/exception_evidence',source['exception_ref'] in source['evidence_refs'])
            self.schemas.own('todo', self.todo)
            need('completed/todo_original', equal(self.todo,source['todo_snapshot']) and source['todo_ref']==self.todo['list_id'])
            need('completed/todo_scope',self.todo['project_id']==source['target']['project_id'] and self.todo['thread_id']==source['target']['thread_id'])
            need('completed/required_todo_set',equal(source['required_todo_ids'],self.caller['required_todo_ids']))
            need('completed/required_todo_members',set(self.caller['required_todo_ids']).issubset({t['todo_id'] for t in self.todo['items']}))
            for item in self.todo['items']:
                need('completed/todo_required_flag',item['required'] is (item['todo_id'] in self.caller['required_todo_ids']))
                if item['required'] and item['status']!='completed':
                    if item['status']=='skipped':
                        self.schemas.own('disposition', self.dispositions.get(item['accepted_skip_ref']))
                        d=self.dispositions[item['accepted_skip_ref']]
                        original=self.disposition_custody.get(item['accepted_skip_ref'])
                        need('completed/skip_origin',original is not None and original['sha256']==digest(d))
                        need('completed/skip_scope',all(original[k]==source['target'][k] for k in ('project_id','thread_id')))
                        need('completed/skip_actor',original['actor']==d['actor'])
                        need('completed/skip', d['decision']=='accepted' and d['ref']==item['accepted_skip_ref'] and d['list_id']==self.todo['list_id'] and equal(d['list_revision'],self.todo['revision']) and d['todo_id']==item['todo_id'] and equal(d['todo_revision'],item['revision']) and d['owner']=='owner.todo_controller')
                    else:
                        need('completed/todo_status',False)
            need('completed/work_original', equal(self.work,source['admitted_work_snapshot']) and source['work_ref']=='work:1')
            need('completed/work_settled', all(w['status']=='settled' for w in self.work))
            need('completed/plan', equal(self.plan,source['bound_plan_snapshot']) and self.plan['ref']==source['plan_ref'] and self.plan['status'] in ('settled','absent'))
            need('completed/recovery', equal(self.recovery,source['recovery_snapshot']) and self.recovery['ref']==source['recovery_ref'] and self.recovery['status']=='clear')
            need('completed/internal', source['origin_kind']!='internal_workflow' or (equal(self.internal,source['internal_predicate_snapshot']) and self.internal['ref']==source['internal_predicate_ref'] and self.internal['owner']==source['caller_ref'] and equal(self.internal['revision'],source['caller_revision']) and self.internal['result']=='met'))

    def guarded(self, method, request, action, hook=None, retained=False):
        self.schemas.check(self.method_bank['methods'][method]['request_root'],request,'schema/'+self.route+'_'+method+'_request')
        for boundary in BOUNDARIES:
            if hook:
                hook(self,method,boundary)
            source=self.source(request,retained)
            self.authority(source,retained)
        return action(source)

    def capture(self, source):
        self.body_predicates(source)
        self.last_helper('capture',source)
        return source

    def reserve(self, source):
        self.body_predicates(source)
        need('body/unreserved',self.control['pending'] is None)
        intent=dict(operation_id=source['operation_id'],owner_ref='owner.goal.lifecycle.'+('approved_exception' if self.route=='exception' else self.route)+'.v1',owner_epoch=source['fence']['owner_epoch'],operation_kind='metadata_update',expected_revision=source['body_before']['revision'],expected_currentness_hash=source['body_before']['currentness_hash'],expected_stop_epoch=source['fence']['user_stop_epoch'],after_record=source['body_after'],accepted_revision=None,origin=None,original_change_authority_ref=None,external_authority_ref=self.source_ref)
        intent['intent_sha256']=sha(b'pm.goal.body_intent.v1\n'+canonical(intent))
        reserved_control=copy.deepcopy(self.control);reserved_control.update(pending=copy.deepcopy(intent),control_epoch=self.control['control_epoch']+1)
        self.reservation=dict(reserved_control_sha256=digest(reserved_control),source_ref=self.source_ref,source_sha256=self.request['source_sha256'],operation_id=source['operation_id'],target=source['target'],before_control_sha256=digest(self.control),intent=intent)
        self.schemas.own(self.route+'_reservation',self.reservation)
        self.last_helper('reserve',source)
        self.control=reserved_control
        self.schemas.check('https://puppetmaster.local/schemas/goal_cancel_command_custody/1.0.0/goal_cancel_command_custody.schema.json#/$defs/BodyControlV2',self.control)
        self.store_part('reservation',self.reservation)
        self.phase='reserved'
        self.shared_custody()

    def commit_body(self, source):
        need('body/reserved',self.phase=='reserved')
        self.body_predicates(source)
        need('body/reservation_preimage',self.reservation['before_control_sha256']==digest(source['control_before']) and self.reservation['reserved_control_sha256']==digest(self.control))
        p=self.reservation['intent']
        need('body/intent',p['intent_sha256']==sha(b'pm.goal.body_intent.v1\n'+canonical({k:v for k,v in p.items() if k!='intent_sha256'})) and equal(p['after_record'],source['body_after']))
        receipt=dict(schema_id='pm.goal.body_mutation_receipt.v1',**{k:source['target'][k] for k in ('storage_instance_id','project_id','thread_id','goal_id')},operation_id=source['operation_id'],intent_sha256=p['intent_sha256'],owner_ref=p['owner_ref'],authority_ref=self.source_ref,before_revision=p['expected_revision'],before_currentness_hash=p['expected_currentness_hash'],after_revision=source['body_after']['revision'],after_currentness_hash=source['body_after']['currentness_hash'],accepted_objective_revision=None,accepted_revision_hash=None,committed_at=NOW)
        self.schemas.check(BODY+'#/$defs/receipt',receipt)
        self.last_helper('commit_body',source)
        self.body_predicates(source)
        # One TEST_ONLY transaction models the required atomic body/control/receipt/pending cut.
        self.body=copy.deepcopy(source['body_after'])
        self.control.update(body_sha256=digest(self.body),current_revision=self.body['revision'],currentness_hash=self.body['currentness_hash'],control_epoch=self.control['control_epoch']+1,pending=None)
        self.original_receipts[source['operation_id']]=canonical(receipt)
        self.body_receipt=copy.deepcopy(receipt)
        self.phase='body_committed';self.effects+=1;self.body_effect_resolution='committed'
        self.pending=dict(source_ref=self.source_ref,source_sha256=self.request['source_sha256'],operation_id=source['operation_id'],target=source['target'],phase='body_committed',body_receipt=receipt,event_input=None,first_receipt=None)
        self.store_part('pending',self.pending)
        self.shared_custody()

    def resolve_body(self, source):
        key=source['operation_id']
        need('receipt/body_available',key in self.original_receipts)
        actual=json.loads(self.original_receipts[key]);self.schemas.check(BODY+'#/$defs/receipt',actual)
        need('receipt/body_original',equal(actual,self.body_receipt))
        need('receipt/body_join',actual['operation_id']==source['operation_id'] and actual['authority_ref']==self.source_ref and actual['intent_sha256']==self.reservation['intent']['intent_sha256'] and all(actual[k]==source['target'][k] for k in ('storage_instance_id','project_id','thread_id','goal_id')) and equal(actual['before_revision'],source['body_before']['revision']) and equal(actual['after_revision'],source['body_after']['revision']) and actual['before_currentness_hash']==source['body_before']['currentness_hash'] and actual['after_currentness_hash']==source['body_after']['currentness_hash'])
        return actual

    def make_event(self, source):
        receipt=self.resolve_body(source)
        p={**{k:source['target'][k] for k in ('project_id','thread_id','goal_id','owning_run_id')},'continuation_id':source['continuation_id'],'operation_id':source['operation_id'],'body_receipt_ref':'body_receipt:'+source['operation_id'],'body_receipt_sha256':digest(receipt),'before_revision':source['body_before']['revision'],'revision':source['body_after']['revision'],'before_currentness_hash':source['body_before']['currentness_hash'],'currentness_hash':source['body_after']['currentness_hash'],'user_stop_epoch':source['fence']['user_stop_epoch'],'next_attempt_ref':source['next_attempt_ref'],'state':source['body_after']['state'],'blocked_reason_ref':source['blocker_ref'],'completion_evidence_refs':source['evidence_refs']}
        eid,key=identity(self.family,{**p,'storage_instance_id':self.target['storage_instance_id']})
        return dict(schema_id='pm.event.v0',schema_version='2.0.0',scope_kind='project',event_id=eid,event_type=self.family,project_id=self.target['project_id'],thread_id=self.target['thread_id'],run_id=self.target['owning_run_id'],node_id=source['caller_context']['node_id'],attempt_id=source['caller_context']['attempt_id'],actor_ref=source['caller_context']['actor_ref'],requested_account_ref=source['caller_context']['requested_account_ref'],effective_account_ref=source['caller_context']['effective_account_ref'],occurred_at_utc=source['caller_context']['occurred_at_utc'],observed_at_utc=NOW,persisted_at_utc=NOW,sequence_id=0,producer_sequence_id=source['caller_context']['producer_sequence_id'],correlation_id=source['caller_context']['correlation_id'],causation_event_id=source['caller_context']['causation_event_id'],parent_event_id=source['caller_context']['parent_event_id'],idempotency_key=key,payload_schema_id=self.selection['payload_schema_id'],payload=p,payload_ref=None,redaction_profile='no_secrets',replay_policy='dedupe_by_idempotency_key',migration=dict.fromkeys(('migrated_from_schema_id','migrated_from_schema_version','migration_id','compatibility_event_type')))

    def freeze_event(self, source):
        need('event/body_committed',self.phase=='body_committed')
        self.frozen=self.make_event(source);self.event=copy.deepcopy(self.frozen)
        self.last_helper('freeze_event',source)
        self.phase='event_pending'
        self.pending.update(phase=self.phase,event_input=self.frozen)
        self.store_part('pending',self.pending)

    def event_predicates(self, source):
        selected=self.catalog.get((self.event['scope_kind'],self.event['event_type'],self.event['payload_schema_id'],source['schema_id']))
        need('event/selector',selected is not None and equal(selected,self.selection) and equal(self.selection,self.admitted_selection) and self.selection['source_id']==source['schema_id'] and self.selection['family']==self.family and equal(self.selection['generation'],self.generation))
        need('event/replay_only',self.event['replay_policy']!='projector_replay_only')
        self.schemas.check(EVENT,self.event,'schema/envelope')
        payload=self.event['payload']
        if self.event['payload_ref'] is not None:
            need('event/reference_codec',self.event['payload_ref'].endswith(':application/json'))
            payload=self.unpack(self.event['payload_ref'])
        self.schemas.check(selected['payload_schema_id'],payload,'schema/payload')
        need('event/receipt_digest',payload['body_receipt_sha256']==digest(self.resolve_body(source)))
        expected=self.make_event(source)
        need('event/semantic',semantic_digest({**self.event,'payload':payload,'payload_ref':None})==semantic_digest(expected))
        need('event/size',len(canonical(self.event['payload']))<=16384)

    def append(self, source):
        need('event/pending',self.phase=='event_pending')
        self.event_predicates(source)
        self.last_helper('append',source)
        event=copy.deepcopy(self.event);event.update(sequence_id=41,observed_at_utc=NOW,persisted_at_utc=NOW)
        first=dict(event_id=event['event_id'],sequence_id=41,segment_generation=7,segment_name='seg-7',byte_offset=100,commit_group_id='group:1',durability_class='barrier',durable_end_offset=1000,durability_state='synced',manifest_generation=7,acknowledged_at_utc=NOW)
        self.schemas.check(RECEIPTS+'#/$defs/AppendReceipt',first)
        self.append_custody[event['event_id']]=dict(event=canonical(event),first=canonical(first),producer_digest=semantic_digest(self.frozen),value_sha256=full_commitment(event),source_id=source['schema_id'],selection=copy.deepcopy(self.admitted_selection),storage_instance_id=self.target['storage_instance_id'])
        commitment=dict(schema_id='pm.storage.original_event_value_commitment.v1',schema_version='1.0.0',codec='pm.seglog_frame_v2.event_value.canonical_msgpack.v1',domain='pm.storage.original_event_value_commitment.v1',event_schema_id='pm.event.v0',event_schema_version='2.0.0',sha256=full_commitment(event))
        full=dict(first_append_receipt=first,original_segment_ref='segment:7',original_event_value_commitment=commitment)
        self.schemas.check(RECEIPTS+'#/$defs/full_value_result',full)
        self.append_custody[event['event_id']]['full_result']=canonical(full)
        self.first=copy.deepcopy(first);self.stored_event=copy.deepcopy(event);self.phase='event_committed';self.appends+=1
        self.pending.update(phase=self.phase,event_input=self.frozen,first_receipt=first)
        self.store_part('pending',self.pending)

    def resolve_event(self, source):
        self.resolve_body(source)
        need('receipt/event_available',self.frozen['event_id'] in self.append_custody)
        custody=self.append_custody[self.frozen['event_id']]
        actual=json.loads(custody['event']);first=json.loads(custody['first'])
        full=json.loads(custody['full_result']);self.schemas.check(RECEIPTS+'#/$defs/full_value_result',full)
        need('receipt/full_result',equal(full['first_append_receipt'],first) and full['original_event_value_commitment']['sha256']==full_commitment(actual) and full['original_segment_ref']=='segment:7')
        self.schemas.check(EVENT,actual,'schema/stored_envelope')
        if actual['payload_ref'] is not None:self.unpack(actual['payload_ref'])
        self.schemas.check(RECEIPTS+'#/$defs/AppendReceipt',first)
        need('receipt/event_original',equal(first,self.first) and equal(actual,self.stored_event))
        need('receipt/full_value',full_commitment(actual)==custody['value_sha256'] and semantic_digest(actual)==custody['producer_digest']==semantic_digest(self.frozen))
        need('receipt/event_join',first['event_id']==actual['event_id']==self.frozen['event_id'] and equal(first['sequence_id'],actual['sequence_id']) and custody['storage_instance_id']==source['target']['storage_instance_id'] and custody['source_id']==source['schema_id'] and equal(custody['selection'],self.admitted_selection))
        return actual,first

    def publish(self, source):
        need('result/event_committed',self.phase=='event_committed')
        actual,first=self.resolve_event(source)
        self.last_helper('publish',source)
        result=dict(source_ref=self.source_ref,source_sha256=self.request['source_sha256'],operation_id=source['operation_id'],target=source['target'],status='published',body_receipt_sha256=digest(self.body_receipt),event_id=actual['event_id'],event_value_sha256=full_commitment(actual),first_receipt_sha256=digest(first),truthful_label='blocked' if self.route=='blocked' else 'completed_with_approved_verification_exception' if self.route=='exception' else 'completed',approval_ref='approval:1' if self.route=='exception' else None,approver_ref=self.approval['approver'] if self.route=='exception' else None,residual_risk_refs=['risk:1'] if self.route=='exception' else [])
        self.schemas.own(self.route+'_result',result)
        self.result=canonical(result);self.issued_result_sha256=sha(self.result);self.phase='published'
        self.store_part('result',result)
        return result

    def retained(self, source):
        need('result/available',self.result is not None)
        need('result/origin',sha(self.result)==self.issued_result_sha256)
        result=json.loads(self.result);self.schemas.own(self.route+'_result',result)
        need('result/physical',equal(result,self.read_part('result')))
        need('result/original_source',result['source_sha256']==self.request['source_sha256'] and result['source_ref']==self.source_ref and result['operation_id']==source['operation_id'] and equal(result['target'],source['target']))
        if result['status']=='published':
            actual,first=self.resolve_event(source)
            need('result/original_receipts',result['body_receipt_sha256']==digest(self.body_receipt) and result['event_value_sha256']==full_commitment(actual) and result['first_receipt_sha256']==digest(first) and result['event_id']==actual['event_id'])
        self.last_helper('inspect',source,True)
        return result

    def last_helper(self, method, source, retained=False):
        if getattr(self,'active_hook',None):self.active_hook(self,method,'after_last_helper')
        actual=self.source(self.active_request,retained)
        self.authority(actual,retained)
        need('source/final_original',equal(actual,source))
        if not retained and method in ('capture','reserve','commit_body'):self.body_predicates(actual)

    def resolve(self, source):
        value=self.resolve_event(source) if self.phase in ('event_committed','published') else {'status':'pending','phase':self.phase}
        self.last_helper('resolve',source,True)
        return value

    def call(self, method, request=None, hook=None, retained=False):
        need('dispatch/method',type(method) is str and method in METHODS)
        actions=dict(capture=self.capture,reserve=self.reserve,commit_body=self.commit_body,freeze_event=self.freeze_event,append=self.append,resolve=self.resolve,publish=self.publish,inspect=self.retained)
        req=request or self.request
        retained=method in ('resolve','inspect')
        self.active_request=copy.deepcopy(req);self.active_hook=hook
        value=self.guarded(method,req,actions[method],hook,retained)
        response=dict(operation_id=req['operation_id'],source_ref=req['source_ref'],status='published' if self.phase=='published' else 'pending',result=json.loads(self.result) if self.result is not None else None)
        if self.result is not None:response['status']=response['result']['status']
        self.schemas.check(self.method_bank['methods'][method]['result_root'],response,'schema/'+self.route+'_'+method+'_response')
        return response

    def run(self, stop=None, hook=None):
        if self.result is not None:
            return self.call('inspect',hook=hook,retained=True)['result']
        for method in ('capture','reserve','commit_body','freeze_event','append','resolve','publish'):
            completed={'reserved':2,'body_committed':3,'event_pending':4,'event_committed':5,'published':7}.get(self.phase,0)
            if method in ('capture','reserve','commit_body','freeze_event','append') and ('capture','reserve','commit_body','freeze_event','append').index(method)<completed:
                continue
            self.call(method,hook=hook)
            if stop==method:
                return {'status':'pending','phase':self.phase}
        return json.loads(self.result)

    def store_workflow_receipt(self, value):
        wrapper=dict(schema_id='pm.storage_value.goal_verification_exception_receipt.v1',schema_version='1.0.0',record=value)
        if len(physical_bytes(wrapper))>16384:
            ref=self.pack(value,'application/msgpack');_,h,n,media=ref.split(':',3)
            wrapper['record']={'content_ref':dict(blake3=h,byte_size=int(n),media_type=media)}
        self.schemas.own('storage_workflow_exception_receipt',wrapper)
        need('test/workflow_receipt_size',len(physical_bytes(wrapper))<=16384)
        return wrapper

    def physical_key(self, role):
        expected='project~'+base64.urlsafe_b64encode(self.target['project_id'].encode()).decode().rstrip('=')
        need('physical/partition',self.partition==expected)
        return 'goal.lifecycle.'+self.route+'.'+role+'.v1:'+self.partition+':'+self.target['goal_id'].encode().hex()+':'+self.request_operation().encode().hex()

    def request_operation(self):
        return json.loads(self.sources[self.source_ref])['operation_id']

    def shared_custody(self):
        values=[('body',self.body),('origin',self.objective_origin),('receipt',getattr(self,'body_receipt',None)),('control',self.control)]
        values += [('revision',v) for v in self.history]
        output=[]
        for role,value in values:
            if value is None:continue
            root='storage_shared_'+role+'_msgpack'
            definition=self.schemas.docs[CONTRACT].contents['$defs'][root]
            wrapper=dict(schema_id=definition['properties']['schema_id']['const'],schema_version=definition['properties']['schema_version']['const'],record=value)
            if len(physical_bytes(wrapper))>16384:
                ref=self.pack(value,'application/msgpack');_,h,n,media=ref.split(':',3)
                wrapper['record']={'content_ref':dict(blake3=h,byte_size=int(n),media_type=media)}
                need('test/shared_reference_roundtrip',equal(self.unpack(ref),value))
            self.schemas.own(root,wrapper)
            raw=physical_bytes(wrapper);need('test/shared_transport_size',len(raw)<=16384 and equal(physical_value(raw),wrapper))
            output.append(raw)
        return output

    def store_part(self, role, value):
        self.schemas.own(self.route+'_'+role,value)
        wrapper=dict(schema_id='pm.storage_value.goal_lifecycle_'+self.route+'_'+role+'.v1',schema_version='1.0.0',record=value)
        if len(physical_bytes(wrapper))>16384:
            raw=physical_bytes(value);h=blake3.blake3(raw).hexdigest();self.packs[h]=raw
            wrapper['record']={'content_ref':dict(blake3=h,byte_size=len(raw),media_type='application/msgpack')}
        self.schemas.own('storage_'+self.route+'_'+role,wrapper)
        need('physical/size',len(physical_bytes(wrapper))<=16384)
        self.physical_rows[role]=physical_bytes(wrapper)
        self.physical_keys[role]=self.physical_key(role)

    def read_part(self, role):
        need('physical/available',role in self.physical_rows)
        need('physical/key',self.physical_keys[role]==self.physical_key(role))
        need('physical/read_size',len(self.physical_rows[role])<=16384)
        wrapper=physical_value(self.physical_rows[role]);self.schemas.own('storage_'+self.route+'_'+role,wrapper)
        value=wrapper['record']
        if 'content_ref' in value:
            ref=value['content_ref'];value=self.unpack('blake3:'+ref['blake3']+':'+str(ref['byte_size'])+':'+ref['media_type'])
        self.schemas.own(self.route+'_'+role,value)
        return value

    def terminal(self, status):
        need('result/terminal_kind',status in ('unknown','no_effect'))
        need('result/terminal_immutable',self.result is None)
        need('result/no_effect_proof',status!='no_effect' or (self.body_effect_resolution=='none' and self.effects==0 and not self.original_receipts and self.phase in (None,'reserved')))
        source=self.source(self.request)
        result=dict(source_ref=self.source_ref,source_sha256=self.request['source_sha256'],operation_id=source['operation_id'],target=source['target'],status=status,body_receipt_sha256=digest(self.body_receipt) if self.effects else None,event_id=None,event_value_sha256=None,first_receipt_sha256=None,truthful_label=status,approval_ref='approval:1' if self.route=='exception' else None,approver_ref=self.approval['approver'] if self.route=='exception' else None,residual_risk_refs=['risk:1'] if self.route=='exception' else [])
        self.schemas.own(self.route+'_result',result)
        self.result=canonical(result);self.issued_result_sha256=sha(self.result);self.phase=status;self.store_part('result',result)
        return result

    def pack(self, value, media='application/json'):
        raw=canonical(value) if media=='application/json' else physical_bytes(value);h=blake3.blake3(raw).hexdigest();self.packs[h]=raw
        return 'blake3:'+h+':'+str(len(raw))+':'+media

    def unpack(self, ref):
        parts=ref.split(':',3)
        need('reference/shape',len(parts)==4 and parts[0]=='blake3' and parts[3] in ('application/json','application/msgpack'))
        _,h,n,_=parts
        need('reference/available',h in self.packs)
        raw=self.packs[h]
        need('reference/hash',blake3.blake3(raw).hexdigest()==h)
        need('reference/size',str(len(raw))==n)
        return json.loads(raw) if parts[3]=='application/json' else physical_value(raw)


def vectors(schemas):
    """One-defect fixture construction. No removal or isolation claims."""
    cases=[]
    def case(name,route,run,expected=None):
        realm=Realm(schemas,route)
        try:
            run(realm)
            result=None
        except Refused as e:
            result=str(e)
        except Exception as e:
            result='UNEXPECTED '+type(e).__name__+': '+str(e)
        cases.append(dict(id=route+'/'+name,route=route,expected=expected,observed=result,pass_=result==expected))
    for route in ROUTES:
        case('unregistered_method',route,lambda r:r.call('foreign'),'dispatch/method')
        case('caller_admission_flag_refused',route,lambda r:r.call('capture',{**r.request,'admitted':True}),'schema/'+route+'_capture_request')
        case('complete_path',route,lambda r:r.run())
        def purged_receipt_audit(r):
            r.run();r.sources.clear();r.body=None
            body=json.loads(r.original_receipts['operation:1']);r.schemas.check(BODY+'#/$defs/receipt',body)
            row=r.append_custody[r.frozen['event_id']];r.schemas.check(RECEIPTS+'#/$defs/AppendReceipt',json.loads(row['first']))
            r.schemas.check(RECEIPTS+'#/$defs/full_value_result',json.loads(row['full_result']))
        case('independent_receipt_audit_after_content_purge',route,purged_receipt_audit)
        case('composed_inspection_missing_source',route,lambda r:(r.run(),r.sources.clear(),r.call('inspect',retained=True)),'source/available')
        case('retired_writer_original_resolver',route,lambda r:(r.run(),setattr(r,'current_writer',False),setattr(r,'installed_source','retired'),r.call('resolve')))
        case('withdrawn_original_resolver',route,lambda r:(r.run(),setattr(r,'original_resolver_available',False),r.call('inspect')),'resolver/available')
        case('postbody_stop_retains_readonly_resolution',route,lambda r:(r.run(stop='commit_body'),r.fence.update(manual_stop_latched=True),r.call('resolve')))
        case('retained_after_source_withdrawal',route,lambda r:(r.run(),setattr(r,'installed_source','retired'),r.call('inspect',retained=True)))
        case('coherent_backup_restore',route,lambda r:(r.run(),copy.deepcopy(r).call('inspect',retained=True)))
        case('retained_after_live_change',route,lambda r:(r.run(),r.body.update(state='paused'),setattr(r,'current_writer',False),r.call('inspect',retained=True)))
        case('equal_retry',route,lambda r:need('test/replayed_result',equal(r.run(),r.run()) and r.effects==r.appends==1))
        case('prebody_no_effect',route,lambda r:(r.terminal('no_effect'),need('test/not_original_terminal',r.run()['status']=='no_effect' and r.effects==0)))
        case('postbody_terminal_unknown',route,lambda r:(r.run(stop='commit_body'),r.terminal('unknown'),need('test/not_original_terminal',r.run()['status']=='unknown' and r.effects==1 and r.appends==0)))
        case('unavailable_not_no_effect',route,lambda r:(setattr(r,'body_effect_resolution','unknown'),r.terminal('no_effect')),'result/no_effect_proof')
        def forged_terminal(r):
            r.run(stop='append');r.terminal('unknown');value=json.loads(r.result);value.update(status='published',truthful_label='blocked' if r.route=='blocked' else 'completed_with_approved_verification_exception' if r.route=='exception' else 'completed',body_receipt_sha256=digest(r.body_receipt),event_id=r.stored_event['event_id'],event_value_sha256=full_commitment(r.stored_event),first_receipt_sha256=digest(r.first));r.result=canonical(value);r.store_part('result',value);r.call('inspect',retained=True)
        case('forged_unknown_to_success',route,forged_terminal,'result/origin')
        case('terminal_unknown_immutable',route,lambda r:(r.terminal('unknown'),r.terminal('no_effect')),'result/terminal_immutable')
        for stop in ('reserve','commit_body','freeze_event','append'):
            case('lost_ack_'+stop,route,lambda r,stop=stop:(r.run(stop=stop),r.run(),need('test/repeated_effect',r.effects==r.appends==1)))
        for method in METHODS:
            for boundary in (*BOUNDARIES,'after_last_helper'):
                def final_change(r,method=method,boundary=boundary):
                    order=('capture','reserve','commit_body','freeze_event','append','resolve','publish')
                    if method=='inspect':r.run()
                    else:
                        for earlier in order[:order.index(method)]:r.call(earlier)
                    def hook(x,m,b):
                        if b==boundary:x.content_visible=False
                    r.call(method,hook=hook,retained=method=='inspect')
                case(method+'_'+boundary+'_disclosure',route,final_change,'access/disclosure')
        case('forged_source_digest',route,lambda r:r.call('capture',{**r.request,'source_sha256':'a'*64}),'source/origin')
        case('missing_original_source',route,lambda r:(r.origins.clear(),r.call('capture')),'source/available')
        case('foreign_operation',route,lambda r:r.call('capture',{**r.request,'operation_id':'other'}),'source/operation')
        case('history_changed',route,lambda r:(r.history.append(copy.deepcopy(r.history[-1])),r.run()),'body/accepted_history')
        case('wrong_source_edition',route,lambda r:(setattr(r,'installed_source','forged.weaker.v0'),r.call('capture')),'source/edition')
        case('withdrawn_writer',route,lambda r:(setattr(r,'current_writer',False),r.call('capture')),'writer/available')
        case('foreign_caller',route,lambda r:(r.caller.update(ref='foreign'),r.call('capture')),'source/caller')
        case('original_caller_account_changed',route,lambda r:(r.caller.update(effective_account_ref='foreign'),r.call('capture')),'source/caller_context')
        case('worker_is_not_host',route,lambda r:(r.caller.update(owner='worker'),r.call('capture')),'source/host')
        for field in Realm(schemas,route).fence:
            def fence_change(r,field=field):
                v=r.fence[field];r.fence[field]=not v if type(v) is bool else 'deny' if type(v) is str else v+1;r.call('capture')
            case('changed_'+field,route,fence_change,'fence/'+field)
        def coherent_stop(r):
            source=json.loads(r.sources[r.source_ref]);source['fence']['manual_stop_latched']=True;r.fence['manual_stop_latched']=True;r.install(source);r.call('capture')
        def coherent_deny(r):
            source=json.loads(r.sources[r.source_ref]);source['fence']['permission']='deny';r.fence['permission']='deny';r.install(source);r.call('capture')
        case('original_stop_latched',route,coherent_stop,'authority/stop')
        case('original_permission_denied',route,coherent_deny,'authority/permission')
        case('cancellation_pending',route,lambda r:(r.control.update(cancellation_receipt_ref='cancel:1'),r.call('capture')),'authority/cancellation')
        case('root_cutover',route,lambda r:(setattr(r,'generation',8),r.call('capture')),'authority/generation')
        def reserved_mutation(r,field):
            r.run(stop='reserve')
            if field=='preimage':r.reservation['before_control_sha256']='a'*64
            else:
                r.reservation['intent']['intent_sha256']='a'*64;r.control['pending']['intent_sha256']='a'*64;r.reservation['reserved_control_sha256']=digest(r.control)
            r.call('commit_body')
        def foreign_pending(r):
            r.run(stop='reserve');r.control['pending']['operation_id']='foreign';source=json.loads(r.sources[r.source_ref]);source['control_before']=copy.deepcopy(r.control);r.phase=None;r.install(source);r.run()
        case('foreign_body_reservation',route,foreign_pending,'body/unreserved')
        case('reservation_hash_forged',route,lambda r:reserved_mutation(r,'preimage'),'body/reservation_preimage')
        case('intent_hash_forged',route,lambda r:reserved_mutation(r,'intent'),'body/intent')
        def receipt_wrong_operation(r):
            r.run(stop='commit_body');r.body_receipt['operation_id']='foreign';r.original_receipts['operation:1']=canonical(r.body_receipt);r.call('freeze_event')
        case('resolved_body_receipt_foreign_operation',route,receipt_wrong_operation,'receipt/body_join')
        def result_change(r,field,guard):
            r.run();value=json.loads(r.result);value[field]='a'*64 if field.endswith('sha256') else 'foreign';r.result=canonical(value);r.issued_result_sha256=sha(r.result);r.store_part('result',value);r.call('inspect',retained=True)
        case('issued_result_foreign_operation',route,lambda r:result_change(r,'operation_id','source'),'result/original_source')
        case('issued_result_wrong_receipt',route,lambda r:result_change(r,'first_receipt_sha256','receipt'),'result/original_receipts')
        def physical_result_change(r):
            r.run();wrapper=physical_value(r.physical_rows['result']);wrapper['record']['source_sha256']='a'*64;r.physical_rows['result']=physical_bytes(wrapper);r.call('inspect',retained=True)
        case('physical_result_value_mismatch',route,physical_result_change,'result/physical')
        case('invalid_terminal_kind',route,lambda r:r.terminal('published'),'result/terminal_kind')
        for defect in ('digest','metadata','missing','full_value','foreign_storage'):
            def receipt_change(r,defect=defect):
                r.run(stop='append')
                if defect=='digest':r.body_receipt['intent_sha256']='a'*64
                if defect=='metadata':r.first['sequence_id']+=1
                if defect=='missing':r.original_receipts.clear()
                if defect=='full_value':r.append_custody[r.frozen['event_id']]['value_sha256']='a'*64
                if defect=='foreign_storage':r.append_custody[r.frozen['event_id']]['storage_instance_id']='foreign'
                r.call('publish')
            case('receipt_'+defect,route,receipt_change,{'digest':'receipt/body_original','metadata':'receipt/event_original','missing':'receipt/body_available','full_value':'receipt/full_value','foreign_storage':'receipt/event_join'}[defect])
        case('physical_key_foreign',route,lambda r:(r.physical_keys.update(source='foreign'),r.call('capture')),'physical/key')
        case('physical_source_missing',route,lambda r:(r.physical_rows.clear(),r.call('capture')),'physical/available')
        def physical_source_mismatch(r):
            wrapper=physical_value(r.physical_rows['source']);wrapper['record']['operation_id']='foreign';r.physical_rows['source']=physical_bytes(wrapper);r.call('capture')
        case('physical_source_value_mismatch',route,physical_source_mismatch,'source/physical')
        def full_result_mismatch(r):
            r.run(stop='append');row=r.append_custody[r.frozen['event_id']];value=json.loads(row['full_result']);value['original_event_value_commitment']['sha256']='a'*64;row['full_result']=canonical(value);r.call('publish')
        case('original_full_result_forged',route,full_result_mismatch,'receipt/full_result')
        for value in ('false','0',1,[],{},None):
            case('writer_wrong_type_'+repr(value),route,lambda r,value=value:(setattr(r,'current_writer',value),r.call('capture')),'writer/available')
            case('disclosure_wrong_type_'+repr(value),route,lambda r,value=value:(setattr(r,'content_visible',value),r.call('capture')),'access/disclosure')
        case('physical_result_missing',route,lambda r:(r.run(),r.physical_rows.pop('result'),r.call('inspect',retained=True)),'physical/available')
        case('missing_first_event_receipt',route,lambda r:(r.run(stop='append'),r.append_custody.clear(),r.call('publish')),'receipt/event_available')
        case('arbitrary_payload_body_receipt_digest',route,lambda r:(r.run(stop='freeze_event'),r.event['payload'].update(body_receipt_sha256='a'*64),r.call('append')),'event/receipt_digest')
        case('actual_envelope_family_dispatch',route,lambda r:(r.run(stop='freeze_event'),r.event.update(event_type='goal.updated'),r.call('append')),'event/selector')
        case('foreign_family_dispatch',route,lambda r:(r.run(stop='freeze_event'),r.selection.update(family='goal.updated'),r.call('append')),'event/selector')
        case('replay_only_append',route,lambda r:(r.run(stop='freeze_event'),r.event.update(replay_policy='projector_replay_only'),r.call('append')),'event/replay_only')
        case('changed_semantic_retry',route,lambda r:(r.run(stop='freeze_event'),r.event.update(actor_ref='foreign'),r.call('append')),'event/semantic')
        case('storage_metadata_excluded',route,lambda r:(r.run(stop='freeze_event'),r.event.update(sequence_id=999),r.call('append')))
        case('wrong_partition',route,lambda r:(setattr(r,'partition','project:alpha'),r.call('capture')),'physical/partition')
        # Source mutations reissue the coherent fixture origin; this is one original fact.
        def source_case(name,edit,expected):
            def run(r):
                s=json.loads(r.sources[r.source_ref]);edit(r,s);r.install(s);r.run()
            case(name,route,run,expected)
        def rehash(s):
            for key in ('body_before','body_after'):s[key]['currentness_hash']=currentness(s[key])
            s['control_before'].update(body_sha256=digest(s['body_before']),currentness_hash=s['body_before']['currentness_hash'])
        def state_change(r,s,state):
            s['body_before']['state']=state
            if state=='blocked':s['body_before']['blocked_reason_ref']='blocker:old'
            rehash(s);r.body=copy.deepcopy(s['body_before']);r.control=copy.deepcopy(s['control_before']);r.caller['goal_currentness_hash']=s['body_before']['currentness_hash'];r.caller['goal_revision']=s['body_before']['revision']
            if r.route=='exception':
                r.approval_request['currentness_hash']=s['body_before']['currentness_hash'];r.approval['request_sha256']=digest(r.approval_request)
        for state in ('paused','completed','blocked'):
            if route=='blocked' and state=='blocked':continue
            source_case('source_state_'+state,lambda r,s,state=state:state_change(r,s,state),'blocked/edge' if route=='blocked' else 'completed/edge')
        source_case('foreign_target',lambda r,s:s['target'].update(goal_id='foreign'),'source/target')
        source_case('wrong_control_hash',lambda r,s:(s['control_before'].update(body_sha256='a'*64),r.control.update(body_sha256='a'*64)),'body/control')
        source_case('after_currentness_forged',lambda r,s:s['body_after'].update(currentness_hash='a'*64),'body/currentness')
        def foreign_run(r,s):
            s['body_before']['active_run_ref']='foreign';s['body_after']['active_run_ref']='foreign';rehash(s);r.body=copy.deepcopy(s['body_before']);r.control=copy.deepcopy(s['control_before']);r.caller['goal_currentness_hash']=s['body_before']['currentness_hash'];r.caller['goal_revision']=s['body_before']['revision']
            if r.route=='exception':
                r.approval_request['currentness_hash']=s['body_before']['currentness_hash'];r.approval['request_sha256']=digest(r.approval_request)
        source_case('foreign_body_run',foreign_run,'body/identity')
        def later_body(r,s):
            r.body['updated_at']='2026-11-05T00:00:01Z';r.body['currentness_hash']=currentness(r.body);r.control.update(body_sha256=digest(r.body),currentness_hash=r.body['currentness_hash'])
        source_case('stale_body_preimage',later_body,'body/preimage')
        if route=='blocked':
            def same_blocker(r,s):
                state_change(r,s,'blocked');s['body_before']['blocked_reason_ref']=s['body_after']['blocked_reason_ref'];s['blocker_evidence_before']=copy.deepcopy(s['blocker_evidence_after']);rehash(s);r.body=copy.deepcopy(s['body_before']);r.control=copy.deepcopy(s['control_before']);r.caller['goal_currentness_hash']=s['body_before']['currentness_hash'];r.caller['goal_revision']=s['body_before']['revision']
            source_case('unchanged_blocker',same_blocker,'blocked/changed')
            source_case('foreign_blocker',lambda r,s:(s.update(blocker_ref='foreign'),s['body_after'].update(blocked_reason_ref='foreign'),rehash(s)),'blocked/reason')
        source_case('forged_next_attempt',lambda r,s:s.update(next_attempt_ref='foreign'),'source/continuation_tuple')
        source_case('wrong_original_goal_revision',lambda r,s:r.caller.update(goal_revision=2),'source/continuation_cas')
        source_case('original_host_did_not_complete',lambda r,s:r.caller.update(decision='pause' if r.route=='blocked' else 'continue'),'source/decision')
        def refreshed_old_epoch(r,s):
            s['fence']['continuation_epoch']+=1;r.fence['continuation_epoch']+=1
        source_case('old_decision_epoch_not_refreshed',refreshed_old_epoch,'source/original_epochs')
        source_case('revision_step',lambda r,s:(s['body_after'].update(revision=5),rehash(s)),'body/revision')
        for immutable in ('goal_id','project_id','thread_id','created_at','active_run_ref'):
            source_case('metadata_changed_'+immutable,lambda r,s,immutable=immutable:(s['body_after'].update({immutable:'2026-11-06T00:00:00Z' if immutable=='created_at' else 'foreign'}),rehash(s)),'body/preserve/'+immutable)
        source_case('objective_changed_by_metadata',lambda r,s:(s['body_after'].update(objective_text='changed'),rehash(s)),'body/preserve/objective_text')
        for kind in ('large_payload','missing_payload','corrupt_payload','wrong_payload_size'):
            def ref_case(r,kind=kind):
                r.run(stop='freeze_event');value=copy.deepcopy(r.event['payload']);ref=r.pack(value)
                r.event.update(payload={},payload_ref=ref)
                r.frozen=copy.deepcopy(r.event)
                if kind=='missing_payload':r.packs.clear()
                if kind=='corrupt_payload':r.packs[ref.split(':')[1]]+=b' '
                if kind=='wrong_payload_size':r.event['payload_ref']=ref.replace(':'+str(len(canonical(value)))+':',':0:')
                r.call('append')
                r.call('publish')
            case(kind,route,ref_case,{'large_payload':None,'missing_payload':'reference/available','corrupt_payload':'reference/hash','wrong_payload_size':'reference/size'}[kind])
        def large_path(r):
            if r.route=='blocked':
                value={'payload':'界'*9000};reference=r.pack(value)
                need('test/reference_roundtrip',equal(value,r.unpack(reference)))
                r.run();return
            source=json.loads(r.sources[r.source_ref])
            refs=(['exception-receipt:1'] if r.route=='exception' else [])+['evidence:'+str(i)+':'+('x'*180) for i in range(100)]
            source['evidence_refs']=refs;r.caller['evidence_refs']=refs
            r.evidence={ref:dict(owner='caller:1',revision=1,target=copy.deepcopy(r.target)) for ref in refs}
            r.install(source);r.run(stop='freeze_event')
            ref=r.pack(r.event['payload']);r.event.update(payload={},payload_ref=ref);r.frozen=copy.deepcopy(r.event)
            r.pending.update(event_input=r.frozen);r.store_part('pending',r.pending)
            r.call('append');r.call('publish')
            need('test/stored_parts_size',all(len(v)<=16384 for v in r.physical_rows.values()))
            need('test/real_large_reference',len(r.sources[r.source_ref])>16384 and len(r.packs[ref.split(':')[1]])>16384)
        case('complete_large_reference_path',route,large_path)
        def large_shared(r):
            source=json.loads(r.sources[r.source_ref]);text='😀'*4000
            for key in ('body_before','body_after'):source[key]['objective_text']=text
            rehash(source);r.body=copy.deepcopy(source['body_before']);r.control=copy.deepcopy(source['control_before'])
            r.history[0]['objective_text']=text;r.history[0]['revision_hash']=sha(b'pm.goal.objective_revision.v1\n'+canonical({k:v for k,v in r.history[0].items() if k!='revision_hash'}))
            r.control['latest_revision_hash']=r.history[0]['revision_hash'];source['control_before']=copy.deepcopy(r.control)
            r.accepted_origin['sha256']=r.history[0]['revision_hash'];r.accepted_origin['history']=copy.deepcopy(r.history)
            r.caller['goal_currentness_hash']=source['body_before']['currentness_hash']
            if r.route=='exception':
                r.approval_request['currentness_hash']=source['body_before']['currentness_hash'];r.approval['request_sha256']=digest(r.approval_request)
            r.install(source);r.run();need('test/shared_objective_roundtrip',len(text)==4000 and all(len(v)<=16384 for v in r.shared_custody()))
        case('max_multibyte_objective_all_stored_parts',route,large_shared)
        def oversized_physical_read(r):
            r.physical_rows['source']+=b' '*16385;r.call('capture')
        case('whole_physical_read_limit',route,oversized_physical_read,'physical/read_size')
        def noncanonical_physical(r):
            wrapper=physical_value(r.physical_rows['source']);r.physical_rows['source']=msgpack.packb(dict(reversed(list(wrapper.items()))),use_bin_type=True);r.call('capture')
        case('noncanonical_physical_map_order',route,noncanonical_physical,'physical/bytes')
        if route!='blocked':
            def oversize_event(r):
                source=json.loads(r.sources[r.source_ref]);refs=(['exception-receipt:1'] if r.route=='exception' else [])+['evidence:'+str(i)+':'+('x'*180) for i in range(100)]
                source['evidence_refs']=refs;r.caller['evidence_refs']=refs;r.evidence={x:dict(owner='caller:1',revision=1,target=copy.deepcopy(r.target)) for x in refs};r.install(source);r.run(stop='freeze_event');r.call('append')
            case('whole_inline_event_limit',route,oversize_event,'event/size')

        def wrong_ref_scheme(r):
            r.run(stop='freeze_event');ref=r.pack(r.event['payload']);r.event.update(payload={},payload_ref=ref.replace('blake3:','sha256:'));r.frozen=copy.deepcopy(r.event);r.call('append')
        case('wrong_payload_reference_scheme',route,wrong_ref_scheme,'reference/shape')
        def wrong_payload_media(r):
            r.run(stop='freeze_event');ref=r.pack(r.event['payload'],'application/msgpack');r.event.update(payload={},payload_ref=ref);r.frozen=copy.deepcopy(r.event);r.call('append')
        case('wrong_event_payload_reference_media',route,wrong_payload_media,'event/reference_codec')
        # Real unavailable/pending resolution preserves a previously accepted body.
        case('wrong_body_method_phase',route,lambda r:r.call('commit_body'),'body/reserved')
        case('wrong_freeze_method_phase',route,lambda r:r.call('freeze_event'),'event/body_committed')
        case('wrong_append_method_phase',route,lambda r:r.call('append'),'event/pending')
        case('wrong_publish_method_phase',route,lambda r:r.call('publish'),'result/event_committed')
        case('wrong_inspect_method_phase',route,lambda r:r.call('inspect',retained=True),'result/available')
        case('pending_without_repeating_body',route,lambda r:(r.run(stop='commit_body'),need('test/not_pending',r.call('resolve')['status']=='pending'),r.run(),need('test/repeated_effect',r.effects==1)))
        if route!='blocked':
            def skip_case(r,stale=False,defect=None):
                r.todo['items'][0].update(status='skipped',accepted_skip_ref='skip:1')
                r.owner_snapshots['todo']=copy.deepcopy(r.todo)
                r.dispositions['skip:1']=dict(ref='skip:1',owner='owner.todo_controller',list_id='todo:list:1',list_revision=2 if stale else 3,todo_id='todo:1',todo_revision=3,decision='accepted',actor='user:1')
                r.disposition_custody['skip:1']=dict(sha256=digest(r.dispositions['skip:1']),project_id=r.target['project_id'],thread_id=r.target['thread_id'],actor='user:1')
                if defect=='origin':r.dispositions['skip:1']['actor']='foreign'
                if defect=='scope':r.disposition_custody['skip:1']['thread_id']='foreign'
                if defect=='actor':
                    r.dispositions['skip:1']['actor']='foreign';r.disposition_custody['skip:1']['sha256']=digest(r.dispositions['skip:1'])
                r.install(json.loads(r.sources[r.source_ref]));r.run()
            case('accepted_skip_original',route,skip_case)
            case('accepted_skip_stale_revision',route,lambda r:skip_case(r,True),'completed/skip')
            for defect in ('origin','scope','actor'):
                case('accepted_skip_'+defect,route,lambda r,defect=defect:skip_case(r,defect=defect),'completed/skip_'+defect)
            for bad in (True,1,1.0,None,[],[False],{}, {'value':False},'', 'skip\n','false','0'):
                def bad_skip(r,bad=bad):
                    r.todo['items'][0].update(status='skipped',accepted_skip_ref=bad);r.owner_snapshots['todo']=copy.deepcopy(r.todo);r.install(json.loads(r.sources[r.source_ref]));r.run()
                expected='schema/disposition' if bad is None or bad in ('false','0') else 'schema/'+route+'_source'
                case('skip_wrong_type_'+repr(bad),route,bad_skip,expected)
            def after_helper_todo_revision(r):
                def hook(x,m,b):
                    if m=='commit_body' and b=='after_last_helper':x.todo['revision']+=1;x.todo['items'][0]['revision']+=1
                r.run(hook=hook)
            case('todo_changed_after_last_helper',route,after_helper_todo_revision,'completed/todo_original')
            case('foreign_completion_evidence',route,lambda r:(r.evidence[next(iter(r.evidence))].update(owner='foreign'),r.run()),'completed/evidence')
            case('unmet_internal_owner',route,lambda r:(r.internal.update(result='unmet'),r.owner_snapshots.update(internal=copy.deepcopy(r.internal)),r.install(json.loads(r.sources[r.source_ref])),r.run()),'completed/internal')
            def absent_plan(r):
                r.plan.update(status='absent');r.owner_snapshots['plan']=copy.deepcopy(r.plan);r.install(json.loads(r.sources[r.source_ref]));r.run()
            case('authentic_absent_plan',route,absent_plan)
            case('unsettled_bound_plan',route,lambda r:(r.plan.update(status='active'),r.owner_snapshots.update(plan=copy.deepcopy(r.plan)),r.install(json.loads(r.sources[r.source_ref])),r.run()),'completed/plan')
            case('open_required_todo',route,lambda r:(r.todo['items'][0].update(status='pending'),r.owner_snapshots.update(todo=copy.deepcopy(r.todo)),r.install(json.loads(r.sources[r.source_ref])),r.run()),'completed/todo_status')
            def required_flag_false(r):
                r.todo['items'][0]['required']=False;r.install(json.loads(r.sources[r.source_ref]));r.run()
            case('required_todo_removed_from_current',route,lambda r:(r.caller['required_todo_ids'].append('removed:todo'),r.install(json.loads(r.sources[r.source_ref])),r.run()),'completed/required_todo_members')
            case('required_todo_flag_underclaimed',route,required_flag_false,'completed/todo_required_flag')
            def required_set_changed(r):
                source=json.loads(r.sources[r.source_ref]);source['required_todo_ids']=[];r.sources[r.source_ref]=canonical(source);r.origins[r.source_ref]['sha256']=sha(r.sources[r.source_ref]);r.request['source_sha256']=sha(r.sources[r.source_ref]);r.store_part('source',source);r.run()
            case('required_todo_set_underclaimed',route,required_set_changed,'completed/required_todo_set')
            def foreign_todo_thread(r):
                r.todo['thread_id']='foreign';r.install(json.loads(r.sources[r.source_ref]));r.run()
            case('foreign_todo_thread',route,foreign_todo_thread,'completed/todo_scope')
            case('todo_omission',route,lambda r:(r.todo.update(items=[]),r.run()),'completed/todo_original')
            case('work_omission',route,lambda r:(r.work.clear(),r.run()),'completed/work_original')
            case('new_work',route,lambda r:(r.work[0].update(status='active'),r.owner_snapshots.update(work=copy.deepcopy(r.work)),r.install(json.loads(r.sources[r.source_ref])),r.run()),'completed/work_settled')
            case('unknown_recovery',route,lambda r:(r.recovery.update(status='unknown'),r.owner_snapshots.update(recovery=copy.deepcopy(r.recovery)),r.install(json.loads(r.sources[r.source_ref])),r.run()),'completed/recovery')
        if route=='exception':
            def provider_response(r,status,receipt):
                native=dict(schema_id='pm.workflow.approved_verification_exception_receipt.v1',schema_version='1.0.0',target=r.target,receipt_id='exception-receipt:1',original_source=r.workflow_source_inputs,original_result=r.workflow_original,original_approval=r.approval)
                r.schemas.own('workflow_exception_issue_response',dict(status=status,receipt=native if receipt else None))
            def large_original_workflow_receipt(r):
                ids=['check:'+str(i) for i in range(100)]
                r.workgraph['required_validators']=ids;r.workflow_source_inputs.update(required_validators=ids,graph_sha256=digest(r.workgraph));r.workflow.update(required_checks=ids,graph_sha256=digest(r.workgraph),checks=[dict(check_id=x,outcome='failed',evidence_ref='evidence:'+x,disposition_ref='disposition:'+x) for x in ids])
                r.validator_records={x:dict(validator_id=x,outcome='failed',evidence_ref='evidence:'+x,reason_code='known_gap') for x in ids}
                r.approval_request.update(graph_sha256=digest(r.workgraph),dispositions=['disposition:'+x for x in ids]);r.approval.update(request_sha256=digest(r.approval_request),dispositions=r.approval_request['dispositions'])
                cert=r.workflow['original_certification'];cert.update(workgraph_sha256=digest(r.workgraph),source_workflow_sha256=digest(r.workflow_source_inputs),validator_outputs=list(r.validator_records.values()),validator_source_bindings=[dict(validator_id=x,source_ref='validator:'+x,source_sha256=digest(r.validator_records[x])) for x in ids]);r.certification_owner_records=copy.deepcopy(cert);r.workflow_original=copy.deepcopy(r.workflow)
                r.run();native=dict(schema_id='pm.workflow.approved_verification_exception_receipt.v1',schema_version='1.0.0',target=r.target,receipt_id='exception-receipt:1',original_source=r.workflow_source_inputs,original_result=r.workflow_original,original_approval=r.approval)
                wrapper=r.store_workflow_receipt(native);need('test/large_workflow_reference','content_ref' in wrapper['record'])
            case('large_original_workflow_receipt',route,large_original_workflow_receipt)
            case('workflow_issued_receipt',route,lambda r:provider_response(r,'issued',True))
            case('workflow_unknown_no_receipt',route,lambda r:provider_response(r,'unknown',False))
            case('workflow_issued_missing_receipt',route,lambda r:provider_response(r,'issued',False),'schema/workflow_exception_issue_response')
            case('workflow_unknown_with_success_receipt',route,lambda r:provider_response(r,'unknown',True),'schema/workflow_exception_issue_response')
            def pending_approval(r,fake=False):
                value=copy.deepcopy(r.approval);value.update(status='pending',approver='worker' if fake else None);value['original_provenance']=copy.deepcopy(r.request_provenance);r.schemas.own('approval_resolution',value)
            case('approval_genuine_pending_without_approver',route,pending_approval)
            case('approval_pending_fake_approver',route,lambda r:pending_approval(r,True),'schema/approval_resolution')
            case('approval_native_resolution_request',route,lambda r:r.schemas.own('approval_resolve_request',dict(request_ref='approval:1',request_sha256=digest(r.approval_request))))
            case('goal_operation_is_not_approval_identity',route,lambda r:r.schemas.own('approval_resolve_request',r.request),'schema/approval_resolve_request')
            def forged_approval_actor(r):
                r.approval_request['original_provenance']['actor_identity']='foreign';r.approval['request_sha256']=digest(r.approval_request);r.run()
            case('exception_approval_provenance_forged',route,forged_approval_actor,'exception/approval_provenance')
            case('exception_original_certificate',route,lambda r:(r.workflow['original_certification'].update(certifier_ref='worker'),r.workflow_original.update(original_certification=copy.deepcopy(r.workflow['original_certification'])),r.run()),'exception/certification_original')
            def forged_graph(r):
                r.workflow['graph_sha256']='a'*64;r.workflow_source_inputs['graph_sha256']='a'*64;r.approval_request['graph_sha256']='a'*64;r.approval['request_sha256']=digest(r.approval_request);r.workflow['original_certification'].update(workgraph_sha256='a'*64,source_workflow_sha256=digest(r.workflow_source_inputs));r.certification_owner_records=copy.deepcopy(r.workflow['original_certification']);r.workflow_original=copy.deepcopy(r.workflow);r.run()
            case('exception_arbitrary_graph_digest',route,forged_graph,'exception/graph_origin')
            case('exception_original_source_hash',route,lambda r:(r.workflow_source_inputs.update(source_control_ref='foreign'),r.run()),'exception/source_inputs')
            def issue_changed_certificate(r,field,value):
                r.workflow['original_certification'][field]=value;r.certification_owner_records=copy.deepcopy(r.workflow['original_certification']);r.workflow_original=copy.deepcopy(r.workflow);r.run()
            case('exception_certifier_mismatch',route,lambda r:(r.workflow.update(certifier='worker'),r.workflow_original.update(certifier='worker'),r.run()),'exception/certification_target')
            def unrelated_exception_evidence(r):
                source=json.loads(r.sources[r.source_ref]);source['evidence_refs']=['other:evidence'];r.caller['evidence_refs']=['other:evidence'];r.evidence={'other:evidence':dict(owner='caller:1',revision=1,target=copy.deepcopy(r.target))};r.install(source);r.run()
            case('exception_evidence_must_name_receipt',route,unrelated_exception_evidence,'completed/exception_evidence')
            case('exception_certificate_foreign_target',route,lambda r:issue_changed_certificate(r,'goal_id','foreign'),'exception/certification_target')
            case('exception_child_receipt',route,lambda r:issue_changed_certificate(r,'child_receipt_refs',['child:1']),'exception/current_children')
            def foreign_workflow_target(r):
                r.workflow['target']['goal_id']='foreign';r.workflow_original=copy.deepcopy(r.workflow);r.run()
            case('exception_workflow_foreign_target',route,foreign_workflow_target,'exception/target')
            case('exception_original_decision_tampered',route,lambda r:(r.workflow.update(certifier='worker'),r.run()),'exception/original_workflow')
            case('exception_disposition_mismatch',route,lambda r:(r.approval.update(dispositions=['foreign']),r.run()),'exception/dispositions')
            source_case('exception_wrong_source_ref',lambda r,s:s.update(exception_ref='foreign'),'exception/source')
            def missing_verifier(r):
                r.workflow['required_checks'].append('check:2');r.workflow_source_inputs['required_validators'].append('check:2');r.workgraph['required_validators'].append('check:2');r.workflow['graph_sha256']=digest(r.workgraph);r.workflow_source_inputs['graph_sha256']=digest(r.workgraph);r.approval_request['graph_sha256']=digest(r.workgraph);r.approval['request_sha256']=digest(r.approval_request);r.workflow['original_certification']['workgraph_sha256']=digest(r.workgraph);r.workflow['original_certification']['source_workflow_sha256']=digest(r.workflow_source_inputs);r.certification_owner_records=copy.deepcopy(r.workflow['original_certification']);r.workflow_original=copy.deepcopy(r.workflow);r.run()
            case('exception_missing_required_check',route,missing_verifier,'exception/complete_checks')
            for field,change,expected in [('person',lambda r:r.approval.update(approver='worker'),'exception/person'),('denied',lambda r:r.approval.update(status='denied'),'exception/approved'),('revoked',lambda r:r.approval_current.update(revoked=True),'exception/revoked'),('expired',lambda r:r.approval_current.update(expired=True),'exception/expired'),('new_risk',lambda r:r.approval.update(risk_refs=['risk:other']),'exception/risks'),('stale_graph',lambda r:r.approval_current.update(graph_revision=2),'exception/currentness'),('arbitrary_request_digest',lambda r:r.approval.update(request_sha256='a'*64),'exception/approval_origin'),('ordinary_as_exception',lambda r:r.workflow.update(decision='certified'),'schema/exception')]:
                case('exception_'+field,route,lambda r,change=change:(change(r),r.run()),expected)
    return cases


def main(argv=None):
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path);args=parser.parse_args(argv)
    schemas=Schemas();rows=vectors(schemas)
    result=dict(status='pass' if all(r['pass_'] for r in rows) else 'fail',activation='TEST_ONLY_PREPARED_WITHOUT_ADMISSION',native_execution='NOT_RUN',cases=len(rows),positives=sum(r['expected'] is None for r in rows),negatives=sum(r['expected'] is not None for r in rows),failures=[r for r in rows if not r['pass_']],schema_resources=len(schemas.resources),schema_references=schemas.reference_count,rows=rows,guard_isolation='SHARED_TOOL_SWEEP_NOT_RUN',number_and_format_sweep='NOT_RUN')
    if args.output:args.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='rows'},indent=2))
    return 0 if result['status']=='pass' else 1


if __name__=='__main__':
    sys.exit(main())
