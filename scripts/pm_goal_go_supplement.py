"""C12-GO declared supplement for run.started (lane 18; GH1's supplement pattern, same code and tables).

The final GO run left three run.started rows without a run.started-family witness that the restore_point.deleted
family has. This source rebuilds the same complete-call worlds without the witness search
(pm_goal_go_deleted, pm_goal_go_run_started with PNC019_GO_NO_SEARCH=1) and adds, each target declared
before its call:

* `actual generation dataset`: frozen bank case 235 (`remove` of the current generation's index dataset),
  applied to run.started-world inputs of the same adoption_v4_check function (the dataset name is the
  run.started world's own current one);
* `registered external schema ID`: frozen bank case 244 (`simple` edit of payload_schema_ref.schema_id),
  applied to run.started-world inputs of dependency_runtime.pinned_payload_validator;
* `actual complete generic source event/index membership restore_created`: adoption bank case 13 refuses
  first at that row and, with it cut, at further rows that read the same edited copy; it is declared as the
  duplicate set the joint cuts reach (the judge then requires the joint cut to accept and each site to
  refuse alone).
Run: pm_goal_go_sweep.py --source pm_goal_go_supplement --out SUP (prove mode, committed tables).
"""
import copy
import os
from pathlib import Path

import pm_goal_guard_tables as tables
import pm_goal_oracle_common as c

ROOT = Path(__file__).resolve().parents[1]
FAMILY = 'run.started'
PREFIX = 'restore_point.deleted/original/'
GO_EVIDENCE = {}


def main():
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run through pm_goal_go_sweep.py')
    start = len(collector.failures)
    os.environ['PNC019_GO_NO_SEARCH'] = '1'
    import pm_goal_deleted_external_oracles as frozen
    import pm_goal_go_deleted as deleted
    import pm_goal_go_run_started as run_started
    import pm_goal_go_search as search
    code = deleted.main()
    dep = frozen.FIXTURE_CONTEXT[0]
    captured, active = [], [False]
    validator = dep.G['payload_validator']
    inner = (validator.__kwdefaults__ or {}).get('_' + '_fn', validator)

    def capture(*args, **kwargs):
        result = validator(*args, **kwargs)
        if active[0] and len(captured) < 8:
            captured.append(dict(args=copy.deepcopy(list(args)), kwargs=copy.deepcopy(kwargs)))
        return result
    dep.G['payload_validator'] = capture
    active[0] = True
    try:
        code |= run_started.main()
    finally:
        active[0] = False
        dep.G['payload_validator'] = validator
    collector.family_scope = FAMILY
    counts = dict(dataset=0, schema_id=0, membership=0)
    try:
        # 1. bank case 235 on run.started-world inputs of the same function (adoption_v4_check.py:21).
        bank = c.load(ROOT / 'tests/fixtures/pnc019_goal_frozen_helper_witnesses.json')['cases']
        seeds = run_started.SEEDS.get('adoption', ([], []))[0] + run_started.SEEDS.get('dependency', ([], []))[0]
        for fn, base, label in seeds:
            code_obj = fn.__code__
            if not (code_obj.co_filename.endswith('adoption_v4_check.py') and code_obj.co_firstlineno == bank[235]['seed']['function_line']):
                continue
            value = copy.deepcopy(base)
            v = value['args'][0]
            if not isinstance(v, dict) or 'checkpoint' not in v or 'datasets' not in v:
                continue
            checkpoint = v['checkpoint']
            current = checkpoint.get('generations', {}).get(checkpoint.get('current_generation_id'), {})
            name = current.get('index_dataset_name')
            if name not in v['datasets']:
                continue
            del v['datasets'][name]  # bank case 235: operation `remove` at the current generation's dataset
            collector.invoke(f'run.started/supplement/bank-235/{label}', search.evaluator(fn, frozen), value, False,
                             target=bank[235]['expected_refusal'], family=FAMILY, generated=True)
            counts['dataset'] += 1
        # 2. bank case 244 on run.started-world inputs of pinned_payload_validator.
        for number, base in enumerate(captured):
            from pm_goal_deleted_case_ops import Editor
            ref = base['args'][0].get('payload_schema_ref') if isinstance(base['args'][0], dict) else None
            if not isinstance(ref, dict) or 'schema_id' not in ref:
                continue
            version = bank[244].get('hash_recipe_version', 1)
            value = Editor(base, frozen.helper_hash_functions(version), version=version).edit(tuple(bank[244]['path']), bank[244]['operation'])
            collector.invoke(f'run.started/supplement/bank-244/{number}', search.evaluator(inner, frozen), value, False,
                             target=bank[244]['expected_refusal'], family=FAMILY, generated=True)
            counts['schema_id'] += 1
        # 3. adoption bank case 13 declared as the duplicate set its joint cuts reach.
        adoption_bank = c.load(ROOT / 'tests/fixtures/pnc019_goal_adoption_helper_witnesses.json')['cases']
        case = adoption_bank[13]
        row = case['expected_refusal']
        for fn, base, label in run_started.SEEDS.get('adoption', ([], []))[0]:
            if fn.__code__.co_firstlineno != case['seed']['function_line']:
                continue
            from pm_goal_deleted_case_ops import Editor
            version = case.get('hash_recipe_version', 2)
            try:
                value = Editor(base, frozen.helper_hash_functions(version), version=version).edit(tuple(case['path']), case['operation'])
            except Exception:
                continue
            evaluate = search.evaluator(fn, frozen)
            chain = {row}
            for _ in range(12):
                joint = collector._replay(evaluate, value, chain)
                if joint == [] or not isinstance(joint, list):
                    break
                chain |= set(joint)
            collector.invoke(f'run.started/supplement/adoption-13/{label}', evaluate, value, False,
                             target=tuple(sorted(chain)), family=FAMILY, generated=True)
            collector.ledger[-1]['declared_rule'] = 'go_duplicate_chain'
            counts['membership'] += 1
            break
        # Narrow single-copy edits of the restore_created index/event copies on the whole adoption positives:
        # the membership row compares both with the generic source's frame and index row.
        import pm_goal_run_adoption_oracles as adoption
        ns = adoption.ADOPTION_CONTEXT[0]
        packet = c.load(ROOT / 'Plans/event_index_consumer_adoption_fixtures.json')
        from pm_goal_deleted_case_ops import Editor
        validate = ns['validate']
        evaluate = search.evaluator(validate, frozen)
        for label in sorted(packet['positive']):
            base = dict(args=[packet['positive'][label]], kwargs={})
            created = base['args'][0].get('restore_created') if isinstance(base['args'][0], dict) else None
            if not isinstance(created, dict):
                continue
            editor = Editor(base, frozen.helper_hash_functions(5), version=5)
            for copy_name in ('index', 'event'):
                for field, original in sorted((created.get(copy_name) or {}).items()):
                    if isinstance(original, (dict, list)):
                        continue
                    try:
                        value = editor.edit(('args', 0, 'restore_created', copy_name, field), 'simple')
                    except Exception:
                        continue
                    collector.invoke(f'run.started/supplement/membership/{label}/{copy_name}/{field}', evaluate, value, False,
                                     target=row, family=FAMILY, generated=True)
                    counts['membership'] += 1
            break
    finally:
        collector.family_scope = None
    GO_EVIDENCE.update(counts=counts, captured_payload_validator_calls=len(captured))
    return int(bool(code) or len(collector.failures) > start)
