# Back Seat Driver (Canonical Owner)

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes the cross-surface envelopes in `Plans/Contracts_V0.md`, and preserves deterministic defaults under `Plans/Decision_Policy.md`. Puppet Master is the only product name.
> **Authority:** This document is the sole canonical owner of Back Seat Driver semantics: BSD policy and revision, workflow/stage bindings, assignment and review-cycle lifecycle, the isolated advisor session (context, cursor, stable prefix, epoch, transcript, tool profile), bounded delta input, the `nit|concern|critical` severity vocabulary, held/reconfirmed asynchronous advice, finding identity/deduplication/closure, catch-up and cooldown, quarantine and failure isolation, reset and re-prime, requested-versus-effective advisor identity disclosure, project watch guidance, and the BSD projections consumed by the compact Context menu, Context Details, advice cards, and Usage. It does not own generic resource admission, `ObservableWork`, lease coordination, provider dispatch admission, model/account identity, Persona definition, permission ladders, Usage storage, Chat presentation shell, or any primary run's execution authority.

## 1. Authority, scope, and non-ownership

Back Seat Driver ("BSD") is a passive, read-only advisory service that observes another run and may raise bounded advice about it. This document holds the complete semantic definition of that service. Every other owner consumes BSD through typed references and projections and must not restate BSD rules locally.

Back Seat Driver owns:

- `BSDPolicy` content, revision, and deterministic default resolution;
- `BSDWorkflowBinding` and per-stage `inherit|off|auto|on` resolution, including start-time freezing;
- `BSDAssignment` identity, state machine, cursor, stable-prefix hash, and epoch;
- `BSDReviewCycle` trigger classification, input manifest reference, and outcome vocabulary;
- `BSDFinding` identity, severity, hold/reconfirm protocol, dedup key, closure, and reopen rules;
- `BSDQuarantine` reasons, re-prime allowance, and terminal disposition;
- the read-only advisor tool profile and its forbidden-authority list;
- catch-up wait bounds, interruption cooldown, and no-call suppression accounting;
- reset and re-prime triggers, and epoch fencing of late callbacks;
- requested-versus-effective advisor model, account, and Persona disclosure;
- project watch guidance discovery, ordering, and prompt-scope limits;
- the semantics behind every BSD row shown in the compact Context menu, Context Details, advice cards, and Usage.

It does not own:

- generic resource admission, the physical-parent budget tree, host pressure, or `ObservableWork` (`Plans/Shared_Integration_Runtime.md` §8);
- lease coordination, durable command outbox, cursor replay, or provider dispatch admission (`Plans/Shared_Integration_Runtime.md` §6, §7, §9, §11);
- model, account, or route identity and fallback policy (`Plans/Models_System.md`, `Plans/Multi-Account.md`);
- Persona definition, selection catalog, or Persona-granted behavior (`Plans/Personas.md`);
- the approval ladder, permission rule resolution, or credential custody (`Plans/Permissions_System.md`);
- context materialization, redaction implementation, or prompt assembly (`Plans/Prompt_Pipeline.md`);
- `UsageRecord` storage, cost authority, quota truth, or the Usage page layout system (`Plans/usage-feature.md`);
- Chat shell presentation, transcript rendering, wand chrome, or Context Lens placement (`Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md`);
- Goal objective/lifecycle, Assistant Plan runtime, To-Do state, or collaborative workflow runtime;
- scheduling, execution windows, quota-resume consent, or manual precedence (`Plans/Scheduling_and_Quota_Resume.md`);
- storage keys, event registration, replay, retention, or migration mechanics (`Plans/storage-plan.md`).

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Personas.md, ContractName:Plans/Models_System.md, ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Planning_Wizard.md, ContractName:Plans/PRD_Builder.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/storage-plan.md

## 2. Product boundary: a separate passive advisor

BSD is a separate capability. It is **not** part of the Multi-Agent Workflows manager and must never be modelled, configured, stored, or presented as a collaborative workflow. Crew, BrainStorm, Review, and Chat Room are collaborative workflows with participants, a shared transcript, a composer destination, and artifacts; BSD has none of those. It has no participant roster, no composer target, no shared discussion, no vote, and no artifact of its own beyond its private advisor transcript and its findings. A user cannot address BSD from the composer, and BSD cannot address the user except through the bounded advice channel defined in this document.

BSD is orthogonal to primary-mode selection. It may be attached while the primary is in Ask, Agent, Debug, Plan, Deep Plan, or Review, and while a collaborative workflow is running, but attaching BSD never changes the primary mode, never adds a participant to a collaborative run, and never appears in the Multi-Agent Workflows Settings manager. Its Settings home is its own BSD manager; see §22.

BSD is strictly read-only in the product sense as well as the tool sense. It never authorizes, mutates, certifies, approves, merges, publishes, or substitutes for a required review, verification, or test. A BSD finding may be cited by a Review reviewer or by an auditor as input evidence, but it is not a reviewer vote, not a verifier result, not a certification signal, and not a gate. If a stage requires a human or a designated reviewer/verifier/certifier role, BSD can neither satisfy that role nor fail it. Conversely, BSD advice never blocks the primary run by itself: the primary flow must never depend on BSD health, and every BSD failure mode is isolated and quarantined so the primary continues.

BSD is a Puppet Master adaptation of the OMP-style isolated advisor lineage recorded in `source_snapshots/pi-omplike-advisor.ts`, `source_snapshots/pi-omplike-advisor-README.md`, and `source_snapshots/competitor_extracts/oh-my-pi/docs/advisor-watchdog.md`. That lineage justifies the isolated session, bounded per-turn delta, self-compaction, held/reconfirmed high-severity advice, emission guard, cooldown, and project watch file design. It is research lineage only. No competitor file, tool grant, severity name, environment variable, or configuration file becomes a Puppet Master product owner, and Puppet Master deliberately diverges where the charter requires it: the public severity ladder is `nit|concern|critical` with no `blocker`, advisor tool grants can never include mutating tools, and BSD may not interrupt, abort, or auto-resume the primary run.

## 3. Modes, defaults, and resolution

BSD modes are exactly `Off`, `Auto`, and `On`.

`Off` performs no advisor call. It must not create a provider attempt, a speculative context build, or a fabricated Usage record; the only permitted record is a no-call outcome with reason `no_call_off`.

`Auto` is the product default. It evaluates only on the deterministic triggers in §4. Auto is the recommended value and the value a missing or invalid stored mode resolves to, with the resolution reason recorded. An explicitly stored `Off` is a deliberate user choice and is never migrated to `Auto`.

`On` evaluates every eligible bounded update within cost, quota, and resource policy. `On` changes evaluation frequency only. It does not widen tools, raise authority, lower the suppression bar, or make advice more likely to be shown: visible advice still depends on the finding, hold, dedup, and cooldown rules. Frequency never grants authority.

Effective mode for a given assignment resolves in this order: the stage binding when it is not `inherit`; then the workflow binding; then the project `BSDPolicy` mode; then `Auto`. Each resolution records the level that decided it. A stage that resolves to `Off` produces no assignment at all rather than an idle assignment.

Mode is durable owner state projected into the UI. The wand and every other surface read the owner projection; no surface may hold a local checkbox as truth or optimistically render a mode it has not been told was committed.

## 4. Trigger matrix and evaluation policy

`Auto` evaluates when one of the following deterministic trigger kinds fires. These are the complete Auto trigger set; a surface may not invent an additional trigger.

| Trigger kind | Fires when |
|---|---|
| `pre_first_material_mutation` | Before the first material mutation of an assignment's primary run. |
| `pre_high_risk_action` | Before an irreversible, external, security-relevant, or otherwise high-risk action. |
| `constraint_divergence` | Material divergence from a user constraint, the Goal objective, an approved Plan, or an approved PlanUnit. |
| `repeated_normalized_failure` | A normalized failure signature repeats within the assignment. |
| `environment_identity_change` | Provider, model, account, permission, tool, project, repository, worktree, or host change that could invalidate prior reasoning. |
| `major_verification_failure` | A major test, build, integration, or audit failure is observed. |
| `pre_terminal_completion_claim` | Before a terminal completion claim is presented as final. |
| `configured_stage_boundary` | A configured PRD, Wizard, PlanUnit, Plan Compile, WorkNode, audit, execution, verification, remediation, or certification boundary is reached. |
| `project_watch_rule` | A project watch rule in the guidance corpus matches the current delta. |
| `held_finding_reconfirmation` | A held finding exists and a reconfirmation opportunity has arrived. |

`trigger_sensitivity` is `conservative|balanced|frequent` with default `balanced`. Sensitivity may only narrow or widen how readily the elastic triggers (`constraint_divergence`, `repeated_normalized_failure`, `project_watch_rule`) fire. It can never disable `pre_high_risk_action`, `pre_terminal_completion_claim`, or `held_finding_reconfirmation`, and it can never cause an evaluation that policy has otherwise refused.

Under `On`, every eligible bounded update is reviewed subject to per-thread cost limit, per-stage review limit, provider quota, and shared resource admission. When admission is refused, the outcome is a recorded no-call with the refusing reason; it is never converted into local best effort or into a fabricated silent-clean result.

Every evaluation decision is recorded, including the decision not to call. A no-call carries a typed reason: `no_call_off`, `no_call_no_trigger`, `no_call_no_material_delta`, `no_call_cooldown`, `no_call_cost_limit`, `no_call_stage_limit`, `no_call_quota_unavailable`, `no_call_resource_refused`, or `no_call_paused`. These reasons are what makes the Auto trigger matrix auditable, and they are the source of the Usage no-call counters in §21.

## 5. The isolated advisor session

Every BSD assignment owns an independent advisor session. Isolation is the core safety property and must not be optimized away.

Each assignment owns:

- its own advisor context window and message history, disjoint from the primary's;
- its own tool session bound to the read-only tool profile of §10, with no shared file snapshots, seen-line tracking, conflict state, or summary cache with the primary;
- its own `cursor` into the primary generation stream and its own `stable_prefix_hash`;
- its own `epoch`, incremented on every reset trigger in §12;
- its own private transcript, retained under `assistant.bsd.retain_transcript`;
- its own Usage lineage, cost, token, and latency attribution;
- its own requested and effective model, account, and Persona snapshot.

Advisor context grows by appended bounded deltas so that prefix-stable provider caching remains possible; a rendering that rewrites earlier advisor content on every review is a defect because it destroys the stable prefix and inflates cost. When the advisor's own context crosses `assistant.bsd.self_compact_threshold` (default `0.8` of its window), the advisor self-compacts: it clears its private message history and replays the current bounded input fresh. If a review still overflows mid-stream, it replays that input once into a fresh context; if a fresh replay still overflows, the input genuinely does not fit and the review terminates as `failed` with reason `input_does_not_fit`. There is no unbounded retry.

Advisor self-compaction is independent of primary compaction. Advisor self-compaction resets the advisor cursor and dedup history but never erases held findings or durable closures, because those live outside the advisor transcript (§8, §9). Primary compaction is a separate, stronger event that resets the whole assignment (§12).

Advisory output already injected as advice is excluded from the next delta so the advisor cannot review its own advice recursively.

## 6. Bounded delta input

BSD input is a bounded delta plus typed references. It never receives the full primary transcript repeatedly, and it never receives secrets, unredacted artifacts, protected-authentication browser content, or hidden memory.

An input manifest contains:

1. the bounded primary delta since the assignment cursor, rendered with tool intent, tool results, and assistant reasoning where the primary owner exposes them;
2. typed references to the current user constraints in force;
3. a reference to the current Goal objective and revision when a Goal exists;
4. references to the approved Plan, Plan version/hash, scoped PlanUnits, and current To-Dos when they exist;
5. references to observed mutations and evidence produced in the delta window;
6. a runtime snapshot reference covering provider, model, account, project, repository, worktree, and permission posture;
7. the stage identity and the trigger kind and reason;
8. the redaction receipt proving the secret-obfuscation pass ran before the payload reached the advisor route;
9. the held-finding reconfirmation preamble when held findings exist;
10. the project watch guidance blocks resolved for this project (§15).

Injected primary constraint context is passed through verbatim inside an explicit wrapper rather than summarized, because summarizing a constraint is how an advisor invents a violation that does not exist. Repeated identical constraint blocks are deduplicated. Bounded manifests never expand a folder recursively or materialize an attachment body that Prompt Pipeline did not already materialize for the primary.

The manifest is a reference bundle, not a copy of the runtime. BSD reads owner truth through those references; it does not fork a private model of Goal, Plan, To-Do, or permission state.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

## 7. Severity

BSD severity is exactly `nit`, `concern`, or `critical`.

- `nit` is a low-stakes observation: cleanup, simplification, a minor edge case. Mild staleness is tolerable for a nit while the primary is still working.
- `concern` is material risk: a likely wrong direction, a missing constraint, an unsupported assumption, or a fabricated interface.
- `critical` means continuing would clearly waste substantial work or produce broken, unsafe, or non-compliant output.

The public vocabulary deliberately does not include `blocker`. BSD has no blocking authority, so a name implying one is forbidden in records, payloads, projections, copy, and Usage. Research lineage that used `blocker` maps to `critical` on import and is never surfaced under the old name.

Severity may escalate (`nit` → `concern` → `critical`) when evidence genuinely worsens. Severity may not be lowered in order to escape the hold protocol of §8; a downgrade that would convert a held `concern` into an immediately deliverable `nit` is rejected and the finding remains held at its recorded severity.

## 8. Held and reconfirmed advice

This is the defining BSD behavior and it is non-negotiable: **a stale asynchronous warning must never be emitted as current advice.**

Review is asynchronous. By the time an advisor finishes reviewing generation N, the primary has usually moved to generation N+1 or beyond, and the concern may already be fixed. Emitting it anyway produces confidently wrong advice about work that no longer exists.

Therefore:

1. A new asynchronous `concern` or `critical` finding is **held**. It is recorded as a `BSDFinding` in state `held`, bound to `raised_against_generation`, and it is not emitted.
2. Held state lives outside the advisor model transcript, so advisor self-compaction cannot erase it, and so it can be re-presented to a re-primed advisor.
3. The next review cycle for that assignment receives the held finding as an explicit reconfirmation preamble alongside the newer primary activity. The advisor must decide against the newer state.
4. If the advisor re-raises the finding, it moves to `emitted` with `latest_checked_generation` set to the generation it was reconfirmed against, and the emitted advice cites current evidence, not the original evidence.
5. If the advisor is silent about the held finding, the finding is `cleared`. Silence is the clearing signal; the user is never shown a warning the advisor declined to restate.
6. Reconfirmation may escalate severity when new evidence justifies it. It may not launder a stale claim into a new finding key to bypass the count of reconfirmations.
7. `nit` findings raised asynchronously are delivered as non-interrupting asides at the next step boundary, except at a terminal boundary, where they are held under the same protocol so that a completed answer is never chased by a stale nit about superseded work.

**Frozen-boundary exception.** Immediate delivery is allowed only at a synchronous frozen safe point: a boundary where the primary is stopped, its state is frozen, and no newer mutation can race the review. Configured stage boundaries with a catch-up wait, pre-mutation gates, and pre-terminal completion gates are the frozen safe points. At such a point the reviewed generation is by construction the current generation, so a `concern` or `critical` may be emitted directly with no hold cycle. The frozen boundary must be recorded on the review cycle; an emission claiming the exception without a recorded frozen boundary is invalid.

**Terminal catch-up timeout.** When the primary reaches a terminal boundary with an unreconfirmed `critical` held finding and the bounded catch-up budget expires, the finding may be shown as explicitly stale, unreconfirmed advice. It must be visibly labeled as raised against an earlier generation and not reconfirmed. It cannot restart the primary run, cannot fail it, cannot change its result, and cannot trigger a new turn. Lower-severity unreconfirmed findings remain suppressed at that boundary and stay held for a later reconfirmation opportunity.

BSD never interrupts, aborts, or auto-resumes the primary. When the user has stopped, paused, or cancelled the primary, an interrupting-severity finding is preserved as a visible card and re-enters context only when the user resumes; it never wakes a stopped run. This subordination to `Plans/Scheduling_and_Quota_Resume.md` precedence and to the user-Stop-is-authoritative rule is absolute.

## 9. Finding identity, deduplication, and closure

Every finding has a stable `finding_key` derived from the normalized finding family, the affected object references, the rule or constraint references, and an evidence fingerprint. Normalization lowercases, applies Unicode normalization, collapses runs of non-alphanumeric characters, and trims, so that trivially reworded restatements key identically.

Rules:

- A repeated finding at the same or lower severity for an unchanged key is suppressed with outcome `duplicate_suppressed`.
- A genuine escalation on the same key is allowed and recorded, and it emits once.
- A content-free note with no concrete reason (short affirmations, "looks fine", "nothing to add", bare "stop") is suppressed with outcome `content_free_suppressed` and does not consume the per-review emission budget.
- At most one accepted note is emitted per review cycle. Suppressed noise never consumes that budget.
- A finding that has been `closed` stays closed while its evidence fingerprint is unchanged, across restart and across advisor reset.
- A change in the evidence fingerprint may legitimately reopen a closed family as a new finding with a new key component; it is recorded as a reopen, not as a duplicate.
- Advisor self-compaction resets the advisor's in-context dedup history so a re-primed advisor may restate an issue against the rewritten context, but it does not reset durable closures. Durable closure is owner state, not advisor memory.
- Duplicate closure survives restart. Recovery reloads closed keys before the first post-restart review so a restart cannot resurrect an already-dismissed finding.

A finding may be cited by a Review workflow, an audit, or a certification record as input evidence with attribution to BSD. Citation never converts it into a reviewer vote or a gate result.

## 10. Read-only tool profile

The BSD tool profile is a fixed read-only grant identified by `read_only_tool_profile_id`. It permits:

- project and file search and read;
- grep and language-server diagnostics;
- diff and source-control inspection (read paths only);
- test and build output inspection;
- artifact, receipt, and Usage lookup through the owning surfaces;
- ordinary internal browser DOM, screenshot, console, and network inspection under browser policy;
- external documentation and research retrieval under the effective network and egress policy.

The profile forbids, without exception:

- any project write, edit, patch, or file creation;
- any mutating shell or process execution;
- installation, package provisioning, or MCP mutation;
- approval, permission, or policy mutation;
- credential read, write, or exfiltration;
- publish, deploy, merge, commit, tag, or push;
- protected `AuthBrowserSession` access of any kind;
- direct control of the primary run, including start, stop, pause, resume, retry, rewind, and queue manipulation.

The grant is not configurable upward. A configuration that names a mutating tool is rejected at binding time with the tool dropped and a recorded warning; it never falls back to granting the tool. An advisor turn that requests a tool outside the profile is quarantined before dispatch under §11 rather than merely denied, because a request for authority the advisor cannot have is evidence that the advisor turn itself is untrustworthy.

BSD inherits, and cannot widen, the effective permission posture of the primary run. Where the primary is denied a read, BSD is denied it too.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/MCP_Integration.md, ContractName:Plans/Source_Control_System.md

## 11. Catch-up, cooldown, quarantine, and failure isolation

**Catch-up.** `catch_up_seconds` is `0|15|30|60` with default `30`. A catch-up wait is a bounded delay of the primary at a configured frozen boundary, or when a `critical` held finding exists, so the advisor can converge. It is never a hard interrupt and never an abort. The wait is user-abortable, shows an honest notice naming why it is waiting, releases immediately when the advisor converges, and releases when the cap expires. There is no ordinary background catch-up delay when no critical held advice exists. `0` means the primary never waits.

**Cooldown.** After an emitted `concern` or `critical` steer, `interruption_cooldown_turns` (default `3`) primary turns pass before another interrupting-severity emission is routed the same way. During cooldown, later concerns are routed as non-interrupting asides at the next step boundary rather than being dropped, and `nit` routing is unchanged. Cooldown never discards a finding; it changes only its delivery channel and timing.

**Quarantine.** Unsafe advisor output is quarantined as a whole turn, including any advice inside it, before dispatch. Quarantine reasons are exactly `malformed_output`, `mutating_instruction`, `credential_exfiltration`, `instruction_override`, `unsafe_content`, and `tool_authority_violation`. The payload hash is recorded; the raw payload is retained only under the ordinary redaction and retention rules and never rendered in an advice surface. The first consecutive quarantine silently resets and re-primes the advisor with the latest pending input. A second consecutive quarantine emits exactly one deduplicated host warning, drops the affected input batch, and pauses BSD for the assignment. Any successful review resets the quarantine counter.

**Failure isolation.** Failure, timeout, model refusal, quota exhaustion, route loss, or provider unavailability records a terminal advisory outcome and the primary continues unchanged. The primary flow must never depend on BSD health. Specifically:

- a BSD failure never fails, restarts, retries, blocks, or pauses the primary run;
- a BSD failure never satisfies and never fails a mandatory reviewer, verifier, or certifier role;
- repeated retriable advisor request failures are bounded; the exhausted batch is dropped rather than retried forever;
- a quota-exhausted advisor pauses with its pending batch retained and shows one deduplicated status, and it resumes only through explicit reconfiguration, an explicit resume, a new session, or restart;
- pending catch-up waiters are released as soon as the advisor is known to be failing.

BSD health is `ready|degraded|unavailable|quota_exhausted|paused|disabled`. Review outcome is `silent|held|cleared|emitted|duplicate_suppressed|content_free_suppressed|failed|timed_out|quarantined`. `Off` requires a `no_call_off` record and forbids any provider attempt. Unknown cost stays unknown; it is never recorded as zero.

## 12. Reset, re-prime, and epoch fencing

An assignment resets and re-primes, incrementing `epoch` and rewinding `cursor`, on any of:

- primary compaction;
- branch, fork, or history replacement;
- rewind;
- thread replacement or session switch/resume;
- primary epoch replacement;
- project, repository, or worktree replacement;
- advisor model, account, or Persona change;
- advisor context-maintenance re-prime that the advisor's own context cannot absorb.

Reset clears the advisor's private transcript and in-context dedup history and rewinds the cursor so the next review replays the current bounded primary state instead of continuing from stale pre-rewrite context. Reset does not clear held findings and does not clear durable closures; held findings are re-presented to the re-primed advisor as the reconfirmation preamble, fenced by the new primary epoch.

When BSD is enabled mid-run, the cursor seeds to the current primary generation so the first review does not replay the entire prior conversation.

Epoch fencing is strict. A late callback, tool result, or model completion carrying a prior epoch is rejected and recorded; it cannot write a finding, clear a held finding, emit advice, or advance a cursor across epochs. A held finding raised in a prior primary epoch does not carry into a new epoch as current advice; it is closed with reason `epoch_replaced` unless the re-primed advisor independently re-raises it.

## 13. Workflow-stage coverage

BSD stage coverage is configurable as `inherit|off|auto|on` per stage. The stage set is exactly:

| Workflow kind | Stages |
|---|---|
| `assistant` | ordinary thread work attached to the active run |
| `prd_builder` | intake, discovery, synthesis, conflict resolution, final readiness |
| `planning_wizard` | intake, topic entry, research, draft, audit, integration, final pack, approval readiness |
| `deep_plan` | ledger session, question closure, synthesis |
| `planunit_compile` | scoped PlanUnit extraction, PlanUnit audit |
| `plan_compile` | Plan Compile |
| `worknode_generation` | WorkNode generation |
| `worknode_audit` | WorkNode audit, readiness |
| `worknode_execution` | execution, seam and package integration |
| `verification` | verification |
| `remediation` | remediation |
| `certification` | certification |

BSD is the only advisory option that may cover the hidden stages. Wonderer and Grill Me do not participate in hidden PlanUnit, WorkNode, audit, execution, or certification stages unless explicitly invoked as ordinary agents for a visible planning task.

Configuration is frozen at start. Exactly one configuration modal opens when BSD is explicitly selected as a start option for PRD Builder or Planning Wizard. It writes a `BSDWorkflowBinding` whose `stage_bindings` and requested/effective advisor identity are frozen for that run. A modal does not open at every stage; mid-run stage changes require an explicit reconfiguration action that creates a new binding revision and records the change, and they never retroactively rewrite the frozen identity of reviews already performed.

A stage that resolves to `Off` creates no assignment and no advisor context. A stage that resolves to `Auto` or `On` creates exactly one assignment per primary run and stage; double dispatch cannot create two assignments for the same stage.

## 14. Requested versus effective identity

BSD always discloses both the requested and the effective advisor identity. The requested identity is what the policy or binding asked for: `requested_model_id`, requested account, and `requested_persona_id`. The effective identity is what actually served the review after resolution, health checks, account availability, quota, and any explicitly permitted fallback.

Rules:

- when requested and effective differ, the difference is visible in Context Details and in Usage, with the reason;
- a fallback occurs only under an explicit policy that permits it and is always fully attributed; a silent substitution is a defect;
- when the requested model or Persona cannot be resolved at all, the assignment records `no_model` or `no_persona` and remains inactive rather than quietly borrowing the primary's route;
- the default Persona is the BSD advisor Persona (`critical_advisor`); a Persona never grants a tool, a permission, or an authority;
- changing the effective model, account, or Persona resets and re-primes the assignment under §12, because prior advisor reasoning was produced by a different reasoner.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Personas.md, ContractName:Plans/usage-feature.md

## 15. Project watch guidance

Project watch guidance is advisor-only review priority text: risks to watch, project traps, dangerous interfaces, architectural boundaries, and quality bars that are useful to a reviewer but too noisy for the primary executor. It is referenced by `project_watch_instructions_ref`.

Guidance is appended to the advisor prompt scope only. It is never injected into the primary agent's context, never behaves as a general project instruction file, and never grants a tool, a permission, or an authority. Guidance can raise what BSD looks for; it can never raise what BSD may do.

Resolution order places broader guidance first and narrower guidance last, so the most specific project scope sits closest to the review task. Guidance content is bounded; an oversized corpus is truncated with a recorded truncation notice rather than silently displacing the delta. Guidance is inert text to the advisor prompt: instructions inside it that attempt to grant tools, request mutation, override the severity ladder, or defeat the hold protocol are ignored and recorded, and an advisor turn that acts on such an instruction is quarantined under §11 with reason `instruction_override`.

Context Details discloses which guidance sources were resolved, in what order, and whether any were truncated, so a user can tell why BSD is emphasizing a particular class of finding.

## 16. Typed records

BSD owns six record families. Payload semantics are owned here; physical binding, keys, replay, retention, indexes, and projector checkpoints belong to `Plans/storage-plan.md`, and no storage key is invented here.

`pm.bsd.policy.v1` — project-scoped policy: `project_id`, `mode`, `model_selection`, `requested_model_id`, `requested_persona_id`, `trigger_sensitivity`, `read_only_tool_profile_id`, `catch_up_seconds`, `interruption_cooldown_turns`, `per_thread_cost_limit`, `per_stage_review_limit`, `retain_transcript`, `project_watch_instructions_ref`, `stage_defaults_ref`, `revision`.

`pm.bsd.workflow_binding.v1` — `binding_id`, `workflow_kind`, `workflow_id`, `policy_revision`, `stage_bindings`, `created_at`. Each stage binding is `inherit|off|auto|on` and freezes requested and effective advisor identity for the run.

`pm.bsd.assignment.v1` — `bsd_assignment_id`, `binding_id`, `stage_id`, `primary_run_id`, `advisor_attempt_id`, `epoch`, `cursor`, `stable_prefix_hash`, `requested_effective_snapshot_ref`, `state` in `idle|queued|reviewing|holding|reconfirming|paused_quota|failed|stopped`.

`pm.bsd.review_cycle.v1` — `review_cycle_id`, `bsd_assignment_id`, `trigger_kind`, `trigger_reason`, `primary_generation`, `input_manifest_ref`, `result`, `usage_attempt_ref`, `latency_ms`, `created_at`. The frozen-boundary flag and the no-call reason are carried on the cycle so §8 emissions and §4 suppressions are both auditable.

`pm.bsd.finding.v1` — `bsd_finding_id`, `finding_key`, `assignment_id`, `raised_against_generation`, `latest_checked_generation`, `severity`, `claim`, `affected_object_refs`, `rule_or_constraint_refs`, `evidence_refs`, `state` in `held|reconfirming|emitted|cleared|suppressed|closed`, `reconfirmation_count`, `closed_reason`, `created_at`, `updated_at`. Held state is stored outside the advisor transcript so compaction cannot erase it.

`pm.bsd.quarantine.v1` — `quarantine_id`, `assignment_id`, `review_cycle_id`, `reason`, `payload_hash`, `retained_payload_ref`, `reset_attempted`, `terminal_action` in `re_prime|pause_bsd`, `created_at`.

Restart restores held findings, closed keys, assignment epochs and cursors, quarantine counters, and policy/binding revisions. Absence of evidence is never recovered as success, and a nonterminal assignment that cannot be reconciled becomes `failed` with an explicit reason rather than silently `idle`.

ContractRef: ContractName:Plans/storage-plan.md, SchemaID:pm.bsd.policy.v1, SchemaID:pm.bsd.workflow_binding.v1, SchemaID:pm.bsd.assignment.v1, SchemaID:pm.bsd.review_cycle.v1, SchemaID:pm.bsd.finding.v1, SchemaID:pm.bsd.quarantine.v1

## 17. Exact commands and command ownership

### 17.1 `cmd.bsd.set` is a reuse and alias reconciliation, not a new registration

`cmd.bsd.set` **already exists in the repository command catalog.** `Plans/UI_Command_Catalog.md` and `Plans/Commands_System.md` already carry a `cmd.bsd.set` row typed `BackSeatDriverModeSetRequest{scope_kind, scope_id, requested_mode=Off,Auto,On, expected_policy_revision}` -> `BackSeatDriverModeSetResult`, with handler binding `handlers::back_seat_driver::set_mode`, wiring entry `catalog.bsd_set`, availability "scope writable and projection current", closed disabled reasons `stale_projection`, `already_in_state`, `policy_denied`, `permission_required`, and receipt/projection-only effects while its Event Authority remains open.

This owner therefore **reuses that exact command ID and its existing request and result contract names**. It does not register a second mode command and does not fork a parallel contract family. The design-handoff spellings `BSDModeSetRequest` and `BSDModeSetResult` are aliases of `BackSeatDriverModeSetRequest` and `BackSeatDriverModeSetResult` and must not be admitted as new contracts; the handler spelling `handlers::bsd::set_mode` is an alias of the already-bound `handlers::back_seat_driver::set_mode` and the existing binding wins. `cmd.back_seat_driver.mode.set` remains a stale alias with no current contract. Additional scope kinds and additional fields required by this owner (assignment scope, workflow-binding scope, stage scope) are additive extensions to the existing `BackSeatDriverModeSetRequest` under its existing catalog row, applied through the central catalog owner. `cmd.bsd.set` still cannot grant tools, mutation, protected Browser access, or authority.

### 17.2 Command table

| Command ID | Meaning | Required result boundary |
|---|---|---|
| `cmd.bsd.set` | Set BSD mode `Off\|Auto\|On` for an exact scope | Existing catalog row reused; returns `BackSeatDriverModeSetResult` with the durable effective-mode projection and revision. Mode change alone never grants a tool, permission, or authority, never starts a review, and never mutates a finding. |
| `cmd.bsd.configure` | Update `BSDPolicy` fields under an expected revision | Returns the new policy revision and the effective resolution of every changed field. Cannot widen the read-only tool profile; a mutating tool name is rejected, never granted. |
| `cmd.bsd.workflow.configure` | Create or revise a `BSDWorkflowBinding` and its stage bindings | Returns `binding_id` and frozen stage bindings plus frozen requested/effective identity. Does not retroactively rewrite reviews already performed under an earlier binding revision. |
| `cmd.bsd.assignment.pause` | Pause one assignment | Assignment stops queuing reviews; held findings and closures are retained. Primary run state is unchanged. |
| `cmd.bsd.assignment.resume` | Resume one paused assignment | Resumes review eligibility from the current cursor. Never resumes, restarts, or wakes the primary run. |
| `cmd.bsd.assignment.retry` | Retry after a failed, timed-out, or quarantined cycle | Creates one new review cycle under the current epoch. Cannot bypass the quarantine terminal action or re-run a dropped batch twice. |
| `cmd.bsd.assignment.stop` | Stop one assignment for the rest of the run | Terminal for the assignment; held findings close with a recorded reason. Primary run state is unchanged. |
| `cmd.bsd.finding.open` | Navigate to one finding's detail | Navigation only; opening a finding never emits, clears, closes, or reopens it. |
| `cmd.bsd.open_usage` | Navigate to the Usage view filtered to BSD attribution | Navigation only; no Usage record is created by navigating. |
| `cmd.bsd.open_transcript` | Navigate to the advisor's private transcript | Navigation only; subject to `retain_transcript` and to ordinary redaction. Returns an honest unavailable state when retention is off. |

Only `cmd.bsd.set` has an existing catalog row. `cmd.bsd.configure`, `cmd.bsd.workflow.configure`, `cmd.bsd.assignment.pause`, `cmd.bsd.assignment.resume`, `cmd.bsd.assignment.retry`, `cmd.bsd.assignment.stop`, `cmd.bsd.finding.open`, `cmd.bsd.open_usage`, and `cmd.bsd.open_transcript` are canonical owner requests that require central command-catalog registration, central event registration, and production wiring rows before they exist as dispatchable commands. Until that registration closes, the corresponding GUI controls remain disabled with `command_not_registered`, and no page-local handler, alias, or fixture may simulate success. The trigger evaluator, hold and reconfirm transitions, and the window/eligibility interactions described in §4, §8, and §11 are internal service behavior with no user-facing command ID; they must not be given one to make a surface look wired.

## 18. Typed request, result, and error enumerations

Every BSD request carries `schema_id`, `schema_version`, command ID, command instance ID, `project_id`, the exact scope identity (`policy`, `workflow_binding`, `assignment`, or `finding` with its ID), expected revision or expected epoch, actor, permission snapshot, idempotency key, source surface, and return route. Stale projections cannot dispatch.

Requests:

- `BackSeatDriverModeSetRequest` — `scope_kind`, `scope_id`, `requested_mode`, `expected_policy_revision`.
- `BSDPolicyUpdateRequest` — changed policy fields plus `expected_policy_revision`.
- `BSDWorkflowBindingRequest` — `workflow_kind`, `workflow_id`, stage binding list, requested advisor identity, `expected_policy_revision`.
- `BSDAssignmentControlRequest` — `bsd_assignment_id`, `control` in `pause|resume|stop`, `expected_epoch`.
- `BSDAssignmentRetryRequest` — `bsd_assignment_id`, `review_cycle_id`, `expected_epoch`.
- `BSDFindingRoute`, `BSDUsageRoute`, `BSDTranscriptRoute` — navigation-only routes carrying the target identity and the return route.

Results fix `primary_run_mutated: false` and `authority_granted: false` on every path, return the exact resulting revision or epoch, and carry a projection reference. Navigation wrappers return `RouteResult` with an explicit no-persist receipt. A duplicate idempotency binding returns the original result; the same key with a different binding is rejected.

Typed errors are exactly `invalid_request`, `project_not_found`, `bsd_policy_not_found`, `bsd_binding_not_found`, `bsd_assignment_not_found`, `bsd_finding_not_found`, `stale_policy_revision`, `stale_epoch`, `stale_projection`, `already_in_state`, `mode_off_no_assignment`, `tool_profile_widening_rejected`, `quarantine_terminal_pause`, `advisor_model_unavailable`, `advisor_persona_unavailable`, `quota_unavailable`, `resource_refused`, `permission_required`, `policy_denied`, `command_not_registered`, `owner_unavailable`, or `cancelled`. A failure remains a failure: it never emits a success-shaped receipt, never advances an assignment state, and never converts a held finding into a delivered one.

## 19. Events

The required semantic event names are `bsd.policy_changed`, `bsd.workflow_binding_created`, `bsd.assignment_started`, `bsd.assignment_paused`, `bsd.assignment_resumed`, `bsd.assignment_stopped`, `bsd.review_started`, `bsd.finding_held`, `bsd.finding_reconfirmed`, `bsd.finding_cleared`, `bsd.advice_emitted`, `bsd.finding_suppressed`, `bsd.review_failed`, `bsd.review_timed_out`, and `bsd.output_quarantined`.

These names require central EventRecord registration and payload schema adjudication before emission. Until that registration closes, BSD writes receipts and projections only and records `missing_event_registration`; it must not emit an unregistered EventRecord and must not present a receipt as an event. Event envelopes carry project identity, assignment and binding identity, policy revision, epoch, primary generation, actor, correlation and causation, idempotency, and redacted source references. No event payload contains secrets, unredacted artifact bodies, or protected-authentication content.

## 20. GUI projection

Assistant Chat owns the shell, chrome, and placement; this document owns what those surfaces are allowed to say.

**Wand.** The wand carries BSD `Off`, `Auto`, `On` check state plus `Configure`. Check state renders the owner projection of effective mode; it is not a local checkbox. `Configure` opens the BSD configuration surface.

**Advice presentation.** Silent, duplicate-suppressed, content-free-suppressed, and cleared evaluations create no transcript noise at all. An emitted finding appears as an attributable BSD advice card or inline advisory placed near the relevant working activity or at the safe boundary that produced it. Held findings appear only in Context Details and the BSD detail surface, optionally as a small held count; they are never rendered as confirmed warnings. Unreconfirmed terminal `critical` advice is explicitly labeled stale and unreconfirmed, with the generation it was raised against.

**Compact Context menu.** One BSD row shows mode, advisor identity, health or catch-up state, and time since the last check, for example a first line reading `BSD    Auto · Critical Advisor` and a second reading `Caught up · checked 18s ago`. Its states are `Off`, `Idle`, `Reviewing`, `Catching up`, `Finding held`, `Advice delivered`, `Quota paused`, `Failed`, and `Unavailable`. Copy must be truthful: `Caught up` requires an actually converged cursor, and `checked` requires a real completed review.

**Context Details.** A BSD section reuses the existing context and detail card grammar and existing Raw redaction rules. It shows assignment and stage identity, trigger kind and reason, cursor and epoch, requested and effective model and account, Persona, resolved tool profile, held/cleared/emitted/suppressed finding counts and detail, advisor context and compaction state, cost, token, and latency facts, quota, failure, and quarantine state, and the resolved project watch guidance sources.

**Usage page.** A BSD purpose filter and BSD widgets and rows are added through the Usage widget system without altering the accepted Usage layout.

Motion, focus, keyboard parity, and theme behavior follow the existing Chat and FinalGUISpec rules; BSD introduces no new interaction grammar. Every BSD control renders disabled with the exact owner reason when its command is not registered, its scope is not writable, or its projection is stale.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md

## 21. Usage attribution

BSD Usage attribution is distinct. Usage records BSD as its own purpose and never folds BSD consumption into primary-agent totals without expandable child attribution.

BSD attribution covers, per assignment and per stage: calls attempted, no-calls with their typed suppression reason, held, cleared, emitted, and suppressed findings, duplicates, timeouts, failures, quarantines, quota pauses, catch-up delay incurred, cost, tokens, latency, and the requested and effective model and account. Unknown cost remains unknown rather than zero. `Off` produces a no-call record and never a fabricated attempt or cost.

Usage remains the owner of `UsageRecord` storage, rollups, quota truth, and reset semantics. This document owns only the BSD attribution requirements that Usage must be able to represent.

ContractRef: ContractName:Plans/usage-feature.md

## 22. Settings boundary

Settings owns the defaults; this owner owns the operational records. Settings stores and renders `assistant.bsd.mode` (enum `off|auto|on`, default `auto`), `assistant.bsd.model` (dynamic enum, default `default`), `assistant.bsd.persona` (dynamic enum, default `critical_advisor`), `assistant.bsd.trigger_sensitivity` (enum, default `balanced`), `assistant.bsd.catch_up_seconds` (enum `0|15|30|60`, default `30`), `assistant.bsd.cooldown_turns` (integer, default `3`), `assistant.bsd.retain_transcript` (bool, default `true`), and `assistant.bsd.self_compact_threshold` (number, default `0.8`), under a BSD manager in the Settings shell.

Back Seat Driver stores the actual `BSDPolicy` revision, workflow bindings, assignments, review cycles, findings, and quarantines, and it computes effective resolution. A Settings value is an input to resolution, never the effective truth of a running assignment: an assignment's frozen binding continues to govern that run after a Settings change, and the change applies to the next binding. Settings must not store assignment state, finding state, or health, and this owner must not create a parallel preference store.

BSD Settings appear in their own manager, not in the Multi-Agent Workflows manager, because BSD is not a collaborative workflow.

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/settings_inventory.json

## 23. Owner and consumer map

| Concern | Owner | BSD relationship |
|---|---|---|
| Generic resource admission, `ObservableWork` | `Plans/Shared_Integration_Runtime.md` §8 | BSD requests admission for advisor work and honors refusal; it does not compute admission. |
| Leases, outbox, cursor replay, dispatch admission | `Plans/Shared_Integration_Runtime.md` §6, §7, §9, §11 | Consumer only. |
| Model, account, route identity and fallback | Models and Multi-Account owners | Consumer; discloses requested versus effective. |
| Persona catalog and definition | Personas | Consumer; a Persona never grants BSD authority. |
| Permissions and approvals | `Plans/Permissions_System.md` | BSD inherits and cannot widen; it never requests or grants approval. |
| Context materialization and redaction | `Plans/Prompt_Pipeline.md` | BSD consumes materialized, redacted input and records the redaction receipt. |
| Usage records, quota truth, reset facts | `Plans/usage-feature.md` | BSD supplies attribution; Usage owns totals and quota truth. |
| Scheduling, windows, quota resume, manual precedence | `Plans/Scheduling_and_Quota_Resume.md` | BSD is subordinate: it never resumes, schedules, or overrides a paused primary. |
| Goal objective and lifecycle | `Plans/Goal_Runtime_System.md` | BSD reads the objective by reference; it never edits, completes, or blocks a Goal. |
| Assistant Plan, Deep Plan ledger, scoped PlanUnits, To-Dos | Assistant Plan Runtime, Planning Ledger, Plan Document System, To-Do Runtime | Read-only reference consumer. |
| Crew, BrainStorm, Review, Chat Room | Collaborative Workflows owner | Orthogonal; BSD is not a participant and not a workflow kind there. |
| PRD Builder and Planning Wizard stage flow | PRD Builder, Planning Wizard | They expose BSD as a start option and host its stage rows; this owner defines the binding semantics. |
| Plan Compile, WorkNode generation, audit, execution, verification, certification | Plan-to-node and testing owners | They expose BSD stage coverage; BSD never satisfies a required gate. |
| Chat shell, wand, Context menu, Context Details placement | `Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md` | They own placement and chrome; this owner owns truthful content. |
| Storage keys, replay, retention, migration | `Plans/storage-plan.md` | Owner of physical binding; this document owns payload semantics only. |

## 24. Migration and supersession

BSD semantics previously lived, partially, in `Plans/Shared_Integration_Runtime.md` §13 and its `SIR-010` PlanUnit. This document supersedes that section as the semantic owner of Back Seat Driver. Shared Integration Runtime remains the owner of generic resource admission, `ObservableWork`, leases, outbox, cursor replay, and provider dispatch admission, and BSD remains a consumer of all of those. The integrator must reduce Shared Integration Runtime §13 to a consumer pointer at this document and rewrite `SIR-010` so that its BSD clause references this owner rather than restating it; until that reconciliation lands, this document is authoritative wherever the two disagree about BSD.

The following prior statements are compatible and preserved: modes `Off|Auto|On` with `Auto` as the effective default and recommended value; an explicitly stored `Off` is never migrated to `Auto`; each assignment has an independent assignment identity, cursor, stable prefix, route, Usage lineage, quota, and health; input is a bounded delta plus typed references; duplicate advice is suppressed by digest; BSD cannot block primary work; BSD has no access to `AuthBrowserSession`, secrets, unredacted artifacts, mutation tools, approval controls, or hidden memory; every attempt including silent and suppressed advice is recorded; unknown cost remains unknown.

The following prior statements are extended by this document and must be read through it: the advisory outcome vocabulary now distinguishes `held`, `cleared`, and `content_free_suppressed`; the health vocabulary adds `paused`; the severity vocabulary is fixed at `nit|concern|critical` with `blocker` retired from every public surface; and hold-and-reconfirm, quarantine, epoch fencing, stage bindings, and project watch guidance are new obligations with no prior text.

Research-lineage severity `blocker` maps to `critical` on import. Legacy advisory records without a `finding_key` are recomputed on first read; where the affected object or evidence cannot be reconstructed, the record is retained as historical lineage and is not resurrected as a live finding. Legacy records without an epoch are assigned epoch zero and are fenced out of every current assignment. No migration re-runs a review, re-emits historical advice, or converts a historical advisory outcome into a current finding.

## 25. Verification

Structural verification validates every record family and its enumerations, the mode resolution ladder including the `Off`-is-never-migrated rule, the complete Auto trigger matrix, the no-call reason vocabulary, severity closure with `blocker` absent from every public surface and payload, the finding key derivation and its normalization, dedup and closure survival across restart, held-finding survival across advisor self-compaction, epoch fencing of late callbacks, quarantine reason closure and its one-re-prime-then-pause terminal rule, the read-only tool profile with a negative fixture for every forbidden capability, the `cmd.bsd.set` alias reconciliation against the existing catalog row, disabled behavior with `command_not_registered` for every unregistered command, and disabled event emission with `missing_event_registration` while Event Authority is open.

Behavioral verification covers: `Off` producing zero model calls and no fabricated Usage; Auto non-trigger producing a typed no-call suppression; each Auto trigger kind exercised; `On` reviewing eligible deltas within policy with silence producing no card; bounded delta with no full transcript resend and a correct cursor and stable prefix; an asynchronous concern held rather than delivered; newer work that fixes a concern cleared by reconfirmation silence; a surviving concern emitted once with current evidence; a legitimate escalation to critical; a duplicate suppressed by stable key; a synchronous frozen-boundary finding delivered immediately; a terminal timeout labeling an unreconfirmed critical as stale with the primary result unchanged; user Stop preventing any BSD-driven resume; cooldown preventing repeated interrupting steers; mutation, install, and approval attempts denied and quarantined; unsafe output quarantined whole with one re-prime then pause; compaction resetting the cursor while held findings survive; fork and rewind producing a new epoch that rejects stale callbacks; provider and quota failure leaving the primary running with one deduplicated status; the PRD and Wizard configuration modal opening once and freezing stage rows; hidden-stage assignments across PlanUnit, WorkNode, audit, execution, and certification; BSD never satisfying or failing a required reviewer, verifier, or certifier role; truthful compact Context state; complete Context Details identity, cursor, findings, context, and failure data; and distinct Usage attempts, no-calls, held, cleared, emitted, cost, and stage attribution.

Static validation is not runtime registration, persistence, GUI, event, wiring, or buildability proof. A fixture-backed concept interaction is not proof of a registered native command, handler, provider call, or persisted receipt, and it must never be recorded as such. Implementation-ready status additionally requires that the BSD command, event, storage, and wiring authority in §17, §19, and §16 is closed rather than left open.

## 26. Plan Units

### BSD-001 - Passive Read-Only Advisor Owner Boundary

```yaml
plan_unit_id: BSD-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  Back Seat Driver is a separate passive read-only advisor attached to another run or stage, and this document is its sole
  semantic owner for policy, bindings, assignments, review cycles, findings, quarantine, tool profile, catch-up, cooldown,
  reset, identity disclosure, project watch guidance, and projections. BSD is not part of the Multi-Agent Workflows manager
  and must never be modelled, configured, stored, or presented as a collaborative workflow with participants, a composer
  destination, votes, or shared artifacts. BSD never authorizes, mutates, certifies, approves, merges, publishes, or
  substitutes for a required review, verification, or test; it can neither satisfy nor fail a mandatory reviewer, verifier,
  or certifier role, and a BSD finding cited by Review or audit remains input evidence and never a reviewer vote.
gui_related: true
gui_classification_reason: BSD mode, advice cards, Context rows, and Usage attribution are user-visible surfaces.
depends_on: []
unblocks:
  - BSD-002
  - BSD-016
acceptance_criteria:
  - BSD appears in its own Settings manager and never in the Multi-Agent Workflows manager.
  - No BSD record carries participant, composer-destination, vote, or shared-artifact fields.
  - A required reviewer, verifier, or certifier gate cannot be satisfied or failed by any BSD outcome.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - BSD required-reviewer-boundary negative fixtures
risk_class: advisory_authority_widening
reasoning_tier: high
context_scope: bsd_owner_boundary
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_owner_boundary
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-001
preserved_exact_tokens:
  - "Back Seat Driver"
  - "read-only"
  - "not part of Multi-Agent Workflows"
negative_constraints:
  - Do not model BSD as a collaborative workflow kind.
  - Do not let a BSD finding count as a reviewer vote or certification signal.
  - Do not give BSD mutation, approval, or certification authority under any mode.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-002 - Modes And Auto Default Resolution

```yaml
plan_unit_id: BSD-002
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  BSD modes are exactly Off, Auto, and On, with Auto the product default and the recommended value. Off performs no advisor
  call and records only a no_call_off outcome with no provider attempt and no fabricated Usage. Auto evaluates on the
  deterministic trigger matrix. On evaluates every eligible bounded update within cost, quota, and resource policy and
  changes frequency only, never tools, authority, or the suppression bar. Effective mode resolves from stage binding, then
  workflow binding, then project policy, then Auto, recording the deciding level; a missing or invalid stored value resolves
  to Auto with a recorded reason while an explicitly stored Off is a deliberate user choice that is never migrated. Mode is
  durable owner state and every surface renders the owner projection rather than a local checkbox.
gui_related: true
gui_classification_reason: The wand and Context surfaces render mode check state directly from this resolution.
depends_on:
  - BSD-001
unblocks:
  - BSD-003
acceptance_criteria:
  - Off produces zero model calls, zero provider attempts, and a no_call_off record.
  - Absent or invalid stored mode resolves to Auto with a recorded resolution reason.
  - Stored Off is never rewritten to Auto by any migration or default pass.
  - On changes evaluation frequency only and grants no additional tool or authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - BSD mode resolution and Off-no-call fixtures
risk_class: bsd_mode_default_drift
reasoning_tier: high
context_scope: bsd_mode_policy
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_mode_policy
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-002
preserved_exact_tokens:
  - "Off"
  - "Auto"
  - "On"
  - "no_call_off"
negative_constraints:
  - Do not migrate an explicit stored Off to Auto.
  - Do not treat a local checkbox as mode truth.
  - Do not record a Usage attempt for a mode that made no call.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-003 - Deterministic Trigger Matrix And Suppression Accounting

```yaml
plan_unit_id: BSD-003
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  Auto evaluates only on the closed trigger set pre_first_material_mutation, pre_high_risk_action, constraint_divergence,
  repeated_normalized_failure, environment_identity_change, major_verification_failure, pre_terminal_completion_claim,
  configured_stage_boundary, project_watch_rule, and held_finding_reconfirmation. Trigger sensitivity conservative, balanced,
  or frequent may only narrow or widen the elastic triggers and can never disable the high-risk, terminal-claim, or
  reconfirmation triggers. Every evaluation decision including the decision not to call is recorded with a typed reason from
  no_call_off, no_call_no_trigger, no_call_no_material_delta, no_call_cooldown, no_call_cost_limit, no_call_stage_limit,
  no_call_quota_unavailable, no_call_resource_refused, and no_call_paused, and a refused resource admission is never
  converted into local best effort or a fabricated silent-clean result.
gui_related: true
gui_classification_reason: No-call reasons and trigger kinds are shown in Context Details and Usage.
depends_on:
  - BSD-002
unblocks:
  - BSD-006
acceptance_criteria:
  - Every listed trigger kind is exercised and distinguishable in records.
  - Sensitivity cannot suppress pre_high_risk_action, pre_terminal_completion_claim, or held_finding_reconfirmation.
  - A non-triggering Auto turn records a typed no-call reason rather than nothing.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - BSD trigger matrix and no-call reason fixtures
risk_class: bsd_trigger_invention
reasoning_tier: high
context_scope: bsd_trigger_policy
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_trigger_policy
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-003
preserved_exact_tokens:
  - "conservative"
  - "balanced"
  - "frequent"
negative_constraints:
  - Do not invent a surface-local trigger outside the closed set.
  - Do not convert a refused admission into best-effort local review.
  - Do not omit the no-call record when Auto declines to evaluate.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-004 - Isolated Advisor Session And Self-Compaction

```yaml
plan_unit_id: BSD-004
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  Every BSD assignment owns an isolated advisor session with its own context window and message history, its own tool session
  bound to the read-only profile, its own cursor and stable prefix hash, its own epoch, its own private transcript, its own
  Usage lineage, and its own requested and effective model, account, and Persona. It shares no file snapshots, seen-line
  tracking, conflict state, or summary cache with the primary. Advisor context grows by appended bounded deltas so a stable
  prefix remains cacheable; when advisor context crosses the configured self-compaction threshold the advisor clears its
  private history and replays the current input fresh, a mid-stream overflow replays once into a fresh context, and a fresh
  replay that still overflows terminates that review as failed rather than retrying without bound. Advice already injected is
  excluded from the next delta so the advisor cannot review its own advice.
gui_related: true
gui_classification_reason: Advisor context, compaction state, transcript access, and identity are shown in Context Details.
depends_on:
  - BSD-001
unblocks:
  - BSD-005
  - BSD-014
acceptance_criteria:
  - Advisor context, tools, transcript, and Usage are disjoint from the primary's.
  - Self-compaction clears advisor history without clearing held findings or durable closures.
  - A fresh replay that still overflows fails the review once with no unbounded retry.
  - Previously injected advice never appears in a later advisor delta.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - advisor isolation and self-compaction fixtures
risk_class: advisor_context_bleed
reasoning_tier: high
context_scope: bsd_advisor_session
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_advisor_session
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-004
preserved_exact_tokens:
  - "cursor"
  - "stable_prefix_hash"
  - "epoch"
negative_constraints:
  - Do not share the primary agent's tool session or file snapshots with the advisor.
  - Do not rewrite earlier advisor context on each review and destroy the stable prefix.
  - Do not let the advisor review its own emitted advice.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-005 - Bounded Redacted Delta Input

```yaml
plan_unit_id: BSD-005
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  BSD input is a bounded primary delta since the assignment cursor plus typed references to current user constraints, the
  Goal objective and revision, the approved Plan version and hash, scoped PlanUnits, current To-Dos, observed mutations and
  evidence, a runtime snapshot of provider, model, account, project, repository, worktree, and permission posture, the stage
  identity and trigger, the redaction receipt, the held-finding reconfirmation preamble, and resolved project watch guidance.
  The full primary transcript is never resent, secrets and unredacted artifacts and protected authentication content are
  never included, injected primary constraint context is passed verbatim rather than summarized with duplicates collapsed,
  and the manifest never expands folders recursively or materializes attachment bodies the Prompt Pipeline did not already
  materialize for the primary.
gui_related: false
gui_classification_reason: Input manifest composition is a runtime contract; only its summary appears in Context Details.
depends_on:
  - BSD-004
unblocks:
  - BSD-006
acceptance_criteria:
  - Reviews resend only the delta since the cursor, with correct cursor and stable prefix.
  - Every input manifest carries a redaction receipt before reaching the advisor route.
  - Constraint context appears verbatim and deduplicated, never summarized.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - bounded-delta and redaction-receipt fixtures
risk_class: advisor_input_unbounded_or_unredacted
reasoning_tier: high
context_scope: bsd_input_manifest
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_input_manifest
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-005
preserved_exact_tokens:
  - "bounded delta"
  - "redaction receipt"
negative_constraints:
  - Do not resend the full primary transcript on each review.
  - Do not summarize an injected constraint block.
  - Do not include secrets, unredacted artifacts, or protected authentication content.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-006 - Held And Reconfirmed Asynchronous Advice

```yaml
plan_unit_id: BSD-006
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  A new asynchronous concern or critical finding is held rather than emitted, recorded against raised_against_generation in
  state held outside the advisor model transcript so compaction cannot erase it. The next review receives the held finding as
  an explicit reconfirmation preamble alongside newer primary activity and must decide against the newer state: re-raising
  moves the finding to emitted with latest_checked_generation set and with current evidence cited, while advisor silence
  clears it. Reconfirmation may escalate severity on worse evidence but may not lower severity to escape the protocol and may
  not re-key a stale claim to reset the reconfirmation count. An asynchronous nit is delivered as a non-interrupting aside at
  the next step boundary except at a terminal boundary, where it is held under the same protocol. A stale asynchronous
  warning is never emitted as current advice.
gui_related: true
gui_classification_reason: Held findings appear only in details while emitted findings appear as attributable advice cards.
depends_on:
  - BSD-003
  - BSD-005
unblocks:
  - BSD-007
  - BSD-008
acceptance_criteria:
  - An asynchronous concern is held and not delivered on first raise.
  - Newer work that fixes the concern clears it through reconfirmation silence.
  - A surviving concern emits once, citing evidence from the reconfirmed generation.
  - A severity downgrade cannot convert a held finding into an immediate delivery.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - hold, clear, re-raise, and escalation fixtures
risk_class: stale_advice_emitted_as_current
reasoning_tier: high
context_scope: bsd_hold_reconfirm
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_hold_reconfirm
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-006
preserved_exact_tokens:
  - "held"
  - "reconfirmed"
  - "raised_against_generation"
  - "latest_checked_generation"
negative_constraints:
  - Do not emit an unreconfirmed asynchronous concern or critical as current advice.
  - Do not clear a held finding on anything other than reconfirmation silence or an explicit closure rule.
  - Do not lower severity to bypass the hold protocol.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-007 - Frozen Safe Point Immediate Delivery Exception

```yaml
plan_unit_id: BSD-007
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  Immediate delivery of a concern or critical is allowed only at a synchronous frozen safe point where the primary is stopped,
  its state is frozen, and no newer mutation can race the review, so the reviewed generation is by construction the current
  generation. Configured stage boundaries with a catch-up wait, pre-mutation gates, and pre-terminal completion gates are the
  frozen safe points. The frozen boundary is recorded on the review cycle, and an emission claiming the exception without a
  recorded frozen boundary is invalid and is rejected as a hold-protocol violation.
gui_related: true
gui_classification_reason: Frozen-boundary advice is the only advice that may appear immediately as a current finding.
depends_on:
  - BSD-006
unblocks: []
acceptance_criteria:
  - A synchronous frozen-boundary review may emit a current finding immediately.
  - Every immediate emission carries a recorded frozen-boundary flag on its review cycle.
  - An immediate emission without a recorded frozen boundary is rejected.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - frozen-boundary emission and negative fixtures
risk_class: false_frozen_boundary_claim
reasoning_tier: high
context_scope: bsd_frozen_boundary
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_frozen_boundary
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-007
preserved_exact_tokens:
  - "frozen safe point"
negative_constraints:
  - Do not claim a frozen boundary for an asynchronous review.
  - Do not treat an ordinary idle moment as a frozen safe point.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-008 - Terminal Catch-Up Timeout And Stale Labeling

```yaml
plan_unit_id: BSD-008
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  When the primary reaches a terminal boundary with an unreconfirmed critical held finding and the bounded catch-up budget
  expires, that finding may be shown only as explicitly stale, unreconfirmed advice labeled with the generation it was raised
  against. It cannot restart, fail, retry, or alter the primary result and cannot trigger a new turn. Unreconfirmed findings
  below critical remain suppressed at that boundary and stay held for a later reconfirmation opportunity. BSD never
  interrupts, aborts, or auto-resumes the primary, and while the user has stopped, paused, or cancelled the run an
  interrupting-severity finding is preserved as a visible card that re-enters context only when the user resumes.
gui_related: true
gui_classification_reason: The stale, unreconfirmed label is an explicit user-visible qualifier on terminal advice.
depends_on:
  - BSD-006
unblocks: []
acceptance_criteria:
  - Terminal timeout labels an unreconfirmed critical as stale and unreconfirmed.
  - The primary result, state, and turn count are unchanged by the terminal timeout.
  - Sub-critical unreconfirmed findings remain suppressed and stay held.
  - A user Stop prevents any BSD-driven resume or new turn.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - terminal timeout and user-stop suppression fixtures
risk_class: advisor_restarts_or_alters_primary
reasoning_tier: high
context_scope: bsd_terminal_boundary
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_terminal_boundary
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-008
  - pm-assistant-implementation-2026-09-02-recovered:BSD-013
preserved_exact_tokens:
  - "stale"
  - "unreconfirmed"
negative_constraints:
  - Do not restart or fail the primary because of a BSD timeout.
  - Do not present unreconfirmed terminal advice without the stale label.
  - Do not wake a stopped run to deliver advice.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-009 - Severity Vocabulary Without A Public Blocker

```yaml
plan_unit_id: BSD-009
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  BSD severity is exactly nit, concern, and critical. A nit is a low-stakes observation, a concern is material risk such as a
  likely wrong direction, a missing constraint, or a fabricated interface, and a critical means continuing would clearly waste
  substantial work or produce broken, unsafe, or non-compliant output. The public vocabulary deliberately excludes blocker
  because BSD has no blocking authority, so blocker must not appear in any record, payload, projection, copy, or Usage row.
  Severity may escalate from nit to concern to critical on genuinely worse evidence and may not be lowered to escape the hold
  protocol. Research lineage that used blocker maps to critical on import and is never surfaced under the old name.
gui_related: true
gui_classification_reason: Severity labels appear on advice cards, detail rows, and Usage breakdowns.
depends_on:
  - BSD-001
unblocks:
  - BSD-010
acceptance_criteria:
  - Only nit, concern, and critical validate as severities.
  - No surface, payload, or record contains a public blocker severity.
  - Escalation is recorded and a protocol-evading downgrade is rejected.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - severity closure and blocker-absence fixtures
risk_class: severity_vocabulary_drift
reasoning_tier: standard
context_scope: bsd_severity
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_severity
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-009
preserved_exact_tokens:
  - "nit"
  - "concern"
  - "critical"
negative_constraints:
  - Do not use a public blocker severity anywhere in the product.
  - Do not imply blocking authority through severity naming or copy.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-010 - Finding Identity Deduplication And Durable Closure

```yaml
plan_unit_id: BSD-010
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  Every finding carries a stable finding_key derived from the normalized finding family, affected object references, rule or
  constraint references, and an evidence fingerprint, with normalization that lowercases, normalizes Unicode, collapses runs
  of non-alphanumeric characters, and trims so reworded restatements key identically. A repeated finding at the same or lower
  severity for an unchanged key is duplicate_suppressed, a genuine escalation is allowed and emits once, a content-free note
  with no concrete reason is content_free_suppressed and does not consume the budget, and at most one accepted note is emitted
  per review cycle. A closed finding stays closed while its evidence fingerprint is unchanged across restart and advisor
  reset, changed evidence may reopen the family as a recorded reopen, and advisor self-compaction clears in-context dedup
  history without clearing durable closure.
gui_related: true
gui_classification_reason: Suppression and closure determine whether the user ever sees a card for a finding.
depends_on:
  - BSD-009
unblocks: []
acceptance_criteria:
  - A duplicate finding is suppressed by stable key rather than re-emitted.
  - Durable closure survives restart and advisor reset.
  - Content-free notes are suppressed without consuming the per-cycle emission budget.
  - At most one accepted note is emitted per review cycle.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - dedup, closure survival, and content-free suppression fixtures
risk_class: duplicate_or_resurrected_advice
reasoning_tier: high
context_scope: bsd_finding_identity
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_finding_identity
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-010
preserved_exact_tokens:
  - "finding_key"
  - "duplicate_suppressed"
  - "content_free_suppressed"
negative_constraints:
  - Do not resurrect a closed finding whose evidence is unchanged.
  - Do not let advisor compaction clear durable closures.
  - Do not emit more than one accepted note per review cycle.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-011 - Read-Only Tool Profile And Forbidden Authority

```yaml
plan_unit_id: BSD-011
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  The BSD tool profile permits project and file search and read, grep and language-server diagnostics, diff and source-control
  read inspection, test and build output inspection, artifact receipt and Usage lookup, ordinary internal browser DOM,
  screenshot, console, and network inspection under browser policy, and external documentation and research retrieval under
  the effective network policy. It forbids project writes, mutating shell, installation or MCP mutation, approval or
  permission mutation, credential access, publish, deploy, merge, commit, tag, or push, any protected AuthBrowserSession
  access, and direct control of the primary run including start, stop, pause, resume, retry, rewind, and queue manipulation.
  The grant is not configurable upward: a configuration naming a mutating tool is rejected with the tool dropped and a
  recorded warning, and an advisor turn requesting a tool outside the profile is quarantined before dispatch. BSD inherits and
  cannot widen the primary run's effective permission posture.
gui_related: true
gui_classification_reason: The resolved tool profile and any rejected grant are shown in Context Details.
depends_on:
  - BSD-004
unblocks:
  - BSD-012
acceptance_criteria:
  - Every forbidden capability has a negative fixture proving denial.
  - A configuration naming a mutating tool drops it with a warning and never grants it.
  - An out-of-profile tool request is quarantined before dispatch rather than merely denied.
  - BSD cannot read anything the primary run is denied.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tool profile negative fixtures and protected-session denial fixtures
risk_class: advisor_tool_authority_widening
reasoning_tier: high
context_scope: bsd_tool_profile
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_tool_profile
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-011
preserved_exact_tokens:
  - "read-only tool profile"
  - "AuthBrowserSession"
negative_constraints:
  - Do not grant a mutating tool to BSD under any configuration.
  - Do not give BSD access to protected authentication browser sessions.
  - Do not let BSD control the primary run directly.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-012 - Unsafe Output Quarantine And Bounded Re-Prime

```yaml
plan_unit_id: BSD-012
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  Unsafe advisor output is quarantined as a whole turn including any advice inside it, before dispatch, with reason exactly
  malformed_output, mutating_instruction, credential_exfiltration, instruction_override, unsafe_content, or
  tool_authority_violation. The payload hash is recorded, any retained payload follows ordinary redaction and retention, and
  quarantined content is never rendered in an advice surface. The first consecutive quarantine silently resets and re-primes
  the advisor with the latest pending input; the second consecutive quarantine emits exactly one deduplicated warning, drops
  the affected batch, and pauses BSD for that assignment. Any successful review resets the quarantine counter.
gui_related: true
gui_classification_reason: Quarantine state, the single deduplicated warning, and the paused state are user-visible.
depends_on:
  - BSD-011
unblocks: []
acceptance_criteria:
  - The entire unsafe turn is discarded before dispatch, including its advice.
  - One re-prime is allowed and the second consecutive quarantine pauses BSD.
  - Exactly one deduplicated warning is shown, and no quarantined content is rendered.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - quarantine reason closure and re-prime-then-pause fixtures
risk_class: unsafe_advisor_output_delivered
reasoning_tier: high
context_scope: bsd_quarantine
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_quarantine
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-012
preserved_exact_tokens:
  - "quarantined"
  - "re_prime"
  - "pause_bsd"
negative_constraints:
  - Do not salvage advice out of a quarantined turn.
  - Do not re-prime more than once consecutively before pausing.
  - Do not render quarantined payload content in an advice surface.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-013 - Failure Isolation From The Primary Run

```yaml
plan_unit_id: BSD-013
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  BSD failure, timeout, model refusal, quota exhaustion, route loss, or unavailability records a terminal advisory outcome
  while the primary run continues unchanged; the primary flow must never depend on BSD health. A BSD failure never fails,
  restarts, retries, blocks, or pauses the primary, and never satisfies or fails a mandatory reviewer, verifier, or certifier
  role. Retriable advisor request failures are bounded and the exhausted batch is dropped rather than retried indefinitely, a
  quota-exhausted advisor pauses with its pending batch retained and shows one deduplicated status until explicit
  reconfiguration, resume, a new session, or restart, and catch-up waiters are released as soon as the advisor is known to be
  failing. Health is ready, degraded, unavailable, quota_exhausted, paused, or disabled, review outcome is silent, held,
  cleared, emitted, duplicate_suppressed, content_free_suppressed, failed, timed_out, or quarantined, and unknown cost remains
  unknown rather than zero.
gui_related: true
gui_classification_reason: Health, failure, and quota-paused states render in the compact Context row and Context Details.
depends_on:
  - BSD-001
unblocks: []
acceptance_criteria:
  - A provider or quota failure leaves the primary running with exactly one deduplicated status.
  - No BSD outcome satisfies or fails a required reviewer, verifier, or certifier role.
  - Catch-up waiters release immediately when the advisor is failing.
  - Unknown cost is recorded as unknown and never as zero.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - failure isolation and health vocabulary fixtures
risk_class: primary_blocked_by_advisor_failure
reasoning_tier: high
context_scope: bsd_failure_isolation
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_failure_isolation
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-013
preserved_exact_tokens:
  - "quota_exhausted"
  - "timed_out"
negative_constraints:
  - Do not make any primary path conditional on BSD health.
  - Do not retry an advisor request without bound.
  - Do not record unknown cost as zero.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-014 - Reset Re-Prime And Epoch Fencing

```yaml
plan_unit_id: BSD-014
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  An assignment resets and re-primes, incrementing epoch and rewinding cursor, on primary compaction, branch or fork or
  history replacement, rewind, thread replacement or session switch or resume, primary epoch replacement, project or
  repository or worktree replacement, advisor model or account or Persona change, and advisor context-maintenance re-prime.
  Reset clears the advisor's private transcript and in-context dedup history so the next review replays current bounded
  primary state, but never clears held findings or durable closures, which are re-presented to the re-primed advisor fenced by
  the new primary epoch. Enabling BSD mid-run seeds the cursor to the current primary generation. Late callbacks, tool
  results, or completions carrying a prior epoch are rejected and recorded and cannot write a finding, clear a held finding,
  emit advice, or advance a cursor; a held finding from a replaced epoch closes with reason epoch_replaced unless the
  re-primed advisor independently re-raises it.
gui_related: true
gui_classification_reason: Cursor, epoch, and compaction state are displayed in Context Details.
depends_on:
  - BSD-004
unblocks: []
acceptance_criteria:
  - Compaction resets the cursor and re-primes while held findings survive.
  - Fork or rewind produces a new epoch and stale callbacks are rejected.
  - Enabling mid-run seeds the cursor without replaying the whole prior conversation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - compaction, fork, rewind, and stale-callback fixtures
risk_class: cross_epoch_advisor_write
reasoning_tier: high
context_scope: bsd_reset_epoch
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_reset_epoch
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-014
preserved_exact_tokens:
  - "epoch_replaced"
negative_constraints:
  - Do not accept a prior-epoch callback as a current result.
  - Do not clear held findings or durable closures on reset.
  - Do not replay the entire prior conversation when enabled mid-run.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-015 - Bounded Catch-Up And Interruption Cooldown

```yaml
plan_unit_id: BSD-015
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  Catch-up seconds are exactly 0, 15, 30, or 60 with default 30. A catch-up wait is a bounded, user-abortable delay of the
  primary at a configured frozen boundary or while a critical held finding exists; it is never a hard interrupt or abort,
  shows an honest notice naming its reason, releases immediately when the advisor converges or is failing, and releases when
  the cap expires. There is no ordinary background catch-up delay when no critical held advice exists, and zero means the
  primary never waits. After an emitted concern or critical steer, the configured interruption cooldown of three primary turns
  by default routes later interrupting-severity findings as non-interrupting asides at the next step boundary rather than
  discarding them, and nit routing is unchanged; cooldown changes delivery channel and timing only and never discards a
  finding.
gui_related: true
gui_classification_reason: The catch-up notice and the caught-up state are visible in the compact Context row.
depends_on:
  - BSD-006
unblocks: []
acceptance_criteria:
  - Catch-up accepts only 0, 15, 30, and 60 and defaults to 30.
  - No repeated interrupting steer occurs during the configured cooldown turns.
  - A cooled-down finding is rerouted as an aside rather than dropped.
  - A catch-up wait is abortable and never becomes a hard interrupt.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - catch-up bound and cooldown routing fixtures
risk_class: advisor_stalls_or_spams_primary
reasoning_tier: standard
context_scope: bsd_catchup_cooldown
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_catchup_cooldown
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-015
preserved_exact_tokens:
  - "catch_up_seconds"
  - "interruption_cooldown_turns"
negative_constraints:
  - Do not turn a catch-up wait into an abort or hard interrupt.
  - Do not delay the primary in the background when no critical advice is held.
  - Do not discard a finding because of cooldown.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-016 - Stage Coverage Across Visible And Hidden Workflows

```yaml
plan_unit_id: BSD-016
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  BSD stage coverage is configurable as inherit, off, auto, or on for the workflow kinds assistant, prd_builder,
  planning_wizard, deep_plan, planunit_compile, plan_compile, worknode_generation, worknode_audit, worknode_execution,
  verification, remediation, and certification, including the PRD intake, discovery, synthesis, conflict, and final readiness
  stages and the Planning Wizard intake, topic entry, research, draft, audit, integration, final pack, and approval readiness
  stages. BSD is the only advisory option that may cover the hidden PlanUnit, WorkNode, audit, execution, verification,
  remediation, and certification stages; Wonderer and Grill Me do not, unless explicitly invoked as ordinary agents for a
  visible planning task. A stage resolving to off creates no assignment and no advisor context, and a stage resolving to auto
  or on creates exactly one assignment per primary run and stage with double dispatch unable to create a second.
gui_related: true
gui_classification_reason: Stage rows are user-configurable in the PRD Builder and Planning Wizard start surfaces.
depends_on:
  - BSD-002
unblocks:
  - BSD-017
acceptance_criteria:
  - Every listed workflow kind and stage accepts inherit, off, auto, and on.
  - Hidden PlanUnit, WorkNode, audit, execution, and certification assignments are exercised.
  - A stage resolving to off creates no assignment and no advisor context.
  - Double dispatch cannot create two assignments for one run and stage.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - stage coverage and idempotent assignment fixtures
risk_class: stage_coverage_gap_or_duplicate_assignment
reasoning_tier: high
context_scope: bsd_stage_coverage
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_stage_coverage
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-016
preserved_exact_tokens:
  - "inherit"
  - "planunit_compile"
  - "worknode_execution"
  - "certification"
negative_constraints:
  - Do not create an idle assignment for a stage resolved to off.
  - Do not let Wonderer or Grill Me cover hidden stages in BSD's place.
  - Do not create two assignments for the same run and stage.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-017 - Single Start Modal And Frozen Stage Bindings

```yaml
plan_unit_id: BSD-017
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  Exactly one BSD configuration modal opens when BSD is explicitly selected as a start option for PRD Builder or Planning
  Wizard, and it writes a BSDWorkflowBinding whose stage bindings and requested and effective advisor identity are frozen for
  that run. A modal does not open at every stage. A mid-run stage change requires an explicit reconfiguration that creates a
  new binding revision and records the change, and it never retroactively rewrites the frozen identity of reviews already
  performed under an earlier revision.
gui_related: true
gui_classification_reason: The start modal, its stage rows, and the frozen summary are direct user-facing controls.
depends_on:
  - BSD-016
unblocks: []
acceptance_criteria:
  - Selecting BSD at PRD or Wizard start opens the configuration modal exactly once.
  - Stage rows and advisor identity are frozen into a binding revision for that run.
  - Reconfiguration creates a new revision without rewriting completed reviews.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - start modal and binding revision fixtures
risk_class: repeated_modal_or_retroactive_binding_rewrite
reasoning_tier: standard
context_scope: bsd_workflow_binding
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_workflow_binding
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-017
preserved_exact_tokens:
  - "BSDWorkflowBinding"
  - "stage_bindings"
negative_constraints:
  - Do not open a configuration modal at every stage.
  - Do not retroactively rewrite the frozen identity of completed reviews.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-018 - Truthful Compact Context And Context Details Projection

```yaml
plan_unit_id: BSD-018
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  The compact Context menu shows one BSD row with mode, advisor identity, health or catch-up state, and time since the last
  check, across the states Off, Idle, Reviewing, Catching up, Finding held, Advice delivered, Quota paused, Failed, and
  Unavailable, with copy that is truthful so that caught-up requires a converged cursor and checked requires a completed
  review. Context Details adds a BSD section reusing existing context and detail card grammar and existing Raw redaction
  rules, showing assignment and stage identity, trigger kind and reason, cursor and epoch, requested and effective model and
  account, Persona, resolved tool profile, held, cleared, emitted, and suppressed findings, advisor context and compaction
  state, cost, token, and latency facts, quota, failure, and quarantine state, and resolved project watch guidance sources.
  Silent, duplicate, content-free, and cleared evaluations create no transcript noise, emitted advice appears as an
  attributable card near the relevant activity, and held findings appear only in details and never as confirmed warnings.
gui_related: true
gui_classification_reason: This unit defines the visible BSD rows, cards, states, and detail fields.
depends_on:
  - BSD-006
  - BSD-013
unblocks: []
acceptance_criteria:
  - Compact Context reports mode, health, and last-check truthfully with no fabricated caught-up state.
  - Context Details exposes identity, cursor, epoch, findings, context, failure, and watch-guidance data.
  - Held findings never render as confirmed warnings in the transcript.
  - Silent and suppressed evaluations produce no transcript output.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - compact Context and Context Details projection fixtures
risk_class: fabricated_advisor_status
reasoning_tier: high
context_scope: bsd_context_projection
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_context_projection
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-018
preserved_exact_tokens:
  - "Caught up"
  - "Finding held"
  - "Quota paused"
negative_constraints:
  - Do not display caught-up without a converged cursor.
  - Do not render a held finding as a confirmed warning.
  - Do not create transcript noise for silent or suppressed evaluations.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-019 - Distinct BSD Usage Attribution

```yaml
plan_unit_id: BSD-019
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  Usage records BSD as its own purpose with distinct attribution and never folds BSD consumption into primary-agent totals
  without expandable child attribution. BSD attribution covers, per assignment and per stage, calls attempted, no-calls with
  their typed suppression reason, held, cleared, emitted, and suppressed findings, duplicates, timeouts, failures,
  quarantines, quota pauses, catch-up delay incurred, cost, tokens, latency, and the requested and effective model and
  account. Unknown cost remains unknown rather than zero, and Off produces a no-call record rather than a fabricated attempt
  or cost. Usage remains the owner of UsageRecord storage, rollups, quota truth, and reset semantics; BSD supplies only the
  attribution these projections must be able to represent, added through the Usage widget system without altering the
  accepted Usage layout.
gui_related: true
gui_classification_reason: The Usage page gains a BSD purpose filter plus BSD widgets and rows.
depends_on:
  - BSD-013
unblocks: []
acceptance_criteria:
  - Usage distinguishes BSD attempts, no-calls, held, cleared, emitted, suppressed, cost, and stage.
  - BSD totals never merge into primary-agent totals without expandable child attribution.
  - Off records a no-call and never a fabricated attempt or cost.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Usage attribution and no-call accounting fixtures
risk_class: usage_attribution_collapse
reasoning_tier: high
context_scope: bsd_usage_attribution
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_usage_attribution
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-019
preserved_exact_tokens:
  - "no-call"
  - "catch-up delay"
negative_constraints:
  - Do not fold BSD cost into primary totals without child attribution.
  - Do not fabricate a Usage attempt for a suppressed or Off evaluation.
  - Do not alter the accepted Usage layout beyond supported widget content.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-020 - Command Event Storage And Wiring Closure

```yaml
plan_unit_id: BSD-020
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  BSD exposes the exact command IDs cmd.bsd.set, cmd.bsd.configure, cmd.bsd.workflow.configure, cmd.bsd.assignment.pause,
  cmd.bsd.assignment.resume, cmd.bsd.assignment.retry, cmd.bsd.assignment.stop, cmd.bsd.finding.open, cmd.bsd.open_usage, and
  cmd.bsd.open_transcript, each carrying schema identity, project and scope identity, expected revision or epoch, actor,
  permission snapshot, idempotency key, source surface, and return route, and each fixing primary_run_mutated false and
  authority_granted false on every result path. Semantic events are bsd.policy_changed, bsd.workflow_binding_created,
  bsd.assignment_started, bsd.assignment_paused, bsd.assignment_resumed, bsd.assignment_stopped, bsd.review_started,
  bsd.finding_held, bsd.finding_reconfirmed, bsd.finding_cleared, bsd.advice_emitted, bsd.finding_suppressed,
  bsd.review_failed, bsd.review_timed_out, and bsd.output_quarantined. Apart from the pre-existing cmd.bsd.set catalog row,
  these require central command catalog registration, central EventRecord registration, and production wiring before they
  exist; until then controls remain disabled with command_not_registered and effects are receipt and projection only with
  missing_event_registration recorded, and internal trigger, hold, and reconfirm transitions receive no user-facing command ID.
gui_related: true
gui_classification_reason: Every listed command backs a visible control whose disabled reason must be exact.
depends_on:
  - BSD-001
unblocks: []
acceptance_criteria:
  - Unregistered BSD commands render disabled with command_not_registered and no simulated success.
  - No unregistered EventRecord is emitted; receipts record missing_event_registration.
  - Every result path fixes primary_run_mutated false and authority_granted false.
  - Internal trigger and reconfirm transitions expose no command ID.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - command registration and event authority negative fixtures
risk_class: fabricated_command_or_event_registration
reasoning_tier: high
context_scope: bsd_command_event_closure
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_command_event_closure
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-020
preserved_exact_tokens:
  - "command_not_registered"
  - "missing_event_registration"
negative_constraints:
  - Do not claim a native handler, dispatcher, or receipt exists.
  - Do not emit an unregistered EventRecord.
  - Do not simulate command success with a page-local handler or alias.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-021 - Reuse And Alias Reconciliation For cmd.bsd.set

```yaml
plan_unit_id: BSD-021
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  cmd.bsd.set already exists in the repository command catalog with the request and result contract names
  BackSeatDriverModeSetRequest and BackSeatDriverModeSetResult, the handler binding handlers::back_seat_driver::set_mode, the
  wiring entry catalog.bsd_set, availability requiring a writable scope and current projection, and the closed disabled
  reasons stale_projection, already_in_state, policy_denied, and permission_required. This owner reuses that exact ID and
  those exact contract names as a reuse and alias reconciliation rather than a fresh registration: the design-handoff
  spellings BSDModeSetRequest and BSDModeSetResult are aliases that must not be admitted as new contracts, the spelling
  handlers::bsd::set_mode is an alias of the already-bound handler, and cmd.back_seat_driver.mode.set remains a stale alias
  with no current contract. Additional scope kinds and fields are additive extensions to the existing catalog row applied
  through the central catalog owner, and cmd.bsd.set still cannot grant tools, mutation, protected Browser access, or
  authority.
gui_related: true
gui_classification_reason: The wand and Context mode controls dispatch this exact existing command.
depends_on:
  - BSD-020
unblocks: []
acceptance_criteria:
  - No second mode command or parallel contract family is registered for BSD mode.
  - Alias spellings resolve to the existing contract and handler names.
  - New scope kinds are additive extensions of the existing catalog row.
  - Setting mode grants no tool, permission, or authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - command alias reconciliation fixtures
risk_class: duplicate_command_registration
reasoning_tier: high
context_scope: bsd_command_reuse
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_command_reuse
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-002
  - pm-assistant-implementation-2026-09-02-recovered:BSD-020
preserved_exact_tokens:
  - "cmd.bsd.set"
  - "BackSeatDriverModeSetRequest"
  - "BackSeatDriverModeSetResult"
  - "handlers::back_seat_driver::set_mode"
  - "catalog.bsd_set"
negative_constraints:
  - Do not register a second BSD mode command.
  - Do not admit BSDModeSetRequest or BSDModeSetResult as new contracts.
  - Do not rebind the existing handler to an alias spelling.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-022 - Requested Versus Effective Advisor Identity Disclosure

```yaml
plan_unit_id: BSD-022
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  BSD always discloses both the requested advisor identity, meaning requested model, account, and Persona, and the effective
  identity that actually served the review after resolution, health, availability, quota, and any explicitly permitted
  fallback. Any difference is visible in Context Details and Usage with its reason, a fallback occurs only under an explicit
  policy and is fully attributed, and a silent substitution is a defect. When the requested model or Persona cannot be
  resolved the assignment records no_model or no_persona and remains inactive rather than borrowing the primary's route, the
  default Persona is the BSD advisor Persona which never grants a tool, permission, or authority, and a change of effective
  model, account, or Persona resets and re-primes the assignment because prior reasoning came from a different reasoner.
gui_related: true
gui_classification_reason: Requested and effective identity rows appear in Context Details and Usage.
depends_on:
  - BSD-004
  - BSD-014
acceptance_criteria:
  - Requested and effective identity are both recorded and shown, with the reason for any difference.
  - An unresolvable requested model or Persona leaves the assignment inactive rather than silently rerouted.
  - Changing effective identity resets and re-primes the assignment.
unblocks: []
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - requested versus effective disclosure fixtures
risk_class: silent_advisor_route_substitution
reasoning_tier: high
context_scope: bsd_identity_disclosure
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_identity_disclosure
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-004
  - pm-assistant-implementation-2026-09-02-recovered:BSD-018
preserved_exact_tokens:
  - "requested"
  - "effective"
  - "critical_advisor"
negative_constraints:
  - Do not silently substitute an advisor model, account, or Persona.
  - Do not let a Persona grant a tool or authority.
  - Do not borrow the primary's route when the requested advisor route is unresolvable.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-023 - Project Watch Guidance Scope And Inertness

```yaml
plan_unit_id: BSD-023
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  Project watch guidance is advisor-only review-priority text referenced by project_watch_instructions_ref and appended to the
  advisor prompt scope only. It is never injected into the primary agent's context, never behaves as a general project
  instruction file, and never grants a tool, permission, or authority: guidance may raise what BSD looks for and may never
  raise what BSD may do. Resolution places broader guidance first and narrower guidance last so the most specific scope sits
  closest to the review task, content is bounded with any truncation recorded rather than silently displacing the delta, and
  instructions inside guidance that attempt to grant tools, request mutation, override the severity ladder, or defeat the hold
  protocol are ignored and recorded while an advisor turn acting on them is quarantined with reason instruction_override.
  Context Details discloses which guidance sources were resolved, in what order, and whether any were truncated.
gui_related: true
gui_classification_reason: Resolved guidance sources and truncation are shown in Context Details.
depends_on:
  - BSD-011
  - BSD-012
unblocks: []
acceptance_criteria:
  - Guidance reaches only the advisor prompt scope and never the primary context.
  - Guidance cannot widen the tool profile, severity ladder, or hold protocol.
  - Resolution order and truncation are recorded and disclosed.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - watch guidance scoping, ordering, and injection-resistance fixtures
risk_class: guidance_privilege_escalation
reasoning_tier: high
context_scope: bsd_project_watch
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_project_watch
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-016
  - pm-assistant-implementation-2026-09-02-recovered:BSD-011
preserved_exact_tokens:
  - "project_watch_instructions_ref"
  - "instruction_override"
negative_constraints:
  - Do not inject watch guidance into the primary agent's context.
  - Do not let guidance text widen tools, severity, or delivery rules.
  - Do not silently truncate guidance without recording it.
owner_hints:
  - Plans/Back_Seat_Driver.md
```

### BSD-024 - Record Families Recovery And Shared Runtime Supersession

```yaml
plan_unit_id: BSD-024
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: >-
  Back Seat Driver owns the payload semantics of pm.bsd.policy.v1, pm.bsd.workflow_binding.v1, pm.bsd.assignment.v1,
  pm.bsd.review_cycle.v1, pm.bsd.finding.v1, and pm.bsd.quarantine.v1, while physical binding, keys, replay, retention,
  indexes, and projector checkpoints remain with the storage owner and no storage key is invented here. Restart restores held
  findings, closed keys, assignment epochs and cursors, quarantine counters, and policy and binding revisions; absence of
  evidence is never recovered as success and an unreconcilable nonterminal assignment becomes failed with an explicit reason.
  This document supersedes Shared_Integration_Runtime section 13 as the semantic owner of BSD while Shared Integration Runtime
  remains owner of generic resource admission, ObservableWork, leases, outbox, cursor replay, and provider dispatch admission,
  which BSD consumes; the integrator must reduce that section to a consumer pointer and rewrite its BSD PlanUnit clause to
  reference this owner, and until then this document is authoritative wherever the two disagree about BSD. Research-lineage
  blocker severity maps to critical on import, legacy advisory records without a finding key are recomputed or retained as
  historical lineage rather than resurrected as live findings, and legacy records without an epoch are fenced out of every
  current assignment.
gui_related: false
gui_classification_reason: Record semantics, recovery, and owner supersession are runtime and governance contracts.
depends_on:
  - BSD-001
  - BSD-010
  - BSD-014
unblocks: []
acceptance_criteria:
  - All six record families validate with their enumerations closed.
  - Restart restores held findings, closures, epochs, cursors, and quarantine counters.
  - No BSD storage key or event is invented outside its central owner.
  - Imported blocker severity resolves to critical and never appears publicly.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - restart recovery and legacy import fixtures
risk_class: bsd_record_or_owner_collision
reasoning_tier: high
context_scope: bsd_records_migration
implementation_surfaces:
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: bsd_records_migration
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BSD-020
  - pm-assistant-implementation-2026-09-02-recovered:BSD-001
preserved_exact_tokens:
  - "pm.bsd.policy.v1"
  - "pm.bsd.finding.v1"
  - "pm.bsd.quarantine.v1"
negative_constraints:
  - Do not invent BSD storage keys or event registrations in this document.
  - Do not resurrect a legacy advisory record as a live finding.
  - Do not duplicate BSD semantics in Shared Integration Runtime after reconciliation.
owner_hints:
  - Plans/Back_Seat_Driver.md
  - Plans/Shared_Integration_Runtime.md
```

## Additive Correction v4 — BSD Modal Commit Boundary (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`MODAL-002`, `MODAL-015`) to this
owner. Everything else about BSD is preserved unchanged: Off/Auto/On plus Configure, read-only
advice, OMP isolation and OMP-like held and reconfirmed advice, the Auto triggers, the stage
bindings across PRD Builder, Planning Wizard, PlanUnit, WorkNode, audit, execution and
certification, failure isolation, its Settings, its compact Context row and Context Details, and
its distinct Usage attribution.

### MODAL-015 — Selecting BSD is not starting BSD

Choosing BSD inside a PRD Builder or Planning Wizard start flow records the choice in that
workflow's launch draft. It creates **no** advisor assignment, **no** stage binding, **no**
provider attempt, and **no** Usage record until the owning workflow's Start is committed.

Cancelling the owning workflow leaves no BSD assignment and no BSD Usage. A configuration
checkbox alone never starts an advisor call, and BSD's own Configure modal follows the same rule:
opening or editing it creates local draft state only.

Once the owning Start commits, BSD's existing admission, isolation, and attribution rules apply
unchanged, and its Usage stays attributed separately from the main run.

## Working Notebook Boundary Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. BSD's isolation is unchanged by the Working Notebook and context-transition work: BSD keeps its own advisor context window, cursor, epoch, bounded deltas, self-compaction, and held/reconfirmed findings; it does not become the notebook manager, a main-run transition authority, or a verification/completion gate, and it never writes or arbitrates notebook content. Primary-run fresh-window transitions and notebook checkpoints follow their own owners; where a primary transition triggers a BSD reset, the existing §12 reset/re-prime and epoch-fencing rules apply verbatim (held findings survive, late prior-epoch callbacks are rejected). BSD advisor model calls keep their existing separate Usage lineage (UF-100), and no recursive advice ingestion occurs.

```yaml
plan_unit_id: BSD-025
unit_type: requirement
status: accepted
owner_doc: Plans/Back_Seat_Driver.md
canonical_text: BSD retains its isolated advisor session, cursor, epoch, bounded deltas, self-compaction, and held/reconfirmed findings under the Working Notebook work. BSD is not the notebook manager, not a main-run transition authority, and not a verification or completion gate; primary transitions follow their own owners and a primary-triggered BSD reset follows the existing §12 epoch-fencing rules with held findings preserved. BSD advisor usage stays separately attributed, and no recursive advice ingestion exists.
gui_related: false
gui_classification_reason: BSD isolation is runtime behavior, not GUI work.
depends_on: [BSD-024, PP-084]
unblocks: []
acceptance_criteria:
  - Held findings and epoch/cursor semantics stay coherent across primary context changes.
  - BSD never promotes itself to transition authority or a verification gate.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: authority_drift
reasoning_tier: standard
context_scope: advisor_runtime
implementation_surfaces: [Plans/Back_Seat_Driver.md, Plans/Prompt_Pipeline.md, Plans/usage-feature.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I08
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A45
preserved_exact_tokens: ["held findings", "epoch", "not a verification gate"]
negative_constraints:
  - Do not make BSD the notebook manager or transition authority.
  - Do not ingest BSD advice recursively into notebooks as evidence.
owner_hints: [Plans/Back_Seat_Driver.md]
```

ContractRef: ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md
