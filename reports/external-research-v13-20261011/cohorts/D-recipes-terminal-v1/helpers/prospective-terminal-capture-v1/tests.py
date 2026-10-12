#!/usr/bin/env python3
"""Finite portable actual generator + terminal MOCK tests; no historical suites."""
import datetime as dt
import hashlib
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE=Path(__file__).absolute().parent
ROOT=HERE.parents[1]
STATE=ROOT/'state/terminal-capture-v1'
CAP=HERE.parent/'prospective-capture-v1'
C=HERE.parent/'c-successor-materializer-v1'
checks=[]

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p,n):
    spec=importlib.util.spec_from_file_location(n,p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
def run(args):return subprocess.run(args,capture_output=True,text=True)
def check(n,v):
    checks.append({'name':n,'passed':bool(v)})
    if not v:raise AssertionError(n)
def bundle(source,target,manifest,wrappers):
    target.mkdir(parents=True)
    for row in json.loads((source/manifest).read_bytes())['files']:
        p=source/row['relative_path'];assert sha(p)==row['sha256'];out=target/row['relative_path'];out.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,out)
    for n in (manifest,*wrappers):shutil.copy2(source/n,target/n)

TERMINAL=r'''const fs=require('fs'),cp=require('child_process');
globalThis.TextEncoder=undefined;globalThis.btoa=undefined;
const A=Object.getPrototypeOf(async function(){}).constructor;
const stage=process.argv[3],mode=process.argv[4],source=fs.readFileSync(process.argv[2],'utf8');
const birth=JSON.parse(fs.readFileSync(stage+'/native-goal-create.json','utf8'));
const response=JSON.parse(JSON.stringify(birth));response.goal.status=mode==='wrongstatus'?'active':'complete';response.goal.updatedAt='MOCK_COMPLETION';response.goal.tokensUsed=19;response.completionBudgetReport={future:{nested:[null,false,0,'Ω🙂',"'",'\n',"$(`literal`)" ]}};response.unknownTerminal={deep:{rows:[{some:true},null,'雪']}};
if(mode==='wrongbirth')response.goal.createdAt='WRONG_BIRTH';if(mode==='partial')delete response.remainingTokens;
const actualReturn=mode==='unsupported'?'MOCK_UNSUPPORTED_ACTUAL_RETURN':mode==='nullreturn'?null:response;
let gets=0,updates=0,creates=0,phase='initial';const texts=[],errors=[];
const tools={create_goal:async()=>{creates++;throw Error('new Goal forbidden')},get_goal:async()=>{gets++;if(phase==='updated')throw Error('POST_UPDATE GETTER FORBIDDEN');const live=JSON.parse(JSON.stringify(birth));if(mode==='preflightbirth')live.goal.threadId='WRONG_THREAD';if(mode==='preflightcomplete')live.goal.status='complete';if(mode==='preflightobjective')live.goal.objective+=' WRONG';return live},update_goal:async args=>{updates++;if(args.status!=='complete')throw Error('bad update');if(!fs.existsSync(stage+'/native-completion-attempt.json'))throw Error('MISSING PREUPDATE CLAIM');phase='updated';if(mode==='unknown')throw Error('MOCK unknown update outcome');if(mode==='outputsdrift')fs.appendFileSync(stage+'/source-map.json',' CHANGED');return actualReturn},exec_command:async a=>{if(a.cmd.includes("--action 'save'")){if(mode==='savefail')return {exit_code:1,output:'MOCK failed save'};if(mode==='latesave')cp.execFileSync('python3',['-c',"import json,datetime; from pathlib import Path; p=Path(__import__('sys').argv[1]); f=json.loads(p.read_text()); f['stage_deadline_utc']='2000-01-01T00:00:00Z'; p.write_text(json.dumps(f))",stage+'/freeze.json']);}const p=cp.spawnSync('bash',['-c',a.cmd],{encoding:'utf8'});return {exit_code:p.status,output:p.stdout+p.stderr}}};
async function invoke(){try{await new A('tools','text',source)(tools,x=>texts.push(x));return true}catch(e){errors.push(String(e));return false}}
(async()=>{const first=await invoke();const firstCounts={gets,updates,creates};const second=await invoke();const read=n=>fs.existsSync(stage+'/'+n)?fs.readFileSync(stage+'/'+n,'utf8'):null;
process.stdout.write(JSON.stringify({first,second,gets,updates,creates,firstCounts,texts,errors,expected:JSON.stringify(actualReturn),terminal:read('native-goal-terminal.json'),failure:read('native-terminal-capture-failed.json'),checked:read('native-terminal-capture-checked.json'),attempt:read('native-completion-attempt.json')}))})();'''

def main():
    check('accepted C source seal exact',sha(C/'bundle-manifest.json')=='126125fbb0999c029b40eef46e56e0c5f9c0193c1a3658e6df7a148f8c6c5435')
    check('accepted activation seal exact',sha(CAP/'MANIFEST.json')=='24ff3ed714c7108a49a2614d0afbda003fdac0bed50044a9952c3f77860d29ba')
    with tempfile.TemporaryDirectory(prefix='.offline-smoke-',dir=STATE) as td:
        scratch=Path(td);portable=scratch/'portable/helpers';pc=portable/'c-successor-materializer-v1';pa=portable/'prospective-capture-v1';pt=portable/'prospective-terminal-capture-v1'
        bundle(C,pc,'bundle-manifest.json',('READY.json','SHA256SUMS'));bundle(CAP,pa,'MANIFEST.json',('READY.json','SHA256SUMS'))
        pt.mkdir();
        for n in ('install.py','runtime-check.py','terminal-template.js','captureSpec-shim.js'):shutil.copy2(HERE/n,pt/n)
        installer=load(pt/'install.py','portable_terminal_install');capture=load(pa/'install.py','portable_activation');mocks=load(pa/'tests.py','mock_constants_only');materializer=load(pc/'materialize.py','portable_materializer')
        for p in pt.glob('*.py'):compile(p.read_bytes(),str(p),'exec')
        check('portable actual new Python compiles',True)
        boot=scratch/'boot.cjs';boot.write_text(mocks.BOOT);sequence=scratch/'sequence.cjs';sequence.write_text(mocks.BOOT.replace("throw Error('unexpected bootstrap completion')","process.stdout.write('MOCK sequence complete')"));activation=scratch/'activation.cjs';activation.write_text(mocks.NATIVE);terminal=scratch/'terminal.cjs';terminal.write_text(TERMINAL)
        brief=scratch/'brief.md';plan=scratch/'plan.md';brief.write_text('SYNTHETIC_ONLY\n'+materializer.TIME_CONTRACT);plan.write_text('SYNTHETIC_NOT_RELEASED\n'+materializer.TIME_CONTRACT)
        profiles={'R0':{'investigator':1800,'critic':720,'reviser':1080},'B02':{'investigator':1800,'critic':1800},'B06':{'investigator':1800,'critic-breadth':360,'critic-truth':360,'reviser':1080}}
        shim=(pt/'captureSpec-shim.js').read_text().replace('__HELPER_DIR_JSON__',json.dumps(str(pt)));marker='// Paste into T3 functions code mode.'
        def materialize(label,method):
            d=scratch/label;t0=dt.datetime.now(dt.timezone.utc);a=[sys.executable,'-B',str(pc/'materialize.py'),'--destination',str(d),'--brief',str(brief),'--plan',str(plan),'--run-id',label,'--authorized-provider-instance','MOCK_AUTHORIZED_ROUTE','--method',method,'--stage-budgets-s',','.join(map(str,profiles[method].values())),'--whole-budget-s','3600','--t0-utc',t0.isoformat(),'--whole-deadline-utc',(t0+dt.timedelta(seconds=3599)).isoformat()]
            if method!='R0':a+=['--method-directory',str(pc/'methods'/('C-S1-v2' if method=='B02' else 'C-S2-v2'))]
            r=run(a);assert r.returncode==0,r.stderr
            cfgpath=next((d/'configs').glob('*.json'));cfg=json.loads(cfgpath.read_bytes());src=(d/'helpers/er12-screen-v1/bootstrap.js').read_text();assert src.count(marker)==1
            bp=scratch/'root-bootstrap.js';bp.write_text(src.replace(marker,shim+'\n'+marker));r=run(['node',str(boot),str(bp)]);assert r.returncode==0,r.stderr
            m=load(d/'helpers/er12-screen-v1/prepare.py','preparer_'+label);c=m.load_config(cfgpath);m.get_deps=lambda c,s:[];m.verify_terminal_status=lambda root,deps:None
            pred=scratch/'predecessor.txt';pred.write_text('SYNTHETIC_PREDECESSOR');m.verify_predecessors=lambda root,stage:[pred]
            return d,cfgpath,cfg,m,c,src
        def prepare_role(data,role):
            d,cp,cfg,m,c,src=data;spec=m.prepare(c,role);sd=Path(spec['stageDir'])
            if role!='investigator':
                code=scratch/'role.js';code.write_text(src.split(marker)[0]+'\n'+shim+'\nawait captureSpec(await exactSpec(await clarifySpec(await standardSpec('+json.dumps(spec)+'))));');r=run(['node',str(sequence),str(code)]);assert r.returncode==0,r.stderr
            return sd
        def activate_and_outputs(sd,cfg):
            out=json.loads((sd/'prospective-capture-v1.json').read_bytes());lp=scratch/'activation-loader.js';lp.write_text(capture.loader(sd/'native-capture.js',out['program_sha256']));r=run(['node',str(activation),str(lp),str(sd),'success']);x=json.loads(r.stdout);assert x['first'] and x['creates']==1,r.stderr
            for n in cfg['output_selection'][sd.name]:(sd/n).write_text('SYNTHETIC_OUTPUT '+n)
            if sd.name=='investigator':
                (sd/'discovery.md').write_text('SYNTHETIC_DISCOVERY '*40);(sd/'plan-reveal.json').write_text(json.dumps({'discovery_sha256':sha(sd/'discovery.md'),'plan_sha256':sha(sd/'revealed-plan.md')}))
        def finish(sd,mode='success',wronghash=False):
            out=json.loads((sd/installer.MARKER).read_bytes());lp=scratch/'terminal-loader.js';lp.write_text(capture.loader(sd/installer.PROGRAM,'0'*64 if wronghash else out['program_sha256']));r=run(['node',str(terminal),str(lp),str(sd),mode]);assert r.returncode==0,r.stderr;return json.loads(r.stdout)
        for method in profiles:
            data=materialize('shape-'+method,method);d,cp,cfg,m,c,src=data;config_before=cp.read_bytes()
            for role in profiles[method]:
                sd=prepare_role(data,role);f=json.loads((sd/'freeze.json').read_bytes());assignment=(sd/'assignment.md').read_text()
                check(method+' '+role+' original clock/objective/scope/card/route and only terminal suffix',f['stage_budget_s']==profiles[method][role] and 'PROSPECTIVE TERMINAL CAPTURE v1' in assignment and cp.read_bytes()==config_before)
                check(method+' '+role+' unstarted idempotent API',installer.transform(sd)['idempotent'])
                check(method+' '+role+' parent guard unchanged',sha(d/'mechanics/exact-goal-binding-guard-v1/assert-active-goal.py')==capture.GUARD_SHA)
                for p in d.rglob('*.py'):compile(p.read_bytes(),str(p),'exec')
                check(method+' '+role+' actual generated Python compiles',True)
                activate_and_outputs(sd,cfg);x=finish(sd)
                check(method+' '+role+' portable raw entire direct completion/no repeat/no new Goal',x['first'] and not x['second'] and x['updates']==1 and x['gets']==1 and x['creates']==0 and x['firstCounts']=={'gets':1,'updates':1,'creates':0} and x['terminal']==x['expected']==x['texts'][0] and x['checked'] is not None)
                check(method+' '+role+' O_EXCL attempt before update and output snapshot',x['attempt'] is not None and (sd/'native-completion-output-snapshot.json').exists())
            check(method+' original config/T0/budgets/cards untouched',cp.read_bytes()==config_before)
        # Fresh synthetics exercise unknown/error paths without any original repair.
        for mode in ('unknown','savefail','wrongbirth','wrongstatus','partial','unsupported','nullreturn','preflightbirth','preflightcomplete','preflightobjective','outputsdrift','latesave','missingoutput','expired','existing','wronghash'):
            data=materialize('negative-'+mode,'R0');sd=prepare_role(data,'investigator');activate_and_outputs(sd,data[2])
            if mode=='missingoutput':(sd/'draft.md').unlink()
            if mode=='expired':
                f=json.loads((sd/'freeze.json').read_bytes());f['stage_deadline_utc']='2000-01-01T00:00:00Z';(sd/'freeze.json').write_text(json.dumps(f))
            if mode=='existing':(sd/'native-goal-terminal.json').write_text('MOCK existing original receipt')
            x=finish(sd,mode,mode=='wronghash');no_update=mode in ('preflightbirth','preflightcomplete','preflightobjective','missingoutput','expired','existing','wronghash')
            check(mode+' stop exact native counters/no fallback or repeat',not x['first'] and not x['second'] and x['updates']==(0 if no_update else 1) and x['creates']==0 and x['gets']==(0 if mode in ('missingoutput','expired','existing','wronghash') else 1))
            if mode!='wronghash':check(mode+' explicit failed capture retained',x['failure'] is not None)
            if mode in ('wrongbirth','wrongstatus','partial','unsupported','nullreturn','outputsdrift','latesave'):check(mode+' actual full return saved unchanged even guard/output/clock failure',x['terminal']==x['expected']==x['texts'][0])
            if mode in ('unknown','savefail'):check(mode+' attempt persists/no invented getter receipt',x['attempt'] is not None and x['terminal'] is None)
            if mode=='existing':check('existing terminal bytes never overwritten',x['terminal']=='MOCK existing original receipt')
            try:installer.transform(sd);check(mode+' started installer refusal',False)
            except ValueError:check(mode+' started installer refusal',True)
    check('source parents still exact',sha(C/'bundle-manifest.json')=='126125fbb0999c029b40eef46e56e0c5f9c0193c1a3658e6df7a148f8c6c5435' and sha(CAP/'MANIFEST.json')=='24ff3ed714c7108a49a2614d0afbda003fdac0bed50044a9952c3f77860d29ba')
    report={'schema':'er13.terminal_capture_focused_mock.v1','checks':checks,'passed':len(checks),'failed':0,'actual_native_calls':0,'actual_candidate_dispatches':0,'real_case_science_rubric_reads':0,'portable_finite_copy':True,'old_suites_rerun':False,'scratch_removed':True}
    (STATE/'CHECKS.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='checks'}))

if __name__=='__main__':
    try:main()
    except Exception as e:
        (STATE/'CHECKS.failed.json').write_text(json.dumps({'checks':checks,'error':repr(e),'actual_native_calls':0},indent=2)+'\n');raise
