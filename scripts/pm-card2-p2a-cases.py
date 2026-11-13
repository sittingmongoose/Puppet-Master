#!/usr/bin/env python3
"""Build Plans/card2_event_p2a_cases.json: the DCN sweep part 2A and part 2B witnesses and controls.

Part 2B cases (ids ``p2b/...``, appended after every part 2A case) cover the CV-1101
date-time profiles and the SP-1101 retained-original dispatch.

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
PREFIX = 'p2a/'     # sweep part 2B witnesses below switch it to 'p2b/'

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
    case = {'id': PREFIX + cid, 'base': base, 'target': target, 'guard': dcn.ROW_BY_ID[target]['code'], 'defect': defect,
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
    case = {'id': PREFIX + cid, 'base': base, 'expect': 'accept', 'defect': note, 'changes': changes}
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
add('orig-sequence-integral-float', R, 'orig_envelope_numbers', 'Storage original sequence_id spelled 1.0 with the receipt copy alike (CV-1100)',
    lambda c: (orig(c).__setitem__('sequence_id', float(orig(c)['sequence_id'])), L.sync_original(c)))
add('history-sequence-integral-float', 'browser.session.created/project/history', 'cand_envelope_numbers',
    'retained event sequence_id spelled 1.0 in the event, Storage record, receipt and reader alike (CV-1100)',
    lambda c: (c['event'].__setitem__('sequence_id', float(c['event']['sequence_id'])), L.sync_candidate(c),
               c['reader'].__setitem__('sequence_id', float(c['reader']['sequence_id']))))
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


BOUNDARY_RETRY = 'memory.gist_state_changed/project/retry/round3/boundary-16385'
LONG_TS = '2026-11-04T00:00:00.000000000Z'


def near_boundary(c):
    """Retry control: a 10-byte longer ts and a 5-byte shorter last evidence pointer (pack, descriptor and both
    records alike), so the inline form of the same payload is 16,390 bytes: still above 16 KiB, and the original
    equals the candidate."""
    values = dcn.memory_evidence(c['event'], c)
    values = values[:-1] + [values[-1][:-5]]
    descriptor = new_pack(c, dcn.binding_bytes(values))
    pl(c)['ts'] = LONG_TS
    pl(c)['evidence_refs'] = descriptor
    rec(c, 0)['facts']['evidence_refs'] = list(values)
    rec(c, 1)['facts']['evidence_refs'] = list(values)
    c['storage']['event'] = copy.deepcopy(c['event'])
    L.sync_original(c)


accept('control/near-16k-retry', BOUNDARY_RETRY, 'retry control: inline form 16,390 bytes with a long ts (pack and records alike); accepted',
       near_boundary)
add('orig-pack-route-short-ts', BOUNDARY_RETRY, 'orig_custody_route',
    'from the near-16k retry control: the Storage original carries the short ts form, so its inline form is 16,380 bytes and '
    'needs no SP-337 pack, while the candidate still does',
    lambda c: (near_boundary(c), orig(c)['payload'].__setitem__('ts', '2026-11-04T00:00:00Z'), L.sync_original(c)))
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


# ================================================================ sweep part 2B (CV-1101 date-time, SP-1101 dispatch)
PREFIX = 'p2b/'
CRR = 'browser.session.created/project/retry'
CRH = 'browser.session.created/project/history'
CRA = 'browser.session.created/application/history'
MEMH = 'memory.gist_state_changed/project/history'
STORE = '11111111-1111-4111-8111-111111111111'
UNSEALED = '33333333-3333-4333-8333-333333333333'
# Owner-valid under CV-1101's event_record profile, and refused by the old lane grammar except the plain form.
BROAD_VALID = [('lower-t-z', '2026-11-04t00:00:00z'), ('offset', '2026-11-04T05:30:00+05:30'),
               ('plus-zero', '2026-11-04T00:00:00+00:00'), ('minus-zero', '2026-11-04T00:00:00-00:00'),
               ('leap-second', '2016-12-31T23:59:60Z'), ('leap-second-offset', '2017-01-01T00:59:60+01:00'),
               ('year-0000', '0000-01-01T00:00:00Z'), ('fraction-12', '2026-11-04T00:00:00.123456789012Z')]
# Owner-valid under CV-253's storage_utc_z profile too (terminal uppercase Z).
STORAGE_VALID = [('lower-t', '2026-11-04t00:00:00Z'), ('leap-second', '2016-12-31T23:59:60Z'),
                 ('year-0000', '0000-01-01T00:00:00Z'), ('fraction-12', '2026-11-04T00:00:00.123456789012Z')]
# Valid for event_record, refused by storage_utc_z (date_time_utc_z).
STORAGE_REFUSED = [('lower-z', '2026-11-04T00:00:00z'), ('plus-zero', '2026-11-04T00:00:00+00:00'),
                   ('minus-zero', '2026-11-04T00:00:00-00:00'), ('offset', '2026-11-04T01:00:00+01:00')]
# Refused by the shared predicate under every profile (with the shared reason).
ALL_REFUSED = [('hour-24', '2026-11-04T24:00:00Z', 'date_time_hour'), ('trailing-lf', '2026-11-04T00:00:00Z\n', 'date_time_syntax'),
               ('bad-leap-second', '2026-11-04T23:59:60Z', 'date_time_leap_second'), ('feb-29', '2026-02-29T00:00:00Z', 'date_time_day'),
               ('space', '2026-11-04 00:00:00Z', 'date_time_syntax'), ('no-zone', '2026-11-04T00:00:00', 'date_time_syntax'),
               ('offset-hour-24', '2026-11-04T00:00:00+24:00', 'date_time_offset_hour'), ('minute-60', '2026-11-04T00:60:00Z', 'date_time_minute')]


def both_retry(field, value):
    """Retry: candidate and Storage original carry the same value (producer digests still agree)."""
    def fn(c):
        c['event'][field] = value
        orig(c)[field] = value
        L.sync_original(c)
        L.sync_candidate(c)
    return fn


def both_retry_ts(value):
    def fn(c):
        pl(c)['ts'] = value
        orig(c)['payload']['ts'] = value
        L.sync_original(c)
        L.sync_candidate(c)
    return fn


def history_field(field, value):
    def fn(c):
        c['event'][field] = value
        L.sync_candidate(c)
    return fn


def history_ts(value):
    def fn(c):
        pl(c)['ts'] = value
        L.sync_candidate(c)
    return fn


# ---- CV-1101 controls: owner-valid forms the interim lane grammar refused are accepted at the right profile
for label, value in BROAD_VALID:
    accept('cv1101/append/occurred_at_utc/' + label, CR, 'occurred_at_utc ' + repr(value) + ' is valid under the CV-1101 event_record '
           'profile; accepted', lambda c, v=value: c['event'].__setitem__('occurred_at_utc', v))
    accept('cv1101/append/ts/' + label, CR, 'payload ts ' + repr(value) + ' is valid under the CV-1101 event_record profile; accepted',
           lambda c, v=value: pl(c).__setitem__('ts', v))
    accept('cv1101/retry/occurred_at_utc/' + label, CRR, 'retry: candidate and retained original both carry occurred_at_utc ' +
           repr(value) + ' (event_record profile); the producer digests agree; accepted', both_retry('occurred_at_utc', value))
    accept('cv1101/history/occurred_at_utc/' + label, CRH, 'retained history read of an original whose occurred_at_utc is ' +
           repr(value) + ' (event_record profile, exact spelling kept); accepted', history_field('occurred_at_utc', value))
    accept('cv1101/history/ts/' + label, CRH, 'retained history read of an original whose payload ts is ' + repr(value) +
           ' (event_record profile); accepted', history_ts(value))
for label, value in STORAGE_VALID:
    for key in dcn.STORAGE_TIMESTAMPS:
        accept('cv1101/append/' + key + '/' + label, CR, key + ' ' + repr(value) + ' is valid under CV-253 storage_utc_z; accepted',
               lambda c, v=value, k=key: c['event'].__setitem__(k, v))
        accept('cv1101/history/' + key + '/' + label, CRH, 'retained original whose Storage ' + key + ' is ' + repr(value) +
               ' (storage_utc_z); accepted', history_field(key, value))
accept('cv1101/retry/ts/lower-t-z', CRR, 'retry: candidate and original payload ts both lowercase; accepted',
       both_retry_ts('2026-11-04t00:00:00z'))
accept('cv1101/retry/orig-observed-lower-t', CRR, 'retry: only the original\'s Storage observed_at_utc uses a lowercase t (Storage '
       'metadata, outside producer semantics); accepted', O(lambda s, c: s.__setitem__('observed_at_utc', '2026-11-04t00:00:00Z')))
accept('cv1101/application-history/occurred_at_utc/lower-t-z', CRA, 'application retained original with lowercase occurred_at_utc; '
       'accepted', history_field('occurred_at_utc', '2026-11-04t00:00:00z'))
for label, value in BROAD_VALID[:2]:
    def mem_times(c, v=value):
        for side in (0, 1):
            f = rec(c, side)['facts']
            f['created_at'] = v
            f['claims'][0]['created_at'] = v
        memory_delta(c)
    accept('cv1101/memory/created_at/' + label, MEM, 'memory before and after records both carry created_at and claim created_at ' +
           repr(value) + ' (event_record profile; no delta); accepted', mem_times)

# ---- CV-253: the Storage-assigned fields refuse what the broad profile admits, one row per field and view
for label, value in STORAGE_REFUSED:
    for key in dcn.STORAGE_TIMESTAMPS:
        add('cv253/append/' + key + '/' + label, CR, 'cand_storage_utc_z_' + key,
            key + ' ' + repr(value) + ' passes the event_record verdict but not CV-253 storage_utc_z (date_time_utc_z)',
            lambda c, v=value, k=key: c['event'].__setitem__(k, v))
        add('cv253/history/' + key + '/' + label, CRH, 'cand_storage_utc_z_' + key,
            'retained original whose Storage ' + key + ' is ' + repr(value) + ': a skipped format check never authorizes '
            'offset or lowercase-z Storage history (CV-1101, SP-1101)', history_field(key, value))
        add('cv253/retry-original/' + key + '/' + label, CRR, 'orig_storage_utc_z_' + key,
            'retry: the Storage original\'s ' + key + ' is ' + repr(value) + ' (receipt copies moved); the candidate keeps Z',
            O(lambda s, c, v=value, k=key: s.__setitem__(k, v)))

# ---- the shared predicate refuses every lane-recorded leak, at every timestamp field (reason checked by the checker)
for label, value, reason in ALL_REFUSED:
    add('cv1101/occurred_at_utc/' + label, CR, 'cand_envelope_schema', 'occurred_at_utc ' + repr(value) + ': shared date_time ' +
        reason, lambda c, v=value: c['event'].__setitem__('occurred_at_utc', v))
    for key in dcn.STORAGE_TIMESTAMPS:
        add('cv1101/' + key + '/' + label, CR, 'cand_envelope_schema', key + ' ' + repr(value) + ': shared date_time ' + reason,
            lambda c, v=value, k=key: c['event'].__setitem__(k, v))
    add('cv1101/ts/' + label, CR, 'cand_payload_schema', 'payload ts ' + repr(value) + ': shared date_time ' + reason,
        lambda c, v=value: pl(c).__setitem__('ts', v))
    add('cv1101/history/occurred_at_utc/' + label, CRH, 'cand_envelope_schema', 'retained original occurred_at_utc ' + repr(value) +
        ': owner-invalid history refuses (shared date_time ' + reason + ')', history_field('occurred_at_utc', value))
    add('cv1101/retry-original/occurred_at_utc/' + label, CRR, 'orig_envelope_schema', 'retry: the Storage original\'s '
        'occurred_at_utc ' + repr(value) + ' (shared date_time ' + reason + ')',
        O(lambda s, c, v=value: s.__setitem__('occurred_at_utc', v)))
    for name, target in [('created_at', 'timestamps'), ('claim-created_at', 'claim_created_at')]:
        for side, prefix in [(0, 'memory_before'), (1, 'memory_after')]:
            def mem_bad(c, v=value, n=name, s=side):
                f = rec(c, s)['facts']
                if n == 'created_at':
                    f['created_at'] = v
                else:
                    f['claims'][0]['created_at'] = v
            add('cv1101/' + prefix.replace('_', '-') + '/' + name + '/' + label, MEM, prefix + '_' + target,
                'memory ' + ('before' if side == 0 else 'after') + ' record ' + name + ' ' + repr(value) + ': shared date_time ' +
                reason, mem_bad)


# ---- SP-1101 dispatch: an original outside the sealed custody, and one sealed under an unsupported recipe
def replace_strings(value, old, new):
    if type(value) is str:
        return value.replace(old, new)
    if type(value) is list:
        return [replace_strings(v, old, new) for v in value]
    if type(value) is dict:
        return {k: replace_strings(v, old, new) for k, v in value.items()}
    return value


def rebuild_reader(c):
    """Recompute every reader copy and SP-278 digest from its sources (coherent, as Storage would issue them)."""
    r = c['reader']
    tok = r['index_read_token']
    for k, raw in list(r['source_bytes'].items()):
        r['source_bytes'][k] = replace_strings(bytes.fromhex(raw).decode(), STORE, UNSEALED).encode().hex()
        tok['source_selection'][k] = __import__('hashlib').sha256(bytes.fromhex(r['source_bytes'][k])).hexdigest()
    for k in dcn.SOURCE_VALUES:
        tok['source_selection'][k] = dcn.binding_digest(r['source_values'][k])
    r['anchor']['source_selection'] = copy.deepcopy(tok['source_selection'])
    r['frontier']['source_selection'] = copy.deepcopy(tok['source_selection'])
    tok['generation_anchor_sha256'] = dcn.binding_digest(r['anchor'])
    tok['generation_id'] = 'eig_' + dcn.binding_digest(dcn.generation_source(r))
    tok['checkpoint_key'] = 'event_record_index_checkpoint.v1:' + tok['storage_instance_id']
    tok['checkpoint_ref'] = tok['checkpoint_key'] + '#/generations/' + tok['generation_id']
    tok['index_dataset_name'] = 'event_record_index.v2@' + tok['generation_id']
    tok['frontier_sha256'] = dcn.binding_digest(r['frontier'])
    r['current_index_read_token'] = copy.deepcopy(tok)


def at_store(new_store):
    """The same original at another Store: every copy of the Store moves and every identity and digest is recomputed."""
    def fn(c):
        moved = replace_strings(c, STORE, new_store)
        c.clear(); c.update(moved)
        L.refresh_identity(c['event'])
        if c['path'] == 'retry':
            L.sync_original(c)
        else:
            L.sync_candidate(c)
            c['reader']['event_id'] = c['event']['event_id']
            rebuild_reader(c)
    return fn


def at_operation(op):
    """The same change recorded under another original operation id (owner, payload, identities and copies)."""
    def fn(c):
        c['owner']['operation_id'] = op
        pl(c)['owner_operation_id'] = op
        L.refresh_identity(c['event'])
        if c['path'] == 'retry':
            orig(c)['payload']['owner_operation_id'] = op
            L.sync_original(c)
        else:
            L.sync_candidate(c)
            c['reader']['event_id'] = c['event']['event_id']
    return fn


for base in [CRR, MEM_RETRY, CRH, MEMH]:
    where = 'retry' if base.endswith('retry') else 'history'
    family = base.split('/')[0]
    add('sp1101/unsealed-store/' + family + '/' + where, base, 'recipe_custody',
        'a coherent original at Store ' + UNSEALED + ', which Storage\'s sealed custody does not hold, though the case says '
        'storage.authentic is true: original_unavailable, with no fallback', at_store(UNSEALED))
    add('sp1101/unsupported-recipe/' + family + '/' + where, base, 'recipe_installed',
        'a coherent original (operation-unregistered) whose sealed receipt names card2@0-unregistered, a recipe with no '
        'installed frozen verifier: recipe_unknown, with no fallback or probing', at_operation('operation-unregistered'))
    # Batch 2 fix 1 (SP-1101): a card2@1 original selects its recipe only from its own sealed receipt. The former
    # other-operation control (accepted through the Store's card2@1 default) is now this negative.
    add('sp1101/missing-receipt/' + family + '/' + where, base, 'recipe_custody',
        'a coherent card2@1 original (operation-other) for which Storage sealed no receipt: original_unavailable, never the '
        'card2@1 recipe by default', at_operation('operation-other'))
    add('sp1101/ambiguous-receipt/' + family + '/' + where, base, 'recipe_installed',
        'a coherent original (operation-ambiguous) with two sealed receipts (card2@1 and card2@0-unregistered): '
        'recipe_ambiguous, no single selection and no probing', at_operation('operation-ambiguous'))
    add('sp1101/receipt-for-other-original/' + family + '/' + where, base, 'recipe_custody',
        'a coherent project original (operation-other-scope) whose only sealed receipt at its event id is the '
        'application-scope original\'s: original_unavailable', at_operation('operation-other-scope'))


def history_sequence(value):
    def fn(c):
        c['event']['sequence_id'] = value
        L.sync_candidate(c)
        c['reader']['sequence_id'] = value
    return fn


accept('sp1101/large-sequence/history', CRH, 'retained history read of an original whose Storage sequence_id is 2^64-1 (SP-1100 '
       'uint64; event, Storage record, receipt and reader copies alike): resolved through custody and readable; accepted',
       history_sequence(2**64 - 1))
accept('sp1101/large-sequence/retry-original', CRR, 'retry whose Storage original carries sequence_id 2^64-1 (receipt copies moved; '
       'outside producer semantics): resolved through custody; accepted', O(lambda s, c: s.__setitem__('sequence_id', 2**64 - 1)))
accept('sp1101/case-recipe-label-ignored', CRH, 'a case-supplied recipe name and verified flag on the Storage view select nothing; '
       'accepted through custody', lambda c: c['storage'].update({'recipe': 'card2@0-unregistered', 'verified': True}))


def build():
    return {'schema_id': 'pm.card2.event_p2a_cases.v1', 'schema_version': '1.0.0',
            'claim_boundary': 'Sweep part 2A and part 2B (p2b/...) witnesses and controls for the DCN guard tables. Synthetic owner/Storage adapter records only; '
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
