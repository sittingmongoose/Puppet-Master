#!/usr/bin/env python3
"""Build the W3F phase-2 oracle fixtures deterministically (wave 3 phase 2).

Writes ``Plans/w3f_event_fixtures.json`` (complete positives and one-defect negatives stored as their
base plus exact changes) and ``Plans/w3f_original_custody.json`` (Storage's sealed write custody stand-in
for SP-1101). ``--check`` rebuilds in memory and fails if either committed file differs.

Each negative starts from a named complete positive, changes the one input its target row reads, and
refreshes only non-authoritative copies (``pm_w3f_cases_lib.sync_*``). Every negative names the plan
entries of ``Plans/w3f_event_oracle_plan.json`` it realizes; ``reports/event-authority-20261105/
W3F-phase2-plan-coverage.json`` (written by ``--coverage``) maps each plan entry to its witnesses.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pm_w3f_event_oracles as W  # noqa: E402
import pm_w3f_cases_lib as L  # noqa: E402
from pm_event_numbers import EVENT_VALUE, storage_value_bytes  # noqa: E402
from jsonschema import Draft202012Validator  # noqa: E402

ROOT = W.ROOT
OUT = ROOT / 'Plans' / W.FIXTURES
CUSTODY_OUT = ROOT / 'Plans' / W.CUSTODY_FILE
COVERAGE_OUT = ROOT / 'reports' / 'event-authority-20261105' / 'W3F-phase2-plan-coverage.json'
RESOURCES = sorted(['Plans/event_record.schema.json', 'Plans/event_append_receipt_contracts.schema.json'] +
                   [W.schema_file(f) for f in W.FAMILIES])
OTHER = 'zz.other'

POSITIVES, NEGATIVES, RECEIPTS = [], [], []
BASES = {}


def manifest():
    profiles = {k: W.TIMESTAMP_PROFILES[k] for k in W.RECIPE_PROFILE_FIELDS}
    return W.resource_manifest({n: hashlib.sha256((ROOT / n).read_bytes()).hexdigest() for n in RESOURCES}, profiles)


MANIFEST = None


def seal(c, force=False, **kw):
    """Storage seals one receipt per original write; the same original reused by several scenarios is sealed
    once. Only the deliberate ambiguity witness forces a second receipt for the same bytes."""
    kw.setdefault('manifest', MANIFEST)
    receipt = L.sealed_receipt(c, **kw)
    if not force and receipt in RECEIPTS:
        return
    RECEIPTS.append(receipt)


def positive(cid, c, plan=(), seal_original=True):
    if cid in BASES:
        raise ValueError('duplicate positive ' + cid)
    with W.exact_digits():
        c = json.loads(json.dumps(c))      # no shared objects: every scenario is a plain tree, as its fixture text is
    BASES[cid] = c
    POSITIVES.append({'id': cid, 'family': c['family'], 'path': c['path'], 'expect': 'accept', 'plan': sorted(set(plan)),
                      'scenario': c})
    if seal_original and c['path'] in ('retry', 'history'):
        seal(c)


def diff(a, b, pointer=''):
    """Exact changes turning a into b: set/delete at the deepest differing dict key; lists replaced whole."""
    if type(a) is dict and type(b) is dict:
        out = []
        for k in a:
            if k not in b:
                out.append([pointer + '/' + k.replace('~', '~0').replace('/', '~1'), 'delete'])
        for k in b:
            p = pointer + '/' + k.replace('~', '~0').replace('/', '~1')
            if k not in a:
                out.append([p, 'set', b[k]])
            elif not W.strict_equal(a[k], b[k]):
                out.extend(diff(a[k], b[k], p))
        return out
    return [[pointer, 'set', b]]


def negative(nid, base, row, change, plan=(), note=''):
    """change(c) mutates a deep copy of the base and refreshes non-authoritative copies itself."""
    c = copy.deepcopy(BASES[base])
    result = change(c)
    if result is False:
        return None
    changes = diff(BASES[base], c)
    if not changes:
        raise ValueError('negative changes nothing: ' + nid)
    NEGATIVES.append({'id': nid, 'base': base, 'family': c['family'], 'expect': {'row': row, 'code': W.ROW_SPEC[row]['code']},
                      'plan': sorted(set(plan)), 'note': note, 'changes': changes})
    return nid


def resync(c, identity=False, operation=False):
    if identity or operation:
        L.sync_identity(c, operation=operation)
    if c['path'] == 'append':
        L.sync_custody(c)
    if c['path'] == 'retry':
        pass


def pid(family, name):
    return family + ':' + name


# ---------------------------------------------------------------------------------------------
# positives
# ---------------------------------------------------------------------------------------------
def build_positives():
    for fam in W.FAMILIES:
        k = W.kind(fam)
        for scope in W.FAMILY_SPECS[fam][3]:
            common = [pid(fam, x) for x in ('admission', 'replay_mode', 'source_identity', 'event_identity', 'producer_digest',
                                             'storage_metadata', 'receipt_custody', 'scope_project_null', 'key_recipe_' + scope)]
            positive(fam + '/' + scope + '/append', L.append_scenario(fam, scope), common)
            positive(fam + '/' + scope + '/retry', L.retry_scenario(fam, scope), [pid(fam, 'idempotency')])
            positive(fam + '/' + scope + '/history', L.history_scenario(fam, scope),
                     [pid(fam, x) for x in ('history_recipe', 'history_admission', 'withdrawal', 'final_output', 'access',
                                             'token_frontier', 'token_scope', 'coverage', 'replay_effect')])
        scope = W.FAMILY_SPECS[fam][3][0]
        # retry: Storage metadata differs, conflict, dedupe behind
        c = L.retry_scenario(fam, scope)
        conflict_change(c)
        c['retry']['result'] = 'idempotency_conflict'
        c['retry']['returned_receipt'] = None
        positive(fam + '/' + scope + '/retry/conflict', c, [pid(fam, 'idempotency')])
        c = L.retry_scenario(fam, scope)
        c['retry']['frontier'], c['retry']['result'], c['retry']['returned_receipt'] = 101, 'dedupe_unavailable', None
        positive(fam + '/' + scope + '/retry/dedupe-behind', c, [pid(fam, 'dedupe_current')])
        # history: held source with a grant discloses; denied without disclosure; compacted with translation
        c = L.history_scenario(fam, scope)
        c['reader']['held'] = True
        positive(fam + '/' + scope + '/history/held', c, [pid(fam, 'hold_visibility')], seal_original=False)
        c = L.history_scenario(fam, scope)
        c['reader']['grant_current'], c['reader']['disclosed'], c['reader']['output'] = False, False, None
        positive(fam + '/' + scope + '/history/undisclosed', c, [pid(fam, 'access'), pid(fam, 'deleted')], seal_original=False)
        c = L.history_scenario(fam, scope)
        c['storage']['compacted'], c['storage']['translation_ref'] = True, 'translation:compaction:7'
        c['reader']['translation_ref'] = 'translation:compaction:7'
        positive(fam + '/' + scope + '/history/compacted', c, [pid(fam, 'translation')], seal_original=False)
        # timestamps the broad EventRecord profile admits for occurred_at_utc (autonomy created_at follows it)
        for name, ts in [('lower-t-z', '2026-11-05t10:15:30.123z'), ('offset', '2026-11-05T15:45:30.123+05:30'),
                         ('leap-second', '2016-12-31T23:59:60Z'), ('long-fraction', '2026-11-05T10:15:30.123456789012Z')]:
            c = L.append_scenario(fam, scope)
            c['event']['occurred_at_utc'] = ts
            if k == 'autonomy':
                c['event']['payload']['created_at_utc'] = ts
            resync(c)
            positive(fam + '/' + scope + '/append/occurred-' + name, c, [pid(fam, 'timestamp')])
        # numbers: uint64 maximum sequence; 2^53 producer integer encodes exactly
        c = L.append_scenario(fam, scope)
        c['event']['sequence_id'] = c['storage_issued']['sequence_id'] = 2 ** 64 - 1
        resync(c)
        positive(fam + '/' + scope + '/append/sequence-u64-max', c, [pid(fam, 'numbers')])
        c = L.append_scenario(fam, scope)
        c['event']['producer_sequence_id'] = 2 ** 53
        resync(c)
        positive(fam + '/' + scope + '/append/producer-2p53', c, [pid(fam, 'numbers')])
        # SP-337: an exactly 16 KiB inline body and a genuine pack above it
        c = L.append_scenario(fam, scope)
        L.grow_to(c, W.INLINE_LIMIT)
        resync(c)
        positive(fam + '/' + scope + '/append/inline-16384', c, [pid(fam, 'inline_size')])
        c = L.append_scenario(fam, scope)
        L.grow_to(c, W.INLINE_LIMIT + 1)
        L.to_pack(c)
        resync(c)
        positive(fam + '/' + scope + '/append/pack-16385', c, [pid(fam, 'inline_size'), pid(fam, 'pack_custody')])
    family_variants()
    install = {'family': W.FAMILIES[0], 'path': 'install', 'resources': {f: W.payload_schema(f) for f in W.FAMILIES}}
    positive('install/all', install, [pid(f, 'refs_eager') for f in W.FAMILIES])


def conflict_change(c):
    """One semantic value under the same identity: a joined field changed coherently in owner and candidate."""
    fam, k = c['family'], W.kind(c['family'])
    p, s = c['event']['payload'], c['owner']['source']
    if k == 'discovery':
        s['elapsed_ms'] = p['elapsed_ms'] = p['elapsed_ms'] + 5
    elif k == 'budget':
        s['question_records_ref'] = p['question_records_ref'] = p['question_records_ref'] + '.v2'
    elif k == 'graph':
        s['approval_ref'] = p['source_approval_ref'] = p['source_approval_ref'] + '.v2'
    elif k == 'prompt':
        s['state_source_ref'] = p['state_source_ref'] = p['state_source_ref'] + '.v2'
    else:
        s['decision_source_ref'] = p['decision_source_ref'] = p['decision_source_ref'] + '.v2'


def family_variants():
    fam = 'planning.question_budget_exhausted'
    for variant in ('plan_grill', 'deep_plan', 'brainstorm', 'crew', 'chat_room'):
        for scope in ('application', 'project'):
            positive(fam + '/' + scope + '/append/' + variant, L.append_scenario(fam, scope, variant),
                     [pid(fam, x) for x in ('backend_join', 'run_counter', 'charged_count', 'effective_limit', 'continuation',
                                             'no_question', 'no_failure', 'no_autoconfirm', 'no_budget_build_block', 'typed_attempt')])
    # asked above the limit after a later reconfiguration (valid history; never demand equality)
    positive(fam + '/application/history/reconfigured', L.history_scenario(fam, 'application', 'reconfigured'),
             [pid(fam, 'history_reconfiguration'), pid(fam, 'remaining')])
    positive(fam + '/application/append/reconfigured', L.append_scenario(fam, 'application', 'reconfigured'),
             [pid(fam, 'remaining')])
    fam = 'run.graph_canonical_locked'
    positive(fam + '/project/append/replan', L.append_scenario(fam, 'project', 'replan'),
             [pid(fam, x) for x in ('graph_source', 'generation', 'stale_attempt', 'no_flatten')])
    positive(fam + '/project/history/replan', L.history_scenario(fam, 'project', 'replan'), [pid(fam, 'generation')])
    for fam in ('session_prompt.cancelled', 'session_prompt.expired'):
        for scope in ('application', 'project'):
            positive(fam + '/' + scope + '/append/from-admitted', L.append_scenario(fam, scope, 'from_admitted'),
                     [pid(fam, 'lifecycle')])
    for fam in ('session_prompt.admitted', 'session_prompt.rejected'):
        c = L.append_scenario(fam, 'application')
        c['owner']['source']['prompt_text'] = 'Please summarize\nthe last run\nthanks ' + chr(0xe9) + chr(0x4e2d)
        positive(fam + '/application/append/normalized-equivalent', c, [pid(fam, 'prompt_hash')])
    fam = 'autonomy.ceiling_checked'
    for variant in ('block', 'require_approval', 'allow_permissions_refused', 'allow_filesafe_refused'):
        for scope in ('application', 'project'):
            positive(fam + '/' + scope + '/append/' + variant, L.append_scenario(fam, scope, variant),
                     [pid(fam, x) for x in ('dispatch_' + variant.replace('allow_', 'allow_').replace('_refused', '')
                                             if variant.startswith('allow_') else 'dispatch_' + variant,
                                             'reason_allow' if variant.startswith('allow') else 'reason_refusal', 'enforcement_order')])
    # application-scope discovery with an SSH-free, cache-free source and a rootless non-discovery family are the bases


# ---------------------------------------------------------------------------------------------
# negatives
# ---------------------------------------------------------------------------------------------
def neg_common(fam, scope):
    k = W.kind(fam)
    A, R, H = fam + '/' + scope + '/append', fam + '/' + scope + '/retry', fam + '/' + scope + '/history'
    n = lambda name: fam + '/' + scope + '/neg/' + name  # noqa: E731

    def setp(pointer, value, identity=False, operation=False, sync=True):
        def change(c):
            W.apply_change(c, pointer, 'set', value)
            if sync:
                resync(c, identity, operation)
        return change

    negative(n('scenario-path'), A, 'scenario_path', setp('/path', 'replay'))
    negative(n('scenario-family'), A, 'scenario_family', setp('/family', 'discovery.unknown_family'))
    other = [f for f in W.FAMILIES if f != fam][0]
    negative(n('event-family'), A, 'event_family', setp('/event/event_type', other), [pid(fam, 'admission')])
    negative(n('history-foreign-family'), H, 'event_family', setp('/event/event_type', other), [pid(fam, 'history_admission')],
             'a foreign retained record is refused')
    # envelope and timestamps (occurred_at_utc broad profile through the envelope verdict)
    for name, ts in [('missing-zone', '2026-11-05T10:15:30.123'), ('space-separator', '2026-11-05 10:15:30.123Z'),
                     ('impossible-date', '2026-02-30T10:15:30Z'), ('hour-24', '2026-11-05T24:00:00Z'),
                     ('trailing-lf', '2026-11-05T10:15:30.123Z\n'), ('false-leap-second', '2026-11-05T10:15:60Z'),
                     ('empty-fraction', '2026-11-05T10:15:30.Z')]:
        negative(n('occurred-' + name), A, 'envelope_schema', setp('/event/occurred_at_utc', ts), [pid(fam, 'timestamp')])
    negative(n('envelope-required'), A, 'envelope_schema', lambda c: (W.apply_change(c, '/event/correlation_id', 'delete'), resync(c)))
    negative(n('producer-sequence-float'), A, 'envelope_numbers', setp('/event/producer_sequence_id', 41.0), [pid(fam, 'numbers')],
             'integral float at an EventRecord integer slot (1.0 and 1e0 parse to the same float)')
    negative(n('sequence-above-u64'), A, 'sequence_u64', setp('/event/sequence_id', 2 ** 64), [pid(fam, 'numbers')])
    negative(n('observed-offset'), A, 'storage_utc_z_observed_at_utc', setp('/event/observed_at_utc', '2026-11-05T10:15:30.456+00:00'),
             [pid(fam, 'timestamp')])
    negative(n('observed-lower-z'), A, 'storage_utc_z_observed_at_utc', setp('/event/observed_at_utc', '2026-11-05T10:15:30.456z'),
             [pid(fam, 'timestamp')])
    negative(n('persisted-minus-zero'), A, 'storage_utc_z_persisted_at_utc', setp('/event/persisted_at_utc', '2026-11-05T10:15:30.789-00:00'),
             [pid(fam, 'timestamp')])
    negative(n('payload-schema-id'), A, 'payload_schema_id', setp('/event/payload_schema_id', 'pm.event_payload.' + other + '.v1'))
    negative(n('producer-2p53-plus-1'), A, 'producer_route', setp('/event/producer_sequence_id', 2 ** 53 + 1), [pid(fam, 'numbers')],
             'stock-valid integer that the CV-1100 producer route refuses (jcs_binary64) before effects')
    # The valid 4,400-digit integer routes run in memory in scripts/pm-w3f-number-corpus.py for every family: a JSON
    # text holding one is unreadable to Python's default parser, which the shared date-time inventory gate uses.
    # body size and pack
    if scope == W.FAMILY_SPECS[fam][3][0]:
        pack_negatives(fam, scope, n, setp)
    # scope and context
    if scope == 'project':
        negative(n('scope-project-copy'), A, 'scope_project_copy', setp('/event/payload/context/project_id', 'proj.other'),
                 [pid(fam, 'scope_project_null')])
        negative(n('partition-raw-project'), A, 'target_partition', setp('/target/scope_partition', 'proj.alpha'),
                 [pid(fam, 'scope_project_null')], 'a raw project id instead of the encoded project~ partition')

        def ctx_scope(c):
            c['event']['payload']['context']['scope_kind'] = 'application'
            c['event']['payload']['context']['project_id'] = None
            if W.kind(fam) in ('discovery', 'graph') and c['event']['payload']['context']['thread_id'] is None:
                c['event']['payload']['context']['thread_id'] = 'thr.alpha'
            if W.kind(fam) == 'discovery' and c['event']['payload']['context']['working_root_ref'] is None:
                c['event']['payload']['context']['working_root_ref'] = 'root:opaque:alpha'
            resync(c)
        if W.kind(fam) != 'graph':      # the graph payload fixes context.scope_kind project (payload_schema owns it)
            negative(n('scope-kind-copy'), A, 'scope_kind_copy', ctx_scope, [pid(fam, 'scope_project_null')])
    else:
        negative(n('partition-project-for-app'), A, 'target_partition', setp('/target/scope_partition', W.partition('project', 'proj.alpha')),
                 [pid(fam, 'scope_project_null')])
    negative(n('scope-thread-copy'), A, 'scope_thread_copy', setp('/event/payload/context/thread_id', 'thr.other'))
    for f in W.CONTEXT_FIELDS:
        value = {'scope_kind': 'application' if scope == 'project' else 'project', 'project_id': 'proj.other' if scope == 'project' else 'proj.alpha',
                 'server_id': 'srv.other', 'thread_id': 'thr.other', 'host_id': 'host.other', 'working_root_ref': 'root:opaque:other',
                 'worktree_id': 'wt.other', 'remote_identity_ref': 'remote:identity:other'}[f]
        negative(n('owner-context-' + f), A, 'context_' + f, setp('/owner/' + f, value),
                 [pid(fam, 'scope_project_null')] if f in ('project_id', 'scope_kind') else [pid(fam, 'source_identity')])
    for f in ('run_id', 'attempt_id', 'node_id'):
        negative(n('owner-lineage-' + f), A, 'lineage_' + f, setp('/owner/' + f, 'lin.other'))
    # identity
    subject = W.FAMILY_SPECS[fam][5]
    op_tag = pid(fam, 'operation_identity') if k == 'budget' else pid(fam, 'source_identity')
    negative(n('owner-subject'), A, 'source_identity', setp('/owner/source/' + subject, 'subject.other'), [pid(fam, 'source_identity'), op_tag])
    negative(n('operation-not-subject'), A, 'operation_field', setp('/event/payload/owner_operation_id', 'op.other', identity=True),
             [op_tag], 'owner_operation_id is not the family operation identity; event and key copies refreshed')
    negative(n('event-id-other'), A, 'event_identity', setp('/event/event_id', 'evt_w3f_' + L.HEX('other-event')), [pid(fam, 'event_identity')])
    negative(n('event-id-current-epoch'), A, 'event_identity', lambda c: (
        c['event'].__setitem__('event_id', W.event_id_recipe(L.SID, L.EPOCH + 1, W.event_partition(c['event']), fam,
                                                             c['event']['payload']['owner_operation_id'])), resync(c)),
        [pid(fam, 'event_identity')], 'an event id reminted with a later recovery epoch')

    def other_key(c):
        key = W.key_recipe(scope, fam, c['event']['payload']['context']['server_id'], 'op.unused.0001')
        c['event']['idempotency_key'] = key
        if W.kind(fam) == 'prompt':
            c['event']['payload']['idempotency_key'] = key
        resync(c)
    negative(n('key-recipe-' + scope), A, 'key_recipe_' + scope, other_key, [pid(fam, 'key_recipe_' + scope)],
             'a well-formed unused key of the same grammar; operation, server, epoch, scope and event id fixed')
    # writer
    negative(n('producer-other'), A, 'producer_identity', setp('/producer', 'Other.producer@1.0.0'), [pid(fam, 'admission')])
    negative(n('writer-grant-removed'), A, 'admission_grant', setp('/admission/writer_granted', False), [pid(fam, 'admission')])
    negative(n('writer-grant-string'), A, 'admission_grant', setp('/admission/writer_granted', 'true'), [pid(fam, 'admission')],
             'a string boolean is not a grant')
    negative(n('admitted-other-family'), A, 'admission_family', setp('/admission/family', other), [pid(fam, 'admission')])
    negative(n('admitted-unknown-version'), A, 'admission_version', setp('/admission/version', '1.1.0'), [pid(fam, 'admission')])
    negative(n('writer-withdrawn'), A, 'writer_withdrawn', setp('/admission/writer_withdrawn', True), [pid(fam, 'withdrawal')])
    negative(n('replay-only'), A, 'replay_only', setp('/event/replay_policy', 'projector_replay_only'), [pid(fam, 'replay_mode')])
    negative(n('retry-replay-only'), R, 'replay_only', setp('/event/replay_policy', 'projector_replay_only'), [pid(fam, 'replay_mode')])
    negative(n('replay-append-once'), A, 'replay_policy_family', setp('/event/replay_policy', 'append_once'), [pid(fam, 'replay_mode')])
    # publication
    negative(n('storage-sequence'), A, 'storage_sequence_id', setp('/event/sequence_id', L.SEQ + 1), [pid(fam, 'storage_metadata')])
    negative(n('storage-observed'), A, 'storage_observed_at_utc', setp('/event/observed_at_utc', '2026-11-05T10:15:31.000Z'),
             [pid(fam, 'storage_metadata')])
    negative(n('storage-persisted'), A, 'storage_persisted_at_utc', setp('/event/persisted_at_utc', '2026-11-05T10:15:31.000Z'),
             [pid(fam, 'storage_metadata')])
    negative(n('custody-storage'), A, 'custody_storage', setp('/publication/custody/storage_instance_id', L.OTHER_SID, sync=False), [pid(fam, 'receipt_custody')])
    negative(n('custody-event'), A, 'custody_event', setp('/publication/custody/event_id', 'evt_w3f_' + L.HEX('x'), sync=False), [pid(fam, 'receipt_custody')])
    negative(n('custody-receipt-shape'), A, 'custody_receipt_schema', setp('/publication/custody/receipt/durability_state', 'pending', sync=False),
             [pid(fam, 'receipt_custody')])
    negative(n('custody-receipt-event'), A, 'custody_receipt_event', setp('/publication/custody/receipt/event_id', 'evt_w3f_' + L.HEX('y'), sync=False),
             [pid(fam, 'receipt_custody')])
    negative(n('custody-receipt-sequence'), A, 'custody_receipt_sequence', setp('/publication/custody/receipt/sequence_id', L.SEQ + 5, sync=False),
             [pid(fam, 'receipt_custody')])
    negative(n('custody-full-value'), A, 'custody_full_value', setp('/publication/custody/full_value_sha256', L.HEX('other-operation-value'), sync=False),
             [pid(fam, 'receipt_custody')], 'custody of an otherwise coherent different operation')
    negative(n('custody-producer'), A, 'custody_producer', setp('/publication/custody/producer_semantic_sha256', L.HEX('other-digest'), sync=False),
             [pid(fam, 'producer_digest')], 'a supplied producer digest is never trusted')
    negative(n('custody-epoch'), A, 'custody_epoch', setp('/publication/custody/recovery_epoch', L.EPOCH + 1, sync=False), [pid(fam, 'receipt_custody')])

    def move(item, anchor, after):
        def change(c):
            steps = [x for x in c['publication']['order'] if x != item]
            steps.insert(steps.index(anchor) + (1 if after else 0), item)
            c['publication']['order'] = steps
        return change
    negative(n('order-append-before-body'), A, 'order_body_before_append', move('body_durable', 'append', True), [pid(fam, 'receipt_custody')])
    negative(n('order-receipt-before-append'), A, 'order_append_before_receipt', move('receipt_synced', 'append', False),
             [pid(fam, 'receipt_custody')])
    negative(n('order-publish-before-receipt'), A, 'order_receipt_before_publication', move('publication', 'receipt_synced', False),
             [pid(fam, 'receipt_custody')])
    if W.kind(fam) == 'graph':
        negative(n('order-commit-after-append'), A, 'order_source_before_append', move('source_commit', 'append', True), [pid(fam, 'graph_source')])
    # retry
    negative(n('retry-dedupe-behind'), R, 'retry_dedupe_behind', setp('/retry/frontier', 101), [pid(fam, 'dedupe_current')])
    negative(n('retry-dedupe-claimed'), R, 'retry_dedupe_claim', lambda c: c['retry'].update(result='dedupe_unavailable', returned_receipt=None),
             [pid(fam, 'dedupe_current')])
    negative(n('retry-conflict-returned-original'), R, 'retry_conflict', lambda c: (conflict_change(c)), [pid(fam, 'idempotency')],
             'one semantic value changed under the same identity; the original was returned')
    negative(n('retry-effects'), R, 'retry_effects', setp('/retry/effects', 1), [pid(fam, 'idempotency')])
    negative(n('retry-effects-bool'), R, 'retry_effects', setp('/retry/effects', False), [pid(fam, 'idempotency')], 'a boolean is not a count')
    negative(n('retry-receipt-new'), R, 'retry_returned_receipt', setp('/retry/returned_receipt/sequence_id', L.SEQ + 9),
             [pid(fam, 'idempotency')])

    def remint(c):
        c['owner']['recovery_epoch'] = L.EPOCH + 1
        L.sync_identity(c)
    negative(n('retry-remint-epoch'), R, 'retry_epoch', remint, [pid(fam, 'idempotency')],
             'the retry reminted its identity with the current recovery epoch')

    def other_op(c):
        c['event']['payload']['owner_operation_id'] = 'op.other'
        c['owner']['source'][subject] = 'op.other'
        if W.kind(fam) != 'prompt':
            c['event']['payload'][subject] = 'op.other'
        L.sync_identity(c, operation=W.kind(fam) == 'prompt')
    negative(n('retry-other-identity'), R, 'retry_identity', other_op if W.kind(fam) != 'prompt' else
             (lambda c: (c['event']['payload'].__setitem__('admission_id', 'adm.other'),
                         c['owner']['source'].__setitem__('admission_id', 'adm.other'),
                         c['event']['payload'].__setitem__('prompt_id', 'prm.other'),
                         c['owner']['source'].__setitem__('prompt_id', 'prm.other'),
                         L.sync_identity(c, operation=True))), [pid(fam, 'idempotency')],
             'a different coherent operation is a fresh append, not a retry of this original')
    # retained originals (retry and history)
    for base, tag in ((R, 'retry'), (H, 'history')):
        negative(n(tag + '-storage-unauthentic'), base, 'storage_authentic', setp('/storage/authentic', False), [pid(fam, 'receipt_custody')])
        negative(n(tag + '-original-withdrawn'), base, 'original_withdrawn', setp('/storage/withdrawn', True), [pid(fam, 'withdrawal')])
        sel = '/retry/recipe_selector' if tag == 'retry' else '/reader/recipe_selector'
        negative(n(tag + '-caller-recipe'), base, 'recipe_override', setp(sel, 'w3f@0'), [pid(fam, 'history_recipe')],
                 'a caller-selected weaker recipe')
        for special, row in (('unsealed', 'recipe_custody'), ('other-original-receipt', 'recipe_receipt_binding'),
                             ('ambiguous', 'recipe_unique'), ('no-admission', 'original_admission'), ('unknown-recipe', 'recipe_installed')):
            negative(n(tag + '-' + special), base, row, lambda c, sp=special: special_original(c, sp),
                     [pid(fam, 'history_recipe' if special in ('unknown-recipe', 'ambiguous') else 'history_admission')])
        def unencodable(c):
            c['storage']['event']['sequence_id'] = 2 ** 64
            if c['path'] == 'history':
                c['event'] = copy.deepcopy(c['storage']['event'])
        negative(n(tag + '-original-unencodable'), base, 'original_resolved', unencodable, [pid(fam, 'history_recipe')],
                 'Storage cannot hand the original out as canonical SP-236 bytes: unavailable, never accepted')
        for comp in ('envelope', 'payload', 'storage_times', 'operation', 'event_identity', 'key', 'full_value', 'producer', 'custody_event'):
            negative(n(tag + '-original-' + comp.replace('_', '-')), base, 'original_' + comp,
                     lambda c, cp=comp: corrupt_original(c, cp), [pid(fam, 'history_recipe')])
    # history reader
    negative(n('history-forged-record'), H, 'historical_record', lambda c: forge_presented(c), [pid(fam, 'final_output'),
             pid(fam, 'history_reconfiguration') if k == 'budget' else pid(fam, 'history_recipe')],
             'a coherent different snapshot presented as the retained original')

    def binding_other(c):
        c['event']['idempotency_key'] = W.key_recipe(scope, fam, L.SERVER, 'op.unused.0002')
        if W.kind(fam) == 'prompt':
            c['event']['payload']['idempotency_key'] = c['event']['idempotency_key']
    negative(n('history-binding-key'), H, 'original_binding', binding_other, [pid(fam, 'history_recipe')])
    negative(n('reader-other-version'), H, 'reader_id', setp('/reader/reader_id', 'reader.' + fam + '@2.0.0'), [pid(fam, 'withdrawal')])
    negative(n('reader-withdrawn'), H, 'reader_withdrawn', setp('/reader/withdrawn', True), [pid(fam, 'withdrawal')])
    negative(n('token-snapshot-persisted'), H, 'token_schema', setp('/reader/token/redb_snapshot_id', 'redb.snap.4'), [pid(fam, 'token_frontier')],
             'the durable token never persists redb_snapshot_id')
    negative(n('token-required'), H, 'token_schema', lambda c: W.apply_change(c, '/reader/token/frontier_sha256', 'delete'), [pid(fam, 'token_frontier')])
    negative(n('token-float'), H, 'token_numbers', setp('/reader/token/frontier_revision', 100.0), [pid(fam, 'numbers')])
    negative(n('token-generation-lf'), H, 'token_fullmatch', setp('/reader/token/generation_id', L.GEN + '\n'), [pid(fam, 'token_frontier')],
             'a trailing LF the stock pattern $ admits')
    negative(n('token-uuid-upper'), H, 'token_fullmatch', setp('/reader/token/storage_instance_id', L.SID.upper()), [pid(fam, 'token_scope')])

    def other_store(c):
        for t in (c['reader']['token'], c['reader']['current_token']):
            t['storage_instance_id'] = L.OTHER_SID
        c['reader']['dataset_storage_instance_id'] = L.OTHER_SID
    negative(n('token-other-storage'), H, 'token_storage', other_store, [pid(fam, 'token_scope')])
    negative(n('dataset-other-storage'), H, 'token_dataset_storage', setp('/reader/dataset_storage_instance_id', L.OTHER_SID), [pid(fam, 'token_scope')])

    def advance(c):
        c['reader']['current_token']['frontier_revision'] = 101
        c['reader']['current_token']['frontier_sha256'] = L.HEX('frontier-101')
    negative(n('frontier-advanced'), H, 'token_current', advance, [pid(fam, 'token_frontier')])
    negative(n('coverage-family-max'), H, 'coverage_global', setp('/reader/coverage/kind', 'matching_family_max'), [pid(fam, 'coverage')])
    negative(n('coverage-gap'), H, 'coverage_complete', setp('/reader/coverage/intervals', [[0, 2000]]), [pid(fam, 'coverage')],
             'one nonmatching source interval not covered')
    comp = fam + '/' + scope + '/history/compacted'
    if comp in BASES:
        negative(n('translation-unadmitted'), comp, 'translation_custody', setp('/reader/translation_ref', 'translation:unadmitted:9'),
                 [pid(fam, 'translation')])
    negative(n('access-revoked'), H, 'access', setp('/reader/grant_current', False), [pid(fam, 'access')])
    held = fam + '/' + scope + '/history/held'
    if held in BASES:
        negative(n('hold-without-grant'), held, 'access', setp('/reader/grant_current', False), [pid(fam, 'hold_visibility')],
                 'a hold keeps the record but never grants disclosure')
    negative(n('deleted-disclosed'), H, 'deleted_hidden', setp('/reader/source_deleted', True), [pid(fam, 'deleted')])

    def other_output(c):
        c['reader']['output'] = copy.deepcopy(c['reader']['output'])
        c['reader']['output']['context']['host_id'] = 'host.other'
    negative(n('final-output-substituted'), H, 'final_output', other_output, [pid(fam, 'final_output')])
    if k != 'autonomy':
        negative(n('family-checkpoint'), H, 'family_checkpoint_none', setp('/reader/family_checkpoint', {'revision': 1}))
    else:
        negative(n('reader-checkpoint-withdrawn'), H, 'auto_reader_checkpoint_current', setp('/reader/family_checkpoint/state', 'withdrawn'),
                 [pid(fam, 'checkpoint_retired_not_current')])
        negative(n('reader-checkpoint-behind'), H, 'auto_reader_checkpoint_covers',
                 setp('/reader/family_checkpoint/index_through_sequence_id', L.SEQ - 1), [pid(fam, 'projection_join')])
    for sink in list(W.READER_SINKS_COMMON) + list(W.READER_SINKS[k]):
        negative(n('reader-effect-' + sink), H, 'reader_effect_' + sink, setp('/reader/effects/' + sink, True), [pid(fam, 'replay_effect')])


def pack_negatives(fam, scope, n, setp):
    pack = fam + '/' + scope + '/append/pack-16385'
    inline = fam + '/' + scope + '/append/inline-16384'
    negative(n('inline-16385'), inline, 'inline_size', lambda c: (L.grow_to(c, W.INLINE_LIMIT + 1), resync(c)), [pid(fam, 'inline_size')])
    negative(n('pack-ref-other'), pack, 'pack_route', setp('/event/payload_ref', 'sp337:blake3:' + L.HEX('other-pack')),
             [pid(fam, 'pack_custody')])

    def flip_byte(c):
        raw = bytearray(bytes.fromhex(c['pack']['bytes_hex']))
        raw[-1] ^= 1
        c['pack']['bytes_hex'] = bytes(raw).hex()
    negative(n('pack-bytes-substituted'), pack, 'pack_bytes', flip_byte, [pid(fam, 'pack_custody')])

    def other_body(c):
        o = copy.deepcopy(c['event']['payload'])
        o['context']['host_id'] = 'host.other'
        saved = c['event']['payload']
        c['event']['payload'] = o
        L.to_pack(c)
        c['event']['payload'] = saved
        resync(c)
    negative(n('pack-body-other'), pack, 'pack_body', other_body, [pid(fam, 'pack_custody')])


def special_original(c, special):
    """Replace the retained original with a coherent other original whose sealed custody is the defect."""
    fam = c['family']
    o = c['storage']['event']
    subject = W.FAMILY_SPECS[fam][5]
    new_op = 'op.special.' + special
    if W.kind(fam) == 'prompt':
        for key, value in (('admission_id', 'adm.special.' + special), ('prompt_id', 'prm.special.' + special)):
            o['payload'][key] = value
            c['owner']['source'][key] = value
        o['payload']['owner_operation_id'] = W.operation_of(fam, o['payload'])
    else:
        o['payload'][subject] = new_op
        o['payload']['owner_operation_id'] = new_op
        c['owner']['source'][subject] = new_op
    key = W.key_recipe(o['scope_kind'], fam, o['payload']['context']['server_id'], o['payload']['owner_operation_id'])
    o['idempotency_key'] = key
    if W.kind(fam) == 'prompt':
        o['payload']['idempotency_key'] = key
        o['payload']['owner_operation_id'] = W.operation_of(fam, o['payload'])
    o['event_id'] = W.event_id_recipe(L.SID, c['storage']['custody']['recovery_epoch'], W.event_partition(o), fam, o['payload']['owner_operation_id'])
    L.sync_original(c)
    if c['path'] == 'retry':
        cand = copy.deepcopy(o)
        cand['observed_at_utc'], cand['persisted_at_utc'], cand['sequence_id'] = c['event']['observed_at_utc'], c['event']['persisted_at_utc'], c['event']['sequence_id']
        c['event'] = cand
    tag = (c['path'], fam, c['event']['scope_kind'], special)
    if tag in SPECIAL_SEALED:
        return
    SPECIAL_SEALED.add(tag)
    if special == 'other-original-receipt':
        seal(c, commitment=L.HEX('some-other-original-bytes'))
    elif special == 'ambiguous':
        seal(c)
        seal(c, force=True)
    elif special == 'no-admission':
        seal(c, admission=False)
    elif special == 'unknown-recipe':
        seal(c, recipe='w3f@0')


SPECIAL_SEALED = set()
CORRUPT_SEALED = set()


def corrupt_original(c, comp):
    """A sealed original Storage holds whose own content fails exactly one frozen-verifier component."""
    fam = c['family']
    o = c['storage']['event']
    held = c['storage']['custody']
    if c['path'] == 'retry' and comp in ('operation', 'event_identity', 'key'):
        return False         # these change the original's binding fields: a retry candidate cannot stay coherent and valid
    if comp == 'envelope':
        o['actor_ref'] = ''
    elif comp == 'payload':
        o['payload']['context']['host_id'] = ''
    elif comp == 'storage_times':
        o['observed_at_utc'] = '2026-11-05T10:15:30.456+00:00'
    elif comp == 'operation':
        o['payload']['owner_operation_id'] = 'op.mismatch'
    elif comp == 'event_identity':
        o['event_id'] = 'evt_w3f_' + L.HEX('forged-id')
    elif comp == 'key':
        o['idempotency_key'] = W.key_recipe(o['scope_kind'], fam, L.SERVER, 'op.unused.0003')
        if W.kind(fam) == 'prompt':
            o['payload']['idempotency_key'] = o['idempotency_key']
    if comp in ('envelope', 'payload', 'storage_times', 'operation', 'event_identity', 'key'):
        L.sync_original(c)
    if comp == 'full_value':
        held['full_value_sha256'] = L.HEX('wrong-full-value')
    elif comp == 'producer':
        held['producer_semantic_sha256'] = L.HEX('wrong-producer')
    elif comp == 'custody_event':
        held['event_id'] = 'evt_w3f_' + L.HEX('custody-other')
    if c['path'] == 'history':
        c['event'] = copy.deepcopy(o)
        c['reader']['output'] = copy.deepcopy(o['payload'])
    else:
        c['retry']['returned_receipt'] = copy.deepcopy(held['receipt'])
    tag = (c['path'], fam, o['scope_kind'], comp)
    if tag not in CORRUPT_SEALED:
        CORRUPT_SEALED.add(tag)
        if comp in ('envelope', 'payload', 'storage_times', 'operation', 'event_identity', 'key'):
            seal(c)


def forge_presented(c):
    p = c['event']['payload']
    fam, k = c['family'], W.kind(c['family'])
    if k == 'budget':
        p['policy_ref'] = 'policy:qmax:v4-raised'
    elif k == 'discovery':
        p['elapsed_ms'] = p['elapsed_ms'] + 1
    elif k == 'graph':
        p['source_approval_ref'] = p['source_approval_ref'] + '.forged'
    elif k == 'prompt':
        p['state_source_ref'] = p['state_source_ref'] + '.forged'
    else:
        p['decision_source_ref'] = p['decision_source_ref'] + '.forged'


def neg_family(fam, scope):
    k = W.kind(fam)
    A, H = fam + '/' + scope + '/append', fam + '/' + scope + '/history'
    n = lambda name: fam + '/' + scope + '/neg/' + name  # noqa: E731

    def setp(pointer, value, identity=False, operation=False, sync=True):
        def change(c):
            W.apply_change(c, pointer, 'set', value)
            if sync:
                resync(c, identity, operation)
        return change

    if k in ('budget', 'discovery'):
        # B4: fresh-append baseline has no independent result receipt and source_receipt_ref null.
        negative(n('source-receipt-unrelated'), A, 'source_receipt_independent', setp('/event/payload/source_receipt_ref', 'opaque:unrelated:receipt'),
                 [pid(fam, 'source_receipt_ref:no_independent_receipt')],
                 'B4: a well-formed non-null reference while no independent original result receipt exists; actual absence '
                 'evidence fixed, body/semantic/wire commitments refreshed; the event\'s own SP-286 custody unchanged')
        negative(n('source-receipt-self'), A, 'source_receipt_not_self',
                 lambda c: (c['event']['payload'].__setitem__('source_receipt_ref', W.self_receipt_ref(L.SID, c['event']['event_id'])), resync(c)),
                 [pid(fam, 'source_receipt_ref:self_reference')], 'B4: the event\'s own first-receipt custody is not an independent source receipt')
        negative(n('retry-source-receipt-unrelated'), fam + '/' + scope + '/retry', 'source_receipt_independent',
                 setp('/event/payload/source_receipt_ref', 'opaque:unrelated:receipt'), [pid(fam, 'source_receipt_ref:no_independent_receipt')],
                 'B4 on the retry candidate')
    if k == 'discovery':
        S = '/owner/source/'
        negative(n('outcome-other'), A, 'disc_outcome', setp(S + 'outcome', 'other_outcome'), [pid(fam, 'semantic_fact')])
        negative(n('request-id-other'), A, 'disc_request_id', setp('/event/payload/request_id', 'req.other'), [pid(fam, 'query_commitment')],
                 'the candidate names another request than the original authorized one')
        for f, src, val in [('consumer_id', 'consumer_id', 'consumer.other'),
                            ('permission_snapshot_id', 'permission_snapshot_id', 'perm.snap.other'),
                            ('approval_scope_key', 'approval_scope_key', 'scope.other'), ('redaction_profile', 'redaction_profile', 'redacted'),
                            ('budget_ms', 'budget_ms', 2500), ('elapsed_ms', 'elapsed_ms', 41), ('freshness_state', 'freshness_state', 'stale'),
                            ('fallback_state', 'fallback_state', 'index_cold'), ('error_code', 'error_code', 'timeout'),
                            ('policy_decision', 'policy_decision', 'redacted'), ('source_index_generation', 'index_generation', 13),
                            ('verification_receipt_ref', 'verifier_receipt_ref', 'verifier:receipt:other')]:
            plan = {'request_id': 'query_commitment', 'budget_ms': 'semantic_fact', 'elapsed_ms': 'semantic_fact'}.get(f, 'semantic_fact')
            negative(n('owner-' + f), A, 'disc_' + f, setp(S + src, val), [pid(fam, plan)])
        negative(n('query-text-other'), A, 'disc_query_commitment', setp(S + 'query_text', 'find secrets'), [pid(fam, 'query_commitment')])
        negative(n('visible-set-grew'), A, 'disc_visible_count', lambda c: c['owner']['source']['permitted_result_ids'].append('res.hidden1'),
                 [pid(fam, 'visible_count')])
        if BASES[A]['event']['payload']['selected_result_ids']:
            negative(n('selection-not-permitted'), A, 'disc_opaque_selection',
                     lambda c: c['owner']['source'].__setitem__('permitted_result_ids', ['res.a1', 'res.b9', 'res.a3']),
                     [pid(fam, 'opaque_selection')], 'the selected id belongs to a different request\'s results')
        else:
            negative(n('selection-not-permitted'), A, 'disc_opaque_selection', setp('/event/payload/selected_result_ids', ['res.zz9']),
                     [pid(fam, 'opaque_selection')])
        p = BASES[A]['event']['payload']
        if p['cache_versions'] is None:
            negative(n('cache-used-unreported'), A, 'disc_cache_presence', setp(S + 'cache_versions', {f: 'v.x' for f in W.CACHE_FIELDS}),
                     [pid(fam, 'cache_identity')])
        else:
            for f in W.CACHE_FIELDS:
                negative(n('cache-' + f), A, 'disc_cache_' + f, setp(S + 'cache_versions/' + f, 'v.other'), [pid(fam, 'cache_identity')])
        if p['ssh_trust'] is None:
            negative(n('ssh-unreported'), A, 'disc_ssh_presence', setp(S + 'ssh', {'host_identity_ref': 'h', 'current_trust_ref': 't'}),
                     [pid(fam, 'ssh_trust')])
        else:
            negative(n('ssh-host-identity'), A, 'disc_ssh_host_identity', setp(S + 'ssh/host_identity_ref', 'ssh:host:identity:other'), [pid(fam, 'ssh_trust')])
            negative(n('ssh-trust-changed'), A, 'disc_ssh_host_trust', setp(S + 'ssh/current_trust_ref', 'ssh:trust:build1:v5'), [pid(fam, 'ssh_trust')])
            negative(n('ssh-permission'), A, 'disc_ssh_permission', setp('/event/payload/ssh_trust/permission_snapshot_id', 'perm.snap.other'),
                     [pid(fam, 'ssh_trust')])
        if fam in W.NO_QUERY_FAMILIES:
            negative(n('index-query-after-refusal'), A, 'disc_no_index_query', setp('/effects/index_query', True), [pid(fam, 'semantic_fact')])
        if scope == 'application':
            negative(n('thread-unadmitted'), A, 'app_thread_admitted', setp(S + 'thread_admitted', False), [pid(fam, 'app_thread_root')])
            negative(n('root-unadmitted'), A, 'app_root_admitted', setp(S + 'root_admitted', False), [pid(fam, 'app_thread_root')])
    if k == 'budget':
        S = '/owner/source/'
        negative(n('no-attempt'), A, 'bud_typed_attempt', setp(S + 'attempted_admission', False), [pid(fam, 'typed_attempt')])
        for f, val, plan in [('workflow_kind', 'deep_plan', 'backend_join'), ('budget_run_id', 'wf.other.0002', 'run_counter'),
                             ('question_records_ref', 'qrec:plan:foreign', 'backend_join'), ('assistant_plan_id', 'ap.other', 'backend_join'),
                             ('strategy', 'thorough', 'backend_join')]:
            negative(n('owner-' + f), A, 'bud_' + f, setp(S + f, val), [pid(fam, plan)])
        negative(n('backend-foreign'), A, 'bud_backend_map', setp('/event/payload/backend', 'question_bank'), [pid(fam, 'backend_join')])
        for f, val in [('policy_ref', 'policy:qmax:v9'), ('base_limit', 6), ('grill_me_enabled', True), ('grill_me_extension', 4)]:
            negative(n('policy-' + f), A, 'bud_' + f, setp(S + 'policy/' + f, val), [pid(fam, 'effective_limit')])

        def eff_minus(c):
            c['event']['payload']['effective_limit'] -= 1
            resync(c)
        negative(n('effective-limit'), A, 'bud_effective_limit', eff_minus, [pid(fam, 'effective_limit')])

        def asked_plus(c):
            c['event']['payload']['questions_asked'] += 1
            resync(c)
        negative(n('charged-count'), A, 'bud_charged_count', asked_plus, [pid(fam, 'charged_count')])

        def participant(c):
            # A participant-local count used consistently in the candidate; the shared run charged set is fixed.
            c['event']['payload']['questions_asked'] = len(c['owner']['source']['charged_question_ids']) + 2
            resync(c)
        negative(n('participant-count'), A, 'bud_charged_count', participant, [pid(fam, 'run_counter')])

        def positive_remaining(c):
            c['owner']['source']['charged_question_ids'] = c['owner']['source']['charged_question_ids'][:-2]
            c['event']['payload']['questions_asked'] -= 2
            resync(c)
        negative(n('remaining-positive'), A, 'bud_remaining', positive_remaining, [pid(fam, 'remaining')],
                 'a coherent positive-remaining snapshot claiming exhaustion')
        negative(n('continuation-flipped'), A, 'bud_continuation', setp('/event/payload/continuation', 'await_grill_confirmation'),
                 [pid(fam, 'continuation')])
        for f, val, plan in [('question_items_added', 1, 'no_question'), ('counter_changed', True, 'run_counter'), ('run_failed', True, 'no_failure'),
                             ('grill_auto_confirmed', True, 'no_autoconfirm'), ('build_disabled_by_budget', True, 'no_budget_build_block')]:
            negative(n('effect-' + f), A, 'bud_no_' + f, setp('/effects/' + f, val), [pid(fam, plan)])
        crew = fam + '/' + scope + '/append/crew'
        for f, val, row in [('assistant_plan_id', 'ap.crew.1', 'bud_crew_plan_null'), ('strategy', 'standard', 'bud_crew_strategy_null')]:
            def coherent(c, f=f, val=val):
                c['owner']['source'][f] = val
                c['event']['payload'][f] = val
                resync(c)
            negative(n('crew-' + f), crew, row, coherent, [pid(fam, 'backend_join')])

        def crew_base(c):
            c['owner']['source']['policy']['base_limit'] = 2
            p = c['event']['payload']
            p['base_limit'] = 2
            p['effective_limit'] = 2 + p['grill_me_extension']
            c['owner']['source']['charged_question_ids'] = ['q.crew.' + str(i) for i in range(p['effective_limit'])]
            p['questions_asked'] = p['effective_limit']
            resync(c)
        negative(n('crew-base'), crew, 'bud_crew_base_zero', crew_base, [pid(fam, 'effective_limit')])

        def crew_grill(c):
            c['owner']['source']['policy']['grill_me_enabled'] = False
            p = c['event']['payload']
            p['grill_me_enabled'] = False
            p['effective_limit'] = 0
            p['continuation'] = 'synthesis'
            resync(c)
        negative(n('crew-grill-off'), crew, 'bud_crew_grill', crew_grill, [pid(fam, 'continuation')])
        negative(n('exhaustion-other'), A, 'operation_field', setp('/event/payload/owner_operation_id', 'exh.other', identity=True),
                 [pid(fam, 'operation_identity')])
    if k == 'graph':
        S = '/owner/source/'
        for f, src in [('run_id', 'run_id'), ('canonical_graph_ref', 'graph_ref'), ('graph_sha256', 'graph_sha256'),
                       ('source_approval_ref', 'approval_ref'), ('graph_commit_receipt_ref', 'commit_receipt_ref')]:
            negative(n('graph-' + f), A, 'graph_' + f, setp(S + src, L.HEX('other') if f == 'graph_sha256' else 'other.' + f),
                     [pid(fam, 'graph_source')])
        rp = fam + '/' + scope + '/append/replan'

        def wrap(c):
            c['owner']['source']['prior_generation'] = W.U32_MAX
            c['event']['payload']['previous_generation'] = W.U32_MAX
            c['event']['payload']['replan_generation'] = 0
            resync(c)
        negative(n('generation-wrap'), rp, 'graph_no_wrap', wrap, [pid(fam, 'generation')])
        negative(n('generation-skip'), rp, 'graph_generation_step', setp('/event/payload/replan_generation', 7), [pid(fam, 'generation')])
        negative(n('generation-initial-nonzero'), A, 'graph_generation_step', setp('/event/payload/replan_generation', 1), [pid(fam, 'generation')])
        negative(n('previous-generation'), rp, 'graph_previous_generation', setp('/event/payload/previous_generation', 3), [pid(fam, 'generation')])
        negative(n('previous-lock'), rp, 'graph_previous_lock', setp(S + 'prior_lock_event_id', 'evt_w3f_' + L.HEX('other-prior')),
                 [pid(fam, 'generation')])
        negative(n('two-digests'), A, 'graph_unique_digest',
                 setp(S + 'existing_locks', [{'run_id': 'run.0001', 'replan_generation': 0, 'graph_sha256': L.HEX('another-graph')}]),
                 [pid(fam, 'generation')])
        negative(n('stale-resume'), rp, 'graph_no_stale_resume', setp('/effects/stale_attempt_resumed', True), [pid(fam, 'stale_attempt')])
        negative(n('flatten'), A, 'graph_no_flatten', setp(S + 'post_lock_graph_valid', False), [pid(fam, 'no_flatten')])

        def app_scope(c):
            for key, value in (('scope_kind', 'application'), ('project_id', None), ('thread_id', 'thr.alpha')):
                c['owner'][key] = value
                c['event']['payload']['context'][key] = value
            c['event']['scope_kind'], c['event']['project_id'], c['event']['thread_id'] = 'application', None, 'thr.alpha'
            c['target']['scope_partition'] = 'app'
            resync(c, identity=True)
        negative(n('graph-application-scope'), A, 'payload_schema', app_scope, [pid(fam, 'scope_project_null')],
                 'a coherent application-scope graph lock: Project only (the payload schema fixes context.scope_kind project)')
    if k == 'prompt':
        S = '/owner/source/'
        for f, val in [('prompt_id', 'prm.other'), ('source_session_id', 'sess.other'), ('target_thread_id', 'thr.other'),
                       ('client_sequence', 18), ('submitted_at_ms', 1762337730124), ('state_source_ref', 'inbox:state:other'),
                       ('redacted_prompt_ref', 'redacted:other')]:
            negative(n('owner-' + f), A, 'prompt_' + f, setp(S + f, val), [pid(fam, 'thread_join' if 'thread' in f or 'session' in f else 'prompt_hash')])
        if BASES[A]['event']['payload']['admitted_at_ms'] is not None:
            negative(n('owner-admitted-at'), A, 'prompt_admitted_at_ms', setp(S + 'admitted_at_ms', 1762337730201), [pid(fam, 'lifecycle')])
        negative(n('thread-copy'), A, 'prompt_thread_copy', lambda c: (c['event']['payload'].__setitem__('thread_id', 'thr.other'), resync(c)),
                 [pid(fam, 'thread_join')])

        def owning_thread(c):
            for holder in (c['owner'], c['event']['payload']['context']):
                holder['thread_id'] = 'thr.beta'
            c['event']['thread_id'] = 'thr.beta'
            resync(c)
        negative(n('context-thread'), A, 'prompt_context_thread', owning_thread, [pid(fam, 'thread_join')],
                 'the owning chat thread differs from the inbox target thread')
        negative(n('prompt-text-other'), A, 'prompt_hash', setp(S + 'prompt_text', 'Please summarize\r\nthe last run\rthanks  ' + chr(0xe9) + chr(0x4e2d)),
                 [pid(fam, 'prompt_hash')], 'one extra space: every scalar other than CR/CRLF is preserved by the recipe')
        negative(n('recipe-caller-selected'), A, 'prompt_recipe', setp('/event/payload/normalization_recipe_ref', 'pm.other.normalize@2.0.0'),
                 [pid(fam, 'prompt_hash')])
        negative(n('predecessor-terminal'), A, 'prompt_predecessor', setp(S + 'predecessor_state', 'executing'), [pid(fam, 'lifecycle')])
        if fam in ('session_prompt.cancelled', 'session_prompt.expired'):
            negative(n('execution-bound'), A, 'prompt_execution_unbound', setp(S + 'execution_bound', True), [pid(fam, 'lifecycle')])
        if fam == 'session_prompt.expired':
            negative(n('expiry-default'), A, 'prompt_expiry_source', setp(S + 'expiry_source', None), [pid(fam, 'lifecycle')])
        if fam == 'session_prompt.rejected':
            negative(n('rejection-reason'), A, 'prompt_rejection_reason', setp(S + 'rejection_reason_code', 'quota_exceeded'), [pid(fam, 'lifecycle')])
        negative(n('execution-started'), A, 'prompt_no_execution', setp('/effects/execution_started', True), [pid(fam, 'no_execution')])
        negative(n('prompt-key-copy'), A, 'prompt_key_copy', setp('/event/payload/idempotency_key', 'w3f:other:6f70'), [pid(fam, 'idempotency')])
    if k == 'autonomy':
        S = '/owner/source/'
        for f, src, val in [('requested_mode', 'requested_mode', 'yolo'), ('effective_mode', 'effective_mode', 'yolo'),
                            ('mutation_class', 'classifier_output', 'network_read'), ('decision', 'decision', 'block'),
                            ('blocked_reason_code', 'blocked_reason_code', 'mode_read_only'), ('permission_snapshot_id', 'permission_snapshot_id', 'perm.other'),
                            ('ceiling_source_ref', 'ceiling_source_ref', 'ceiling:other'), ('decision_source_ref', 'decision_source_ref', 'decision:other')]:
            negative(n('owner-' + f), A, 'auto_' + f, setp(S + src, val), [pid(fam, 'classifier' if f == 'mutation_class' else 'source_identity')])
        negative(n('ceiling-read-only'), A, 'auto_ceiling', setp(S + 'ceiling', 'plan'), [pid(fam, 'ceiling')])

        def reason(value):
            def change(c):
                c['owner']['source']['blocked_reason_code'] = value
                c['event']['payload']['blocked_reason_code'] = value
                resync(c)
            return change
        negative(n('allow-with-reason'), A, 'payload_schema', reason('mode_read_only'), [pid(fam, 'reason_allow')],
                 'an allow candidate given a reason (the payload schema allOf refuses it; the owner copy moves with it)')
        negative(n('block-without-reason'), fam + '/' + scope + '/append/block', 'payload_schema', reason(None), [pid(fam, 'reason_refusal')])

        def readonly_allow(c):
            for holder, key in ((c['owner']['source'], 'effective_mode'), (c['event']['payload'], 'effective_mode')):
                holder[key] = 'plan'
            c['owner']['source']['ceiling'] = 'plan'
            resync(c)
        negative(n('read-only-allow'), A, 'auto_readonly', readonly_allow, [pid(fam, 'ceiling')])
        negative(n('attempt-join'), A, 'auto_attempt_join', setp('/event/payload/attempt_id', 'att.other'), [pid(fam, 'projection_join')])
        negative(n('run-join'), A, 'auto_run_join', setp('/event/payload/run_id', 'run.other'), [pid(fam, 'projection_join')])
        negative(n('created-at'), A, 'auto_created_at', setp('/event/payload/created_at_utc', '2026-11-05T10:15:31.000Z'), [pid(fam, 'timestamp')])
        negative(n('invocation-unresolved'), A, 'auto_invocation_link', setp(S + 'invocation_refs', []), [pid(fam, 'invocation_ref')])

        def swap(a, b):
            def change(c):
                o = c['autonomy']['order']
                i, j = o.index(a), o.index(b)
                o[i], o[j] = o[j], o[i]
            return change
        for a, b in [('parse', 'schema'), ('schema', 'ceiling'), ('ceiling', 'ceiling_receipt_synced'),
                     ('ceiling_receipt_synced', 'permissions'), ('permissions', 'filesafe')]:
            negative(n('order-' + a + '-' + b), A, 'auto_order_' + a + '_' + b, swap(a, b), [pid(fam, 'enforcement_order')])

        def early_dispatch(c):
            o = [s for s in c['autonomy']['order'] if s != 'dispatch']
            o.insert(o.index('ceiling_receipt_synced'), 'dispatch')
            c['autonomy']['order'] = o
        negative(n('dispatch-before-receipt'), A, 'auto_order_dispatch', early_dispatch, [pid(fam, 'enforcement_order')])
        for variant, row in (('block', 'auto_dispatch_block'), ('require_approval', 'auto_dispatch_require_approval'),
                             ('allow_permissions_refused', 'auto_dispatch_allow_permissions'),
                             ('allow_filesafe_refused', 'auto_dispatch_allow_filesafe')):
            base = fam + '/' + scope + '/append/' + variant
            negative(n('dispatch-after-' + variant), base, row, lambda c: c['autonomy']['order'].append('dispatch'),
                     [pid(fam, row.replace('auto_', ''))])


# ---------------------------------------------------------------------------------------------
# schema negatives from the plan's schema entries (closed, required, type, grammar, vocabulary)
# ---------------------------------------------------------------------------------------------
PLAN_SCHEMA = re.compile(r'^(?P<fam>[a-z_.]+):(?:payload:)?(?P<kind>closed|required|type|grammar|vocabulary|format):(?P<rest>.*)$')


def plan_path(rest, kind):
    """Plan schema entry path -> list of keys from the payload root ('*' for array items)."""
    rest = re.sub(r'\s*<[^>]*>', '', rest).strip().replace('[*]', '.*').replace('[]', '.*')
    if kind == 'required' and not rest.startswith('$'):
        field, parent = rest.split(':', 1)
        parent = re.sub(r'/(anyOf|oneOf|allOf)/\d+', '', parent.strip())
        keys = [] if parent == '$' else [k for k in parent[2:].split('.') if k]
        return keys + [field]
    rest = re.sub(r'/(anyOf|oneOf|allOf)/\d+', '', rest)
    return [k for k in rest[1:].split('.') if k]


WRONG_FORMS = [('string-boolean', 'false'), ('string-number', '0'), ('boolean', True), ('null', None), ('array', []), ('object', {})]


TEMPLATES = {
    'cache_versions': {'cache_schema_version': 'cache.v3', 'ranking_policy_version': 'rank.v2', 'policy_hash': 'ph.1',
                       'ignore_hash': 'ih.1', 'identity_hash': 'id.1'},
    'ssh_trust': {'host_identity_ref': 'ssh:host:identity:t', 'host_trust_ref': 'ssh:trust:t', 'permission_snapshot_id': 'perm.snap.9'},
}


def payload_target(c, keys, create=False):
    """The parent of the last key. With create, a present-null nested object or an empty list on the way gets a
    valid template first, so a schema defect inside it is the only defect (the template alone is schema-valid)."""
    node = c['event']['payload']
    for key in keys[:-1]:
        if key == '*':
            if type(node) is not list:
                return None
            if not node:
                if not create:
                    return None
                node.append('res.t1')
            node = node[0] if type(node[0]) is not str else node
            if type(node) is list:
                return node
        else:
            if type(node) is not dict or key not in node:
                return None
            if node.get(key) is None:
                if not (create and key in TEMPLATES):
                    return None
                node[key] = copy.deepcopy(TEMPLATES[key])
            node = node[key]
    if create and keys and keys[-1] == '*' and type(node) is list and not node:
        node.append('res.t1')
    return node


def schema_negatives(fam):
    plan = {g['guard_id']: g for f in load_plan()['families'] if f['event_type'] == fam for g in f['guards']}
    validator = W.payload_validator(fam)
    realized = {}
    for gid in plan:
        m = PLAN_SCHEMA.match(gid)
        if not m or 'checkpoint_schema' in gid:
            continue
        kind, keys = m.group('kind'), plan_path(m.group('rest'), m.group('kind'))
        bases = [fam + '/' + s + '/append' for s in W.FAMILY_SPECS[fam][3]]
        made = []
        for base in bases:
            probe = copy.deepcopy(BASES[base])
            if kind == 'closed':
                target = probe['event']['payload'] if not keys else payload_target(probe, keys + ['x'], create=True)
                if type(target) is dict:
                    made += make_schema_neg(fam, base, gid, kind, keys, 'unknown-member', lambda c, k=keys: add_member(c, k), validator)
            elif not keys:
                if kind == 'type':
                    # the payload root: EventRecord itself requires an object payload, so the envelope verdict refuses
                    for form, value in WRONG_FORMS:
                        made += make_schema_neg(fam, base, gid, kind, ['$'], form,
                                                lambda c, v=value: c['event'].__setitem__('payload', copy.deepcopy(v)), validator,
                                                row='envelope_schema' if type(value) is not dict else 'payload_schema')
            else:
                parent = payload_target(probe, keys, create=True)
                if type(parent) is not dict and not (keys and keys[-1] == '*' and type(parent) is list):
                    continue
                if type(parent) is dict and keys[-1] not in parent:
                    continue
                if kind == 'required':
                    made += make_schema_neg(fam, base, gid, kind, keys, 'deleted', lambda c, k=keys: del_field(c, k), validator)
                elif kind == 'type':
                    for form, value in WRONG_FORMS:
                        made += make_schema_neg(fam, base, gid, kind, keys, form, lambda c, k=keys, v=value: set_field(c, k, copy.deepcopy(v)), validator)
                elif kind == 'vocabulary':
                    made += make_schema_neg(fam, base, gid, kind, keys, 'not-member', lambda c, k=keys: set_field(c, k, 'not_a_member'), validator)
                elif kind in ('grammar', 'format'):
                    current = get_field(probe, keys)
                    if current is None:
                        current = 'ref.x'      # a nullable field: its string branch's grammar
                    if type(current) is not str:
                        continue
                    for form, value in [('trailing-lf', current + '\n'), ('empty', ''), ('control', current[:-1] + '\u0000' if current else '\u0000'),
                                        ('upper', current.upper()), ('leading-dot', '.' + current), ('too-long', current + 'x' * 5000)]:
                        made += make_schema_neg(fam, base, gid, kind, keys, form, lambda c, k=keys, v=value: set_field(c, k, v), validator)
            if made:
                break
        realized[gid] = made
    return realized


def get_field(c, keys):
    parent = payload_target(c, keys, create=True)
    return parent[0] if keys[-1] == '*' else parent[keys[-1]]


def set_field(c, keys, value):
    parent = payload_target(c, keys, create=True)
    if keys[-1] == '*':
        parent[0] = value
    else:
        parent[keys[-1]] = value


def del_field(c, keys):
    parent = payload_target(c, keys, create=True)
    del parent[keys[-1]]


def add_member(c, keys):
    target = c['event']['payload'] if not keys else payload_target(c, keys + ['x'], create=True)
    target['unknown_member'] = 'x'


def add_plan(nid, gid):
    """Several plan entries can name the same schema site (an anyOf branch annotation): one negative, every entry."""
    for x in NEGATIVES:
        if x['id'] == nid:
            if gid not in x['plan']:
                x['plan'] = sorted(set(x['plan']) | {gid})
            return True
    return False


def make_schema_neg(fam, base, gid, kind, keys, form, mutate_fn, validator, row='payload_schema'):
    probe = copy.deepcopy(BASES[base])
    try:
        mutate_fn(probe)
    except (KeyError, IndexError, TypeError):
        return []
    if row == 'payload_schema' and validator.is_valid(probe['event']['payload']):
        return []          # this form is legal for the field (for example null on a nullable field)
    nid = base.replace('/append', '/neg/schema/' + kind + '/' + '.'.join(keys or ['$']) + '/' + form)
    if add_plan(nid, gid):
        return [nid]

    def change(c):
        mutate_fn(c)
        resync(c)
    negative(nid, base, row, change, [gid])
    return [nid]


@__import__('functools').lru_cache(maxsize=None)
def PLAN_IDS():
    return frozenset(g['guard_id'] for f in load_plan()['families'] for g in f['guards'])


@__import__('functools').lru_cache(maxsize=None)
def load_plan():
    return json.loads((ROOT / 'Plans' / 'w3f_event_oracle_plan.json').read_text())


def number_negatives(fam):
    """Integral float spellings at every payload integer slot (1.0 / 1e0 parse to one float)."""
    base = fam + '/' + W.FAMILY_SPECS[fam][3][0] + '/append'
    p = BASES[base]['event']['payload']
    slots = {'discovery': ['budget_ms', 'elapsed_ms', 'candidate_count', 'source_index_generation'],
             'budget': ['base_limit', 'grill_me_extension', 'effective_limit', 'questions_asked', 'questions_remaining'],
             'graph': ['replan_generation'], 'prompt': ['client_sequence', 'submitted_at_ms'], 'autonomy': []}[W.kind(fam)]
    for slot in slots:
        if type(p.get(slot)) is int:
            negative(base.replace('/append', '/neg/numbers/' + slot + '-float'), base, 'payload_numbers',
                     lambda c, s=slot: (c['event']['payload'].__setitem__(s, float(c['event']['payload'][s])), resync(c)),
                     [fam + ':numbers'] + ([fam + ':payload:number_domain:$.' + slot] if fam + ':payload:number_domain:$.' + slot in PLAN_IDS() else []))


CK_FAM = 'autonomy.ceiling_checked'
T = {'a': '2026-10-01T00:00:00Z', 'b': '2026-10-10T00:00:00Z', 'c': '2026-10-20T00:00:00Z', 'd': '2026-11-01T00:00:00Z',
     'now': '2026-11-05T10:15:30Z', 'w': '2026-11-02T08:00:00Z'}


def ck_core(scope, pub, revision, state, published, retired, holds, through=L.SEQ, token=None):
    owner_partition = W.partition(scope, L.PROJECT if scope == 'project' else None)
    return {'schema_id': 'pm.storage_value.autonomy_ceiling_checkpoint.v1', 'schema_version': '1.0.0', 'storage_instance_id': L.SID,
            'scope_partition': owner_partition, 'projector_id': 'projector.autonomy.ceiling_checked', 'projector_version': '1.0.0',
            'event_type': CK_FAM, 'revision': revision, 'index_read_token': token or L.token(),
            'source_cursor': {'segment_generation': 3, 'segment_name': 'seg-000003-00000000000000000001.active', 'byte_offset': 81920,
                              'frame_end_offset': 90112, 'last_sequence_id': through, 'last_event_id': 'evt_w3f_' + L.HEX('last-' + str(through))},
            'index_through_sequence_id': through, 'state': state, 'publication_id': pub, 'published_at_utc': published,
            'retired_at_utc': retired, 'hold_refs': list(holds)}


def ck_root(core, history):
    return dict(core, retired_generations=history)


def ck_entry(core, successor):
    return {'checkpoint': core, 'successor_publication_id': successor}


def ck_events(scope, through):
    """Two admitted ceiling checks of one attempt in the scanned range (never collapsed to one latest)."""
    out = []
    for i, seq in enumerate((through - 1, through)):
        out.append({'event_id': 'evt_w3f_' + L.HEX('ck-event-' + str(seq)), 'attempt_id': 'att.0001', 'sequence_id': seq,
                    'producer_semantic_digest': L.HEX('ck-digest-' + str(seq))})
    return out


def ck_rows(scope, events, key):
    part = W.partition(scope, L.PROJECT if scope == 'project' else None)
    return [{'key': 'autonomy_ceiling_projection.v1:' + part + ':' + e['attempt_id'] + ':' + e['event_id'],
             'value': {'schema_id': 'pm.storage_value.autonomy_ceiling_projection.v1', 'schema_version': '1.0.0', 'storage_instance_id': L.SID,
                       'scope_partition': part, 'attempt_id': e['attempt_id'], 'event_id': e['event_id'], 'sequence_id': e['sequence_id'],
                       'producer_semantic_digest': e['producer_semantic_digest'], 'checkpoint_ref': key}} for e in events]


def ck_history(scope):
    """Two retained cores: pub.b (retired at pub.c's birth, successor pub.c) and pub.a (retired at pub.b's birth)."""
    b = ck_core(scope, 'pub.b', 9, 'withdrawn', T['b'], T['c'], ['hold:legal:b'])
    a = ck_core(scope, 'pub.a', 4, 'withdrawn', T['a'], T['b'], [])
    return [ck_entry(b, 'pub.c'), ck_entry(a, 'pub.b')]


def ck_scenario(scope, op):
    owner = L.new_owner(CK_FAM, scope)
    key = 'autonomy_ceiling_checkpoint.v1:' + L.SID + ':' + W.partition(scope, owner['project_id'])
    newer = dict(L.token(), frontier_revision=101, frontier_sha256=L.HEX('frontier-101'))
    stored = ck_root(ck_core(scope, 'pub.c', 12, 'current', T['c'], None, ['hold:legal:c']), ck_history(scope)[:1])
    handoffs = {'pub.b': 'pub.c', 'pub.a': 'pub.b'}
    coord = {'operation_id': None, 'admitted': False, 'publication_id': None, 'publication_time': None, 'terminal_time': None,
             'handoffs': handoffs}
    events, nxt, cleanup, read = [], None, [], None
    commit = {'rows': True, 'root': True, 'history': True, 'cleanup': True}
    if op == 'advance':
        events = ck_events(scope, L.SEQ + 2)
        nxt = copy.deepcopy(stored)
        nxt.update(revision=13, index_read_token=newer, index_through_sequence_id=L.SEQ + 2)
        nxt['source_cursor'] = dict(nxt['source_cursor'], last_sequence_id=L.SEQ + 2, last_event_id=events[-1]['event_id'])
    elif op in ('withdraw', 'withdraw_again'):
        if op == 'withdraw_again':
            stored = ck_root(dict(core_of(stored), state='withdrawn', retired_at_utc=T['d']), stored['retired_generations'])
        coord.update(terminal_time=T['w'] if op == 'withdraw' else '2026-11-04T00:00:00Z')
        nxt = copy.deepcopy(stored)
        nxt.update(revision=13, state='withdrawn', retired_at_utc=T['w'] if op == 'withdraw' else T['d'])
        op = 'withdraw'
    elif op in ('successor', 'successor_withdrawn', 'successor_cleanup'):
        if op == 'successor_withdrawn':
            stored = ck_root(dict(core_of(stored), state='withdrawn', retired_at_utc=T['d']), stored['retired_generations'])
        if op == 'successor_cleanup':
            stored = ck_root(core_of(stored), ck_history(scope))
            cleanup = ['pub.a']
        handoffs['pub.c'] = 'pub.d'
        coord.update(operation_id='coord.rebuild.7', admitted=True, publication_id='pub.d', publication_time=T['now'])
        events = ck_events(scope, L.SEQ + 2)
        new = ck_core(scope, 'pub.d', 13, 'current', T['now'], None, ['hold:legal:c'], L.SEQ + 2, newer)
        new['source_cursor']['last_event_id'] = events[-1]['event_id']
        arch = archived_core(stored, T['now'])
        carried = [e for e in stored['retired_generations'] if e['checkpoint']['publication_id'] not in cleanup]
        nxt = ck_root(new, [ck_entry(arch, 'pub.d')] + carried)
        op = 'successor'
    elif op == 'cleanup':
        stored = ck_root(core_of(stored), ck_history(scope))
        cleanup = ['pub.a']
        nxt = ck_root(dict(core_of(stored), revision=13), ck_history(scope)[:1])
    elif op == 'initial':
        coord.update(operation_id='coord.initial.1', admitted=True, publication_id='pub.c', publication_time=T['c'], handoffs={})
        events = ck_events(scope, L.SEQ)
        nxt = ck_root(ck_core(scope, 'pub.c', 0, 'current', T['c'], None, []), [])
        nxt['index_read_token'] = L.token()
        nxt['source_cursor']['last_event_id'] = events[-1]['event_id']
        stored = None
    elif op == 'read':
        nxt = copy.deepcopy(stored)
        read = {'authority_publication_id': 'pub.c'}
        commit = {'rows': False, 'root': False, 'history': False, 'cleanup': False}
    elif op == 'retry':
        nxt = copy.deepcopy(stored)
        commit = {'rows': False, 'root': False, 'history': False, 'cleanup': False}
    rows = ck_rows(scope, events, key)
    return {'family': CK_FAM, 'path': 'checkpoint', 'owner': owner,
            'checkpoint': {'op': op, 'key': key, 'now_utc': T['now'],
                           'stored': None if stored is None else {'revision': stored['revision'], 'root': stored},
                           'expected': None if stored is None else {'revision': stored['revision'], 'root': copy.deepcopy(stored)},
                           'next': nxt, 'rows': rows, 'events': events,
                           'source': {'token': newer if op in ('advance', 'successor') else L.token(),
                                      'through_sequence_id': L.SEQ + 2 if op in ('advance', 'successor') else L.SEQ},
                           'coordinator': coord, 'holds': {'hold:legal:b': {'resolved': True, 'active': True},
                                                           'hold:legal:c': {'resolved': True, 'active': True}},
                           'dynamic_holds': [], 'refs': [], 'fence': {'captured': 5, 'actual': 5}, 'cleanup': cleanup,
                           'commit': commit, 'staging_keys': [], 'read': read}}


def core_of(root):
    return {k: v for k, v in root.items() if k != 'retired_generations'}


def archived_core(stored, new_birth):
    core = core_of(stored)
    return dict(core, state='withdrawn', retired_at_utc=stored['retired_at_utc'] if stored['state'] == 'withdrawn' else new_birth)


def build_checkpoints():
    fam = CK_FAM
    ops = ['advance', 'withdraw', 'withdraw_again', 'successor', 'successor_withdrawn', 'successor_cleanup', 'cleanup', 'initial',
           'read', 'retry']
    plans = {'advance': ['projection_join', 'cas', 'atomic_advance', 'token_durable', 'checkpoint_family_generation',
                         'checkpoint_birth_preserved', 'checkpoint_publication_id_preserved', 'checkpoint_history_preserved',
                         'checkpoint_holds_preserved'],
             'withdraw': ['checkpoint_first_retirement'], 'withdraw_again': ['checkpoint_withdrawal_anchor_preserved'],
             'successor': ['checkpoint_publication_custody', 'checkpoint_archive_exact', 'checkpoint_history_successor',
                           'checkpoint_replacement_atomic'],
             'successor_withdrawn': ['checkpoint_archive_exact'], 'successor_cleanup': ['checkpoint_cleanup_age', 'checkpoint_generation_cap'],
             'cleanup': ['checkpoint_cleanup_current'], 'initial': ['checkpoint_publication_custody'], 'read': ['checkpoint_retired_not_current'],
             'retry': ['checkpoint_settled_retry']}
    for scope in ('application', 'project'):
        for op in ops:
            positive(fam + '/' + scope + '/checkpoint/' + op, ck_scenario(scope, op), [pid(fam, x) for x in plans[op]])
    scope = 'project'
    b = lambda op: fam + '/' + scope + '/checkpoint/' + op  # noqa: E731
    n = lambda name: fam + '/' + scope + '/neg/checkpoint/' + name  # noqa: E731

    def setp(pointer, value):
        return lambda c: W.apply_change(c, pointer, 'set', value)
    N = '/checkpoint/next/'
    negative(n('schema-fourth-generation'), b('successor_cleanup'), 'ck_next_schema',
             lambda c: (c['checkpoint'].__setitem__('cleanup', []),
                        c['checkpoint']['next']['retired_generations'].append(copy.deepcopy(c['checkpoint']['stored']['root']['retired_generations'][-1]))),
             [pid(fam, 'checkpoint_generation_cap'), pid(fam, 'checkpoint_schema:max_items:$.retired_generations')],
             'a fourth generation (root plus three retained cores)')
    negative(n('schema-duplicate-hold-ref'), b('advance'), 'ck_next_schema', setp(N + 'hold_refs', ['hold:legal:c', 'hold:legal:c']),
             [pid(fam, 'checkpoint_schema:unique:$.hold_refs')])
    negative(n('schema-duplicate-core-hold-ref'), b('successor'), 'ck_next_schema',
             setp(N + 'retired_generations/0/checkpoint/hold_refs', ['hold:legal:c', 'hold:legal:c']),
             [pid(fam, 'checkpoint_schema:unique:$.retired_generations[*].checkpoint.hold_refs')])
    negative(n('schema-nested-history'), b('successor'), 'ck_next_schema',
             lambda c: c['checkpoint']['next']['retired_generations'][0]['checkpoint'].__setitem__('retired_generations', []),
             [pid(fam, 'checkpoint_archive_nesting')])
    negative(n('schema-snapshot-persisted'), b('advance'), 'ck_next_schema', setp(N + 'index_read_token/redb_snapshot_id', 'redb.snap.9'),
             [pid(fam, 'token_durable')])
    negative(n('schema-withdrawn-without-retirement'), b('withdraw'), 'ck_next_schema', setp(N + 'retired_at_utc', None),
             [pid(fam, 'checkpoint_first_retirement')])
    negative(n('numbers-revision-float'), b('advance'), 'ck_next_numbers', setp(N + 'revision', 13.0), [pid(fam, 'numbers')])
    negative(n('fullmatch-generation-lf'), b('advance'), 'ck_next_fullmatch', lambda c: (
        c['checkpoint']['next']['index_read_token'].__setitem__('generation_id', c['checkpoint']['next']['index_read_token']['generation_id'] + '\n'),
        c['checkpoint']['source']['token'].__setitem__('generation_id', c['checkpoint']['next']['index_read_token']['generation_id'])),
        [pid(fam, 'token_durable')], 'the stored copy of generation_id with a trailing LF (S2)')
    negative(n('fullmatch-segment-lf'), b('advance'), 'ck_next_fullmatch', setp(N + 'source_cursor/segment_name', 'seg-000003-00000000000000000001.active\n'),
             [pid(fam, 'numbers')])
    negative(n('utc-root-offset'), b('advance'), 'ck_utc_root', setp(N + 'published_at_utc', '2026-10-20T00:00:00+00:00'),
             [pid(fam, 'timestamp')])
    negative(n('utc-history-lower-z'), b('advance'), 'ck_utc_history', lambda c: [
        x['checkpoint'].__setitem__('published_at_utc', '2026-10-10t00:00:00z') for x in c['checkpoint']['next']['retired_generations']
        + c['checkpoint']['stored']['root']['retired_generations'] + c['checkpoint']['expected']['root']['retired_generations']],
        [pid(fam, 'timestamp')])
    negative(n('rows-schema'), b('advance'), 'ck_rows_schema', lambda c: c['checkpoint']['rows'][0]['value'].__setitem__('sequence_id', -1),
             [pid(fam, 'projection_join')])

    def oversize(c):
        big = ['hold:legal:' + ('x' * 2000) + str(i) for i in range(9)]
        for root in (c['checkpoint']['stored']['root'], c['checkpoint']['expected']['root'], c['checkpoint']['next']):
            root['hold_refs'] = list(big)
        for h in big:
            c['checkpoint']['holds'][h] = {'resolved': True, 'active': True}
    negative(n('root-oversize'), b('advance'), 'ck_root_size', oversize, [pid(fam, 'value_size'), pid(fam, 'checkpoint_full_value_size_history')],
             'genuine hold refs grow the complete root past 16384 bytes; each field and the slot count stay valid')
    negative(n('key-raw-project'), b('advance'), 'ck_key', setp('/checkpoint/key', 'autonomy_ceiling_checkpoint.v1:' + L.SID + ':proj.alpha'),
             [pid(fam, 'projection_join')])
    negative(n('storage-other'), b('advance'), 'ck_storage', setp(N + 'storage_instance_id', L.OTHER_SID), [pid(fam, 'projection_join')])
    negative(n('partition-other'), b('advance'), 'ck_partition', setp(N + 'scope_partition', 'app'), [pid(fam, 'projection_join')])
    def carried(field, value):
        def change(c):
            for core in (c['checkpoint']['next']['retired_generations'][1]['checkpoint'],
                         c['checkpoint']['stored']['root']['retired_generations'][0]['checkpoint'],
                         c['checkpoint']['expected']['root']['retired_generations'][0]['checkpoint']):
                core[field] = value
        return change
    negative(n('history-foreign-store'), b('successor'), 'ck_history_storage', carried('storage_instance_id', L.OTHER_SID),
             [pid(fam, 'checkpoint_history_identity')], 'a coherent foreign owner core retained in history and carried unchanged')
    negative(n('history-foreign-partition'), b('successor'), 'ck_history_partition', carried('scope_partition', 'app'),
             [pid(fam, 'checkpoint_history_identity')])
    negative(n('ids-not-unique'), b('cleanup'), 'ck_unique_ids', lambda c: (
        c['checkpoint']['next']['retired_generations'][0]['checkpoint'].__setitem__('publication_id', 'pub.c'),
        c['checkpoint']['coordinator']['handoffs'].__setitem__('pub.c', 'pub.c'),
        c['checkpoint']['stored']['root']['retired_generations'][0]['checkpoint'].__setitem__('publication_id', 'pub.c'),
        c['checkpoint']['expected']['root']['retired_generations'][0]['checkpoint'].__setitem__('publication_id', 'pub.c')),
        [pid(fam, 'checkpoint_history_successor')], 'a retained core reusing the root publication id (self link)')
    negative(n('rows-collapsed'), b('advance'), 'ck_rows_cover', lambda c: c['checkpoint'].__setitem__('rows', c['checkpoint']['rows'][1:]),
             [pid(fam, 'projection_join')], 'two checks of one attempt collapsed to one latest row')
    for f, val in [('attempt_id', 'att.other'), ('sequence_id', 1), ('producer_semantic_digest', L.HEX('other'))]:
        rid = 'ck_row_' + (f.split('_')[0] if f != 'producer_semantic_digest' else 'digest')
        negative(n('row-' + f), b('advance'), rid, lambda c, f=f, v=val: (
            c['checkpoint']['rows'][0]['value'].__setitem__(f, v),
            c['checkpoint']['rows'][0].__setitem__('key', 'autonomy_ceiling_projection.v1:' + c['checkpoint']['rows'][0]['value']['scope_partition'] + ':' +
                                                   c['checkpoint']['rows'][0]['value']['attempt_id'] + ':' + c['checkpoint']['rows'][0]['value']['event_id'])),
            [pid(fam, 'projection_join')])
    negative(n('row-storage'), b('advance'), 'ck_row_storage', setp('/checkpoint/rows/0/value/storage_instance_id', L.OTHER_SID), [pid(fam, 'projection_join')])

    def row_partition(c):
        r = c['checkpoint']['rows'][0]
        r['value']['scope_partition'] = 'app'
        r['key'] = 'autonomy_ceiling_projection.v1:app:' + r['value']['attempt_id'] + ':' + r['value']['event_id']
    negative(n('row-partition'), b('advance'), 'ck_row_partition', row_partition, [pid(fam, 'projection_join')])
    negative(n('row-ref'), b('advance'), 'ck_row_ref', setp('/checkpoint/rows/0/value/checkpoint_ref', 'event_record_index_checkpoint.v1:' + L.SID),
             [pid(fam, 'projection_join')])
    negative(n('row-key'), b('advance'), 'ck_row_key', setp('/checkpoint/rows/0/key', 'autonomy_ceiling_projection.v1:latest'), [pid(fam, 'projection_join')])
    negative(n('cas-revision'), b('advance'), 'ck_cas_revision', lambda c: (c['checkpoint']['stored'].__setitem__('revision', 13),
                                                                             c['checkpoint']['stored']['root'].__setitem__('revision', 13)),
             [pid(fam, 'cas')], 'the actual stored revision moved after preflight (the stored bytes moved with it)')

    def same_revision_other_bytes(c):
        root = c['checkpoint']['stored']['root']
        root['hold_refs'] = ['hold:legal:c', 'hold:investigation:2']
        c['checkpoint']['holds']['hold:investigation:2'] = {'resolved': True, 'active': True}
        c['checkpoint']['next']['hold_refs'] = list(root['hold_refs'])
    negative(n('cas-full-preimage'), b('advance'), 'ck_cas_preimage', same_revision_other_bytes, [pid(fam, 'cas_full_preimage')],
             'same revision, another internally valid hold set; the candidate derives from the actual prior')
    negative(n('revision-skip'), b('advance'), 'ck_revision_step', setp(N + 'revision', 14), [pid(fam, 'cas')])
    for comp in ('rows', 'root', 'history', 'cleanup'):
        negative(n('partial-commit-' + comp), b('successor'), 'ck_atomic', setp('/checkpoint/commit/' + comp, False),
                 [pid(fam, 'atomic_advance'), pid(fam, 'checkpoint_replacement_atomic')])
    negative(n('token-stale'), b('advance'), 'ck_token_current', setp(N + 'index_read_token', L.token()), [pid(fam, 'token_durable')])
    negative(n('through-stale'), b('advance'), 'ck_through', setp(N + 'index_through_sequence_id', L.SEQ + 1), [pid(fam, 'projection_join')])
    negative(n('staging-alias'), b('successor'), 'ck_no_staging', setp('/checkpoint/staging_keys', ['autonomy_ceiling_checkpoint.v1.staging:' + L.SID]),
             [pid(fam, 'checkpoint_slot_unavailable')])
    negative(n('coordinator-unadmitted'), b('successor'), 'ck_coordinator_admitted', setp('/checkpoint/coordinator/admitted', False),
             [pid(fam, 'checkpoint_publication_custody')])
    negative(n('publication-not-allocated'), b('initial'), 'ck_publication_from_coordinator', setp('/checkpoint/coordinator/publication_id', 'pub.other'),
             [pid(fam, 'checkpoint_publication_custody')])
    negative(n('birth-not-storage'), b('initial'), 'ck_birth_from_storage', setp('/checkpoint/coordinator/publication_time', T['b']),
             [pid(fam, 'checkpoint_publication_custody')])
    negative(n('advance-new-publication'), b('advance'), 'ck_preserve_publication_id', setp(N + 'publication_id', 'pub.cursor.13'),
             [pid(fam, 'checkpoint_family_generation'), pid(fam, 'checkpoint_publication_id_preserved')])
    negative(n('advance-birth'), b('advance'), 'ck_preserve_published_at_utc', setp(N + 'published_at_utc', '2026-10-25T00:00:00Z'),
             [pid(fam, 'checkpoint_birth_preserved')], 'another valid time before the observation, after the predecessor retirement')
    negative(n('advance-hold-dropped'), b('advance'), 'ck_preserve_hold_refs', setp(N + 'hold_refs', []), [pid(fam, 'checkpoint_holds_preserved')])
    negative(n('advance-history-changed'), b('advance'), 'ck_preserve_retired_generations',
             setp(N + 'retired_generations/0/checkpoint/index_through_sequence_id', L.SEQ - 3), [pid(fam, 'checkpoint_history_preserved')])
    negative(n('withdrawn-refresh-current'), b('withdraw_again'), 'ck_preserve_state', lambda c: (
        c['checkpoint'].__setitem__('op', 'advance'), c['checkpoint']['next'].update(state='current', retired_at_utc=None)),
        [pid(fam, 'checkpoint_withdrawn_refresh')], 'the same withdrawn publication proposes to resume as current without a new coordinator admission')
    negative(n('withdraw-left-current'), b('withdraw'), 'ck_withdraw_state', lambda c: c['checkpoint']['next'].update(state='rebuilding', retired_at_utc=None),
             [pid(fam, 'checkpoint_first_retirement')])
    negative(n('first-retirement-time'), b('withdraw'), 'ck_first_retirement', setp(N + 'retired_at_utc', '2026-11-03T00:00:00Z'),
             [pid(fam, 'checkpoint_first_retirement')])
    negative(n('retirement-reset'), b('withdraw_again'), 'ck_withdrawal_anchor', setp(N + 'retired_at_utc', '2026-11-04T00:00:00Z'),
             [pid(fam, 'checkpoint_withdrawal_anchor_preserved')])
    negative(n('future-birth'), b('initial'), 'ck_no_future_birth', lambda c: (c['checkpoint']['coordinator'].__setitem__('publication_time', '2026-11-06T00:00:00Z'),
                                                                               c['checkpoint']['next'].__setitem__('published_at_utc', '2026-11-06T00:00:00Z')),
             [pid(fam, 'checkpoint_no_future_birth')])
    negative(n('archive-field'), b('successor'), 'ck_archive_exact', setp(N + 'retired_generations/0/checkpoint/index_through_sequence_id', L.SEQ - 1),
             [pid(fam, 'checkpoint_archive_exact')])
    negative(n('archive-retirement'), b('successor_withdrawn'), 'ck_archive_exact', setp(N + 'retired_generations/0/checkpoint/retired_at_utc', T['now']),
             [pid(fam, 'checkpoint_archive_exact')], 'an already-withdrawn core re-retired at the new birth')
    negative(n('carry-changed'), b('successor'), 'ck_archive_carry', setp(N + 'retired_generations/1/checkpoint/hold_refs', []),
             [pid(fam, 'checkpoint_history_preserved')])
    negative(n('cleanup-not-prefix-history'), b('cleanup'), 'ck_cleanup_history', setp(N + 'retired_generations/0/checkpoint/hold_refs', []),
             [pid(fam, 'checkpoint_history_preserved')])
    for variant, value in [('self', 'pub.c'), ('older', 'pub.a'), ('absent', 'pub.never'), ('newer-nonadjacent', 'pub.e')]:
        negative(n('successor-link-' + variant), b('successor'), 'ck_successor_links', setp(N + 'retired_generations/0/successor_publication_id', value),
                 [pid(fam, 'checkpoint_history_successor')], 'the new handoff edge differs from the committed coordinator handoff')

    def birth_after_retirement(c):
        for root in (c['checkpoint']['next'],):
            root['retired_generations'][1]['checkpoint']['retired_at_utc'] = '2026-10-09T00:00:00Z'
        c['checkpoint']['stored']['root']['retired_generations'][0]['checkpoint']['retired_at_utc'] = '2026-10-09T00:00:00Z'
        c['checkpoint']['expected']['root']['retired_generations'][0]['checkpoint']['retired_at_utc'] = '2026-10-09T00:00:00Z'
        for core in (c['checkpoint']['next']['retired_generations'][1]['checkpoint'],
                     c['checkpoint']['stored']['root']['retired_generations'][0]['checkpoint'],
                     c['checkpoint']['expected']['root']['retired_generations'][0]['checkpoint']):
            core['published_at_utc'] = '2026-10-09T12:00:00Z'
    negative(n('birth-after-retirement'), b('successor'), 'ck_birth_before_retirement', birth_after_retirement,
             [pid(fam, 'checkpoint_birth_before_retirement')])

    def retire_after_successor(c):
        for core in (c['checkpoint']['next']['retired_generations'][1]['checkpoint'],
                     c['checkpoint']['stored']['root']['retired_generations'][0]['checkpoint'],
                     c['checkpoint']['expected']['root']['retired_generations'][0]['checkpoint']):
            core['retired_at_utc'] = '2026-10-21T00:00:00Z'
    negative(n('retirement-after-successor-birth'), b('successor'), 'ck_retirement_before_successor', retire_after_successor,
             [pid(fam, 'checkpoint_retirement_before_successor')])
    negative(n('read-retired-core'), b('read'), 'ck_read_current', setp('/checkpoint/read/authority_publication_id', 'pub.b'),
             [pid(fam, 'checkpoint_retired_not_current')])
    negative(n('settled-second-publication'), b('retry'), 'ck_settled_unchanged', lambda c: (
        c['checkpoint']['next'].update(revision=13, publication_id='pub.e'), c['checkpoint']['commit'].update(rows=True, root=True, history=True, cleanup=True)),
        [pid(fam, 'checkpoint_settled_retry')])
    negative(n('cleanup-selected-root'), b('successor_cleanup'), 'ck_cleanup_not_current', setp('/checkpoint/cleanup', ['pub.a', 'pub.c']),
             [pid(fam, 'checkpoint_cleanup_current')])
    negative(n('cleanup-not-oldest'), b('cleanup'), 'ck_cleanup_oldest', lambda c: (
        c['checkpoint'].__setitem__('cleanup', ['pub.b']),
        c['checkpoint']['next'].__setitem__('retired_generations', [c['checkpoint']['stored']['root']['retired_generations'][1]]),
        c['checkpoint']['holds'].__setitem__('hold:legal:b', {'resolved': True, 'active': False}),
        c['checkpoint'].__setitem__('now_utc', '2026-11-05T10:15:30Z')), [pid(fam, 'checkpoint_cleanup_age')])

    def hold_cleaned(c, resolved, active):
        for root in (c['checkpoint']['stored']['root'], c['checkpoint']['expected']['root']):
            root['retired_generations'][1]['checkpoint']['hold_refs'] = ['hold:legal:a']
        c['checkpoint']['holds']['hold:legal:a'] = {'resolved': resolved, 'active': active}
    negative(n('cleanup-frozen-unresolved'), b('cleanup'), 'ck_cleanup_frozen_resolved', lambda c: hold_cleaned(c, False, False),
             [pid(fam, 'checkpoint_cleanup_frozen_hold')])
    negative(n('cleanup-frozen-active'), b('cleanup'), 'ck_cleanup_frozen_inactive', lambda c: hold_cleaned(c, True, True),
             [pid(fam, 'checkpoint_cleanup_frozen_hold')])
    negative(n('cleanup-dynamic-hold'), b('cleanup'), 'ck_cleanup_dynamic_hold', setp('/checkpoint/dynamic_holds', [{'publication_id': 'pub.a', 'active': True}]),
             [pid(fam, 'checkpoint_cleanup_dynamic_hold')])
    for kind in W.REF_KINDS:
        negative(n('cleanup-ref-' + kind), b('cleanup'), 'ck_cleanup_ref_' + kind, setp('/checkpoint/refs', [{'publication_id': 'pub.a', 'kind': kind}]),
                 [pid(fam, 'checkpoint_cleanup_refs')])
    negative(n('cleanup-fence-moved'), b('cleanup'), 'ck_cleanup_fence', setp('/checkpoint/fence/actual', 6), [pid(fam, 'checkpoint_cleanup_fence')])
    # positives: a released (inactive, resolved) frozen hold and an exactly-at-TTL instant permit cleanup
    c = ck_scenario(scope, 'cleanup')
    for root in (c['checkpoint']['stored']['root'], c['checkpoint']['expected']['root']):
        root['retired_generations'][1]['checkpoint']['hold_refs'] = ['hold:legal:a']
        root['retired_generations'][1]['checkpoint']['retired_at_utc'] = '2026-10-15T00:00:00Z'
        root['retired_generations'][0]['checkpoint']['published_at_utc'] = '2026-10-15T00:00:00Z'
    c['checkpoint']['next']['retired_generations'][0]['checkpoint']['published_at_utc'] = '2026-10-15T00:00:00Z'
    c['checkpoint']['holds']['hold:legal:a'] = {'resolved': True, 'active': False}
    c['checkpoint']['now_utc'] = '2026-10-22T00:00:00Z'
    positive(fam + '/' + scope + '/checkpoint/cleanup-at-ttl', c, [pid(fam, 'checkpoint_cleanup_age'), pid(fam, 'checkpoint_cleanup_frozen_hold')])
    negative(n('cleanup-too-young'), fam + '/' + scope + '/checkpoint/cleanup-at-ttl', 'ck_cleanup_age', setp('/checkpoint/now_utc', '2026-10-21T23:59:59Z'),
             [pid(fam, 'checkpoint_cleanup_age')], 'one second before first retired_at_utc + 604800 seconds')


CK_PLAN = re.compile(r'^(?P<fam>[a-z_.]+):checkpoint_schema:(?P<kind>closed|required|type|grammar|vocabulary|format|number_domain):(?P<rest>.*)$')


def ck_target(root, keys):
    node = root
    for key in keys[:-1]:
        if key == '*':
            if type(node) is not list or not node:
                return None
            node = node[0]
        else:
            if type(node) is not dict or node.get(key) is None:
                return None
            node = node[key]
    return node


def ck_expected_row(root):
    """The first refusing value row, from the shared validators alone (stock verdict, CV-1100 slots, full match)."""
    if not W.checkpoint_validator().is_valid(root):
        return 'ck_next_schema'
    if not W.storage_slots_exact('checkpoint', root):
        return 'ck_next_numbers'
    if W.pattern_failures(root, W.storage_defs()['checkpoint']):
        return 'ck_next_fullmatch'
    return None


def checkpoint_schema_negatives():
    fam = CK_FAM
    plan = [g['guard_id'] for f in load_plan()['families'] if f['event_type'] == fam for g in f['guards']]
    realized = {}
    for gid in plan:
        m = CK_PLAN.match(gid)
        if not m:
            continue
        kind, keys = m.group('kind'), plan_path(m.group('rest'), m.group('kind'))
        made = []
        for base in (fam + '/project/checkpoint/successor', fam + '/project/checkpoint/withdraw'):
            root = BASES[base]['checkpoint']['next']
            forms = []
            if kind == 'closed':
                target = root if not keys else ck_target(root, keys + ['x'])
                if type(target) is dict:
                    forms.append(('unknown-member', lambda r, k=keys: (r if not k else ck_target(r, k + ['x'])).__setitem__('unknown_member', 'x')))
            elif not keys:
                if kind == 'type':
                    forms += [(form, lambda r, v=value: (r.clear(), r.update({'not_an_object': v}) if False else None))
                              for form, value in []]
            if not keys and kind == 'type':
                for form, value in WRONG_FORMS:
                    probe = copy.deepcopy(BASES[base])
                    probe['checkpoint']['next'] = copy.deepcopy(value)
                    nid = base.replace('/checkpoint/', '/neg/checkpoint-schema/' + base.rsplit('/', 1)[1] + '/') + '/type/$/' + form
                    if not add_plan(nid, gid):
                        negative(nid, base, 'ck_next_schema', lambda c, v=value: c['checkpoint'].__setitem__('next', copy.deepcopy(v)), [gid])
                    made.append(nid)
                if made:
                    break
                continue
            if keys:
                parent = ck_target(root, keys)
                if parent is None or (type(parent) is dict and keys[-1] not in parent) or (keys[-1] == '*' and not parent):
                    continue
                current = parent[0] if keys[-1] == '*' else parent[keys[-1]]

                def setter(value, k=keys):
                    def f(r):
                        p = ck_target(r, k)
                        if k[-1] == '*':
                            p[0] = copy.deepcopy(value)
                        else:
                            p[k[-1]] = copy.deepcopy(value)
                    return f
                if kind == 'required':
                    forms.append(('deleted', lambda r, k=keys: ck_target(r, k).__delitem__(k[-1])))
                elif kind == 'type':
                    forms += [(form, setter(value)) for form, value in WRONG_FORMS + [('float', 1.0)]]
                elif kind == 'vocabulary':
                    forms.append(('not-member', setter('not_a_member')))
                elif kind == 'number_domain':
                    if type(current) is int:
                        forms += [('float', setter(float(current))), ('above-u64', setter(2 ** 64)), ('negative', setter(-1))]
                elif type(current) is str:
                    forms += [(form, setter(value)) for form, value in [
                        ('trailing-lf', current + '\n'), ('empty', ''), ('upper', current.upper()), ('space', current + ' '),
                        ('bad-date', '2026-02-30T00:00:00Z'), ('no-zone', '2026-10-20T00:00:00'), ('not-uuid', 'not-a-uuid')]]
            for form, fn in forms:
                probe = copy.deepcopy(BASES[base])
                try:
                    fn(probe['checkpoint']['next'])
                except (KeyError, IndexError, TypeError):
                    continue
                row = ck_expected_row(probe['checkpoint']['next'])
                if row is None:
                    continue
                nid = base.replace('/checkpoint/', '/neg/checkpoint-schema/' + base.rsplit('/', 1)[1] + '/') + '/' + kind + '/' + \
                    '.'.join(keys or ['$']) + '/' + form
                if add_plan(nid, gid):
                    made.append(nid)
                    continue
                negative(nid, base, row, lambda c, f=fn: f(c['checkpoint']['next']), [gid])
                made.append(nid)
            if made:
                break
        realized[gid] = made
    return realized


def install_negatives():
    def bad_meta(c):
        c['resources'][W.FAMILIES[3]]['properties']['receipt_id']['type'] = 'strng'

    def dangling(c):
        s = c['resources'][W.FAMILIES[5]]
        s['properties']['context']['allOf'][0]['else']['properties']['worktree_id'] = {'$ref': '#/$defs/missing_root'}
    negative('install/neg/metaschema', 'install/all', 'install_metaschema', bad_meta, [W.FAMILIES[3] + ':refs_eager'])
    for f in W.FAMILIES:
        def dang(c, f=f):
            s = c['resources'][f]
            s.setdefault('$defs', {})['unused_branch'] = {'anyOf': [{'type': 'null'}, {'$ref': '#/$defs/absent_resource'}]}
        negative('install/neg/dangling-ref/' + f, 'install/all', 'install_refs', dang, [f + ':refs_eager'],
                 'a dangling reference in an unvisited branch refuses installation eagerly')


def build():
    global MANIFEST
    POSITIVES.clear(); NEGATIVES.clear(); RECEIPTS.clear(); BASES.clear(); SPECIAL_SEALED.clear(); CORRUPT_SEALED.clear()
    MANIFEST = manifest()
    build_positives()
    for fam in W.FAMILIES:
        for scope in W.FAMILY_SPECS[fam][3]:
            neg_common(fam, scope)
            neg_family(fam, scope)
        number_negatives(fam)
    schema_real = {}
    for fam in W.FAMILIES:
        schema_real.update(schema_negatives(fam))
    build_checkpoints()
    schema_real.update(checkpoint_schema_negatives())
    install_negatives()
    fixtures = {'schema_id': 'pm.w3f.event_fixtures.v1', 'generated_by': 'scripts/pm-w3f-cases.py',
                'note': 'Prepared without admission; every scenario models a hypothetical future admission. Membership ABSENT.',
                'positives': POSITIVES, 'negatives': NEGATIVES}
    recipe = {'envelope_schema_id': 'pm.event.v0', 'envelope_schema_version': '2.0.0', 'payload_schema_version': '1.0.0',
              'owner_edition': 'w3f-phase2-2026-11-13', 'registry_revision': 'w3f-prepared-1.0.0',
              'identity_recipe': {'application': 'w3f.event_id.v1+cv366.application@1', 'project': 'w3f.event_id.v1+w3f.project_key.v1'},
              'producer_recipe': 'cv317.producer_semantic.cv1100', 'physical_profile': EVENT_VALUE,
              'full_value_profile': 'cv339.original_event_value_commitment.v1', 'local_source_profile': 'none',
              'payload_profile': 'sp337.inline_or_pack', 'resources': RESOURCES,
              'timestamp_profiles': {k: W.TIMESTAMP_PROFILES[k] for k in W.RECIPE_PROFILE_FIELDS}}
    custody = {'schema_id': 'pm.w3f.original_custody.v1',
               'note': 'Static stand-in for Storage sealed write custody (SP-1101). One receipt per exact original; '
                       'readers never write it. Native custody NOT_RUN.',
               'stores': [L.SID], 'recipes': {'w3f@1': recipe}, 'sealed_receipts': RECEIPTS}
    return fixtures, custody, schema_real


def coverage(schema_real):
    plan = load_plan()
    by_plan = {}
    for n in NEGATIVES:
        for gid in n['plan']:
            by_plan.setdefault(gid, []).append(n)
    pos_plan = {}
    for c in POSITIVES:
        for gid in c['plan']:
            pos_plan.setdefault(gid, []).append(c['id'])
    entries, unknown = [], sorted(set(by_plan) | set(pos_plan))
    for f in plan['families']:
        for g in f['guards']:
            gid = g['guard_id']
            if gid in unknown:
                unknown.remove(gid)
            negs = by_plan.get(gid, [])
            entries.append({'plan_id': gid, 'family': f['event_type'], 'negatives': len(negs),
                            'rows': sorted({n['expect']['row'] for n in negs}), 'positives': len(pos_plan.get(gid, [])),
                            'example': negs[0]['id'] if negs else None,
                            'status': 'witnessed' if negs else ('schema_form_valid' if gid in schema_real else 'no_negative')})
    counts = {}
    for e in entries:
        counts[e['status']] = counts.get(e['status'], 0) + 1
    return {'schema_id': 'pm.w3f.phase2_plan_coverage.v1', 'plan': 'Plans/w3f_event_oracle_plan.json', 'entries': len(entries),
            'status_counts': counts, 'tags_not_in_plan': unknown, 'coverage': entries}


def dump(obj):
    with W.exact_digits():
        return json.dumps(obj, indent=1, sort_keys=True, ensure_ascii=False) + '\n'


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--coverage', action='store_true')
    args = parser.parse_args(argv)
    fixtures, custody, schema_real = build()
    texts = {OUT: dump(fixtures), CUSTODY_OUT: dump(custody)}
    if args.coverage:
        texts[COVERAGE_OUT] = json.dumps(coverage(schema_real), indent=1, sort_keys=True) + '\n'
    if args.check:
        stale = [str(p.relative_to(ROOT)) for p, t in texts.items() if not p.exists() or p.read_text() != t]
        print(json.dumps({'positives': len(POSITIVES), 'negatives': len(NEGATIVES), 'sealed_receipts': len(RECEIPTS), 'stale': stale}))
        return 1 if stale else 0
    for p, t in texts.items():
        p.write_text(t)
    print(json.dumps({'positives': len(POSITIVES), 'negatives': len(NEGATIVES), 'sealed_receipts': len(RECEIPTS)}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
