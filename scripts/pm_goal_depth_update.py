"""Selected U1–U7 provider checks, through DG-U's original TEST_ONLY owners."""
import argparse
import copy
import json
from pathlib import Path
from unittest.mock import patch

import pm_goal_dg_u_owners as update
import pm_goal_depth_provider as provider
from pm_goal_depth_replay import check, replay, retain_manifests, write_evidence


def open_update(path):
    return provider.World(path, create=False)


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
    world = provider.World(seed)
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
            check(signed['request_sha256'] == update.sha(update.msgpack(value['request'])) and
                  value['request']['proposal_request_ref'] == dispatch['proposal_request_ref'] and
                  value['request']['target'] == request['target'],
                  'Approval result was not the original stored request for the dispatch')
        else:
            check(not opened.approvals.rows(), 'A refused proposal emitted an approval request')
        return dict(dispatch=dispatch, agent_message=agent, instruction_message=instruction,
                    result=value, goal_effects=before)

    attestation = replay(
        root / 'instruction-attestation', seed=seed, open_world=open_update, module=provider,
        function=provider.ApprovalOwner.check_sources, marker="require(where + '/instruction_attests'",
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

    def capture_with_surface(opened, arguments):
        if arguments['remove_approval_surface']:
            def remove_surface(world, _):
                current = world.installation.current()
                world.installation.put('current', dict(current, enrolled_roles=[
                    role for role in current['enrolled_roles'] if role != 'approval']))
            opened.inject('hitl.capture', 'before_release', remove_surface)
        return opened.approvals.capture(arguments['proposal']['command_instance_id'])

    # The surface is checked at entry and again after the last helper.
    # This distinct final predicate is exercised on otherwise valid sources.
    surface = replay(
        root / 'approval-surface', seed=seed, open_world=open_update, module=provider,
        function=provider.ApprovalOwner.check_live_proposal, marker="require(where + '/approval_surface'",
        code='dgu/hitl/capture/final/approval_surface',
        control=dict(proposal=good, remove_approval_surface=False),
        negative=dict(proposal=good, remove_approval_surface=True),
        call=capture_with_surface, verify=lambda label, w, args, value: verify(label, w, args['proposal'], value))
    def capture_with_expiry(opened, arguments):
        opened.selected_expiry = arguments['expiry']
        return opened.approvals.capture(arguments['proposal']['command_instance_id'])

    expiry = replay(
        root / 'approval-expiry-grammar', seed=seed, open_world=open_update, module=provider,
        function=provider.ApprovalOwner.capture, marker="require(where + '/expiry_time'",
        code='dgu/hitl/capture/expiry_time',
        control=dict(proposal=good, expiry='2050-01-02T12:00:00.1000Z'),
        negative=dict(proposal=good, expiry='2050-01-02t12:00:00.1000Z'),
        call=capture_with_expiry, verify=lambda label, w, args, value: verify(label, w, args['proposal'], value))
    return dict(instruction=attestation, withdrawal=withdrawal, surface=surface, expiry_grammar=expiry)


def decision_cases(root):
    seed = root / 'decision-seed'
    world = provider.World(seed)
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
        approval_id = arguments['approval_id']
        original = opened.approvals.read_request(approval_id, 'goal-depth')
        key = update.resolution_key(goal['scope'], approval_id)
        cell = opened.storage.cell(provider.RESOLUTION, key)
        check((cell['value']['resolution'] if cell else None) == value,
              'The observed resolution differs from original owner custody')
        if value is not None:
            check(value['request_sha256'] == update.sha(update.msgpack(original)),
                  'Resolution does not commit to the full original request bytes')
        permission = opened.permissions.state(arguments['person_permission_ref'])
        return dict(request=original, resolution=value, permission=permission, goal_effects=before)

    return replay(root / 'person-decision', seed=seed, open_world=open_update, module=provider,
                  function=provider.ApprovalOwner.decide, marker="require(where + '/not_person'",
                  code='dgu/hitl/decide/not_person', control=good, negative=bad,
                  call=lambda w, p: w.approvals.decide(**p), verify=verify)


def body_cases(root):
    seed = root / 'mutation-seed'
    world = provider.World(seed)
    goal = update.birth_goal(world)
    scope = goal['scope']
    request, _ = update.agent_request(world, goal, 'Approved replacement 🌿')
    admission = world.command.run(request, stop_after='reserve')
    operation = admission['normalized_identity']['operation_id']
    approval_id = request['approval_id']
    resolution_key = update.resolution_key(scope, approval_id)
    original_resolution = world.approvals.read_stored_resolution(scope, approval_id, 'goal-depth')['resolution']
    chosen_ref = original_resolution['protected_person_decision_ref']
    replacement = 'TEST_ONLY:substituted-person-decision'
    before = goal_effects(world)
    arguments = dict(update_request=request, operation_id=operation)

    def call(w, args):
        if args['replace_protected_decision']:
            # Change one stored owner fact after the first acceptance check returned.
            def substitute(current, _):
                cell = current.storage.cell(provider.RESOLUTION, resolution_key)
                row = dict(cell['value'], resolution=dict(original_resolution,
                                                          protected_person_decision_ref=replacement))
                current.transact([dict(table=provider.RESOLUTION, key=resolution_key,
                                       expected=cell['version'], value=row)])
            w.inject('body.commit', 'before_release', substitute)
        return w.command.commit(w.sir.admission(request['command_instance_id']))

    def verify(label, opened, args, result):
        resolution = opened.approvals.read_stored_resolution(scope, approval_id, 'goal-depth')['resolution']
        chosen = replacement if args['replace_protected_decision'] else chosen_ref
        check(resolution == dict(original_resolution, protected_person_decision_ref=chosen),
              'The negative must change only the independently stored protected decision reference')
        if result is None:
            check(goal_effects(opened) == before, 'The final refusal allowed a Goal or publication effect')
            return dict(approval=resolution, goal_effects=before)
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
        return dict(approval=resolution, source_acceptance=source['acceptance'], body_receipt=receipt,
                    provider_withdrawal=provider_withdrawal,
                    frozen_producer=frozen, event=event, raw_frame_sha256=update.sha(opened.storage.read_frame(event_id)),
                    first_publication=first, terminal=terminal)

    return replay(root / 'final-approval', seed=seed, open_world=open_update, module=update,
                  function=update.GoalUpdateCommand.final_checks, marker="require(where + '/approval_authority'",
                  code='dgu/body/commit/final/approval_authority',
                  control=dict(arguments, replace_protected_decision=False),
                  negative=dict(arguments, replace_protected_decision=True), call=call, verify=verify)


def retry_case(root, world_type=provider.World):
    """HITL-1130/U3: equal original dispatch reuses identity across reopen and target advance."""
    world = world_type(root)
    goal = update.birth_goal(world)
    short = proposal(world, goal, 'same-dispatch', 'Small approval')
    original = world.sir.admit_proposal(short)
    first = world.approvals.capture(short['command_instance_id'])
    replay_dispatch = world.sir.admit_proposal(copy.deepcopy(short))
    check(replay_dispatch == original, 'SIR did not select its original dispatch for an equal retry')
    reopened = world_type(root, create=False)
    before = reopened.observe_effects()
    repeated = reopened.approvals.capture(short['command_instance_id'])
    check(first == repeated, 'Equal dispatch issued a second approval identity')
    check(reopened.observe_effects() == before, 'Approval retry wrote a second durable value')
    altered = dict(short, return_route_ref='TEST_ONLY:other-return-route')
    expect_refusal('dgu/sir/proposal_conflict', lambda: reopened.sir.admit_proposal(altered))
    check(reopened.observe_effects() == before, 'Conflicting retry wrote a durable value')
    call_count = len(reopened.recorder.calls)
    direct = update.direct_request(reopened, goal, 'Later objective')
    with patch.object(reopened.approvals, 'read_resolution', side_effect=AssertionError('Direct Save reached HITL')):
        reopened.command.run(direct)
    check(not any(call['method'].startswith('hitl.') for call in reopened.recorder.calls[call_count:]),
          'Direct Save reached HITL')
    check(reopened.sir.replay(direct['command_instance_id'])['terminal']['result']['status'] == 'succeeded' and
          reopened.body.read_private(goal['scope'], 'goal-depth')['body']['objective_text'] == 'Later objective',
          'Direct Save did not advance the original Goal target')
    check(reopened.approvals.capture(short['command_instance_id']) == first,
          'Retry after the Goal advanced replaced or lost the original approval')
    return dict(dispatch_id=original['dispatch_id'], original_approval=first, replayed_approval=repeated,
                conflict='dgu/sir/proposal_conflict')


def expect_refusal(code, call):
    try:
        call()
    except (update.Refusal, update.S.StorageRefusal) as error:
        check(update.refusal_code(error) == code, f'Expected {code}, got {error}')
    else:
        raise AssertionError(f'Expected refusal {code}, but the call succeeded')
    return code


def expiry_case(root, world_type=provider.World):
    """HITL-1130/U3–U4: preserve the selected expiry and refuse when it is reached."""
    world = world_type(root)
    goal = update.birth_goal(world)
    world.selected_expiry = '2050-01-02T12:00:00.1000Z'
    world.now = lambda: '2050-01-02T12:00:00.0999Z'
    request, sources = update.agent_request(world, goal, 'Time limited objective')
    approval_id = request['approval_id']
    live = world.approvals.read_resolution(approval_id, 'goal-depth')
    check(live['request']['expires_at_utc'] == world.selected_expiry,
          'The issued approval lost the owner-selected expiry')
    before = goal_effects(world)
    world.now = lambda: '2050-01-02T12:00:00.1Z'
    refusal = expect_refusal('goal-depth/approval_expired', lambda: world.approvals.read_resolution(
        approval_id, 'goal-depth'))
    expect_refusal('dgu/source/capture/acceptance/approval_expired', lambda: world.command.admit_and_capture(request))
    check(goal_effects(world) == before, 'An expired approval reached Goal mutation or publication')
    return dict(request=live['request'], resolution=live['resolution'], expired=refusal,
                source_message=sources['agent_message'])


def storage_case(root, kind, world_type=provider.World):
    """SP-1130/U6: validate and resolve the complete selected physical value."""
    world = world_type(root)
    goal = update.birth_goal(world)
    text = '🌿' * 4000 if kind == 'payload_ref' else 'Small replacement'
    request, lineage = update.agent_request(world, goal, text)
    approval_id, scope = request['approval_id'], goal['scope']
    core = world.approvals.state(approval_id)
    key = update.proposal_key(scope, lineage['proposal']['command_instance_id'])
    cell = world.storage.cell(provider.PROPOSAL, key)
    stored = cell['value'] if cell else core['stored_proposal']
    uri = update.CONTRACTS_URI + '#/$defs/'
    errors = list(world.approvals.bank.errors(uri + 'StorageProposal', stored))
    check(not errors, f'Owner schema refused the {kind} proposal at {list(errors[0].absolute_path) if errors else []}')
    content = stored['content']
    check(content['kind'] == kind, f'Proposal selected {content["kind"]} instead of {kind}')
    if kind == 'inline':
        raw = update.msgpack(content['request'])
    else:
        reference = content['reference']
        raw = world.storage.read_pack(reference, expected_media_type=update.MEDIA)
        check(reference['byte_size'] == len(raw) > update.CAP, 'Pack does not contain the complete large proposal')
    check(raw == update.msgpack(lineage['proposal']) and update.sha(raw) == stored['original_request_sha256'],
          'Stored proposal did not resolve the original submitted bytes')
    live = world.approvals.read_resolution(approval_id, 'goal-depth')
    decision_key = update.resolution_key(scope, approval_id)
    decision = world.storage.cell(provider.RESOLUTION, decision_key)
    check(decision is not None, 'Missing separately stored content-free approval resolution')
    wrapper = decision['value']
    check(not list(world.approvals.bank.errors(uri + 'StorageApprovalResolution', wrapper)),
          'The stored resolution does not match the owner schema')
    check(wrapper['resolution'] == live['resolution'] and
          live['resolution']['request_sha256'] == update.sha(update.msgpack(live['request'])),
          'Resolution did not commit to the exact ApprovalRequest bytes')
    world.command.run(request)
    terminal = world.sir.replay(request['command_instance_id'])['terminal']
    event_id = terminal['result']['publication']['event_id']
    first = world.storage.full_value_result(event_id)
    check(terminal['result']['status'] == 'succeeded' and
          world.storage.read_event(event_id)['payload']['approval_id'] == approval_id and
          first['first_append_receipt'] == terminal['result']['publication']['first_append_receipt'] and
          world.body.read_private(scope, 'goal-depth')['body']['objective_text'] == text,
          'Original proposal storage did not reach the sole body, first frame and settled result')
    before = goal_effects(world)
    if kind == 'payload_ref':
        path = world.storage.root / 'packs' / reference['blake3']
        path.rename(path.with_name('held-' + path.name))
        expect_refusal('pack/present', lambda: world.approvals.read_resolution(approval_id, 'goal-depth'))
        check(goal_effects(world) == before, 'Missing proposal bytes caused a Goal mutation')
    world.installation.withdraw()
    if kind == 'inline':
        expect_refusal('goal-depth/installation_unavailable', lambda: world.approvals.read_resolution(
            approval_id, 'goal-depth'))
    world.threads.delete(scope['project_id'], scope['thread_id'])
    retained = world.approvals.read_retained_resolution(scope, approval_id, goal['user'], goal['user_permission'])
    check(retained == wrapper, 'Independent retained decision read depended on live proposal content')
    world.permissions.revoke(goal['user_permission'])
    refusal = expect_refusal('dgu/hitl/retained/permission_revoked', lambda: world.approvals.read_retained_resolution(
        scope, approval_id, goal['user'], goal['user_permission']))
    return dict(stored_proposal=stored, stored_resolution=wrapper, proposal_bytes=len(raw),
                first_publication=first, terminal=terminal,
                retained_permission_refusal=refusal)


def decision_storage_case(root, world_type=provider.World):
    """SP-1130/U6: the content-free original decision has a separate stored value."""
    world = world_type(root)
    goal = update.birth_goal(world)
    request, _ = update.agent_request(world, goal, 'Denied objective', decide='denied')
    key = update.resolution_key(goal['scope'], request['approval_id'])
    stored = world.storage.cell(provider.RESOLUTION, key)
    check(stored is not None, 'No independent StorageApprovalResolution was published')
    wrapper = stored['value']
    original = world.approvals.read_request(request['approval_id'], 'goal-depth')
    check(wrapper['resolution']['request_sha256'] == update.sha(update.msgpack(original)) and
          wrapper['resolution']['decision'] == 'denied', 'Stored denial lost its original decision or request commitment')
    refusal = expect_refusal('goal-depth/approval_denied', lambda: world.approvals.read_resolution(
        request['approval_id'], 'goal-depth'))
    check(world.approvals.read_retained_resolution(goal['scope'], request['approval_id'], goal['user'],
                                                   goal['user_permission']) == wrapper,
          'A truthful denial was unavailable from the independently stored decision')
    return dict(stored_resolution=wrapper, live_refusal=refusal)


def provider_cases(root, world_type=provider.World):
    return (
        ('retry', 'Equal dispatch issued a second approval identity',
         lambda: retry_case(root / 'retry', world_type)),
        ('expiry', 'The issued approval lost the owner-selected expiry',
         lambda: expiry_case(root / 'expiry', world_type)),
        ('inline', "Owner schema refused the inline proposal at ['content']",
         lambda: storage_case(root / 'inline', 'inline', world_type)),
        ('payload_ref', "Owner schema refused the payload_ref proposal at ['content']",
         lambda: storage_case(root / 'payload-ref', 'payload_ref', world_type)),
        ('decision', 'No independent StorageApprovalResolution was published',
         lambda: decision_storage_case(root / 'decision-storage', world_type)),
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    root = args.out.resolve()
    root.mkdir(parents=True)
    with retain_manifests(root):
        cases = capture_cases(root)
        cases['protected_person'] = decision_cases(root)
        cases['final_approval'] = body_cases(root)
        diagnostics = {name: run() for name, _, run in provider_cases(root)}
        reverted = {}
        # Select the unchanged DG-U adapter to exercise the same tests with
        # the new provider behavior reverted.
        for name, expected, run in provider_cases(root / 'reverted', update.World):
            try:
                run()
            except AssertionError as error:
                check(str(error) == expected, f'{name}: reverted check failed for another reason: {error}')
                reverted[name] = str(error)
            else:
                raise AssertionError(f'{name}: the reverted adapter passed')
    write_evidence(root / 'update.json', dict(cases=cases, provider_storage_observations=diagnostics,
                                             reverted_provider_cases=reverted))
    print(json.dumps(dict(exact_cut_and_restore=len(cases),
                          provider_storage_cases=sorted(diagnostics))))


if __name__ == '__main__':
    main()
