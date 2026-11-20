"""TEST_ONLY HITL-1130 provider wired to the original DG-U Goal update owners."""

from threading import Lock
from unittest.mock import patch
import uuid

import pm_goal_dg_u_owners as original
from pm_goal_own_c_oracles import utc

from pm_goal_dg_u_owners import (
    A, CAP, CONTRACTS_URI, MEDIA, NR, QUALIFICATION, hexk, msgpack,
    proposal_key, require, resolution_key, sha,
)

PROPOSAL = 'goal_update_proposal'
RESOLUTION = 'goal_update_approval_resolution'
CAPTURE = 'dgu_approval_capture'
PROVIDER_CONTROL = 'dgu_depth_provider_control'
_ASSEMBLY = Lock()


def utc_order(value):
    """Compare U3 UTC timestamps with or without any number of fractional digits."""
    return value[:19], value[19:-1].removeprefix('.').rstrip('0')


class ThreadOwner(original.ThreadOwner):
    """The current U7 hold is issued by the thread owner outside a backup."""

    def place_hold(self, scope):
        key = hexk(scope['project_id']) + ':' + hexk(scope['thread_id'])
        row = self.require_content(scope, 'depth/thread/hold')
        self.put(key, dict(row, hold='TEST_ONLY:hold:' + uuid.uuid4().hex))


class ApprovalOwner(original.ApprovalOwner):
    """U2–U7 original proposal and protected decision custody for this test path."""

    def __init__(self, world):
        super().__init__(world)
        control = self.storage.cell(PROVIDER_CONTROL, 'owner_epoch')
        if control is not None:
            self.owner_epoch = control['value']

    def advance_owner_epoch(self):
        """U7 TEST_ONLY owner transfer, recorded by the live owner."""
        control = self.storage.cell(PROVIDER_CONTROL, 'owner_epoch')
        epoch = NR.uint64(self.owner_epoch + 1, 'dgu/hitl/owner_epoch')
        self.world.transact([dict(table=PROVIDER_CONTROL, key='owner_epoch',
                                  expected=control['version'] if control else None, value=epoch)])
        self.owner_epoch = epoch

    def validate(self, name, value, where):
        self.bank.validate(CONTRACTS_URI + '#/$defs/' + name, value, where)

    def operation_fits(self, table, key, value, expected=None):
        return len(msgpack(dict(table=table, key=key, expected=expected, value=value))) <= CAP

    def capture(self, command_instance_id):
        # U2: obtain original SIR dispatch and both original chat messages.
        w, method, where = self.world, 'hitl.capture', 'dgu/hitl/capture'
        with self.recorder.call(self.owner_id, method) as slot:
            dispatch = w.helper(self.owner_id, method, 'proposal_dispatch',
                                lambda: w.sir.proposal_dispatch(command_instance_id, where))
            proposal = dispatch['proposal']
            target = proposal['target']
            scope = target['scope']
            agent = w.helper(self.owner_id, method, 'agent_message',
                             lambda: w.chat.read(proposal['source_message_id'], where + '/agent'))
            instruction = w.helper(self.owner_id, method, 'instruction_message',
                                   lambda: w.chat.read(proposal['instruction_message_id'], where + '/instruction'))
            self.check_sources(dispatch, agent, instruction, where)
            self.check_live_proposal(proposal, where)
            key = proposal_key(scope, command_instance_id)
            issued = self.storage.cell(CAPTURE, key)
            if issued is not None:
                # U3: the approval is selected by the original dispatch even
                # when the Goal has advanced since that immutable issuance.
                identity = issued['value']
                require(where + '/retry_dispatch', identity['dispatch_id'] == dispatch['dispatch_id'])
                request = self.read_request(identity['approval_id'], where)
                return slot.set(dict(approval_id=identity['approval_id'], request=request))

            current = w.helper(self.owner_id, method, 'current_goal',
                               lambda: w.body.read_private(scope, where))
            self.check_target(target, current, where + '/stale_target')
            approval_id = 'approval:TEST_ONLY:' + uuid.uuid4().hex
            proposal_raw = msgpack(proposal)
            request = dict(schema_id='pm.goal.update.approval_request.v1', schema_version='1.0.0',
                           approval_id=approval_id, proposal_request_ref=dispatch['proposal_request_ref'],
                           proposal_request_sha256=sha(proposal_raw), target=target,
                           source_message_id=proposal['source_message_id'],
                           instruction_message_id=proposal['instruction_message_id'],
                           created_at_utc=w.now(), expires_at_utc=w.selected_expiry)
            self.validate('ApprovalRequest', request, where + '/request')
            expiry = request['expires_at_utc']
            require(where + '/created_time', utc(request['created_at_utc']))
            require(where + '/expiry_time', expiry is None or utc(expiry))
            ctx = dict(request=dict(request, target=dict(target, scope=dict(scope))))
            w.boundary(method, 'before_release', ctx)
            final = where + '/final'
            require(where + '/final_candidate', A.same(ctx['request'], request))
            require(final + '/dispatch', A.same(w.sir.proposal_dispatch(command_instance_id, final), dispatch))
            self.check_sources(dispatch, w.chat.read(proposal['source_message_id'], final),
                               w.chat.read(proposal['instruction_message_id'], final), final)
            self.check_target(target, w.body.read_private(scope, final), where + '/final_target')
            self.check_live_proposal(proposal, final)

            # U6: independently capped proposal value, approval value and
            # retry index. Only the TEST_ONLY approval owner's own transaction
            # publishes the three linked values after any pack has read back.
            stored = dict(schema_id='pm.storage_value.goal_update_proposal.v1', schema_version='1.0.0',
                          scope=scope, physical_key=key, proposal_command_instance_id=command_instance_id,
                          original_request_sha256=sha(proposal_raw),
                          content=dict(kind='inline', request=proposal))
            packed = not self.operation_fits(PROPOSAL, key, stored)
            if packed:
                import blake3
                ref = dict(blake3=blake3.blake3(proposal_raw).hexdigest(),
                           byte_size=len(proposal_raw), media_type=MEDIA)
                stored['content'] = dict(kind='payload_ref', reference=ref)
            self.validate('StorageProposal', stored, where + '/storage_proposal')
            identity = dict(approval_id=approval_id, dispatch_id=dispatch['dispatch_id'])
            core = dict(qualification=QUALIFICATION, approval_id=approval_id, proposal_key=key,
                        proposal_command_instance_id=command_instance_id, scope=scope,
                        stored_proposal_sha256=sha(msgpack(stored)),
                        request_sha256=sha(msgpack(request)), created_at_utc=request['created_at_utc'],
                        expires_at_utc=expiry, revoked=False, approval_owner_epoch=self.owner_epoch)
            writes = [dict(table=table, key=k, expected=None, value=value)
                      for table, k, value in ((PROPOSAL, key, stored), (CAPTURE, key, identity),
                                              (self.table, approval_id, core))]
            require(where + '/operation_size', all(self.operation_fits(**row) for row in writes))
            if packed:
                require(where + '/pack_reference', self.storage.put_pack(proposal_raw, MEDIA) == ref)
                require(where + '/pack_readback', self.storage.read_pack(ref, expected_media_type=MEDIA) == proposal_raw)
            w.transact(writes)
            return slot.set(dict(approval_id=approval_id, request=request))

    def check_target(self, target, current, code):
        require(code, current['body']['revision'] == target['expected_revision'] and
                current['body']['currentness_hash'] == target['expected_currentness_hash'])

    def check_sources(self, dispatch, agent, instruction, where):
        proposal = dispatch['proposal']
        target = proposal['target']
        scope = target['scope']
        require(where + '/foreign_storage', scope['storage_instance_id'] == self.storage.storage_instance_id)
        require(where + '/scope', all(row['project_id'] == scope['project_id'] and
                row['thread_id'] == scope['thread_id'] for row in (agent, instruction)))
        require(where + '/agent_author', agent['author_kind'] == 'agent' and
                agent['runtime_thread_id'] == scope['thread_id'])
        require(where + '/agent_actor', agent['actor_ref'] == proposal['actor_ref'])
        require(where + '/agent_text', agent['body'] == dict(kind='goal_update_proposal_message',
                goal_id=scope['goal_id'], replacement_text=target['objective_text']))
        require(where + '/instruction_author', instruction['author_kind'] == 'user')
        require(where + '/instruction_attests', instruction['body'] == dict(kind='goal_update_instruction',
                goal_id=scope['goal_id'], replacement_text=target['objective_text']))

    def check_live_proposal(self, proposal, where):
        w, scope = self.world, proposal['target']['scope']
        w.permissions.check(proposal['permission_snapshot_ref'], proposal['actor_ref'], scope,
                            'propose_goal_update', where)
        w.threads.require_content(scope, where)
        installation = w.installation.require_installed(where)
        require(where + '/approval_surface', 'approval' in installation['enrolled_roles'])

    def read_stored_proposal(self, core, where):
        cell = self.storage.cell(PROPOSAL, core['proposal_key'])
        require(where + '/proposal_unavailable', cell is not None)
        stored = cell['value']
        self.validate('StorageProposal', stored, where + '/storage_proposal')
        require(where + '/stored_proposal_bytes', sha(msgpack(stored)) == core['stored_proposal_sha256'])
        require(where + '/proposal_scope', A.same(stored['scope'], core['scope']))
        require(where + '/proposal_identity', stored['physical_key'] == core['proposal_key'] ==
                proposal_key(core['scope'], core['proposal_command_instance_id']) and
                stored['proposal_command_instance_id'] == core['proposal_command_instance_id'])
        require(where + '/proposal_operation_size', self.operation_fits(PROPOSAL, core['proposal_key'], stored))
        content = stored['content']
        if content['kind'] == 'inline':
            proposal = content['request']
            raw = msgpack(proposal)
        else:
            raw = self.storage.read_pack(content['reference'], expected_media_type=MEDIA)
            proposal = NR.decode_event_value(raw, where + '/proposal_decode')
        self.validate('GoalUpdateProposalRequest', proposal, where + '/proposal')
        require(where + '/proposal_bytes', msgpack(proposal) == raw and sha(raw) == stored['original_request_sha256'])
        return stored, proposal

    def read_request(self, approval_id, where):
        # U4/U6: recover the exact issued ApprovalRequest using only original
        # selected content bytes and the owner's independently stored issuance.
        core = self.state(approval_id) if type(approval_id) is str else None
        require(where + '/approval_unavailable', core is not None)
        _, proposal = self.read_stored_proposal(core, where)
        self.check_live_proposal(proposal, where)
        w = self.world
        dispatch = w.sir.proposal_dispatch(core['proposal_command_instance_id'], where)
        issued = self.storage.cell(CAPTURE, core['proposal_key'])
        require(where + '/proposal_dispatch', A.same(dispatch['proposal'], proposal) and
                issued is not None and issued['value'] == dict(approval_id=approval_id, dispatch_id=dispatch['dispatch_id']))
        self.check_sources(dispatch, w.chat.read(proposal['source_message_id'], where),
                           w.chat.read(proposal['instruction_message_id'], where), where)
        request = dict(schema_id='pm.goal.update.approval_request.v1', schema_version='1.0.0',
                       approval_id=approval_id, proposal_request_ref=dispatch['proposal_request_ref'],
                       proposal_request_sha256=sha(msgpack(proposal)), target=proposal['target'],
                       source_message_id=proposal['source_message_id'], instruction_message_id=proposal['instruction_message_id'],
                       created_at_utc=core['created_at_utc'], expires_at_utc=core['expires_at_utc'])
        self.validate('ApprovalRequest', request, where + '/request')
        require(where + '/approval_request_bytes', sha(msgpack(request)) == core['request_sha256'])
        return request

    def decide(self, approval_id, decision, person_permission_ref, person_ref):
        w, where = self.world, 'dgu/hitl/decide'
        with self.recorder.call(self.owner_id, 'hitl.decide', dict(decision=decision)) as slot:
            request = self.read_request(approval_id, where)
            core = self.state(approval_id)
            scope = core['scope']
            key = resolution_key(scope, approval_id)
            require(where + '/already_resolved', self.storage.cell(RESOLUTION, key) is None)
            require(where + '/decision', decision in ('approved', 'denied', 'expired'))
            require(where + '/approval_owner_epoch', core['approval_owner_epoch'] == self.owner_epoch)
            require(where + '/approval_revoked', not core['revoked'])
            now = w.now()
            require(where + '/decision_time', utc(now))
            expiry = request['expires_at_utc']
            if decision == 'approved' and expiry is not None:
                require(where + '/approval_expired', utc_order(now) < utc_order(expiry))
            perm = w.permissions.check(person_permission_ref, person_ref, scope, 'approve_goal_update', where)
            require(where + '/not_person', perm['person'] is True)
            _, proposal = self.read_stored_proposal(core, where)
            require(where + '/self_approval', person_ref != proposal['actor_ref'])
            resolution = dict(approval_id=approval_id, request_sha256=core['request_sha256'], decision=decision,
                              approver_ref=person_ref, decided_at_utc=now, approval_owner_epoch=self.owner_epoch,
                              protected_person_decision_ref='protected-person:TEST_ONLY:' + uuid.uuid4().hex)
            stored = dict(schema_id='pm.storage_value.goal_update_approval_resolution.v1', schema_version='1.0.0',
                          scope=scope, physical_key=key, resolution=resolution)
            self.validate('StorageApprovalResolution', stored, where + '/storage_resolution')
            require(where + '/operation_size', self.operation_fits(RESOLUTION, key, stored))
            new_core = dict(core, approver_permission_ref=person_permission_ref)
            version = self.version(approval_id)
            require(where + '/operation_size', self.operation_fits(self.table, approval_id, new_core, version))
            w.transact([dict(table=RESOLUTION, key=key, expected=None, value=stored),
                        dict(table=self.table, key=approval_id, expected=version, value=new_core)])
            return slot.set(resolution)

    def read_stored_resolution(self, scope, approval_id, where):
        key = resolution_key(scope, approval_id)
        cell = self.storage.cell(RESOLUTION, key)
        require(where + '/approval_not_resolved', cell is not None)
        stored = cell['value']
        self.validate('StorageApprovalResolution', stored, where + '/storage_resolution')
        require(where + '/resolution_identity', A.same(stored['scope'], scope) and
                stored['physical_key'] == key and stored['resolution']['approval_id'] == approval_id)
        return stored

    def read_retained_resolution(self, scope, approval_id, actor_ref, permission_ref):
        # U6/U7: this is content-free original audit under its own permission.
        where = 'dgu/hitl/retained'
        require(where + '/foreign_storage', scope['storage_instance_id'] == self.storage.storage_instance_id)
        self.world.permissions.check(permission_ref, actor_ref, scope, 'audit_goal', where)
        return self.read_stored_resolution(scope, approval_id, where)

    def read_resolution(self, approval_id, where):
        # U4: the sole body owner calls this same live acquisition again before CAS.
        request = self.read_request(approval_id, where)
        core = self.state(approval_id)
        res = self.read_stored_resolution(core['scope'], approval_id, where)['resolution']
        require(where + '/approval_request_commitment', res['request_sha256'] == core['request_sha256'])
        require(where + '/approval_owner_epoch', res['approval_owner_epoch'] ==
                core['approval_owner_epoch'] == self.owner_epoch)
        require(where + '/approval_denied', res['decision'] != 'denied')
        require(where + '/approval_expired', res['decision'] != 'expired')
        require(where + '/approval_decision', res['decision'] == 'approved')
        require(where + '/approval_revoked', not core['revoked'])
        expiry = request['expires_at_utc']
        require(where + '/approval_expired', expiry is None or utc_order(self.world.now()) < utc_order(expiry))
        perm = self.world.permissions.check(core['approver_permission_ref'], res['approver_ref'],
                                            core['scope'], 'approve_goal_update', where)
        require(where + '/not_person', perm['person'] is True)
        return dict(request=request, resolution=res, approval_owner_epoch=self.owner_epoch)


class World(original.World):
    """Select the depth adapter at construction, leaving the frozen DG-U bytes intact."""

    def __init__(self, root, *, create=True, selected_expiry=None, **kwargs):
        self.selected_expiry = selected_expiry
        with _ASSEMBLY, patch.object(original, 'ApprovalOwner', ApprovalOwner), \
                patch.object(original, 'ThreadOwner', ThreadOwner):
            super().__init__(root, create=create, **kwargs)
        if create:
            self.transact([dict(table=PROVIDER_CONTROL, key='owner_epoch', expected=None,
                                value=self.approvals.owner_epoch)])
        else:
            require('dgu/hitl/depth_provider_selection',
                    self.storage.cell(PROVIDER_CONTROL, 'owner_epoch') is not None)
