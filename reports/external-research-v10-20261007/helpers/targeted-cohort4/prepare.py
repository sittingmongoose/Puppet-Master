import json, hashlib
from pathlib import Path
from datetime import datetime, timezone

BASE=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,o):
 p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(json.dumps(o,indent=2)+'\n')
targets={
 'Muse':dict(providerInstanceId='muse',driverKind='acpRegistry',model='muse-spark-1.3-contributor',options=dict(reasoning_effort='max',mode='default',approval_mode='allowAll',auto_review='off')),
 'Luna':dict(providerInstanceId='codex_gmail',driverKind='codex',model='gpt-6-luna',options=dict(reasoningEffort='max',serviceTier='priority')),
 'GLM':dict(providerInstanceId='zcode',driverKind='acpRegistry',model='builtin:zai-coding-plan\\GLM-5.3-Flash',options=dict(thought='max',mode='yolo'))}
state=dict(schema='er10.cohort4.v1',owner='targeted-cohort4',root_thread='5a126dd5-9c71-4cc2-83d6-9ad1985bacad',prepared_at=datetime.now(timezone.utc).isoformat(),cases={},tasks=[],glm_capacity_grant=None,limits=dict(muse=1,luna=1,glm=0),path_map=dict(runtime=str(BASE),repo='read-only T3 current worktree',publication='root-owned; no cohort repo edits'),counts=dict(cases=6,full_pairs=0,reviewed_pairs=0))
for n in range(11,17):
 cid=f'D-M{n}-A'; d=BASE/'cases'/cid
 c=json.loads((d/'case-card.json').read_text()); m=json.loads((d/'INPUT_MAP.json').read_text()); r=json.loads((d/'READY.json').read_text())
 for f in r['files']: assert sha(f['path'])==f['sha256'],f['path']
 for s in m['sources']: assert sha(s['path'])==s['sha256'],s['path']
 freeze=dict(case_id=cid,target=targets[c['family_assignment']],account='sittingmongoose@gmail.com' if c['family_assignment']=='Luna' else 'explicit provider instance; provider authentication not independently inferred',runtimeMode='full-access',interactionMode='default',hashes={f:sha(d/f) for f in ['case-card.json','CASE_CARD.md','INPUT_MAP.json','READY.json']},input_hashes=r['files'],sources=m['sources'],stages={},original_budget=c['budget'],arm_order=c['launch_order']['arm_order'],access='Only brief, input map/source manifest and listed sources; own predecessors only; no sibling arms/cases, reviews, campaign history or helper corpus. Advisory scope is not a filesystem firewall.',native_goal='Fresh actual create_goal/get_goal activation and update_goal/get_goal terminal per substantive stage; objective <=4000 chars; no inherited goals or nested agents.')
 for arm, stages in c['budget']['stages'].items():
  freeze['stages'][arm]=[]
  for s in stages:
   job=BASE/'jobs'/cid/arm/(s['stage']+'-v1');job.mkdir(parents=True,exist_ok=True)
   filename=s['stage']+'.md' if n==14 and arm=='treatment' else ('final.md' if s==stages[-1] else 'report.md')
   x=dict(s,job=str(job),carrier=str(job/filename),native_activation=str(job/'native_activation.json'),native_terminal_receipt=str(job/'native_terminal_receipt.json'),timings=str(job/'timings.json'),sources_directory=str(job/'sources'))
   Path(x['sources_directory']).mkdir(exist_ok=True)
   freeze['stages'][arm].append(x)
  freeze.setdefault('final_by_arm',{})[arm]=str(BASE/'jobs'/cid/arm/(stages[-1]['stage']+'-v1')/'final.md')
 if n==14:
  freeze['renderer']=dict(version='m14-renderer-1.0.0',path=str(BASE/'helpers/m14-renderer/render.py'),sha256=sha(BASE/'helpers/m14-renderer/render.py'),readme_sha256=sha(BASE/'helpers/m14-renderer/README.md'),prerequisite='Root actual four PASS qualification already completed; preparation costs linked to root renderer task, never free. Cold full setup and amortized costs separate; unavailable measures null.')
 write(BASE/'helpers/targeted-cohort4'/cid/'execution-overlay-v1.json',freeze)
 state['cases'][cid]=dict(status='HELD_ROOT_GLM_CAPACITY' if c['family_assignment']=='GLM' else 'READY',overlay=str(BASE/'helpers/targeted-cohort4'/cid/'execution-overlay-v1.json'),family=c['family_assignment'],arms={},review_status='NOT_ADMITTED')
write(BASE/'state/targeted-cohort4.json',state)
write(BASE/'helpers/targeted-cohort4/COMPARISONS.json',dict(status='IN_PROGRESS',cases=state['cases'],counts=state['counts'],claims='No scientific result established.'))
