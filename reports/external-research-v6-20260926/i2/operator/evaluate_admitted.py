"""Host binding of frozen I2 admission/staging/composed evaluator dispatch.
No candidate changes, task edits, replacements, or approval-file loading.
"""
import hashlib,json,secrets,shutil,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];LAB=ROOT.parent;PREP=LAB/'i2-prep'
sys.path[:0]=[str(PREP/'tools'),str(LAB/'offline-repair-v1/tools'),str(LAB/'tools/r1b'),str(LAB/'tools')]
import prep_plan,stage_i1,run_r1b,evaluator_dispatch,audit_tools
from evaluator_launch import Assignment,LiveAuthorization
from run_original import verify,write,PIN,ORDER
TASK_SHA='98179f83255e85be231fe1c262077eca2380d7580681934700342364a6232643'
EV=Path('/mnt/Cursor/PuppetMaster-Evidence/tests/research-shapes-20260920/phase1-20260921/evaluation')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def phase_ok():
    p=json.loads((ROOT/'phase-state.json').read_text())
    if p['candidate_dispatched']!=list(ORDER) or p['candidate_terminal']!=list(ORDER) or p['stopped'] or p['closed']:
        raise RuntimeError('all four original candidates must be terminal, phase open and not stopped')
    if p['freeze_sha256']!=PIN or time.time()-p['phase_started_epoch']+3000>14400:raise RuntimeError('phase pin/full evaluator plus reserve')
    return p

def evidence(slot):
    arm=ROOT/'runs'/slot;r=json.loads((arm/'arm-receipt.json').read_text())
    app=r['app'];log=arm/'native'/('muse-session.jsonl' if app=='muse' else 'zcode-model-io.jsonl');ws=(arm/'ws').resolve()
    boundary=False;outside=[]
    if log.is_file():
        calls,_=(audit_tools.muse_calls if app=='muse' else audit_tools.zcode_calls)(log)
        outside=[{'tool':n,'path':p} for n,a in calls for p in audit_tools.paths_in(a) if not (ws/p).resolve().is_relative_to(ws)]
        boundary=r.get('native_boundary')=='pass_mechanical' and not outside
    write(arm/'boundary-check.json',{'boundary_pass':boundary,'resolved_outside_paths':outside,'basis':'existing tool audit plus relative/absolute path resolution; prompt/native restriction, not OS isolation','log_sha256':sha(log) if log.is_file() else None})
    return {k:r.get(k) for k in ('slot','native_outcome','lineage_pass','report_kind','current_path','current_sha256')}|{'structural_complete':r.get('structural_complete') is True and boundary}

def stage_admitted():
    verify();phase_ok()
    path=ROOT/'admitted-schedule.json'
    if path.exists():raise RuntimeError('admitted schedule already frozen; never restage')
    decisions={};blind={};assignments=[];started=time.time()
    all_evidence={s:evidence(s) for s in ORDER}
    for aid,slots in prep_plan.PAIRS.items():
        metadata={'assignment_id':aid,'arms':[all_evidence[s] for s in slots]}
        admitted=prep_plan.check_pair_eligibility(metadata,aid)
        decisions[aid]={'eligible':admitted,'original_pair_metadata':metadata}
        if not admitted:continue
        ws=ROOT/'eval'/aid;ws.mkdir(parents=True,exist_ok=False)
        order=list(slots)
        if secrets.randbelow(2):order.reverse()
        deferred=[]
        for slot in order:
            arm=ROOT/'runs'/slot;mapping=[]
            for src in sorted((arm/'frozen/out').rglob('*')):
                if src.is_file():mapping.append((src,Path('raw_output')/src.relative_to(arm/'frozen/out')))
            if (arm/'store').is_dir():
                for src in sorted((arm/'store').rglob('*')):
                    if src.is_file():mapping.append((src,Path('record_archive')/src.relative_to(arm/'store')))
                for name in ('store-summary.json','current-criterion.json'):
                    mapping.append((arm/name,Path('structural')/name))
            deferred.append(mapping)
        stage_i1.stage(ws,Path(all_evidence[order[0]]['current_path']),Path(all_evidence[order[1]]['current_path']),*deferred)
        (ws/'first_view/case').mkdir();run_r1b.copy_listed_corpus(LAB/'case_bundle',ws/'first_view/case')
        frozen=json.loads((PREP/'FREEZE.json').read_text());keypath=EV/'reference/fixed-reference.json'
        if sha(keypath)!=frozen['existing_evaluator_key_sha256'] or sha(EV/'SCORING.md')!=frozen['existing_scoring_sha256']:raise RuntimeError('evaluator identity drift')
        reference=json.loads(keypath.read_text())
        key={k:reference[k] for k in ('schema','exhaustive','historical_reference_requires_pinned_source_revalidation','ome')}
        (ws/'first_view/key').mkdir()
        (ws/'first_view/key/ome-reference.json').write_text(json.dumps(key,indent=1,ensure_ascii=False)+'\n')
        shutil.copyfile(EV/'SCORING.md',ws/'first_view/key/SCORING.md')
        (ws/'out').mkdir();run_r1b.readonly(ws/'first_view');run_r1b.readonly(ws/'deferred')
        staged=[]
        for i,slot in enumerate(order,1):
            entry=dict(all_evidence[slot]);entry['current_path']=str(ws/f'first_view/results/X{i}/current.md');staged.append(entry)
            blind[f'{aid}/X{i}']=slot
        decisions[aid]['staged_pair_metadata']={'assignment_id':aid,'arms':staged}
        decisions[aid]['workspace']=str(ws)
        write(ROOT/'eval'/f'{aid}-input-manifest.json',run_r1b.manifest(ws))
        assignments.append({'assignment_id':aid,'workspace':str(ws),'seconds':2700,'responses':160})
    record={'freeze_sha256':PIN,'task_sha256':TASK_SHA,'decisions':decisions,'assignments':assignments,'staging_started_epoch':started,'staging_seconds':time.time()-started,'authority':'User chat explicitly conditionally authorized up to two pairs if BOTH original arms pass; host admission now binds that finite schedule. This record is accounting, not an approval loader.'}
    write(path,record);path.chmod(0o444)
    write(ROOT/'blind-map.PRIVATE.json',blind)
    print(json.dumps({'eligible':[a['assignment_id'] for a in assignments],'skipped':[k for k,v in decisions.items() if not v['eligible']]}),flush=True)

def dispatch(aid):
    verify();phase_ok()
    record=json.loads((ROOT/'admitted-schedule.json').read_text())
    if record['freeze_sha256']!=PIN or record['task_sha256']!=TASK_SHA:raise RuntimeError('admitted pins')
    assignments=tuple(Assignment(**a) for a in record['assignments'])
    # Authority is supplied by trusted operator from the user's explicit conditional Go.
    authorization=LiveAuthorization(user_approved=True,task_sha256=TASK_SHA,assignments=assignments)
    result=evaluator_dispatch.dispatch(task_path=PREP/'prompts/evaluator-task.txt',expected_task_sha256=TASK_SHA,permitted_assignments=assignments,assignment_id=aid,authorization=authorization,runs=ROOT/'runs',phase_state_path=ROOT/'phase-state.json',expected_freeze_sha256=PIN,pair_metadata=record['decisions'][aid]['staged_pair_metadata'])
    write(ROOT/'runs'/aid/'dispatch-result.json',result)
    print(json.dumps({'assignment_id':aid,'outcome':result['dispatcher_result']['outcome']}),flush=True)

if __name__=='__main__':
    if sys.argv[1]=='stage':stage_admitted()
    else:dispatch(sys.argv[1])
