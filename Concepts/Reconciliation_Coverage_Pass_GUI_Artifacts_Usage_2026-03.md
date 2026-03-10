# Reconciliation / Coverage Pass — GUI, Artifacts, Usage, Panels (2026-03)

> **Role:** RECONCILIATION / COVERAGE PASS. This document identifies which planning docs must be changed so the design is coherent, buildable, and non-drifting. It does **not** perform edits; it produces the impacted-doc set before packetization.

**Context:** The feature set was researched and audited in the referenced chat. Scope includes: Runtime Artifacts panel (19 types, JSON schemas, seglog/redb, cost_usage, Show in Ledger/Usage); OpenCode usage-collection pipeline (Session.getUsage, processor finish-step, message-level storage); Activity bar and side-panel behavior (Git, Docker, Source Control, Unraid, Artifacts, Chat, Files); Run & Debug; and GUI consistency across all of the above.

---

## 1. RECONCILIATION SUMMARY

### What was reconciled

- **Runtime Artifacts panel:** Full specification from research (19 artifact types, one seglog event type per artifact type, redb `artifacts_index:v1:{project_id}`, deterministic `task_id`, reasoning_tokens required in schema / UI only when >0, cost_usage aligned with usage pipeline, "Show in Ledger" / "Show in Usage" actions, browser recordings required, all differentiators MVP, JSON schemas required for envelope + all 19 types). This design must be written into the planning set and wired to storage, Contracts, and GUI.
- **Usage / cost_usage alignment:** Existing usage.event, chat.message.usage, run.completed.usage, and Usage page/Ledger are the canonical pipeline. The cost_usage runtime artifact is an attribution record that references the same pipeline; Artifacts panel must offer "Show in Ledger" / "Show in Usage" for cost_usage items. OpenCode (product) reference: usage on messages from provider response → LanguageModelV2Usage → Session.getUsage() normalization → processor applies on finish-step to assistant message + step-finish part; UI reads from messages. This pipeline detail should be documented as reference so implementers and future docs do not drift.
- **Activity bar and side panels:** Research fleshed out a single side-panel slot (or equivalent) where the user can toggle between: Git (GitHub), Docker, Source Control, Unraid, Artifacts, plus existing Chat and File Manager. Current FinalGUISpec §4.1 only lists Chat and Files as side-panel toggles; Git panel is specified in GitHub_Integration but not in the activity bar; Docker Manage and Unraid are contextual (e.g. "when Docker-related project"). Reconciliation requires the GUI spec to define how these panels are exposed (activity bar icon(s), one panel slot with tabs vs multiple slots, shortcuts) so that Git, Docker, Source Control, Unraid, and Artifacts are first-class and toggleable without contradiction.
- **GitHub, Docker, Source Control, Unraid panels:** Content exists in GitHub_Integration (§A Git panel), Containers_Registry_and_Unraid (Docker Manage, Unraid), and feature-list; placement and toggling in the shell must be aligned with FinalGUISpec and redb layout keys.
- **Run & Debug:** Already specified in FinalGUISpec §7.20 and §7.4.6 (DAP, run configurations, Debug tab). Verify no overlap or conflict with Artifacts or panel inventory.
- **OpenCode usage pipeline (product reference):** Document the flow (provider response → adapter → LanguageModelV2Usage → Session.getUsage() → processor → message + step-finish; UI from messages) in a plan so that usage-feature, storage-plan, and Provider_OpenCode stay aligned and implementers have a single reference.

### Major drift risks

- **Artifacts vs Project Output Artifacts:** Project_Output_Artifacts.md is SSOT for user-project outputs under `.puppet-master/project/**`. Runtime Artifacts (agent-run outputs in the Artifacts panel) are a different concept. If both are not clearly separated and cross-referenced, future edits may conflate them or duplicate semantics.
- **Panel inventory vs activity bar:** If FinalGUISpec continues to list only Chat and Files as side-panel toggles while other docs (GitHub_Integration, Containers, feature-list) describe Git, Docker, Unraid, Artifacts as first-class panels, the GUI implementation will be ambiguous (where do Git/Docker/Unraid/Artifacts live?).
- **usage.event vs cost_usage artifact:** usage.event (and chat.message.usage, run.completed.usage) are the canonical usage pipeline. The cost_usage runtime artifact is a snapshot/attribution. If docs do not state that cost_usage uses the same schema and links to Ledger/Usage, implementers may invent a second usage store or duplicate fields.
- **OpenCode “product” vs “provider”:** OpenCode-as-product (repo) is the reference for usage-on-messages and normalization. OpenCode-as-provider (Provider_OpenCode.md) is one transport. Usage-feature and storage-plan must reference the product pipeline for “how we collect/store usage” without implying only the OpenCode provider uses it; CLI-bridged and other providers normalize to the same usage.event/message shape.
- **Stale canonical text:** Older sections that describe “only Chat and Files” as side panels or omit Artifacts/Ledger linkage will remain misleading unless replaced or retired, not only amended.

---

## 2. RAW COVERAGE LEDGER SUMMARY

- **Total docs considered:** 50+ (all Plans/*.md and key _shards referenced by plan map and grep for artifacts, usage, panels, activity bar, Git, Docker, Unraid, storage, Contracts).
- **Major doc clusters/themes:**
  - **GUI shell:** FinalGUISpec (activity bar, panel system, views, bottom panel), GUI_Rebuild_Requirements_Checklist, feature-list (layout, migration).
  - **Usage and storage:** usage-feature.md, storage-plan.md, Plans/_shards/usage-feature, Plans/_shards/storage-plan; Provider_OpenCode, CLI_Bridged_Providers; assistant-chat-design (context circle, thread usage).
  - **Artifacts and outputs:** Project_Output_Artifacts.md, FileManager (open-by-identity, runtime artifact addenda), Run_Graph_View, evidence/gui-automation.
  - **Panels and integration:** GitHub_Integration (Git panel), Containers_Registry_and_Unraid, newtools (Docker, Unraid, Actions).
  - **Contracts and events:** Contracts_V0 (EventRecord), storage-plan (event types, redb keys).
- **Where drift risk was highest:**
  - FinalGUISpec §4.1 and §5 vs GitHub_Integration §A, Containers_Registry, and the researched “single-panel slot + toggle” model.
  - storage-plan vs a new Runtime Artifacts spec (event types `runtime_artifact.*`, redb `artifacts_index:v1:{project_id}`).
  - usage-feature / storage-plan vs cost_usage artifact and “Show in Ledger/Usage” (no explicit linkage today).
  - Project_Output_Artifacts vs Runtime Artifacts panel (same word “artifact,” different scopes).

---

## 3. THREE-BUCKET REGISTER

### 1) MUST CHANGE

| Doc | Reason |
|-----|--------|
| **Plans/FinalGUISpec.md** | Add or replace content for: (1) Activity bar §4.1 — include how Git, Docker, Source Control, Unraid, and Artifacts panels are exposed (**single side-panel slot, last-click wins**; no Home button; extensible for extensions). (2) Panel system §5 — list all panels that can occupy the side panel (Chat, File Manager, Git, Docker, Source Control, Unraid, Artifacts) and toggling/persistence. (3) **Layout persistence per project** (panel positions, dock sides, activity bar order saved per project_id). (4) View inventory §7.1 — add Artifacts panel; ensure Bottom panel §7.20 and Run & Debug remain consistent. (5) Shortcuts §4.4 — any new shortcuts for Artifacts or panel switching. |
| **Plans/storage-plan.md** | (1) Register `runtime_artifact.*` event types (one per artifact type per research, e.g. `runtime_artifact.code_diff`, `runtime_artifact.cost_usage`, …). (2) Define redb key pattern for Artifacts index: `artifacts_index:v1:{project_id}` (per-project only). (3) State that cost_usage artifact payload aligns with usage.event schema (tokens_in, tokens_out, reasoning_tokens, cost, platform, model, etc.) and that canonical usage remains usage.event; cost_usage is attribution. (4) If EventRecord envelope is reused for runtime_artifact.*, say so; otherwise reference where payload schemas are registered. |
| **Plans/usage-feature.md** | (1) Add subsection or addendum: cost_usage runtime artifact and “Show in Ledger” / “Show in Usage” actions (Artifacts panel links to Ledger and Usage page using same canonical usage data). (2) Add reference to OpenCode (product) usage pipeline: provider response → normalized usage (LanguageModelV2Usage) → getUsage-style normalization → store on message/turn; UI reads from messages; same conceptual flow for Puppet Master across all providers. Optionally add a short “Implementation reference” pointing to OpenCode repo paths (session-context-metrics, processor finish-step, Session.getUsage) for implementers. (3) **Address Gap 3 (Ledger vs. usage_tracker split):** State that cost_usage and usage.event use the same coherent schema so Ledger, 5h/7d, and Usage page consume one format; document or update the single write path / UsageRecord alignment. |
| **Plans/Project_Output_Artifacts.md** | (1) Add a clear “Runtime Artifacts (GUI panel)” subsection or pointer: distinguish Project Plan Package artifacts (this doc) from Runtime Artifacts (agent-run outputs in the Artifacts panel; seglog runtime_artifact.*, redb artifacts_index). (2) Cross-reference the doc/section that will hold the full Runtime Artifacts panel spec (event types, 19 types, JSON schemas, redb key, task_id rule, reasoning_tokens, cost_usage, Show in Ledger/Usage). Do not duplicate the full spec here; point to SSOT. |
| **New or designated Runtime Artifacts spec** | A single SSOT document (new file or designated section in an existing plan) must contain: artifact types (19), one seglog event type per type (Option 2), envelope + per-type JSON schemas (all required), redb key `artifacts_index:v1:{project_id}`, task_id rule (present when task granularity exists, else omit), reasoning_tokens (required in schema; UI show only when >0), cost_usage alignment with usage pipeline and “Show in Ledger” / “Show in Usage,” browser recordings required, all differentiators MVP, triggers/cardinality, error handling, sanitization, UI edge cases. If this is a new file (e.g. `Plans/Runtime_Artifacts_Panel.md`), it belongs in MUST CHANGE; if it is a section in FinalGUISpec or storage-plan, that doc is already listed. |

### 2) MUST RECONCILE

| Doc | Reason |
|-----|--------|
| **Plans/Provider_OpenCode.md** | §14 already states usage.event from message metadata. Add one short paragraph: OpenCode server returns message-level usage; adapter maps to normalized usage (same shape as usage.event); persistence and Ledger/Usage consumption follow storage-plan and usage-feature. Optionally reference OpenCode product pipeline (Session.getUsage, processor) as reference for “how message metadata becomes stored usage” so terminology does not drift. |
| **Plans/CLI_Bridged_Providers.md** | Already specifies emitting usage.event. Ensure wording allows that usage can also be stored on message/turn for per-thread display and that cost_usage artifact reuses the same schema; no second canonical store. |
| **Plans/assistant-chat-design.md** | Per-thread usage (context circle, thread Usage tab) and message-level token/cost already referenced. Ensure cross-ref to usage-feature and to cost_usage artifact “Show in Ledger/Usage” so that thread Usage and Artifacts panel stay aligned. |
| **Plans/GitHub_Integration.md** | Git panel (§A) is the SSOT for the Git IDE surface. Add a sentence or ContractRef that the Git panel is exposed via the side panel (or primary content) per FinalGUISpec §4 / §5 / §7 so that placement is deterministic. Reconcile **AI in Git** and **multi-repo source control** (thread requested both): either add to scope in this doc or feature-list, or explicitly defer with a pointer. |
| **Plans/Containers_Registry_and_Unraid.md** | Docker Manage and Unraid surfaces are specified. Add a sentence or ContractRef that Docker Manage (and Unraid) are exposed via the side panel (or primary content) per FinalGUISpec so placement and “Hide when not used” align with the shell. |
| **Plans/FileManager.md** | Already has runtime artifact open-by-identity and recovery panel addenda. Ensure that “open by identity” and “Artifacts panel” are aligned with the Runtime Artifacts spec (artifacts_index, artifact types, navigation). |
| **Plans/Contracts_V0.md** | If runtime_artifact.* events use the same EventRecord envelope, state that payload schemas for runtime_artifact.* are defined in storage-plan or Runtime Artifacts spec; do not add 19 payloads here. If task_id or other IDs are part of a canonical ID table, ensure task_id rule (present when task granularity exists, else omit) is stated where IDs are defined. |
| **Plans/GUI_Rebuild_Requirements_Checklist.md** | Add checklist items (or verify existing): Artifacts panel in view inventory and panel system; panel toggling (Git, Docker, Unraid, Artifacts, Chat, Files); Usage/Ledger linkage from cost_usage artifact. |
| **Plans/OpenCode_Deep_Extraction.md** | Add usage pipeline to extraction coverage (or reference usage-feature as the SSOT for “how usage is collected and stored”) so that future extraction does not duplicate or contradict. |
| **Plans/00-plans-index.md** | If a new Runtime Artifacts panel spec document is created, register it in the plan map with primary scope and notes. |
| **Plans/Widget_System.md** | If the Artifacts panel or Usage/Ledger widgets are composed from shared widgets, ensure Artifacts and “Show in Ledger/Usage” are mentioned where relevant. |
| **Plans/feature-list.md** (or _shards/feature-list) | Ensure feature list includes: Artifacts panel (runtime artifacts, 19 types, cost_usage, Show in Ledger/Usage); side-panel toggling for Git, Docker, Unraid, Artifacts; OpenCode-style usage-on-message reference; **layout save per project**; **AI in Git**; **multi-repo source control** (or explicit deferral). |

### 3) MUST VERIFY

| Doc | Reason |
|-----|--------|
| **Plans/newtools.md** | Preview/Build, Docker, Actions contracts; ensure Artifacts panel does not conflict with evidence/automation artifacts and that Run & Debug references are consistent with FinalGUISpec §7.20. |
| **Plans/Run_Graph_View.md** | Right-hand detail panel and token/cost display; ensure any usage or cost display is consistent with usage.event and cost_usage artifact (no duplicate semantics). |
| **Plans/Orchestrator_Page.md** | Tab layout and widget usage; verify no overlap with Artifacts panel placement or terminology. |
| **Plans/evidence.schema.json** / **gui_automation_manifest.schema.json** | Evidence/automation artifacts vs Runtime Artifacts (panel) schema; ensure naming and scope do not conflict (e.g. “artifact” in evidence vs “runtime artifact” in panel). |
| **Plans/Glossary.md** | Terms: “Runtime Artifact,” “Project Plan Package artifact,” “usage.event,” “cost_usage artifact,” “Artifacts panel.” Verify definitions and cross-refs. |
| **Plans/Crosswalk.md** | If artifact storage or projection ownership is assigned, verify runtime artifacts index and seglog event ownership are assigned. |
| **Plans/Progression_Gates.md** | If any gate validates event types or redb keys, ensure runtime_artifact.* and artifacts_index are in scope when the feature is implemented. |
| **Plans/UI_Command_Catalog.md** | Commands for “Show in Ledger,” “Show in Usage,” “Open Artifacts panel,” or panel switching; verify IDs and wiring. |
| **Plans/DRY_Rules.md** | No new duplication; Runtime Artifacts and usage/cost_usage have single SSOTs. |
| **Plans/usage-feature.md (Gap 3)** | Gap 3: Ledger vs. UsageRecord schema split. Verify that cost_usage + usage.event alignment and packet changes resolve or explicitly document the single schema and write path so Ledger and 5h/7d stay in sync. |
| **STATE_FILES.md** | If it defines usage.jsonl or usage record format (§5.2 or similar), verify alignment with usage.event and cost_usage schema so Gap 3 resolution is consistent. |
| **_shards (usage-feature, storage-plan, FinalGUISpec, FileManager, Project_Output_Artifacts, GitHub_Integration, feature-list)** | Shards are derived; do not edit directly. After primary docs are updated, regenerate or verify shards so that they reflect the new content and do not reintroduce stale text. |

---

## 4. MISSING COVERAGE WARNINGS

- **Runtime Artifacts full spec:** The research produced a complete specification (19 types, JSON schemas, event types, redb key, task_id, reasoning_tokens, cost_usage, actions, browser recordings, etc.). That spec is **not** yet a single authoritative document in the repo. The packet **must** include either (a) a new plan document (e.g. `Plans/Runtime_Artifacts_Panel.md`) containing the full spec and JSON schema definitions, or (b) a designated section in an existing plan (e.g. FinalGUISpec or storage-plan) that holds the same content. Without this, implementers and later reconciliation will have no single SSOT and will drift.
- **JSON schemas for all 19 artifact types:** The research required JSON schemas (envelope + per-type) to be complete. The packet must include the actual schema content (or pointers to schema files) for all 19 types; “see research” or “TBD” is not sufficient.
- **OpenCode usage pipeline in a plan:** The flow (provider → adapter → LanguageModelV2Usage → getUsage → processor → message + step-finish; UI from messages) should appear in at least one plan (usage-feature or OpenCode_Deep_Extraction or a short addendum) so that it is not only in chat transcript.
- **Panel toggling UX:** The exact UX for the side panel must be written in FinalGUISpec. The thread decided **single side-panel slot, last-click wins** (clicking an activity bar icon replaces the current panel content; no Home button on activity bar). Specify this explicitly so GUI implementation is unambiguous.
- **Spec_Lock.json / auto_decisions.jsonl:** Per .cursorrules, do not edit these in this pass. When the above changes are made, the pipeline owner may need to refresh Spec_Lock and record decisions in auto_decisions if applicable.

---

## 4A. ANTI-DROP CHECKLIST — DETAILS THAT MUST NOT BE LOST

The following items were discussed or decided in the thread and **must** appear in the packet or the Runtime Artifacts spec. Omission of any is a packet defect.

### Runtime Artifacts — contract and schema

- **Mechanism:** Option 2 only — **one seglog event type per artifact type** (e.g. `runtime_artifact.code_diff`, `runtime_artifact.cost_usage`). No single generic `runtime_artifact` with a subtype field; each type has its own event type name.
- **redb key:** **Per-project only:** `artifacts_index:v1:{project_id}`. Not global; not per-run.
- **task_id:** Deterministic rule only — **present in payload when the run has task/subtask granularity; otherwise omit from payload.** No "optional" wording; not conditional on "if available."
- **reasoning_tokens:** **Required** in the usage/cost_usage schema. **UI:** display only when value **> 0** (do not show the field when zero).
- **Canonical ID set** (must be defined in spec): `artifact_id`, `run_id`, `thread_id`, `task_id` (per rule above), `linked_artifact_id`, `logical_artifact_id`, and any other IDs used for correlation or grouping. Format (e.g. UUID, prefixed) must be specified.
- **Event envelope:** runtime_artifact.* events use the same **EventRecord** envelope (schema, ts, seq, type, run_id, thread_id, payload). Payload schemas are per-type and registered in the Runtime Artifacts spec (or storage-plan); Contracts_V0 does not define the 19 payloads.
- **Envelope schema content:** The common envelope fields (and any common payload fields shared across all 19 types) must be fully specified so the packet includes a complete envelope JSON schema, not just "same as EventRecord."
- **The 19 artifact type names and event type names:** The packet must enumerate the **exact 19 artifact type identifiers** and their corresponding seglog event type names (e.g. `runtime_artifact.<type>`). If the research produced this list, it must be included verbatim; if not, the packet must produce the authoritative list so implementers and storage-plan can reference it. **Canonical list from thread:** `code_diff`, `implementation_plan`, `reasoning_summary`, `validation_test`, `screenshot`, `evidence`, `document`, `restore_point`, `browser_recording`, `tool_llm_trace`, `context_snapshot`, `cost_usage`, `hitl_approval`, `failed_attempts`, `subagent_lineage`, `before_after_snapshot`, `suggested_next_steps`, `api_web_call`, `artifact_version` — event types are `runtime_artifact.<type>` for each.
- **Schema file naming and $id pattern:** Envelope schema file `Plans/runtime_artifact_envelope.schema.json` (`pm.runtime_artifact.envelope.v1`); per-type files e.g. `Plans/runtime_artifact_code_diff.schema.json` through `Plans/runtime_artifact_artifact_version.schema.json` with `$id`: `pm.runtime_artifact.<type>.v1`. Implementation MUST validate every `runtime_artifact.*` event payload against envelope + matching type schema before seglog append and before writing to artifacts index.
- **Projector:** The spec must state **how** `artifacts_index` in redb is populated — i.e. a **projector** (or equivalent) that reads seglog `runtime_artifact.*` events and writes/updates the per-project artifacts index. Without this, the index key is defined but not the writer.

### cost_usage and usage alignment

- **cost_usage artifact:** Attribution record only; **same canonical usage pipeline and schema** as usage.event (tokens_in, tokens_out, reasoning_tokens, cost, platform/provider, model). No second store; Ledger and Usage page consume the same data.
- **Show in Ledger / Show in Usage:** **Required** actions for the cost_usage artifact in the Artifacts panel; link to the Ledger and Usage page using the same canonical usage data (e.g. filter by run_id/thread_id or usage event id).
- **usage-feature Gap 3:** Plans/usage-feature.md documents **Gap 3: Ledger vs. usage_tracker split** (UsageRecord vs Ledger field names, two write paths). The packet must ensure that **cost_usage** and **usage.event** use a **single coherent schema** so that Ledger, 5h/7d, and Usage page all consume one format. Resolving Gap 3 is in scope for this reconciliation; the cost_usage artifact and usage.event alignment is the lever.

### Panels and GUI

- **Browser recordings:** **Required** in the Artifacts panel (not optional). One of the 19 types (or a dedicated type) must be browser recording; behavior and schema must be specified.
- **All artifact differentiators:** **All MVP and required** — no optional differentiators; every listed differentiator is in scope.
- **Activity bar:** Panels that must be exposable/toggleable: **Git (GitHub), Docker, Source Control, Unraid, Artifacts**, plus **Chat** and **File Manager**. How they map to one or more side-panel slots and to activity bar icons must be specified in FinalGUISpec.
- **Single side-panel slot, last-click wins:** Clicking an activity bar icon **replaces** the current panel content (one slot; the most recently clicked icon’s panel is shown). Not “tabs” unless the research explicitly chose tabs; the thread decided **last-click wins**. No Home button on the activity bar; main app navigation (Dashboard, Projects, etc.) stays in title bar / primary content.
- **Layout persistence:** Layouts (panel positions, dock sides, activity bar order) **save per project** (e.g. redb keys per project_id). Automatically persist; no “save layout” action required.
- **Activity bar reordering:** Already in FinalGUISpec §4.1 (icons drag up/down; separator). Verify it remains and applies to any new icons (e.g. Artifacts, Git).
- **Activity bar extensibility:** Extensions/plugins add activity bar items; drag-to-reorder applies to built-in and extension icons; optional user-defined separators between sections.
- **AI in Git / Multi-repo source control:** Thread requested **AI in Git** (e.g. AI-assisted commit messages, suggestions) and **multi-repo source control** as features to add. Reconcile with GitHub_Integration and feature-list so these are in scope for packetization or explicitly deferred.

### OpenCode and multi-provider

- **OpenCode (product) vs OpenCode (provider):** Document clearly: **OpenCode the product/repo** = reference for usage collection (message-level usage → getUsage → processor → message + step-finish). **OpenCode the provider** = one of Puppet Master's transports (Provider_OpenCode.md). All providers (CLI-bridged, OpenCode, Codex, Gemini, Copilot) normalize to the same usage.event / message usage shape; collection mechanism differs per provider.
- **OpenCode repo reference (implementation):** Session.getUsage(), processor finish-step, session-context-metrics.ts, step-finish part carrying usage — these paths should be named in the plan (usage-feature or addendum) so implementers have a single reference.

### Research output and checklist

- **Part H (JSON schemas) / Part J:** **Part H** = JSON schemas (envelope + all 19 per-type); user said “do not have them optional” — all required. If the research output included a **Part J** or other reconciliation/acceptance checklist, that checklist must be satisfied by the packet or incorporated into the plan (e.g. as acceptance criteria or verification steps). Do not drop checklist items that were in the research deliverable.
- **Run & Debug:** Fleshed out in the thread; FinalGUISpec §7.20 and §7.4.6 already specify DAP, run configurations, Debug tab, breakpoints. The following must not be dropped: **config** in `.puppet-master/launch.json` (VS Code–compatible; launch vs attach); **toolbar** Start/Continue (F5), Pause, Step Over (F10), Step Into (F11), Step Out (Shift+F11), Restart, Stop (Shift+F5); **panes** Call stack, Variables, Breakpoints, Debug console (REPL); **breakpoints** line, conditional, hit-count, exception (throw/catch/uncaught); **run to cursor** (e.g. Alt+F9); **evaluate expression** (e.g. Alt+F8), Watches; **differentiators** (logpoints, inline values, CodeLens, test↔debug, AI actions, Debug MCP, orchestrator→debug). Verify all are in the current spec or added in the packet.
- **Concept mockup (e.g. Concepts/PuppetMasterDashComp.html):** The thread included fleshing out what happens when clicking the left-side buttons (Docker, GitHub, Source Control, etc.). If a concept mockup or HTML comp exists, it should be updated or verified to reflect the final activity bar, side-panel slots, and panel list (Git, Docker, Source Control, Unraid, Artifacts, Chat, Files) so the concept and the planning spec do not drift. Scope of this reconciliation is planning docs; the mockup is a verification/consistency check if present.

---

## 5. PACKETIZATION-READY DOC SET

For each doc that should be in the packet, the following table specifies path, why it belongs, likely anchor/section, kind of change, and whether the change can be additive or must replace/retire stale text.

| Path | Why it belongs | Likely anchor/section | Kind of change | Additive vs replace/retire |
|------|----------------|------------------------|----------------|----------------------------|
| **Plans/FinalGUISpec.md** | Primary GUI spec; activity bar, panels, views | §4.1 Activity Bar; §5 Panel System; §7.1 View inventory; §7.20 (verify); §4.4 Shortcuts | Add/replace: Activity bar table and behavior for Git, Docker, Source Control, Unraid, Artifacts; panel list and toggling; add Artifacts to view inventory | **Replace/retire** §4.1 table and side-panel wording that implies only Chat/Files; **add** new panel list and Artifacts view |
| **Plans/storage-plan.md** | Event types, redb keys, usage | Event type table; redb schema/list; analytics/rollups | Add runtime_artifact.* event types; add artifacts_index:v1:{project_id}; state cost_usage alignment with usage.event | **Additive** for new event types and key; **replace** any wording that omits runtime artifacts or implies single usage store |
| **Plans/usage-feature.md** | Usage UX, Ledger, per-thread usage | §5 or new subsection; “Data and event shape” | Add cost_usage artifact and Show in Ledger/Usage; add OpenCode pipeline reference | **Additive**; ensure no stale “only Ledger” wording |
| **Plans/Project_Output_Artifacts.md** | SSOT for project outputs; must distinguish from runtime artifacts | Scope §0 or new § “Runtime Artifacts (GUI panel)” | Add pointer distinguishing Project Plan Package vs Runtime Artifacts; cross-ref Runtime Artifacts spec | **Additive** with clear separation; do not duplicate full runtime spec here |
| **Plans/Runtime_Artifacts_Panel.md** (or equivalent) | SSOT for Runtime Artifacts panel | Entire doc or designated section | **New content:** 19 types, seglog event types, redb key, task_id rule, reasoning_tokens, cost_usage, Show in Ledger/Usage, browser recordings, JSON schemas (envelope + 19), triggers, errors, UI rules | **New** doc or **new** section; no retire (no prior SSOT) |
| **Plans/Provider_OpenCode.md** | OpenCode provider; usage from message metadata | §14 Persistence Mapping or adjacent | Add paragraph: message metadata → normalized usage → usage.event; optional ref to OpenCode product pipeline | **Additive** |
| **Plans/CLI_Bridged_Providers.md** | usage.event emission | Section on usage events | Reconcile: usage on message/turn and cost_usage artifact use same schema/canonical source | **Additive** or small replace for clarity |
| **Plans/assistant-chat-design.md** | Per-thread usage, context circle | §12 or cross-refs | Cross-ref cost_usage and Show in Ledger/Usage | **Additive** |
| **Plans/GitHub_Integration.md** | Git panel | §A or top | ContractRef: Git panel placement per FinalGUISpec | **Additive** |
| **Plans/Containers_Registry_and_Unraid.md** | Docker Manage, Unraid | Top or persistence | ContractRef: Docker/Unraid panel placement per FinalGUISpec | **Additive** |
| **Plans/FileManager.md** | Open by identity, runtime artifacts | Runtime artifact addenda | Align with Runtime Artifacts spec (artifacts_index, types) | **Additive** or small replace |
| **Plans/Contracts_V0.md** | EventRecord envelope | §1 Events; ID table if any | State that runtime_artifact.* payload schemas are elsewhere; task_id rule if in ID table | **Additive**; **replace** if ID table currently says task_id “optional” without deterministic rule |
| **Plans/GUI_Rebuild_Requirements_Checklist.md** | Verification checklist | Checklist table | Add items: Artifacts panel, panel toggling, cost_usage Ledger/Usage linkage | **Additive** |
| **Plans/OpenCode_Deep_Extraction.md** | Extraction procedure | §7 or §8 | Add usage pipeline to coverage or reference usage-feature as SSOT | **Additive** |
| **Plans/00-plans-index.md** | Plan map | Plan map table | Register Runtime Artifacts spec doc if new | **Additive** |
| **Plans/Widget_System.md** | Widget catalog | Ledger/Usage widget or Artifacts | Mention Artifacts panel and Show in Ledger/Usage if widgets are shared | **Additive** (only if applicable) |
| **Plans/feature-list.md** (and _shards/feature-list) | Feature list | Part 1 or 2 | Add Artifacts panel, panel toggling, usage pipeline reference | **Additive** |
| **Plans/newtools.md** | Docker, Actions, evidence | §14.6, §14.7 | Verify no conflict with Artifacts panel or Run & Debug | **Verify**; edit only if conflict found |
| **Plans/Run_Graph_View.md** | Run graph, token display | Detail panel, usage | Verify consistency with usage.event and cost_usage | **Verify** |
| **Plans/Orchestrator_Page.md** | Tabs, widgets | Tab list | Verify no overlap with Artifacts | **Verify** |
| **Plans/evidence.schema.json**, **gui_automation_manifest.schema.json** | Evidence artifacts | N/A | Verify naming/scope vs Runtime Artifacts | **Verify** |
| **Plans/Glossary.md** | Terms | Entries for artifact, usage | Verify/correct definitions | **Verify**; **replace** if definitions are wrong |
| **Plans/Crosswalk.md** | Ownership | Storage/event ownership | Verify runtime artifacts and artifacts_index assigned | **Verify** |
| **Plans/Progression_Gates.md** | Gates | Event/redb gates | Verify runtime_artifact.* and artifacts_index in scope | **Verify** |
| **Plans/UI_Command_Catalog.md** | UI command IDs | Commands for Ledger, Usage, Artifacts, panels | Verify IDs for new actions | **Verify** |
| **Plans/DRY_Rules.md** | DRY | N/A | Verify no new duplication | **Verify** |

---

## 6. COMPARISON: PACKET CANDIDATE VS IMPACTED SET

- **In packet, must not be missing:** The **Runtime Artifacts full spec** (new doc or section) with **all 19 JSON schemas**; **FinalGUISpec** updates for activity bar and panels; **storage-plan** updates for runtime_artifact.* and artifacts_index; **usage-feature** cost_usage and OpenCode pipeline; **Project_Output_Artifacts** pointer to Runtime Artifacts.
- **Reconciliation docs that might be skipped by mistake:** Provider_OpenCode (short add), CLI_Bridged_Providers (reconcile usage/cost_usage), GitHub_Integration and Containers_Registry_and_Unraid (placement ContractRef), GUI_Rebuild_Requirements_Checklist (new items), OpenCode_Deep_Extraction (usage in extraction), 00-plans-index (register new doc).
- **Verify-only docs:** If the packet only lists “MUST CHANGE” and “MUST RECONCILE,” the “MUST VERIFY” set may be overlooked. Include a verification step in the packetization process so that newtools, Run_Graph_View, Orchestrator_Page, evidence/gui_automation schemas, Glossary, Crosswalk, Progression_Gates, UI_Command_Catalog, and DRY_Rules are checked before sign-off.
- **§4A Anti-Drop Checklist:** Before considering the packet complete, the scribe or packet owner **must** confirm that every bullet in **§4A** is satisfied (mechanism Option 2, redb key, task_id rule, reasoning_tokens, canonical IDs, envelope, **exact 19 type names and event types**, **schema file naming and $id pattern**, projector, cost_usage alignment, Show in Ledger/Usage, Gap 3, browser recordings, all differentiators MVP, activity bar panels, **single slot last-click wins**, **no Home button**, **layout save per project**, **activity bar extensibility**, **AI in Git / multi-repo source control**, OpenCode product vs provider, Part H/Part J checklist, **Run & Debug detail list**). Missing any item is a packet defect.

---

<ready_for_packetize/>
