#!/usr/bin/env python3
"""DS15 deck-2 preparation oracles, one exact family per process.

Reuse the reviewed DS15 Storage/custody/index model. The extension supplies
only the seven newly decided owner transitions and their source boundaries.
It neither changes the sixteen-family checker nor runs production effects.
"""
import argparse
import copy
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('ds15_base', ROOT / 'scripts/pm-ds15-event-contracts.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
read = base.read
CURRENT, V1 = base.CURRENT, base.V1
refused = base.refused
legacy_evidence_ok = base.original_evidence_ok
DECIDED_FAMILIES = {
    'browser.context_shared', 'browser.context_share_revoked',
    'catalog.update.started', 'catalog.update.completed',
    'catalog.remove.started', 'catalog.remove.completed',
    'tool.custom_headless.skipped',
}


def valid(phase, schema, value, recipe=CURRENT):
    """One schema occurrence through its two rows (stock verdict, then number rule)."""
    return not base.schema_refused(phase, base.validator(schema, recipe), value)


def context_ok(c, value, retained=False, recipe=CURRENT):
    schema = copy.deepcopy(read('Plans/ds15_deck2_context.schema.json')['$defs'][c['event_type']])
    if retained:
        schema['required'] = ['scope', 'owner_command_authorized']
    phase = 'sch_d2_context_v1' if recipe == V1 else 'sch_d2_context_retained' if retained else 'sch_d2_context'
    return valid(phase, schema, value, recipe)


def transition_ok(c, p, t):
    n = c['event_type']
    if n.startswith('browser.context_'):
        # Exact types and closed entries are validated before this interpretation.
        if refused('d2_grants', before_threads=[g['thread_id'] for g in t['before_grants']],
                   after_threads=[g['thread_id'] for g in t['after_grants']]):
            return False
        before = {g['thread_id']: g['grant_ref'] for g in t['before_grants']}
        after = {g['thread_id']: g['grant_ref'] for g in t['after_grants']}
        shared = n == 'browser.context_shared'
        if shared:
            wanted = dict(before)
            wanted[p['thread_id']] = p['grant_ref']
        else:
            wanted = {} if p['thread_id'] is None else {k: v for k, v in before.items() if k != p['thread_id']}
        return not refused('d2_tr_browser', capture_created=t['capture_created'],
                           transition_session_id=t['browser_session_id'], payload_session_id=p['browser_session_id'],
                           family=n, existing_grant=before.get(p['thread_id']) if shared else None,
                           payload_grant_ref=p['grant_ref'] if shared else None,
                           recipient_scope=t['recipient_scope'] if shared else None,
                           payload_scope=p['scope'] if shared else None, after_grants=after, wanted_grants=wanted)
    if n.startswith('catalog.'):
        action, phase = n.split('.')[1:]
        uses = t['uses']
        own = next(row for row in read('Plans/ds15_deck2_contracts.json') if row['event_type'] == n)
        listed = own['listed_uses'].get(p['item_type'], [])
        if refused('d2_tr_catalog_a', unlisted_uses=[u for u in uses if u not in listed],
                   **{k: t[k] for k in ('owner_rules_satisfied', 'override_preserved', 'external_data_preserved',
                                        'request_versions_preserved', 'renewed_approval_satisfied', 'credentials_current')}):
            return False
        if refused('d2_tr_catalog_b', recovery_ready=t['recovery_ready'], previous_version=t['previous_version'],
                   payload_previous_version=p['previous_version'], queued=t['queued']):
            return False
        if action == 'update':
            return not refused('d2_tr_update', safe_boundary_confirmed=t['safe_boundary_confirmed'],
                               target_version=t['target_version'], payload_target_version=p['target_version'],
                               stage=t['stage'], expected_stage='applying' if phase == 'started' else 'effective',
                               effective_version=t['effective_version'], payload_effective_version=p['effective_version'],
                               expected_effective_version=p['previous_version'] if phase == 'started' else p['target_version'],
                               installed_available=t['installed_available'])
        # A removal's queue was refused by TC10 above (not queued).
        return not refused('d2_tr_remove', uses=uses, stage=t['stage'],
                           expected_stage='removing' if phase == 'started' else 'removed',
                           installed_available=t['installed_available'], expected_installed=phase == 'started')
    if n == 'tool.custom_headless.skipped':
        return not (refused('d2_tr_skipped', config_present=t['config_present'], notice_before=t['notice_before'],
                            notice_after=t['notice_after'], first_absent_check_id=t['first_absent_check_id'],
                            payload_doctor_invocation_id=p['doctor_invocation_id'],
                            eligibility_project_id=t['eligibility_project_id'], payload_project_id=p['project_id'],
                            project_id_saved=t['project_id_saved'])
                    or refused('d2_tr_skipped_origin', project_origin=t['project_origin'],
                               source_project_id=t['source_project_id'], payload_project_id=p['project_id']))
    raise AssertionError(n)


def unsafe_refs(value):
    """Payload strings (in maps and lists) that are absolute paths, token-shaped or forbidden refs."""
    found = []
    stack = [value]
    while stack:
        node = stack.pop()
        if isinstance(node, str):
            if (base._debug.ABSOLUTE_PATH_RE.search(node) or base._debug.TOKEN_SHAPED_RE.search(node)
                    or base._debug.FORBIDDEN_REF_RE.search(node)):
                found.append(node)
        elif isinstance(node, dict):
            stack.extend(node.values())
        elif isinstance(node, list):
            stack.extend(node)
    return sorted(found)


def payload_ok(c, p, x, payload_recipe=CURRENT, context_recipe=CURRENT):
    if not valid('sch_payload_v1' if payload_recipe == V1 else 'sch_payload', read(c['payload_schema_ref']), p,
                 payload_recipe) or not context_ok(c, x, recipe=context_recipe):
        return False
    scope = p.get('scope', {'kind': 'project', 'project_id': p.get('project_id')})
    browser = n_is_browser(c)
    if refused('d2_pl_gate', owner_command_authorized=x['owner_command_authorized'],
               outcome_committed=x['outcome_committed'], context_scope=x['scope'], payload_scope=scope,
               envelope_project_id=x['envelope_project_id'], scope_project_id=scope['project_id'],
               envelope_run_id=x['envelope_run_id'], browser_family=browser,
               session_security_class=x['session_security_class'] if browser else None, unsafe_refs=unsafe_refs(p)):
        return False
    return transition_ok(c, p, x['transition'])


def n_is_browser(c):
    return c['event_type'].startswith('browser.')


def owner_record(c, d):
    raw = d.get('owner_records', {}).get(d['payload']['outcome_ref'])
    parse_refusal = record = None
    if type(raw) is str:
        try:
            record = base.parse_owner_json(raw)
        except (ValueError, UnicodeError) as exc:
            parse_refusal = getattr(exc, 'reason', type(exc).__name__)
    if refused('d2_or_bytes', raw_type=base.kind(raw), parse_refusal=parse_refusal):
        return None
    schema = read('Plans/ds15_deck2_sources.schema.json')['$defs'][c['event_type']]
    return record if valid('sch_d2_source', schema, record) else None


def envelope_ok(c, d, original_recipe, retry=True, historical=False, append=False):
    e, original, p = d['envelope'], d['original']['event'], d['payload']
    # A historical read sees the retained original itself; the original is always retained. Both are read with
    # the frozen recipe the sealed custody selected (base.select_original_recipe, SP-1101), never an implicit one.
    recipe = original_recipe if historical else CURRENT
    if not valid('sch_payload_v1' if historical else 'sch_payload', read(c['payload_schema_ref']), p, recipe):
        return False
    if not context_ok(c, d.get('original_context'), recipe=original_recipe):
        return False
    scope = p.get('scope', {'kind': 'project', 'project_id': p.get('project_id')})
    event_schema = read('Plans/event_record.schema.json')
    if (not valid('sch_envelope_v1' if historical else 'sch_envelope', event_schema, e, recipe)
            or not valid('sch_original_event', event_schema, original, original_recipe)):
        return False
    if refused('d2_env_a', event_type=e['event_type'], original_event_type=original['event_type'],
               family_event_type=c['event_type'], payload_schema_id=e['payload_schema_id'],
               family_payload_schema_id=read(c['payload_schema_ref'])['$id'], historical=historical,
               envelope_policy=e['replay_policy'], original_policy=original['replay_policy']):
        return False
    if refused('d2_env_b', scope_kind=e['scope_kind'], expected_scope_kind='application' if scope['kind'] == 'app' else 'project',
               project_id=e['project_id'], scope_project_id=scope['project_id'], envelope_payload=base.tx(e['payload']),
               payload=base.tx(p), thread_id=e['thread_id'], payload_thread_id=p.get('thread_id'), run_id=e['run_id'],
               context_scope=d['context']['scope'], payload_scope=scope):
        return False
    if refused('d2_env_storage', scope_partition=d['scope_partition'],
               expected_partition=base.partition_of(e['scope_kind'], e['project_id']), payload_size=base.physical_size(p)):
        return False
    # CV-1100 producer route: a new append qualifies its full CV-317 projection before effects.
    if append and refused('env_producer', producer_refusal=base.producer_refusal(e)):
        return False
    if retry and refused('env_retry', event_id=e['event_id'], original_event_id=original['event_id'],
                         candidate_digest=base.recipe_producer_digest(original_recipe, e),
                         original_digest=base.recipe_producer_digest(original_recipe, original)):
        return False
    record = owner_record(c, d)
    if record is None:
        return False
    if refused('d2_env_c', record_payload=base.tx(record['payload']), payload=base.tx(p),
               record_storage_instance_id=record['storage_instance_id'], storage_instance_id=d['storage_instance_id'],
               record_scope=record['scope'], payload_scope=scope, record_transition=record['transition'],
               original_transition=d['original_context']['transition'], record_event_type=record['event_type'],
               family_event_type=c['event_type'], record_committed=record['committed'], retry=retry,
               current_transition=d['context']['transition'] if not retry else None):
        return False
    source = d.get('application_source')
    application = scope['kind'] == 'app'
    expected = ({'server_id': record['server_id'], 'original_operation_id': record['original_operation_id']}
                if application else None)
    if refused('d2_env_d', has_operation='operation_id' in p, record_operation_id=record['original_operation_id'],
               payload_operation_id=p.get('operation_id'), application=application,
               source=source if application else None, expected_source=expected,
               original_source=d['original'].get('application_source') if application else None):
        return False
    return not refused('env_identity', idempotency_key=e['idempotency_key'],
                       expected_key=base.identity(c, p, source, recipe))


def evidence_ok(op, d):
    # Keep the existing closed carrier and its operation-specific required set;
    # only the independently resolved source bank is added for these families.
    if refused('d2_ev_bank', bank_present=isinstance(d, dict) and 'owner_records' in d):
        return False
    candidate = {k: v for k, v in d.items() if k != 'owner_records'}
    if not legacy_evidence_ok(op, candidate):
        return False
    return valid('sch_d2_owner_records', {'type': 'object', 'additionalProperties': {'type': 'string'}}, d['owner_records'])


# The imported model is private to this process; the original checker and its
# sixteen-family data remain unchanged. Reuse its custody, receipt, replay,
# permission, withdrawal, global range, token and atomic CAS paths verbatim.
base.payload_ok = payload_ok
base.context_types_ok = context_ok
base.envelope_ok = envelope_ok
base.original_evidence_ok = evidence_ok


def evaluate(c, op, d):
    if op == 'payload_schema':
        return {'result': 'ACCEPT' if valid('sch_payload', read(c['payload_schema_ref']), d['payload']) else 'REFUSE',
                'effects': 0}
    if op == 'index_boundary':
        return {'result': 'ACCEPT' if base.index_inputs_ok(d) else 'REFUSE', 'effects': 0}
    return base.evaluate(c, op, d)


def catalog_request(c, p, t):
    """Non-persisting request oracle for the exact approved uses.

    Existing stricter owner refusals take precedence. An uncovered state is
    left to its owner, never promoted to a new catalog-wide product rule.
    """
    if not valid('sch_payload', read(c['payload_schema_ref']), p):
        return 'REFUSE'
    transition_schema = read('Plans/ds15_deck2_context.schema.json')['$defs'][c['event_type']]['properties']['transition']
    if not valid('sch_d2_transition', transition_schema, t):
        return 'REFUSE'
    allowed = c['listed_uses'].get(p['item_type'], [])
    unlisted = any([u not in allowed for u in t['uses']])
    remove = '.remove.' in c['event_type']
    if refused('d2_request', owner_rules_satisfied=t['owner_rules_satisfied'], remove=remove,
               listed_uses_present=not unlisted and bool(t['uses']), installed_available=t['installed_available'],
               queued=t['queued'] if remove else None, effective_version=None if remove else t['effective_version'],
               previous_version=None if remove else t['previous_version']):
        return 'REFUSE'
    if unlisted:
        return 'UNRESOLVED_OWNER_USE'
    if not t['uses']:
        return 'OWNER_RULE'
    return 'REFUSE_KEEP_INSTALLED_NO_QUEUE' if remove else 'QUEUE_KEEP_VERIFIED_VERSION'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--family', required=True)
    args = parser.parse_args()
    contracts = read('Plans/ds15_deck2_contracts.json')
    fixtures = read('Plans/ds15_deck2_fixtures.json')
    assert len(contracts) == len(fixtures) == 7
    assert {c['event_type'] for c in contracts} == {f['event_type'] for f in fixtures} == DECIDED_FAMILIES
    c = next(c for c in contracts if c['event_type'] == args.family)
    f = next(f for f in fixtures if f['event_type'] == args.family)
    assert args.family not in {r['event_type'] for r in read('Plans/event_family_registry.json')['families']}
    for path in (c['payload_schema_ref'], c['checkpoint_schema_ref'], 'Plans/ds15_deck2_context.schema.json', 'Plans/ds15_deck2_sources.schema.json'):
        base.validator(read(path))  # Eager reference closure, including unused branches.
    assert read(c['payload_schema_ref'])['additionalProperties'] is False
    cp = read(c['checkpoint_schema_ref'])
    assert cp['additionalProperties'] is False and len(cp['$defs']['read_token']['required']) == 9
    own = base.owner_text(c)
    for token in (c['event_type'], c['consumer'], c['checkpoint_key'], 'SP-278', 'SP-286', 'CV-339', 'withdrawal', 'NOT_RUN'):
        assert token in own, (args.family, token)
    seen = set()
    negatives = 0
    for case in f['cases']:
        assert case['id'] not in seen
        seen.add(case['id'])
        parent = copy.deepcopy(f['bases'][case['base']])
        parent_result = evaluate(c, case['operation'], parent)
        assert parent_result['result'] == case['parent_result'], (args.family, case['id'], 'invalid parent', parent_result)
        data = copy.deepcopy(parent)
        base.patch(data, case['changes'])
        base.patch(data, case.get('derived_observations', {}))
        if case['expected'] in ('REFUSE', 'UNAVAILABLE', 'PENDING'):
            assert len(case['changes']) == 1, (case['id'], 'more than one source defect')
            negatives += 1
        got = evaluate(c, case['operation'], data)
        assert got['result'] == case['expected'] and got['effects'] == 0, (args.family, case['id'], got)
        if case.get('coherent_transition'):
            record = json.loads(data['owner_records'][data['payload']['outcome_ref']])
            assert record['transition'] == data['context']['transition'] == data['original_context']['transition']
        if case.get('coherent_payload'):
            p = data['payload']
            record = json.loads(data['owner_records'][p['outcome_ref']])
            assert p == data['envelope']['payload'] == data['original']['payload'] == data['original']['event']['payload'] == data['outcome']['payload'] == record['payload']
            recipe = (base.new_write_recipe() if case['operation'] in base.NEW_WRITE_OPS
                      else base.harness_recipe(c, data))
            assert base.receipt_ok(data, recipe), (case['id'], 'incoherent fixture custody')
    assert {'writer-replay-only', 'original-retry', 'history-after-live-change', 'valid-checkpoint',
            'read-denied', 'read-deleted', 'writer-withdrawal', 'reader-withdrawal',
            'rebuild-valid', 'rebuild-missing-prefix', 'receipt-storage-sequence',
            'forged-source', 'cas-race', 'unknown-version', 'unknown-field'} <= seen
    policy_count = 0
    for case in f.get('policy_cases', []):
        assert catalog_request(c, case['payload'], case['transition']) == case['expected'], case['id']
        policy_count += 1
    for case in f.get('schema_cases', []):
        schema = copy.deepcopy(read(c[case['schema']]))
        base.patch(schema, case['changes'])
        try:
            base.validator(schema)
        except base.Unresolvable:
            pass
        else:
            raise AssertionError((args.family, case['id'], 'unresolved schema reference accepted'))
    assert not base.table_order_errors(), ('table require order', base.table_order_errors())
    print(json.dumps({'status': 'pass', 'event_type': args.family, 'cases': len(seen),
                      'negative_cases': negatives, 'policy_cases': policy_count,
                      'reference_closure_cases': len(f.get('schema_cases', [])), 'native_execution': 'NOT_RUN',
                      'membership': 'ABSENT'}))


if __name__ == '__main__':
    main()
