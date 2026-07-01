# Shard 014: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/Automated_Testing_System.md`

Source lines: L1141-L1445

Source SHA256: `3992d46f90d1fd714f9632c7819ba32f357f4ce31ff8e0a2eaf5fa2113656e13`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Automated Testing owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### ATS-015 - Inline Visualizer V2 Acceptance Tests

```yaml
plan_unit_id: ATS-015
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Inline visualizer v2 acceptance tests cover marker parsing for `visualize(title=...)`, `@@@VIZ-START`, and
  `@@@VIZ-END`; false-positive exclusion for tool_calls, reasoning, code_execution, Markdown code fences, and
  marker-like literal content; progressive render and zero-flicker finalization; serialized script execution;
  CV-300 bridge envelopes, return/error shapes, origin_nonce validation, bridge aliases `copyText`, `toast`,
  `saveState`, and `loadState`; question-flow omission of sendPrompt; Rust + Slint webview adapter mapping; sandbox
  denial for allow-same-origin, parent.document, parent localStorage, CDN, dynamic import, and unvetted network;
  PM visual token/accessibility states; pinned library allowlist behavior; reload/export; no secret leak; and
  localized feedback with audio off by default.
gui_related: true
gui_classification_reason: Validates visible inline visualizer rendering, feedback, accessibility, and degraded states.
depends_on: [ACD-427, CV-300, F3-404, SP-221, PS-123, RAP-037]
unblocks: []
acceptance_criteria:
  - Tests prove visual markers do not route from tool/reasoning/code execution or code-fence content.
  - Tests prove finalization avoids flicker/remount and preserves script-populated containers.
  - Tests prove bridge envelope origin/nonce, method schema, return/error, save/load quota, and native webview adapter mapping behavior.
  - Tests prove sandbox/network/library denials produce visible fallback states without leaks.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future inline visualizer v2 fixture suite
risk_class: inline_visualizer_validation_gap
reasoning_tier: high
context_scope: inline_visualizer_v2_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future inline visualizer tests
node_compile_hint:
  mode: inline_visualizer_v2_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-automated-tests
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0088
source_atom_ids: [atom-0088]
preserved_exact_tokens:
  - "visualize(title=...)"
  - "@@@VIZ-START"
  - "@@@VIZ-END"
  - "tool_calls"
  - "reasoning"
  - "code_execution"
  - "copyText"
  - "toast"
  - "saveState"
  - "loadState"
  - "bridge_call_id"
  - "origin_nonce"
  - "Rust + Slint"
  - "webview"
  - "allow-same-origin"
  - "parent.document"
  - "parent localStorage"
negative_constraints:
  - Do not call inline visualizer v2 implementation-ready without sandbox, stream, bridge, fallback, reload, export, and no-leak tests.
  - Do not treat a happy-path static HTML render as sufficient visualizer coverage.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Permissions_System.md
```

### ATS-016 - Notification Sound Delivery Acceptance Tests

```yaml
plan_unit_id: ATS-016
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Notification and sound acceptance tests cover Settings > General > Notifications & Sounds rendering, destination
  CRUD/toggle/test, Slack, Discord, generic webhook, ntfy, Pushover, Telegram mocks, payload redaction, missing auth,
  provider error, 408/429/5xx/network retry behavior, malformed/revoked/missing/forbidden permanent failures, rate-limit
  mocks, idempotency, mention-policy denial, provider-specific profile validation, success receipt mocks, no-secret
  logs/receipts/exports, built-in sound catalog source/license/default-mapping checks, custom sound upload validation,
  sound preview local-only, explicit live test-send gating, PeonPing/OpenPeon import compatibility mapping, unknown
  manifest review, unsupported format rejection, and accessibility where sound is not the only carrier.
gui_related: true
gui_classification_reason: Validates visible settings, sound controls, preview/test-send, and notification copy behavior.
depends_on: [ACD-428, CV-298, F3-405, SP-222, PS-124, RAP-039, UCC-103, WM-039]
unblocks: []
acceptance_criteria:
  - Automated delivery tests use mocks by default; live sends require explicit user action and enabled destination.
  - Provider-specific Slack, Discord, generic webhook, ntfy, Pushover, and Telegram profile fields are validated through fixtures.
  - Built-in normal notification sound fixtures prove source/license/version/hash/default mapping metadata is present.
  - Secret material never appears in logs, receipts, screenshots, exports, or GUI previews.
  - Sound upload and imported pack tests enforce format, size, duration, path, decode, license, and compatibility boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future notification and sound delivery fixture suite
risk_class: notification_validation_gap
reasoning_tier: high
context_scope: notifications_sounds_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future notification and sound tests
node_compile_hint:
  mode: notifications_sounds_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-delivery-validation-no-secret-evidence
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:preview-test-send-accessibility
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0070
source_atom_ids: [atom-0069, atom-0070]
preserved_exact_tokens:
  - "Slack"
  - "Discord"
  - "generic webhook"
  - "ntfy"
  - "Pushover"
  - "Telegram"
  - "408"
  - "429"
  - "5xx"
  - "PeonPing"
  - "OpenPeon"
  - "test-send"
  - "preview local only"
  - "event_category"
  - "idempotency"
  - "source/license"
negative_constraints:
  - Do not use live external sends in automated tests unless explicitly enabled by user action.
  - Do not allow sound-only notification assertions for critical states.
  - Do not accept secret-bearing logs, receipts, screenshots, or exports as passing evidence.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
```

### ATS-017 - Compact Now And Manual Compaction Acceptance Tests

```yaml
plan_unit_id: ATS-017
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Compaction acceptance tests cover the chat context circle hover display for Usage, Tokens, Cost, and More Details;
  click reveal/selection of Compact Now before dispatch to `cmd.chat.compact_context`; `/compact` parity;
  context.compaction.started, context.compaction.completed, and context.compaction.failed or equivalent visible
  failure/degraded state; command-result statuses for already_running, cancelled, no_op, degraded, unavailable,
  retry_scheduled, completed, and failed; Prompt Pipeline
  compaction_immune handling; storage lineage proving manual Compact Now alone does not create new cache lineage; and
  stale Plans/newfeatures.md references remaining source-lineage only.
gui_related: true
gui_classification_reason: Validates visible chat context circle, Compact Now click, slash command behavior, and failure feedback.
depends_on: [ACD-177, ACD-414, F3-132, UF-011, UCC-060, WM-019, PP-016, PP-017, PP-019, PP-020, PP-025, SP-119]
unblocks: []
acceptance_criteria:
  - Compact Now click in the chat context circle is covered by GUI tests, not assumed from slash command support.
  - Tests prove context-circle click does not dispatch until the user chooses Compact Now.
  - Tests cover already_running, cancelled, no_op, degraded, unavailable, retry_scheduled, completed, and failed result states.
  - Failure/degraded compaction produces a visible user-facing state and event contract.
  - Manual Compact Now does not create a new cache lineage unless logical run lineage changes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Compact Now manual compaction fixture suite
risk_class: compaction_manual_entrypoint_validation_gap
reasoning_tier: high
context_scope: manual_compaction_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future chat context circle tests
node_compile_hint:
  mode: compact_now_manual_compaction_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-automated-testing-acceptance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-owner-cleanup-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0071
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0072
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0090
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0094
source_atom_ids: [atom-0053, atom-0071, atom-0072, atom-0081, atom-0090, atom-0094]
decision_refs: [dec-0015]
preserved_exact_tokens:
  - "Usage"
  - "Tokens"
  - "Cost"
  - "More Details"
  - "Compact Now"
  - "cmd.chat.compact_context"
  - "/compact"
  - "context.compaction.started"
  - "context.compaction.completed"
  - "context.compaction.failed"
  - "already_running"
  - "cancelled"
  - "no_op"
  - "retry_scheduled"
  - "compaction_immune"
  - "Plans/newfeatures.md"
negative_constraints:
  - Do not call compaction implementation-ready without testing the chat context circle Compact Now click.
  - Do not dispatch compaction from hover alone.
  - Do not revive Plans/newfeatures.md as a live owner for compaction.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
```

### ATS-018 - DRY Method Route Toggle Receipt And Visibility Tests

```yaml
plan_unit_id: ATS-018
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  DRY Method acceptance tests cover default enabled behavior, user disabled_by_user toggle behavior, shared Instruction
  Bundle routing for Assistant, Interview, Orchestrator, delegated child-run, document-builder, and code-generation
  prompt routes, absence of shadow prompt-builder-local DRY prose, receipt fields and hashes, missing/stale rules
  visibility, exploratory caveat on unresolved owner/source routes, block/ask/open-item behavior for canonical or
  implementation-changing mutation, Settings command and wiring coverage for
  `cmd.settings.agent_rules.dry_method_default_guard.set`, exact user help copy, stale Orchestrator-local DRY prose
  retargeting, and no bypass of explicit user instructions, safety, secrets, source authority, governance, permissions,
  or source-control hygiene when DRY is off.
gui_related: true
gui_classification_reason: Validates user-visible DRY setting and disclosure states along with receipt and route behavior.
depends_on: [ACD-429, ARC-036, PP-057, DR-036, DP-063, CV-299, F3-406, SP-223, RAP-038, UCC-104, WM-040, OSI-430, ISI-019]
unblocks: []
acceptance_criteria:
  - DRY is default-on and user-disableable without weakening non-DRY authority boundaries.
  - The Settings command and wiring fixture proves the toggle writes only enabled or disabled_by_user and displays the exact explanatory copy.
  - All prompt routes consume one shared Instruction Bundle route.
  - Missing/stale/unresolved owner-source states are visible and policy-correct.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future DRY Method route/static/integration test suite
risk_class: dry_method_validation_gap
reasoning_tier: high
context_scope: dry_method_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future DRY Method tests
node_compile_hint:
  mode: dry_method_route_toggle_receipt_visibility_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-app-default
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-prompt-route-static-conformance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-fallback-disabled-boundary
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-stale-owner-retarget
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-006
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0054
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0076
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0077
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0089
source_atom_ids: [atom-0054, atom-0073, atom-0074, atom-0075, atom-0076, atom-0077, atom-0083, atom-0089]
decision_refs: [dec-0016, dec-0017]
preserved_exact_tokens:
  - "enabled"
  - "disabled_by_user"
  - "Instruction Bundle"
  - "Assistant"
  - "Interview"
  - "Orchestrator"
  - "delegated child-run"
  - "document-builder"
  - "code-generation"
  - "shadow instruction sources"
  - "dry_method_effective_state"
  - "exploratory caveat"
  - "mutation blocked"
  - "cmd.settings.agent_rules.dry_method_default_guard.set"
  - "DRY Method is on by default. Turning it off disables only PM's default reuse-first guard; project/user instructions, safety, secrets, source authority, governance, permissions, and source-control rules still apply."
negative_constraints:
  - Do not make DRY opt-in by default.
  - Do not duplicate DRY prose into prompt builders.
  - Do not treat disabled DRY as permission to bypass explicit instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/agent-rules-context.md
  - Plans/Prompt_Pipeline.md
  - Plans/DRY_Rules.md
```
