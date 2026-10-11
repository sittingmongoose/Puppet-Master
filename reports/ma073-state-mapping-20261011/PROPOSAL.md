# MA-073 account-state mapping — UNAPPROVED PROPOSAL

Awaiting **hpt-plans-lead's check and Jared's answer**. Source analysis only; this report approves no policy, adds no reason code, and changes no canon or implementation.

- Author/mailbox: `codex-ma073-proposal`, for `home-redesign-planner`.
- Branch: `research/ma073-state-mapping-20261011`.
- Canonical base: **`0fd763294610e8e30cc52a62b738c5034c8a9150`**, equal to HEAD and fetched `origin/main` when analysis began on 2026-10-11. All repository passages below are read from that Git object; line numbers belong to that revision.
- Operational brief: `/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/HANDOFF-planner-to-sol.md`, lines 63–67, SHA-256 `8fc022fedf0aa0f9847459d87e4ac8a294b15e7268f43889c2a46412016e3eb0`. This external handoff is pinned by bytes, not by the repository revision, and is not product canon. It leaves the pure-code policy and the possible `single_account`, `attempt_boundary_pending`, `reading_stale` additions unanswered.
- Delivery: the review copy and submission mail identify the pushed report commit SHA. The source base above is distinct from that report commit.

## Finding and scope

Canon already contains eight **provider auto-switch display states**, an explicit table order, and a prohibition on storing another status vocabulary. It also says those states are defined by section-5 reason codes, with no new code. That is an existing textual requirement, including the recorded USG-2 decision; it is not an approval of the three proposed additions. The actual table predicates also need account count, the resolved Settings toggle, authoritative reading/freshness facts, a chosen target and an attempt/message boundary. The existing reason-code set alone does not preserve all those distinctions. [M-table] [M-policy] [D-decision]

Consequently this proposal preserves the current table literally while identifying where its claimed code-only derivation is incomplete. It does not replace the table, settle Jared's pending interpretation, or assert that a native scheduler already emits every predicate. The current index routes this feature to MA-073/MA-049, SSYS-044 and UF-093/UF-107. [I-route]

“Account state” must not silently broaden this table's scope. MA-073 summarizes a provider's automatic switching; individual account authentication, configuration, availability, pressure, active identity and reading trust remain separate owner dimensions. `Logged in` is not `Ready`, and a route can be ready while Usage is unavailable. [M-readiness] [M-install] [C-auth] [M-reasons]

## Existing codes and fields: exact distinctions

| Evidence family | What canon actually defines | Relationship to MA-073 |
|---|---|---|
| Normalized account-selection reasons | Section 5 explicitly lists `soft_threshold_preemptive_switch`, `threshold_preemptive_switch`, `cooldown_preemptive_switch`, `preferred_recovered`, `hard_exhaustion_failover`, `cooldown_active`, `account_unhealthy`, `profile_unhealthy`, `credentials_expired`, `needs_configuration`, `provider_disconnected`, `model_incompatible`. Raw provider conditions remain evidence beside normalized PM reasons. | These are existing scheduler reason tokens. Their presence does not by itself encode account count, which account owns a fact, pending versus completed switching, or boundary progress. [M-reasons] |
| Blocked/no-fallback reasons | Decision Policy lists `no_eligible_account`, `no_eligible_profile`, `policy_forbids_fallback`, `hard_constraint_forbids_fallback`, `provider_unavailable`, `no_eligible_units`, `provider_disabled`, `provider_unconfigured`, `all_units_cooldown`, `all_units_hard_blocked`; fallback requires an eligible, policy-permitted unit. | The table explicitly reuses `no_eligible_account` and `policy_forbids_fallback`. A general blocked reason is not automatically a provider toggle state or an MA-073 row. [P-block] [M-table] |
| Pressure and recheck state | Section 5 drives `threshold_reached` at authoritative remaining `<=` the configured switch threshold, and `exhausted` at zero remaining or explicit provider exhaustion. It calls weaker counterless evidence `pattern_only_or_inferred`. Reset expiry moves to `validating` or `eligible_pending_recheck`. | The table calls these “codes,” but section 5 also describes them as pressure/readiness values. `UsagePressureState` closes to `nominal`, `approaching_threshold`, `threshold_reached`, `exhausted`, `unknown`; it does not include `pattern_only_or_inferred`. Recheck belongs to availability/readiness, and `validation_required` is also a configuration-state value. No field-to-`reason_codes[]` serialization for all these values is specified by these passages. [M-signals] [C-state] |
| Selected-unit resolver evidence | `reason_codes[]` contains ordered concrete reasons for the selected `selectable_unit_id` and `resolution_outcome`. `health_state`, `pressure_state`, `last_usage_snapshot`, `last_cooldown_snapshot`, and effective runtime states are separate fields. Storage preserves that separation. | This is exact field ownership, not an established provider-wide aggregation of current reasons for the active account and every rejected candidate. Historical switch reasons cannot alone prove a current pending target. [M-record] [S-record] |
| Reading authority and freshness | UF-085/UF-087 define normalized Usage identity, `source_class`, `source_confidence`, `source_authority`, `projection_freshness`, `projection_health`, `observed_at_utc` or `last_updated`, and degraded/unknown reasons. Storage separates freshness `current / refreshing / stale` from health `healthy / degraded / unavailable`. | MA-073 additionally requires a fresh provider-reported reading bound to the active account. A local estimate cannot trigger its threshold switch. Reading age, identity binding and a reset crossed after sampling are not interchangeable with account health or a switch reason. `projection_freshness=stale` is an existing field value, not an existing reason token named `reading_stale`. [U-values] [U-record] [S-fresh] [M-policy] |
| Resolved Settings values | `ai.accounts.multi-account-switching`, `ai.accounts.hard-switch-level`, `ai.accounts.soft-warning-level`, `ai.accounts.cooldown-policy` resolve through their admitted scopes. Levels are stored as percent left and displayed as percent used. | Off and threshold copy depend on effective values; no Usage-local copy is authoritative. The account switch level is `ai.accounts.hard-switch-level` at account scope; the retired `ai.accounts.account-threshold-override` is migration input only. [M-settings] [T-control] |

The three candidate tokens from the handoff have **no occurrence in tracked non-pipeline Plans at the base**. The bounded search excluded `_shards`, `.plan_index`, `.evidence`, `.plan_migration`, `.audits` and `ledgers`; its no-match result does not claim anything about external concepts, raw evidence or runtime implementation. No candidate token is promoted here.

## Current eight-state mapping

Every row below transcribes or paraphrases the existing MA-073 table. “Additional operand” identifies a requirement already present in canon; it is not a proposed field or implementation rule. The last column distinguishes an exact textual mapping from a code-only inference that the sources do not establish. [M-table]

| Order / display token | Existing predicate and exact related tokens | Additional operand / limit of support |
|---|---|---|
| 1 — `single` (“one account”) | `no_eligible_account` **because fewer than two signed-in accounts**; the row excludes `threshold_preemptive_switch`, `soft_threshold_preemptive_switch`, `cooldown_preemptive_switch`. | Count/cause is essential. `no_eligible_account` also appears in row 6. The stored toggle is retained while auto-switch reads off with one signed-in account. This is not the same predicate as the `off` row. |
| 2 — `no_windows` (“no windows”) | `pattern_only_or_inferred` **for every account**: no authoritative remaining counter or window. Of switch reasons, the row permits only `hard_exhaustion_failover`. | Needs per-account attribution and an all-accounts check. One occurrence of `pattern_only_or_inferred` is insufficient. “Provider declares no plan windows,” `quota not exposed`, missing usage and this bucket have no universal equivalence in the cited owners. [U-values] [U-rooms] |
| 3 — `off` | `policy_forbids_fallback` **because the resolved provider toggle is off**. Active `threshold_reached`/`exhausted` may coexist and affect copy. | The effective toggle/cause disambiguates a generic policy block. The row does not prove that every `policy_forbids_fallback` means the toggle is off. “At,” “past,” and “run out” remain the separate MA-073 copy distinctions. [M-policy] |
| 4 — `unread` | Active account has any of `credentials_expired`, `needs_configuration`, `validation_required`, `validating`, `eligible_pending_recheck`, `account_unhealthy`, `profile_unhealthy`, `provider_disconnected`, `pattern_only_or_inferred`, **or no reading within the provider's freshness limit**. Threshold truth or its absence cannot then be decided. | The listed matches are explicit. The final freshness disjunct is a fact, with no named section-5 stale-reading reason. Missing/local-estimated/unbound/reset-passed readings block threshold switching in MA-073, but this row does not supply a distinct normalized reason for each case. [M-policy] |
| 5 — `watching` | None of the predicates of rows 1–4 **or 6–8** holds; active reading is fresh, without `threshold_reached` or `exhausted`. | Requires positive evidence of freshness. An empty reason array or a missing reading is not sufficient. By deduction, a fresh authoritative reading above the switch threshold can be watching even in the warning band; `approaching_threshold` is not an automatic due-state mapping. [M-signals] |
| 6 — `no_candidate` (“no candidate”) | Active `threshold_reached` **or** `exhausted`, plus `no_eligible_account`; every other account is blocked by `cooldown_active`, `credentials_expired`, `needs_configuration`, `account_unhealthy`, `profile_unhealthy`, `model_incompatible`, `exhausted`, `threshold_reached`, **or no fresh reading**. | Needs active/candidate attribution, earlier-row exclusion and absence of an eligible backup. General MA-073 eligibility also excludes failed sign-in renewal, mismatched identity, incomplete/stale readings and hard blocks; the table does not give a distinct code mapping for each. [M-policy] |
| 7 — `waiting_idle` (“waiting for idle”) | Active `threshold_reached` with `threshold_preemptive_switch` pending, **or** `exhausted` with `hard_exhaustion_failover` pending, **and a chosen target**, held until the attempt/message boundary. | Pending intent, target identity and an unreached boundary are indispensable. The passages supply no separate boundary-pending reason token or exact named pending-target field. A recorded prior switch reason does not establish this state. [M-boundary] [M-record] |
| 8 — `due` | Same reason alternatives as row 7, **with the boundary reached**; the next resolution records `threshold_preemptive_switch` or `hard_exhaustion_failover` for the target. | The reason tokens alone are identical to row 7's alternatives. Boundary progress and next-resolution context distinguish due from waiting; due does not mean a switch has already completed. [M-boundary] |

Two deductions expose the code-only gap without inventing new behavior:

- A lone exhausted account and two signed-in exhausted accounts can have the same distinct tokens `exhausted`, `threshold_reached`, `no_eligible_account`. The table distinguishes `single` from `no_candidate` using account count and attribution, not token membership alone.
- A chosen threshold-switch target before and after the boundary uses the same `threshold_reached` / `threshold_preemptive_switch` alternatives. The table distinguishes `waiting_idle` from `due` using boundary/pending facts.

Both examples concern a bare set of token names. Canon does not define a complete current provider-level, account-attributed reason object that would carry all those operands. This is a contract gap, not proof that such an implementation is impossible. [M-record] [S-record] [M-table]

## Precedence that canon actually provides

- **Display:** read the table top to bottom, first matching row. `watching` explicitly excludes rows 6–8 as well as earlier rows; it is not an unconditional fallback. The prose's enumeration of the closed set is not a different precedence order. [M-table] [M-policy]
- **Settings:** global → project → provider → account, over scopes the setting row has; the most specific set value wins. An unset provider follows project, otherwise global; an unset account follows its provider. [M-settings]
- **MA-073 threshold target:** eligible account of the same provider with most remaining, then MA-036's account priority (lower number first), then stable account ID. This specific rule does not rewrite every other resolver/stickiness rule. [M-policy] [M-priority]
- **Evidence:** section 5 orders hard runtime failure, direct provider/account telemetry, explicit structured output, provider heuristics, provider-document/default expectations, then log/local inference. Authoritative cooldown with `cooldown_until` sets `hard_block=true` until revalidation; reset expiry does not silently restore Ready. [M-signals] [M-no-switch] [C-state]
- **Ownership:** completed work belongs to the account actually used; the next attempt/message re-resolves. Health, cooldown, pressure and resolution outcome do not overwrite one another, and requested/effective identity and switch lineage remain historical evidence. [M-boundary] [M-reasons] [Q-lineage]

There is **no specified primary-copy priority among multiple unread reasons**, no blanket `exhausted`-versus-`threshold_reached` display tie-break, and no rule equating the order within `reason_codes[]` with table row precedence. The table does not assign its pending-switch rows to `soft_threshold_preemptive_switch`, `cooldown_preemptive_switch` or `preferred_recovered`, nor convert all Decision Policy blocked reasons into `no_eligible_account`. These are unsupported extensions, not choices made by this report. [M-table] [M-reasons] [M-record] [P-block]

## Display facts outside the eight states

MA-049 consumes effective account/auth/billing, pressure/cooldown, confidence/stale/estimated labels and switch reason without flattening accounts. MA-069 and UF-087 retain `disabled`, `not_exposed`, `unknown`, stale/estimated and hidden-cost states; missing usage is not zero. CV-128 retains separate credential, configuration and availability dimensions. None is replaced by one of MA-073's eight provider labels. [M-usage] [M-normalized] [U-values] [C-auth]

UF-107 separately defines provider roster/setup lines (`Not set up` / `Not installed`), each account's active identity and windows, and reset-passed copy: `Reset at <time> · new reading pending`, with the old reading only in history. That reset fact can explain an active-account `unread` or an ineligible candidate, but the reset copy itself is not a new scheduler reason. UF-093's `Provider Setup Required` is another owner-defined setup surface, not a ninth MA-073 state. Final GUI F3-628 consumes presentation and preserves unknown-versus-zero; it owns no substitute scheduler mapping. [U-rooms] [U-actions] [G-display]

## Minimal open items

**O1 — Jared's pending reason-code policy, after hpt-plans-lead checks this derivation.** Does “every Usage account state is defined purely by section-5 reason codes” mean the eight MA-073 provider auto-switch labels, or literally all individual account/reading states? For the intended scope, must the normalized reason contract alone encode the non-code operands above, or may the projection use the existing canonical state/input dimensions? The current table claims the former while its predicates require the latter unless those facts are also represented in the reason contract. The handoff's possible additions `single_account`, `attempt_boundary_pending`, `reading_stale` remain candidates awaiting Jared's answer, with no admitted semantics, payload scope or emission rules. Their names alone do not resolve all account attribution, all-accounts coverage, target identity, missing/estimated/unbound reading, or generic-policy-cause distinctions. No policy option is selected here.

**O2 — separate account-level hold-on-write gap; retained, not repaired.** SSYS-044 binds account-scope preview/apply, forbids painting an unadmitted value as committed, reconciles/rolls back the typed result, and holds/refuses threshold-crossing writes. UF-107 holds incoming live display updates during gestures, menus, inspector/room changes and while hidden or Paused. Those rules do not explicitly specify the account-level display-update hold for an in-flight account-setting write, its coverage of the account card and Details, or its release on every terminal transaction outcome. That open item must stay separate from reason-code projection; this report neither invents its behavior nor claims the existing validation hold settles it. [T-control] [U-rooms]

The supported mapping and precedence above can be checked now. Any later owner/contract correction remains a separate authorized task after the check and answer; this report is not compile, design or landing authority.

## Pinned source catalogue

All links below use base `0fd763294610e8e30cc52a62b738c5034c8a9150`, not a moving branch. Unit identifiers accompany the exact source passages. SHA-256 values are for the full source-file bytes at that base; no captures or copied source trees are retained.

| Source | SHA-256 at base |
|---|---|
| `AGENTS.md` | `24a657c185d234a791e4c4ffdbfa8a77b8698b22696a8ddbda5caee1aa08b810` |
| `.claude/CLAUDE.md` | `c2e4a5602b8e221238985a9310be8d5bbb134686a738969579c564a63b8702c3` |
| `Plans/00-plans-index.md` | `39ce002a1651efc7c59fced4c9b6486b1e00d27a4d38ff73783d09751dd69089` |
| `Plans/Multi-Account.md` | `ea963f5bde327df3fdffb268efe8ebeb01c6813b9a918ef9a1b96af1208ae907` |
| `Plans/Decision_Policy.md` | `72a2faae8bec90e7e64eb6d845451a37b9f491de47e4bcb8e00339ff5bf4861d` |
| `Plans/Contracts_V0.md` | `8772b2d696177a79dbb77d016a5e3f1d8c1ec0aef2150ce77ee1487022d812e2` |
| `Plans/usage-feature.md` | `bec43c18313870739e4570ebce77cfe5ce82e0671caf50d48c587c4c9a37f824` |
| `Plans/Settings_System.md` | `458530bb6c7f443142721d15fcf4cf47758f01929eda2be9f704adf87a3bd79a` |
| `Plans/Decision_Log.md` | `b2e1fd90a9af2fe9a453a5e16acace05236f2f53fbcc73c8b0784b7cd699f4b4` |
| `Plans/storage-plan.md` | `83ef7894d34fc118940e34a528bb950fab9a6f7cfd82e8d982ed8e454ebe2ed6` |
| `Plans/Prompt_Pipeline.md` | `a8a9d9a6900f42f9cfe12e07654f30285c6024982042586f81d2eb4cc8d59bac` |
| `Plans/FinalGUISpec.md` | `3b92db6358fe8c3a4d9cab44dbfd8d0ed98036cfb44ec29c2c5097cd36771b1a` |

Passage register:

- **I-route:** index lines 18–19, current Usage owner routing.
- **M-table:** MA-073 table, lines 5494–5509, all eight predicates and row order.
- **M-policy:** MA-073, lines 5410–5433, eligible readings/accounts, target selection, boundary, copy and projection requirements.
- **M-settings:** MA-073, lines 5388–5409, settings resolution, account-level migration and transactions.
- **M-record:** MA-015/MA-016/MA-017, section 4.5 lines 282–338, selected-unit identity, effective state and ordered reasons.
- **M-boundary:** MA-018, section 5 lines 355–359, unit lines 1932–1952.
- **M-reasons:** MA-019/MA-020, section 5 lines 363–370, unit lines 1986–2006.
- **M-signals:** MA-021, section 5 lines 374–395, unit lines 2111–2133.
- **M-no-switch:** MA-022, section 5 lines 399–418.
- **M-priority:** MA-036, lines 3091–3112, lower numeric priority and stickiness.
- **M-readiness:** MA-040, section 9.3 lines 598–623, unit lines 3345–3366.
- **M-install:** MA-070 installation/authentication/readiness separation, line 5203.
- **M-usage:** MA-049, lines 3887–3912, Usage consumer and all-account display.
- **M-normalized:** MA-069, lines 5100–5118, normalized provider/account Usage displays.
- **P-block:** DP-035, addendum lines 335–340 and 376; unit lines 1988–2006.
- **C-auth:** CV-128, AuthState line 1587; unit lines 9625–9647.
- **C-state:** CV-139, lifecycle lines 1676–1706; unit lines 10189–10211.
- **U-values:** UF-087, lines 5430–5450, display value, authority and freshness fields.
- **U-record:** UF-085, lines 5620–5639, normalized accounting identity and source classes.
- **U-actions:** UF-093, lines 6476–6488, explicit account controls and setup surface.
- **U-rooms:** UF-107, lines 7309–7331, roster, windows, reset truth, account controls and Live holds.
- **T-control:** SSYS-044, lines 2958–2997, provider/account binding, write admission, reconciliation and threshold validation.
- **D-decision:** DL-174, lines 3736–3740 and unit lines 13327–13337, existing USG-1/USG-2/D43 records.
- **S-record:** runtime identity passage lines 1336–1378, optional selected/effective fields, snapshot storage and resolver reasons; SP-115 lines 8980–8987 and SP-116 lines 9051–9056 preserve snapshot and reason ownership.
- **S-fresh:** SP-117, lines 1382–1384; unit lines 9106–9113, distinct freshness and health.
- **Q-lineage:** PP-045, section 6.4 lines 601–624; unit lines 2906–2914, requested/effective account and switch history.
- **G-display:** F3-628, lines 43729–43756, presentation consumer, notches and unknown-versus-zero.

[I-route]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/00-plans-index.md#L18-L19
[M-table]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L5494-L5509
[M-policy]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L5410-L5433
[M-settings]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L5388-L5409
[M-record]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L282-L338
[M-boundary]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L355-L359
[M-reasons]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L363-L370
[M-signals]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L374-L395
[M-no-switch]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L399-L418
[M-priority]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L3091-L3112
[M-readiness]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L598-L623
[M-install]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L5203
[M-usage]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L3887-L3912
[M-normalized]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Multi-Account.md#L5100-L5118
[P-block]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Decision_Policy.md#L335-L340
[C-auth]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Contracts_V0.md#L9625-L9647
[C-state]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Contracts_V0.md#L1676-L1706
[U-values]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/usage-feature.md#L5430-L5450
[U-record]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/usage-feature.md#L5620-L5639
[U-actions]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/usage-feature.md#L6476-L6488
[U-rooms]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/usage-feature.md#L7309-L7331
[T-control]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Settings_System.md#L2958-L2997
[D-decision]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Decision_Log.md#L3736-L3740
[S-record]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/storage-plan.md#L1336-L1378
[S-fresh]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/storage-plan.md#L1382-L1384
[Q-lineage]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/Prompt_Pipeline.md#L601-L624
[G-display]: https://github.com/sittingmongoose/Puppet-Master/blob/0fd763294610e8e30cc52a62b738c5034c8a9150/Plans/FinalGUISpec.md#L43729-L43756

## Verification and authority boundary

Read-only checks: source passages and file hashes from the pinned Git object; exact candidate-token absence search; report reference/range and hash checks; report-only diff inspection. No native behavior, browser, GUI/source code, tests, schemas or governance gates are claimed or changed. No subagent or Opus reviewer is started. Only this compact report is committed/pushed; no main landing, landing lock or shared-checkout mutation is authorized.
