#!/usr/bin/env python3
"""Predeclare this finite critical schema repair from already-frozen original JSON."""
import copy,json
from pathlib import Path
from apply_supplement import Bundle,at,esc,write,HERE
b=Bundle(HERE/'INPUT_IDENTITIES.json');base=b.docs['historical/CLOSED_SLOT_LEDGER.json'];cfg=b.docs['control/config.json'];held=set(cfg['live_science_excluded'])
entries=[]
def ref(s,p):return b.ref(s,p)
def exists(s,p):
 try:at(b.docs[s],p);return True
 except (KeyError,IndexError,TypeError,ValueError):return False
def raw(s,p):return at(b.docs[s],p)
def rule(out,s,p,op='identity',scope=None,critical=False,reason=None,gap=None,enum=None,bindings=None,constant=None):
 r={'output_pointer':out,'transformation':op,'critical':critical}
 if s:r['original']=ref(s,p)
 if scope:r['scope']=scope
 if reason:r['reason']=reason
 if gap:r['gap_category']=gap
 if enum is not None:r['enum_map']=enum
 if bindings:r['semantic_bindings']=[{'original':ref(ss,pp),'exact_value':raw(ss,pp)} for ss,pp in bindings]
 if constant is not None:r['constant']=constant
 entries.append(r);return r
def orig(c):
 x=c.get('original',{});s='historical/'+x.get('source','');p=x.get('pointer','')
 return (s,p) if s in b.files else ('historical/CLOSED_SLOT_LEDGER.json','')
def enumrule(out,s,p,mapping,scope,critical=True,bindings=None):
 return rule(out,s,p,'enum_bool',scope,critical,enum=mapping,bindings=bindings or [(s,p)])
def unknown(out,s,p,reason,category='ABSENT_EXACT_FLAG',scope=None,bindings=None):
 return rule(out,s,p,'unknown',scope,True,reason,category,bindings=bindings)
def oldcell(out,c,critical=False,scope=None):
 s,p=orig(c)
 if not p and s=='historical/CLOSED_SLOT_LEDGER.json':return unknown(out,s,p,'Historical adapter control pointer has no original grade-source binding.',scope=scope)
 op=c.get('transformation','identity')
 if c.get('state')=='UNKNOWN':return unknown(out,s,p,c.get('missing_field',{}).get('reason','Exact original field absent'),scope=scope)
 if op=='enum_bool':return enumrule(out,s,p,c['enum_map'],scope or 'Exact original source-scoped enum; no cross-review ranking.',critical)
 if op=='constant_bound':return rule(out,s,p,op,scope,critical,constant=c['constant'])
 if op=='nonnull_identity':op='declared_identity_present'
 return rule(out,s,p,op,scope,critical)
def cells(x):
 if isinstance(x,dict):
  if 'original' in x and 'transformation' in x:yield x
  else:
   for v in x.values():yield from cells(v)
 elif isinstance(x,list):
  for v in x:yield from cells(v)
def reference_cells(out,items,scope):
 refs=[];seen=set()
 for c in cells(items):
  s,p=orig(c)
  if (s,p) in seen or not exists(s,p):continue
  seen.add((s,p));refs.append({});rule(out+'/'+str(len(refs)-1),s,p,'record_reference',scope)
 return refs

def owner(sid):
 if sid in {x['case_id'] for x in b.docs['closed_owner/helpers/targeted-supervisor/COMPARISONS.json']['comparisons']}:
  s='closed_owner/helpers/targeted-supervisor/COMPARISONS.json';xs=b.docs[s]['comparisons'];indices=[i for i,x in enumerate(xs) if x['case_id']==sid];return s,'/comparisons/'+str(indices[-1])
 if sid in {'D-M04-A','D-M04-B','D-M05-A','D-M05-B'}:
  s='closed_owner/helpers/targeted-cohort2/COMPARISONS.json';i=next(i for i,x in enumerate(b.docs[s]['cases']) if x['case_id']==sid);return s,'/cases/'+str(i)
 if sid in {'D-M07-A','D-M08-A','D-M08-B','D-M10-A'}:
  s='closed_owner/reviews/targeted-cohort3/COMPARISONS.json';i=next(i for i,x in enumerate(b.docs[s]['comparisons']) if x.get('case')==sid and x.get('version')=='v3');return s,'/comparisons/'+str(i)
 if sid.startswith('D-M'):
  s='closed_owner/helpers/targeted-cohort4/COMPARISONS.json';i=next(i for i,x in enumerate(b.docs[s]['completed_assessment']) if x['case_id']==sid);return s,'/completed_assessment/'+str(i)
 if sid.startswith('C-'):
  s='closed_owner/reviews/confirmation/COMPARISONS.json';i=next(i for i,x in enumerate(b.docs[s]['pairs']) if x['case']==sid);return s,'/pairs/'+str(i)
 if sid.startswith('I-ANCHOR'):
  s='closed_owner/reviews/anchors/COMPARISONS.json';i=next(i for i,x in enumerate(b.docs[s]['pairs']) if x['slot_id']==sid);path=b.docs[s]['pairs'][i]['comparison'];target='historical/'+path[len(cfg['campaign_root'])+1:] if path.startswith(cfg['campaign_root']+'/') else 'historical/'+path;return target,''
 if sid.startswith('I-METHOD'):
  num=int(sid.rsplit('-',1)[1]);v=2 if num in {2,4} else 1;return f'historical/helpers/integrated-execution/method{num:02d}-pair-disposition-v{v}.json',''
 if sid.startswith('I-FAST'):
  num=int(sid.rsplit('-',1)[1]);return f'historical/helpers/integrated-execution/fast{num:02d}-pair-disposition-v1.json',''
 raise ValueError(sid)

FULL_ENUMS={
 'complete_semantic_review_with_qualifications':('scientific','Complete repaired paired semantic assessment; qualifications and historical operation uncertainties remain.'),
 'complete_semantic_review':('scientific','Complete own-arm semantic assessment; historical-process group is separate.'),
 'COMPLETE_FOR_ALL_SUPPLIED_SCIENTIFIC_ARTIFACTS':('scientific','All supplied final and required intermediate scientific scope; external empirical/process groups remain separate.'),
 'COMPLETE_SOURCE_SCIENCE_ASSESSMENT':('primary','Complete released-primary source science; empirical/runtime/history limits remain separate.'),
 'FULL_DECLARED_SCOPE_ASSESSED_COMPLETE':('primary','Complete original bounded material primary-source scope, never unrelated chapters.'),
 'FULL_DECLARED_SCOPE_STATIC_SOURCE_REVIEW':('primary','Complete bounded static source scope; no empirical execution certification.'),
 'FULL_DECLARED_SCOPE_PRIMARY_SOURCE_REVIEW':('primary','Complete original primary-source review; deadline extent is separate.'),
 'FULL_SCOPE_STATIC_SOURCE_REVIEW':('primary','Complete bounded static source scope.'),
 'FULL_DECLARED_MATERIAL_SOURCE_SCIENCE_SCOPE':('primary','Complete material source-science scope; historical provenance excluded.'),
 'FULL_DECLARED_CLAIM_SCOPE_CHECKED':('primary','Every consequential final material claim checked against primary sources.'),
 'FULL_FROZEN_MATERIAL_SCIENCE_CHECK_WITH_UNASSESSED_HISTORICAL_PROVENANCE':('primary','Complete frozen material source science with expressly separate unverified history.'),
 'full declared-scope independent static primary-source review':('primary','Full declared static primary-source review; no actual execution/provenance inference.'),
}
# These are finite declaration bindings, not substring matching or count inference.
COVERAGE_REPAIRS={
 ('D-M01-B','control'):('/status',['/coverage_census/scope_rule','/repair_scope/authorized']),
 ('D-M01-B','treatment'):('/status',['/coverage_census/scope_rule','/repair_scope/authorized']),
 ('D-M02-A','control'):('/review_status',[]),('D-M02-A','treatment'):('/review_status',[]),
 ('D-M03-A','treatment'):('/review_status',['/authorization/original_science_scope','/conclusion/scope']),
 ('D-M03-B','control'):('/review_status',['/scope/reviewed','/scope/scope_limitations']),
 ('D-M03-B','treatment'):('/review_status',['/scope/reviewed','/scope/scope_limitations']),
 ('D-M11-A','treatment'):('/assessment_extent/type',['/assessment_extent/description','/assessment_extent/limitations']),
 ('D-M12-A','control'):('/status',['/assessment_extent/material_claim_scope','/assessment_extent/intrinsically_unverifiable_limits']),
 ('D-M16-A','treatment'):('/assessment_extent/extent_class',['/assessment_extent/scientific_semantic_extent','/assessment_extent/unassessed_remainder']),
}
CRITICAL=['candidate_final_delivery','scientific_judgment_available','review_formal_output_delivery','review_actual_timely_delivery','full_scientific_coverage','full_declared_primary_source_coverage','original_grade_string','original_grade_record','original_material_count','normalized_material_count','native_pipeline_qualified','time_eligible','provenance_eligible','method_eligible']
template={'schema':'ER10_CRITICAL_SCHEMA_SUPPLEMENT_LEDGER_V2','status':'WORKING_NOT_TERMINAL','campaign_terminal':False,'logical_denominator':{'slots':40,'arms':80,'closed':36,'live_held':4,'targeted_slots':24,'integrated_slots':12,'confirmation_slots':4},'authority':'Original CLOSED scientific judgments and owner metadata only. Metadata schema repair; no source review or regrade.','immutable_snapshot_nonatomic':True,'fixed_deadline':cfg['deadline'],'read_cutoff':b.manifest['read_cutoff'],'slots':[],'original_authority_counters':{},'fresh_scientific_conclusions':False,'recommendation':None,'general_winner':None}
# Exact denominator-bearing original counter objects are retained without redistribution.
for key,src,p in [('historical_35_closed_counters','historical/CLOSED_SLOT_LEDGER.json','/original_authority_counters'),('integrated_final_attempt_denominators','closed_owner/helpers/integrated-execution/FINAL_TRACK_DISPOSITION.json','/total_evaluation_coverage'),('confirmation_original','closed_owner/reviews/confirmation/COMPARISONS.json','/counts')]:
 rule('/original_authority_counters/'+key,src,p,scope='Verbatim original counter object and original denominator, never extra slot/arm credit.')

for i,s0 in enumerate(base['slots']):
 sid=s0['slot_id'];root='/slots/'+str(i);row={'ordinal':i+1,'slot_id':sid,'track':s0['track'],'closure':'LIVE_HELD' if sid in held else 'CLOSED','arms':{},'paired':{},'version_history':[],'review_history':[],'original_pair_context':[],'shared_and_failed_cost_references':[],'standalone_exception_assessments':[],'standalone_extra_logical_arms':0};template['slots'].append(row)
 rule(root+'/immutable_index_entry','closed_owner/state/logical-slot-index-v1.json','/slots/'+str(i))
 if sid in held:
  rule(root+'/final_authorized_version','control/config.json','/live_science_excluded','constant_bound',constant='UNKNOWN_UNGRADED_TEMPLATE')
  for a in ['control','treatment']:
   arm={'arm_id':sid+'/'+a,'arm':a,'earlier_attempts_and_source_review_remainder':[]};row['arms'][a]=arm
   for f in CRITICAL:unknown(root+'/arms/'+a+'/'+f,'closed_owner/state/logical-slot-index-v1.json','/slots/'+str(i),'LIVE_HELD: index/config template only; future science was not opened.','LIVE_HELD_UNOPENED',scope='No current grade or science conclusion.')
  for f in ['scientific_judgment_available','method_eligible','quality_preserving_win_established']:
   unknown(root+'/paired/'+f,'control/config.json','/live_science_excluded','LIVE_HELD: no pair science opened.','LIVE_HELD_UNOPENED')
 else:
  os,op=owner(sid)
  row['original_pair_context']=[{}];rule(root+'/original_pair_context/0',os,op,'record_reference','Original final-authorized CLOSED owner record, unchanged bytes; no best-of selection.')
  if sid=='D-M07-A':rule(root+'/final_authorized_version',os,op+'/version')
  else:rule(root+'/final_authorized_version','historical/CLOSED_SLOT_LEDGER.json','/slots/'+str(i)+'/final_authorized_version','record_reference','Historical final-authorized version selection, frozen and retained; no best-of.') if 'final_authorized_version' in s0 else rule(root+'/final_authorized_version','historical/CLOSED_SLOT_LEDGER.json','/slots/'+str(i)+'/arms/control/final_authorized_version/value')
  for a in ['control','treatment']:
   ap=root+'/arms/'+a;old=s0['arms'][a];arm={'arm_id':sid+'/'+a,'arm':a,'candidate_final_identities_declared_only':[],'original_independent_review_terms':{},'scientific_process_runtime_remainder_references':[],'earlier_attempts_and_source_review_remainder':[],'original_eligibility_references':[],'economics_original':{}};row['arms'][a]=arm
   if sid=='D-M07-A':
    js='closed_link/reviews/targeted-cohort3/D-M07-A-v3/'+('J1' if a=='control' else 'J2')+'/freeze_disposition.json';jp=''
    ps='closed_link/jobs/D-M07-A/V3_PAIR_FREEZE.json';key=next(k for k in b.docs[ps]['stage_freezes'] if '/'+a+'/' in k);pp='/stage_freezes/'+esc(key)
    enumrule(ap+'/candidate_final_delivery',ps,'/gate',{'BOTH_FULL_FINALS_NATIVE_COMPLETE_QUIET_FROZEN':True},'Original frozen required-full-final gate establishes delivery only, not scientific grade/native qualification.')
    for k in ['required_output','output_sha256','output_bytes']:
     arm['candidate_final_identities_declared_only'].append({});rule(ap+'/candidate_final_identities_declared_only/'+str(len(arm['candidate_final_identities_declared_only'])-1),ps,pp+'/'+k)
    rule(ap+'/original_grade_string',js,'/source_verdict','string_only',critical=True);rule(ap+'/original_grade_record',js,'/source_verdict',critical=True)
    enumrule(ap+'/scientific_judgment_available',js,'/source_verdict',{'FullSourceFAIL':True},'Original authored source verdict AVAILABLE; FAIL does not establish full scope or method eligibility.')
    for f in ['full_scientific_coverage','full_declared_primary_source_coverage']:rule(ap+'/'+f,js,'/full_declared_scope_assessed','explicit_bool','Original full declared source judgment extent; no SourcePASS inferred.',True)
    for f in ['original_material_count','normalized_material_count']:unknown(ap+'/'+f,js,'/material_defect_count','Original frozen JSON verdict metadata does not supply a material-defect count; forbidden prose was not opened.','ABSENT_EXACT_FLAG')
    enumrule(ap+'/native_pipeline_qualified',ps,'/native_activation_gate',{'HOLD_MISSING_NATIVE_ACTIVE_ORIGINAL_OBSERVATIONS_UNCHANGED':False},'Original native activation qualification HOLD. Native-complete terminals cannot cure absent Active observations.')
    rule(ap+'/native_active_observed',ps,pp+'/native_active_observed','explicit_bool');rule(ap+'/native_terminal_status_original',ps,pp+'/native_status')
    rule(ap+'/time_eligible',ps,pp+'/budget_delivery_eligible','explicit_bool','Original new-budget candidate delivery eligibility, not original-15-minute retroqualification.',True)
    enumrule(ap+'/method_eligible',ps,'/comparative_eligibility',{'HOLD_DIAGNOSTIC_FULL_SOURCE_REVIEWS_ONLY':False},'Original comparative method HOLD, diagnostic source assessment only.')
    unknown(ap+'/provenance_eligible',ps,pp+'/scope_audit','Source exposure remains incomplete_unknown; no provenance qualification boolean.','UNVERIFIED_OBLIGATION')
    enumrule(ap+'/review_formal_output_delivery',js,'/actual_t3_clock/status',{'completed':True},'Exact original CLOSED review carrier completed with declared formal scientific files; this is delivery only.',bindings=[(js,'/actual_t3_clock/status'),(js,'/scientific_files')])
    unknown(ap+'/review_actual_timely_delivery',js,'/review_delivery_within_original_deadline','No exact original review-timeliness flag in this freeze; measured delivery seconds are preserved, no new time calculation.','ABSENT_EXACT_FLAG')
    arm['economics_original']['closed_owner_numbers_labels']={};rule(ap+'/economics_original/closed_owner_numbers_labels',os,op+'/economics/arms/'+a)
    arm['economics_original']['review_seconds']={};rule(ap+'/economics_original/review_seconds',js,'/dispatch_to_delivery_seconds')
    arm['original_eligibility_references']=[{}];rule(ap+'/original_eligibility_references/0',ps,pp,'record_reference')
    arm['scientific_process_runtime_remainder_references']=[{}];rule(ap+'/scientific_process_runtime_remainder_references/0',js,'','record_reference','Exact original JSON freeze; original complete science verdict and limits retained, body prose unopened.')
    continue
   gs,gp=orig(old['original_grade_string']);review=gs
   for f in ['candidate_final_delivery','original_grade_string','original_grade_record','original_material_count','normalized_material_count','time_eligible','provenance_eligible']:
    oldcell(ap+'/'+f,old[f],True,'Exact original independently named field; original nulls/strings/count scopes retained.')
   for j,c in enumerate(old['candidate_final_identities_declared_only']):arm['candidate_final_identities_declared_only'].append({});oldcell(ap+'/candidate_final_identities_declared_only/'+str(j),c,scope='Declared exact candidate final identity; artifact body deliberately unopened.')
   for f in ['original_whole_mapped_artifact_status','original_judgment_verbatim']:
    if old.get(f):oldcell(ap+'/original_independent_review_terms/'+f,old[f],scope='Verbatim independent original review term; no cross-review normalization or ranking.')
   if sid=='C-01' and a=='control':
    host='historical/reviews/confirmation/C-01/control/source-review-v1/HOST_INCOMPLETE_REVIEW_FREEZE.json'
    enumrule(ap+'/scientific_judgment_available',host,'/assessment_disposition',{'UNASSESSED_HOLD':False},'Original interrupted-review UNASSESSED_HOLD; grade null and legacy defect0 do not represent assessment.')
   elif old['original_grade_string'].get('value') is not None:
    v=raw(gs,gp);enumrule(ap+'/scientific_judgment_available',gs,gp,{v:v!='UNASSESSED'},'Availability of this exact authored original scientific judgment only. UNASSESSED is unavailable; HOLD is an authored limited judgment, not full source assessment.')
   elif sid=='D-M01-A':
    enumrule(ap+'/scientific_judgment_available',review,'/scope/mode',{'independent diagnostic semantic source assessment':True},'Authored full diagnostic semantic judgment AVAILABLE although original numeric/categorical grade remains null.',bindings=[(review,'/scope/mode'),(review,'/scope/full_declared_semantic_scope_assessed')])
   elif sid=='I-FAST-01':
    enumrule(ap+'/scientific_judgment_available',os,'/science_assessment',{'UNASSESSED':False},'Original pair science UNASSESSED; treatment diagnostic attached separately, zero extra pair credit.')
   else:unknown(ap+'/scientific_judgment_available',gs,gp,'No exact available/unassessed original judgment declaration.','ABSENT_EXACT_FLAG')
   for newf,oldf in [('full_scientific_coverage','full_scientific_coverage'),('full_declared_primary_source_coverage','full_declared_source_coverage')]:
    c=old[oldf];s,p=orig(c);repair=COVERAGE_REPAIRS.get((sid,a))
    if repair:
     rp,context=repair
     if exists(review,rp) and raw(review,rp) in FULL_ENUMS:
      kind,scope=FULL_ENUMS[raw(review,rp)]
      if newf=='full_scientific_coverage' or kind=='primary':enumrule(ap+'/'+newf,review,rp,{raw(review,rp):True},scope,bindings=[(review,rp)]+[(review,z) for z in context if exists(review,z)]);continue
    if c.get('state')!='UNKNOWN':oldcell(ap+'/'+newf,c,True,'Original declared bounded source-science extent; never SourcePASS, empirical execution or provenance qualification.');continue
    reason='No exact full declared primary-source flag or explicitly source-bound full-scope enum. Existing coverage counts/axes and scientific completeness are not equivalent.' if newf=='full_declared_primary_source_coverage' else 'No exact full-scope completion flag/enum; original assessment census and source judgment retained without deriving coverage from counts.'
    unknown(ap+'/'+newf,s,p,reason,'METADATA_SCHEMA_GAP',bindings=[(review,z) for z in ['/scope','/assessment_extent','/coverage_census','/count_definition','/counts','/assessment_mode'] if exists(review,z)])
   # Scientific coverage and contract/source remainder are separate original dimensions.
   arm['scientific_process_runtime_remainder_references']=reference_cells(ap+'/scientific_process_runtime_remainder_references',old['original_assessment_dimensions'],'Original scope, obligation dispositions, source/provenance/history/runtime remainder, unchanged. Reference-only: no source-check or candidate prose opened.')
   # Formal review output delivery is separate from authored science and actual timely delivery.
   sources=[review]+[orig(c)[0] for c in cells(old.get('review_delivery_original',[]))]+[orig(old['delivered_assessment'])[0],orig(old['review_delivery_within_original_allowance'])[0]]
   sources=list(dict.fromkeys(sources));formal=None;timely=None
   for ss in sources:
    for pp in ['/delivery/readable_delivery_complete','/readable_delivery_complete','/required_review_outputs_delivered','/review_delivered']:
     if exists(ss,pp) and type(raw(ss,pp)) is bool:formal=(ss,pp,'explicit_bool');break
    for pp in ['/review_delivery_within_original_deadline','/delivery_in_review_deadline','/review_delivery_in_deadline','/valid_within_requested_bound']:
     if exists(ss,pp) and type(raw(ss,pp)) is bool:timely=(ss,pp);break
   # Exact arm-specific delivery records take precedence over aggregate task status.
   arm_delivery_candidates=[(os,op+'/arms/'+a+'/review_delivery_status'),(os,op+'/reviews/'+a+'/delivery_status'),(review,'/delivery_status')]
   formal_enums={'completed':True,'interrupted':False,'cancelled':False,'LATE_OUT_OF_BOUND':True}
   for ss,pp in arm_delivery_candidates:
    if exists(ss,pp) and isinstance(raw(ss,pp),str) and raw(ss,pp) in formal_enums:formal=(ss,pp,'enum_bool');break
   if formal:
    ss,pp,typ=formal
    if typ=='explicit_bool':rule(ap+'/review_formal_output_delivery',ss,pp,typ,'Original formal/readable required review delivery; authored science and timely delivery independent.',True)
    else:enumrule(ap+'/review_formal_output_delivery',ss,pp,formal_enums,'Dedicated original review delivery status. LATE_OUT_OF_BOUND is an authored late delivery, interrupted/cancelled lacks required formal completion.')
   elif old['delivered_assessment'].get('state')!='UNKNOWN':
    ss,pp=orig(old['delivered_assessment']);vv=raw(ss,pp)
    if type(vv) is bool:rule(ap+'/review_formal_output_delivery',ss,pp,'explicit_bool','Original explicit review delivery flag; no scientific coverage inference.',True)
    elif isinstance(vv,str) and vv in {'completed','interrupted','cancelled'}:
     enumrule(ap+'/review_formal_output_delivery',ss,pp,{'completed':True,'interrupted':False,'cancelled':False},'Original closed review carrier disposition, linked original review outputs retained; no source PASS or scope implication.')
    else:unknown(ap+'/review_formal_output_delivery',ss,pp,'Original carrier status is not an explicit required formal-output-delivery declaration.','METADATA_SCHEMA_GAP')
   else:
    ss,pp=orig(old['delivered_assessment']);unknown(ap+'/review_formal_output_delivery',ss,pp,'Authored scientific judgment may be available, but original formal-output delivery flag is absent.','METADATA_SCHEMA_GAP')
   if timely:rule(ap+'/review_actual_timely_delivery',*timely,'explicit_bool','Original actual review delivery within its original bound; no derived timestamp comparison.',True)
   elif old['review_delivery_within_original_allowance'].get('state')!='UNKNOWN':oldcell(ap+'/review_actual_timely_delivery',old['review_delivery_within_original_allowance'],True)
   else:
    ss,pp=orig(old['review_delivery_within_original_allowance']);unknown(ap+'/review_actual_timely_delivery',ss,pp,'Exact original actual dispatch-relative review delivery compliance is absent; observed-clock proxies and delivery seconds are not substituted.','ABSENT_EXACT_FLAG')
   if sid=='C-01' and a=='control':rule(ap+'/review_formal_output_delivery',host,'/required_files/REPORT.md','explicit_bool','Original required formal REPORT.md absent; partial authored metadata remains history.',True)
   # Native pipeline qualification is copied only from explicit qualification/gate declarations.
   oldcell(ap+'/native_pipeline_qualified',old['native_qualified'],True,'Original native qualification only; completion, terminal counts and file presence do not qualify it.')
   arm['original_eligibility_references']=reference_cells(ap+'/original_eligibility_references',[old.get('native_disposition_original',[]),old.get('provenance_original',[]),old.get('timing_original',[])],'Exact independent lifecycle/time/provenance/method original records; no merged eligibility inference.')
   if exists(os,op+'/qualified_method_comparison') and type(raw(os,op+'/qualified_method_comparison')) is bool:rule(ap+'/method_eligible',os,op+'/qualified_method_comparison','explicit_bool','Original matched method-comparison eligibility, pair-scoped flag retained on existing arm.',True)
   elif exists(os,op+'/eligibility/qualified_method_credit'):rule(ap+'/method_eligible',os,op+'/eligibility/qualified_method_credit','explicit_bool','Original method credit eligibility independent of source coverage.',True)
   elif sid.startswith('C-'):
    enumrule(ap+'/method_eligible',os,op+'/native_and_comparative_eligibility',{'HOLD':False,'DIAGNOSTIC_UNQUALIFIED':False},'Original confirmation comparative/method HOLD or diagnostic qualification; not scientific grade.')
   elif exists(os,op+'/matched_method_comparison'):
    enumrule(ap+'/method_eligible',os,op+'/matched_method_comparison',{'HOLD':False},'Original paired method comparison HOLD; standalone science does not upgrade it.')
   else:unknown(ap+'/method_eligible',os,op+'/method_eligible','Exact original method eligibility flag absent; retained original holds/context cannot manufacture a green qualifier.','ABSENT_EXACT_FLAG')
   # Original economic values stay named and unsummed; complex records are retained by source reference.
   for group,items in old.get('economics_original',{}).items():
    if isinstance(items,list):arm['economics_original'][group]=reference_cells(ap+'/economics_original/'+esc(group),items,'Exact original economic values/labels in frozen metadata; no ratios, sum, billing conversion or zero imputation.')
   if sid=='D-M13-A' and a=='control':
    unknown(ap+'/scientific_extent_at_review_deadline',review,'/assessment_extent_at_deadline','Original late-complete report describes inspections before expiry but does not supply a science extent boolean at actual deadline.','UNVERIFIED_OBLIGATION')
    for k in ['assessment_extent_at_deadline','unassessed_remainder_at_deadline','delivery_status','valid_within_requested_bound']:rule(ap+'/original_independent_review_terms/'+k,review,'/'+k)
   if old.get('standalone_exception_assessments'):arm['earlier_attempts_and_source_review_remainder']=reference_cells(ap+'/earlier_attempts_and_source_review_remainder',old['standalone_exception_assessments'],'Standalone original judgment of this existing arm; no additional logical arm or pair credit.')
  # Separate history, retained exact source refs rather than copying candidate/native ticket bodies.
  for field in ['version_history','review_history']:
   for j,hist in enumerate(s0.get(field,[])):
    r=hist.get('original_record',{});ss='historical/'+r.get('source','');pp=r.get('pointer','')
    if ss in b.files and exists(ss,pp):row[field].append({});rule(root+'/'+field+'/'+str(len(row[field])-1),ss,pp,'record_reference','Earlier attempts, source review remainder and failures preserved without replacing original grades.')
  row['shared_and_failed_cost_references']=reference_cells(root+'/shared_and_failed_cost_references',s0.get('shared_or_failure_inclusive_economics_original',[]),'Original shared seed/setup/failure-inclusive costs; no new ratios or sums.')
  if sid=='D-M07-A':
   row['shared_and_failed_cost_references']=[{}];rule(root+'/shared_and_failed_cost_references/0',os,op+'/economics')
  for j,extra in enumerate(s0.get('standalone_exception_assessments',[])):
   row['standalone_exception_assessments'].append({'original_assessment_reference':{},'extra_pair_credit':0,'extra_logical_arm_credit':0});ss,pp=orig(extra.get('original_grade_record',extra.get('original_grade_string',{})))
   # Existing baseline stores nested standalone records; retain their frozen historical record without inventing IDs.
   rule(root+'/standalone_exception_assessments/'+str(j)+'/original_assessment_reference','historical/CLOSED_SLOT_LEDGER.json','/slots/'+str(i)+'/standalone_exception_assessments/'+str(j),'record_reference','Standalone diagnostic attached to existing arm, never extra slot/pair credit.')
  # Original pair eligibility and winner fields remain source-scoped, never a recomputed quality ranking.
  if sid=='D-M07-A':enumrule(root+'/paired/method_eligible','closed_link/jobs/D-M07-A/V3_PAIR_FREEZE.json','/comparative_eligibility',{'HOLD_DIAGNOSTIC_FULL_SOURCE_REVIEWS_ONLY':False},'Original explicit native/provenance comparative HOLD, full-science FAIL/FAIL independent.')
  elif sid.startswith('C-'):enumrule(root+'/paired/method_eligible',os,op+'/native_and_comparative_eligibility',{'HOLD':False,'DIAGNOSTIC_UNQUALIFIED':False},'Original confirmation comparative eligibility; no qualified confirmation credit.')
  else:
   r={'output_pointer':root+'/paired/method_eligible','transformation':'all_three_valued','critical':True,'components':[root+'/arms/'+a+'/method_eligible' for a in ['control','treatment']],'scope':'Three-valued original method eligibility only; never a science grade.'};entries.append(r)
  winpaths=[op+'/eligibility/source_method_win_established',op+'/quality_preserving_win_established',op+'/source_quality_preserving_speed_win_established',op+'/quality_preserving_win',op+'/source_quality_preserving_speed_win']
  win=next((p for p in winpaths if exists(os,p) and type(raw(os,p)) is bool),None)
  if win:rule(root+'/paired/quality_preserving_win_established',os,win,'explicit_bool','Exact original quality-preserving win established flag, never recomputed from grades/timing.',True)
  elif s0['qualified_quality_preserving_win'].get('state')!='UNKNOWN':oldcell(root+'/paired/quality_preserving_win_established',s0['qualified_quality_preserving_win'],True,'Original independent quality-preserving win flag only.')
  else:unknown(root+'/paired/quality_preserving_win_established',os,op+'/quality_preserving_win_established','No exact original per-pair quality-preserving winner flag. Independent terms/times cannot be ranked or forced to a win.','ABSENT_EXACT_FLAG')
  if sid in {'I-METHOD-02','I-FAST-01'}:
   path='/paired_source_assessment/control/judgment' if sid=='I-METHOD-02' else '/science_assessment'
   enumrule(root+'/paired/scientific_judgment_available',os,path,{'UNASSESSED':False},'Original pair UNASSESSED, separate T-only diagnostic remains attached with zero additional pair credit.')
  else:entries.append({'output_pointer':root+'/paired/scientific_judgment_available','transformation':'all_three_valued','components':[root+'/arms/'+a+'/scientific_judgment_available' for a in ['control','treatment']],'critical':True,'scope':'Both original arm judgments available; availability is independent of source/full coverage.'})
 # Pair coverage/delivery uses explicit three-valued conjunction, with source values retained.
 for field in ['full_scientific_coverage','full_declared_primary_source_coverage','review_formal_output_delivery','review_actual_timely_delivery']:
  outfield='both_'+field;entries.append({'output_pointer':root+'/paired/'+outfield,'transformation':'all_three_valued','components':[root+'/arms/'+a+'/'+field for a in ['control','treatment']],'critical':True,'gap_category':'COMPONENT_UNKNOWN','scope':'false if any explicit false, true only if both explicit true; otherwise UNKNOWN.'})
 entries.append({'output_pointer':root+'/paired/primary_source_coverage_values','transformation':'paired_values','components':[root+'/arms/'+a+'/full_declared_primary_source_coverage' for a in ['control','treatment']],'scope':'Ordered original control,treatment source-coverage flags; not science grades.'})

# Named critical repairs with explicit original scope bindings; no counts are used as flags.
for i,s0 in enumerate(base['slots']):
 sid=s0['slot_id'];root='/slots/'+str(i)
 if sid in held:continue
 os,op=owner(sid)
 for a in ['control','treatment']:
  ap=root+'/arms/'+a;old=s0['arms'][a];arm=template['slots'][i]['arms'][a]
  gs,gp=orig(old['original_grade_string'])
  if sid=='D-M01-B':
   enumrule(ap+'/full_declared_primary_source_coverage',gs,'/status',{'complete_semantic_review_with_qualifications':True},'Original complete repaired semantic SOURCE review of mapped final/intermediates and governing primary facts; process/raster-runtime and dispatch-time unknowns stay separate.',bindings=[(gs,'/status'),(gs,'/repair_scope/authorized'),(gs,'/overall_semantic_judgment'),(gs,'/coverage_census/scope_rule')])
  if sid=='D-M02-A':
   label='X' if a=='control' else 'Y';pp='/labels/'+label+'/scientific_correctness/full_supplied_scientific_scope_assessed'
   rule(ap+'/full_declared_primary_source_coverage',gs,pp,'explicit_bool','Original full supplied scientific primary-source scope. Governing exception defects, process and external empirical groups remain separate.',True,bindings=[(gs,'/review_status'),(gs,'/authorization_and_scope/artifacts')])
  if sid=='D-M02-B':
   rule(ap+'/full_declared_primary_source_coverage',gs,'/review_complete','explicit_bool','Original completed declared scientific primary-source scope for final and mandatory intermediates. Conditional support is not unqualified whole-artifact PASS.',True,bindings=[(gs,'/scope/authorized_inputs'),(gs,'/scope/scientific_scope'),(gs,'/scope/excluded')])
  if sid=='D-M15-A' and a=='treatment':
   for f in ['full_scientific_coverage','full_declared_primary_source_coverage']:
    rule(ap+'/'+f,gs,'/assessment_extent/all_consequential_claims_assessed','explicit_bool','Original entire consequential material science checked contextually against primary sources, with every declared obligation; historical acquisition and execution limits remain separate.',True,bindings=[(gs,'/assessment_extent/all_declared_obligations_assessed'),(gs,'/assessment_extent/declared_source_scope'),(gs,'/assessment_extent/reading_extent')])
  if sid=='I-METHOD-01' and a=='control':
   exact='both_original_arms_terminal_and_full_independent_assessments_frozen'
   for f in ['full_scientific_coverage','full_declared_primary_source_coverage']:
    enumrule(ap+'/'+f,os,'/status',{exact:True},'Exact original full independent assessments disposition for this original pair, explicitly bound to control Source review scope. It describes assessment extent, not satisfaction or SourcePASS.',bindings=[(os,'/status'),(os,'/science/control/source_judgment'),(os,'/science/control/coverage/count_definition')])
  if sid=='I-FAST-01' and a=='control':
   exact=raw(os,'/science_assessment')
   enumrule(ap+'/scientific_judgment_available',os,'/science_assessment',{exact:False},'Exact original UNASSESSED paired science disposition, unchanged. Treatment-only diagnostic does not create a new pair or arm.',bindings=[(os,'/science_assessment'),(os,'/source_judgment')])
  if sid=='I-FAST-01':
   exact=raw(os,'/science_assessment');enumrule(root+'/paired/scientific_judgment_available',os,'/science_assessment',{exact:False},'Original pair science UNASSESSED; standalone treatment diagnosis retained, zero extra pair credit.',bindings=[(os,'/science_assessment'),(os,'/source_judgment')])
  if old['native_qualified'].get('transformation')=='enum_bool' and 'terminal' in old['native_qualified']['original']['pointer']:
   ss,pp=orig(old['native_qualified']);unknown(ap+'/native_pipeline_qualified',ss,pp,'Original native terminal disposition is retained, but is not a pipeline-qualification flag; no terminal-to-qualification conversion.','METADATA_SCHEMA_GAP')
   rule(ap+'/native_terminal_status_original',ss,pp)
  # Preserve original scientific-scope declarations, including full authored science with no machine flag.
  decl=[]
  for pp in ['/review_status','/review_scope','/scope','/authorization_and_blinding/scope','/assessment_extent','/assessment_mode','/full_requirement_closure','/grade_scope','/count_semantics','/count_definition','/counting_rules']:
   if exists(gs,pp):decl.append({});rule(ap+'/scientific_extent_original_declarations/'+str(len(decl)-1),gs,pp,'record_reference','Original source/science scope and explicitly excluded process/history/runtime obligations; no boolean forced from counts or prose.')
  arm['scientific_extent_original_declarations']=decl
  # Dedicated original eligibility declarations are preserved inline when small scalar/object records.
  arm['native_time_provenance_method_original']=[]
  for pp in [op+'/native_and_comparative_eligibility',op+'/native_provenance_comparative_disposition',op+'/original_qualified_native_gate',op+'/matched_method_comparison',op+'/timing_eligibility',op+'/provenance_eligibility',op+'/comparative_qualification',op+'/qualified_method_comparison']:
   if exists(os,pp):arm['native_time_provenance_method_original'].append({});rule(ap+'/native_time_provenance_method_original/'+str(len(arm['native_time_provenance_method_original'])-1),os,pp,scope='Verbatim original non-scientific disposition; no native-green inference.')
  # Explicit timely-delivery TRUE establishes formal delivery. FALSE does not imply no formal delivery.
  timely=[r for r in entries if r['output_pointer']==ap+'/review_actual_timely_delivery'][-1]
  if timely['transformation']=='explicit_bool' and raw(timely['original']['source'],timely['original']['pointer']) is True:
   rule(ap+'/review_formal_output_delivery',timely['original']['source'],timely['original']['pointer'],'explicit_bool','Original explicit required review delivery within original deadline is TRUE, hence formal delivery is available; no scientific-scope/grade inference.',True)
  if sid=='D-M07-A':continue
  if sid in {'D-M12-A','D-M14-A','D-M15-A'} or (sid=='D-M13-A' and a=='treatment'):
   pp=op+'/reviews/'+a+'/lifecycle'
   if exists(os,pp) and raw(os,pp)=='COMPLETED_QUIET_SETTLED':
    enumrule(ap+'/review_formal_output_delivery',os,pp,{'COMPLETED_QUIET_SETTLED':True},'Exact original completed CLOSED reviewer carrier with its original frozen review files; formal delivery only.',bindings=[(os,pp),(os,op+'/reviews/'+a+'/record'),(os,op+'/reviews/'+a+'/freeze')])
 if sid=='D-M07-A':
  row=template['slots'][i];row['original_closed_comparative_hold']={};rule(root+'/original_closed_comparative_hold',os,op+'/native_provenance_comparative_disposition')

# Contract closure that includes procedural facets is not PRIMARY source coverage.
for sid,a in [('I-FAST-03','control'),('I-FAST-01','treatment')]:
 i=next(i for i,x in enumerate(base['slots']) if x['slot_id']==sid);ap='/slots/'+str(i)+'/arms/'+a
 old=base['slots'][i]['arms'][a];ss,pp=orig(old['full_declared_source_coverage'])
 oldcell(ap+'/original_full_declared_contract_coverage',old['full_declared_source_coverage'],scope='Original whole declared contract/source-process closure flag, retained independently of primary source science.')
 unknown(ap+'/full_declared_primary_source_coverage',ss,pp,'Original whole-contract closure includes procedural/history requirements and is not an explicitly equivalent PRIMARY source-coverage flag. Exact scientific content judgment and separate unresolved process obligations are preserved.','METADATA_SCHEMA_GAP',bindings=[(ss,pp)])
 if sid=='I-FAST-03':
  review='historical/reviews/integrated-methods/I-FAST-03/control/review-v1/coverage.json'
  rule(ap+'/original_scientific_scope_unit_counts',review,'/counts/scientific_scope_units',scope='Original 49/49 scientific scope count object, never used to create a boolean or PASS.')
  rule(ap+'/original_external_process_facet_counts',review,'/counts/external_process_facets',scope='Original 2 unassessed external process facets, separate from source-content completion.')
# Original small economic numbers/labels are copied exactly; larger records remain exact references.
for i,row in enumerate(template['slots']):
 if row['closure']!='CLOSED':continue
 for a,arm in row['arms'].items():
  arm['economics_original']['critical_scalar_values_original']=[];seen=set();ap='/slots/'+str(i)+'/arms/'+a
  for c in cells(base['slots'][i]['arms'][a].get('economics_original',{})):
   ss,pp=orig(c)
   if (ss,pp) in seen or not exists(ss,pp):continue
   vv=raw(ss,pp)
   if isinstance(vv,(dict,list)):continue
   leaf=pp.split('/')[-1].lower()
   if not any(t in leaf for t in ['second','minute','billing','token','quota','overlap','cost','charge','setup','seed','includes_failed','interpretation']):continue
   seen.add((ss,pp));j=len(arm['economics_original']['critical_scalar_values_original']);arm['economics_original']['critical_scalar_values_original'].append({})
   rule(ap+'/economics_original/critical_scalar_values_original/'+str(j),ss,pp,scope='Exact original economic number, null or label; units/names remain original, counters unsummed, no new ratio/billing/zero.')

# Each rule is fixed now. Duplicate outputs indicate a more specific override; retain only the last declaration.
unique={r['output_pointer']:r for r in entries};entries=list(unique.values())
for r in entries:
 if r['output_pointer'].endswith(('/full_scientific_coverage','/full_declared_primary_source_coverage')) and r['transformation']=='explicit_bool' and not r.get('semantic_bindings'):
  ss=r['original']['source'];pp=r['original']['pointer'];context=[z for z in ['/scope','/assessment_extent','/assessment_mode','/grade_scope','/count_semantics','/count_definition'] if exists(ss,z)]
  r['semantic_bindings']=[{'original':ref(ss,z),'exact_value':raw(ss,z)} for z in [pp]+context]
# Stable ordering: arms first, derived pair values second; dictionary replacement retains source order safely.
entries.sort(key=lambda r:0 if r['transformation'] not in {'all_three_valued','paired_values'} else 1)
fmap={'schema':'ER10_SUPPLEMENTAL_CRITICAL_FIELD_MAP_V2','json_pointer_standard':'RFC6901; ~0/~1 escaping, exact array ordinals, empty string is root.','authority':'Finite metadata field mapping only. Original judgment terms are immutable and never cross-review ranked.','baseline_identity':b.ref('historical/CLOSED_SLOT_LEDGER.json',''),'input_manifest':'INPUT_IDENTITIES.json','critical_arm_fields':CRITICAL,'field_definitions':{'scientific_judgment_available':'Original authored scientific judgment available, including diagnostic or HOLD; not full coverage or formal/timely delivery.','review_formal_output_delivery':'Original formal required output delivery disposition, distinct from scientific authorship.','review_actual_timely_delivery':'Exact original flag for review delivery within actual original allowance; no elapsed arithmetic.','full_scientific_coverage':'Entire declared bounded scientific-content assessment, independent of grade, history and empirical execution.','full_declared_primary_source_coverage':'Exact original declared source-assessment extent or predeclared source-scoped equivalent. Unverified original source obligations remain separate and cannot become PASS.','native_pipeline_qualified':'Original pipeline qualification only; terminal completion does not imply active observation or native eligibility.','method_eligible':'Original matched method credit/eligibility separate from science, time and provenance.','normalized_material_count':'Original count only in its assessed scope; C01 unassessed count0 is retained original and normalized null.'},'transformations':{'identity':'Copy original JSON type/value verbatim.','explicit_bool':'Only original JSON true/false, otherwise UNKNOWN.','enum_bool':'Only finite exact declared original enum with byte-bound source semantics; no substring, counts, axis or terminal coverage inference.','string_only':'Original string unchanged; null retained without manufactured grade.','declared_identity_present':'Original candidate delivery identity presence only, no quality/native inference and no artifact-body reads.','record_reference':'Preserve exact original source bytes/hash/pointer as reference-only context/history/economics.','constant_bound':'Frozen non-scientific reporting binding to original index/config.','unassessed_material_null':'Normalize unassessed material count to null, retain original0 separately.','unknown':'Explicit unresolved mapping with exact source pointer and reason.','all_three_valued':'false if any explicit false, true if all explicit true, otherwise UNKNOWN.','paired_values':'Ordered original control,treatment values, never a grade.'},'edition_selection':'Fixed historical final-authorized editions; M07A original closed v3 added. No best-of, new versions, dynamic current path or reopening held science.','ledger_template':template,'entries':entries}
write(HERE/'SUPPLEMENTAL_FIELD_MAP.json',fmap)
print(json.dumps({'rules':len(entries),'enum_rules':sum(r['transformation']=='enum_bool' for r in entries),'critical_arm_fields':len(CRITICAL),'status':template['status']}))
