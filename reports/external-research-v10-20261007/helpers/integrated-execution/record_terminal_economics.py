import pathlib,json,datetime,sys,os
B=pathlib.Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5');case=sys.argv[1];s=json.loads((B/'state/integrated-methods.json').read_text());now=datetime.datetime.now(datetime.timezone.utc).isoformat();out={'schema':'er10.terminal.economics.annotation.v1','case':case,'record_at':now,'scope':'mechanical actual timing/cost support, no source-quality or speed inference','arms':{},'all_failed_costs_retained':True,'no_cumulative_counter_sum':True}
def dt(x):return datetime.datetime.fromisoformat(x.replace('Z','+00:00'))
for arm,row in s['cases'][case]['arms'].items():
 stages=[];occupied=0
 for role,st in row['stages'].items():
  f=pathlib.Path(st['directory'])/'frozen-delivery.json'
  if not f.exists():continue
  d=json.loads(f.read_text());r=d['t3_run'];duration=(dt(r['completedAt'])-dt(r['requestedAt'])).total_seconds();occupied+=duration
  stages.append({'role':role,'actual_requestedAt':r['requestedAt'],'actual_startedAt':r['startedAt'],'T3_terminalAt':r['completedAt'],'T3_status':r['status'],'host_releaseAt':d['record_at'],'dispatch_to_T3_terminal_seconds':duration,'queue_service_start_seconds':(dt(r['startedAt'])-dt(r['requestedAt'])).total_seconds() if r['startedAt'] else None,'native_identity':st.get('native_goal_identity'),'native_terminal':st.get('native_terminal'),'native_aggregate_tokens':d.get('native_goal_aggregate_tokens'),'native_elapsed_counter_seconds':d.get('native_elapsed_seconds'),'distinct_input_cache_generated_reasoning_billing':d.get('distinct_counters'),'exact_freeze':str(f),'source_operations_support':str(f.parent/'source-map.json') if (f.parent/'source-map.json').exists() else None,'output_and_evidence_bytes':sum(v['bytes'] for v in d['files'].values()),'host_capture_seconds':st.get('host_capture_elapsed_seconds'),'first_finding_latency':None,'native_terminal_exact_epoch':None})
 starts=[dt(x['actual_requestedAt']) for x in stages];ends=[dt(x['T3_terminalAt']) for x in stages];releases=[dt(x['host_releaseAt']) for x in stages]
 out['arms'][arm]={'stages':stages,'aggregate_nonoverlapping_stage_occupied_seconds':occupied,'dispatch_to_last_T3_terminal_seconds':(max(ends)-min(starts)).total_seconds() if starts else None,'dispatch_to_last_host_release_seconds':(max(releases)-min(starts)).total_seconds() if starts else None,'source_correct_usable_latency':None,'source_quality':None,'native_counter_sum':None,'billing':None,'host_setup_cost':None,'cold_and_amortized_helper_cost':None,'cost_limits':'Unsupported values unknown, never zero. All original failed stages included. Exact source maps and passive capture records retained.'}
p=B/'helpers/integrated-execution'/(case.lower()+'-terminal-economics-v1.json');assert not p.exists();p.write_text(json.dumps(out,indent=2)+'\n');os.chmod(p,0o444);s['cases'][case]['economic_annotation']=str(p);s['updated_at']=now;(B/'state/integrated-methods.json').write_text(json.dumps(s,indent=2)+'\n')
cp=B/'helpers/integrated-execution/COMPARISONS.json';c=json.loads(cp.read_text())
for row in c['cases']:
 if row['case_id']==case:row['economics']=out['arms'];row['economic_annotation']=str(p)
cp.write_text(json.dumps(c,indent=2)+'\n');print(json.dumps({'path':str(p),'occupied_seconds':{a:r['aggregate_nonoverlapping_stage_occupied_seconds'] for a,r in out['arms'].items()}}))
