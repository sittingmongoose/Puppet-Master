"""V8 campaign-owned metadata ledger; no native launches or private-log reads."""
import argparse, contextlib, fcntl, hashlib, json, os, time, math
from pathlib import Path
ROOT=Path(__file__).resolve().parent
CAMPAIGN=ROOT.parents[1]
AUTH=CAMPAIGN/'AUTHORIZATION.json'
AUTH_SHA='25609fc787d622958fd62afa5df218a1e4789f61595a4152865ceb0c143304f2'
STATE=ROOT/'state.json'
LOCK=ROOT/'state.lock'
CATEGORIES={'setup','retry','wait','cancel','handoff','cleanup','native','evaluation','source_capture'}

def auth():
    if hashlib.sha256(AUTH.read_bytes()).hexdigest()!=AUTH_SHA: raise RuntimeError('authorization pin changed')
    return json.loads(AUTH.read_text())

def initial():
    a=auth()
    return {'schema':'er8.accounting.v1','campaign_id':a['campaign_id'],'authorization_sha256':AUTH_SHA,'clock_start_epoch':a['accepted_epoch'],'deadline_epoch':a['root_work_clock_deadline_epoch'],'legacy_excluded':{'admissions':53,'native_goals':49,'occupied_seconds':37984.167494},'jobs':{},'cases':{},'helpers':{},'events':[],'route_reviews':{},'final_reserved_names':[],'reservation_by_case':{},'evaluator_reserved_names':[],'occupancy_reconciliation':None,'closed':False}

@contextlib.contextmanager
def transaction():
    ROOT.mkdir(parents=True,exist_ok=True)
    with LOCK.open('a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        s=json.loads(STATE.read_text()) if STATE.exists() else initial()
        if s['authorization_sha256']!=AUTH_SHA or s['campaign_id']!=auth()['campaign_id']: raise RuntimeError('wrong campaign')
        yield s
        tmp=STATE.with_suffix('.tmp')
        with tmp.open('w') as out:
            json.dump(s,out,indent=2);out.write('\n');out.flush();os.fsync(out.fileno())
        os.replace(tmp,STATE)

def pending_start(v):
    return int(bool(v.get('launch_pending')) or (not v['goal_starts'] and v['released_epoch'] is None))

def start_commitments(s, extra_case=None, extra_job=None):
    reserved=s.get('reservation_by_case',{})
    total=0
    for case,r in reserved.items():
        if r.get('completed'):continue
        jobs=[(k,v) for k,v in s['jobs'].items() if v['case']==case]
        final=r.get('final_job')
        # Final stage's one promised start survives unrelated retries and setup failures.
        final_spent=sum(len(v['goal_starts']) for k,v in jobs if k==final) if final else 0
        other_spent=sum(len(v['goal_starts']) for k,v in jobs if k!=final)
        final_pending=sum(pending_start(v) for k,v in jobs if k==final) if final else 0
        other_pending=sum(pending_start(v) for k,v in jobs if k!=final)
        if extra_case==case:
            existing=s['jobs'].get(extra_job)
            if existing is None or not pending_start(existing):
                if final and extra_job==final:final_pending+=1
                else:other_pending+=1
        promised_final=1 if final else 0
        total+=max(max(0,promised_final-final_spent),final_pending)
        total+=max(max(0,r['native_starts']-promised_final-other_spent),other_pending)
    for k,v in s['jobs'].items():
        if v['case'] not in reserved or reserved[v['case']].get('completed'):
            total+=pending_start(v)
    if extra_case is not None and (extra_case not in reserved or reserved[extra_case].get('completed')):
        existing=s['jobs'].get(extra_job)
        if existing is None or not pending_start(existing):total+=1
    return total

def occupied_commitments(s,now,extra_case=None,extra_seconds=0,extra_spent=0):
    reserved=s.get('reservation_by_case',{})
    total=0
    for case,r in reserved.items():
        if r.get('completed'):continue
        jobs=[v for v in s['jobs'].values() if v['case']==case]
        spent=sum(max(0,(v['released_epoch'] if v['released_epoch'] is not None else now)-v['birth_epoch']) for v in jobs)
        pending=sum(max(0,v['hard_deadline_epoch']-now) for v in jobs if v['released_epoch'] is None)
        if extra_case==case:
            pending+=extra_seconds
            spent+=extra_spent
        total+=max(max(0,r['occupied_seconds']-spent),pending)
    total+=sum(max(0,v['hard_deadline_epoch']-now) for v in s['jobs'].values() if v['released_epoch'] is None and (v['case'] not in reserved or reserved[v['case']].get('completed')))
    if extra_case is not None and (extra_case not in reserved or reserved[extra_case].get('completed')):total+=extra_seconds
    return total

def accounting(s,now=None):
    now=time.time() if now is None else now
    active={k:v for k,v in s['jobs'].items() if v['released_epoch'] is None}
    occupied=sum(max(0,(v['released_epoch'] if v['released_epoch'] is not None else now)-v['birth_epoch']) for v in s['jobs'].values())
    committed=sum(max(0,v['hard_deadline_epoch']-now) for v in active.values())
    known=[v['generated_output_tokens'] for v in s['jobs'].values() if v['generated_output_tokens'] is not None]
    return {'elapsed_seconds':max(0,now-s['clock_start_epoch']),'deadline_epoch':s['deadline_epoch'],'admissions':len(s['jobs']),'native_goal_starts':sum(len(v['goal_starts']) for v in s['jobs'].values()),'pending_start_permits':sum(bool(v.get('launch_pending')) for v in s['jobs'].values()),'occupied_slot_seconds':occupied,'committed_slot_seconds':committed,'reserved_or_committed_slot_seconds':occupied_commitments(s,now),'reserved_or_committed_native_starts':start_commitments(s),'active_by_family':{f:sum(v['family']==f for v in active.values()) for f in 'MZL'},'candidate_output_warning':sum(known)>=auth()['limits']['candidate_output_warning'],'candidate_output_stop':sum(known)>=auth()['limits']['candidate_output_stop'],'active_jobs':list(active),'overdue_jobs':[k for k,v in active.items() if now>=v['hard_deadline_epoch']],'helper_task_starts':len(s['helpers']),'active_helpers':sum(v['ended_epoch'] is None for v in s['helpers'].values()),'evaluator_helper_starts_remaining':sum(n not in {v.get('reservation_id',k) for k,v in s['helpers'].items()} for n in s.get('evaluator_reserved_names',[])),'generated_output_tokens_lower_bound':sum(known),'generated_usage':'unknown' if any(v['generated_output_tokens'] is None for v in s['jobs'].values()) or not known else 'reported components only; native children unknown','outside_native_seconds_by_case':{k:v.get('observed_outside_native_seconds',0) for k,v in s['cases'].items()},'category_seconds':{c:sum(e.get('seconds',0) for e in s['events'] if e['category']==c) for c in sorted(CATEGORIES)},'occupancy_reconciled':s['occupancy_reconciliation'] is not None,'route_reviews':list(s['route_reviews']),'final_reserved_names':s['final_reserved_names'],'evaluator_reserved_names':s.get('evaluator_reserved_names',[]),'closed':s['closed']}

def positive_number(x,maxval):
    if not isinstance(x,(int,float)) or isinstance(x,bool) or not 0<x<=maxval: raise ValueError('invalid prospective cap')

def admit(s,r,now,component_birth=None):
    lim=auth()['limits'];a=accounting(s,now)
    if s['closed'] or now>=s['deadline_epoch']: raise RuntimeError('campaign closed/deadline')
    if s['occupancy_reconciliation'] is None: raise RuntimeError('one-time metadata occupancy reconciliation required')
    job=r['job'];case=r['case'];family=r['family']
    if job in s['jobs'] or family not in 'MZL' or len(family)!=1: raise ValueError('unique job and family required')
    review=s['route_reviews'].get(r['route'])
    if not review or review['accepted'] is not True or r['pins']!=review['pins']: raise RuntimeError('accepted immutable route pins required')
    if review.get('qualification_scope')=='CANARY_ONLY':
        if job not in review.get('allowed_jobs',[]) or r['component_seconds']>review['max_component_seconds'] or r['component_responses']>review['max_component_responses']: raise RuntimeError('accepted canary-only scope/caps')
    if not all(k in r['pins'] for k in ('runtime','config','independent_acceptance')): raise ValueError('three boundary pins required')
    for p in r['pins'].values():
        if not isinstance(p,str) or len(p)!=64 or any(c not in '0123456789abcdef' for c in p): raise ValueError('sha256 pin required')
    positive_number(r['component_seconds'],lim['component_hard_seconds']);positive_number(r['component_responses'],lim['component_hard_responses'])
    if not isinstance(r['component_responses'],int): raise ValueError('integer response cap required')
    positive_number(r['case_wall_seconds'],lim['case_elapsed_seconds']);positive_number(r['case_occupied_seconds'],lim['case_occupied_seconds'])
    if not isinstance(r['source_access'],dict) or not r['source_access'] or not isinstance(r['current_stages'],list) or not r['current_stages']: raise ValueError('prospective source access and stages required')
    if case not in s['cases']: raise RuntimeError('original case birth must be recorded before prep')
    c=s['cases'][case]
    if case in s.get('reservation_by_case',{}):
        if r.get('outside_native_cap_seconds')!=c.get('outside_native_cap_seconds') or not 0<c.get('outside_native_cap_seconds',0)<=300: raise RuntimeError('strict immutable outside-native cap <=300 required')
        if c.get('observed_outside_native_seconds',0)>=c['outside_native_cap_seconds']: raise RuntimeError('outside-native host cap exhausted')
    if (r['case_wall_seconds'],r['case_occupied_seconds'])!=(c['wall_seconds'],c['occupied_seconds']): raise RuntimeError('immutable whole-case caps')
    component_birth=now if component_birth is None else component_birth
    if not isinstance(component_birth,(int,float)) or not s['clock_start_epoch']<=component_birth<=now or component_birth<c['birth_epoch']: raise ValueError('original component birth within case required')
    end=component_birth+r['component_seconds']
    if end<=now: raise RuntimeError('original component deadline already expired')
    if end>min(s['deadline_epoch'],c['birth_epoch']+c['wall_seconds']): raise RuntimeError('inclusive case/campaign envelope')
    casejobs=[v for v in s['jobs'].values() if v['case']==case]
    caseoccupied=sum((v['released_epoch'] if v['released_epoch'] is not None else now)-v['birth_epoch'] for v in casejobs)
    casecommitted=sum(max(0,v['hard_deadline_epoch']-now) for v in casejobs if v['released_epoch'] is None)
    if caseoccupied+casecommitted+r['component_seconds']>c['occupied_seconds']: raise RuntimeError('whole-case occupied cap')
    reserve=case in s.get('reservation_by_case',{}) and not s['reservation_by_case'][case].get('completed')
    if len(s['final_reserved_names'])!=6: raise RuntimeError('six named final integrated cases required before launch')
    if now>=s['deadline_epoch']-3600 and not reserve and r.get('reserve_role') not in ('repair','replication'): raise RuntimeError('final hour reserved for named integrated work and repairs/replications')
    if a['native_goal_starts']+start_commitments(s,case,job)>lim['native_goal_starts']: raise RuntimeError('native start reserve/cap')
    if a['occupied_slot_seconds']+(now-component_birth)+occupied_commitments(s,now,case,end-now,now-component_birth)>lim['occupied_candidate_slot_seconds']: raise RuntimeError('occupied campaign reserve/cap')
    if a['active_by_family'][family]>=lim['active_candidates_by_family'][family] or a['overdue_jobs']: raise RuntimeError('family occupied or overdue cleanup unresolved')
    if a['generated_output_tokens_lower_bound']>=lim['candidate_output_stop']: raise RuntimeError('output stop')
    s['jobs'][job]={**r,'birth_epoch':component_birth,'admitted_epoch':now,'hard_deadline_epoch':end,'released_epoch':None,'status':'admitted','goal_starts':[],'generated_output_tokens':None,'quiescence':None,'launch_pending':None}
    return s['jobs'][job]

def apply(s,action,r):
    now=time.time()
    if action=='status': return accounting(s,now)
    if action=='prepare-admission':
        if r['case'] in s['cases']: raise RuntimeError('original case birth never reset')
        positive_number(r['case_wall_seconds'],3600);positive_number(r['case_occupied_seconds'],5400)
        if r['case'] in s.get('reservation_by_case',{}): positive_number(r.get('outside_native_cap_seconds'),300)
        birth=r.get('birth_epoch',now)
        if not isinstance(birth,(int,float)) or not s['clock_start_epoch']<=birth<=now: raise ValueError('original outer-gate birth required')
        s['cases'][r['case']]={'birth_epoch':birth,'birth_monotonic':r.get('birth_monotonic'),'wall_seconds':r['case_wall_seconds'],'occupied_seconds':r['case_occupied_seconds'],'outside_native_cap_seconds':r.get('outside_native_cap_seconds'),'observed_outside_native_seconds':0,'birth_rule':'original outer-gate birth before any preparation'}
        return admit(s,r,now,component_birth=birth)
    if action=='case-birth':
        if r['case'] in s['cases']: raise RuntimeError('case birth never reset')
        positive_number(r['wall_seconds'],3600);positive_number(r['occupied_seconds'],5400)
        if r['case'] in s.get('reservation_by_case',{}):
            positive_number(r.get('outside_native_cap_seconds'),300)
        birth=r.get('birth_epoch',now)
        if not isinstance(birth,(int,float)) or not s['clock_start_epoch']<=birth<=now: raise ValueError('original birth required')
        s['cases'][r['case']]={**r,'birth_epoch':birth};return s['cases'][r['case']]
    if action=='reconcile':
        if s['occupancy_reconciliation'] is not None: raise RuntimeError('reconcile exactly once')
        if not r.get('known_registry_path') or not isinstance(r.get('metadata'),dict): raise ValueError('known shared metadata provenance required')
        s['occupancy_reconciliation']={**r,'recorded_epoch':now,'scope':'external occupancy only; no borrowing/relabeling/termination'}
    elif action=='route-review':
        if not r.get('root_authority') or r.get('accepted') is not True or not r.get('pins'): raise ValueError('root named qualification acceptance required')
        if r.get('qualification_scope') not in ('CANARY_ONLY','NATIVE_ACCEPTED'): raise ValueError('explicit root qualification scope required')
        if r['qualification_scope']=='CANARY_ONLY' and (not r.get('allowed_jobs') or not 0<r.get('max_component_seconds',0)<=480 or not 0<r.get('max_component_responses',0)<=64): raise ValueError('canary names and bounded caps required')
        if r['route'] in s['route_reviews']: raise RuntimeError('review immutable; new route version required')
        s['route_reviews'][r['route']]={**r,'recorded_epoch':now}
    elif action=='reserve':
        if s['jobs'] or s['final_reserved_names'] or len(r['names'])!=6 or len(set(r['names']))!=6: raise ValueError('six unique immutable prelaunch names required')
        s['final_reserved_names']=r['names']
        starts=r.get('native_starts_per_case',1);seconds=r.get('occupied_seconds_per_case',1800)
        positive_number(starts,48);positive_number(seconds,5400)
        s['reservation_by_case']={n:{'native_starts':starts,'occupied_seconds':seconds,'completed':False,'final_job':r.get('final_jobs',{}).get(n)} for n in r['names']}
        s['evaluator_reserved_names']=r.get('evaluator_names',[])
    elif action=='admit': return admit(s,r,now)
    elif action in ('guard-start','goal-start'):
        a=accounting(s,now);v=s['jobs'][r['job']]
        violations=[]
        if v['released_epoch'] is not None: violations.append('lease already released')
        if a['candidate_output_stop']: violations.append('candidate output stop')
        c=s['cases'][v['case']]
        if c.get('outside_native_cap_seconds') is not None and c.get('observed_outside_native_seconds',0)>=c['outside_native_cap_seconds']: violations.append('outside-native host cap exhausted')
        if now>=v['hard_deadline_epoch'] or now>=s['deadline_epoch'] or s['closed']: violations.append('inclusive deadline/closure')
        if a['native_goal_starts']+start_commitments(s,v['case'],r['job'])>48: violations.append('native start commitments/cap')
        if action=='guard-start':
            if v.get('launch_pending'): violations.append('previous start permit unresolved')
            if violations: raise RuntimeError('; '.join(violations))
            if not r.get('permit_id'): raise ValueError('unique operator start permit_id required')
            if any(r['permit_id']==v2.get('launch_pending',{}).get('permit_id') for v2 in s['jobs'].values() if v2.get('launch_pending')): raise ValueError('permit_id already pending')
            v['launch_pending']={'permit_id':r['permit_id'],'epoch':now}
            return {'allowed':True,'job':r['job'],'checked_epoch':now,'native_starts_before':a['native_goal_starts'],'pins':v['pins']}
        if not r.get('receipt_id') or any(r['receipt_id']==x['receipt_id'] for v2 in s['jobs'].values() for x in v2['goal_starts']): raise ValueError('unique native activation receipt')
        # Actual starts are never erased or rejected because a budget was exceeded.
        epoch=r.get('epoch',now)
        if not isinstance(epoch,(int,float)) or not s['clock_start_epoch']<=epoch<=now: raise ValueError('observed native activation epoch required')
        v['goal_starts'].append({**r,'epoch':epoch,'recorded_epoch':now,'guard_violations':violations})
        v['launch_pending']=None
        if v['released_epoch'] is None:v['status']='native-active'
    elif action=='start-absent':
        v=s['jobs'][r['job']]
        if not v.get('launch_pending') or v['launch_pending']['permit_id']!=r['permit_id'] or r.get('native_activation_absent') is not True or not r.get('receipt_id'): raise RuntimeError('positive no-activation permit receipt required')
        v.setdefault('absent_start_receipts',[]).append({**r,'epoch':now})
        v['launch_pending']=None
    elif action=='release':
        v=s['jobs'][r['job']];q=r['quiescence']
        if v['released_epoch'] is not None: raise RuntimeError('first release immutable')
        if q.get('native_quiescent') is not True or q.get('own_process_group_absent') is not True or not q.get('receipt_id'): raise RuntimeError('positive native/process quiet receipt required')
        v.update(released_epoch=now,quiescence=q,status='released')
    elif action=='state':
        if r['status'] not in ('starting','retrying','waiting','cancelling','cleanup','native-active','handoff','frozen'): raise ValueError('positive operator state required')
        if s['jobs'][r['job']]['released_epoch'] is not None: raise RuntimeError('released state immutable')
        s['jobs'][r['job']]['status']=r['status']
    elif action=='event':
        if r['category'] not in CATEGORIES or not isinstance(r.get('seconds',0),(int,float)) or not math.isfinite(r.get('seconds',0)) or r.get('seconds',0)<0: raise ValueError('known category finite nonnegative duration')
        if 'outside_native_seconds' in r:
            duration=r['outside_native_seconds']
            if not isinstance(duration,(int,float)) or not math.isfinite(duration) or duration<0 or not r.get('interval_receipt_id') or r['case'] not in s['cases']: raise ValueError('finite measured outside-native interval and case receipt required')
            if any(e.get('interval_receipt_id')==r['interval_receipt_id'] for e in s['events']): raise ValueError('host interval receipt already counted')
            c=s['cases'][r['case']];c['observed_outside_native_seconds']=c.get('observed_outside_native_seconds',0)+duration
            r={**r,'outside_native_cap_exceeded':c.get('outside_native_cap_seconds') is not None and c['observed_outside_native_seconds']>c['outside_native_cap_seconds']}
        s['events'].append({**r,'recorded_epoch':now})
    elif action=='usage':
        v=s['jobs'][r['job']];tokens=r['generated_output_tokens']
        if not isinstance(tokens,int) or isinstance(tokens,bool) or tokens<0 or (v['generated_output_tokens'] is not None and tokens<v['generated_output_tokens']): raise ValueError('monotonic known lower bound')
        v['generated_output_tokens']=tokens
    elif action=='helper-start':
        a=accounting(s,now)
        eval_names=s.get('evaluator_reserved_names',[])
        spent_eval={v.get('reservation_id',k) for k,v in s['helpers'].items()}
        remaining_eval=sum(n not in spent_eval for n in eval_names)
        consumes_eval=r.get('reservation_id',r['helper']) in eval_names and r.get('reservation_id',r['helper']) not in spent_eval
        if a['helper_task_starts']+1+remaining_eval-int(consumes_eval)>32: raise RuntimeError('helper evaluation reserve/cap')
        if not r.get('root_authority') or r['helper'] in s['helpers'] or a['helper_task_starts']>=32 or a['active_helpers']>=8 or now>=s['deadline_epoch']: raise RuntimeError('root accepted helper metadata/caps required')
        s['helpers'][r['helper']]={**r,'started_epoch':r.get('started_epoch',now),'ended_epoch':None,'generated_output_tokens':None}
    elif action=='helper-end':
        if not r.get('root_authority') or s['helpers'][r['helper']]['ended_epoch'] is not None: raise RuntimeError('root accepted first helper end required')
        s['helpers'][r['helper']].update(ended_epoch=now,end_observed_epoch=now,actual_end_epoch=r.get('actual_end_epoch'),end_receipt=r)
    elif action=='case-complete':
        case=r['case']
        if not r.get('root_authority') or any(v['case']==case and (v['released_epoch'] is None or v.get('launch_pending')) for v in s['jobs'].values()): raise RuntimeError('root disposition and positive quiet case required')
        s['reservation_by_case'][case].update(completed=True,disposition=r,completed_epoch=now)
    elif action=='close':
        if not r.get('root_authority'): raise RuntimeError('root closure required')
        s['closed']=True;s['closure']={**r,'epoch':now}
    else: raise ValueError('unknown action')
    return accounting(s,now)

def main():
    p=argparse.ArgumentParser();p.add_argument('action');p.add_argument('--request',type=Path);args=p.parse_args()
    r=json.loads(args.request.read_text()) if args.request else {}
    with transaction() as s: result=apply(s,args.action,r)
    print(json.dumps(result,indent=2))
if __name__=='__main__': main()
