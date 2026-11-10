#!/usr/bin/env python3
"""Build Plans/card2_event_p2a_cases.json: the DCN sweep part 2A witnesses and controls.

Each witness starts from a named valid positive (a retry or history control is that
append positive with only its path changed, which the checker accepts), changes one
fact, and moves every copy that follows it (pm_card2_p2a_lib). Each must be refused
first at exactly its target row; any other refusing row must be an entailed row that
names the target. Controls must be accepted.

  python3 scripts/pm-card2-p2a-cases.py           # write the file
  python3 scripts/pm-card2-p2a-cases.py --check   # exit 1 if the file is stale or a case misbehaves
"""
import argparse
import copy
import json
import sys
from pathlib import Path

import blake3

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pm_card2_events as dcn  # noqa: E402
import pm_card2_p2a_lib as L  # noqa: E402

OUT = dcn.ROOT / 'Plans' / 'card2_event_p2a_cases.json'
FIXTURES = dcn.load('card2_event_fixtures.json')
BASES = {c['id']: c for c in FIXTURES['positives'] + FIXTURES['no_event_cases']}
CASES = []
FAILURES = []

BROWSER = ['browser.session.created', 'browser.session.state_changed', 'browser.session.closed',
           'browser.session.promoted', 'browser.session.takeover_state_changed']
MEM = 'memory.gist_state_changed/project'
MEM_RETRY = 'memory.gist_state_changed/project/retry'
PACK = 'memory.gist_state_changed/project/round3/evidence-2000'
PACK_RETRY = 'memory.gist_state_changed/project/retry/round3/evidence-2000'
SMALL = 'memory.gist_state_changed/project/round3/boundary-16384'
EXEC = 'memory.gist_state_changed/project/execution-source'
NO_EVENT = 'memory/requested'
BIG = 10 ** 4400 - 1


def pl(c): return c['event']['payload']
def rec(c, side): return c['source_records'][c['owner'][('before_record_ref', 'after_record_ref')[side]]]
def orig(c): return c['storage']['event']


def add(cid, base, target, defect, fn, control=None):
    c = copy.deepcopy(BASES[base])
    if control:
        c['path'] = control
    fn(c)
    changes = L.diff(BASES[base], c)
    case = {'id': 'p2a/' + cid, 'base': base, 'target': target, 'guard': dcn.ROW_BY_ID[target]['code'], 'defect': defect,
            'changes': changes}
    if control:
        case['control'] = 'p2a/control/' + base + '/' + control
    first, rows = dcn.evaluate(dcn.mutate(BASES[base], changes))
    verdict = dcn.judge(case, first, rows)
    if verdict:
        FAILURES.append({'case': case['id'], 'verdict': verdict, 'first': first, 'rows': rows})
    CASES.append(case)


def control(base, path, note):
    c = copy.deepcopy(BASES[base]); c['path'] = path
    changes = L.diff(BASES[base], c)
    case = {'id': 'p2a/control/' + base + '/' + path, 'base': base, 'expect': 'accept', 'defect': note, 'changes': changes}
    first, rows = dcn.evaluate(dcn.mutate(BASES[base], changes))
    if rows:
        FAILURES.append({'case': case['id'], 'verdict': 'control refused', 'rows': rows})
    CASES.append(case)


def accept(cid, base, note, fn):
    c = copy.deepcopy(BASES[base]); fn(c)
    changes = L.diff(BASES[base], c)
    case = {'id': 'p2a/' + cid, 'base': base, 'expect': 'accept', 'defect': note, 'changes': changes}
    first, rows = dcn.evaluate(dcn.mutate(BASES[base], changes))
    if rows:
        FAILURES.append({'case': case['id'], 'verdict': 'control refused', 'rows': rows})
    CASES.append(case)


def browser_delta(c):
    pl(c)['changed_fields'] = dcn.exact_delta(c)


def memory_delta(c):
    pl(c)['changed_fields'] = dcn.exact_delta(c)


def change_summary(c):
    rec(c, 1)['facts']['summary'] = 'Changed synthetic summary.'


def new_pack(c, raw, key=None):
    """Add a pack row (a copy of the owner custody fields) for raw bytes; return its descriptor."""
    key = key or blake3.blake3(raw).hexdigest()
    o = c['owner']
    c.setdefault('payload_store', {})[key] = {'bytes_hex': raw.hex(), 'authentic': True, 'durable': True,
                                              'storage_instance_id': o['storage_instance_id'], 'server_id': o['server_id'],
                                              'scope_kind': o['scope_kind'], 'project_id': o['project_id'], 'thread_id': o['thread_id']}
    return {'id': key, 'size_bytes': len(raw), 'media_type': dcn.EVIDENCE_MEDIA_TYPE}


def pack_list(c):
    return dcn.memory_evidence(c['event'], c)


def noncanonical(values):
    """The same array with a 32-bit array header instead of the shortest one."""
    canonical = dcn.binding_bytes(values)
    head = canonical[0]
    body = canonical[1:] if head < 0xa0 and head >= 0x90 else canonical[3:] if head == 0xdc else canonical[5:]
    return b'\xdd' + len(values).to_bytes(4, 'big') + body


# ---------------------------------------------------------------- controls
for base in ['memory/pin', 'memory/unpin', 'memory/new-automatic-gist', EXEC]:
    control(base, 'retry', 'append positive replayed on the retry path (only the path changes); accepted')
accept('producer-sequence-2^53', 'browser.session.created/project', 'producer_sequence_id 2^53 encodes exactly (CV-1100); accepted',
       lambda c: c['event'].__setitem__('producer_sequence_id', 2**53))
accept('retry-producer-sequence-2^53', 'browser.session.created/project/retry',
       'retry candidate and Storage original both carry producer_sequence_id 2^53; the producer digests agree; accepted',
       lambda c: (c['event'].__setitem__('producer_sequence_id', 2**53), orig(c).__setitem__('producer_sequence_id', 2**53),
                  L.sync_original(c)))

# ---------------------------------------------------------------- numbers (part 2B numbers)
CR = 'browser.session.created/project'
for label, value in [('2^53+1', 2**53 + 1), ('2^60', 2**60), ('u64max', 2**64 - 1), ('4400-digit', BIG)]:
    add('producer-route-' + label, CR, 'cand_producer_route',
        'producer_sequence_id ' + label + ' cannot be qualified for the CV-317 producer projection (CV-1100 route refusal before effects)',
        lambda c, v=value: c['event'].__setitem__('producer_sequence_id', v))
add('sequence-u64', CR, 'cand_sequence_u64', 'sequence_id 2^64 is outside Storage uint64 (SP-1100 storage_uint64)',
    lambda c: c['event'].__setitem__('sequence_id', 2**64))
add('sequence-4400-digit', CR, 'cand_sequence_u64', 'a 4400-digit sequence_id reaches the uint64 row instead of crashing the checker',
    lambda c: c['event'].__setitem__('sequence_id', BIG))
add('revision-integral-float', CR, 'cand_payload_numbers',
    'revision_after spelled 1.0 in the payload, the owner and the after record alike; only the CV-1100 integer slot refuses it',
    lambda c: (pl(c).__setitem__('revision_after', 1.0), c['owner'].__setitem__('after_revision', 1.0), rec(c, 1).__setitem__('revision', 1.0)))
add('pack-size-integral-float', PACK, 'cand_payload_numbers', 'evidence descriptor size_bytes spelled as a float (CV-1100 integer slot)',
    lambda c: pl(c)['evidence_refs'].__setitem__('size_bytes', float(pl(c)['evidence_refs']['size_bytes'])))
add('revision-4400-digit', 'browser.session.state_changed/project', 'cand_payload_schema',
    'a 4400-digit revision in every copy reaches the payload schema maximum instead of crashing the checker',
    lambda c: (pl(c).__setitem__('revision_before', BIG - 1), pl(c).__setitem__('revision_after', BIG),
               c['owner'].__setitem__('before_revision', BIG - 1), c['owner'].__setitem__('after_revision', BIG),
               rec(c, 0).__setitem__('revision', BIG - 1), rec(c, 1).__setitem__('revision', BIG)))
R = 'browser.session.state_changed/project/retry'
add('orig-producer-integral-float', R, 'orig_envelope_numbers', 'Storage original producer_sequence_id spelled 1.0 (CV-1100)',
    lambda c: (orig(c).__setitem__('producer_sequence_id', 1.0), L.sync_original(c)))
add('orig-sequence-u64', R, 'orig_sequence_u64', 'Storage original sequence_id 2^64 (receipt copy moves with it)',
    lambda c: (orig(c).__setitem__('sequence_id', 2**64), L.sync_original(c)))
add('orig-producer-2^60', R, 'orig_producer_route', 'Storage original producer_sequence_id 2^60 cannot be qualified (CV-1100)',
    lambda c: (orig(c).__setitem__('producer_sequence_id', 2**60), L.sync_original(c)))
add('orig-pack-size-float', PACK_RETRY, 'orig_payload_numbers', 'Storage original descriptor size_bytes spelled as a float',
    lambda c: (orig(c)['payload']['evidence_refs'].__setitem__('size_bytes', float(orig(c)['payload']['evidence_refs']['size_bytes'])),
               L.sync_original(c)))

# ---------------------------------------------------------------- candidate rows
add('path-type', CR, 'scenario_path_type', 'the path is an integer', lambda c: c.__setitem__('path', 5))
add('envelope-schema-id-other-scope', CR, 'cand_scope_schema_payload_id',
    'the envelope payload_schema_id names the application schema while the payload keeps the Project schema',
    lambda c: c['event'].__setitem__('payload_schema_id', 'pm.browser.session.created.payload.application.v1'))
add('node-without-run', CR, 'cand_lineage_node', 'a node_id without a run, in the event, the owner and the after record alike',
    lambda c: (c['event'].__setitem__('node_id', 'node-X'), c['owner'].__setitem__('node_id', 'node-X'), rec(c, 1).__setitem__('node_id', 'node-X')))
add('automatic-from-command', 'memory/automatic', 'cand_memory_command_automatic',
    'an automatic change attributed to the verify command (owner and scenario command alike)',
    lambda c: (c.__setitem__('command', 'cmd.chat.memory.verify'), c['owner'].__setitem__('command', 'cmd.chat.memory.verify')))
add('empty-delta', 'memory/edit', 'cand_memory_delta_nonempty', 'an edit whose after record equals its before record',
    lambda c: rec(c, 1).__setitem__('facts', copy.deepcopy(rec(c, 0)['facts'])))
add('command-outside-contract', CR, 'command_contract', 'a command outside the family commands (owner and scenario alike)',
    lambda c: (c.__setitem__('command', 'cmd.browser.not_a_family_command'), c['owner'].__setitem__('command', 'cmd.browser.not_a_family_command')))


def pack_with(values):
    def fn(c):
        pl(c)['evidence_refs'] = new_pack(c, dcn.binding_bytes(values))
    return fn


add('pack-list-pattern', PACK, 'cand_custody_list_pattern', 'the pack decodes to a list holding a reference outside the pointer grammar',
    lambda c: pack_with(['bad reference'])(c))
add('pack-list-duplicate', PACK, 'cand_custody_list_unique', 'the pack decodes to a list with a repeated reference',
    lambda c: pack_with(pack_list(c) + [pack_list(c)[0]])(c))
add('pack-small-list', SMALL, 'cand_custody_route', 'a canonical pack of a list whose inline body stays within 16 KiB',
    lambda c: pack_with(pl(c)['evidence_refs'])(c))

# transition clauses (candidate)
add('created-revision', CR, 'cand_transition_created_revision', 'a created event at revision 1 to 2 (owner and after record alike)',
    lambda c: (pl(c).__setitem__('revision_before', 1), pl(c).__setitem__('revision_after', 2), c['owner'].__setitem__('before_revision', 1),
               c['owner'].__setitem__('after_revision', 2), rec(c, 1).__setitem__('revision', 2)))
for key, value in [('previous_lifecycle_state', 'open'), ('previous_session_class', 'workspace_preview'), ('previous_takeover_state', 'none')]:
    add('created-' + key, CR, 'cand_transition_created_' + key, 'a created event names a previous ' + key,
        lambda c, k=key, v=value: pl(c).__setitem__(k, v))
    add('orig-created-' + key, 'browser.session.created/project/retry', 'orig_transition_created_' + key,
        'Storage original created event names a previous ' + key, lambda c, k=key, v=value: (orig(c)['payload'].__setitem__(k, v), L.sync_original(c)))
add('created-changed-fields', CR, 'cand_transition_created_changed_fields', 'a created event lists another changed field',
    lambda c: pl(c).__setitem__('changed_fields', ['created', 'url']))
add('orig-created-changed-fields', 'browser.session.created/project/retry', 'orig_transition_created_changed_fields',
    'Storage original created event lists another changed field',
    lambda c: (orig(c)['payload'].__setitem__('changed_fields', ['created', 'url']), L.sync_original(c)))
SC = 'browser.session.state_changed/project'
add('successor-revision-zero', SC, 'cand_transition_successor_revision',
    'a successor at revision 0 to 1 (owner and both records alike)',
    lambda c: (pl(c).__setitem__('revision_before', 0), pl(c).__setitem__('revision_after', 1), c['owner'].__setitem__('before_revision', 0),
               c['owner'].__setitem__('after_revision', 1), rec(c, 0).__setitem__('revision', 0), rec(c, 1).__setitem__('revision', 1)))
add('successor-without-before', SC, 'cand_transition_successor_before_ref',
    'a successor without a before record (owner alike; changed_fields is the exact delta from no record)',
    lambda c: (pl(c).__setitem__('before_record_ref', None), c['owner'].__setitem__('before_record_ref', None), browser_delta(c)))


def same_state(field, value, bump=True):
    def fn(c):
        pl(c)[field] = value
        rec(c, 1)['facts'][field.replace('previous_', '')] = value
        if bump:
            rec(c, 1)['facts']['viewport']['width'] += 1
        browser_delta(c)
    return fn


add('closed-stays-open', 'browser.session.closed/project', 'cand_transition_closed_lifecycle',
    'a close whose after state stays open (after record alike; viewport changed so the delta is nonempty)',
    same_state('lifecycle_state', 'open'))
add('promoted-stays', 'browser.session.promoted/project', 'cand_transition_promoted_class',
    'a promotion whose class stays the previous class (after record alike; viewport changed)',
    lambda c: same_state('session_class', pl(c)['previous_session_class'])(c))


def memory_same(field, value, side):
    def fn(c):
        pl(c)[('previous_' if side == 0 else '') + field] = value
        rec(c, side)['facts'][field] = value
        change_summary(c)
        memory_delta(c)
    return fn


add('verify-unverified', MEM, 'cand_transition_verify_state', 'a verify that leaves the gist Unverified (after record alike; summary edited)',
    lambda c: memory_same('verification_state', pl(c)['previous_verification_state'], 1)(c))
add('pin-already-pinned', 'memory/pin', 'cand_transition_pin_previous', 'a pin of a gist already pinned (before record alike; summary edited)',
    memory_same('pinned', True, 0))
add('pin-stays-unpinned', 'memory/pin', 'cand_transition_pin_pinned', 'a pin that leaves the gist unpinned (after record alike)',
    memory_same('pinned', False, 1))
add('unpin-already-unpinned', 'memory/unpin', 'cand_transition_unpin_previous', 'an unpin of an unpinned gist (before record alike)',
    memory_same('pinned', False, 0))
add('unpin-stays-pinned', 'memory/unpin', 'cand_transition_unpin_pinned', 'an unpin that leaves the gist pinned (after record alike)',
    memory_same('pinned', True, 1))
add('discard-already-discarded', 'memory/discard', 'cand_transition_discard_previous', 'a discard of a discarded gist (before record alike)',
    memory_same('verification_state', 'Discarded', 0))
add('discard-not-discarded', 'memory/discard', 'cand_transition_discard_state', 'a discard that does not discard (after record alike)',
    lambda c: memory_same('verification_state', pl(c)['previous_verification_state'], 1)(c))
NEW = 'memory/new-automatic-gist'
add('initial-manual-pin', NEW, 'cand_transition_memory_initial_operation',
    'a new gist recorded as a pin from the pin command (owner and scenario command alike)',
    lambda c: (pl(c).__setitem__('operation', 'pin'), c.__setitem__('command', 'cmd.chat.memory.pin'), c['owner'].__setitem__('command', 'cmd.chat.memory.pin')))
add('initial-previous-verification', NEW, 'cand_transition_memory_initial_previous_verification', 'a new gist names a previous verification state',
    lambda c: pl(c).__setitem__('previous_verification_state', 'Unverified'))
add('orig-initial-previous-verification', NEW, 'orig_transition_memory_initial_previous_verification',
    'Storage original of a new gist names a previous verification state',
    lambda c: (orig(c)['payload'].__setitem__('previous_verification_state', 'Unverified'), L.sync_original(c)), control='retry')
add('orig-pin-on-unpin', 'memory/unpin', 'orig_transition_pin_previous',
    'Storage original of an unpin labelled pin (same shared command and records); pin needs an unpinned gist',
    lambda c: (orig(c)['payload'].__setitem__('operation', 'pin'), L.sync_original(c)), control='retry')
add('orig-unpin-on-pin', 'memory/pin', 'orig_transition_unpin_previous',
    'Storage original of a pin labelled unpin (same shared command and records); unpin needs a pinned gist',
    lambda c: (orig(c)['payload'].__setitem__('operation', 'unpin'), L.sync_original(c)), control='retry')

# ---------------------------------------------------------------- Storage original rows (retry)
def O(edit, keep=False):
    return lambda c: (edit(orig(c), c), L.sync_original(c, keep_identity=keep))


def P(k, v): return lambda s, c: s['payload'].__setitem__(k, v)
def E(k, v): return lambda s, c: s.__setitem__(k, v)


for target, edit, defect, base in [
        ('orig_payload_schema', P('unexpected', 1), 'an undeclared payload property', R),
        ('orig_inline_reference', E('payload_ref', 'payload:ref-A'), 'a payload reference beside the inline body', R),
        ('orig_scope_thread_id', E('thread_id', 'thread-X'), 'the envelope thread differs from its payload thread', R),
        ('orig_scope_project_id', P('project_id', 'project-B'), 'the payload project differs from its envelope', R),
        ('orig_scope_scope_kind', P('scope_kind', 'application'), 'the payload scope differs from its envelope', R),
        ('orig_scope_schema_payload_id', E('payload_schema_id', 'pm.browser.session.state_changed.payload.application.v1'),
         'the envelope payload_schema_id differs from payload.schema_id', R),
        ('orig_scope_schema_family', lambda s, c: (s.__setitem__('payload_schema_id', 'pm.browser.session.state_changed.payload.application.v1'),
                                                   s['payload'].__setitem__('schema_id', 'pm.browser.session.state_changed.payload.application.v1')),
         'the payload schema is the application schema in Project scope (envelope copy alike)', R),
        ('orig_scope_partition', lambda s, c: (s.__setitem__('project_id', 'project-B'), s['payload'].__setitem__('project_id', 'project-B')),
         'another project in envelope and payload alike', R),
        ('orig_source_thread_id', lambda s, c: (s.__setitem__('thread_id', 'thread-X'), s['payload'].__setitem__('thread_id', 'thread-X')),
         'another thread in envelope and payload alike', R),
        ('orig_source_computer_id', P('computer_id', 'computer-B'), 'another computer', R),
        ('orig_source_server_id', P('server_id', 'server-B'), 'another server (own identity recomputed)', R),
        ('orig_source_storage_instance_id', P('storage_instance_id', '22222222-2222-4222-8222-222222222222'), 'another Storage (own identity recomputed)', R),
        ('orig_source_owner_operation_id', P('owner_operation_id', 'operation-B'), 'another operation (own identity recomputed)', R),
        ('orig_source_owner_change_id', P('owner_change_id', 'change-B'), 'another change id', R),
        ('orig_source_revision_before', P('revision_before', 5), 'another revision_before', R),
        ('orig_source_revision_after', P('revision_after', 9), 'another revision_after', R),
        ('orig_source_before_record_ref', P('before_record_ref', 'record:other'), 'another before record reference', R),
        ('orig_source_after_record_ref', P('after_record_ref', 'record:other'), 'another after record reference', R),
        ('orig_source_subject', P('browser_session_id', 'session-B'), 'another session', R),
        ('orig_source_workspace', P('workspace_id', 'workspace-B'), 'another workspace', R),
        ('orig_browser_fact_session_class', P('session_class', 'detached_preview'), 'a session class the after record does not hold', R),
        ('orig_browser_fact_previous_session_class', P('previous_session_class', 'detached_preview'), 'a previous class the before record does not hold', R),
        ('orig_browser_fact_takeover_state', P('takeover_state', 'offered'), 'a takeover state the after record does not hold', R),
        ('orig_browser_fact_previous_takeover_state', P('previous_takeover_state', 'offered'), 'a previous takeover state the before record does not hold', R),
        ('orig_browser_fact_lifecycle_state', P('lifecycle_state', 'closed'), 'a lifecycle the after record does not hold', R),
        ('orig_browser_fact_previous_lifecycle_state', P('previous_lifecycle_state', 'closed'), 'a previous lifecycle the before record does not hold', R),
        ('orig_browser_delta', P('changed_fields', ['url']), 'changed_fields other than the record delta', R),
        ('orig_memory_command_automatic', P('operation', 'automatic'), 'an automatic original under the verify command', MEM_RETRY),
        ('orig_memory_command_manual', P('operation', 'pin'), 'a pin original under the verify command', MEM_RETRY),
        ('orig_memory_fact_pinned', P('pinned', True), 'pinned differs from the after record', MEM_RETRY),
        ('orig_memory_fact_previous_pinned', P('previous_pinned', True), 'previous_pinned differs from the before record', MEM_RETRY),
        ('orig_memory_fact_previous_verification_state', P('previous_verification_state', 'Discarded'), 'previous state differs from the before record', MEM_RETRY),
        ('orig_memory_fact_verification_state', P('verification_state', 'Unverified'), 'state differs from the after record', MEM_RETRY),
        ('orig_memory_fact_source', P('source', 'Import'), 'source differs from the after record', MEM_RETRY),
        ('orig_memory_fact_evidence_refs', P('evidence_refs', ['evidence:other']), 'evidence differs from the after record', MEM_RETRY),
        ('orig_memory_delta_matches', P('changed_fields', ['summary']), 'changed_fields other than the record delta', MEM_RETRY)]:
    add(target.replace('_', '-'), base, target, 'Storage original: ' + defect + '; the retry observation, receipt and result follow it', O(edit))
add('orig-idempotency', R, 'orig_idempotency', 'Storage original with a forged idempotency key (event_id kept)',
    O(E('idempotency_key', 'card2@1:00'), keep=True))
add('orig-inline-oversized', PACK_RETRY, 'orig_inline_size', 'Storage original carries the 2000-entry evidence list inline instead of its pack',
    O(lambda s, c: s['payload'].__setitem__('evidence_refs', dcn.memory_evidence(s, c))))
for key in ['run_id', 'node_id', 'attempt_id']:
    add('orig-lineage-' + key, EXEC, 'orig_lineage_' + key, 'Storage original of an execution-sourced change with another ' + key,
        O(lambda s, c, k=key: s.__setitem__(k, s[k] + '-B' if s[k] else 'node-B')), control='retry')
add('orig-family', R, 'orig_family', 'Storage returns a closed event for this retry (schema ids and identity follow the family)',
    O(lambda s, c: (s.__setitem__('event_type', 'browser.session.closed'), s.__setitem__('payload_schema_id', 'pm.browser.session.closed.payload.v1'),
                    s['payload'].__setitem__('schema_id', 'pm.browser.session.closed.payload.v1'))))


def orig_pack(raw_fn, key=None, size=None):
    def edit(s, c):
        raw = raw_fn(s, c)
        d = new_pack(c, raw, key)
        if size is not None:
            d['size_bytes'] = size
        s['payload']['evidence_refs'] = d
    return edit


add('orig-pack-missing', PACK_RETRY, 'orig_custody_row', 'Storage original names a pack the store does not hold',
    O(lambda s, c: s['payload']['evidence_refs'].__setitem__('id', '0' * 64)))
add('orig-pack-not-msgpack', PACK_RETRY, 'orig_custody_decode', 'Storage original names a pack whose bytes are not MessagePack',
    O(orig_pack(lambda s, c: b'\xc1')))
add('orig-pack-not-list', PACK_RETRY, 'orig_custody_list_type', 'Storage original names a pack that decodes to a string',
    O(orig_pack(lambda s, c: dcn.binding_bytes('evidence:support-A'))))
add('orig-pack-bad-pointer', PACK_RETRY, 'orig_custody_list_pattern', 'Storage original names a pack with a reference outside the grammar',
    O(orig_pack(lambda s, c: dcn.binding_bytes(['bad reference']))))
add('orig-pack-duplicate', PACK_RETRY, 'orig_custody_list_unique', 'Storage original names a pack with a repeated reference',
    O(orig_pack(lambda s, c: dcn.binding_bytes(dcn.memory_evidence(c['event'], c) + ['evidence:support-A']))))
add('orig-pack-noncanonical', PACK_RETRY, 'orig_custody_canonical', 'Storage original names a non-canonical encoding of the same list',
    O(orig_pack(lambda s, c: noncanonical(dcn.memory_evidence(c['event'], c)))))
add('orig-pack-size', PACK_RETRY, 'orig_custody_size_value', 'Storage original descriptor size_bytes is not the pack length',
    O(lambda s, c: s['payload']['evidence_refs'].__setitem__('size_bytes', 5)))
add('orig-pack-forged-id', PACK_RETRY, 'orig_custody_id', 'Storage original names a pack row keyed by a digest its bytes do not have',
    O(orig_pack(lambda s, c: dcn.binding_bytes(dcn.memory_evidence(c['event'], c)), key='f' * 64)))

# ---------------------------------------------------------------- records (before side) and browser physical numbers
for key, value in [('subject_id', 'session-other'), ('storage_instance_id', '22222222-2222-4222-8222-222222222222'),
                   ('server_id', 'server-other'), ('computer_id', 'computer-other'), ('project_id', 'project-other'),
                   ('thread_id', 'thread-other'), ('scope_kind', 'application'), ('run_id', 'run-other'), ('node_id', 'node-other'),
                   ('attempt_id', 'attempt-other'), ('revision', 5), ('record_ref', 'record:other'), ('workspace_id', 'workspace-other')]:
    row = {'revision': 'record_before_revision', 'record_ref': 'record_before_ref', 'workspace_id': 'record_before_workspace'}.get(key, 'record_before_' + key)
    add('before-record-' + key, SC, row, 'the before record ' + key + ' differs from the owner', lambda c, k=key, v=value: rec(c, 0).__setitem__(k, v))
for side, base in [(1, CR), (0, SC)]:
    name = ('before', 'after')[side]
    for member, value, target in [('viewport.width', 2**32, 'viewport_width_u32'), ('viewport.height', 2**32, 'viewport_height_u32'),
                                  ('scroll_position.x', 2**53 + 1, 'scroll_position_x_f64'), ('scroll_position.y', 2**53 + 1, 'scroll_position_y_f64'),
                                  ('zoom_level', 2**53 + 1, 'zoom_level_f64')]:
        def fn(c, m=member, v=value, s=side):
            facts = rec(c, s)['facts']
            if '.' in m:
                p, k = m.split('.'); facts[p][k] = v
            else:
                facts[m] = v
            if s == 0:
                browser_delta(c)
        add(name + '-record-' + member, base, 'browser_' + name + '_' + target,
            'the ' + name + ' Storage session record ' + member + ' is outside its physical domain (u32 / exact f64)', fn)

# ---------------------------------------------------------------- memory source shape, per subject
CLAIM = None


def first_claim(f): return f['claims'][0]


SHAPE = [
    ('object', lambda f: 'not-an-object'),
    ('required', lambda f: {k: v for k, v in f.items() if k != 'kind'}),
    ('known', lambda f: dict(f, undeclared_fact=1)),
    ('types', lambda f: dict(f, kind=5)),
    ('access_count', lambda f: dict(f, access_count=-1)),
    ('half_life', lambda f: dict(f, half_life_days=0)),
    ('enums', lambda f: dict(f, kind='Bogus')),
    ('currentness', lambda f: dict(f, currentness='bogus')),
    ('timestamps', lambda f: dict(f, created_at='invalid-time')),
    ('hashes', lambda f: dict(f, text_hash='A' * 64)),
    ('embedding_version', lambda f: dict(f, embedding_version='')),
    ('claims_nonempty', lambda f: dict(f, claims=[])),
    ('string_members', lambda f: dict(f, tags=[5])),
    ('evidence_pattern', lambda f: dict(f, evidence_refs=['bad reference'])),
    ('evidence_unique', lambda f: dict(f, evidence_refs=f['evidence_refs'] + f['evidence_refs'][:1])),
    ('support_pattern', lambda f: dict(f, claim_support=['bad reference'])),
    ('support_unique', lambda f: dict(f, claim_support=f['claim_support'] + f['claim_support'][:1])),
    ('support_subset', lambda f: dict(f, claim_support=['evidence:not-in-refs'])),
    ('claim_shape', lambda f: dict(f, claims=[5])),
    ('claim_id', lambda f: dict(f, claims=[dict(first_claim(f), claim_id='')])),
    ('claim_text', lambda f: dict(f, claims=[dict(first_claim(f), text='')])),
    ('claim_created_at', lambda f: dict(f, claims=[dict(first_claim(f), created_at='invalid-time')])),
    ('claim_scope', lambda f: dict(f, claims=[dict(first_claim(f), support_scope='   ')])),
    ('claim_currentness', lambda f: dict(f, claims=[dict(first_claim(f), currentness='bogus')])),
    ('claim_evidence_pattern', lambda f: dict(f, claims=[dict(first_claim(f), evidence_support=['bad reference'])])),
    ('claim_evidence_unique', lambda f: dict(f, claims=[dict(first_claim(f), evidence_support=first_claim(f)['evidence_support'] * 2)])),
    ('claim_evidence_subset', lambda f: dict(f, claims=[dict(first_claim(f), evidence_support=['evidence:not-in-refs'])])),
    ('claim_ids_unique', lambda f: dict(f, claims=[first_claim(f), dict(first_claim(f), text='Second claim.')])),
]
for name, mutate in SHAPE:
    for subject, base, getter, setter, prefix in [
            ('before record', MEM, lambda c: rec(c, 0)['facts'], lambda c, v: rec(c, 0).__setitem__('facts', v), 'memory_before'),
            ('after record', MEM, lambda c: rec(c, 1)['facts'], lambda c, v: rec(c, 1).__setitem__('facts', v), 'memory_after'),
            ('no-event before facts', NO_EVENT, lambda c: c['before_facts'], lambda c, v: c.__setitem__('before_facts', v), 'command_only_before'),
            ('no-event after facts', NO_EVENT, lambda c: c['after_facts'], lambda c, v: c.__setitem__('after_facts', v), 'command_only_after')]:
        add(prefix.replace('_', '-') + '-' + name.replace('_', '-'), base, prefix + '_' + name,
            'the ' + subject + ': ' + dcn.MEMORY_SHAPE_WORDS[name] + ' is broken by one change',
            lambda c, g=getter, s=setter, m=mutate: s(c, m(copy.deepcopy(g(c)))))


def build():
    return {'schema_id': 'pm.card2.event_p2a_cases.v1', 'schema_version': '1.0.0',
            'claim_boundary': 'Sweep part 2A witnesses and controls for the DCN guard tables. Synthetic owner/Storage adapter records only; '
                              'native authentication NOT_RUN. One defect per witness relative to its named positive (or the path-only '
                              'retry control of that positive); every copy that follows the defect moves with it.',
            'cases': CASES}


def dumps(value):
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        return json.dumps(value, indent=2, ensure_ascii=False) + '\n'
    finally:
        sys.set_int_max_str_digits(previous)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    text = dumps(build())
    witnesses = [c for c in CASES if 'target' in c]
    summary = {'witnesses': len(witnesses), 'controls': len(CASES) - len(witnesses), 'failures': FAILURES,
               'targets': len({c['target'] for c in witnesses})}
    if args.check:
        stale = not OUT.exists() or OUT.read_text() != text
        print(json.dumps(dict(summary, stale=stale), indent=1, default=str)[:20000])
        return 1 if stale or FAILURES else 0
    OUT.write_text(text)
    print(json.dumps(summary, indent=1, default=str)[:20000])
    return 1 if FAILURES else 0


if __name__ == '__main__':
    raise SystemExit(main())
