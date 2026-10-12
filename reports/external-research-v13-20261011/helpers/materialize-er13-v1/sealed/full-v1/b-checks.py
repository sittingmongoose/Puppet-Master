#!/usr/bin/env python3
"""Meaningful finite B/topology/immutable-handoff delta checks; MOCK only."""
import argparse,contextlib,datetime as dt,hashlib,importlib.util,io,json,shutil,tempfile,subprocess,sys
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
checks=[]
def check(n,ok):
 checks.append({'name':n,'passed':bool(ok)})
 if not ok:raise AssertionError(n)
def load(p,n):
 s=importlib.util.spec_from_file_location(n,p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
def refused(f):
 try:f();return False
 except (ValueError,SystemExit):return True
def main():
 with tempfile.TemporaryDirectory(prefix='er13-B-offline-') as td:
  s=Path(td);portable=s/'copy';portable.mkdir()
  bm=json.loads((HERE/'bundle-manifest.json').read_text())
  for row in bm['files']:
   p=HERE/row['relative_path'];check('public pin '+row['relative_path'],hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256']);out=portable/row['relative_path'];out.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,out)
  mat=load(portable/'materialize.py','bmaterialize');brief=s/'brief.md';plan=s/'plan.md';brief.write_text('Generic synthetic brief\n'+mat.TIME_CONTRACT);plan.write_text('Generic synthetic exact plan\n'+mat.TIME_CONTRACT)
  for method in ['B02','B06','B07','B09','B10','B11','B12']:
   d=s/method;budgets='1800,1800' if method=='B02' else '1800,360,360,1080' if method=='B06' else '1800,720,1080'
   md=s/(method+'-method');md.mkdir();(md/'method.json').write_text(json.dumps({'method_id':method,'topology':'R0','timing':'30/12/18'}))
   for stage in ['investigator','critic','reviser']:(md/(stage+'_prompt_delta.txt')).write_text('Generic synthetic '+method+' '+stage+' delta.\n')
   args=argparse.Namespace(destination=str(d),candidate='luna',authorized_provider_instance='MOCK_ROUTE',brief=str(brief),plan=str(plan),run_id='mock-'+method,whole_deadline_utc=(dt.datetime.now(mat.UTC)+dt.timedelta(seconds=3599)).isoformat(),t0_utc=None,stage_budgets_s=budgets,whole_budget_s=3600,method=method,method_directory=str(md) if method in ('B11','B12') else None,activation_capture_version='exact-capture-v21')
   with contextlib.redirect_stdout(io.StringIO()):mat.materialize(args);mat.verify(d)
   cfgpath=d/'configs'/('mock-'+method+'.json');cfg=json.loads(cfgpath.read_text());base=load(d/'helpers/er12-screen-v1/prepare.py','base'+method);c=base.load_config(cfgpath);root=c['_root']
   check(method+' exact stage budgets',cfg['stage_budgets_s']==base.STAGE_SECONDS)
   check(method+' final output selected before science',cfg['final_stage']==('critic' if method=='B02' else 'reviser'))
   if method=='B06':check('B06 summed critics do not exceed control 720',sum(v for k,v in base.STAGE_SECONDS.items() if k.startswith('critic'))==720 and len(base.STAGE_SECONDS)==4)
   if method=='B02':check('B02 no separate reviser','reviser' not in base.STAGE_SECONDS)
   base.get_deps=lambda c,stage:[];base.verify_terminal_status=lambda root,deps:None;base.verify_predecessors=lambda root,stage:[]
   for stage in base.STAGE_SECONDS:(root/'stages'/stage/'sources').mkdir(parents=True,exist_ok=True)
   specs={}
   for stage in base.STAGE_SECONDS:
    spec=base.prepare(c,stage);specs[stage]=spec;sd=Path(spec['stageDir']);fr=json.loads((sd/'freeze.json').read_text());text=(sd/'assignment.md').read_text()
    check(method+' '+stage+' maximum contract and Standard','maximum of 60 elapsed minutes' in text and spec['args']['target']['options']['serviceTier']=='default')
    check(method+' '+stage+' cap clipped to whole',fr['stage_budget_s']==base.STAGE_SECONDS[stage] and fr['stage_deadline_utc']<=fr['whole_deadline_utc'])
    if method=='B02' and stage=='critic':check('B02 same critic finalizes with complete review','SAME Goal' in text and 'final.md' in text and 'do not write or repair a final' not in text)
    if method=='B06':check('B06 role has declared responsibility',('COMPLEMENTARY BREADTH' in text if stage=='critic-breadth' else 'COMPLEMENTARY TRUTH' in text if stage=='critic-truth' else 'BOTH exact complementary' in text if stage=='reviser' else 'two parallel complementary' in text))
    if method in mat.DELTA_METHODS:check(method+' '+stage+' exact frozen delta and hash', ((md if method in ('B11','B12') else portable/'sources/methods'/method)/(stage+'_prompt_delta.txt')).read_text() in text and any(x['path']==cfg['method_delta_files'][stage]['path'] for x in fr['frozen_inputs']))
    clarify=load(d/'mechanics/invocation-clarification-v1/transform.py','clarify'+method+stage);guard=load(d/'mechanics/exact-goal-binding-guard-v1/overlay.py','guard'+method+stage);capture=load(d/'mechanics/exact-activation-capture-v2-1/overlay.py','capture'+method+stage)
    clarify.transform(sd);guard.transform(sd);capture.transform(sd)
    check(method+' '+stage+' existing exact capture works',(sd/'exact-activation-capture-v2-1.json').is_file())
    old={n:(sd/n).read_bytes() for n in ['assignment.md','input-map.json','freeze.json','request.json']};retry=base.prepare(c,stage)
    check(method+' '+stage+' immutable retry bytes',retry['retry'] and all((sd/n).read_bytes()==v for n,v in old.items()))
    check(method+' '+stage+' capture retry idempotent',capture.transform(sd)['idempotent'])
   if method in mat.DELTA_METHODS:
    p=Path(cfg['method_delta_files']['critic']['path']);p.write_text('changed synthetic delta');check(method+' changed supplied delta refused',refused(lambda:base.load_config(cfgpath)))
  # Isolated immutable terminal handoff fixture; no fabricated scientific/native proof.
  handoff=load(portable/'sources/helpers/er12-screen-v1/handoff.py','handoff');stage=s/'synthetic-runtime/stages/critic';stage.mkdir(parents=True);(stage/'sources').mkdir();(stage/'final.md').write_text('Generic MOCK selected output');(stage/'sources/p.txt').write_text('Generic MOCK carried source')
  (stage/'dispatch.json').write_text(json.dumps({'returned':{'taskId':'MOCK_TASK'}}));(stage/'status.json').write_text(json.dumps({'taskId':'MOCK_TASK','status':'completed','hasPendingChildRuns':False}))
  result=handoff.seal(stage);check('terminal snapshot is mechanical only',result['native_lifecycle_qualified'] is False and result['science_qualified'] is False);check('terminal snapshot retry idempotent',handoff.seal(stage)['idempotent'])
  (stage/'sources/q.txt').write_text('added MOCK source');check('terminal source inventory addition refused',refused(lambda:handoff.verify(stage)));(stage/'sources/q.txt').unlink()
  (stage/'final.md').write_text('changed MOCK selected output');check('terminal selected output mutation refused',refused(lambda:handoff.verify(stage)))
  routes=load(portable/'routes.py','routes')
  for candidate,row in routes.ROUTES.items():
   target={'providerInstanceId':'MOCK_'+candidate,'driverKind':row['driver'],'canRunChildTask':True,'constraints':[],'models':[{'id':row['model'],'options':[{'id':k,'options':[{'id':v}]} for k,v in row['options'].items()]}]}
   cp={'providers':[target]};rp=routes.plan(cp,candidate,target['providerInstanceId']);check(candidate+' exact route planning readiness',rp['target']['options']==row['options'] and rp['mechanical_ready']==(candidate=='luna') and rp['native_lifecycle_observed'] is False)
   target['models'][0]['options']=[];check(candidate+' unsupported max option refused',refused(lambda:routes.plan(cp,candidate,target['providerInstanceId'])))
  # Admission failures cannot create fresh replacement/copy directories.
  a=argparse.Namespace(**vars(args));a.method='B03';a.method_directory=None;a.destination=str(s/'blocked-B03');check('B03 retained Goal lifecycle honestly refused',refused(lambda:mat.materialize(a)) and not Path(a.destination).exists())
  for candidate in ['muse','zcode']:
   a.method='R0';a.candidate=candidate;a.destination=str(s/('blocked-'+candidate));check(candidate+' direct lifecycle refusal before copy',refused(lambda:mat.materialize(a)) and not Path(a.destination).exists())
  a.candidate='luna';a.t0_utc=(dt.datetime.now(mat.UTC)+dt.timedelta(seconds=60)).isoformat();a.destination=str(s/'future-T0');check('future T0 refused before copy',refused(lambda:mat.materialize(a)) and not Path(a.destination).exists())
 result={'passed':True,'checks':len(checks),'details':checks,'mode':'SYNTHETIC_OFFLINE_B_DELTAS_ONLY','native_candidate_calls':0,'dispatches':0,'reserve_starts':0,'scratch_removed':True}
 (HERE/'b-check-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='details'}))
if __name__=='__main__':main()
