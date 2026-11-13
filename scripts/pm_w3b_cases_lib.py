"""W3B fixture construction library (wave 3 phase 2): coherent scenarios built from owner-held source values.

``build`` constructs every scenario from independently captured owner authority (``owner.native``,
``owner.world``, ``owner.operation``, ``owner.authority``) and derives every copy from it: the source body and
fact, the event payload and envelope, the identities (this module's own implementation of the SCS-1250..1268
hex-concatenation templates read from Plans/source_control_event_preparation.json, not the checker's), the
partition, Storage's issued values, the SP-286 custody, packs and the CAS post-state. A one-defect negative is a
rebuild with one knob changed (all dependent copies recomputed, owner authority untouched) or a single post-build
change to a value nothing else is derived from.
"""
from __future__ import annotations

import base64
import copy
import hashlib

import blake3

import pm_w3b_event_oracles as W
from pm_event_numbers import EVENT_VALUE, full_value_commitment, producer_semantic_digest, storage_value_bytes

SID = '6f1c2a9e-3b7d-4c85-9e21-5a0d7c4b8e13'
OTHER_SID = '0b8e4d2c-9a71-4f36-8d05-3c6e1f7a2b94'
SERVER, PROJECT, OTHER_PROJECT = 'srv.home', 'proj.alpha', 'proj.beta'
HOST, ENV, LOC, TOPO = 'host.vm1', 'env.vm1.default', 'loc.alpha.main', 4
OCCURRED, OBSERVED, PERSISTED = '2026-11-05T10:15:30.123Z', '2026-11-05T10:15:30.456Z', '2026-11-05T10:15:30.789Z'
ACK, REQUESTED = '2026-11-05T10:15:30.790Z', '2026-11-05T10:15:29.001Z'
SEQ = 4211
PACK_MEDIA, SOURCE_MEDIA = W.PACK_MEDIA, W.SOURCE_MEDIA
PREP = {f['event_type']: f for f in W.PREP['families']}


def H(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def hexs(text):
    return text.encode('utf-8').hex()


def template(t, sid, project, op):
    """Fill an owner template ({hex(storage_instance_id)}, {hex(project_id)}, {hex(owner_operation_id)})."""
    return (t.replace('{hex(storage_instance_id)}', hexs(sid)).replace('{hex(project_id)}', hexs(project))
            .replace('{hex(owner_operation_id)}', hexs(op)))


def event_id(fam, sid, project, op):
    return template(PREP[fam]['event_id_recipe'], sid, project, op)


def idem_key(fam, sid, project, op):
    return template(PREP[fam]['idempotency_key_recipe'], sid, project, op)


def fact_key(fam, sid, project, op):
    return template(PREP[fam]['fact_key'], sid, project, op)


def ck_key(fam, sid, project):
    return template(PREP[fam]['checkpoint_key'], sid, project, '')


def partition(project):
    return 'project~' + base64.urlsafe_b64encode(project.encode('utf-8')).decode('ascii').rstrip('=')


def receipt_ref(sid, eid):
    return 'sp286:first_receipt:' + sid + ':' + eid


def vbytes(value):
    return storage_value_bytes(value, profile=EVENT_VALUE)


def sha(value):
    return hashlib.sha256(vbytes(value)).hexdigest()


def git_rev(seed, fmt='sha1'):
    n = 40 if fmt == 'sha1' else 64
    return {'kind': 'git', 'object_format': fmt, 'commit_oid': H('commit:' + seed)[:n], 'ref_name': 'refs/heads/main', 'index_generation': 12}


def jj_rev(seed, bookmarks=None):
    return {'kind': 'jujutsu', 'change_id': 'chg' + H('chg:' + seed)[:29], 'commit_id': H('jjc:' + seed)[:40],
            'operation_id': 'op' + H('jjop:' + seed)[:30], 'workspace_id': 'default', 'bookmarks': list(bookmarks or ['main'])}


def short(fam):
    return fam.split('.', 1)[1]


def key(fam):
    return W.spec(fam)['key']


# ---------------------------------------------------------------------------------------------
# owner authority per family
# ---------------------------------------------------------------------------------------------
REPO, WS, WS2, CTX = 'repo.alpha', 'ws.alpha.main', 'ws.alpha.feature', 'repoctx:alpha:main'


def native_values(fam, variant):
    s = short(fam)
    k = key(fam)
    backend = 'jujutsu' if variant in ('jj', 'jj_big') else 'git'
    rev = (lambda seed: jj_rev(seed, ['bm-' + H(str(i))[:36] for i in range(420)] if variant == 'jj_big' else None)) \
        if backend == 'jujutsu' else (lambda seed: git_rev(seed))
    n = {'project_id': PROJECT, 'execution_host_id': HOST, 'execution_environment_id': ENV, 'source_location_id': LOC}
    repo = {'repo_id': REPO, 'scm_backend': backend, 'workspace_id': WS}
    if s == 'backend.detected':
        state = {'base': 'complete', 'partial': 'partial', 'unavailable': 'unavailable'}[variant]
        n.update({'detected_backends': {'complete': ['git', 'jujutsu'], 'partial': ['git'], 'unavailable': []}[state],
                  'observation_state': state, 'setup_state_ref': 'setup:alpha:7'})
    elif s == 'backend.selected':
        n.update({'previous_backend': None if variant == 'first' else 'git', 'selected_backend': 'jujutsu', 'setup_state_ref': 'setup:alpha:8'})
    elif s.startswith('checkpoint.'):
        n.update(repo)
        n.update({'checkpoint_id': 'ckpt.alpha.1', 'checkpoint_ref': 'ckptref:alpha:1', 'checkpoint_generation': 3})
        if s == 'checkpoint.created':
            n['checkpoint_revision'] = rev('ckpt')
        else:
            n.update({'before_revision': rev('before'), 'after_revision': rev('ckpt'), 'operation_receipt_ref': 'receipt:restore:alpha:1'})
    elif s.startswith('remote.'):
        n.update(repo)
        n.update({'repository_context_ref': CTX, 'remote_target_ref': 'rtarget:alpha:origin', 'observable_work_id': 'work.alpha.42',
                  'before_revision': rev('before')})
        if s.endswith('_completed'):
            n.update({'after_revision': rev('after'), 'operation_receipt_ref': 'receipt:' + k + ':1'})
        if s.startswith('remote.sync'):
            n['sync_variant'] = 'local_reconcile_only' if variant == 'local' else 'remote_effect'
    elif s.startswith('repository.'):
        n.update(repo)
        n.update({'repository_context_ref': CTX, 'binding_ref': 'binding:alpha:1', 'binding_generation': 1})
        if s == 'repository.bound':
            n['native_revision'] = rev('head')
        else:
            n['disposition_receipt_ref'] = 'disposition:alpha:1'
    elif s == 'status.refreshed':
        n.update(repo)
        n.update({'repository_context_ref': CTX, 'status_snapshot_ref': 'status:alpha:31', 'native_revision': rev('head'),
                  'observation_state': {'base': 'current', 'jj': 'current', 'jj_big': 'current', 'partial': 'partial'}.get(variant, 'current')})
    elif s == 'workspace.created':
        n.update(repo)
        n.update({'repository_context_ref': CTX, 'created_workspace_id': WS2, 'native_revision': rev('head'),
                  'operation_receipt_ref': 'receipt:wscreate:1'})
    elif s == 'workspace.opened':
        n.update(repo)
        n.update({'repository_context_ref': CTX, 'opened_workspace_id': WS, 'native_revision': rev('head'), 'open_result_ref': 'result:wsopen:1'})
    elif s == 'workspace.removed':
        n.update(repo)
        n.update({'workspace_id': WS2, 'repository_context_ref': CTX, 'removed_workspace_id': WS2, 'before_revision': rev('head'),
                  'disposition_receipt_ref': 'disposition:ws2:1', 'operation_receipt_ref': 'receipt:wsremove:1'})
    elif s == 'workspace.switched':
        n.update(repo)
        n.update({'workspace_id': WS2, 'repository_context_ref': CTX, 'previous_workspace_id': WS, 'selected_workspace_id': WS2,
                  'before_revision': rev('head'), 'after_revision': rev('feature'), 'operation_receipt_ref': 'receipt:wsswitch:1'})
    elif s.startswith('writer_lease.'):
        n.update(repo)
        n.update({'lease_id': 'lease.alpha.2', 'lease_ref': 'lease:writer:alpha:2', 'holder_ref': 'holder:agent:7', 'lease_generation': 2,
                  'lease_epoch': 9})
        if s == 'writer_lease.granted':
            n.update({'prior_state': 'reconciled' if variant == 'reconciled' else 'requested', 'state': 'active'})
        else:
            st = {'base': ('released', 'clean'), 'expired': ('expired_pending_reconciliation', 'pending'),
                  'revoked': ('revoked', 'manual_recovery_required')}[variant]
            n.update({'prior_state': 'active', 'state': st[0], 'reconciliation_state': st[1]})
    return n


def world_values(fam, variant, n):
    s = short(fam)
    k = key(fam)
    if s == 'backend.detected':
        return {'setup_state': {'available': variant != 'unavailable', 'complete': variant == 'base',
                                'observed_backends': list(n['detected_backends']), 'host_id': HOST, 'environment_id': ENV,
                                'topology_generation': TOPO}}
    if s == 'backend.selected':
        return {'selection': {'kind': 'committed', 'effective_backend': n['selected_backend'], 'result_backend': n['selected_backend'],
                              'saved_previous_backend': n['previous_backend']}}
    if s == 'checkpoint.created':
        return {'checkpoint': {'checkpoint_id': n['checkpoint_id'], 'purpose': 'recovery', 'generation': n['checkpoint_generation'],
                               'native_revision': copy.deepcopy(n['checkpoint_revision']), 'durable': True}}
    if s == 'checkpoint.restored':
        return {'selected_checkpoint': {'checkpoint_id': n['checkpoint_id'], 'checkpoint_ref': n['checkpoint_ref'],
                                        'generation': n['checkpoint_generation']},
                'observed_after_revision': copy.deepcopy(n['after_revision']),
                'receipt': {'outcome': 'succeeded', 'receipt_ref': n['operation_receipt_ref']}}
    if s.startswith('remote.'):
        out = {'captured_target': {'target_ref': n['remote_target_ref'], 'repo_id': n['repo_id'],
                                   'native_revision': copy.deepcopy(n['before_revision']), 'source': 'captured_remote_target'},
               'dispatch': {'target_ref': n['remote_target_ref'], 'writer_lease_ref': 'lease:writer:alpha:2',
                            'credential_lease_ref': 'lease:cred:alpha:1'}}
        if s.endswith('_completed'):
            out.update({'receipt': {'outcome': 'succeeded', 'receipt_ref': n['operation_receipt_ref'],
                                    'after_revision': copy.deepcopy(n['after_revision'])},
                        'observed_after_revision': copy.deepcopy(n['after_revision']), 'unresolved_effects': []})
        if s.startswith('remote.publish'):
            out['fanout'] = {'targets': ['origin', 'mirror'], 'succeeded': ['origin', 'mirror'] if s.endswith('_completed') else [],
                             'auto_retry': False}
        if s.startswith('remote.sync'):
            out.update({'publish_performed': False, 'push_targets': [], 'resolved_strategy': 'rebase',
                        'original_revision': 'origrev:' + H('orig')[:16], 'fork_revision': 'forkrev:' + H('fork')[:16]})
        return out
    if s == 'repository.bound':
        return {'binding': {'project_id': n['project_id'], 'repo_id': n['repo_id'], 'scm_backend': n['scm_backend'],
                            'workspace_id': n['workspace_id'], 'binding_ref': n['binding_ref'], 'generation': n['binding_generation'],
                            'forge_binding': {'forge_provider': 'github', 'binding_ref': 'forgebind:alpha'}},
                'verified_checkout_revision': copy.deepcopy(n['native_revision']), 'existing_binding_ref': None}
    if s == 'repository.unbound':
        return {'captured_binding': {'binding_ref': n['binding_ref'], 'project_id': n['project_id'], 'repo_id': n['repo_id'],
                                     'workspace_id': n['workspace_id'], 'generation': n['binding_generation']},
                'disposition': {'settled': True, 'receipt_ref': n['disposition_receipt_ref']},
                'removed_bindings': [n['binding_ref']], 'inferred_native_deletion': False}
    if s == 'status.refreshed':
        return {'status_result': {'snapshot_ref': n['status_snapshot_ref'], 'repo_id': n['repo_id'], 'workspace_id': n['workspace_id'],
                                  'observation_state': n['observation_state'], 'native_revision': copy.deepcopy(n['native_revision']),
                                  'executed_hooks': False, 'executed_filters': False, 'jj_snapshot': False}}
    if s == 'workspace.created':
        return {'observed_workspace_id': n['created_workspace_id'], 'conflict_plan': {'destination': n['created_workspace_id'], 'admitted': True},
                'receipt': {'outcome': 'succeeded', 'receipt_ref': n['operation_receipt_ref']}}
    if s == 'workspace.opened':
        return {'open_result': {'workspace_id': n['opened_workspace_id'], 'result_ref': n['open_result_ref'], 'operation_kind': 'open'},
                'read': {'native_revision': copy.deepcopy(n['native_revision']), 'backend': n['scm_backend'], 'current': True}}
    if s == 'workspace.removed':
        return {'removal_result': {'workspace_id': n['removed_workspace_id'], 'kind': 'native_removal', 'cleanup_inferred_from_expiry': False},
                'checks': {'ownership': 'settled', 'dependency': 'settled', 'active_work': 'settled', 'data_disposition': 'settled'},
                'receipt': {'outcome': 'succeeded', 'receipt_ref': n['operation_receipt_ref']},
                'disposition_receipt_ref': n['disposition_receipt_ref']}
    if s == 'workspace.switched':
        return {'switch_result': {'selected_workspace_id': n['selected_workspace_id']},
                'captured_selection': {'workspace_id': n['previous_workspace_id'], 'source': 'captured_selection'},
                'dispatch_log': ['cmd.source_control.workspace.switch'], 'receipt': {'receipt_ref': n['operation_receipt_ref']}}
    if s == 'writer_lease.granted':
        return {'lease': {'repo_id': n['repo_id'], 'workspace_id': n['workspace_id'], 'scm_backend': n['scm_backend'],
                          'holder_ref': n['holder_ref'], 'generation': n['lease_generation'], 'epoch': n['lease_epoch'],
                          'lease_id': n['lease_id'], 'lease_ref': n['lease_ref'], 'verified_by': 'lease_owner', 'current': True},
                'competing_active_writers': [], 'previous_reconciliation': 'clean'}
    if s == 'writer_lease.lost':
        return {'prior_lease': {'holder_ref': n['holder_ref'], 'generation': n['lease_generation'], 'epoch': n['lease_epoch'],
                                'lease_id': n['lease_id'], 'state': 'active'},
                'lease_after': {'state': n['state']}, 'mutation_fenced': True, 'removal_proven_by_expiry': False}
    raise ValueError(fam)


def authority(fam):
    kinds = W.spec(fam)['authorities']
    refs = {'permission': 'perm:snap:' + key(fam) + ':1', 'filesafe': 'filesafe:dec:' + key(fam) + ':1', 'capability': 'cap:scm:alpha:3',
            'topology': 'topo:alpha:' + str(TOPO), 'revision': 'currentness:alpha:5', 'writer_lease': 'lease:writer:alpha:2',
            'credential': 'lease:cred:alpha:1'}
    gens = {'permission': 9, 'filesafe': 4, 'capability': 3, 'topology': TOPO, 'revision': 5, 'writer_lease': 2, 'credential': 1}
    return ({k: {'decision': 'allow', 'evidence_ref': refs[k], 'generation': gens[k]} for k in kinds}, {k: gens[k] for k in kinds})


def lineage(fam):
    return {'thread_id': 'thr.alpha', 'run_id': None, 'node_id': None, 'attempt_id': None, 'actor_ref': 'actor:user:u1',
            'requested_account_ref': 'acct:req:u1', 'effective_account_ref': 'acct:eff:u1', 'correlation_id': 'corr.' + key(fam) + '.1',
            'causation_event_id': None, 'parent_event_id': None}


# ---------------------------------------------------------------------------------------------
# original request (SCS v2 legacy_exact wrapper over the v1 command request, or the v2 local_reconcile_only sync)
# ---------------------------------------------------------------------------------------------
def scope_lineage(n):
    return {'project_id': n['project_id'], 'project_home_server_id': SERVER, 'execution_host_id': n['execution_host_id'],
            'execution_environment_id': n['execution_environment_id'], 'source_location_id': n['source_location_id'],
            'topology_generation': TOPO}


def legacy_scope(fam, n, auth):
    s = short(fam)
    sc = {'command_id': W.spec(fam)['command_id'], 'lineage': scope_lineage(n)}
    if s == 'backend.detected':
        sc['backend_candidates'] = ['git', 'jujutsu']
        return sc
    if s == 'backend.selected':
        sc['scm_backend'] = n['selected_backend']
        return sc
    sc.update({'repository_context_ref': n.get('repository_context_ref', CTX), 'repo_id': n['repo_id'], 'scm_backend': n['scm_backend'],
               'workspace_id': n['workspace_id'],
               'expected_revision': copy.deepcopy(n.get('native_revision') or n.get('before_revision') or n.get('checkpoint_revision') or
                                                  (git_rev('head') if n['scm_backend'] == 'git' else jj_rev('head'))),
               'currentness_generation': 5})
    if 'writer_lease' in auth:
        sc['writer_lease_ref'] = auth['writer_lease']['evidence_ref']
    if 'credential' in auth:
        sc['credential_lease_ref'] = auth['credential']['evidence_ref']
        sc['transport'] = 'https'
    if s.startswith('remote.') or s == 'repository.bound':
        sc['forge_binding'] = {'forge_provider': 'github', 'binding_ref': 'forgebind:alpha'}
    if s == 'checkpoint.created':
        sc.update({'checkpoint_id': n['checkpoint_id'], 'checkpoint_purpose': 'recovery', 'expected_checkpoint_generation': n['checkpoint_generation']})
    if s == 'checkpoint.restored':
        sc.update({'checkpoint_ref': n['checkpoint_ref'], 'expected_checkpoint_generation': n['checkpoint_generation'], 'restore_confirmation': True})
    if s == 'workspace.created':
        sc['requested_workspace_id'] = n['created_workspace_id']
    return sc


def return_context(fam):
    return {'surface_id': 'surface.source_control', 'route_ref': 'route:scm:checkpoints', 'focus_id': 'focus:ckpt:1',
            'invocation_token': 'invoke:' + key(fam) + ':1', 'caller_context_ref': None, 'expected_caller_revision': None,
            'continuation_generation': None}


def evidence(owner_ref, source_ref, gen):
    return {'schema_id': 'pm.shared_integration_runtime.owner_evidence_ref.v1', 'schema_version': '1.0.0', 'owner_ref': owner_ref,
            'source_ref': source_ref, 'source_sha256': H(source_ref), 'revision': 1, 'generation': gen}


def original_request(fam, variant, n, op, auth, world):
    s = short(fam)
    if s.startswith('writer_lease.'):
        return None
    sc = legacy_scope(fam, n, auth)
    if s.startswith('remote.sync') and variant == 'local':
        target = {
            'kind': 'local_reconcile_only', 'original_repository_ref': 'repo:upstream:alpha', 'original_remote_ref': 'remote:upstream',
            'original_fetched_revision': world['original_revision'], 'fork_repository_ref': 'repo:fork:alpha', 'fork_workspace_ref': 'ws:fork:alpha',
            'expected_native_revision': world['fork_revision'], 'head_repository_ref': 'repo:fork:alpha', 'base_repository_ref': 'repo:upstream:alpha',
            'reconciliation_strategy': world['resolved_strategy'], 'backend': n['scm_backend'],
            'currentness_evidence': evidence('owner:scm', 'currentness:alpha:5', 5),
            'writer_lease_evidence': evidence('owner:lease', auth['writer_lease']['evidence_ref'], 2),
            'filesafe_evidence': evidence('owner:filesafe', auth['filesafe']['evidence_ref'], 4),
            'permission_evidence': evidence('owner:permission', auth['permission']['evidence_ref'], 9),
            'return_context_ref': 'return:sync:1', 'push_targets': [], 'publish_performed': False,
            'schema_id': 'pm.source_control.remote_sync_local_reconcile_target.v2', 'schema_version': '2.0.0',
            'operation_id': op['owner_operation_id'], 'command_instance_id': op['command_instance_id'], 'idempotency_key': op['request_idempotency_key'],
            'project_id': n['project_id'], 'original_binding_ref': 'binding:upstream:1', 'original_fetch_receipt_ref': 'receipt:fetch:upstream:1',
            'original_fetch_receipt_sha256': H('fetch-receipt'), 'fork_binding_ref': 'binding:fork:1', 'fork_native_workspace_ref': 'native:ws:fork',
            'head_revision': 'headrev:' + H('h')[:12], 'base_revision': 'baserev:' + H('b')[:12], 'review_binding_ref': None,
            'contribution_binding_ref': None, 'strategy_policy_id': 'policy.sync.rebase', 'strategy_policy_revision': 1,
            'strategy_policy_sha256': H('policy'), 'source_generation': 3, 'source_currentness_ref': 'cur:src:3',
            'source_currentness_sha256': H('cur-src'), 'destination_generation': 4, 'destination_currentness_ref': 'cur:dst:4',
            'destination_currentness_sha256': H('cur-dst'), 'writer_lease_generation': 2, 'scope_stop_epoch': 0, 'task_stop_epoch': 0,
            'preview_ref': 'preview:sync:1', 'preview_sha256': H('preview'), 'preview_expires_at': '2026-11-05T11:00:00Z',
            'capability_evidence': evidence('owner:capability', auth['capability']['evidence_ref'], 3)}
        return {'schema_id': 'pm.source_control.command_request.v2', 'schema_version': '2.0.0', 'command_id': 'cmd.source_control.remote.sync',
                'scope': {'kind': 'project', 'scope': sc}, 'target': target, 'idempotency_key': op['request_idempotency_key'],
                'return_context_ref': 'return:sync:1'}
    legacy = {'schema_id': 'pm.source_control.command_request.v1', 'command_instance_id': op['command_instance_id'],
              'idempotency_key': op['request_idempotency_key'], 'scope': sc,
              'permission_snapshot_ref': auth['permission']['evidence_ref'], 'file_safe_decision_ref': auth['filesafe']['evidence_ref'],
              'requested_at_utc': REQUESTED}
    if s.startswith('checkpoint.'):
        legacy['return_context'] = return_context(fam)
    return {'schema_id': 'pm.source_control.command_request.v2', 'schema_version': '2.0.0', 'variant': 'legacy_exact', 'legacy_request': legacy}


# ---------------------------------------------------------------------------------------------
# the coherent scenario
# ---------------------------------------------------------------------------------------------
STARTED = ('remote.fetch_started', 'remote.publish_started', 'remote.sync_started')
COMPLETED = ('remote.fetch_completed', 'remote.publish_completed', 'remote.sync_completed', 'checkpoint.restored', 'workspace.created',
             'workspace.removed', 'workspace.switched')


def order_for(fam):
    s = short(fam)
    if s in STARTED:
        return ['source_commit', 'append', 'receipt_resolved', 'fact_cas', 'expose', 'native_dispatch']
    if s in COMPLETED:
        return ['native_outcome', 'source_commit', 'append', 'receipt_resolved', 'fact_cas', 'expose', 'terminal_publication']
    return ['source_commit', 'append', 'receipt_resolved', 'fact_cas', 'expose']


def operation(fam):
    k = key(fam)
    return {'owner_operation_id': 'op.' + k + '.0001', 'accepted': True, 'command_instance_id': 'cmdi.' + k + '.1',
            'request_idempotency_key': 'reqkey.' + k + '.1', 'result_ref': 'result:' + k + ':1',
            'native_evidence_refs': ['native:' + k + ':evidence:1', 'native:' + k + ':evidence:2'], 'occurred_at_utc': OCCURRED}


def make_pack(value, media):
    raw = vbytes(value)
    return {'payload_id': blake3.blake3(raw).hexdigest(), 'byte_size': len(raw), 'media_type': media, 'bytes_hex': raw.hex()}


def build(fam, path='append', variant='base', payload_over=None, body_over=None, native_over=None, world_over=None, op_over=None,
          request_fn=None, event_over=None, sid=SID, long_evidence=False, eid_over=None, ikey_over=None, fact_sid=None,
          fact_project=None, fact_op=None):
    """One coherent scenario. payload_over changes the committed source payload (every copy follows; owner authority
    does not); native_over/world_over/op_over change owner authority only; request_fn edits the original request
    before commitment; event_over sets envelope fields the event carries on its own (lineage, times, policy)."""
    op = operation(fam)
    op.update(op_over or {})
    n = native_values(fam, variant)
    world = world_values(fam, variant, n)
    auth, gens = authority(fam)
    req = original_request(fam, variant, n, op, auth, world)
    if request_fn:
        req = request_fn(req)
    payload = {'schema_id': W.spec(fam)['payload_schema_id'], 'schema_version': '1.0.0'}
    for f in W.payload_fields(fam):
        if f in ('schema_id', 'schema_version'):
            continue
        if f == 'owner_operation_id':
            payload[f] = op['owner_operation_id']
        elif f == 'source_fact_ref':
            payload[f] = None
        else:
            payload[f] = copy.deepcopy(n[f])
    for f, v in (payload_over or {}).items():
        if v is _DELETE:
            payload.pop(f, None)
        else:
            payload[f] = copy.deepcopy(v)
    proj, opid = payload.get('project_id'), payload.get('owner_operation_id')
    f_sid, f_proj, f_op = fact_sid or sid, fact_project or proj, fact_op or opid
    fkey = fact_key(fam, f_sid, f_proj, f_op)
    if 'source_fact_ref' in payload and payload['source_fact_ref'] is None:
        payload['source_fact_ref'] = fkey
    refs = list(op['native_evidence_refs'])
    if long_evidence:
        refs = ['native:' + key(fam) + ':evidence:' + str(i) + ':' + H(str(i)) * 3 for i in range(80)]
        op['native_evidence_refs'] = refs
    body = {'payload': payload, 'original_request': req, 'native_evidence_refs': refs, 'original_owner_result_ref': op['result_ref']}
    for f, v in (body_over or {}).items():
        body[f] = v
    eid, ikey = eid_over or event_id(fam, sid, proj, opid), ikey_over or idem_key(fam, sid, proj, opid)
    native = {k: copy.deepcopy(v) for k, v in n.items()}
    native.update(native_over or {})
    op['source_commitment'] = sha(body)
    lin = lineage(fam)
    event = {'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': 'project', 'event_id': eid, 'event_type': fam,
             'project_id': proj, 'occurred_at_utc': OCCURRED, 'observed_at_utc': OBSERVED, 'persisted_at_utc': PERSISTED,
             'sequence_id': SEQ, 'producer_sequence_id': 7, 'idempotency_key': ikey, 'payload_schema_id': W.spec(fam)['payload_schema_id'],
             'payload': copy.deepcopy(payload), 'payload_ref': None, 'redaction_profile': 'no_secrets',
             'replay_policy': 'dedupe_by_idempotency_key',
             'migration': {'migrated_from_schema_id': None, 'migrated_from_schema_version': None, 'migration_id': None,
                           'compatibility_event_type': None}}
    event.update({k: lin[k] for k in W.LINEAGE_FIELDS})
    for f, v in (event_over or {}).items():
        event[f] = v
    pack = None
    if len(vbytes(event['payload'])) > 16384:
        pack = make_pack(event['payload'], PACK_MEDIA)
        event['payload_ref'] = 'sp337:blake3:' + pack['payload_id']
    fact = {'schema_id': 'pm.storage_value.source_control_event.' + key(fam) + '.fact.v1', 'schema_version': '1.0.0',
            'storage_instance_id': f_sid, 'project_id': f_proj, 'event_type': fam, 'owner_operation_id': f_op, 'event_id': eid,
            'idempotency_key': ikey, 'phase': 'source_committed', 'source_body': body, 'source_body_ref': None,
            'first_append_receipt_ref': None}
    source_pack = None
    if len(vbytes(fact)) > 16384:
        sp = make_pack(body, SOURCE_MEDIA)
        source_pack = {'bytes_hex': sp['bytes_hex']}
        fact['source_body'] = None
        fact['source_body_ref'] = {'blake3_id': sp['payload_id'], 'byte_size': sp['byte_size'], 'media_type': SOURCE_MEDIA}
    receipt = {'event_id': eid, 'sequence_id': event['sequence_id'] if type(event['sequence_id']) is int else SEQ, 'segment_generation': 3,
               'segment_name': 'seg-000003', 'byte_offset': 1024, 'commit_group_id': 'cg.' + key(fam) + '.1', 'durability_class': 'ordinary',
               'durable_end_offset': 4096, 'durability_state': 'synced', 'manifest_generation': 3, 'acknowledged_at_utc': ACK}
    issued_fact = dict(copy.deepcopy(fact), phase='issued', first_append_receipt_ref=receipt_ref(sid, eid))
    owner = {'storage_instance_id': SID, 'server_id': SERVER, 'project_id': PROJECT, 'operation': op, 'native': native, 'world': world,
             'lineage': lin, 'authority': auth, 'current_generation': gens}
    for f, v in (world_over or {}).items():
        owner['world'][f] = v
    durable = ([pack['payload_id']] if pack else []) + ([fact['source_body_ref']['blake3_id']] if source_pack else [])
    sc = {'path': path, 'family': fam, 'event': event, 'pack': pack, 'durable_packs': durable,
          'fact': fact, 'fact_key': fkey, 'source_pack': source_pack, 'owner': owner, 'producer': W.spec(fam)['producer'],
          'admission': {'family': fam, 'version': '1.0.0', 'writer_granted': True, 'writer_withdrawn': False,
                        'retention_policy_ref': W.spec(fam)['retention'][1]},
          'target': {'scope_partition': partition(proj) if type(proj) is str else None, 'storage_instance_id': SID},
          'storage_issued': {'sequence_id': event['sequence_id'], 'observed_at_utc': event['observed_at_utc'],
                             'persisted_at_utc': event['persisted_at_utc'], 'receipt': receipt},
          'publication': {'custody': {'storage_instance_id': SID, 'event_id': eid, 'receipt': copy.deepcopy(receipt),
                                      'full_value_sha256': _safe(full_value_commitment, event),
                                      'producer_semantic_sha256': _safe(producer_semantic_digest, event)},
                          'fact_after': issued_fact, 'cas_expected': {'phase': 'source_committed', 'first_append_receipt_ref': None},
                          'order': order_for(fam)}}
    held = {'event_id': eid, 'receipt': copy.deepcopy(receipt), 'full_value_sha256': sc['publication']['custody']['full_value_sha256'],
            'producer_semantic_sha256': sc['publication']['custody']['producer_semantic_sha256']}
    sc['_original'] = {'event': copy.deepcopy(event), 'fact': issued_fact, 'custody': held}
    return sc


_DELETE = object()


def _safe(fn, value):
    try:
        return fn(value)
    except Exception:  # noqa: BLE001 - an unencodable value has no commitment; the checker refuses it at its row
        return None


def resync_event(sc):
    """After a change to the event alone: Storage's issued values follow the event's Storage fields only where Storage
    issued them; custody digests, the held original and the receipt commit the event as appended."""
    e = sc['event']
    cust = sc['publication']['custody']
    cust['full_value_sha256'] = _safe(full_value_commitment, e)
    cust['producer_semantic_sha256'] = _safe(producer_semantic_digest, e)
    sc['_original']['event'] = copy.deepcopy(e)
    sc['_original']['custody'].update({'full_value_sha256': cust['full_value_sha256'],
                                       'producer_semantic_sha256': cust['producer_semantic_sha256']})
    return sc


def resync_fact_after(sc):
    """After a change to the stored fact alone: the CAS post-state is that fact moved to issued."""
    eid = sc['event']['event_id']
    sc['publication']['fact_after'] = dict(copy.deepcopy(sc['fact']), phase='issued', first_append_receipt_ref=receipt_ref(SID, eid))
    sc['_original']['fact'] = copy.deepcopy(sc['publication']['fact_after'])
    return sc


def append_case(sc):
    sc = copy.deepcopy(sc)
    sc.pop('_original')
    return sc


def retry_case(sc, candidate_over=None, original=None):
    """A retry of the same identity: the candidate carries Storage's new sequence/times; Storage holds the original."""
    out = {'path': 'retry', 'family': sc['family'], 'owner': _owner_min(sc), 'pack': sc['pack'], 'durable_packs': sc['durable_packs'],
           'storage': copy.deepcopy(original or sc['_original'])}
    cand = copy.deepcopy(sc['event'])
    cand.update({'sequence_id': SEQ + 50, 'observed_at_utc': '2026-11-05T10:20:00.001Z', 'persisted_at_utc': '2026-11-05T10:20:00.002Z'})
    cand.update(candidate_over or {})
    out['event'] = cand
    out['retry'] = {'comparison_recipe': 'cv317.producer_semantic.cv1100', 'recipe_selector': None,
                    'returned_receipt': copy.deepcopy(out['storage']['custody']['receipt']), 'effects': []}
    return out


def history_case(sc, original=None):
    """A passive retained read after live state changed: the writer grant is withdrawn and the live world moved on."""
    orig = copy.deepcopy(original or sc['_original'])
    owner = _owner_min(sc)
    owner['world'] = {'live_changed': True}
    out = {'path': 'history', 'family': sc['family'], 'owner': owner, 'event': copy.deepcopy(orig['event']), 'storage': orig,
           'admission': {'family': sc['family'], 'version': '1.0.0', 'writer_granted': False, 'writer_withdrawn': True,
                         'retention_policy_ref': sc['admission']['retention_policy_ref']},
           'reader': {'recipe_selector': None, 'permission': 'allow', 'project_state': 'active', 'holds': [], 'disposition': 'read',
                      'output_hex': vbytes(orig['event']).hex(), 'effects': {}}}
    return out


def recovery_case(sc, mode='issued'):
    """Recovery of a source_committed fact: issued original (CAS to issued) or unavailable original (fence)."""
    orig = copy.deepcopy(sc['_original'])
    orig['fact'] = copy.deepcopy(sc['fact'])
    out = {'path': 'recovery', 'family': sc['family'], 'owner': _owner_min(sc), 'fact': copy.deepcopy(sc['fact']), 'fact_key': sc['fact_key'],
           'source_pack': sc['source_pack'], 'durable_packs': list(sc['durable_packs']), 'event': copy.deepcopy(orig['event']), 'storage': orig,
           'recovery': {'proposed_phase': 'issued', 'proposed_receipt_ref': receipt_ref(SID, sc['event']['event_id']), 'minted_receipt': None,
                        'replacement_ack': None, 'fresh_operation': None, 'fresh_operation_admission_ref': None}}
    if mode == 'unavailable':
        out['recovery'].update({'proposed_phase': 'fenced', 'proposed_receipt_ref': None})
    if mode == 'fresh':
        out['recovery'].update({'fresh_operation': 'op.' + key(sc['family']) + '.0002',
                                'fresh_operation_admission_ref': 'sp286:fresh_operation:' + key(sc['family']) + ':2'})
    return out


def backup_case(sc):
    orig = sc['_original']
    fact = orig['fact']
    body = fact['source_body'] if fact['source_body'] is not None else None
    native = (list(body['native_evidence_refs']) + [body['original_owner_result_ref']]) if body else \
        list(sc['owner']['operation']['native_evidence_refs']) + [sc['owner']['operation']['result_ref']]
    packs = [x for x in ((sc['pack'] or {}).get('payload_id'), (fact.get('source_body_ref') or {}).get('blake3_id')) if x]
    return {'path': 'backup', 'family': sc['family'], 'owner': _owner_min(sc),
            'backup': {'fact_key': sc['fact_key'], 'fact': _fact_for_backup(fact, body, sc), 'event': copy.deepcopy(orig['event']),
                       'event_pack': copy.deepcopy(sc['pack']),
                       'closure': {'facts': [sc['fact_key']], 'events': [orig['event']['event_id']], 'packs': packs,
                                   'receipts': [fact['first_append_receipt_ref']], 'native_refs': native}}}


def _fact_for_backup(fact, body, sc):
    f = copy.deepcopy(fact)
    if body is None and sc['source_pack'] is not None:
        f['source_body'] = None
    return f


def _owner_min(sc):
    o = copy.deepcopy(sc['owner'])
    return o


# ---------------------------------------------------------------------------------------------
# checkpoint scenarios (SP-278 publication over a global index with nonmatching rows and gaps)
# ---------------------------------------------------------------------------------------------
def selection(sid=SID, current='current-v1'):
    return {'storage_instance_id': sid, 'current_ref': 'storage/seglog/CURRENT', 'current_bytes_sha256': H(current),
            'selected_segment_generation': 3, 'manifest_ref': 'storage/seglog/manifest.v1.msgpack', 'manifest_bytes_sha256': H('manifest'),
            'manifest_generation': 3, 'recovery_epoch': 7, 'manifest_survivor_prefix_sha256': H('survivor'),
            'retained_inventory_sha256': H('inventory'), 'durable_watermarks_sha256': H('watermarks'), 'excluded_ranges_sha256': H('excluded'),
            'retired_inputs_sha256': H('retired')}


def publication(fam, frontier, rows):
    return {'checkpoint_ref': 'ckref:index:' + str(frontier), 'generation_id': 'eig_' + H('gen-' + str(frontier)),
            'generation_anchor_sha256': H('anchor-' + str(frontier)), 'frontier_revision': frontier, 'frontier_sha256': H('frontier-' + str(frontier)),
            'index_dataset_name': 'event_index.v1', 'source_selection': selection(), 'rows': rows}


def index_rows(fam, start, stop, empty=False):
    out = []
    pid = W.spec(fam)['payload_schema_id']
    other = 'source_control.backend.detected' if fam != 'source_control.backend.detected' else 'source_control.status.refreshed'
    for seq in range(start, stop + 1):
        m = seq % 6
        if m == 0 and not empty:
            op = 'op.' + key(fam) + '.%04d' % seq
            out.append({'sequence_id': seq, 'event_type': fam, 'payload_schema_id': pid, 'project_id': PROJECT,
                        'event_id': event_id(fam, SID, PROJECT, op), 'source_fact_ref': fact_key(fam, SID, PROJECT, op)})
        elif m == 1 and not empty:
            op = 'op.' + key(fam) + '.%04d' % seq
            out.append({'sequence_id': seq, 'event_type': fam, 'payload_schema_id': pid, 'project_id': OTHER_PROJECT,
                        'event_id': event_id(fam, SID, OTHER_PROJECT, op), 'source_fact_ref': fact_key(fam, SID, OTHER_PROJECT, op)})
        elif m == 3:
            out.append({'sequence_id': seq, 'gap': True})
        else:
            op = 'op.other.%04d' % seq
            out.append({'sequence_id': seq, 'event_type': other, 'payload_schema_id': W.spec(other)['payload_schema_id'], 'project_id': PROJECT,
                        'event_id': event_id(other, SID, PROJECT, op), 'source_fact_ref': fact_key(other, SID, PROJECT, op)})
    return out


def last_matching(fam, rows):
    m = [r for r in rows if not r.get('gap') and r['event_type'] == fam and r['project_id'] == PROJECT]
    return (m[-1]['event_id'], m[-1]['source_fact_ref']) if m else (None, None)


def ck_value(fam, pub, through, last):
    token = {'storage_instance_id': SID, 'checkpoint_key': ck_key(fam, SID, PROJECT)}
    for f in ('checkpoint_ref', 'generation_id', 'generation_anchor_sha256', 'frontier_revision', 'frontier_sha256', 'index_dataset_name',
              'source_selection'):
        token[f] = copy.deepcopy(pub[f])
    return {'schema_id': 'pm.storage_value.source_control_event.' + key(fam) + '.checkpoint.v1', 'schema_version': '1.0.0',
            'storage_instance_id': SID, 'project_id': PROJECT, 'event_type': fam,
            'consumer_id': 'projector.source_control.' + key(fam) + '.history.v1', 'consumer_version': '1.0.0', 'generic_token': token,
            'through_sequence_id': through, 'last_event_id': last[0], 'last_source_fact_ref': last[1]}


def checkpoint_case(fam, variant='base'):
    sc = build(fam)
    rows_all = index_rows(fam, 1, 40, empty=variant == 'empty')
    first = variant == 'first'
    prev_rows = [r for r in rows_all if r['sequence_id'] <= 20]
    prev_pub = publication(fam, 20, prev_rows)
    pub = publication(fam, 40, rows_all)
    pub['source_selection'] = selection(current='current-v2')
    stored = None if first else ck_value(fam, prev_pub, 20, last_matching(fam, prev_rows))
    nxt = ck_value(fam, pub, 40, last_matching(fam, rows_all))
    ck = {'key': ck_key(fam, SID, PROJECT), 'stored': stored, 'next': nxt, 'publication': pub,
          'live_current': {'current_bytes_sha256': pub['source_selection']['current_bytes_sha256'], 'frontier_revision': 40},
          'scanned': [r['sequence_id'] for r in rows_all],
          'cas': None if first else {'token': copy.deepcopy(stored['generic_token']), 'through_sequence_id': 20,
                                     'last_event_id': stored['last_event_id'], 'last_source_fact_ref': stored['last_source_fact_ref']},
          'single_transaction': True, 'read_authority': True, 'rebuild_source': 'canonical_retained',
          'successor': {'verified': True, 'reader': 'reader.source_control.' + key(fam) + '.history.v2@1.0.0'} if variant == 'successor' else None,
          'effects': {}}
    return {'path': 'checkpoint', 'family': fam, 'owner': _owner_min(sc), 'checkpoint': ck}


def install_case(fam):
    return {'path': 'install', 'family': fam, 'resource_changes': []}


# ---------------------------------------------------------------------------------------------
# JSON diff (a negative is stored as its base plus the exact changes)
# ---------------------------------------------------------------------------------------------
def esc(k):
    return str(k).replace('~', '~0').replace('/', '~1')


def diff(a, b, path=''):
    if type(a) is not type(b):
        return [[path, 'set', b]]
    if type(a) is dict:
        out = []
        for k in a:
            if k not in b:
                out.append([path + '/' + esc(k), 'delete'])
            else:
                out += diff(a[k], b[k], path + '/' + esc(k))
        for k in b:
            if k not in a:
                out.append([path + '/' + esc(k), 'set', b[k]])
        return out
    if type(a) is list:
        if len(a) != len(b):
            return [[path, 'set', b]]
        out = []
        for i, (x, y) in enumerate(zip(a, b)):
            out += diff(x, y, path + '/' + str(i))
        return out
    if type(a) is float:
        return [] if a.hex() == b.hex() else [[path, 'set', b]]
    return [] if a == b else [[path, 'set', b]]
