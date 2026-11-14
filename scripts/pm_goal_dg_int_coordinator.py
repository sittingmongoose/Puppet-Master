#!/usr/bin/env python3
"""DG-INT whole-v7 coordinator participants (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Static port of CF2's original phases onto S2 immutable revisions and actual
D01 pointers. The adapter remains unchanged. Typed phase operands are complete
roots in the exact methods.json realms; a missing operand refuses.
"""
from __future__ import annotations
import base64
import copy
import json
import random

import pm_goal_test_owner_adapters as A
import pm_goal_test_storage as S
import pm_goal_test_source as GS
import pm_goal_dg_cf1_world as F
import pm_goal_dg_cf1_compose as C
import pm_goal_dg_cf2_world as W
import pm_goal_dg_cf2_native as N
import pm_goal_dg_int_v7 as V
from pm_goal_dg_cf2_world import (QUALIFICATION,COORD,APPEND,WRAPPER_ROOT,NR,require,selector,sha,mp,sj,
    family_key,family_table,wrap,_without_snapshot)


def dispatch(world,phase,arguments):
    matches=[m for m in F.METHODS['methods'] if m['phase']==phase]
    require('int/dispatch/method',len(matches)==1)
    m=matches[0]
    declared={a['name']:a for a in m['arguments']}
    require('int/dispatch/complete/'+phase,set(arguments)==set(declared))
    for name,arg in declared.items():
        world.realm.validate(arg['realm'],arg['schema_ref'],arguments[name],'int/'+phase+'/'+name)
    world.typed_calls.append(dict(phase=phase,method=m['method'],arguments=sorted(arguments)))
    world.__dict__.setdefault('typed_arguments',{})[phase]=copy.deepcopy(arguments)
    return True


class Disclosure(F.IssuingOwner):
    role='current_disclosure'
    def enroll(self,scope):
        permission=self.world.permission.current(scope['goal_run_id'])
        require('int/disclosure/permission',permission['state']=='granted')
        cache=self.__dict__.setdefault('_reads',{})
        key=F.hsj([scope,permission])
        if key not in cache:
            realm,uri=F.ROOTS['OriginalStructuredValue']
            value=C.compose(realm,uri,C.Context(clock=self.world.storage.now,rng=random.Random(key),owner_tag=self.owner_id),validate=False)
            value['_record']=copy.deepcopy(permission)
            self.seal(value,tag='current_disclosure',scope=dict(scope,thread_id=self.world.values['thread_id']))
            value.pop('_record',None)
            F.rvalidate('OriginalStructuredValue',value,'int/disclosure')
            cache[key]=self._issue(None,value,kind='current_disclosure')
        return cache[key]

    def acquire(self,scope):
        permission=self.world.permission.current(scope['goal_run_id'])
        require('int/disclosure/permission',permission['state']=='granted')
        key=F.hsj([scope,permission])
        require('int/disclosure/original_unavailable',key in self.__dict__.get('_reads',{}))
        cache=self._reads
        handle=cache[key]
        value=A.acquire(self.registry,self.owner_id,self.role,handle)[1]
        F.authenticate_structured(self.world,value,'int/disclosure',scope)
        return value


class Guard(W.GuardReader):
    def store_source(self,scope,operation_id):
        source,generation=super().store_source(scope,operation_id)
        cell=self.world.storage.cell(V.BIRTH,self.world.native.birth_key(self.world.scope))
        require('int/guard/snapshot',generation==self.world.storage.cell_generation)
        source['native_run_birth_present']=cell is not None
        source['native_run_birth_selection']=None if cell is None else selector(self.world.native.birth_key(self.world.scope),cell['value'])
        return source,generation

    def read_guard(self,request,*,source_edit=None):
        w=self.world
        # Q3 disclosure is an actual owner original, independently acquired by this reader.
        disclosure=w.disclosure.acquire(w.scope)
        source,generation=self.store_source(request['scope'],request['operation_id'])
        if source_edit:source=source_edit(copy.deepcopy(source))
        dispatch(w,'guard_read',dict(request=request,actual_storage_source=source,
                 whole_original_current_disclosure_source=disclosure))
        result=self.derive(request['scope'],request['operation_id'],source,generation)
        w.realm.validate('coordinator',COORD+'GuardReadResult',result,'int/guard/result')
        require('int/guard/disclosure_changed',w.disclosure.acquire(w.scope)==disclosure)
        require('int/guard/storage_changed',w.storage.cell_generation==generation)
        return result


class Coordinator(W.Coordinator):
    def current_sources(self,ctx,*,stage):
        w=self.world
        require(stage+'/coordinator_epoch',ctx['coordinator_owner_epoch']==self.owner_epoch)
        require(stage+'/request_scope',ctx['request']['scope']==ctx['scope']==w.coord_scope(w.scope))
        require(stage+'/request_profile',ctx['request']['installed_profile_sha256']==w.profile_sha)
        require(stage+'/execution_owner_epoch',w.goal_bridge.world.native.run.owner_epoch==w.sw.ctx.workflow_owner['owner_epoch'])
        roles=dict(native='native_source',goal='goal',standard='standard',assignment='assignment',
                   invocation='invocation',resolver='resolver',references='references',causal='causality',
                   partition='storage_partition')
        for name,handle in ctx['handles'].items():
            if name not in roles:continue
            issuer=w.registry.owner(handle[0],roles[name])
            require(stage+'/issuer_epoch/'+name,issuer.custody(handle[1])['owner_epoch']==issuer.owner_epoch)
            original=A.acquire(w.registry,handle[0],roles[name],handle[1])[1]
            require(stage+'/original/'+name,A.same(original,ctx['src'][name]))
        candidate=A.acquire(w.registry,w.native.owner_id,'native',ctx['candidate_handle'])[1]
        require(stage+'/candidate_epoch',w.native.custody(ctx['candidate_handle'])['owner_epoch']==w.native.owner_epoch)
        require(stage+'/candidate_original',candidate['whole']==ctx['native_candidate'])
        producer=A.acquire(w.registry,w.producer.owner_id,'producer',ctx['producer_handle'])[1]
        require(stage+'/producer_epoch',w.producer.custody(ctx['producer_handle'])['owner_epoch']==w.producer.owner_epoch)
        require(stage+'/identity_epoch',w.identity.custody(ctx['identity_handle'])['owner_epoch']==w.identity.owner_epoch)
        identity=A.acquire(w.registry,w.identity.owner_id,'identity',ctx['identity_handle'])[1]
        require(stage+'/identity_original',identity==ctx['identity'])
        profile=A.acquire(w.registry,ctx['handles']['descriptor'][0],'profile',ctx['handles']['descriptor'][1])[1]
        require(stage+'/descriptor_epoch',w.profile.custody(ctx['handles']['descriptor'][1])['owner_epoch']==w.profile.owner_epoch)
        require(stage+'/descriptor_profile',profile['profile_sha256']==w.profile_sha)
        require(stage+'/producer_original',producer['producer25']==ctx['producer25'] and
                producer['whole_producer_source']==ctx['producer_source'])
        goal=w.sw.owners['goal'].current_argument()
        require(stage+'/goal_current',goal==ctx['goal']['argument'])
        body,control,binding=w.goal.current(w.scope['goal_id'])
        require(stage+'/effective_stop',control['value']['stop_state']=='none')
        require(stage+'/goal_binding',binding['value']['bound_goal_run_id']==w.scope['goal_run_id'])
        permission=w.permission.current(w.scope['goal_run_id'])
        require(stage+'/permission',permission['state']=='granted')
        require(stage+'/standard_durable',w.standard.durable(ctx['src']['standard']))
        return dict(goal=goal,permission=permission)

    def native_preimage(self,ctx,*,stage):
        w,sw=self.world,self.world.sw
        native=sw.owners['native'].current()
        body=w.storage.cell(V.BODY,native['body']['physical_key'])
        control=w.storage.cell(V.CONTROL,native['control']['physical_key'])
        families=V.ST.d01_families(sw.edition)
        pointer=w.storage.cell(families['pointer'],sw.owners['d01'].pointer_key())
        require(stage+'/d01_pointer',pointer is not None)
        hs=pointer['value']['record']['workflow_head']
        head=V.SW.resolve_selector(w.storage,hs,stage+'/head')
        require(stage+'/d01_body',head['record']['current_body']==V.physical(w,V.BODY,native['body']['physical_key'],native['body'])
                and head['record']['current_control']==V.physical(w,V.CONTROL,native['control']['physical_key'],native['control']))
        return body,control,dict(value=head,key=hs['physical_key'],pointer=pointer,native_pointer=native['pointer'])

    def source_commitments(self,ctx):
        return dict(original_certification_source_sha256=sha(sj(ctx['src']['native']['whole'])),
                    whole_goal_argument_sha256=sha(sj(ctx['goal']['argument'])),
                    whole_standard_durable_read_sha256=sha(sj(ctx['src']['standard']['whole'])),
                    whole_producer_source_sha256=sha(sj(ctx['producer_source'])),
                    whole_identity_input_sha256=ctx['identity']['whole_input_sha256'],
                    whole_identity_result_sha256=sha(sj(ctx['identity'])))

    def native_candidate(self,ctx,body,control):
        held=A.acquire(self.world.registry,self.world.native.owner_id,'native',ctx['candidate_handle'])[1]['whole']
        require('int/candidate/preimage',held['candidate_lineage']['before']==dict(body=body['value'],control=control['value']))
        return held

    def byte_source(self,ctx):
        return super().preappend_source(ctx)

    def event_source(self):
        w=self.world
        index=GS.EventRecordIndexSource(w.storage)
        read=index.read()
        return index.native_current_event_source('TEST_ONLY:native-index-read:'+read.read_token['redb_snapshot_id'],read=read)

    def preappend_source(self,ctx):
        summary=self.byte_source(ctx)
        value=self.event_source()
        if 'preappend_whole' not in ctx:
            ctx['preappend_whole']=value
        return summary

    def original_event(self,ctx):
        w=self.world
        event=w.storage.read_event(ctx['identity']['event_id'])
        custody=w.storage.first_custody(event['event_id'])
        require('int/event/custody',custody is not None)
        out=dict(complete_original_event=event,complete_certified_payload=event['payload'],
                 first_append_receipt=custody['first_append_receipt'],
                 complete_original_value_commitment=custody['original_event_value_commitment'],
                 original_full_value=w.storage.full_value_result(event['event_id']),exact_original_custody=custody,
                 complete_current_source=self.event_source())
        F.rvalidate('OriginalEventPrerequisite',out,'int/original_event')
        return out

    def published(self,ctx):
        w=self.world
        union=ctx['union']
        state=w.native.state(w.scope)
        d01=state['d01_current']
        out=dict(result=union['native_result'],origin=union['native_origin'],
                 lineage=dict(workflow=d01['workflow'],pointer=d01['pointer']),
                 current=w.native.compose_current(w.scope,state))
        F.rvalidate('PublishedWorkflow',out,'int/published')
        return out

    def typed(self,phase,ctx,**extra):
        w=self.world
        generation=w.storage.cell_generation
        arguments=dict(request=ctx['request'],original_certification_source=ctx['src']['native']['whole'],
            current_goal=ctx['goal']['argument'],durable_standard=ctx['src']['standard']['whole'],
            whole_producer_source=ctx['producer_source'],identity_result=ctx['identity'],
            whole_native_candidate=ctx['native_candidate'],producer25=ctx['producer25'])
        declared={a['name'] for m in F.METHODS['methods'] if m['phase']==phase for a in m['arguments']}
        if 'complete_preappend_storage_source' in declared:arguments['complete_preappend_storage_source']=ctx['preappend_whole']
        for family,arg in [('intent','intent'),('eventphase','event_phase'),('commit','commit'),('origin','origin'),
                           ('control','control'),('birth','birth'),('release','release')]:
            if arg in declared and arg not in extra:
                cell=self.compact(family,ctx['scope'],ctx['op'])[1]
                require('int/typed/missing/'+arg,cell is not None)
                arguments[arg]=cell['value']
        if 'whole_original_event_source' in declared:arguments['whole_original_event_source']=self.original_event(ctx)
        if 'all_member_append_evidence' in declared:arguments['all_member_append_evidence']=ctx['evidence']
        if 'published_native' in declared:arguments['published_native']=self.published(ctx)
        arguments.update(extra)
        out=dispatch(w,phase,arguments)
        require('int/typed/read_only/'+phase,w.storage.cell_generation==generation)
        return out

    def derive_intent(self, ctx, tx_id):
        w = self.world
        body, control, head = self.native_preimage(ctx, stage='intent')
        identity, p25 = ctx['identity'], ctx['producer25']
        candidate = self.native_candidate(ctx, body, control)
        birth_key, birth = self.compact('birth', ctx['scope'])
        require('intent/birth_unavailable', birth is not None)
        origin_key = N.capture_key(ctx['scope'])
        origin = w.storage.cell('workflow_standard_capture_origin', origin_key)
        require('intent/standard_origin', origin is not None)
        intent = dict(
            scope=copy.deepcopy(ctx['scope']), owner=self.owner_ref(ctx['op']), installed_profile_sha256=w.profile_sha,
            original_birth=selector(birth_key, birth['value']),
            clocks=dict(expected_goal_run_revision=identity['input']['expected_goal_run_revision'],
                        goal_run_revision=identity['input']['goal_run_revision'],
                        expected_workflow_control_revision=control['value']['record']['revision'],
                        workflow_control_revision=control['value']['record']['revision'] + 1,
                        observed_goal_revision=ctx['goal']['goal_revision'],
                        whole_unchanged_goal_argument_sha256=sha(sj(ctx['goal']['argument']))),
            source_commitments=self.source_commitments(ctx),
            candidate_commitments=dict(whole_producer25_sha256=sha(sj(p25)),
                                       whole_native_candidate_sha256=sha(sj(candidate)),
                                       producer_semantic_digest=NR.producer_digest(p25, 'intent/producer_digest')),
            event_id=identity['event_id'], idempotency_key=identity['idempotency_key'],
            certification_receipt_ref=ctx['src']['standard']['receipt_ref'],
            standard_capture_origin=selector(origin_key, origin['value']),
            native_before_body=selector(body['value']['physical_key'], body['value']),
            native_before_control=selector(control['value']['physical_key'], control['value']),
            native_before_head=selector(head['key'], head['value']),
            original_occurred_at_utc=p25['occurred_at_utc'], transaction_id=tx_id)
        w.realm.validate('coordinator', COORD + 'Intent', intent, 'intent')
        return intent, candidate

    def prepare(self, ctx):
        w = self.world
        with self.recorder.call(self.owner_id, 'owner.workflow.certified_event.prepare.v1', dict(op=ctx['op'])) as slot:
            guard = self.check_guard(ctx, self.acquire_guard(ctx, 'original_certification', stage='prepare'),
                                     ('authentic_no_coordinator_operation',), stage='prepare')
            self.current_sources(ctx, stage='prepare')
            body, control, _ = self.native_preimage(ctx, stage='prepare')
            require('prepare/native_status', body['value']['record']['status'] in ('verifying', 'provisional_success'))
            require('prepare/native_revision', body['value']['record']['revision'] ==
                    ctx['identity']['input']['expected_goal_run_revision'])
            intent, candidate = self.derive_intent(ctx, 'TEST_ONLY:candidate-transaction:unissued')
            prepared = dict(outcome='prepared', intent=intent, intent_sha256=sha(mp(intent)), action_authority='none')
            w.realm.validate('coordinator', COORD + 'Prepared', prepared, 'prepare/result')
            ctx['native_candidate'] = candidate
            self.preappend_source(ctx)
            self.typed('prepare',ctx)
            w.hook('after_helper:prepare',ctx)
            self.current_sources(ctx,stage='prepare_final')
            body2,control2,_=self.native_preimage(ctx,stage='prepare_final')
            require('prepare/final_native',body2==body and control2==control)
            ctx['guards']['prepare'] = guard
            slot.set(prepared)
            return prepared

    def arm(self, ctx, prepared):
        w = self.world
        with self.recorder.call(self.owner_id, 'owner.storage.certified_event.arm.v1', dict(op=ctx['op'])) as slot:
            req = ctx['request']
            w.realm.validate('coordinator', COORD + 'Request', req, 'arm/request')
            require('arm/request_scope', A.same(req['scope'], ctx['scope']))
            require('arm/installed_profile', req['installed_profile_sha256'] == w.profile_sha)
            guard = self.check_guard(ctx, self.acquire_guard(ctx, 'original_certification', stage='arm'),
                                     ('authentic_no_coordinator_operation',), stage='arm')
            control_key, control = self.compact('control', ctx['scope'])
            require('arm/control_epoch', control['value']['record']['epoch'] == req['expected_control_epoch'])
            require('arm/control_not_empty', control['value']['record']['phase'] == 'empty')
            self.current_sources(ctx, stage='arm')
            w.hook('after_helper:arm', ctx)
            intent_key = family_key('intent', ctx['scope'], ctx['op'])

            def build(tx_id):
                intent, candidate = self.derive_intent(ctx, tx_id)
                cand = copy.deepcopy(prepared['intent'])
                cand['transaction_id'] = tx_id
                require('arm/prepared_intent', A.same(cand, intent))
                require('arm/native_candidate', A.same(candidate, ctx['native_candidate']))
                stored_intent = wrap('intent', intent)
                new_control = dict(control['value']['record'], epoch=control['value']['record']['epoch'] + 1,
                                   phase='armed', intent=selector(intent_key, stored_intent))
                stored_control = wrap('control', new_control)
                for fam, value in (('intent', stored_intent), ('control', stored_control)):
                    w.realm.validate('coordinator', COORD + WRAPPER_ROOT[fam], value, 'arm/' + fam)
                # final predicate after the last helper (F0/F1-F4), immediately before the effect
                self.current_sources(ctx, stage='arm_final')
                fresh = self.compact('control', ctx['scope'])[1]
                require('arm/control_changed', fresh['version'] == control['version'])
                ctx['stored_intent'], ctx['stored_control_armed'] = stored_intent, stored_control
                w.hook('arm_built', ctx)
                self.current_sources(ctx,stage='arm_after_helpers')
                b2,c2,h2=self.native_preimage(ctx,stage='arm_after_helpers')
                require('arm/last_native',intent['native_before_body']==selector(b2['value']['physical_key'],b2['value'])
                        and intent['native_before_control']==selector(c2['value']['physical_key'],c2['value'])
                        and intent['native_before_head']==selector(h2['key'],h2['value']))
                require('arm/last_control',self.compact('control',ctx['scope'])[1]==control)
                return [dict(table=family_table('intent'), key=intent_key, expected=None, value=stored_intent),
                        dict(table=family_table('control'), key=control_key, expected=control['version'],
                             value=stored_control)]
            self.typed('arm',ctx,prepared=prepared,before_control=control['value'],birth=self.compact('birth',ctx['scope'])[1]['value'])
            w.cut('before_arm')
            tx = w.storage.transact_stamped(build, writer=self.owner_ref(ctx['op']))
            w.cut('after_arm')
            ctx['guards']['arm'] = guard
            slot.set(dict(tx=tx['tx_id']))
            return ctx['stored_intent'], ctx['stored_control_armed']

    def f5a(self, ctx, intent, control, preappend):
        """F5a: genuine pre-append admission; no future receipt/barrier/custody is an input."""
        w = self.world
        stage = 'f5a'
        req = ctx['request']
        w.realm.validate('coordinator', COORD + 'Request', req, stage + '/request')
        require(stage + '/request_scope', A.same(req['scope'], ctx['scope']))
        require(stage + '/installed_profile', req['installed_profile_sha256'] == w.profile_sha)
        w.realm.validate('coordinator', COORD + 'StorageIntent', intent, stage + '/intent')
        w.realm.validate('coordinator', COORD + 'StorageControl', control, stage + '/control')
        ikey, icell = self.compact('intent', ctx['scope'], ctx['op'])
        require(stage + '/intent_unissued', icell is not None)
        require(stage + '/intent_bytes', mp(icell['value']) == mp(intent))
        ckey, ccell = self.compact('control', ctx['scope'])
        require(stage + '/control_bytes', mp(ccell['value']) == mp(control))
        rec = control['record']
        require(stage + '/control_phase', rec['phase'] == 'armed')
        require(stage + '/expected_control_epoch', rec['epoch'] == req['expected_control_epoch'] + 1)
        require(stage + '/control_intent', A.same(rec['intent'], selector(ikey, intent)))
        bkey, bcell = self.compact('birth', ctx['scope'])
        require(stage + '/birth', A.same(intent['record']['original_birth'], selector(bkey, bcell['value'])))
        i = intent['record']
        require(stage + '/source_commitments', A.same(i['source_commitments'], self.source_commitments(ctx)))
        p25 = ctx['producer25']
        for field in S.STORAGE_FIELDS:
            require(stage + '/storage_assigned_supplied', field not in p25)
        require(stage + '/replay_policy', p25.get('replay_policy') == 'dedupe_by_idempotency_key')
        require(stage + '/producer25', i['candidate_commitments']['whole_producer25_sha256'] == sha(sj(p25)))
        require(stage + '/producer_semantic_digest', i['candidate_commitments']['producer_semantic_digest'] ==
                NR.producer_digest(p25, stage + '/producer_digest'))
        require(stage + '/native_candidate', i['candidate_commitments']['whole_native_candidate_sha256'] ==
                sha(sj(ctx['native_candidate'])))
        require(stage + '/identity', p25['event_id'] == ctx['identity']['event_id'] == i['event_id'] and
                p25['idempotency_key'] == ctx['identity']['idempotency_key'] == i['idempotency_key'])
        self.current_sources(ctx, stage=stage)
        body, ncontrol, head = self.native_preimage(ctx, stage=stage)
        require(stage + '/native_current', A.same(i['native_before_body'], selector(body['value']['physical_key'], body['value']))
                and A.same(i['native_before_control'], selector(ncontrol['value']['physical_key'], ncontrol['value']))
                and A.same(i['native_before_head'], selector(head['key'], head['value'])))
        # The presented pre-append source must equal Storage's own current source now.
        fresh = self.preappend_source(ctx)
        require(stage + '/preappend_source', A.same(_without_snapshot(preappend), _without_snapshot(fresh)))
        require(stage + '/generic_prefix', fresh['generic']['complete'] is True)
        # No receipt, frame, barrier, custody or EventPhase for this operation exists yet.
        require(stage + '/future_receipt', not preappend['dedupe_tail']['event_id_present'] and
                not preappend['dedupe_tail']['scoped_present'] and
                ctx['identity']['event_id'] not in preappend['custody_event_ids'])
        epkey, epcell = self.compact('eventphase', ctx['scope'], ctx['op'])
        require(stage + '/future_event_phase', epcell is None)
        require(stage + '/future_inputs', not any(k in ctx.get('presented', {}) for k in
                                                  ('first_custody', 'append_receipt', 'event_phase',
                                                   'original_event_prerequisite')))
        res = w.storage.reservation_state(ctx['op'])
        require(stage + '/append_attempted', res is None)
        self.typed('append',ctx,intent=intent,control=control)
        self.current_sources(ctx,stage='f5a_after_typed')
        b2,c2,h2=self.native_preimage(ctx,stage='f5a_after_typed')
        require('f5a/last_native',i['native_before_body']==selector(b2['value']['physical_key'],b2['value']) and
                i['native_before_control']==selector(c2['value']['physical_key'],c2['value']) and
                i['native_before_head']==selector(h2['key'],h2['value']))
        require('f5a/last_storage_source',fresh['token']==self.byte_source(ctx)['token'])
        return fresh

    def f5b_readback(self, ctx, preappend, candidates):
        w = self.world
        stage = 'f5b'
        group = w.storage.active_durable_group(ctx['identity']['event_id'])
        ids = [c['event_id'] for c in candidates]
        require(stage + '/group_members', [m['event_id'] for m in group['members']] == ids)
        for member in group['members']:
            raw = w.storage.read_frame(member['event_id'])
            require(stage + '/frame_sha256', sha(raw) == member['frame_sha256'] and len(raw) == member['frame_length'])
            event = w.storage.read_event(member['event_id'])
            require(stage + '/frame_value', A.same(S.producer25(event),
                                                   next(c for c in candidates if c['event_id'] == member['event_id'])))
        post = self.byte_source(ctx)
        # The current source after the owned publication equals the derived postimage.
        require(stage + '/manifest_postimage', post['current_bytes_sha256'] != preappend['current_bytes_sha256'] and
                post['token']['frontier_revision'] == preappend['token']['frontier_revision'] + 1)
        before = {s['generation']: s for s in preappend['segments']}
        gen = group['segment_generation']
        others_same = all(A.same(s, before.get(s['generation'])) for s in post['segments'] if s['generation'] != gen)
        start = before[gen]['watermark'] if gen in before else 0
        require(stage + '/own_changes_only', others_same and group['durable_start_offset'] == start and
                post['custody_event_ids'] == preappend['custody_event_ids'])
        return dict(group=group, post=post)

    def f5d(self, ctx, intent, control, evidence, barrier):
        w = self.world
        stage = 'f5d'
        ckey, ccell = self.compact('control', ctx['scope'])
        epkey = family_key('eventphase', ctx['scope'], ctx['op'])

        def final(evidence_now):
            self.check_evidence(ctx, evidence_now, stage=stage)
            self.current_sources(ctx, stage=stage + '_final')
            body, ncontrol, head = self.native_preimage(ctx, stage=stage)
            i = intent['record']
            require(stage + '/native_current', A.same(i['native_before_body'],
                                                      selector(body['value']['physical_key'], body['value'])))
            fresh = self.compact('control', ctx['scope'])[1]
            require(stage + '/control_changed', fresh['version'] == ccell['version'] and
                    fresh['value']['record']['phase'] == 'armed')
        w.hook('after_helper:f5d', ctx)
        final(evidence)
        issued_at = w.storage.now()

        def build(tx_id):
            final(evidence)
            record = self.event_phase_record(ctx, intent, evidence, tx_id, issued_at)
            stored = wrap('eventphase', record)
            new_control = dict(ccell['value']['record'], epoch=ccell['value']['record']['epoch'] + 1,
                               phase='event_durable', event_phase=selector(epkey, stored))
            stored_control = wrap('control', new_control)
            w.realm.validate('coordinator', COORD + 'StorageEventPhase', stored, stage + '/event_phase')
            w.realm.validate('coordinator', COORD + 'StorageControl', stored_control, stage + '/control')
            ctx['stored_event_phase'], ctx['stored_control_event'] = stored, stored_control
            return [dict(table=family_table('eventphase'), key=epkey, expected=None, value=stored),
                    dict(table=family_table('control'), key=ckey, expected=ccell['version'], value=stored_control)]
        w.cut('before_event_phase')
        w.storage.transact_stamped(build, writer=self.owner_ref(ctx['op']))
        w.cut('after_event_phase')
        # compact readback, then the outer responder's final predicate before disclosure
        epcell = self.compact('eventphase', ctx['scope'], ctx['op'])[1]
        require(stage + '/event_phase_readback', mp(epcell['value']) == mp(ctx['stored_event_phase']))
        w.hook('after_helper:append_outer', ctx)
        self.check_evidence(ctx, evidence, stage='append_outer')
        self.current_sources(ctx, stage='append_outer')
        appended = dict(outcome='event_durable_held', evidence=evidence, event_phase=ctx['stored_event_phase']['record'],
                        control=ctx['stored_control_event']['record'], certification_visible=False)
        w.realm.validate('coordinator', APPEND + 'AppendedHeld', appended, 'append/result')
        ctx['evidence'] = evidence
        return appended

    def commit_native(self, ctx, appended):
        w = self.world
        stage = 'commit'
        with self.recorder.call(self.owner_id, 'owner.workflow.certified_event.commit_native.v1',
                                dict(op=ctx['op'])) as slot:
            require(stage + '/missing_participant', w.d01_store is w.storage and
                    w.native.storage is w.storage)
            guard = self.check_guard(ctx, self.acquire_guard(ctx, 'original_certification', stage='commit'),
                                     ('authentic_pending',), stage=stage)
            require(stage + '/guard_phase', guard['control']['record']['phase'] == 'event_durable')
            ckey, ccell = self.compact('control', ctx['scope'])
            crec = ccell['value']['record']
            require(stage + '/control_phase', crec['phase'] == 'event_durable')
            ikey, icell = self.compact('intent', ctx['scope'], ctx['op'])
            epkey, epcell = self.compact('eventphase', ctx['scope'], ctx['op'])
            require(stage + '/event_phase_unissued', epcell is not None)
            require(stage + '/event_phase_selector', A.same(crec['event_phase'], selector(epkey, epcell['value'])))
            require(stage + '/event_phase_bytes', mp(appended['event_phase']) == mp(epcell['value']['record']))
            self.check_evidence(ctx, appended['evidence'], stage=stage)
            intent = icell['value']['record']
            body, ncontrol, head = self.native_preimage(ctx, stage=stage)
            require(stage + '/native_preimage', A.same(intent['native_before_body'], selector(body['value']['physical_key'], body['value']))
                    and A.same(intent['native_before_control'], selector(ncontrol['value']['physical_key'], ncontrol['value'])))
            require(stage + '/d01_preimage', A.same(intent['native_before_head'], selector(head['key'], head['value'])))
            require(stage + '/native_status', body['value']['record']['status'] in ('verifying', 'provisional_success'))
            candidate = self.native_candidate(ctx, body, ncontrol)
            require(stage + '/native_candidate', intent['candidate_commitments']['whole_native_candidate_sha256'] ==
                    sha(sj(candidate)))
            self.current_sources(ctx, stage=stage)
            w.hook('after_helper:commit', ctx)
            issued_at = w.storage.now()
            okey = family_key('origin', ctx['scope'], ctx['op'])
            mkey = family_key('commit', ctx['scope'], ctx['op'])

            def build(tx_id):
                # F6 final predicate after every helper, immediately before the joint write.
                self.check_evidence(ctx, appended['evidence'], stage=stage + '_final')
                self.current_sources(ctx, stage=stage + '_final')
                b2, c2, h2 = self.native_preimage(ctx, stage=stage + '_final')
                require(stage + '/native_changed', b2['value'] == body['value'] and c2['value'] == ncontrol['value'] and
                        h2['native_pointer']['version'] == head['native_pointer']['version']
                        and h2['pointer']['version'] == head['pointer']['version'])
                standard = dict(receipt_key=N.receipt_key(ctx['scope']), capture_key=N.capture_key(ctx['scope']),
                                receipt=w.storage.cell_value('goal_receipt', N.receipt_key(ctx['scope'])),
                                capture=w.storage.cell_value('workflow_standard_capture_origin', N.capture_key(ctx['scope'])))
                require(stage + '/standard_unavailable', standard['receipt'] is not None and standard['capture'] is not None)
                require(stage + '/standard_origin', A.same(intent['standard_capture_origin'],
                                                           selector(standard['capture_key'], standard['capture'])))
                pub = V.publication(w,kind='certification',op=ctx['op'],tx=tx_id,issued_at=issued_at,
                                    after_body=candidate['candidate_workflow']['body'],
                                    after_control=candidate['candidate_workflow']['control'],
                                    source_sha=intent['source_commitments']['original_certification_source_sha256'],
                                    goal_sha=intent['source_commitments']['whole_goal_argument_sha256'],standard=standard)
                union, keys = pub['values'], pub['keys']
                sel = {name: selector(keys[name][1], union[name]) for name in union}
                commit = dict(scope=copy.deepcopy(ctx['scope']), owner=self.owner_ref(ctx['op']),
                              intent=selector(ikey, icell['value']), event_phase=selector(epkey, epcell['value']),
                              native_result=sel['native_result'], native_origin=sel['native_origin'],
                              d01_update=sel['d01_update'], d01_origin=sel['d01_origin'], d01_head=sel['d01_head'],
                              native_after_body=sel['native_after_body'], native_after_control=sel['native_after_control'],
                              standard_capture_origin=copy.deepcopy(intent['standard_capture_origin']),
                              clocks=copy.deepcopy(intent['clocks']),
                              whole_native_published_union_sha256=sha(mp(union)), issued_at_utc=issued_at,
                              transaction_id=tx_id)
                stored_commit = wrap('commit', commit)
                origin = dict(scope=copy.deepcopy(ctx['scope']), owner=self.owner_ref(ctx['op']),
                              issuer_method='owner.workflow.certified_event.commit_native.v1',
                              commit=selector(mkey, stored_commit), intent=selector(ikey, icell['value']),
                              event_phase=selector(epkey, epcell['value']), issued_at_utc=issued_at, transaction_id=tx_id)
                stored_origin = wrap('origin', origin)
                new_control = dict(crec, epoch=crec['epoch'] + 1, phase='native_committed',
                                   commit=selector(mkey, stored_commit), origin=selector(okey, stored_origin))
                stored_control = wrap('control', new_control)
                w.realm.validate('coordinator', COORD + 'NativeCandidates', dict(commit=commit, origin=origin,
                                                                                  control=new_control), stage + '/candidates')
                expected_union = copy.deepcopy(union)
                edited = w.hook('commit_writes', ctx, union)
                if edited is not None:
                    union = edited
                ctx['union'], ctx['union_keys'] = union, keys
                ctx['stored_commit'], ctx['stored_origin'], ctx['stored_control_committed'] = \
                    stored_commit, stored_origin, stored_control
                by_table = {keys[name][0]: union[name] for name in union}
                writes = [dict(x, value=by_table[x['table']]) for x in pub['writes']] + [
                    dict(table=family_table('commit'), key=mkey, expected=None, value=stored_commit),
                    dict(table=family_table('origin'), key=okey, expected=None, value=stored_origin),
                    dict(table=family_table('control'), key=ckey, expected=ccell['version'], value=stored_control)]
                drop = w.hook('drop_write', ctx)
                if drop:
                    writes = [x for x in writes if x['table'] != drop]
                # F6: the whole write set is independently checked before the joint commit.
                families=V.ST.d01_families(w.sw.edition)
                required={V.BODY,V.CONTROL,V.CURRENT,V.RESULT,V.ORIGIN,families['workflow_update'],
                          families['workflow_head'],families['pointer'],'executor_workflow_lineage_origin',
                          family_table('commit'),family_table('origin'),family_table('control')}
                require(stage + '/write_set', sorted(x['table'] for x in writes) == sorted(required))
                expected_by_table = {keys[name][0]: expected_union[name] for name in expected_union}
                for x in writes:
                    if x['table'] in expected_by_table:
                        require(stage + '/write_value', A.same(x['value'], expected_by_table[x['table']]))
                require(stage + '/union_commitment', commit['whole_native_published_union_sha256'] == sha(mp(union)))
                self.typed('native_commit',ctx,coordinator_candidates=dict(commit=commit,origin=origin,control=new_control))
                self.current_sources(ctx,stage='commit_after_typed')
                require('commit/last_pointer',self.native_preimage(ctx,stage='commit_last')[2]['native_pointer']['version']==head['native_pointer']['version'])
                return writes
            w.cut('before_native_commit')
            tx = w.storage.transact_stamped(build, writer=self.owner_ref(ctx['op']))
            w.cut('after_native_commit')
            published = dict(qualification=QUALIFICATION, transaction_id=tx['tx_id'], union=ctx['union'],
                             keys=ctx['union_keys'])
            ctx['guards']['commit'] = guard
            out = dict(outcome='native_committed_held', published_native_held=published,
                       commit=ctx['stored_commit'], origin=ctx['stored_origin'], control=ctx['stored_control_committed'],
                       all_member_append_evidence=appended['evidence'])
            slot.set(dict(tx=tx['tx_id']))
            return out

    def readback(self, ctx, committed):
        w = self.world
        stage = 'readback'
        with self.recorder.call(self.owner_id, 'owner.storage.certified_event.readback_held.v1',
                                dict(op=ctx['op'])) as slot:
            union = committed['published_native_held']['union']
            keys = committed['published_native_held']['keys']
            tx_id = committed['published_native_held']['transaction_id']
            cells = {name: w.storage.cell(*keys[name]) for name in keys}
            for name, cell in cells.items():
                require(stage + '/missing/' + name, cell is not None)
                require(stage + '/member/' + name, A.same(cell['value'], union[name]))
                require(stage + '/transaction/' + name, cell['tx'] == tx_id)
            for fam, stored in (('commit', committed['commit']), ('origin', committed['origin']),
                                ('control', committed['control'])):
                key, cell = self.compact(fam, ctx['scope'], ctx['op'])
                require(stage + '/compact/' + fam, cell is not None and mp(cell['value']) == mp(stored))
                require(stage + '/transaction/' + fam, cell['tx'] == tx_id)
            commit = committed['commit']['record']
            for name in ('native_result', 'native_origin', 'd01_update', 'd01_origin', 'd01_head', 'native_after_body',
                         'native_after_control'):
                require(stage + '/commit_selects/' + name, A.same(commit[name], selector(keys[name][1], union[name])))
            require(stage + '/union_commitment', commit['whole_native_published_union_sha256'] == sha(mp(union)))
            self.check_evidence(ctx, committed['all_member_append_evidence'], stage=stage)
            self.current_sources(ctx,stage=stage)
            self.typed('readback',ctx)
            self.current_sources(ctx,stage='readback_after_typed')
            require('readback/final_members',all(w.storage.cell(*keys[n])==c for n,c in cells.items()))
            readback = dict(union={k: c['value'] for k, c in cells.items()}, transaction_id=tx_id,
                            commit_sha256=sha(mp(committed['commit'])), origin_sha256=sha(mp(committed['origin'])))
            slot.set(readback)
            return readback

    def release(self, ctx, committed, readback):
        w = self.world
        stage = 'release'
        with self.recorder.call(self.owner_id, 'owner.workflow.certified_event.release.v1', dict(op=ctx['op'])) as slot:
            guard = self.check_guard(ctx, self.acquire_guard(ctx, 'original_certification', stage='release'),
                                     ('authentic_pending',), stage=stage)
            require(stage + '/guard_phase', guard['control']['record']['phase'] == 'native_committed')
            ckey, ccell = self.compact('control', ctx['scope'])
            crec = ccell['value']['record']
            require(stage + '/control_phase', crec['phase'] == 'native_committed')
            require(stage + '/readback', readback is not None and readback['transaction_id'] ==
                    committed['commit']['record']['transaction_id'])
            fresh = self.readback(ctx, committed)
            require(stage + '/readback_stale', A.same(fresh, readback))
            sources = self.current_sources(ctx, stage=stage)
            w.hook('after_helper:release', ctx)
            issued_at = w.storage.now()
            rkey = family_key('release', ctx['scope'], ctx['op'])

            def build(tx_id):
                self.current_sources(ctx, stage=stage + '_final')
                again = self.readback(ctx, committed)
                require(stage + '/readback_changed', A.same(again, readback))
                rec = dict(scope=copy.deepcopy(ctx['scope']), owner=self.owner_ref(ctx['op']),
                           commit=copy.deepcopy(crec['commit']), origin=copy.deepcopy(crec['origin']),
                           intent=copy.deepcopy(crec['intent']), event_phase=copy.deepcopy(crec['event_phase']),
                           original_event_id=ctx['identity']['event_id'],
                           whole_post_native_readback_sha256=sha(mp(readback)),
                           whole_release_current_sources_sha256=sha(sj(sources)), issued_at_utc=issued_at,
                           transaction_id=tx_id)
                stored = wrap('release', rec)
                new_control = dict(crec, epoch=crec['epoch'] + 1, phase='released', release=selector(rkey, stored))
                stored_control = wrap('control', new_control)
                w.realm.validate('coordinator', COORD + 'ReleaseCandidates', dict(release=rec, control=new_control),
                                 stage + '/candidates')
                ctx['stored_release'], ctx['stored_control_released'] = stored, stored_control
                self.typed('release',ctx,release_candidates=dict(release=rec,control=new_control))
                self.current_sources(ctx,stage='release_after_typed')
                return [dict(table=family_table('release'), key=rkey, expected=None, value=stored),
                        dict(table=family_table('control'), key=ckey, expected=ccell['version'], value=stored_control)]
            w.cut('before_release')
            tx = w.storage.transact_stamped(build, writer=self.owner_ref(ctx['op']))
            w.cut('after_release')
            retained = self.retained_authority(ctx['scope'], ctx['op'])
            out = dict(outcome='original_complete', retained=retained, control=ctx['stored_control_released'])
            ctx['guards']['release'] = guard
            slot.set(dict(tx=tx['tx_id']))
            return out

    def read_current(self, ctx):
        w = self.world
        stage = 'current'
        with self.recorder.call(self.owner_id, 'owner.workflow.certified_event.read_current.v1',
                                dict(op=ctx['op'])) as slot:
            guard = self.check_guard(ctx, self.acquire_guard(ctx, 'current_source', stage='current'),
                                     ('authentic_released',), stage=stage)
            ckey, ccell = self.compact('control', ctx['scope'])
            require(stage + '/released', ccell['value']['record']['phase'] == 'released')
            authority = self.retained_authority(ctx['scope'], ctx['op'])
            self.chain(ctx['scope'], ctx['op'], stage=stage)
            body, control, head = self.native_preimage(ctx, stage=stage)
            commit = authority['commit']
            require(stage + '/native_current', A.same(commit['native_after_body'], selector(body['value']['physical_key'],body['value'])) and
                    A.same(commit['native_after_control'], selector(control['value']['physical_key'],control['value'])))
            require(stage + '/d01_current', A.same(commit['d01_head'], selector(head['key'], head['value'])))
            self.current_sources(ctx, stage=stage)
            target = ctx['identity']['event_id']
            custody = w.storage.first_custody(target)
            require(stage + '/event_custody', custody is not None and
                    authority['event_phase']['first_custody']['sha256'] == sha(mp(custody)))
            w.hook('after_helper:current', ctx)
            # final predicate after all helpers under the held read fence
            self.check_guard(ctx, guard, ('authentic_released',), stage=stage + '_final')
            self.current_sources(ctx, stage=stage + '_final')
            b2,c2,h2=self.native_preimage(ctx,stage=stage+'_last')
            require(stage+'/native_changed',b2['value']==body['value'] and c2['value']==control['value'] and
                    h2['native_pointer']['version']==head['native_pointer']['version'])
            self.typed('current',ctx)
            out=dict(outcome='current_complete',retained=authority,published_native=self.published(ctx),
                     whole_original_event_source=self.original_event(ctx),all_member_append_evidence=ctx['evidence'])
            self.current_sources(ctx,stage='current_after_helpers')
            b3,c3,h3=self.native_preimage(ctx,stage='current_after_helpers')
            require('current/last_native',b3==b2 and c3==c2 and h3==h2)
            self.check_guard(ctx,guard,('authentic_released',),stage='current_after_helpers')
            slot.set(out)
            return out


    def _retained_response(self,request,method):
        """Passive classification plus every named method result in its own realm."""
        w=self.world
        declaration=next(m for m in F.METHODS['methods'] if m['method']==method)
        require('int/retained/arguments',len(declaration['arguments'])==1 and declaration['arguments'][0]['name']=='request')
        arg=declaration['arguments'][0]
        w.realm.validate(arg['realm'],arg['schema_ref'],request,'int/retained/request')
        before=w.storage.observe()
        classified=super().recover_original(request)
        outcome=classified['outcome']
        if outcome=='original_complete':
            from pm_goal_dg_int_certified_reader import Consumer
            source=Consumer(w.registry,w).retained_sources(request['scope'],request['operation_id'],stage='recover_original')
            target=classified['authority']['event_phase']['event_id']
            results=dict(retained=classified,native_retained_metadata=source['retained']['native'],
                standard_retained_metadata=source['receipt']['value']['original_certification'],
                standard_capture_origin=source['origin']['value'],
                original_event_custody=w.storage.first_custody(target),
                original_event_full_value_result=w.storage.full_value_result(target))
        else:results=dict(classification=classified)
        variant=next(v for v in declaration['return_variants'] if v['outcome']==outcome)
        require('int/retained/complete_results',set(results)=={r['name'] for r in variant['results']})
        for row in variant['results']:
            w.realm.validate(row['realm'],row['schema_ref'],results[row['name']],'int/retained/'+row['name'])
        require('int/retained/no_effect',w.storage.observe()==before)
        self.last_retained_results=results
        return dict(outcome=outcome,**results)

    def recover_original(self,request):
        return self._retained_response(request,'owner.workflow.certified_event.recover_original.v1')

    def read_retained(self,request):
        return self._retained_response(request,'owner.workflow.certified_event.read_retained.v1')


class Identity(F.WholeIdentityOwner):
    def derive(self,scope,handles,**kw):
        w=self.world
        handle,request=super().derive(scope,handles,**kw)
        result=A.acquire(w.registry,self.owner_id,'identity',handle)[1]
        roles=dict(native='native_source',goal='goal',standard='standard',assignment='assignment',
                   invocation='invocation',resolver='resolver',references='references',causal='causality',partition='storage_partition')
        got={name:A.acquire(w.registry,handles[name][0],role,handles[name][1])[1] for name,role in roles.items()}
        arguments=dict(request=request,identity_input=result['input'],original_certification_source=got['native']['whole'],
                       current_goal=got['goal']['argument'],durable_standard=got['standard']['whole'],
                       assignment=got['assignment'],invocation=got['invocation'],resolver=got['resolver'],
                       references=got['references'],causal=got['causal'],original_storage_partition_and_route=got['partition']['whole'])
        dispatch(w,'identity',arguments)
        F.live_recheck(w,scope,got,'int/identity','final')
        self.joins(scope,got)
        return handle,request


def build_context(w,*,op='TEST_ONLY:operation:certified:dg-int'):
    """Execute CF1 owners and retain their handles; the coordinator owns the append."""
    scope=w.scope
    w.certification_operation=op
    if not hasattr(w,'original_start'):w.native.start(scope)
    else:
        from pm_goal_dg_s_readers import original_started
        require('int/context/existing_start',w.original_start==original_started(w.sw,where='int/context/existing_start') and
            w.native.state(scope)['body']['status']=='running')
    w.values['cause_event_id']=w.original_start['original_append']['event']['event_id']
    for cid in w.values['criteria']:w.native.add_criterion(scope,cid,'satisfied')
    w.native.set_source_control(scope,'clean')
    for wn in w.values['worknodes']:w.native.run_worknode(scope,wn)
    w.native.provisional_success(scope)
    handles={}
    handles['goal']=(w.goal.owner_id,w.goal.argument('CurrentGoalArgument',scope['goal_id']))
    decision=(w.final.owner_id,w.final.issue(scope,handles['goal']))
    handles['standard']=(w.standard.owner_id,w.standard.capture(scope,decision,handles['goal']))
    handles['native']=(w.native_source.owner_id,w.native_source.issue_source(scope,decision))
    asg,_=w.assignment.issue_for(scope,w.values)
    handles['assignment']=(w.assignment.owner_id,asg)
    assignment=A.acquire(w.registry,*[w.assignment.owner_id,'assignment',asg])[1]
    for name,owner in [('invocation',w.invocation),('resolver',w.resolver),('references',w.references),('causal',w.causality)]:
        handle=owner.issue_for(scope,w.values,assignment) if name=='invocation' else owner.issue_for(scope,w.values)
        handles[name]=(owner.owner_id,handle)
    handles['partition']=(w.partition.owner_id,w.partition.issue_for(scope))
    handles['descriptor']=(w.profile.owner_id,w.profile_handle)
    identity,request=w.identity.derive(scope,handles)
    ih=(w.identity.owner_id,identity)
    producer,event=w.producer.prepare(scope,ih,handles)
    std=A.acquire(w.registry,w.standard.owner_id,'standard',handles['standard'][1])[1]
    dec=A.acquire(w.registry,w.final.owner_id,'final_decision',decision[1])[1]
    candidate=w.native.prepare_certified(scope,standard=std,decision_check=lambda state:F.check_decision(w,scope,dec,'int/candidate'))
    roles=dict(native='native_source',goal='goal',standard='standard',assignment='assignment',invocation='invocation',
               resolver='resolver',references='references',causal='causality',partition='storage_partition')
    src={name:A.acquire(w.registry,handles[name][0],role,handles[name][1])[1] for name,role in roles.items()}
    prepared=A.acquire(w.registry,w.producer.owner_id,'producer',producer)[1]
    return dict(scope=w.coord_scope(scope),op=op,values=dict(goal=dict(goal_id=scope['goal_id'])),src=src,
                goal=src['goal'],identity=A.acquire(w.registry,w.identity.owner_id,'identity',identity)[1],
                producer25=event,producer_source=prepared['whole_producer_source'],producer_handle=producer,
                handles=handles,candidate_handle=candidate,native_candidate=A.acquire(w.registry,w.native.owner_id,'native',candidate)[1]['whole'],
                request=request,guards={},presented={},identity_handle=identity,coordinator_owner_epoch=w.coordinator.owner_epoch)


def run(w,ctx):
    co=w.coordinator
    prepared=co.prepare(ctx)
    intent,control=co.arm(ctx,prepared)
    appended=co.append_held(ctx,intent,control)
    committed=co.commit_native(ctx,appended)
    readback=co.readback(ctx,committed)
    released=co.release(ctx,committed,readback)
    current=co.read_current(ctx)
    return dict(prepared=prepared,appended=appended,committed=committed,readback=readback,released=released,current=current)
