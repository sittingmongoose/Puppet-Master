"""The bundle CLI's original shape/order controls, as explicit witnesses.

This is the actual standalone legacy validator boundary, not append proof.
The six/eight-family full compositions are collected separately.
"""
import copy

import pm_bundle_revision_events as legacy
import pm_dcw_event_oracles as m


def cases(family=None):
    for row in m.load('Plans/bundle_revision_event_fixtures.json')['families']:
        if family and row['event_type']!=family:continue
        payload=copy.deepcopy(row['positive']);eid,key=legacy.identity(payload)
        envelope=dict(event_id=eid,idempotency_key=key,scope_kind='project',project_id=payload['project_id'],
            thread_id=payload['thread_id'],correlation_id=payload['revision_id'],
            causation_event_id=payload['predecessor_event_id'],run_id=None,attempt_id=None,
            redaction_profile='secret_refs_only',replay_policy='dedupe_by_idempotency_key')
        previous=None if row['phase']=='requested' else dict(payload,event_id='evt-predecessor',
            event_type='bundle.revision_'+('requested' if row['phase']=='started' else 'started'),phase_sequence=payload['phase_sequence']-1)
        def specimen(label,p=payload,e=envelope,prev=previous,expected='accept'):
            return dict(id=row['event_type']+'/legacy/'+label,family=row['event_type'],kind='legacy',
                row=row,value=dict(payload=copy.deepcopy(p),envelope=copy.deepcopy(e),previous=copy.deepcopy(prev)),
                operation='standalone_shape',expected=expected)
        yield specimen('control')
        historical=specimen('historical-policy',e=dict(envelope,replay_policy='append_once'),expected='replay')
        historical['value']['passive']=True
        yield historical
        for field in payload:
            p=copy.deepcopy(payload);del p[field];yield specimen('missing/'+field,p=p,expected='schema')
        for field,value,code in [('event_id','wrong','identity'),('idempotency_key','wrong','identity'),
            ('scope_kind','application','scope'),('project_id','other','project_id'),('thread_id','other','thread_id'),
            ('correlation_id','other','correlation'),('causation_event_id','other','causation'),
            ('run_id','run','runtime_scope'),('attempt_id','attempt','runtime_scope'),
            ('redaction_profile','no_secrets','redaction'),('replay_policy','effectful','replay')]:
            e=copy.deepcopy(envelope);e[field]=value;yield specimen(field,e=e,expected=code)
        if previous is not None:
            for field in ('event_type','event_id','project_id','thread_id','bundle_id','revision_id',
                          'requested_revision_capability','effective_revision_capability','permission_snapshot_id','annotation_ids'):
                prev=copy.deepcopy(previous);prev[field]=['other'] if field=='annotation_ids' else 'other'
                code='phase_order' if field=='event_type' else 'predecessor_identity' if field=='event_id' else 'predecessor_'+field
                yield specimen('previous/'+field,prev=prev,expected=code)
            yield specimen('previous/missing',prev=None,expected='missing_predecessor')
            prev=copy.deepcopy(previous);prev['phase_sequence']=1.0
            yield specimen('previous/type',prev=prev,expected='phase_sequence')
            prev=copy.deepcopy(previous);prev['phase_sequence']+=1
            yield specimen('previous/sequence',prev=prev,expected='phase_sequence')
        else:
            yield specimen('unexpected_previous',prev=payload,expected='request_predecessor')
