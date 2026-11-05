#!/usr/bin/env python3
"""W12b whole-value migration and cancellation witnesses; TEST_ONLY.

The report distinguishes executed paths from outstanding full native tuples.
No local guard-removal engine and no native/admission/whole-family PASS.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True

from pm_goal_own_c_oracles import Suite, require, equal, Refusal, ROLES
from pm_goal_own_c_source_oracles import load_originals
from pm_goal_own_c3_w12b_roots import Roots, CANCEL, BINDING
from pm_goal_own_c3_w12b_migration import MigrationBoundary, OriginalOwner
from pm_goal_own_c3_w12b_cancel import CancellationGraph, OriginalAppendOwner


def replace_candidate_fact(values, target, replacement, hash_value):
    """Change one fixture fact, carrying every internal copy and digest with it.

    Uses the already selected original recipe. This is fixture construction,
    not a guard-cut tool, validator, authority source or product serializer.
    """
    replacements = {}
    def visit(value):
        if equal(value, target):
            output = copy.deepcopy(replacement)
        elif type(value) is dict:
            output = {k: visit(v) for k, v in value.items()}
        elif type(value) is list:
            output = [visit(v) for v in value]
        elif type(value) is str:
            output = replacements.get(value, value)
        else:
            output = value
        if not equal(output, value) and type(value) in (dict, list):
            before, after = hash_value(value), hash_value(output)
            if type(before) is str:
                before, after = [before], [after]
            replacements.update(zip(before, after))
        return output
    old = copy.deepcopy(values)
    changed = visit(old)
    while True:
        before = copy.deepcopy(changed)
        changed = visit(changed)
        if equal(before, changed):
            break
    values.clear()
    values.update(changed)


def cancellation_hashes(owner, value):
    hashes = [owner.hash(value)]
    if type(value) is dict:
        schema = value.get('schema_id')
        if schema == 'pm.goal.cancel.stop_intent.v1':
            hashes.append(owner.intent_hash(value))
        names = {'pm.goal.cancel.source_audit.v1': 'SourceAudit', 'pm.goal.cancel.stop_control.v1': 'StopControl',
            'pm.goal.cancel.stop_receipt.v1': 'StopReceipt', 'pm.goal.cancel.receipt.v1': 'CancellationReceipt',
            'pm.goal.body_control.v2': 'BodyControlV2', 'pm.goal.cancel.progress.v1': 'Progress'}
        if schema in names:
            hashes.append(owner.row_hash(names[schema], value))
        if schema == 'pm.goal.cancel.result.v2':
            hashes.append(owner.result_hash(value))
    return hashes


def execute(roots, inputs, codec, suite, artifacts):
    def migration():
        return MigrationBoundary(roots, codec, inputs)

    def enrolled():
        boundary = migration()
        request, fence = boundary.capture(boundary.selector())
        boundary.commit(request, fence)
        return boundary

    def graph(phase=None):
        value = CancellationGraph(enrolled())
        if phase:
            value.run_to(phase)
        return value

    def installed_witness():
        boundary = migration()
        request, fence = boundary.capture(boundary.selector())
        boundary.commit(request, fence)
        result = boundary.read_result(boundary.selector())
        names = {codec.storage_unpack(boundary.cells[s['physical_key']])['schema_id'] for s in result['published_members']}
        require('oracle/complete_destination_members', len(names) == 7)
        require('oracle/one_atomic_transaction', len(boundary.transactions) == 1)
        require('oracle/original_stop_preserved', result['original_stop'] == dict(user_stop_epoch=7, continuation_epoch=11, stop_latched=True))
        artifacts['migration_no_association'] = dict(capture=request, result=result, transactions=boundary.transactions,
            cells={k: {'raw_hex': v.hex()} for k, v in boundary.cells.items()})
    suite.case('M12/complete_no_association_destination', installed_witness)

    for role in ROLES:
        def missing(r=role):
            boundary = migration()
            boundary.owners[r].available = False
            boundary.capture(boundary.selector())
        suite.case('M12/database/' + role, missing, 'M12/database/' + role)
        def substituted(r=role):
            boundary = migration()
            boundary.owners[r] = OriginalOwner(boundary, r)
            boundary.capture(boundary.selector())
        suite.case('M12/substituted_participant/' + role, substituted, 'M12/owner_identity/' + role)
        for field in ('epoch',):
            def drift(r=role, f=field):
                boundary = migration()
                request, fence = boundary.capture(boundary.selector())
                def helper(owner, values):
                    current = getattr(owner.owners[r], f)
                    setattr(owner.owners[r], f, current + 1)
                boundary.commit(request, fence, helper)
            suite.case('M12/final/' + role + '/' + field, drift, 'M12/fence/' + role + '/' + field)
    for field in ('root_epoch', 'restore_epoch', 'hold_epoch'):
        for wrong in (True, '1', None, [], {}):
            def wrong_type(f=field, w=wrong):
                boundary = migration()
                request, fence = boundary.capture(boundary.selector())
                boundary.commit(request, fence, lambda owner, values: setattr(owner, f, w))
            suite.case('M12/type/' + field + '/' + repr(wrong), wrong_type, 'M12/type/' + field)
        def epoch_drift(f=field):
            boundary = migration()
            request, fence = boundary.capture(boundary.selector())
            boundary.commit(request, fence, lambda owner, values: setattr(owner, f, getattr(owner, f) + 1))
        suite.case('M12/epoch/' + field, epoch_drift, 'M12/fence/' + field)
    for flag, guard in [('permission', 'M12/permission'), ('content_available', 'M12/content'), ('withdrawn', 'M12/withdrawn')]:
        def flag_drift(f=flag):
            boundary = migration()
            request, fence = boundary.capture(boundary.selector())
            boundary.commit(request, fence, lambda owner, values: setattr(owner, f, f == 'withdrawn'))
        suite.case('M12/final/' + flag, flag_drift, guard)
    for field in ('native_dispatch', 'writers'):
        def dispatch_drift(f=field):
            boundary = migration()
            request, fence = boundary.capture(boundary.selector())
            boundary.commit(request, fence, lambda owner, values: getattr(owner, f).pop())
        suite.case('M12/dispatch_drift/' + field, dispatch_drift, 'M12/dispatch' if field == 'native_dispatch' else 'M12/registered_writers')
    def unlisted_writer():
        boundary = migration()
        boundary.native_dispatch.append(dict(boundary.native_dispatch[0], native_handler_id='TEST_ONLY:unlisted-adapter'))
        boundary.capture(boundary.selector())
    suite.case('M12/unlisted_native_writer', unlisted_writer, 'M12/all_native_writers')
    def both_rosters_incomplete():
        boundary = migration()
        boundary.writers.pop()
        boundary.native_dispatch.pop()
        boundary.capture(boundary.selector())
    suite.case('M12/missing_writer_category', both_rosters_incomplete, 'M12/seven_categories')
    def splice():
        boundary = migration()
        request, fence = boundary.capture(boundary.selector())
        def helper(owner, values):
            key = next(k for k, v in values.items() if v.get('schema_id') == 'pm.storage_value.goal_execution_binding_revision.v1')
            target = copy.deepcopy(values[key])
            replacement = copy.deepcopy(target)
            replacement['record']['host_execution_owner_ref'] = 'TEST_ONLY:substituted-host'
            replace_candidate_fact(values, target, replacement, lambda value: hashlib.sha256(codec.storage_pack(value)).hexdigest())
            parts = sorted([v for v in values.values() if 'whole_manifest_sha256' in v], key=lambda v: v['ordinal'])
            manifest = [m for part in parts for m in part['members']]
            commitment = hashlib.sha256(codec.storage_pack(manifest)).hexdigest()
            for part in parts:
                part['whole_manifest_sha256'] = commitment
        boundary.commit(request, fence, helper)
    suite.case('M12/complete_destination_splice', splice, 'M12/whole_candidate')
    def concurrent_stop():
        boundary = migration()
        request, fence = boundary.capture(boundary.selector())
        boundary.commit(request, fence, lambda owner, values: owner.advance_original_stop())
    suite.case('M12/concurrent_original_stop', concurrent_stop, 'M12/effective_stop')
    def recapture_stop():
        boundary = migration()
        boundary.advance_original_stop()
        request, fence = boundary.capture(boundary.selector())
        result = boundary.commit(request, fence)
        require('oracle/recaptured_original_stop', result['original_stop'] == dict(user_stop_epoch=8, continuation_epoch=12, stop_latched=True))
    suite.case('M12/recapture_newer_original_stop', recapture_stop)
    def mismatched_native_snapshot():
        boundary = migration()
        boundary.original_snapshot['body']['state'] = 'paused'
        boundary.original_snapshot['body']['currentness_hash'] = codec.native_goal.hashbody(boundary.original_snapshot['body'])
        boundary.original_snapshot['control']['currentness_hash'] = boundary.original_snapshot['body']['currentness_hash']
        boundary.original_snapshot['control']['body_sha256'] = codec.native_goal.bytehash(boundary.original_snapshot['body'])
        codec.native_goal.validate_snapshot(boundary.original_snapshot)
        request, fence = boundary.capture(boundary.selector())
        boundary.commit(request, fence)
    suite.case('M12/coherent_snapshot_substitution', mismatched_native_snapshot, 'M12/native_goal_image_join')
    for phase in ('before', 'after'):
        def interrupted(p=phase):
            boundary = migration()
            request, fence = boundary.capture(boundary.selector())
            try:
                boundary.commit(request, fence, fault=p)
            except Refusal as error:
                require('oracle/migration_fault', str(error) == ('M12/before_commit' if p == 'before' else 'M12/lost_ack'))
            else:
                raise AssertionError('fault did not refuse')
            if p == 'before':
                require('oracle/no_partial_installation', boundary.cells == {} and boundary.results == {} and boundary.transactions == [])
                boundary.commit(request, fence)
            else:
                boundary.recover(boundary.selector())
                boundary.commit(request, fence)
            require('oracle/one_installation_after_recovery', len(boundary.transactions) == 1)
        suite.case('M12/crash_' + phase, interrupted)
    def disposed_old_sources():
        boundary = enrolled()
        for owner in boundary.owners.values():
            owner.rows.clear()
            owner.origins.clear()
        boundary.recover(boundary.selector())
    suite.case('M12/recovery_without_old_mutable_sources', disposed_old_sources)
    def pending_unknown():
        boundary = migration()
        boundary.owners['workflow'].pending['TEST_ONLY:unknown-original-operation'] = 'unknown'
        request, fence = boundary.capture(boundary.selector())
        result = boundary.commit(request, fence)
        require('oracle/pending_preserved', result['disposition'] == 'blocked_unresolved' and result['pending_operation_ids'] == ['TEST_ONLY:unknown-original-operation'])
        require('oracle/no_enrollment_on_unknown', not result['published_members'])
        boundary.recover(boundary.selector())
    suite.case('M12/blocked_unknown_preserved', pending_unknown)
    def withdrawal():
        boundary = enrolled()
        original = copy.deepcopy(boundary.results)
        stop = copy.deepcopy(boundary.stop)
        boundary.withdraw(boundary.selector())
        require('oracle/withdrawal_preserves_original', equal(boundary.results, original) and equal(boundary.stop, stop))
        boundary.read_result(boundary.selector())
        try:
            boundary.capture(boundary.selector())
        except Refusal as error:
            require('oracle/withdrawal_blocks_capture', str(error) == 'M12/withdrawn')
        else:
            raise AssertionError('withdrawal permitted capture')
    suite.case('M12/withdrawn_current_retained_original', withdrawal)
    def replaced_result():
        boundary = enrolled()
        result = copy.deepcopy(boundary.results[boundary.migration_id])
        result['original_stop']['user_stop_epoch'] = 0
        boundary.results[boundary.migration_id] = result
        key = next(k for k in boundary.cells if k.startswith('goal_binding_migration_result.v1:'))
        boundary.cells[key] = codec.storage_pack(result)
        boundary.read_result(boundary.selector())
    suite.case('M12/coherent_unissued_result', replaced_result, 'M12/result_original_issuance')
    def replaced_root():
        boundary = enrolled()
        boundary.root = 'TEST_ONLY:foreign-native-root'
        boundary.read_result(boundary.selector())
    suite.case('M12/foreign_result_root', replaced_root, 'M12/audit_original_root')
    for guard, edit in [
        ('M12/audit_permission', lambda b: setattr(b, 'audit_permission', False)),
        ('M12/audit_fence', lambda b: setattr(b, 'restore_epoch', 2)),
        ('M12/result_bytes', lambda b: b.cells.__setitem__(next(k for k in b.cells if k.startswith('goal_binding_migration_result.')), b'x')),
        ('M12/destination_present', lambda b: b.installation_originals.pop(b.results[b.migration_id]['published_members'][0]['physical_key'])),
        ('M12/destination_hash', lambda b: b.installation_originals.__setitem__(b.results[b.migration_id]['published_members'][0]['physical_key'], b'x')),
    ]:
        def read_drift(m=edit):
            boundary = enrolled()
            boundary.read_result(boundary.selector(), m)
        suite.case('M12/result_read/' + guard, read_drift, guard)

    def complete_cancel():
        value = graph('control_published')
        terminal_values = value.finish()
        terminal = copy.deepcopy(value.terminal)
        require('oracle/terminal_original_identity', equal(terminal['response']['owner_identity'], value.identity['owner_identity'])
            and equal(terminal['outcome']['identity'], value.identity['owner_identity'])
            and terminal['response']['operation_id'] == value.operation_id
            and terminal['response']['command_outcome_ref'] == value.source['command_outcome_ref'])
        original_effects = copy.deepcopy(value.effects)
        value.replay_terminal(terminal)
        require('oracle/replay_no_effect', equal(value.effects, original_effects))
        require('oracle/cancel_preserves_body_history', equal(value.snapshot, value.migration.original_snapshot))
        require('oracle/one_stop', value.stop['user_stop_epoch'] == 8 and value.stop['continuation_epoch'] == 12)
        artifacts['cancel_no_association'] = dict(source=value.source, progress=value.progress, terminal=value.terminal,
            binding_read_current=value.binding_read, binding_selection=value.binding_selection_wrapper,
            current_stop=value.stop, current_body_control=value.control,
            current_backend={k: v.hex() for k, v in value.migration.cells.items()},
            effects=value.effects, physical={k: v.hex() for k, v in value.physical.items()},
            terminal_arguments=terminal_values,
            first_append={k: {'event': v['event'], 'raw_hex': v['raw'].hex(), 'receipt': v['receipt'], 'first_group': v['first_group']} for k, v in value.append_owner.issued.items()})
    suite.case('C12/complete_active_no_association', complete_cancel)
    phases = [('source_admitted', 'latch'), ('stop_reserved', 'commit_receipt'), ('receipt_committed', 'settle'),
              ('owners_settled', 'freeze'), ('event_issued', 'publish'), ('control_published', 'finish')]
    operations = {'latch': 'latch_and_reserve', 'commit_receipt': 'commit_receipt', 'settle': 'settle_owner', 'freeze': 'freeze_event',
                  'publish': 'publish_control', 'finish': 'terminal'}
    for phase, method in phases:
        op = operations[method]
        def candidate_splice(p=phase, m=method):
            value = graph(p)
            before = copy.deepcopy(value.effects)
            def helper(owner, candidates):
                names = {'latch': ('StopIntent', 'original_host_owner_epoch'), 'commit_receipt': ('CancellationReceipt', 'accepted_at'),
                    'settle': ('OwnerSettlement', 'original_scope_proof_ref'), 'freeze': ('ProducerInput', 'actor_ref'),
                    'publish': ('ControlPublication', 'original_transaction_ref'), 'finish': ('Terminal', 'terminal_authority_ref')}
                name, field = names[m]
                target = copy.deepcopy(candidates[name])
                replacement = copy.deepcopy(target)
                replacement[field] = (replacement[field] + 1 if field == 'original_host_owner_epoch' else
                    '2026-11-05T00:00:01Z' if field == 'accepted_at' else 'TEST_ONLY:substituted-original')
                replace_candidate_fact(candidates, target, replacement, lambda v: cancellation_hashes(owner, v))
            try:
                getattr(value, m)(helper=helper)
            finally:
                require('oracle/refusal_preserves_prior_effects', equal(value.effects, before))
        suite.case('C12/final_candidate/' + method, candidate_splice, 'C12/whole_candidate/' + op)
        for timing in ('before', 'after'):
            def crash(p=phase, m=method, t=timing, o=op):
                value = graph(p)
                before = copy.deepcopy(value.effects)
                try:
                    getattr(value, m)(fault=t)
                except Refusal as error:
                    require('oracle/crash_refusal', str(error) == 'C12/' + ('before/' if t == 'before' else 'lost_ack/') + o)
                else:
                    raise AssertionError('fault did not refuse')
                require('oracle/crash_prefix', value.effects == before + ([] if t == 'before' else [o]))
                require('oracle/no_body_rewrite', equal(value.snapshot, value.migration.original_snapshot))
            suite.case('C12/crash/' + method + '/' + timing, crash)
    for phase in ('source_admitted', 'stop_reserved', 'receipt_committed', 'owners_settled', 'event_ready'):
        def withdraw_before(p=phase):
            value = graph(p)
            result = value.migration.withdraw(value.migration.selector())
            if value.control['cancellation_pending'] is not None:
                require('oracle/withdrawal_keeps_cancellation_pending', value.operation_id in result['preserved_pending_operation_ids'])
            value.admission()
        suite.case('C12/withdrawn/' + phase, withdraw_before, 'C12/migration_not_withdrawn')
    def no_effect():
        value = graph('source_admitted')
        value.finish('no_effect')
        value.replay_terminal(copy.deepcopy(value.terminal))
        require('oracle/no_effect_stop', equal(value.stop, value.initial_stop))
    suite.case('C12/original_no_effect_terminal', no_effect)
    def no_effect_after_stop():
        value = graph('stop_reserved')
        value.finish('no_effect')
    suite.case('C12/no_false_no_effect', no_effect_after_stop, 'C12/no_effect_original_phase')
    def unknown_then_recovery():
        value = graph('event_ready')
        value.append(lost_ack=True)
        value.finish('unknown')
        terminal = copy.deepcopy(value.terminal)
        value.resolve_append()
        value.publish()
        value.replay_terminal(terminal)
        require('oracle/unknown_terminal_immutable', equal(value.terminal, terminal))
        require('oracle/one_first_event', len(value.append_owner.frames) == 1)
    suite.case('C12/lost_append_ack_unknown_terminal_factual_recovery', unknown_then_recovery)
    for field in ('permission', 'content', 'source_current'):
        def final_guard(f=field):
            value = graph('receipt_committed')
            value.settle(helper=lambda owner, candidates: setattr(owner, f, False))
        suite.case('C12/final_source/' + field, final_guard, {'permission': 'C12/permission', 'content': 'C12/content', 'source_current': 'C12/current_source'}[field])
    def changed_registration():
        value = graph('receipt_committed')
        value.settle(helper=lambda owner, candidates: setattr(owner.migration, 'root_epoch', owner.migration.root_epoch + 1))
    suite.case('C12/final_original_registration', changed_registration, 'C12/original_registration')
    def substituted_binding():
        value = graph('receipt_committed')
        value.binding['original_binding_source_ref'] = 'TEST_ONLY:substituted-binding-source'
        value.settle()
    suite.case('C12/original_binding', substituted_binding, 'C12/original_binding')
    def substituted_binding_read():
        value = graph('receipt_committed')
        value.binding_read['selection']['original_reader']['original_causation_ref'] = 'TEST_ONLY:substituted-reader-source'
        value.settle()
    suite.case('C12/original_binding_read', substituted_binding_read, 'C12/binding_read_original')
    def changed_current_binding_control():
        value = graph('receipt_committed')
        key = next(k for k in value.binding_sources_raw if k.startswith('goal_execution_binding_control.v1:'))
        current = codec.storage_unpack(value.migration.cells[key])
        current['record']['control_epoch'] += 1
        roots.check('producer', BINDING + '#/$defs/StorageBindingControl', current)
        value.migration.cells[key] = codec.storage_pack(current)
        value.settle()
    suite.case('C12/current_binding_control', changed_current_binding_control, 'C12/binding_source_current')
    def unrelated_stop():
        value = graph('receipt_committed')
        other = copy.deepcopy(value.stop)
        other.update(goal_id='goal:unrelated', user_stop_epoch=0, continuation_epoch=0, latched=False,
            last_original_stop_receipt_ref=None, last_original_stop_receipt_sha256=None,
            original_birth_or_adoption_ref='TEST_ONLY:unrelated-host-birth')
        wrapper = value.make('StorageStopControl', {'record': other})
        key = 'TEST_ONLY:unrelated-original-stop-key'
        raw = codec.storage_pack(wrapper)
        value.migration.cells[key] = raw
        value.settle()
        require('oracle/unrelated_stop_preserved', value.migration.cells[key] == raw)
    suite.case('C12/unrelated_native_stop_preserved', unrelated_stop)
    for schema, field, guard in [('pm.storage_value.goal_host_stop_control.v1', 'user_stop_epoch', 'M12/live_stop_preimage'),
                                 ('pm.storage_value.goal_body_control.v2', 'control_epoch', 'M12/live_body_control_preimage')]:
        def torn_native_preimage(s=schema, f=field):
            value = graph('receipt_committed')
            for key, raw in value.migration.cells.items():
                row = codec.storage_unpack(raw)
                if row.get('schema_id') == s:
                    row['record'][f] += 1
                    value.migration.cells[key] = codec.storage_pack(row)
                    break
            before = copy.deepcopy(value.effects)
            try:
                value.settle()
            finally:
                require('oracle/torn_native_preimage_no_own_effect', equal(value.effects, before))
        suite.case('C12/torn_native_preimage/' + field, torn_native_preimage, guard)
    for wrong in (True, '1', None, [], {}):
        def changed_epoch_type(w=wrong):
            value = graph('receipt_committed')
            value.settle(helper=lambda owner, candidates: setattr(owner, 'epoch', w))
        suite.case('C12/graph_epoch_type/' + repr(wrong), changed_epoch_type, 'C12/graph_epoch_type')
    def changed_epoch():
        value = graph('receipt_committed')
        value.settle(helper=lambda owner, candidates: setattr(owner, 'epoch', owner.epoch + 1))
    suite.case('C12/graph_epoch', changed_epoch, 'C12/graph_epoch')
    for field in ('event_type', 'replay_policy'):
        def append_bad(f=field):
            value = graph('event_ready')
            producer = copy.deepcopy(value.progress['producer_input'])
            producer[f] = 'goal.updated' if f == 'event_type' else 'projector_replay_only'
            value.append_owner.append(producer, value.append_owner.reserve(value.operation_id))
        suite.case('C12/append/' + field, append_bad, 'C12/append_family' if field == 'event_type' else 'C12/append_policy')
    def exact_retry():
        value = graph('event_issued')
        original = copy.deepcopy(value.progress['publication'])
        returned = value.append_owner.append(copy.deepcopy(value.progress['producer_input']), None)
        require('oracle/exact_first_receipt_replay', equal(returned, original) and len(value.append_owner.frames) == 1)
    suite.case('C12/semantic_retry_first_custody', exact_retry)
    def semantic_conflict():
        value = graph('event_issued')
        producer = copy.deepcopy(value.progress['producer_input'])
        producer['actor_ref'] = 'person:different'
        value.append_owner.append(producer, None)
    suite.case('C12/substituted_producer_same_key', semantic_conflict, 'C12/frozen_producer_original')
    def foreign_append_owner():
        value = graph('event_ready')
        foreign = OriginalAppendOwner(roots, codec, value.scope['storage_instance_id'])
        foreign.append(copy.deepcopy(value.progress['producer_input']), None)
    suite.case('C12/lower_owner_without_birth', foreign_append_owner, 'C12/producer_owner_birth')
    def substituted_first_row():
        value = graph('event_issued')
        key = value.progress['producer_input']['idempotency_key']
        def helper(owner, candidate):
            owner.issued[key] = copy.deepcopy(owner.issued[key])
        value.append_owner.resolve(value.progress['producer_input'], value.progress['publication'], helper=helper)
    suite.case('C12/byte_equal_unissued_first_row', substituted_first_row, 'C12/first_row_issuance')
    for field, bad, guard in [('raw', b'x', 'C12/first_raw'), ('receipt', {}, 'C12/first_receipt'),
                             ('first_group', {}, 'C12/first_group')]:
        def lower_drift(f=field, b=bad):
            value = graph('event_issued')
            value.append_owner.resolve(value.progress['producer_input'], value.progress['publication'], helper=lambda owner, candidate: candidate.__setitem__(f, b))
        suite.case('C12/lower_disclosure/' + field, lower_drift, guard)
    def retained_after_live_change():
        value = graph('control_published')
        value.finish()
        terminal = copy.deepcopy(value.terminal)
        value.source_current = False
        value.content = False
        value.migration.withdraw(value.migration.selector())
        value.replay_terminal(terminal)
    suite.case('C12/retained_terminal_after_live_change_and_withdrawal', retained_after_live_change)
    for field in ('owner_result_sha256', 'terminal_authority_ref'):
        def substituted_terminal(f=field):
            value = graph('control_published')
            value.finish()
            candidate = copy.deepcopy(value.terminal)
            candidate[f] = 'b' * 64 if f.endswith('sha256') else 'TEST_ONLY:substituted-terminal'
            value.replay_terminal(candidate)
        suite.case('C12/terminal_custody/' + field, substituted_terminal, 'C12/replay_original_terminal')
    def coherent_unissued_terminal():
        value = graph('control_published')
        value.finish()
        value.terminal['terminal_authority_ref'] = 'TEST_ONLY:unissued-terminal-authority'
        wrapper = value.make('StorageTerminal', {'record': value.terminal})
        value.physical[value.key('goal_cancel_terminal_audit')] = codec.storage_pack(wrapper)
        value.replay_terminal(copy.deepcopy(value.terminal))
    suite.case('C12/coherent_unissued_terminal', coherent_unissued_terminal, 'C12/terminal_row_issuance')

    def schema_seams():
        value = graph('control_published')
        terminal = value.finish()
        specimens = {'SourceAudit': value.source, 'NormalizedIdentity': value.identity, 'NonterminalOutcome': value.nonterminal,
            'GoalCancelRequestV2': value.accepted_request, 'StopControl': value.stop, 'BodyControlV2': value.control,
            'StopIntent': value.progress['stop_intent'], 'StopReceipt': value.progress['stop_receipt'],
            'CancellationReceipt': value.progress['cancellation_receipt'], 'OwnerSettlement': value.progress['owner_settlement'],
            'ProducerInput': value.progress['producer_input'], 'OriginalPublication': value.progress['publication'],
            'ControlPublication': value.progress['control_publication'], **terminal}
        for name, specimen in specimens.items():
            if name.startswith('_') or type(specimen) is not dict:
                continue
            ref = CANCEL + '#/$defs/' + name
            roots.check('producer', ref, specimen)
            schema = roots.banks['producer'].registry.resolver().lookup(ref).contents
            # This seam concerns each top-level required member, independent of
            # cross-value/source joins. Copies elsewhere are deliberately absent.
            required = schema.get('required', [])
            if 'oneOf' in schema:
                required = sorted({k for branch in schema['oneOf'] for k in branch.get('required', [])})
            for field in required:
                if field not in specimen:
                    continue
                identity = 'schemas/required/' + name + '/' + field
                guard = 'schema-seam/required/' + name + '/' + field
                def reject(candidate, r=ref, f=field, g=guard):
                    errors = roots.banks['producer'].errors(r, candidate)
                    if not errors:
                        return
                    def leaves(error):
                        yield error
                        for child in error.context:
                            yield from leaves(child)
                    if not any(e.validator == 'required' and not e.absolute_path and f in e.validator_value
                               for outer in errors for e in leaves(outer)):
                        raise AssertionError('negative rejected for another schema defect')
                    raise Refusal(g)
                suite.negative(identity, specimen, lambda candidate, f=field: candidate.pop(f), reject, guard)
    suite.case('schemas/whole_root_seams', schema_seams)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output')
    parser.add_argument('--artifacts')
    parser.add_argument('--case-prefix', action='append', default=[])
    args = parser.parse_args()
    inputs, codec = load_originals()
    roots = Roots()
    class SelectedSuite(Suite):
        def case(self, identity, run, expected=None):
            if not args.case_prefix or any(identity.startswith(p) for p in args.case_prefix):
                super().case(identity, run, expected)
    suite, artifacts = SelectedSuite(), {}
    execute(roots, inputs, codec, suite, artifacts)
    negatives = {}
    for row in suite.rows:
        if row['expected_guard'] is not None:
            negatives.setdefault(row['expected_guard'], []).append(row['id'])
    result = dict(status='fail' if suite.failures else 'pass', selected_case_prefixes=args.case_prefix, event_type='goal.cancelled', native_execution='NOT_RUN',
        whole_root_closure='NOT_COMPLETE', cases=suite.rows, positives=sum(r['valid'] for r in suite.rows),
        negatives=sum(not r['valid'] for r in suite.rows), failures=suite.failures, new_guard_negatives=negatives,
        guard_isolation='INPUT_FOR_SHARED_TOOL_NOT_PROVEN_HERE',
        remaining=['Bound-Plan complete native preparation, joint Plan/Scheduler effects and retained/current tuples',
            'Workflow complete D05/D06 native arguments, late assignment and whole private SP-313 v2 inspection tuples',
            'M1-M9 bound-Plan/Workflow and representable pending-operation mapping beyond authenticated no-association',
            'Complete SP-337 successor representations and full per-schema effective-guard negative corpus',
            'Complete paused/blocked/completed/already-cancelled original source, generic current source and nine-field read-token tuples'])
    if args.artifacts:
        path = Path(args.artifacts)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(artifacts, indent=2, ensure_ascii=False) + '\n')
    if args.output:
        Path(args.output).write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result, indent=2))
    return bool(suite.failures)


if __name__ == '__main__':
    raise SystemExit(main())
