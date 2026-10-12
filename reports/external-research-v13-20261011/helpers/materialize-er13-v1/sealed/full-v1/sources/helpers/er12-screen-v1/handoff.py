#!/usr/bin/env python3
"""Freeze selected stage output and source bytes once; no dispatch or provider calls."""
import argparse,hashlib,json,os,shutil
from pathlib import Path
SCIENCE=('discovery.md','draft.md','critique.md','final.md','source-map.json','revealed-plan.md','plan-reveal.json')
MECHANICS=('assignment.md','input-map.json','freeze.json','request.json','dispatch.json','status.json','native-goal-create.json','native-goal-active.json','native-goal-terminal.json')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def regular(p):
 if not p.is_absolute() or any(x.is_symlink() for x in (p,*p.parents)) or not p.is_file():raise ValueError('regular absolute nonsymlink member required')
 return p
def destination(stage):return stage.parent.parent/'control'/'terminal-handoffs'/stage.name
def verify(stage):
 seal=destination(stage);m=json.loads(regular(seal/'manifest.json').read_text())
 for r in m['files']:
  rel=Path(r['relative_path'])
  if rel.is_absolute() or '..' in rel.parts:raise ValueError('invalid handoff member')
  for p in [stage/rel,seal/'files'/rel]:
   if sha(regular(p))!=r['sha256'] or p.stat().st_size!=r['bytes']:raise ValueError('immutable terminal handoff differs: '+str(rel))
 current=sorted(str(p.relative_to(stage)) for p in (stage/'sources').rglob('*') if p.is_file())
 if current!=m['source_inventory']:raise ValueError('terminal source inventory changed')
 current_selected=sorted(n for n in (*SCIENCE,*MECHANICS) if (stage/n).exists())
 if current_selected!=sorted(r['relative_path'] for r in m['files'] if not r['relative_path'].startswith('sources/')):raise ValueError('terminal selected artifact inventory changed')
 return m
def seal(stage):
 stage=stage.absolute()
 status=json.loads(regular(stage/'status.json').read_text())
 dispatch=json.loads(regular(stage/'dispatch.json').read_text())
 if status.get('taskId')!=dispatch.get('returned',{}).get('taskId') or status.get('status') not in ('completed','failed','cancelled','interrupted') or status.get('hasPendingChildRuns') is not False:
  raise ValueError('exact terminal task status with explicitly zero pending runs required')
 target=destination(stage)
 if target.exists():return dict(verify(stage),idempotent=True)
 members=[stage/n for n in (*SCIENCE,*MECHANICS) if (stage/n).exists()]
 members += sorted((stage/'sources').rglob('*')) if (stage/'sources').exists() else []
 members=[regular(p) for p in members if p.is_file() or p.is_symlink()]
 frozen=[{'relative_path':str(p.relative_to(stage)),'sha256':sha(p),'bytes':p.stat().st_size} for p in members]
 target.parent.mkdir(parents=True,exist_ok=True);target.mkdir(exist_ok=False)
 for p,r in zip(members,frozen):
  out=target/'files'/r['relative_path'];out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(p.read_bytes());out.chmod(0o444)
  if sha(p)!=r['sha256'] or sha(out)!=r['sha256']:raise ValueError('stage changed while sealing; preserve partial handoff')
 obj={'version':'er13.immutable-stage-handoff.v1','stage':stage.name,'taskId':status['taskId'],'status':status['status'],'native_lifecycle_qualified':False,'science_qualified':False,'files':frozen,'source_inventory':sorted(r['relative_path'] for r in frozen if r['relative_path'].startswith('sources/')),'enrichment':'Separate records only; never edit this terminal manifest or frozen members'}
 data=(json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode();fd=os.open(target/'manifest.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
 with os.fdopen(fd,'wb') as f:f.write(data)
 return obj
def main():
 a=argparse.ArgumentParser(description=__doc__);a.add_argument('--stage-dir',type=Path,required=True);a.add_argument('--verify',action='store_true');v=a.parse_args()
 try:
  result=verify(v.stage_dir.absolute()) if v.verify else seal(v.stage_dir)
  print(json.dumps({'sealed':True,'stage':result['stage'],'files':len(result['files']),'idempotent':result.get('idempotent',False),'dispatches':0}))
 except (ValueError,OSError,KeyError) as e:a.exit(2,str(e)+'\n')
if __name__=='__main__':main()
