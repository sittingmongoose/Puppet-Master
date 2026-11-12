#!/usr/bin/env python3
"""DG-INT shared genuine DG-CA3 Goal owners and native-v7 realm bridge (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

The Goal, binding, host Stop, SIR and C3 owners use the very same Storage as
S2. Original CA3 banks remain selected unchanged. The two native-v7 aggregate
operands use the explicit additive DG-INT companion selection; v7 values never
enter CA3's old native aggregate bank.
"""
from __future__ import annotations
import ast
import base64
import copy
import json
from pathlib import Path
from urllib.parse import urljoin

import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as GS
import pm_goal_dg_s_start as ST
import pm_goal_dg_s_world as SW
import pm_goal_dg_ca_owners as O
import pm_goal_dg_ca_c1 as C1
import pm_goal_dg_ca_assignment as AS
import pm_goal_dg_ca3_route as C3
import pm_goal_dg_ca3_native as CN
import pm_goal_dg_r_world as RW

QUALIFICATION='TEST_ONLY'
NATIVE_LINE=RW.NATIVE_LINE
require=A.require
N=CN
same=A.same


class SharedWorld(O.World):
    def __init__(self,sw):
        self.shared=O.Shared.get()
        self.roots,self.codec=self.shared.roots,self.shared.codec
        self.storage=sw.storage
        self.registry,self.recorder=sw.registry,sw.recorder
        self.storage_id=self.storage.storage_instance_id
        self.appender=A.AppendOwner(self.registry,self.storage)
        for name,cls in [('permissions',O.PermissionOwner),('registration',O.RegistrationOwner),
                         ('host_stop',O.HostStopOwner),('goal',O.GoalOwner),('binding',O.BindingOwner),('sir',O.SIROwner)]:
            setattr(self,name,cls(self))
        for name,role in [('plan_inventory','plan_association'),('workflow_inventory','workflow_association'),
                          ('scheduler_inventory','scheduler_association')]:setattr(self,name,O.AssociationOwner(self,role))
        self.seglog=Seglog(self)
        self.codecs=AS.CodecOwner(self)
        self.assigner=AS.AssignmentOwner(self)
        self.codecs.register()
        CN.NativeWorld(self)
        self.index=Index(self)


class Seglog(AS.SeglogControlOwner):
    def records(self):
        images=self.storage.canonical_images()
        current=S.decode_canonical(images['current_raw'])
        manifest=S.decode_canonical(images['manifest_raw'])
        lease=S.decode_canonical(images['sequence_lease_raw'])
        for root,value in [('current',current),('manifest',manifest),('sequence_lease_control',lease)]:
            self.check('producer',AS.NATIVE+root,value)
        return dict(current=current,manifest=manifest,sequence_allocator=lease,
            current_selection=self.selection('storage/seglog','storage/seglog/CURRENT',current,AS.NATIVE+'current'),
            manifest_selection=self.selection('storage/seglog','storage/seglog/manifest.v1.msgpack',manifest,AS.NATIVE+'manifest'),
            sequence_selection=self.selection('seglog_sequence_allocator',self.storage.lease_key(),lease,AS.NATIVE+'sequence_lease_control'))

    def physical_id(self,segment):
        manifest=S.decode_canonical(self.storage.canonical_images()['manifest_raw'])
        entries=manifest['selection_entries'][0]['retained_inventory']
        return next(x['physical_segment_id'] for x in entries if x['segment_generation']==segment['generation'])

    def native_name(self,segment):
        manifest=S.decode_canonical(self.storage.canonical_images()['manifest_raw'])
        return next(x['segment_name'] for x in manifest['selection_entries'][0]['retained_inventory']
                    if x['segment_generation']==segment['generation'])


class Index(O.WorldOwner):
    """CA3's index interface over batch 2's actual Storage-issued SP-278 records."""
    role='event_record_index'
    def publish(self):return self.current()[0]
    def read(self):return GS.EventRecordIndexSource(self.storage).read()
    def current(self):
        read=self.read()
        return read.checkpoint,read.generation,read.generation['frontier']
    def read_token(self):return self.read().read_token
    def row(self,event_id):
        read=self.read()
        event=self.storage.read_event(event_id)
        return GS.EventRecordIndexSource(self.storage).lookup(read,scope_partition=S.scope_partition(event),
            sequence_id=event['sequence_id'],event_id=event_id)['index_row']
    def source_frame(self,event_id):
        read=self.read()
        whole=GS.EventRecordIndexSource(self.storage).native_current_event_source(
            'TEST_ONLY:c3-index-read:'+read.read_token['redb_snapshot_id'],read=read)
        return next(x for x in whole['frames'] if x['event']['event_id']==event_id)


class Writers(CN.WriterGraphOwner):
    def enroll(self,scope):
        super().enroll(scope)
        # The predecessor used the batch inventory Origin's key with each
        # individual registration operation id. Issue the individual original
        # Origins before allocating any run, and select those exact operations.
        self.registration_origins={}
        inventory=self.world.value('TEST_ONLY:native_writer_inventory',self.inventory_key)
        for row in inventory['writers']:
            kind=row['component_kind'];reg=self.registrations[kind]
            op=reg['native_original_registration_operation_id']
            key,_=self.origin(scope,op,'writer_registration',
                [N.d05_sel(self.world,'TEST_ONLY:native_writer_registration',row['key'])])
            locator=N.origin_locator(self.world,'executor_safestop_origin',key,op)
            self.registration_origins[kind]=locator
            reg['original_registration_origin']=locator

    def inventory(self):
        out=super().inventory()
        for kind,reg in out.items():
            reg['original_registration_origin']=copy.deepcopy(self.registration_origins[kind])
            self.world.roots.check('native',N.SS+'WriterRegistration',reg)
        return out


class Run(CN.RunOwner):
    def allocate(self,rs,goal_scope,execution_owner_ref,execution_owner_epoch):
        """Allocate the original four SafeStop records with resolvable origins.

        Each record and its original Origin are one stamped transaction. The
        record uses an operation locator, so the Origin can commit its complete
        issued-record selector without a recursive digest.
        """
        w,n=self.world,self.world.native
        require('run/writers_unenrolled',n.writers.enrolled)
        compile_run=O.short_id('compile')
        principal=n.writers.principal(self)
        alloc_op=O.uid('TEST_ONLY:allocation-op')
        identity=dict(storage_instance_id=w.storage_id,project_id=rs['project_id'],goal_id=rs['goal_id'],
            plan_compile_run_id=compile_run,native_allocation_operation_id=alloc_op,
            native_idempotency_key=O.uid('TEST_ONLY:allocation-key'),native_allocator=principal)

        def publish(table,name,seed,operation,kind):
            key=table+':'+O.uid('TEST_ONLY:key')
            okey='executor_safestop_origin:'+O.uid('TEST_ONLY:key')
            locator=dict(storage_instance_id=w.storage_id,family_id='executor_safestop_origin',
                schema_id='pm.storage_value.executor_safestop_origin.v2',schema_version='2.0.0',
                physical_key=okey,operation_id=operation,codec='messagepack_canonical')
            record=self.make(N.SS+name,dict(seed,origin=locator))
            whole=self.make(N.SS+name+'Physical',dict(storage_instance_id=w.storage_id,physical_key=key,value=record))
            selection=dict(storage_instance_id=w.storage_id,family_id=table,schema_id=whole['schema_id'],
                schema_version=whole['schema_version'],physical_key=key,physical_sha256=O.row_sha(whole),codec='messagepack_canonical')
            boundary=n.writers.boundary(self,operation)
            issued=self.clock.now()
            result={}
            def build(tx):
                origin=self.make(N.SS+'Origin',dict(scope=rs,operation_id=operation,transaction_id=tx,
                    sequence=1,previous_origin=None,native_boundary=boundary,write_kind=kind,
                    issued_records=[selection],issued_at_utc=issued))
                ow=self.make(N.SS+'OriginPhysical',dict(storage_instance_id=w.storage_id,physical_key=okey,value=origin))
                result['origin']=ow
                return [w.put(table,key,whole),w.put('executor_safestop_origin',okey,ow)]
            w.storage.transact_stamped(build,writer=dict(owner_id=self.owner_id,owner_epoch=self.owner_epoch))
            for family,k,value in ((table,key,whole),('executor_safestop_origin',okey,result['origin'])):
                self._issue(None,value,kind=family,ref=family+'|'+k)
            return key,record,selection,okey,result['origin']

        with self.recorder.call(self.owner_id,'allocate_run') as slot:
            akey,alloc,asel,okey,origin=publish('executor_safestop_reservation_allocation','ReservationAllocation',
                dict(scope=rs,identity=identity,native_boundary=n.writers.boundary(self,alloc_op),
                    original_goal_control_source=N.src_sel(w,w.goal.CONTROL,w.goal.keys(goal_scope)['control']),
                    original_stop_source=N.src_sel(w,w.host_stop.FAMILY,w.host_stop.key(goal_scope)),allocated_at_utc=self.clock.now()),
                alloc_op,'reservation_allocation')
            bop=O.uid('TEST_ONLY:domain-birth-op');writers=n.writers.inventory()
            bkey,birth,_,_,_=publish('executor_safestop_domain_birth','DomainBirth',dict(scope=rs,operation_id=bop,
                native_boundary=n.writers.boundary(self,bop),registered_writers=[writers[k] for k in N.WriterGraphOwner.DOMAIN],
                reservation_allocation=asel,native_allocation_identity=identity,born_at_utc=self.clock.now()),bop,'domain_enrollment')
            cop=O.uid('TEST_ONLY:compile-join-op')
            ckey,cjoin,csel,cokey,corigin=publish('executor_safestop_compile_reservation_join','CompileReservationJoin',
                dict(scope=rs,allocation=asel,operation_id=cop),cop,'compile_reservation_join')
            wop=O.uid('TEST_ONLY:workflow-join-op')
            wkey,wjoin,_,wokey,worigin=publish('executor_safestop_workflow_reservation_join','WorkflowReservationJoin',
                dict(scope=rs,allocation=asel,compile_join=csel,operation_id=wop),wop,'workflow_reservation_join')
            lineage=self.make(N.SS+'ReservationLineage',dict(allocation=dict(allocation=alloc,allocation_source=asel,
                allocation_origin=origin['value'],allocation_origin_source=N.d05_sel(w,'executor_safestop_origin',okey),
                native_current_allocator=principal,native_original_allocation_operation_ref=alloc_op,
                current_boundary=n.writers.boundary(self,alloc_op)),compile_join=cjoin,compile_join_source=csel,
                compile_join_origin=corigin['value'],compile_join_origin_source=N.d05_sel(w,'executor_safestop_origin',cokey),
                workflow_join=wjoin,workflow_join_source=N.d05_sel(w,'executor_safestop_workflow_reservation_join',wkey),
                workflow_join_origin=worigin['value'],workflow_join_origin_source=N.d05_sel(w,'executor_safestop_origin',wokey)))
            pkey='permission_snapshot_record:'+O.uid('TEST_ONLY:permission-snapshot')
            permission=self.make('https://puppetmaster.local/schemas/storage_value/permission_snapshot_record/1.0.0/permission_snapshot_record.schema.json',
                dict(project_id=rs['project_id'],run_id=rs['goal_run_id'],snapshot_id=O.uid('TEST_ONLY:permission-snapshot-id'),
                    captured_at_utc=self.clock.now(),resolved_permissions={'workflow.cancel':None}))
            self.store('permission_snapshot_record',pkey,permission)
            run=dict(run_scope=rs,compile_run=compile_run,permission_key=pkey,execution_owner_ref=execution_owner_ref,
                execution_owner_epoch=execution_owner_epoch,allocation_key=akey,birth_key=bkey,lineage=lineage,
                revision=0,workgraph_id=O.short_id('workgraph'))
            self.runs[rs['goal_run_id']]=run
            slot.set(dict(run=rs['goal_run_id']))
            return run

    def current(self,run):
        sw=self.world.bridge.sw
        native=sw.owners['native'].current()
        require('int/c3/run_scope',run['run_scope']==sw.ctx.scope)
        return native['pointer']['value'],native['body'],native['control']

    def identity(self,run):return self.world.bridge.sw.ctx.identity()


class Start(CN.StartOwner):
    def current_start(self,run):
        rw=self.world.bridge.cancel_world
        require('int/c3/start_reader',rw is not None)
        return rw.current_start_full()


class Disposition(CN.D06Owner):
    def readback(self,run,goal_scope):
        rw=self.world.bridge.cancel_world
        require('int/c3/disposition_reader',rw is not None and getattr(rw,'cancellation',None) is not None)
        return rw.current_readback()

    def retained(self,run):
        rw=self.world.bridge.cancel_world
        c=rw.cancellation
        out=dict(original_disposition=dict(result=c['result'].wrapper['record'],origin=c['publish_origin'].wrapper['record'],
                                          action_authority='none'),
                 original_result_storage=c['result'].wrapper,original_origin_storage=c['publish_origin'].wrapper)
        self.world.roots.check('native',CN.NA+'RetainedWorkflowEntry',out)
        return out


class Route(C3.WorkflowCancel):
    def ncheck(self,ref,value):
        # These aggregate roots depend on the edition of the whole Start/cancel
        # graph. Every child is checked in its own selected complete resource realm.
        bridge=self.world.bridge
        if bridge.sw.edition.name=='native_v7' and ref in (CN.NA+'BeforeStopNativeEntry',CN.NA+'OriginalOwnersNativeEntry'):
            bridge.check_companion(ref,value)
            return O.exact_numbers(value,'int/c3/native_v7')
        return super().ncheck(ref,value)

    def observe_sources(self):
        out=super().observe_sources()
        sw=self.world.bridge.sw
        if 'native' in sw.owners and getattr(self,'wf_run',None) is not None:
            out['run']=A.observation_digest([sw.storage.cell('workflow_goal_run_current',sw.owners['native'].current_key()),
                                            self.world.native.run.owner_epoch])
        return out

    def start_scope(self,value):
        if value['kind']=='original_started':return value['value']['commit']['record']['scope']
        require('int/c3/start_variant',value['kind']=='prestart')
        return value['value']['d01_current']['scope']

    def before_stop_native(self, method):
        """BeforeStopNativeEntry: registrations checked against the exhaustive inventory and the domain birth."""
        w, n = self.world, self.world.native
        inventory = n.writers.inventory()
        for kind in ('goal_stop', 'executor_cancel'):
            require('C3/%s/native_writer_inventory' % method, kind in inventory)
        src = self.native_sources()
        birth = src['original_domain_birth']
        for name, kind in (('registered_goal_terminal_writer', 'goal_stop'), ('registered_workflow_terminal_writer', 'executor_cancel')):
            reg = src[name]
            require('C3/%s/native_writer_inventory' % method, kind in inventory and same(inventory[kind], reg))
            require('C3/%s/native_writer_domain' % method, any(same(r, reg) for r in birth['registered_writers']))
            require('C3/%s/native_writer_principal' % method, reg['principal']['native_root_ref'] == n.writers.native_root
                    and reg['principal']['native_host_boot_ref'] == w.storage.boot_session)
        require('C3/%s/native_domain_allocation' % method, birth['reservation_allocation'] == src['reservation_lineage']['allocation']['allocation_source'])
        require('C3/%s/native_run_scope' % method, birth['scope'] == self.wf_run['run_scope']
                and self.start_scope(src['current_start']) == self.wf_run['run_scope'])
        N.verify_custody(w, birth, 'C3/%s/native_custody' % method)
        boundary = n.writers.boundary(w.goal, self.operation_id or 'pre-source')
        entry = self.ncheck(N.NA + 'BeforeStopNativeEntry', dict(src, actual_original_goal_boundary=boundary))
        return entry

    def owners_native(self, method):
        """OriginalOwnersNativeEntry acquired from the native owners now, every selector resolved, every join checked."""
        w, n = self.world, self.world.native
        disposition = n.d06.readback(self.wf_run, self.scope)
        entry = self.ncheck(N.NA + 'OriginalOwnersNativeEntry', dict(complete_current_workflow_disposition=disposition,
                                                                      goal_control_plane=self.control_plane(method)))
        w.bridge.verify_custody(disposition, 'C3/%s/native_custody' % method)
        d06 = disposition['d06_readback']
        rs = self.wf_run['run_scope']
        read = w.binding.read_current(self.scope)
        assoc = self.workflow_association(read)
        result, intent, control, origin = d06['result'], d06['intent'], d06['control'], d06['origin']
        require('C3/%s/d06_scope' % method, result['scope'] == intent['scope'] == control['scope'] == origin['scope'] == rs)
        require('C3/%s/d06_owner' % method, result['workflow_owner_ref'] == intent['workflow_owner_ref'] == assoc['execution_owner_ref']
                and result['workflow_owner_epoch'] == intent['workflow_owner_epoch'] == assoc['execution_owner_epoch'])
        require('C3/%s/d06_operation' % method, result['operation_id'] == intent['operation_id'] == control['operation_id'] == origin['operation_id']
                and result['operation_id'] != self.operation_id)
        require('C3/%s/d06_control_result' % method, control['phase'] == 'committed' and control['result'] is not None)
        rcell = w.cell(control['result']['family_id'], control['result']['physical_key'])
        require('C3/%s/d06_result_custody' % method, rcell is not None and same(rcell['value']['record'], result))
        require('C3/%s/d06_origin_publish' % method, origin['issuer_method'] == 'owner.workflow.executor_cancel.publish_disposition.v3'
                and origin['afterimages']['result'] == control['result'])
        stop_receipt_key = self.key('goal_cancel_stop_receipt')
        require('C3/%s/d06_goal_stop' % method, intent['goal_stop'] == N.src_sel(w, 'goal_cancel_stop_receipt', stop_receipt_key))
        safe = d06['safe_stop']['whole_original_safe_stop']
        require('C3/%s/d05_resolved' % method, safe['status'] == 'bounded_original_safe_stop_resolved'
                and safe['original_result']['disposition'] == 'bounded_original_safe_stop_resolved')
        gss = safe['source_readback']['goal_stop']
        require('C3/%s/d05_goal_stop' % method, gss['original_stop_receipt'] == self.progress['stop_receipt']
                and gss['original_stop_intent'] == self.progress['stop_intent'])
        require('C3/%s/d05_scope' % method, safe['scope'] == rs and safe['original_result']['scope'] == rs)
        require('C3/%s/d06_d05_join' % method, intent['safe_stop_source']['physical_key'] == safe['result_source']['physical_key']
                and intent['safe_stop_source']['physical_value_sha256'] == safe['result_source']['physical_sha256'])
        pointer, body, ctl = n.run.current(self.wf_run)
        native_body = d06['native_after' if d06['kind'] == 'cancelled_from_nonterminal' else 'native_unchanged']
        require('C3/%s/d06_current_body' % method, same(native_body['body'], body) and same(native_body['control'], ctl))
        if d06['kind'] == 'cancelled_from_nonterminal':
            require('C3/%s/d06_cancelled_body' % method, body['record']['status'] == 'cancelled')
            ev = d06['original_event']
            eid = ev['event']['event_id']
            require('C3/%s/d06_event' % method, same(ev['event'], w.storage.read_event(eid)) and ev['event']['event_type'] == 'goal_run.cancelled'
                    and ev['event']['payload']['payload']['goal_run_id'] == rs['goal_run_id'])
            require('C3/%s/d06_first_custody' % method, same(ev['custody'], w.storage.first_custody(eid))
                    and same(ev['append'], w.storage.full_value_result(eid)) and same(result['append_receipt'], ev['custody']['first_append_receipt']))
            settlements = safe['original_result']['settlements']
            require('C3/%s/d06_mutation' % method, ev['event']['payload']['payload']['mutation_started'] is bool(settlements))
        else:
            require('C3/%s/d06_preserved' % method, result['preserved_status'] == body['record']['status'] and body['record']['status'] in N.TERMINAL)
        require('C3/%s/current_start' % method, self.start_scope(disposition['current_start'])==rs)
        return entry

    def native_selections(self,entry):
        rw=self.world.bridge.cancel_world
        select=lambda value:self.stored_selection(value.family,value.key)
        c,s=rw.cancellation,rw.safe_stop
        return dict(d06_result=select(c['result']),d06_origin=select(c['publish_origin']),
                    d05_result=select(s['aggregate_result']),d05_origin=select(s['aggregate_origin']),
                    kind='cancelled_from_nonterminal',d06_operation_id=c['result'].wrapper['record']['operation_id'],preserved=None)


class Goal(ST.GoalOwner):
    def issue_goal_argument(self,root_name='OriginalGoalArgument',edit=None,**kw):
        bridge=self.bridge
        bridge.bind_workflow()
        value=bridge.goal_argument(root_name)
        if edit:value=edit(value)
        handle=self.issue(self.edition.goal_arg+'#/$defs/'+root_name,value,kind=root_name)
        self.cells=getattr(self,'cells',{})
        self.cells[self._handles[handle]]=bridge.goal_cells()
        return handle

    def current_argument(self):return self.bridge.goal_argument('CurrentGoalArgument')

    def latch_stop(self):self.bridge.world.host_stop.manual(self.bridge.route.scope,'stop')


class Bridge:
    def __init__(self,sw):
        self.sw=sw
        self.cancel_world=None
        self.world=SharedWorld(sw)
        self.world.bridge=self
        self.route=Route(self.world,birth=False)
        self.route.setup(state='active',prior_stop=False,objective='TEST_ONLY integrated Goal objective')
        # Preserve the Goal creator's actual ids before any S1 source is issued.
        gs=self.route.scope
        sw.ctx.project_id,sw.ctx.goal_id,sw.ctx.thread_id=gs['project_id'],gs['goal_id'],gs['thread_id']
        n=self.world.native
        n.writers.__class__=Writers
        n.run=Run(self.world)
        n.start=Start(self.world)
        n.d06=Disposition(self.world)
        sw.ctx.scope.update(project_id=gs['project_id'],goal_id=gs['goal_id'])
        rs=dict(sw.ctx.scope)
        n.writers.enroll(rs)
        self.route.wf_run=n.run.allocate(rs,gs,n.run.owner_id,n.run.owner_epoch)
        run=self.route.wf_run
        sw.ctx.plan_compile_run_id=run['compile_run']
        sw.ctx.workgraph_id=run['workgraph_id']
        sw.ctx.workgraph_ref='TEST_ONLY:workgraph:'+run['workgraph_id']
        sw.ctx.workflow_owner['owner_ref']=run['execution_owner_ref']
        sw.ctx.workflow_owner['owner_epoch']=run['execution_owner_epoch']
        self.bound=False
        self.companion_calls=[]

    def prepare_goal_body(self):
        w,r=self.world,self.route
        before=w.goal.body_cell(r.scope)['value']
        body=copy.deepcopy(before['record'])
        body.update(revision=body['revision']+1,active_run_ref=self.sw.ctx.goal_run_id,updated_at=w.goal.clock.now())
        body['currentness_hash']=w.shared.goal_model.hashbody({k:v for k,v in body.items() if k!='currentness_hash'})
        self.prospective_goal_body=w.goal.wrap('body',body)

    def prepare_joint(self,body,control,origin,outbox):
        w,r=self.world,self.route
        sel=w.binding.require_writer('workflow_attach')
        read=w.binding.read_current(r.scope)
        bctl=read['control']
        _,authority=w.permissions.grant(w.native.run.owner_id,r.scope,'goal.execution_binding.workflow_attach')
        self.binding_authority=authority
        self.body_authority=w.permissions.grant(w.goal.owner_id,r.scope,'goal.body.associate_workflow')[1]
        self.binding_operation=O.uid('TEST_ONLY:workflow-binding')
        association=dict(association_kind='workflow',active_run_ref=self.sw.ctx.goal_run_id,
            original_run_source=dict(family_id='workflow_goal_run_body',physical_key=body['physical_key'],schema_id=body['schema_id'],
                schema_version=body['schema_version'],codec_id=O.MSGPACK,complete_value_sha256=O.row_sha(body)),
            execution_owner_ref=self.sw.ctx.workflow_owner['owner_ref'],execution_owner_epoch=self.sw.ctx.workflow_owner['owner_epoch'],
            original_binding_transaction_id='TEST_ONLY:unissued-joint-birth-transaction')
        revision=dict(scope=dict(r.scope),binding_revision=1,previous_revision=bctl['value']['record']['current_revision'],
            active_run_ref=self.sw.ctx.goal_run_id,associations=[association],host_execution_owner_ref=w.host_stop.owner_id,
            host_execution_owner_epoch=w.host_stop.owner_epoch,writer_domain=sel,
            original_goal_birth_or_binding_operation=self.binding_operation)
        w.roots.check('producer',O.BINDING+'#/$defs/BindingRevision',revision)
        pending=dict(operation_id=self.binding_operation,operation='workflow_attach',expected_control_sha256=O.row_sha(bctl['value']),
            expected_goal_body_sha256=O.row_sha(w.goal.body_cell(r.scope)['value']),
            expected_goal_control_sha256=O.row_sha(w.goal.control(r.scope)['value']),
            expected_stop_control_sha256=O.row_sha(w.host_stop.current(r.scope)['value']),expected_writer_domain=sel,
            candidate=revision,original_owner_ref=w.native.run.owner_id,original_owner_epoch=w.native.run.owner_epoch)
        w.roots.check('producer',O.BINDING+'#/$defs/BindingPending',pending)
        pctl=dict(bctl['value']['record'],control_epoch=bctl['value']['record']['control_epoch']+1,pending=pending)
        key=w.binding.keys(r.scope)['control']
        w.write([w.put(w.binding.CONTROL,key,w.binding.wrap('StorageBindingControl',key,pctl),expected=bctl['version'])])
        self.joint_before=dict(body=copy.deepcopy(body),control=copy.deepcopy(control),outbox=copy.deepcopy(outbox),
                               pending=copy.deepcopy(pending))

    def joint_writes(self,native_body,native_control,native_origin,tx_id):
        w,r,sw=self.world,self.route,self.sw
        before=self.joint_before
        require('int/birth/exact_candidate',native_body==before['body'] and native_control==before['control'])
        bctl=w.binding.read_current(r.scope)['control']
        pending=bctl['value']['record']['pending']
        require('int/birth/pending',pending==before['pending'])
        require('int/birth/goal_current',O.row_sha(w.goal.body_cell(r.scope)['value'])==pending['expected_goal_body_sha256']
                and O.row_sha(w.goal.control(r.scope)['value'])==pending['expected_goal_control_sha256']
                and O.row_sha(w.host_stop.current(r.scope)['value'])==pending['expected_stop_control_sha256'])
        require('int/birth/binding_permission',w.permissions.allowed(self.binding_authority,w.native.run.owner_id,'goal.execution_binding.workflow_attach'))
        revision=copy.deepcopy(pending['candidate'])
        revision['associations'][0]['original_binding_transaction_id']=tx_id
        bk=w.binding.keys(r.scope,1)
        rev_w=w.binding.wrap('StorageBindingRevision',bk['revision'],revision)
        origin=dict(scope=dict(r.scope),binding_revision=1,issued_revision_key=bk['revision'],issued_revision_sha256=O.row_sha(rev_w),
            before_control_sha256=O.row_sha(bctl['value']),original_goal_body_sha256=pending['expected_goal_body_sha256'],
            original_goal_control_sha256=pending['expected_goal_control_sha256'],original_stop_control_sha256=pending['expected_stop_control_sha256'],
            original_source_members=[revision['associations'][0]['original_run_source']],
            issuer=O.transaction_record(w.native.run,'owner.goal.execution_binding.commit_workflow_binding.v1',self.binding_operation,
                        w.permissions.selection(self.binding_authority),tx_id,sw.ctx.goal_run_id))
        origin_w=w.binding.wrap('StorageBindingOrigin',bk['origin'],origin)
        psel=lambda family,key,value:dict(family_id=family,physical_key=key,schema_id=value['schema_id'],
                     schema_version=value['schema_version'],codec_id=O.MSGPACK,complete_value_sha256=O.row_sha(value))
        new_control=dict(bctl['value']['record'],control_epoch=bctl['value']['record']['control_epoch']+1,binding_revision=1,
            current_revision=psel(w.binding.REVISION,bk['revision'],rev_w),current_origin=psel(w.binding.ORIGIN,bk['origin'],origin_w),pending=None)
        w.roots.check('producer',O.BINDING+'#/$defs/BindingControl',new_control)
        for name,(owner,authority) in sw.integrated.launch_source_authorities.items():
            require('int/birth/launch_permission/'+name,w.permissions.allowed(authority,owner,'workflow.activation.issue:'+name))
        writes=[w.put(w.binding.REVISION,bk['revision'],rev_w),w.put(w.binding.ORIGIN,bk['origin'],origin_w),
            w.put(w.binding.CONTROL,bk['control'],w.binding.wrap('StorageBindingControl',bk['control'],new_control),expected=bctl['version'])]
        body_cell=w.goal.body_cell(r.scope)
        control_cell=w.goal.control(r.scope)
        before=copy.deepcopy(body_cell['value'])
        body=copy.deepcopy(before['record'])
        model=w.shared.goal_model
        body=copy.deepcopy(self.prospective_goal_body['record'])
        control=copy.deepcopy(control_cell['value']['record'])
        control.update(body_sha256=model.bytehash(body),current_revision=body['revision'],
                       currentness_hash=body['currentness_hash'],control_epoch=control['control_epoch']+1)
        op=O.uid('TEST_ONLY:goal-association-body')
        authority=self.body_authority
        command=dict(qualification=QUALIFICATION,operation_kind='metadata_update',operation_id=op,scope=r.scope,
                     expected_revision=before['record']['revision'],expected_currentness_hash=before['record']['currentness_hash'],
                     expected_stop_epoch=w.host_stop.record(r.scope)['user_stop_epoch'],after_record=body,authority_ref=authority)
        intent_sha=O.sha(w.codec.raw(command))
        intent=dict(operation_id=op,owner_ref=w.goal.owner_id,owner_epoch=w.goal.owner_epoch,operation_kind='metadata_update',
            expected_revision=command['expected_revision'],expected_currentness_hash=command['expected_currentness_hash'],
            expected_stop_epoch=command['expected_stop_epoch'],intent_sha256=intent_sha,after_record=body,
            accepted_revision=None,origin=None,original_change_authority_ref=None,external_authority_ref=None)
        w.roots.check('producer',O.BODY+'#/$defs/pending',intent)
        receipt=dict(schema_id='pm.goal.body_mutation_receipt.v1',**r.scope,operation_id=op,
            intent_sha256=intent_sha,owner_ref=w.goal.owner_id,authority_ref=authority,
            before_revision=before['record']['revision'],before_currentness_hash=before['record']['currentness_hash'],
            after_revision=body['revision'],after_currentness_hash=body['currentness_hash'],
            accepted_objective_revision=control['latest_objective_revision'],accepted_revision_hash=control['latest_revision_hash'],
            committed_at=w.goal.clock.now())
        rw=dict(schema_id='pm.storage_value.goal_body_mutation_receipt.v1',schema_version='1.0.0',record=receipt)
        w.roots.check('producer',O.BODY+'#/$defs/storage_receipt',rw)
        body_w,ctl_w=w.goal.wrap('body',body),w.goal.wrap('control',control)
        old_key='TEST_ONLY:goal-body-history:'+O.row_sha(before)
        receipt_key='goal_body_mutation_receipt:'+op
        intent_key='TEST_ONLY:goal-association-intent:'+op
        keys=w.goal.keys(r.scope)
        require('int/association/permission',w.permissions.allowed(authority,w.goal.owner_id,'goal.body.associate_workflow'))
        require('int/birth/launch_goal_snapshot',w.value(w.goal.BODY,old_key)==before)
        writes += [w.put('TEST_ONLY:goal_association_intent',intent_key,intent),
            w.put(w.goal.BODY,keys['body'],body_w,expected=body_cell['version']),
            w.put(w.goal.CONTROL,keys['control'],ctl_w,expected=control_cell['version']),
            w.put('goal_body_mutation_receipt',receipt_key,rw)]
        self.joint_result=dict(receipt=rw,receipt_key=receipt_key,old_key=old_key,goal_keys=keys,tx_id=tx_id,
                               body=body_w,control=ctl_w,intent=intent,native_origins={},
                               prepared_binding=dict(revision=rev_w,origin=origin_w,control=w.binding.wrap('StorageBindingControl',bk['control'],new_control)))
        writes.append(w.put('workflow_start_outbox_intent',self.joint_before['outbox']['physical_key'],self.joint_before['outbox']))
        self.joint_result['canonical_outbox']=self.joint_before['outbox']
        for role,family,value in [('workflow_birth_body','workflow_goal_run_body',native_body),
                                  ('workflow_birth_control','workflow_goal_run_control',native_control),
                                  ('reserved_start_outbox','workflow_start_outbox_intent',self.joint_before['outbox'])]:
            key=value.get('physical_key') or sw.owners['native'].outbox_key()
            origin=SW.skeleton(sw.edition.bank,sw.edition.activation+'#/$defs/OwnerIssueOriginPhysical')
            origin.update(storage_instance_id=w.storage_id,physical_key=sw.ctx.run_key('workflow_original_source_origin',role))
            origin['record'].update(issuer_method='owner.workflow.activation.begin.v1',owner_ref=sw.ctx.workflow_owner['owner_ref'],
                owner_epoch=sw.ctx.workflow_owner['owner_epoch'],original_operation_id=native_origin['record']['original_operation_id'],
                original_causation_ref=tx_id,issued_at_utc=sw.ctx.now(),issued_value_key=key,issued_record_sha256=SW.cdigest(value['record']))
            def selector(family,key,value):
                return dict(storage_instance_id=w.storage_id,family_id=family,physical_key=key,schema_id=value['schema_id'],
                            schema_version=value['schema_version'],physical_value_sha256=O.row_sha(value))
            permission=w.permissions.current(self.binding_authority)
            stop_key=w.host_stop.key(r.scope)
            origin['record'].update(source_bindings=[],
                actual_permission_source=selector(w.permissions.FAMILY,self.binding_authority,permission),
                actual_stop_source=selector(w.host_stop.FAMILY,stop_key,w.value(w.host_stop.FAMILY,stop_key)),
                actual_cancellation_source=selector(w.goal.CONTROL,keys['control'],ctl_w))
            sw.edition.bank.validate(sw.edition.activation+'#/$defs/OwnerIssueOriginPhysical',origin,'int/joint/birth_origin')
            writes.append(w.put('workflow_original_source_origin',origin['physical_key'],origin))
            self.joint_result['native_origins'][role]=origin
        return writes

    def bind_workflow(self):
        if self.bound:return
        w,r,sw=self.world,self.route,self.sw
        result=self.joint_result
        tx_id=result['tx_id']
        keys=result['goal_keys']
        for family,key in [(w.goal.BODY,keys['body']),(w.goal.CONTROL,keys['control']),
                           ('goal_body_mutation_receipt',result['receipt_key'])]:
            require('int/joint/readback',w.cell(family,key)['tx']==tx_id)
        w.goal._issue(None,dict(intent=result['intent'],receipt=result['receipt'],transaction_id=tx_id),kind='workflow_association_body')
        w.workflow_inventory.add(r.scope,'workflow_association',dict(goal_run_id=sw.ctx.goal_run_id,binding_revision_key=w.binding.keys(r.scope,1)['revision']))
        psel=lambda family,key:w.selection(family,key,w.value(family,key))
        self.association_receipt=result['receipt']
        self.member_roles=dict(launch_goal_before=psel(w.goal.BODY,result['old_key']),goal_after=psel(w.goal.BODY,keys['body']),
            goal_control_after=psel(w.goal.CONTROL,keys['control']),goal_metadata_receipt=psel('goal_body_mutation_receipt',result['receipt_key']))
        control=result['control']['record']
        birth=A.acquire(sw.registry,sw.handles['native_birth'][0],'workflow_native',sw.handles['native_birth'][1])[1]
        for role,family,value in [('workflow_birth_body','workflow_goal_run_body',birth['body']),
                                  ('workflow_birth_control','workflow_goal_run_control',birth['control']),
                                  ('reserved_start_outbox','workflow_start_outbox_intent',result['canonical_outbox'])]:
            key=value.get('physical_key') or sw.owners['native'].outbox_key()
            self.member_roles[role]=psel(family,key)
            origin=result['native_origins'][role]
            origin_role={'workflow_birth_body':'workflow_birth_body_origin','workflow_birth_control':'workflow_birth_control_origin',
                         'reserved_start_outbox':'reserved_start_outbox_origin'}[role]
            self.member_roles[origin_role]=psel('workflow_original_source_origin',origin['physical_key'])
        for role,name in [('original_native_compile_source','activation:native_compile'),
                          ('original_activation_decision','activation:activation_decision'),
                          ('original_certified_graph','activation:certified_graph')]:
            owner,handle=sw.handles[name]
            value=A.acquire(sw.registry,owner,sw.registry.roster()[owner],handle)[1]
            original=value['source']
            if SW.is_selector(original):
                selector=original
                original=SW.resolve_selector(w.storage,selector,'int/association/'+role)
                family,key=selector['family_id'],selector['physical_key']
            else:
                family=original['schema_id'].removeprefix('pm.storage_value.').rsplit('.v',1)[0]
                key=original['physical_key']
                # Export the unchanged whole physical original through its own issuer.
                cell=w.cell(family,key)
                if cell is None:
                    SW.put_values(sw.ctx,[(family,key,original)])
                    sw.registry.owner(owner,sw.registry.roster()[owner]).issue(None,dict(value=original,source_handle_kind=name),kind='physical_source_export')
                else:require('int/association/source_bytes',SW.read_value(w.storage,family,key)['value']==original)
            self.member_roles[role]=dict(family_id=family,physical_key=key,schema_id=original['schema_id'],
                                        schema_version=original['schema_version'],codec_id=O.MSGPACK,complete_value_sha256=O.row_sha(original))
        history=w.goal.history_cells(r.scope)[str(control['latest_objective_revision'])]
        hk=w.goal.keys(r.scope,control['latest_objective_revision'])
        self.member_roles['original_goal_objective_revision']=psel(w.goal.REVISION,hk['revision'])
        self.member_roles['original_goal_objective_origin']=psel(w.goal.ORIGIN,hk['origin'])
        self.bound=True

    def goal_cells(self):
        w,r=self.world,self.route
        g=w.goal.keys(r.scope)
        b=w.binding.keys(r.scope,1)
        return dict(body=(w.goal.BODY,g['body']),control=(w.goal.CONTROL,g['control']),
                    stop=(w.host_stop.FAMILY,w.host_stop.key(r.scope)),
                    binding_revision=(w.binding.REVISION,b['revision']),binding_control=(w.binding.CONTROL,b['control']))

    def goal_argument(self,kind):
        whole=self.route.current_goal()
        keys=SW.skeleton(self.sw.edition.goal_bank,self.sw.edition.goal_arg+'#/$defs/'+kind)
        whole.update(original_association_body_receipt=self.association_receipt,original_member_roles=self.member_roles)
        value={k:copy.deepcopy(whole[k]) for k in keys}
        self.sw.edition.goal_bank.validate(self.sw.edition.goal_arg+'#/$defs/'+kind,value,'int/c3/goal_argument')
        return value

    def verify_custody(self,value,where):
        count=0
        for path,sel in CN.walk_selectors(value):
            field=CN.shape_of(sel)
            if 'storage_instance_id' in sel:require(where+'/instance',sel['storage_instance_id']==self.world.storage_id)
            cell=SW.read_value(self.sw.storage,sel['family_id'],sel['physical_key'],where+'/pack')
            require(where+'/unavailable',cell is not None)
            current=O.row_sha(cell['value'])==sel[field]
            require(where+'/hash',current or self.sw.storage.committed_version(sel['family_id'],sel['physical_key'],sel[field]))
            if current:require(where+'/schema',cell['value'].get('schema_id')==sel['schema_id'] and cell['value'].get('schema_version')==sel['schema_version'])
            count+=1
        return count

    def check_companion(self,ref,value):
        path=Path(__file__).resolve().parents[1]/'Plans/goal_own_c_contracts/dg-int-native-v7-v1/c3-native-realms.json'
        selection=json.loads(path.read_text())
        selected=selection['roots'][ref.rsplit('/',1)[-1]]
        require('int/c3/companion_members',type(value) is dict and set(value)==set(selected['properties']))
        v7=self.cancel_world.roots if self.cancel_world is not None else RW.RootsV7.get()
        for key,route in selected['properties'].items():
            if route['realm']=='native_v7_current_start':
                res=v7.lookup('native_consumer',RW.CP+'CurrentSuccessfulReadback')
                target=urljoin(res.resolver._base_uri,res.contents['properties']['current_start']['$ref'])
                v7.validate('native_consumer',target,value[key],'int/c3/companion/'+key)
            elif route['realm']=='native_v7':
                v7.validate('native_consumer',route['schema_ref'],value[key],'int/c3/companion/'+key)
            else:self.world.roots.check('native',route['schema_ref'],value[key])
        self.companion_calls.append(dict(original_root=ref,selected_companion=selected['uri']))
