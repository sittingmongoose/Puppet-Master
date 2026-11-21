"""DG5 written proofs for goal_run.certified.

Landed from the methodb-pilot branch (plans/ea-goal-methodb-pilot-20261120, 6b020038e4, module last changed
in 0957805aa0). Kind, families, depends_on, sites and argument are the pilot's, unchanged; the pilot's
generated site lists (WORLD/PRODUCER comprehensions and the MESSAGEPACK list) are written out as explicit
(path, line) tuples, one per line. Every cited line is current at the lane head. Nothing here earns kill credit.
"""
WORLD = 'scripts/pm_goal_dg_cf2_world.py'
PRODUCER = 'scripts/pm_goal_dg_cf1_world.py'

PROOFS = {
    'dg5/append_outer/evidence/schema': dict(
        kind='entailed-by-append-result-evidence',
        families=['goal_run.certified'],
        depends_on=['dg5/append/result/schema'],
        sites=[
            (WORLD, 932),
            (WORLD, 1002),
            (WORLD, 1008),
            (WORLD, 1010),
            (WORLD, 1012),
            ('Plans/goal_certified_event_coordinator_contracts/schemas/append-phase.v1.schema.json', 65),
        ],
        argument=(
            'The append response includes the same evidence and requires it to satisfy AppendEvidence. The '
            'complete call with the earlier check disabled delivered the identical invalid evidence to the '
            'result schema. The EventPhase write matched the accepted control and did not change after '
            'validation.'
        ),
    ),
    'dg5/current/guard/schema': dict(
        kind='entailed-by-final-current-guard',
        families=['goal_run.certified'],
        depends_on=['dg5/current_final/guard/schema'],
        sites=[
            (WORLD, 614),
            (WORLD, 622),
            (WORLD, 1247),
            (WORLD, 1266),
        ],
        argument=(
            'The reader passes its first accepted GuardReadResult unchanged to the same validator before '
            'returning. Disabling only the entry check reached the final check with the identical invalid '
            'document. Restoring the entry check repeated its exact original message.'
        ),
    ),
    'dg5/f5a/control/schema': dict(
        kind='entailed-by-validated-arm-control',
        families=['goal_run.certified'],
        depends_on=['dg5/arm/control/schema'],
        sites=[
            (WORLD, 65),
            (WORLD, 130),
            (WORLD, 744),
            (WORLD, 745),
            (WORLD, 746),
            (WORLD, 754),
            (WORLD, 755),
            (WORLD, 757),
            (WORLD, 791),
            (WORLD, 795),
            (WORLD, 796),
            ('scripts/pm_goal_test_owner_adapters.py', 74),
            ('scripts/pm_goal_test_numrule.py', 187),
            ('scripts/pm_event_numbers.py', 309),
            ('scripts/pm_event_numbers.py', 328),
            ('scripts/pm_event_numbers.py', 332),
            ('scripts/pm_event_numbers.py', 345),
            ('scripts/pm_event_numbers.py', 357),
            ('scripts/pm_event_numbers.py', 358),
            ('scripts/pm_event_numbers.py', 372),
            ('scripts/pm_event_numbers.py', 375),
            ('scripts/pm_event_numbers.py', 384),
        ],
        argument=(
            'Arm validates StorageControl before storing the armed document. F5a applies the same schema, '
            'then compares the canonical bytes against that control cell. The encoding preserves JSON values '
            'and types. With the schema check disabled the invalid document still fails f5a/control_bytes and '
            'restoring the schema check repeats the original message.'
        ),
    ),
    'dg5/f5d/evidence/schema': dict(
        kind='entailed-by-outer-append-evidence',
        families=['goal_run.certified'],
        depends_on=['dg5/append_outer/evidence/schema'],
        sites=[
            (WORLD, 932),
            (WORLD, 975),
            (WORLD, 986),
            (WORLD, 990),
            (WORLD, 1002),
            (WORLD, 1008),
        ],
        argument=(
            'Both F5d checks pass the same evidence to the same schema. The outer responder rechecks that '
            'evidence without altering it. Disabling only the F5d row removes both refusals and reaches the '
            'later refusal. The copied fixture verifies that the intervening write is identical to the valid '
            'call.'
        ),
    ),
    'dg5/intent/schema': dict(
        kind='entailed-by-prepared-and-armed-intent',
        families=['goal_run.certified'],
        depends_on=['dg5/prepare/result/schema', 'dg5/arm/intent/schema'],
        sites=[
            (WORLD, 65),
            (WORLD, 159),
            (WORLD, 696),
            (WORLD, 710),
            (WORLD, 711),
            (WORLD, 712),
            (WORLD, 736),
            (WORLD, 739),
            (WORLD, 741),
            (WORLD, 745),
            (WORLD, 746),
            ('Plans/goal_certified_event_coordinator_contracts/schemas/coordinator.v1.schema.json', 290),
            ('Plans/goal_certified_event_coordinator_contracts/schemas/coordinator.v1.schema.json', 301),
            ('Plans/goal_certified_event_coordinator_contracts/schemas/coordinator.v1.schema.json', 1225),
            ('Plans/goal_certified_event_coordinator_contracts/schemas/coordinator.v1.schema.json', 1238),
        ],
        argument=(
            'The only two callers pass derived Intent to Prepared.intent or StorageIntent.record. Each later '
            'schema requires the field and checks it against the identical Intent definition. Arm also checks '
            'equality with the prepared intent before wrapping. Disabling only the derived Intent schema '
            'reached the Prepared schema in one call and the prepared-Intent equality check in the other. '
            'Both original refusals returned.'
        ),
    ),
    'dg5/producer/payload/schema': dict(
        kind='entailed-by-certified-submission-payload',
        families=['goal_run.certified'],
        depends_on=[],
        sites=[
            (PRODUCER, 129),
            (PRODUCER, 1571),
            (PRODUCER, 1625),
            (PRODUCER, 1626),
            (PRODUCER, 1640),
            (PRODUCER, 1641),
            (PRODUCER, 1655),
            (PRODUCER, 1657),
            (PRODUCER, 1658),
            (PRODUCER, 1669),
            (PRODUCER, 1682),
            (PRODUCER, 1688),
            ('Plans/goal_certified_producer_source_contracts/schemas/producer-submission.v1.schema.json', 99),
            ('scripts/pm_goal_own_c3_w5_successor_oracles.py', 80),
        ],
        argument=(
            'The original submission requires a copy of the payload and resolves its reference to the same '
            'complete schema document. Before that submission, the producer also checks all three integer '
            'members explicitly and requires its payload and event timestamps to be the same value from the '
            'decision. It validates the event timestamp with the repository parser. Disabling just the '
            'earlier payload check forwards the unchanged invalid payload to the submission validator. '
            'Restoring it repeats the original refusal. The original source-issuance write matches in every '
            'test.'
        ),
    ),
    'dg5/retry/evidence/schema': dict(
        kind='entailed-by-retry-result-evidence',
        families=['goal_run.certified'],
        depends_on=['dg5/retry/result/schema'],
        sites=[
            (WORLD, 932),
            (WORLD, 1029),
            (WORLD, 1031),
            (WORLD, 1033),
            ('Plans/goal_certified_event_coordinator_contracts/schemas/append-phase.v1.schema.json', 65),
        ],
        argument=(
            'The retry result requires the original evidence under the identical AppendEvidence definition. '
            'Disabling only the earlier check sends the unchanged invalid evidence to the result validator. '
            'Restoring the earlier check repeats the original message.'
        ),
    ),
}


# Withdrawn written proofs (proof maintenance round 3, pm-ea-lead 1121124828-43f4 (b), from the final lists
# FINAL-LIST-113.r2 and FINAL-LIST-R2B). They are kept for the record and are deliberately outside PROOFS, so no
# tool loads them as proofs: pm_goal_dg5_justified.written_proofs and keycheck.py read only PROOFS. Do not move one
# back without a new argument and a recorded probe whose cut run refuses.
WITHDRAWN = {
    'dg5/commit/evidence/schema': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-R2B. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2b P-A-1 UNSOUND, '
            'P-A-2 SOUND. R2B why: break stands (P-A-1), refuted premise. R2B route: kill: a negative presenting '
            'appended.evidence={} after a real append, expecting commit/evidence/schema/, under the forked judge (the '
            'cut crashes).'
        ),
        proof=dict(
            kind='entailed-by-final-commit-evidence',
            families=['goal_run.certified'],
            depends_on=['dg5/commit_final/evidence/schema'],
            sites=[
                (WORLD, 932),
                (WORLD, 1055),
                (WORLD, 1073),
            ],
            argument=(
                'Commit checks the identical evidence in the same schema bank at entry and again before its '
                'write. Disabling only the earlier schema check sent the unchanged invalid document to the final '
                'check and restoring it repeated the first refusal.'
            ),
        ),
    ),
    'dg5/f5a/intent/schema': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-R2B. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2b P-A-1 SOUND, P-A-2 '
            'UNSOUND. R2B why: break stands (P-A-2), refuted premise. R2B route: kill: CF08-N15 state plus a direct '
            'f5a entry call, expecting f5a/intent/schema, under the forked judge (the cut refuses '
            'f5a/control_intent).'
        ),
        proof=dict(
            kind='entailed-by-validated-arm-intent',
            families=['goal_run.certified'],
            depends_on=['dg5/arm/intent/schema'],
            sites=[
                (WORLD, 65),
                (WORLD, 130),
                (WORLD, 741),
                (WORLD, 745),
                (WORLD, 746),
                (WORLD, 753),
                (WORLD, 757),
                (WORLD, 790),
                (WORLD, 792),
                (WORLD, 794),
                ('scripts/pm_goal_test_owner_adapters.py', 74),
                ('scripts/pm_goal_test_numrule.py', 187),
                ('scripts/pm_event_numbers.py', 309),
                ('scripts/pm_event_numbers.py', 328),
                ('scripts/pm_event_numbers.py', 332),
                ('scripts/pm_event_numbers.py', 345),
                ('scripts/pm_event_numbers.py', 357),
                ('scripts/pm_event_numbers.py', 358),
                ('scripts/pm_event_numbers.py', 372),
                ('scripts/pm_event_numbers.py', 375),
                ('scripts/pm_event_numbers.py', 384),
            ],
            argument=(
                'Arm validates the stored intent using the same StorageIntent definition and then writes that '
                'document. F5a reads that arm cell and requires its canonical bytes to equal the supplied intent. '
                'The encoding preserves JSON values and types, so an invalid intent cannot equal the validated '
                'document. The complete call repeats the original schema message after restoration and reaches '
                'f5a/intent_bytes with just the schema check disabled.'
            ),
        ),
    ),
}
