#!/usr/bin/env python3
"""Round-eight SP-278 and mandatory-format full-composition witnesses."""
import ast
import copy
import json

import pm_dcw_event_oracles as m
from pm_dcw_index_fixtures import issue, rehash, snapshot


def sites(code):
    result = []
    for function in ast.parse((m.ROOT / 'scripts/pm_dcw_event_oracles.py').read_text()).body:
        if isinstance(function, ast.FunctionDef):
            for node in ast.walk(function):
                if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'require' and
                        isinstance(node.args[1], ast.Constant) and node.args[1].value == code):
                    result.append(function.name + ':' + str(node.lineno))
    return result


def frontier_copies(value):
    index = value['index']; cp = index['checkpoint']; g = cp['generations'][cp['current_generation_id']]
    for tx in index['committed_transactions']:
        if tx['transaction_id'] == g['frontier']['redb_transaction_id']:
            tx['frontier_sha256'] = m.index_binding(g['frontier'])
    for token in (value['reader']['live_token'], value['reader']['durable_token']):
        token['frontier_sha256'] = m.index_binding(g['frontier'])


def anchor_copies(value):
    cp = value['index']['checkpoint']; g = cp['generations'][cp['current_generation_id']]
    for token in (value['reader']['live_token'], value['reader']['durable_token']):
        token['generation_anchor_sha256'] = m.index_binding(g['anchor'])


def cases(row):
    from pm_dcw_event_numeric_cases import schema_rules
    from pm_dcw_event_fixtures import event_slots, seal_originals, source_reference, opened_source_reference, refresh_restore
    result = []

    def add(name, value, expected, codes=(), rules=(), operations=('read', 'rebuild', 'compatibility_read'), extra_guards=()):
        guards = [site for code in codes for site in sites(code)] + list(extra_guards)
        for operation in operations:
            s = copy.deepcopy(value)
            if operation == 'compatibility_read':
                s['event']['replay_policy'] = 'projector_replay_only'
            result.append(dict(case_id='round8_' + name + '_' + operation, operation=operation, expected=expected,
                _value=s, isolation=dict(guards=guards, schema_rules=list(rules),
                duplicate_reason='Named repeated source/row integrity or format checks bind the same changed fact; hash observations are coherently reissued where specified.')))

    base = row['positive']
    def parts(s):
        cp = s['index']['checkpoint']; g = cp['generations'][cp['current_generation_id']]
        return g, s['index']['datasets'][g['index_dataset_name']]

    # Source-join witnesses retain authentic sources and reissue dependent digests.
    # The historic 54 unrehashed inputs carried a second integrity defect.
    for field, invalid in [('event_id', 'reviewer-forged'), ('project_id', 'foreign-project'), ('payload_sha256', 'f' * 64)]:
        s = copy.deepcopy(base); _, rows = parts(s); next(iter(rows.values()))[field] = invalid
        rehash(s['index'], s['reader'])
        add('astra_' + field, s, 'index_row_source', ('index_row_source',))
        s = copy.deepcopy(s)
        add('rehash_' + field, s, 'index_row_source', ('index_row_source',))

    for field, invalid in [('event_type', 'run.started'), ('scope_partition', 'project~Zm9yZWlnbg'),
                           ('sequence_id', False), ('payload_sha256', 0), ('producer_semantic_digest', 'f' * 64),
                           ('payload_sha256_LF', 'f' * 64 + '\n')]:
        s = copy.deepcopy(base); _, rows = parts(s)
        next(iter(rows.values()))[field.removesuffix('_LF')] = invalid
        rehash(s['index'], s['reader'])
        add('row_' + field, s, 'index_row_source', ('index_row_source',))
    s = copy.deepcopy(base); _, rows = parts(s); key = next(iter(rows)); rows[key + '\n'] = rows.pop(key)
    rehash(s['index'], s['reader'])
    add('row_key_LF', s, 'index_row_membership', ('index_row_membership',))

    # Two actual retained rows allow a swap without changing count or shape.
    sibling = next(r for r in m.load('Plans/dcw_event_contract_fixtures.json')['families'] if r['event_type'] ==
                   ('bundle.revision_started' if row['event_type'].startswith('bundle.') else 'wizard.deferred_payload.loaded'))
    s = copy.deepcopy(base)
    originals = dict(sibling['positive']['authority']['events'])
    originals.update(base['authority']['events'])
    s['index'], s['reader'] = snapshot(list(originals.values()), base['authority']['storage_instance_id'])
    add('actual_multirow_snapshot', s, 'accept')
    _, rows = parts(s); a, b = list(rows)[:2]; rows[a], rows[b] = rows[b], rows[a]
    rehash(s['index'], s['reader'])
    add('swapped_index_rows', s, 'index_row_source', ('index_row_source',))

    s = copy.deepcopy(base); g, rows = parts(s); del rows[next(iter(rows))]
    rehash(s['index'], s['reader'])
    add('missing_index_row', s, 'index_coverage', ('index_row_membership',), extra_guards=('index_read:360',))
    s = copy.deepcopy(base); g, _ = parts(s); g['frontier']['index_row_set_sha256'] = 'f' * 64
    s['index']['committed_transactions'][0]['index_row_set_sha256'] = 'f' * 64; frontier_copies(s)
    add('stale_row_digest', s, 'index_row_digest', ('index_row_digest',))

    # Coherent complete indexes still cannot stand in for this returned event.
    s = copy.deepcopy(base); events = list(base['authority']['events'].values())
    foreign = copy.deepcopy(base['event']); foreign['project_id'] = 'foreign-project'
    foreign['payload']['project_id'] = 'foreign-project'
    foreign['event_id'], foreign['idempotency_key'] = m.event_identity(foreign['payload'])
    events = [e for e in events if e['event_id'] != base['event']['event_id']] + [foreign]
    s['index'], s['reader'] = snapshot(events, base['authority']['storage_instance_id'])
    add('foreign_project_snapshot', s, 'index_event_join', ('index_event_join',))
    s = copy.deepcopy(base); events = [e for e in events if e['event_id'] != foreign['event_id']]
    s['index'], s['reader'] = snapshot(events, base['authority']['storage_instance_id'])
    add('selected_event_absent', s, 'index_event_join', ('index_event_join',))
    s = copy.deepcopy(base)
    s['index'], s['reader'] = snapshot(list(base['authority']['events'].values()),
        base['authority']['storage_instance_id'], base['authority']['recovery_epoch'] + 1)
    add('foreign_recovery_epoch', s, 'index_recovery_epoch', ('index_recovery_epoch',))
    s = copy.deepcopy(base); originals = list(base['authority']['events'].values())
    unknown = copy.deepcopy(base['event'])
    unknown.update(event_type='forged.unregistered', event_id='forged-unregistered-source',
        sequence_id=max(e['sequence_id'] for e in originals) + 1,
        payload_schema_id='https://puppetmaster.local/schemas/event_payloads/forged/1.0.0')
    s['index'], s['reader'] = snapshot(originals + [unknown], base['authority']['storage_instance_id'])
    add('unsupported_source_dispatch', s, 'index_source_dispatch', ('index_source_dispatch',))

    s = copy.deepcopy(base); s['index']['current_source']['current']['selected_segment_generation'] = 2
    add('source_control_digest', s, 'index_source_binding', ('index_source_binding',))
    s = copy.deepcopy(base); s['index']['current_source']['source_bytes_base64'] = 'AA=='
    add('source_bytes', s, 'index_source_bytes', ('index_source_bytes',))
    s = copy.deepcopy(base); g, _ = parts(s)
    gap = dict(reason='allocator_lease_abandoned', first_sequence_id=100, last_sequence_id=101,
               manifest_evidence_ref='forged-gap', manifest_evidence_sha256='f' * 64)
    s['index']['current_source']['sequence_gaps'] = [gap]
    g['frontier']['coverage'] = m.index_coverage(s['index']['current_source']); frontier_copies(s)
    add('unsupported_gap', s, 'index_source_gaps', ('index_source_gaps',))
    s = copy.deepcopy(base); g, _ = parts(s); last = g['frontier']['coverage']['through_sequence_id']
    g['frontier']['coverage']['through_sequence_id'] = last - 1 if last else 1; frontier_copies(s)
    add('out_of_boundary', s, 'index_source_coverage', ('index_source_coverage',))
    s = copy.deepcopy(base); g, _ = parts(s); g['anchor']['generation_seed_sha256'] = 'f' * 64; anchor_copies(s)
    add('generation_identity', s, 'index_generation_identity', ('index_generation_identity',))
    s = copy.deepcopy(base); g, _ = parts(s); g['anchor']['retained_event_prefix_sha256'] = 'f' * 64; anchor_copies(s)
    add('anchor_prefix', s, 'index_anchor_prefix', ('index_anchor_prefix',))
    s = copy.deepcopy(base)
    for t in (s['reader']['live_token'], s['reader']['durable_token']): t['frontier_sha256'] = 'f' * 64
    s['index']['committed_transactions'][0]['frontier_sha256'] = 'f' * 64
    add('frontier_digest', s, 'index_frontier_digest', ('index_frontier_digest',))

    s = copy.deepcopy(base); s['reader']['live_token']['redb_snapshot_id'] = 'foreign-snapshot'
    add('foreign_redb_snapshot', s, 'index_currentness', extra_guards=('index_read:368',))
    s = copy.deepcopy(base); s['index']['committed_transactions'][0]['generation_id'] = 'eig_' + 'f' * 64
    add('foreign_transaction_generation', s, 'index_atomicity', extra_guards=('index_read:362',))

    # Storage observed/persisted use storage_utc_z. Year 0000 and an announced
    # leap second are valid under that profile; offsets and lowercase z are not.
    # The former Storage positives +23:59 and t...z (lowercase zone) are now negatives.
    malformed = [('word', 'yesterday'), ('impossible', '2026-13-99T25:61:61Z'),
        ('missing_zone', '2026-11-04T12:00:00'), ('LF', '2026-11-04T12:00:00Z\n'),
        ('separator', '2026-11-04 12:00:00Z'), ('calendar', '2026-02-30T12:00:00Z'),
        ('nonleap', '2025-02-29T12:00:00Z'), ('hour_24', '2026-11-04T24:00:00Z'),
        ('leap_second', '2026-12-31T23:59:60Z'), ('empty_fraction', '2026-11-04T12:00:00.Z'),
        ('offset_hour', '2026-11-04T12:00:00+24:00'), ('offset_minute', '2026-11-04T12:00:00+00:60'),
        ('nonzero_offset', '2026-11-04T12:00:00+23:59'),
        ('plus_zero', '2026-11-04T12:00:00+00:00'), ('minus_zero', '2026-11-04T12:00:00-00:00'),
        ('lowercase_z', '2026-11-04t12:00:00z')]
    storage_valid = [('fraction', '2000-02-29T23:59:59.123456789Z'),
                     ('lowercase_t', '2026-11-04t12:00:00Z'),
                     ('announced_leap', '2016-12-31T23:59:60Z'),
                     ('year_zero', '0000-01-01T00:00:00Z')]
    for field in ('observed_at_utc', 'persisted_at_utc'):
        for label, invalid in malformed:
            s = copy.deepcopy(base)
            for slot in event_slots(s):
                if slot['prepared_event']['event_id'] == s['event']['event_id']:
                    slot['prepared_event'][field] = invalid
            s['event'][field] = invalid; seal_originals(s)
            if 'stored_source' in s: source_reference(row, s)
            opened_source_reference(s); refresh_restore(s); issue(s)
            rules = schema_rules('Plans/event_record.schema.json', s['event'])
            rules += schema_rules(row['source_schema'], s['source']) + schema_rules(row['source_schema'], s['source'], 'inline')
            add('datetime_' + field + '_' + label, s, 'schema', rules=rules,
                operations=('append', 'publish', 'retry', 'read', 'rebuild', 'compatibility_read'))
        for label, valid in storage_valid:
            s = copy.deepcopy(base)
            for slot in event_slots(s):
                if slot['prepared_event']['event_id'] == s['event']['event_id']: slot['prepared_event'][field] = valid
            s['event'][field] = valid; seal_originals(s)
            if 'stored_source' in s: source_reference(row, s)
            opened_source_reference(s); refresh_restore(s); issue(s)
            add('datetime_valid_' + field + '_' + label, s, 'accept')
    s = copy.deepcopy(base)
    offset = '2026-11-04T12:00:00+00:00'
    for slot in event_slots(s):
        if slot['prepared_event']['event_id'] == s['event']['event_id']:
            slot['prepared_event']['occurred_at_utc'] = offset
    s['event']['occurred_at_utc'] = offset
    seal_originals(s)
    if 'stored_source' in s: source_reference(row, s)
    opened_source_reference(s); refresh_restore(s); issue(s)
    add('datetime_occurred_offset', s, 'original_time',
        operations=('append', 'publish', 'retry', 'read', 'rebuild', 'compatibility_read'))
    # Exercise payload/source formats as well as the shared envelope fields.
    for label, invalid in malformed:
        s = copy.deepcopy(base)
        current = next(slot for slot in event_slots(s) if slot['prepared_event']['event_id'] == s['event']['event_id'])
        current['prepared_event']['payload']['ts'] = invalid
        current['prepared_event']['occurred_at_utc'] = invalid
        current['result']['occurred_at_utc'] = invalid
        s['authority']['results'][current['result']['result_ref']]['occurred_at_utc'] = invalid
        s['event'] = copy.deepcopy(current['prepared_event'])
        seal_originals(s)
        if 'stored_source' in s: source_reference(row, s)
        opened_source_reference(s); refresh_restore(s); issue(s)
        rules = schema_rules('Plans/event_record.schema.json', s['event']) + schema_rules(row['schema'], s['event']['payload'])
        for path, source in [(row['source_schema'], s['source'])] + ([
                ('Plans/dcw/wizard_open_evidence.schema.json', s['authority']['opened_source'])]
                if 'opened_source' in s['authority'] else []):
            rules += schema_rules(path, source) + schema_rules(path, source, 'inline')
        if 'opened_source' in s['authority']:
            rules += schema_rules('Plans/event_payloads/planning_wizard/wizard_opened.schema.json',
                                  s['authority']['opened_source']['prepared_event']['payload'])
        for custody in s['authority']['custody'].values():
            rules += schema_rules('Plans/event_append_receipt_contracts.schema.json', custody, 'custody_v2')
        # One timestamp fact can appear in several retained phase payloads.
        # Each independently dispatched source payload repeats that grammar.
        owners = {r['event_type']: r for r in m.load('Plans/dcw_event_contract_fixtures.json')['families']}
        for frame in s['index']['current_source']['frames']:
            original = frame['event']
            rules += schema_rules('Plans/event_record.schema.json', original)
            rules += schema_rules(owners[original['event_type']]['schema'], original['payload'])
        legacy_guards = ['legacy:3', 'legacy:datetime_parse'] if row['event_type'].startswith('bundle.') else []
        add('datetime_payload_' + label, s, 'schema', rules=rules, extra_guards=legacy_guards,
            operations=('append', 'publish', 'retry', 'read', 'rebuild', 'compatibility_read'))
    for label, valid in [('announced_leap', '2016-12-31T23:59:60Z'),
                         ('year_zero', '0000-01-01T00:00:00Z'),
                         ('lowercase_t', '2026-11-04t12:00:00Z'),
                         ('fraction', '2000-02-29T23:59:59.123456789Z')]:
        s = copy.deepcopy(base)
        current = next(slot for slot in event_slots(s) if slot['prepared_event']['event_id'] == s['event']['event_id'])
        current['prepared_event']['payload']['ts'] = valid
        current['prepared_event']['occurred_at_utc'] = valid
        current['result']['occurred_at_utc'] = valid
        s['authority']['results'][current['result']['result_ref']]['occurred_at_utc'] = valid
        s['event'] = copy.deepcopy(current['prepared_event'])
        seal_originals(s)
        if 'stored_source' in s: source_reference(row, s)
        opened_source_reference(s); refresh_restore(s); issue(s)
        add('datetime_payload_valid_' + label, s, 'accept',
            operations=('append', 'publish', 'retry', 'read', 'rebuild', 'compatibility_read'))
    return result
