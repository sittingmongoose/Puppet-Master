  - with `Plans/DRY_Rules.md` important as a mechanical-integrity forcing function and `Plans/BinaryLocator_Spec.md` lower-risk but still non-zero.

### Do-not-forget details
- This tranche eliminates the remaining Gemini-only tail; the remaining partial-doc problem is now about continuing the ordered later-model sequence, not about coverage holes at the first pass boundary.
- The docs that looked most "reference-like" turned out to be some of the strongest drift multipliers.
- `meta.json` must remain active; the broader sweep is still not ready for reconciliation.

## Research Progress - 2026-03-16 - Command boundary: pure view commands vs route-consuming navigation

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/Contracts_V0.md`
- `Plans/Crosswalk.md`
- `Plans/FinalGUISpec.md`
- `Plans/FileManager.md`
- `Plans/usage-feature.md`
- `Plans/assistant-chat-design.md`
- `Plans/storage-plan.md`

### Key findings
- The command layer wants a three-way split, not a binary split:
  - pure shell/view-state commands
  - route-consuming navigation commands
  - domain mutation/runtime commands
- Pure shell/view-state commands should stay local and lightweight. They change what panel/subview/layout is visible, but they do not own canonical target identity.
- Route-consuming navigation commands are the ones that must reveal a specific object or scope. They should normalize through the emerging `route_target` model even if the user-facing command name stays domain-specific.
- Domain mutation/runtime commands remain separate again. They act on canonical runtime or domain identity and are not just navigation with a side effect.
- `cmd.panel.switch` is the clearest pure shell command in the current catalog. It selects a side-panel destination. Its current optional `context` payload is the main drift risk because it makes a shell command look like an object-targeting navigation command.
- `cmd.source_control.switch_subview` is also a pure shell/view-state command. It chooses a Source Control subview; it should not become the carrier for repo/worktree/compare target identity.
- `cmd.chat.open_thread_usage` and `cmd.chat.focus_thread_usage` sit on the boundary. They should remain wrapper navigation commands, not pure shell toggles, because they are trying to reveal the Usage surface for a specific thread. They should normalize to canonical route context underneath.
- `cmd.source_control.select_worktree` is not just a generic shell toggle. It is an object-targeting selection command. If it remains canonical, it should resolve through normalized target identity rather than stay a one-off ad hoc selection primitive.
- `cmd.project.open` is already implicitly route-consuming navigation rather than shell-state mutation; the docs just do not say that in one shared place.
- `OpenFile { path... }` remains a legitimate specialized open contract, but only for real workspace documents. The surrounding command layer still lacks the parallel identity-native `OpenSubject` / `route_target` owner contract.

### Impacted docs
- Primary owners:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
- Strongly implicated adjacent docs:
  - `Plans/FinalGUISpec.md`
  - `Plans/FileManager.md`
  - `Plans/usage-feature.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/storage-plan.md`

### Contradictions / gaps surfaced
- `UI_Command_Catalog.md` currently mixes shell commands and object-targeting navigation commands in the same "layout/UI state only" bucket, even when payloads already carry object identity.
- `cmd.panel.switch` currently accepts contextual object refs (`repo_id`, `worktree_id`, `workflow_run_id`, `publish_result_id`, `k8s_ref`) even though the shell model increasingly wants object targeting to route through a shared target contract instead of the panel-switch primitive.
- `Crosswalk.md` still names `Primitive:UICommand` and `Primitive:DocumentPane`, but it has no primitive boundary for route-target navigation or identity-native open/focus behavior.
- `Contracts_V0.md` still has no canonical route-target/open-subject contract, which is why command docs keep improvising local payload semantics.
- `FinalGUISpec.md` correctly treats activity-bar navigation as a shell concern, but local docs elsewhere keep slipping object context into the same command family.

### Candidate fixes to carry forward
- Formalize the three-way command taxonomy:
  - pure shell/view-state commands
  - route-consuming navigation commands
  - domain mutation/runtime commands
- Keep `cmd.panel.switch` and `cmd.source_control.switch_subview` as pure shell/view-state commands with controlled destination vocabularies.
- Move object-targeting payload semantics out of `cmd.panel.switch` and into canonical route-consuming commands or normalized `route_target` wrappers.
- Treat `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, `cmd.project.open`, `cmd.artifacts.show_in_*`, and cross-surface Orchestrator pivots as wrapper navigation commands over canonical route targeting rather than as generic layout toggles.
- Treat commands like `cmd.source_control.select_worktree` as object-selection/navigation commands that should normalize through canonical target identity if they remain first-class.
- Add a Crosswalk primitive boundary for route-target / open-subject ownership so the split between shell-state and canonical navigation is explicit.

### Do-not-forget details
- A panel being opened is not the same thing as an object being revealed.
- "Focus Usage for thread X" is route-consuming navigation even if the destination happens to be a side panel.
- Shell commands should not accumulate object identity until they quietly become undocumented route commands.
- The catalog can keep UX-facing wrapper names; the important change is the canonical contract beneath them.

## Research Progress - 2026-03-16 - Wrapper commands vs explicit `cmd.nav.*` family

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/Contracts_V0.md`
- `Plans/Crosswalk.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.md`
- `Plans/FinalGUISpec.md`

### Key findings
- The command/wiring system is biased toward stable user-facing command IDs with explicit surface meaning.
- An explicit public `cmd.nav.*` family is possible, but it would add catalog surface area, wiring rows, handler registration burden, and alias/deprecation work across the gate machinery.
- The stronger near-term fit is:
  - keep domain-facing wrapper commands public and stable
  - add canonical `route_target` / `OpenSubject` semantics underneath them
  - let wrappers normalize internally to the shared navigation primitive
- This is consistent with how the docs already treat many surface verbs:
  - `cmd.chat.open_thread_usage`
  - `cmd.artifacts.show_in_usage`
  - `cmd.orchestrator.open_in_source_control`
  - `cmd.project.open`
  - these are good UX-facing wrapper names, even if they are not the canonical navigation primitive
- `UI_Wiring_Rules.md` and `Wiring_Matrix.md` reinforce the cost of over-expanding the public command family: every stable command ID becomes part of handler coverage, dead-command detection, and gate expectations.
- The catalog already contains a number of wrapper-style open/focus commands. Replacing them quickly with public `cmd.nav.*` IDs would create churn without much user-facing clarity benefit.
- A smaller hidden or lower-level canonical navigation primitive still looks necessary, but it should be contract-owned rather than catalog-dominant.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
  - `Plans/UI_Command_Catalog.md`
- Strongly implicated adjacent docs:
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Wiring_Matrix.md`
  - `Plans/FinalGUISpec.md`

### Contradictions / gaps surfaced
- There is still no canonical navigation primitive in the contract layer, so wrapper commands remain forced to carry semantics in prose.
- The wiring/gate model is command-ID-centric, but it has no first-class notion of wrapper commands normalizing to one shared route primitive.
- Without that explicit model, later reconciliation could drift in either of two bad directions:
  - too many public `cmd.nav.*` commands added to the catalog
  - or domain wrappers each inventing their own private route args again

### Candidate fixes to carry forward
- Recommend against making a large public `cmd.nav.*` family the main catalog-facing answer.
- Prefer this layered split:
  - contract layer owns `route_target` and `OpenSubject`
  - catalog keeps stable domain-facing wrapper/open/focus commands
  - wrappers normalize to canonical route semantics internally
- If a tiny explicit navigation family is needed at all, keep it very small and infrastructural, not user-facing:
  - for example an internal/shared `open_subject` or `focus_route` primitive
  - not a broad replacement for domain wrapper verbs
- Add explicit wrapper/alias guidance so the wiring system can understand “different command ID, same canonical route primitive” without treating that as drift.

### Do-not-forget details
- The problem is not that wrapper commands exist; the problem is that they currently normalize nowhere shared.
- Stable wrapper names are useful for UX, discoverability, and command-palette semantics.
- The canonical primitive should live underneath the wrapper layer, not force every surface to speak one generic top-level command language.

## Research Progress - 2026-03-17 - Wrapper/alias contract in wiring and gates

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.md`
- `Plans/Progression_Gates.md`
- `Plans/evidence.schema.json`
- `Plans/Contracts_V0.md`

### Key findings
- The docs currently have one strong migration pattern for names: deprecated event aliases in `Contracts_V0.md`.
- The command layer now needs two distinct patterns, not one:
  - deprecated command aliases during migration
  - stable wrapper commands that intentionally normalize to one shared primitive
- Those are not the same thing:
  - a deprecated alias should eventually disappear
  - a wrapper command may remain permanently because it is useful UX-facing vocabulary
- The current wiring and gate docs are too command-ID-centric to express that difference well. Right now they mostly understand:
  - stable command ID
  - handler
  - expected events
  - coverage
  - dead command detection
- `GATE-010` and the wiring rules would currently treat a growing set of wrapper commands as fully independent commands, but they have no way to say "these different public command IDs normalize to the same canonical route primitive."
- `evidence.schema.json` is also very generic here. It can store pass/fail checks, but it has no structured slot for wrapper-normalization or alias-resolution evidence.
- The existing `cmd.runtime.*` consolidation shows a related but different pattern:
  - `allowed_action_id` values map to canonical runtime commands
  - legacy namespaces are explicitly deprecated aliases
  - this is close to the right thinking for navigation, but navigation still needs a wrapper layer rather than just a winner/loser alias table

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Wiring_Matrix.md`
  - `Plans/Progression_Gates.md`
- Strongly implicated adjacent docs:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Crosswalk.md`
  - `Plans/evidence.schema.json`

### Contradictions / gaps surfaced
- There is currently no explicit distinction between:
  - deprecated command alias
  - stable wrapper command
  - canonical primitive underneath both
- Without that distinction, later cleanup is likely to go wrong in one of two ways:
  - wrapper commands get treated as redundant drift and pushed toward premature deletion
  - or deprecated aliases stay alive forever because the system lacks a precise migration vocabulary
- `GATE-010` can verify command coverage, but it cannot yet verify wrapper normalization consistency.
- The evidence model is currently too generic to express route/wrapper/alias verification failures in a structured, machine-readable way.

### Candidate fixes to carry forward
- Add an explicit command-normalization model with three layers:
  - public command ID
  - canonical primitive or normalized target contract
  - deprecated alias metadata only where migration is actually intended
- Keep deprecated alias handling separate from stable wrappers:
  - `alias_of_command_id` or equivalent should be for migration/deprecation only
  - wrapper commands should instead declare something like `normalizes_to` / `canonical_target_contract` / `canonical_route_kind`
- Extend wiring/gate thinking so multiple public commands may intentionally normalize to one primitive without being treated as duplicate drift.
- Extend `GATE-010` evidence/reporting to capture:
  - wrapper normalization target
  - deprecated alias target when applicable
  - mismatch detection when wrapper commands claim one primitive but wire to different semantics
- Keep the command catalog readable for UX and command-palette use; do not force users to think in canonical primitive names.

### Do-not-forget details
- Wrapper commands are not a temporary compatibility hack by default.
