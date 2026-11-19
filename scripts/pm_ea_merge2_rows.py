"""Exact-family contract adapters for admission merge 2; no membership decisions."""
from __future__ import annotations
import re
import functools
import yaml
from pathlib import Path
from pm_ea_admission_rows import (Gap, load, grade_rows, unit_ref, find_by_event,
    scope_from_grade, graded_unit)

ROOT = Path(__file__).resolve().parents[1]

@functools.lru_cache(maxsize=None)
def _text(path):
    return (ROOT/path).read_text()

@functools.lru_cache(maxsize=None)
def _owner_body(unit):
    owner=unit_ref(unit)
    if not owner:return ''
    text=_text(owner.split('#')[0])
    match=re.search(r'(?m)^### '+re.escape(unit)+r'(?![0-9])[^\n]*\n',text)
    if not match:return ''
    stop=text.find('\n### ',match.end())
    body=text[match.start():stop if stop>=0 else len(text)]
    def plain(match):
        try:doc=yaml.safe_load(match.group(1))
        except yaml.YAMLError:return match.group()
        return str(doc.get('canonical_text','')) if isinstance(doc,dict) else match.group()
    return re.sub(r'```yaml\n(.*?)\n```',plain,body,flags=re.S)

def _owner_scope(grade,event):
    """Read explicit scope declarations, never infer application permission from its retention bucket."""
    scopes=set();sources=[]
    for unit in grade.get('current_owner_units',[]):
        owner=unit_ref(unit)
        if not owner:continue
        path=owner.split('#')[0]
        body=_owner_body(unit)
        if not body:continue
        exact=re.findall(r'This contract applies only to `'+re.escape(event)+r'`[^\n]*?Scope is \*\*(application_only|application_or_project|project_only)\*\*',body)
        if exact:
            scopes.update(exact);sources.append(owner)
        if '**Payload and scope.**' in body:
            paragraph=next((p for p in body.split('\n\n') if '**Payload and scope.**'in p), '')
            if 'Project scope only' in paragraph:scopes.add('project_only');sources.append(owner)
        if unit.startswith('CV-') and '**Scope and joins.**' in body:
            paragraph=next((p for p in body.split('\n\n') if '**Scope and joins.**'in p), '')
            scopes.update(re.findall(r'\b(application_only|application_or_project|project_only)\b',paragraph))
            sources.append(owner)
        tokens=set(re.findall(r'\b(application_only|application_or_project|project_only)\b',body))
        if len(tokens)==1:scopes.update(tokens);sources.append(owner)
        for paragraph in body.split('\n\n'):
            if re.search(r'(?<![A-Za-z0-9_.])'+re.escape(event)+r'(?![A-Za-z0-9_.])',paragraph):
                tokens=set(re.findall(r'\b(application_only|application_or_project|project_only)\b',paragraph))
                if len(tokens)==1:scopes.update(tokens);sources.append(owner)
        if 'preserved Project edition' in body and (
                'does not claim application admission' in body or 'separately unadmitted application edition' in body
                or re.search(r'application edition[^.]{0,100}(?:unadmitted|without admission|not admitted)',body)):
            scopes.add('project_only');sources.append(owner)
    if len(scopes)>1:raise Gap('explicit owner scope declarations disagree: '+str(sorted(scopes)))
    return (scopes.pop(),'; '.join(sources)) if scopes else (None,None)

def _rows(doc):
    return doc if isinstance(doc,list) else doc.get('rows',doc.get('families',doc.get('contracts',[])))

def _facts(path,event,key='event_type'):
    doc=load(path)
    index,row=find_by_event(_rows(doc),event,key)
    container=next((k for k in ('rows','families','contracts') if isinstance(doc,dict) and k in doc),None)
    return row,path+('#/'+str(index) if isinstance(doc,list) else '#/'+container+'/'+str(index))

def _payload_evidence(grade):
    candidates=set()
    for item in grade['cells']['closed_payload_schema'].get('evidence',[]):
        path=item.get('path','')
        if not path.startswith('Plans/') or not path.endswith('.schema.json'):continue
        unit=item.get('unit','')
        pointer=unit[unit.index('#/'):] if '#/' in unit else '#'
        candidates.add(path+pointer)
    if not candidates:
        for unit in grade.get('current_owner_units',[]):
            body=_owner_body(unit)
            candidates.update(re.findall(r'Payload and scope:\s*the exact closed\s*schema is\s*`?(Plans/[A-Za-z0-9_./-]+\.schema\.json)',body))
        candidates={p+'#' for p in candidates}
    if len(candidates)!=1:raise Gap('no unique payload schema in closed-payload evidence: '+repr(sorted(candidates)))
    return candidates.pop()

def contract(lane,event):
    grade=grade_rows(lane)[event]
    out=dict(owners={},retention={},editions={},edition_ids={},scope_policy=None,contract_ref=None,prepared_row=None)
    slug=event.replace('.','_')
    if lane=='S4B':
        path='reports/event-authority-20261114/S4B-contracts.json'
        index,spec=find_by_event(load(path)['families'],event)
        row=load('Plans/browser_event_admission.json')['rows'][spec['admission_row_index']]
        ref=row['payload_schema_ref']
        out.update(scope_policy='project_only',contract_ref=f'{path}#/families/{index}',
            editions={'project':ref['path']+ref['json_pointer']},retention={'project':spec['retention_policy']},
            owners=dict(semantic=row['semantic_owner_ref'],payload='Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe',storage='Plans/storage-plan.md#'+spec['sp_unit']),
            extra_source_refs=[f"Plans/browser_event_admission.json#/rows/{spec['admission_row_index']}",
                               'Plans/Contracts_V0.md#'+spec['cv_unit']])
        return out
    if lane=='DC':
        path='Plans/collaboration_event_admission.json'
        index,row=find_by_event(load(path)['rows'],event)
        out.update(contract_ref=f'{path}#/rows/{index}',prepared_row=row['registry_row'])
        return out
    if lane=='DCH':
        if event=='chat.response_stop_requested':
            ref='Plans/dch_stop_request.schema.json#';out['contract_ref']='Plans/dch_stop_contracts.json#'
        else:
            facts,source=_facts('Plans/dch_event_contracts.json',event)
            ref=facts['payload_schema_ref']+'#';out['contract_ref']=source
            out['owners']=dict(semantic=unit_ref(facts['owner_unit']),payload=unit_ref(facts['payload_unit']),storage=unit_ref(facts['storage_unit']))
        schema=load(ref.split('#')[0])
        if {'project','application'} <= set(schema.get('$defs',{})):
            out.update(scope_policy='application_or_project',editions={s:ref.split('#')[0]+'#/$defs/'+s for s in ('project','application')})
    elif lane=='DMEM':
        ref='Plans/memory_maintenance_event_payloads.schema.json#/$defs/'+slug
        out['contract_ref']='Plans/memory_maintenance_contracts.json#'
        # Card 1b declares owners by role; its SP payloads are not the CV
        # verification-sweep units adopted by the archive preparation.
        parent=load('Plans/memory_maintenance_contracts.json')
        card1b=parent.get('card1b_prepared_contracts_ref')
        if card1b:
            if card1b != 'Plans/memory_archive_contracts.json':
                raise Gap('unknown Card 1b contract reference')
            matches=[(i,row) for i,row in enumerate(load(card1b)['families']) if row['event_type']==event]
            if len(matches)>1:raise Gap('ambiguous Card 1b family contract')
            if matches:
                i,row=matches[0]
                out.update(contract_ref=f'{card1b}#/families/{i}',
                    owners={role:row[role+'_owner'] for role in ('semantic','payload','storage')},
                    extra_source_refs=['Plans/memory_maintenance_contracts.json#/card1b_prepared_contracts_ref'])
    elif lane=='DO':
        facts,source=_facts('Plans/orchestrator_event_contract_fixtures.json',event)
        ref='Plans/orchestrator_event_payloads.schema.json#/$defs/'+facts['definition']
        if event.startswith('crew.board_'):
            # Same closed definition, with the payload identifier already declared by its OSI owner.
            ref='Plans/event_payloads/admission_merge2/'+facts['definition']+'.schema.json#'
            out['extra_source_refs']=['Plans/orchestrator_event_payloads.schema.json#/$defs/'+facts['definition'],
                'reports/event-authority-20261116/admission-merge-2/payload-identity-copies.json']
        out['owners']=dict(semantic=unit_ref(facts['unit']),payload=unit_ref(facts['unit']))
        out['contract_ref']=source
    elif lane=='DC':
        ref='Plans/collaboration_event_payloads.schema.json#/$defs/'+slug
        out['contract_ref']=ref
    elif lane=='DG6B':
        ref='Plans/dg6b_event_contracts.schema.json#/$defs/'+slug
        out['contract_ref']=ref
        if event.startswith('plugin.'):
            body=_owner_body('SP-671')
            if "for plugin observations it is `application_or_project`" not in body:
                raise Gap('SP-671 exact plugin scope declaration changed')
            out.update(scope_policy='application_or_project',scope_source='Plans/storage-plan.md#SP-671 (plugin-specific clause)')
        if grade.get('family_revision') is None:
            body=' '.join(_owner_body(u) for u in grade.get('current_owner_units',[]))
            versions=set(re.findall(re.escape(event)+r'(?:@|[ \t]+)([1-9][0-9]*\.[0-9]+\.[0-9]+)',body))
            if not versions:
                versions=set(re.findall(r'`'+re.escape(event)+r'`:\s*closed payload[^\n]*?version `([1-9][0-9]*\.[0-9]+\.[0-9]+)`',body))
            if len(versions)==1:out['family_revision']=versions.pop()
    elif lane=='DT':
        facts,source=_facts('Plans/dt_event_contracts.json',event)
        ref=facts['payload_schema_ref'];out['contract_ref']=source
        out['scope_policy']=facts['scope_policy']
        out['owners']=dict(payload=unit_ref(facts['cv']),storage=unit_ref(facts['sp']))
        if event=='config.migrated':
            # SP-584 explicitly applies the same operational policy to SP-349's Server-wide counterpart bucket.
            out['retention']={'project':'RP-OPERATIONAL-2555D@1.0.0','application':'RP-OPERATIONAL-2555D@1.0.0'}
    elif lane=='DS15':
        choices=[]
        for path in ('Plans/ds15_event_contracts.json','Plans/ds15_deck2_contracts.json'):
            choices += [(path,i,x) for i,x in enumerate(load(path)) if x['event_type']==event]
        if len(choices)!=1:raise Gap('DS15 exact contracts: '+str(len(choices)))
        path,index,facts=choices[0];ref=facts['payload_schema_ref']+'#'
        out.update(contract_ref=f'{path}#/{index}',scope_policy=facts['scope_policy'],
            owners=dict(semantic=facts['semantic_owner'],payload=facts['payload_owner'],storage=facts['storage_owner']))
        if out['scope_policy']=='project_or_app_actual_browser_namespace':
            schema=load(facts['payload_schema_ref'])
            if set(schema['properties']['scope']['properties']['kind']['enum'])!={'project','app'}:
                raise Gap('DS15 Browser scope declaration and closed schema disagree')
            out['scope_policy']='application_or_project'
        if facts.get('retention_policy_ref') not in (None,'PENDING_RETENTION_DECISION'):
            out['retention']={'project':facts['retention_policy_ref']}
        if event=='tool.custom_headless.skipped':
            body=_owner_body('SMPFS-326')
            if 'Retention: Event and derived checkpoint adopt DL-401 G14 / RP-OPERATIONAL-2555D@1.0.0' not in body:
                raise Gap('SMPFS-326 exact retention binding changed')
            out['retention']={'project':'RP-OPERATIONAL-2555D@1.0.0'}
    elif lane=='DR':
        facts,source=_facts('Plans/runtime_artifact_event_drafts.json',event)
        ref=facts['payload_schema_ref']+'#'
        out.update(contract_ref=source,scope_policy=facts['scope_policy'],
            owners=dict(semantic=unit_ref(facts['owner_unit']),payload=unit_ref(facts['payload_unit']),storage=unit_ref(facts['storage_unit'])),
            retention={'project':facts['retention_policy_ref']})
    elif lane=='W3D':
        facts,source=_facts('reports/event-authority-20261105/W3D-outcomes.json',event,'name')
        ref='Plans/bsd_event_payloads.schema.json#/$defs/'+event.removeprefix('bsd.').replace('.','_')
        out.update(contract_ref=source,scope_policy='project_only',
            owners=dict(semantic=unit_ref(facts['owner_unit']),payload=unit_ref(facts['contract_unit']),storage=unit_ref(facts['storage_unit'])))
        policy=facts['retention_policy_ref']
        if isinstance(policy,dict):policy=policy['policy_id']+'@'+policy['policy_version']
        if policy!='PENDING_RETENTION_DECISION':out['retention']={'project':policy}
    elif lane=='W3E':
        facts,source=_facts('reports/event-authority-20261105/W3E-outcomes.json',event)
        ref=facts['payload_schema']+'#';out['contract_ref']=source
        out['owners']=dict(semantic=facts['owner_doc']+'#'+facts['owner_unit'],payload=unit_ref(facts['contract_unit']),storage=unit_ref(facts['storage_unit']))
    elif lane=='W3I':
        ref='Plans/continuity_event_contracts.schema.json#/$defs/'+event.removeprefix('continuity.')
        out.update(contract_ref=ref,scope_policy='project_only')
    elif lane in ('DG6A','DF','DFM','DCW'):
        ref=_payload_evidence(grade);out['contract_ref']=ref
        if lane in ('DG6A','DFM','DCW'):out['scope_policy']='project_only'
        if lane=='DG6A':
            panels = {row['event_type']: row for row in load('Plans/panel_event_contracts/manifest.json')['families']}
            if event in panels:
                panel = panels[event]
                fixtures = load('Plans/panel_event_contracts/' + panel['slug'] + '.fixtures.json')
                positives = [case['value'] for case in fixtures['payload_cases'] if case['valid']]
                scopes = {'application' if value['project_id'] is None else 'project' for value in positives}
                if scopes != {'application', 'project'}:
                    raise Gap('Panel owner specimens do not establish both scope editions')
                storage = _owner_body(panel['sp'])
                if 'application' not in storage.lower() or 'Project' not in storage:
                    raise Gap('Panel Storage owner does not state both scope editions')
                out['scope_policy'] = 'application_or_project'
                out['scope_source'] = 'Plans/storage-plan.md#' + panel['sp'] + ' and named panel payload positives'
            owner=[u for u in grade.get('current_owner_units',[]) if not u.startswith(('SP-','CV-','ATS-'))]
            if event=='concern.created':out['owners']['semantic']='Plans/Orchestrator_Page.md#OP-004'
            elif len(owner)==1:out['owners']['semantic']=unit_ref(owner[0])
            else:raise Gap('DG6A semantic owner is not unique')
            if not any(u.startswith('CV-') for u in grade.get('current_owner_units',[])):
                out['owners']['payload']=out['owners']['semantic']
    else:raise Gap('no merge-2 adapter for '+lane)
    if not out['editions']:out['editions']={'project':ref}
    if not out['contract_ref']:out['contract_ref']=ref
    delta=grade.get('retention_delta')
    if delta:
        if delta.get('history_policy_ref'):out['retention']['project']=delta['history_policy_ref']
        if delta.get('application_policy_ref'):out['retention']['application']=delta['application_policy_ref']
        if delta.get('history_policy_setting_ref') and event != 'usage.event':
            raise Gap('setting-driven retention has no fixed-policy registry encoding: '+delta['history_policy_setting_ref'])
    if out['scope_policy'] is None:
        out['scope_policy']=scope_from_grade(grade)
    if out['scope_policy'] is None:
        out['scope_policy'],out['scope_source']=_owner_scope(grade,event)
    if out['scope_policy']=='application_only' and set(out['editions'])=={'project'}:
        out['editions']={'application':out['editions']['project']}
        if 'project'in out['retention'] and 'application'not in out['retention']:
            # For an application-only family the map's history_policy_ref names its only event history.
            out['retention']={'application':out['retention']['project']}
    return out
