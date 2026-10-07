"""Mechanical exact-stage recording only; no launch, Goal RPC, polling or science."""
import argparse,json,hashlib,datetime
from pathlib import Path
P=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
def sha(f):return hashlib.sha256(Path(f).read_bytes()).hexdigest()
def save(f,x):Path(f).write_text(json.dumps(x,indent=2)+'\n')
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
ap=argparse.ArgumentParser();ap.add_argument('action',choices=['preflight','register','terminal']);ap.add_argument('stage');a=ap.parse_args();c,arm,name=a.stage.split('/');assert c in ['D-M07-A','D-M07-B','D-M08-A','D-M08-B','D-M09-A','D-M10-A'];d=P/'jobs'/c/arm/name
statepath=P/'state/targeted-cohort3.json';s=json.loads(statepath.read_text());overlay=json.loads((P/'jobs'/c/'V3_ALL_STAGE_PRELAUNCH_FREEZE.json').read_text());spec=next(v for v in overlay['all_stages'] if v['stage']==a.stage)
assert sha(d/'assignment.md')==spec['task_sha256'];assert sha(d/'INPUT_MAP.json')==spec['input_map_sha256']
record={'event':a.action.upper(),'stage':a.stage,'directory':str(d),'observed_at':now()}
if a.action=='preflight':
 m=json.loads((d/'INPUT_MAP.json').read_text());paths=[]
 for k,v in m.items():
  if k=='boundary':continue
  if isinstance(v,str):paths.append(v)
  elif isinstance(v,dict) and v.get('path'):paths.append(v['path'])
  elif isinstance(v,list):paths.extend(vv['path'] for vv in v if isinstance(vv,dict) and vv.get('path'))
 h={f:{'sha256':sha(f),'bytes':Path(f).stat().st_size} for f in paths};record.update({'task':(d/'assignment.md').read_text(),'readable_input_map':m,'actual_input_hashes':h,'binding':spec['binding'],'role':spec['role'],'runtimeMode':spec['runtimeMode'],'interactionMode':spec['interactionMode'],'clientRequestId':spec['clientRequestId'],'stage_allocation':spec['assignment'],'common_schedule':overlay['root_schedule']});save(d/'INPUT_HASH_BINDING.json',h)
elif a.action=='register':
 r=json.loads((d/'dispatch.json').read_text());r['directory']=str(d)
 if not any(v['taskId']==r['taskId'] for v in s['owned_tasks']):s['owned_tasks'].append(r)
 s['cases'][c]['v3']['status']=name+'_RUNNING';record.update(r)
else:
 r=json.loads((d/'quiet_task_receipt.json').read_text())['structuredContent'];assert r['status']=='completed' and not r['hasPendingChildRuns'];act=json.loads((d/'native_activation_receipt.json').read_text());assert act['active_verified'];term=json.loads((d/'native_terminal_receipt.json').read_text());proj=json.loads(Path(term['export']['entries'][0]['path']).read_text());native=proj['observations'][0]['native_response'];assert native['status']=='complete';assert proj['binding'][0]['nativeThreadRef']['nativeId']==act['native_identity'];assert native['objective_sha256']==hashlib.sha256(spec['objective'].encode()).hexdigest()
 run=json.loads((d/'t3_terminal_clock_receipt.json').read_text())['structuredContent']['recentRuns'][0];parse=lambda v:datetime.datetime.fromisoformat(v.replace('Z','+00:00'));elapsed=(parse(run['completedAt'])-parse(run['requestedAt'])).total_seconds();ceiling=spec['assignment']['minutes']*60
 output=Path(spec['required_output']);assert output.is_file() and output.stat().st_size>0
 bound=json.loads((d/'boundary.json').read_text());deadline=bound['absolute_case_deadline'];valid=elapsed<=ceiling and parse(run['completedAt'])<=parse(deadline)
 f={'stage':a.stage,'native_identity':act['native_identity'],'native_status':'complete','t3_status':r['status'],'quiet':True,'requestedAt':run['requestedAt'],'startedAt':run['startedAt'],'completedAt':run['completedAt'],'dispatch_to_delivery_seconds':elapsed,'stage_ceiling_seconds':ceiling,'absolute_case_deadline':deadline,'budget_delivery_eligible':valid,'required_output':str(output),'output_sha256':sha(output),'output_bytes':output.stat().st_size,'scientific_files':{v.name:{'sha256':sha(v),'bytes':v.stat().st_size} for v in d.glob('*.md') if v.name!='assignment.md'},'raw_native_goal_counters':native,'generated_tokens':None,'billing':None,'source_quality':'UNASSESSED','scope_audit':'incomplete_unknown; advisorymap notfirewall','frozen_at':now()};save(d/'freeze_disposition.json',f)
 for z in s['owned_tasks']:
  if z['taskId']==r['taskId']:z.update(r);z['settled']=True
 s['cases'][c]['v3'].setdefault('stage_freezes',{})[a.stage]=f;record['freeze']=f
s['updated_at']=now();save(statepath,s)
with (P/'state/targeted-cohort3-dispatches.jsonl').open('a') as w:w.write(json.dumps(record)+'\n')
print(json.dumps({k:v for k,v in record.items() if k not in ['task','readable_input_map','actual_input_hashes','common_schedule']},indent=2))
