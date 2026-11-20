"""Check interacting writer rules in the original Goal argument validators."""
import argparse
import ast
import gzip
import json
from collections import Counter
from pathlib import Path
import time

import pm_goal_dg5_methodb_w2 as worker

WRITERS = '#/$defs/WriterDomain/properties/writers'
REGISTRATION = '#/$defs/WriterRegistration'
WRITER_PATH = ('writer_domain', 'record', 'writers')
SOURCE = 'Plans/goal_execution_binding_custody.schema.json'
ENTRY_COUNT = 7


def checked_writer_schema(bank):
    path = worker.ROOT / SOURCE
    schema = json.loads(path.read_bytes())
    uri = schema['$id']
    source_hash = worker.sha(path)
    worker.require(bank.resource_origins[uri][0] == source_hash, 'the installed writer schema source changed')
    writers = schema['$defs']['WriterDomain']['properties']['writers']
    registration = schema['$defs']['WriterRegistration']
    operations = registration['properties']['operation']['enum']
    constraints = writers['allOf']
    worker.require(len(set(operations)) == len(operations) == len(constraints) == ENTRY_COUNT and
                   writers['type'] == 'array' and registration['type'] == 'object' and
                   writers['minItems'] == writers['maxItems'] == ENTRY_COUNT and
                   writers['items'] == {'$ref': REGISTRATION} and 'operation' in registration['required'] and
                   all(isinstance(operation, str) for operation in operations),
                   'the operation and entry-count premises changed')
    selected = []
    for entry in constraints:
        operation = entry['contains']['properties']['operation']['const']
        worker.require(entry == {'contains': {'properties': {'operation': {'const': operation}}},
                                 'minContains': 1, 'maxContains': 1},
                       'the required operation-count premise changed')
        selected.append(operation)
    worker.require(set(selected) == set(operations) and len(selected) == len(set(selected)),
                   'the allowed operations no longer match the separate required counts')
    return uri, source_hash, operations


def verify_one(plain, validator, nodes, control, rule, uri, previous, omit_disable):
    started = time.monotonic()
    number = ENTRY_COUNT
    location, keyword = rule.rsplit('/', 1)
    info = nodes[location]
    node = info['node']
    _, guard = worker.closure._clause_identity(node, keyword)
    writer_id = uri + WRITERS
    registration = uri + REGISTRATION
    cuts = set() if omit_disable else {guard}
    if keyword == 'const':
        worker.require(location.startswith(writer_id + '/allOf/') and
                       all(reach['ipath'] == (*WRITER_PATH, '#', 'operation') for reach in info['reach']),
                       'the contains selector occurs outside the checked writer array')
        original = worker.error_records(plain.iter_errors(control))
        before = worker.error_records(worker.rules.errors_of(validator, control))
        disabled = worker.error_records(worker.rules.errors_of(validator, control, cuts))
        restored = worker.error_records(worker.rules.errors_of(validator, control))
        worker.require(original == before == restored == [] and len(disabled) == 1 and
                       disabled[0]['keyword'] == 'maxContains' and disabled[0]['path'] == list(WRITER_PATH) and
                       disabled[0]['message'] == 'Too many items match the given schema (expected at most 1)',
                       'the single selector disable did not produce the exact count refusal')
        return dict(example='accepted writer list', before=before, disabled=disabled, restored=restored,
                    input_sha256=worker.stage.sweep.digest(control), seconds=round(time.monotonic()-started, 6),
                    explanation='Turning off this operation selector makes every entry count toward its one-entry limit.')

    path = previous['path']
    edit = ast.literal_eval(previous['edit'])
    reach_path = WRITER_PATH
    if location == registration:
        reach_path = (*reach_path, '#')
    elif location == registration + '/properties/operation':
        reach_path = (*reach_path, '#', 'operation')
    worker.require(all(reach['ipath'] == reach_path for reach in info['reach']),
                   'the disabled rule occurs outside the checked writer array')
    changed = worker.rules.apply(control, path, edit)
    actual = worker.error_records(plain.iter_errors(changed))
    before_errors = worker.rules.errors_of(validator, changed)
    before = worker.error_records(before_errors)
    cut_errors = worker.rules.errors_of(validator, changed, cuts)
    disabled = worker.comparison_messages(worker.error_records(cut_errors))
    restored = worker.error_records(worker.rules.errors_of(validator, changed))
    worker.require((rule, tuple(path)) in worker.pilot.located_errors(before_errors) and
                   (before == actual or worker.comparison_messages(before) == actual) and
                   actual == previous['before'] and
                   bool(disabled) and rule not in worker.rules.locations(cut_errors) and restored == before,
                   'the single writer rule did not disappear or restore exactly')
    if keyword in ('minItems', 'maxItems'):
        reason = f'The {number} allowed operations must each occur exactly once, so the list has {number} entries.'
    elif keyword == 'contains':
        reason = f'The other {number - 1} operations each occupy exactly one entry. The list still has {number} entries drawn from the allowed operations, forcing the remaining one.'
    elif keyword == 'enum':
        reason = f'All {number} distinct operations must each occupy an entry, and the list contains exactly {number} entries. There is no entry for a different operation.'
    else:
        worker.require(keyword == 'type', 'unexpected writer rule')
        reason = f'A non-object matches every property-only operation test. With {number} entries, any other entry would match an operation already occupied and exceed the one-entry limit.'
    return dict(path=path, edit=previous['edit'], before=actual, disabled=disabled, restored=actual,
                other_rules=sorted(worker.rules.locations(cut_errors)), explanation=reason,
                input_sha256=worker.stage.sweep.digest(changed), seconds=round(time.monotonic()-started, 6))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('reference', 'input', 'out'):
        parser.add_argument('--' + name, type=Path, required=True)
    parser.add_argument('--input-sha256', required=True)
    parser.add_argument('--omit-disable', action='store_true')
    args = parser.parse_args()
    started = time.monotonic()
    worker.require(worker.sha(args.input) == args.input_sha256, 'the archived examples changed')
    with gzip.open(args.input, 'rt') as stream:
        prior = json.load(stream)
    row = prior['row']
    worker.require(row in ('dg5/issue/CurrentGoalArgument/schema', 'dg5/issue/OriginalGoalArgument/schema'),
                   'the input must be an original or current Goal argument test')
    root, = prior['roots']
    example = prior['roots'][root]
    ref = worker.load_reference(args.reference, [dict(row=row)])['roots'][root]
    bank = worker.world.v3_edition().goal_bank.original
    plain = bank.validator(json.loads(ref['schema'])['$ref'])
    worker.require(worker.closure._registry_digest(plain) == ref['registry_sha256'], 'the argument registry changed')
    validator = worker.closure.closure_validator(plain, root, bank)
    nodes, ids = worker.closure._clause_inventory(validator)
    worker.require(ids == ref['clause_ids'] == example['clause_ids'] and
                   worker.closure._clause_inventory_pin(ids) == ref['clause_inventory'],
                   'the exact argument rule inventory changed')
    uri, source_hash, operations = checked_writer_schema(bank)
    selected = {key: value for key, value in example['gaps'].items()
                if key.startswith(uri + WRITERS + '/') or
                key in (uri + REGISTRATION + '/type', uri + REGISTRATION + '/properties/operation/enum')}
    worker.require(len(selected) == 18, 'the pending writer-rule set changed')
    results = {}
    for key, value in selected.items():
        control = example['controls'][value.get('control', 0)]
        writers = worker.rules.get(control, WRITER_PATH)
        worker.require(Counter(entry['operation'] for entry in writers) == Counter(operations) and
                       not list(plain.iter_errors(control)), 'the original complete writer list is invalid')
        results[key] = verify_one(plain, validator, nodes, control, key, uri, value, args.omit_disable)
    worker.write(args.out, dict(row=row, root=root, source=SOURCE, source_sha256=source_hash,
                                input_sha256=args.input_sha256, results=results,
                                seconds=round(time.monotonic()-started, 3)))
    print(row, len(results), 'checked writer rules', flush=True)


if __name__ == '__main__':
    main()
