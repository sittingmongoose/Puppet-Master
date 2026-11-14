#!/usr/bin/env python3
"""DG-INT TEST_ONLY whole Standard and candidate source composition.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

CF1's admission/gate predicates and owner-held originals feed the native v7
physical publishers. A candidate remains prospective and action_authority=none;
its selectors acquire no original custody until the coordinator commits.
"""
from __future__ import annotations
import copy
import hashlib
import json

import pm_goal_test_owner_adapters as A
import pm_goal_test_storage as S
import pm_goal_dg_cf1_world as F
import pm_goal_dg_cf2_world as W
import pm_goal_dg_cf2_native as N
import pm_goal_dg_int_v7 as V

QUALIFICATION='TEST_ONLY'
NATIVE_LINE=V.NATIVE_LINE
require=A.require
RECEIPT='goal_receipt'
CAPTURE='workflow_standard_capture_origin'


class Standard(F.StandardOwner):
    """CF1 U/G admission followed by the complete physical Standard capture."""
    def capture(self,scope,decision_handle,goal_handle,*,decision_override=None):
        w=self.world
        with self.recorder.call(self.owner_id,'capture_standard') as slot:
            _,decision=A.acquire(w.registry,decision_handle[0],'final_decision',decision_handle[1])
            if decision_override:decision=decision_override(copy.deepcopy(decision))
            state=F.check_decision(w,scope,decision,'standard')
            _,goal=A.acquire(w.registry,goal_handle[0],'goal',goal_handle[1])
            body,control,binding=w.goal.current(scope['goal_id'])
            require('standard/goal_stop',goal['stop_state']=='none')
            require('standard/goal_current',control['value']['stop_state']=='none' and
                    body['version']==goal['goal_body_version'] and binding['value']['bound_goal_run_id']==scope['goal_run_id'])
            native_source=w.native.compose_source(scope,state,decision)
            validators=[]
            bindings=[]
            for key,record in sorted(state['validators'].items()):
                value=dict(validator_id=record['validator_id'],outcome=record['outcome'],evidence_ref=record['evidence_ref'])
                validators.append(value)
                bindings.append(dict(validator_id=record['validator_id'],source_ref=key,source_sha256=W.sha(W.mp(record))))
            values=dict(assignment=dict(actor_ref=w.values['actor_ref']),native=dict(
                evidence_refs=[v['evidence_ref'] for v in validators], artifact_refs=list(state['artifacts']),
                validator_outputs=validators,worknode_receipt_refs=list(decision['receipt']['worknode_receipt_refs'])))
            auth_key='TEST_ONLY:standard-authority:'+S.k_component(scope['goal_run_id'])
            auth=dict(qualification=QUALIFICATION,issuer=self.owner_id,actor_ref=w.values['actor_ref'],
                      scope=copy.deepcopy(scope),profile_sha256=w.profile_sha,decision_tx=decision['transaction_id'],
                      decision_receipt_sha256=decision['receipt_sha256'],action='capture_standard',state='authorized')
            # A registered owner authorizes this modeled capture from the actual certified decision.
            w.storage.transact([dict(table='TEST_ONLY:standard_authority',key=auth_key,expected=None,value=auth)])
            auth_handle=self._issue(None,auth,kind='standard_authorization')
            issued_at=w.storage.now()
            out={}
            def build(tx):
                # Repeat U/G and Goal predicates after the last helper, before this one transaction.
                F.check_decision(w,scope,decision,'standard_final')
                b,c,br=w.goal.current(scope['goal_id'])
                require('standard_final/goal',b['version']==goal['goal_body_version'] and c['value']['stop_state']=='none'
                        and br['value']['bound_goal_run_id']==scope['goal_run_id'])
                _,held=A.acquire(w.registry,self.owner_id,'standard',auth_handle)
                require('standard_final/authorization',held==auth and w.storage.cell('TEST_ONLY:standard_authority',auth_key)['value']==held)
                value=N.standard_values(w,w.coord_scope(scope),tx=tx,issued_at=issued_at,values=values,
                       native_source=native_source,goal=goal['argument'],body=state['whole_body']['record'])
                original=value['receipt']['original_certification']
                original.update(source_workflow_ref=state['whole_body']['physical_key'],
                                source_workflow_sha256=W.sha(W.mp(state['whole_body'])),
                                validator_source_bindings=bindings,
                                authority_checks=[dict(authority_ref=auth_key,authority_sha256=W.sha(W.mp(auth)),
                                    target_ref=state['whole_body']['physical_key'],certifier_ref=w.values['actor_ref'],decision='authorized')])
                # The original value changed before issuance, so the capture commits its actual final bytes.
                origin=value['capture']['record']
                origin.update(original_standard_argument_sha256=W.sha(W.sj(original)),
                              physical_sha256=W.sha(W.mp(value['receipt'])),source_semantic_sha256=W.sha(W.sj(original)),
                              original_owner_ref=self.owner_id,original_owner_epoch=self.owner_epoch)
                durable=dict(physical_receipt=value['receipt'],original_issuance=value['capture'])
                F.rvalidate('DurableStandardRead',durable,'int/standard/durable')
                out.update(value,durable=durable,tx_id=tx)
                return [dict(table=RECEIPT,key=value['receipt_key'],expected=None,value=value['receipt']),
                        dict(table=CAPTURE,key=value['capture_key'],expected=None,value=value['capture'])]
            w.storage.transact_stamped(build,writer=dict(owner_id=self.owner_id,owner_epoch=self.owner_epoch,
                                                       operation_id='TEST_ONLY:standard-capture:'+scope['goal_run_id']))
            record=dict(whole=out['durable'],durable_read=out['durable'],receipt_ref=out['receipt_id'],
                        storage_key=out['receipt_key'],tx_id=out['tx_id'],goal_run_id=scope['goal_run_id'],
                        final_certifier_decision='certified',decision_receipt_sha256=decision['receipt_sha256'])
            w.standard_values=out
            handle=self._issue(None,record,kind='durable_standard')
            slot.set(dict(receipt_ref=record['receipt_ref'],tx_id=record['tx_id']))
            return handle

    def durable(self,record):
        st=self.world.storage
        receipt=st.cell(RECEIPT,record['storage_key'])
        capture=st.cell(CAPTURE,record['whole']['original_issuance']['physical_key'])
        return receipt is not None and capture is not None and receipt['tx']==capture['tx']==record['tx_id'] and \
            receipt['value']==record['whole']['physical_receipt'] and capture['value']==record['whole']['original_issuance']


class NativeSource(F.NativeSourceIssuer):
    def issue_source(self,scope,decision_handle,*,edit=None):
        handle=super().issue_source(scope,decision_handle,edit=edit)
        self.last=(copy.deepcopy(scope),handle)
        return handle


def candidate(native,scope,*,standard,decision_check):
    w=native.world
    with native.recorder.call(native.owner_id,'prepare_certified') as slot:
        state=native.state(scope)
        decision_check(state)
        require('prepare/status',state['body']['status'] in ('provisional_success','verifying'))
        require('prepare/standard',w.standard.durable(standard))
        require('int/candidate/source_scope',w.native_source.last[0]==scope)
        _,source=A.acquire(w.registry,w.native_source.owner_id,'native_source',w.native_source.last[1])
        require('int/candidate/source_current',source['body_version']==state['body_version'])
        current=w.sw.owners['native'].current()
        after=copy.deepcopy(current['body'])
        rev=V.NR.uint64(after['record']['revision']+1,'int/candidate/revision')
        after.update(physical_key=w.sw.owners['native'].body_key(rev))
        sv=w.standard_values
        after['record'].update(status='certified',revision=rev,certification_receipt=dict(
            source=V.physical(w,RECEIPT,sv['receipt_key'],sv['receipt']),
            origin=V.physical(w,CAPTURE,sv['capture_key'],sv['capture'])))
        control=copy.deepcopy(current['control'])
        control['physical_key']=w.sw.owners['native'].control_key(rev)
        control['record'].update(revision=rev,body_record_sha256=V.SW.cdigest(after['record']))
        op=getattr(w,'certification_operation','TEST_ONLY:operation:certified:dg-int')
        prospective_tx='TEST_ONLY:prospective-native-transaction:'+op
        pub=V.publication(w,kind='certification',op=op,tx=prospective_tx,issued_at=w.storage.now(),
            after_body=after,after_control=control,source_sha=W.sha(W.sj(source['whole'])),
            goal_sha=W.sha(W.sj(w.sw.owners['goal'].current_argument())),standard=sv)
        lineage=dict(current=copy.deepcopy(state['d01_current']['workflow']),
                     before=dict(body=current['body'],control=current['control']),candidate=dict(body=after,control=control),
                     rule='original_standard_certification',original_owner=dict(kind='standard_original',
                         result=pub['values']['native_result'],origin=pub['values']['native_origin']),
                     operation_id=op,transaction_id=prospective_tx)
        whole=dict(original_final_decision=copy.deepcopy(source['whole']['original_final_decision']),
                   candidate_workflow=dict(body=after,control=control),candidate_lineage=lineage,action_authority='none')
        F.rvalidate('CertificationCandidateResult',whole,'int/candidate/whole')
        logical_after=dict(state['body'],status='certified',body_revision=rev,certification_receipt=standard['receipt_ref'])
        record=dict(whole=whole,before=state['body'],after=logical_after,rule='original_standard_certification',
                    cause='completion_certification',before_revision=state['body']['body_revision'],after_revision=rev,
                    action_authority='none',head_revision=state['head']['revision'])
        h=native._issue(None,record,kind='certification_candidate')
        slot.set(dict(before_revision=record['before_revision'],after_revision=rev))
        return h
