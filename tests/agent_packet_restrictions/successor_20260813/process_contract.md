# Successor deterministic preflight process contract

Status: `PREFLIGHT_ONLY`

This contract governs deterministic successor preparation before Jared supplies a subject-model roster and test method. It does not authorize canonical Plan compilation, provider inspection, authentication inspection, route canaries, pilots, fleets, reviewer calls, repair calls, or any other subject-model or provider call.

## Authority and role separation

The controller is GPT-5.6 Sol at max reasoning, never ultra. Preparation agents are controller tooling, not future test subjects:

- GPT-5.6 Sol medium may perform easier bounded inventory, hash, fixture, or source-location work.
- GPT-5.6 Sol xhigh may perform bounded architecture, test-design, scoring, conflict-adjudication, or synthesis work.
- Every preparation packet must name its source slice, output type, prohibited actions, and read/write boundary. No preparation agent receives the entire source universe.
- Preparation calls must never be counted as subject observations or used to freeze the future roster or method.
- The controller alone integrates outputs and remains responsible for reopening cited bytes before accepting a claim.

## Read boundary and precedence

The required initial read order is:

1. `Plans/ledgers/v2/pldg-20260801-001-feature-intake/state/handoff.json`
2. `Plans/ledgers/v2/pldg-20260801-001-feature-intake/state/current.json`
3. `Plans/ledgers/v2/pldg-20260801-001-feature-intake/state/open_items.json`
4. `Plans/ledgers/v2/pldg-20260801-001-feature-intake/state/operating_capsule.json`
5. `tests/agent_packet_restrictions/reports/terminal_preflight_closeout-20260802.md`
6. `tests/agent_packet_restrictions/charter/control_plane_defect-0004-v4-boundary-invalid.md`
7. Only the bounded historical artifact families needed for classification.
8. The final course-correction archive, beginning with `00_START_HERE.md` and its precedence files.
9. The separately supplied provider-CLI final adjudication.

The current delegated charter controls phase and write scope. `AGENTS.md` controls repository work. Live non-pipeline `Plans/**` owner documents remain canonical product/build prose. The active ledger and course-correction packet are noncanonical planning/source inputs. Historical test artifacts are lineage, draft, terminal, or failure evidence according to `historical_artifact_disposition.json`; they are never empirical results.

Turn context remains narrow even when durable source custody is broad. A hash change in a bound source invalidates only the dependent currentness claim and requires a bounded refresh; it must not be silently accepted.

## Write boundary

The only permitted write root is:

`/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/`

Everything else is read-only. Temporary state, if any, must also remain inside this root. No worktree, stage, commit, push, stash, reset, clean, deletion, historical rewrite, canonical Plan edit, ledger edit, concept edit, product/runtime edit, governance edit, WorkNode/NodeSeed/queue edit, Spec Lock edit, shard edit, evidence edit, plan-graph edit, or auto-decision edit is permitted.

The checker itself is read-only and standard-library-only. It may not import or invoke provider, network, shell, or process-launch facilities. Files under the write root may not be symlinks or resolve outside it.

## Fixed design constraints carried into a future test plan

- Durable breadth, narrow turn context.
- One conservative weak-model-safe automated contract. Observed InstructionLoad, token counts, adapter behavior, and outcomes are diagnostics, not predicted budgets or per-model safety profiles.
- Direct Assistant Chat and Chat-originated delegation are distinct and are not ordinary strict-policy automated runs.
- The fixed order is deterministic Context Admission; PromptCapsule, RuntimePolicySnapshot, and explanatory ContextReceipt; provider rendering; independent Packet Admission and FileSafe over identical final bytes; immutable dispatch; one assigned worker call; deterministic response conformance.
- BSD is optional and default Off.
- Provider CLIs are neither bundled nor silently first-installed. Initial acquisition requires explicit user action from the official source for the exact Host/Environment; authentication is separate; Auto/On may maintain only an already approved installation.
- Puppet Master must not acquire a Playwright-shaped runtime or a SQLite sidecar for this work.
- The former exact 8-low/2-high cohort, A-E method, and post-V4 recipe are superseded.

These constraints bound Jared's future choices but do not select models, providers, routes, repetitions, scoring, reviewer policy, or a launch sequence.

## Deterministic gates

1. `CUSTODY`: every bound local/external source and archive member matches its recorded hash and authority class.
2. `HISTORY`: all inherited files are classified exactly once; terminal zero-call facts and invalid V4 failure evidence remain failures.
3. `SURFACES`: all 54 inherited surface identifiers are reopened exactly once, evidenced additions are explicit, and direct-Chat exclusions and gaps are named.
4. `CONTROLLER`: strict JSON, terminal precedence, lineage normalization, synthetic capture commitments, V3/V4 incompatibility detection, and no-provider static controls pass.
5. `QUESTIONS`: every roster and method choice remains visibly unanswered for Jared.
6. `BOUNDARY`: required artifacts are confined to the exclusive root, no symlink escapes exist, and the before/after outside-root Git-status digest is unchanged.
7. `REPORT`: results, residual failures, claim limits, and the terminal agree.

A gate passes only from exact deterministic evidence. An upstream validator failure is recorded as a failure, even when the narrow successor preflight can still reach its handoff terminal.

## Terminals and stop rules

- `NOT_READY`: one or more successor deterministic gates fail. Report exact failures and stop. Do not ask for or launch subjects as if the gate passed.
- `READY_FOR_JARED_TEST_PLAN`: all successor deterministic gates pass, open questions remain unanswered, and no subject/provider call has occurred. Stop and ask Jared to provide the models to test and how to test them.

`READY_FOR_JARED_TEST_PLAN` means only that the bounded deterministic preparation package is internally ready for Jared's next decisions. It is not empirical model success, production enforcement, runtime completeness, canonical Plan readiness, release readiness, or safety certification.

No other terminal may imply launch permission. In particular, a static fixture PASS, a historical receipt, or a specialized browser-prototype PASS cannot authorize a subject call.

## Resumability

Resume by reopening, in order, `source_custody.json`, `historical_artifact_disposition.json`, `refreshed_surface_census.json`, `test_design_questions.json`, `deterministic_preflight_spec.json`, `deterministic_preflight_report.json`, and `readiness_report.md`. Recompute bound hashes and the outside-root status digest before relying on prior results. Refresh only affected rows and preserve prior failures; never rewrite an old failure into success.

After `READY_FOR_JARED_TEST_PLAN`, the next controller turn may record Jared's answers in a new explicitly authorized preparation artifact. It may not infer unanswered choices, reuse the superseded cohort/method, inspect provider/auth state, or call a route until Jared separately authorizes the resulting plan.
