#!/usr/bin/env python3
"""DG-INT unified TEST_ONLY native-v7 source owners.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

One Storage holds S2's whole immutable Workflow body/control revisions, D01
lineage and pointers, and the coordinator authority. CF1's execution, final
certifier and producer owners consume this state; no second compact Workflow
body or control is installed. Compact dictionaries returned by state() are
read views of those actual wrappers, never another source of native truth.
"""
from __future__ import annotations

import base64
import copy
import json
import random
import weakref
from pathlib import Path

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as GS
import pm_goal_dg_s_world as SW
import pm_goal_dg_s_start as ST
import pm_goal_dg_s_readers as SR
import pm_goal_dg_cf1_world as F
import pm_goal_dg_cf1_compose as C
import pm_goal_dg_cf2_world as W
import pm_goal_dg_cf2_native as N
import pm_goal_dg_int_world as IW

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
cdigest = SW.cdigest
K = S.k_component
require = A.require
BIRTH = 'executor_workflow_workflow_birth'
RESULT = 'workflow_standard_result'
ORIGIN = 'workflow_standard_origin'
BODY = 'workflow_goal_run_body'
CONTROL = 'workflow_goal_run_control'
CURRENT = 'workflow_goal_run_current'


def physical(world, family, key, value):
    # A prospective selector is a pure candidate; readers authenticate it only after commit.
    return dict(storage_instance_id=world.storage.storage_instance_id, family_id=family, physical_key=key,
                schema_id=value['schema_id'], schema_version=value['schema_version'],
                physical_value_sha256=SW.cdigest(value))


def resolve_original(storage,selector,where):
    """An original may select an earlier committed pointer/control version."""
    require(where+'/selector_type',SW.is_selector(selector))
    require(where+'/storage',selector['storage_instance_id']==storage.storage_instance_id)
    cell=SW.read_value(storage,selector['family_id'],selector['physical_key'],where+'/pack')
    require(where+'/unavailable',cell is not None)
    digest=selector[SW.selector_hash_field(selector)]
    value=cell['value'] if SW.cdigest(cell['value'])==digest else storage.historical_value(selector['family_id'],selector['physical_key'],digest)
    require(where+'/schema',value['schema_id']==selector['schema_id'] and value['schema_version']==selector['schema_version'])
    return value


def wrapper(schema_id, version, record, *, storage=None, key=None):
    out = dict(schema_id=schema_id, schema_version=version, record=copy.deepcopy(record))
    if storage is not None:
        out.update(storage_instance_id=storage.storage_instance_id, physical_key=key)
    return out


class Storage(IW.IntStorage):
    """Batch-2 Storage plus participant issuance and a single-use B1 coissuer."""
    def transact(self, writes, **kw):
        coissuer = getattr(self, '_birth_coissuer', None)
        if coissuer is not None and any(x['table'] == CURRENT and x['expected'] is None for x in writes):
            self._birth_coissuer = None
            tx = self.next_tx_id()
            writes = list(writes) + coissuer(writes, tx)
        out = super().transact(writes, **kw)
        history = self.__dict__.setdefault('version_history', {})
        for x in writes:
            if not x.get('delete'):
                value=SW.read_value(self,x['table'],x['key'])['value']
                history.setdefault((x['table'],x['key']),[]).append(SW.cdigest(value))
                self.__dict__.setdefault('version_values',{}).setdefault((x['table'],x['key']),{})[SW.cdigest(value)]=copy.deepcopy(value)
        return out

    def historical_value(self,family,key,digest):
        require('int/storage/history_custody',self.committed_version(family,key,digest))
        value=self.__dict__.get('version_values',{}).get((family,key),{}).get(digest)
        require('int/storage/history_value',value is not None and SW.cdigest(value)==digest)
        return copy.deepcopy(value)

    def assign_late_times(self,operation_id):
        record=super().reservation_record(operation_id)
        require('int/late/reserved',record is not None and record['state']=='reserved')
        cell=self.cell('TEST_ONLY:late_event_assignment',operation_id)
        if cell is None:
            value=dict(observed_at_utc=self._tick(),persisted_at_utc=self._tick(),
                       reservation_transaction_id=record['reservation_transaction_id'])
            self.transact([dict(table='TEST_ONLY:late_event_assignment',key=operation_id,expected=None,value=value)])
        else:value=cell['value']
        require('int/late/original_reservation',value['reservation_transaction_id']==record['reservation_transaction_id'])
        return value['observed_at_utc'],value['persisted_at_utc']

    def reservation_record(self,operation_id):
        value=super().reservation_record(operation_id)
        cell=self.cell('TEST_ONLY:late_event_assignment',operation_id)
        if value is not None and cell is not None:
            value.update(assigned_observed_at_utc=cell['value']['observed_at_utc'],
                         assigned_persisted_at_utc=cell['value']['persisted_at_utc'])
        return value

    def append(self,handle,candidates,*,durability_class='ordinary'):
        op=self._resolve_handle(handle,'reservation')
        record=self.reservation_record(op)
        if not record or record['state']!='reserved' or 'assigned_observed_at_utc' not in record:
            return super().append(handle,candidates,durability_class=durability_class)
        ticks=[record['assigned_observed_at_utc'],record['assigned_persisted_at_utc']]
        original=self._tick
        self._tick=lambda:ticks.pop(0) if ticks else original()
        try:return super().append(handle,candidates,durability_class=durability_class)
        finally:self._tick=original

    def committed_version(self, family, key, digest):
        versions = self.__dict__.get('version_history', {}).get((family, key), [])
        cell = self.cell(family, key)
        return bool(versions) and cell is not None and SW.cdigest(SW.read_value(self,family,key)['value']) == versions[-1] and digest in versions


class StartNative(ST.NativeOwner):
    """S2's birth, with native v8 Birth and coordinator B1 members coissued."""
    def birth_run(self, descriptor_handle, descriptor_owner_id, edit_body=None, edit_origin=None):
        """Original birth: native before-state, StartControl epoch 0, its origin, A4 outbox."""
        e, ctx = self.edition, self.ctx
        ref, descriptor = A.acquire(self.registry, descriptor_owner_id, 'start_installed_descriptor',
                                    descriptor_handle)
        require('birth/descriptor_profile', descriptor['coordinator_profile'] == e.profile)
        require('birth/descriptor_cell', ctx.storage.cell('workflow_start_installed_descriptor',
                                                          'workflow_start_installed_descriptor:%s:%s' % (
                                                              S.k_component(ctx.sid), K(e.profile))) is not None)
        if hasattr(self.integrated,'goal_bridge'):
            self.integrated.goal_bridge.prepare_goal_body()
        body = self.body_wrapper(1,'ready','activation_pending',1,
                                 edit_body)
        control = self.control_wrapper(body)
        e.bank.validate(e.activation + '#/$defs/GoalRunBodyPhysical', body, 'birth/body')
        e.bank.validate(e.activation + '#/$defs/GoalRunControlPhysical', control, 'birth/control')
        start_control = SW.skeleton(e.bank, e.custody + '#/$defs/StorageControl')
        start_control.update(storage_instance_id=ctx.sid, physical_key=self.start_control_key())
        start_control['record'].update(scope=copy.deepcopy(ctx.scope), epoch=0,
                                       owner=copy.deepcopy(ctx.workflow_owner), pending_candidate=None,
                                       committed_start=None, original_operation_id=None)
        e.bank.validate(e.custody + '#/$defs/StorageControl', start_control, 'birth/start_control')
        b = SW.Binder(ctx, self.owner_id, 'start_birth_origin')
        origin = b.bind(SW.skeleton(e.bank, e.activation + '#/$defs/OwnerIssueOriginPhysical'))
        b.commit()
        origin['physical_key'] = ctx.run_key('workflow_start_control_origin.v1')
        origin['record'].update(issuer_method=ST.BEGIN_METHOD, owner_ref=ctx.workflow_owner['owner_ref'],
                                owner_epoch=ctx.workflow_owner['owner_epoch'],
                                original_operation_id='TEST_ONLY:birth:' + ctx.token,
                                original_causation_ref='TEST_ONLY:accepted-birth:' + ctx.token,
                                issued_at_utc=ctx.now(), issued_value_key=start_control['physical_key'],
                                issued_record_sha256=SW.cdigest(start_control['record']))
        if edit_origin:
            origin = edit_origin(origin)
        e.bank.validate(e.activation + '#/$defs/OwnerIssueOriginPhysical', origin, 'birth/start_control_origin')
        outbox = dict(qualification=QUALIFICATION, schema_id='pm.storage_value.workflow_start_outbox.v1',
                      schema_version='1.0.0', record=dict(scope=copy.deepcopy(ctx.scope), state='prepared',
                                                          intended_payload_version=2, event=None, receipt=None,
                                                          dispatch_released=False))
        current = dict(qualification=QUALIFICATION, body_key=body['physical_key'],
                       control_key=control['physical_key'],revision=body['record']['revision'])
        canonical_outbox=SW.skeleton(e.bank,e.activation+'#/$defs/StartOutboxIntentPhysical')
        canonical_outbox.update(storage_instance_id=ctx.sid,physical_key=ctx.run_key('workflow_start_outbox_intent','reserved'))
        canonical_outbox['record'].update(identity=ctx.identity(),activation_id=body['record']['activation_state']['activation_id'],
            event_name='goal_run.started',source_alias=None,event_payload_schema_id='pm.goal_runtime_event.goal_run_started.schema.v2',
            phase='reserved',staging_source=None,activation_receipt=None,published_event_id=None,published_first_append_receipt=None,dispatch_released=False)
        self.canonical_birth_outbox=canonical_outbox
        if hasattr(self.integrated,'goal_bridge'):
            self.integrated.goal_bridge.prepare_joint(body,control,origin,canonical_outbox)
        ctx.storage._birth_coissuer=self.integrated.coissue_birth
        tx = ctx.storage.transact([
            dict(table='workflow_goal_run_body', key=body['physical_key'], expected=None, value=body),
            dict(table='workflow_goal_run_control', key=control['physical_key'], expected=None, value=control),
            dict(table='workflow_goal_run_current', key=self.current_key(), expected=None, value=current),
            dict(table='workflow_start_control', key=start_control['physical_key'], expected=None, value=start_control),
            dict(table='workflow_start_control_origin', key=origin['physical_key'], expected=None, value=origin),
            dict(table='workflow_start_prepared_outbox', key=self.outbox_key(), expected=None, value=outbox),
        ])
        record = dict(qualification=QUALIFICATION, subject=ctx.goal_run_id,state='activation_pending',
                      revision=0, descriptor_ref=ref, descriptor_install_tx=descriptor['install_tx'],
                      birth_tx=tx['tx_id'], birth_generation=tx['generation'],
                      body=body, control=control, start_control=start_control, initial_control_origin=origin)
        handle = self.birth(ctx.goal_run_id,'activation_pending',value=record)
        return handle, record

    def body_wrapper(self, revision, status, activation_state, activation_revision, edit=None):
        # S2 births the pre-Start snapshot. Its materialization owners have already
        # issued the exact originals that this initial snapshot selects.
        value = super().body_wrapper(revision,status,activation_state,activation_revision)
        w, sw = self.integrated, self.integrated.sw
        if activation_state=='activation_pending':
            value['record'].update(required_set=None,installed_workgraph=None,certification_receipt=None)
        else:
            for field, family, name in [('required_set','workflow_required_set','required_set'),
                                        ('installed_workgraph','workflow_installed_graph','installed_graph')]:
                owner_id, handle = sw.handles[name]
                original = A.acquire(sw.registry,owner_id,'materialization:'+('graph' if name=='installed_graph' else name),handle)[1]
                value['record'][field] = w.binding(family,original,w.source_origins[(family,original['physical_key'])])
        if hasattr(w,'goal_bridge'):
            bridge=w.goal_bridge
            value['record']['original_goal_body']=copy.deepcopy(w.launch_reservation['original_goal_body'])
            decision=w.launch_source_values['activation_decision']
            family=decision['source']['schema_id'].removeprefix('pm.storage_value.').rsplit('.v',1)[0]
            value['record']['source_activation_decision']=w.binding(family,decision['source'],decision['origin'])
            value['record']['activation_state'].update(activation_id=w.launch_reservation['activation_id'],
                                                       idempotency_key=w.launch_reservation['idempotency_key'])
            ca=bridge.world
            control=ca.goal.control(bridge.route.scope)['value']['record']
            keys=ca.goal.keys(bridge.route.scope,control['latest_objective_revision'])
            value['record']['original_goal_lineage']=dict(
                source=physical(w,ca.goal.REVISION,keys['revision'],ca.value(ca.goal.REVISION,keys['revision'])),
                origin=physical(w,ca.goal.ORIGIN,keys['origin'],ca.value(ca.goal.ORIGIN,keys['origin'])))
        return edit(value) if edit else value


class StartOwner(ST.StartOwner):
    """S1 complete Start join after genuine B1 and three activation publications."""
    def entry_joins(self, request, src):
        e, ctx = self.edition, self.ctx
        storage = ctx.storage
        e.bank.validate(e.custody + '#/$defs/Request', request, 'start/request')
        require('start/request_scope', A.same(request['scope'], ctx.scope))
        d = src['descriptor']
        require('start/descriptor_profile', d['coordinator_profile'] == e.profile)
        require('start/descriptor_methods', d['issuer_method'] == e.start_method and d['storage_method'] == e.storage_method)
        bank_pins = {p['retrieval_uri']: p['whole_sha256'] for p in d['schema_resources']}
        for uri in (e.custody, e.d01, e.activation, e.consumer):
            require('start/descriptor_schema_pin', bank_pins.get(uri) == e.bank.original.resource_origins[uri][0])
        require('start/descriptor_goal_pin', bank_pins.get(e.goal_arg) ==
                e.goal_bank.original.resource_origins[e.goal_arg][0])
        cell = storage.cell('workflow_start_installed_descriptor',
                            'workflow_start_installed_descriptor:%s:%s' % (K(ctx.sid), K(e.profile)))
        require('start/descriptor_installed', cell is not None and cell['tx'] == d['install_tx'])
        birth = src['native_birth']
        require('start/descriptor_before_birth', d['install_generation'] < birth['birth_generation'])
        require('start/birth_descriptor', birth['descriptor_install_tx'] == d['install_tx'])
        native = self.world.owners['native'].current()
        body, control = native['body'], native['control']
        require('start/revision_conflict', body['record']['status'] == 'ready' and
                body['record']['revision']==self.world.prestart_revision)
        require('start/native_activation', body['record']['activation_state']['state'] == 'start_event_pending')
        require('start/native_control_join', control['record']['body_record_sha256'] == SW.cdigest(body['record'])
                and control['record']['revision'] == body['record']['revision'])
        require('start/native_identity', A.same(body['record']['identity'], ctx.identity()))
        cs = src['d01_current']
        require('start/d01_scope', A.same(cs['scope'], ctx.scope))
        require('start/d01_current_body', A.same(cs['workflow']['current_body'], body['record']))
        require('start/d01_current_control', A.same(cs['workflow']['current_control'], control['record']))
        head = cs['workflow']['head']
        SW.resolve_selector(storage, head['current_body'], 'start/d01_head_body')
        SW.resolve_selector(storage, head['current_control'], 'start/d01_head_control')
        pointer = storage.cell(ST.d01_families(self.edition)['pointer'], self.world.owners['d01'].pointer_key())
        require('start/d01_pointer', pointer is not None and pointer['value']['record']['revision'] == head['revision']
                and A.same(pointer['value']['record'], cs['pointer']))
        SW.resolve_selector(storage, pointer['value']['record']['workflow_head'], 'start/d01_pointer_head')
        require('start/run_cancellation_null', cs['run_control']['cancellation'] is None)
        sc = self.world.owners['native'].start_control()
        base = copy.deepcopy(sc['value'])
        base['record']['pending_candidate'] = None
        require('start/start_control_birth', A.same(base, birth['start_control']))
        require('start/start_control_epoch', sc['value']['record']['epoch'] == 0)
        require('start/start_control_committed', sc['value']['record']['committed_start'] is None)
        origin = birth['initial_control_origin']
        require('start/initial_origin_method', origin['record']['issuer_method'] == ST.BEGIN_METHOD)
        require('start/initial_origin_key', origin['record']['issued_value_key'] == birth['start_control']['physical_key'])
        require('start/initial_origin_record', origin['record']['issued_record_sha256'] ==
                SW.cdigest(birth['start_control']['record']))
        require('start/initial_origin_owner', origin['record']['owner_ref'] == ctx.workflow_owner['owner_ref'] and
                origin['record']['owner_epoch'] == ctx.workflow_owner['owner_epoch'])
        graph, rs, staging, ar = src['installed_graph'], src['required_set'], src['staging'], src['activation_receipt']
        require('start/graph_identity', A.same(graph['record']['identity'], ctx.identity()))
        require('start/graph_commitment', ctx.workgraph_sha256 == SW.cdigest([
            'pm.goal_test.dg_s.workgraph.v1', graph['record']['members'], graph['record']['entrypoint_worknode_ids'],
            graph['record']['source_dependency_edges'], graph['record']['active_dependency_edges']]))
        require('start/required_set_graph', A.same(rs['record']['installed_workgraph']['source'], SW.selector_for(
            ctx, 'workflow_installed_graph', graph['physical_key'], graph)))
        refs = rs['record']['worknode_requests']['active_required_request_refs']
        born, receipts = src['born_worknodes'], src['materialization_receipts']
        require('start/born_membership', sorted(n['record']['source_request_id'] for n in born) == sorted(refs))
        node_ids = [n['record']['worknode_id'] for n in born]
        require('start/receipt_membership', sorted(r['record']['worknode_id'] for r in receipts) == sorted(node_ids))
        for node in born:
            stored = SW.read_value(storage, 'workflow_born_worknode', node['physical_key'])
            require('start/born_worknode_custody', stored is not None and A.same(stored['value'], node))
        for r in receipts:
            node = next((n for n in born if n['record']['worknode_id'] == r['record']['worknode_id']), None)
            require('start/receipt_born_key', node is not None and r['record']['born_worknode_key'] == node['physical_key'])
            require('start/receipt_born_hash', r['record']['born_worknode_record_sha256'] == SW.cdigest(node['record']))
        require('start/staging_entrypoints', sorted(staging['record']['entrypoint_worknode_ids']) ==
                sorted(graph['record']['entrypoint_worknode_ids']))
        require('start/staging_required_set', A.same(staging['record']['required_set']['source'], SW.selector_for(
            ctx, 'workflow_required_set', rs['physical_key'], rs)))
        require('start/staging_not_released', staging['record']['dispatch_released'] is False)
        require('start/activation_receipt_required_set', A.same(ar['record']['required_set']['source'],
                SW.selector_for(ctx, 'workflow_required_set', rs['physical_key'], rs)))
        require('start/activation_receipt_graph', A.same(ar['record']['installed_workgraph']['source'],
                SW.selector_for(ctx, 'workflow_installed_graph', graph['physical_key'], graph)))
        require('start/activation_receipt_staging', A.same(ar['record']['entrypoints_staged']['source'],
                SW.selector_for(ctx, 'workflow_entrypoint_staging', staging['physical_key'], staging)))
        require('start/activation_receipt_receipts', sorted(x['source']['physical_key'] for x in
                ar['record']['worknode_materialization_receipts']) == sorted(r['physical_key'] for r in receipts))
        for x in ar['record']['worknode_materialization_receipts']:
            SW.resolve_selector(storage, x['source'], 'start/activation_receipt_member')
        require('start/readiness', all(v['satisfied'] is True for v in src['readiness'].values()))
        goal = src['goal']
        require('start/goal_scope', goal['body']['record']['goal_id'] == ctx.goal_id and
                goal['body']['record']['project_id'] == ctx.project_id)
        require('start/goal_association', goal['binding_revision']['record']['active_run_ref'] == ctx.goal_run_id)
        assoc = goal['binding_revision']['record']['associations']
        require('start/goal_association_member', len(assoc) == 1 and assoc[0]['association_kind'] == 'workflow'
                and assoc[0]['active_run_ref'] == ctx.goal_run_id)
        run_source = assoc[0]['original_run_source']
        birth_body = SW.read_value(storage, run_source['family_id'], run_source['physical_key'], 'start/goal_run_source')
        require('start/goal_run_source', birth_body is not None and
                SW.cdigest(birth_body['value']) == run_source['complete_value_sha256'] and
                A.same(birth_body['value'], birth['body']))
        require('start/goal_binding_transaction', assoc[0]['original_binding_transaction_id'] == birth['birth_tx'])
        require('start/goal_no_effective_stop', goal['stop']['record']['latched'] is False)
        require('start/goal_active', goal['body']['record']['state'] == 'active')
        rt = src['runtime']
        require('start/runtime_actor', type(rt.get('actor_ref')) is str and rt['actor_ref'] != '')
        for name in ['d01_current', 'launch', 'installed_graph', 'required_set', 'staging', 'activation_receipt']:
            for path, sel in SW.walk_selectors(src[name]):
                if sel['storage_instance_id'] == ctx.sid:
                    resolve_original(storage, sel, 'start/source_selector/'+name+'/'+'/'.join(map(str,path)))
        for k in SW.SEVEN_INPUTS + tuple('a:' + x for x in SW.ACTIVATION_SOURCES):
            name = 'input:' + k if not k.startswith('a:') else 'activation:' + k[2:]
            for path, sel in SW.walk_selectors(src[name]):
                if sel['storage_instance_id'] == ctx.sid:
                    resolve_original(storage, sel, 'start/source_selector/'+name+'/'+'/'.join(map(str,path)))
        actual=self.world.owners['d01'].current_source(native)
        require('start/whole_d01_current',A.same(src['d01_current'],actual))
        return native


class StartWorld(ST.StartWorld):
    def issue_sources(self, edits=None):
        """S2 issuance with Born/receipt originals before the required set that selects them."""
        edits = edits or {}
        e, ctx, o = self.edition, self.ctx, self.owners
        sk = lambda name: SW.skeleton(e.bank, e.custody + '#/$defs/OriginalWorkflowArgument')[name]  # noqa: E731
        whole = SW.skeleton(e.bank, e.custody + '#/$defs/OriginalWorkflowArgument')
        h = self.handles
        # 1. installed descriptor before birth
        h['descriptor'] = (o['descriptor'].owner_id, o['descriptor'].install(edits.get('descriptor')))
        # 2. installed graph fixes the run identity's graph commitment
        graph = whole['installed_graph']
        g = o['materialization:graph']
        b = SW.Binder(ctx, g.owner_id, 'graph')
        graph = b.bind(graph)
        node_ids = ['TEST_ONLY:worknode:%s:%d' % (ctx.token, i) for i in range(ST.WORKNODES)]
        request_ids = ['TEST_ONLY:worknode-request:%s:%d' % (ctx.token, i) for i in range(ST.WORKNODES)]
        member = graph['record']['members'][0]
        graph['record']['members'] = [dict(copy.deepcopy(member), **{k: v for k, v in (
            ('worknode_id', node_ids[i]), ('source_request_id', request_ids[i])) if k in member})
            for i in range(ST.WORKNODES)]
        graph['record']['entrypoint_worknode_ids'] = list(node_ids)
        graph['physical_key'] = ctx.run_key('workflow_installed_graph')
        ctx.workgraph_sha256 = cdigest(['pm.goal_test.dg_s.workgraph.v1', graph['record']['members'],
                                        graph['record']['entrypoint_worknode_ids'],
                                        graph['record']['source_dependency_edges'],
                                        graph['record']['active_dependency_edges']])
        graph['record']['identity'] = ctx.identity()
        if 'installed_graph' in edits:
            graph = edits['installed_graph'](graph)
        b.commit()
        SW.put_values(ctx, [('workflow_installed_graph', graph['physical_key'], graph)])
        h['installed_graph'] = (g.owner_id, g.issue(e.activation + '#/$defs/InstalledWorkGraphPhysical', graph,
                                                    kind='installed_graph'))
        self.node_ids, self.request_ids = node_ids, request_ids
        # 4. seven durable original inputs and seven activation sources, each its own owner
        for k in SW.SEVEN_INPUTS:
            owner = o['input:' + k]
            h['input:' + k] = (owner.owner_id, owner.issue_whole(
                e.activation.replace('workflow_activation_sources.v4', 'current_activation_materialization_join.v1')
                + '#/$defs/SevenDurableOriginalInputs/properties/' + k, whole['seven_original_inputs'][k],
                kind='seven_input:' + k, edit=edits.get('input:' + k)))
        for k in SW.ACTIVATION_SOURCES:
            owner = o['activation:' + k]
            h['activation:' + k] = (owner.owner_id, owner.issue_whole(
                e.activation.replace('workflow_activation_sources.v4', 'current_activation_materialization_join.v1')
                + '#/$defs/OriginalActivationSources/properties/' + k, whole['original_activation_sources'][k],
                kind='activation_source:' + k, edit=edits.get('activation:' + k)))
        self.integrated.export_launch_sources()
        # Original B1 birth before materialization
        h['native_birth'] = (o['native'].owner_id, o['native'].birth_run(h['descriptor'][1], h['descriptor'][0],
                                                                       edits.get('native_body'),
                                                                       edits.get('native_origin'))[0])
        if hasattr(self.integrated,'goal_bridge'):
            self.integrated.goal_bridge.bind_workflow()
        # 5. required set, born WorkNodes, materialization receipts, staging, readiness, origins
        wn_owner = o['materialization:worknodes']
        born_skeleton = SW.skeleton(e.bank, e.activation + '#/$defs/BornWorkNodeRecordPhysical')
        born = []
        for i in range(ST.WORKNODES):
            b = SW.Binder(ctx, wn_owner.owner_id, 'worknode%d' % i)
            node = b.bind(copy.deepcopy(born_skeleton))
            node['physical_key'] = ctx.run_key('workflow_born_worknode', node_ids[i])
            node['record'].update(worknode_id=node_ids[i], source_request_id=request_ids[i],
                                  workgraph_id=ctx.workgraph_id, goal_run_id=ctx.goal_run_id)
            b.commit()
            born.append(node)
        if 'born_worknodes' in edits:
            born = edits['born_worknodes'](born)
        SW.put_values(ctx, [('workflow_born_worknode', n['physical_key'], n) for n in born])
        h['born_worknodes'] = (wn_owner.owner_id, wn_owner.issue(None, born, kind='born_worknodes'))
        for n in born:
            e.bank.validate(e.activation + '#/$defs/BornWorkNodeRecordPhysical', n, 'issue/born_worknode')
        rc_owner = o['materialization:receipts']
        receipt_skeleton = SW.skeleton(e.bank, e.activation + '#/$defs/WorkNodeMaterializationReceiptPhysical')
        receipts = []
        for i, node in enumerate(born):
            b = SW.Binder(ctx, rc_owner.owner_id, 'receipt%d' % i)
            rec = b.bind(copy.deepcopy(receipt_skeleton))
            rec['physical_key'] = ctx.run_key('workflow_materialization_receipt', node_ids[i])
            rec['record'].update(receipt_id='TEST_ONLY:materialization-receipt:%s:%d' % (ctx.token, i),
                                 worknode_id=node['record']['worknode_id'],
                                 source_request_id=node['record']['source_request_id'],
                                 born_worknode_key=node['physical_key'],
                                 born_worknode_record_sha256=cdigest(node['record']),
                                 activation_id='TEST_ONLY:activation:' + ctx.token, issued_at_utc=ctx.now())
            b.commit()
            receipts.append(rec)
        if 'materialization_receipts' in edits:
            receipts = edits['materialization_receipts'](receipts)
        SW.put_values(ctx, [('workflow_materialization_receipt', r['physical_key'], r) for r in receipts])
        for r in receipts:
            e.bank.validate(e.activation + '#/$defs/WorkNodeMaterializationReceiptPhysical', r, 'issue/receipt')
        h['materialization_receipts'] = (rc_owner.owner_id, rc_owner.issue(None, receipts,
                                                                           kind='materialization_receipts'))
        rs_owner = o['materialization:required_set']
        b = SW.Binder(ctx, rs_owner.owner_id, 'required_set')
        rs = b.bind(whole['required_set'])
        rs['physical_key'] = ctx.run_key('workflow_required_set')
        rs['record']['worknode_requests']['active_required_request_refs'] = list(request_ids)
        rs['record']['installed_workgraph']['source'] = SW.selector_for(ctx, 'workflow_installed_graph',
                                                                       graph['physical_key'], graph)
        if 'required_set' in edits:
            rs = edits['required_set'](rs)
        rs = self.integrated.bind_required_set(rs, born, receipts)
        b.commit()
        SW.put_values(ctx, [('workflow_required_set', rs['physical_key'], rs)])
        self.integrated.source_origin(rs_owner,'workflow_required_set',rs)
        h['required_set'] = (rs_owner.owner_id, rs_owner.issue(e.activation + '#/$defs/RequiredSetPhysical', rs,
                                                               kind='required_set'))
        st_owner = o['materialization:staging']
        b = SW.Binder(ctx, st_owner.owner_id, 'staging')
        staging = b.bind(whole['staging'])
        staging['physical_key'] = ctx.run_key('workflow_entrypoint_staging')
        staging['record'].update(entrypoint_worknode_ids=list(node_ids), dispatch_released=False,
                                 activation_id='TEST_ONLY:activation:' + ctx.token)
        staging['record']['required_set']['source'] = SW.selector_for(ctx, 'workflow_required_set',
                                                                     rs['physical_key'], rs)
        if 'staging' in edits:
            staging = edits['staging'](staging)
        b.commit()
        SW.put_values(ctx, [('workflow_entrypoint_staging', staging['physical_key'], staging)])
        h['staging'] = (st_owner.owner_id, st_owner.issue(e.activation + '#/$defs/EntryPointStagingPhysical',
                                                          staging, kind='staging'))
        ar_owner = o['materialization:activation_receipt']
        b = SW.Binder(ctx, ar_owner.owner_id, 'activation_receipt')
        ar = b.bind(whole['activation_receipt'])
        ar['physical_key'] = ctx.run_key('workflow_activation_receipt')
        ar['record'].update(receipt_id='TEST_ONLY:activation-receipt:' + ctx.token,
                            activation_id='TEST_ONLY:activation:' + ctx.token, issued_at_utc=ctx.now())
        ar['record']['required_set']['source'] = SW.selector_for(ctx, 'workflow_required_set', rs['physical_key'], rs)
        ar['record']['installed_workgraph']['source'] = SW.selector_for(ctx, 'workflow_installed_graph',
                                                                       graph['physical_key'], graph)
        ar['record']['entrypoints_staged']['source'] = SW.selector_for(ctx, 'workflow_entrypoint_staging',
                                                                      staging['physical_key'], staging)
        template = ar['record']['worknode_materialization_receipts'][0]
        ar['record']['worknode_materialization_receipts'] = [
            dict(copy.deepcopy(template), source=SW.selector_for(ctx, 'workflow_materialization_receipt',
                                                                r['physical_key'], r)) for r in receipts]
        for key in ar['record']['integrity_checks']:
            ar['record']['integrity_checks'][key] = True
        if 'activation_receipt' in edits:
            ar = edits['activation_receipt'](ar)
        b.commit()
        SW.put_values(ctx, [('workflow_activation_receipt', ar['physical_key'], ar)])
        h['activation_receipt'] = (ar_owner.owner_id, ar_owner.issue(
            e.activation + '#/$defs/ActivationReceiptPhysical', ar, kind='activation_receipt'))
        rd_owner = o['materialization:readiness']
        b = SW.Binder(ctx, rd_owner.owner_id, 'readiness')
        readiness = b.bind(whole['readiness'])
        for key in readiness:
            readiness[key]['satisfied'] = True
        if 'readiness' in edits:
            readiness = edits['readiness'](readiness)
        b.commit()
        h['readiness'] = (rd_owner.owner_id, rd_owner.issue(e.activation + '#/$defs/ReadinessSnapshot', readiness,
                                                            kind='readiness'))
        og_owner = o['materialization:origins']
        h['original_origins'] = (og_owner.owner_id, og_owner.issue(None, list(self.integrated.source_origins.values()), kind='original_origins'))
        from pm_goal_dg_int_activation import bootstrap
        if self.integrated.bootstrap_activation:bootstrap(self.integrated)
        # 6. launch chain and D01 current source (after native birth)
        launch = o['launch']
        h['launch'] = (launch.owner_id, launch.issue_whole(
            e.custody.replace('workflow_start_original_custody.v2', 'workflow_birth_association_source_join.v4')
            .replace('workflow_start_original_custody.v6', 'workflow_birth_association_source_join.v4')
            + '#/$defs/CurrentWorkflowLaunchChainRead', whole['prestart_launch_chain'], kind='launch_chain',
            edit=edits.get('launch')))
        self._issue_d01_current(whole['d01_current'], edits.get('d01_current'))
        # 7. Goal-control realm and runtime context
        goal = o['goal']
        birth = o['native'].resolve(h['native_birth'][1])[1]
        h['goal'] = (goal.owner_id, goal.issue_goal_argument('OriginalGoalArgument', edits.get('goal'),
                                                             native_body=birth['body'], birth_tx=birth['birth_tx']))
        runtime = dict(qualification=QUALIFICATION, actor_ref='TEST_ONLY:actor:' + ctx.token,
                       execution_role='user', requested_provider_ref='TEST_ONLY:provider:a',
                       effective_provider_ref='TEST_ONLY:provider:a', requested_model_ref='TEST_ONLY:model:a',
                       effective_model_ref='TEST_ONLY:model:a-2026', requested_account_ref='TEST_ONLY:account:1',
                       effective_account_ref='TEST_ONLY:account:1', write_mode='read_only',
                       certification_tier='lightweight', correlation_id='TEST_ONLY:correlation:' + ctx.token)
        if 'runtime' in edits:
            runtime = edits['runtime'](runtime)
        h['runtime'] = (o['runtime'].owner_id, o['runtime'].issue(None, runtime, kind='runtime_context'))
        return h


    def _issue_d01_current(self, skeleton_value, edit=None):
        """The original D01 reader acquires B1's real lineage, never scaffold heads."""
        e, ctx, o = self.edition, self.ctx, self.owners
        b = SW.Binder(ctx, o['d01'].owner_id, 'd01_current')
        cs = b.bind(copy.deepcopy(skeleton_value))
        native = o['native'].current()
        birth = self.integrated.birth_publication
        wf = cs['workflow']
        wf.update(current_body=copy.deepcopy(native['body']['record']),
                  current_control=copy.deepcopy(native['control']['record']),
                  head=copy.deepcopy(birth['head']['record']), heads=[copy.deepcopy(birth['head']['record'])],
                  birth=copy.deepcopy(birth['birth']['record']), birth_origin=copy.deepcopy(birth['origin']['record']),
                  update_chain=[copy.deepcopy(birth['update']['record'])],
                  origins=[copy.deepcopy(birth['origin']['record'])],
                  activation_origin=copy.deepcopy(birth['activation_origin']['record']), original_writer_origins=[])
        families=ST.d01_families(e)
        pointer=ctx.storage.cell(families['pointer'],o['d01'].pointer_key())['value']
        head=SW.resolve_selector(ctx.storage,pointer['record']['workflow_head'],'int/activation/prestart_head')
        def values(family):
            return [copy.deepcopy(c['value']) for c in ctx.storage.cells.get(family,{}).values()
                    if c['value'].get('record',{}).get('scope')==ctx.scope]
        wf['head']=head['record']
        wf['heads']=[v['record'] for v in sorted(values(families['workflow_head']),key=lambda v:v['record']['revision'])]
        wf['update_chain']=[v['record'] for v in sorted(values(families['workflow_update']),key=lambda v:v['record']['revision'])]
        wf['origins']=[v['record'] for v in values('executor_workflow_lineage_origin')]
        wf['original_writer_origins']=[dict(kind='activation_original',selection=physical(self.integrated,'workflow_native_activation_origin',key,c['value']),value=c['value'])
             for key,c in ctx.storage.cells.get('workflow_native_activation_origin',{}).items()]
        cs['pointer']=copy.deepcopy(pointer['record'])
        cs['run_control']['cancellation'] = None
        cs['run_control']['pending_operation_id'] = None
        b.commit()
        if edit:
            cs = edit(cs)
        e.bank.validate(e.d01 + '#/$defs/CurrentSource', cs, 'int/d01_birth_source')
        self.handles['d01_current'] = (o['d01'].owner_id, o['d01'].issue(
            e.d01 + '#/$defs/CurrentSource', cs, kind='d01_current'))


class D01(ST.D01Owner):
    """Current D01 graph from actual immutable lineage cells of this run."""
    def current_source(self,native):
        value=super().current_source(native)
        st=self.ctx.storage
        def values(schema_id):
            return [(family,key,copy.deepcopy(cell['value'])) for family,rows in st.cells.items() for key,cell in rows.items()
                if cell['value'].get('schema_id')==schema_id and cell['value'].get('record',{}).get('scope')==self.ctx.scope]
        wf=value['workflow']
        wf['update_chain']=[v['record'] for _,_,v in sorted(values('pm.storage_value.executor_workflow_workflow_update.v8'),key=lambda row:row[2]['record']['revision'])]
        wf['origins']=[v['record'] for _,_,v in values('pm.storage_value.executor_workflow_lineage_origin.v8')]
        wf['heads']=[v['record'] for _,_,v in sorted(values('pm.storage_value.executor_workflow_workflow_head.v8'),key=lambda row:row[2]['record']['revision'])]
        origins=[]
        schemas=[('pm.storage_value.workflow_start_origin.v6','original_workflow_start'),
                 ('pm.storage_value.workflow_standard_origin.v4','standard_original'),
                 ('pm.storage_value.workflow_activation_source_origin.v1','activation_original'),
                 ('pm.storage_value.workflow_cancel_origin.v1','d06_original')]
        # Activation originals share one schema with materialization. Only the
        # native activation publisher's table belongs to this workflow chain.
        for family,rows in st.cells.items():
            for key,cell in rows.items():
                v=cell['value']
                if family=='workflow_native_activation_origin':kind='activation_original'
                elif family=='workflow_start_origin':kind='original_workflow_start'
                elif family==ORIGIN:kind='standard_original'
                elif family=='workflow_cancel_origin' and v.get('record',{}).get('issuer_method')=='owner.workflow.executor_cancel.publish_disposition.v3':kind='d06_original'
                else:continue
                if v.get('record',{}).get('scope',self.ctx.scope)!=self.ctx.scope:continue
                origins.append(dict(kind=kind,selection=SW.selector_for(self.ctx,family,key,v),value=copy.deepcopy(v)))
        wf['original_writer_origins']=origins
        self.edition.bank.validate(self.edition.d01+'#/$defs/CurrentSource',value,'int/d01/current_graph')
        return value


def publication(world, *, kind, op, tx, issued_at, after_body, after_control, source_sha, goal_sha, standard=None):
    """Derive the complete native/D01 union over S2's per-revision model."""
    sw, st = world.sw, world.storage
    e, ctx = sw.edition, sw.ctx
    fam = ST.d01_families(e)
    native = sw.owners['native'].current()
    before_body, before_control = native['body'], native['control']
    pointer = st.cell(fam['pointer'], sw.owners['d01'].pointer_key())
    require('int/publication/pointer', pointer is not None)
    head_key = pointer['value']['record']['workflow_head']['physical_key']
    head = SW.resolve_selector(st, pointer['value']['record']['workflow_head'], 'int/publication/head')
    hrev = NR.uint64(head['record']['revision'] + 1, 'int/d01_revision')
    hkey = sw.owners['d01'].head_key(hrev)
    ukey = ctx.run_key('executor_workflow_workflow_update', op)
    okey = ctx.run_key('executor_workflow_lineage_origin', op)
    rkey = N.op_key('workflow_standard_result.v1', world.coord_scope(world.scope), op)
    nkey = N.op_key('workflow_standard_origin.v1', world.coord_scope(world.scope), op)
    owner = copy.deepcopy(ctx.workflow_owner)
    rs = copy.deepcopy(ctx.scope)
    k = N.KINDS[kind]
    sel = lambda family, key, val: physical(world, family, key, val)
    bs = sel(BODY, before_body['physical_key'], before_body)
    cs = sel(CONTROL, before_control['physical_key'], before_control)
    ba = sel(BODY, after_body['physical_key'], after_body)
    ca = sel(CONTROL, after_control['physical_key'], after_control)
    binding = None if standard is None else dict(
        source=sel('goal_receipt', standard['receipt_key'], standard['receipt']),
        origin=sel('workflow_standard_capture_origin', standard['capture_key'], standard['capture']))
    result = wrapper(N.FAMILY[N.T_RESULT][1], '4.0.0', dict(
        scope=rs, operation_id=op, transaction_id=tx, owner=owner, operation=k['operation'], before=bs, after=ba,
        original_source_argument_sha256=source_sha, original_goal_argument_sha256=goal_sha,
        workflow_receipt=None, standard_receipt=binding, issued_at_utc=issued_at), storage=st, key=rkey)
    origin = wrapper(N.FAMILY[N.T_ORIGIN][1], '4.0.0', dict(
        scope=rs, owner=owner, issuer_method=k['writer'], operation_id=op, transaction_id=tx,
        result=sel(RESULT, rkey, result), original_source_argument_sha256=source_sha,
        original_goal_argument_sha256=goal_sha, issued_at_utc=issued_at), storage=st, key=nkey)
    hs = sel(fam['workflow_head'], head_key, head)
    rsel, osel = sel(RESULT, rkey, result), sel(ORIGIN, nkey, origin)
    transition = dict(rule=k['rule'], before=sw.start.body_commitment(before_body, before_control),
                      after=sw.start.body_commitment(after_body, after_control), original_writer_method=k['writer'],
                      original_owner_result=rsel, original_owner_origin=osel)
    update = wrapper('pm.storage_value.executor_workflow_workflow_update.v8', '8.0.0', dict(
        scope=rs, operation_id=op, transaction_id=tx, revision=hrev, previous_head=hs, before_body=bs,
        before_control=cs, after_body=ba, after_control=ca, cause=k['cause'], original_owner_result=rsel,
        original_owner_origin=osel, transition=transition))
    new_head = wrapper('pm.storage_value.executor_workflow_workflow_head.v8', '8.0.0', dict(
        scope=rs, revision=hrev, activation_body=copy.deepcopy(head['record']['activation_body']),
        activation_origin=copy.deepcopy(head['record']['activation_origin']), current_body=ba, current_control=ca,
        previous_head=hs, last_update=sel(fam['workflow_update'], ukey, update),
        workflow_owner_ref=ctx.workflow_owner['owner_ref'], workflow_owner_epoch=ctx.workflow_owner['owner_epoch'],
        pending_operation_id=None))
    new_pointer = wrapper('pm.storage_value.executor_workflow_current_pointer.v2', '2.0.0', dict(
        scope=rs, revision=NR.uint64(pointer['value']['record']['revision'] + 1, 'int/pointer_revision'),
        workflow_head=sel(fam['workflow_head'], hkey, new_head), inventory_head=None, scheduler_control=None,
        last_origin_operation_id=op, pending_operation_id=None))
    mutation = wrapper('pm.storage_value.executor_workflow_lineage_origin.v8', '8.0.0', dict(
        scope=rs, method='owner.executor.workflow_source.update_workflow.v3', operation_id=op, transaction_id=tx,
        owner=owner, causation=osel,
        preimages=[bs, cs, hs, sel(fam['pointer'], sw.owners['d01'].pointer_key(), pointer['value'])],
        afterimages=dict(workflow_update=sel(fam['workflow_update'], ukey, update),
                         workflow_head=sel(fam['workflow_head'], hkey, new_head),
                         pointer=sel(fam['pointer'], sw.owners['d01'].pointer_key(), new_pointer)), issued_at_utc=issued_at))
    for root, value in [('StorageWorkflowResult', result), ('StorageWorkflowOrigin', origin)]:
        W.realm_bank().validate('native', N.V4 + root, value, 'int/publication/' + root)
    for root, value in [('StorageWorkflowUpdate', update), ('StorageWorkflowHead', new_head),
                        ('StorageCurrentPointer', new_pointer), ('StorageWorkflowMutationOrigin', mutation)]:
        e.bank.validate(e.d01 + '#/$defs/' + root, value, 'int/publication/' + root)
    for root, value in [('GoalRunBodyPhysical', after_body), ('GoalRunControlPhysical', after_control)]:
        e.bank.validate(e.activation + '#/$defs/' + root, value, 'int/publication/' + root)
    values = dict(native_after_body=after_body, native_after_control=after_control, native_result=result,
                  native_origin=origin, d01_update=update, d01_head=new_head, d01_origin=mutation, d01_pointer=new_pointer)
    keys = dict(native_after_body=(BODY, after_body['physical_key']),
                native_after_control=(CONTROL, after_control['physical_key']), native_result=(RESULT, rkey),
                native_origin=(ORIGIN, nkey), d01_update=(fam['workflow_update'], ukey),
                d01_head=(fam['workflow_head'], hkey), d01_origin=('executor_workflow_lineage_origin', okey),
                d01_pointer=(fam['pointer'], sw.owners['d01'].pointer_key()))
    values['native_pointer'] = dict(qualification=QUALIFICATION,body_key=after_body['physical_key'],
                                   control_key=after_control['physical_key'],revision=after_body['record']['revision'])
    keys['native_pointer'] = (CURRENT,sw.owners['native'].current_key())
    writes = [dict(table=t,key=key,expected=(pointer['version'] if name=='d01_pointer' else
                      native['pointer']['version'] if name=='native_pointer' else None),value=values[name])
              for name,(t,key) in keys.items()]
    return dict(values=values, keys=keys, writes=writes, before_body=before_body, before_control=before_control,
                before_head=head, transition=transition)


class Native(F.NativeRunOwner):
    """CF1's successful chain over the S2 wrappers and pointers."""
    @property
    def storage(self):
        return self.world.storage

    def birth_key(self, scope):
        return self.world.sw.ctx.run_key(BIRTH)

    def _publish(self, scope, rule, body_changes, extra=(), *, require_status=None):
        w, sw = self.world, self.world.sw
        current = sw.owners['native'].current()
        body = current['body']['record']
        if require_status is not None:
            require('native/status/' + rule, body['status'] in require_status)
        after = copy.deepcopy(current['body'])
        for name, value in body_changes.items():
            after['record'][name] = copy.deepcopy(value)
        rev = NR.uint64(body['revision'] + 1, 'native/body_revision')
        after['record']['revision'] = rev
        after['physical_key'] = sw.owners['native'].body_key(rev)
        control = copy.deepcopy(current['control'])
        control['physical_key'] = sw.owners['native'].control_key(rev)
        control['record'].update(revision=rev, body_record_sha256=SW.cdigest(after['record']))
        kind = 'provisional' if rule == 'original_provisional_success' else 'progress'
        op, issued = self.next_op(rule), w.storage.now()
        def build(tx):
            p = publication(w, kind=kind, op=op, tx=tx, issued_at=issued, after_body=after, after_control=control,
                            source_sha=W.sha(W.sj(current)), goal_sha=W.sha(W.sj(sw.owners['goal'].current_argument())))
            if rule == 'original_verifying':
                # The bound v7 rule remains progress; the after-state is the native verifying state.
                require('int/verifying_from_provisional', body['status'] == 'provisional_success')
            self.last_publication = p
            return p['writes'] + list(extra)
        with self.recorder.call(self.owner_id, 'native_publish:' + rule):
            return w.storage.transact_stamped(build, writer=dict(owner_id=self.owner_id, owner_epoch=self.owner_epoch,
                                                                 operation_id=op))

    def start(self, scope):
        sw = self.world.sw
        require('int/start_unissued', not hasattr(self.world, 'original_start'))
        result = sw.start.commit_start(IW.start_request(sw), dict(sw.handles))
        self.world.original_start = SR.original_started(sw, where='int/s1_original')
        return result

    def body(self, scope):
        value = self.world.sw.owners['native'].current()['body']
        return self.storage.cell(BODY, value['physical_key'])

    def control(self, scope):
        value = self.world.sw.owners['native'].current()['control']
        return self.storage.cell(CONTROL, value['physical_key'])

    def state(self, scope):
        w, sw = self.world, self.world.sw
        current = sw.owners['native'].current()
        b = current['body']['record']
        bc = self.storage.cell(BODY, current['body']['physical_key'])
        cc = self.storage.cell(CONTROL, current['control']['physical_key'])
        d01 = sw.owners['d01'].current_source(current)
        wf = d01['workflow']
        k = self.k(scope)
        def rows(table):
            return {key: copy.deepcopy(c['value']) for key, c in self.storage.cells.get(table, {}).items()
                    if key.startswith(k + ':')}
        body = dict(qualification=QUALIFICATION, goal_run_id=scope['goal_run_id'], goal_id=scope['goal_id'],
                    project_id=scope['project_id'], workgraph_id=scope['workgraph_id'], status=b['status'],
                    body_revision=b['revision'], certification_receipt=b.get('certification_receipt'),
                    required_worknodes=list(w.values['worknodes']), writer_contract='pm.executor.workflow_source.all_writers.v7')
        head = dict(revision=wf['head']['revision'], body_revision=b['revision'], body_sha256=F.hsj(body))
        updates, origins = {}, {}
        for i, u in enumerate(wf['update_chain']):
            key = '%s:%d' % (k, u['revision'])
            before, after = u['transition']['before'], u['transition']['after']
            updates[key] = dict(rule=u['transition']['rule'], before_body_revision=None if before is None else before['body_revision'],
                                after_body_revision=after['body_revision'], before_status=None if before is None else before['status'],
                                after_status=after['status'])
            matches = [o for o in wf['origins'] if o['operation_id'] == u['operation_id'] and
                       o['transaction_id'] == u['transaction_id']]
            require('int/d01/update_origin', len(matches) == 1)
            require('int/d01/origin_owner', matches[0]['owner']['owner_ref'] == sw.ctx.workflow_owner['owner_ref'])
            origins[key] = dict(rule=u['transition']['rule'], body_revision=after['body_revision'],
                                issuer=matches[0]['owner']['owner_ref'])
        return dict(body=body, body_version=current['pointer']['version'], body_tx=bc['tx'],
                    control=dict(control_revision=current['control']['record']['revision'], body_sha256=F.hsj(body)),
                    head=head, head_version=wf['head']['revision'], birth=w.birth_publication['birth']['record'],
                    worknodes={v['worknode_id']: v for v in rows(F.T_WORKNODE).values()}, attempts=rows(F.T_ATTEMPT),
                    validators=rows(F.T_VALIDATOR), auditors=rows(F.T_AUDITOR),
                    criteria={v['criterion_id']: v for v in rows(F.T_CRITERION).values()},
                    blockers=[v for v in rows(F.T_BLOCKER).values() if v['active']], artifacts=rows(F.T_ARTIFACT),
                    docsets=rows(F.T_DOCSET), updates=updates, origins=origins, native_owner=sw.ctx.workflow_owner['owner_ref'],
                    source_control=(self.storage.cell(F.T_SOURCE_CONTROL, k) or {}).get('value'),
                    whole_body=current['body'], whole_control=current['control'], d01_current=d01)

    def _project(self, value, scope, state, decision, cur, gates):
        super()._project(value, scope, state, decision, cur, gates)
        wf = value[cur]
        sw, w = self.world.sw, self.world
        # The whole original Start is independently acquired from S1 on every entry.
        original = SR.original_started(sw, where='int/cf1/start')
        wf['original_start'] = dict(d01_current=copy.deepcopy(state['d01_current']),
                                    **{k: copy.deepcopy(original['native_start'][k]) for k in
                                       ('control', 'initial_control_origin', 'commit', 'origin')})
        src = sw.start.acquire_all(dict(sw.handles))[0]
        req = wf['requirements']
        for name in ('seven_original_inputs', 'original_activation_sources'):
            req[name] = {k: copy.deepcopy(src[('input:' if name == 'seven_original_inputs' else 'activation:') + k])
                         for k in (SW.SEVEN_INPUTS if name == 'seven_original_inputs' else SW.ACTIVATION_SOURCES)}
        req['installed_graph'], req['required_set'] = copy.deepcopy(src['installed_graph']), copy.deepcopy(src['required_set'])
        req['completion_requirements'] = copy.deepcopy(src['activation:completion_requirements']['source'])

    def compose_source(self, scope, state, decision):
        key = F.hsj([state,decision])
        cache = self.__dict__.setdefault('_source_roots',{})
        if key not in cache:
            cache[key] = super().compose_source(scope,state,decision)
        return copy.deepcopy(cache[key])

    def compose_current(self, scope, state):
        key = F.hsj(state)
        cache = self.__dict__.setdefault('_current_roots',{})
        if key not in cache:
            cache[key] = super().compose_current(scope,state)
        return copy.deepcopy(cache[key])

    def prepare_certified(self, scope, *, standard, decision_check):
        from pm_goal_dg_int_sources import candidate
        return candidate(self,scope,standard=standard,decision_check=decision_check)


class Goal(F.GoalOwner):
    """CF1 view over the actual S1 Goal/binding/Stop source, without a second Goal store."""
    def current(self, goal_id):
        w, sw = self.world, self.world.sw
        require('int/goal_identity', goal_id == sw.ctx.goal_id)
        g = sw.owners['goal'].current_argument()
        refs = sw.owners['goal'].inventory('OriginalGoalArgument')
        cells = sw.owners['goal'].cells[refs[0]]
        def version(name):
            return w.storage.cell(*cells[name])['version']
        b, c, br = g['body']['record'], g['control']['record'], g['binding_revision']['record']
        return (dict(version=version('body'), value=dict(goal_id=goal_id, project_id=b['project_id'],
                      thread_id=b['thread_id'], goal_revision=b['revision'], state=b['state'])),
                dict(version=version('control'), value=dict(stop_state='accepted' if g['stop']['record']['latched'] else 'none',
                      stop_epoch=g['stop']['record']['user_stop_epoch'], control_revision=c['control_epoch'])),
                dict(version=w.storage.cell(*cells['binding_revision'])['version'],
                     value=dict(bound_goal_run_id=br['active_run_ref'], binding_epoch=br['binding_revision'])))

    def argument(self, name, goal_id):
        require('int/goal_argument_kind', name == 'CurrentGoalArgument')
        whole = self.world.sw.owners['goal'].current_argument()
        body, control, binding = self.current(goal_id)
        F.rvalidate(name, whole, 'int/goal/current')
        return self._issue(None, dict(argument=whole, goal_body_version=body['version'],
             goal_control_version=control['version'], goal_binding_version=binding['version'],
             stop_state=control['value']['stop_state'], stop_epoch=control['value']['stop_epoch'],
             bound_goal_run_id=binding['value']['bound_goal_run_id'], goal_revision=body['value']['goal_revision'],
             thread_id=body['value']['thread_id']), kind=name)

    def stop(self, goal_id):
        self.world.sw.owners['goal'].latch_stop()


class World(F.World):
    """Whole native-v7 execution world shared by S2 and CF1/CF2/CF3."""
    def __init__(self, work, *, values=None, profile_kw=None, authentic_goal=True, **kw):
        self.work = Path(work)
        self.bootstrap_activation=kw.get('bootstrap_activation',True)
        v = values or F.default_values()
        self.sw = StartWorld(self.work/'s2', SW.v7_edition(), project=v['project_id'], goal=v['goal_id'],
                             run=v['goal_run_id'],thread=v['thread_id'],segment_target_bytes=kw.get('segment_target_bytes',65536))
        sw = self.sw
        sw.storage.__class__ = Storage
        sw.storage._tx_handles = weakref.WeakKeyDictionary()
        sw.storage.lane_cut_point = None
        self.storage = self.goal_store = sw.storage
        self.registry, self.recorder = sw.registry, sw.recorder
        self.rng = random.Random()
        self.values = copy.deepcopy(v)
        self.expected_profile_digest = (F.ROOT/F.COORD_PKG/'installed-profile-digest.txt').read_text().strip()
        self.expected_producer_digest = (F.ROOT/F.PRODUCER_PKG/'native-v7/installed-profile-digest.txt').read_text().strip()
        self.profile = F.ProfileOwner(self.registry, self, **(profile_kw or {}))
        self.profile_handle = self.profile.select()
        self.profile_sha = self.expected_profile_digest
        if authentic_goal:
            from pm_goal_dg_int_goal import Bridge
            self.goal_bridge=Bridge(sw)
            self.values.update(project_id=sw.ctx.project_id,goal_id=sw.ctx.goal_id,thread_id=sw.ctx.thread_id)
        sw.build_owners()
        if authentic_goal:
            from pm_goal_dg_int_goal import Goal as StartGoal
            sw._owner('goal',StartGoal)
            sw.owners['goal'].bridge=self.goal_bridge
        sw._owner('d01', D01)
        sw._owner('native',StartNative)
        sw.start=StartOwner(sw.registry,world=sw)
        sw.owners['start']=sw.start
        sw.owners['native'].integrated = self
        sw.integrated = self
        self.realm = W.realm_bank()
        self.typed_calls=[]
        self.hooks=dict(kw.get('hooks') or {})
        self.lane_cut=None
        self.lane_mode='raise'
        self.d01_store=self.storage
        self.native = Native(self.registry, self)
        self.goal = Goal(self.registry, self)
        self.final = F.FinalDecisionOwner(self.registry, self)
        from pm_goal_dg_int_sources import Standard, NativeSource
        self.standard = Standard(self.registry, self)
        self.native_source = NativeSource(self.registry, self)
        for name, cls in [('assignment', F.AssignmentOwner), ('invocation', F.InvocationOwner),
                          ('resolver', F.ResolverOwner), ('references', F.ReferenceOwner),
                          ('causality', F.CausalOwner), ('partition', F.PartitionRouteOwner),
                          ('identity', F.WholeIdentityOwner), ('producer', F.WholeProducer)]:
            setattr(self, name, cls(self.registry, self))
        self.appender = sw.appender
        self.source_origins = {}
        sw.issue_sources()
        self.values.update(workgraph_id=sw.ctx.workgraph_id, workgraph_revision=sw.ctx.workgraph_revision,
                           workgraph_sha256=sw.ctx.workgraph_sha256, worknodes=list(sw.node_ids))
        rows = [dict(table=F.T_WORKNODE, key=self.native.k(self.scope)+':'+S.k_component(wn), expected=None,
                      value=dict(worknode_id=wn, lifecycle='queued', attempt_id=None, receipt_id=None, revision=1, required=True))
                for wn in sw.node_ids]
        self.storage.transact(rows)
        from pm_goal_dg_int_coordinator import Coordinator,Guard,Disclosure,Identity
        self.permission=W.PermissionOwner(self.registry,self.storage)
        self.permission.grant(self.scope['goal_run_id'])
        self.disclosure=Disclosure(self.registry,self)
        self.disclosure.enroll(self.scope)
        self.group=W.GroupCommitOwner(self.registry,self.storage)
        self.guard=Guard(self.registry,self)
        self.coordinator=Coordinator(self.registry,self)
        self.identity=Identity(self.registry,self)

    cut=W.World.cut
    hook=W.World.hook

    def export_launch_sources(self):
        """The actual source issuers publish their whole pre-birth originals."""
        sw,ca=self.sw,self.goal_bridge.world
        self.launch_source_values={}
        self.launch_source_authorities={}
        before=ca.goal.body_cell(self.goal_bridge.route.scope)['value']
        self.launch_goal_before=copy.deepcopy(before)
        self.launch_goal_before_key='TEST_ONLY:goal-body-history:'+SW.cdigest(before)
        SW.put_values(sw.ctx,[(ca.goal.BODY,self.launch_goal_before_key,before)])
        ca.goal._issue(None,dict(value=before,original_current_key=ca.goal.keys(self.goal_bridge.route.scope)['body'],
                                snapshot_key=self.launch_goal_before_key),kind='workflow_launch_goal_snapshot')
        allocation=self.goal_bridge.route.wf_run['lineage']['allocation']['allocation']['identity']
        self.launch_reservation=dict(project_id=sw.ctx.project_id,goal_id=sw.ctx.goal_id,goal_run_id=sw.ctx.goal_run_id,
            plan_compile_run_id=sw.ctx.plan_compile_run_id,activation_id='TEST_ONLY:activation:'+sw.ctx.token,
            idempotency_key=allocation['native_idempotency_key'],
            original_goal_body=physical(self,ca.goal.BODY,self.launch_goal_before_key,before),
            execution_owner_ref=sw.ctx.workflow_owner['owner_ref'],execution_owner_epoch=sw.ctx.workflow_owner['owner_epoch'])
        methods=dict(native_compile='owner.workflow.compile.issue_native.v1',certified_graph='owner.workflow.compile.issue_graph.v1',
                     activation_decision='owner.executor.activation.decide.v1')
        for name in ('native_compile','certified_graph','activation_decision'):
            oid,handle=sw.handles['activation:'+name]
            source_owner=sw.registry.owner(oid,sw.registry.roster()[oid])
            whole=A.acquire(sw.registry,oid,source_owner.role,handle)[1]
            physical_source=copy.deepcopy(whole['source'])
            if name=='native_compile':physical_source['record']['launch_identity_reservation']=copy.deepcopy(self.launch_reservation)
            if name=='certified_graph':
                compile_source=self.launch_source_values['native_compile']
                family=compile_source['source']['schema_id'].removeprefix('pm.storage_value.').rsplit('.v',1)[0]
                physical_source['record']['source_compile']=self.binding(family,compile_source['source'],compile_source['origin'])
            whole['source']=physical_source
            family=physical_source['schema_id'].removeprefix('pm.storage_value.').rsplit('.v',1)[0]
            key=physical_source['physical_key']
            SW.put_values(sw.ctx,[(family,key,physical_source)])
            _,authority=ca.permissions.grant(oid,self.goal_bridge.route.scope,'workflow.activation.issue:'+name)
            snapshots={}
            for label,owner,table,skey in [('stop',ca.host_stop,ca.host_stop.FAMILY,ca.host_stop.key(self.goal_bridge.route.scope)),
                                         ('cancellation',ca.goal,ca.goal.CONTROL,ca.goal.keys(self.goal_bridge.route.scope)['control'])]:
                value=ca.value(table,skey)
                snapshot_key=sw.ctx.run_key('TEST_ONLY:activation_protected_snapshot',name,label)
                SW.put_values(sw.ctx,[(table,snapshot_key,value)])
                owner._issue(None,dict(value=value,original_current_key=skey,snapshot_key=snapshot_key),kind='activation_source_snapshot')
                snapshots[label]=physical(self,table,snapshot_key,value)
            origin=copy.deepcopy(whole['origin'])
            origin['physical_key']=sw.ctx.run_key('workflow_original_source_origin','launch:'+name)
            permission=ca.permissions.current(authority)
            origin['record'].update(issuer_method=methods[name],owner_ref=oid,owner_epoch=source_owner.owner_epoch,
                original_operation_id=sw.ctx.run_key('TEST_ONLY:launch_source_issue',name),original_causation_ref=key,
                issued_at_utc=sw.ctx.now(),issued_value_key=key,issued_record_sha256=SW.cdigest(physical_source['record']),source_bindings=[],
                actual_permission_source=physical(self,ca.permissions.FAMILY,authority,permission),
                actual_stop_source=snapshots['stop'],actual_cancellation_source=snapshots['cancellation'])
            sw.edition.bank.validate(sw.edition.activation+'#/$defs/OwnerIssueOriginPhysical',origin,'int/launch/'+name)
            SW.put_values(sw.ctx,[('workflow_original_source_origin',origin['physical_key'],origin)])
            whole['origin']=origin
            uri=sw.edition.custody.replace('workflow_start_original_custody.v6','workflow_birth_association_source_join.v4')
            root={'native_compile':'NativeCompileSourceWithOrigin','activation_decision':'ActivationDecisionSourceWithOrigin','certified_graph':'CertifiedGraphSourceWithOrigin'}[name]
            sw.edition.bank.validate(uri+'#/$defs/'+root,whole,'int/launch/whole/'+name)
            handle=source_owner.issue(uri+'#/$defs/'+root,whole,kind='integrated_launch_source')
            sw.handles['activation:'+name]=(oid,handle)
            self.source_origins[(family,key)]=origin
            self.launch_source_values[name]=whole
            self.launch_source_authorities[name]=(oid,authority)

    def source_origin(self, owner, family, value):
        """The issuing source owner records its own exact physical issuance."""
        sw, ctx = self.sw, self.sw.ctx
        prior = self.source_origins.get((family,value['physical_key']))
        if prior is not None:
            require('int/source_origin/custody', SW.read_value(self.storage,family,value['physical_key'])['value']==value)
            return copy.deepcopy(prior)
        key = ctx.run_key('workflow_original_source_origin', family, value['physical_key'])
        b = SW.Binder(ctx, owner.owner_id, 'origin:' + family + ':' + value['physical_key'])
        origin = b.bind(SW.skeleton(sw.edition.bank, sw.edition.activation+'#/$defs/OwnerIssueOriginPhysical'))
        b.commit()
        origin['physical_key'] = key
        origin['record'].update(issuer_method=('owner.workflow.activation.commit_materialized.v1' if family in
                ('workflow_installed_graph','workflow_required_set') else 'owner.executor.activation.materialize.v1'),
            owner_ref=owner.owner_id, owner_epoch=owner.owner_epoch,
            original_operation_id='TEST_ONLY:issue:'+ctx.token+':'+family+':'+str(owner._sequence),
            original_causation_ref='TEST_ONLY:materialization:'+ctx.token,
            issued_at_utc=ctx.now(), issued_value_key=value['physical_key'],
            issued_record_sha256=SW.cdigest(value['record']))
        sw.edition.bank.validate(sw.edition.activation+'#/$defs/OwnerIssueOriginPhysical',origin,'int/source_origin')
        SW.put_values(ctx,[('workflow_original_source_origin',key,origin)])
        owner.issue(sw.edition.activation+'#/$defs/OwnerIssueOriginPhysical',origin,kind='materialization_origin')
        self.source_origins[(family,value['physical_key'])] = origin
        return origin

    def binding(self, family, value, origin):
        return dict(source=physical(self,family,value['physical_key'],value),
                    origin=physical(self,'workflow_original_source_origin',origin['physical_key'],origin))

    def bind_required_set(self, rs, born, receipts):
        """Link actual independently materialized originals before this owner issues the set."""
        sw = self.sw
        acquire = lambda name:A.acquire(sw.registry,sw.handles[name][0],'materialization:graph',sw.handles[name][1])[1]
        graph = acquire('installed_graph')
        graph_origin = self.source_origin(sw.owners['materialization:graph'],'workflow_installed_graph',graph)
        template = copy.deepcopy(rs['record']['members'][0])
        members=[]
        for node, receipt in zip(born,receipts):
            no = self.source_origin(sw.owners['materialization:worknodes'],'workflow_born_worknode',node)
            ro = self.source_origin(sw.owners['materialization:receipts'],'workflow_materialization_receipt',receipt)
            member = copy.deepcopy(template)
            member.update(worknode_id=node['record']['worknode_id'],
                born_worknode=self.binding('workflow_born_worknode',node,no),
                materialization_receipt=self.binding('workflow_materialization_receipt',receipt,ro),
                required_criterion_ids=list(self.values['criteria']),
                required_validator_ids=['TEST_ONLY:validator:'+node['record']['worknode_id']])
            members.append(member)
        rs['record']['members']=members
        rs['record']['installed_workgraph']=self.binding('workflow_installed_graph',graph,graph_origin)
        sw.edition.bank.validate(sw.edition.activation+'#/$defs/RequiredSetPhysical',rs,'int/required_set')
        # Its origin is issued after the caller stores the set; body binding resolves it at Start.
        return rs

    def coissue_birth(self, writes, tx):
        sw, st = self.sw, self.storage
        e, ctx = sw.edition, sw.ctx
        body = next(x['value'] for x in writes if x['table'] == BODY)
        control = next(x['value'] for x in writes if x['table'] == CONTROL)
        activation=next(x['value'] for x in writes if x['table']=='workflow_start_control_origin')
        joint=self.goal_bridge.joint_writes(body,control,activation,tx) if hasattr(self,'goal_bridge') else []
        if joint:activation=self.goal_bridge.joint_result['native_origins']['workflow_birth_body']
        activation_family='workflow_original_source_origin' if joint else 'workflow_start_control_origin'
        fam = ST.d01_families(e)
        op = activation['record']['original_operation_id']
        issued_at = ctx.now()
        sel = lambda family, key, value: physical(self, family, key, value)
        bk = ctx.run_key(BIRTH)
        birth = wrapper('pm.storage_value.executor_workflow_workflow_birth.v8', '8.0.0', dict(
            scope=copy.deepcopy(ctx.scope), operation_id=op, transaction_id=tx,
            activation_body=sel(BODY, body['physical_key'], body), activation_control=sel(CONTROL, control['physical_key'], control),
            activation_origin=sel(activation_family, activation['physical_key'], activation),
            writer_contract='pm.executor.workflow_source.all_writers.v7', installed_contract_digest=self.profile_sha,
            birth_issuance=sw.start.body_commitment(body, control)))
        bsel = sel(BIRTH, bk, birth)
        rev = 1
        uk, hk, ok = ctx.run_key('executor_workflow_workflow_update', op), sw.owners['d01'].head_key(rev), ctx.run_key('executor_workflow_lineage_origin',op)
        update = wrapper('pm.storage_value.executor_workflow_workflow_update.v8', '8.0.0', dict(
            scope=copy.deepcopy(ctx.scope), operation_id=op, transaction_id=tx, revision=rev, previous_head=None,
            before_body=None, before_control=None, after_body=sel(BODY,body['physical_key'],body),
            after_control=sel(CONTROL,control['physical_key'],control), cause='activation',
            original_owner_result=bsel, original_owner_origin=sel(activation_family,activation['physical_key'],activation),
            transition=dict(rule='activation_begin',before=None,after=sw.start.body_commitment(body,control),
              original_writer_method='owner.workflow.activation.begin.v1', original_owner_result=bsel,
              original_owner_origin=sel(activation_family,activation['physical_key'],activation))))
        head = wrapper('pm.storage_value.executor_workflow_workflow_head.v8','8.0.0',dict(
            scope=copy.deepcopy(ctx.scope),revision=rev,activation_body=sel(BODY,body['physical_key'],body),
            activation_origin=sel(activation_family,activation['physical_key'],activation),
            current_body=sel(BODY,body['physical_key'],body),current_control=sel(CONTROL,control['physical_key'],control),
            previous_head=None,last_update=sel(fam['workflow_update'],uk,update),workflow_owner_ref=ctx.workflow_owner['owner_ref'],
            workflow_owner_epoch=ctx.workflow_owner['owner_epoch'],pending_operation_id=None))
        pk = sw.owners['d01'].pointer_key()
        pointer = wrapper('pm.storage_value.executor_workflow_current_pointer.v2','2.0.0',dict(
            scope=copy.deepcopy(ctx.scope),revision=rev,workflow_head=sel(fam['workflow_head'],hk,head),inventory_head=None,
            scheduler_control=None,last_origin_operation_id=op,pending_operation_id=None))
        origin = wrapper('pm.storage_value.executor_workflow_lineage_origin.v8','8.0.0',dict(
            scope=copy.deepcopy(ctx.scope),method='owner.executor.workflow_source.enroll_workflow_birth.v3',operation_id=op,
            transaction_id=tx,owner=copy.deepcopy(ctx.workflow_owner),causation=bsel,preimages=[],
            afterimages=dict(workflow_birth=bsel,workflow_head=sel(fam['workflow_head'],hk,head),
                workflow_update=sel(fam['workflow_update'],uk,update),pointer=sel(fam['pointer'],pk,pointer)),issued_at_utc=issued_at))
        for root,value in [('StorageWorkflowBirth',birth),('StorageWorkflowUpdate',update),('StorageWorkflowHead',head),
                           ('StorageCurrentPointer',pointer),('StorageWorkflowMutationOrigin',origin)]:
            e.bank.validate(e.d01+'#/$defs/'+root,value,'int/b1/'+root)
        self.values.update(workgraph_id=ctx.workgraph_id, workgraph_sha256=ctx.workgraph_sha256)
        scope = self.coord_scope(self.scope)
        birth_key, control_key = W.family_key('birth',scope), W.family_key('control',scope)
        cb = W.wrap('birth',dict(scope=scope,owner=dict(owner_id=self.native.owner_id,owner_epoch=self.native.owner_epoch,operation_id=op),
            profile_sha256=self.profile_sha,original_native_birth=W.selector(bk,birth),initial_control_key=control_key,
            initial_control_epoch=0,initial_phase='empty',issued_at_utc=issued_at,transaction_id=tx))
        cc = W.wrap('control',dict(scope=scope,epoch=0,phase='empty',intent=None,event_phase=None,commit=None,origin=None,
                                  release=None,birth=W.selector(birth_key,cb)))
        for name,value in [('StorageBirth',cb),('StorageControl',cc)]:
            self.realm.validate('coordinator',W.COORD+name,value,'int/b1/'+name)
        whole_publication=dict(birth=birth['record'],head=head['record'],pointer=pointer['record'],body=body['record'],
                               control=control['record'],original_activation_origin=activation['record'],origin=origin['record'])
        e.bank.validate(e.d01+'#/$defs/WorkflowBirthPublication',whole_publication,'int/b1/whole_publication')
        self.birth_publication = dict(birth=birth,update=update,head=head,pointer=pointer,origin=origin,
                                     activation_origin=activation,tx_id=tx,coordinator_birth=cb,coordinator_control=cc,whole=whole_publication)
        extra=[dict(table=t,key=k,expected=None,value=v) for t,k,v in [(BIRTH,bk,birth),(fam['workflow_update'],uk,update),
               (fam['workflow_head'],hk,head),(fam['pointer'],pk,pointer),('executor_workflow_lineage_origin',ok,origin),
               (W.family_table('birth'),birth_key,cb),(W.family_table('control'),control_key,cc)]]
        extra.append(dict(table=W.TX_ISSUANCE,key=tx,expected=None,value=dict(qualification=QUALIFICATION,
            transaction_id=tx,issued_at_utc=issued_at,writer=dict(owner_id=self.native.owner_id,
                owner_epoch=self.native.owner_epoch,operation_id=op))))
        extra+=joint
        from pm_goal_dg_int_birth import arguments,validate
        self.birth_operands=arguments(self,body,control,birth,cb,cc)
        self.hook('after_helper:birth',self.birth_operands)
        validate(self,self.birth_operands)
        return extra
