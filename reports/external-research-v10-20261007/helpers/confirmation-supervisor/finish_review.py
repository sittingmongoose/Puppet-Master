#!/usr/bin/env python3
"""Hash-freeze original review outputs without printing scientific prose."""
import datetime,hashlib,json,sqlite3,sys
from pathlib import Path
ROOT=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
case,arm=sys.argv[1:3]
assert case in ['C-01','C-02','C-03','C-04'] and arm in ['control','treatment']
d=ROOT/'reviews/confirmation'/case/arm/'source-review-v1';p=ROOT/'state/confirmation-supervisor.json';s=json.loads(p.read_text());out=json.loads((d/'task-terminal.json').read_text());result=out.get('structuredContent') or json.loads(next(x['text'] for x in out['content'] if x['type']=='text'))
assert result['status']=='completed' and result['workState']=='result_available' and not result['hasPendingChildRuns']
t=next(t for t in s['owned_reviews'] if t['case']==case and t['arm']==arm)
assert not (d/'HOST_REVIEW_FREEZE.json').exists(), 'Original host freeze already exists'
files=[]
for f in sorted(d.rglob('*')):
    if f.is_file() and f.name not in ['dispatch.json','request.json','delegate-result.json','task-terminal.json','actual-dispatch-config.json','INPUT_MAP.json','runtime-budget.json','task.txt']:
        b=f.read_bytes();files.append({'path':str(f),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
assert (d/'REVIEW_FREEZE.json').is_file() and (d/'REPORT.md').is_file()
review=json.loads((d/'REVIEW_FREEZE.json').read_text())
assert all(k in review for k in ['original_scientific_grade','full_declared_scope_assessed','axes','obligations'])
c=sqlite3.connect('file:/home/sittingmongoose/.t3/userdata/statev2.sqlite?mode=ro',uri=True);c.execute('PRAGMA query_only=ON')
row=c.execute('SELECT payload_json FROM orchestration_v2_projection_runs WHERE run_id=? AND thread_id=?',(t['childRunId'],t['childThreadId'])).fetchone();rv=json.loads(row[0]);run={k:rv.get(k) for k in ['id','threadId','status','requestedAt','startedAt','completedAt']}
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
freeze={'frozen_at':now,'files':files,'quiet':{k:result[k] for k in ['taskId','childThreadId','childRunId','status','workState','hasPendingChildRuns']},'actual_run_projection':run,'original_grade_unchanged':True,'review_prose_not_read_by_supervisor':True,'grade_original_path':str(d/'REVIEW_FREEZE.json'),'source_assessment_not_inferred_from_hashes':True,'usage':{'input':None,'cached_input':None,'generated_output':None,'billing':None}}
(d/'HOST_REVIEW_FREEZE.json').write_text(json.dumps(freeze,indent=2)+'\n');t.update(status='completed',quiet=True,host_review_freeze=str(d/'HOST_REVIEW_FREEZE.json'),actual_run_terminal_projection=run);s['updated_at']=now;p.write_text(json.dumps(s,indent=2)+'\n')
with (ROOT/'state/confirmation-supervisor-log.jsonl').open('a') as f:f.write(json.dumps({'at':now,'event':'review_original_files_frozen','case':case,'arm':arm,'grade_path':str(d/'REVIEW_FREEZE.json'),'quiet':True})+'\n')
print(json.dumps({'case':case,'arm':arm,'files_hashed':len(files),'quiet':True,'run':run}))
