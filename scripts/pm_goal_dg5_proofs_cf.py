"""Source checks for the certified Goal schema coverage table."""

WORLD = 'scripts/pm_goal_dg_cf2_world.py'
FAMILY = 'goal_run.certified'
MESSAGEPACK = [
    ('scripts/pm_goal_test_owner_adapters.py', 74),
    ('scripts/pm_goal_test_numrule.py', 187),
    *(('scripts/pm_event_numbers.py', line) for line in (309, 328, 332, 345, 357, 358, 372, 375, 384)),
]

PROOFS = {
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
}
