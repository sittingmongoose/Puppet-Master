## 17. LSP verification gate, evidence, subagent selection (implementation spec)

This section defines the **contract, config, failure handling, evidence schema, and integration points** for the LSP diagnostics verification gate, LSP snapshot in evidence, and subagent selection from LSP so an agent can implement with no gaps. Cross-reference: Plans/feature-list.md (Verifier registry, LSP additional enhancements), Plans/Tools.md (§3.1 lsp tool), Plans/orchestrator-subagent-integration.md (subagent selection).

### 17.1 LSP diagnostics verification gate

#### Contract

- **When it runs:** After each **iteration** completes (before promoting to next tier). Optionally configurable to run at **subtask** boundary only, **task** boundary only, or **phase** boundary only; default: run at **subtask** boundary (after last iteration of the subtask, before promotion to task).
- **Tier boundaries:** Configurable per tier: phase, task, subtask. At least one of these must be enabled for the gate to run; when the orchestrator reaches that boundary (e.g. "subtask passed"), the LSP gate runs as one of the criteria before the tier is marked passed.
- **Scope:** What files are checked. One of:
  - **`changed_files`** -- Only files that were modified in the last iteration (or in the current subtask). Requires tracking changed paths (e.g. from git diff or execution engine "files touched").
  - **`open`** -- Only files currently open in the editor (or in the run context). Requires LSP client to know "open" set for the run.
  - **`project`** -- All project files that have an LSP server (bounded: e.g. under project root, or only files with open documents). Default: **`changed_files`** to keep checks fast and relevant.
- **"No LSP errors" meaning:** Configurable severity threshold:
  - **`error`** -- Gate passes if there are **no diagnostics with severity Error** in scope. Warnings and Info are ignored.
  - **`error_and_warning`** -- Gate passes if there are **no diagnostics with severity Error or Warning** in scope. Info is ignored.
  - Default: **`error`**.

#### Config

- **Where:** Verification tab (Settings or Config → Verification). Can be **global** (one setting for all tiers) or **per-tier** (override per phase/task/subtask). Recommendation: global `lsp_gate` with optional per-tier override in tier config.
- **Schema (config key `verification.lsp_gate` in redb):**

**LSP Gate Default Values (Resolved):**
- `enabled`: **false** (opt-in per project)
- `scope`: **"changed_files"** (only check files modified in this tier)
- `block_on`: **"errors"** (errors block, warnings do not)
- `tier_boundaries`: **["phase"]** (check at phase boundaries only by default)
- `timeout_seconds`: **10** (LSP query timeout)
- `when_unavailable`: **"skip"** (if LSP server is not running, skip the gate — do not fail)

Config key: `verification.lsp_gate` in redb. All values are overridable per project via `.puppet-master/config.json`.

```json
{
  "lsp_gate": {
    "enabled": false,
    "scope": "changed_files",
    "block_on": "errors",
    "tier_boundaries": ["phase"],
    "timeout_seconds": 10,
    "when_unavailable": "skip"
  }
}
```

| Field | Type | Values | Default |
|-------|------|--------|--------|
| `enabled` | bool | true, false | **false** |
| `scope` | string | `"changed_files"` \| `"open"` \| `"project"` | **`"changed_files"`** |
| `block_on` | string | `"errors"` \| `"errors_and_warnings"` | **`"errors"`** |
| `tier_boundaries` | string[] | `["phase"]`, `["task"]`, `["subtask"]`, or combination | **`["phase"]`** |
| `timeout_seconds` | number | positive integer | **10** |
| `when_unavailable` | string | `"skip"` \| `"fail"` | **`"skip"`** |

- **GUI:** Verification tab: "LSP diagnostics gate" subsection: Enable checkbox; Scope dropdown (Changed files / Open files / Whole project); Block on (Errors only / Errors and warnings); Tier boundaries (checkboxes: Phase, Task, Subtask); Timeout (seconds). Persist in same config blob as `VerificationConfig` (e.g. extend `VerificationConfig` or nested `lsp_gate`).

#### Failure behavior

- **Gate fails (LSP errors in scope):** The gate report for that tier has `passed: false`; the **criterion** for the LSP gate has `met: false` and `actual` set to a summary (e.g. "3 LSP errors in scope (see evidence)").
- **Orchestrator behavior:** Same as for any failed gate: **retry** (next iteration) if retry policy allows; else **escalate** or **stop** per tier config (e.g. `task_failure_style`). No special case for LSP gate.
- **User notification:** Standard gate failure path: Dashboard/Gate report shows failure; optional toast "LSP gate failed: N errors in scope." Evidence (LSP snapshot) is attached so user can inspect.

#### Evidence attachment

- **When:** When the LSP gate **runs** (whether it passes or fails), attach an **LSP diagnostics snapshot** to the gate report. So: **always** capture snapshot at gate run time; store it as evidence linked to that gate run.
- **Where stored:** See §17.2. The snapshot is written to `.puppet-master/evidence/lsp-snapshots/` (or embedded in gate report artifact); the GateReport or EvidenceStore references it (e.g. `evidence_type: "lsp_snapshot"`, path to JSON file).

#### Integration point

- **Who calls LSP:** A new verifier **`LspGateVerifier`** (or **`lsp_gate_verifier`**), registered in `VerifierRegistry` (e.g. in `verifier.rs` `register_defaults`). Criterion type: `verification_method: "lsp"` or `"lsp_gate"`.
- **Where:** New module `puppet-master-rs/src/verification/lsp_gate_verifier.rs`. It implements `Verifier`: on `verify(criterion)`, it reads scope and block_on from criterion (or from a shared LSP gate config injected into the verifier), calls the LSP client to get current diagnostics for the resolved paths, and returns `VerifierResult { passed, message, evidence }`. Evidence contains or references the LSP snapshot.
- **Gate runner:** No change to gate_runner flow: it already dispatches by `criterion.verification_method` to the registry; when the criterion is LSP gate, the registry returns `LspGateVerifier`, which runs.
- **LSP client API:** The LSP client (e.g. in `src/lsp/` or `src/lsp/client.rs`) must expose **get current diagnostics for paths**:
  - Signature (conceptual): `get_diagnostics_for_paths(paths: &[PathBuf], project_root: &Path) -> Result<Vec<LspDiagnosticEntry>, LspGateError>`.
  - Returns: list of diagnostics (path, line, character, severity, message, source) for the given paths. If a path has no server or no diagnostics, it contributes an empty list. The client uses the existing DiagnosticsCache (from `publishDiagnostics`) and/or triggers a request if needed; must respect timeout (e.g. 15 s) and return partial results or error on timeout.

#### Implementer wiring (config and gate report)

- **VerificationConfig:** Extend the existing verification config (e.g. `VerificationConfig` in `config/gui_config.rs` or equivalent) with an optional **`lsp_gate`** field (nested struct matching the schema above: `enabled`, `scope`, `block_on`, `tier_boundaries`, `timeout_seconds`, optional `when_unavailable`). Persist in the same blob as other verification settings. **Verification tab UI:** Add "LSP diagnostics gate" subsection with controls bound to this struct.
- **Criterion injection:** When building gate criteria for a tier (e.g. in `build_gate_criteria` or where acceptance criteria are converted to criteria), if `lsp_gate.enabled` is true and the current tier boundary (phase/task/subtask) is in `lsp_gate.tier_boundaries`, add a criterion with `verification_method: "lsp"` (or `"lsp_gate"`) and pass scope/block_on (in criterion params or from shared config). No change to criterion type enum beyond adding this method.
- **GateReport / evidence:** Use the **existing** evidence pipeline: `VerifierResult` carries `evidence` (e.g. path to snapshot file or artifact id); the gate runner aggregates per-criterion results into `GateReport`; EvidenceStore (if present) persists artifacts per existing rules. No new GateReport field required; LSP snapshot is stored as an artifact referenced by the LSP criterion's result.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/feature-list.md

### 17.2 LSP snapshot in evidence

#### Schema (per diagnostic entry)

Store one JSON file per snapshot (e.g. one per gate run). Each entry in the snapshot:

```json
{
  "path": "src/main.rs",
  "line": 1,
  "character": 0,
  "severity": "Error",
  "message": "expected type",
  "source": "rust-analyzer",
  "code": "E0308"
}
```

- **path** -- Relative to project root or absolute; same as LSP URI normalized to path.
- **line** -- 0-based or 1-based per LSP spec (LSP uses 0-based); **Decision:** Store and display 1-based in evidence and UI; convert to 0-based only at the LSP protocol boundary.
- **character** -- Offset in line (0-based).
- **severity** -- "Error" | "Warning" | "Info" | "Hint".
- **message** -- Diagnostic message.
- **source** -- Optional; server name (e.g. rust-analyzer).
- **code** -- Optional; diagnostic code if provided by server.

#### File format and location

- **Directory:** `.puppet-master/evidence/lsp-snapshots/`.
- **Filename:** `lsp-snapshot-{gate_id}-{timestamp}.json` or `lsp-snapshot-{tier_id}-{session_id}.json` so it is unique and tied to the gate run.
- **Content:** Single JSON object: `{ "captured_at": "ISO8601", "scope": "changed_files"|"open"|"project", "project_root": "...", "diagnostics": [ {...}, ... ] }`.

#### When captured

- **Before run:** Not required for gate-only use.
- **After run (when gate runs):** Yes. When the LSP gate verifier runs (at tier boundary), it captures the snapshot **at that moment** (after iteration, before promotion). So: **one snapshot per gate run** at the time the gate is evaluated.
- **Optional "before and after":** For richer audit, config could allow capturing snapshot before iteration and after; then two files per run. MVP: **after only** (at gate run time).

#### Who triggers

- **Gate runner** (via LspGateVerifier). The verifier is invoked by the gate runner when a criterion with `verification_method: "lsp"` is evaluated. The verifier (1) gets diagnostics from LSP client for scope, (2) writes snapshot JSON to `.puppet-master/evidence/lsp-snapshots/`, (3) attaches evidence to VerifierResult (path to snapshot file), (4) returns passed/failed. EvidenceStore (if wired) can also persist the path; GateReport criteria already carry per-criterion evidence from VerifierResult.

ContractRef: ContractName:Plans/LSPSupport.md

### 17.3 Subagent selection from LSP

- **Where in the flow:** When the orchestrator is about to **select a subagent for the next subtask** (or task), it can optionally query LSP diagnostics for **files in scope** for that subtask/task. **Decision:** Default **off**. Config key `orchestrator.lsp_subagent_bias` (bool, default false). When true, call `get_diagnostics_for_paths` and apply bias toward matching-language subagent. If any file has diagnostics (e.g. errors) from a language server X, **prefer** the subagent that matches language X (e.g. rust-analyzer → rust-engineer, pyright → python-pro).
- **"Files in scope" definition:** One of (configurable or fixed):
  - **Changed in last iteration** -- Files modified in the most recent iteration (same as LSP gate scope `"changed_files"` for consistency).
  - **Open in editor** -- Files currently open in the run/context.
  - **Task's file list** -- If the task/subtask has an explicit list of files (e.g. from PRD or plan), use that list.
  - Default: **changed in last iteration** for consistency with LSP gate.
- **Documentation:** This behavior is specified in **Plans/orchestrator-subagent-integration.md** (Subagent selection from LSP) and summarized here. Implement in the same place that performs `select_for_tier`: after building tier context, optionally call LSP client `get_diagnostics_for_paths(scope_paths)`; from the returned diagnostics, derive language(s) from `source` or from file extension → server id mapping; then bias subagent selection toward matching language (e.g. add to ProjectContext or TierContext: "prefer_subagents": ["rust-engineer"] when Rust errors present).

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md

### 17.4 Failure modes (LSP gate and diagnostics)

| Failure | Behavior | Evidence / reporting |
|---------|----------|----------------------|
| **LSP client not ready** | Gate does not run, or runs with a **skip** result. **Decision:** When LSP gate is enabled but client not ready: **skip** the criterion; set `actual: "LSP client not ready"`. Config: `lsp_gate.when_unavailable`: `skip` | `pass` | `fail`, default **skip**. Gate does not block on LSP startup. |
| **Timeout when querying diagnostics** | LspGateVerifier uses a timeout (e.g. `timeout_seconds` from config). On timeout: **fail** the criterion with `actual: "LSP diagnostics query timed out"`. Attach partial snapshot if any diagnostics were collected before timeout. |
| **No server for language** | For some files in scope there is no LSP server (e.g. unknown extension). Those files contribute **no diagnostics** (empty list). Gate passes for that file; only files with a server are checked. No special failure. |
| **Server crash or disconnected** | Same as "LSP client not ready": skip or pass per config; do not fail the entire gate unless config says "fail when LSP unavailable". |
| **Empty scope (changed_files/open/project)** | If scope resolves to zero files (e.g. no files changed), gate **passes** (nothing to check). |

ContractRef: ContractName:Plans/LSPSupport.md

Implement these in `LspGateVerifier` and in the LSP client's `get_diagnostics_for_paths` (timeout, not-ready check).
