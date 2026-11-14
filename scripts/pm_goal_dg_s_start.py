#!/usr/bin/env python3
"""DG-S TEST_ONLY original Start production for goal_run.started (W3 S1/S2).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

``StartWorld`` births one run through independently registered TEST_ONLY
owners and executes the original Start contract of
``Plans/Executor_Protocol.md`` (``owner.workflow.activation.commit_start.v2``
with its Storage participant ``owner.storage.workflow_start.commit_original.v2``,
profile ``workflow_start_original.v2``):

1. A descriptor owner installs the coordinator descriptor before birth.
2. The native Workflow owner births the run: native body/control at their
   before revision (status ready, activation start_event_pending), the per-run
   StartControl at epoch zero with its OwnerIssueOriginPhysical, and the A4
   prepared outbox. Seven original-input owners, seven activation-source owners,
   the graph/required-set/WorkNode/receipt/staging/readiness owners, the D01
   owner, the launch owner, the runtime owner and the Goal owner each issue their
   whole original value under its exact root.
3. ``commit_start`` acquires every original through the registry only, runs the
   entry joins, prepares the producer submission and the complete
   OriginalWorkflowArgument, persists the StartCandidate (pending StartControl),
   appends the one Event through Storage with a barrier and issues first custody,
   derives native after-images, then Commit, StartControl, StartOrigin, then the
   D01 members, and the Storage participant commits that whole union in one
   transaction under CAS. Only the held invocation returns ``PublicationResult``.
4. ``recover_start`` only classifies the authentic outcome; pending or ambiguous
   partial publication stays fenced and is never completed.
"""
from __future__ import annotations

import copy
import os
from pathlib import Path

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_oracle_common import canonical as common_canonical
import pm_goal_dg_s_world as W
from pm_goal_dg_s_world import require, K, cdigest, same

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
BEFORE_REVISION = 7
BEFORE_ACTIVATION_REVISION = 11
D01_HEAD_REVISION = 7
WORKNODES = 2
START_METHOD = 'owner.workflow.activation.commit_start.v2'
STORAGE_METHOD = 'owner.storage.workflow_start.commit_original.v2'
D01_METHOD = 'owner.executor.workflow_source.update_workflow.v3'
BEGIN_METHOD = 'owner.workflow.activation.begin.v1'
GOAL_BINDING = 'https://puppetmaster.local/schemas/goal_execution_binding_custody/1.0.0/schema.json'
CRASH_EXIT = 73
PREPARE_CUTS = ('after_prepare',)


def d01_families(edition):
    node = edition.bank.lookup(edition.d01 + '#/$defs/WorkflowUpdateAfterimages').contents
    return {k: v['allOf'][1]['properties']['family_id']['const'] for k, v in node['properties'].items()}


def partition_of(project_id):
    return 'project~' + K(project_id)


def idempotency_key(partition, payload):
    body = payload['payload']
    identity = ['pm.goal-runtime-event-idempotency.v3', partition, 'goal_run.started', payload['project_id'],
                payload['goal_id'], payload['goal_revision'], payload['expected_goal_run_revision'],
                payload['goal_run_revision'], body['goal_run_id'], body['workgraph_ref'],
                body['activation_receipt_ref']]
    return 'pm.goal-runtime-event.v3:' + W.sha256(common_canonical(identity))


def event_id_of(partition, key):
    return 'evt-goal_run.started-' + W.sha256(S.binding(['pm.goal_test.dg_s.started_event_id.v1', partition, key]))[:40]


# ------------------------------------------------------------------ owners

class DescriptorOwner(W.DGOwner):
    role = 'start_installed_descriptor'

    def __init__(self, registry, *, ctx=None, edition=None, **kw):
        self.ctx, self.edition = ctx, edition
        super().__init__(registry, **kw)

    def key(self):
        return 'workflow_start_installed_descriptor:%s:%s' % (K(self.ctx.sid), K(self.edition.profile))

    def install(self, edit=None):
        bank = self.edition.bank.original
        pins = []
        for uri in (self.edition.custody, self.edition.d01, self.edition.activation, self.edition.consumer):
            digest, pointer = bank.resource_origins[uri]
            pins.append(dict(retrieval_uri=uri, whole_sha256=digest, json_pointer=pointer))
        goal_digest, goal_pointer = self.edition.goal_bank.original.resource_origins[self.edition.goal_arg]
        pins.append(dict(retrieval_uri=self.edition.goal_arg, whole_sha256=goal_digest, json_pointer=goal_pointer))
        value = dict(qualification=QUALIFICATION, edition=self.edition.name, coordinator_profile=self.edition.profile,
                     issuer_method=self.edition.start_method, storage_method=self.edition.storage_method, d01_method=D01_METHOD,
                     schema_resources=pins, installed_at_utc=self.ctx.now())
        if edit:
            value = edit(value)
        tx = self.ctx.storage.transact([dict(table='workflow_start_installed_descriptor', key=self.key(),
                                             expected=None, value=value)])
        value_with_tx = dict(value, install_tx=tx['tx_id'], install_generation=tx['generation'])
        return self.issue(None, value_with_tx, kind='installed_descriptor')


class NativeOwner(W.DGOwner, A.ActivationOwner):
    """Native Workflow owner: immutable per-revision body/control cells and a
    D01-visible current pointer; StartControl birth at epoch zero."""
    role = 'workflow_native'

    def __init__(self, registry, *, ctx=None, edition=None, **kw):
        self.ctx, self.edition = ctx, edition
        A.ActivationOwner.__init__(self, registry, **kw)

    # keys --------------------------------------------------------------
    def body_key(self, revision):
        return self.ctx.run_key('workflow_goal_run_body', revision)

    def control_key(self, revision):
        return self.ctx.run_key('workflow_goal_run_control', revision)

    def current_key(self):
        return self.ctx.run_key('workflow_goal_run_current')

    def start_control_key(self):
        return 'workflow_start_control.v1:' + ':'.join(K(self.ctx.scope[k]) for k in
                                                       ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id'))

    def outbox_key(self):
        return self.ctx.run_key('workflow_start_prepared_outbox.v1')

    # wrappers ----------------------------------------------------------
    def body_wrapper(self, revision, status, activation_state, activation_revision, edit=None):
        e = self.edition
        b = W.Binder(self.ctx, self.owner_id, 'native_body')
        value = b.bind(W.skeleton(e.bank, e.activation + '#/$defs/GoalRunBodyPhysical'))
        b.commit()
        value['physical_key'] = self.body_key(revision)
        r = value['record']
        r['identity'] = self.ctx.identity()
        r['revision'] = revision
        r['status'] = status
        r['activation_state'].update(state=activation_state, revision=activation_revision,
                                     goal_run_id=self.ctx.goal_run_id, workgraph_ref=self.ctx.workgraph_ref,
                                     activation_id='TEST_ONLY:activation:' + self.ctx.token)
        r['execution_owner_ref'] = self.ctx.workflow_owner['owner_ref']
        r['execution_owner_epoch'] = self.ctx.workflow_owner['owner_epoch']
        if edit:
            value = edit(value)
        return value

    def control_wrapper(self, body):
        e = self.edition
        value = W.skeleton(e.bank, e.activation + '#/$defs/GoalRunControlPhysical')
        value.update(storage_instance_id=self.ctx.sid, physical_key=self.control_key(body['record']['revision']))
        value['record'].update(identity=copy.deepcopy(body['record']['identity']), revision=body['record']['revision'],
                               body_record_sha256=cdigest(body['record']),
                               execution_owner_epoch=body['record']['execution_owner_epoch'], pending_operation_id=None)
        return value

    def birth_run(self, descriptor_handle, descriptor_owner_id, edit_body=None, edit_origin=None):
        """Original birth: native before-state, StartControl epoch 0, its origin, A4 outbox."""
        e, ctx = self.edition, self.ctx
        ref, descriptor = A.acquire(self.registry, descriptor_owner_id, 'start_installed_descriptor',
                                    descriptor_handle)
        require('birth/descriptor_profile', descriptor['coordinator_profile'] == e.profile)
        require('birth/descriptor_cell', ctx.storage.cell('workflow_start_installed_descriptor',
                                                          'workflow_start_installed_descriptor:%s:%s' % (
                                                              K(ctx.sid), K(e.profile))) is not None)
        body = self.body_wrapper(BEFORE_REVISION, 'ready', 'start_event_pending', BEFORE_ACTIVATION_REVISION,
                                 edit_body)
        control = self.control_wrapper(body)
        e.bank.validate(e.activation + '#/$defs/GoalRunBodyPhysical', body, 'birth/body')
        e.bank.validate(e.activation + '#/$defs/GoalRunControlPhysical', control, 'birth/control')
        start_control = W.skeleton(e.bank, e.custody + '#/$defs/StorageControl')
        start_control.update(storage_instance_id=ctx.sid, physical_key=self.start_control_key())
        start_control['record'].update(scope=copy.deepcopy(ctx.scope), epoch=0,
                                       owner=copy.deepcopy(ctx.workflow_owner), pending_candidate=None,
                                       committed_start=None, original_operation_id=None)
        e.bank.validate(e.custody + '#/$defs/StorageControl', start_control, 'birth/start_control')
        b = W.Binder(ctx, self.owner_id, 'start_birth_origin')
        origin = b.bind(W.skeleton(e.bank, e.activation + '#/$defs/OwnerIssueOriginPhysical'))
        b.commit()
        origin['physical_key'] = ctx.run_key('workflow_start_control_origin.v1')
        origin['record'].update(issuer_method=BEGIN_METHOD, owner_ref=ctx.workflow_owner['owner_ref'],
                                owner_epoch=ctx.workflow_owner['owner_epoch'],
                                original_operation_id='TEST_ONLY:birth:' + ctx.token,
                                original_causation_ref='TEST_ONLY:accepted-birth:' + ctx.token,
                                issued_at_utc=ctx.now(), issued_value_key=start_control['physical_key'],
                                issued_record_sha256=cdigest(start_control['record']))
        if edit_origin:
            origin = edit_origin(origin)
        e.bank.validate(e.activation + '#/$defs/OwnerIssueOriginPhysical', origin, 'birth/start_control_origin')
        outbox = dict(qualification=QUALIFICATION, schema_id='pm.storage_value.workflow_start_outbox.v1',
                      schema_version='1.0.0', record=dict(scope=copy.deepcopy(ctx.scope), state='prepared',
                                                          intended_payload_version=2, event=None, receipt=None,
                                                          dispatch_released=False))
        current = dict(qualification=QUALIFICATION, body_key=body['physical_key'],
                       control_key=control['physical_key'], revision=BEFORE_REVISION)
        tx = ctx.storage.transact([
            dict(table='workflow_goal_run_body', key=body['physical_key'], expected=None, value=body),
            dict(table='workflow_goal_run_control', key=control['physical_key'], expected=None, value=control),
            dict(table='workflow_goal_run_current', key=self.current_key(), expected=None, value=current),
            dict(table='workflow_start_control', key=start_control['physical_key'], expected=None, value=start_control),
            dict(table='workflow_start_control_origin', key=origin['physical_key'], expected=None, value=origin),
            dict(table='workflow_start_prepared_outbox', key=self.outbox_key(), expected=None, value=outbox),
        ])
        record = dict(qualification=QUALIFICATION, subject=ctx.goal_run_id, state='start_event_pending',
                      revision=0, descriptor_ref=ref, descriptor_install_tx=descriptor['install_tx'],
                      birth_tx=tx['tx_id'], birth_generation=tx['generation'],
                      body=body, control=control, start_control=start_control, initial_control_origin=origin)
        handle = self.birth(ctx.goal_run_id, 'start_event_pending', value=record)
        return handle, record

    # current truth -------------------------------------------------------
    def current(self):
        cell = self.ctx.storage.cell('workflow_goal_run_current', self.current_key())
        require('native/current_unavailable', cell is not None)
        body = self.ctx.storage.cell('workflow_goal_run_body', cell['value']['body_key'])
        control = self.ctx.storage.cell('workflow_goal_run_control', cell['value']['control_key'])
        require('native/body_unavailable', body is not None and control is not None)
        return dict(pointer=cell, body=body['value'], control=control['value'])

    def start_control(self):
        cell = self.ctx.storage.cell('workflow_start_control', self.start_control_key())
        require('native/start_control_unavailable', cell is not None)
        return cell

    def after_images(self, before_body, operation_id):
        """Native after-images: status running, body revision +1, activation
        start_event_pending->active with revision +1; every other field exact."""
        after = copy.deepcopy(before_body)
        r = after['record']
        r['revision'] = NR.uint64(r['revision'] + 1, 'native/body_revision')
        r['status'] = 'running'
        r['activation_state']['state'] = 'active'
        r['activation_state']['revision'] = NR.uint64(r['activation_state']['revision'] + 1,
                                                      'native/activation_revision')
        after['physical_key'] = self.body_key(r['revision'])
        control = self.control_wrapper(after)
        return after, control

    def transition_receipt(self, operation_id, cause_ref, before_revision):
        """Issue the native transition receipt after the joint commit (CAS-checked)."""
        self.state[self.ctx.goal_run_id] = dict(state='start_event_pending', revision=0,
                                                last=self.state.get(self.ctx.goal_run_id, {}).get('last'))
        return self.transition(self.ctx.goal_run_id, 'start_event_pending', 0, 'active', cause_ref=cause_ref)

    def advance(self, status='running'):
        """A later lawful native advance (new immutable body revision, pointer CAS)."""
        current = self.current()
        body = copy.deepcopy(current['body'])
        body['record']['revision'] = NR.uint64(body['record']['revision'] + 1, 'native/advance')
        body['record']['status'] = status
        body['physical_key'] = self.body_key(body['record']['revision'])
        control = self.control_wrapper(body)
        self.ctx.storage.transact([
            dict(table='workflow_goal_run_body', key=body['physical_key'], expected=None, value=body),
            dict(table='workflow_goal_run_control', key=control['physical_key'], expected=None, value=control),
            dict(table='workflow_goal_run_current', key=self.current_key(), expected=current['pointer']['version'],
                 value=dict(qualification=QUALIFICATION, body_key=body['physical_key'],
                            control_key=control['physical_key'], revision=body['record']['revision']))])
        return body

    def extra_state(self):
        return dict(state=self.state)

    def load_extra(self, extra):
        self.state = (extra or {}).get('state', {})


class GoalOwner(W.WholeSourceOwner):
    """Goal-control realm owner: issues OriginalGoalArgument / CurrentGoalArgument."""
    role = 'goal_controls'

    def wrapper_key(self, name):
        return self.ctx.run_key('goal_controls_' + name)

    def issue_goal_argument(self, root_name='OriginalGoalArgument', edit=None, revision=3, stop_epoch=0,
                            latched=False, native_body=None, birth_tx=None):
        e, ctx = self.edition, self.ctx
        b = W.Binder(ctx, self.owner_id, 'goal_' + root_name)
        value = b.bind(W.skeleton(e.goal_bank, e.goal_arg + '#/$defs/' + root_name))
        body = value['body']['record']
        body.update(revision=revision, state='active', active_run_ref=ctx.goal_run_id)
        value['control']['record'].update(current_revision=revision, latest_objective_revision=revision)
        value['accepted_objective']['record']['revision'] = revision
        value['accepted_origin']['record']['goal_revision'] = revision
        stop = value['stop']['record']
        stop.update(user_stop_epoch=stop_epoch, latched=latched)
        value['binding_revision']['record']['active_run_ref'] = ctx.goal_run_id
        association = W.skeleton(e.goal_bank, GOAL_BINDING + '#/$defs/WorkflowAssociation')
        association.update(active_run_ref=ctx.goal_run_id, execution_owner_ref=ctx.workflow_owner['owner_ref'],
                           execution_owner_epoch=ctx.workflow_owner['owner_epoch'],
                           original_binding_transaction_id=birth_tx,
                           original_run_source=dict(family_id='workflow_goal_run_body',
                                                    physical_key=native_body['physical_key'],
                                                    schema_id=native_body['schema_id'],
                                                    schema_version=native_body['schema_version'],
                                                    codec_id='pm.storage.canonical_msgpack.v1',
                                                    complete_value_sha256=cdigest(native_body)))
        value['binding_revision']['record']['associations'] = [association]
        if edit:
            value = edit(value)
        b.commit()
        writes = []
        for name in ('body', 'control', 'stop', 'binding_revision', 'binding_control'):
            writes.append(dict(table='goal_controls_' + name, key=self.wrapper_key(name) + ':' + K(root_name)
                               + ':' + K(str(self._sequence + 1)), expected=None, value=value[name]))
        ctx.storage.transact(writes)
        handle = self.issue(e.goal_arg + '#/$defs/' + root_name, value, kind=root_name)
        self.cells = getattr(self, 'cells', {})
        self.cells[self._handles[handle]] = {w['table'].replace('goal_controls_', ''): (w['table'], w['key'])
                                            for w in writes}
        return handle

    def live_key(self):
        return self.ctx.run_key('goal_live_stop')

    def latch_stop(self):
        """The host Stop owner latches a real Stop (a Storage write by this owner)."""
        cell = self.ctx.storage.cell('goal_live_stop', self.live_key())
        epoch = 0 if cell is None else cell['value']['user_stop_epoch']
        self.ctx.storage.transact([dict(table='goal_live_stop', key=self.live_key(),
                                        expected=None if cell is None else cell['version'],
                                        value=dict(qualification=QUALIFICATION, latched=True,
                                                   user_stop_epoch=epoch + 1))])

    def current_argument(self):
        """Fresh CurrentGoalArgument from this owner's live state; no Storage write."""
        refs = self.inventory('OriginalGoalArgument')
        require('goal/original_withdrawn', len(refs) == 1)
        record = self._originals[refs[0]]
        value = A.CODECS[self.custody_codec][1](record['raw'])
        live = self.ctx.storage.cell('goal_live_stop', self.live_key())
        if live is not None:
            value['stop']['record'].update(latched=live['value']['latched'],
                                           user_stop_epoch=live['value']['user_stop_epoch'])
        self.edition.goal_bank.validate(self.edition.goal_arg + '#/$defs/CurrentGoalArgument', value,
                                        'goal/current_argument')
        self.issue(self.edition.goal_arg + '#/$defs/CurrentGoalArgument', value, kind='CurrentGoalArgument')
        return value

    def context_commitment(self, handle, goal_argument):
        """GoalContextCommitment: selectors of the cells holding this argument's wrappers."""
        ref = self._ref(handle)
        cells = self.cells[ref]
        out = {}
        for field, name in (('goal_body', 'body'), ('goal_control', 'control'), ('goal_stop', 'stop'),
                            ('binding_revision', 'binding_revision'), ('binding_control', 'binding_control')):
            table, key = cells[name]
            out[field] = W.selector_for(self.ctx, table, key, goal_argument[name])
        out['goal_revision'] = goal_argument['body']['record']['revision']
        out['source_argument_sha256'] = W.source_argument_sha256(goal_argument)
        return out

    def extra_state(self):
        return dict(cells={ref: {n: list(v) for n, v in c.items()} for ref, c in getattr(self, 'cells', {}).items()})

    def load_extra(self, extra):
        self.cells = {ref: {n: tuple(v) for n, v in c.items()} for ref, c in (extra or {}).get('cells', {}).items()}


class RuntimeOwner(W.DGOwner):
    """Original runtime/actor/account context source for the producer."""
    role = 'runtime_resolution'


class D01Owner(W.WholeSourceOwner):
    """Executor D01 workflow source: issues d01_current; publishes the Start lineage."""
    role = 'd01_workflow_source'

    def head_key(self, revision):
        return self.ctx.run_key('executor_workflow_workflow_head', revision)

    def pointer_key(self):
        return self.ctx.run_key('executor_workflow_current_pointer')

    def current_source(self, native):
        """Fresh CurrentSource from present Storage truth; rebinding reuses this
        owner's original selector cells and writes nothing."""
        e, ctx = self.edition, self.ctx
        refs = self.inventory('d01_current')
        require('d01/original_withdrawn', len(refs) == 1)
        value = A.CODECS[self.custody_codec][1](self._originals[refs[0]]['raw'])
        fam = d01_families(e)
        pointer = ctx.storage.cell(fam['pointer'], self.pointer_key())
        head = W.resolve_selector(ctx.storage, pointer['value']['record']['workflow_head'], 'd01/current_head')
        wf = value['workflow']
        wf['current_body'] = copy.deepcopy(native['body']['record'])
        wf['current_control'] = copy.deepcopy(native['control']['record'])
        h = copy.deepcopy(head['record'])
        for k in list(wf['head']):
            if k in h:
                wf['head'][k] = h[k]
        wf['heads'] = [copy.deepcopy(wf['head'])]
        value['pointer'] = copy.deepcopy(pointer['value']['record'])
        e.bank.validate(e.d01 + '#/$defs/CurrentSource', value, 'd01/current_source')
        self.issue(e.d01 + '#/$defs/CurrentSource', value, kind='current_source')
        return value


class StartStorageParticipant(W.DGOwner):
    """``owner.storage.workflow_start.commit_original.v2``: the lower publisher.
    It independently re-checks the whole union and commits it atomically."""
    role = 'workflow_start_storage'


# ------------------------------------------------------------------ world

class StartWorld:
    """One TEST_ONLY execution: Storage, registry, recorder and every owner."""

    def __init__(self, work, edition=None, *, faults=None, reopen=False, token=None, project='TEST_ONLY-project-α',
                 goal='TEST_ONLY:goal:1', run='TEST_ONLY:goal_run:é-🦊', thread='TEST_ONLY:thread:1',
                 segment_target_bytes=65536):
        self.work = Path(work)
        self.edition = edition or W.v3_edition()
        self.registry = A.OwnerRegistry()
        self.recorder = self.registry.recorder
        storage_dir = self.work / 'storage'
        self.storage = (S.TestOwnerStorage.open(storage_dir, faults=faults, segment_target_bytes=segment_target_bytes)
                        if reopen else S.TestOwnerStorage.create(storage_dir, faults=faults,
                                                                 segment_target_bytes=segment_target_bytes))
        self.recorder.observe('storage:' + self.storage.storage_instance_id, self.storage.observe)
        self.token = token or W.new_token()
        self.ctx = W.Context(self.storage, project, goal, run, thread, self.token)
        self.fault = None
        self.handles = {}
        self.owners = {}

    # ---- owner construction (fresh or reopened) ----
    def _owner(self, name, cls, role=None, **kw):
        if role:
            cls = type(cls.__name__ + '_' + name, (cls,), {'role': role})
        owner = cls(self.registry, ctx=self.ctx, edition=self.edition, **kw) if 'ctx' in cls.__init__.__code__.co_varnames \
            else cls(self.registry, **kw)
        owner.edition = self.edition
        owner.ctx = self.ctx
        owner.bank = self.edition.goal_bank if isinstance(owner, GoalOwner) else self.edition.bank
        self.owners[name] = owner
        return owner

    def build_owners(self, ids=None):
        ids = ids or {}
        mk = lambda name, cls, role=None: self._owner(name, cls, role, owner_id=ids.get(name))  # noqa: E731
        mk('descriptor', DescriptorOwner)
        mk('native', NativeOwner)
        mk('goal', GoalOwner)
        mk('runtime', RuntimeOwner)
        mk('d01', D01Owner)
        mk('launch', W.WholeSourceOwner, 'workflow_launch_chain')
        for k in W.SEVEN_INPUTS:
            mk('input:' + k, W.WholeSourceOwner, 'seven_input:' + k)
        for k in W.ACTIVATION_SOURCES:
            mk('activation:' + k, W.WholeSourceOwner, 'activation_source:' + k)
        for k in ('graph', 'required_set', 'worknodes', 'receipts', 'activation_receipt', 'staging', 'readiness',
                  'origins'):
            mk('materialization:' + k, W.WholeSourceOwner, 'materialization:' + k)
        mk('storage_participant', StartStorageParticipant)
        self.appender = A.AppendOwner(self.registry, self.storage, owner_id=ids.get('appender'))
        self.owners['appender'] = self.appender
        self.start = StartOwner(self.registry, world=self, owner_id=ids.get('start'))
        self.owners['start'] = self.start
        return self

    def owner_ids(self):
        return {name: owner.owner_id for name, owner in self.owners.items()}

    # ---- persistence for real child-process cuts ----
    def save(self):
        directory = self.work / 'owners'
        for name, owner in self.owners.items():
            if isinstance(owner, W.DGOwner):
                owner.save(directory)
        refs = {name: [owner_id, self._owner_by_id(owner_id)._handles[h]] for name, (owner_id, h) in
                self.handles.items() if owner_id in {o.owner_id for o in self.owners.values()}}
        meta = dict(token=self.token, ids=self.owner_ids(), refs=refs, edition=self.edition.name,
                    workgraph_sha256=self.ctx.workgraph_sha256, context=dict(
                        project=self.ctx.project_id, goal=self.ctx.goal_id, run=self.ctx.goal_run_id,
                        thread=self.ctx.thread_id))
        S._atomic_write(self.work / 'world.json', W.json.dumps(meta, sort_keys=True, ensure_ascii=False).encode())

    @classmethod
    def reopen(cls, work, edition=None, *, faults=None):
        meta = W.json.loads((Path(work) / 'world.json').read_text())
        c = meta['context']
        world = cls(work, edition, faults=faults, reopen=True, token=meta['token'], project=c['project'],
                    goal=c['goal'], run=c['run'], thread=c['thread'])
        world.ctx.workgraph_sha256 = meta['workgraph_sha256']
        ids = meta['ids']
        world.registry = A.OwnerRegistry()
        world.recorder = world.registry.recorder
        world.recorder.observe('storage:' + world.storage.storage_instance_id, world.storage.observe)
        directory = Path(work) / 'owners'
        world.owners = {}
        specs = world._specs()
        for name, (klass, role) in specs.items():
            if role:
                klass = type(klass.__name__ + '_' + name, (klass,), {'role': role})
            kwargs = dict(ctx=world.ctx, edition=world.edition) if 'ctx' in klass.__init__.__code__.co_varnames else {}
            owner = klass.load(world.registry, directory, ids[name], **kwargs)
            owner.ctx, owner.edition = world.ctx, world.edition
            owner.bank = world.edition.goal_bank if isinstance(owner, GoalOwner) else world.edition.bank
            world.owners[name] = owner
        world.appender = A.AppendOwner(world.registry, world.storage, owner_id=ids['appender'])
        world.owners['appender'] = world.appender
        world.start = StartOwner.load(world.registry, directory, ids['start'], world=world)
        world.owners['start'] = world.start
        world.handles = {name: (owner_id, world._owner_by_id(owner_id).handle_for(ref))
                         for name, (owner_id, ref) in meta['refs'].items()}
        return world

    def _owner_by_id(self, owner_id):
        return next(o for o in self.owners.values() if o.owner_id == owner_id)

    def _specs(self):
        specs = dict(descriptor=(DescriptorOwner, None), native=(NativeOwner, None), goal=(GoalOwner, None),
                     runtime=(RuntimeOwner, None), d01=(D01Owner, None),
                     launch=(W.WholeSourceOwner, 'workflow_launch_chain'),
                     storage_participant=(StartStorageParticipant, None))
        for k in W.SEVEN_INPUTS:
            specs['input:' + k] = (W.WholeSourceOwner, 'seven_input:' + k)
        for k in W.ACTIVATION_SOURCES:
            specs['activation:' + k] = (W.WholeSourceOwner, 'activation_source:' + k)
        for k in ('graph', 'required_set', 'worknodes', 'receipts', 'activation_receipt', 'staging', 'readiness',
                  'origins'):
            specs['materialization:' + k] = (W.WholeSourceOwner, 'materialization:' + k)
        return specs

    # ---- original issuance ----
    def issue_sources(self, edits=None):
        """Every original, in its actual chronological order, from its own owner."""
        edits = edits or {}
        e, ctx, o = self.edition, self.ctx, self.owners
        sk = lambda name: W.skeleton(e.bank, e.custody + '#/$defs/OriginalWorkflowArgument')[name]  # noqa: E731
        whole = W.skeleton(e.bank, e.custody + '#/$defs/OriginalWorkflowArgument')
        h = self.handles
        # 1. installed descriptor before birth
        h['descriptor'] = (o['descriptor'].owner_id, o['descriptor'].install(edits.get('descriptor')))
        # 2. installed graph fixes the run identity's graph commitment
        graph = whole['installed_graph']
        g = o['materialization:graph']
        b = W.Binder(ctx, g.owner_id, 'graph')
        graph = b.bind(graph)
        node_ids = ['TEST_ONLY:worknode:%s:%d' % (ctx.token, i) for i in range(WORKNODES)]
        request_ids = ['TEST_ONLY:worknode-request:%s:%d' % (ctx.token, i) for i in range(WORKNODES)]
        member = graph['record']['members'][0]
        graph['record']['members'] = [dict(copy.deepcopy(member), **{k: v for k, v in (
            ('worknode_id', node_ids[i]), ('source_request_id', request_ids[i])) if k in member})
            for i in range(WORKNODES)]
        graph['record']['entrypoint_worknode_ids'] = list(node_ids)
        graph['physical_key'] = ctx.run_key('workflow_installed_graph')
        ctx.workgraph_sha256 = cdigest(['pm.goal_test.dg_s.workgraph.v1', graph['record']['members'],
                                        graph['record']['entrypoint_worknode_ids'],
                                        graph['record']['source_dependency_edges'],
                                        graph['record']['active_dependency_edges']])
        graph['record']['identity'] = ctx.identity()
        if 'installed_graph' in edits:
            graph = edits['installed_graph'](graph)
        b.commit()
        W.put_values(ctx, [('workflow_installed_graph', graph['physical_key'], graph)])
        h['installed_graph'] = (g.owner_id, g.issue(e.activation + '#/$defs/InstalledWorkGraphPhysical', graph,
                                                    kind='installed_graph'))
        self.node_ids, self.request_ids = node_ids, request_ids
        # 3. native birth (after descriptor and graph), StartControl epoch 0
        h['native_birth'] = (o['native'].owner_id, o['native'].birth_run(h['descriptor'][1], h['descriptor'][0],
                                                                       edits.get('native_body'),
                                                                       edits.get('native_origin'))[0])
        # 4. seven durable original inputs and seven activation sources, each its own owner
        for k in W.SEVEN_INPUTS:
            owner = o['input:' + k]
            h['input:' + k] = (owner.owner_id, owner.issue_whole(
                e.activation.replace('workflow_activation_sources.v4', 'current_activation_materialization_join.v1')
                + '#/$defs/SevenDurableOriginalInputs/properties/' + k, whole['seven_original_inputs'][k],
                kind='seven_input:' + k, edit=edits.get('input:' + k)))
        for k in W.ACTIVATION_SOURCES:
            owner = o['activation:' + k]
            h['activation:' + k] = (owner.owner_id, owner.issue_whole(
                e.activation.replace('workflow_activation_sources.v4', 'current_activation_materialization_join.v1')
                + '#/$defs/OriginalActivationSources/properties/' + k, whole['original_activation_sources'][k],
                kind='activation_source:' + k, edit=edits.get('activation:' + k)))
        # 5. required set, born WorkNodes, materialization receipts, staging, readiness, origins
        rs_owner = o['materialization:required_set']
        b = W.Binder(ctx, rs_owner.owner_id, 'required_set')
        rs = b.bind(whole['required_set'])
        rs['physical_key'] = ctx.run_key('workflow_required_set')
        rs['record']['worknode_requests']['active_required_request_refs'] = list(request_ids)
        rs['record']['installed_workgraph']['source'] = W.selector_for(ctx, 'workflow_installed_graph',
                                                                       graph['physical_key'], graph)
        if 'required_set' in edits:
            rs = edits['required_set'](rs)
        b.commit()
        W.put_values(ctx, [('workflow_required_set', rs['physical_key'], rs)])
        h['required_set'] = (rs_owner.owner_id, rs_owner.issue(e.activation + '#/$defs/RequiredSetPhysical', rs,
                                                               kind='required_set'))
        wn_owner = o['materialization:worknodes']
        born_skeleton = W.skeleton(e.bank, e.activation + '#/$defs/BornWorkNodeRecordPhysical')
        born = []
        for i in range(WORKNODES):
            b = W.Binder(ctx, wn_owner.owner_id, 'worknode%d' % i)
            node = b.bind(copy.deepcopy(born_skeleton))
            node['physical_key'] = ctx.run_key('workflow_born_worknode', node_ids[i])
            node['record'].update(worknode_id=node_ids[i], source_request_id=request_ids[i],
                                  workgraph_id=ctx.workgraph_id, goal_run_id=ctx.goal_run_id)
            b.commit()
            born.append(node)
        if 'born_worknodes' in edits:
            born = edits['born_worknodes'](born)
        W.put_values(ctx, [('workflow_born_worknode', n['physical_key'], n) for n in born])
        h['born_worknodes'] = (wn_owner.owner_id, wn_owner.issue(None, born, kind='born_worknodes'))
        for n in born:
            e.bank.validate(e.activation + '#/$defs/BornWorkNodeRecordPhysical', n, 'issue/born_worknode')
        rc_owner = o['materialization:receipts']
        receipt_skeleton = W.skeleton(e.bank, e.activation + '#/$defs/WorkNodeMaterializationReceiptPhysical')
        receipts = []
        for i, node in enumerate(born):
            b = W.Binder(ctx, rc_owner.owner_id, 'receipt%d' % i)
            rec = b.bind(copy.deepcopy(receipt_skeleton))
            rec['physical_key'] = ctx.run_key('workflow_materialization_receipt', node_ids[i])
            rec['record'].update(receipt_id='TEST_ONLY:materialization-receipt:%s:%d' % (ctx.token, i),
                                 worknode_id=node['record']['worknode_id'],
                                 source_request_id=node['record']['source_request_id'],
                                 born_worknode_key=node['physical_key'],
                                 born_worknode_record_sha256=cdigest(node['record']),
                                 activation_id='TEST_ONLY:activation:' + ctx.token, issued_at_utc=ctx.now())
            b.commit()
            receipts.append(rec)
        if 'materialization_receipts' in edits:
            receipts = edits['materialization_receipts'](receipts)
        W.put_values(ctx, [('workflow_materialization_receipt', r['physical_key'], r) for r in receipts])
        for r in receipts:
            e.bank.validate(e.activation + '#/$defs/WorkNodeMaterializationReceiptPhysical', r, 'issue/receipt')
        h['materialization_receipts'] = (rc_owner.owner_id, rc_owner.issue(None, receipts,
                                                                           kind='materialization_receipts'))
        st_owner = o['materialization:staging']
        b = W.Binder(ctx, st_owner.owner_id, 'staging')
        staging = b.bind(whole['staging'])
        staging['physical_key'] = ctx.run_key('workflow_entrypoint_staging')
        staging['record'].update(entrypoint_worknode_ids=list(node_ids), dispatch_released=False,
                                 activation_id='TEST_ONLY:activation:' + ctx.token)
        staging['record']['required_set']['source'] = W.selector_for(ctx, 'workflow_required_set',
                                                                     rs['physical_key'], rs)
        if 'staging' in edits:
            staging = edits['staging'](staging)
        b.commit()
        W.put_values(ctx, [('workflow_entrypoint_staging', staging['physical_key'], staging)])
        h['staging'] = (st_owner.owner_id, st_owner.issue(e.activation + '#/$defs/EntryPointStagingPhysical',
                                                          staging, kind='staging'))
        ar_owner = o['materialization:activation_receipt']
        b = W.Binder(ctx, ar_owner.owner_id, 'activation_receipt')
        ar = b.bind(whole['activation_receipt'])
        ar['physical_key'] = ctx.run_key('workflow_activation_receipt')
        ar['record'].update(receipt_id='TEST_ONLY:activation-receipt:' + ctx.token,
                            activation_id='TEST_ONLY:activation:' + ctx.token, issued_at_utc=ctx.now())
        ar['record']['required_set']['source'] = W.selector_for(ctx, 'workflow_required_set', rs['physical_key'], rs)
        ar['record']['installed_workgraph']['source'] = W.selector_for(ctx, 'workflow_installed_graph',
                                                                       graph['physical_key'], graph)
        ar['record']['entrypoints_staged']['source'] = W.selector_for(ctx, 'workflow_entrypoint_staging',
                                                                      staging['physical_key'], staging)
        template = ar['record']['worknode_materialization_receipts'][0]
        ar['record']['worknode_materialization_receipts'] = [
            dict(copy.deepcopy(template), source=W.selector_for(ctx, 'workflow_materialization_receipt',
                                                                r['physical_key'], r)) for r in receipts]
        for key in ar['record']['integrity_checks']:
            ar['record']['integrity_checks'][key] = True
        if 'activation_receipt' in edits:
            ar = edits['activation_receipt'](ar)
        b.commit()
        W.put_values(ctx, [('workflow_activation_receipt', ar['physical_key'], ar)])
        h['activation_receipt'] = (ar_owner.owner_id, ar_owner.issue(
            e.activation + '#/$defs/ActivationReceiptPhysical', ar, kind='activation_receipt'))
        rd_owner = o['materialization:readiness']
        b = W.Binder(ctx, rd_owner.owner_id, 'readiness')
        readiness = b.bind(whole['readiness'])
        for key in readiness:
            readiness[key]['satisfied'] = True
        if 'readiness' in edits:
            readiness = edits['readiness'](readiness)
        b.commit()
        h['readiness'] = (rd_owner.owner_id, rd_owner.issue(e.activation + '#/$defs/ReadinessSnapshot', readiness,
                                                            kind='readiness'))
        og_owner = o['materialization:origins']
        h['original_origins'] = (og_owner.owner_id, og_owner.issue(None, [], kind='original_origins'))
        # 6. launch chain and D01 current source (after native birth)
        launch = o['launch']
        h['launch'] = (launch.owner_id, launch.issue_whole(
            e.custody.replace('workflow_start_original_custody.v2', 'workflow_birth_association_source_join.v4')
            .replace('workflow_start_original_custody.v6', 'workflow_birth_association_source_join.v4')
            + '#/$defs/CurrentWorkflowLaunchChainRead', whole['prestart_launch_chain'], kind='launch_chain',
            edit=edits.get('launch')))
        self._issue_d01_current(whole['d01_current'], edits.get('d01_current'))
        # 7. Goal-control realm and runtime context
        goal = o['goal']
        birth = o['native'].resolve(h['native_birth'][1])[1]
        h['goal'] = (goal.owner_id, goal.issue_goal_argument('OriginalGoalArgument', edits.get('goal'),
                                                             native_body=birth['body'], birth_tx=birth['birth_tx']))
        runtime = dict(qualification=QUALIFICATION, actor_ref='TEST_ONLY:actor:' + ctx.token,
                       execution_role='user', requested_provider_ref='TEST_ONLY:provider:a',
                       effective_provider_ref='TEST_ONLY:provider:a', requested_model_ref='TEST_ONLY:model:a',
                       effective_model_ref='TEST_ONLY:model:a-2026', requested_account_ref='TEST_ONLY:account:1',
                       effective_account_ref='TEST_ONLY:account:1', write_mode='read_only',
                       certification_tier='lightweight', correlation_id='TEST_ONLY:correlation:' + ctx.token)
        if 'runtime' in edits:
            runtime = edits['runtime'](runtime)
        h['runtime'] = (o['runtime'].owner_id, o['runtime'].issue(None, runtime, kind='runtime_context'))
        return h

    def _issue_d01_current(self, skeleton_value, edit=None):
        e, ctx, o = self.edition, self.ctx, self.owners
        d01 = o['d01']
        native = o['native'].current()
        b = W.Binder(ctx, d01.owner_id, 'd01_current')
        cs = b.bind(skeleton_value)
        wf = cs['workflow']
        wf['current_body'] = copy.deepcopy(native['body']['record'])
        wf['current_control'] = copy.deepcopy(native['control']['record'])
        head = wf['head']
        head.update(revision=D01_HEAD_REVISION, workflow_owner_ref=ctx.workflow_owner['owner_ref'],
                    workflow_owner_epoch=ctx.workflow_owner['owner_epoch'], pending_operation_id=None)
        head['current_body'] = W.selector_for(ctx, 'workflow_goal_run_body', native['body']['physical_key'],
                                              native['body'])
        head['current_control'] = W.selector_for(ctx, 'workflow_goal_run_control',
                                                 native['control']['physical_key'], native['control'])
        wf['heads'] = [copy.deepcopy(head)]
        cs['run_control']['cancellation'] = None
        cs['run_control']['pending_operation_id'] = None
        b.commit()
        head_cell = W.skeleton(e.bank, e.d01 + '#/$defs/StorageWorkflowHead')
        head_cell['record'] = copy.deepcopy(head)
        fam = d01_families(e)
        e.bank.validate(e.d01 + '#/$defs/StorageWorkflowHead', head_cell, 'd01/head')
        ctx.storage.transact([dict(table=fam['workflow_head'], key=d01.head_key(D01_HEAD_REVISION),
                                   expected=None, value=head_cell)])
        pointer = W.skeleton(e.bank, e.d01 + '#/$defs/StorageCurrentPointer')
        pointer.update(record=dict(scope=copy.deepcopy(ctx.scope), revision=D01_HEAD_REVISION,
                                   workflow_head=W.selector_for(ctx, fam['workflow_head'],
                                                                d01.head_key(D01_HEAD_REVISION), head_cell),
                                   inventory_head=None, scheduler_control=None,
                                   last_origin_operation_id='TEST_ONLY:birth:' + ctx.token, pending_operation_id=None))
        e.bank.validate(e.d01 + '#/$defs/StorageCurrentPointer', pointer, 'd01/pointer')
        ctx.storage.transact([dict(table=fam['pointer'], key=d01.pointer_key(), expected=None, value=pointer)])
        cs['pointer'] = copy.deepcopy(pointer['record'])
        if edit:
            cs = edit(cs)
        self.handles['d01_current'] = (d01.owner_id, d01.issue(e.d01 + '#/$defs/CurrentSource', cs,
                                                               kind='d01_current'))


# ------------------------------------------------------------------ coordinator

class StartOwner(W.DGOwner):
    """``owner.workflow.activation.commit_start.v2`` (upper publisher)."""
    role = 'workflow_start'

    def __init__(self, registry, *, world=None, **kw):
        self.world = world
        super().__init__(registry, **kw)

    @property
    def ctx(self):
        return self.world.ctx

    @property
    def edition(self):
        return self.world.edition

    def _cut(self, point):
        if self.world.fault == point:
            if os.environ.get('PM_DG_S_CHILD') == '1':
                os._exit(CRASH_EXIT)
            raise S.Crash(point)

    # ---- acquisition: registry only -----------------------------------
    def acquire_all(self, handles):
        out, refs = {}, {}
        roles = {
            'descriptor': 'start_installed_descriptor', 'native_birth': 'workflow_native', 'goal': 'goal_controls',
            'runtime': 'runtime_resolution', 'd01_current': 'd01_workflow_source', 'launch': 'workflow_launch_chain',
            'installed_graph': 'materialization:graph', 'required_set': 'materialization:required_set',
            'born_worknodes': 'materialization:worknodes', 'materialization_receipts': 'materialization:receipts',
            'activation_receipt': 'materialization:activation_receipt', 'staging': 'materialization:staging',
            'readiness': 'materialization:readiness', 'original_origins': 'materialization:origins'}
        for k in W.SEVEN_INPUTS:
            roles['input:' + k] = 'seven_input:' + k
        for k in W.ACTIVATION_SOURCES:
            roles['activation:' + k] = 'activation_source:' + k
        require('start/handles_type', type(handles) is dict)
        for name, role in roles.items():
            require('start/missing_participant/' + name, name in handles)
            entry = handles[name]
            require('start/handle_shape/' + name, type(entry) is tuple and len(entry) == 2)
            refs[name], out[name] = A.acquire(self.registry, entry[0], role, entry[1])
        extra = set(handles) - set(roles)
        require('start/future_or_foreign_source/' + ','.join(sorted(extra)), not extra)
        return out, refs

    # ---- entry joins -----------------------------------------------------
    def entry_joins(self, request, src):
        e, ctx = self.edition, self.ctx
        storage = ctx.storage
        e.bank.validate(e.custody + '#/$defs/Request', request, 'start/request')
        require('start/request_scope', same(request['scope'], ctx.scope))
        d = src['descriptor']
        require('start/descriptor_profile', d['coordinator_profile'] == e.profile)
        require('start/descriptor_methods', d['issuer_method'] == e.start_method and d['storage_method'] == e.storage_method)
        bank_pins = {p['retrieval_uri']: p['whole_sha256'] for p in d['schema_resources']}
        for uri in (e.custody, e.d01, e.activation, e.consumer):
            require('start/descriptor_schema_pin', bank_pins.get(uri) == e.bank.original.resource_origins[uri][0])
        require('start/descriptor_goal_pin', bank_pins.get(e.goal_arg) ==
                e.goal_bank.original.resource_origins[e.goal_arg][0])
        cell = storage.cell('workflow_start_installed_descriptor',
                            'workflow_start_installed_descriptor:%s:%s' % (K(ctx.sid), K(e.profile)))
        require('start/descriptor_installed', cell is not None and cell['tx'] == d['install_tx'])
        birth = src['native_birth']
        require('start/descriptor_before_birth', d['install_generation'] < birth['birth_generation'])
        require('start/birth_descriptor', birth['descriptor_install_tx'] == d['install_tx'])
        native = self.world.owners['native'].current()
        body, control = native['body'], native['control']
        require('start/revision_conflict', body['record']['status'] == 'ready' and
                body['record']['revision'] == birth['body']['record']['revision'])
        require('start/native_activation', body['record']['activation_state']['state'] == 'start_event_pending')
        require('start/native_control_join', control['record']['body_record_sha256'] == cdigest(body['record'])
                and control['record']['revision'] == body['record']['revision'])
        require('start/native_identity', same(body['record']['identity'], ctx.identity()))
        cs = src['d01_current']
        require('start/d01_scope', same(cs['scope'], ctx.scope))
        require('start/d01_current_body', same(cs['workflow']['current_body'], body['record']))
        require('start/d01_current_control', same(cs['workflow']['current_control'], control['record']))
        head = cs['workflow']['head']
        W.resolve_selector(storage, head['current_body'], 'start/d01_head_body')
        W.resolve_selector(storage, head['current_control'], 'start/d01_head_control')
        pointer = storage.cell(d01_families(self.edition)['pointer'], self.world.owners['d01'].pointer_key())
        require('start/d01_pointer', pointer is not None and pointer['value']['record']['revision'] == head['revision']
                and same(pointer['value']['record'], cs['pointer']))
        W.resolve_selector(storage, pointer['value']['record']['workflow_head'], 'start/d01_pointer_head')
        require('start/run_cancellation_null', cs['run_control']['cancellation'] is None)
        sc = self.world.owners['native'].start_control()
        base = copy.deepcopy(sc['value'])
        base['record']['pending_candidate'] = None
        require('start/start_control_birth', same(base, birth['start_control']))
        require('start/start_control_epoch', sc['value']['record']['epoch'] == 0)
        require('start/start_control_committed', sc['value']['record']['committed_start'] is None)
        origin = birth['initial_control_origin']
        require('start/initial_origin_method', origin['record']['issuer_method'] == BEGIN_METHOD)
        require('start/initial_origin_key', origin['record']['issued_value_key'] == birth['start_control']['physical_key'])
        require('start/initial_origin_record', origin['record']['issued_record_sha256'] ==
                cdigest(birth['start_control']['record']))
        require('start/initial_origin_owner', origin['record']['owner_ref'] == ctx.workflow_owner['owner_ref'] and
                origin['record']['owner_epoch'] == ctx.workflow_owner['owner_epoch'])
        graph, rs, staging, ar = src['installed_graph'], src['required_set'], src['staging'], src['activation_receipt']
        require('start/graph_identity', same(graph['record']['identity'], ctx.identity()))
        require('start/graph_commitment', ctx.workgraph_sha256 == cdigest([
            'pm.goal_test.dg_s.workgraph.v1', graph['record']['members'], graph['record']['entrypoint_worknode_ids'],
            graph['record']['source_dependency_edges'], graph['record']['active_dependency_edges']]))
        require('start/required_set_graph', same(rs['record']['installed_workgraph']['source'], W.selector_for(
            ctx, 'workflow_installed_graph', graph['physical_key'], graph)))
        refs = rs['record']['worknode_requests']['active_required_request_refs']
        born, receipts = src['born_worknodes'], src['materialization_receipts']
        require('start/born_membership', sorted(n['record']['source_request_id'] for n in born) == sorted(refs))
        node_ids = [n['record']['worknode_id'] for n in born]
        require('start/receipt_membership', sorted(r['record']['worknode_id'] for r in receipts) == sorted(node_ids))
        for node in born:
            stored = W.read_value(storage, 'workflow_born_worknode', node['physical_key'])
            require('start/born_worknode_custody', stored is not None and same(stored['value'], node))
        for r in receipts:
            node = next((n for n in born if n['record']['worknode_id'] == r['record']['worknode_id']), None)
            require('start/receipt_born_key', node is not None and r['record']['born_worknode_key'] == node['physical_key'])
            require('start/receipt_born_hash', r['record']['born_worknode_record_sha256'] == cdigest(node['record']))
        require('start/staging_entrypoints', sorted(staging['record']['entrypoint_worknode_ids']) ==
                sorted(graph['record']['entrypoint_worknode_ids']))
        require('start/staging_required_set', same(staging['record']['required_set']['source'], W.selector_for(
            ctx, 'workflow_required_set', rs['physical_key'], rs)))
        require('start/staging_not_released', staging['record']['dispatch_released'] is False)
        require('start/activation_receipt_required_set', same(ar['record']['required_set']['source'],
                W.selector_for(ctx, 'workflow_required_set', rs['physical_key'], rs)))
        require('start/activation_receipt_graph', same(ar['record']['installed_workgraph']['source'],
                W.selector_for(ctx, 'workflow_installed_graph', graph['physical_key'], graph)))
        require('start/activation_receipt_staging', same(ar['record']['entrypoints_staged']['source'],
                W.selector_for(ctx, 'workflow_entrypoint_staging', staging['physical_key'], staging)))
        require('start/activation_receipt_receipts', sorted(x['source']['physical_key'] for x in
                ar['record']['worknode_materialization_receipts']) == sorted(r['physical_key'] for r in receipts))
        for x in ar['record']['worknode_materialization_receipts']:
            W.resolve_selector(storage, x['source'], 'start/activation_receipt_member')
        require('start/readiness', all(v['satisfied'] is True for v in src['readiness'].values()))
        goal = src['goal']
        require('start/goal_scope', goal['body']['record']['goal_id'] == ctx.goal_id and
                goal['body']['record']['project_id'] == ctx.project_id)
        require('start/goal_association', goal['binding_revision']['record']['active_run_ref'] == ctx.goal_run_id)
        assoc = goal['binding_revision']['record']['associations']
        require('start/goal_association_member', len(assoc) == 1 and assoc[0]['association_kind'] == 'workflow'
                and assoc[0]['active_run_ref'] == ctx.goal_run_id)
        run_source = assoc[0]['original_run_source']
        birth_body = W.read_value(storage, run_source['family_id'], run_source['physical_key'], 'start/goal_run_source')
        require('start/goal_run_source', birth_body is not None and
                cdigest(birth_body['value']) == run_source['complete_value_sha256'] and
                same(birth_body['value'], birth['body']))
        require('start/goal_binding_transaction', assoc[0]['original_binding_transaction_id'] == birth['birth_tx'])
        require('start/goal_no_effective_stop', goal['stop']['record']['latched'] is False)
        require('start/goal_active', goal['body']['record']['state'] == 'active')
        rt = src['runtime']
        require('start/runtime_actor', type(rt.get('actor_ref')) is str and rt['actor_ref'] != '')
        for name in ['d01_current', 'launch', 'installed_graph', 'required_set', 'staging', 'activation_receipt']:
            for path, sel in W.walk_selectors(src[name]):
                if sel['storage_instance_id'] == ctx.sid:
                    W.resolve_selector(storage, sel, 'start/source_selector/' + name)
        for k in W.SEVEN_INPUTS + tuple('a:' + x for x in W.ACTIVATION_SOURCES):
            name = 'input:' + k if not k.startswith('a:') else 'activation:' + k[2:]
            for path, sel in W.walk_selectors(src[name]):
                if sel['storage_instance_id'] == ctx.sid:
                    W.resolve_selector(storage, sel, 'start/source_selector/' + name)
        return native

    # ---- producer -------------------------------------------------------
    def producer_submission(self, src, native, occurred_at):
        e, ctx = self.edition, self.ctx
        rt, goal = src['runtime'], src['goal']
        sub = W.skeleton(e.bank, e.custody + '#/$defs/TypedProducerSubmission')
        before = native['body']['record']['revision']
        payload = sub['payload']
        payload.update(occurred_at_utc=occurred_at, project_id=ctx.project_id, goal_id=ctx.goal_id,
                       goal_revision=goal['body']['record']['revision'], actor_ref=rt['actor_ref'],
                       execution_role=rt['execution_role'], correlation_id=rt['correlation_id'],
                       evidence_refs=[], artifact_refs=[], expected_goal_run_revision=before,
                       goal_run_revision=NR.uint64(before + 1, 'producer/goal_run_revision'))
        for k in ('requested_provider_ref', 'effective_provider_ref', 'requested_model_ref', 'effective_model_ref',
                  'requested_account_ref', 'effective_account_ref'):
            payload[k] = rt[k]
        payload['payload'].update(goal_run_id=ctx.goal_run_id, workgraph_ref=ctx.workgraph_ref,
                                  activation_receipt_ref=src['activation_receipt']['record']['receipt_id'],
                                  active_worknode_request_refs=list(
                                      src['required_set']['record']['worknode_requests']['active_required_request_refs']),
                                  write_mode=rt['write_mode'], certification_tier=rt['certification_tier'])
        partition = partition_of(ctx.project_id)
        key = idempotency_key(partition, payload)
        payload['idempotency_key'] = key
        sub.update(scope_kind='project', event_id=event_id_of(partition, key), project_id=ctx.project_id,
                   thread_id=goal['body']['record']['thread_id'], run_id=ctx.goal_run_id, node_id=None,
                   attempt_id=None, actor_ref=rt['actor_ref'], requested_account_ref=rt['requested_account_ref'],
                   effective_account_ref=rt['effective_account_ref'], occurred_at_utc=occurred_at,
                   producer_sequence_id=None, correlation_id=rt['correlation_id'], causation_event_id=None,
                   parent_event_id=None, idempotency_key=key, payload_ref=None, redaction_profile='no_secrets',
                   replay_policy='dedupe_by_idempotency_key')
        return sub

    # ---- the held original invocation -----------------------------------
    def commit_start(self, request, handles, *, edits=None):
        edits = edits or {}
        e, ctx = self.edition, self.ctx
        storage = ctx.storage
        with self.recorder.call(self.owner_id, 'commit_start', request) as slot:
            done = storage.reservation_state(request.get('operation_id')) if type(request) is dict else None
            if done is not None and done['state'] == 'published':
                result = self.dedupe(request)
                slot.set(result)
                return result
            src, refs = self.acquire_all(handles)
            if 'after_acquire' in edits:
                edits['after_acquire'](self.world, src)
            native = self.entry_joins(request, src)
            op = request['operation_id']
            sc = self.world.owners['native'].start_control()
            pending = sc['value']['record']['pending_candidate']
            prepared_key = ctx.run_key('workflow_start_prepared_submission', op)
            prepared = W.read_value(storage, 'workflow_start_prepared_submission', prepared_key)
            if pending is not None:
                require('start/pending_other_operation', prepared is not None)
            if prepared is not None:
                submission = copy.deepcopy(prepared['value']['submission'])
            else:
                submission = self.producer_submission(src, native, ctx.now())
            if 'submission' in edits:
                submission = edits['submission'](submission)
            e.bank.validate(e.custody + '#/$defs/TypedProducerSubmission', submission, 'start/producer')
            S.validate_event_record(dict(submission, observed_at_utc='2026-01-01T00:00:00.000Z',
                                         persisted_at_utc='2026-01-01T00:00:00.000Z', sequence_id=0),
                                    'start/producer_record')
            require('start/replay_only_not_appendable', submission['replay_policy'] != 'projector_replay_only')
            argument = dict(d01_current=src['d01_current'], prestart_launch_chain=src['launch'],
                            seven_original_inputs={k: src['input:' + k] for k in W.SEVEN_INPUTS},
                            original_activation_sources={k: src['activation:' + k] for k in W.ACTIVATION_SOURCES},
                            installed_graph=src['installed_graph'], required_set=src['required_set'],
                            born_worknodes=src['born_worknodes'], materialization_receipts=src['materialization_receipts'],
                            activation_receipt=src['activation_receipt'], staging=src['staging'],
                            original_origins=src['original_origins'], readiness=src['readiness'],
                            producer_submission=submission, start_control=src['native_birth']['start_control'],
                            initial_control_origin=src['native_birth']['initial_control_origin'])
            if 'argument' in edits:
                argument = edits['argument'](argument)
            e.bank.validate(e.custody + '#/$defs/OriginalWorkflowArgument', argument, 'start/argument')
            e.goal_bank.validate(e.goal_arg + '#/$defs/OriginalGoalArgument', src['goal'], 'start/goal_argument')
            self._check_producer(src, native, submission)
            self.last_argument = argument
            candidate, after_body, after_control = self.candidate(op, src, native, argument, handles)
            if prepared is not None:
                require('start/idempotency_conflict', same(prepared['value']['candidate'], candidate))
            else:
                require('start/pending_other_operation', pending is None)
                cand_key = candidate['physical_key']
                storage.transact([
                    dict(table='workflow_start_candidate', key=cand_key, expected=None, value=candidate),
                    dict(table='workflow_start_prepared_submission', key=prepared_key, expected=None,
                         value=W.cell_value(storage, dict(qualification=QUALIFICATION, submission=submission,
                                                          candidate=candidate))),
                    dict(table='workflow_start_control', key=sc['value']['physical_key'], expected=sc['version'],
                         value=self._pending_control(sc['value'], candidate))])
                self._cut('after_prepare')
            # append: one Event, synced barrier, first custody for every member
            append_request = dict(kind='TEST_ONLY:goal_run.started.original_start', operation_id=op,
                                  candidate_sha256=cdigest(candidate), producer_sha256=cdigest(submission))
            reservation = storage.reservation_state(op)
            if reservation is not None and reservation['state'] in ('appended', 'receipted'):
                raise W.DGRefusal('start/pending_fenced')
            events, handle, outcome = self.world.appender.append_original(op, append_request, [submission],
                                                                         durability_class='barrier')
            require('start/dedupe_unavailable', outcome['status'] == 'appended')
            stored = self.world.appender.event(events[0])
            custody = self.world.appender.first_receipt(events[0])
            require('start/stored_producer', same(S.producer25(stored), submission))
            original_append = dict(event=stored, first_append_receipt=custody['first_append_receipt'],
                                   full_value_result=storage.full_value_result(stored['event_id']),
                                   exact_custody=custody)
            e.bank.validate(e.custody + '#/$defs/FullOriginalAppend', original_append, 'start/original_append')
            union = self.publication_union(op, request, src, native, candidate, after_body, after_control,
                                           original_append, edits)
            if 'before_publish' in edits:
                edits['before_publish'](self.world)
            if 'union' in edits:
                union = edits['union'](union)
            tx = StartStorageParticipantOps.commit_original(self.world, handle, union)
            receipt = self.world.owners['native'].transition_receipt(op, request['causation_ref'],
                                                                     native['body']['record']['revision'])
            result = dict(commit=union['commit'], origin=union['origin'], control=union['control'],
                          native_body=after_body, native_control=after_control, original_append=original_append,
                          d01_lineage=union['d01_lineage'])
            e.bank.validate(e.custody + '#/$defs/PublicationResult', result, 'start/publication_result')
            self.last = dict(union=union, tx=tx, transition=receipt, original_append=original_append,
                             candidate=candidate, argument=argument, goal_argument=src['goal'])
            slot.set(dict(tx=tx['tx_id']))
            return result

    def _check_producer(self, src, native, sub):
        ctx = self.ctx
        p = sub['payload']
        require('producer/scope', sub['scope_kind'] == 'project' and sub['project_id'] == ctx.project_id)
        require('producer/run', sub['run_id'] == ctx.goal_run_id and p['payload']['goal_run_id'] == ctx.goal_run_id)
        require('producer/goal', p['goal_id'] == ctx.goal_id and p['project_id'] == ctx.project_id)
        require('producer/goal_revision', p['goal_revision'] == src['goal']['body']['record']['revision'])
        before = native['body']['record']['revision']
        require('producer/expected_revision', type(p['expected_goal_run_revision']) is int and
                p['expected_goal_run_revision'] == before)
        require('producer/after_revision', type(p['goal_run_revision']) is int and p['goal_run_revision'] == before + 1)
        require('producer/workgraph', p['payload']['workgraph_ref'] == ctx.workgraph_ref)
        require('producer/activation_receipt', p['payload']['activation_receipt_ref'] ==
                src['activation_receipt']['record']['receipt_id'])
        require('producer/request_membership', p['payload']['active_worknode_request_refs'] ==
                src['required_set']['record']['worknode_requests']['active_required_request_refs'])
        rt = src['runtime']
        require('producer/actor', sub['actor_ref'] == rt['actor_ref'] and p['actor_ref'] == rt['actor_ref'])
        require('producer/time_copy', sub['occurred_at_utc'] == p['occurred_at_utc'])
        require('producer/correlation', sub['correlation_id'] == p['correlation_id'] == rt['correlation_id'])
        for k in ('requested_account_ref', 'effective_account_ref'):
            require('producer/' + k, sub[k] == p[k] == rt[k])
        for k in ('requested_provider_ref', 'effective_provider_ref', 'requested_model_ref', 'effective_model_ref',
                  'execution_role'):
            require('producer/' + k, p[k] == rt[k])
        require('producer/write_mode', p['payload']['write_mode'] == rt['write_mode'])
        require('producer/thread', sub['thread_id'] == src['goal']['body']['record']['thread_id'])
        partition = partition_of(ctx.project_id)
        key = idempotency_key(partition, p)
        require('producer/idempotency_key', sub['idempotency_key'] == key)
        require('producer/key_copy', p['idempotency_key'] == key)
        require('producer/event_id', sub['event_id'] == event_id_of(partition, key))

    def _pending_control(self, control, candidate):
        out = copy.deepcopy(control)
        out['record']['pending_candidate'] = W.selector_for(self.ctx, 'workflow_start_candidate',
                                                            candidate['physical_key'], candidate,
                                                            family_id='workflow_start_candidate') \
            if self.ctx.storage.cell('workflow_start_candidate', candidate['physical_key']) else \
            self._selector_of(candidate, 'workflow_start_candidate')
        return out

    def _selector_of(self, value, family):
        return dict(storage_instance_id=self.ctx.sid, family_id=family, physical_key=value['physical_key'],
                    schema_id=value['schema_id'], schema_version=value['schema_version'],
                    physical_value_sha256=cdigest(value))

    def _key(self, prefix, op=None):
        r = ':'.join(K(self.ctx.scope[k]) for k in ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id'))
        return prefix + ':' + r + ('' if op is None else ':' + K(op))

    def tx_id(self, op):
        return 'TEST_ONLY:start-transaction:' + K(op)

    def issuance(self, wrapper, family):
        return self._selector_of(wrapper, family)

    def body_commitment(self, body, control):
        e = self.edition
        out = W.skeleton(e.bank, e.d01 + '#/$defs/BodyIssuanceCommitment')
        r = body['record']
        out.update(body_revision=r['revision'], activation_revision=r['activation_state']['revision'],
                   status=r['status'], activation_state=r['activation_state']['state'],
                   workflow_owner_ref=r['execution_owner_ref'], workflow_owner_epoch=r['execution_owner_epoch'],
                   identity=copy.deepcopy(r['identity']))
        out['body'] = self._selector_of(body, 'workflow_goal_run_body')
        out['body']['family_id'] = out['body']['family_id']
        out['control'] = self._selector_of(control, 'workflow_goal_run_control')
        e.bank.validate(e.d01 + '#/$defs/BodyIssuanceCommitment', out, 'start/body_commitment')
        return out

    def candidate(self, op, src, native, argument, handles):
        e, ctx = self.edition, self.ctx
        before_body, before_control = native['body'], native['control']
        after_body, after_control = self.world.owners['native'].after_images(before_body, op)
        goal_handle = handles['goal'][1]
        goal_context = self.world.owners['goal'].context_commitment(goal_handle, src['goal'])
        cand = W.skeleton(e.bank, e.custody + '#/$defs/StorageCandidate')
        cand.update(storage_instance_id=ctx.sid, physical_key=self._key(cand['schema_id'].split('.')[-2]
                                                                          .replace('_v6', '') + '.v2', op))
        r = cand['record']
        pointer = ctx.storage.cell(d01_families(self.edition)['pointer'], self.world.owners['d01'].pointer_key())
        r.update(scope=copy.deepcopy(ctx.scope), operation_id=op, transaction_id=self.tx_id(op),
                 owner=copy.deepcopy(ctx.workflow_owner),
                 before_body=self._selector_of(before_body, 'workflow_goal_run_body'),
                 before_control=self._selector_of(before_control, 'workflow_goal_run_control'),
                 before_d01_pointer=W.selector_for(ctx, d01_families(self.edition)['pointer'],
                                                   self.world.owners['d01'].pointer_key(), pointer['value']),
                 before_start_control=self._selector_of(src['native_birth']['start_control'], 'workflow_start_control'),
                 prepared_outbox=W.selector_for(ctx, 'workflow_start_prepared_outbox',
                                                self.world.owners['native'].outbox_key(),
                                                ctx.storage.cell('workflow_start_prepared_outbox',
                                                                 self.world.owners['native'].outbox_key())['value'],
                                                schema_id='pm.storage_value.workflow_start_outbox.v1'),
                 goal_context=goal_context, producer_semantic_digest=NR.producer_digest(argument['producer_submission']),
                 actual_source_argument_sha256=W.source_argument_sha256(argument),
                 candidate_body=self._selector_of(after_body, 'workflow_goal_run_body'),
                 candidate_control=self._selector_of(after_control, 'workflow_goal_run_control'))
        e.bank.validate(e.custody + '#/$defs/StorageCandidate', cand, 'start/candidate')
        return cand, after_body, after_control

    def publication_union(self, op, request, src, native, candidate, after_body, after_control, original_append,
                          edits):
        """Derive native after-images, then Commit, StartControl, StartOrigin, then D01."""
        e, ctx = self.edition, self.ctx
        before_body, before_control = native['body'], native['control']
        cand_sel = self._selector_of(candidate, 'workflow_start_candidate')
        rc = candidate['record']
        event, receipt = original_append['event'], original_append['first_append_receipt']
        commitment = original_append['exact_custody']['original_event_value_commitment']
        commit = W.skeleton(e.bank, e.custody + '#/$defs/StorageCommit')
        commit.update(storage_instance_id=ctx.sid, physical_key=self._key(
            commit['schema_id'].split('.')[-2].replace('_v6', '') + '.v1', op))
        cr = commit['record']
        cr.update(scope=copy.deepcopy(ctx.scope), operation_id=op, transaction_id=self.tx_id(op), candidate=cand_sel,
                  goal_context=copy.deepcopy(rc['goal_context']), prepared_outbox=copy.deepcopy(rc['prepared_outbox']),
                  before_body=copy.deepcopy(rc['before_body']), before_control=copy.deepcopy(rc['before_control']),
                  after_body=copy.deepcopy(rc['candidate_body']), after_control=copy.deepcopy(rc['candidate_control']),
                  event_id=event['event_id'], event_value_commitment=copy.deepcopy(commitment),
                  first_append_receipt=copy.deepcopy(receipt), producer_semantic_digest=rc['producer_semantic_digest'],
                  dispatch_released=False)
        cr['transition'].update(activation_id=before_body['record']['activation_state']['activation_id'],
                                from_state='start_event_pending', to_state='active',
                                outbox_ref=rc['prepared_outbox']['physical_key'], causation_ref=request['causation_ref'])
        if 'commit' in edits:
            commit = edits['commit'](commit)
        e.bank.validate(e.custody + '#/$defs/StorageCommit', commit, 'start/commit')
        commit_sel = self._selector_of(commit, 'workflow_start_commit')
        initial = src['native_birth']['start_control']
        control = copy.deepcopy(initial)
        control['record'].update(epoch=1, pending_candidate=None, committed_start=commit_sel, original_operation_id=op)
        e.bank.validate(e.custody + '#/$defs/StorageControl', control, 'start/control')
        origin = W.skeleton(e.bank, e.custody + '#/$defs/StorageOrigin')
        origin.update(storage_instance_id=ctx.sid, physical_key=self._key(
            origin['schema_id'].split('.')[-2].replace('_v6', '') + '.v2', op))
        orr = origin['record']
        orr.update(scope=copy.deepcopy(ctx.scope), owner=copy.deepcopy(ctx.workflow_owner), operation_id=op,
                   transaction_id=self.tx_id(op), candidate=cand_sel, commit=commit_sel,
                   native_body=copy.deepcopy(rc['candidate_body']), native_control=copy.deepcopy(rc['candidate_control']),
                   start_control=self._selector_of(control, 'workflow_start_control'),
                   original_event_value_commitment=copy.deepcopy(commitment), first_append_receipt=copy.deepcopy(receipt),
                   actual_source_argument_sha256=rc['actual_source_argument_sha256'],
                   goal_source_argument_sha256=rc['goal_context']['source_argument_sha256'], issued_at_utc=ctx.now())
        e.bank.validate(e.custody + '#/$defs/StorageOrigin', origin, 'start/origin')
        origin_sel = self._selector_of(origin, 'workflow_start_origin')
        d01 = self.world.owners['d01']
        before_c = self.body_commitment(before_body, before_control)
        after_c = self.body_commitment(after_body, after_control)
        consumer = W.skeleton(e.bank, e.consumer + '#/$defs/RetainedNativeStart')
        pointer_cell = ctx.storage.cell(d01_families(self.edition)['pointer'], d01.pointer_key())
        prev_head_sel = copy.deepcopy(pointer_cell['value']['record']['workflow_head'])
        W.resolve_selector(ctx.storage, prev_head_sel, 'd01/previous_head')
        new_revision = NR.uint64(pointer_cell['value']['record']['revision'] + 1, 'd01/revision')
        update = consumer['original_d01_update']
        if 'storage_instance_id' in update:
            update['storage_instance_id'] = ctx.sid
        if 'physical_key' in update:
            update['physical_key'] = self._key('executor_workflow_workflow_update.v4', op)
        ur = update['record']
        ur.update(scope=copy.deepcopy(ctx.scope), operation_id=op, transaction_id=self.tx_id(op), revision=new_revision,
                  previous_head=prev_head_sel, before_body=copy.deepcopy(before_c['body']),
                  before_control=copy.deepcopy(before_c['control']), after_body=copy.deepcopy(after_c['body']),
                  after_control=copy.deepcopy(after_c['control']), cause='owner_status',
                  original_owner_result=commit_sel, original_owner_origin=origin_sel)
        ur['transition'].update(rule='original_workflow_start', before=before_c, after=after_c,
                                original_writer_method=e.start_method, original_owner_result=commit_sel,
                                original_owner_origin=origin_sel)
        for k in ('owner',):
            if k in ur:
                ur[k] = copy.deepcopy(ctx.workflow_owner)
        update_key = update.get('physical_key') or self._key('executor_workflow_workflow_update.v4', op)
        update_sel = dict(storage_instance_id=ctx.sid, family_id=d01_families(self.edition)['workflow_update'],
                          physical_key=update_key, schema_id=update['schema_id'],
                          schema_version=update['schema_version'], physical_value_sha256=cdigest(update))
        head = consumer['original_d01_head']
        if 'storage_instance_id' in head:
            head['storage_instance_id'] = ctx.sid
        head_key = d01.head_key(new_revision)
        if 'physical_key' in head:
            head['physical_key'] = head_key
        hr = head['record']
        hr.update(scope=copy.deepcopy(ctx.scope), revision=new_revision, current_body=copy.deepcopy(after_c['body']),
                  current_control=copy.deepcopy(after_c['control']), last_update=update_sel,
                  previous_head=prev_head_sel, workflow_owner_ref=ctx.workflow_owner['owner_ref'],
                  workflow_owner_epoch=ctx.workflow_owner['owner_epoch'])
        if 'pending_operation_id' in hr:
            hr['pending_operation_id'] = None
        # Activation selectors: the post-Start body that records the active activation, and the
        # owner.workflow.activation.begin.v1 origin issued at birth (both actual Storage cells).
        hr['activation_body'] = copy.deepcopy(after_c['body'])
        hr['activation_origin'] = self._selector_of(src['native_birth']['initial_control_origin'],
                                                    'workflow_start_control_origin')
        head_sel = dict(storage_instance_id=ctx.sid, family_id=d01_families(self.edition)['workflow_head'], physical_key=head_key,
                        schema_id=head['schema_id'], schema_version=head['schema_version'],
                        physical_value_sha256=cdigest(head))
        new_pointer = copy.deepcopy(pointer_cell['value'])
        new_pointer['record'].update(revision=new_revision, workflow_head=head_sel, last_origin_operation_id=op,
                                     pending_operation_id=None)
        e.bank.validate(e.d01 + '#/$defs/StorageCurrentPointer', new_pointer, 'd01/new_pointer')
        pointer_sel = dict(storage_instance_id=ctx.sid, family_id=d01_families(self.edition)['pointer'],
                           physical_key=d01.pointer_key(), schema_id=new_pointer['schema_id'],
                           schema_version=new_pointer['schema_version'], physical_value_sha256=cdigest(new_pointer))
        d01_origin = consumer['original_d01_origin']
        if 'storage_instance_id' in d01_origin:
            d01_origin['storage_instance_id'] = ctx.sid
        d01_origin_key = self._key('executor_workflow_lineage_origin.v4', op)
        if 'physical_key' in d01_origin:
            d01_origin['physical_key'] = d01_origin_key
        dr = d01_origin['record']
        dr.update(scope=copy.deepcopy(ctx.scope), method=D01_METHOD, operation_id=op, transaction_id=self.tx_id(op),
                  causation=origin_sel, preimages=[copy.deepcopy(before_c['body']), copy.deepcopy(before_c['control'])],
                  issued_at_utc=ctx.now())
        if 'owner' in dr:
            dr['owner'] = copy.deepcopy(ctx.workflow_owner)
        dr['afterimages'] = dict(workflow_update=update_sel, workflow_head=head_sel, pointer=pointer_sel)
        if 'd01_origin' in edits:
            d01_origin = edits['d01_origin'](d01_origin)
        for name, value in (('original_d01_update', update), ('original_d01_head', head),
                            ('original_d01_origin', d01_origin)):
            root = consumer and e.bank.lookup(e.consumer + '#/$defs/RetainedNativeStart').contents['properties'][name]['$ref']
            e.bank.validate(root, value, 'start/' + name)
        retained = dict(control=control, initial_control_origin=src['native_birth']['initial_control_origin'],
                        candidate=candidate, commit=commit, origin=origin, original_d01_update=update,
                        original_d01_origin=d01_origin, original_d01_head=head)
        e.bank.validate(e.consumer + '#/$defs/RetainedNativeStart', retained, 'start/retained_native')
        commit_argument = dict(workflow=self.last_argument, candidate=candidate,
                               native_candidates=dict(body=after_body, control=after_control))
        e.bank.validate(e.custody + '#/$defs/OriginalCommitArgument', commit_argument, 'start/commit_argument')
        transition = W.skeleton(e.bank, e.d01 + '#/$defs/WorkflowTransitionInput')
        binder = W.Binder(ctx, d01.owner_id, 'd01_transition_input')
        transition = binder.bind(transition)
        binder.commit()
        transition.update(current=copy.deepcopy(src['d01_current']['workflow']),
                          before=dict(body=copy.deepcopy(before_body), control=copy.deepcopy(before_control)),
                          candidate=dict(body=copy.deepcopy(after_body), control=copy.deepcopy(after_control)),
                          operation_id=op, transaction_id=self.tx_id(op))
        d01_argument = dict(held_original_start=commit_argument, coissued_transition=transition)
        e.bank.validate(e.custody + '#/$defs/OriginalD01StartPublicationArgument', d01_argument, 'start/d01_argument')
        lineage = W.skeleton(e.bank, e.custody + '#/$defs/PublicationResult')['d01_lineage']
        lineage = self._fill_lineage(lineage, update, head, d01_origin, update_sel, head_sel, pointer_sel, origin_sel)
        return dict(commit_argument=commit_argument, d01_argument=d01_argument,
                    commit=commit, control=control, origin=origin, update=update, head=head, d01_origin=d01_origin,
                    pointer=new_pointer, d01_lineage=lineage, after_body=after_body, after_control=after_control,
                    before_body=before_body, before_control=before_control, candidate=candidate, retained=retained,
                    update_key=update_key, head_key=head_key, d01_origin_key=d01_origin_key,
                    prev_pointer_version=pointer_cell['version'], new_revision=new_revision,
                    start_control_version=self.world.owners['native'].start_control()['version'])

    def _fill_lineage(self, lineage, update, head, origin, update_sel, head_sel, pointer_sel, origin_sel):
        """PublicationResult.d01_lineage: the co-issued D01 members as the root names them."""
        out = copy.deepcopy(lineage)
        def fill(node):
            if type(node) is dict:
                for k, v in list(node.items()):
                    if k in ('workflow_update', 'update') and type(v) is dict and 'record' in v:
                        node[k] = copy.deepcopy(update)
                    elif k in ('workflow_head', 'head') and type(v) is dict and 'record' in v:
                        node[k] = copy.deepcopy(head)
                    elif k in ('origin', 'mutation_origin', 'lineage_origin') and type(v) is dict and 'record' in v:
                        node[k] = copy.deepcopy(origin)
                    else:
                        fill(v)
            elif type(node) is list:
                for v in node:
                    fill(v)
        fill(out)
        binder = W.Binder(self.ctx, self.owner_id, 'd01_lineage')
        out = binder.bind(out)
        binder.commit()
        return out

    def dedupe(self, request):
        """Same original operation after publication: the first Event, first receipt
        and transition, with no second append/CAS/effect and no full result replay."""
        e = self.edition
        e.bank.validate(e.custody + '#/$defs/Request', request, 'start/request')
        storage = self.ctx.storage
        r = storage.reservation_state(request['operation_id'])
        require('start/dedupe_unavailable', r is not None and r['state'] == 'published' and len(r['event_ids']) == 1)
        control = self.world.owners['native'].start_control()['value']
        require('start/dedupe_unavailable', control['record']['original_operation_id'] == request['operation_id'])
        custody = storage.first_custody(r['event_ids'][0])
        native = self.world.owners['native']
        transitions = native.inventory('transition')
        return dict(kind='dedupe', classification='committed', event_id=r['event_ids'][0],
                    first_append_receipt=custody['first_append_receipt'],
                    committed_start=control['record']['committed_start'], transition_refs=transitions,
                    terminal_tx=r['terminal']['tx_id'])

    # ---- passive classification ------------------------------------------
    def recover_start(self, operation_id):
        """Classifies the authentic outcome only; never writes."""
        storage = self.ctx.storage
        with self.recorder.call(self.owner_id, 'recover_start', dict(operation_id=operation_id)) as slot:
            generation = storage.commit_generation
            prepared = storage.cell('workflow_start_prepared_submission',
                                    self.ctx.run_key('workflow_start_prepared_submission', operation_id))
            r = storage.reservation_state(operation_id)
            events = len(r['event_ids']) if r else 0
            custody = sum(1 for e in (r['event_ids'] if r else []) if storage.first_custody(e) is not None)
            if r is None:
                result = 'prepared_unappended' if prepared is not None else 'no_effect'
            elif r['state'] == 'reserved':
                result = 'reserved_unappended'
            elif r['state'] == 'released':
                result = 'confirmed_no_effect'
            elif r['state'] == 'appended':
                result = 'appended_without_first_custody'
            elif r['state'] == 'receipted':
                result = 'receipted_unpublished'
            else:
                result = 'committed'
            require('recover/no_write', storage.commit_generation == generation)
            out = dict(qualification=QUALIFICATION, operation_id=operation_id, classification=result, events=events,
                       first_custody=custody, prepared=prepared is not None)
            slot.set(out)
            return out


class StartStorageParticipantOps:
    """The lower publisher's independent checks and the one joint transaction."""

    @staticmethod
    def commit_original(world, reservation_handle, union):
        e, ctx = world.edition, world.ctx
        storage = ctx.storage
        owner = world.owners['storage_participant']
        with world.recorder.call(owner.owner_id, 'commit_original', dict(operation=union['commit']['record']['operation_id'])):
            # Lower boundary: whole arguments, rederived after-images and the whole union itself.
            e.bank.validate(e.custody + '#/$defs/OriginalCommitArgument', union['commit_argument'], 'lower/commit_argument')
            e.bank.validate(e.custody + '#/$defs/OriginalD01StartPublicationArgument', union['d01_argument'],
                            'lower/d01_argument')
            require('lower/argument_hash', W.source_argument_sha256(union['commit_argument']['workflow']) ==
                    union['candidate']['record']['actual_source_argument_sha256'])
            require('lower/d01_held_start', same(union['d01_argument']['held_original_start'], union['commit_argument']))
            require('lower/native_candidates', same(union['commit_argument']['native_candidates'],
                                                    dict(body=union['after_body'], control=union['after_control'])))
            after_body, after_control = world.owners['native'].after_images(union['before_body'],
                                                                            union['commit']['record']['operation_id'])
            require('lower/after_body', same(after_body, union['after_body']))
            require('lower/after_control', same(after_control, union['after_control']))
            cand = union['candidate']['record']
            require('lower/candidate_body', cand['candidate_body']['physical_value_sha256'] == cdigest(after_body))
            require('lower/candidate_control', cand['candidate_control']['physical_value_sha256'] == cdigest(after_control))
            c = union['commit']['record']
            require('lower/commit_candidate', c['candidate']['physical_value_sha256'] == cdigest(union['candidate']))
            require('lower/control_commit', union['control']['record']['committed_start']['physical_value_sha256']
                    == cdigest(union['commit']))
            require('lower/origin_commit', union['origin']['record']['commit']['physical_value_sha256']
                    == cdigest(union['commit']))
            require('lower/origin_control', union['origin']['record']['start_control']['physical_value_sha256']
                    == cdigest(union['control']))
            event_id = c['event_id']
            custody = storage.authenticate_receipt(event_id, c['first_append_receipt'])
            require('lower/event_commitment', same(custody['original_event_value_commitment'], c['event_value_commitment']))
            require('lower/d01_cause', union['d01_origin']['record']['causation']['physical_value_sha256']
                    == cdigest(union['origin']))
            r = storage.reservation_state(c['operation_id'])
            require('lower/reservation_receipted', r is not None and r['state'] == 'receipted')
            native = world.owners['native']
            current = native.current()
            require('lower/native_cas_body', same(current['body'], union['before_body']))
            writes = [
                dict(table='workflow_goal_run_body', key=after_body['physical_key'], expected=None, value=after_body),
                dict(table='workflow_goal_run_control', key=after_control['physical_key'], expected=None,
                     value=after_control),
                dict(table='workflow_goal_run_current', key=native.current_key(), expected=current['pointer']['version'],
                     value=dict(qualification=QUALIFICATION, body_key=after_body['physical_key'],
                                control_key=after_control['physical_key'], revision=after_body['record']['revision'])),
                dict(table='workflow_start_commit', key=union['commit']['physical_key'], expected=None,
                     value=union['commit']),
                dict(table='workflow_start_control', key=union['control']['physical_key'],
                     expected=union['start_control_version'], value=union['control']),
                dict(table='workflow_start_origin', key=union['origin']['physical_key'], expected=None,
                     value=union['origin']),
                dict(table=d01_families(world.edition)['workflow_update'], key=union['update_key'], expected=None,
                     value=union['update']),
                dict(table=d01_families(world.edition)['workflow_head'], key=union['head_key'], expected=None, value=union['head']),
                dict(table='executor_workflow_lineage_origin', key=union['d01_origin_key'], expected=None,
                     value=union['d01_origin']),
                dict(table=d01_families(world.edition)['pointer'], key=world.owners['d01'].pointer_key(),
                     expected=union['prev_pointer_version'], value=union['pointer']),
            ]
            op = c['operation_id']
            return storage.transact(writes, operation=op, cut_before='before_terminal', cut_after='after_terminal')
