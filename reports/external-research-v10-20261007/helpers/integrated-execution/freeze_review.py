import pathlib,json,hashlib,datetime,sys
B=pathlib.Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5');case,arm=sys.argv[1:];J=B/'reviews/integrated-methods'/case/arm/'review-v1';now=datetime.datetime.now(datetime.timezone.utc).isoformat()
def data(p):return json.loads(p.read_text())
def raw(x):return x.get('structuredContent') or json.loads(x['content'][0]['text'])
t=raw(data(J/'terminal-task-status.json'));r=raw(data(J/'terminal-t3-observation.json'));assert t['status'] in ['completed','failed','interrupted','cancelled'] and not t['hasPendingChildRuns'];assert r['thread']['activeRunId'] is None;assert not (J/'frozen-review.json').exists()
files=[]
for p in sorted(J.rglob('*')):
 if p.is_file() and (p.name in ['judgment.md','coverage.json','source-checks.json'] or 'sources' in p.relative_to(J).parts):
  b=p.read_bytes();files.append({'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()});p.chmod(0o444)
c=data(J/'coverage.json') if (J/'coverage.json').exists() else None;s=data(B/'state/integrated-methods.json');cfg=data(J/'dispatch-config.json');run=r['recentRuns'][0];freeze={'record_at':now,'task_terminal':t['status'],'hasPendingChildRuns':False,'t3_run':run,'delivery_in_review_deadline':bool(run.get('completedAt')) and datetime.datetime.fromisoformat(run['completedAt'].replace('Z','+00:00'))<=datetime.datetime.fromisoformat(cfg['prospective_review_deadline']),'native_goal_required':False,'usage':{'input':None,'cache':None,'generated':None,'reasoning':None,'billing':None},'coverage':c,'files':files,'pair_gate':s['cases'][case]['pair_freeze']};(J/'frozen-review.json').write_text(json.dumps(freeze,indent=2)+'\n');(J/'frozen-review.json').chmod(0o444)
rev=s['cases'][case]['reviews'][arm];rev.update(t);rev.update({'review_freeze':str(J/'frozen-review.json'),'coverage':c,'t3_completedAt':run['completedAt'],'delivery_record_at':now,'actual_requestedAt':run['requestedAt'],'actual_t3_startedAt':run['startedAt']});s['updated_at']=now;(B/'state/integrated-methods.json').write_text(json.dumps(s,indent=2)+'\n')
with (B/'state/integrated-methods-dispatches.jsonl').open('a') as f:f.write(json.dumps({'event':'independent_review_frozen','case':case,'arm':arm,'record_at':now,'freeze':str(J/'frozen-review.json'),'source_judgment':c.get('source_judgment') if c else None})+'\n')
print(json.dumps({'files':len(files),'t3_completedAt':run['completedAt'],'source_judgment':c.get('source_judgment') if c else None,'counts':c.get('counts') if c else None}))
