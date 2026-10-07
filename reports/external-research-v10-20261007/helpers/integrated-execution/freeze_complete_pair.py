import pathlib,json,hashlib,datetime,sys,os
B=pathlib.Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5');case=sys.argv[1];version=sys.argv[2] if len(sys.argv)>2 else 'v1';C=B/'cases'/case;card=json.loads((C/('execution-'+version+'.json')).read_text());P=B/'state/integrated-methods.json';s=json.loads(P.read_text());view=s['cases'][case] if version=='v1' else s['cases'][case]['versions'][version];quiet_path=B/'helpers/integrated-execution'/(case.lower()+'-pair-current-quiet-'+version+'.json');quiet=json.loads(quiet_path.read_text());assert quiet
def data(x):return x.get('structuredContent') or json.loads(x['content'][0]['text'])
statuses={}
for item in quiet:
 assert item['status']=='fulfilled';r=data(item['value']['result']);assert r['status'] in ['completed','failed','interrupted','cancelled'] and not r['hasPendingChildRuns'];statuses[r['taskId']]=r
finals={}
for arm,row in view['arms'].items():
 for st in row['stages'].values():assert st['taskId'] in statuses
 role=card.get('final_role',{}).get(arm,'reviser');st=row['stages'][role];J=pathlib.Path(st['directory']);d=json.loads((J/'frozen-delivery.json').read_text());assert st.get('native_terminal')=='complete';assert d['descendants_quiet'];required=[J/'artifact.md',J/'source-map.json']
 if case=='I-METHOD-04' and arm=='treatment':required += [J/'semantic.json',J/'preservation_check.md']
 for p in required:
  assert p.is_file() and str(p) in d['files'];assert hashlib.sha256(p.read_bytes()).hexdigest()==d['files'][str(p)]['sha256']
 finals[arm]={'role':role,'native_terminal':st['native_terminal'],'native_identity':st.get('native_goal_identity'),'native_active_observed':st.get('native_active_observed'),'delivery_freeze':str(J/'frozen-delivery.json'),'final_files':{str(p):d['files'][str(p)] for p in required},'source_quality':None,'lifecycle_hold':st.get('lifecycle_hold')}
now=datetime.datetime.now(datetime.timezone.utc).isoformat();gate={'schema':'er10.exact.complete.pair.freeze.v1','case':case,'version':version,'record_at':now,'both_finals_frozen':True,'both_full_final_carriers_present':True,'both_native_complete_terminal_states':True,'all_tasks_quiet':True,'current_actual_task_statuses':str(quiet_path),'finals':finals,'source_assessment':None,'scope':'mechanical gate only; actual reviewers decide full scientific completeness/source correctness; lifecycle/time limits separate'};p=B/'helpers/integrated-execution'/(case.lower()+'-pair-freeze-'+version+'.json');assert not p.exists();p.write_text(json.dumps(gate,indent=2)+'\n');os.chmod(p,0o444);view['pair_freeze']=str(p);view['status']='pair_frozen_ready_independent_reviews';s['updated_at']=now;P.write_text(json.dumps(s,indent=2)+'\n')
with (B/'state/integrated-methods-dispatches.jsonl').open('a') as f:f.write(json.dumps({'type':'both_exact_finals_nativecomplete_quiet_pair_frozen','case':case,'version':version,'record_at':now,'path':str(p),'source_quality':None})+'\n')
print(json.dumps({'path':str(p),'both_finals_frozen':True,'all_tasks_quiet':True}))
