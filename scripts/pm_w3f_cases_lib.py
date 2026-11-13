"""W3F fixture construction library (wave 3 phase 2): coherent base scenarios and dependent-copy sync.

Every scenario is built from independently captured owner authority (``owner``), and the candidate
event is derived from it. ``sync`` refreshes only non-authoritative copies after a one-defect change:
identity (event_id, idempotency keys), Storage's custody of a fresh append, a retained original's custody,
and the copies a retained read returns. It never touches the owner authority a predicate reads.
"""
from __future__ import annotations

import copy
import hashlib

import blake3

import pm_w3f_event_oracles as W
from pm_event_numbers import EVENT_VALUE, full_value_commitment, producer_semantic_digest, storage_value_bytes

SID = '6f1c2a9e-3b7d-4c85-9e21-5a0d7c4b8e13'
OTHER_SID = '0b8e4d2c-9a71-4f36-8d05-3c6e1f7a2b94'
EPOCH = 7
SERVER, HOST, THREAD, PROJECT = 'srv.main', 'host.vm1', 'thr.alpha', 'proj.alpha'
OCCURRED, OBSERVED, PERSISTED = '2026-11-05T10:15:30.123Z', '2026-11-05T10:15:30.456Z', '2026-11-05T10:15:30.789Z'
ACK = '2026-11-05T10:15:30.790Z'
SEQ = 4211
HEX = lambda s: hashlib.sha256(s.encode('utf-8')).hexdigest()  # noqa: E731
GEN = 'eig_' + HEX('generation-1')


def short(family):
    return family.split('.', 1)[1].replace('_', '')


# ---------------------------------------------------------------------------------------------
# owner context and payloads
# ---------------------------------------------------------------------------------------------
def owner_context(family, scope):
    k = W.kind(family)
    ctx = {'scope_kind': scope, 'project_id': PROJECT if scope == 'project' else None, 'server_id': SERVER,
           'thread_id': None if k == 'graph' else THREAD, 'host_id': HOST,
           'working_root_ref': 'root:opaque:alpha' if k == 'discovery' else None,
           'worktree_id': 'wt.alpha' if (k == 'discovery' and scope == 'project') else None,
           'remote_identity_ref': None}
    return ctx


def discovery_source(family, scope):
    f = family.split('.', 1)[1]
    cache = scope == 'project' and family not in W.NO_QUERY_FAMILIES
    permitted = {'candidates_returned': ['res.a1', 'res.a2', 'res.a3'], 'selected': ['res.a1', 'res.a2', 'res.a3'],
                 'verified': ['res.a1', 'res.a2', 'res.a3'], 'fallback': ['res.b1', 'res.b2']}.get(f, [])
    fallback = {'backpressure': ('backpressure', 'backpressure'), 'disabled': ('disabled', 'discovery_disabled'),
                'unsupported': ('unsupported', 'discovery_unsupported'),
                'fallback': ('ssh_manifest' if cache else 'fallback_scan', None)}.get(f, ('none', None))
    return {
        'outcome': W.DISCOVERY_OUTCOME[family], 'receipt_id': 'drc.' + short(family) + '.' + scope,
        'request_id': 'req.' + short(family) + '.1', 'query_text': 'find TODO markers near the scheduler',
        'consumer_id': 'consumer.file_browser', 'permission_snapshot_id': 'perm.snap.9', 'approval_scope_key': None,
        'redaction_profile': 'no_secrets', 'budget_ms': 2000, 'elapsed_ms': 37,
        'freshness_state': 'fresh' if family not in W.NO_QUERY_FAMILIES else 'unknown', 'fallback_state': fallback[0],
        'error_code': fallback[1], 'policy_decision': 'allowed',
        'index_generation': None if family in W.NO_QUERY_FAMILIES else 12,
        'verifier_receipt_ref': 'verifier:receipt:77' if f == 'verified' else None,
        'permitted_result_ids': permitted,
        'selected_result_ids': ['res.a2'] if f in ('selected', 'verified') else [],
        'cache_versions': {'cache_schema_version': 'cache.v3', 'ranking_policy_version': 'rank.v2', 'policy_hash': 'ph.' + HEX('p')[:16],
                           'ignore_hash': 'ih.' + HEX('i')[:16], 'identity_hash': 'id.' + HEX('d')[:16]} if cache else None,
        'ssh': {'host_identity_ref': 'ssh:host:identity:build1', 'current_trust_ref': 'ssh:trust:build1:v4'} if cache else None,
        'thread_admitted': True, 'root_admitted': True, 'independent_result_receipt_ref': None,
    }


def discovery_payload(family, ctx, s):
    return {
        'schema_id': W.payload_schema_id(family), 'schema_version': '1.0.0', 'owner_operation_id': s['receipt_id'],
        'context': copy.deepcopy(ctx), 'receipt_id': s['receipt_id'], 'request_id': s['request_id'], 'consumer_id': s['consumer_id'],
        'query_digest': W.query_digest(s['request_id'], s['query_text']), 'candidate_count': len(s['permitted_result_ids']),
        'selected_result_ids': list(s['selected_result_ids']), 'source_index_generation': s['index_generation'],
        'permission_snapshot_id': s['permission_snapshot_id'], 'approval_scope_key': s['approval_scope_key'],
        'redaction_profile': s['redaction_profile'], 'budget_ms': s['budget_ms'], 'elapsed_ms': s['elapsed_ms'],
        'error_code': s['error_code'], 'verification_receipt_ref': s['verifier_receipt_ref'],
        'source_receipt_ref': s['independent_result_receipt_ref'],
        'cache_versions': copy.deepcopy(s['cache_versions']),
        'ssh_trust': None if s['ssh'] is None else {'host_identity_ref': s['ssh']['host_identity_ref'],
                                                    'host_trust_ref': s['ssh']['current_trust_ref'],
                                                    'permission_snapshot_id': s['permission_snapshot_id']},
        'freshness_state': s['freshness_state'], 'fallback_state': s['fallback_state'], 'policy_decision': s['policy_decision'],
    }


BUDGET_VARIANTS = {
    # workflow, grill, base, extension, asked
    'plan': ('plan', False, 5, 3, 5), 'plan_grill': ('plan', True, 5, 3, 8), 'deep_plan': ('deep_plan', True, 8, 4, 12),
    'brainstorm': ('brainstorm', False, 6, 2, 6), 'crew': ('crew', True, 0, 4, 4), 'chat_room': ('chat_room', True, 0, 3, 3),
    'reconfigured': ('plan', False, 5, 3, 7),
}


def budget_source(scope, variant='plan'):
    wf, grill, base, ext, asked = BUDGET_VARIANTS[variant]
    collab = wf in ('brainstorm', 'crew', 'chat_room')
    return {
        'attempted_admission': True, 'exhaustion_id': 'exh.' + variant + '.' + scope, 'workflow_kind': wf,
        'budget_run_id': ('collab.' if collab else 'wf.') + variant + '.0001',
        'question_records_ref': 'qrec:' + wf + ':0001', 'backend': W.BUDGET_BACKEND[wf],
        'assistant_plan_id': None if wf in ('crew', 'chat_room') else 'ap.' + variant + '.1',
        'strategy': {'plan': 'standard', 'deep_plan': 'deep_thorough', 'brainstorm': 'brainstorm'}.get(wf),
        'policy': {'policy_ref': 'policy:qmax:v3', 'base_limit': base, 'grill_me_enabled': grill, 'grill_me_extension': ext},
        'charged_question_ids': ['q.' + variant + '.' + str(i) for i in range(asked)],
        'independent_result_receipt_ref': None,
    }


def budget_payload(family, ctx, s):
    pol = s['policy']
    eff = pol['base_limit'] + (pol['grill_me_extension'] if pol['grill_me_enabled'] else 0)
    asked = len(set(s['charged_question_ids']))
    return {
        'schema_id': W.payload_schema_id(family), 'schema_version': '1.0.0', 'owner_operation_id': s['exhaustion_id'],
        'context': copy.deepcopy(ctx), 'exhaustion_id': s['exhaustion_id'], 'budget_run_id': s['budget_run_id'],
        'workflow_kind': s['workflow_kind'], 'backend': W.BUDGET_BACKEND[s['workflow_kind']], 'assistant_plan_id': s['assistant_plan_id'],
        'question_records_ref': s['question_records_ref'], 'policy_ref': pol['policy_ref'], 'strategy': s['strategy'],
        'base_limit': pol['base_limit'], 'grill_me_enabled': pol['grill_me_enabled'], 'grill_me_extension': pol['grill_me_extension'],
        'effective_limit': eff, 'questions_asked': asked, 'questions_remaining': max(0, eff - asked),
        'result': 'question_budget_exhausted',
        'continuation': 'await_grill_confirmation' if pol['grill_me_enabled'] else 'synthesis',
        'source_receipt_ref': s['independent_result_receipt_ref'],
    }


def graph_source(scope, variant='initial'):
    gen = 0 if variant == 'initial' else 5
    return {
        'lock_id': 'lock.run1.g' + str(gen), 'run_id': 'run.0001', 'graph_ref': 'graph:artifact:run1:g' + str(gen),
        'graph_sha256': HEX('graph-bytes-g' + str(gen)), 'approval_ref': 'approval:run1:g' + str(gen),
        'commit_receipt_ref': 'graphcommit:run1:g' + str(gen),
        'prior_generation': None if gen == 0 else gen - 1,
        'prior_lock_event_id': None if gen == 0 else 'evt_w3f_' + HEX('prior-lock'),
        'existing_locks': [] if gen == 0 else [{'run_id': 'run.0001', 'replan_generation': gen - 1, 'graph_sha256': HEX('graph-bytes-g4')}],
        'post_lock_graph_valid': True,
    }


def graph_payload(family, ctx, s):
    gen = 0 if s['prior_generation'] is None else s['prior_generation'] + 1
    return {
        'schema_id': W.payload_schema_id(family), 'schema_version': '1.0.0', 'owner_operation_id': s['lock_id'],
        'context': copy.deepcopy(ctx), 'run_id': s['run_id'], 'lock_id': s['lock_id'], 'canonical_graph_ref': s['graph_ref'],
        'graph_sha256': s['graph_sha256'], 'source_approval_ref': s['approval_ref'], 'replan_generation': gen,
        'previous_generation': s['prior_generation'], 'previous_lock_event_id': s['prior_lock_event_id'],
        'graph_commit_receipt_ref': s['commit_receipt_ref'],
    }


def prompt_source(family, scope, variant='default'):
    state = W.PROMPT_STATE[family]
    admitted = family == 'session_prompt.admitted' or (variant == 'from_admitted')
    return {
        'admission_id': 'adm.0042.' + scope, 'prompt_id': 'prm.0042', 'source_session_id': 'sess.client.7', 'target_thread_id': THREAD,
        'prompt_text': 'Please summarize\r\nthe last run\rthanks é中',
        'client_sequence': 17, 'submitted_at_ms': 1762337730123,
        'admitted_at_ms': 1762337730200 if admitted and family != 'session_prompt.rejected' else None,
        'state_source_ref': 'inbox:state:adm.0042:' + state, 'redacted_prompt_ref': 'redacted:prm.0042',
        'predecessor_state': {'session_prompt.admitted': 'queued', 'session_prompt.rejected': 'received'}.get(
            family, 'admitted' if admitted else 'queued'),
        'execution_bound': False, 'expiry_source': 'inbox_expiry:existing_ttl_source' if family == 'session_prompt.expired' else None,
        'rejection_reason_code': 'thread_closed' if family == 'session_prompt.rejected' else None,
    }


def prompt_payload(family, ctx, s, key):
    p = {
        'schema_id': W.payload_schema_id(family), 'schema_version': '1.0.0', 'owner_operation_id': '',
        'context': copy.deepcopy(ctx), 'admission_id': s['admission_id'], 'prompt_id': s['prompt_id'],
        'target_thread_id': s['target_thread_id'], 'thread_id': s['target_thread_id'], 'source_session_id': s['source_session_id'],
        'prompt_hash': W.prompt_hash(s['prompt_text']), 'normalization_recipe_ref': W.PROMPT_RECIPE,
        'client_sequence': s['client_sequence'], 'submitted_at_ms': s['submitted_at_ms'], 'admitted_at_ms': s['admitted_at_ms'],
        'admission_state': W.PROMPT_STATE[family], 'idempotency_key': key, 'redacted_prompt_ref': s['redacted_prompt_ref'],
        'duplicate_of': None, 'execution_ref': None, 'rejection_reason_code': s['rejection_reason_code'],
        'state_source_ref': s['state_source_ref'],
    }
    p['owner_operation_id'] = W.prompt_operation(p)
    return p


AUTONOMY_VARIANTS = {
    # requested, effective, ceiling, decision, reason, permissions, filesafe, dispatched
    'allow': ('regular', 'regular', 'regular', 'allow', None, 'allowed', 'allowed', True),
    'block': ('regular', 'plan', 'plan', 'block', 'mode_read_only', 'not_reached', 'not_reached', False),
    'require_approval': ('yolo', 'regular', 'regular', 'require_approval', 'approval_required', 'not_reached', 'not_reached', False),
    'allow_permissions_refused': ('regular', 'regular', 'regular', 'allow', None, 'refused', 'not_reached', False),
    'allow_filesafe_refused': ('regular', 'regular', 'regular', 'allow', None, 'allowed', 'refused', False),
}


def autonomy_source(scope, variant='allow'):
    req, eff, ceil, dec, reason, perm, fsafe, disp = AUTONOMY_VARIANTS[variant]
    return {
        'receipt_id': 'acr.' + variant.replace('_', '.') + '.' + scope, 'requested_mode': req, 'effective_mode': eff, 'ceiling': ceil,
        'classifier_output': 'filesystem_write', 'mutating': True, 'decision': dec, 'blocked_reason_code': reason,
        'permission_snapshot_id': 'perm.snap.9', 'ceiling_source_ref': 'ceiling:parent:run.0001',
        'decision_source_ref': 'decision:runtime:' + variant, 'invocation_refs': ['tool:call:91'],
        'permissions_outcome': perm, 'filesafe_outcome': fsafe, 'dispatched': disp,
    }


def autonomy_payload(family, ctx, s, owner):
    return {
        'schema_id': W.payload_schema_id(family), 'schema_version': '1.0.0', 'owner_operation_id': s['receipt_id'],
        'context': copy.deepcopy(ctx), 'receipt_id': s['receipt_id'], 'attempt_id': owner['attempt_id'], 'run_id': owner['run_id'],
        'requested_mode': s['requested_mode'], 'effective_mode': s['effective_mode'], 'ceiling_source_ref': s['ceiling_source_ref'],
        'tool_call_ref': 'tool:call:91', 'provider_message_ref': None, 'mutation_class': s['classifier_output'],
        'decision': s['decision'], 'blocked_reason_code': s['blocked_reason_code'], 'permission_snapshot_id': s['permission_snapshot_id'],
        'created_at_utc': OCCURRED, 'enforcement_point': 'post_parse_pre_execution', 'decision_source_ref': s['decision_source_ref'],
    }


# ---------------------------------------------------------------------------------------------
# complete scenarios
# ---------------------------------------------------------------------------------------------
def new_owner(family, scope, variant=None):
    k = W.kind(family)
    ctx = owner_context(family, scope)
    owner = dict(ctx)
    owner.update({'storage_instance_id': SID, 'recovery_epoch': EPOCH,
                  'run_id': 'run.0001' if k in ('autonomy', 'graph') else None,
                  'attempt_id': 'att.0001' if k == 'autonomy' else None, 'node_id': None})
    owner['source'] = {'discovery': lambda: discovery_source(family, scope), 'budget': lambda: budget_source(scope, variant or 'plan'),
                       'graph': lambda: graph_source(scope, variant or 'initial'),
                       'prompt': lambda: prompt_source(family, scope, variant or 'default'),
                       'autonomy': lambda: autonomy_source(scope, variant or 'allow')}[k]()
    return owner


def build_payload(family, owner, key=None):
    k = W.kind(family)
    ctx = {f: owner[f] for f in W.CONTEXT_FIELDS}
    s = owner['source']
    if k == 'discovery':
        return discovery_payload(family, ctx, s)
    if k == 'budget':
        return budget_payload(family, ctx, s)
    if k == 'graph':
        return graph_payload(family, ctx, s)
    if k == 'prompt':
        return prompt_payload(family, ctx, s, key or '')
    return autonomy_payload(family, ctx, s, owner)


def envelope(family, owner, payload):
    e = {
        'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': owner['scope_kind'], 'event_id': '',
        'event_type': family, 'project_id': owner['project_id'], 'thread_id': owner['thread_id'], 'run_id': owner['run_id'],
        'node_id': owner['node_id'], 'attempt_id': owner['attempt_id'], 'actor_ref': 'actor.runtime.local',
        'requested_account_ref': None, 'effective_account_ref': None, 'occurred_at_utc': OCCURRED,
        'observed_at_utc': OBSERVED, 'persisted_at_utc': PERSISTED, 'sequence_id': SEQ, 'producer_sequence_id': 41,
        'correlation_id': 'corr.0001', 'causation_event_id': None, 'parent_event_id': None, 'idempotency_key': '',
        'payload_schema_id': W.payload_schema_id(family), 'payload': payload, 'payload_ref': None,
        'redaction_profile': 'no_secrets', 'replay_policy': 'dedupe_by_idempotency_key',
        'migration': {'migrated_from_schema_id': None, 'migrated_from_schema_version': None, 'migration_id': None,
                      'compatibility_event_type': None},
    }
    return e


def sync_identity(c, operation=False):
    """Refresh identity copies from the candidate: operation (when asked), event_id and keys."""
    e, p = c['event'], c['event']['payload']
    fam = c['family']
    if operation:
        p['owner_operation_id'] = W.operation_of(fam, p)
    key = W.key_recipe(e['scope_kind'], fam, p['context']['server_id'], p['owner_operation_id'])
    if W.kind(fam) == 'prompt':
        p['idempotency_key'] = key
        if operation:
            p['owner_operation_id'] = W.operation_of(fam, p)
    e['idempotency_key'] = key
    e['event_id'] = W.event_id_recipe(c['owner']['storage_instance_id'], c['owner']['recovery_epoch'], W.event_partition(e),
                                      fam, p['owner_operation_id'])


def custody_of(e, sid, epoch):
    receipt = {'event_id': e['event_id'], 'sequence_id': e['sequence_id'], 'segment_generation': 3, 'segment_name': 'seg-000003.log',
               'byte_offset': 81920, 'commit_group_id': 'cg.' + e['event_id'][-12:], 'durability_class': 'ordinary',
               'durable_end_offset': 90112, 'durability_state': 'synced', 'manifest_generation': 9, 'acknowledged_at_utc': ACK}
    return {'storage_instance_id': sid, 'event_id': e['event_id'], 'recovery_epoch': epoch, 'receipt': receipt,
            'result': {'event_id': e['event_id'], 'sequence_id': e['sequence_id'], 'segment_name': 'seg-000003.log', 'byte_offset': 81920},
            'full_value_sha256': full_value_commitment(e), 'producer_semantic_sha256': producer_semantic_digest(e)}


def sync_custody(c):
    """A fresh append's custody is Storage's commitment to the candidate it committed. A candidate an earlier
    envelope/payload row refuses never reaches custody (those rows gate it), so its custody stays as built."""
    keep = c['publication']['custody']
    try:
        fresh = custody_of(c['event'], keep['storage_instance_id'], keep['recovery_epoch'])
    except (ValueError, TypeError, KeyError):
        return
    fresh['receipt']['sequence_id'] = c['storage_issued']['sequence_id']
    fresh['result']['sequence_id'] = c['storage_issued']['sequence_id']
    c['publication']['custody'] = fresh


def sync_original(c):
    """A replaced retained original: its own Storage custody, and the copies a retry/read returns."""
    o = c['storage']['event']
    c['storage']['custody'] = custody_of(o, c['owner']['storage_instance_id'], c['storage']['custody']['recovery_epoch'])
    if c['path'] == 'history':
        c['event'] = copy.deepcopy(o)
        c['reader']['output'] = copy.deepcopy(o['payload'])
    if c['path'] == 'retry':
        c['retry']['returned_receipt'] = copy.deepcopy(c['storage']['custody']['receipt'])


def effects_for(family):
    k = W.kind(family)
    if k == 'budget':
        return {'question_items_added': 0, 'counter_changed': False, 'run_failed': False, 'grill_auto_confirmed': False,
                'build_disabled_by_budget': False}
    if k == 'prompt':
        return {'execution_started': False}
    if k == 'graph':
        return {'stale_attempt_resumed': False, 'dispatch_accepted': True}
    if k == 'discovery':
        return {'index_query': False}
    return {}


def publication_order(family, owner):
    k = W.kind(family)
    steps = ['body_durable', 'append', 'receipt_synced', 'publication']
    if k == 'graph':
        steps = ['source_commit'] + steps + ['dispatch_accepted']
    if family == 'discovery.invoked':
        steps = steps + ['search_published']
    return steps


def append_scenario(family, scope, variant=None):
    owner = new_owner(family, scope, variant)
    payload = build_payload(family, owner)
    e = envelope(family, owner, payload)
    c = {'family': family, 'path': 'append', 'owner': owner, 'event': e, 'producer': W.FAMILY_SPECS[family][4],
         'admission': {'family': family, 'version': '1.0.0', 'writer_granted': True, 'writer_withdrawn': False},
         'target': {'scope_partition': W.partition(scope, owner['project_id'])},
         'storage_issued': {'sequence_id': SEQ, 'observed_at_utc': OBSERVED, 'persisted_at_utc': PERSISTED},
         'publication': {'order': publication_order(family, owner), 'custody': None},
         'pack': None, 'effects': effects_for(family)}
    if W.kind(family) == 'autonomy':
        s = owner['source']
        steps = list(W.AUTONOMY_STEPS) if s['dispatched'] else list(W.AUTONOMY_STEPS[:-1])
        c['autonomy'] = {'order': steps, 'permissions_outcome': s['permissions_outcome'], 'filesafe_outcome': s['filesafe_outcome']}
    sync_identity(c, operation=W.kind(family) == 'prompt')
    c['publication']['custody'] = custody_of(e, SID, EPOCH)
    return c


def retained_parts(a):
    """The committed original of an append scenario, as Storage holds it."""
    original = copy.deepcopy(a['event'])
    return original, custody_of(original, SID, a['owner']['recovery_epoch'])


def retry_scenario(family, scope, variant=None):
    a = append_scenario(family, scope, variant)
    original, held = retained_parts(a)
    cand = copy.deepcopy(original)
    # The retry is the same complete input; Storage metadata it carries is not semantic (CV-317).
    cand['observed_at_utc'], cand['persisted_at_utc'], cand['sequence_id'] = '2026-11-05T10:16:01.000Z', '2026-11-05T10:16:01.001Z', SEQ + 9
    c = {k: v for k, v in a.items() if k not in ('publication', 'storage_issued', 'pack')}
    c.update({'path': 'retry', 'event': cand,
              'storage': {'event': original, 'custody': held, 'authentic': True, 'withdrawn': False, 'compacted': False,
                          'translation_ref': None},
              'retry': {'frontier': 100, 'dedupe_through': 100, 'result': 'original', 'effects': 0,
                        'returned_receipt': copy.deepcopy(held['receipt']), 'recipe_selector': None}})
    return c


def token():
    sel = {'storage_instance_id': SID, 'current_ref': 'storage/seglog/CURRENT', 'current_bytes_sha256': HEX('current'),
           'selected_segment_generation': 3, 'manifest_ref': 'storage/seglog/manifest.v1.msgpack', 'manifest_bytes_sha256': HEX('manifest'),
           'manifest_generation': 9, 'recovery_epoch': EPOCH, 'manifest_survivor_prefix_sha256': HEX('survivor'),
           'retained_inventory_sha256': HEX('inventory'), 'durable_watermarks_sha256': HEX('watermarks'),
           'excluded_ranges_sha256': HEX('excluded'), 'retired_inputs_sha256': HEX('retired')}
    return {'storage_instance_id': SID, 'checkpoint_key': 'event_record_index_checkpoint.v1:' + SID,
            'checkpoint_ref': 'event_record_index_checkpoint.v1:' + SID + '#' + GEN, 'generation_id': GEN,
            'generation_anchor_sha256': HEX('anchor'), 'frontier_revision': 100, 'frontier_sha256': HEX('frontier-100'),
            'index_dataset_name': 'event_record_index.v2@' + GEN, 'source_selection': sel}


def history_scenario(family, scope, variant=None):
    r = retry_scenario(family, scope, variant)
    original = r['storage']['event']
    sinks = list(W.READER_SINKS_COMMON) + list(W.READER_SINKS[W.kind(family)])
    c = {k: v for k, v in r.items() if k != 'retry'}
    # Live state changed after the write: the writer grant is gone and the owner's live view moved on. History
    # never consults either (CV-1450..1464 paragraph 11).
    c['admission'] = dict(c['admission'], writer_granted=False, writer_withdrawn=True)
    c.update({'path': 'history', 'event': copy.deepcopy(original), 'live_changed': True,
              'reader': {'reader_id': 'reader.' + family + '@1.0.0', 'withdrawn': False, 'token': token(), 'current_token': token(),
                         'dataset_storage_instance_id': SID,
                         'coverage': {'kind': 'global', 'intervals': [[0, 2000], [2001, 4211]], 'required': [[0, 2000], [2001, 4211]]},
                         'translation_ref': None, 'grant_current': True, 'source_deleted': False, 'held': False, 'disclosed': True,
                         'output': copy.deepcopy(original['payload']),
                         'family_checkpoint': ({'state': 'current', 'index_through_sequence_id': SEQ, 'publication_id': 'pub.autonomy.1'}
                                               if W.kind(family) == 'autonomy' else None),
                         'effects': {s: False for s in sinks}, 'recipe_selector': None}})
    return c


def sealed_receipt(c, recipe='w3f@1', manifest=None, admission=True, commitment=None):
    o = c['storage']['event']
    return {'storage_instance_id': c['owner']['storage_instance_id'], 'scope_kind': o['scope_kind'], 'event_type': o['event_type'],
            'event_id': o['event_id'], 'recipe': recipe, 'resource_manifest_sha256': manifest,
            'source_commitment': commitment or hashlib.sha256(storage_value_bytes(o, profile=EVENT_VALUE)).hexdigest(),
            'admission': {'family': o['event_type'], 'version': '1.0.0', 'registry_revision': 'w3f-prepared-1.0.0'} if admission else None}


# ---------------------------------------------------------------------------------------------
# body size (SP-337): grow joined free-text fields coherently in payload and owner source
# ---------------------------------------------------------------------------------------------
GROW_FIELDS = {
    'discovery': [('/event/payload/context/working_root_ref', '/owner/working_root_ref', 2048),
                  ('/event/payload/context/remote_identity_ref', '/owner/remote_identity_ref', 2048)],
    'budget': [('/event/payload/question_records_ref', '/owner/source/question_records_ref', 2048),
               ('/event/payload/policy_ref', '/owner/source/policy/policy_ref', 2048),
               ('/event/payload/budget_run_id', '/owner/source/budget_run_id', 4096)],
    'graph': [('/event/payload/canonical_graph_ref', '/owner/source/graph_ref', 2048),
              ('/event/payload/source_approval_ref', '/owner/source/approval_ref', 2048),
              ('/event/payload/graph_commit_receipt_ref', '/owner/source/commit_receipt_ref', 2048)],
    'prompt': [('/event/payload/redacted_prompt_ref', '/owner/source/redacted_prompt_ref', 2048),
               ('/event/payload/state_source_ref', '/owner/source/state_source_ref', 2048),
               ('/event/payload/context/host_id', None, 0)],
    'autonomy': [('/event/payload/ceiling_source_ref', '/owner/source/ceiling_source_ref', 2048),
                 ('/event/payload/decision_source_ref', '/owner/source/decision_source_ref', 2048),
                 ('/event/payload/tool_call_ref', None, 2048)],
}


def get(c, pointer):
    node = c
    for part in pointer.split('/')[1:]:
        node = node[int(part)] if type(node) is list else node[part]
    return node


def put(c, pointer, value):
    W.apply_change(c, pointer, 'set', value)


def set_grown(c, field, owner_field, value):
    put(c, field, value)
    if owner_field:
        put(c, owner_field, value)
    if field == '/event/payload/tool_call_ref':
        c['owner']['source']['invocation_refs'] = [value]


def grow_to(c, target):
    """Pad joined free-text fields (payload and owner authority together) until the payload encodes to exactly
    target bytes: 4-byte scalars first, then 1-byte fine-tuning on the last padded field, within maxLength."""
    fam = c['family']
    fields = [f for f in GROW_FIELDS[W.kind(fam)] if f[2]]
    size = lambda: len(storage_value_bytes(c['event']['payload'], profile=EVENT_VALUE))  # noqa: E731
    last = None
    for field, owner_field, limit in fields:
        if size() >= target:
            break
        cur = get(c, field) or 'ref:'
        n = max(0, min(limit - len(cur) - 4, (target - size() + 3) // 4))
        set_grown(c, field, owner_field, cur + '\U0001d7d8' * n)
        last = (field, owner_field, limit)
    guard = 0
    while size() != target and guard < 64:
        guard += 1
        field, owner_field, limit = last
        v = get(c, field)
        over = size() - target
        if over >= 4 and v.endswith('\U0001d7d8'):
            v = v[:-1]
        elif over > 0 and v.endswith('\U0001d7d8'):
            v = v[:-1] + 'x'
        elif over > 0:
            v = v[:-1]
        elif len(v) < limit:
            v = v + 'x'
        else:
            raise ValueError('cannot reach exact size ' + str(target))
        set_grown(c, field, owner_field, v)
    if size() != target:
        raise ValueError('cannot reach exact size ' + str(target))
    return size()


def to_pack(c):
    raw = storage_value_bytes(c['event']['payload'], profile=EVENT_VALUE)
    pid = blake3.blake3(raw).hexdigest()
    c['pack'] = {'payload_id': pid, 'byte_size': len(raw), 'media_type': W.PACK_MEDIA, 'bytes_hex': raw.hex()}
    c['event']['payload_ref'] = 'sp337:blake3:' + pid
