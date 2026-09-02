# Cursor Origin Integration

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes common forge contracts from `Plans/Forge_Integrations.md`, and uses the PlanUnit contract in `Plans/Plan_Document_System.md`. Puppet Master is the only product name.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for Cursor Origin Preview eligibility, modes, role routing, authority transfer, mirrors, Origin App/JIT auth semantics, signed webhook/API compatibility, immutable reviews, CLI lifecycle, Git/JJ transport certification, Source Control/Settings projection, health, and degradation.

## 0. Scope

Cursor Origin is a Preview hosted forge, exactly `forge_provider=cursor_origin`. It is not an `scm_backend`, local VCS, model/provider CLI, self-hosted forge, GitHub replacement, or dedicated rail/panel. It uses the common `cmd.forge.*` contract and shared installation/auth/connection commands. `cmd.origin.*` is forbidden.

The closed Origin repository modes are exactly:

```text
native_origin
origin_outbound_mirror
github_inbound_origin_mirror
detached_origin
transitioning
degraded
unavailable
```

Each repository resolves storage, review, checks, automation, issues, transport, and mirror roles independently. Mode is a compact policy/result label; it does not replace the role map, mirror topology, provider binding, current capability envelope, or revision fence.

ContractRef: ContractName:Plans/Cursor_Origin_Integration.md, ContractName:Plans/Forge_Integrations.md, SchemaID:pm.forge.repository_binding.v1

## 1. Ownership And Consumers

### 1.1 Owned here

- Preview eligibility, visibility, mode selection, requested/effective mode, and degradation;
- Origin-specific authority-role constraints and GitHub-inbound no-mutation rules;
- Origin outbound/inbound mirror, detach/reconnect transfer, revision fences, dedupe, lag, and recovery semantics;
- invisible system-managed Origin App Ed25519 key semantics, official install flow, five-minute signed receipt verification, installations, grants, least-privilege JIT repository token lease, revocation, and reauthorization;
- Origin raw-body Ed25519/JWKS webhook requirements and provider retry/redelivery mapping;
- Origin `ForgeApiCompatibility`, API/catalog hash pinning, rate budget, fail-closed mutation, and fallback selection;
- immutable Origin review revision/thread/version behavior and Draft-by-default agent reviews;
- independent optional Origin CLI discovery/lifecycle per exact Host/Environment and structured-JSON fallback;
- Git/JJ transport and colocation/helper Preview certification matrix;
- Source Control and Settings insertion, exact setup labels, Onboarding/Doctor projections, health, and security negatives.

### 1.2 Retained owners

Common repository bindings, capability envelopes, mirror/review/pipeline/app/webhook/API shapes, commands/events/receipts and GUI section grammar remain in `Plans/Forge_Integrations.md`. Local Git/JJ identities and writer leases remain in Source Control/JJ/Git owners. The credential broker owns private keys and raw tokens. Shared Integration Runtime owns install/auth/connection lifecycle and `ObservableWork`. Permissions, FileSafe, official-page routing, commands, events, storage, wiring, Settings shell, GUI tokens, Onboarding, and Doctor remain retained owners.

GitHub-inbound mode continues to consume GitHub API, webhooks, Actions, issues, secrets, permissions, credentials and background-mutation owners. Origin cannot independently ingest or mutate those authoritative domains.

ContractRef: ContractName:Plans/Forge_Integrations.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

## 2. Canonical PlanUnits

### ORI-001 - Cursor Origin Preview Identity And Non-Goals

```yaml
plan_unit_id: ORI-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: >-
  Cursor Origin is Preview forge_provider=cursor_origin. It is not scm_backend, local VCS, provider/model CLI,
  self-hosted forge, GitHub replacement, dedicated rail/panel, or cmd.origin.* namespace. It consumes common
  forge commands and records and retains provider-specific eligibility, modes, auth, API, CLI and health here.
gui_related: true
gui_classification_reason: Preview identity, availability, labels, placement and disabled reasons are visible.
depends_on: [FGI-001, SCS-001, PDS-003]
unblocks: [ORI-002, ORI-003, ORI-004, ORI-005, ORI-006, ORI-007, ORI-008]
acceptance_criteria:
  - Origin is represented only as forge_provider=cursor_origin.
  - No dedicated Activity Bar item, panel, or Origin command namespace exists.
  - Preview eligibility and requested/effective state are explicit.
validation_surfaces: [Plans/cursor_origin_integration_fixtures.json, provider identity and forbidden-token scans]
risk_class: origin_category_or_surface_drift
reasoning_tier: high
context_scope: cursor_origin_preview_owner
implementation_surfaces: [Plans/Cursor_Origin_Integration.md, future Origin adapter]
node_compile_hint: {mode: cursor_origin_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:DS-05, source_ref:egolite-register:ORI-01..06]
preserved_exact_tokens: [forge_provider=cursor_origin, Preview, no dedicated panel, cmd.origin.*]
negative_constraints: [Do not make Origin an SCM backend., Do not call Origin self-hosted., Do not create a dedicated rail or panel., Do not register cmd.origin.*.]
owner_hints: [Plans/Cursor_Origin_Integration.md, Plans/Forge_Integrations.md]
```

### ORI-002 - Modes, Role Routing, Mirrors, And Guarded Detach

```yaml
plan_unit_id: ORI-002
unit_type: requirement
status: accepted
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: >-
  Origin supports native_origin, origin_outbound_mirror, github_inbound_origin_mirror, detached_origin,
  transitioning, degraded and unavailable. Storage, review, checks, automation, issues, transport and mirror
  roles resolve independently. In GitHub-inbound mode GitHub remains authoritative for API, webhooks, Actions,
  issues, secrets, permissions, credentials and background mutation; Origin is secondary browse/review only.
  Detach is guarded authority transfer with warning, preview, revision fence, Permissions/FileSafe, receipt,
  recovery and capability re-resolution.
gui_related: true
gui_classification_reason: Modes, authority, mirror health/lag, detach/reconnect and recovery are visible.
depends_on: [ORI-001, FGI-002]
unblocks: [ORI-003, ORI-004, ORI-008]
acceptance_criteria:
  - Every mode resolves all authority roles and requested/effective values.
  - GitHub-inbound Origin cannot use Origin token/webhook paths for authoritative mutation.
  - Detach and reconnect are fenced, receipted, recoverable and capability-reprobed.
validation_surfaces: [Origin mirror fixtures, every-mode authority matrix, dedupe/currentness/detach recovery tests]
risk_class: origin_mirror_split_brain_or_unsafe_detach
reasoning_tier: high
context_scope: cursor_origin_modes_authority_mirror
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future Origin mirror adapter]
node_compile_hint: {mode: origin_mode_authority_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-001..009]
preserved_exact_tokens: [native_origin, origin_outbound_mirror, github_inbound_origin_mirror, detached_origin, transitioning, degraded, unavailable]
negative_constraints: [Do not mutate GitHub-authoritative domains through Origin., Do not infer authority from mirror direction., Do not detach without a guarded transfer.]
owner_hints: [Plans/Cursor_Origin_Integration.md, Plans/Forge_Integrations.md, Plans/GitHub_Integration.md]
```

### ORI-003 - Origin App, Signed Installation Receipt, Grants, And JIT Tokens

```yaml
plan_unit_id: ORI-003
unit_type: requirement
status: accepted
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: >-
  The credential broker owns an invisible system-managed Origin App Ed25519 key. Connect opens the exact official
  install page with anti-forgery state and verifies a signed five-minute receipt across signature/JWKS, issuer,
  audience, expiry, installation identity, uniqueness and state. Puppet Master stores installation identity and
  grant refs, not the receipt as credential. Least-privilege JIT repository tokens are scope-bound, revocable and
  currently capped at 15 minutes; Git HTTPS uses x-access-token and raw tokens never persist.
gui_related: true
gui_classification_reason: Connection, grants, approved repositories/scopes, reauthorization and security health are visible Settings behavior.
depends_on: [ORI-001, FGI-006]
unblocks: [ORI-004, ORI-006, ORI-008]
acceptance_criteria:
  - Installation receipts fail closed for signature, JWKS, issuer, audience, expiry, identity, uniqueness, or state mismatch.
  - Stored records contain non-secret installation/grant/credential refs only.
  - JIT tokens are least-privilege, repository/scope-bound, revoked on grant loss, and never exceed the current signed-catalog cap.
validation_surfaces: [Origin installation/token fixtures, five-minute receipt tests, 15-minute cap currentness test, secret leak and revocation tests]
risk_class: origin_app_forgery_or_token_escape
reasoning_tier: high
context_scope: cursor_origin_app_and_token_auth
implementation_surfaces: [Plans/cursor_origin_integration_fixtures.json, credential broker, future Origin auth adapter]
node_compile_hint: {mode: origin_app_jit_auth_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-010..014]
preserved_exact_tokens: [Ed25519, JWKS, five-minute receipt, least-privilege JIT repo token, 15 minutes, x-access-token, Reauthorize]
negative_constraints: [Do not store a raw token or private key., Do not use the installation receipt as a credential., Do not accept an expired/replayed/state-mismatched receipt.]
owner_hints: [Plans/Cursor_Origin_Integration.md, Plans/Forge_Integrations.md, Plans/Multi-Account.md]
```

### ORI-004 - Signed Webhooks, API Compatibility, Rate Budget, And Recovery

```yaml
plan_unit_id: ORI-004
unit_type: invariant
status: accepted
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: >-
  Origin webhooks verify raw-body Ed25519/JWKS before parse, validate provider timestamp and repository context,
  reject replay, dedupe stable delivery IDs, acknowledge quickly and process asynchronously with inspection,
  bounded retry/redelivery and recovery. Origin ForgeApiCompatibility pins adapter, OpenAPI/contract hash, signed
  catalog, probe, endpoints, scopes, features, mutation safety and rate budget. Unknown compatibility disables
  mutation; validated reads may degrade and typed fallbacks never scrape prose.
gui_related: true
gui_classification_reason: Webhook delivery/recovery, API compatibility, rate budget, degradation and remediation are visible Security/Advanced details.
depends_on: [ORI-002, ORI-003, FGI-007]
unblocks: [ORI-005, ORI-008]
acceptance_criteria:
  - Signature verification is over raw body and completes before payload parse.
  - Replay and duplicate delivery produce no duplicate effect and remain inspectable.
  - Unknown/stale compatibility fails mutation closed and partial data remains partial.
validation_surfaces: [Origin webhook fixture, signature/replay/dedupe/redelivery tests, API hash/rate/backoff/fallback tests]
risk_class: origin_webhook_replay_or_api_drift
reasoning_tier: high
context_scope: cursor_origin_webhooks_api
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future Origin webhook/API adapter]
node_compile_hint: {mode: origin_webhook_api_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-015..020]
preserved_exact_tokens: [raw-body Ed25519, JWKS, delivery-ID dedupe, ForgeApiCompatibility, OpenAPI hash, Retry-After, structured JSON]
negative_constraints: [Do not parse before verification., Do not redeliver without idempotency., Do not mutate under unknown compatibility., Do not scrape CLI prose.]
owner_hints: [Plans/Cursor_Origin_Integration.md, Plans/Forge_Integrations.md]
```

### ORI-005 - Immutable Reviews, Versions, Threads, Draft, And Compact Queries

```yaml
plan_unit_id: ORI-005
unit_type: requirement
status: accepted
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: >-
  Origin reviews use common ForgeReviewRevision and ForgeReviewThread identities. Approvals, tests, captures,
  artifacts and audits bind exact base/head/version and become stale or require revalidation after a new head.
  Agent-created reviews default Draft absent explicit Project policy and Mark Ready remains distinct. Compact
  changed-path/name/exclusion/filter queries prevent whole-review payload injection.
gui_related: true
gui_classification_reason: Review versions, threads, Draft/Ready, stale evidence, filters and actions are visible Source Control behavior.
depends_on: [ORI-004, FGI-004]
unblocks: [ORI-008]
acceptance_criteria:
  - A changed head cannot reuse current approval or evidence state.
  - Threads bind exact revision/path/range and resolution actor.
  - Agent-created review is Draft by default and requires separate Mark Ready policy/action.
validation_surfaces: [Origin review revision/thread fixtures, stale-head tests, Draft/Ready tests, compact query budget tests]
risk_class: origin_stale_review_or_agent_publication
reasoning_tier: high
context_scope: cursor_origin_reviews
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future Origin review adapter]
node_compile_hint: {mode: origin_review_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-021..024]
preserved_exact_tokens: [ForgeReviewRevision, ForgeReviewThread, Draft, Mark Ready, changed-path, exclusion, filter]
negative_constraints: [Do not reuse evidence across a new head., Do not mark agent review Ready by default., Do not inject a whole review when compact queries suffice.]
owner_hints: [Plans/Cursor_Origin_Integration.md, Plans/Forge_Integrations.md]
```

### ORI-006 - Origin CLI Exact-Environment Lifecycle And Fallback

```yaml
plan_unit_id: ORI-006
unit_type: requirement
status: accepted
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: >-
  Origin CLI is optional and independent of App/API readiness. Discovery and lifecycle bind each macOS/Linux
  host, WSL distribution, container or remote Host/Environment separately; native Windows remains API/Git capable.
  First acquisition requires explicit user action and official source. Stable is the default channel; update,
  verify, repair and rollback follow post-consent shared lifecycle. Only a current version-gated structured-JSON
  adapter may serve as a narrow fallback, and no operation silently mutates global Git helper configuration.
gui_related: true
gui_classification_reason: Exact installation target, actions, lifecycle, separate API readiness and degraded fallback are visible Tools state.
depends_on: [ORI-003, SCS-004]
unblocks: [ORI-007, ORI-008]
acceptance_criteria:
  - CLI state is independent of Origin App/API connection and repository eligibility.
  - Native Windows and each WSL/remote/container environment never collapse into one installation.
  - First acquisition requires explicit consent and structured fallback is version/schema gated.
validation_surfaces: [exact-environment discovery fixtures, lifecycle/rollback tests, Windows/WSL separation, no-global-helper-mutation tests]
risk_class: origin_cli_environment_or_authority_widening
reasoning_tier: high
context_scope: cursor_origin_cli
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future Origin CLI adapter]
node_compile_hint: {mode: origin_cli_lifecycle_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-025..030]
preserved_exact_tokens: [Install Origin CLI on Home Server, Use Origin CLI in WSL: Ubuntu, Open Installer, Use This Installation, Sign In, Stable]
negative_constraints: [Do not label the action Install Cursor Origin., Do not silently install or alter global Git helpers., Do not treat CLI login as App/API readiness.]
owner_hints: [Plans/Cursor_Origin_Integration.md, Plans/Shared_Integration_Runtime.md]
```

### ORI-007 - Git/JJ Transport And Preview Certification Fence

```yaml
plan_unit_id: ORI-007
unit_type: validation
status: accepted
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: >-
  Origin/JJ mutation remains Preview and unavailable unless the current signed certification matrix covers exact
  clone, fetch, push, bookmark, force-with-lease, colocation, credential-helper, repository mode, history and object
  format behavior for the selected adapter, tool versions and Host/Environment. Missing certification may admit
  validated reads or Open in Cursor Origin only; it never falls through to unfenced Git mutation.
gui_related: true
gui_classification_reason: Preview limits, requested/effective capability, disabled reasons, and fallbacks are visible.
depends_on: [ORI-006, JJI-004, FGI-003]
unblocks: [ORI-008]
acceptance_criteria:
  - Certification is exact to adapter/tool/host/environment/repository mode and object format.
  - Unsupported combinations fail mutation closed with typed reason and recovery/fallback actions.
  - Colocation preserves JJ single mutation authority and pre/post operation fences.
validation_surfaces: [Origin/JJ certification matrix, force-with-lease/colocation/helper/object-format tests, fallback negatives]
risk_class: origin_jj_preview_mutation_escape
reasoning_tier: high
context_scope: cursor_origin_git_jj_certification
implementation_surfaces: [future signed Origin compatibility catalog, future Origin/JJ adapter]
node_compile_hint: {mode: origin_jj_preview_certification, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-05, source_ref:egolite-register:SCM-02]
preserved_exact_tokens: [Preview, clone, fetch, push, bookmark, force-with-lease, colocation, credential helper, object format]
negative_constraints: [Do not fall through to Git mutation., Do not certify by version alone., Do not bypass JJ colocation authority.]
owner_hints: [Plans/Cursor_Origin_Integration.md, Plans/Jujutsu_Integration.md, Plans/Source_Control_System.md]
```

### ORI-008 - Source Control, Settings, Setup Actions, Health, And Migration

```yaml
plan_unit_id: ORI-008
unit_type: validation
status: accepted
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: >-
  Cursor Origin remains inside existing Source Control and Source Control Settings. Settings route is Hosting
  Services -> Cursor Origin -> Connection, Repositories, Security, Tools, Advanced. Exact labels include Connect
  Cursor Origin, Reauthorize and Open in Cursor Origin. Typed commands are shared connection/auth/install and
  cmd.forge.* identities with forge_provider=cursor_origin. Onboarding and Doctor consume dependency/health/routes
  only. Legacy or mirror state migrates only from validated binding and authority evidence.
gui_related: true
gui_classification_reason: This unit defines exact placement, labels, actions, health, degraded states and migration presentation.
depends_on: [ORI-002, ORI-003, ORI-004, ORI-005, ORI-006, ORI-007, SCS-005, FGI-008]
unblocks: []
acceptance_criteria:
  - No dedicated Origin panel or rail item exists.
  - Exact labels dispatch shared canonical commands with typed Origin payload and ObservableWork when async.
  - All seven modes and auth/API/CLI/JJ health states have responsive, accessible, degraded/disabled fixtures.
validation_surfaces: [Origin GUI/Settings fixtures, command/wiring census, mode and health fixtures, migration and security negatives]
risk_class: origin_gui_or_migration_false_authority
reasoning_tier: high
context_scope: cursor_origin_gui_settings_health
implementation_surfaces: [Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: origin_gui_settings_migration_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-031..033, source_ref:egolite-register:UI-01..03]
preserved_exact_tokens: [Connect Cursor Origin, Reauthorize, Open in Cursor Origin, Connection, Repositories, Security, Tools, Advanced]
negative_constraints: [Do not redesign Onboarding or Doctor., Do not create a dedicated panel., Do not expose raw tokens, keys, paths or IDs in ordinary UI.]
owner_hints: [Plans/Cursor_Origin_Integration.md, Plans/Settings_System.md, Plans/Forge_Integrations.md]
```

## 3. Contracts, Schemas, Events, Or Data Shapes

Origin extends the common schema only through values and provider constraints. `Plans/cursor_origin_integration_fixtures.json` validates the Preview adapter profile, Origin App installation, five-minute signed receipt, JIT token lease, and invalid provider identity against `Plans/forge_integration_contracts.schema.json`. No separate Origin command, event envelope, mirror, review, webhook, or capability schema is created.

### 3.1 Typed UI actions

| Human action | Canonical command and typed payload |
|---|---|
| **Connect Cursor Origin** | `cmd.integration.connection.add {connection_kind: forge, forge_provider: cursor_origin, provider_variant: preview, setup_route: origin_app_install, ...}` |
| **Reauthorize** | `cmd.forge.connection.reauthorize {forge_provider: cursor_origin, repository_binding_ref or account_id, expected_generation, ...}` |
| **Open in Cursor Origin** for repository | `cmd.forge.repository.open_in_browser {forge_provider: cursor_origin, repository_binding_ref, ...}` |
| **Open in Cursor Origin** for review | `cmd.forge.review.open_in_browser {forge_provider: cursor_origin, review_revision_ref, ...}` |
| **Install Origin CLI on Home Server** | `cmd.installation.install {product_id: cursor_origin_cli, execution_host_id, execution_environment_id, explicit_consent_ref, ...}` |
| **Use Origin CLI in WSL: Ubuntu** / **Use This Installation** | `cmd.installation.select {product_id: cursor_origin_cli, installation_ref, exact Host/Environment, ...}` |
| **Open Installer** | `cmd.auth_profile.open_official_page {provider_id: cursor_origin, route_id: origin_cli_installer, ...}` |
| **Sign In** | `cmd.auth_profile.sign_in {provider_id: cursor_origin, route_id: origin_cli, installation_ref, ...}` |

All asynchronous commands return an accepted receipt with `ObservableWork`; the terminal provider result is separate. Exact labels are human vocabulary, not command IDs.

### 3.2 Origin health projection

Origin health is a product of eligibility, connection/App installation, grant/revocation, token minting, API compatibility/currentness/rate, webhook delivery/recovery, mirror authority/lag, review capability, CLI installation/auth, local backend/transport certification, Host/Environment, and requested/effective mode. Human states are **Ready**, **Ready with limits**, **Needs attention**, and **Not available**; raw enums and IDs remain in Technical Details.

## 4. Integration Surfaces

### 4.1 Source Control

Origin may add Reviews, optional Review Versions/Threads, Checks, Source of Truth, and Mirror Health to the existing Source Control panel when the capability envelope admits them. It never adds a rail/panel. GitHub-inbound mode visibly identifies GitHub as source of truth and Origin as secondary. Detach/reconnect is a high-risk action with preview, authority diff, current revision fence, warning and recovery route.

### 4.2 Settings

The exact Settings route is **Source Control -> Hosting Services -> Cursor Origin -> Connection | Repositories | Security | Tools | Advanced**. Connection shows Preview eligibility/App/account state. Repositories shows bindings, grants, authority/mode and mirror health. Security shows App key ref health, receipt verification, token/grant/revocation and webhook health without secrets. Tools shows API and independent CLI installations per Host/Environment. Advanced shows compatibility/catalog hashes, rate budgets, dedupe/recovery, requested/effective capability and Technical Details.

### 4.3 Onboarding and Doctor

Onboarding and Doctor accept dependency state, health projections, exact routes and fixtures only. They do not re-own Origin setup/auth/security logic and are not redesigned by this owner. A continuation resumes only if account, repository binding, mode, capability catalog, topology and originating intent remain current.

## 5. Validation And Acceptance

Acceptance covers all seven modes; independent role maps; GitHub-inbound no-mutation/dedupe; outbound mirror and detach/reconnect; App key/official page/anti-forgery state/five-minute receipt/JWKS; grants/revocation/reauthorization; current token duration cap, least privilege and leak tests; webhook raw-body signature/time/replay/dedupe/ack/retry/redelivery/recovery; API hash/catalog/currentness/rate/backoff/fallback; immutable review revisions/threads/Draft/Ready/compact query; CLI discovery on macOS/Linux/native Windows/each WSL/container/remote; explicit acquisition/update/repair/rollback; Origin/JJ certification matrix; exact labels/commands/ObservableWork; every theme/width/reduced motion/accessibility; migration; and production wiring.

No static fixture, concept screen, package retention result, or validator pass is runtime, visual, provider-compatibility, security, or readiness proof.

## 6. Plan-To-Node Readiness

Origin remains Preview and node-blocked until central registration, current eligibility/support catalogs, Credential Broker implementation, signed install/webhook/JWKS verification, API adapter, rate/retry implementation, mirror coordinator, review adapter, exact-environment CLI lifecycle, JJ certification, Settings/GUI/wiring, migration, and fresh runtime/security/visual evidence exist. This doc creates no connection, App installation, token, webhook, mirror, review, WorkNode, or certification.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- Packet values of five-minute installation receipt and current maximum 15-minute JIT token remain accepted behavior but runtime must confirm the signed current catalog where the provider owns moving limits.
- Packet retry/redelivery counts and dedupe windows are catalog inputs, not hardcoded here.
- `cmd.origin.*`, Origin-as-SCM, self-hosted Origin, dedicated panel/rail, and **Install Cursor Origin** are forbidden.
- Structured-JSON CLI fallback is narrow, version-gated and optional; prose scraping is forbidden.
- This owner does not replace GitHub in GitHub-inbound mode, define local Git/JJ mutation, store secrets, define installation/runtime primitives, edit plugin manifest rules, or own Settings geometry.

### 7.1 Migration

Legacy records migrate to an Origin binding only with verified `forge_provider=cursor_origin`, account, provider repository, mode, role map, capability catalog and binding generation. A GitHub remote plus Origin display label is insufficient. GitHub-inbound migrations default GitHub authority until guarded detach succeeds. Ambiguity remains `needs_attention` or `blocked`, with no background mutation.

## 8. Source Lineage And Governance

This owner compiles accepted `ORI-01..06`, relevant `SCM-01..05`, `UI-01`, `UI-03`, `CT-01..02`, and `TS-04`/`TS-05` requirements. Root-owned central index/catalog/event/wiring/storage updates and governance seal remain separate. Generated artifacts are not hand-edited here.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/00-plans-index.md

### ORI-009 - Create Visibility And Complete Typed API Fallback Closure

```yaml
plan_unit_id: ORI-009
unit_type: requirement
status: accepted
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: >-
  Cursor Origin remains Preview and must never be advertised as self-hosted, open-source, or generally
  feature-equivalent. The retained current create baseline exposes Internal and Private through requested/effective
  visibility only while the signed capability envelope proves them; stale or contrary capability evidence degrades
  those choices rather than guessing. Public is visibly unavailable and cannot dispatch until that exact capability is
  proven. When the API is partial or unavailable for content, compare, push, thread, or reviewer data, the adapter
  selects Git data, Git transport, or one version-gated typed CLI gap adapter. Content above 1 MiB, an oversized entry
  in a content batch, summary-only compare data, an incomplete push commit list, missing thread resolution, and missing
  reviewer mutations never truncate into success or claim complete behavior.
gui_related: true
gui_classification_reason: Preview identity, create visibility, disabled Public state, and fallback/degradation are visible.
depends_on: [ORI-001, ORI-004, ORI-005, ORI-006]
unblocks: []
acceptance_criteria:
  - ORI-002 keeps self-hosted/open-source/feature-equivalent advertising false and represents Internal, Private, and Public as requested/effective capability-gated states.
  - The retained create baseline offers Internal and Private only under a current signed capability result; missing, stale, or failed capability evidence returns a typed degraded/unavailable state rather than optimistic create success.
  - Public creation remains `unavailable_until_capability_proven`, visibly disabled, and undispatched; a label, repository mode, successful Internal/Private create, or generic repository-create endpoint cannot infer Public support.
  - ORI-020 covers all five exact data/action gaps: oversized content and content batches fall back without false batch completeness; summary-only compare falls back for a complete comparison; incomplete push webhooks enumerate commits against exact before/after revisions; thread resolution and reviewer add/remove/rerequest use a supported typed route or remain unavailable.
  - The decoded-content boundary is greater than 1,048,576 bytes; exact-boundary, greater-than-boundary, oversized-batch-member, and unavailable-fallback fixtures preserve per-item truth and never turn partial content into complete success.
  - The complete-commit fixtures prove an exact-revision Git enumeration or typed complete result; webhook counts, compare summaries, or a successful request alone cannot prove complete history.
  - Typed CLI fallback is optional, version-gated, structured-JSON only, and cannot replace API/App/Git readiness or parse prose; when no typed complete route exists, the result stays partial/unavailable and may offer Open in Cursor Origin.
  - Negative fixtures reject stale capability, Public advertised/dispatchable, missing one of the five coverage classes, oversized/truncated content claimed complete, incomplete push claimed complete, unsupported thread/reviewer success, and prose-scraped CLI output.
  - Static fixtures do not prove current provider capability, create success, API completeness, Git transport, CLI execution, or security.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, Plans/cursor_origin_integration_fixtures.json, focused Egolite remediation validator, future Origin visibility currentness matrix, future five-class fallback positive/negative fixtures]
risk_class: origin_visibility_overclaim_or_partial_api_data_loss
reasoning_tier: high
context_scope: origin_visibility_and_fallback
implementation_surfaces: [Plans/Cursor_Origin_Integration.md, Plans/Forge_Integrations.md, future Origin adapter]
node_compile_hint: {mode: origin_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:ORI-002, source_ref:egolite-requirement:ORI-020]
preserved_exact_tokens: [Internal, Private, Public, unavailable_until_capability_proven, content, compare, push, thread, reviewer, 1 MiB, complete commit]
negative_constraints:
  - Do not advertise Origin as self-hosted, open-source, or generally feature-equivalent.
  - Do not send a Public create request while the exact current capability is absent, stale, failed, or false.
  - Do not treat truncated, partial, or prose-parsed data as complete success.
```
