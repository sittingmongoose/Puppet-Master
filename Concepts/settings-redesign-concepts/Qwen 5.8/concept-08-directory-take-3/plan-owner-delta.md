# Plan-owner delta — concept-08-directory-take-3 — Qwen 5.8

Packet: PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18.
This concept demonstrates all 42 required families concept-natively and renders the 9 deferred families as reachable insertion shells with named owners.

## Inventory legacy `global` scope → schema impact

The real inventory (`PMInventoryData`) still carries legacy `scope: ["global"]` / `["global","account"]` style arrays on many rows (e.g. `general.visual.theme`, `ai.accounts.anthropic-api-key`, `ai.usage.monthly-spend-limit`). This concept is a Project-only product:

- No scope selectors, no inheritance UI, no profiles/sync surfaces are rendered anywhere.
- Every mutation receipt states "this Project only", matching the PMState2 store contract.
- Schema impact (candidate, for plan owners): the `global` token should be reinterpreted as "host default seed" or dropped; a migration table mapping legacy scope arrays to the Project-only schema is required before canon adoption. Until then, concepts must ignore `scope` for presentation and keep it as raw evidence in row Details (Exposure/tier remain visible).
- `account`-scoped rows (API keys) remain owned by the Providers manager credential model: vault-ref/PM-secret/CLI-owned rendering, never raw.

## Supersessions

- Bloom-modal navigation vocabulary (`cmd.settings.bloom.open`, chip/shelf grammar) is superseded by the directory model: Home domain cards, domain overview destination rows, manager routes. Retire or alias per candidate-command-delta.json.
- Right-panel settings language is superseded; Settings is a full workspace inside the left-shell canon.
- Take 3 differentiates from Take 1 (denser two-column directory) and Take 2 (editorial list) via: fewer larger cards with icon/title/purpose hierarchy, manager-destination domain overviews, provider status-card summary with explicit quick actions, and soft scale/transfer motion at low density.

## Plan-owner notes (demonstrated families)

- **Models System / Multi-Account / CLI Bridged / OpenCode**: provider summary answers the six default questions with status cards; quick actions are explicit; CLI-owned OAuth never PM-direct; unknown-owner manual-only; shadowed/selected installations; update ask-first, scheduled-idle, verification-failed→rolled-back fixtures.
- **Assistant Memory / Context**: half-life-as-activation, verification, pinning, restore, gist health + rebuild; instruction chain admission and excluded paths.
- **Personas / Goal / Crew / Permissions / BSD**: behavior-not-authority; ceilings-not-live-state; requested-vs-effective; last-match-wins + FileSafe floor; read-only advisor.
- **System owners (Storage/Backup/Lifecycle/History/Artifacts/Cleanup/SearchIndex/Doctor)**: four honest backup classes; compaction as owner-admitted request only; export/import/conflict/rollback receipted; redaction honest; dry-run first cleanup; phased index rebuilds; per-check receipts.
- **Extension owners (MCP/Skills/Plugins/Tools/Commands/GHA)**: progressive exposure; trust opt-in; channel/restart; installed/enabled/selected/invoked; dry-run never sends work; runs stay on GitHub.
- **Deferred owners**: nine shells name canonical owner, insertion destination, and return/deep-link contract; no fabricated backend state machine (see manager-coverage.json).

## Closure required elsewhere

- Mint or retire `cmd.settings.*` candidates against Plans/UI_Command_Catalog.md.
- Decide directory-card health derivation (notices-only today).
- Fold family fixture rows into inventory with real ids when owners land them.
