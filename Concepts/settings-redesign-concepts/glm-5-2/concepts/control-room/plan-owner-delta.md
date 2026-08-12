# Plan-Owner Delta — Concept 01 Control Room (GLM-5.2)

**Concept:** `concept-01-control-room` — Settings as mission control. One dominant search is the primary verb; destinations are large editorial panels (title + purpose + live status), never filter chips. Workspace is a book-TOC: left vertical category index plus a continuous document with a portable scrollspy and deep links.

**Scope:** This concept DEEP-OWNS the C1 bucket (Context & Instructions, Memory, Personas, Goals & Automation, Crew, Permissions & FileSafe, Back Seat Driver) and demonstrates the CORE surface every concept shares (Settings Home, Settings Search, Settings Workspace, Provider/Account/Model/Installation, ordinary setting-row grammar). Sibling-owned families are reachable via shared grammar.

**Provenance:** Source schemas from `PM_Settings_Bakeoff_Final_Cumulative_2026-08-08` (IMPACT_REGISTER.template.json, MANAGER_COVERAGE_MATRIX.json, CANDIDATE_COMMAND_ID_REGISTER.json, 02/03/04/08/10 briefs); canonical ID census from `Plans/UI_Command_Catalog.md`, `Plans/Wiring_Matrix.production.json`, and `Plans/settings_inventory.json`. Command IDs are provisional pending audit adjudication.

---

## Plans/FinalGUISpec.md

### impact
Establishes a search-centric Settings Home (F3-432..442 range) where a dominant omni-search bar is the primary verb and destinations render as large editorial panels — not category pills. Introduces a book-TOC workspace: left vertical category index + continuous document. Three first-class shell primitives must be promoted: the editorial destination panel, the notice (one clear action), and the search-result row. Scrollspy active-section highlight and deep-link jump semantics must be expressed as portable primitives (a section-index model + viewport offset), not an IntersectionObserver-only DOM behavior, because the Slint port has no IntersectionObserver. Manager loading must not block the entire Settings workspace (progressive hydration). The shell keeps the left Activity Bar canon; right-panel / chip-only / no-sidebar language is superseded.

`gui_related: true`

---

## Plans/settings_inventory.json

### impact
Exercises the full setting-row grammar across the C1 families and the core provider/persona/memory rows. Every value state (Default, Recommended, Inherited, Auto, Not-configured, Managed, Custom, Unavailable, Effective-differs) must be representable; Auto/Inherit/Not-configured/Disabled must never be an unexplained empty string. Flags several inventory values in the context/memory/persona/goal/crew/permission buckets as needing a requested/effective/origin triple rather than a bare scalar. Exposure level (Standard/Advanced/Expert-or-risky/Managed-read-only/Diagnostic/Unavailable) is mandatory metadata, not a render-time guess. Scope vocabulary must cover turn/thread/Goal/PlanningRun/Crew/project/global/host/environment/installation/device/workspace-worktree/account/provider/Persona. Action-vs-value separation must be tagged at the row level (one-shot action vs status projection vs diagnostic vs persistent setting vs manager route).

`gui_related: false`

---

## Plans/Personas.md

### impact
Persona manager demonstrates behavior-not-authority: a Persona cannot grant Full Access, widen FileSafe, force a provider, or eagerly load all skills. Shows mission/use boundary, model-facing capsule preview, source/version/provenance, eligible skills, requested capabilities, and import diff with trust/secret/prompt-injection scan, plus a child-only flag. Corrects stale `ask/plan/regular/yolo` coupling — conversation mode and access profile are separate axes; canonical access choices are Ask-for-approval / Auto-accept-edits / Auto / Full Access, with Plan and Review effect-limited (not tool-free: safe read, browser, research, testing, diagnostic operations allowed). Persona identity payloads must NOT use the retired `requested_persona_id` / `effective_persona_id` aliases.

`gui_related: true`

---

## Plans/assistant-memory-subsystem.md

### impact
Memory manager demonstrates evidence-backed degrading Assistant Gists: half-life changes retrieval activation only (fade, not delete), verified/unverified provenance, pin, version history + restore, capsule preview/token estimate, rebuild/dedupe/summarize/archive/redact, and half-life + active-context status. The manager reads half-life and active-context status from the memory owner; it does not invent them. Verify is a one-shot action with a provenance update (not a deletion event); edit creates a version. Automated systems use explicit thread/ledger/Goal/artifact retrieval, not hidden Assistant Gists. The uncataloged `memory.gist` / `memory.gist.*` signals must resolve to stable command/event/storage rows or be retired. Half-life change is a retrieval-activation event, not a deletion event.

`gui_related: true`

---

## Plans/Goal_Runtime_System.md

### impact
Goal settings own defaults and ceilings only — never live run state. Settings configures Goal defaults, pause/resume/checkpoint policy, verification strength, sustainable fan-out preferences, capacity reserve, high-quality planning route, and worker/reviewer route classes. Runtime/Orchestrator admits actual work and reports current capacity; Settings must project requested vs effective worker+reviewer routes (with a fallback reason) without mutating live Goal state. Checkpoint/compact cadence is a default the runtime enforces. `ai.models.goal-worker-model` and `ai.models.goal-verifier-model` are requested routes; effective is projected at runtime.

`gui_related: false`

---

## Plans/orchestrator-subagent-integration.md

### impact
Crew manager demonstrates Orchestrator-owned templates with requested vs effective members + concurrency and waves. A Crew template configures purpose, member roles, persona/capability requirements, allowed provider/account/model candidates, min/max members, adaptive sizing and waves, usage/cost/time reserve, write/worktree policy, board topology, diversity/corroboration, reducer/synthesis, and failure/stop behavior. Crew is not a Persona, mode, provider, permission grant, or hidden memory. `branching.crew.max-agents-per-crew` is a ceiling only; effective concurrency is projected from the Orchestrator at runtime and shown via the shared RequestedEffectiveInspector. Crew template create/update/delete commands need owner adjudication against existing `cmd.orchestrator.*` IDs.

`gui_related: true`

---

## Plans/Permissions_System.md

### impact
Permissions manager demonstrates ordered last-match-wins rules with reorder, per-tool overrides, presets, read-only/full matrices, external-directory allowlist, doom-loop threshold/action, and per-Persona profiles across Global/Project/Package/Seam/Lane scope with requested/effective/origin. Requires wildcard help and ELI5 + Expert views. Rule add/update/reorder/delete carry revision/idempotency semantics; a test/dry-run returns an effective-decision projection (allow|deny|ask) with the matched rule and FileSafe floor applicability. Plan and Review modes remain effect-limited, not tool-free. The uncataloged `/permission/config` and `/tool/permission` signals must resolve to stable rows or be retired.

`gui_related: true`

---

## Plans/FileSafe.md

### impact
FileSafe remains the non-bypassable floor. The manager exposes health, effective boundary, protected scopes, and repair guidance without ever encouraging or offering bypass. FileSafe status is projected as a health summary (FileSafeFloorIndicator), not a disable toggle. Every permission rule mutation re-checks the floor; a rule that would bypass FileSafe or widen authority is rejected with a managed-policy error. `safety.protection.filesafe-integration` must never render as a disable control.

`gui_related: true`

---

## Plans/Models_System.md

### impact
Provider/Account/Model/Installation manager renders the full object model (Provider family -> Account/Profile -> Connection -> Product/Entitlement -> Models/capabilities; Host/Environment -> Provider installation) with all 17 provider fixtures, requested/effective model routes, the Free Models wrapper with underlying-setup flow, and catalog freshness/last-known-good fallback. Capability evidence (Fast/Normal, effort, modalities, tool/structured-output support, context limit) must not be inferred from model names. Free Models is a wrapper over underlying routes; it never owns credentials, quota, switching, or Usage. Catalog refresh preserves last-known-good rows during loading and records source version, check/import/activation times, and change history.

`gui_related: true`

---

## Plans/Multi-Account.md

### impact
Multi-account rows show nickname, discovered identity, authentication source, profile/config root, enabled state, priority, sticky-session preference, usage/quota, last successful connection/generation, health, and model visibility/favorites. PM must not pretend a CLI supports simultaneous profiles when it does not; supported strategies (native profile, isolated home, auth-only profile, credential pool, PM-managed direct connection, single-active-login) are surfaced honestly. `ai.accounts.requested-account-id` is the requested axis; effective account is projected at runtime with a fallback reason.

`gui_related: true`

---

## Plans/CLI_Bridged_Providers.md

### impact
Respects the CLI-owned OAuth boundary: Claude CLI and Antigravity CLI OAuth are CLI-owned (PM isolates profiles and launches the native flow; it does not present PM-direct OAuth). PM-direct OAuth may be used for OpenAI/Codex, GitHub, and GitHub Copilot. API connections remain separate from subscription/CLI products. The provider manager and the SecretField component must not present a PM-direct OAuth control for CLI-owned routes. Reconnect carries an explicit `auth_boundary` (cli_owned | pm_direct | api_key). Installation lifecycle (scan/install/update/repair/rollback/verify) reuses generic `catalog.install` / `catalog.update` / `catalog.remove` with provider-specific policy (explicit user-triggered acquisition, official source, exact Host/Environment; no baseline bundling or pre-seeding).

`gui_related: true`

---

## Plans/Provider_OpenCode.md

### impact
OpenCode external-server connection is one of the 17 fixtures. The manager shows endpoint, server auth (secret field, not raw text), model-list cache TTL, CLI path fallback, and the skip-Claude-Code-skills option. Reconnect respects the appropriate auth boundary; catalog refresh records discovery TTL and last-known-good. `ai.accounts.opencode-*` rows carry the standard requested/effective treatment.

`gui_related: true`

---

## Plans/agent-rules-context.md

### impact
Context & Instructions manager shows effective instruction sources, the AGENTS.md precedence chain, source hashes + lightness warnings, last request included/omitted blocks, persona footprint, selected vs installed tools, compaction strategy, cache compatibility, retrieval caps, and a context admission receipt. The registry must not be injected into prompts merely because Settings exposes it. `memory.assembly.integrity-tracking` feeds the source-hash display; `memory.assembly.history-admission-gate` governs the included/omitted receipt and must surface an AvailabilityReason when a turn is quarantined.

`gui_related: true`

---

## Plans/BinaryLocator_Spec.md

### impact
Installation resolution confidence (Proven / Strongly-identified / Probable / Ambiguous / Unknown) and update states (Ready / Update-available-Ask-first / Scheduled-when-idle / Rolled-back / Could-not-identify-method / Verifying / Needs-repair / Managed-externally) are projected from the BinaryLocator owner. Unknown/ambiguous ownership is manual-only — the manager never guesses npm/Homebrew from a bare command or path shape. Success requires exact path, launch health, auth/profile identity, model catalog, adapter handshake, required capabilities, and dependent-route refresh — not installer exit code alone. Scheduled-when-idle requires proven ownership, compatible target, no active requests, permission, resource preflight, and a reliable repair/rollback path.

`gui_related: false`

---

## Plans/Run_Modes.md

### impact
Back Seat Driver is Off / Auto (default) / On. Auto runs only when risk/phase triggers justify it; On may inspect all turns. BSD is read-only by default, receives bounded deltas, cannot widen authority, and cannot block primary work merely because it failed. Chat may override BSD for one turn or current thread. Advanced configuration may expose route, risk/phase triggers, usage guard, latency budget, privacy boundary, tool access, and health. The BSD setting row uses the standard value-set contract; On requires acknowledgment of all-turns inspection.

`gui_related: true`

---

## Plans/UI_Command_Catalog.md

### impact
Provisional settings/provider/memory/persona/crew/permission command families need adjudication against existing `catalog.*` and `UCC-*` IDs before minting canon. Retire `cmd.settings.bloom.open` (old chip/bloom architecture; compatibility alias only if an active consumer is found). Reuse `catalog.install`, `catalog.update`, `catalog.remove`, `catalog.install_item`, `catalog.update_item`, `catalog.remove_item` for generic lifecycle; reuse `cmd.account.select_profile`, `cmd.provider.switch_route`, `cmd.usage.refresh`, `cmd.usage.export`. A broad `cmd.nav.*` family must NOT be promoted (catalog forbids it); `cmd.settings.manager.open` must resolve as a navigation_wrapper over the route/open contract, with `cmd.project.open` as the route-targeting precedent. Resolve uncataloged signals `memory.gist.*`, `/permission/config`, `/tool/permission`; ensure retired aliases `requested_persona_id` / `effective_persona_id` do not reappear as payload fields.

`gui_related: false`

---

## Plans/Wiring_Matrix.production.json

### impact
Every user action in this concept traces the 9-step wiring rule (ui_source -> command -> canonical_owner -> validation/permission -> state_mutation_or_operation -> event/receipt/ObservableWork -> ui_projection -> usage/diagnostic_attribution -> recovery/deep_link). Persistent setting mutations and one-shot actions must carry distinct payload shapes and emit distinct event kinds (revision-bearing durable event vs ObservableWork receipt). Manager loading must not block the Settings workspace. No concept-only local state may masquerade as production wiring. New wiring rows for navigation, values, lifecycle, providers, memory/persona/crew, and permissions are provisional until the audit agent adjudicates canonical IDs.

`gui_related: false`

---

## Plans/DRY_Rules.md

### impact
Establishes the DRY component families this concept exercises (candidate design roles, not final IDs): SettingsDestination, SettingsNotice, SettingsWorkspaceShell, SettingsSearch, CategoryNavigation, SubcategoryScrollspy, SettingRow, ValueSourceBadge, AvailabilityReason, RequestedEffectiveInspector, ManagerShell, ResourceList, HealthSummary, SecretField, MemoryRow, PersonaCard, CrewTemplate, PermissionRuleEditor, SetupFlowLauncher, ObservableOperation, ReceiptLink, ProviderFamilyCard, AccountConnectionRow, InstallationCard, ModelRow, CapabilityEvidence, UsagePlanSummary, FileSafeFloorIndicator. The RequestedEffectiveInspector is shared across five families (provider/model, Goal worker/reviewer, Crew members/concurrency, Persona capabilities, Permissions effective result) to prevent per-manager divergence.

`gui_related: true`

---

## Cross-cutting supersessions (apply across owners)

- **Retire** `cmd.settings.bloom.open` and the chip/bloom/no-sidebar Settings architecture. (`gui_related: true`)
- **Retire** stale `regular/yolo` mode coupling; conversation mode and access profile are separate axes. (`gui_related: false`)
- **Retire** stale right-panel-only Settings language; left Activity Bar canon + full workspace governs. (`gui_related: true`)
- **Invalidate** inventory values represented as bare scalars for requested/effective domains (provider/model/Goal/Crew/Permission/Memory) — migrate to the requested/effective/origin triple. (`gui_related: false`)
- **Retire** `requested_persona_id` / `effective_persona_id` as command payload fields. (`gui_related: false`)
- **Prohibit** Playwright runtime/facade/compatibility terminology and PM-owned Playwright packages/ports/MCP/commands/capture — PM-native Browser Program only. (`gui_related: false`)
- **Prohibit** SQLite. (`gui_related: false`)
