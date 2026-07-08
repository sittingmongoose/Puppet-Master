# Shard 031: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/Contracts_V0.md`

Source lines: L18723-L18973

Source SHA256: `4ba6e6824049cf7d730459e43feba01ba802800f526dca6d1d8aa946b51caad3`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Contracts owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### CV-298 - Notification Delivery Envelope Destination Receipt And Predicate Contract

```yaml
plan_unit_id: CV-298
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Notification delivery uses shared `pm.notification_delivery.v1` envelopes for Slack, Discord, generic webhook,
  ntfy, Pushover, Telegram, in-app toast/banner, system/tray, and sound destinations. Payload fields include
  `delivery_attempt_id`, `source_event_ref`, `attention_key`, `root_cause_key`, `project_ref`, `severity`,
  `event_family`, `event_category`, `title`, `body`, `owner_route`, `projection_freshness`,
  `projection_health`, `redaction_profile_ref`, `source_refs`, `allowed_action_ids`, and `idempotency_key`, with raw
  secrets, webhook URLs, tokens, private paths, full prompts, full logs, screenshots, raw diff bodies, and unredacted
  identities excluded. Destination profiles are provider-typed: Slack records credential_ref, channel_ref,
  mrkdwn_mode, mention_policy, and rate_limit_profile; Discord records webhook_credential_ref, thread_id,
  username/avatar override policy, allowed_mentions, and rate_limit_profile; generic webhook records
  url_credential_ref, method, static_header_refs, body_template_ref, timeout, and success_predicate; ntfy records
  server_ref, topic_ref, credential_ref, priority, tags, click_action_policy, and rate_limit_profile; Pushover records
  app_token_ref, user_key_ref, device, priority, sound, and retry/expire policy; Telegram records bot_token_ref,
  chat_id_ref, message_thread_id, parse_mode, disable_notification, and rate_limit_profile. Delivery receipts record
  provider kind, destination id, event id, event category, status class, HTTP status, provider request/message id when
  available, retry count, next retry time, redaction profile, request digest, response digest, idempotency key, and secret
  refs only. Generic webhook success predicates are bounded to default 2xx plus at most five atoms from
  status_class_is, status_code_equals, header_exists, header_equals_literal, json_pointer_exists, and
  json_pointer_equals_literal.
gui_related: false
gui_classification_reason: Defines shared notification payload, destination, receipt, retry, and predicate data contracts; GUI renders them elsewhere.
depends_on: []
unblocks: [ACD-428, SP-222, PS-124, F3-405, UCC-103, RAP-039, WM-039, ATS-016]
acceptance_criteria:
  - Delivery envelopes and receipts exclude raw secret material and preserve redaction/profile evidence.
  - Provider-specific destination profiles are canonical for Slack, Discord, generic webhook, ntfy, Pushover, and Telegram.
  - Event families and categories distinguish run_blocked, approval_required, human_input_requested, run_failed, run_completed, goal_blocked, provider_attention, system_error, security_attention, quiet_digest, and test_send routing.
  - Retry class is transient for 408, 429, 5xx, and network failures; malformed, revoked, missing, forbidden, or capability-disabled cases are permanent failures.
  - Idempotency keys, rate-limit profiles, mention policies, and provider success predicates are stored or derived without exposing secret material.
  - Generic webhook predicates cannot execute scripts, shell, arbitrary JS, regex-catastrophic expressions, dynamic imports, loops, network calls, or provider snippets.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - notification delivery contract fixtures
risk_class: notification_contract_secret_or_retry_drift
reasoning_tier: high
context_scope: notification_delivery_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - future notification delivery records
node_compile_hint:
  mode: notification_delivery_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-destination-record-schema
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-payload-redaction-trust-copy
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-retry-rate-receipt-contract
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0061
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0062
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0063
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0084
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0091
source_atom_ids: [atom-0061, atom-0062, atom-0063, atom-0084, atom-0091]
decision_refs: [dec-0009, dec-0010, dec-0011, dec-0012, dec-0013]
preserved_exact_tokens:
  - "pm.notification_delivery.v1"
  - "Slack"
  - "Discord"
  - "generic webhook"
  - "ntfy"
  - "Pushover"
  - "Telegram"
  - "delivery_attempt_id"
  - "source_event_ref"
  - "attention_key"
  - "root_cause_key"
  - "event_family"
  - "event_category"
  - "projection_freshness"
  - "projection_health"
  - "projection_trust"
  - "allowed_action_ids"
  - "idempotency_key"
  - "credential_ref"
  - "webhook_credential_ref"
  - "url_credential_ref"
  - "bot_token_ref"
  - "app_token_ref"
  - "user_key_ref"
  - "NotificationDeliveryAttemptReceipt"
  - "status_class_is"
  - "json_pointer_equals_literal"
negative_constraints:
  - Do not include raw secrets, webhook URLs, tokens, private paths, full prompts, full logs, screenshots, raw diff bodies, or unredacted identities in payloads or receipts.
  - Do not let external notification dismissal resolve PM blocked episodes or canonical conditions.
  - Do not allow arbitrary JS, shell, provider snippets, loops, network calls, dynamic imports, or catastrophic regex in generic webhook predicates.
  - Do not enable Slack or Discord broad mentions by default.
stale_retired_dispositions:
  - "`projection_trust` is preserved as compatibility/source-lineage vocabulary only; active notification payloads split it into `projection_freshness` and `projection_health`."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```

### CV-299 - DRY Provenance And Effective State Contract

```yaml
plan_unit_id: CV-299
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  DRY Method provenance uses `dry_method_effective_state` values applied, not_material, degraded_rules_missing,
  degraded_rules_stale, disabled_by_user, blocked_owner_unresolved, and caveated_owner_unresolved. Receipts carry
  `dry_method_reason`, `dry_method_source_refs`, `instruction_bundle_ref`, `rules_application_sha256`, and
  `rules_project_sha256`. Run-start minimum fields include `instruction_bundle_ref`, `rules_application_sha256`,
  `rules_project_sha256`, `dry_method_effective_state`, and `dry_method_reason`, so prompt routes and visible
  disclosures can prove whether DRY applied, degraded, was disabled, blocked a mutation, or proceeded with an
  exploratory caveat.
gui_related: false
gui_classification_reason: Defines shared DRY receipt and provenance data contracts; visible labels are owned by GUI and Assistant Chat.
depends_on: [ARC-036]
unblocks: [ACD-429, F3-406, SP-223, RAP-038, ATS-018]
acceptance_criteria:
  - Effective-state enum values are stable and shared across Assistant, Interview, Orchestrator, delegated child-run, document-builder, and code-generation routes.
  - Receipt fields preserve enough provenance to explain what happened and why.
  - Disabled DRY state cannot be confused with safety, secrets, governance, permission, source-authority, or source-control bypass.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY Method contract fixtures
risk_class: dry_method_contract_drift
reasoning_tier: high
context_scope: dry_method_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - future run receipts
node_compile_hint:
  mode: dry_method_provenance_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-rules-provenance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-002
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
source_atom_ids: [atom-0075, atom-0083]
decision_refs: [dec-0016]
preserved_exact_tokens:
  - "dry_method_effective_state"
  - "applied"
  - "not_material"
  - "degraded_rules_missing"
  - "degraded_rules_stale"
  - "disabled_by_user"
  - "blocked_owner_unresolved"
  - "caveated_owner_unresolved"
  - "dry_method_reason"
  - "dry_method_source_refs"
  - "instruction_bundle_ref"
  - "rules_application_sha256"
  - "rules_project_sha256"
negative_constraints:
  - Do not create route-local DRY state enums that diverge from this contract.
  - Do not treat disabled DRY as permission to bypass explicit instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/agent-rules-context.md
  - Plans/Prompt_Pipeline.md
  - Plans/DRY_Rules.md
```

### CV-300 - Inline Visualizer Bridge Registry And Native Host Boundary

```yaml
plan_unit_id: CV-300
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Inline visualizer host APIs use one typed PM bridge registry rather than a private per-visualizer command
  language. Canonical method ids are `sendPrompt`, `openLink`, `copyToClipboard`, `requestResize`, `toast`,
  `saveState`, and `loadState`; `copyText` is a compatibility alias for `copyToClipboard(text)`, and question-flow
  embedded visual modules omit `sendPrompt`. Every bridge call uses an envelope with `bridge_call_id`,
  `visualizer_artifact_id`, `project_id`, `thread_id`, `message_id`, `method`, `args`, `origin_nonce`, and
  `created_at_utc`; the host returns `{ ok, value?, error_code?, message?, retryable? }` after validating artifact
  identity, origin/nonce, schema, permission, sandbox state, and method availability. The Rust + Slint host uses a
  PM-owned isolated webview adapter that maps iframe/postMessage semantics onto a native message bridge with equivalent
  sandbox guarantees: no `allow-same-origin`, forms, popups, top navigation, parent DOM access, raw parent localStorage,
  remote CDN loading, dynamic import, or unvetted network access. `saveState` and `loadState` use PM-managed visual
  state under `visualizer_state.v1:{project_id}:{thread_id}:{message_id}:{visualizer_artifact_id}` with quota,
  JSON-serializable values, reload replay, export, and purge boundaries.
gui_related: false
gui_classification_reason: Defines shared bridge and native host adapter contracts; visible rendering is owned by GUI and Assistant Chat.
depends_on: []
unblocks: [ACD-427, F3-381, F3-404, SP-221, PS-123, RAP-037, ATS-015]
acceptance_criteria:
  - Bridge methods, aliases, envelope fields, return shape, and error shape are typed and shared across host consumers.
  - Native Rust + Slint builds map postMessage-style calls through an isolated webview adapter with equivalent sandbox denial semantics.
  - saveState/loadState are scoped to PM-managed visualizer state with explicit namespace, quota, reload, export, and purge behavior.
  - Question-flow embedded visuals cannot obtain sendPrompt or bypass PM draft state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - inline visualizer bridge registry and native host adapter fixtures
risk_class: visualizer_bridge_registry_or_native_host_drift
reasoning_tier: high
context_scope: inline_visualizer_v2_bridge_contract
implementation_surfaces:
  - Plans/Contracts_V0.md
  - future inline visualizer bridge registry
node_compile_hint:
  mode: inline_visualizer_bridge_registry_native_host_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-bridge-alias-map
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-persistence-reload-security
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0057
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0060
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0088
source_atom_ids: [atom-0057, atom-0060, atom-0088]
preserved_exact_tokens:
  - "sendPrompt"
  - "openLink"
  - "copyToClipboard"
  - "requestResize"
  - "copyText"
  - "toast"
  - "saveState"
  - "loadState"
  - "bridge_call_id"
  - "origin_nonce"
  - "Rust + Slint"
  - "webview"
  - "iframe"
  - "postMessage"
  - "visualizer_state.v1:{project_id}:{thread_id}:{message_id}:{visualizer_artifact_id}"
negative_constraints:
  - Do not create a second private command payload language for visualizer host calls.
  - Do not expose parent DOM, raw parent localStorage, same-origin escalation, remote CDN loading, dynamic imports, or unvetted network access.
  - Do not persist runtime heap as visualizer state.
  - Do not let question-flow visuals bypass PM draft state by calling sendPrompt.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```
