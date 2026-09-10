#!/usr/bin/env python3
"""Read-only scoped contract/command/wiring inspection; never native admission.

Run on the actual repaired checkout. Returns 1 for discovered gaps and 2 for
missing input/dependencies. JSON output separates inspected structure from
unperformed evidence/independent/native review. It does not repair a registry.
"""
from __future__ import annotations
import argparse,hashlib,json,re,sys
from pathlib import Path

def read(root,path):return json.loads((root/path).read_text())
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def resolve(root,ref):
    if not isinstance(ref,str) or not ref.startswith('Plans/'):raise ValueError('not a canonical Plans reference')
    path,_,frag=ref.partition('#');p=(root/path).resolve()
    if not p.is_relative_to(root.resolve()) or not p.is_file():raise ValueError(f'missing/case-incorrect reference: {ref}')
    # Detect case errors even on case-insensitive hosts.
    walk=root
    for part in Path(path).parts:
        if part not in {x.name for x in walk.iterdir()}:raise ValueError(f'case-incorrect reference: {ref}')
        walk=walk/part
    if frag.startswith('/'):
        obj=json.loads(p.read_text())
        for part in frag.split('/')[1:]:
            part=part.replace('~1','/').replace('~0','~');obj=obj[int(part)]if isinstance(obj,list)else obj[part]
        return obj
    if frag and not path.endswith('.json'):
        text=p.read_text()
        if re.fullmatch(r'[A-Z][A-Z0-9]*-\d+',frag):
            if not re.search(r'^plan_unit_id:\s*'+re.escape(frag)+r'\s*$',text,re.M):raise ValueError(f'unknown PlanUnit: {ref}')
        # Other heading/semantic anchors require the existing owner validator.
    return p

def objects(obj):
    if isinstance(obj,dict):
        yield obj
        for value in obj.values():yield from objects(value)
    elif isinstance(obj,list):
        for value in obj:yield from objects(value)

# These are review dimensions from the central packet-audit spec, not a second
# authority store. Their field mapping checks presence only, never semantics.
DIMENSION_FIELDS = {
 'requirement_and_packet_refs': ('requirement_refs',),
 'canonical_owner_and_plan_unit': ('owner_plan','plan_unit'),
 'single_dry_contract': ('dry_contract_ref',),
 'command_or_typed_ui_action': ('action_kind','action_id'),
 'payload_result_error_availability_permissions_disabled_reason': ('payload_schema_ref','result_schema_ref','error_schema_ref','availability_rule','permission_gate','disabled_reason_rule'),
 'single_handler_owner': ('handler_owner','handler_status'),
 'production_or_concept_wiring': ('wiring_status','production_or_simulation'),
 'gui_trigger_and_return_route': ('gui_triggers','return_route'),
 'reverse_consumer_coverage': ('reverse_consumers',),
 'events_receipts_observable_work': ('event_refs','receipt_refs','observable_work'),
 'persistence_and_migration': ('persistence_refs','migration_refs'),
 'tests_and_evidence': ('test_refs','evidence_refs'),
 'disposition_and_residual_risk': ('disposition','residual_risk'),
}
BSD_COMMANDS = ['cmd.bsd.'+x for x in ('set','configure','workflow.configure','assignment.pause','assignment.resume','assignment.retry','assignment.stop','finding.open','open_usage','open_transcript')]
LENS_COMMANDS = ['cmd.chat.context_lens.'+x for x in ('toggle','set_mode','turn_off','toggle_message_selection','clear_selection','apply_subcompact','revert_subcompact')]

def materialize_touch(touch):
    columns=['touch_id','profile_id','action_kind','action_id','disposition','residual_risk']
    if touch.get('row_columns')!=columns:
        raise ValueError('unsupported Touch Closure row encoding')
    profiles={}
    for profile in touch['profiles']:
        key=profile.get('profile_id')
        if not isinstance(key,str) or not key or key in profiles:
            raise ValueError('duplicate or invalid Touch Closure profile identity')
        profiles[key]=profile
    materialized=[];ids=set();actions=set()
    for raw in touch['rows']:
        if not isinstance(raw,list) or len(raw)!=len(columns):
            raise ValueError('malformed Touch Closure row')
        row=dict(zip(columns,raw))
        if any(not isinstance(row[k],str) or not row[k] for k in columns):
            raise ValueError('invalid Touch Closure row field')
        if row['profile_id']not in profiles:raise ValueError('unknown Touch Closure profile')
        if row['touch_id']in ids or row['action_id']in actions:
            raise ValueError('duplicate Touch Closure row or action identity')
        ids.add(row['touch_id']);actions.add(row['action_id'])
        materialized.append({**profiles[row['profile_id']],**row})
    return materialized

def dimension_observations(row,dimensions):
    if dimensions!=list(DIMENSION_FIELDS):
        raise ValueError('central audit dimension set/order changed; re-adjudicate field coverage')
    return [dict(dimension=d,missing_fields=[k for k in DIMENSION_FIELDS[d]if k not in row or row[k]is None],
                 semantic_review_status='not_run')for d in dimensions]

def check(root):
    from jsonschema import Draft202012Validator
    from referencing import Registry,Resource
    inputs=['Plans/Back_Seat_Driver.md','Plans/assistant-chat-design.md','Plans/settings_inventory.json','Plans/section15_browser_program_contracts.schema.json','Plans/browser_event_payloads.schema.json','Plans/browser_event_admission_candidates.json','Plans/browser_event_admission_candidates.schema.json','scripts/pm-integration-packet-audit.spec.json','Plans/Section15_MVP_Promoted_Features_Spec.md','Plans/UI_Command_Catalog.md','Plans/Wiring_Matrix.production.json','Plans/Wiring_Matrix.schema.json','Plans/touch_closure.json','Plans/event_family_registry.json']
    missing=[p for p in inputs if not(root/p).is_file()]
    if missing:raise ValueError('required live inputs missing: '+', '.join(missing))
    errors=[];observations=[];source_hashes={p:digest(root/p)for p in inputs}
    def gap(code,subject,detail):errors.append(dict(code=code,subject=subject,detail=detail))
    owner=read(root,'Plans/section15_browser_program_contracts.schema.json');candidate=read(root,'Plans/browser_event_payloads.schema.json');rows=read(root,'Plans/browser_event_admission_candidates.json')['rows']
    for path,doc in [('Browser owner',owner),('event candidates',candidate)]:
        try:Draft202012Validator.check_schema(doc)
        except Exception as ex:gap('invalid_schema',path,str(ex))
    reg=Registry().with_resources([(owner['$id'],Resource.from_contents(owner)),(candidate['$id'],Resource.from_contents(candidate))])
    # Resolve every external reference using the actual source, not test excerpts.
    for d in objects(candidate):
        ref=d.get('$ref')
        if ref:
            sid,_,ptr=ref.partition('#');doc=owner if sid==owner['$id']else candidate if sid in ('',candidate['$id'])else None
            if doc is None:gap('unknown_schema_owner',ref,'No permitted owner in this bounded contract set');continue
            try:
                for key in ptr.strip('/').split('/')if ptr else []:doc=doc[key.replace('~1','/').replace('~0','~')]
            except (KeyError,TypeError):gap('missing_schema_target',ref,'JSON Pointer is absent')
    inventory_schema=read(root,'Plans/browser_event_admission_candidates.schema.json');Draft202012Validator.check_schema(inventory_schema)
    for ex in Draft202012Validator(inventory_schema).iter_errors(read(root,'Plans/browser_event_admission_candidates.json')):gap('candidate_inventory_schema',str(list(ex.path)),ex.message)
    event_registry=read(root,'Plans/event_family_registry.json');registered={r['event_type']:r for r in event_registry['families']}
    if len(registered)!=len(event_registry['families']):gap('duplicate_event_family','registry','Duplicate event types cannot be hidden by a map')
    planned=[];section=(root/'Plans/Section15_MVP_Promoted_Features_Spec.md').read_text()
    for row in rows:
        e=row['event_type'];definition=candidate['$defs'].get(e.replace('.','_'),{})
        if definition.get('$id')!=row['payload_schema_id']:gap('payload_id_mismatch',e,'Candidate id and definition differ')
        if f'`{e}`'not in section:gap('event_source_missing',e,'Exact event name absent from semantic owner')
        r=registered.get(e)
        if r is None:planned.append(e)
        elif r.get('payload_schema_id')!=row['payload_schema_id']:gap('admitted_payload_disagrees',e,'Adjudicate against current registry; never overwrite a newer admission')
    expected={r['event_type']for r in rows}
    if len(expected)!=53 or len(rows)!=53:gap('candidate_set_drift','Browser events','Expected the exact reviewed 53-name candidate set')
    unknown_registered=sorted(e for e in registered if e.startswith('browser.')and e not in expected)
    if unknown_registered:gap('new_browser_registry_members','Browser events',unknown_registered)
    browser_ids=owner['$defs']['browser_command_id']['enum']
    bsd_text=(root/'Plans/Back_Seat_Driver.md').read_text();bsd_ids=sorted(set(re.findall(r'^\| `(cmd\.bsd\.[a-z_.]+)` \|',bsd_text,re.M)))
    catalogue=(root/'Plans/UI_Command_Catalog.md').read_text();wiring=read(root,'Plans/Wiring_Matrix.production.json')['entries'];touch=read(root,'Plans/touch_closure.json')
    for ex in Draft202012Validator(read(root,'Plans/Wiring_Matrix.schema.json')).iter_errors(read(root,'Plans/Wiring_Matrix.production.json')):
        # Full schema validation is structural, not a proof of any handler.
        gap('wiring_schema',str(list(ex.path)),ex.message)
    materialized=materialize_touch(touch)
    dimensions=read(root,'scripts/pm-integration-packet-audit.spec.json')['touch_closure_dimensions']
    if dimensions!=list(DIMENSION_FIELDS):raise ValueError('central audit dimension set/order changed')
    if set(bsd_ids)!=set(BSD_COMMANDS):gap('bsd_owner_command_set_drift','BSD',sorted(set(bsd_ids)^set(BSD_COMMANDS)))
    if len(browser_ids)!=15 or len(set(browser_ids))!=15 or 'cmd.browser.program.inspect'not in browser_ids:gap('browser_command_set_drift','Browser','Re-adjudicate the closed command inventory')
    selected=sorted(set(browser_ids)|set(BSD_COMMANDS)|set(LENS_COMMANDS));commands=[]
    for cid in selected:
        catalog_rows=[l for l in catalogue.splitlines()if re.match(r'^\|\s*`'+re.escape(cid)+r'`\s*\|',l)]
        bound=[r for r in wiring.values()if r.get('ui_command_id')==cid]
        handlers={r.get('handler_location')for r in bound}
        # Actual Touch Closure action rows carry action_id; profile mentions do not count.
        touches=[o for o in materialized if o.get('action_id')==cid]
        info=dict(command=cid,catalogue_rows=len(catalog_rows),wiring_rows=len(bound),sole_handlers=sorted(x for x in handlers if isinstance(x,str)),touch_rows=len(touches))
        if not catalog_rows:gap('missing_catalogue_row',cid,'A prose mention is not a command row')
        if not bound:gap('missing_production_intent_wiring',cid,'No row for the exact command')
        if len(handlers)!=1:gap('non_unique_handler',cid,info['sole_handlers'])
        if len(touches)!=1:gap('touch_disposition_required',cid,'Affected command needs an exact retained-inventory disposition; do not invent a row or silently mark it outside scope')
        for r in bound:
            for field in ('request_schema_ref','result_schema_ref'):
                if cid in browser_ids and not r.get(field):gap('missing_payload_ref',cid,field)
                if r.get(field):
                    try:resolve(root,r[field])
                    except (ValueError,KeyError,IndexError)as ex:gap('invalid_payload_ref',cid,str(ex))
            for e in r.get('expected_event_types',[]):
                if e not in registered:gap('event_not_admitted',cid,e)
            if cid=='cmd.browser.program.inspect':
                if r.get('handler_location')!='handlers::browser_program::inspect':gap('inspect_handler_drift',cid,r.get('handler_location'))
                if r.get('expected_event_types'):gap('inspect_event_invention',cid,'Inspection must not fabricate a persisted event')
        info['review_dimensions']=[]
        for t in touches:
            obs=dimension_observations(t,dimensions);info['review_dimensions'].extend(obs)
            for observation in obs:
                if observation['missing_fields']:gap('touch_profile_fields_missing',cid,observation)
            for field in ('owner_plan','dry_contract_ref','payload_schema_ref','result_schema_ref','error_schema_ref'):
                if t.get(field):
                    try:resolve(root,t[field])
                    except (ValueError,KeyError,IndexError)as ex:gap('touch_reference',cid,f'{field}: {ex}')
        commands.append(info)
    for definition,field in [('browser_command_error','error_code'),('browser_command_disabled_reason','reason_code')]:
        values=owner['$defs'][definition]['properties'][field]['enum']
        for reason in ('handler_unavailable','event_authority_unavailable'):
            if reason not in values:gap('missing_admission_reason',definition,reason)
    settings={x['id']:x for x in read(root,'Plans/settings_inventory.json')['settings']}
    if settings['safety.approvals.bsd-catch-up-seconds']['default']!='30 seconds':gap('catchup_default_drift','BSD','Adjudicate current owner default')
    if settings['safety.approvals.bsd-trigger-sensitivity'].get('options')!=['Conservative','Balanced','Frequent']:gap('sensitivity_mapping_drift','BSD','Expected reconciled display mapping')
    if 'Only `cmd.bsd.set` has an existing catalog row.'in bsd_text:gap('stale_registration_claim','BSD','Owner still denies existing catalogue rows')
    return dict(schema_id='pm.assistant_contract_inspection.v1',status='gaps_found'if errors or planned else 'structure_checked_only',source_hashes=source_hashes,commands=commands,review_dimensions=dimensions,errors=errors,browser_events_pending_registry_admission=planned,formal_packet_audit_completed=False,native_runtime_proven=False,independent_semantic_review_performed=False,claim_boundary='This checker inspects actual source structure and references. It does not replace per-case review, receipt resolution, native producer tests, or Event Authority admission.')

def main():
    p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[1]);a=p.parse_args()
    try:
        r=check(a.repo.resolve());print(json.dumps(r,indent=2));return 1 if r['status']=='gaps_found'else 0
    except (OSError,ValueError,KeyError,ImportError)as ex:print(json.dumps({'status':'blocked','error':str(ex),'formal_packet_audit_completed':False}));return 2
if __name__=='__main__':raise SystemExit(main())
