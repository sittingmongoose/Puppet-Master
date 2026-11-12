#!/usr/bin/env python3
"""Authentic C3 Goal cancellation in the separate original-profile world (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

The S1 original profile keeps its complete original native/D01 schemas. It
coissues actual CA3 Goal association metadata and binding at its own native
birth. No v7 value is restamped as an original-profile value.
"""
from __future__ import annotations
import copy,tempfile,types,weakref
from pathlib import Path
import pm_goal_test_owner_adapters as A
import pm_goal_dg_s_world as SW
import pm_goal_dg_s_start as ST
import pm_goal_dg_r_world as RW
import pm_goal_dg_int_world as IW
import pm_goal_dg_int_v7 as V
import pm_goal_dg_int_goal as G
import pm_goal_dg_int_cancel as C
W=SW
K=SW.K
cdigest=SW.cdigest
require=A.require
QUALIFICATION='TEST_ONLY'
NATIVE_LINE=RW.NATIVE_LINE
BEFORE_REVISION=ST.BEFORE_REVISION
BEFORE_ACTIVATION_REVISION=ST.BEFORE_ACTIVATION_REVISION
BEGIN_METHOD=ST.BEGIN_METHOD


class Native(ST.NativeOwner):
    def birth_run(self, descriptor_handle, descriptor_owner_id, edit_body=None, edit_origin=None):
        """Original birth: native before-state, StartControl epoch 0, its origin, A4 outbox."""
        e, ctx = self.edition, self.ctx
        ref, descriptor = A.acquire(self.registry, descriptor_owner_id, 'start_installed_descriptor',
                                    descriptor_handle)
        require('birth/descriptor_profile', descriptor['coordinator_profile'] == e.profile)
        require('birth/descriptor_cell', ctx.storage.cell('workflow_start_installed_descriptor',
                                                          'workflow_start_installed_descriptor:%s:%s' % (
                                                              K(ctx.sid), K(e.profile))) is not None)
        self.bridge.prepare_goal_body()
        before=self.bridge.world.goal.body_cell(self.bridge.route.scope)['value']
        self.goal_before_key='TEST_ONLY:goal-body-history:'+G.O.row_sha(before)
        SW.put_values(ctx,[(self.bridge.world.goal.BODY,self.goal_before_key,before)])
        body = self.body_wrapper(BEFORE_REVISION, 'ready', 'start_event_pending', BEFORE_ACTIVATION_REVISION,
                                 edit_body)
        control = self.control_wrapper(body)
        e.bank.validate(e.activation + '#/$defs/GoalRunBodyPhysical', body, 'birth/body')
        e.bank.validate(e.activation + '#/$defs/GoalRunControlPhysical', control, 'birth/control')
        start_control = W.skeleton(e.bank, e.custody + '#/$defs/StorageControl')
        start_control.update(storage_instance_id=ctx.sid, physical_key=self.start_control_key())
        start_control['record'].update(scope=copy.deepcopy(ctx.scope), epoch=0,
                                       owner=copy.deepcopy(ctx.workflow_owner), pending_candidate=None,
                                       committed_start=None, original_operation_id=None)
        e.bank.validate(e.custody + '#/$defs/StorageControl', start_control, 'birth/start_control')
        b = W.Binder(ctx, self.owner_id, 'start_birth_origin')
        origin = b.bind(W.skeleton(e.bank, e.activation + '#/$defs/OwnerIssueOriginPhysical'))
        b.commit()
        origin['physical_key'] = ctx.run_key('workflow_start_control_origin.v1')
        origin['record'].update(issuer_method=BEGIN_METHOD, owner_ref=ctx.workflow_owner['owner_ref'],
                                owner_epoch=ctx.workflow_owner['owner_epoch'],
                                original_operation_id='TEST_ONLY:birth:' + ctx.token,
                                original_causation_ref='TEST_ONLY:accepted-birth:' + ctx.token,
                                issued_at_utc=ctx.now(), issued_value_key=start_control['physical_key'],
                                issued_record_sha256=cdigest(start_control['record']))
        if edit_origin:
            origin = edit_origin(origin)
        e.bank.validate(e.activation + '#/$defs/OwnerIssueOriginPhysical', origin, 'birth/start_control_origin')
        outbox = dict(qualification=QUALIFICATION, schema_id='pm.storage_value.workflow_start_outbox.v1',
                      schema_version='1.0.0', record=dict(scope=copy.deepcopy(ctx.scope), state='prepared',
                                                          intended_payload_version=2, event=None, receipt=None,
                                                          dispatch_released=False))
        current = dict(qualification=QUALIFICATION, body_key=body['physical_key'],
                       control_key=control['physical_key'], revision=BEFORE_REVISION)
        canonical=SW.skeleton(e.bank,e.activation+'#/$defs/StartOutboxIntentPhysical')
        canonical.update(storage_instance_id=ctx.sid,physical_key=ctx.run_key('workflow_start_outbox_intent','reserved'))
        canonical['record'].update(identity=ctx.identity(),activation_id=body['record']['activation_state']['activation_id'],
            event_name='goal_run.started',source_alias=None,event_payload_schema_id='pm.goal_runtime_event.goal_run_started.schema.v2',
            phase='reserved',staging_source=None,activation_receipt=None,published_event_id=None,published_first_append_receipt=None,dispatch_released=False)
        self.bridge.prepare_joint(body,control,origin,canonical)
        ctx.storage._birth_coissuer=lambda writes,tx:self.bridge.joint_writes(body,control,origin,tx)
        tx = ctx.storage.transact([
            dict(table='workflow_goal_run_body', key=body['physical_key'], expected=None, value=body),
            dict(table='workflow_goal_run_control', key=control['physical_key'], expected=None, value=control),
            dict(table='workflow_goal_run_current', key=self.current_key(), expected=None, value=current),
            dict(table='workflow_start_control', key=start_control['physical_key'], expected=None, value=start_control),
            dict(table='workflow_start_control_origin', key=origin['physical_key'], expected=None, value=origin),
            dict(table='workflow_start_prepared_outbox', key=self.outbox_key(), expected=None, value=outbox),
        ])
        record = dict(qualification=QUALIFICATION, subject=ctx.goal_run_id, state='start_event_pending',
                      revision=0, descriptor_ref=ref, descriptor_install_tx=descriptor['install_tx'],
                      birth_tx=tx['tx_id'], birth_generation=tx['generation'],
                      body=body, control=control, start_control=start_control, initial_control_origin=origin)
        handle = self.birth(ctx.goal_run_id, 'start_event_pending', value=record)
        return handle, record

    def body_wrapper(self,revision,status,activation_state,activation_revision,edit=None):
        value=super().body_wrapper(revision,status,activation_state,activation_revision)
        if hasattr(self,'goal_before_key'):
            ca=self.bridge.world
            before=ca.value(ca.goal.BODY,self.goal_before_key)
            value['record']['original_goal_body']=V.physical(types.SimpleNamespace(storage=self.ctx.storage),ca.goal.BODY,self.goal_before_key,before)
        return edit(value) if edit else value


class World(C.CancelWorld):
    def __init__(self,cfg=None,base=None):
        from pm_goal_dg_int_old_roots import Roots
        self.cfg=dict(cfg or {})
        RW.guard('int/old/start_kind',self.cfg.get('start','started')=='started')
        self.knobs=self.cfg.get('knobs',{})
        RW.World.CURRENT=self
        self.tmp=Path(tempfile.mkdtemp(prefix='dgint-c3-old-',dir=base))
        ids={}
        pad=RW.NR.uint64(self.cfg.get('id_pad',0),'int/old/id_pad')
        if pad:
            tag=RW.uuid.uuid4().hex[:6]+'x'*pad
            ids=dict(project='TEST_ONLY-project-'+tag,goal='TEST_ONLY-goal-'+tag,run='TEST_ONLY-goal-run-'+tag)
        sw=ST.StartWorld(self.tmp/'s1',SW.v3_edition(),segment_target_bytes=int(self.cfg.get('segment_target_bytes',65536)),**ids)
        sw.storage.__class__=V.Storage
        sw.storage._tx_handles=weakref.WeakKeyDictionary()
        sw.storage.lane_cut_point=None
        self.start_world=sw
        self.storage,self.registry,self.recorder=sw.storage,sw.registry,sw.recorder
        self.goal_bridge=G.Bridge(sw)
        self.goal_bridge.cancel_world=self
        sw.build_owners()
        sw._owner('goal',G.Goal);sw.owners['goal'].bridge=self.goal_bridge
        native=sw._owner('native',Native);native.bridge=self.goal_bridge
        sw.integrated=types.SimpleNamespace(launch_source_authorities={})
        self.edition='original_profile'
        from pm_goal_dg_int_schema_cache import Roots as SchemaRoots
        self.roots=SchemaRoots(Roots.get())
        self.seeder=RW.Seeder(self.roots)
        self.clock=RW.Clock(self.storage)
        self.sid=self.storage.storage_instance_id
        self.scope=dict(sw.ctx.scope)
        ctx=sw.ctx
        self.ids=dict(execution_owner_ref=ctx.workflow_owner['owner_ref'],workflow_owner_ref=ctx.workflow_owner['owner_ref'],
            plan_compile_run_id=ctx.plan_compile_run_id,workgraph_id=ctx.workgraph_id,workgraph_ref=ctx.workgraph_ref,
            activation_id='TEST_ONLY:activation:'+ctx.token,activation_key=None)
        self.workgraph_sha256=None
        self.activation_revision=None
        self.issued={}
        self.append=A.AppendOwner(self.registry,self.storage)
        self.ancillary=RW.PhysOwner(self,'ancillary_provenance')
        self.permissions=dict(read=True,project=True)

    _birth=IW.S1CancelWorld._birth


class Projector(C.RP.Projector):
    def __init__(self,world):
        super().__init__(world)
        self.consumer=C.Consumer(world)

    def current_sources(self):return C.current_projection_sources(self)

    read_current_started=C.current_started_after_cancel


World.projector_class=Projector
