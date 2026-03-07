# Crosswalk (Canonical)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- CANONICAL CROSSWALK

Purpose:
- Define *ownership boundaries* for core primitives so plan documents do not drift into duplicating each other.
- Keep it DRY: other plans reference these sections rather than redefining boundaries.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This document is a **boundary map**, not an implementation plan.
It assigns authoritative ownership for *primitives* (Tool, Provider, UICommand, SessionStore, PatchPipeline, AuthState, etc.) so each plan can remain DRY.

ContractRef: Primitive:Crosswalk

---

## 1. Precedence (anti-drift)
When two plan documents disagree, resolve conflicts deterministically with this precedence order:
1. `Plans/Spec_Lock.json`
2. This Crosswalk
3. `Plans/DRY_Rules.md`
4. `Plans/Glossary.md`
5. `Plans/Decision_Policy.md`

ContractRef: PolicyRule:Decision_Policy.md§2, SchemaID:Spec_Lock.json

---

## 2. Primitive index (definitions are DRY)
This file uses primitive names as **routing labels** only; detailed schemas belong to their SSOT documents.

- `Primitive:Provider` -- provider CLIs and their normalized streams (see `Plans/CLI_Bridged_Providers.md`).
- `Primitive:Tool` -- host tools invoked by Puppet Master (see `Plans/Tools.md`).
- `Primitive:UICommand` -- stable UI command IDs (see `Plans/Contracts_V0.md#UICommand` and `Plans/UI_Command_Catalog.md`).
- `Primitive:SessionStore` -- persistent store boundaries (see `Plans/storage-plan.md`).
- `Primitive:PatchPipeline` -- Git + PR workflows (see `Plans/WorktreeGitImprovement.md` and `Plans/GitHub_API_Auth_and_Flows.md`).
- `Primitive:DocumentPane` -- embedded document navigation and editing surface contract (see `Plans/FinalGUISpec.md` and `Plans/FileManager.md`).
- `Primitive:DocumentReviewSurface` -- workflow-level document review routing and tri-location pointers (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/assistant-chat-design.md`).
- `Primitive:ReviewFindingsSummary` -- structured Multi-Pass findings summary and rendering contract (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/FinalGUISpec.md`).
- `Primitive:ReviewApprovalGate` -- final approval gate contract for revised document bundles (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/Project_Output_Artifacts.md`).
- `Primitive:DocumentCheckpoint` -- checkpoint and restore contracts for document revisions (see `Plans/storage-plan.md`, `Plans/Project_Output_Artifacts.md`, and `Plans/FileManager.md`).
- `ContractName:Contracts_V0.md#AuthState` -- auth state + events.

ContractRef: ContractName:Contracts_V0.md, SchemaID:Spec_Lock.json

---

## 3. Ownership boundaries

<a id="3.1"></a>
### 3.1 GitHubApiTool
**Owner:** Tooling domain (`Plans/Tools.md`).

**Definition (boundary only):** `GitHubApiTool` is the *only* permitted interface for GitHub HTTPS API calls.

Rules:
- GitHub operations MUST be implemented via GitHub HTTPS API calls and OAuth access tokens.
- The GitHub CLI is forbidden for auth/status/repo/fork/PR operations.
- Auth flows are owned by `Plans/GitHub_API_Auth_and_Flows.md`; this section only assigns ownership.

ContractRef: ToolID:GitHubApiTool, SchemaID:Spec_Lock.json#github_operations, ContractName:Contracts_V0.md#AuthEvent

---

### 3.2 UICommand
**Owner:** UI domain (UI catalog + typed commands).

Rules:
- The UI MUST dispatch stable command IDs; it MUST NOT implement business logic.
- Command IDs are canonical in `Plans/UI_Command_Catalog.md`.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand

---

### 3.3 Provider
**Owner:** Provider domain (Provider runners, capability probing, normalized stream).

Rules:
- Provider-specific discovery/auth/model logic MUST live in Provider-owned modules and contracts.
- Plans may reference provider behavior, but MUST NOT hardcode provider CLI details outside Provider SSOT.

ContractRef: Primitive:Provider, ContractName:Plans/CLI_Bridged_Providers.md

---

### 3.4 PatchPipeline
**Owner:** PatchPipeline domain.

Rules:
- Git primitives (worktrees, remotes, push) are local-git owned; hosting operations are GitHub API owned per Spec Lock.
- PatchPipeline owns the transactional `patch -> apply -> verify -> rollback` reliability contract for code/document mutations.
- Transactional rollback in PatchPipeline is distinct from user-facing restore-point rewind in chat/history flows; docs MUST NOT use the terms interchangeably.
- PatchPipeline verification outcomes feed the central evidence/Verifier flow and MUST remain transport/provider independent.

ContractRef: Primitive:PatchPipeline, SchemaID:Spec_Lock.json#github_operations, ContractName:Plans/WorktreeGitImprovement.md

---

### 3.5 SessionStore
**Owner:** Storage domain (`Plans/storage-plan.md`).

Rules:
- Persistent event envelope contracts are owned by `Plans/Contracts_V0.md`.
- Secrets are forbidden from persistent stores (see invariants).

ContractRef: Primitive:SessionStore, ContractName:Contracts_V0.md#EventRecord

---

<a id="3.6"></a>
### 3.6 AuthState
**Owner:** Contracts + provider-specific auth plan.

Rules:
- `AuthState` and auth event types are defined in `Plans/Contracts_V0.md`.
- Provider-specific auth flows (GitHub device flow) are defined in `Plans/GitHub_API_Auth_and_Flows.md`.
- Tokens MUST NOT be persisted in `AuthState`; tokens live only in the OS credential store.

ContractRef: ContractName:Contracts_V0.md#AuthState, Plans/Architecture_Invariants.md#INV-002

---

### 3.7 DocumentPane
**Owner:** GUI interaction contract in `Plans/FinalGUISpec.md`, editor/buffer contract in `Plans/FileManager.md`.

Rules:
- The embedded document pane is a dedicated GUI primitive, separate from chat and separate from the agent activity pane.
- Document-pane edits MUST target the same file buffer/history contract as the File Editor.
- Plan graph appears in the pane as a read-only rendered view, not raw JSON editing.
- The document pane MUST support **live multi-document preview** during document generation and targeted revision runs:
  - doc list grows mid-run as new artifacts are created,
  - per-doc status badges include `writing…`, `draft`, `needs-review`, `changes-requested`, `approved`,
  - follow-active toggle default ON (auto-follow active written doc),
  - selected-doc stability when follow is OFF (no focus stealing).
- While a doc is `writing…`, it MUST be read-only to prevent dueling writes; this rule is coordinated with the shared-buffer contract (`Plans/FileManager.md` §2.4.1).
- The document pane MUST support anchored **Inline Notes** (highlight + note) with robust selectors and deterministic re-anchoring; see Primitive:DocumentInlineNotes.

ContractRef: Primitive:DocumentPane, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md

---

### 3.8 DocumentReviewSurface
**Owner:** Workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; message contract in `Plans/assistant-chat-design.md`.

Rules:
- Full document bodies MUST NOT be rendered in chat.
- Review guidance MUST use the same tri-location pattern: editor open, clickable file path, and embedded document pane entry.
- Wizard and Interview pages MUST expose preview-surface review summaries before final approval.
- The same review-surface semantics MUST be used for initial multi-doc review and targeted revision follow-ups; page-specific copy may differ, but routing and approval meaning MUST remain identical.

ContractRef: Primitive:DocumentReviewSurface, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/assistant-chat-design.md

---

### 3.9 ReviewFindingsSummary
**Owner:** Workflow-level findings semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; rendering placement in `Plans/FinalGUISpec.md`.

Rules:
- Multi-Pass outputs MUST include findings (gaps, consistency issues, missing information), not only revised content.
- Findings summary MUST be shown in chat and in the page preview section before approval.
- Findings summary schema and persistence MUST align with storage contracts.
- Findings summary is a canonical workflow artifact, not a GUI-only convenience. At minimum it MUST preserve review run identity, per-doc findings counts, unresolved items, and any revised-artifact reference needed by the final approval gate.
- GUI-local views of findings summaries MUST map back to the canonical storage-plan bundle/review contract and MUST NOT invent competing persistence shapes.

ContractRef: Primitive:ReviewFindingsSummary, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

---

### 3.10 ReviewApprovalGate
**Owner:** Workflow approval semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; canonical artifact expression in `Plans/Project_Output_Artifacts.md`.

Rules:
- Revised document handoff MUST pass through one final approval gate per review run.
- Preconditions MUST include findings-summary visibility before decision capture.
- Approval decision artifacts MUST be restorable in recovery flows.
- `Accept | Reject | Edit` is the only final gate model for this review family unless a higher-precedence SSOT explicitly states otherwise.

ContractRef: Primitive:ReviewApprovalGate, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Project_Output_Artifacts.md

---

### 3.11 DocumentCheckpoint
**Owner:** Storage contract in `Plans/storage-plan.md` and artifact taxonomy in `Plans/Project_Output_Artifacts.md`; UI entry points in `Plans/FileManager.md` and `Plans/FinalGUISpec.md`.

Rules:
- Document checkpoints are coarse restore points (for example before Multi-Pass, after user edit), not per-keystroke undo history.
- Checkpoints MUST be persisted so recovery can restore document state and approval stage.
- Restore actions from the document pane MUST use the same open-file/buffer refresh pipeline as File Editor.

ContractRef: Primitive:DocumentCheckpoint, ContractName:Plans/storage-plan.md, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

---

### 3.12 WidgetCatalog
**Owner:** Widget domain (`Plans/Widget_System.md`).

Rules:
- The widget catalog is the single source of truth for all portable page widgets (dashboard, usage, orchestrator tab widgets).
- Widget IDs are stable strings (format: `widget.{name}`).
- Atomic UI components (buttons, inputs, badges) remain owned by `Plans/FinalGUISpec.md` section 8; page widgets are composed from those components.
- All widget-composed pages (Dashboard, Usage, Orchestrator widget tabs) MUST reference `Plans/Widget_System.md` for layout, add-widget flow, and persistence.

ContractRef: Primitive:WidgetCatalog, ContractName:Plans/Widget_System.md

---

### 3.13 RunGraphView
**Owner:** Run Graph domain (`Plans/Run_Graph_View.md`).

Rules:
- The Node Graph Display is a full-page tab on the Orchestrator page; it is NOT a widget and is NOT in the widget catalog.
- Data model contract (Rust structs: `RunGraphMeta`, `GraphNode`, `GraphEdge`, etc.) is owned by this document.
- State-to-color mapping uses theme tokens (`Theme.graph-*`); these tokens are additions to the theme system owned by `Plans/FinalGUISpec.md` section 6.

ContractRef: Primitive:RunGraphView, ContractName:Plans/Run_Graph_View.md

---

### 3.14 OrchestratorPage
**Owner:** Orchestrator page domain (`Plans/Orchestrator_Page.md`).

Rules:
- The Orchestrator is a single top-level page with 6 tabs (Progress, Tiers, Node Graph Display, Evidence, History, Ledger).
- Widget-based tabs reference `Plans/Widget_System.md` for layout mechanics.
- The Node Graph Display tab references `Plans/Run_Graph_View.md`.
- This page replaces former separate views (Tiers, Evidence, History) and adds Ledger as a tab.
- Data source documentation for live status is owned by this document (section 12).

ContractRef: Primitive:OrchestratorPage, ContractName:Plans/Orchestrator_Page.md

---

### 3.15 UIScaling
**Owner:** UI scaling domain (`Plans/Contracts_V0.md` §8, `Plans/FinalGUISpec.md` §7.4 and §16.2).

Rules:
- UI scale (0.75–1.5) MUST use Slint native window/global scale factor; per-token manual scaling MUST NOT be ported.
- Four preset buttons (75 %, 90 %, 100 %, 110 %) in Settings → General.
- Editor text zoom is independent of app-level UI scale.

ContractRef: Primitive:UIScaling, ContractName:Plans/Contracts_V0.md#8

---

## References
- `Plans/Spec_Lock.json`
- `Plans/DRY_Rules.md`
- `Plans/Glossary.md`
- `Plans/Decision_Policy.md`
- `Plans/Tools.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Widget_System.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`


### 3.13 DocumentInlineNotes
**Owner:** GUI contract in `Plans/FinalGUISpec.md`; persistence contract in `Plans/storage-plan.md`; workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`.

Rules:
- Notes are anchored to a text selection and have a lifecycle: `open` → `addressed` → `resolved`.
- Note kind is deterministic by default: `question` if note ends with `?` or starts with `Q:`, else `change_request`; user can override and set `both`.
- Anchor storage MUST include both:
  - TextPositionSelector `{ start, end }`, and
  - TextQuoteSelector `{ exact, prefix, suffix }` with default prefix/suffix length 32 chars (clamped).
- Re-anchoring algorithm is deterministic:
  1) position selector match, else 2) quote selector match using prefix/suffix preference, else 3) keep note open and show `Anchor not found — reselect to re-anchor`; never silently discard.

ContractRef: Primitive:DocumentInlineNotes, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md

---

### 3.14 TargetedRevisionPass
**Owner:** Workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; UI placement in `Plans/FinalGUISpec.md`.

Rules:
- "Resubmit with Notes" triggers a targeted revision pass scoped to documents with open notes (or a user-selected subset).
- Targeted revision:
  - applies requested edits and/or answers questions,
  - marks notes `addressed` with explanation and (when possible) updated anchor locations,
  - MUST NOT trigger Multi-Pass Review.
- Multi-Pass Review is bundle-level and gated separately (all docs approved + no open notes).

ContractRef: Primitive:TargetedRevisionPass, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/FinalGUISpec.md

---

### 3.15 FinalReviewGate
**Owner:** Workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; artifact taxonomy and restore semantics in `Plans/storage-plan.md`.

Rules:
- Multi-Pass Review is final-review only: enabled only when all bundle docs are Approved/Done and no open notes exist.
- Final review runs once by default; rerun explicit only.
- Final gate is a single decision: `Accept | Reject | Edit`.
  - Accept applies the revised review bundle.
  - Reject discards the review output bundle and preserves the pre-review bundle.
  - Edit opens the revised docs without rerunning review; returns to the same gate afterward.
- Review output bundle MUST be stored separately so Reject is a clean discard.

ContractRef: Primitive:FinalReviewGate, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/storage-plan.md
