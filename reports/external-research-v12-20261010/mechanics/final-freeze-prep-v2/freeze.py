#!/usr/bin/env python3
"""Offline, fail-closed mechanical freeze. Never grades or reads scientific bodies as text."""
import argparse, collections, datetime, hashlib, itertools, json, os, re, stat, time
from pathlib import Path
BASE = Path(__file__).absolute().parent
DEADLINE = time.monotonic() + 480
TERMINAL = {'completed', 'complete', 'failed', 'cancelled', 'canceled'}
MISSING = ('D-R1-03', 'treatment')
FIELDS = {'armId','disposition','final_task_id','final_path','sha256','observed_at','terminal_task_status_pointer','root_science_freeze_pointer'}
STAGES = ('investigator','critic','reviser','critic-finalizer','role')
SCIENCE = {'verification.md','final-section.md','discovery.md','draft.md','revealed-plan.md','final.md','source-map.json','critique.md','critique-dispositions.json','critique-index.json','checks.json'}

def need(test, message):
    if time.monotonic() >= DEADLINE: raise ValueError("eight-minute mechanical runtime limit exceeded")
    if not test: raise ValueError(message)

def safe(p, root=None):
    p = Path(os.path.abspath(p))
    if root is not None: need(p.is_relative_to(root), 'path escapes permitted input root: '+str(p))
    for q in [p, *p.parents]: need(not q.is_symlink(), 'symlink refused: '+str(q))
    return p

def quiet(t):
    return isinstance(t,dict) and t.get('status') in TERMINAL and t.get('hasPendingChildRuns') is False and t.get('latestTerminalStatus',t.get('status')) in TERMINAL and t.get('workState') not in {'running','queued','pending','waiting','active'}

def role(slot, arm):
    return 'role' if slot.startswith('B-') else 'investigator' if slot.startswith('A2-') and arm=='treatment' else 'critic-finalizer' if slot.startswith('A7-') and arm=='treatment' else 'reviser'

def designated(slot, arm, tasks):
    ts=[t for t in tasks if (t.get('slot'),t.get('arm'))==(slot,arm)]
    if (slot,arm)==MISSING:
        need(len(ts)==1 and ts[0].get('stage')=='investigator','missing guard: later/replacement candidate')
        return ts[0]
    finals=[t for t in ts if t.get('stage')==role(slot,arm)]
    need(len(finals)==1,'ambiguous/absent designated final: '+slot+'/'+arm)
    return finals[0]

def missing_guard(t, side, terminal_response, evals, inventory, new_final):
    original=side.get('original_task',{})
    need((side.get('slot'),side.get('arm'))==MISSING and side.get('delivery')=='MISSING_PRE_INPUT_GUARD_FAILURE' and side.get('source_judgment')=='UNASSESSED_MISSING_FINAL','missing sidecar identity/disposition')
    need(t['taskId']==original.get('taskId') and t.get('latestTerminalRunId')==original.get('latestTerminalRunId'),'missing original task/run mismatch')
    need(terminal_response.get('taskId')==t['taskId'] and terminal_response.get('latestTerminalRunId')==t.get('latestTerminalRunId') and quiet(terminal_response),'missing exact terminal response identity/quietness')
    summary=terminal_response.get('latestTerminalSummary',terminal_response.get('summary'))
    need(isinstance(summary,str) and bool(summary),'missing exact failed investigator terminal response')
    need(not evals and not inventory and not new_final,'missing guard: new science/final/evaluation present')

def custody_layout(run, slot, arm):
    stage = run/'stages'/role(slot,arm)
    if slot.startswith('B-'):
        names={'B-DISC-':'discovery.md','B-APPL-':'verification.md','B-FINAL-':'final-section.md'}
        matches=[name for prefix,name in names.items() if slot.startswith(prefix)]
        need(len(matches)==1,'unknown B role family')
        return stage/matches[0],stage/'terminal-science-freeze-root.json','terminal_task'
    return stage/('final/final.md' if role(slot,arm)=='investigator' else 'final.md'),run/'terminal-science-freeze-root.json','final_stage_task'

def latest_observation(t, records):
    need(isinstance(t.get('latestTerminalRunId'),str) and bool(t['latestTerminalRunId']),'missing terminal run identity')
    hits=[x for x in records if quiet(x[2]) and x[2].get('taskId')==t['taskId'] and x[2].get('latestTerminalRunId')==t['latestTerminalRunId']]
    need(len(hits)==1,'exactly one latest reconciliation response required: '+t['taskId'])
    p,v,z,ptr=hits[0]
    need(quiet(z),'latest reconciliation response not quiet')
    for k in ['status','latestTerminalStatus','hasPendingChildRuns','workState']:
        if k in t: need(z.get(k, z.get('status') if k=='latestTerminalStatus' else None)==t[k],'checkpoint/reconciliation mismatch: '+k)
    if 'observed_at_utc' in v: instant(v['observed_at_utc'])
    return p,v,z,ptr

def reconciliation_directory(runtime, supplied):
    expected=runtime/'mechanics/final-native-host-capture-v1/task-status'
    obsdir=safe(supplied,runtime)
    need(obsdir==expected,'terminal observation directory must be exact root-relative reconciliation directory')
    need(obsdir.is_dir(),'missing final reconciliation directory')
    files=sorted(itertools.islice(obsdir.glob('*.json'),1025))
    need(len(files)<=1024,'reconciliation direct JSON cap')
    return obsdir,files

def custody_inventory(artifacts, run, fpath, hashfile, required, all_stage_files=None):
    need(isinstance(artifacts,list) and 0<len(artifacts)<=2048,'finite original artifact inventory required')
    frozen={}
    for a in artifacts:
        need(isinstance(a,dict),'malformed artifact metadata')
        q=safe(a['path'],safe(run/'stages'))
        need(q!=fpath,'original root freeze cannot inventory itself')
        need(str(q) not in frozen,'duplicate freeze artifact')
        m=hashfile(q)
        need(m['sha256']==a.get('sha256') and type(a.get('bytes')) is int and m['bytes']==a['bytes'],'original custody artifact changed: '+str(q))
        frozen[str(q)]=m
    need(set(required)<=set(frozen),'required science absent from original custody inventory')
    if all_stage_files is not None: need(set(all_stage_files)==set(frozen),'B original custody must freeze ALL stage files except itself')
    return frozen

def instant(v):
    need(isinstance(v,str) and re.search(r'(Z|[+-]\d\d:\d\d)$',v),'timezone required')
    return datetime.datetime.fromisoformat(v.replace('Z','+00:00'))

def pointer(path, ptr): return {'path':str(path),'pointer':ptr}

def response(v):
    a=v.get('actual_response') if isinstance(v,dict) else None
    if a is None and isinstance(v,dict):
        if v.get('isError') is True: return None,None
        if isinstance(v.get('structuredContent'),dict): return v['structuredContent'], '/structuredContent'
    if not isinstance(a,dict) or a.get('isError') is True: return None, None
    if isinstance(a.get('structuredContent'),dict): return a['structuredContent'], '/actual_response/structuredContent'
    # The original bytes remain untouched. Decoded-string pointers are not JSON pointers;
    # reject rather than invent a pointer to an embedded JSON string.
    return None, None

def manifest_check(rows, arms):
    need(len(rows)==80 and {r['armId'] for r in rows}==set(arms),'manifest coverage')
    for r in rows:
        need(set(r)==FIELDS,'manifest fields')
        instant(r['observed_at'])
        for k in ['terminal_task_status_pointer','root_science_freeze_pointer']:
            p=r[k]; need(set(p)=={'path','pointer'} and Path(p['path']).is_absolute() and Path(p['path']).suffix=='.json' and p['pointer'].startswith('/') and len(p['pointer'])>1,'manifest pointer')
        need(r['disposition'] in {'DELIVERED','MISSING'},'manifest disposition')
        if r['disposition']=='MISSING': need(r['final_path'] is None and r['sha256'] is None,'missing file metadata')
        else: need(Path(r['final_path']).is_absolute() and re.fullmatch('[0-9a-f]{64}',r['sha256']) is not None,'delivered file metadata')

def global_manifest_check(rows, entries, output):
    need(len(entries)==len(rows),'global arm entries/manifest mismatch')
    for i,(r,e) in enumerate(zip(rows,entries)):
        need(e['armId']==r['armId'] and e['delivery']==r,'global arm delivery mismatch')
        need(r['root_science_freeze_pointer']==pointer(output/'global-root-science-freeze.json','/arms/'+str(i)),'manifest must point at global arm entry')
        need(isinstance(e.get('original_custody'),dict) and isinstance(e.get('actual_reconciliation'),dict),'custody/reconciliation references required')

def build(checkpoint, runtime, output, terminal_observation_dir):
    runtime=safe(runtime); checkpoint=safe(checkpoint); output=safe(output)
    need(output.parent==BASE and not output.exists(),'output must be a new directory immediately inside script bundle')
    need(checkpoint!=runtime/'root-checkpoint.json','supply a root final frozen COPY, never live checkpoint')
    sources={}
    def hashfile(p, root=runtime):
        p=safe(p,root); need(p.is_file(),'missing regular file: '+str(p))
        before=p.stat(); need(stat.S_ISREG(before.st_mode),'not regular file')
        h=hashlib.sha256()
        with p.open('rb') as f:
            need(os.fstat(f.fileno()).st_ino==before.st_ino,'file replaced')
            for b in iter(lambda:f.read(1024*1024),b''):
                need(True,'hash deadline'); h.update(b)
        after=p.stat(); need((before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_ino,after.st_size,after.st_mtime_ns),'input changed')
        m={'path':str(p),'sha256':h.hexdigest(),'bytes':after.st_size}; sources[str(p)]=m; return m
    def load(p, root=runtime):
        m=hashfile(p,root); b=Path(p).read_bytes(); need(hashlib.sha256(b).hexdigest()==m['sha256'],'JSON changed'); return json.loads(b)
    cp=load(checkpoint,None)
    for group in ['candidateTasks','evaluationTasks','setupTasks']:
        need(isinstance(cp.get(group),list) and len(cp[group])<=1024,'missing/oversize task group: '+group)
        need(all(quiet(t) for t in cp[group]),'nonterminal/pending '+group)
        ids=[t.get('taskId') for t in cp[group]]
        need(all(isinstance(x,str) and x for x in ids) and len(ids)==len(set(ids)),'invalid/duplicate task IDs')
    queue=load(runtime/'mechanics/QUEUE_ORIGINAL.json'); slots=queue.get('slots')
    need(isinstance(slots,list) and len(slots)==40,'queue must have exactly40slots')
    ids=[s['slot_id'] for s in slots]; need(len(set(ids))==40 and all(re.fullmatch('[A-Z0-9-]+',x) for x in ids),'slot IDs')
    need(dict(collections.Counter(s['track'] for s in slots))=={'A':16,'B':12,'C':4,'D':8},'original queue phase counts')
    pairs={(s,a) for s in ids for a in ['control','treatment']}; arms={s+'/'+a for s,a in pairs}
    for s in slots: need(set(s.get('arms',[]))=={s['slot_id']+'/control',s['slot_id']+'/treatment'},'original queue arms')
    need({(t.get('slot'),t.get('arm')) for t in cp['candidateTasks']}==pairs,'checkpoint arm coverage !=80')
    need(all((t.get('slot'),t.get('arm')) in pairs for t in cp['evaluationTasks']),'extra evaluation arm')
    # Current observations are supplied solely by root's one final reconciliation.
    obsdir,files=reconciliation_directory(runtime,terminal_observation_dir)
    sources_before={}
    observations=collections.defaultdict(list); malformed=[]
    for p in files:
        try: v=load(p); z,ptr=response(v)
        except (ValueError,UnicodeError) as e:
            safe(p,runtime)
            malformed.append({'artifact':sources.get(str(p)),'reason':type(e).__name__}); continue
        if z is not None and isinstance(z.get('taskId'),str): observations[z['taskId']].append((p,v,z,ptr))
    # Historical records are raw custody bytes only; older/nonquiet observations
    # do not contradict the supplied current reconciliation.
    hist=safe(runtime/'mechanics/task-observations',runtime)
    if hist.exists():
        historical=sorted(itertools.islice(hist.glob('*.json'),2049)); need(len(historical)<=2048,'historical observation cap')
        for p in historical: hashfile(p)
    def terminal(t): return latest_observation(t,observations[t['taskId']])
    # A final response alone does not quiet a retained investigator or other arm stage.
    for t in cp['candidateTasks']: terminal(t)
    sidepath=runtime/'mechanics/D-R1-03-treatment-MISSING_FINAL.json'; side=load(sidepath)
    need(sources[str(sidepath)]['sha256']=='f14f237b2a4f1f5bdc302a957cc91d144105d40c2240b0ddda3bd5f186dc443d','actual original missing sidecar hash mismatch')
    need(side.get('slot')==MISSING[0] and side.get('arm')==MISSING[1] and side.get('delivery')=='MISSING_PRE_INPUT_GUARD_FAILURE' and side.get('source_judgment')=='UNASSESSED_MISSING_FINAL','missing sidecar identity/disposition')
    rows=[]; entries=[]; labels=collections.Counter()
    for slot,arm in sorted(pairs):
        t=designated(slot,arm,cp['candidateTasks']); p,v,z,ptr=terminal(t)
        run=runtime/'runs'/slot/arm; stage=run/'stages'/role(slot,arm)
        final,fpath,task_field=custody_layout(run,slot,arm)
        # Science inventory: fixed stage names, fixed scientific root names plus bounded
        # source directories (hash only; no parsing source maps/case references).
        inventory=[]; excluded=[]
        def add(q):
            if q.exists() or q.is_symlink():
                if q.is_symlink(): excluded.append(str(q)); return
                inventory.append(hashfile(q))
        def source_tree(d,depth=0):
            safe(d,runtime); need(depth<=6,'source directory depth cap')
            if not d.exists(): return
            items=sorted(itertools.islice(d.iterdir(),513)); need(len(items)<=512,'source directory cap')
            for q in items:
                if q.is_symlink(): excluded.append(str(q)); continue
                if q.is_dir(): source_tree(q,depth+1)
                else: add(q)
                need(len(inventory)<=2048,'per-arm science cap')
        for name in STAGES:
            for sub in ['', 'final']:
                d=run/'stages'/name/sub
                safe(d,runtime)
                for filename in sorted(SCIENCE): add(d/filename)
                source_tree(d/'sources')
        evals=[e for e in cp['evaluationTasks'] if (e.get('slot'),e.get('arm'))==(slot,arm)]
        freeze_pointer=None; custody=None
        if (slot,arm)==MISSING:
            # Bounded directory-name check also catches a final placed outside designated stage.
            visited=[0]
            def any_new_final(d,depth=0):
                safe(d,runtime); need(depth<=8,'missing-arm directory depth cap')
                if not d.exists(): return False
                found=False
                for q in itertools.islice(d.iterdir(),4097):
                    visited[0]+=1; need(visited[0]<=4096,'missing-arm inventory cap')
                    if q.name=='final.md': found=True
                    if q.is_symlink(): continue
                    if q.is_dir(): found=any_new_final(q,depth+1) or found
                return found
            missing_guard(t,side,z,evals,inventory,any_new_final(run/'stages'))
            evidence=side.get('failure_evidence',{}); m=hashfile(evidence.get('path',''))
            need(m['sha256']==evidence.get('sha256'),'failure evidence hash mismatch')
            label='UNASSESSED_MISSING_FINAL'; disposition='MISSING'; fm=None
            freeze_pointer=pointer(sidepath,'/delivery')
            assessment={'state':label,'original_sidecar':sources[str(sidepath)],'failure_evidence':m,'terminal_response':sources[str(p)]}
            observed=side['at_utc']; instant(observed)
        else:
            need(t['status']=='completed' and z['status']=='completed','designated final not completed')
            f=load(fpath)
            ft=f.get(task_field,{})
            need(ft.get('taskId')==t['taskId'] and ft.get('stage')==role(slot,arm) and quiet(ft) and ft.get('latestTerminalRunId')==t.get('latestTerminalRunId'),'original science freeze final task mismatch')
            observed=f.get('observed_at_utc'); instant(observed)
            all_stage_files=None
            if slot.startswith('B-'):
                all_stage_files=[]
                def retained(d,depth=0):
                    safe(d,runtime); need(depth<=8,'B custody depth cap')
                    items=sorted(itertools.islice(d.iterdir(),2049)); need(len(items)<=2048,'B custody directory cap')
                    for q in items:
                        safe(q,runtime)
                        if q.is_dir(): retained(q,depth+1)
                        elif q!=fpath:
                            all_stage_files.append(str(q)); need(len(all_stage_files)<=2048,'B custody file cap')
                retained(stage)
            frozen=custody_inventory(f.get('artifacts'),run,fpath,hashfile,[x['path'] for x in inventory]+[str(final)],all_stage_files)
            custody={'artifact':sources[str(fpath)],'terminal_task_pointer':pointer(fpath,'/'+task_field)}
            inventory=list(frozen.values())
            fm=hashfile(final); need(str(final) in frozen and fm['bytes']>0,'actual designated final absent/unfrozen')
            if t.get('final_path') is not None: need(t['final_path']==str(final),'declared final_path mismatch')
            freeze_pointer=pointer(fpath,'/'+task_field)
            # One original evaluator, never revision or inferred FAIL.
            originals=[e for e in evals if isinstance(e.get('key'),str) and e['key'].endswith('-v1')]
            need(len(originals)==1 and len(evals)==1 and originals[0]['status']=='completed','original evaluation absent/ambiguous')
            apath=runtime/'assessment'/slot/(arm+'-v1')/'assessment.json'; av=load(apath)
            need(isinstance(av,dict) and isinstance(av.get('source_judgment'),str) and bool(av['source_judgment']),'original source label absent/malformed; never regrade')
            label=av['source_judgment']; assessment={'state':'ASSESSED','source_judgment':label,'artifact':sources[str(apath)],'source_judgment_pointer':pointer(apath,'/source_judgment'),'evaluation_task_id':originals[0]['taskId']}
            disposition='DELIVERED'
        labels[label]+=1
        row={'armId':slot+'/'+arm,'disposition':disposition,'final_task_id':t['taskId'],'final_path':str(final) if fm else None,'sha256':fm['sha256'] if fm else None,'observed_at':observed,'terminal_task_status_pointer':pointer(p,ptr),'root_science_freeze_pointer':pointer(output/'global-root-science-freeze.json','/arms/'+str(len(entries)))}
        rows.append(row); entries.append({'armId':row['armId'],'delivery':row,'final_role':role(slot,arm),'scientific_artifacts':inventory,'excluded_symlinks':excluded,'original_assessment':assessment,'original_custody_pointer':freeze_pointer,'original_custody':custody if custody else {'artifact':sources[str(sidepath)]},'actual_reconciliation':{'artifact':sources[str(p)],'terminal_task_pointer':pointer(p,ptr)}})
    manifest_check(rows,arms)
    global_manifest_check(rows,entries,output)
    need(sum(r['disposition']=='DELIVERED' for r in rows)==79 and labels['UNASSESSED_MISSING_FINAL']==1,'expected79deliveries/oneunassessed')
    # Rehash every input before any output writes; originals are never repaired.
    sources_before=dict(sources)
    for m in list(sources.values()): need(hashfile(m['path'],None)==m,'input changed during freeze')
    output.mkdir()
    frozen_cp=output/'frozen-checkpoint.json'; frozen_cp.write_bytes(checkpoint.read_bytes())
    need(hashlib.sha256(frozen_cp.read_bytes()).hexdigest()==sources[str(checkpoint)]['sha256'],'checkpoint copy changed')
    summary={'attempted_arms':80,'possible_delivered_arms':79,'delivered_arms':79,'original_grades':79,'UNASSESSED_MISSING_FINAL':1,'source_label_counts':dict(sorted(labels.items())),'no_grades_inferred':True}
    root={'schema':'er12.global-root-science-freeze.v1','checkpoint':{'path':str(frozen_cp),'sha256':sources[str(checkpoint)]['sha256'],'original_path':str(checkpoint)},'arms':entries,'input_hashes':sorted(sources.values(),key=lambda m:m['path']),'input_hashes_before':sorted(sources_before.values(),key=lambda m:m['path']),'input_hashes_after':sorted(sources.values(),key=lambda m:m['path']),'terminal_observation_directory':str(obsdir),'malformed_original_receipts_preserved':malformed,'summary':summary}
    for name,obj in [('global-root-science-freeze.json',root),('delivery-manifest.json',{'rows':rows}),('summary.json',summary)]:
        (output/name).write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n')
    return summary

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    for name in ['checkpoint','runtime','output','terminal-observation-dir']: ap.add_argument('--'+name,required=True,type=Path)
    a=ap.parse_args()
    try: result=build(a.checkpoint,a.runtime,a.output,a.terminal_observation_dir)
    except (ValueError,OSError,KeyError,TypeError) as e: ap.exit(2,'REFUSED: '+str(e)+'\n')
    print(json.dumps(result,sort_keys=True))
if __name__=='__main__': main()
