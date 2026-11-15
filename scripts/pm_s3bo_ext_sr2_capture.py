"""C12-SR2: restore_point.created capture selection (DL-693, ACD-465 "Capture selection").

Co-extension (pm_s3bo_oracles EXTENSION CONTRACT, CO-EXTENSIONS) of the
restore_point.created boundary owned by pm_s3bo_ext_sr_created. It adds the
rule Jared chose on card E10-1, option A, "Everything up to that message,
sorted by kind": cmd.chat.create_restore_point fills the four frozen capture
lists from the source branch's persisted transcript up to and including the
boundary message, each list from its own kind of record:

  context_refs     items in the chat's context at the boundary (added at or
                   before it and not removed between that addition and it),
                   in the order of those additions;
  provenance_refs  per answer in range: its tool calls' sources in call
                   order, then the sources its model run records as used;
  attachment_refs  each message's attachments[], in message order;
  citation_refs    each answer's citations[], in message order;

each ref once at its first place; the record's context_provenance_refs is
context_refs followed by each provenance ref not already in it. Messages after
the boundary, other branches and threads, drafts, queued messages and streams
add nothing. Unplaceable context, an unresolved selected ref or forbidden
selected material refuses or quarantines; nothing is dropped or redacted.

The presented source transcript is a fixture of the persisted owner records as
the creation owner reads them (message taxonomy, ACD section 11). The checker
selects from it independently and compares the selection with one designated
copy per list: the frozen capture for the context/provenance split (the only
copies that keep the split) and the canonical record for attachments,
citations and the merged order. The owner's rows (sr_cre_split, sr_cre_union)
keep every other copy equal, so each defect has exactly one refusing row.
Every expected capture in this file is written out by hand, never computed by
select(). Native execution remains NOT_RUN.
"""
import contextlib
import copy

import pm_s3bo_oracles as w

LANE = 'sr2'
FAMILIES = ()
EXTENDS = ('restore_point.created',)
CRE = 'restore_point.created'
FORBIDDEN = ('ephemeral_stream', 'queue_data', 'workspace_file_body', 'secret', 'credential')
LISTS = ('context_refs', 'provenance_refs', 'attachment_refs', 'citation_refs')

ROWS = [
    ('sr2_cap_shape', 'sr2_capture', 'error', 'The presented source transcript, custody and admission attempts are complete closed records of the creation owner.'),
    ('sr2_cap_range', 'sr2_capture', 'equal', "The record's source thread and branch name a persisted branch that holds the boundary message exactly once; the range ends there, inclusive."),
    ('sr2_cap_context', 'sr2_capture', 'equal', 'Frozen context_refs are the items in the chat context at the boundary message, once each, in the order of their additions.'),
    ('sr2_cap_provenance', 'sr2_capture', 'equal', 'Frozen provenance_refs are the tool-call then model-run sources of every answer through the boundary, once each, in first-use order.'),
    ('sr2_cap_attachments', 'sr2_capture', 'equal', 'Record attachment_refs are the attachments of every message through the boundary, once each, in message order.'),
    ('sr2_cap_citations', 'sr2_capture', 'equal', 'Record citation_refs are the citations of every answer through the boundary, once each, in message order.'),
    ('sr2_cap_merged', 'sr2_capture', 'equal', 'Record context_provenance_refs is the frozen context_refs followed by each frozen provenance ref not already in it.'),
    ('sr2_cap_admission', 'sr2_capture', 'equal', 'Creation admits only when no selected material is unplaceable, unresolved or forbidden; otherwise it refuses or quarantines with nothing written or dropped.'),
]

# ---------------------------------------------------------------------------
# Closed fixture schema of the presented creation-owner records.
REFS = {'type': 'array', 'items': {'type': 'string', 'minLength': 1}}
OTHER_TYPES = ['system', 'tool_result', 'operation_card', 'blocked_notice', 'subagent_card', 'error']
TRANSCRIPT = {'type': 'object', 'additionalProperties': {'type': 'array', 'items': {'$ref': '#/$defs/record'}}}
SCHEMA = {
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    '$id': 'https://puppetmaster.local/schemas/checker/s3bo_sr2_capture_fixture/1.0.0',
    'type': 'object', 'additionalProperties': False,
    'required': ['conversation', 'custody', 'attempts'],
    'properties': {
        'conversation': {'$ref': '#/$defs/conversation'},
        'custody': {'$ref': '#/$defs/custody'},
        'attempts': {'type': 'array', 'items': {'$ref': '#/$defs/attempt'}},
    },
    '$defs': {
        'refs': REFS,
        'record': {'oneOf': [
            {'type': 'object', 'additionalProperties': False, 'required': ['record', 'ref'],
             'properties': {'record': {'enum': ['context_added', 'context_removed']}, 'ref': {'type': 'string', 'minLength': 1}}},
            {'type': 'object', 'additionalProperties': False, 'required': ['record', 'message_id', 'message_type', 'attachments'],
             'properties': {'record': {'const': 'message'}, 'message_id': {'type': 'string', 'minLength': 1},
                            'message_type': {'const': 'user'}, 'attachments': {'$ref': '#/$defs/refs'}}},
            {'type': 'object', 'additionalProperties': False,
             'required': ['record', 'message_id', 'message_type', 'tool_calls', 'model_source_refs', 'citations'],
             'properties': {'record': {'const': 'message'}, 'message_id': {'type': 'string', 'minLength': 1},
                            'message_type': {'const': 'assistant'},
                            'tool_calls': {'type': 'array', 'items': {
                                'type': 'object', 'additionalProperties': False, 'required': ['tool_call_id', 'source_refs'],
                                'properties': {'tool_call_id': {'type': 'string', 'minLength': 1}, 'source_refs': {'$ref': '#/$defs/refs'}}}},
                            'model_source_refs': {'$ref': '#/$defs/refs'}, 'citations': {'$ref': '#/$defs/refs'}}},
            {'type': 'object', 'additionalProperties': False, 'required': ['record', 'message_id', 'message_type'],
             'properties': {'record': {'const': 'message'}, 'message_id': {'type': 'string', 'minLength': 1},
                            'message_type': {'enum': OTHER_TYPES}}},
        ]},
        'conversation': {
            'type': 'object', 'additionalProperties': False,
            'required': ['threads', 'unplaced_context', 'queue', 'drafts', 'streams'],
            'properties': {
                'threads': {'type': 'object', 'additionalProperties': TRANSCRIPT},
                'unplaced_context': {'$ref': '#/$defs/refs'},
                'queue': {'type': 'array', 'items': {'type': 'object', 'additionalProperties': False, 'required': ['attachments'],
                                                     'properties': {'attachments': {'$ref': '#/$defs/refs'}}}},
                'drafts': {'type': 'array', 'items': {'type': 'object', 'additionalProperties': False, 'required': ['attachments'],
                                                      'properties': {'attachments': {'$ref': '#/$defs/refs'}}}},
                'streams': {'type': 'array', 'items': {'type': 'object', 'additionalProperties': False, 'required': ['sources'],
                                                       'properties': {'sources': {'$ref': '#/$defs/refs'}}}},
            }},
        'custody': {'type': 'object', 'additionalProperties': {
            'type': 'object', 'additionalProperties': False, 'required': ['resolves', 'material'],
            'properties': {'resolves': {'type': 'boolean'}, 'material': {'enum': ['reference'] + list(FORBIDDEN)}}}},
        'capture': {'type': 'object', 'additionalProperties': False, 'required': list(LISTS),
                    'properties': {k: {'$ref': '#/$defs/refs'} for k in LISTS}},
        'attempt': {
            'type': 'object', 'additionalProperties': False,
            'required': ['label', 'request', 'conversation', 'custody', 'presented'],
            'properties': {
                'label': {'type': 'string', 'minLength': 1},
                'request': {'type': 'object', 'additionalProperties': False,
                            'required': ['thread_id', 'branch_id', 'source_message_id'],
                            'properties': {k: {'type': 'string', 'minLength': 1} for k in ('thread_id', 'branch_id', 'source_message_id')}},
                'conversation': {'$ref': '#/$defs/conversation'},
                'custody': {'$ref': '#/$defs/custody'},
                'presented': {'type': 'object', 'additionalProperties': False,
                              'required': ['outcome', 'record_written', 'companion_written', 'events', 'capture'],
                              'properties': {'outcome': {'enum': ['created', 'refused', 'quarantined']},
                                             'record_written': {'type': 'boolean'}, 'companion_written': {'type': 'boolean'},
                                             'events': {'$ref': '#/$defs/refs'},
                                             'capture': {'oneOf': [{'type': 'null'}, {'$ref': '#/$defs/capture'}]}}},
            }},
    },
}


# ---------------------------------------------------------------------------
# The selection (checker side). Pure; reads only the presented records.
def _add(target, refs):
    for ref in refs:
        if ref not in target:
            target.append(ref)


def select(records, boundary):
    """The DL-693 capture of one branch transcript through `boundary`, or None if the range does not resolve."""
    hits = [i for i, r in enumerate(records) if r['record'] == 'message' and r['message_id'] == boundary]
    if len(hits) != 1:
        return None
    context = []; provenance = []; attachments = []; citations = []
    for r in records[:hits[0] + 1]:
        if r['record'] == 'context_added':
            _add(context, [r['ref']])
        elif r['record'] == 'context_removed':
            if r['ref'] in context:
                context.remove(r['ref'])
        elif r['message_type'] == 'user':
            _add(attachments, r['attachments'])
        elif r['message_type'] == 'assistant':
            for call in r['tool_calls']:
                _add(provenance, call['source_refs'])
            _add(provenance, r['model_source_refs'])
            _add(citations, r['citations'])
    return {'context_refs': context, 'provenance_refs': provenance, 'attachment_refs': attachments, 'citation_refs': citations}


def merged(context, provenance):
    out = list(context); _add(out, provenance)
    return out


def range_of(conversation, thread_id, branch_id, boundary):
    branch = conversation['threads'].get(thread_id, {}).get(branch_id)
    count = sum(1 for r in branch or [] if r['record'] == 'message' and r['message_id'] == boundary)
    return [thread_id in conversation['threads'], branch is not None, count], branch


def issues(conversation, custody, capture):
    """Unplaceable context and every selected ref that is unresolved or forbidden (never dropped)."""
    found = [('unplaceable', ref) for ref in conversation['unplaced_context']]
    for key in LISTS:
        for ref in capture[key]:
            entry = custody.get(ref)
            if entry is None or entry['resolves'] is not True:
                found.append(('unresolved', ref))
            elif entry['material'] in FORBIDDEN:
                found.append(('forbidden', ref))
    return found


def expected_admission(conversation, custody, request):
    shape, branch = range_of(conversation, request['thread_id'], request['branch_id'], request['source_message_id'])
    capture = select(branch, request['source_message_id']) if shape == [True, True, 1] else None
    if capture is None or issues(conversation, custody, capture):
        return ('refused_or_quarantined', False, False, 0, None)
    return ('created', True, True, 1, capture)


def presented_admission(presented):
    kind = 'created' if presented['outcome'] == 'created' else 'refused_or_quarantined'
    return (kind, presented['record_written'], presented['companion_written'], len(presented['events']), presented['capture'])


def operands(case, put, common):
    sr = case.get('sr')
    if not isinstance(sr, dict) or not isinstance(sr.get('record'), dict):
        return  # the owner's sr_cre_hash refuses a missing boundary record
    data = case.get('sr2')
    errors = w.schema_errors(SCHEMA, data) if data is not None else [['sr2', 'required']]
    put('sr2_cap_shape', errors)
    if errors:
        return
    rec = sr['record']; frozen = sr['frozen_capture']; conversation = data['conversation']
    shape, branch = range_of(conversation, rec['source_thread_id'], rec['source_branch_id'], rec['source_message_id'])
    put('sr2_cap_range', shape, [True, True, 1])
    if shape != [True, True, 1]:
        return
    chosen = select(branch, rec['source_message_id'])
    put('sr2_cap_context', frozen['context_refs'], chosen['context_refs'])
    put('sr2_cap_provenance', frozen['provenance_refs'], chosen['provenance_refs'])
    put('sr2_cap_attachments', rec['attachment_refs'], chosen['attachment_refs'])
    put('sr2_cap_citations', rec['citation_refs'], chosen['citation_refs'])
    put('sr2_cap_merged', rec['context_provenance_refs'], merged(frozen['context_refs'], frozen['provenance_refs']))
    # The presented creation is admitted (its record exists); every attempt is
    # presented with its own outcome. Expectations come from the selection.
    main_expected = 'created' if not issues(conversation, data['custody'], chosen) else 'refused_or_quarantined'
    left = [('created', True)]; right = [(main_expected, main_expected == 'created')]
    for attempt in data['attempts']:
        left.append(presented_admission(attempt['presented']))
        right.append(expected_admission(attempt['conversation'], attempt['custody'], attempt['request']))
    put('sr2_cap_admission', left, right)


# ---------------------------------------------------------------------------
# Fixtures (constructors only; never called by operands()).
def user(mid, attachments=()):
    return {'record': 'message', 'message_id': mid, 'message_type': 'user', 'attachments': list(attachments)}


def answer(mid, calls=(), model=(), citations=()):
    return {'record': 'message', 'message_id': mid, 'message_type': 'assistant',
            'tool_calls': [{'tool_call_id': mid + '/call-' + str(i), 'source_refs': list(c)} for i, c in enumerate(calls, 1)],
            'model_source_refs': list(model), 'citations': list(citations)}


def other(mid, kind):
    return {'record': 'message', 'message_id': mid, 'message_type': kind}


def added(ref):
    return {'record': 'context_added', 'ref': ref}


def removed(ref):
    return {'record': 'context_removed', 'ref': ref}


def conversation(source, others=None, unplaced=(), queue=(), drafts=(), streams=()):
    threads = {'thread-source': {'branch-source': source}}
    for (thread, branch), records in (others or {}).items():
        threads.setdefault(thread, {})[branch] = records
    return {'threads': threads, 'unplaced_context': list(unplaced),
            'queue': [{'attachments': list(a)} for a in queue], 'drafts': [{'attachments': list(a)} for a in drafts],
            'streams': [{'sources': list(s)} for s in streams]}


def custody_for(conv, overrides=None):
    refs = set(conv['unplaced_context'])
    for branches in conv['threads'].values():
        for records in branches.values():
            for r in records:
                refs.update([r['ref']] if 'ref' in r else [])
                refs.update(r.get('attachments', []) + r.get('model_source_refs', []) + r.get('citations', []))
                for call in r.get('tool_calls', []):
                    refs.update(call['source_refs'])
    for item in conv['queue'] + conv['drafts']:
        refs.update(item['attachments'])
    out = {ref: {'resolves': True, 'material': 'reference'} for ref in sorted(refs)}
    for item in conv['queue']:
        for ref in item['attachments']:
            out[ref] = {'resolves': True, 'material': 'queue_data'}
    for item in conv['streams']:
        for ref in item['sources']:
            out[ref] = {'resolves': True, 'material': 'ephemeral_stream'}
    out.update(overrides or {})
    return out


# Main transcript: its hand-derived capture is the owner's CAPTURE
# (context [ctx-A], provenance [prov-A, prov-B], attachments [att-A], citations []).
MAIN = conversation(
    [added('ctx-gone'), added('ctx-A'), user('message-1', ['att-A']),
     answer('message-2', calls=[['prov-A']]), other('message-notice', 'system'),
     removed('ctx-gone'), user('message-3', ['att-A']),
     answer('message-A', calls=[['prov-A']], model=['prov-B']),                     # the boundary, inclusive
     removed('ctx-A'), added('ctx-late'), user('message-B', ['att-late']),
     answer('message-C', calls=[['prov-late']], citations=['prov-late'])],
    others={('thread-source', 'branch-other'): [added('ctx-other'), user('message-1', ['att-other']),
                                                answer('message-A', calls=[['prov-other']], citations=['prov-other'])],
            ('thread-other', 'branch-x'): [user('message-A', ['att-thread-other'])]},
    queue=[['att-queued']], drafts=[['att-draft']], streams=[['prov-stream']])

# Variant V1: the boundary is a cited answer; context and provenance overlap; an
# attached file is also a tool source; an item is removed and added again.
V1 = conversation(
    [added('ctx-B'), added('ctx-A'), user('message-1', ['att-A']),
     answer('message-2', calls=[['att-A', 'prov-A']], model=['ctx-A'], citations=['prov-A']),
     removed('ctx-B'), added('ctx-B'), user('message-3', ['att-B', 'att-A']),
     answer('message-A', calls=[['prov-C']], model=['ctx-B'], citations=['prov-C', 'prov-A']),
     user('message-4', ['att-late']), answer('message-5', calls=[['cit-late']], citations=['cit-late'])])
V1_CAPTURE = {'context_refs': ['ctx-A', 'ctx-B'], 'provenance_refs': ['att-A', 'prov-A', 'ctx-A', 'prov-C', 'ctx-B'],
              'attachment_refs': ['att-A', 'att-B'], 'citation_refs': ['prov-A', 'prov-C']}
V1_MERGED = ['ctx-A', 'ctx-B', 'att-A', 'prov-A', 'prov-C']

# Variant V2: the boundary is the first message, a user message with an
# attachment; every other kind is lawfully empty.
V2 = conversation(
    [user('message-A', ['att-1']), added('ctx-late'), answer('message-2', calls=[['prov-late']], citations=['prov-late'])])
V2_CAPTURE = {'context_refs': [], 'provenance_refs': [], 'attachment_refs': ['att-1'], 'citation_refs': []}
V2_MERGED = []


def attempt(label, conv, presented, boundary='message-A', custody=None):
    return {'label': label, 'request': {'thread_id': 'thread-source', 'branch_id': 'branch-source', 'source_message_id': boundary},
            'conversation': conv, 'custody': custody if custody is not None else custody_for(conv), 'presented': presented}


def refused(outcome='refused'):
    return {'outcome': outcome, 'record_written': False, 'companion_written': False, 'events': [], 'capture': None}


A_CONV = conversation([user('message-1', ['att-1']), answer('message-A', calls=[['src-1']]), user('message-3', ['att-secret'])])
A_UNRESOLVED = conversation([user('message-A', ['att-gone'])])
A_FORBIDDEN = conversation([answer('message-A', calls=[['src-key']], model=['src-1'])])
A_UNPLACED = conversation([user('message-A', ['att-1'])], unplaced=['ctx-unplaced'])
ATTEMPTS = [
    attempt('forbidden-after-boundary', A_CONV,
            {'outcome': 'created', 'record_written': True, 'companion_written': True, 'events': ['er_rpc_attempt-1'],
             'capture': {'context_refs': [], 'provenance_refs': ['src-1'], 'attachment_refs': ['att-1'], 'citation_refs': []}},
            custody=custody_for(A_CONV, {'att-secret': {'resolves': True, 'material': 'secret'}})),
    attempt('forbidden-selected', A_FORBIDDEN, refused(),
            custody=custody_for(A_FORBIDDEN, {'src-key': {'resolves': True, 'material': 'credential'}})),
    attempt('unresolved-selected', A_UNRESOLVED, refused('quarantined'),
            custody=custody_for(A_UNRESOLVED, {'att-gone': {'resolves': False, 'material': 'reference'}})),
    attempt('unplaced-context', A_UNPLACED, refused()),
]


def fixture(conv):
    return {'conversation': copy.deepcopy(conv), 'custody': custody_for(conv), 'attempts': copy.deepcopy(ATTEMPTS)}


def augment(control):
    control['sr2'] = fixture(MAIN)


@contextlib.contextmanager
def owner_capture(capture, merged_refs):
    """Build with the owner's own constructors (payload, record, scenario) and another frozen capture.

    pm_s3bo_ext_sr_created builds every copy (payload, record, record hash,
    companion, events, frozen input) from its CAPTURE; the record's merged field
    is given here by hand. Fixture construction only: restored on exit.
    """
    import pm_s3bo_ext_sr_created as owner
    saved = owner.CAPTURE, owner.record
    original = owner.record

    def record(**changes):
        return original(**dict({'context_provenance_refs': list(merged_refs)}, **changes))
    owner.CAPTURE, owner.record = copy.deepcopy(capture), record
    try:
        yield
    finally:
        owner.CAPTURE, owner.record = saved


def build(capture, merged_refs, conv):
    with owner_capture(capture, merged_refs):
        value = w.build(CRE)
    value['sr2'] = fixture(conv)
    return value


def control(label, value):
    return {'id': CRE + '/sr2/' + label, 'value': value, 'boundary': 'append'}


MAIN_CAPTURE = {'context_refs': ['ctx-A'], 'provenance_refs': ['prov-A', 'prov-B'], 'attachment_refs': ['att-A'], 'citation_refs': []}
MAIN_MERGED = ['ctx-A', 'prov-A', 'prov-B']


INVALID = [
    # (control label, intended row, capture change, why it earns no kill)
    ('cited-boundary-overlap', 'sr2_cap_attachments', {'attachment_refs': ['att-A', 'att-B', 'att-A']},
     'A repeated attachment in every copy also breaks the owner set equality (sr_cre_union): two independent refusals.'),
]


def changed(capture, **lists):
    out = copy.deepcopy(capture); out.update(lists)
    return out


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    main = control('main', w.build(CRE)); controls.append(main)
    v1 = control('cited-boundary-overlap', build(V1_CAPTURE, V1_MERGED, V1)); controls.append(v1)
    v2 = control('user-boundary-empty-kinds', build(V2_CAPTURE, V2_MERGED, V2)); controls.append(v2)
    bases = {'main': (main, MAIN, MAIN_CAPTURE, MAIN_MERGED), 'v1': (v1, V1, V1_CAPTURE, V1_MERGED),
             'v2': (v2, V2, V2_CAPTURE, V2_MERGED)}
    branch = ('sr2', 'conversation', 'threads', 'thread-source', 'branch-source')

    # Capture-side witnesses: the creation selected wrongly, and every stored
    # copy (record, hash, companion, events, frozen input, EventRecord) agrees.
    def wrong(base, row, label, merged_refs=None, **lists):
        ctl, conv, capture, merged_ok = bases[base]
        bad = changed(capture, **lists)
        refs = merged_refs if merged_refs is not None else (
            merged_ok if not ({'context_refs', 'provenance_refs'} & set(lists)) else merged(bad['context_refs'], bad['provenance_refs']))
        negatives.append(c.negative(ctl, row, 'capture-' + label, build(bad, refs, conv),
                                    {'capture': {k: v for k, v in lists.items()}, 'merged': refs if merged_refs is not None else None,
                                     'copies': 'every stored copy built from the wrong capture'}))
    wrong('main', 'sr2_cap_context', 'context-added-after-boundary', context_refs=['ctx-A', 'ctx-late'])
    wrong('main', 'sr2_cap_context', 'context-removed-before-boundary', context_refs=['ctx-gone', 'ctx-A'])
    wrong('main', 'sr2_cap_context', 'context-as-of-now', context_refs=[])
    wrong('main', 'sr2_cap_context', 'attachment-as-context', context_refs=['ctx-A', 'att-A'])
    wrong('main', 'sr2_cap_context', 'other-branch-context', context_refs=['ctx-A', 'ctx-other'])
    wrong('v1', 'sr2_cap_context', 'first-ever-addition-order', context_refs=['ctx-B', 'ctx-A'])
    wrong('v1', 'sr2_cap_provenance', 'only-the-chosen-message', provenance_refs=['prov-C', 'ctx-B'])
    wrong('main', 'sr2_cap_provenance', 'later-answer-source', provenance_refs=['prov-A', 'prov-B', 'prov-late'])
    wrong('main', 'sr2_cap_provenance', 'streaming-source', provenance_refs=['prov-A', 'prov-B', 'prov-stream'])
    wrong('main', 'sr2_cap_provenance', 'model-before-tools', provenance_refs=['prov-B', 'prov-A'])
    wrong('main', 'sr2_cap_provenance', 'repeated-source', provenance_refs=['prov-A', 'prov-B', 'prov-A'])
    wrong('v1', 'sr2_cap_provenance', 'context-overlap-dropped', provenance_refs=['att-A', 'prov-A', 'prov-C'])
    wrong('main', 'sr2_cap_attachments', 'queued-message-attachment', attachment_refs=['att-A', 'att-queued'])
    wrong('main', 'sr2_cap_attachments', 'draft-attachment', attachment_refs=['att-A', 'att-draft'])
    wrong('main', 'sr2_cap_attachments', 'other-branch-attachment', attachment_refs=['att-A', 'att-other'])
    wrong('main', 'sr2_cap_attachments', 'other-thread-attachment', attachment_refs=['att-A', 'att-thread-other'])
    wrong('main', 'sr2_cap_attachments', 'after-boundary-attachment', attachment_refs=['att-A', 'att-late'])
    wrong('v2', 'sr2_cap_attachments', 'boundary-message-excluded', attachment_refs=[])
    wrong('v1', 'sr2_cap_citations', 'boundary-answer-excluded', citation_refs=['prov-A'])
    wrong('v1', 'sr2_cap_citations', 'tool-source-as-citation', citation_refs=['prov-A', 'att-A', 'prov-C'])
    wrong('main', 'sr2_cap_citations', 'later-answer-citation', citation_refs=['prov-late'])
    wrong('main', 'sr2_cap_citations', 'other-branch-citation', citation_refs=['prov-other'])
    wrong('v1', 'sr2_cap_merged', 'provenance-first', merged_refs=['att-A', 'prov-A', 'ctx-A', 'prov-C', 'ctx-B'])
    wrong('v1', 'sr2_cap_merged', 'transcript-order', merged_refs=['ctx-A', 'att-A', 'prov-A', 'prov-C', 'ctx-B'])
    wrong('main', 'sr2_cap_merged', 'context-last', merged_refs=['prov-A', 'prov-B', 'ctx-A'])

    # Transcript-side witnesses: the presented records disagree with an
    # unchanged capture (one record of the owner transcript changed).
    def records(base, row, label, edit, defect):
        ctl = bases[base][0]; value = copy.deepcopy(ctl['value'])
        edit(value['sr2']['conversation']['threads']['thread-source']['branch-source'], value['sr2'])
        negatives.append(c.negative(ctl, row, 'transcript-' + label, value, defect))
    known = lambda d, ref: d['custody'].update({ref: {'resolves': True, 'material': 'reference'}})
    records('main', 'sr2_cap_context', 'context-added-before-boundary',
            lambda r, d: (r.insert(2, added('ctx-extra')), known(d, 'ctx-extra')),
            {'insert_before_boundary': 'context_added ctx-extra', 'custody': 'ctx-extra resolves'})
    records('main', 'sr2_cap_provenance', 'boundary-model-sources-missing', lambda r, d: r[7].update(model_source_refs=[]),
            {'record': 'message-A model_source_refs', 'replacement': []})
    records('main', 'sr2_cap_attachments', 'earlier-message-attachment',
            lambda r, d: (r[6].update(attachments=['att-A', 'att-extra']), known(d, 'att-extra')),
            {'record': 'message-3 attachments', 'replacement': ['att-A', 'att-extra'], 'custody': 'att-extra resolves'})
    records('main', 'sr2_cap_citations', 'earlier-answer-citation', lambda r, d: r[3].update(citations=['prov-A']),
            {'record': 'message-2 citations', 'replacement': ['prov-A']})
    records('main', 'sr2_cap_range', 'boundary-in-other-branch-only', lambda r, d: r.pop(7),
            {'record': 'message-A removed from the source branch'})
    records('main', 'sr2_cap_range', 'boundary-twice', lambda r, d: r.insert(9, copy.deepcopy(r[7])),
            {'record': 'message-A repeated after itself'})
    negatives.append(c.mutate(main, 'sr2_cap_range', ('sr2', 'conversation', 'threads'),
                              {'thread-renamed': copy.deepcopy(MAIN['threads']['thread-source'])}, 'source-thread-absent'))
    # Shape witnesses.
    value = copy.deepcopy(main['value']); del value['sr2']
    negatives.append(c.negative(main, 'sr2_cap_shape', 'transcript-missing', value, {'deleted': 'sr2'}))
    negatives.append(c.mutate(main, 'sr2_cap_shape', branch + (4,), {'record': 'note', 'ref': 'note-A'}, 'unknown-record-kind'))
    value = copy.deepcopy(main['value']); value['sr2']['conversation']['threads']['thread-source']['branch-source'][3]['attachments'] = ['att-A']
    negatives.append(c.negative(main, 'sr2_cap_shape', 'answer-with-attachments', value, {'record': 'message-2', 'added': 'attachments'}))
    negatives.append(c.mutate(main, 'sr2_cap_shape', ('sr2', 'custody', 'att-A', 'material'), 'redacted', 'custody-material-unknown'))
    # Admission witnesses: the main creation over material it had to refuse,
    # and presented attempts that guessed, dropped, wrote or over-refused.
    negatives.append(c.mutate(main, 'sr2_cap_admission', ('sr2', 'custody', 'prov-B', 'material'), 'credential', 'selected-credential-created'))
    negatives.append(c.mutate(main, 'sr2_cap_admission', ('sr2', 'custody', 'prov-B', 'material'), 'workspace_file_body', 'selected-file-body-created'))
    value = copy.deepcopy(main['value']); del value['sr2']['custody']['att-A']
    negatives.append(c.negative(main, 'sr2_cap_admission', 'selected-ref-unresolved-created', value, {'custody': 'att-A removed'}))
    negatives.append(c.mutate(main, 'sr2_cap_admission', ('sr2', 'conversation', 'unplaced_context'), ['ctx-unplaced'], 'unplaced-context-created'))
    P = lambda i, *path: ('sr2', 'attempts', i, 'presented') + path
    dropped = {'outcome': 'created', 'record_written': True, 'companion_written': True, 'events': ['er_rpc_attempt-2'],
               'capture': {'context_refs': [], 'provenance_refs': ['src-1'], 'attachment_refs': [], 'citation_refs': []}}
    negatives.append(c.mutate(main, 'sr2_cap_admission', P(1), dropped, 'forbidden-ref-dropped'))
    guessed = {'outcome': 'created', 'record_written': True, 'companion_written': True, 'events': ['er_rpc_attempt-4'],
               'capture': {'context_refs': ['ctx-unplaced'], 'provenance_refs': [], 'attachment_refs': ['att-1'], 'citation_refs': []}}
    negatives.append(c.mutate(main, 'sr2_cap_admission', P(3), guessed, 'unplaced-context-guessed'))
    negatives.append(c.mutate(main, 'sr2_cap_admission', P(2, 'record_written'), True, 'quarantine-writes-record'))
    negatives.append(c.mutate(main, 'sr2_cap_admission', P(1, 'events'), ['er_rpc_attempt-2'], 'refusal-appends-event'))
    negatives.append(c.mutate(main, 'sr2_cap_admission', P(0), refused(), 'clean-capture-refused'))
    negatives.append(c.mutate(main, 'sr2_cap_admission', P(0, 'capture', 'attachment_refs'), ['att-1', 'att-secret'], 'after-boundary-secret-captured'))
    # Retained reads of the variant controls come from their own sealed originals.
    for ctl in (v1, v2):
        negatives.append(c.mutate(ctl, 'sealed_dispatch', ('retained_ref',), 'missing-original', 'retained-original-missing'))
        negatives.append(c.mutate(ctl, 'store_snapshot', ('read_store_before',), {}, 'retained-snapshot-dropped'))
    return controls, negatives
