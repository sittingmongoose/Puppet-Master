#!/usr/bin/env python3
"""Unified v7 process interruption and whole-publication corpus (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.
"""
import argparse,copy,json,subprocess,sys,tempfile,types
from pathlib import Path
import pm_goal_test_owner_adapters as A
import pm_goal_test_storage as S
import pm_goal_dg_cf2_world as W
import pm_goal_dg_cf2_oracles as O
import pm_goal_dg_int_coordinator as C
import pm_goal_dg_int_group as G
import pm_goal_dg_int_certified_reader as Reader
import pm_goal_dg_int_v7 as V
from pm_goal_dg_int_v7_oracles import Run,world,snapshot,BASE


def child_run(work,cut):
    w=V.World(work);ctx=C.build_context(w);queued=G.QueuedGoal(w);queued.freeze()
    co=w.coordinator
    prepared=co.prepare(ctx)
    request=W.recovery_request(w,ctx,prepared['intent'])
    def save_request(record):
        request=W.recovery_request(w,ctx,record)
        (work/'recovery.json').write_text(json.dumps(dict(request=request,storage=str(w.storage.root),profile=w.profile_sha)))
    save_request(prepared['intent'])
    # Arm assigns the actual transaction id after prepare's prospective id.
    # Preserve the original issued Intent commitment before any crash cut.
    w.hooks['arm_built']=lambda world,context:save_request(context['stored_intent']['record'])
    w.lane_cut=cut if cut in W.LANE_CUTS else None;w.lane_mode='exit'
    if cut in O.STORAGE_CUTS:
        w.hooks['preappend']=lambda w,ctx:setattr(w.storage,'faults',S.FaultPlan(cut=cut,mode='exit'))
    i,k=co.arm(ctx,prepared);a=co.append_held(ctx,i,k);m=co.commit_native(ctx,a)
    rb=co.readback(ctx,m);co.release(ctx,m,rb)


def child_classify(work):
    metadata=json.loads((work/'recovery.json').read_text())
    st=V.Storage.open(metadata['storage']);registry=A.OwnerRegistry()
    w=types.SimpleNamespace(storage=st,registry=registry,recorder=registry.recorder,
        realm=W.realm_bank(),profile_sha=metadata['profile'])
    w.coordinator=C.Coordinator(registry,w)
    before=st.observe();request=metadata['request'];out=w.coordinator.recover_original(request)
    classification=out.get('classification',out.get('retained'))
    repeats=[]
    for _ in range(2):
        try:
            again=w.coordinator.reenter(request);repeats.append(again['outcome'])
        except A.AdapterRefusal as error:repeats.append(error.code)
    A.require('matrix/passive',before==st.observe())
    if out['outcome']!='original_complete':
        try:Reader.Consumer(registry,w).retained_sources(request['scope'],request['operation_id'],stage='unreleased')
        except A.AdapterRefusal:pass
        else:raise A.AdapterRefusal('matrix/unreleased_disclosed')
    print(json.dumps(dict(outcome=out['outcome'],classification=classification,reentry=repeats,
        unchanged=before==st.observe(),events=st.observe()['events'],custody=st.observe()['custody'],results=sorted(out))))


def matrix(run):
    for cut in O.MATRIX_ORDER:
        def case(cut=cut):
            work=Path(tempfile.mkdtemp(prefix='dgint-matrix-',dir=BASE))
            cmd=[sys.executable,__file__,'--child','run','--work',str(work)]
            if cut:cmd+=['--cut',cut]
            proc=subprocess.run(cmd,capture_output=True,text=True)
            A.require('matrix/child_exit',proc.returncode==(0 if cut is None else S.CRASH_EXIT))
            proc=subprocess.run([sys.executable,__file__,'--child','classify','--work',str(work)],capture_output=True,text=True)
            if proc.returncode:raise RuntimeError(proc.stderr[-5000:])
            out=json.loads(proc.stdout.splitlines()[-1]);expected=O.EXPECTED[cut]
            A.require('matrix/classification',all(out['classification'].get(k)==v for k,v in expected.items()))
            A.require('matrix/reentry',out['reentry']==(['original_complete']*2 if expected['outcome']=='original_complete'
                else ['reenter/live_invocation_lost']*2))
            A.require('matrix/passive',out['unchanged'])
            return out
        run.case('CF06-07/process/'+str(cut),case)


def append_faults(run):
    cases=[('future_custody','preappend',lambda w,c:c['presented'].update(first_custody={}), 'f5a/future_inputs'),
        ('ordinary_barrier','durability',lambda w,c:'ordinary','f5d/barrier_durability'),
        ('filtered_receipts','receipts',lambda w,c,r:r[:1],'f5c/all_members'),
        ('filtered_evidence','evidence',lambda w,c,e:e['members'].pop(),'f5d/member_set'),
        ('altered_producer','after_helper:f5a',lambda w,c:c['producer25'].update(actor_ref='TEST_ONLY:borrowed'), 'f5a/producer25')]
    for name,point,hook,expected in cases:
        def case(point=point,hook=hook):
            w=world();ctx=C.build_context(w);G.QueuedGoal(w).freeze();co=w.coordinator
            prepared=co.prepare(ctx);i,k=co.arm(ctx,prepared);w.hooks[point]=hook
            return co.append_held(ctx,i,k)
        run.case('CF06/'+name,case,expected)
    # The same operation can expose original held facts, without another append.
    def equal_retry():
        w=world();ctx=C.build_context(w);G.QueuedGoal(w).freeze();co=w.coordinator
        p=co.prepare(ctx);i,k=co.arm(ctx,p);first=co.append_held(ctx,i,k);before=snapshot(w)
        second=co.append_held(ctx,i,k)
        A.require('retry/effect',snapshot(w)==before)
        A.require('retry/same_evidence',first['evidence']==second['evidence'])
        return dict(events=w.storage.observe()['events'])
    run.case('CF06/equal_retry_original_facts_only',equal_retry)


def joint_faults(run):
    w=world();ctx=C.build_context(w);co=w.coordinator
    def denied_current():
        before=snapshot(w)
        try:return co.read_current(ctx)
        finally:A.require('visibility/denied_read_effect',snapshot(w)==before)
    run.case('CF07/current_denied_empty',denied_current,'current/guard_outcome')
    p=co.prepare(ctx);i,k=co.arm(ctx,p)
    run.case('CF07/current_denied_armed',denied_current,'current/guard_outcome')
    a=co.append_held(ctx,i,k)
    run.case('CF07/current_denied_event_only',denied_current,'current/guard_outcome')
    m=co.commit_native(ctx,a)
    run.case('CF07/current_denied_committed_unreleased',denied_current,'current/guard_outcome')
    rb=co.readback(ctx,m)
    run.case('CF07/current_denied_readback_without_release',denied_current,'current/guard_outcome')
    co.release(ctx,m,rb)
    run.case('CF07/current_disclosed_after_original_release',lambda:co.read_current(ctx)['outcome'])
    names=['workflow_goal_run_body','workflow_goal_run_control','workflow_goal_run_current',V.RESULT,V.ORIGIN,
        'executor_workflow_workflow_update','executor_workflow_workflow_head','executor_workflow_lineage_origin',
        'executor_workflow_current_pointer',W.family_table('commit'),W.family_table('origin'),W.family_table('control')]
    for table in names:
        def case(table=table):
            w=world();ctx=C.build_context(w);co=w.coordinator
            p=co.prepare(ctx);i,k=co.arm(ctx,p);a=co.append_held(ctx,i,k);before=snapshot(w)
            w.hooks['drop_write']=lambda w,c:table
            try:return co.commit_native(ctx,a)
            finally:A.require('joint/failed_write_effect',snapshot(w)==before)
        run.case('CF07/omit_joint_member/'+table,case,'commit/write_set')
    def altered_union():
        w=world();ctx=C.build_context(w);co=w.coordinator
        p=co.prepare(ctx);i,k=co.arm(ctx,p);a=co.append_held(ctx,i,k);before=snapshot(w)
        def edit(w,c,u):u['native_after_body']['record']['execution_owner_ref']='TEST_ONLY:other'
        w.hooks['commit_writes']=edit
        try:return co.commit_native(ctx,a)
        finally:A.require('joint/altered_effect',snapshot(w)==before)
    run.case('CF07/altered_complete_union',altered_union,'commit/write_value')


def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--groups',default='APPEND,JOINT,MATRIX')
    ap.add_argument('--child',choices=['run','classify']);ap.add_argument('--work');ap.add_argument('--cut');ap.add_argument('--output')
    ap.add_argument('--filter')
    args=ap.parse_args();BASE.mkdir(parents=True,exist_ok=True)
    if args.child:
        return child_run(Path(args.work),args.cut) if args.child=='run' else child_classify(Path(args.work))
    run=Run(args.filter)
    for group in args.groups.split(','):{'MATRIX':matrix,'APPEND':append_faults,'JOINT':joint_faults}[group](run)
    failed=[r for r in run.rows if r['status']!='pass']
    if not run.rows:raise ValueError('No matching oracle cases')
    Path(args.output).write_text(json.dumps(dict(qualification='TEST_ONLY',native=V.NATIVE_LINE,
        status='fail' if failed else 'pass',cases=run.rows,failures=failed),indent=1,default=str)+'\n')
    return bool(failed)


if __name__=='__main__':raise SystemExit(main())
