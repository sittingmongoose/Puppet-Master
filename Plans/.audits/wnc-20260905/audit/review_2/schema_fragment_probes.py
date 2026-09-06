#!/usr/bin/env python3
"""Focused reproduction of retrieved WNC schema/validator logic, NOT repository gates.

Source commit: 2826699f7e7f23ab12a8fdfaf5f1518748f12d5a
Repository: sittingmongoose/Puppet-Master
Sources read through the GitHub connector:
- Plans/working_notebook_contracts.schema.json, root + tool_request + context_transition_record
- scripts/pm-working-notebook-contracts.py, transition invariants + argparse declaration

These are manually transcribed source fragments. No complete repository checkout,
production implementation, or independent-subagent runtime is exercised.
"""
from __future__ import annotations
import argparse
import contextlib
import copy
import io
import json
from pathlib import Path
from jsonschema import Draft202012Validator

TOOL = {
    'type': 'object', 'additionalProperties': False, 'required': ['tool', 'args'],
    'properties': {
        'tool': {'enum': ['notebook_search', 'notebook_read', 'notebook_write',
                          'notebook_supersede', 'fresh_context_request', 'chatread']},
        'args': {'type': 'object'},
    },
    'allOf': [{
        'if': {'properties': {'tool': {'enum': ['notebook_read', 'chatread']}}, 'required': ['tool']},
        'then': {'properties': {'args': {'type': 'object', 'properties': {
            'range': {'type': 'object', 'required': ['convention'], 'properties': {
                'convention': {'enum': ['unicode_char_offsets', 'utf8_byte_offsets']}
            }}
        }}}}
    }]
}
TRANSITION = {
 'type':'object', 'additionalProperties':False,
 'required':['schema_version','transition_id','project_id','thread_id','run_lineage',
             'old_context_window_id','new_context_window_id','requested_controller',
             'effective_controller','route_snapshot_ref','reason','initiator','state',
             'checkpoint_ref','policy_generation'],
 'properties':{
  'schema_version':{'const':'1.0.0'},
  'transition_id':{'type':'string','pattern':'^cwt_[A-Za-z0-9]+$'},
  'project_id':{'type':'string','minLength':1},
  'thread_id':{'type':'string','pattern':'^thr_[A-Za-z0-9]+$'},
  'run_lineage':{'type':'object','additionalProperties':False,'required':['run_id'],
                 'properties':{'run_id':{'type':'string','minLength':1},
                               'attempt_id':{'type':['string','null'],'minLength':1}}},
  'old_context_window_id':{'type':'string','minLength':1},
  'new_context_window_id':{'type':['string','null'],'minLength':1},
  'requested_controller':{'enum':['pm_managed','provider_native','unavailable']},
  'effective_controller':{'enum':['pm_managed','provider_native','unavailable','degraded_fallback']},
  'route_snapshot_ref':{'type':'string','minLength':1},
  'reason':{'enum':['proactive_before_overflow','pressure_rising','pre_overflow_material_progress',
                    'overflow_imminent','model_change','recovery_reconstruction']},
  'initiator':{'enum':['agent_request','user_request','runtime_policy']},
  'state':{'enum':['requested','preparing','checkpointed','admitted','activated','recovered_resumed',
                  'deferred','denied','failed','cancelled']},
  'checkpoint_ref':{'type':['string','null'],'pattern':'^nbc_[A-Za-z0-9]+$'},
  'policy_generation':{'type':'integer','minimum':0},
  'stop_epoch_observed':{'type':['integer','null'],'minimum':0},
  'admission_receipt_ref':{'type':['string','null'],'minLength':1},
  'failure_reason':{'type':['string','null'],'minLength':1},
  'timestamps':{'type':'object','additionalProperties':False,'required':['requested_at_utc'],
                'properties':{'requested_at_utc':{'type':'string','format':'date-time'},
                              'checkpointed_at_utc':{'type':['string','null'],'format':'date-time'},
                              'activated_at_utc':{'type':['string','null'],'format':'date-time'},
                              'terminal_at_utc':{'type':['string','null'],'format':'date-time'}}},
 },
 'allOf':[
  {'if':{'properties':{'state':{'enum':['activated','recovered_resumed']}},'required':['state']},
   'then':{'properties':{'admission_receipt_ref':{'type':'string'},'checkpoint_ref':{'type':'string'}}}},
  {'if':{'properties':{'failure_reason':{'type':'string','pattern':'^crash_after_(commit|native_activation)'}},
         'required':['failure_reason']},
   'then':{'properties':{'checkpoint_ref':{'type':'string'}}}},
  {'if':{'properties':{'failure_reason':{'const':'crash_before_checkpoint_commit'}},'required':['failure_reason']},
   'then':{'properties':{'checkpoint_ref':{'const':None}}}},
 ]
}

def transition_invariants(t: dict) -> list[str]:
    """Same predicates as the retrieved script's context_transitions loop."""
    problems=[]
    if t['state'] in {'activated','recovered_resumed'}:
        if not t.get('admission_receipt_ref'): problems.append('success without admission')
        if not t.get('checkpoint_ref'): problems.append('success without checkpoint')
    if t['reason']=='run_rotation': problems.append('rotation conflation')
    if t['requested_controller']=='pm_managed' and t['effective_controller']=='provider_native' and not t.get('failure_reason'):
        problems.append('controller change without reason')
    failure=t.get('failure_reason')
    if isinstance(failure,str) and failure.startswith('crash_after_') and not t.get('checkpoint_ref'):
        problems.append('crash after commit lacks checkpoint')
    if failure=='crash_before_checkpoint_commit' and t.get('checkpoint_ref'):
        problems.append('crash before commit claims checkpoint')
    return problems

def errors(schema: dict, payload: dict) -> list[str]:
    return [e.message for e in Draft202012Validator(schema).iter_errors(payload)]

def main() -> None:
    records=[]
    tools=[
        ('tool_empty_chatread', {'tool':'chatread','args':{}}),
        ('tool_empty_notebook_write', {'tool':'notebook_write','args':{}}),
        ('tool_negative_range', {'tool':'chatread','args':{'range':{'convention':'unicode_char_offsets','start':-20,'end':-5}}}),
        ('tool_unknown_parameter', {'tool':'fresh_context_request','args':{'reason':'proactive_before_overflow','invented_parameter':True}}),
    ]
    for label,payload in tools:
        es=errors(TOOL,payload)
        records.append({'probe_id':label,'schema_accepts':not es,'errors':es,'payload':payload})
    base={
        'schema_version':'1.0.0','transition_id':'cwt_PROBE1','project_id':'project_probe',
        'thread_id':'thr_PROBE1','run_lineage':{'run_id':'run-probe','attempt_id':'attempt-probe'},
        'old_context_window_id':'cw-old','new_context_window_id':'cw-new',
        'requested_controller':'pm_managed','effective_controller':'pm_managed',
        'route_snapshot_ref':'route:probe','reason':'proactive_before_overflow',
        'initiator':'agent_request','state':'activated','checkpoint_ref':'nbc_PROBE1',
        'policy_generation':1,'stop_epoch_observed':0,
        'admission_receipt_ref':'ProviderDispatchAdmissionReceipt:probe','failure_reason':None,
        'timestamps':{'requested_at_utc':'2026-09-06T00:00:00Z','activated_at_utc':'2026-09-06T00:00:01Z'},
    }
    payloads=[('transition_control',base)]
    p=copy.deepcopy(base); p.pop('admission_receipt_ref'); payloads.append(('transition_missing_receipt',p))
    p=copy.deepcopy(base); p['new_context_window_id']=None; payloads.append(('activated_null_new_window',p))
    p=copy.deepcopy(base); p['effective_controller']='unavailable'; payloads.append(('activated_unavailable_controller',p))
    for label,payload in payloads:
        es=errors(TRANSITION,payload); inv=transition_invariants(payload)
        records.append({'probe_id':label,'schema_accepts':not es,
                        'retrieved_transition_invariant_predicates_accept':not inv,
                        'schema_errors':es,'invariant_errors':inv,'payload':payload})
    # Exact root array declarations use items:$ref and have no minItems. With
    # no elements, JSON Schema never traverses those item references.
    families={'notebooks':'working_notebook_record','entry_envelopes':'working_notebook_entry_record',
              'revision_mutations':'notebook_revision_mutation','resume_capsules':'resume_capsule',
              'notebook_checkpoints':'notebook_checkpoint_record','context_transitions':'context_transition_record',
              'tool_requests':'tool_request','typed_errors':'typed_error'}
    root={'type':'object','additionalProperties':False,
          'required':['schema_id','schema_version',*families],
          'properties':{'schema_id':{'const':'pm.working_notebook_contracts.v1'},
                        'schema_version':{'const':'1.0.0'},'claim_boundary':{'type':'string','minLength':1},
                        **{k:{'type':'array','items':{'$ref':'#/$defs/'+v}} for k,v in families.items()}}}
    empty={'schema_id':'pm.working_notebook_contracts.v1','schema_version':'1.0.0',**{k:[] for k in families}}
    records.append({'probe_id':'empty_positive_fixture_families','root_schema_accepts':not errors(root,empty),
                    'empty_negative_rejected_all_expression':all([]),
                    'scope_note':'Registry checks are separate; they are not rerun here.'})
    parser=argparse.ArgumentParser(); parser.add_argument('--json',action='store_true')
    with contextlib.redirect_stderr(io.StringIO()) as stderr:
        try: parser.parse_args(['validate']); code=0
        except SystemExit as exc: code=exc.code
    records.append({'probe_id':'documented_validate_argument','exit_code':code,'stderr':stderr.getvalue()})
    result={'subject_commit':'2826699f7e7f23ab12a8fdfaf5f1518748f12d5a',
            'method':'Local focused source-fragment reproduction; not full repo gates or product runtime.',
            'probe_count':len(records),'probes':records}
    out=Path(__file__).with_name('schema_fragment_probe_results.json')
    out.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result,indent=2))

if __name__=='__main__': main()
