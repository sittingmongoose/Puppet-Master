"""CH2 original thread, message and bundle-selection operations, composed with the DCH checker.

Deterministic, synthetic source observations for the six ordinary CH2 families
(ACD-610..615). An independently held store supplies the frozen accepted
intent, committed result, EventRecord, first receipt, full-value commitment and
before/after owner snapshots. The reader never creates any of them. Native
transcript, thread lifecycle, chip, redb and receipt-authentication execution
remains NOT_RUN. The witness containers add no product field or numeric limit.
"""
import copy
import json
from pathlib import Path

from pm_dch_formats import validator
from pm_event_numbers import Refusal, full_value_commitment, storage_uint64

ROOT = Path(__file__).resolve().parents[1]
FAMILIES = ('bundle.selection_forward_blocked', 'bundle.selection_sent_to_chat', 'chat.message',
            'chat.thread_archived', 'chat.thread_created', 'chat.thread_deleted')
# The accepted input each producer freezes before its effect (owner text:
# "freeze operation_id from the original accepted operation before its effect").
# Results the effect itself produces (a minted thread id, a resolved target, a
# block reason, a committed revision or record) are not inputs.
INPUTS = {
    'bundle.selection_forward_blocked': ('operation_id', 'scope', 'computer_id', 'thread_id', 'actor_ref',
                                         'bundle_id', 'doc_id', 'selection_id', 'requested_target'),
    'bundle.selection_sent_to_chat': ('operation_id', 'scope', 'computer_id', 'actor_ref', 'bundle_id', 'doc_id',
                                      'selection_id', 'requested_target', 'selection_excerpt_ref', 'provenance_refs'),
    'chat.message': ('operation_id', 'scope', 'computer_id', 'thread_id', 'actor_ref', 'message_id', 'message_type',
                     'role', 'content_ref', 'attachment_refs'),
    'chat.thread_archived': ('operation_id', 'scope', 'computer_id', 'thread_id', 'actor_ref', 'expected_thread_revision'),
    'chat.thread_created': ('operation_id', 'scope', 'computer_id', 'actor_ref', 'first_message_id'),
    'chat.thread_deleted': ('operation_id', 'scope', 'computer_id', 'thread_id', 'actor_ref'),
}
OWNER_PHASES = {
    'bundle.selection_forward_blocked': ('bs_blocked',),
    'bundle.selection_sent_to_chat': ('bs_sent_a', 'bs_sent_b'),
    'chat.message': ('th_message_a', 'th_message_b'),
    'chat.thread_archived': ('th_archived', 'ar_request', 'ar_state', 'ar_commit'),
    'chat.thread_created': ('th_created',),
    'chat.thread_deleted': ('th_deleted',),
}
RECEIPT_NUMBERS = ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')
RECEIPT_SCHEMA = json.loads((ROOT/'Plans/event_append_receipt_contracts.schema.json').read_text())['$defs']
ORDER = ['intent', 'effect', 'commit', 'readback', 'append', 'receipt', 'publish']
# ACD-071 lifecycle states. Witness containers admit every state so a wrong
# lifecycle source reaches its own owner row instead of the wrapper schema.
LIFECYCLE = ['creating', 'active', 'suspended', 'archived', 'deleted']
TRANSIENT = ('composer', 'queue', 'cache')
MESSAGE_FIELDS = ('message_id', 'message_type', 'role', 'content_ref', 'attachment_refs')
CHIP_FIELDS = ('selection_id', 'excerpt_ref', 'provenance_refs')


def closed(properties, required=None):
    return dict(type='object', additionalProperties=False, properties=properties,
                required=list(properties) if required is None else required)


TEXT = dict(type='string', minLength=1)
BOOLEAN = dict(type='boolean')
NULLABLE_TEXT = dict(type=['string', 'null'])
TEXTS = dict(type='array', items=TEXT)


# Lists an owner requires to stay empty (no cleanup, nothing created) are any
# JSON array: the owner row refuses every member, the shared walk types each leaf.
ANY_LIST = dict(type='array')


def state_schema(family, side):
    if family == 'chat.thread_created':
        # Before the first user message commits there is no durable transcript at all.
        fields = dict(thread_state=dict(enum=LIFECYCLE), durable=BOOLEAN, tombstone=BOOLEAN, thread_record_ref=NULLABLE_TEXT)
        if side == 'after':
            fields['transcript'] = TEXTS
        return closed(fields)
    if family == 'chat.thread_deleted':
        return closed(dict(thread_state=dict(enum=LIFECYCLE), visible=BOOLEAN, tombstone=BOOLEAN, worktree_ref=NULLABLE_TEXT,
                           deletion_record_ref=NULLABLE_TEXT))
    if family == 'chat.thread_archived':
        return closed(dict(thread_id=TEXT, listed_active=BOOLEAN,
                           preserved=closed(dict(transcript=TEXTS, lineage_ref=TEXT, citations=TEXTS, attachments=TEXTS,
                                                 audit_ref=TEXT, folder_ref=NULLABLE_TEXT, worktree_ref=NULLABLE_TEXT)),
                           transient=closed({k: BOOLEAN for k in TRANSIENT})))
    if family == 'chat.message':
        return closed(dict(thread_durable=BOOLEAN, thread_state=dict(enum=LIFECYCLE), transcript=TEXTS))
    chip = closed(dict(target=TEXT, state=TEXT, excerpt_ref=NULLABLE_TEXT, provenance_refs=TEXTS, reason=NULLABLE_TEXT))
    fields = dict(chips=dict(type='object', additionalProperties=chip), transcript=TEXTS)
    if family == 'bundle.selection_forward_blocked':
        fields['annotations'] = TEXTS
    return closed(fields)


def outcome_schema(family):
    if family == 'chat.thread_created':
        return closed(dict(command=TEXT, first_message=closed(dict(message_id=TEXT, role=TEXT, committed=BOOLEAN)),
                           commit_groups=closed(dict(message=TEXT, thread=TEXT)), thread_record_ref=TEXT,
                           discard_empty_draft=BOOLEAN))
    if family == 'chat.thread_deleted':
        return closed(dict(command=TEXT, deletion_record=closed(dict(ref=TEXT, content_free=BOOLEAN, storage_owned=BOOLEAN)),
                           hidden=BOOLEAN))
    if family == 'chat.thread_archived':
        return closed(dict(handler=TEXT, dispatched_by=TEXT, cas_commits=TEXTS, cleanup_actions=ANY_LIST, pruned=TEXTS))
    if family == 'chat.message':
        message = closed(dict(message_id=TEXT, message_type=TEXT, role=TEXT, content_ref=TEXT, attachment_refs=TEXTS))
        return closed(dict(handler=TEXT, boundary=TEXT, message=message, commits=TEXTS, creates_thread=BOOLEAN,
                           lineage_owner=TEXT))
    if family == 'bundle.selection_sent_to_chat':
        return closed(dict(handler=TEXT, resolution=closed(dict(explicit_selection=NULLABLE_TEXT,
                                                                owning_page_surface=NULLABLE_TEXT, new_thread=NULLABLE_TEXT)),
                           resolved_target=TEXT, resolutions=TEXTS,
                           chip=closed(dict(selection_id=TEXT, target=TEXT, state=TEXT, excerpt_ref=TEXT, provenance_refs=TEXTS)),
                           message_sent=BOOLEAN))
    return closed(dict(handler=TEXT, blocked=BOOLEAN, block_class=TEXT, reason=TEXT, handoff_claimed=BOOLEAN, created=ANY_LIST))


def archive_schema(edition, props):
    """The existing archive_joins source shape (before/after/request), every value typed, nothing narrowed."""
    copies = {k: copy.deepcopy(props[k]) for k in ('thread_id', 'computer_id', 'scope', 'operation_id')}
    revision = dict(type='integer', minimum=0)
    return closed(dict(
        before=closed({**copies, 'state': dict(enum=LIFECYCLE), 'revision': revision, 'active_run': BOOLEAN}),
        after=closed({**copies, 'state': dict(enum=LIFECYCLE), 'revision': revision, 'record_ref': TEXT,
                      'readback_available': BOOLEAN}),
        request=closed({**copies, 'origin': TEXT, 'command_id': TEXT, 'expected_revision': revision,
                        'permission_allowed': BOOLEAN, 'thread_selected': BOOLEAN})))


def source_schema(row, edition):
    """Witness-container shape only; existing owners validate payload, record, receipt and commitment."""
    family = row['event_type']
    props = json.loads((ROOT/row['payload_schema_ref']).read_text())['$defs'][edition]['properties']
    intent = closed({k: copy.deepcopy(props[k]) for k in INPUTS[family]})
    fields = dict(storage_instance_id=TEXT, intent=intent, result=dict(type='object'), record=dict(type='object'),
                  receipt=dict(type='object'), first_receipt=dict(type='object'), commitment=dict(type='object'),
                  before=state_schema(family, 'before'), after=state_schema(family, 'after'),
                  operation=closed(dict(event_type=TEXT, operation_id=TEXT, actions=TEXTS, outcome=outcome_schema(family))))
    if family == 'chat.thread_archived':
        fields['archive'] = archive_schema(edition, props)
    return closed(fields)


def _first(*values):
    return next((v for v in values if v is not None), None)


def owner_outcome(m, family, p, original):
    """Derive independent source observations; only named family rows refuse."""
    o = original['operation']['outcome']
    b, a = original['before'], original['after']
    if family == 'chat.thread_created':
        first = o['first_message']
        m.require('th_created', dict(command=o['command'], role=first['role'], message_committed=first['committed'],
                                     message_id=first['message_id'], payload_first_message_id=p['first_message_id'],
                                     message_commit_group=o['commit_groups']['message'],
                                     thread_commit_group=o['commit_groups']['thread'],
                                     record_ref=o['thread_record_ref'], payload_record_ref=p['thread_record_ref'],
                                     discard_empty_draft=o['discard_empty_draft']))
    elif family == 'chat.thread_deleted':
        record = o['deletion_record']
        m.require('th_deleted', dict(command=o['command'], before_state=b['thread_state'], previous_state=p['previous_state'],
                                     deletion_ref=record['ref'], payload_deletion_ref=p['deletion_record_ref'],
                                     content_free=record['content_free'], storage_owned=record['storage_owned'],
                                     hidden=o['hidden']))
    elif family == 'chat.thread_archived':
        m.require('th_archived', dict(handler=o['handler'], dispatched_by=o['dispatched_by'], cas_attempts=len(o['cas_commits']),
                                      cleanup_actions=o['cleanup_actions'],
                                      pruned_outside=[x for x in o['pruned'] if x not in TRANSIENT],
                                      listed_active=a['listed_active']))
        # The existing DL-287 archive request/lifecycle/commit rows, over the
        # independently held original archive source rather than a caller fixture.
        m._archive_joins(p, original['archive'])
    elif family == 'chat.message':
        message = o['message']
        m.require('th_message_a', dict(handler=o['handler'], boundary=o['boundary'],
                                       copy_mismatches=[k for k in MESSAGE_FIELDS if message[k] != p[k]],
                                       commit_count=len(o['commits'])))
        m.require('th_message_b', dict(thread_durable_before=b['thread_durable'], role=message['role'],
                                       creates_thread=o['creates_thread'], lineage_owner=o['lineage_owner']))
    elif family == 'bundle.selection_sent_to_chat':
        r = o['resolution']
        m.require('bs_sent_a', dict(handler=o['handler'], explicit=r['explicit_selection'], requested=p['requested_target'],
                                    resolved=o['resolved_target'],
                                    expected_target=_first(r['explicit_selection'], r['owning_page_surface'], r['new_thread']),
                                    resolution_count=len(o['resolutions']), payload_effective=p['effective_target']))
        chip = o['chip']
        m.require('bs_sent_b', dict(chip_state=chip['state'], chip_target=chip['target'], resolved=o['resolved_target'],
                                    chip_mismatches=[k for k, pk in (('selection_id', 'selection_id'),
                                                                     ('excerpt_ref', 'selection_excerpt_ref'),
                                                                     ('provenance_refs', 'provenance_refs')) if chip[k] != p[pk]],
                                    message_sent=o['message_sent']))
    elif family == 'bundle.selection_forward_blocked':
        m.require('bs_blocked', dict(handler=o['handler'], blocked=o['blocked'], block_class=o['block_class'],
                                     reason=o['reason'], payload_reason=p['reason_code'],
                                     handoff_claimed=o['handoff_claimed'], created=o['created']))
    else:
        raise ValueError('not a CH2 family: ' + family)


def state_transition(family, p, original):
    """The owner transition between the independent before/after snapshots (observation only)."""
    b, a = original['before'], original['after']
    if family == 'chat.thread_created':
        # creating to active occurs once; the first message and canonical thread commit together.
        return (b['thread_state'] == 'creating' and b['durable'] is False and b['tombstone'] is False
                and a['thread_state'] == 'active' and a['durable'] is True and a['transcript'] == [p['first_message_id']]
                and a['tombstone'] is False and a['thread_record_ref'] == p['thread_record_ref'])
    if family == 'chat.thread_deleted':
        # Hidden at once behind a content-free tombstone; no undo or resurrection; worktree choice independent.
        return (b['visible'] is True and b['tombstone'] is False and b['deletion_record_ref'] is None
                and a['thread_state'] == 'deleted' and a['visible'] is False and a['tombstone'] is True
                and a['deletion_record_ref'] == p['deletion_record_ref'] and a['worktree_ref'] == b['worktree_ref'])
    if family == 'chat.thread_archived':
        # Thread id, transcript, lineage, citations, attachments, audit metadata and folder/worktree are preserved.
        return a['thread_id'] == b['thread_id'] == p['thread_id'] and a['preserved'] == b['preserved']
    if family == 'chat.message':
        # One canonical message appended at the durable boundary, in a durable active thread.
        return (p['message_id'] not in b['transcript'] and a['transcript'] == b['transcript'] + [p['message_id']]
                and a['thread_durable'] is True and a['thread_state'] == 'active')
    selection = p['selection_id']
    if family == 'bundle.selection_sent_to_chat':
        # A new visible pending chip records the effective target; no message is sent.
        chip = dict(target=p['effective_target'], state='pending', excerpt_ref=p['selection_excerpt_ref'],
                    provenance_refs=p['provenance_refs'], reason=None)
        return (selection not in b['chips'] and a['chips'] == {**b['chips'], selection: chip}
                and a['transcript'] == b['transcript'])
    # Blocked: the pending chip stays visible with its exact reason; nothing is cleared or created.
    before = b['chips'].get(selection)
    return (type(before) is dict and before.get('state') == 'pending'
            and a['chips'] == {**b['chips'], selection: {**before, 'reason': p['reason_code']}}
            and a['transcript'] == b['transcript'] and a['annotations'] == b['annotations'])


def check_original(m, record, row, original_ref, originals, store):
    """The complete route: current schemas, source, receipt, owner outcome and transition.

    Missing or ambiguous originals refuse before a source field is read. The
    independent original and its first receipt are read-only on every path.
    """
    family = row['event_type']
    matches = originals.get(original_ref, [])
    m.require('og_presence', dict(original_count=len(matches)))
    o = matches[0]
    envelope = validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()))
    m._schema_admission(record, envelope)
    edition = record['scope_kind']
    m._schema_admission(o, validator(source_schema(row, edition)))
    # Current operation evidence is an independent integer/type boundary too.
    # Receipts use their own explicit storage_uint64 calls below.
    m._input_types({'source': {k: v for k, v in o.items() if k not in ('receipt', 'first_receipt')}})
    p = m._current_record(record, row, o.get('payload_source'), store)
    m._schema_admission(o['record'], envelope)
    m._schema_admission(o['result'], validator(json.loads((ROOT/row['payload_schema_ref']).read_text())))
    m._schema_admission(o['receipt'], validator(RECEIPT_SCHEMA['AppendReceipt']))
    m._schema_admission(o['first_receipt'], validator(RECEIPT_SCHEMA['AppendReceipt']))
    m._schema_admission(o['commitment'], validator(RECEIPT_SCHEMA['original_event_value_commitment']))
    m.require('og_original', dict(original_store=o['storage_instance_id'], store=store, record_equal=record == o['record'],
                                  intent_mismatches=[k for k in INPUTS[family] if o['intent'][k] != p[k]],
                                  result_equal=p == o['result'], receipt_event=o['receipt']['event_id'],
                                  original_event=o['record']['event_id'], receipt_sequence=o['receipt']['sequence_id'],
                                  original_sequence=o['record']['sequence_id']))
    refusals = []
    for component in ('receipt', 'first_receipt'):
        for k in RECEIPT_NUMBERS:
            try:
                storage_uint64(o[component][k])
            except Refusal as e:
                refusals.append([component + '/' + k, e.reason])
    m.require('og_receipt', dict(number_refusals=refusals, commitment=o['commitment']['sha256'],
                                 expected_commitment=full_value_commitment(o['record']),
                                 receipt_equal=o['receipt'] == o['first_receipt']))
    m.require('og_transaction', dict(
        operation_identity=o['operation']['event_type'] == family and o['operation']['operation_id'] == o['intent']['operation_id'],
        operation_order=o['operation']['actions'] == ORDER))
    owner_outcome(m, family, p, o)
    m.require('og_state', dict(state_transition=state_transition(family, p, o)))
    return True


def fixtures():
    return json.loads((ROOT/'tests/fixtures/dch_c12_ch2/originals.json').read_text())


def branches():
    return json.loads((ROOT/'tests/fixtures/dch_c12_ch2/branches.json').read_text())


def checks(m):
    """Original controls are authored fixture inputs; never inferred from acceptance."""
    data = fixtures()
    rows = {r['event_type']: r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']}
    selected = getattr(m, 'SELECTED_FAMILY', None)
    for original_ref, values in data.items():
        family = values[0]['record']['event_type']
        if selected is not None and family != selected:
            continue
        before = copy.deepcopy(data)
        ok = m.thread_event_valid(values[0]['record'], rows[family], original_ref, data)
        yield family + ': CH2 committed original source ' + original_ref, ok and data == before


def publication_checks(m):
    """Compose the original operation and first receipt with the unchanged SP-278 publication graph."""
    data = fixtures()
    rows = {r['event_type']: r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']}
    selected = getattr(m, 'SELECTED_FAMILY', None)
    for cp in json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text()):
        family = cp['event_type']
        if family not in FAMILIES or selected and family != selected:
            continue
        ref = family + '/' + cp['source']['event_record']['scope_kind']
        before = copy.deepcopy(data)
        ok = m.thread_checkpoint_valid(cp['valid'], cp['source'], rows[family], cp['key'], ref, data)
        yield family + ': CH2 original receipt to SP-278 publication', ok and before == data
        foreign = copy.deepcopy(data)
        foreign[ref][0]['receipt']['event_id'] += ':foreign'
        foreign[ref][0]['first_receipt'] = copy.deepcopy(foreign[ref][0]['receipt'])
        yield (family + ': CH2 checkpoint cannot use a foreign first receipt',
               not m.thread_checkpoint_valid(cp['valid'], cp['source'], rows[family], cp['key'], ref, foreign))
