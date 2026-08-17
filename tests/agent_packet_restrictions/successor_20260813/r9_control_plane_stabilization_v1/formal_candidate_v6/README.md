# R9 standalone causal controller — iteration 010

This directory is an internal, zero-credit stabilization iteration under r9_goal_operating_contract_v1.json (SHA-256 764dd27b3f472a90eef0f8493e63ac8fb349fe05a3a97dc4673a4a835e6e8dbd, 7,024 bytes). It starts from iteration 009 and binds iteration_009_falsifier_report_v1.json (SHA-256 ad500690671fad27280bbdd61fab39443185b76554f2722f7756ac68a5db7a48, 9,678 bytes) and r9_progress_assessment_iteration_009_falsifier_fail_v1.json (SHA-256 96bb327bb0c8c1c2f4a4f0f42015f8e4033c89000c331ffe56dce7683fbc4e03, 6,941 bytes).

Iteration 010 deletes the STATIC_COUNTERFACTUAL_SELF_ATTESTATION fixture surface. The semantic manifest stays byte-identical to iteration 009: all four exact prompt inserts, all 97 candidates and expected outputs, all source bindings and predecessor outputs, all dependency gates, and all 18 deterministic artifacts are unchanged. The data-only semantic receipt provides six concrete answer-free structured projections plus one leakage-scan declaration. It does not record observed results or PASS checks. The separately owned simulator computes observations from those projections and executes the exact iteration 009 gate against an adverse in-memory receipt as a predecessor negative control.

This is not a formal candidate, audit, freeze, canary result, qualification run, readiness claim, or empirical evidence. No model, provider, network, subject, canary, or matrix call is authorized. All development checks are local zero-call evidence with zero empirical and qualification credit.

## Concrete projection schema

Each semantic case stores fixture_id and expected outside provider_projection. Each provider projection has exactly these top-level keys:

1. source_supported_candidate
2. supported_claims
3. apparent_discrepancies
4. source_bindings
5. predecessor_outputs

A projection contains no expected, result, observed_result, controller_truth, fixture, fixture_id, cell, cell_id, route, slot, model, oracle, oracle_hash, hash, or sha256 field at any depth. Source bindings contain document-authority metadata. Neutral IDs and non-semantic ordering prevent evaluator branches on fixture names or case order. Every projection is bound outside the projection by the SHA-256 and byte count of canonical minified UTF-8 JSON without a terminal LF.

The closed decision vocabulary is:

- select_current_and_supersede_other: resolves one named discrepancy only when the selected claim and superseded claims exactly cover its claim set.
- preserve_unresolved_conflict: retains the named discrepancy as unresolved.
- preserve_distinct_authorities: retains the named claims as distinct authority or scope roles.

The six concrete states, in receipt order, are renamed/reordered resolution, stale/current resolution, lineage-only document metadata with a matching resolution, a preserved unresolved conflict, deliberately distinct authorities, and a missing matching resolution. The seventh row references the exact six projection byte identities and declares forbidden recursive keys and answer-bearing tokens. It does not self-attest a scan result.

## Independent evaluator boundary

The independent code evaluator in simulator.py, separate from the data-only semantic receipt and the controller/verifier runtime, must:

1. validate the exact allowed projection schema and decision vocabulary;
2. recompute each canonical projection SHA-256 and byte count;
3. compute an observed boolean from projection structure without reading expected, fixture ID, receipt status, case order, or receipt assertions;
4. compare the computed observed boolean with expected only afterward;
5. scan the exact recomputed projection bytes for every forbidden key and token declared by the leakage row.

Receipt status, expected values, byte identities, prose, ordering, and receipt-authored assertions cannot establish PASS. The evaluator uses code-owned discrepancy kinds and leakage aliases. It must require exact coverage of every unequal-value same-predicate claim pair and reject unknown keys or kinds, equal-value discrepancies, duplicate claim pairs, incomplete claim coverage, duplicate or unmatched decisions, decision-kind mismatches, cyclic supersession, boolean or non-closed claim values, unknown references, malformed canonical identities, or any leakage. Its observed results and actual pass/fail rows belong in independently generated simulator evidence, never in semantic_inventory_receipt.json.

## Retained experiment boundary

controller.py exposes exactly four commands: simulate, run-canary, run-matrix, and reopen. For an admitted empirical row, the trusted root directly issues exactly one collaboration.spawn_agent request with agent_type default, fork_turns none, the frozen model, and routes.json thinking passed unchanged as reasoning_effort. It never fabricates or requires an internal thread or turn identity. backend.py is synthetic-only, provides deterministic data fixtures for the collaboration request/event protocol, performs zero dispatches and writes, and has no empirical or launch authority. verifier.py remains an independent offline reopener and does not trust controller validity claims. routes.json, schedule.json, and semantic_manifest.json remain byte-identical; pipeline_contract.json changes only the execution-unit key and explicit route-field mapping.

The controller retains one fresh isolated subagent invocation and one predeclared nonce per row, once-only attempt admission, deterministic scoring, completion written last, row reopen before schedule advance, no retry, no replacement, no best-of, valid-subject-fail slot stop, controller-invalid global stop, and safe signal drain. A complete row has exactly provider_input.txt, spawn_message.txt, attempt.json, spawn_receipt.json, raw_result.json, and completion.json in that order. A SPAWN_ATTEMPT failure has exactly the first four files and no terminal event; a TERMINAL_DRAIN failure after a success receipt has exactly the first five files. A wrong terminal or nonterminal delivery without a later valid first final is controller invalid. Retained observed nonterminal activity followed by the first valid final is permanent subject FAIL with returncode 86. SIGINT and SIGTERM are blocked across the no-admit/admit critical section: a stop observed before admission creates no row, while a stop after admission drains that same subagent to the first valid final or typed failure before terminal accounting.

The retained row evidence binds the exact packet and spawn-message bytes, canonical no-LF spawn-request hash, nonce-derived invocation and canonical subagent path, the exact one-key tool result path, first valid FINAL_ANSWER UTF-8, observed activity, deterministic score, and terminal accounting. The root-event failure shape is exactly {schema_id, invocation_id, phase, failure_type, detail}, with phase SPAWN_ATTEMPT or TERMINAL_DRAIN, an uppercase typed failure token, and nonempty detail. Observed nonterminal entries have exactly {sequence, message_type, utf8, sha256, bytes}. The controller run bundle contains three shared successor-root authorities plus 15 files under the current component root, for 18 files total. The component path prefix is recomputed after a formal-candidate copy; a source-root path digest is never reused for the candidate. The offline verifier independently recomputes these relationships from retained bytes.

## Dual-root component custody

The retained suite's recorded-source principal and the simulator's executing-component principal are intentionally separate. Recorded source rows must identify the canonical iteration_010 root exactly, remain unchanged by repository-relative path, SHA-256, and bytes, and independently reopen under current pushed Git custody. The source root's complete immediate component is exactly the 17 regular nonlink files named by the simulator, including README.md and simulator.py. Its receipt projection must equal an independent immediate-directory enumeration; a four-file closure is insufficient.

The executing component is either iteration_010 itself or one direct versioned formal_candidate_vN child. Before any retained controller reopen, the simulator independently enumerates the same exact 17 basenames, compares every SHA-256 and byte count without giving the directory prefix authority, then separately requires HEAD equal origin/main, every executing-component file equal its HEAD blob, and component-scoped porcelain-v2 to be empty. Only the executing component is invoked. Missing, extra, nested, drifted, nonregular, symlinked, untracked, dirty, or non-versioned roots fail before invocation. Candidate mint-manifest booleans and path-sensitive aggregate digests have no authority over this predicate. This replacement adds no command, wrapper, callback, token, capability layer, or recursive verifier.

Synthetic evidence has zero qualification credit. Actual launch still requires an exact pushed Git-bound bundle and external freeze authority. This iteration grants no candidate, audit, freeze, canary, matrix, launch, empirical, or qualification authority.

## Pending gates

Deterministic zero-call projection evaluation, graph-complete fail-closed checks, atomic stop-signal admission, repeated-stop terminal survival, exact collaboration event-chain validation, semantic receipt v3 offline verification, and the iteration 009 adverse-receipt negative control are implementation repairs only. Exit-006 completed two 291-row synthetic traversals plus all 56 normalized and 10 global cases on its then-final bytes, but formal Candidate V5's sole preseal audit correctly failed: its mint manifest reused the source-root path digest and its copied simulator could not reopen exit-006 because recorded and executing roots were collapsed. Candidate V5, its failed audit, and its zero-credit evidence remain immutable historical failures. The source-custody validator family is reset to the dual-root complete-component design above. A fresh complete suite on the repaired bytes, adversarial falsification, holistic review, safe Git commit/push, fetched-origin equality, a newly versioned byte-identical formal candidate, one preseal audit, freeze, three-route canary, and two unchanged clean empirical matrices all remain pending. Static contracts, old exit suites, Candidate V5, and synthetic fixtures receive zero empirical and qualification credit.

## Explicit nonblocking residual risks

Named nonblocking residual risks are malicious trusted-root/controller fabrication, host or OS compromise, effective provider model or reasoning effort not independently attested, root-visible activity not proving unexposed platform activity absent, and a final filesystem snapshot not reconstructing historical create-only and fsync system calls. They do not relax any exact experiment-validity invariant above, do not reopen the closed request-capability blocker, and do not authorize a subject launch.
