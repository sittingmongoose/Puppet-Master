#!/usr/bin/env python3
"""DG-INT original activation phases on the single whole v7 store (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

B1's original is revision 1/activation_pending. Materialization, entrypoint
staging and prepare-start each publish one immutable revision and its complete
D01 lineage in the same transaction, before S2's Start publisher runs.
"""
from __future__ import annotations
import copy
import pm_goal_test_owner_adapters as A
import pm_goal_dg_s_world as SW
import pm_goal_dg_s_start as ST
import pm_goal_dg_int_v7 as V

QUALIFICATION='TEST_ONLY'
NATIVE_LINE=V.NATIVE_LINE
require=A.require
PHASES=(('activation_pending','records_materialized','activation_materialized','materialized','owner.workflow.activation.commit_materialized.v1','activation_receipt'),
        ('records_materialized','entrypoints_queued','activation_entrypoints','stage_entrypoints','owner.workflow.activation.stage_entrypoints.v1','staging'),
        ('entrypoints_queued','start_event_pending','activation_prepare_start','prepare_start','owner.workflow.activation.prepare_start.v1','activation_receipt'))


def publish(world,phase):
    sw,st=world.sw,world.storage
    e,ctx=sw.edition,sw.ctx
    before_state,after_state,rule,cause,method,source_name=phase
    native=sw.owners['native'].current()
    before,bc=native['body'],native['control']
    require('int/activation/state',before['record']['activation_state']['state']==before_state)
    owner,handle=sw.handles[source_name]
    source=A.acquire(sw.registry,owner,sw.registry.roster()[owner],handle)[1]
    source_family={'activation_receipt':'workflow_activation_receipt','staging':'workflow_entrypoint_staging'}[source_name]
    require('int/activation/source',SW.read_value(st,source_family,source['physical_key'])['value']==source)
    after=copy.deepcopy(before)
    revision=before['record']['revision']+1
    after['physical_key']=sw.owners['native'].body_key(revision)
    after['record']['revision']=revision
    after['record']['activation_state'].update(state=after_state,revision=before['record']['activation_state']['revision']+1)
    if after_state=='records_materialized':
        for field,family,name in [('required_set','workflow_required_set','required_set'),('installed_workgraph','workflow_installed_graph','installed_graph')]:
            oid,h=sw.handles[name]
            value=A.acquire(sw.registry,oid,sw.registry.roster()[oid],h)[1]
            after['record'][field]=world.binding(family,value,world.source_origins[(family,value['physical_key'])])
    control=sw.owners['native'].control_wrapper(after)
    families=ST.d01_families(e)
    pointer=st.cell(families['pointer'],sw.owners['d01'].pointer_key())
    head_selection=pointer['value']['record']['workflow_head']
    head=SW.resolve_selector(st,head_selection,'int/activation/head')
    head_revision=head['record']['revision']+1
    op=sw.ctx.run_key('TEST_ONLY:activation-operation',rule)
    issued_at=ctx.now()
    out={}
    def build(tx):
        current=sw.owners['native'].current()
        require('int/activation/final_native',current==native)
        require('int/activation/final_source',A.acquire(sw.registry,owner,sw.registry.roster()[owner],handle)[1]==source)
        bridge=world.goal_bridge
        require('int/activation/final_stop',bridge.world.host_stop.record(bridge.route.scope)['latched'] is False)
        require('int/activation/final_goal',bridge.world.goal.body_cell(bridge.route.scope)['value']['record']['state']=='active')
        require('int/activation/final_binding',bridge.world.binding.read_current(bridge.route.scope)['revision']['value']['record']['active_run_ref']==ctx.goal_run_id)
        sel=lambda family,key,value:V.physical(world,family,key,value)
        origin=copy.deepcopy(bridge.joint_result['native_origins']['workflow_birth_body'])
        origin['physical_key']=ctx.run_key('workflow_native_activation_origin',op)
        origin['record'].update(issuer_method=method,original_operation_id=op,original_causation_ref=source['physical_key'],
            issued_at_utc=issued_at,issued_value_key=after['physical_key'],issued_record_sha256=SW.cdigest(after['record']),
            source_bindings=[world.binding(source_family,source,world.source_origin(sw.registry.owner(owner,sw.registry.roster()[owner]),source_family,source))])
        # All source-origin issuance occurs before the final native/D01 transaction.
        # source_origin is cached before entering this builder below.
        rsel=sel(V.BODY,after['physical_key'],after)
        osel=sel('workflow_native_activation_origin',origin['physical_key'],origin)
        bsel,csel=sel(V.BODY,before['physical_key'],before),sel(V.CONTROL,bc['physical_key'],bc)
        asel,acsel=rsel,sel(V.CONTROL,control['physical_key'],control)
        ukey=ctx.run_key('executor_workflow_workflow_update',op)
        hkey=sw.owners['d01'].head_key(head_revision)
        okey=ctx.run_key('executor_workflow_lineage_origin',op)
        update=V.wrapper('pm.storage_value.executor_workflow_workflow_update.v8','8.0.0',dict(scope=dict(ctx.scope),operation_id=op,
            transaction_id=tx,revision=head_revision,previous_head=head_selection,before_body=bsel,before_control=csel,
            after_body=asel,after_control=acsel,cause=cause,original_owner_result=rsel,original_owner_origin=osel,
            transition=dict(rule=rule,before=sw.start.body_commitment(before,bc),after=sw.start.body_commitment(after,control),
                            original_writer_method=method,original_owner_result=rsel,original_owner_origin=osel)))
        nh=V.wrapper('pm.storage_value.executor_workflow_workflow_head.v8','8.0.0',dict(scope=dict(ctx.scope),revision=head_revision,
            activation_body=head['record']['activation_body'],activation_origin=head['record']['activation_origin'],
            current_body=asel,current_control=acsel,previous_head=head_selection,last_update=sel(families['workflow_update'],ukey,update),
            workflow_owner_ref=ctx.workflow_owner['owner_ref'],workflow_owner_epoch=ctx.workflow_owner['owner_epoch'],pending_operation_id=None))
        np=V.wrapper('pm.storage_value.executor_workflow_current_pointer.v2','2.0.0',dict(scope=dict(ctx.scope),revision=pointer['value']['record']['revision']+1,
            workflow_head=sel(families['workflow_head'],hkey,nh),inventory_head=None,scheduler_control=None,last_origin_operation_id=op,pending_operation_id=None))
        mutation=V.wrapper('pm.storage_value.executor_workflow_lineage_origin.v8','8.0.0',dict(scope=dict(ctx.scope),
            method='owner.executor.workflow_source.update_workflow.v3',operation_id=op,transaction_id=tx,owner=copy.deepcopy(ctx.workflow_owner),
            causation=osel,preimages=[bsel,csel,head_selection,sel(families['pointer'],sw.owners['d01'].pointer_key(),pointer['value'])],
            afterimages=dict(workflow_update=sel(families['workflow_update'],ukey,update),workflow_head=sel(families['workflow_head'],hkey,nh),
                             pointer=sel(families['pointer'],sw.owners['d01'].pointer_key(),np)),issued_at_utc=issued_at))
        for root,value in [('GoalRunBodyPhysical',after),('GoalRunControlPhysical',control),('OwnerIssueOriginPhysical',origin)]:
            e.bank.validate(e.activation+'#/$defs/'+root,value,'int/activation/'+root)
        for root,value in [('StorageWorkflowUpdate',update),('StorageWorkflowHead',nh),('StorageWorkflowMutationOrigin',mutation),('StorageCurrentPointer',np)]:
            e.bank.validate(e.d01+'#/$defs/'+root,value,'int/activation/'+root)
        values=[(V.BODY,after['physical_key'],after),(V.CONTROL,control['physical_key'],control),
                ('workflow_native_activation_origin',origin['physical_key'],origin),(families['workflow_update'],ukey,update),
                (families['workflow_head'],hkey,nh),('executor_workflow_lineage_origin',okey,mutation)]
        writes=[dict(table=t,key=k,expected=None,value=value) for t,k,value in values]
        writes += [dict(table=families['pointer'],key=sw.owners['d01'].pointer_key(),expected=pointer['version'],value=np),
                   dict(table=V.CURRENT,key=sw.owners['native'].current_key(),expected=native['pointer']['version'],
                        value=dict(qualification=QUALIFICATION,body_key=after['physical_key'],control_key=control['physical_key'],revision=revision))]
        out.update(rule=rule,transaction_id=tx,origin=origin,update=update,head=nh,pointer=np)
        return writes
    world.source_origin(sw.registry.owner(owner,sw.registry.roster()[owner]),source_family,source)
    st.transact_stamped(build,writer=dict(owner_id=sw.owners['native'].owner_id,owner_epoch=sw.owners['native'].owner_epoch,operation_id=op))
    return out


def bootstrap(world):
    records=[publish(world,phase) for phase in PHASES]
    world.sw.prestart_revision=world.sw.owners['native'].current()['body']['record']['revision']
    world.activation_publications=records
    return records
