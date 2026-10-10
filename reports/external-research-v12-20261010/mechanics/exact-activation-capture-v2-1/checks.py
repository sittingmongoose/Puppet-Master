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
    def stage(slot='D-R2-03',arm='treatment',role='investigator',opaque=None):
        p=m.RUNS/slot/arm/'stages'/role; p.mkdir(parents=True)
        a=b'ORIGINAL substantive science placeholder; no scientific input supplied.\n'
        req={'args':{'task':'ORIGINAL task','target':{'provider':'mock'},'config':{'unchanged':True}}}
        req['assignment']={'path':str(p/'assignment.md'),'sha256':m.sha(a),'bytes':len(a)}
        if opaque is not None: req['opaque_inputs']=opaque
        rb=enc(req)
        objective=f"ER12 {role} stage, run {slot}-{arm}: execute {p}/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal. 'quotes' \"double\"\nnewline $HOME `literal`"
        im={'assignment':{'path':str(p/'assignment.md'),'sha256':m.sha(a),'bytes':len(a)}}
        im['request']={'path':str(p/'request.json'),'sha256':m.sha(rb),'bytes':len(rb)}
        if opaque is not None: im['immutable_inputs']=opaque
        ib=enc(im)
        freeze={'native_goal_objective':objective,'deadline_utc':'2099-01-01T00:00:00Z','requested_route':req['args']['target'],'request_sha256':m.sha(rb),'assignment_sha256':m.sha(a),'map':{'path':str(p/'input-map.json'),'sha256':m.sha(ib),'bytes':len(ib)},'science':{'unchanged':['opaque','metadata']}}
        if opaque is not None: freeze['inputs']=opaque
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
(async()=>{await new AsyncFunction('tools','text',body)(tools,()=>{});if(calls!==1)throw Error('native count'); if(fs.readFileSync(stage+'/native-goal-create.json','utf8')!==JSON.stringify(response))throw Error('fields lost'); if(commands.length!==2||!commands[0].includes('/freeze.json')||commands.some(x=>x.includes('input-map.json')||x.includes('/sources/')))throw Error('unexpected input'); fs.unlinkSync(stage+'/native-goal-create.json'); let failed=false; tools.create_goal=async()=>{calls++;return {...response,goal:{...response.goal,objective:'WRONG'}}};try{await new AsyncFunction('tools','text',body)(tools,()=>{});}catch(e){failed=String(e).includes('native objective differs');} if(!failed||calls!==2)throw Error('failure/retry'); console.log(JSON.stringify({mock_native_only:true,full_json_single_argument:true,quotes_newlines_preserved:true,one_call_per_invocation:true,wrong_objective_refused:true,scientific_inputs_unread:true}));})().catch(e=>{console.error(e);process.exit(1)});
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
    # Real metadata categories come only from ROOT_REVIEW, not real case files.
    # Deliberately invalid/nonexistent SHA/path/size values prove overlay is not their validator.
    import copy
    forbidden=set()
    opaque={}
    for name in ('brief','discovery','draft','critique'):
        path=root/('UNOPENED-'+name)
        path.write_text('synthetic sentinel; no scientific content')
        forbidden.add(str(path))
        opaque[name]={'path':str(path),'sha256':'opaque-'+name,'bytes':-7,
                      'nested':{'path':'relative/unresolvable', 'sha256':'opaque', 'extra':['quoted \"', 'line\nnext']}}
    opaque['missing']={'path':str(root/'MISSING'), 'sha256':'deliberately-not-a-hash'}
    opaque['relative']={'path':'../never-resolve', 'sha256':None}
    forbidden.update((str(root/'MISSING'),'relative/unresolvable','../never-resolve'))
    oldopen,oldresolve=Path.open,Path.resolve
    oldread,oldtext,oldstat,oldlink=Path.read_bytes,Path.read_text,Path.stat,Path.is_symlink
    def blocked(path):
        assert str(path) not in forbidden and str(path)!='../never-resolve', 'opaque path inspected: '+str(path)
    def open_guard(path,*a,**kw): blocked(path); return oldopen(path,*a,**kw)
    def resolve_guard(path,*a,**kw): blocked(path); return oldresolve(path,*a,**kw)
    def read_guard(path,*a,**kw): blocked(path); return oldread(path,*a,**kw)
    def text_guard(path,*a,**kw): blocked(path); return oldtext(path,*a,**kw)
    def stat_guard(path,*a,**kw): blocked(path); return oldstat(path,*a,**kw)
    def link_guard(path,*a,**kw): blocked(path); return oldlink(path,*a,**kw)
    for arm in ('control','treatment'):
        for role in ('investigator','critic','reviser'):
            selected={k:copy.deepcopy(opaque[k]) for k in
                      ({'investigator':('brief','missing','relative'),
                        'critic':('brief','discovery','draft'),
                        'reviser':('brief','discovery','draft','critique')}[role])}
            pp,bb,_=stage('D-R2-10',arm,role,selected)
            Path.open,Path.resolve=open_guard,resolve_guard
            Path.read_bytes,Path.read_text,Path.stat,Path.is_symlink=read_guard,text_guard,stat_guard,link_guard
            try:
                oo=m.transform(pp)
                assert m.transform(pp)['idempotent']
            finally:
                Path.open,Path.resolve=oldopen,oldresolve
                Path.read_bytes,Path.read_text,Path.stat,Path.is_symlink=oldread,oldtext,oldstat,oldlink
            for name,key in (('request.json','opaque_inputs'),('freeze.json','inputs'),('input-map.json','immutable_inputs')):
                after=json.loads((pp/name).read_bytes())
                assert after[key]==json.loads(bb[name])[key]==selected
                for record in selected.values():
                    # Same serialized opaque bytes as before, plus exact field equality above.
                    assert json.dumps(record,ensure_ascii=False,indent=2) == json.dumps(after[key][next(k for k,v in selected.items() if v==record)],ensure_ascii=False,indent=2)
            ff=json.loads((pp/'freeze.json').read_bytes())
            assert json.loads((pp/'request.json').read_bytes())['assignment']['sha256']==m.sha((pp/'assignment.md').read_bytes())
            assert json.loads((pp/'input-map.json').read_bytes())['request']['sha256']==m.sha((pp/'request.json').read_bytes())
            assert ff['request_sha256']==m.sha((pp/'request.json').read_bytes())
            assert ff['assignment_sha256']==m.sha((pp/'assignment.md').read_bytes())
            assert ff['map']['sha256']==m.sha((pp/'input-map.json').read_bytes())
            assert json.loads((pp/'input-map.json').read_bytes())['assignment']['sha256']==m.sha((pp/'assignment.md').read_bytes())
            assert json.loads((pp/'request.json').read_bytes())['args']['target']==json.loads(bb['request.json'])['args']['target']
            passed('opaque open/read/resolve/stat/link sentinels; immutable fields; topology; retry: '+arm+'/'+role)
    pp,_,_=stage('D-R2-11'); ff=json.loads((pp/'freeze.json').read_bytes()); ff['requested_route']={'wrong':True}; (pp/'freeze.json').write_bytes(enc(ff)); reject(lambda:m.transform(pp),'route mismatch refused')
    pp,_,_=stage('D-R2-12'); (pp/'sources').mkdir(); (pp/'sources'/'started').write_text('synthetic'); reject(lambda:m.transform(pp),'source work refused')
    pp,_,_=stage('D-R2-13'); m.transform(pp); (pp/'assignment.md').write_text('changed retry'); reject(lambda:m.transform(pp),'changed retry refused')
    pp,_,_=stage('D-R2-14'); im=json.loads((pp/'input-map.json').read_bytes()); im['assignment']['bytes']=0; (pp/'input-map.json').write_bytes(enc(im)); reject(lambda:m.transform(pp),'mechanical carried mismatch refused')
    pp,_,_=stage('D-R2-15'); (pp/'unexpected-link').symlink_to(root/'MISSING'); reject(lambda:m.transform(pp),'symlink stage member refused')
    # Synthetic treatment suffix omission; no real incident/case data opened.
    pp=root/'known-incident'; pp.mkdir(); expected='Synthetic stage, run D-R2-99-treatment'
    (pp/'freeze.json').write_bytes(enc({'native_goal_objective':expected}))
    response={'goal':{'threadId':'mock','objective':'Synthetic stage','status':'active','createdAt':1,'updatedAt':1,'tokensUsed':0,'timeUsedSeconds':0},'remainingTokens':None,'completionBudgetReport':None}
    r=subprocess.run(['python3','-B',str(m.GUARD),'--stage-dir',str(pp),'--json',json.dumps(response)],capture_output=True,text=True)
    assert r.returncode==2 and 'native objective differs' in r.stderr; passed('synthetic treatment suffix omission refused by unchanged guard')

deps=json.loads((HERE/'dependency-sha256.json').read_text())
assert all(hashlib.sha256(Path(p).read_bytes()).hexdigest()==digest for p,digest in deps.items()); passed('all six exact dependencies unchanged')
original_pins=json.loads((HERE/'original-v2-pins.json').read_text())
assert all(hashlib.sha256(Path(p).read_bytes()).hexdigest()==digest for p,digest in original_pins.items()); passed('original v2 complete pins unchanged')
assert (HERE/'activation-snippet-template.js').read_bytes()==(HERE.parent/'exact-activation-capture-v2'/'activation-snippet-template.js').read_bytes(); passed('activation snippet byte-identical to v2')
(HERE/'finite-check-results.json').write_text(json.dumps({'all_passed':True,'synthetic_only':True,'production_qualified':False,'checks':results,'candidate_goals_created':0,'dispatches':0,'live_stages_opened':0,'scientific_inputs_opened':0},indent=2)+'\n')
print(json.dumps({'all_passed':True,'checks':len(results)}))
