# Shard 020: Ledger Compile Addendum - pldg-20260629-001-feature-name

Source: `Plans/Multi-Account.md`

Source lines: L4746-L4861

Source SHA256: `974044cf9e113923cd82707cf101bda848045df8344b746b8f920664fd799fb8`

---

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models account/switching behavior into Multi-Account ownership. It keeps Free Models as a wrapper over underlying provider/account identity and does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### MA-064 - Free Models Underlying Account Identity And Setup Delegation

```yaml
plan_unit_id: MA-064
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Free Models entries use the underlying PM provider/account/profile credential owner for setup, auth, reconnect, billing, entitlement, org-policy, and pressure identity. Free Models must not collect, store, or own underlying provider credentials; setup launches the exact underlying provider/account setup surface and returns to the originating Free Models row/list with eligibility refreshed.
gui_related: true
gui_classification_reason: Includes user-visible setup entry points and return behavior from Free Models rows to provider/account setup.
depends_on: []
unblocks: []
acceptance_criteria:
  - Free Models setup delegates to the underlying provider/account setup flow instead of collecting credentials in the Free Models wrapper.
  - Setup rows show the underlying provider name and account state before launch.
  - Returning from setup refreshes affected Free Models eligibility/catalog state and keeps saved top-10 order unchanged.
  - "`Sign in`, `Set up provider`, and `Reconnect` labels map to existing account/auth state."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models setup delegation fixtures
  - Multi-Account credential custody fixtures
risk_class: credential_ownership_drift
reasoning_tier: high
context_scope: free_models_account_setup
implementation_surfaces:
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: free_models_account_setup_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0068, atom-0072, atom-0084, atom-0088, atom-0228, atom-0232, atom-0235, atom-0236, atom-0239, atom-0240, atom-0243, atom-0244, atom-0247, atom-0248, atom-0251, atom-0255, atom-0259, atom-0263, atom-0267, atom-0271, atom-0293, atom-0294]
preserved_exact_tokens:
  - "underlying PM provider/account setup flow"
  - "Set up provider"
  - "Sign in"
  - "Reconnect"
  - "return target"
  - "originating Free Models row/list"
  - "Ready"
  - "Needs setup"
negative_constraints:
  - Do not collect or store underlying provider credentials inside the Free Models provider.
  - Do not strand users away from the originating Free Models row/list after setup.
  - Do not change saved top-10 order after provider setup refresh.
owner_hints:
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
  - Plans/FinalGUISpec.md
```

### MA-065 - Free Models Shared Pressure Cooldown And Bounded Switching

```yaml
plan_unit_id: MA-065
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Free Models quota, rate-limit, exhaustion, cooldown, retry, and switch state is keyed by the underlying provider/account/model and counted in shared Usage/Multi-Account pressure. PM must not create a separate Free Models quota switcher. Unknown quota/reset signals use coarse pressure from failures/successes and conservative cooldowns without fabricated percentages or reset times. Automatic fallback is bounded by configurable global/section limits and defaults to the initial attempt plus `2` automatic fallback attempts per request.
gui_related: true
gui_classification_reason: Shared pressure affects user-visible cooldown, Retry now, skipped reason, and switch-state rows.
depends_on: []
unblocks: []
acceptance_criteria:
  - Pressure and cooldown state is shared with Multi-Account switching and keyed by underlying provider/account/model.
  - Attempt accounting counts the initial selected/requested model plus every automatic switch attempt.
  - Skipped-without-call entries may appear in receipts but do not consume quota or count as a provider call.
  - Cooldowned entries stay skipped until provider reset/cooldown expiry or explicit `Retry now`; successful manual retry clears cooldown and failed manual retry extends pressure conservatively.
  - Unknown quota providers never display fabricated percentages or reset times.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Shared pressure and cooldown fixtures
  - Free Models bounded fallback attempt fixtures
risk_class: pressure_switching_drift
reasoning_tier: high
context_scope: free_models_pressure_and_switching
implementation_surfaces:
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: free_models_shared_pressure_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0021, atom-0024, atom-0030, atom-0031, atom-0032, atom-0074, atom-0078, atom-0114, atom-0119, atom-0209, atom-0210, atom-0211, atom-0213, atom-0214, atom-0215, atom-0217, atom-0218, atom-0219, atom-0221, atom-0222, atom-0223, atom-0266, atom-0270, atom-0285, atom-0286]
preserved_exact_tokens:
  - "quota and usage"
  - "multi account"
  - "auto switch"
  - "initial attempt plus 2 automatic fallback attempts"
  - "Retry now"
  - "no fabricated percentages/reset times"
negative_constraints:
  - Do not keep Free Models pressure separate from the underlying provider/account/model pressure state.
  - Do not fabricate quota percentages or reset times for providers without explicit signals.
  - Do not fan out one request across unlimited fallback providers.
  - Do not clear cooldown after a failed manual retry.
owner_hints:
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/Models_System.md
```
