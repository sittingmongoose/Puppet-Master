from pathlib import Path
import json
R=Path(__file__).resolve().parents[1]
s=json.loads((R/'control/state.json').read_text());q=json.loads((R/'control/queue.json').read_text())
ready=[];evaluations=[]
def complete(p):return (p/'task-result.json').exists() and json.loads((p/'task-result.json').read_text()).get('status')=='completed'
for k,a in s['arms'].items():
 if a['status'].startswith(('INVALID','FAILED')):continue
 root=R/'jobs'/a['block']/a['arm'];m=a['method'];arm=a['arm']
 stages=['research-q1','research-q2'] if m=='M01' and arm=='control' else ['research']
 res=all(complete(root/x) and (root/x/'draft.md').exists() for x in stages)
 if m in ('M05','M13','M14') and arm=='treatment':
  res=(root/'research/draft.md').exists() and (root/'research/source-map.json').exists()
  nxt='critic' if res and not (root/'critic/assignment.md').exists() else None
 elif res:
  crit='critic-finalizer' if m=='M03' and arm=='treatment' else 'critic'
  nxt=crit if not (root/crit/'assignment.md').exists() else 'reviser' if crit=='critic' and complete(root/crit) and (root/crit/'critique.md').exists() and not (root/'reviser/assignment.md').exists() else None
 else:nxt=None
 if m=='M15' and arm=='treatment':
  if nxt=='reviser' and not (complete(root/'verifier') and (root/'verifier/verification.md').exists()):nxt=None
  if res and not (root/'verifier/assignment.md').exists():
   x=next(x for x in q if x['block_id']==a['block']);ready.append({'block':a['block'],'arm':arm,'stage':'verifier','route':x['route']})
 if nxt:
  x=next(x for x in q if x['block_id']==a['block']);route=x.get('stage_routes',{}).get(arm,{}).get(nxt,a['route'])
  ready.append({'block':a['block'],'arm':arm,'stage':nxt,'route':route})
for x in q:
 if x.get('method') is None:continue
 b=x['block_id'];valid=True
 for arm in ('control','treatment'):
  a=s['arms'].get(b+'/'+arm)
  if not a:valid=False;break
  root=R/'jobs'/b/arm;f='research' if x['method'] in ('M05','M13','M14') and arm=='treatment' else 'critic-finalizer' if x['method']=='M03' and arm=='treatment' else 'reviser'
  if not ((complete(root/f) and (root/f/'final.md').exists()) or (root/'DISPOSITION.json').exists()):valid=False
 if valid and not (R/'evaluations'/b/'assignment.md').exists():evaluations.append(b)
# Predeclared mechanical terminal handoff for retained v2/M13; no candidate science modified.
for k,a in s['arms'].items():
 x=next((x for x in q if x['block_id']==a['block']),{})
 if a['arm']=='treatment' and (a['method']=='M13' or x.get('terminal_critic_handoff')):
  p=R/'jobs'/a['block']/'treatment'/'critic'
  if complete(p) and (p/'critique.md').exists() and (p/'source-map.json').exists() and not (p/'READY.json').exists():
   import hashlib,datetime
   files=[{'path':str(p/n),'sha256':hashlib.sha256((p/n).read_bytes()).hexdigest()} for n in ['critique.md','source-map.json']]
   (p/'READY.json').write_text(json.dumps({'frozen_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'terminal_task_result':str(p/'task-result.json'),'files':files,'mechanical_only':True},indent=2)+'\n')

fresh=[]
for x in q:
 if x['phase']=='A':
  for arm in ('control','treatment'):
   if x['block_id']+'/'+arm not in s['arms']:
    fresh.append({'block':x['block_id'],'arm':arm,'stage':'research','route':x['route']})
print(json.dumps({'ready_stages':ready,'ready_evaluations':evaluations,'unstarted_A':fresh}))

