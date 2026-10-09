#!/usr/bin/env python3
"""ER11 metadata arithmetic. Distinct actor intervals are additive, never unioned."""
import json,csv,datetime,hashlib
from pathlib import Path
R=Path(__file__).resolve().parents[1]; OUT=R/'accounting/v2'; OUT.mkdir(exist_ok=True)
now=datetime.datetime.now(datetime.timezone.utc)
def read(p):
    return json.loads(p.read_text()) if p.exists() else {}
def dt(v):
    return datetime.datetime.fromisoformat(v.replace('Z','+00:00')) if isinstance(v,str) else None
def delta(a,b):
    return round((b-a).total_seconds(),3) if a is not None and b is not None else None
def stamp(p):
    return datetime.datetime.fromtimestamp(p.stat().st_mtime,datetime.timezone.utc) if p.exists() else None
native={}; native_history={}; bridge={}
for line in (R/'control/native-observations.jsonl').read_text().splitlines():
    v=json.loads(line);native[v.get('task_id')]=v;native_history.setdefault(v.get('task_id'),[]).append(v)
for line in (R/'control/glm-integration-observations.jsonl').read_text().splitlines():
    v=json.loads(line)
    for ref in v.get('matched_assignment_refs',[]):bridge[str(Path(ref).parent)]=v
allruns={}
known_paths=list((R/'jobs').glob('*/*/*/host-runs.json'))+list((R/'evaluations').glob('*/host-runs.json'))+list((R/'qualification').glob('*/host-runs.json'))+list((R/'helpers').glob('*/host-runs.json'))
for p in known_paths:
    for run in read(p).get('recentRuns',[]):allruns[run['runId']]=run
def stage(p):
    d=read(p/'dispatch.json'); result=read(p/'task-result.json');h=read(p/'host-runs.json')
    runs=h.get('recentRuns',[]); run=next((v for v in runs if v['runId']==d.get('childRunId')),None)
    n=native.get(d.get('taskId'),{}); history=native_history.get(d.get('taskId'),[]); gs=[x.get('goal') for x in history if x.get('goal')]; z=bridge.get(str(p),{}).get('actual_bridge_state',{})
    end=dt(run.get('completedAt')) if run else None
    start=dt(run.get('startedAt')) if run else None
    deadline=dt(read(p/'freeze.json').get('deadline'))
    return {'requested_target':d.get('target'),'effective_host_provider':run.get('providerInstanceId') if run else None,'effective_host_model':run.get('model') if run else None,'path':str(p.relative_to(R)), 'task_id':d.get('taskId'), 'terminal_status':result.get('status'),
      'run_id':run.get('runId') if run else None,'started_at':start.isoformat() if start else None,
      'completed_at':end.isoformat() if end else None,'occupied_s':delta(start,end),
      'occupied_so_far_s':delta(start,end or now), 'accepted_queue_s':delta(dt(run.get('requestedAt')) if run else None,start), 'host_request_to_start_s':delta(dt(run.get('requestedAt')) if run else None,start), 'tool_return_after_host_start_s':delta(start,dt(d.get('acceptedAt'))),
      'native_status':(n.get('goal') or {}).get('status') or z.get('status') or 'UNKNOWN',
      'native_goal_cumulative':(n.get('goal') or {}), 'native_terminal_exact_time':None,'native_activation_observed':any(x.get('status')=='active' for x in gs) if gs else None,'native_complete_observed':any(x.get('status')=='complete' for x in gs) if gs else None,'installed_integration_status':z.get('status'),'effective_selected_configuration':read(p/'effective-configuration.json') or None,
      'deadline':deadline.isoformat() if deadline else None, 'delivery_within_stage_deadline':end<=deadline if end and deadline else None,
      'observed_host_context_usage':n.get('context_usage'), 'usage_scope':'Supported host provider context snapshot; cumulative/session billing semantics not established. Do not sum snapshots or overlap cached/reasoning subsets.', 'input_tokens':(n.get('context_usage') or {}).get('inputTokens'),'cached_input_subset':(n.get('context_usage') or {}).get('cachedInputTokens'),'output_tokens':(n.get('context_usage') or {}).get('outputTokens'),'reasoning_output_subset':(n.get('context_usage') or {}).get('reasoningOutputTokens'),'billing':None}
q=read(R/'control/queue.json');state=read(R/'control/state.json');rows=[]
for b in q:
    ev=R/'evaluations'/b['block_id']; es=stage(ev) if (ev/'dispatch.json').exists() else {}
    assessment=read(ev/'assessment.json') if (ev/'task-result.json').exists() else {}
    for arm in ['control','treatment']:
        key=b['block_id']+'/'+arm; s=state['arms'].get(key,{})
        stages=[stage(p.parent) for p in sorted((R/'jobs'/key).glob('*/dispatch.json'))]
        finalstage='research' if b['method'] in ['M05','M13','M14'] and arm=='treatment' else 'critic-finalizer' if b['method']=='M03' and arm=='treatment' else 'reviser'
        fp=R/'jobs'/key/finalstage/'final.md';mp=fp.parent/'source-map.json'
        fs=next((x for x in stages if x['path'].endswith('/'+finalstage)),{})
        end=dt(fs.get('completed_at'));start=dt(s.get('requested_at'));cut=dt(s.get('deadline'))
        saves=[stamp(fp),stamp(mp)];saved=max(saves) if all(saves) else None
        authored=next((v for v in assessment.get('arms',{}).values() if v.get('actual_arm')==arm),{})
        delivered=bool(saved and fs.get('terminal_status')=='completed')
        complete_intervals=all(x['occupied_s'] is not None for x in stages) and bool(stages)
        occupied=sum(x['occupied_s'] for x in stages) if complete_intervals else None
        evalend=dt(es.get('completed_at'));qualified=delivered and str(authored.get('grade','')).startswith('PASS')
        rows.append({'block':b['block_id'],'phase':b['phase'],'method':b['method'],'method_version':b.get('method_version','v1'),'case':b['case'],'route':b['route'],'provider_role_overrides':json.dumps(b.get('stage_routes',{}),sort_keys=True),'arm':arm,
         'status':s.get('status','UNSTARTED'),'final_delivered':delivered,'grade':authored.get('grade'),
         'requested_at':s.get('requested_at'),'deadline':s.get('deadline'),'final_files_saved_at':saved.isoformat() if saved else None,'delivered_at':end.isoformat() if end else None,
         'candidate_delivery_s':delta(start,end) if delivered else None,'science_last_save_s':delta(start,saved),
         'delivery_within_whole_deadline':end<=cut if end and cut else None,'science_saved_within_whole_deadline':saved<=cut if saved and cut else None,
         'occupied_agent_s':occupied,'occupied_agent_so_far_s':sum(x['occupied_so_far_s'] or 0 for x in stages),'occupied_within_90min':occupied<=5400 if occupied is not None else None,
         'qualified_result_s':delta(start,evalend) if qualified else None,'assessment_delivery_at':es.get('completed_at'),
         'assessment_occupied_s':es.get('occupied_s'),'final_output_bytes':fp.stat().st_size if fp.exists() else None,
         'source_map_bytes':mp.stat().st_size if mp.exists() else None,'stages':stages,
         'experiment_slot_wait_s':None,'shared_cold_setup_allocation_s':None,'source_operation_count':None,'billing':None})
pairs=[]
for b in q:
    c,t=[next(x for x in rows if x['block']==b['block_id'] and x['arm']==a) for a in ['control','treatment']]
    both=all(x['final_delivered'] and str(x['grade'] or '').startswith('PASS') for x in [c,t])
    pairs.append({'block':b['block_id'],'both_source_pass':both,'descriptive_delivery_saving_fraction':round(1-t['candidate_delivery_s']/c['candidate_delivery_s'],6) if both and c['candidate_delivery_s'] and t['candidate_delivery_s'] else None,
      'occupied_change_fraction':round(t['occupied_agent_s']/c['occupied_agent_s']-1,6) if both and c['occupied_agent_s'] and t['occupied_agent_s'] else None,
      'strict_time_eligible':both and all(x['delivery_within_whole_deadline'] and x['occupied_within_90min'] and all(y['delivery_within_stage_deadline'] for y in x['stages']) for x in [c,t]),
      'protocol_eligibility':'UNKNOWN: native activation/terminal, predecessor freeze, effective settings and original invalid dispositions require linked separate qualification; source grades do not establish these.'})
extra=read(R/'control/OWNERSHIP.json').get('extra_owned_threads',[])
extra_s=sum(delta(dt(x.get('host_run',{}).get('started_at')),dt(x.get('host_run',{}).get('completed_at'))) or 0 for x in extra)
elapsed=extra_s; active=0
for v in allruns.values():
    start=dt(v.get('startedAt'));end=dt(v.get('completedAt'))
    if start:
        elapsed+=((end or now)-start).total_seconds()
        active+=not bool(end)
dispatched=list((R/'jobs').glob('*/*/*/dispatch.json'))+list((R/'evaluations').glob('*/dispatch.json'))
missing_host=[str(p.parent.relative_to(R)) for p in dispatched if not (p.parent/'host-runs.json').exists()]
result={'missing_host_run_paths':missing_host,'extra_owned_contexts':extra,'extra_owned_context_occupied_s':extra_s,'occupied_total_is_partial':True,'snapshot_at':now.isoformat(),'original_logical_rows':80,'started_rows':sum(x['requested_at'] is not None for x in rows),
 'rows':rows,'pairs':pairs,'experiment_observed_distinct_runs':len(allruns),'experiment_additive_occupied_agent_s_so_far':round(elapsed,3),'experiment_runs_without_terminal_time':active,
 'limits':['Artifact mtime is last saved complete final/map, not first complete bytes. Delivery uses actual host terminal timestamp, not root poll time.','Additive occupied intervals include retained-author wait; parallel actors each charged. Missing host runs leave arm total null. Shared paired evaluation charged once in experiment, never twice.','Native cumulative Goal counters kept per session, never summed with overlapping token/usage fields. Billing/subscription and campaign token totals unavailable. Provider host context snapshots expose input/cache/output/reasoning fields where present; their accumulation semantics are unqualified and they are never summed or called billable session totals.','Host queue uses supported run requestedAt to startedAt; acceptedAt in dispatch is tool-return observation and can follow native start, reported separately. Candidate clocks start at frozen arm setup before accepted dispatch; queue and root handoff delays included. Source acquisition within arms charged. Campaign/bootstrap/case design is experiment overhead, not free or an invented per-arm cold setup allocation.','Stage deadlines measured at host terminal; last-science timestamps can independently be earlier. Native exact completion timestamp unknown. Strict method/native qualification remains separate.','All 80 original cells retained, including unstarted and failures; savings shown only for both-source-PASS delivery pairs with failure-inclusive rows alongside. No confidence/reliability/affordability claim from descriptive ratios.']}
(OUT/'TIMING.json').write_text(json.dumps(result,indent=2)+'\n')
with (OUT/'ARMS_TIMING.csv').open('w') as f:
    flat=[{k:v for k,v in x.items() if k!='stages'} for x in rows];w=csv.DictWriter(f,fieldnames=list(flat[0]),lineterminator="\n");w.writeheader();w.writerows(flat)
print(json.dumps({k:v for k,v in result.items() if k not in ['rows','pairs','limits']}));print(json.dumps([x for x in pairs if x['both_source_pass']]))
