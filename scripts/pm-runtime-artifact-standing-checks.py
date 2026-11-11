#!/usr/bin/env python3
"""DR full-checker mutation witnesses for all ten fix-round standing checks.

Every trial executes main(), including the complete family checker. Mutations
exist in memory only: a fixture/configuration change, a source-text change, or
a guard-table row cut (one named row swapped to always-pass in that trial's
module only; the table modules themselves are never edited). This is bounded
static evidence, never native execution. Use the pinned
requirements-runtime-artifact-drafts.txt environment.
"""
import argparse
import contextlib
import copy
import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys
import time
import types


ROOT = Path(__file__).resolve().parents[1]
CHECKER = ROOT / 'scripts/pm-runtime-artifact-event-drafts.py'
CANONICAL_CASES = None


def module(source=None):
    m = types.ModuleType('dr_standing_trial')
    m.__file__ = str(CHECKER)
    exec(compile(source or CHECKER.read_text(), str(CHECKER), 'exec'), m.__dict__)
    return m


def cut(*rows):
    """Swap exactly the named table rows to always-pass in this trial module."""
    def configure(m):
        found = set()
        for phase in m.TABLE_PHASES:
            entries = m.table_rows(phase)
            if any(name in rows for name, _, _ in entries):
                m._TABLE_ROWS[phase] = [(name, (lambda value, context: None) if name in rows else predicate, context)
                                        for name, predicate, context in entries]
                found |= {name for name, _, _ in entries if name in rows}
        if found != set(rows):
            raise ValueError('unknown table rows: ' + ', '.join(sorted(set(rows) - found)))
    return configure


def memory_check():
    available = int(subprocess.check_output(['free', '-g'], text=True).splitlines()[1].split()[-1])
    if available < 10:
        raise RuntimeError(f'PAUSE: only {available} GB RAM available; need at least 10')
    return available


ONLY_FAMILIES = None  # --family: run the trials over these families only (reported as such)


def family_checkers(m):
    """Execute every full family checker sequentially, with a RAM gate per family."""
    failures, counts, runs = [], {}, []
    for row in m.load('Plans/runtime_artifact_event_drafts.json')['rows']:
        family = row['event_type']
        if ONLY_FAMILIES is not None and family not in ONLY_FAMILIES:
            continue
        available = memory_check()
        stream = io.StringIO()
        with contextlib.redirect_stdout(stream):
            code = int(m.main({family}))
        report = json.loads(stream.getvalue())
        failures.extend(report['failures'])
        counts[family] = report['per_family'].get(family, 0)
        runs.append(dict(family=family, exit_code=code, status=report['status'], available_ram_GB=available))
        counts['shared'] = report['per_family']['shared']
    code = int(any(r['exit_code'] for r in runs))
    return code, dict(status='fail' if code else 'pass', cases=sum(counts.values()),
                      per_family=counts, failures=failures, family_runs=runs,
                      native_execution='NOT_RUN', admission='NONE')


def run(name, standing, configure=None, source=None, selected=None):
    global CANONICAL_CASES
    source = source or CHECKER.read_text()
    if configure is None and source == CHECKER.read_text():
        raise ValueError(name + ': mutation did not change checker source')
    m = module(source)
    families = [r['event_type'] for r in m.load('Plans/runtime_artifact_event_drafts.json')['rows']]
    if configure:
        configure(m)
    # Causal witnesses always start from CLEAN, unmutated baseline data.
    # Positive-input faults still reach every primary main() assertion, while
    # they cannot turn the witness constructor into a second broken input.
    canonical = module()
    causal_cases = m.guard_cases
    if CANONICAL_CASES is None:
        CANONICAL_CASES = causal_cases(canonical)
    m.guard_cases = lambda boundary, excluded=(): [c for c in CANONICAL_CASES if c[1] not in excluded]
    started = time.monotonic()
    code, report = family_checkers(m)
    failed = {f: [x.split(':', 1)[1] for x in report['failures'] if x.startswith(f + ':')] for f in families}
    targets = [f for f in (selected or families) if ONLY_FAMILIES is None or f in ONLY_FAMILIES]
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


def history_rejects_live_change(m):
    old = m.inspect
    m.inspect = lambda row, payload, source: 'unavailable' if source.get('current_live_state') else old(row, payload, source)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--case', action='append', help='Run only case names containing this text (repeatable)')
    parser.add_argument('--family', action='append', help='Run every trial over these families only (repeatable)')
    args = parser.parse_args()
    global ONLY_FAMILIES
    ONLY_FAMILIES = set(args.family) if args.family else None
    source = CHECKER.read_text()
    cases = [
        ('S1_remove_policy_before_dedupe',1,cut('A03a_replay_only','A03b_policy'),None),
        ('S2_application_positive_in_Project_edition',2,fixture(application),None),
        ('S3_raw_project_partition',3,lambda m:setattr(m,'scope_partition',lambda p:p),None),
        ('S3_remove_stored_partition_join',3,cut('F03_partition'),None),
        ('S4_remove_oversized_inline_refusal',4,cut('D04_inline_size'),None),
        ('S4_remove_stored_inline_limit',4,cut('V05_inline_size'),None),
        ('S11_remove_only_pack_digest',11,cut('D09_pack_digest'),None),
        ('S11_remove_only_restore_ordinal',11,cut('O08_ordinal'),None,['runtime_artifact.restore_point']),
        ('S5_remove_fullmatch_guards',5,cut('S02_identifier_fullmatch','S04_identifier_key_fullmatch'),None),
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
        ('S11_remove_historical_decoder_selection',11,cut('H05_decoder'),source.replace(
            "edition = custody.recipe.owner_edition if custody is not None else at(source, 'recorded_decoder')",
            "edition = HISTORICAL_V1"),
            ['runtime_artifact.cost_usage','runtime_artifact.tool_llm_trace']),
        ('S10_ignore_withdrawal',10,cut('H01a_withdrawn'),None),
        ('S10_ignore_forged_source',10,cut('H02a_source_valid','H02b_receipt_valid'),None),
        ('earlier_B1_wrong_index_retention',None,inputs(lambda m,p,v:[r.__setitem__('index_retention_policy_ref','RP-PROJECTION-3GEN') for r in v['rows']] if p=='Plans/runtime_artifact_event_drafts.json' else None),None),
    ]
    for fault in ('wrong_store_key','wrong_checkpoint_store','wrong_token_store','wrong_source_store',
                  'wrong_anchor_store','wrong_frontier_store','wrong_token_source_store',
                  'wrong_source_selection','wrong_event','wrong_partition','wrong_locator',
                  'wrong_pointer','missing_dataset','wrong_frontier','unverified_source','wrong_live_snapshot'):
        cases.append(('B2_positive_'+fault,7,checkpoint_input(fault),None))
    hash_families = ['runtime_artifact.cost_usage','runtime_artifact.tool_llm_trace']
    # Sweep part 2B: the shared date-time check, integer slots, JCS route and SP-1101 dispatch.
    cases.append(('S12_remove_shared_datetime_check',12,cut('S08_date_time'),None))
    cases.append(('S12_stock_format_checker_skips_date_time',12,lambda m:setattr(m,'shared_datetime_validator',
                  lambda base, definition: m.Draft202012Validator(dict(base, **{'$ref': '#/$defs/' + definition}) if definition else base,
                                                                  format_checker=m.FormatChecker())),None))
    cases.append(('S10_remove_integer_slot_rule',10,cut('N01_integer_slots'),None))
    cases.append(('S10_remove_producer_jcs_qualification',10,cut('A08_producer_jcs','F14_producer_jcs'),None))
    # Both SP-1101 trials target every family: efbeecc654 gave the provider-hash
    # families their own H05b/H05c witnesses, and the binding-only negatives
    # (another Server or owner operation, requested bytes) reach H05b in each.
    cases.append(('S10a_caller_selects_retained_recipe',10,cut('H05c_no_caller_recipe'),None))
    cases.append(('S10a_ignore_authenticated_binding',10,cut('H05b_original_binding'),None))
    cases.append(('S5_remove_provider_hash_guard',5,cut('S03_provider_hash_overlay'),None,hash_families))
    cases.append(('earlier_B6_remove_restore_grouping_guard',None,cut('O02_grouping'),None,['runtime_artifact.restore_point']))
    selected = [c for c in cases if not args.case or any(text in c[0] for text in args.case)]
    results = []
    for case in selected:
        name, standing, configure, altered, *targets = case
        result = run(name, standing, configure, altered or source, targets[0] if targets else None)
        results.append(result)
        print(name + ': ' + ('caught' if result['caught'] else 'SURVIVED'), file=sys.stderr, flush=True)
    report = dict(status='pass' if results and all(r['caught'] for r in results) else 'fail',
                  families=sorted(ONLY_FAMILIES) if ONLY_FAMILIES else 'all',
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
