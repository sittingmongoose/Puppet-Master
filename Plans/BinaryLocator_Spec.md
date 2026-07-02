# BinaryLocator Spec (Canonical)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Purpose
Provide a **deterministic, testable** mechanism for Puppet Master to locate and validate **external Provider CLIs** (initially **Cursor Agent** and **Claude Code**) across **Windows / macOS / Linux**, using only their **official install methods**. (ContractRef: Primitive:Provider)

## Non-goals
- Installing, updating, or uninstalling Provider CLIs. (ContractRef: Primitive:Provider)
- Filesystem crawling or heuristic "best guess" scanning beyond the explicitly enumerated probe layers below. (ContractRef: Primitive:Provider)
- Provider orchestration, authentication, or model discovery (owned by Provider layer). (ContractRef: Primitive:Provider)
- Locating, installing, updating, uninstalling, or health-checking the PM-managed bundled browser runtime is out of scope; browser runtime distribution, including any CEF/`wef`/`cargo-wef` packaging path, is owned by the promoted browser/runtime docs. (ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/newtools.md)

Usage source metadata emitted from binary/provider discovery uses the locked `usage_source_kind` vocabulary: `provider_runtime_usage`, `provider_quota_api`, `provider_usage_api`, `provider_error_hint`, and `project_rollup`. Binary location only reports which source kind is available or detected; canonical usage accounting remains owned by `Plans/usage-feature.md`.

BinaryLocator diagnostics must not define `/outcome` or reason-code taxonomies and must not own bridge-side `usage-field` or failure-class mapping. Those contracts remain in `Plans/Run_Modes.md` and `Plans/CLI_Bridged_Providers.md`; BinaryLocator only emits discovery traces that those owners can classify.

---

## Canonical references and constraints (SSOT; DRY)

### Locked decisions (no drift)


- Platform name is **Puppet Master** only. (ContractRef: Invariant:INV-010)
- UI toolkit is **Slint 1.17.0 on Rust stable 1.96.1** as verified on 2026-07-02; Iced is legacy. (ContractRef: SchemaID:spec_lock)
- Storage is **seglog + redb + Tantivy**; SQLite is forbidden. (ContractRef: SchemaID:spec_lock)

### Canonical sources (reference, don't duplicate)


- Primitive ownership boundaries: `Plans/Crosswalk.md` (ContractRef: Primitive:Provider)
- DRY / ContractRef rule: `Plans/DRY_Rules.md` §7 (ContractRef: SchemaID:spec_lock)
- Autonomy / deterministic defaults: `Plans/Decision_Policy.md` (ContractRef: SchemaID:spec_lock)
- Contracts baseline (providers, tools, events): `Plans/Contracts_V0.md` (ContractRef: SchemaID:spec_lock)
- Storage envelopes + transition note: `Plans/storage-plan.md` §2.2 (ContractRef: SchemaID:EventEnvelopeV1)
- Naming rules + canonical terms: `Plans/Glossary.md` (ContractRef: SchemaID:spec_lock)

### Legacy-code anchor note (read-only)
This spec may cite `puppet-master-rs/src/...` paths as **legacy-code behavior anchors** only.
- Those paths are **not** the canonical SSOT for the rewrite architecture (see Spec Lock). (ContractRef: SchemaID:spec_lock)
- When conflicts exist, follow Decision Policy precedence: **Spec Lock → Crosswalk → DRY Rules → Glossary → Decision Policy defaults**. (ContractRef: SchemaID:spec_lock)

Packet-derived output boundary: when BinaryLocator is mentioned in reconciliation packets, packet doc intent buckets include `MUST CHANGE` and `MUST RECONCILE` docs only; `MUST VERIFY` docs are review inputs rather than primary write targets. Derived-only outputs such as ledger summaries, audit tables, and cross-reference matrices are research artifacts, not BinaryLocator doc intents. If packet material restates a behavior owned by another canonical doc, REFERENCE that owner doc instead of duplicating the behavior inline.

### Cross-owner boundary constraints

BinaryLocator preserves the following routed boundary constraints when provider or binary-discovery packet material exposes wider platform drift:
- Agent coordination state MUST remain event-sourced through `seglog` / `redb` and `/redb` storage; `active-agents.json` and `active-agents` views may be debug mirrors only, because using a flat agent file as canonical state creates split-brain risk.
- `Plans/interview-subagent-integration.md` / `/interview-subagent-integration.md` consumers with field-name drift, pseudo-tier execution-key bugs, or simultaneous field-name and scope-language drift must normalize through the runtime, route, and contract owners instead of teaching BinaryLocator new execution identity.
- `usage_event_ref` is a locator-grade structured locator, not a display string, timestamp heuristic, or opaque replacement ID family; chat/interview/wizard actors, including `/interview/wizard` flows, may share provider `/runtime` but must stay ontology-separated from orchestration nodes.
- Hard spec-integrity defects such as duplicate sections, duplicate numbering, internally contradictory migration rules, stale approval-model command contracts, and exact command-arg mismatches are contract failures; BinaryLocator references the owning command, approval, or migration doc rather than masking them as style cleanup.
- Terminology drift in `Plans/Glossary.md`, `Plans/Decision_Policy.md`, and `Plans/Crosswalk.md` must adopt Seam/Lane/Overseer/Package vocabulary, including `/Glossary.md`, `/Decision_Policy.md`, `/Crosswalk.md`, and `/Lane/Overseer/Package` references; stale `newfeatures.md` four-tier hierarchy and `no new tiers` claims must not override the `chain-wizard-flexibility.md` / chain-wizard-flexibility node-graph model.
- `Plans/Executor_Protocol.md` / `/Executor_Protocol.md` remains the owner for execution-core duplicate canonical sections plus mint, `/handshake`, and handoff rules; BinaryLocator must not absorb those rules while validating provider binaries.
- `storage-plan.md`, storage-plan, and `FileManager.md` remain consumers of canonical route identity, not owners that can redefine it locally; BinaryLocator traces and cache keys must follow route/runtime owners when a provider discovery outcome is opened or inspected.
- `Permissions_System.md` / Permissions_System approval cache and reject-cascade behavior must be scoped by multi-lane, shared-runtime actor separation rather than globally session-scoped state; BinaryLocator diagnostics may reference permission results but must not define permission scope.
- `Plans/assistant-chat-design.md` / `/assistant-chat-design.md` must not be over-corrected when provider/runtime packet material touches chat surfaces: assistant-chat-design is mostly aligned, no longer a main drift multiplier, and any remaining compatibility-oriented drift stays with the chat owner instead of becoming BinaryLocator behavior.
- Approval and blocking seams that expose blocked-family mismatch, scope-language drift, or graph command payload drift route to the HITL, runtime, Run Graph, Orchestrator, and command owners; BinaryLocator must not encode those seams as locator state, binary validation, or provider discovery contracts.
- Orchestrator GUI/help copy drift is a glossary/help coverage dependency: newer Orchestrator concepts need `GUI` and `/help` coverage before user-facing copy can stabilize, and BinaryLocator diagnostics may reference those owners without minting local help vocabulary.

---

## Terminology (index only)
- **Provider** is the canonical term (not "runner"). (ContractRef: SchemaID:spec_lock)
- **Session** is the canonical user-facing term; legacy terminology must not appear in user-facing text. (ContractRef: Invariant:INV-010)
- This spec uses **probe layer** terminology to avoid conflicting with the four-tier hierarchy naming rule. (ContractRef: SchemaID:spec_lock)

---

## BinaryLocator boundary
BinaryLocator is a **Provider-owned** discovery + validation + trace service. (ContractRef: Primitive:Provider)

### Contract shape


#### Input (conceptual)
`BinaryLocateRequest` is a conceptual contract; concrete types belong in the Provider domain. (ContractRef: Primitive:Provider)

Required fields:
- `provider_cli`: enum identifying which CLI is being located (Cursor Agent, Claude Code). (ContractRef: Primitive:Provider)
- `force_rescan`: boolean; when `true`, bypass all caches and re-probe the filesystem. (ContractRef: Primitive:Provider)

Optional fields:
- `workspace_root`: absolute path; used **only** for workspace-scoped caching keys (must not expand filesystem probing scope). (ContractRef: Primitive:Provider)
- `override_path`: user-provided path string sourced from Setup/Health **manual path** controls for Cursor/Claude; see Override semantics below. (ContractRef: ConfigKey:advanced_config.cli_paths)
- `env_path`: effective PATH string used for PATH lookup. (ContractRef: Primitive:Provider)

#### Output (conceptual)
`BinaryLocateResult`:
- `status`: `Found | NotFound | FoundButInvalid`. (ContractRef: Primitive:Provider)
- `resolved_path`: absolute path when `Found`. (ContractRef: Primitive:Provider)
- `resolved_name`: candidate binary name that matched (e.g., `agent`, `cursor-agent`, `claude`). (ContractRef: Primitive:Provider)
- `source_layer`: `Override | PATH | CommonLocations | Launchers`. (ContractRef: Primitive:Provider)
- `version`: optional parsed version string. (ContractRef: Primitive:Provider)
- `validation`: `Valid | Invalid(BinaryErrorCode)`. (ContractRef: Primitive:Provider)
- `trace`: ordered list of probe attempts:
  - `layer`: one of the `source_layer` values
  - `candidate`: string (ContractRef: Primitive:Provider)
  - `probe_kind`: `DirectPath | PATHLookup | DirectoryJoin | LauncherResolution` (ContractRef: Primitive:Provider)
  - `result`: `Hit | Miss | HitButInvalid(BinaryErrorCode)` (ContractRef: Primitive:Provider)

#### Trace emission (storage contract note)
BinaryLocator's `trace` is diagnostic data that SHOULD be emitted as events when the event model is available; until then, it is returned as structured data to the caller. (ContractRef: SchemaID:EventEnvelopeV1)
AutoDecision: Until callers have a persisted event writer available, return `trace` only in `BinaryLocateResult`; once available, emit both persisted `EventRecord` diagnostics and return `trace` for deterministic UX/debuggability. (ContractRef: PolicyRule:Decision_Policy.md§4, ContractName:Plans/Contracts_V0.md#EventRecord)

> Compatibility note: storage-plan defines `EventEnvelopeV1` as a minimal envelope; Contracts V0 defines `EventRecord` as the canonical persisted envelope with additional required fields; implementations must emit full `EventRecord` envelopes, while readers may accept both during transition. (ContractRef: SchemaID:EventEnvelopeV1, ContractName:Plans/Contracts_V0.md#EventRecord)

---

## Deterministic discovery algorithm

### Probe-layer order (hard requirement)


BinaryLocator MUST attempt probe layers in this exact order and MUST return the **first Valid hit**. (ContractRef: Primitive:Provider)
1) `Override`
2) `PATH`
3) `CommonLocations`
4) `Launchers`

Tie-break rules (deterministic):
- Earlier probe layer wins. (ContractRef: Primitive:Provider)
- Within a layer, earlier candidate name wins (ordered by SSOT list). (ContractRef: Invariant:INV-005)
- Within a candidate name, earlier candidate path in that layer's enumerated list wins. (ContractRef: Primitive:Provider)

Candidate name ordering MUST come from a single SSOT list owned by the Provider domain. (ContractRef: Invariant:INV-005)
- Legacy anchor: `puppet-master-rs/src/platforms/platform_specs.rs` `PlatformSpec.cli_binary_names`.

---

### Probe layer: Override
Goal: honor explicit user selection and fail fast with actionable errors if the override is wrong. (ContractRef: ConfigKey:advanced_config.cli_paths)

Rules:
- If `override_path` is `None`/empty, skip this layer. (ContractRef: ConfigKey:advanced_config.cli_paths)
- `override_path` input is valid only for Cursor Agent and Claude Code rows exposed in Setup/Health UI; other tools must not emit this field. (ContractRef: ConfigKey:advanced_config.cli_paths)
- Setup/Health manual-path UX contract is: `Use manual path` checkbox + native file picker. If the checkbox is off, callers MUST pass `override_path = None`. (ContractRef: ConfigKey:advanced_config.cli_paths)
- `override_path` normalization MUST be deterministic. (ContractRef: Primitive:Provider)
  - Expand `~` (home) on Unix-like systems. (ContractRef: Primitive:Provider)
  - Expand `%VAR%` / `$Env:VAR`-style tokens on Windows if present. (ContractRef: Primitive:Provider)
  - If a relative path is provided, resolve it against `workspace_root` if present; otherwise treat it as invalid. (ContractRef: Primitive:Provider)
- If the override path is a directory, probe `override/<candidate_name>` for each candidate name. (ContractRef: Primitive:Provider)
- If the override path is a file path, probe that exact path only. (ContractRef: Primitive:Provider)

Outcome rules:
- If an override path exists but fails validation, return `FoundButInvalid(OverrideInvalid)` and DO NOT fall back to other layers. (ContractRef: Primitive:Provider)
- If an override path does not exist, return `FoundButInvalid(OverrideMissing)` and DO NOT fall back to other layers. (ContractRef: Primitive:Provider)

---

### Probe layer: PATH
Goal: locate the CLI using the effective PATH without guessing. (ContractRef: Primitive:Provider)

Rules:
- For each candidate name, perform an OS-native PATH lookup. (ContractRef: Primitive:Provider)
- If a PATH hit fails validation, continue searching other candidate names in PATH. (ContractRef: Primitive:Provider)
- If no valid PATH hit exists, proceed to `CommonLocations`. (ContractRef: Primitive:Provider)

Legacy anchor: `which::which()` is used today in `puppet-master-rs/src/platforms/path_utils.rs`.

---

### Probe layer: CommonLocations
Goal: find official installs that may not be present in PATH (GUI apps, package-manager shims, user-local bin). (ContractRef: Primitive:Provider)

Rules:
- Enumerate absolute candidate paths from Provider-owned SSOT data in a stable order. (ContractRef: Invariant:INV-005)
- Expand `~` where applicable. (ContractRef: Primitive:Provider)
- De-duplicate by normalized absolute path string; first occurrence wins. (ContractRef: Primitive:Provider)
- Probe each candidate path with existence + validation. (ContractRef: Primitive:Provider)
- Candidate paths MUST be limited to official/default footprints and explicit user override path; legacy/pre-rewrite binary locations MUST NOT be included. (ContractRef: Primitive:Provider)
- If none succeed, proceed to `Launchers`. (ContractRef: Primitive:Provider)

Legacy anchors (read-only):
- `puppet-master-rs/src/platforms/platform_specs.rs` `PlatformSpec.default_install_paths`.
- `puppet-master-rs/src/platforms/path_utils.rs` `get_fallback_directories()`.

---

### Probe layer: Launchers
Goal: support official installers that place versioned bundles behind deterministic wrappers/symlinks. (ContractRef: Primitive:Provider)

Rules:
- This layer MUST be restricted to explicit deterministic rules; no broad filesystem crawling is permitted. (ContractRef: Primitive:Provider)

#### Cursor Agent versioned bundle resolution (required)
When `provider_cli == Cursor Agent`, BinaryLocator MUST be able to probe the versions subtree deterministically. (ContractRef: Primitive:Provider)

Candidate roots (by OS):
- Unix / WSL: `~/.local/share/cursor-agent/versions/` (ContractRef: Primitive:Provider)
- Windows Native: `%LOCALAPPDATA%\\cursor-agent\\versions\\` (ContractRef: Primitive:Provider)

Selection rule (deterministic):
- Enumerate immediate child directory names under the versions directory and select the lexicographically greatest name using byte-order string comparison. (ContractRef: Primitive:Provider)
- Treat directory names as opaque strings (no semantic version parsing). (ContractRef: Primitive:Provider)
- Probe `.../<chosen>/cursor-agent` (Unix/WSL) or `...\\<chosen>\\cursor-agent.exe` (Windows Native), then validate. (ContractRef: Primitive:Provider)

Legacy anchor: `puppet-master-rs/src/install/script_installer.rs` (Cursor shim notes).

#### Windows launcher wrappers (required)


If a candidate ends with `.cmd` or `.bat`, treat it as a launcher and validate via the standard validation contract. (ContractRef: Primitive:Provider)

If no launcher rule yields a valid hit, return `NotFound`. (ContractRef: Primitive:Provider)

---

## Deterministic discovery algorithm

### Remote indexer binary locator

For non-Git remote projects, PM ships a standalone sparse n-gram indexer binary per target architecture. The binary is a PM-managed build helper, not a provider CLI, and is used only to build the remote-side snapshot that will later be queried locally.

Remote indexer `/deployment` and `/reconciliation` stay bounded here: BinaryLocator deterministically selects, transfers, verifies, and cleans up the PM-built helper binary, while `Plans/GitHub_Integration.md` owns remote project flow and `Plans/storage-plan.md` owns regex-index storage/cache semantics.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

**Shipped architectures:** x86_64 and aarch64.

**Remote architecture detection:** Run `uname -m` over SSH before transfer to determine the correct binary.

**Deployment rules:**
- On first use for a remote project, PM scp's the matching indexer binary to the remote host.
- After transfer, PM integrity-checks the binary via xxh3 hash comparison.
- PM MUST NOT execute binaries received from the remote host; it only transfers and runs PM-built helper binaries.
- If no matching binary is available for the detected architecture, PM falls back to unindexed ripgrep over SSH and surfaces degraded acceleration rather than attempting cross-architecture execution.

ContractRef: Invariant:INV-002, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/GitHub_Integration.md

**Cleanup:**
- The helper binary (roughly 5 MB) is left on the remote host for reuse across sessions.
- On project close or disconnect, PM may offer optional cleanup.
- On uninstall, PM performs best-effort cleanup over SSH.

## Validation contract (commands, version parsing, permission checks)

### Command selection (SSOT)


BinaryLocator MUST use a Provider-owned SSOT version command for each `provider_cli`. (ContractRef: Invariant:INV-005)
- Legacy anchor: `puppet-master-rs/src/platforms/platform_specs.rs` `PlatformSpec.version_command`.

### Execution rules
- Execute: `<resolved_path> <version_command...>` with a 5s timeout. (ContractRef: Primitive:Provider)
- The child process environment MUST set an enhanced PATH to reduce false negatives for launcher scripts. (ContractRef: Primitive:Provider)
  - Legacy anchor: `puppet-master-rs/src/platforms/path_utils.rs` `build_enhanced_path_for_subprocess()`.

### Version parsing (deterministic)
BinaryLocator MUST parse `version` using this deterministic rule order. (ContractRef: Primitive:Provider)
1) If stdout+stderr contains a `\d+\.\d+\.\d+` pattern, return the first match.
2) Else return the first non-empty trimmed line from stdout, else from stderr.
3) Else return `None`.

Legacy anchors (behavior compatibility):
- `puppet-master-rs/src/platforms/platform_detector.rs` `extract_version()`.
- `puppet-master-rs/src/doctor/installation_manager.rs` `extract_version()`.

### Permission checks (lightweight)
- Unix-like: candidate should have at least one execute bit OR execution attempt is authoritative. (ContractRef: Primitive:Provider)
- Windows: candidate should be `.exe`, `.cmd`, `.bat`, or otherwise OS-executable; execution attempt is authoritative. (ContractRef: Primitive:Provider)

### Functional validation outcome
A candidate is `Valid` if the version command completes within timeout and yields either:
- success exit code, OR (ContractRef: Primitive:Provider)
- a non-empty parsed `version`. (ContractRef: Primitive:Provider)

A candidate is `Invalid` if:
- spawn fails (ENOENT/permission/security block), OR (ContractRef: Primitive:Provider)
- timeout occurs, OR (ContractRef: Primitive:Provider)
- exit is non-zero AND no version can be parsed. (ContractRef: Primitive:Provider)

Optional collision guard: if output strongly identifies as a different Provider CLI, return `WrongBinary`. (ContractRef: Primitive:Provider)
AutoDecision: Collision guard is **disabled by default** until Provider SSOT defines deterministic `WrongBinary` signatures; implementations MUST NOT introduce heuristic string matching beyond that SSOT. (ContractRef: PolicyRule:Decision_Policy.md§4, ContractName:Plans/DRY_Rules.md#4-forbidden-patterns-drift-accelerators)

---

## Caching and invalidation

### Cache scopes
BinaryLocator MUST maintain: (ContractRef: Primitive:Provider)
- A per-user persistent cache (durable KV) keyed by `provider_cli`. (ContractRef: Primitive:SessionStore)
- A per-workspace ephemeral cache keyed by `(provider_cli, workspace_fingerprint)` during the current Session. (ContractRef: Primitive:Provider)

### Cache read policy


- If `force_rescan == true`, do not read caches. (ContractRef: Primitive:Provider)
- Otherwise, cached entries MUST be fast-validated before being returned. (ContractRef: Primitive:Provider)

### Cache write/eviction policy
- On `Found(Valid)`, write-through to caches in scope. (ContractRef: Primitive:Provider)
- On `FoundButInvalid`, evict matching cached entries. (ContractRef: Primitive:Provider)
- On `NotFound`, evict workspace cache; evict user cache if it fails fast validation. (ContractRef: Primitive:Provider)

---

## Error taxonomy (stable codes)
BinaryLocator MUST return stable error codes suitable for UI rendering, logs, and evidence bundles. (ContractRef: Primitive:Provider)

| Code | Meaning | Typical layer |
|---|---|---|
| `OverrideMissing` | Override path was set but does not exist | Override |
| `OverrideInvalid` | Override path exists but fails validation | Override |
| `NotFound` | No candidate found in any layer | Any |
| `NotExecutable` | File exists but cannot be executed (permissions) | Any |
| `BlockedByOSSecurity` | OS blocked execution (e.g., quarantine / SmartScreen) | Any |
| `Timeout` | Version command timed out | Any |
| `MissingRuntime` | Launcher ran but failed due to missing runtime (commonly Node.js) | PATH/CommonLocations/Launchers |
| `WrongBinary` | Output identifies a different Provider CLI | Any |

### UI mapping (DRY)
- UI copy, buttons, and view behavior MUST be specified in the canonical UI SSOT (`Plans/FinalGUISpec.md` + typed commands in `crates/ui_commands/`), using these stable error codes and the `trace` output as inputs. (ContractRef: Invariant:INV-003)
- Setup + Health/Doctor map BinaryLocator results for Cursor/Claude as follows: `Found` → Installed, `NotFound` → Not Installed, `FoundButInvalid` → Failed (show `BinaryErrorCode` + trace details). (ContractRef: Invariant:INV-003)
- Manual path controls are Cursor/Claude only: a `Use manual path` checkbox gates a native file picker value that is passed as `override_path`; toggling off clears `override_path` and reverts to normal probe layers. (ContractRef: ConfigKey:advanced_config.cli_paths)
- Playwright installation state is out of scope for BinaryLocator and must be driven by Browser Tools health checks, not Provider CLI lookup. (ContractRef: Primitive:Provider)

---

## Acceptance criteria (testable)

### Evidence + gates
- Any implementation node for BinaryLocator MUST produce an evidence bundle that references the ContractRefs in this spec. (ContractRef: SchemaID:evidence_bundle)
- Operational statements in code and updated plan docs MUST satisfy GATE-009 ContractRef coverage. (ContractRef: SchemaID:spec_lock)

### Discovery matrix (OS × install method)
Expected result includes probe layer and a representative resolved path pattern.

| OS | Provider CLI | Supported footprint (SSOT) | Test PATH setup | Expected first-hit probe layer | Expected resolved path pattern |
|---|---|---|---|---|
| macOS | Cursor Agent | User-local shim (`~/.local/bin/agent`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: CommonLocations) | Exclude `~/.local/bin` from PATH | CommonLocations | `~/.local/bin/agent` |
| macOS | Cursor Agent | Homebrew shim (`/opt/homebrew/bin/agent`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: PATH) | Include `/opt/homebrew/bin` in PATH | PATH | `/opt/homebrew/bin/agent` |
| Linux | Cursor Agent | System shim (`/usr/local/bin/agent`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: PATH) | Include `/usr/local/bin` in PATH | PATH | `/usr/local/bin/agent` |
| Windows (Native) | Cursor Agent | User-local shim (`%LOCALAPPDATA%\\cursor-agent\\agent.exe`) (SSOT: `Plans/FinalGUISpec.md` Cursor install (Windows Native)) | Exclude `%LOCALAPPDATA%\\cursor-agent` from PATH | CommonLocations | `%LOCALAPPDATA%\\cursor-agent\\agent.exe` |
| Windows (WSL) | Cursor Agent | User-local shim in WSL (`~/.local/bin/agent`) (SSOT: `Plans/FinalGUISpec.md` Cursor Windows policy) | Exclude `~/.local/bin` (inside WSL) from PATH | CommonLocations | `~/.local/bin/agent` |
| macOS | Claude Code | Homebrew shim (`/opt/homebrew/bin/claude`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: PATH) | Include `/opt/homebrew/bin` in PATH | PATH | `/opt/homebrew/bin/claude` |
| Linux | Claude Code | User-local shim (`~/.local/bin/claude`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: CommonLocations) | Exclude `~/.local/bin` from PATH | CommonLocations | `~/.local/bin/claude` |
| Windows | Claude Code | npm shim (`%APPDATA%\\npm\\claude.cmd`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: PATH) | Include `%APPDATA%\\npm` in PATH | PATH | `%APPDATA%\\npm\\claude.cmd` |
| Windows | Claude Code | WinGet link (`%LOCALAPPDATA%\\Microsoft\\WinGet\\Links\\claude.exe`) (SSOT: `Plans/BinaryLocator_Spec.md` Probe layer: CommonLocations) | Exclude `%LOCALAPPDATA%\\Microsoft\\WinGet\\Links` from PATH | CommonLocations | `%LOCALAPPDATA%\\Microsoft\\WinGet\\Links\\claude.exe` |

### Functional acceptance checks
1. Determinism: repeated runs on a fixed filesystem snapshot return identical `source_layer`, `resolved_path`, and `resolved_name`. (ContractRef: Primitive:Provider)
2. Override semantics: invalid override returns `FoundButInvalid(OverrideInvalid)` with no fallback probing. (ContractRef: ConfigKey:advanced_config.cli_paths)
3. Validation: every `Found` result has passed version-command validation and returns `version` when parseable. (ContractRef: Primitive:Provider)
4. Trace completeness: `trace` includes every attempted candidate in order, including misses. (ContractRef: Primitive:Provider)
5. Cache correctness: cached paths are never returned without fast validation; invalid cached paths are evicted. (ContractRef: Primitive:SessionStore)
6. Force rescan: `force_rescan=true` bypasses caches and updates results even if a cached value is still valid. (ContractRef: Primitive:Provider)
7. Windows launcher support: `.cmd`/`.bat` candidates are validated as executable launchers. (ContractRef: Primitive:Provider)
8. Cursor versions subtree: when only the versions bundle exists, the Launchers layer resolves and validates the latest lexicographic entry. (ContractRef: Primitive:Provider)
9. Manual-path UX contract: only Cursor/Claude expose manual-path controls; unchecked state emits no `override_path`; checked state emits exactly the file-picker path. (ContractRef: ConfigKey:advanced_config.cli_paths)
10. UI state mapping determinism: identical `BinaryLocateResult` values always map to the same Setup/Health install-state label (`Installed`, `Not Installed`, `Failed`). (ContractRef: Invariant:INV-003)

---

## References
- `Plans/Spec_Lock.json` (locked stack; forbidden deps) (ContractRef: SchemaID:spec_lock)
- `Plans/Crosswalk.md` (Provider ownership boundary) (ContractRef: Primitive:Provider)
- `Plans/DRY_Rules.md` (SSOT + ContractRef rule) (ContractRef: SchemaID:spec_lock)
- `Plans/Glossary.md` (terminology + naming rules) (ContractRef: SchemaID:spec_lock)
- `Plans/Decision_Policy.md` (deterministic defaults) (ContractRef: SchemaID:spec_lock)
- `Plans/Contracts_V0.md` (provider/tool/event contracts) (ContractRef: ContractName:Contracts_V0.md)
- `Plans/storage-plan.md` (EventEnvelopeV1 compatibility note) (ContractRef: SchemaID:EventEnvelopeV1)
- Legacy behavior anchors (read-only):
  - `puppet-master-rs/src/platforms/platform_specs.rs`
  - `puppet-master-rs/src/platforms/path_utils.rs`
  - `puppet-master-rs/src/platforms/platform_detector.rs`
  - `puppet-master-rs/src/install/script_installer.rs`

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/BinaryLocator_Spec.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### BS-001 - BinaryLocator Spec (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: BS-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after
  Phase 2B atomized BinaryLocator_Spec-S0001 through BinaryLocator_Spec-S0043
  into BS-002 through BS-024. BS-001 remains only as migration lineage for the
  retired bridge span and must not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - BS-001 no longer uses the source-preserving PlanUnit compile hint.
  - Prior source coverage remains carried by BS-002 through BS-024.
  - The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
  - Coverage for the retired bridge is recorded in the Phase 2B batch 014 coverage map.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0044
preserved_exact_tokens:
  - "BS-001"
  - "source_preserving_planunit"
  - "BS-002"
  - "BS-024"
negative_constraints:
  - "Do not remap atomized BinaryLocator spans back to BS-001."
  - "Do not treat the retired bridge as implementation-ready product coverage."
  - "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
  - "The old source-preserving bridge is retained only so migration lineage and historical references to BS-001 remain auditable."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into binary/provider launcher discovery requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### BS-026 - Provider Launcher Metadata For Antigravity And CLI Runtime Routes

```yaml
plan_unit_id: BS-026
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  Binary/provider launcher discovery must include provider-owned setup-health metadata for active CLI-runtime routes such as Antigravity `agy`, Claude Code `claude`, and Cursor `cursor-agent` while keeping Codex, GitHub Copilot, OpenCode server, and direct coding-plan providers out of required CLI bridge discovery. `agy` discovery is version-gated and records command templates, account-root/env requirements, model-list support, prompt-output proof state, and unsupported format caveats without storing secrets.
gui_related: false
gui_classification_reason: Binary discovery and launcher metadata are backend setup contracts, though GUI consumes status.
depends_on: [CBP-020, CBP-021, CBP-022]
unblocks: [F3-400]
acceptance_criteria:
  - "`agy` is a first-class active CLI-runtime launcher entry."
  - Launcher metadata tracks setup health, version, command templates, output-proof state, and account-root/env requirements.
  - Direct providers are not incorrectly marked as requiring CLI bridge binaries.
  - Secret material is never captured in launcher metadata.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_launcher_discovery_drift
reasoning_tier: standard
context_scope: provider_launcher_metadata
implementation_surfaces: [Plans/BinaryLocator_Spec.md, future binary locator, future provider setup health registry]
node_compile_hint: {mode: provider_launcher_metadata, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0019
  - pldg-20260624-001-provider-updates:atom-0020
  - pldg-20260624-001-provider-updates:atom-0116
source_atom_ids: [atom-0019, atom-0020, atom-0022, atom-0023, atom-0054, atom-0061, atom-0087, atom-0088, atom-0116, atom-0132]
preserved_exact_tokens: ["agy", "Antigravity CLI", "claude", "cursor-agent", "version-gate", "setup-health", "--print-timeout", "agy models", "command templates", "output-level proof"]
negative_constraints:
  - Do not require Copilot CLI discovery for GitHub Copilot direct hosted API support.
  - Do not require Codex CLI discovery for Codex/OpenAI direct provider support.
  - Do not store provider secret material in launcher metadata.
owner_hints: [Plans/BinaryLocator_Spec.md, Plans/CLI_Bridged_Providers.md, Plans/FinalGUISpec.md, Plans/Contracts_V0.md]
```

### BS-002 - BinaryLocator Authority, Purpose, And Non-Goals

```yaml
plan_unit_id: BS-002
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  BinaryLocator remains the canonical Provider-owned location and validation
  spec for external Provider CLIs, preserving the Puppet Master naming rule,
  deterministic/testable purpose, official-install boundary, usage source
  metadata boundary, and diagnostics non-ownership constraints.
gui_related: false
gui_classification_reason: Provider discovery scope, usage metadata routing, and diagnostics ownership are backend contract boundaries.
split_recommended: false
depends_on: []
unblocks: [BS-006, BS-007, BS-008, BS-009]
acceptance_criteria:
  - The document title and compliance statement preserve the Puppet Master naming and deterministic-default requirements.
  - BinaryLocator locates and validates external Provider CLIs for Cursor Agent and Claude Code across Windows, macOS, and Linux.
  - BinaryLocator does not install, update, uninstall, crawl heuristically, orchestrate providers, authenticate, discover models, or own PM-managed browser runtime health.
  - BinaryLocator only reports detected usage_source_kind availability and does not own canonical usage accounting.
  - BinaryLocator diagnostics do not define /outcome, reason-code taxonomies, bridge-side usage-field mapping, or failure-class mapping.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_scope_boundary
reasoning_tier: high
context_scope: provider
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/Run_Modes.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: binarylocator_authority_scope_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0003
preserved_exact_tokens:
  - "BinaryLocator Spec (Canonical)"
  - "Puppet Master"
  - "deterministic, testable"
  - "external Provider CLIs"
  - "Cursor Agent"
  - "Claude Code"
  - "official install methods"
  - "usage_source_kind"
  - "provider_runtime_usage"
  - "provider_quota_api"
  - "provider_usage_api"
  - "provider_error_hint"
  - "project_rollup"
  - "/outcome"
  - "usage-field"
  - "failure-class"
negative_constraints:
  - "BinaryLocator must not install, update, or uninstall Provider CLIs."
  - "BinaryLocator must not perform filesystem crawling or heuristic best-guess scanning beyond enumerated probe layers."
  - "BinaryLocator must not own provider orchestration, authentication, model discovery, PM-managed browser runtime distribution, canonical usage accounting, /outcome taxonomies, bridge-side usage-field mapping, or failure-class mapping."
owner_boundary_notes:
  - "Canonical usage accounting remains owned by Plans/usage-feature.md."
  - "Diagnostics classification remains owned by Plans/Run_Modes.md and Plans/CLI_Bridged_Providers.md."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-003 - BinaryLocator Locked Platform Decisions

```yaml
plan_unit_id: BS-003
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator inherits the locked Puppet Master platform name, Slint 1.17.0 on Rust stable 1.96.1 UI toolkit decision, and seglog/redb/Tantivy storage stack while preserving the SQLite prohibition.
gui_related: true
gui_classification_reason: The locked decision span includes the user-interface toolkit requirement Slint 1.17.0 on Rust stable 1.96.1 and the legacy Iced prohibition.
split_recommended: false
depends_on: [BS-002]
unblocks: [BS-005, BS-019]
acceptance_criteria:
  - The platform name remains Puppet Master only.
  - UI toolkit references use Slint 1.17.0 on Rust stable 1.96.1, reverified before implementation, and treat Iced as legacy.
  - Storage references use seglog, redb, and Tantivy.
  - SQLite remains forbidden.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: locked_stack_drift
reasoning_tier: standard
context_scope: platform
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_locked_platform_decisions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0004
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0005
preserved_exact_tokens:
  - "Canonical references and constraints (SSOT; DRY)"
  - "Puppet Master"
  - "Rust stable 1.96.1"
  - "Slint 1.17.0"
  - "Iced is legacy"
  - "seglog + redb + Tantivy"
  - "SQLite is forbidden"
  - "Invariant:INV-010"
  - "SchemaID:spec_lock"
negative_constraints:
  - "BinaryLocator must not reintroduce Iced or SQLite as valid rewrite choices."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-004 - BinaryLocator Canonical References And Legacy Anchors

```yaml
plan_unit_id: BS-004
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  BinaryLocator references primitive, DRY, decision, contract, storage, and
  glossary owners without duplicating them, treats legacy puppet-master-rs paths
  as read-only behavior anchors, and preserves the packet-derived output
  boundary for MUST CHANGE, MUST RECONCILE, and MUST VERIFY material.
gui_related: false
gui_classification_reason: Canonical reference routing, legacy anchors, and packet intent handling are documentation-governance constraints.
split_recommended: false
depends_on: [BS-002]
unblocks: [BS-005, BS-009, BS-014, BS-015]
acceptance_criteria:
  - BinaryLocator references canonical owner docs rather than duplicating their contracts.
  - Legacy puppet-master-rs paths remain read-only behavior anchors and not canonical SSOT.
  - Conflict precedence remains Spec Lock, Crosswalk, DRY Rules, Glossary, then Decision Policy defaults.
  - Packet-derived research outputs remain non-canonical unless routed through primary MUST CHANGE or MUST RECONCILE docs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_reference_drift
reasoning_tier: high
context_scope: governance
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/Crosswalk.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Glossary.md
node_compile_hint:
  mode: binarylocator_reference_and_anchor_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0007
preserved_exact_tokens:
  - "Canonical sources (reference, don't duplicate)"
  - "legacy-code behavior anchors"
  - "not the canonical SSOT"
  - "Spec Lock"
  - "Crosswalk"
  - "DRY Rules"
  - "Glossary"
  - "Decision Policy defaults"
  - "MUST CHANGE"
  - "MUST RECONCILE"
  - "MUST VERIFY"
  - "REFERENCE"
negative_constraints:
  - "Legacy puppet-master-rs paths must not become canonical rewrite architecture SSOT."
  - "Derived-only ledger summaries, audit tables, and cross-reference matrices must not become BinaryLocator doc intents."
compatibility_only_notes:
  - "Legacy-code anchors are read-only behavior anchors for compatibility review only."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-005 - BinaryLocator Cross-Owner Boundary Constraints

```yaml
plan_unit_id: BS-005
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  BinaryLocator preserves routed cross-owner constraints exposed by provider or
  binary-discovery packet material without absorbing runtime, storage, usage,
  permissions, chat, HITL, Run Graph, Orchestrator, command, GUI, or help-copy
  ownership into binary validation behavior.
gui_related: true
gui_classification_reason: The boundary span includes GUI/help copy, assistant chat, wizard, and user-facing Orchestrator surface routing constraints.
split_recommended: false
depends_on: [BS-003, BS-004]
unblocks: [BS-008, BS-014, BS-019]
acceptance_criteria:
  - Agent coordination state remains event-sourced through seglog/redb, with active-agents files/views debug-only.
  - usage_event_ref remains a locator-grade structured locator and not a display string, timestamp heuristic, or opaque replacement ID family.
  - Execution, handoff, route identity, permission scope, chat compatibility drift, HITL, Run Graph, Orchestrator, command, GUI, and help-copy concerns route to their owner docs.
  - BinaryLocator diagnostics may reference owner outcomes without encoding those seams as locator state, binary validation, or provider discovery contracts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cross_owner_drift
reasoning_tier: high
context_scope: owner_boundary
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/FileManager.md
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: binarylocator_cross_owner_boundary_constraints
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0008
preserved_exact_tokens:
  - "seglog"
  - "redb"
  - "active-agents.json"
  - "usage_event_ref"
  - "/runtime"
  - "Executor_Protocol.md"
  - "/handshake"
  - "Permissions_System.md"
  - "assistant-chat-design.md"
  - "HITL"
  - "Run Graph"
  - "Orchestrator GUI/help copy drift"
negative_constraints:
  - "BinaryLocator must not absorb Executor_Protocol mint, handshake, or handoff rules while validating provider binaries."
  - "BinaryLocator diagnostics may reference permission results but must not define permission scope."
  - "BinaryLocator must not encode approval/blocking seams as locator state, binary validation, or provider discovery contracts."
compatibility_only_notes:
  - "assistant-chat-design is mostly aligned; remaining compatibility-oriented drift stays with the chat owner."
stale_retired_dispositions:
  - "Stale newfeatures.md four-tier hierarchy and no new tiers claims must not override the chain-wizard-flexibility node-graph model."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-006 - BinaryLocator Terminology And Service Boundary

```yaml
plan_unit_id: BS-006
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator uses Provider, Session, and probe layer terminology and remains a Provider-owned discovery, validation, and trace service.
gui_related: false
gui_classification_reason: Terminology and service ownership are canonical vocabulary and backend boundary requirements.
split_recommended: false
depends_on: [BS-002]
unblocks: [BS-007, BS-008, BS-009]
acceptance_criteria:
  - Provider remains the canonical term and runner is not used.
  - Session remains the canonical user-facing term.
  - Probe layer terminology avoids conflicts with hierarchy naming rules.
  - BinaryLocator remains Provider-owned discovery, validation, and trace service.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminology_drift
reasoning_tier: standard
context_scope: provider
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/Glossary.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: binarylocator_terminology_service_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0009
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0010
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0011
preserved_exact_tokens:
  - "Provider"
  - "runner"
  - "Session"
  - "probe layer"
  - "Provider-owned"
  - "discovery + validation + trace service"
  - "Primitive:Provider"
negative_constraints:
  - "Legacy terminology must not appear in user-facing text."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-007 - BinaryLocateRequest Input Contract

```yaml
plan_unit_id: BS-007
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocateRequest is a conceptual Provider-domain contract with provider_cli and force_rescan required, and workspace_root, override_path, and env_path optional under the stated probing and cache-scope boundaries.
gui_related: false
gui_classification_reason: Request shape is backend provider-domain contract data; GUI manual controls are covered in the Override and UI mapping PlanUnits.
split_recommended: false
depends_on: [BS-006]
unblocks: [BS-010, BS-017]
acceptance_criteria:
  - provider_cli and force_rescan remain required fields.
  - workspace_root is used only for workspace-scoped caching keys.
  - workspace_root must not expand filesystem probing scope.
  - override_path is sourced only from Setup/Health manual path controls for Cursor/Claude.
  - env_path carries the effective PATH string used for PATH lookup.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: request_contract_drift
reasoning_tier: standard
context_scope: provider_contract
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocaterequest_input_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0012
preserved_exact_tokens:
  - "BinaryLocateRequest"
  - "provider_cli"
  - "force_rescan"
  - "workspace_root"
  - "override_path"
  - "env_path"
  - "ConfigKey:advanced_config.cli_paths"
negative_constraints:
  - "workspace_root is used only for workspace-scoped caching keys and must not expand filesystem probing scope."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-008 - BinaryLocateResult And Trace Emission Contract

```yaml
plan_unit_id: BS-008
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  BinaryLocateResult exposes deterministic status, resolved path/name, source
  layer, version, validation, and ordered trace fields; trace is returned to
  callers until persisted event writers are available, then emitted as full
  EventRecord diagnostics while still returned for deterministic UX/debuggability.
gui_related: false
gui_classification_reason: Result shape, trace structure, and event emission are provider and storage contract behavior.
split_recommended: false
depends_on: [BS-006]
unblocks: [BS-018, BS-019]
acceptance_criteria:
  - Status values remain Found, NotFound, and FoundButInvalid.
  - Source layers remain Override, PATH, CommonLocations, and Launchers.
  - Trace attempts preserve layer, candidate, probe_kind, and result fields.
  - probe_kind values preserve DirectPath, PATHLookup, DirectoryJoin, and LauncherResolution.
  - Implementations emit full EventRecord diagnostics once persisted event writers are available while readers may accept EventEnvelopeV1 during transition.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: result_trace_contract
reasoning_tier: high
context_scope: provider_contract
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: binarylocateresult_trace_emission_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0014
preserved_exact_tokens:
  - "BinaryLocateResult"
  - "Found | NotFound | FoundButInvalid"
  - "Override | PATH | CommonLocations | Launchers"
  - "Valid | Invalid(BinaryErrorCode)"
  - "DirectPath | PATHLookup | DirectoryJoin | LauncherResolution"
  - "Hit | Miss | HitButInvalid(BinaryErrorCode)"
  - "EventEnvelopeV1"
  - "EventRecord"
  - "return `trace` only in `BinaryLocateResult`"
compatibility_only_notes:
  - "Readers may accept both EventEnvelopeV1 and EventRecord during transition, but implementations must emit full EventRecord envelopes."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-009 - Probe Order And Tie-Break Rules

```yaml
plan_unit_id: BS-009
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator probes Override, PATH, CommonLocations, then Launchers in that exact order, returns the first Valid hit, and resolves ties by layer, Provider-owned candidate-name order, then enumerated path order.
gui_related: false
gui_classification_reason: Probe ordering and tie-breaks are deterministic backend discovery algorithm behavior.
split_recommended: false
depends_on: [BS-004, BS-006]
unblocks: [BS-010, BS-011, BS-012, BS-013]
acceptance_criteria:
  - Probe layers run in the exact order Override, PATH, CommonLocations, Launchers.
  - The first Valid hit is returned.
  - Earlier probe layer, earlier Provider-owned candidate name, and earlier enumerated path order win ties.
  - Candidate name ordering comes from a single Provider-domain SSOT list.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: discovery_determinism
reasoning_tier: high
context_scope: provider_discovery
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_probe_order_tiebreaks
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0015
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0016
preserved_exact_tokens:
  - "Override"
  - "PATH"
  - "CommonLocations"
  - "Launchers"
  - "first Valid hit"
  - "earlier candidate name wins"
  - "SSOT list"
  - "PlatformSpec.cli_binary_names"
negative_constraints:
  - "Candidate ordering must not be duplicated outside the Provider domain SSOT list."
compatibility_only_notes:
  - "puppet-master-rs/src/platforms/platform_specs.rs PlatformSpec.cli_binary_names is a legacy anchor only."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-010 - Override Probe Layer

```yaml
plan_unit_id: BS-010
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  The Override probe layer honors explicit Cursor/Claude user selection from
  Setup/Health manual path controls, normalizes paths deterministically, probes
  directory or file overrides as specified, and fails fast without fallback on
  OverrideInvalid or OverrideMissing.
gui_related: true
gui_classification_reason: The override layer includes Setup/Health manual-path controls, a Use manual path checkbox, and a native file picker.
split_recommended: false
depends_on: [BS-007, BS-009]
unblocks: [BS-018, BS-019]
acceptance_criteria:
  - Empty override_path values skip the Override layer.
  - Only Cursor Agent and Claude Code Setup/Health rows may emit override_path.
  - Use manual path checkbox off means callers pass override_path = None.
  - Path normalization expands Unix home, Windows environment tokens, and relative paths only against workspace_root when present.
  - Directory overrides probe override/candidate_name and file overrides probe the exact file path.
  - Missing or invalid overrides return FoundButInvalid with OverrideMissing or OverrideInvalid and do not fall back to later layers.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: override_semantics
reasoning_tier: high
context_scope: provider_discovery
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: binarylocator_override_probe_layer
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0017
preserved_exact_tokens:
  - "override_path"
  - "Setup/Health"
  - "Use manual path"
  - "native file picker"
  - "override_path = None"
  - "~"
  - "%VAR%"
  - "$Env:VAR"
  - "FoundButInvalid(OverrideInvalid)"
  - "FoundButInvalid(OverrideMissing)"
negative_constraints:
  - "Other tools must not emit override_path."
  - "Invalid or missing override paths must not fall back to other probe layers."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-011 - PATH Probe Layer

```yaml
plan_unit_id: BS-011
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: The PATH probe layer performs OS-native PATH lookup for each candidate name, continues after invalid PATH hits, and proceeds to CommonLocations only when no valid PATH hit exists.
gui_related: false
gui_classification_reason: OS-native PATH lookup is backend filesystem/provider discovery behavior.
split_recommended: false
depends_on: [BS-009]
unblocks: [BS-012]
acceptance_criteria:
  - Each candidate name is resolved using OS-native PATH lookup.
  - Invalid PATH hits do not stop the candidate search.
  - If no valid PATH hit exists, discovery proceeds to CommonLocations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: path_lookup_drift
reasoning_tier: standard
context_scope: provider_discovery
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_path_probe_layer
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0018
preserved_exact_tokens:
  - "PATH"
  - "OS-native PATH lookup"
  - "continue searching other candidate names"
  - "CommonLocations"
  - "which::which()"
compatibility_only_notes:
  - "which::which() is a legacy behavior anchor only."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-012 - CommonLocations Probe Layer

```yaml
plan_unit_id: BS-012
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: CommonLocations enumerates Provider-owned official/default candidate paths in stable order, expands home paths, de-duplicates normalized absolutes with first occurrence winning, validates each candidate, and excludes legacy/pre-rewrite binary locations.
gui_related: true
gui_classification_reason: The CommonLocations layer includes official GUI app footprints and install locations that feed user-visible setup/health outcomes.
split_recommended: false
depends_on: [BS-009, BS-011]
unblocks: [BS-013]
acceptance_criteria:
  - Candidate paths come from Provider-owned SSOT data in stable order.
  - Home expansion and normalized absolute path de-duplication are deterministic.
  - Each candidate path is checked for existence and validation.
  - Candidate paths are limited to official/default footprints plus explicit user override path.
  - Legacy/pre-rewrite binary locations are not included.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: common_locations_drift
reasoning_tier: high
context_scope: provider_discovery
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_commonlocations_probe_layer
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0019
preserved_exact_tokens:
  - "CommonLocations"
  - "Provider-owned SSOT data"
  - "stable order"
  - "Expand `~`"
  - "De-duplicate by normalized absolute path string"
  - "official/default footprints"
  - "legacy/pre-rewrite binary locations MUST NOT be included"
  - "PlatformSpec.default_install_paths"
  - "get_fallback_directories()"
negative_constraints:
  - "Candidate paths must not include legacy or pre-rewrite binary locations."
compatibility_only_notes:
  - "platform_specs.rs and path_utils.rs fallback directories are read-only legacy anchors."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-013 - Launcher Resolution

```yaml
plan_unit_id: BS-013
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  The Launchers layer is restricted to explicit deterministic rules, supports
  Cursor Agent versioned bundle resolution from OS-specific versions roots using
  byte-order lexicographic child selection, validates cursor-agent executables
  and Windows .cmd/.bat launchers, and returns NotFound when no launcher rule
  yields a valid hit.
gui_related: false
gui_classification_reason: Launcher resolution is deterministic filesystem/provider discovery behavior.
split_recommended: false
depends_on: [BS-009, BS-012]
unblocks: [BS-015, BS-016]
acceptance_criteria:
  - The Launchers layer uses only explicit deterministic rules and no broad filesystem crawling.
  - Cursor Agent versions roots are probed for Unix/WSL and Windows Native.
  - Immediate child directories are treated as opaque strings and selected by lexicographically greatest byte-order comparison.
  - Unix/WSL probes cursor-agent and Windows Native probes cursor-agent.exe under the selected version.
  - .cmd and .bat candidates are treated as launchers and validated through the standard validation contract.
  - NotFound is returned when no launcher rule yields a valid hit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: launcher_resolution_drift
reasoning_tier: high
context_scope: provider_discovery
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_launcher_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0020
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0021
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0022
preserved_exact_tokens:
  - "Launchers"
  - "no broad filesystem crawling"
  - "~/.local/share/cursor-agent/versions/"
  - "%LOCALAPPDATA%\\cursor-agent\\versions\\"
  - "lexicographically greatest name using byte-order string comparison"
  - "opaque strings"
  - "cursor-agent"
  - "cursor-agent.exe"
  - ".cmd"
  - ".bat"
  - "NotFound"
negative_constraints:
  - "Launcher resolution must not perform broad filesystem crawling."
compatibility_only_notes:
  - "puppet-master-rs/src/install/script_installer.rs is a legacy Cursor shim anchor only."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-014 - Remote Indexer Binary Locator

```yaml
plan_unit_id: BS-014
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  For non-Git remote projects, BinaryLocator selects, transfers, verifies, and
  optionally cleans up the PM-managed sparse n-gram indexer helper binary while
  GitHub Integration owns remote project flow and storage-plan owns regex-index
  storage/cache semantics.
gui_related: false
gui_classification_reason: Remote helper selection, transfer, verification, fallback, and cleanup are backend deployment behavior.
split_recommended: false
depends_on: [BS-004, BS-005]
unblocks: [BS-015]
acceptance_criteria:
  - The remote indexer is a PM-managed build helper and not a provider CLI.
  - Supported shipped architectures are x86_64 and aarch64.
  - Remote architecture detection runs uname -m over SSH before transfer.
  - PM transfers the matching helper with scp and verifies it using xxh3 hash comparison.
  - PM does not execute binaries received from the remote host.
  - Missing architecture support falls back to unindexed ripgrep over SSH with degraded acceleration surfaced.
  - Cleanup behavior preserves reuse, optional project-close cleanup, and best-effort uninstall cleanup.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: remote_binary_integrity
reasoning_tier: high
context_scope: remote_project
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/GitHub_Integration.md
  - Plans/Tools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: binarylocator_remote_indexer_binary_locator
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0023
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0024
preserved_exact_tokens:
  - "Remote indexer binary locator"
  - "PM-managed build helper"
  - "GitHub_Integration.md"
  - "storage-plan.md"
  - "x86_64"
  - "aarch64"
  - "uname -m"
  - "scp"
  - "xxh3"
  - "MUST NOT execute binaries received from the remote host"
  - "unindexed ripgrep"
negative_constraints:
  - "PM must not execute binaries received from the remote host."
owner_boundary_notes:
  - "Plans/GitHub_Integration.md owns remote project flow."
  - "Plans/storage-plan.md owns regex-index storage/cache semantics."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-015 - Validation Command, Execution, Parsing, And Permission Checks

```yaml
plan_unit_id: BS-015
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator validates candidates using the Provider-owned version command SSOT, executes the resolved path with a five-second timeout and enhanced PATH, parses versions deterministically, and applies lightweight platform permission checks while treating execution as authoritative.
gui_related: false
gui_classification_reason: Command selection, subprocess execution, version parsing, and permission checks are backend validation logic.
split_recommended: false
depends_on: [BS-013, BS-014]
unblocks: [BS-016, BS-018]
acceptance_criteria:
  - Version commands come from a Provider-owned SSOT for each provider_cli.
  - Validation executes <resolved_path> <version_command...> with a 5s timeout.
  - Child process environment sets enhanced PATH to reduce launcher-script false negatives.
  - Version parsing first uses a semantic version regex, then first non-empty stdout line, then first non-empty stderr line, else None.
  - Unix-like and Windows permission checks remain lightweight and execution attempt remains authoritative.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_contract_drift
reasoning_tier: high
context_scope: provider_validation
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_validation_command_parsing_permissions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0025
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0026
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0027
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0029
preserved_exact_tokens:
  - "Validation contract (commands, version parsing, permission checks)"
  - "Command selection (SSOT)"
  - "Provider-owned SSOT version command"
  - "<resolved_path> <version_command...>"
  - "5s timeout"
  - "enhanced PATH"
  - '\d+\.\d+\.\d+'
  - "stdout"
  - "stderr"
  - "at least one execute bit"
  - ".exe"
  - ".cmd"
  - ".bat"
compatibility_only_notes:
  - "Legacy version_command, enhanced PATH, and extract_version anchors remain behavior compatibility references only."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-016 - Functional Validation Outcome And WrongBinary Guard

```yaml
plan_unit_id: BS-016
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: A candidate is Valid when the version command completes within timeout and returns success or a non-empty parsed version; otherwise spawn failures, timeouts, and non-zero exits with no parsed version are Invalid, while WrongBinary collision guarding remains disabled until Provider SSOT signatures exist.
gui_related: false
gui_classification_reason: Functional validation outcome and collision guarding are backend provider-validation logic.
split_recommended: false
depends_on: [BS-015]
unblocks: [BS-018, BS-020]
acceptance_criteria:
  - Successful exit or non-empty parsed version within timeout yields Valid.
  - Spawn failures, permission/security blocks, timeouts, and non-zero exits with no parsed version yield Invalid.
  - WrongBinary is optional and disabled by default until Provider SSOT defines deterministic signatures.
  - Implementations do not introduce heuristic string matching beyond the Provider SSOT.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_outcome_drift
reasoning_tier: high
context_scope: provider_validation
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_functional_validation_outcome
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0030
preserved_exact_tokens:
  - "Functional validation outcome"
  - "Valid"
  - "Invalid"
  - "WrongBinary"
  - "disabled by default"
  - "Provider SSOT"
  - "MUST NOT introduce heuristic string matching"
negative_constraints:
  - "Collision guard must remain disabled by default until Provider SSOT defines deterministic WrongBinary signatures."
  - "Implementations must not introduce heuristic string matching beyond that SSOT."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-017 - Cache Scopes, Read Policy, And Invalidation

```yaml
plan_unit_id: BS-017
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator maintains per-user persistent provider_cli caches and per-workspace ephemeral Session caches, bypasses reads when force_rescan is true, fast-validates cached entries, writes through on Found(Valid), and evicts invalid or stale cache entries according to the source policy.
gui_related: false
gui_classification_reason: Cache keys, validation, write-through, and eviction are backend storage/provider behavior.
split_recommended: false
depends_on: [BS-007]
unblocks: [BS-020]
acceptance_criteria:
  - Per-user persistent cache is a durable KV keyed by provider_cli.
  - Per-workspace ephemeral cache is keyed by provider_cli and workspace_fingerprint during the current Session.
  - force_rescan bypasses cache reads.
  - Cached entries are fast-validated before return.
  - Found(Valid), FoundButInvalid, and NotFound outcomes apply the prescribed write-through and eviction rules.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cache_correctness
reasoning_tier: high
context_scope: provider_cache
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: binarylocator_cache_policy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0031
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0032
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0033
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0034
preserved_exact_tokens:
  - "Caching and invalidation"
  - "per-user persistent cache"
  - "durable KV"
  - "provider_cli"
  - "per-workspace ephemeral cache"
  - "workspace_fingerprint"
  - "force_rescan == true"
  - "fast-validated"
  - "write-through"
  - "evict"
negative_constraints:
  - "Cached paths must never be returned without fast validation."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-018 - BinaryLocator Stable Error Codes

```yaml
plan_unit_id: BS-018
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator returns stable BinaryErrorCode values suitable for UI rendering, logs, and evidence bundles, preserving each named code and typical layer mapping.
gui_related: true
gui_classification_reason: The error taxonomy is explicitly suitable for UI rendering and feeds user-visible setup/health failure details.
split_recommended: false
depends_on: [BS-008, BS-010, BS-016]
unblocks: [BS-019, BS-020]
acceptance_criteria:
  - OverrideMissing and OverrideInvalid remain Override-layer codes.
  - NotFound, NotExecutable, BlockedByOSSecurity, Timeout, MissingRuntime, and WrongBinary remain stable codes.
  - Stable codes remain suitable for UI rendering, logs, and evidence bundles.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: error_taxonomy_drift
reasoning_tier: standard
context_scope: provider_error
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: binarylocator_stable_error_codes
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0035
preserved_exact_tokens:
  - "Error taxonomy (stable codes)"
  - "OverrideMissing"
  - "OverrideInvalid"
  - "NotFound"
  - "NotExecutable"
  - "BlockedByOSSecurity"
  - "Timeout"
  - "MissingRuntime"
  - "WrongBinary"
  - "UI rendering"
  - "logs"
  - "evidence bundles"
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-019 - BinaryLocator UI Mapping Boundary

```yaml
plan_unit_id: BS-019
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator provides stable error codes and trace output as inputs to the canonical UI SSOT and typed commands; Setup and Health/Doctor map Cursor/Claude results to Installed, Not Installed, or Failed, while manual path controls remain Cursor/Claude-only and Playwright health stays out of scope.
gui_related: true
gui_classification_reason: This unit defines user-visible setup/health labels, manual path controls, and UI command/SSOT boundaries.
split_recommended: false
depends_on: [BS-003, BS-010, BS-018]
unblocks: [BS-020]
acceptance_criteria:
  - UI copy, buttons, and view behavior are specified in FinalGUISpec and typed commands, not locally in BinaryLocator.
  - Setup and Health/Doctor map Found to Installed, NotFound to Not Installed, and FoundButInvalid to Failed with BinaryErrorCode and trace details.
  - Manual path controls are Cursor/Claude-only and use Use manual path checkbox plus native file picker.
  - Toggling manual path off clears override_path and reverts to normal probe layers.
  - Playwright installation state is driven by Browser Tools health checks, not Provider CLI lookup.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ui_boundary_drift
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/FinalGUISpec.md
  - future typed UICommand implementation crate
node_compile_hint:
  mode: binarylocator_ui_mapping_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0036
preserved_exact_tokens:
  - "UI mapping (DRY)"
  - "Plans/FinalGUISpec.md"
  - "crates/ui_commands/"
  - "Installed"
  - "Not Installed"
  - "Failed"
  - "BinaryErrorCode"
  - "trace details"
  - "Use manual path"
  - "native file picker"
  - "Playwright installation state is out of scope"
negative_constraints:
  - "BinaryLocator must not own UI copy, buttons, view behavior, or Playwright installation health."
owner_boundary_notes:
  - "FinalGUISpec plus typed commands own UI behavior."
  - "Browser Tools health checks own Playwright installation state."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-020 - Evidence Gates And Discovery Matrix

```yaml
plan_unit_id: BS-020
unit_type: validation_rule
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator implementation nodes must produce evidence bundles with this spec's ContractRefs, satisfy GATE-009 ContractRef coverage, and preserve the OS/provider install-method discovery matrix through macOS, Linux, Windows Native, and Windows WSL cases.
gui_related: false
gui_classification_reason: Evidence bundles, gates, and discovery matrix rows are validation and test-planning requirements rather than GUI behavior.
split_recommended: false
depends_on: [BS-016, BS-017, BS-018, BS-019]
unblocks: []
acceptance_criteria:
  - Any BinaryLocator implementation node references the ContractRefs in this spec in its evidence bundle.
  - Operational code and updated plan docs satisfy GATE-009 ContractRef coverage.
  - Discovery matrix rows preserve OS, Provider CLI, supported footprint, PATH setup, expected probe layer, and expected resolved path patterns.
  - Matrix paths preserve macOS, Linux, Windows Native, and Windows WSL Cursor Agent and Claude Code cases.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_coverage
reasoning_tier: standard
context_scope: validation
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_evidence_gates_discovery_matrix
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0037
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0038
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0039
preserved_exact_tokens:
  - "Acceptance criteria (testable)"
  - "Evidence + gates"
  - "evidence_bundle"
  - "GATE-009"
  - "Discovery matrix (OS x install method)"
  - "~/.local/bin/agent"
  - "/opt/homebrew/bin/agent"
  - "/usr/local/bin/agent"
  - '%LOCALAPPDATA%\\cursor-agent\\agent.exe'
  - "/opt/homebrew/bin/claude"
  - "~/.local/bin/claude"
  - '%APPDATA%\\npm\\claude.cmd'
  - '%LOCALAPPDATA%\\Microsoft\\WinGet\\Links\\claude.exe'
negative_constraints:
  - "Evidence-gate coverage must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks during this migration batch."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-021 - BinaryLocator Functional Acceptance Checks

```yaml
plan_unit_id: BS-021
unit_type: validation_rule
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator functional acceptance requires deterministic repeated results, fail-fast override behavior, version-command validation for Found results, complete ordered trace attempts, fast-validated caches, force_rescan cache bypass, Windows launcher support, Cursor versions subtree resolution, manual-path UX fidelity, and deterministic Setup/Health state mapping.
gui_related: true
gui_classification_reason: The functional checks include manual-path UX and Setup/Health Installed, Not Installed, and Failed state labels.
split_recommended: false
depends_on: [BS-010, BS-013, BS-016, BS-017, BS-019, BS-020]
unblocks: []
acceptance_criteria:
  - Repeated runs on a fixed filesystem snapshot return identical source_layer, resolved_path, and resolved_name.
  - Invalid override returns FoundButInvalid(OverrideInvalid) with no fallback probing.
  - Every Found result passes version-command validation and returns version when parseable.
  - trace includes every attempted candidate in order, including misses.
  - Cached paths are never returned without fast validation and invalid cached paths are evicted.
  - force_rescan=true bypasses caches and updates results even when a cached value remains valid.
  - .cmd and .bat candidates are validated as executable launchers.
  - Cursor versions subtree resolves and validates the latest lexicographic entry when only the versions bundle exists.
  - Manual-path UX emits no override_path when unchecked and exactly the file-picker path when checked.
  - Identical BinaryLocateResult values map to identical Setup/Health labels.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_coverage
reasoning_tier: high
context_scope: provider_validation
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: binarylocator_functional_acceptance_checks
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0040
preserved_exact_tokens:
  - "Functional acceptance checks"
  - "source_layer"
  - "resolved_path"
  - "resolved_name"
  - "FoundButInvalid(OverrideInvalid)"
  - "trace"
  - "force_rescan=true"
  - ".cmd"
  - ".bat"
  - "versions"
  - "override_path"
  - "file-picker path"
  - "BinaryLocateResult"
  - "Installed"
  - "Not Installed"
  - "Failed"
negative_constraints:
  - "Invalid override must not fall back to other probe layers."
  - "Cached paths must not be returned without fast validation."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-022 - BinaryLocator References And Legacy Anchors

```yaml
plan_unit_id: BS-022
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator references Spec Lock, Crosswalk, DRY Rules, Glossary, Decision Policy, Contracts V0, storage-plan EventEnvelopeV1 compatibility, and read-only legacy behavior anchors without turning those references into local re-ownership.
gui_related: false
gui_classification_reason: Reference lists and legacy behavior anchors are source authority metadata, not GUI implementation work.
split_recommended: false
depends_on: [BS-004]
unblocks: []
acceptance_criteria:
  - References preserve Spec_Lock.json, Crosswalk.md, DRY_Rules.md, Glossary.md, Decision_Policy.md, Contracts_V0.md, and storage-plan.md.
  - EventEnvelopeV1 remains a storage-plan compatibility note.
  - Legacy behavior anchors stay read-only and include the named puppet-master-rs platform, path, detector, and installer files.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reference_drift
reasoning_tier: standard
context_scope: governance
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_references_legacy_anchors
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0041
preserved_exact_tokens:
  - "References"
  - "Plans/Spec_Lock.json"
  - "Plans/Crosswalk.md"
  - "Plans/DRY_Rules.md"
  - "Plans/Glossary.md"
  - "Plans/Decision_Policy.md"
  - "Plans/Contracts_V0.md"
  - "Plans/storage-plan.md"
  - "EventEnvelopeV1"
  - "Legacy behavior anchors (read-only)"
  - "puppet-master-rs/src/platforms/platform_specs.rs"
  - "puppet-master-rs/src/platforms/path_utils.rs"
  - "puppet-master-rs/src/platforms/platform_detector.rs"
  - "puppet-master-rs/src/install/script_installer.rs"
negative_constraints:
  - "Reference anchors must not become competing local ownership."
compatibility_only_notes:
  - "Legacy behavior anchors are read-only compatibility evidence."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-023 - BinaryLocator Owner/Consumer Map Preservation

```yaml
plan_unit_id: BS-023
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.
gui_related: false
gui_classification_reason: Owner/consumer mapping is documentation governance and routing behavior, not GUI implementation work.
split_recommended: false
depends_on: [BS-004, BS-005]
unblocks: []
acceptance_criteria:
  - Plans/BinaryLocator_Spec.md remains owner for BinaryLocator behavior.
  - Cross-doc ownership follows ContractRefs and boundary notes rather than local duplication.
  - The Plan Document System and Bootstrap Planning Migration references remain preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary_drift
reasoning_tier: standard
context_scope: owner_boundary
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_owner_consumer_map_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0042
preserved_exact_tokens:
  - "Owner / Consumer Map"
  - "Plans/BinaryLocator_Spec.md"
  - "owner doc"
  - "cross-doc ownership"
  - "ContractRefs"
  - "boundary notes"
  - "Plans/Plan_Document_System.md"
  - "Plans/Bootstrap_Planning_Migration.md"
negative_constraints:
  - "Owner/consumer map preservation must not create new local ownership for cross-doc contracts."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-024 - BinaryLocator PlanUnits Section Anchor

```yaml
plan_unit_id: BS-024
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: The PlanUnits section anchor is preserved as structural Plan Document System layout and does not introduce additional product behavior beyond the fine-grained BinaryLocator PlanUnits.
gui_related: false
gui_classification_reason: The PlanUnits heading is structural document layout metadata, not GUI implementation work.
split_recommended: false
depends_on: [BS-001]
unblocks: []
acceptance_criteria:
  - The PlanUnits section remains available for Plan Document System indexing.
  - Structural coverage for BinaryLocator_Spec-S0043 is recorded without inventing product requirements.
  - This structural unit creates no WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: structural_anchor
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_planunits_section_anchor
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0043
preserved_exact_tokens:
  - "PlanUnits"
negative_constraints:
  - "Do not treat the structural PlanUnits heading as a product requirement."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

## Migration Coverage

Original hash: `78de2230f1d912c528c281e40b91f18e08ca975c81f7064e8a9055d13d7e04d7`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B atomization artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/batch_report.jsonl`

Phase 2B batch 013 atomizes `BinaryLocator_Spec-S0001` through `BinaryLocator_Spec-S0039` into `BS-002` through `BS-020`. `BS-001` remains a temporary source-preserving bridge until the remaining BinaryLocator spans are covered and the bridge is retired in a later controlled batch. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260614-001

### BS-025 - Deterministic Discovery Algorithm Heading Recovery

```yaml
plan_unit_id: BS-025
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  BinaryLocator_Spec contains duplicate Deterministic discovery algorithm headings. Recovery is anchor cleanup only: preserve the live
  deterministic discovery algorithm behavior and make duplicate heading text an alias or compatibility/source-lineage pointer.
gui_related: false
gui_classification_reason: Binary discovery algorithm heading repair is backend documentation structure, not GUI presentation.
depends_on: [BS-002]
unblocks: []
acceptance_criteria:
  - The deterministic discovery algorithm has one canonical anchor.
  - Duplicate heading text does not produce ambiguous references.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual heading/anchor review
risk_class: binary_locator_anchor_ambiguity
reasoning_tier: low
context_scope: binary_locator_doc_structure
implementation_surfaces: [Plans/BinaryLocator_Spec.md]
node_compile_hint: {mode: structural_heading_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0020
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0039
preserved_exact_tokens: ["Deterministic discovery algorithm"]
negative_constraints:
  - Do not change binary discovery precedence as part of heading repair.
owner_hints: [Plans/BinaryLocator_Spec.md]
```
