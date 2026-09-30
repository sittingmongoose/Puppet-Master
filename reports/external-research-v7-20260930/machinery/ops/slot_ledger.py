"""Campaign-owned flock ledger. Own quotas only; unknown sibling occupancy untouched."""
import contextlib
import fcntl
import json
import os
import time
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1] / 'ops'
STATE = ROOT / 'slots.json'
LOCK = ROOT / 'slots.lock'
MANIFEST = ROOT.parent / 'manifest.json'

@contextlib.contextmanager
def transaction():
    with LOCK.open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        manifest = json.loads(MANIFEST.read_text())
        state = json.loads(STATE.read_text()) if STATE.exists() else {'schema':'er7.slot_ledger.v1','campaign_id':manifest['campaign_id'],'jobs':{}}
        if state['campaign_id'] != manifest['campaign_id']:
            raise RuntimeError('wrong campaign ledger')
        yield state
        tmp = STATE.with_suffix('.tmp')
        tmp.write_text(json.dumps(state, indent=2)+'\n')
        os.replace(tmp, STATE)

def accounting(state, now=None):
    now = time.time() if now is None else now
    jobs = state['jobs']
    active = {k:v for k,v in jobs.items() if v.get('released_epoch') is None}
    occupied = sum(max(0,(v.get('released_epoch') or now)-v['admitted_epoch']) for v in jobs.values())
    committed = sum(max(0,v['cap_seconds']+v.get('cleanup_seconds',0)-(now-v['admitted_epoch'])) for v in active.values())
    return {'candidate_admissions':len(jobs),'occupied_slot_seconds':occupied,'remaining_committed_slot_seconds':committed,
            'reported_generated_tokens_lower_bound':sum(v.get('reported_output_tokens') or 0 for v in jobs.values()),
            'generated_token_completeness':'unknown; omitted native children/cancellation meters remain unknown',
            'active_by_family':{f:sum(v['family']==f for v in active.values()) for f in ('M','Z','L')},
            'overdue_jobs':[k for k,v in active.items() if now>=v['admitted_epoch']+v['cap_seconds']+v.get('cleanup_seconds',0)],
            'active_jobs':list(active)}

def acquire(job, family, seconds, reserve=False, cleanup_seconds=60):
    manifest = json.loads(MANIFEST.read_text())
    now = time.time()
    ceiling = manifest['ceilings']
    if family not in ('M','Z','L') or not 0<seconds<=3600 or not 0<=cleanup_seconds<=60:
        raise ValueError('invalid family or prospective cap')
    with transaction() as state:
        now = time.time()
        if job in state['jobs']:
            raise RuntimeError('job identifiers never reused')
        a=accounting(state,now)
        factor=1 if reserve else 1-manifest['reserves']['candidate_fraction']
        if now+seconds+cleanup_seconds>manifest['deadline_epoch'] or (not reserve and now>=manifest['deadline_epoch']-manifest['reserves']['closeout_seconds']):
            raise RuntimeError('campaign admission deadline/reserve')
        if a['candidate_admissions']>=int(ceiling['candidate_starts']*factor) or a['occupied_slot_seconds']+a['remaining_committed_slot_seconds']+seconds+cleanup_seconds>ceiling['occupied_slot_hours']*3600*factor or a['reported_generated_tokens_lower_bound']>=ceiling['generated_candidate_stop']:
            raise RuntimeError('campaign budget/reserve exhausted')
        if a['overdue_jobs']:
            raise RuntimeError('overdue own lease requires cleanup/reconciliation before new admissions')
        if a['active_by_family'][family]>=ceiling['family_active'][family]:
            raise RuntimeError('campaign family quota occupied')
        state['jobs'][job]={'family':family,'admitted_epoch':now,'cap_seconds':seconds,'cleanup_seconds':cleanup_seconds,'hard_release_deadline_epoch':now+seconds+cleanup_seconds,'released_epoch':None,
                           'pid':os.getpid(),'status':'starting','reported_output_tokens':None,
                           'reserve_admission':reserve,'usage_completeness':'unknown',
                           'own_active_by_family_before_admission':a['active_by_family'],'sibling_account_load':'unknown; untouched'}
        return dict(state['jobs'][job])

def update(job, **fields):
    forbidden={'family','admitted_epoch','cap_seconds','cleanup_seconds','hard_release_deadline_epoch','released_epoch','quiescence'} & fields.keys()
    if forbidden:
        raise ValueError('immutable lease or release field: '+','.join(sorted(forbidden)))
    with transaction() as state:
        state['jobs'][job].update(fields)

def release(job, quiescence, **fields):
    if not isinstance(quiescence,dict) or quiescence.get('native_quiescent') is not True or quiescence.get('own_process_group_absent') is not True:
        raise RuntimeError('slot release requires native quiescence evidence')
    if {'family','admitted_epoch','cap_seconds','cleanup_seconds','hard_release_deadline_epoch','released_epoch','quiescence'} & fields.keys():
        raise ValueError('immutable lease field')
    with transaction() as state:
        row=state['jobs'][job]
        if row.get('released_epoch') is not None:
            raise RuntimeError('lease already released; preserve first quiescence record')
        row.update(fields,released_epoch=time.time(),quiescence=quiescence)

if __name__=='__main__':
    with transaction() as state:
        print(json.dumps(accounting(state),indent=2))
