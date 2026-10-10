#!/usr/bin/env python3
"""Finite synthetic-only checks; all temporary files remain under this package."""
import importlib.util,json,hashlib,tempfile,subprocess,datetime,shutil
from pathlib import Path
HERE=Path(__file__).absolute().parent
spec=importlib.util.spec_from_file_location('overlay',HERE/'overlay.py'); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
results=[]
def passed(n): results.append({'check':n,'ok':True})
def reject(fn,name):
    try: fn()
    except (ValueError,KeyError): passed(name); return
    raise AssertionError(name)
def enc(o): return (json.dumps(o,ensure_ascii=False,indent=2)+'\n').encode()
with tempfile.TemporaryDirectory(prefix='.offline-',dir=HERE) as td:
    root=Path(td); m.RUNS=root/'runs'
    def stage(slot='D-R2-03',arm='treatment'):
        p=m.RUNS/slot/arm/'stages'/'investigator'; p.mkdir(parents=True)
        a=b'ORIGINAL substantive science placeholder; no scientific input supplied.\n'
        req={'args':{'task':'ORIGINAL task','target':{'provider':'mock'},'config':{'unchanged':True}}}
        rb=enc(req)
        objective=f"ER12 investigator stage, run {slot}-{arm}: execute {p}/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal. 'quotes' \"double\"\nnewline $HOME `literal`"
        im={'assignment':{'path':str(p/'assignment.md'),'sha256':m.sha(a),'bytes':len(a)}}
        ib=enc(im)
        freeze={'native_goal_objective':objective,'deadline_utc':'2099-01-01T00:00:00Z','requested_route':req['args']['target'],'request_sha256':m.sha(rb),'assignment_sha256':m.sha(a),'map':{'path':str(p/'input-map.json'),'sha256':m.sha(ib),'bytes':len(ib)},'science':{'unchanged':['opaque','metadata']}}
        data={'request.json':rb,'assignment.md':a,'freeze.json':enc(freeze),'input-map.json':ib}
        for n,b in data.items(): (p/n).write_bytes(b)
        (p/m.V1_MARKER).write_text('{}')
        (p/m.GUARD_MARKER).write_bytes(enc({'version':'exact-goal-binding-guard-v1','dispatch_performed':False,'stageDir':str(p),'updated_sha256':{n:m.sha(b) for n,b in data.items()}}))
        (p/'.goal-guard-backup-synthetic').mkdir()
        return p,data,objective
    p,before,objective=stage(); out=m.transform(p)
    assert m.transform(p)['idempotent'] is True
    for n,b in before.items():
        q=Path(out['backupDir'])/n; assert q.read_bytes()==b and q.stat().st_mode&0o222==0
    f=json.loads((p/'freeze.json').read_text()); old=json.loads(before['freeze.json'])
    for k in ('native_goal_objective','deadline_utc','requested_route','science'): assert f[k]==old[k]
    req=json.loads((p/'request.json').read_text()); assert req['args']['config']=={'unchanged':True} and req['args']['task'].startswith('ORIGINAL task')
    assert (p/'assignment.md').read_bytes().startswith(before['assignment.md'])
    passed('additive preservation, readonly backups, hash dependency updates, idempotence')
    node_script=r'''
const fs=require('fs'),cp=require('child_process');
const [template,stage,obj]=process.argv.slice(2);
const body=fs.readFileSync(template,'utf8').replaceAll('__STAGE_DIR_JSON__',JSON.stringify(stage));
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
let calls=0,commands=[];
const response={goal:{threadId:'mock-only',objective:obj,status:'active',tokensUsed:0,timeUsedSeconds:0,createdAt:1,updatedAt:1},remainingTokens:null,completionBudgetReport:null,extra:{quotes:"a'b\"c\nnext",allFields:[1,null,{literal:'$HOME `noexec`'}]}};
const tools={create_goal:async({objective})=>{calls++; if(objective!==obj)throw Error('objective modified'); return response;},exec_command:async(args)=>{commands.push(args.cmd); const r=cp.spawnSync('/bin/bash',['-c',args.cmd],{encoding:'utf8'}); return {exit_code:r.status,output:r.stdout+r.stderr};}};
(async()=>{await new AsyncFunction('tools','text',body)(tools,()=>{});if(calls!==1)throw Error('native count'); if(JSON.stringify(JSON.parse(fs.readFileSync(stage+'/native-goal-create.json','utf8')))!==JSON.stringify(response))throw Error('fields lost'); if(commands.length!==2||!commands[0].includes('/freeze.json')||commands.some(x=>x.includes('input-map.json')||x.includes('/sources/')))throw Error('unexpected input'); fs.unlinkSync(stage+'/native-goal-create.json'); let failed=false; tools.create_goal=async()=>{calls++;return {...response,goal:{...response.goal,objective:'WRONG'}}};try{await new AsyncFunction('tools','text',body)(tools,()=>{});}catch(e){failed=String(e).includes('native objective differs');} if(!failed||calls!==2)throw Error('failure/retry'); console.log(JSON.stringify({mock_native_only:true,full_json_single_argument:true,quotes_newlines_preserved:true,one_call_per_invocation:true,wrong_objective_refused:true,scientific_inputs_unread:true}));})().catch(e=>{console.error(e);process.exit(1)});
'''
    js=root/'mock-check.cjs'; js.write_text(node_script)
    run=subprocess.run(['node',str(js),str(HERE/'activation-snippet-template.js'),str(p),objective],capture_output=True,text=True)
    assert run.returncode==0,run.stderr
    results.append({'check':'direct functions.exec body with mock native tools and actual shell/unchanged checker','ok':True,'details':json.loads(run.stdout)})
    reject(lambda:m.transform(p),'used stage rejected after receipt')
    for slot,arm in [('D-R2-04','control'),('D-R2-05','treatment')]:
        pp,_,_=stage(slot,arm); m.transform(pp); passed('common arm overlay: '+arm)
    pp,_,_=stage('D-R2-06'); (pp/'dispatched.json').write_text('{}'); reject(lambda:m.transform(pp),'dispatched rejected')
    pp,_,_=stage('D-R2-07'); ff=json.loads((pp/'freeze.json').read_text()); ff['deadline_utc']='2000-01-01T00:00:00Z'; (pp/'freeze.json').write_bytes(enc(ff)); reject(lambda:m.transform(pp),'expired rejected without reset')
    pp,_,_=stage('D-R2-08'); (pp/'assignment.md').write_text('mismatch'); reject(lambda:m.transform(pp),'hash mismatch rejected')
    pp,_,_=stage('D-R1-99'); reject(lambda:m.transform(pp),'D1 rejected')
    pp,_,_=stage('C-R2-99'); reject(lambda:m.transform(pp),'C2 rejected')
    pp,_,_=stage('D-R2-09'); scientific= root/'UNOPENED-science'; scientific.write_text('synthetic unread sentinel'); ff=json.loads((pp/'freeze.json').read_text()); ff['input']={'path':str(scientific),'sha256':'0'*64}; (pp/'freeze.json').write_bytes(enc(ff))
    oldread=Path.read_bytes
    def read_guard(path):
        assert path!=scientific,'scientific content was read'
        return oldread(path)
    Path.read_bytes=read_guard
    try: reject(lambda:m.transform(pp),'nonmechanical dependency refused without reading content')
    finally: Path.read_bytes=oldread
    incident=HERE.parent/'D-R1-03-treatment-MISSING_FINAL.json'
    inc=json.loads(incident.read_text()); pp=root/'known-incident'; pp.mkdir(); (pp/'freeze.json').write_bytes(enc({'native_goal_objective':inc['expected_objective']}))
    response={'goal':inc['native_raw_cumulative_fields'][0],'remainingTokens':None,'completionBudgetReport':None}
    r=subprocess.run(['python3','-B',str(m.GUARD),'--stage-dir',str(pp),'--json',json.dumps(response)],capture_output=True,text=True)
    assert r.returncode==2 and 'native objective differs' in r.stderr; passed('known treatment suffix omission refused by unchanged guard')
deps=json.loads((HERE/'dependency-sha256.json').read_text())
assert all(hashlib.sha256(Path(p).read_bytes()).hexdigest()==digest for p,digest in deps.items()); passed('all six exact dependencies unchanged')
(HERE/'finite-check-results.json').write_text(json.dumps({'all_passed':True,'checks':results,'candidate_goals_created':0,'dispatches':0,'live_stages_opened':0,'scientific_inputs_opened':0},indent=2)+'\n')
print(json.dumps({'all_passed':True,'checks':len(results)}))
