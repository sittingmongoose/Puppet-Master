#!/usr/bin/env python3
"""Offline, hash-bound critical-field replay. Does not capture, watch or grade."""
import argparse,copy,hashlib,json,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
INDEX_SHA='45670c83f4bbc54a8d030ae488acc87de22a946f3113ec6d6a14148745c156a9'
def sha(b):return hashlib.sha256(b).hexdigest()
def esc(s):return str(s).replace('~','~0').replace('/','~1')
def at(x,p):
 if p and not p.startswith('/'):raise ValueError('not RFC6901')
 for t in p.split('/')[1:] if p else []:
  t=t.replace('~1','/').replace('~0','~');x=x[int(t)] if isinstance(x,list) else x[t]
 return x
def setat(x,p,value):
 parts=p.split('/')[1:];cur=x
 for raw in parts[:-1]:
  k=raw.replace('~1','/').replace('~0','~')
  if isinstance(cur,list):cur=cur[int(k)]
  else:cur=cur.setdefault(k,{})
 k=parts[-1].replace('~1','/').replace('~0','~')
 if isinstance(cur,list):cur[int(k)]=value
 else:cur[k]=value
def write(path,obj):
 p=Path(path).resolve()
 if not p.is_relative_to(HERE):raise ValueError('WRITE ONLY fixed helper directory')
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,indent=2,ensure_ascii=False,allow_nan=False)+'\n')
class InputIdentityError(ValueError):
 pass
class Bundle:
 def __init__(self,manifest):
  self.manifest_path=Path(manifest).resolve();self.root=self.manifest_path.parent
  self.manifest=json.loads(self.manifest_path.read_bytes());self.files={};self.docs={}
  for f in self.manifest['files']:
   if f['source'] in self.files:raise ValueError('duplicate source id')
   p=(self.root/f['bundle_path']).resolve()
   if not p.is_relative_to(self.root):raise ValueError('frozen path escapes bundle')
   raw=p.read_bytes()
   if sha(raw)!=f['sha256'] or len(raw)!=f['bytes']:raise ValueError('input hash/size mismatch '+f['source'])
   self.files[f['source']]=f
   if p.suffix=='.json':self.docs[f['source']]=json.loads(raw)
 def ref(self,source,pointer):
  f=self.files[source]
  return {'source':source,'original_path':f['original_path'],'bundle_path':f['bundle_path'],'sha256':f['sha256'],'pointer':pointer}
 def read(self,ref):
  f=self.files[ref['source']]
  if ref['sha256']!=f['sha256'] or ref['original_path']!=f['original_path']:raise InputIdentityError('mapping identity mismatch')
  return at(self.docs[ref['source']],ref['pointer'])
def evaluate(rule,bundle,ledger):
 op=rule['transformation'];ref=rule.get('original');exists=True;raw=None
 if ref:
  try:raw=bundle.read(ref)
  except InputIdentityError:raise
  except (KeyError,IndexError,TypeError,ValueError):exists=False
 for binding in rule.get('semantic_bindings',[]):
  if bundle.read(binding['original'])!=binding['exact_value']:raise ValueError('semantic binding changed '+rule['output_pointer'])
 state='KNOWN';value=raw;reason=rule.get('reason')
 if op=='unknown':value=None;state='UNKNOWN'
 elif op=='identity':state='KNOWN_NULL' if exists and raw is None else 'KNOWN'
 elif op=='explicit_bool':
  if type(raw) is not bool:value=None;state='UNKNOWN';reason=reason or 'Exact original JSON boolean absent; no counts, source grades or terminals substituted.'
 elif op=='string_only':
  if not isinstance(raw,str):value=None;state='KNOWN_NULL' if exists and raw is None else 'UNKNOWN'
 elif op=='enum_bool':
  value=rule['enum_map'].get(raw) if isinstance(raw,str) else None
  if value is None:state='UNKNOWN';reason=reason or 'Original value is outside the predeclared exact source-scoped enum map.'
 elif op=='declared_identity_present':
  value=(raw is not None) if exists else None
  if value is None:state='UNKNOWN'
 elif op=='record_reference':
  value=copy.deepcopy(ref)
  if not exists:state='UNKNOWN';value=None
 elif op=='constant_bound':value=copy.deepcopy(rule['constant'])
 elif op=='unassessed_material_null':value=None;state='UNASSESSED';reason='Original scientific assessment is unassessed; original count is retained separately.'
 elif op=='all_three_valued':
  components=[at(ledger,p)['value'] for p in rule['components']]
  value=False if False in components else True if all(v is True for v in components) else None
  state='KNOWN' if value is not None else 'UNKNOWN'
  reason=reason or 'No explicit conclusion while one or more components remain UNKNOWN.'
 elif op=='paired_values':value=[at(ledger,p)['value'] for p in rule['components']]
 else:raise ValueError('unknown transformation '+op)
 if not exists and op not in {'unknown','constant_bound','unassessed_material_null','all_three_valued','paired_values'}:
  state='UNKNOWN';value=None;reason=reason or 'Exact pointer absent in frozen source metadata.'
 out={'value':value,'state':state,'transformation':op}
 if ref:out['original']=copy.deepcopy(ref)
 if rule.get('components'):out['components']=rule['components']
 if rule.get('semantic_bindings'):out['semantic_bindings']=copy.deepcopy(rule['semantic_bindings'])
 if op=='enum_bool':out['enum_map']=copy.deepcopy(rule['enum_map'])
 if state in {'UNKNOWN','UNASSESSED'}:out['reason']=reason or 'No exact authoritative value.'
 if rule.get('scope'):out['scope']=rule['scope']
 return out

def replay(bundle,fmap):
 ledger=copy.deepcopy(fmap['ledger_template'])
 for rule in fmap['entries']:setat(ledger,rule['output_pointer'],evaluate(rule,bundle,ledger))
 fields=fmap['critical_arm_fields'];arms=[(s,a,v) for s in ledger['slots'] for a,v in s['arms'].items()]
 unknown=[]
 for rule in fmap['entries']:
  cell=at(ledger,rule['output_pointer'])
  if cell['state']=='UNKNOWN' and rule.get('critical',False):
   unknown.append({'output_pointer':rule['output_pointer'],'category':rule.get('gap_category','ABSENT_EXACT_FLAG'),'original':rule.get('original'),'reason':cell['reason'],'original_scope_references':rule.get('semantic_bindings',[])})
 ledger['mapping_coverage']={'critical_arm_cells':len(arms)*len(fields),'resolved_critical_arm_cells':sum(v[f]['state']!='UNKNOWN' for s,a,v in arms for f in fields),'unknown_critical_arm_cells':sum(v[f]['state']=='UNKNOWN' for s,a,v in arms for f in fields),'mapping_entries':len(fmap['entries'])}
 # Comparison to the immutable historical adapter is a mapping delta, never a science regrade.
 old=bundle.docs.get('historical/CLOSED_SLOT_LEDGER.json',{}).get('slots',[])
 comparable={'candidate_final_delivery':'candidate_final_delivery','full_scientific_coverage':'full_scientific_coverage','full_declared_primary_source_coverage':'full_declared_source_coverage','original_grade_string':'original_grade_string','original_grade_record':'original_grade_record','original_material_count':'original_material_count','normalized_material_count':'normalized_material_count','native_pipeline_qualified':'native_qualified','time_eligible':'time_eligible','provenance_eligible':'provenance_eligible','review_actual_timely_delivery':'review_delivery_within_original_allowance'}
 delta=[]
 for i,row in enumerate(old):
  for a,arm in row['arms'].items():
   for newfield,oldfield in comparable.items():
    if oldfield not in arm:continue
    before=arm[oldfield];after=ledger['slots'][i]['arms'][a][newfield]
    if before.get('value')!=after.get('value') or before.get('state')!=after.get('state'):
     delta.append({'arm_id':arm['arm_id'],'field':newfield,'historical_field':oldfield,'historical_value':before.get('value'),'historical_state':before.get('state'),'supplement_value':after['value'],'supplement_state':after['state'],'newly_closed_M07A':row['slot_id']=='D-M07-A','original_source':after.get('original')})
 ledger['mapping_delta']={'changed_comparable_cells':len(delta),'resolved_original_35_closed_unknowns':sum(x['historical_state']=='UNKNOWN' and x['supplement_state']!='UNKNOWN' and not x['newly_closed_M07A'] and x['arm_id'].split('/')[0] not in {'D-M06-A','D-M06-B','D-M07-B','D-M09-A'} for x in delta),'entries':delta,'no_changed_original_scientific_terms':True}
 ledger['critical_field_coverage']={}
 for f in fields:
  ledger['critical_field_coverage'][f]={}
  for name,selected in [('closed',[v for s,a,v in arms if s['closure']=='CLOSED']),('held',[v for s,a,v in arms if s['closure']=='LIVE_HELD'])]:
   ledger['critical_field_coverage'][f][name]={'cells':len(selected),'known':sum(v[f]['state']!='UNKNOWN' for v in selected),'unknown':sum(v[f]['state']=='UNKNOWN' for v in selected)}
 ledger['aggregates']={}
 for field in ['scientific_judgment_available','review_formal_output_delivery','review_actual_timely_delivery','full_scientific_coverage','full_declared_primary_source_coverage','native_pipeline_qualified','time_eligible','provenance_eligible','method_eligible']:
  groups={k:[] for k in ['TRUE','FALSE','UNKNOWN']}
  for s,a,v in arms:
   x=v[field]['value'];groups['TRUE' if x is True else 'FALSE' if x is False else 'UNKNOWN'].append(v['arm_id'])
  ledger['aggregates'][field]={'denominator':80,'members':groups,'counts':{k:len(v) for k,v in groups.items()}}
 for field in ['both_full_scientific_coverage','both_full_declared_primary_source_coverage','both_review_formal_output_delivery','both_review_actual_timely_delivery']:
  groups={k:[] for k in ['TRUE','FALSE','UNKNOWN']}
  for s in ledger['slots']:
   v=s['paired'][field]['value'];groups['TRUE' if v is True else 'FALSE' if v is False else 'UNKNOWN'].append(s['slot_id'])
  ledger['aggregates'][field]={'denominator':40,'members':groups,'counts':{k:len(v) for k,v in groups.items()}}
 return ledger,{'schema':'ER10_UNRESOLVED_CRITICAL_MAPPINGS_V2','status':ledger['status'],'categories':{k:sum(r['category']==k for r in unknown) for k in sorted({r['category'] for r in unknown})},'entries':unknown,'unknown_is_not_failure':True,'no_forced_resolution':True}

def validate(bundle,fmap,ledger,unresolved):
 checks=[]
 def check(name,ok,detail=None):checks.append({'check':name,'passed':bool(ok),**({'detail':detail} if detail is not None else {})})
 slots=ledger['slots'];look={s['slot_id']:s for s in slots}
 index=bundle.docs['closed_owner/state/logical-slot-index-v1.json']['slots']
 check('immutable_index_sha256',bundle.files['closed_owner/state/logical-slot-index-v1.json']['sha256']==INDEX_SHA)
 check('40_ordered_original_slots',[s['slot_id'] for s in slots]==[s['slot_id'] for s in index] and len(look)==40)
 check('80_original_arm_identities',len({v['arm_id'] for s in slots for v in s['arms'].values()})==80 and all(list(s['arms'])==['control','treatment'] for s in slots))
 held=set(bundle.docs['control/config.json']['live_science_excluded'])
 check('working_not_terminal_36_closed_4_held',ledger['status']=='WORKING_NOT_TERMINAL' and ledger['campaign_terminal'] is False and sum(s['closure']=='CLOSED' for s in slots)==36 and {s['slot_id'] for s in slots if s['closure']=='LIVE_HELD'}==held)
 violations=[]
 for r in fmap['entries']:
  sid=slots[int(r['output_pointer'].split('/')[2])]['slot_id'] if r['output_pointer'].startswith('/slots/') else None
  if sid in held and r.get('original') and r['original']['source'] not in {'closed_owner/state/logical-slot-index-v1.json','control/config.json'}:violations.append(r['output_pointer'])
 check('held_science_unopened_ungraded',not violations and all(v['original_grade_string']['value'] is None for s in slots if s['slot_id'] in held for v in s['arms'].values()),violations)
 check('all_frozen_file_hashes_verified',True,len(bundle.files))
 bad=[]
 for r in fmap['entries']:
  if evaluate(r,bundle,ledger)!=at(ledger,r['output_pointer']):bad.append(r['output_pointer'])
 check('every_mapping_replays',not bad,{'entries':len(fmap['entries']),'mismatches':bad})
 bound=[r for r in fmap['entries'] if r['transformation']=='enum_bool']
 check('every_enum_mapping_predeclares_exact_source_scope',all(r.get('semantic_bindings') and r.get('scope') and r.get('enum_map') for r in bound),len(bound))
 check('no_coverage_from_counts_axes_terminals',all(r['transformation'] in {'explicit_bool','enum_bool','unknown','all_three_valued','paired_values'} and not (r.get('original',{}).get('pointer','').split('/')[-1] in {'counts','six_axes','native_status','native_terminal'}) for r in fmap['entries'] if r['output_pointer'].split('/')[-1] in {'full_scientific_coverage','full_declared_primary_source_coverage'}))
 check('C01_null_grade_original0_unassessed_materialnull',look['C-01']['arms']['control']['original_grade_string']['value'] is None and look['C-01']['arms']['control']['original_material_count']['value']==0 and look['C-01']['arms']['control']['normalized_material_count']['value'] is None and look['C-01']['arms']['control']['scientific_judgment_available']['value'] is False)
 check('M01A_diagnostic_available_with_null_grade',all(v['scientific_judgment_available']['value'] is True and v['original_grade_string']['value'] is None for v in look['D-M01-A']['arms'].values()))
 check('C02_exact_paired_source_coverage_true_false',look['C-02']['paired']['primary_source_coverage_values']['value']==[True,False] and look['C-02']['arms']['treatment']['original_grade_string']['value']=='HOLD')
 check('C03_science_FAIL_independent_method_HOLD',look['C-03']['arms']['treatment']['original_grade_string']['value']=='FAIL' and look['C-03']['paired']['method_eligible']['value'] is False)
 check('C04_full_source_FAIL_and_PASS_WITH_LIMITATIONS',look['C-04']['paired']['primary_source_coverage_values']['value']==[True,True] and [v['original_grade_string']['value'] for v in look['C-04']['arms'].values()]==['FAIL','PASS_WITH_LIMITATIONS'])
 check('M11T_fullscience_interrupted_delivery',look['D-M11-A']['arms']['treatment']['full_scientific_coverage']['value'] is True and look['D-M11-A']['arms']['treatment']['review_formal_output_delivery']['value'] is False)
 check('M13C_fullsource_late_deadline_extent_separate',look['D-M13-A']['arms']['control']['full_declared_primary_source_coverage']['value'] is True and look['D-M13-A']['arms']['control']['review_actual_timely_delivery']['value'] is False and look['D-M13-A']['arms']['control']['scientific_extent_at_review_deadline']['state']=='UNKNOWN')
 check('M02B_original_conditional_strings_unchanged',[v['original_grade_string']['value'] for v in look['D-M02-B']['arms'].values()]==['SUPPORTED_WITH_STATED_CONDITIONS','SUPPORTED_WITH_STATED_CONDITIONS_AND_MINOR_WORDING_LIMIT'])
 f3=look['I-FAST-03']['arms']['control']
 check('FAST03_science49_process2_contractfalse_primaryflag_unknown',f3['full_scientific_coverage']['value'] is True and f3['original_scientific_scope_unit_counts']['value']['assessed']==49 and f3['original_external_process_facet_counts']['value']['unassessed']==2 and f3['original_full_declared_contract_coverage']['value'] is False and f3['full_declared_primary_source_coverage']['state']=='UNKNOWN')
 check('coverage_scope_bound_for_every_mapped_boolean',all(r.get('semantic_bindings') for r in fmap['entries'] if r['output_pointer'].endswith(('/full_scientific_coverage','/full_declared_primary_source_coverage')) and r['transformation']=='explicit_bool'))
 check('METHOD04v2_never_unqualified_PASS',all(v['original_grade_string']['value']=='PASS_WITH_LIMITATIONS' for v in look['I-METHOD-04']['arms'].values()))
 check('METHOD02_FAST01_standalone_zero_extra_pair_credit',all(look[k]['standalone_extra_logical_arms']==0 and look[k]['paired']['scientific_judgment_available']['value'] is False for k in ['I-METHOD-02','I-FAST-01']))
 check('M07A_FAIL_FAIL_native_active_absence_hold',all(v['original_grade_string']['value']=='FullSourceFAIL' and v['full_scientific_coverage']['value'] is True and v['native_active_observed']['value'] is False and v['native_pipeline_qualified']['value'] is False for v in look['D-M07-A']['arms'].values()) and look['D-M07-A']['paired']['method_eligible']['value'] is False)
 check('original_baseline_terms_preserved',all(look[s['slot_id']]['arms'][a]['original_grade_string']['value']==v['original_grade_string']['value'] for s in bundle.docs['historical/CLOSED_SLOT_LEDGER.json']['slots'] if s['slot_id'] not in held|{'D-M07-A'} for a,v in s['arms'].items()))
 check('all_history_references_resolve',all(r['transformation']!='record_reference' or at(ledger,r['output_pointer'])['state']!='UNKNOWN' for r in fmap['entries']))
 check('aggregate_members_partition_original_ids',all(sum(v['counts'].values())==v['denominator'] and len({x for vals in v['members'].values() for x in vals})==v['denominator'] for v in ledger['aggregates'].values()))
 check('additional_capture_within_180_and_32MiB',bundle.manifest['additional_metadata_files']<=180 and bundle.manifest['additional_metadata_bytes']<=33554432)
 check('offline_input_paths_all_bundle_relative',all(not Path(f['bundle_path']).is_absolute() and '..' not in Path(f['bundle_path']).parts for f in bundle.files.values()))
 # Adversarial replay checks: unsupported schema inputs cannot manufacture science/eligibility.
 probe=fmap['entries'][0]
 try:
  corrupt=copy.deepcopy(probe)
  if corrupt.get('original'):
   corrupt['original']['sha256']='0'*64;evaluate(corrupt,bundle,ledger);rejected=False
  else:rejected=True
 except ValueError:rejected=True
 check('mapping_wrong_source_sha_rejected',rejected)
 enum_probe=next(r for r in fmap['entries'] if r['transformation']=='enum_bool')
 try:
  corrupt=copy.deepcopy(enum_probe);corrupt['semantic_bindings'][0]['exact_value']={'wrong':'source-scope'};evaluate(corrupt,bundle,ledger);rejected=False
 except ValueError:rejected=True
 check('changed_original_enum_scope_rejected',rejected)
 count_ref=bundle.ref('historical/reviews/integrated-methods/I-METHOD-01/control/review-v1/coverage.json','/counts/assessed')
 count_cell=evaluate({'output_pointer':'/unused','original':count_ref,'transformation':'explicit_bool'},bundle,ledger)
 check('assessment_count_cannot_be_boolean_pass_or_coverage',count_cell['state']=='UNKNOWN' and count_cell['value'] is None)
 null_ref=bundle.ref('closed_owner/reviews/confirmation/COMPARISONS.json','/pairs/0/arms/control/original_scientific_grade')
 check('grade_null_preserved_as_null',evaluate({'output_pointer':'/unused','original':null_ref,'transformation':'string_only'},bundle,ledger)['value'] is None)
 mini={'a':{'value':True},'b':{'value':None},'c':{'value':False}}
 check('three_valued_unknown_never_promoted_to_true',evaluate({'transformation':'all_three_valued','components':['/a','/b']},bundle,mini)['value'] is None and evaluate({'transformation':'all_three_valued','components':['/c','/b']},bundle,mini)['value'] is False)
 check('no_native_qualification_derived_from_terminal',all(not ('terminal' in r.get('original',{}).get('pointer','') and r['transformation'] in {'enum_bool','explicit_bool','declared_identity_present'}) for r in fmap['entries'] if r['output_pointer'].endswith('/native_pipeline_qualified')))
 check('unresolved_categories_distinguish_absence_schema_gap_unverified',all(k in unresolved['categories'] for k in ['ABSENT_EXACT_FLAG','METADATA_SCHEMA_GAP','UNVERIFIED_OBLIGATION','LIVE_HELD_UNOPENED']))
 try:
  final_replay(argparse.Namespace(final_manifest=str(HERE/'INPUT_IDENTITIES.json')));rejected=False
 except ValueError:rejected=True
 check('working_manifest_cannot_be_promoted_to_FINAL',rejected)
 check('no_recommendation_or_new_grade_or_ratio',ledger['fresh_scientific_conclusions'] is False and ledger['recommendation'] is None and ledger['general_winner'] is None)
 return {'schema':'ER10_SUPPLEMENT_MECHANICAL_VALIDATION_V2','passed':all(c['passed'] for c in checks),'checks':checks,'mapping_coverage':ledger['mapping_coverage'],'remaining_critical_gaps':unresolved['categories'],'science_review_performed':False,'input_manifest_sha256':sha(bundle.manifest_path.read_bytes())}

def final_replay(args):
 """Root supplies a DIFFERENT explicitly frozen manifest and field map, never live paths."""
 path=Path(args.final_manifest).resolve()
 if path==HERE/'INPUT_IDENTITIES.json':raise ValueError('FINAL manifest must differ from this working capture')
 b=Bundle(path);m=b.manifest
 if m.get('schema')!='ER10_EXPLICIT_FROZEN_FINAL_INPUT_MANIFEST_V1' or not m.get('campaign_terminal') or not m.get('all_40_slots_actual_quiet') or m.get('index_sha256')!=INDEX_SHA:raise ValueError('explicit final closure attestations missing')
 if len(m.get('closed_slot_ids',[]))!=40 or len(set(m['closed_slot_ids']))!=40:raise ValueError('FINAL requires exactly 40 closed original slots')
 evidence=m.get('closure_evidence',[])
 expected_future=set(b.docs['control/config.json']['live_science_excluded'])
 if {e.get('slot_id') for e in evidence}!=expected_future or len(evidence)!=4:raise ValueError('FINAL requires four exact newly-closed quiet evidence bindings')
 for e in evidence:
  if e.get('scope')!='ALL_ORIGINAL_CANDIDATE_REVIEW_TASK_TREES_AND_DESCENDANTS_QUIET':raise ValueError('FINAL exact quiet scope declaration missing')
  if 'quiet' not in e['original']['pointer'].split('/')[-1].lower():raise ValueError('FINAL quiet pointer must be an explicit quiet flag')
  actual=b.read(e['original'])
  if actual!=e['exact_value'] or e['exact_value'] is not True:raise ValueError('FINAL future quiet evidence must be explicit original true, not terminal completion or counts')
 fmap=json.loads(Path(args.final_field_map).read_bytes())
 # All four future bindings must be supplied; this helper never discovers them.
 if fmap['ledger_template'].get('status')!='FINAL_EXPLICIT_FROZEN' or not fmap['ledger_template'].get('campaign_terminal'):raise ValueError('FINAL-specific field map required')
 future=set(b.docs['control/config.json']['live_science_excluded'])
 for sid in future:
  row=next(s for s in fmap['ledger_template']['slots'] if s['slot_id']==sid)
  if row.get('closure')!='CLOSED':raise ValueError('future slot still held in FINAL field map')
  prefix='/slots/'+str(row['ordinal']-1)+'/arms/'
  if not any(r['output_pointer'].startswith(prefix) and r.get('original',{}).get('source') not in {'control/config.json','closed_owner/state/logical-slot-index-v1.json'} for r in fmap['entries']):raise ValueError('FINAL future slot has no explicitly frozen original binding')
 ledger,gaps=replay(b,fmap)
 index=b.docs['closed_owner/state/logical-slot-index-v1.json']['slots']
 if [s['slot_id'] for s in ledger['slots']]!=[s['slot_id'] for s in index] or len({v['arm_id'] for s in ledger['slots'] for v in s['arms'].values()})!=80:raise ValueError('FINAL violates immutable 40/80 index')
 if any(s['closure']!='CLOSED' for s in ledger['slots']):raise ValueError('FINAL still contains held rows')
 if ledger['logical_denominator']!={**ledger['logical_denominator'],'closed':40,'live_held':0}:raise ValueError('FINAL denominator must explicitly be 40 closed/0 held')
 working=json.loads((HERE/'SUPPLEMENTAL_LEDGER.json').read_bytes())
 old_closed={s['slot_id']:s for s in working['slots'] if s['closure']=='CLOSED'}
 for row in ledger['slots']:
  if row['slot_id'] not in old_closed:continue
  for a,arm in row['arms'].items():
   for field in ['original_grade_string','original_grade_record']:
    if arm[field]['value']!=old_closed[row['slot_id']]['arms'][a][field]['value']:raise ValueError('FINAL changed an immutable prior original grade term/object')
 for r in fmap['entries']:
  if r['output_pointer'].endswith('/original_grade_string') and r['transformation'] not in {'string_only','identity','unknown'}:raise ValueError('FINAL normalized an original independent grade term')
 if ledger.get('fresh_scientific_conclusions') is not False or ledger.get('recommendation') is not None or ledger.get('general_winner') is not None:raise ValueError('Synthesis/recommendation belongs to Root, outside this schema replay')
 write(args.output,ledger);write(str(Path(args.output).with_name('FINAL_UNRESOLVED_CRITICAL_MAPPINGS.json')),gaps)
 write(str(Path(args.output).with_name('FINAL_INPUT_VALIDATION.json')),{'schema':'ER10_FINAL_EXPLICIT_FROZEN_INPUT_VALIDATION_V1','passed':True,'quiet_evidence_bindings':evidence,'exact_original_slots':40,'exact_original_arms':80,'input_manifest_sha256':sha(path.read_bytes()),'field_map_sha256':sha(Path(args.final_field_map).read_bytes()),'all_mapping_entries_replayed':len(fmap['entries']),'scope':'Frozen metadata replay and exact quiet declarations only; no science regrade or live capture.'})
 print(json.dumps({'status':ledger['status'],'output':args.output,'manifest_sha256':sha(path.read_bytes())}))
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('command',choices=['replay','validate','final-replay']);p.add_argument('--manifest',default=str(HERE/'INPUT_IDENTITIES.json'));p.add_argument('--field-map',default=str(HERE/'SUPPLEMENTAL_FIELD_MAP.json'));p.add_argument('--output',default=str(HERE/'SUPPLEMENTAL_LEDGER.json'));p.add_argument('--final-manifest');p.add_argument('--final-field-map');args=p.parse_args()
 if args.command=='final-replay':
  if not args.final_manifest or not args.final_field_map:p.error('Root must provide --final-manifest and --final-field-map')
  final_replay(args);return
 b=Bundle(args.manifest);fmap=json.loads(Path(args.field_map).read_bytes());ledger,gaps=replay(b,fmap);v=validate(b,fmap,ledger,gaps)
 if args.command=='replay':write(args.output,ledger);write(HERE/'unresolved-critical-mappings.json',gaps)
 else:
  if Path(args.output).exists() and json.loads(Path(args.output).read_bytes())!=ledger:raise ValueError('saved ledger differs from full offline replay')
 write(HERE/'validation.json',v);print(json.dumps({'passed':v['passed'],'checks':len(v['checks']),'coverage':ledger['mapping_coverage'],'gaps':gaps['categories']}));sys.exit(0 if v['passed'] else 1)
if __name__=='__main__':main()
