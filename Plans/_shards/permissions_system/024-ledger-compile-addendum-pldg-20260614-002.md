# Shard 024: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/Permissions_System.md`

Source lines: L7489-L7529

Source SHA256: `38cc1ac912180e8d1e484a841c6e6441b01fb994fde3226bb2653e62c4c2d2dc`

---

## Ledger Compile Addendum - pldg-20260614-002

### PS-113 - Approval Scope Level And Cross-Boundary Carryover

```yaml
plan_unit_id: PS-113
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permission approval reuse must resolve through an `approval_scope_key` schema that includes actor,
  lane, package, run, account, tool, context, mode, requested identity, effective identity, and
  execution_role inputs. Default carryover is narrow: an approval can carry across session, lane,
  run, or account boundaries only when the key explicitly records that boundary and the target
  permission class allows carryover. Reject-cascade must evaluate the same scoped key instead of a
  single-session or single-lane assumption.
gui_related: false
gui_classification_reason: Approval scope keys and reject-cascade behavior are permission/runtime contracts, not visual presentation.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - "`approval_scope_key` has a defined schema over actor/lane/package/run/account/tool/context/mode/requested/effective identity/execution_role."
  - Session approval carryover is denied by default unless the scoped key and permission class allow it.
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
preserved_exact_tokens: ["Approval Scope Key", "approval_scope_key", "actor/lane/run/account", "session approval carryover", "reject-cascade", "single-session/single-lane"]
negative_constraints:
  - Do not allow approval reuse from a provider session id alone.
  - Do not carry approvals across actor, lane, run, or account boundaries unless the scoped key explicitly permits it.
owner_hints: [Plans/Permissions_System.md, Plans/Prompt_Pipeline.md, Plans/human-in-the-loop.md]
```
