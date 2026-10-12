#!/usr/bin/env python3
"""Finite synthetic v3 delta checks; no native candidate calls or source retrieval."""
import copy, datetime as dt, hashlib, importlib.util, json, subprocess, sys, tempfile, shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent
checks=[]
def check(name,ok):
    checks.append({'name':name,'passed':bool(ok)})
    if not ok:raise AssertionError(name)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p,n):
    s=importlib.util.spec_from_file_location(n,p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
def shell(args):
    r=subprocess.run(args,capture_output=True,text=True);return r

def main():
 with tempfile.TemporaryDirectory(prefix='.offline-smoke-v3-',dir=HERE) as td:
    s=Path(td);portable=s/'public-copy';portable.mkdir()
    # Copy the entire declared bundle, never reaching original campaign helpers.
    bm=json.loads((HERE/'bundle-manifest.json').read_text())
    for row in bm['files']:
        p=HERE/row['relative_path'];check('public pin '+row['relative_path'],sha(p)==row['sha256']);t=portable/row['relative_path'];t.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,t)
    brief=s/'new-brief.md';plan=s/'new-plan.md';brief.write_text('Generic synthetic caller brief.');plan.write_text('Generic synthetic caller exact plan.')
    for version in ['exact-v1','exact-capture-v21']:
      for method in ['R0','A1','A1+A8']:
        label=version+' '+method;d=s/(version+'-'+method.replace('+','-'));rid='fresh-'+method.replace('+','-')
        args=[sys.executable,'-B',str(portable/'materialize.py'),'--destination',str(d),'--brief',str(brief),'--plan',str(plan),'--run-id',rid,'--authorized-provider-instance','MOCK_AUTHORIZED_ROUTE','--method',method,'--activation-capture-version',version,'--stage-budgets-s','1800,720,1080','--whole-budget-s','3600','--whole-deadline-utc',(dt.datetime.now(dt.timezone.utc)+dt.timedelta(seconds=3599)).isoformat()]
        r=shell(args);check(label+' copied complete closure materializes',r.returncode==0)
        check(label+' final portable manifest',shell([sys.executable,'-B',str(portable/'materialize.py'),'--verify',str(d)]).returncode==0)
        manifest=json.loads((d/'materialized-manifest.json').read_text());check(label+' actual final relocated repins',all(sha(d/x['relocated_relative_path'])==x['final_materialized_sha256'] for x in manifest['public_to_relocated_hash_mapping']))
        h=d/'helpers/er12-screen-v1';cpath=d/'configs'/f'{rid}.json';cfg=json.loads(cpath.read_text())
        check(label+' unchanged v1 assertion',sha(d/'mechanics/exact-goal-binding-guard-v1/assert-active-goal.py')==sha(HERE/'sources/mechanics/exact-goal-binding-guard-v1/assert-active-goal.py'))
        comp=load(d/'helpers/er12-composite-A1-A8-v1/prepare.py','comp_'+label.replace(' ','_'));b=comp.b
        check(label+' final component pins',all(sha(Path(x['path']))==x['sha256'] and Path(x['path']).stat().st_size==x['bytes'] for x in comp.COMPONENTS.values()))
        if method=='A1+A8':check(label+' final composite config pins',cfg['composite_guard']==comp.GUARD)
        base=load(h/'prepare.py','base_'+label.replace(' ','_'));m=comp.b if method=='A1+A8' else base;c=m.load_config(cpath);root=c['_root']
        if version=='exact-v1':
            check(label+' old bootstrap sequence preserved','await captureSpec(' not in (h/'bootstrap.js').read_text());continue
        # Real local bootstrap transforms investigator only, then MOCK dispatch throws.
        harness=s/'dry.cjs';harness.write_text('''const fs=require('fs'),cp=require('child_process');const A=Object.getPrototypeOf(async function(){}).constructor;const tools={exec_command:async a=>{const p=cp.spawnSync('bash',['-c',a.cmd],{encoding:'utf8'});return {exit_code:p.status,output:a.cmd==='free -g'?'Mem: 16 1 1 1 1 12\\n':p.stdout+p.stderr}},mcp__t3_code__orchestrator_capabilities:async()=>({structuredContent:{providers:[{providerInstanceId:'MOCK_AUTHORIZED_ROUTE',canRunChildTask:true,models:[{id:'gpt-6-luna',options:[{id:'reasoningEffort',options:[{id:'max'}]},{id:'serviceTier',options:[{id:'priority'},{id:'default'}]}]}]}]}}),mcp__t3_code__delegate_task:async()=>{throw Error('MOCK_STOP_BEFORE_DISPATCH')}};(async()=>{try{await new A('tools','text',fs.readFileSync(process.argv[2],'utf8'))(tools,()=>{});process.exitCode=2}catch(e){if(e.message==='MOCK_STOP_BEFORE_DISPATCH')process.stdout.write('stopped');else{process.stderr.write(String(e));process.exitCode=3}}})();''')
        # Catalog schema matches existing bundle harness, fixed below if catalog differs.
        r=shell(['node',str(harness),str(h/'bootstrap.js')]);check(label+' offline bootstrap stops before dispatch',r.returncode==0 and r.stdout=='stopped')
        inv=root/'stages/investigator';check(label+' bootstrap v21 prepared before stop',(inv/'exact-activation-capture-v2-1.json').is_file())
        check(label+' no reveal or native Goal',not any((inv/n).exists() for n in ['dispatch.json','plan-reveal.json','native-goal-create.json']))
        r=shell(['node',str(harness),str(h/'bootstrap.js')]);check(label+' bootstrap unused retry preserves v21 capture',r.returncode==0 and r.stdout=='stopped')
        # Remove synthetic unused investigator only so all stage clocks can be tested from shared T0.
        shutil.rmtree(root)
        shutil.rmtree(d/"mechanics/service-tier-change")
        m.get_deps=lambda c,stage:[];m.verify_terminal_status=lambda root,deps:None
        generic=s/'generic-predecessor.txt';generic.write_text('Generic synthetic predecessor bytes.')
        m.verify_predecessors=lambda root,stage:[generic]
        actual=dt.datetime.now(dt.timezone.utc);m.now=lambda:actual-dt.timedelta(seconds=600);m.init_run(c);m.now=lambda:actual
        for n in ['investigator','critic']:(root/'stages'/n/'sources').mkdir(parents=True,exist_ok=True)
        prefix=(h/'bootstrap.js').read_text().split('// Paste into T3 functions code mode.')[0]
        for stage in ['investigator','critic','reviser']:
            p=m.prepare(c,stage);sd=Path(p['stageDir']);before=json.loads((sd/'freeze.json').read_text());before['native_goal_objective'] += ' synthetic quote " apostrophe \' newline\nUnicode Ω';(sd/'freeze.json').write_text(json.dumps(before,ensure_ascii=False,indent=2)+'\n');before_req=json.loads((sd/'request.json').read_text())
            expect=({'investigator':1800,'critic':2520,'reviser':3600}[stage]-600) if method!='R0' else {'investigator':1800,'critic':720,'reviser':1080}[stage]
            check(label+' '+stage+' frozen hard clock',abs((dt.datetime.fromisoformat(before['stage_deadline_utc'].replace('Z','+00:00'))-actual).total_seconds()-expect)<.01)
            spec=s/'spec.json';spec.write_text(json.dumps(p));program=s/'sequence.js';program.write_text(prefix+'\nawait exactSpec(await clarifySpec(await standardSpec(spec)));')
            runner=s/'sequence.cjs';runner.write_text("const fs=require('fs'),cp=require('child_process');const A=Object.getPrototypeOf(async function(){}).constructor;const tools={exec_command:async a=>{const p=cp.spawnSync('bash',['-c',a.cmd],{encoding:'utf8'});return {exit_code:p.status,output:p.stdout+p.stderr}}};(async()=>{try{await new A('tools','spec',fs.readFileSync(process.argv[2],'utf8'))(tools,JSON.parse(fs.readFileSync(process.argv[3],'utf8')))}catch(e){process.stderr.write(String(e));process.exitCode=2}})();")
            r=shell(['node',str(runner),str(program),str(spec)]);check(label+' '+stage+' original transforms first '+r.stderr,r.returncode==0)
            full_assignment=(sd/'assignment.md').read_bytes()
            # Opaque descendants deliberately reference mechanical assignment; whole record must stay opaque.
            opaque={'path':'missing-relative-science','sha256':'INVALID','bytes':-7,'nested':{'path':str(sd/'assignment.md'),'sha256':'OPAQUE','bytes':None},'extra':['quote\'"\n',None,False,12]}
            f=json.loads((sd/'freeze.json').read_text());im=json.loads((sd/'input-map.json').read_text());f['opaque_science']=copy.deepcopy(opaque);im['opaque_science']=copy.deepcopy(opaque)
            (sd/'input-map.json').write_text(json.dumps(im,indent=2)+'\n')
            for row in f['frozen_inputs']:
                if row['path']==str(sd/'input-map.json'):row.update(sha256=sha(sd/'input-map.json'),bytes=(sd/'input-map.json').stat().st_size)
            (sd/'freeze.json').write_text(json.dumps(f,indent=2)+'\n')
            marker=sd/'exact-goal-binding-guard.json';v=json.loads(marker.read_text());v['updated_sha256'].update({n:sha(sd/n) for n in ['freeze.json','input-map.json']});marker.write_text(json.dumps(v))
            cap=load(d/'mechanics/exact-activation-capture-v2-1/overlay.py','capture_'+method+stage)
            origPath=cap.Path
            def sentinel(value):
                if value=='missing-relative-science':raise AssertionError('opaque ref constructed/opened')
                return origPath(value)
            cap.Path=sentinel
            out=cap.transform(sd);after=json.loads((sd/'freeze.json').read_text());req=json.loads((sd/'request.json').read_text())
            check(label+' '+stage+' opaque fields unread and equivalent',after['opaque_science']==opaque and json.loads((sd/'input-map.json').read_text())['opaque_science']==opaque)
            check(label+' '+stage+' objective time route key scope preserved',all(after[k]==f[k] for k in ['native_goal_objective','stage_deadline_utc','whole_deadline_utc','requested_route','stage_budget_s']) and req['clientRequestId']==before_req['clientRequestId'] and req['args']['task'].startswith(before_req['args']['task']) and req['args']['target']['options']['serviceTier']=='default')
            check(label+' '+stage+' entire baseline assignment preserved',(sd/'assignment.md').read_bytes().startswith(full_assignment))
            check(label+' '+stage+' exact prompt delta preserved',stage=='investigator' or method!='A1+A8' or (d/'methods/A8'/f'{stage}_prompt_delta.txt').read_text() in (sd/'assignment.md').read_text())
            check(label+' '+stage+' unused v21 retry idempotent',cap.transform(sd)['idempotent'])
            used=sd/'used.txt';used.write_text('used');refused=False
            try:cap.transform(sd)
            except ValueError:refused=True
            check(label+' '+stage+' used stage refused',refused);used.unlink()
            raw=(sd/'assignment.md').read_bytes();(sd/'assignment.md').write_bytes(raw+b'changed');refused=False
            try:cap.transform(sd)
            except ValueError:refused=True
            check(label+' '+stage+' changed stage refused',refused);(sd/'assignment.md').write_bytes(raw)
            # Execute exact snippet with MOCK create tool; complete returned object serialized once.
            snippet=(d/'mechanics/exact-activation-capture-v2-1/activation-snippet-template.js').read_text().replace('__STAGE_DIR_JSON__',json.dumps(str(sd)))
            sp=s/'snippet.js';sp.write_text(snippet)
            mock=s/'mock.cjs';mock.write_text('''const fs=require('fs'),cp=require('child_process');const A=Object.getPrototypeOf(async function(){}).constructor;let count=0;const stage=process.argv[3];const objective=JSON.parse(fs.readFileSync(stage+'/freeze.json','utf8')).native_goal_objective;const response={goal:{threadId:'MOCK_ONLY',objective:objective+(process.env.WRONG?' changed':''),status:'active',createdAt:1,updatedAt:1,tokensUsed:0,timeUsedSeconds:0,optional:'quotes \\" apostrophe \\' newline\\n'},remainingTokens:null,completionBudgetReport:null,optional:{a:[null,false,'\\n']}};const tools={create_goal:async a=>{count++;if(a.objective!==objective)throw Error('objective changed');return response},exec_command:async a=>{const p=cp.spawnSync('bash',['-c',a.cmd],{encoding:'utf8'});return {exit_code:p.status,output:p.stdout+p.stderr}}};(async()=>{let failed=false;try{await new A('tools','text',fs.readFileSync(process.argv[2],'utf8'))(tools,()=>{})}catch(e){failed=true}const raw=fs.readFileSync(stage+'/native-goal-create.json','utf8');process.stdout.write(JSON.stringify({count,full_byte_capture:raw===JSON.stringify(response),failed}));})();''')
            r=shell(['node',str(mock),str(sp),str(sd)]);check(label+' '+stage+' MOCK snippet once full bytes optional quotes',r.returncode==0 and json.loads(r.stdout)=={'count':1,'full_byte_capture':True,'failed':False})
            (sd/'native-goal-create.json').unlink()
            import os
            r=subprocess.run(['node',str(mock),str(sp),str(sd)],capture_output=True,text=True,env={**os.environ,'WRONG':'1'})
            check(label+' '+stage+' wrong objective stops onecreate preserves raw',r.returncode==0 and json.loads(r.stdout)=={'count':1,'full_byte_capture':True,'failed':True});(sd/'native-goal-create.json').unlink()
            saved=(sd/'freeze.json').read_bytes();expired=json.loads(saved);expired['stage_deadline_utc']='2000-01-01T00:00:00Z';(sd/'freeze.json').write_text(json.dumps(expired));refused=False
            try:cap.transform(sd)
            except ValueError:refused=True
            check(label+' '+stage+' expired clock refused',refused);(sd/'freeze.json').write_bytes(saved)
        cap=load(d/'mechanics/exact-activation-capture-v2-1/overlay.py','owner_neg');saved=cpath.read_bytes();cpath.write_bytes(saved+b' ');refused=False
        try:cap.transform(root/'stages/investigator')
        except ValueError:refused=True
        check(label+' changed generated config refused',refused);cpath.write_bytes(saved)
        refused=False
        try:cap.transform(s/'historical-D-R2-1/control/stages/investigator')
        except ValueError:refused=True
        check(label+' external historical slot not adopted',refused)
    prior=json.loads((HERE/'prior-v2-check-results.json').read_text());check('236 prior edition assertions retained, not rerun',len(prior['checks'])==236 and prior['passed'])
 result={'passed':True,'checks':len(checks),'details':checks,'prior_v2_checks':236,'prior_v2_rerun':False,'mode':'SYNTHETIC_OFFLINE_DELTA_ONLY','native_candidate_calls':0,'dispatches':0,'reveal_executions':0,'science_qualified':False,'provenance_qualified':False,'scratch_removed':True}
 (HERE/'check-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='details'}))
if __name__=='__main__':main()
