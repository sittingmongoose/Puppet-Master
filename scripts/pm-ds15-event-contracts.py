#!/usr/bin/env python3
"""Execute DS15 static contract oracles. No production effects or native proof."""
import copy
import hashlib
import json
from pathlib import Path
import jsonschema
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
FORMAT = jsonschema.FormatChecker()
_codec_spec = importlib.util.spec_from_file_location('pm_ds15_readiness_codec', ROOT / 'scripts/pm-implementation-readiness.py')
_codec = importlib.util.module_from_spec(_codec_spec)
_codec_spec.loader.exec_module(_codec)

def read(path):
    return json.loads((ROOT / path).read_text())

def validator(schema):
    jsonschema.Draft202012Validator.check_schema(schema)
    return jsonschema.Draft202012Validator(schema, format_checker=FORMAT)

def digest(value):
    # Test-only normalized bytes; production uses SP-026/SP-286 codecs.
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def identity(c, payload):
    scope = [payload['project_id']] if c['scope_policy'] == 'project_only' else [payload['scope']]
    parts = [c['event_type'], c['family_revision'], *scope] + [payload[k] for k in c['identity_fields']]
    return hashlib.sha256(_codec.canonical_messagepack_bytes(parts)).hexdigest()

def owner_text(c):
    path, uid = c['semantic_owner'].split('#')
    text = (ROOT / path).read_text()
    start = text.index('### ' + uid + ' ')
    end = text.find('\n### ', start + 1)
    unit = text[start:end if end != -1 else len(text)]
    return json.loads(unit.split('```yaml\n', 1)[1].split('\n```', 1)[0])['canonical_text']

def payload_ok(c, p, x):
    if list(validator(read(c['payload_schema_ref'])).iter_errors(p)):
        return False
    scope = p.get('scope', {'kind': 'project', 'project_id': p.get('project_id')})
    if x['scope'] != scope or x['envelope_project_id'] != scope.get('project_id'):
        return False
    if p.get('run_id') != x['envelope_run_id']:
        return False
    if p.get('browser_session_id') and x['session_security_class'] != 'ordinary':
        return False
    n = c['event_type']
    if n == 'doctor.custom_headless.checked':
        return x['config_inspected'] and x['doctor_invocation_id'] == p['doctor_invocation_id']
    if n == 'live.session.started':
        return x['launch_outcome'] == 'launched' and x['driver_session_id'] == p['session_id']
    if n == 'live.step.updated':
        return x['session_state'] == 'running' and p['step_revision'] > x['previous_revision']
    if n == 'live.artifact.created':
        return (x['artifact']['id'] == p['artifact_id'] and x['artifact']['ref'] == p['artifact_ref']
                and x['artifact']['receipt_ref'] == p['artifact_receipt_ref'] and x['artifact']['committed'])
    if n == 'live.session.completed':
        return (x['session_state'] == 'running' and x['finalization']['committed']
                and all(x['finalization'][k] == p[k] for k in ('manifest_ref', 'summary_ref', 'checks_ref')))
    if n == 'live.session.degraded':
        return (p['degradation_revision'] > x['previous_revision'] and not x['visible_dependency_available']
                and x['launch_outcome'] == ('refused' if p['requested_visual_mode'] == 'forced_visible' else 'headless'))
    if n == 'browser.context_captured':
        return (x['target_resolution'] in ('explicit', 'owning_surface', 'explicit_new_thread')
                and x['resolved_thread_id'] == p['thread_id'] and x['thread_writable']
                and x['chip']['chip_id'] == p['chip_id'] and x['chip']['thread_id'] == p['thread_id']
                and x['chip']['attachment_type'] == p['attachment_type']
                and x['chip']['source_ref'] == p['source_ref'] and x['chip']['committed']
                and x['chip']['status'] == p['capture_status'] and not x['auto_send'])
    if n.startswith('dev.session.'):
        transitions = {'dev.session.started': ({'created', 'restarting'}, 'running'),
                       'dev.session.restarting': ({'running', 'stopped'}, 'restarting'),
                       'dev.session.stopping': ({'running', 'restarting'}, 'stopping'),
                       'dev.session.stopped': ({'running', 'restarting', 'stopping'}, 'stopped')}
        before, after = transitions[n]
        return (p['previous_state'] in before and p['workflow_state'] == after
                and x['workflow_state'] == p['previous_state'] and p['workflow_revision'] == x['previous_revision'] + 1
                and x['dev_session_id'] == p['dev_session_id'] and x['managed_outcome_committed']
                and (n != 'dev.session.started' or x['launch_outcome'] == 'launched')
                and (n != 'dev.session.stopped' or x['managed_resources_settled'])
                and x['dap_state_after'] == x['dap_state_before'] and not x['rewrite_terminal_history'])
    if n.startswith('preview.session.'):
        return (x['preview_subject_id'] == p['preview_subject_id']
                and x['preview_session_id'] == p['preview_session_id']
                and x['source_revision'] == p['source_revision'] and x['runtime_verified']
                and not x['restored_live_claim']
                and (n != 'preview.session.started' or (x['session_state'] == 'created' and p['runtime_state'] == 'loading'))
                and (n != 'preview.session.stopped' or (x['session_state'] != 'closed' and p['runtime_state'] == 'closed' and x['managed_resources_settled']))
                and (n != 'preview.session.refreshed' or (x['session_state'] in ('ready', 'stale', 'degraded', 'error')
                     and x['refreshable'] and x['refresh_committed'] and p['preview_revision'] > x['previous_revision']
                     and ((p['refresh_origin'] == 'cmd.browser.reload' and p.get('browser_session_id') == x['browser_session_id'])
                          or (p['refresh_origin'] == 'filemanager.preview_refresh' and not p.get('browser_session_id'))))))
    raise AssertionError('Missing per-family transition oracle: ' + n)

def evaluate(c, op, d):
    """Normative reference model over concrete source/receipt/index values."""
    p, x = d['payload'], d['context']
    if op == 'payload':
        return {'result': 'ACCEPT' if payload_ok(c, p, x) else 'REFUSE', 'effects': 0}
    if op in ('recover', 'publish', 'read'):
        o, r, out = d['original'], d['receipt'], d['outcome']
        if out is None or not out['committed'] or not d['backup_closure_verified']:
            return {'result': 'UNAVAILABLE', 'effects': 0}
        if (not payload_ok(c, o['payload'], x) or p != o['payload'] or out['payload'] != o['payload']
                or out['event_id'] != o['event_id'] or o['idempotency_key'] != identity(c, p)):
            return {'result': 'REFUSE', 'effects': 0}
        if r is None:
            return {'result': 'APPEND_ORIGINAL' if op == 'recover' else 'PENDING', 'effects': 0, 'event_id': o['event_id']}
        if any(r[k] != v for k, v in {'event_id': o['event_id'], 'idempotency_key': o['idempotency_key'], 'payload_sha256': digest(p)}.items()):
            return {'result': 'REFUSE', 'effects': 0}
        if op == 'read' and (not d['permission_now'] or d['source_deleted_now'] or not d['share_current']):
            return {'result': 'UNAVAILABLE', 'effects': 0}
        if op == 'publish' and not d['receipt_retained']:
            return {'result': 'PENDING', 'effects': 0, 'event_id': o['event_id']}
        return {'result': 'ORIGINAL', 'effects': 0, 'event_id': o['event_id'], 'receipt_ref': r['receipt_ref']}
    if op in ('checkpoint', 'rebuild'):
        cp = d['checkpoint']
        if list(validator(read(c['checkpoint_schema_ref'])).iter_errors(cp)):
            return {'result': 'REFUSE', 'effects': 0}
        if op == 'rebuild' and not d['retained_prefix_complete']:
            return {'result': 'UNAVAILABLE', 'effects': 0}
        token = cp['index_read_token']
        if (d['expected_previous'] != d['stored_previous'] or d['reader_installed'] != c['consumer']
                or d['reader_withdrawn'] or not d['permission_now'] or d['source_deleted_now']
                or cp['state'] != 'current' or token != d['selected_token']
                or d['live_snapshot_id'] != d['current_live_snapshot_id']
                or token['storage_instance_id'] != token['source_selection']['storage_instance_id']
                or cp.get('project_id') != p.get('project_id') or cp.get('scope') != p.get('scope')):
            return {'result': 'REFUSE', 'effects': 0}
        rows, low, high = d['index_rows'], d['scan_low'], d['scan_high']
        if ([r['sequence'] for r in rows] != list(range(low, high + 1))
                or cp['through_sequence_id'] != high or high != d['selected_high']
                or (d['stored_previous'] is not None and low != d['stored_previous']['through_sequence_id'] + 1)):
            return {'result': 'REFUSE', 'effects': 0}
        matches = [r['event_id'] for r in rows if r['event_type'] == c['event_type'] and r['scope'] == x['scope']]
        if not matches or matches != d['selected_matches'] or cp['last_event_id'] != matches[-1]:
            return {'result': 'REFUSE', 'effects': 0}
        return {'result': 'ADVANCE', 'effects': 0, 'through_sequence_id': high, 'last_event_id': matches[-1]}
    if op == 'withdraw_writer':
        admitted = d['admitted_sequence']
        if admitted is None or admitted > d['withdrawal_frontier']:
            return {'result': 'REFUSE', 'effects': 0}
        return evaluate(c, 'publish', d)
    raise AssertionError(op)

def patch(data, changes):
    for path, value in changes.items():
        keys = path.split('/')
        parent = data
        for key in keys[:-1]:
            parent = parent[int(key)] if isinstance(parent, list) else parent[key]
        key = int(keys[-1]) if isinstance(parent, list) else keys[-1]
        if value == {'$delete': True}:
            del parent[key]
        else:
            parent[key] = copy.deepcopy(value)

REQUIRED = {'valid-transition', 'invalid-transition', 'envelope-mismatch', 'original-retry', 'lost-ack',
            'append-recovery', 'missing-outcome', 'corrupt-outcome', 'corrupt-receipt', 'changed-bytes',
            'backup-loss', 'publish-before-receipt', 'read-deleted', 'read-denied', 'valid-checkpoint',
            'coverage-gap', 'filtered-omission', 'cas-race', 'token-change', 'snapshot-change',
            'source-instance-mismatch', 'withdrawn-reader', 'withdrawn-writer', 'drain-admitted',
            'rebuild-valid', 'rebuild-missing-prefix', 'stale-reader-version', 'unknown-checkpoint-field',
            'persisted-snapshot', 'terminal-before-receipt'}

def check_value_contracts():
    count = 0
    for f in read('Plans/ds15_value_contract_fixtures.json'):
        v = validator(read(f['schema_ref']))
        for case in f['cases']:
            data = copy.deepcopy(f['positive'])
            patch(data, case['changes'])
            assert (not list(v.iter_errors(data))) == case['valid'], (f['schema_ref'], case['id'])
            count += 1
    return count

def main():
    contracts = read('Plans/ds15_event_contracts.json')
    fixtures = read('Plans/ds15_event_contract_fixtures.json')
    registry = read('Plans/event_family_registry.json')
    value_registry = read('Plans/storage_value_registry.json')
    count = semantic_count = 0
    for c in contracts:
        name = c['event_type']
        assert name not in json.dumps(registry), name + ' unexpectedly admitted'
        v = validator(read(c['payload_schema_ref']))
        f = next(f for f in fixtures if f['event_type'] == name)
        v.validate(f['positive']); count += 1
        for case in f['negative']:
            bad = copy.deepcopy(f['positive'])
            if case['mutation'] == 'missing_field': bad.pop(case['field'])
            else: bad[case['field']] = case['value']
            assert list(v.iter_errors(bad)), (name, case)
            count += 1
        cp = read(c['checkpoint_schema_ref'])
        validator(cp).validate(f['semantic_base']['checkpoint'])
        token = cp['$defs']['read_token']
        assert len(token['required']) == 9 and 'redb_snapshot_id' not in token['properties']
        assert cp['additionalProperties'] is False and cp['properties']['consumer_id']['const'] == c['consumer']
        row = next(v for v in value_registry['families'] if v['value_schema_ref'] == c['checkpoint_schema_ref'])
        assert row['key_shape'] == c['checkpoint_key'] and row['value_schema'] == cp
        assert row['retention_policy_ref'] == c['checkpoint_retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        profile = value_registry['storage_profile']['family_profiles'][row['family_id']]
        assert profile['redb_file'] == 'derived' and profile['encoding_target'] == 'messagepack_canonical'
        assert 1 <= profile['max_value_bytes'] <= 16384
        for key in ('semantic_owner', 'storage_owner', 'payload_owner', 'oracle_owner'):
            path, unit = c[key].split('#'); assert unit in (ROOT / path).read_text()
        own = owner_text(c)
        for word in (name, c['consumer'], c['checkpoint_key'], c['idempotency_recipe'], 'SP-278', 'SP-286', 'CV-339', 'withdrawal', 'NOT_RUN'):
            assert word in own, (name, word)
        ids = [case['id'] for case in f['semantic_cases']]
        assert len(ids) == len(set(ids)) and REQUIRED <= set(ids), (name, REQUIRED - set(ids))
        for case in f['semantic_cases']:
            data = copy.deepcopy(f['semantic_base']); patch(data, case['changes'])
            got = evaluate(c, case['operation'], data)
            assert got == case['expected'], (name, case['id'], got, case['expected'])
            semantic_count += 1
    value_cases = check_value_contracts() if (ROOT / 'Plans/ds15_value_contract_fixtures.json').exists() else 0
    print(json.dumps({'status':'pass','families':len(contracts),'payload_oracles':count,'semantic_oracles':semantic_count,'value_oracles':value_cases,'native_execution':'NOT_RUN'}))

if __name__ == '__main__': main()
