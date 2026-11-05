# Remote Access System

> **Compliance:** This document follows `Plans/DRY_Rules.md`, uses the PlanUnit contract in `Plans/Plan_Document_System.md`, consumes retained owner contracts by reference, and names Puppet Master only.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for Puppet Master remote-route identity and policy, route preference and migration, the PM-owned `pm-tailnet-connector` Tailscale/Headscale/private-endpoint/Funnel lane, custom-domain reverse proxy, Puppet Master Remote Link, existing VPN/private endpoints, manual remote endpoints, public-ingress security, remote callback transport, remote-access deployment conformance, and native/web remote-access projections. Server System retains Server identity, endpoint association/deduplication, Client trust/pairing/session/revocation, and permanent Client semantics. RAS-015 is the active September 1 tsnet amendment and narrowly supersedes the conflicting mechanics in RAS-003 plus the affected hosted-Tailscale/private-route wording in RAS-004, RAS-007, RAS-009, RAS-010, and RAS-014.

## 0. Scope

Settings uses Computer for the work Server/Execution Host. Ordinary Computer values do not create routes, nodes or another registry. Approved app work uses the same verified routes and separate scope authority under SRV-017; settings.follow carries no Project data.

Remote access adds authenticated routes to one existing cryptographic `server_id`; it never creates a peer Server identity, changes the Project Home Server, moves a Project, restarts a Goal, or grants trust by reachability. `localhost`, LAN, private PM-connector hosted-Tailscale or Headscale routes, hosted-Tailscale Funnel, custom domain/proxy, Puppet Master Remote Link, existing VPN/private DNS, external user-managed host-Tailscale, and manual HTTPS/WSS endpoints are route records beneath one Server. The built-in private route is an automatic `tsnet` listener/reverse proxy independent from Funnel and has no normal-user Serve toggle. Headscale is a separate private control-plane profile and never receives a Funnel promise.

MVP setup presents co-equal `Tailscale` and `Custom Domain / Caddy / NGINX / Traefik` choices, an accountless/domainless `Puppet Master Remote Link` fallback, an existing VPN/private endpoint path, and a clear visible `Skip` affordance. `Skip` starts no Remote Access work, leaves existing route policy and exposure unchanged, and returns through the exact initiating continuation; it is not hidden, renamed to defer copy, or treated as successful setup. Runtime selection prefers private and local routes while respecting explicit user policy, verified identity, trust, health, latency, privacy, network constraints, and route availability.

Every public route remains Puppet Master authenticated, paired, metadata-minimal before authentication, rate limited before hydration, and restricted to the permanent HTTPS/API/WebSocket product surface. Public ingress never exposes unclaimed setup, debug/CDP/browser control, PTY/SSH, Docker socket, provider callback internals, cluster credentials, internal health, Project metadata, Vault data, or backup content.

ContractRef: ContractName:Plans/Server_System.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

## 1. Ownership And Consumers

### 1.1 Owned here

`Plans/Remote_Access_System.md` owns:

- stable `remote_route_id`, `RemoteRouteRecord`, route type, lifecycle, health/currentness, preference, policy, testing, failure, recovery, and migration semantics beneath a verified `server_id` and `server_endpoint_id`;
- the setup and runtime-selection contract for the signed PM-owned Go `pm-tailnet-connector` embedding `tailscale.com/tsnet`, hosted Tailscale, user-supplied Headscale, automatic private endpoints, hosted-Tailscale Funnel, custom-domain NGINX/Traefik, Remote Link, existing VPN/private DNS, external host-Tailscale, and manual HTTPS/WSS endpoints;
- one connector node per stable Server or native Client installation, authenticated versioned local IPC, owner-qualified protected authorization continuity, connector state/security/migration, bounded native egress, private-listener and Funnel separation, external host-Tailscale coexistence, and the prohibition on adopting a full host installation;
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
  Every remote route has one stable remote_route_id beneath an existing server_id and server_endpoint_id. URL,
  address, DNS name, network, relay, certificate presentation, and transport generation are mutable attributes.
  Runtime preference is loopback, LAN, private Tailscale or Headscale, existing VPN/private endpoint, custom domain/proxy,
  Funnel, Remote Link direct, then Remote Link relay, adapted by explicit policy, verified identity, health, latency,
  privacy, and network. Route migration stages and verifies the replacement, preserves command idempotency and
  projection cursors, atomically changes preference, drains the old route, and rolls back on verification failure
  without moving Projects or restarting Goals. A migration is not complete until the source/target `server_endpoint_id`
  values, expected and observed Server fingerprint, Server/endpoint/route generations, and source/target currentness
  refs are durably fenced as the same existing Server and the expected current generations. App work and cross-Server
  Project reads reuse this route/identity/cursor custody for the actual source Server. A separately admitted narrow
  read scope must authorize every requested Project; settings.follow, discovery, reachability or possession of
  a route is never content authority. No second route registry or writable remote replica is introduced.
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
- 'source_ref:projects-pass2-20261103:S7/N3/N5/N17; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [remote_route_id, loopback, LAN, private Tailscale, Funnel, Remote Link direct, Remote Link relay]
negative_constraints: [Do not change Home Server during route migration., Do not restart a Goal for route change., Do not call an unverified route active.]
owner_hints: [Plans/Remote_Access_System.md, Plans/Server_System.md, Plans/Shared_Integration_Runtime.md]
```

### RAS-003 - Hosted Tailscale Serve And Headscale Capability Split

> Successor pointer (reader routing only; no semantic change): the conflicting RAS-003 mechanics identified
> in RAS-015's complete `supersedes` list follow RAS-015, including host-install reuse, full-install/component,
> private Serve, per-WSL host-serving, and initiating-active-Client lifetime mechanics. In conflicts RAS-015
> controls. Other RAS-003 semantics and the historical text are preserved.

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
canonical_text: 'Custom Domain is a first-class route with a dedicated-hostname baseline. Puppet Master generates and
  tests Caddy, NGINX and Traefik Compose, file, or Kubernetes configuration for TLS, external origin, trusted proxy CIDRs,
  forwarded host/proto and client policy, WebSocket upgrade, secure cookies, CSRF/origin policy, stream/body/timeouts,
  deep links, callbacks, and transfers. Forwarding headers are trusted only from configured peers. Arbitrary subpath
  hosting is unsupported until every asset, deep link, callback, cookie, and WebSocket is base-path aware; a domain does
  not solve CGNAT. Existing VPN/private and manual HTTPS/WSS routes are identity/protocol/API/WebSocket/stream/file-transfer
  tested and paired, while Puppet Master does not install or administer the VPN. DL-259, Jared 2026-10-31: D3 A: generated
  proxy settings support Caddy, NGINX and Traefik, with Caddy the default. Nginx Proxy Manager is existing-only: it can
  be selected as an existing proxy but never sent to a generation/install/export operation. DL-259 CERT-1 / srv C1, Jared
  2026-10-31: onboarding offers Make the settings file or I have one already. The first generates/exports Caddy, NGINX
  or Traefik configuration for the person to add on their own system before the owner’s DNS, reachability and live-connection
  checks; Caddy is the default. The second only checks the existing proxy route and live connection, with nothing generated.
  Set it up for me is removed: Puppet Master does not install or host the proxy. The onboarding draft carries proxy_hosting=generate_only
  or existing_proxy for this new-Server proxy branch and keeps proxy_tls null; it collects no certificate choice. Generating
  a file proves neither installation nor consent, identity, secure reachability or a live route. For generation, onboarding
  proxy_kind is exactly caddy, nginx or traefik and maps to reverse_proxy_configuration.proxy_family. The existing-proxy
  branch may record nginx_proxy_manager but never emits a generated-configuration record; neither branch silently substitutes
  a family. DL-259 CERT-1, Jared 2026-10-31: Puppet Master generates the proxy configuration; the person handles certificates
  and signing on their own systems. PM does not select, hold, validate, issue or sign those certificates, and admits
  no certificate-profile field or selector command. No certificate selection/validation is a prerequisite to configuration
  generation, route activation or Ready. Generation proves only that the configuration artifact was produced. Route Ready
  reports the actual PM-owner checks performed: endpoint reachability, protocol/API compatibility, expected Server identity
  and pairing/auth, and the applicable WebSocket, stream, transfer, deep-link and callback checks. It never claims that
  a certificate is valid. Existing secure-transport, public-exposure consent, identity and reachability requirements
  remain; missing or failed actual route checks cannot be called successful.


  DL-272 RV-4, 2026-11-01: The generated proxy configuration is available to download and copy on the setup step that
  asks the person to install it. Caddy, NGINX and Traefik share the existing Settings generator; an existing proxy, including
  Nginx Proxy Manager, gets no generated file. Certificates remain on the person’s systems.


  DL-272 RV-13, 2026-11-01: A proxy DNS failure gives the required A-record value from the route owner. A live-connection
  failure for generated configuration says to keep the generated file intact and enable WebSockets in any upstream proxy.
  The failed proxy flow also offers Tailscale, with its own explicit setup/consent; changing route is not success.'
gui_related: true
gui_classification_reason: Proxy preview/generation/export, external origin, trusted proxies, tests, warnings, and manual endpoint actions are visible workflows.
depends_on: [RAS-002, RAS-007]
unblocks: [RAS-009]
acceptance_criteria:
- Generated proxy configuration passes origin, cookie, CSRF, host, WebSocket, callback, and transfer tests before activation.
- Spoofed forwarding headers from untrusted peers are rejected.
- Manual or VPN endpoints cannot activate until Server identity and pairing are verified.
- 'DL-259, Jared 2026-10-31: D3 A: generated proxy settings support Caddy, NGINX and Traefik, with Caddy the default.
  Nginx Proxy Manager is existing-only: it can be selected as an existing proxy but never sent to a generation/install/export
  operation. DL-259 CERT-1 / srv C1, Jared 2026-10-31: onboarding offers Make the settings file or I have one already.
  The first generates/exports Caddy, NGINX or Traefik configuration for the person to add on their own system before
  the owner’s DNS, reachability and live-connection checks; Caddy is the default. The second only checks the existing
  proxy route and live connection, with nothing generated. Set it up for me is removed: Puppet Master does not install
  or host the proxy. The onboarding draft carries proxy_hosting=generate_only or existing_proxy for this new-Server proxy
  branch and keeps proxy_tls null; it collects no certificate choice. Generating a file proves neither installation nor
  consent, identity, secure reachability or a live route. For generation, onboarding proxy_kind is exactly caddy, nginx
  or traefik and maps to reverse_proxy_configuration.proxy_family. The existing-proxy branch may record nginx_proxy_manager
  but never emits a generated-configuration record; neither branch silently substitutes a family.'
- 'DL-259 CERT-1, Jared 2026-10-31: Puppet Master generates the proxy configuration; the person handles certificates
  and signing on their own systems. PM does not select, hold, validate, issue or sign those certificates, and admits
  no certificate-profile field or selector command. No certificate selection/validation is a prerequisite to configuration
  generation, route activation or Ready. Generation proves only that the configuration artifact was produced. Route Ready
  reports the actual PM-owner checks performed: endpoint reachability, protocol/API compatibility, expected Server identity
  and pairing/auth, and the applicable WebSocket, stream, transfer, deep-link and callback checks. It never claims that
  a certificate is valid. Existing secure-transport, public-exposure consent, identity and reachability requirements
  remain; missing or failed actual route checks cannot be called successful.'
- 'DL-272 RV-4, 2026-11-01: The generated proxy configuration is available to download and copy on the setup step that
  asks the person to install it. Caddy, NGINX and Traefik share the existing Settings generator; an existing proxy, including
  Nginx Proxy Manager, gets no generated file. Certificates remain on the person’s systems.'
- 'DL-272 RV-13, 2026-11-01: A proxy DNS failure gives the required A-record value from the route owner. A live-connection
  failure for generated configuration says to keep the generated file intact and enable WebSockets in any upstream proxy.
  The failed proxy flow also offers Tailscale, with its own explicit setup/consent; changing route is not success.'
validation_surfaces: [Plans/remote_access_system_contract_fixtures.json, future proxy spoofing and subpath negative tests]
risk_class: reverse_proxy_identity_or_origin_bypass
reasoning_tier: high
context_scope: custom_domain_proxy_private_endpoints
implementation_surfaces: [Plans/remote_access_system_contracts.schema.json, future proxy configuration service]
node_compile_hint: {mode: proxy_private_endpoint_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_ref:normalized-register:server-first-2026-08-31:R08-R10
- source_ref:packet:10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md (Owner questions, Jared 2026-10-31; DL-259)
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/srv/REPORT.md — Owner answers C1–C4, Jared 2026-10-31; product-only
  rules, no hints.
- DL-272 footage review; integration 7d2dd568be76874ff8b4d3e82bad3701226d248c; lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01.
  Source spellings are lineage, not product API.
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
canonical_text: 'Every public route enforces Puppet Master auth and authorization, pairing, revocation-aware sessions,
  rate limiting before hydration, secure cookie/CSRF/origin/host/WebSocket policy, trusted-proxy rules, metadata-minimal
  pre-auth responses, bounded Client queues, and version/protocol compatibility. Unclaimed setup remains local/private.
  Callback transport covers Puppet Master direct OAuth, CLI/Auth-Broker callbacks, native-Client forwarding, and protected
  AuthBrowserSession lifecycle handoff using one-time opaque session IDs and validated state, PKCE, provider, target,
  expiry, operation generation, initiating active Client/session generation, and return context. The sole protected lifecycle
  projection carries one authoritative operation/Client identity and an exact return-fence disposition; it never accepts
  a fallback Client or shadow returned-operation identity. Headless flows prefer device or paste code; native tunnels
  authenticate; web Clients are never assumed able to bind loopback. Protected authentication remains human-only, ephemeral,
  unobserved, unpersisted, not caller-navigable, and unavailable to capture or recording. DL-259 CLOUD-1 A, Jared 2026-10-31:
  the person uses an explicit cloud-provider console or local-bootstrap handoff and its one-time Server setup code to
  claim a new cloud computer. The Server owner checks and consumes the code through the protected local/private bootstrap
  handoff. Its initial owner-claim authorization is bound to the existing discovery_observation_id, pairing_session_id
  and identity_fingerprint handed to cmd.server.claim, with the command’s current permission and generation fences. The
  tuple references owner-verified authority; guessed IDs, an address or a caller-provided success flag are not proof.
  Raw setup code never enters the ordinary command payload, stored setup plan, logs or receipts. No public unclaimed
  setup, automated provider-console/SSH provisioning or implicit tailnet enrollment is admitted. cmd.server.bootstrap.start
  remains separate after successful claim. DL-259 CLOUD-1 / srv C2 A, Jared 2026-10-31: onboarding claims a new cloud
  computer through the provider-console/local-bootstrap one-time setup-code handoff. That initial claim route asks for
  the code, not a Server address, and does not discover unclaimed cloud computers over the network. The Server owner’s
  protected authorization and existing exact proof tuple still gate claim; no public unclaimed setup is exposed.'
gui_related: true
gui_classification_reason: Security warnings, callback continuation, human-action-required state, version mismatch, and re-pairing are user-visible.
depends_on: [RAS-001, SRV-004]
unblocks: [RAS-004, RAS-005, RAS-006, RAS-009]
acceptance_criteria:
- Public route tests cover CSRF, origin, cookie, host, WebSocket, proxy, rate-limit, session, and revocation attacks.
- Callback completion rejects wrong state, PKCE, provider, target, expiry, or return context.
- Completion accepts only the current exact operation and initiating active Client; stale/mismatched returns, cancel,
  timeout, and verification failure retain the exact initiating focus and fail closed without content return.
- AuthBrowserSession remains inaccessible to agents, tools, automation, screenshots, recordings, DOM, console, network,
  storage, Chat, and Usage.
- 'DL-259 CLOUD-1 A, Jared 2026-10-31: the person uses an explicit cloud-provider console or local-bootstrap handoff
  and its one-time Server setup code to claim a new cloud computer. The Server owner checks and consumes the code through
  the protected local/private bootstrap handoff. Its initial owner-claim authorization is bound to the existing discovery_observation_id,
  pairing_session_id and identity_fingerprint handed to cmd.server.claim, with the command’s current permission and generation
  fences. The tuple references owner-verified authority; guessed IDs, an address or a caller-provided success flag are
  not proof. Raw setup code never enters the ordinary command payload, stored setup plan, logs or receipts. No public
  unclaimed setup, automated provider-console/SSH provisioning or implicit tailnet enrollment is admitted. cmd.server.bootstrap.start
  remains separate after successful claim.'
- 'DL-259 CLOUD-1 / srv C2 A, Jared 2026-10-31: onboarding claims a new cloud computer through the provider-console/local-bootstrap
  one-time setup-code handoff. That initial claim route asks for the code, not a Server address, and does not discover
  unclaimed cloud computers over the network. The Server owner’s protected authorization and existing exact proof tuple
  still gate claim; no public unclaimed setup is exposed.'
validation_surfaces: [Plans/remote_access_system_contract_fixtures.json, Plans/protected_auth_browser_contract_fixtures.json, future callback tunnel tests]
risk_class: public_auth_callback_or_protected_session_bypass
reasoning_tier: high
context_scope: public_ingress_and_callback_security
implementation_surfaces: [Plans/remote_access_system_contracts.schema.json, Plans/protected_auth_browser_contracts.schema.json]
node_compile_hint: {mode: public_remote_security_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_ref:normalized-register:server-first-2026-08-31:R11-R12
- source_ref:packet:B5/22_SECURITY_AND_FAILURE_TEST_MATRIX.md
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md (Owner questions, Jared 2026-10-31; DL-259)
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

### RAS-017 - SSH Setup Consumers Preserve The Protected Server Owner

```yaml
plan_unit_id: RAS-017
unit_type: security_contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  Remote Access consumes Server System SRV-018 for protected SSH host-fingerprint trust and public-key
  installation. cmd.server.ssh.trust and cmd.server.ssh.public_key.install, their sole handlers and four
  versioned Server schema definitions are the only admitted design routes for those effects. Settings SSH
  computers/keys, New Project NAS/SSH inspection, onboarding and Doctor return through the same captured
  Client/operation/continuation. An unregistered source may use the owner-issued connection draft; it does
  not require a fake Project or claim that an unmanaged SSH host is a PM Server.

  An SSH host/port/account and public-key entry are not a Puppet Master remote_route_id or server_id. SSH
  trust does not approve PM Server identity, Client pairing, settings.follow, Project access, VPN
  enrollment, proxy TLS or public ingress. Existing PM routes retain RAS-002/014/015 identity and policy;
  public PM endpoints still never expose PTY/SSH. Existing integration.connection.* and auth commands retain
  their own effects and may not silently acquire an SSH key writer. No concept cmd.ssh_connection.*,
  cmd.project.ssh.* or Client-pair alias is created.

  Read-only source inspection starts only after the required current host trust/account access is verified.
  Changed fingerprint, expired proof, protected sign-in, unsupported remote capability, unresolved write
  effect or missing source/handler evidence returns the Server owner's exact refusal/pending result and
  preserves the initiating form; no convenient transport/Computer fallback or fabricated Ready. YOLO and
  agents cannot answer protected trust or install-key prompts. Both operations retain
  expected_event_types=[] and handler_unavailable until their actual owner/companion/secure-custody/native
  chains close.
gui_related: true
gui_classification_reason: Defines visible protected SSH confirmation, key-install outcomes and exact setup return.
depends_on:
- RAS-001
- RAS-002
- SRV-018
unblocks: []
acceptance_criteria:
- Every SSH trust/install consumer resolves the exact Server owner command, typed request/result and initiating
  continuation.
- SSH identity never substitutes for PM Server/route/Client trust, source trust, settings following or Project
  authority.
- A changed key or unknown key-write effect blocks readiness and safely returns to the exact setup without fallback.
- Public PM ingress keeps SSH/PTY excluded, and protected human actions remain unavailable to agents and YOLO.
validation_surfaces:
- Plans/server_system_contracts.schema.json
- Plans/server_system_contract_fixtures.json
- Plans/projects_refresh_command_bindings.json
- future native protected-input, SSH currentness, remote-write/readback and restart evidence; not_run
risk_class: ssh_host_impersonation_or_protected_key_install_authority_escape
reasoning_tier: high
context_scope: projects_refresh_20261103_ras_017
implementation_surfaces:
- Plans/Remote_Access_System.md
- Plans/server_system_contracts.schema.json
- future sole Server SSH owner and shared protected-auth broker; no implementation claimed
node_compile_hint:
  mode: accepted_product_contract_pending_native_evidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:projects-pass2-20261103:PHASE2-BRIEF known correction assigns protected SSH trust/key-install to
  lane A
- source_ref:projects-pass2-20261103:Fb-ACE01; Fc-ACE01; Fd-E01; PLANS-EDIT-PLAN section 7 owner-operation freeze
- 'source_ref:chat:20261103: Jared: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens:
- SRV-018
- cmd.server.ssh.trust
- cmd.server.ssh.public_key.install
- settings.follow
- expected_event_types=[]
- handler_unavailable
negative_constraints:
- Do not add a parallel route/trust registry, key list or untyped remote writer.
- Do not expose SSH through public PM routes, auto-provision a Server or infer PM trust from SSH access.
- Do not enable a producer from structural fixtures or weaken protected input, identity or currentness guards.
owner_hints:
- Plans/Server_System.md#SRV-018
- Plans/Remote_Access_System.md
- Plans/Multi-Account_Connection_Spec.md#MACS-002
```

ContractRef: ContractName:Plans/Server_System.md#SRV-018, ContractName:Plans/Remote_Access_System.md, ContractName:Plans/Multi-Account_Connection_Spec.md#MACS-002

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



### W3E per-family Event Authority drafts - phase 1 (2026-11-05)

Newly authored, prepared without admission. Existing candidate and handler gates remain in force.

### RAS-1402 - remote_access.private_endpoint_state_changed prepared owner contract

```yaml
plan_unit_id: RAS-1402
unit_type: contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: 'Newly authored owner contract for remote_access.private_endpoint_state_changed@1.0.0, prepared
  without admission, authorized only by deck 2 item 9.a A (DL-450). A Server-owned PM private listener state change
  under the active RAS-015 connector contract.

  Search at base f9c5de6561dff0a53a48e530f2a5c6804a7e941d: exact literal name across 894 live Plans files found
  only this owner''s candidate list; no family-specific schema, producer/custody/checkpoint/withdrawal definition.
  The recorded per-family evidence is reports/event-authority-20261105/W3E-search.json. Reuse RAS-002, RAS-015,
  remote_access_system_contracts.schema.json#/$defs/tailscale_private_endpoint_projection, CV-317, CV-339, SP-236,
  SP-278, SP-286 and SP-337; no sibling supplies a binding.

  Original source_evidence_ref resolves Plans/event_payloads/w3e/remote_access_private_endpoint_state_changed.schema.json#/$defs/owner_fact,
  a newly authored closed immutable source manifest with original operation/fact IDs, actual Server/scope, complete
  existing-owner before/after records, original result and authority refs, and exact source schema/recipe. This
  object stays in owner-controlled SP-337 custody, not ordinary event bytes. Current source acceptance verifies
  genuine owner issuance and every independently required authority; rehashing a substituted snapshot is insufficient.
  Historical lookup authenticates retained provenance and does not reacquire expired live authority. Payload: Plans/event_payloads/w3e/remote_access_private_endpoint_state_changed.schema.json,
  logical schema_id pm.event_payload.remote_access.private_endpoint_state_changed.v1, version 1.0.0. Its closed
  root has required fields schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref,
  source_evidence_ref, server_endpoint_id, remote_route_id, connector_id, prior_state, state, route_generation,
  connector_revision. Only the listed fields are permitted. Current payload/envelope/owner source scope and every
  subject identity must join exactly. This family is application-only with project_id=null. It has no fabricated
  thread/run/node/attempt; out-of-scope EventRecord joins are null. Server ID is actual owner/writer identity, not
  a URL/label, chosen UI context or an observed unverified identity. Join the actual Server connector and ingress-validation
  result with the private endpoint projection. ready requires approved enrollment and passed PM ingress validation.
  The listener follows setup automatically and remains private and independent from Funnel. Native Client connectors
  provide Dial only and have no Server private listener; their local authorization is not this event. Existing external
  host Tailscale and VPN/manual routes keep their separate route records.

  Producer: the sole newly authored RemoteAccessRouteService.private_endpoint_commit@1.0.0 method of the existing
  domain owner. It consumes the original accepted owner operation and immutable journal/observation/detection fact,
  never a caller success assertion. Revalidate schema, exact source/current generations, permission and writer lease
  before the existing domain effect; settle the original domain commit/readback and the ref-only canonical pending
  event intent. Before any append, require this family''s exact registry/version/scope and retention admission;
  until then return missing_event_registration and leave existing command expected_event_types=[] and independent
  owner receipts unchanged. No transport action or view refresh becomes an event source.

  For this family adopt SP-286 and CV-339 by name, including current strict full-value v2 resolver and SP-336/SP-347
  issuance rules. After domain source commit, store the exact semantic input and original owner result under SP-1402;
  append the exact EventRecord through CV-317/Case L-5 and SP-236. Resolve first full-value receipt custody before
  marking pending state settled or publishing event-backed terminal history. Use barrier durability where the existing
  authority/approval/outbox contract requires it. A late event refusal never undoes or fabricates an earlier independently
  settled domain action. Crash/retry starts by resolving the original source and pending intent, then the original
  append result; unavailable original evidence is recovery_required/unavailable, not a new operation.

  Identity: owner_operation_id is family-operation@1: plus lowercase SHA-256 of exact UTF-8 bytes "pm.w3e.owner_fact.v1\0"
  + hex(owner_method) + "\0" + hex(original_operation_id) + "\0" + hex(immutable_fact_id). hex is lowercase hexadecimal
  of exact UTF-8 bytes, no normalization; immutable_fact_id is the original accepted phase/journal entry ID, observation
  ID, detection ID or receipt fact, allocated once and durably preserved before use. Multiple facts in one operation
  use distinct original fact IDs, never clock/focus or retry counters. event_id is w3e@1: plus lowercase SHA-256
  of exact UTF-8 bytes "pm.event.remote_access.private_endpoint_state_changed.identity.v1\0" + scope_partition +
  "\0" + hex(server_id) + "\0" + hex(owner_operation_id). No numeric or timestamp value is serialized by this string-only
  identity recipe.

  Application idempotency_key is exactly CV-366 application@1:{hex(server_id)}:{hex(owner_operation_id)}. The Storage
  scope_partition is app. Adopt CV-317''s exact producer_semantic_digest fields and exclusions; sequence_id, observed_at_utc
  and persisted_at_utc come only from Storage and are excluded from caller semantic comparison. Preserve CV-366
  semantic hashes, SP-236 MessagePack physical bytes, CV-339 full-value bytes and SP-337 BLAKE3 addressing as distinct
  owner domains. Current number/format qualification uses the shared owner rule, never local number/timestamp code
  or a new 2^53 schema cap. An unrepresentable semantic digest route refuses before new event effects without narrowing
  the source schema.

  Idempotency/replay: same selected identity and semantic digest returns the immutable original result and first
  receipt; different semantic digest is idempotency_conflict; missing authoritative dedupe is dedupe_unavailable.
  Current writers/retries reject projector_replay_only as replay_only_not_appendable. Historical originals use their
  authenticated original schema/recipe even after live trust, state, route, source visibility or stricter format
  rules change, subject to current access/deletion/withdrawal checks. No original-provenance fallback to today''s
  recipe. Replay is only filtered derived history; it never dispatches a command, network test, notification, pairing,
  revocation, backup, restore, route activation, billing, timer or canonical write.

  Retention: retention_policy_ref=PENDING_RETENTION_DECISION. Storage Case L-3 is reused for hold/protection machinery,
  not a guessed classification or no-project bucket. Card 1 G26 describes another bounded population; deck 2 1.a..1.g
  adds no W3E counting population. Exact question: For remote_access.private_endpoint_state_changed, which history
  class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application
  records with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records
  keep their own policies. Until decided, admission remains materially incomplete and no age/count eviction is permitted;
  this hold posture is not an approved lifetime. Original source bodies, receipts and secrets keep their independent
  existing rules. The newly prepared custody/history/checkpoint values inherit this unresolved assignment and cannot
  create a shorter lifetime or bypass dependency holds.

  Redaction/custody: RemoteAccessRouteService on the actual Server holds the original accepted intent, complete
  before/after source, immutable owner result, pending event identity, source schema/recipe provenance and CV-339
  original full-value append result. Events/history expose IDs, closed state codes, public fingerprints and access-checked
  non-secret refs only. No raw secret, password, recovery credential, QR/short code, callback/reusable URL, cookie,
  key, protected-auth browser content, absolute local path or original request content may enter payload, source
  manifest, logs or projection. Source values stay under their owner redaction and authorization; refs grant no
  access. Decode/recompute every source and digest from actual owner-held bytes and check all duplicated identity/currentness
  fields. Coherent BRS-031/033 capture includes pending/terminal custody, immutable source/result payloads, canonical
  EventRecord/commit frame, first receipt/dedupe and deletion/hold fences at one captured point. Do not copy derived
  history/checkpoints; rebuild after verified source restore. A missing member is disclosed, history stays unavailable
  and current effects stay fenced; restore never grants current authority.

  Consumer/checkpoint: newly authored projector.w3e.remote_access_private_endpoint_state_changed.history@1.0.0 and
  reader.w3e.remote_access_private_endpoint_state_changed.history@1.0.0 serve Remote Access private-route status
  and Server endpoint Details. They project references to original history only, never recreate live domain authority.
  This exact family adopts SP-278 by name: use reader.storage.event_record_index@1.0.0 with independently complete
  all-partition coverage, then filter exact event_type=remote_access.private_endpoint_state_changed, actual scope_partition
  and writer server_id. Verify actual source frame, schema, original custody and current read/deletion/withdrawal
  permission on every path. SP-1402 defines physical keys and exact closed values. Commit history rows plus checkpoint
  in one redb transaction with exact prior-value CAS; only proven nonmatches may skip. Persist the nine-field durable
  generic_read_token without redb_snapshot_id; each live read rejoins its own snapshot and verifies all ten live
  fields. Inclusive restart checks original last frame identity/end offset. Empty retained source, nonempty zero-match,
  stale and degraded stay distinct; unsupported/unavailable source never advances. Rebuild derives a fresh shadow
  generation from the actual CURRENT-selected survivors and atomically cuts over under owner maintenance exclusion;
  no source or receipt is repaired.

  Compatibility/withdrawal: no legacy writer or event alias is claimed for this newly authored family. Exact retained
  schema/version/recipe dispatch stays read-only; unknown versions are unavailable and never rewritten. Future changes
  require a versioned owner migration. A family withdrawal first fences its exact current append admission under
  writer exclusion, drains/resolves original pending appends and preserves original receipts; records a cutoff and
  invalidates reader/projection generation authority before ordinary disclosure/advance. A permitted historical-only
  reader must be separately bound to retained exact bytes and current access/deletion fences. Rebuild only after
  a complete admitted replacement source/generation is verified; atomic publication cannot reinterpret old payloads
  or reissue domain work. Source retention/deletion authority remains independent.

  Oracle plan: Plans/event_authority_w3e_oracle_plan.json#families/2 and ATS-1240/ATS-1241. Criterion 12 is PARTIAL:
  phase 1 supplies per-guard positive/negative plans, not oracle code or guard-isolation proof. Membership is ABSENT,
  retention PARTIAL, native execution NOT_RUN. Phase 2 must adopt the reviewed shared number/timestamp helper and
  pm_guard_isolation tool before reviews or admission readiness.


  This family fixes its source authority_evidence roster to writer_fence, permission_or_service_authority, connector_owner,
  enrollment_result, ingress_validation. The owner, never a caller-supplied slot list, decides applicability from
  the exact original phase. writer_fence and permission_or_service_authority are always non-null genuine original
  evidence; other roles may be null only where that original phase has no such result. Verify every applicable role
  independently. No all-true flag, substituted receipt or matching hash supplies a missing role.


  Candidate retention classes, not an assignment: Approval/receipt/audit authority/source lineage: indefinite, no
  count eviction (Case L-3, Plans/storage-plan.md:17409). Non-authority security diagnostics or migration/recovery
  operational history: 2555 days, 2000000/project; no W3E application bucket granted (Case L-3, Plans/storage-plan.md:17410).
  Ordinary telemetry: 90 days, 2000000/project; W3E class and application bucket/clock not selected (Case L-3, Plans/storage-plan.md:17414;
  deck 2 1.a..1.g names other populations). The exact audit/diagnostic role and application counting/deletion authority
  remain with Jared. No runtime Run is invented for a BackupRun or RestoreRun.

  '
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-002
- RAS-015
- CV-317
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: ras-1402_w3e_phase1
implementation_surfaces:
- Plans/Remote_Access_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### RAS-1403 - remote_access.proxy_state_changed prepared owner contract

```yaml
plan_unit_id: RAS-1403
unit_type: contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: 'Newly authored owner contract for remote_access.proxy_state_changed@1.0.0, prepared without admission,
  authorized only by deck 2 item 9.a A (DL-450). A reverse-proxy route lifecycle change, including an existing proxy
  whose configuration was not generated by PM.

  Search at base f9c5de6561dff0a53a48e530f2a5c6804a7e941d: exact literal name across 894 live Plans files found
  only this owner''s candidate list; no family-specific schema, producer/custody/checkpoint/withdrawal definition.
  The recorded per-family evidence is reports/event-authority-20261105/W3E-search.json. Reuse RAS-005, RAS-007,
  remote_access_system_contracts.schema.json#/$defs/remote_route_record, CV-317, CV-339, SP-236, SP-278, SP-286
  and SP-337; no sibling supplies a binding.

  Original source_evidence_ref resolves Plans/event_payloads/w3e/remote_access_proxy_state_changed.schema.json#/$defs/owner_fact,
  a newly authored closed immutable source manifest with original operation/fact IDs, actual Server/scope, complete
  existing-owner before/after records, original result and authority refs, and exact source schema/recipe. This
  object stays in owner-controlled SP-337 custody, not ordinary event bytes. Current source acceptance verifies
  genuine owner issuance and every independently required authority; rehashing a substituted snapshot is insufficient.
  Historical lookup authenticates retained provenance and does not reacquire expired live authority. Payload: Plans/event_payloads/w3e/remote_access_proxy_state_changed.schema.json,
  logical schema_id pm.event_payload.remote_access.proxy_state_changed.v1, version 1.0.0. Its closed root has required
  fields schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref, source_evidence_ref,
  remote_route_id, server_endpoint_id, configuration_ref, prior_state, state, route_generation. Only the listed
  fields are permitted. Current payload/envelope/owner source scope and every subject identity must join exactly.
  This family is application-only with project_id=null. It has no fabricated thread/run/node/attempt; out-of-scope
  EventRecord joins are null. Server ID is actual owner/writer identity, not a URL/label, chosen UI context or an
  observed unverified identity. Source is the original reverse_proxy_public RemoteRouteRecord and its checked configuration/test
  receipt, not generated-file delivery. Generated Caddy/NGINX/Traefik artifact states remain details under RAS-005;
  Nginx Proxy Manager is existing-only and needs no generated artifact. ready/active require actual identity, protocol/API,
  pairing/auth and applicable WebSocket/stream/transfer checks, not a certificate-validity assertion. PM never installs
  the proxy or chooses/holds/signs certificates. Public activation retains current preflight and explicit consent.

  Producer: the sole newly authored RemoteAccessRouteService.proxy_state_commit@1.0.0 method of the existing domain
  owner. It consumes the original accepted owner operation and immutable journal/observation/detection fact, never
  a caller success assertion. Revalidate schema, exact source/current generations, permission and writer lease before
  the existing domain effect; settle the original domain commit/readback and the ref-only canonical pending event
  intent. Before any append, require this family''s exact registry/version/scope and retention admission; until
  then return missing_event_registration and leave existing command expected_event_types=[] and independent owner
  receipts unchanged. No transport action or view refresh becomes an event source.

  For this family adopt SP-286 and CV-339 by name, including current strict full-value v2 resolver and SP-336/SP-347
  issuance rules. After domain source commit, store the exact semantic input and original owner result under SP-1403;
  append the exact EventRecord through CV-317/Case L-5 and SP-236. Resolve first full-value receipt custody before
  marking pending state settled or publishing event-backed terminal history. Use barrier durability where the existing
  authority/approval/outbox contract requires it. A late event refusal never undoes or fabricates an earlier independently
  settled domain action. Crash/retry starts by resolving the original source and pending intent, then the original
  append result; unavailable original evidence is recovery_required/unavailable, not a new operation.

  Identity: owner_operation_id is family-operation@1: plus lowercase SHA-256 of exact UTF-8 bytes "pm.w3e.owner_fact.v1\0"
  + hex(owner_method) + "\0" + hex(original_operation_id) + "\0" + hex(immutable_fact_id). hex is lowercase hexadecimal
  of exact UTF-8 bytes, no normalization; immutable_fact_id is the original accepted phase/journal entry ID, observation
  ID, detection ID or receipt fact, allocated once and durably preserved before use. Multiple facts in one operation
  use distinct original fact IDs, never clock/focus or retry counters. event_id is w3e@1: plus lowercase SHA-256
  of exact UTF-8 bytes "pm.event.remote_access.proxy_state_changed.identity.v1\0" + scope_partition + "\0" + hex(server_id)
  + "\0" + hex(owner_operation_id). No numeric or timestamp value is serialized by this string-only identity recipe.

  Application idempotency_key is exactly CV-366 application@1:{hex(server_id)}:{hex(owner_operation_id)}. The Storage
  scope_partition is app. Adopt CV-317''s exact producer_semantic_digest fields and exclusions; sequence_id, observed_at_utc
  and persisted_at_utc come only from Storage and are excluded from caller semantic comparison. Preserve CV-366
  semantic hashes, SP-236 MessagePack physical bytes, CV-339 full-value bytes and SP-337 BLAKE3 addressing as distinct
  owner domains. Current number/format qualification uses the shared owner rule, never local number/timestamp code
  or a new 2^53 schema cap. An unrepresentable semantic digest route refuses before new event effects without narrowing
  the source schema.

  Idempotency/replay: same selected identity and semantic digest returns the immutable original result and first
  receipt; different semantic digest is idempotency_conflict; missing authoritative dedupe is dedupe_unavailable.
  Current writers/retries reject projector_replay_only as replay_only_not_appendable. Historical originals use their
  authenticated original schema/recipe even after live trust, state, route, source visibility or stricter format
  rules change, subject to current access/deletion/withdrawal checks. No original-provenance fallback to today''s
  recipe. Replay is only filtered derived history; it never dispatches a command, network test, notification, pairing,
  revocation, backup, restore, route activation, billing, timer or canonical write.

  Retention: retention_policy_ref=PENDING_RETENTION_DECISION. Storage Case L-3 is reused for hold/protection machinery,
  not a guessed classification or no-project bucket. Card 1 G26 describes another bounded population; deck 2 1.a..1.g
  adds no W3E counting population. Exact question: For remote_access.proxy_state_changed, which history class, expiry
  anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with
  no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep their
  own policies. Until decided, admission remains materially incomplete and no age/count eviction is permitted; this
  hold posture is not an approved lifetime. Original source bodies, receipts and secrets keep their independent
  existing rules. The newly prepared custody/history/checkpoint values inherit this unresolved assignment and cannot
  create a shorter lifetime or bypass dependency holds.

  Redaction/custody: RemoteAccessRouteService on the actual Server holds the original accepted intent, complete
  before/after source, immutable owner result, pending event identity, source schema/recipe provenance and CV-339
  original full-value append result. Events/history expose IDs, closed state codes, public fingerprints and access-checked
  non-secret refs only. No raw secret, password, recovery credential, QR/short code, callback/reusable URL, cookie,
  key, protected-auth browser content, absolute local path or original request content may enter payload, source
  manifest, logs or projection. Source values stay under their owner redaction and authorization; refs grant no
  access. Decode/recompute every source and digest from actual owner-held bytes and check all duplicated identity/currentness
  fields. Coherent BRS-031/033 capture includes pending/terminal custody, immutable source/result payloads, canonical
  EventRecord/commit frame, first receipt/dedupe and deletion/hold fences at one captured point. Do not copy derived
  history/checkpoints; rebuild after verified source restore. A missing member is disclosed, history stays unavailable
  and current effects stay fenced; restore never grants current authority.

  Consumer/checkpoint: newly authored projector.w3e.remote_access_proxy_state_changed.history@1.0.0 and reader.w3e.remote_access_proxy_state_changed.history@1.0.0
  serve Remote Access proxy Details and connection-status projections. They project references to original history
  only, never recreate live domain authority. This exact family adopts SP-278 by name: use reader.storage.event_record_index@1.0.0
  with independently complete all-partition coverage, then filter exact event_type=remote_access.proxy_state_changed,
  actual scope_partition and writer server_id. Verify actual source frame, schema, original custody and current
  read/deletion/withdrawal permission on every path. SP-1403 defines physical keys and exact closed values. Commit
  history rows plus checkpoint in one redb transaction with exact prior-value CAS; only proven nonmatches may skip.
  Persist the nine-field durable generic_read_token without redb_snapshot_id; each live read rejoins its own snapshot
  and verifies all ten live fields. Inclusive restart checks original last frame identity/end offset. Empty retained
  source, nonempty zero-match, stale and degraded stay distinct; unsupported/unavailable source never advances.
  Rebuild derives a fresh shadow generation from the actual CURRENT-selected survivors and atomically cuts over
  under owner maintenance exclusion; no source or receipt is repaired.

  Compatibility/withdrawal: no legacy writer or event alias is claimed for this newly authored family. Exact retained
  schema/version/recipe dispatch stays read-only; unknown versions are unavailable and never rewritten. Future changes
  require a versioned owner migration. A family withdrawal first fences its exact current append admission under
  writer exclusion, drains/resolves original pending appends and preserves original receipts; records a cutoff and
  invalidates reader/projection generation authority before ordinary disclosure/advance. A permitted historical-only
  reader must be separately bound to retained exact bytes and current access/deletion fences. Rebuild only after
  a complete admitted replacement source/generation is verified; atomic publication cannot reinterpret old payloads
  or reissue domain work. Source retention/deletion authority remains independent.

  Oracle plan: Plans/event_authority_w3e_oracle_plan.json#families/3 and ATS-1240/ATS-1241. Criterion 12 is PARTIAL:
  phase 1 supplies per-guard positive/negative plans, not oracle code or guard-isolation proof. Membership is ABSENT,
  retention PARTIAL, native execution NOT_RUN. Phase 2 must adopt the reviewed shared number/timestamp helper and
  pm_guard_isolation tool before reviews or admission readiness.


  This family fixes its source authority_evidence roster to writer_fence, permission_or_service_authority, route_source,
  configuration_disposition, route_test, public_consent, public_preflight. The owner, never a caller-supplied slot
  list, decides applicability from the exact original phase. writer_fence and permission_or_service_authority are
  always non-null genuine original evidence; other roles may be null only where that original phase has no such
  result. Verify every applicable role independently. No all-true flag, substituted receipt or matching hash supplies
  a missing role.


  Candidate retention classes, not an assignment: Approval/receipt/audit authority/source lineage: indefinite, no
  count eviction (Case L-3, Plans/storage-plan.md:17409). Non-authority security diagnostics or migration/recovery
  operational history: 2555 days, 2000000/project; no W3E application bucket granted (Case L-3, Plans/storage-plan.md:17410).
  Ordinary telemetry: 90 days, 2000000/project; W3E class and application bucket/clock not selected (Case L-3, Plans/storage-plan.md:17414;
  deck 2 1.a..1.g names other populations). The exact audit/diagnostic role and application counting/deletion authority
  remain with Jared. No runtime Run is invented for a BackupRun or RestoreRun.

  '
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-005
- RAS-007
- CV-317
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: ras-1403_w3e_phase1
implementation_surfaces:
- Plans/Remote_Access_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### RAS-1404 - remote_access.public_security_violation_detected prepared owner contract

```yaml
plan_unit_id: RAS-1404
unit_type: contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: 'Newly authored owner contract for remote_access.public_security_violation_detected@1.0.0, prepared
  without admission, authorized only by deck 2 item 9.a A (DL-450). One owner-confirmed public-ingress policy violation;
  it does not assert an unauthorized request succeeded or authorize a new security response.

  Search at base f9c5de6561dff0a53a48e530f2a5c6804a7e941d: exact literal name across 894 live Plans files found
  only this owner''s candidate list; no family-specific schema, producer/custody/checkpoint/withdrawal definition.
  The recorded per-family evidence is reports/event-authority-20261105/W3E-search.json. Reuse RAS-004, RAS-007,
  remote_access_system_contracts.schema.json#/$defs/public_ingress_security_policy, CV-317, CV-339, SP-236, SP-278,
  SP-286 and SP-337; no sibling supplies a binding.

  Original source_evidence_ref resolves Plans/event_payloads/w3e/remote_access_public_security_violation_detected.schema.json#/$defs/owner_fact,
  a newly authored closed immutable source manifest with original operation/fact IDs, actual Server/scope, complete
  existing-owner before/after records, original result and authority refs, and exact source schema/recipe. This
  object stays in owner-controlled SP-337 custody, not ordinary event bytes. Current source acceptance verifies
  genuine owner issuance and every independently required authority; rehashing a substituted snapshot is insufficient.
  Historical lookup authenticates retained provenance and does not reacquire expired live authority. Payload: Plans/event_payloads/w3e/remote_access_public_security_violation_detected.schema.json,
  logical schema_id pm.event_payload.remote_access.public_security_violation_detected.v1, version 1.0.0. Its closed
  root has required fields schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref,
  source_evidence_ref, remote_route_id, server_endpoint_id, policy_id, policy_generation, detection_id, violated_control,
  detection_evidence_ref. Only the listed fields are permitted. Current payload/envelope/owner source scope and
  every subject identity must join exactly. This family is application-only with project_id=null. It has no fabricated
  thread/run/node/attempt; out-of-scope EventRecord joins are null. Server ID is actual owner/writer identity, not
  a URL/label, chosen UI context or an observed unverified identity. The public ingress guard durably identifies
  a bounded redacted detection under the exact route/policy generation. Authenticate detection provenance independently
  from request content and join the applicable policy predicate. Never log request bodies, IP/address/user metadata,
  tokens, cookies, reusable links, protected browser state or prohibited content. Only the violated-control code
  and owner evidence refs enter history. Ordinary policy refusal with no owner-confirmed violation is not substituted;
  the existing security response remains independently owned.

  Producer: the sole newly authored PublicIngressGuard.record_violation@1.0.0 method of the existing domain owner.
  It consumes the original accepted owner operation and immutable journal/observation/detection fact, never a caller
  success assertion. Revalidate schema, exact source/current generations, permission and writer lease before the
  existing domain effect; settle the original domain commit/readback and the ref-only canonical pending event intent.
  Before any append, require this family''s exact registry/version/scope and retention admission; until then return
  missing_event_registration and leave existing command expected_event_types=[] and independent owner receipts unchanged.
  No transport action or view refresh becomes an event source.

  For this family adopt SP-286 and CV-339 by name, including current strict full-value v2 resolver and SP-336/SP-347
  issuance rules. After domain source commit, store the exact semantic input and original owner result under SP-1404;
  append the exact EventRecord through CV-317/Case L-5 and SP-236. Resolve first full-value receipt custody before
  marking pending state settled or publishing event-backed terminal history. Use barrier durability where the existing
  authority/approval/outbox contract requires it. A late event refusal never undoes or fabricates an earlier independently
  settled domain action. Crash/retry starts by resolving the original source and pending intent, then the original
  append result; unavailable original evidence is recovery_required/unavailable, not a new operation.

  Identity: owner_operation_id is family-operation@1: plus lowercase SHA-256 of exact UTF-8 bytes "pm.w3e.owner_fact.v1\0"
  + hex(owner_method) + "\0" + hex(original_operation_id) + "\0" + hex(immutable_fact_id). hex is lowercase hexadecimal
  of exact UTF-8 bytes, no normalization; immutable_fact_id is the original accepted phase/journal entry ID, observation
  ID, detection ID or receipt fact, allocated once and durably preserved before use. Multiple facts in one operation
  use distinct original fact IDs, never clock/focus or retry counters. event_id is w3e@1: plus lowercase SHA-256
  of exact UTF-8 bytes "pm.event.remote_access.public_security_violation_detected.identity.v1\0" + scope_partition
  + "\0" + hex(server_id) + "\0" + hex(owner_operation_id). No numeric or timestamp value is serialized by this
  string-only identity recipe.

  Application idempotency_key is exactly CV-366 application@1:{hex(server_id)}:{hex(owner_operation_id)}. The Storage
  scope_partition is app. Adopt CV-317''s exact producer_semantic_digest fields and exclusions; sequence_id, observed_at_utc
  and persisted_at_utc come only from Storage and are excluded from caller semantic comparison. Preserve CV-366
  semantic hashes, SP-236 MessagePack physical bytes, CV-339 full-value bytes and SP-337 BLAKE3 addressing as distinct
  owner domains. Current number/format qualification uses the shared owner rule, never local number/timestamp code
  or a new 2^53 schema cap. An unrepresentable semantic digest route refuses before new event effects without narrowing
  the source schema.

  Idempotency/replay: same selected identity and semantic digest returns the immutable original result and first
  receipt; different semantic digest is idempotency_conflict; missing authoritative dedupe is dedupe_unavailable.
  Current writers/retries reject projector_replay_only as replay_only_not_appendable. Historical originals use their
  authenticated original schema/recipe even after live trust, state, route, source visibility or stricter format
  rules change, subject to current access/deletion/withdrawal checks. No original-provenance fallback to today''s
  recipe. Replay is only filtered derived history; it never dispatches a command, network test, notification, pairing,
  revocation, backup, restore, route activation, billing, timer or canonical write.

  Retention: retention_policy_ref=PENDING_RETENTION_DECISION. Storage Case L-3 is reused for hold/protection machinery,
  not a guessed classification or no-project bucket. Card 1 G05 describes another bounded population; deck 2 1.a..1.g
  adds no W3E counting population. Exact question: For remote_access.public_security_violation_detected, which history
  class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application
  records with no Project? The G05 analogy is not an exact-name grant; existing original receipts and source records
  keep their own policies. Until decided, admission remains materially incomplete and no age/count eviction is permitted;
  this hold posture is not an approved lifetime. Original source bodies, receipts and secrets keep their independent
  existing rules. The newly prepared custody/history/checkpoint values inherit this unresolved assignment and cannot
  create a shorter lifetime or bypass dependency holds.

  Redaction/custody: PublicIngressGuard on the actual Server holds the original accepted intent, complete before/after
  source, immutable owner result, pending event identity, source schema/recipe provenance and CV-339 original full-value
  append result. Events/history expose IDs, closed state codes, public fingerprints and access-checked non-secret
  refs only. No raw secret, password, recovery credential, QR/short code, callback/reusable URL, cookie, key, protected-auth
  browser content, absolute local path or original request content may enter payload, source manifest, logs or projection.
  Source values stay under their owner redaction and authorization; refs grant no access. Decode/recompute every
  source and digest from actual owner-held bytes and check all duplicated identity/currentness fields. Coherent
  BRS-031/033 capture includes pending/terminal custody, immutable source/result payloads, canonical EventRecord/commit
  frame, first receipt/dedupe and deletion/hold fences at one captured point. Do not copy derived history/checkpoints;
  rebuild after verified source restore. A missing member is disclosed, history stays unavailable and current effects
  stay fenced; restore never grants current authority.

  Consumer/checkpoint: newly authored projector.w3e.remote_access_public_security_violation_detected.history@1.0.0
  and reader.w3e.remote_access_public_security_violation_detected.history@1.0.0 serve Remote Access security Details
  and Doctor redacted diagnostic history. They project references to original history only, never recreate live
  domain authority. This exact family adopts SP-278 by name: use reader.storage.event_record_index@1.0.0 with independently
  complete all-partition coverage, then filter exact event_type=remote_access.public_security_violation_detected,
  actual scope_partition and writer server_id. Verify actual source frame, schema, original custody and current
  read/deletion/withdrawal permission on every path. SP-1404 defines physical keys and exact closed values. Commit
  history rows plus checkpoint in one redb transaction with exact prior-value CAS; only proven nonmatches may skip.
  Persist the nine-field durable generic_read_token without redb_snapshot_id; each live read rejoins its own snapshot
  and verifies all ten live fields. Inclusive restart checks original last frame identity/end offset. Empty retained
  source, nonempty zero-match, stale and degraded stay distinct; unsupported/unavailable source never advances.
  Rebuild derives a fresh shadow generation from the actual CURRENT-selected survivors and atomically cuts over
  under owner maintenance exclusion; no source or receipt is repaired.

  Compatibility/withdrawal: no legacy writer or event alias is claimed for this newly authored family. Exact retained
  schema/version/recipe dispatch stays read-only; unknown versions are unavailable and never rewritten. Future changes
  require a versioned owner migration. A family withdrawal first fences its exact current append admission under
  writer exclusion, drains/resolves original pending appends and preserves original receipts; records a cutoff and
  invalidates reader/projection generation authority before ordinary disclosure/advance. A permitted historical-only
  reader must be separately bound to retained exact bytes and current access/deletion fences. Rebuild only after
  a complete admitted replacement source/generation is verified; atomic publication cannot reinterpret old payloads
  or reissue domain work. Source retention/deletion authority remains independent.

  Oracle plan: Plans/event_authority_w3e_oracle_plan.json#families/4 and ATS-1240/ATS-1241. Criterion 12 is PARTIAL:
  phase 1 supplies per-guard positive/negative plans, not oracle code or guard-isolation proof. Membership is ABSENT,
  retention PARTIAL, native execution NOT_RUN. Phase 2 must adopt the reviewed shared number/timestamp helper and
  pm_guard_isolation tool before reviews or admission readiness.


  This family fixes its source authority_evidence roster to writer_fence, permission_or_service_authority, public_policy,
  violation_detection, violated_control_evidence. The owner, never a caller-supplied slot list, decides applicability
  from the exact original phase. writer_fence and permission_or_service_authority are always non-null genuine original
  evidence; other roles may be null only where that original phase has no such result. Verify every applicable role
  independently. No all-true flag, substituted receipt or matching hash supplies a missing role.


  Candidate retention classes, not an assignment: Approval/receipt/audit authority/source lineage: indefinite, no
  count eviction (Case L-3, Plans/storage-plan.md:17409). Non-authority security diagnostics or migration/recovery
  operational history: 2555 days, 2000000/project; no W3E application bucket granted (Case L-3, Plans/storage-plan.md:17410).
  Ordinary telemetry: 90 days, 2000000/project; W3E class and application bucket/clock not selected (Case L-3, Plans/storage-plan.md:17414;
  deck 2 1.a..1.g names other populations). The exact audit/diagnostic role and application counting/deletion authority
  remain with Jared. No runtime Run is invented for a BackupRun or RestoreRun.

  '
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-004
- RAS-007
- CV-317
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: ras-1404_w3e_phase1
implementation_surfaces:
- Plans/Remote_Access_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### RAS-1405 - remote_access.remote_link_state_changed prepared owner contract

```yaml
plan_unit_id: RAS-1405
unit_type: contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: 'Newly authored owner contract for remote_access.remote_link_state_changed@1.0.0, prepared without
  admission, authorized only by deck 2 item 9.a A (DL-450). One Remote Link transport-state change for the same
  existing Server, including direct/relay/provider migration.

  Search at base f9c5de6561dff0a53a48e530f2a5c6804a7e941d: exact literal name across 894 live Plans files found
  only this owner''s candidate list; no family-specific schema, producer/custody/checkpoint/withdrawal definition.
  The recorded per-family evidence is reports/event-authority-20261105/W3E-search.json. Reuse RAS-006, RAS-014,
  remote_access_system_contracts.schema.json#/$defs/remote_link_configuration, CV-317, CV-339, SP-236, SP-278, SP-286
  and SP-337; no sibling supplies a binding.

  Original source_evidence_ref resolves Plans/event_payloads/w3e/remote_access_remote_link_state_changed.schema.json#/$defs/owner_fact,
  a newly authored closed immutable source manifest with original operation/fact IDs, actual Server/scope, complete
  existing-owner before/after records, original result and authority refs, and exact source schema/recipe. This
  object stays in owner-controlled SP-337 custody, not ordinary event bytes. Current source acceptance verifies
  genuine owner issuance and every independently required authority; rehashing a substituted snapshot is insufficient.
  Historical lookup authenticates retained provenance and does not reacquire expired live authority. Payload: Plans/event_payloads/w3e/remote_access_remote_link_state_changed.schema.json,
  logical schema_id pm.event_payload.remote_access.remote_link_state_changed.v1, version 1.0.0. Its closed root
  has required fields schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref,
  source_evidence_ref, configuration_id, remote_route_id, prior_state, state, provider_ref, transport_evidence_ref.
  Only the listed fields are permitted. Current payload/envelope/owner source scope and every subject identity must
  join exactly. This family is application-only with project_id=null. It has no fabricated thread/run/node/attempt;
  out-of-scope EventRecord joins are null. Server ID is actual owner/writer identity, not a URL/label, chosen UI
  context or an observed unverified identity. Join the exact Remote Link configuration, current route and original
  transport evidence. direct/relay require owner-verified Server identity, pairing and application E2E. The public
  plane retains no product content. Retain only opaque non-secret provider/configuration/evidence refs; no issued
  link, QR contents or short code. RAS-014 REMOTE-CODE-1 remains the accepted pre-build protocol-verification point;
  this contract chooses no code grammar, expiry or resolution rule. A transport change preserves commands/cursors
  and cannot restart Goals or move Projects.

  Producer: the sole newly authored RemoteAccessRouteService.remote_link_state_commit@1.0.0 method of the existing
  domain owner. It consumes the original accepted owner operation and immutable journal/observation/detection fact,
  never a caller success assertion. Revalidate schema, exact source/current generations, permission and writer lease
  before the existing domain effect; settle the original domain commit/readback and the ref-only canonical pending
  event intent. Before any append, require this family''s exact registry/version/scope and retention admission;
  until then return missing_event_registration and leave existing command expected_event_types=[] and independent
  owner receipts unchanged. No transport action or view refresh becomes an event source.

  For this family adopt SP-286 and CV-339 by name, including current strict full-value v2 resolver and SP-336/SP-347
  issuance rules. After domain source commit, store the exact semantic input and original owner result under SP-1405;
  append the exact EventRecord through CV-317/Case L-5 and SP-236. Resolve first full-value receipt custody before
  marking pending state settled or publishing event-backed terminal history. Use barrier durability where the existing
  authority/approval/outbox contract requires it. A late event refusal never undoes or fabricates an earlier independently
  settled domain action. Crash/retry starts by resolving the original source and pending intent, then the original
  append result; unavailable original evidence is recovery_required/unavailable, not a new operation.

  Identity: owner_operation_id is family-operation@1: plus lowercase SHA-256 of exact UTF-8 bytes "pm.w3e.owner_fact.v1\0"
  + hex(owner_method) + "\0" + hex(original_operation_id) + "\0" + hex(immutable_fact_id). hex is lowercase hexadecimal
  of exact UTF-8 bytes, no normalization; immutable_fact_id is the original accepted phase/journal entry ID, observation
  ID, detection ID or receipt fact, allocated once and durably preserved before use. Multiple facts in one operation
  use distinct original fact IDs, never clock/focus or retry counters. event_id is w3e@1: plus lowercase SHA-256
  of exact UTF-8 bytes "pm.event.remote_access.remote_link_state_changed.identity.v1\0" + scope_partition + "\0"
  + hex(server_id) + "\0" + hex(owner_operation_id). No numeric or timestamp value is serialized by this string-only
  identity recipe.

  Application idempotency_key is exactly CV-366 application@1:{hex(server_id)}:{hex(owner_operation_id)}. The Storage
  scope_partition is app. Adopt CV-317''s exact producer_semantic_digest fields and exclusions; sequence_id, observed_at_utc
  and persisted_at_utc come only from Storage and are excluded from caller semantic comparison. Preserve CV-366
  semantic hashes, SP-236 MessagePack physical bytes, CV-339 full-value bytes and SP-337 BLAKE3 addressing as distinct
  owner domains. Current number/format qualification uses the shared owner rule, never local number/timestamp code
  or a new 2^53 schema cap. An unrepresentable semantic digest route refuses before new event effects without narrowing
  the source schema.

  Idempotency/replay: same selected identity and semantic digest returns the immutable original result and first
  receipt; different semantic digest is idempotency_conflict; missing authoritative dedupe is dedupe_unavailable.
  Current writers/retries reject projector_replay_only as replay_only_not_appendable. Historical originals use their
  authenticated original schema/recipe even after live trust, state, route, source visibility or stricter format
  rules change, subject to current access/deletion/withdrawal checks. No original-provenance fallback to today''s
  recipe. Replay is only filtered derived history; it never dispatches a command, network test, notification, pairing,
  revocation, backup, restore, route activation, billing, timer or canonical write.

  Retention: retention_policy_ref=PENDING_RETENTION_DECISION. Storage Case L-3 is reused for hold/protection machinery,
  not a guessed classification or no-project bucket. Card 1 G26 describes another bounded population; deck 2 1.a..1.g
  adds no W3E counting population. Exact question: For remote_access.remote_link_state_changed, which history class,
  expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records
  with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep
  their own policies. Until decided, admission remains materially incomplete and no age/count eviction is permitted;
  this hold posture is not an approved lifetime. Original source bodies, receipts and secrets keep their independent
  existing rules. The newly prepared custody/history/checkpoint values inherit this unresolved assignment and cannot
  create a shorter lifetime or bypass dependency holds.

  Redaction/custody: RemoteAccessRouteService on the actual Server holds the original accepted intent, complete
  before/after source, immutable owner result, pending event identity, source schema/recipe provenance and CV-339
  original full-value append result. Events/history expose IDs, closed state codes, public fingerprints and access-checked
  non-secret refs only. No raw secret, password, recovery credential, QR/short code, callback/reusable URL, cookie,
  key, protected-auth browser content, absolute local path or original request content may enter payload, source
  manifest, logs or projection. Source values stay under their owner redaction and authorization; refs grant no
  access. Decode/recompute every source and digest from actual owner-held bytes and check all duplicated identity/currentness
  fields. Coherent BRS-031/033 capture includes pending/terminal custody, immutable source/result payloads, canonical
  EventRecord/commit frame, first receipt/dedupe and deletion/hold fences at one captured point. Do not copy derived
  history/checkpoints; rebuild after verified source restore. A missing member is disclosed, history stays unavailable
  and current effects stay fenced; restore never grants current authority.

  Consumer/checkpoint: newly authored projector.w3e.remote_access_remote_link_state_changed.history@1.0.0 and reader.w3e.remote_access_remote_link_state_changed.history@1.0.0
  serve Remote Link Direct/Relay/attention status and Server route Details. They project references to original
  history only, never recreate live domain authority. This exact family adopts SP-278 by name: use reader.storage.event_record_index@1.0.0
  with independently complete all-partition coverage, then filter exact event_type=remote_access.remote_link_state_changed,
  actual scope_partition and writer server_id. Verify actual source frame, schema, original custody and current
  read/deletion/withdrawal permission on every path. SP-1405 defines physical keys and exact closed values. Commit
  history rows plus checkpoint in one redb transaction with exact prior-value CAS; only proven nonmatches may skip.
  Persist the nine-field durable generic_read_token without redb_snapshot_id; each live read rejoins its own snapshot
  and verifies all ten live fields. Inclusive restart checks original last frame identity/end offset. Empty retained
  source, nonempty zero-match, stale and degraded stay distinct; unsupported/unavailable source never advances.
  Rebuild derives a fresh shadow generation from the actual CURRENT-selected survivors and atomically cuts over
  under owner maintenance exclusion; no source or receipt is repaired.

  Compatibility/withdrawal: no legacy writer or event alias is claimed for this newly authored family. Exact retained
  schema/version/recipe dispatch stays read-only; unknown versions are unavailable and never rewritten. Future changes
  require a versioned owner migration. A family withdrawal first fences its exact current append admission under
  writer exclusion, drains/resolves original pending appends and preserves original receipts; records a cutoff and
  invalidates reader/projection generation authority before ordinary disclosure/advance. A permitted historical-only
  reader must be separately bound to retained exact bytes and current access/deletion fences. Rebuild only after
  a complete admitted replacement source/generation is verified; atomic publication cannot reinterpret old payloads
  or reissue domain work. Source retention/deletion authority remains independent.

  Oracle plan: Plans/event_authority_w3e_oracle_plan.json#families/5 and ATS-1240/ATS-1241. Criterion 12 is PARTIAL:
  phase 1 supplies per-guard positive/negative plans, not oracle code or guard-isolation proof. Membership is ABSENT,
  retention PARTIAL, native execution NOT_RUN. Phase 2 must adopt the reviewed shared number/timestamp helper and
  pm_guard_isolation tool before reviews or admission readiness.


  This family fixes its source authority_evidence roster to writer_fence, permission_or_service_authority, route_source,
  identity_verification, pairing_authority, e2e_verification, transport_result. The owner, never a caller-supplied
  slot list, decides applicability from the exact original phase. writer_fence and permission_or_service_authority
  are always non-null genuine original evidence; other roles may be null only where that original phase has no such
  result. Verify every applicable role independently. No all-true flag, substituted receipt or matching hash supplies
  a missing role.


  Candidate retention classes, not an assignment: Approval/receipt/audit authority/source lineage: indefinite, no
  count eviction (Case L-3, Plans/storage-plan.md:17409). Non-authority security diagnostics or migration/recovery
  operational history: 2555 days, 2000000/project; no W3E application bucket granted (Case L-3, Plans/storage-plan.md:17410).
  Ordinary telemetry: 90 days, 2000000/project; W3E class and application bucket/clock not selected (Case L-3, Plans/storage-plan.md:17414;
  deck 2 1.a..1.g names other populations). The exact audit/diagnostic role and application counting/deletion authority
  remain with Jared. No runtime Run is invented for a BackupRun or RestoreRun.

  '
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-006
- RAS-014
- CV-317
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: ras-1405_w3e_phase1
implementation_surfaces:
- Plans/Remote_Access_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### RAS-1406 - remote_access.route_migration_state_changed prepared owner contract

```yaml
plan_unit_id: RAS-1406
unit_type: contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: 'Newly authored owner contract for remote_access.route_migration_state_changed@1.0.0, prepared without
  admission, authorized only by deck 2 item 9.a A (DL-450). One committed route-migration phase under its original
  migration identity.

  Search at base f9c5de6561dff0a53a48e530f2a5c6804a7e941d: exact literal name across 894 live Plans files found
  only this owner''s candidate list; no family-specific schema, producer/custody/checkpoint/withdrawal definition.
  The recorded per-family evidence is reports/event-authority-20261105/W3E-search.json. Reuse RAS-002, remote_access_system_contracts.schema.json#/$defs/remote_route_migration_record,
  CV-317, CV-339, SP-236, SP-278, SP-286 and SP-337; no sibling supplies a binding.

  Original source_evidence_ref resolves Plans/event_payloads/w3e/remote_access_route_migration_state_changed.schema.json#/$defs/owner_fact,
  a newly authored closed immutable source manifest with original operation/fact IDs, actual Server/scope, complete
  existing-owner before/after records, original result and authority refs, and exact source schema/recipe. This
  object stays in owner-controlled SP-337 custody, not ordinary event bytes. Current source acceptance verifies
  genuine owner issuance and every independently required authority; rehashing a substituted snapshot is insufficient.
  Historical lookup authenticates retained provenance and does not reacquire expired live authority. Payload: Plans/event_payloads/w3e/remote_access_route_migration_state_changed.schema.json,
  logical schema_id pm.event_payload.remote_access.route_migration_state_changed.v1, version 1.0.0. Its closed root
  has required fields schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref,
  source_evidence_ref, migration_id, from_remote_route_id, to_remote_route_id, prior_phase, phase, journal_ref,
  migration_receipt_ref. Only the listed fields are permitted. Current payload/envelope/owner source scope and every
  subject identity must join exactly. This family is application-only with project_id=null. It has no fabricated
  thread/run/node/attempt; out-of-scope EventRecord joins are null. Server ID is actual owner/writer identity, not
  a URL/label, chosen UI context or an observed unverified identity. Use remote_route_migration_record and its phase
  journal, preserving same-Server source/target endpoint/fingerprint, all expected/observed generations and currentness
  joins. Follow planned/preflight/stage/identity/transport checks before preference switch, drain and post-switch
  completion; a failed verification takes the existing rollback/blocked/recovery route. complete requires durable
  same-Server identity and currentness fences plus preserved command idempotency/cursor, switched preference and
  drained old route. Re-observation is not another migration.

  Producer: the sole newly authored RemoteAccessRouteService.migration_phase_commit@1.0.0 method of the existing
  domain owner. It consumes the original accepted owner operation and immutable journal/observation/detection fact,
  never a caller success assertion. Revalidate schema, exact source/current generations, permission and writer lease
  before the existing domain effect; settle the original domain commit/readback and the ref-only canonical pending
  event intent. Before any append, require this family''s exact registry/version/scope and retention admission;
  until then return missing_event_registration and leave existing command expected_event_types=[] and independent
  owner receipts unchanged. No transport action or view refresh becomes an event source.

  For this family adopt SP-286 and CV-339 by name, including current strict full-value v2 resolver and SP-336/SP-347
  issuance rules. After domain source commit, store the exact semantic input and original owner result under SP-1406;
  append the exact EventRecord through CV-317/Case L-5 and SP-236. Resolve first full-value receipt custody before
  marking pending state settled or publishing event-backed terminal history. Use barrier durability where the existing
  authority/approval/outbox contract requires it. A late event refusal never undoes or fabricates an earlier independently
  settled domain action. Crash/retry starts by resolving the original source and pending intent, then the original
  append result; unavailable original evidence is recovery_required/unavailable, not a new operation.

  Identity: owner_operation_id is family-operation@1: plus lowercase SHA-256 of exact UTF-8 bytes "pm.w3e.owner_fact.v1\0"
  + hex(owner_method) + "\0" + hex(original_operation_id) + "\0" + hex(immutable_fact_id). hex is lowercase hexadecimal
  of exact UTF-8 bytes, no normalization; immutable_fact_id is the original accepted phase/journal entry ID, observation
  ID, detection ID or receipt fact, allocated once and durably preserved before use. Multiple facts in one operation
  use distinct original fact IDs, never clock/focus or retry counters. event_id is w3e@1: plus lowercase SHA-256
  of exact UTF-8 bytes "pm.event.remote_access.route_migration_state_changed.identity.v1\0" + scope_partition +
  "\0" + hex(server_id) + "\0" + hex(owner_operation_id). No numeric or timestamp value is serialized by this string-only
  identity recipe.

  Application idempotency_key is exactly CV-366 application@1:{hex(server_id)}:{hex(owner_operation_id)}. The Storage
  scope_partition is app. Adopt CV-317''s exact producer_semantic_digest fields and exclusions; sequence_id, observed_at_utc
  and persisted_at_utc come only from Storage and are excluded from caller semantic comparison. Preserve CV-366
  semantic hashes, SP-236 MessagePack physical bytes, CV-339 full-value bytes and SP-337 BLAKE3 addressing as distinct
  owner domains. Current number/format qualification uses the shared owner rule, never local number/timestamp code
  or a new 2^53 schema cap. An unrepresentable semantic digest route refuses before new event effects without narrowing
  the source schema.

  Idempotency/replay: same selected identity and semantic digest returns the immutable original result and first
  receipt; different semantic digest is idempotency_conflict; missing authoritative dedupe is dedupe_unavailable.
  Current writers/retries reject projector_replay_only as replay_only_not_appendable. Historical originals use their
  authenticated original schema/recipe even after live trust, state, route, source visibility or stricter format
  rules change, subject to current access/deletion/withdrawal checks. No original-provenance fallback to today''s
  recipe. Replay is only filtered derived history; it never dispatches a command, network test, notification, pairing,
  revocation, backup, restore, route activation, billing, timer or canonical write.

  Retention: retention_policy_ref=PENDING_RETENTION_DECISION. Storage Case L-3 is reused for hold/protection machinery,
  not a guessed classification or no-project bucket. Card 1 G26 describes another bounded population; deck 2 1.a..1.g
  adds no W3E counting population. Exact question: For remote_access.route_migration_state_changed, which history
  class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application
  records with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records
  keep their own policies. Until decided, admission remains materially incomplete and no age/count eviction is permitted;
  this hold posture is not an approved lifetime. Original source bodies, receipts and secrets keep their independent
  existing rules. The newly prepared custody/history/checkpoint values inherit this unresolved assignment and cannot
  create a shorter lifetime or bypass dependency holds.

  Redaction/custody: RemoteAccessRouteService on the actual Server holds the original accepted intent, complete
  before/after source, immutable owner result, pending event identity, source schema/recipe provenance and CV-339
  original full-value append result. Events/history expose IDs, closed state codes, public fingerprints and access-checked
  non-secret refs only. No raw secret, password, recovery credential, QR/short code, callback/reusable URL, cookie,
  key, protected-auth browser content, absolute local path or original request content may enter payload, source
  manifest, logs or projection. Source values stay under their owner redaction and authorization; refs grant no
  access. Decode/recompute every source and digest from actual owner-held bytes and check all duplicated identity/currentness
  fields. Coherent BRS-031/033 capture includes pending/terminal custody, immutable source/result payloads, canonical
  EventRecord/commit frame, first receipt/dedupe and deletion/hold fences at one captured point. Do not copy derived
  history/checkpoints; rebuild after verified source restore. A missing member is disclosed, history stays unavailable
  and current effects stay fenced; restore never grants current authority.

  Consumer/checkpoint: newly authored projector.w3e.remote_access_route_migration_state_changed.history@1.0.0 and
  reader.w3e.remote_access_route_migration_state_changed.history@1.0.0 serve Remote Access migration progress/receipt
  Details. They project references to original history only, never recreate live domain authority. This exact family
  adopts SP-278 by name: use reader.storage.event_record_index@1.0.0 with independently complete all-partition coverage,
  then filter exact event_type=remote_access.route_migration_state_changed, actual scope_partition and writer server_id.
  Verify actual source frame, schema, original custody and current read/deletion/withdrawal permission on every
  path. SP-1406 defines physical keys and exact closed values. Commit history rows plus checkpoint in one redb transaction
  with exact prior-value CAS; only proven nonmatches may skip. Persist the nine-field durable generic_read_token
  without redb_snapshot_id; each live read rejoins its own snapshot and verifies all ten live fields. Inclusive
  restart checks original last frame identity/end offset. Empty retained source, nonempty zero-match, stale and
  degraded stay distinct; unsupported/unavailable source never advances. Rebuild derives a fresh shadow generation
  from the actual CURRENT-selected survivors and atomically cuts over under owner maintenance exclusion; no source
  or receipt is repaired.

  Compatibility/withdrawal: no legacy writer or event alias is claimed for this newly authored family. Exact retained
  schema/version/recipe dispatch stays read-only; unknown versions are unavailable and never rewritten. Future changes
  require a versioned owner migration. A family withdrawal first fences its exact current append admission under
  writer exclusion, drains/resolves original pending appends and preserves original receipts; records a cutoff and
  invalidates reader/projection generation authority before ordinary disclosure/advance. A permitted historical-only
  reader must be separately bound to retained exact bytes and current access/deletion fences. Rebuild only after
  a complete admitted replacement source/generation is verified; atomic publication cannot reinterpret old payloads
  or reissue domain work. Source retention/deletion authority remains independent.

  Oracle plan: Plans/event_authority_w3e_oracle_plan.json#families/6 and ATS-1240/ATS-1241. Criterion 12 is PARTIAL:
  phase 1 supplies per-guard positive/negative plans, not oracle code or guard-isolation proof. Membership is ABSENT,
  retention PARTIAL, native execution NOT_RUN. Phase 2 must adopt the reviewed shared number/timestamp helper and
  pm_guard_isolation tool before reviews or admission readiness.


  This family fixes its source authority_evidence roster to writer_fence, permission_or_service_authority, source_route,
  target_route, identity_fence, currentness_fence, phase_journal_entry, commit_or_rollback. The owner, never a caller-supplied
  slot list, decides applicability from the exact original phase. writer_fence and permission_or_service_authority
  are always non-null genuine original evidence; other roles may be null only where that original phase has no such
  result. Verify every applicable role independently. No all-true flag, substituted receipt or matching hash supplies
  a missing role.


  Candidate retention classes, not an assignment: Approval/receipt/audit authority/source lineage: indefinite, no
  count eviction (Case L-3, Plans/storage-plan.md:17409). Non-authority security diagnostics or migration/recovery
  operational history: 2555 days, 2000000/project; no W3E application bucket granted (Case L-3, Plans/storage-plan.md:17410).
  Ordinary telemetry: 90 days, 2000000/project; W3E class and application bucket/clock not selected (Case L-3, Plans/storage-plan.md:17414;
  deck 2 1.a..1.g names other populations). The exact audit/diagnostic role and application counting/deletion authority
  remain with Jared. No runtime Run is invented for a BackupRun or RestoreRun.

  '
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-002
- CV-317
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: ras-1406_w3e_phase1
implementation_surfaces:
- Plans/Remote_Access_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### RAS-1407 - remote_access.route_preference_changed prepared owner contract

```yaml
plan_unit_id: RAS-1407
unit_type: contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: 'Newly authored owner contract for remote_access.route_preference_changed@1.0.0, prepared without
  admission, authorized only by deck 2 item 9.a A (DL-450). One accepted change of preferred route under an explicit
  policy or the existing runtime selection policy.

  Search at base f9c5de6561dff0a53a48e530f2a5c6804a7e941d: exact literal name across 894 live Plans files found
  only this owner''s candidate list; no family-specific schema, producer/custody/checkpoint/withdrawal definition.
  The recorded per-family evidence is reports/event-authority-20261105/W3E-search.json. Reuse RAS-002, remote_access_system_contracts.schema.json#/$defs/remote_route_record,
  CV-317, CV-339, SP-236, SP-278, SP-286 and SP-337; no sibling supplies a binding.

  Original source_evidence_ref resolves Plans/event_payloads/w3e/remote_access_route_preference_changed.schema.json#/$defs/owner_fact,
  a newly authored closed immutable source manifest with original operation/fact IDs, actual Server/scope, complete
  existing-owner before/after records, original result and authority refs, and exact source schema/recipe. This
  object stays in owner-controlled SP-337 custody, not ordinary event bytes. Current source acceptance verifies
  genuine owner issuance and every independently required authority; rehashing a substituted snapshot is insufficient.
  Historical lookup authenticates retained provenance and does not reacquire expired live authority. Payload: Plans/event_payloads/w3e/remote_access_route_preference_changed.schema.json,
  logical schema_id pm.event_payload.remote_access.route_preference_changed.v1, version 1.0.0. Its closed root has
  required fields schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref,
  source_evidence_ref, remote_route_id, previous_route_id, policy_ref, policy_generation, preference_receipt_ref.
  Only the listed fields are permitted. Current payload/envelope/owner source scope and every subject identity must
  join exactly. This family is application-only with project_id=null. It has no fabricated thread/run/node/attempt;
  out-of-scope EventRecord joins are null. Server ID is actual owner/writer identity, not a URL/label, chosen UI
  context or an observed unverified identity. Verify the original preference-switch receipt, old/new route records
  and actual server/endpoint/route generations. An unchanged selection emits nothing. The chosen route satisfies
  RAS-002 policy, health, privacy, network, verified identity and trust predicates; a staged migration cannot publish
  preference early. Preserve runtime ordering loopback/LAN/private/VPN/proxy/Funnel/Remote Link with the owner adaptations;
  this event defines no new preference behavior or settings writer.

  Producer: the sole newly authored RemoteAccessRouteService.preference_commit@1.0.0 method of the existing domain
  owner. It consumes the original accepted owner operation and immutable journal/observation/detection fact, never
  a caller success assertion. Revalidate schema, exact source/current generations, permission and writer lease before
  the existing domain effect; settle the original domain commit/readback and the ref-only canonical pending event
  intent. Before any append, require this family''s exact registry/version/scope and retention admission; until
  then return missing_event_registration and leave existing command expected_event_types=[] and independent owner
  receipts unchanged. No transport action or view refresh becomes an event source.

  For this family adopt SP-286 and CV-339 by name, including current strict full-value v2 resolver and SP-336/SP-347
  issuance rules. After domain source commit, store the exact semantic input and original owner result under SP-1407;
  append the exact EventRecord through CV-317/Case L-5 and SP-236. Resolve first full-value receipt custody before
  marking pending state settled or publishing event-backed terminal history. Use barrier durability where the existing
  authority/approval/outbox contract requires it. A late event refusal never undoes or fabricates an earlier independently
  settled domain action. Crash/retry starts by resolving the original source and pending intent, then the original
  append result; unavailable original evidence is recovery_required/unavailable, not a new operation.

  Identity: owner_operation_id is family-operation@1: plus lowercase SHA-256 of exact UTF-8 bytes "pm.w3e.owner_fact.v1\0"
  + hex(owner_method) + "\0" + hex(original_operation_id) + "\0" + hex(immutable_fact_id). hex is lowercase hexadecimal
  of exact UTF-8 bytes, no normalization; immutable_fact_id is the original accepted phase/journal entry ID, observation
  ID, detection ID or receipt fact, allocated once and durably preserved before use. Multiple facts in one operation
  use distinct original fact IDs, never clock/focus or retry counters. event_id is w3e@1: plus lowercase SHA-256
  of exact UTF-8 bytes "pm.event.remote_access.route_preference_changed.identity.v1\0" + scope_partition + "\0"
  + hex(server_id) + "\0" + hex(owner_operation_id). No numeric or timestamp value is serialized by this string-only
  identity recipe.

  Application idempotency_key is exactly CV-366 application@1:{hex(server_id)}:{hex(owner_operation_id)}. The Storage
  scope_partition is app. Adopt CV-317''s exact producer_semantic_digest fields and exclusions; sequence_id, observed_at_utc
  and persisted_at_utc come only from Storage and are excluded from caller semantic comparison. Preserve CV-366
  semantic hashes, SP-236 MessagePack physical bytes, CV-339 full-value bytes and SP-337 BLAKE3 addressing as distinct
  owner domains. Current number/format qualification uses the shared owner rule, never local number/timestamp code
  or a new 2^53 schema cap. An unrepresentable semantic digest route refuses before new event effects without narrowing
  the source schema.

  Idempotency/replay: same selected identity and semantic digest returns the immutable original result and first
  receipt; different semantic digest is idempotency_conflict; missing authoritative dedupe is dedupe_unavailable.
  Current writers/retries reject projector_replay_only as replay_only_not_appendable. Historical originals use their
  authenticated original schema/recipe even after live trust, state, route, source visibility or stricter format
  rules change, subject to current access/deletion/withdrawal checks. No original-provenance fallback to today''s
  recipe. Replay is only filtered derived history; it never dispatches a command, network test, notification, pairing,
  revocation, backup, restore, route activation, billing, timer or canonical write.

  Retention: retention_policy_ref=PENDING_RETENTION_DECISION. Storage Case L-3 is reused for hold/protection machinery,
  not a guessed classification or no-project bucket. Card 1 G01 describes another bounded population; deck 2 1.a..1.g
  adds no W3E counting population. Exact question: For remote_access.route_preference_changed, which history class,
  expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records
  with no Project? The G01 analogy is not an exact-name grant; existing original receipts and source records keep
  their own policies. Until decided, admission remains materially incomplete and no age/count eviction is permitted;
  this hold posture is not an approved lifetime. Original source bodies, receipts and secrets keep their independent
  existing rules. The newly prepared custody/history/checkpoint values inherit this unresolved assignment and cannot
  create a shorter lifetime or bypass dependency holds.

  Redaction/custody: RemoteAccessRouteService on the actual Server holds the original accepted intent, complete
  before/after source, immutable owner result, pending event identity, source schema/recipe provenance and CV-339
  original full-value append result. Events/history expose IDs, closed state codes, public fingerprints and access-checked
  non-secret refs only. No raw secret, password, recovery credential, QR/short code, callback/reusable URL, cookie,
  key, protected-auth browser content, absolute local path or original request content may enter payload, source
  manifest, logs or projection. Source values stay under their owner redaction and authorization; refs grant no
  access. Decode/recompute every source and digest from actual owner-held bytes and check all duplicated identity/currentness
  fields. Coherent BRS-031/033 capture includes pending/terminal custody, immutable source/result payloads, canonical
  EventRecord/commit frame, first receipt/dedupe and deletion/hold fences at one captured point. Do not copy derived
  history/checkpoints; rebuild after verified source restore. A missing member is disclosed, history stays unavailable
  and current effects stay fenced; restore never grants current authority.

  Consumer/checkpoint: newly authored projector.w3e.remote_access_route_preference_changed.history@1.0.0 and reader.w3e.remote_access_route_preference_changed.history@1.0.0
  serve Remote Access preferred-route and Server connection summary. They project references to original history
  only, never recreate live domain authority. This exact family adopts SP-278 by name: use reader.storage.event_record_index@1.0.0
  with independently complete all-partition coverage, then filter exact event_type=remote_access.route_preference_changed,
  actual scope_partition and writer server_id. Verify actual source frame, schema, original custody and current
  read/deletion/withdrawal permission on every path. SP-1407 defines physical keys and exact closed values. Commit
  history rows plus checkpoint in one redb transaction with exact prior-value CAS; only proven nonmatches may skip.
  Persist the nine-field durable generic_read_token without redb_snapshot_id; each live read rejoins its own snapshot
  and verifies all ten live fields. Inclusive restart checks original last frame identity/end offset. Empty retained
  source, nonempty zero-match, stale and degraded stay distinct; unsupported/unavailable source never advances.
  Rebuild derives a fresh shadow generation from the actual CURRENT-selected survivors and atomically cuts over
  under owner maintenance exclusion; no source or receipt is repaired.

  Compatibility/withdrawal: no legacy writer or event alias is claimed for this newly authored family. Exact retained
  schema/version/recipe dispatch stays read-only; unknown versions are unavailable and never rewritten. Future changes
  require a versioned owner migration. A family withdrawal first fences its exact current append admission under
  writer exclusion, drains/resolves original pending appends and preserves original receipts; records a cutoff and
  invalidates reader/projection generation authority before ordinary disclosure/advance. A permitted historical-only
  reader must be separately bound to retained exact bytes and current access/deletion fences. Rebuild only after
  a complete admitted replacement source/generation is verified; atomic publication cannot reinterpret old payloads
  or reissue domain work. Source retention/deletion authority remains independent.

  Oracle plan: Plans/event_authority_w3e_oracle_plan.json#families/7 and ATS-1240/ATS-1241. Criterion 12 is PARTIAL:
  phase 1 supplies per-guard positive/negative plans, not oracle code or guard-isolation proof. Membership is ABSENT,
  retention PARTIAL, native execution NOT_RUN. Phase 2 must adopt the reviewed shared number/timestamp helper and
  pm_guard_isolation tool before reviews or admission readiness.


  This family fixes its source authority_evidence roster to writer_fence, permission_or_service_authority, previous_route,
  selected_route, route_policy, preference_switch_receipt. The owner, never a caller-supplied slot list, decides
  applicability from the exact original phase. writer_fence and permission_or_service_authority are always non-null
  genuine original evidence; other roles may be null only where that original phase has no such result. Verify every
  applicable role independently. No all-true flag, substituted receipt or matching hash supplies a missing role.


  Candidate retention classes, not an assignment: Approval/receipt/audit authority/source lineage: indefinite, no
  count eviction (Case L-3, Plans/storage-plan.md:17409). Non-authority security diagnostics or migration/recovery
  operational history: 2555 days, 2000000/project; no W3E application bucket granted (Case L-3, Plans/storage-plan.md:17410).
  Ordinary telemetry: 90 days, 2000000/project; W3E class and application bucket/clock not selected (Case L-3, Plans/storage-plan.md:17414;
  deck 2 1.a..1.g names other populations). The exact audit/diagnostic role and application counting/deletion authority
  remain with Jared. No runtime Run is invented for a BackupRun or RestoreRun.

  '
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-002
- CV-317
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: ras-1407_w3e_phase1
implementation_surfaces:
- Plans/Remote_Access_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### RAS-1408 - remote_access.route_state_changed prepared owner contract

```yaml
plan_unit_id: RAS-1408
unit_type: contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: 'Newly authored owner contract for remote_access.route_state_changed@1.0.0, prepared without admission,
  authorized only by deck 2 item 9.a A (DL-450). One committed RemoteRouteRecord state change, not a duplicate sample
  or proof that transport reachability grants trust.

  Search at base f9c5de6561dff0a53a48e530f2a5c6804a7e941d: exact literal name across 894 live Plans files found
  only this owner''s candidate list; no family-specific schema, producer/custody/checkpoint/withdrawal definition.
  The recorded per-family evidence is reports/event-authority-20261105/W3E-search.json. Reuse RAS-002, RAS-004,
  RAS-005, RAS-006, RAS-015, remote_access_system_contracts.schema.json#/$defs/remote_route_record, CV-317, CV-339,
  SP-236, SP-278, SP-286 and SP-337; no sibling supplies a binding.

  Original source_evidence_ref resolves Plans/event_payloads/w3e/remote_access_route_state_changed.schema.json#/$defs/owner_fact,
  a newly authored closed immutable source manifest with original operation/fact IDs, actual Server/scope, complete
  existing-owner before/after records, original result and authority refs, and exact source schema/recipe. This
  object stays in owner-controlled SP-337 custody, not ordinary event bytes. Current source acceptance verifies
  genuine owner issuance and every independently required authority; rehashing a substituted snapshot is insufficient.
  Historical lookup authenticates retained provenance and does not reacquire expired live authority. Payload: Plans/event_payloads/w3e/remote_access_route_state_changed.schema.json,
  logical schema_id pm.event_payload.remote_access.route_state_changed.v1, version 1.0.0. Its closed root has required
  fields schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref, source_evidence_ref,
  remote_route_id, server_endpoint_id, route_type, prior_state, state, route_generation, test_receipt_ref. Only
  the listed fields are permitted. Current payload/envelope/owner source scope and every subject identity must join
  exactly. This family is application-only with project_id=null. It has no fabricated thread/run/node/attempt; out-of-scope
  EventRecord joins are null. Server ID is actual owner/writer identity, not a URL/label, chosen UI context or an
  observed unverified identity. Join the exact route and endpoint to verified Server identity. ready/active need
  current route tests and pairing/auth; public routes also need their exact current policy/preflight/explicit consent,
  hosted-only Funnel and no prohibited surfaces. disabled preserves private routes, identity and running work as
  RAS-004 requires. An unknown transport outcome remains degraded/blocked/recovery_required under the actual owner
  result and never becomes successful by absence of a failure.

  Producer: the sole newly authored RemoteAccessRouteService.route_state_commit@1.0.0 method of the existing domain
  owner. It consumes the original accepted owner operation and immutable journal/observation/detection fact, never
  a caller success assertion. Revalidate schema, exact source/current generations, permission and writer lease before
  the existing domain effect; settle the original domain commit/readback and the ref-only canonical pending event
  intent. Before any append, require this family''s exact registry/version/scope and retention admission; until
  then return missing_event_registration and leave existing command expected_event_types=[] and independent owner
  receipts unchanged. No transport action or view refresh becomes an event source.

  For this family adopt SP-286 and CV-339 by name, including current strict full-value v2 resolver and SP-336/SP-347
  issuance rules. After domain source commit, store the exact semantic input and original owner result under SP-1408;
  append the exact EventRecord through CV-317/Case L-5 and SP-236. Resolve first full-value receipt custody before
  marking pending state settled or publishing event-backed terminal history. Use barrier durability where the existing
  authority/approval/outbox contract requires it. A late event refusal never undoes or fabricates an earlier independently
  settled domain action. Crash/retry starts by resolving the original source and pending intent, then the original
  append result; unavailable original evidence is recovery_required/unavailable, not a new operation.

  Identity: owner_operation_id is family-operation@1: plus lowercase SHA-256 of exact UTF-8 bytes "pm.w3e.owner_fact.v1\0"
  + hex(owner_method) + "\0" + hex(original_operation_id) + "\0" + hex(immutable_fact_id). hex is lowercase hexadecimal
  of exact UTF-8 bytes, no normalization; immutable_fact_id is the original accepted phase/journal entry ID, observation
  ID, detection ID or receipt fact, allocated once and durably preserved before use. Multiple facts in one operation
  use distinct original fact IDs, never clock/focus or retry counters. event_id is w3e@1: plus lowercase SHA-256
  of exact UTF-8 bytes "pm.event.remote_access.route_state_changed.identity.v1\0" + scope_partition + "\0" + hex(server_id)
  + "\0" + hex(owner_operation_id). No numeric or timestamp value is serialized by this string-only identity recipe.

  Application idempotency_key is exactly CV-366 application@1:{hex(server_id)}:{hex(owner_operation_id)}. The Storage
  scope_partition is app. Adopt CV-317''s exact producer_semantic_digest fields and exclusions; sequence_id, observed_at_utc
  and persisted_at_utc come only from Storage and are excluded from caller semantic comparison. Preserve CV-366
  semantic hashes, SP-236 MessagePack physical bytes, CV-339 full-value bytes and SP-337 BLAKE3 addressing as distinct
  owner domains. Current number/format qualification uses the shared owner rule, never local number/timestamp code
  or a new 2^53 schema cap. An unrepresentable semantic digest route refuses before new event effects without narrowing
  the source schema.

  Idempotency/replay: same selected identity and semantic digest returns the immutable original result and first
  receipt; different semantic digest is idempotency_conflict; missing authoritative dedupe is dedupe_unavailable.
  Current writers/retries reject projector_replay_only as replay_only_not_appendable. Historical originals use their
  authenticated original schema/recipe even after live trust, state, route, source visibility or stricter format
  rules change, subject to current access/deletion/withdrawal checks. No original-provenance fallback to today''s
  recipe. Replay is only filtered derived history; it never dispatches a command, network test, notification, pairing,
  revocation, backup, restore, route activation, billing, timer or canonical write.

  Retention: retention_policy_ref=PENDING_RETENTION_DECISION. Storage Case L-3 is reused for hold/protection machinery,
  not a guessed classification or no-project bucket. Card 1 G26 describes another bounded population; deck 2 1.a..1.g
  adds no W3E counting population. Exact question: For remote_access.route_state_changed, which history class, expiry
  anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with
  no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep their
  own policies. Until decided, admission remains materially incomplete and no age/count eviction is permitted; this
  hold posture is not an approved lifetime. Original source bodies, receipts and secrets keep their independent
  existing rules. The newly prepared custody/history/checkpoint values inherit this unresolved assignment and cannot
  create a shorter lifetime or bypass dependency holds.

  Redaction/custody: RemoteAccessRouteService on the actual Server holds the original accepted intent, complete
  before/after source, immutable owner result, pending event identity, source schema/recipe provenance and CV-339
  original full-value append result. Events/history expose IDs, closed state codes, public fingerprints and access-checked
  non-secret refs only. No raw secret, password, recovery credential, QR/short code, callback/reusable URL, cookie,
  key, protected-auth browser content, absolute local path or original request content may enter payload, source
  manifest, logs or projection. Source values stay under their owner redaction and authorization; refs grant no
  access. Decode/recompute every source and digest from actual owner-held bytes and check all duplicated identity/currentness
  fields. Coherent BRS-031/033 capture includes pending/terminal custody, immutable source/result payloads, canonical
  EventRecord/commit frame, first receipt/dedupe and deletion/hold fences at one captured point. Do not copy derived
  history/checkpoints; rebuild after verified source restore. A missing member is disclosed, history stays unavailable
  and current effects stay fenced; restore never grants current authority.

  Consumer/checkpoint: newly authored projector.w3e.remote_access_route_state_changed.history@1.0.0 and reader.w3e.remote_access_route_state_changed.history@1.0.0
  serve Remote Access route list/Details and Server status. They project references to original history only, never
  recreate live domain authority. This exact family adopts SP-278 by name: use reader.storage.event_record_index@1.0.0
  with independently complete all-partition coverage, then filter exact event_type=remote_access.route_state_changed,
  actual scope_partition and writer server_id. Verify actual source frame, schema, original custody and current
  read/deletion/withdrawal permission on every path. SP-1408 defines physical keys and exact closed values. Commit
  history rows plus checkpoint in one redb transaction with exact prior-value CAS; only proven nonmatches may skip.
  Persist the nine-field durable generic_read_token without redb_snapshot_id; each live read rejoins its own snapshot
  and verifies all ten live fields. Inclusive restart checks original last frame identity/end offset. Empty retained
  source, nonempty zero-match, stale and degraded stay distinct; unsupported/unavailable source never advances.
  Rebuild derives a fresh shadow generation from the actual CURRENT-selected survivors and atomically cuts over
  under owner maintenance exclusion; no source or receipt is repaired.

  Compatibility/withdrawal: no legacy writer or event alias is claimed for this newly authored family. Exact retained
  schema/version/recipe dispatch stays read-only; unknown versions are unavailable and never rewritten. Future changes
  require a versioned owner migration. A family withdrawal first fences its exact current append admission under
  writer exclusion, drains/resolves original pending appends and preserves original receipts; records a cutoff and
  invalidates reader/projection generation authority before ordinary disclosure/advance. A permitted historical-only
  reader must be separately bound to retained exact bytes and current access/deletion fences. Rebuild only after
  a complete admitted replacement source/generation is verified; atomic publication cannot reinterpret old payloads
  or reissue domain work. Source retention/deletion authority remains independent.

  Oracle plan: Plans/event_authority_w3e_oracle_plan.json#families/8 and ATS-1240/ATS-1241. Criterion 12 is PARTIAL:
  phase 1 supplies per-guard positive/negative plans, not oracle code or guard-isolation proof. Membership is ABSENT,
  retention PARTIAL, native execution NOT_RUN. Phase 2 must adopt the reviewed shared number/timestamp helper and
  pm_guard_isolation tool before reviews or admission readiness.


  This family fixes its source authority_evidence roster to writer_fence, permission_or_service_authority, endpoint_identity,
  pairing_authority, route_test, public_policy, public_consent, public_preflight. The owner, never a caller-supplied
  slot list, decides applicability from the exact original phase. writer_fence and permission_or_service_authority
  are always non-null genuine original evidence; other roles may be null only where that original phase has no such
  result. Verify every applicable role independently. No all-true flag, substituted receipt or matching hash supplies
  a missing role.


  Candidate retention classes, not an assignment: Approval/receipt/audit authority/source lineage: indefinite, no
  count eviction (Case L-3, Plans/storage-plan.md:17409). Non-authority security diagnostics or migration/recovery
  operational history: 2555 days, 2000000/project; no W3E application bucket granted (Case L-3, Plans/storage-plan.md:17410).
  Ordinary telemetry: 90 days, 2000000/project; W3E class and application bucket/clock not selected (Case L-3, Plans/storage-plan.md:17414;
  deck 2 1.a..1.g names other populations). The exact audit/diagnostic role and application counting/deletion authority
  remain with Jared. No runtime Run is invented for a BackupRun or RestoreRun.

  '
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-002
- RAS-004
- RAS-005
- RAS-006
- RAS-015
- CV-317
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: ras-1408_w3e_phase1
implementation_surfaces:
- Plans/Remote_Access_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### RAS-1409 - remote_access.route_test_completed prepared owner contract

```yaml
plan_unit_id: RAS-1409
unit_type: contract
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: 'Newly authored owner contract for remote_access.route_test_completed@1.0.0, prepared without admission,
  authorized only by deck 2 item 9.a A (DL-450). One terminal route-test result, whether passed, failed, blocked
  or cancelled; test completion is not always success.

  Search at base f9c5de6561dff0a53a48e530f2a5c6804a7e941d: exact literal name across 894 live Plans files found
  only this owner''s candidate list; no family-specific schema, producer/custody/checkpoint/withdrawal definition.
  The recorded per-family evidence is reports/event-authority-20261105/W3E-search.json. Reuse RAS-002, RAS-005,
  RAS-007, remote_access_system_contracts.schema.json#/$defs/remote_access_test_receipt, CV-317, CV-339, SP-236,
  SP-278, SP-286 and SP-337; no sibling supplies a binding.

  Original source_evidence_ref resolves Plans/event_payloads/w3e/remote_access_route_test_completed.schema.json#/$defs/owner_fact,
  a newly authored closed immutable source manifest with original operation/fact IDs, actual Server/scope, complete
  existing-owner before/after records, original result and authority refs, and exact source schema/recipe. This
  object stays in owner-controlled SP-337 custody, not ordinary event bytes. Current source acceptance verifies
  genuine owner issuance and every independently required authority; rehashing a substituted snapshot is insufficient.
  Historical lookup authenticates retained provenance and does not reacquire expired live authority. Payload: Plans/event_payloads/w3e/remote_access_route_test_completed.schema.json,
  logical schema_id pm.event_payload.remote_access.route_test_completed.v1, version 1.0.0. Its closed root has required
  fields schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref, source_evidence_ref,
  receipt_id, remote_route_id, server_endpoint_id, route_type, route_generation, terminal_status, test_receipt_ref.
  Only the listed fields are permitted. Current payload/envelope/owner source scope and every subject identity must
  join exactly. This family is application-only with project_id=null. It has no fabricated thread/run/node/attempt;
  out-of-scope EventRecord joins are null. Server ID is actual owner/writer identity, not a URL/label, chosen UI
  context or an observed unverified identity. Resolve the original RemoteAccessTestReceipt for the actual test invocation
  and exact Server/endpoint/route generations. passed requires identity verified, fingerprints equal, compatible
  protocol, API/WebSocket/stream/file checks passed, no failure refs and applicable public-security checks passed.
  failed/blocked/cancelled preserve non-success and the original failure evidence; a failure oracle must reject
  a substituted success exit/status. A retry of terminal-result delivery neither reruns the network test nor alters
  its outcome.

  Producer: the sole newly authored RemoteAccessRouteService.test_terminal_commit@1.0.0 method of the existing domain
  owner. It consumes the original accepted owner operation and immutable journal/observation/detection fact, never
  a caller success assertion. Revalidate schema, exact source/current generations, permission and writer lease before
  the existing domain effect; settle the original domain commit/readback and the ref-only canonical pending event
  intent. Before any append, require this family''s exact registry/version/scope and retention admission; until
  then return missing_event_registration and leave existing command expected_event_types=[] and independent owner
  receipts unchanged. No transport action or view refresh becomes an event source.

  For this family adopt SP-286 and CV-339 by name, including current strict full-value v2 resolver and SP-336/SP-347
  issuance rules. After domain source commit, store the exact semantic input and original owner result under SP-1409;
  append the exact EventRecord through CV-317/Case L-5 and SP-236. Resolve first full-value receipt custody before
  marking pending state settled or publishing event-backed terminal history. Use barrier durability where the existing
  authority/approval/outbox contract requires it. A late event refusal never undoes or fabricates an earlier independently
  settled domain action. Crash/retry starts by resolving the original source and pending intent, then the original
  append result; unavailable original evidence is recovery_required/unavailable, not a new operation.

  Identity: owner_operation_id is family-operation@1: plus lowercase SHA-256 of exact UTF-8 bytes "pm.w3e.owner_fact.v1\0"
  + hex(owner_method) + "\0" + hex(original_operation_id) + "\0" + hex(immutable_fact_id). hex is lowercase hexadecimal
  of exact UTF-8 bytes, no normalization; immutable_fact_id is the original accepted phase/journal entry ID, observation
  ID, detection ID or receipt fact, allocated once and durably preserved before use. Multiple facts in one operation
  use distinct original fact IDs, never clock/focus or retry counters. event_id is w3e@1: plus lowercase SHA-256
  of exact UTF-8 bytes "pm.event.remote_access.route_test_completed.identity.v1\0" + scope_partition + "\0" + hex(server_id)
  + "\0" + hex(owner_operation_id). No numeric or timestamp value is serialized by this string-only identity recipe.

  Application idempotency_key is exactly CV-366 application@1:{hex(server_id)}:{hex(owner_operation_id)}. The Storage
  scope_partition is app. Adopt CV-317''s exact producer_semantic_digest fields and exclusions; sequence_id, observed_at_utc
  and persisted_at_utc come only from Storage and are excluded from caller semantic comparison. Preserve CV-366
  semantic hashes, SP-236 MessagePack physical bytes, CV-339 full-value bytes and SP-337 BLAKE3 addressing as distinct
  owner domains. Current number/format qualification uses the shared owner rule, never local number/timestamp code
  or a new 2^53 schema cap. An unrepresentable semantic digest route refuses before new event effects without narrowing
  the source schema.

  Idempotency/replay: same selected identity and semantic digest returns the immutable original result and first
  receipt; different semantic digest is idempotency_conflict; missing authoritative dedupe is dedupe_unavailable.
  Current writers/retries reject projector_replay_only as replay_only_not_appendable. Historical originals use their
  authenticated original schema/recipe even after live trust, state, route, source visibility or stricter format
  rules change, subject to current access/deletion/withdrawal checks. No original-provenance fallback to today''s
  recipe. Replay is only filtered derived history; it never dispatches a command, network test, notification, pairing,
  revocation, backup, restore, route activation, billing, timer or canonical write.

  Retention: retention_policy_ref=PENDING_RETENTION_DECISION. Storage Case L-3 is reused for hold/protection machinery,
  not a guessed classification or no-project bucket. Card 1 G26 describes another bounded population; deck 2 1.a..1.g
  adds no W3E counting population. Exact question: For remote_access.route_test_completed, which history class,
  expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records
  with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep
  their own policies. Until decided, admission remains materially incomplete and no age/count eviction is permitted;
  this hold posture is not an approved lifetime. Original source bodies, receipts and secrets keep their independent
  existing rules. The newly prepared custody/history/checkpoint values inherit this unresolved assignment and cannot
  create a shorter lifetime or bypass dependency holds.

  Redaction/custody: RemoteAccessRouteService on the actual Server holds the original accepted intent, complete
  before/after source, immutable owner result, pending event identity, source schema/recipe provenance and CV-339
  original full-value append result. Events/history expose IDs, closed state codes, public fingerprints and access-checked
  non-secret refs only. No raw secret, password, recovery credential, QR/short code, callback/reusable URL, cookie,
  key, protected-auth browser content, absolute local path or original request content may enter payload, source
  manifest, logs or projection. Source values stay under their owner redaction and authorization; refs grant no
  access. Decode/recompute every source and digest from actual owner-held bytes and check all duplicated identity/currentness
  fields. Coherent BRS-031/033 capture includes pending/terminal custody, immutable source/result payloads, canonical
  EventRecord/commit frame, first receipt/dedupe and deletion/hold fences at one captured point. Do not copy derived
  history/checkpoints; rebuild after verified source restore. A missing member is disclosed, history stays unavailable
  and current effects stay fenced; restore never grants current authority.

  Consumer/checkpoint: newly authored projector.w3e.remote_access_route_test_completed.history@1.0.0 and reader.w3e.remote_access_route_test_completed.history@1.0.0
  serve Remote Access Test result/Doctor and route Details. They project references to original history only, never
  recreate live domain authority. This exact family adopts SP-278 by name: use reader.storage.event_record_index@1.0.0
  with independently complete all-partition coverage, then filter exact event_type=remote_access.route_test_completed,
  actual scope_partition and writer server_id. Verify actual source frame, schema, original custody and current
  read/deletion/withdrawal permission on every path. SP-1409 defines physical keys and exact closed values. Commit
  history rows plus checkpoint in one redb transaction with exact prior-value CAS; only proven nonmatches may skip.
  Persist the nine-field durable generic_read_token without redb_snapshot_id; each live read rejoins its own snapshot
  and verifies all ten live fields. Inclusive restart checks original last frame identity/end offset. Empty retained
  source, nonempty zero-match, stale and degraded stay distinct; unsupported/unavailable source never advances.
  Rebuild derives a fresh shadow generation from the actual CURRENT-selected survivors and atomically cuts over
  under owner maintenance exclusion; no source or receipt is repaired.

  Compatibility/withdrawal: no legacy writer or event alias is claimed for this newly authored family. Exact retained
  schema/version/recipe dispatch stays read-only; unknown versions are unavailable and never rewritten. Future changes
  require a versioned owner migration. A family withdrawal first fences its exact current append admission under
  writer exclusion, drains/resolves original pending appends and preserves original receipts; records a cutoff and
  invalidates reader/projection generation authority before ordinary disclosure/advance. A permitted historical-only
  reader must be separately bound to retained exact bytes and current access/deletion fences. Rebuild only after
  a complete admitted replacement source/generation is verified; atomic publication cannot reinterpret old payloads
  or reissue domain work. Source retention/deletion authority remains independent.

  Oracle plan: Plans/event_authority_w3e_oracle_plan.json#families/9 and ATS-1240/ATS-1241. Criterion 12 is PARTIAL:
  phase 1 supplies per-guard positive/negative plans, not oracle code or guard-isolation proof. Membership is ABSENT,
  retention PARTIAL, native execution NOT_RUN. Phase 2 must adopt the reviewed shared number/timestamp helper and
  pm_guard_isolation tool before reviews or admission readiness.


  This family fixes its source authority_evidence roster to writer_fence, permission_or_service_authority, test_invocation,
  test_receipt, identity_material, public_security_result. The owner, never a caller-supplied slot list, decides
  applicability from the exact original phase. writer_fence and permission_or_service_authority are always non-null
  genuine original evidence; other roles may be null only where that original phase has no such result. Verify every
  applicable role independently. No all-true flag, substituted receipt or matching hash supplies a missing role.


  Candidate retention classes, not an assignment: Approval/receipt/audit authority/source lineage: indefinite, no
  count eviction (Case L-3, Plans/storage-plan.md:17409). Non-authority security diagnostics or migration/recovery
  operational history: 2555 days, 2000000/project; no W3E application bucket granted (Case L-3, Plans/storage-plan.md:17410).
  Ordinary telemetry: 90 days, 2000000/project; W3E class and application bucket/clock not selected (Case L-3, Plans/storage-plan.md:17414;
  deck 2 1.a..1.g names other populations). The exact audit/diagnostic role and application counting/deletion authority
  remain with Jared. No runtime Run is invented for a BackupRun or RestoreRun.

  '
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-002
- RAS-005
- RAS-007
- CV-317
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: ras-1409_w3e_phase1
implementation_surfaces:
- Plans/Remote_Access_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

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

When consumed by Product Onboarding, the Remote Access owner projection keeps `Tailscale`, `Custom Domain / Caddy / NGINX / Traefik`, `Puppet Master Remote Link`, and `Existing VPN / Private Network` reachable behind the current Onboarding progressive disclosure and renders one clear visible `Skip`. Activating `Skip` dispatches no `cmd.remote_access.*` command, enables no route or public exposure, preserves Server and trust state, and returns the exact stage, revision, continuation generation, and initiating focus. Browser refresh, route return, or stale callback cannot reinterpret `Skip` as setup completion.

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
  Connecting this Client to an existing Puppet Master selects the route before discovery, Server identification,
  and pairing. Before Review, Local or VPN may perform owner-bounded read-only discovery across LAN interfaces
  and any VPN this device is already connected to, with no VPN switch, because the person turns a VPN on or off
  on their own device; hosted Tailscale may reuse current component/session/tailnet and peer projections without
  signing in; every route may consume cached known-endpoint data. Headscale control URL, reverse-proxy HTTPS URL,
  Remote Link/QR/short code, and manual identity/address entry remain local draft inputs in this phase. Review/Apply
  confirms route mutation, endpoint add/test, Server identity acceptance, PM pairing/trust and Remote Link open.
  Separately, an explicit Sign in action may authorize this native Client’s selected built-in Tailscale/Headscale
  connection before its Server list, through the protected auth and connector owners; cached discovery itself
  never starts sign-in. No other pre-Review mutation is admitted. Manual identity/address entry appears only when
  safe discovery cannot return the intended Server. DL-259, Jared 2026-10-31: D2 A: explicit always-on Server
  setup on this computer, manual private HTTPS, a self-hosted Remote Link gateway, rarer SSH key types, China-region
  AI variants and local AI servers live in Settings, with a clear context-correct pointer from onboarding. The
  ordinary This computer choice remains the easy local-work default. The wizard says AI accounts available in
  this setup, not every AI. Existing Settings routes and owners retain the advanced capabilities. D7 B supersedes
  the former no-per-Client-node restriction. Native Puppet Master apps on Windows, macOS and Linux have their
  own built-in Tailscale connection and sign in once through the shared protected auth owner, with no separate
  Tailscale app install. The same signed PM-owned Go tsnet helper is supervised by its owning PM process. A Server
  keeps one active node per stable server_id; a native Client installation keeps one active node per stable client_id,
  independent of Projects, windows, tabs, sessions and Server endpoint selection. Owner-qualified configuration,
  process, IPC, authorization, egress and secure-state references prevent identity/key sharing or duplicate active
  nodes. Native Client nodes provide bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying
  or a Server public listener. Server nodes retain the automatic private listener; Funnel remains Server-only,
  explicit, off by default and unavailable on Headscale. Human approval and reusable connection identity do not
  grant PM pairing/trust or work permission. A plain browser tab has no embedded Tailscale connection: it needs
  Remote Link or a private endpoint reachable through the device’s own Tailscale connection. It cannot be enrolled
  by a browser sign-in. Existing user-managed host Tailscale stays external and unmanaged. DL-259 REMOTE-CODE-1
  A, Jared 2026-10-31: the Remote Link owner issues and checks its protected HTTPS link or opaque short code.
  Decide the actual code grammar, normalization/case behavior, expiry/abuse policy and raw-code resolution protocol
  immediately before building PM, alongside D4’s pre-build checks; no grammar or sample code is pinned in canon.
  Preserve the owner-defined representation, reject empty input, and treat nonblank text as unverified draft rather
  than identity, pairing or Ready proof. After Review, the trusted owner validates/resolves it before the existing
  open and Server identity/pairing continuation. Unknown, expired or unresolvable input fails closed without another-Server
  fallback. This accepted pre-build verification point is not an unanswered product choice or a wizard caveat.


  DL-272 RV-3, 2026-11-01: A native Client explicitly signs in once to its selected Tailscale or Headscale through
  the protected auth owner before Connect lists Servers on that network; reuse a current owner-verified sign-in.
  Network choice, Client identity and generation fence the return. This grants neither PM pairing nor a Server
  listener.


  DL-272 M10-REMOTE-LINK, 2026-11-01: A newly issued Remote Link is shown with its owner-issued short code and
  QR, with copy actions for its output. This adds no code alphabet, length, normalization or expiry rule; REMOTE-CODE-1
  remains the pre-build authority.


  DL-272 REMOTE-LINK-ERROR, 2026-11-01: Remote Link input guidance and refusal refer to a link or code, not a
  generic web address. Nonblank draft text is still unverified until the Remote Link owner resolves it. For No
  project, the work Computer is the native device's already claimed/bootstrapped local Server when available;
  otherwise the person's main Computer. Always name that actual work Computer on phone/web. A device without a
  claimed local Server offers Set up Puppet Master here through protected claim/bootstrap rather than silently
  using dormant capability. Work Computer can change before first message only; afterwards use the chat owner's
  linked Continue elsewhere or conversion.
gui_related: true
gui_classification_reason: Defines the route chooser, discovery order, conditional fields, pairing handoff, manual fallback, and setup-later state consumed by Product Onboarding.
depends_on: [RAS-001, RAS-003, RAS-005, RAS-006, SRV-004]
unblocks: [PWIZ-024]
acceptance_criteria:
- The connect-existing chooser separates `Local or VPN` from the three remote route families and never places a generic
  Find one I already use step before route selection; Tailscale then selects hosted Tailscale or Headscale as its control-plane
  variant.
- After route selection and before Review, Local or VPN may run owner-bounded read-only LAN discovery; it also covers
  any VPN this device is already connected to, without a switch, and the line `You can connect through a VPN too` says
  so; it never asks for a private address by default, installs/configures no VPN, and reveals manual Server name/address
  only when safe discovery cannot find the intended target.
- Hosted Tailscale reuses current owner-verified native-Client authorization. A missing/expired session offers one explicit
  protected Sign in before its Server list; completing it grants no PM trust or route mutation.
- Headscale validates the selected control URL, then the native Client explicitly signs in to that control server through
  its protected owner before authenticated Server listing. It never substitutes hosted-Tailscale account sign-in; endpoint
  mutation, PM identity acceptance and pairing still wait for Review.
- Existing-client Reverse proxy asks only for the existing protected HTTPS Puppet Master URL and the chosen pairing method;
  proxy kind, hosting and certificate belong only to new-Server/configuration setup; generation offers Caddy, NGINX and
  Traefik, while Nginx Proxy Manager is existing-only (DL-259 D3 A).
- Puppet Master Remote Link is never hidden behind More ways; it accepts the link, scanned QR payload, or short code
  shown by the existing Puppet Master and then uses Server-owned pairing.
- Read-only discovery may project candidate endpoints, but after Review/Apply every route must verify and resolve one
  exact existing `server_id` before pairing by approval, code, or QR; route possession, reachability, a device label,
  or a visible recognition checkbox never grants trust.
- Before Review, only owner-bounded read-only discovery, PWIZ-021 selected-source auth and the explicit native-Client
  connection sign-in of DL-272 RV-3 are admitted. No concealed login, public listener, endpoint mutation, PM trust grant,
  recovery or Project mutation is permitted.
- Guided setup may choose `Not now`; connect-existing may defer and resume the session, but it cannot report connection
  Ready when no reviewed route can reach and pair the existing Server.
- 'DL-259, Jared 2026-10-31: D2 A: explicit always-on Server setup on this computer, manual private HTTPS, a self-hosted
  Remote Link gateway, rarer SSH key types, China-region AI variants and local AI servers live in Settings, with a clear
  context-correct pointer from onboarding. The ordinary This computer choice remains the easy local-work default. The
  wizard says AI accounts available in this setup, not every AI. Existing Settings routes and owners retain the advanced
  capabilities. D7 B supersedes the former no-per-Client-node restriction. Native Puppet Master apps on Windows, macOS
  and Linux have their own built-in Tailscale connection and sign in once through the shared protected auth owner, with
  no separate Tailscale app install. The same signed PM-owned Go tsnet helper is supervised by its owning PM process.
  A Server keeps one active node per stable server_id; a native Client installation keeps one active node per stable
  client_id, independent of Projects, windows, tabs, sessions and Server endpoint selection. Owner-qualified configuration,
  process, IPC, authorization, egress and secure-state references prevent identity/key sharing or duplicate active nodes.
  Native Client nodes provide bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying or a Server
  public listener. Server nodes retain the automatic private listener; Funnel remains Server-only, explicit, off by default
  and unavailable on Headscale. Human approval and reusable connection identity do not grant PM pairing/trust or work
  permission. A plain browser tab has no embedded Tailscale connection: it needs Remote Link or a private endpoint reachable
  through the device’s own Tailscale connection. It cannot be enrolled by a browser sign-in. Existing user-managed host
  Tailscale stays external and unmanaged.'
- 'DL-259 REMOTE-CODE-1 A, Jared 2026-10-31: the Remote Link owner issues and checks its protected HTTPS link or opaque
  short code. Decide the actual code grammar, normalization/case behavior, expiry/abuse policy and raw-code resolution
  protocol immediately before building PM, alongside D4’s pre-build checks; no grammar or sample code is pinned in canon.
  Preserve the owner-defined representation, reject empty input, and treat nonblank text as unverified draft rather than
  identity, pairing or Ready proof. After Review, the trusted owner validates/resolves it before the existing open and
  Server identity/pairing continuation. Unknown, expired or unresolvable input fails closed without another-Server fallback.
  This accepted pre-build verification point is not an unanswered product choice or a wizard caveat.'
- 'DL-272 RV-3, 2026-11-01: A native Client explicitly signs in once to its selected Tailscale or Headscale through the
  protected auth owner before Connect lists Servers on that network; reuse a current owner-verified sign-in. Network
  choice, Client identity and generation fence the return. This grants neither PM pairing nor a Server listener.'
- 'DL-272 M10-REMOTE-LINK, 2026-11-01: A newly issued Remote Link is shown with its owner-issued short code and QR, with
  copy actions for its output. This adds no code alphabet, length, normalization or expiry rule; REMOTE-CODE-1 remains
  the pre-build authority.'
- 'DL-272 REMOTE-LINK-ERROR, 2026-11-01: Remote Link input guidance and refusal refer to a link or code, not a generic
  web address. Nonblank draft text is still unverified until the Remote Link owner resolves it.'
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Plans/remote_access_system_contract_fixtures.json, future route-first LAN/VPN/Tailscale/Headscale/proxy/Remote-Link owner fixtures]
risk_class: connect_existing_route_order_or_trust_conflation
reasoning_tier: high
context_scope: onboarding_connect_existing_remote_access
implementation_surfaces: [Plans/Remote_Access_System.md, future Remote Access route service, future Product Onboarding owner adapter]
node_compile_hint: {mode: remote_access_onboarding_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- user-correction:2026-09-01-connect-existing-route-semantics
- user-instruction:2026-09-25-no-vpn-switch
- Plans/product_onboarding_contracts.schema.json
- Concepts/pm7-tools/onboarding_cinematic_source.py
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md (Owner questions, Jared 2026-10-31;
  DL-259)
- DL-272 footage review; integration 7d2dd568be76874ff8b4d3e82bad3701226d248c; lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01.
  Source spellings are lineage, not product API.
- 'source_ref:projects-pass2-20261103:N5/N15/N17; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: [Local or VPN, You can connect through a VPN too, Tailscale, Headscale, Reverse proxy, Puppet Master Remote Link, approval, code, QR]
negative_constraints:
- Do not mutate a route or PM trust before Review; only the named explicit preflight/auth exceptions are admitted.
- Do not conceal login/enrollment in discovery or infer route/trust consent from the explicit native-Client sign-in.
- Do not require a private VPN address when local-style discovery works.
- Do not show a switch for VPN discovery; turning a VPN on or off belongs to the person's own device.
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
  embedding `tailscale.com/tsnet`, supervised as a crash-isolated sibling of its owning Rust Server or native
  Client through authenticated, versioned, peer-validated local IPC. Exactly one active persistent connector identity
  belongs to each Server or native Client installation, scoped by its owner role and stable server_id or client_id;
  none belongs to an individual Project, Goal, WSL distribution, environment, runner, browser tab, Pod replica
  or session. Hosted Tailscale and user-supplied Headscale remain supported. Each Server’s private PM endpoint
  is a connector listener/reverse proxy that starts automatically after approved enrollment and PM ingress validation,
  independent from Funnel and without a normal Serve control. Hosted Funnel alone is explicit public ingress,
  off by default, consent- and preflight-gated, implemented through the pinned connector listener adapter, and
  unavailable on Headscale. A user-managed host Tailscale installation may coexist only as an external verified
  private endpoint; PM never adopts, inspects, changes, signs out, stops, or updates it. Ordinary copy is exactly
  `Tailscale` and `Built into Puppet Master`; connector and tsnet details are Advanced-only. The owning Server
  or native Client durably owns its authorization work and redacted URL-ready/handoff state across refresh, initiating-Client
  disconnect, and Client change. Protected URL contents, cookies, and browser state may be opened only on a current
  authorized Client with operation, generation, session, and return-context fences; another Client must establish
  a new authorized handoff and inherits no protected content. Native PM may use a bounded connector Dial/stream
  path only to approved PM endpoints; it is never an open SOCKS proxy or LAN pivot, and a plain browser needs
  Remote Link or a private endpoint reachable through the device’s own Tailscale connection. Static Plans/schema/fixtures
  remain runtime-unproven and admit no EventRecord family. DL-259, Jared 2026-10-31: D7 B supersedes the former
  no-per-Client-node restriction. Native Puppet Master apps on Windows, macOS and Linux have their own built-in
  Tailscale connection and sign in once through the shared protected auth owner, with no separate Tailscale app
  install. The same signed PM-owned Go tsnet helper is supervised by its owning PM process. A Server keeps one
  active node per stable server_id; a native Client installation keeps one active node per stable client_id, independent
  of Projects, windows, tabs, sessions and Server endpoint selection. Owner-qualified configuration, process,
  IPC, authorization, egress and secure-state references prevent identity/key sharing or duplicate active nodes.
  Native Client nodes provide bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying
  or a Server public listener. Server nodes retain the automatic private listener; Funnel remains Server-only,
  explicit, off by default and unavailable on Headscale. Human approval and reusable connection identity do not
  grant PM pairing/trust or work permission. A plain browser tab has no embedded Tailscale connection: it needs
  Remote Link or a private endpoint reachable through the device’s own Tailscale connection. It cannot be enrolled
  by a browser sign-in. Existing user-managed host Tailscale stays external and unmanaged. DL-259 D7 B, Jared
  2026-10-31: the existing Tailscale connector commands serve either their Server owner or the initiating native
  Client’s local connector. Request, result, error, availability, permission, IPC and receipt preserve connector_owner,
  owner_client_id and the native installation reference. Native ownership has no owner server_id; client/connector/policy/session
  generations replace Server/endpoint/route/trust generations for that local operation. The native owner must
  equal the initiating Client; cross-owner returns fail closed. Server-owned records and compatibility aliases
  retain their prior fences. Native Settings, onboarding and Doctor reuse the same handlers and command IDs; they
  grant neither Server listeners/Funnel nor pairing/trust/work authority. Browser tabs cannot select native ownership.
  All routes remain handler_unavailable until executable evidence exists. Computer-level Settings values are attributes
  of an actual Server/Execution Host, not connector ownership or per-Project/per-Environment nodes. The native
  Client and its own local Server can share one Computer display name via ClientRecord.local_server_id while retaining
  their distinct D7 B connector owners. settings.follow authorizes only settings replication and never expands
  the bounded Dial/stream path or grants cross-Project reads.
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
- The helper is a PM core artifact with pinned Go/tsnet/module graph, licenses/notices, SBOM, source revision, build
  provenance, architecture/build ID, compatible IPC range, and coherent PM release/update/rollback/state migration; it
  is not a second updater or provider CLI.
- Windows uses a signed native helper without WSL, service, driver, TUN, or elevation; macOS uses a signed/notarized
  helper without app/system extension/VPN profile; Linux requires no root, daemon, TUN, route-table, NetworkManager,
  or DNS mutation.
- Docker/TrueNAS/Unraid contain and supervise the helper in the canonical PM image/data volume without an official Tailscale
  sidecar, `/dev/net/tun`, `NET_ADMIN`, privileged or host networking; Kubernetes uses the same PM artifact with persistent
  state and a lease/leader one-active guard, never a required Tailscale operator or per-replica node.
- The `TailscaleConnectorConfiguration` record binds `server_id`, `connector_id`, hosted-Tailscale or Headscale control
  kind, redacted origin ref, secure-state ref, connector/state/build/IPC versions, expected/current revisions, and one-active
  binding without ingesting host-Tailscale state.
- The closed connector state machine is disabled, starting, needs_login, authorization_url_ready, waiting_for_authorization,
  needs_device_approval, connected, private_endpoint_starting, private_endpoint_ready, funnel_preflight, funnel_starting,
  funnel_ready, reauth_required, backing_off, needs_attention, stopping, or failed; process/protocol/backoff, auth, private
  endpoint, Funnel, and PM application health remain separately projected.
- Local IPC authenticates and validates its peer, versions every envelope, binds request/deadline/cancellation/idempotency
  and connector generation, returns typed errors, is least-privilege and redacted, and exposes no public management API
  or general LocalAPI.
- Hosted authorization persists only owner-qualified Server or native Client operation/session refs and redacted URL-ready
  metadata; no reusable URL is durable, a lost or replacement Client never inherits protected content, and a current
  authorized Client can resume the same current operation through a newly authorized handoff.
- Headscale accepts a normalized user HTTPS control URL plus interactive approval or one-time pre-auth enrollment, exposes
  typed compatibility/TLS/DNS/certificate/registration results, supports the private endpoint independently, and never
  exposes or promises Funnel.
- Private and public listeners use a pinned tested compatible arrangement; `FunnelOnly` is not the private default, public
  disable preserves private/LAN/proxy/Remote-Link/Server/Goal state, and ingress class comes from trusted connector metadata
  rather than request-controlled forwarding headers.
- Native connector egress is allowlisted to verified PM endpoints with bounded Dial/stream semantics; it cannot become
  an arbitrary destination proxy, LAN pivot, or browser enrollment mechanism.
- External user-managed host-Tailscale endpoints and connector-private/Funnel routes are independently proven and deduplicated
  beneath one verified `server_id`; PM never labels or manages an external route as `Built into Puppet Master`.
- Raw tsnet state, node/auth/pre-auth keys, reusable authorization URLs, query strings, IPC secrets, cookies, and unredacted
  Headscale credentials exist only in the owning Server or native Client secure-state boundary and never in ordinary
  redb/seglog projections, Events, Vaults, Settings, logs, Chat, Usage, screenshots, or concepts.
- Project backup/copy/move/source-inclusive capture always excludes connector state; portable Full Server backup excludes
  it by default; optional inclusion remains unavailable until portability and single-active collision safety are proven;
  a foreign/new-Server restore creates a new connector identity and re-pairs, while same-host rollback may recover an
  old identity only after exclusive fencing proves no live copy.
- Tailnet login never unlocks backup, cloud/forge credentials never become node identity, backup traffic never defaults
  through PM relay/Remote Link, and restore never auto-enables Funnel, resumes Goals, pushes source, replays webhooks,
  or duplicates writer/node identity.
- RuntimeResourceGovernor bounds start/auth/test/reconnect/log work, ObservableWork carries progress, and operation/currentness/idempotency
  fences prevent connector reconnect or rollback from duplicating push, merge, backup, prune, restore, webhook, command,
  writer, or node effects.
- The only new primaries are `cmd.remote_access.tailscale.connector.check`, `cmd.remote_access.tailscale.connector.restart`,
  and `cmd.remote_access.tailscale.identity.reset`, with sole future handlers `handlers::remote_access::tailscale_connector_check`,
  `handlers::remote_access::tailscale_connector_restart`, and `handlers::remote_access::tailscale_identity_reset`; reset
  is destructive, step-up/current-preview/confirmation/disclosure protected, and distinct from disable/sign-out.
- The IDs `cmd.remote_access.tailscale.component.check`, `cmd.remote_access.tailscale.serve.enable`, `cmd.remote_access.tailscale.serve.test`,
  and `cmd.remote_access.tailscale.serve.disable` are non-discoverable pre-policy compatibility inputs only. They normalize
  respectively to connector check, idempotent setup/ensure-private-endpoint, private endpoint test, and private-connector-route
  disable, preserve invoked/serialized identity only in receipts, invoke no CLI, and have no peer handler, availability,
  event, lifecycle, or production row.
- The active owner census is 44 primaries and 8 aliases when no concurrent central change alters it; central owners must
  recompute denominators rather than treating this planning count as generated authority. All primaries remain `handler_unavailable`
  with `expected_event_types=[]` until central/native/Event Authority evidence exists.
- Required owner receipts bind Server/connector/endpoint/route IDs, connector/IPC/tsnet/build provenance, control kind/redacted
  origin, requested/effective operation and route, before/after revision, initiating Client/approval/consent, PM identity
  result, public/private class, ObservableWork, bounded remediation, invoked compatibility ID, timestamps/freshness,
  and explicit redaction/exclusion facts.
- Candidate connector process/protocol/state, authorization/device-approval, connected/reauth/sign-out, Headscale configuration/registration,
  private endpoint, Funnel, route-health, and identity-reset event families remain non-emitting until individually admitted
  by Event Authority with payload, producer, retention, redaction, and consumers.
- No `cmd.tsnet.*`, second connector owner, second shared supervisor/governor/work system, backend selector, tailscale-rs,
  or Tailcat is introduced.
- 'DL-259, Jared 2026-10-31: D7 B supersedes the former no-per-Client-node restriction. Native Puppet Master apps on
  Windows, macOS and Linux have their own built-in Tailscale connection and sign in once through the shared protected
  auth owner, with no separate Tailscale app install. The same signed PM-owned Go tsnet helper is supervised by its owning
  PM process. A Server keeps one active node per stable server_id; a native Client installation keeps one active node
  per stable client_id, independent of Projects, windows, tabs, sessions and Server endpoint selection. Owner-qualified
  configuration, process, IPC, authorization, egress and secure-state references prevent identity/key sharing or duplicate
  active nodes. Native Client nodes provide bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying
  or a Server public listener. Server nodes retain the automatic private listener; Funnel remains Server-only, explicit,
  off by default and unavailable on Headscale. Human approval and reusable connection identity do not grant PM pairing/trust
  or work permission. A plain browser tab has no embedded Tailscale connection: it needs Remote Link or a private endpoint
  reachable through the device’s own Tailscale connection. It cannot be enrolled by a browser sign-in. Existing user-managed
  host Tailscale stays external and unmanaged.'
- 'DL-259 D7 B, Jared 2026-10-31: the existing Tailscale connector commands serve either their Server owner or the initiating
  native Client’s local connector. Request, result, error, availability, permission, IPC and receipt preserve connector_owner,
  owner_client_id and the native installation reference. Native ownership has no owner server_id; client/connector/policy/session
  generations replace Server/endpoint/route/trust generations for that local operation. The native owner must equal the
  initiating Client; cross-owner returns fail closed. Server-owned records and compatibility aliases retain their prior
  fences. Native Settings, onboarding and Doctor reuse the same handlers and command IDs; they grant neither Server listeners/Funnel
  nor pairing/trust/work authority. Browser tabs cannot select native ownership. All routes remain handler_unavailable
  until executable evidence exists.'
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
- 'source_ref:projects-pass2-20261103:S1/S7/N17; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
- Do not bundle, install, manage, probe, or update the full Tailscale app, service, daemon, general CLI, installer, system
  extension, VPN profile, TUN driver, full sidecar, or operator for the built-in route.
- Do not invoke `tailscale up`, `tailscale serve`, `tailscale funnel`, or `tailscale update` as the canonical implementation.
- Do not adopt, inspect, sign out, stop, reconfigure, or update a user's host Tailscale installation.
- Do not create a node per Project, WSL distribution, environment, runner, replica, browser tab, Goal or session; native
  Client installation ownership is required by D7 B.
- Do not expose Serve, tsnet, daemon, sidecar, installed-app, or backend-picker language in ordinary UI.
- Do not persist or project connector secret material outside its owning Server/native Client secure-state boundary.
- Do not infer PM authorization, pairing, backup access, identity, runtime success, readiness, or certification from
  tailnet membership or static schema/fixture validation.
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

### RAS-016 - Compressed Remote Streams

```yaml
plan_unit_id: RAS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Remote_Access_System.md
canonical_text: >-
  DL-270 card 10. PM's own remote clients negotiate a zstd stream for event and transcript traffic at level 3 with
  a 1 MiB window; plain browsers fall back to brotli or permessage-deflate; the in-app UI uses no compression.
  Negotiation never changes what is authenticated, authorized or exposed under RAS-015 and the existing route
  rules. Compression applies to plaintext before end-to-end encryption, never to ciphertext, and a stream that
  mixes secrets with content an outside party can influence is not compressed, so sizes cannot leak secrets.
  Measured: zstd compressed 4.53 times at 162 MB/s, against permessage-deflate's 3.62 times at 31 MB/s, the scheme
  T3 Code uses.
gui_related: false
gui_classification_reason: "Transport encoding only; no visible surface."
split_recommended: false
depends_on: [RAS-015]
unblocks: []
acceptance_criteria:
  - "A PM client and server that both support zstd use it at level 3 with a 1 MiB window."
  - "A browser without zstd support still connects, using brotli or permessage-deflate."
  - "Compression negotiation adds no route, credential or exposure, no ciphertext is compressed, and secret-bearing streams with outside-influenced content stay uncompressed."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: remote_bandwidth_and_latency
reasoning_tier: high
context_scope: dl270_transport
implementation_surfaces:
  - "Plans/Remote_Access_System.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
preserved_exact_tokens:
  - "zstd"
  - "permessage-deflate"
negative_constraints:
  - "Do not compress the in-app UI channel."
owner_hints:
  - "Plans/Remote_Access_System.md"
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/Remote_Access_System.md#RAS-015
