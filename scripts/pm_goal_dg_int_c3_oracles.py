#!/usr/bin/env python3
"""Genuine C3 R2/R5/P4/P7 qualifiers in both profiles (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.
"""
import argparse,copy,json
from pathlib import Path
import pm_goal_test_owner_adapters as A
import pm_goal_test_storage as S
import pm_goal_test_source as GS
import pm_goal_dg_r_readers as R
import pm_goal_dg_int_cancel as C
import pm_goal_dg_int_old as Old
import pm_goal_dg_int_p7 as P7
import pm_goal_dg_int_reducer as Reduce
from pm_goal_dg_int_v7_oracles import Run,snapshot,BASE


def request(w):
    return dict(scope=dict(w.scope),storage_instance_id=w.sid)


def qualify(run,profile,start='started',effects='none'):
    cls=C.CancelWorld if profile=='native_v7' else Old.World
    w=cls(dict(start=start,effects=effects),base=BASE).build()
    reader=C.Consumer(w);presentation=R.Presentation(w)
    def retained():
        before=snapshot(w)
        original=reader.inspect_original(request(w),presentation)
        A.require('c3/read_effect',snapshot(w)==before)
        A.require('c3/native_event',original['original_value']['event']['event_type']=='goal_run.cancelled')
        event=w.goal_event
        A.require('c3/goal_event',event['event_type']=='goal.cancelled' and
                  (event['event_type'],event['scope_kind'],event['payload_schema_id']) in GS.event_family_registration()[0])
        A.require('c3/order',event['sequence_id']>original['original_value']['event']['sequence_id'])
        return dict(native=original['original_value']['event']['event_id'],goal=event['event_id'])
    tag=profile+'/'+start+'/'+effects
    run.case('R2/'+tag+'/genuine_c3_original',retained)
    projector=w.projector_class(w)
    def r5():
        out=projector.project();A.require('c3/r5_unavailable','reason' not in out)
        projector.cutover();before=snapshot(w);projector.read_historical()
        A.require('c3/history_effect',snapshot(w)==before)
        return dict(rows=len(GS.GenericSource(w.storage).acquire().rows))
    run.case('R5/'+tag+'/registered_full_prefix',r5)
    current=P7.LegacyConsumer(w,'cancelled')
    def p7():
        current.publish();before=snapshot(w);out=current.read_current()
        A.require('c3/current_effect',snapshot(w)==before)
        A.require('c3/current_kind',out['kind']=='native_verified_cancelled_as_of_same_snapshot')
        A.require('c3/argument_count',len(current.last_arguments)==(16 if profile=='native_v7' else 14))
        return dict(arguments=sorted(current.last_arguments))
    run.case('P7/'+tag+'/whole_current_cancelled',p7)
    def p4():
        consumer=Reduce.IntConsumer(w);scope=Reduce.run_scope(w)
        src=Reduce.LegacySources(w.storage,scope,consumer.controls);before=snapshot(w)
        red=Reduce.reduce_prefix(src.generic,scope,src.cells)
        A.require('c3/reducer_effect',snapshot(w)==before)
        A.require('c3/reducer',red['complete'] and red['halt'] is None and red['status']=='cancelled')
        return dict(rows=len(red['pairs']),through=red['through'])
    run.case('P4/'+tag+'/whole_cancelled_prefix',p4)
    # Caller-controlled handles never replace an original held by its issuer.
    def transport():
        bad=R.Presentation(w);bad.cancellation['result']=(bad.cancellation['result'][0],copy.deepcopy(w.cancellation['result'].wrapper))
        before=snapshot(w)
        try:return reader.inspect_original(request(w),bad)
        finally:A.require('c3/transport_effect',snapshot(w)==before)
    run.case('R2/'+tag+'/transport_result',transport,'original/handle_type')
    def source_epoch_after_helpers():
        before=snapshot(w)
        def restart(world):current.source_owner.owner_epoch+=1
        try:return current.read_current(hooks=dict(after_helpers=restart))
        finally:A.require('c3/source_epoch_effect',snapshot(w)==before)
    run.case('P7/'+tag+'/source_owner_restarted_after_helpers',source_epoch_after_helpers,
             'int/consumer/source_owner_current')


def unknown(run,point):
    def case():
        w=C.CancelWorld(dict(stop_after=point),base=BASE).build()
        A.require('c3/unknown_goal_event',not hasattr(w,'goal_event') and 'original_control_publication' not in w.goal_cause)
        before=snapshot(w)
        out=C.Consumer(w).read_retained_native(request(w),R.Presentation(w))
        A.require('c3/unknown_read_effect',snapshot(w)==before)
        A.require('c3/unknown_disclosed',out.get('reason')=='MISSING_ORIGINAL_VALUE')
        events=len(w.storage.events)
        w.cfg.pop('stop_after')
        w.continue_d06()
        C.Consumer(w).inspect_original(request(w),R.Presentation(w))
        A.require('c3/resumed_goal',w.goal_event['event_type']=='goal.cancelled')
        A.require('c3/no_duplicate_native',len(w.storage.events)==events+(1 if point=='append' else 2))
        return dict(resumed=True,event_count=len(w.storage.events))
    run.case('R2/unknown_'+point+'_then_genuine_c3',case)


def terminal_preserved():
    """An actual whole certified terminal source precedes C3 and preserved D06."""
    w=C.CancelWorld(dict(terminal='certified'),base=BASE).build()
    A.require('preservation/issued',w.preserved and hasattr(w,'original_terminal'))
    before=snapshot(w)
    C.Consumer(w).read_preserved(request(w),R.Presentation(w))
    A.require('preservation/read_effect',snapshot(w)==before)
    A.require('preservation/native_bytes',w.body2.wrapper==w.body1.wrapper and w.control2.wrapper==w.control1.wrapper)
    A.require('preservation/no_cancelled_event',not any(w.storage.read_event(e)['event_type']=='goal_run.cancelled' for e in w.storage.events))
    A.require('preservation/genuine_goal',w.goal_event['event_type']=='goal.cancelled')
    consumer=Reduce.IntConsumer(w);scope=Reduce.run_scope(w)
    src=Reduce.LegacySources(w.storage,scope,consumer.controls);before=snapshot(w)
    result=Reduce.reduce_prefix(src.generic,scope,src.cells)
    A.require('preservation/reducer_effect',snapshot(w)==before)
    A.require('preservation/certified_row',result['complete'] and result['halt'] is None and result['status']=='certified')
    return dict(status=result['status'],body_revision=w.body2.wrapper['record']['revision'],
        goal_event=w.goal_event['event_id'],native_cancelled_events=0)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--groups',default='V7,OLD,NOSTART,UNKNOWN,TERMINAL')
    parser.add_argument('--output',required=True)
    args=parser.parse_args();BASE.mkdir(parents=True,exist_ok=True);run=Run()
    for name in args.groups.split(','):
        try:
            if name=='V7':qualify(run,'native_v7')
            elif name=='OLD':qualify(run,'original_profile')
            elif name=='NOSTART':qualify(run,'native_v7','no_start')
            elif name=='MUTATION':qualify(run,'native_v7',effects='mutation')
            elif name=='TERMINAL':run.case('R2/genuine_certified_terminal_preserved_without_cancelled_Event',terminal_preserved)
            elif name=='UNKNOWN':
                for point in ('prepare','native','append'):unknown(run,point)
            else:raise ValueError(name)
        except Exception as error:
            run.case('setup/'+name,lambda error=error:(_ for _ in ()).throw(error))
    failures=[r for r in run.rows if r['status']!='pass']
    result=dict(qualification='TEST_ONLY',native=C.NATIVE_LINE,status='pass' if not failures else 'fail',
                cases=run.rows,failures=failures)
    Path(args.output).write_text(json.dumps(result,indent=1,default=str)+'\n')
    return bool(failures)


if __name__=='__main__':raise SystemExit(main())
