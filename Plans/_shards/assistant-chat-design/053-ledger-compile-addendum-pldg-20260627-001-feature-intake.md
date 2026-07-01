# Shard 053: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/assistant-chat-design.md`

Source lines: L22994-L23205

Source SHA256: `91bcd0b171815c2822094085d3e4a9d34e3fdf9c61dbb106a0eae64e9cf296a3`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Assistant Chat owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### ACD-427 - Inline Visualizer V2 Stream And Host Bridge

```yaml
plan_unit_id: ACD-427
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Inline visualizer v2 uses PM-native host-fed streaming: the host detects `visualize(title=…)`,
  `@@@VIZ-START`, and `@@@VIZ-END` envelopes outside tool_calls, reasoning, code_execution, and code fences,
  feeds sanitized progressive fragments to the sandboxed inline visual module over PM-controlled postMessage,
  and renders via safe-cut partial HTML parsing, append-only reconciliation, serialized script execution,
  preservation of script-populated containers, TreeWalker exclusions, marker false-positive avoidance,
  guarded fallback loops, and zero-flicker finalization. Visualizer host calls use the CV-300 bridge registry:
  `copyText` aliases `copyToClipboard(text: string): Promise<boolean>`, `toast` is host-local localized
  visualizer feedback only, `saveState`/`loadState` use PM-managed per-message visual-state, and every call carries
  a typed bridge envelope with bridge_call_id, visualizer_artifact_id, message_id, method, args, and origin_nonce plus
  an `{ ok, value?, error_code?, message?, retryable? }` result. In Rust + Slint builds, iframe/postMessage semantics
  are mapped through the PM-owned isolated webview adapter rather than direct parent DOM or raw storage access.
gui_related: true
gui_classification_reason: Inline visualizer streaming, cards, feedback, and bridge behavior are visible chat UI.
depends_on: [ACD-168, ACD-169, ACD-170, ACD-171, ACD-172, CV-300]
unblocks: [F3-404, SP-221, PS-123, RAP-037, ATS-015]
acceptance_criteria:
  - Visual envelopes route to the inline visual module, not Markdown code fences.
  - Tool calls, reasoning, code_execution, and code fences do not falsely trigger visual capture.
  - Finalization does not flicker, remount chart canvases or SVGs, or replace script-populated containers.
  - Question-flow embedded visuals still omit sendPrompt and cannot bypass PM draft state.
  - Bridge aliases do not create a second private command payload language.
  - Bridge envelopes validate origin/nonce, method schema, artifact identity, and return/error shape through the shared registry.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - inline visualizer stream and bridge fixtures
risk_class: visualizer_stream_bridge_drift
reasoning_tier: high
context_scope: assistant_chat_inline_visualizer_v2
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: inline_visualizer_v2_stream_bridge
  create_worknodes: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-stream-feed
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-incremental-reconciliation
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-bridge-alias-map
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0051
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0056
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0057
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0082
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0088
preserved_exact_tokens:
  - "visualize(title=…)"
  - "@@@VIZ-START"
  - "@@@VIZ-END"
  - "safe-cut"
  - "TreeWalker"
  - "copyText"
  - "toast"
  - "saveState"
  - "loadState"
  - "copyToClipboard(text: string): Promise<boolean>"
  - "bridge_call_id"
  - "visualizer_artifact_id"
  - "origin_nonce"
  - "Rust + Slint"
  - "webview"
negative_constraints:
  - No parent DOM scraping.
  - No allow-same-origin.
  - No raw parent localStorage.
  - No Markdown code fence routing.
  - No tool_calls/reasoning/code_execution marker capture.
  - Do not treat visualizer toast as Slack/Discord/webhook notification delivery.
  - Do not route bridge calls through a second private payload language outside CV-300.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

### ACD-428 - Notification Trust Copy And Remote Action Boundary

```yaml
plan_unit_id: ACD-428
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat and in-app notification copy use the shared notification payload contract for short,
  redacted, projection-qualified copy. Stale `projection_freshness` or degraded `projection_health` is named in
  copy when relevant, external buttons and links open PM routes only, and remote destination dismissal never resolves
  PM blocked episodes or canonical conditions. Slack and Discord broad mention behavior is disabled by default.
gui_related: true
gui_classification_reason: Notification copy, in-app toasts/banners, and route actions are user-visible chat and shell presentation.
depends_on: [CV-298]
unblocks: [F3-405, ATS-016]
acceptance_criteria:
  - Notification copy names stale projection_freshness or degraded projection_health when relevant.
  - External notification actions open PM routes and do not remotely resolve blockers.
  - In-app dismissal, external dismissal, and canonical resolution remain distinct states.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - notification redaction and route-action fixtures
risk_class: notification_trust_copy_leak
reasoning_tier: high
context_scope: assistant_chat_notifications
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: notification_trust_copy_boundary
  create_worknodes: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-payload-redaction-trust-copy
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0062
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0091
preserved_exact_tokens:
  - "Slack"
  - "Discord"
  - "projection_trust"
  - "projection_freshness"
  - "projection_health"
  - "allowed_action_ids"
  - "External buttons/links"
negative_constraints:
  - Never include raw secrets, webhook URLs, tokens, private paths, full prompts, full logs, screenshots, raw diff bodies, or unredacted account identities.
  - External buttons/links must not resolve blockers remotely.
  - Discord/Slack broad mentions are disabled by default.
stale_retired_dispositions:
  - "`projection_trust` is compatibility/source-lineage vocabulary only for notifications; active copy uses `projection_freshness` and `projection_health`."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
```

### ACD-429 - DRY Method What And Why Disclosure

```yaml
plan_unit_id: ACD-429
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat shows compact what/why disclosure when DRY Method materially affects a turn, is disabled,
  is degraded by missing or stale rules, blocks a canonical or implementation-changing mutation, or allows
  exploratory chat with an unresolved-owner caveat. Visible states include DRY applied, DRY degraded,
  DRY disabled, rules missing, rules stale, owner/source route found, owner/source route unresolved,
  mutation blocked, exploratory caveat used, and existing owner reused. Routine turns with no material
  DRY effect may keep details in receipts/provenance only to avoid flooding the chat.
gui_related: true
gui_classification_reason: DRY Method what/why disclosure is visible Assistant Chat state and explanatory copy.
depends_on: [ARC-036, CV-299]
unblocks: [F3-406, ATS-018]
acceptance_criteria:
  - Trust-affecting missing or stale rule-source state is visible, not logs-only.
  - Canonical or implementation-changing mutation blocks explain what happened, why, and the next safe action.
  - Routine no-effect DRY turns do not flood the message stream.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY Method chat disclosure fixtures
risk_class: dry_method_transparency_gap
reasoning_tier: high
context_scope: assistant_chat_dry_method
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: dry_method_chat_disclosure
  create_worknodes: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-chat-what-why
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-003
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0054
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0089
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/decisions.jsonl:dec-0017
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/questions.jsonl:q-0016
preserved_exact_tokens:
  - "using the dry method"
  - "default"
  - "the user can turn it off"
  - "clear to the user what and why those things are happening"
  - "DRY applied"
  - "DRY degraded"
  - "DRY disabled"
negative_constraints:
  - Do not hide trust-affecting DRY state in logs only.
  - Do not create a second visible rules model separate from the runtime Instruction Bundle.
  - Do not flood routine turns when DRY has no material effect.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
```
