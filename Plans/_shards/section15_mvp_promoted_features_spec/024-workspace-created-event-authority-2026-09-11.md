# Shard 024: Workspace-created event authority — 2026-09-11

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L11407-L11535

Source SHA256: `e750a78018fc0ec74c2408635d69f122e1f9a59c26ba6d8a5c8508f534bdf091`

---

## Workspace-created event authority — 2026-09-11

The following are **newly authored technical owner definitions under DL-046**,
limited to `browser.workspace.created`. The existing Section 3.18A workspace,
command, isolation, permission and replay behavior remains the product authority.
The previous generic consumer references were not concrete versioned bindings.
No definition here applies to the other 52 Browser families by analogy.

### Producer, transition and acknowledgement

The sole producer is `BrowserRuntimeService.workspace`, reached through the
existing `cmd.browser.workspace.create` / `handlers::browser_program::workspace_create`
owner path. A Client, test fixture, generic process, adapter, projection, matching
component string or a receipt-shaped object is not a producer. The Server must
resolve and authenticate the actual BrowserRuntimeService instance on the exact
Home Server, Execution Host, Execution Environment and Source Location. Resolve
the ordinary BrowserSession and current Project authorization, permission,
FileSafe, workspace policy and capability independently before preparing a new
isolated workspace identity. Protected authentication is never eligible.

Creation uses the original `command_instance_id` and request idempotency key.
The owner serializes creation for that request and reserves an unused workspace
identity; it cannot reuse a reset/closed identity or turn a repeat request into a
second workspace. A prepared runtime resource is not exposed to a controller,
navigation, agent, viewer or command-result consumer before the creation commit.
The owner verifies the actual isolated resource and exact assigned generation,
then submits its bounded creation fact to the existing barrier EventRecord append.
The synced frame/manifest AppendReceipt is the logical creation commit; only then
may the owner publish success and make the prepared workspace available through
the ordinary independently checked action path. This is an ordered runtime/seglog
barrier, not a cross-store transaction or admission of a Browser session/profile
physical family. Failure before commit disposes or fences the unexposed resource;
an uncertain append fences it until the original durable identity is resolved.
After a committed event and lost acknowledgement, return the original identity
and result without creating another workspace. After restart, the retained fact
does not recreate a browser process or make the former workspace live.

The payload remains the exact closed `workspace_created` definition in
`Plans/browser_event_payloads.schema.json`, schema ID
`pm.browser_event.workspace_created.schema.v1`. The new-identity transition has
`workspace_state=created`, `prior_workspace_generation=null`, and the actual
nonnegative assigned `workspace_generation` (not an assumed initial zero).
Project, topology, ordinary session and new workspace are non-null and exact.
Optional thread/Plan/Goal/agent/Run/attempt lineage is the verified initiating
lineage; Run and attempt are both null or both actual, never fabricated for
retention. Envelope Project/thread/Run/node/attempt equal payload context.

Resolve `owner_record_ref` to the existing `browser_command_result` owner result
and `transition_receipt_ref` to the actual command dispatch/transition receipt,
not arbitrary ref text. The result has the original command instance, command
`cmd.browser.workspace.create`, matching topology/session/new workspace,
`outcome=succeeded`, `effect_state=effects_reconciled`, and a result reference to
the newly committed workspace. The prepared result may be checked before append
but is not published as success until the barrier commits. Permission and
capability refs must resolve to the exact admitted snapshots at that transition;
they are evidence identifiers, not transferable permission. No inline page,
profile, network, credential, code or screenshot content is introduced.
Proven unavailable/rejected/acceptance-only/no-change or pre-barrier noncreation
outcomes append nothing. Uncertain append is unresolved, not evidence of zero
append; a later failure, cancellation or lost acknowledgement cannot erase an
already committed creation fact. Reconcile the original identity and never
blindly retry the resource effect. Native authentication, effect isolation, receipt resolution and
crash behavior remain required implementation proofs, not facts established by
the synthetic semantic oracle.

### Exact read consumer and currentness

Define **new read consumer** `browser.workspace_inventory.created.v1@1.0.0`,
owned by BrowserRuntimeService's existing workspace inventory/return-route path.
It consumes **new Storage binding** `storage.browser_workspace_created_index.v1@1.0.0`
and the exact checkpoint in SP-266. It returns only a verified historical creation
fact for the requested Project/topology/session/workspace, qualified by the same
Storage read token. It has no independent durable state, cursor, command, event,
notification, prompt, UsageRecord or live-runtime side effect.

Index/filter currentness means only complete examination of the declared retained
source range. It never means that the workspace is still open, owns a controller,
has the original generation, is on the same Host, or is authorized now. Before
offering a current return route or any action, the ordinary Browser owner must
resolve the current workspace/session/topology, deletion state, permissions,
capability and relevant page/controller fence. Missing or changed authority
returns the existing typed stale/unavailable/no-effect outcome; focus or a newer
timestamp cannot substitute. No matching retained fact means
`not_found_in_retained_coverage`, not proof that a workspace never existed.
An old creation fact must not undo later reset, close, handoff or deletion.

Usage and Prompt Pipeline remain the separate UF-103 / PP-091 consumers of
independently admitted operational attribution and bounded prompt material.
Neither subscribes a durable side effect or checkpoint to this event. Reading
this creation fact cannot create billing, attach a chip, dereference an artifact,
or start a Browser action. A future independent persisted consumer requires its
own reviewed owner/Storage binding before use.

### SMPFS-167 - Workspace-created transition and historical inventory consumer

```yaml
plan_unit_id: SMPFS-167
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Newly define the browser.workspace.created-only producer commit and read-consumer
  binding under DL-046. Only the authenticated ordinary BrowserRuntimeService.workspace
  owner publishes the exact committed creation identity after the barrier AppendReceipt.
  browser.workspace_inventory.created.v1@1.0.0 reads the historical creation fact through
  storage.browser_workspace_created_index.v1@1.0.0 and SP-266, with no independent durable
  effect and no authority to recreate or act on a live workspace.
gui_related: false
gui_classification_reason: This is event, scope, identity and replay authority, not presentation.
depends_on: [DL-046, SMPFS-166, CV-332]
unblocks: []
acceptance_criteria:
  - Exact authenticated producer, request/result/receipt scope joins and actual permission/capability checks precede the barrier commit; rejected, unchanged or uncertain transitions cannot claim creation.
  - A new workspace identity has no predecessor generation; idempotent retries return the original committed result without a second runtime resource or event.
  - The one read consumer uses the complete SP-266 snapshot/checkpoint token; historical creation and index currentness never grant current Browser authority.
  - Replay, deletion, recovery and withdrawal cannot dispatch, recreate a process, restore a controller, attach prompt material or create UsageRecords.
validation_surfaces: [Plans/browser_workspace_created_contracts.schema.json, Plans/browser_workspace_created_contract_fixtures.json, tests/test_pm_browser_workspace_created.py]
risk_class: browser_workspace_creation_or_replay_authority_escape
reasoning_tier: high
context_scope: browser_workspace_created_single_family
implementation_surfaces: [Plans/browser_event_admission.json, Plans/browser_event_payloads.schema.json, Plans/storage-plan.md]
node_compile_hint: {mode: static_single_family_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-046, Plans/Section15_MVP_Promoted_Features_Spec.md#318a-pm-browser-script-browserprogram-and-local-execution]
negative_constraints:
  - No sibling-family admission, new feature, event alias, protected-auth access, Browser session/profile physical-family admission or native-proof claim.
  - No runtime availability, currentness clearance, WorkNodes, NodeSeeds, frozen-audit rewrite or governance seal follows from this contract.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-046, ContractName:Plans/Contracts_V0.md#CV-332, ContractName:Plans/storage-plan.md#SP-266, ContractName:Plans/usage-feature.md#UF-103, ContractName:Plans/Prompt_Pipeline.md#PP-091
