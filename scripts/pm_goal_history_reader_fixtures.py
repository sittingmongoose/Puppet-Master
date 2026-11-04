#!/usr/bin/env python3
"""ATS-211: historical shape, original custody, disclosure and refusal oracles.

Synthetic lawful-original fixtures test the conditional retained-reader contract;
they assert no actual admitted historical writer or native execution.
"""
from __future__ import annotations
import base64
import datetime
import copy
import sys
from pathlib import Path
from pm_goal_oracle_common import Audit, Gates, ROOT, load, validator, schema_registry, sha, semantic_digest, print_result, materialize_cases

PLANS = ROOT / 'Plans'
OUT_SCHEMA = PLANS / 'goal_history_reader_outputs.schema.json'
ER_SCHEMA = PLANS / 'event_record.schema.json'
CKPT_SCHEMA = PLANS / 'event_record_index_checkpoint.schema.json'
FAMILIES = {
 'child_status': ('goal.child_status_changed','SP-271','unavailable'),
 'degraded': ('goal.degraded','SP-277','unavailable'),
 'scheduled': ('goal.scheduled','SP-280','unavailable'),
 'progressed': ('goal.progressed','SP-300','unresolved'),
 'replanned': ('goal.replanned','SP-301','unresolved'),
 'stopped': ('goal.stopped','SP-302','unresolved'),
 'verification_decided': ('goal.verification_decided','SP-303','unresolved'),
 'evidence_captured': ('goal.evidence_captured','SP-431','unavailable'),
 'receipt_recorded': ('goal.receipt_recorded','SP-432','unavailable'),
 'tool_check_recorded': ('goal.tool_check_recorded','SP-433','unavailable'),
}
PAYLOAD_FILE = {'child_status':'goal_child_status_changed'}

def joins(answer, g):
 ev = answer.get('original_event')
 if not isinstance(ev,dict): return
 sel,p,t = answer['selector'],ev['payload'],answer['read_token']
 for field in ('project_id','event_id','sequence_id'):
  g.require('join/selector/'+field, sel.get(field)==ev.get(field))
 if 'goal_id' in sel: g.require('join/selector/goal_id',sel['goal_id']==p.get('goal_id'))
 for outer,inner in [('event_type','event_name'),('payload_schema_id','schema_version'),('project_id','project_id'),('thread_id','thread_id'),('actor_ref','actor_ref'),('requested_account_ref','requested_account_ref'),('effective_account_ref','effective_account_ref'),('occurred_at_utc','occurred_at_utc'),('correlation_id','correlation_id'),('idempotency_key','idempotency_key')]:
  if inner in p: g.require('join/envelope/'+outer,ev.get(outer)==p[inner])
 if not isinstance(t,dict) or not {'storage_instance_id','generation_id','checkpoint_key','checkpoint_ref','source_selection','index_dataset_name'} <= set(t):return
 storage=t['storage_instance_id']; generation=t['generation_id']
 g.require('join/token/checkpoint_key',t['checkpoint_key']=='event_record_index_checkpoint.v1:'+storage)
 # Ref is independently constructed: it cannot inherit a bad checkpoint key.
 g.require('join/token/checkpoint_ref',t['checkpoint_ref']=='checkpoints/event_record_index_checkpoint.v1:'+storage+'#/generations/'+generation)
 g.require('join/token/source_storage',t['source_selection']['storage_instance_id']==storage)
 g.require('join/token/dataset',t['index_dataset_name']=='event_record_index.v2@'+generation)

def joins_ok(answer):
 g=Gates(); joins(answer,g);return not g.errors

def canon_admissible(outcome,answer,original_proof=None):
 if answer['kind']=='verified_historical': return original_proof is not None and original_proof.get('writer_at_receipt')=='admitted'
 if answer['kind']=='unavailable': return True
 return outcome!='unavailable' and 'original_admission' in answer.get('unresolved_obligations',[])

def history_guards(case,pv,av,disabled=()):
 g=Gates(disabled);a=case['answer'];ev=a.get('original_event')
 g.schema(av,a,pv.schema['$id']+'/protocol_answer')
 if g.errors or not isinstance(ev,dict): return g.errors
 g.schema(pv,ev['payload'],pv.schema['$id']+'/protocol_payload');joins(a,g)
 s=case['source']; p=ev['payload']; old=case['original']; token=a['read_token']
 for field in ('authorized','retained','reader_available','secret_safe','frame_verified','translation_verified'):
  g.require('source/'+field,s[field])
 part='project~'+base64.urlsafe_b64encode(ev['project_id'].encode()).decode().rstrip('=')
 g.require('source/index_key',s['index_key']==f"event_record_index.v2:{part}:{ev['sequence_id']:020d}:{ev['event_id']}")
 receipt=old['first_receipt']; admission=old['admission']
 for field,value in [('storage_instance_id',token['storage_instance_id']),('event_id',ev['event_id']),('event_type',ev['event_type']),('payload_schema_id',ev['payload_schema_id']),('idempotency_key',ev['idempotency_key'])]:
  g.require('original/first_receipt/'+field,receipt.get(field)==value)
 g.require('original/writer_admission',admission['writer_at_receipt']=='admitted')
 for field,value in [('event_type',ev['event_type']),('payload_schema_id',ev['payload_schema_id'])]:
  g.require('original/admission/'+field,admission[field]==value)
 g.require('original/checkpoint',admission['registry_checkpoint']==receipt['registry_checkpoint'])
 g.require('original/owner_unit',admission['owner_unit']==receipt['writer_owner_unit'])
 g.require('original/revision_cas',old['predecessor']['goal_revision']==p['expected_goal_revision'])
 g.require('original/revision_step',p['goal_revision']==p['expected_goal_revision']+1)
 for field in ('goal_id','project_id'):
  g.require('original/predecessor/'+field,old['predecessor'][field]==p[field])
 # Original evidence is resolved with its owner/identity/currentness-at-append,
 # independently of today's live Goal state (which is never consulted).
 for role,record in old['resolved_records'].items():
  g.require('original/record/'+role,record['requested_ref']==record['resolved_ref'] and record['owner_ref']==record['resolved_owner_ref'] and record['revision_at_append']==record['accepted_revision'])
 for field in ('actor_ref','execution_role','requested_provider_ref','effective_provider_ref','requested_model_ref','effective_model_ref','requested_account_ref','effective_account_ref'):
  g.require('original/runtime/'+field,old['runtime'][field]==p[field])
 g.require('original/semantic_digest',old['producer_digest']==semantic_digest(ev))
 original_row_guards(ev,p,old,g)
 # The complete disclosure predicate follows every returning validation/hash helper.
 current=case['source']
 g.require('source/unchanged_event',ev==current['event'])
 g.require('source/actual_token',token==current['token'])
 g.require('source/final_fence',s['captured_fence']==current['final_fence'])
 return g.errors

def original_row_guards(ev,p,old,g):
 f=ev['event_type'];b=p['payload'];facts=old['facts'];pre=facts['state_before'];post=facts['state_after']
 terminal={'completed','cancelled','failed'}
 if f=='goal.child_status_changed':
  g.require('row/child_parent_nonterminal',pre not in terminal)
  g.require('row/child_parent_preserved',pre==post)
  g.require('row/child_identity',b['child_goal_id']==facts['child']['goal_id'])
  g.require('row/child_predecessor',b['previous_status']==facts['child']['state_before'])
  g.require('row/child_successor',b['next_status']==facts['child']['state_after'])
  g.require('row/child_legal_edge',[b['previous_status'],b['next_status']] in facts['original_child_contract']['allowed_edges'])
 elif f=='goal.degraded':
  g.require('row/degraded_edge',pre in {'created','scheduled','running','paused','verifying','repairing','degraded'} and post=='degraded')
  g.require('row/degraded_tier',facts['tier']!='strong' or not facts['required_check_affected'] and b['degraded_reason']!='verifier_unavailable')
  g.require('row/degraded_standard',facts['tier']!='standard' or not facts['mutation_affected'] and not facts['required_check_affected'])
  g.require('row/degraded_exception',not facts['exception_required'] or bool(b.get('exception_refs')))
  g.require('row/degraded_approval',not facts['risk_accepted'] or bool(b.get('approval_refs')) and set(b['approval_refs'])<=set(p.get('approval_refs',[])))
  if pre=='degraded':g.require('row/degraded_new_risk',facts['risk_before']!=b['residual_risk_refs'])
 elif f=='goal.scheduled':
  g.require('row/scheduled_edge',pre in {'created','paused','blocked','stopped'} and post=='scheduled')
  if pre in {'blocked','stopped'}:g.require('row/scheduled_recovery',bool(facts['recovery_receipt_ref']))
  if b['next_action']=='dispatch':
   g.require('row/scheduled_time',datetime.datetime.fromisoformat(b['eligible_at_utc'].replace('Z','+00:00'))<=datetime.datetime.fromisoformat(ev['observed_at_utc'].replace('Z','+00:00')))
   g.require('row/scheduled_budget',facts['remaining_budget']>0)
   g.require('row/scheduled_permission',facts['permission_decision']=='allow')
   g.require('row/scheduled_writer',facts['storage_posture']=='writer')
   g.require('row/scheduled_recovery_truth',facts['recovery_status']=='resolved')
 elif f=='goal.progressed':
  g.require('row/progress_predecessor',b['status_before']==pre)
  g.require('row/progress_successor',b['status_after']==post)
  arrays=list(b['task_delta'].values());flat=[item for arr in arrays for item in arr]
  g.require('row/progress_disjoint_tasks',len(flat)==len(set(flat)))
  g.require('row/progress_artifacts',b['artifact_hashes']==facts['resolved_artifact_hashes'])
  if b.get('repeat_count',1)>=2:
   g.require('row/progress_repeat_count',b.get('no_progress_marker',{}).get('continuation_count')==b['repeat_count'])
   g.require('row/progress_repeat_evidence',facts['previous_fingerprint']!=b['progress_fingerprint'] or b['no_progress_marker']['unchanged_artifact_hashes']==b['artifact_hashes'])
 elif f=='goal.replanned':
  successors={'continue_running':'running','remain_paused':'paused','remain_blocked':'blocked','stop':'stopped','cancel':'cancelled','begin_verification':'verifying','repair':'repairing'}
  g.require('row/replanned_edge',pre in {'scheduled','running','paused','repairing','degraded','blocked','stopped'} and post==successors[b['next_action']])
  g.require('row/replanned_revision',b['new_revision']==p['goal_revision'])
  children=b['affected_child_goal_ids'];decisions=[r['child_goal_id'] for r in b['child_decisions']]
  g.require('row/replanned_children',sorted(children)==sorted(decisions) and len(decisions)==len(set(decisions)))
  g.require('row/replanned_evidence',set(b['remaining_evidence_refs'])<=set(facts['current_evidence_refs']))
 elif f=='goal.stopped':
  g.require('row/stopped_edge',pre in {'created','scheduled','running','paused','verifying','repairing','degraded','blocked','stopped','budget_limited','usage_limited'} and post=='stopped')
  if pre=='stopped':g.require('row/stopped_new_boundary',facts['previous_boundary']!=facts['current_boundary'])
  if b['resumable']:
   g.require('row/stopped_recovery',facts['recovery_status']=='resolved')
   g.require('row/stopped_authority',facts['permission_decision']=='allow')
   g.require('row/stopped_settlement',set(b['child_settlement_refs']+b['tool_settlement_refs'])<=set(facts['settled_refs']))
 elif f=='goal.verification_decided':
  edges={'passed':({'running','repairing'},'verifying'),'failed':({'verifying','repairing'},'repairing'),'blocked':({'running','verifying','repairing'},'blocked')}
  allowed,dest=edges[b['decision']]
  g.require('row/verification_edge',pre in allowed and post==dest)
  g.require('row/verification_owner',b['verifier_ref']==facts['assigned_verifier'])
  g.require('row/verification_cycle',b.get('verification_cycle_id',b.get('audit_cycle_id'))==facts['cycle_id'])
  if b['decision']=='passed':g.require('row/verification_closure',set(b['closure_refs'])<=set(facts['current_evidence_refs']))
  if facts['tier']=='strong' and facts['failure_count']>=3:g.require('row/verification_adjudicator',b.get('adjudicator_ref')==facts['assigned_adjudicator'] and bool(b.get('adjudicator_ref')))
 elif f=='goal.evidence_captured':
  g.require('row/evidence_state',pre not in terminal and pre==post)
  g.require('row/evidence_redaction',b['redaction_profile']==ev['redaction_profile'])
  g.require('row/evidence_hash',b['content_hash']==facts['original_evidence']['content_hash'])
  g.require('row/evidence_provenance',b['evidence_ref']==facts['original_evidence']['evidence_ref'])
  for span in b['source_spans']:
   if span['locator_kind']=='line_range':g.require('row/evidence_span',span['end_line']>=span['start_line'])
 elif f=='goal.receipt_recorded':
  g.require('row/receipt_state',pre in {'running','verifying','repairing','degraded','blocked'} and pre==post)
  r=facts['original_receipt'];g.require('row/receipt_identity',b['receipt_id']==r['receipt_id'])
  g.require('row/receipt_decision',b['certifier_decision']==r['certifier_decision'])
  g.require('row/receipt_dependencies',set(b['child_receipt_refs']+b['worknode_receipt_refs'])==set(r['required_dependency_refs']))
  if b['certifier_decision']=='certified_with_approved_exception':g.require('row/receipt_exception',bool(p.get('approval_refs')) and bool(facts['residual_risk_refs']))
 elif f=='goal.tool_check_recorded':
  g.require('row/tool_state',pre in {'scheduled','running','verifying','repairing','degraded','blocked'} and pre==post)
  g.require('row/tool_identity',b['tool_call_id']==facts['original_tool_call']['tool_call_id'])
  g.require('row/tool_permission',b['policy_decision']==facts['original_permission']['decision'])

def append_guards(case,disabled=()):
 g=Gates(disabled)
 # Prohibition is scope-independent and precedes dedupe even on an equal retry.
 g.require('current_writer/prohibited',case['mode']!='append')
 return g.errors

def main():
 paths=[OUT_SCHEMA,ER_SCHEMA,CKPT_SCHEMA]
 for key in FAMILIES:
  p=PLANS/'event_payloads/goal_runtime'/f"{PAYLOAD_FILE.get(key,'goal_'+key)}.schema.json"
  if p.exists():paths.append(p)
 try: reg=schema_registry(paths)
 except Exception as exc:
  print(str(exc),file=sys.stderr);return 1
 out_doc=load(OUT_SCHEMA); audit=Audit();counts={}
 for key,(family,unit,outcome) in FAMILIES.items():
  path=PLANS/f'goal_{key}_history_contract_fixtures.json'
  if not path.exists():continue
  fx=load(path); pv=validator(load(PLANS/'event_payloads/goal_runtime'/f"{PAYLOAD_FILE.get(key,'goal_'+key)}.schema.json"),reg)
  av=validator({'$ref':out_doc['$id']+'#/$defs/goal_'+key+'_history_answer'},reg)
  evv=validator(load(ER_SCHEMA),reg)
  def payload(value,disabled,pv=pv,key=key):
   g=Gates(disabled);g.schema(pv,value,key+'/payload');return g.errors
  def answer(value,disabled,pv=pv,av=av,key=key):
   g=Gates(disabled);g.schema(av,value,key+'/answer')
   if g.errors:return g.errors
   if isinstance(value.get('original_event'),dict):
    g.schema(pv,value['original_event']['payload'],key+'/answer_payload')
    if not g.errors:joins(value,g)
   return g.errors
  for c in fx['schema_cases']:audit.case(f'{key}/schema/{c["id"]}',payload,c['value'],c['valid'])
  for c in fx['reader_output_cases']:
   if c.get('boundary')=='event_record_schema':
    def event_shape(value,disabled,evv=evv,key=key):
     g=Gates(disabled);g.schema(evv,value,key+'/event_record');return g.errors
    audit.case(f'{key}/event_record/{c["id"]}',event_shape,c['answer']['original_event'],c['valid'])
   elif c.get('boundary')=='payload_schema':
    audit.case(f'{key}/answer_payload/{c["id"]}',payload,c['answer']['original_event']['payload'],c['valid'])
   elif c.get('boundary')=='identity_joins':
    def identity_join(value,disabled):
     g=Gates(disabled);joins(value,g);return g.errors
    audit.case(f'{key}/answer_joins/{c["id"]}',identity_join,c['answer'],c['valid'])
   elif c.get('boundary')=='answer_schema':
    def shape(value,disabled,av=av,key=key):
     g=Gates(disabled);g.schema(av,value,key+'/answer');return g.errors
    audit.case(f'{key}/answer/{c["id"]}',shape,c['answer'],c['valid'])
   else:audit.case(f'{key}/answer/{c["id"]}',answer,c['answer'],c['valid'])
  for c in fx.get('join_cases',[]):audit.case(f'{key}/join/{c["id"]}',answer,c['answer'],c['join_valid'])
  for c in fx.get('current_canon_cases',[]):
   if canon_admissible(outcome,c['answer'])!=c['current_canon_admissible']:audit.failures.append(key+'/canon/'+c['id'])
  for c in materialize_cases(fx['protocol_cases']):
   def protocol(value,disabled,pv=pv,av=av):
    # A bounded test-only helper interception proves the final source comparison
    # actually runs after the last digest helper. Never forwarded to a reader.
    if not value.get('late_helper_probe'):return history_guards(value,pv,av,disabled)
    value=copy.deepcopy(value);original=globals()['semantic_digest']
    def intercepted(event):
     digest=original(event)
     event['observed_at_utc']='2020-01-01T00:00:01Z'
     return digest
    try:
     globals()['semantic_digest']=intercepted
     return history_guards(value,pv,av,disabled)
    finally:globals()['semantic_digest']=original
   audit.case(f'{key}/protocol/{c["id"]}',protocol,c['input'],c['valid'],base=c.get('base'))
  for c in fx['refusal_cases']:audit.case(f'{key}/refusal/{c["id"]}',append_guards,c['input'],False,base={'mode':'read'})
  counts[family]=len(fx['protocol_cases'])
 # Exercise actual eager reference resolution, including unused definitions.
 import pm_goal_oracle_common as common
 reference_cache={}
 def reference_guard(document,disabled):
  cache_key=(sha(document),'schema/references' in disabled)
  if cache_key not in reference_cache:
   old_load=common.load
   try:
    common.load=lambda path:document if Path(path)==OUT_SCHEMA else old_load(path)
    try:schema_registry(paths,disabled);errors=set()
    except ValueError:errors={'schema/references'}
   finally:common.load=old_load
   reference_cache[cache_key]=errors
  return reference_cache[cache_key]
 audit.case('schema/resolved_all_refs',reference_guard,out_doc,True)
 dangling=copy.deepcopy(out_doc);dangling['$defs']['unused_dangling_ref']={'$ref':'#/$defs/DOES_NOT_EXIST'}
 audit.case('schema/unused_dangling_ref',reference_guard,dangling,False)
 result=audit.run();result['families']=counts
 return print_result(result,sys.argv)
if __name__=='__main__':sys.exit(main())
