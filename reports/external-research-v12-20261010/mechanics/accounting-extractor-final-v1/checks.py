#!/usr/bin/env python3
"""Finite synthetic validation only; no campaign extraction."""
import hashlib,json,tempfile
from pathlib import Path
from unittest.mock import patch
from extract import extract,U
HERE=Path(__file__).resolve().parent
checks=[]
def check(name,condition):
    assert condition,name
    checks.append(name)
with tempfile.TemporaryDirectory(prefix='synthetic-',dir=HERE) as tmp:
    r=Path(tmp)
    def save(name,obj):
        p=r/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj));return p
    def stamp(n):return f'2026-01-01T00:00:{n:02d}+00:00'
    tasks=[{'taskId':'author','childThreadId':'author-host','slot':'D-R1-03','arm':'treatment','stage':'investigator'}, {'taskId':'final','childThreadId':'final-host','slot':'D-R1-03','arm':'treatment','stage':'reviser'}]
    checkpoint=save('frozen.json',{'rootThreadId':'root','candidateTasks':tasks,'setupTasks':[None]})
    def host(tid,created,started,end):
        return {'thread':{'threadId':tid,'createdAt':stamp(created),'updatedAt':stamp(end),'runCount':1},'runs':[{'runId':tid+'-1','requestedAt':stamp(created+1),'startedAt':stamp(started),'completedAt':stamp(end),'status':'completed'}]}
    meters=[{'goal':{'goal_id':'same','objective':'synthetic','tokensUsed':n,'timeUsedSeconds':n/10,'status':'blocked' if n==150 else 'active','updatedAt':n}} for n in [0,100,100,150]]
    capture=save('mechanics/C-R1-host-timing-v1/HOST_CAPTURE.json',[host('author-host',0,5,30),host('final-host',10,15,40),*meters])
    save('mechanics/C-R2-host-timing-v1/HOST_CAPTURE.json',{'thread':{'threadId':'bad'},'runs':'bad'})
    save('mechanics/D-R1-host-timing-v1/HOST_CAPTURE.json',42)
    save('mechanics/STAGE_OVERRUN_ENFORCEMENT.json',{'malformed':'not a list'})
    save('mechanics/native-observation-cohort2/OBSERVATIONS.json',{'targets':[None,{'frozen':'bad'}]})
    disposition=save('mechanics/D-R1-03-treatment-MISSING_FINAL.json',{'slot':'D-R1-03','arm':'treatment','delivery':'MISSING_PRE_INPUT_GUARD_FAILURE','source_judgment':'UNASSESSED_MISSING_FINAL'})
    assessment=save('assessment/D-R1-03/treatment-v1/assessment.json',{'delivery':{'heterogeneous':'preserve'},'extra_original_label':'unchanged'})
    science=save('runs/D-R1-03/treatment/stages/investigator/source-map.json',{'sentinel':'NEVER READ'})
    science2=r/'runs/D-R1-03/treatment/stages/investigator/draft.md';science2.write_text('NEVER READ')
    before={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in r.rglob('*') if p.is_file()}
    original_read=Path.read_bytes
    def guarded(p):
        if p in [science,science2]: raise AssertionError('science sentinel read')
        return original_read(p)
    with patch.object(Path,'read_bytes',guarded): obj=extract(checkpoint,r)
    a=obj['logical_arms'][0];g=next(g for g in obj['native_goals'] if g['identity_key']=='goal_id:same')
    check('deduplicated 0/100/100/150 cumulative max, never 350',g['raw_cumulative_meter_maxima']['tokensUsed']==150 and g['repeated_records']==1 and not g['meters_summed'])
    check('latest observation and blocked terminal preserved',g['latest_raw_observations'][0]['raw']['tokensUsed']==150 and g['blocked_terminal_preserved_failure'] and not g['terminal_observed'] and not g['science_completion_inferred'])
    check('retained author overlaps final context',a['observed_occupied_context_sum_seconds']==60 and a['observed_context_union_seconds']==40 and a['observed_overlap_seconds']==20)
    check('created lifetime differs from started context',a['observed_started_to_completed_context_sum_seconds']==50 and a['observed_started_context_overlap_seconds']==15)
    check('missing final retains failure cost without delivery time',a['delivery_latency_seconds']==U and a['candidate_latency_seconds']==U and a['attempt_terminal_latency_seconds']==39 and a['complete_occupied_context_sum_seconds']==60)
    check('queue and handoff separate',obj['declared_tasks'][1]['queue_seconds']==4 and a['handoff_seconds']==U)
    check('original heterogeneous judgments unchanged',a['frozen_existing_judgment'][0]['original_record']['extra_original_label']=='unchanged' and a['frozen_existing_judgment'][0]['labels']['delivery']=={'heterogeneous':'preserve'})
    check('malformed originals and capture metadata reported',sum('malformed' in e['reason'] for e in obj['read_errors'])>=4)
    check('finite missing capture files explicit',any(e['reason']=='missing' and e['path'].endswith('D-R2-host-timing-v1/HOST_CAPTURE.json') for e in obj['read_errors']))
    check('no science read sentinel',all(s['path'] not in [str(science),str(science2)] for s in obj['source_manifest']))
    check('immutable synthetic inputs and source pins',not obj['sources_changed_during_extraction'] and all(hashlib.sha256(Path(p).read_bytes()).hexdigest()==h for p,h in before.items()) and all(hashlib.sha256(Path(s['path']).read_bytes()).hexdigest()==s['sha256'] for s in obj['source_manifest']))
    check('billing unknown and root not aggregate',obj['campaign_billing']==U and obj['campaign_cached_input']==U and not obj['root_native_meter_is_campaign_aggregate'])
    # Exact manifest support, rejection of science, and malformed manifest.
    extra=save('mechanics/final-native-host-capture-v1/host/exact.json',{'goal':{'goal_id':'manifest-goal','objective':'synthetic','tokensUsed':2,'status':'complete'}})
    manifest=save('manifest.json',{'files':[str(extra.relative_to(r)),str(science.relative_to(r))]})
    with patch.object(Path,'read_bytes',guarded): second=extract(checkpoint,r,manifest)
    check('exact host manifest and science entry rejected',any(g['identity_key']=='goal_id:manifest-goal' for g in second['native_goals']) and any('manifest entry' in e['reason'] for e in second['read_errors']))
    save('manifest.json',{'files':'malformed'})
    with patch.object(Path,'read_bytes',guarded): third=extract(checkpoint,r,manifest)
    check('malformed manifest bounded',any('finite files list' in e['reason'] for e in third['read_errors']))
pin=json.loads((HERE/'ORIGINAL-PIN.json').read_text())
check('original extractor immutable',hashlib.sha256(Path(pin['path']).read_bytes()).hexdigest()==pin['sha256'])
(HERE/'check-results.json').write_text(json.dumps({'status':'PASS','checks':checks,'campaign_run':False},indent=2)+'\n')
print(json.dumps({'status':'PASS','checks':len(checks),'campaign_run':False}))
