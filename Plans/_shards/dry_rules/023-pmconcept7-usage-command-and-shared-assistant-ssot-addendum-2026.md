# Shard 023: PMConcept7 Usage, command, and shared Assistant SSOT addendum - 2026-08-27

Source: `Plans/DRY_Rules.md`

Source lines: L2338-L2442

Source SHA256: `11109edad77de99e5435ec7d13cd33654af0587b6a16f26eba546597831321c0`

---

## PMConcept7 Usage, command, and shared Assistant SSOT addendum - 2026-08-27

The recovered PMConcept7 surfaces remain consumers of existing owners. They do not become a second
architecture layer merely because the concept contains self-contained fixture adapters.

| Concern | Sole current authority | Forbidden parallel authority |
|---|---|---|
| Usage data semantics and view state | `Plans/usage-feature.md` | PM7-local Usage service, provider-management service, or second Usage store |
| Usage/Ledger drill-through | `Plans/Contracts_V0.md` plus `Plans/usage-feature.md`; event-primary callers use `usage_event`/`usage_event_ref`, while a PMConcept7 Ledger attempt row uses `usage_attempt`/`attempt_id`, retains `usage_event_ref` as correlation, and carries no `OpenSubject` | correlation or presentation identity substituted for the selected object id, current PMConcept7 aggregate-card route command, or unregistered object kind |
| Usage/Dashboard widget layout | `Plans/Widget_System.md` plus `Plans/storage-plan.md` namespaces | PM7-local widget store, `dashboard_layout:v1` peer writes, per-frame preview persistence |
| Home shell surface layout | `Plans/home_workspace_layout_v2.schema.json` and `Plans/storage-plan.md` (SP-330); the v1 `Plans/home_workspace_layout.schema.json` is a read-only migration input | Dashboard widget layout inside the Home record (several dashboard tabs are allowed, each board's widget layout in its own `widget_layout:v1:dashboard:<board_id>` namespace, WS-030), concept-only size command/store |
| Command language | `Plans/Commands_System.md` and `Plans/UI_Command_Catalog.md` | PM7 command family, popup/hover commands, duplicate `size_surface` primary command |
| Production wiring | `Plans/Wiring_Matrix.md` and `Plans/Wiring_Matrix.production.json` | concept report or demo event log as production wiring authority |
| Shared Assistant/context | `Plans/assistant-chat-design.md` | second Assistant node, controller, transcript store, context store, or page-local clone |
| UI transaction rules | `Plans/UI_Wiring_Rules.md` | pointer-preview command/event stream or component-local persistence authority |
| Events | existing Event Authority registry and payload owners | fabricated pointer-preview or `context.compaction.*` event family without registry admission |

The PM7 prototype keys and concept events are source-lineage fixtures only. Production adapters must
normalize them into the owner contracts above, and one shared Assistant node must be re-seated rather than
recreated.

Amended 2026-10-09 (DL-180): the Home shell surface layout row now names the v2 Home layout record
(`home_workspace_layout.v2`, SP-330). Its ban stands: no dashboard's widget layout lives in the Home record.
Several dashboard tabs are allowed, each showing one board whose widget layout lives in its own
`widget_layout:v1:dashboard:<board_id>` namespace under WS-030; the Home record holds only the dashboard tab
and its board reference.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Widget_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/assistant-chat-design.md

### DR-039 - PMConcept7 One Usage One Command Language And One Shared Assistant Boundary

```yaml
plan_unit_id: DR-039
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  PMConcept7 is a consumer of one Usage authority, one widget-layout authority per
  canonical host namespace, one Home layout schema, one command language, one production
  wiring matrix, one Event Authority registry, and one shared Assistant node/controller/
  transcript/context store. Concept adapters, keys, logs, and the size_surface token are
  source-lineage or compatibility inputs only. They cannot become peer stores, services,
  commands, events, Assistant clones, or production wiring authorities; preview state and
  current PMConcept7 aggregate provider/account/panel inspectors are local. Event-primary Usage callers cross
  the route-command boundary with usage_event/usage_event_ref; a PMConcept7 Ledger attempt row crosses it with
  usage_attempt/attempt_id, retains usage_event_ref plus provider/account/runtime refs as correlation, and carries
  no OpenSubject. Only settled owner commands cross the command/persistence boundary. Since DL-180 the
  dashboard host has one namespace per board: each dashboard tab shows one board whose widget layout lives in
  widget_layout:v1:dashboard:<board_id> (WS-030), which replaces the single widget_layout:v1:dashboard namespace
  (WS-030 says how the existing layout carries over), and no board's widget layout enters the Home record. The one
  Home layout schema is pm.home_workspace_layout.v2, its record home_workspace_layout.v2 (SP-330); the
  home_workspace_layout.v1 record is a read-only migration input, converted on first read and never reset.
gui_related: true
gui_classification_reason: The DRY boundary prevents visible state divergence across Usage, Home, Dashboard, and the shared Assistant on different pages.
split_recommended: false
depends_on: [DR-037, DR-038, CS-068, UCC-147, WM-045, UIW-012, DL-180]
unblocks: [ACD-448]
acceptance_criteria:
  - Usage semantics, widget layout, Home layout, commands, wiring, events, and Assistant state each name one current owner and no peer PM7 authority; event-primary callers use usage_event/usage_event_ref and a PMConcept7 Ledger attempt row uses usage_attempt/attempt_id with usage_event_ref correlation, while current aggregate inspectors dispatch no command, receipt, or domain event.
  - Production never writes PM7 fixture keys as a peer to widget_layout:v1:usage, widget_layout:v1:dashboard, or home_workspace_layout.v1.
  - Production never writes PM7 fixture keys as a peer to a board's widget_layout:v1:dashboard:<board_id> namespace or to home_workspace_layout.v2, and no dashboard board's widget layout is written into the Home layout record.
  - No primary cmd.workspace_layout.size_surface or PM7 command family is registered.
  - No pointer-preview or unregistered context-compaction event family is admitted.
  - Every page reuses the same Assistant node/controller/transcript/context store and re-seats it instead of cloning it.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: pm7_parallel_owner_or_shared_assistant_clone_drift
reasoning_tier: high
context_scope: pm7_commands_wiring_dry_assistant
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: pm7_ssot_owner_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T41 (source-owned transforms)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local successor audit status; verdict remains report-owned)
preserved_exact_tokens:
  - widget_layout:v1:usage
  - widget_layout:v1:dashboard
  - home_workspace_layout.v1
  - cmd.workspace_layout.size_surface
  - chatPanel
  - chatResizer
  - widget_layout:v1:dashboard:<board_id>
  - home_workspace_layout.v2
negative_constraints:
  - Do not create a second Usage store, widget-layout store, Home layout store, command language, Event Authority, or production wiring matrix.
  - Do not create a second Assistant node, controller, transcript store, context store, or page-local clone.
  - Do not treat concept fixture logs, keys, or events as production authority.
  - Do not attach OpenSubject to either typed cmd.nav.open_usage_subject selector branch, substitute correlation or presentation identity for the selected object_id, or invent a route kind for aggregate Usage cards; pre-existing artifact route/open source realization remains separately owned.
  - Do not store a dashboard board's widget layout inside the Home layout record or share one widget namespace between two boards.
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): one widget namespace per dashboard board (widget_layout:v1:dashboard:<board_id>, WS-030) replaces the single widget_layout:v1:dashboard namespace, and the one Home layout schema is now the v2 record of SP-330 with v1 a read-only migration input."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
```
