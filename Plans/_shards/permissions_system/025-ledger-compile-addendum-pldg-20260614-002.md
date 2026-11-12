# Shard 025: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/Permissions_System.md`

Source lines: L7878-L7948

Source SHA256: `8a822dfee3c7bae1f698d8b8d5337961e3a651394b020335eb914cb14d43fd0f`

---

## Ledger Compile Addendum - pldg-20260614-002

### PS-113 - Approval Scope Level And Cross-Boundary Carryover

```yaml
plan_unit_id: PS-113
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: approval_scope_key includes explicit scope_kind/project_id, tagged Computer/Host/Environment,
  actual roots, thread/run/actor/account and operation/target/mode identity, retaining lane/package/node only
  where genuinely present. It never depends on visible Project or provider session alone. Cross-project read/send
  grants are deliberate PS-145 scope exceptions; their exact boundaries are recorded and rechecked at source
  and receiver. They never transfer mutation, mode, durable Always, protected consent or build-grant authority.
  Children inherit only a narrower task and ceiling. Conversion reissues destination evidence and any old source
  approval remains historical.
gui_related: false
gui_classification_reason: Approval scope keys and reject-cascade behavior are permission/runtime contracts,
  not visual presentation.
depends_on:
- CV-281
- PS-145
- PS-148
unblocks: []
acceptance_criteria:
- '`approval_scope_key` has a defined schema from the runtime identity envelope over actor/lane/package/project/run/account/tool/context/mode/requested/effective
  identity/execution_role/approval_scope_level.'
- Default carryover remains narrow lane/run/actor scope; crossing lane, run, project, or account boundaries
  requires explicit `approval_scope_level`, scoped key coverage, and permission-class allowance.
- Reject-cascade is evaluated against scoped keys rather than global session state.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: approval_scope_overreach
reasoning_tier: high
context_scope: permissions_approval_scope
implementation_surfaces:
- Plans/Permissions_System.md
- Plans/Prompt_Pipeline.md
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: approval_scope_key_contract
  create_worknodes: false
source_lineage:
- pldg-20260614-002-part-3-fable-cleanup:atom-0032
- pldg-20260614-002-part-3-fable-cleanup:atom-0048
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards N3/N4/N18/N25/N27
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "Plan mode and scheduled
  tasks are also available in no project. It''s only planning wizard/prd builder/orchestrator that isn''t."'
preserved_exact_tokens:
- Approval Scope Key
- approval_scope_key
- runtime identity envelope
- tool/context/mode
- narrow lane/run/actor default carryover
- approval_scope_level
- crossing lane, run, project, or account boundaries
- actor/lane/run/account
- session approval carryover
- reject-cascade
- single-session/single-lane
negative_constraints:
- Do not allow approval reuse from a provider session id alone.
- Do not allow implicit cross-lane, cross-run, cross-project, or cross-account approval carryover.
- Do not preserve single-session/single-lane reject-cascade behavior without actor/lane/run/account identity
  scope.
owner_hints:
- Plans/Permissions_System.md
- Plans/Prompt_Pipeline.md
- Plans/human-in-the-loop.md
```
