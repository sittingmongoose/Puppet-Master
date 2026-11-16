#!/usr/bin/env python3
"""Apply pinned Known37 successor selectors, one checkpoint and commit per family.

Source grade verdicts remain unchanged. A pending schema/scope cell is completed
only by selecting its declared successor and checking the complete registry.
Post-August families are refused here: their revisions require a new DL-077 record.
DG5 may confirm an already selected definition only from a pinned exact-row map
and twelve reviewed PASS cells; its row bytes and SemVer remain unchanged.
"""
from __future__ import annotations
import argparse
import copy
import importlib.util
import json
from pathlib import Path
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
spec=importlib.util.spec_from_file_location('revision_admission_writer',ROOT/'scripts/pm-ea-admission-writer.py')
w=importlib.util.module_from_spec(spec);spec.loader.exec_module(w)

def load(path):return json.loads((ROOT/path).read_text())
def dump(path,value):w.write_text(path,json.dumps(value,indent=1,ensure_ascii=False)+'\n')
def require(ok,message):
    if not ok:raise SystemExit(message)

def confirmation_inputs(item,index,old,row,grade):
    """The standing DG5 switch can complete definitions without changing a selector."""
    event=item['event_type']
    require(event in {'goal.updated','goal.cancelled','goal_run.started','goal_run.cancelled','goal_run.certified'},
            'definition confirmation is restricted to the five authorized DG successors')
    require(row==old and row['family_revision']=='3.0.0','confirmation must preserve the exact selected v3 row')
    require(not item.get('activate'),'confirmation cannot promote a pending cell')
    for field in w.EVIDENCE_FIELDS:
        require(grade['cells'][field]['status']=='PASS',event+': confirmation awaits reviewed PASS for '+field)
    pin=item.get('selector_map',{})
    path=Path(pin.get('path',''))
    if path.is_absolute():
        require(path.resolve().is_relative_to(w.EVIDENCE_ROOT.resolve()),'selector map outside campaign custody')
    else:
        require(str(path).startswith('reports/') and '..' not in path.parts,'selector map must be a result bundle')
        path=ROOT/path
    require(path.is_file() and w.sha256_file(path)==pin.get('sha256'),'selector map bytes differ')
    entry=json.loads(path.read_text())['families'].get(event,{})
    require(entry.get('row')==row and entry.get('row_canonical_sha256')==w.canonical_sha256(row),
            'selector map differs from the existing row')
    require(entry.get('registry_pointer')==f'#/families/{index}','selector map family pointer differs')
    clauses=entry.get('owner_clauses',[])
    require(bool(clauses),'selector map lacks owner clauses')
    for clause in clauses:
        require(str(clause.get('path','')).startswith('Plans/')
                and w.unit_ref(clause.get('unit'))==clause.get('path')+'#'+clause.get('unit',''),
                'selector map clause must name its own declared PlanUnit')
    return [w.refresh_evidence(dict(e,line_start=e.get('line_start',e.get('line',1)))) for e in clauses]

def checkpoint(before,after,event,dl,confirmation=False):
    current=w.read_raw(w.CURRENTNESS)
    current,n=re.subn(r'(?m)^EVENT_FAMILY_REGISTRY_REVISION = "[^"]+"$',
                     'EVENT_FAMILY_REGISTRY_REVISION = "'+after['revision']+'"',current)
    require(n==1,'checkpoint revision missing')
    start=current.index(w.PIN_MARKER)
    end=current.index('# move with the next reseal, not here.\n',start)+len('# move with the next reseal, not here.\n')
    verb='definition confirmed' if confirmation else 'revised'
    paragraph=(f"{w.PIN_MARKER} 2, S5b under Jared's EA-P3 A standing rule.\n"
               f"# Registered family {event} {verb} by Plans/Decision_Log.md#{dl}; count unchanged.\n"
               f"# registry {after['revision']}, {after['family_count']} families, SHA-256\n"
               f"# {after['sha256']} (predecessor\n# {before['sha256']}). The audit status file's pinned revision and hash\n"
               '# move with the next reseal, not here.\n')
    w.write_text(w.CURRENTNESS,current[:start]+paragraph+current[end:])
    golden=w.read_raw(w.LEGACY_GOLDEN)
    old='"registry_revision": "'+before['revision']+'"'
    require(golden.count(old)==1,'golden checkpoint label missing')
    w.write_text(w.LEGACY_GOLDEN,golden.replace(old,'"registry_revision": "'+after['revision']+'"'))

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--manifest',required=True);p.add_argument('--sha256',required=True)
    p.add_argument('--dl-start',type=int,required=True);p.add_argument('--revision-date',required=True)
    p.add_argument('--check-only',action='store_true')
    p.add_argument('--commit',action='store_true');a=p.parse_args()
    require(w.sha256_file(ROOT/a.manifest)==a.sha256,'revision manifest hash differs')
    require(not w.git('status','--porcelain','--untracked-files=no').strip(),'working tree not clean')
    manifest=load(a.manifest)
    known=load(w.AUDIT+'/known37_event_types.json')
    known=set(known.get('event_types',[]) if isinstance(known,dict) else known)
    readiness=w.load_module('revision_readiness','scripts/pm-implementation-readiness.py')
    for number,item in enumerate(manifest['revisions'],a.dl_start):
        event=item['event_type'];dl='DL-'+str(number)
        require(event in known,'post-August revisions need a fresh DL-077 record: '+event)
        registry=load(w.REGISTRY)
        index,old=w.find_by_event(registry['families'],event)
        require(w.canonical_sha256(old)==item['before_row_sha256'],'registered predecessor differs: '+event)
        row=item['registry_row']
        require(row['event_type']==event and row['family_id']==old['family_id'],'family identity changes')
        require(not w.schema_failures(row),'successor row fails registry schema')
        grade_source=item['grade_source']
        require(w.sha256_file(ROOT/grade_source['path'])==grade_source['sha256'],'grade bytes differ')
        grade=next(r for r in load(grade_source['path'])['rows'] if r['event_type']==event)
        action=item.get('action','revise_row')
        require(action in {'revise_row','confirm_definition'},'unsupported registered-family action')
        confirmation=action=='confirm_definition'
        clauses=confirmation_inputs(item,index,old,row,grade) if confirmation else []
        if confirmation:
            require(w.render_registry(registry)==w.read_raw(w.REGISTRY),'confirmation requires exact registry round-trip')
            # Keep the existing serialization order as well as every value.
            row=copy.deepcopy(old)
        folder='definition-confirmations' if confirmation else 'revisions'
        depth_path='reports/event-authority-20261116/admission-merge-2/'+folder+'/'+event+'.json'
        require(not (ROOT/depth_path).exists(),'assessment already exists: '+depth_path)
        require(not re.search(r'(?m)^plan_unit_id: '+dl+r'$',w.read_raw(w.DECISION_LOG)),dl+' is already used')
        activated=item.get('activate',{})
        # All technical criteria other than a pending selector must already PASS.
        for field in w.EVIDENCE_FIELDS[1:]:
            status=grade['cells'][field]['status']
            require(status=='PASS' or field in activated,event+': source grade is '+status+' for '+field)
        for field,basis in activated.items():
            require(field in ('closed_payload_schema','scope_identity'),'unsupported activation')
            require(basis['predicate'] in ('exact_successor_selector','DL409_unused_application_withdrawal'),'unknown activation predicate')
            if basis['predicate']=='exact_successor_selector':
                require(row['payload_schema_ref']==basis['payload_schema_ref'],'selected schema differs from activation proof')
                schema=load(row['payload_schema_ref']['path'])
                require(schema.get('$id')==row['payload_schema_id'],'selected schema identity differs')
                require(schema.get('type')=='object' and schema.get('additionalProperties') is False,'successor root is not closed')
                require(row['legacy']['identity_json_pointers']==basis['identity_json_pointers'],'successor identity differs')
            else:
                require(event in ('goal.evidence_captured','goal.receipt_recorded','goal.tool_check_recorded'),'DL409 family mismatch')
                expected=copy.deepcopy(old);expected['scope_policy']='project_only'
                expected['payload_versions']=[v for v in expected['payload_versions'] if v['scope_kind']=='project']
                require(row==expected,'DL409 withdrawal changes more than the unused application selector')
        before=dict(revision=registry['registry_revision'],family_count=len(registry['families']),sha256=w.sha256_file(ROOT/w.REGISTRY))
        registry['families'][index]=row
        registry['registry_revision']=w.next_revision(before['revision'],a.revision_date)
        readiness_text=None
        if old['payload_schema_ref']['path'] != row['payload_schema_ref']['path']:
            # The kernel check pins exact paths; move this family's pin with
            # the selector instead of allowing a second interchangeable root.
            old_line='    '+json.dumps(event)+': '+json.dumps(old['payload_schema_ref']['path'])+','
            new_line='    '+json.dumps(event)+': '+json.dumps(row['payload_schema_ref']['path'])+','
            readiness_text=w.read_raw('scripts/pm-implementation-readiness.py')
            require(readiness_text.count(old_line)==1,'exact Goal payload path pin missing')
            readiness_text=readiness_text.replace(old_line,new_line)
            readiness.EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS[event]=row['payload_schema_ref']['path']
        diagnostics=readiness.event_family_registry_data_failures(registry,load(w.REGISTRY_SCHEMA),path_label=w.REGISTRY,include_residuals=False)
        require(not diagnostics,'successor registry diagnostics: '+json.dumps(diagnostics))
        rendered=w.render_registry(registry)
        after=dict(revision=registry['registry_revision'],family_count=len(registry['families']),sha256=w.sha256_bytes(rendered.encode()))
        # Refresh citations before any write; a missing quote stops this family.
        cells={}
        for field in w.EVIDENCE_FIELDS[1:]:
            source=grade['cells'][field]
            if field in activated:
                basis=activated[field]
                evidence=[w.refresh_evidence(e) for e in basis['evidence']]
                cells[field]=dict(status='PASS',representation='selected_prepared_contract',finding=basis['finding'],
                    evidence=evidence,source_grade=dict(grade_source,field=field,status=source['status'],finding=source['finding']),
                    predicate=basis['predicate'])
            else:
                require(any(e.get('path','').startswith('Plans/') for e in source['evidence']),field+' lacks Plans evidence')
                cells[field]=dict(status='PASS',representation=source.get('representation'),finding=source['finding'],
                    evidence=[w.refresh_evidence(e) for e in source['evidence']],carried_from=dict(grade_source,field=field,status=source['status']))
        if a.check_only:
            print(json.dumps(dict(event_type=event,action=action,validated_only=True,row_sha256=w.canonical_sha256(row))),flush=True)
            continue
        w.write_text(w.REGISTRY,rendered)
        if readiness_text is not None:
            w.write_text('scripts/pm-implementation-readiness.py',readiness_text)
        ctx=dict(after=after,row_index=index,row_lines=w.row_lines(rendered,row['family_id']),row_sha256=w.canonical_sha256(row))
        cells['membership_version']=w.membership_cell(dict(event_type=event),ctx)
        selection='retains its exact selected v3 row and confirms the completed definition' if confirmation else 'now selects the pinned successor'
        cells['membership_version']['finding']=f"Existing family at #/families/{index} {selection}; canonical row SHA-256 {ctx['row_sha256']}."
        (ROOT/depth_path).parent.mkdir(parents=True,exist_ok=True)
        depth=dict(schema_id=('pm.assurance.event_authority.definition_confirmation_depth.v1' if confirmation else 'pm.assurance.event_authority.registered_revision_depth.v1'),
            assessment_kind=('selected_definition_twelve_criteria' if confirmation else 'registered_family_twelve_criteria'),
            native_execution='NOT_RUN',registry_before=before,registry_after=after,decision_ref='Plans/Decision_Log.md#'+dl,
            manifest=dict(path=a.manifest,sha256=a.sha256),before_row=old,registry_row=row,
            rows=[dict(event_type=event,family_id=row['family_id'],family_revision=row['family_revision'],cells={f:cells[f] for f in w.EVIDENCE_FIELDS})])
        if confirmation:
            depth.update(selector_map=item['selector_map'],owner_clauses=clauses,row_bytes_changed=False)
        dump(depth_path,depth)
        text=(f"Under Jared's EA-P3 A standing rule and {item['authority']}, Event Authority updates the existing `{event}` row "
              f"at #/families/{index}. {item['reason']} Registry revision {before['revision']} (SHA-256 {before['sha256']}) becomes "
              f"{after['revision']} (SHA-256 {after['sha256']}); the count remains {after['family_count']}. "
              f"The successor row's canonical SHA-256 is {ctx['row_sha256']}. "
              f"The 12/12 assessment {depth_path} (SHA-256 {w.sha256_file(ROOT/depth_path)}) carries the reviewed PASS cells and "
              'records the exact selector predicates completing pending schema/scope cells. Source grade verdicts are unchanged. '
              'DL-078 checkpoint pins and the legacy golden revision move in this commit. '
              'Historical resource bytes and dormant application editions remain as specified by the pinned row. '
              'Native execution stays NOT_RUN; no source installation, producer adoption or governance seal is granted.')
        if confirmation:
            text=(f"Under Jared's EA-P3 A and {item['authority']}, Event Authority confirms the now-complete selected definition for `{event}`. "
                  f"{item['reason']} The exact registered row at #/families/{index} remains byte-identical with canonical SHA-256 {ctx['row_sha256']}; "
                  f"family revision stays {row['family_revision']}. Its pinned selector map is {item['selector_map']['path']} "
                  f"(SHA-256 {item['selector_map']['sha256']}); all owner clauses are re-read within their declared units. "
                  f"The source grade {grade_source['path']} (SHA-256 {grade_source['sha256']}) already has twelve PASS cells. "
                  f"The fresh assessment {depth_path} (SHA-256 {w.sha256_file(ROOT/depth_path)}) re-reads membership and carries the other eleven PASS cells. "
                  f"Registry checkpoint {before['revision']} ({before['sha256']}) becomes {after['revision']} ({after['sha256']}) with {after['family_count']} families. "
                  'DL-078 pins and the legacy golden revision move in the same commit. Native execution stays NOT_RUN; source installation and producer adoption retain their own requirements.')
        metadata=dict(plan_unit_id=dl,unit_type='decision',status='accepted',owner_doc=w.DECISION_LOG,
            canonical_text=text,gui_related=False,gui_classification_reason='Existing event contract selector and checkpoint only.',
            depends_on=['DL-078','DL-400'],unblocks=[],acceptance_criteria=['The registered row equals the pinned successor and all twelve assessment cells PASS.'],
            validation_surfaces=['python3 scripts/pm-implementation-readiness.py validate'],risk_class='event_authority_revision',reasoning_tier='high',
            context_scope='event_authority_pnc019_s5b',implementation_surfaces=[w.REGISTRY,w.CURRENTNESS],
            node_compile_hint=dict(mode='owner_contract_only',create_worknodes=False,create_nodeseeds=False),
            source_lineage=[a.manifest+'; SHA-256 '+a.sha256,grade_source['path']+'; SHA-256 '+grade_source['sha256']],
            preserved_exact_tokens=[event,row['family_id'],row['family_revision'],after['revision'],ctx['row_sha256']],
            negative_constraints=['No native execution or producer adoption is claimed.'])
        if confirmation:
            metadata.update(risk_class='event_authority_definition_confirmation',
                acceptance_criteria=['The existing selected row stays exact and the completed definition has twelve reviewed PASS cells.'])
            metadata['source_lineage'].append(item['selector_map']['path']+'; SHA-256 '+item['selector_map']['sha256'])
        import yaml
        verb='confirms selected definition for' if confirmation else 'revises'
        entry=f"### {dl}: Event Authority {verb} {event} (S5b)\n\n```yaml\n"+yaml.safe_dump(metadata,sort_keys=False,allow_unicode=True,width=110)+'```\n\n'
        log=w.read_raw(w.DECISION_LOG)
        require(not re.search(r'(?m)^plan_unit_id: '+dl+r'$',log),dl+' is already used')
        require(log.endswith('\n\n'),'Decision Log lacks pinned append boundary')
        w.write_text(w.DECISION_LOG,log+entry)
        checkpoint(before,after,event,dl,confirmation)
        if a.commit:
            w.git('add','--',w.REGISTRY,w.DECISION_LOG,w.CURRENTNESS,w.LEGACY_GOLDEN,depth_path,'scripts/pm-implementation-readiness.py')
            label=f'confirms selected {event} definition' if confirmation else f'selects prepared {event} contract'
            w.git('commit','-q','-m',f'plans: {dl} {label} (S5b)')
        print(json.dumps(dict(event_type=event,dl=dl,registry=after,commit=w.git('rev-parse','HEAD').strip())),flush=True)
    return 0

if __name__=='__main__':sys.exit(main())
