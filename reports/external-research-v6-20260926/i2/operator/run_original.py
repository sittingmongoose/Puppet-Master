"""I2 trusted operator binding; one original slot per invocation, no retry.
Uses frozen native driver, D1 watcher pattern, I2 Store and existing helpers.
Actual authority is the user's Go naming commit/freeze, not this operational file.
"""
import hashlib,json,os,shutil,signal,subprocess,sys,time,traceback
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
LAB=ROOT.parent
PREP=LAB/'i2-prep'
PIN='994cc7974acd438fc3b74b06197ee0de9007a252db6c432cc63e17c4424e17e4'
ORDER=('I2-M-control','I2-M-maintained','I2-Z-maintained','I2-Z-control')
sys.path[:0]=[str(PREP/'tools'),str(LAB/'tools/r1b'),str(LAB/'tools')]
import run_r1b, research_store, current_criterion, prep_plan, audit_tools

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,x):
    p=Path(p); tmp=p.with_suffix(p.suffix+'.tmp')
    tmp.write_text(json.dumps(x,indent=2,ensure_ascii=False)+'\n'); tmp.replace(p)
def verify():
    if sha(PREP/'FREEZE.json')!=PIN: raise RuntimeError('freeze mismatch')
    freeze=json.loads((PREP/'FREEZE.json').read_text())
    for p,v in freeze['files'].items():
        if sha(PREP/p)!=v['sha256']: raise RuntimeError('prep drift: '+p)
    for field in ('reused_files_sha256','runtime_pins_sha256'):
        for p,h in freeze[field].items():
            if sha(LAB/p)!=h: raise RuntimeError('dependency drift: '+p)
    if sha(LAB/'case_bundle/MANIFEST.sha256.json')!=freeze['case_manifest']['manifest_sha256']: raise RuntimeError('case manifest drift')

def run(slot):
    verify()
    state_path=ROOT/'phase-state.json'; state=json.loads(state_path.read_text())
    if state['freeze_sha256']!=PIN or state['phase_wall_seconds']!=14400: raise RuntimeError('phase identity')
    if state['closed'] or state['stopped'] or len(state['candidate_dispatched'])>=4: raise RuntimeError('phase stopped/consumed')
    if state['candidate_dispatched']!=state['candidate_terminal']: raise RuntimeError('dangling original; no redispatch')
    if slot!=ORDER[len(state['candidate_dispatched'])]: raise RuntimeError('original order required')
    for previous in state['candidate_terminal']:
        if run_r1b.slot_state(ROOT/'runs'/previous)!='done': raise RuntimeError('previous stopped')
    if time.time()-state['phase_started_epoch']+2100>14400: raise RuntimeError('whole next slot + reserve cannot fit')
    arm=ROOT/'runs'/slot; arm.mkdir(exist_ok=False)
    started=time.time(); deadline=min(started+2100,state['phase_started_epoch']+14400)
    state['candidate_dispatched'].append(slot);state['active_slot']=slot;write(state_path,state)
    run_r1b.write_status(arm,state='claimed',slot=slot)
    app='muse' if slot.startswith('I2-M-') else 'zcode'; carrier=slot.rsplit('-',1)[1]
    ws=arm/'ws'; store=None;proc=None;rc=None;err=None;native={};result={};outcome='harness_failure';detail='host did not complete'
    try:
        (ws/'case').mkdir(parents=True); (ws/'out').mkdir()
        run_r1b.copy_listed_corpus(LAB/'case_bundle',ws/'case');run_r1b.readonly(ws/'case')
        shutil.copyfile(PREP/f'prompts/investigator-{carrier}.txt',ws/'task.txt');(ws/'task.txt').chmod(0o444)
        inputs={'case':run_r1b.manifest(ws/'case'),'task_sha256':sha(ws/'task.txt')};write(arm/'input-manifest.json',inputs)
        if carrier=='maintained':store=research_store.create_store(ws,arm/'store')
        argv=[sys.executable,str(LAB/'tools/r1b/run_goal_r1b.py'),'--app',app,'--workspace',str(ws),'--prompt-file',str(ws/'task.txt'),'--out',str(arm/'native'),'--label',slot,'--max-seconds','1800','--max-responses','160']
        if app=='zcode': argv+=['--zcode-tools','Read','Write','Edit','Grep','Glob']
        write(arm/'dispatch.json',{'argv':argv,'freeze_sha256':PIN,'task_sha256':inputs['task_sha256'],'operator_sha256':sha(__file__),'authorization_source':state['authorization_source'],'slot_started_epoch':started,'outer_deadline_epoch':deadline,'no_retries':True})
        run_r1b.write_status(arm,state='dispatched',slot=slot)
        native_started=time.time();poll_seconds=0.;polls=0
        print(json.dumps({'slot':slot,'state':'dispatched','epoch':native_started}),flush=True)
        with (arm/'driver-output.log').open('w') as log:
            proc=subprocess.Popen(argv,cwd=LAB,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
            while proc.poll() is None:
                if store:
                    tick=time.monotonic();store.poll();poll_seconds+=time.monotonic()-tick;polls+=1
                if time.time()>deadline-20: raise TimeoutError('outer slot deadline; cleanup reserve20 seconds')
                time.sleep(.05)
            rc=proc.wait()
        result.update(native_process_seconds=time.time()-native_started,host_prepare_seconds=native_started-started,store_poll_seconds=poll_seconds,store_poll_calls=polls)
    except BaseException as exc:
        err=f'{type(exc).__name__}: {exc}';(arm/'host-exception.txt').write_text(traceback.format_exc())
    finally:
        try:
            if proc is not None and proc.poll() is None:
                for sig in (signal.SIGTERM,signal.SIGKILL):
                    try: os.killpg(proc.pid,sig)
                    except OSError as exc: err=(err or '')+f' cleanup: {type(exc).__name__}: {exc}'
                    try: proc.wait(timeout=10);break
                    except subprocess.TimeoutExpired: pass
                rc=proc.returncode
                if rc is None:err=(err or '')+' process not reaped'
        except BaseException as exc:
            err=(err or '')+f' cleanup: {type(exc).__name__}: {exc}'
        try:
            if store:
                tick=time.monotonic();summary=store.close();result['store_close_seconds']=time.monotonic()-tick
                result['attempt_counts']=research_store.attempt_counts(store)
                write(arm/'store-summary.json',summary)
        except BaseException as exc:err=(err or '')+f' close: {type(exc).__name__}: {exc}'
    terminal_started=time.time()
    try:
        p=arm/'native/receipt.json';native=json.loads(p.read_text()) if p.exists() else {}
        if not isinstance(native,dict):raise RuntimeError('native receipt nonobject')
        outcome,detail=run_r1b.classify(rc,native)
        if err:outcome,detail='harness_failure',err
        if native:run_r1b.copy_native_logs(app,native,arm/'native')
        raw=arm/'frozen/out';raw.parent.mkdir();shutil.copytree(ws/'out',raw,symlinks=True)
        inventory=prep_plan.check_output_inventory(raw,carrier);write(arm/'output-inventory.json',inventory)
        unchanged=inputs=={'case':run_r1b.manifest(ws/'case'),'task_sha256':sha(ws/'task.txt')}
        criterion=None;lineage=False;complete=False
        current=arm/'frozen/current.md'
        if store:
            run_r1b.readonly(arm/'store')
            criterion=current_criterion.check_archive(arm/'store');write(arm/'current-criterion.json',criterion)
            shutil.copyfile(arm/'store/current.md',current)
            lineage=criterion['passed'] and sha(current)==sha(arm/'store/current.md')
            complete=summary['complete'] and criterion['structurally_complete']
        elif (raw/'draft.md').is_file() and not (raw/'draft.md').is_symlink():
            shutil.copyfile(raw/'draft.md',current);lineage=sha(current)==sha(raw/'draft.md');complete=inventory['complete']
        tool_log=arm/'native'/('muse-session.jsonl' if app=='muse' else 'zcode-model-io.jsonl')
        boundary='unknown_missing_trace'
        if tool_log.is_file():
            audit=audit_tools.audit(app,tool_log,ws);write(arm/'tool-audit.json',audit)
            boundary='requires_manual_review' if any(audit[k] for k in ('web_tool_calls','shell_calls','paths_outside_workspace')) else 'pass_mechanical'
        structural=bool(complete and lineage and unchanged and inventory['complete'])
        # Eligibility additionally waits for the independently audited native boundary.
        result.update(structural_complete=structural,lineage_pass=lineage,inputs_unchanged=unchanged,report_kind='authored_current' if carrier=='control' else 'host_current',current_path=str(current) if current.exists() else None,current_sha256=sha(current) if current.exists() else None,native_boundary=boundary,output_inventory_complete=inventory['complete'],frozen_output_manifest=run_r1b.manifest(raw))
        write(arm/'frozen/manifest.json',run_r1b.manifest(arm/'frozen'))
        run_r1b.readonly(arm/'frozen')
        if not unchanged: outcome,detail='harness_failure','candidate inputs changed'
        if time.time()>deadline:outcome,detail='harness_failure','outer slot host ceiling exceeded'
    except BaseException as exc:
        err=(err or '')+f' terminal: {type(exc).__name__}: {exc}';outcome,detail='harness_failure',err
        (arm/'terminal-exception.txt').write_text(traceback.format_exc())
    finally:
        result.update(slot=slot,app=app,carrier=carrier,native_outcome=outcome,outcome_detail=detail,process_exit=rc,host_error=err,native_responses=native.get('native_responses'),native_stop=native.get('stop_reason'),start_epoch=started,end_epoch=time.time(),active_span_seconds=time.time()-started,host_terminal_seconds=time.time()-terminal_started,semantic_grade='not_performed_by_host')
        write(arm/'arm-receipt.json',result)
        run_r1b.write_status(arm,state='terminal',slot=slot,outcome=outcome,detail=detail,stop_schedule=outcome in run_r1b.STOP)
        state['candidate_terminal'].append(slot);state['active_slot']=None;state['stopped']=outcome in run_r1b.STOP;write(state_path,state)
    print(json.dumps({'slot':slot,'outcome':outcome,'detail':detail,'structural_complete':result.get('structural_complete'),'native_boundary':result.get('native_boundary'),'seconds':result['active_span_seconds']}),flush=True)

if __name__=='__main__':run(sys.argv[1])
