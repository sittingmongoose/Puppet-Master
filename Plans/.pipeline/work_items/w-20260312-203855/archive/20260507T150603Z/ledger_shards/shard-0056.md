  - recovery actions still leak unstable UI labels (`deny`, `manual fix`, `abort node`) even though HITL/runtime docs are closer to a canonical `allowed_action_ids[]` family.
  - Contribute(PR) vs DAE isolation is now a three-way collision between PR branch ownership, worktree/jail isolation, and provider execution context.
  - `yolo` is still overstated as approval-free even though non-bypassable step-7 guards remain in force.
- Gate-registry integrity is still behind the runtime model:
  - duplicated addenda are now part of a wider append-only correction pattern in adjacent wizard/interview docs.
  - `GATE-007` / `GATE-008` are still missing from the registry with no tombstone/reserved handling.
  - GATE-012 still collapses `attention_required` and true wizard `blocked` escalation into one evidence path.
  - `attention_required` still lacks a durable persisted shape parallel to `blocked_notice`, so the gate’s evidence expectations remain only partially machine-verifiable.
- `newtools.md` and assistant-memory still add net-new owner failures even after Sonnet:
  - preview/build/open-artifact orchestrator command IDs are still exact uncataloged gaps.
  - doctor-check naming drift is now clearly multi-way, not a single alias mismatch.
  - `CustomHeadlessTool` still lacks stable tool identity, registration timing, permission semantics, and consistent config-file ownership.
  - `live.*` and memory auto-trigger/handoff event families still have no canonical contracts/storage registration.
  - handoff naming and thread collision behavior remain unowned across Assistant, HITL, and project-switch flows.

### Impacted docs
- Primary owners:
  - `Plans/Commands_System.md`
  - `Plans/Wiring_Matrix.md`
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Project_Output_Artifacts.md`
  - `Plans/Glossary.md`
  - `Plans/FileManager.md`
  - `Plans/Crosswalk.md`
  - `Plans/Decision_Policy.md`
  - `Plans/Run_Modes.md`
  - `Plans/Progression_Gates.md`
  - `Plans/newtools.md`
  - `Plans/assistant-memory-subsystem.md`
- Repeated cross-owner dependencies sharpened by this pass:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Executor_Protocol.md`
  - `Plans/WorktreeGitImprovement.md`
  - `Plans/Multi-Account.md`
  - `Plans/Media_Generation_and_Capabilities.md`
  - `STATE_FILES.md`

### Contradictions / gaps surfaced
- Owner docs still describe runtime-era actions and records that require stricter registration/verification/routing machinery than the current catalog/matrix/gate stack can express.
- Project/artifact/file surfaces still cannot reliably route by `project_id`, `attempt_id`, or generated/runtime subject identity even though neighboring docs now depend on those pivots.
- Glossary/Crosswalk are still failing at the basic job of defining terms and routing primitives, which keeps making downstream conflicts harder to adjudicate.
- Runtime governance remains split across policy/executor/storage/HITL/page docs, so multiple implementations could still satisfy different local texts while disagreeing materially.
- The append-only addendum pattern is itself now a risk signal: several high-value owner docs still preserve stale canonical text instead of fully reconciling it.

### Candidate fixes to carry forward
- Continue the same owner-doc tranche through later models because GPT-5.4 is still finding real new contradictions, especially around routing/registry/governance ownership.
- Reconcile command ownership around one enforceable registry boundary:
  - slash-command reservation,
  - command execution seam for User Commands,
  - runtime vs overlay mode semantics,
  - reverse-coverage enforcement for all normative `cmd.*` references.
- Extend wiring/gate schemas so runtime-era checks become machine-verifiable:
  - preconditions, freshness, mutation risk, deprecation/tombstone status, reverse coverage, and dispatcher obligations.
- Promote `project_id`, `attempt_id`, generated/runtime identity routing, and artifact/evidence join fields to first-class owners in the artifact/file/storage docs.
- Repair structural owner docs before downstream reconciliation relies on them:
  - Glossary term ownership,
  - Crosswalk routing/index integrity,
  - gate-registry completeness and duplicate-section cleanup.
- Give startup recovery, counter ceilings/backoff, DAE/jail lifecycle, and attention/blocked escalation one authoritative owner each instead of leaving them to cross-doc inference.

### Do-not-forget details
- GPT-5.4 did not flatten out; it is still adding precision beyond Sonnet, especially where the owner docs themselves remain structurally weak.
- Highest-signal docs for continuing into GPT-5.2 remain:
  - `Plans/Commands_System.md`
  - `Plans/Wiring_Matrix.md`
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Project_Output_Artifacts.md`
  - `Plans/FileManager.md`
  - `Plans/Crosswalk.md`
  - `Plans/Decision_Policy.md`
  - `Plans/Run_Modes.md`
  - `Plans/Progression_Gates.md`
  - `Plans/newtools.md`
  - `Plans/assistant-memory-subsystem.md`
  - with `Plans/Glossary.md` still important because term ownership is blocking multiple downstream seams.

## Research Progress - 2026-03-16 - GPT-5.2 owner-doc tranche synthesis

### Targeted docs read
- `Plans/Commands_System.md`
- `Plans/Wiring_Matrix.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/Glossary.md`
- `Plans/FileManager.md`
- `Plans/Crosswalk.md`
- `Plans/Decision_Policy.md`
- `Plans/Run_Modes.md`
- `Plans/Progression_Gates.md`
- `Plans/newtools.md`
- `Plans/assistant-memory-subsystem.md`

### Key findings
- GPT-5.2 still surfaced real owner-level deltas rather than mere restatement, especially where docs are failing mechanically rather than conceptually.
- Command/event registry drift sharpened further:
  - the `cmd.chat.run_user_command` seam is still missing, but GPT-5.2 also exposed that chat event naming itself is forked across owner docs (`chat.thread.created` vs `chat.thread_created`) and that phantom `chat.message.submitted` sits inside a broader canonical-event mismatch.
  - `/mode` is still unresolved, but GPT-5.2 made the payload ambiguity more concrete by showing it now collides across chat-overlay mode, runtime run mode, and User Command frontmatter.
  - reserved-name policy remains split across command-system, chat-design, and command-catalog owners with no single enforceable boundary.
- Wiring / verification traps became more mechanical:
  - superseded command IDs still remain visible as plain `cmd.*` tokens inside the catalog, which can poison regex-style coverage extraction.
  - Wiring Matrix example/evidence strings also contain `cmd.*.json` filename fragments that can poison naive ID extraction separately from real command rows.
  - wildcard command-family requirements in Wiring Matrix still cannot be represented by `Wiring_Matrix.schema.json` as written.
  - Final GUI still requires side-panel targets like `Unraid` that the current canonical `cmd.panel.switch` payload cannot express.
- UI wiring / dispatcher obligations gained sharper concrete gaps:
  - dispatcher still lacks an explicit runtime rule that `cmd.runtime.*` recovery actions must be admitted only when the current blocked episode exposes the corresponding ordered `allowed_action_ids[]`.
  - `correlation_id` still lacks an explicit trace-through requirement into persisted dispatch/domain events.
  - stale-projection safety still has no canonical revalidation handshake even though GUI docs already promise disable-with-reason behavior.
- Project artifact / file-management gaps continued to deepen:
  - `validation_pass_report` still conflicts with workflow-required `skipped`, but GPT-5.2 also pinned missing `auto_fixes_applied[]`, a Pass-1 scope contradiction around requirements creation, and unresolved `workflow_run_id` vs canonical `run_id` identity.
  - `project_id` omission is now clearly a determinism problem in app-global seglog mode because artifact events cannot be partitioned safely by project otherwise.
  - `OpenFile { path }` is now unambiguously workspace-root-only, proving that generated/runtime opens need a separate open-by-identity router.
  - attempt-scoped evidence remains blocked not just by missing filters but by storage/UI keying that is still tier/node-centric instead of attempt-centric.
- Glossary / Crosswalk still produced concrete ownership failures:
  - `Overseer` remains a dead SSOT pointer, but GPT-5.2 also showed Glossary is already using runtime nouns like “attempt” indirectly without owning them.
  - `effective state` is still too broad relative to requested/effective execution identity.
  - `handoff` and `promotion` are now visibly polysemous across stream, UI, memory, and evidence docs.
  - Crosswalk’s `References`-then-more-content pattern is mirrored in adjacent owner docs like `GitHub_Integration.md`, reinforcing that append-after-references drift is systemic, not isolated.
  - missing primitive routing is now sharper: `Seglog`, `ArtifactStore`, PR/issues surface ownership, and capability-gating ownership all still lack clean Crosswalk routing.
- Runtime-governance ownership sharpened further:
  - startup recovery still lacks a single owner, but GPT-5.2 also exposed that the governance UX wants a stable `blocked_owner` field that the canonical blocked projection schema still does not define.
  - counter-family ownership is clearer, but backoff shape remains unowned and policy still needs to bind ceilings to canonical stored counters, not generic “attempts.”
  - Contribute(PR) vs DAE is now better framed as branch-ownership vs isolated-execution-substrate, while DAE jail lifecycle across pause/resume/restart remains unowned.
  - `yolo` still overpromises approval freedom even though non-bypassable step-7 guards survive, and `external_publish_side_effect` remains impossible to enforce safely in DAE without pre-dispatch interception or forced host execution.
- Gate/evidence integrity still is not caught up to the runtime model:
  - `run-gates` currently enforces plan-shard freshness, but Progression_Gates does not admit that as part of its gate inventory/status model.
  - `pm.evidence.schema.v1` still cannot encode the tri-state or machine-readable arrays that GATE-011/GATE-012 now demand.
  - GATE-012 still collapses `attention_required` and true `blocked` escalation in its evidence path.
- `newtools.md` and assistant-memory continued to add final-pass-worthy signal:
  - the missing orchestrator command set now includes `cmd.orchestrator.push_image` in addition to preview/build/open-artifact IDs.
  - `CustomHeadlessTool` still has no stable registry/permission/config owner and now also conflicts with `STATE_FILES.md` over config-file naming and missing GUI-automation state paths.
  - assistant-memory still has no clear owner for whether `memory.gist.*` is a seglog event family or merely a redb-side mutation signal.
  - AutoMilestone/project-switch handoff still require observable events/commands that the owner docs do not register.
  - `attention_required` remains canonical in chat design but non-durable in storage, and Dashboard/Assistant handoff CtAs still lack canonical `cmd.*` IDs.

### Impacted docs
- Primary owners:
  - `Plans/Commands_System.md`
  - `Plans/Wiring_Matrix.md`
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Project_Output_Artifacts.md`
  - `Plans/Glossary.md`
  - `Plans/FileManager.md`
  - `Plans/Crosswalk.md`
  - `Plans/Decision_Policy.md`
  - `Plans/Run_Modes.md`
  - `Plans/Progression_Gates.md`
  - `Plans/newtools.md`
  - `Plans/assistant-memory-subsystem.md`
- Cross-owner docs repeatedly implicated by GPT-5.2:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Executor_Protocol.md`
  - `Plans/WorktreeGitImprovement.md`
  - `Plans/Multi-Account.md`
  - `Plans/GitHub_Integration.md`
  - `Plans/FinalGUISpec.md`
  - `STATE_FILES.md`

### Contradictions / gaps surfaced
- Several owner docs are still vulnerable to mechanical false positives/false negatives because their verification guidance assumes structured extraction while their prose/examples leak stale or filename-shaped `cmd.*` tokens.
- Canonical runtime actions and states exist upstream, but dispatcher, matrix, and gate contracts still do not express the runtime checks needed to enforce them safely.
- Artifact/file/evidence surfaces still cannot route deterministically by project/attempt/generated identity without more first-class owner fields.
- Glossary/Crosswalk remain too weak to resolve term/routing disputes cleanly, which keeps downstream addenda accumulating instead of reconciling.
- Gate/evidence schema mismatch is now a first-class governance defect, not just a tooling gap.

### Candidate fixes to carry forward
- Proceed to the final `GPT-5.3-Codex` pass because GPT-5.2 still found concrete mechanical deltas, especially around extraction hazards, event naming, gate-schema mismatch, and missing final command IDs.
- Reconcile event naming and command extraction rules across catalog/storage/wiring before trusting any automated gate based on doc parsing.
- Give runtime dispatcher/gate docs explicit schema for action admissibility, stale revalidation, and correlation/audit trace-through.
- Promote `project_id`, `attempt_id`, and generated/runtime subject routing to first-class owners in artifact/file/storage docs.
- Repair Glossary/Crosswalk routing/term ownership so later reconciliations have a stable place to land.
- Align evidence schema with the actual gate outputs expected by GATE-011/GATE-012 or reduce gate claims to what the schema can encode today.

### Do-not-forget details
- GPT-5.2 is still producing signal strong enough to justify the last requested model pass.
- The new pattern this pass exposed most clearly is “mechanically unverifiable because the docs themselves leak wrong tokens or unsupported shapes,” not just conceptual drift.
- Highest-signal docs remain the same core owner set, with `Commands_System.md`, `Wiring_Matrix.md`, `UI_Wiring_Rules.md`, `Project_Output_Artifacts.md`, `FileManager.md`, `Crosswalk.md`, `Decision_Policy.md`, `Run_Modes.md`, `Progression_Gates.md`, `newtools.md`, and `assistant-memory-subsystem.md` still worth pushing through the final pass.

## Research Progress - 2026-03-16 - Wiring matrix route/subject contract limits

### Targeted docs read
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.md`
- `Plans/Wiring_Matrix.schema.json`
- `Plans/UI_Command_Catalog.md`

### Key findings
- The current wiring contract is still element-centric and command-centric in a narrow sense: it can prove `ui_element_id -> ui_command_id -> handler_location -> expected_event_types`, but it cannot express or verify richer navigation semantics.
- That becomes a real limitation if the rewrite adopts a reusable navigation family such as `cmd.nav.open_subject` or route-payload-driven wrappers. The wiring schema cannot currently distinguish:
  - a direct binding to a canonical navigation primitive
  - a surface-specific wrapper command that resolves to the same route target
  - required route-payload or subject-open arguments
  - canonical command IDs versus deprecated aliases/wrappers
