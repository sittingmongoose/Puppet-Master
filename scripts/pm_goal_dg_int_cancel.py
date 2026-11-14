#!/usr/bin/env python3
"""DG-INT authentic C3 Goal cancellation over S1/S2 and R2 originals (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Goal Stop and cancellation receipt precede Scheduler/D05/D06. The Goal Event
is issued only through CA3 settlement, freeze, late assignment, original append,
control publication and SIR terminal. R2 consumes these unchanged originals.
"""
from __future__ import annotations
import copy
import uuid
import tempfile
from pathlib import Path

import pm_goal_test_owner_adapters as A
import pm_goal_test_storage as S
import pm_goal_test_source as GS
import pm_goal_dg_s_world as SW
import pm_goal_dg_s_start as ST
import pm_goal_dg_s_readers as SR
import pm_goal_dg_r_world as RW
import pm_goal_dg_r_readers as RR
import pm_goal_dg_r_projector as RP
import pm_goal_dg_int_world as IW
import pm_goal_dg_int_v7 as V
import pm_goal_dg_int_goal as G
import pm_goal_dg_int_roots as IR
from pm_goal_dg_r_world import (guard,physical_sha256,Prefer,put,SS)
from pm_goal_dg_r_readers import eq
W=RW
same=A.same

QUALIFICATION='TEST_ONLY'
NATIVE_LINE=RW.NATIVE_LINE


class Consumer(RR.Consumer):
    """R2's complete reader with C3's original receipt and digest-domain joins."""
    def check(self, request, native, goal_causes, effects, mode='cancelled'):
        w = self.world
        R = self.roots
        guard('request/shape', type(request) is dict and set(request) == {'scope', 'storage_instance_id'})
        guard('request/storage', request['storage_instance_id'] == w.sid)
        R.validate('native_consumer', W.C + 'ScopeRequest', request, 'request')
        if mode == 'cancelled':
            R.validate('native_consumer', W.CA + 'RetainedNativeCancellation', native, 'tuple/native')
        else:
            for name, root in (('intent', 'StorageIntent'), ('committed_control', 'StorageControl'),
                               ('result', 'StorageResult'), ('prepare_origin', 'StorageOrigin'),
                               ('publish_origin', 'StorageOrigin')):
                R.validate('native_consumer', W.D06 + root, native[name], 'tuple/preserved/' + name)
            for name, root in (('original_d01_update', 'StorageWorkflowUpdate'), ('original_d01_head', 'StorageWorkflowHead'),
                               ('original_d01_origin', 'StorageWorkflowMutationOrigin')):
                R.validate('native_consumer', W.WO + root, native[name], 'tuple/preserved/' + name)
            R.validate('native_consumer', W.CA + 'RetainedD05Cause', native['original_safe_stop'], 'tuple/preserved/safe_stop')
            R.validate('native_consumer', W.CA + 'RetainedProcessEffects', native['original_process_effects'],
                       'tuple/preserved/process')
        R.validate('goal_consumer', W.GA + 'ProjectGoalCauses', goal_causes, 'tuple/goal')
        R.validate('filesafe_consumer', W.FA + 'RetainedFileSafeEffects', effects, 'tuple/filesafe')
        scope = request['scope']
        rec = lambda value: value.get('record', value.get('value'))  # noqa: E731
        for name in ('event_candidate', 'intent', 'committed_control', 'result', 'prepare_origin', 'publish_origin',
                     'original_d01_update', 'original_d01_origin'):
            if native[name] is not None:
                eq('scope/' + name, rec(native[name])['scope'], scope)
        # every selector in every argument resolves to Storage or immutable custody
        for path, ref in W.walk_refs(native):
            w.resolve(ref)
        for path, ref in W.walk_refs(goal_causes):
            if W.is_selector(ref) or W.is_d05_ref(ref):
                w.resolve(ref)
        intent, result = rec(native['intent']), rec(native['result'])
        control = rec(native['committed_control'])
        candidate = rec(native['event_candidate']) if native['event_candidate'] is not None else None
        prep, pub = rec(native['prepare_origin']), rec(native['publish_origin'])
        ss = native['original_safe_stop']
        agg = ss['aggregate_result']['value']
        sched = rec(ss['original_scheduler_stop'])
        goal = goal_causes[0]
        sel = lambda family, value, key: self._selector_of(family, value, key)  # noqa: E731
        # Goal Stop / SourceAudit / binding sources (separate goal realm)
        audit, sintent = goal['original_source_audit'], goal['original_stop_intent']
        receipt, cpub = rec(goal['original_stop_receipt']), rec(goal['original_control_publication'])
        eq('goal/stop_intent_audit', sintent['source_audit_sha256'], physical_sha256(audit))
        eq('goal/stop_receipt_intent', receipt['stop_intent_sha256'], G.O.sha(b'pm.goal.cancel.stop_intent.v1\n'+w.goal_bridge.world.codec.raw(sintent)))
        eq('goal/stop_receipt_audit', receipt['source_audit_sha256'], physical_sha256(audit))
        # latched is a schema const; the epoch advance is this consumer's join
        guard('goal/stop_latched', receipt['after_user_stop_epoch'] == receipt['before_user_stop_epoch'] + 1)
        eq('goal/publication_audit', cpub['source_audit_sha256'], physical_sha256(audit))
        eq('goal/publication_receipt', cpub['cancellation_receipt_sha256'], physical_sha256(self.acquire((w.goal_receipt.owner_id,w.goal_receipt.handle))[1]))
        published = cpub['original_publication']
        custody = w.storage.first_custody(published['event_id'])
        guard('goal/publication_custody', custody is not None)
        eq('goal/publication_first_receipt', published['first_append_receipt'], custody['first_append_receipt'])
        eq('goal/publication_commitment', published['original_event_value_commitment'],
           custody['original_event_value_commitment'])
        bsel, brev, borig = (rec(goal['original_binding_selection']), goal['original_binding_revision'],
                             goal['original_binding_origin'])
        eq('goal/binding_revision_selection', bsel['binding_revision']['complete_value_sha256'], physical_sha256(brev))
        eq('goal/binding_origin_selection', bsel['binding_origin']['complete_value_sha256'], physical_sha256(borig))
        eq('goal/binding_origin_revision', rec(borig)['issued_revision_sha256'], physical_sha256(brev))
        stop_sel = self._find_selector(goal['original_stop_receipt'])
        binding_sel = self._find_selector(goal['original_binding_selection'])
        # one Goal Stop, one inventory cut, one SchedulerStop across D05/D06
        for code, value in (('goal_stop/intent', intent['goal_stop']), ('goal_stop/aggregate', agg['goal_stop']),
                            ('goal_stop/scheduler', sched['goal_stop']),
                            ('goal_stop/domain_cut', ss['final_domain_cut']['value']['original_stop'])):
            eq('join/' + code, value, stop_sel)
        inv_sel = self._find_selector(ss['original_inventory_cut'])
        sch_sel = self._find_selector(ss['original_scheduler_stop'])
        agg_sel = self._find_selector(ss['aggregate_result'])
        for code, value in (('inventory/intent', intent['inventory_cut']), ('inventory/result', result['inventory_cut']),
                            ('inventory/aggregate', agg['inventory_cut']), ('inventory/scheduler', sched['inventory_cut'])):
            eq('join/' + code, value, inv_sel)
        eq('join/inventory/coverage', rec(ss['original_inventory_cut'])['coverage_birth'],
           self._find_selector(ss['original_coverage_birth']))
        for code, value in (('scheduler/intent', intent['scheduler_stop']), ('scheduler/result', result['scheduler_stop']),
                            ('scheduler/aggregate', agg['scheduler_stop'])):
            eq('join/' + code, value, sch_sel)
        eq('join/association/intent', intent['association_selection'], binding_sel)
        eq('join/association/result', result['association_selection'], binding_sel)
        eq('join/safe_stop/intent', intent['safe_stop_source'], agg_sel)
        eq('join/safe_stop/result', result['safe_stop_source'], agg_sel)
        # SchedulerStop native_cancel_result resolves the full native RunOperationResult/PublicationOrigin
        ncr, nco = rec(ss['original_native_cancel_result']), rec(ss['original_native_cancel_origin'])
        eq('scheduler/native_cancel_result', sched['native_cancel_result'],
           self._find_selector(ss['original_native_cancel_result']))
        eq('scheduler/native_cancel_origin', sched['native_cancel_origin'],
           self._find_selector(ss['original_native_cancel_origin']))
        guard('scheduler/native_cancel_operation', ncr['operation'] == 'cancel')
        eq('scheduler/native_origin_operation', nco['original_operation_id'], ncr['operation_id'])
        eq('scheduler/native_origin_record', nco['issued_record_sha256'], physical_sha256(ncr))
        eq('scheduler/run_control_after', sched['run_control_after'], ncr['after_control'])
        # distinct original operation identities joined through causation
        ops = [('d06', intent['operation_id']), ('d05_aggregate', agg['operation_id']),
               ('scheduler_stop', sched['operation_id']), ('native_cancel', ncr['operation_id']),
               ('goal_cancel', receipt['operation_id'])]
        ops += [('flush', f['value']['operation_id']) for f in ss['complete_required_flush_history']]
        ops += [('effect', s['invocation']['invocation_id']) for s in agg['settlements']]
        guard('operations/distinct', len({o for _, o in ops}) == len(ops))
        # D05 bounded outcome
        origins = ss['complete_original_origin_chain']
        eq('d05/aggregate_origin_operation', agg['origin']['operation_id'], agg['operation_id'])
        eq('d05/aggregate_origin_last', ss['aggregate_origin'], origins[-1])
        eq('d05/aggregate_origin_ref', self._find_d05(ss['aggregate_origin'])['physical_key'], agg['origin']['physical_key'])
        eq('d05/domain_birth', agg['domain_birth'], self._find_d05(ss['domain_birth']))
        eq('d05/final_cut', agg['final_domain_cut'], self._find_d05(ss['final_domain_cut']))
        eq('d05/final_flush', agg['original_final_flush'], self._find_d05(ss['complete_required_flush_history'][-1]))
        for flush in ss['complete_required_flush_history']:
            value = flush['value']
            guard('d05/flush_sticky', value['status'] == 'original_required_flush_durable' and value['failure_stage'] is None)
            eq('d05/flush_aggregate', value['aggregate_operation_id'], agg['operation_id'])
            eq('d05/flush_domain', value['domain_birth'], self._find_d05(ss['domain_birth']))
        guard('d05/pre_attempt_effects', ss['complete_pre_attempt_effect_admissions'] == [])
        births = {self._find_d05(b)['physical_key']: b for b in ss['complete_capability_births']}
        disposed = {}
        for d in ss['complete_capability_dispositions']:
            key = d['value']['capability_birth']['physical_key']
            guard('d05/capability_disposition_birth', key in births)
            disposed[key] = disposed.get(key, 0) + 1
        guard('d05/capability_reopened', all(disposed.get(k) == 1 for k in births))
        # R3: settlements cover the complete effect inventory exactly once
        self._check_effects(native, effects, agg, candidate)
        if mode == 'preserved':
            self._check_preserved(native, intent, result, control, prep, pub)
            return self._check_c3_settlement(native,goal_causes)
        # Candidate precedes prepare outputs; prepare origin closes only its own commitments
        cand_sel = self._find_selector(native['event_candidate'])
        eq('d06/intent_candidate', intent['event_candidate'], cand_sel)
        eq('d06/result_candidate', result['event_candidate'], cand_sel)
        guard('d06/intent_kind', intent['kind'] == 'cancel_nonterminal')
        eq('d06/prepare_method', prep['issuer_method'], 'owner.workflow.executor_cancel.prepare_disposition.v3')
        eq('d06/prepare_operation', prep['operation_id'], intent['operation_id'])
        eq('d06/prepare_intent', prep['afterimages']['intent'], self._find_selector(native['intent']))
        eq('d06/prepare_candidate', prep['afterimages']['event_candidate'], cand_sel)
        prepared = w.resolve(prep['afterimages']['control'])
        guard('d06/prepared_phase', rec(prepared)['phase'] == 'prepared' and rec(prepared)['result'] is None)
        eq('d06/prepared_intent', rec(prepared)['intent'], self._find_selector(native['intent']))
        guard('d06/control_once', control['revision'] == rec(prepared)['revision'] + 1 and control['phase'] == 'committed')
        eq('d06/control_result', control['result'], self._find_selector(native['result']))
        eq('d06/control_intent', control['intent'], self._find_selector(native['intent']))
        guard('d06/control_key', prep['afterimages']['control']['physical_key'] ==
              self._find_selector(native['committed_control'])['physical_key'])
        # native transition: revision +1 once, status cancelled, activation and all else unchanged
        eq('native/before_selection', result['before_body'], intent['before_body'])
        eq('native/before_control_selection', result['before_control'], intent['before_control'])
        before, after = w.resolve(intent['before_body']), w.resolve(result['after_body'])
        bctl, actl = w.resolve(intent['before_control']), w.resolve(result['after_control'])
        guard('native/before_nonterminal', rec(before)['status'] in RR.NONTERMINAL)
        guard('native/after_cancelled', rec(after)['status'] == 'cancelled')
        guard('native/revision_once', rec(after)['revision'] == rec(before)['revision'] + 1)
        eq('native/activation_preserved', rec(after)['activation_state'], rec(before)['activation_state'])
        eq('native/unrelated_preserved', {k: v for k, v in rec(after).items() if k not in ('revision', 'status')},
           {k: v for k, v in rec(before).items() if k not in ('revision', 'status')})
        eq('native/prepared_body', intent['prepared_body_sha256'], physical_sha256(after))
        eq('native/prepared_control', intent['prepared_control_sha256'], physical_sha256(actl))
        eq('native/control_body', rec(actl)['body_record_sha256'], physical_sha256(rec(after)))
        guard('native/control_once', rec(actl)['revision'] == rec(bctl)['revision'] + 1)
        # publish origin closes native/result/control outputs
        eq('d06/publish_method', pub['issuer_method'], 'owner.workflow.executor_cancel.publish_disposition.v3')
        eq('d06/publish_result', pub['afterimages']['result'], self._find_selector(native['result']))
        eq('d06/publish_control', pub['afterimages']['control'], self._find_selector(native['committed_control']))
        eq('d06/publish_native_body', pub['afterimages']['native_body'], result['after_body'])
        eq('d06/publish_native_control', pub['afterimages']['native_control'], result['after_control'])
        # D01 owner_status d06_cancel_nonterminal in the same coordinated outcome
        upd, head, dorig = rec(native['original_d01_update']), rec(native['original_d01_head']), rec(native['original_d01_origin'])
        guard('d01/rule', upd['transition']['rule'] == 'd06_cancel_nonterminal' and upd['cause'] == 'owner_status')
        eq('d01/owner_result', upd['original_owner_result'], self._find_selector(native['result']))
        eq('d01/owner_origin', upd['original_owner_origin'], self._find_selector(native['publish_origin']))
        eq('d01/after_body', upd['after_body'], result['after_body'])
        eq('d01/after_control', upd['after_control'], result['after_control'])
        eq('d01/before_body', upd['before_body'], intent['before_body'])
        eq('d01/head_update', head['last_update'], self._find_selector(native['original_d01_update']))
        eq('d01/head_current', head['current_body'], upd['after_body'])
        eq('d01/origin_method', dorig['method'], 'owner.executor.workflow_source.update_workflow.v3')
        eq('d01/origin_update', dorig['afterimages']['workflow_update'], self._find_selector(native['original_d01_update']))
        eq('d01/origin_causation', dorig['causation'], self._find_selector(native['result']))
        # the exact v3 Event, first receipt and original value from Storage's own record
        self._check_event(native, candidate, result, before, after, effects)
        self._check_start(native, intent, upd)
        self._check_c3_settlement(native,goal_causes)

    def _check_c3_settlement(self,native,goal_causes):
        w,R=self.world,self.roots
        goal=goal_causes[0];audit=goal['original_source_audit']
        cpub=goal['original_control_publication']['record'];published=cpub['original_publication']
        scope=native['intent']['record']['scope'];ss=native['original_safe_stop']
        # The genuine C3 publication settles this exact D06/D05 graph. A
        # publication for another genuine native cancellation is insufficient.
        settlement=cpub['original_owner_settlement']
        eq('goal/c3_settlement_kind',settlement['kind'],'workflow_settled')
        eq('goal/c3_native_result_key',settlement['original_owner_settlement_ref'],self._find_selector(native['result'])['physical_key'])
        eq('goal/c3_native_result',settlement['original_owner_settlement_sha256'],physical_sha256(native['result']))
        proof=w.storage.cell(G.C3.SCOPE_PROOF,settlement['original_scope_proof_ref'])
        guard('goal/c3_scope_proof_missing',proof is not None)
        eq('goal/c3_scope_proof',physical_sha256(proof['value']),settlement['original_scope_proof_sha256'])
        R.validate('c3_goal',G.C3.CM+'StorageWorkflowScopeProof',proof['value'],'goal/c3_proof')
        pr=proof['value']['record']
        eq('goal/c3_scope_run',pr['goal_run_id'],scope['goal_run_id'])
        for name,value in (('d06_result',native['result']),('d06_origin',native['publish_origin']),
                           ('d05_result',ss['aggregate_result']),('d05_origin',ss['aggregate_origin'])):
            eq('goal/c3_proof/'+name,pr[name]['complete_value_sha256'],physical_sha256(value))
        w.goal_bridge.verify_custody(proof['value'],'goal/c3_proof_custody')
        ge=w.storage.read_event(published['event_id'])
        guard('goal/c3_registered', (ge['event_type'],ge['scope_kind'],ge['payload_schema_id']) in GS.event_family_registration()[0])
        eq('goal/c3_event_family',ge['event_type'],'goal.cancelled')
        eq('goal/c3_event_receipt',ge['payload']['cancellation_receipt_sha256'],cpub['cancellation_receipt_sha256'])
        eq('goal/c3_event_audit',ge['payload']['source_audit_sha256'],physical_sha256(audit))


def current_projection_sources(projector):
    """Reopen the actual immutable-revision pointers, as well as retained cells."""
    out=RP.Projector.current_sources(projector)
    w=projector.world
    native=w.start_world.owners['native'].current()
    for name,stored in [('body',w.body2),('control',w.control2)]:
        guard('current/native_'+name,A.same(native[name],stored.wrapper))
    executor=w.current_executor()
    guard('current/d01_head',A.same(executor['workflow']['head'],w.cancellation['original_d01_head'].wrapper['record']))
    guard('current/goal_stop',w.goal_current_signature()==w.original_goal_current_signature)
    return out


def current_started_after_cancel(projector):
    """A retained running revision cannot establish a current running view."""
    w=projector.world
    with w.recorder.call(projector.owner_id,
            'owner.goal_run.started_cancelled.read_current_started.reference.v1',projector.request()):
        guard('reader/withdrawn',not projector.reader_withdrawn)
        native=w.start_world.owners['native'].current()
        if native['body']['record']['status']!='running':return projector.unavailable('STALE_NATIVE')
        raise RW.Refusal('current_started/not_in_scope')


def commit_projection_in_child(projector,writes,cut):
    """Use the actual integrated Storage directory for R6's process cut."""
    w=projector.world;payload=w.tmp/'commit-writes.msgpack'
    payload.write_bytes(RW.NR.event_value_bytes(writes,'child/writes'))
    directory=w.storage.root
    w.storage_close()
    proc=RP.subprocess.run([RP.sys.executable,RP.__file__,'--child-commit',str(directory),str(payload),cut],
                           cwd=str(Path(RP.__file__).parent),capture_output=True,text=True)
    w.storage_reopen()
    return dict(child_exit=proc.returncode,stderr=proc.stderr[-400:])


class Projector(RP.ProjectorV7):
    def __init__(self,world):
        super().__init__(world)
        self.consumer=Consumer(world)

    def current_sources(self):return current_projection_sources(self)

    read_current_started=current_started_after_cancel
    commit_in_child=commit_projection_in_child


class PackOwner(RW.PhysOwner):
    """SP-337 whole originals: durable pack before the immutable referencing cell."""
    def write_wrapper(self,family,realm,root,key,wrapper,mutable=False,reservation=None):
        if len(S.canonical(wrapper))<=SW.INLINE_CELL_LIMIT:
            return super().write_wrapper(family,realm,root,key,wrapper,mutable=mutable,reservation=reservation)
        self.world.roots.validate(realm,root,wrapper,'int/pack/original')
        guard('int/pack/immutable',not mutable and self.world.storage.cell(family,key) is None)
        tx=SW.put_values(self.world.start_world.ctx,[(family,key,wrapper)])
        return IW.record_version(self,family,key,wrapper,tx['tx_id'],root,realm)


class CancelWorld(IW.S1CancelWorld):
    consumer_class=Consumer
    projector_class=Projector

    def storage_reopen(self):
        """Fresh durable reopen; all live domain owners use the same instance."""
        old=self.storage;storage=type(old).open(old.root)
        guard('reopen/instance',storage.storage_instance_id==self.sid)
        # Source owners stay alive during a derived-projection crash. Preserve
        # their committed history only for cells unchanged in the fresh store;
        # child-written cells receive only their actual durable current value.
        storage.version_history={};storage.version_values={}
        for family,rows in storage.cells.items():
            for key,cell in rows.items():
                value=SW.read_value(storage,family,key,'reopen/value')['value'];digest=physical_sha256(value)
                prior=old.cell(family,key);history=old.__dict__.get('version_history',{}).get((family,key),[])
                unchanged=(prior is not None and prior['version']==cell['version'] and prior.get('tx')==cell.get('tx')
                           and bool(history) and history[-1]==digest)
                storage.version_history[(family,key)]=copy.deepcopy(history) if unchanged else [digest]
                values=old.__dict__.get('version_values',{}).get((family,key),{}) if unchanged else {}
                storage.version_values[(family,key)]=copy.deepcopy(values);storage.version_values[(family,key)][digest]=copy.deepcopy(value)
        sw=self.start_world;ca=self.goal_bridge.world
        objects=[self,sw,sw.ctx,self.clock,self.append,sw.appender,ca,ca.appender,
                 getattr(self,'certified_world',None),*self.registry._owners.values()]
        for obj in objects:
            if obj is None:continue
            for name,value in list(vars(obj).items()):
                if value is old:setattr(obj,name,storage)
        self.registry.recorder.observe('storage:'+storage.storage_instance_id,storage.observe)
        return storage

    def __init__(self,cfg=None,base=None):
        self.cfg=dict(cfg or {})
        guard('int/cancel/start_kind',self.cfg.get('start','started') in ('started','no_start'))
        self.knobs=self.cfg.get('knobs',{})
        RW.World.CURRENT=self
        self.tmp=Path(tempfile.mkdtemp(prefix='dgint-c3-',dir=base))
        self.certified_world=V.World(self.tmp/'v7',authentic_goal=True,bootstrap_activation=self.cfg.get('start','started')=='started',
                                     segment_target_bytes=int(self.cfg.get('segment_target_bytes',65536)))
        v=self.certified_world
        sw=self.start_world=v.sw
        self.storage,self.registry,self.recorder=v.storage,v.registry,v.recorder
        self.goal_bridge=v.goal_bridge
        self.goal_bridge.cancel_world=self
        self.edition='native_v7'
        from pm_goal_dg_int_schema_cache import Roots as SchemaRoots
        self.roots=SchemaRoots(IR.Roots.get())
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

    def build(self):
        sw=self.start_world
        self.native=IW.S1NativeOwner(self,sw.owners['native'])
        self.d01=IW.S1D01Owner(self,sw.owners['d01'],sw.edition)
        self.start=IW.AdoptedCustody(self,'workflow_start',sw.start.owner_id)
        self.goal=RW.PhysOwner(self,'goal_cancel')
        for name,role in [('scheduler','scheduler'),('d05','d05_safe_stop'),('filesafe','filesafe'),('process','process'),('d06','d06_cancel')]:
            setattr(self,name,RW.PhysOwner(self,role))
        self.out={}
        if self.knob('pre_start_events'):self.knob('pre_start_events')(self)
        self._birth()
        if self.cfg.get('start','started')=='started':self._start()
        else:self._no_start()
        if self.cfg.get('terminal'):self._terminal_before()
        self._goal_cancel()
        self._scheduler_stop()
        self._effects()
        self._safe_stop()
        self._d06()
        return self

    def _no_start(self):
        sw=self.start_world
        birth=SR.birth_record(sw)
        publication=self.certified_world.birth_publication
        self.body1,self.control1=self.body0,self.control0
        self.start_cause=dict(kind='original_initialized_no_start',
            control=self.start.adopt('workflow_start_control',birth['start_control'],'native_consumer',RW.WS+'StorageControl'),
            initial_control_origin=self.start.adopt('workflow_start_control_origin',birth['initial_control_origin'],'native_consumer',RW.WA+'OwnerIssueOriginPhysical'),
            original_workflow_birth=self.d01.adopt(publication['birth'],V.BIRTH,RW.WO+'StorageWorkflowBirth',sw.ctx.run_key(V.BIRTH)),
            original_workflow_birth_origin=self.d01.adopt(publication['origin'],'executor_workflow_lineage_origin',RW.WO+'StorageWorkflowMutationOrigin',
                sw.ctx.run_key('executor_workflow_lineage_origin',publication['origin']['record']['operation_id'])))
        families=ST.d01_families(sw.edition)
        self.head=self.d01.adopt(publication['head'],families['workflow_head'],RW.WO+'StorageWorkflowHead',sw.owners['d01'].head_key(publication['head']['record']['revision']))
        origin=publication['activation_origin']
        self.activation_origin=self.start.adopt('workflow_original_source_origin',origin,'native_consumer',RW.WA+'OwnerIssueOriginPhysical')
        self._adopt_closure([s.wrapper for k,s in self.start_cause.items() if k!='kind']+[self.head.wrapper])

    def current_start_full(self):
        if self.cfg.get('start','started')=='started':
            value=RW.World.current_start_full(self)
            value['value']['d01_current']=self.current_executor()
            res=self.roots.lookup('native_consumer',RW.CP+'CurrentSuccessfulReadback')
            from urllib.parse import urljoin
            root=urljoin(res.resolver._base_uri,res.contents['properties']['current_start']['$ref'])
            self.roots.validate('native_consumer',root,value,'int/current/actual_start_source')
            return value
        sw=self.start_world
        value=dict(kind='prestart',value=dict(d01_current=self.current_executor(),
              control=sw.owners['native'].start_control()['value'],initial_control_origin=SR.birth_record(sw)['initial_control_origin']))
        res=self.roots.lookup('native_consumer',RW.CP+'CurrentSuccessfulReadback')
        from urllib.parse import urljoin
        root=urljoin(res.resolver._base_uri,res.contents['properties']['current_start']['$ref'])
        self.roots.validate('native_consumer',root,value,'int/current/no_start')
        return value

    def _start(self):
        super()._start()
        selection=self.head.wrapper['record']['activation_origin']
        self.activation_origin=self.issued[(selection['family_id'],selection['physical_key'],selection['physical_value_sha256'])]

    def _scheduler_stop(self):
        super()._scheduler_stop()
        w,owner=self,self.scheduler
        op=self.ops['scheduler_stop']
        record=dict(scope=dict(self.scope),revision=1,owner=copy.deepcopy(self.start_world.ctx.workflow_owner),
            run_control=self.sched['run_control'].selector(),inventory_head=self.sched['inventory'].selector(),
            pending_wakes=[],pending_delays=[],capacity_reservations=[],unacknowledged_dispatches=[],
            stop=self.sched['scheduler_stop'].selector(),previous_control=None,last_origin_operation_id=op,pending_operation_id=None)
        control=owner.issue_physical('executor_workflow_scheduler_control','native_consumer',RW.WO+'StorageSchedulerControl',
            owner.key('executor_workflow_scheduler_control'),[('/record',record)])
        self.sched['scheduler_control']=control
        sw=self.start_world;families=ST.d01_families(sw.edition)
        pointer=self.storage.cell(families['pointer'],sw.owners['d01'].pointer_key())
        after=copy.deepcopy(pointer['value'])
        after['record'].update(inventory_head=self.sched['inventory'].selector(),scheduler_control=control.selector())
        sw.edition.bank.validate(sw.edition.d01+'#/$defs/StorageCurrentPointer',after,'int/scheduler/pointer')
        self.storage.transact([dict(table=families['pointer'],key=sw.owners['d01'].pointer_key(),expected=pointer['version'],value=after)])

    def current_executor(self):
        sw=self.start_world
        value=sw.owners['d01'].current_source(sw.owners['native'].current())
        if hasattr(self,'sched'):
            for field,name in [('run_control','run_control'),('run_result','native_cancel_result'),
                               ('run_origin','native_cancel_origin'),('coverage','coverage'),('inventory','inventory'),
                               ('scheduler','scheduler_control')]:
                if name in self.sched:value[field]=copy.deepcopy(self.sched[name].wrapper['record'])
        sw.edition.bank.validate(sw.edition.d01+'#/$defs/CurrentSource',value,'int/current/executor')
        return value

    def _birth(self):
        sw=self.start_world
        self.s1_handles=dict(sw.handles)
        self.workgraph_sha256=sw.ctx.workgraph_sha256
        birth=SR.birth_record(sw)
        self.body0=self.native.adopt(birth['body'],'workflow_goal_run_body',RW.WA+'GoalRunBodyPhysical')
        self.control0=self.native.adopt(birth['control'],'workflow_goal_run_control',RW.WA+'GoalRunControlPhysical')
        act=birth['body']['record']['activation_state']
        self.ids['activation_key']=act.get('idempotency_key')
        self.activation_revision=act['revision']
        self.ops=dict(birth=birth['initial_control_origin']['record']['original_operation_id'])

    def build_current(self,realm,root,prefer,overlays,knob_name):
        # Unread schema members have owner-held, explicitly nonauthoritative
        # ancillary provenance. Build it once; every actual source is re-read.
        overlays=list(overlays)
        if knob_name=='readback_edit':
            sw=self.start_world;families=ST.d01_families(sw.edition)
            overlays += [('/d06_readback/safe_stop/whole_original_safe_stop',self.successful_safe_stop()),
                ('/d06_readback/original_d01_lineage/pointer',copy.deepcopy(
                    self.storage.cell(families['pointer'],sw.owners['d01'].pointer_key())['value']))]
        cache=self.__dict__.setdefault('_current_seeds',{})
        key=(realm,root,tuple(path for path,_ in overlays),knob_name)
        if key not in cache:
            seed=self.seeder.seed(realm,root,prefer)
            self.bind(seed)
            # Never manufacture ancillary originals for an actual owner graph
            # that the caller supplies in full at this same boundary.
            owned=set()
            for path,member in overlays:put(seed,path,copy.deepcopy(member));owned.add(path)
            self._current_cache=self.current_wrappers()
            self._overlay_current(seed,owned)
            self.autofill(seed,'int/current/'+root.rsplit('/',1)[-1])
            for path,selector in list(G.CN.walk_selectors(seed)):
                if selector['physical_key']!='x':continue
                family=selector['family_id'] if selector['family_id']!='x' else 'TEST_ONLY:ancillary_provenance'
                schema=selector['schema_id'] if selector['schema_id']!='x' else 'pm.storage_value.test_only_ancillary.v1'
                version=selector['schema_version'] if selector['schema_version']!='x' else '1.0.0'
                skey=self.ancillary.key(family,uuid.uuid4().hex)
                stored=self.ancillary.issue_physical(family,None,None,skey,[('/schema_id',schema),('/schema_version',version),
                    ('/record',dict(qualification=QUALIFICATION,semantic_authority='none',source_root=root,path=path))])
                replacement=dict(family_id=family,physical_key=skey,schema_id=schema,schema_version=version,
                                 codec_id='pm.storage.canonical_msgpack.v1',complete_value_sha256=stored.sha256)
                put(seed,path,replacement)
            cache[key]=copy.deepcopy(seed)
        value=copy.deepcopy(cache[key])
        self._current_cache=self.current_wrappers()
        owned=set()
        for path,member in overlays:put(value,path,copy.deepcopy(member));owned.add(path)
        self._overlay_current(value,owned)
        self.repair_deep(realm,root,value,owned)
        if self.knob(knob_name):self.knob(knob_name)(value)
        self.roots.validate(realm,root,value,'int/current/'+root.rsplit('/',1)[-1])
        return value

    def current_wrappers(self):
        sw=self.start_world
        native=sw.owners['native'].current()
        values=[native['body'],native['control'],sw.owners['native'].start_control()['value']]
        families=ST.d01_families(sw.edition)
        pointer=self.storage.cell(families['pointer'],sw.owners['d01'].pointer_key())
        if pointer is not None:
            values.append(SW.resolve_selector(self.storage,pointer['value']['record']['workflow_head'],'int/current/head'))
        return {v['schema_id']:copy.deepcopy(v) for v in values}

    def _adopt_closure(self,wrappers):
        # A historical selector remains lawful when its original CA3 owner has
        # committed a later control version. Refresh the custody view only from
        # Storage's actual latest committed bytes, before entering passive reads.
        todo=list(wrappers);seen=set()
        while todo:
            value=todo.pop()
            for _,ref in RW.walk_refs(value):
                digest=ref.get('physical_value_sha256',ref.get('physical_sha256'))
                if digest is None:continue
                identity=(ref['family_id'],ref['physical_key'],digest)
                if identity in seen:continue
                seen.add(identity)
                retained=self.issued.get(identity)
                if retained is None:continue
                cell=SW.read_value(self.storage,ref['family_id'],ref['physical_key'],'int/custody/latest')
                guard('int/custody/current_absent',cell is not None)
                current_digest=physical_sha256(cell['value'])
                owner=self.registry._owners[retained.owner_id]
                latest=owner.current.get((ref['family_id'],ref['physical_key']))
                if latest is None or latest[0].sha256!=current_digest:
                    guard('int/custody/actual_committed_latest',self.storage.committed_version(ref['family_id'],ref['physical_key'],current_digest))
                    guard('int/custody/actual_retained_version',self.storage.committed_version(ref['family_id'],ref['physical_key'],digest))
                    IW.adopt_into(owner,ref['family_id'],ref['physical_key'],cell['value'])
                todo.extend([retained.wrapper,cell['value']])
        return super()._adopt_closure(wrappers)

    def _s1_historical(self,ref,commitment):
        try:return super()._s1_historical(ref,commitment)
        except (A.AdapterRefusal,RW.Refusal):
            return self.storage.historical_value(ref['family_id'],ref['physical_key'],commitment)

    def resolve(self,ref,family=None):
        try:return super().resolve(ref,family)
        except RW.Refusal as error:
            if error.code!='select/cell_substituted':raise
            host=self.goal_bridge.world.host_stop;scope=self.goal_bridge.route.scope
            if ref.get('family_id')!=host.FAMILY or ref.get('physical_key')!=host.key(scope):raise
            digest=ref.get('physical_value_sha256',ref.get('physical_sha256'))
            stored=self.issued.get((ref['family_id'],ref['physical_key'],digest))
            if stored is None:raise
            try:
                current=host.current(scope)['value'];record=current['record']
                receipt_ref=record['last_original_stop_receipt_ref'];receipt=host.receipt(receipt_ref)
                host.authenticate(receipt_ref,receipt)
                candidates=[]
                for original_ref in host.inventory('stop_receipt'):
                    original=host.receipt(original_ref);host.authenticate(original_ref,original)
                    if original['scope']==scope:
                        candidates.append((original['user_stop_epoch'],original['continuation_epoch'],original_ref))
                newest=max(candidates) if candidates else None
                expected=copy.deepcopy(stored.wrapper['record'])
                expected.update(user_stop_epoch=receipt['user_stop_epoch'],continuation_epoch=receipt['continuation_epoch'],
                    latched=receipt['action']=='stop',last_original_stop_receipt_ref=receipt_ref,
                    last_original_stop_receipt_sha256=G.O.row_sha(receipt))
                # Authenticate the actual owner's latest manual transition,
                # including its complete after-image. Arbitrary committed or
                # at-rest substitutions never refresh an adopted custody view.
                valid=(receipt['scope']==scope and receipt['action'] in ('stop','resume') and
                    newest==(receipt['user_stop_epoch'],receipt['continuation_epoch'],receipt_ref) and
                    A.same(host.wrapper(expected),current) and
                    self.storage.committed_version(host.FAMILY,host.key(scope),digest) and
                    self.storage.committed_version(host.FAMILY,host.key(scope),physical_sha256(current)) and
                    stored.wrapper['schema_id']==ref['schema_id'] and stored.wrapper['schema_version']==ref['schema_version'])
                if valid:return copy.deepcopy(stored.wrapper)
            except (A.AdapterRefusal,RW.Refusal,S.StorageRefusal,RW.NR.NumruleRefusal,SW.DGRefusal,KeyError,TypeError):
                pass
            raise error

    def _goal_cancel(self):
        route,w=self.goal_bridge.route,self.goal_bridge.world
        route.dispatch(route.user_request())
        for name in ('capture_source','prepare','latch_and_reserve','commit_receipt'):getattr(route,name)()
        self.ops['goal_cancel']=route.operation_id
        self.goal_revision=route.source['original_body']['revision']
        self.goal=IW.AdoptedCustody(self,'goal_cancel',w.goal.owner_id)
        GC='https://puppetmaster.local/schemas/goal_cancel_command_custody/1.0.0/goal_cancel_command_custody.schema.json#/$defs/'
        GB='https://puppetmaster.local/schemas/goal_execution_binding_custody/1.0.0/schema.json#/$defs/'
        def adopt(family,key,root):
            value=w.value(family,key)
            existing=self.issued.get((family,key,physical_sha256(value)))
            if existing is not None:
                self.roots.validate('goal_consumer',root,value,'int/adopt/existing')
                A.acquire(self.registry,existing.owner_id,self.registry.roster()[existing.owner_id],existing.handle)
                return existing
            return IW.adopt_into(self.goal,family,key,value,root=root,realm='goal_consumer')
        source=adopt('goal_cancel_source_audit',route.key('goal_cancel_source_audit'),GC+'StorageSourceAudit')
        stop=adopt('goal_cancel_stop_receipt',route.key('goal_cancel_stop_receipt'),GC+'StorageStopReceipt')
        # The StopIntent is an unchanged nested original in committed epoch 1.
        progress_key=route.progress_key(1)
        progress=w.value('goal_cancel_progress',progress_key)
        guard('int/stop_intent/parent',progress['record']['stop_intent']==route.progress['stop_intent'])
        intent_value=copy.deepcopy(progress['record']['stop_intent'])
        intent_key=route.key('goal_cancel_stop_intent')
        export=dict(qualification=QUALIFICATION,original_parent_key=progress_key,original_parent_sha256=G.O.row_sha(progress),
                    original_member='/record/stop_intent',export_sha256=G.O.row_sha(intent_value),issuer=w.goal.owner_id)
        w.write([w.put('goal_cancel_stop_intent',intent_key,intent_value),
                 w.put('TEST_ONLY:goal_member_export',intent_key,export)])
        w.goal._issue(None,dict(value=intent_value,parent_export=export),kind='stop_intent_export')
        intent=adopt('goal_cancel_stop_intent',intent_key,GC+'StopIntent')
        selection=adopt('goal_cancel_binding_selection',route.key('goal_cancel_binding_selection'),GB+'StorageBindingSelection')
        b=selection.wrapper['record']
        revision=adopt(b['binding_revision']['family_id'],b['binding_revision']['physical_key'],GB+'StorageBindingRevision')
        origin=adopt(b['binding_origin']['family_id'],b['binding_origin']['physical_key'],GB+'StorageBindingOrigin')
        self.goal_cause=dict(original_source_audit=source,original_stop_intent=intent,original_stop_receipt=stop,
                            original_binding_selection=selection,original_binding_revision=revision,original_binding_origin=origin)
        self.goal_receipt=adopt('goal_cancel_receipt',route.key('goal_cancel_receipt'),GC+'StorageCancellationReceipt')
        self._adopt_closure([s.wrapper for s in self.goal_cause.values()]+[self.goal_receipt.wrapper])

    def _terminal_before(self):
        guard('int/terminal/qualified_edition',self.edition=='native_v7' and self.cfg['terminal']=='certified')
        from pm_goal_dg_int_coordinator import build_context,run
        v=self.certified_world
        v.original_start=SR.original_started(self.start_world,where='int/terminal/original_start')
        ctx=build_context(v,op='TEST_ONLY:operation:certified:before-preservation')
        self.original_terminal=run(v,ctx)
        current=self.start_world.owners['native'].current()
        self.body1=self.native.adopt(current['body'],'workflow_goal_run_body',RW.WA+'GoalRunBodyPhysical')
        self.control1=self.native.adopt(current['control'],'workflow_goal_run_control',RW.WA+'GoalRunControlPhysical')
        families=ST.d01_families(self.start_world.edition)
        ptr=self.storage.cell(families['pointer'],self.start_world.owners['d01'].pointer_key())
        head=SW.resolve_selector(self.storage,ptr['value']['record']['workflow_head'],'int/terminal/head')
        self.head=self.d01.adopt(head,families['workflow_head'],RW.WO+'StorageWorkflowHead',
                                 key=ptr['value']['record']['workflow_head']['physical_key'])
        self._adopt_closure([current['body'],current['control'],head])

    def _d06(self):
        super()._d06()
        if getattr(self,'preserved',False):self.body2,self.control2=self.body1,self.control1
        self.finish_goal_cancellation()

    def continue_d06(self):
        super().continue_d06()
        self.finish_goal_cancellation()

    def finish_goal_cancellation(self):
        # An uncertain or merely prepared native outcome cannot issue the Goal
        # Event. Re-entry finishes C3 only after the original D06 is published.
        if getattr(self,'cancellation',None) is None:return
        if 'original_control_publication' in self.goal_cause:return
        consumer=Consumer(self)
        native,_,_=consumer.assemble(consumer.tuple(RR.Presentation(self)))
        self._adopt_closure([native])
        for path,ref in RW.walk_refs(native):
            try:self.resolve(ref)
            except RW.Refusal as error:
                raise RW.Refusal('int/native_preflight'+path+'/'+error.code) from error
        route,w=self.goal_bridge.route,self.goal_bridge.world
        for name in ('settle_owner','freeze_event','reserve_assignment','issue_assignment_audit','append_original','publish_control','terminal_succeeded'):
            getattr(route,name)()
        GC='https://puppetmaster.local/proposals/goal_workflow_cancel_custody.v1.schema.json#/$defs/'
        key=route.key('goal_cancel_control_publication')
        value=w.value('goal_cancel_control_publication',key)
        self.goal_cause['original_control_publication']=IW.adopt_into(self.goal,'goal_cancel_control_publication',key,value,
                                                                    root=GC+'StorageControlPublication',realm='c3_goal')
        self._adopt_closure([value,native])
        self.goal_event=w.storage.read_event(route.progress['publication']['event_id'])
        self.original_goal_current_signature=self.goal_current_signature()

    def goal_current_signature(self):
        """Fresh protected Goal/Stop/binding cells and their actual owner epochs."""
        bridge=self.goal_bridge;ca=bridge.world;r=bridge.route
        cells=dict(bridge.goal_cells())
        keys=ca.binding.keys(r.scope,1)
        cells['binding_origin']=(ca.binding.ORIGIN,keys['origin'])
        cells['writer_head']=(ca.binding.HEAD,'goal_execution_writer_domain_head.v1:'+ca.binding.storage_key())
        ca.binding.read_current(r.scope)
        selected={name:ca.cell(*key) for name,key in cells.items()}
        return dict(cells={name:None if cell is None else cell['value'] for name,cell in selected.items()},
            cell_versions={name:None if cell is None else cell['version'] for name,cell in selected.items()},
            owner_epochs={name:getattr(ca,name).owner_epoch for name in ('goal','host_stop','binding','permissions')})

    def _safe_stop(self):
        self.d05=PackOwner(self,'d05_safe_stop')
        w = self
        aggregate_op = 'TEST_ONLY:op:d05-aggregate:' + uuid.uuid4().hex[:12]
        flush_op = 'TEST_ONLY:op:d05-flush:' + uuid.uuid4().hex[:12]
        w.ops.update(d05_aggregate=w.kval('d05_aggregate_op', aggregate_op), d05_flush=flush_op)
        aggregate_op = w.ops['d05_aggregate']
        sched, cause = w.sched, w.goal_cause
        origins = []

        def origin(op, disc):
            stored = w._d05('OriginPhysical', disc, [('/value/operation_id', op)])
            origins.append(stored)
            return stored

        def origin_ref(stored):
            return dict(storage_instance_id=w.sid, family_id=stored.family, schema_id=stored.wrapper['schema_id'],
                        schema_version=stored.wrapper['schema_version'], physical_key=stored.key,
                        operation_id=stored.wrapper['value']['operation_id'], codec='messagepack_canonical')
        w.d05.source_owner_id=w.goal_bridge.world.native.d05.owner_id
        self.original_d05_goal_stop=self.goal_stop_sources()
        self.original_d05_executor=self.current_executor()
        bridge=w.goal_bridge
        ca,run=bridge.world,bridge.route.wf_run
        def actual(family,key,root):
            value=ca.value(family,key)
            existing=w.issued.get((family,key,physical_sha256(value)))
            if existing is not None:return existing
            return IW.adopt_into(w.d05,family,key,value,root=SS+root,realm='native_consumer')
        reservation=actual('executor_safestop_reservation_allocation',run['allocation_key'],'ReservationAllocationPhysical')
        compile_join=actual(run['lineage']['compile_join_source']['family_id'],run['lineage']['compile_join_source']['physical_key'],'CompileReservationJoinPhysical')
        workflow_join=actual(run['lineage']['workflow_join_source']['family_id'],run['lineage']['workflow_join_source']['physical_key'],'WorkflowReservationJoinPhysical')
        domain_birth=actual('executor_safestop_domain_birth',run['birth_key'],'DomainBirthPhysical')
        capabilities, dispositions = [], []
        for i, op in enumerate(w.effect_ops):
            cap = w._d05('CapabilityBirthPhysical', 'capability-%d' % i, [('/value/domain_birth', domain_birth.d05())])
            capabilities.append(cap)
            if w.knob('capability_reopened') != i:
                dispositions.append(w._d05('CapabilityDispositionPhysical', 'disposition-%d' % i,
                                           [('/value/capability_birth', cap.d05()),
                                            ('/value/capability_id', cap.wrapper['value']['capability_id']),('/value/disposition','revoked')],
                                           knob=w.knob('capability_disposition')))
        obligation = w._d05('ObligationBirthPhysical', 'obligation-final-flush', [('/value/domain_birth', domain_birth.d05())])
        flush_origin = origin(flush_op, 'final-flush')
        flushes = []
        statuses = w.cfg.get('flush', ['original_required_flush_durable'])
        for i, status in enumerate(statuses):
            flushes.append(w._d05('FinalFlushRecordPhysical', 'final-flush-%d' % i,
                                  [('/value/domain_birth', domain_birth.d05()), ('/value/aggregate_operation_id', aggregate_op),
                                   ('/value/operation_id', flush_op if i == len(statuses) - 1 else flush_op + ':%d' % i),
                                   ('/value/obligation', obligation.d05()), ('/value/status', status),
                                   ('/value/failure_stage', None if status == 'original_required_flush_durable'
                                    else 'segment_sync'),
                                   ('/value/origin', origin_ref(flush_origin))],
                                  knob=w.knob('final_flush')))
        cut = w._d05('DomainCutPhysical', 'final-cut', [('/value/domain_birth', domain_birth.d05()),
                                                         ('/value/original_stop', cause['original_stop_receipt'].selector()),
                                                         ('/value/scheduler_stop', sched['scheduler_stop'].selector()),
                                                         ('/value/inventory_cut', sched['inventory'].selector()),('/value/stage','drained_final'),
                         ('/value/registered_writers',list(bridge.world.native.writers.inventory().values())),
                         ('/value/unsupported_sources',[]),
                         ('/value/current_boundary',bridge.world.native.writers.boundary(w.d05,aggregate_op)),
                         ('/value/capabilities',[dict(birth=c.wrapper['value'],birth_source=c.d05(),
                            disposition=next(d for d in dispositions if d.wrapper['value']['capability_id']==c.wrapper['value']['capability_id']).wrapper['value'],
                            disposition_source=next(d for d in dispositions if d.wrapper['value']['capability_id']==c.wrapper['value']['capability_id']).d05()) for c in capabilities]),
                         ('/value/obligations',[obligation.wrapper['value']])],
                     knob=w.knob('domain_cut'))
        w.d05_cut_ref = cut.d05()
        pre_attempt = []
        if w.knob('pre_attempt_effect'):
            pre_attempt.append(w._d05('PreAttemptEffectAdmissionPhysical', 'pre-attempt',
                                      [('/value/domain_birth', domain_birth.d05()), ('/value/allocation', reservation.d05())]))
        aggregate_origin = origin(aggregate_op, 'aggregate')
        settlements = w._settlements()
        aggregate = w._d05('AggregateResultPhysical', 'aggregate',
                           [('/value/operation_id', aggregate_op),
                            ('/value/goal_stop', w.kval('d05_goal_stop', cause['original_stop_receipt'].selector())),
                            ('/value/scheduler_stop', sched['scheduler_stop'].selector()),
                            ('/value/inventory_cut', sched['inventory'].selector()),
                            ('/value/domain_birth', domain_birth.d05()), ('/value/final_domain_cut', cut.d05()),
                            ('/value/original_final_flush', flushes[-1].d05()),
                            ('/value/origin', origin_ref(aggregate_origin)),
                            ('/value/reservation_allocation', reservation.d05()),
                            ('/value/compile_reservation_join', compile_join.d05()),
                            ('/value/workflow_reservation_join', workflow_join.d05()),
                            ('/value/settlements', settlements)],
                           knob=w.knob('d05_aggregate'))
        w.safe_stop = dict(aggregate_result=aggregate, aggregate_origin=aggregate_origin, domain_birth=domain_birth,
                           final_domain_cut=cut, complete_required_flush_history=flushes, complete_core_writer_cuts=[],
                           complete_core_event_admissions=[], complete_capability_births=capabilities,
                           complete_capability_dispositions=dispositions, complete_obligations=[obligation],
                           reservation_allocation=reservation, compile_reservation_join=compile_join,
                           workflow_reservation_join=workflow_join, complete_original_origin_chain=origins,
                           complete_original_recovery_records=[],
                           original_native_cancel_result=sched['native_cancel_result'],
                           original_native_cancel_origin=sched['native_cancel_origin'],
                           original_scheduler_stop=sched['scheduler_stop'], original_inventory_cut=sched['inventory'],
                           original_coverage_birth=sched['coverage'], complete_d01_stop_origins=[sched['d01_stop_origin']],
                           complete_pre_attempt_effect_admissions=pre_attempt)


    def goal_stop_sources(self):
        ca,r=self.goal_bridge.world,self.goal_bridge.route
        cells=self.goal_bridge.goal_cells()
        native=self.start_world.owners['native'].current()
        goal_values={k:ca.value(*cells[k]) for k in ('body','control','stop')}
        def sel(family,key,value):
            return dict(storage_instance_id=self.sid,family_id=family,physical_key=key,schema_id=value['schema_id'],
                        schema_version=value['schema_version'],physical_value_sha256=SW.cdigest(value))
        witness=dict(thread_id=r.scope['thread_id'],**{k:goal_values[k]['record'] for k in ('body','control','stop')},
            **{k+'_source':sel(*cells[k],goal_values[k]) for k in ('body','control','stop')},
            goal_run_body=native['body']['record'],goal_run_control=native['control']['record'],
            goal_run_body_source=sel('workflow_goal_run_body',native['body']['physical_key'],native['body']),
            goal_run_control_source=sel('workflow_goal_run_control',native['control']['physical_key'],native['control']))
        return dict(current_goal_controls=witness,original_stop_intent=self.goal_cause['original_stop_intent'].wrapper,
            original_stop_receipt=self.goal_cause['original_stop_receipt'].wrapper['record'],
            original_stop_receipt_selection=self.goal_cause['original_stop_receipt'].selector(),
            original_source_audit_selection=self.goal_cause['original_source_audit'].selector())

    def successful_safe_stop(self):
        ss=self.safe_stop
        agg=ss['aggregate_result'].wrapper['value']
        gss=self.goal_stop_sources()
        ca,run=self.goal_bridge.world,self.goal_bridge.route.wf_run
        # A passive read resolves the boundary actually issued for this cut.
        # WriterGraph.boundary() issues a new original and cannot run here.
        boundary=copy.deepcopy(ss['final_domain_cut'].wrapper['value']['current_boundary'])
        boundary=ca.native.writers.authenticate(
            'boundary|'+agg['operation_id']+'|'+boundary['transaction_id'],boundary)
        source=[('/scope',dict(self.scope)),('/operation_id',agg['operation_id']),
            ('/goal_stop',agg['goal_stop']),('/scheduler_stop',agg['scheduler_stop']),('/inventory_cut',agg['inventory_cut']),
            ('/original_result',agg),('/result_source',ss['aggregate_result'].d05()),
            ('/original_origin',ss['aggregate_origin'].wrapper['value']),('/origin_source',ss['aggregate_origin'].d05()),
            ('/source_readback/scope',dict(self.scope)),('/source_readback/aggregate_operation_id',agg['operation_id']),
            ('/source_readback/goal_stop',self.original_d05_goal_stop),
            ('/source_readback/current_executor',self.original_d05_executor),
            ('/source_readback/domain_birth',ss['domain_birth'].wrapper['value']),('/source_readback/domain_birth_source',ss['domain_birth'].d05()),
            ('/source_readback/domain_cut',ss['final_domain_cut'].wrapper['value']),('/source_readback/domain_cut_source',ss['final_domain_cut'].d05()),
            ('/source_readback/reservation_lineage',run['lineage']),
            ('/current_boundary/scope',dict(self.scope)),('/current_boundary/current_goal_stop',gss),
            ('/current_boundary/current_domain_cut',ss['final_domain_cut'].wrapper['value']),
            ('/current_boundary/current_executor',self.current_executor()),
            ('/current_boundary/reservation_lineage',run['lineage']),
            ('/current_boundary/original_boundary',boundary)]
        flush=ss['complete_required_flush_history'][-1]
        source += [('/source_readback/final_flush/record',flush.wrapper['value']),
            ('/source_readback/final_flush/record_source',flush.d05()),
            ('/source_readback/final_flush/writer_cuts',[]),('/source_readback/final_flush/events',[]),
            ('/source_readback/original_origins',[x.wrapper['value'] for x in ss['complete_original_origin_chain']]),
            ('/source_readback/required_final_flush_history',[dict(record=f.wrapper['value'],record_source=f.d05(),
                original_origin=next(o for o in ss['complete_original_origin_chain'] if o.key==f.wrapper['value']['origin']['physical_key']).wrapper['value'],
                origin_source=next(o for o in ss['complete_original_origin_chain'] if o.key==f.wrapper['value']['origin']['physical_key']).d05()) for f in ss['complete_required_flush_history']]),('/source_readback/pre_attempt_effect_history',[]),
            ('/source_readback/required_checkpoint_assessments',[]),('/current_boundary/pre_attempt_effect_history',[])]
        return self.build_current('native_consumer',SS+'SuccessfulReadback',Prefer({}),source,'safe_readback_edit')

    def current_readback(self,start=None):
        if not getattr(self,'preserved',False):
            value=super().current_readback(start)
            event=value['d06_readback']['original_event']['event']
            value['d06_readback']['original_event']['custody']=self.storage.first_custody(event['event_id'])
        else:
            c,ss=self.cancellation,self.safe_stop
            overlays=[('/d06_readback/kind','terminal_preserved')]
            overlays += [('/d06_readback/'+name,c[key].wrapper['record']) for name,key in
                [('result','result'),('origin','publish_origin'),('intent','intent'),('control','committed_control')]]
            for name,stored in [('body',self.body1),('control',self.control1)]:
                overlays += [('/d06_readback/native_unchanged/'+name,stored.wrapper),
                    ('/d06_readback/native_unchanged/'+name+'_selection',stored.selector())]
            for name,key in [('head','original_d01_head'),('update','original_d01_update'),('origin','original_d01_origin')]:
                overlays += [('/d06_readback/native_unchanged/lineage_'+name,c[key].wrapper['record']),
                    ('/d06_readback/original_d01_lineage/'+name,c[key].wrapper)]
            overlays += [('/d06_readback/safe_stop/scope',{k:self.scope[k] for k in ('storage_instance_id','project_id','goal_id','goal_run_id')}),
                ('/d06_readback/safe_stop/operation_id',ss['aggregate_result'].wrapper['value']['operation_id']),
                ('/d06_readback/safe_stop/goal_stop',self.goal_cause['original_stop_receipt'].selector()),
                ('/d06_readback/safe_stop/scheduler_stop',ss['original_scheduler_stop'].selector()),
                ('/d06_readback/safe_stop/inventory_cut',ss['original_inventory_cut'].selector()),
                ('/current_start',self.current_start_full() if start is None else start)]
            prefer=Prefer({'/d06_readback':lambda variants:next(i for i,v in enumerate(variants)
                if 'ReadbackPreserved' in v.get('$ref',''))})
            value=self.build_current('native_consumer',RW.CP+'CurrentSuccessfulReadback',prefer,overlays,'readback_edit')
        value['d06_readback']['safe_stop']['whole_original_safe_stop']=self.successful_safe_stop()
        sw=self.start_world;families=ST.d01_families(sw.edition)
        value['d06_readback']['original_d01_lineage']['pointer']=copy.deepcopy(
            self.storage.cell(families['pointer'],sw.owners['d01'].pointer_key())['value'])
        self.roots.validate('native_consumer',RW.CP+'CurrentSuccessfulReadback',value,'int/current/actual_safe_stop')
        return value

    def current_read(self,start=None):
        executor=self.current_executor()
        stop=dict(scope=dict(self.scope),stop=self.sched['scheduler_stop'].wrapper['record'],
            stop_origin=self.sched['d01_stop_origin'].wrapper['record'],scheduler=self.sched['scheduler_control'].wrapper['record'],
            inventory=self.sched['inventory'].wrapper['record'],native_cancel_result=self.sched['native_cancel_result'].wrapper['record'],
            native_cancel_origin=self.sched['native_cancel_origin'].wrapper['record'],run_control=self.sched['run_control'].wrapper['record'],
            pointer=executor['pointer'])
        value=dict(d06_current=dict(scope=dict(self.scope),executor=executor,scheduler_stop=stop),
            whole_safe_stop=self.successful_safe_stop(),current_start=start if start is not None else self.current_start_full())
        if self.knob('current_read_edit'):self.knob('current_read_edit')(value)
        self.roots.validate('native_consumer',RW.CP+'CurrentRead',value,'int/current/actual_read')
        return value

    def current_goal(self):
        # Read the same live Goal, binding, Stop control and writer head that
        # C3 itself guards; no schema-filled current-control witness.
        stop=self.goal_bridge.route.current_stop_argument('integration_read')
        value=dict(current_stop=stop,current_controls=copy.deepcopy(stop['current_controls']))
        if self.knob('current_goal_edit'):self.knob('current_goal_edit')(value)
        self.roots.validate('goal_consumer',RW.GA+'CurrentCancelledGoal',value,'int/current/actual_goal')
        return value
