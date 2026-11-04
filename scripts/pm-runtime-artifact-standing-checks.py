#!/usr/bin/env python3
"""DR full-checker mutation witnesses for all ten fix-round standing checks.

Every trial executes main(), including the complete family checker. Mutations
exist in memory only. This is bounded static evidence, never native execution.
Use the pinned requirements-runtime-artifact-drafts.txt environment.
"""
import argparse
import contextlib
import copy
import hashlib
import io
import importlib.util
import json
from pathlib import Path
import sys
import time
import types


ROOT = Path(__file__).resolve().parents[1]
CHECKER = ROOT / 'scripts/pm-runtime-artifact-event-drafts.py'
SPEC = importlib.util.spec_from_file_location('dr_guard_isolation', ROOT / 'scripts/pm-runtime-artifact-guard-isolation.py')
ISOLATION = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ISOLATION)


def module(source=None):
    return ISOLATION.module(source or CHECKER.read_text())


def run(name, standing, configure=None, source=None, selected=None):
    source = source or CHECKER.read_text()
    m = module(source)
    families = [r['event_type'] for r in m.load('Plans/runtime_artifact_event_drafts.json')['rows']]
    if configure:
        configure(m)
    # Input injections must be preflighted AFTER configure changes the loader.
    m.SchemaReferences = m._raw_SchemaReferences
    output = io.StringIO()
    started = time.monotonic()
    with contextlib.redirect_stdout(output):
        code = int(m.main())
    report = json.loads(output.getvalue())
    failed = {f: [x.split(':', 1)[1] for x in report['failures'] if x.startswith(f + ':')] for f in families}
    targets = selected or families
    return dict(case=name, standing_check=standing, exit_code=code, status=report['status'],
                trial_source_sha256=hashlib.sha256(source.encode()).hexdigest(),
                cases=report['cases'], elapsed_seconds=round(time.monotonic()-started,3),
                caught=code == 1 and report['status'] == 'fail' and all(failed[f] for f in targets),
                per_family_failures=failed)


def inputs(transform):
    def configure(m):
        old = m.load
        def load(path):
            value = old(path)
            transform(m, path, value)
            return value
        m.load = load
    return configure


def fixture(transform):
    return inputs(lambda m,p,v: transform(m,v) if p == 'Plans/runtime_artifact_event_drafts.fixtures.json' else None)


def application(m, fixtures):
    for event in fixtures['positive_events'].values():
        event.update(scope_kind='application', project_id=None, idempotency_key=fixtures['application_keys'][0])


def remove_exact_guard(m):
    m.ExactValidator = m.Draft202012Validator
    m.EVENT_VALIDATOR = m.validator(m.load('Plans/event_record.schema.json'))
    m.RECEIPT_VALIDATOR = m.validator(m.RECEIPT_SCHEMA, 'AppendReceipt')
    m.CUSTODY_VALIDATOR = m.validator(m.RECEIPT_SCHEMA, 'custody_v2')
    m.RESULT_VALIDATOR = m.validator(m.RECEIPT_SCHEMA, 'full_value_result')


def storage_in_semantic(m):
    m.semantic_digest = lambda event: hashlib.sha256(m.rfc8785.dumps({
        k:event[k] for k in m.SEMANTIC_FIELDS + m.STORAGE_FIELDS})).hexdigest()


def success_is_failure(m):
    old = m.rejected
    def rejected(action):
        try:
            if action() == 0:
                return True
        except (ValueError, KeyError, UnicodeError, TypeError):
            return True
        return old(action)
    m.rejected = rejected


def checkpoint_input(fault):
    def transform(m, fixtures):
        rows = m.load('Plans/runtime_artifact_event_drafts.json')['rows']
        for row in rows:
            event = row['event_type']
            full = fixtures['positive_events'][event]
            original = m.AppendModel(row, {}, fixtures['first_append_receipts'][event], fixtures['custody_template']).append(full, True)
            _, _, _, broken = m.checkpoint_negative(fault, row, full, original, fixtures['checkpoint_positives'][event])
            fixtures['checkpoint_positives'][event] = broken
    # Construct using the unpatched loader; otherwise AppendModel's validation
    # would recursively load the same fixture being transformed.
    def configure(m):
        broken = copy.deepcopy(m.load('Plans/runtime_artifact_event_drafts.fixtures.json'))
        transform(m, broken)
        old = m.load
        m.load = lambda p: copy.deepcopy(broken) if p == 'Plans/runtime_artifact_event_drafts.fixtures.json' else old(p)
    return configure


def unresolved_reference(location, ref):
    def configure(m):
        old = m.load
        paths = {r['payload_schema_ref'] for r in old('Plans/runtime_artifact_event_drafts.json')['rows']}
        def load(path):
            value = old(path)
            if path in paths:
                if location == 'unused_definition':
                    value.setdefault('$defs', {})['DR_UNUSED'] = {'$ref': ref}
                else:
                    value['properties']['actor_ref'] = {'$ref': ref}
            return value
        m.load = load
    return configure


def remove_provider_hash_guard(m):
    def historical_validator(schema, definition=None, **kwargs):
        if definition:
            schema = dict(schema, **{'$ref': '#/$defs/' + definition})
        return m.ExactValidator(schema, format_checker=m.FormatChecker())
    m.validator = historical_validator


def history_rejects_live_change(m):
    old = m.inspect
    m.inspect = lambda row, payload, source: 'unavailable' if source.get('current_live_state') else old(row, payload, source)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--case', help='Run only case names containing this text')
    args = parser.parse_args()
    source = CHECKER.read_text()
    cases = [
        ('S1_remove_policy_before_dedupe',1,None,source.replace("if event['replay_policy'] == 'projector_replay_only':",'if False:').replace("if event['replay_policy'] != 'dedupe_by_idempotency_key':",'if False:')),
        ('S2_application_positive_in_Project_edition',2,fixture(application),None),
        ('S3_raw_project_partition',3,lambda m:setattr(m,'scope_partition',lambda p:p),None),
        ('S3_remove_stored_partition_join',3,None,source.replace("and custody['scope_partition'] == scope_partition(candidate['project_id'])",'and True')),
        ('S4_remove_oversized_inline_refusal',4,None,source.replace('if len(rfc8785.dumps(payload)) > INLINE_LIMIT:','if False:')),
        ('S4_remove_stored_inline_limit',4,None,source.replace("len(rfc8785.dumps(event['payload'])) <= INLINE_LIMIT",'True')),
        ('S11_remove_only_pack_digest',11,None,source.replace('or blake3(body).hexdigest() != digest','')),
        ('S11_remove_only_restore_ordinal',11,None,source.replace("candidate['producer_sequence_id'] == previous['producer_sequence_id'] + 1",'True'),['runtime_artifact.restore_point']),
        ('S5_remove_fullmatch_guards',5,remove_exact_guard,None),
        ('S6_compare_Storage_metadata',6,storage_in_semantic,None),
        ('S7_accept_every_checkpoint',7,lambda m:setattr(m,'checkpoint_matches',lambda *a:True),None),
        ('S8_success_is_failure',8,success_is_failure,None),
        ('B1_custody_trailing_LF',5,fixture(lambda m,f:f['custody_template'].__setitem__('group_digest',f['custody_template']['group_digest']+'\n')),None),
        ('B2_nonexistent_schema_route',7,inputs(lambda m,p,v:[r.__setitem__('checkpoint_schema_ref','Plans/DOES_NOT_EXIST.schema.json#/$defs/checkpoint') for r in v['rows']] if p=='Plans/runtime_artifact_event_drafts.json' else None),None),
        ('B2_wrong_store_key_route',7,inputs(lambda m,p,v:[r.__setitem__('checkpoint_key','event_record_index_checkpoint.v1:22222222-2222-4222-8222-222222222222') for r in v['rows']] if p=='Plans/runtime_artifact_event_drafts.json' else None),None),
        ('S8_failure_expects_success',8,fixture(lambda m,f:[c.__setitem__('expected','metadata_and_authorized_refs') for c in f['source_cases'] if c['id']=='wrong_project']),None),
        ('S9_remove_reference_preflight',9,lambda m:setattr(m.SchemaReferences,'errors',lambda *a,**k:[]),None),
        ('S9_optional_property_unresolved',9,unresolved_reference('optional_property','#/$defs/DR_MISSING_ACTOR_REF'),None),
        ('S9_unused_definition_unresolved',9,unresolved_reference('unused_definition','#/$defs/DR_MISSING_UNUSED'),None),
        ('S9_external_document_unresolved',9,unresolved_reference('optional_property','DR_DOES_NOT_EXIST.schema.json#/$defs/missing'),None),
        ('S9_external_fragment_unresolved',9,unresolved_reference('optional_property','https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json#/$defs/DR_MISSING'),None),
        ('S10_reject_retained_history_on_live_change',10,history_rejects_live_change,None),
        ('S10_current_writer_overlay_on_historical_originals',10,None,source.replace('validation=validation','validation=CURRENT_WRITER'),['runtime_artifact.cost_usage','runtime_artifact.tool_llm_trace']),
        ('S11_remove_historical_decoder_selection',11,None,ISOLATION.GUARDS['H05'][1](source),['runtime_artifact.cost_usage','runtime_artifact.tool_llm_trace']),
        ('S10_ignore_withdrawal',10,None,source.replace("if source['withdrawn'] or not source['authorized']:","if not source['authorized']:")),
        ('S10_ignore_forged_source',10,None,source.replace("if not source['source_valid'] or not source['receipt_valid']:",'if False:')),
        ('earlier_B1_wrong_index_retention',None,inputs(lambda m,p,v:[r.__setitem__('index_retention_policy_ref','RP-PROJECTION-3GEN') for r in v['rows']] if p=='Plans/runtime_artifact_event_drafts.json' else None),None),
    ]
    for fault in ('wrong_store_key','wrong_checkpoint_store','wrong_token_store','wrong_source_store',
                  'wrong_anchor_store','wrong_frontier_store','wrong_token_source_store',
                  'wrong_source_selection','wrong_event','wrong_partition','wrong_locator',
                  'wrong_pointer','missing_dataset','wrong_frontier','unverified_source','wrong_live_snapshot'):
        cases.append(('B2_positive_'+fault,7,checkpoint_input(fault),None))
    hash_families = ['runtime_artifact.cost_usage','runtime_artifact.tool_llm_trace']
    cases.append(('S5_remove_provider_hash_guard',5,remove_provider_hash_guard,None,hash_families))
    cases.append(('earlier_B6_remove_restore_grouping_guard',None,None,source.replace(
        "    if candidate['correlation_id'] != grouping_identity(row['event_type'], payload):\n        return False\n",''),['runtime_artifact.restore_point']))
    selected = [c for c in cases if not args.case or args.case in c[0]]
    results = []
    for case in selected:
        name, standing, configure, altered, *targets = case
        result = run(name, standing, configure, altered or source, targets[0] if targets else None)
        results.append(result)
        print(name + ': ' + ('caught' if result['caught'] else 'SURVIVED'), file=sys.stderr, flush=True)
    report = dict(status='pass' if results and all(r['caught'] for r in results) else 'fail',
                  checker_sha256=hashlib.sha256(CHECKER.read_bytes()).hexdigest(),
                  trials=len(results), results=results, native_execution='NOT_RUN', admission='NONE')
    body = json.dumps(report,indent=2)+'\n'
    if args.output:
        args.output.write_text(body)
    else:
        print(body,end='')
    return report['status'] != 'pass'


if __name__ == '__main__':
    sys.exit(main())
