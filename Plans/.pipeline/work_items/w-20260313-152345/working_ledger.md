# Working Ledger

## Work Item
- `w-20260313-152345`

## Mode
- `research`

## Topic / Scope
- Awesome enhancements
- Current research seam: Gemini provider support, especially API-key vs OAuth distinctions, provider settings/UI drift, and plan/spec coverage.

## Objective
- Preserve pre-packetize discussion context for the "awesome enhancements" topic.
- Hold execution memory for later research, reconciliation, and packetization without treating this ledger as canonical.
- Confirm current Gemini support surfaces in-repo.
- Compare local Gemini OAuth handling against a reference implementation.
- Identify plan/spec/UI drift where Gemini API-key auth and Gemini OAuth are being collapsed or mislabeled.

## Constraints / Non-Goals
- Do not edit planning docs under `Plans/*.md` during research mode.
- Do not treat this ledger as a source of truth.
- User asked for collaborative discussion after research before planning-doc edits.
- User explicitly said not to rely on Google/Gemini developer docs for this seam because they are confusing/outdated/contradictory; prefer in-repo behavior plus the supplied reference implementation.
- Do not reference the supplied external repo by name in downstream planning docs.
- User clarified that the old local app implementation is wrong for this seam and must not be used as a source going forward.
- During the current pass, only `Plans/**` plus the supplied reference implementation should be treated as valid research inputs.
- A temporary local clone of the supplied reference implementation now exists under the session artifact area and must be removed when this seam is finished.

## Key Facts and Findings
- Topic/scope has been established as "awesome enhancements".
- Focused enhancement topic is Gemini as a provider.
- User indicated another agent is also working on a ledger, so overlap/conflict is expected.
- User corrected an important assumption: Gemini API-key auth and Gemini OAuth do **not** hit the same plan/bucket.
- Reference implementation confirms the OAuth path is meaningfully distinct from API-key mode:
  - it exposes separate auth methods: OAuth-with-Google vs manual API key
  - OAuth uses browser auth + localhost callback + PKCE + refresh token handling
  - OAuth traffic is routed through Code Assist-style endpoints/project-context logic, not the API-key path
  - project context / effective project can differ from merely "having an OAuth token"
- Reference implementation also reinforces that OAuth can require project-context handling and quota/project resolution beyond simple token presence.
- The reference implementation is explicit about auth-surface separation in ways our plans currently are not:
  - provider auth methods are declared as two separate choices (`type: "oauth"` and `type: "api"`)
  - the quota command works only for OAuth and explicitly errors if the current auth method is API-key-based
  - OAuth request preparation strips API-key headers and replaces them with bearer-token auth against Code Assist endpoints
- The reference implementation models OAuth/project context with more nuance:
  - free-tier onboarding can proceed without a configured project id
  - non-free tiers can require an explicit Google Cloud project id
  - validation-required account states are surfaced before onboarding continues
  - configured project id has precedence over previously persisted managed-project ids
- The reference implementation therefore suggests OAuth needs more than a binary logged-in/logged-out model; effective project context matters.
- `Plans/storage-plan.md` already provides the right persistence pattern for this seam:
  - secrets stay in OS credential storage only
  - project state can store `requested_auth_mode`
  - runtime/usage records already distinguish `effective_*` snapshots
- `Plans/usage-feature.md` already anticipates mode/source distinctions:
  - optional `provider_account_id?`
  - optional `usage_source_kind`
  - explicit guidance to label source (for example project-local usage vs provider/API-backed usage)
  - explicit warning that Gemini semantics differ from other providers and should be labeled distinctly (e.g. `Gemini (estimated)`)
- `Plans/FinalGUISpec.md` already contains UI language that helps this seam:
  - Authentication page includes auth method indicators
  - dashboard/settings surfaces already use the requested-vs-effective pattern in other domains
  - Usage page already expects per-platform labels because quota semantics differ by provider

## Gaps / Problems Identified
- Potential concurrent edits to this work item area may need careful handling later.
- Spec/UI drift: current plans emphasize Gemini API-key settings surfaces, but do not adequately represent Gemini OAuth as a first-class, separate auth mode with separate plan/quota semantics.
- The current GUI/spec wording appears biased toward "Gemini API key" as the primary/only settings surface, which conflicts with both current runtime support and the user's corrected plan distinction.
- Some docs imply or default that Gemini OAuth is just another way to reach the same Gemini plan/bucket as the API key; user says this is wrong.
- Usage/plan documentation currently centers AI Studio/API-key language for Gemini and lacks a clear split between:
  - API-key/AI-Studio-backed usage
  - Gemini-account / OAuth-backed usage
- Current local auth detection for Gemini checks `google_accounts.json.active` but does not appear to model richer OAuth/project context states (for example, OAuth present but project selection/onboarding incomplete).
- Plans currently have no clear contract for Gemini OAuth states like:
  - OAuth authenticated but project unresolved
  - OAuth authenticated but validation required
  - OAuth authenticated with free-tier managed project
  - OAuth authenticated with explicit configured project
- Plans currently do not define whether quota/usage tools and account/plan UI are API-key-only, OAuth-only, or mode-dependent for Gemini.
- `Plans/FinalGUISpec.md` Authentication section is currently too API-key-centric for Gemini; it lacks a clearly first-class OAuth section and does not reflect the distinct plan/bucket behavior.
- `Plans/usage-feature.md` currently treats Gemini mostly as API-key/AI-Studio-oriented and "estimated" usage, which is incomplete if Gemini OAuth is expected to surface a different quota bucket/plan path.
- `Plans/storage-plan.md` has the requested/effective machinery, but Gemini-specific auth-mode and usage-source fields are not yet spelled out concretely.

## Candidate Fixes / Design Directions
- Split Gemini in planning docs into **two auth surfaces** under one provider:
  - **Gemini API key** (AI Studio / developer-facing API path)
  - **Gemini OAuth / Google account** (Gemini plan / Code Assist-style bucket path)
- Treat those auth surfaces as **different billing/quota planes** and prevent UI copy from implying they are interchangeable.
- Keep a single top-level Gemini provider identity, but add explicit requested/effective auth-mode state in contracts/UI instead of collapsing everything into one generic "Gemini authenticated" concept.
- Update provider-settings/auth UI specs so Gemini shows:
  - OAuth login/re-auth/logout status independently
  - API key presence/config independently
  - clear copy on what each mode unlocks / which bucket it uses
  - precedence rules when both are present
- Keep the existing **direct-provider** planning direction for Gemini, but flesh it out so direct-provider does not accidentally collapse OAuth and API-key semantics into one bucket/mode.
- Consider a richer Gemini auth state model for specs:
  - `oauth_logged_out`
  - `oauth_logged_in`
  - `oauth_needs_project_context` / similar
  - `api_key_configured`
  - effective auth mode selected for a given capability/run
- Add explicit **requested vs effective** Gemini auth-mode rules:
  - requested mode could be `oauth`, `api_key`, or `auto`
  - effective mode depends on configured credentials plus capability requirements
  - media generation may still force API-key mode even if chat/code execution uses OAuth
- Add explicit **project-context** fields/UX for Gemini OAuth in plans:
  - optional configured Google Cloud project id
  - effective resolved project id
  - validation-required / onboarding-needed states
- Update usage/quota specs so Gemini quota visibility is mode-aware:
  - OAuth path can surface Gemini-plan / Code Assist-style quota semantics
  - API-key path should remain separate and must not be mislabeled as the same quota bucket
- Reuse existing storage-plan vocabulary instead of inventing Gemini-specific persistence patterns:
  - store non-secret Gemini preference as `requested_auth_mode`
  - persist runtime truth as effective auth/capability snapshots and usage records
  - keep OAuth/API credentials out of redb/seglog
- Extend usage records/projections with source attribution for Gemini:
  - `usage_source_kind` should distinguish at least local-estimated/API-key-derived/OAuth-quota-derived sources
  - `provider_account_id?` can support future multi-account/account-label UI
- Align GUI wording with the requested/effective model:
  - requested auth mode shown in settings/auth surfaces
  - effective capability / active bucket shown in usage/auth status surfaces
  - degraded reason shown when requested mode cannot satisfy a capability

## Impacted Docs
- `Plans/CLI_Bridged_Providers.md`
- `Plans/FinalGUISpec.md`
- `Plans/feature-list.md`
- `Plans/usage-feature.md`
- Likely also any auth/provider-contract docs that currently classify Gemini as direct-provider-only or API-key-primary.

## Decisions Already Resolved
- Work item mode should be `research`.
- Work item status should start as `active`.
- Topic label for this work item is "awesome enhancements".
- Research began only after the user explicitly instructed it.
- Gemini API-key auth and Gemini OAuth must be treated as distinct plan/bucket paths in downstream design.
- The external comparison source should be treated as a behavioral reference for OAuth handling, but must not be named in planning docs.
- The old local app implementation is not authoritative for this Gemini seam and should not drive the spec discussion.
- Existing storage/usage/UI plans should be extended, not bypassed; Gemini should plug into the existing requested/effective and usage-source patterns rather than creating a parallel system.

## Open Questions / Uncertainties
- Whether concurrent ledger work will reuse this `work_id` or produce a competing work item.
- What should the canonical precedence rule be when both Gemini OAuth and a Gemini API key are present?
- Should media generation remain API-key-only while chat/code execution can use OAuth, and how explicitly should that split appear in Settings/Auth UI?
- Should usage/plan UI show separate labels/buckets for Gemini OAuth vs Gemini API, or only show the effective mode for the current thread/run?
- Does Gemini OAuth need explicit project-context/onboarding states in the auth model, or is "authenticated" sufficient for MVP?
- Should Settings expose Gemini OAuth and Gemini API key in one combined provider card, or as two clearly separated sub-sections under Gemini?
- Should the UI offer an `auto` auth-mode policy, or force users to choose the Gemini auth surface per feature/capability?
- What exact `usage_source_kind` vocabulary should be canonical for Gemini so ledger/usage UI can explain whether numbers come from local estimates, OAuth quota APIs, or API-key-side estimates?
- Do we want Gemini auth status to remain a single provider card with multiple method badges, or introduce sub-rows / sub-realms analogous to other auth splits?

## Packetization Notes
- Not ready for packetization.
- Ready for discussion/alignment on:
  - canonical Gemini architecture (CLI-based vs direct-provider rewrite target)
  - UI/auth-state split
  - precedence/effective-mode rules
  - impacted docs to reconcile first

## Do-Not-Forget Details
- Keep `meta.json` status as `active` during pre-research discussion.
- Do not cite or reference the ledger in planning docs.
- Track terminology decisions, requested vs effective behavior, overrides, fallback behavior, and unresolved questions once discussion begins.
- Current code paths worth remembering:
  - `puppet-master-rs/src/platforms/gemini.rs`
  - `puppet-master-rs/src/platforms/platform_specs.rs`
  - `puppet-master-rs/src/platforms/auth_actions.rs`
  - `puppet-master-rs/src/platforms/auth_status.rs`
  - `puppet-master-rs/src/views/login.rs`
- Current high-value contradictions:
  - plans already allow Gemini direct-provider transport, but GUI/spec text still over-focuses API key and under-specifies OAuth as a distinct surface
  - usage/account wording does not yet cleanly separate Gemini OAuth bucket semantics from Gemini API-key semantics
- Temporary reference clone path:
  - `/home/sittingmongoose/.copilot/session-state/0e9a21a0-f7d3-4dda-9d29-bf10dfc5adc4/files/gemini-reference`
  - delete it when this research seam is complete
