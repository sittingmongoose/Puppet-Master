"""CH2 authored exact-first-refusal witnesses: ordinary thread/message/bundle and Stop.

Only the named (phase, row, code) counts. A different refusal or an exception
is a failed test, never a mutation kill. Each case owns distinct deep copies of
its independently held original world; no checker writes to a world it reads.
Every negative changes one source copy (or one coherent wrong world) so that a
single row of its first refusing table refuses.
"""
import copy
import hashlib
import json
from dataclasses import dataclass
from pathlib import Path

from pm_dch_thread import FAMILIES, INPUTS, fixtures, branches
from pm_event_numbers import full_value_commitment

ROOT = Path(__file__).resolve().parents[1]
STOP = 'chat.response_stop_requested'
SD = ('sd_complete', 'SD01_complete_definition', 'schema_refused')


@dataclass
class Witness:
    name: str
    family: str
    original_ref: str
    originals: dict
    record: dict
    expected: object
    clause: str


def _set(o, path, value):
    target = o
    for key in path[:-1]:
        target = target[key]
    target[path[-1]] = value


def _other_thread(value):
    return value[:-1] + ('0' if value[-1] != '0' else '1')


def owner_changes(family, base):
    """(name, path, replacement, phase, row, clause) single-row owner witnesses for one original."""
    out = ('operation', 'outcome')
    o = base['operation']['outcome']
    rows = []
    def add(name, path, value, phase, row, clause):
        rows.append((name, path, value, phase, row, clause))
    if family == 'chat.thread_created':
        add('producer', out + ('command',), 'cmd.chat.thread.other', 'th_created', 'TC01_producer', 'ACD-614 exact producer')
        add('assistant_first', out + ('first_message', 'role'), 'assistant', 'th_created', 'TC02_user_message', 'ACD-614 minted only for a user message')
        add('uncommitted', out + ('first_message', 'committed'), False, 'th_created', 'TC03_message_committed', 'ACD-614 the first user message commits')
        add('first_message', out + ('first_message', 'message_id'), 'other_message_id', 'th_created', 'TC04_first_message', 'ACD-614 first message copy')
        add('split_commit', out + ('commit_groups', 'thread'), 'other_commit_group', 'th_created', 'TC05_joint_commit', 'ACD-614 message and thread commit together')
        add('record_ref', out + ('thread_record_ref',), 'pmref:fixture:other_record', 'th_created', 'TC06_record_ref', 'ACD-614 canonical thread record')
        add('discarded_draft', out + ('discard_empty_draft',), True, 'th_created', 'TC07_not_discarded', 'ACD-614 discard_empty_draft emits nothing')
    elif family == 'chat.thread_deleted':
        add('producer', out + ('command',), 'cmd.chat.thread.other', 'th_deleted', 'TD01_producer', 'ACD-615 exact producer')
        for state in ('creating', 'deleted'):
            add('from_' + state, ('before', 'thread_state'), state, 'th_deleted', 'TD02_deletable_state', 'ACD-615 delete from active, suspended or archived only')
        other = 'suspended' if base['before']['thread_state'] != 'suspended' else 'archived'
        add('previous_state', ('before', 'thread_state'), other, 'th_deleted', 'TD03_previous_state', 'ACD-615 observed before state copy')
        add('record_ref', out + ('deletion_record', 'ref'), 'pmref:fixture:other_deletion', 'th_deleted', 'TD04_record_ref', 'ACD-615 deletion record copy')
        add('content', out + ('deletion_record', 'content_free'), False, 'th_deleted', 'TD05_content_free', 'ACD-615 content-free deletion record')
        add('not_storage_owned', out + ('deletion_record', 'storage_owned'), False, 'th_deleted', 'TD06_storage_owned', 'ACD-615 storage-owned deletion record')
        add('visible', out + ('hidden',), False, 'th_deleted', 'TD07_hidden', 'ACD-615 hide immediately')
    elif family == 'chat.thread_archived':
        add('producer', out + ('handler',), 'cmd.chat.thread.other', 'th_archived', 'TA01_producer', 'ACD-613 lifecycle handler')
        add('dispatch', out + ('dispatched_by',), 'cmd.chat.other', 'th_archived', 'TA02_dispatch', 'ACD-613 cataloged cmd.chat.archive')
        add('no_cas', out + ('cas_commits',), [], 'th_archived', 'TA03_cas_once', 'ACD-613 CAS the canonical revision once')
        add('two_cas', out + ('cas_commits',), ['fixture_revision_commit', 'fixture_second_commit'], 'th_archived', 'TA03_cas_once', 'ACD-613 CAS once')
        for action in ('worktree_cleanup', 'folder_cleanup', 'purge', 'delete', 'retention_action'):
            add('cleanup_' + action, out + ('cleanup_actions',), [action], 'th_archived', 'TA04_no_cleanup', 'ACD-613 archive performs no ' + action)
        add('prune_transcript', out + ('pruned',), o['pruned'] + ['transcript'], 'th_archived', 'TA05_transient_only', 'ACD-613 prune only transient state')
        add('listed', ('after', 'listed_active'), True, 'th_archived', 'TA06_hidden', 'ACD-613 hide from active lists')
        archive = ('archive',)
        add('automatic_request', archive + ('request', 'origin'), 'automatic', 'ar_request', 'AR03_request_origin', 'DL-287 no auto-archive (original request)')
        add('request_command', archive + ('request', 'command_id'), 'cmd.chat.other', 'ar_request', 'AR04_request_command', 'catalog cmd.chat.archive')
        add('permission', archive + ('request', 'permission_allowed'), False, 'ar_request', 'AR05_permission', 'current permission at commit')
        add('unselected', archive + ('request', 'thread_selected'), False, 'ar_request', 'AR06_thread_selected', 'guard thread_selected')
        add('active_run', archive + ('before', 'active_run'), True, 'ar_request', 'AR07_no_active_run', 'guard !active_run_in_thread')
        other = 'suspended' if base['archive']['before']['state'] != 'suspended' else 'active'
        add('previous_state', archive + ('before', 'state'), other, 'ar_state', 'AR09_previous_state', 'observed lifecycle state copy')
        add('after_state', archive + ('after', 'state'), 'active', 'ar_state', 'AR11_after_state', 'read back archived')
        add('readback', archive + ('after', 'readback_available'), False, 'ar_state', 'AR12_readback', 'read back before append')
        add('request_revision', archive + ('request', 'expected_revision'), base['archive']['request']['expected_revision'] - 1,
            'ar_state', 'AR14_request_revision', 'expected lifecycle revision')
        add('record_ref', archive + ('after', 'record_ref'), 'pmref:fixture:other_record', 'ar_commit', 'AR17_record_ref', 'committed canonical record')
        for side, row in (('before', 'AR19_before_copies'), ('after', 'AR20_after_copies')):
            add(side + '_thread', archive + (side, 'thread_id'), _other_thread(base['archive'][side]['thread_id']), 'ar_commit', row, 'exact selected thread')
            add(side + '_computer', archive + (side, 'computer_id'), 'other_computer', 'ar_commit', row, 'exact selected Computer')
    elif family == 'chat.message':
        add('producer', out + ('handler',), 'assistant_chat.other', 'th_message_a', 'TM01_producer', 'ACD-612 transcript commit handler')
        add('stream_delta', out + ('boundary',), 'stream_delta', 'th_message_a', 'TM02_durable_boundary', 'ACD-612 deltas are not messages')
        for key, value in (('message_id', 'other_message_id'), ('message_type', 'error'), ('role', 'system'),
                           ('content_ref', 'pmref:fixture:other_content'), ('attachment_refs', ['pmref:fixture:other_attachment'])):
            add('message_' + key, out + ('message', key), value, 'th_message_a', 'TM03_message_copies', 'ACD-612 canonical typed message ' + key)
        add('no_commit', out + ('commits',), [], 'th_message_a', 'TM04_commit_once', 'ACD-612 commit once')
        add('twice', out + ('commits',), ['fixture_commit', 'fixture_commit_again'], 'th_message_a', 'TM04_commit_once', 'ACD-612 commit once')
        if base['before']['thread_durable']:
            add('recreate', out + ('creates_thread',), True, 'th_message_b', 'TM07_no_recreate', 'ACD-612 no second durable thread')
            if base['result']['role'] != 'user':
                add('draft_reply', ('before', 'thread_durable'), False, 'th_message_b', 'TM05_draft_user', 'ACD-612 an unsent draft has no durable thread event')
        else:
            add('no_creation', out + ('creates_thread',), False, 'th_message_b', 'TM06_first_creates', 'ACD-612 first user message creates the thread')
        add('lineage', out + ('lineage_owner',), 'display', 'th_message_b', 'TM08_lineage_owner', 'ACD-612 lineage under the transcript owner')
    elif family == 'bundle.selection_sent_to_chat':
        add('producer', out + ('handler',), 'document_review.other', 'bs_sent_a', 'BS01_producer', 'ACD-611 exact producer')
        r = o['resolution']
        if r['explicit_selection'] is None and r['owning_page_surface'] is not None:
            add('order', out + ('resolution', 'owning_page_surface'), 'pmref:fixture:other_surface', 'bs_sent_a', 'BS03_resolution_order',
                'ACD-611 explicit, owning page surface, then new thread')
        if r['explicit_selection'] is not None:
            add('skipped_explicit', out + ('resolution', 'explicit_selection'), None, 'bs_sent_a', 'BS03_resolution_order',
                'ACD-611 an explicit selection resolves first')
        add('unresolved', out + ('resolutions',), [], 'bs_sent_a', 'BS04_resolved_once', 'ACD-611 resolve once')
        add('twice', out + ('resolutions',), ['fixture_resolution', 'fixture_resolution_again'], 'bs_sent_a', 'BS04_resolved_once', 'ACD-611 resolve once')
        add('chip_state', out + ('chip', 'state'), 'sent', 'bs_sent_b', 'BS06_chip_pending', 'ACD-611 visible pending chip')
        add('chip_target', out + ('chip', 'target'), 'pmref:fixture:other_target', 'bs_sent_b', 'BS07_chip_target', 'ACD-611 record the effective target')
        for key, value in (('selection_id', 'other_selection'), ('excerpt_ref', 'pmref:fixture:other_excerpt'),
                           ('provenance_refs', ['pmref:fixture:other_provenance'])):
            add('chip_' + key, out + ('chip', key), value, 'bs_sent_b', 'BS08_chip_copies', 'ACD-611 chip ' + key)
        add('message_sent', out + ('message_sent',), True, 'bs_sent_b', 'BS09_no_message', 'ACD-611 chip handoff, not sending a message')
    elif family == 'bundle.selection_forward_blocked':
        add('producer', out + ('handler',), 'document_review.other', 'bs_blocked', 'BB01_producer', 'ACD-610 exact producer')
        add('not_blocked', out + ('blocked',), False, 'bs_blocked', 'BB02_blocked', 'ACD-610 the handoff is blocked')
        add('other_class', out + ('block_class',), 'network_error', 'bs_blocked', 'BB03_block_class', 'ACD-610 privacy/sensitivity, expired or scrubbed')
        add('reason', out + ('reason',), 'other_reason', 'bs_blocked', 'BB04_reason', 'ACD-610 exact reason')
        add('success', out + ('handoff_claimed',), True, 'bs_blocked', 'BB05_no_success', 'ACD-610 never claim a successful handoff')
        for created in ('message', 'annotation'):
            add('created_' + created, out + ('created',), ['pmref:fixture:' + created], 'bs_blocked', 'BB06_no_creation', 'ACD-610 no ' + created + ' is created')
    return rows


def state_changes(family, base):
    p = base['result']
    if family == 'chat.thread_created':
        return [('before_state', ('before', 'thread_state'), 'active'), ('before_durable', ('before', 'durable'), True),
                ('before_tombstone', ('before', 'tombstone'), True),
                ('after_state', ('after', 'thread_state'), 'suspended'), ('after_durable', ('after', 'durable'), False),
                ('after_transcript', ('after', 'transcript'), []), ('after_tombstone', ('after', 'tombstone'), True),
                ('after_record', ('after', 'thread_record_ref'), 'pmref:fixture:other_record')]
    if family == 'chat.thread_deleted':
        return [('before_hidden', ('before', 'visible'), False), ('before_tombstone', ('before', 'tombstone'), True),
                ('resurrection', ('before', 'deletion_record_ref'), 'pmref:fixture:earlier_deletion'),
                ('after_state', ('after', 'thread_state'), 'archived'), ('after_visible', ('after', 'visible'), True),
                ('undo', ('after', 'tombstone'), False), ('after_record', ('after', 'deletion_record_ref'), 'pmref:fixture:other_deletion'),
                ('worktree_choice', ('after', 'worktree_ref'), 'pmref:fixture:other_worktree')]
    if family == 'chat.thread_archived':
        changes = [('thread_identity', ('after', 'thread_id'), _other_thread(p['thread_id']))]
        for key, value in (('transcript', []), ('lineage_ref', 'pmref:fixture:other_lineage'), ('citations', []),
                           ('attachments', []), ('audit_ref', 'pmref:fixture:other_audit'), ('folder_ref', 'pmref:fixture:moved_folder'),
                           ('worktree_ref', 'pmref:fixture:removed_worktree')):
            changes.append(('preserve_' + key, ('after', 'preserved', key), value))
        return changes
    if family == 'chat.message':
        return [('already_committed', ('before', 'transcript'), base['before']['transcript'] + [p['message_id']]),
                ('not_appended', ('after', 'transcript'), list(base['before']['transcript'])),
                ('after_not_durable', ('after', 'thread_durable'), False), ('after_state', ('after', 'thread_state'), 'archived')]
    selection = p['selection_id']
    if family == 'bundle.selection_sent_to_chat':
        return [('existing_chip', ('before', 'chips', selection), copy.deepcopy(base['after']['chips'][selection])),
                ('chip_target_copy', ('after', 'chips', selection, 'target'), 'pmref:fixture:other_target'),
                ('chip_not_pending', ('after', 'chips', selection, 'state'), 'cleared'),
                ('message_appended', ('after', 'transcript'), base['after']['transcript'] + ['fixture_sent_message'])]
    return [('chip_cleared', ('after', 'chips'), {}), ('chip_reason', ('after', 'chips', selection, 'reason'), 'other_reason'),
            ('chip_state', ('after', 'chips', selection, 'state'), 'cleared'),
            ('message_created', ('after', 'transcript'), base['after']['transcript'] + ['fixture_message']),
            ('annotation_created', ('after', 'annotations'), base['after']['annotations'] + ['pmref:fixture:new_annotation'])]


def _intent_change(key, value):
    if key == 'thread_id':
        return _other_thread(value)
    if key == 'scope':
        return {**value, 'server_id': value['server_id'] + ':foreign'}
    if key == 'expected_thread_revision':
        return value + 1
    if key in ('attachment_refs', 'provenance_refs'):
        return value + ['pmref:fixture:foreign']
    if key == 'message_type':
        return 'system' if value != 'system' else 'error'
    if key == 'role':
        return 'system' if value != 'system' else 'tool'
    if key in ('actor_ref', 'requested_target', 'selection_excerpt_ref', 'content_ref'):
        return 'pmref:fixture:foreign'
    return value + ':foreign'


def ordinary_cases(selected=None):
    rows = {r['event_type']: r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']}
    data, branch_data = fixtures(), branches()
    for ref, values in data.items():
        base = values[0]
        family = base['record']['event_type']
        if selected is not None and family != selected:
            continue
        worlds = [(ref, base, 'complete original')] + [(ref + '/branch/' + b['name'], b['original'], 'owner branch ' + b['name'])
                                                         for b in branch_data[ref]]
        for world_ref, original, clause in worlds:
            yield Witness(world_ref + '/control', family, world_ref, {world_ref: [copy.deepcopy(original)]},
                          copy.deepcopy(original['record']), None, clause)
            for name, path, value, phase, row, owner in owner_changes(family, original):
                o = copy.deepcopy(original)
                _set(o, path, value)
                code = 'archive_refused' if phase.startswith(('ar_', 'th_archived')) else (
                    'selection_refused' if phase.startswith('bs_') else 'thread_refused')
                yield Witness(world_ref + '/owner/' + name, family, world_ref, {world_ref: [o]}, copy.deepcopy(o['record']),
                              (phase, row, code), owner)
            for name, path, value in state_changes(family, original):
                o = copy.deepcopy(original)
                _set(o, path, value)
                yield Witness(world_ref + '/state/' + name, family, world_ref, {world_ref: [o]}, copy.deepcopy(o['record']),
                              ('og_state', 'OG13_state_transition', 'original_refused'), 'owner transition ' + name)
        yield from coherent_cases(ref, family, base)
        yield from common_cases(ref, family, base, rows[family])


def coherent_cases(ref, family, base):
    """Coherently wrong worlds: payload, record, result and commitment agree, one owner predicate is false."""
    if family != 'bundle.selection_sent_to_chat':
        return
    o = copy.deepcopy(base)
    other = 'pmref:fixture:other_explicit'
    for holder in (o['record']['payload'], o['result']):
        holder['effective_target'] = other
    o['operation']['outcome'].update(resolution=dict(explicit_selection=other, owning_page_surface=None, new_thread=None),
                                     resolved_target=other)
    o['operation']['outcome']['chip']['target'] = other
    o['after']['chips'][base['result']['selection_id']]['target'] = other
    o['commitment']['sha256'] = full_value_commitment(o['record'])
    yield Witness(ref + '/coherent/explicit_not_requested', family, ref, {ref: [o]}, copy.deepcopy(o['record']),
                  ('bs_sent_a', 'BS02_explicit_requested', 'selection_refused'), 'ACD-611 an explicit selection is the requested target')
    o = copy.deepcopy(base)
    o['operation']['outcome']['resolved_target'] = 'pmref:fixture:other_surface'
    o['operation']['outcome']['resolution']['owning_page_surface'] = 'pmref:fixture:other_surface'
    yield Witness(ref + '/coherent/effective_copy', family, ref, {ref: [o]}, copy.deepcopy(o['record']),
                  ('bs_sent_a', 'BS05_effective_target', 'selection_refused'), 'ACD-611 record the effective target')


def common_cases(ref, family, base, row):
    def case(name, mutate, expected, clause):
        data = {ref: [copy.deepcopy(base)]}
        record = copy.deepcopy(base['record'])
        mutate(data, data[ref][0], record)
        return Witness(ref + '/' + name, family, ref, data, record, expected, clause)
    og = lambda r: ('og_original', r, 'original_refused')
    yield case('no_original', lambda d, o, r: d[ref].clear(), ('og_presence', 'OG01_original_present', 'source_unavailable'), 'SP-286 missing original')
    yield case('ambiguous_original', lambda d, o, r: d[ref].append(copy.deepcopy(o)), ('og_presence', 'OG01_original_present', 'source_unavailable'),
               'SP-286 unique original')
    yield case('source_store', lambda d, o, r: o.update(storage_instance_id='00000000-0000-4000-8000-000000000099'), og('OG02_original_store'),
               'actual original Store')

    def foreign_record(d, o, r):
        o['record']['actor_ref'] = o['record']['payload']['actor_ref'] = 'pmref:fixture:other_actor'
        o['commitment']['sha256'] = full_value_commitment(o['record'])
    yield case('original_record_copy', foreign_record, og('OG03_original_event'), 'independent original EventRecord')
    for key in INPUTS[family]:
        yield case('intent_' + key, lambda d, o, r, key=key: o['intent'].update({key: _intent_change(key, o['intent'][key])}),
                   og('OG04_intent_copies'), 'frozen accepted input ' + key)
    yield case('result_copy', lambda d, o, r: o['result'].update(actor_ref='pmref:fixture:other_actor'), og('OG05_result_copies'),
               'committed result body')

    def receipt_event(d, o, r):
        o['receipt']['event_id'] += ':other'
        o['first_receipt'] = copy.deepcopy(o['receipt'])
    yield case('receipt_event', receipt_event, og('OG06_receipt_event'), 'first receipt event identity')

    def receipt_sequence(d, o, r):
        o['receipt']['sequence_id'] += 1
        o['first_receipt'] = copy.deepcopy(o['receipt'])
    yield case('receipt_sequence', receipt_sequence, og('OG07_receipt_sequence'), 'first receipt Storage sequence')
    receipt = ('og_receipt', 'OG08_receipt_numbers', 'original_refused')
    for field in ('segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation'):
        for name, number in (('float', 1.0), ('overflow', 1 << 64)):
            def number_case(d, o, r, field=field, number=number):
                o['receipt'][field] = number
                o['first_receipt'] = copy.deepcopy(o['receipt'])
            yield case('receipt_' + field + '_' + name, number_case, receipt, 'SP-1100 receipt ' + field)
    for component in ('receipt', 'first_receipt'):
        yield case(component + '_sequence_float', lambda d, o, r, component=component: o[component].update(sequence_id=1.0), receipt,
                   'SP-1100 independent ' + component + ' sequence type')
    yield case('full_value_commitment', lambda d, o, r: o['commitment'].update(sha256='0' * 64),
               ('og_receipt', 'OG09_original_commitment', 'original_refused'), 'CV-339 whole original value')
    yield case('first_receipt_copy', lambda d, o, r: o['first_receipt'].update(commit_group_id='different_group'),
               ('og_receipt', 'OG10_receipt_identity', 'original_refused'), 'independent first receipt copy')
    other = FAMILIES[0] if family != FAMILIES[0] else FAMILIES[1]
    yield case('operation_identity', lambda d, o, r: o['operation'].update(event_type=other),
               ('og_transaction', 'OG11_operation_identity', 'original_refused'), 'exact family original operation')
    yield case('operation_order', lambda d, o, r: o['operation']['actions'].reverse(),
               ('og_transaction', 'OG12_operation_order', 'original_refused'), 'intent/effect/commit/readback/append/receipt/publish order')

    def unsupported_producer(d, o, r):
        r['producer_sequence_id'] = o['record']['producer_sequence_id'] = (1 << 53) + 1
        o['commitment']['sha256'] = full_value_commitment(o['record'])
    yield case('unsupported_producer_route', unsupported_producer, ('nw_producer', 'NW01_producer_route', 'producer_route_refused'),
               'CV-1100 current producer-semantic route qualification')
    yield case('original_sequence_float', lambda d, o, r: o['record'].update(sequence_id=1.0), ('ty_a', 'TY03_integer_type', 'type_refused'),
               'current original record exact integer type')
    if family == 'chat.thread_archived':
        for side in ('before', 'request'):
            key = 'revision' if side == 'before' else 'expected_revision'
            yield case('archive_' + side + '_' + key + '_float',
                       lambda d, o, r, side=side, key=key: o['archive'][side].update({key: float(o['archive'][side][key])}),
                       ('ty_a', 'TY03_integer_type', 'type_refused'), 'current archive source exact integer ' + key)

        def coherent_revision(d, o, r):
            o['archive']['before']['revision'] -= 1
            o['archive']['request']['expected_revision'] -= 1
        yield case('archive_stale_revision', coherent_revision, ('ar_state', 'AR13_expected_revision', 'archive_refused'),
                   'ACD-613 expected lifecycle revision at commit')
    for component in ('result', 'record', 'receipt', 'first_receipt', 'commitment'):
        yield case('schema_' + component, lambda d, o, r, component=component: o[component].update(unexpected=True), SD,
                   'complete ' + component + ' schema')
    yield case('schema_source', lambda d, o, r: o.update(unexpected=True), SD, 'closed original source wrapper')
    for key in ('intent', 'before', 'after', 'operation'):
        yield case('missing_' + key, lambda d, o, r, key=key: o.pop(key), SD, 'source required ' + key)
    if family == 'chat.thread_archived':
        yield case('missing_archive', lambda d, o, r: o.pop('archive'), SD, 'source required archive')


def cases(selected=None):
    yield from ordinary_cases(selected)


def checks(m):
    selected = getattr(m, 'SELECTED_FAMILY', None)
    rows = {r['event_type']: r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']}
    for c in cases(selected):
        before = copy.deepcopy(c.originals)
        got = m.thread_event_outcome(c.record, rows[c.family], c.original_ref, c.originals)
        yield c.family + ': CH2 ' + c.name, got == c.expected and before == c.originals
    # rt_original (CV-366): an incoming retry whose only defect is its payload edition (RT08), under each
    # CH2 family's own retained original. The existing payload-only retry witness belongs to a CH1 family.
    for f in json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text()):
        if f['event_type'] not in FAMILIES or selected is not None and f['event_type'] != selected:
            continue
        retry = copy.deepcopy(f['record'])
        retry['payload']['unexpected'] = True
        before = copy.deepcopy(f)
        got = m.retry_outcome(f['record'], retry, True, f['historical_source'])
        yield f['event_type'] + ': CH2 ' + f['edition'] + ' retry payload edition refused', got == 'invalid_input_type' and before == f


# --------------------------------------------------------------- Stop
def stop_data():
    return json.loads((ROOT/'tests/fixtures/dch_c12_ch2/stop_originals.json').read_text())


def stop_custody():
    return json.loads((ROOT/'tests/fixtures/dch_c12_ch2/stop_custody.json').read_text())


def _stop_intent_change(key, value):
    if key == 'thread_id':
        return _other_thread(value)
    if key == 'scope':
        return {**value, 'server_id': value['server_id'] + ':foreign'}
    if key == 'target_work':
        return list(reversed(value))
    if key == 'ts':
        return '2026-11-04T00:00:09Z'
    if key == 'stop_reason_code':
        return 'other_reason'
    if key == 'actor_ref':
        return 'pmref:fixture:foreign'
    return value + ':foreign'


def stop_request_cases():
    """Current Stop writer route over the independently held original operation."""
    import pm_dch_stop as stop
    data = stop_data()
    for ref, values in data['originals'].items():
        base = values[0]
        worlds = [(ref, base, 'complete original')] + [(ref + '/branch/' + b['name'], b['original'], 'owner branch ' + b['name'])
                                                         for b in data['branches'][ref]]
        for world_ref, original, clause in worlds:
            yield Witness(world_ref + '/control', STOP, world_ref, {world_ref: [copy.deepcopy(original)]},
                          copy.deepcopy(original['record']), None, clause)

        def case(name, mutate, expected, clause):
            world = {ref: [copy.deepcopy(base)]}
            record = copy.deepcopy(base['record'])
            mutate(world, world[ref][0], record)
            return Witness(ref + '/' + name, STOP, ref, world, record, expected, clause)
        so = lambda r: ('so_protocol', r, 'stop_request_refused')
        og = lambda r: ('og_original', r, 'original_refused')
        yield case('inactive_reply', lambda w, o, r: o['reply'].update(active=False), so('SO01_active_reply'), 'ACD-627 actual active reply')
        yield case('other_turn', lambda w, o, r: o['reply'].update(assistant_turn_id='assistant-turn-9'), so('SO02_active_turn'),
                   'ACD-627 actual active assistant_turn_id')
        yield case('target_snapshot', lambda w, o, r: o['reply'].update(target_work=o['reply']['target_work'][:-1]), so('SO03_target_snapshot'),
                   'ACD-627 exact reply work and leases')
        yield case('target_order', lambda w, o, r: o['reply'].update(target_work=list(reversed(o['reply']['target_work']))),
                   so('SO03_target_snapshot'), 'ACD-628 list order preserved')
        yield case('long_grace', lambda w, o, r: o['pending'].update(deadline_ms=o['pending']['start_ms'] + 3001), so('SO04_grace_deadline'),
                   'ACD-627 cancel_grace_ms = 3000')
        yield case('short_grace', lambda w, o, r: o['pending'].update(deadline_ms=o['pending']['start_ms'] + 2999), so('SO04_grace_deadline'),
                   'ACD-627 cancel_grace_ms = 3000')
        yield case('float_deadline', lambda w, o, r: o['pending'].update(deadline_ms=float(o['pending']['deadline_ms'])),
                   ('ty_b', 'TY08_leaf_type', 'type_refused'), 'CV-1100 exact integer milliseconds (shared type walk)')
        yield case('restarted_grace', lambda w, o, r: o['pending'].update(grace_starts=['fixture_grace_start', 'fixture_restart']),
                   so('SO05_single_grace'), 'ACD-627 retries and restart never start a new grace')
        yield case('foreign_lease', lambda w, o, r: o['delivery'].update(leases=o['delivery']['leases'][:-1] + ['pmref:lease:background']),
                   so('SO06_delivery_leases'), 'ACD-627/471 deliver only to the frozen leases')
        yield case('queue_released', lambda w, o, r: o['pending'].update(queue_held=False), so('SO07_queue_held'), 'ACD-471 Stop holds the queue')
        yield case('no_original', lambda w, o, r: w[ref].clear(), ('og_presence', 'OG01_original_present', 'source_unavailable'),
                   'SP-286 missing original')
        yield case('ambiguous_original', lambda w, o, r: w[ref].append(copy.deepcopy(o)), ('og_presence', 'OG01_original_present', 'source_unavailable'),
                   'SP-286 unique original')
        yield case('source_store', lambda w, o, r: o.update(storage_instance_id='00000000-0000-4000-8000-000000000099'), og('OG02_original_store'),
                   'actual original Store')

        def foreign_record(w, o, r):
            o['record']['actor_ref'] = o['record']['payload']['actor_ref'] = 'pmref:fixture:other_actor'
            o['commitment']['sha256'] = full_value_commitment(o['record'])
        yield case('original_record_copy', foreign_record, og('OG03_original_event'), 'independent original EventRecord')
        for key in stop.ACCEPTED_FIELDS:
            yield case('intent_' + key, lambda w, o, r, key=key: o['intent'].update({key: _stop_intent_change(key, o['intent'][key])}),
                       og('OG04_intent_copies'), 'ACD-627 frozen accepted intent ' + key)
        yield case('result_copy', lambda w, o, r: o['result'].update(stop_reason_code='other_reason'), og('OG05_result_copies'),
                   'committed request body')

        def receipt_event(w, o, r):
            o['receipt']['event_id'] += ':other'
            o['first_receipt'] = copy.deepcopy(o['receipt'])
        yield case('receipt_event', receipt_event, og('OG06_receipt_event'), 'first receipt event identity')

        def receipt_sequence(w, o, r):
            o['receipt']['sequence_id'] += 1
            o['first_receipt'] = copy.deepcopy(o['receipt'])
        yield case('receipt_sequence', receipt_sequence, og('OG07_receipt_sequence'), 'first receipt Storage sequence')
        for field in ('segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation'):
            for name, number in (('float', 1.0), ('overflow', 1 << 64)):
                def number_case(w, o, r, field=field, number=number):
                    o['receipt'][field] = number
                    o['first_receipt'] = copy.deepcopy(o['receipt'])
                yield case('receipt_' + field + '_' + name, number_case, ('og_receipt', 'OG08_receipt_numbers', 'original_refused'),
                           'SP-1100 receipt ' + field)
        yield case('full_value_commitment', lambda w, o, r: o['commitment'].update(sha256='0' * 64),
                   ('og_receipt', 'OG09_original_commitment', 'original_refused'), 'CV-339 whole original value')
        yield case('first_receipt_copy', lambda w, o, r: o['first_receipt'].update(commit_group_id='different_group'),
                   ('og_receipt', 'OG10_receipt_identity', 'original_refused'), 'independent first receipt copy')
        yield case('operation_identity', lambda w, o, r: o['operation'].update(event_type='chat.message'),
                   ('og_transaction', 'OG11_operation_identity', 'original_refused'), 'exact Stop original operation')
        yield case('delivery_before_receipt', lambda w, o, r: o['operation'].update(actions=['intent', 'freeze_deadline', 'append', 'deliver', 'receipt']),
                   ('og_transaction', 'OG12_operation_order', 'original_refused'), 'ACD-627 first receipt before cancellation delivery')
        yield case('deadline_after_delivery', lambda w, o, r: o['operation'].update(actions=['intent', 'append', 'receipt', 'deliver', 'freeze_deadline']),
                   ('og_transaction', 'OG12_operation_order', 'original_refused'), 'ACD-627 deadline frozen before delivery')
        for flag, value, row in (('writer_admitted', False, 'RQ11_writer_admitted'), ('active_reply', False, 'RQ12_active_reply'),
                                 ('dedupe_available', False, 'RQ13_dedupe_available'), ('retained', False, 'RQ05_retained'),
                                 ('authorized', False, 'RQ06_authorized'), ('hold_access_allowed', False, 'RQ07_hold_access'),
                                 ('deleted', True, 'RQ08_not_deleted'), ('withdrawn', True, 'RQ09_not_withdrawn')):
            phase = 'st_request_writer' if row[:4] in ('RQ11', 'RQ12', 'RQ13') else 'st_request_access'
            yield case('context_' + flag, lambda w, o, r, flag=flag, value=value: o['context'].update({flag: value}),
                       (phase, row, 'stop_request_refused'), 'ACD-627 current ' + flag)
        yield case('context_commitment', lambda w, o, r: o['context'].update(source_value_sha256='0' * 64),
                   ('st_request_access', 'RQ10_source_commitment', 'stop_request_refused'), 'SP-627 original byte commitment')
        yield case('context_accepted', lambda w, o, r: o['context']['accepted'].update(stop_reason_code='other_reason'),
                   ('st_request_accepted', 'RQ16_accepted_copies', 'stop_request_refused'), 'ACD-627 accepted intent copy')

        def unsupported_producer(w, o, r):
            r['producer_sequence_id'] = o['record']['producer_sequence_id'] = (1 << 53) + 1
            o['commitment']['sha256'] = full_value_commitment(o['record'])
            o['context']['source_value_sha256'] = stop.commitment(r)
        yield case('unsupported_producer_route', unsupported_producer, ('nw_producer', 'NW01_producer_route', 'producer_route_refused'),
                   'CV-647/CV-1100 current Stop producer route')
        yield case('original_sequence_float', lambda w, o, r: o['record'].update(sequence_id=1.0), ('ty_a', 'TY03_integer_type', 'type_refused'),
                   'current original record exact integer type')
        for component in ('result', 'record', 'receipt', 'first_receipt', 'commitment'):
            yield case('schema_' + component, lambda w, o, r, component=component: o[component].update(unexpected=True), SD,
                       'complete ' + component + ' schema')
        yield case('schema_source', lambda w, o, r: o.update(unexpected=True), SD, 'closed original source wrapper')
        for key in ('intent', 'context', 'reply', 'pending', 'delivery', 'operation'):
            yield case('missing_' + key, lambda w, o, r, key=key: o.pop(key), SD, 'source required ' + key)


@dataclass
class SealedWitness:
    name: str
    surface: str
    data: dict
    custody: dict
    expected: object
    clause: str


def sealed_bases():
    """Positive owner-fixture historical reads, expanded literally (no recomputation)."""
    fixture = json.loads((ROOT/'Plans/dch_stop_contract_fixtures.json').read_text())
    seen = set()
    for case in fixture['cases']:
        if case['changes'] or case['expected'] is not True or case['surface'] not in ('request', 'outcome', 'read', 'queue', 'index'):
            continue
        data = copy.deepcopy(fixture['bases'][case['base_id']])
        if case['surface'] == 'request':
            if not data.get('historical'):
                continue
            surface, data = 'history', dict(record=data['record'], context=data['context'])
        else:
            surface = case['surface']
        key = (surface, case['base_id'])
        if key in seen:
            continue
        seen.add(key)
        yield case['base_id'], surface, data


def _sealed_context(surface, data):
    return data['context'] if surface in ('history', 'index') else data['context']['request_context']


def sealed_cases():
    custody = stop_custody()
    for base_id, surface, data in sealed_bases():
        label = surface + '/' + base_id
        yield SealedWitness(label + '/control', surface, data, copy.deepcopy(custody), None, 'SP-627 sealed original read')
        context = _sealed_context(surface, data)
        store, digest = context['storage_instance_id'], context['source_value_sha256']

        def world(change):
            c = copy.deepcopy(custody)
            change(c, [r for r in c['receipts'] if r['storage_instance_id'] == store and r['source_value_sha256'] == digest])
            return c
        def remove_store(c, mine):
            c['custody_stores'] = [s for s in c['custody_stores'] if s != store]
        yield SealedWitness(label + '/store_outside_custody', surface, data, world(remove_store),
                            ('st_custody', 'SK01_custody_store', 'original_unavailable'), 'SP-627 Store outside sealed custody')
        def remove_receipt(c, mine):
            c['receipts'] = [r for r in c['receipts'] if r not in mine]
        yield SealedWitness(label + '/missing_receipt', surface, data, world(remove_receipt),
                            ('st_custody', 'SK02_receipt_present', 'original_unavailable'), 'ACD-628 missing original custody holds the queue')
        def duplicate(c, mine):
            c['receipts'].append(copy.deepcopy(mine[0]))
        yield SealedWitness(label + '/ambiguous_receipt', surface, data, world(duplicate),
                            ('st_custody', 'SK03_receipt_unique', 'recipe_unsupported'), 'SP-1101 one sealed receipt')
        def other_edition(c, mine):
            mine[0]['recipe_id'] = 'dch-stop-v0'
        yield SealedWitness(label + '/other_edition', surface, data, world(other_edition),
                            ('st_custody', 'SK04_receipt_edition', 'recipe_unsupported'), 'CV-647 one current Stop edition')
        def other_resources(c, mine):
            mine[0]['resource_manifest_sha256'] = '0' * 64
        yield SealedWitness(label + '/other_resources', surface, data, world(other_resources),
                            ('st_custody', 'SK04_receipt_edition', 'recipe_unsupported'), 'pinned Stop schema resources')
        def other_original(c, mine):
            mine[0]['binding']['event_id'] += ':other'
        yield SealedWitness(label + '/receipt_for_other_original', surface, data, world(other_original),
                            ('st_custody_binding', 'SK05_receipt_binding', 'original_unavailable'), 'SP-1101 receipt binding')
        def other_operation(c, mine):
            mine[0]['binding']['owner_operation_id'] += ':other'
        yield SealedWitness(label + '/receipt_for_other_operation', surface, data, world(other_operation),
                            ('st_custody_binding', 'SK05_receipt_binding', 'original_unavailable'), 'SP-1101 owner operation binding')
        if surface == 'index':
            # One coherent world whose generation id is joined everywhere but breaks its owner pattern.
            bad = copy.deepcopy(data)
            old_id = bad['token']['generation_id']
            new_id = 'eig_' + 'A' * 64
            def swap(value):
                if isinstance(value, dict):
                    return {(new_id if k == old_id else k): swap(v) for k, v in value.items()}
                if isinstance(value, list):
                    return [swap(v) for v in value]
                return value.replace(old_id, new_id) if isinstance(value, str) else value
            bad['token'], bad['source'] = swap(bad['token']), swap(bad['source'])
            yield SealedWitness(label + '/token_owner_pattern', surface, bad, copy.deepcopy(custody), SD,
                                'SP-627/DL-076 nine-field token owner constraints')
        changed = copy.deepcopy(data)
        record = changed['record'] if surface in ('history', 'index') else changed['context']['request']
        if record['payload_ref'] is None:
            record['payload']['stop_reason_code'] = 'changed_after_seal'
            yield SealedWitness(label + '/bytes_changed_under_seal', surface, changed, copy.deepcopy(custody),
                                ('st_request_access', 'RQ10_source_commitment', 'stop_request_refused'),
                                'ACD-628 historical reads validate exact original bytes')


def stop_cases():
    yield from stop_request_cases()


def stop_checks():
    import pm_dch_stop as stop
    for c in stop_request_cases():
        before = copy.deepcopy(c.originals)
        got = stop.request_original_outcome(c.record, c.original_ref, c.originals)
        yield STOP + ': CH2 ' + c.name, got == c.expected and before == c.originals
    for c in sealed_cases():
        before = (copy.deepcopy(c.custody), copy.deepcopy(c.data))
        got = stop.sealed_outcome(c.surface, c.data, c.custody)
        yield STOP + ': CH2 sealed ' + c.name, got == c.expected and before == (c.custody, c.data)


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
