#!/usr/bin/env python3
"""Execute DS15 static contract oracles. No production effects or native proof."""
import copy
import hashlib
import json
import re
from pathlib import Path
import jsonschema
import importlib.util
from functools import lru_cache
from jsonschema.validators import extend
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
FORMAT = jsonschema.FormatChecker()
def exact_pattern(validator, pattern, instance, schema):
    if isinstance(instance, str) and re.fullmatch(pattern, instance) is None:
        yield jsonschema.ValidationError('String does not fully match identifier pattern')

StrictValidator = extend(jsonschema.Draft202012Validator, {'pattern': exact_pattern})
_codec_spec = importlib.util.spec_from_file_location('pm_ds15_readiness_codec', ROOT / 'scripts/pm-implementation-readiness.py')
_codec = importlib.util.module_from_spec(_codec_spec)
_codec_spec.loader.exec_module(_codec)
_debug_spec = importlib.util.spec_from_file_location('pm_ds15_debug_semantics', ROOT / 'scripts/pm-shared-runtime-contracts.py')
_debug = importlib.util.module_from_spec(_debug_spec)
_debug_spec.loader.exec_module(_debug)

@lru_cache(maxsize=None)
def read(path):
    return json.loads((ROOT / path).read_text())

def validator(schema):
    return cached_validator(json.dumps(schema, sort_keys=True))

@lru_cache(maxsize=None)
def cached_validator(encoded):
    schema = json.loads(encoded)
    jsonschema.Draft202012Validator.check_schema(schema)
    return StrictValidator(schema, format_checker=FORMAT)

@lru_cache(maxsize=1)
def application_source_validator():
    registry = Registry()
    for name in ('shared_integration_runtime', 'application_workflow_contracts', 'application_workflow_sources'):
        schema = read('Plans/' + name + '.schema.json')
        resource = Resource.from_contents(schema)
        registry = registry.with_resource(schema['$id'], resource)
        registry = registry.with_resource('https://puppetmaster.local/Plans/' + name + '.schema.json', resource)
    schema = read('Plans/application_workflow_sources.schema.json')
    return StrictValidator({'$defs': schema['$defs'], '$ref': '#/$defs/OriginalBrowserTransitionSource'},
                           registry=registry, format_checker=FORMAT)

def identity(c, payload, source=None):
    if payload.get('scope', {}).get('kind') == 'app':
        if not source:
            raise ValueError('Application identity requires original Server/owner-operation custody')
        return 'application@1:{}:{}'.format(source['server_id'].encode().hex(),
                                           source['original_operation_id'].encode().hex())
    scope = [payload['project_id']] if c['scope_policy'] == 'project_only' else [payload['scope']]
    parts = [c['event_type'], c['family_revision'], *scope] + [payload[k] for k in c['identity_fields']]
    return hashlib.sha256(_codec.canonical_messagepack_bytes(parts)).hexdigest()

def commitment(event):
    domain = 'pm.storage.original_event_value_commitment.v1'
    codec = 'pm.seglog_frame_v2.event_value.canonical_msgpack.v1'
    preimage = [domain, '1.0.0', codec, event['schema_id'], event['schema_version'], event]
    return {'schema_id': domain, 'schema_version': '1.0.0', 'codec': codec, 'domain': domain,
            'event_schema_id': event['schema_id'], 'event_schema_version': event['schema_version'],
            'sha256': hashlib.sha256(_codec.canonical_messagepack_bytes(preimage)).hexdigest()}

def shared_valid(kind, value):
    schema = read('Plans/event_append_receipt_contracts.schema.json')
    return not list(validator({'$defs': schema['$defs'], '$ref': '#/$defs/' + kind}).iter_errors(value))

def envelope_ok(c, d, retry=True):
    e, original = d['envelope'], d['original']['event']
    scope = d['context']['scope']
    if (list(validator(read('Plans/event_record.schema.json')).iter_errors(e))
            or list(validator(read('Plans/event_record.schema.json')).iter_errors(original))
            or e['event_type'] != c['event_type'] or not re.fullmatch(r'[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+', e['event_type'])
            or e['replay_policy'] != 'dedupe_by_idempotency_key'
            or original['replay_policy'] != 'dedupe_by_idempotency_key'
            or e['scope_kind'] != ('application' if scope['kind'] == 'app' else 'project')
            or e['project_id'] != scope['project_id'] or e['payload'] != d['payload']
            or e['run_id'] != d['payload'].get('run_id') or e['thread_id'] != d['payload'].get('thread_id')
            or e['payload_schema_id'] != read(c['payload_schema_ref'])['$id']
            or d['scope_partition'] != _codec.scope_partition(e['scope_kind'], e['project_id'])
            or len(_codec.canonical_messagepack_bytes(e['payload'])) > 16384):
        return False
    # The retry equality domain excludes only Storage-assigned metadata. Full original
    # value custody below independently commits those original metadata fields too.
    if retry and (e['event_id'] != original['event_id']
            or _codec.event_producer_semantic_digest(e) != _codec.event_producer_semantic_digest(original)):
        return False
    source = d.get('application_source')
    if scope['kind'] == 'app':
        if (not source or source != d['original']['application_source']
                or list(application_source_validator().iter_errors(source))
                or source['schema_id'] != 'pm.application_source.browser_transition.v1'
                or source['interface_id'] != 'owner.browser.transition.application@1.0.0'
                or source['storage_instance_id'] != d['storage_instance_id']
                or source['thread_id'] != e['thread_id']
                or source['scope']['scope_kind'] != 'application' or source['scope']['project_id'] is not None
                or source['scope']['server_id'] != source['server_id']
                or source['original_output'] is None
                or source['original_output']['profile_id'] != scope['profile_id']
                or d['payload']['browser_session_id'] not in source['original_output']['session_refs']
                or any(stage['original_operation_id'] != source['original_operation_id']
                       for stage in source['stage_custody'].values())
                or not all(isinstance(source.get(k), str) and 0 < len(source[k]) <= 256 and '\n' not in source[k]
                           for k in ('server_id', 'original_operation_id'))):
            return False
    return e['idempotency_key'] == identity(c, e['payload'], source)

def receipt_ok(d):
    r, custody, result, event = d['receipt'], d['custody'], d['issued_result'], d['original']['event']
    if not (shared_valid('AppendReceipt', r) and shared_valid('custody_v2', custody)
            and shared_valid('full_value_result', result)):
        return False
    return (r == custody['first_append_receipt'] == result['first_append_receipt']
            and r['event_id'] == event['event_id'] and r['sequence_id'] == event['sequence_id']
            and r['byte_offset'] < r['durable_end_offset']
            and custody['original_event_value_commitment'] == result['original_event_value_commitment'] == commitment(event)
            and custody['original_segment_ref'] == result['original_segment_ref']
            and custody['storage_instance_id'] == d['storage_instance_id']
            and custody['scope_partition'] == d['scope_partition']
            and custody['event_id'] == event['event_id'] and custody['event_type'] == event['event_type']
            and custody['idempotency_key'] == event['idempotency_key']
            and custody['producer_semantic_digest'] == _codec.event_producer_semantic_digest(event))

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
    if not x['owner_command_authorized']:
        return False
    def safe_refs(value):
        if isinstance(value, str):
            return not (_debug.ABSOLUTE_PATH_RE.search(value) or _debug.TOKEN_SHAPED_RE.search(value)
                        or _debug.FORBIDDEN_REF_RE.search(value))
        if isinstance(value, dict):
            return all(safe_refs(v) for v in value.values())
        return True
    if not safe_refs(p):
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
                and p['target_resolution'] == x['target_resolution']
                and x['resolved_thread_id'] == p['thread_id'] and x['thread_writable']
                and x['chip']['chip_id'] == p['chip_id'] and x['chip']['thread_id'] == p['thread_id']
                and x['chip']['attachment_type'] == p['attachment_type']
                and x['chip']['source_ref'] == p['source_ref'] and x['chip']['committed']
                and x['chip']['status'] == p['capture_status'] and x['thread_scope'] == scope and not x['auto_send'])
    if n.startswith('dev.session.'):
        transitions = {'dev.session.started': ({'created', 'restarting'}, 'running'),
                       'dev.session.restarting': ({'running', 'stopped'}, 'restarting'),
                       'dev.session.stopping': ({'running', 'restarting'}, 'stopping'),
                       'dev.session.stopped': ({'running', 'restarting', 'stopping'}, 'stopped')}
        before, after = transitions[n]
        return (p['previous_state'] in before and p['workflow_state'] == after
                and x['workflow_state'] == p['previous_state'] and p['workflow_revision'] == x['previous_revision'] + 1
                and x['dev_session_id'] == p['dev_session_id'] and x['managed_outcome_committed']
                and x['operation_id'] == p['operation_id']
                and (n != 'dev.session.started' or x['launch_outcome'] == 'launched')
                and (n != 'dev.session.stopped' or x['managed_resources_settled'])
                and (x['dap_state_after'] == x['dap_state_before'] or (x['dap_transition_ref'] is not None and x['dap_owner_verified']))
                and all(p.get(k) == x['links'].get(k) for k in ('run_id','thread_id','workspace_tab_id','terminal_session_id','dap_session_id'))
                and not x['rewrite_terminal_history'])
    if n.startswith('preview.session.'):
        return (x['preview_subject_id'] == p['preview_subject_id']
                and x['preview_session_id'] == p['preview_session_id']
                and x['source_revision'] == p['source_revision'] and x['runtime_verified']
                and not x['restored_live_claim']
                and (n != 'preview.session.started' or (x['session_state'] == 'created' and p['runtime_state'] == 'loading'))
                and (n != 'preview.session.stopped' or (x['session_state'] != 'closed' and p['runtime_state'] == 'closed' and x['managed_resources_settled']))
                and (n != 'preview.session.refreshed' or (x['session_state'] in ('ready', 'stale', 'degraded', 'error')
                     and x['refreshable'] and x['refresh_committed'] and p['preview_revision'] > x['previous_revision']
                     and ((p['refresh_origin'] == 'cmd.browser.reload' and bool(p.get('browser_session_id')) and p['browser_session_id'] == x['browser_session_id'])
                          or (p['refresh_origin'] == 'filemanager.preview_refresh' and not p.get('browser_session_id'))))))
    raise AssertionError('Missing per-family transition oracle: ' + n)

def evaluate(c, op, d):
    """Normative reference model over concrete source/receipt/index values."""
    p, x = d['payload'], d['context']
    if op in ('payload', 'recover', 'publish', 'withdraw_writer'):
        policies = [d['envelope'].get('replay_policy'), d['original']['event'].get('replay_policy'),
                    d.get('replay_policy'), x.get('replay_policy'), x.get('envelope_replay_policy')]
        if 'projector_replay_only' in policies:
            return {'result': 'REFUSE', 'effects': 0, 'error': 'replay_only_not_appendable'}
    if op == 'payload':
        return {'result': 'ACCEPT' if payload_ok(c, p, x) and envelope_ok(c, d, retry=False) else 'REFUSE', 'effects': 0}
    if op in ('recover', 'publish', 'read'):
        o, r, out = d['original'], d['receipt'], d['outcome']
        if out is None or not out['committed'] or not d['backup_closure_verified']:
            return {'result': 'UNAVAILABLE', 'effects': 0}
        if (not payload_ok(c, o['payload'], d['original_context']) or not envelope_ok(c, d)
                or p != o['payload'] or out['payload'] != o['payload']
                or out['event_id'] != o['event_id'] or o['event']['payload'] != o['payload']
                or o['event']['event_id'] != o['event_id'] or o['idempotency_key'] != o['event']['idempotency_key']):
            return {'result': 'REFUSE', 'effects': 0}
        if p.get('outcome_ref', out['source_ref']) != out['source_ref']:
            return {'result': 'REFUSE', 'effects': 0}
        # Only pure retained-receipt resolution is independent of retired source
        # controls. New append recovery and publication keep the current joins.
        if not (op == 'recover' and r is not None) and not payload_ok(c, o['payload'], x):
            return {'result': 'REFUSE', 'effects': 0}
        if op in ('publish', 'read') and (not d['permission_now'] or d['source_deleted_now'] or not d['share_current']
                                         or not x['owner_command_authorized']):
            return {'result': 'REFUSE' if op == 'publish' else 'UNAVAILABLE', 'effects': 0}
        if r is None:
            if op == 'recover' and (not d['permission_now'] or d['source_deleted_now'] or not d['share_current']):
                return {'result': 'REFUSE', 'effects': 0}
            return {'result': 'APPEND_ORIGINAL' if op == 'recover' else 'PENDING', 'effects': 0, 'event_id': o['event_id']}
        if not receipt_ok(d):
            return {'result': 'REFUSE', 'effects': 0}
        if op == 'publish' and not d['receipt_retained']:
            return {'result': 'PENDING', 'effects': 0, 'event_id': o['event_id']}
        return {'result': 'ORIGINAL', 'effects': 0, 'event_id': o['event_id'], 'receipt_ref': d['receipt_ref']}
    if op in ('checkpoint', 'rebuild'):
        cp = d['checkpoint']
        if (list(validator(read(c['checkpoint_schema_ref'])).iter_errors(cp))
                or len(_codec.canonical_messagepack_bytes(cp)) > 16384):
            return {'result': 'REFUSE', 'effects': 0}
        if op == 'rebuild' and not d['retained_prefix_complete']:
            return {'result': 'UNAVAILABLE', 'effects': 0}
        token = cp['index_read_token']
        if (d['expected_previous'] != d['stored_previous'] or d['reader_installed'] != c['consumer']
                or d['reader_withdrawn'] or not d['permission_now'] or d['source_deleted_now']
                or cp['state'] != 'current' or token != d['selected_token']
                or d['live_snapshot_id'] != d['current_live_snapshot_id']
                or token['storage_instance_id'] != token['source_selection']['storage_instance_id']
                or not d['share_current'] or not envelope_ok(c, d) or not receipt_ok(d)
                or token['storage_instance_id'] != d['storage_instance_id']
                or cp.get('project_id') != p.get('project_id') or cp.get('scope') != p.get('scope')):
            return {'result': 'REFUSE', 'effects': 0}
        if cp == d['stored_previous']:
            return {'result': 'UNCHANGED', 'effects': 0}
        rows, low, high, source = d['index_rows'], d['scan_low'], d['scan_high'], d['selected_source']
        prior = d['stored_previous']
        source_rows = source['rows']
        start = source['first_sequence'] if prior is None else prior['through_sequence_id'] + 1
        if (source['storage_instance_id'] != d['storage_instance_id']
                or source['index_read_token'] != token or source['last_sequence'] != d['selected_high']
                or [r['sequence'] for r in source_rows] != list(range(source['first_sequence'], source['last_sequence'] + 1))
                or any(r['scope_partition'] != _codec.scope_partition('application' if r['scope']['kind'] == 'app' else 'project', r['scope']['project_id']) for r in source_rows)
                or low != start or rows != [r for r in source_rows if low <= r['sequence'] <= high]
                or [r['sequence'] for r in rows] != list(range(low, high + 1))
                or cp['through_sequence_id'] != high or high != d['selected_high']
                or (prior is not None and (list(validator(read(c['checkpoint_schema_ref'])).iter_errors(prior))
                    or any(prior['index_read_token'][key] != token[key]
                           for key in ('storage_instance_id', 'generation_id', 'generation_anchor_sha256'))
                    or prior.get('project_id') != cp.get('project_id') or prior.get('scope') != cp.get('scope')
                    or prior['state'] != 'current'))):
            return {'result': 'REFUSE', 'effects': 0}
        matches = [r['event_id'] for r in rows if r['event_type'] == c['event_type'] and r['scope'] == x['scope']]
        earlier = [r['event_id'] for r in source_rows if r['sequence'] < low and r['event_type'] == c['event_type'] and r['scope'] == x['scope']]
        if prior is not None and (not earlier or prior['last_event_id'] != earlier[-1]):
            return {'result': 'REFUSE', 'effects': 0}
        last = matches[-1] if matches else (prior['last_event_id'] if prior is not None else None)
        if last is None or matches != d['selected_matches'] or cp['last_event_id'] != last:
            return {'result': 'REFUSE', 'effects': 0}
        return {'result': 'ADVANCE', 'effects': 0, 'through_sequence_id': high, 'last_event_id': last}
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
            'persisted-snapshot', 'terminal-before-receipt', 'replay-only-payload',
            'replay-only-recover', 'replay-only-publish', 'replay-only-context-recovery',
            'publish-guard-permission_now', 'publish-guard-source_deleted_now',
            'publish-guard-share_current', 'publish-guard-context-owner_command_authorized',
            'initial-global-row-drop-and-low-change', 'wrong-partition-envelope',
            'token-storage-disagrees-with-event', 'full-value-commitment-corrupt',
            'zero-match-suffix-after-first-match', 'zero-match-suffix-cannot-invent-match',
            'no-checkpoint-before-first-match', 'retry-ignores-storage-sequence_id',
            'retry-ignores-storage-observed_at_utc', 'retry-ignores-storage-persisted_at_utc',
            'retry-compares-semantic-actor', 'trailing-LF-envelope-event-type', 'oversize-inline-body-refused',
            'publish-current-source-join-refused', 'append-recovery-current-source-join-refused',
            'append-recovery-guard-permission_now', 'append-recovery-guard-source_deleted_now',
            'append-recovery-guard-share_current'}

def value_valid(schema_ref, value):
    if list(validator(read(schema_ref)).iter_errors(value)):
        return False
    if len(_codec.canonical_messagepack_bytes(value)) > 16384:
        return False
    if schema_ref.endswith('dev_session_record_v2.schema.json') and value['dap'] is not None:
        dap = value['dap']
        if (value['project_id'] != dap['project_id'] or value['dev_session_id'] != dap['dev_session_id']
                or value['project_id'] != dap['topology']['project_id']
                or _debug.validate(dap, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json'))):
            return False
    return True


def migrate(kind, source, evidence):
    """Static migration oracle only. It neither opens a store nor authorizes writes."""
    if not evidence.get('verified') or not evidence.get('backup_verified'):
        return None
    if kind == 'dap_v1':
        if _debug.validate(source, 'dev_session_record', read('Plans/shared_runtime_contracts.schema.json')):
            return None
        if source['project_id'] != evidence['project_id'] or source['dev_session_id'] != evidence['dev_session_id']:
            return None
        result = {'schema_id': 'pm.storage_value.dev_session_record.v2', 'schema_version': '2.0.0',
                  'project_id': source['project_id'], 'dev_session_id': source['dev_session_id'],
                  'workflow': None, 'dap': copy.deepcopy(source)}
        return result if value_valid('Plans/ds15_dev_session_record_v2.schema.json', result) else None
    if kind == 'preview_v1':
        mappings = evidence.get('mappings', [])
        if (len(mappings) != 1 or mappings[0]['preview_id'] != source['preview_id']
                or mappings[0]['source_file'] != source['source_file'] or source['status'] not in ('starting', 'running', 'stopped', 'error')):
            return None
        result = copy.deepcopy(mappings[0]['saved_subject_ui'])
        result.update(runtime_verification='unverified', legacy_status=source['status'])
        return result if value_valid('Plans/ds15_preview_state_v2.schema.json', result) else None
    if kind == 'capture_chip':
        if (source.get('thread_id') != evidence.get('thread_id') or source.get('scope') != evidence.get('scope')):
            return None
        result = copy.deepcopy(source)
        result.update(schema_id='pm.ds15.browser_capture_chip.v2', schema_version='2.0.0')
        return result if value_valid('Plans/ds15_browser_capture_chip_v2.schema.json', result) else None
    raise AssertionError(kind)


def check_value_contracts():
    count = 0
    for f in read('Plans/ds15_value_contract_fixtures.json'):
        for case in f['cases']:
            data = copy.deepcopy(f['positive'])
            patch(data, case['changes'])
            assert value_valid(f['schema_ref'], data) == case['valid'], (f['schema_ref'], case['id'])
            count += 1
        for case in f.get('migration_cases', []):
            data = copy.deepcopy(f['migration_base'])
            patch(data, case['changes'])
            got = migrate(data['kind'], data['source'], data['evidence'])
            assert got == case['expected'], (f['schema_ref'], case['id'], got, case['expected'])
            count += 1
    return count

def main():
    shared = read('Plans/event_append_receipt_full_value_fixtures.json')
    assert commitment(shared['base_original_event'])['sha256'] == shared['commitment_sha256']
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
        assert any(i.startswith('trailing-LF-checkpoint-') for i in ids), name
        if name == 'browser.context_captured':
            assert {'application-exact-cv366-key', 'application-raw-hash-key',
                    'application-wrong-server_id', 'application-wrong-original_operation_id',
                    'project-capture-original-retry'} <= set(ids)
        for case in f['semantic_cases']:
            data = copy.deepcopy(f['semantic_base']); patch(data, case['changes'])
            got = evaluate(c, case['operation'], data)
            assert got == case['expected'], (name, case['id'], got, case['expected'])
            semantic_count += 1
    value_cases = check_value_contracts() if (ROOT / 'Plans/ds15_value_contract_fixtures.json').exists() else 0
    print(json.dumps({'status':'pass','families':len(contracts),'payload_oracles':count,'semantic_oracles':semantic_count,'value_oracles':value_cases,'native_execution':'NOT_RUN'}))

if __name__ == '__main__': main()
