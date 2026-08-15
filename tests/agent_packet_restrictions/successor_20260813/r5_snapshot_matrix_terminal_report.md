# R5 frozen-snapshot prompt-complexity matrix — terminal report

## Outcome

The bounded matrix completed its valid process terminal: `VALID_COMPLETE_WITH_ONE_OR_MORE_FIRST_ATTEMPT_FAIL`.

All three configurations reached an honest `FIRST_ATTEMPT_FAIL`. This is a negative empirical result for the tested prompts and frozen fixture, not a harness failure and not evidence that the broader planning-wizard audit process works on these models.

| Configuration | Subject calls | Passed before first divergence | First failing stage | Terminal |
|---|---:|---|---|---|
| GPT-5.4 mini, xhigh | 7 | S10A, S10B, S20A, S20B, S30A, S30B, S40A, S40B, S45A, S45B | S50 | FIRST_ATTEMPT_FAIL |
| GPT-5.4 mini, medium | 2 | S10A | S10B | FIRST_ATTEMPT_FAIL |
| GPT-5.6 Luna, medium | 2 | S10A | S10B | FIRST_ATTEMPT_FAIL |

Total subject calls: **11**. Retries, best-of calls, prompt changes, scorer changes, and replacement results: **0**.

## Exact divergences

- GPT-5.4 mini xhigh, S50: actual payload `1816526d084d493f8b105b93517e41fb73c86b3e13ef57bca69b47795c2fe293` / 2,165 bytes; expected `f9045a15edc593311255524515da87e5d4582721405533385f1a541212e72c15` / 2,145 bytes.
- GPT-5.4 mini medium, S10B: actual payload `1266c931fde3d046fbd4df6bbc4ad70a25e07be626ab5880fa1f38de4becfd3c` / 2,807 bytes; expected `c1d5ad37f8e9d9f3384d41aed50ddc8f0e639f0b9c4a03322ef91bfd2dbddfdf` / 2,799 bytes.
- GPT-5.6 Luna medium, S10B: actual payload `043e39b0223f8818d80905d6d8e23701a45075194380c0cb9dfb3d8164de849e` / 2,807 bytes; expected `c1d5ad37f8e9d9f3384d41aed50ddc8f0e639f0b9c4a03322ef91bfd2dbddfdf` / 2,799 bytes.

## Frozen input boundary

The experiment used the unfinished throwaway fixture at `frozen_plans_snapshot_20260814_v1/`, not mutable live Plans:

- 15 regular nonlink files, 4,207,711 bytes, 82,825 lines.
- Snapshot descriptor: `28730f6ea44a5720cb8e473f8fb736353dfe5c412e21261eacc88d70ffe46392`.
- Provenance manifest storage: `56ddf926b4106bee4e774b91b17ed4fab5ca03a7e25154bc467955bb25274c0c` / 9,327 bytes.
- Fixture-binding manifest storage: `fcb6d03057853bca431661433a68657ddf8407fbcf814e2a489d00cac1cc5a49` / 4,361 bytes.

The candidate and external verifier were shown by prelaunch checks to read the fixture only; no claim is made about current live Plans.

## Execution and controller evidence

- Independent pre-execution custody review returned `READY_FOR_W10_SUBJECT_CUSTODY`; it performed no writes or subject calls.
- Final wave index payload: `f94e2f322c27cda725ff77594bab6372763ff3d1a92e1a019c06bd75d9612317`; storage: `a4993a213f9f42196b7e199d01b0cf059f13ba224d01aa8e3f4f246fa115a3ff` / 1,516 bytes.
- Source-close payload: `f8ced881cd7a07ac1ade23c5aa54ee6f3b946c02ce75207427ce22c257c45b68`; storage: `4f28e6093e037a3b20e2323fa57cad62288f3bb72d336c32d236600f6dd87d19` / 467 bytes.
- Cohort-close payload: `66052b65aee2373d597df59f0f2634329da78b0a47a596d038cd07d8fb9976a5`; storage: `58becff0b5026b7cb84a31036a8e90618edbe3c11ea7d463dfb411c40fc59393` / 1,052 bytes.
- Three result-manifest payload hashes: alpha `787dc94a189bede44706a39f6f3f8949913165841d6f4c7350ef924548f180d1`; bravo `9f924adba412850f6aa68ad1f3e88ca5cab599c13badf0ce62770ac10b361913`; charlie `7f3da422e25d3dc1dfcef287ddead561295b8e6c1f766e3a30e85d7194ec38df`.

The controller preserved six recoverable process failures. One required a narrow postlaunch harness repair: the disposable harness had incorrectly required globally unique platform `host_id` values even though the app truthfully returned shared `host_id=local`. The repair retained global task/thread uniqueness and did not change prompts, capsules, routes, scorer, oracles, or subject outputs. The six existing W10 calls were not rerun.

Counts for this bounded R5 goal:

- Preparation agents: 3 distinct; 5 assigned preparation interactions.
- Candidate revisions/seals: 2 (initial R5 snapshot candidate; one host-identity-only repaired reseal).
- Independent pre-execution audit cycles: 1.
- Preserved recoverable process failures: 6.
- Subject calls: 11.

## Durable evidence

- Frozen fixture: `frozen_plans_snapshot_20260814_v1/`
- Candidate and runtime evidence: `model_retest_r5_snapshot_v1/`
- Process-failure history: `r5_execution_process_failures.json`
- Host-identity pre-repair receipt: `r5_w20_host_identity_pre_repair_receipt.json`
- External verifier: `r5_snapshot_external_verifier_v1/`
- External verifier custody: `r5_snapshot_external_verifier_v1_custody.json`
- Final result binding: `r5_snapshot_matrix_terminal_result_binding.json`

## Claim boundary

These results apply only to the exact frozen snapshot, prompts, routes, scorer, oracles, and first-attempt outputs bound by the final result manifest. They are not current-Plans evidence, completeness evidence, production enforcement, release readiness, safety certification, permission to compile Plans, or evidence about the excluded external audit.
