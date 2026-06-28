# Shard 028: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Permissions_System.md`

Source lines: L7698-L7754

Source SHA256: `3550c81041bd3eebe4aadf89cbc6203c6a6a5e9cffc9c0c731cfa07c52d6e944`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### PS-116 - Plans-To-Code Critical Escalation And External Effects

```yaml
plan_unit_id: PS-116
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permissions_System owns critical user-escalation and external-effect policy for plans-to-code execution. Default hands-off execution escalates to the user only for missing credentials or secrets, billing/payment/legal/license acceptance, unsafe destructive operation, irreversible external side effect, unrecoverable environment failure, true product decision with no inferable answer, or security-sensitive approval. Execution policy must define network access policy, secret access policy, filesystem write policy, destructive command policy, database/test-data policy, browser profile isolation, real-account versus sandbox-account policy, credential redaction, and artifact privacy/retention policy before risky WorkNode execution proceeds.
  Policy field names include network_access_policy, secret_access_policy, and destructive_command_policy, and critical blockers include configured checkpoints only when explicit HITL or approval policy calls for them.
gui_related: false
gui_classification_reason: Permission, approval, network, secrets, destructive command, and privacy policy are security/runtime behavior.
depends_on: [PS-115]
unblocks: [EP-102, GRS-030, HITL-036]
acceptance_criteria:
  - Default user escalation is critical-only.
  - Network, secrets, filesystem writes, destructive commands, database/test data, browser profile isolation, real/sandbox account, credential redaction, and artifact privacy/retention are explicit policy surfaces.
  - Permission blockers name recoverable user, Settings, worktree, or approval action when one exists.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future external-effects policy validation
risk_class: unsafe_external_effect
reasoning_tier: high
context_scope: plans_to_code_permissions
implementation_surfaces: [Plans/Permissions_System.md, Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md, Plans/FileSafe.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: critical_escalation_external_effects, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0044
  - pldg-20260617-001-plans-to-code-handoff:atom-0045
  - pldg-20260617-001-plans-to-code-handoff:atom-0049
  - pldg-20260617-001-plans-to-code-handoff:dec-0019
  - pldg-20260617-001-plans-to-code-handoff:dec-0021
  - pldg-20260617-001-plans-to-code-handoff:corr-0009
preserved_exact_tokens:
  - "critical authority blockers"
  - "credentials/secrets"
  - "billing/payment/legal/license"
  - "unsafe destructive operation"
  - "irreversible external side effect"
  - "security-sensitive approval"
  - "network access policy"
  - "secret access policy"
  - "destructive command policy"
  - "browser profile isolation"
  - "credential redaction"
negative_constraints:
  - Do not ask the user for ordinary row-level uncertainty in default mode.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Executor_Protocol.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/FileSafe.md
