#!/usr/bin/env python3
"""B12 overlap/late-binding finite synthetic delta checks; no native dispatch."""
import argparse,contextlib,datetime as dt,hashlib,importlib.util,io,json,shutil,sys,tempfile
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
checks=[]
def check(name,ok):
 checks.append({'name':name,'passed':bool(ok)})
 if not ok:raise AssertionError(name)
def load(path,name):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
def refused(call):
 try:call();return False
 except (ValueError,SystemExit,OSError):return True
def dump(p,o):p.write_text(json.dumps(o,indent=2)+'\n')
def main():
 with tempfile.TemporaryDirectory(prefix='er13-overlap-offline-') as td:
  s=Path(td);copy=s/'portable';copy.mkdir();bm=json.loads((HERE/'bundle-manifest.json').read_text())
  for row in bm['files']:
   p=HERE/row['relative_path'];check('public member '+row['relative_path'],hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256']);out=copy/row['relative_path'];out.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,out)
  mat=load(copy/'materialize.py','overlapmat');brief=s/'brief.md';plan=s/'plan.md';brief.write_text('Generic MOCK brief\n'+mat.TIME_CONTRACT);plan.write_text('Generic MOCK exact plan\n'+mat.TIME_CONTRACT)
  md=s/'method';md.mkdir();dump(md/'method.json',{'method_id':'B12','execution_topology':'b12-overlap-v1','candidate_contexts':3,'stage_maxima_seconds':mat.BUDGETS})
  for stage in mat.BUDGETS:(md/(stage+'_prompt_delta.txt')).write_text('Generic MOCK B12 '+stage+' delta\n')
  d=s/'admitted';args=argparse.Namespace(destination=str(d),candidate='luna',authorized_provider_instance='MOCK_ROUTE',brief=str(brief),plan=str(plan),run_id='MOCK_OVERLAP',whole_deadline_utc=(dt.datetime.now(mat.UTC)+dt.timedelta(seconds=3599)).isoformat(),t0_utc=None,stage_budgets_s='1800,720,1080',whole_budget_s=3600,method='B12',method_directory=str(md),activation_capture_version='exact-capture-v21')
  with contextlib.redirect_stdout(io.StringIO()):mat.materialize(args);mat.verify(d)
  cfgpath=d/'configs/MOCK_OVERLAP.json';cfg=json.loads(cfgpath.read_text());helper=d/'helpers/er12-screen-v1';sys.path.insert(0,str(helper));handoff=load(helper/'handoff.py','handoff');sys.modules['handoff']=handoff
  base=load(helper/'prepare.py','overlapbase');late=load(helper/'late-critique.py','late');c=base.load_config(cfgpath);root=c['_root'];inv=root/'stages/investigator';critic=root/'stages/critic';rev=root/'stages/reviser'
  check('topology explicitly frozen',cfg['execution_topology']=='b12-overlap-v1' and cfg['stage_budgets_s']==mat.BUDGETS)
  base.prepare(c,'investigator')
  for n in ['discovery.md','draft.md','source-map.json','revealed-plan.md']:(inv/n).write_text('Generic MOCK investigator '+n)
  dump(inv/'plan-reveal.json',{'discovery_sha256':base.digest(inv/'discovery.md'),'plan_sha256':base.digest(inv/'revealed-plan.md')})
  dump(inv/'dispatch.json',{'returned':{'taskId':'MOCK_INV','childThreadId':'MOCK_T3_INV'}});dump(inv/'status.json',{'taskId':'MOCK_INV','status':'completed','hasPendingChildRuns':False});handoff.seal(inv)
  cs=base.prepare(c,'critic');dump(critic/'dispatch.json',{'returned':{'taskId':'MOCK_CRITIC','childThreadId':'MOCK_T3_CRITIC'}})
  check('critic only frozen investigator dependency',[x['stage'] for x in base.get_deps(c,'critic')]==['investigator'])
  rs=base.prepare(c,'reviser');fr=json.loads((rev/'freeze.json').read_text());im=json.loads((rev/'input-map.json').read_text());assignment=(rev/'assignment.md').read_text()
  check('reviser starts while critic has no terminal status',not (critic/'status.json').exists() and [x['stage'] for x in fr['predecessors']]==['investigator'])
  check('initial reviser carries no live critic science',all('stages/critic' not in p for p in im['predecessors']+im['source_roots']))
  check('three contexts, no extra budget',base.STAGE_SECONDS=={'investigator':1800,'critic':720,'reviser':1080})
  prepared=base.parse_time(fr['prepared_at_utc']);preend=base.parse_time(im['late_critique']['prewriting_deadline_utc']);deadline=base.parse_time(fr['stage_deadline_utc']);check('prewriting cap360 and original total1080',0<(preend-prepared).total_seconds()<=360 and 0<(deadline-prepared).total_seconds()<=1080)
  check('ordinary complete review required after single binding','ALL criticism' in assignment and 'SAME reviser Goal' in assignment and 'missing/late/failed critique' in assignment)
  clarify=load(d/'mechanics/invocation-clarification-v1/transform.py','oclarify');guard=load(d/'mechanics/exact-goal-binding-guard-v1/overlay.py','oguard');capture=load(d/'mechanics/exact-activation-capture-v2-1/overlay.py','ocapture');clarify.transform(rev);guard.transform(rev);capture.transform(rev)
  before={n:(rev/n).read_bytes() for n in ['assignment.md','request.json','freeze.json','input-map.json']}
  check('existing direct single-create capture retained',(rev/'assignment.md').read_text().count('const response = await tools.create_goal({objective});')==1)
  check('missing critique waits without binding',late.bind(cfgpath)['waiting'] and not (rev/'late-critique-binding.json').exists())
  check('unsealed critic cannot publish',refused(lambda:late.publish(cfgpath)))
  for n in ['critique.md','source-map.json']:(critic/n).write_text('Generic MOCK critic '+n)
  (critic/'sources/governing.txt').write_text('Generic MOCK carried primary evidence')
  dump(critic/'status.json',{'taskId':'MOCK_CRITIC','status':'completed','hasPendingChildRuns':False});handoff.seal(critic)
  original=late.now;late.now=lambda:deadline+dt.timedelta(milliseconds=1);check('late publication refused no extension',refused(lambda:late.publish(cfgpath)));late.now=original
  pub=late.publish(cfgpath);release=Path(pub['release_path']);saved_release=release.read_bytes();release.chmod(0o644);check('one publication idempotent',late.publish(cfgpath)['idempotent'])
  check('provisional required before binding',refused(lambda:late.bind(cfgpath)))
  (rev/'provisional-final.md').write_text('Generic MOCK provisional full proposal')
  dump(rev/'dispatch.json',{'returned':{'taskId':'MOCK_REVISER'}});dump(rev/'status.json',{'taskId':'MOCK_REVISER','status':'completed','hasPendingChildRuns':False});(rev/'final.md').write_text('Generic MOCK final');(rev/'source-map.json').write_text('{}')
  check('terminal completed cannot seal without late binding',refused(lambda:handoff.seal(rev)))
  parsed=json.loads(saved_release);parsed['critic_taskId']='WRONG_MOCK';dump(release,parsed);check('wrong critic identity refused',refused(lambda:late.bind(cfgpath)));release.write_bytes(saved_release)
  (critic/'sources/governing.txt').write_text('Changed MOCK evidence');check('changed sealed source refused',refused(lambda:late.bind(cfgpath)));(critic/'sources/governing.txt').write_text('Generic MOCK carried primary evidence')
  late.now=lambda:deadline+dt.timedelta(milliseconds=1);check('expired worker binding refused',refused(lambda:late.bind(cfgpath)));late.now=original
  result=late.bind(cfgpath);binding=Path(result['binding_path']);saved_binding=binding.read_bytes();binding.chmod(0o644);check('single binding and immutable retry',late.bind(cfgpath)['idempotent'] and binding.read_bytes()==saved_binding)
  check('initial goal/objective/request/deadlines unchanged',all((rev/n).read_bytes()==v for n,v in before.items()))
  receipt=json.loads(saved_binding);check('complete critic output plus source index pinned',len(receipt['package'])==3 and receipt['critic_taskId']=='MOCK_CRITIC' and receipt['stage_deadline_utc']==fr['stage_deadline_utc'])
  check('terminal completed now seals same existing revision stage',handoff.seal(rev)['status']=='completed')
  modified=json.loads(saved_binding);modified['critic_taskId']='OTHER_MOCK';dump(binding,modified);check('changed binding never replaced',refused(lambda:late.bind(cfgpath)));binding.write_bytes(saved_binding)
  badargs=argparse.Namespace(**vars(args));badargs.destination=str(s/'bad-topology');card=json.loads((md/'method.json').read_text());card['execution_topology']='invented-overlap';dump(md/'method.json',card);check('unsupported topology refused before copy',refused(lambda:mat.materialize(badargs)) and not Path(badargs.destination).exists())
  check('older snapshots byte immutable',all(hashlib.sha256((HERE/'sealed'/name/'bundle-manifest.json').read_bytes()).hexdigest()==expected for name,expected in [('luna-core-v1','9f1c955a99290eb55a2a8e9c6b9f05f01779945f7863bef90d114bd210443f2e'),('full-v1','ee5939ef2f60a70b966e7135ca9afe2771158f6bf062ff47604b81bf16b223d7')]))
 result={'passed':True,'checks':len(checks),'details':checks,'mode':'SYNTHETIC_OFFLINE_B12_OVERLAP_ONLY','native_candidate_calls':0,'dispatches':0,'reserve_starts':0,'scratch_removed':True}
 (HERE/'overlap-check-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='details'}))
if __name__=='__main__':main()
