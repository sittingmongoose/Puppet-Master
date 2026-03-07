## 6. Autonomy + decision logging (no human-required decisions)

- Deterministic defaults are defined in `Plans/Decision_Policy.md` and MUST be applied autonomously.
  - ContractRef: `PolicyRule:Decision_Policy.md`
- All ambiguities (where multiple valid options exist) MUST be recorded to `.puppet-master/project/auto_decisions.jsonl`
  (newline-delimited JSON; each row conforms to `Plans/auto_decisions.schema.json`).
- `.puppet-master/project/auto_decisions.jsonl` is the canonical user-project decision log only; Puppet Master internal SSOT maintenance decisions continue to use `Plans/auto_decisions.jsonl`.
- User-project auto-decision rows MUST conform to `pm.auto_decisions.schema.v1` exactly.
- For user-project outputs, canonical persistence remains seglog first; decision rows are projected to `.puppet-master/project/auto_decisions.jsonl` as a regenerable filesystem artifact.
- Puppet Master MUST continue execution without requiring humans to resolve ambiguities (the log is for traceability, not gating).

ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§4

- Optional HITL approvals are supported (mid-tier and/or boundary nodes) but are not required:
  - use node `tool_policy_mode: "ask"` (schema: `pm.project-plan-node.v1`) to mark approval boundaries.

