#!/usr/bin/env python3
"""Bounded offline smoke only. No provider or reveal execution."""
import datetime as dt, hashlib, json, shutil, subprocess, sys, tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
checks=[]
def result(name, ok):
    if not ok: raise AssertionError(name)
    checks.append({'check':name,'passed':True})
def cli(args,ok=True):
    p=subprocess.run([sys.executable,'-B',str(HERE/'materialize.py'),*args],capture_output=True,text=True)
    if (p.returncode==0)!=ok: raise AssertionError('CLI expectation failed: '+p.stderr)
    result('CLI '+('accept' if ok else 'reject'), (p.returncode==0)==ok)
    return p

def main():
    with tempfile.TemporaryDirectory(prefix='.offline-smoke-',dir=HERE) as scratch:
        s=Path(scratch)
        brief=s/'NEW-brief.md';plan=s/'NEW-plan.md'
        brief.write_text('Generic scratch brief: compare two fictional note formats. Mechanics only.\n')
        plan.write_text('Generic scratch plan: preserve headings and explain one tradeoff. Mechanics only.\n')
        for method in ['R0','A1','A1+A8']:
            d=s/('fresh-'+method.replace('+','-'));rid='scratch-'+method.replace('+','-')
            args=['--destination',str(d),'--authorized-provider-instance','PUBLIC_OFFLINE_FIXTURE','--brief',str(brief),'--plan',str(plan),'--run-id',rid,'--method',method,'--stage-budgets-s','1800,720,1080','--whole-budget-s','3600','--whole-deadline-utc',(dt.datetime.now(dt.timezone.utc)+dt.timedelta(seconds=3599)).isoformat()]
            before=dt.datetime.now(dt.timezone.utc)
            cli(args);cli(['--verify',str(d)]);cli(args,False)
            config=d/'configs'/(rid+'.json');c=json.loads(config.read_text())
            root=Path(c['runtime_root']);h=d/'helpers/er12-screen-v1';preparer=d/'helpers/er12-composite-A1-A8-v1/prepare.py' if method=='A1+A8' else h/'prepare.py'
            end=dt.datetime.fromisoformat(c['whole_deadline_utc'].replace('Z','+00:00'))
            result(method+' new 60-minute config outside run',not config.is_relative_to(root) and 3598<(end-before).total_seconds()<3602)
            result(method+' 30/12/18 and original priority guard',c['stage_budgets_s']=={'investigator':1800,'critic':720,'reviser':1080} and c['provider']['options']['serviceTier']=='priority')
            caller=(h/'bootstrap.js').read_text()
            result(method+' no store dependence', 'load(' not in caller and 'store(' not in caller)
            js=s/('dry-'+method+'.cjs')
            js.write_text('''const fs=require('fs'),cp=require('child_process');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const tools={exec_command:async a=>{const r=cp.spawnSync('bash',['-c',a.cmd],{encoding:'utf8'});return {exit_code:r.status,output:r.stdout+r.stderr}},
mcp__t3_code__orchestrator_capabilities:async()=>({structuredContent:{providers:[{providerInstanceId:'PUBLIC_OFFLINE_FIXTURE',driverKind:'OFFLINE_FIXTURE',canRunChildTask:true,models:[{id:'gpt-6-luna',options:[{id:'reasoningEffort',options:[{id:'max'}]},{id:'serviceTier',options:[{id:'priority'},...(process.env.NO_STANDARD?[]:[{id:'default'}])]}]}]}]}}),
mcp__t3_code__delegate_task:async()=>{throw Error('OFFLINE_STOP_BEFORE_DISPATCH')},
mcp__t3_code__task_status:async()=>{throw Error('UNEXPECTED_STATUS_CALL')}};
(async()=>{try{await new AsyncFunction('tools','text','exit',fs.readFileSync(process.argv[2],'utf8'))(tools,()=>{},()=>{throw Error('UNEXPECTED_EXIT')});process.exitCode=2}catch(e){if(e.message==='OFFLINE_STOP_BEFORE_DISPATCH')process.stdout.write('offline-stop');else{process.stderr.write(String(e));process.exitCode=3}}})();
''')
            import os
            missing=subprocess.run(['node',str(js),str(h/'bootstrap.js')],capture_output=True,text=True,env={**os.environ,'NO_STANDARD':'1'})
            result(method+' missing live Standard option blocks before prepare',missing.returncode==3 and 'unavailable' in missing.stderr and not root.exists())
            node=subprocess.run(['node',str(js),str(h/'bootstrap.js')],capture_output=True,text=True)
            result(method+' bootstrap dry stops before actual dispatch',node.returncode==0 and node.stdout=='offline-stop')
            stage=root/'stages/investigator';req=json.loads((stage/'request.json').read_text());fr=json.loads((stage/'freeze.json').read_text())
            result(method+' actual prepared target Standard',req['args']['target']=={'providerInstanceId':'PUBLIC_OFFLINE_FIXTURE','model':'gpt-6-luna','options':{'reasoningEffort':'max','serviceTier':'default'}})
            result(method+' exact leaf objective',json.dumps(fr['native_goal_objective'],ensure_ascii=False) in req['args']['task'] and len(fr['native_goal_objective'])<4000)
            result(method+' reveal helper closed and unexecuted',str(h/'reveal.py') in (stage/'assignment.md').read_text() and (h/'reveal.py').is_file() and not (stage/'plan-reveal.json').exists() and not (stage/'revealed-plan.md').exists())
            result(method+' no fake task/native receipts',not (stage/'dispatch.json').exists() and not (stage/'native-goal-active.json').exists())
            result(method+' exact binding guard prepared before offline stop',(stage/'exact-goal-binding-guard.json').is_file() and 'ROOT EXACT GOAL BINDING GUARD v1' in req['args']['task'])
            result(method+' all transform markers and exact frozen assignment hash',(stage/'invocation-clarification.json').is_file() and (stage/'service-tier-change.json').is_file() and any(x['path']==str(stage/'assignment.md') and x['sha256']==hashlib.sha256((stage/'assignment.md').read_bytes()).hexdigest() for x in fr['frozen_inputs']))
            result(method+' full source binding present','source_root.rglob' in (h/'prepare.py').read_text())
            # Isolated verifier fixture, no predecessor/candidate outputs or fabricated dispatch.
            import importlib.util
            spec=importlib.util.spec_from_file_location('offline_prepare_'+method,h/'prepare.py')
            module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
            fixture=s/('inventory-fixture-'+method);fixture.mkdir()
            sources=fixture/'sources';sources.mkdir();f=sources/'generic.txt';f.write_text('generic source bytes')
            freeze={'stage_deadline_utc':c['whole_deadline_utc'], 'frozen_inputs':[{'path':str(f),'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}], 'carried_source_inventory':[{'root':str(sources),'paths':[str(f)]}]}
            (fixture/'freeze.json').write_text(json.dumps(freeze))
            request={'clientRequestId':'PUBLIC_FIXTURE','args':{'clientRequestId':'PUBLIC_FIXTURE'}}
            module.verify_saved_request(fixture,request)
            new=sources/'added.txt';new.write_text('generic extra bytes')
            rejected=False
            try: module.verify_saved_request(fixture,request)
            except SystemExit as exc: rejected='inventory changed' in str(exc)
            result(method+' full source additions reject retry',rejected)
            new.unlink();f.write_text('changed generic bytes')
            rejected=False
            try: module.verify_saved_request(fixture,request)
            except SystemExit as exc: rejected='frozen input changed' in str(exc)
            result(method+' carried source changed bytes reject retry',rejected)

            for item in fr['frozen_inputs']:
                result(method+' repinned frozen input',hashlib.sha256(Path(item['path']).read_bytes()).hexdigest()==item['sha256'])
            p=subprocess.run([sys.executable,'-B',str(preparer),'prepare','--config',str(config),'--stage','investigator'],capture_output=True,text=True)
            result(method+' stable retry request key',p.returncode==0 and json.loads(p.stdout)['args']['clientRequestId']==req['clientRequestId'])
            p=subprocess.run([sys.executable,'-B',str(preparer),'prepare','--config',str(config),'--stage','critic'],capture_output=True,text=True)
            result(method+' premature critic missing exact taskID rejected',p.returncode!=0 and 'missing returned T3 dispatch' in p.stderr)
            cli(['--verify',str(d)])
            original=(h/'reveal.py').read_bytes();(h/'reveal.py').write_bytes(original+b'\n# scratch tamper\n')
            cli(['--verify',str(d)],False);(h/'reveal.py').write_bytes(original)
            manifest=json.loads((d/'materialized-manifest.json').read_text())
            result(method+' public-to-relocated explicit provenance',all('public_sha256' in x and 'relocated_sha256' in x and 'final_materialized_sha256' in x for x in manifest['public_to_relocated_hash_mapping']))
            from importlib.machinery import SourceFileLoader
            extras=SourceFileLoader('extra_checks',str(HERE/'extra-checks.py')).load_module()
            extras.extra(method,d,s,config,c,fr,req,result)
            # Mechanical config schema negative tests; never use semantic case input.
            bad=dict(c);bad['runtime_root']='/';unsafe=s/(method+'-unsafe.json');unsafe.write_text(json.dumps(bad))
            p=subprocess.run([sys.executable,'-B',str(preparer),'prepare','--config',str(unsafe),'--stage','investigator'],capture_output=True,text=True)
            result(method+' unsafe runtime root rejected',p.returncode!=0 and 'dedicated path' in p.stderr)
            bad=dict(c);bad['whole_deadline_utc']='2000-01-01T00:00:00Z';unsafe.write_text(json.dumps(bad))
            p=subprocess.run([sys.executable,'-B',str(preparer),'prepare','--config',str(unsafe),'--stage','investigator'],capture_output=True,text=True)
            result(method+' expired clocks rejected',p.returncode!=0 and 'expired' in p.stderr)
        lineage=json.loads((HERE/'source-lineage.json').read_text())
        for stage in ['critic','reviser']:
            rel='sources/methods/A8/'+stage+'_prompt_delta.txt'
            row=next(x for x in lineage['sources'] if x['relative_path']==rel)
            result('public exact A8 '+stage+' bytes equal original frozen source',hashlib.sha256((HERE/rel).read_bytes()).hexdigest()==row['actual_current_sha256'])
        result('source lineage binds every actual public dependency',all(hashlib.sha256((HERE/x['relative_path']).read_bytes()).hexdigest()==x['sha256'] for x in lineage['sources']))
        result('public sources free of actual machine paths/email/UUID routes',all(not __import__('re').search(r'/'+r'home/|/'+r'mnt/|/'+r'Users/|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}',p.read_text()) for p in (HERE/'sources').rglob('*') if p.is_file()))
        # Portable installation with no original helper/runtime access or inherited configs.
        portable=s/'public-relocated';portable.mkdir()
        for name in ['materialize.py','public-input-dependency-manifest.json']:
            shutil.copy2(HERE/name,portable/name)
        shutil.copytree(HERE/'sources',portable/'sources')
        relocated=s/'portable-new-copy'
        pargs=['--destination',str(relocated),'--authorized-provider-instance','PORTABLE_AUTHORIZED_FIXTURE','--brief',str(brief),'--plan',str(plan),'--run-id','portable-new','--method','A1+A8','--stage-budgets-s','1800,720,1080','--whole-budget-s','3600','--whole-deadline-utc',(dt.datetime.now(dt.timezone.utc)+dt.timedelta(seconds=3599)).isoformat()]
        p=subprocess.run([sys.executable,'-B',str(portable/'materialize.py'),*pargs],capture_output=True,text=True)
        result('portable public closure materializes independently',p.returncode==0)
        p=subprocess.run([sys.executable,'-B',str(portable/'materialize.py'),'--verify',str(relocated)],capture_output=True,text=True)
        result('portable materialized final hash closure verifies',p.returncode==0)
        cfg=json.loads((relocated/'configs/portable-new.json').read_text())
        result('portable composite guard points only to new resulting copies',all(Path(x['path']).is_relative_to(relocated) and hashlib.sha256(Path(x['path']).read_bytes()).hexdigest()==x['sha256'] for x in cfg['composite_guard']['components'].values()))
        # Reject unsupported public methods even when baseline source knew historical variants.
        for method in ['A8','A3','A1-v1','A1+A8-v1']:
            cli(['--destination',str(s/'unsupported-finite'),*pargs[2:],'--method',method],False)
        # Public template closure cannot silently accept an added, removed or tampered source.
        public_extra=portable/'sources/unlisted.txt';public_extra.write_text('synthetic extra')
        pargs[1]=str(s/'inventory-reject')
        p=subprocess.run([sys.executable,'-B',str(portable/'materialize.py'),*pargs],capture_output=True,text=True)
        result('unlisted public dependency rejected before output',p.returncode!=0 and not (s/'inventory-reject').exists());public_extra.unlink()
        victim=portable/'sources/methods/A8/critic_prompt_delta.txt';saved=victim.read_bytes();victim.write_bytes(saved+b'changed')
        p=subprocess.run([sys.executable,'-B',str(portable/'materialize.py'),*pargs],capture_output=True,text=True)
        result('tampered exact delta pin rejected before output',p.returncode!=0 and not (s/'inventory-reject').exists());victim.write_bytes(saved)
        # Fresh allocation and clock validation before materialization.
        for flag,value in [('--whole-budget-s','7200'),('--stage-budgets-s','1800,721,1080'),('--whole-deadline-utc','2000-01-01T00:00:00Z'),('--whole-deadline-utc','2030-01-01T00:00:00Z'),('--whole-deadline-utc','2030-01-01T00:00:00')]:
            wrong=pargs.copy();wrong[wrong.index(flag)+1]=value
            p=subprocess.run([sys.executable,'-B',str(portable/'materialize.py'),*wrong],capture_output=True,text=True)
            result('reject new config '+flag+' '+value,p.returncode!=0 and not (s/'inventory-reject').exists())
        base=['--stage-budgets-s','1800,720,1080','--whole-budget-s','3600','--whole-deadline-utc',(dt.datetime.now(dt.timezone.utc)+dt.timedelta(seconds=3599)).isoformat(),'--authorized-provider-instance','PUBLIC_OFFLINE_FIXTURE','--brief',str(brief),'--plan',str(plan),'--run-id','scratch-neg']
        cli(['--destination','/',*base],False)
        cli(['--destination',str(s/'unsupported'),*base,'--method','A2'],False)
        link=s/'linked';link.symlink_to(s,target_is_directory=True)
        cli(['--destination',str(link/'fresh'),*base],False)
    (HERE/'check-results.json').write_text(json.dumps({'checked_at_utc':dt.datetime.now(dt.timezone.utc).isoformat(),'passed':True,'checks':checks,'mode':'OFFLINE_LOCAL_MECHANICAL_ONLY','provider_calls':0,'candidate_launches':0,'reveal_executions':0,'live_catalog_observed':False,'leaf_native_goals_observed':False,'production_qualified':False,'native_response_provenance_independently_proved':False,'freshness_proved':False,'lifecycle_proved':False,'science_qualified':False,'original_53_mechanical_assertions_preserved':True,'scratch_removed':True},indent=2)+'\n')
    print(json.dumps({'passed':True,'checks':len(checks),'provider_calls':0,'reveal_executions':0}))
if __name__=='__main__':main()
