"""Prospective C04 paired native serialization repair, source-only constructors."""
import copy,importlib.util,json,sys
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT.parent))
import prepare_successors as p
LAB=p.LAB
META={'path':str(LAB/'ops/dispatcher/C04_NATIVE_CATALOG_REPAIR_DONOR_METADATA_001/SELECTION.json'),'sha256':'38eba8885d574468aacbbb655159cc7f440f1ab0027aa07addc4096ce1bf4611'}
COURIER={'path':str(LAB/'ops/dispatcher/COURIER_REMAINING_CURRENT_RESEARCH_UNITS_001.json'),'sha256':'b0ae4b6948ad2c83f1659dc4559911500901599ab767a986a240981df3e331c9'}
FRONTIER={'path':str(LAB/'ops/dispatcher/C04_T_RESEARCH_FAILED_PARENT_STRUCTURAL_FRONTIER_001.json'),'sha256':'07ac518a85f6cb4224606f2843ec0a3893788ef76a28f7956fc437dcac4989df'}
NORMALIZER={'path':str(ROOT.parent/'proof-model-normalizer-001/SOURCE_PIN.json'),'sha256':'04f37c0074e2f98fd1754ef640461e928f2c8be25295f92f035f13d3e1dfa803'}
PINS=[{'path':str(LAB/'dev/execution/glm-resource-v1/versions'/name/'PIN.json'),'sha256':sha} for name,sha in [('readiness-failfast-core-v1','42107a409938af375d9f8d66a759a5ef51b5fd2fd90dc0d3197bde44be593450'),('readiness-failfast-bundle-v1','ac8c325209966762b0facc70f9ca41ac14d14b9a627ae00412ab87ba22b33763')]]
MARKERS=[{'path':str(LAB/'ops/dispatcher/GLM_READINESS_V1_READY.json'),'sha256':'c08fd98a38a8e26df5e7ace11c460c6ce7ee00413ab3b1ea85b5702540ae480c'},{'path':str(LAB/'ops/dispatcher/GLM_BUNDLE_READINESS_V1_READY.json'),'sha256':'812a7161cdc3c330eeb65301548e1c6a651f09365d2f07a2cc2cc8f82f48ae5e'}]
PAIR='C-04-NATIVE-CATALOG-REPAIR-R001'
NAMES={'proposal.md','sources.json','leads.json','witnesses.json'}

def module(name,path):
 sp=importlib.util.spec_from_file_location('catalog_'+name,path);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m

def donors():
 meta=p.checked(META);capsules=p.checked(meta['capsule_ref']);unit=next(u for u in p.checked(COURIER)['units'] if u['pair_id']=='C-04-CONFIRMATION-CLOCK-FRESH-R001')
 if len(unit['rows'])!=2 or {r['arm'] for r in unit['rows']}!={'control','treatment'}:raise ValueError('Exact current same-pair two donors required')
 normal=module('normalizer',ROOT.parent/'proof-model-normalizer-001/normalizer.py');p.checked(NORMALIZER)
 if p.checked(meta['all_terminal_ref']).get('C04_current_all5_roles_terminal') is not True:raise ValueError('All original current C04 stages terminal required')
 contexts={p.checked(ref)['job_id']:(ref,p.checked(ref)) for ref in meta['closed_context_refs']};result=[]
 for row in unit['rows']:
  freeze=p.checked(row['freeze_ref']);release=p.checked(row['release_ref']);stage=p.checked(row['actual_stage_ref']);actual=[x for x in capsules['rows'] if x['job_id']==row['job_id']]
  if len(actual)!=1:raise ValueError('Unique direct native donor capsule')
  a=actual[0]
  if any(a[k]!=row[k] or freeze[k]!=row[k] or stage[k]!=row[k] for k in ['job_id','pair_id','arm','stage']):raise ValueError('Exact donor identity join')
  if a['output_freeze']!=row['freeze_ref'] or a['native_goal_starts']!=1 or freeze.get('native_goal_starts')!=1 or a.get('origin_goal_id')!=freeze.get('goal_target_id') or not a.get('origin_goal_id'):raise ValueError('Actual distinct native Goal and freeze join')
  if a.get('observed_family')!='Z' or normal.observed_model(a.get('observed_model'))!='builtin:zai-coding-plan/GLM-5.3-Flash' or a.get('observed_effort')!='max':raise ValueError('Actual native actor tuple required')
  if freeze.get('native_quiescent') is not True or release.get('all_private_slice_descendants_quiet') is not True or release.get('stop_returncode')!=0 or release.get('after',{}).get('ActiveState') not in {'inactive','failed'}:raise ValueError('Positive exact donor quiet release required')
  if row['arm']=='control' and (a['native_goal_state']!='complete' or freeze.get('operational_complete') is not True):raise ValueError('Control current complete donor required')
  if row['arm']=='treatment' and (row['freeze_ref']!=p.checked(FRONTIER)['freeze_ref'] or a['native_goal_state']!='paused' or freeze.get('operational_complete') is not False):raise ValueError('Exact failed treatment donor must remain failed')
  inventory={x['relative_path']:x for x in freeze['artifacts']};required=['research/'+name for name in sorted(NAMES)]
  if any(n not in inventory or inventory[n]['bytes']<=0 for n in required):raise ValueError('Authored fullR4 required, existence alone never complete')
  contextref,context=contexts[row['job_id']]
  if context.get('arm')!=row['arm'] or context.get('output_freeze')!=row['freeze_ref'] or context.get('owned_quiet_positive') is not True or context.get('native_model_io_or_candidate_semantics_included') is not False:raise ValueError('Exact original owned capture closure required')
  result.append({'source':row,'capsule_ref':meta['capsule_ref'],'actual_goal_id':a['origin_goal_id'],'native_goal_state':a['native_goal_state'],
   'operational_complete':freeze['operational_complete'],'required_research4':[inventory[n] for n in required],'closed_context_ref':contextref,
   'role':'EXACT_CURRENT_AUTHORED_DONOR_ONLY; failed T is not strict completed predecessor'})
 return result

def repair_suffix(job):
 return (f'\n\n## Prospective native catalog serialization-only role\nThis NEW native stage_id is {job}; total allocation600 seconds, action570 seconds. '
 'The earlier scientific Task prefix and briefs/criteria/method remain the immutable original research specification. This added role is exclusively a mechanical native serialization repair of your own current authored research4, not a research rerun. '
 'Read inputs/original_research/proposal.md, sources.json, leads.json and witnesses.json with the existing read_file tool. '
 'Emit out/research/proposal.md, sources.json, leads.json and witnesses.json using the existing native writer/execute tools. '
 'Preserve proposal.md, leads.json and witnesses.json EXACT byte for byte. If sources.json already parses as strict JSON, preserve its EXACT bytes too. '
 'For malformed sources.json, only a uniquely valid single comma or colon insertion/deletion is eligible; preserve every quoted string/escape, numeric/literal lexeme, token order and all braces/brackets exactly. Whitespace serialization may vary only for this malformed catalog. '
 'Do not change any claim, identifier, URL, order, catalog entry or scientific content; do not consult new sources, the other arm, evaluator material or failed downstream outputs. Do not infer scientific correctness from JSON parsing. '
 'If preservation is ambiguous or requires any other change, stop with an honest unassessed failure; do not invent a repair. The operator gate accepts no host correction or file-existence fallback. '
 'Use existing execute tools for exact native file copying if helpful; no extra tools, subprocess Goal, extra time or old deadline reset is authorized. '
 'Both arms receive this same rule, with the same600 allocation. Prior failures and costs remain cumulative; no clean confirmation or new logical target credit.\n').encode()

def continuation_suffix(job,origins):
 return (f'\n\n## Prospective repaired diagnostic ancestry identity\nThe current native stage_id is {job}. Earlier inherited stage_id/input role labels are superseded ONLY by these authenticated same-arm current parents: '+', '.join(origins)+'. '
 'The exact imported files are listed at inputs/prior_file_index.json and available with the existing mcp__pm_boundary__read_file. '
 'Proceed only after BOTH paired mechanical catalog repair Goals are COMPLETE with fullR4, positive quiet/release and the fixed serialization gate PASS. '
 'This is a repaired diagnostic continuation with cumulative costs, not a clean confirmation or restored source-semantics claim. '
 'Original briefs, criteria, source-access exclusions, method duties, combined-versus-separate topology, artifact obligations, empty INLINE_ONLY native adoption where originally declared, model/tool schemas and this role allocation remain authoritative. '
 'Use the existing actual mcp__pm_boundary__write_file(path,text) writer. No host fallback, extra Goal or time.\n').encode()

def resource_definition(index):
 pin=p.checked(PINS[index]);directory=Path(PINS[index]['path']).parent;p.checked(MARKERS[index])
 return {'schema':'er9.glm.complete-resource-definition.v1','version':pin['version'],'source_pin':PINS[index],'resource_contract':p.ref(directory/'RESOURCE_CONTRACT.json'),'aggregate_memory_max_bytes':2415919104,'memory_swap_max_bytes':0,'declared_complete_bound_kb':2359296,'fit':'UNKNOWN'}

def prepare():
 donor=donors();registration=p.checked(donor[0]['source']['owner_registration_ref']);cardref=donor[0]['source']['card_ref'];card=p.checked(cardref)
 p.put(ROOT/'TOPOLOGY_CORRECTION.json',{'schema':'er9.root-task-topology-correction.v1','correction':'Parent inaccurate C900/F600 perarm phrase corrected additively: original C900→F600; Tcombined1500 preserved','original_task_overwritten':False,'repair600_both_arms':True,'new_total_allocation_per_arm':2100,'old_costs_cumulative':True,'native_allocation_authorized':False})
 rows=[];closures=[];donorby={r['source']['arm']:r for r in donor};mapping={}
 for arm in ['control','treatment']:
  oldrows=[r for r in registration['stage_jobs'] if r['arm']==arm]
  for row in oldrows:
   role=row['stage'];job=PAIR+'-'+arm+'-'+('catalog-repair' if role=='research' else role)+'-a001';mapping[row['job_id']]=job
 for arm in ['control','treatment']:
  for row in [x for x in registration['stage_jobs'] if x['arm']==arm]:
   oldref={'path':row['stage_json'],'sha256':row['stage_sha256']};old=p.checked(oldref);B=old['complete_final_owner_role'];pin=p.checked(PINS[int(B)]);runtime=Path(PINS[int(B)]['path']).parent
   fragment=module('fragment_'+arm+row['stage'],runtime/'task_fragment.py');job=mapping[row['job_id']];folder=ROOT/'stages'/job;ws=folder/'workspace';(ws/'inputs').mkdir(parents=True);(ws/'out').mkdir()
   raw=Path(old['prompt_file']).read_bytes();oldclock=fragment.render(old['max_seconds'])
   if p.sha(old['prompt_file'])!=old['prompt_sha256'] or not raw.endswith(oldclock):raise ValueError('Exact original scientific Task prefix/clock required')
   repair=row['stage']=='research';seconds=600 if repair else old['max_seconds'];clock=fragment.render(seconds);origins=[] if repair else [mapping[x] for x in row['all_same_arm_prior_job_ids']]
   task=ws/'TASK.md';task.write_bytes(raw[:-len(oldclock)]+(repair_suffix(job) if repair else continuation_suffix(job,origins))+clock)
   cp=folder/'clock_fragment.md';cp.write_bytes(clock);inputs={}
   for path,digest in old['input_pins'].items():
    rel=Path(path).relative_to(old['workspace'])
    if rel==Path('inputs/delivery_role_manifest.json'):continue
    p.clone_bytes(path,ws/rel,digest,old['workspace']);inputs[str(ws/rel)]=digest
   spec=copy.deepcopy(old);spec.update(job_id=job,pair_id=PAIR,workspace=str(ws),prompt_file=str(task),prompt_sha256=p.sha(task),max_seconds=seconds,max_responses=60 if repair else old['max_responses'],
    input_pins=inputs,out=str(folder/'native'),freeze_out=str(folder/'OUTPUT_FREEZE.json'),declared_native_source_pin=PINS[int(B)],declared_native_runner=pin['worker']['path'],declared_tool_source_pin=pin['tools_source_pins'],
    original_scientific_Task_ref={'path':old['prompt_file'],'sha256':old['prompt_sha256']},original_scientific_prefix_bytes=len(raw)-len(oldclock),source_original_stage_ref=oldref,
    mechanical_catalog_repair_role=repair,old_Goal_or_clock_reset=False,old_costs_failures_retained=True,extra_logical_target_credit=False,repair_donor_contract=p.ref(ROOT/'DONOR_CONTRACT.json') if (ROOT/'DONOR_CONTRACT.json').exists() else None,
    paired_repair_gate_required_before_continuation=not repair,reserved_dynamic_prior_index='inputs/prior_file_index.json' if not repair else None)
   spec['glm_resource'].update(version=pin['version'],source_pins=pin['runtime_source_pins'],tools_config_builder={'path':str(LAB/'dev/tools/versions/v1.5-clock-telemetry/config.py'),'sha256':'ce1a541599f56669b9788e989b3d5e2c96fea95d695bc9d4011f99bc22750a39'},
     clock_fragment=p.ref(cp),capture_dir=str(folder/'public_captures'),evidence_dir=str(folder/'tool-evidence'),bundle_profile=None)
   if B:
    profile=p.checked(old['glm_resource']['bundle_profile']);operator=module('operator',LAB/'dev/tools/versions/v1.5-clock-telemetry/operator_binding.py')
    built=operator.binding(stage_id=job,stage_role=profile['stage_role'],case_id=card['case_id'],arm_id=arm,method_factors=profile['method_factors'],
      actor_binding={'stage_id':job,'family':'GLM','model':spec['glm_resource']['model'],'effort':'max','native_goal_id':None,'writer_alias':'mcp__pm_boundary__write_file'},entries=[],complete_final_role=True)
    mp=ws/'inputs/delivery_role_manifest.json';mp.write_bytes(built['manifest_bytes']);inputs[str(mp)]=p.sha(mp);private=folder/'operator-profile';private.mkdir(mode=0o700);pp=private/'BUNDLE_PROFILE.json';pp.write_bytes(built['profile_bytes']);pp.chmod(0o600)
    spec['glm_resource']['bundle_profile']=p.ref(pp);spec.update(required_delivery_role_manifest=p.ref(mp),bundle_authoring_mode='INLINE_ONLY')
   fragment.validate_packet(spec);p.put(folder/'prepared-stage.json',spec);ref=p.ref(folder/'prepared-stage.json')
   rows.append({'job_id':job,'arm':arm,'stage':row['stage'],'stage_index':row['stage_index'],'max_seconds':seconds,'max_responses':spec['max_responses'],'stage_json':ref['path'],'stage_sha256':ref['sha256'],
    'expected_freeze':spec['freeze_out'],'pipeline_final':row['pipeline_final'],'prerequisite_job_ids':origins[-1:] if origins else [],'all_same_arm_prior_job_ids':origins,
    'runtime_source_pin':PINS[int(B)],'runtime_ref':MARKERS[int(B)],'resource_definition':resource_definition(int(B)),'execution_enabled':spec['glm_resource']['execution_enabled'],'public_get':spec['glm_resource']['public_get'],'status':'SOURCE_PREPARED_AWAITING_ROOT_FINITE_ALLOCATION',
    'repair_donor':donorby[arm] if repair else None,'both_native_repairs_gate_required':not repair})
   closures.append({'job_id':job,'arm':arm,'stage':row['stage'],'Task_ref':p.ref(task),'prepared_stage_ref':ref,'runtime_source_pin':PINS[int(B)],'runtime_source_pins':pin['runtime_source_pins'],
    'tools_source_pin':pin['tools_source_pins'],'clock_fragment':p.ref(cp),'native_worker':pin['worker'],'bundle_profile':spec['glm_resource']['bundle_profile'],'future_actual_clock_config_input_hashes':None})
 p.put(ROOT/'PAIRED_SOURCE_CLOSURE.json',{'schema':'er9.c04-paired-native-catalog-repair-source-closure.v1','pair_id':PAIR,'source_card':cardref,'source_registration':donor[0]['source']['owner_registration_ref'],
  'all5_role_source_choices_before_ANY_new_Goal':True,'all_roles':closures,'original_topology':'control mechanicalR4repair600→critique900→revision600; treatment mechanicalR4repair600→critic_final1500',
  'new_allocation_per_arm':2100,'new_allocation_total':4200,'native_allocation_authorized':False,'target_credit':0,'semantic_recovery_quality':'UNASSESSED'})
 reg=copy.deepcopy(registration);reg.update(pair_id=PAIR,request_id=PAIR+'-source-r001',source_pair_id=registration['pair_id'],stage_jobs=rows,source_card_ref=cardref,
  pipeline_closure=p.ref(ROOT/'PAIRED_SOURCE_CLOSURE.json'),track='C04_PAIRED_NATIVE_CATALOG_SERIALIZATION_DIAGNOSTIC',fresh_matched_or_clean_confirmation_credit=False,
  scientific_recovery_mode='paired same-rule native syntax-only donor repair then original topology conditional continuation',native_allocation_authorized=False,old_lineage_costs_failures_grades_retained=True)
 p.put(ROOT/'registration.json',reg)
 p.put(ROOT/'OUTBOX.json',{'schema':'er9.c04-paired-native-catalog-repair-owner-outbox.v1','registration':p.ref(ROOT/'registration.json'),'full_source_closure':p.ref(ROOT/'PAIRED_SOURCE_CLOSURE.json'),
  'metadata_selection':META,'donor_courier_metadata':COURIER,'structural_frontier':FRONTIER,'source_native_calls':0,'both_repair600_then_original_topology':True,'native_allocation_authorized':False,
  'actual_T_gate_eligibility':'UNKNOWN_UNASSESSED until native authored output compared mechanically; no candidate donor bytes read by source engineer','no_host_JSON_repair_or_auto_adoption':True,
  'root_concrete_review_required_for_finite_allocation':True,'new_logical_targets':0,'automatic_repeat':False})
 return p.ref(ROOT/'OUTBOX.json')

if __name__=='__main__':print(json.dumps(prepare()))
