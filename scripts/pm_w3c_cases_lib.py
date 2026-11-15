"""W3C fixture construction (wave 3 phase 2): coherent scenarios built in owner order.

A scenario is derived stage by stage, exactly as the owners derive their copies: owner authority, the request,
predecessor and completed source records, the request instance, the payload, the formed EventRecord (whose CV-317
digest is frozen), the appended event, Storage's issuance, the canonical operation rows, then the path (retry,
retained history, checkpoint). A one-defect witness injects its single change at the stage that owns the value, so
every later copy, hash, key and commitment is derived from the changed value and nothing stale is left behind.

The identity recipes here are written independently from the owner text (TCME-1300..1319 "Identity and replay",
SP-13xx keys, Storage's reversible project~ partition); the checker has its own. Hashes, canonical bytes, CV-317
digests and CV-339 commitments use the shared NUMRULE helpers, which are not the code under test.
"""
from __future__ import annotations

import base64
import copy
import hashlib
import sys
from pathlib import Path

import blake3

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pm_event_numbers import EVENT_VALUE, full_value_commitment, producer_semantic_digest, storage_value_bytes  # noqa: E402
from pm_w3c_families import CLAUSES, FAMILIES, SUBJECT_ORDER  # noqa: E402

PACK_MEDIA = 'application/vnd.puppetmaster.event-payload+msgpack'
MEDIA = {'media:dvc:out': '00112233445566778899', 'media:prv:selected': 'a1a2a3a4a5', 'media:sgf:segment': '1a4fdfa3b0c1',
         'media:sgr:segment': '1a4fdfa3c0d1e2'}
REGISTRY_REVISION = 'unadmitted-proposal'


UNENCODABLE = '0' * 64   # a digest Storage could never issue: the event itself is not encodable (its own rows refuse first)


def safe_digest(event):
    from pm_event_numbers import Refusal
    try:
        return producer_semantic_digest(event)
    except Refusal:
        return UNENCODABLE


def safe_commitment(event):
    from pm_event_numbers import Refusal
    try:
        return full_value_commitment(event)
    except Refusal:
        return UNENCODABLE


def h(text):
    return text.encode('utf-8').hex()


def sha(value):
    return hashlib.sha256(storage_value_bytes(value, profile=EVENT_VALUE)).hexdigest()


def media_sha(hexbytes):
    return hashlib.sha256(bytes.fromhex(hexbytes)).hexdigest()


def part_of(scope, project_id):
    if scope == 'application':
        return 'app'
    return 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')


def event_id(sid, op, event_type):
    return 'w3c@1:' + h(sid) + ':' + h(op) + ':' + h(event_type)


def idem_key(scope, event_type, server_id, op):
    return ('application@1:' + h(server_id) + ':' + h(op)) if scope == 'application' else (event_type + '@1:' + h(op))


def op_key(fam, scope, sid, project_id, op):
    return '%s_operation%s:%s:%s:%s' % (FAMILIES[fam][1], '.application.v1' if scope == 'application' else '.v1', sid,
                                        part_of(scope, project_id), op)


def ck_key(fam, scope, sid, project_id, subject, generation):
    return '%s_checkpoint%s:%s:%s:%s:%s' % (FAMILIES[fam][1], '.application.v1' if scope == 'application' else '.v1', sid,
                                            part_of(scope, project_id), subject, generation)


def suffix(scope):
    return '.application.v1' if scope == 'application' else '.v1'


def storage_instance(fam, scope):
    n = list(FAMILIES).index(fam) * 2 + (1 if scope == 'application' else 0)
    return '6c3e2a10-%04x-4c7d-9a1b-%012x' % (n, 0x5eed0000 + n)


def make_pack(body):
    raw = storage_value_bytes(body, profile=EVENT_VALUE)
    pid = blake3.blake3(raw).hexdigest()
    return 'sp337:blake3:' + pid, {'bytes_hex': raw.hex(), 'byte_size': len(raw), 'payload_id': pid, 'media_type': PACK_MEDIA}


# ---------------------------------------------------------------------------------------------
# Pointers and staged edits
# ---------------------------------------------------------------------------------------------
def resolve_pointer(pointer, sc):
    if not pointer.startswith('@'):
        return pointer
    o = sc['owner']
    if pointer.startswith('@src/'):
        return '/owner/records/' + o['source_ref'] + pointer[4:]
    if pointer.startswith('@req/'):
        return '/owner/records/' + o['request_record_ref'] + pointer[4:]
    if pointer.startswith('@own/'):
        return '/owner' + pointer[4:]
    return pointer


DELETE = {'$delete': True}


def apply_edits(sc, edits, stage):
    for st, pointer, value in edits:
        if st != stage:
            continue
        if pointer is None:          # a whole-scenario edit (several coupled copies of one defect)
            value(sc, sc.get('_stash', {}))
            continue
        if callable(value):
            value = value(sc, sc.get('_stash', {}))
        parts = [p.replace('~1', '/').replace('~0', '~') for p in resolve_pointer(pointer, sc).split('/')[1:]]
        node = sc
        for part in parts[:-1]:
            node = node[int(part)] if type(node) is list else node[part]
        last = parts[-1]
        if value == DELETE:
            if type(node) is list:
                del node[int(last)]
            else:
                del node[last]
        elif type(node) is list:
            node[int(last)] = copy.deepcopy(value)
        else:
            node[last] = copy.deepcopy(value)


# ---------------------------------------------------------------------------------------------
# Owner facts and records
# ---------------------------------------------------------------------------------------------
def owner_base(fam, scope, variant):
    abbr = FAMILIES[fam][0]
    project = scope == 'project'
    o = {'storage_instance_id': storage_instance(fam, scope), 'server_id': 'srv-w3c-1',
         'project_id': 'proj-w3c-alpha' if project else None, 'project_home_server_id': 'srv-w3c-home' if project else None,
         'named_plan_id': None, 'owner_operation_id': 'op-' + abbr + '-1', 'host_id': 'host-w3c-1', 'environment_id': 'env-w3c-1',
         'occurred_at_utc': '2026-11-05T10:00:00Z', 'producer_sequence_id': 7, 'actor_ref': 'actor:user:w3c',
         'admission': {'family': fam, 'version': '1.0.0', 'schema_installed': True},
         'writer': {'generation': 3, 'stop_generation': 1, 'withdrawn': False},
         'permission': {'snapshot_ref': 'perm:' + abbr + ':snap', 'snapshot_id': 'perm-' + abbr + '-1', 'granted': True, 'generation': 1},
         'target': {'security_class': 'ordinary', 'generation': 4, 'host_id': 'host-w3c-1', 'environment_id': 'env-w3c-1'},
         'action_id': 'act-' + abbr + '-1', 'records': {}, 'media': {},
         'source_ref': 'rec:' + abbr + ':source', 'request_record_ref': 'rec:' + abbr + ':request',
         'predecessor_ref': ('rec:' + abbr + ':before') if FAMILIES[fam][6] else None}
    o['records']['rec:' + abbr + ':action_evidence'] = {'kind': 'action_evidence', 'action_id': o['action_id'], 'outcome': 'committed'}
    extra = {
        'cpi': {'evaluated_disposition': 'original_missing'},
        'dvc': {'admitted_raw_ids': ['raw-dvc-a', 'raw-dvc-b', 'raw-dvc-c'], 'media': {'media:dvc:out': MEDIA['media:dvc:out']}},
        'bkm': {'session': {'clock_domain': 'clk:sess-bkm-1', 'stream_id': 'stream-bkm'}},
        'eqc': {'governor': {'permit_ref': 'permit:eqc:1', 'reason': 'reason:thermal'}},
        'hrc': {'prior_finding_ref': 'finding:hrc:1'},
        'prj': {'evaluated_disposition': 'rejected_identity_mismatch'},
        'prv': {'subject_sha256': 'd' * 64, 'media': {'media:prv:selected': MEDIA['media:prv:selected']}},
        'red': {'redaction_policy_ref': 'policy:red:1'},
        'sgc': {'session': {'clock_domain': 'clk:sgc', 'stream_id': 'stream-sgc'}, 'journal': {'sequence': 7, 'previous_sha256': 'e' * 64, 'target_generation': 4, 'state': 'interrupted'}},
        'sgf': {'journal': {'sequence': 7, 'previous_sha256': 'e' * 64, 'target_generation': 4, 'state': 'clean'}, 'media': {'media:sgf:segment': MEDIA['media:sgf:segment']}},
        'sgr': {'journal': {'sequence': 7, 'previous_sha256': 'e' * 64, 'target_generation': 4, 'state': 'interrupted'}, 'media': {'media:sgr:segment': MEDIA['media:sgr:segment']}},
        'sta': {'capture_policy_ref': 'policy:sta:1', 'resource_permit_ref': 'permit:sta:1'},
        'sto': {'segments': ['seg-sto-1', 'seg-sto-2']},
        'rdy': {'required_fixture_ids': ['fx-1', 'fx-2']},
    }.get(abbr, {})
    for k, v in extra.items():
        if k == 'media':
            o['media'].update(v)
        else:
            o[k] = copy.deepcopy(v)
    if abbr == 'dvc' and (variant == 'append-sp337' or variant.endswith('+oversize')):
        o['admitted_raw_ids'] = big_raw_ids() + ['raw-dvc-c']
    if abbr == 'rdy':
        o['permission']['snapshot_ref'] = 'rec:rdy:permission'
        o['records'].update({
            'rec:rdy:configured': {'kind': 'configured_adapter', 'adapter_id': 'adapter-rdy-1', 'configured': True},
            'rec:rdy:probe': {'kind': 'capability_probe', 'adapter_id': 'adapter-rdy-1', 'target': 'target:rdy:1', 'available': True},
            'rec:rdy:permission': {'kind': 'permission_snapshot', 'project_id': o['project_id'], 'adapter_id': 'adapter-rdy-1', 'generation': 1},
            'rec:rdy:fixtures': {'kind': 'required_fixture_set', 'fixture_ids': ['fx-1', 'fx-2']},
            'rec:rdy:receipt_probe': {'kind': 'receipt_production_probe', 'complete_merged_receipt': True}})
    return o


def big_raw_ids():
    return ['raw-dvc-' + ('%03d' % i) + '-' + 'x' * 180 for i in range(90)]


def request_record(fam, o):
    abbr = FAMILIES[fam][0]
    base = {'kind': 'original_request', 'event_type': fam, 'owner_operation_id': o['owner_operation_id'], 'action_id': o['action_id']}
    base.update({
        'cpi': {'subject_ref': 'subj:cpi:1', 'candidate_capture_ids': ['cap-cpi-1', 'cap-cpi-2']},
        'dvc': {'command_id': 'cmd.artifacts.create_demonstration_video', 'privacy_confirmation': 'confirmed'},
        'dvf': {'command_id': 'cmd.artifacts.create_demonstration_video', 'command_instance_id': 'ci-dvf-1'},
        'bkm': {'command_id': 'cmd.testing.capture.bookmark', 'capture_session_id': 'sess-bkm-1', 'bookmark_monotonic_ns': 1500},
        'clp': {'command_id': 'cmd.testing.capture.save_clip', 'raw_capture_id': 'raw-clp-1', 'span': [100, 900]},
        'prj': {'subject_ref': 'subj:prj:1', 'candidate_capture_ids': ['cap-prj-1']},
        'prv': {'subject_ref': 'subj:prv:1', 'candidate_capture_ids': ['cap-prv-1', 'cap-prv-2', 'cap-prv-3']},
        'tgc': {'command_id': 'cmd.testing.capture.target.update', 'target_ref': 'target:tgc:new'},
    }.get(abbr, {'command_id': 'cmd.' + fam}))
    return base


def before_record(fam, o):
    abbr = FAMILIES[fam][0]
    return {'kind': 'predecessor_snapshot', 'event_type': fam, **{
        'eqc': {'quality': {'cadence_fps': 30, 'codec': 'av1', 'height': 720, 'width': 1280}},
        'hdg': {'health': 'healthy'}, 'hrc': {'health': 'degraded'}, 'int': {'state': 'recording'},
        'pau': {'state': 'recording', 'target_ref': 'target:pau:1', 'stream_lineage': 'lineage:pau:1'},
        'res': {'state': 'paused', 'target_ref': 'target:res:1', 'clock_lineage': 'clk:res:1'},
        'sto': {'state': 'recording'}, 'tgc': {'target_ref': 'target:tgc:old'}, 'rdy': {'state': 'runtime-disabled'},
    }[abbr]}


def source_record(fam, o, variant):
    abbr = FAMILIES[fam][0]
    if abbr == 'rdy':
        def ref(r):
            return {'record_ref': r, 'record_sha256': sha(o['records'][r])}
        return {'adapter_id': 'adapter-rdy-1', 'project_id': o['project_id'], 'prior_state': 'runtime-disabled', 'next_state': 'runtime-enabled',
                'configured_adapter_ref': ref('rec:rdy:configured'), 'capability_probe_ref': ref('rec:rdy:probe'),
                'permission_snapshot_ref': ref('rec:rdy:permission'), 'required_fixture_set_ref': ref('rec:rdy:fixtures'),
                'receipt_production_probe_ref': ref('rec:rdy:receipt_probe'), 'enabled_at_utc': o['occurred_at_utc'],
                'reason_code': 'adapter_ready', 'schema_id': 'pm.testing.adapter_readiness_source.v1', 'schema_version': '1.0.0',
                'record_kind': 'adapter_readiness_source'}
    s = {'schema_id': 'pm.w3c.fixture_source.' + abbr + '.v1', 'record_kind': fam}
    raw = big_raw_ids() if (abbr == 'dvc' and (variant == 'append-sp337' or variant.endswith('+oversize'))) else ['raw-dvc-a', 'raw-dvc-b']
    s.update({
        'cpi': {'selection_id': 'sel-cpi-1', 'subject_ref': 'subj:cpi:1', 'receipt_ref': 'rcpt:cpi:inspection',
                'candidate_capture_ids': ['cap-cpi-1', 'cap-cpi-2'], 'disposition': o.get('evaluated_disposition')},
        'dvc': {'demonstration_video_id': 'dv-dvc-1', 'manifest_ref': 'manifest:dvc:1', 'raw_capture_ids': raw,
                'spans': [{'raw_capture_id': r, 'subject_ref': 'subj:dvc', 'original': True, 'start_ns': 0, 'end_ns': 100} for r in raw],
                'manifest': {'uncaptured_state_introduced': False, 'overwrites_raw': False, 'immutable': True, 'privacy_review': 'accepted',
                             'output_sha256': media_sha(MEDIA['media:dvc:out'])},
                'media_ref': 'media:dvc:out', 'steps': ['encoded', 'finalized', 'published']},
        'dvf': {'command_id': 'cmd.artifacts.create_demonstration_video', 'command_instance_id': 'ci-dvf-1', 'error_code': 'encoder_failed',
                'receipt_ref': 'rcpt:dvf:failure', 'outcome': 'failure', 'encoder_exit_code': 3,
                'partial_media': {'disposition': 'quarantined', 'exposed_as_demonstration': False}},
        'bkm': {'command_id': 'cmd.testing.capture.bookmark', 'capture_session_id': 'sess-bkm-1', 'receipt_ref': 'rcpt:bkm:1', 'position_ns': 1500,
                'clock_domain': 'clk:sess-bkm-1', 'in_gap': False, 'gap_labeled': False},
        'clp': {'command_id': 'cmd.testing.capture.save_clip', 'capture_session_id': 'sess-clp-1', 'raw_capture_id': 'raw-clp-1',
                'clip_ref': 'clip:clp:1', 'manifest_ref': 'manifest:clp:1', 'span': [100, 900], 'privacy_review': 'accepted', 'clip_id': 'clip-clp-1',
                'manifest': {'span': [100, 900], 'overwrites_raw': False, 'uncaptured_state_introduced': False}},
        'eqc': {'capture_session_id': 'sess-eqc-1', 'receipt_id': 'hr-eqc-1', 'effective_quality_changed': True,
                'after_quality': {'cadence_fps': 15, 'codec': 'av1', 'height': 720, 'width': 1280}, 'governor_permit_ref': 'permit:eqc:1',
                'adaptation_reason': 'reason:thermal', 'retained_evidence_degraded': False},
        'hdg': {'capture_session_id': 'sess-hdg-1', 'receipt_id': 'hr-hdg-1', 'previous_state': 'healthy', 'current_state': 'degraded',
                'observation': {'interval_clock': 'clk:hdg', 'stream_id': 'stream-hdg', 'frame_counters': [10, 2], 'finding_ref': 'finding:hdg:1', 'session_id': 'sess-hdg-1'},
                'receipt': {'interval_clock': 'clk:hdg', 'stream_id': 'stream-hdg', 'frame_counters': [10, 2], 'finding_ref': 'finding:hdg:1', 'session_id': 'sess-hdg-1'}},
        'hrc': {'capture_session_id': 'sess-hrc-1', 'receipt_id': 'hr-hrc-1', 'previous_state': 'degraded', 'current_state': 'healthy',
                'observation_fresh': True, 'prior_finding_ref': o.get('prior_finding_ref'), 'erases_degraded': False, 'invented_frames': 0},
        'int': {'capture_session_id': 'sess-int-1', 'receipt_ref': 'rcpt:int:1', 'gap_manifest_ref': 'gap:int:1', 'cause': 'transport',
                'gap_disposition': 'gap_recorded', 'gap_filled_by': None},
        'pau': {'capture_session_id': 'sess-pau-1', 'receipt_ref': 'rcpt:pau:1', 'command_id': 'cmd.testing.capture.pause', 'prior_state': 'recording',
                'successor_state': 'paused', 'target_ref': 'target:pau:1', 'stream_lineage': 'lineage:pau:1', 'trigger': 'command'},
        'prj': {'selection_id': 'sel-prj-1', 'subject_ref': 'subj:prj:1', 'disposition': o.get('evaluated_disposition'), 'exposed_as': None},
        'prv': {'selection_id': 'sel-prv-1', 'subject_ref': 'subj:prv:1', 'selected_capture_id': 'cap-prv-2', 'disposition': 'selected',
                'identity_verified': True, 'continuity_verified': True, 'original_available': True, 'reenactment_substituted': False,
                'subject_sha256': o.get('subject_sha256'), 'content_sha256': media_sha(MEDIA['media:prv:selected']), 'media_ref': 'media:prv:selected'},
        'red': {'capture_session_id': 'sess-red-1', 'capture_artifact_id': 'art-red-1', 'receipt_ref': 'rcpt:red:1', 'stage': 'encoder',
                'policy_ref': 'policy:red:1', 'privacy_review': 'accepted', 'masked_spans': [[10, 20]], 'duration': 100,
                'output': {'masked_spans': [[10, 20]], 'unmasked_disclosed': [[0, 10], [20, 100]]}, 'raw_overwritten': False, 'raw_id': 'raw-red-1'},
        'res': {'capture_session_id': 'sess-res-1', 'receipt_ref': 'rcpt:res:1', 'command_id': 'cmd.testing.capture.resume', 'prior_state': 'paused',
                'successor_state': 'recording', 'target_ref': 'target:res:1', 'clock_lineage': 'clk:res:1', 'discontinuity': False, 'gap_labeled': False},
        'sgc': {'capture_session_id': 'sess-sgc-1', 'segment_id': 'seg-sgc-7', 'corruption_detected': True, 'disposition': 'quarantined_corrupt',
                'stream_id': 'stream-sgc', 'sequence': 7, 'previous_sha256': 'e' * 64, 'media_invented': False},
        'sgf': {'capture_session_id': 'sess-sgf-1', 'segment_id': 'seg-sgf-7', 'container': 'matroska', 'starts_with_keyframe': True, 'immutable': True,
                'finalization_state': 'finalized', 'recovery_disposition': None, 'media_ref': 'media:sgf:segment',
                'media_sha256': media_sha(MEDIA['media:sgf:segment']), 'byte_size': len(bytes.fromhex(MEDIA['media:sgf:segment'])),
                'sequence': 7, 'previous_sha256': 'e' * 64, 'target_generation': 4},
        'sgr': {'capture_session_id': 'sess-sgr-1', 'segment_id': 'seg-sgr-7', 'receipt_ref': 'rcpt:sgr:1', 'recovery_disposition': 'recovered_finalized',
                'finalization_evidence_ref': 'evidence:sgr:1', 'previous_sha256': 'e' * 64, 'media_ref': 'media:sgr:segment',
                'media_sha256': media_sha(MEDIA['media:sgr:segment']), 'gap_filled': False},
        'sta': {'capture_session_id': 'sess-sta-1', 'receipt_ref': 'rcpt:sta:1', 'command_id': 'cmd.testing.capture.start',
                'steps': ['intent', 'admitted', 'recording'], 'target_class': 'ordinary', 'target_generation': o['target']['generation'],
                'policy_ref': o.get('capture_policy_ref'), 'permit_ref': o.get('resource_permit_ref'), 'encoders': 1,
                'audio_on': False, 'audio_grant_current': False},
        'sto': {'capture_session_id': 'sess-sto-1', 'receipt_ref': 'rcpt:sto:1', 'command_id': 'cmd.testing.capture.stop', 'prior_state': 'recording',
                'steps': ['finalizing', 'terminal'], 'segments_accounted': ['seg-sto-1', 'seg-sto-2'], 'outcome': 'partial', 'media_complete': False,
                'implies_test_passed': False, 'implies_motion_verified': False, 'implies_provenance_accepted': False},
        'tgc': {'capture_session_id': 'sess-tgc-1', 'switch_id': 'switch-tgc-1', 'switch_kind': 'cmd.testing.capture.target.update',
                'focus_triggered': False, 'old_target': 'target:tgc:old', 'new_target': 'target:tgc:new', 'switch_ns': 1000,
                'first_frame_ns': 1200, 'widened': False},
    }[abbr])
    return s


def scope_obj(o, scope):
    return {'schema_id': 'pm.workflow_scope.v2', 'schema_version': '2.0.0', 'scope_kind': scope,
            'scope_partition': part_of(scope, o['project_id']), 'project_id': o['project_id'],
            'project_home_server_id': o['project_home_server_id'], 'named_plan_id': o['named_plan_id'], 'server_id': o['server_id']}


def src_ref(o, ref):
    return {'record_ref': ref, 'record_sha256': sha(o['records'][ref])}


def request_instance(fam, scope, o):
    return {'schema_id': 'pm.operation_request.' + fam + suffix(scope), 'schema_version': '1.0.0', 'event_type': fam,
            'owner_operation_id': o['owner_operation_id'], 'scope': scope_obj(o, scope),
            'before_record': None if o['predecessor_ref'] is None else src_ref(o, o['predecessor_ref']),
            'permission_snapshot_ref': o['permission']['snapshot_ref'], 'request_record': src_ref(o, o['request_record_ref'])}


def join_value(fam, o, key):
    if key == '@permission_snapshot_id':
        return o['permission']['snapshot_id']
    node = o['records'][o['source_ref']]
    for part in (key if type(key) is list else [key]):
        node = node[part]
    return copy.deepcopy(node)


def make_payload(fam, scope, o):
    p = {'schema_id': 'pm.event_payload.' + fam + suffix(scope), 'schema_version': '1.0.0', 'event_type': fam,
         'owner_operation_id': o['owner_operation_id'], 'scope': scope_obj(o, scope), 'source_record': src_ref(o, o['source_ref']),
         'before_record': None if o['predecessor_ref'] is None else src_ref(o, o['predecessor_ref']),
         'permission_snapshot_ref': o['permission']['snapshot_ref']}
    for field, key in FAMILIES[fam][7]:
        p[field] = join_value(fam, o, key)
    return p


ISSUED = {'sequence_id': 41, 'observed_at_utc': '2026-11-05T10:00:01Z', 'persisted_at_utc': '2026-11-05T10:00:01Z',
          'acknowledged_at_utc': '2026-11-05T10:00:02Z', 'segment_ref': 'seglog/segment-000041'}


def make_event(fam, scope, o, payload, issued, payload_ref=None):
    return {'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': scope,
            'event_id': event_id(o['storage_instance_id'], o['owner_operation_id'], fam), 'event_type': fam,
            'project_id': o['project_id'], 'thread_id': None, 'run_id': None, 'node_id': None, 'attempt_id': None,
            'actor_ref': o['actor_ref'], 'requested_account_ref': None, 'effective_account_ref': None,
            'occurred_at_utc': o['occurred_at_utc'], 'observed_at_utc': issued['observed_at_utc'],
            'persisted_at_utc': issued['persisted_at_utc'], 'sequence_id': issued['sequence_id'],
            'producer_sequence_id': o['producer_sequence_id'], 'correlation_id': 'corr:' + o['owner_operation_id'],
            'causation_event_id': None, 'parent_event_id': None,
            'idempotency_key': idem_key(scope, fam, o['server_id'], o['owner_operation_id']),
            'payload_schema_id': 'pm.event_payload.' + fam + suffix(scope), 'payload': payload, 'payload_ref': payload_ref,
            'redaction_profile': 'no_secrets', 'replay_policy': 'append_once',
            'migration': {'migrated_from_schema_id': None, 'migrated_from_schema_version': None, 'migration_id': None,
                          'compatibility_event_type': None}}


def make_result(event, issued):
    return {'first_append_receipt': {'event_id': event['event_id'], 'sequence_id': issued['sequence_id'], 'segment_generation': 3,
                                     'segment_name': 'segment-000041', 'byte_offset': 4096, 'commit_group_id': 'cg-41',
                                     'durability_class': 'barrier', 'durable_end_offset': 8192, 'durability_state': 'synced',
                                     'manifest_generation': 5, 'acknowledged_at_utc': issued['acknowledged_at_utc']},
            'original_segment_ref': issued['segment_ref'],
            'original_event_value_commitment': {'schema_id': 'pm.storage.original_event_value_commitment.v1', 'schema_version': '1.0.0',
                                                'codec': EVENT_VALUE, 'domain': 'pm.storage.original_event_value_commitment.v1',
                                                'event_schema_id': 'pm.event.v0', 'event_schema_version': '2.0.0',
                                                'sha256': safe_commitment(event)}}


def op_row(fam, scope, o, request, phase, outcome=None, preimage=None, result=None, event=None, intent=None, original=None):
    request, outcome, preimage, result, event = [copy.deepcopy(x) for x in (request, outcome, preimage, result, event)]
    return {'schema_id': 'pm.storage_value.' + FAMILIES[fam][1] + '_operation' + suffix(scope), 'schema_version': '1.0.0',
            'storage_instance_id': o['storage_instance_id'], 'owner_operation_id': o['owner_operation_id'], 'scope': scope_obj(o, scope),
            'intent': intent or {'mode': 'inline', 'value': request}, 'phase': phase,
            'first_append': result if phase in ('event_committed', 'terminal') or (phase == 'withdrawn' and result is not None) else None,
            'outcome_record': outcome, 'producer_semantics': preimage,
            'original_event': original if original is not None else (None if event is None else {'mode': 'inline', 'value': event})}


def token_of(sid):
    return {'storage_instance_id': sid, 'checkpoint_key': 'event_index_full.v1:' + sid, 'checkpoint_ref': 'ckref:event-index:' + sid,
            'generation_id': 'eig_' + 'f' * 64, 'generation_anchor_sha256': '1' * 64, 'frontier_revision': 12, 'frontier_sha256': '2' * 64,
            'index_dataset_name': 'event_index',
            'source_selection': {'storage_instance_id': sid, 'current_ref': 'storage/seglog/CURRENT', 'current_bytes_sha256': '3' * 64,
                                 'selected_segment_generation': 3, 'manifest_ref': 'storage/seglog/manifest.v1.msgpack',
                                 'manifest_bytes_sha256': '4' * 64, 'manifest_generation': 5, 'recovery_epoch': 1,
                                 'manifest_survivor_prefix_sha256': '5' * 64, 'retained_inventory_sha256': '6' * 64,
                                 'durable_watermarks_sha256': '7' * 64, 'excluded_ranges_sha256': '8' * 64, 'retired_inputs_sha256': '9' * 64}}


def subject(payload):
    return [payload[k] for k in SUBJECT_ORDER if k in payload][0]


# ---------------------------------------------------------------------------------------------
# The staged build
# ---------------------------------------------------------------------------------------------
def build(fam, scope, path, variant, edits=(), manifest=None):
    """One complete scenario. ``edits`` are (stage, pointer, value) applied at their stage; a variant may carry
    the flag ``+oversize`` (an owner-valid demonstration body above 16 KiB)."""
    sc = build_inner(fam, scope, path, variant, edits, manifest)
    sc.pop('_stash', None)
    return sc


def build_inner(fam, scope, path, variant, edits, manifest):
    abbr = FAMILIES[fam][0]
    sc = {'path': path, 'family': fam, 'scope': scope, '_stash': {}}
    o = owner_base(fam, scope, variant)
    sc['owner'] = o
    apply_edits(sc, edits, 'owner')
    o = sc['owner']
    o['records'][o['request_record_ref']] = request_record(fam, o)
    if o['predecessor_ref'] is not None:
        o['records'][o['predecessor_ref']] = before_record(fam, o)
    apply_edits(sc, edits, 'request')
    o['records'][o['source_ref']] = source_record(fam, o, variant)
    apply_edits(sc, edits, 'source')
    o['request'] = request_instance(fam, scope, o)
    apply_edits(sc, edits, 'request_instance')
    sc['commit_check'] = {'writer_generation': o['writer']['generation'], 'stop_generation': o['writer']['stop_generation'],
                          'permission_generation': o['permission']['generation'], 'target_generation': o['target']['generation']}
    if path == 'records':
        import json
        defs = json.loads((Path(__file__).resolve().parents[1] / 'Plans/test_capture_application_records.schema.json').read_text())['$defs']
        name = variant.split('/', 1)[1]
        for k in [k for k in list(sc) if k not in ('path', 'family', 'scope')]:
            sc.pop(k)
        sc.update(record_def=name, record=minimal_record(defs, name))
        apply_edits(sc, edits, 'final')
        return sc
    if path == 'install':
        sc.pop('commit_check')
        sc['resources'] = 'repository'
        apply_edits(sc, edits, 'final')
        return sc
    payload = make_payload(fam, scope, o)
    sc['event'] = {'payload': payload}
    apply_edits(sc, edits, 'payload')
    payload = sc['event']['payload']
    issued = dict(ISSUED)
    if variant == 'append-ack-offset':
        issued['acknowledged_at_utc'] = '2026-11-05T12:00:02+02:00'
    elif variant == 'append-ack-lowerz':
        issued['acknowledged_at_utc'] = '2026-11-05t10:00:02z'
    sc['packs'] = {}
    payload_ref = None
    if variant == 'append-sp337':
        body = copy.deepcopy(payload)
        sc['packbody'] = body
        apply_edits(sc, edits, 'packbody')
        payload_ref, pack = make_pack(sc.pop('packbody'))
        sc['packs'][payload_ref] = pack
    formed = make_event(fam, scope, o, payload, issued, payload_ref)
    sc['event'] = formed
    apply_edits(sc, edits, 'event')
    formed = sc['event']
    frozen = {'record_ref': 'rec:' + abbr + ':preimage', 'record_sha256': safe_digest(formed)}
    outcome = {'record_ref': o['source_ref'], 'record_sha256': sha(o['records'][o['source_ref']])}
    sc['_stash'].update(formed=copy.deepcopy(formed), frozen=frozen, outcome=outcome)
    sc['event'] = copy.deepcopy(formed)
    apply_edits(sc, edits, 'appended')
    appended = sc['event']
    sc['storage'] = {'issued': dict(issued, result=make_result(copy.deepcopy(appended), issued), event=copy.deepcopy(appended))}
    apply_edits(sc, edits, 'storage')
    result = sc['storage']['issued']['result']
    sc['_stash'].update(appended=copy.deepcopy(appended), result=copy.deepcopy(result))
    request = o['request']
    variant = variant.split('+')[0]
    rows = {'pending': op_row(fam, scope, o, request, 'pending'),
            'outcome_committed': op_row(fam, scope, o, request, 'outcome_committed', outcome, frozen),
            'event_committed': op_row(fam, scope, o, request, 'event_committed', outcome, frozen, result, appended),
            'terminal': op_row(fam, scope, o, request, 'terminal', outcome, frozen, result, appended)}
    sc['publication'] = ['flush', 'receipt', 'event_committed', 'terminal', 'publish']
    if path == 'append':
        sc['operation'] = rows['event_committed']
        apply_edits(sc, edits, 'operation')
        apply_edits(sc, edits, 'final')
        return sc
    sc.pop('publication')
    if path == 'retry':
        return build_retry(sc, fam, scope, o, variant, rows, formed, appended, result, edits, manifest)
    if path == 'history':
        sc.pop('commit_check')
        return build_history(sc, fam, scope, o, variant, appended, result, edits, manifest)
    if path == 'operation':
        return build_operation(sc, fam, scope, o, variant, rows, formed, appended, result, request, outcome, frozen, edits)
    if path == 'checkpoint':
        sc.pop('commit_check')
        return build_checkpoint(sc, fam, scope, o, variant, payload, appended, edits)
    raise ValueError(path)


def sealed_receipt(sid, original, manifest):
    from pm_event_numbers import Refusal
    try:
        commitment = hashlib.sha256(storage_value_bytes(original, profile=EVENT_VALUE)).hexdigest()
    except Refusal:
        commitment = UNENCODABLE
    return {'storage_instance_id': sid, 'scope_kind': original['scope_kind'], 'event_type': original['event_type'],
            'event_id': original['event_id'], 'source_commitment': commitment, 'recipe': 'w3c@1',
            'resource_manifest_sha256': manifest,
            'admission': {'family': original['event_type'], 'version': '1.0.0', 'registry_revision': REGISTRY_REVISION}}


def custody_store(sc, o, original, result, edits, manifest):
    held = {'result': result, 'full_value_sha256': safe_commitment(original),
            'producer_semantic_sha256': safe_digest(original), 'event_id': original['event_id']}
    sc['storage'] = {'custody': {'storage_instance_id': o['storage_instance_id'], 'service': 'sealed', 'original': copy.deepcopy(original),
                                 'held': held, 'sealed_receipts': []}}
    apply_edits(sc, edits, 'custody')
    store = sc['storage']['custody']
    store['sealed_receipts'] = [sealed_receipt(o['storage_instance_id'], store['original'], manifest)]


def build_retry(sc, fam, scope, o, variant, rows, formed, appended, result, edits, manifest):
    phase = {'retry-pending': 'pending', 'retry-bound': 'outcome_committed', 'retry-committed': 'event_committed',
             'retry-terminal': 'terminal', 'retry-storage-differs': 'event_committed'}[variant]
    existing = rows[phase]
    candidate = None
    if phase != 'pending':
        candidate = copy.deepcopy(formed)
        if variant == 'retry-storage-differs':
            candidate.update({'sequence_id': 77, 'observed_at_utc': '2026-11-05T11:00:00Z', 'persisted_at_utc': '2026-11-05T11:00:00Z'})
    kind = {'pending': 'pending_recovery', 'outcome_committed': 'append_frozen'}.get(phase, 'original')
    sc['retry'] = {'request': copy.deepcopy(o['request']), 'effects': [], 'recipe_selector': None,
                   'result': {'kind': kind} if kind != 'original' else {'kind': 'original', 'value': copy.deepcopy(result)}}
    sc['event'] = candidate
    if phase in ('event_committed', 'terminal'):
        custody_store(sc, o, appended, result, edits, manifest)
        sc['storage']['existing'] = existing
    else:
        sc['storage'] = {'existing': existing}
    sc['storage']['dedupe'] = 'available'
    sc.pop('commit_check')
    apply_edits(sc, edits, 'final')
    return sc


def build_history(sc, fam, scope, o, variant, appended, result, edits, manifest):
    original = copy.deepcopy(appended)
    if variant == 'history-compat':
        original['replay_policy'] = 'projector_replay_only'
        result = make_result(original, ISSUED)
    if variant == 'history-compat':
        sc['event'] = copy.deepcopy(original)
    custody_store(sc, o, original, result, edits, manifest)
    sc['reader'] = {'recipe_selector': None, 'access': {'allowed': True, 'deleted': False, 'restricted': False}, 'withdrawn': False, 'effects': []}
    if variant == 'history-live-change':
        sc['owner']['writer']['withdrawn'] = True
        sc['owner']['permission']['granted'] = False
        sc['owner']['admission']['schema_installed'] = False
        sc['owner']['writer']['generation'] = 9
    apply_edits(sc, edits, 'final')
    return sc


def build_operation(sc, fam, scope, o, variant, rows, formed, appended, result, request, outcome, frozen, edits):
    abbr = FAMILIES[fam][0]
    pred_phase, succ_phase = {
        'op-first': (None, 'pending'), 'op-first-external': (None, 'pending'), 'op-bind': ('pending', 'outcome_committed'),
        'op-bind-recovery': ('pending', 'outcome_committed'), 'op-commit': ('outcome_committed', 'event_committed'),
        'op-commit-external': ('outcome_committed', 'event_committed'), 'op-commit-restore': ('outcome_committed', 'event_committed'),
        'op-terminal': ('event_committed', 'terminal'), 'op-withdraw-pending': ('pending', 'withdrawn'),
        'op-withdraw-outcome': ('outcome_committed', 'withdrawn'), 'op-withdraw-event': ('event_committed', 'withdrawn')}[variant]
    pred = None if pred_phase is None else copy.deepcopy(rows[pred_phase])
    if succ_phase == 'withdrawn':
        succ = copy.deepcopy(pred)
        succ['phase'] = 'withdrawn'
    else:
        succ = copy.deepcopy(rows[succ_phase])
    if variant == 'op-first-external':
        ref, pack = make_pack(request)
        sc['packs'][ref] = pack
        succ['intent'] = {'mode': 'external', 'payload_ref': ref}
    if variant in ('op-commit-external', 'op-commit-restore'):
        ref, pack = make_pack(appended)
        sc['packs'][ref] = pack
        succ['original_event'] = {'mode': 'external', 'payload_ref': ref}
    sc['event'] = formed if succ_phase == 'outcome_committed' else None
    action = None
    if variant == 'op-bind-recovery':
        action = {'action_id': o['action_id'], 'executions': 1, 'evidence_ref': 'rec:' + abbr + ':action_evidence'}
    sc['operation'] = {'predecessor': pred, 'successor': succ, 'cas_expected': None if pred is None else sha(pred),
                       'key': op_key(fam, scope, o['storage_instance_id'], o['project_id'], o['owner_operation_id']),
                       'action': action, 'steps': ['custody_resolved', 'terminal'], 'restore': None}
    if variant == 'op-commit-restore':
        sc['operation']['restore'] = {'storage_instance_id': o['storage_instance_id'], 'packs': sorted(sc['packs']), 'receipt_custody': True}
    if succ_phase != 'event_committed':
        sc.pop('storage', None)
    apply_edits(sc, edits, 'operation')
    apply_edits(sc, edits, 'final')
    return sc


def build_checkpoint(sc, fam, scope, o, variant, payload, appended, edits):
    abbr = FAMILIES[fam][0]
    sid = o['storage_instance_id']
    subj = subject(payload)
    empty = variant == 'ck-empty'
    proj = {'mode': 'empty'} if empty else {'mode': 'inline', 'value': copy.deepcopy(payload)}
    if variant == 'ck-external':
        ref, pack = make_pack(payload)
        sc['packs'][ref] = pack
        proj = {'mode': 'external', 'payload_ref': ref}
    state, anchor = ('retired', '2026-11-06T00:00:00Z') if variant == 'ck-retired' else ('current', None)
    row = {'schema_id': 'pm.storage_value.' + FAMILIES[fam][1] + '_checkpoint' + suffix(scope), 'schema_version': '1.0.0',
           'storage_instance_id': sid, 'scope': scope_obj(o, scope), 'subject_id': subj, 'reader_id': 'reader.' + fam,
           'reader_version': '1.0.0', 'event_type': fam, 'index_read_token': token_of(sid),
           'last_event_id': None if empty else appended['event_id'], 'last_sequence_id': None if empty else appended['sequence_id'],
           'projection': proj, 'generation_id': 'gen-' + abbr + '-1', 'generation_state': state, 'first_retired_at_utc': anchor,
           'predecessor_sha256': None}
    predecessor = None
    if variant == 'ck-advance':
        predecessor = copy.deepcopy(row)
        predecessor.update({'projection': {'mode': 'empty'}, 'last_event_id': None, 'last_sequence_id': None})
    elif variant == 'ck-retired':
        predecessor = copy.deepcopy(row)
    if predecessor is not None:
        row['predecessor_sha256'] = sha(predecessor)
    sc.pop('event', None)
    sc.pop('storage', None)
    sc['checkpoint'] = {'row': row, 'predecessor': predecessor, 'query_subject': subj}
    apply_edits(sc, edits, 'ckrow')
    row = sc['checkpoint']['row']
    if sc['checkpoint']['predecessor'] is not None:
        row['predecessor_sha256'] = sha(sc['checkpoint']['predecessor'])
    matching = [] if empty else [{'event_id': appended['event_id'], 'sequence_id': appended['sequence_id'], 'payload': copy.deepcopy(payload)}]
    sc['checkpoint'].update({
        'key': ck_key(fam, scope, sid, o['project_id'], row['subject_id'], row['generation_id']),
        'storage_token': token_of(sid),
        'coverage': {'token': copy.deepcopy(row['index_read_token']), 'event_type': fam, 'version': '1.0.0',
                     'scope_partition': part_of(scope, o['project_id']), 'subject_id': subj, 'complete': True, 'gaps': [],
                     'scanned': 12, 'index_count': 12, 'matching': matching},
        'transactions': 1, 'steps': ['verify_coverage', 'publish'], 'generations': [{'generation_id': 'gen-' + abbr + '-0', 'state': 'retired'}],
        'effects': [], 'reader_withdrawn': False})
    apply_edits(sc, edits, 'final')
    return sc


def minimal_record(defs, name):
    """A minimal valid instance of one application record definition, with every optional timestamp property filled."""
    def gen(schema, top=False):
        if '$ref' in schema:
            ref = schema['$ref'].split('/')[-1]
            if ref == 'timestamp':
                return '2026-11-05T10:00:00Z'
            return gen(defs[ref])
        if 'const' in schema:
            return copy.deepcopy(schema['const'])
        if 'enum' in schema:
            return schema['enum'][0]
        for key in ('anyOf', 'oneOf'):
            if key in schema:
                options = [o for o in schema[key] if o.get('type') != 'null'] or schema[key]
                return gen(options[0])
        t = schema.get('type')
        if type(t) is list:
            t = [x for x in t if x != 'null'][0]
        if t == 'object' or 'properties' in schema:
            props = schema.get('properties', {})
            keys = list(schema.get('required', [])) + [k for k, v in props.items() if k not in schema.get('required', []) and
                                                         json_text(v).endswith('/timestamp"}')]
            return {k: gen(props[k]) for k in keys}
        if t == 'array':
            item = gen(schema.get('items', {}))
            return [item] if schema.get('minItems', 0) >= 1 else []
        if t == 'string':
            pat = schema.get('pattern', '')
            if '0-9a-f]{64}' in pat:
                return 'a' * 64
            if pat.startswith('^[A-Za-z][') :
                return 'ref:rec'
            return 'rec-1' if pat else 'x' * max(1, schema.get('minLength', 1))
        if t == 'integer':
            return max(0, schema.get('minimum', 0))
        if t == 'number':
            return schema['exclusiveMinimum'] + 1 if 'exclusiveMinimum' in schema else max(0, schema.get('minimum', 0))
        if t == 'boolean':
            return False
        return None
    return repair(gen(defs[name]), name)


def repair(instance, name):
    """Fill conditional requirements (if/then, contains, const) the minimal generator cannot see, guided by the
    validator's own errors, until the instance is valid. Raises if it cannot converge."""
    import re as _re
    from pm_w3c_event_oracles import RECORDS_ID, validator
    v = validator(RECORDS_ID + '#/$defs/' + name)
    for _ in range(40):
        errors = list(v.iter_errors(instance))
        if not errors:
            return instance
        e = errors[0]
        parent = instance
        for part in list(e.path)[:-1]:
            parent = parent[part]
        last = list(e.path)[-1] if e.path else None
        here = parent[last] if last is not None else instance
        if e.validator == 'required':
            missing = _re.match(r"'(.+)' is a required property", e.message).group(1)
            here[missing] = 'rec-1'
        elif e.validator == 'const':
            parent[last] = copy.deepcopy(e.validator_value)
        elif e.validator == 'contains':
            here.append(copy.deepcopy(e.validator_value.get('const')))
        elif e.validator == 'type':
            parent[last] = {'integer': 0, 'number': 1, 'string': 'rec-1', 'boolean': False, 'array': [], 'object': {}}[
                e.validator_value if type(e.validator_value) is str else e.validator_value[0]]
        else:
            raise ValueError('cannot repair %s: %s' % (name, e.message[:120]))
    raise ValueError('record did not converge: ' + name)


def json_text(v):
    import json
    return json.dumps(v)


def timestamp_pointers(defs, name, instance):
    """JSON pointers of every timestamp value in a generated instance (walking the definition beside it)."""
    out = []

    def walk(schema, value, ptr):
        if '$ref' in schema:
            ref = schema['$ref'].split('/')[-1]
            if ref == 'timestamp':
                out.append(ptr)
                return
            return walk(defs[ref], value, ptr)
        if type(value) is dict:
            for k, v in value.items():
                walk(schema.get('properties', {}).get(k, {}), v, ptr + '/' + k)
        elif type(value) is list:
            for i, v in enumerate(value):
                walk(schema.get('items', {}), v, ptr + '/' + str(i))
    walk(defs[name], instance, '')
    return out


def diff(base, new, pointer=''):
    """JSON changes turning base into new: [pointer, 'set', value] / [pointer, 'delete']."""
    if type(base) is dict and type(new) is dict:
        out = []
        for k in base:
            p = pointer + '/' + k.replace('~', '~0').replace('/', '~1')
            if k not in new:
                out.append([p, 'delete'])
            else:
                out += diff(base[k], new[k], p)
        for k in new:
            if k not in base:
                out.append([pointer + '/' + k.replace('~', '~0').replace('/', '~1'), 'set', new[k]])
        return out
    if type(base) is list and type(new) is list and len(base) == len(new):
        out = []
        for i, (a, b) in enumerate(zip(base, new)):
            out += diff(a, b, pointer + '/' + str(i))
        return out
    if type(base) is type(new) and base == new and (type(base) is not float or base.hex() == new.hex()):
        return []
    return [[pointer, 'set', new]]


__all__ = ['build', 'diff', 'CLAUSES', 'FAMILIES', 'DELETE', 'make_pack', 'sha', 'sealed_receipt', 'storage_instance', 'token_of']
