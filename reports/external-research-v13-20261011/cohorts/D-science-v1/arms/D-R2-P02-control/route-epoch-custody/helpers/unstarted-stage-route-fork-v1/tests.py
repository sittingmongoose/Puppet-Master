#!/usr/bin/env python3
"""Finite MOCK source/API checks. No real arm preparation or native/provider operations."""
import copy, datetime as dt, importlib.util, json, subprocess, sys, tempfile
from pathlib import Path
import route_fork as rf

def load(p):
    spec=importlib.util.spec_from_file_location('mock_materializer',p)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

checks=[]
def check(name,ok):
    checks.append({'name':name,'passed':bool(ok)})
    if not ok: raise AssertionError(name)

def refused(name,fn):
    try: fn()
    except (ValueError,SystemExit): check(name,True);return
    check(name,False)

def main():
    state=rf.ROOT/'state/route-fork-v1'
    mat=load(rf.ROOT/'helpers/c-successor-materializer-v1/materialize.py')
    with tempfile.TemporaryDirectory(prefix='.mock-route-fork-',dir=state) as td:
        scratch=Path(td);arm=scratch/'mock-arm';t=dt.datetime.now(dt.timezone.utc)
        brief=scratch/'brief.md';plan=scratch/'plan.md'
        brief.write_text('MOCK ONLY full scope\n'+mat.TIME_CONTRACT);plan.write_text('MOCK ONLY plan\n'+mat.TIME_CONTRACT)
        cmd=[sys.executable,'-B',str(rf.ROOT/'helpers/c-successor-materializer-v1/materialize.py'),'--destination',str(arm),'--brief',str(brief),'--plan',str(plan),'--run-id','MOCK-CONTROL','--authorized-provider-instance','AUTHORIZED_PROVIDER_INSTANCE','--method','R0','--stage-budgets-s','1800,720,1080','--whole-budget-s','3600','--t0-utc',t.isoformat(),'--whole-deadline-utc',(t+dt.timedelta(seconds=3599)).isoformat()]
        result=subprocess.run(cmd,capture_output=True,text=True);check('actual generic materializer on inert MOCK inputs',result.returncode==0)
        config=arm/'configs/MOCK-CONTROL.json';cfg=rf.read(config);runtime=Path(cfg['runtime_root'])
        prep=rf.module(arm/'helpers/er12-screen-v1/prepare.py');c=prep.load_config(config);prep.init_run(c)
        for role in ('investigator','critic'):
            p=runtime/'stages'/role;p.mkdir(parents=True);(p/'sources').mkdir()
            rf.exclusive(p/'dispatch.json',{'returned':{'taskId':'MOCK-'+role}})
            rf.exclusive(p/'status.json',{'taskId':'MOCK-'+role,'status':'completed','hasPendingChildRuns':False})
            files=('discovery.md','draft.md','source-map.json','revealed-plan.md') if role=='investigator' else ('critique.md','source-map.json')
            for name in files:(p/name).write_text('MOCK_INERT_'+name)
            if role=='investigator':rf.exclusive(p/'plan-reveal.json',{'discovery_sha256':rf.sha(p/'discovery.md'),'plan_sha256':rf.sha(p/'revealed-plan.md')})
            seal=runtime/'control/terminal-handoffs'/role;seal.mkdir(parents=True)
            rf.exclusive(seal/'manifest.json',{'files':[{'relative_path':x.name,'sha256':rf.sha(x)} for x in p.iterdir() if x.is_file()]})
        stage=runtime/'stages/reviser';fork=scratch/'new-config.json';run=runtime/'control/run.json'
        original=rf.tree(runtime);config_hash=rf.sha(config);run_hash=rf.sha(run)
        amendment=rf.ROOT/'state/account-routing-amendment-v1.json'
        def call():return rf.prepare(config,config_hash,amendment,rf.AMENDMENT_SHA,fork,stage,run_hash,expected_run_id='MOCK-CONTROL')
        refused('wrong root amendment pin',lambda:rf.prepare(config,config_hash,amendment,'0'*64,fork,stage,run_hash,expected_run_id='MOCK-CONTROL'))
        stage.mkdir()
        for name in ('request.json','native-goal-create.json','native-activation-attempt.json','native-completion-attempt.json','counter-reconstructed.json','final.md','input-map.json'):
            p=stage/name;p.write_text('MOCK ONLY');refused('refuse used/early-input/reconstructed member '+name,call);p.unlink()
        (stage/'sources').mkdir();(stage/'sources/early.txt').write_text('MOCK ONLY');refused('early carried source refuses',call);(stage/'sources/early.txt').unlink()
        new=copy.deepcopy(cfg);new['provider']=rf.NEW_ROUTE
        for key,value in [('t0_utc','2099-01-01T00:00:00Z'),('whole_deadline_utc','2099-01-01T01:00:00Z'),('brief_path','/tmp/other'),('stage_budgets_s',{}),('method_id','A1')]:
            wrong=copy.deepcopy(new);wrong[key]=value;refused('strict route-only delta refuses '+key,lambda w=wrong:rf.delta(cfg,w))
        before=rf.tree(stage)
        out=call();req=rf.read(stage/'request.json');freeze=rf.read(stage/'freeze.json');terminal=rf.read(stage/'prospective-terminal-capture-v1.json')
        check('same actual prepare then original clarify/guard then activation/terminal APIs',out['args']==req['args'] and 'native-capture.js' in {p.name for p in stage.iterdir()} and 'native-terminal-capture.js' in {p.name for p in stage.iterdir()})
        check('new stage exact requested private route',req['args']['target']==rf.NEW_ROUTE and freeze['requested_route']==rf.NEW_ROUTE)
        check('strict persisted config route-only delta',rf.read(fork)==new)
        check('original init/config/all predecessor hashes unchanged',rf.sha(config)==config_hash and rf.sha(run)==run_hash and all(rf.sha(Path(p))==h for p,h in original.items()))
        check('original whole deadline and 18 minute cap',freeze['whole_deadline_utc']==cfg['whole_deadline_utc'] and freeze['stage_budget_s']==1080 and freeze['available_stage_seconds_at_prepare']<=1080)
        check('request and config terminal binding pins',freeze['request_sha256']==rf.sha(stage/'request.json') and terminal['config_sha256']==rf.sha(fork) and terminal['binding']['config_path']==str(fork))
        check('runtime checker byte-identical',rf.sha(stage/'native-terminal-check.py')==rf.sha(rf.ROOT/'helpers/prospective-terminal-capture-v1/runtime-check.py'))
        check('native guard byte-identical',rf.sha(arm/'mechanics/exact-goal-binding-guard-v1/assert-active-goal.py')=='4a61deec5eb0ca5eca149f0e1f30c55c3e90b5a6ad0557fc98946d340cae99ed')
        check('no Goal/activation/terminal receipts or attempts generated',not any((stage/n).exists() for n in ('native-goal-create.json','native-goal-active.json','native-goal-terminal.json','native-activation-attempt.json','native-completion-attempt.json')))
        refused('used prospective stage and fork refuse re-preparation',call)
        for p in (rf.HERE/'route_fork.py',stage/'native-terminal-check.py'):compile(p.read_bytes(),str(p),'exec')
        check('focused new Python compiles',True)
    report={'qualification':'finite MOCK source/API only','checks':checks,'passed':sum(x['passed'] for x in checks),'actual_native_calls':0,'actual_candidate_dispatches':0,'actual_arm_preparations':0,'physical_provenance':'UNKNOWN','scratch_removed':True}
    (state/'CHECKS.json').write_bytes(rf.encode(report));print(json.dumps(report))

if __name__=='__main__':main()
