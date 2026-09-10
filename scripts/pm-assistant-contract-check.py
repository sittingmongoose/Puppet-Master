#!/usr/bin/env python3
"""Read-only scoped contract/command/wiring inspection; never native admission.

Run on the actual repaired checkout. Returns 1 for discovered gaps and 2 for
missing input/dependencies. JSON output separates inspected structure from
unperformed evidence/independent/native review. It does not repair a registry.
"""
from __future__ import annotations
import argparse,hashlib,importlib.util,json,re,sys
from pathlib import Path
if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0,str(Path(__file__).resolve().parent))
from pm_wiring_inventory import command_handler_bindings,wiring_command_excluded

def read(root,path):return json.loads((root/path).read_text())
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()

def payload_binding_error(candidate, registered, successor=None):
    """A retained candidate is lineage, never an alias for a later admission."""
    if registered is None:return None
    if successor is None:
        return None if registered.get('payload_schema_id')==candidate['payload_schema_id']else 'Registered payload differs and no row-local successor was supplied'
    if successor.get('event_type')!=candidate['event_type'] or successor.get('admission_status')!='admitted_static_contract':
        return 'Successor does not admit this exact event family'
    if registered.get('payload_schema_id')!=successor.get('payload_schema_ref',{}).get('schema_id'):
        return 'Current registry disagrees with the row-local successor payload'
    return None

def inspect_browser_admission(root):
    """Use the central executable oracle rather than a second admission test."""
    spec=importlib.util.spec_from_file_location('assistant_browser_admission',root/'scripts/pm-browser-event-admission.py')
    if spec is None or spec.loader is None:raise ValueError('cannot load Browser admission oracle')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    module.ROOT=root
    return module.validate()
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

def whole_wiring_inventory(root, catalogue, wiring, materialized_touch, excluded_tokens=()):
    """Account for every wired command without expanding packet Touch scope.

    Catalogue mentions include explicit retirement and alias prose. Their mere
    presence is deliberately not classified as primary command registration.
    Missing schema pointers are measured separately from named prose contracts.
    None of these observations supplies a per-case semantic or native verdict.
    """
    command_re = re.compile(r'\bcmd\.[a-z][a-z0-9_.]*[a-z0-9_]\b')
    references_re = re.compile(r'Plans/[A-Za-z0-9_./-]+\.(?:md|json)')
    mentions = {}
    for number, line in enumerate(catalogue.splitlines(), 1):
        for cid in set(command_re.findall(line)):
            table = line.lstrip().startswith('|')
            first = line.split('|', 2)[1] if table and '|' in line else ''
            kind = 'first_column_declaration_or_disposition' if cid in command_re.findall(first) else 'other_table_column' if table else 'prose_or_planunit'
            mentions.setdefault(cid, []).append({'line': number, 'kind': kind})
    grouped = {}
    for key, row in wiring.items():
        grouped.setdefault(row['ui_command_id'], []).append((key, row))
    touches = {}
    for row in materialized_touch:
        touches.setdefault(row['action_id'], []).append(row['touch_id'])
    commands = []
    errors = []
    checked_references = {}
    all_handlers = command_handler_bindings(wiring)
    for cid, bindings in sorted(grouped.items()):
        handlers = all_handlers[cid]
        if wiring_command_excluded(cid, excluded_tokens):
            errors.append({'code': 'whole_wiring_excluded_command_has_peer_row', 'subject': cid, 'detail': [key for key, _ in bindings]})
        if len(handlers) != 1 or not handlers[0]:
            errors.append({'code': 'whole_command_handler_conflict', 'subject': cid, 'detail': handlers})
        if cid not in mentions:
            errors.append({'code': 'whole_command_without_catalogue_mention', 'subject': cid, 'detail': 'No exact token; a mention alone would still not prove registration'})
        row_observations = []
        for key, row in bindings:
            missing = []
            invalid = []
            for field in ('request_schema_ref', 'result_schema_ref'):
                ref = row.get(field)
                if not ref:
                    missing.append(field)
                    continue
                try:
                    resolve(root, ref)
                except (ValueError, KeyError, IndexError) as exc:
                    invalid.append({'field': field, 'ref': ref, 'reason': str(exc)})
            owner_refs = sorted(set(references_re.findall(json.dumps(row))))
            missing_owners = []
            for ref in owner_refs:
                if ref not in checked_references:
                    try:
                        resolve(root, ref)
                        checked_references[ref] = True
                    except (ValueError, KeyError, IndexError):
                        checked_references[ref] = False
                if not checked_references[ref]:missing_owners.append(ref)
            for ref in missing_owners:
                errors.append({'code': 'whole_wiring_missing_owner_reference', 'subject': key, 'detail': ref})
            for failure in invalid:
                errors.append({'code': 'whole_wiring_invalid_contract_reference', 'subject': key, 'detail': failure})
            row_observations.append({'wiring_row_ref': 'Plans/Wiring_Matrix.production.json#/entries/' + key.replace('~', '~0').replace('/', '~1'),
                                     'missing_machine_contract_fields': missing, 'invalid_contract_refs': invalid,
                                     'owner_document_refs': owner_refs, 'missing_owner_document_refs': missing_owners})
        commands.append({'command_id': cid, 'sole_declared_handlers': handlers,
                         'catalogue_occurrences': mentions.get(cid, []),
                         'packet_touch_ids': touches.get(cid, []), 'wiring_rows': row_observations,
                         'semantic_review_status': 'not_run', 'native_runtime_proven': False})
    return {'scope': 'all production-intent wiring commands; independent of the packet Touch denominator',
            'command_count': len(commands), 'wiring_row_count': len(wiring),
            'commands_in_packet_touch': sum(bool(c['packet_touch_ids']) for c in commands),
            'commands_without_packet_touch': sum(not c['packet_touch_ids'] for c in commands),
            'rows_with_request_and_result_pointers': sum(not r['missing_machine_contract_fields'] for c in commands for r in c['wiring_rows']),
            'commands': commands, 'errors': errors,
            'reference_source_hashes': {ref: digest(root/ref) for ref, valid in checked_references.items() if valid},
            'claim_boundary': 'Exhaustive structural accounting only; no primary-registration inference from a token, automatic Touch admission, semantic audit verdict, or native proof.'}

def check(root):
    from jsonschema import Draft202012Validator
    from referencing import Registry,Resource
    inputs=['Plans/Back_Seat_Driver.md','Plans/assistant-chat-design.md','Plans/settings_inventory.json','Plans/section15_browser_program_contracts.schema.json','Plans/browser_event_payloads.schema.json','Plans/browser_event_admission_candidates.json','Plans/browser_event_admission_candidates.schema.json','scripts/pm-integration-packet-audit.spec.json','Plans/Section15_MVP_Promoted_Features_Spec.md','Plans/UI_Command_Catalog.md','Plans/Wiring_Matrix.production.json','Plans/Wiring_Matrix.schema.json','Plans/touch_closure.json','Plans/event_family_registry.json']
    inputs.extend(['Plans/Wiring_Matrix.production.exclusions.json','scripts/pm-assistant-contract-check.py','scripts/pm_wiring_inventory.py','Plans/DRY_Rules.md','Plans/Commands_System.md','Plans/UI_Wiring_Rules.md','Plans/Wiring_Matrix.md'])
    missing=[p for p in inputs if not(root/p).is_file()]
    if missing:raise ValueError('required live inputs missing: '+', '.join(missing))
    candidate_path='Plans/browser_event_payload_candidates.schema.json'
    if not(root/candidate_path).is_file():candidate_path='Plans/browser_event_payloads.schema.json'
    if candidate_path not in inputs:inputs.append(candidate_path)
    errors=[];observations=[];source_hashes={p:digest(root/p)for p in inputs}
    def gap(code,subject,detail):errors.append(dict(code=code,subject=subject,detail=detail))
    owner=read(root,'Plans/section15_browser_program_contracts.schema.json');candidate=read(root,candidate_path);rows=read(root,'Plans/browser_event_admission_candidates.json')['rows']
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
    successors={};admission_observation=None
    if(root/'Plans/browser_event_admission.json').is_file():
        admission_rows=read(root,'Plans/browser_event_admission.json')['rows']
        successors={r['event_type']:r for r in admission_rows}
        if len(successors)!=len(admission_rows):gap('duplicate_successor_admission','Browser events','Duplicate row-local identities')
        for p in ('Plans/browser_event_admission.json','Plans/browser_event_admission.schema.json','Plans/browser_event_admission_fixtures.json','Plans/event_family_registry.schema.json','Plans/storage_value_registry.json','Plans/event_record.schema.json','scripts/pm-browser-event-admission.py','scripts/pm-implementation-readiness.py'):
            source_hashes[p]=digest(root/p)
        admission_observation=inspect_browser_admission(root)
        if admission_observation.get('status')!='pass':gap('successor_admission_not_valid','Browser events',admission_observation.get('failures'))
    planned=[];section=(root/'Plans/Section15_MVP_Promoted_Features_Spec.md').read_text()
    for row in rows:
        e=row['event_type'];definition=candidate['$defs'].get(e.replace('.','_'),{})
        if definition.get('$id')!=row['payload_schema_id']:gap('payload_id_mismatch',e,'Candidate id and definition differ')
        if f'`{e}`'not in section:gap('event_source_missing',e,'Exact event name absent from semantic owner')
        r=registered.get(e)
        if r is None:planned.append(e)
        else:
            mismatch=payload_binding_error(row,r,successors.get(e))
            if mismatch:gap('admitted_payload_disagrees',e,mismatch)
        observations.append(dict(event_type=e,candidate_schema_id=row['payload_schema_id'],candidate_payload_document=candidate_path,
                                 current_payload_schema_id=r.get('payload_schema_id')if r else None,
                                 candidate_is_runtime_alias=False,successor_admission_present=e in successors))
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
    whole_inventory=whole_wiring_inventory(root,catalogue,wiring,materialized,read(root,'Plans/Wiring_Matrix.production.exclusions.json')['excluded_tokens'])
    errors.extend(whole_inventory['errors'])
    source_hashes.update(whole_inventory['reference_source_hashes'])
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
    return dict(schema_id='pm.assistant_contract_inspection.v1',status='gaps_found'if errors or planned else 'structure_checked_only',source_hashes=source_hashes,commands=commands,whole_wiring_inventory=whole_inventory,review_dimensions=dimensions,errors=errors,browser_events_pending_registry_admission=planned,browser_candidate_dispositions=observations,browser_successor_admission_check=admission_observation,formal_packet_audit_completed=False,native_runtime_proven=False,independent_semantic_review_performed=False,claim_boundary='This checker inspects actual source structure and references. It does not replace per-case review, receipt resolution, native producer tests, or Event Authority admission.')

def main():
    p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[1]);a=p.parse_args()
    try:
        r=check(a.repo.resolve());print(json.dumps(r,indent=2));return 1 if r['status']=='gaps_found'else 0
    except (OSError,ValueError,KeyError,ImportError)as ex:print(json.dumps({'status':'blocked','error':str(ex),'formal_packet_audit_completed':False}));return 2
if __name__=='__main__':raise SystemExit(main())
