#!/usr/bin/env python3
"""DS cycle-2 static boundary and guard-removal oracles. Never native/seal proof."""
from __future__ import annotations
import argparse
import ast
import base64
import copy
import hashlib
import importlib.util
import inspect
import json
import re
import textwrap
import types
from functools import update_wrapper
import subprocess
import sys
from contextlib import contextmanager, ExitStack, nullcontext
from pathlib import Path
from unittest.mock import patch
from jsonschema import Draft202012Validator
from pm_contract_formats import STORAGE_UTC_Z, FormatChecker
from jsonschema._keywords import pattern as python_pattern
import pm_event_payload_route as route
import pm_ds_retained as retained
import pm_home_layout_v2_slot_receipt as home
import pm_browser_workspace_created as created
import pm_browser_workspace_created_v2 as created_v2
import pm_browser_workspace_reset as reset
from pm_ds_tables import Facts, entry as _ds_entry

ROOT = Path(__file__).resolve().parents[1]

def load(path):
    return json.loads((ROOT / path).read_text())


def padded(body, target, field):
    """Keep valid identifier refs; solve the *encoded* map boundary, including str headers."""
    for width in range(200, 430):
        value = copy.deepcopy(body)
        value[field] = ['artifact:%02d:' % i + 'x' * width for i in range(48)]
        value[field].append('artifact:tail:')
        size = len(route.canonical_msgpack(value))
        for extra in range(max(0, target - size - 4), min(480, target - size + 4)):
            value[field][-1] = 'artifact:tail:' + 'x' * extra
            if len(route.canonical_msgpack(value)) == target:
                return value
    raise AssertionError('no exact encoded boundary')

@_ds_entry
def compaction_payload_errors(payload, *, payload_profile='typed-integer'):
    schema = load('Plans/event_payload_context_compaction_completed.schema.json')
    shape = Facts('comp_payload_schema', chain=True)
    # CV-1101: committed_at_utc (format date-time with the owner's terminal-Z pattern) takes the shared
    # date_time predicate under the strict storage_utc_z profile the owner pattern selects. A retained original
    # sealed under the original JSON Schema integer domain is read with it (SP-1101, scripts/pm_ds_retained.py).
    selected = route.validator(schema, profile=STORAGE_UTC_Z)
    if payload_profile == 'original-json-schema':
        selected = home.RetainedBodyValidator(schema, registry=selected._registry, format_checker=FormatChecker(profile=STORAGE_UTC_Z))
    if shape.stop('CP01_payload_schema', lambda: selected.is_valid(payload)):
        return [shape.first_code()]
    shape.done()
    facts = Facts('comp_payload')
    facts['CP03_revision_increases'] = payload['output_context_revision'] > payload['input_context_revision']
    facts['CP04_gain_equation'] = payload['input_tokens'] - payload['output_tokens'] == payload['reclaimed_tokens']
    return facts.codes()

@_ds_entry
def compaction_event_errors(event, *, historical=False):
    entry = Facts('comp_event_entry', chain=True)
    if entry.stop('CE01_historical_bool', lambda: type(historical) is bool):
        return [entry.first_code()]
    recipe = ('2.0.0', 'typed-integer', retained.NO_SOURCE)
    if historical:
        # SP-1101: the retained original's recipe comes from sealed custody (scripts/pm_ds_retained.py); the
        # third argument names the pre-SP-1101 selection, read only by the custody builder.
        recipe, refused = retained.retained_recipe(event, None, (
            '3.0.0' if isinstance(event, dict) and event.get('schema_version') == '3.0.0' else '2.0.0', 'typed-integer', retained.NO_SOURCE))
        if refused:
            return [refused]
    fixtures = load('Plans/context_compaction_completion_contract_fixtures.json')
    if entry.stop('CE02_envelope_schema', lambda: route.validator(load(retained.ENVELOPES[recipe[0]])).is_valid(event)):
        return [entry.first_code()]
    entry.done()
    errors = compaction_payload_errors(event['payload'], payload_profile=recipe[1])
    if errors:
        return errors
    payload = event['payload']
    identity = [payload['project_id'], payload['thread_id'], payload['operation_id']]
    sha = lambda x: hashlib.sha256(home.canonical_json(x)).hexdigest()  # shared RFC 8785 (qualified_jcs); strings only
    digest = sha([fixtures['storage_instance_id']] + identity)
    project_scope = event['scope_kind'] == 'project'
    present = Facts('comp_event_project_present')
    present['CE04_project_present'] = event['project_id'] is not None
    facts = Facts('comp_event')
    facts['CE03_project_scope_kind'] = project_scope
    facts['CE05_payload_project'] = not project_scope or event['project_id'] == payload['project_id']
    facts['CE06_payload_thread'] = not project_scope or event['thread_id'] == payload['thread_id']
    facts['CE07_event_type'] = event['event_type'] == 'context.compaction.completed'
    facts['CE08_payload_schema_id'] = event['payload_schema_id'] == payload['schema_id']
    facts['CE09_inline_only'] = event['payload_ref'] is None
    facts['CE10_replay_policy'] = historical or event['replay_policy'] == 'dedupe_by_idempotency_key'
    facts['CE11_commit_time_equality'] = event['occurred_at_utc'] == payload['committed_at_utc']
    facts['CE12_event_identity'] = event['event_id'] == 'evt_compaction_' + digest
    facts['CE13_idempotency_identity'] = event['idempotency_key'] == 'compaction:' + sha(identity)
    facts['CE14_receipt_identity'] = payload['compaction_receipt_ref'] == 'compaction_receipt:' + digest
    facts['CE15_producer_jcs'] = historical or home.producer_jcs_ok(event)
    codes = facts.codes()
    return [code for code in present.codes() if code not in codes] + codes

@_ds_entry
def compaction_history(event, *, verified, withdrawn, deleted, live_revision):
    # SP-259: historical audit fact neither reconstructs purged content nor rewinds a newer head.
    facts = Facts('comp_history', chain=True)
    for row, check in (('CH01_verified', lambda: verified is True),
                       ('CH02_not_withdrawn', lambda: withdrawn is False),
                       ('CH03_deleted_bool', lambda: type(deleted) is bool),
                       ('CH04_retained_event_valid', lambda: not compaction_event_errors(event, historical=True))):
        if facts.stop(row, check):
            return facts.first_code()
    facts.done()
    return 'content_free_deleted_thread_audit' if deleted else 'historical_audit_fact'

class Suite:
    """Positive and negative witnesses of the complete checkers.

    Guard isolation (check 11) is the shared Method B tool over the DS guard
    tables (scripts/pm-ds-guard-tables.py); this suite only asserts that every
    positive accepts and every negative refuses. A raised exception is never
    counted as a refusal.
    """
    def __init__(self):
        self.positives = []
        self.negatives = []

    def positive(self, name, accepted):
        self.positives.append((name, accepted))

    def negative(self, name, guard, accepted):
        self.negatives.append((name, guard, accepted))

    def run(self):
        failures = []
        positives = {}
        for name, fn in self.positives:
            try:
                positives[name] = bool(fn())
            except Exception as exc:
                positives[name] = False
                failures.append({'positive': name, 'exception': repr(exc)})
            if not positives[name]:
                failures.append({'positive': name, 'unexpected_rejection': True})
        baseline = {}
        for name, guard, fn in self.negatives:
            try:
                baseline[name] = bool(fn())
            except Exception as exc:
                baseline[name] = None
                failures.append({'negative': name, 'exception_is_not_rejection_proof': repr(exc)})
            if baseline[name] is not False:
                failures.append({'negative': name, 'unexpected_acceptance': baseline[name]})
        return {'schema_id': 'pm.event_authority.ds.round2.static.v1',
                'status': 'fail' if failures else 'pass', 'native_execution': 'NOT_RUN',
                'claim': 'Static contract oracles only; guard isolation is the shared tool over the DS guard tables (scripts/pm-ds-guard-tables.py).',
                'positive_count': len(positives), 'negative_count': len(baseline),
                'positive_results': positives, 'negative_acceptances': baseline,
                'guard_isolation': 'scripts/pm-ds-guard-tables.py',
                'failures': failures}


def build():
    suite = Suite()
    gate, context = created.candidate_gate(ROOT)
    # Actual helper condition weakened; the total JSON budget stays unchanged.
    cfixture = load(created.FIXTURE_PATH)['creation_fixture']
    cb = next(v for v in gate.load_json('Plans/browser_event_admission_fixtures.json')['valid'] if v['case_id']==cfixture['event_case_id'])
    bases = {'browser.workspace.created': {'event': gate.fixture_event(cb, 1), **{k:copy.deepcopy(cfixture[k]) for k in ('request','result','witness')}},
             'browser.workspace.reset': reset.fixture_values()[0]}
    for family, base in bases.items():
        model = created if family.endswith('created') else reset
        check = model.creation_preflight_failures if model is created else model.reset_preflight_failures
        suite.positive(family + ':valid_writer', lambda b=base, check=check: not check(**b))
        retained=copy.deepcopy(base);retained['event']['schema_version']='2.0.0'
        def project_retained(b=retained):
            oracle=gate.ReplayOracle()
            outcome=oracle.consume(b['event'],b['witness']['producer_component'],context)
            return outcome=='projected_no_effect' and oracle.executed_effects==0
        suite.positive(family+':generic_projector_retained_2_reader',project_retained)
        suite.negative(family+':retained_2_not_a_fresh_writer','governed_envelope_successor',lambda b=retained,check=check:not check(**b))
        malformed=copy.deepcopy(retained);malformed['event']['payload']['unadmitted_field']=True
        suite.negative(family+':generic_projector_unknown_payload_field','browser_compatibility_projector_validation',lambda b=malformed:gate.ReplayOracle().consume(b['event'],b['witness']['producer_component'],context)=='projected_no_effect')

        replay = copy.deepcopy(base); replay['event']['replay_policy']='projector_replay_only'
        suite.negative(family + ':replay_only', 'browser_writer_replay_policy', lambda b=replay, check=check: not check(**b))
        for n in load('Plans/event_authority_ds_round2_fixtures.json')['inline_boundaries']:
            value = copy.deepcopy(base)
            value['event']['payload'] = padded(base['event']['payload'], n, 'artifact_refs')
            assert len(route.canonical_msgpack(value['event']['payload'])) == n
            if n==16384:
                suite.positive(family + ':exact_inline_limit', lambda b=value, check=check: not check(**b))
            else:
                suite.negative(family + ':one_byte_over_inline', 'inline_encoded_byte_limit', lambda b=value, check=check: not check(**b))
                store={}; external=copy.deepcopy(value);external['event']=route.encode(value['event'],store);external['payload_store']=store
                suite.positive(family + ':resolved_reference', lambda b=external, check=check: not check(**b))
                missing=copy.deepcopy(external);missing['payload_store']={}
                suite.negative(family + ':missing_reference', 'reference_presence', lambda b=missing,check=check: not check(**b))
                key=external['event']['payload_ref']['blake3_id']
                for defect in ('hash','size','media','encoding'):
                    bad=copy.deepcopy(external)
                    if defect=='hash':
                        media,data=bad['payload_store'][key];at=data.index(b'xxxxxxxx');data=data[:at]+b'y'+data[at+1:];bad['payload_store'][key]=(media,data)
                    elif defect=='size': bad['event']['payload_ref']['byte_size']+=1
                    elif defect=='media': bad['payload_store'][key]=('text/plain',bad['payload_store'][key][1])
                    else:
                        data=bad['payload_store'][key][1];data=b'\xde'+len(value['event']['payload']).to_bytes(2,'big')+data[1:]
                        ident=route.blake3_hex(data);bad['event']['payload_ref'].update(blake3_id=ident,byte_size=len(data));bad['payload_store']={ident:(route.MEDIA,data)}
                    suite.negative(family+':reference_'+defect,'reference_'+defect,lambda b=bad, check=check:not check(**b))
                def committed_retry(b=external, model=model):
                    digest=gate.envelope_oracle().event_producer_semantic_digest
                    if model is created:
                        oracle=model.CreationOracle(digest);fn=oracle.create
                    else:
                        t=b['transition'];oracle=model.ResetOracle(t['subject'],t['checked_workspace_revision'],t['prior_workspace_generation'],digest);fn=oracle.reset
                    inputs={k:v for k,v in b.items() if k!='payload_store'}
                    first=fn(**inputs,append_outcome='committed',admitted=True,payload_store=b['payload_store'])
                    retry=copy.deepcopy(inputs);retry['event'].update(sequence_id=999,observed_at_utc='2026-11-04T00:00:00Z',persisted_at_utc='2026-11-04T00:00:01Z')
                    same=fn(**retry,append_outcome='committed',admitted=True,payload_store=b['payload_store'])
                    refused=copy.deepcopy(retry);refused['event']['replay_policy']='projector_replay_only'
                    replay=fn(**refused,append_outcome='committed',admitted=True,payload_store=b['payload_store'])
                    return 'published' in first and same.startswith('original_result') and replay.startswith('rejected') and oracle.append_count==1
                suite.positive(family+':reference_retry_storage_metadata_and_replay_refusal',committed_retry)
                def history_read(b=external,model=model,verified=True,token=True):
                    decoded,_=route.resolved_body(b['event'],b['payload_store'])
                    subject={k:decoded['context'][k] for k in model.SUBJECT}
                    flags={'source_verified':verified,'access_allowed':True,'deletion_allows_audit':True,'checkpoint_read_token_valid':token,'payload_store':b['payload_store']}
                    if model is reset:flags['admitted']=True
                    return model.workspace_history_fact(b['event'],subject,**flags)['outcome']
                suite.positive(family+':historical_reference_independent_of_live_state',lambda fn=history_read:fn().startswith('historical_'))
                suite.negative(family+':historical_unverified_source','browser_historical_authenticity:'+family,lambda fn=history_read:fn(verified=False).startswith('historical_'))
                suite.negative(family+':historical_withdrawn_checkpoint','browser_historical_authenticity:'+family,lambda fn=history_read:fn(token=False).startswith('historical_'))
                def retry_accepts_replay(b=external,model=model):
                    digest=gate.envelope_oracle().event_producer_semantic_digest
                    if model is created:oracle=model.CreationOracle(digest);fn=oracle.create
                    else:
                        t=b['transition'];oracle=model.ResetOracle(t['subject'],t['checked_workspace_revision'],t['prior_workspace_generation'],digest);fn=oracle.reset
                    inputs={k:v for k,v in b.items() if k!='payload_store'}
                    fn(**inputs,append_outcome='committed',admitted=True,payload_store=b['payload_store'])
                    inputs=copy.deepcopy(inputs);inputs['event']['replay_policy']='projector_replay_only'
                    return not fn(**inputs,append_outcome='committed',admitted=True,payload_store=b['payload_store']).startswith('rejected')
                suite.negative(family+':known_retry_replay_only','browser_writer_replay_policy',retry_accepts_replay)

        lf=copy.deepcopy(base);lf['event']['payload']['artifact_refs']=['artifact:review\n']
        suite.negative(family+':artifact_ref_LF','identifier_end_of_input',lambda b=lf,check=check:not check(**b))
        cp=created_v2.fixture_values()[0] if model is created else reset.fixture_values()[1]
        # created_v2.fixture_values returns a named mapping; materialize below in the caller if needed.
        if isinstance(cp,dict):
            cp=copy.deepcopy(cp);cp['publication_id']+='\n'
            cpcheck=created_v2.checkpoint_failures if model is created else reset.checkpoint_failures
            suite.negative(family+':publication_id_LF','identifier_end_of_input',lambda cp=cp,check=cpcheck:not check(cp))
        schemas=[load('Plans/browser_event_payloads.schema.json'),load('Plans/browser_workspace_created_checkpoint_v2.schema.json' if model is created else 'Plans/browser_workspace_reset_contracts.schema.json')]
        for i,schema in enumerate(schemas):
            broken=copy.deepcopy(schema);broken.setdefault('$defs',{})['ds_dormant_bad_ref']={'$ref':'#/not_a_schema'}
            def closure_accepts(s=broken):
                try:route.eager(route.schema_registry(),s)
                except ValueError:return False
                return True
            suite.negative(family+':dormant_ref_'+str(i),'eager_reference_closure',closure_accepts)
    comp=load('Plans/context_compaction_completion_contract_fixtures.json')
    suite.positive('compaction:valid_event',lambda:not compaction_event_errors(comp['valid_event']))
    invalid_date=copy.deepcopy(comp['valid_event']['payload']);invalid_date['committed_at_utc']='2026-02-30T16:00:00Z'
    suite.negative('compaction:invalid_calendar','compaction_calendar_validation',lambda:not compaction_payload_errors(invalid_date))
    leap_day=copy.deepcopy(comp['valid_event']['payload']);leap_day['committed_at_utc']='2028-02-29T16:00:00Z'
    suite.positive('compaction:valid_leap_day',lambda:not compaction_payload_errors(leap_day))
    for field in ('project_id','thread_id','operation_id','context_epoch_id'):
        bad=copy.deepcopy(comp['valid_event']['payload']);bad[field]+='\n'
        suite.negative('compaction:'+field+'_LF','identifier_end_of_input',lambda b=bad:not compaction_payload_errors(b))
    bad=copy.deepcopy(comp['valid_event']);bad['replay_policy']='projector_replay_only'
    suite.negative('compaction:replay_only','compaction_writer_replay_policy',lambda:not compaction_event_errors(bad))
    broken=load('Plans/event_payload_context_compaction_completed.schema.json');broken.setdefault('$defs',{})['ds_dormant_bad_ref']={'$ref':'#/not_a_schema'}
    def comp_closure():
        try:route.eager(route.schema_registry(),broken)
        except ValueError:return False
        return True
    suite.negative('compaction:dormant_ref','eager_reference_closure',comp_closure)
    suite.positive('compaction:historical_newer_live_head',lambda:compaction_history(comp['valid_event'],verified=True,withdrawn=False,deleted=False,live_revision=999)=='historical_audit_fact')
    suite.positive('compaction:deleted_thread_content_free',lambda:compaction_history(comp['valid_event'],verified=True,withdrawn=False,deleted=True,live_revision=999)=='content_free_deleted_thread_audit')
    suite.negative('compaction:forged_source','compaction_historical_authenticity',lambda:compaction_history(comp['valid_event'],verified=False,withdrawn=False,deleted=False,live_revision=999)!='unavailable')
    suite.negative('compaction:withdrawn_history','compaction_historical_authenticity',lambda:compaction_history(comp['valid_event'],verified=True,withdrawn=True,deleted=False,live_revision=999)!='unavailable')
    add_layout_cases(suite)
    return suite


@_ds_entry
def layout_event_errors(event, store=None, *, binding=None, historical=False, custody=None, historical_source=None):
    context = Facts('layout_context', chain=True)
    if context.stop('LE01_historical_bool', lambda: type(historical) is bool):
        return [context.first_code()]
    context.done()
    errors = []
    recipe = None
    if historical:
        errors=home.layout_history_context_errors(event,historical_source,custody)
        if errors:
            return errors
        recipe, refused = home.layout_retained_recipe(event, historical_source)
        if refused:
            return [refused]
    binding_schema=load(home.SCHEMA)
    binding_schema['$ref']='#/$defs/operation_binding'
    shape = Facts('layout_binding_schema', chain=True)
    if shape.stop('LE02_binding_schema', lambda: route.validator(binding_schema).is_valid(binding)):
        return [shape.first_code()]
    shape.done()
    d=home.binding_checks(errors,binding)
    envelope = Facts('layout_envelope', chain=True)
    if envelope.stop('LE03_event_object', lambda: isinstance(event, dict)):
        return errors+[envelope.first_code()]
    schema = load(retained.ENVELOPES[recipe[0]] if historical else 'Plans/event_record.schema.json' if event.get('schema_version')=='2.0.0' else 'Plans/event_record_v3.schema.json')
    if envelope.stop('LE04_envelope_schema', lambda: route.validator(schema).is_valid(event)):
        return errors+[envelope.first_code()]
    envelope.done()
    family = Facts('layout_family')
    family['LE05_event_type'] = event['event_type']=='workspace.layout_changed'
    family['LE06_payload_schema_id'] = event['payload_schema_id']=='https://puppetmaster.local/schemas/event_payloads/workspace_layout_changed/2.0.0'
    errors.extend(family.codes())
    body, physical = route.resolved_body(event,store,historical=historical)
    errors.extend(physical)
    if body is None:
        return errors
    payload_schema=load('Plans/event_payloads/workspace_layout_changed_v2.schema.json')
    selected=route.validator(payload_schema)
    if historical and recipe[1]=='original-json-schema':
        selected=home.RetainedBodyValidator(payload_schema,registry=selected._registry,format_checker=FormatChecker())
    payload = Facts('layout_payload', chain=True)
    if payload.stop('LE07_payload_schema', lambda: selected.is_valid(body)):
        return errors+[payload.first_code()]
    payload.done()
    home.event_checks(errors,event,binding,d,home.PayloadStore(store or {}),historical=historical,
                      historical_source=historical_source,custody=custody)
    replay = Facts('layout_replay')
    replay['LE08_replay_policy'] = historical or event['replay_policy'] == 'dedupe_by_idempotency_key'
    replay['LE09_producer_jcs'] = historical or home.producer_jcs_ok(event)
    errors.extend(replay.codes())
    return errors

def layout_history_observation(event, recipe='workspace-layout-v2/original-json-schema'):
    """Synthetic authenticated-source observation; never native custody proof."""
    source={'event_bytes':route.canonical_msgpack(event),'payload_validation_recipe':recipe}
    custody={k:True for k in ('source_verified','access_allowed','deletion_allows_audit','checkpoint_read_token_valid')}
    custody['retained_source_sha256']=home.sha(home.canonical_msgpack(source))
    return {'historical_source':source,'custody':custody}

def add_layout_cases(suite):
    fixtures=load('Plans/home_layout_v2_slot_receipt_fixtures.json')
    slot=copy.deepcopy(next(v['value'] for v in fixtures['valid'] if v['id']=='home4_readback_verified_slot'))
    binding=copy.deepcopy(slot['binding'])
    custody={k:True for k in ('source_verified','access_allowed','deletion_allows_audit','checkpoint_read_token_valid')}
    event=copy.deepcopy(slot['event_semantics'])
    event.update(schema_version='3.0.0',sequence_id=52,observed_at_utc=event['occurred_at_utc'],persisted_at_utc=event['occurred_at_utc'])
    suite.positive('layout:valid_inline_event',lambda:not layout_event_errors(event,binding=binding))
    for n in load('Plans/event_authority_ds_round2_fixtures.json')['inline_boundaries']:
        changed=copy.deepcopy(event);changed['payload']=padded(event['payload'],n,'affected_tab_ids')
        if n==16384:
            suite.positive('layout:exact_inline_limit',lambda e=changed:not layout_event_errors(e,binding=binding))
        else:
            suite.negative('layout:one_byte_over_inline','inline_encoded_byte_limit',lambda e=changed:not layout_event_errors(e,binding=binding))
            objects={};external=route.encode(changed,objects)
            suite.positive('layout:boundary_resolved_reference',lambda e=external,o=objects:not layout_event_errors(e,o,binding=binding))
            suite.negative('layout:boundary_missing_reference','reference_presence',lambda e=external:not layout_event_errors(e,{},binding=binding))
            suite.positive('layout:missing_reference_full_checker',lambda e=external:bool(layout_event_errors(e,{},binding=binding)))
            corrupt=copy.deepcopy(objects);ident=external['payload_ref']['blake3_id'];media,data=corrupt[ident];at=data.index(b'xxxxxxxx');corrupt[ident]=(media,data[:at]+b'y'+data[at+1:])
            suite.negative('layout:boundary_corrupt_reference','reference_hash',lambda e=external,o=corrupt:not layout_event_errors(e,o,binding=binding))
    # One panel move changes placement for all its tabs. Keep both captures and affected ids coherent.
    ids=list(slot['candidate_layout']['root']['tab_ids']);objects={}
    for key in ('prior_layout','candidate_layout'):
        layout=slot[key];template=next(v for v in layout['tabs'].values() if v['kind']=='editor')
        for i in range(load('Plans/event_authority_ds_round2_fixtures.json')['large_layout_tab_count']):
            tab=copy.deepcopy(template);tab['ref']['path']='src/large_event_%04d.rs'%i;tab.update(mode='kept',pinned=False)
            ident='file:'+tab['ref']['path'];layout['tabs'][ident]=tab;layout['root']['tab_ids'].append(ident)
            if key=='candidate_layout':ids.append(ident)
        data=home.source_json(layout);ident=route.blake3_hex(data);objects[ident]=('application/json',data)
        slot[key+'_sha256']=home.sha(data);slot[key+'_source_bytes']={'form':'payload_ref','blake3_id':ident,'byte_size':len(data),'media_type':'application/json'}
    slot['readback']['layout_sha256']=slot['candidate_layout_sha256']
    large=copy.deepcopy(event);large['payload']['affected_tab_ids']=ids
    assert len(route.canonical_msgpack(large['payload']))>16384
    large=route.encode(large,objects)
    slot['event_semantics']={k:v for k,v in large.items() if k not in ('sequence_id','observed_at_utc','persisted_at_utc')}
    data=home.stored_bytes('transaction_slot',slot);ident=route.blake3_hex(data);objects[ident]=(route.MEDIA,data)
    ref={'stored_form':'payload_ref','schema_id':slot['schema_id'],'schema_version':slot['schema_version'],'storage_instance_id':slot['storage_instance_id'],'logical_key':home.logical_key('transaction_slot',slot),'value_ref':{'blake3_id':ident,'byte_size':len(data),'media_type':route.MEDIA},'value_sha256':home.sha(data)}
    checker=home.Checker(ROOT);store=home.PayloadStore(objects)
    suite.positive('layout:1208_affected_ids_external_event',lambda:not layout_event_errors(large,objects,binding=binding) and set(route.resolved_body(large,objects)[0]['affected_tab_ids'])==set(slot['candidate_layout']['root']['tab_ids']) and len(ids)==1208)
    suite.positive('layout:1200_tab_complete_home4_value_reference',lambda:not checker.schema_errors('stored_value_ref',ref) and not checker.semantic('stored_value_ref',ref,store))
    retry=copy.deepcopy(large);retry.update(sequence_id=999,observed_at_utc='2026-11-04T00:00:00Z',persisted_at_utc='2026-11-04T00:00:01Z')
    gate,_=created.candidate_gate(ROOT);digest=gate.envelope_oracle().event_producer_semantic_digest
    suite.positive('layout:retry_preserves_original_pins',lambda:digest(large)==digest(retry) and large['payload_ref']==retry['payload_ref'] and not layout_event_errors(retry,objects,binding=binding))
    bad=copy.deepcopy(large);bad['replay_policy']='projector_replay_only'
    suite.negative('layout:writer_replay_only','layout_writer_replay_policy',lambda:not layout_event_errors(bad,objects,binding=binding))
    old=copy.deepcopy(event);old['schema_version']='2.0.0'
    suite.positive('layout:historical_exact_2_reader',lambda:not layout_event_errors(old,historical=True,binding=binding,**layout_history_observation(old)))
    suite.positive('layout:historical_reference_newer_live_layout',lambda:not layout_event_errors(large,objects,historical=True,binding=binding,**layout_history_observation(large)))
    suite.negative('layout:old_envelope_not_a_new_writer','governed_envelope_successor',lambda:not layout_event_errors(old,binding=binding))

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path);ap.add_argument('--self-test',action='store_true');ap.add_argument('--inject-invalid-positive',action='store_true');args=ap.parse_args()
    if args.self_test:
        proc=subprocess.run([sys.executable,'-B',__file__,'--inject-invalid-positive'],capture_output=True,text=True)
        control=Suite();control.negative('accepted_negative','claimed_guard',lambda:True)
        accepted_refused=control.run()['status']=='fail'
        result={'status':'pass' if proc.returncode==1 and accepted_refused else 'fail','injected_bad_positive_exit_code':proc.returncode,'accepted_negative_control_refused':accepted_refused}
        print(json.dumps(result));return int(result['status']!='pass')
    suite=build()
    if args.inject_invalid_positive:
        bad=copy.deepcopy(load('Plans/context_compaction_completion_contract_fixtures.json')['valid_event']['payload']);bad['project_id']+='\n'
        suite.positive('fault_control_invalid_positive',lambda:not compaction_payload_errors(bad))
    result=suite.run();data=json.dumps(result,indent=2)+'\n'
    if args.output:args.output.write_text(data)
    print(json.dumps({k:v for k,v in result.items() if k not in ('guard_removal_table','positive_results','negative_acceptances')},indent=2))
    return int(result['status']!='pass')

if __name__=='__main__':raise SystemExit(main())
