# Shard 032: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/Permissions_System.md`

Source lines: L8309-L8452

Source SHA256: `b12f3a9c23ddf5697455b4575a1ae8192c0b81515ae83f1e8622f82618f1fbb9`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Permissions System owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PS-123 - Inline Visualizer Sandbox And Library Allowlist Boundary

```yaml
plan_unit_id: PS-123
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Inline visualizer v2 runs in a sandboxed iframe or equivalent isolation boundary with default library allowlist
  empty. Candidate libraries such as Chart.js, D3, Vega-Lite, ECharts, Plotly, and vis-network require exact
  package/version, bundled asset, SHA-256/SRI, license, security, performance, capability, fallback, upgrade/removal,
  and owner approval before use. Remote CDN loading, cdnjs/jsdelivr/unpkg, dynamic imports, unvetted network access,
  undeclared runtime script injection, `allow-same-origin`, parent document scraping, and raw parent localStorage are
  denied. Rust + Slint builds use the PM-owned isolated webview adapter from CV-300, with postMessage-equivalent
  bridge messages validated for origin_nonce, visualizer_artifact_id, method schema, and permission state before host
  execution. Tone.js and Wavesurfer remain deferred until separately approved.
gui_related: false
gui_classification_reason: Defines execution and permission boundaries for visualizer sandboxing and library approval; GUI rendering is owned elsewhere.
depends_on: [ACD-427, CV-300]
unblocks: [F3-404, ATS-015]
acceptance_criteria:
  - Default visualizer library allowlist is empty.
  - Every allowed library has exact version, bundled asset, hash/SRI, license, security, performance, capability, fallback, upgrade/removal, and owner approval evidence.
  - Native webview adapter bridge calls enforce the same sandbox, origin/nonce, method-schema, and no-parent-access policy as iframe/postMessage calls.
  - Sandboxed visualizers cannot reach parent DOM/localStorage or unvetted network/CDN/import paths.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Inline visualizer sandbox and library-denial fixtures
risk_class: visualizer_sandbox_escape
reasoning_tier: high
context_scope: inline_visualizer_v2_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - future inline visualizer sandbox policy
node_compile_hint:
  mode: inline_visualizer_v2_permission_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-library-allowlist-policy
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0059
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0088
source_atom_ids: [atom-0059, atom-0088]
preserved_exact_tokens:
  - "Chart.js"
  - "D3"
  - "Vega-Lite"
  - "ECharts"
  - "Plotly"
  - "vis-network"
  - "Tone.js"
  - "Wavesurfer"
  - "SHA-256"
  - "SRI"
  - "allow-same-origin"
  - "cdnjs"
  - "jsdelivr"
  - "unpkg"
  - "Rust + Slint"
  - "webview"
  - "origin_nonce"
negative_constraints:
  - No remote CDN loading.
  - No dynamic imports or unvetted network access.
  - No undeclared runtime script injection.
  - No parent document scraping.
  - No raw parent localStorage.
  - Do not approve Tone.js or Wavesurfer through this PlanUnit.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### PS-124 - Notification Destination Secret Custody And Live Send Authority

```yaml
plan_unit_id: PS-124
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Notification destinations that send to Slack, Discord, generic webhook, ntfy, Pushover, Telegram, or other remote
  services require explicit destination enablement and live-send authority. Webhook URLs, bot tokens, push tokens,
  and provider credentials are held only through OS credential references or equivalent secret custody. Receipts,
  screenshots, exports, logs, GUI previews, and test-send labels must not expose raw secrets, webhook URLs, tokens,
  private paths, full prompts, full logs, screenshots, raw diff bodies, or unredacted identities. External notification
  dismissal never resolves PM blocked episodes or canonical conditions.
gui_related: false
gui_classification_reason: Defines credential custody and send authority for notification integrations rather than visual presentation.
depends_on: [CV-298]
unblocks: [SP-222, F3-405, RAP-039, ATS-016]
acceptance_criteria:
  - Live test-send and remote delivery require an enabled destination plus explicit authority.
  - Receipts and UI surfaces store/display secret refs or masked values only.
  - External provider dismissal cannot resolve canonical PM blocker state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Notification secret custody and live-send permission fixtures
risk_class: notification_secret_exfiltration
reasoning_tier: high
context_scope: notifications_sounds_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - future notification credential custody
node_compile_hint:
  mode: notification_secret_custody_live_send_authority
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-payload-redaction-trust-copy
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:preview-test-send-accessibility
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-delivery-validation-no-secret-evidence
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0062
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0068
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0091
source_atom_ids: [atom-0062, atom-0068, atom-0069, atom-0091]
preserved_exact_tokens:
  - "Slack"
  - "Discord"
  - "generic webhook"
  - "ntfy"
  - "Pushover"
  - "Telegram"
  - "webhook URLs"
  - "tokens"
  - "OS credential refs"
  - "raw secrets"
  - "External buttons/links"
negative_constraints:
  - Do not expose raw secrets, webhook URLs, tokens, private paths, full prompts, full logs, screenshots, raw diff bodies, or unredacted account identities.
  - Do not let external dismissal resolve PM blocked episodes or canonical conditions.
  - Do not make live send implicit from preview.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
```
