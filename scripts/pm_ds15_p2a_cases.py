#!/usr/bin/env python3
"""Sweep part 2A witnesses for DS15 guard-table rows that had no single-row negative.

Usage: python3 scripts/pm_ds15_p2a_cases.py --write   (write Plans/ds15_p2a_cases.json from CASES)
       python3 scripts/pm_ds15_p2a_cases.py --check   (file current; every witness refused at its own row)

Each witness starts from a named valid parent of its own family (a semantic case, a deck-2 base, a
policy case or a value fixture), changes one fact, and moves every copy that observes that fact
(the browser owner record and its hashes, the deck-2 owner record text, the CAS copy of a prior
checkpoint, the derived references of a prior read token). Run through the complete checker, it
must be refused, and its FIRST refusal must be exactly its target row; the semantic CLI checks it.
"""
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'Plans/ds15_p2a_cases.json'
SURROGATE = '\ud800'
LONG = 'x' * 17000

# (id, family, parent, op, changes, maintain, target, extra)
#   parent: ('sem', case id) | ('deck2', base) | ('policy', case id) | ('value', schema ref) | ('pred', target, case id)
#   changes: {slash path: value}; '$delete' deletes; '$root' replaces the whole input
#   maintain: 'owner_record' (16: record_changes then refresh), 'source' (refresh the browser source hashes),
#             'cas' (expected_previous = stored_previous), 'prior_refs' (prior token key/ref/dataset),
#             'deck2_record' (record_changes into the deck-2 owner record text)
CASES = [
    # evaluate entry
    ('EV01-input-array', 'live.step.updated', ('sem', 'valid-transition'), 'payload', {'$root': []}, [], 'EV01_input_object', {}),
    ('EV02-context-array', 'live.step.updated', ('sem', 'valid-transition'), 'payload', {'context': []}, [], 'EV02_context_object', {}),
    ('EV03-payload-string', 'live.step.updated', ('sem', 'valid-transition'), 'payload', {'payload': 'payload'}, [], 'EV03_payload_object', {}),
    # replay policy, one record each
    ('RO02-original-replay-only', 'live.step.updated', ('sem', 'valid-transition'), 'payload',
     {'original/event/replay_policy': 'projector_replay_only'}, [], 'RO02_original_policy', {}),
    ('RO03-carrier-replay-only', 'live.step.updated', ('sem', 'valid-transition'), 'payload',
     {'replay_policy': 'projector_replay_only'}, [], 'RO03_carrier_policy', {}),
    ('RO05-context-envelope-replay-only', 'live.step.updated', ('sem', 'valid-transition'), 'payload',
     {'context/envelope_replay_policy': 'projector_replay_only'}, [], 'RO05_context_envelope_policy', {}),
    # retained owner outcome, original copies, receipt copy, retry identity
    ('OD01-outcome-integral-float', 'live.step.updated', ('sem', 'original-retry'), 'recover',
     {'outcome/payload/step_revision': 1.0}, [], 'OD01_outcome_v1', {}),
    ('RC02-result-receipt-copy', 'live.step.updated', ('sem', 'original-retry'), 'recover',
     {'issued_result/first_append_receipt/commit_group_id': 'group:ds15:2'}, [], 'RC02_result_receipt', {}),
    ('EN16-retry-event-id', 'live.step.updated', ('sem', 'original-retry'), 'recover',
     {'envelope/event_id': 'event:live_step_updated:2'}, [], 'EN16_event_id', {}),
    ('PAYLOAD_V1-original-payload-integral-float', 'live.step.updated', ('sem', 'original-retry'), 'recover',
     {'original/payload/step_revision': 1.0}, [], 'PAYLOAD_V1_numbers', {}),
    ('ORIGINAL_EVENT-original-event-integral-float', 'live.step.updated', ('sem', 'original-retry'), 'recover',
     {'original/event/payload/step_revision': 1.0}, [], 'ORIGINAL_EVENT_numbers', {}),
    ('ENVELOPE_V1-retained-envelope-integral-float', 'live.step.updated', ('sem', 'read-current'), 'read',
     {'envelope/payload/step_revision': 1.0}, [], 'ENVELOPE_V1_numbers', {}),
    ('CONTEXT_RETAINED-session-state-type', 'live.step.updated', ('sem', 'read-current'), 'read',
     {'context/session_state': 7}, [], 'CONTEXT_RETAINED_schema', {}),
    ('CONTEXT_V1-original-session-state-type', 'live.step.updated', ('sem', 'original-retry'), 'recover',
     {'original_context/session_state': 7}, [], 'CONTEXT_V1_schema', {}),
    # checkpoint value, prior checkpoint, matches
    ('CP01-checkpoint-lone-surrogate', 'browser.context_captured', ('sem', 'valid-checkpoint'), 'checkpoint_boundary',
     {'checkpoint/scope/user_id': SURROGATE}, [], 'CP01_encodable', {}),
    ('CP02-checkpoint-over-16384', 'browser.context_captured', ('sem', 'valid-checkpoint'), 'checkpoint_boundary',
     {'checkpoint/index_read_token/index_dataset_name': LONG}, [], 'CP02_size_limit', {}),
    ('PRIOR-prior-state-enum', 'browser.context_captured', ('sem', 'valid-full-prior-cas'), 'checkpoint',
     {'stored_previous/state': 'bogus'}, ['cas'], 'PRIOR_CHECKPOINT_schema', {}),
    ('CN07-prior-generation', 'browser.context_captured', ('sem', 'valid-full-prior-cas'), 'checkpoint',
     {'stored_previous/index_read_token/generation_id': 'eig_' + 'b' * 64}, ['prior_refs', 'cas'], 'CN07_prior_generation', {}),
    ('CN08-prior-anchor', 'browser.context_captured', ('sem', 'valid-full-prior-cas'), 'checkpoint',
     {'stored_previous/index_read_token/generation_anchor_sha256': 'c' * 64}, ['cas'], 'CN08_prior_anchor', {}),
    ('CN09-prior-project', 'live.step.updated', ('sem', 'valid-full-prior-cas'), 'checkpoint',
     {'stored_previous/project_id': 'other_project_id'}, ['cas'], 'CN09_prior_project', {}),
    ('CN10-prior-scope', 'browser.context_captured', ('sem', 'valid-full-prior-cas'), 'checkpoint',
     {'stored_previous/scope/user_id': 'user:2'}, ['cas'], 'CN10_prior_scope', {}),
    ('CN11-prior-not-current', 'browser.context_captured', ('sem', 'valid-full-prior-cas'), 'checkpoint',
     {'stored_previous/state': 'withdrawn'}, ['cas'], 'CN11_prior_current', {}),
    # browser application source, coherent owner record
    ('BS02-record-duplicate-key', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {}, ['record_text_duplicate'], 'BS02_record_json', {}),
    ('BS14-input-scope', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'application_source/original_input/scope/server_id': 'server:app:2'}, ['owner_record', 'source'], 'BS14_input_scope',
     {'record_changes': {'original_input_body/scope/server_id': 'server:app:2'}}),
    ('BS15-input-profile', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'application_source/original_input/profile_id': 'profile:2'}, ['owner_record', 'source'], 'BS15_input_profile',
     {'record_changes': {'original_input_body/profile_id': 'profile:2'}}),
    ('BS16-input-workspace', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'application_source/original_input/workspace_id': 'workspace:app:2'}, ['owner_record', 'source'], 'BS16_input_workspace',
     {'record_changes': {'original_input_body/workspace_id': 'workspace:app:2'}}),
    ('BS17-input-session', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'application_source/original_input/session_refs': ['browser:2']}, ['owner_record', 'source'], 'BS17_input_session',
     {'record_changes': {'original_input_body/session_refs': ['browser:2']}}),
    ('BS18-input-transition-source', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'application_source/original_input/transition_source_ref': 'capture:original:2'}, ['owner_record', 'source'],
     'BS18_input_transition_source', {'record_changes': {'original_input_body/transition_source_ref': 'capture:original:2'}}),
    ('BS21-output-scope', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'application_source/original_output/scope/server_id': 'server:app:2'}, ['owner_record', 'source'], 'BS21_output_scope',
     {'record_changes': {'original_output_body/scope/server_id': 'server:app:2'}}),
    ('BS22-output-profile', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'application_source/original_output/profile_id': 'profile:2'}, ['owner_record', 'source'], 'BS22_output_profile',
     {'record_changes': {'original_output_body/profile_id': 'profile:2'}}),
    ('BS23-output-workspace', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'application_source/original_output/workspace_id': 'workspace:app:2'}, ['owner_record', 'source'], 'BS23_output_workspace',
     {'record_changes': {'original_output_body/workspace_id': 'workspace:app:2'}}),
    ('BS25-output-transition-source', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'application_source/original_output/transition_source_ref': 'capture:original:2'}, ['owner_record', 'source'],
     'BS25_output_transition_source', {'record_changes': {'original_output_body/transition_source_ref': 'capture:original:2'}}),
    ('BS26-output-controller-evidence', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'application_source/original_output/controller_evidence/revision': 2}, ['owner_record', 'source'],
     'BS26_output_controller_evidence', {}),
    ('BS29-stage-method', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'$stage/owner_method_id': 'owner.browser.transition.application@2.0.0'}, ['owner_record', 'source'], 'BS29_stage_method', {}),
    ('BS30-stage-request', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'$stage/request_ref': 'request:2'}, ['owner_record', 'source'], 'BS30_stage_request', {}),
    ('BS31-stage-result', 'browser.context_captured', ('sem', 'valid-transition'), 'payload',
     {'$stage/result_ref': 'result:2'}, ['owner_record', 'source'], 'BS31_stage_result', {}),
    ('EA03-install-source-type', 'catalog.install.started', ('sem', 'r7-application-install-payload'), 'payload',
     {'application_source/server_id': 7, 'original/application_source/server_id': 7}, [], 'EA03_source_types', {}),
    # identity boundary
    ('ID03-application-identity-without-custody', 'browser.context_captured', ('pred', 'identity', 'valid-transition'), None,
     {'application_source': None}, [], 'ID03_application_custody', {}),
    # transitions
    ('TV11-dev-dap-unverified', 'dev.session.started', ('sem', 'valid-transition'), 'payload',
     {'context/dap_state_after': 'other', 'context/dap_transition_ref': 'dap:transition:1', 'context/dap_owner_verified': False},
     [], 'TV11_dap_owner_verified', {}),
    ('TV14-dev-link-thread', 'dev.session.started', ('sem', 'valid-transition'), 'payload',
     {'context/links/thread_id': 'thread:other'}, [], 'TV14_link_thread', {}),
    ('TV15-dev-link-tab', 'dev.session.started', ('sem', 'valid-transition'), 'payload',
     {'context/links/workspace_tab_id': 'tab:other'}, [], 'TV15_link_tab', {}),
    ('TV16-dev-link-terminal', 'dev.session.started', ('sem', 'valid-transition'), 'payload',
     {'context/links/terminal_session_id': 'terminal:other'}, [], 'TV16_link_terminal', {}),
    ('TLC04-live-summary', 'live.session.completed', ('sem', 'valid-transition'), 'payload',
     {'context/finalization/summary_ref': 'summary:other'}, [], 'TLC04_summary', {}),
    ('TLC05-live-checks', 'live.session.completed', ('sem', 'valid-transition'), 'payload',
     {'context/finalization/checks_ref': 'checks:other'}, [], 'TLC05_checks', {}),
    ('TP10-preview-stopped-unsettled', 'preview.session.stopped', ('sem', 'valid-transition'), 'payload',
     {'context/managed_resources_settled': False}, [], 'TP10_stopped_settled', {}),
    ('TP11-preview-refresh-state', 'preview.session.refreshed', ('sem', 'valid-transition'), 'payload',
     {'context/session_state': 'created'}, [], 'TP11_refresh_state', {}),
    ('TP12-preview-not-refreshable', 'preview.session.refreshed', ('sem', 'valid-transition'), 'payload',
     {'context/refreshable': False}, [], 'TP12_refreshable', {}),
    ('TP13-preview-refresh-uncommitted', 'preview.session.refreshed', ('sem', 'valid-transition'), 'payload',
     {'context/refresh_committed': False}, [], 'TP13_refresh_committed', {}),
    ('TP14-preview-revision', 'preview.session.refreshed', ('sem', 'valid-transition'), 'payload',
     {'context/previous_revision': 99}, [], 'TP14_revision', {}),
    ('TP18-preview-filemanager-session', 'preview.session.refreshed', ('sem', 'valid-transition'), 'payload',
     {'payload/refresh_origin': 'filemanager.preview_refresh'}, [], 'TP18_filemanager_no_session', {}),
    # cp_matches: a prior checkpoint with no earlier match
    ('CE01-prior-without-earlier-match', 'browser.context_captured', ('sem', 'valid-full-prior-cas'), 'checkpoint',
     {'selected_source/rows/0/event_type': 'other.event'}, [], 'CE01_prior_earlier', {}),
    # stored values
    ('VV01-value-lone-surrogate', 'shared', ('value', 'Plans/ds15_browser_capture_chip_v2.schema.json'), None,
     {'value/scope/user_id': SURROGATE}, [], 'VV01_encodable', {}),
    # deck 2
    ('DE02-original-event-type', 'catalog.update.started', ('deck2', 'project'), 'payload',
     {'original/event/event_type': 'catalog.update.completed'}, [], 'DE02_original_type', {}),
    ('DE04-envelope-policy', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {'envelope/replay_policy': 'append_once'}, [], 'DE04_envelope_dedupe', {}),
    ('DE05-original-policy', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {'original/event/replay_policy': 'append_once'}, [], 'DE05_original_dedupe', {}),
    ('DE07-envelope-project', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {'envelope/project_id': 'other_project_id'}, [], 'DE07_project', {}),
    ('DE08-envelope-payload-copy', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {'envelope/payload/target_version': '3.0.0'}, [], 'DE08_payload_copy', {}),
    ('DE09-envelope-thread', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {'envelope/thread_id': 'thread:other'}, [], 'DE09_thread', {}),
    ('DE10-envelope-run', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {'envelope/run_id': 'run:other'}, [], 'DE10_no_run', {}),
    ('DE11-context-scope', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {'context/scope/user_id': 'user:2'}, [], 'DE11_context_scope', {}),
    ('DE13-payload-lone-surrogate', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {'payload/scope/user_id': SURROGATE, 'envelope/payload/scope/user_id': SURROGATE, 'context/scope/user_id': SURROGATE},
     [], 'DE13_payload_encodable', {}),
    ('ER01-record-payload', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {}, ['deck2_record'], 'ER01_record_payload', {'record_changes': {'payload/target_version': '3.0.0'}}),
    ('ER03-record-scope', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {}, ['deck2_record'], 'ER03_record_scope', {'record_changes': {'scope/user_id': 'user:2'}}),
    ('ER04-record-original-transition', 'catalog.update.started', ('deck2', 'project'), 'recover',
     {}, ['deck2_record'], 'ER04_record_original_transition', {'record_changes': {'transition/stage': 'effective'}}),
    ('ER07-record-current-transition', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {'context/transition/stage': 'effective'}, [], 'ER07_record_current_transition', {}),
    ('ER09-application-source', 'browser.context_shared', ('deck2', 'application'), 'envelope_boundary',
     {'application_source/server_id': 'server:other'}, [], 'ER09_app_source', {}),
    ('EN06-envelope-project', 'live.step.updated', ('sem', 'valid-transition'), 'payload',
     {'envelope/project_id': 'other_project_id'}, [], 'EN06_project', {}),
    ('VV03-dap-project', 'shared', ('value', 'Plans/ds15_dev_session_record_v2.schema.json', 'workflow-and-real-subordinate-dap'), None,
     {'value/dap/project_id': 'other_project_id'}, [], 'VV03_dap_project', {}),
    ('ER08-record-operation', 'browser.context_shared', ('deck2', 'project'), 'envelope_boundary',
     {}, ['deck2_record'], 'ER08_record_operation', {'record_changes': {'original_operation_id': 'operation:other'}}),
    ('ER10-original-application-source', 'browser.context_shared', ('deck2', 'application'), 'envelope_boundary',
     {'original/application_source/server_id': 'server:other'}, [], 'ER10_app_original_source', {}),
    ('EB21-carrier-without-bank', 'catalog.update.started', ('deck2', 'project'), 'payload',
     {'owner_records': {'$delete': True}}, [], 'EB21_bank_present', {}),
    ('D2_OWNER_RECORDS-bank-value-type', 'catalog.update.started', ('deck2', 'project'), 'payload',
     {'owner_records/extra': 5}, [], 'D2_OWNER_RECORDS_schema', {}),
    ('OR02-record-invalid-json', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {}, ['deck2_record_text_invalid'], 'OR02_record_json', {}),
    ('D2_SOURCE-record-missing-member', 'catalog.update.started', ('deck2', 'project'), 'envelope_boundary',
     {}, ['deck2_record'], 'D2_SOURCE_schema', {'record_changes': {'committed': {'$delete': True}}}),
    ('D2_CONTEXT_RETAINED-session-class-type', 'catalog.update.started', ('deck2', 'project'), 'read',
     {'context/session_security_class': 7}, [], 'D2_CONTEXT_RETAINED_schema', {}),
    ('PG03-context-scope', 'catalog.update.started', ('deck2', 'project'), 'payload',
     {'context/scope/user_id': 'user:2'}, [], 'PG03_scope', {}),
    ('TS07-clone-without-source', 'tool.custom_headless.skipped', ('deck2', 'clone_new_id'), 'payload',
     {'context/transition/source_project_id': None}, [], 'TS07_fresh_source', {}),
    ('TC15-update-effective-rule', 'catalog.update.started', ('deck2', 'project'), 'payload',
     {'payload/effective_version': '2.0.0', 'context/transition/effective_version': '2.0.0'}, [], 'TC15_effective_rule', {}),
    ('CQ01-request-owner-rules', 'catalog.update.started', ('policy', None), None,
     {'transition/owner_rules_satisfied': False}, [], 'CQ01_owner_rules', {}),
    ('CQ04-request-update-not-verified', 'catalog.update.started', ('policy', None), None,
     {'transition/effective_version': '2.0.0'}, [], 'CQ04_update_verified', {}),
    ('CQ05-request-update-not-installed', 'catalog.update.started', ('policy', None), None,
     {'transition/installed_available': False}, [], 'CQ05_update_installed', {}),
    ('D2_TRANSITION-request-missing-member', 'catalog.update.started', ('policy', None), None,
     {'transition/queued': {'$delete': True}}, [], 'D2_TRANSITION_schema', {}),
]


def load_models():
    import importlib.util
    spec = importlib.util.spec_from_file_location('ds15_p2a_sixteen', ROOT / 'scripts/pm-ds15-event-contracts.py')
    m16 = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m16)
    spec = importlib.util.spec_from_file_location('ds15_p2a_deck2', ROOT / 'scripts/pm-ds15-deck2-contracts.py')
    deck = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(deck)
    return m16, deck


def set_path(model, data, path, value):
    if path == '$root':
        return copy.deepcopy(value)
    if path.startswith('$stage/'):
        for prefix in ('application_source', 'original/application_source'):
            source = data
            for key in prefix.split('/'):
                source = source[key]
            first = sorted(source['stage_custody'])[0]
            source['stage_custody'][first][path.split('/', 1)[1]] = copy.deepcopy(value)
        return data
    model.patch(data, {path: value})
    return data


def record_patch(model, text, changes):
    record = json.loads(text)
    model.patch(record, changes)
    return json.dumps(record, sort_keys=True, separators=(',', ':'), ensure_ascii=False)


def build(m16, deck, case):
    """(model, contract, operation, data) of one witness."""
    wid, family, parent, op, changes, maintain, target, extra = case
    if parent[0] == 'deck2':
        model = deck.base
        contract = next(c for c in deck.read('Plans/ds15_deck2_contracts.json') if c['event_type'] == family)
        fixture = next(f for f in deck.read('Plans/ds15_deck2_fixtures.json') if f['event_type'] == family)
        data = copy.deepcopy(fixture['bases'][parent[1]])
    elif parent[0] == 'policy':
        model = deck.base
        contract = next(c for c in deck.read('Plans/ds15_deck2_contracts.json') if c['event_type'] == family)
        fixture = next(f for f in deck.read('Plans/ds15_deck2_fixtures.json') if f['event_type'] == family)
        seed = next(z for z in fixture['policy_cases'] if z['expected'] == 'QUEUE_KEEP_VERIFIED_VERSION')
        data = {'payload': copy.deepcopy(seed['payload']), 'transition': copy.deepcopy(seed['transition'])}
    elif parent[0] == 'value':
        model, contract = m16, None
        fixture = next(f for f in m16.read('Plans/ds15_value_contract_fixtures.json') if f['schema_ref'] == parent[1])
        data = {'schema_ref': parent[1], 'value': copy.deepcopy(fixture['positive'])}
        if len(parent) > 2:
            m16.patch(data['value'], next(z for z in fixture['cases'] if z['id'] == parent[2])['changes'])
    else:
        model = m16
        contract = next(c for c in m16.read('Plans/ds15_event_contracts.json') if c['event_type'] == family)
        fixture = next(f for f in m16.read('Plans/ds15_event_contract_fixtures.json') if f['event_type'] == family)
        seed = next(z for z in fixture['semantic_cases'] if z['id'] == parent[-1])
        data = m16.semantic_input(contract, fixture, seed)
    for path, value in changes.items():
        data = set_path(model, data, path, value)
    for step in maintain:
        if step == 'cas':
            data['expected_previous'] = copy.deepcopy(data['stored_previous'])
        elif step == 'prior_refs':
            token = data['stored_previous']['index_read_token']
            key = 'event_record_index_checkpoint.v1:' + token['storage_instance_id']
            token['checkpoint_ref'] = key + '#/generations/' + token['generation_id']
            token['index_dataset_name'] = 'event_record_index.v2@' + token['generation_id']
            data['expected_previous'] = copy.deepcopy(data['stored_previous'])
        elif step == 'owner_record':
            ref = data['application_source']['accepted_source_ref']
            if extra.get('record_changes'):
                data['browser_owner_records'][ref] = record_patch(model, data['browser_owner_records'][ref], extra['record_changes'])
        elif step == 'source':
            model.refresh_browser_owner(data)
        elif step == 'record_text_duplicate':
            ref = data['application_source']['accepted_source_ref']
            text = data['browser_owner_records'][ref]
            data['browser_owner_records'][ref] = text[:-1] + ',"thread_id":"thread:duplicate"}'
        elif step in ('deck2_record', 'deck2_record_payload', 'deck2_record_text_invalid'):
            ref = data['payload']['outcome_ref']
            if step == 'deck2_record_text_invalid':
                data['owner_records'][ref] = data['owner_records'][ref][:-1]
            elif step == 'deck2_record_payload':
                data['owner_records'][ref] = record_patch(model, data['owner_records'][ref],
                                                          {'payload': copy.deepcopy(data['payload'])})
            else:
                data['owner_records'][ref] = record_patch(model, data['owner_records'][ref], extra['record_changes'])
        else:
            raise AssertionError(step)
    return model, contract, op, data


def call(m16, deck, case, model, contract, op, data):
    parent = case[2]
    if parent[0] == 'deck2':
        return lambda: deck.evaluate(contract, op, copy.deepcopy(data))
    if parent[0] == 'policy':
        return lambda: deck.catalog_request(contract, copy.deepcopy(data['payload']), copy.deepcopy(data['transition']))
    if parent[0] == 'value':
        return lambda: m16.value_valid(data['schema_ref'], copy.deepcopy(data['value']))
    if parent[0] == 'pred':
        return lambda: m16.predicate_ok(contract, parent[1], copy.deepcopy(data))
    return lambda: m16.evaluate(contract, op, copy.deepcopy(data))


def refused(result):
    if result in ('REFUSE',):
        return True
    if isinstance(result, str):
        return False
    return result is None or result is False or (isinstance(result, dict) and result.get('result') in ('REFUSE', 'UNAVAILABLE', 'PENDING'))


def first_refusal(m16, deck, case):
    model, contract, op, data = build(m16, deck, case)
    run = call(m16, deck, case, model, contract, op, data)
    records = []
    m16.RECORDER = deck.base.RECORDER = records
    try:
        result = run()
    finally:
        m16.RECORDER = deck.base.RECORDER = None
    first = next((r for r in records if r[2] is not None), None)
    return result, first


def witness_calls(m16, deck):
    """(id, family, kind, pair, call) for the guard-table suite builder, inputs built before recording."""
    out = []
    for case in fixture_cases():
        model, contract, op, data = build(m16, deck, case)
        out.append((f'p2a/{case[0]}', case[1], 'p2a', None, call(m16, deck, case, model, contract, op, data)))
    return out


def fixture_cases():
    rows = json.loads(FIXTURE.read_text())
    return [(r['id'], r['family'], tuple(r['parent']), r['operation'], r['changes'], r['maintain'], r['target'], r['extra'])
            for r in rows]


def check(m16, deck, cases):
    problems = []
    for case in cases:
        result, first = first_refusal(m16, deck, case)
        row = first[2][0] if first else None
        if not refused(result) or row != case[6]:
            problems.append({'id': case[0], 'target': case[6], 'first': [first[0], row] if first else None,
                             'result': repr(result)[:120]})
    return problems


def main():
    m16, deck = load_models()
    if '--write' in sys.argv:
        rows = [{'id': c[0], 'family': c[1], 'parent': list(c[2]), 'operation': c[3], 'changes': c[4], 'maintain': c[5],
                 'target': c[6], 'extra': c[7]} for c in CASES]
        FIXTURE.write_text(json.dumps(rows, indent=1, ensure_ascii=True) + '\n')
        print(f'wrote {len(rows)} witnesses')
    if '--explore' in sys.argv:
        for case in CASES:
            result, first = first_refusal(m16, deck, case)
            row = first[2][0] if first else None
            mark = 'OK ' if refused(result) and row == case[6] else 'MISS'
            print(mark, case[0], '->', first[0] if first else None, row, repr(result)[:80])
        return 0
    cases = fixture_cases()
    problems = check(m16, deck, cases)
    stale = json.loads(FIXTURE.read_text()) != [{'id': c[0], 'family': c[1], 'parent': list(c[2]), 'operation': c[3],
                                                 'changes': c[4], 'maintain': c[5], 'target': c[6], 'extra': c[7]}
                                                for c in json.loads(json.dumps(CASES))]
    print(json.dumps({'status': 'pass' if not problems and not stale else 'fail', 'witnesses': len(cases),
                      'stale_fixture': stale, 'problems': problems}))
    return 1 if problems or stale else 0


if __name__ == '__main__':
    sys.exit(main())
