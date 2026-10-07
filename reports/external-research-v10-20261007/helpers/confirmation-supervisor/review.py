#!/usr/bin/env python3
"""Prepare one ordinary blinded Source6 review, then persist its exact T3 dispatch."""
import datetime, hashlib, json, subprocess, sys
from pathlib import Path

ROOT=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
STATE=ROOT/'state/confirmation-supervisor.json'
def read(p):return json.loads(Path(p).read_text())
def write(p,v):Path(p).write_text(json.dumps(v,indent=2)+'\n')
def stamp():return datetime.datetime.now(datetime.timezone.utc)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def prepare(case,arm):
    assert case in ['C-01','C-02','C-03','C-04'] and arm in ['control','treatment']
    s=read(STATE);pair=s['pairs'][case]
    assert all(x['status']=='FINAL_FROZEN' for x in pair['arms'].values())
    quiet=read(ROOT/'reviews/confirmation'/case/'PAIR_QUIET.json')
    assert len(quiet['tasks'])==5 and all(t['status']=='completed' and t['workState']=='result_available' and not t['hasPendingChildRuns'] for t in quiet['tasks'])
    finals={}
    for a in ['control','treatment']:
        f=Path(pair['arms'][a]['final_freeze']);v=read(f)
        assert 'complete' in v['native_statuses'] and all(v['required_files_nonempty_parseable'].values())
        for x in v['files']:assert sha(x['path'])==x['sha256']
        finals[a]={'path':str(f),'sha256':sha(f)}
    gate=ROOT/'reviews/confirmation'/case/'PAIR_FINAL_FREEZE.json'
    if not gate.exists():write(gate,{'frozen_at':stamp().isoformat(),'finals':finals,'quiet_path':str(ROOT/'reviews/confirmation'/case/'PAIR_QUIET.json'),'scientific_status':'UNASSESSED','original_outputs_unchanged':True})
    d=ROOT/'reviews/confirmation'/case/arm/'source-review-v1';d.mkdir(parents=True,exist_ok=True)
    assert not (d/'dispatch.json').exists()
    (d/'sources').mkdir(exist_ok=True)
    mem=subprocess.check_output(['free','-g'],text=True);available=int(next(x for x in mem.splitlines() if x.startswith('Mem:')).split()[-1]);assert available>=6
    card=read(ROOT/'cases'/case/'case-card.json');final_stage='reviser-v1' if arm=='control' else 'critic-v1';final=ROOT/'jobs'/case/arm/final_stage
    admitted=[]
    for stage in (['researcher-v1','critic-v1','reviser-v1'] if arm=='control' else ['researcher-v1','critic-v1']):
        sd=ROOT/'jobs'/case/arm/stage
        for name in ['artifact.md','source-map.json','preservation_check.md']:
            p=sd/name;assert p.is_file();admitted.append({'path':str(p),'sha256':sha(p),'purpose':'final scientific artifact' if stage==final_stage else 'own predecessor scientific preservation evidence'})
        admitted.append({'path':str(sd/'sources'),'purpose':'own candidate immutable primary-source captures only'})
    for name in ['BRIEF.md','PLAN.md']:
        p=ROOT/'cases'/case/name;admitted.append({'path':str(p),'sha256':sha(p),'purpose':'frozen common scientific input'})
    im={'final_artifact':str(final/'artifact.md'),'final_source_map':str(final/'source-map.json'),'final_preservation_check':str(final/'preservation_check.md'),'admitted':admitted,'excluded':'All other arms/cases/repetitions, task/root conversation/history, root state/analysis/locks, costs/timings/targets/expected winner, prior independent reviews/grade keys, candidate host/runtime files. No candidate feedback.'}
    write(d/'INPUT_MAP.json',im)
    t=stamp();deadline=(t+datetime.timedelta(minutes=40)).isoformat();write(d/'runtime-budget.json',{'predispatch_at':t.isoformat(),'deadline':deadline,'review_allowance_minutes':40,'writing_reserve_minutes':5,'memory_available_gb':available,'memory_raw':mem,'no_scientific_scope_reduction':True})
    obligations='\n'.join(x['id']+': '+x['requirement'] for x in card['full_obligations'])
    task=f'''Conduct ONE fresh ordinary independent FULL declared Source6 primary-source review of the single final proposal mapped at {d/'INPUT_MAP.json'}. You are explicitly codex_gmail/gpt-6.1-sol/xhigh/priority, named account sittingmongoose@gmail.com. No reviewer Goal required; do not spend time on Goal receipt engineering or delegate nested helpers.
Read actual applicable cwd/global/scoped T3 rules. No pm-mail, worktrees, external runners, private repos, purchases, credentials/account changes, canon/main writes, WorkNodes or product implementation. Read ONLY the mapped frozen scientific brief/plan, this one candidate's final and its own predecessor scientific preservation files/captures plus legitimate public primary sources. Do not inspect host/runtime files, other arms/cases/repetitions, root conversation/history/analysis, timing/costs/targets or earlier independent reviews/grade keys. Input map is advisory, not firewall proof. Method-specific output/path may reveal stage structure; disclose that blinding limit without guessing expected winner.
Original FULL declared scientific obligations:
{obligations}
Independently verify against governing primary sources (including pinned component code and justified issue/fix/regression/release history) rather than trusting candidate confidence, cited titles or hash/renderer success. Capture public bytes actually used under your own {d/'sources'} with URL/version/commit/locator/access time. Check consequential claims and applicability/conditions end to end and disclose any unassessed remainder. Do not manufacture a source-count target, exhaustive recall catalog or undeclared rubric.
Assess and preserve SIX declared Source axes: (1) full brief obligations; (2) consequential source claims and governing conditions; (3) useful open discovery coverage/options/analogies/components/history; (4) incorrect rejection/correction; (5) preservation of constraints, options, source identity, admitted corrections and uncertainty into final; (6) proposed versus actually performed validation. Use exact PLAN section IDs for plan comparisons and disposition completeness. Full PASS requires all declared scope actually assessed with no material defect/coverage loss. Unknown or incomplete assessment is HOLD, never a quality win. Distinguish material defects, nonmaterial caveats, justified abstention and unresolved product choices; finite one round, no scientific rescue or candidate rewriting/feedback.
Save {d/'REPORT.md'} with compact evidence-supported findings, exact defect IDs/claims/locators, factual reasoning and coverage/limitations. Save {d/'REVIEW_FREEZE.json'} with schema pm.er10.source6-review-freeze.v1; original_scientific_grade; full_declared_scope_assessed boolean; axes (six axis IDs, statuses, assessed evidence/defect refs); obligations O1..O7 statuses/evidence; material_defects; limitations; reviewed_input_sha256s; primary_sources_checked (URLs/versions/locators/capture paths); preservation result; proposed_vs_executed; source_operations counts only if observable otherwise null; usage input/cached/generated/reasoning/billing null unless actually exposed. Grade status PASS, PASS_WITH_LIMITATIONS, FAIL or HOLD, preserving original result immutable. Lifecycle/time/provenance/economics eligibility is separately owned by supervisor and cannot upgrade scientific grade.
Read {d/'runtime-budget.json'} for absolute bounded review deadline and protected writing reserve. Finish full checks and save original judgment; any unassessed scope remains HOLD. Final response only exact saved report/freeze paths and coverage disposition. No counterpart comparison, cost advantage, score target or premium candidate-answer repair is part of this review.
'''
    (d/'task.txt').write_text(task)
    req={'target':{k:v for k,v in s['review_binding'].items() if k!='account'},'mode':'async','role':'review','runtimeMode':'full-access','interactionMode':'default','title':f'{case} {arm} independent Source6 review','clientRequestId':f'er10-confirmation-{case}-{arm}-source-review-v1','task':task};write(d/'request.json',req)
    pair['status']='PAIR_FROZEN_REVIEW_ADMISSION';pair['pair_final_freeze']=str(gate);s['scientific_review_started']=True;s['updated_at']=t.isoformat();write(STATE,s)
    print(json.dumps(req))

def record(case,arm,path):
    s=read(STATE);d=ROOT/'reviews/confirmation'/case/arm/'source-review-v1';out=read(path);v=out.get('structuredContent') or json.loads(next(x['text'] for x in out['content'] if x['type']=='text'));assert v['providerInstanceId']=='codex_gmail' and v['model']=='gpt-6.1-sol'
    write(d/'dispatch.json',{**v,'directory':str(d),'request_path':str(d/'request.json'),'saved_at':stamp().isoformat(),'summary':None,'latestTerminalSummary':None})
    s.setdefault('owned_reviews',[]).append({'case':case,'arm':arm,'stage':'source-review-v1','taskId':v['taskId'],'childThreadId':v['childThreadId'],'childRunId':v['childRunId'],'directory':str(d),'requested_binding':s['review_binding'],'actual_binding':None,'usage':{'input':None,'cached_input':None,'generated_output':None,'billing':None}});s['pairs'][case]['status']='SOURCE_REVIEW_IN_FLIGHT';s['updated_at']=stamp().isoformat();write(STATE,s)
    print(json.dumps({k:v[k] for k in ['taskId','childThreadId','childRunId','providerInstanceId','model','status']}))

if __name__=='__main__':
    if sys.argv[1]=='prepare':prepare(sys.argv[2],sys.argv[3])
    elif sys.argv[1]=='record':record(sys.argv[2],sys.argv[3],sys.argv[4])
