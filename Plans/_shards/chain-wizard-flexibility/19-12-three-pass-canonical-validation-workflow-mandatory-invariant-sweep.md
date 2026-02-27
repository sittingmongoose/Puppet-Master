## 12. Three-Pass Canonical Validation Workflow (Mandatory Invariant Sweep)

> **Compliance:** Follows `Plans/DRY_Rules.md`, `Plans/Contracts_V0.md`, and `Plans/Decision_Policy.md`. Naming: "Puppet Master" only. All decisions deterministic; no open questions.

ContractRef: Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2

### 12.1 Context

This section defines an **always-on mandatory invariant sweep** that runs immediately after the Contract Unification Pass (§6.6) produces the canonical project artifact pack. It is **separate** from the optional §5.6 Multi-Pass Review (which is user-facing and off by default). The invariant sweep **cannot be disabled** and always runs even when other review features are present or enabled.

The three-pass pipeline enforces canonical system integrity, DRY/SSOT compliance, plan graph structural correctness, and deterministic decision logging — without requiring human intervention or a running GUI.

### 12.2 Passes

All three passes run serially in sequence: Pass 1 → Pass 2 → Pass 3. Each pass receives the artifact set as corrected by the previous pass.

---

#### Pass 1: Document Creation

**Purpose:** Primary document generation — requirements, contracts pack (Project Contract Pack), plan_graph (sharded), and acceptance manifest.

**Scope:** All required project artifacts under `.puppet-master/project/` per `Plans/Project_Output_Artifacts.md §2`.

**Produces:**
- The initial artifact set written to `.puppet-master/project/`.
- A `validation_pass_report` artifact stored in seglog (`artifact_type: validation_pass_report`) containing (schema per `Plans/Project_Output_Artifacts.md §10.2`):
  - `pass_number: 1`
  - `pass_name: "document_creation"`
  - `pass_verdict`: `"pass"` or `"fail"`
  - `verdict_reason`: human-readable reason
  - `changes_applied_summary`: list of artifact paths written
  - `diff_pointers`: empty for Pass 1 (this is generation, not correction)
- A `requirements_quality_report` artifact (schema: `pm.requirements_quality_report.schema.v1`) stored at `.puppet-master/project/traceability/requirements_quality_report.json`: for each requirement, checks coverage against the Requirements Completion Contract (§14). The Pass 1 report is **read-only** — it identifies issues and classifies each as `auto_fixable: true/false`. No edits to requirements are made in Pass 1.

**Verdict rules:**
- `pass_verdict: "pass"` — all required artifacts were successfully generated.
- `pass_verdict: "fail"` — one or more required artifacts could not be generated; reason recorded.

---

#### Pass 2: Documents + Canonical Alignment

**Purpose:** Checks requirements and plan artifacts against the Project Contract Pack and Puppet Master's internal canonical system references. Finds gaps and contradictions, proposes fixes, and applies those fixes to the artifact set.

**Scope:** The following artifacts are compared against the listed canonical references:

| Artifact | Canonical References |
|---|---|
| `requirements.md` | `ProjectContract:*` references, `Plans/Contracts_V0.md` |
| Contracts pack (`contracts/index.json` + entries) | `Plans/Contracts_V0.md`, `Plans/Architecture_Invariants.md` |
| `plan_graph/` nodes | `Plans/DRY_Rules.md`, `Plans/Architecture_Invariants.md` |
| `acceptance_manifest.json` | `Plans/Project_Output_Artifacts.md`, `Plans/Decision_Policy.md` |

**Actions:** For each gap or contradiction found:

1. Record in `findings[]`.
2. Apply fix to the relevant artifact.
3. Record fix in `changes_applied_summary` with a `diff_pointer` (artifact path + before/after summary).
4. When no fix is possible (e.g., an inherent conflict requiring product-level decision), record an entry in `unresolved_findings[]`.
5. Apply auto-fixes from the requirements quality report: for each issue in the `requirements_quality_report` where `auto_fixable == true`, apply the fix and record in `auto_fixes_applied[]`. Re-validate each fixed requirement after applying its autofix. Update the `requirements_quality_report` artifact in-place with the final post-fix state. If unresolved blocking issues remain after all autofixes, they are escalated via the semantics defined in §15 — Pass 2 does **not** escalate directly; it only updates the quality report artifact.

**Produces:**
- Updated artifact set with all resolvable fixes applied.
- `validation_pass_report` (Pass 2) stored in seglog containing:
  - `pass_number: 2`
  - `pass_name: "canonical_alignment"`
  - `findings[]`: list of all gaps and contradictions detected
  - `changes_applied_summary`: list of fixes applied, each with `diff_pointer`
  - `unresolved_findings[]`: items where no fix could be applied
  - `auto_fixes_applied[]`: list of requirement quality issues auto-fixed in this pass (each entry: `{ issue_id, criterion, fix_applied, diff_pointer }`)
  - `pass_verdict`: `"pass"` or `"fail"`
  - `verdict_reason`: human-readable reason (including unresolved findings when fail)

---

#### Pass 3: Canonical Systems Only (Strictest)

**Purpose:** Focuses exclusively on canonical system integrity. **Never edits product requirements** (`requirements.md`, `plan.md`, or any user-intent-derived content). Only enforces structural and canonical invariants.

**Scope (normative — strictly limited to):**

- **DRY/SSOT compliance:** No platform data hardcoded outside `platform_specs`; no schema fields duplicated across artifacts.
- **Plan graph integrity:** `node_id` determinism; shard hash correctness (sha256 in `index.json` matches node file bytes); entrypoints resolve; edge consistency; `execution_ordering` completeness.
- **Wiring matrix (if GUI project):** `ui/wiring_matrix.json` and `ui/ui_command_catalog.json` present and internally consistent; every `UICommandID` referenced in plan nodes resolves in `ui_command_catalog.json`.
- **Evidence/invariants alignment:** Every plan node's `evidence_required.path` is consistent between the node shard and the acceptance manifest; acceptance `check_id`s are present in the manifest.
- **Deterministic decisions/autonomy compliance:** `auto_decisions.jsonl` entries conform to `Plans/auto_decisions.schema.json`; every ambiguity is logged; no human-required blocking decisions remain unresolved.

**Actions:**

- Flag pass-3 canonical violations as `findings[]` entries (for example, `finding_id` values prefixed with `pass_3_violation:`).
- For structural violations that can be corrected **without touching product requirements** (e.g., a missing sha256 in `index.json`, a missing `UICommandID` entry in the catalog): apply the correction and record in `changes_applied_summary` with `diff_pointer`.
- For violations that require human input or product-level decisions: record an entry in `unresolved_findings[]` and set `pass_verdict` to `"fail"`.

**Produces:**
- Final artifact set with all structural corrections applied.
- `validation_pass_report` (Pass 3) stored in seglog containing:
  - `pass_number: 3`
  - `pass_name: "canonical_systems"`
  - `findings[]`: list of all pass-3 canonical violations detected
  - `changes_applied_summary`: list of structural corrections applied, each with `diff_pointer`
  - `unresolved_findings[]`: violations requiring human or product-level resolution
  - `pass_verdict`: `"pass"` or `"fail"`
  - `verdict_reason`: human-readable reason

> **Invariant (normative):** Pass 3 MUST NOT modify `requirements.md`, `plan.md`, or any artifact whose content is driven by user intent or product scope. It enforces structural and canonical invariants only.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/chain-wizard-flexibility.md

---

### 12.3 Execution Model

- All three passes run **deterministically without human intervention**.
- Each pass runs **headless** — no GUI is required; no user approval gate exists between passes.
- Passes run **serially** (Pass 1 → Pass 2 → Pass 3); each pass receives the artifact set as corrected by the previous pass.
- Per-pass provider and model are configurable (see `Plans/assistant-chat-design.md §26`); defaults are deterministic and safe when not explicitly configured.
- Each `validation_pass_report` MUST include `provider` and `model` values matching resolved app settings keys `validation_sweep.passN.provider` and `validation_sweep.passN.model` for the same pass (see `Plans/assistant-chat-design.md §26` and `Plans/Project_Output_Artifacts.md §10.2`).
- The **final project artifacts** reflect all post-pass corrections applied by Passes 2 and 3.
- **If Pass 1 fails:** Passes 2 and 3 do not run; the workflow surfaces the Pass 1 failure to the user.
- **If Pass 2 or Pass 3 fails** (unresolved findings): The failure is surfaced to the user; however, the corrected artifact set (with all resolvable fixes already applied) is still written.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Project_Output_Artifacts.md

### 12.4 Acceptance Criteria (normative)

The following criteria are required for a conformant implementation of this workflow:

- [ ] Passes run deterministically without human intervention.
- [ ] Each pass can be executed headless (no GUI required; no approval gates between passes).
- [ ] Pass 3 never edits `requirements.md`, `plan.md`, or user-intent-derived content; it only enforces canonical system integrity and flags failures.
- [ ] Each pass emits a `validation_pass_report` artifact stored in seglog (`artifact_type: validation_pass_report`).
- [ ] The final project artifacts reflect all corrections applied by Passes 2 and 3.
- [ ] Per-pass provider + model selection is exposed in the GUI settings (see `Plans/assistant-chat-design.md §26`).

### 12.5 SSOT References (DRY)

| Concern | SSOT Reference |
|---|---|
| Artifact paths and artifact types | `Plans/Project_Output_Artifacts.md` |
| Platform contracts | `Plans/Contracts_V0.md` |
| Architecture invariants | `Plans/Architecture_Invariants.md` |
| DRY rules | `Plans/DRY_Rules.md` |
| Decision policy | `Plans/Decision_Policy.md` |
| Per-pass provider/model settings GUI | `Plans/assistant-chat-design.md §26` |
| Auto-decisions schema | `Plans/auto_decisions.schema.json` |
| UI wiring rules and schema | `Plans/UI_Wiring_Rules.md`, `Plans/Wiring_Matrix.schema.json` |

---

