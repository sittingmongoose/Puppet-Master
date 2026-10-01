"""Host operator glue only. Unchanged frozen runtime owns native Goal lifecycle."""
import argparse, hashlib, importlib.util, json, os, pathlib, shutil, signal, subprocess, sys, time
LAB=pathlib.Path(__file__).resolve().parents[1]
RUNTIME=LAB/'dev/runtime-boundary-final-repair2'
sys.path.insert(0,str(LAB/'ops-frozen-v1'))
import slot_ledger as slots

def sha(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def load(p): return json.loads(pathlib.Path(p).read_text())
def pin(p,h):
 p=pathlib.Path(p).resolve(strict=True)
 if sha(p)!=h: raise RuntimeError('pin drift: '+str(p))
 return p,load(p)
def write(p,obj):
 with pathlib.Path(p).open('x') as f: f.write(json.dumps(obj,indent=2)+'\n')
def members(pgid):
 # Known own groups only. Never enumerate sibling groups or client data.
 result=subprocess.run(['pgrep','-g',str(pgid)],capture_output=True,text=True,timeout=5)
 if result.returncode not in (0,1): raise RuntimeError('own process-group absence probe failed')
 values=result.stdout.split()
 if any(not x.isdigit() for x in values) or (result.returncode==1 and values): raise RuntimeError('invalid own process-group absence probe')
 return values

def stop_owned_driver(proc):
 if proc is None: return
 if proc.poll() is None:
  try: os.killpg(proc.pid,signal.SIGINT)
  except ProcessLookupError: pass
  try: proc.wait(timeout=25)
  except subprocess.TimeoutExpired:
   try: os.killpg(proc.pid,signal.SIGKILL)
   except ProcessLookupError: pass
   proc.wait(timeout=5)

def run(a):
 authority_path,authority=pin(a.authority,a.authority_sha256)
 host_review_path,host_review=pin(a.host_review,a.host_review_sha256)
 if host_review.get('schema')!='er7.host_dispatch.context.acceptance.v1' or host_review.get('verdict')!='accepted' or host_review.get('dispatcher_sha256')!=sha(__file__) or host_review.get('prospective_empty_native_home_verified') is not True: raise RuntimeError('independent exact operator context acceptance required')
 context_code=LAB/'ops/native_context_projection_v1.py'
 if host_review.get('context_projector_sha256')!=sha(context_code): raise RuntimeError('context projector drift')
 context_spec=importlib.util.spec_from_file_location('er7_native_context_job',context_code)
 context_module=importlib.util.module_from_spec(context_spec);context_spec.loader.exec_module(context_module)
 if authority.get('schema')!='er7.prospective.z.queue.authority.v1' or authority.get('status')!='authorized': raise RuntimeError('root prospective authority required')
 manifest=load(LAB/'manifest.json')
 if manifest['deadline_epoch']==1790820406 or manifest['deadline_epoch']!=authority.get('deadline_epoch'): raise RuntimeError('updated work-clock manifest required')
 if (LAB/'ops/PAUSED').exists(): raise RuntimeError('campaign PAUSED')
 cfg_path,cfg=pin(a.method_config,a.method_sha256)
 review_path,review=pin(a.method_review,a.review_sha256)
 canary_path,canary=pin(a.canary_review,a.canary_review_sha256)
 receipt_path,receipt=pin(a.canary_receipt,a.canary_receipt_sha256)
 bind=cfg['attempt']; label=bind['label']; ws=pathlib.Path(bind['workspace']).resolve(strict=True)
 if bind['public_get']:
  if not a.capture_review or not a.capture_review_sha256: raise RuntimeError('GET requires independently accepted exact trusted-host capture privacy gate')
  cp,cr=pin(a.capture_review,a.capture_review_sha256)
  if cr.get('schema')!='er7.capture_method_privacy_gate.v2.final' or cr.get('verdict')!='accepted' or cr.get('runtime_snapshot_sha256')!=cfg['runtime_snapshot_sha256'] or cr.get('raw_private_hash_or_output') is not False: raise RuntimeError('GET capture privacy unqualified')
  if sha(cr['projector_path'])!=cr['projector_sha256']: raise RuntimeError('capture projector drift')
 if not any(x.get('label')==label and x.get('method_config_sha256')==a.method_sha256 and x.get('method_review_sha256')==a.review_sha256 for x in authority.get('components',[])): raise RuntimeError('component outside root queue authority')
 if canary.get('verdict')!='passed' or canary.get('schema')!='er7.z.safe.canary.acceptance.v1': raise RuntimeError('independent native PASS required')
 if any(canary.get(k) is not True for k in ['native_inventory_all_request_attempts_verified','native_goal_activation_continuation_completion_verified','native_tool_privacy_and_quiescence_verified']): raise RuntimeError('incomplete independent canary evidence')
 if review.get('verdict')!='accepted' or review.get('method_config_sha256')!=a.method_sha256: raise RuntimeError('exact independent method acceptance required')
 runtime_hash=sha(RUNTIME/'review-snapshot-final.json')
 if runtime_hash!=cfg['runtime_snapshot_sha256'] or runtime_hash!=canary['runtime_snapshot_sha256']: raise RuntimeError('runtime drift')
 if sha(cfg['goal_file'])!=bind['prompt_sha256'] or sha(ws/'TASK.md')!=cfg['task_sha256']: raise RuntimeError('task/prompt drift')
 for row in cfg.get('input_manifest',[]):
  if sha(ws/'inputs'/row['target'])!=row['sha256']: raise RuntimeError('input drift')
 for path,h in cfg.get('closure_sha256',{}).items():
  if sha(path)!=h: raise RuntimeError('method dependency drift')
 if any((ws/'out').rglob('*')): raise RuntimeError('prospective output workspace must be empty')
 host=LAB/'ops/productive-z-v1'/label
 host.mkdir(parents=True,exist_ok=False,mode=0o700)
 candidate_home_path=host/'isolated-native-home'
 candidate_home_path.mkdir(mode=0o700)
 # HOME keeps its normal native home-directory meaning; only this child's environment changes.
 # Neither the user's HOME variable nor existing app files are modified.
 for ancestor in (ws,*ws.parents):
  for name in ('AGENTS.md','CLAUDE.md','zcode.json','.zcode/config.json','.git'):
   if (ancestor/name).exists() or (ancestor/name).is_symlink(): raise RuntimeError('external ancestor instruction route must not enter fresh candidate context')
 if (ws/'.git').exists(): raise RuntimeError('candidate native root must not inherit repository instructions')
 candidate_env={k:v for k,v in os.environ.items() if not k.upper().startswith('ZCODE_') and not any(x in k.upper() for x in ('API_KEY','TOKEN','SECRET','PASSWORD','CREDENTIAL'))}
 candidate_env['HOME']=str(candidate_home_path)
 candidate_env['USERPROFILE']=str(candidate_home_path)
 candidate_env['XDG_CONFIG_HOME']=str(candidate_home_path/'config')
 candidate_env['XDG_DATA_HOME']=str(candidate_home_path/'data')
 candidate_env['XDG_CACHE_HOME']=str(candidate_home_path/'cache')
 admission={'schema':'er7.z.safe.admission.v1','mode':'productive','runtime_snapshot_sha256':runtime_hash,'attempt':bind,'method_config':{'path':str(cfg_path),'sha256':a.method_sha256},'method_review':{'path':str(review_path),'sha256':a.review_sha256},'canary_receipt':{'path':str(receipt_path),'sha256':a.canary_receipt_sha256},'canary_review':{'path':str(canary_path),'sha256':a.canary_review_sha256}}
 ap=host/'host-admission.json';write(ap,admission)
 write(host/'preflight.json',{'epoch':time.time(),'root_authority':{'path':str(authority_path),'sha256':a.authority_sha256},'manifest_sha256':sha(LAB/'manifest.json'),'method_config_sha256':a.method_sha256,'method_review_sha256':a.review_sha256,'canary_review_sha256':a.canary_review_sha256,'private_client':'excluded entirely; no operator reads','isolated_native_home':str(candidate_home_path),'empty_home_before_launch':not any(candidate_home_path.iterdir()),'host_review_sha256':a.host_review_sha256,'future_context_evidence':'strict Boolean-only job-scoped projection required after quiescence; no body text printed'})
 lease=slots.acquire(label,'Z',bind['max_seconds'])
 slots.update(label,attempt=str(host),operator_pid=os.getpid(),model_requested='GLM-5.3-Flash',effort_requested='max',status='starting',work_clock_authority_sha256=a.authority_sha256)
 argv=['python3',str(RUNTIME/'native_runner.py'),'--mode','productive','--admission-file',str(ap),'--workspace',str(ws),'--prompt-file',cfg['goal_file'],'--out',str(host/'native'),'--label',label,'--max-seconds',str(bind['max_seconds']),'--max-responses',str(bind['max_responses'])]
 proc=None
 try:
  with (host/'operator.log').open('x') as log:
   if bind['public_get']: argv.append('--public-get')
   proc=subprocess.Popen(argv,stdout=log,stderr=log,start_new_session=True,env=candidate_env)
   slots.update(label,status='native-running',owned_driver_pid=proc.pid,owned_driver_pgid=proc.pid)
   write(host/'launch.json',{'epoch':time.time(),'argv':argv,'owned_driver_pgid':proc.pid,'sibling_load':'unknown; untouched','lease':lease})
   try:
    code=proc.wait(timeout=max(.1,lease['hard_release_deadline_epoch']-time.time()-30))
   except subprocess.TimeoutExpired:
    slots.update(label,status='owned-wrapper-watchdog-cleanup')
    # Runtime receives interruption while only this freshly owned driver group is targeted.
    os.killpg(proc.pid,signal.SIGINT)
    try: code=proc.wait(timeout=25)
    except subprocess.TimeoutExpired:
     os.killpg(proc.pid,signal.SIGKILL)
     code=proc.wait(timeout=5)
     slots.update(label,status='held-watchdog-forced-driver-exit-native-quiescence-pending')
 except BaseException as exc:
  # Close only the driver group freshly created by this invocation. Never free a lease on an exception.
  try: stop_owned_driver(proc)
  finally:
   slots.update(label,status='held-dispatch-error-quiescence-unestablished',operator_error=type(exc).__name__)
  raise
 rp=host/'native/receipt.json'
 if not rp.exists():
  slots.update(label,status='held-native-receipt-missing',operator_returncode=code)
  raise RuntimeError('native receipt missing; retain occupied lease')
 r=load(rp); groups=r.get('quiescence_groups')
 quiet=isinstance(groups,dict) and bool(groups) and not any(groups.values()) and not members(proc.pid) and all(not members(int(g)) for g in groups)
 if not quiet:
  slots.update(label,status='held-native-quiescence-unestablished',operator_returncode=code)
  raise RuntimeError('quiescence missing; retain occupied lease')
 try: context_observations=context_module.observe(host/'native',r.get('session_id'))
 except Exception as exc: context_observations={'schema':'er7.future_native_context.observations.v1','status':'unestablished','error_class':type(exc).__name__,'raw_text_hash_or_copy':False}
 write(host/'context-observations.json',context_observations)
 frozen=host/'frozen-output/out'; frozen.mkdir(parents=True)
 files={}
 for src in sorted((ws/'out').rglob('*')):
  if src.is_symlink():
   slots.update(label,status='held-output-symlink'); raise RuntimeError('output symlink; preserve lease/evidence')
  if src.is_file():
   rel=src.relative_to(ws/'out'); dst=frozen/rel; dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);dst.chmod(0o400)
   files[str(rel)]={'sha256':sha(dst),'bytes':dst.stat().st_size}
 # Sanitized named native records only; never copy private-client state.
 native_files={}
 for name in ['receipt.json','host-process.json','session-tool-contract.json','progress.jsonl','usage-events.jsonl','zcode-stdout.redacted.jsonl','zcode-stderr.omitted.log']:
  src=host/'native'/name
  if src.is_file():native_files[name]={'sha256':sha(src),'bytes':src.stat().st_size}
 missing=[x for x in cfg['output_files'] if x not in files]
 outcome='frozen-for-independent-evaluation' if code==0 and r.get('component_outcome')=='passed' and not missing and context_observations.get('status')=='qualified' else 'failed-or-incomplete-preserved'
 evidence={'native_quiescent':True,'own_process_group_absent':True,'native_receipt':str(rp),'native_receipt_sha256':sha(rp),'owned_driver_pgid':proc.pid,'basis':'sanitized native receipt plus only known own group absence'}
 integrity={'schema':'er7.productive_z.output_integrity.v1','epoch':time.time(),'label':label,'files':files,'missing_required_outputs':missing,'sanitized_native_artifacts':native_files,'quiescence':evidence,'private_client':'excluded entirely; never read','semantic_quality':'unassessed','context_observations_sha256':sha(host/'context-observations.json'),'future_native_context':context_observations.get('status'),'native_outcome':r.get('component_outcome'),'inventory_verified':r.get('inventory_check',{}).get('verified'),'method_postrender_delivery':'pending separate measured machinery; no free semantic helper rewrite'}
 write(host/'output-integrity.json',integrity)
 usage=r.get('usage_totals',{})
 slots.release(label,evidence,status=outcome,reported_output_tokens=usage.get('outputTokens'),usage_reported=usage,usage_completeness='unknown; native children/cancellation meters may be omitted',effective_model=r.get('model_id'),effective_effort=r.get('effort_effective'),native_session_id=r.get('session_id'),native_goal_status=r.get('goal_status_final'),actual_native_goal_activation=bool(r.get('goal_target_id')),native_goal_target_id=r.get('goal_target_id'),operator_returncode=code)
 write(host/'operator-receipt.json',{'epoch':time.time(),'label':label,'status':outcome,'native_goal_status':r.get('goal_status_final'),'output_integrity_sha256':sha(host/'output-integrity.json'),'accounting':slots.accounting(load(LAB/'ops/slots.json'))})
 print(json.dumps({'label':label,'status':outcome,'host':str(host),'inventory_verified':integrity['inventory_verified'],'missing_required_outputs':missing,'actual_goal_activation':bool(r.get('goal_target_id'))}),flush=True)
 return 0 if outcome=='frozen-for-independent-evaluation' else 1
if __name__=='__main__':
 p=argparse.ArgumentParser()
 for field in ['authority','authority-sha256','method-config','method-sha256','method-review','review-sha256','canary-review','canary-review-sha256','canary-receipt','canary-receipt-sha256']:p.add_argument('--'+field,required=True)
 p.add_argument('--host-review',required=True);p.add_argument('--host-review-sha256',required=True)
 p.add_argument('--capture-review');p.add_argument('--capture-review-sha256')
 sys.exit(run(p.parse_args()))
