#!/usr/bin/env python3
"""Finite behavioral adversarial checks, with fixtures confined to own output dir."""
import json, tempfile
from pathlib import Path
import join

def run():
    checks=[]
    with tempfile.TemporaryDirectory(prefix='finite-check-',dir=join.OUT) as tmp:
        r=Path(tmp);m=r/'mechanics';m.mkdir();(m/'accounting-extractor-v1').mkdir()
        def save(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v))
        slots=[{'slot_id':f'{phase}{i}-01','track':phase,'contrast_id':f'{phase}{i}'} for phase,n in [('A',16),('B',12),('C',4),('D',8)] for i in range(1,n+1)]
        slots[1]['slot_id']='A2-01'
        save(m/'QUEUE_ORIGINAL.json',{'slots':slots});save(m/'QUEUE.json',{'slots':slots});save(m/'REALLOCATIONS-v1.json',{});save(m/'PROGRESS_COUNT_POLICY.json',{});(m/'accounting-extractor-v1/extract.py').write_text('# fixture mechanical extractor\n')
        def task(slot,arm,stage,aid,status='completed'):return {'slot':slot,'arm':arm,'stage':stage,'taskId':aid,'status':status,'hasPendingChildRuns':False}
        c={'candidateTasks':[task('A1-01','control','reviser','c'),task('A1-01','treatment','reviser','t'),task('A2-01','treatment','investigator','original'),task('A2-01','treatment','critic','later-critic')],'evaluationTasks':[task('A1-01','control','evaluation','ec'),task('A1-01','treatment','evaluation','et'),task('A2-01','treatment','evaluation','e2','running'),task('A3-01','control','evaluation','missing')]}
        save(r/'checkpoint.json',c)
        for arm in ['control','treatment']:
            save(r/'assessment/A1-01'/f'{arm}-v1/assessment.json',{'source_judgment':'PASS','time':{'delivery_within_deadline':True},'native':{'status':'UNKNOWN'},'protocol':{'status':'UNKNOWN'}})
        save(r/'assessment/A2-01/treatment-v1/assessment.json',{'source_judgment':'FAIL'})
        acct={'logical_arms':[{'slot':'A1-01','arm':arm,'final_task_id':aid,'attempt_task_ids':[aid],'candidate_latency_seconds':secs} for arm,aid,secs in [('control','c',120),('treatment','t',60)]]};save(r/'accounting.json',acct)
        def build():return join.build(r,r/'checkpoint.json',r/'accounting.json')
        v=build();rows={(x['slot'],x['arm']):x for x in v['rows']}
        a2=rows['A2-01','treatment'];assert a2['assessment_state']=='UNASSESSED' and a2['source_judgment']=='UNKNOWN';assert not any('/assessment/A2-01/' in x['path'] for x in v['source_manifest']);checks.append('incomplete evaluator excludes existing judgment bytes')
        assert rows['A3-01','control']['assessment_state']=='ABSENT' and rows['D1-01','control']['delivery']=='UNSTARTED';checks.append('absent, unstarted, unassessed remain separate')
        assert a2['final_attempt_id']=='original' and a2['final_role']=='investigator' and a2['delivery']=='COMPLETED_QUIET';assert join.role('A7-01','treatment')=='critic-finalizer';checks.append('retained A2 original and A7 finalizer')
        assert rows['A1-01','control']['billing']=='UNKNOWN' and a2['resources']['missing_context_lifetimes']=='UNKNOWN';assert rows['A1-01','control']['dimensions']['native']['label']=='UNKNOWN';checks.append('unknown telemetry never becomes zero or billing')
        assert len(v['paired_latency_ratios'])==1 and v['paired_latency_ratios'][0]['treatment_over_control_latency']==0.5 and v['paired_latency_ratios'][0]['protocol_eligibility']=='UNKNOWN';checks.append('both-source-pass paired latency is survivorship, eligibility separate')
        save(r/'assessment/A1-01/treatment-v1/assessment.json',{'source_judgment':'FAIL','delivery':{'status':'PASS'}});v=build();row=next(x for x in v['rows'] if x['slot']=='A1-01' and x['arm']=='treatment');assert row['source_judgment']=='FAIL' and not v['paired_latency_ratios'];assert sum(x['source_pass_family'] for x in v['counts'])==1;checks.append('semantic FAIL unchanged despite quiet delivery; pair excluded')
        assert join.dimensions({'delivery':{'status':'PASS','judgment':'FAIL'}},lambda p:{'json_pointer':p})[0]['delivery']['label']=='UNKNOWN';checks.append('conflicting schema labels are unknown, never regraded')
    # A launched queue arm omitted by an incomplete checkpoint is not unstarted.
        changed=json.loads((m/'QUEUE.json').read_text());changed['slots'][-1]['arms']=[{'arm_id':slots[-1]['slot_id']+'/control','task_id':'missing-declaration','state':'RUNNING'}];save(m/'QUEUE.json',changed);v=build();assert next(x for x in v['rows'] if x['slot']==slots[-1]['slot_id'] and x['arm']=='control')['delivery']=='ABSENT_FROM_CHECKPOINT';checks.append('incomplete candidate checkpoint does not relabel launched queue arm unstarted')
    return {'status':'PASS','checks':checks,'count':len(checks),'temporary_fixture_cleanup':True}
if __name__=='__main__':
    result=run();(join.OUT/'checks.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
