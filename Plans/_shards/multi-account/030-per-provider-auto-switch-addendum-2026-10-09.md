# Shard 030: Per-Provider Auto-Switch Addendum (2026-10-09)

Source: `Plans/Multi-Account.md`

Source lines: L5377-L5506

Source SHA256: `449b238228de750c1964bf4283f7935677a4e79e98094f507a1e1c6443182dad`

---

## Per-Provider Auto-Switch Addendum (2026-10-09)

Auto-switch between accounts is set per AI provider (`Plans/Decision_Log.md#DL-174`). Before this, one global on/off and one switch point applied to every provider, and section 5's "unless provider/account overrides say otherwise" named a provider layer that no unit or setting gave. Four Settings rows now carry a provider scope beside their existing scopes: `ai.accounts.multi-account-switching` (auto-switch on or off), `ai.accounts.hard-switch-level` (the switch point, in percent left), `ai.accounts.soft-warning-level` (the warning level, in percent left) and `ai.accounts.cooldown-policy` (how long an account rests). `ai.accounts.cooldown-policy`, which was set per account only, also gains the global and project scopes, so each of the four rows has a global value and resolves through the same order, one ladder of global, project, provider and account for every threshold (an account's own switch level is `ai.accounts.hard-switch-level` at scope account, and `ai.accounts.account-threshold-override` is retired: owner decision 2026-10-10), and a provider that has no value of its own follows the shared value, the project value where one is set and otherwise the global value; the rest period's global value starts at its inventory default, the provider's own defaults. The provider value is one Settings value, edited in Settings > Providers & Accounts, where all four rows appear in the provider's own section, and on the Usage page's Accounts room, which hosts the auto-switch toggle and the switch point for each provider, through the same Settings transaction (`Plans/Settings_System.md#SSYS-044`), so the two always show the same value. The switching rules below follow the AI Account Center's per-provider policy (Codex and Antigravity), adapted to Puppet Master's attempt-boundary, reason-code and manual-override rules in section 5.

### MA-073 - Per-Provider Auto-Switch

```yaml
plan_unit_id: MA-073
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Auto-switch between accounts is set per provider. ai.accounts.multi-account-switching,
  ai.accounts.hard-switch-level, ai.accounts.soft-warning-level and ai.accounts.cooldown-policy each carry a provider
  scope in addition to their existing scopes, ai.accounts.cooldown-policy also carries the global and project
  scopes, and every threshold resolves through one scope ladder, global, then project, then provider, then account,
  over the scopes its row has, the most specific scope with a set value winning; a provider without its own value
  follows the resolved shared value (the project value where one is set, otherwise the global value), never the
  inventory default, and an account without its own value follows its provider's resolved value. An account's own
  switch level is ai.accounts.hard-switch-level at scope account (owner decision 2026-10-10, DL-174);
  ai.accounts.account-threshold-override is retired, and a value stored under it is read once and carried to
  ai.accounts.hard-switch-level at scope account, after which nothing reads or writes the retired id. Levels are
  stored as percent left and shown as percent used. A provider's or an account's resolved switch level always stays
  below the warning level that applies to it:
  neither surface offers a level that would cross them (on Usage the stepper stops and the menu disables levels at or
  past the warning level; Settings disables a crossing choice with the reason, Settings_System section 8). A
  provider's value is one Settings value: Settings > Providers & Accounts edits all four rows in the provider's own
  section, and the Usage Accounts room hosts the provider's auto-switch toggle and switch point; both edit it through
  the Settings owner with cmd.settings.transaction.preview and then cmd.settings.transaction.apply at scope provider
  for that provider id (Plans/Settings_System.md#SSYS-044), and neither surface keeps a copy. For each
  provider: auto-switch acts only while the provider has two or more signed-in accounts, and with one account it
  reads off until a second account is signed in while its stored value is kept, its notch drawn dim on every meter,
  and Usage shows auto-switch controls only where Settings does, for a provider of a kind with accounts that has two
  or more; every meter of that provider, and only of that provider, carries a notch at the provider's switch point; only a fresh, identity-bound reading reported
  by the provider for the active account may trigger a threshold switch, and a missing reading, a local estimate, a
  reading older than the provider's freshness limit, an account that must sign in again, or a window whose reset has
  passed without a new reading blocks it with that reason shown in plain words; the target is the eligible account of
  the same provider with the most remaining, with the account priority order of MA-036 and then the stable account id
  breaking ties, and an account is not eligible while it needs signing in, failed its sign-in renewal, has a
  mismatched identity, has an incomplete or stale reading, is cooling down, or is hard blocked; the switch waits for
  the attempt or message boundary of section 5, and meanwhile Usage and Settings say which account it will switch to
  once the provider is idle; after a switch the provider's cooldown-policy keeps it from switching straight back; when
  the active account has no plan quota left, no eligible account remains and the provider would draw paid credit or
  extra usage, Usage and Settings say so plainly; and a manual Use this account (cmd.account.select_profile) on an
  account already past its provider's switch point asks first, naming its reading and the switch point, at that
  account's Use control or, when no row of it is shown, centred over the page, and that confirmation covers that one
  manual choice only and is never read by automatic switching as consent for anything. An account exactly at its
  switch point is said to be at it, one beyond it past it, and one at 100% used has run out; the line for an
  exhausted account promises another account only when one qualifies under this rule. Each provider's auto-switch
  status is one of a closed set of states, one account, no windows, off, unread, watching, waiting for idle, due and
  no candidate, each shown in plain words as a projection of the scheduler's normalized reason codes of section 5,
  never a second stored status vocabulary: the MA-073 state table under this unit defines each state by the set of
  section 5 reason codes that holds for the provider, read in the table's order, and the state is derived from those
  codes each time and never stored.
gui_related: true
gui_classification_reason: Settings shows and edits each provider's auto-switch, switch point, warning level and rest period; the Usage Accounts room edits the auto-switch and switch point and shows the warning level and rest period read-only, with the notches, status and confirmations.
depends_on: [MA-036, MA-049, MA-069, SSYS-009, SSYS-018, SSYS-044]
unblocks: []
acceptance_criteria:
  - "The four rows resolve, for every provider and account, through one ladder, global, project, provider, account, the most specific set value winning wherever the row has that scope; every one of the four has global, project and provider scopes, and a provider with no value of its own shows and uses the resolved shared value, labelled as the shared value."
  - "An account's own switch level is read and written only as ai.accounts.hard-switch-level at scope account; a stored ai.accounts.account-threshold-override value is carried there once, and no surface reads or writes the retired id afterwards."
  - "Each status state shown equals the state the MA-073 state table derives from the provider's section 5 reason codes, and no status value is stored."
  - "Changing a provider's auto-switch, switch point, warning level or rest period in Settings, or its auto-switch or switch point on the Usage Accounts room, commits one Settings transaction at scope provider for that provider id, and the other surface shows the new value without a reload, before its next paint; neither surface holds its own copy."
  - "Neither surface offers a switch level at or past the warning level that applies at its scope (provider or account), or a warning level at or below its switch level."
  - "A provider with one account shows a dim notch on every meter and no auto-switch controls on Usage or in Settings."
  - "A provider with one signed-in account reads off until a second account is signed in, without changing its stored value; with two or more it acts on its own values only."
  - "Every meter of a provider carries a notch at that provider's switch point and no other provider's notch."
  - "A missing, locally estimated, stale, sign-in-required or reset-passed-without-reading active account never triggers a threshold switch, and the block reason is shown in plain words."
  - "The threshold switch picks the eligible account of the same provider with the most remaining, ties broken by account priority and then account id, never switches mid-attempt, shows the waiting target until the boundary, and does not switch back while the rest period runs."
  - "With no plan quota left and no eligible account, a provider that would draw paid credit or extra usage says so on Usage and in Settings."
  - "Use this account on an account past its provider's switch point asks first; declining changes nothing, and accepting dispatches one cmd.account.select_profile that section 5 treats as the manual override."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/settings_inventory.json (provider scope on the four ai.accounts rows, and global and project scopes on ai.accounts.cooldown-policy)
  - future per-provider auto-switch resolution and eligibility fixtures
risk_class: provider_auto_switch_scope_or_copy_drift
reasoning_tier: high
context_scope: multi_account_per_provider_auto_switch
implementation_surfaces:
  - Plans/Multi-Account.md
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: multi_account_per_provider_auto_switch
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-174
  - "AIAccountCenter main 04c252fb: src/web-server/services/codex-auto-switch-service.ts and src/antigravity/auto-switch/policy.ts (per-provider auto-switch reference; external, read-only)"
  - "AIAccountCenter main 04c252fb: web-dashboard/public/accounts-view.mjs and view-model.mjs (per-provider policy rows, meter notches, past-switch-point confirmation; external, read-only)"
  - "Concepts/usage-redesign/src/js/54-w-accounts.js (Usage redesign Accounts room; source-lineage-only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/d-switch-REPORT.md, SHA-256 30eab667e56fdaf329c6bfa1a137f3ff2947cea903b811eae7b5208379a1291a (per-provider auto-switch as built; approval of the scope changes: Jared 2026-10-09 item 2)"
preserved_exact_tokens:
  - ai.accounts.multi-account-switching
  - ai.accounts.hard-switch-level
  - ai.accounts.soft-warning-level
  - ai.accounts.cooldown-policy
  - ai.accounts.account-threshold-override
  - cmd.settings.transaction.preview
  - cmd.settings.transaction.apply
  - cmd.account.select_profile
negative_constraints:
  - Do not keep a Usage-local or provider-manager copy of a provider's auto-switch values, or write them past the Settings transaction.
  - Do not trigger a threshold switch from a stale, estimated, unbound or reset-passed reading.
  - Do not switch to an account of another provider under a provider's auto-switch, or switch mid-attempt.
  - Do not let automatic switching treat a manual confirmation as consent.
  - Do not invent a second auto-switch status vocabulary beside the scheduler's normalized reason codes.
owner_hints:
  - Plans/Multi-Account.md
  - Plans/Settings_System.md
```

#### MA-073 state table (owner decision 2026-10-10, USG-2)

Each auto-switch status state of MA-073 is defined by the set of section 5 reason codes that holds for the provider at that moment: the normalized account-selection reasons, the pressure and readiness values section 5 drives (`threshold_reached`, `exhausted`, `pattern_only_or_inferred`, `validating`, `eligible_pending_recheck`, `validation_required`) and the blocked/no-fallback reasons it records (`no_eligible_account`, `policy_forbids_fallback`, the canonical blocked reasons of `Plans/Decision_Policy.md`). The table is read top to bottom and the first row whose codes hold gives the state. No code is added for the table and no state is stored: the state is recomputed from the codes, so the scheduler's reason codes stay the one vocabulary. Where a row also names a MA-073 input (the number of signed-in accounts, the provider's resolved `ai.accounts.multi-account-switching`, section 5's attempt boundary), that input is why the code is recorded, not a second status.

| Order | State (plain words) | Section 5 reason codes that define it |
|---|---|---|
| 1 | single (one account) | `no_eligible_account`, recorded because the provider has fewer than two signed-in accounts; no `threshold_preemptive_switch`, `soft_threshold_preemptive_switch` or `cooldown_preemptive_switch` can be recorded for it |
| 2 | no_windows (no windows) | `pattern_only_or_inferred` for every account of the provider (no authoritative remaining counter or window); of the switch reasons only `hard_exhaustion_failover` can be recorded |
| 3 | off | `policy_forbids_fallback`, recorded because the provider's `ai.accounts.multi-account-switching` resolves off; `threshold_reached` or `exhausted` on the active account may hold beside it and only changes the words ("at" or "past" the switch point) |
| 4 | unread | the active account carries any of `credentials_expired`, `needs_configuration`, `validation_required`, `validating`, `eligible_pending_recheck`, `account_unhealthy`, `profile_unhealthy`, `provider_disconnected` or `pattern_only_or_inferred`, or no reading within the provider's freshness limit, so neither `threshold_reached` nor its absence may be decided |
| 5 | watching | none of the codes of rows 1 to 4, 6, 7 and 8: the active account holds a fresh reading without `threshold_reached` or `exhausted` |
| 6 | no_candidate (no candidate) | `threshold_reached` or `exhausted` on the active account together with `no_eligible_account`, every other account carrying a blocking code (`cooldown_active`, `credentials_expired`, `needs_configuration`, `account_unhealthy`, `profile_unhealthy`, `model_incompatible`, `exhausted`, `threshold_reached`, or no fresh reading) |
| 7 | waiting_idle (waiting for idle) | `threshold_reached` with `threshold_preemptive_switch` pending (or `exhausted` with `hard_exhaustion_failover` pending) and a chosen target, held until section 5's attempt or message boundary |
| 8 | due | the same code as row 7 with the boundary reached: the next resolution records `threshold_preemptive_switch` (or `hard_exhaustion_failover`) for the chosen target |

ContractRef: ContractName:Plans/Settings_System.md#SSYS-044, ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/Settings_System.md#SSYS-018, ContractName:Plans/FinalGUISpec.md#F3-441, ContractName:Plans/usage-feature.md#UF-107, ContractName:Plans/Decision_Log.md#DL-174, ContractName:Plans/Decision_Policy.md
