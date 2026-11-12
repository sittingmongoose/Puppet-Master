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
                history.setdefault((x['table'], x['key']), []).append(SW.cdigest(x['value']))
        return out

    def committed_version(self, family, key, digest):
        versions = self.__dict__.get('version_history', {}).get((family, key), [])
        cell = self.cell(family, key)
        return bool(versions) and cell is not None and SW.cdigest(cell['value']) == versions[-1] and digest in versions


class StartNative(ST.NativeOwner):
    """S2's birth, with native v8 Birth and coordinator B1 members coissued."""
    def birth_run(self, *args, **kw):
        st = self.ctx.storage
        require('int/birth_coissuer_available', getattr(st, '_birth_coissuer', None) is None)
        st._birth_coissuer = self.integrated.coissue_birth
        try:
            return super().birth_run(*args, **kw)
        finally:
            st._birth_coissuer = None

    def body_wrapper(self, revision, status, activation_state, activation_revision, edit=None):
        # S2 births the pre-Start snapshot. Its materialization owners have already
        # issued the exact originals that this initial snapshot selects.
        value = super().body_wrapper(revision,status,activation_state,activation_revision)
        w, sw = self.integrated, self.integrated.sw
        for field, family, name in [('required_set','workflow_required_set','required_set'),
                                    ('installed_workgraph','workflow_installed_graph','installed_graph')]:
            owner_id, handle = sw.handles[name]
            original = A.acquire(sw.registry,owner_id,'materialization:'+('graph' if name=='installed_graph' else name),handle)[1]
            value['record'][field] = w.binding(family,original,w.source_origins[(family,original['physical_key'])])
        return edit(value) if edit else value


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
        # S2 pre-Start native birth, after all materialization originals exist
        h['native_birth'] = (o['native'].owner_id, o['native'].birth_run(h['descriptor'][1], h['descriptor'][0],
                                                                       edits.get('native_body'),
                                                                       edits.get('native_origin'))[0])
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
        cs['pointer'] = copy.deepcopy(birth['pointer']['record'])
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
    def current_source(self, native):
        value = super().current_source(native)
        st, fam = self.ctx.storage, ST.d01_families(self.edition)
        def rows(family):
            return [copy.deepcopy(c['value']) for c in st.cells.get(family, {}).values()
                    if c['value'].get('record', {}).get('scope') == self.ctx.scope]
        wf = value['workflow']
        wf['update_chain'] = [v['record'] for v in sorted(rows(fam['workflow_update']), key=lambda v:v['record']['revision'])]
        wf['origins'] = [v['record'] for v in rows('executor_workflow_lineage_origin')]
        wf['heads'] = [v['record'] for v in sorted(rows(fam['workflow_head']), key=lambda v:v['record']['revision'])]
        origins = []
        for family, kind in [('workflow_start_origin', 'original_workflow_start'), (ORIGIN, 'standard_original')]:
            for v in rows(family):
                key = v.get('physical_key')
                require('int/d01/origin_key', key is not None)
                origins.append(dict(kind=kind,selection=SW.selector_for(self.ctx,family,key,v),value=v))
        wf['original_writer_origins'] = origins
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
    def __init__(self, work, *, values=None, profile_kw=None, **kw):
        self.work = Path(work)
        v = values or F.default_values()
        self.sw = StartWorld(self.work/'s2', SW.v7_edition(), project=v['project_id'], goal=v['goal_id'],
                             run=v['goal_run_id'], thread=v['thread_id'])
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
        sw.build_owners()
        sw._owner('d01', D01)
        sw._owner('native', StartNative)
        sw.owners['native'].integrated = self
        sw.integrated = self
        self.realm = W.realm_bank()
        self.typed_calls=[]
        self.hooks={}
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
        self.group=W.GroupCommitOwner(self.registry,self.storage)
        self.guard=Guard(self.registry,self)
        self.coordinator=Coordinator(self.registry,self)
        self.identity=Identity(self.registry,self)

    cut=W.World.cut
    hook=W.World.hook

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
        activation = next(x['value'] for x in writes if x['table'] == 'workflow_start_control_origin')
        fam = ST.d01_families(e)
        op = activation['record']['original_operation_id']
        issued_at = ctx.now()
        sel = lambda family, key, value: physical(self, family, key, value)
        bk = ctx.run_key(BIRTH)
        birth = wrapper('pm.storage_value.executor_workflow_workflow_birth.v8', '8.0.0', dict(
            scope=copy.deepcopy(ctx.scope), operation_id=op, transaction_id=tx,
            activation_body=sel(BODY, body['physical_key'], body), activation_control=sel(CONTROL, control['physical_key'], control),
            activation_origin=sel('workflow_start_control_origin', activation['physical_key'], activation),
            writer_contract='pm.executor.workflow_source.all_writers.v7', installed_contract_digest=self.profile_sha,
            birth_issuance=sw.start.body_commitment(body, control)))
        bsel = sel(BIRTH, bk, birth)
        rev = ST.D01_HEAD_REVISION
        uk, hk, ok = ctx.run_key('executor_workflow_workflow_update', op), sw.owners['d01'].head_key(rev), ctx.run_key('executor_workflow_lineage_origin',op)
        update = wrapper('pm.storage_value.executor_workflow_workflow_update.v8', '8.0.0', dict(
            scope=copy.deepcopy(ctx.scope), operation_id=op, transaction_id=tx, revision=rev, previous_head=None,
            before_body=None, before_control=None, after_body=sel(BODY,body['physical_key'],body),
            after_control=sel(CONTROL,control['physical_key'],control), cause='activation',
            original_owner_result=bsel, original_owner_origin=sel('workflow_start_control_origin',activation['physical_key'],activation),
            transition=dict(rule='activation_begin',before=None,after=sw.start.body_commitment(body,control),
              original_writer_method='owner.workflow.activation.begin.v1', original_owner_result=bsel,
              original_owner_origin=sel('workflow_start_control_origin',activation['physical_key'],activation))))
        head = wrapper('pm.storage_value.executor_workflow_workflow_head.v8','8.0.0',dict(
            scope=copy.deepcopy(ctx.scope),revision=rev,activation_body=sel(BODY,body['physical_key'],body),
            activation_origin=sel('workflow_start_control_origin',activation['physical_key'],activation),
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
        self.birth_publication = dict(birth=birth,update=update,head=head,pointer=pointer,origin=origin,
                                     activation_origin=activation,tx_id=tx,coordinator_birth=cb,coordinator_control=cc)
        extra=[dict(table=t,key=k,expected=None,value=v) for t,k,v in [(BIRTH,bk,birth),(fam['workflow_update'],uk,update),
               (fam['workflow_head'],hk,head),(fam['pointer'],pk,pointer),('executor_workflow_lineage_origin',ok,origin),
               (W.family_table('birth'),birth_key,cb),(W.family_table('control'),control_key,cc)]]
        extra.append(dict(table=W.TX_ISSUANCE,key=tx,expected=None,value=dict(qualification=QUALIFICATION,
            transaction_id=tx,issued_at_utc=issued_at,writer=dict(owner_id=self.native.owner_id,
                owner_epoch=self.native.owner_epoch,operation_id=op))))
        return extra
