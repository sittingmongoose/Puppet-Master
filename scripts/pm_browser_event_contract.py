"""Validate proposed Browser event payloads without registering or emitting events.

This is a contract-test surface, not BrowserRuntimeService or Event Authority.
Canonical native dispatch, durable append/replay, and source-receipt lookup still
require their real owners. Unknown references cannot be made true by this tool.
"""
from __future__ import annotations
from typing import Any

KNOWN_CHECKS={
 'workspace_revision_advances','lease_epoch_advances','holder_changes',
 'page_generation_advances','delta_base_distinct','strategy_changes',
 'unknown_effects_fail_closed','action_sets_disjoint',
 'completion_has_no_unknown_effects','host_changes','destination_host_matches'}

def semantic_errors(row: dict, payload: dict, envelope: dict | None = None) -> list[str]:
    errors=[]
    if not isinstance(row,dict) or not isinstance(payload,dict):return ['row and payload must be objects']
    if payload.get('schema_id')!=row.get('payload_schema_id'):errors.append('payload_schema_id mismatch')
    checks=row.get('semantic_checks')
    if not isinstance(checks,list) or any(c not in KNOWN_CHECKS for c in checks):return errors+['unknown semantic check']
    facts=payload.get('facts',{});subject=payload.get('subject',{});lineage=payload.get('lineage',{})
    if not all(isinstance(v,dict)for v in(facts,subject,lineage)):return errors+['invalid payload structure']
    def require(condition,reason):
        if not condition:errors.append(reason)
    def advances(new,old):return type(new)is int and type(old)is int and new>old>=0
    for c in checks:
        if c=='workspace_revision_advances':require(advances(facts.get('workspace_revision'),facts.get('previous_workspace_revision')),c)
        elif c=='lease_epoch_advances':require(advances(facts.get('lease_epoch'),facts.get('previous_lease_epoch')),c)
        elif c=='holder_changes':require(facts.get('holder_ref')!=facts.get('previous_holder_ref'),c)
        elif c=='page_generation_advances':require(advances(subject.get('page_generation'),facts.get('previous_page_generation')),c)
        elif c=='delta_base_distinct':require(facts.get('representation_id')!=facts.get('base_representation_id'),c)
        elif c=='strategy_changes':require(facts.get('requested_strategy_ref')!=facts.get('effective_strategy_ref'),c)
        elif c=='unknown_effects_fail_closed':
            if facts.get('effect_state')=='effect_unknown' or facts.get('unknown_effect_action_ids'):
                require(facts.get('retry_allowed')is False and facts.get('safe_next_action')=='reconcile_effects' and facts.get('effect_state')=='effect_unknown',c)
        elif c=='action_sets_disjoint':
            a=facts.get('completed_action_ids');b=facts.get('unknown_effect_action_ids')
            require(isinstance(a,list) and isinstance(b,list) and all(isinstance(x,str)for x in a+b) and not set(a).intersection(b),c)
        elif c=='completion_has_no_unknown_effects':require(facts.get('unknown_effect_action_ids')==[] and facts.get('effect_state')!='effect_unknown',c)
        elif c=='host_changes':require(facts.get('source_execution_host_id')!=facts.get('destination_execution_host_id'),c)
        elif c=='destination_host_matches':require(facts.get('destination_execution_host_id')==lineage.get('execution_host_id'),c)
    if envelope is not None:
        if not isinstance(envelope,dict):return errors+['envelope must be an object']
        require(envelope.get('event_type')==row.get('event_type'),'event_type mismatch')
        require(envelope.get('payload_schema_id')==payload.get('schema_id'),'envelope payload schema mismatch')
        require(envelope.get('scope_kind')=='project','Browser events require project scope')
        for key in ('project_id','run_id','attempt_id'):
            require(key in lineage and envelope.get(key)==lineage[key],f'{key} lineage mismatch')
        if 'thread_id' in lineage:require(envelope.get('thread_id')==lineage['thread_id'],'thread_id lineage mismatch')
    return errors
