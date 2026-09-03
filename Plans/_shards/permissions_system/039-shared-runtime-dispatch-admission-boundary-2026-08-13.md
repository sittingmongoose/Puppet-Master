# Shard 039: Shared runtime dispatch-admission boundary (2026-08-13)

Source: `Plans/Permissions_System.md`

Source lines: L9163-L9349

Source SHA256: `c4e6be002bda36285465d8f6281d030c01b4292db3cf057fd9cfa40e9741611a`

---

## Shared runtime dispatch-admission boundary (2026-08-13)

Provider dispatch admission consumes one immutable
`permission_snapshot_record.v1:{project_id}:{snapshot_id}` by reference. It does
not reinterpret, refresh, or replace permission authority. The snapshot must be
materialized, identity-matched to the current operation/attempt, non-corrupt, and
current for the exact route, effective account, topology generation, and mutation
intent before `ProviderDispatchAdmissionService` may issue its ephemeral
`ProviderRequestPermit` / durable `ProviderDispatchAdmissionReceipt` evidence.
The receipt also binds the existing Packet Admission decision, structured
attachment-manifest hash/ref, host-local RuntimeResourceGovernor admission, and
required-present project/thread/Goal/run/node/agent lineage; these refs do not
replace permission authority.

Permission `allow` is necessary but never sufficient. Mutation-capable work must
also supply the independent FileSafe receipt refs for the exact finalized mutation
evidence. Missing, stale, corrupt, mismatched, or unmaterialized permission
evidence rejects dispatch before network transmission. A retry after any policy,
account, target, route, topology, FileSafe, or request-byte change creates a fresh
permission snapshot where required and always creates a fresh dispatch receipt.
Neither receipt may contain raw secrets, credential material, auth values, raw
request bytes, or credential-store paths.

### PS-134 - Shared Runtime Permission Snapshot Admission Join

```yaml
plan_unit_id: PS-134
unit_type: security_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Provider dispatch admission consumes the immutable materialized permission
  snapshot by exact attempt identity and cannot issue or consume a permit when the
  snapshot is missing, corrupt, stale, mismatched, or superseded; permission allow
  remains independently co-bound with FileSafe for mutation-capable work.
gui_related: false
depends_on: [PS-132, PS-133, CV-325, SIR-009]
unblocks: []
acceptance_criteria:
  - Dispatch admission references one exact permission_snapshot_record and never reconstructs it from current Settings or UI state.
  - Every bound policy, account, route, target, topology, or request-byte change invalidates prior admission and triggers fresh evidence as applicable.
  - Permission allow cannot bypass FileSafe, auth, provider readiness, budget, storage mode, or host-local resource admission.
  - Permission and dispatch records contain refs, decisions, and hashes only and reject raw credentials, tokens, auth values, request bytes, and credential paths.
  - Attachment-manifest, Packet Admission, host-local resource admission, and run/node lineage refs are identity-matched before dispatch and cannot authorize permission reuse.
validation_surfaces:
  - future permission-snapshot and provider-dispatch join fixtures
  - future stale/missing/corrupt snapshot negative fixtures
risk_class: stale_permission_dispatch_bypass
reasoning_tier: high
context_scope: shared_runtime_permission_admission
implementation_surfaces: [Plans/Permissions_System.md, Plans/storage_value_registry.json, Plans/shared_runtime_contracts.schema.json]
node_compile_hint: {mode: shared_runtime_permission_join, create_worknodes: false, create_nodeseeds: false}
negative_constraints:
  - Do not treat a provider permit as permission authority.
  - Do not reuse a permission snapshot after its bound authority changes.
owner_hints: [Plans/Permissions_System.md]
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md
  - 'Plans/runtime_integration_disposition.json#items[PRM-012]'
```

### PS-135 - Browser State Minimum Export Boundary

```yaml
plan_unit_id: PS-135
unit_type: security_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Browser profile state, cookies, origin/local/session storage, and authentication headers are non-exportable by
  default and are never wholesale exported. An ordinary Browser subject may export only explicitly allowlisted
  minimum fields under one purpose-bound permission, redaction profile, destination, expiry, and export receipt; a
  state-class, origin, profile, or wildcard grant is insufficient. Raw Set-Cookie/Cookie/Authorization/
  Proxy-Authorization values, bearer tokens, credential-store material, and complete cookie jars, profile bundles,
  or storage databases remain absent from exports, receipts, artifacts, logs, model context, and normal display.
  Protected AuthBrowserSession is structurally ineligible for export, capture, recording, inspection, automation,
  or inference.
gui_related: true
gui_classification_reason: Export availability, denial, redaction, purpose, and receipt state are user-visible.
depends_on: [PS-075, PS-106, PS-108, SMPFS-143]
unblocks: []
acceptance_criteria:
  - SEC-003 covers cookies, storage, and auth headers under `minimum_allowlisted_fields_only` with wholesale export forbidden.
  - Every allowed field is field-by-field allowlisted, purpose/destination/expiry bound, redacted before persistence/display/export, and receipted without raw secret bytes; default export posture is off.
  - Protected AuthBrowserSession remains structurally non-exportable even with user permission or an ordinary Browser receipt.
  - A positive fixture may export only an explicitly permitted redacted minimum ordinary-Browser field and proves the receipt contains identity, decision, field-name/hash, purpose, destination, expiry, and omission refs without the original secret value.
  - Negative secret-exfiltration fixtures reject a complete cookie jar/profile/storage database, any raw Cookie/Set-Cookie/Authorization/Proxy-Authorization or bearer-token value, wildcard/state-class/origin-wide export, receipt/log/artifact/model-context secret echo, unredacted persistence/display, and every protected-auth subject.
  - Static fixtures do not prove secret isolation, redaction effectiveness, Browser process isolation, or attack resistance.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, focused Egolite remediation validator, future ordinary-browser field-allowlist and secret-exfiltration matrix]
risk_class: wholesale_browser_state_or_auth_export
reasoning_tier: high
context_scope: browser_state_export_security
implementation_surfaces: [Plans/Permissions_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, future Browser export service]
node_compile_hint: {mode: permission_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:SEC-003]
preserved_exact_tokens: [cookies, storage, auth headers, not wholesale exported, AuthBrowserSession]
negative_constraints:
  - Do not export protected-auth state under any ordinary capability or permission.
  - Do not persist raw Cookie, Set-Cookie, Authorization, Proxy-Authorization, token, or credential values.
  - Do not treat a wildcard, origin, profile, or whole state class as a minimum-field allowlist.
owner_hints: [Plans/Permissions_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/FileSafe.md]
```

### PS-136 - Public Ingress PM API Only

```yaml
plan_unit_id: PS-136
unit_type: security_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Explicit public ingress exposes only endpoints registered as PM API endpoints: the Puppet Master HTTPS/API/
  WebSocket surfaces in the `pm_api` class. Public exposure is off by default and each request is authenticated,
  rate-gated, generation-fenced, body-bounded, and policy-admitted before domain hydration or mutation. Internal
  automation/control sockets, credential/broker/SSH IPC, CEF/CDP/browser-debug endpoints, terminal/PTY and
  container-engine sockets, device bridges, recorder ports, local-daemon control planes, and plugin/MCP private
  transports are never public ingress; they are not reverse-proxy targets and cannot be made public by TLS, Funnel,
  proxy, route, or WebSocket reachability alone.
gui_related: false
gui_classification_reason: Public endpoint classification and pre-hydration network admission are transport/security contracts rather than GUI presentation.
depends_on: [PS-075, SIR-016]
unblocks: []
acceptance_criteria:
  - SEC-007 accepts public endpoint_class=pm_api only; every internal/control/debug/broker socket class fails closed.
  - Authentication and rate decisions are mandatory before expensive hydration, body processing, Browser creation, model dispatch, or mutation.
  - A positive ingress fixture admits only an explicitly exposed, generation-current pm_api route with successful authentication, rate, body-bound, and policy decisions; HTTPS or WebSocket transport alone does not classify an endpoint as pm_api.
  - Negative port/proxy fixtures reject every internal automation/control, credential/broker/SSH, CEF/CDP/debug, terminal/PTY, container-engine, device-bridge, recorder, local-daemon, plugin, and MCP endpoint class, including when a Funnel/reverse-proxy/TLS route can reach it.
  - Missing/failed authentication, rate, generation, body-bound, endpoint-registration, or policy evidence denies before Project/Vault/provider/plugin hydration, Browser creation, model dispatch, expensive routing, or durable mutation.
  - Proxy or route configuration cannot widen endpoint class, auth scope, permission, or generation.
  - Static fixtures do not prove port exposure, firewall behavior, proxy configuration, authentication, rate limiting, or attack resistance.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, focused Egolite remediation validator, future endpoint-class census and live bind/port/Funnel/reverse-proxy negative matrix]
risk_class: internal_control_plane_public_exposure
reasoning_tier: high
context_scope: public_ingress_endpoint_class
implementation_surfaces: [Plans/Permissions_System.md, Plans/Shared_Integration_Runtime.md, future Server/Remote Access ingress]
node_compile_hint: {mode: permission_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:SEC-007]
preserved_exact_tokens: [Public ingress exposes PM API only, internal automation/control sockets, credential and broker sockets, browser debug]
negative_constraints:
  - Do not expose internal control, credential/broker/SSH, Browser debug/CDP, PTY, container-engine, device-bridge, recorder, plugin, MCP, or local-daemon sockets publicly.
  - Do not treat TLS or route reachability as authentication or endpoint admission.
owner_hints: [Plans/Permissions_System.md, Plans/Shared_Integration_Runtime.md]
```

### PS-137 - Actual Network Effect Authorization

```yaml
plan_unit_id: PS-137
unit_type: security_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  The effective WebEgressPolicy is enforced on each actual outbound request and at every actual navigation,
  redirect, WebSocket handshake/reconnect, form submission, upload, download initiation/follow-up, and low-level
  browser network effect.
  The permit binds normalized destination, current DNS/IP result, method, headers class, body class/hash, effect kind,
  redirect hop, proxy/trust policy, permission snapshot, policy generation, and expiry; dynamic assembly, DNS result,
  destination, or effect changes require fresh authorization at the effect boundary. Uploads and downloads additionally
  require the applicable FileSafe staging/destination and transfer admission. URL literal/source scanning is lint
  evidence only and can never authorize or replace actual-effect gates.
gui_related: false
gui_classification_reason: Egress interception, permit binding, DNS/redirect rechecks, and FileSafe joins are network/security contracts rather than GUI presentation.
depends_on: [PS-081, PS-128]
unblocks: []
acceptance_criteria:
  - SEC-008 covers actual navigation, request, redirect, WebSocket, form submission, upload, download, and low-level network effects with effective WebEgressPolicy authorization immediately before the effect.
  - Redirect, dynamic URL, DNS/destination, and connection changes re-run SSRF/private-host/link-local/localhost/file/internal-metadata, permission, proxy/trust, and effective WebEgressPolicy checks against the current resolved address.
  - WebSocket reconnect and navigation/form/upload/download follow-ups cannot reuse a permit whose destination, DNS result, method, headers class, body class/hash, effect kind, redirect hop, permission snapshot, policy generation, proxy/trust state, or expiry changed.
  - Uploads and downloads require independent FileSafe admission before source bytes leave staging or response bytes reach a destination.
  - A positive effect matrix proves every admitted effect carries a current permit whose bound fields match the actual effect and that a permitted same-origin request does not authorize a changed redirect/reconnect/follow-up implicitly.
  - Negative dynamic-network fixtures reject source-literal-only approval, dynamically assembled disallowed URLs, redirect-to-private/link-local/localhost/metadata targets, DNS rebinding, mismatched method/header/body/effect kind, stale permission/policy generation, WebSocket reconnect reuse, form/upload/download follow-up reuse, and missing FileSafe transfer admission.
  - Static fixtures do not prove network interception, DNS behavior, WebSocket/form/download enforcement, FileSafe execution, or attack resistance.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, Plans/web_policy_negative_fixtures.json, focused Egolite remediation validator, future actual-navigation/request/redirect/DNS/WebSocket/form/upload/download/low-level effect matrix]
risk_class: url_scan_substitutes_for_actual_egress_enforcement
reasoning_tier: high
context_scope: actual_network_effect_authorization
implementation_surfaces: [Plans/Permissions_System.md, future WebOperation and Browser transport gates, Plans/FileSafe.md]
node_compile_hint: {mode: permission_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:SEC-008]
preserved_exact_tokens: [WebEgressPolicy, actual navigations, requests, redirects, WebSockets, forms, uploads, downloads, low-level effects, not URL-source scanning]
negative_constraints:
  - Do not authorize network effects from source-code or URL-literal scanning.
  - Do not reuse an egress permit across a changed destination, DNS result, method, body, headers class, effect kind, redirect hop, permission, proxy/trust state, expiry, or policy generation.
  - Do not let a Browser page, adapter, form, script, WebSocket, upload, download, or low-level path bypass the same effective WebEgressPolicy boundary.
owner_hints: [Plans/Permissions_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/FileSafe.md]
```
