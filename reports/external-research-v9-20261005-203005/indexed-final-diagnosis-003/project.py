"""Single-job structural projection; never emit candidate prose or artifact values."""
import ast,hashlib,json,pathlib,datetime
L=pathlib.Path('/home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005')
D=pathlib.Path(__file__).resolve().parent
JOB='C-01-OWN-PRIOR-INDEX-FINAL-R001-treatment-revision-a001'
S=L/'ops/dispatcher/INDEXED_FINAL_003_STRUCTURAL_SELECTOR.json'
def sha(b):return hashlib.sha256(b).hexdigest()
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
def read(p):return json.loads(pathlib.Path(p).read_bytes())
def put(n,o):(D/n).write_text(json.dumps(o,indent=2,sort_keys=True)+'\n')
s=read(S);assert s['job_id']==JOB
refs={};checks=[]
for k,v in s['files'].items():
 actual=pin(v['path']);assert actual['sha256']==v['sha256'];refs[k]=actual
for k in ('Task_ref','index_ref','source_pin','source_role_birth_binding'):
 v=s[k];actual=pin(v['path']);assert actual['sha256']==v['sha256'];refs[k]=actual
run=pathlib.Path(s['run_root']);stage=read(run/'stage.json');rec=read(run/'native/receipt.json');session=read(run/'native/final-session.redacted.json');rb=read(run/'RESOURCE_BINDING.json')
locator=pathlib.Path(stage['own_prior_locator_ref']['path']);tree=ast.parse(locator.read_text());fragment=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='FRAGMENT' for t in n.targets));fragment=fragment.encode() if isinstance(fragment,str) else fragment
refs['locator_source']=pin(locator);assert refs['locator_source']['sha256']==stage['own_prior_locator_ref']['sha256']
task=pathlib.Path(s['Task_ref']['path']).read_bytes();normalized=task.removeprefix(b'/goal\n').strip();target=session['session'].get('target') or {};objective=target.get('objective');objective_bytes=objective.encode() if isinstance(objective,str) else None
exposure={'raw_Task_sha256':sha(task),'receipt_raw_matches':sha(task)==rec['raw_prompt_sha256'],'normalized_Task_sha256':sha(normalized),'receipt_normalized_matches':sha(normalized)==rec['prompt_sha256'],'neutral_locator_sha256':sha(fragment),'neutral_locator_Task_occurrences':task.count(fragment),'saved_Goal_object_objective_sha256':sha(objective_bytes) if objective_bytes else None,'saved_Goal_object_objective_matches_normalized_Task':objective_bytes==normalized,'outgoing_goal_set_payload_sha256':'UNKNOWN: not separately projected in this bounded receipt'}
index=read(s['index_ref']['path']);files=index['files'];paths={r['path'] for r in files};birth=read(s['source_role_birth_binding']['path']);assert birth['index_ref']['sha256']==refs['index_ref']['sha256']
models=[json.loads(x) for x in (run/'native/model-io.redacted.jsonl').read_text().splitlines()];calls=[];writer=None;forwarded=[]
for li,row in enumerate(models,1):
 for ti,t in enumerate((row.get('response') or {}).get('toolCalls') or []):
  name=t.get('name');a=t.get('input') or {};p=a.get('path')
  if name in ('mcp__pm_boundary__read_file','mcp__pm_boundary__write_file','mcp__pm_boundary__public_https_get'):
   c={'line':li,'selector':f'/response/toolCalls/{ti}','id':t.get('id'),'name':name,'path':p if name.endswith(('read_file','write_file')) else None};calls.append(c)
   if name.endswith('write_file'):writer=(c,a)
 for mi,m in enumerate((((row.get('request') or {}).get('body') or {}).get('messages') or [])):
  content=m.get('content')
  if isinstance(content,list):
   for ci,part in enumerate(content):
    if isinstance(part,dict) and part.get('type')=='tool_result' and part.get('tool_use_id')=='call_399f48b9a275445999b054d5':forwarded.append({'line':li,'selector':f'/request/body/messages/{mi}/content/{ci}','type':'tool_result','tool_use_id':part['tool_use_id'],'is_error':part.get('is_error')})
events=[json.loads(x) for x in (run/'operation_receipts/events.jsonl').read_text().splitlines()]
# Exact known source event keys only; no argument values except fixed control paths.
event_projection=[]
for li,e in enumerate(events,1):
 event_projection.append({'line':li,**{k:e.get(k) for k in ('event','phase','tool','tool_name','operation_id','argument_sha256','is_error','utc','source_sha256','source_bytes','source_range_bytes','source_range_sha256','delivery_truncated','line_start','line_end') if k in e}})
ws={};known={'schema','stage_id','adopt_current','artifacts'};names=('proposal.md','sources.json','witnesses.json','leads.json')
if writer:
 c,a=writer;text=a.get('text');ws={'call':c,'argument_top_keys':sorted(set(a)&{'path','text'}),'argument_unknown_key_count':len(set(a)-{'path','text'}),'text_type':type(text).__name__,'text_utf8_bytes':len(text.encode()) if isinstance(text,str) else None,'fixed_bundle_path_matches':a.get('path')=='out/final_bundle.json','json_parse':'UNKNOWN','error_class':'UNEXPOSED','unique_validator_rejection':'UNKNOWN'}
 try:b=json.loads(text);ws.update(json_parse='PASS',top_known_keys=sorted(set(b)&known),top_unknown_key_count=len(set(b)-known),schema_discriminator_matches=b.get('schema')=='er9.native_endorsed_delivery.v1',stage_id_matches_current=b.get('stage_id')==JOB,adopt_current_true=b.get('adopt_current') is True,artifact_slot_names_exact=set(b.get('artifacts') or {})==set(names),slots={})
 except (ValueError,TypeError):b=None
 if isinstance(b,dict):
  for n in names:
   v=b['artifacts'].get(n);d={'type':type(v).__name__}
   if isinstance(v,dict):d.update(known_keys=sorted(set(v)&{'text_utf8','input_id'}),unknown_key_count=len(set(v)-{'text_utf8','input_id'}),value_types={k:type(v[k]).__name__ for k in ('text_utf8','input_id') if k in v},text_utf8_bytes=len(v['text_utf8'].encode()) if isinstance(v.get('text_utf8'),str) else None)
   ws['slots'][n]=d
 for mi,m in enumerate(session['messages']):
  for pi,p in enumerate(m['parts']):
   if p.get('callId')==c['id']:
    state=p.get('state') or {};out=state.get('output');ws['saved_tool_part_selector']=f'/messages/{mi}/parts/{pi}';ws['saved_tool_state_status']=state.get('status');ws['saved_output_utf8_bytes']=len(out.encode()) if isinstance(out,str) else None
    candidates=[]
    if isinstance(out,str):
     candidates=[out]
     try:o=json.loads(out);candidates += [x.get('text') for x in o.get('content',[]) if isinstance(x,dict) and x.get('type')=='text']
     except (ValueError,AttributeError):pass
    matches={cl for cl in ('ValueError','TypeError','FileExistsError','FileNotFoundError','PermissionError','OSError','UnicodeDecodeError','JSONDecodeError') if any(isinstance(x,str) and ('boundary failure: '+cl) in x for x in candidates)}
    if len(matches)==1:ws['error_class']=next(iter(matches))
refs['writer_handler']=pin(L/'dev/tools/versions/v1.5-clock-telemetry/source_capture/tool_server.py');refs['bundle_validator']=pin(L/'dev/tools/versions/v1.5-clock-telemetry/bundle_carrier.py')
status={k:target.get(k) for k in ('targetId','sessionId','status','createdAt','updatedAt','activeInputId','activeRunStartedAtMs')};status.update(source=refs['native/final-session.redacted.json'],selector='/session/target',router_status=rec['status'],physical_native_start_end_utc='UNEXPOSED; controller observation timestamps are separate')
clock={k:rb[k] for k in ('original_birth_monotonic_ns','original_stage_allocation_seconds','native_stop_monotonic_ns','guard_stop_monotonic_ns','original_total_stop_monotonic_ns')};birth_ns=clock['original_birth_monotonic_ns'];assert clock['native_stop_monotonic_ns']-birth_ns==570_000_000_000;assert clock['original_total_stop_monotonic_ns']-birth_ns==600_000_000_000
report={'schema':'er9.indexed-final-structural-diagnosis.v1','job_id':JOB,'scope':'one terminal stage, metadata only','native_or_model_calls_by_engineer':0,'Task_Goal_locator_exposure':exposure,'index':{**refs['index_ref'],'entries':len(files),'before_goal_receipt_asserted':birth['index_ref'].get('captured_before_goal'),'source_receipt':refs['source_role_birth_binding']},'formal_tools':calls,'index_tool_result_forwarding':forwarded,'source_event_control_projection':event_projection,'original_clock':clock,'router_status':rec['status'],'elapsed_seconds':rec['elapsed_seconds'],'owned_components_quiet':rec['resource_components_quiet'],'OOM_observed':rec['resource_oom_observed'],'conclusions':{'index_applied_and_operationally_used':True,'index_full_range_success':'source indexed read returned all13963bytes, no truncation; eight later exact listed paths read successfully','read_file_dispatches':10,'read_file_source_errors':0,'writer_dispatches':1,'writer_source_is_error':True,'intentional_INLINE_ONLY':'four current literal text_utf8 selectors; empty adoption manifest is not missing ancestry','specific_writer_rejection':ws['unique_validator_rejection'],'causality':'UNKNOWN; no semantic evaluation, no proved source fault, no repair/replay/retry recommended'},'disclosure':'A preliminary print mistakenly emitted the entire saved session.target including objective. This is preserved as a boundary disclosure; Context exposure occurred; efficacy of ignoring the exposed scientific content is UNASSESSED. It will not be copied into public reports or any candidate/engineering prompt, nor used for semantic repair or grading. All frozen outputs use exact metadata allowlists only.'}
put('DIAGNOSIS.json',report);put('NATIVE_GOAL_STATUS.json',status);put('WRITER_STRUCTURE.json',ws);put('SOURCE_REFS.json',refs)
put('VERIFICATION.json',{'result':'PASS','source_pin_checks':len(refs),'checks':['exact one job selector SHA joins','Task/hash and exact neutral fragment only','saved Goal objective hashed only','index before-Goal pin and length join','writer outer/schema/slot types and lengths only','explicit original action570 and cleanup600','no candidate prose/artifact/evaluator export'],'semantic_content':'UNOBSERVED','no_tests_or_probes_with_models':True})
