# Shard 025: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/Permissions_System.md`

Source lines: L7532-L7575

Source SHA256: `09de784b5bcb5fc6bfc78c581abfe7956deb1ffec88e2cd0cada9156fd16f907`

---

## Ledger Compile Addendum - pldg-20260614-002

### PS-113 - Approval Scope Level And Cross-Boundary Carryover

```yaml
plan_unit_id: PS-113
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permission approval reuse must resolve through an `approval_scope_key` schema derived from the
  runtime identity envelope plus tool/context/mode and including actor, lane, package, project, run,
  account, tool, context, mode, requested identity, effective identity, execution_role, and
  `approval_scope_level` inputs. Default carryover is narrow lane/run/actor scope: an approval must
  not cross lane, run, project, or account boundaries unless `approval_scope_level` explicitly
  permits that boundary, the scoped key records it, and the target permission class allows carryover.
  Reject-cascade must evaluate the same scoped key instead of a single-session or single-lane
  assumption.
gui_related: false
gui_classification_reason: Approval scope keys and reject-cascade behavior are permission/runtime contracts, not visual presentation.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - "`approval_scope_key` has a defined schema from the runtime identity envelope over actor/lane/package/project/run/account/tool/context/mode/requested/effective identity/execution_role/approval_scope_level."
  - Default carryover remains narrow lane/run/actor scope; crossing lane, run, project, or account boundaries requires explicit `approval_scope_level`, scoped key coverage, and permission-class allowance.
  - Reject-cascade is evaluated against scoped keys rather than global session state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: approval_scope_overreach
reasoning_tier: high
context_scope: permissions_approval_scope
implementation_surfaces: [Plans/Permissions_System.md, Plans/Prompt_Pipeline.md, Plans/human-in-the-loop.md]
node_compile_hint: {mode: approval_scope_key_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0032
  - pldg-20260614-002-part-3-fable-cleanup:atom-0048
preserved_exact_tokens: ["Approval Scope Key", "approval_scope_key", "runtime identity envelope", "tool/context/mode", "narrow lane/run/actor default carryover", "approval_scope_level", "crossing lane, run, project, or account boundaries", "actor/lane/run/account", "session approval carryover", "reject-cascade", "single-session/single-lane"]
negative_constraints:
  - Do not allow approval reuse from a provider session id alone.
  - Do not allow implicit cross-lane, cross-run, cross-project, or cross-account approval carryover.
  - Do not preserve single-session/single-lane reject-cascade behavior without actor/lane/run/account identity scope.
owner_hints: [Plans/Permissions_System.md, Plans/Prompt_Pipeline.md, Plans/human-in-the-loop.md]
```
