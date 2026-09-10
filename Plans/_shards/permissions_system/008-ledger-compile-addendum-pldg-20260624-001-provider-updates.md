# Shard 008: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/Permissions_System.md`

Source lines: L312-L451

Source SHA256: `65f8cfc8efb2bacf69961629152d9bdba0f2c626c8121147d3ec11b2985f1c53`

---

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into provider permission and secret-custody requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### PS-119 - Provider Secret Custody And Route Permission Boundaries

```yaml
plan_unit_id: PS-119
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Provider route credentials, OAuth/session state, API keys, subscription-backed auth, authorization URLs, local account roots, and provider-native tool access are governed by PM permission custody and secret redaction. Plans, ledgers, logs, runtime artifacts, usage rows, and GUI diagnostics may store credential locators, account/profile refs, redacted setup state, and proof metadata, but never raw secrets. Route permissions must distinguish direct API, CLI runtime, server bridge, subscription-backed, and provider-native tool access.
gui_related: true
gui_classification_reason: Permission prompts, setup diagnostics, and redacted provider state are visible GUI behavior.
depends_on: [CV-294, MA-062]
unblocks: [T-164, RAP-032, F3-400]
acceptance_criteria:
  - Provider credentials are referenced by non-secret locators or profile refs.
  - API keys, OAuth URLs, session tokens, and local account secrets are never persisted in Plans, ledgers, logs, usage rows, or runtime artifacts.
  - Provider-native tool access goes through permission snapshots and redaction profiles.
  - Subscription-backed routes have distinct permission/account states from API-key routes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_secret_leak
reasoning_tier: high
context_scope: provider_secret_custody
implementation_surfaces: [Plans/Permissions_System.md, Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/Tools.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: provider_secret_custody_boundaries, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0055
  - pldg-20260624-001-provider-updates:atom-0120
  - pldg-20260624-001-provider-updates:atom-0137
source_atom_ids: [atom-0055, atom-0116, atom-0120, atom-0121, atom-0131, atom-0137, atom-0138]
preserved_exact_tokens: ["Dont put it in the ledger.", "API key", "OAuth", "authorization URL", "credential_locator", "credential_ref", "subscription-backed", "provider-native tools", "redaction_profile", "permission_snapshot_id"]
negative_constraints:
  - Do not store raw provider API keys, OAuth URLs, tokens, account identifiers, or local secrets in Plans, ledgers, logs, artifacts, or diagnostics.
  - Do not treat a subscription-backed route as equivalent to an API-key route for permission custody.
  - Do not bypass permission snapshots for provider-native tools.
owner_hints: [Plans/Permissions_System.md, Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/Tools.md]
```

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, PolicyRule:Decision_Policy.md§2

**Case sensitivity:**
- path-based matching follows the canonical filesystem semantics of the resolved root after `realpath()`
- a project on a case-sensitive filesystem uses case-sensitive matching even if the host OS can also mount case-insensitive volumes
- a project on a case-insensitive filesystem uses case-insensitive path matching for path-based permission keys
- non-path tokens such as tool names, URL origins, and bash command prefixes remain bytewise case-sensitive unless their owning subsystem defines a narrower rule

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/WorktreeGitImprovement.md

If PM cannot determine a stable canonical root for a path comparison, it fails closed rather than guessing a case mode from the OS or current shell.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md
### 3.2 Home expansion

<a id="HOME-EXPANSION"></a>

The characters `~` and `$HOME` are expanded to the user's home directory **only when they appear at the start of a pattern**. Mid-pattern occurrences are treated as literal characters.

### 3.3 External directory guard

<a id="EXTERNAL-DIR-GUARD"></a>

Any tool invocation that references a path outside the active project's working roots (as defined by the project configuration and workspace) triggers the `external_directory` permission key. Default: `ask` (see §7).

An **external directory allowlist** defines paths that are pre-approved for external access. The allowlist is stored in the permissions config (§9). Paths on the allowlist bypass the `external_directory` guard.

Allowlist entries support wildcard syntax (§3.1). Example:

```toml
[external_directory]
allowlist = [
  "~/.cargo/**",
  "/usr/local/include/**",
]
```

### 3.4 Pattern suggestion contract ("always" approval)

<a id="PATTERN-SUGGESTION"></a>

When a user responds `always` to an `ask` prompt (§6.2), the system derives a suggested approval scope from the invocation context and presents the user with scope-bound approval choices instead of silently minting a session-wide allow. Pattern suggestions are still derived from tool-specific context:

- **bash:** The command prefix (first word + space + `*`). Example: invocation `git commit -m "fix"` → pattern `"git *"`.
- **edit/read/glob/grep:** The directory prefix (`<dir>/**`). Example: invocation path `src/auth/login.rs` → pattern `"src/auth/**"`.
- **websearch/webresearch:** Wildcard discovery scope (`*`) or query/task-category scope when the advanced matcher is implemented, because the URL set is not known before discovery. The wildcard is tool-scoped and never grants unrelated network, file, shell, or mutation authority.
- **webfetch/webextract/webcrawl/webmap:** The normalized target origin and scope. Single-target reads and extraction use the concrete URL origin (`https://<domain>/*`); bounded crawl/map rules use the approved root origin plus an explicit crawl-scope discriminator, never a naked wildcard.
- Web approval pre-population is deterministic: `websearch` and `webresearch` pre-populate `*`; `webfetch` and `webextract` pre-populate `https://<actual-host>/*` derived from the URL; `webcrawl` and `webmap` pre-populate `https://<actual-root-host>/*` derived from `root_url`. The `/suggest` value is a user-editable pre-population convenience, not a lock.

The suggested pattern is displayed to the user during approval confirmation. The user MAY edit the pattern before a durable project/global rule is created, but the canonical approval anchor remains `approval_scope_key` plus blocked-episode identity rather than a UI session id.

### 3.4A Web-operation permission-key derivation
For canonical permission-key derivation, web operations use normalized suffixes rather than raw user-entered URLs:

- `webextract:{domain}` — extraction from a specific domain
- `webresearch:{query_category}` — research grouped by query category, where `query_category ∈ {general, code, docs, news}`
- `webcrawl:{domain}` — bounded crawl authority for a specific domain
- `webmap:{domain}` — site-structure mapping authority for a specific domain

Default web-operation posture remains `ask` where network web tools are enabled: `webextract`, `webresearch`, `webcrawl`, and `webmap` are explicit permission keys alongside `webfetch` and `websearch`. Extract/crawl/map approvals use granular URL/domain pattern rules; search/research may use query/task pattern rules only when the advanced matcher is implemented. Crawl/map fan-out must be visible in permission cards and audit payloads rather than hidden behind generic `webfetch`.

For any URL-derived web key, the runtime MUST extract the host, normalize it to the registrable domain, and use that canonical domain in the derived key. Example: `docs.example.com` normalizes to `example.com`.

Before any URL-derived web operation dispatches, the WebOperation permission check consumes the effective WebEgressPolicy: redirect policy, timeout/abort policy, proxy/trust policy, DNS-rebind check, SSRF/private-host/localhost policy, robots policy, crawl fanout/depth caps, cache/no-secret policy, and redaction profile. Private hosts, link-local IPs, localhost, file URLs, internal metadata endpoints, and DNS rebinding outcomes deny by default unless an explicit configured-provider endpoint or user-approved private-host policy applies. Robots denial, fanout cap, depth cap, cache bypass, and redaction-before-display outcomes are recorded as permission/audit evidence and surfaced in operation, denied, partial, approval, session, or batch cards.

WebOperation permission decisions are standalone receipts as well as nested operation metadata: each receipt preserves `permission_snapshot_id`, `decision`, `invocation_source`, optional `agent_reason`, and `tool_use_id` or `invocation_ref` so approval, denial, resumed, and headless-denied cards can explain whether the operation came from slash, palette, natural language, agent initiative, Goal Runtime, PRD Builder, Planning Wizard, or subagent work.

Wildcard matching for preset and policy authoring MAY use `web*:*` to represent all web-operation permission keys as a family. This wildcard is valid for preset definitions and other broad-scope policy surfaces but does not change the requirement that concrete approvals resolve to normalized derived keys.

ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget

Approval-card summary rules:
- `websearch summary shows tool name + query preview`
- `webfetch/webextract summary shows tool name + target host/URL`
- `webresearch summary shows tool name + task summary + estimated source count when available`
- `webcrawl/webmap summary shows tool name + root URL + page/depth caps`

Session-approval rules:
- `Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern and same tool-key semantics`
- `Approving webresearch For Session does NOT create broad allow for unrelated tools`
- `MVP uses wildcard session approval for search/research; advanced query-pattern support is future only`
- `webfetch` format requests for `screenshot` or `pdf` require `session_granted` tier approval because they invoke browser-runtime capture beyond the default text fetch path.
- Browser-session permission tiers use canonical storage values `always_allowed`, `session_granted`, and `explicit_confirmation`; UI/source aliases `always-allowed`, `session-granted`, and `explicit-confirmation` are lineage labels only and do not revive the retired preview/browser `trust-tier` matrix or replace requested/effective capability disclosure.
- Browser implementation-readiness permissions stay anchored to SSOT ownership: `/design-decision` and `/UI` readiness checklists must cover permission posture, session model, agent contract, watchability, DevTools, artifact capture, persistence, lifecycle, packaging, platform guarantees, command routing, and acceptance criteria without making Permissions_System the owner for non-permission browser details.
- Legacy `auth_session` capture/share/clipboard permission text is retired. Protected `AuthBrowserSession` is structurally ineligible for screenshot, PDF, recording, DOM/PageRepresentation, console, network, storage/profile import or export, generic share, agent/tool access, and programmatic clipboard paths. Only the foreground human may interact with the allowed domain-scoped page; exterior consumers receive redacted lifecycle or denial metadata only.
- Query/task-granular and host-bound allow rules may become advanced-editor refinements later, but they must not block the base approval flow.
- `Once` shows "Approve only this invocation" and approves only the current web invocation.
- `For Session` for `websearch` and `webresearch` shows "Approve this tool for the rest of the current session" with suggested pattern `*`; this wildcard-only, tool-wide session behavior is tool-scoped and does not permit unrelated file/shell/network mutation tools.
- `For Session` for `webfetch` and `webextract` shows "Approve this host/site for the rest of the current session" and approves the normalized host/domain, while `webcrawl` and `webmap` approve the normalized root host/domain; the user-facing pattern suggestion uses host-scoped forms such as `https://host.example/*` or `https://docs.example.com/*`. For example, approving `webcrawl` For Session on `https://docs.example.com/start` approves later crawl/map/extract/fetch calls only when they match the same allowed host pattern and same tool-key semantics.
- The `/crawl/map/fetch` follow-on family shares the same normalized host/site matching rule when a `webcrawl` session approval grants follow-on read operations.
- `Always` shows "Create durable permission rule", surfaces Project/Global scope selection when both scopes are valid, and creates the durable project/global permission rule through canonical permissions storage.
- `Deny` shows "Reject this invocation" and invokes the `reject-all-pending` cascade: reject this invocation and reject any other pending asks in the same approval batch/session that share the same approval ask.

The approval summaries are rendered by `Plans/FinalGUISpec.md#15.7 Permission approval card widget` and the actual consumer sections that display the summaries.

Rules:
- URL-derived web keys normalize to registrable domain
