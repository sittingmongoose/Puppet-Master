#!/usr/bin/env python3
"""ATS-213 static successor predicates. No native source or admission is asserted."""
import copy
import hashlib
import json
import sys
from pm_goal_oracle_common import ROOT, Audit, Gates, load, validator, schema_registry, canonical, revision_text, integer_number, append_result, append_guards, print_result

def identity(family,v):
 fields=['storage_instance_id','project_id','thread_id','goal_id']
 values=[v[k] for k in fields]+[revision_text(v['before_revision']),v['continuation_id'],v['owning_run_id'],v['next_attempt_ref']]
 d=hashlib.sha256(json.dumps(['pm.'+family+'.lifecycle.v1','project']+values,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
 return family+'.v1:'+d,family+'.lifecycle.v1:'+d

def predicates(family,c,v,disabled=()):
 g=Gates(disabled);p=c['payload'];before=c['before'];after=c['after'];source=c['source']
 g.schema(v,p,family+'/schema')
 if g.errors:return g.errors
 for field in ('project_id','thread_id','goal_id'):
  g.require('lifecycle/identity/'+field,p[field]==before[field]==after[field]==source[field])
 g.require('lifecycle/revision_cas',integer_number(before['revision']) and p['before_revision']==before['revision'])
 g.require('lifecycle/revision_step',integer_number(after['revision']) and p['revision']==p['before_revision']+1==after['revision'])
 g.require('lifecycle/currentness_cas',p['before_currentness_hash']==before['currentness_hash'])
 g.require('lifecycle/currentness_after',p['currentness_hash']==after['currentness_hash'])
 for field in ('objective_text','created_at','active_run_ref'):
  g.require('lifecycle/preserve/'+field,before[field]==after[field])
 g.require('lifecycle/history',c['accepted_history_before']==c['accepted_history_after'])
 g.require('lifecycle/host',source['owner']=='host.goal.continuation')
 g.require('lifecycle/origin_kind',source['origin_kind'] in ('user_request','agent_created_at_user_request','plan_build','internal_workflow'))
 g.require('lifecycle/stop_epoch',integer_number(source['captured_stop_epoch']) and integer_number(source['current_stop_epoch']) and source['captured_stop_epoch']==source['current_stop_epoch']==p['user_stop_epoch'])
 g.require('lifecycle/manual_stop',source['manual_stop_latched'] is False)
 g.require('lifecycle/cancelled',source['cancellation_receipt'] is None)
 g.require('lifecycle/source_available',source['original_source_available'] is True)
 g.require('lifecycle/permission',source['current_permission']=='write')
 g.require('lifecycle/final_fence',source['captured_fence']==source['final_fence'])
 g.require('lifecycle/identity_recipe',(c['event_id'],c['idempotency_key'])==identity(family,{**p,'storage_instance_id':c['storage_instance_id']}))
 g.require('lifecycle/append_policy',c['replay_policy']!='projector_replay_only')
 g.require('lifecycle/writer_available',source['writer_available'] is True)
 target=family.split('.')[1]
 g.require('lifecycle/after_state',after['state']==target)
 if target=='blocked':
  g.require('blocked/source_state',before['state'] in ('active','blocked'))
  g.require('blocked/reason',p['blocked_reason_ref']==after['blocked_reason_ref']==source['blocked_reason_ref'])
  g.require('blocked/owner_reason',source['blocked_reason_ref']==source['resolved_blocker']['ref'] and source['resolved_blocker']['owner']==source['caller_owner'])
  if before['state']=='blocked':g.require('blocked/new_evidence',before['blocked_reason_ref']!=after['blocked_reason_ref'] or source['blocker_evidence_before']!=source['blocker_evidence_after'])
 else:
  g.require('completed/source_state',before['state']=='active')
  g.require('completed/ordinary_route',source['completion_route']=='ordinary')
  g.require('completed/evidence',p['completion_evidence_refs']==source['caller_completion_evidence_refs'])
  g.require('completed/todo_identity',source['todo_snapshot']['list_id']==source['current_todo_list_id'] and integer_number(source['todo_snapshot']['revision']) and integer_number(source['current_todo_revision']) and source['todo_snapshot']['revision']==source['current_todo_revision'])
  g.require('completed/todo_barrier',all(type(t['required']) is bool and (not t['required'] or t['status']=='done' or (t['status']=='skipped' and t['accepted_skip_ref'])) for t in source['todo_snapshot']['items']))
  g.require('completed/admitted_work',all(w['status']=='settled' for w in source['admitted_work']))
  g.require('completed/bound_plan',source['bound_plan_status'] in ('none','settled'))
  if source['origin_kind']=='internal_workflow':
   g.require('completed/internal_predicate',source['internal_owner_predicate']['owner']==source['caller_owner'] and integer_number(source['internal_owner_predicate']['revision']) and integer_number(source['caller_owner_revision']) and source['internal_owner_predicate']['revision']==source['caller_owner_revision'] and source['internal_owner_predicate']['result']=='met')
 return g.errors

def main():
 doc=load(ROOT/'Plans/goal_lifecycle_successor_fixtures.json');audit=Audit()
 paths=[ROOT/f['payload_schema'] for f in doc['families'].values()];reg=schema_registry(paths)
 for family,f in doc['families'].items():
  v=validator(load(ROOT/f['payload_schema']),reg)
  for case in f['cases']:
   def evaluate(value,disabled,family=family,v=v,kind=case.get('kind')):
    if kind=='schema':
     g=Gates(disabled);g.schema(v,value['payload'],family+'/schema');return g.errors
    return predicates(family,value,v,disabled)
   audit.case(family+'/'+case['id'],evaluate,case['input'],case['valid'])
  for case in f['replay_cases']:
   if append_result(case)!=case['expected']:audit.failures.append(family+'/replay/'+case['id'])
   audit.case(family+'/replay/'+case['id'],append_guards,case,case['expected'] in ('append_new','return_original_receipt'))
 result=audit.run();result['activation']='REFUSED_UNBOUND_ORIGINAL_HOST_SOURCE'
 return print_result(result,sys.argv)
if __name__=='__main__':sys.exit(main())
