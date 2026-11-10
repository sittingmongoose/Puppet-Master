#!/usr/bin/env python3
"""DS cycle-3 isolated regression controls; synthetic, never native/seal proof."""
from __future__ import annotations
import argparse
import copy
import inspect
import json
from contextlib import contextmanager, ExitStack
from pathlib import Path
from unittest.mock import patch
from jsonschema import Draft202012Validator
import pm_event_authority_ds_round2 as ds
import pm_event_payload_route as route
import pm_home_layout_v2_slot_receipt as home
import pm_browser_workspace_created as created
import pm_browser_workspace_created_v2 as v2
import pm_browser_workspace_reset as reset

ROOT=ds.ROOT



def bases():
    gate,context=created.candidate_gate(ROOT)
    fixture=ds.load(created.FIXTURE_PATH)['creation_fixture']
    case=next(c for c in gate.load_json('Plans/browser_event_admission_fixtures.json')['valid'] if c['case_id']==fixture['event_case_id'])
    return gate,context,[(created,{'event':gate.fixture_event(case,1),**{k:copy.deepcopy(fixture[k]) for k in ('request','result','witness')}}),(reset,reset.fixture_values()[0])]


def normalized(base):
    gate,context=created.candidate_gate(ROOT);event=base['event'];owner=gate.envelope_oracle()
    legacy={'ts':event['occurred_at_utc'],'seq':event['sequence_id'],'type':event['event_type'],'payload':copy.deepcopy(event['payload'])}
    original={'legacy_envelope':legacy,'source':{'header_sequence_id':legacy['seq'],
        'identity_headers':{k:event[k] for k in ('project_id','thread_id','run_id','node_id','attempt_id','actor_ref','correlation_id')},
        'bytes_hex':home.canonical_json(legacy).hex(),'segment_generation':1,'segment_name':'segment-00000000000000000001.seg','byte_offset':0}}
    value,reason,_=owner.normalized_legacy_case(original,ds.load('Plans/event_family_registry.json'),
        payload_validator=lambda p,s,**kw:list(context[-1][event['event_type']].evolve(schema=s).iter_errors(p)))
    assert reason is None,reason
    return value,original


def history(model,event,original=None,**changes):
    body,_=route.resolved_body(event,historical=True)
    subject={k:body['context'][k] for k in model.SUBJECT}
    flags=dict(source_verified=True,access_allowed=True,deletion_allows_audit=True,checkpoint_read_token_valid=True,historical_source=original)
    if model is reset:flags['admitted']=True
    flags.update(changes)
    return model.workspace_history_fact(event,subject,**flags)['outcome'].startswith('historical_')


def append(model,base,oracle=None):
    gate,_=created.candidate_gate(ROOT)
    if oracle is None:
        digest=gate.envelope_oracle().event_producer_semantic_digest
        if model is created:oracle=model.CreationOracle(digest)
        else:
            t=base['transition'];oracle=model.ResetOracle(t['subject'],t['checked_workspace_revision'],t['prior_workspace_generation'],digest)
    fn=oracle.create if model is created else oracle.reset
    return oracle,fn(**copy.deepcopy(base),append_outcome='committed',admitted=True)


def layout_base():
    slot=copy.deepcopy(next(v['value'] for v in ds.load(home.FIXTURES)['valid'] if v['id']=='home4_readback_verified_slot'))
    event=copy.deepcopy(slot['event_semantics']);event.update(schema_version='3.0.0',sequence_id=52,observed_at_utc=event['occurred_at_utc'],persisted_at_utc=event['occurred_at_utc'])
    return slot,event


def invalid_external_numeric(event):
    """Construct invalid retained bytes directly; the current encoder refuses them."""
    event=copy.deepcopy(event);data=home.canonical_msgpack(event['payload']);ident=home.blake3_hex(data)
    event.update(schema_version='3.0.0',payload=None,payload_ref={'blake3_id':ident,'byte_size':len(data),'media_type':route.MEDIA})
    return event,{ident:(route.MEDIA,data)}


def build():
    suite=ds.Suite();gate,context,values=bases()
    comp=ds.load('Plans/context_compaction_completion_contract_fixtures.json')['valid_event']
    slot,event=layout_base();checker=home.Checker(ROOT);store=home.PayloadStore.from_fixture(ds.load(home.FIXTURES)['payload_store'])
    # Each alternative is parsed independently. -0 integer is canonical zero; 01 is invalid JSON.
    for token,valid in [('1',True),('1.0',False),('1e0',False),('01',False),('0',True),('-0',True),('-0.0',False)]:
        def control(t=token,v=valid):
            try:value=json.loads(t)
            except json.JSONDecodeError:return not v
            return route.StrictValidator({'type':'integer'}).is_valid(value)==v
        suite.positive('numeric_lexeme:'+token,control)
    for field in ('operation_generation','input_bytes'):
        for token in (str(comp['payload'][field])+'.0',str(comp['payload'][field])+'e0'):
            bad=copy.deepcopy(comp);bad['payload'][field]=json.loads(token)
            suite.negative('compaction:'+field+':'+token,'integral_numeric_type',lambda b=bad:not ds.compaction_event_errors(b))
    for token in ('1.0','1e0','-0.0'):
        bad=copy.deepcopy(slot);bad['slot_generation']=json.loads(token)
        # Negative zero uses a valid integer-zero baseline for this schema's zero-minimum generation.
        suite.negative('home4:slot_generation:'+token,'integral_numeric_type',lambda b=bad:not checker.schema_errors('transaction_slot',b) and not checker.semantic('transaction_slot',b,store))
    for model,base in values:
        family=model.EVENT_TYPE;check=model.creation_preflight_failures if model is created else model.reset_preflight_failures
        large=copy.deepcopy(base);large['event']['payload']=ds.padded(base['event']['payload'],16385,'artifact_refs')
        for position in ('inline_generation','external_generation','producer_sequence_id','sequence_id'):
            number=base['event']['payload']['facts']['workspace_generation'] if position.endswith('generation') else base['event'][position]
            for suffix in ('.0','e0'):
                bad=copy.deepcopy(large if position=='external_generation' else base)
                if position.endswith('generation'):bad['event']['payload']['facts']['workspace_generation']=json.loads(str(number)+suffix)
                else:bad['event'][position]=json.loads(str(number)+suffix)
                if position=='external_generation':
                    bad['event'],bad['payload_store']=invalid_external_numeric(bad['event'])
                suite.negative(family+':'+position+suffix,'integral_numeric_type',lambda b=bad,f=check:not f(**b))
                def fresh_and_retry(b=bad,model=model,base=base,large=large):
                    _,outcome=append(model,b)
                    original=copy.deepcopy(base)
                    if 'payload_store' in b:
                        objects={};original['event']=route.encode(large['event'],objects);original['payload_store']=objects
                    oracle,_=append(model,original)
                    _,retry=append(model,b,oracle)
                    return outcome.startswith('rejected') and retry.startswith('rejected')
                # Runtime rejection is checked too, outside the typed-boundary ablation seam.
                suite.positive(family+':fresh_retry_refuses:'+position+suffix,fresh_and_retry)
        negative_zero=copy.deepcopy(base);negative_zero['event']['producer_sequence_id']=-0.0
        suite.negative(family+':producer_sequence_negative_zero','integral_numeric_type',lambda b=negative_zero,f=check:not f(**b))
        nullable=copy.deepcopy(base);nullable['event']['producer_sequence_id']=None
        suite.negative(family+':writer_null_producer_sequence','current_writer_producer_sequence',lambda b=nullable,f=check:not f(**b))
        # This prior external representation was valid under the original retained
        # schema. Read its exact bytes/digest; current writes still refuse it.
        retained_numeric=copy.deepcopy(large['event'])
        retained_numeric['payload']['facts']['workspace_generation']=float(retained_numeric['payload']['facts']['workspace_generation'])
        retained_numeric,retained_objects=invalid_external_numeric(retained_numeric)
        subject={k:base['event']['payload']['context'][k] for k in model.SUBJECT}
        def old_numeric_read(m=model,e=retained_numeric,o=retained_objects,subject=subject):
            flags=dict(source_verified=True,access_allowed=True,deletion_allows_audit=True,checkpoint_read_token_valid=True,payload_store=o)
            if m is reset:flags['admitted']=True
            return m.workspace_history_fact(e,subject,**flags)['outcome'].startswith('historical_')
        suite.positive(family+':retained_numeric_bytes_unchanged',old_numeric_read)
        suite.positive(family+':retained_numeric_projector',lambda e=retained_numeric,o=retained_objects:gate.ReplayOracle().consume(e,'BrowserRuntimeService.workspace',context,payload_store=o)=='projected_no_effect')
        retained,original=normalized(base)
        suite.positive(family+':normalized_legacy_history',lambda m=model,e=retained,o=original:history(m,e,o))
        suite.positive(family+':normalized_legacy_projector',lambda e=retained,o=original:gate.ReplayOracle().consume(e,'BrowserRuntimeService.workspace',context,historical_source=o)=='projected_no_effect')
        suite.positive(family+':normalized_legacy_not_current_writer',lambda e=retained,b=base,f=check:bool(f(**{**b,'event':e})))
        for flag in ('source_verified','access_allowed','deletion_allows_audit','checkpoint_read_token_valid')+(('admitted',) if model is reset else ()):
            name=family+':history_'+flag
            suite.negative(name,'history_flags:'+family,lambda f=flag,m=model,e=retained,o=original:history(m,e,o,**{f:False}))
        actualgate=gate if model is created else reset.sibling('pm-browser-event-admission',ROOT)
        compatibility_targets=[(actualgate,'compatibility_history_failures','reason is not None')]
        # Joined source edits leave the valid retained payload/schema alone.
        for field,value in [('event_id','legacy-event-v1:'+'a'*64),('idempotency_key','legacy-envelope-v1:'+'a'*64),('project_id','foreign-project'),('migration',dict(retained['migration'],migration_id='unsupported@9'))]:
            bad=copy.deepcopy(retained);bad[field]=value
            if field=='project_id':
                # Keep the envelope/payload join coherent, but leave the authenticated original foreign.
                bad['payload']['context']['project_id']=value
            suite.negative(family+':legacy_forged_'+field,'compatibility_source:'+family,
                lambda e=bad,g=actualgate,o=original:not g.candidate_failures(e,'BrowserRuntimeService.workspace',g.contract_context(),historical=True,historical_source=o))
        numeric_forgery=copy.deepcopy(retained)
        numeric_forgery['payload']['facts']['workspace_generation']=float(numeric_forgery['payload']['facts']['workspace_generation'])
        suite.negative(family+':legacy_forged_numeric_type','compatibility_source:'+family,
            lambda e=numeric_forgery,g=actualgate,o=original:not g.candidate_failures(e,'BrowserRuntimeService.workspace',g.contract_context(),historical=True,historical_source=o))
        missing=copy.deepcopy(retained)
        suite.negative(family+':legacy_missing_source','compatibility_missing:'+family,
            lambda g=actualgate:not g.compatibility_source_presence_errors(None))
        suite.positive(family+':legacy_missing_source_refuses_reader',lambda e=missing,m=model:not history(m,e))
    # Well-formed receipt identity: no LF/schema defect masks the recipe.
    bad=copy.deepcopy(comp);bad['payload']['compaction_receipt_ref']='compaction_receipt:'+'a'*64
    suite.negative('compaction:well_formed_false_receipt','compaction_receipt_identity',lambda b=bad:not ds.compaction_event_errors(b))
    for field,value,condition in [('operation_digest','a'*64,"binding['operation_digest']"),('event_id','evt_workspace_layout_'+'a'*64,"ev['event_id']")]:
        bad=copy.deepcopy(slot)
        if field=='operation_digest':bad['binding'][field]=value
        else:bad['event_semantics'][field]=value
        group='home4:operation_digest' if field=='operation_digest' else 'layout_home4_identity'
        suite.negative('home4:well_formed_false_'+field,group,lambda b=bad:not checker.schema_errors('transaction_slot',b) and not checker.semantic('transaction_slot',b,store))
    for field,value,targets in [
        ('event_type','terminal.workgroup_moved',[(ds,'layout_event_errors',"event['event_type']")]),
        ('payload_schema_id','pm.event.foreign.v1',[(ds,'layout_event_errors',"event['payload_schema_id']")]),
        ('project_id','foreign-project',[(home,'event_checks',"ev['project_id']")]),
        ('event_id','evt_workspace_layout_'+'a'*64,[(home,'event_checks',"ev['event_id']")]),
        ('idempotency_key','workspace.layout_changed:'+'a'*64,[(home,'event_checks',"ev['event_id']")])]:
        bad=copy.deepcopy(event);bad[field]=value
        group='layout_home4_identity' if field in ('event_id','idempotency_key') else 'layout_join:'+field
        suite.negative('layout:omitted_join_'+field,group,lambda e=bad:not ds.layout_event_errors(e,binding=slot['binding']))
    custody={k:True for k in ('source_verified','access_allowed','deletion_allows_audit','checkpoint_read_token_valid')}
    observation=ds.layout_history_observation(event)
    custody=observation['custody']
    suite.positive('layout:retained_custody',lambda e=event:not ds.layout_event_errors(e,binding=slot['binding'],historical=True,**observation))
    for flag in ('source_verified','access_allowed','deletion_allows_audit','checkpoint_read_token_valid'):
        suite.negative('layout:history_'+flag,'layout_history_custody',lambda f=flag,e=event:not ds.layout_event_errors(e,binding=slot['binding'],historical=True,historical_source=observation['historical_source'],custody={**custody,f:False}))
    suite.negative('layout:history_forged_source_commitment','layout_history_source_commitment',
        lambda e=event:not ds.layout_event_errors(e,binding=slot['binding'],historical=True,
            historical_source=observation['historical_source'],custody={**custody,'retained_source_sha256':'f'*64}))
    for token in ('1.0','1e0','-0.0'):
        event=copy.deepcopy(values[0][1]['event']);event['producer_sequence_id']=json.loads(token)
        def encoder_refuses(e=event):
            try:route.encode(e,{})
            except ValueError:return True
            return False
        suite.positive('encoder_refuses:'+token,encoder_refuses)
        suite.negative('encoder_numeric_boundary:'+token,'encoder_numeric_representation',lambda e=event:not route.numeric_representation_errors(e))
    return suite


def type_sweep():
    """Wrong types are checked through complete family entry points, never coerced."""
    results=[];gate,context,values=bases();slot,event=layout_base();checker=home.Checker(ROOT);store=home.PayloadStore.from_fixture(ds.load(home.FIXTURES)['payload_store'])
    wrong=['false','0',None,[],{}, {'nested':False}]
    for model,base in values:
        check=model.creation_preflight_failures if model is created else model.reset_preflight_failures
        for value in wrong:
            for location in ('body','generation','admitted','witness','history_source','history_access','history_deletion','history_token'):
                bad=copy.deepcopy(base)
                if location=='body':bad['event']['payload']=value
                elif location=='generation':bad['event']['payload']['facts']['workspace_generation']=value
                elif location=='witness':
                    key='producer_authenticated';bad['witness'][key]=value
                if location.startswith('history_'):
                    flag={'history_source':'source_verified','history_access':'access_allowed','history_deletion':'deletion_allows_audit','history_token':'checkpoint_read_token_valid'}[location]
                    refused=not history(model,bad['event'],**{flag:value})
                elif location=='admitted':
                    digest=gate.envelope_oracle().event_producer_semantic_digest
                    if model is created:o=model.CreationOracle(digest);fn=o.create
                    else:
                        t=bad['transition'];o=model.ResetOracle(t['subject'],t['checked_workspace_revision'],t['prior_workspace_generation'],digest);fn=o.reset
                    refused=fn(**bad,append_outcome='committed',admitted=value).startswith('rejected')
                else:refused=bool(check(**bad))
                results.append({'family':model.EVENT_TYPE,'location':location,'value':value,'refused':refused})
    comp=ds.load('Plans/context_compaction_completion_contract_fixtures.json')['valid_event']
    terminal=ds.load('Plans/event_payloads/terminal_workgroup_moved.schema.json')
    # The withdrawn family has only a retained schema contract. No runtime is invented.
    def boolean_nodes(node):
        if isinstance(node,dict):
            if node.get('type')=='boolean':yield node
            for v in node.values():yield from boolean_nodes(v)
        elif isinstance(node,list):
            for v in node:yield from boolean_nodes(v)
    bools=list(boolean_nodes(terminal));assert bools,'terminal Boolean fields not found'
    for value in wrong:
        c=copy.deepcopy(comp);c['payload']['operation_generation']=value
        results.append({'family':'context.compaction.completed','location':'generation','value':value,'refused':bool(ds.compaction_event_errors(c))})
        c=copy.deepcopy(comp);c['payload']=value
        results.append({'family':'context.compaction.completed','location':'body','value':value,'refused':bool(ds.compaction_event_errors(c))})
        s=copy.deepcopy(slot);s['slot_generation']=value
        results.append({'family':'workspace.layout_changed','location':'slot_generation','value':value,'refused':bool(checker.schema_errors('transaction_slot',s))})
        e=copy.deepcopy(event);e['payload']=value
        results.append({'family':'workspace.layout_changed','location':'body','value':value,'refused':bool(ds.layout_event_errors(e,binding=slot['binding']))})
        custody={k:True for k in ('source_verified','access_allowed','deletion_allows_audit','checkpoint_read_token_valid')}
        for flag in custody:
            results.append({'family':'workspace.layout_changed','location':flag,'value':value,'refused':bool(ds.layout_event_errors(event,binding=slot['binding'],historical=True,historical_source=ds.layout_history_observation(event)['historical_source'],custody={**ds.layout_history_observation(event)['custody'],flag:value}))})
        results.append({'family':'context.compaction.completed','location':'verified','value':value,'refused':ds.compaction_history(comp,verified=value,withdrawn=False,deleted=False,live_revision=999)=='unavailable'})
        results.append({'family':'terminal.workgroup_moved','location':'retained_schema_boolean','value':value,'refused':all(not route.StrictValidator(s).is_valid(value) for s in bools)})
    return {'status':'pass' if all(r['refused'] for r in results) else 'fail','cases':results,'terminal_runtime':'NOT_RUN; DL-449 compatibility only; complete guard isolation remains part 2'}


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);args=parser.parse_args()
    result=build().run();result['type_sweep']=type_sweep();result['status']='pass' if result['status']=='pass' and result['type_sweep']['status']=='pass' else 'fail'
    args.output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k not in ('guard_removal_table','positive_results','negative_acceptances','type_sweep')},indent=2));return result['status']!='pass'
if __name__=='__main__':raise SystemExit(main())
