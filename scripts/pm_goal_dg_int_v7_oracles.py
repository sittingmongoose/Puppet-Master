#!/usr/bin/env python3
"""Unified DG-INT whole-source phase and final-boundary oracles (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.
"""
from __future__ import annotations
import argparse,copy,json,tempfile,time,traceback
from pathlib import Path
import pm_goal_test_owner_adapters as A
import pm_goal_test_storage as S
import pm_goal_test_source as GS
import pm_goal_dg_int_v7 as V
import pm_goal_dg_int_coordinator as C
import pm_goal_dg_int_group as G
import pm_goal_dg_int_certified_reader as Reader
import pm_goal_dg_int_reducer as Reducer

BASE=Path('/home/sittingmongoose/pm-scratch/dg-int/tmp')


class Run:
    def __init__(self,only=None):self.rows=[];self.only=only
    def case(self,name,fn,expected=None):
        if self.only and self.only not in name:return
        start=time.monotonic();row=dict(id=name,kind='positive' if expected is None else 'negative',expected=expected)
        try:
            result=fn()
            row.update(status='pass' if expected is None else 'fail',detail=result,got=None if expected is None else 'ACCEPTED')
        except Exception as error:
            code=getattr(error,'code',None) or str(error)
            row.update(got=code,status='pass' if expected is not None and code==expected else 'fail')
            if row['status']=='fail':row['trace']=traceback.format_exc(limit=6);row['detail']=getattr(error,'detail',None)
        row['seconds']=round(time.monotonic()-start,2);self.rows.append(row)
        print(name,row['status'],row.get('got'),flush=True)


def world(**kwargs):
    BASE.mkdir(parents=True,exist_ok=True)
    return V.World(Path(tempfile.mkdtemp(prefix='dgint-v7-oracle-',dir=BASE)),**kwargs)


def snapshot(w):
    return dict(observe=w.storage.observe(),cells=w.storage.snapshot()['cells'],token=w.storage.read_token())


def certified(run):
    w=world();ctx=C.build_context(w)
    queued=G.QueuedGoal(w);queued.freeze()
    result=C.run(w,ctx)
    run.case('CF06/genuine_two_scope_group_all_members',lambda:group(w,ctx))
    c=Reader.Consumer(w.registry,w)
    run.case('CF07/whole_joint_union',lambda:joint(w,ctx,result))
    run.case('P7/certified_retained_and_current',lambda:certified_reads(w,ctx,c))
    run.case('P4/whole_started_certified_prefix',lambda:reduced(w))
    # Every declared operand is required, independently of source authority.
    # The positive above invokes the real phase owners; this matrix tests the
    # tuple boundary while the real owner/custody negatives below test authority.
    for phase,args in list(w.typed_arguments.items()):
        for name in args:
            def omit(phase=phase,args=args,name=name):
                before=snapshot(w);bad=dict(args);del bad[name]
                try:return C.dispatch(w,phase,bad)
                finally:A.require('oracle/omission_effect',snapshot(w)==before)
            run.case('F0/'+phase+'/missing/'+name,omit,'int/dispatch/complete/'+phase)
    # A transport-level alteration cannot replace the protected identity root.
    original=ctx['identity'];bad=copy.deepcopy(original);bad['event_id']+='-altered'
    def identity_transport():
        before=snapshot(w);ctx['identity']=bad
        try:return w.coordinator.current_sources(ctx,stage='identity_transport')
        finally:ctx['identity']=original;A.require('oracle/identity_effect',snapshot(w)==before)
    run.case('CF08/identity_transport_substitution',identity_transport,'identity_transport/identity_original')


def group(w,ctx):
    st=w.storage;g=st.active_durable_group(ctx['identity']['event_id'])
    A.require('oracle/group_two',len(g['members'])==2)
    types=[]
    for member in g['members']:
        event=st.read_event(member['event_id']);custody=st.first_custody(event['event_id'])
        A.require('oracle/all_member_custody',custody is not None and custody['group_digest']==g['group_digest'])
        A.require('oracle/registered',(event['event_type'],event['scope_kind'],event['payload_schema_id']) in GS.event_family_registration()[0])
        types.append(event['event_type'])
    A.require('oracle/genuine_families',types==['goal_run.certified','goal.cancelled'])
    return dict(types=types,group_digest=g['group_digest'])


def joint(w,ctx,result):
    held=result['committed']['published_native_held'];keys=held['keys'];tx=held['transaction_id']
    A.require('oracle/native_members',len(keys)==9 and 'native_pointer' in keys and 'd01_pointer' in keys)
    for name,key in keys.items():
        cell=w.storage.cell(*key)
        A.require('oracle/member/'+name,cell['tx']==tx and cell['value']==held['union'][name])
    return dict(transaction=tx,members=sorted(keys),current=result['current']['outcome'])


def certified_reads(w,ctx,c):
    c.publish_projection(ctx['scope'],ctx['op']);before=snapshot(w)
    c.read_retained_native(ctx['scope'],ctx['op']);c.inspect_original(ctx['scope'],ctx['op'])
    c.read_historical(ctx['scope'],ctx['op']);out=c.read_current(ctx)
    A.require('oracle/read_effect',snapshot(w)==before)
    return out['interpretation']


def reduced(w):
    c=Reducer.IntConsumer(w);scope=Reducer.run_scope(w)
    src=Reducer.LegacySources(w.storage,scope,c.controls)
    before=snapshot(w);r=Reducer.reduce_prefix(src.generic,scope,src.cells)
    A.require('oracle/reducer_effect',snapshot(w)==before)
    A.require('oracle/reduced',r['complete'] and r['halt'] is None and r['status']=='certified')
    return dict(status=r['status'],rows=len(r['pairs']),through=r['through'])


def boundary(run,point,fact,expected):
    def case():
        w=world();ctx=C.build_context(w);co=w.coordinator
        after={}
        def change(world,context):
            if fact=='permission':world.permission.revoke(world.scope['goal_run_id'])
            elif fact=='stop':world.sw.owners['goal'].latch_stop()
            elif fact=='withdraw':world.native_source.withdraw(ctx['handles']['native'][1])
            elif fact=='epoch':world.native_source.owner_epoch+=1
            after['snapshot']=snapshot(world)
        w.hooks[point]=change
        try:
            p=co.prepare(ctx);i,k=co.arm(ctx,p);a=co.append_held(ctx,i,k);m=co.commit_native(ctx,a)
            rb=co.readback(ctx,m);co.release(ctx,m,rb);return co.read_current(ctx)
        finally:
            A.require('oracle/hook_reached',bool(after))
            A.require('oracle/denied_method_wrote',snapshot(w)==after['snapshot'])
    run.case('CF08/'+point+'/'+fact,case,expected)


def boundaries(run):
    for point,stage in [('after_helper:prepare','prepare_final'),('after_helper:arm','arm_final'),
                        ('after_helper:f5d','f5d_final'),('after_helper:commit','commit_final'),
                        ('after_helper:release','release_final'),('after_helper:current','current_final')]:
        for fact,code in [('permission','permission'),('stop','goal_current')]:
            # These protected writes invalidate the held current-read fence
            # before its subsequent individual permission/Stop comparison.
            expected='current_final/guard_stale' if stage=='current_final' else stage+'/'+code
            boundary(run,point,fact,expected)
    boundary(run,'after_helper:append_outer','withdraw','original/withdrawn')
    boundary(run,'after_helper:current','epoch','current_final/issuer_epoch/native')


def retention(run):
    def survivor():
        w=world(segment_target_bytes=6000);ctx=C.build_context(w);G.QueuedGoal(w).freeze();C.run(w,ctx)
        start=w.original_start['original_append']['event'];target=w.storage.read_event(ctx['identity']['event_id'])
        generation=w.storage.events[start['event_id']]['segment_generation']
        A.require('survivor/target_survives',generation!=w.storage.events[target['event_id']]['segment_generation'])
        disposition=w.storage.retire_segment(generation,S.RetentionOwner(w.storage))
        consumer=Reducer.IntConsumer(w);scope=Reducer.run_scope(w)
        src=Reducer.LegacySources(w.storage,scope,consumer.controls);before=snapshot(w)
        result=Reducer.reduce_prefix(src.generic,scope,src.cells)
        A.require('survivor/read_effect',snapshot(w)==before)
        A.require('survivor/exact',result['complete'] and result['halt'] is None and result['status']=='certified' and
            result['record']['original_event']==target and bool(result['gaps']))
        return dict(start_revision=start['payload']['goal_run_revision'],
            native_before=target['payload']['expected_goal_run_revision'],
            gap_frames=disposition['frame_count'],gaps=result['gaps'])
    run.case('CF10-P4/authentic_expired_Start_survivor_and_nonadjacent_native_revisions',survivor)


def prefix_faults(run):
    for kind in ('goal_run.started','goal_run.blocked','goal_run.stopped','goal_run.replanned','goal_run.cancelled','unknown.off_run'):
        def case(kind=kind):
            w=world();ctx=C.build_context(w);C.run(w,ctx)
            consumer=Reducer.IntConsumer(w);scope=Reducer.run_scope(w)
            before=Reducer.LegacySources(w.storage,scope,consumer.controls)
            good=Reducer.reduce_prefix(before.generic,scope,before.cells)
            A.require('prefix/base',good['complete'] and good['status']=='certified')
            candidate=S.producer25(w.original_start['original_append']['event'])
            candidate.update(event_id='TEST_ONLY:fault:'+kind,idempotency_key='TEST_ONLY:fault:'+kind,event_type=kind)
            registered=GS.event_family_registration()[0]
            if kind=='unknown.off_run':candidate.update(project_id='TEST_ONLY:offrun',payload_schema_id='TEST_ONLY:unregistered')
            else:candidate['payload_schema_id']=next(schema for event,scope_kind,schema in registered if event==kind)
            w.appender.append_original('TEST_ONLY:prefix-fault:'+kind,dict(kind=kind),[candidate],durability_class='barrier')
            src=Reducer.LegacySources(w.storage,scope,consumer.controls);state=snapshot(w)
            result=Reducer.reduce_prefix(src.generic,scope,src.cells)
            A.require('prefix/fault_effect',snapshot(w)==state)
            A.require('prefix/no_frontier_advance',not result['complete'] and result['halt'] is not None and
                result['through']==good['through'] and result['record']==good['record'])
            return dict(halt=result['halt'],through=result['through'])
        run.case('CF10-P4/full_prefix_halts/'+kind,case)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--groups',default='CERT,BOUNDS');parser.add_argument('--output',required=True)
    parser.add_argument('--filter')
    args=parser.parse_args();run=Run(args.filter)
    for group_name in args.groups.split(','):
        {'CERT':certified,'BOUNDS':boundaries,'RETENTION':retention,'PREFIX':prefix_faults}[group_name](run)
    failures=[r for r in run.rows if r['status']!='pass']
    if not run.rows:raise ValueError('No matching oracle cases')
    result=dict(qualification='TEST_ONLY',native=V.NATIVE_LINE,status='pass' if not failures else 'fail',
        positives=sum(r['kind']=='positive' for r in run.rows),negatives=sum(r['kind']=='negative' for r in run.rows),
        failures=failures,cases=run.rows)
    Path(args.output).write_text(json.dumps(result,indent=1,default=str)+'\n')
    return bool(failures)


if __name__=='__main__':raise SystemExit(main())
