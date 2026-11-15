"""C12-GO restore_point.deleted complete boundary (lane 18).

Runs the s3ao restore_point.deleted adapters unchanged (frozen joined suite,
retained read model with complete store snapshots, retained-phase witnesses)
with every authored negative's target declared before it runs
(pm_goal_go_declare), adds the owner value-shape cases as whole-definition rows
(pm_goal_go_schema), and then the GO witness search (pm_goal_go_search) for
rows that have no single-row kill yet. Frozen bytes stay unchanged and pinned.
"""
import copy
import os
from pathlib import Path

import pm_goal_guard_tables as tables
import pm_goal_oracle_common as c
import pm_goal_go_declare as declare
import pm_goal_go_schema as schemas

ROOT = Path(__file__).resolve().parents[1]
FAMILY = 'restore_point.deleted'
RET = 'restore_point.deleted/retained/'
SEEDS = {}          # seed set name -> (seeds, files)
GO_EVIDENCE = {}

# Declared SP-1101 dispatcher refusal of the shared receipt reader (as GH1's READ_TARGETS).
READ = dict(missing='original_receipt_missing', ambiguous='original_receipt_ambiguous',
            another_original='original_receipt_missing', bad_seal='original_receipt_seal',
            unknown_recipe='recipe_unknown', foreign_store='original_binding',
            override='caller_recipe_override', access='current_disclosure')


def retained_label(text):
    hit = declare.resolve_rejection(text, prefix=RET)
    if hit is None:
        raise ValueError('declared retained label not in the frozen sources: ' + text)
    return hit


def retained_rule():
    """Declared refusal of each authored retained-model negative.

    Read from the frozen retained model (fixture_store.py / retained_read.py of the
    pinned paired-phases subject) and the evaluator in pm_goal_deleted_retained_oracles:
    the first owner check, in the model's own order, that reads the changed fact.
    """
    origin = retained_label('native boundary must verify actual registered/coherent admitted store origin')
    unchanged = retained_label('all actual admission/registration/installation/origin facts unchanged before disclosure')
    table = {
        'restore_point.deleted/retained/native-recipe/missing': retained_label('exact receipt-selected native component recipe'),
        'restore_point.deleted/retained/native-recipe/ambiguous': retained_label('exact receipt-selected native component recipe'),
        'restore_point.deleted/retained/late/point_hold': retained_label('exact authenticated canonical rows/source/origin unchanged before disclosure'),
        'restore_point.deleted/retained/late/receipt_missing': 'retained/original_receipt_missing',
        'restore_point.deleted/retained/late/receipt_ambiguous': 'retained/original_receipt_ambiguous',
        'restore_point.deleted/retained-native/snapshot/foreign-lease': retained_label('actual issued current read lease'),
        'restore_point.deleted/retained-native/source/foreign-lease': retained_label('actual current source snapshot'),
        'restore_point.deleted/retained-native/authenticate/changed-row-bytes': retained_label('actual registered canonical'),
        'restore_point.deleted/retained-native/disclose/owner-revision': retained_label('owner snapshot changed before disclosure'),
        'restore_point.deleted/retained-original/late-immutable-point': RET + 'full original immutable point value',
        'restore_point.deleted/retained-native/late-permission-before-outer-release': unchanged,
        'restore_point.deleted/retained-phase/missing-creation_result': retained_label('deleted path retains existing SP274 requirement'),
        'restore_point.deleted/retained-phase/missing-terminal_result': retained_label('actual retained original delete result'),
        'restore_point.deleted/retained-phase/other-terminal-family': retained_label('terminal event family/scope'),
    }
    for kind, code in READ.items():
        table['restore_point.deleted/retained/receipt/' + kind] = 'retained/' + code
    for field in ('registration_current', 'source_origin_admitted', 'backup_coherent', 'migration_supported', 'quarantined'):
        table['restore_point.deleted/retained/entry/' + field] = origin
    table['restore_point.deleted/retained/entry/permissions_allowed'] = retained_label('current actual disclosure permissions')
    table['restore_point.deleted/retained/entry/installed_bindings'] = retained_label('new reader explicitly installed; no old binding widening')
    for field in ('registration_current', 'source_origin_admitted', 'backup_coherent', 'migration_supported',
                  'permissions_allowed', 'quarantined', 'installed_bindings'):
        table['restore_point.deleted/retained/late/' + field] = unchanged
    for field in ('project_id', 'storage_instance_id', 'restore_point_id', 'reader_binding'):
        table['restore_point.deleted/retained/request/' + field] = retained_label('exact caller selected store/project/point/binding')
    for label in ('caller_boolean', 'foreign_lease', 'foreign_origin', 'changed_point'):
        table['restore_point.deleted/retained/snapshot/' + label] = retained_label('actual native owner read differs from caller snapshot')
    for name in ('creation_companion', 'terminal_companion', 'creation_result', 'terminal_result'):
        table['restore_point.deleted/retained-original/different-' + name] = RET + 'full original canonical companion/result ' + name
    return table


def build_rule():
    examples = Path(c.load(ROOT / 'Plans/restore_point_deleted_contract_fixtures.json')['frozen_joined_subject']['path']).parent
    joined = {case['id']: case for case in c.load(examples / 'joined-v3-examples.json')['negative']}
    table = retained_rule()
    shapes = {case['id']: case for case in c.load(ROOT / 'Plans/restore_point_deleted_contract_fixtures.json')['value_shape_cases']}

    def rule(label, value):
        hit = declare.bank_rule(label)
        if hit is not None:
            return hit
        if label in table:
            return table[label], 'retained_model_static'
        if label.startswith('restore_point.deleted/frozen/'):
            case = joined.get(label.split('/', 2)[2])
            target = declare.resolve_rejection(case.get('rejection')) if case else None
            return (target, 'joined_rejection') if target else None
        for prefix in ('frozen-schema/root-type/', 'retained/schema/root-type/'):
            if label.startswith(prefix):
                return label[len(prefix):], 'root_type_of_whole_definition'
        if label.startswith('restore_point.deleted/retained-phase/targeted/'):
            return RET + label.rsplit('/targeted/', 1)[1], 'source_literal'
        if label.startswith('restore_point.deleted/retained/shared-uint64/'):
            return retained_label('receipt-selected original uint64 physical profile'), 'shared_uint64_profile'
        if label.startswith('restore_point.deleted/value-shape/'):
            case = shapes[label.rsplit('/', 1)[1]]
            return schemas.row_name(ROOT / 'Plans/restore_point_deleted_contracts.schema.json', '#/$defs/' + case['definition']), 'value_shape_definition'
        return None
    return rule


def main():
    import pm_goal_deleted_external_oracles as frozen
    import pm_goal_deleted_retained_oracles as reads
    import pm_goal_deleted_retained_witnesses as phases
    from pm_goal_complete_oracles import resources
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run through pm_goal_go_sweep.py')
    start = len(collector.failures)
    schemas.install_frozen_hooks(frozen)
    original_replay = frozen.replay_witnesses
    banks = {'frozen': ROOT / 'tests/fixtures/pnc019_goal_frozen_helper_witnesses.json',
             'retained': ROOT / 'tests/fixtures/pnc019_goal_retained_helper_witnesses.json'}

    def replay(collector_, seeds, files, bank_path=None):
        path = Path(bank_path or banks['frozen'])
        name = next(key for key, value in banks.items() if value == path)
        token = declare.BANK.set(declare.load_bank(path, name))
        try:
            return original_replay(collector_, seeds, files, bank_path)
        finally:
            declare.BANK.reset(token)

    def capture(name):
        def keep(collector_, seeds, files):
            SEEDS[name] = (list(seeds), list(files))
        return keep

    frozen.replay_witnesses = replay
    saved_search = frozen.helper_witnesses
    env = {key: os.environ.get(key) for key in ('PNC019_FROZEN_EXPLORE', 'PNC019_RETAINED_EXPLORE')}
    rule = build_rule()
    code = 0
    try:
        with declare.Intercept(collector, rule):
            # The s3ao exploration hook is replaced by a seed capture: the GO
            # search below declares every attempt's target before it runs.
            os.environ['PNC019_FROZEN_EXPLORE'] = '1'
            frozen.helper_witnesses = capture('frozen')
            code |= frozen.main()
            collector.family_scope = FAMILY
            registry = resources({ROOT / 'Plans/restore_point_deleted_contracts.schema.json'})
            checks = {}
            for case in c.load(ROOT / 'Plans/restore_point_deleted_contract_fixtures.json')['value_shape_cases']:
                if case['definition'] not in checks:
                    checks[case['definition']] = schemas.checker(ROOT / 'Plans/restore_point_deleted_contracts.schema.json',
                                                                  '#/$defs/' + case['definition'], registry)
                collector.invoke('restore_point.deleted/value-shape/' + case['id'], checks[case['definition']],
                                 case['value'], case['valid'], family=FAMILY)
            collector.family_scope = None
            code |= reads.main()
            # The two SP-1101 receipt defects the s3ao retained model does not author.
            collector.family_scope = FAMILY
            _, _, check, base = reads.RETAINED_CONTEXT
            for kind, target in (('bad_shape', 'retained/original_receipt_shape'),
                                 ('wrong_original_bytes', 'retained/original_verification')):
                value = copy.deepcopy(base)
                recipes = value['store']['recipes']
                if kind == 'bad_shape':
                    recipes['sealed_receipts'][0]['original'] = {'binding': {'event_id': value['original']['event_id']}}
                else:
                    recipes['original_value']['actor_ref'] += ':foreign'
                collector.invoke('restore_point.deleted/retained/receipt/' + kind, check, value, False, target=target, family=FAMILY)
            collector.family_scope = None
            os.environ['PNC019_RETAINED_EXPLORE'] = '1'
            frozen.helper_witnesses = capture('retained')
            code |= phases.main()
    finally:
        frozen.replay_witnesses = original_replay
        frozen.helper_witnesses = saved_search
        for key, value in env.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
    import pm_goal_go_search as search
    collector.family_scope = FAMILY
    _, subject, _ = frozen.FIXTURE_CONTEXT
    examples = Path(c.load(ROOT / 'Plans/restore_point_deleted_contract_fixtures.json')['frozen_joined_subject']['path']).parent
    positives = c.load(examples / 'joined-v3-examples.json')['positive']
    complete = [(subject.validate, dict(args=[positives[label]], kwargs={}), 'joined-validate/' + label) for label in sorted(positives)]
    try:
        # PNC019_GO_NO_SEARCH=1 only for the schema-closure root collection (pm_goal_go_schema_closure.py).
        if os.environ.get('PNC019_GO_NO_SEARCH') != '1':
            GO_EVIDENCE['search'] = search.run(collector, FAMILY, [SEEDS[name] for name in ('frozen', 'retained') if name in SEEDS],
                                               frozen, complete=complete)
    finally:
        collector.family_scope = None
    GO_EVIDENCE['declared'] = declare.evidence()
    return int(bool(code) or len(collector.failures) > start)


def earlier_clause_proof(name, reports):
    """s3ao's source-bound frozen-checker implications (pm_goal_deleted_external_oracles /
    pm_goal_deleted_implications), registered for GO's proof run; they close a row only while
    every earlier guard they name is gated PASS (pm_goal_guard_sweep.prove)."""
    import pm_goal_deleted_external_oracles as frozen
    return frozen.earlier_clause_proof(name, reports)
