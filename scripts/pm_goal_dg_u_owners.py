#!/usr/bin/env python3
"""DG-U TEST_ONLY goal.updated owner composition on the shared owner adapters.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Newly authored explicitly versioned successor edition
``pm.goal.updated.dg_u.composition.v4`` (selection
``Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json``) for the
existing Project ``cmd.chat.goal.update`` behaviour under GRS-064/GRS-068,
SP-287, SP-299, SP-421, SIR-049, CV-342 and the DG-OWN-C U1-U7/W1 protocol.
It keeps the C3-W12 part 2 approved-agent semantics (actual agent message,
actual user instruction, actual protected person decision; Direct Save with
null approval/source message and no HITL call) and adopts the C3-W12a part 2
physical value edition ``pm.goal.updated.physical.v3@3.0.0`` unchanged for
every stored row. It is built on the shared TEST_ONLY adapters
(``pm_goal_test_storage``, ``pm_goal_test_owner_adapters``,
``pm_goal_test_source``, ``pm_goal_test_numrule``); nothing in them is edited.

Every owner here performs its modeled issuance from its own execution: ids
come from ``uuid4``, times from the world clock, sequences/Storage times from
the adapter Storage. Every durable value lives in the adapter Storage (cells,
packs, segment frames), so a fresh process can reopen the directory and
resume the original effect chain. Presented JSON, digests or refs never
become authority: owners resolve their own custody by their own keys.

Recipes (unchanged owners):
* GRS-064 ``pm.goal.canonical_json.v1`` semantic hashes (currentness,
  objective revision, control body bytes, pending/start intent);
* SP-287/SP-299 physical keys: lowercase hex of exact UTF-8 (this is the
  update-local and body-local key recipe, distinct from SP-311/SP-312 K(s));
* SP-421 event identity D = SHA256(JCS([...nine members...]));
* complete outer commitments (source audit, progress snapshot, reserved
  control, body receipt) are SHA-256 of the canonical MessagePack outer
  wrapper bytes (DL-270 re-derivation over MessagePack);
* CV-333 owner result hash: RFC 8785 of the typed result.
"""
from __future__ import annotations

import copy
import hashlib
import json
import os
from pathlib import Path
import secrets
import sys
import time
import uuid

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as GSRC

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
ROOT = NR.ROOT
EDITION = 'pm.goal.updated.dg_u.composition.v4'
EDITION_VERSION = '4.0.0'

UPDATE_URI = 'https://puppetmaster.local/schemas/goal_update_command_custody/1.0.0/goal_update_command_custody.schema.json'
CONSUMER_URI = 'https://puppetmaster.local/schemas/goal_updated_consumer_contracts/1.0.0/schema.json'
BODY_URI = 'https://puppetmaster.local/schemas/goal_body_custody/1.0.0/goal_body_custody.schema.json'
CANCEL_URI = 'https://puppetmaster.local/schemas/goal_cancel_command_custody/1.0.0/goal_cancel_command_custody.schema.json'
RUNTIME_URI = 'https://puppetmaster.local/schemas/goal_runtime_contracts/2.0.0/goal_runtime_contracts.schema.json'
PAYLOAD_URI = 'pm.goal_runtime_event.goal_updated.schema.v3'
EVENT_URI = 'https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json'
PHYS_URI = 'https://puppetmaster.local/schemas/goal_updated_physical/3.0.0/value.schema.json'
CONTRACTS_URI = 'https://puppetmaster.local/schemas/goal_own_c/1.0.0/contracts.schema.json'
CHECKPOINT_URI = 'https://puppetmaster.local/schemas/event_record_index_checkpoint/1.0.0/schema.json'
PHYS_PATH = 'Plans/goal_own_c_contracts/w12a-successor-v3/physical.schema.json'
PHYS_SHA = '506add0794a1ae50d85fa3c45eb45d63a93eb2736e67005e83e4738c19d394a7'
CONTRACTS_PATH = 'Plans/goal_own_c_contracts/contracts.schema.json'
CONTRACTS_SHA = '6cfc3868f485286d9fadbbab293b0407583b30e88a02f6f5e1334f77fa0ad84a'
MEDIA = 'application/vnd.puppetmaster.goal-value+msgpack'
CAP = S.STORED_PART_CAP
COMMAND = 'cmd.chat.goal.update'
RESULT_SCHEMA_REF = dict(path='Plans/goal_runtime_contracts.schema.json', json_pointer='#/$defs/GoalUpdateResultV2',
                         schema_id='pm.goal.update.result.v2')
EDITABLE = ('active', 'paused', 'blocked')
# SIR maps the actual Goal owner error to the central closed UICommandError code (CV-333).
CENTRAL_ERROR = {'invalid_request': 'invalid_args', 'goal_not_found': 'invalid_args',
                 'stale_goal_revision': 'stale_projection', 'stale_currentness': 'stale_projection',
                 'objective_too_long': 'invalid_args', 'approval_required': 'blocked_state_required',
                 'approval_not_resolved': 'blocked_state_required', 'manual_stop_latched': 'blocked_state_required',
                 'blocked_condition_unresolved': 'blocked_state_required', 'command_not_registered': 'unknown_command',
                 'permission_denied': 'permission_denied', 'owner_unavailable': 'handler_unavailable'}
OBJECTIVE_LIMIT = 4000

Refusal = A.AdapterRefusal
sha = A.sha256
# Guard-site hits for the shared guard-isolation inventory: code -> source lines that refused.
HITS = {}


def require(code, condition):
    if not condition:
        HITS.setdefault(code, set()).add(sys._getframe(1).f_lineno)
        raise Refusal(code)


def refuse(code):
    HITS.setdefault(code, set()).add(sys._getframe(1).f_lineno)
    raise Refusal(code)


def refusal_code(error):
    return A.refusal_code(error)


# ------------------------------------------------------------------ banks

def _manifest_entries(manifest):
    locs = json.loads((ROOT / 'Plans/goal_own_c_contracts/whole-root-banks.json').read_text())['whole_resource_locations']
    out = []
    for r in json.loads((ROOT / manifest).read_text())['resources']:
        path = locs.get('%s@%s' % (r['path'], r['sha256']), r['path'])
        out.append(dict(path=path, sha256=r['sha256'], retrieval_uri=r['retrieval_uri']))
    return out


_BANKS = {}


def banks():
    """(update bank, consumer bank): each its own isolated whole-resource bank,
    original bytes at original hashes, plus the selected W12a v3 physical value
    schema and the CV-1130 approval roots (update bank only)."""
    if not _BANKS:
        update = _manifest_entries('Plans/goal_update_schema_resources.json')
        update += [dict(path=PHYS_PATH, sha256=PHYS_SHA), dict(path=CONTRACTS_PATH, sha256=CONTRACTS_SHA)]
        consumer = _manifest_entries('Plans/goal_updated_consumer_resources.json')
        consumer += [dict(path=PHYS_PATH, sha256=PHYS_SHA)]
        _BANKS['update'] = A.RootBank(update)
        _BANKS['consumer'] = A.RootBank(consumer)
        pins = sorted(set((u, p) for b in (_BANKS['update'], _BANKS['consumer']) for u, p in b.pins.items()))
        _BANKS['graph_sha256'] = sha(NR.binding_value_bytes(
            ['pm.goal.updated.dg_u.installed_resource_graph.v4', EDITION] + [u + '@' + p for u, p in pins],
            'bank/graph'))
    return _BANKS['update'], _BANKS['consumer']


def graph_sha256():
    banks()
    return _BANKS['graph_sha256']


# ------------------------------------------------------------------ codecs and recipes

def goal_json(value):
    """GRS-064 pm.goal.canonical_json.v1 (exact-integer canonical JSON)."""
    return A.exact_json(value, 'dgu/goal_json')


def jcs(value):
    """RFC 8785 over the owner's domain: strings, booleans, null, ASCII-keyed
    objects, arrays and integers inside binary64's exact range."""
    def check(v):
        if type(v) is float:
            refuse('dgu/jcs/float')
        if type(v) is int:
            require('dgu/jcs/jcs_binary64', -(2 ** 53) < v < 2 ** 53)
        elif type(v) is dict:
            for k, x in v.items():
                require('dgu/jcs/key', type(k) is str)
                check(x)
        elif type(v) is list:
            for x in v:
                check(x)
        elif type(v) is str:
            v.encode('utf-8', 'strict')
        else:
            require('dgu/jcs/type', v is None or type(v) is bool)
    check(value)
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), sort_keys=True,
                      allow_nan=False).encode('utf-8')


def msgpack(value, where='dgu/msgpack'):
    return A.canonical(value, where)


def wrapper_sha(wrapper):
    """Complete outer commitment over canonical MessagePack outer bytes."""
    return sha(msgpack(wrapper, 'dgu/outer'))


def hexk(s, where='dgu/key'):
    require(where + '/type', type(s) is str and s != '')
    try:
        return s.encode('utf-8', 'strict').hex()
    except UnicodeError:
        refuse(where + '/utf8')


def text_sha(text):
    require('dgu/text/type', type(text) is str)
    try:
        return sha(text.encode('utf-8', 'strict'))
    except UnicodeError:
        refuse('dgu/text/surrogate')


def scalars(text):
    return len(text)


def currentness(body):
    return sha(b'pm.goal.currentness.v1\n' + goal_json({k: v for k, v in body.items() if k != 'currentness_hash'}))


def revision_hash(rev):
    return sha(b'pm.goal.objective_revision.v1\n' + goal_json({k: v for k, v in rev.items() if k != 'revision_hash'}))


def body_bytes_sha(body):
    return sha(goal_json(body))


def intent_sha(pending):
    return sha(b'pm.goal.body_intent.v1\n' + goal_json({k: v for k, v in pending.items() if k != 'intent_sha256'}))


def start_intent_sha(body, rev, origin):
    return sha(b'pm.goal.body_start.v1\n' + goal_json(dict(body=body, revision=rev, origin=origin)))


def event_identity(storage_instance_id, project_id, thread_id, command_instance_id, operation_id, goal_id):
    """SP-421: D over the admitted SourceAudit members, nine-member JCS array."""
    d = sha(jcs(['pm.goal.updated.command.v1', 'project', storage_instance_id, project_id, thread_id, COMMAND,
                 command_instance_id, operation_id, goal_id]))
    return 'goal.updated.v1:' + d, 'goal.updated.command.v1:' + d


def body_key(p, g):
    return 'goal_record.v2:%s:%s' % (hexk(p), hexk(g))


def rev_key(p, g, r):
    return 'goal_revision.v2:%s:%s:%d' % (hexk(p), hexk(g), NR.integer(r, 'dgu/key/revision', minimum=1))


def origin_key(p, g, r):
    return 'goal_origin.v1:%s:%s:%d' % (hexk(p), hexk(g), NR.integer(r, 'dgu/key/revision', minimum=1))


def control_key(p, g):
    return 'goal_body_control.v1:%s:%s' % (hexk(p), hexk(g))


def receipt_key(p, g, o):
    return 'goal_body_mutation_receipt.v1:%s:%s:%s' % (hexk(p), hexk(g), hexk(o))


def upd_key(family, scope, operation_id, suffix=None):
    key = '%s:%s:%s:%s:%s:%s' % (family, hexk(scope['storage_instance_id']), hexk(scope['project_id']),
                                 hexk(scope['thread_id']), hexk(scope['goal_id']), hexk(operation_id))
    return key if suffix is None else key + ':' + suffix


def epoch_key(scope, operation_id, epoch):
    return upd_key('goal_update_progress', scope, operation_id, 'epoch:%d' % NR.integer(epoch, 'dgu/key/epoch',
                                                                                         minimum=0))


def head_key(scope, operation_id):
    return upd_key('goal_update_progress', scope, operation_id, 'head')


def proposal_key(scope, proposal_command_instance_id):
    return 'goal_update_proposal.v1:%s:%s' % (hexk(scope['goal_id']), hexk(proposal_command_instance_id))


def resolution_key(scope, approval_id):
    return 'goal_update_approval_resolution.v1:%s:%s' % (hexk(scope['goal_id']), hexk(approval_id))


T_BODY, T_REV, T_ORIGIN, T_CONTROL, T_RECEIPT = ('goal_body_record', 'goal_objective_revision', 'goal_objective_origin',
                                                 'goal_body_control', 'goal_body_mutation_receipt')
T_SOURCE, T_INPUT, T_PROGRESS, T_TERMINAL = ('goal_update_source_audit', 'goal_update_input_content',
                                             'goal_update_progress', 'goal_update_terminal_audit')


def exact_str(value, where):
    """Exact type before value; identifiers are full-match nonempty strings with no LF."""
    require(where + '/type', type(value) is str)
    require(where + '/empty', value != '')
    require(where + '/control_character', not any(ord(c) < 0x20 for c in value))
    return value


def exact_int(value, where, minimum=None):
    return NR.integer(value, where, minimum=minimum)


def storage_time(value, where):
    return NR.storage_time(value, where)


# ------------------------------------------------------------------ world

class World:
    """One TEST_ONLY Storage directory plus its registered owner composition.

    ``create=True`` births a new Storage; otherwise the directory is reopened
    (SP-347 recovery runs in the adapter) and every owner reloads its durable
    state from Storage. ``cut`` names a DG-U cut point; ``cut_mode='exit'``
    kills the process (``os._exit(73)``), ``'raise'`` raises ``S.Crash``.
    """

    def __init__(self, root, *, create=True, faults=None, cut=None, cut_mode='raise', actor_suffix=''):
        self.root = Path(root)
        self.cut, self.cut_mode = cut, cut_mode
        sroot = self.root / 'storage'
        self.storage = (S.TestOwnerStorage.create(sroot, faults=faults) if create
                        else S.TestOwnerStorage.open(sroot, faults=faults))
        self.update_bank, self.consumer_bank = banks()
        self.recorder = A.MethodRecorder()
        self.registry = A.OwnerRegistry(self.recorder)
        self.recorder.observe('storage', self.storage.observe)
        self._last_ms = self.storage.clock_last_ms
        config = self.storage.cell('dgu_world', 'config')
        if config is None:
            tag = uuid.uuid4().hex[:12]
            ids = {role: 'TEST_ONLY:%s:%s' % (role, tag) for role in (
                'installation', 'permission', 'thread', 'host_stop', 'plan_binding', 'chat', 'sir', 'approval',
                'goal_body', 'goal_lifecycle', 'goal_update_source', 'goal_update_producer', 'append',
                'goal_updated_inspector')}
            ids['goal_body'] = 'owner.goal.body.mutation@1.0.0#TEST_ONLY:' + tag
            config = dict(qualification=QUALIFICATION, edition=EDITION, ids=ids, created_tag=tag,
                          server_id='TEST_ONLY:server:' + tag, host_id='TEST_ONLY:host:' + tag,
                          environment_id='TEST_ONLY:environment:' + tag)
            self.storage.transact([dict(table='dgu_world', key='config', expected=None, value=config)])
        else:
            config = config['value']
        self.config = config
        self.ids = config['ids']
        self.hooks = {}
        self.boundaries = []
        self.tx_log = []
        self.pack_log = []
        self.installation = InstallationOwner(self)
        self.permissions = PermissionOwner(self)
        self.threads = ThreadOwner(self)
        self.stops = HostStopOwner(self)
        self.plans = PlanBindingOwner(self)
        self.chat = ChatOwner(self)
        self.sir = SirOwner(self)
        self.approvals = ApprovalOwner(self)
        self.body = GoalBodyOwner(self)
        self.lifecycle = LifecycleOwner(self)
        self.source = UpdateSourceOwner(self)
        self.producer = UpdateProducer(self)
        self.inspector = EventInspector(self)
        self.command = GoalUpdateCommand(self)
        if self.installation.current() is None:
            self.installation.install()

    # ---------------------------------------------------------- clock
    def now(self):
        ms = max(time.time_ns() // 1_000_000, self._last_ms + 1, self.storage.clock_last_ms + 1)
        self._last_ms = ms
        return S.format_ms(ms)

    # ---------------------------------------------------------- boundaries and cuts
    def inject(self, method, point, mutation):
        """Register a one-shot change at a returning-helper boundary."""
        require('dgu/inject/duplicate', (method, point) not in self.hooks)
        self.hooks[(method, point)] = mutation

    def boundary(self, method, point, ctx=None):
        self.boundaries.append((method, point))
        hook = self.hooks.pop((method, point), None)
        if hook is not None:
            hook(self, ctx)

    def crash(self, name):
        if self.cut == name:
            if self.cut_mode == 'exit':
                os._exit(S.CRASH_EXIT)
            raise S.Crash(name)

    def helper(self, owner_id, method, name, function, ctx=None):
        """One returning helper inside an independently callable method."""
        with self.recorder.call(owner_id, method + '/' + name) as slot:
            result = function()
            slot.set(result if isinstance(result, (dict, list, str, int, bool, type(None))) else None)
        self.boundary(method, 'after:' + name, ctx)
        return result

    def transact(self, writes, **kwargs):
        tx = self.storage.transact(writes, **kwargs)
        self.tx_log.append(dict(tx_id=tx['tx_id'], generation=self.storage.commit_generation,
                                keys=[[x['table'], x['key']] for x in writes]))
        return tx

    def observe_effects(self):
        """Durable effect observation (cells, events, custody, packs) for preservation checks."""
        st = self.storage
        return dict(cells=sha(msgpack(st.cells, 'dgu/observe')), events=sorted(st.events),
                    custody=sorted(st.custody), packs=sorted(st.packs),
                    reservations={k: v['state'] for k, v in st.reservations.items()})


# ------------------------------------------------------------------ durable owner base

class DurableOwner(A.TestOwner):
    """TEST_ONLY owner whose private state lives in its own Storage table."""
    role = 'durable'
    table = None

    def __init__(self, world, **kwargs):
        self.world = world
        self.storage = world.storage
        super().__init__(world.registry, owner_id=world.ids[self.config_role], bank=world.update_bank, **kwargs)

    def _decode_cell(self, value):
        if type(value) is dict and value.get('dgu_cell') == 'pack_ref':
            ref = value['payload_ref']
            raw = self.storage.read_pack(ref, expected_media_type=MEDIA)
            require('dgu/owner_cell/value_sha256', sha(raw) == value['value_sha256'])
            return NR.decode_event_value(raw, 'dgu/owner_cell/decode')
        return value

    def _encode_cell(self, value):
        raw = msgpack(value, 'dgu/owner_cell')
        if len(raw) <= CAP - 64:
            return value
        ref = self.storage.put_pack(raw, MEDIA)
        self.storage.read_pack(ref, expected_media_type=MEDIA)
        return dict(dgu_cell='pack_ref', qualification=QUALIFICATION, payload_ref=ref, value_sha256=sha(raw))

    def state(self, key):
        cell = self.storage.cell(self.table, key)
        return None if cell is None else self._decode_cell(cell['value'])

    def version(self, key):
        cell = self.storage.cell(self.table, key)
        return None if cell is None else cell['version']

    def put(self, key, value, *, expected=None, new=False):
        write = dict(table=self.table, key=key, value=self._encode_cell(value))
        if not new:
            write['expected'] = expected if expected is not None else self.version(key)
        else:
            write['expected'] = None
        return self.world.transact([write])

    def rows(self, prefix=''):
        return {k: self._decode_cell(v['value']) for k, v in sorted(self.storage.cells.get(self.table, {}).items())
                if k.startswith(prefix)}

    def observe(self):
        rows = self.storage.cells.get(self.table, {})
        return dict(owner_epoch=self.owner_epoch, rows=len(rows),
                    versions=sha(msgpack({k: v['version'] for k, v in sorted(rows.items())}, 'dgu/observe')))


class InstallationOwner(DurableOwner):
    """Installed resource graph, enrolled roles, withdrawal and reinstall (TEST_ONLY)."""
    role = 'installation'
    config_role = 'installation'
    table = 'dgu_installation'

    def install(self):
        with self.recorder.call(self.owner_id, 'install') as slot:
            value = dict(qualification=QUALIFICATION, edition=EDITION, state='installed', installation_epoch=1,
                         installed_resource_graph_sha256=graph_sha256(),
                         enrolled_roles=sorted(self.world.ids))
            self.put('current', value, new=True)
            return slot.set(value)

    def current(self):
        return self.state('current')

    def withdraw(self):
        cur = self.current()
        require('dgu/installation/not_installed', cur is not None and cur['state'] == 'installed')
        with self.recorder.call(self.owner_id, 'withdraw') as slot:
            value = dict(cur, state='withdrawn', installation_epoch=cur['installation_epoch'] + 1)
            self.put('current', value)
            return slot.set(value)

    def reinstall(self):
        cur = self.current()
        require('dgu/installation/not_withdrawn', cur is not None and cur['state'] == 'withdrawn')
        with self.recorder.call(self.owner_id, 'reinstall') as slot:
            value = dict(cur, state='installed', installation_epoch=cur['installation_epoch'] + 1,
                         installed_resource_graph_sha256=graph_sha256())
            self.put('current', value)
            return slot.set(value)

    def require_installed(self, where):
        cur = self.current()
        require(where + '/installation_unavailable', cur is not None and cur['state'] == 'installed')
        require(where + '/installation_graph', cur['installed_resource_graph_sha256'] == graph_sha256())
        return cur


class PermissionOwner(DurableOwner):
    """Protected person / actor permission snapshots (PS-1130 participant, TEST_ONLY)."""
    role = 'permission'
    config_role = 'permission'
    table = 'dgu_permission'

    def grant(self, actor_ref, scope, rights, *, person=True):
        exact_str(actor_ref, 'dgu/permission/actor')
        ref = 'TEST_ONLY:permission:' + uuid.uuid4().hex
        with self.recorder.call(self.owner_id, 'grant', dict(actor=actor_ref, rights=sorted(rights))) as slot:
            value = dict(qualification=QUALIFICATION, permission_snapshot_ref=ref, actor_ref=actor_ref,
                         project_id=scope['project_id'], thread_id=scope['thread_id'], rights=sorted(rights),
                         person=person, revoked=False, issued_at=self.world.now())
            self.put(ref, value, new=True)
            slot.set(value)
        return ref

    def revoke(self, ref):
        cur = self.state(ref)
        require('dgu/permission/unissued', cur is not None)
        with self.recorder.call(self.owner_id, 'revoke', dict(ref=ref)):
            self.put(ref, dict(cur, revoked=True))

    def check(self, ref, actor_ref, scope, right, where):
        cur = self.state(ref) if type(ref) is str else None
        require(where + '/permission_unissued', cur is not None)
        require(where + '/permission_revoked', cur['revoked'] is False)
        require(where + '/permission_actor', cur['actor_ref'] == actor_ref)
        require(where + '/permission_scope', cur['project_id'] == scope['project_id'] and
                cur['thread_id'] == scope['thread_id'])
        require(where + '/permission_right', right in cur['rights'])
        return cur


class ThreadOwner(DurableOwner):
    """Bound-thread lifetime (DL-047) and content access (TEST_ONLY)."""
    role = 'thread_lifetime'
    config_role = 'thread'
    table = 'dgu_thread'

    def birth(self, project_id, thread_id):
        key = hexk(project_id) + ':' + hexk(thread_id)
        with self.recorder.call(self.owner_id, 'birth'):
            self.put(key, dict(qualification=QUALIFICATION, project_id=project_id, thread_id=thread_id,
                               tombstone=None), new=True)

    def delete(self, project_id, thread_id):
        key = hexk(project_id) + ':' + hexk(thread_id)
        cur = self.state(key)
        require('dgu/thread/unborn', cur is not None)
        with self.recorder.call(self.owner_id, 'delete'):
            self.put(key, dict(cur, tombstone='TEST_ONLY:tombstone:' + uuid.uuid4().hex))

    def require_content(self, scope, where):
        cur = self.state(hexk(scope['project_id']) + ':' + hexk(scope['thread_id']))
        require(where + '/thread_unavailable', cur is not None)
        require(where + '/content_unavailable', cur['tombstone'] is None)
        return cur


class HostStopOwner(DurableOwner):
    """Original host Stop domain (GRS-073/SP-304): the single live Stop clock."""
    role = 'host_stop'
    config_role = 'host_stop'
    table = 'dgu_host_stop'

    def birth(self, goal_id):
        with self.recorder.call(self.owner_id, 'birth'):
            self.put(hexk(goal_id), dict(qualification=QUALIFICATION, goal_id=goal_id, user_stop_epoch=0,
                                         continuation_epoch=0, stop_latched=False, host_owner_epoch=1), new=True)

    def stop(self, goal_id):
        cur = self.state(hexk(goal_id))
        require('dgu/stop/unborn', cur is not None)
        with self.recorder.call(self.owner_id, 'stop'):
            self.put(hexk(goal_id), dict(cur, user_stop_epoch=cur['user_stop_epoch'] + 1, stop_latched=True))

    def resume(self, goal_id):
        """Explicit resume after Stop: clears the latch, keeps user_stop_epoch, advances continuation."""
        cur = self.state(hexk(goal_id))
        require('dgu/stop/resume_unborn', cur is not None)
        with self.recorder.call(self.owner_id, 'resume'):
            self.put(hexk(goal_id), dict(cur, stop_latched=False, continuation_epoch=cur['continuation_epoch'] + 1))

    def current(self, goal_id):
        cur = self.state(hexk(goal_id))
        require('dgu/stop/unborn', cur is not None)
        return cur


class PlanBindingOwner(DurableOwner):
    """GoalPlanBinding, binding/Plan epoch and material Plan conflicts (APR-017 participant)."""
    role = 'plan_binding'
    config_role = 'plan_binding'
    table = 'dgu_plan_binding'

    def bind(self, scope):
        with self.recorder.call(self.owner_id, 'bind'):
            self.put(hexk(scope['goal_id']), dict(
                qualification=QUALIFICATION, goal_id=scope['goal_id'], project_id=scope['project_id'],
                plan_run_ref='TEST_ONLY:plan_run:' + uuid.uuid4().hex, approved_version=1,
                approved_hash=sha(secrets.token_bytes(32)), binding_epoch=1, material_conflict=False), new=True)

    def advance_epoch(self, goal_id):
        cur = self.state(hexk(goal_id))
        require('dgu/plan/unbound', cur is not None)
        with self.recorder.call(self.owner_id, 'advance_epoch'):
            self.put(hexk(goal_id), dict(cur, binding_epoch=cur['binding_epoch'] + 1,
                                         approved_version=cur['approved_version'] + 1))

    def conflict(self, goal_id):
        cur = self.state(hexk(goal_id))
        require('dgu/plan/unbound', cur is not None)
        with self.recorder.call(self.owner_id, 'conflict'):
            self.put(hexk(goal_id), dict(cur, material_conflict=True))

    def current(self, goal_id):
        return self.state(hexk(goal_id))


class ChatOwner(DurableOwner):
    """Canonical chat/message owner: user instructions and agent source messages."""
    role = 'chat_message'
    config_role = 'chat'
    table = 'dgu_chat'

    def post(self, scope, author_kind, actor_ref, body):
        require('dgu/chat/author_kind', author_kind in ('user', 'agent'))
        message_id = 'TEST_ONLY:message:' + uuid.uuid4().hex
        with self.recorder.call(self.owner_id, 'post', dict(author_kind=author_kind)) as slot:
            value = dict(qualification=QUALIFICATION, message_id=message_id, project_id=scope['project_id'],
                         thread_id=scope['thread_id'], author_kind=author_kind, actor_ref=actor_ref,
                         runtime_thread_id=scope['thread_id'] if author_kind == 'agent' else None,
                         body=copy.deepcopy(body), created_at=self.world.now())
            self.put(message_id, value, new=True)
            slot.set(value)
        return message_id

    def read(self, message_id, where):
        cur = self.state(message_id) if type(message_id) is str else None
        require(where + '/message_unavailable', cur is not None)
        return copy.deepcopy(cur)


# ------------------------------------------------------------------ physical rows

class PhysicalMixin:
    """pm.goal.updated.physical.v3@3.0.0 rows (C3-W12a p2 edition) on adapter Storage."""

    def physical(self, family, key, wrapper, lifetime):
        w = self.world
        raw = msgpack(wrapper, 'dgu/physical/logical')
        owner_identity = sha(NR.binding_value_bytes(
            ['pm.goal.updated.physical.owner_identity.v3', family, key, self.owner_id], 'dgu/physical/owner'))
        row = dict(schema_id='pm.goal.updated.physical.v3', schema_version='3.0.0',
                   logical_schema_id=wrapper['schema_id'], logical_schema_version=wrapper['schema_version'],
                   owner_identity_sha256=owner_identity, source_lifetime=lifetime, value_sha256=sha(raw),
                   record=wrapper, payload_ref=None)
        if len(msgpack(row, 'dgu/physical/row')) > CAP:
            ref = w.storage.put_pack(raw, MEDIA)            # durable before any reference is returned
            w.storage.read_pack(ref, expected_media_type=MEDIA)  # verified before the referencing row publishes
            w.pack_log.append(dict(blake3=ref['blake3'], generation=w.storage.commit_generation, family=family, key=key))
            row = dict(row, record=None, payload_ref=dict(id=ref['blake3'], size=ref['byte_size'], media_type=MEDIA))
            require('dgu/physical/compact_row_oversize', len(msgpack(row, 'dgu/physical/row')) <= CAP)
        w.update_bank.validate(PHYS_URI, row, 'dgu/physical/row')
        return row

    def unwrap_row(self, family, key, row, logical_root, *, owner_id=None, bank=None):
        w = self.world
        bank = bank or w.update_bank
        bank.validate(PHYS_URI, row, 'dgu/physical/read')
        owner_identity = sha(NR.binding_value_bytes(
            ['pm.goal.updated.physical.owner_identity.v3', family, key, owner_id or self.owner_id],
            'dgu/physical/owner'))
        require('dgu/physical/owner_identity', row['owner_identity_sha256'] == owner_identity)
        if row['payload_ref'] is None:
            raw = msgpack(row['record'], 'dgu/physical/read_inline')
        else:
            ref = row['payload_ref']
            raw = w.storage.read_pack(dict(blake3=ref['id'], byte_size=ref['size'], media_type=ref['media_type']),
                                      expected_media_type=MEDIA)
        require('dgu/physical/value_sha256', sha(raw) == row['value_sha256'])
        wrapper = NR.decode_event_value(raw, 'dgu/physical/decode')
        require('dgu/physical/noncanonical', msgpack(wrapper) == raw)
        require('dgu/physical/logical_schema', wrapper.get('schema_id') == row['logical_schema_id'] and
                wrapper.get('schema_version') == row['logical_schema_version'])
        bank.validate(logical_root, wrapper, 'dgu/physical/logical')
        return wrapper


# ------------------------------------------------------------------ SIR (SIR-049)

class SirOwner(PhysicalMixin, DurableOwner):
    """SIR-049 original request/dispatch/outcome owner and immutable terminal publisher."""
    role = 'sir'
    config_role = 'sir'
    table = 'dgu_sir'

    def identity_envelope(self, request, operation_id):
        c = self.world.config
        return dict(command_instance_id=request['command_instance_id'], execution_environment_id=c['environment_id'],
                    execution_host_id=c['host_id'], named_plan_id=None, operation_generation=0,
                    operation_id=operation_id, project_home_server_id=c['server_id'],
                    project_id=request['project_id'], scope_kind='project', server_id=c['server_id'],
                    thread_id=request['thread_id'], topology_generation=0)

    def admit(self, request):
        """Admit the complete GoalUpdateRequestV2: equal retry returns the
        original admission; altered bytes under that command instance conflict."""
        with self.recorder.call(self.owner_id, 'sir.admit', request) as slot:
            require('dgu/sir/request_type', type(request) is dict)
            for field in ('command_instance_id', 'project_id', 'thread_id', 'goal_id', 'actor_ref',
                          'permission_snapshot_ref', 'idempotency_key', 'return_route_ref', 'source_surface'):
                exact_str(request.get(field), 'dgu/sir/request/' + field)
            exact_int(request.get('expected_revision'), 'dgu/sir/request/expected_revision', minimum=1)
            self.bank.validate(RUNTIME_URI + '#/$defs/GoalUpdateRequestV2', request, 'dgu/sir/request')
            text = request['objective_text']
            require('dgu/sir/request/objective_too_long', scalars(text) <= OBJECTIVE_LIMIT)
            text_sha(text)
            key = hexk(request['command_instance_id'])
            existing = self.state(key)
            payload = sha(jcs(request))
            if existing is not None:
                require('dgu/sir/request_conflict', existing['payload_sha256'] == payload)
                return slot.set(copy.deepcopy(existing))
            self.world.installation.require_installed('dgu/sir/admit')
            tag = uuid.uuid4().hex
            operation_id = 'goal-operation:TEST_ONLY:' + tag
            now = self.world.now()
            identity = self.identity_envelope(request, operation_id)
            normalized = dict(request_ref='request:TEST_ONLY:' + tag, command_id=COMMAND,
                              command_instance_id=request['command_instance_id'], operation_id=operation_id,
                              owner_identity=identity, payload_sha256=payload,
                              idempotency_key=request['idempotency_key'], target_generation=0,
                              dispatch_frame_id='frame:TEST_ONLY:' + tag)
            outcome = dict(schema_id='pm.full_thread_runtime.contracts.v1', record_kind='command_outcome',
                           identity=copy.deepcopy(identity), command_id=COMMAND, payload_sha256=payload,
                           idempotency_key=request['idempotency_key'], target_generation=0, outcome='accepted',
                           dispatch_frame_id=normalized['dispatch_frame_id'], acknowledgement_frame_id=None,
                           acknowledgement_frame_offset=None, same_frame_acknowledged=False,
                           acknowledgement_receipt_ref=None, result_receipt_ref=None, error_ref=None,
                           owner_result_ref=None, owner_result_schema_ref=None, owner_result_sha256=None,
                           observed_at=now)
            self.bank.validate(UPDATE_URI + '#/$defs/NormalizedIdentity', normalized, 'dgu/sir/normalized')
            self.bank.validate(UPDATE_URI + '#/$defs/NonterminalOutcome', outcome, 'dgu/sir/outcome')
            value = dict(qualification=QUALIFICATION, request=copy.deepcopy(request), payload_sha256=payload,
                         normalized_identity=normalized, nonterminal_outcome=outcome,
                         dispatch_id='dispatch:TEST_ONLY:' + tag, command_outcome_ref='outcome:TEST_ONLY:' + tag,
                         source_authority_ref='source:TEST_ONLY:' + tag, accepted_at=now,
                         direct_save_authority_ref=('user-direct-save:TEST_ONLY:' + tag
                                                    if request['change_source'] == 'user_direct' else None),
                         terminal_authority_ref='terminal:TEST_ONLY:' + tag)
            self.put(key, value, new=True)
            return slot.set(copy.deepcopy(value))

    def admission(self, command_instance_id, where='dgu/sir'):
        cur = self.state(hexk(command_instance_id))
        require(where + '/admission_unavailable', cur is not None)
        return copy.deepcopy(cur)

    def admit_proposal(self, proposal):
        """cmd.chat.goal.propose_update dispatch: read-only w.r.t. Goal; returns the original dispatch."""
        with self.recorder.call(self.owner_id, 'sir.admit_proposal', proposal) as slot:
            self.bank.validate(CONTRACTS_URI + '#/$defs/GoalUpdateProposalRequest', proposal, 'dgu/sir/proposal')
            key = 'proposal:' + hexk(proposal['command_instance_id'])
            existing = self.state(key)
            digest = sha(jcs(proposal))
            if existing is not None:
                require('dgu/sir/proposal_conflict', existing['proposal_sha256'] == digest)
                return slot.set(copy.deepcopy(existing))
            value = dict(qualification=QUALIFICATION, proposal=copy.deepcopy(proposal), proposal_sha256=digest,
                         dispatch_id='dispatch:TEST_ONLY:' + uuid.uuid4().hex,
                         proposal_request_ref='proposal-request:TEST_ONLY:' + uuid.uuid4().hex,
                         accepted_at=self.world.now())
            self.put(key, value, new=True)
            return slot.set(copy.deepcopy(value))

    def proposal_dispatch(self, command_instance_id, where):
        cur = self.state('proposal:' + hexk(command_instance_id))
        require(where + '/proposal_dispatch_unavailable', cur is not None)
        return copy.deepcopy(cur)

    # terminal ---------------------------------------------------------------
    def terminalize(self, command_instance_id, kind, *, error_code=None, status=None, proof_ref=None):
        """Publish the one immutable terminal (result, outcome, response, row) for the operation."""
        w = self.world
        method = 'sir.terminalize'
        with self.recorder.call(self.owner_id, method, dict(kind=kind)) as slot:
            adm = self.admission(command_instance_id, 'dgu/sir/terminal')
            req, ni = adm['request'], adm['normalized_identity']
            op = ni['operation_id']
            scope = scope_of(req, w.storage.storage_instance_id)
            tkey = upd_key(T_TERMINAL, scope, op)
            existing = w.storage.cell(T_TERMINAL, tkey)
            if existing is not None:
                terminal = self.unwrap_row(T_TERMINAL, tkey, existing['value'], UPDATE_URI + '#/$defs/StorageTerminal')
                require('dgu/sir/terminal_immutable', terminal['record']['kind'] == kind)
                return slot.set(dict(replay=True, terminal=terminal['record']))
            src = w.helper(self.owner_id, method, 'read_source', lambda: w.source.read_source(scope, op, 'dgu/sir/terminal'))
            head, snapshot, skey, svalue = w.helper(self.owner_id, method, 'read_progress',
                                                    lambda: w.source.read_progress(scope, op, 'dgu/sir/terminal'))
            p = snapshot['record']
            source_sha = wrapper_sha(src)
            require('dgu/sir/terminal/source_join', p['source_audit_sha256'] == source_sha)
            now = w.now()
            identity = copy.deepcopy(ni['owner_identity'])
            result_ref = 'result:TEST_ONLY:' + hexk(op)
            base = dict(schema_id='pm.goal.update.result.v2', schema_version='2.0.0', command_id=COMMAND,
                        command_instance_id=req['command_instance_id'], operation_id=op,
                        project_id=req['project_id'], thread_id=req['thread_id'], goal_id=req['goal_id'])
            outcome = dict(adm['nonterminal_outcome'], acknowledgement_frame_id=ni['dispatch_frame_id'],
                           acknowledgement_frame_offset=0, same_frame_acknowledged=True,
                           acknowledgement_receipt_ref=adm['command_outcome_ref'] + '#/original_update_acknowledgement',
                           observed_at=now, owner_result_ref=result_ref, owner_result_schema_ref=RESULT_SCHEMA_REF)
            response = dict(schema_id='pm.ui_command_response.v2', schema_version='2.0.0',
                            dispatch_id=adm['dispatch_id'], request_ref=ni['request_ref'], command_id=COMMAND,
                            command_instance_id=req['command_instance_id'], response_kind='owner_operation',
                            ack_status='accepted', operation_id=op, owner_identity=identity,
                            command_outcome_ref=adm['command_outcome_ref'], owner_result_ref=result_ref,
                            owner_result_schema_ref=RESULT_SCHEMA_REF, replayed=False, original_dispatch_id=None,
                            ts=now)
            if kind == 'succeeded':
                require('dgu/sir/terminal/success_phase', p['phase'] == 'event_issued')
                receipt = w.helper(self.owner_id, method, 'read_receipt', lambda: w.body.read_receipt_private(
                    p['body_commit']['receipt_request'], 'dgu/sir/terminal'))
                require('dgu/sir/terminal/receipt_join', wrapper_sha(receipt) == p['body_commit']['receipt_sha256'])
                custody = w.storage.first_custody(p['publication']['event_id'])
                require('dgu/sir/terminal/first_custody', custody is not None and A.same(
                    custody['first_append_receipt'], p['publication']['first_append_receipt']))
                result = dict(base, status='succeeded', body_commit=p['body_commit'], publication=p['publication'])
                outcome.update(outcome='succeeded', error_ref=None,
                               result_receipt_ref=receipt_key(req['project_id'], req['goal_id'], op))
                response.update(result_status='succeeded', error=None, event_refs=[p['publication']['event_id']],
                                receipt_ref=outcome['result_receipt_ref'])
                branch = 'SucceededResult'
            elif kind == 'no_effect':
                require('dgu/sir/terminal/no_effect_phase', p['phase'] == 'no_effect')
                require('dgu/sir/terminal/no_effect_receipt', w.storage.cell(
                    T_RECEIPT, receipt_key(req['project_id'], req['goal_id'], op)) is None)
                require('dgu/sir/terminal/no_effect_event', w.storage.events.get(
                    p['producer_metadata']['event_id']) is None)
                status = status or 'cancelled'
                proof = proof_ref or (adm['source_authority_ref'] + '#/original_no_effect_resolution')
                result = dict(base, status=status, effect_disposition='no_goal_effect', no_effect_proof_ref=proof,
                              error=dict(code=error_code or 'cancelled', evidence_ref=proof, offending_field=None))
                outcome.update(outcome=status, error_ref=proof, result_receipt_ref=proof)
                central = None
                if status in ('rejected', 'failed'):
                    central = dict(code=CENTRAL_ERROR.get(error_code or 'cancelled', 'handler_unavailable'),
                                   reason='original owner refused before any body or event effect',
                                   offending_field=None)
                response.update(result_status=None if status == 'rejected' else status, error=central, event_refs=[],
                                receipt_ref=proof, ack_status='rejected' if status == 'rejected' else 'accepted')
                branch = 'NoEffectResult'
            else:
                require('dgu/sir/terminal/unknown_kind', kind == 'unknown')
                require('dgu/sir/terminal/unknown_phase', p['phase'] in ('body_unknown', 'event_unknown'))
                committed = p['phase'] == 'event_unknown'
                result = dict(base, status='recovery_required', body_effect='committed' if committed else 'unknown',
                              event_effect='unknown' if committed else 'not_attempted',
                              body_commit=p['body_commit'] if committed else None, publication=None,
                              resolution_owner_ref=w.ids['goal_update_source'],
                              error=dict(code='owner_unavailable', evidence_ref='progress-snapshot:' + wrapper_sha(svalue),
                                         offending_field=None))
                outcome.update(outcome='terminal_unknown', error_ref='progress-snapshot:' + wrapper_sha(svalue),
                               result_receipt_ref=None)
                response.update(result_status='recovery_required', receipt_ref=None, event_refs=[],
                                error=dict(code='internal_error', reason='original effect unresolved at terminal',
                                           offending_field=None))
                branch = 'RecoveryRequiredResult'
            self.bank.validate(UPDATE_URI + '#/$defs/' + branch, result, 'dgu/sir/terminal/result')
            result_sha = sha(jcs(result))
            outcome['owner_result_sha256'] = result_sha
            selector = dict(storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                            thread_id=scope['thread_id'], goal_id=scope['goal_id'], operation_id=op,
                            progress_epoch=p['progress_epoch'], snapshot_key=skey)
            terminal = dict(schema_id='pm.goal.update.terminal_audit.v1', schema_version='1.0.0',
                            storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                            thread_id=scope['thread_id'], goal_id=scope['goal_id'], operation_id=op,
                            source_audit_sha256=source_sha, terminal_progress_sha256=wrapper_sha(svalue),
                            owner_result_ref=result_ref, owner_result_sha256=result_sha,
                            terminal_authority_ref=adm['terminal_authority_ref'], committed_at=now,
                            kind=kind, result=result, outcome=outcome, response=response,
                            terminal_progress_selector=selector)
            wrapper = dict(schema_id='pm.storage_value.goal_update_terminal_audit.v1', schema_version='1.0.0',
                           record=terminal)
            self.bank.validate(UPDATE_URI + '#/$defs/StorageTerminal', wrapper, 'dgu/sir/terminal')
            ctx = dict(terminal=terminal)
            expected = copy.deepcopy(terminal)
            w.boundary(method, 'before_release', ctx)
            # Final held boundary: head still selects exactly this epoch, source unchanged.
            head2, snap2, skey2, svalue2 = w.source.read_progress(scope, op, 'dgu/sir/terminal/final')
            require('dgu/sir/terminal/final_head_epoch', head2['record']['progress_epoch'] == p['progress_epoch'] and
                    skey2 == skey)
            require('dgu/sir/terminal/final_candidate', A.same(ctx['terminal'], expected) and
                    wrapper_sha(svalue2) == terminal['terminal_progress_sha256'])
            w.installation.require_installed('dgu/sir/terminal/final')
            row = self.physical(T_TERMINAL, tkey, wrapper, 'authority_indefinite')
            w.transact([dict(table=T_TERMINAL, key=tkey, expected=None, value=row)],
                               cut_before='before_terminal', cut_after='after_terminal')
            return slot.set(dict(replay=False, terminal=terminal))

    def replay(self, command_instance_id):
        """Original response with central replay decoration only; no write."""
        w = self.world
        with self.recorder.call(self.owner_id, 'sir.replay') as slot:
            adm = self.admission(command_instance_id, 'dgu/sir/replay')
            scope = scope_of(adm['request'], w.storage.storage_instance_id)
            op = adm['normalized_identity']['operation_id']
            tkey = upd_key(T_TERMINAL, scope, op)
            cell = w.storage.cell(T_TERMINAL, tkey)
            require('dgu/sir/replay/terminal_pending', cell is not None)
            terminal = self.unwrap_row(T_TERMINAL, tkey, cell['value'], UPDATE_URI + '#/$defs/StorageTerminal')
            response = dict(copy.deepcopy(terminal['record']['response']), replayed=True,
                            original_dispatch_id=adm['dispatch_id'])
            return slot.set(dict(response=response, terminal=terminal['record']))


def _uuid_ok(value):
    """U2: hyphenated 8-4-4-4-12 hexadecimal over the full string, exact spelling."""
    if type(value) is not str or len(value) != 36:
        return False
    parts = value.split('-')
    return [len(x) for x in parts] == [8, 4, 4, 4, 12] and all(
        c in '0123456789abcdefABCDEF' for x in parts for c in x)


def scope_of(request, storage_instance_id):
    return dict(storage_instance_id=storage_instance_id, project_id=request['project_id'],
                thread_id=request['thread_id'], goal_id=request['goal_id'])


# ------------------------------------------------------------------ HITL approval (U1-U4)

class ApprovalOwner(DurableOwner):
    """HITL-1130 capture/resolve/read_resolution with PS-1130 protected person decisions."""
    role = 'hitl_approval'
    config_role = 'approval'
    table = 'dgu_approval'

    def capture(self, proposal_command_instance_id):
        w = self.world
        method = 'hitl.capture'
        with self.recorder.call(self.owner_id, method) as slot:
            dispatch = w.helper(self.owner_id, method, 'proposal_dispatch',
                                lambda: w.sir.proposal_dispatch(proposal_command_instance_id, 'dgu/hitl/capture'))
            proposal = dispatch['proposal']
            target = proposal['target']
            scope = target['scope']
            agent = w.helper(self.owner_id, method, 'agent_message',
                             lambda: w.chat.read(proposal['source_message_id'], 'dgu/hitl/capture/agent'))
            instruction = w.helper(self.owner_id, method, 'instruction_message',
                                   lambda: w.chat.read(proposal['instruction_message_id'], 'dgu/hitl/capture/instruction'))
            require('dgu/hitl/capture/agent_author', agent['author_kind'] == 'agent' and
                    agent['runtime_thread_id'] == scope['thread_id'])
            require('dgu/hitl/capture/agent_actor', agent['actor_ref'] == proposal['actor_ref'])
            require('dgu/hitl/capture/agent_text', agent['body'].get('replacement_text') == target['objective_text']
                    and agent['body'].get('goal_id') == scope['goal_id'])
            require('dgu/hitl/capture/instruction_author', instruction['author_kind'] == 'user')
            require('dgu/hitl/capture/instruction_attests', instruction['body'].get('kind') ==
                    'goal_update_instruction' and instruction['body'].get('goal_id') == scope['goal_id'] and
                    instruction['body'].get('replacement_text') == target['objective_text'])
            require('dgu/hitl/capture/storage_uuid', _uuid_ok(scope['storage_instance_id']))
            require('dgu/hitl/capture/foreign_storage', scope['storage_instance_id'] == w.storage.storage_instance_id)
            require('dgu/hitl/capture/scope', agent['thread_id'] == scope['thread_id'] ==
                    instruction['thread_id'] and agent['project_id'] == scope['project_id'])
            current = w.helper(self.owner_id, method, 'current_goal', lambda: w.body.read_private(
                scope, 'dgu/hitl/capture'))
            require('dgu/hitl/capture/stale_target', current['body']['revision'] == target['expected_revision'] and
                    current['body']['currentness_hash'] == target['expected_currentness_hash'])
            w.permissions.check(proposal['permission_snapshot_ref'], proposal['actor_ref'], scope,
                                'propose_goal_update', 'dgu/hitl/capture')
            w.threads.require_content(scope, 'dgu/hitl/capture')
            approval_id = 'approval:TEST_ONLY:' + uuid.uuid4().hex
            request = dict(schema_id='pm.goal.update.approval_request.v1', schema_version='1.0.0',
                           approval_id=approval_id, proposal_request_ref=dispatch['proposal_request_ref'],
                           proposal_request_sha256=dispatch['proposal_sha256'], target=copy.deepcopy(target),
                           source_message_id=proposal['source_message_id'],
                           instruction_message_id=proposal['instruction_message_id'],
                           created_at_utc=w.now(), expires_at_utc=None)
            self.bank.validate(CONTRACTS_URI + '#/$defs/ApprovalRequest', request, 'dgu/hitl/request')
            raw = msgpack(request, 'dgu/hitl/request_bytes')
            content = dict(kind='inline', request=request) if len(raw) < CAP // 2 else None
            stored = dict(schema_id='pm.storage_value.goal_update_proposal.v1', schema_version='1.0.0',
                          scope=scope, physical_key=proposal_key(scope, proposal['command_instance_id']),
                          proposal_command_instance_id=proposal['command_instance_id'],
                          original_request_sha256=sha(raw), content=None)
            ctx = dict(request=copy.deepcopy(request))
            w.boundary(method, 'before_release', ctx)
            require('dgu/hitl/capture/final_candidate', A.same(ctx['request'], request))
            final = w.body.read_private(scope, 'dgu/hitl/capture/final')
            require('dgu/hitl/capture/final_target', final['body']['revision'] == target['expected_revision'] and
                    final['body']['currentness_hash'] == target['expected_currentness_hash'])
            w.permissions.check(proposal['permission_snapshot_ref'], proposal['actor_ref'], scope,
                                'propose_goal_update', 'dgu/hitl/capture/final')
            w.threads.require_content(scope, 'dgu/hitl/capture/final')
            w.installation.require_installed('dgu/hitl/capture/final')
            value = dict(qualification=QUALIFICATION, request=request, request_sha256=sha(raw), resolution=None,
                         revoked=False, approval_owner_epoch=self.owner_epoch, stored_proposal=dict(
                             stored, content=content), proposer_actor=proposal['actor_ref'])
            self.put(approval_id, value, new=True)
            return slot.set(dict(approval_id=approval_id, request=request))

    def decide(self, approval_id, decision, person_permission_ref, person_ref):
        w = self.world
        cur = self.state(approval_id)
        require('dgu/hitl/decide/unissued', cur is not None)
        require('dgu/hitl/decide/already_resolved', cur['resolution'] is None)
        require('dgu/hitl/decide/decision', decision in ('approved', 'denied', 'expired'))
        with self.recorder.call(self.owner_id, 'hitl.decide', dict(decision=decision)) as slot:
            perm = w.permissions.check(person_permission_ref, person_ref, cur['request']['target']['scope'],
                                       'approve_goal_update', 'dgu/hitl/decide')
            require('dgu/hitl/decide/not_person', perm['person'] is True)
            require('dgu/hitl/decide/self_approval', person_ref != cur['proposer_actor'])
            resolution = dict(approval_id=approval_id, request_sha256=cur['request_sha256'], decision=decision,
                              approver_ref=person_ref, decided_at_utc=w.now(),
                              approval_owner_epoch=cur['approval_owner_epoch'],
                              protected_person_decision_ref='protected-person:TEST_ONLY:' + uuid.uuid4().hex)
            self.bank.validate(CONTRACTS_URI + '#/$defs/ApprovalResolution', resolution, 'dgu/hitl/resolution')
            self.put(approval_id, dict(cur, resolution=resolution))
            return slot.set(resolution)

    def revoke(self, approval_id):
        cur = self.state(approval_id)
        require('dgu/hitl/revoke/unissued', cur is not None)
        with self.recorder.call(self.owner_id, 'hitl.revoke'):
            self.put(approval_id, dict(cur, revoked=True))

    def read_resolution(self, approval_id, where):
        """U4: request AND resolution from original owner custody, with current
        revocation/expiry; returns the private acceptance evidence."""
        cur = self.state(approval_id) if type(approval_id) is str else None
        require(where + '/approval_unavailable', cur is not None)
        require(where + '/approval_request_bytes', sha(msgpack(cur['request'])) == cur['request_sha256'])
        res = cur['resolution']
        require(where + '/approval_not_resolved', res is not None)
        require(where + '/approval_request_commitment', res['request_sha256'] == cur['request_sha256'])
        require(where + '/approval_denied', res['decision'] != 'denied')
        require(where + '/approval_expired', res['decision'] != 'expired')
        require(where + '/approval_decision', res['decision'] == 'approved')
        require(where + '/approval_revoked', cur['revoked'] is False)
        exp = cur['request']['expires_at_utc']
        require(where + '/approval_expired', exp is None or exp > self.world.now())
        return copy.deepcopy(dict(request=cur['request'], resolution=res, approval_owner_epoch=self.owner_epoch))


# ------------------------------------------------------------------ sole SP-287 body owner

class GoalBodyOwner(PhysicalMixin, DurableOwner):
    """owner.goal.body.mutation@1.0.0: the only body issuer (start, objective
    reservation/commit/release, metadata), plus its three readers."""
    role = 'goal_body'
    config_role = 'goal_body'
    table = T_BODY

    ROOTS = {T_BODY: BODY_URI + '#/$defs/storage_body', T_REV: BODY_URI + '#/$defs/storage_revision',
             T_ORIGIN: BODY_URI + '#/$defs/storage_origin', T_CONTROL: CANCEL_URI + '#/$defs/StorageBodyControlV2',
             T_RECEIPT: BODY_URI + '#/$defs/storage_receipt'}
    LIFETIME = {T_BODY: 'bound_thread', T_REV: 'bound_thread', T_ORIGIN: 'bound_thread', T_CONTROL: 'bound_thread',
                T_RECEIPT: 'authority_indefinite'}
    IDS = {T_BODY: 'pm.storage_value.goal_body_record.v1', T_REV: 'pm.storage_value.goal_objective_revision.v1',
           T_ORIGIN: 'pm.storage_value.goal_objective_origin.v1', T_CONTROL: 'pm.storage_value.goal_body_control.v2',
           T_RECEIPT: 'pm.storage_value.goal_body_mutation_receipt.v1'}

    def advance_owner_epoch(self):
        """TEST_ONLY owner-epoch change (owner transfer); in-process only."""
        self.owner_epoch = NR.integer(self.owner_epoch + 1, 'dgu/body/owner_epoch', minimum=0)

    def wrap(self, family, record):
        return dict(schema_id=self.IDS[family], schema_version='2.0.0' if family == T_CONTROL else '1.0.0',
                    record=record)

    def row(self, family, key, record):
        wrapper = self.wrap(family, record)
        self.bank.validate(self.ROOTS[family], wrapper, 'dgu/body/' + family)
        return self.physical(family, key, wrapper, self.LIFETIME[family])

    def read_row(self, family, key, where):
        cell = self.storage.cell(family, key)
        require(where + '/' + family + '_unavailable', cell is not None)
        return self.unwrap_row(family, key, cell['value'], self.ROOTS[family])['record'], cell['version']

    # start (setup lineage) -----------------------------------------------------
    def start(self, scope, objective_text, creation_message_id, authority_ref, context_ref):
        w = self.world
        with self.recorder.call(self.owner_id, 'body.start') as slot:
            p, t, g = scope['project_id'], scope['thread_id'], scope['goal_id']
            require('dgu/body/start/goal_exists', self.storage.cell(T_BODY, body_key(p, g)) is None)
            now = w.now()
            body = dict(goal_id=g, project_id=p, thread_id=t, objective_text=objective_text, revision=1,
                        state='active', blocked_reason_ref=None, active_run_ref=None, created_at=now, updated_at=now)
            body['currentness_hash'] = currentness(body)
            rev = dict(goal_id=g, revision=1, objective_text=objective_text, change_source='user_direct',
                       source_message_id=None, approval_id=None, prior_revision_hash=None, created_at=now)
            rev['revision_hash'] = revision_hash(rev)
            origin = dict(goal_id=g, goal_revision=1, origin_kind='user_request',
                          source_message_refs=[creation_message_id], source_context_manifest_ref=context_ref,
                          bound_plan_ref=None, owning_workflow_ref=None)
            control = self._control(scope, body, 1, rev['revision_hash'], 0, None)
            op = 'goal-start:TEST_ONLY:' + uuid.uuid4().hex
            receipt = dict(schema_id='pm.goal.body_mutation_receipt.v1', storage_instance_id=scope['storage_instance_id'],
                           project_id=p, thread_id=t, goal_id=g, operation_id=op,
                           intent_sha256=start_intent_sha(body, rev, origin), owner_ref=self.owner_id,
                           authority_ref=authority_ref, before_revision=None, before_currentness_hash=None,
                           after_revision=1, after_currentness_hash=body['currentness_hash'],
                           accepted_objective_revision=1, accepted_revision_hash=rev['revision_hash'], committed_at=now)
            writes = [dict(table=T_BODY, key=body_key(p, g), expected=None, value=self.row(T_BODY, body_key(p, g), body)),
                      dict(table=T_REV, key=rev_key(p, g, 1), expected=None, value=self.row(T_REV, rev_key(p, g, 1), rev)),
                      dict(table=T_ORIGIN, key=origin_key(p, g, 1), expected=None,
                           value=self.row(T_ORIGIN, origin_key(p, g, 1), origin)),
                      dict(table=T_CONTROL, key=control_key(p, g), expected=None,
                           value=self.row(T_CONTROL, control_key(p, g), control)),
                      dict(table=T_RECEIPT, key=receipt_key(p, g, op), expected=None,
                           value=self.row(T_RECEIPT, receipt_key(p, g, op), receipt))]
            self.world.transact(writes)
            return slot.set(dict(body=body, receipt=receipt))

    def _control(self, scope, body, latest_rev, latest_hash, epoch, pending):
        p, g = scope['project_id'], scope['goal_id']
        return dict(schema_id='pm.goal.body_control.v2', storage_instance_id=scope['storage_instance_id'],
                    project_id=p, thread_id=scope['thread_id'], goal_id=g, body_key=body_key(p, g),
                    body_sha256=body_bytes_sha(body), current_revision=body['revision'],
                    currentness_hash=body['currentness_hash'], latest_objective_revision=latest_rev,
                    latest_revision_hash=latest_hash, origin_key=origin_key(p, g, latest_rev),
                    control_epoch=epoch, cancellation_receipt_ref=None, pending=pending, cancellation_pending=None)

    # authenticated current snapshot ----------------------------------------------
    def read_private(self, scope, where):
        p, g = scope['project_id'], scope['goal_id']
        body, bver = self.read_row(T_BODY, body_key(p, g), where)
        control, cver = self.read_row(T_CONTROL, control_key(p, g), where)
        require(where + '/body_currentness', body['currentness_hash'] == currentness(body))
        require(where + '/control_body_bytes', control['body_sha256'] == body_bytes_sha(body))
        require(where + '/control_scope', control['storage_instance_id'] == scope['storage_instance_id'] and
                control['project_id'] == p == body['project_id'] and control['goal_id'] == g == body['goal_id'] and
                control['thread_id'] == scope['thread_id'] == body['thread_id'])
        require(where + '/control_head', control['current_revision'] == body['revision'] and
                control['currentness_hash'] == body['currentness_hash'])
        require(where + '/control_body_key', control['body_key'] == body_key(p, g))
        prefix = 'goal_revision.v2:%s:%s:' % (hexk(p), hexk(g))
        revs = sorted(((int(k[len(prefix):]), k) for k in self.storage.cells.get(T_REV, {}) if k.startswith(prefix)))
        revisions, origins, prior, last = [], [], None, 0
        for r, k in revs:
            rev, _ = self.read_row(T_REV, k, where)
            require(where + '/history_chain', rev['revision'] == r and r > last and rev['prior_revision_hash'] == prior and
                    rev['revision_hash'] == revision_hash(rev) and rev['goal_id'] == g)
            org, _ = self.read_row(T_ORIGIN, origin_key(p, g, r), where)
            require(where + '/origin_join', org['goal_id'] == g and org['goal_revision'] == r)
            revisions.append(rev)
            origins.append(org)
            prior, last = rev['revision_hash'], r
        require(where + '/missing_history', revisions and revisions[0]['revision'] == 1)
        require(where + '/accepted_head', control['latest_objective_revision'] == last and
                control['latest_revision_hash'] == prior and control['origin_key'] == origin_key(p, g, last))
        require(where + '/current_objective', revisions[-1]['objective_text'] == body['objective_text'])
        return dict(body=body, control=control, revisions=revisions, origins=origins, body_version=bver,
                    control_version=cver)

    # objective update: reserve / commit / release ----------------------------------
    def reserve(self, scope, pending, joined_writes, where='dgu/body/reserve'):
        w = self.world
        method = 'body.reserve'
        with self.recorder.call(self.owner_id, method, dict(operation_id=pending['operation_id'])) as slot:
            cur = w.helper(self.owner_id, method, 'read_private', lambda: self.read_private(scope, where))
            control = cur['control']
            if control['pending'] is not None:
                require(where + '/conflicting_reservation', control['pending']['operation_id'] ==
                        pending['operation_id'] and control['pending']['intent_sha256'] == pending['intent_sha256'])
                return slot.set(dict(control=control, replay=True))
            require(where + '/cancellation_associated', control['cancellation_receipt_ref'] is None and
                    control['cancellation_pending'] is None)
            require(where + '/intent', pending['intent_sha256'] == intent_sha(pending))
            require(where + '/stale_goal_revision', cur['body']['revision'] == pending['expected_revision'])
            require(where + '/stale_currentness', cur['body']['currentness_hash'] == pending['expected_currentness_hash'])
            self.bank.validate(BODY_URI + '#/$defs/pending', pending, where + '/pending')
            w.installation.require_installed(where)
            new = dict(control, pending=copy.deepcopy(pending), control_epoch=control['control_epoch'] + 1)
            ctx = dict(control=new)
            expected = copy.deepcopy(new)
            w.boundary(method, 'before_release', ctx)
            final = self.read_private(scope, where + '/final')
            require(where + '/final_control_preimage', A.same(final['control'], control))
            require(where + '/final_candidate', A.same(ctx['control'], expected) and A.same(ctx['control']['pending'], pending))
            stop = w.stops.current(scope['goal_id'])
            require(where + '/final_stop', not stop['stop_latched'])
            require(where + '/final_stop_epoch', stop['user_stop_epoch'] == pending['expected_stop_epoch'])
            w.installation.require_installed(where + '/final')
            p, g = scope['project_id'], scope['goal_id']
            writes = [dict(table=T_CONTROL, key=control_key(p, g), expected=cur['control_version'],
                           value=self.row(T_CONTROL, control_key(p, g), new))] + joined_writes(new)
            self.world.transact(writes)
            return slot.set(dict(control=new, replay=False))

    def commit(self, scope, reserved_control, final_checks, joined_writes, where='dgu/body/commit'):
        w = self.world
        method = 'body.commit'
        pending = reserved_control['pending']
        op = pending['operation_id']
        p, g = scope['project_id'], scope['goal_id']
        with self.recorder.call(self.owner_id, method, dict(operation_id=op)) as slot:
            existing = self.storage.cell(T_RECEIPT, receipt_key(p, g, op))
            if existing is not None:
                receipt, _ = self.read_row(T_RECEIPT, receipt_key(p, g, op), where)
                require(where + '/receipt_intent', receipt['intent_sha256'] == pending['intent_sha256'])
                return slot.set(dict(receipt=receipt, replay=True))
            cur = w.helper(self.owner_id, method, 'read_private', lambda: self.read_private(scope, where))
            require(where + '/reserved_control_preimage', A.same(cur['control'], reserved_control))
            require(where + '/intent', pending['intent_sha256'] == intent_sha(pending))
            for name, check in final_checks:
                w.helper(self.owner_id, method, name, lambda check=check: check(where))
            body, control = cur['body'], cur['control']
            after, accepted, origin = (copy.deepcopy(pending['after_record']), copy.deepcopy(pending['accepted_revision']),
                                       copy.deepcopy(pending['origin']))
            n = body['revision']
            require(where + '/after_revision', after['revision'] == n + 1)
            require(where + '/after_identity', after['goal_id'] == g and after['project_id'] == p and
                    after['thread_id'] == body['thread_id'] and after['created_at'] == body['created_at'])
            require(where + '/after_updated_at', after['updated_at'] >= body['updated_at'])
            require(where + '/after_currentness', after['currentness_hash'] == currentness(after))
            require(where + '/accepted_text', accepted['objective_text'] == after['objective_text'] and
                    accepted['revision'] == n + 1 and accepted['goal_id'] == g)
            require(where + '/accepted_prior', accepted['prior_revision_hash'] == control['latest_revision_hash'])
            require(where + '/accepted_hash', accepted['revision_hash'] == revision_hash(accepted))
            require(where + '/origin_revision', origin['goal_revision'] == n + 1 and origin['goal_id'] == g)
            new_control = self._control(scope, after, n + 1, accepted['revision_hash'], control['control_epoch'] + 1, None)
            now = w.now()
            receipt = dict(schema_id='pm.goal.body_mutation_receipt.v1', storage_instance_id=scope['storage_instance_id'],
                           project_id=p, thread_id=body['thread_id'], goal_id=g, operation_id=op,
                           intent_sha256=pending['intent_sha256'], owner_ref=self.owner_id,
                           authority_ref=pending['original_change_authority_ref'], before_revision=n,
                           before_currentness_hash=body['currentness_hash'], after_revision=n + 1,
                           after_currentness_hash=after['currentness_hash'], accepted_objective_revision=n + 1,
                           accepted_revision_hash=accepted['revision_hash'], committed_at=now)
            ctx = dict(after=after, accepted=accepted, origin=origin, receipt=receipt, control=new_control)
            expected = copy.deepcopy(ctx)
            w.boundary(method, 'before_release', ctx)
            final = self.read_private(scope, where + '/final')
            require(where + '/final_control_preimage', A.same(final['control'], reserved_control))
            require(where + '/final_candidate', A.same(ctx, expected) and A.same(ctx['after'], pending['after_record'])
                    and A.same(ctx['accepted'], pending['accepted_revision']) and A.same(ctx['origin'], pending['origin']))
            for name, check in final_checks:
                check(where + '/final')
            w.crash('in_commit_before_tx')
            writes = [dict(table=T_BODY, key=body_key(p, g), expected=cur['body_version'],
                           value=self.row(T_BODY, body_key(p, g), after)),
                      dict(table=T_REV, key=rev_key(p, g, n + 1), expected=None,
                           value=self.row(T_REV, rev_key(p, g, n + 1), accepted)),
                      dict(table=T_ORIGIN, key=origin_key(p, g, n + 1), expected=None,
                           value=self.row(T_ORIGIN, origin_key(p, g, n + 1), origin)),
                      dict(table=T_CONTROL, key=control_key(p, g), expected=cur['control_version'],
                           value=self.row(T_CONTROL, control_key(p, g), new_control)),
                      dict(table=T_RECEIPT, key=receipt_key(p, g, op), expected=None,
                           value=self.row(T_RECEIPT, receipt_key(p, g, op), receipt))] + joined_writes(receipt)
            self.world.transact(writes)
            w.crash('in_commit_after_tx')
            return slot.set(dict(receipt=receipt, replay=False))

    def release(self, scope, reserved_control, joined_writes, where='dgu/body/release'):
        """U5: clear an exact reservation with proved no body effect."""
        w = self.world
        method = 'body.release'
        pending = reserved_control['pending']
        p, g = scope['project_id'], scope['goal_id']
        with self.recorder.call(self.owner_id, method, dict(operation_id=pending['operation_id'])) as slot:
            require(where + '/body_committed', self.storage.cell(
                T_RECEIPT, receipt_key(p, g, pending['operation_id'])) is None)
            cur = w.helper(self.owner_id, method, 'read_private', lambda: self.read_private(scope, where))
            require(where + '/reserved_control_preimage', A.same(cur['control'], reserved_control))
            new = dict(reserved_control, pending=None, control_epoch=reserved_control['control_epoch'] + 1)
            ctx = dict(control=new)
            w.boundary(method, 'before_release', ctx)
            final = self.read_private(scope, where + '/final')
            require(where + '/final_control_preimage', A.same(final['control'], reserved_control))
            require(where + '/final_candidate', A.same(ctx['control'], dict(
                reserved_control, pending=None, control_epoch=reserved_control['control_epoch'] + 1)))
            writes = [dict(table=T_CONTROL, key=control_key(p, g), expected=cur['control_version'],
                           value=self.row(T_CONTROL, control_key(p, g), new))] + joined_writes(new)
            self.world.transact(writes)
            return slot.set(dict(control=new))

    # metadata (direct atomic body write) ---------------------------------------------
    def metadata_update(self, scope, change, authority_ref, where='dgu/body/metadata'):
        w = self.world
        method = 'body.metadata_update'
        p, g = scope['project_id'], scope['goal_id']
        with self.recorder.call(self.owner_id, method, dict(change=change)) as slot:
            cur = w.helper(self.owner_id, method, 'read_private', lambda: self.read_private(scope, where))
            body, control = cur['body'], cur['control']
            require(where + '/pending_reservation', control['pending'] is None)
            require(where + '/state', change['state'] in ('active', 'paused', 'blocked', 'completed'))
            require(where + '/completed_terminal', body['state'] != 'completed')
            require(where + '/blocked_reason', (change['state'] == 'blocked') == (change.get('blocked_reason_ref') is not None))
            stop = w.stops.current(g)
            w.installation.require_installed(where)
            op = 'goal-metadata:TEST_ONLY:' + uuid.uuid4().hex
            now = w.now()
            after = dict(body, revision=body['revision'] + 1, state=change['state'],
                         blocked_reason_ref=change.get('blocked_reason_ref'), updated_at=now)
            after['currentness_hash'] = currentness(after)
            intent_record = dict(operation_id=op, owner_ref=self.owner_id, owner_epoch=self.owner_epoch,
                                 operation_kind='metadata_update', expected_revision=body['revision'],
                                 expected_currentness_hash=body['currentness_hash'],
                                 expected_stop_epoch=stop['user_stop_epoch'], after_record=after,
                                 accepted_revision=None, origin=None, original_change_authority_ref=None,
                                 external_authority_ref=None)
            intent_record['intent_sha256'] = intent_sha(intent_record)
            self.bank.validate(BODY_URI + '#/$defs/pending', intent_record, where + '/intent')
            new_control = self._control(scope, after, control['latest_objective_revision'],
                                        control['latest_revision_hash'], control['control_epoch'] + 1, None)
            receipt = dict(schema_id='pm.goal.body_mutation_receipt.v1', storage_instance_id=scope['storage_instance_id'],
                           project_id=p, thread_id=body['thread_id'], goal_id=g, operation_id=op,
                           intent_sha256=intent_record['intent_sha256'], owner_ref=self.owner_id,
                           authority_ref=authority_ref, before_revision=body['revision'],
                           before_currentness_hash=body['currentness_hash'], after_revision=after['revision'],
                           after_currentness_hash=after['currentness_hash'], accepted_objective_revision=None,
                           accepted_revision_hash=None, committed_at=now)
            writes = [dict(table=T_BODY, key=body_key(p, g), expected=cur['body_version'],
                           value=self.row(T_BODY, body_key(p, g), after)),
                      dict(table=T_CONTROL, key=control_key(p, g), expected=cur['control_version'],
                           value=self.row(T_CONTROL, control_key(p, g), new_control)),
                      dict(table=T_RECEIPT, key=receipt_key(p, g, op), expected=None,
                           value=self.row(T_RECEIPT, receipt_key(p, g, op), receipt))]
            self.world.transact(writes)
            return slot.set(dict(receipt=receipt, body=after))

    # readers (SP-287) ----------------------------------------------------------------
    def read_body(self, scope, actor_ref, permission_ref, where='dgu/reader/body'):
        """reader.goal.body@1.0.0: current body only; current SP-287 custody; no approval rerun."""
        w = self.world
        method = 'reader.body'
        with self.recorder.call(self.owner_id, method) as slot:
            w.helper(self.owner_id, method, 'permission', lambda: w.permissions.check(
                permission_ref, actor_ref, scope, 'read_goal', where))
            w.helper(self.owner_id, method, 'content', lambda: w.threads.require_content(scope, where))
            cur = w.helper(self.owner_id, method, 'read_private', lambda: self.read_private(scope, where))
            ctx = dict(body=copy.deepcopy(cur['body']))
            w.boundary(method, 'before_release', ctx)
            final = self.read_private(scope, where + '/final')
            require(where + '/final_currentness', A.same(final['body'], cur['body']) and A.same(ctx['body'], cur['body']))
            w.permissions.check(permission_ref, actor_ref, scope, 'read_goal', where + '/final')
            w.threads.require_content(scope, where + '/final')
            w.installation.require_installed(where + '/final')
            return slot.set(dict(body=ctx['body'], pending_visible=False,
                                 has_pending=cur['control']['pending'] is not None))

    def read_history(self, scope, actor_ref, permission_ref, where='dgu/reader/history'):
        """reader.goal.objective_history@1.0.0: accepted revision/origin chain."""
        w = self.world
        method = 'reader.history'
        with self.recorder.call(self.owner_id, method) as slot:
            w.helper(self.owner_id, method, 'permission', lambda: w.permissions.check(
                permission_ref, actor_ref, scope, 'read_goal', where))
            w.helper(self.owner_id, method, 'content', lambda: w.threads.require_content(scope, where))
            cur = w.helper(self.owner_id, method, 'read_private', lambda: self.read_private(scope, where))
            ctx = dict(revisions=copy.deepcopy(cur['revisions']))
            w.boundary(method, 'before_release', ctx)
            final = self.read_private(scope, where + '/final')
            require(where + '/final_history', A.same(final['revisions'], cur['revisions']) and
                    A.same(ctx['revisions'], cur['revisions']))
            w.permissions.check(permission_ref, actor_ref, scope, 'read_goal', where + '/final')
            w.threads.require_content(scope, where + '/final')
            return slot.set(dict(revisions=ctx['revisions'], origins=cur['origins']))

    def read_receipt_private(self, request, where):
        self.bank.validate(BODY_URI + '#/$defs/receipt_read_request', request, where + '/receipt_request')
        p, g, o = request['project_id'], request['goal_id'], request['operation_id']
        receipt, _ = self.read_row(T_RECEIPT, receipt_key(p, g, o), where)
        require(where + '/receipt_scope', receipt['storage_instance_id'] == request['storage_instance_id'] and
                receipt['project_id'] == p and receipt['goal_id'] == g)
        require(where + '/receipt_intent', receipt['intent_sha256'] == request['intent_sha256'])
        return self.wrap(T_RECEIPT, receipt)

    def read_receipt(self, request, actor_ref, permission_ref, where='dgu/reader/receipt'):
        """reader.goal.body_mutation_receipt@1.0.0: content-free; no body visibility needed."""
        w = self.world
        method = 'reader.receipt'
        scope = dict(storage_instance_id=request.get('storage_instance_id'), project_id=request.get('project_id'),
                     thread_id=None, goal_id=request.get('goal_id'))
        with self.recorder.call(self.owner_id, method) as slot:
            wrapper = w.helper(self.owner_id, method, 'read_receipt', lambda: self.read_receipt_private(request, where))
            scope['thread_id'] = wrapper['record']['thread_id']
            w.helper(self.owner_id, method, 'audit_permission', lambda: w.permissions.check(
                permission_ref, actor_ref, scope, 'audit_goal', where))
            ctx = dict(wrapper=copy.deepcopy(wrapper))
            w.boundary(method, 'before_release', ctx)
            final = self.read_receipt_private(request, where + '/final')
            require(where + '/final_receipt', A.same(final, wrapper) and A.same(ctx['wrapper'], wrapper))
            w.permissions.check(permission_ref, actor_ref, scope, 'audit_goal', where + '/final')
            w.installation.require_installed(where + '/final')
            return slot.set(wrapper)


class LifecycleOwner(DurableOwner):
    """Independent TEST_ONLY lifecycle owner issuing metadata change authority."""
    role = 'goal_lifecycle'
    config_role = 'goal_lifecycle'
    table = 'dgu_lifecycle'

    def change(self, scope, state, blocked_reason_ref=None):
        w = self.world
        with self.recorder.call(self.owner_id, 'lifecycle.change', dict(state=state)) as slot:
            authority = 'TEST_ONLY:lifecycle-authority:' + uuid.uuid4().hex
            self.put(authority, dict(qualification=QUALIFICATION, scope=scope, state=state,
                                     blocked_reason_ref=blocked_reason_ref, issued_at=w.now()), new=True)
            out = w.body.metadata_update(scope, dict(state=state, blocked_reason_ref=blocked_reason_ref), authority)
            return slot.set(out)


# ------------------------------------------------------------------ SP-299 update source owner

class UpdateSourceOwner(PhysicalMixin, DurableOwner):
    """storage.goal_update.capture_original_source.v1 / advance_original_progress.v1
    and the two semantic readers (command audit, input)."""
    role = 'goal_update_source'
    config_role = 'goal_update_source'
    table = 'dgu_update_source'

    def _wrap(self, family, record):
        ids = {T_SOURCE: 'pm.storage_value.goal_update_source_audit.v1',
               T_INPUT: 'pm.storage_value.goal_update_input_content.v1',
               T_PROGRESS: 'pm.storage_value.goal_update_progress.v1'}
        return dict(schema_id=ids[family], schema_version='1.0.0', record=record)

    ROOTS = {T_SOURCE: UPDATE_URI + '#/$defs/StorageSourceAudit', T_INPUT: UPDATE_URI + '#/$defs/StorageInputContent',
             T_PROGRESS: UPDATE_URI + '#/$defs/StorageProgress'}

    def read_source(self, scope, op, where):
        key = upd_key(T_SOURCE, scope, op)
        cell = self.storage.cell(T_SOURCE, key)
        require(where + '/source_unavailable', cell is not None)
        wrapper = self.unwrap_row(T_SOURCE, key, cell['value'], self.ROOTS[T_SOURCE])
        rec = wrapper['record']
        require(where + '/source_scope', rec['storage_instance_id'] == scope['storage_instance_id'] and
                rec['project_id'] == scope['project_id'] and rec['thread_id'] == scope['thread_id'] and
                rec['goal_id'] == scope['goal_id'] and rec['normalized_identity']['operation_id'] == op)
        return wrapper

    def read_input(self, scope, op, where):
        key = upd_key(T_INPUT, scope, op)
        cell = self.storage.cell(T_INPUT, key)
        require(where + '/input_unavailable', cell is not None)
        return self.unwrap_row(T_INPUT, key, cell['value'], self.ROOTS[T_INPUT])

    def read_progress(self, scope, op, where, epoch=None):
        hkey = head_key(scope, op)
        hcell = self.storage.cell(T_PROGRESS, hkey)
        require(where + '/progress_unavailable', hcell is not None)
        head = self.unwrap_row(T_PROGRESS, hkey, hcell['value'], self.ROOTS[T_PROGRESS])
        require(where + '/head_record', head['record']['schema_id'] == 'pm.goal.update.progress_head.v1')
        e = head['record']['progress_epoch'] if epoch is None else epoch
        skey = epoch_key(scope, op, e)
        scell = self.storage.cell(T_PROGRESS, skey)
        require(where + '/snapshot_unavailable', scell is not None)
        snap = self.unwrap_row(T_PROGRESS, skey, scell['value'], self.ROOTS[T_PROGRESS])
        require(where + '/snapshot_record', snap['record']['schema_id'] == 'pm.goal.update.progress.v1' and
                snap['record']['progress_epoch'] == e and snap['record']['operation_id'] == op)
        if epoch is None:
            require(where + '/head_snapshot', head['record']['snapshot_sha256'] == wrapper_sha(snap))
        return head, snap, skey, snap

    def progress_writes(self, scope, op, record, head_version):
        """Immutable epoch snapshot (absent CAS) + head (version CAS) for a joint transaction."""
        self.bank.validate(UPDATE_URI + '#/$defs/Progress', record, 'dgu/progress')
        snap = self._wrap(T_PROGRESS, record)
        skey = epoch_key(scope, op, record['progress_epoch'])
        head = dict(schema_id='pm.goal.update.progress_head.v1', schema_version='1.0.0',
                    storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                    thread_id=scope['thread_id'], goal_id=scope['goal_id'], operation_id=op,
                    progress_epoch=record['progress_epoch'], snapshot_sha256=wrapper_sha(snap))
        hkey = head_key(scope, op)
        return [dict(table=T_PROGRESS, key=skey, expected=None, value=self.physical(T_PROGRESS, skey, snap,
                                                                                    'authority_indefinite')),
                dict(table=T_PROGRESS, key=hkey, expected=head_version,
                     value=self.physical(T_PROGRESS, hkey, self._wrap(T_PROGRESS, head), 'authority_indefinite'))]

    def head_version(self, scope, op):
        cell = self.storage.cell(T_PROGRESS, head_key(scope, op))
        return None if cell is None else cell['version']

    def advance(self, scope, op, record, *, expected_phase, where):
        head, snap, _, _ = self.read_progress(scope, op, where)
        require(where + '/phase_edge', snap['record']['phase'] in expected_phase)
        require(where + '/epoch_edge', record['progress_epoch'] == snap['record']['progress_epoch'] + 1)
        self.world.transact(self.progress_writes(scope, op, record, self.head_version(scope, op)))
        return record

    # U0 -------------------------------------------------------------------
    def capture(self, adm, acceptance_evidence, where='dgu/source/capture'):
        w = self.world
        method = 'source.capture'
        req, ni = adm['request'], adm['normalized_identity']
        scope = scope_of(req, w.storage.storage_instance_id)
        op = ni['operation_id']
        with self.recorder.call(self.owner_id, method, dict(operation_id=op)) as slot:
            existing = self.storage.cell(T_SOURCE, upd_key(T_SOURCE, scope, op))
            if existing is not None:
                inp = self.read_input(scope, op, where)
                require(where + '/request_conflict', A.same(inp['record']['request'], req))
                return slot.set(dict(replay=True, source=self.read_source(scope, op, where)['record']))
            w.helper(self.owner_id, method, 'installation', lambda: w.installation.require_installed(where))
            w.helper(self.owner_id, method, 'permission', lambda: w.permissions.check(
                req['permission_snapshot_ref'], req['actor_ref'], scope, 'update_goal', where))
            w.helper(self.owner_id, method, 'content', lambda: w.threads.require_content(scope, where))
            cur = w.helper(self.owner_id, method, 'current_goal', lambda: w.body.read_private(scope, where))
            body, control = cur['body'], cur['control']
            require(where + '/stale_goal_revision', body['revision'] == req['expected_revision'])
            require(where + '/stale_currentness', body['currentness_hash'] == req['expected_currentness_hash'])
            require(where + '/completed_refusal', body['state'] in EDITABLE)
            require(where + '/pending_reservation', control['pending'] is None)
            require(where + '/cancellation_associated', control['cancellation_receipt_ref'] is None)
            stop = w.helper(self.owner_id, method, 'stop', lambda: w.stops.current(scope['goal_id']))
            require(where + '/manual_stop_latched', not stop['stop_latched'])
            plan = w.helper(self.owner_id, method, 'plan_binding', lambda: w.plans.current(scope['goal_id']))
            require(where + '/plan_material_conflict', plan is None or not plan['material_conflict'])
            require(where + '/plan_binding_scope', plan is None or (plan['goal_id'] == scope['goal_id'] and
                                                                    plan['project_id'] == scope['project_id']))
            acceptance = w.helper(self.owner_id, method, 'acceptance', lambda: acceptance_evidence(cur, where + '/acceptance'))
            event_id, event_key = event_identity(scope['storage_instance_id'], scope['project_id'],
                                                 scope['thread_id'], req['command_instance_id'], op, scope['goal_id'])
            source = dict(schema_id='pm.goal.update.source_audit.v1', schema_version='1.0.0',
                          storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                          thread_id=scope['thread_id'], goal_id=scope['goal_id'], normalized_identity=ni,
                          dispatch_id=adm['dispatch_id'], command_outcome_ref=adm['command_outcome_ref'],
                          actor_ref=req['actor_ref'], permission_snapshot_ref=req['permission_snapshot_ref'],
                          source_surface=req['source_surface'], return_route_ref=req['return_route_ref'],
                          acceptance=acceptance['acceptance'], owner_epoch=w.body.owner_epoch,
                          stop_epoch=stop['user_stop_epoch'], expected_revision=req['expected_revision'],
                          expected_currentness_hash=req['expected_currentness_hash'],
                          prior_objective_revision=control['latest_objective_revision'],
                          prior_revision_hash=control['latest_revision_hash'],
                          accepted_text_sha256=text_sha(req['objective_text']),
                          source_authority_ref=adm['source_authority_ref'], captured_at=w.now(),
                          nonterminal_outcome=adm['nonterminal_outcome'])
            source_w = self._wrap(T_SOURCE, source)
            self.bank.validate(self.ROOTS[T_SOURCE], source_w, where + '/source')
            source_sha = wrapper_sha(source_w)
            inp = dict(schema_id='pm.goal.update.input_content.v1', schema_version='1.0.0',
                       storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                       thread_id=scope['thread_id'], goal_id=scope['goal_id'], operation_id=op,
                       source_audit_sha256=source_sha, request=copy.deepcopy(req))
            input_w = self._wrap(T_INPUT, inp)
            self.bank.validate(self.ROOTS[T_INPUT], input_w, where + '/input')
            metadata = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project', event_id=event_id,
                            event_type='goal.updated', project_id=scope['project_id'], thread_id=scope['thread_id'],
                            run_id=None, node_id=None, attempt_id=None, actor_ref=req['actor_ref'],
                            requested_account_ref=None, effective_account_ref=None,
                            occurred_at_utc=adm['accepted_at'], producer_sequence_id=None,
                            correlation_id='correlation:TEST_ONLY:' + hexk(adm['dispatch_id']),
                            causation_event_id=None, parent_event_id=None, idempotency_key=event_key,
                            payload_schema_id=PAYLOAD_URI, payload_ref=None, redaction_profile='no_secrets',
                            replay_policy='dedupe_by_idempotency_key',
                            migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None,
                                           migration_id=None, compatibility_event_type=None))
            NR.event_time(metadata['occurred_at_utc'], where + '/occurred_at_utc')
            prepared = w.helper(self.owner_id, method, 'producer_preparedness', lambda: self.prepared_event(
                metadata, scope, cur, adm, acceptance['acceptance'], op, where))
            require(where + '/event_unrepresentable', len(msgpack(prepared, where + '/prepared_event')) <= CAP)
            progress = dict(schema_id='pm.goal.update.progress.v1', schema_version='1.0.0',
                            storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                            thread_id=scope['thread_id'], goal_id=scope['goal_id'], operation_id=op,
                            source_audit_sha256=source_sha, progress_epoch=0, producer_metadata=metadata,
                            pending_intent_sha256=None, reserved_control_sha256=None, body_commit=None,
                            producer_input=None, publication=None,
                            resolution_authority_ref=adm['source_authority_ref'], phase='source_admitted')
            ctx = dict(source=source, request=copy.deepcopy(req))
            expected = copy.deepcopy(ctx)
            w.boundary(method, 'before_release', ctx)
            # Final held boundary: recheck every captured fact and the candidate.
            final = w.body.read_private(scope, where + '/final')
            require(where + '/final_goal', A.same(final['body'], body) and A.same(final['control'], control))
            require(where + '/final_candidate', A.same(ctx['source'], expected['source']) and
                    A.same(ctx['request'], expected['request']) and A.same(ctx['request'], req))
            w.permissions.check(req['permission_snapshot_ref'], req['actor_ref'], scope, 'update_goal', where + '/final')
            w.threads.require_content(scope, where + '/final')
            stop2 = w.stops.current(scope['goal_id'])
            require(where + '/final_stop', not stop2['stop_latched'])
            require(where + '/final_stop_epoch', stop2['user_stop_epoch'] == stop['user_stop_epoch'])
            plan2 = w.plans.current(scope['goal_id'])
            require(where + '/final_plan', A.same(plan2, plan))
            acceptance_evidence(final, where + '/final/acceptance')
            w.installation.require_installed(where + '/final')
            skey = upd_key(T_SOURCE, scope, op)
            ikey = upd_key(T_INPUT, scope, op)
            writes = [dict(table=T_SOURCE, key=skey, expected=None,
                           value=self.physical(T_SOURCE, skey, source_w, 'authority_indefinite')),
                      dict(table=T_INPUT, key=ikey, expected=None,
                           value=self.physical(T_INPUT, ikey, input_w, 'bound_thread'))]
            writes += self.progress_writes(scope, op, progress, None)
            writes.append(dict(table=self.table, key='capture:' + hexk(op), expected=None, value=dict(
                qualification=QUALIFICATION, operation_id=op,
                plan_binding_epoch=None if plan is None else plan['binding_epoch'],
                plan_run_ref=None if plan is None else plan['plan_run_ref'])))
            self.world.transact(writes)
            w.crash('after_source_capture')
            return slot.set(dict(replay=False, source=source))

    def prepared_event(self, metadata, scope, cur, adm, acc, op, where):
        """Independent post-body producer preparedness (SP-299 step 1): the complete
        EventRecord the producer would append, at its largest field values, against
        the installed ProducerInput root. It names no future receipt."""
        n = cur['body']['revision']
        h = '0' * 64
        payload = dict(project_id=scope['project_id'], thread_id=scope['thread_id'], goal_id=scope['goal_id'],
                       before_revision=n, before_currentness_hash=h, revision=n + 1, currentness_hash=h,
                       accepted_objective_revision=n + 1, accepted_revision_hash=h, prior_revision_hash=h,
                       objective_revision_ref=rev_key(scope['project_id'], scope['goal_id'], n + 1),
                       change_source=acc['change_source'], source_message_id=acc['source_message_id'],
                       approval_id=acc['approval_id'], original_action_ref=adm['normalized_identity']['request_ref'],
                       body_receipt_request=dict(reader_binding='reader.goal.body_mutation_receipt@1.0.0',
                                                 storage_instance_id=scope['storage_instance_id'],
                                                 project_id=scope['project_id'], goal_id=scope['goal_id'],
                                                 operation_id=op, intent_sha256=h),
                       body_receipt_sha256=h, source_refs=[acc['source_context_manifest_ref']])
        producer = dict(metadata, payload=payload)
        self.bank.validate(UPDATE_URI + '#/$defs/ProducerInput', producer, where + '/prepared_producer')
        return dict(producer, observed_at_utc='9999-12-31T23:59:59.999Z', persisted_at_utc='9999-12-31T23:59:59.999Z',
                    sequence_id=2 ** 64 - 1)

    def no_effect_progress(self, scope, op, snap, where):
        p = snap['record']
        record = dict(p, progress_epoch=p['progress_epoch'] + 1, phase='no_effect', body_commit=None,
                      producer_input=None, publication=None)
        return record

    # readers ----------------------------------------------------------------
    def read_audit(self, request, actor_ref, permission_ref, where='dgu/reader/audit'):
        """reader.goal.update_command_audit@1.0.0: content-free, no body visibility needed."""
        w = self.world
        method = 'reader.audit'
        with self.recorder.call(self.owner_id, method) as slot:
            w.consumer_bank.validate(CONSUMER_URI + '#/$defs/AuditReadRequest', request, where + '/request')
            scope = dict(storage_instance_id=request['storage_instance_id'], project_id=request['project_id'],
                         thread_id=request['thread_id'], goal_id=request['goal_id'])
            require(where + '/foreign_storage', scope['storage_instance_id'] == w.storage.storage_instance_id)
            op = request['operation_id']
            w.helper(self.owner_id, method, 'audit_permission', lambda: w.permissions.check(
                permission_ref, actor_ref, scope, 'audit_goal', where))
            src = w.helper(self.owner_id, method, 'source', lambda: self.read_source(scope, op, where))
            sel = request['selection']
            epoch = sel['selector']['progress_epoch'] if sel['kind'] == 'immutable_progress' else None
            terminal = None
            if sel['kind'] == 'terminal_members':
                tkey = upd_key(T_TERMINAL, scope, op)
                cell = self.storage.cell(T_TERMINAL, tkey)
                require(where + '/terminal_pending', cell is not None)
                terminal = self.unwrap_row(T_TERMINAL, tkey, cell['value'], UPDATE_URI + '#/$defs/StorageTerminal',
                                           owner_id=w.ids['sir'])
                epoch = terminal['record']['terminal_progress_selector']['progress_epoch']
            head, snap, skey, svalue = w.helper(self.owner_id, method, 'progress',
                                                lambda: self.read_progress(scope, op, where, epoch=epoch))
            if sel['kind'] == 'immutable_progress':
                require(where + '/selector_key', sel['selector']['snapshot_key'] == skey and
                        all(sel['selector'][k] == scope[k] for k in scope) and sel['selector']['operation_id'] == op)
            require(where + '/source_join', snap['record']['source_audit_sha256'] == wrapper_sha(src))
            if terminal is not None:
                require(where + '/terminal_progress_join', terminal['record']['terminal_progress_sha256'] ==
                        wrapper_sha(snap) and terminal['record']['source_audit_sha256'] == wrapper_sha(src))
            selector = dict(storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                            thread_id=scope['thread_id'], goal_id=scope['goal_id'], operation_id=op,
                            progress_epoch=snap['record']['progress_epoch'], snapshot_key=skey)
            out = dict(reader_binding='reader.goal.update_command_audit@1.0.0', request=request, source_audit=src,
                       progress_selector=selector, progress=snap, action_authority='none',
                       checkpoint_effect='none_required')
            root = 'AuditedProgress'
            if terminal is not None:
                out['terminal'] = terminal
                root = 'AuditedTerminal'
            w.consumer_bank.validate(CONSUMER_URI + '#/$defs/' + root, out, where + '/result')
            ctx = dict(out=copy.deepcopy(out))
            w.boundary(method, 'before_release', ctx)
            require(where + '/final_candidate', A.same(ctx['out'], out))
            src2 = self.read_source(scope, op, where + '/final')
            require(where + '/final_source', A.same(src2, src))
            w.permissions.check(permission_ref, actor_ref, scope, 'audit_goal', where + '/final')
            w.installation.require_installed(where + '/final')
            return slot.set(out)

    def read_input_content(self, request, actor_ref, permission_ref, where='dgu/reader/input'):
        """reader.goal.update_input@1.0.0: current thread content authority required."""
        w = self.world
        method = 'reader.input'
        with self.recorder.call(self.owner_id, method) as slot:
            w.consumer_bank.validate(CONSUMER_URI + '#/$defs/InputReadRequest', request, where + '/request')
            scope = dict(storage_instance_id=request['storage_instance_id'], project_id=request['project_id'],
                         thread_id=request['thread_id'], goal_id=request['goal_id'])
            require(where + '/foreign_storage', scope['storage_instance_id'] == w.storage.storage_instance_id)
            op = request['operation_id']
            w.helper(self.owner_id, method, 'content_permission', lambda: w.permissions.check(
                permission_ref, actor_ref, scope, 'read_goal', where))
            w.helper(self.owner_id, method, 'content', lambda: w.threads.require_content(scope, where))
            src = w.helper(self.owner_id, method, 'source', lambda: self.read_source(scope, op, where))
            inp = w.helper(self.owner_id, method, 'input', lambda: self.read_input(scope, op, where))
            require(where + '/source_join', inp['record']['source_audit_sha256'] == wrapper_sha(src))
            require(where + '/text_commitment', text_sha(inp['record']['request']['objective_text']) ==
                    src['record']['accepted_text_sha256'])
            out = dict(reader_binding='reader.goal.update_input@1.0.0', request=request, input=inp,
                       action_authority='none', checkpoint_effect='none_required')
            w.consumer_bank.validate(CONSUMER_URI + '#/$defs/InputReadResult', out, where + '/result')
            ctx = dict(out=copy.deepcopy(out))
            w.boundary(method, 'before_release', ctx)
            require(where + '/final_candidate', A.same(ctx['out'], out))
            w.permissions.check(permission_ref, actor_ref, scope, 'read_goal', where + '/final')
            w.threads.require_content(scope, where + '/final')
            w.installation.require_installed(where + '/final')
            return slot.set(out)


# ------------------------------------------------------------------ producer (U3)

class UpdateProducer(DurableOwner):
    """Frozen ProducerInput and the one Storage append through the adapter AppendOwner."""
    role = 'goal_update_producer'
    config_role = 'goal_update_producer'
    table = 'dgu_update_producer'

    def __init__(self, world, **kwargs):
        super().__init__(world, **kwargs)
        self.appender = A.AppendOwner(world.registry, world.storage, owner_id=world.ids['append'],
                                      bank=world.update_bank)

    def freeze(self, scope, op, where='dgu/producer/freeze'):
        w = self.world
        method = 'producer.freeze'
        with self.recorder.call(self.owner_id, method, dict(operation_id=op)) as slot:
            head, snap, skey, _ = w.helper(self.owner_id, method, 'progress',
                                           lambda: w.source.read_progress(scope, op, where))
            p = snap['record']
            if p['phase'] in ('event_ready', 'event_unknown', 'event_issued'):
                return slot.set(dict(replay=True, producer_input=p['producer_input']))
            require(where + '/phase', p['phase'] == 'body_committed')
            src = w.helper(self.owner_id, method, 'source', lambda: w.source.read_source(scope, op, where))
            bc = p['body_commit']
            receipt_w = w.helper(self.owner_id, method, 'receipt', lambda: w.body.read_receipt_private(
                bc['receipt_request'], where))
            require(where + '/receipt_join', wrapper_sha(receipt_w) == bc['receipt_sha256'])
            receipt = receipt_w['record']
            rkey = rev_key(scope['project_id'], scope['goal_id'], receipt['accepted_objective_revision'])
            accepted, _ = w.helper(self.owner_id, method, 'accepted_revision', lambda: w.body.read_row(
                T_REV, rkey, where))
            s = src['record']
            acc = s['acceptance']
            require(where + '/accepted_source', accepted['change_source'] == acc['change_source'] and
                    accepted['source_message_id'] == acc['source_message_id'] and
                    accepted['approval_id'] == acc['approval_id'] and
                    text_sha(accepted['objective_text']) == s['accepted_text_sha256'])
            payload = dict(project_id=scope['project_id'], thread_id=scope['thread_id'], goal_id=scope['goal_id'],
                           before_revision=receipt['before_revision'],
                           before_currentness_hash=receipt['before_currentness_hash'], revision=receipt['after_revision'],
                           currentness_hash=receipt['after_currentness_hash'],
                           accepted_objective_revision=receipt['accepted_objective_revision'],
                           accepted_revision_hash=receipt['accepted_revision_hash'],
                           prior_revision_hash=accepted['prior_revision_hash'], objective_revision_ref=rkey,
                           change_source=acc['change_source'], source_message_id=acc['source_message_id'],
                           approval_id=acc['approval_id'], original_action_ref=s['normalized_identity']['request_ref'],
                           body_receipt_request=bc['receipt_request'], body_receipt_sha256=bc['receipt_sha256'],
                           source_refs=[acc['source_context_manifest_ref']])
            meta = p['producer_metadata']
            ni = s['normalized_identity']
            require(where + '/event_identity', event_identity(
                s['storage_instance_id'], ni['owner_identity']['project_id'], ni['owner_identity']['thread_id'],
                ni['command_instance_id'], ni['operation_id'], s['goal_id']) == (meta['event_id'],
                                                                                  meta['idempotency_key']))
            producer_input = dict(p['producer_metadata'], payload=payload)
            self.bank.validate(UPDATE_URI + '#/$defs/ProducerInput', producer_input, where + '/producer_input')
            ctx = dict(producer_input=producer_input)
            expected = copy.deepcopy(producer_input)
            w.boundary(method, 'before_release', ctx)
            require(where + '/final_candidate', A.same(ctx['producer_input'], expected))
            head2, snap2, _, _ = w.source.read_progress(scope, op, where + '/final')
            require(where + '/final_head', A.same(snap2['record'], p))
            record = dict(p, progress_epoch=p['progress_epoch'] + 1, phase='event_ready',
                          producer_input=ctx['producer_input'])
            w.source.advance(scope, op, record, expected_phase=('body_committed',), where=where)
            w.crash('after_freeze')
            return slot.set(dict(replay=False, producer_input=producer_input))

    def publish(self, scope, op, where='dgu/producer/publish'):
        w = self.world
        method = 'producer.publish'
        with self.recorder.call(self.owner_id, method, dict(operation_id=op)) as slot:
            head, snap, _, _ = w.helper(self.owner_id, method, 'progress',
                                        lambda: w.source.read_progress(scope, op, where))
            p = snap['record']
            if p['phase'] == 'event_issued':
                return slot.set(dict(replay=True, publication=p['publication']))
            require(where + '/phase', p['phase'] in ('event_ready', 'event_unknown'))
            candidate = copy.deepcopy(p['producer_input'])
            self.bank.validate(UPDATE_URI + '#/$defs/ProducerInput', candidate, where + '/producer_input')
            require(where + '/frozen_identity', candidate['event_id'] == p['producer_metadata']['event_id'] and
                    candidate['idempotency_key'] == p['producer_metadata']['idempotency_key'])
            w.helper(self.owner_id, method, 'installation', lambda: w.installation.require_installed(where))
            ctx = dict(candidate=candidate)
            w.boundary(method, 'before_release', ctx)
            require(where + '/final_candidate', A.same(ctx['candidate'], p['producer_input']))
            w.installation.require_installed(where + '/final')
            request = dict(kind='TEST_ONLY:goal.updated.append', operation_id=op, event_id=candidate['event_id'],
                           producer_input_sha256=sha(msgpack(candidate)))
            events, reservation, outcome = self.appender.append_original('goal-update-append:' + op, request, [candidate])
            stored = self.appender.event(events[0])
            receipt = self.appender.first_receipt(events[0])
            require(where + '/stored_producer', A.same(S.producer25(stored), p['producer_input']))
            require(where + '/storage_assigned', receipt['first_append_receipt']['sequence_id'] == stored['sequence_id'])
            publication = dict(event_id=stored['event_id'], first_append_receipt=receipt['first_append_receipt'],
                               original_append_result=dict(event_id=stored['event_id'], sequence_id=stored['sequence_id'],
                                                           byte_offset=receipt['first_append_receipt']['byte_offset'],
                                                           segment_ref=receipt['original_segment_ref']),
                               original_event_value_commitment=receipt['original_event_value_commitment'])
            self.bank.validate(UPDATE_URI + '#/$defs/OriginalPublication', publication, where + '/publication')
            record = dict(p, progress_epoch=p['progress_epoch'] + 1, phase='event_issued', publication=publication)
            w.source.advance(scope, op, record, expected_phase=('event_ready', 'event_unknown'), where=where)
            w.crash('after_publication_progress')
            return slot.set(dict(replay=False, publication=publication, outcome=outcome))


# ------------------------------------------------------------------ SP-299 event inspection (U4)

class EventInspector(DurableOwner):
    """storage.goal_updated.inspect_current.v1@1.0.0 over the whole generic source."""
    role = 'goal_updated_inspector'
    config_role = 'goal_updated_inspector'
    table = 'dgu_inspector'

    @staticmethod
    def index_key(event):
        return 'eri.v1:%s:%s:%s' % (S.scope_partition(event), S.k_component(event['event_type']),
                                    S.k_component(event['idempotency_key']))

    @staticmethod
    def index_value_sha(row):
        return sha(NR.binding_value_bytes(['pm.goal_test.event_index_row.v1', row.event_id, row.sequence_id,
                                           row.segment_generation, row.offset, row.length, row.frame_sha256,
                                           row.group_digest], 'dgu/index_row'))

    def request_for(self, scope, event_id):
        info = self.storage.events.get(event_id)
        require('dgu/inspect/event_unavailable', info is not None)
        event = self.storage.read_event(event_id)
        return dict(reader_binding='storage.goal_updated.inspect_current.v1@1.0.0',
                    storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                    thread_id=scope['thread_id'], goal_id=scope['goal_id'], event_id=event_id,
                    sequence_id=info['sequence_id'], selected_index_key=self.index_key(event))

    def inspect(self, request, actor_ref, permission_ref, where='dgu/inspect', snapshot=None):
        w = self.world
        method = 'inspect'
        bank = w.consumer_bank
        with self.recorder.call(self.owner_id, method) as slot:
            bank.validate(CONSUMER_URI + '#/$defs/EventReadRequest', request, where + '/request')
            exact_int(request['sequence_id'], where + '/sequence_id', minimum=0)
            scope = dict(storage_instance_id=request['storage_instance_id'], project_id=request['project_id'],
                         thread_id=request['thread_id'], goal_id=request['goal_id'])
            require(where + '/foreign_storage', scope['storage_instance_id'] == w.storage.storage_instance_id)
            w.helper(self.owner_id, method, 'audit_permission', lambda: w.permissions.check(
                permission_ref, actor_ref, scope, 'audit_goal', where))
            w.helper(self.owner_id, method, 'installation', lambda: w.installation.require_installed(where))
            source = GSRC.GenericSource(w.storage)
            raw_snapshot = snapshot if snapshot is not None else w.storage.acquire_source()
            snap = w.helper(self.owner_id, method, 'generic_source', lambda: source.acquire(raw_snapshot))
            row = next((r for r in snap.rows if r.event_id == request['event_id']), None)
            if row is None:
                require(where + '/source_defect', snap.defect is None)
                refuse(where + '/event_unavailable')
            require(where + '/source_defect_before_event', snap.defect is None or snap.defect[1] > row.position)
            require(where + '/sequence', row.sequence_id == request['sequence_id'])
            event = row.event
            require(where + '/selected_index_key', self.index_key(event) == request['selected_index_key'])
            require(where + '/original_custody_unavailable', row.custody is not None)
            require(where + '/unsupported_payload', event['event_type'] == 'goal.updated' and
                    event['payload_schema_id'] == PAYLOAD_URI and event['scope_kind'] == 'project')
            bank.validate(CONSUMER_URI + '#/$defs/SelectedActiveEvent', event, where + '/event')
            payload = event['payload']
            require(where + '/event_scope', event['project_id'] == scope['project_id'] and
                    event['thread_id'] == scope['thread_id'] and payload['goal_id'] == scope['goal_id'] and
                    payload['project_id'] == scope['project_id'] and payload['thread_id'] == scope['thread_id'])
            op = payload['body_receipt_request']['operation_id']
            src = w.helper(self.owner_id, method, 'source_audit', lambda: w.source.read_source(scope, op, where))
            require(where + '/source_action', src['record']['normalized_identity']['request_ref'] ==
                    payload['original_action_ref'])
            head, prog, skey, _ = w.helper(self.owner_id, method, 'progress', lambda: w.source.read_progress(
                scope, op, where))
            selected = prog
            if prog['record']['phase'] != 'event_issued' or prog['record']['publication'] is None:
                refuse(where + '/original_custody_unavailable')
            pr = selected['record']
            require(where + '/frozen_producer', A.same(S.producer25(event), pr['producer_input']))
            require(where + '/publication_event', pr['publication']['event_id'] == event['event_id'])
            require(where + '/first_receipt', A.same(row.custody['first_append_receipt'],
                                                     pr['publication']['first_append_receipt']))
            require(where + '/full_value', row.custody['original_event_value_commitment']['sha256'] ==
                    NR.full_value_commitment(event, where) == pr['publication']['original_event_value_commitment']['sha256'])
            require(where + '/source_join', pr['source_audit_sha256'] == wrapper_sha(src))
            receipt_w = w.helper(self.owner_id, method, 'body_receipt', lambda: w.body.read_receipt_private(
                payload['body_receipt_request'], where))
            require(where + '/body_receipt', wrapper_sha(receipt_w) == payload['body_receipt_sha256'] ==
                    pr['body_commit']['receipt_sha256'])
            token = dict(snap.token, redb_snapshot_id=snap.snapshot_id)
            observation = dict(reader_binding='storage.goal_updated.inspect_current.v1@1.0.0',
                               storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                               thread_id=scope['thread_id'], goal_id=scope['goal_id'], event_id=event['event_id'],
                               sequence_id=event['sequence_id'], occurred_at_utc=event['occurred_at_utc'],
                               payload_schema_id=PAYLOAD_URI, payload=copy.deepcopy(payload), action_authority='none',
                               checkpoint_effect='none_required')
            witness = dict(request=request, source_read_token=token,
                           current_index_value_sha256=self.index_value_sha(row), current_event=event,
                           source_audit=src, progress_head=head, progress_selector=dict(
                               storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                               thread_id=scope['thread_id'], goal_id=scope['goal_id'], operation_id=op,
                               progress_epoch=pr['progress_epoch'], snapshot_key=skey),
                           progress=selected, body_receipt=receipt_w, original_publication=pr['publication'],
                           installed_resource_graph_sha256=w.installation.current()['installed_resource_graph_sha256'])
            bank.validate(CONSUMER_URI + '#/$defs/EventObservation', observation, where + '/observation')
            bank.validate(CONSUMER_URI + '#/$defs/PrivateEventReadWitness', witness, where + '/witness')
            ctx = dict(observation=copy.deepcopy(observation))
            w.boundary(method, 'before_release', ctx)
            require(where + '/final_candidate', A.same(ctx['observation'], observation))
            # Final held boundary: current disclosure controls and the selected source/token.
            w.permissions.check(permission_ref, actor_ref, scope, 'audit_goal', where + '/final')
            cur = w.installation.require_installed(where + '/final')
            require(where + '/final_installation', cur['installed_resource_graph_sha256'] ==
                    witness['installed_resource_graph_sha256'])
            require(where + '/final_custody', A.same(w.storage.first_custody(event['event_id']), row.custody))
            if snapshot is None:
                now_token = w.storage.read_token()
                require(where + '/final_checkpoint', A.same(now_token, snap.token))
            return slot.set(dict(observation=observation, witness=witness))


# ------------------------------------------------------------------ the update command (composition)

class GoalUpdateCommand:
    """cmd.chat.goal.update composition: SIR admission -> U0 capture -> U1 reserve
    -> U2 commit -> U3 freeze/publish -> U4 terminal, resumable from durable state."""

    def __init__(self, world):
        self.w = world

    # acceptance -----------------------------------------------------------------
    def acceptance_evidence(self, adm, cur, *, where):
        """Direct Save: SIR's original user acceptance, null approval/source message,
        no HITL call. Agent: HITL read_resolution + the actual messages."""
        w = self.w
        req = adm['request']
        context_ref = 'context:TEST_ONLY:' + hexk(adm['dispatch_id'])
        n1 = cur['body']['revision'] + 1
        if req['change_source'] == 'user_direct':
            require(where + '/direct_surface', req['source_surface'] == 'chat_goal_direct_save')
            require(where + '/direct_nulls', req['approval_id'] is None and req['source_message_id'] is None)
            require(where + '/direct_authority', adm['direct_save_authority_ref'] is not None)
            origin = dict(goal_id=req['goal_id'], goal_revision=n1, origin_kind='user_request', source_message_refs=[],
                          source_context_manifest_ref=context_ref, bound_plan_ref=None, owning_workflow_ref=None)
            return dict(acceptance=dict(change_source='user_direct', source_message_id=None, approval_id=None,
                                        original_change_authority_ref=adm['direct_save_authority_ref'],
                                        source_context_manifest_ref=context_ref, origin=origin))
        require(where + '/agent_surface', req['source_surface'] == 'chat_goal_approved_agent')
        evidence = w.approvals.read_resolution(req['approval_id'], where)
        areq = evidence['request']
        target = areq['target']
        require(where + '/approval_target_scope', all(target['scope'][k] == v for k, v in
                                                      scope_of(req, w.storage.storage_instance_id).items()))
        require(where + '/approval_target_revision', target['expected_revision'] == req['expected_revision'] and
                target['expected_currentness_hash'] == req['expected_currentness_hash'])
        require(where + '/approval_target_text', target['objective_text'] == req['objective_text'])
        require(where + '/approval_source_message', areq['source_message_id'] == req['source_message_id'])
        agent = w.chat.read(areq['source_message_id'], where + '/agent')
        instruction = w.chat.read(areq['instruction_message_id'], where + '/instruction')
        require(where + '/agent_message_author', agent['author_kind'] == 'agent')
        require(where + '/instruction_attests', instruction['author_kind'] == 'user' and
                instruction['body'].get('replacement_text') == req['objective_text'] and
                instruction['body'].get('goal_id') == req['goal_id'])
        origin = dict(goal_id=req['goal_id'], goal_revision=n1, origin_kind='user_request',
                      source_message_refs=[req['source_message_id']], source_context_manifest_ref=context_ref,
                      bound_plan_ref=None, owning_workflow_ref=None)
        return dict(acceptance=dict(change_source='agent_proposed_user_approved',
                                    source_message_id=req['source_message_id'], approval_id=req['approval_id'],
                                    original_change_authority_ref=evidence['resolution']['protected_person_decision_ref'],
                                    source_context_manifest_ref=context_ref, origin=origin))

    # steps --------------------------------------------------------------------------
    def admit_and_capture(self, request):
        w = self.w
        adm = w.sir.admit(request)
        out = w.source.capture(adm, lambda cur, where: self.acceptance_evidence(adm, cur, where=where))
        return adm, out

    def _pending(self, adm, src, cur, where):
        w = self.w
        req = adm['request']
        s = src['record']
        body, control = cur['body'], cur['control']
        stop = w.stops.current(req['goal_id'])
        require(where + '/manual_stop_latched', not stop['stop_latched'])
        require(where + '/stop_epoch', stop['user_stop_epoch'] == s['stop_epoch'])
        now = w.now()
        after = dict(body, revision=body['revision'] + 1, objective_text=req['objective_text'], updated_at=now)
        after['currentness_hash'] = currentness(after)
        acc = s['acceptance']
        accepted = dict(goal_id=req['goal_id'], revision=body['revision'] + 1, objective_text=req['objective_text'],
                        change_source=acc['change_source'], source_message_id=acc['source_message_id'],
                        approval_id=acc['approval_id'], prior_revision_hash=control['latest_revision_hash'],
                        created_at=now)
        accepted['revision_hash'] = revision_hash(accepted)
        scope = scope_of(req, w.storage.storage_instance_id)
        pending = dict(operation_id=s['normalized_identity']['operation_id'], owner_ref=w.body.owner_id,
                       owner_epoch=s['owner_epoch'], operation_kind='objective_update',
                       expected_revision=s['expected_revision'], expected_currentness_hash=s['expected_currentness_hash'],
                       expected_stop_epoch=s['stop_epoch'], after_record=after, accepted_revision=accepted,
                       origin=copy.deepcopy(acc['origin']),
                       original_change_authority_ref=acc['original_change_authority_ref'],
                       external_authority_ref=epoch_key(scope, s['normalized_identity']['operation_id'], 0))
        pending['intent_sha256'] = intent_sha(pending)
        return pending

    def reserve(self, adm, where='dgu/command/reserve'):
        w = self.w
        req = adm['request']
        scope = scope_of(req, w.storage.storage_instance_id)
        op = adm['normalized_identity']['operation_id']
        src = w.source.read_source(scope, op, where)
        head, snap, _, _ = w.source.read_progress(scope, op, where)
        p = snap['record']
        if p['phase'] != 'source_admitted':
            cur = w.body.read_private(scope, where)
            return cur['control'] if cur['control']['pending'] and \
                cur['control']['pending']['operation_id'] == op else None
        cur = w.body.read_private(scope, where)
        pending = self._pending(adm, src, cur, where)

        def joined(new_control):
            rec = dict(p, progress_epoch=1, phase='body_reserved', pending_intent_sha256=pending['intent_sha256'],
                       reserved_control_sha256=wrapper_sha(w.body.wrap(T_CONTROL, new_control)))
            return w.source.progress_writes(scope, op, rec, w.source.head_version(scope, op))
        out = w.body.reserve(scope, pending, joined)
        w.crash('after_reserve')
        return out['control']

    def final_checks(self, adm, src):
        """Joint final-boundary predicates; each takes the boundary's own code prefix."""
        w = self.w
        req = adm['request']
        scope = scope_of(req, w.storage.storage_instance_id)
        s = src['record']
        op = s['normalized_identity']['operation_id']
        captured = w.source.state('capture:' + hexk(op))

        def approval(where):
            if req['change_source'] == 'agent_proposed_user_approved':
                ev = w.approvals.read_resolution(req['approval_id'], where + '/approval')
                require(where + '/approval_authority', ev['resolution']['protected_person_decision_ref'] ==
                        s['acceptance']['original_change_authority_ref'])

        def permission(where):
            w.permissions.check(req['permission_snapshot_ref'], req['actor_ref'], scope, 'update_goal', where)

        def stop(where):
            st = w.stops.current(req['goal_id'])
            require(where + '/manual_stop_latched', not st['stop_latched'])
            require(where + '/stop_epoch', st['user_stop_epoch'] == s['stop_epoch'])

        def content(where):
            w.threads.require_content(scope, where)

        def plan(where):
            pl = w.plans.current(req['goal_id'])
            require(where + '/plan_material_conflict', pl is None or not pl['material_conflict'])
            require(where + '/plan_epoch', captured is not None and
                    (None if pl is None else pl['binding_epoch']) == captured['plan_binding_epoch'])

        def installation(where):
            w.installation.require_installed(where)

        def owner_epoch(where):
            require(where + '/owner_epoch', w.body.owner_epoch == s['owner_epoch'])
        return [('approval', approval), ('permission', permission), ('stop', stop), ('content', content),
                ('plan', plan), ('installation', installation), ('owner_epoch', owner_epoch)]

    def commit(self, adm, where='dgu/command/commit'):
        w = self.w
        req = adm['request']
        scope = scope_of(req, w.storage.storage_instance_id)
        op = adm['normalized_identity']['operation_id']
        src = w.source.read_source(scope, op, where)
        head, snap, _, _ = w.source.read_progress(scope, op, where)
        p = snap['record']
        if p['phase'] not in ('body_reserved',):
            return None
        cur = w.body.read_private(scope, where)
        control = cur['control']
        require(where + '/reservation_missing', control['pending'] is not None and
                control['pending']['operation_id'] == op)
        require(where + '/reserved_control_commitment',
                wrapper_sha(w.body.wrap(T_CONTROL, control)) == p['reserved_control_sha256'])

        def joined(receipt):
            rw = w.body.wrap(T_RECEIPT, receipt)
            bc = dict(receipt_request=dict(reader_binding='reader.goal.body_mutation_receipt@1.0.0',
                                           storage_instance_id=scope['storage_instance_id'],
                                           project_id=scope['project_id'], goal_id=scope['goal_id'], operation_id=op,
                                           intent_sha256=receipt['intent_sha256']),
                      receipt_sha256=wrapper_sha(rw), before_revision=receipt['before_revision'],
                      before_currentness_hash=receipt['before_currentness_hash'], after_revision=receipt['after_revision'],
                      after_currentness_hash=receipt['after_currentness_hash'],
                      accepted_revision_hash=receipt['accepted_revision_hash'],
                      prior_revision_hash=control['pending']['accepted_revision']['prior_revision_hash'])
            rec = dict(p, progress_epoch=p['progress_epoch'] + 1, phase='body_committed', body_commit=bc,
                       resolution_authority_ref=src['record']['acceptance']['original_change_authority_ref'])
            return w.source.progress_writes(scope, op, rec, w.source.head_version(scope, op))
        return w.body.commit(scope, control, self.final_checks(adm, src), joined)

    def run(self, request, *, stop_after=None):
        """Execute or resume the whole route from durable state."""
        w = self.w
        adm, cap = self.admit_and_capture(request)
        steps = [('reserve', lambda: self.reserve(adm)), ('commit', lambda: self.commit(adm)),
                 ('freeze', lambda: w.producer.freeze(scope_of(request, w.storage.storage_instance_id),
                                                      adm['normalized_identity']['operation_id'])),
                 ('publish', lambda: w.producer.publish(scope_of(request, w.storage.storage_instance_id),
                                                        adm['normalized_identity']['operation_id'])),
                 ('terminal', lambda: w.sir.terminalize(request['command_instance_id'], 'succeeded'))]
        for name, step in steps:
            if self._terminal_exists(adm):
                break
            step()
            if stop_after == name:
                return adm
        return adm

    def _terminal_exists(self, adm):
        w = self.w
        scope = scope_of(adm['request'], w.storage.storage_instance_id)
        return w.storage.cell(T_TERMINAL, upd_key(T_TERMINAL, scope, adm['normalized_identity']['operation_id'])) \
            is not None

    def classify(self, adm):
        w = self.w
        scope = scope_of(adm['request'], w.storage.storage_instance_id)
        op = adm['normalized_identity']['operation_id']
        if w.storage.cell(T_SOURCE, upd_key(T_SOURCE, scope, op)) is None:
            return 'no_source'
        if self._terminal_exists(adm):
            cell = w.storage.cell(T_TERMINAL, upd_key(T_TERMINAL, scope, op))
            kind = w.source.unwrap_row(T_TERMINAL, upd_key(T_TERMINAL, scope, op), cell['value'],
                                       UPDATE_URI + '#/$defs/StorageTerminal', owner_id=w.ids['sir'])['record']['kind']
            return 'terminal_' + kind
        head, snap, _, _ = w.source.read_progress(scope, op, 'dgu/classify')
        phase = snap['record']['phase']
        if phase == 'event_ready':
            r = w.storage.reservation_state('goal-update-append:' + op)
            if r is not None and r['state'] == 'appended':
                return 'event_ready+appended_without_first_custody'
            if r is not None and r['state'] in ('receipted', 'published'):
                return 'event_ready+receipted'
        return phase

    # U5 and pre-reservation no-effect -------------------------------------------------
    def cancel_before_body(self, command_instance_id, *, error_code='cancelled', status='cancelled',
                           where='dgu/command/cancel'):
        """Confirmed no-effect: release an exact reservation (or refuse from
        source_admitted) and publish the immutable no-effect terminal."""
        w = self.w
        adm = w.sir.admission(command_instance_id, where)
        scope = scope_of(adm['request'], w.storage.storage_instance_id)
        op = adm['normalized_identity']['operation_id']
        head, snap, _, _ = w.source.read_progress(scope, op, where)
        p = snap['record']
        if p['phase'] == 'source_admitted':
            rec = w.source.no_effect_progress(scope, op, snap, where)
            w.source.advance(scope, op, rec, expected_phase=('source_admitted',), where=where)
        elif p['phase'] in ('body_reserved', 'body_unknown'):
            cur = w.body.read_private(scope, where)
            control = cur['control']
            require(where + '/reservation_missing', control['pending'] is not None and
                    control['pending']['operation_id'] == op)

            def joined(new_control):
                rec = w.source.no_effect_progress(scope, op, snap, where)
                return w.source.progress_writes(scope, op, rec, w.source.head_version(scope, op))
            w.body.release(scope, control, joined)
        elif p['phase'] != 'no_effect':
            refuse(where + '/body_effect_exists')
        if self._terminal_exists(adm):
            return w.sir.replay(command_instance_id)
        return w.sir.terminalize(command_instance_id, 'no_effect', error_code=error_code, status=status)

    def mark_unknown(self, command_instance_id, where='dgu/command/unknown'):
        """SIR deadline: record body_unknown / event_unknown by head CAS and publish terminal_unknown."""
        w = self.w
        adm = w.sir.admission(command_instance_id, where)
        scope = scope_of(adm['request'], w.storage.storage_instance_id)
        op = adm['normalized_identity']['operation_id']
        head, snap, _, _ = w.source.read_progress(scope, op, where)
        p = snap['record']
        target = {'body_reserved': 'body_unknown', 'event_ready': 'event_unknown'}.get(p['phase'])
        require(where + '/no_unknown_edge', target is not None)
        rec = dict(p, progress_epoch=p['progress_epoch'] + 1, phase=target)
        w.source.advance(scope, op, rec, expected_phase=(p['phase'],), where=where)
        return w.sir.terminalize(command_instance_id, 'unknown')

    def recover(self, command_instance_id, where='dgu/command/recover'):
        """Owner recovery after an unknown terminal: resolves the original effect
        chain only; never rewrites the terminal or re-dispatches."""
        w = self.w
        adm = w.sir.admission(command_instance_id, where)
        scope = scope_of(adm['request'], w.storage.storage_instance_id)
        op = adm['normalized_identity']['operation_id']
        head, snap, _, _ = w.source.read_progress(scope, op, where)
        p = snap['record']
        if p['phase'] == 'body_unknown':
            receipt = w.storage.cell(T_RECEIPT, receipt_key(scope['project_id'], scope['goal_id'], op))
            # The commit transaction CASes the progress head; once body_unknown is
            # recorded no commit can land, so zero body effect is proved.
            require(where + '/body_unknown_receipt', receipt is None)
            cur = w.body.read_private(scope, where)
            control = cur['control']

            def joined(new_control):
                rec = w.source.no_effect_progress(scope, op, snap, where)
                return w.source.progress_writes(scope, op, rec, w.source.head_version(scope, op))
            w.body.release(scope, control, joined)
            return 'no_effect'
        if p['phase'] == 'event_unknown':
            w.producer.publish(scope, op)
            return 'event_issued'
        return p['phase']


# ------------------------------------------------------------------ scenario setup helpers

def new_world(root, **kwargs):
    return World(root, **kwargs)


def birth_goal(w, *, text='Initial objective 🌱', project=None, thread=None, goal=None, bind_plan=False):
    """Setup lineage through the sole body issuer (no goal.created depth is claimed)."""
    tag = uuid.uuid4().hex[:8]
    scope = dict(storage_instance_id=w.storage.storage_instance_id,
                 project_id=project or ('TEST_ONLY-project-α-' + tag),
                 thread_id=thread or ('thr_TEST_ONLY_' + tag), goal_id=goal or ('goal:TEST_ONLY:α-' + tag))
    w.threads.birth(scope['project_id'], scope['thread_id'])
    w.stops.birth(scope['goal_id'])
    if bind_plan:
        w.plans.bind(scope)
    user = 'actor:TEST_ONLY:user-' + tag
    msg = w.chat.post(scope, 'user', user, dict(kind='goal_create_instruction', text=text))
    w.body.start(scope, text, msg, 'TEST_ONLY:creation-authority:' + tag, 'context:TEST_ONLY:create-' + tag)
    perm = w.permissions.grant(user, scope, ['update_goal', 'read_goal', 'audit_goal', 'approve_goal_update'])
    return dict(scope=scope, user=user, user_permission=perm, tag=tag)


def direct_request(w, g, text, *, expected=None):
    cur = w.body.read_private(g['scope'], 'dgu/setup')
    body = cur['body']
    tag = uuid.uuid4().hex[:10]
    return dict(schema_id='pm.goal.update.request.v2', schema_version='2.0.0', command_id=COMMAND,
                command_instance_id='command:TEST_ONLY:' + tag, project_id=g['scope']['project_id'],
                thread_id=g['scope']['thread_id'], goal_id=g['scope']['goal_id'],
                expected_revision=body['revision'] if expected is None else expected[0],
                expected_currentness_hash=body['currentness_hash'] if expected is None else expected[1],
                actor_ref=g['user'], permission_snapshot_ref=g['user_permission'],
                idempotency_key='sir-idempotency:TEST_ONLY:' + tag, source_surface='chat_goal_direct_save',
                return_route_ref='route:TEST_ONLY:' + tag, objective_text=text, change_source='user_direct',
                source_message_id=None, approval_id=None)


def agent_request(w, g, text, *, decide='approved'):
    """Actual agent proposal: user instruction, agent message, proposal dispatch,
    HITL capture and a protected person decision, then the update request."""
    scope = g['scope']
    cur = w.body.read_private(scope, 'dgu/setup')
    body = cur['body']
    tag = uuid.uuid4().hex[:10]
    agent_actor = 'actor:TEST_ONLY:agent-runtime-' + tag
    agent_perm = w.permissions.grant(agent_actor, scope, ['propose_goal_update'], person=False)
    instruction = w.chat.post(scope, 'user', g['user'], dict(kind='goal_update_instruction', goal_id=scope['goal_id'],
                                                             replacement_text=text))
    agent_msg = w.chat.post(scope, 'agent', agent_actor, dict(kind='goal_update_proposal_message',
                                                              goal_id=scope['goal_id'], replacement_text=text))
    proposal = dict(schema_id='pm.goal.update.proposal_request.v1', schema_version='1.0.0',
                    command_id='cmd.chat.goal.propose_update', command_instance_id='proposal:TEST_ONLY:' + tag,
                    target=dict(scope=scope, expected_revision=body['revision'],
                                expected_currentness_hash=body['currentness_hash'], objective_text=text),
                    actor_ref=agent_actor, permission_snapshot_ref=agent_perm, source_message_id=agent_msg,
                    instruction_message_id=instruction, return_route_ref='route:TEST_ONLY:proposal-' + tag)
    w.sir.admit_proposal(proposal)
    cap = w.approvals.capture(proposal['command_instance_id'])
    approver = 'actor:TEST_ONLY:person-' + tag
    approver_perm = w.permissions.grant(approver, scope, ['approve_goal_update'])
    if decide is not None:
        w.approvals.decide(cap['approval_id'], decide, approver_perm, approver)
    req = dict(schema_id='pm.goal.update.request.v2', schema_version='2.0.0', command_id=COMMAND,
               command_instance_id='command:TEST_ONLY:' + tag, project_id=scope['project_id'],
               thread_id=scope['thread_id'], goal_id=scope['goal_id'], expected_revision=body['revision'],
               expected_currentness_hash=body['currentness_hash'], actor_ref=g['user'],
               permission_snapshot_ref=g['user_permission'], idempotency_key='sir-idempotency:TEST_ONLY:' + tag,
               source_surface='chat_goal_approved_agent', return_route_ref='route:TEST_ONLY:' + tag,
               objective_text=text, change_source='agent_proposed_user_approved', source_message_id=agent_msg,
               approval_id=cap['approval_id'])
    return req, dict(approval_id=cap['approval_id'], agent_message=agent_msg, instruction=instruction,
                     approver=approver, approver_permission=approver_perm, proposal=proposal)


if __name__ == '__main__':
    import sys
    import tempfile
    work = Path(tempfile.mkdtemp(prefix='dgu-owners-', dir=os.environ.get('DGU_WORK')))
    w = World(work / 'w')
    g = birth_goal(w)
    req = direct_request(w, g, '  Updated objective 🌿\n')
    adm = w.command.run(req)
    print(json.dumps(dict(classification=w.command.classify(adm), qualification=QUALIFICATION, native=NATIVE_LINE),
                     indent=1))
