#!/usr/bin/env python3
"""Card 5 exact-family preparation oracles. No admission or native authentication.

Guard isolation belongs to pm_guard_isolation.py in the shared sweep. This file
runs complete production predicates and single-defect fixture cases; it never
removes a guard or manufactures an authorization from a role label.
"""
import argparse
import base64
import copy
import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path
from jsonschema.exceptions import SchemaError

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('card5_existing_contracts', ROOT / 'scripts/pm-alert-event-contracts-check.py')
shared = importlib.util.module_from_spec(spec)
spec.loader.exec_module(shared)
packed = shared.packed
exact = shared.exact_value
load = shared.load

# Sweep part 2A guard tables (Method B, scripts/pm_guard_isolation.py). Table
# modules are underscore modules imported normally; witness collection stays
# in the unscanned runner (scripts/pm-dg6a-guard-tables.py). RECORDER is set
# only by that runner.
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dg6a_table_decision_citation as _decision_table  # noqa: E402
import pm_dg6a_table_storage_schema as _storage_table  # noqa: E402
import pm_dg6a_table_current_header as _current_table  # noqa: E402

_DECISION_ROWS = [(name, guard.predicate) for name, guard in _decision_table.case(None).table.guards.items()]
DECISION_RECORDER = None
_STORAGE_ROWS = [(name, guard.predicate) for name, guard in _storage_table.case(None).table.guards.items()]
STORAGE_RECORDER = None
_CURRENT_ROWS = [(name, guard.predicate) for name, guard in _current_table.case(None).table.guards.items()]
CURRENT_RECORDER = None


def digest(value):
    return hashlib.sha256(packed(value)).hexdigest()


def identity(operation, family):
    return digest([operation['storage_instance_id'], operation['project_id'], family['event_type'], operation['idempotency_key']])


def request_digest(operation):
    return digest({k: operation[k] for k in ('original_command', 'payload', 'before', 'after')})


_checked_schemas = []

def schema_errors(value, schema):
    # Eager reference closure includes branches without fixture traffic.
    if not any(schema is checked for checked in _checked_schemas):
        shared.check_schema(schema)
        _checked_schemas.append(schema)
    return list(shared.Draft202012Validator(schema).iter_errors(value))


def storage_schema_observation(registry, family, schemas, surface):
    """The storage_schema table's FIELDS for one surface row, derived only.

    Metaschema validity, reference closure and content equality are computed
    exactly as the pre-table guard computed them; the reference closure runs
    only on a metaschema-valid stored schema, as before. When the row count
    is not one there is no row to join, so every later fact is False and the
    entailed SS02-SS06 rows stay silent under SS01.
    """
    key = surface + '_schema'
    fid = family['slug'] + '_' + surface
    rows = [row for row in registry['families'] if row['family_id'] == fid]
    if len(rows) != 1:
        return fid, {field: False for field in _storage_table.FIELDS}
    row, companion = rows[0], schemas[key]
    stored = row.get('value_schema')
    try:
        shared.Draft202012Validator.check_schema(stored)
        valid = True
    except SchemaError:
        valid = False
    return fid, {
        'row_count_is_one': True,
        'companion_ref_matches': row.get('value_schema_ref') == family[key],
        'schema_id_matches': row.get('value_schema_id') == companion['$id'],
        'stored_schema_valid': valid,
        'stored_refs_resolve': bool(valid and not shared.schema_ref_errors(stored)),
        'stored_equals_companion': bool(exact(stored, companion)),
    }


def storage_schema_errors(registry, family, schemas):
    """Check the authoritative stored copies before using their validators.

    Each surface row refuses only through
    scripts/pm_dg6a_table_storage_schema.py rows, in table order; the first
    refusing row's code plus ':' + family_id is appended, exactly as the
    pre-table guard appended it before continuing to the next surface.
    """
    errors = []
    for surface in ('operation', 'checkpoint'):
        if family[surface + '_schema'] is None:
            continue  # The generic historical family declares no operation.
        fid, observed = storage_schema_observation(registry, family, schemas, surface)
        first = None
        for name, predicate in _STORAGE_ROWS:
            code = predicate(observed, None)
            if code is not None:
                first = (name, code)
                break
        if STORAGE_RECORDER is not None:
            STORAGE_RECORDER.append((fid, copy.deepcopy(observed), first))
        if first:
            errors.append(first[1] + ':' + fid)
    return errors


def storage_schema_cases(registry, family, schemas):
    """One-defect registry controls, also exercised through the complete CLI."""
    ids = {family['slug'] + '_' + surface for surface in ('operation', 'checkpoint')
           if family[surface + '_schema'] is not None}
    base = {'families': [row for row in registry['families'] if row['family_id'] in ids]}
    assert not storage_schema_errors(base, family, schemas)
    observations = [dict(name='registered_storage_schemas', stage='storage_schema', expected=[], actual=[])]
    for fid in sorted(ids):
        changes = (
            ('missing_row', 'storage_row_count', lambda rows, row: rows.remove(row)),
            ('duplicate_row', 'storage_row_count', lambda rows, row: rows.append(copy.deepcopy(row))),
            ('companion_ref', 'storage_companion_ref', lambda rows, row: row.update(value_schema_ref='Plans/foreign.schema.json')),
            ('schema_id', 'storage_schema_id', lambda rows, row: row.update(value_schema_id='pm.foreign.v1')),
            ('invalid_schema', 'storage_schema_invalid', lambda rows, row: row['value_schema'].update(type=0)),
            ('unvisited_ref', 'storage_schema_reference', lambda rows, row: row['value_schema'].setdefault('$defs', {}).update(
                registry_unvisited={'$ref': '#/$defs/registry_missing'})),
            ('open_schema', 'storage_schema_drift', lambda rows, row: row['value_schema'].update(additionalProperties=True)),
            ('embedded_identity', 'storage_schema_drift', lambda rows, row: row['value_schema'].update(**{'$id': 'pm.foreign.v1'})),
        )
        for name, refusal, change in changes:
            value = copy.deepcopy(base)
            row = next(row for row in value['families'] if row['family_id'] == fid)
            change(value['families'], row)
            expected = [refusal + ':' + fid]
            actual = storage_schema_errors(value, family, schemas)
            assert actual == expected, (family['event_type'], fid, name, actual, expected)
            observations.append(dict(name=fid + ':' + name, stage='storage_schema', expected=expected, actual=actual))
    return observations


def decision_citation_observation(manifest, family, log):
    """The decision_citation table's FIELDS, derived from the complete input.

    Derivation only computes observations; it decides no acceptance. The
    section and option text are read exactly as the pre-table guard read
    them; when the entry is not unique or the option is not a string there
    is no section text to find, so option_text_in_section is False and the
    entailed DC05 row stays silent under DC03/DC04.
    """
    heading = '### ' + family['decision'] + ': '
    unique = log.count(heading) == 1
    section = ''
    if unique:
        start = log.index(heading)
        end = log.find('\n### ', start + 1)
        section = log[start:end if end != -1 else len(log)]
    option_is_string = type(family['option_a']) is str
    return {
        'source_is_landed_log': manifest.get('decision_source') == 'Plans/Decision_Log.md',
        'branch_key_present': 'decision_branch' in manifest,
        'entry_is_unique': unique,
        'option_is_string': option_is_string,
        'option_text_in_section': bool(unique and option_is_string
                                       and '- **A (recommended):** ' + family['option_a'] + '\n' in section + '\n'),
    }


def decision_citation_errors(manifest, family, log):
    """The manifest names the landed log; the family's decision and exact option text must be there.

    Refuses only through scripts/pm_dg6a_table_decision_citation.py rows, in
    table order; the first refusing row's code is the one-element list the
    pre-table guard returned.
    """
    observed = decision_citation_observation(manifest, family, log)
    first = None
    for name, predicate in _DECISION_ROWS:
        code = predicate(observed, None)
        if code is not None:
            first = (name, code)
            break
    if DECISION_RECORDER is not None:
        DECISION_RECORDER.append((copy.deepcopy(observed), first))
    return [first[1]] if first else []


def decision_citation_cases(manifest, family, log):
    """One-defect citation controls, built from the intact manifest entry."""
    assert not decision_citation_errors(manifest, family, log)
    observations = [dict(name='decision_citation', stage='decision_citation', expected=[], actual=[])]
    foreign = next(f['decision'] for f in manifest['families'] if f['decision'] != family['decision'])
    cases = (
        ('stale_branch_source', {'decision_source': 'plans/ea-cards2-answers-20261105'}, {}, 'decision_source'),
        ('source_not_string', {'decision_source': ['Plans/Decision_Log.md']}, {}, 'decision_source'),
        ('old_branch_key_kept', {'decision_branch': 'plans/ea-cards2-answers-20261105'}, {}, 'decision_branch_retained'),
        ('unknown_decision', {}, {'decision': 'DL-99999'}, 'decision_entry'),
        ('foreign_decision', {}, {'decision': foreign}, 'decision_option_text'),
        ('changed_option_text', {}, {'option_a': family['option_a'] + ' Changed.'}, 'decision_option_text'),
        ('option_text_not_string', {}, {'option_a': [family['option_a']]}, 'decision_option_text'),
    )
    for name, manifest_change, family_change, refusal in cases:
        actual = decision_citation_errors({**manifest, **manifest_change}, {**family, **family_change}, log)
        assert actual == [refusal], (family['event_type'], name, actual)
        observations.append(dict(name='decision_citation:' + name, stage='decision_citation', expected=[refusal], actual=actual))
    return observations


def operation_guards(operation, family, schema):
    if schema_errors(operation, schema):
        return {'operation_schema': False}
    p, before, after = operation['payload'], operation['before'], operation['after']
    action = operation['original_command']['action']
    event, item = family['event_type'], family['item']
    guards = {}

    def require(name, result):
        guards[name] = result is True

    require('operation_bytes', len(packed(operation)) <= 16384)
    require('operation_identity', operation['operation_digest'] == identity(operation, family))
    require('event_identity', operation['event_id'] == 'evt_' + family['slug'] + '_' + identity(operation, family))
    require('request_digest', operation['request_digest'] == request_digest(operation))
    require('project_join', operation['project_id'] == p['project_id'])
    require('key_join', operation['idempotency_key'] == p['idempotency_key'])
    require('partition', operation['scope_partition'] == 'project~' + base64.urlsafe_b64encode(operation['project_id'].encode()).decode().rstrip('='))
    require('command_payload', exact(operation['original_command']['payload'], p))
    require('actor_join', action['actor_ref'] == p['actor_ref'])
    require('authorized', action['authorized'])
    require('source_access', action['source_access'])
    require('currentness', action['current'])
    require('allowed_transition', action['transition_allowed'])
    require('existing_approvals', action['existing_approvals_satisfied'])
    require('revision_successor', p['result_revision'] == p['prior_revision'] + 1)
    require('after_revision', after['revision'] == p['result_revision'])
    require('after_ref', after['record_ref'] == p['after_record_ref'])
    require('after_project', after['project_id'] == p['project_id'])
    for name in ('owner_commit_ref', 'result_ref', 'dispatch_receipt_ref'):
        require('phase_' + name, (operation[name] is None) == (operation['state'] == 'prepared'))
    require('phase_append_ref', (operation['original_append_result_ref'] is not None) == (operation['state'] == 'settled'))
    skip_after = set()
    expected = copy.deepcopy(before) if before is not None else copy.deepcopy(after)
    expected['revision'], expected['record_ref'] = p['result_revision'], p['after_record_ref']
    if before is not None and event != 'bundle.note_created':
        require('before_revision', before['revision'] == p['prior_revision'])
        require('before_ref', before['record_ref'] == p['before_record_ref'])
        require('before_project', before['project_id'] == p['project_id'])
    if event.startswith('bundle.'):
        for field in ('bundle_id', 'doc_id', 'annotation_id', 'note_id', 'provenance_ref'):
            require('note_after_' + field, after[field] == p[field])
            if before is not None and event != 'bundle.note_created':
                require('note_before_' + field, before[field] == p[field])
        require('note_actor', action['actor_kind'] in ('controller', 'user') or (action['actor_kind'] == 'owner' and action['authorized'] is True))
        require('note_state', after['state'] == p['state'])
        if event == 'bundle.note_created':
            require('creation_absence', before is None)
            require('creation_revision', p['prior_revision'] == 0)
            require('creation_previous', p['previous_state'] is None)
            require('creation_state', p['state'] == 'open')
        else:
            require('note_previous', before['state'] == p['previous_state'])
            require('note_real_change', p['state'] != p['previous_state'])
            expected['state'] = p['state']
    else:
        require('concern_before_id', before['concern_id'] == p['concern_id'])
        require('concern_after_id', after['concern_id'] == p['concern_id'])
        require('action_ref', action['action_ref'] == p['action_ref'])
        # Worker proposals do not become a record because a worker is assigned.
        require('worker_proposal_only', action['actor_kind'] != 'worker')
        if item == '5.c':
            require('recorder', action['actor_kind'] in ('user', 'controller'))
        elif item == '5.e':
            require('recorder', action['actor_ref'] == before['owner_ref'])
            require('reopen_state', before['state'] in ('resolved', 'dismissed'))
            require('reopen_evidence', action['evidence_changed'])
            require('reopen_terminal', action['prior_terminal_ref'] is not None)
            expected['state'] = 'active'
        else:
            require('recorder', action['actor_kind'] == 'controller')
        require('recorder_area', action['area_ref'] == before['area_ref'])
        transfer = (before['owner_ref'], before['owner_kind']) != (after['owner_ref'], after['owner_kind'])
        area_changed = before['area_ref'] != after['area_ref']
        wider = action['wider_scope']
        require('widening_area', not wider or area_changed)
        if item == '5.b':
            require('assignment_change', transfer)
            require('old_owner', action['old_owner_ref'] == before['owner_ref'])
            require('new_owner', action['new_owner_ref'] == after['owner_ref'])
            expected['owner_ref'], expected['owner_kind'] = after['owner_ref'], after['owner_kind']
            skip_after.update(('owner_ref', 'owner_kind'))
            expected['area_ref'] = after['area_ref']
            skip_after.add('area_ref')
        if item == '5.d':
            require('promotion_change', wider)
        if item == '5.b' or (item in ('5.d', '5.f') and transfer):
            if item != '5.b':
                require('old_owner', action['old_owner_ref'] == before['owner_ref'])
                require('new_owner', action['new_owner_ref'] == after['owner_ref'])
            if area_changed:
                approval, acceptance = action['outgoing_approval'], action['receiving_acceptance']
                for prefix, confirmation in [('outgoing', approval), ('receiving', acceptance)]:
                    require(prefix + '_present', confirmation is not None)
                    if confirmation is not None:
                        require(prefix + '_explicit', confirmation['explicit'])
                        require(prefix + '_permission', confirmation['permission_allowed'])
                        require(prefix + '_action', confirmation['action_ref'] == action['action_ref'])
                        require(prefix + '_separate', confirmation['evidence_ref'] != action['action_ref'])
                        require(prefix + '_role', confirmation['role'] == ('outgoing_human' if prefix == 'outgoing' else 'receiving_owner'))
                        require(prefix + '_decision', confirmation['decision'] == ('approved' if prefix == 'outgoing' else 'accepted'))
                        require(prefix + '_area', confirmation['area_ref'] == (before['area_ref'] if prefix == 'outgoing' else after['area_ref']))
                        if prefix == 'outgoing':
                            require('outgoing_human', confirmation['actor_kind'] == 'human')
                if acceptance is not None:
                    require('receiving_identity', acceptance['actor_ref'] == after['owner_ref'])
            if item != '5.b':
                require('linked_transfer', action['transfer_evidence_ref'] is not None)
                expected['owner_ref'], expected['owner_kind'] = after['owner_ref'], after['owner_kind']
                skip_after.update(('owner_ref', 'owner_kind', 'area_ref'))
                expected['area_ref'] = after['area_ref']
        if item == '5.d' or (item in ('5.b', '5.f') and wider):
            require('promotion_evidence', action['promotion_evidence_ref'] is not None)
            require('promotion_approvals', action['promotion_approvals_satisfied'])
            expected['area_ref'] = after['area_ref']
            skip_after.add('area_ref')
        if item == '5.c':
            require('evidence_nonempty', len(action['evidence_refs']) > 0)
            expected['evidence_refs'] = before['evidence_refs'] + [x for x in action['evidence_refs'] if x not in before['evidence_refs']]
            if action['evidence_refs']:
                require('evidence_real_change', expected['evidence_refs'] != before['evidence_refs'])
        if item in ('5.d', '5.e', '5.f', '5.g'):
            require('current_evidence_nonempty', len(action['evidence_refs']) > 0)
        if item == '5.f':
            kind = action['resolution_kind']
            require('resolution_kind', kind is not None)
            require('resolution_state', before['state'] in ('active', 'acknowledged'))
            require('resolution_evidence', action['evidence_changed'])
            expected['state'] = 'resolved'
            if kind == 'accepted_risk':
                decision = action['risk_decision']
                require('risk_human_present', decision is not None)
                if decision is not None:
                    require('risk_human_role', decision['role'] == 'authorized_human')
                    require('risk_human_kind', decision['actor_kind'] == 'human')
                    require('risk_human_action', decision['action_ref'] == action['action_ref'])
                    require('risk_human_explicit', decision['explicit'])
                    require('risk_human_permission', decision['permission_allowed'])
                    require('risk_human_decision', decision['decision'] == 'approved')
                    require('risk_human_area', decision['area_ref'] == before['area_ref'])
                require('remaining_risk', action['remaining_risk_ref'] is not None)
            if kind in ('superseded', 'merged', 'split'):
                require('guided_lineage', action['lineage_action_ref'] is not None)
                require('lineage_preserved', all(x in after['lineage_refs'] for x in before['lineage_refs']))
                require('lineage_link', len(after['lineage_refs']) > len(before['lineage_refs']))
                expected['lineage_refs'] = after['lineage_refs']
                skip_after.add('lineage_refs')
        if item == '5.g':
            patch = action['patch']
            require('assessment_nonempty', any(v is not None for v in patch.values()))
            for field, value in patch.items():
                if value is not None:
                    expected[field] = value
            if any(v is not None for v in patch.values()):
                require('assessment_real_change', any(before[k] != expected[k] for k in patch))
        for field, value in expected.items():
            if field in ('revision', 'record_ref', 'project_id', 'concern_id') or field in skip_after or (item in ('5.d', '5.f') and field in ('owner_ref', 'owner_kind')):
                continue
            require('after_' + field, exact(after[field], value))
    return guards


def failed(guards):
    return [name for name, valid in guards.items() if not valid]


def current_header_observation(context, family):
    """The current_header table's FIELDS, derived from (family, context) only.

    Context reads use .get: the HISTORICAL_ONLY family's current contexts
    carry no admitted key (the pre-table chain returned at CU01 before
    reading it), and a missing key is the False fact either way.
    """
    return {
        'disposition_is_historical_only': bool(family['disposition'] == 'HISTORICAL_ONLY'),
        'policy_is_replay_only': bool(context.get('replay_policy') == 'projector_replay_only'),
        'policy_is_dedupe': bool(context.get('replay_policy') == 'dedupe_by_idempotency_key'),
        'admitted_is_true': context.get('admitted') is True,
    }


def current_errors(operation, context, family, schema):
    # The opening chain refuses only through
    # scripts/pm_dg6a_table_current_header.py rows, in table order; neither
    # retries nor normal appends may request a replay-only writer policy.
    observed = current_header_observation(context, family)
    first = None
    for name, predicate in _CURRENT_ROWS:
        code = predicate(observed, None)
        if code is not None:
            first = (name, code)
            break
    if CURRENT_RECORDER is not None:
        CURRENT_RECORDER.append((copy.deepcopy(observed), first))
    if first:
        return [first[1]]
    errors = failed(operation_guards(operation, family, schema))
    if errors:
        return errors
    for key in ('authority_verified', 'permission_allowed', 'source_retained', 'owner_commit_verified'):
        if context[key] is not True:
            errors.append(key)
    for key, value in [('authenticated_action', operation['original_command']['action']),
                       ('canonical_before', operation['before']),
                       ('committed_after', operation['after'])]:
        if not exact(context[key], value):
            errors.append(key)
    for key in ('owner_commit_ref', 'result_ref', 'dispatch_receipt_ref'):
        if not exact(context['commit_refs'][key], operation[key]):
            errors.append('original_' + key)
    if not exact(context['retry_body'], operation['original_command']):
        errors.append('idempotency_conflict')
    if operation['state'] != 'prepared':
        errors += shared.append_result_errors(operation, context['append_resolution'], context['append_original'], family['event_type'])
    return errors


def history_page(request, expected, family, payload_schemas, cp_schema):
    if family['disposition'] == 'HISTORICAL_ONLY':
        mapping = request.get('mapping')
        original = expected.get('mapping_original')
        if type(mapping) is not dict or type(original) is not dict:
            raise shared.HistoryUnavailable(['mapping_shape'])
        errors = mapping_errors(mapping, original)
        if errors:
            raise shared.HistoryUnavailable(errors)
        payload = expected['event']['payload']
        for key in ('original_event_ref', 'bundle_id', 'doc_id', 'annotation_id', 'note_id', 'provenance_ref'):
            if not exact(original[key], payload[key]):
                errors.append('mapping_payload_' + key)
        if payload['original_event_ref'] != expected['event']['event_ref']:
            errors.append('mapping_original_event')
        for phase, revision, state, record in [('before', 'prior_revision', 'previous_state', 'before_record_ref'),
                                               ('after', 'result_revision', 'state', 'after_record_ref')]:
            snapshot = original[phase]
            values = {'revision': payload[revision], 'state': payload[state], 'record_ref': payload[record]}
            values.update({key: payload[key] for key in ('project_id', 'bundle_id', 'doc_id', 'annotation_id', 'note_id', 'provenance_ref')})
            if snapshot is None:
                if not (phase == 'before' and payload[revision] == 0 and payload[state] is None and payload[record] is None):
                    errors.append('mapping_absent_before')
            else:
                for key, value in values.items():
                    if not exact(snapshot.get(key), value):
                        errors.append('mapping_' + phase + '_' + key)
        if errors:
            raise shared.HistoryUnavailable(errors)
    return shared.historical_page(request, expected, payload_schemas, cp_schema, shared.checkpoint_errors, family['event_type'])


def mapping_errors(mapping, original):
    """Deterministic read classification, never a rewritten or re-emitted event."""
    mapping_fields = {'original_event_ref', 'bundle_id', 'doc_id', 'annotation_id',
                      'note_id', 'provenance_ref', 'mapped_kind'}
    original_fields = mapping_fields - {'mapped_kind'} | {'proof_verified', 'owner_approved', 'ambiguous', 'before', 'after'}
    if type(mapping) is not dict or set(mapping) != mapping_fields or type(original) is not dict or set(original) != original_fields:
        return ['mapping_shape']
    if (type(original['after']) is not dict or 'state' not in original['after'] or
            (original['before'] is not None and
             (type(original['before']) is not dict or 'state' not in original['before']))):
        return ['mapping_shape']
    errors = []
    for key in ('original_event_ref', 'bundle_id', 'doc_id', 'annotation_id', 'note_id', 'provenance_ref'):
        if not exact(mapping[key], original[key]):
            errors.append('mapping_' + key)
    if original['proof_verified'] is not True:
        errors.append('mapping_proof')
    if original['owner_approved'] is not True:
        errors.append('mapping_approval')
    if original['ambiguous'] is not False:
        errors.append('mapping_ambiguous')
    kind = 'creation' if original['before'] is None else 'status_change'
    if mapping['mapped_kind'] != kind:
        errors.append('mapping_kind')
    if kind == 'status_change' and original['before']['state'] == original['after']['state']:
        errors.append('mapping_no_change')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', required=True)
    parser.add_argument('--output')
    parser.add_argument('--failure-exit-probe', type=int)
    args = parser.parse_args()
    if args.failure_exit_probe is not None:
        assert args.failure_exit_probe == 1, 'failure oracle rejected success exit code'
        return
    manifest = load('Plans/card5_event_contracts/manifest.json')
    family = next(f for f in manifest['families'] if f['event_type'] == args.family)
    fixture = load(family['fixture'])
    schemas = {k: load(family[k]) for k in ('payload_schema', 'checkpoint_schema')}
    if family['operation_schema']:
        schemas['operation_schema'] = load(family['operation_schema'])
    for schema in schemas.values():
        shared.check_schema(schema)
    registry = load('Plans/storage_value_registry.json')
    errors = storage_schema_errors(registry, family, schemas)
    assert not errors, errors
    observations = storage_schema_cases(registry, family, schemas)
    observations += decision_citation_cases(manifest, family, (ROOT / 'Plans/Decision_Log.md').read_text())
    # Run the value oracles on the registered schemas whose exact companion
    # identity/content, metaschema and eager reference closure were just checked.
    for surface in ('operation', 'checkpoint'):
        if family[surface + '_schema'] is not None:
            row = next(row for row in registry['families'] if row['family_id'] == family['slug'] + '_' + surface)
            schemas[surface + '_schema'] = row['value_schema']
    for case in fixture['cases']:
        stage = case['stage']
        value = copy.deepcopy(fixture['bases'][case['base']])
        for patch in case['patches']:
            if not patch['path']:
                value = copy.deepcopy(patch['value'])
                continue
            target = value
            for part in patch['path'][:-1]:
                target = target[part]
            target[patch['path'][-1]] = copy.deepcopy(patch['value'])
        if stage == 'operation':
            actual = failed(operation_guards(value, family, schemas['operation_schema']))
        elif stage == 'current':
            actual = current_errors(value['operation'], value['context'], family, schemas.get('operation_schema'))
        elif stage == 'mapping':
            actual = mapping_errors(value['mapping'], value['original'])
        elif stage == 'history':
            payload_schemas = {(schemas['payload_schema']['$id'], family['version']): schemas['payload_schema']}
            if family['event_type'].startswith('concern.'):
                legacy = load('Plans/event_payloads/concern/' + family['slug'] + '.schema.json')
                shared.check_schema(legacy)
                payload_schemas[(legacy['$id'], '1.0.0')] = legacy
            try:
                history_page(value['request'], value['expected'], family, payload_schemas, schemas['checkpoint_schema'])
            except shared.HistoryUnavailable as error:
                actual = error.guards
            except ValueError:
                actual = ['page_bounds']
            else:
                actual = []
        elif stage == 'payload':
            actual = ['payload_schema'] if schema_errors(value, schemas['payload_schema']) else []
        elif stage == 'schema':
            actual = ['schema_reference'] if shared.schema_ref_errors(value) else []
        elif stage == 'schema_field':
            node = schemas[value['surface']]
            for part in value['schema_path']:
                node = node[part]
            actual = ['schema_field'] if schema_errors(value['input'], node) else []
        elif stage == 'failure_exit':
            proc = subprocess.run([sys.executable, str(Path(__file__)), '--family', family['event_type'],
                                   '--failure-exit-probe', str(value)], capture_output=True)
            actual = [] if proc.returncode == case['expected_exit'] else ['failure_exit_mismatch']
        else:
            raise AssertionError('unknown stage ' + stage)
        assert actual == case['expected'], (family['event_type'], case['name'], actual, case['expected'])
        observations.append(dict(name=case['name'], stage=stage, expected=case['expected'], actual=actual))
    checkpoint = fixture['bases']['history']['request']['checkpoint']
    original = fixture['bases']['history']['expected']['event']
    boundary_count = shared.history_response_cases(checkpoint, schemas['checkpoint_schema'], family['event_type'], 'fixture', original)
    events = [dict(sequence_id=i + 1, event_type=family['event_type'], project_id='fixture', event_ref='pmref:event:e' + str(i)) for i in range(1000)]
    cursor, refs = 0, []
    while cursor < 1000:
        page = shared.history_page(events, family['event_type'], 'fixture', cursor, 1000,
                                   checkpoint['publication_id'], checkpoint['index_read_token'])
        assert page['after_sequence_id'] > cursor and len(packed(page)) <= 16384
        cursor = page['after_sequence_id']
        refs.extend(page['event_refs'])
    assert refs == [event['event_ref'] for event in events]
    observations.append(dict(name='complete_1000_match_traversal', expected=[], actual=[]))
    result = dict(status='pass', event_type=family['event_type'], cases=len(observations) + boundary_count, boundary_cases=boundary_count,
                  admission='ABSENT', native='NOT_RUN', isolation='PENDING_SHARED_TOOL', observations=observations)
    if args.output:
        Path(args.output).write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'observations'}, indent=2))


if __name__ == '__main__':
    main()
