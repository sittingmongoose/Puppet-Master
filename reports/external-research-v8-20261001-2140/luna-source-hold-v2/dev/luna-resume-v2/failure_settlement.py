"""Positive failure-inclusive settlement; public ownership metadata only.

Unknown launch/activation/enrollment retains the lease. No quality inference and
no absence inferred from missing files. Exact held parents supply exit receipts.
"""
from common import *


def validate_quiet(quiet, plan, start, cutoff):
    if plan.get('stage_start_monotonic_ns')!=start or plan.get('deadline_monotonic_ns')!=cutoff:
        raise ValueError('original plan ancestry required')
    enrollment=quiet.get('enrollment',{})
    if not isinstance(enrollment,dict) or enrollment.get('schema')!='er8.execution.enrollment.v1' or not isinstance(enrollment.get('cgroup'),str) or not enrollment['cgroup'].startswith('/') or '..' in Path(enrollment['cgroup']).parts or Path(enrollment['cgroup']).name!=plan.get('owned_unit') or quiet.get('owned_cgroup')!=enrollment['cgroup'] or type(enrollment.get('enrolled_monotonic_ns')) is not int or type(quiet.get('quiescence_observed_monotonic_ns')) is not int:raise ValueError('exact owned cgroup enrollment metadata required')
    if (quiet.get('owned_native_quiescent') is not True or
        quiet.get('inclusive_native_lifetime_established') is not True or
        quiet.get('original_deadline_monotonic_ns')!=cutoff or
        quiet.get('owned_unit')!=plan.get('owned_unit') or
        enrollment.get('owned_unit')!=plan.get('owned_unit') or
        enrollment.get('original_deadline_monotonic_ns')!=cutoff or
        not start<=enrollment.get('enrolled_monotonic_ns',0)<=quiet.get('quiescence_observed_monotonic_ns',0)<cutoff):
        raise ValueError('exact positive native/MCP enrolled cgroup quiet required')
    return quiet['quiescence_observed_monotonic_ns']


def uncovered_intervals(targets, events, case):
    """Recover unique uncharged pieces; reject overlap/opaque legacy intervals."""
    covered=[];seen=set()
    for e in events:
        if e.get('case')!=case or 'outside_native_seconds' not in e:continue
        receipt=e.get('interval_receipt_id');a=e.get('interval_begin_monotonic_ns');b=e.get('interval_end_monotonic_ns')
        if not receipt or receipt in seen or type(a) is not int or type(b) is not int or b<a:
            raise ValueError('every counted interval needs unique exact receipts')
        if abs((b-a)/10**9-e['outside_native_seconds'])>1e-9:raise ValueError('interval duration mismatch')
        seen.add(receipt);covered.append((a,b))
    covered.sort()
    if any(b>covered[i+1][0] for i,(a,b) in enumerate(covered[:-1])):raise ValueError('counted outside intervals overlap')
    result=[]
    targets=sorted(targets)
    if any(type(a) is not int or type(b) is not int or b<a for a,b in targets) or any(b>targets[i+1][0] for i,(a,b) in enumerate(targets[:-1])):raise ValueError('targets must be ordered disjoint exact intervals')
    for begin,end in targets:
        if type(begin) is not int or type(end) is not int or end<begin:raise ValueError('original interval order required')
        at=begin
        for a,b in covered:
            if b<=at or a>=end:continue
            if a>at:result.append((at,min(a,end)))
            at=max(at,min(b,end))
        if at<end:result.append((at,end))
    return result


def close_stage(home, birth, held, now_ns=None):
    """Runs in settlement child after exact stage actor exited. Defers release
    to parent until THIS settlement Popen has also exited and its PGID is absent.
    """
    home=Path(home);start=birth['stage_monotonic_ns'];cutoff=birth['original_deadline_monotonic_ns']
    now=time.monotonic_ns() if now_ns is None else now_ns
    if (type(held.get('pid')) is not int or held['pid']<=1 or
        type(held.get('returncode')) is not int or
        not start<=held.get('exit_monotonic_ns',0)<=now<cutoff or not group_absent(held['pid'])):
        raise ValueError('exact held stage Popen exit/group absence required')
    no_launch_path=home/'NO_NATIVE_LAUNCH.json'
    if no_launch_path.is_file():
        absent=read_json(no_launch_path)
        if absent.get('wrapper_Popen_attempted') is not False or absent.get('positive_native_activation_absent') is not True or absent.get('stage_monotonic_ns')!=start or absent.get('original_deadline_monotonic_ns')!=cutoff or (home/'LAUNCH_INTENT.json').exists():raise ValueError('exact positive no-launch closure required')
        native={'owned_native_quiescent':True,'absence_proof':'SOURCE_OWNED_POSITIVE_NO_POPEN','quiescence_observed_monotonic_ns':start,'original_deadline_monotonic_ns':cutoff}
        targets=[(birth.get('host_anchor_monotonic_ns',start),now)]
        activation_disposition='POSITIVE_ABSENT_NO_LAUNCH'
    else:
        plan=read_json(home/'PLAN.json');intent=read_json(home/'LAUNCH_INTENT.json');launched=read_json(home/'LAUNCHED.json')
        launch=intent.get('native_wrapper_launch_monotonic_ns')
        if (intent.get('original_deadline_monotonic_ns')!=cutoff or launched.get('original_deadline_monotonic_ns')!=cutoff or launched.get('native_wrapper_launch_monotonic_ns')!=launch or launched.get('job')!=birth['job'] or launched.get('owned_unit')!=plan.get('owned_unit') or launched.get('wrapper_pgid')!=held['pid'] or not start<=launch<=now):raise ValueError('exact original BIRTH/PLAN/LAUNCH_INTENT/LAUNCHED chain required')
        observer=load('er8_luna_failure_observer',EXECUTION/'observe.py')
        native=observer.observe(plan['enrollment_path'],plan['owned_unit'],cutoff)
        quiet_ns=validate_quiet(native,plan,start,cutoff)
        if type(launch) is not int or not launch<=native['enrollment']['enrolled_monotonic_ns']<=quiet_ns or type(launched.get('wrapper_pid')) is not int or launched['wrapper_pid']<=1 or plan.get('runtime_path')!=str(LUNA_ROUTE/'launch.py'):raise ValueError('exact selected wrapper and native/MCP enrollment ancestry required')
        if (home/'QUIESCENCE.json').is_file():
            prior=read_json(home/'QUIESCENCE.json')
            prior_ns=validate_quiet(prior,plan,start,cutoff)
            if prior_ns>quiet_ns:raise ValueError('prior quiet clock beyond current observation')
            quiet_ns=prior_ns
            native['first_positive_quiescence_observed_monotonic_ns']=quiet_ns
        # Actual activation may be known even if final metrics/COMPLETE are missing.
        activation=native_json(home,'activation.json')
        if activation.get('native_activation_observed') is not True or activation.get('goal_started_turn') is not True or not isinstance(activation.get('receipt_id'),str) or not launch<=activation.get('observed_activation_monotonic_ns',0)<=quiet_ns:raise ValueError('unknown activation remains HOLD; never invent absence')
        module=ledger_module()
        with module.transaction() as state:
            job=state['jobs'][birth['job']]
            if not any(r['receipt_id']==activation['receipt_id'] for r in job['goal_starts']):
                module.apply(state,'goal-start',{'job':birth['job'],'receipt_id':activation['receipt_id'],'epoch':activation['observed_activation_epoch']})
        targets=[(birth.get('host_anchor_monotonic_ns',start),launch),(quiet_ns,now)]
        activation_disposition='OBSERVED_AND_COUNTED'
    proof={'schema':'er8.luna.failure-inclusive-external-stage-close.v1','case':birth['case'],'job':birth['job'],
        'stage_actor_pid':held['pid'],'stage_actor_pgid':held['pid'],'held_Popen_wait_returncode':held['returncode'],
        'stage_actor_exit_observed_monotonic_ns':held['exit_monotonic_ns'],'stage_actor_group_absent':True,
        'stage_monotonic_ns':start,'original_deadline_monotonic_ns':cutoff,'inner_quiescence':native,
        'activation_disposition':activation_disposition,'outside_native_target_intervals':targets,
        'disposition':'COMPONENT_COMPLETE_PENDING_REVIEW' if held['returncode']==0 and (home/'COMPLETE.json').is_file() else 'FAILED_OR_INCOMPLETE',
        'quality_accepted':False,'release_deferred_until_settlement_exit':True}
    atomic(home/'EXTERNAL_STAGE_CLOSE.json',proof)
    return proof


def release_after_settlement(home,birth,actor,settlement,*,settlement_exit_ns):
    """Only exact held parent calls this after actor AND settlement have exited."""
    home=Path(home);proof=read_json(home/'EXTERNAL_STAGE_CLOSE.json');now=time.monotonic_ns();cutoff=birth['original_deadline_monotonic_ns']
    if proof.get('stage_actor_pid')!=actor.pid or proof.get('held_Popen_wait_returncode')!=actor.returncode or actor.returncode is None or settlement.returncode!=0 or not group_absent(actor.pid) or not group_absent(settlement.pid) or not birth['stage_monotonic_ns']<=proof['stage_actor_exit_observed_monotonic_ns']<=now<cutoff:raise ValueError('both exact held Popen parents exited/absent before original cutoff required')
    if type(settlement_exit_ns) is not int or not proof['stage_actor_exit_observed_monotonic_ns']<=settlement_exit_ns<=now or settlement.pid==actor.pid:raise ValueError('distinct held settlement Popen and actual exit time required')
    # Refresh the enrolled cgroup observation at CURRENT time. No backdated release.
    native=proof['inner_quiescence']
    if proof['activation_disposition']=='OBSERVED_AND_COUNTED':
        plan=read_json(home/'PLAN.json');observer=load('er8_luna_current_quiet',EXECUTION/'observe.py')
        current=observer.observe(plan['enrollment_path'],plan['owned_unit'],cutoff)
        validate_quiet(current,plan,birth['stage_monotonic_ns'],cutoff)
    targets=proof['outside_native_target_intervals'];targets[-1][1]=now
    module=ledger_module()
    with module.transaction() as state:
        job=state['jobs'][birth['job']]
        if job.get('launch_pending'):
            if proof['activation_disposition']!='POSITIVE_ABSENT_NO_LAUNCH':raise ValueError('unresolved activation remains HOLD')
            module.apply(state,'start-absent',{'job':birth['job'],'permit_id':job['launch_pending']['permit_id'],'native_activation_absent':True,'receipt_id':birth['job']+'-positive-no-Popen'})
        uncovered=uncovered_intervals(targets,state['events'],birth['case'])
        for i,(a,b) in enumerate(uncovered):
            module.apply(state,'event',{'case':birth['case'],'job':birth['job'],'category':'cleanup','seconds':(b-a)/10**9,'outside_native_seconds':(b-a)/10**9,'interval_begin_monotonic_ns':a,'interval_end_monotonic_ns':b,'interval_receipt_id':birth['job']+'-external-current-release-'+str(i)})
        # Release is recorded by unchanged ledger at its own current epoch.
        # Charge to the immediately observed post-call monotonic upper bound,
        # including proof writing and the release call, conservatively covering
        # the entire first-positive-quiet -> actual release interval.
        before_release=time.monotonic_ns()
        if before_release>=cutoff:raise ValueError('original inclusive cutoff exhausted; retain lease')
        proof.update(settlement_pid=settlement.pid,settlement_pgid=settlement.pid,
            settlement_returncode=settlement.returncode,settlement_exit_observed_monotonic_ns=settlement_exit_ns,
            settlement_group_absent=True,current_quiet_observation=current if proof['activation_disposition']=='OBSERVED_AND_COUNTED' else native,
            current_release_call_begin_monotonic_ns=before_release)
        atomic(home/'EXTERNAL_STAGE_CLOSE.json',proof)
        module.apply(state,'release',{'job':birth['job'],'quiescence':{'native_quiescent':True,'own_process_group_absent':True,'outer_parent_exited':True,'settlement_parent_exited':True,'original_deadline_monotonic_ns':cutoff,'receipt_id':birth['job']+'-positive-current-all-owned-quiet','proof_path':str(home/'EXTERNAL_STAGE_CLOSE.json'),'failure_disposition':proof['disposition']}})
        released=state['jobs'][birth['job']]['released_epoch']
        current_ns=time.monotonic_ns()
        if current_ns>=cutoff:raise ValueError('release transaction crossed original cutoff; rollback and retain lease')
        module.apply(state,'event',{'case':birth['case'],'job':birth['job'],'category':'cleanup','seconds':(current_ns-now)/10**9,'outside_native_seconds':(current_ns-now)/10**9,'interval_begin_monotonic_ns':now,'interval_end_monotonic_ns':current_ns,'interval_receipt_id':birth['job']+'-release-transaction-tail'})
        proof.update(current_release_observed_monotonic_ns_upper_bound=current_ns,current_release_epoch= released,
            accounting_bound='CONSERVATIVE_CURRENT_RELEASE_CALL_END',outside_native_cap_exceeded=state['cases'][birth['case']]['observed_outside_native_seconds']>=300)
        atomic(home/'EXTERNAL_STAGE_CLOSE.json',proof)
    atomic(home/'EXTERNAL_SETTLEMENT.json',{'job':birth['job'],'lease_released':True,'released_after_actual_stage_actor_exit':True,'released_after_actual_settlement_exit':True,'released_epoch':released,'original_deadline_monotonic_ns':cutoff,'last_charged_host_monotonic_ns':current_ns,'disposition':proof['disposition'],'whole_case_complete':False})
    return proof
