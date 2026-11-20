"""C12-GH1 supplement: progressed `$defs/non_empty_ref_array/type` where it is the only type.

At `approval_refs` and `block_refs` the progressed payload applies
non_empty_ref_array outside every union, so its `type: array` is the sole
owner assertion a non-array value violates there (at the task_delta arrays an
equal `ref_array` type outside the union reports instead). The main run's
keyword budget for this row was spent at the task_delta locations. Declared
targets, the complete owner payload schema boundary, TEST_ONLY.

Run: python3 scripts/pm_goal_guard_sweep.py --no-fuzz --no-keyword-witnesses
     --source pm_goal_c12_supplement --out DIR   (committed tables; no --generate)
"""
import copy

import pm_goal_guard_tables as tables
from pm_goal_history_reader_fixtures import FAMILIES, PAYLOAD_FILE, OUT_SCHEMA, ER_SCHEMA, CKPT_SCHEMA
from pm_goal_oracle_common import Gates, guard_for_location, load, materialize_cases, schema_registry, validator
import pm_goal_own_d_oracles as d

PLANS = d.PLANS


def main():
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run through pm_goal_guard_sweep.py --source pm_goal_c12_supplement')
    start = len(collector.failures)
    paths = [OUT_SCHEMA, ER_SCHEMA, CKPT_SCHEMA]
    for key in FAMILIES:
        payload = PLANS / 'event_payloads/goal_runtime' / f"{PAYLOAD_FILE.get(key, 'goal_' + key)}.schema.json"
        if payload.exists():
            paths.append(payload)
    registry = schema_registry(paths)
    document = load(PLANS / 'event_payloads/goal_runtime/goal_progressed.schema.json')
    pv = validator(document, registry)
    fixture = load(PLANS / 'goal_progressed_history_contract_fixtures.json')
    base = next(c['input'] for c in materialize_cases(fixture['protocol_cases']) if c['valid'])
    lawful = copy.deepcopy(base['answer']['original_event']['payload'])
    lawful['approval_refs'] = ['approval:c12-original']
    lawful['block_refs'] = ['block:c12-original']
    def check(value):
        gate = Gates()
        gate.schema(pv, value, 'progressed/payload')
        return gate.errors
    collector.invoke('gh1-supplement/progressed/payload/control', check, lawful, True, family='goal.progressed')
    target = guard_for_location(document['$id'] + '/$defs/non_empty_ref_array/type')
    for member in ('approval_refs', 'block_refs'):
        for label, value in (('null', None), ('string', 'c12'), ('object', {}), ('integer', 7)):
            changed = copy.deepcopy(lawful)
            changed[member] = value
            collector.invoke(f'gh1-supplement/progressed/payload/{member}/type/{label}', check, changed, False,
                             target=target, family='goal.progressed', generated=True)
    return int(len(collector.failures) > start)
