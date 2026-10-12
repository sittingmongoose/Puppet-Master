#!/usr/bin/env python3
"""Finite B12 one late critique: root publishes a sealed package, worker binds once."""
import argparse,datetime as dt,hashlib,json,os,sys,time
from pathlib import Path
sys.dont_write_bytecode=True
import handoff
UTC=dt.timezone.utc
VERSION='er13.b12-late-critique.v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(handoff.regular(p).read_bytes())
def exclusive(p,obj):
 p.parent.mkdir(parents=True,exist_ok=True)
 raw=(json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode()
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
 with os.fdopen(fd,'wb') as f:f.write(raw)
 return raw
def now():return dt.datetime.now(UTC)
def parse(value):
 v=dt.datetime.fromisoformat(value.replace('Z','+00:00'))
 if v.tzinfo is None:raise ValueError('timezone-aware frozen deadline required')
 return v
def context(path):
 path=path.absolute();c=read(path);dest=path.parent.parent
 if c.get('public_recipe_choice')!='B12' or c.get('execution_topology')!='b12-overlap-v1' or c.get('dispatch_owner')!='root':raise ValueError('exact root-owned B12 overlap config required')
 manifest=read(dest/'materialized-manifest.json')
 pin=next((r for r in manifest['files'] if r['relative_path']==str(path.relative_to(dest))),None)
 if not pin or sha(path)!=pin['sha256']:raise ValueError('frozen config pin differs')
 root=dest/'run'/c['run_id']
 if c['runtime_root']!=str(root):raise ValueError('config/runtime binding differs')
 inv=root/'stages/investigator';critic=root/'stages/critic';reviser=root/'stages/reviser';freeze=read(reviser/'freeze.json');im=read(reviser/'input-map.json')
 marker=read(reviser/'exact-activation-capture-v2-1.json')
 for n in ('assignment.md','request.json','freeze.json','input-map.json'):
  if sha(reviser/n)!=marker.get('updated_sha256',{}).get(n):raise ValueError('immutable initial reviser input changed before late binding')
 if freeze.get('stage')!='reviser' or freeze.get('stage_budget_s')!=1080 or not im.get('late_critique'):raise ValueError('fresh overlap reviser freeze required')
 prepared=parse(freeze['prepared_at_utc']);deadline=parse(freeze['stage_deadline_utc'])
 if deadline>parse(c['whole_deadline_utc']) or (deadline-prepared).total_seconds()>1080:raise ValueError('original overlap role/whole deadline differs')
 release=root/'control/late-critique/release.json';binding=reviser/'late-critique-binding.json'
 if im['late_critique']['release_path']!=str(release) or im['late_critique']['binding_path']!=str(binding):raise ValueError('late input path binding differs')
 return c,path,root,inv,critic,reviser,freeze,release,binding
def validate(ctx,obj):
 c,path,root,inv,critic,reviser,freeze,release,binding=ctx
 ih=handoff.verify(inv);ch=handoff.verify(critic)
 status=read(critic/'status.json');dispatch=read(critic/'dispatch.json')
 if ch['status']!='completed' or status.get('status')!='completed' or status.get('hasPendingChildRuns') is not False or status.get('taskId')!=ch['taskId'] or status.get('taskId')!=dispatch.get('returned',{}).get('taskId'):raise ValueError('exact successful terminal critic with zero pending runs required')
 invdeps=freeze.get('predecessors',[])
 if len(invdeps)!=1 or invdeps[0].get('stage')!='investigator' or invdeps[0].get('taskId')!=ih['taskId']:raise ValueError('late input belongs to a different investigator')
 snapshot=handoff.destination(critic)
 expected=[]
 for row in ch['files']:
  rel=row['relative_path']
  if rel in ('critique.md','source-map.json') or rel.startswith('sources/'):
   p=handoff.regular(snapshot/'files'/rel)
   if sha(p)!=row['sha256']:raise ValueError('frozen critic package differs')
   expected.append({'path':str(p),'sha256':row['sha256'],'bytes':row['bytes']})
 if not {str(snapshot/'files/critique.md'),str(snapshot/'files/source-map.json')}<={r['path'] for r in expected}:raise ValueError('complete required critic package missing')
 fields={'version':VERSION,'run_id':c['run_id'],'config_sha256':sha(path),'investigator_handoff_sha256':sha(handoff.destination(inv)/'manifest.json'),'critic_taskId':ch['taskId'],'critic_handoff_sha256':sha(snapshot/'manifest.json'),'stage_deadline_utc':freeze['stage_deadline_utc'],'whole_deadline_utc':freeze['whole_deadline_utc'],'package':expected}
 if obj is not None and any(obj.get(k)!=v for k,v in fields.items()):raise ValueError('late critique release identity/hash/package differs')
 return fields
def publish(path):
 ctx=context(path);freeze=ctx[6];release=ctx[7]
 if now()>=min(parse(freeze['stage_deadline_utc']),parse(freeze['whole_deadline_utc'])):raise ValueError('late critique arrived after original reviser deadline; no extension')
 fields=validate(ctx,read(release) if release.exists() else None)
 if release.exists():return {'published':True,'idempotent':True,'release_path':str(release)}
 fields['published_at_utc']=now().isoformat();exclusive(release,fields)
 return {'published':True,'idempotent':False,'release_path':str(release)}
def bind(path):
 ctx=context(path);c,p,root,inv,critic,reviser,freeze,release,binding=ctx
 deadline=min(parse(freeze['stage_deadline_utc']),parse(freeze['whole_deadline_utc']))
 if now()>=deadline:raise ValueError('original reviser deadline expired; preserve provisional and failure')
 if not release.exists():return {'waiting':True,'release_path':str(release),'deadline_utc':deadline.isoformat()}
 obj=read(release);fields=validate(ctx,obj)
 provisional=handoff.regular(reviser/'provisional-final.md')
 if provisional.stat().st_size==0:raise ValueError('provisional proposal must be saved before one late-input binding')
 receipt={'version':VERSION,'run_id':c['run_id'],'release_path':str(release),'release_sha256':sha(release),'critic_taskId':fields['critic_taskId'],'critic_handoff_sha256':fields['critic_handoff_sha256'],'stage_deadline_utc':freeze['stage_deadline_utc'],'whole_deadline_utc':freeze['whole_deadline_utc'],'provisional_final_sha256':sha(provisional),'package':fields['package'],'native_lifecycle_qualified':False,'science_qualified':False}
 if binding.exists():
  old=read(binding)
  if any(old.get(k)!=v for k,v in receipt.items()):raise ValueError('immutable late-input binding differs; never replace critique')
  return {'bound':True,'idempotent':True,'binding_path':str(binding)}
 receipt['bound_at_utc']=now().isoformat();exclusive(binding,receipt)
 return {'bound':True,'idempotent':False,'binding_path':str(binding)}
def failure(path,message):
 try:
  ctx=context(path);p=ctx[5]/'late-critique-failure.json'
  if not p.exists():exclusive(p,{'version':VERSION,'at_utc':now().isoformat(),'message':message,'stage_deadline_utc':ctx[6]['stage_deadline_utc'],'clock_reset':False,'partial_science_preserved':True})
 except (ValueError,KeyError,OSError):pass

def main():
 a=argparse.ArgumentParser(description=__doc__);a.add_argument('action',choices=['publish','bind']);a.add_argument('--config',type=Path,required=True);a.add_argument('--wait',action='store_true');v=a.parse_args()
 try:
  if v.wait and v.action!='bind':raise ValueError('wait applies only to bounded one-shot worker binding')
  while True:
   result=publish(v.config) if v.action=='publish' else bind(v.config)
   if not v.wait or not result.get('waiting'):break
   remaining=(parse(result['deadline_utc'])-now()).total_seconds()
   if remaining<=0:raise ValueError('original reviser deadline expired; no late input bound')
   time.sleep(min(1.0,remaining))
  print(json.dumps(result))
 except (ValueError,KeyError,OSError) as e:
  if v.action=='bind':failure(v.config,str(e))
  a.exit(2,str(e)+'\n')
if __name__=='__main__':main()
