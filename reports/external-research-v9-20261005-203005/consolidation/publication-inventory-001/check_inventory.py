#!/usr/bin/env python3
import pathlib,json,hashlib,collections,datetime
D=pathlib.Path(__file__).parent
raw=(D/'ARM_INVENTORY.json').read_bytes();d=json.loads(raw);pins=d['pin_table'];stages={s['job_id']:s for s in d['stages']};rows=d['current_selected_arms'];checks={}
checks['logical_arm_count_96']=len(rows)==96
checks['target_counts_64_24_8']=dict(collections.Counter(r['track'] for r in rows))=={'targeted':64,'fresh_integrated':24,'confirmation':8}
checks['unique_logical_pair_arm_rows']=len({(r['track'],r['pair'],r['arm']) for r in rows})==96
checks['all_48_pairs_have_both_arms']=all(v=={'control','treatment'} for v in {p:{r['arm'] for r in rows if r['pair']==p} for p in {r['pair'] for r in rows}}.values())
checks['all_selected_arms_have_exact_stage_refs']=all(r['stage_ids'] and all(j in stages for j in r['stage_ids']) for r in rows)
checks['all_required_outputs_have_explicit_state']=all(s['required_outputs'] and all(o.get('state') for o in s['required_outputs']) for s in stages.values())
checks['unique_stage_definition_ids']=len(stages)==len(d['stages'])
checks['no_new_logical_credit_for_retained_history']=all(r['current_fresh_or_confirmation_credit']==0 for r in d['retained_history_arms'])
checks['campaign_not_closed']=d['campaign_finished'] is False
checks['snapshot_non_atomic']=d['snapshot_not_atomic'] is True
checks['physical_provider_and_billing_not_inferred']=all(s['physical_provider']=='UNKNOWN' and s['billing_account']=='UNKNOWN' for s in stages.values())
checks['corrected_generator_opaque_luna_result']= "rp.is_file() and rp.name=='receipt.json'" in (D/'build_inventory.py').read_text()
refs=[];forbidden=[]
def walk(v):
 if isinstance(v,dict):
  if 'pin_ref' in v:refs.append(v['pin_ref'])
  for k,x in v.items():
   if k in {'actual_inference_tool_payload','native_io','raw_native_output','api_key','access_token','auth','objective','config','catalog','private_key'}:forbidden.append(k)
   walk(x)
 elif isinstance(v,list):
  for x in v:walk(x)
walk(d)
checks['all_interned_pins_resolve']=all(r in pins for r in refs)
checks['no_forbidden_body_field_export']=not forbidden
mismatches=[{'pin_ref':k,'path':p['path'],'expected_sha256':p.get('expected_sha256'),'observed_sha256':p['sha256']} for k,p in pins.items() if p.get('expected_hash_matches') is False]
checks['all_declared_pins_match_observed_bytes']=not mismatches
races=[]
for p in d['source_captures']:
 path=pathlib.Path(p['path']);h=hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else 'MISSING'
 if h!=p['sha256']:races.append({'path':str(path),'captured_sha256':p['sha256'],'later_sha256':h,'qualification':'NOT_ATOMIC; captured view remains dated, no stage/clock promotion'})
out={'schema':'er9.publication-inventory-checks.v1','checked_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inventory_sha256':hashlib.sha256(raw).hexdigest(),'checks':checks,'deterministic_pass':all(checks.values()),'pin_mismatches':mismatches,'mutable_source_changes_after_capture':races,'counts':{'logical_arms':len(rows),'pairs':len({r['pair'] for r in rows}),'current_stage_refs':sum(len(r['stage_ids']) for r in rows),'unique_stage_definitions':len(stages),'retained_history_stage_refs':sum(len(r['stage_ids']) for r in d['retained_history_arms']),'pins':len(pins),'resolved_pin_references':len(refs)},'limits':'Metadata/source-scope checks only; no scientific body, output correctness, candidate grade, native COMPLETE, campaign completion, or publication completeness assessment.'}
(D/'CHECKS.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n'); print(json.dumps({'deterministic_pass':out['deterministic_pass'],'pin_mismatches':len(mismatches),'mutable_sources_changed':len(races),'counts':out['counts']}))
