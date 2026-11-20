#!/usr/bin/env python3
"""DG-INT B1 complete, isolated-realm native/Goal operands (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

All candidate selectors are prospective until the one joint birth transaction.
Every input comes from an issuing owner's actual original or protected current
read. No fresh-birth call accepts an absent method operand.
"""
from __future__ import annotations
import copy
import pm_goal_test_owner_adapters as A
import pm_goal_dg_cf1_world as F
import pm_goal_dg_cf2_world as W
import pm_goal_dg_int_coordinator as C
import pm_goal_dg_int_goal as G

QUALIFICATION='TEST_ONLY'
NATIVE_LINE=F.NATIVE_LINE
require=A.require


def arguments(world,native_body,native_control,native_birth,compact_birth,compact_control):
    bridge=world.goal_bridge
    sw,ca,route=world.sw,bridge.world,bridge.route
    result=bridge.joint_result
    origins=result['native_origins']
    select=lambda family,key,value:dict(family_id=family,physical_key=key,schema_id=value['schema_id'],
          schema_version=value['schema_version'],codec_id=G.O.MSGPACK,complete_value_sha256=G.O.row_sha(value))
    before=route.current_goal()
    before={key:before[key] for key in ('body','control','accepted_objective','accepted_origin','stop','binding_revision',
                                       'binding_origin','binding_control','writer_domain','writer_domain_head')}
    keys=result['goal_keys']
    roles=dict(launch_goal_before=select(ca.goal.BODY,result['old_key'],before['body']),
        goal_after=select(ca.goal.BODY,keys['body'],result['body']),
        goal_control_after=select(ca.goal.CONTROL,keys['control'],result['control']),
        goal_metadata_receipt=select('goal_body_mutation_receipt',result['receipt_key'],result['receipt']),
        workflow_birth_body=select('workflow_goal_run_body',native_body['physical_key'],native_body),
        workflow_birth_control=select('workflow_goal_run_control',native_control['physical_key'],native_control),
        workflow_birth_body_origin=select('workflow_original_source_origin',origins['workflow_birth_body']['physical_key'],origins['workflow_birth_body']),
        workflow_birth_control_origin=select('workflow_original_source_origin',origins['workflow_birth_control']['physical_key'],origins['workflow_birth_control']),
        reserved_start_outbox=select('workflow_start_outbox_intent',result['canonical_outbox']['physical_key'],result['canonical_outbox']),
        reserved_start_outbox_origin=select('workflow_original_source_origin',origins['reserved_start_outbox']['physical_key'],origins['reserved_start_outbox']))
    for role,name in [('original_native_compile_source','native_compile'),('original_activation_decision','activation_decision'),
                      ('original_certified_graph','certified_graph')]:
        value=world.launch_source_values[name]['source']
        family=value['schema_id'].removeprefix('pm.storage_value.').rsplit('.v',1)[0]
        roles[role]=select(family,value['physical_key'],value)
    history=ca.goal.keys(route.scope,before['control']['record']['latest_objective_revision'])
    for role,name,family in [('original_goal_objective_revision','revision',ca.goal.REVISION),
                             ('original_goal_objective_origin','origin',ca.goal.ORIGIN)]:
        roles[role]=select(family,history[name],ca.value(family,history[name]))
    binding=dict(original_goal_metadata=dict(before=before,actual_original_metadata_intent=result['intent'],
            expected_workflow_run_ref=sw.ctx.goal_run_id,prepared_output=dict(after_body=result['body'],after_control=result['control'],
                                                                         body_mutation_receipt=result['receipt'])),
        prepared_binding=copy.deepcopy(result['prepared_binding']),original_member_roles=roles)
    launch={}
    for name in ('native_compile','activation_decision','certified_graph'):
        owner,handle=sw.handles['activation:'+name]
        launch[name]=A.acquire(sw.registry,owner,sw.registry.roster()[owner],handle)[1]
        require('int/birth/launch_original/'+name,launch[name]==world.launch_source_values[name])
    whole=dict(d01_original_source=dict(scope=dict(sw.ctx.scope),activation_decision=launch['activation_decision']['source']['record'],
        activation_decision_origin=launch['activation_decision']['origin']['record'],
        launch_identity=launch['native_compile']['source']['record']['launch_identity_reservation'],
        candidate=dict(body=native_body,control=native_control)),
        original_workflow_birth=dict(original_launch_sources=launch,prepared_birth=dict(body=native_body,
            body_origin=origins['workflow_birth_body'],control=native_control,control_origin=origins['workflow_birth_control'],
            start_outbox=result['canonical_outbox'],start_outbox_origin=origins['reserved_start_outbox'])))
    request=dict(scope=world.coord_scope(world.scope),owner=copy.deepcopy(compact_birth['record']['owner']),
                 installed_profile_sha256=world.profile_sha)
    return dict(request=request,whole_original_birth_argument=whole,whole_birth_goal=binding,
                whole_original_goal_binding=copy.deepcopy(binding),
                candidates=dict(birth=compact_birth['record'],control=compact_control['record']))


def validate(world,operands):
    C.dispatch(world,'birth',operands)
    sw,bridge=world.sw,world.goal_bridge
    for name in ('native_compile','activation_decision','certified_graph'):
        owner,handle=sw.handles['activation:'+name]
        fresh=A.acquire(sw.registry,owner,sw.registry.roster()[owner],handle)[1]
        require('int/birth/final_launch/'+name,fresh==operands['whole_original_birth_argument']['original_workflow_birth']['original_launch_sources'][name])
    initial=operands['whole_original_birth_argument']['d01_original_source']
    require('int/birth/launch_join',initial['launch_identity']==world.launch_reservation and
            initial['candidate']['body']['record']['original_goal_body']==initial['launch_identity']['original_goal_body'])
    require('int/birth/decision_identity',initial['activation_decision']['identity']==sw.ctx.identity())
    graph=world.launch_source_values['certified_graph']['source']['record']
    require('int/birth/graph_identity',graph['workgraph_id']==sw.ctx.workgraph_id and graph['plan_compile_run_id']==sw.ctx.plan_compile_run_id)
    require('int/birth/final_original_body',sw.storage.cell('workflow_goal_run_current',sw.owners['native'].current_key()) is None)
    ca=bridge.world
    before=operands['whole_birth_goal']['original_goal_metadata']['before']
    actual=bridge.route.current_goal()
    require('int/birth/final_goal',all(actual[key]==value for key,value in before.items()))
    pending=bridge.joint_before['pending']
    require('int/birth/final_goal_preimages',G.O.row_sha(ca.goal.body_cell(bridge.route.scope)['value'])==pending['expected_goal_body_sha256']
        and G.O.row_sha(ca.goal.control(bridge.route.scope)['value'])==pending['expected_goal_control_sha256']
        and G.O.row_sha(ca.host_stop.current(bridge.route.scope)['value'])==pending['expected_stop_control_sha256'])
    require('int/birth/final_binding_pending',ca.binding.read_current(bridge.route.scope)['control']['value']['record']['pending']==pending)
    for name,(owner,authority) in world.launch_source_authorities.items():
        require('int/birth/final_permission/'+name,ca.permissions.allowed(authority,owner,'workflow.activation.issue:'+name))
    require('int/birth/final_binding_permission',ca.permissions.allowed(bridge.binding_authority,ca.native.run.owner_id,'goal.execution_binding.workflow_attach'))
    require('int/birth/final_metadata_permission',ca.permissions.allowed(bridge.body_authority,ca.goal.owner_id,'goal.body.associate_workflow'))
    profile=A.acquire(world.registry,world.profile.owner_id,'profile',world.profile_handle)[1]
    require('int/birth/final_profile',profile['profile_sha256']==world.profile_sha)
    require('int/birth/final_execution_owner',ca.native.run.owner_epoch==sw.ctx.workflow_owner['owner_epoch'])
    require('int/birth/final_stop',ca.host_stop.record(bridge.route.scope)['latched'] is False)
    return True
