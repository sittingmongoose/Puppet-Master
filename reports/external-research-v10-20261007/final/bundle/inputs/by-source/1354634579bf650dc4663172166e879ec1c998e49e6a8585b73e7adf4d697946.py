#!/usr/bin/env python3
"""Finite offline ER10 reporting adapter. No network, workers, Goals or regrading."""
import argparse, hashlib, json, re, sys
from pathlib import Path
from datetime import datetime, timezone, timedelta
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
HELD = {'D-M06-A','D-M06-B','D-M07-A','D-M07-B','D-M09-A'}

def digest(raw): return hashlib.sha256(raw).hexdigest()
def dump(path, value):
    if not path.resolve().is_relative_to(HERE):raise ValueError('write outside authorized report directory')
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False)+'\n', encoding='utf-8')
def local_snapshot(identity):
    rel=identity['relative_path']
    if rel.startswith('@'):return HERE/rel[1:]
    return HERE/('captures' if identity['kind']=='linked_closed_metadata' else 'inputs')/rel
def esc(s): return str(s).replace('~','~0').replace('/','~1')
def walk(x, p=''):
    if isinstance(x,dict):
        for k,v in x.items(): yield from walk(v,p+'/'+esc(k))
    elif isinstance(x,list):
        for k,v in enumerate(x): yield from walk(v,p+'/'+str(k))
    else: yield p,x

def at(x,p):
    for t in p.split('/')[1:] if p else []:
        t=t.replace('~1','/').replace('~0','~')
        x=x[int(t)] if isinstance(x,list) else x[t]
    return x

def allowed(rel):
    if Path(rel).is_absolute() or '..' in Path(rel).parts:return False
    if any(s in rel for s in HELD): return False
    name=Path(rel).name
    if not rel.endswith('.json'): return False
    if rel.startswith('reviews/'):
        return name in {'COMPARISON.json','judgment.json','pair-freeze.json','diagnostic-gate-exception-v2.json','REVIEW.json','review.json','coverage.json','REVIEW_FREEZE.json','HOST_REVIEW_FREEZE.json','HOST_INCOMPLETE_REVIEW_FREEZE.json','frozen-review.json','frozen-standalone-review.json','freeze.json','freeze_disposition.json','partial-status.json','protocol-deviation-001.json','FAILURE_INCLUSIVE_RUN_TIMES.json'}
    if rel.startswith('helpers/'):
        return bool(re.search(r'(COMPARISONS.*|comparison-v\d+|.*pair-disposition-v\d+|.*disposition|.*terminal-economics-v\d+|economics-inclusive|.*pair-freeze(?:-v\d+)?)\.json$',name))
    if rel.startswith('state/'):
        return name in {'C-03-failed-native-diagnostic-review-gate-exception-v1.json','I-METHOD-02-v2-treatment-only-diagnostic-gate-exception-v1.json','I-FAST-01-treatment-only-diagnostic-gate-exception-v1.json'}
    return rel.startswith('jobs/') and name=='V3_PAIR_FREEZE.json'

class Sources:
    def __init__(self):
        self.cfg=json.loads((HERE/'config.json').read_bytes())
        self.inputs=json.loads((HERE/'INPUTS.json').read_bytes())
        global ROOT
        ROOT=Path(self.inputs['campaign_root'])
        self.docs={}; self.ids={}; self.failures=[]; self.links=[]
        # Verify every supplied original before opening any additional linked metadata.
        for f in self.inputs['files']:
            raw=(HERE/'inputs'/f['relative_path']).read_bytes()
            if digest(raw)!=f['sha256'] or len(raw)!=f['bytes']: raise ValueError('immutable input identity mismatch '+f['relative_path'])
            self.docs[f['relative_path']]=json.loads(raw)
            self.ids[f['relative_path']]={**f,'kind':'immutable_input','identity_verified':True}
        for name in ('config.json','INPUTS.json'):
            raw=(HERE/name).read_bytes()
            self.docs['@'+name]=json.loads(raw)
            self.ids['@'+name]={'relative_path':'@'+name,'snapshot_path':str(HERE/name),'sha256':digest(raw),'bytes':len(raw),'kind':'control_input','identity_verified':True}
        manifest=HERE/'CAPTURE_MANIFEST.json'
        if manifest.exists():
            m=json.loads(manifest.read_bytes()); self.links=m['links']; self.failures=m['unavailable']
            for f in m['files']:
                raw=local_snapshot(f).read_bytes()
                if digest(raw)!=f['sha256'] or len(raw)!=f['bytes']:raise ValueError('captured identity mismatch '+f['relative_path'])
                self.docs[f['relative_path']]=json.loads(raw);self.ids[f['relative_path']]=f
    def capture(self):
        deadline=datetime.fromisoformat(self.cfg['deadline'])-timedelta(seconds=self.cfg['writing_reserve_seconds'])
        queue=list(self.docs); seen=set(queue); extras=[v for v in self.ids.values() if v['kind']=='linked_closed_metadata']; count=len(extras); size=sum(v['bytes'] for v in extras)
        while queue:
            if datetime.now(timezone.utc)>=deadline:raise RuntimeError('absolute writing reserve reached; no more linked reads')
            src=queue.pop(0)
            for p,v in walk(self.docs[src]):
                if not isinstance(v,str) or not v.endswith('.json'):continue
                if v.startswith(str(ROOT)+'/'):rel=v[len(str(ROOT))+1:]
                elif v.startswith(('reviews/','helpers/','jobs/')):rel=v
                elif '/' not in v and not any(c.isspace() for c in v):rel=str(Path(src).parent/v)
                else:continue
                if not allowed(rel):continue
                self.links.append({'source':src,'pointer':p,'target':rel})
                if rel in seen:continue
                seen.add(rel); source=ROOT/rel
                if not source.is_file():self.failures.append({'source':src,'pointer':p,'target':rel,'reason':'linked metadata file absent'});continue
                n=source.stat().st_size
                if count+1>self.cfg['extra_linked_metadata_max_files'] or size+n>self.cfg['extra_linked_metadata_max_bytes']:raise RuntimeError('closed metadata cap reached')
                raw=source.read_bytes()
                dest=HERE/'captures'/rel;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw)
                identity={'relative_path':rel,'original_path':str(source),'snapshot_path':str(dest),'sha256':digest(raw),'bytes':len(raw),'capture_at':datetime.now(timezone.utc).isoformat(),'kind':'linked_closed_metadata','identity_verified':True,'linked_from':{'source':src,'pointer':p}}
                self.ids[rel]=identity;count+=1;size+=len(raw)
                # Read judgment/coverage metadata only after retaining its exact bytes.
                self.docs[rel]=json.loads(raw);queue.append(rel)
        self.links=list({(x['source'],x['pointer'],x['target']):x for x in self.links}.values())
        self.failures=list({(x['source'],x['pointer'],x['target']):x for x in self.failures}.values())
        dump(HERE/'CAPTURE_MANIFEST.json',{'schema':'closed-metadata-byte-capture-v1','files':[v for v in self.ids.values() if v['kind']=='linked_closed_metadata'],'links':self.links,'unavailable':self.failures,'additional_files':count,'additional_bytes':size,'base_verified_before_linked_reads':True})
        print(json.dumps({'additional_files':count,'additional_bytes':size,'unavailable':self.failures}))

# Every normalized value is a replayable evidence cell. Missing is never failure.
TRANSFORMS = {
 'identity':'Copy the original JSON value without rewording or changing type.',
 'explicit_bool':'Copy only an original JSON boolean; other types become UNKNOWN.',
 'string_only':'Copy the original string verbatim; null or absent remains null.',
 'enum_bool':'Map only the listed exact original categorical values; no substring or count inference.',
 'nonnull_identity':'Non-null exact original delivery identity is present; no body read, quality or native inference.',
 'constant_bound':'Fixed reporting/index choice, bound to the cited original index/config field.',
 'unassessed_material_null':'Original material count is retained separately; normalized count is null when original scientific grade is null.',
 'all_explicit':'Three-valued conjunction: false if an explicit component is false, true only if all components are explicitly true, otherwise UNKNOWN.',
}
class Adapter:
    def __init__(self,s): self.s=s
    def e(self,src,p='',op='identity',mapping=None,constant=None):
        ref={'source':src,'pointer':p,'sha256':self.s.ids.get(src,{}).get('sha256')}
        try: raw=at(self.s.docs[src],p); exists=True
        except (KeyError,IndexError,TypeError,ValueError):raw=None;exists=False
        value=raw;missing=None;state='KNOWN'
        if not exists:state='UNKNOWN';missing={'source':src,'pointer':p,'reason':'exact original field absent or source unavailable'}
        if op=='explicit_bool' and type(raw) is not bool: value=None;state='UNKNOWN';missing={'source':src,'pointer':p,'reason':'explicit original boolean absent; no promotion from counts/axis labels/Goal completion'}
        elif op=='string_only' and not isinstance(raw,str):value=None;state='UNKNOWN';missing={'source':src,'pointer':p,'reason':'original categorical/string judgment missing or null'}
        elif op=='enum_bool':
            value=mapping.get(raw) if isinstance(raw,str) else None
            if value is None:state='UNKNOWN';missing={'source':src,'pointer':p,'reason':'original value not in the exact declared enum map'}
        elif op=='nonnull_identity':
            value=raw is not None if exists else None
        elif op=='constant_bound':value=constant
        elif op=='unassessed_material_null':value=None;state='UNKNOWN';missing={'source':src,'pointer':p,'reason':'original grade null; count cannot express an assessed scientific material count'}
        if exists and raw is None and op=='identity':state='KNOWN_NULL'
        return {'value':value,'state':state,'original':ref,'transformation':op,**({'enum_map':mapping} if mapping is not None else {}),**({'constant':constant} if op=='constant_bound' else {}),**({'missing_field':missing} if missing else {})}
    def unknown(self,src,p,reason):
        c=self.e(src,p,'explicit_bool');c['value']=None;c['state']='UNKNOWN';c['missing_field']={'source':src,'pointer':p,'reason':reason};return c
    def first(self,choices,op='identity',mapping=None):
        for src,p in choices:
            try:at(self.s.docs[src],p)
            except (KeyError,IndexError,TypeError,ValueError):continue
            c=self.e(src,p,op,mapping)
            if op=='explicit_bool' and c['state']=='UNKNOWN':continue
            return c
        src,p=choices[0];return self.e(src,p,op,mapping)
    def fields(self,src,p,keys):
        try:d=at(self.s.docs[src],p)
        except (KeyError,IndexError,TypeError):return []
        if not isinstance(d,dict):return []
        return [self.e(src,p+'/'+esc(k)) for k in keys if k in d]
    def dimensions(self,src,p=''):
        return {
          'scientific_coverage_original':self.fields(src,p,['coverage','coverage_census','claim_coverage_census','counts','exact_counts','assessment_extent','assessment_mode','grade_scope','scope','count_definition','counting_rule','count_semantics','full_contract_counts','full_declared_contract_counts_including_external_facets']),
          'remaining_obligations_original':self.fields(src,p,['unassessed','unassessed_obligations','unassessed_obligation_ids','unassessed_ids','unassessed_required_obligations','unassessed_scientific_scope','unassessed_scientific_units','unassessed_consequential_findings','unassessed_consequential_ids','unassessed_consequential_check_ids','unassessed_declared_scientific_scope','unassessed_scientific_remainder','unassessed_semantic_remainder','unassessed_material_scientific_content_remainder','unassessed_remainder','all_remaining_scope_unassessed','coverage_disposition']),
          'process_history_original':self.fields(src,p,['process_history','candidate_process_claims','process_claim_groups','external_process_facets','unresolved_required_process_evidence','unassessed_runtime_or_provenance_remainder','preservation','preservation_result','proposed_vs_executed','executed_vs_proposed','excluded_host_fields','host_only_not_adjudicated','host_only_unknowns','original_grades_and_failures','original_supplied_grades','prior_attempt_preserved']),
          'empirical_runtime_limits_original':self.fields(src,p,['runtime_validation','runtime_limitation','execution_boundary','verification_limits','source_scope_limits','review_limits','limitations','limits','not_executed','unassessed_remainder_explanation','remaining_unknowns','remaining_uncertainty','remaining_uncertainty_and_unassessed_scope','candidate_proposed_checks_vs_execution','empirical_runtime_unassessed_groups','application_validation_executed_by_reviewer','application_validation_credited_to_artifact']),
          'axes_obligation_judgments_original':self.fields(src,p,['axes','six_axes','six_axis_dispositions','obligations','obligations_original','obligation_dispositions','obligation_coverage','O1_O6','O1_O6_P1_P6','original_obligations','brief_obligations']),
          'scientific_axis_grades_original':self.fields(src,p,['source_correctness','completeness','planning_usefulness','breadth','whole_mapped_artifact_status','required_intermediates_scientific_status','artifact_semantic_statuses','scientific_correctness','source_pass','full_positive','scientific_full_positive','full_pass','full_artifact_scientific_pass','overall_assessment']),
        }
    def economics(self,src,p=''):
        try:d=at(self.s.docs[src],p)
        except (KeyError,IndexError,TypeError):return {'original':self.e(src,p)}
        if not isinstance(d,dict):return {'original':self.e(src,p)}
        groups={k:[] for k in ['request_to_required_delivery','occupied_work','cold_setup_queue_handoff','native_cumulative_counters_unsummed','sdk_recorded_supplement_not_billing','distinct_usage_and_quota','measurement_limits','other_original_timing_metadata']}
        for k in d:
            low=k.lower()
            if low in {'source_quality','source_grade','defects','quality','assessment_extent','source_indices','outputs','review','source_ops_and_first_finding_authority','native_identity_terminal_projections'}:continue
            if any(t in low for t in ['native','goal']) and any(t in low for t in ['counter','usage','token']):group='native_cumulative_counters_unsummed'
            elif 'sdk' in low:group='sdk_recorded_supplement_not_billing'
            elif any(t in low for t in ['billing','token','usage','quota','provider_input','provider_cached','provider_generated','reasoning']):group='distinct_usage_and_quota'
            elif any(t in low for t in ['occupied','occupancy','admitted_stage','stage_sum','interval']):group='occupied_work'
            elif any(t in low for t in ['queue','setup','cold','prepar','handoff','between_stage','common_t0','seed','render','amortiz']):group='cold_setup_queue_handoff'
            elif any(t in low for t in ['delivery','terminal','latency','request_to','dispatch_to','usable']):group='request_to_required_delivery'
            elif any(t in low for t in ['limit','note','scope','overlap','cost','unsummed','no_cumulative','interpretation']):group='measurement_limits'
            else:group='other_original_timing_metadata'
            groups[group].append(self.e(src,p+'/'+esc(k)))
        # Preserve nested recorded economic quantities under their original names.
        # A recorded SDK supplement is never relabeled provider billing.
        for q,v in walk(d):
            pieces=q.lower().split('/');leaf=pieces[-1];full=q.lower()
            if any(z in pieces for z in ['quality','source_quality','assessment_extent','reviews','review','defects','source_indices','outputs']):continue
            if 'sdk' in full:group='sdk_recorded_supplement_not_billing'
            elif any(z in full for z in ['native','goal']) and any(z in full for z in ['counter','usage','token']):group='native_cumulative_counters_unsummed'
            elif any(z in leaf for z in ['billing','input_token','cached_input','generated_token','reasoning_token','output_token']):group='distinct_usage_and_quota'
            else:continue
            pointer=p+q
            if not any(c['original']['pointer']==pointer for c in groups[group]):groups[group].append(self.e(src,pointer))
        groups['policy']='No sums, billing conversion, pure-compute interpretation, zero imputation or new speed ratios.'
        return groups
    def final_metadata(self,src,p,arm,label=None):
        """Project only declared delivery identities; never open the candidate files."""
        try:d=at(self.s.docs[src],p)
        except (KeyError,IndexError,TypeError):return []
        out=[]
        if isinstance(d,dict):
            for k in ['final','final_path','final_sha256','final_hash','frozen_artifact','frozen_output','reviewed_final_artifact','reviewed_final_path','reviewed_final_sha256','final_artifact','candidate_artifact','required_output','output_sha256','output_bytes','final_files','delivery','outputs']:
                if k in d:out.append(self.e(src,p+'/'+esc(k)))
        # Identity inventories may be keyed by file path or X/Y logical labels.
        for top in ['artifact_register','reviewed_artifacts','reviewed_input_sha256s','reviewed_candidate_capture_sha256s','files','finals','final_identities']:
            if top not in self.s.docs[src]:continue
            x=self.s.docs[src][top]
            if isinstance(x,dict):it=x.items()
            elif isinstance(x,list):it=enumerate(x)
            else:continue
            for k,v in it:
                text=str(k)+' '+(str(v.get('path',''))+' '+str(v.get('artifact','')) if isinstance(v,dict) else '')
                if ('final.md' not in text and 'artifact.md' not in text) or ('source' in text and 'source-review' not in text):continue
                matched=('/'+arm+'/' in text or (label and ('/'+label+'/' in text or text.startswith(label+'/') or str(k).startswith(label+'_'))))
                if matched:out.append(self.e(src,'/'+top+'/'+esc(k)))
        if isinstance(d,dict) and isinstance(d.get('scope'),dict) and 'frozen_final' in d['scope']:out.append(self.e(src,p+'/scope/frozen_final'))
        return out
    def bool_from_scope(self,src,p,scientific=True):
        paths=['full_scope_assessed','full_scope','full_declared_scope_assessed','full_declared_scope_checked','full_declared_scientific_scope_assessed','entire_declared_scientific_scope_assessed','source_content_coverage_complete','full_supplied_scientific_scope_assessed','full_scope_assessment_complete','assessment_scope_complete','assessment_complete','assessment_completed','assessment_coverage_complete','complete_scope_assessed']
        if not scientific:paths=['full_scope_assessed','full_scope','full_declared_contract_coverage_complete','full_declared_scope_assessed','full_declared_scope_checked','full_declared_scientific_scope_assessed','entire_declared_scientific_scope_assessed','full_scope_assessment_complete','assessment_scope_complete','assessment_complete','assessment_coverage_complete','complete_scope_assessed']
        choices=[(src,p+'/'+k) for k in paths]+[(src,p+'/grade_scope/'+k) for k in ['entire_declared_scope_assessed','entire_declared_source_scope_assessed','every_original_integrated_obligation_assessed','all_candidate_groups_assessed']]
        c=self.first(choices,'explicit_bool')
        if c['state']!='UNKNOWN':return c
        # These are explicit extent declarations, never axis/count labels.
        enums=['FULL_DECLARED_SCOPE','FULL_SCOPE_STATIC_SOURCE_REVIEW','FULL_DECLARED_SCOPE_PRIMARY_SOURCE_REVIEW','FULL_DECLARED_SCOPE_STATIC_PRIMARY_SOURCE_REVIEW','FULL_DECLARED_CLAIM_SCOPE_CHECKED','FULL_DECLARED_SOURCE_SCIENCE_AND_MAPPED_ARTIFACT_SCOPE','FULL_DECLARED_MATERIAL_SCOPE','FULL_DECLARED_MATERIAL_SOURCE_SCIENCE_SCOPE']
        if scientific:enums+=['FULL_FROZEN_MATERIAL_SCIENCE_CHECK_WITH_UNASSESSED_HISTORICAL_PROVENANCE']
        for q in [p+'/coverage',p+'/assessment_extent',p+'/assessment_extent/status',p+'/assessment_extent/disposition',p+'/assessment_extent/label',p+'/assessment_extent/extent',p+'/assessment_extent/extent_class',p+'/grade_scope/mode',p+'/grade_scope/extent']:
            e=self.e(src,q,'enum_bool',{x:True for x in enums})
            if e['state']!='UNKNOWN':return e
        return c
    def material(self,src,p):
        return self.first([(src,p+'/'+k) for k in ['material_defect_count','material_error_count','material_errors','material_defects_count']]+[(src,p+'/counts/material_error_count')])
    def arm(self,slot,arm,version,version_ref,primary,review,gradep,label=None,extras=None):
        src,p=primary;r, rp=review
        g=self.e(r,gradep,'string_only')
        # If grade itself is an original object, its explicit status is the string.
        try:raw=at(self.s.docs[r],gradep)
        except (KeyError,IndexError,TypeError):raw=None
        if isinstance(raw,dict):g=self.e(r,gradep+'/status','string_only')
        original_grade=self.e(r,gradep)
        finalmeta=self.final_metadata(src,p,arm,label)+self.final_metadata(r,rp,arm,label)
        delivery=self.first([(src,p+'/'+k) for k in ['full_carrier_frozen','full_final_carrier_frozen','required_final_artifacts_nonempty','required_outputs_nonempty','required_final_files_nonempty']]+[(r,rp+'/coverage/complete_final_assessed')],'explicit_bool')
        if delivery['state']=='UNKNOWN':
            # Frozen identity presence is delivery evidence only, not a scientific promotion.
            if finalmeta:delivery=self.e(finalmeta[0]['original']['source'],finalmeta[0]['original']['pointer'],'nonnull_identity')
            else:delivery=self.first([(src,p+'/deliverable')],'enum_bool',{'FROZEN':True,'MISSING':False})
        native=self.fields(src,p,['native_lifecycle','native_lifecycle_limit','native_terminal','native_status','actual_final_native_terminal','critic_actual_native_terminal','native_identity_terminal_projections','native_final_completion','stage_states','all_stage_deadline_checks'])
        nativequalified=self.first([(src,p+'/native_qualified'),(src,p+'/native_lifecycle/qualified'),(src,p+'/native_lifecycle/active_and_complete_observed')],'explicit_bool')
        timing=self.fields(src,p,['timing','time','timing_eligibility','eligibility','native_lifecycle_limit'])
        review_delivery=self.first([(src,p+'/review_delivered'),(r,'/delivery_in_review_deadline'),(r,'/review_delivery_within_original_deadline'),(r,'/review_delivery_in_deadline')],'explicit_bool')
        if review_delivery['state']=='UNKNOWN':review_delivery=self.first([(r,'/actual_task_status'),(r,'/task_terminal'),(r,'/actual_run/status')],'enum_bool',{'completed':True,'interrupted':False,'cancelled':False})
        counts=self.material(src,p)
        if counts['state']=='UNKNOWN':counts=self.material(r,rp)
        result={'arm_id':slot+'/'+arm,'arm':arm,'final_authorized_version':self.e(*version_ref,'constant_bound',constant=version),
          'candidate_final_delivery':delivery,'candidate_final_identities_declared_only':finalmeta,
          'original_grade_string':g,'original_grade_record':original_grade,
          'original_whole_mapped_artifact_status':self.e(r,rp+'/whole_mapped_artifact_status','string_only'),
          'original_judgment_verbatim':self.first([(r,rp+'/semantic_only_conclusion'),(r,rp+'/independent_semantic_conclusion'),(r,rp+'/independent_conclusion'),(r,rp+'/scientific_correctness'),(r,gradep)]),
          'assessment_status': 'UNASSESSED' if g['value'] is None else 'ORIGINAL_JUDGMENT_REPORTED',
          'original_material_count':counts,'normalized_material_count':counts,
          'full_scientific_coverage':self.bool_from_scope(r,rp,True),
          'full_declared_source_coverage':self.bool_from_scope(r,rp,False),
          'native_disposition_original':native,'native_qualified':nativequalified,
          'provenance_original':self.fields(src,p,['scope_audit','provenance','provenance_eligibility','eligibility'])+self.fields(r,rp,['blinding_limits','blinding_and_scope_limits','blinding_and_scope','blinding_and_scope_provenance_limits','provenance','provenance_and_write_scope']),
          'provenance_eligible':self.first([(src,p+'/provenance_eligible')],'explicit_bool'),
          'timing_original':timing,'time_eligible':self.first([(src,p+'/time_eligible'),(src,p+'/timing/within900'),(src,p+'/service_terminal_within45min'),(src,p+'/time/within_ceiling_at_T3_terminal_delivery'),(src,p+'/time/within_ceiling_at_T3_final_delivery')],'explicit_bool'),
          'delivered_assessment':review_delivery,'review_delivery_original':self.fields(r,'',['actual_task_status','actual_run','actual_t3_run','task_terminal','t3_run','delivery_in_review_deadline','review_delivery_within_original_deadline','review_dispatch_to_delivery_seconds','dispatch_to_delivery_seconds'])+self.fields(src,p,['review_time_separate','evaluation','evaluation_attempts','review_delivery_status']),
          'quota_unknowns_original':self.fields(src,p,['usage','quota','distinct_usage','input','cached_input','generated_output','billing','provider_input','provider_cached_input','provider_generated','provider_billing'])+self.fields(r,rp,['usage','unknown_usage','unknown_billing','unknown_quota','reviewer_usage','candidate_usage','billing','quota']),
          'economics_original':self.economics(src,p),
          'original_assessment_dimensions':self.dimensions(r,rp),
          'standalone_exception_assessments':extras or []}
        if slot=='C-01' and arm=='control':
            result['normalized_material_count']=self.e(src,p+'/material_defect_count','unassessed_material_null')
        return result
    def history(self,src,p='',kind='original_record'):
        d=at(self.s.docs[src],p)
        keys=['case','case_id','slot_id','version','candidate_version','matched_pair_version','disposition','terminal_disposition','status','assessment_disposition','science_assessment','source_judgment','source_quality','qualified_method_comparison','science_paired_assessment','quality','eligibility','provenance','all_previous_failures_and_costs_retained','all_original_costs_failures_retained','all_failures_costs_retained','all_original_v1_failures_costs_grades_immutable','original_disposition_retained','original_v1','old_versions_immutable','original_failed_v1_disposition','all_original_costs_and_failures_retained','all_original_failures_costs_retained','original_grades_and_failures','original_grades_preserved','prior_versions_immutable','original_scientific_grade','overall_grade','verdict','decision','overall_judgment','review_status','assessment_extent']
        # Quality is a pointer, not a fresh assessment; original full bytes remain frozen.
        return {'kind':kind,'original_record':{'source':src,'pointer':p,'sha256':self.s.ids[src]['sha256']},'fields':self.fields(src,p,keys),'economics':self.fields(src,p,['time','time_failure_inclusive','economics','economic_annotation','timing_annotation','new_v2_economic_annotation','original_failed_v1_economics','inclusive_old_failed_costs_reference','versions','generic_preparation'])}
    def enrich(self,a,row,entry,primary,review,gate):
        slot=row['slot_id'];arm=a['arm'];so,p=primary;r,rp=review;docs=self.s.docs
        pd=at(docs[so],p);ap=p+'/arms/'+arm if 'arms' in pd else p+'/'+arm if arm in pd else p
        a['native_disposition_original']+=self.fields(so,p,['lifecycle_and_timing_limits','original_qualified_native_gate','both_native_complete_terminal_states','both_exact_full_finals_nativecomplete_frozen'])
        a['native_disposition_original']+=self.fields(so,ap,['native_identity_projections','native_identity_terminal_projections','native_terminal_statuses','actual_final_native_terminal','critic_actual_native_terminal','final_native_terminal','critic_native_terminal','all_native_complete','native_final_completion'])
        # Delivery and original allowance are independent reporting dimensions.
        a['review_delivery_within_original_allowance']=self.first([(r,'/delivery_in_review_deadline'),(r,'/review_delivery_within_original_deadline'),(r,'/review_delivery_in_deadline'),(r,'/valid_within_requested_bound')],'explicit_bool')
        delivered=self.first([(so,ap+'/review_delivered')],'explicit_bool')
        if delivered['state']=='UNKNOWN':delivered=self.first([(r,'/actual_task_status'),(r,'/task_terminal'),(r,'/actual_run/status')],'enum_bool',{'completed':True,'interrupted':False,'cancelled':False})
        sibling=str(Path(r).parent/'frozen-review.json')
        if sibling in docs:
            a['review_delivery_original']+=self.fields(sibling,'',['task_terminal','t3_run','delivery_in_review_deadline','hasPendingChildRuns','native_goal_required'])
            delivered=self.e(sibling,'/task_terminal','enum_bool',{'completed':True,'interrupted':False,'cancelled':False})
            a['review_delivery_within_original_allowance']=self.e(sibling,'/delivery_in_review_deadline','explicit_bool')
        if entry['owner']=='targeted_cohort4':
            delivered=self.first([(so,ap+'/review_delivery_status'),(so,'/reviews/'+arm+'/lifecycle'),(so,ap+'/review/actual_run/status')],'enum_bool',{'completed':True,'interrupted':False,'COMPLETED_QUIET_SETTLED':True,'INTERRUPTED_QUIET_SETTLED':False,'EXPIRED_INTERRUPTED_QUIET_SETTLED':False})
            a['review_delivery_original']+=self.fields(so,'/reviews/'+arm,['lifecycle','actual_T3_timing','within_original_allowance','delivery_status','valid_within_requested_bound'])
            for k in ['full_scientific_coverage','full_declared_source_coverage']:
                if a[k]['state']=='UNKNOWN':
                    c=self.first([(so,'/reviews/'+arm+'/full_scope')],'explicit_bool')
                    if c['state']!='UNKNOWN':a[k]=c
        if entry['owner']=='targeted_cohort2':
            delivered=self.e(so,p+'/review/review_status','enum_bool',{'INDEPENDENT_FULL_SCOPE_EVALUATED':True})
            a['review_delivery_original']+=self.fields(so,p+'/review',['native_terminal','review_dispatch_to_terminal_seconds','review_budget_seconds','review_overrun_seconds','review_status'])
            a['review_delivery_within_original_allowance']=self.unknown(so,p+'/review/delivery_within_original_allowance','original elapsed/budget values retained without an invented promotion')
        if entry['owner']=='anchor_supervisor':
            delivered=self.e(so,ap+'/evaluation/T3_status','enum_bool',{'completed':True,'interrupted':False})
            a['provenance_original']+=self.fields(so,'',['provenance_eligibility','timing_eligibility'])
            if slot=='I-ANCHOR-GLM' and arm=='control':
                a['full_scientific_coverage']=self.e(r,'/grade_scope/original_integrated_scope_assessed','explicit_bool')
                a['full_declared_source_coverage']=self.e(r,'/grade_scope/all_source_claims_verified','explicit_bool')
            if slot=='I-ANCHOR-MUSE' and arm=='treatment':
                a['full_scientific_coverage']=self.e(r,'/grade_scope/all_candidate_groups_assessed','explicit_bool')
                a['full_declared_source_coverage']=self.e(r,'/grade_scope/every_original_integrated_obligation_assessed','explicit_bool')
        if entry['track']=='confirmation':
            conf='reviews/confirmation/COMPARISONS.json';j=int(slot[-2:])-1
            row['delivered_pair_assessment']=self.e(conf,'/pairs/'+str(j)+'/delivered_pair_assessment','explicit_bool')
            if delivered['state']=='UNKNOWN':delivered=row['delivered_pair_assessment']
            if row['delivered_pair_assessment']['value'] is False and delivered['value'] is None:delivered=self.unknown(so,ap+'/review_delivered','pair not delivered; own-arm delivery not inferable')
            row['both_arm_full_declared_source_coverage_original']=self.e(conf,'/pairs/'+str(j)+'/both_full_declared_source_coverage','explicit_bool')
        if entry['owner']=='targeted_cohort1':
            a['native_disposition_original']+=self.fields(so,p+'/time/'+arm,['native_final_completion'])+self.fields(so,p,['eligibility'])
            if slot=='D-M01-A':a['assessment_status']='ORIGINAL_DIAGNOSTIC_JUDGMENT_WITHOUT_CATEGORICAL_GRADE'
            if slot=='D-M02-B':
                a['full_scientific_coverage']=self.e(r,'/review_complete','explicit_bool')
                a['candidate_final_identities_declared_only']+=self.final_metadata(r,rp,arm,'X' if arm=='control' else 'Y')
            if a['candidate_final_delivery']['state']=='UNKNOWN' and a['candidate_final_identities_declared_only']:
                x=a['candidate_final_identities_declared_only'][0]['original'];a['candidate_final_delivery']=self.e(x['source'],x['pointer'],'nonnull_identity')
        if entry['owner']=='integrated_method_supervisor':
            caseindex=int(slot[-2:])-1;cp='/cases/'+str(caseindex) if 'METHOD' in slot else '/speed_cases/'+str(caseindex)
            main='helpers/integrated-execution/COMPARISONS.json'
            # Apply only explicit original own-arm coverage flags.
            if a['full_scientific_coverage']['state']=='UNKNOWN':
                c=self.first([(so,'/arms/'+arm+'/full_scope_assessed'),(main,cp+'/source_quality/'+arm+'/full_scope_assessed')],'explicit_bool')
                if c['state']!='UNKNOWN':a['full_scientific_coverage']=c
            if a['full_declared_source_coverage']['state']=='UNKNOWN':
                c=self.first([(so,'/arms/'+arm+'/full_scope_assessed'),(main,cp+'/source_quality/'+arm+'/full_scope_assessed')],'explicit_bool')
                if c['state']!='UNKNOWN':a['full_declared_source_coverage']=c
            if slot=='I-METHOD-02':
                literal=docs[so][arm];a['candidate_final_delivery']=self.e(so,'/'+arm,'enum_bool',{literal:arm=='treatment'})
                a['native_disposition_original'].append(self.e(so,'/'+arm))
            if slot=='I-FAST-01' and arm=='control':a['candidate_final_delivery']=self.e(so,'/control/final_dispatched','explicit_bool')
            if row['standalone_exception_assessments'] and arm=='treatment':
                key=slot+'/treatment/'+a['final_authorized_version']['value'];z=docs[main]['standalone_diagnostics'][key];cov=z['coverage'].replace(str(ROOT)+'/','')
                a['original_assessment_dimensions']['standalone_exact_coverage']=self.dimensions(cov)
                a['original_material_count']=self.e(main,'/standalone_diagnostics/'+esc(key)+'/material_errors');a['normalized_material_count']=a['original_material_count']
                if slot=='I-FAST-01':a['full_declared_source_coverage']=self.e(main,'/standalone_diagnostics/'+esc(key)+'/full_requirement_closure','enum_bool',{'NOT_FULLY_VERIFIABLE':False})
            if gate and gate in docs:
                gd=docs[gate]
                a['native_disposition_original']+=self.fields(gate,'',['lifecycle_holds','both_native_terminals','both_native_complete_terminal_states','scope'])
                a['native_disposition_original']+=self.fields(gate,'/finals/'+arm,['native_terminal','native_active_observed','lifecycle_hold','native_identity'])
                for stage in gd.get('native_states',{}):
                    if stage.startswith(arm+'/'):a['native_disposition_original'].append(self.e(gate,'/native_states/'+esc(stage)))
        a['delivered_assessment']=delivered
        a['original_grade_context']='standalone_exception_assessment_of_existing_arm' if a['standalone_exception_assessments'] else 'own_arm_original_assessment_or_disposition'
        a['provenance_eligible']=self.first([(so,ap+'/provenance_eligible'),(so,'/provenance_eligibility/status')],'explicit_bool')
        if a['provenance_eligible']['state']=='UNKNOWN':
            a['provenance_eligible']=self.e(so,'/provenance_eligibility/status','enum_bool',{'HOLD':False,'HOLD_METHOD_ELIGIBILITY_DIAGNOSTIC_ONLY':False,'ELIGIBLE':True,'QUALIFIED':True})
        if entry['owner']=='targeted_cohort3':
            original=at(docs[so],p+'/eligibility')
            # Exact original declarations of the entire v3 pipeline, no Goal-derived science.
            a['native_qualified']=self.e(so,p+'/eligibility','enum_bool',{original:True})
            a['time_eligible']=self.e(so,p+'/eligibility','enum_bool',{original:True})
        a['time_eligibility_scope_original_pointer']=a['time_eligible']['original']
        # Explicit noncomplete terminal statuses exclude native qualification;
        # complete alone is never promoted to qualification or scientific coverage.
        if a['native_qualified']['state']=='UNKNOWN':
            for c in a['native_disposition_original']:
                if isinstance(c['value'],str) and c['value'] in {'paused','blocked','cancelled'}:
                    z=c['original'];a['native_qualified']=self.e(z['source'],z['pointer'],'enum_bool',{'paused':False,'blocked':False,'cancelled':False});break
                if c['original']['pointer'].endswith('/native_terminal_statuses') and isinstance(c['value'],list) and any(v in {'paused','blocked','cancelled'} for v in c['value']):
                    z=c['original'];i=next(i for i,v in enumerate(c['value']) if v in {'paused','blocked','cancelled'});a['native_qualified']=self.e(z['source'],z['pointer']+'/'+str(i),'enum_bool',{'paused':False,'blocked':False,'cancelled':False});break
        # Candidate identities are original metadata declarations, not rehashed bodies.
        a['candidate_identity_verification']='Original pointer/hash values preserved; no candidate/source artifact body opened.'
        seen=set();unique=[]
        for c in a['candidate_final_identities_declared_only']:
            z=c['original'];key=(z['source'],z['pointer'])
            if key not in seen:seen.add(key);unique.append(c)
        a['candidate_final_identities_declared_only']=unique
    def build(self):
        s=self.s;idx='state/logical-slot-index-v1.json';sup='helpers/targeted-supervisor/COMPARISONS.json';c2='helpers/targeted-cohort2/COMPARISONS.json';c3='reviews/targeted-cohort3/COMPARISONS.json';c4='helpers/targeted-cohort4/COMPARISONS.json';integ='helpers/integrated-execution/COMPARISONS.json';conf='reviews/confirmation/COMPARISONS.json';final='helpers/integrated-execution/FINAL_TRACK_DISPOSITION.json'
        rows=[]
        def find(src,key,slot,idkeys=('case_id','case','slot_id')):
            return [(src,'/'+key+'/'+str(j),v) for j,v in enumerate(s.docs[src][key]) if any(v.get(k)==slot for k in idkeys)]
        for j,entry in enumerate(s.docs[idx]['slots']):
            slot=entry['slot_id'];base={'ordinal':j+1,'slot_id':slot,'track':entry['track'],'immutable_index_entry':self.e(idx,'/slots/'+str(j)),
              'closure':self.e('@config.json','/held_or_live_final_slots','constant_bound',constant='HELD_OR_LIVE' if slot in HELD else 'CLOSED_ORIGINAL_DISPOSITION'),
              'arms':{},'version_history':[],'review_history':[],'paired_eligibility_original':[],'conflicting_prior_fields':[],'standalone_exception_assessments':[]}
            if slot in HELD:
                base['final_authorized_version']=self.e('@config.json','/held_or_live_final_slots','constant_bound',constant='v3')
                for arm in ['control','treatment']:
                    a=self.arm(slot,arm,'v3',('@config.json','/held_or_live_final_slots'),(idx,'/slots/'+str(j)),(idx,'/slots/'+str(j)),'/slots/'+str(j)+'/original_grade')
                    a['assessment_status']='HELD_OR_LIVE_UNASSESSED';base['arms'][arm]=a
                # Older supplied records are history only. No linked held jobs/reviews opened.
                for src,key in [(c2,'cases'),(c3,'comparisons')]:
                    for so,p,v in find(src,key,slot):base['version_history'].append(self.history(so,p,'older_seed_or_infrastructure_history_not_final_v3'))
                base['paired_scientific_assessed']=self.unknown(idx,'/slots/'+str(j)+'/paired_scientific_assessed','final v3 held or live and deliberately unopened')
                base['paired_scientific_disposition']=self.unknown(idx,'/slots/'+str(j)+'/paired_scientific_disposition','no final v3 judgment in authorized frozen inputs')
                base['qualified_quality_preserving_win']=self.unknown(idx,'/slots/'+str(j)+'/qualified_quality_preserving_win','no final v3 comparison; not a failure or a win')
                rows.append(base);continue
            primary=None;version=None;reviews={};gradepaths={};rptrs={};finalgate=None
            if entry['owner']=='targeted_cohort1':
                matches=find(sup,'comparisons',slot);so,p,v=matches[-1];primary=(so,p);version=v['version'];vr=(so,p+'/version')
                for so2,p2,v2 in matches:base['version_history'].append(self.history(so2,p2,'version_disposition'))
                paths={'D-M01-A':['source-review-v1']*2,'D-M01-B':['source-review-v2-paired']*2,'D-M03-A':['source-review-v2-X','source-review-v2-Y'],'D-M03-B':['source-review-v2']*2,'D-M02-A':['source-review-v3']*2,'D-M02-B':['source-review-v2']*2}[slot]
                for ai,arm in enumerate(['control','treatment']):
                    r='reviews/targeted/'+slot+'/'+paths[ai]+'/REVIEW.json';reviews[arm]=r
                    if slot=='D-M01-A':rp='/candidates/'+str(ai);gp=rp+'/numeric_grade'
                    elif slot=='D-M01-B':rp='/candidates/'+str(ai);gp=rp+'/semantic_only_conclusion/status'
                    elif slot=='D-M03-A':rp='';gp='/semantic_conclusion/status' if arm=='control' else '/conclusion/status'
                    elif slot=='D-M02-A':rp='/labels/'+('X' if arm=='control' else 'Y');gp=rp+'/scientific_correctness/status'
                    else:rp='/candidates/'+('X' if arm=='control' else 'Y');gp=rp+('/final_scientific_correctness_status' if slot=='D-M02-B' else '/scientific_correctness_status')
                    rptrs[arm]=rp;gradepaths[arm]=gp
                base['paired_scientific_assessed']=self.first([(so,p+'/science_paired_assessment')],'explicit_bool')
                if base['paired_scientific_assessed']['state']=='UNKNOWN':base['paired_scientific_assessed']=self.e(so,p+'/disposition','enum_bool',{'FULL_SCIENTIFIC_DIAGNOSTIC_ASSESSED_COMPARATIVE_HOLD':True,'PAIRED_SEMANTIC_REVIEW_REPAIRED_COMPARATIVE_HOLD':True,'FULL_SCIENTIFIC_OWN_ARM_REVIEWS_REPAIRED_COMPARATIVE_HOLD':True,'FULL_SOURCE_SCIENCE_ASSESSED_PROVENANCE_HOLD':True,'terminal_full_source_assessed_provenance_hold':True,'terminal_full_source_assessed_timing_provenance_hold':True,'CONTROL_MISSING_FINAL_DIAGNOSTIC_ONLY_NO_COMPARISON':False})
                base['paired_scientific_disposition']=self.e(so,p+'/disposition')
                base['qualified_quality_preserving_win']=self.first([(so,p+'/eligibility/source_method_win_established'),(so,p+'/qualified_method_comparison')],'explicit_bool')
                base['paired_eligibility_original']=self.fields(so,p,['qualified_method_comparison','eligibility','science_paired_assessment'])
            elif entry['owner']=='targeted_cohort2':
                so,p,v=find(c2,'cases',slot)[0];primary=(so,p);version='v1';vr=(idx,'/slots/'+str(j));base['version_history'].append(self.history(so,p))
                for arm in ['control','treatment']:reviews[arm]=so;rptrs[arm]=p+'/arms/'+arm+'/quality';gradepaths[arm]=rptrs[arm]+'/source_quality'
                base['paired_scientific_assessed']=self.e(so,p+'/review/complete_scope_assessed_both','explicit_bool');base['paired_scientific_disposition']=self.e(so,p+'/disposition');base['qualified_quality_preserving_win']=self.unknown(so,p+'/qualified_quality_preserving_win','original comparison expressly has no winner/economic ranking')
                base['paired_eligibility_original']=self.fields(so,p,['eligibility','review'])
            elif entry['owner']=='targeted_cohort3':
                matches=find(c3,'comparisons',slot);so,p,v=matches[-1];primary=(so,p);version=v['version'];vr=(so,p+'/version')
                for so2,p2,v2 in matches:base['version_history'].append(self.history(so2,p2,'version_disposition'))
                for arm in ['control','treatment']:
                    rv='reviews/targeted-cohort3/'+slot+'-v3/'+('J1' if arm=='control' else 'J2')+'/freeze_disposition.json';reviews[arm]=rv;rptrs[arm]='';gradepaths[arm]='/verdict'
                base['paired_scientific_assessed']=self.e(so,p+'/is_method_comparison','explicit_bool');base['paired_scientific_disposition']=self.e(so,p+'/disposition');base['qualified_quality_preserving_win']=self.unknown(so,p+'/qualified_quality_preserving_win','no explicit qualified quality-preserving comparative win boolean; original conclusion remains verbatim')
                base['paired_eligibility_original']=self.fields(so,p,['eligibility','provenance','conclusion']);finalgate='jobs/'+slot+'/V3_PAIR_FREEZE.json'
            elif entry['owner']=='targeted_cohort4':
                so=s.docs[c4]['cases'][slot]['comparison'].replace(str(ROOT)+'/','');p='';v=s.docs[so];primary=(so,p);version=v['matched_pair_version'];vr=(so,'/matched_pair_version');base['version_history'].append(self.history(so))
                for arm in ['control','treatment']:
                    rv='reviews/targeted-cohort4/'+slot+'/'+arm+'-v'+str(version)+'/review.json';reviews[arm]=rv;rptrs[arm]='';gradepaths[arm]='/overall_grade'
                base['paired_scientific_assessed']=self.e(c4,'/cases/'+slot+'/status','enum_bool',{'ASSESSED_NO_QUALITY_PRESERVING_WIN':True});base['paired_scientific_disposition']=self.first([(so,'/disposition'),(c4,'/cases/'+slot+'/review_status')]);base['qualified_quality_preserving_win']=self.first([(so,'/assessment/quality_preserving_speedup_established')],'explicit_bool');base['paired_eligibility_original']=self.fields(so,'',['lifecycle','candidate_all_native_complete','assessment','reviews_are_advisory_maps_not_filesystem_firewall','reason'])
            elif entry['owner']=='anchor_supervisor':
                so='reviews/anchors/'+slot+'/COMPARISON.json';p='';v=s.docs[so];primary=(so,p);version='v2' if slot=='I-ANCHOR-GLM' else 'v1';vr=(so,'/slot_id');base['version_history'].append(self.history(so));finalgate='reviews/anchors/'+slot+'/pair-freeze.json'
                for arm in ['control','treatment']:
                    rev='source-review-v2' if slot=='I-ANCHOR-GLM' or (slot=='I-ANCHOR-MUSE' and arm=='treatment') else 'source-review-v1';rv='reviews/anchors/'+slot+'/'+arm+'/'+rev+'/judgment.json';reviews[arm]=rv;rptrs[arm]=''
                    gradepaths[arm]='/overall_judgment' if slot=='I-ANCHOR-MUSE' else ('/decision' if slot=='I-ANCHOR-GLM' and arm=='control' else '/review_status' if slot=='I-ANCHOR-GLM' else '/status')
                base['paired_scientific_assessed']=self.e(so,'/status','enum_bool',{v['status']:True});base['paired_scientific_disposition']=self.e(so,'/status');base['qualified_quality_preserving_win']=self.e(so,'/economic_observation/quality_preserving_speedup_established','explicit_bool');base['paired_eligibility_original']=self.fields(so,'',['timing_eligibility','provenance_eligibility','original_qualified_native_gate','predeclared_exception'])
            elif entry['owner']=='integrated_method_supervisor':
                n=slot.rsplit('-',1)[1];prefix='method' if 'METHOD' in slot else 'fast';version='v2' if slot in ['I-METHOD-02','I-METHOD-04'] else 'v1';so='helpers/integrated-execution/'+prefix+n+'-pair-disposition-'+version+'.json';p='';v=s.docs[so];primary=(so,p);vr=(so,'/version' if version=='v2' else '/case')
                for ver in ['v1']+(['v2'] if version=='v2' else []):base['version_history'].append(self.history('helpers/integrated-execution/'+prefix+n+'-pair-disposition-'+ver+'.json',kind='pair_attempt_'+ver))
                finalgate=v.get('paired_candidate_gate',v.get('pair_gate'));finalgate=finalgate.replace(str(ROOT)+'/','') if finalgate else None
                for arm in ['control','treatment']:
                    rv='reviews/integrated-methods/'+slot+'/'+arm+'/review-'+version+'/coverage.json'
                    if rv not in s.docs:rv=so;rp='/paired_source_assessment/'+arm if 'paired_source_assessment' in v else '';gp=rp+'/judgment' if rp else '/source_judgment'
                    else:rp='';gp='/source_judgment'
                    reviews[arm]=rv;rptrs[arm]=rp;gradepaths[arm]=gp
                status=v['status'];known_assessed={'both_original_arms_terminal_and_full_independent_assessments_frozen':True,'pair_assessed_terminal_both_FAIL':True,'pair_assessed_terminal_both_SourceFAIL':True,'pair_assessed_terminal_control_PASS_WITH_LIMITATIONS_treatment_FAIL':True,'pair_assessed_terminal_both_PASS_WITH_LIMITATIONS':True,'locked_original_pair_terminal_delivery_lifecycle_HOLD':False,'original_pair_terminal_delivery_lifecycle_HOLD':False,'terminal_infrastructure_HOLD_paired_science_UNASSESSED':False}
                base['paired_scientific_assessed']=self.e(so,'/status','enum_bool',known_assessed);base['paired_scientific_disposition']=self.e(so,'/status');base['qualified_quality_preserving_win']=self.first([(so,'/source_quality_preserving_comparative_win'),(so,'/source_quality_preserving_speed_win')],'explicit_bool');base['paired_eligibility_original']=self.fields(so,'',['selection_basis','comparative_qualification','matched_method_comparison','both_exact_full_finals_nativecomplete_frozen','both_native_complete_terminal_states','comparison_limits','lifecycle_and_timing_limits'])
                if slot in ['I-FAST-01','I-METHOD-02']:
                    key=slot+'/treatment/'+version;sp='/standalone_diagnostics/'+esc(key);stand=s.docs[integ]['standalone_diagnostics'][key];sf=stand['review_freeze'].replace(str(ROOT)+'/','')
                    extra={'assessment_id':key+'/standalone_exception','arm_id':slot+'/treatment','version':version,'logical_slot_credit':0,'paired_eligibility_credit':False,'original':self.e(integ,sp),'original_grade':self.e(sf,'/source_judgment'),'original_dimensions':self.dimensions(sf),'economics':self.economics(sf)}
                    base['standalone_exception_assessments'].append(extra);reviews['treatment']=sf;rptrs['treatment']='';gradepaths['treatment']='/source_judgment'
                # The immutable administrative projection is never current liveness authority.
                if slot=='I-FAST-03':prior=integ;pp='/speed_cases/2'
                elif slot=='I-METHOD-04':prior=integ;pp='/method04_retest'
                else:prior=None
                if prior:base['conflicting_prior_fields']=[{'prior_original':self.e(prior,pp),'governing_closed_original':self.e(so,'/status'),'governing_track_original':self.e(final,'/integrated_complete'),'annotation':'Prior administrative/planning no_arm_dispatched/status fields retained unchanged; not promoted to current liveness or final science.'}]
            else:
                so='reviews/confirmation/'+slot+'/COMPARISON.json';p='';v=s.docs[so];primary=(so,p);version='frozen-lock9ba-v1';vr=(idx,'/slots/'+str(j)+'/recipe_lock_sha256');base['version_history'].append(self.history(so));
                for arm in ['control','treatment']:
                    rv='reviews/confirmation/'+slot+'/'+arm+'/source-review-v1/REVIEW_FREEZE.json'
                    if rv in s.docs:rp='';gp='/original_scientific_grade'
                    else:rv=so;rp='/arms/'+arm;gp=rp+'/original_scientific_grade'
                    reviews[arm]=rv;rptrs[arm]=rp;gradepaths[arm]=gp
                base['paired_scientific_assessed']=self.e(so,'/assessed_pair','explicit_bool');base['paired_scientific_disposition']=self.first([(so,'/assessment_disposition'),(so,'/qualification')]);base['qualified_quality_preserving_win']=self.unknown(so,'/qualified_confirmation_win','no per-pair explicit win boolean; frozen cohort qualified_confirmation_wins counter reported separately');base['paired_eligibility_original']=self.fields(so,'',['qualification','native_and_comparative_eligibility','original_qualified_native_gate','diagnostic_review_exception','assessment_disposition'])
            so,p=primary
            base['shared_or_failure_inclusive_economics_original']=self.fields(so,p,['economics','time','economic_annotation','new_v2_economic_annotation','original_failed_v1_economics','generic_renderer_preparation_lower_bound_seconds','generic_renderer_wall_and_billing','cold_vs_amortized','generic_preparation','inclusive_old_failed_costs_reference','shared_inventory_cost_policy','host_cost_limits','economic_observation','measurement_receipts','quota_economics','repeat_median_range','service_latency_ratio_control_over_treatment','host_closeout_latency_ratio_control_over_treatment','cold_T0','hard_cold_budget_seconds_both_arms','locked_budgets_seconds','cold_frozen_budgets_seconds','common_T0','common_deadline','common_pair_wall_exception_seconds','common_pair_wall_seconds','aggregate_candidate_allowance_seconds_per_arm','old_design_minutes','old_design_ceiling_seconds','old_design_ceiling_seconds','root_prospective_budget_change'])
            for cell in list(base['shared_or_failure_inclusive_economics_original']):
                if isinstance(cell['value'],str) and cell['value'].endswith('.json'):
                    rel=cell['value'].replace(str(ROOT)+'/','')
                    if rel in s.docs:base['shared_or_failure_inclusive_economics_original'].append(self.e(rel,''))
            base['final_authorized_version']=self.e(*vr,'constant_bound',constant=version)
            for ai,arm in enumerate(['control','treatment']):
                ap=p+'/arms/'+arm if isinstance(at(s.docs[so],p),dict) and 'arms' in at(s.docs[so],p) else p+'/'+arm if arm in at(s.docs[so],p) else p
                extras=[x for x in base['standalone_exception_assessments'] if x['arm_id']==slot+'/'+arm]
                a=self.arm(slot,arm,version,vr,(so,ap),(reviews[arm],rptrs[arm]),gradepaths[arm],('X' if ai==0 else 'Y') if entry['owner']=='targeted_cohort1' else None,extras)
                if entry['owner']=='targeted_cohort1':
                    a['timing_original']+=self.fields(so,p+'/time/'+arm,list(v.get('time',{}).get(arm,{})))
                    a['economics_original']=self.economics(so,p+'/time/'+arm);a['provenance_original']+=self.fields(so,p,['eligibility']);a['provenance_eligible']=self.unknown(so,p+'/provenance_eligible','qualified_method_comparison combines multiple axes and is not a provenance-only boolean')
                    if slot=='D-M01-A':a['full_scientific_coverage']=self.e(reviews[arm],'/scope/full_declared_semantic_scope_assessed','explicit_bool');a['full_declared_source_coverage']=a['full_scientific_coverage']
                    if slot=='D-M02-A':a['full_scientific_coverage']=self.e(reviews[arm],rptrs[arm]+'/scientific_correctness/full_supplied_scientific_scope_assessed','explicit_bool')
                if entry['owner']=='targeted_cohort3':a['economics_original']=self.economics(so,p+'/economics/arms/'+arm);a['provenance_original']+=self.fields(so,p,['provenance','eligibility'])
                if entry['owner']=='integrated_method_supervisor':
                    a['economics_original']=self.economics(so,'/arms/'+arm)
                    econ=v.get('economics',v.get('economic_annotation',v.get('new_v2_economic_annotation')))
                    if isinstance(econ,str):
                        er=econ.replace(str(ROOT)+'/','')
                        if er in s.docs:a['economics_original']['additional_closed_economic_record']=self.economics(er,'/arms/'+arm)
                    elif isinstance(econ,dict):a['economics_original']['additional_closed_economic_record']=self.economics(so,'/economics/'+arm)
                    a['paired_original_grade']=self.first([(so,'/paired_source_assessment/'+arm+'/judgment'),(so,'/science/'+arm+'/source_judgment'),(so,'/arms/'+arm+'/source_judgment'),(so,'/source_judgment')])
                    if base['paired_scientific_assessed']['value'] is False and not extras:
                        a['assessment_status']='UNASSESSED';a['full_scientific_coverage']=self.e(so,'/status','enum_bool',{v['status']:False});a['full_declared_source_coverage']=a['full_scientific_coverage']
                if finalgate and finalgate in s.docs:
                    a['candidate_pair_freeze_original']=self.e(finalgate,'/gate' if 'gate' in s.docs[finalgate] else '/both_finals_frozen')
                    if True:
                        for fk in ['finals','final_identities']:
                            if arm in s.docs[finalgate].get(fk,{}):
                                for filename in s.docs[finalgate][fk][arm]:
                                    if filename.endswith(('artifact.md','final.md','source-map.json')):a['candidate_final_identities_declared_only'].append(self.e(finalgate,'/'+fk+'/'+arm+'/'+esc(filename)))
                    if entry['owner']=='targeted_cohort3':
                        for stage,sv in s.docs[finalgate]['stage_freezes'].items():
                            if '/'+arm+'/' in stage:
                                q='/stage_freezes/'+esc(stage)
                                a.setdefault('candidate_required_stage_deliveries_original',[]).append(self.e(finalgate,q))
                                a['native_disposition_original']+=self.fields(finalgate,q,['native_status','native_identity','quiet','budget_delivery_eligible'])
                                if str(sv.get('required_output','')).endswith('/final.md'):
                                    a['candidate_final_identities_declared_only']+=self.fields(finalgate,q,['required_output','output_sha256','output_bytes','scientific_files']);a['candidate_final_delivery']=self.e(finalgate,q+'/required_output','nonnull_identity');a['time_eligible']=self.e(finalgate,q+'/budget_delivery_eligible','explicit_bool')
                    if entry['owner']=='anchor_supervisor':
                        a['candidate_final_identities_declared_only']+=self.final_metadata(finalgate,'',arm)
                    if a['candidate_final_delivery']['state']=='UNKNOWN':
                        a['candidate_final_delivery']=self.first([(finalgate,'/both_full_final_carriers_present'),(finalgate,'/both_finals_frozen')],'explicit_bool')
                if entry['track']=='confirmation':
                    a['native_disposition_original']+=self.fields(so,ap,['native_raw_API_bodies'])
                    for k,st in enumerate(v['arms'][arm]['stages']):a['native_disposition_original']+=self.fields(so,ap+'/stages/'+str(k),['stage','native_terminal_statuses','nativeThreadRefs','actual_binding','stage_within_allowance'])
                    a['candidate_final_delivery']=self.e(so,ap+'/candidate_service_terminal_at','nonnull_identity')
                    a['original_material_count']=self.e(so,ap+'/material_defect_count');a['normalized_material_count']=a['original_material_count'] if slot!='C-01' or arm!='control' else self.e(so,ap+'/material_defect_count','unassessed_material_null')
                    a['delivered_assessment']=self.e(so,ap+'/review_delivered','explicit_bool');a['economics_original']=self.economics(so,ap)
                self.enrich(a,base,entry,primary,(reviews[arm],rptrs[arm]),finalgate)
                base['arms'][arm]=a
            # Retain each linked earlier/closed review as evidence-bound history, never best-of.
            for rn,rd in s.docs.items():
                if slot not in rn or rn in {so,reviews['control'],reviews['treatment']} or rn.startswith('jobs/'):continue
                if rn.endswith(('REVIEW.json','review.json','judgment.json','freeze_disposition.json','pair-disposition-v1.json','disposition.json')):base['review_history'].append(self.history(rn,kind='linked_original_review_or_disposition'))
            if entry['owner']=='targeted_cohort1':
                for preserved in ['helpers/targeted-supervisor/COMPARISONS-pre-final-preserved.json','helpers/targeted-supervisor/COMPARISONS-full-final-preserved.json']:
                    for ps,pp,pv in find(preserved,'comparisons',slot):base['version_history'].append(self.history(ps,pp,'preserved_prior_projection'))
            rows.append(base)
        ledger={'schema':'ER10-closed-slot-report-adapter-v1','observed_cutoff':s.inputs['observed_cutoff'],'immutable_snapshot_nonatomic':s.inputs['immutable_snapshot_nonatomic'],'logical_denominator':{'slots':40,'final_authorized_arms':80,'closed_slots':35,'held_or_live_slots':5},'authority':'Original ER10 judgments only; finite offline adapter, not new science or terminal campaign claim.','slots':rows,
          'original_authority_counters':{'integrated':self.fields(final,'',['original_method_attempts','last_authorized_retests','locked_speed_cases','separate_root_authorized_standalone_diagnostics','total_evaluation_coverage','source_quality_preserving_speed_win_established','economic_limits','method_complete','speed_complete','integrated_complete']),'confirmation':self.e(conf,'/counts'),'count_and_claim_contract':self.e('helpers/final-report/count-and-claim-contract-v1.json','/count_rules')},
          'control_inputs':{'config':self.e('@config.json',''),'immutable_input_manifest':self.e('@INPUTS.json','')},
          'general_winner':None,'recommendation':None,'fresh_scientific_conclusions':False}
        ledger['aggregates']=aggregate(ledger)
        return ledger

def all_cells(x,p=''):
    if isinstance(x,dict):
        if {'value','state','original','transformation'}<=x.keys():yield p,x;return
        for k,v in x.items():yield from all_cells(v,p+'/'+esc(k))
    elif isinstance(x,list):
        for j,v in enumerate(x):yield from all_cells(v,p+'/'+str(j))

def conjunction(cells):
    vals=[c['value'] for c in cells]
    if any(v is False for v in vals):return False
    if all(v is True for v in vals):return True
    return None

def aggregate(ledger):
    slots=ledger['slots'];arms=[a for r in slots for a in r['arms'].values()]
    def count(items,get,idfn,denom):
        buckets={'true':[],'false':[],'unknown':[]}
        for x in items:
            v=get(x);buckets['true' if v is True else 'false' if v is False else 'unknown'].append(idfn(x))
        return {'denominator':denom,'unit':'logical_slots' if denom==40 else 'final_authorized_arms','known_true':len(buckets['true']),'known_false':len(buckets['false']),'unknown':len(buckets['unknown']),'members':buckets,'policy':'Unknown excluded from both true and false; no fail imputation.'}
    out={}
    for k in ['candidate_final_delivery','delivered_assessment','full_scientific_coverage','full_declared_source_coverage','native_qualified','provenance_eligible','time_eligible']:
        out[k+'_arms']=count(arms,lambda a:a[k]['value'],lambda a:a['arm_id'],80)
    for name,k in [('both_candidate_finals_slots','candidate_final_delivery'),('both_arm_full_scientific_coverage_slots','full_scientific_coverage'),('both_arm_full_declared_source_coverage_slots','full_declared_source_coverage'),('both_delivered_assessments_slots','delivered_assessment'),('both_nativequalified_slots','native_qualified'),('both_provenance_timeeligible_slots',None)]:
        out[name]=count(slots,lambda r:conjunction([a[k] for a in r['arms'].values()]) if k else conjunction([a[q] for a in r['arms'].values() for q in ['provenance_eligible','time_eligible']]),lambda r:r['slot_id'],40)
    out['slots_with_any_candidate_final']=count(slots,lambda r:True if any(a['candidate_final_delivery']['value'] is True for a in r['arms'].values()) else False if all(a['candidate_final_delivery']['value'] is False for a in r['arms'].values()) else None,lambda r:r['slot_id'],40)
    for k in ['paired_scientific_assessed','qualified_quality_preserving_win']:
        out[k+'_slots']=count(slots,lambda r:r[k]['value'],lambda r:r['slot_id'],40)
    extras=[x for r in slots for x in r['standalone_exception_assessments']]
    out['delivered_pair_assessments_slots']=count(slots,lambda r:r['delivered_pair_assessment']['value'] if 'delivered_pair_assessment' in r else conjunction([a['delivered_assessment'] for a in r['arms'].values()]),lambda r:r['slot_id'],40)
    out['extra_standalone_assessments']={'denominator':2,'unit':'extra_assessments_of_existing_arms','assessment_ids':[x['assessment_id'] for x in extras],'logical_slot_credit':0,'paired_comparison_credit':0}
    out['versions_and_histories_policy']='Final-authorized edition counts above do not replace original outcomes. Original integrated attempt counters (11 pair dispositions, 7 paired science assessments plus 2 standalone arms) retain their own denominator in original_authority_counters.'
    out['confirmation_frozen_counters_authority']='/original_authority_counters/confirmation'
    return out


def replay(cell,s):
    ref=cell['original'];op=cell['transformation']
    try:raw=at(s.docs[ref['source']],ref['pointer']);exists=True
    except (KeyError,IndexError,TypeError,ValueError):raw=None;exists=False
    if op=='identity':return raw
    if op=='explicit_bool':return raw if type(raw) is bool else None
    if op=='string_only':return raw if isinstance(raw,str) else None
    if op=='enum_bool':return cell['enum_map'].get(raw) if isinstance(raw,str) else None
    if op=='nonnull_identity':return raw is not None if exists else None
    if op=='constant_bound':return cell['constant']
    if op=='unassessed_material_null':return None
    raise ValueError('unknown replay operation '+op)


def field_map(ledger):
    return {'schema':'ER10-exact-original-field-map-v1','json_pointer_standard':'RFC6901; ~0/~1 escaping, array ordinals, empty pointer denotes whole document','transformations':TRANSFORMS,'entries':[{'output_pointer':p+'/value',**c['original'],'transformation':c['transformation'],**({'enum_map':c['enum_map']} if 'enum_map' in c else {}),**({'constant':c['constant']} if 'constant' in c else {}),'state':c['state'],**({'missing_field':c['missing_field']} if 'missing_field' in c else {})} for p,c in all_cells(ledger)],'edition_selection':'Frozen original rows only. Final authorized editions are fixed per slot by the supplied closed record: METHOD02/METHOD04 v2; targeted current v1/v2/v3 as frozen; held GLM final v3 by explicit user instruction, unopened. No best-of or mutable-current selection.',
            'aggregate_transformations':'Count exact true/false/null members at the named output field; paired values use documented three-valued conjunction. Counts never create grades, coverage or eligibility.'}


def identities(s):
    return {'schema':'ER10-input-identities-v1','observed_cutoff':s.inputs['observed_cutoff'],'immutable_snapshot_nonatomic':True,'files':list(s.ids.values()),'additional_closed_metadata_files':sum(x['kind']=='linked_closed_metadata' for x in s.ids.values()),'additional_closed_metadata_bytes':sum(x['bytes'] for x in s.ids.values() if x['kind']=='linked_closed_metadata'),'source_document_hashes_verified':True,'candidate_and_primary_artifact_hashes':'Original metadata digests preserved only; artifact bodies were deliberately not opened or freshly verified.','links':s.links,'unavailable':s.failures}


def validate(ledger,s,fmap=None):
    checks=[]
    def check(name,ok,detail=None):checks.append({'check':name,'passed':bool(ok),**({'detail':detail} if detail is not None else {})})
    rows=ledger['slots'];lookup={r['slot_id']:r for r in rows};arms=[a for r in rows for a in r['arms'].values()]
    index=s.docs['state/logical-slot-index-v1.json']['slots']
    check('unique_40_slots_in_immutable_index_order',len(rows)==40 and len(lookup)==40 and [r['slot_id'] for r in rows]==[r['slot_id'] for r in index])
    check('unique_80_final_authorized_arms',len(arms)==80 and len({a['arm_id'] for a in arms})==80 and all(set(r['arms'])=={'control','treatment'} for r in rows))
    check('35_closed_and_5_held_not_terminal_campaign',sum(r['closure']['value']=='CLOSED_ORIGINAL_DISPOSITION' for r in rows)==35 and {r['slot_id'] for r in rows if r['closure']['value']=='HELD_OR_LIVE'}==HELD)
    check('no_held_jobs_reviews_or_candidates_read',not any(any(h in name for h in HELD) for name,idv in s.ids.items() if idv['kind']=='linked_closed_metadata'))
    extra=[x for x in s.ids.values() if x['kind']=='linked_closed_metadata']
    check('closed_metadata_caps',len(extra)<=180 and sum(x['bytes'] for x in extra)<=33554432,{'files':len(extra),'bytes':sum(x['bytes'] for x in extra)})
    check('all_source_document_bytes_hashes_verified',all(digest(local_snapshot(x).read_bytes())==x['sha256'] and local_snapshot(x).stat().st_size==x['bytes'] for x in s.ids.values()))
    invalid=[];unknown=[];mismatch=[]
    for p,c in all_cells(ledger):
        ref=c['original'];src=ref['source'];q=ref['pointer']
        if src not in s.ids or ref['sha256']!=s.ids[src]['sha256']:invalid.append(p+' source hash')
        try:at(s.docs[src],q)
        except (KeyError,IndexError,TypeError,ValueError):
            if 'missing_field' not in c:invalid.append(p+' absent unannotated pointer')
            else:unknown.append({'output_pointer':p,**c['missing_field']})
        if replay(c,s)!=c['value']:mismatch.append(p)
    check('all_source_pointers_exist_or_exact_missing_fields_recorded',not invalid,{'invalid':invalid,'annotated_absent_pointers':len(unknown)})
    check('mapping_replay_identity_every_cell',not mismatch,{'cells':sum(1 for _ in all_cells(ledger)),'mismatches':mismatch})
    linked_hash_checks=[]
    for link in s.links:
        if link['target'] not in s.ids:continue
        src=link['source'];q=link['pointer'];key=q.rsplit('/',1)[-1];parent=q.rsplit('/',1)[0]
        rec=at(s.docs[src],parent)
        if not isinstance(rec,dict):continue
        expected=rec.get('sha256') if key in {'path','comparison'} else rec.get(key+'_sha256')
        if key.endswith('_path'):expected=rec.get(key[:-5]+'_sha256',expected)
        if expected:linked_hash_checks.append({'source':src,'pointer':q,'declared_hash_pointer':parent+'/'+('sha256' if key in {'path','comparison'} else key[:-5]+'_sha256' if key.endswith('_path') else key+'_sha256'),'target':link['target'],'expected_sha256':expected,'captured_sha256':s.ids[link['target']]['sha256'],'matches':expected==s.ids[link['target']]['sha256']})
    check('all_linked_original_declared_hashes_match_captured_metadata',all(x['matches'] for x in linked_hash_checks),{'comparisons':len(linked_hash_checks),'mismatches':[x for x in linked_hash_checks if not x['matches']]})
    check('no_stale_administrative_field_boolean_promotion',not any(c['transformation']!='identity' and c['value'] is not None and c['original']['source']=='helpers/integrated-execution/COMPARISONS.json' and (c['original']['pointer'].startswith('/speed_cases/2') or c['original']['pointer'].startswith('/method04_retest')) for _,c in all_cells(ledger)))
    check('source_and_candidate_bodies_never_capture_targets',all(allowed(x['relative_path']) for x in extra))
    cutoff=datetime.fromisoformat(s.cfg['deadline'])-timedelta(seconds=s.cfg['writing_reserve_seconds'])
    check('all_additional_metadata_captured_before_absolute_writing_reserve',all(datetime.fromisoformat(x['capture_at'])<cutoff for x in extra),{'deadline':s.cfg['deadline'],'reading_cutoff':cutoff.isoformat(),'reserve_seconds':s.cfg['writing_reserve_seconds']})
    check('controls_config_INPUTS_byte_identities_preserved',all(digest((HERE/n).read_bytes())==s.ids['@'+n]['sha256'] for n in ['config.json','INPUTS.json']))
    check('confirmation_ledger_delivery_exactly_three_pairs',sum(r.get('delivered_pair_assessment',{}).get('value') is True for r in rows if r['track']=='confirmation')==3)
    check('held_final_v3_history_never_promotes_final_results',all(a['original_grade_string']['value'] is None and a['candidate_final_delivery']['value'] is None for r in rows if r['slot_id'] in HELD for a in r['arms'].values()))
    check('68_declared_candidate_finals_two_missing_ten_unopened',ledger['aggregates']['candidate_final_delivery_arms']['known_true']==68 and ledger['aggregates']['candidate_final_delivery_arms']['known_false']==2 and ledger['aggregates']['candidate_final_delivery_arms']['unknown']==10)
    check('FAST03_scientific_scope_true_contract_false_kept_separate',lookup['I-FAST-03']['arms']['control']['full_scientific_coverage']['value'] is True and lookup['I-FAST-03']['arms']['control']['full_declared_source_coverage']['value'] is False)
    check('GLM_anchor_control_original_assessment_and_source_verification_differ',lookup['I-ANCHOR-GLM']['arms']['control']['full_scientific_coverage']['value'] is True and lookup['I-ANCHOR-GLM']['arms']['control']['full_declared_source_coverage']['value'] is False)
    prep=lookup['I-METHOD-04']['shared_or_failure_inclusive_economics_original']
    check('METHOD04_original_renderer454_372_lowerbound_and_unknown_wall_billing_retained',any(c['original']['pointer']=='/generic_renderer_preparation_lower_bound_seconds' and c['value']==454.372 for c in prep) and any(c['original']['pointer']=='/generic_renderer_wall_and_billing' and c['value'] is None for c in prep))
    check('native_cumulative_counters_never_aggregate_token_or_billing_sum',all('known_true' not in v or v['unit'] in ['logical_slots','final_authorized_arms'] for v in ledger['aggregates'].values() if isinstance(v,dict)))

    replayed=Adapter(s).build();check('whole_adapter_replay_identity',replayed==ledger)
    check('field_map_exact_replay_identity',fmap is None or fmap==field_map(ledger))
    check('all_aggregate_denominators_partition_true_false_unknown',all(v['known_true']+v['known_false']+v['unknown']==v['denominator'] for v in ledger['aggregates'].values() if isinstance(v,dict) and 'known_true' in v))
    check('aggregate_replay_identity',aggregate(ledger)==ledger['aggregates'])
    c01=lookup['C-01']['arms']['control']
    check('C01_original_defect_zero_missing_grade_UNASSESSED_normalized_null',c01['original_material_count']['value']==0 and c01['original_grade_string']['value'] is None and c01['assessment_status']=='UNASSESSED' and c01['normalized_material_count']['value'] is None)
    c02=lookup['C-02']['arms']['treatment'];rv='reviews/confirmation/C-02/treatment/source-review-v1/REVIEW_FREEZE.json'
    check('C02_treatment_original_O1_remainder_fullsource_false',c02['full_declared_source_coverage']['value'] is False,{'O1_original':s.docs[rv].get('obligations',{}).get('O1') if isinstance(s.docs[rv].get('obligations'),dict) else next((z for z in s.docs[rv].get('obligations',[]) if z.get('id')=='O1'),None),'coverage_original':s.docs[rv].get('coverage')})
    c03=lookup['C-03'];native=[x['value'] for x in c03['arms']['treatment']['native_disposition_original'] if x['original']['pointer'].endswith('native_terminal_statuses')]
    check('C03_treatment_native_BLOCKED_separate_science_FAIL_comparative_HOLD',any('blocked' in x for x in native) and c03['arms']['treatment']['original_grade_string']['value']=='FAIL' and any(c['value']=='HOLD' for c in c03['paired_eligibility_original']),{'native_status_lists':native})
    cc=s.docs['reviews/confirmation/COMPARISONS.json']['counts']
    check('confirmation_exactly_4_dispositions_3_delivered_1_fullsource_C04',cc['mechanical_comparisons_frozen']==4 and cc['delivered_pair_assessments']==3 and cc['both_arm_full_declared_source_coverage']==1 and ledger['aggregates']['both_arm_full_declared_source_coverage_slots']['members']['true'].count('C-04')==1 and all(k not in ledger['aggregates']['both_arm_full_declared_source_coverage_slots']['members']['true'] for k in ['C-01','C-02','C-03']))
    mb=lookup['D-M02-B']['arms'];check('M02B_original_XY_specific_final_and_whole_artifact_statuses',mb['control']['original_grade_string']['value']=='SUPPORTED_WITH_STATED_CONDITIONS' and mb['treatment']['original_grade_string']['value']=='SUPPORTED_WITH_STATED_CONDITIONS_AND_MINOR_WORDING_LIMIT' and mb['control']['original_whole_mapped_artifact_status']['value']=='QUALIFIED_SCIENTIFIC_SUPPORT_WITH_CORRECTED_INTERMEDIATE_DEFECTS' and mb['treatment']['original_whole_mapped_artifact_status']['value']=='SUPPORTED_WITH_CONDITIONS_AND_MINOR_WORDING_LIMIT')
    ma=lookup['D-M02-A'];check('M02A_v3_qualified_control_notfullycorrect_treatment_prior_v2_separate',ma['arms']['control']['original_grade_string']['value']=='QUALIFIED_SUPPORTED' and ma['arms']['treatment']['original_grade_string']['value']=='NOT_FULLY_CORRECT_AS_WRITTEN' and len(ma['version_history'])>=2 and ma['arms']['control']['full_scientific_coverage']['value'] is True)
    check('FAST03_final_original_governs_stale_no_arm_dispatched',lookup['I-FAST-03']['arms']['control']['original_grade_string']['value']=='PASS_WITH_LIMITATIONS' and lookup['I-FAST-03']['arms']['treatment']['original_grade_string']['value']=='FAIL' and bool(lookup['I-FAST-03']['conflicting_prior_fields']))
    check('METHOD04_v2_original_governs_stale_retest_fields',all(a['original_grade_string']['value']=='PASS_WITH_LIMITATIONS' for a in lookup['I-METHOD-04']['arms'].values()) and len(lookup['I-METHOD-04']['version_history'])==2 and bool(lookup['I-METHOD-04']['conflicting_prior_fields']))
    check('six_METHOD_three_FAST_three_anchors_no_retest_slots',len([r for r in rows if r['slot_id'].startswith('I-METHOD-')])==6 and len([r for r in rows if r['slot_id'].startswith('I-FAST-')])==3 and len([r for r in rows if r['slot_id'].startswith('I-ANCHOR-')])==3)
    check('exactly_two_extra_treatment_standalones_zero_pair_credit',sum(len(r['standalone_exception_assessments']) for r in rows)==2 and all(x['logical_slot_credit']==0 and x['paired_eligibility_credit'] is False for r in rows for x in r['standalone_exception_assessments']))
    check('standalone_grades_do_not_promote_pair_assessment',lookup['I-FAST-01']['paired_scientific_assessed']['value'] is False and lookup['I-METHOD-02']['paired_scientific_assessed']['value'] is False and lookup['I-FAST-01']['arms']['treatment']['original_grade_string']['value']=='PASS_WITH_LIMITATIONS' and lookup['I-METHOD-02']['arms']['treatment']['original_grade_string']['value']=='FAIL')
    check('no_general_winner_recommendation_or_new_science',ledger['general_winner'] is None and ledger['recommendation'] is None and ledger['fresh_scientific_conclusions'] is False)
    return {'schema':'ER10-ledger-validation-v1','adapter_sha256':digest((HERE/'ledger.py').read_bytes()),'passed':all(x['passed'] for x in checks),'checks':checks,'unknown_source_fields':unknown,'linked_original_hash_checks':linked_hash_checks,'scope':'Offline identity/mapping/count validation only, not scientific review or candidate-body verification.'}


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('command',choices=['capture','build','validate','inspect']);args=parser.parse_args();s=Sources()
    if args.command=='capture':s.capture();return
    if args.command=='inspect':
        for name,d in s.docs.items():
            if s.ids[name]['kind']=='linked_closed_metadata':print(name,list(d) if isinstance(d,dict) else 'LIST')
        return
    if args.command=='build':
        ledger=Adapter(s).build();fmap=field_map(ledger);v=validate(ledger,s,fmap)
        dump(HERE/'CLOSED_SLOT_LEDGER.json',ledger);dump(HERE/'FIELD_MAP.json',fmap);dump(HERE/'INPUT_IDENTITIES.json',identities(s));dump(HERE/'validation.json',v)
    else:
        ledger=json.loads((HERE/'CLOSED_SLOT_LEDGER.json').read_bytes());fmap=json.loads((HERE/'FIELD_MAP.json').read_bytes());v=validate(ledger,s,fmap);dump(HERE/'validation.json',v)
    print(json.dumps({'passed':v['passed'],'failed_checks':[x for x in v['checks'] if not x['passed']],'slots':len(ledger['slots']),'arms':sum(len(x['arms']) for x in ledger['slots'])}))
    if not v['passed']:raise SystemExit(1)
if __name__=='__main__':main()
