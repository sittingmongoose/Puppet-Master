"""Selected U1–U7 provider checks, through DG-U's original TEST_ONLY owners."""
import argparse
import copy
import json
from pathlib import Path

import pm_goal_dg_u_owners as update
from pm_goal_depth_replay import check, replay, write_evidence


def open_update(path):
    return update.World(path, create=False)


def proposal(world, goal, name, text, *, instruction_text=None):
    scope = goal['scope']
    body = world.body.read_private(scope, 'goal-depth')['body']
    agent = 'TEST_ONLY:agent'
    permission = world.permissions.grant(agent, scope, ['propose_goal_update'], person=False)
    instruction = world.chat.post(scope, 'user', goal['user'], dict(
        kind='goal_update_instruction', goal_id=scope['goal_id'],
        replacement_text=text if instruction_text is None else instruction_text))
    message = world.chat.post(scope, 'agent', agent, dict(
        kind='goal_update_proposal_message', goal_id=scope['goal_id'], replacement_text=text))
    return dict(schema_id='pm.goal.update.proposal_request.v1', schema_version='1.0.0',
                command_id='cmd.chat.goal.propose_update', command_instance_id='TEST_ONLY:' + name,
                target=dict(scope=scope, expected_revision=body['revision'],
                            expected_currentness_hash=body['currentness_hash'], objective_text=text),
                actor_ref=agent, permission_snapshot_ref=permission, source_message_id=message,
                instruction_message_id=instruction, return_route_ref='TEST_ONLY:return-route')


def goal_effects(world):
    cells = {family: world.storage.cells.get(family, {}) for family in (
        update.T_BODY, update.T_REV, update.T_ORIGIN, update.T_CONTROL, update.T_RECEIPT,
        update.T_SOURCE, update.T_INPUT, update.T_PROGRESS, update.T_TERMINAL)}
    return dict(goal_cells_sha256=update.sha(update.msgpack(cells)), events=sorted(world.storage.events),
                append_custody=sorted(world.storage.custody))


def capture_cases(root):
    seed = root / 'capture-seed'
    world = update.World(seed)
    goal = update.birth_goal(world)
    good = proposal(world, goal, 'proposal-valid', 'New objective')
    bad = proposal(world, goal, 'proposal-wrong-instruction', 'New objective',
                   instruction_text='An independent instruction for other text')
    dispatches = {p['command_instance_id']: world.sir.admit_proposal(p) for p in (good, bad)}
    before = goal_effects(world)

    def verify(label, opened, request, value):
        check(goal_effects(opened) == before, 'Proposal changed Goal, history, receipt, Event or terminal')
        cid = request['command_instance_id']
        dispatch = opened.sir.proposal_dispatch(cid, 'goal-depth')
        check(dispatch == dispatches[cid] and dispatch['proposal'] == request, 'Original SIR dispatch was replaced')
        instruction = opened.chat.read(request['instruction_message_id'], 'goal-depth')
        agent = opened.chat.read(request['source_message_id'], 'goal-depth')
        check(instruction['author_kind'] == 'user' and agent['actor_ref'] == request['actor_ref'],
              'Messages did not come from the expected original TEST_ONLY owners')
        if value is not None:
            signed = opened.approvals.state(value['approval_id'])
            check(signed['request'] == value['request'] and
                  value['request']['proposal_request_ref'] == dispatch['proposal_request_ref'] and
                  value['request']['target'] == request['target'],
                  'Approval result was not the original stored request for the dispatch')
        else:
            check(not opened.approvals.rows(), 'A refused proposal emitted an approval request')
        return dict(dispatch=dispatch, agent_message=agent, instruction_message=instruction,
                    result=value, goal_effects=before)

    attestation = replay(
        root / 'instruction-attestation', seed=seed, open_world=open_update, module=update,
        function=update.ApprovalOwner.capture, marker="'dgu/hitl/capture/instruction_attests'",
        code='dgu/hitl/capture/instruction_attests', control=good, negative=bad,
        call=lambda w, p: w.approvals.capture(p['command_instance_id']), verify=verify)

    def capture_with_installation(opened, arguments):
        if arguments['withdraw_after_capture_checks']:
            opened.inject('hitl.capture', 'before_release', lambda w, _: w.installation.withdraw())
        return opened.approvals.capture(arguments['proposal']['command_instance_id'])

    def verify_installation(label, opened, args, value):
        observed = verify(label, opened, args['proposal'], value)
        installation = opened.installation.current()
        planned = 'withdrawn' if args['withdraw_after_capture_checks'] else 'installed'
        check(installation['state'] == planned, 'The original installation owner did not reach its planned state')
        return dict(observed, installation=installation)

    withdrawal = replay(
        root / 'proposal-withdrawal', seed=seed, open_world=open_update, module=update,
        function=update.InstallationOwner.require_installed, marker="require(where + '/installation_unavailable'",
        code='dgu/hitl/capture/final/installation_unavailable',
        control=dict(proposal=good, withdraw_after_capture_checks=False),
        negative=dict(proposal=good, withdraw_after_capture_checks=True),
        call=capture_with_installation, verify=verify_installation)
    return dict(instruction=attestation, withdrawal=withdrawal)


def decision_cases(root):
    seed = root / 'decision-seed'
    world = update.World(seed)
    goal = update.birth_goal(world)
    req, _ = update.agent_request(world, goal, 'New objective', decide=None)
    person = 'TEST_ONLY:approver'
    args = dict(approval_id=req['approval_id'], decision='approved', person_ref=person)
    good = dict(args, person_permission_ref=world.permissions.grant(
        person, goal['scope'], ['approve_goal_update'], person=True))
    bad = dict(args, person_permission_ref=world.permissions.grant(
        person, goal['scope'], ['approve_goal_update'], person=False))
    before = goal_effects(world)

    def verify(label, opened, arguments, value):
        check(goal_effects(opened) == before, 'Approval decision changed Goal, Event or terminal')
        original = opened.approvals.state(arguments['approval_id'])
        check(original['resolution'] == value, 'The observed resolution differs from original owner custody')
        if value is not None:
            check(value['request_sha256'] == update.sha(update.msgpack(original['request'])),
                  'Resolution does not commit to the full original request bytes')
        permission = opened.permissions.state(arguments['person_permission_ref'])
        return dict(request=original['request'], resolution=value, permission=permission, goal_effects=before)

    return replay(root / 'person-decision', seed=seed, open_world=open_update, module=update,
                  function=update.ApprovalOwner.decide, marker="'dgu/hitl/decide/not_person'",
                  code='dgu/hitl/decide/not_person', control=good, negative=bad,
                  call=lambda w, p: w.approvals.decide(**p), verify=verify)


def body_cases(root):
    seed = root / 'mutation-seed'
    world = update.World(seed)
    goal = update.birth_goal(world)
    scope = goal['scope']
    request, _ = update.agent_request(world, goal, 'Approved replacement 🌿')
    admission = world.command.run(request, stop_after='reserve')
    operation = admission['normalized_identity']['operation_id']
    original_approval = world.approvals.state(request['approval_id'])
    chosen_ref = original_approval['resolution']['protected_person_decision_ref']
    replacement = 'TEST_ONLY:substituted-person-decision'
    before = goal_effects(world)
    arguments = dict(update_request=request, operation_id=operation)

    def call(w, args):
        if args['replace_protected_decision']:
            # Change one stored owner fact after the first acceptance check returned.
            def substitute(current, _):
                selected = current.approvals.state(request['approval_id'])
                changed = dict(selected['resolution'], protected_person_decision_ref=replacement)
                current.approvals.put(request['approval_id'], dict(selected, resolution=changed))
            w.inject('body.commit', 'before_release', substitute)
        return w.command.commit(w.sir.admission(request['command_instance_id']))

    def verify(label, opened, args, result):
        approval = opened.approvals.state(request['approval_id'])
        chosen = replacement if args['replace_protected_decision'] else chosen_ref
        check(approval['resolution'] == dict(original_approval['resolution'], protected_person_decision_ref=chosen),
              'The negative must change only the independently stored protected decision reference')
        if result is None:
            check(goal_effects(opened) == before, 'The final refusal allowed a Goal or publication effect')
            return dict(approval=approval['resolution'], goal_effects=before)
        receipt = result['receipt']
        check(receipt['owner_ref'] == opened.body.owner_id and receipt['authority_ref'] == chosen_ref,
              'The body receipt does not name the original sole owner and approval')
        check(receipt['operation_id'] == operation and receipt['after_revision'] == request['expected_revision'] + 1,
              'Body revision or operation did not join the original request')
        check(not opened.storage.events, 'An Event appeared before body commit completed')

        frozen = opened.producer.freeze(scope, operation)['producer_input']
        published = opened.producer.publish(scope, operation)['publication']
        event_id = published['event_id']
        event = opened.storage.read_event(event_id)
        first = opened.storage.full_value_result(event_id)
        terminal = opened.sir.terminalize(request['command_instance_id'], 'succeeded')['terminal']
        check(first['first_append_receipt'] == published['first_append_receipt'] and
              first['original_event_value_commitment'] == published['original_event_value_commitment'],
              'Publication did not preserve the genuine first receipt and full EventRecord commitment')
        source = opened.source.read_source(scope, operation, 'goal-depth')['record']
        check(source['acceptance']['original_change_authority_ref'] == chosen_ref and
              frozen['payload']['approval_id'] == request['approval_id'] and
              frozen['payload']['source_message_id'] == request['source_message_id'] and
              event['payload'] == frozen['payload'],
              'Approval/source lineage does not reach the frozen producer and canonical Event')
        settled = terminal['result']
        check(settled['status'] == 'succeeded' and settled['publication'] == published and
              settled['body_commit']['accepted_revision_hash'] == receipt['accepted_revision_hash'],
              'SIR did not settle with the original body and publication custody')
        check(opened.sir.replay(request['command_instance_id'])['terminal'] == terminal,
              'SIR replay changed the immutable original terminal')
        settled_effects = goal_effects(opened)
        provider_withdrawal = opened.installation.withdraw()
        check(opened.sir.replay(request['command_instance_id'])['terminal'] == terminal and
              goal_effects(opened) == settled_effects,
              'Withdrawal changed the original terminal or a settled Goal effect')
        return dict(approval=approval['resolution'], source_acceptance=source['acceptance'], body_receipt=receipt,
                    provider_withdrawal=provider_withdrawal,
                    frozen_producer=frozen, event=event, raw_frame_sha256=update.sha(opened.storage.read_frame(event_id)),
                    first_publication=first, terminal=terminal)

    return replay(root / 'final-approval', seed=seed, open_world=open_update, module=update,
                  function=update.GoalUpdateCommand.final_checks, marker="require(where + '/approval_authority'",
                  code='dgu/body/commit/final/approval_authority',
                  control=dict(arguments, replace_protected_decision=False),
                  negative=dict(arguments, replace_protected_decision=True), call=call, verify=verify)


def observe_provider_storage(root):
    """Record outstanding behavior using the original approvals owner and valid proposals."""
    world = update.World(root / 'provider-storage')
    goal = update.birth_goal(world)
    short = proposal(world, goal, 'same-dispatch', 'Small approval')
    original = world.sir.admit_proposal(short)
    first = world.approvals.capture(short['command_instance_id'])
    replay_dispatch = world.sir.admit_proposal(copy.deepcopy(short))
    repeated = world.approvals.capture(short['command_instance_id'])
    check(replay_dispatch == original, 'SIR did not select its original dispatch for an equal retry')
    large = proposal(world, goal, 'large-proposal', '🌿' * 4000)
    world.sir.admit_proposal(large)
    prior_packs = sorted(world.storage.packs)
    captured = world.approvals.capture(large['command_instance_id'])
    state = world.approvals.state(captured['approval_id'])
    stored_cell = world.storage.cell(world.approvals.table, captured['approval_id'])['value']
    if stored_cell.get('dgu_cell') == 'pack_ref':
        raw = world.storage.read_pack(stored_cell['payload_ref'], expected_media_type=update.MEDIA)
        check(raw == update.msgpack(state), 'The generic owner-cell pack did not return its entire original value')
    return dict(equal_proposal=short, dispatch_id=original['dispatch_id'],
                first=first, repeated=repeated, equal_capture_replay=first == repeated,
                large_proposal=large, large_request_bytes=len(update.msgpack(captured['request'])),
                large_request_sha256=state['request_sha256'], stored_content=state['stored_proposal']['content'],
                generic_owner_cell_pack=stored_cell.get('payload_ref'),
                packs_before=prior_packs, packs_after=sorted(world.storage.packs))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True)
    cases = capture_cases(args.out)
    cases['protected_person'] = decision_cases(args.out)
    cases['final_approval'] = body_cases(args.out)
    diagnostics = observe_provider_storage(args.out)
    write_evidence(args.out / 'update.json', dict(cases=cases, provider_storage_observations=diagnostics))
    print(json.dumps(dict(exact_cut_and_restore=len(cases),
                          identical_proposal_replayed=diagnostics['equal_capture_replay'],
                          large_proposal_carrier_content=diagnostics['stored_content'])))


if __name__ == '__main__':
    main()
