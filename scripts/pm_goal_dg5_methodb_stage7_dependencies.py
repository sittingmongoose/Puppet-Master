#!/usr/bin/env python3
"""Source and complete-call checks for Goal Update row dependencies."""

import argparse
import ast
from copy import deepcopy
from pathlib import Path

import pm_goal_dg5_methodb_stage7 as pilot
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables


O = pilot.updated.O
S = O.S
U = pilot.OWNERS
ST = pilot.STORAGE
FAMILY = pilot.FAMILY
REQUEST = 'dg5/dgu/sir/request/schema'
OBJECTIVE_PROOF = {
    'dg5/site/pm_goal_dg_u_owners.py:724': dict(
        kind='entailed-by-owner-request-length',
        families=['goal.updated'],
        depends_on=[REQUEST],
        sites=[(U, 88), (U, 211), (U, 212), (U, 722), (U, 723), (U, 724),
               ('Plans/goal_runtime_contracts.schema.json', 199),
               ('Plans/goal_runtime_contracts.schema.json', 201)],
        argument=(
            'SIR validates the same required objective_text string at :722 before :724. '
            'The installed definition requires maxLength=4000 and scalars returns len(text) '
            'with the same limit. The complete 4000-character call accepts and reaches :724. '
            'At 4001, the schema alone refuses with dgu/sir/request/schema/objective_text '
            'and the owner check alone refuses with dgu/sir/request/objective_too_long. '
            'Disabling both accepts, and restoring both repeats the first refusal.'),
    ),
}
PROPOSAL = 'dg5/dgu/sir/proposal/schema'
RUNTIME = 'Plans/goal_runtime_contracts.schema.json'
PROPOSAL_SCHEMA = 'Plans/goal_own_c_contracts/contracts.schema.json'


def site(line, path=U):
    return pilot.bridge.site_name(path, line)


def source(path, *lines):
    file = pilot.ROOT / path
    content = file.read_text().splitlines()
    return dict(path=path, sha256=pilot.bridge._file_sha(file),
                lines={line: content[line - 1].strip() for line in lines})


def options(fixture, label, disabled_sets):
    results = {}
    for name, disabled in disabled_sets.items():
        results[name] = pilot.call(fixture, label, sweep.Collector(judge=False), cut=disabled)
    pilot.require(len({v['input_sha256'] for v in results.values()}) == 1,
                  f'{label}: complete-call fixture changed')
    return results


def verdict(result, row=None, code=None):
    pilot.require(result['errors'] == ([row] if row else []) and result['code'] == code,
                  f'expected {(row, code)}; observed {result}')


def objective(directory):
    """The complete SIR request checks the same source string twice."""
    body = ast.parse((pilot.ROOT / U).read_text())
    scalars = next(node for node in body.body if isinstance(node, ast.FunctionDef) and node.name == 'scalars')
    limit = next(node for node in body.body if isinstance(node, ast.Assign) and
                 any(isinstance(t, ast.Name) and t.id == 'OBJECTIVE_LIMIT' for t in node.targets))
    method = next(node for node in ast.walk(body) if isinstance(node, ast.FunctionDef) and node.name == 'admit')
    statements = list(ast.walk(method))
    early = next(node for node in statements if isinstance(node, ast.Expr) and
                 ast.unparse(node) == "self.bank.validate(RUNTIME_URI + '#/$defs/GoalUpdateRequestV2', request, 'dgu/sir/request')")
    late = next(node for node in statements if isinstance(node, ast.Expr) and
                ast.unparse(node) == "require('dgu/sir/request/objective_too_long', scalars(text) <= OBJECTIVE_LIMIT)")
    pilot.require((early.lineno, late.lineno) == (722, 724) and
                  ast.unparse(scalars.body[0]) == 'return len(text)', 'objective check source changed')
    middle = next(node for node in statements if getattr(node, 'lineno', None) == 723 and
                  isinstance(node, ast.Assign))
    pilot.require(ast.unparse(middle) == "text = request['objective_text']", 'objective input changed')

    world, goal = pilot.updated._goal(directory / 'request')
    ref = O.RUNTIME_URI + '#/$defs/GoalUpdateRequestV2'
    spec = world.sir.bank.registry.resolver().lookup(ref).contents
    length = ast.literal_eval(limit.value)
    pilot.require(O.OBJECTIVE_LIMIT == length == spec['properties']['objective_text']['maxLength'] and
                  spec['properties']['objective_text']['type'] == 'string' and 'objective_text' in spec['required'],
                  'installed request no longer has the same required string limit')
    good = O.direct_request(world, goal, 'x' * length)
    bad = dict(good, objective_text=good['objective_text'] + 'x')
    raw_errors = world.sir.bank.errors(ref, bad)
    pilot.require([(tuple(e.absolute_path), e.validator) for e in raw_errors] ==
                  [(('objective_text',), 'maxLength')], 'the invalid request must have one schema error')
    owner = site(724)
    collector = sweep.Collector(judge=False)
    control = pilot.call((world, world.sir.admit, (good,), {}), 'valid objective', collector, valid=True)
    verdict(control)
    pilot.require(bool(collector.rows[owner]['controls']), 'valid request did not reach the objective check')
    trials = options((world, world.sir.admit, (bad,), {}), 'oversized objective', {
        'baseline': (), 'request_schema_disabled': (REQUEST,), 'owner_check_disabled': (owner,),
        'both_disabled': (REQUEST, owner), 'restored': (),
    })
    schema_code = 'dgu/sir/request/schema/objective_text'
    verdict(trials['baseline'], REQUEST, schema_code)
    verdict(trials['request_schema_disabled'], owner, 'dgu/sir/request/objective_too_long')
    verdict(trials['owner_check_disabled'], REQUEST, schema_code)
    verdict(trials['both_disabled'])
    verdict(trials['restored'], REQUEST, schema_code)
    return dict(row=owner, dependency=REQUEST, limit=length, control=control, trials=trials,
                source=[source(U, 88, 211, 212, 722, 723, 724), source(RUNTIME, 199, 200, 201, 202)])


def check_later(fixture, label, row, code, later, later_code):
    runs = options(fixture, label, dict(baseline=(), first_disabled=(row,), later_disabled=(later,), restored=()))
    verdict(runs['baseline'], row, code)
    verdict(runs['first_disabled'], later, later_code)
    verdict(runs['later_disabled'], row, code)
    verdict(runs['restored'], row, code)
    return runs


def reserve_cas(directory):
    world, goal = pilot.updated._goal(directory / 'reserve')
    request = O.direct_request(world, goal, 'reservation preimage')
    admission, _ = world.command.admit_and_capture(request)
    fixture = world, world.command.reserve, (admission,), {}
    control = pilot.call(fixture, 'unchanged final preimage', sweep.Collector(judge=False))
    verdict(control)

    def pause(owner_world, context):
        owner_world.lifecycle.change(goal['scope'], 'paused')

    world.inject('body.reserve', 'before_release', pause)
    row, dep = site(1188), site(1657, ST)
    result = check_later(fixture, 'changed final preimage', row, 'dgu/body/reserve/final_control_preimage',
                         dep, 'tx/cas_version')
    return dict(row=row, dependency=dep, control=control, trials=result,
                source=[source(U, 1187, 1188, 1195, 1197), source(ST, 1657, 1664, 1674)])


def scope_project(directory):
    world, goal, _, admission, _ = pilot.updated._upto(directory / 'scope', 'freeze')
    progress = pilot.updated.progress(world, goal, pilot.updated.op_of(admission))
    good = dict(progress['producer_input'])
    handle = world.storage.reserve('TEST_ONLY:stage7:scope', {'source': 'stage7'})
    control = pilot.call((world, world.storage.append, (handle, [good]), {}), 'valid project scope',
                         sweep.Collector(judge=False))
    verdict(control)
    row, dep = site(189, ST), site(473, ST)
    fixture = world, world.storage.append, (handle, [dict(good, project_id='')]), {}
    result = check_later(fixture, 'empty project scope', row, 'scope/project_id',
                         dep, 'append/event/schema/project_id')
    return dict(row=row, dependency=dep, control=control, trials=result,
                source=[source(ST, 189, 190, 473, 1455, 1486),
                        source('Plans/event_record.schema.json', 165, 177, 178, 185, 186, 187)])


def event_type(directory):
    world, event = pilot.published_event(directory / 'event-type')
    control = pilot.call((world, S.validate_event_record, (event, 'append/event'), {}), 'valid EventRecord',
                         sweep.Collector(judge=False))
    verdict(control)
    row, dep = site(470, ST), site(473, ST)
    fixture = world, S.validate_event_record, ([], 'append/event'), {}
    result = check_later(fixture, 'non-object EventRecord', row, 'append/event/type',
                         dep, 'append/event/schema/')
    return dict(row=row, dependency=dep, control=control, trials=result,
                source=[source(ST, 468, 470, 471, 472, 473), source('Plans/event_record.schema.json', 5, 6)])


def frame_shape(directory):
    world, event = pilot.published_event(directory / 'frame-shape')
    header = S.canonical(S.event_header(event))
    kwargs = dict(generation=1, prior_sequence=None, prior_control=False)

    def buffer(value):
        payload = S.canonical(value)
        prefix = S._prefix(len(header), len(payload), 0, 1, event['sequence_id'], S.crc32(header), S.crc32(payload))
        return prefix + header + payload

    control = pilot.call((world, S.decode_frame, (buffer(event), 0), kwargs), 'valid frame payload',
                         sweep.Collector(judge=False))
    verdict(control)
    row, dep = site(577, ST), site(581, ST)
    fixture = world, S.decode_frame, (buffer([]), 0), kwargs
    result = check_later(fixture, 'frame with non-object payload', row, 'Corrupt:payload_shape',
                         dep, 'Corrupt:event_record:frame/event/type')
    return dict(row=row, dependency=dep, control=control, trials=result,
                source=[source(ST, 470, 577, 579, 581, 583)])


def proposal(directory):
    """Reproduce the omitted direct proposal entry and its two owner prerequisites."""
    world, _, existing, _ = pilot.updated._proposal(directory / 'admitted')
    valid = deepcopy(existing)
    valid['command_instance_id'] += ':stage7'
    valid_fixture = world, world.sir.admit_proposal, (valid,), {}
    collector = sweep.Collector(judge=False)
    control = pilot.call(valid_fixture, 'valid proposal', collector, valid=True)
    verdict(control)
    pilot.require(collector.rows[PROPOSAL]['sites'] == {(U, 770)} and collector.rows[PROPOSAL]['controls'],
                  'valid proposal did not reach the expected schema row')
    ref = O.CONTRACTS_URI + '#/$defs/GoalUpdateProposalRequest'
    definitions = ['GoalUpdateProposalRequest', 'Target', 'Scope']
    roots = {name: world.sir.bank.registry.resolver().lookup(ref.replace('GoalUpdateProposalRequest', name)).contents
             for name in definitions}
    for name, expected in (('GoalUpdateProposalRequest', '#/$defs/Target'), ('Target', '#/$defs/Scope'),
                           ('Scope', None)):
        schema = roots[name]
        pilot.require(schema['type'] == 'object' and schema['additionalProperties'] is False and
                      set(schema['required']) == set(schema['properties']), f'unexpected {name} object domain')
        refs = [part['$ref'] for part in schema['properties'].values() if '$ref' in part]
        pilot.require(refs == ([expected] if expected else []) and
                      all(p.get('type') in ('string', 'integer') or 'const' in p or '$ref' in p
                          for p in schema['properties'].values()), f'unexpected {name} leaf domain')

    body = ast.parse((pilot.ROOT / U).read_text())
    calls = sorted(node.lineno for node in ast.walk(body) if isinstance(node, ast.Call) and
                   isinstance(node.func, ast.Name) and node.func.id == 'jcs')
    pilot.require(calls == [237, 728, 773, 878], 'simultaneous JCS call inventory changed')
    source_scope = pilot.ROOT / 'scripts/pm_goal_dg5_boundaries.py'
    entries = ast.parse(source_scope.read_text())
    siri = [node for node in ast.walk(entries) if isinstance(node, ast.Dict) for k, v in zip(node.keys, node.values)
            if isinstance(k, ast.Constant) and k.value == 'SirOwner' and isinstance(v, ast.Tuple) and
            'admit_proposal' not in ast.literal_eval(v)]
    pilot.require(len(siri) == 1, 'the collector already names the proposal entry or the entry list moved')

    changes = {}
    malformed = deepcopy(valid)
    storage_id = malformed['target']['scope']['storage_instance_id']
    malformed['target']['scope']['storage_instance_id'] = storage_id.replace('-', '')
    changes['uuid'] = (malformed, 'dgu/sir/proposal/schema/target/scope/storage_instance_id', None, None)
    with_key = deepcopy(valid)
    with_key['target']['scope'][1] = 'test'
    changes['key'] = (with_key, 'dgu/sir/proposal/schema/target/scope', site(170), 'dgu/jcs/key')
    with_bytes = deepcopy(valid)
    with_bytes['target']['objective_text'] = b'changed type'
    changes['value'] = (with_bytes, 'dgu/sir/proposal/schema/target/objective_text', site(178), 'dgu/jcs/type')
    expected_keywords = {'uuid': 'format', 'key': 'additionalProperties', 'value': 'type'}
    trials = {}
    for name, (value, error, later_row, later_code) in changes.items():
        errors = world.sir.bank.errors(ref, value)
        pilot.require(len(errors) == 1 and errors[0].validator == expected_keywords[name],
                      f'proposal {name} has a different schema error')
        fixture = world, world.sir.admit_proposal, (value,), {}
        runs = options(fixture, 'invalid proposal ' + name,
                       dict(baseline=(), proposal_schema_disabled=(PROPOSAL,), restored=()))
        verdict(runs['baseline'], PROPOSAL, error)
        verdict(runs['proposal_schema_disabled'], later_row, later_code)
        verdict(runs['restored'], PROPOSAL, error)
        trials[name] = dict(runs, validation_keyword=errors[0].validator,
                            validation_message=errors[0].message)
    return dict(row=PROPOSAL, owners=[site(170), site(178)], control=control, trials=trials,
                current_collector='Add admit_proposal to the SirOwner original entries, then capture an accepting '
                                  'original proposal and U5/N/target_uuid_malformed. Walk the full reached proposal '
                                  'definition before treating either dependent owner row as closed.',
                source=[source(U, 170, 178, 237, 722, 728, 770, 773, 877, 878),
                        source(PROPOSAL_SCHEMA, 34, 36, 45, 59, 61, 78, 84, 90, 92, 119, 120),
                        source('scripts/pm_goal_dg5_boundaries.py', 1118),
                        source('scripts/pm_goal_dg_u_oracles.py', 1265, 1272, 1273)])


CHECKS = {
    'proposal': proposal,
    'frame_shape': frame_shape,
    'event_type': event_type,
    'scope_project': scope_project,
    'reserve_cas': reserve_cas,
    'objective': objective,
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('case', choices=CHECKS)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True)
    tables.DISCOVERY = True
    result = CHECKS[args.case](args.out)
    pilot.write(args.out / 'implication.json', result)


if __name__ == '__main__':
    main()
