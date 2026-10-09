# Shard 030: Per-Provider Auto-Switch Addendum (2026-10-09)

Source: `Plans/Multi-Account.md`

Source lines: L5377-L5471

Source SHA256: `a8b5581087437e0a209e710ed727b27c2e3081fa1b19b1d74a3b08afeffdb1cc`

---

## Per-Provider Auto-Switch Addendum (2026-10-09)

Auto-switch between accounts is set per AI provider (`Plans/Decision_Log.md#DL-174`). Before this, one global on/off and one switch point applied to every provider, and section 5's "unless provider/account overrides say otherwise" named a provider layer that no unit or setting gave. Four Settings rows now carry a provider scope beside their existing scopes: `ai.accounts.multi-account-switching` (auto-switch on or off), `ai.accounts.hard-switch-level` (the switch point, in percent left), `ai.accounts.soft-warning-level` (the warning level, in percent left) and `ai.accounts.cooldown-policy` (how long an account rests). `ai.accounts.cooldown-policy`, which was set per account only, also gains a global scope, so each of the four rows has a global value, and the global value is the default for every provider that has no value of its own; the rest period's global value starts at its inventory default, the provider's own defaults. The provider value is one Settings value, edited in Settings > Providers & Accounts, where all four rows appear in the provider's own section, and on the Usage page's Accounts room, which hosts the auto-switch toggle and the switch point for each provider, through the same Settings transaction (`Plans/Settings_System.md#SSYS-044`), so the two always show the same value. The switching rules below follow the AI Account Center's per-provider policy (Codex and Antigravity), adapted to Puppet Master's attempt-boundary, reason-code and manual-override rules in section 5.

### MA-073 - Per-Provider Auto-Switch

```yaml
plan_unit_id: MA-073
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Auto-switch between accounts is set per provider. ai.accounts.multi-account-switching,
  ai.accounts.hard-switch-level, ai.accounts.soft-warning-level and ai.accounts.cooldown-policy each carry a provider
  scope in addition to their existing scopes, ai.accounts.cooldown-policy also carries a global scope, and each
  resolves through the scopes its row has in the order account override, then provider, then project, then global;
  the global value is the default for every provider without its own value, and
  ai.accounts.account-threshold-override stays the per-account layer that wins over the provider value. A
  provider's value is one Settings value: Settings > Providers & Accounts edits all four rows in the provider's own
  section, and the Usage Accounts room hosts the provider's auto-switch toggle and switch point; both edit it through
  the Settings owner with cmd.settings.transaction.preview and then cmd.settings.transaction.apply at scope provider
  for that provider id (Plans/Settings_System.md#SSYS-044), and neither surface keeps a copy. For each
  provider: auto-switch acts only while the provider has two or more signed-in accounts, and with one account it
  reads off until a second account is signed in while its stored value is kept; every meter of that provider, and
  only of that provider, carries a notch at the provider's switch point; only a fresh, identity-bound reading reported
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
  account already past its provider's switch point asks first, naming its reading and the switch point, and that
  confirmation covers that one manual choice only and is never read by automatic switching as consent for anything.
  Each provider's auto-switch status is shown in plain words from the scheduler's normalized reason codes of section 5,
  not from a second status vocabulary.
gui_related: true
gui_classification_reason: Settings shows and edits each provider's auto-switch, switch point, warning level and rest period; the Usage Accounts room edits the auto-switch and switch point and shows the warning level and rest period read-only, with the notches, status and confirmations.
depends_on: [MA-036, MA-049, MA-069, SSYS-009, SSYS-018, SSYS-044]
unblocks: []
acceptance_criteria:
  - "The four rows resolve, for every provider, account override over provider over project over global wherever the row has that scope; every one of the four has a global value, and a provider with no value of its own shows and uses it, labelled as the default."
  - "Changing a provider's auto-switch, switch point, warning level or rest period in Settings, or its auto-switch or switch point on the Usage Accounts room, commits one Settings transaction at scope provider for that provider id, and the other surface shows the new value without a reload; neither surface holds its own copy."
  - "A provider with one signed-in account reads off until a second account is signed in, without changing its stored value; with two or more it acts on its own values only."
  - "Every meter of a provider carries a notch at that provider's switch point and no other provider's notch."
  - "A missing, locally estimated, stale, sign-in-required or reset-passed-without-reading active account never triggers a threshold switch, and the block reason is shown in plain words."
  - "The threshold switch picks the eligible account of the same provider with the most remaining, ties broken by account priority and then account id, never switches mid-attempt, shows the waiting target until the boundary, and does not switch back while the rest period runs."
  - "With no plan quota left and no eligible account, a provider that would draw paid credit or extra usage says so on Usage and in Settings."
  - "Use this account on an account past its provider's switch point asks first; declining changes nothing, and accepting dispatches one cmd.account.select_profile that section 5 treats as the manual override."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/settings_inventory.json (provider scope on the four ai.accounts rows, and global scope on ai.accounts.cooldown-policy)
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

ContractRef: ContractName:Plans/Settings_System.md#SSYS-044, ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/Settings_System.md#SSYS-018, ContractName:Plans/FinalGUISpec.md#F3-441, ContractName:Plans/usage-feature.md#UF-107, ContractName:Plans/Decision_Log.md#DL-174
