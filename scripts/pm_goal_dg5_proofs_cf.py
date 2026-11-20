"""Source checks for the certified Goal schema coverage table."""

WORLD = 'scripts/pm_goal_dg_cf2_world.py'
FAMILY = 'goal_run.certified'
MESSAGEPACK = [
    ('scripts/pm_goal_test_owner_adapters.py', 74),
    ('scripts/pm_goal_test_numrule.py', 187),
    *(('scripts/pm_event_numbers.py', line) for line in (309, 328, 332, 345, 357, 358, 372, 375, 384)),
]

PROOFS = {
    'dg5/intent/schema': {
        'kind': 'entailed-by-prepared-and-armed-intent',
        'families': [FAMILY],
        'depends_on': ['dg5/prepare/result/schema', 'dg5/arm/intent/schema'],
        'sites': [
            *((WORLD, line) for line in (65, 159, 696, 710, 711, 712, 736, 739, 741, 745, 746)),
            *((('Plans/goal_certified_event_coordinator_contracts/schemas/coordinator.v1.schema.json'), line)
              for line in (290, 301, 1225, 1238)),
        ],
        'argument': (
            'The only two callers pass derived Intent to Prepared.intent or StorageIntent.record. '
            'Each later schema requires the field and checks it against the identical Intent '
            'definition. Arm also checks equality with the prepared intent before wrapping. '
            'Disabling only the derived Intent schema reached the Prepared schema in one call '
            'and the prepared-Intent equality check in the other. Both original refusals returned.'
        ),
    },
    'dg5/f5a/intent/schema': {
        'kind': 'entailed-by-validated-arm-intent',
        'families': [FAMILY],
        'depends_on': ['dg5/arm/intent/schema'],
        'sites': [(WORLD, line) for line in (65, 130, 741, 745, 746, 753, 757, 790, 792, 794)] + MESSAGEPACK,
        'argument': (
            'Arm validates the stored intent using the same StorageIntent definition and then '
            'writes that document. F5a reads that arm cell and requires its canonical bytes '
            'to equal the supplied intent. The encoding preserves JSON values and types, '
            'so an invalid intent cannot equal the validated document. The complete call '
            'repeats the original schema message after '
            'restoration and reaches f5a/intent_bytes with just the schema check disabled.'
        ),
    },
    'dg5/f5a/control/schema': {
        'kind': 'entailed-by-validated-arm-control',
        'families': [FAMILY],
        'depends_on': ['dg5/arm/control/schema'],
        'sites': [(WORLD, line) for line in (65, 130, 744, 745, 746, 754, 755, 757, 791, 795, 796)] + MESSAGEPACK,
        'argument': (
            'Arm validates StorageControl before storing the armed document. F5a applies '
            'the same schema, then compares the canonical bytes against that control cell. '
            'The encoding preserves JSON values and types. With the schema check disabled '
            'the invalid document still fails f5a/control_bytes and restoring the schema '
            'check repeats the original message.'
        ),
    },
}
