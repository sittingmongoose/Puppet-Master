"""Newly authored TEST_ONLY approval participant, edition C3-W12/2.

The message, accepted-dispatch and protected-person owners issue their own
objects. A transport resolution, request hash or copied participant is not a
capability. The successor source and the sole body issuer call this participant
under the original Goal root before the body transaction. Native NOT_RUN.
"""
from __future__ import annotations

import copy
import weakref

from pm_goal_own_c_oracles import SchemaBank, SCHEMA, equal, require, instant

_CHAT_BIRTHS = weakref.WeakSet()
_HUMAN_BIRTHS = weakref.WeakSet()
_BRIDGE_BIRTHS = weakref.WeakSet()
_SOURCE_ACCEPTANCES = weakref.WeakKeyDictionary()
_CHAT_FACTS = weakref.WeakKeyDictionary()
_HUMAN_FACTS = weakref.WeakKeyDictionary()
_BRIDGE_PARTICIPANTS = weakref.WeakKeyDictionary()


class ChatOwnerV2:
    def __init__(self):
        self.messages = {}
        self.dispatches = {}
        self.allowed = True
        self.epoch = 1
        _CHAT_BIRTHS.add(self)
        _CHAT_FACTS[self] = dict(messages={}, dispatches={})

    def agent_message(self, message_id, thread_id, actor_ref, text):
        require('A2/message_absent', message_id not in self.messages)
        self.messages[message_id] = ('agent', thread_id, actor_ref, text)
        _CHAT_FACTS[self]['messages'][message_id] = copy.deepcopy(self.messages[message_id])

    def user_instruction(self, message_id, thread_id, target):
        require('A2/instruction_absent', message_id not in self.messages)
        self.messages[message_id] = ('user', thread_id, copy.deepcopy(target))
        _CHAT_FACTS[self]['messages'][message_id] = copy.deepcopy(self.messages[message_id])

    def accept_dispatch(self, request):
        SchemaBank(SCHEMA).validate('GoalUpdateProposalRequest', request)
        key = request['command_instance_id']
        if key in self.dispatches:
            require('A2/dispatch_conflict', equal(self.dispatches[key], request))
        else:
            self.dispatches[key] = copy.deepcopy(request)
            _CHAT_FACTS[self]['dispatches'][key] = copy.deepcopy(request)
        return copy.deepcopy(self.dispatches[key])


class PersonOwnerV2:
    def __init__(self, person_ref):
        self.person_ref = person_ref
        self.decisions = {}
        self.epoch = 1
        self.allowed = True
        _HUMAN_BIRTHS.add(self)
        _HUMAN_FACTS[self] = {}

    def protected_decision(self, approval_id, request_sha256, decision, when):
        require('A2/person_decision_absent', approval_id not in self.decisions)
        require('A2/person_allowed', self.allowed is True)
        value = dict(approval_id=approval_id, request_sha256=request_sha256,
                     decision=decision, approver_ref=self.person_ref,
                     decided_at_utc=when, approval_owner_epoch=self.epoch,
                     protected_person_decision_ref='protected-person-v2:' + approval_id)
        SchemaBank(SCHEMA).validate('ApprovalResolution', value)
        self.decisions[approval_id] = copy.deepcopy(value)
        _HUMAN_FACTS[self][approval_id] = copy.deepcopy(value)
        return copy.deepcopy(value)


class ApprovalBridgeV2:
    edition = 'goal_update_approved_agent_source.v2'

    def __init__(self, chat, human, request, codec, approval_id,
                 created_at, expires_at):
        require('A2/chat_birth', type(chat) is ChatOwnerV2 and chat in _CHAT_BIRTHS)
        require('A2/person_birth', type(human) is PersonOwnerV2 and human in _HUMAN_BIRTHS)
        self.chat, self.human, self.codec = chat, human, codec
        self.request = copy.deepcopy(request)
        self.bank = SchemaBank(SCHEMA)
        self.bank.validate('GoalUpdateProposalRequest', self.request)
        self.raw = codec.raw(self.request)
        self.approval = dict(schema_id='pm.goal.update.approval_request.v1',
            schema_version='1.0.0', approval_id=approval_id,
            proposal_request_ref='proposal-v2:' + request['command_instance_id'],
            proposal_request_sha256=codec.h(request), target=copy.deepcopy(request['target']),
            source_message_id=request['source_message_id'],
            instruction_message_id=request['instruction_message_id'],
            created_at_utc=created_at, expires_at_utc=expires_at)
        self.bank.validate('ApprovalRequest', self.approval)
        self.revoked = False
        self.allowed = True
        self.now = created_at
        self._original_approval = copy.deepcopy(self.approval)
        self._source_births = weakref.WeakSet()
        _BRIDGE_PARTICIPANTS[self] = (chat, human, codec, copy.deepcopy(request))
        self.capture()
        _BRIDGE_BIRTHS.add(self)

    def capture(self):
        q = self.request
        chat,human,codec,original_request = _BRIDGE_PARTICIPANTS[self]
        require('A2/original_participants', self.chat is chat and self.human is human and self.codec is codec)
        require('A2/original_proposal', equal(q,original_request))
        self.bank.validate('GoalUpdateProposalRequest', q)
        require('A2/message_issuance', equal(self.chat.messages, _CHAT_FACTS[self.chat]['messages']))
        require('A2/dispatch_issuance', equal(self.chat.dispatches, _CHAT_FACTS[self.chat]['dispatches']))
        require('A2/dispatch', equal(self.chat.dispatches.get(q['command_instance_id']), q))
        require('A2/agent_message', self.chat.messages.get(q['source_message_id']) ==
                ('agent', q['target']['scope']['thread_id'], q['actor_ref'], q['target']['objective_text']))
        require('A2/instruction', equal(self.chat.messages.get(q['instruction_message_id']),
                ('user', q['target']['scope']['thread_id'], q['target'])))
        require('A2/content_access', self.chat.allowed is True)
        require('A2/provider_access', self.allowed is True)
        require('A2/revoked', self.revoked is False)
        return copy.deepcopy(self.approval)

    def resolve(self):
        self.capture()
        self.bank.validate('ApprovalRequest', self.approval)
        require('A2/approval_issuance', equal(self.approval, self._original_approval))
        value = self.human.decisions.get(self.approval['approval_id'])
        require('A2/person_decision', value is not None)
        require('A2/person_decision_issuance', equal(value, _HUMAN_FACTS[self.human].get(self.approval['approval_id'])))
        self.bank.validate('ApprovalResolution', value)
        require('A2/protected_person_access', self.human.allowed is True)
        require('A2/approved', value['decision'] == 'approved')
        require('A2/request_hash', value['request_sha256'] == self.codec.h(self.request))
        require('A2/person_epoch_type', type(self.human.epoch) is int)
        require('A2/person_epoch', value['approval_owner_epoch'] == self.human.epoch)
        require('A2/expiry', self.approval['expires_at_utc'] is None or
                instant(self.now) < instant(self.approval['expires_at_utc']))
        require('A2/decision_time', instant(self.approval['created_at_utc']) <=
                instant(value['decided_at_utc']) <= instant(self.now))
        return copy.deepcopy(value)

    def admit_source(self, source, request, metadata):
        require('A2/bridge_birth', self in _BRIDGE_BIRTHS)
        require('A2/source_birth_absent', source not in _SOURCE_ACCEPTANCES)
        value = self._join(request, metadata['acceptance'], metadata['storage_instance_id'])
        self._source_births.add(source)
        _SOURCE_ACCEPTANCES[source] = (self, copy.deepcopy(request),
                                      copy.deepcopy(metadata['acceptance']), copy.deepcopy(value))

    def _join(self, request, acceptance, storage_instance_id):
        value = self.resolve()
        q = self.request
        target = dict(scope=dict(storage_instance_id=storage_instance_id,
            **{k:request[k] for k in ('project_id', 'thread_id', 'goal_id')}),
            expected_revision=request['expected_revision'],
            expected_currentness_hash=request['expected_currentness_hash'],
            objective_text=request['objective_text'])
        require('A2/target', equal(target, q['target']))
        for field in ('actor_ref', 'permission_snapshot_ref', 'return_route_ref', 'source_message_id'):
            require('A2/request/' + field, request[field] == q[field])
        require('A2/change_source', request['change_source'] == 'agent_proposed_user_approved')
        require('A2/approval_id', request['approval_id'] == value['approval_id'])
        for field in ('change_source', 'source_message_id', 'approval_id'):
            require('A2/acceptance/' + field, acceptance[field] == request[field])
        require('A2/decision_ref', acceptance['original_change_authority_ref'] == value['protected_person_decision_ref'])
        require('A2/origin_message', acceptance['origin']['source_message_refs'] == [request['source_message_id']])
        return value

    def check_source(self, source, *, live):
        require('A2/bridge_birth', self in _BRIDGE_BIRTHS)
        require('A2/source_issuance', source in self._source_births and source in _SOURCE_ACCEPTANCES)
        owner, request, acceptance, resolution = _SOURCE_ACCEPTANCES[source]
        require('A2/source_owner', owner is self)
        current = source._update_state
        require('A2/immutable_acceptance', equal(current['source']['acceptance'], acceptance))
        # After the real body receipt exists, immutable recovery must not depend
        # on a still-live approval or disposed message/proposal content.
        if live:
            require('A2/original_input', equal(current['input']['request'], request))
            require('A2/live_resolution', equal(self._join(request, acceptance,
                    current['source']['storage_instance_id']), resolution))
            # SIR's actual clock advances during acknowledgement/reservation.
            # A provider snapshot from capture cannot extend the acceptance.
            require('A2/source_clock_before_decision', instant(current['clock']) >=
                    instant(resolution['decided_at_utc']))
            require('A2/source_clock_expiry', self.approval['expires_at_utc'] is None or
                    instant(current['clock']) < instant(self.approval['expires_at_utc']))


def check_acceptance_v2(source, *, live):
    state = source._update_state
    acceptance = state['source']['acceptance']
    if acceptance['change_source'] == 'user_direct':
        require('A2/direct_no_provider', getattr(source, '_approval_owner_v2', None) is None)
        require('A2/direct_no_approval', acceptance['approval_id'] is None)
        require('A2/direct_no_message', acceptance['source_message_id'] is None)
    else:
        owner = getattr(source, '_approval_owner_v2', None)
        require('A2/provider_identity', type(owner) is ApprovalBridgeV2)
        owner.check_source(source, live=live)
