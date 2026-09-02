# Remote Access System

> **Compliance:** This document follows `Plans/DRY_Rules.md`, uses the PlanUnit contract in `Plans/Plan_Document_System.md`, consumes retained owner contracts by reference, and names Puppet Master only.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for Puppet Master remote-route identity and policy, route preference and migration, the PM-owned `pm-tailnet-connector` Tailscale/Headscale/private-endpoint/Funnel lane, custom-domain reverse proxy, Puppet Master Remote Link, existing VPN/private endpoints, manual remote endpoints, public-ingress security, remote callback transport, remote-access deployment conformance, and native/web remote-access projections. Server System retains Server identity, endpoint association/deduplication, Client trust/pairing/session/revocation, and permanent Client semantics. RAS-015 is the active September 1 tsnet amendment and narrowly supersedes the conflicting mechanics in RAS-003 plus the affected hosted-Tailscale/private-route wording in RAS-004, RAS-007, RAS-009, RAS-010, and RAS-014.

## 0. Scope

Remote access adds authenticated routes to one existing cryptographic `server_id`; it never creates a peer Server identity, changes the Project Home Server, moves a Project, restarts a Goal, or grants trust by reachability. `localhost`, LAN, private PM-connector hosted-Tailscale or Headscale routes, hosted-Tailscale Funnel, custom domain/proxy, Puppet Master Remote Link, existing VPN/private DNS, external user-managed host-Tailscale, and manual HTTPS/WSS endpoints are route records beneath one Server. The built-in private route is an automatic `tsnet` listener/reverse proxy independent from Funnel and has no normal-user Serve toggle. Headscale is a separate private control-plane profile and never receives a Funnel promise.

MVP setup presents co-equal `Tailscale` and `Custom Domain / NGINX / Traefik` choices, an accountless/domainless `Puppet Master Remote Link` fallback, an existing VPN/private endpoint path, and a clear visible `Skip` affordance. `Skip` starts no Remote Access work, leaves existing route policy and exposure unchanged, and returns through the exact initiating continuation; it is not hidden, renamed to defer copy, or treated as successful setup. Runtime selection prefers private and local routes while respecting explicit user policy, verified identity, trust, health, latency, privacy, network constraints, and route availability.

Every public route remains Puppet Master authenticated, paired, metadata-minimal before authentication, rate limited before hydration, and restricted to the permanent HTTPS/API/WebSocket product surface. Public ingress never exposes unclaimed setup, debug/CDP/browser control, PTY/SSH, Docker socket, provider callback internals, cluster credentials, internal health, Project metadata, Vault data, or backup content.

ContractRef: ContractName:Plans/Server_System.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

## 1. Ownership And Consumers

### 1.1 Owned here

`Plans/Remote_Access_System.md` owns:

- stable `remote_route_id`, `RemoteRouteRecord`, route type, lifecycle, health/currentness, preference, policy, testing, failure, recovery, and migration semantics beneath a verified `server_id` and `server_endpoint_id`;
- the setup and runtime-selection contract for the signed PM-owned Go `pm-tailnet-connector` embedding `tailscale.com/tsnet`, hosted Tailscale, user-supplied Headscale, automatic private endpoints, hosted-Tailscale Funnel, custom-domain NGINX/Traefik, Remote Link, existing VPN/private DNS, external host-Tailscale, and manual HTTPS/WSS endpoints;
- one connector node per stable `server_id`, authenticated versioned local IPC, Server-owned protected authorization continuity, connector state/security/migration, bounded native egress, private-listener and Funnel separation, external host-Tailscale coexistence, and the prohibition on adopting a full host installation;
- reverse-proxy configuration generation/test requirements and the external-origin/trusted-proxy/cookie/CSRF/WebSocket/callback/file-transfer boundary;
- Remote Link provider abstraction, accountless outbound-dial behavior, direct/relay migration, application E2E boundary, public-plane data minimization, and replaceable/self-hosted gateway protocol;
- callback transport families and the protected boundary around `AuthBrowserSession` without owning provider auth state or Browser content;
- remote-access exposure conformance for native/standalone, canonical container image wrappers, Kubernetes ingress, and the permanent web UI; and
- remote-access commands, read-only projections, disabled reasons, attention states, and evidence requirements consumed by Settings, Onboarding, Doctor, Server cards, and Clients.

### 1.2 Retained owners

| Domain | Retained owner | Boundary consumed here |
|---|---|---|
| Server identity, endpoint association/deduplication, discovery, trust/pairing/session/revocation, permanent Client | `Plans/Server_System.md` | Remote routes bind verified identities and never infer or mint trust. |
| Runtime topology, environment connection, outbox/replay, `RuntimeResourceGovernor`, `ObservableWork` | `Plans/Shared_Integration_Runtime.md` | Route migration preserves shared identities/cursors/idempotency; no peer runtime supervisor. |
| Container/registry/cluster runtime semantics | `Plans/Containers_Registry_and_Unraid.md` | Remote Access owns exposure requirements and wrapper parity, not container execution or registry ownership. |
| Release provenance, package signing, update/migration gates | `Plans/Release_Supply_Chain.md` | Tailscale and deployment artifacts consume supply-chain proof; this owner does not invent an updater. |
| Authentication profiles, OAuth/provider flows, secret custody | `Plans/Multi-Account.md`, provider owners, Permissions, FileSafe | This owner transports one-time callbacks and stores only non-secret refs. |
| Browser and protected auth-browser semantics | Browser owners and promoted-feature owner | Remote transport cannot observe or automate protected authentication content. |
| Commands, Event Authority, UI catalog, wiring, Settings, GUI | Their central owner docs | This owner supplies domain contracts; central owners register and wire them. |

### 1.3 Consumers

Server System, Settings, Product Onboarding, Server Claim/Bootstrap, Doctor, permanent native/web Clients, status surfaces, provider callback flows, Docker/TrueNAS/Unraid/Kubernetes deployment wrappers, and automation/API surfaces consume this owner. Consumers must not create private route registries, route-order policies, Tailscale/Remote Link state, proxy trust rules, public-ingress exceptions, or route-health computations.

ContractRef: Primitive:DRYRules, ContractName:Plans/Server_System.md, ContractName:Plans/DRY_Rules.md

## 2. Canonical PlanUnits

### RAS-001 - Remote Access Authority And Server Identity Boundary

```yaml
plan_unit_id: RAS-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Plans/Remote_Access_System.md is the sole owner for remote-route identity and policy, route preference and migration,
  Tailscale/Headscale/MagicDNS/Serve/Funnel, custom-domain reverse proxy, Puppet Master Remote Link, existing VPN/private
  endpoints, manual endpoints, public-ingress security, callback transport, and remote-access deployment conformance.
  Plans/Server_System.md retains Server identity, endpoint association and deduplication, Client trust, pairing, session,
  revocation, and permanent Client semantics. A route can never create or merge Server identity or grant trust.
gui_related: true
gui_classification_reason: Remote setup, route status, public warnings, test actions, and native/web projections are user-visible product behavior.
depends_on: [PDS-003, PDS-005, SRV-001, SRV-002, SRV-004]
unblocks: [RAS-002, RAS-003, RAS-004, RAS-005, RAS-006, RAS-007, RAS-008, RAS-009, RAS-010]
acceptance_criteria:
  - Owner maps route remote transports, route policy/migration, public ingress, and Remote Link disputes here.
  - Server identity, trust, runtime, container, release, auth, Browser, command, event, and GUI owners remain referenced rather than duplicated.
  - Route possession or reachability never becomes authorization.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, python3 scripts/pm-plans-verify.py run-gates]
risk_class: remote_access_parallel_owner_or_trust_drift
reasoning_tier: high
context_scope: remote_access_owner_routing
implementation_surfaces: [Plans/Remote_Access_System.md, Plans/remote_access_system_contracts.schema.json]
node_compile_hint: {mode: remote_access_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:chat:server-remote-backup-owner-adjudication-2026-08-31
  - source_ref:normalized-register:server-first-2026-08-31:R01-R14
preserved_exact_tokens: [Tailscale, Headscale, Serve, Funnel, Puppet Master Remote Link, VPN, manual endpoint]
negative_constraints: [Do not mint Server identity from a route., Do not infer trust from reachability., Do not duplicate retained owners.]
owner_hints: [Plans/Remote_Access_System.md, Plans/Server_System.md]
```

### RAS-002 - Stable Route Identity, Preference, And Migration

```yaml
plan_unit_id: RAS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Every remote route has one stable remote_route_id beneath an existing server_id and server_endpoint_id. URL, address,
  DNS name, network, relay, certificate presentation, and transport generation are mutable attributes. Runtime preference
  is loopback, LAN, private Tailscale or Headscale, existing VPN/private endpoint, custom domain/proxy, Funnel, Remote
  Link direct, then Remote Link relay, adapted by explicit policy, verified identity, health, latency, privacy, and network.
  Route migration stages and verifies the replacement, preserves command idempotency and projection cursors, atomically
  changes preference, drains the old route, and rolls back on verification failure without moving Projects or restarting
  Goals. A migration is not complete until the source/target `server_endpoint_id` values, expected and observed Server
  fingerprint, Server/endpoint/route generations, and source/target currentness refs are durably fenced as the same
  existing Server and the expected current generations.
gui_related: true
gui_classification_reason: Preferred route, migration progress, actual connection route, failures, and rollback are visible status and details behavior.
depends_on: [RAS-001, SRV-002, SRV-007]
unblocks: [RAS-003, RAS-004, RAS-005, RAS-006, RAS-009]
acceptance_criteria:
  - Changing address or transport preserves remote_route_id and server_id.
  - Identity or certificate mismatch blocks route activation and Server deduplication.
  - Completion requires `identity_fence_status=matched_existing_server` and `currentness_fence_status=expected_generations_current`; mismatch or stale evidence cannot commit preference.
  - Process death at each durable migration phase converges to resume, commit, rollback, disabled, or recovery_required without duplicate command execution.
validation_surfaces: [Plans/remote_access_system_contract_fixtures.json, future route migration and failure-injection tests]
risk_class: route_identity_split_or_migration_command_loss
reasoning_tier: high
context_scope: remote_route_identity_and_migration
implementation_surfaces: [Plans/remote_access_system_contracts.schema.json, future Remote Access route service]
node_compile_hint: {mode: remote_route_identity_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:R01-R04
  - source_ref:packet:18_FINAL_WAN_REMOTE_ACCESS_AUTHORITY.md
preserved_exact_tokens: [remote_route_id, loopback, LAN, private Tailscale, Funnel, Remote Link direct, Remote Link relay]
negative_constraints: [Do not change Home Server during route migration., Do not restart a Goal for route change., Do not call an unverified route active.]
owner_hints: [Plans/Remote_Access_System.md, Plans/Server_System.md, Plans/Shared_Integration_Runtime.md]
```

### RAS-003 - Hosted Tailscale Serve And Headscale Capability Split

```yaml
plan_unit_id: RAS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  MVP ordinary copy is exactly Tailscale and Built into Puppet Master. The governed component is dormant and signed out
  until explicit Set Up, reuses a compatible existing installation when proven, persists identity outside disposable
  layers, and is packaged where permitted on native, standalone, container, and Kubernetes forms. Hosted Tailscale
  authorization uses the official system browser on the exact initiating active Client, binds the protected session to
  one `authentication_operation_id`, operation generation, Client identity/session generation, and exact return target,
  and verifies the device/private endpoint beneath the existing server_id. A stale, inactive, disconnected, or mismatched
  Client return fails closed; cancel and timeout return focus without activating a route or exposing protected content;
  private MagicDNS/Serve is available only through that hosted-Tailscale control-plane profile and remains Puppet Master
  authenticated. Headscale accepts a user-supplied control URL and interactive/admin approval or one-time pre-auth key,
  persists and rotates only approved non-secret registration references, does not use hosted-Tailscale browser-account
  sign-in, and does not promise automatic Headscale
  deployment. For Headscale 0.29.3, both Serve and Funnel have requested capability recorded but effective capability
  false. Either remains unavailable unless future official Headscale support and an exact live control-plane/client probe
  both pass. WSL is normally served through the Windows host rather than creating per-distro nodes.
gui_related: true
gui_classification_reason: Tailscale setup, hosted/Headscale choice, sign-in, Serve status, tests, and exact explanatory copy are visible workflows.
depends_on: [RAS-002, SRV-004]
unblocks: [RAS-004, RAS-009]
acceptance_criteria:
  - Tailscale remains dormant until explicit setup and no copy implies Puppet Master pays for it or universal free eligibility.
  - Existing-install reuse requires exact ownership, version, compatibility, and identity proof.
  - Hosted browser authentication can resume or complete only for the same current operation and initiating active Client; cancel and timeout remain terminal redacted outcomes with exact focus return.
  - Headscale registration uses approval or a one-time pre-auth-key reference and cannot be represented as hosted browser sign-in.
  - Headscale 0.29.3 reports Serve and Funnel effective false and does not auto-host the control plane.
  - A future Headscale Serve or Funnel capability requires both current official support and an exact live control-plane/client probe; client support or policy parsing alone is insufficient.
validation_surfaces: [Plans/remote_access_system_contract_fixtures.json, future hosted-Tailscale Serve tests, future Headscale Serve/Funnel negative and future-support admission tests, future WSL host-serving tests]
risk_class: tailscale_identity_or_product_claim_drift
reasoning_tier: high
context_scope: tailscale_headscale_private_serve
implementation_surfaces: [Plans/remote_access_system_contracts.schema.json, future Tailscale component integration]
node_compile_hint: {mode: tailscale_headscale_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:R05-R07
  - source_ref:packet:pm.remote_access_requirements.v1
preserved_exact_tokens: [Tailscale, Built into Puppet Master, Headscale, MagicDNS, Serve, Funnel, initiating_active_client_only, effective capability false]
negative_constraints: [Do not silently sign in or install., Do not fall back to another Client for protected sign-in., Do not expose capture record or caller-navigate protected authentication content., Do not present hosted Tailscale browser sign-in or Serve as a Headscale capability., Do not promise Headscale Serve or Funnel without official support plus an exact live probe., Do not create one Tailscale node per WSL distro by default.]
owner_hints: [Plans/Remote_Access_System.md, Plans/Release_Supply_Chain.md]
```

### RAS-004 - Funnel Is Explicit Public Ingress

```yaml
plan_unit_id: RAS-004
unit_type: security_requirement
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Funnel is an explicit hosted-Tailscale-only public MVP ingress, off by default and visibly labeled Public internet.
  Enable requires a current typed preflight receipt for the exact route/policy generation plus a separate explicit-consent
  reference and consent generation; a generic click, prior consent, stale preflight, Headscale profile, or route setup
  completion cannot imply consent. Preflight proves verified
  Server identity, pairing/auth policy, HTTPS/API/WebSocket exposure, origin/cookie/CSRF/host policy, rate limiting, and
  rollback. Funnel exposes only the authenticated permanent Puppet Master product surface. It never exposes unclaimed
  setup, debug or CDP/browser control, PTY/SSH, Docker socket, provider callback internals, cluster credentials, internal
  health, Project metadata, Vault data, or backup content. Disable removes only the public route and preserves private
  hosted-Tailscale private Serve, Server identity, trust, sessions allowed by policy, and running work.
gui_related: true
gui_classification_reason: Public-internet warnings, preflight, explicit approval, attention, disable, and restore are visible high-risk workflows.
depends_on: [RAS-003, RAS-007]
unblocks: [RAS-009]
acceptance_criteria:
  - Funnel cannot enable without explicit public-ingress approval and successful security preflight.
  - Consent and preflight are separately keyed, current, and exact to the hosted-Tailscale route/policy generation.
  - Headscale cannot preflight or enable Funnel through the hosted-Tailscale path.
  - Public pre-auth responses remain metadata-minimal and rate limited before hydration.
  - Disable removes public ingress without deleting Server identity or private routes.
validation_surfaces: [Plans/remote_access_system_contract_fixtures.json, future public ingress and prohibited-port tests]
risk_class: accidental_public_internal_surface_exposure
reasoning_tier: high
context_scope: funnel_public_ingress
implementation_surfaces: [Plans/remote_access_system_contracts.schema.json, future Funnel lifecycle]
node_compile_hint: {mode: funnel_security_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:R07-R12
  - source_ref:packet:10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md
preserved_exact_tokens: [Funnel, Public internet, off by default, HTTPS, API, WebSocket]
negative_constraints: [Do not expose unclaimed setup., Do not expose PTY SSH Docker socket CDP or provider callback internals., Do not imply disable removes the Server.]
owner_hints: [Plans/Remote_Access_System.md, Plans/Permissions_System.md, Plans/FileSafe.md]
```

### RAS-005 - Custom Domain, Reverse Proxy, VPN, And Manual Endpoint

```yaml
plan_unit_id: RAS-005
unit_type: security_requirement
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Custom Domain is a first-class route with a dedicated-hostname baseline. Puppet Master generates and tests NGINX and
  Traefik Compose, file, or Kubernetes configuration for TLS, external origin, trusted proxy CIDRs, forwarded host/proto
  and client policy, WebSocket upgrade, secure cookies, CSRF/origin policy, stream/body/timeouts, deep links, callbacks,
  and transfers. Forwarding headers are trusted only from configured peers. Arbitrary subpath hosting is unsupported
  until every asset, deep link, callback, cookie, and WebSocket is base-path aware; a domain does not solve CGNAT.
  Existing VPN/private and manual HTTPS/WSS routes are identity/protocol/API/WebSocket/stream/file-transfer tested and
  paired, while Puppet Master does not install or administer the VPN.
gui_related: true
gui_classification_reason: Proxy preview/generation/export, external origin, trusted proxies, tests, warnings, and manual endpoint actions are visible workflows.
depends_on: [RAS-002, RAS-007]
unblocks: [RAS-009]
acceptance_criteria:
  - Generated proxy configuration passes origin, cookie, CSRF, host, WebSocket, callback, and transfer tests before activation.
  - Spoofed forwarding headers from untrusted peers are rejected.
  - Manual or VPN endpoints cannot activate until Server identity and pairing are verified.
validation_surfaces: [Plans/remote_access_system_contract_fixtures.json, future proxy spoofing and subpath negative tests]
risk_class: reverse_proxy_identity_or_origin_bypass
reasoning_tier: high
context_scope: custom_domain_proxy_private_endpoints
implementation_surfaces: [Plans/remote_access_system_contracts.schema.json, future proxy configuration service]
node_compile_hint: {mode: proxy_private_endpoint_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:R08-R10
  - source_ref:packet:10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md
preserved_exact_tokens: [Custom Domain, NGINX, Traefik, dedicated hostname, trusted proxy CIDRs, CGNAT, HTTPS, WSS]
negative_constraints: [Do not promise arbitrary subpath hosting., Do not trust forwarded headers from unknown peers., Do not administer a user VPN.]
owner_hints: [Plans/Remote_Access_System.md, Plans/Containers_Registry_and_Unraid.md]
```

### RAS-006 - Puppet Master Remote Link

```yaml
plan_unit_id: RAS-006
unit_type: security_requirement
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Puppet Master Remote Link is an accountless and domainless fallback requiring no Puppet Master account, email, API
  key, router change, public port, or user-run public software. The Home Server dials outbound. The initial provider
  abstraction uses a permanent hosted web shell plus signaling/rendezvous, direct WebRTC/data when possible, and STUN
  plus TURN relay fallback. One stable opaque address remains beneath server_id. Local pairing/trust and application
  E2E protection remain mandatory; the public plane stores no Vault, Chat, Goal, source, provider credential, or backup
  content. Pre-auth is rate limited. Direct/relay/provider migration preserves commands, cursors, and idempotency.
  The provider is replaceable; an optional self-hosted gateway implements the same public protocol. Cloudflare Tunnel
  is development aid only and Tor is out of scope.
gui_related: true
gui_classification_reason: Remote Link setup, address, direct/relay state, retry, key rotation, gateway configuration, and privacy status are visible.
depends_on: [RAS-002, RAS-007, SRV-004]
unblocks: [RAS-009]
acceptance_criteria:
  - Setup requires no Puppet Master account, email, API key, router port, or user-run public component.
  - Public-plane storage and logs contain no protected product content or credential material.
  - Direct-to-relay and provider migration preserve one Server identity, command idempotency, and projection continuity.
validation_surfaces: [Plans/remote_access_system_contract_fixtures.json, future direct relay outage and E2E tests]
risk_class: remote_link_content_exposure_or_identity_split
reasoning_tier: high
context_scope: puppet_master_remote_link
implementation_surfaces: [Plans/remote_access_system_contracts.schema.json, future Remote Link client and gateway]
node_compile_hint: {mode: remote_link_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:R09
  - source_ref:packet:18_FINAL_WAN_REMOTE_ACCESS_AUTHORITY.md
preserved_exact_tokens: [Puppet Master Remote Link, accountless, domainless, WebRTC, STUN, TURN, direct, relay]
negative_constraints: [Do not require a Puppet Master account email or API key., Do not store product content on the public plane., Do not make Cloudflare Tunnel product architecture.]
owner_hints: [Plans/Remote_Access_System.md, Plans/Server_System.md]
```

### RAS-007 - Callback Transport And Public Security Baseline

```yaml
plan_unit_id: RAS-007
unit_type: security_requirement
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Every public route enforces Puppet Master auth and authorization, pairing, revocation-aware sessions, rate limiting
  before hydration, secure cookie/CSRF/origin/host/WebSocket policy, trusted-proxy rules, metadata-minimal pre-auth
  responses, bounded Client queues, and version/protocol compatibility. Unclaimed setup remains local/private. Callback
  transport covers Puppet Master direct OAuth, CLI/Auth-Broker callbacks, native-Client forwarding, and protected
  AuthBrowserSession lifecycle handoff using one-time opaque session IDs and validated state, PKCE, provider, target,
  expiry, operation generation, initiating active Client/session generation, and return context. The sole protected
  lifecycle projection carries one authoritative operation/Client identity and an exact return-fence disposition; it
  never accepts a fallback Client or shadow returned-operation identity. Headless flows prefer device or paste code;
  native tunnels authenticate; web Clients are never assumed able to bind loopback. Protected authentication remains
  human-only, ephemeral, unobserved, unpersisted, not caller-navigable, and unavailable to capture or recording.
gui_related: true
gui_classification_reason: Security warnings, callback continuation, human-action-required state, version mismatch, and re-pairing are user-visible.
depends_on: [RAS-001, SRV-004]
unblocks: [RAS-004, RAS-005, RAS-006, RAS-009]
acceptance_criteria:
  - Public route tests cover CSRF, origin, cookie, host, WebSocket, proxy, rate-limit, session, and revocation attacks.
  - Callback completion rejects wrong state, PKCE, provider, target, expiry, or return context.
  - Completion accepts only the current exact operation and initiating active Client; stale/mismatched returns, cancel, timeout, and verification failure retain the exact initiating focus and fail closed without content return.
  - AuthBrowserSession remains inaccessible to agents, tools, automation, screenshots, recordings, DOM, console, network, storage, Chat, and Usage.
validation_surfaces: [Plans/remote_access_system_contract_fixtures.json, Plans/protected_auth_browser_contract_fixtures.json, future callback tunnel tests]
risk_class: public_auth_callback_or_protected_session_bypass
reasoning_tier: high
context_scope: public_ingress_and_callback_security
implementation_surfaces: [Plans/remote_access_system_contracts.schema.json, Plans/protected_auth_browser_contracts.schema.json]
node_compile_hint: {mode: public_remote_security_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:R11-R12
  - source_ref:packet:B5/22_SECURITY_AND_FAILURE_TEST_MATRIX.md
preserved_exact_tokens: [state, PKCE, AuthBrowserSession, human-only, ephemeral, metadata-minimal]
negative_constraints: [Do not expose unclaimed setup publicly., Do not persist callback secrets or protected-browser content., Do not assume a web Client can bind loopback.]
owner_hints: [Plans/Remote_Access_System.md, Plans/Multi-Account.md, Plans/Section15_MVP_Promoted_Features_Spec.md]
```

### RAS-008 - Deployment Conformance And Permanent Web Parity

```yaml
plan_unit_id: RAS-008
unit_type: integration_contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  One canonical Server image backs Docker direct/Compose, TrueNAS modular Compose include, Unraid template, and
  Kubernetes/Helm-style wrappers without forking or reducing the runtime. Wrappers persist Catalog, Vault, Tool Store,
  profile and credential references, and Tailscale state; provide health, graceful shutdown, explicit UID/GID and
  mounts; and avoid privileged/raw host socket by default. Kubernetes uses persistent state, least-privilege RBAC and
  ServiceAccount, governed execution pools, ingress or Tailscale, runner-loss recovery, backup/update/migration, and
  optional specialist pools. Native, standalone, and container Servers expose the same authenticated permanent web UI,
  commands, events, receipts, currentness, and honest unavailable reasons.
gui_related: true
gui_classification_reason: Permanent responsive web parity and honest unavailable states are visible product requirements.
depends_on: [RAS-001, SRV-005, SRV-007]
unblocks: [RAS-010]
acceptance_criteria:
  - All wrappers use the same canonical runtime/image contract and do not become control-plane-only reduced Servers.
  - Persistent identity/trust/route references survive safe redeploy while raw secrets remain with their owners.
  - Web parity tests cover responsive desktop/tablet/mobile, tab loss, reconnect, commands, receipts, and unavailable OS capability.
validation_surfaces: [future wrapper conformance fixtures, future Kubernetes runner-loss tests, future permanent web parity tests]
risk_class: forked_deployment_or_false_web_parity
reasoning_tier: high
context_scope: remote_deployment_conformance
implementation_surfaces: [Plans/Remote_Access_System.md, Plans/Containers_Registry_and_Unraid.md, future deployment wrappers]
node_compile_hint: {mode: deployment_conformance_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:R13-R14
  - source_ref:packet:backbone_v5/10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md
preserved_exact_tokens: [Docker, TrueNAS, Unraid, Kubernetes, Helm, permanent web UI]
negative_constraints: [Do not fork or reduce the Server runtime per wrapper., Do not use privileged or raw host socket by default., Do not claim time-sensitive platform support without revalidation.]
owner_hints: [Plans/Remote_Access_System.md, Plans/Containers_Registry_and_Unraid.md, Plans/Release_Supply_Chain.md]
```

### RAS-009 - Canonical Remote Commands, Events, And Projections

```yaml
plan_unit_id: RAS-009
unit_type: integration_contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Settings, Onboarding, Doctor, Server cards, native/web UI, palette, natural-language routing, API, and automation use
  the exact cmd.remote_access command family listed here. Each action requires typed request/result/error, stable Server,
  endpoint, route, Client, session, and expected-generation identities as applicable; permission, FileSafe, and public
  confirmation; idempotency/currentness; ObservableWork; one sole handler; admitted event or explicit receipt-only
  effect; production wiring; accessibility and focus return; and native/web parity. Missing central contracts disable
  only the affected action with an exact reason and do not erase accepted Remote Access scope. Hosted-Tailscale protected
  sign-in uses the existing remote login start/resume actions plus the shared `cmd.authentication.start|resume|cancel`
  lifecycle for the same authentication operation; it introduces no Remote Access cancel command and no browser command.
gui_related: true
gui_classification_reason: This unit owns visible remote setup, route, public warning, progress, retry, details, and status projection contracts.
depends_on: [RAS-002, RAS-003, RAS-004, RAS-005, RAS-006, RAS-007]
unblocks: [SSYS-012]
acceptance_criteria:
  - Every listed command has one central command/UI row, schema, handler, permission path, receipt/event disposition, and production wiring row before enablement.
  - Projections distinguish private, public, direct, relay, stale, offline, identity mismatch, unauthorized, degraded, and recovery-required state.
  - The Onboarding projection exposes all four Remote Access setup choices plus one clear visible Skip; Skip dispatches no Remote Access command, changes no route or exposure, and restores the exact initiating continuation and focus.
  - Compatibility aliases preserve invoked and serialized receipt identity without a second handler or lifecycle.
  - The active RAS-015 census contains exactly 44 Remote Access primary IDs; authentication cancellation is the shared authentication-owner action for the exact operation, not a new Remote or Browser command.
validation_surfaces: [Plans/remote_access_system_contract_fixtures.json, future production wiring reverse coverage, future native web parity tests]
risk_class: remote_action_without_security_or_wiring
reasoning_tier: high
context_scope: remote_commands_events_and_ui
implementation_surfaces: [Plans/Remote_Access_System.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: remote_command_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:G04
  - source_ref:packet:10_COMMAND_EVENT_RECEIPT_CENSUS.md
preserved_exact_tokens: [Skip, cmd.remote_access.open, cmd.remote_access.route.test, cmd.remote_access.tailscale.setup.start, cmd.remote_access.funnel.enable, cmd.remote_access.proxy.generate, cmd.remote_access.remote_link.setup]
negative_constraints: [Do not hide or rename the Onboarding Skip affordance., Do not dispatch a Remote Access command or change route/exposure state when Skip is activated., Do not enable unregistered remote commands., Do not create route-specific private handlers., Do not persist secrets in commands events logs Chat or Usage.]
owner_hints: [Plans/Remote_Access_System.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
```

### RAS-010 - WAN, Security, Migration, And Proof Gate

```yaml
plan_unit_id: RAS-010
unit_type: validation_requirement
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Remote Access acceptance covers LAN/VLAN/mDNS, IPv4/IPv6, NAT/CGNAT/double NAT, hotspot/hotel/corporate firewall and
  offline networks; Tailscale, Headscale, Serve, Funnel, proxy, Remote Link direct/relay/provider migration, VPN/manual
  endpoints, callback/tunnel/AuthBrowser isolation, public ingress and prohibited-port security; route crash convergence,
  wrapper conformance, native/web parity, performance, accessibility, and command/wiring. Static Plans, schemas,
  fixtures, concepts, and validators are not WAN, security, E2E, native-platform, runtime, visual, readiness, or
  certification proof. Unavailable lanes remain not_run with named residual risk.
gui_related: true
gui_classification_reason: Acceptance includes visible setup, warnings, progress, responsive native/web parity, accessibility, and recovery states.
depends_on: [RAS-002, RAS-004, RAS-005, RAS-006, RAS-007, RAS-008, RAS-009]
unblocks: []
acceptance_criteria:
  - Positive and negative schema fixtures pass expected dispositions.
  - Fresh runtime evidence covers configured route classes, attacks, migrations, outages, wrappers, and native/web parity before readiness is claimed.
  - Failures and unavailable lanes remain failures or not_run with named residual risk.
validation_surfaces: [Plans/remote_access_system_contract_fixtures.json, Plans/Automated_Testing_System.md, future WAN and security receipts]
risk_class: static_remote_contract_promoted_to_wan_readiness
reasoning_tier: high
context_scope: remote_access_acceptance
implementation_surfaces: [Plans/Remote_Access_System.md, future WAN security and parity tests]
node_compile_hint: {mode: remote_access_acceptance_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:V02-V03
  - source_ref:normalized-register:server-first-2026-08-31:V09-V12
preserved_exact_tokens: [CGNAT, double NAT, not_run, residual risk, no certification claim]
negative_constraints: [Do not promote schema checks to WAN proof., Do not hide failed security tests., Do not infer native or web parity from a concept fixture.]
owner_hints: [Plans/Remote_Access_System.md, Plans/Automated_Testing_System.md]
```

## 3. Contracts, Schemas, Events, Or Data Shapes

### 3.1 Machine contracts

`Plans/remote_access_system_contracts.schema.json` is the Draft 2020-12 machine owner for:

- `RemoteRouteRecord` plus command result and availability projections;
- `RemoteRouteMigrationRecord` and receipt with exact endpoint/fingerprint/generation/currentness fences plus exact-return and continuity invariants;
- active connector configuration/process/private-endpoint/Funnel/native-egress/authorization/IPC/receipt/migration/security/backup/external-host projections, plus `ReverseProxyConfiguration` and `RemoteLinkConfiguration`; the predecessor full-install route configuration and hosted initiating-Client handoff shapes remain migration readers only and are excluded from the aggregate root;
- `PublicIngressSecurityPolicy` with separately keyed explicit consent and current preflight evidence;
- discriminated payload, result, error, availability, permission, and disabled-reason records for all 44 active primary `cmd.remote_access.*` commands;
- normalization-only records for the eight accepted compatibility aliases, including the four demoted component/Serve inputs;
- callback exact-operation/current-authorized-Client handoff fencing and protected-auth isolation records; and
- durable lifecycle/migration records that preserve Server identity, idempotency, projection cursors, route preference, and restart convergence without Project Move or Goal restart.

`Plans/remote_access_system_contract_fixtures.json` supplies one positive payload instance for every primary command, all eight alias normalizations, and positive/negative route, migration, connector lifecycle, hosted-Tailscale durable protected handoff, Headscale/private-listener separation, IPC, receipt, security, backup exclusion, external-host coexistence, cancellation/timeout, WAN-security, Funnel consent/preflight, proxy, Remote Link, callback, availability, permission, and exact-return instances. These schemas do not run the Go connector, create a tailnet node, register a route, admit an EventRecord producer, implement cryptography, prove E2E protection, or certify any deployment.

The schema root carries aggregate identity `x-schema-id = pm.remote_access_system.contracts.v1`, `x-primary-command-count = 44`, `x-compatibility-alias-count = 8`, and an `x-command-contracts` entry for every primary ID. Each entry names the six record refs, availability/disabled selectors, permission class, persistence expectation, `ObservableWork` expectation, and truthful pending central-registration/handler/wiring/event state. Connector actions truthfully remain `handler_unavailable`, connector candidate events remain non-emitting with `expected_event_types=[]`, and TSN-001..020 plus TSX-001..005 remain `NOT_RUN`. The fixture envelope ID `pm.remote_access_system.contract_fixtures.v1` is test-only; its `contract_schema_id` points to the aggregate owner and is never a runtime record discriminator.

### 3.2 Route and lifecycle states

Remote route types are `loopback`, `lan`, `tailscale_private`, `headscale_private`, `funnel_public`, `reverse_proxy_public`, `remote_link_direct`, `remote_link_relay`, `vpn_private`, and `manual_https_wss`. Serialized predecessor `serve_private` input is migration-reader-only and normalizes to `tailscale_private`; it cannot create an active Serve route or user-visible Serve control.

Route lifecycle is `configured`, `preflighting`, `waiting_for_auth`, `waiting_for_pairing`, `testing`, `ready`, `active`, `degraded`, `offline`, `unauthorized`, `protocol_mismatch`, `identity_mismatch`, `blocked`, `disabling`, `disabled`, or `recovery_required`.

Route migration phases are `planned`, `preflighting`, `staging`, `verifying_identity`, `verifying_transport`, `switching_preference`, `draining_previous`, `post_switch_verifying`, `complete`, `rolling_back`, `rolled_back`, `blocked`, or `recovery_required`. A durable journal and expected generations make restart convergence explicit.

The connector lifecycle is `disabled`, `starting`, `needs_login`, `authorization_url_ready`, `waiting_for_authorization`, `needs_device_approval`, `connected`, `private_endpoint_starting`, `private_endpoint_ready`, `funnel_preflight`, `funnel_starting`, `funnel_ready`, `reauth_required`, `backing_off`, `needs_attention`, `stopping`, or `failed`. Process/protocol/backoff, authorization, private-endpoint, Funnel, and PM application health are separately typed projections; private endpoint readiness does not depend on Funnel state.

### 3.3 Event Authority candidates

The following owner event IDs remain non-emitting until individually admitted by Event Authority with payload schema, producer, retention, redaction, and consumers:

- `remote_access.route_state_changed`
- `remote_access.route_preference_changed`
- `remote_access.route_migration_state_changed`
- `remote_access.route_test_completed`
- `remote_access.proxy_state_changed`
- `remote_access.remote_link_state_changed`
- `remote_access.private_endpoint_state_changed`
- `remote_access.public_security_violation_detected`

Server discovery, pairing, trust, session, and revocation events remain with Server System. No prose occurrence or fixture is event registration. The connector process, authorization, private-endpoint, and Funnel families in RAS-015 remain candidate semantics only, not exact admitted EventRecord IDs; their active command contracts therefore declare `expected_event_types=[]`.

ContractRef: SchemaID:pm.remote_access_system.contracts.v1, ContractName:Plans/Contracts_V0.md, ContractName:Plans/event_family_registry.json

## 4. Integration Surfaces

### 4.1 Canonical command family requiring central integration

The Remote Access owner accepts exactly 44 primary IDs plus eight normalization-only compatibility inputs. `Plans/remote_access_system_contracts.schema.json` materializes their static typed owner contracts. Central registration, sole-handler, permission, event/receipt, and production-wiring closure remain outside this owner; until that work lands, the connector actions truthfully return `handler_unavailable` and declare `expected_event_types=[]`. The active primary IDs are:

`cmd.remote_access.open`, `cmd.remote_access.set_enabled`, `cmd.remote_access.route.set_policy`, `cmd.remote_access.route.test`, `cmd.remote_access.route.retry`, `cmd.remote_access.route.open_details`, `cmd.remote_access.open_logs`, `cmd.remote_access.tailscale.connector.check`, `cmd.remote_access.tailscale.connector.restart`, `cmd.remote_access.tailscale.identity.reset`, `cmd.remote_access.tailscale.disable`, `cmd.remote_access.tailscale.headscale.start`, `cmd.remote_access.tailscale.headscale.submit_registration`, `cmd.remote_access.tailscale.login.resume`, `cmd.remote_access.tailscale.login.start`, `cmd.remote_access.tailscale.setup.start`, `cmd.remote_access.tailscale.sign_out`, `cmd.remote_access.tailscale.test`, `cmd.remote_access.funnel.preflight`, `cmd.remote_access.funnel.enable`, `cmd.remote_access.funnel.test`, `cmd.remote_access.funnel.disable`, `cmd.remote_access.funnel.restore`, `cmd.remote_access.proxy.preview`, `cmd.remote_access.proxy.generate`, `cmd.remote_access.proxy.export`, `cmd.remote_access.proxy.set_external_origin`, `cmd.remote_access.proxy.set_trusted_proxies`, `cmd.remote_access.proxy.test`, `cmd.remote_access.proxy.disable`, `cmd.remote_access.proxy.open_details`, `cmd.remote_access.remote_link.setup`, `cmd.remote_access.remote_link.enable`, `cmd.remote_access.remote_link.disable`, `cmd.remote_access.remote_link.retry`, `cmd.remote_access.remote_link.copy_address`, `cmd.remote_access.remote_link.open`, `cmd.remote_access.remote_link.rotate_recovery_key`, `cmd.remote_access.remote_link.configure_gateway`, `cmd.remote_access.remote_link.open_details`, `cmd.remote_access.private_endpoint.add`, `cmd.remote_access.private_endpoint.update`, `cmd.remote_access.private_endpoint.test`, `cmd.remote_access.private_endpoint.remove`.

Retained aliases normalize without a second lifecycle or handler:

- `cmd.remote_access.open_details` -> `cmd.remote_access.route.open_details`
- `cmd.remote_access.tailscale.check` -> `cmd.remote_access.tailscale.connector.check`
- `cmd.remote_access.tailscale.configure` -> `cmd.remote_access.tailscale.setup.start`
- `cmd.remote_access.remote_link.test` -> `cmd.remote_access.route.test`
- `cmd.remote_access.tailscale.component.check` -> `cmd.remote_access.tailscale.connector.check`
- `cmd.remote_access.tailscale.serve.enable` -> `cmd.remote_access.tailscale.setup.start` with fixed private-endpoint intent
- `cmd.remote_access.tailscale.serve.test` -> `cmd.remote_access.tailscale.test`
- `cmd.remote_access.tailscale.serve.disable` -> `cmd.remote_access.tailscale.disable` with fixed private-connector scope and identity preservation

An alias preserves invoked and serialized receipt identity but has `independent_handler_allowed = false` and `independent_wiring_allowed = false`. Static contract materialization does not cure the integration gap: every primary command remains unavailable unless its central row, schema binding, native handler, permission/security route, receipt/event disposition, and production wiring are all present and current. `remote_access.command.availability.v1` and `remote_access.command.disabled_reason.v1` carry that fail-closed truth explicitly.

Hosted-Tailscale protected sign-in adds no extra Remote Access command. `cmd.remote_access.tailscale.login.start|resume` remain the Remote Access adapter actions; the shared authentication owner retains `cmd.authentication.start|resume|cancel` for the same `authentication_operation_id`. Cancellation targets that exact operation and returns the initiating focus; timeout is a terminal deadline disposition. The Server-owned authorization operation survives initiating-Client loss, and only a current authorized Client/session generation with a newly authorized handoff generation may resume it; no replacement Client inherits a reusable URL or protected content. Neither path creates a `cmd.browser.*` authentication action. Central authentication, command, consumer, and production-intent owners must consume this successor handoff fence rather than the predecessor initiating-active-Client-only lifetime rule.

### 4.2 Settings and status projection

Remote Access is a Settings manager/search destination and an Onboarding choice, not a new Activity Bar page. Normal UI shows setup choice, actual route, private/public label, connection/currentness, next action, and attention only. Its exact ordinary Tailscale copy is `Tailscale` and `Built into Puppet Master`; there is no backend selector and no new Settings inventory row. Advanced/Details shows stable IDs, identity verification, route generations, proxy rules, connector/build/IPC provenance, direct/relay state, tests, receipts, logs, and diagnostics.

When consumed by Product Onboarding, the Remote Access owner projection keeps `Tailscale`, `Custom Domain / NGINX / Traefik`, `Puppet Master Remote Link`, and `Existing VPN / Private Network` reachable behind the current Onboarding progressive disclosure and renders one clear visible `Skip`. Activating `Skip` dispatches no `cmd.remote_access.*` command, enables no route or public exposure, preserves Server and trust state, and returns the exact stage, revision, continuation generation, and initiating focus. Browser refresh, route return, or stale callback cannot reinterpret `Skip` as setup completion.

Exact status examples include `Connected through Tailscale`, `Public route · Funnel`, `Custom domain · Connected`, `Remote Link · Direct`, `Remote Link · Relay`, `Remote Access Needs Attention`, `Server Offline`, and `Version Update Required`. Percent appears only when a real denominator exists.

### 4.3 Central files intentionally not edited here

The parent/root lane must integrate:

- owner routing in index/Crosswalk/DRY;
- the three new primaries, four demoted aliases, sole future handlers, typed contracts, and UI-catalog rows in central command owners;
- no connector EventRecord now: production rows must retain `expected_event_types=[]` unless a later separate Event Authority admission supplies each exact payload/producer/retention/redaction/consumer contract;
- sole-handler production wiring and reverse coverage;
- storage/retention/redaction rows after schemas stabilize;
- the existing Settings manager/search destination, Onboarding, Doctor, Server-card, palette/API, and native/web projections without a backend selector or new Settings inventory row;
- shared protected-auth handoff, Server discovery/identity/pairing, release/supply-chain, canonical container/Kubernetes, and backup/restore consumer deltas; and
- PlanUnit indexes/governance only after live owner files stabilize.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json

## 5. Validation And Acceptance

| Matrix | Required positive coverage | Required negative/failure coverage |
|---|---|---|
| Identity/migration | one Server through every route and direct/relay switch with endpoint, fingerprint, generation, and currentness fences | identity/certificate mismatch, stale source/target currentness, endpoint/generation mismatch, duplicate command, crash per phase |
| Networks | LAN/VLAN, IPv4/IPv6, NAT, CGNAT, double NAT, hotspot/hotel/corporate firewall | offline, captive/blocked network, DNS failure, reconnect storm |
| Hosted Tailscale | PM-owned connector authorization with durable Server operation, newly authorized Client handoff, one node per `server_id`, automatic private endpoint, and independent optional Funnel | stale/unauthorized handoff, protected content or reusable URL persistence, full-product/daemon/CLI/TUN/host-state adoption, private endpoint coupled to Funnel, duplicate node identity |
| Headscale | user-supplied HTTPS control URL, approval/key registration, one connector node, and automatic private endpoint with Funnel inapplicable | hosted browser-account sign-in, implicit control URL, inherited hosted-Tailscale Funnel, public exposure, host state ingestion, unsupported identity collision |
| Connector IPC/state | signed compatible helper, authenticated versioned local IPC, crash restart, corruption/permission/collision recovery, bounded native Dial/stream | public IPC/LocalAPI, arbitrary SOCKS or LAN pivot, blind state overwrite, secret-bearing receipt/log/event, unbounded stream |
| Funnel/public security | off-default hosted-only route with separately keyed explicit consent, current preflight, enable/test/disable/restore | Headscale profile, implied/prior consent, stale preflight, unclaimed setup, internal ports, metadata leak, revoked session, rate-limit bypass |
| Proxy | NGINX/Traefik file/Compose/K8s, WebSocket, callback, transfer | spoofed headers, wrong origin/host/cookie/CSRF, unsupported subpath |
| Remote Link | outbound setup, direct, relay, migration, outage, provider replacement | public-plane content, E2E failure, pre-auth abuse, idempotency/cursor loss |
| VPN/manual | identity/protocol/API/WebSocket/stream/transfer and pairing | PM attempts VPN administration, unverified identity, unsupported protocol |
| Callbacks/AuthBrowser | device/paste/native tunnel and exact current operation/current authorized handoff return with redacted cancel/timeout | wrong state/PKCE/provider/target/expiry, stale or unauthorized handoff, reusable URL/content exposure/navigation/capture/recording or persistence |
| Deployment/web | native/standalone/container/K8s parity and runner loss | forked runtime, privilege/socket default, fabricated web OS capability |
| Commands/UI | one handler/wiring row, keyboard/focus, responsive widths | private handler, missing disabled reason, secret route, clipped warning/action |

Schema fixtures validate shape only. Fresh WAN, public-security, E2E, deployment, native/web, performance, accessibility, and migration evidence is required for corresponding claims.

## 6. Plan-To-Node Readiness

| Area | Canonical classification | Required before node-ready |
|---|---|---|
| Owner placement and PlanUnits | `specified` | Central owner map and index integration |
| Record schemas and fixtures | `specified_static` | Fixture validation plus command/event/storage integration |
| Commands/events/handlers/wiring | `blocked_integration_missing` | Central registration, sole handlers, production rows, reverse coverage |
| WAN transports and public security | `not_implemented_or_proven` | Fresh configured-route and adversarial receipts |
| Deployment/native/web parity | `not_implemented_or_proven` | Wrapper, platform, reconnect, responsive, and capability evidence |
| Readiness/certification | `blocked_runtime_certification_incomplete` | Governed runtime lifecycle and clean-room closure including PNC-019 |

All RAS PlanUnits are Plans-only. They create no WorkNodes, NodeSeeds, executable queues, implementation, public deployment, route activation, or certification.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- Arbitrary reverse-proxy subpath hosting is deferred until every asset/deep link/callback/cookie/WebSocket is base-path aware.
- Automatic Headscale hosting/deployment and Headscale Funnel claims are rejected. The built-in connector supplies its own automatic private listener for Headscale; this is not Headscale Serve and creates no user-visible Serve control.
- Tor is out of scope. Cloudflare Tunnel is development aid only, not Remote Link product architecture.
- Puppet Master does not install/administer an existing VPN or treat a custom domain as a CGNAT solution.
- Remote access never grants trust, moves a Project, changes the Home Server, serializes live runtime, or creates a writable Client replica.
- Public ingress never exposes internal control surfaces or protected authentication content.
- Time-sensitive service, package, container, Kubernetes, and TrueNAS facts must be reverified at implementation time.

## 8. Source Lineage And Governance

This owner compiles the user-authorized final WAN/Remote Access authority normalized in the 2026-08-31 Server register, especially R01-R14, G01-G14, and V02-V03/V09-V12. The earlier candidate `Remote_Access_and_Deployment.md`/`RAD` and `Server_Discovery_and_Endpoint_Identity.md`/`SDE` routes are superseded by this adjudicated `Plans/Remote_Access_System.md` owner split: Server identity/trust stays in Server System; remote route/transports/deployment exposure stay here.

Primary lineage:

- `18_FINAL_WAN_REMOTE_ACCESS_AUTHORITY.md`
- `pm.remote_access_requirements.v1`
- `05_SERVER_REMOTE_ACCESS_DEPLOYMENT.md`
- `10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md`
- `backbone_v5/10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md`
- `B5/22_SECURITY_AND_FAILURE_TEST_MATRIX.md`
- `10_COMMAND_EVENT_RECEIPT_CENSUS.md`

This compile does not edit central commands/events/wiring, generated shards/evidence, PlanUnit indexes, Spec Lock, auto decisions, deployment manifests, or runtime code. Schema validation is not WAN, public-security, E2E, deployment, native/web, performance, readiness, or certification proof.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Decision_Policy.md, Gate:PNC-019

## Server command-gap alias closure - Remote Link route test (2026-09-01)

`cmd.remote_access.remote_link.test` is a compatibility input only and normalizes before policy and dispatch to exact primary `cmd.remote_access.route.test`. The normalized request preserves exact `server_id`, route identity, privacy/effective-route evidence, invoked token, serialized compatibility receipt identity, initiating Client, and exact return context. It inherits the target's availability, permission/security gate, result/error family, ObservableWork, and sole handler `handlers::remote_access::route_test`. It has `alias_registration=false`, `independent_handler_allowed=false`, `independent_wiring_allowed=false`, produces no peer EventRecord, and cannot bypass the target's `handler_unavailable` state. The exact consumers are Settings > Remote Access, Claim & Bootstrap, Doctor, and Server web UI.

### RAS-011 - Remote Link Test Normalization-Only Alias

```yaml
plan_unit_id: RAS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  cmd.remote_access.remote_link.test is a normalization-only compatibility input for cmd.remote_access.route.test.
  Normalization occurs before policy/dispatch, preserves Server/route/privacy/return identity, inherits target availability
  and permission, and creates no independent registration, handler, wiring, EventRecord, or authority path.
gui_related: true
gui_classification_reason: Four named Remote Access consumers may invoke the compatibility spelling and must receive identical target behavior and return.
depends_on: [RAS-006, RAS-009]
unblocks: []
acceptance_criteria:
  - The focused adjudication fixture proves the exact source and target token, alias_registration=false, and no independent handler or wiring.
  - Settings > Remote Access, Claim & Bootstrap, Doctor, and Server web UI inherit cmd.remote_access.route.test availability and result behavior.
  - Stale identity, permission denial, handler_unavailable, restart, race, and exact-return behavior cannot differ by invoked spelling.
validation_surfaces: [Plans/Remote_Access_System.md, focused Server owner-bundle-A validator]
risk_class: remote_link_alias_policy_or_handler_bypass
reasoning_tier: high
context_scope: server_command_gap_remote_alias
implementation_surfaces: [Plans/Remote_Access_System.md, future central pre-policy alias normalization]
node_compile_hint: {mode: remote_alias_disposition_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:row-142]
negative_constraints:
  - Do not register the alias as a second primary command.
  - Do not create a peer handler, wiring row, EventRecord, permission path, or availability state.
```

## Central Sole Future Handler Binding Addendum - 2026-09-01

At its publication, this addendum adjudicated exactly 44 previously unbound primary commands. RAS-015 now supersedes only its four `tailscale.component.check`/`tailscale.serve.*` rows and handler tokens with the three connector primaries and handlers in the RAS-015 active map; the table and the two exact-set lines below are retained as predecessor integration lineage, not active dispatch authority for those four inputs. Every active command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/ObservableWork, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.remote_access.funnel.disable` | `handlers::remote_access::funnel_disable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.funnel.enable` | `handlers::remote_access::funnel_enable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.funnel.preflight` | `handlers::remote_access::funnel_preflight` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.funnel.restore` | `handlers::remote_access::funnel_restore` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.funnel.test` | `handlers::remote_access::funnel_test` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.open` | `handlers::remote_access::open` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.open_logs` | `handlers::remote_access::open_logs` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.private_endpoint.add` | `handlers::remote_access::private_endpoint_add` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.private_endpoint.remove` | `handlers::remote_access::private_endpoint_remove` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.private_endpoint.test` | `handlers::remote_access::private_endpoint_test` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.private_endpoint.update` | `handlers::remote_access::private_endpoint_update` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.proxy.disable` | `handlers::remote_access::proxy_disable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.proxy.export` | `handlers::remote_access::proxy_export` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.proxy.generate` | `handlers::remote_access::proxy_generate` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.proxy.open_details` | `handlers::remote_access::proxy_open_details` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.proxy.preview` | `handlers::remote_access::proxy_preview` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.proxy.set_external_origin` | `handlers::remote_access::proxy_set_external_origin` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.proxy.set_trusted_proxies` | `handlers::remote_access::proxy_set_trusted_proxies` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.proxy.test` | `handlers::remote_access::proxy_test` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.remote_link.configure_gateway` | `handlers::remote_access::remote_link_configure_gateway` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.remote_link.copy_address` | `handlers::remote_access::remote_link_copy_address` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.remote_link.disable` | `handlers::remote_access::remote_link_disable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.remote_link.enable` | `handlers::remote_access::remote_link_enable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.remote_link.open` | `handlers::remote_access::remote_link_open` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.remote_link.open_details` | `handlers::remote_access::remote_link_open_details` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.remote_link.retry` | `handlers::remote_access::remote_link_retry` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.remote_link.rotate_recovery_key` | `handlers::remote_access::remote_link_rotate_recovery_key` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.remote_link.setup` | `handlers::remote_access::remote_link_setup` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.route.open_details` | `handlers::remote_access::route_open_details` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.route.retry` | `handlers::remote_access::route_retry` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.route.set_policy` | `handlers::remote_access::route_set_policy` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.set_enabled` | `handlers::remote_access::set_enabled` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.component.check` | `handlers::remote_access::tailscale_component_check` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.disable` | `handlers::remote_access::tailscale_disable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.headscale.start` | `handlers::remote_access::tailscale_headscale_start` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.headscale.submit_registration` | `handlers::remote_access::tailscale_headscale_submit_registration` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.login.resume` | `handlers::remote_access::tailscale_login_resume` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.login.start` | `handlers::remote_access::tailscale_login_start` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.serve.disable` | `handlers::remote_access::tailscale_serve_disable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.serve.enable` | `handlers::remote_access::tailscale_serve_enable` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.serve.test` | `handlers::remote_access::tailscale_serve_test` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.setup.start` | `handlers::remote_access::tailscale_setup_start` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.sign_out` | `handlers::remote_access::tailscale_sign_out` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.remote_access.tailscale.test` | `handlers::remote_access::tailscale_test` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_payload` -> `Plans/remote_access_system_contracts.schema.json#/$defs/command_result` | `Plans/remote_access_system_contracts.schema.json#/$defs/command_error` / `Plans/remote_access_system_contracts.schema.json#/$defs/command_permission` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact command set: `cmd.remote_access.funnel.disable`, `cmd.remote_access.funnel.enable`, `cmd.remote_access.funnel.preflight`, `cmd.remote_access.funnel.restore`, `cmd.remote_access.funnel.test`, `cmd.remote_access.open`, `cmd.remote_access.open_logs`, `cmd.remote_access.private_endpoint.add`, `cmd.remote_access.private_endpoint.remove`, `cmd.remote_access.private_endpoint.test`, `cmd.remote_access.private_endpoint.update`, `cmd.remote_access.proxy.disable`, `cmd.remote_access.proxy.export`, `cmd.remote_access.proxy.generate`, `cmd.remote_access.proxy.open_details`, `cmd.remote_access.proxy.preview`, `cmd.remote_access.proxy.set_external_origin`, `cmd.remote_access.proxy.set_trusted_proxies`, `cmd.remote_access.proxy.test`, `cmd.remote_access.remote_link.configure_gateway`, `cmd.remote_access.remote_link.copy_address`, `cmd.remote_access.remote_link.disable`, `cmd.remote_access.remote_link.enable`, `cmd.remote_access.remote_link.open`, `cmd.remote_access.remote_link.open_details`, `cmd.remote_access.remote_link.retry`, `cmd.remote_access.remote_link.rotate_recovery_key`, `cmd.remote_access.remote_link.setup`, `cmd.remote_access.route.open_details`, `cmd.remote_access.route.retry`, `cmd.remote_access.route.set_policy`, `cmd.remote_access.set_enabled`, `cmd.remote_access.tailscale.component.check`, `cmd.remote_access.tailscale.disable`, `cmd.remote_access.tailscale.headscale.start`, `cmd.remote_access.tailscale.headscale.submit_registration`, `cmd.remote_access.tailscale.login.resume`, `cmd.remote_access.tailscale.login.start`, `cmd.remote_access.tailscale.serve.disable`, `cmd.remote_access.tailscale.serve.enable`, `cmd.remote_access.tailscale.serve.test`, `cmd.remote_access.tailscale.setup.start`, `cmd.remote_access.tailscale.sign_out`, `cmd.remote_access.tailscale.test`.

Exact sole future handler set: `handlers::remote_access::funnel_disable`, `handlers::remote_access::funnel_enable`, `handlers::remote_access::funnel_preflight`, `handlers::remote_access::funnel_restore`, `handlers::remote_access::funnel_test`, `handlers::remote_access::open`, `handlers::remote_access::open_logs`, `handlers::remote_access::private_endpoint_add`, `handlers::remote_access::private_endpoint_remove`, `handlers::remote_access::private_endpoint_test`, `handlers::remote_access::private_endpoint_update`, `handlers::remote_access::proxy_disable`, `handlers::remote_access::proxy_export`, `handlers::remote_access::proxy_generate`, `handlers::remote_access::proxy_open_details`, `handlers::remote_access::proxy_preview`, `handlers::remote_access::proxy_set_external_origin`, `handlers::remote_access::proxy_set_trusted_proxies`, `handlers::remote_access::proxy_test`, `handlers::remote_access::remote_link_configure_gateway`, `handlers::remote_access::remote_link_copy_address`, `handlers::remote_access::remote_link_disable`, `handlers::remote_access::remote_link_enable`, `handlers::remote_access::remote_link_open`, `handlers::remote_access::remote_link_open_details`, `handlers::remote_access::remote_link_retry`, `handlers::remote_access::remote_link_rotate_recovery_key`, `handlers::remote_access::remote_link_setup`, `handlers::remote_access::route_open_details`, `handlers::remote_access::route_retry`, `handlers::remote_access::route_set_policy`, `handlers::remote_access::set_enabled`, `handlers::remote_access::tailscale_component_check`, `handlers::remote_access::tailscale_disable`, `handlers::remote_access::tailscale_headscale_start`, `handlers::remote_access::tailscale_headscale_submit_registration`, `handlers::remote_access::tailscale_login_resume`, `handlers::remote_access::tailscale_login_start`, `handlers::remote_access::tailscale_serve_disable`, `handlers::remote_access::tailscale_serve_enable`, `handlers::remote_access::tailscale_serve_test`, `handlers::remote_access::tailscale_setup_start`, `handlers::remote_access::tailscale_sign_out`, `handlers::remote_access::tailscale_test`.

### RAS-012 - Central Sole Future Handler Bindings

```yaml
plan_unit_id: RAS-012
unit_type: command_binding
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Remote Access System owns exactly 44 additional central command routes. Each command maps to the sole future handler shown in this addendum, consumes the existing owner-DRY request/result/error/availability/permission family, starts handler_unavailable, and earns no native implementation credit from a target string or production-intent row.
gui_related: true
gui_classification_reason: Settings, Onboarding/Doctor, owner workspaces, palette/API, and other named consumers expose some or all of these 44 commands and their exact disabled reasons.
depends_on: [RAS-009, RAS-011]
unblocks: []
acceptance_criteria:
- Every exact command ID in this 44-commands set maps one-to-one to the table's sole future handler target and no competing handler path exists.
- Every request, result, error, availability, permission, disabled-reason, receipt, ObservableWork, return-route, persistence, migration, and negative-security obligation remains owner-DRY.
- Every central production-intent row starts handler_unavailable, expected_event_types is empty, and static wiring is never represented as native implementation evidence.
- Commands System, UI Command Catalog, production wiring, Touch Closure, and every intended GUI consumer preserve exact reverse coverage without synthetic controls.
- Static schema, fixture, command/handler/GUI/reverse-wiring, accessibility, restart/race/currentness, and no-unregistered-event gates pass.
validation_surfaces:
- python3 scripts/pm-touch-closure-verify.py --json
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-new-contracts-verify.py
risk_class: command_route_authority_and_runtime_claim_boundary
reasoning_tier: high
context_scope: canonical_owner_command_binding
implementation_surfaces:
- Plans/Remote_Access_System.md
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.production.json
- Plans/touch_closure.json
node_compile_hint:
  mode: owner_adjudicated_future_handler_bindings
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/touch_closure.json
- Plans/Wiring_Matrix.production.json
- user-approved Parallel Canon, Settings, and PMConcept7 Integration Plan
negative_constraints:
- Do not claim a native handler, runtime dispatch, durable effect, registered event, security result, readiness, or certification from this Plans-only binding.
- Do not duplicate owner schemas, state machines, repair logic, credentials, or provider operations in Settings, Onboarding, Doctor, or PMConcept7.
- Do not expose protected-auth content, secret bytes, private browser state, or provider credentials to agents, adapters, logs, receipts, capture, or ordinary GUI projections.
compile_disposition: extend_existing_owner
```

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/touch_closure.json

## Remote-Link Compatibility Contract Addendum - 2026-09-01

### RAS-013 - Remote-Link Test Pre-Dispatch Normalization

```yaml
plan_unit_id: RAS-013
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  The packet spelling cmd.remote_access.remote_link.test is compatibility input
  only. It normalizes before availability, permission, validation, or dispatch to
  cmd.remote_access.route.test while preserving the invoked token only in
  compatibility/source receipt identity. RemoteAccessCommandRequest and
  RemoteAccessCommandResult are narrow external-reference aliases to the existing
  command_payload and command_result owner definitions. No alias registration,
  second production row, peer schema, peer handler, private Remote-Link tester, or
  second route state machine is created.
gui_related: true
gui_classification_reason: Settings Remote Access, Claim and Bootstrap, Doctor, and Server web UI may invoke the retained wording but must receive the exact route-test behavior and disabled reason.
split_recommended: false
depends_on: [RAS-012, SIR-028]
unblocks: [SIR-031]
acceptance_criteria:
  - "cmd.remote_access.remote_link.test normalizes exactly to cmd.remote_access.route.test before typed validation and dispatch."
  - "RemoteAccessCommandRequest and RemoteAccessCommandResult resolve by $ref to command_payload and command_result without copied fields or widened values."
  - "Only handlers::remote_access::route_test may handle the normalized operation, and the alias has no peer production wiring or handler."
  - "The invoked compatibility token may survive only as source-receipt identity and cannot change permissions, routing, results, events, or persistence."
  - "Static schema closure does not prove a native route test, WAN connectivity, privacy, recovery, or readiness."
validation_surfaces:
  - python3 scripts/pm-server-command-gap-verify.py --json
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-plan-index.py validate
risk_class: remote_link_peer_route_or_prevalidation_alias_drift
reasoning_tier: high
context_scope: remote_link_test_compatibility_normalization
implementation_surfaces:
  - Plans/Remote_Access_System.md
  - Plans/remote_access_system_contracts.schema.json
  - Plans/remote_access_system_contract_fixtures.json
  - Plans/server_command_gap_adjudication.json
node_compile_hint: {mode: compatibility_ref_and_predispatch_normalization_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/server_command_gap_adjudication.json#rows/141
  - Plans/Remote_Access_System.md#ras-012---central-sole-future-handler-bindings
preserved_exact_tokens: [cmd.remote_access.remote_link.test, cmd.remote_access.route.test, RemoteAccessCommandRequest, RemoteAccessCommandResult, handlers::remote_access::route_test]
negative_constraints:
  - "Do not register cmd.remote_access.remote_link.test as a primary command."
  - "Do not create a Remote-Link-specific route-test handler, schema state machine, event family, or production row."
  - "Do not validate or dispatch the compatibility spelling before normalization."
owner_hints: [Plans/Remote_Access_System.md, Plans/Shared_Integration_Runtime.md, Plans/Commands_System.md]
```

## Connect-existing route acquisition addendum - 2026-09-01

RAS-014 refines the Product Onboarding projection of RAS-003, RAS-005, and RAS-006. It does not change route identity,
Server-owned identity/pairing/trust, protected-auth, command, or future-handler authority.

### RAS-014 - Route-first discovery and pairing for an existing Puppet Master

```yaml
plan_unit_id: RAS-014
unit_type: integration_contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Connecting this Client to an existing Puppet Master selects the route before discovery, Server identification, and
  pairing. Before Review, Local or VPN may perform owner-bounded read-only discovery across LAN interfaces and, when
  explicitly included, already-enabled VPN interfaces; hosted Tailscale may reuse current component/session/tailnet and
  peer projections without signing in; every route may consume cached known-endpoint data. Headscale control URL,
  reverse-proxy HTTPS URL, Remote Link/QR/short code, and manual identity/address entry remain local draft inputs in this
  phase. Review/Apply is the sole execution boundary: protected sign-in, Headscale enrollment, endpoint add/test,
  identity verification, pairing/trust, Remote Link open, network configuration, and every route mutation begin only
  after confirmation through their canonical owners. Manual identity/address entry appears only when safe discovery
  cannot return the intended Server.
gui_related: true
gui_classification_reason: Defines the route chooser, discovery order, conditional fields, pairing handoff, manual fallback, and setup-later state consumed by Product Onboarding.
depends_on: [RAS-001, RAS-003, RAS-005, RAS-006, SRV-004]
unblocks: [PWIZ-024]
acceptance_criteria:
  - The connect-existing chooser separates `Local or VPN` from the three remote route families and never places a generic Find one I already use step before route selection; Tailscale then selects hosted Tailscale or Headscale as its control-plane variant.
  - After route selection and before Review, Local or VPN may run owner-bounded read-only LAN discovery; `Include connected VPN networks` only adds already-enabled VPN interfaces, never asks for a private address by default, installs/configures no VPN, and reveals manual Server name/address only when safe discovery cannot find the intended target.
  - Hosted Tailscale first consumes cached/current component, session, tailnet, and peer projections; a usable active tailnet needs no sign-in and may expose read-only candidate endpoints before Review, while a missing/expired session offers exactly one built-in protected sign-in only after Review/Apply. `Use existing connection` and `Use official page` are not competing setup choices.
  - Headscale records the normalized HTTPS control URL and may consume cached known-endpoint projections before Review; owner-managed approval/enrollment, authenticated discovery, and Server identity verification begin only after Review/Apply, and Headscale never asks for hosted-Tailscale account sign-in.
  - Existing-client Reverse proxy asks only for the existing protected HTTPS Puppet Master URL and the chosen pairing method; proxy kind, hosting, certificate, Caddy, NGINX, Traefik, and NGINX Proxy Manager generation belong only to a new-Server/configuration branch.
  - Puppet Master Remote Link is never hidden behind More ways; it accepts the link, scanned QR payload, or short code shown by the existing Puppet Master and then uses Server-owned pairing.
  - Read-only discovery may project candidate endpoints, but after Review/Apply every route must verify and resolve one exact existing `server_id` before pairing by approval, code, or QR; route possession, reachability, a device label, or a visible recognition checkbox never grants trust.
  - Product Onboarding may record route intent and draft inputs and consume cached owner data, already-detected account/session status, known endpoints, and owner-bounded read-only LAN/VPN/active-tailnet discovery before Review. It performs no login, enrollment, protected account verification, endpoint add/test, Remote Link open, identity acceptance, Server selection as an owner mutation, pairing/trust grant, network configuration, or route mutation until the current Review revision is confirmed.
  - Guided setup may choose `Not now`; connect-existing may defer and resume the session, but it cannot report connection Ready when no reviewed route can reach and pair the existing Server.
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Plans/remote_access_system_contract_fixtures.json, future route-first LAN/VPN/Tailscale/Headscale/proxy/Remote-Link owner fixtures]
risk_class: connect_existing_route_order_or_trust_conflation
reasoning_tier: high
context_scope: onboarding_connect_existing_remote_access
implementation_surfaces: [Plans/Remote_Access_System.md, future Remote Access route service, future Product Onboarding owner adapter]
node_compile_hint: {mode: remote_access_onboarding_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [user-correction:2026-09-01-connect-existing-route-semantics, Plans/product_onboarding_contracts.schema.json, Concepts/pm7-tools/onboarding_cinematic_source.py]
preserved_exact_tokens: [Local or VPN, Include connected VPN networks, Tailscale, Headscale, Reverse proxy, Puppet Master Remote Link, approval, code, QR]
negative_constraints:
  - Do not discover before route selection or mutate before Review confirmation.
  - Do not hide authentication, enrollment, endpoint mutation/testing, identity acceptance, pairing, trust, or network configuration inside pre-Review discovery/projection.
  - Do not require a private VPN address when local-style discovery works.
  - Do not show redundant Tailscale sign-in, existing-connection, or official-page choices.
  - Do not generate or administer a reverse proxy for an existing-client connection.
  - Do not hide Remote Link or add a recognition checkbox.
  - Do not move Server identity, pairing, trust, authentication, or command ownership into Onboarding.
```

## Go tsnet connector supersession addendum - 2026-09-01

RAS-015 is the active, narrow successor to RAS-003. It preserves the product, owner, route-identity, pairing, Settings,
Onboarding, Doctor, public-ingress, proxy, Remote Link, VPN/manual-route, and static-proof boundaries of RAS-001..014,
while superseding only the earlier full-Tailscale-install/component, Serve-as-private-transport, host-install reuse,
per-WSL host-serving, and initiating-Client-lifetime mechanics. In conflicts, RAS-015 controls.

### RAS-015 - PM-owned Go tsnet connector, durable authorization, and private-route replacement

```yaml
plan_unit_id: RAS-015
unit_type: supersession_amendment
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Puppet Master's sole bundled MVP Tailscale implementation is one signed PM-owned Go `pm-tailnet-connector` helper
  embedding `tailscale.com/tsnet`, supervised as a crash-isolated sibling of the Rust Server through authenticated,
  versioned, peer-validated local IPC. Exactly one active persistent connector node identity is bound to each stable
  `server_id`, never to a Project, Client, Goal, WSL distribution, environment, runner, browser, Pod replica, or
  session. Hosted Tailscale and user-supplied Headscale remain supported. Their private PM endpoint is a connector
  listener/reverse proxy that starts automatically after approved enrollment and PM ingress validation, independent
  from Funnel and without a normal Serve control. Hosted Funnel alone is explicit public ingress, off by default,
  consent- and preflight-gated, implemented through the pinned connector listener adapter, and unavailable on
  Headscale. A user-managed host Tailscale installation may coexist only as an external verified private endpoint; PM
  never adopts, inspects, changes, signs out, stops, or updates it. Ordinary copy is exactly `Tailscale` and
  `Built into Puppet Master`; connector and tsnet details are Advanced-only. The Server durably owns authorization work
  and redacted URL-ready/handoff state across refresh, initiating-Client disconnect, and Client change. Protected URL
  contents, cookies, and browser state may be opened only on a current authorized Client with operation, generation,
  session, and return-context fences; another Client must establish a new authorized handoff and inherits no protected
  content. Native PM may use a bounded connector Dial/stream path only to approved PM endpoints; it is never an open
  SOCKS proxy or LAN pivot, and an ordinary browser still needs host-private reachability or Funnel, reverse proxy, or
  Remote Link. Static Plans/schema/fixtures remain runtime-unproven and admit no EventRecord family.
gui_related: true
gui_classification_reason: Exact normal copy, setup/auth phases, automatic private readiness, separate Browser Access/Funnel, Headscale behavior, Advanced diagnostics, disabled reasons, and destructive reset are user-visible.
split_recommended: false
supersedes:
  - RAS-003 full-install/component, existing-install reuse, Serve/private transport, per-WSL host-serving, and initiating-active-Client lifetime mechanics
  - RAS-004 private Serve wording only
  - RAS-007 hosted-Tailscale initiating-active-Client lifetime wording only
  - RAS-009 component/Serve primary-command census and protected-handoff lifetime wording only
  - RAS-010 Serve-specific validation wording only
  - RAS-014 host-component/session reuse wording only
depends_on: [RAS-002, RAS-004, RAS-007, RAS-009, RAS-010, RAS-014, SRV-004, SIR-004, SIR-005, SIR-006, SIR-007, SIR-011, SIR-015]
unblocks: []
acceptance_criteria:
  - The helper is a PM core artifact with pinned Go/tsnet/module graph, licenses/notices, SBOM, source revision, build provenance, architecture/build ID, compatible IPC range, and coherent PM release/update/rollback/state migration; it is not a second updater or provider CLI.
  - Windows uses a signed native helper without WSL, service, driver, TUN, or elevation; macOS uses a signed/notarized helper without app/system extension/VPN profile; Linux requires no root, daemon, TUN, route-table, NetworkManager, or DNS mutation.
  - Docker/TrueNAS/Unraid contain and supervise the helper in the canonical PM image/data volume without an official Tailscale sidecar, `/dev/net/tun`, `NET_ADMIN`, privileged or host networking; Kubernetes uses the same PM artifact with persistent state and a lease/leader one-active guard, never a required Tailscale operator or per-replica node.
  - The `TailscaleConnectorConfiguration` record binds `server_id`, `connector_id`, hosted-Tailscale or Headscale control kind, redacted origin ref, secure-state ref, connector/state/build/IPC versions, expected/current revisions, and one-active binding without ingesting host-Tailscale state.
  - The closed connector state machine is disabled, starting, needs_login, authorization_url_ready, waiting_for_authorization, needs_device_approval, connected, private_endpoint_starting, private_endpoint_ready, funnel_preflight, funnel_starting, funnel_ready, reauth_required, backing_off, needs_attention, stopping, or failed; process/protocol/backoff, auth, private endpoint, Funnel, and PM application health remain separately projected.
  - Local IPC authenticates and validates its peer, versions every envelope, binds request/deadline/cancellation/idempotency and connector generation, returns typed errors, is least-privilege and redacted, and exposes no public management API or general LocalAPI.
  - Hosted authorization persists only Server-owned operation/session refs and redacted URL-ready metadata; no reusable URL is durable, a lost or replacement Client never inherits protected content, and a current authorized Client can resume the same current operation through a newly authorized handoff.
  - Headscale accepts a normalized user HTTPS control URL plus interactive approval or one-time pre-auth enrollment, exposes typed compatibility/TLS/DNS/certificate/registration results, supports the private endpoint independently, and never exposes or promises Funnel.
  - Private and public listeners use a pinned tested compatible arrangement; `FunnelOnly` is not the private default, public disable preserves private/LAN/proxy/Remote-Link/Server/Goal state, and ingress class comes from trusted connector metadata rather than request-controlled forwarding headers.
  - Native connector egress is allowlisted to verified PM endpoints with bounded Dial/stream semantics; it cannot become an arbitrary destination proxy, LAN pivot, or browser enrollment mechanism.
  - External user-managed host-Tailscale endpoints and connector-private/Funnel routes are independently proven and deduplicated beneath one verified `server_id`; PM never labels or manages an external route as `Built into Puppet Master`.
  - Raw tsnet state, node/auth/pre-auth keys, reusable authorization URLs, query strings, IPC secrets, cookies, and unredacted Headscale credentials exist only in the owner-permissioned Server secure-state boundary and never in ordinary redb/seglog projections, Events, Vaults, Settings, logs, Chat, Usage, screenshots, or concepts.
  - Project backup/copy/move/source-inclusive capture always excludes connector state; portable Full Server backup excludes it by default; optional inclusion remains unavailable until portability and single-active collision safety are proven; a foreign/new-Server restore creates a new connector identity and re-pairs, while same-host rollback may recover an old identity only after exclusive fencing proves no live copy.
  - Tailnet login never unlocks backup, cloud/forge credentials never become node identity, backup traffic never defaults through PM relay/Remote Link, and restore never auto-enables Funnel, resumes Goals, pushes source, replays webhooks, or duplicates writer/node identity.
  - RuntimeResourceGovernor bounds start/auth/test/reconnect/log work, ObservableWork carries progress, and operation/currentness/idempotency fences prevent connector reconnect or rollback from duplicating push, merge, backup, prune, restore, webhook, command, writer, or node effects.
  - The only new primaries are `cmd.remote_access.tailscale.connector.check`, `cmd.remote_access.tailscale.connector.restart`, and `cmd.remote_access.tailscale.identity.reset`, with sole future handlers `handlers::remote_access::tailscale_connector_check`, `handlers::remote_access::tailscale_connector_restart`, and `handlers::remote_access::tailscale_identity_reset`; reset is destructive, step-up/current-preview/confirmation/disclosure protected, and distinct from disable/sign-out.
  - The IDs `cmd.remote_access.tailscale.component.check`, `cmd.remote_access.tailscale.serve.enable`, `cmd.remote_access.tailscale.serve.test`, and `cmd.remote_access.tailscale.serve.disable` are non-discoverable pre-policy compatibility inputs only. They normalize respectively to connector check, idempotent setup/ensure-private-endpoint, private endpoint test, and private-connector-route disable, preserve invoked/serialized identity only in receipts, invoke no CLI, and have no peer handler, availability, event, lifecycle, or production row.
  - The active owner census is 44 primaries and 8 aliases when no concurrent central change alters it; central owners must recompute denominators rather than treating this planning count as generated authority. All primaries remain `handler_unavailable` with `expected_event_types=[]` until central/native/Event Authority evidence exists.
  - Required owner receipts bind Server/connector/endpoint/route IDs, connector/IPC/tsnet/build provenance, control kind/redacted origin, requested/effective operation and route, before/after revision, initiating Client/approval/consent, PM identity result, public/private class, ObservableWork, bounded remediation, invoked compatibility ID, timestamps/freshness, and explicit redaction/exclusion facts.
  - Candidate connector process/protocol/state, authorization/device-approval, connected/reauth/sign-out, Headscale configuration/registration, private endpoint, Funnel, route-health, and identity-reset event families remain non-emitting until individually admitted by Event Authority with payload, producer, retention, redaction, and consumers.
  - No `cmd.tsnet.*`, second connector owner, second shared supervisor/governor/work system, backend selector, tailscale-rs, or Tailcat is introduced.
validation_surfaces:
  - Plans/remote_access_system_contracts.schema.json
  - Plans/remote_access_system_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - future TSN-001..020 and TSX-001..005 source-preservation/packaging/IPC/auth/listener/Headscale/coexistence/backup/visual tests
risk_class: full_tailscale_or_serve_mechanics_survive_connector_supersession
reasoning_tier: high
context_scope: pm_owned_go_tsnet_connector_and_remote_route_policy
implementation_surfaces:
  - Plans/Remote_Access_System.md
  - Plans/remote_access_system_contracts.schema.json
  - Plans/remote_access_system_contract_fixtures.json
  - future RemoteAccessManager and pm-tailnet-connector implementation
node_compile_hint: {mode: connector_contract_static_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md
  - source_ref:packet:tsnet/01_AUTHORITY_AND_SUPERSESSION.md
  - source_ref:packet:tsnet/02_GO_TSNET_CONNECTOR_ARCHITECTURE.md
  - source_ref:packet:tsnet/03_PLATFORM_PACKAGING_AND_LIFECYCLE.md
  - source_ref:packet:tsnet/04_GUI_ONBOARDING_DOCTOR_DELTAS.md
  - source_ref:packet:tsnet/05_COMMAND_EVENT_RECEIPT_WIRING_DRY_DELTAS.md
  - source_ref:packet:tsnet/06_PLANS_SCHEMA_MIGRATION_UPDATE_MATRIX.md
  - source_ref:packet:tsnet/07_SECURITY_BACKUP_UPDATE_BOUNDARIES.md
  - source_ref:packet:tsnet/08_ACCEPTANCE_FAILURE_PERFORMANCE_TEST_MATRIX.md
  - source_ref:packet:tsnet/09_NEGATIVE_REQUIREMENTS_AND_RETIREMENTS.md
  - source_ref:packet:scratch_slices_v2/machine__requirements.json__part-001__lines-000001-000220.txt:TSN-001..014
  - source_ref:packet:scratch_slices_v2/machine__requirements.json__part-002__lines-000201-000420.txt:TSN-015..020
  - source_ref:packet:scratch_slices_v2/machine__requirements.json__part-009__lines-001601-001820.txt:TSX-001..002
  - source_ref:packet:scratch_slices_v2/machine__requirements.json__part-010__lines-001801-002020.txt:TSX-003..005
preserved_exact_tokens:
  - Tailscale
  - Built into Puppet Master
  - pm-tailnet-connector
  - tailscale.com/tsnet
  - Headscale
  - Funnel
  - RuntimeResourceGovernor
  - ObservableWork
  - handler_unavailable
  - "expected_event_types=[]"
negative_constraints:
  - Do not bundle, install, manage, probe, or update the full Tailscale app, service, daemon, general CLI, installer, system extension, VPN profile, TUN driver, full sidecar, or operator for the built-in route.
  - Do not invoke `tailscale up`, `tailscale serve`, `tailscale funnel`, or `tailscale update` as the canonical implementation.
  - Do not adopt, inspect, sign out, stop, reconfigure, or update a user's host Tailscale installation.
  - Do not create a node per Project, WSL distribution, environment, runner, replica, browser, Client, Goal, or session.
  - Do not expose Serve, tsnet, daemon, sidecar, installed-app, or backend-picker language in ordinary UI.
  - Do not persist or project connector secret material outside the Server secure-state boundary.
  - Do not infer PM authorization, pairing, backup access, identity, runtime success, readiness, or certification from tailnet membership or static schema/fixture validation.
owner_hints: [Plans/Remote_Access_System.md, Plans/Server_System.md, Plans/Shared_Integration_Runtime.md, Plans/Backup_Restore_System.md, Plans/Release_Supply_Chain.md, Plans/Containers_Registry_and_Unraid.md]
```

### RAS-015 active command and compatibility map

The active Remote Access owner set is 44 primaries: every unaffected RAS-009 primary plus these connector primaries,
with the four former component/Serve primaries removed: `cmd.remote_access.tailscale.connector.check`,
`cmd.remote_access.tailscale.connector.restart`, and `cmd.remote_access.tailscale.identity.reset`. The three sole future
handlers are exactly `handlers::remote_access::tailscale_connector_check`,
`handlers::remote_access::tailscale_connector_restart`, and `handlers::remote_access::tailscale_identity_reset`.
They are static owner bindings only and remain `handler_unavailable` until the central command, permission, handler,
receipt/ObservableWork, accessibility, reverse-consumer, production-wiring, and runtime evidence lanes close.

The eight normalization-only compatibility inputs are:

| Compatibility input | Pre-policy canonical target and injected scope | Independent handler/wiring |
|---|---|---|
| `cmd.remote_access.open_details` | `cmd.remote_access.route.open_details` | forbidden |
| `cmd.remote_access.tailscale.check` | `cmd.remote_access.tailscale.connector.check` | forbidden |
| `cmd.remote_access.tailscale.configure` | `cmd.remote_access.tailscale.setup.start` | forbidden |
| `cmd.remote_access.remote_link.test` | `cmd.remote_access.route.test` | forbidden |
| `cmd.remote_access.tailscale.component.check` | `cmd.remote_access.tailscale.connector.check` | forbidden |
| `cmd.remote_access.tailscale.serve.enable` | `cmd.remote_access.tailscale.setup.start` with `operation_scope=ensure_private_endpoint` | forbidden |
| `cmd.remote_access.tailscale.serve.test` | `cmd.remote_access.tailscale.test` | forbidden |
| `cmd.remote_access.tailscale.serve.disable` | `cmd.remote_access.tailscale.disable` with `disable_scope=private_connector_route` and preserved connector identity | forbidden |

### RAS-015 active connector event-candidate disposition

The earlier generic Tailscale/Headscale/Serve candidate lines are superseded only for the connector lane by these
non-emitting families: connector process start/ready/stop/crash/restart; IPC protocol mismatch; state load/corruption
and identity reset; authorization start/URL-ready/wait/approval/complete/cancel/failure; connected/reauth/sign-out;
Headscale control configuration and registration; private-endpoint start/ready/failure/disable; Funnel preflight,
enable/disable/restore/attention; and route-health change. These are candidate semantics, not admitted EventRecord IDs.
Until Event Authority admits each exact family, owner typed receipts/projections are the only effect and central rows
must retain `expected_event_types=[]`.

### RAS-015 active validation truth

The TSN-001..020 and TSX-001..005 runtime, packaging, WAN, security, backup/restore, platform, browser, and visual
scenarios remain `NOT_RUN`. This amendment and its JSON Schema fixtures prove static contract shape only. They do not
prove a helper binary, signature/notarization, IPC authentication, persistent state, tailnet enrollment, listener,
Funnel, Headscale compatibility, route deduplication, backup exclusion at runtime, native/web presentation, or readiness.
