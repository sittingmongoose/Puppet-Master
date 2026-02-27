## 10. Validation Pass Report Artifacts

This section defines the structure and persistence contract for **validation pass reports** emitted by the Three-Pass Canonical Validation Workflow (see `Plans/chain-wizard-flexibility.md §12`). Pass reports are **canonical in seglog only** (no required filesystem staging file; filesystem export is optional).

### 10.1 Seglog persistence (pass reports)

Each pass emits one `validation_pass_report` artifact event to seglog with:

Required fields (all fields from §8.1, plus):

- `artifact_type`: `"validation_pass_report"`
- `logical_path`: `.puppet-master/project/validation/pass_<N>_report.json` (N = 1, 2, or 3)
- `content_bytes`: JSON payload (base64-encoded) conforming to the pass report schema below
- `content_hash`: SHA-256 of `content_bytes` (hex)

Additional required correlation fields:

- `pass_number`: integer (1, 2, or 3)
- `pass_name`: string — `"document_creation"` | `"canonical_alignment"` | `"canonical_systems"`
- `workflow_run_id`: stable identifier for the validation sweep run (links the three passes together)

### 10.2 Pass report JSON schema (normative)

Each pass report JSON (the content of `content_bytes`) MUST include:
ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md

```json
{
  "pass_number": 1,
  "pass_name": "document_creation",
  "workflow_run_id": "<stable-run-id>",
  "pass_verdict": "pass",
  "verdict_reason": "All required artifacts generated successfully.",
  "findings": [],
  "changes_applied_summary": [
    {
      "artifact_path": ".puppet-master/project/requirements.md",
      "action": "created",
      "diff_pointer": null
    }
  ],
  "diff_pointers": [],
  "unresolved_findings": [],
  "provider": "<provider-id>",
  "model": "<model-id>",
  "ts": "<ISO-8601 timestamp>"
}
```

Field definitions:

- `pass_verdict`: `"pass"` or `"fail"`.
- `verdict_reason`: Human-readable explanation of the verdict.
- `findings[]`: List of findings (gaps, contradictions, violations found). Each entry: `{ finding_id, description, severity, artifact_path, resolution_applied }`.
- `changes_applied_summary[]`: List of artifacts changed. Each entry: `{ artifact_path, action: "created"|"modified"|"corrected", diff_pointer: null | "<description-of-change>" }`.
- `diff_pointers[]`: Optional list of diff descriptions (artifact path + before/after summary for each corrected artifact). Pass 1 always has empty diff_pointers (generation, not correction).
- `unresolved_findings[]`: Findings that could not be resolved. Each entry: `{ finding_id, description, reason_unresolved }`. Non-empty → `pass_verdict: "fail"`.
- `provider`: The provider ID used for this pass (from app settings; see `Plans/assistant-chat-design.md §26`).
- `model`: The model ID used for this pass.
- `ts`: ISO-8601 timestamp of pass completion.

### 10.3 Pass 3 write-protection invariant (normative)

Pass 3 (`canonical_systems`) MUST NOT create or modify the following artifacts:

- `.puppet-master/project/requirements.md`
- `.puppet-master/project/plan.md`
- Any artifact whose content is driven by user intent or product scope.

Pass 3 MAY create or modify derived artifacts that are not planning-canonical. In particular, `.puppet-master/project/quickstart.md` is a derived convenience output and MAY be regenerated in Pass 3 as long as §12 determinism rules are satisfied.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md§12, ContractName:Plans/chain-wizard-flexibility.md§12

If Pass 3 finds a violation that requires modifying a write-protected artifact, it MUST record the finding as an entry in `unresolved_findings[]` with `reason_unresolved: "protected_artifact"` and set `pass_verdict: "fail"`.

This invariant is normative and MUST be enforced by the execution layer.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md§12, Gate:GATE-001

### 10.4 Acceptance criteria (pass report artifacts)

A validator MUST verify, at minimum:

1. Exactly three `validation_pass_report` events exist in seglog for each validation sweep run, with `pass_number` = 1, 2, 3.
2. All three share the same `workflow_run_id`.
3. Each report's `content_hash` matches the SHA-256 of its `content_bytes`.
4. Pass 3 `changes_applied_summary` contains no entries for write-protected artifacts (requirements.md, plan.md). Changes to derived outputs (for example `quickstart.md`) are allowed.
5. If any `unresolved_findings` are non-empty, `pass_verdict` is `"fail"`.
6. For each `pass_number = N`, report `provider` and `model` equal the resolved app settings keys `validation_sweep.passN.provider` and `validation_sweep.passN.model` at sweep start.
7. The three reports are produced by one deterministic, headless sweep run with no human approval gates between passes (see `Plans/chain-wizard-flexibility.md §12.3` and §12.4).

ContractRef: Gate:GATE-001, ContractName:Plans/chain-wizard-flexibility.md§12, ContractName:Plans/assistant-chat-design.md§26

