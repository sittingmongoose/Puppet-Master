- `generated://<artifact_id>` is discussed as a transport/resulting buffer, but the docs still need to guard against treating it like the durable identity.

### Candidate fixes to carry forward
- Keep `Plans/storage-plan.md` as the owner of persisted preview-subject identity and restore joins.
- Narrow `Plans/FileManager.md` so `OpenFile { path... }` is explicitly the workspace-document path contract only, not the universal object-open contract.
- Add or normalize a distinct identity-native open contract above it, consistent with the earlier `OpenSubject` direction:
  - subject kinds should at minimum include `doc:<document_id>` and `artifact:<artifact_id>`
  - resolution may end in a workspace path open, a transient `generated://` buffer, or a routed non-editor surface
- Make `Runtime_Artifacts_Panel.md` and other artifact-bearing surfaces consume the same subject-open resolver rather than bespoke artifact-opening rules.
- Keep route payloads and subject-open semantics aligned so deep links, preview restore, artifact opens, and cross-surface pivots all resolve through the same identity model.

### Do-not-forget details
- This seam is one of the cleaner ones: storage already contains most of the right model; the lag is mainly in the universal-open/file-centric docs.
- `doc:` / `artifact:` should be treated as canonical persisted subject IDs, while `generated://` stays an implementation-level transient representation.
- If this owner split is not made explicit, generated docs/artifacts and preview-backed opens will keep leaking path-based assumptions back into the routing model.

## Research Progress - 2026-03-16 - Missing canonical route-target contract in Contracts_V0

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/FinalGUISpec.md`
- `Plans/storage-plan.md`

### Key findings
- `Contracts_V0.md` currently gives the app only a very thin canonical UI command contract:
  - `command_id`
  - `issued_at`
  - `origin`
  - `correlation_id`
  - `args`
- That is enough to standardize command dispatch mechanically, but not enough to standardize navigation semantics. There is still no canonical contract for:
  - route target identity
  - subject-open identity
  - focused-run/thread/project restoration context
  - wrapper-command routing to a canonical target
- The only stronger navigation-like primitive visible at the contract layer today is `resume_url`, primarily in wizard-blocked / clarification flows. That makes `resume_url` more semantically powerful than the general UI command contract, which is the wrong layering for the rewrite.
- `storage-plan.md` and `FinalGUISpec.md` are already speaking in stronger identity terms (`preview_subject_id`, `doc:<document_id>`, `artifact:<artifact_id>`), but that identity model has not been lifted into the cross-cutting contract layer.
- `UI_Command_Catalog.md` therefore has to carry routing meaning indirectly in per-command arg tables instead of relying on a shared contract family.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/UI_Command_Catalog.md`
- Cross-owner docs implicated by this seam:
  - `Plans/storage-plan.md`
  - `Plans/FileManager.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Wiring_Matrix.md`

### Contradictions / gaps surfaced
- `resume_url` is currently a stronger navigation primitive than generic `UICommand.args`, which inverts the desired architecture.
- The contract layer has canonical event aliasing and blocked-action vocabulary, but still no canonical route/subject vocabulary.
- Surface docs and storage docs are converging on identity-native navigation, but they are doing it without a stable shared contract owner.

### Candidate fixes to carry forward
- Add a canonical route-target / subject-open contract family to `Plans/Contracts_V0.md`, above individual surface commands.
- Keep `UICommand` as the dispatch envelope, but give `args` a normalized target model when the command is navigation/open/focus-oriented.
- Treat `resume_url` as one serialized transport form of the same canonical route-target model rather than a parallel stronger primitive.
- Reuse the already-emerging identity vocabulary:
  - `project_id`
  - `focused_run_id?`
  - `thread_id?`
  - `subject_id?`
  - `object_kind?`
  - `object_id?`
  - `tab_id?`
  - `inspector_target?`

### Do-not-forget details
- This is now mostly an owner-doc problem, not a conceptual one; the identity vocabulary already exists in scattered places.
- If `Contracts_V0.md` does not absorb this, routing semantics will keep being redefined in the catalog, GUI docs, and storage docs separately.
- `resume_url` should end up as a transport/serialization concern, not the hidden canonical route contract.

## Research Progress - 2026-03-16 - Project-output and draft lineage already leaning subject-first

### Targeted docs read
- `Plans/Project_Output_Artifacts.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/interview-subagent-integration.md`
- `Plans/FinalGUISpec.md`

### Key findings
- The planning/output side is already closer to the subject-open model than the file-opening docs are.
- `Project_Output_Artifacts.md` is clear that canonical persistence is seglog-first and filesystem materialization under `.puppet-master/project/**` is staging/export/cache only.
- `chain-wizard-flexibility.md`, `interview-subagent-integration.md`, and `FinalGUISpec.md` all assume staged or non-persisted document bundles that may be opened before they have stable workspace paths.
- `FinalGUISpec.md` is especially explicit here:
  - non-persisted drafts use transient `generated://<artifact_id>` buffers
  - deep-plan and embedded-document flows already expect source/preview/editor surfaces to work before final persist
- That means the upstream planning/document systems are already implicitly subject-first:
  - first-class identity is the staged/generated artifact
  - filesystem path is a later materialization or backing-document assignment
- The remaining mismatch is that this stance is still distributed across planning/UI docs rather than being tied back to one canonical subject-open contract.

### Impacted docs
- Primary owners:
  - `Plans/Project_Output_Artifacts.md`
  - `Plans/chain-wizard-flexibility.md`
  - `Plans/interview-subagent-integration.md`
  - `Plans/FinalGUISpec.md`
- Cross-owner docs implicated by this seam:
  - `Plans/storage-plan.md`
  - `Plans/FileManager.md`
  - `Plans/Runtime_Artifacts_Panel.md`
  - `Plans/Contracts_V0.md`

### Contradictions / gaps surfaced
- Upstream draft/generation flows already rely on artifact-first behavior, but there is still no single shared contract saying these surfaces open by subject identity first and path second.
- `Project_Output_Artifacts.md` gets canonical persistence right, but does not itself own the GUI/open-resolution contract.
- The subject-first behavior is present in practice, but still looks like a set of special-case prose pockets instead of one normalized identity rule.

### Candidate fixes to carry forward
- Preserve the current seglog-first / staging-second model from `Project_Output_Artifacts.md`; it aligns well with subject-open routing.
- Make explicit that staged/generated planning outputs enter the UI as `artifact:<artifact_id>` subjects before any backing path exists.
- Keep `generated://<artifact_id>` as the transient editor/source realization for those subjects, not the durable identity.
- Link the planning/output docs back to the same canonical route-target / subject-open contract once that owner exists.

### Do-not-forget details
- This seam is mostly confirming alignment, not exposing a major contradiction.
- The planning side is already proving that path-first opening is too weak for the rewrite.
- Once the route/subject contract is normalized, these docs should mostly reconcile cleanly rather than needing conceptual redesign.

## Research Progress - 2026-03-16 - GPT-5.3-Codex owner-doc tranche synthesis

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
- The final Codex pass still added meaningful last-mile contradictions instead of flattening into simple confirmation, especially where owner docs remain mechanically unverifiable or structurally inconsistent.
- Command/event ownership tightened at the end:
  - the chat event seam is now clearly split not only by phantom events but by canonical namespace (`chat.thread.created` vs `chat.thread_created`) and likely terminal-state naming (`run.cancelled` vs `run.completed`).
  - `/mode` is now a payload-shape contradiction because the current single `{ mode }` contract cannot carry the requested/effective overlay/runtime split already required elsewhere.
  - reserved-name ownership remains split across three docs, with `/compact` still showing why copied lists and copied rules are unsafe.
- Wiring/gate trust failures are now very explicit:
  - normative ghost IDs still survive through examples, Final GUI remediation actions, and non-catalog command references.
  - coverage verification is still vulnerable to extraction hazards from prose, wildcard tokens, and filename-shaped `cmd.*.json` strings.
  - `Wiring_Matrix.schema.json` still cannot represent wildcard family rows or the producer/consumer normative rows the docs already require.
  - `UI_Wiring_Rules.md` still has no deterministic alias/deprecated-ID handling, no enforced stale revalidation handshake, and no inverse owner-doc-to-catalog coverage rule.
- Project artifact/file-management closeout sharpened remaining deterministic gaps:
  - pass-report finality is still tied to `workflow_run_id` without that key being fully carried through the base artifact-event contract.
  - `workflow_run_id` vs `run_id` lineage remains unresolved.
  - open-by-identity routing now clearly needs richer envelopes (safe point/worktree/baseline/artifact refs), not scalar IDs or plain paths.
  - receipt records are still the intended bridge, but runtime-artifact routing still lacks explicit receipt→artifact linkage.
- Glossary/Crosswalk closeout findings remain structural blockers:
  - dead or fragile anchors/SSOT pointers still exist (`Overseer`, `AuthPolicy`, assistant-memory short anchors).
  - runtime nouns like `attempt_id`, `safe_point_id`, `scheduler_lane`, `blocked_sequence`, `provider_attempt_ref`, and handoff/promotion namespaces still lack Glossary ownership.
  - Crosswalk and GitHub Integration both still place normative content after `References`, confirming append-after-references drift across owner docs.
  - PR/issues, `Seglog`, `ArtifactStore`, and capability-gating routing remain unresolved in Crosswalk.
- Runtime-governance closeout sharpened a few final owner gaps:
  - startup recovery is still split not only by owner doc but by incompatible recovery objects and emission boundaries.
  - blocked-governance attribution (`blocked_owner` or equivalent) is still absent from canonical blocked projection shape even though UX/governance needs it.
  - DAE still lacks a canonical lifecycle across defer/restart and still cannot safely enforce remote side-effect approval without a pre-dispatch intercept path.
  - account-aware strategy ordering remains underdefined when run-level DAE strategy and attempt-level account re-resolution disagree.
- Gate/evidence closeout stayed productive:
  - duplicate addenda are still literal/mechanical, not just thematic.
  - `run-gates` still executes checks with no numbered gate mapping.
  - `pm.evidence.schema.v1` still cannot represent the tri-state or structured payloads some gates already claim to require.
- `newtools.md` and assistant-memory still ended with unresolved canonicalization gaps:
  - the remaining missing orchestrator command gap set is now tight and explicit.
  - doctor-ID canonicalization is still broken internally.
  - `CustomHeadlessTool` still lacks stable config/identity/permission ownership and still conflicts with state/config SSOT.
  - `live.*` remains plan-local instead of contract-registered.
  - `memory.gist.*`, AutoRunBoundary/AutoMilestone, project-switch handoff, and `attention_required` durability still lack a consistent event/persistence/command ownership story.

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
- Repeated cross-owner dependencies sharpened by Codex:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Executor_Protocol.md`
  - `Plans/WorktreeGitImprovement.md`
  - `Plans/Multi-Account.md`
  - `Plans/GitHub_Integration.md`
