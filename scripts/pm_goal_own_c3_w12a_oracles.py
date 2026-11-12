#!/usr/bin/env python3
"""C3-W12a original-owner W1 corpus. TEST_ONLY; native NOT_RUN.

Qualify the explicitly selected v2.3 package before import. Never patch its
classes, functions, module maps or stored origins. Forked negative cases inherit
one genuine valid owner state, change one public fence, and publish no repairs.
Closure is reported separately from assertion success; an incomplete corpus
returns exit 2. No guard-removal/proof engine is implemented here.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import traceback
from types import SimpleNamespace

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
SELECTION = ROOT/'Plans/goal_own_c_contracts/w12-successor-v2/approved-agent-source.v2.json'
PIN = 'e22c3bee94c37a6853c61d1b18a0a2eb631174160ddbe38644ad2ada6dc53273'
PACKET = Path('/home/sittingmongoose/PM-Experiments/c3-w12-p2-20261105/approved-agent-source.v2.3')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')


def qualify():
    selection = json.loads(SELECTION.read_text())
    assert selection['manifest_sha256'] == PIN
    assert Path(selection['candidate_path']) == PACKET
    raw = (PACKET/'manifest.json').read_bytes()
    assert sha(raw) == PIN
    manifest = json.loads(raw)
    for row in manifest['files']:
        raw = (PACKET/row['path']).read_bytes()
        assert len(raw) == row['bytes'] and sha(raw) == row['sha256'], row['path']
    for row in selection['repository_support']:
        assert sha((ROOT/row['path']).read_bytes()) == row['sha256'], row['path']
    sys.path.insert(0, str(PACKET))
    return manifest


def fixture(newtext, agent, check, save, before_source=None, on_refusal=None, omit_provider=False):
 # Setup is copied from the pinned v2.3 ordinary runner. Only local input data
 # varies. The original constructor, single body issuer and append owners run
 # unchanged; the created fixture supplies historical setup lineage only.
 import goal_command as C
 import goal_support as GS
 import goal_source as S
 import shared_link as L
 import goal_update_support as U
 actual_registry=json.loads((U.GRAPH/'canonical/Plans/event_family_registry.json').read_text());actual_row=next(r for r in actual_registry['families']if r['event_type']=='goal.updated')
 check('canonical_after_shape_before_owner_birth',json.loads((U.GRAPH/'event-family-proposal.json').read_text())['after_shape']==actual_row)
 check('zero_original_constructor_history',L._LINK_EVER_ENTERED==C.M._SEMANTIC_EVER_ENTERED==C.A._PHYSICAL_EVER_ENTERED==S._SOURCE_EVER_ENTERED==L.R._STORE_EVER_ENTERED==0)
 shared=L.SharedLink(update_profile=True)
 expected_row=U.stable(actual_row);expected_row['payload_schema']=U.expand(U.DOCS[U.ACTIVE],U.ACTIVE)
 check('exact_selected_actual_canonical_updated_row',L.G.registry['goal.updated']==expected_row)
 check('historical_created_bootstrap_only',L.G.registry['goal.created']==L.ACTIVE_BINDING)
 semantic=C.M.ModelStore();semantic.instance=L.R.SID
 owner=dict(scope_kind='project',operation_id='goal-operation:original',operation_generation=0,server_id='server:original',project_id='project/1',project_home_server_id='server:original',named_plan_id=None,execution_host_id='host:original',execution_environment_id='environment:original',topology_generation=0,command_instance_id='command:original',thread_id='thr_1')
 request=dict(schema_id='pm.goal.start.request.v2',schema_version='2.0.0',command_id='cmd.chat.goal.start',command_instance_id=owner['command_instance_id'],project_id=owner['project_id'],thread_id=owner['thread_id'],goal_id=None,expected_revision=None,expected_currentness_hash=None,actor_ref='actor:original',permission_snapshot_ref='permission:original',idempotency_key='sir-idempotency:original',source_surface='slash',return_route_ref='route:original',objective_text='  Original objective 🌱\n')
 metadata=dict(request_ref='request:original',target_generation=0,dispatch_frame_id='frame:original',dispatch_id='dispatch:original',command_outcome_ref='outcome:original',correlation_id='correlation:original',causation_event_id=None,creation_authority_ref='user-original-create:authority',origin_refs=['msg:1','context:1'],owner_epoch=semantic.owner_epoch,user_stop_epoch=semantic.stop_epoch)
 grant=dict(origin_kind='user_request',source_message_id='msg:1',source_message_refs=['msg:1'],source_context_manifest_ref='context:1',goal_owner_ref='owner.goal_runtime:original')
 start_sir=S.GoalSource(request,owner,metadata,grant);physical=C.A.PhysicalOwner(semantic,C.A.activation_contract(),C.A.DeletionOwner());start=C.GoalCommand(physical,start_sir,shared)
 start.begin();start_sir.acknowledge();start_sir.advance_clock('2026-09-12T08:00:05Z');start_response=start.complete();start_row=start.read();baseline=semantic.current()
 check('genuine_original_settled_start',start_row['phase']=='terminal' and start_row['owner_result']['status']=='succeeded' and baseline['body']['revision']==1 and baseline['control']['pending']is None)
 check('no_update_custody_before_update',not physical._update_cells and not physical._update_issued)
 original_start_receipt=semantic.read_receipt(start_row['body_commit']['receipt_request']);original_owner_ref=original_start_receipt['owner_ref']
 check('actual_original_owner_provenance',original_owner_ref==start_sir.primitive_state['grant']['goal_owner_ref'] and original_owner_ref!='goal-runtime:fixture')
 save('00-historical-start',dict(original_body_receipt=original_start_receipt,original_owner_ref=original_owner_ref,profile='OLD_SYNTHETIC_CREATED_SETUP_LINEAGE_ONLY',command=start_row,response=start_response,body=baseline,original_created_binding=L.G.registry['goal.created']))
 operation='goal-operation:direct-save:ordinary';command_id='command:direct-save:ordinary';now='2026-09-12T08:00:10Z';body=baseline['body'];control=baseline['control']
 update_request=dict(schema_id='pm.goal.update.request.v2',schema_version='2.0.0',command_id='cmd.chat.goal.update',command_instance_id=command_id,project_id=body['project_id'],thread_id=body['thread_id'],goal_id=body['goal_id'],expected_revision=1,expected_currentness_hash=body['currentness_hash'],actor_ref='actor:original',permission_snapshot_ref='permission:direct-save',idempotency_key='sir-idempotency:direct-save',source_surface='chat_goal_direct_save',return_route_ref='route:direct-save',objective_text=newtext,change_source='user_direct',source_message_id=None,approval_id=None)
 update_owner=dict(owner,operation_id=operation,command_instance_id=command_id)
 normalized=dict(request_ref='request:direct-save',command_id=update_request['command_id'],command_instance_id=command_id,operation_id=operation,owner_identity=update_owner,payload_sha256=U.h(update_request),idempotency_key=update_request['idempotency_key'],target_generation=0,dispatch_frame_id='frame:direct-save')
 origin=dict(goal_id=body['goal_id'],goal_revision=2,origin_kind='user_request',source_message_refs=[],source_context_manifest_ref='context:direct-save',bound_plan_ref=None,owning_workflow_ref=None)
 acceptance=dict(change_source='user_direct',source_message_id=None,approval_id=None,original_change_authority_ref='user-direct-save:authority',source_context_manifest_ref='context:direct-save',origin=origin)
 producer=dict(schema_id='pm.event.v0',schema_version='2.0.0',scope_kind='project',event_id='goal.updated:direct-save:ordinary',event_type='goal.updated',project_id=body['project_id'],thread_id=body['thread_id'],run_id=None,node_id=None,attempt_id=None,actor_ref=update_request['actor_ref'],requested_account_ref=None,effective_account_ref=None,occurred_at_utc=now,producer_sequence_id=None,correlation_id='correlation:direct-save',causation_event_id=None,parent_event_id=None,idempotency_key='goal.updated:direct-save:ordinary',payload_schema_id='pm.goal_runtime_event.goal_updated.schema.v3',payload_ref=None,redaction_profile='no_secrets',replay_policy='dedupe_by_idempotency_key',migration=dict(migrated_from_schema_id=None,migrated_from_schema_version=None,migration_id=None,compatibility_event_type=None))
 metadata=dict(storage_instance_id=semantic.instance,dispatch_id='dispatch:direct-save',command_outcome_ref='outcome:direct-save',acceptance=acceptance,owner_epoch=semantic.owner_epoch,stop_epoch=semantic.stop_epoch,prior_objective_revision=control['latest_objective_revision'],prior_revision_hash=control['latest_revision_hash'],source_authority_ref='source:direct-save',producer_metadata=producer,result_ref='result:direct-save',terminal_authority_ref='terminal:direct-save')
 from pm_goal_current_writer_oracles import recipe
 event_id,event_key=recipe('goal.updated',dict(storage_instance_id=semantic.instance,project_id=body['project_id'],thread_id=body['thread_id'],goal_id=body['goal_id'],command_id=normalized['command_id'],command_instance_id=normalized['command_instance_id'],operation_id=normalized['operation_id']))
 metadata['producer_metadata'].update(event_id=event_id,idempotency_key=event_key)
 bridge=None
 if agent:
  from approval_bridge_v2 import ChatOwnerV2,PersonOwnerV2,ApprovalBridgeV2
  update_request.update(change_source='agent_proposed_user_approved',source_message_id='message:actual-agent-v2',approval_id='approval:actual-person-v2',source_surface='chat_goal_approved_agent')
  normalized['payload_sha256']=U.h(update_request)
  target=dict(scope=dict(storage_instance_id=semantic.instance,**{k:body[k] for k in ('project_id','thread_id','goal_id')}),expected_revision=update_request['expected_revision'],expected_currentness_hash=update_request['expected_currentness_hash'],objective_text=newtext)
  proposal=dict(schema_id='pm.goal.update.proposal_request.v1',schema_version='1.0.0',command_id='cmd.chat.goal.propose_update',command_instance_id='proposal:actual-v2',target=target,actor_ref=update_request['actor_ref'],permission_snapshot_ref=update_request['permission_snapshot_ref'],source_message_id=update_request['source_message_id'],instruction_message_id='message:actual-user-instruction-v2',return_route_ref=update_request['return_route_ref'])
  chat=ChatOwnerV2();human=PersonOwnerV2('person:actual-v2')
  chat.agent_message(update_request['source_message_id'],body['thread_id'],update_request['actor_ref'],newtext)
  chat.user_instruction(proposal['instruction_message_id'],body['thread_id'],target)
  chat.accept_dispatch(proposal)
  bridge=ApprovalBridgeV2(chat,human,proposal,U,update_request['approval_id'],'2026-09-12T08:00:07Z','2026-09-12T09:00:00Z')
  human.protected_decision(update_request['approval_id'],U.h(proposal),'approved','2026-09-12T08:00:08Z');bridge.now=now
  resolution=bridge.resolve()
  metadata['acceptance'].update(change_source=update_request['change_source'],source_message_id=update_request['source_message_id'],approval_id=update_request['approval_id'],original_change_authority_ref=resolution['protected_person_decision_ref'])
  metadata['acceptance']['origin']['source_message_refs']=[update_request['source_message_id']]
 before_source_effects=effects(SimpleNamespace(**locals()))
 if before_source is not None:before_source(update_request,normalized,metadata)
 try:
  sir=S.GoalSource(update_request,normalized,metadata,None,now=now,approval_owner_v2=None if omit_provider else bridge);command=C.GoalCommand(physical,sir,shared,goal_id=body['goal_id'])
 except Exception as error:
  if on_refusal is not None:on_refusal(error,SimpleNamespace(**locals()))
  raise
 return SimpleNamespace(**locals())


class Corpus:
    def __init__(self, output):
        self.output = output
        self.rows = []
        self.checks = []

    def check(self, name, condition):
        if not condition:
            raise AssertionError(name)
        self.checks.append(name)

    def save(self, name, value):
        dump(self.output/(name+'.json'), value)

    def branch(self, name, action, refusal=None, preserved=None):
        """One isolated execution from a genuine complete original baseline.

        The parent publishes no child state. A refused case must hit its named
        predicate and preserve its actual earlier durable effects. An unexpected
        success is a harness failure, never an expected-negative success code.
        """
        path = self.output/(name.replace('/', '__')+'.json')
        sys.stdout.flush()
        pid = os.fork()
        if pid == 0:
            row = dict(id=name, expected_refusal=refusal)
            try:
                before = None if preserved is None else preserved()
                try:
                    value = action()
                except Exception as error:
                    if refusal is None:
                        raise
                    # A concrete original-owner refusal is required. Setup,
                    # assertion, import and unanticipated errors never qualify.
                    import goal_update_support as U
                    import goal_support as GS
                    import goal_command as C
                    from pm_goal_own_c_oracles import Refusal
                    from jsonschema.exceptions import ValidationError
                    assert isinstance(error, (U.Unavailable, GS.Refused,
                                              C.M.Rejected, C.A.Rejected,
                                              Refusal, ValidationError)), type(error)
                    assert refusal in str(error), (refusal, str(error))
                    row.update(observed_refusal=str(error), error_type=type(error).__name__)
                else:
                    assert refusal is None, 'negative unexpectedly accepted'
                    row['value'] = value
                if preserved is not None:
                    assert preserved() == before, 'earlier genuine effects changed'
                    row['preserved_earlier_effects'] = True
                row['status'] = 'PASS'
                dump(path, row)
                os._exit(0)
            except BaseException as error:
                row.update(status='FAIL', error=str(error), traceback=traceback.format_exc())
                dump(path, row)
                os._exit(1)
        _, status = os.waitpid(pid, 0)
        row = json.loads(path.read_text())
        self.rows.append(row)
        assert os.waitstatus_to_exitcode(status) == 0, row


def effects(f):
    """Observe original effect custody; never write or repair its private maps."""
    return f.U.tree((f.semantic.snapshot(), f.semantic.receipts,
        f.physical._cells, f.physical._issued,
        f.physical._update_cells, f.physical._update_issued,
        f.shared.store._owner, f.shared.store._table))


def source_capture(f):
    f.shared.advance_original_clock('2026-09-12T08:00:11Z',
        '2026-09-12T08:00:12Z', '2026-09-12T08:00:13Z')
    f.command.capture_original_update()
    f.sir.acknowledge_original_update('2026-09-12T08:00:11Z')


def publish(f):
    f.command.freeze_update_producer()
    f.shared.publish_original_update(f.command)
    f.shared.issue_original_update(f.command)
    f.physical.publish_original_update_progress(f.command, 'event_issued')
    f.sir.advance_original_update_clock('2026-09-12T08:00:14Z')


def whole_progress(f, phase):
    p = f.command.read_update_progress()
    assert p['phase'] == phase, p['phase']
    values = {k: f.physical.read_update_row(f.command, k)
              for k in ('SourceAudit', 'InputContent', 'ProgressHead')}
    values['progress'] = p
    values['immutable_progress'] = f.command.read_update_progress(p['progress_epoch'])
    assert values['immutable_progress'] == p
    f.U.check(values['SourceAudit'], 'SourceAudit')
    f.U.check(values['InputContent'], 'InputContent')
    assert values['ProgressHead']['snapshot_sha256'] == f.U.h(f.U.row('Progress', p))
    if p['body_commit'] is not None:
        receipt = f.semantic.read_receipt(p['body_commit']['receipt_request'])
        assert f.U.body_commit(values['SourceAudit'], receipt, f.C.M) == p['body_commit']
        values['original_body_receipt'] = receipt
    if p['publication'] is not None:
        proof = f.shared.proof_original_update(f.command, p['publication'])
        event = f.shared.find_original_update(f.command, p['producer_input'])
        full = f.shared.store.resolve_full_value({'event': event})
        assert proof == p['publication']
        assert full['first_append_receipt'] == proof['first_append_receipt']
        assert full['original_event_value_commitment'] == proof['original_event_value_commitment']
        assert f.L.G.part(event).startswith('project~')
        values.update(original_event=event, original_full_value=full)
    return values


def run_ordinary(c, text, agent):
    f = fixture(text, agent, c.check, c.save)
    baseline = copy.deepcopy(f.baseline)
    frames = len(f.shared.store._owner['source']['frames'])
    source_capture(f)
    c.save('01-U0', whole_progress(f, 'source_admitted'))
    f.command.reserve_update()
    c.save('02-U1', whole_progress(f, 'body_reserved'))
    f.command.commit_update_body()
    c.save('03-U2', whole_progress(f, 'body_committed'))
    current = f.semantic.current()
    c.check('one_new_body_revision', current['body']['revision'] == 2)
    c.check('exact_text_and_created_at', current['body']['objective_text'] == text
            and current['body']['created_at'] == baseline['body']['created_at'])
    c.check('whole_original_history_origin', current['revisions'][:-1] == baseline['revisions']
            and current['origins']['1'] == baseline['origins']['1'])
    c.check('no_event_before_body', len(f.shared.store._owner['source']['frames']) == frames)
    publish(f)
    c.save('04-U3', whole_progress(f, 'event_issued'))
    response = f.command.complete_update()
    terminal = f.physical.read_update_row(f.command, 'Terminal')
    c.check('original_terminal', response == terminal['response']
            and terminal['result']['status'] == 'succeeded')
    c.branch('terminal/replay', f.command.replay_update_terminal, preserved=lambda: effects(f))
    c.check('one_original_event', len(f.shared.store._owner['source']['frames']) == frames+1)
    c.save('05-U4', terminal)
    c.save('06-physical-values', dict(
        body=[dict(family=k[0], key=k[1], raw_hex=v['raw'].hex(), byte_size=len(v['raw']))
              for k, v in f.physical._cells.items()],
        update=[dict(key=k, raw_hex=v['raw'].hex(), byte_size=len(v['raw']))
                for k, v in f.physical._update_cells.items()]))


def returning_helper(f, function, owner_method, change):
    """Use interpreter observation at a real helper return; replace no code.

    This is a bounded injection site, not an exhaustive helper inventory or
    guard-isolation engine. It never edits a stored value or an origin map.
    """
    fired = []
    def trace(frame, event, arg):
        parent = frame.f_back
        if (not fired and event == 'return' and frame.f_code.co_name == 'graph_current'
                and parent is not None and parent.f_code.co_name == owner_method
                and str(frame.f_code.co_filename).startswith(str(PACKET))):
            fired.append(dict(helper=frame.f_code.co_name, owner=owner_method,
                              line=parent.f_lineno))
            change(parent)
        return trace
    sys.settrace(trace)
    try:
        return function()
    finally:
        sys.settrace(None)
        assert fired, 'requested returning-helper site did not execute'


def run_boundaries(c):
    f = fixture('  Updated objective 🌿\n', True, c.check, c.save)
    source_capture(f)
    f.command.reserve_update()
    def revoke_before_body():
        def revoke(_):
            f.bridge.revoked = True
        return f.semantic.commit(before_commit=revoke)
    c.branch('U2/last_helper/revocation', revoke_before_body,
             'A2/revoked', lambda: effects(f))
    def content_access_before_body():
        def deny(_):
            f.bridge.chat.allowed = False
        return f.semantic.commit(before_commit=deny)
    c.branch('U2/last_helper/content_access', content_access_before_body,
             'A2/content_access', lambda: effects(f))
    def stop_before_body():
        return f.semantic.commit(before_commit=lambda owner: setattr(owner, 'stop_epoch', owner.stop_epoch+1))
    c.branch('U2/last_helper/stop', stop_before_body,
             'stop_epoch', lambda: effects(f))
    def fault_before_body():
        class Interrupted(Exception):
            pass
        def crash(_):
            raise Interrupted('test interruption before sole body transaction')
        before = effects(f)
        try:
            f.semantic.commit(before_commit=crash)
        except Interrupted:
            assert effects(f) == before
        else:
            raise AssertionError('interruption did not execute')
        return dict(preserved_body_reservation=True)
    c.branch('U2/interrupted_before_commit', fault_before_body)
    f.command.commit_update_body()
    c.save('03-U2', whole_progress(f, 'body_committed'))
    c.branch('U2/no_effect_after_body', lambda: f.semantic.resolve_original_update_no_effect(f.command),
             'cannot infer rollback', lambda: effects(f))
    # Lost command acknowledgement after the real joint body commit is recovered
    # by reading the genuine receipt/progress, never by preparing a second body.
    c.branch('U2/read_after_lost_ack', lambda: whole_progress(f, 'body_committed'),
             preserved=lambda: effects(f))
    f.command.freeze_update_producer()
    c.branch('U3/proof_before_append', lambda: f.shared.proof_original_update(f.command),
             'first append receipt unavailable', lambda: effects(f))
    f.shared.publish_original_update(f.command)
    f.shared.issue_original_update(f.command)
    c.branch('U3/recover_lost_append_ack', lambda: f.shared.proof_original_update(f.command),
             preserved=lambda: effects(f))
    c.branch('U3/repeat_publication', lambda: f.shared.publish_original_update(f.command),
             preserved=lambda: effects(f))
    f.physical.publish_original_update_progress(f.command, 'event_issued')
    c.save('04-U3', whole_progress(f, 'event_issued'))
    f.sir.advance_original_update_clock('2026-09-12T08:00:14Z')
    # Original factual completion must survive expiry/revocation after body commit.
    def retained_after_expiry():
        f.bridge.now = f.bridge.approval['expires_at_utc']
        response = f.command.complete_update()
        assert response['result_status'] == 'succeeded'
        return response
    c.branch('U4/approval_expired_after_body', retained_after_expiry)
    def retained_after_revocation():
        f.bridge.revoked = True
        response = f.command.complete_update()
        assert response['result_status'] == 'succeeded'
        return response
    c.branch('U4/approval_revoked_after_body', retained_after_revocation)
    ticket = f.sir.prepare_original_update_terminal()
    # The same genuine staged ticket remains completable after an interruption;
    # it cannot be replaced with a caller-created ticket.
    c.branch('U4/substituted_stage_ticket', lambda: f.sir.commit_original_update_terminal(object()),
             'same-owner terminal stage ticket', lambda: effects(f))
    response = f.sir.commit_original_update_terminal(ticket)
    c.check('actual_staged_terminal_committed', response['result_status'] == 'succeeded')
    c.save('05-U4', f.physical.read_update_row(f.command, 'Terminal'))
    methods = {
        'source_audit': lambda: f.physical.read_update_row(f.command, 'SourceAudit'),
        'input': lambda: f.physical.read_update_row(f.command, 'InputContent'),
        'progress': f.command.read_update_progress,
        'immutable_progress': lambda: f.command.read_update_progress(0),
        'terminal': lambda: f.physical.read_update_row(f.command, 'Terminal'),
        'proof': lambda: f.shared.proof_original_update(f.command,
                                f.command.read_update_progress()['publication']),
        'terminal_replay': f.command.replay_update_terminal,
    }
    for name, method in methods.items():
        c.branch('read/'+name+'/valid', method, preserved=lambda: effects(f))
        for owner, field, value, guard in (
            ('command', 'allowed', False, 'source/owner/shared audit admission'),
            ('sir', 'available', False, 'source/owner/shared audit admission'),
            ('semantic', 'receipt_installed', False, 'semantic receipt/audit installation'),
            ('shared', 'allowed', False, 'source/owner/shared audit admission')):
            def refuse(o=owner, k=field, v=value, call=method):
                setattr(getattr(f, o), k, v)
                return call()
            c.branch('read/'+name+'/'+owner+'.'+field, refuse, guard, lambda: effects(f))
    for role in ('SourceAudit', 'InputContent', 'Progress', 'Terminal'):
        call = lambda r=role: f.physical.read_update_row(f.command, r)
        def drift(fn=call):
            return returning_helper(f, fn, 'read_update_row',
                                     lambda _: setattr(f.sir, 'allowed', False))
        c.branch('reader_helper/'+role+'/permission', drift,
                 'source/owner/shared audit admission', lambda: effects(f))
        def candidate(fn=call):
            def change(parent):
                # Unpublished return candidate only; its original raw cell and
                # every original commitment stay intact and independent.
                parent.f_locals['out']['goal_id'] = 'goal:substituted'
            return returning_helper(f, fn, 'read_update_row', change)
        c.branch('reader_helper/'+role+'/candidate', candidate,
                 'final exact original update row read', lambda: effects(f))
    def deny_content():
        f.sir.input_allowed = False
        return f.physical.read_update_row(f.command, 'InputContent')
    c.branch('input/content_permission', deny_content,
             'current original thread content admission', lambda: effects(f))
    def tombstone_content():
        f.semantic.delete(held=True)
        return f.physical.read_update_row(f.command, 'InputContent')
    c.branch('input/thread_tombstone', tombstone_content,
             'current original thread content admission', lambda: effects(f))
    for epoch in (-1, True, '0', None, [], {}):
        if epoch is None:
            continue  # None intentionally selects the current head.
        c.branch('progress/epoch/'+repr(epoch), lambda e=epoch: f.command.read_update_progress(e),
                 'exact historical progress epoch request', lambda: effects(f))
    c.save('bounded-helper-sites', dict(
        covered='read_update_row -> graph_current return, four typed output roles; sole ModelStore.commit before_commit',
        exhaustive=False, guard_isolation='SHARED_SWEEP_NOT_RUN'))


def run_no_effect(c):
    f = fixture('  Updated objective 🌿\n', False, c.check, c.save)
    source_capture(f)
    f.command.reserve_update()
    before = copy.deepcopy(f.baseline)
    frames = len(f.shared.store._owner['source']['frames'])
    f.sir.cancel_original_update()
    c.branch('cancel/absence_is_not_terminal', f.command.complete_update,
             'unresolved effect remains retained', lambda: effects(f))
    proof = f.semantic.resolve_original_update_no_effect(f.command)
    f.semantic.reconcile_confirmed_no_effect(f.operation)
    c.save('U5-proof', proof)
    c.save('U5-progress', whole_progress(f, 'no_effect'))
    current = f.semantic.current()
    c.check('no_effect_keeps_body_history_origin', current['body'] == before['body']
            and current['revisions'] == before['revisions'] and current['origins'] == before['origins'])
    c.check('no_effect_clears_only_original_pending', current['control']['pending'] is None
            and f.operation not in f.semantic.receipts)
    c.check('no_effect_no_event', len(f.shared.store._owner['source']['frames']) == frames)
    f.sir.advance_original_update_clock('2026-09-12T08:00:14Z')
    response = f.command.complete_update()
    c.check('truthful_cancelled_terminal', response['result_status'] == 'cancelled'
            and response['event_refs'] == [])
    c.save('U5-terminal', f.physical.read_update_row(f.command, 'Terminal'))
    c.branch('U5/replay', f.command.replay_update_terminal, preserved=lambda: effects(f))


def run_input(c, defect):
    def mutate(request, normalized, metadata):
        if defect == 'replay_only':
            metadata['producer_metadata']['replay_policy'] = 'projector_replay_only'
        elif defect == 'revision_type':
            request['expected_revision'] = True
        elif defect == 'foreign_body':
            request['expected_currentness_hash'] = 'f'*64
        normalized['payload_sha256'] = __import__('goal_update_support').h(request)
    refusal_effects = []
    def on_refusal(error, f):
        assert f.semantic.current() == f.baseline
        assert len(f.semantic.receipts) == 1 and f.operation not in f.semantic.receipts
        assert not f.physical._update_cells and not f.physical._update_issued
        assert effects(f) == f.before_source_effects
        refusal_effects.append(True)
    try:
        # The missing-provider negative starts with the actual agent message,
        # explicit instruction, accepted dispatch and protected approval. Only
        # the source constructor's participant argument is withheld.
        missing_provider = defect == 'agent_masquerade'
        fixture('  Updated objective 🌿\n', missing_provider, c.check, c.save,
                mutate, on_refusal, omit_provider=missing_provider)
    except Exception as error:
        from jsonschema.exceptions import ValidationError
        import goal_update_support as U
        assert isinstance(error, (U.Unavailable, ValidationError)), type(error)
        expected = {'replay_only':'dedupe_by_idempotency_key', 'revision_type':'not of type',
                    'foreign_body':'actual accepted Direct Save body/head expectation',
                    'agent_masquerade':'actual successor approval participant required'}[defect]
        assert expected in str(error), str(error)
        assert refusal_effects == [True]
        c.rows.append(dict(id='input/'+defect, status='PASS', expected_refusal=expected,
                           observed_refusal=str(error), error_type=type(error).__name__,
                           preserved_earlier_effects=True))
    else:
        raise AssertionError('invalid original input accepted: '+defect)


def run_physical_gap(c):
    f = fixture('🌱'*4000, False, c.check, c.save)
    source_capture(f)
    input_value = f.physical.read_update_row(f.command, 'InputContent')
    source = f.physical.read_update_row(f.command, 'SourceAudit')
    # These are actual original stored bytes, never re-encoded or restamped.
    input_cell = f.physical._update_cells[f.U.key('InputContent', input_value)]
    assert len(input_cell['raw']) > 16384
    assert f.U.decode(input_cell['raw'])['record'] == input_value
    assert input_value['request']['objective_text'] == '🌱'*4000
    assert f.semantic.current() == f.baseline
    c.save('physical-gap', dict(status='OBSERVED_SUCCESSOR_REPAIR_REQUIRED',
        selected_manifest_sha256=PIN, phase='source_admitted', scalar_count=4000,
        actual_input_wrapper_bytes=len(input_cell['raw']), raw_hex=input_cell['raw'].hex(),
        input=input_value, source=source, actual_codec='retained Goal canonical JSON',
        required_current_codec='SP-340 canonical MessagePack with per-value SP-337 reference route',
        repaired=False))


SCENARIOS = ('empty', 'unchanged', 'ordinary', 'approved_agent', 'no_effect',
             'boundaries', 'replay_only', 'revision_type', 'foreign_body', 'agent_masquerade',
             'physical_gap')


def scenario(name, output):
    output.mkdir(parents=True, exist_ok=False)
    c = Corpus(output)
    try:
        manifest = qualify()
        if name in ('empty', 'unchanged', 'ordinary', 'approved_agent'):
            text = {'empty':'', 'unchanged':'  Original objective 🌱\n',
                    'ordinary':'  Updated objective 🌿\n', 'approved_agent':'  Updated objective 🌿\n'}[name]
            run_ordinary(c, text, name == 'approved_agent')
        elif name == 'boundaries':
            run_boundaries(c)
        elif name == 'no_effect':
            run_no_effect(c)
        elif name == 'physical_gap':
            run_physical_gap(c)
        else:
            run_input(c, name)
        result = dict(status='PASS_BOUNDED_CASES', closure='NOT_COMPLETE', native='NOT_RUN',
            selected_manifest_sha256=PIN, qualified_members=len(manifest['files']),
            checks=c.checks, cases=c.rows)
        code = 0
    except BaseException as error:
        result = dict(status='FAIL', closure='NOT_COMPLETE', error_type=type(error).__name__,
                      error=str(error), traceback=traceback.format_exc(), checks=c.checks, cases=c.rows)
        code = 1
    dump(output/'result.json', result)
    members = [dict(path=p.name, sha256=sha(p.read_bytes()), bytes=p.stat().st_size)
               for p in sorted(output.iterdir()) if p.is_file()]
    dump(output/'capture-manifest.json', dict(files=members, selected_manifest_sha256=PIN))
    return code


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scenario', choices=SCENARIOS)
    parser.add_argument('--captures', type=Path, required=True)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    assert args.captures.resolve().is_relative_to(Path('/mnt/Cursor/PuppetMaster-Evidence/tests').resolve())
    if args.scenario:
        return scenario(args.scenario, args.captures)
    assert args.output is not None
    runs = []
    for name in SCENARIOS:
        target = args.captures/name
        cmd = [sys.executable, __file__, '--scenario', name, '--captures', str(target)]
        process = subprocess.run(cmd, env={**os.environ, 'PYTHONDONTWRITEBYTECODE':'1'})
        result = json.loads((target/'result.json').read_text())
        runs.append(dict(scenario=name, exit_code=process.returncode,
                         result_path=str(target/'result.json'), result=result))
        dump(args.output, dict(status='RUNNING', runs=runs))
        if process.returncode:
            break
    failed = [r for r in runs if r['exit_code']]
    result = dict(status='FAIL' if failed else 'PASS_BOUNDED_CASES',
                  event_type='goal.updated', whole_root_closure='NOT_COMPLETE',
                  native_execution='NOT_RUN', runs=runs,
                  scenarios=len(runs), negatives=sum(bool(c['expected_refusal'])
                    for r in runs for c in r['result']['cases']),
                  positives=sum(not c['expected_refusal'] for r in runs for c in r['result']['cases']),
                  guard_isolation='SHARED_TOOL_SWEEP_NOT_RUN')
    dump(args.output, result)
    print(json.dumps({k:v for k,v in result.items() if k != 'runs'}))
    return 1 if failed else 2


if __name__ == '__main__':
    raise SystemExit(main())
