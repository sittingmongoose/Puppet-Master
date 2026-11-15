#!/usr/bin/env python3
"""Exact C3-W12 successor qualification and approval-issuer probes.

Component results never assert W1/W2 whole-root closure. Native NOT_RUN.
No predecessor map, class, bank, source byte or hash is changed.
"""
from __future__ import annotations
import argparse
import copy
import importlib.util
import json
from pathlib import Path
import sys
from types import SimpleNamespace
from urllib.parse import urljoin

sys.dont_write_bytecode = True
from pm_goal_own_c_oracles import ROOT, Suite, Refusal, require, equal
from pm_goal_own_c_roots import OriginalBank, digest
from pm_goal_own_c_source_oracles import load_originals
from pm_goal_own_c3_w12_approval import ChatOwnerV2, PersonOwnerV2, ApprovalBridgeV2, check_acceptance_v2
from pm_goal_own_c3_w12_bank import selected_bank, ScopedBankV2

DIRECTORY = ROOT/'Plans/goal_own_c_contracts/w12-successor-v2'
URI = 'https://puppetmaster.local/Plans/shared_integration_runtime.schema.json'


def approval_fixture(codec, defect=None):
    scope = dict(storage_instance_id='11111111-1111-4111-8111-111111111111',
                 project_id='project/1', thread_id='thr_1', goal_id='goal:original')
    target = dict(scope=scope, expected_revision=1,
                  expected_currentness_hash='a'*64, objective_text='  Replacement 🌱\n')
    q = dict(schema_id='pm.goal.update.proposal_request.v1', schema_version='1.0.0',
        command_id='cmd.chat.goal.propose_update', command_instance_id='proposal:actual',
        target=copy.deepcopy(target), actor_ref='actor:agent', permission_snapshot_ref='permission:actual',
        source_message_id='message:agent', instruction_message_id='message:user', return_route_ref='route:actual')
    chat, human = ChatOwnerV2(), PersonOwnerV2('person:actual')
    agent_actor = 'actor:other' if defect == 'agent_actor' else q['actor_ref']
    agent_thread = 'thread:other' if defect == 'agent_thread' else scope['thread_id']
    chat.agent_message(q['source_message_id'], agent_thread, agent_actor, target['objective_text'])
    instruction = copy.deepcopy(target)
    if defect == 'instruction_target':
        instruction['objective_text'] = 'A different, actual instruction'
    if defect == 'instruction_role':
        chat.agent_message(q['instruction_message_id'], scope['thread_id'], q['actor_ref'], target['objective_text'])
    elif defect != 'missing_instruction':
        chat.user_instruction(q['instruction_message_id'], scope['thread_id'], instruction)
    dispatched = copy.deepcopy(q)
    if defect == 'dispatch':
        dispatched['return_route_ref'] = 'route:other'
    if defect != 'missing_dispatch':
        chat.accept_dispatch(dispatched)
    bridge = ApprovalBridgeV2(chat, human, q, codec, 'approval:actual',
        '2026-11-05T00:00:00Z', '2026-11-06T00:00:00Z')
    decision = 'denied' if defect == 'denied' else 'approved'
    if defect != 'missing_decision':
        human.protected_decision('approval:actual', 'b'*64 if defect=='decision_hash' else codec.h(q), decision, '2026-11-05T00:01:00Z')
    bridge.now = '2026-11-05T01:00:00Z'
    request = dict(schema_id='pm.goal.update.request.v2', schema_version='2.0.0',
        command_id='cmd.chat.goal.update', command_instance_id='command:actual',
        **{k:scope[k] for k in ('project_id', 'thread_id', 'goal_id')},
        expected_revision=target['expected_revision'], expected_currentness_hash=target['expected_currentness_hash'],
        objective_text=target['objective_text'], actor_ref=q['actor_ref'],
        permission_snapshot_ref=q['permission_snapshot_ref'], idempotency_key='sir:actual',
        source_surface='chat_goal_approved_agent', return_route_ref=q['return_route_ref'],
        change_source='agent_proposed_user_approved', source_message_id=q['source_message_id'],
        approval_id='approval:actual')
    acceptance = dict(change_source=request['change_source'], source_message_id=request['source_message_id'],
        approval_id=request['approval_id'], original_change_authority_ref='protected-person-v2:approval:actual',
        source_context_manifest_ref='context:actual', origin=dict(goal_id=scope['goal_id'], goal_revision=2,
        origin_kind='user_request', source_message_refs=[q['source_message_id']],
        source_context_manifest_ref='context:actual', bound_plan_ref=None, owning_workflow_ref=None))
    metadata = dict(storage_instance_id=scope['storage_instance_id'], acceptance=acceptance)
    return bridge, request, metadata


class SourceSpecimen:
    """Approval-boundary fixture only; not an original command/body source."""
    pass


def exercise_approval(suite, codec):
    for defect, guard in [('agent_actor','A2/agent_message'), ('agent_thread','A2/agent_message'),
            ('instruction_target','A2/instruction'), ('instruction_role','A2/instruction'),
            ('missing_instruction','A2/instruction'), ('dispatch','A2/dispatch'),
            ('missing_dispatch','A2/dispatch')]:
        suite.case('approval/'+defect, lambda d=defect:approval_fixture(codec,d), guard)
    for defect, guard in [('denied','A2/approved'), ('missing_decision','A2/person_decision'),('decision_hash','A2/request_hash')]:
        suite.case('approval/'+defect, lambda d=defect:approval_fixture(codec,d)[0].resolve(), guard)
    suite.case('approval/actual_original', lambda:approval_fixture(codec)[0].resolve())
    for attr, value, guard in [('revoked',True,'A2/revoked'), ('allowed',False,'A2/provider_access'),
            ('now','2026-11-06T00:00:00Z','A2/expiry')]:
        def negative(a=attr,v=value):
            bridge, _, _ = approval_fixture(codec)
            setattr(bridge,a,v)
            return bridge.resolve()
        suite.case('approval/'+attr,negative,guard)
    for field in ('actor_ref','permission_snapshot_ref','return_route_ref','source_message_id'):
        def negative(k=field):
            bridge,request,metadata=approval_fixture(codec)
            request[k]='another:actual'
            # Source metadata repeats this field only for source_message_id.
            if k=='source_message_id':
                metadata['acceptance'][k]=request[k]
                metadata['acceptance']['origin']['source_message_refs']=[request[k]]
            return bridge.admit_source(SourceSpecimen(),request,metadata)
        suite.case('approval/request/'+field,negative,'A2/request/'+field)
    for field in ('goal_id','expected_revision','expected_currentness_hash','objective_text'):
        def negative(k=field):
            bridge,request,metadata=approval_fixture(codec)
            request[k]=2 if k=='expected_revision' else ('b'*64 if k=='expected_currentness_hash' else 'other')
            return bridge.admit_source(SourceSpecimen(),request,metadata)
        suite.case('approval/target/'+field,negative,'A2/target')
    def changed_decision():
        bridge,_,_=approval_fixture(codec)
        bridge.human.decisions['approval:actual']['approver_ref']='person:substituted'
        return bridge.resolve()
    suite.case('approval/decision_issuance',changed_decision,'A2/person_decision_issuance')
    for field,guard in [('messages','A2/message_issuance'),('dispatches','A2/dispatch_issuance')]:
        def negative(k=field):
            bridge,_,_=approval_fixture(codec)
            getattr(bridge.chat,k).clear()
            return bridge.resolve()
        suite.case('approval/issuance/'+field,negative,guard)
    def live_then_retained(expire):
        bridge,request,metadata=approval_fixture(codec)
        source=SourceSpecimen()
        bridge.admit_source(source,request,metadata)
        source._update_state=dict(clock=bridge.now,source=dict(storage_instance_id=metadata['storage_instance_id'],
            acceptance=copy.deepcopy(metadata['acceptance'])),input=dict(request=copy.deepcopy(request)))
        source._approval_owner_v2=bridge
        check_acceptance_v2(source,live=True)
        if expire:
            bridge.now='2026-11-06T00:00:00Z'
            source._update_state['input']=None
        return check_acceptance_v2(source,live=not expire)
    suite.case('approval/admitted_source',lambda:live_then_retained(False))
    suite.case('approval/retained_after_expiry_and_content_loss',lambda:live_then_retained(True))
    for decision in ('approved','denied'):
        # Repeated protected person decisions cannot replace the first result.
        def negative(d=decision):
            bridge,_,_=approval_fixture(codec)
            return bridge.human.protected_decision('approval:actual',codec.h(bridge.request),d,
                                                    '2026-11-05T00:02:00Z')
        suite.case('approval/immutable_person/'+decision,negative,'A2/person_decision_absent')
    for field,value,guard in [('allowed',False,'A2/protected_person_access'),
            ('epoch',2,'A2/person_epoch'),('epoch',True,'A2/person_epoch_type')]:
        def negative(k=field,v=value):
            bridge,_,_=approval_fixture(codec)
            setattr(bridge.human,k,v)
            return bridge.resolve()
        suite.case('approval/person/'+field+'/'+repr(value),negative,guard)
    for field in ('chat','human','codec'):
        def negative(k=field):
            bridge,_,_=approval_fixture(codec)
            other,_,_=approval_fixture(codec)
            setattr(bridge,k,getattr(other,k) if k!='codec' else object())
            return bridge.resolve()
        suite.case('approval/participant/'+field,negative,'A2/original_participants')
    def changed_proposal():
        bridge,_,_=approval_fixture(codec)
        bridge.request['target']['objective_text']='Changed complete proposal'
        return bridge.resolve()
    suite.case('approval/original_proposal',changed_proposal,'A2/original_proposal')
    def repeated_source():
        bridge,q,m=approval_fixture(codec)
        source=SourceSpecimen()
        bridge.admit_source(source,q,m)
        bridge.admit_source(source,q,m)
    suite.case('approval/source_birth_repeated',repeated_source,'A2/source_birth_absent')
    for defect in ('immutable_acceptance','original_input','provider_identity'):
        def negative(d=defect):
            bridge,q,m=approval_fixture(codec)
            source=SourceSpecimen()
            bridge.admit_source(source,q,m)
            source._update_state=dict(clock=bridge.now,source=dict(storage_instance_id=m['storage_instance_id'],
                acceptance=copy.deepcopy(m['acceptance'])),input=dict(request=copy.deepcopy(q)))
            source._approval_owner_v2=bridge
            if d=='immutable_acceptance':source._update_state['source']['acceptance']['original_change_authority_ref']='decision:substituted'
            elif d=='original_input':source._update_state['input']['request']['objective_text']='Changed entire text'
            else:source._approval_owner_v2=object()
            return check_acceptance_v2(source,live=True)
        suite.case('approval/source/'+defect,negative,'A2/'+defect)
    def unissued_source():
        bridge,q,m=approval_fixture(codec)
        source=SourceSpecimen()
        source._update_state=dict(source=dict(acceptance=copy.deepcopy(m['acceptance'])))
        source._approval_owner_v2=bridge
        return check_acceptance_v2(source,live=True)
    suite.case('approval/source/unissued',unissued_source,'A2/source_issuance')
    for field,value,guard in [('approval_id','approval:substituted','A2/approval_id'),
            ('change_source','user_direct','A2/change_source')]:
        def negative(k=field,v=value):
            bridge,q,m=approval_fixture(codec)
            q[k]=v;m['acceptance'][k]=v
            return bridge.admit_source(SourceSpecimen(),q,m)
        suite.case('approval/request/'+field,negative,guard)
    for field,guard in [('original_change_authority_ref','A2/decision_ref'),
                        ('source_message_refs','A2/origin_message')]:
        def negative(k=field):
            bridge,q,m=approval_fixture(codec)
            if k=='source_message_refs':m['acceptance']['origin'][k]=['message:other']
            else:m['acceptance'][k]='decision:other'
            return bridge.admit_source(SourceSpecimen(),q,m)
        suite.case('approval/acceptance/'+field,negative,guard)
    for field in ('change_source','source_message_id','approval_id'):
        def negative(k=field):
            bridge,q,m=approval_fixture(codec)
            m['acceptance'][k]='other'
            return bridge.admit_source(SourceSpecimen(),q,m)
        suite.case('approval/acceptance/'+field,negative,'A2/acceptance/'+field)
    def direct(field=None):
        source=SourceSpecimen()
        source._update_state=dict(source=dict(acceptance=dict(change_source='user_direct',
            source_message_id=None,approval_id=None)))
        source._approval_owner_v2=None
        if field=='provider':source._approval_owner_v2=object()
        elif field:source._update_state['source']['acceptance'][field]='other'
        return check_acceptance_v2(source,live=True)
    suite.case('approval/direct_without_confirmation',direct)
    for field,guard in [('provider','A2/direct_no_provider'),('approval_id','A2/direct_no_approval'),
                        ('source_message_id','A2/direct_no_message')]:
        suite.case('approval/direct/'+field,lambda k=field:direct(k),guard)
    def unissued_bridge():
        bridge=object.__new__(ApprovalBridgeV2)
        return bridge.admit_source(SourceSpecimen(),{}, {})
    suite.case('approval/bridge_without_birth',unissued_bridge,'A2/bridge_birth')
    for participant,guard in [('chat','A2/chat_birth'),('human','A2/person_birth')]:
        def negative(k=participant):
            bridge,_,_=approval_fixture(codec)
            return ApprovalBridgeV2(object() if k=='chat' else bridge.chat,
                object() if k=='human' else bridge.human,bridge.request,codec,'approval:new',
                '2026-11-05T00:00:00Z',None)
        suite.case('approval/participant_birth/'+participant,negative,guard)
    def repeated_message(instruction):
        bridge,_,_=approval_fixture(codec)
        if instruction:return bridge.chat.user_instruction('message:user','thr_1',bridge.request['target'])
        return bridge.chat.agent_message('message:agent','thr_1','actor:agent','another')
    suite.case('approval/message_absent',lambda:repeated_message(False),'A2/message_absent')
    suite.case('approval/instruction_absent',lambda:repeated_message(True),'A2/instruction_absent')
    def dispatch_conflict():
        bridge,_,_=approval_fixture(codec)
        altered=copy.deepcopy(bridge.request);altered['return_route_ref']='route:different'
        return bridge.chat.accept_dispatch(altered)
    suite.case('approval/dispatch_conflict',dispatch_conflict,'A2/dispatch_conflict')
    def person_permission():
        human=PersonOwnerV2('person:actual');human.allowed=False
        return human.protected_decision('approval:actual','a'*64,'approved','2026-11-05T00:01:00Z')
    suite.case('approval/person_permission',person_permission,'A2/person_allowed')
    def approval_issuance():
        bridge,_,_=approval_fixture(codec)
        bridge.approval['created_at_utc']='2026-11-05T00:00:01Z'
        return bridge.resolve()
    suite.case('approval/approval_issuance',approval_issuance,'A2/approval_issuance')
    def decision_time():
        bridge,_,_=approval_fixture(codec)
        # A newly issued, genuine human source has a decision predating request creation.
        # A new bridge explicitly selects that owner at its own birth.
        human=PersonOwnerV2('person:actual')
        human.protected_decision('approval:actual',codec.h(bridge.request),'approved','2026-11-04T00:00:00Z')
        other=ApprovalBridgeV2(bridge.chat,human,bridge.request,codec,'approval:actual',
                             '2026-11-05T00:00:00Z','2026-11-06T00:00:00Z')
        other.now='2026-11-05T01:00:00Z'
        return other.resolve()
    suite.case('approval/decision_time',decision_time,'A2/decision_time')
    for when,guard in [('2026-11-04T23:59:59Z','A2/source_clock_before_decision'),
                        ('2026-11-06T00:00:00Z','A2/source_clock_expiry')]:
        def negative(clock=when):
            bridge,q,m=approval_fixture(codec)
            source=SourceSpecimen();bridge.admit_source(source,q,m)
            source._approval_owner_v2=bridge
            source._update_state=dict(clock=clock,source=dict(storage_instance_id=m['storage_instance_id'],
                acceptance=copy.deepcopy(m['acceptance'])),input=dict(request=copy.deepcopy(q)))
            return check_acceptance_v2(source,live=True)
        suite.case('approval/source_clock/'+when,negative,guard)


def qualify_banks(suite):
    methods=json.loads((DIRECTORY/'cancel-methods.v2.json').read_text())
    location_raw=(ROOT/methods['whole_resource_locations']).read_bytes()
    require('selection/locations_hash',digest(location_raw)==methods['whole_resource_locations_sha256'])
    locations=json.loads(location_raw)['whole_resource_locations']
    audits=[]
    for selection in methods['resource_selections']:
        raw=(ROOT/selection['path']).read_bytes()
        require('selection/bank_hash',digest(raw)==selection['sha256'])
        declaration=json.loads(raw)
        parent=declaration.get('predecessor')
        if parent:require('selection/predecessor_hash',digest((ROOT/parent['path']).read_bytes())==parent['sha256'])
        realm=selection['realm']
        d=declaration if realm is None else declaration['realms'][realm]
        bank=selected_bank(d,locations,selection,methods)
        requires_runtime=selection['requires_explicit_runtime_binding']
        if requires_runtime:require('selection/explicit_uri',URI in bank.documents)
        audits.append(dict(selection=selection,whole_resources=len(bank.documents),
            selected_runtime_sha256=bank.resource_origins[URI][0] if requires_runtime else None))
        suite.case('banks/'+selection['path']+'/whole',lambda b=bank,r=requires_runtime:require('selection/explicit_uri',not r or URI in b.documents))
        if isinstance(bank,ScopedBankV2):
            rules=json.loads((ROOT/methods['scoped_imports']['path']).read_text())['imports']
            for rule in rules:
                source_uris=[uri for uri,origin in bank.resource_origins.items()
                    if origin[0]==rule['source_document_sha256'] and
                    urljoin(uri,rule['literal_ref'])==rule['target_ref']]
                for alias,source_uri in enumerate(source_uris):
                    def validate_route(rule=rule,uri=source_uri):
                        expected=bank.retained.errors(rule['target_ref'],None)
                        observed=bank.errors(uri+'#'+rule['source_pointer'],None)
                        require('routing/validation_same_retained',[e.message for e in observed]==[e.message for e in expected])
                    suite.case('routing/validation/'+str(alias)+rule['source_pointer'],validate_route)
            for defect,guard in [('missing','roots/unresolved_reference'),('duplicate','routing/unique_locations'),
                    ('fragment','routing/fragment'),('hash','routing/target_whole_hash'),
                    ('uri','routing/original_uri'),('literal','routing/literal_reference'),
                    ('unused','routing/declared_locations')]:
                def negative_route(defect=defect,original=d):
                    altered=copy.deepcopy(rules)
                    if defect=='missing':altered.pop()
                    elif defect=='duplicate':altered.append(copy.deepcopy(altered[0]))
                    elif defect=='fragment':altered[0]['target_ref']=altered[0]['target_ref'].split('#')[0]+'#/$defs/worknode_dispatch_receipt'
                    elif defect=='hash':altered[0]['whole_target_sha256']='0'*64
                    elif defect=='uri':altered[0]['target_ref']='https://puppetmaster.local/schemas/plans_to_code_handoff.schema.json#'+altered[0]['target_ref'].split('#')[1]
                    elif defect=='literal':
                        altered[0]['literal_ref']='inputs/Plans/./plans_to_code_handoff.schema.json#/$defs/worknode_completion_receipt'
                    else:altered.append(dict(altered[0],source_pointer='/unused'))
                    return ScopedBankV2(original,locations,altered,bank.retained)
                suite.case('routing/'+defect,negative_route,guard)
        if not requires_runtime:continue
        for defect in ('missing_uri','wrong_hash'):
            def negative(error=defect,original=d):
                altered=copy.deepcopy(original)
                entries=altered.get('resources',altered.get('whole_documents'))
                if error=='missing_uri':
                    entries[:]=[row for row in entries if row['retrieval_uri']!=URI]
                else:
                    row=next(row for row in entries if row['retrieval_uri']==URI)
                    row['sha256' if 'sha256' in row else 'complete_document_sha256']='0'*64
                return selected_bank(altered,locations,selection,methods)
            guard='roots/unresolved_reference' if defect=='missing_uri' else 'roots/whole_resource_hash/Plans/shared_integration_runtime.schema.json'
            suite.case('banks/'+selection['path']+'/'+defect,negative,guard)
    for method in methods['methods']:
        require('selection/every_method',all(b in methods['resource_selections'] for b in method['selected_banks']))
    return audits


def qualify_source(suite):
    selection=json.loads((DIRECTORY/'approved-agent-source.v2.json').read_text())
    directory=Path(selection['candidate_path'])
    raw=(directory/'manifest.json').read_bytes()
    require('selection/source_manifest',digest(raw)==selection['manifest_sha256'])
    manifest=json.loads(raw)
    require('selection/source_edition',manifest['schema_id']=='pm.goal.update.original_composition.v2')
    require('selection/newly_authored',manifest['status']=='NEWLY_AUTHORED_TEST_ONLY_PREPARED_WITHOUT_ADMISSION')
    for row in manifest['files']:
        actual=(directory/row['path']).read_bytes()
        require('selection/source_member/'+row['path'],len(actual)==row['bytes'] and digest(actual)==row['sha256'])
    require('selection/approval_implementation', (directory/'approval_bridge_v2.py').read_bytes()==
            (ROOT/'scripts/pm_goal_own_c3_w12_approval.py').read_bytes())
    for row in selection['repository_support']:
        require('selection/repository_support/'+row['path'],digest((ROOT/row['path']).read_bytes())==row['sha256'])
    parent=manifest['predecessor']
    parent_raw=(Path(parent['path'])/'manifest.json').read_bytes()
    require('selection/source_predecessor',digest(parent_raw)==parent['manifest_sha256'])
    for row in json.loads(parent_raw)['files']:
        actual=(Path(parent['path'])/row['path']).read_bytes()
        require('selection/unchanged_predecessor/'+row['path'],len(actual)==row['bytes'] and digest(actual)==row['sha256'])
    suite.case('source/whole_successor_and_predecessor',lambda:require('selection/source_manifest',digest(raw)==selection['manifest_sha256']))
    return dict(manifest_sha256=selection['manifest_sha256'],members=len(manifest['files']),
                predecessor_members=len(json.loads(parent_raw)['files']))


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    suite=Suite()
    _,codec=load_originals()
    banks=qualify_banks(suite)
    source=qualify_source(suite)
    exercise_approval(suite,codec)
    result=dict(status='pass' if not suite.failures else 'fail',
        scope='successor_qualification_and_approval_components_only',
        whole_root_closure='NOT_CLAIMED',native_execution='NOT_RUN',banks=banks,source=source,
        cases=suite.rows,failures=suite.failures,
        new_guard_negatives={g:[row['id'] for row in suite.rows if row['expected_guard']==g] for g in sorted({row['expected_guard'] for row in suite.rows if row['expected_guard']})},
        guard_isolation='Inventory for the shared tool only; no local removal engine.')
    if args.output:args.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(dict(status=result['status'],cases=len(suite.rows),failures=suite.failures)))
    return 0 if not suite.failures else 1


if __name__=='__main__':
    raise SystemExit(main())
