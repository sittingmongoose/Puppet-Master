"""Freeze exact FULL evaluation custody; no grading or provider runner."""
import pathlib,json,hashlib,subprocess,datetime,sys
from terminal_capture_gate import check_direct_terminal
B=pathlib.Path('ER13_RUNTIME'); S=B/'state/dispatcher-v1'; M=B/'mechanics/dispatch-v1'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p): return json.loads(p.read_text())
block=sys.argv[1]; journal=load(S/'restart.json'); arms=[block+'-'+x for x in (['R0','A1','A8','A1_A8'] if block.startswith('A-') else ['control','treatment'])];items=[]
for arm in arms:
 a=M/'admitted'/arm;c=load(a/'configs'/(arm+'.json'));state=S/'arms'/arm
 assert not any(t['arm_id']==arm for t in journal['active_owned_tasks'])
 fs=[f for f in journal['freezes'] if f['arm_id']==arm]; finals=[f for f in fs if f['scope']=='FINAL_FULL'];failed=[f for f in journal['original_failed_arms'] if f['arm_id']==arm]
 assert finals or failed
 stages=[];names=['configs/'+arm+'.json',str(pathlib.Path(c['brief_path']).relative_to(a)),str(pathlib.Path(c['plan_path']).relative_to(a))]
 for f in fs:
  p=pathlib.Path(f['manifest']); assert sha(p)==f['sha256']; manifest=load(p); retained=f.get('retained_author',False); custody=p.parent if retained else p.parent/'files';d=custody/('run/'+arm+'/stages/investigator') if retained else custody
  for row in manifest['files']:
   z=custody/row.get('relative_path',row.get('path'));assert sha(z)==row['sha256'] and z.stat().st_size==row['bytes']
  st=f['stage'];taskpath=state/(st+'-eval-ready-status.raw.json'); task=load(taskpath)['structuredContent'];assert task['status'] in ['completed','failed','cancelled','interrupted'] and task['hasPendingChildRuns'] is False
  birth_capture=d/('native-goal-create.json' if (d/'native-goal-create.json').is_file() else 'native-goal-active.json');birth_capture_gap=not (d/'native-goal-create.json').is_file()
  born={};end={};native_error=None;native_binding=False;fr=load(d/'freeze.json')
  try:
   born=load(birth_capture)['goal'];end=load(d/'native-goal-terminal.json')['goal'];native_binding=all(born[k]==end[k] for k in ['threadId','createdAt','objective']) and born['objective']==fr['native_goal_objective'] and end['status']=='complete'
  except (OSError,KeyError,ValueError,TypeError) as exc:native_error=str(exc)
  if retained:fr['stage_deadline_utc']=f['stage_deadline_utc']
  aux=None
  if arm.startswith(('C-','D-')):
   aux=load(state/(st+'-capture-aux-freeze.json'));ap=pathlib.Path(aux['manifest']);assert sha(ap)==aux['sha256']
   for row in load(ap)['files']:
    z=ap.parent/row['path'];assert sha(z)==row['sha256'] and z.stat().st_size==row['bytes']
  sd=a/'run'/arm/'stages'/st
  for extra in ['provisional-source-map.json','native-goal-binding-diagnostic.txt','native-wait-active.json','native-critic-complete-active.json']:
   if (sd/extra).is_file():names.append(str((sd/extra).relative_to(a)))
  for folder in ['witnesses']:
   for z in sorted((sd/folder).rglob('*')):
    if z.is_file(): names.append(str(z.relative_to(a)))
  stages.append({'stage':st,'manifest':str(p),'manifest_sha256':sha(p),'frozen_directory':str(d),'taskId':task['taskId'],'childThreadId':task['childThreadId'],'terminal_status':task['status'],'hasPendingChildRuns':False,'actual_status_raw':str(taskpath),'actual_status_raw_sha256':sha(taskpath),'native_identity':{k:born.get(k) for k in ['threadId','createdAt','objective']} if isinstance(born,dict) and born else None,'native_same_birth_exact_objective':native_binding,'actual_birth_capture':str(birth_capture) if birth_capture.is_file() else None,'native_create_capture_missing':birth_capture_gap,'native_terminal_status':end.get('status') if isinstance(end,dict) else None,'native_capture_error':native_error,'capture_auxiliary_freeze':aux,'stage_deadline_utc':fr['stage_deadline_utc'],'native_terminal_updatedAt':end.get('updatedAt') if isinstance(end,dict) else None,'missing_required_outputs':f.get('missing_required_outputs',[])})
  if arm.startswith('D-'):
   stages[-1]['direct_completion_capture_check']=check_direct_terminal(pathlib.Path(aux['manifest']).parent,d/'native-goal-terminal.json',(sd/'native-terminal-capture-failed.json').exists())
 for z in [a/'run'/arm/'control/run.json',a/'run'/arm/'control/late-critique/release.json']:
  if z.is_file():names.append(str(z.relative_to(a)))
 dest=M/'frozen'/(arm+'-eval-inputs');lst=state/'eval-inputs-selected.json';lst.write_text(json.dumps(list(dict.fromkeys(names)),indent=2)+'\n')
 args=['python3','-B',str(B/'helpers/mechanics-v1/freeze.py'),'--root',str(a),'--list',str(lst),'--destination',str(dest)]
 if dest.exists(): args.append('--verify')
 subprocess.run(args,check=True,capture_output=True,text=True)
 final=next((x for x in stages if x['stage']==('investigator' if any(f.get('retained_author') for f in fs) else c['final_stage'])),None)
 final_path=next((f['final'] for f in fs if f.get('retained_author')),str(pathlib.Path(final['frozen_directory'])/'final.md') if final else None)
 timing_caveat={'first_setup_failure':journal['first_setup_failure'],'exact_t0':None,'conservative_deadline':journal['first_setup_deadline'],'caveat':journal['first_setup_timing_caveat']} if arm=='A-F01-R0' else None
 final_missing=final_path is None or not pathlib.Path(final_path).is_file()
 items.append({'arm_id':arm,'scope':'FULL','t0_utc':c['t0_utc'],'whole_deadline_utc':c['whole_deadline_utc'],'timing_caveat':timing_caveat,'final':final_path if not final_missing else None,'final_missing':final_missing,'unlaunched_stages':[x for x in c['stage_budgets_s'] if x not in [s['stage'] for s in stages]],'brief':str(dest/pathlib.Path(c['brief_path']).relative_to(a)),'plan':str(dest/pathlib.Path(c['plan_path']).relative_to(a)),'supplement_manifest':str(dest/'authored-manifest.json'),'supplement_manifest_sha256':sha(dest/'authored-manifest.json'),'stages':stages,'failure_records':failed,'source_assessed':False,'independent_session_linkage':'UNKNOWN beyond exact assigned capture/objective custody'})
p=S/'eval-ready'/(block+'.json');packet={'schema':'er13.frozen_full_notification.v1','block_id':block,'scope':'FULL','failure_qualified':any(x['final_missing'] or x['failure_records'] or x['timing_caveat'] or any(s['terminal_status']!='completed' or not s['native_same_birth_exact_objective'] or s['native_create_capture_missing'] or s['missing_required_outputs'] or (s['capture_auxiliary_freeze'] and s['capture_auxiliary_freeze']['missing_auxiliary_files']) or ('direct_completion_capture_check' in s and not s['direct_completion_capture_check']['qualified']) for s in x['stages']) for x in items),'frozen_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_assessed':False,'all_actual_tasks_terminal_zero_pending':True,'items':items}
p.open('x').write(json.dumps(packet,indent=2)+'\n');p.chmod(0o444);receipt={'block_id':block,'packet':str(p),'sha256':sha(p),'state':'READY_NOTIFICATION_PENDING'};journal['pending_root_evaluations'].append(receipt);(S/'restart.json').write_text(json.dumps(journal,indent=2)+'\n');print(json.dumps(receipt))
