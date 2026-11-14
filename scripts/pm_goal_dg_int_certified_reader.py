#!/usr/bin/env python3
"""Whole S2/native-v7 certified retained/current readers (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

The CF2 reader's complete predicates are reused with the actual native/D01
families of the unified store. No source schema or original value is adapted.
"""
from __future__ import annotations
import copy
import types
import pm_goal_dg_cf2_consumer as C
import pm_goal_dg_cf2_native as N
import pm_goal_dg_cf2_world as W
import pm_goal_dg_int_v7 as V


def _port(fn,**names):
    namespace=dict(fn.__globals__,**names)
    out=types.FunctionType(fn.__code__,namespace,fn.__name__,fn.__defaults__,fn.__closure__)
    out.__kwdefaults__=fn.__kwdefaults__
    return out


_native=types.SimpleNamespace(**{k:v for k,v in vars(N).items() if not k.startswith('__')})
_native.T_RESULT=V.RESULT
_native.T_ORIGIN=V.ORIGIN
_native.T_UPDATE='executor_workflow_workflow_update'
_native.T_HEAD='executor_workflow_workflow_head'
_native.T_MUTATION='executor_workflow_lineage_origin'
_native.T_RECEIPT='goal_receipt'
_native.T_CAPTURE='workflow_standard_capture_origin'
_native.selof=lambda storage,table,key,value:V.physical(types.SimpleNamespace(storage=storage),table,key,value)


class Consumer(C.Consumer):
    retained_sources=_port(C.Consumer.retained_sources,N=_native)
    inspect_original=_port(C.Consumer.inspect_original,N=_native)

    def projection_record(self,scope,op,retained,inspected):
        st=self.world.storage
        coord=retained['coordinator'];commit=coord['commit']['record']
        upd=retained['native']['d01_update']['value']['record']
        ev=inspected['original_event']
        record=dict(scope=N.run_scope(scope),status_at_original_event='certified',activation_at_original_event='active',
            original_event=copy.deepcopy(ev['event']),native_before_commitment=copy.deepcopy(upd['transition']['before']),
            native_after_commitment=copy.deepcopy(upd['transition']['after']),
            original_event_value_commitment=copy.deepcopy(ev['whole_value_commitment']),
            producer_semantic_digest=ev['exact_custody']['producer_semantic_digest'],
            first_append_receipt=copy.deepcopy(ev['first_append_receipt']),action_authority=False)
        tables=dict(native_result=_native.T_RESULT,native_origin=_native.T_ORIGIN,d01_update=_native.T_UPDATE,
                    d01_origin=_native.T_MUTATION,d01_head=_native.T_HEAD)
        for name,table in tables.items():
            value=retained['native'][name]['value']
            record['original_'+name]=V.physical(self.world,table,commit[name]['key'],value)
        for name,table,key,value in (
            ('standard_receipt',_native.T_RECEIPT,retained['standard_key'],retained['receipt']['value']),
            ('standard_capture_origin',_native.T_CAPTURE,retained['origin_key'],retained['origin']['value'])):
            record['original_'+name]=V.physical(self.world,table,key,value)
        for family in ('commit','origin','release'):
            record['original_coordinator_'+family]=V.physical(self.world,W.family_table(family),
                W.family_key(family,scope,op),coord[family])
        self.validate('CertifiedProjection',record,'int/certified/projection')
        C.require('int/certified/before_after',upd['transition']['before']['body']['physical_value_sha256']==
            coord['intent']['record']['native_before_body']['sha256'] and
            upd['transition']['after']['body']['physical_value_sha256']==commit['native_after_body']['sha256'])
        return record

    def read_current(self,ctx):
        out=super().read_current(ctx)
        current=self.world.coordinator.read_current(ctx)
        C.require('int/certified/final_current',current['published_native']==out['published_native'])
        self.current_prefix(self.reopen(ctx['scope']),stage='int/certified/final')
        return out
