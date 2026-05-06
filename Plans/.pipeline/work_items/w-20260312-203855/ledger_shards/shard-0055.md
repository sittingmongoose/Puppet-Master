  - `open_file`
  - uses `OpenFile { path, line?, range?, target_group? }`
- identity-based target:
  - `open_subject`
  - uses `OpenSubject { subject_id, target_group?, open_mode?, location? }`
- surface-focus target:
  - route to a specific page/tab/inspector with context
  - examples:
    - Usage with `usage_event_ref`
    - Ledger with event identity in scope
    - Orchestrator with `focused_run_id`, selected node/attempt, tab, inspector target
    - wizard resume via `wizard_id + step`

### Recommended route payload minimum shape
- `target_kind`
- `project_id?`
- `workspace_tab_id?`
- `focused_run_id?`
- `thread_id?`
- `subject_id?`
- `usage_event_ref?`
- `object_kind?`
- `object_id?`
- `tab_id?`
- `inspector_target?`
- `line?` / `range?` when path-based

### Why this matters
- it lets `OpenSubject` and `OpenFile` live inside one routing model instead of becoming separate navigation stacks
- it keeps `resume_url`, search jumps, palette entries, and artifact pivots semantically aligned
- it avoids a bad outcome where file opens are one model, wizard resumes another, usage/artifact pivots a third, and runtime CTAs a fourth

### Impacted docs
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/assistant-chat-design.md`
- `Plans/FileManager.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/usage-feature.md`
- likely owner docs:
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`

### Contradictions / gaps surfaced
- `FinalGUISpec.md` still overstates the scope of `OpenFile` by claiming all file-open actions across the app use that one contract, even though the app now needs identity-native subject opens.
- `UI_Command_Catalog.md` has many action IDs but no explicit generalized subject-open command family or route payload contract.
- `resume_url` is already more precise than many in-app jumps, which is backwards; in-app routing should be at least as strong as serialized resume links.
- chat jump-to-message, cost_usage deep-links, and blocked/runtime resumes all want context-preserving navigation, but they are still documented separately.

### Candidate fixes to carry forward
- Add a canonical route payload / target model owner section, likely in `Contracts_V0.md` or an equivalent routing owner doc.
- Recast `resume_url` as one serialized representation of that internal route payload, not a separate special-case mechanism.
- Introduce explicit subject-open command coverage in the command catalog instead of overloading path-open semantics everywhere.
- Update `FinalGUISpec.md` so `OpenFile` remains true for workspace files, while identity-native opens route through `OpenSubject` under the same higher-level routing model.

### Do-not-forget details
- The system now wants a routing contract, not just more command IDs.
- `resume_url` should not stay the most expressive navigation mechanism in the product.
- The clean model is one navigation payload with multiple target kinds, not multiple parallel deep-link systems.

## Research Progress - 2026-03-16 - Command-catalog implications of route/subject normalization

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/FinalGUISpec.md`
- `Plans/assistant-chat-design.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/usage-feature.md`

### Key findings
- The command catalog already contains many specific pivots:
  - `cmd.artifacts.show_in_ledger`
  - `cmd.artifacts.show_in_usage`
  - `cmd.orchestrator.open_in_source_control`
  - `cmd.orchestrator.open_in_github_actions`
  - `cmd.orchestrator.open_in_docker_manager`
  - `cmd.runtime.open_attempt_details`
  - `cmd.runtime.open_queue_analysis`
  - `cmd.runtime.open_remediation_lineage`
  - `cmd.runtime.open_safe_point_history`
- But those are still surface-specific commands, not a generalized subject-open family.
- `FinalGUISpec.md` still overstates path-open coverage via `OpenFile`, while also separately documenting:
  - `resume_url`
  - artifact-backed `generated://<artifact_id>`
  - thread Usage opens
  - settings deep links
- The result is that the catalog is handling many routed-open cases one by one instead of owning a stable open/route primitive family.

### Recommended catalog direction
- keep domain actions as explicit commands:
  - approve
  - retry
  - replan
  - cancel
  - publish
  - rerun
- but add a small canonical navigation/open family for target resolution:
  - `cmd.nav.open_subject`
  - `cmd.nav.open_usage_subject`
  - `cmd.nav.focus_route`
  - or an equivalent compact family

### Recommended command-family responsibilities
- `cmd.nav.open_subject`
  - args should carry a normalized subject/route target
  - resolves file/document/artifact/generated/report targets
- `cmd.nav.focus_route`
  - restores page/tab/run/thread/inspector context without implying editing/opening
- `cmd.nav.open_usage_subject`
  - resolves canonical Usage/Ledger identity from `usage_event_ref` or equivalent usage target
- domain-specific “open in X” commands can still exist where they express a meaningful product action, but they should be wrappers over the same route/subject model rather than custom arg families

### Why this matters
- it reduces command sprawl
- it gives wiring and tests a smaller set of reusable navigation primitives
- it keeps artifact/report/usage/deep-link routing aligned instead of drifting per surface
- it stops `resume_url` from being more capable than in-app commands

### Recommended arg model
- navigation commands should be able to carry:
  - `subject_id?`
  - `target_kind?`
  - `route_payload?`
  - `project_id?`
  - `focused_run_id?`
  - `thread_id?`
  - `tab_id?`
  - `inspector_target?`
  - `line?` / `range?` for file-backed opens

### Impacted docs
- `Plans/UI_Command_Catalog.md`
- `Plans/FinalGUISpec.md`
- `Plans/FileManager.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/usage-feature.md`
- likely owner docs:
  - `Plans/Contracts_V0.md`
  - `Plans/Wiring_Matrix.md`
  - `Plans/UI_Wiring_Rules.md`

### Contradictions / gaps surfaced
- the catalog currently has many “open/focus/show” commands, but no generalized subject-open/navigation primitive family.
- `cmd.artifacts.show_in_ledger` and `cmd.artifacts.show_in_usage` are useful, but they still encode feature-local semantics that should likely route through the same canonical usage/route target model.
- cross-surface commands like `cmd.orchestrator.open_in_source_control` are meaningful UX actions, but their arg shapes are still custom rather than obviously derived from one route schema.
- wiring/gate verification will stay noisy if every new surface invents another special-case open command instead of binding to a reusable navigation family.

### Candidate fixes to carry forward
- add a canonical navigation/open command family to the command catalog
- let surface-specific “open in X” commands become thin wrappers over the common route/subject model where useful for UX clarity
- align `Show in Ledger`, `Show in Usage`, and artifact/report opens around the same target schema instead of per-feature payloads
- update Final GUI and FileManager docs so they reference both:
  - workspace file open
  - identity-native subject/route open

### Do-not-forget details
- This is not an argument for deleting all specific open commands; it is an argument for giving them one shared target model underneath.
- The catalog gap is now structural, not just a few missing IDs.
- If this is not normalized, every new surface will keep adding one more `cmd.*.open_*` variant with slightly different args.

## Research Progress - 2026-03-16 - GPT-5.4 owner-doc tranche synthesis

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
- The GPT-5.4 pass confirmed the owner-doc tranche still has strong signal after Opus and Sonnet; it did not plateau into repetition.
- Command/wiring ownership tightened further:
  - `/compact` is not just omitted from a list; reserved slash-command ownership is now visibly split across chat UX examples, catalog sections, and command-system validation.
  - `cmd.chat.run_user_command` remains the missing core dispatch seam for User Commands, not merely an uncataloged helper.
  - `/mode` is now clearly overloaded across runtime-mode vs overlay semantics while the docs still expose only a single `{ mode }` payload.
  - the wiring stack still has no hard reverse-coverage boundary, so ghost IDs survive simultaneously in Final GUI, Wiring Matrix, and command-owner docs.
- Wiring / gate verification failures sharpened into exact structural limits:
  - canonical `cmd.runtime.*` recovery commands are still absent from real matrix rows even where page/docs require the corresponding CTAs.
  - `Wiring_Matrix.schema.json` still cannot represent the normative recovery producer/consumer rows or wildcard command-family requirements now described in the doc.
  - `UI_Wiring_Rules.md` still lacks dispatcher-level obligations for `allowed_action_ids[]`, stale-projection revalidation, and `correlation_id` trace-through.
  - deprecated-vs-canonical command-family status still cannot be represented in the catalog/matrix/gate contracts.
- Project artifact / file-management lineage got materially sharper:
  - `validation_pass_report` contradictions are broader than one enum row because pass-level sweep sections still assume pass/fail-only semantics while downstream wizard flow requires `skipped`.
  - `project_id` is no longer just a nice-to-have lineage field; its omission now clearly blocks deterministic projector partitioning, replay, and per-project artifact/search indexing.
  - `OpenFile { path }` is directly incompatible with generated/runtime identity opens; the missing contract is now clearly an open-by-identity router, not a bigger `OpenFile`.
  - evidence / artifact joins still lack the canonical fields needed to move from runtime/worktree receipts to concrete artifact/evidence subjects.
- Structural owner docs remain actively unsafe:
  - `Glossary.md` is still being cited as the owner of `Overseer` while not defining it, and `effective state` is now clearly too broad to safely stand in for requested/effective runtime identity.
  - `Crosswalk.md` is not just duplicate-numbered; its `References` section is non-terminal, its §2 routing table omits many already-defined primitives, and adjacent docs are already citing primitives like `Seglog` that Crosswalk cannot route.
  - the capability-gating seam now has a direct contradiction: one owner implies frozen capability state/events while the media/capability owner says capability is recomputed live and not carried as a separate persisted state stream.
- Runtime-governance docs continue to sharpen rather than stabilize:
  - startup recovery remains split across policy, executor, and storage docs with no single owner deciding how interrupted attempts become `stale_historical` vs rehydrated vs `startup_recovered`.
  - retry/backoff policy is now more clearly blocked on counter-family ownership because `retry_count` is display-only yet policy wording still acts like a generic “attempts” ceiling is enough.
