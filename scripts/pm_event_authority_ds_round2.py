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
from datetime import datetime
import subprocess
import sys
from contextlib import contextmanager, ExitStack, nullcontext
from pathlib import Path
from unittest.mock import patch
from jsonschema import Draft202012Validator
from pm_contract_formats import FormatChecker
from jsonschema._keywords import pattern as python_pattern
import pm_event_payload_route as route
import pm_home_layout_v2_slot_receipt as home
import pm_browser_workspace_created as created
import pm_browser_workspace_created_v2 as created_v2
import pm_browser_workspace_reset as reset

ROOT = Path(__file__).resolve().parents[1]

def load(path):
    return json.loads((ROOT / path).read_text())

def source_without_guard(fn, text):
    """Weaken actual production condition(s), in memory only; never filter returned errors."""
    original=inspect.unwrap(fn)
    tree = ast.parse(textwrap.dedent(inspect.getsource(original)))
    tree.body[0].decorator_list=[]
    matched = []
    class Weaken(ast.NodeTransformer):
        def visit_If(self, node):
            if text in ast.unparse(node.test):
                matched.append(node.lineno)
                node.test = ast.Constant(False)
            return self.generic_visit(node)
    changed = ast.fix_missing_locations(Weaken().visit(tree))
    if len(matched) != 1:
        raise ValueError(f'{fn.__qualname__}: expected one guard matching {text!r}, found {matched}')
    namespace = dict(original.__globals__)
    exec(compile(changed, inspect.getsourcefile(fn), 'exec'), namespace)
    compiled=namespace[fn.__name__]
    changed=types.FunctionType(compiled.__code__,original.__globals__,fn.__name__,compiled.__defaults__,compiled.__closure__)
    changed.__kwdefaults__=compiled.__kwdefaults__
    update_wrapper(changed,original)
    return contextmanager(changed) if fn is not original and inspect.isgeneratorfunction(original) else changed

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

def compaction_timestamp_valid(value):
    try:
        datetime.fromisoformat(value.replace('Z','+00:00'))
    except (ValueError,TypeError):
        return False
    return True

def compaction_payload_errors(payload):
    schema = load('Plans/event_payload_context_compaction_completed.schema.json')
    errors = []
    if not route.validator(schema).is_valid(payload):
        return ['compaction_payload_schema']
    if not compaction_timestamp_valid(payload['committed_at_utc']):
        errors.append('valid_utc_datetime')
    if payload['output_context_revision'] <= payload['input_context_revision']:
        errors.append('revision_must_increase')
    if payload['input_tokens'] - payload['output_tokens'] != payload['reclaimed_tokens']:
        errors.append('gain_equation')
    return errors

def compaction_event_errors(event, *, historical=False):
    if type(historical) is not bool:
        return ['historical_context_type']
    fixtures = load('Plans/context_compaction_completion_contract_fixtures.json')
    if not route.validator(load('Plans/event_record.schema.json')).is_valid(event):
        return ['envelope_schema']
    errors = compaction_payload_errors(event['payload'])
    if errors:
        return errors
    payload = event['payload']
    if event['scope_kind'] != 'project' or event['project_id'] is None:
        errors.append('project_only')
    if event['scope_kind'] == 'project' and any(event[k] != payload[k] for k in ('project_id', 'thread_id')):
        errors.append('payload_envelope_identity')
    if event['event_type'] != 'context.compaction.completed' or event['payload_schema_id'] != payload['schema_id']:
        errors.append('family_identity')
    if event['payload_ref'] is not None:
        errors.append('inline_only')
    if event['replay_policy'] != 'dedupe_by_idempotency_key' and not historical:
        errors.append('replay_policy')
    if event['occurred_at_utc'] != payload['committed_at_utc']:
        errors.append('commit_time_equality')
    identity = [payload['project_id'], payload['thread_id'], payload['operation_id']]
    sha = lambda x: hashlib.sha256(home.canonical_json(x)).hexdigest()
    digest = sha([fixtures['storage_instance_id']] + identity)
    if event['event_id'] != 'evt_compaction_' + digest:
        errors.append('event_identity')
    if event['idempotency_key'] != 'compaction:' + sha(identity):
        errors.append('idempotency_identity')
    if payload['compaction_receipt_ref'] != 'compaction_receipt:' + digest:
        errors.append('receipt_identity')
    return errors

def compaction_history(event, *, verified, withdrawn, deleted, live_revision):
    # SP-259: historical audit fact neither reconstructs purged content nor rewinds a newer head.
    if verified is not True or withdrawn is not False or type(deleted) is not bool or compaction_event_errors(event, historical=True):
        return 'unavailable'
    return 'content_free_deleted_thread_audit' if deleted else 'historical_audit_fact'

class Suite:
    def __init__(self):
        self.positives = []
        self.negatives = []
        self.weakeners = {}

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
        table = []
        for guard, weaken in self.weakeners.items():
            with weaken():
                flipped, stayed, exceptions = [], [], []
                for name, owner, fn in self.negatives:
                    try:
                        (flipped if fn() else stayed).append(name)
                    except Exception as exc:
                        exceptions.append({'case': name, 'exception': repr(exc)})
            expected = {name for name, owner, fn in self.negatives if owner == guard}
            holds = set(flipped) == expected and not exceptions
            if not holds:
                failures.append({'guard':guard,'counterfactual_did_not_match_own_negative_cohort':True})
            table.append({'guard': guard, 'negatives_that_flip': flipped,
                          'negatives_that_stay_rejected': stayed, 'expected_flips': sorted(expected),
                          'exceptions': exceptions, 'status': 'pass' if holds else 'partial'})
        for guard in sorted({g for _,g,_ in self.negatives} - set(self.weakeners)):
            table.append({'guard':guard, 'negatives_that_flip':[],
                          'negatives_that_stay_rejected':list(baseline),
                          'expected_flips':[n for n,g,_ in self.negatives if g==guard],
                          'status':'partial','reason':'No complete guard-removal witness yet; never promoted by suite success.'})
        return {'schema_id': 'pm.event_authority.ds.round2.static.v1',
                'status': 'fail' if failures else 'pass', 'native_execution': 'NOT_RUN',
                'claim': 'Static contract oracles only; whole-lane legacy guard inventory is reported separately.',
                'positive_count': len(positives), 'negative_count': len(baseline),
                'positive_results': positives, 'negative_acceptances': baseline,
                'guard_removal_table': table, 'guard_removal_complete': all(r['status']=='pass' for r in table),
                'failures': failures}

@contextmanager
def no_pattern_guard():
    def loose(validator, pattern, value, schema):
        yield from python_pattern(validator, pattern.replace(r'(?![\s\S])', '$'), value, schema)
    length_guard = route.StrictValidator.VALIDATORS['maxLength']
    def loose_length(validator, limit, value, schema):
        if schema.get('pattern','').startswith('^thr_'):
            return
        yield from length_guard(validator, limit, value, schema)
    with patch.dict(route.StrictValidator.VALIDATORS, {'pattern': loose, 'maxLength': loose_length}):
        yield

@contextmanager
def no_eager_guard():
    route._eager_done.clear()
    try:
        with patch.object(route, 'eager', source_without_guard(route.eager,'unresolved')):
            yield
    finally:
        route._eager_done.clear()

def build():
    suite = Suite()
    gate, context = created.candidate_gate(ROOT)
    suite.weakeners['identifier_end_of_input'] = no_pattern_guard
    suite.weakeners['browser_compatibility_projector_validation']=lambda:patch.object(gate.ReplayOracle,'consume',source_without_guard(gate.ReplayOracle.consume,'self.contract_failures'))
    suite.weakeners['eager_reference_closure'] = no_eager_guard
    @contextmanager
    def no_browser_replay_guard():
        with ExitStack() as stack:
            for instance in (gate,reset.sibling('pm-browser-event-admission',ROOT)):
                stack.enter_context(patch.object(instance,'candidate_failures',source_without_guard(instance.candidate_failures,"not historical and (event.get('producer_sequence_id')")))
            yield
    suite.weakeners['browser_writer_replay_policy'] = no_browser_replay_guard
    # Actual helper condition weakened; the total JSON budget stays unchanged.
    suite.weakeners['inline_encoded_byte_limit'] = lambda: patch.object(route, 'INLINE_LIMIT', 65536)
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
                suite.negative(family + ':missing_reference', 'reference_presence', lambda: not route.reference_presence_errors(None))
                suite.positive(family+':missing_reference_full_checker',lambda b=missing,check=check:bool(check(**b)))
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
    @contextmanager
    def calendar_duplicate():
        # The same calendar fact is checked by the schema format and the
        # original compaction timestamp parser. Remove that named pair only.
        import pm_contract_formats as formats
        selected=route.validator(load('Plans/event_payload_context_compaction_completed.schema.json'))
        changed=source_without_guard(formats.date_time,'not calendar_valid')
        with patch.dict(selected.format_checker.checkers,{'date-time':(changed,())}), \
                patch(__name__+'.compaction_payload_errors',source_without_guard(compaction_payload_errors,'not compaction_timestamp_valid')):
            yield
    suite.weakeners['compaction_calendar_validation']=calendar_duplicate
    for field in ('project_id','thread_id','operation_id','context_epoch_id'):
        bad=copy.deepcopy(comp['valid_event']['payload']);bad[field]+='\n'
        suite.negative('compaction:'+field+'_LF','identifier_end_of_input',lambda b=bad:not compaction_payload_errors(b))
    bad=copy.deepcopy(comp['valid_event']);bad['replay_policy']='projector_replay_only'
    suite.negative('compaction:replay_only','compaction_writer_replay_policy',lambda:not compaction_event_errors(bad))
    suite.weakeners['compaction_writer_replay_policy']=lambda:patch(__name__+'.compaction_event_errors',source_without_guard(compaction_event_errors,"event['replay_policy']"))
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
    suite.weakeners['compaction_historical_authenticity']=lambda:patch(__name__+'.compaction_history',source_without_guard(compaction_history,'verified is not True'))
    add_layout_cases(suite)
    suite.weakeners['reference_presence']=lambda:patch.object(route,'reference_presence_errors',source_without_guard(route.reference_presence_errors,'entry is None'))
    for defect,condition in [('hash','blake3_hex(data)'),('size','len(data)'),('media','media !=')]:
        suite.weakeners['reference_'+defect]=lambda c=condition:patch.object(route,'reference_metadata_errors',source_without_guard(route.reference_metadata_errors,c))
    @contextmanager
    def encoding_guard():
        # Two references to the same decoder function, not unrelated guards.
        changed=source_without_guard(home.decode_canonical_msgpack,'canonical_msgpack(value) != data')
        with patch.object(home,'decode_canonical_msgpack',changed),patch.object(route,'decode_canonical_msgpack',changed):yield
    suite.weakeners['reference_encoding']=encoding_guard
    for module in (created,reset):
        suite.weakeners['browser_historical_authenticity:'+module.EVENT_TYPE]=lambda m=module:patch.object(m,'workspace_history_fact',source_without_guard(m.workspace_history_fact,'not all'))
    return suite


def layout_event_errors(event, store=None, *, binding=None, historical=False, custody=None, historical_source=None):
    errors=[]
    if type(historical) is not bool:
        return ['historical_context_type']
    if historical:
        errors=home.layout_history_context_errors(event,historical_source,custody)
        if errors:
            return errors
    binding_schema=load(home.SCHEMA)
    binding_schema['$ref']='#/$defs/operation_binding'
    if not route.validator(binding_schema).is_valid(binding):
        return ['layout_binding_schema']
    d=home.binding_checks(errors,binding)
    if not isinstance(event,dict):
        return errors+['layout_envelope_schema']
    schema = load('Plans/event_record.schema.json' if event.get('schema_version')=='2.0.0' else 'Plans/event_record_v3.schema.json')
    if not route.validator(schema).is_valid(event):
        return errors+['layout_envelope_schema']
    if event['event_type']!='workspace.layout_changed':
        errors.append('layout_family')
    if event['payload_schema_id']!='https://puppetmaster.local/schemas/event_payloads/workspace_layout_changed/2.0.0':
        errors.append('layout_schema_identity')
    body, physical = route.resolved_body(event,store,historical=historical)
    errors.extend(physical)
    if body is None:
        return errors
    payload_schema=load('Plans/event_payloads/workspace_layout_changed_v2.schema.json')
    selected=route.validator(payload_schema)
    if historical and historical_source['payload_validation_recipe']=='workspace-layout-v2/original-json-schema':
        selected=home.RetainedBodyValidator(payload_schema,registry=selected._registry,format_checker=FormatChecker())
    if not selected.is_valid(body):
        return errors+['layout_payload_schema']
    home.event_checks(errors,event,binding,d,home.PayloadStore(store or {}),historical=historical,
                      historical_source=historical_source,custody=custody)
    if event['replay_policy'] != 'dedupe_by_idempotency_key' and not historical:
        errors.append('layout_replay_only_not_appendable')
    return errors

def layout_history_observation(event, recipe='workspace-layout-v2/original-json-schema'):
    """Synthetic authenticated-source observation; never native custody proof."""
    source={'event_bytes':home.canonical_msgpack(event),'payload_validation_recipe':recipe}
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
            suite.negative('layout:boundary_missing_reference','reference_presence',lambda:not route.reference_presence_errors(None))
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
        data=home.canonical_json(layout);ident=route.blake3_hex(data);objects[ident]=('application/json',data)
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
    suite.weakeners['governed_envelope_successor']=lambda:patch.object(route,'resolved_body',source_without_guard(route.resolved_body,"event.get('event_type') in ADOPTED"))
    suite.weakeners['layout_writer_replay_policy']=lambda:patch(__name__+'.layout_event_errors',source_without_guard(layout_event_errors,"event['replay_policy']"))
    old=copy.deepcopy(event);old['schema_version']='2.0.0'
    suite.positive('layout:historical_exact_2_reader',lambda:not layout_event_errors(old,historical=True,binding=binding,**layout_history_observation(old)))
    suite.positive('layout:historical_reference_newer_live_layout',lambda:not layout_event_errors(large,objects,historical=True,binding=binding,**layout_history_observation(large)))
    suite.negative('layout:old_envelope_not_a_new_writer','governed_envelope_successor',lambda:not layout_event_errors(old,binding=binding))

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path);ap.add_argument('--self-test',action='store_true');ap.add_argument('--inject-invalid-positive',action='store_true');args=ap.parse_args()
    if args.self_test:
        proc=subprocess.run([sys.executable,'-B',__file__,'--inject-invalid-positive'],capture_output=True,text=True)
        control=Suite();control.negative('nonflipping_negative','claimed_guard',lambda:False);control.weakeners['claimed_guard']=nullcontext
        nonflip_refused=control.run()['status']=='fail'
        result={'status':'pass' if proc.returncode==1 and nonflip_refused else 'fail','injected_bad_positive_exit_code':proc.returncode,'nonflipping_guard_control_refused':nonflip_refused}
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
