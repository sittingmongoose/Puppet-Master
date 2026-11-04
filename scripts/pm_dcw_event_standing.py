#!/usr/bin/env python3
"""Exact-family standing checks 4, 10 and isolated guard-ablation witnesses (11)."""
import ast
import copy
import inspect
import json
from contextlib import contextmanager

from referencing import Registry, Resource

import pm_dcw_event_oracles as m
from pm_bundle_revision_events import validate
from pm_dcw_event_fixtures import event_case_fixture, event_slots, seal_originals


def outcome(row, value, operation, validator=validate):
    try:
        return m.verify(row, copy.deepcopy(value), operation, validator)
    except m.Refusal as exc:
        return str(exc)


@contextmanager
def weakened(code=None, schema_guard=None):
    require, load, resources, writer_policy = m.require, m.load, m.RESOURCES, m.writer_policy
    try:
        if code:
            m.require = lambda condition, refusal: None if refusal == code else require(condition, refusal)
        if code == 'replay_only_not_appendable':
            m.writer_policy = lambda policy: None if policy == 'projector_replay_only' else writer_policy(policy)
        if schema_guard:
            changed = {str(p.relative_to(m.ROOT)): copy.deepcopy(load(str(p.relative_to(m.ROOT)))) for p in m.SCHEMAS}
            for path, schema in changed.items():
                schema_guard(path, schema)
            m.load = lambda path: changed[path] if path in changed else load(path)
            m.RESOURCES = Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in changed.values())
        yield
    finally:
        m.require, m.load, m.RESOURCES = require, load, resources
        m.writer_policy = writer_policy


def additional_checks(rows, results):
    from pm_dcw_event_regressions import scenario

    def record(row, check, name, value, operation, expected):
        actual = outcome(row, value, operation)
        result = dict(family=row['event_type'], check=check, case=name, operation=operation,
                      expected=expected, actual=actual, passed=actual == expected)
        results.append(result)
        return result

    def isolated(row, check, name, value, operation, expected, code=None, schema_guard=None, validator=validate):
        record(row, check, name, value, operation, expected)
        with weakened(code, schema_guard):
            actual = outcome(row, value, operation, validator)
        results.append(dict(family=row['event_type'], check=11, guards_check=check, case=name,
                            expected='accept when only its guard is weakened', actual=actual,
                            weakened_guard=code or name, passed=actual == 'accept'))

    def payload_definition(row, definition, edit):
        def guard(path, schema):
            if path == row['schema']:
                edit(schema['$defs'][definition])
        return guard

    # The legacy bundle validator repeats the identity guard. Remove only that
    # assertion when demonstrating the exact-family idempotency-key rule.
    tree = ast.parse(inspect.getsource(validate))
    class RemoveIdentity(ast.NodeTransformer):
        def visit_Assert(self, node):
            return ast.copy_location(ast.Pass(), node) if isinstance(node.msg, ast.Constant) and node.msg.value == 'identity' else node
    tree = ast.fix_missing_locations(RemoveIdentity().visit(tree))
    namespace = dict(validate.__globals__)
    exec(compile(tree, '<DCW identity guard ablation>', 'exec'), namespace)
    legacy_without_identity = namespace['validate']

    for row in rows:
        base = row['positive']
        # 1: one incoming policy field; original event/receipt remain untouched.
        value = copy.deepcopy(base)
        value['retry_request'] = copy.deepcopy(value['event'])
        value['retry_request']['replay_policy'] = 'projector_replay_only'
        isolated(row, 1, 'isolated_caller_replay_only', value, 'retry', 'replay_only_not_appendable',
                 code='replay_only_not_appendable')
        # 2: these Project-only families use their own exact key recipe. A valid
        # CV-366 application key and a malformed app key are both foreign keys.
        for key in ('application@1:736572766572:6f7065726174696f6e', 'application:server:operation'):
            value = copy.deepcopy(base)
            from pm_dcw_event_fixtures import idempotency_key_fixture
            idempotency_key_fixture(row, value, key)
            isolated(row, 2, 'foreign_application_key_' + key, value, 'publish', 'identity', code='identity',
                     validator=legacy_without_identity)
        # 3: one original custody partition, all source and receipt facts intact.
        for partition in (base['event']['project_id'], 'project~b3RoZXI'):
            value = copy.deepcopy(base)
            value['authority']['custody'][value['event']['event_id']]['scope_partition'] = partition
            isolated(row, 3, 'isolated_partition_' + partition, value, 'read', 'receipt_scope', code='receipt_scope')

        # 4: every byte-boundary transport and each exact-family negative goes
        # through full envelope/source/pack/receipt/restore composition.
        for case in row['cases']:
            if 'event_bytes' in case:
                value = scenario(row, case)
                record(row, 4, case['case_id'], value, case['operation'], case['expected'])
        case = next(c for c in row['cases'] if c['case_id'] == 'event_body_16385_inline_retry')
        isolated(row, 4, 'isolated_inline_16385', scenario(row, case), 'retry', 'inline_limit', code='inline_limit')
        ablations = {
            'unreadable': 'event_payload_unavailable', 'unsynced': 'event_payload_not_durable',
            'index_unsynced': 'event_payload_not_durable', 'size': 'event_payload_size',
            'digest': 'event_payload_digest', 'encoding': 'event_payload_encoding',
            'reference_encoding': 'event_payload_reference_encoding',
            'inventory': 'restore_event_payload_inventory',
            'substituted': 'result_join',
        }
        for defect, code in ablations.items():
            case = next(c for c in row['cases'] if c.get('event_defect') == defect)
            isolated(row, 4, 'isolated_pack_' + defect, scenario(row, case), 'retry', case['expected'], code=code)
        for defect, definition, edit in [
            ('media', 'payload_reference', lambda s: s['properties']['media_type'].pop('const')),
            ('stub', 'referenced_stub', lambda s: s.clear()),
        ]:
            case = next(c for c in row['cases'] if c.get('event_defect') == defect)
            isolated(row, 4, 'isolated_pack_' + defect, scenario(row, case), 'retry', 'schema',
                     schema_guard=payload_definition(row, definition, edit))
        case = next(c for c in row['cases'] if c.get('event_defect') == 'body_schema')
        def loosen_body_closure(path, schema):
            if path == row['schema']:
                schema['additionalProperties'] = True
        def legacy_without_extra_field(r, payload, event, previous):
            return validate(r, {k: v for k, v in payload.items() if k != 'unregistered_field'}, event, previous)
        isolated(row, 4, 'isolated_pack_body_schema', scenario(row, case), 'retry', 'schema',
                 schema_guard=loosen_body_closure, validator=legacy_without_extra_field)
        # Exact BLAKE3 syntax is enforced both by its schema length and by
        # byte-digest equality. Weaken that one identifier invariant at both
        # enforcement sites; all body/size/media/original-receipt guards remain.
        case = next(c for c in row['cases'] if c.get('event_defect') == 'LF')
        isolated(row, 5, 'isolated_pack_digest_LF', scenario(row, case), 'retry', 'schema',
                 code='event_payload_digest', schema_guard=payload_definition(
                     row, 'payload_reference', lambda s: s['properties']['blake3'].pop('maxLength')))
        # Missing payload proof: weaken only the resolver's absent-value guard
        # into fallback to the otherwise unchanged original pack observation.
        case = next(c for c in row['cases'] if c.get('event_defect') == 'missing')
        missing = scenario(row, case)
        positive_case = dict(case); positive_case.pop('event_defect')
        valid_pack = scenario(row, positive_case)['authority']['event_payloads']
        record(row, 4, 'isolated_missing_pack', missing, 'retry', 'event_payload_missing')
        original_body = m.event_body
        def missing_guard_disabled(r, event, authority=None):
            a = copy.deepcopy(authority)
            a['event_payloads'] = dict(valid_pack, **a.get('event_payloads', {}))
            return original_body(r, event, a)
        try:
            m.event_body = missing_guard_disabled
            actual = outcome(row, missing, 'retry')
        finally:
            m.event_body = original_body
        results.append(dict(family=row['event_type'], check=11, guards_check=4, case='isolated_missing_pack',
                            weakened_guard='absent pack observation fallback', actual=actual, passed=actual == 'accept'))

        # 5: one exact-format original hash defect, with owner mirrors aligned.
        def loosen_hash_length(path, schema):
            if path != row['source_schema']:
                return
            def visit(node):
                if isinstance(node, dict):
                    if node.get('pattern') == '^[0-9a-f]{64}$':
                        node.pop('maxLength', None)
                    for child in node.values():
                        visit(child)
                elif isinstance(node, list):
                    for child in node:
                        visit(child)
            visit(schema)
        case = next(c for c in row['cases'] if c['case_id'] == 'trailing_LF_original_hash_append')
        isolated(row, 5, 'isolated_original_hash_LF', scenario(row, case), 'append', 'schema', schema_guard=loosen_hash_length)
        # 6: caller-supplied semantic changes do not touch the stored original.
        case = next(c for c in row['cases'] if c['case_id'] == 'retry_changed_semantic_body')
        isolated(row, 6, 'isolated_caller_semantic_change', scenario(row, case), 'retry', 'idempotency_conflict',
                 code='idempotency_conflict')
        for field in ('observed_at_utc', 'persisted_at_utc', 'sequence_id'):
            case = next(c for c in row['cases'] if c['case_id'] == 'caller_retry_metadata_' + field)
            record(row, 6, case['case_id'], scenario(row, case), 'retry', 'accept')
        # 7: event/source/custody move coherently, only the checkpoint stays foreign.
        case = next(c for c in row['cases'] if c['case_id'] == 'checkpoint_different_event_storage_instance')
        isolated(row, 7, 'isolated_foreign_checkpoint', scenario(row, case), 'read', 'checkpoint_storage_instance',
                 code='checkpoint_storage_instance')

        # 10: live writer eligibility is never a historical validity predicate.
        for operation in ('read', 'rebuild', 'compatibility_read'):
            for name, changes in [
                ('writer_cutoff', {'writer_cutoff': True}),
                ('obsolete_CAS', {'expected_value_revision': 999}),
                ('unknown_current_effect', {'effect_state': 'unknown'}),
            ]:
                value = copy.deepcopy(base)
                value['control'].update(changes)
                if operation == 'compatibility_read':
                    value['event']['replay_policy'] = 'projector_replay_only'
                record(row, 10, 'retained_' + name + '_' + operation, value, operation, 'accept')
                value['control']['reader_withdrawn'] = True
                isolated(row, 10, 'withdrawn_' + name + '_' + operation, value, operation, 'reader_withdrawn',
                         code='reader_withdrawn')
        for case in row['cases']:
            if case['case_id'].startswith('compatibility_forged_'):
                isolated(row, 10, case['case_id'], scenario(row, case), 'compatibility_read', 'original_full_value',
                         code='original_full_value')
        # Authenticate the retained original itself against recorded digest and receipt.
        for defect, code in [('commitment', 'original_commitment'), ('receipt', 'receipt_event_sequence')]:
            value = copy.deepcopy(base)
            event_id = value['event']['event_id']
            slot = next(s for s in event_slots(value) if s['prepared_event']['event_id'] == event_id)
            custody = value['authority']['custody'][event_id]
            if defect == 'commitment':
                custody['original_event_value_commitment']['sha256'] = 'f' * 64
                slot['original_event_value_commitment'] = copy.deepcopy(custody['original_event_value_commitment'])
            else:
                custody['first_append_receipt']['sequence_id'] += 99
                slot['first_append_receipt'] = copy.deepcopy(custody['first_append_receipt'])
            value['event']['replay_policy'] = 'projector_replay_only'
            isolated(row, 10, 'isolated_historical_' + defect, value, 'compatibility_read', code, code=code)
        if row['event_type'] in ('bundle.revision_requested', 'bundle.revision_started', 'bundle.revision_interrupted'):
            started = next(r for r in rows if r['event_type'] == 'bundle.revision_started')
            case = next(c for c in started['cases'] if c['case_id'] == 'full_original_interrupted_resume')
            value = scenario(started, case)
            value['event'] = copy.deepcopy(next(s['prepared_event'] for s in value['source']['phases'] if s['event_type'] == row['event_type']))
            value['control']['admitted_families'] = [row['event_type']]
            record(row, 10, 'retained_from_later_resumed_source', value, 'read', 'accept')
        # Complete-CLI result/ref guards have already been ablated in subprocesses.
        for result in list(results):
            if result['family'] == row['event_type'] and result['check'] in (8, 9):
                results.append(dict(family=row['event_type'], check=11, guards_check=result['check'],
                                    case=result['case'], weakened_guard='full CLI expectation/ref preflight',
                                    guard_disabled_exit=result['guard_disabled_exit'], passed=result['passed']))
