#!/usr/bin/env python3
"""Static DM contract oracles. Synthetic checks; no native execution proof."""
import copy
import hashlib
import json
from datetime import datetime
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
FORMATS = FormatChecker()
@FORMATS.checks('date-time')
def utc_datetime(value):
    if not isinstance(value, str):
        return True
    try:
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
        return parsed.tzinfo is not None
    except ValueError:
        return False

ROOT = Path(__file__).resolve().parents[1]


def digest(event, instance, payload):
    return hashlib.sha256(json.dumps([event, '1.0.0', instance, payload['project_id'], payload['operation_id']], ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def semantic(payload, scope, event):
    if scope == 'project_only' and not payload['project_id']:
        return False
    if 'after_revision' in payload and payload['after_revision'] != payload['before_revision'] + 1:
        return False
    if event == 'lsp.server.lifecycle_changed' and payload['previous_state'] == payload['state']:
        return False
    return True


def read_allowed(current_token, selected_token, permission, source_present, withdrawn, version):
    return current_token == selected_token and permission and source_present and not withdrawn and version == '1.0.0'


def replay_decision(original_digest, retry_digest, original_receipt):
    if original_digest != retry_digest:
        return ('identity_conflict_without_effect', None, 0)
    return ('return_original_without_effect', original_receipt, 0)


def producer_witness_allowed(event, witness):
    required = {
        'format.applied': {'execution_mode':'HTE','formatter_exit_code':0,'beyond_whitespace':True,'original_evidence_retained':True},
        'lsp.server.lifecycle_changed': {'supervisor_edge_proven':True,'host_root_join':True,'original_observation':True},
        'model.catalog_refreshed': {'revision_published':True,'provider_status_original':True,'stale_cache_is_success':False},
        'subagent.context_rehydrated': {'source_access_current':True,'source_history_preserved':True,'source_present':True,'child_identity_join':True},
        'subagent.context_shrunk': {'immune_block_touched':False,'protected_working_set_touched':False,'source_history_preserved':True,'shorter_effective_block':True,'child_identity_join':True},
        'project.added': {'atomic_registration_readback':True,'permission_and_handoffs_committed':True,'temporary_mount_only':False,'semantic_action':'existing_content'},
        'project.created': {'atomic_registration_readback':True,'permission_and_handoffs_committed':True,'remote_effect_unknown':False,'semantic_action':'new_creation'},
        'git.clone.completed': {'scm_backend':'git','terminal_result':'succeeded','destination_verified':True,'terminal_receipt_original':True,'reserved_lineage_join':True},
    }[event]
    return witness == required


def main():
    fixtures = json.loads((ROOT / 'Plans/small_owner_event_fixtures.json').read_text())
    count = 0
    for row in fixtures['families']:
        event = row['event_type']
        schema = json.loads((ROOT / row['schema']).read_text())
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema, format_checker=FORMATS)
        payload = row['positive_payload']
        assert validator.is_valid(payload), (event, list(validator.iter_errors(payload)))
        assert semantic(payload, row['scope_policy'], event)
        count += 2
        # Every required field and every root extension has an explicit negative.
        for key in schema['required']:
            bad = copy.deepcopy(payload)
            del bad[key]
            assert not validator.is_valid(bad), (event, key)
            count += 1
        bad = dict(payload, unexpected='secret')
        assert not validator.is_valid(bad)
        bad = dict(payload, schema_version='9.0.0')
        assert not validator.is_valid(bad)
        count += 2
        for key in ['timestamp', 'ts', 'completed_at_utc', 'occurred_at_utc']:
            if key in payload:
                assert not validator.is_valid(dict(payload, **{key: 'not-a-date'}))
                count += 1
        original = digest(event, 'store-1', payload)
        assert original == digest(event, 'store-1', copy.deepcopy(payload))
        assert original != digest(event, 'store-2', payload)
        assert original != digest(event, 'store-1', dict(payload, operation_id='other'))
        assert original != digest(event, 'store-1', dict(payload, project_id='other-project'))
        count += 4
        if 'after_revision' in payload:
            assert not semantic(dict(payload, after_revision=payload['before_revision']), row['scope_policy'], event)
            count += 1
        if event == 'lsp.server.lifecycle_changed':
            assert not semantic(dict(payload, state=payload['previous_state']), row['scope_policy'], event)
            count += 1
        assert producer_witness_allowed(event, row['producer_witness_positive'])
        count += 1
        for case in row['producer_witness_negatives']:
            assert not producer_witness_allowed(event, case['witness'])
            count += 1
        for case in row['retry_cases']:
            decision, receipt, effects = replay_decision(case['original_semantic_digest'], case['retry_semantic_digest'], case['original_receipt_ref'])
            assert decision == case['expected'] and effects == 0
            assert receipt == (case['original_receipt_ref'] if decision == 'return_original_without_effect' else None)
            count += 2
        # Each exact family has independent read-fence vectors, no sibling credit.
        assert read_allowed('current', 'current', True, True, False, '1.0.0')
        for vector in [('new','old',True,True,False,'1.0.0'), ('c','c',False,True,False,'1.0.0'), ('c','c',True,False,False,'1.0.0'), ('c','c',True,True,True,'1.0.0'), ('c','c',True,True,False,'2.0.0')]:
            assert not read_allowed(*vector)
        count += 6
        print(event + ': static schema/identity/read-fence vectors PASS; native NOT_RUN')
    print(json.dumps({'status': 'PASS', 'assertions': count, 'native_execution': 'NOT_RUN'}))


if __name__ == '__main__':
    main()
