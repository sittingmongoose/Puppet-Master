"""Root-only mechanical controller monitor; positive metadata only, no model I/O."""
import argparse, hashlib, importlib.util, json, os, subprocess, time
from pathlib import Path

def atomic(p,v):
 p.parent.mkdir(parents=True,exist_ok=True);q=p.with_suffix(p.suffix+'.tmp');q.write_text(json.dumps(v,indent=2)+'\n');os.replace(q,p)
def read(p):
 if any(x.is_symlink() for x in (p,*p.parents)) or p.stat().st_size>4*1024*1024:raise ValueError('bounded regular metadata required')
 return json.loads(p.read_text())
def load(n,p):
 s=importlib.util.spec_from_file_location(n,p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
def absent(pid):
 if type(pid) is not int or pid<=1:return False
 try:os.killpg(pid,0);return False
 except ProcessLookupError:return True
 except PermissionError:return False

def reconcile(common,run,release,rolling_exit):
 rolling_ended=rolling_exit is not None
 status=common.ledger('status')
 for job in status.get('active_jobs',[]):
  # Status may encode job dictionaries or literal job names; no arbitrary path.
  job=job.get('job') if isinstance(job,dict) else job
  if job not in release['allowed_jobs']:continue
  case=next((c for c in release['case_queue'] if job.startswith(c+'-')),None)
  if case is None:continue
  home=run/case/job;ch=run/case
  case_host=run/'HOST_LAUNCHES'/case;stage_host=ch/'HOST_LAUNCHES'/job
  required=[case_host/'CASE_LAUNCHED.json',stage_host/'STAGE_LAUNCHED.json',home/'PLAN.json']
  if not all(p.is_file() for p in required):continue
  cl,sl,plan=map(read,required)
  cw=read(case_host/'CASE_HELD_WAIT.json') if (case_host/'CASE_HELD_WAIT.json').is_file() else None
  sw=read(stage_host/'STAGE_HELD_WAIT.json') if (stage_host/'STAGE_HELD_WAIT.json').is_file() else None
  failed=rolling_ended or (cw and cw.get('held_Popen_returncode')!=0) or (sw and sw.get('held_Popen_returncode')!=0) or (ch/'CASE_HOLD.json').is_file()
  if not failed:continue
  for launch,wait in ((cl,cw),(sl,sw)):
   if wait is not None:
    if any(wait.get(k)!=v for k,v in launch.items()) or type(wait.get('held_Popen_returncode')) is not int or type(wait.get('actual_exit_observed_monotonic_ns')) is not int:raise ValueError('exact held wait identity mismatch')
  if (cw is None or sw is None) and rolling_exit is None:continue
  if rolling_exit is not None and (rolling_exit.get('held_Popen_returncode') is None or not rolling_exit.get('rolling_group_absent')):raise ValueError('held rolling fallback required')
  if cl['case']!=case or sl['case']!=case or sl['job']!=job:raise ValueError('identity scope mismatch')
  if sl['original_stage_deadline_monotonic_ns']!=plan['deadline_monotonic_ns'] or sl['original_stage_start_monotonic_ns']!=plan['stage_start_monotonic_ns']:raise ValueError('original stage clock mismatch')
  groups={'case_supervisor':absent(cl['case_supervisor_pgid']),'stage_actor':absent(sl['stage_actor_pgid'])}
  if not all(groups.values()):continue
  observer=load('er8_owned_quiet',common.EXECUTION/'observe.py')
  quiet=observer.observe(plan['enrollment_path'],plan['owned_unit'],plan['deadline_monotonic_ns'])
  if not quiet['owned_native_quiescent']:continue
  proof={'schema':'pm.er8.failure-cleanup-proof.production.v1','case':case,'job':job,'root_authority':True,'case_launch':cl,'stage_launch':sl,'case_held_wait':cw,'stage_held_wait':sw,'held_rolling_exit':rolling_exit,'all_owned_groups_absent':groups,'enrolled_native_mcp_quiet':quiet,'actual_observed_monotonic_ns':time.monotonic_ns(),'complete_receipt_present':(home/'COMPLETE.json').is_file(),'outcome':'FAILURE_OR_INCOMPLETE_PRESERVED','no_backdating':True,'qualification':'cleanup only'}
  pp=home/'FAILURE_OR_SUCCESS_QUIET_PROOF.json';atomic(pp,proof)
  common.ledger('release',{'job':job,'quiescence':{'native_quiescent':True,'own_process_group_absent':True,'root_authority':True,'receipt_id':job+'-resume-failed-all-owned-quiet','proof_path':str(pp),'qualification':'cleanup only; failure preserved'}})
  atomic(home/'FAILURE_LEASE_RELEASE.json',{'job':job,'released_current_epoch_observed':time.time(),'no_backdating':True,'full_failed_attempt_cost_retained':True,'semantic_quality':'INCOMPLETE_OR_UNKNOWN'})

def safe_reconcile(common,run,release,ended):
 try:reconcile(common,run,release,ended)
 except Exception as error:
  atomic(Path(common.CONTROL['operator_root'])/'MONITOR_HOLD.json',{'state':'HOLD_MONITOR_RECONCILIATION_ERROR','error_class':type(error).__name__,'saved_epoch':time.time(),'no_inferred_release':True})

def main():
 p=argparse.ArgumentParser()
 for n in ('root-release','release-sha256','source-root','run-root'):p.add_argument('--'+n,required=True)
 x=p.parse_args();release_path=Path(x.root_release);source=Path(x.source_root);run=Path(x.run_root)
 if hashlib.sha256(release_path.read_bytes()).hexdigest()!=x.release_sha256:raise ValueError('exact root release drift')
 r=read(release_path)
 if r.get('root_authority') is not True or r.get('accepted') is not True or r.get('mode')!='PRODUCTION':raise ValueError('root production authority required')
 snap=r['controller_snapshot'];snapshot=read(Path(snap['path']))
 if source.resolve()!=Path(snap['path']).parent.parent.resolve():raise ValueError('exact selected controller source root required')
 if hashlib.sha256(Path(snap['path']).read_bytes()).hexdigest()!=snap['sha256']:raise ValueError('controller freeze drift')
 for raw,h in snapshot['closure_sha256'].items():
  if hashlib.sha256(Path(raw).read_bytes()).hexdigest()!=h:raise ValueError('controller source closure drift')
 common=load('resume_mechanical_common',source/'integrated-controller/common.py');common.check_release(r)
 if run.exists() or not run.is_relative_to(Path(common.CONTROL['operator_root'])):raise ValueError('fresh owned runtime required')
 out=Path(common.CONTROL['operator_root'])/(run.name+'-rolling-parent-positive.jsonl')
 with out.open('x') as f:
  proc=subprocess.Popen(['/usr/bin/python3','-I','-B',str(source/'integrated-controller/rolling.py'),'--root-release',str(release_path),'--run-root',str(run)],start_new_session=True,stdout=f,stderr=subprocess.DEVNULL)
  atomic(out.with_suffix('.launch.json'),{'held_rolling_pid':proc.pid,'held_rolling_pgid':proc.pid,'root_release_sha256':x.release_sha256,'no_private_reads':True})
  while proc.poll() is None:
   safe_reconcile(common,run,r,None);time.sleep(.15)
  rc=proc.wait();ended=time.monotonic_ns()
  rolling_exit={'held_rolling_pid':proc.pid,'held_rolling_pgid':proc.pid,'held_Popen_returncode':rc,'actual_exit_observed_monotonic_ns':ended,'rolling_group_absent':absent(proc.pid),'root_release_sha256':x.release_sha256,'no_private_reads':True}
  atomic(out.with_suffix('.held-exit.json'),rolling_exit)
  safe_reconcile(common,run,r,rolling_exit)
  # Bounded observation only: no sibling signaling, no inferred cleanup.
  cutoff=time.monotonic()+60
  while time.monotonic()<cutoff and any((j.get('job') if isinstance(j,dict) else j) in r['allowed_jobs'] for j in common.ledger('status').get('active_jobs',[])):
   safe_reconcile(common,run,r,rolling_exit);time.sleep(.15)
 atomic(out.with_suffix('.terminal.json'),{'held_rolling_pid':proc.pid,'held_Popen_returncode':rc,'actual_exit_observed_monotonic_ns':ended,'rolling_group_absent':absent(proc.pid),'no_private_reads':True})
 return rc
if __name__=='__main__':raise SystemExit(main())
