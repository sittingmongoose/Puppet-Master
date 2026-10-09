# Shard 023: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/Wiring_Matrix.md`

Source lines: L3330-L3396

Source SHA256: `b2fd211658773af1cc2194754ae343af548eb4d787daa0c517312b453b725b6d`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum constrains generated wiring validation for Usage route/open commands. It creates no generated wiring JSON, WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, production build tasks, final manifests, or PNC-019 receipts.

### WM-043 - Usage Route Wiring Alias And Correlation Gate

```yaml
plan_unit_id: WM-043
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Production wiring for Usage route/open commands consumes UI_Command_Catalog alias metadata. `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, and `cmd.chat.close_thread_usage` are retired compatibility aliases and must not appear as canonical production UICommand rows. Typed selector proof is caller-aware: the pre-existing `cmd.artifacts.show_in_usage` and `cmd.artifacts.show_in_ledger` rows remain event-primary with usage_event/usage_event_ref and retain their artifact route/open OpenSubject bridge; event-primary `cmd.nav.open_usage_subject` uses the same event selector without OpenSubject; and a PMConcept7 Ledger attempt row uses `cmd.nav.open_usage_subject` with usage_attempt/attempt_id, retains usage_event_ref as correlation, and carries no OpenSubject. Wiring evidence must prove route_open effect_kind, the command-appropriate selector/OpenSubject disposition, and correlation passthrough for UsageRecord/provider/runtime fields. Current PMConcept7 aggregate provider/account/panel cards are local inspectors with no command, receipt, or event. On the redesigned Usage Accounts room (2026-10-09) the account card body and Details stay local inspectors; the card's Use this account and each provider plate's Auto-switch toggle and switch level are owner-routed actions, not route/open commands, wired through the existing `catalog.account_select_profile`, `catalog.settings_transaction_preview` and `catalog.settings_transaction_apply` rows, whose `ui_location` names the Usage Accounts room (UCC-147, `Plans/Settings_System.md#SSYS-044`), so they never satisfy or weaken this unit's route/open selector proof.
gui_related: true
gui_classification_reason: Wiring determines whether visible Usage navigation controls dispatch canonical commands.
depends_on: [WM-034, WM-042, UCC-109, CV-316]
unblocks: []
acceptance_criteria:
  - validate-wiring-matrix fails if production wiring registers `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, or `cmd.chat.close_thread_usage` as canonical command rows instead of compatibility aliases or exclusions.
  - Usage route/open wiring entries declare effect_kind route_open or mixed with route_open detail, not generic receipt-only success; event-primary dispatch proves usage_event/usage_event_ref, while a PMConcept7 Ledger attempt dispatch proves usage_attempt/attempt_id plus usage_event_ref correlation. The two cmd.nav.open_usage_subject selector branches carry no OpenSubject; the two pre-existing artifact rows retain their artifact OpenSubject bridge and remain event-primary; all preserve applicable provider/account/runtime refs.
  - Wiring fixtures prove Usage correlation refs survive dispatch and route restoration without being replaced by timestamp/run/thread/tier filters, while current PMConcept7 aggregate provider/account/panel cards remain local inspectors with no command, receipt, event, route object id, or invented route kind.
  - The Usage Accounts room's Use this account and each provider's Auto-switch toggle and switch level appear only on their existing account-select and Settings-transaction rows, with Usage Accounts locations, and never as route/open rows; the account card body and Details still dispatch nothing.
  - Wiring evidence distinguishes thread Context Detail Pane commands from app-wide Usage route/open commands.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
  - future Usage route wiring fixture suite
risk_class: usage_wiring_alias_false_certification
reasoning_tier: high
context_scope: usage_route_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: usage_route_wiring_alias_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Wiring_Matrix.md:2705-2784"
  - "Plans/Wiring_Matrix.md:3325-3390"
  - "Plans/Wiring_Matrix.production.json:42762"
  - "Plans/Wiring_Matrix.production.json:3664"
  - "Plans/Wiring_Matrix.production.json:4819"
  - "Plans/Wiring_Matrix.production.json:16493"
  - "Plans/UI_Command_Catalog.md:798-799"
preserved_exact_tokens:
  - cmd.chat.open_thread_usage
  - cmd.chat.focus_thread_usage
  - cmd.chat.close_thread_usage
  - cmd.nav.open_usage_subject
  - cmd.artifacts.show_in_usage
  - cmd.artifacts.show_in_ledger
  - route_open
  - route_target.object_kind = usage_event
  - correlation_passthrough
negative_constraints:
  - Do not certify retired chat usage IDs as live production UICommands.
  - Do not let generic family-root exclusions hide concrete stale command rows.
  - Do not accept receipt-only wiring for a command whose effect is route/open navigation.
  - Do not route without the stable selector required by the chosen branch, attach OpenSubject to either cmd.nav.open_usage_subject selector branch, remove the pre-existing artifact OpenSubject bridge without a separately owned migration, substitute correlation identity for the selected object_id, or invent an aggregate-card route kind.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
```
