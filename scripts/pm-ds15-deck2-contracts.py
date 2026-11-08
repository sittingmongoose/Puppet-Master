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
valid = lambda schema, value, recipe=CURRENT: not list(base.validator(schema, recipe).iter_errors(value))
legacy_evidence_ok = base.original_evidence_ok
DECIDED_FAMILIES = {
    'browser.context_shared', 'browser.context_share_revoked',
    'catalog.update.started', 'catalog.update.completed',
    'catalog.remove.started', 'catalog.remove.completed',
    'tool.custom_headless.skipped',
}


def context_ok(c, value, retained=False, recipe=CURRENT):
    schema = copy.deepcopy(read('Plans/ds15_deck2_context.schema.json')['$defs'][c['event_type']])
    if retained:
        schema['required'] = ['scope', 'owner_command_authorized']
    return valid(schema, value, recipe)


def grants(values):
    # Exact types and closed entries are validated before this interpretation.
    if len({g['thread_id'] for g in values}) != len(values):
        return None
    return {g['thread_id']: g['grant_ref'] for g in values}


def transition_ok(c, p, t):
    n = c['event_type']
    if n.startswith('browser.context_'):
        before, after = grants(t['before_grants']), grants(t['after_grants'])
        if before is None or after is None or t['capture_created']:
            return False
        if t['browser_session_id'] != p['browser_session_id']:
            return False
        if n == 'browser.context_shared':
            wanted = dict(before)
            if p['thread_id'] in before and before[p['thread_id']] != p['grant_ref']:
                return False
            wanted[p['thread_id']] = p['grant_ref']
            return t['recipient_scope'] == p['scope'] and after == wanted
        wanted = {} if p['thread_id'] is None else {k: v for k, v in before.items() if k != p['thread_id']}
        return after == wanted
    if n.startswith('catalog.'):
        action, phase = n.split('.')[1:]
        uses = t['uses']
        allowed = read('Plans/ds15_deck2_contracts.json')
        own = next(row for row in allowed if row['event_type'] == n)
        if any(u not in own['listed_uses'].get(p['item_type'], []) for u in uses):
            return False
        if not all(t[k] for k in ('owner_rules_satisfied', 'override_preserved',
                                 'external_data_preserved', 'request_versions_preserved',
                                 'renewed_approval_satisfied', 'credentials_current', 'recovery_ready')):
            return False
        if t['previous_version'] != p['previous_version']:
            return False
        if t['queued']:
            return False
        if action == 'update':
            if not t['safe_boundary_confirmed'] or t['target_version'] != p['target_version']:
                return False
            return (t['stage'] == ('applying' if phase == 'started' else 'effective')
                    and t['effective_version'] == p['effective_version']
                    and p['effective_version'] == (p['previous_version'] if phase == 'started' else p['target_version'])
                    and t['installed_available'])
        return (not uses and not t['queued']
                and t['stage'] == ('removing' if phase == 'started' else 'removed')
                and t['installed_available'] is (phase == 'started'))
    if n == 'tool.custom_headless.skipped':
        return (not t['config_present'] and t['notice_before'] == 'unused'
                and t['notice_after'] == 'issued'
                and t['first_absent_check_id'] == p['doctor_invocation_id']
                and t['eligibility_project_id'] == p['project_id']
                and t['project_id_saved']
                and (t['project_origin'] not in ('clone_new_id', 'import_new_id')
                     or t['source_project_id'] is not None and t['source_project_id'] != p['project_id'])
                and (t['project_origin'] != 'restore_same_id' or t['source_project_id'] == p['project_id']))
    raise AssertionError(n)


def payload_ok(c, p, x, payload_recipe=CURRENT, context_recipe=CURRENT):
    if (payload_recipe == V1 and not base.v1_numbers_ok(p)) or (context_recipe == V1 and not base.v1_numbers_ok(x)):
        return False
    if not valid(read(c['payload_schema_ref']), p, payload_recipe) or not context_ok(c, x, recipe=context_recipe):
        return False
    if not x['owner_command_authorized'] or not x['outcome_committed']:
        return False
    scope = p.get('scope', {'kind': 'project', 'project_id': p.get('project_id')})
    if x['scope'] != scope or x['envelope_project_id'] != scope['project_id'] or x['envelope_run_id'] is not None:
        return False
    if n_is_browser(c) and x['session_security_class'] != 'ordinary':
        return False
    def safe_refs(value):
        if isinstance(value, str):
            return not (base._debug.ABSOLUTE_PATH_RE.search(value)
                        or base._debug.TOKEN_SHAPED_RE.search(value)
                        or base._debug.FORBIDDEN_REF_RE.search(value))
        if isinstance(value, dict):
            return all(safe_refs(v) for v in value.values())
        if isinstance(value, list):
            return all(safe_refs(v) for v in value)
        return True
    if not safe_refs(p):
        return False
    return transition_ok(c, p, x['transition'])


def n_is_browser(c):
    return c['event_type'].startswith('browser.')


def owner_record(c, d):
    raw = d.get('owner_records', {}).get(d['payload']['outcome_ref'])
    if type(raw) is not str:
        return None
    try:
        record = base.parse_owner_json(raw)
    except (ValueError, UnicodeError):
        return None
    schema = read('Plans/ds15_deck2_sources.schema.json')['$defs'][c['event_type']]
    return record if valid(schema, record) else None


def envelope_ok(c, d, retry=True, historical=False, append=False):
    e, original, p = d['envelope'], d['original']['event'], d['payload']
    # A historical read sees the retained original itself (ds15-v1); the original is always retained.
    recipe = V1 if historical else CURRENT
    if (recipe == V1 and not base.v1_numbers_ok((e, p))) or not base.v1_numbers_ok((original, d.get('original_context'))):
        return False
    if not valid(read(c['payload_schema_ref']), p, recipe) or not context_ok(c, d.get('original_context'), recipe=V1):
        return False
    scope = p.get('scope', {'kind': 'project', 'project_id': p.get('project_id')})
    if (not valid(read('Plans/event_record.schema.json'), e, recipe)
            or not valid(read('Plans/event_record.schema.json'), original, V1)
            or e['event_type'] != c['event_type'] or original['event_type'] != c['event_type']
            or e['payload_schema_id'] != read(c['payload_schema_ref'])['$id']
            or (not historical and (e['replay_policy'] != 'dedupe_by_idempotency_key'
                                    or original['replay_policy'] != 'dedupe_by_idempotency_key'))
            or e['scope_kind'] != ('application' if scope['kind'] == 'app' else 'project')
            or e['project_id'] != scope['project_id'] or not base.same(e['payload'], p)
            or e['thread_id'] != p.get('thread_id') or e['run_id'] is not None
            or d['context']['scope'] != scope
            or d['scope_partition'] != base._codec.scope_partition(e['scope_kind'], e['project_id'])
            or base.physical_size(p) is None or base.physical_size(p) > 16384):
        return False
    # CV-1100 producer route: a new append qualifies its full CV-317 projection before effects.
    if append and not base.current_producer_qualified(e):
        return False
    if retry and (e['event_id'] != original['event_id'] or base.v1_producer_digest(e) is None
                  or base.v1_producer_digest(e) != base.v1_producer_digest(original)):
        return False
    record = owner_record(c, d)
    if record is None:
        return False
    if (not base.same(record['payload'], p) or record['storage_instance_id'] != d['storage_instance_id']
            or record['scope'] != scope or record['transition'] != d['original_context']['transition']
            or record['event_type'] != c['event_type'] or not record['committed']
            or (not retry and record['transition'] != d['context']['transition'])):
        return False
    if 'operation_id' in p and record['original_operation_id'] != p['operation_id']:
        return False
    source = d.get('application_source')
    if scope['kind'] == 'app':
        expected = {'server_id': record['server_id'], 'original_operation_id': record['original_operation_id']}
        if source != expected or d['original'].get('application_source') != expected:
            return False
    return e['idempotency_key'] == base.identity(c, p, source, recipe)


def evidence_ok(op, d):
    # Keep the existing closed carrier and its operation-specific required set;
    # only the independently resolved source bank is added for these families.
    if not isinstance(d, dict) or 'owner_records' not in d:
        return False
    candidate = {k: v for k, v in d.items() if k != 'owner_records'}
    if not legacy_evidence_ok(op, candidate):
        return False
    return valid({'type': 'object', 'additionalProperties': {'type': 'string'}}, d['owner_records'])


# The imported model is private to this process; the original checker and its
# sixteen-family data remain unchanged. Reuse its custody, receipt, replay,
# permission, withdrawal, global range, token and atomic CAS paths verbatim.
base.payload_ok = payload_ok
base.context_types_ok = context_ok
base.envelope_ok = envelope_ok
base.original_evidence_ok = evidence_ok


def evaluate(c, op, d):
    if op == 'payload_schema':
        return {'result': 'ACCEPT' if valid(read(c['payload_schema_ref']), d['payload']) else 'REFUSE', 'effects': 0}
    if op == 'index_boundary':
        return {'result': 'ACCEPT' if base.index_inputs_ok(d) else 'REFUSE', 'effects': 0}
    return base.evaluate(c, op, d)


def catalog_request(c, p, t):
    """Non-persisting request oracle for the exact approved uses.

    Existing stricter owner refusals take precedence. An uncovered state is
    left to its owner, never promoted to a new catalog-wide product rule.
    """
    if not valid(read(c['payload_schema_ref']), p):
        return 'REFUSE'
    transition_schema = read('Plans/ds15_deck2_context.schema.json')['$defs'][c['event_type']]['properties']['transition']
    if not valid(transition_schema, t) or not t['owner_rules_satisfied']:
        return 'REFUSE'
    allowed = c['listed_uses'].get(p['item_type'], [])
    if any(u not in allowed for u in t['uses']):
        return 'UNRESOLVED_OWNER_USE'
    if not t['uses']:
        return 'OWNER_RULE'
    if '.remove.' in c['event_type']:
        return ('REFUSE_KEEP_INSTALLED_NO_QUEUE' if t['installed_available'] and not t['queued']
                else 'REFUSE')
    return ('QUEUE_KEEP_VERIFIED_VERSION' if t['effective_version'] == t['previous_version']
            and t['installed_available'] else 'REFUSE')


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
            assert base.receipt_ok(data), (case['id'], 'incoherent fixture custody')
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
    print(json.dumps({'status': 'pass', 'event_type': args.family, 'cases': len(seen),
                      'negative_cases': negatives, 'policy_cases': policy_count,
                      'reference_closure_cases': len(f.get('schema_cases', [])), 'native_execution': 'NOT_RUN',
                      'membership': 'ABSENT', 'shared_sweep_items': ['S-FMT1', 'S-N1', 'S-N2', 'shared-guard-tool']}))


if __name__ == '__main__':
    main()
