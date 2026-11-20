#!/usr/bin/env python3
"""Check the exact original Goal Update proposal schema and its caller."""

import argparse
from collections import Counter
from copy import deepcopy
import gzip
import hashlib
import json
from pathlib import Path

import pm_goal_dg5_closure as closure
import pm_goal_dg5_methodb_stage7 as pilot
from pm_goal_dg5_methodb_stage3 import errors_list
from pm_goal_dg5_methodb_stage7_dependencies import source, verdict
import pm_goal_go_schema_closure as rules
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables
from pm_goal_oracle_common import schema_guard

ROW = 'dg5/dgu/sir/proposal/schema'
ROOT_ID = 'dg5:bd0c8992a09d64a6'
LOCATION = (pilot.OWNERS, 770)
SCHEMA = 'Plans/goal_own_c_contracts/contracts.schema.json'
PATHS = {'GoalUpdateProposalRequest': (), 'Target': ('target',), 'Scope': ('target', 'scope')}


def invalid_example(control, name, node, keyword):
    parts = name.split('#/$defs/', 1)[1].split('/')
    path = PATHS[parts[0]]
    if len(parts) == 4 and parts[1] == 'properties':
        path += (parts[2],)
    else:
        pilot.require(len(parts) == 2, f'unexpected proposal schema path {name}')

    if keyword == 'required':
        replacement = ('remove', node['required'][0])
    elif keyword == 'additionalProperties':
        replacement = ('add', 'stage7_unlisted_member')
    elif keyword == 'type':
        replacement = {'object': [], 'string': 19, 'integer': True}[node['type']]
    elif keyword == 'const':
        replacement = 'stage7-other-constant'
    elif keyword == 'format':
        pilot.require(node['format'] == 'uuid', name)
        replacement = rules.get(control, path).replace('-', '')
    elif keyword == 'pattern':
        replacement = 'X' + 'a' * 63 if path[-1] == 'expected_currentness_hash' else chr(0xd800)
    elif keyword == 'maxLength':
        replacement = 'a' * (node[keyword] + 1)
    elif keyword == 'minLength':
        replacement = 'a' * (node[keyword] - 1)
    elif keyword == 'minimum':
        replacement = node[keyword] - 1
    else:
        raise ValueError(f'unknown proposal rule {name}')
    return path, rules.apply(control, tuple(path), replacement)


def check_assertions(bank, ref, reference, disabled):
    plain = bank.validator(ref)
    registry = closure._registry_digest(plain)
    schema = json.dumps(plain.schema, sort_keys=True)
    validator_class = type(plain).__module__ + '.' + type(plain).__qualname__
    key = (validator_class, schema, registry, type(bank).__qualname__)
    pilot.require(closure.root_id(key) == ROOT_ID and registry == reference['registry_sha256'] and
                  schema == reference['schema'] and validator_class == reference['validator_class'] and
                  type(bank).__module__ + '.' + type(bank).__qualname__ == reference['bank'],
                  'the original proposal root or installed registry changed')
    validator = closure.closure_validator(plain, ROOT_ID, bank)
    rules.UNRESOLVED.clear()
    rules.RESOLVERS.clear()
    nodes = rules.walk(validator)
    literal = [(location + '/' + rules.name_of(keyword), info['node'], keyword)
               for location, info in nodes.items() for keyword in rules.clauses_of(info['node'])]
    declared = {name: (node, keyword) for name, node, keyword in literal}
    inventory = sorted(declared)
    pilot.require(len(declared) == len(literal) and not rules.UNRESOLVED,
                  'proposal rule IDs collide or a reference failed to resolve')
    fingerprint = dict(identity='dg5-distinct-keywords-v1', count=len(inventory),
                       sha256=hashlib.sha256('\n'.join(inventory).encode()).hexdigest())
    wanted = reference['clause_ids']
    if disabled == 'inventory':
        wanted = wanted[:-1]
    pilot.require(inventory == wanted and fingerprint == reference['clause_inventory'],
                  'proposal schema rule inventory differs')
    controls = reference['accepted']
    pilot.require(len(controls) == 2 and controls[0] != controls[1] and
                  all(not list(plain.iter_errors(c)) and not rules.errors_of(validator, c) for c in controls),
                  'both original examples must still validate')

    control = min(controls, key=lambda c: len(c['target']['objective_text']))
    result = {}
    for name in inventory:
        location = name.rsplit('/', 1)[0]
        node, keyword = declared[name]
        path, invalid = invalid_example(control, name, node, keyword)
        before = rules.errors_of(validator, invalid)
        original = list(plain.iter_errors(invalid))
        restored = rules.errors_of(validator, invalid)
        pilot.require(errors_list(original) == errors_list(before) == errors_list(restored) and
                      any(error.validator == keyword and tuple(error.absolute_path) == path for error in original),
                      f'{name}: the original or restored message differs')
        cut = frozenset() if disabled == 'rule' else {schema_guard(node, keyword)}
        after = rules.errors_of(validator, invalid, cut)
        entry = dict(cls='KILLED', keyword=keyword, path=path, invalid=invalid,
                     before=errors_list(original), cut=errors_list(after), restored=errors_list(restored))
        if path == ('target', 'objective_text') and keyword == 'pattern':
            # Preserve the intentionally invalid code unit as escaped JSON
            # inside the evidence so ordinary JSON readers can load the report.
            entry['invalid_document_json'] = json.dumps(entry.pop('invalid'), ensure_ascii=True)
        if path == ('target', 'expected_currentness_hash') and keyword in ('minLength', 'maxLength'):
            pattern = location + '/pattern'
            pattern_guard = schema_guard(node, 'pattern')
            pattern_cut = rules.errors_of(validator, invalid, {pattern_guard})
            both = rules.errors_of(validator, invalid, cut | {pattern_guard})
            pilot.require(node['pattern'] == '^[0-9a-f]{64}$' and node[keyword] == 64 and
                          rules.locations(before) == {name, pattern} and rules.locations(after) == {pattern} and
                          rules.locations(pattern_cut) == {name} and not both,
                          f'{name}: the fixed-width pattern implication changed')
            entry.update(cls='COVERED_LATER', implication=dict(
                source=source(SCHEMA, 77, 78, 79), pattern=pattern, pattern_disabled=errors_list(pattern_cut),
                both_disabled=errors_list(both)))
        else:
            pilot.require(rules.locations(before) == {name} and not after,
                          f'{name}: disabling only the proposal rule did not accept the example')
        result[name] = entry
    return result, inventory


def check_caller(world, value, output, disabled):
    tables.DISCOVERY = True
    label = pilot.FAMILY + '/stage7/proposal'
    collector = sweep.Collector()
    control = world, world.sir.admit_proposal, (value,), {}
    accepted = pilot.call(control, label + '/valid', collector, valid=True)
    verdict(accepted)
    pilot.require(collector.rows[ROW]['sites'] == {LOCATION} and collector.rows[ROW]['controls'],
                  'the valid proposal missed the original schema checker')
    bad = deepcopy(value)
    scope = bad['target']['scope']
    scope['storage_instance_id'] = scope['storage_instance_id'].replace('-', '')
    invalid = world, world.sir.admit_proposal, (bad,), {}
    expected = 'dgu/sir/proposal/schema/target/scope/storage_instance_id'
    rejected = pilot.call(invalid, label + '/invalid', collector, valid=False, target=ROW)
    reduced = pilot.call(invalid, label + '/invalid', sweep.Collector(judge=False),
                         cut=() if disabled == 'checker' else (ROW,))
    restored = pilot.call(invalid, label + '/invalid', sweep.Collector(judge=False))
    verdict(rejected, ROW, expected)
    verdict(restored, ROW, expected)
    verdict(reduced)
    pilot.require(rejected['input_sha256'] == reduced['input_sha256'] == restored['input_sha256'] and
                  collector.ledger[-1]['kill'] == 'KILLED', 'proposal replay lost its original input')
    pilot.write(output / 'calls.json', dict(row=ROW, control=accepted, input=value, invalid_input=bad,
                                          refused=rejected, disabled=reduced, restored=restored))

    ident = sweep.table_id([ROW])
    table = pilot.ROOT / 'scripts' / (pilot.PHASE + ident + '.py')
    proof_tables = output / 'proof/tables'
    proof_tables.mkdir(parents=True)
    checked = sweep.prove_table(collector, ident, [ROW], sweep.table_records(collector),
                                proof_tables, module_name=table.stem)
    pilot.require(checked['status'] == 'PASS' and checked['proved'] == [ROW], checked)
    pilot.save_proof(output, collector, ROW, LOCATION, checked, table, pilot.FAMILY)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--reference', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--leave-enabled', choices=('checker', 'rule', 'inventory'))
    args = parser.parse_args()
    out = args.out.resolve()
    out.mkdir(parents=True)
    reference = json.loads(gzip.decompress(args.reference.read_bytes()))
    pilot.require(reference['row'] == ROW and reference['current_sites'] == [list(LOCATION)] and
                  reference['owner_file_sha256'] == pilot.bridge._file_sha(pilot.ROOT / LOCATION[0]),
                  'proposal caller source differs from DG5')
    root = reference['roots'][ROOT_ID]
    world, _, previous, _ = pilot.updated._proposal(out / 'original')
    value = dict(deepcopy(previous), command_instance_id=previous['command_instance_id'] + ':stage7')
    bank = world.sir.bank
    ref = pilot.updated.O.CONTRACTS_URI + '#/$defs/GoalUpdateProposalRequest'
    entries, inventory = check_assertions(bank, ref, root, args.leave_enabled)
    check_caller(world, value, out, args.leave_enabled)
    binding = {key: root[key] for key in ('bank', 'validator_class', 'registry_sha256', 'schema', 'clause_inventory')}
    binding.update(rows=[ROW], families=[pilot.FAMILY])
    pilot.write(out / 'inventory.json', dict(mode='assertion-inventory', family=pilot.FAMILY,
                collection_failures=[], roots={ROOT_ID: dict(binding, clause_ids=inventory)}))
    pilot.write(out / 'closure.json', dict(roots={ROOT_ID: dict(
        binding, clauses=entries, counts=dict(Counter(e['cls'] for e in entries.values())),
        verify=dict(passed=len(entries), failed=0, unverifiable=0))}))
    pilot.write(out / 'source.json', dict(root=ROOT_ID, reference=str(args.reference),
        reference_sha256=pilot.bridge._file_sha(args.reference), location=source(*LOCATION)))


if __name__ == '__main__':
    main()
