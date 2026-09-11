# Shard 025: Workspace-reset event authority — 2026-09-11

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L11485-L11637

Source SHA256: `972ea88a1cf7ad70dd85bdf827047c6222a1ee430176fbf39f5dc975a1beeb92`

---

## Workspace-reset event authority — 2026-09-11

These are **newly authored technical owner definitions under DL-046**, for
`browser.workspace.reset` only. Section 3.18A, the existing reset command and
its prepared payload already require an ordinary, exact workspace reset,
strictly advancing owner generation and invalidation of old page/controller
projections. A per-family current-source search found partial command, generation
and replay contracts, but no reset-specific versioned consumer/checkpoint binding.
SP-278 now supplies concrete generic index custody; it does not supply this
filtered Browser binding. Neither a sibling identifier nor passing schema checks
is authority to admit another family.

### Original operation and resolved generation join

The only producer is the authenticated `BrowserRuntimeService.workspace` on the
exact Project/Home Server/Execution Host/Execution Environment/Source Location and
ordinary BrowserSession/BrowserWorkspace. The existing
`cmd.browser.workspace.reset` / `handlers::browser_program::workspace_reset` path
must independently resolve permission, FileSafe, capability, workspace policy,
controller lease/epoch/holder and owner revision before the effect. A component
string, Client request, adapter, projection or fixture cannot authenticate it.
Protected `AuthBrowserSession` is structurally and operationally ineligible.

The request's `expected_workspace_revision` is the actual checked owner revision.
It is **not** a workspace generation, and neither equality between those values
nor an exact generation increment of one is implied. Serialize the original
`command_instance_id` and idempotency key against that workspace. Resolve the
actual prior generation and the newly committed generation; both are nonnegative,
the prior is non-null, and the new value is strictly greater. Reset retains the
same workspace identity and exact topology/session; creation, close, handoff or
reconstruction is not a substitute. The old page/controller projections must
actually be fenced, including late actions, before the reset fact is eligible.

`Plans/browser_workspace_reset_contracts.schema.json#/$defs/resolved_transition`
defines a **new read-only resolver view** of the original owner transition. It
joins the checked revision, actual prior/new generation, original controller
authority, exact subject, node lineage, request instance/key, workspace result
reference, permission/capability/FileSafe references and committed/fenced facts.
The full original event context, including optional page/generation, program,
segment, routine and initiating lineage, must also join that resolved view.
It is not a new physical record or storage family. Its fields must come from the
actual authenticated owner's original request/result/transition-receipt custody;
matching strings, caller booleans, a current workspace or a recreated receipt do
not establish resolution. No new on-disk Browser profile/session/result format
or lifetime is authorized by this view.

The payload retains the existing exact `workspace_reset` schema and ID
`pm.browser_event.workspace_reset.schema.v1`. Resolve `owner_record_ref` to the
original `browser_command_result`, with `cmd.browser.workspace.reset`, the same
request scope and command instance, `outcome=succeeded`,
`effect_state=effects_reconciled`, and a `result_refs` member resolving the exact
reset workspace. Its dispatch receipt and the payload's transition receipt must
resolve the same original operation. All initiating optional lineage remains
actual; Run/Attempt are both null or both real. Envelope lineage equals payload
context. The resolver view's generations equal the event facts, its checked
revision/controller equal the request, and its reference values join the
resolved records, not merely their spelling. Referenced content retains its own
access, retention and redaction rules; no content or credential is copied here.

### Effect/append ordering, uncertainty and replay

Unlike creation's unexposed new-resource preparation, a reset may already have
changed the existing workspace when event append fails. The owner first commits
the actual new generation and fences old projections, then submits the original
bounded reset fact through the existing barrier EventRecord append. Publish
successful command completion and the event-dependent read projection only after
the synced frame/manifest AppendReceipt. This is ordered owner-effect/seglog
coordination, **not** an invented atomic cross-store transaction or rollback.

Pre-dispatch rejection, unavailable handler, acceptance-only and proven no-change
append no reset event. Unknown effect state must be reconciled before asserting
the committed generation/fence facts. Once a reset effect is known committed,
failed or uncertain append leaves the affected workspace/operation
recovery-required. It must not claim no effect, restore the old generation,
repeat the reset or accept a different mutation through the unresolved boundary.
Reconcile or retry only the **original append identity**, after validating its
original semantic content and existing owner/Storage fences. An uncertain append
is not proof that no frame exists. A committed frame with lost acknowledgement
returns the original available result without a second reset or event.

Exact app-root event identity and scoped event-type/idempotency dedupe remain
Storage-owned. Changed semantic content or a different original request/result
under that identity is a conflict; unavailable identity/result custody remains
typed unavailable/recovery-required. The event cannot reconstruct the original
command result. Reading that result requires current access even when the
original operation was authorized. After an effect, a later distinct command
must resolve the owner's actual new revision rather than deriving one from the
generation or reusing a stale revision. Restart never turns event replay into a
Browser process, profile, controller grant or generation mutation. If native
owner custody cannot safely resume/reconcile the operation, keep the affected
path unavailable; these static contracts do not prove that custody exists.

### Exact historical consumer and live-owner boundary

Define **new read consumer** `browser.workspace_inventory.reset.v1@1.0.0`, in
the existing Browser workspace inventory/stale-subject inspection path. It uses
only `storage.browser_workspace_reset_index.v1@1.0.0` and SP-282's checkpoint,
explicitly adopting SP-278's current root/generation/anchor/frontier/source/read
token. It returns verified retained reset boundaries for the requested exact
Project/topology/session/workspace. There is no independent durable Browser
projection, effect cursor, command, notification, UsageRecord or prompt delivery.

A historical boundary may explain why an old subject is stale; it never establishes
the latest live generation, current controller, current capability, current access
or a usable return route. The ordinary Browser owner must resolve and revalidate
those authorities before any new action. A retained old reset cannot undo a later
reset, close, handoff or deletion. No matching fact means only
`not_found_in_retained_coverage`, not proof that no reset occurred. Unavailable
source/authority returns the existing typed unavailable/stale/no-effect outcome,
not a silently chosen newest/focused workspace.

Usage and Prompt Pipeline keep their separate UF-103/PP-091 contracts. Neither
acquires an independent persisted subscription/effect from this event. Reading
reset metadata cannot charge usage, attach prompt material, dereference an
artifact or start an action. Future independent consumers need their own exact
reviewed owner/Storage bindings.

### SMPFS-168 - Workspace-reset transition and historical boundary consumer

```yaml
plan_unit_id: SMPFS-168
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Newly define the browser.workspace.reset-only resolved owner transition and
  browser.workspace_inventory.reset.v1@1.0.0 consumer under DL-046. The authenticated
  original owner joins revision, strictly advancing generation, controller fencing,
  request/result/receipt and scope before publishing the committed reset fact.
  Failed or uncertain append after the reset effect requires original-operation
  recovery, never a second reset, no-effect claim or generation rollback.
gui_related: false
gui_classification_reason: Defines ownership, identity, replay and recovery, not presentation.
depends_on: [DL-046, SMPFS-166, CV-332, SP-278]
unblocks: []
acceptance_criteria:
  - Revision and generation remain distinct; actual prior/new generation and all original request/result/receipt/controller/scope joins are validated.
  - Rejected or unchanged transitions emit nothing; known reset effect with failed/unknown append remains fenced until original identity resolution.
  - Original-result retry and historical replay cannot reset again, rewind a newer generation or recreate unavailable owner custody.
  - The sole historical reader adopts the complete SP-278 token through SP-282 without acquiring live Browser, Usage or Prompt authority.
validation_surfaces: [Plans/browser_workspace_reset_contracts.schema.json, Plans/browser_workspace_reset_contract_fixtures.json, tests/test_pm_browser_workspace_reset.py]
risk_class: browser_reset_generation_replay_or_append_uncertainty
reasoning_tier: high
context_scope: browser_workspace_reset_single_family
implementation_surfaces: [Plans/browser_event_admission.json, Plans/browser_event_payloads.schema.json, Plans/storage-plan.md]
node_compile_hint: {mode: static_single_family_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-046, Plans/Section15_MVP_Promoted_Features_Spec.md#318a-pm-browser-script-browserprogram-and-local-execution]
negative_constraints:
  - No sibling admission, new feature, protected-auth access, new retention policy, Browser physical owner family or current live generation inferred from event history.
  - No native authentication, receipt custody, end-to-end indexed-reset, durability, runtime, readiness, historical-audit closure or governance seal follows from synthetic checks.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-046, ContractName:Plans/Contracts_V0.md#CV-332, ContractName:Plans/storage-plan.md#SP-282, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/usage-feature.md#UF-103, ContractName:Plans/Prompt_Pipeline.md#PP-091
