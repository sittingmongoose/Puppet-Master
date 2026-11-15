#!/usr/bin/env python3
"""DG-R TEST_ONLY passive consumers for ``goal_run.cancelled`` (R2-R4).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

``Consumer`` is the uninstalled passive consumer of CV-1136's selection. It
never accepts a presented value as authority: every original is acquired
through the ``OwnerRegistry`` from an owner-issued opaque handle, compared with
the Storage cell (or the owner's immutable custody for a historical version)
by recomputing its selector commitment, and validated against its exact whole
original root. The complete argument tuples (RetainedNativeCancellation,
ProjectGoalCauses, RetainedFileSafeEffects) and every success root are
validated whole. Join predicates follow EP-121, SP-312 and protocol.md W4;
each is a named guard inventoried for the shared guard-isolation sweep.
Passive reads never write: the recorder proves no owner or Storage changed.
"""
from __future__ import annotations

import copy

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_dg_r_world as W
from pm_goal_dg_r_world import guard, same, physical_sha256

QUALIFICATION = 'TEST_ONLY'
NONTERMINAL = ('ready', 'running', 'provisional_success', 'verifying', 'failed_verification', 'repairing', 'blocked',
               'stopped')


def eq(code, a, b):
    guard(code, same(a, b))


class Presentation:
    """What a caller hands the consumer: owner ids and opaque handles only."""

    def __init__(self, world):
        self.world = world
        w = world
        published = getattr(w, 'cancellation', None)
        self.cancellation = None if published is None else {k: (v.owner_id, v.handle) for k, v in published.items()}
        self.safe_stop = {}
        for k, v in w.safe_stop.items():
            self.safe_stop[k] = [(x.owner_id, x.handle) for x in v] if isinstance(v, list) else (v.owner_id, v.handle)
        self.start = {k: (v if k == 'kind' else (v.owner_id, v.handle)) for k, v in w.start_cause.items()}
        self.process = {k: [(x.owner_id, x.handle) for x in v] for k, v in w.process_effects.items()}
        self.goal = [{k: (v.owner_id, v.handle) for k, v in w.goal_cause.items()}]
        self.filesafe = [{n: (inv[n]['stored'].owner_id, inv[n]['stored'].handle) for n in ('binding', 'journal', 'origin')}
                         for inv in w.filesafe_invocations]
        self.event = getattr(w, 'cancel_event', None)


class Consumer:
    """Uninstalled passive goal_run.cancelled consumer (CV-1136 selection)."""

    def __init__(self, world):
        self.world = world
        self.roots = world.roots
        self.registry = world.registry
        self.owner_id = 'TEST_ONLY:consumer:goal_run_cancelled:' + world.sid

    # -- acquisition -------------------------------------------------------------
    def acquire(self, pair):
        guard('acquire/pair', type(pair) is tuple and len(pair) == 2)
        owner_id, handle = pair
        owner = self.registry.owner(owner_id, self._role(owner_id))
        ref, value = A.acquire(self.registry, owner_id, owner.role, handle)
        stored = next((s for s in owner.history.values() if s.handle is handle), None)
        guard('acquire/custody', stored is not None and same(stored.wrapper, value))
        # The acquired value must be the Storage cell or the owner's immutable
        # custody for that exact commitment: recomputed, never presented.
        resolved = self.world.resolve(stored.selector())
        eq('acquire/storage_commitment', resolved, value)
        return stored, value

    def _role(self, owner_id):
        return self.registry.roster().get(owner_id, 'unregistered')

    def tuple(self, presentation):
        """Acquire the complete retained native cancellation tuple."""
        out = {}
        for k, pair in presentation.cancellation.items():
            out[k] = self.acquire(pair)
        safe = {}
        for k, v in presentation.safe_stop.items():
            safe[k] = [self.acquire(x) for x in v] if isinstance(v, list) else self.acquire(v)
        start = {k: (v if k == 'kind' else self.acquire(v)) for k, v in presentation.start.items()}
        process = {k: [self.acquire(x) for x in v] for k, v in presentation.process.items()}
        goal = [{k: self.acquire(v) for k, v in g.items()} for g in presentation.goal]
        filesafe = [{n: self.acquire(v) for n, v in inv.items()} for inv in presentation.filesafe]
        return out, safe, start, process, goal, filesafe

    def assemble(self, parts):
        out, safe, start, process, goal, filesafe = parts
        v = lambda pair: copy.deepcopy(pair[1])  # noqa: E731
        start_value = {k: v(x) for k, x in start.items() if k != 'kind'}
        native = dict(event_candidate=v(out['event_candidate']) if 'event_candidate' in out else None,
                      intent=v(out['intent']),
                      committed_control=v(out['committed_control']), result=v(out['result']),
                      prepare_origin=v(out['prepare_origin']), publish_origin=v(out['publish_origin']),
                      original_d01_update=v(out['original_d01_update']), original_d01_head=v(out['original_d01_head']),
                      original_d01_origin=v(out['original_d01_origin']),
                      original_safe_stop={k: ([v(x) for x in val] if isinstance(val, list) else v(val))
                                          for k, val in safe.items()},
                      original_start=dict(kind=start['kind'], value=start_value),
                      original_process_effects={k: [v(x) for x in val] for k, val in process.items()},
                      action_authority='none')
        goal_causes = [{k: v(x) for k, x in g.items()} for g in goal]
        effects = []
        for inv in filesafe:
            item = {}
            for name, key in (('binding', 'binding'), ('journal', 'original_terminal_journal')):
                stored, value = inv[name]
                item[key] = dict(selector=self._filesafe_selector(stored), value=copy.deepcopy(value))
            stored, value = inv['origin']
            item['complete_original_origins'] = [dict(selector=self._filesafe_selector(stored), value=copy.deepcopy(value))]
            effects.append(item)
        return native, goal_causes, effects

    def _filesafe_selector(self, stored):
        inv = next(i for i in self.world.filesafe_invocations
                   for n in ('binding', 'journal', 'origin') if i[n]['stored'] is stored)
        for n in ('binding', 'journal', 'origin'):
            if inv[n]['stored'] is stored:
                selector = copy.deepcopy(inv[n]['selector'])
        guard('filesafe/selector_commitment', selector['physical_sha256'] == stored.sha256 and
              selector['physical_key'] == stored.key and selector['family_id'] == stored.family)
        return selector

    # -- R2/R3 predicates ------------------------------------------------------------
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
        eq('goal/stop_receipt_intent', receipt['stop_intent_sha256'], physical_sha256(sintent))
        eq('goal/stop_receipt_audit', receipt['source_audit_sha256'], physical_sha256(audit))
        # latched is a schema const; the epoch advance is this consumer's join
        guard('goal/stop_latched', receipt['after_user_stop_epoch'] == receipt['before_user_stop_epoch'] + 1)
        eq('goal/publication_audit', cpub['source_audit_sha256'], physical_sha256(audit))
        eq('goal/publication_receipt', cpub['cancellation_receipt_sha256'], physical_sha256(goal['original_stop_receipt']))
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
            return self._check_preserved(native, intent, result, control, prep, pub)
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
        guard('native/before_nonterminal', rec(before)['status'] in NONTERMINAL)
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

    def _check_preserved(self, native, intent, result, control, prep, pub):
        """Already-terminal byte preservation: no Event, no native write, genuine settlement."""
        w = self.world
        rec = lambda value: value.get('record', value.get('value'))  # noqa: E731
        guard('preserve/intent_kind', intent['kind'] == 'preserve_terminal' and intent['event_candidate'] is None)
        guard('preserve/result_kind', result['kind'] == 'terminal_preserved')
        before = w.resolve(intent['before_body'])
        bctl = w.resolve(intent['before_control'])
        eq('preserve/prepared_unchanged', [intent['prepared_body_sha256'], intent['prepared_control_sha256']],
           [physical_sha256(before), physical_sha256(bctl)])
        eq('preserve/after_equals_before', [result['before_body'], result['after_body'], result['before_control'],
                                            result['after_control']],
           [intent['before_body'], intent['before_body'], intent['before_control'], intent['before_control']])
        guard('preserve/status', rec(before)['status'] in ('certified', 'failed', 'cancelled') and
              result['preserved_status'] == rec(before)['status'])
        for name, sel in (('body', intent['before_body']), ('control', intent['before_control'])):
            cell = w.storage.cell(sel['family_id'], sel['physical_key'])
            guard('preserve/native_bytes', cell is not None and physical_sha256(cell['value']) == sel['physical_value_sha256'])
        op = intent['operation_id']
        events = [w.storage.read_event(e) for e in w.storage.events]
        guard('preserve/no_event', w.storage.reservation_state('TEST_ONLY:append:' + op) is None and not any(
            e['event_type'] == 'goal_run.cancelled' and e['payload'].get('payload', {}).get('goal_run_id') ==
            w.scope['goal_run_id'] for e in events))
        eq('d06/prepare_method', prep['issuer_method'], 'owner.workflow.executor_cancel.prepare_disposition.v3')
        eq('d06/prepare_intent', prep['afterimages']['intent'], self._find_selector(native['intent']))
        guard('preserve/prepare_no_candidate', prep['afterimages']['event_candidate'] is None)
        prepared = w.resolve(prep['afterimages']['control'])
        guard('d06/prepared_phase', rec(prepared)['phase'] == 'prepared' and rec(prepared)['result'] is None)
        guard('d06/control_once', control['revision'] == rec(prepared)['revision'] + 1 and control['phase'] == 'committed')
        eq('d06/control_result', control['result'], self._find_selector(native['result']))
        eq('d06/publish_result', pub['afterimages']['result'], self._find_selector(native['result']))
        eq('d06/publish_control', pub['afterimages']['control'], self._find_selector(native['committed_control']))
        eq('preserve/publish_native', [pub['afterimages']['native_body'], pub['afterimages']['native_control']],
           [intent['before_body'], intent['before_control']])
        upd = rec(native['original_d01_update'])
        guard('preserve/d01', upd['transition']['rule'] == 'd06_preserve_terminal' and upd['cause'] == 'owner_status' and
              same([upd['before_body'], upd['before_control'], upd['after_body'], upd['after_control']],
                   [intent['before_body'], intent['before_control'], intent['before_body'], intent['before_control']]))
        eq('d01/owner_result', upd['original_owner_result'], self._find_selector(native['result']))
        eq('d01/owner_origin', upd['original_owner_origin'], self._find_selector(native['publish_origin']))

    def read_preserved(self, request, presentation):
        """D06 retained result for a terminal preservation (whole RetainedResult root)."""
        w = self.world
        with w.recorder.call(self.owner_id, 'owner.workflow.executor_cancel.read_retained.v3', request) as slot:
            native, goal, effects = self.assemble(self.tuple(presentation))
            self.check(request, native, goal, effects, mode='preserved')
            again, goal2, effects2 = self.assemble(self.tuple(presentation))
            eq('final/native', again, native)
            out = dict(result=copy.deepcopy(native['result']['record']), origin=copy.deepcopy(native['publish_origin']['record']),
                       action_authority='none')
            self.roots.validate('native_consumer', W.D06 + 'RetainedResult', out, 'preserved/success')
            slot.set(dict(sha256=physical_sha256(out)))
            return out

    def _selector_of(self, family, value, key):
        return dict(storage_instance_id=self.world.sid, family_id=family, physical_key=key,
                    schema_id=value['schema_id'], schema_version=value['schema_version'],
                    physical_value_sha256=physical_sha256(value))

    def _stored_for(self, value):
        stored = self.world.issued_by_value(value)
        guard('select/unissued_value', stored is not None)
        return stored

    def _find_selector(self, value):
        return self._stored_for(value).selector()

    def _find_d05(self, value):
        return self._stored_for(value).d05()

    def _check_effects(self, native, effects, agg, candidate):
        w = self.world
        settlements = agg['settlements']
        process = native['original_process_effects']
        expected = len(effects) + len(process['shutdown_results'])
        guard('effects/settlement_count', len(settlements) == expected)
        seen = set()
        fs_results = {e['complete_original_origins'][0]['selector']['physical_key']: e for e in effects}
        proc_results = {self._find_d05(r)['physical_key']: r for r in process['shutdown_results']}
        for s in settlements:
            if s['kind'] == 'filesafe_original_resolution':
                key = s['original_result']['physical_key']
                guard('effects/filesafe_settlement_result', key in fs_results)
                eq('effects/filesafe_settlement_commitment', s['original_result'],
                   fs_results[key]['complete_original_origins'][0]['selector'])
            else:
                key = s['original_result']['physical_key']
                guard('effects/process_settlement_result', key in proc_results)
                eq('effects/process_settlement_commitment', s['original_result'], self._find_d05(proc_results[key]))
                origin_keys = {self._find_d05(o)['physical_key'] for o in process['complete_original_origins']}
                guard('effects/process_settlement_origin', s['original_origin']['physical_key'] in origin_keys)
            guard('effects/settlement_once', key not in seen)
            seen.add(key)
        guard('effects/process_partition', len(process['births']) == len(process['admissions']) ==
              len(process['termination_results']) == len(process['shutdown_results']))
        # modeled effect state: owner-applied rollback and process shutdown
        for e in effects:
            journal = e['original_terminal_journal']['value']
            guard('effects/unknown_outcome', journal['phase'] == 'committed' and
                  journal['restore_outcome'] in ('restored_clean', 'restore_skipped'))
            cell = w.storage.cell('test_only_filesafe_workspace', journal['target_manifest_ref'])
            guard('effects/workspace_present', cell is not None and
                  journal['pre_restore_manifest_ref'] == journal['target_manifest_ref'])
            state = cell['value']['record']
            eq('effects/workspace_digest', state['state_sha256'], W.state_digest(state['files']))
            if journal['restore_outcome'] == 'restored_clean':
                eq('effects/rollback_restores_safe_point', journal['post_restore_state_sha256'],
                   journal['target_state_sha256'])
                eq('effects/workspace_restored', state['state_sha256'], journal['target_state_sha256'])
                for op in journal['operations']:
                    path = op['canonical_path_ref'][len('TEST_ONLY:path:'):]
                    eq('effects/restore_operations', op['target_sha256'], W.content_digest(state['files'].get(path)))
                guard('effects/restore_operations', journal['operations'] != [] or
                      journal['target_state_sha256'] == journal['pre_restore_state_sha256'])
            else:
                guard('effects/commit_keeps_mutation', journal['post_restore_state_sha256'] is None and
                      journal['operations'] == [] and state['state_sha256'] == journal['pre_restore_state_sha256'])
        for i, shutdown in enumerate(process['shutdown_results']):
            birth, admission = process['births'][i], process['admissions'][i]
            termination = process['termination_results'][i]
            tv, sv = termination['value'], shutdown['value']
            eq('effects/process_termination_join', [tv['probe_birth']['physical_key'], tv['shutdown_admission']['physical_key']],
               [self._stored_for(birth).key, self._stored_for(admission).key])
            eq('effects/process_shutdown_join', [sv['probe_birth']['physical_key'], sv['shutdown_admission']['physical_key'],
                                                 sv['termination']['physical_key']],
               [self._stored_for(birth).key, self._stored_for(admission).key, self._stored_for(termination).key])
            guard('effects/process_unknown', tv['grace_signal_result']['result'] == 'delivered')
            table = [c for (f, k, h), c in w.issued.items() if f == 'test_only_process_table' and
                     c.wrapper['record']['process_operation_id'] == sv['operation_id']]
            cell = w.storage.cell('test_only_process_table', table[0].key) if table else None
            guard('effects/process_state', cell is not None and cell['value']['record']['state'] == 'shut_down')
        if candidate is None:
            return
        payload = candidate['producer_submission']['payload']['payload']
        census = bool(effects) or bool(process['births'])
        guard('effects/mutation_census', payload['mutation_started'] is census)
        refs = sorted([e['original_terminal_journal']['selector']['family_id'] + ':' +
                       e['original_terminal_journal']['selector']['physical_key'] for e in effects] +
                      [self._find_d05(r)['family_id'] + ':' + self._find_d05(r)['physical_key']
                       for r in process['shutdown_results']])
        eq('effects/settlement_refs', payload.get('settlement_refs', []), refs)
        rollback = sorted(e['original_terminal_journal']['selector']['family_id'] + ':' +
                          e['original_terminal_journal']['selector']['physical_key'] for e in effects
                          if e['original_terminal_journal']['value']['restore_outcome'] == 'restored_clean')
        eq('effects/rollback_refs', payload.get('rollback_refs', []), rollback)

    def _check_event(self, native, candidate, result, before, after, effects):
        w = self.world
        rec = lambda value: value.get('record', value.get('value'))  # noqa: E731
        receipt = result['append_receipt']
        stored_event = w.storage.read_event(receipt['event_id'])
        custody = w.storage.authenticate_receipt(receipt['event_id'], receipt)
        guard('event/first_barrier', receipt['durability_class'] == 'barrier' and receipt['durability_state'] == 'synced')
        submission = candidate['producer_submission']
        eq('event/producer25', S.producer25(stored_event), submission)
        eq('event/producer_digest', candidate['producer_semantic_digest'], NR.producer_digest(submission))
        eq('event/custody_digest', custody['producer_semantic_digest'], candidate['producer_semantic_digest'])
        eq('event/original_value', result['original_event_value'], custody['original_event_value_commitment'])
        eq('event/full_value', custody['original_event_value_commitment']['sha256'],
           NR.full_value_commitment(stored_event))
        guard('event/replay_policy', NR.append_policy(stored_event['replay_policy'], 'event/replay_policy') ==
              'dedupe_by_idempotency_key')
        payload = submission['payload']
        partition = custody['scope_partition']
        eq('event/partition', partition, 'project~' + S.k_component(w.scope['project_id']))
        eq('event/idempotency_key', payload['idempotency_key'], w.idempotency_key(payload, partition))
        eq('event/outer_key', submission['idempotency_key'], payload['idempotency_key'])
        eq('event/goal_run_revision', payload['goal_run_revision'], rec(after)['revision'])
        eq('event/expected_revision', payload['expected_goal_run_revision'], rec(before)['revision'])
        eq('event/goal_run', payload['payload']['goal_run_id'], w.scope['goal_run_id'])
        eq('event/project', payload['project_id'], w.scope['project_id'])
        eq('event/goal', payload['goal_id'], w.scope['goal_id'])

    def _check_start(self, native, intent, cancel_update):
        w = self.world
        rec = lambda value: value.get('record', value.get('value'))  # noqa: E731
        start = native['original_start']
        value = start['value']
        control = rec(value['control'])
        if start['kind'] == 'original_started':
            upd = rec(value['original_d01_update'])
            guard('start/rule', upd['transition']['rule'] == 'original_workflow_start')
            eq('start/commit', upd['original_owner_result'], self._find_selector(value['commit']))
            eq('start/origin', upd['original_owner_origin'], self._find_selector(value['origin']))
            eq('start/before_cancel', upd['after_body'], intent['before_body'])
            eq('start/head_chain', cancel_update['previous_head']['physical_key'],
               self._find_selector(value['original_d01_head'])['physical_key'])
            prior_head = w.resolve(cancel_update['previous_head'])
            eq('start/head_prior', rec(prior_head)['last_update'], self._find_selector(value['original_d01_update']))
            eq('start/d01_origin', rec(value['original_d01_origin'])['afterimages']['workflow_update'],
               self._find_selector(value['original_d01_update']))
        else:
            guard('start/no_start_control', control['epoch'] == 0 and control['pending_candidate'] is None and
                  control['committed_start'] is None and control['original_operation_id'] is None)
            birth = rec(value['original_workflow_birth'])
            eq('start/birth_body', birth['activation_body'], intent['before_body'])
            border = rec(value['original_workflow_birth_origin'])
            guard('start/birth_method', border['method'] == 'owner.executor.workflow_source.enroll_workflow_birth.v3')
            eq('start/birth_origin', border['afterimages']['workflow_birth'], self._find_selector(value['original_workflow_birth']))

    # -- methods -------------------------------------------------------------------------
    def read_retained_native(self, request, presentation):
        w = self.world
        with w.recorder.call(self.owner_id, 'owner.goal_run.cancelled.read_retained_native.v1', request) as slot:
            if presentation.cancellation is None:
                # No published original result: truthful unavailable, nothing fabricated.
                out = dict(scope=copy.deepcopy(request['scope']), reason='MISSING_ORIGINAL_VALUE', effects='none',
                           current_state_asserted=False)
                self.roots.validate('native_consumer', W.C + 'Unavailable', out, 'unavailable')
                slot.set(out)
                return out
            native, goal, effects = self.assemble(self.tuple(presentation))
            self.check(request, native, goal, effects)
            # final predicate after returning helpers, with no gap to release
            again, goal2, effects2 = self.assemble(self.tuple(presentation))
            eq('final/native', again, native)
            eq('final/goal', goal2, goal)
            eq('final/filesafe', effects2, effects)
            self.roots.validate('native_consumer', W.CA + 'RetainedNativeCancellation', native, 'success')
            slot.set(dict(sha256=physical_sha256(native)))
            return native

    def original_value(self, native):
        w = self.world
        receipt = native['result']['record']['append_receipt']
        event = w.storage.read_event(receipt['event_id'])
        custody = w.storage.authenticate_receipt(receipt['event_id'], receipt)
        return dict(event=event, first_append_receipt=copy.deepcopy(custody['first_append_receipt']), full_value_result=w.storage.full_value_result(receipt['event_id']),
                    exact_custody=custody)

    def inspect_original(self, request, presentation):
        w = self.world
        with w.recorder.call(self.owner_id, 'owner.goal_run.cancelled.inspect_original.v1', request) as slot:
            native = self.read_retained_native(request, presentation)
            value = self.original_value(native)
            out = dict(original_value=value, native_cancellation=native, action_authority='none')
            self.roots.validate('native_consumer', W.C + 'OriginalCancelled', out, 'inspect/success')
            slot.set(dict(sha256=physical_sha256(out)))
            return out
