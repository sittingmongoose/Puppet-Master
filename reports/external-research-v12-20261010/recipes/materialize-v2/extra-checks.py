"""Isolated synthetic preparation and guard checks; never evidence of real Goals."""
import copy, datetime as dt, hashlib, importlib.util, json, subprocess, sys
from pathlib import Path

def load(path,name):
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

def extra(method,d,s,config,c,fr,req,result):
    h=d/'helpers/er12-screen-v1';comp=d/'helpers/er12-composite-A1-A8-v1'
    overlay=load(comp/'prepare.py','synthetic_composite_'+method);b=overlay.b
    base=load(h/'prepare.py','synthetic_base_'+method)
    pins=json.loads((comp/'COMPONENT_PINS.json').read_text())
    result(method+' all actual composite pins/paths/bytes',pins==overlay.COMPONENTS and all(Path(x['path']).is_relative_to(d) and hashlib.sha256(Path(x['path']).read_bytes()).hexdigest()==x['sha256'] and Path(x['path']).stat().st_size==x['bytes'] for x in pins.values()))
    result(method+' private guard matches selected components',method!='A1+A8' or c['composite_guard']==overlay.GUARD)
    manifest=json.loads((d/'materialized-manifest.json').read_text())
    result(method+' final relocation provenance is actual bytes',all(hashlib.sha256((d/x['relocated_relative_path']).read_bytes()).hexdigest()==x['final_materialized_sha256'] for x in manifest['public_to_relocated_hash_mapping']))
    result(method+' no historical replay/science qualification',manifest['historical_replay'] is False and manifest['production_qualified'] is False)
    # Prompt calls are pure synthetic fixtures. They contain no actual predecessor science.
    cfg=base.load_config(config);im={'allowed_write_root':str(s/'synthetic-write'),'brief':str(s/'synthetic-brief')}
    for stage in ['investigator','critic','reviser']:
        baseline=base.make_prompt(cfg,stage,im,'SYNTHETIC-DEADLINE','SYNTHETIC-WHOLE')
        combined=b.make_prompt(cfg,stage,im,'SYNTHETIC-DEADLINE','SYNTHETIC-WHOLE')
        delta=(d/'methods/A8'/(stage+'_prompt_delta.txt')).read_bytes().decode() if stage!='investigator' else ''
        result(method+' '+stage+' complete prompt plus only exact delta',combined==baseline if stage=='investigator' else combined==baseline+'\n'+delta)
        result(method+' '+stage+' full original obligations',all(x in baseline for x in ['full original brief','exact released plan','proposed validations distinct','source IDs without silent rebinding']))
    result(method+' investigator no A8 delta',all((d/'methods/A8'/(n+'_prompt_delta.txt')).read_text() not in b.make_prompt(cfg,'investigator',im,'X','Y') for n in ['critic','reviser']))
    # Exercise every unused stage with in-memory dependency stubs, no fake dispatch/reveal/native receipt files.
    prefix=(h/'bootstrap.js').read_text().split('// Paste into T3 functions code mode.')[0]
    for stage in ['investigator','critic','reviser']:
        m=b if method=='A1+A8' else base
        fresh=copy.deepcopy(cfg);r=s/('isolated-'+method.replace('+','-')+'-'+stage)
        fresh.update(_root=r,runtime_root=str(r),run_id='synthetic-'+stage)
        if method=='A1+A8':fresh.update(composite_guard=overlay.GUARD,dispatch_owner='root',_method='A1',_deltas={})
        m.get_deps=lambda c,stage:[];m.verify_terminal_status=lambda root,deps:None
        generic=s/'generic-predecessor.txt';generic.write_text('SYNTHETIC generic carried bytes; no science.\n')
        m.verify_predecessors=lambda root,stage:[generic]
        for n in ['investigator','critic']:(r/'stages'/n/'sources').mkdir(parents=True,exist_ok=True)
        actual_now=dt.datetime.now(dt.timezone.utc)
        m.now=lambda:actual_now-dt.timedelta(seconds=600)
        m.init_run(fresh)
        m.now=lambda:actual_now
        prepared=m.prepare(fresh,stage)
        sd=Path(prepared['stageDir']);before=json.loads((sd/'freeze.json').read_text())
        expected=({'investigator':1800,'critic':2520,'reviser':3600}[stage]-600) if method!='R0' else {'investigator':1800,'critic':720,'reviser':1080}[stage]
        result(method+' '+stage+' unchanged timing contract',abs((dt.datetime.fromisoformat(before['stage_deadline_utc'].replace('Z','+00:00'))-actual_now).total_seconds()-expected)<.01)
        specfile=s/('spec-'+method.replace('+','-')+'-'+stage+'.json');specfile.write_text(json.dumps(prepared))
        runner=s/'transform-fixture.cjs';runner.write_text("const fs=require('fs'),cp=require('child_process');const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;const tools={exec_command:async a=>{const p=cp.spawnSync('bash',['-c',a.cmd],{encoding:'utf8'});return {exit_code:p.status,output:p.stdout+p.stderr}}};(async()=>{try{await new AsyncFunction('tools','spec',fs.readFileSync(process.argv[2],'utf8'))(tools,JSON.parse(fs.readFileSync(process.argv[3],'utf8')));process.stdout.write('synthetic-transformed')}catch(e){process.stderr.write(String(e));process.exitCode=2}})();")
        program=s/'transform-sequence.js';program.write_text(prefix+'\nawait exactSpec(await clarifySpec(await standardSpec(spec)));')
        node=subprocess.run(['node',str(runner),str(program),str(specfile)],capture_output=True,text=True)
        result(method+' '+stage+' unused std/clarify/exact preparation',node.returncode==0 and node.stdout=='synthetic-transformed')
        after=json.loads((sd/'freeze.json').read_text());request=json.loads((sd/'request.json').read_text())
        result(method+' '+stage+' immutable objective/deadline/key',after['native_goal_objective']==before['native_goal_objective'] and after['stage_deadline_utc']==before['stage_deadline_utc'] and request['clientRequestId']==prepared['args']['clientRequestId'])
        result(method+' '+stage+' common Standard request and pre-input guard',request['args']['target']['options']['serviceTier']=='default' and 'Before ANY case/source reading or inference' in request['args']['task'])
        result(method+' '+stage+' no actual lifecycle/reveal artifacts',not any((sd/n).exists() for n in ['dispatch.json','native-goal-active.json','native-goal-terminal.json','plan-reveal.json','revealed-plan.md']))
        current=m.prepare(fresh,stage)
        result(method+' '+stage+' saved retry preserves exact guarded request',current['retry'] and current['args']==request['args'])
        # Guard retry is idempotent; clarification cannot be replayed over exact-guard bytes.
        guard=load(d/'mechanics/exact-goal-binding-guard-v1/overlay.py','synthetic_guard_'+stage)
        result(method+' '+stage+' exact overlay retry idempotent',guard.transform(sd)['idempotent'] is True)
        used=sd/'synthetic-used.txt';used.write_text('mechanical used-stage sentinel')
        rejected=False
        try:guard.transform(sd)
        except ValueError:rejected=True
        result(method+' '+stage+' used-stage overlay rejected',rejected);used.unlink()
        m.now=lambda:actual_now+dt.timedelta(seconds=4000)
        rejected=False
        try:m.prepare(fresh,stage)
        except SystemExit:rejected=True
        result(method+' '+stage+' expired retry cannot reset clocks',rejected)
    # Synthetic envelopes are kept in memory only. Passing shape is not native provenance.
    guard=load(d/'mechanics/exact-goal-binding-guard-v1/assert-active-goal.py','synthetic_exact_assert')
    stage=Path(c['runtime_root'])/'stages/investigator'
    envelope={'goal':{'threadId':'SYNTHETIC-NOT-A-RECEIPT','objective':fr['native_goal_objective'],'status':'active','createdAt':1,'updatedAt':1,'tokensUsed':0,'timeUsedSeconds':0},'remainingTokens':None,'completionBudgetReport':None}
    result(method+' synthetic exact guard explicitly lacks provenance',guard.check(stage,json.dumps(envelope))['provenance_independently_proved'] is False)
    for kind in ['objective','status','partial','duplicate']:
        e=copy.deepcopy(envelope)
        if kind=='objective':e['goal']['objective']+=' changed'
        if kind=='status':e['goal']['status']='complete'
        if kind=='partial':del e['completionBudgetReport']
        text=json.dumps(e) if kind!='duplicate' else '{"goal":{},"goal":{}}'
        rejected=False
        try:guard.check(stage,text)
        except ValueError:rejected=True
        result(method+' exact guard rejects '+kind,rejected)
