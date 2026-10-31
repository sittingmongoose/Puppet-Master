# Shard 040: Usage Page Redesign In PMConcept7 Addendum (2026-10-09)

Source: `Plans/usage-feature.md`

Source lines: L7316-L7597

Source SHA256: `046c8e1a0293d770e19de008e04f677efcf86daee6e414639c1ef4ba0d415d71`

---

## Usage Page Redesign In PMConcept7 Addendum (2026-10-09)

Jared approved the redesigned Usage page and asked for it to replace the old one in PMConcept7 (DL-173 to DL-179). The decisions are recorded at `/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/DECISIONS-20261009.md` (SHA-256 `fd8d2d8a092e97f2964331dfe3befea99f2aa66691b5021313bae2cad0a25008`) and his notes of 2026-10-09 at `/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/HANDOFF-usage-upgrade-20261009.md` section 2 (SHA-256 `d009d908af6785fd19866b83821313d65165ed0169737ab72bcd70c04539fdd5`). This addendum owns what the redesigned page must do; its look is owned by `Plans/FinalGUISpec.md#F3-628`, its presentation grammar's single owner by `Plans/DRY_Rules.md#DR-058`, per-provider auto-switch by `Plans/Multi-Account.md#MA-073`, and the board transaction by `Plans/Widget_System.md#WS-019`. UF-089, UF-092 to UF-096 are amended in place above. The concept sources under `Concepts/usage-redesign/` are source lineage only.

### UF-107 - Redesigned Usage Page: One Provider Catalog, Every Account, Accounts In Place, Honest Pace And Live Readings

```yaml
plan_unit_id: UF-107
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  The redesigned Usage page replaces the old one (DL-173) and keeps its thirteen rooms, its rail of
  rooms and its overall layout. No datum the previous page showed is dropped; adding is allowed, and
  a fact or series that was a static concept fixture stays in its natural widget, labelled as a
  fixture. One provider catalog: every provider name, mark, group and order on the page is the
  Settings provider catalog's (Settings > AI > Providers & Accounts): its display names, its three
  groups Subscriptions and plans, Pay as you go, and Free and your own, and its order. The page's
  providers and accounts are the Settings state's own roster, so the two pages always agree; usage
  facts (each window's use and limit, reset truth, source and freshness, pressure, cooldown and
  history) come from Usage projections keyed by provider id and account id. A provider's windows are
  those its Settings definition declares, and Usage invents none. A provider with no account or not
  yet set up shows as one compact line that says Not set up or Not installed, with a Set up in
  Settings action that dispatches cmd.settings.open with a typed Settings target, never as an empty
  card. Every account is shown (MA-049): the Accounts room and Plans & limits show one row or card
  per account, grouped by provider, including every account of the same provider (three ChatGPT /
  Codex accounts show as three), never only the active account. Each account shows its identity,
  plan, each window's use or headroom with its reset, its source and freshness, and whether it is
  the active account. Plans & limits has one plate per provider with accounts and one row per
  account, every window a meter cell with its reset; a plate too small for full rows shows the
  remaining accounts as lines (mark, nickname and state, and every window value) with hover and
  Details, and never drops an account. The windows timeline has one lane per account, grouped by
  provider, and names once, under the lanes, the providers that report no plan windows. A window's
  quota history can compare that window across the provider's accounts: its legend names every
  account, marks the active one (active) and an account without history no history, and the stretch
  during which the open account was active is marked from the switch log. A window's provenance
  (truth, source and sampled time) is in its hover and Details, not in the body. Readings are never
  added or averaged across accounts, and a missing reading never reads as zero. Reset truth: when a
  window's reset has passed and its reading predates the reset, the window has no current reading.
  It reads Reset at <time> · new reading pending, never 0% and never the old percentage; the old
  reading stays in history only, and the hover gives the last reading's age and source. The words
  wrap inside the meter cell in every room. The Accounts room acts in place through the real owners
  (DL-174). An account's "Use this account" control is labelled as an override, shows only where the
  provider's capability supports_manual_set_active is true, and dispatches
  cmd.account.select_profile; activating an account that is already past its provider's switch point
  asks first, as MA-073 sets out. Each provider with two or more accounts shows its Auto-switch
  toggle and switch level, which are the Settings rows ai.accounts.multi-account-switching and
  ai.accounts.hard-switch-level at that provider's scope: changing them on the card dispatches
  cmd.settings.transaction.preview and then cmd.settings.transaction.apply with scope=provider
  through the Settings owner (SSYS-044), and Settings and the card always show the same value; a
  provider without a value of its own shows, and runs on, the value MA-073 resolves for it. Each
  account of such a provider shows its own switch level, ai.accounts.hard-switch-level at scope
  account, on its account card and in its Details (owner decision 2026-10-10, D43): changing it
  dispatches the same pair with scope=account and the account id, under SSYS-044's hold rules.
  Whether that level is the account's own or follows its provider is said in words under the value
  where the plate gives the levels a column of their own, and in every form by the control's mark:
  the provider's own mark beside a level that follows the provider, the meters' notch on an edge
  beside the account's own; its hover tag, its accessible name and its menu say it in words. The
  provider's warning level and rest period show on its plate as read values and are edited in
  Settings, reached through Open in Settings. Open in Settings dispatches cmd.settings.open with
  target_type=setting. A provider with one account shows that auto-switch needs a second account
  instead of the controls, its account's switch level included. Every meter of a provider carries a
  notch at that provider's switch point, and each provider's auto-switch state is shown in plain
  words as MA-073 projects it; Usage decides no switch. Pace without countdowns (DL-175): pace is
  said in one unit everywhere, points ahead of or behind the usual pace (for example +11 pts vs
  norm). No clock to running out is shown, such as a time until a limit is reached, a runway or a
  time left at the current pace; headroom as a percentage (for example 31% left) is shown, month-end
  spend appears only as a labelled estimate, and reset times keep their own rules (UF-045). The
  rejection of RunOutProjection (DR-038) stands. Live readings (DL-177): the page is Live by
  default. While Live, Usage projection updates that arrive are applied in place, with one change
  moment per batch of updates and nothing moving between updates; updates that arrive while the page
  is not shown, during a gesture, an open menu, the inspector or a room change are held and applied
  together as one change once the hold ends. Paused holds arriving updates for display only and
  keeps the values shown with their freshness; it never stops collection, background refresh, alerts
  or accounting, and turning Live back on applies the latest values at once. The Live / Paused
  choice is a remembered view preference (UF-095 family live) with no command, setting, event or
  receipt; under Reduce Motion every change lands final at once. Amended 2026-10-10 (DL-186): live
  readings and the lab-only Play the next hour run on dashboards too, per board
  (Plans/Widget_System.md#WS-030), under the same idle rule: nothing animates at idle except a live
  change while Live is on, and a board that is not shown does no beat work. The concept's demo
  controls are lab-only (DL-177, on ACD-474's precedent; the coordinator's recommendation recorded in
  DL-177, which Jared decided on 2026-10-17, DL-230), and this unit is the one
  owner of that disposition, to which UCC-147, the wiring units and the test suite point: Play the
  next hour, Back to now, the Demo time label, the concept's feature switches and query flags, and
  its demo reading cadence receive no command, setting, wiring row, persisted key or test gate, and
  nothing a demo clock shows is a Usage reading (UF-092). Board actions (DL-176): Tidy repacks the
  room's board on request, and every settled move, resize, preset change, hide or show lets cards
  float up into the holes above them, keeping their order (board gravity); WS-019 owns how both are
  previewed and resolved. Tidy and gravity each commit as one settled layout transaction with one
  receipt through one existing widget command as WS-019 sets out, with no move command per card and
  no new command. A size preset commits through cmd.widget.resize with its preset_id (WS-020), a
  chart type or option through cmd.widget.configure, and a widget's table export through
  cmd.usage.export with scope ledger; an alert's acknowledge or snooze uses the alert lifecycle
  owner's actions (F3-453). No Usage command, export command or alert command is added. Notification
  presentation consumes FinalGUISpec F3-447/F3-453/F3-460, including Usage's notices under the
  shared bell; Usage has no private staging placement or alert state. Glyphs consume F3-658 and
  settled text/hover consumes F3-654. All account/provider switch controls consume MA-073 and
  SSYS-044's current hold/refusal result, including inherited/default choices; the stepper and menu
  do not offer a requested value the owner would move. A refused request or default restore keeps
  the authoritative reading and shows the named reason, with no Usage-local threshold copy or
  adjustment algorithm. F3-628/F3-658 own the published Usage glyph consumer, including Current's
  check and Export's outbox; this projection adds no status or export command.
  Amended 2026-10-17 (DL-222): readings a Live beat changed while Usage was hidden are drawn during the
  unseen arrival, so the first board shows the latest values and does not jump from a stale board.
  Paused still holds display updates only.
  Amended 2026-10-17 (DL-228): Scope values are All current usage, Work accounts (company and team
  credentials), Personal accounts (personal plans and keys) and <Provider> only for each provider shown,
  offered in a menu with a scope-group rail and Find a scope...; work and personal read each account's
  ai.accounts.billing-entity and ai.accounts.account-roles. Range is 5h, 24h, 7d or 30d: a segment in the head
  that folds to the one Range menu when the head is narrow, so the two never disagree. A widget follows the
  head's range and scope by default (Follow the page, Follow the scope); its Configure can pin a fixed window
  or providers, the pin is that widget's configuration (WS-004, UF-060), the card names what it is pinned to,
  and a head change never rewrites a pinned widget. Live beats are also held while onboarding or the Guided
  Tour is open, while a chart readout is up and during a room change's moment and its short tail, then
  released as one change. Use this account makes that account the active one for the provider's next run: it
  is one cmd.account.select_profile with its override and scope next_run, a run already working keeps its
  account (MA-073), its hover adds "· next run", and Usage writes no second Settings value for it. It shows
  only with two or more accounts; the account in use shows Current instead; its other disabled states read
  through UCC-116's closed reasons: signed out as auth_missing or auth_expired, a cooldown or a window used up
  until a time as provider_unavailable with that time, and needs a seat as policy_denied; where the provider does not
  support a manual choice the control is absent, not disabled (amended 2026-10-17, review r1). While auto-switch waits for a tool to go idle, the status line offers Use <account> now, an
  override through the same command and the same past-switch-point question, shown only while that account is
  eligible for a manual choice. Attention alert rows offer Acknowledge and Snooze 1h (F3-453's actions),
  Switch route on a warning (UCC-116's cmd.provider.switch_route with provider_id and its retry_after_ms;
  amended 2026-10-17, review r1), and on an anomaly alert Keep guard, which acknowledges it; Allow once has no admitted
  command, so it is not offered until UF-083's owner admits one. Usage's own notices name the window by its
  own label and show no internal id: a threshold reads "<window> is at N% used." with "Usage · another
  signed-in account can take the work", and an automatic switch "Work moved to another account because of rate
  limits." with "Usage · the account you chose stays your choice". Refresh shows its turning glyph while a
  re-read runs and is unavailable, with that reason, until it ends; its result shows on the page, not as a
  toast. The concept's pm:* window events and its command and receipt logs are harness seams with no product
  event family. Export writes JSON: the snapshot (puppet-master-usage.json: room, range, scope and attempts)
  or the ledger (puppet-master-usage-ledger.json: the attempts in the range), credential handles masked as in
  Details, and a failed export says so on the page. The redesigned page has no Request forecast control:
  month-end figures are labelled estimates read from the projection, so cmd.usage.forecast.request has no
  Usage producer and WM-044's location is lineage. The concept's chart gallery is a review aid, lab-only like
  the demo controls above; every widget kind on a default board is built, and a kind not yet built shows its
  name and size, never invented data. Concepts/PMConcept7.html and Concepts/usage-redesign illustrate the Usage
  and board look and behavior. The Concepts/pm7-tools Usage and widget sources remain historical lineage
  wherever a Plans unit still names them.
  Amended 2026-10-17 (DL-228, DL-230, Jared): nine Usage Settings rows were read by no redesigned surface:
  ai.usage.usage-windows, ai.usage.platform-filters (seven fixed options against the catalog's 22 providers),
  ai.usage.chart-type, ai.usage.reset-countdown, ai.usage.cooldown-timers, ai.usage.pressure-visibility,
  ai.usage.tool-usage-window, ai.usage.ledger-page-size and ai.usage.ledger-export (CSV, while exports are
  JSON). Jared chose on 2026-10-17 to bind the six that change what the page shows: usage-windows picks
  which of each provider's own declared windows show, and a provider that declares none of the picked
  windows shows its own; platform-filters picks the providers on the board over the Settings provider
  catalog, in its order, with every provider shown until hidden, not seven fixed options; reset-countdown
  and cooldown-timers show or hide reset countdowns and cooldown timers; pressure-visibility shows or hides
  pressure; and tool-usage-window is the window the Tools room opens with. chart-type is the starting style
  of each new chart widget, and a chart already placed keeps its own. ledger-page-size is retired (the
  Ledger pages by card height), and ledger-export keeps JSON alone, its CSV choice retired. Each row's
  inventory text says so (F3-441).
  Amended 2026-10-17 (DL-228, DL-230, Jared): the Live menu's Play the next hour and Back to now and the
  Demo time readout are demo controls; Jared chose on 2026-10-17 that they live only in the Demo Studio
  (DR-070), and the product's Live menu holds Live readings on and Pause live readings alone, which settles
  DL-177's lab-only classification. Copy custody: the concept's Usage copy (src/copy.json and src/copy.d)
  is the reference wording for the rebuild, with its "panel" read as "card", since a Usage widget is a card
  everywhere (DL-230, G-030); the strings Plans quote are load-bearing and kept, and the rest may be
  re-worded in the same plain voice without a new decision.
gui_related: true
gui_classification_reason: "The unit defines what the redesigned Usage page shows and does: the provider catalog, every account, the Accounts room's in-place actions, pace, Live readings, and the board actions."
depends_on: [DL-173, DL-174, DL-175, DL-176, DL-177, UF-045, UF-089, UF-092, UF-093, UF-095, UF-096, MA-049, MA-073, WS-019, WS-020, DR-038, ACD-474, SSYS-009, SSYS-018, SSYS-044, UCC-116, DL-186]
unblocks: []
acceptance_criteria:
  - Every provider name, group and order on the page matches the Settings provider catalog, the page's roster is the Settings roster, every window shown is one the provider's Settings definition declares, and a provider not set up shows as one compact line with a Set up in Settings action.
  - The Accounts room and Plans & limits show every account of every provider, one row or card each, grouped by provider; a provider with three accounts shows three.
  - A Plans & limits plate too small for full rows shows its other accounts as lines with every window value and never drops one; the windows timeline has one lane per account.
  - A window whose reset passed after its last reading reads Reset at <time> · new reading pending, never 0% or the old value, with the last reading's age and source in the hover.
  - Use this account shows only where supports_manual_set_active is true, dispatches cmd.account.select_profile, and asks first when the account is past its provider's switch point.
  - A provider's Auto-switch toggle and switch level, and each of its accounts' own switch level, show the same value on the card and in Settings; changing the provider's dispatches cmd.settings.transaction.preview then cmd.settings.transaction.apply with scope=provider and changing an account's the same pair with scope=account (D43, 2026-10-10); a provider with one account shows no switch controls, its account's included; an account's control says whether its level is its own or follows its provider, in words under the value in a column of their own and in every form by its mark (the provider's mark when it follows, the notch when it is its own); and every meter of a provider carries that provider's switch-point notch.
  - No clock to running out appears anywhere on the page; pace reads in points against the norm, headroom in percent, and month-end spend only as a labelled estimate.
  - The page is Live by default; Paused holds display updates without stopping collection, refresh, alerts or accounting; the choice survives reload and dispatches no command.
  - Readings changed while Usage was hidden are on the first board anyone sees, with no stale-then-jump frame.
  - No command, setting, wiring row, persisted key or test gate exists for Play the next hour, Back to now, Demo time or the concept's feature switches.
  - Tidy and board gravity each produce one settled layout transaction with one receipt and no per-card move command; no new Usage, export or alert command is registered.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, or production build tasks are created by this unit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-usage-gui-fixtures
  - python3 scripts/pm-plans-verify.py validate-pm7-gui-fixtures
risk_class: usage_redesign_requirement_drift
reasoning_tier: high
context_scope: usage_redesign_requirements
implementation_surfaces: [Plans/usage-feature.md, Plans/Multi-Account.md, Plans/Settings_System.md, Plans/Widget_System.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: usage_redesign_requirements, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/DECISIONS-20261009.md (SHA-256 fd8d2d8a092e97f2964331dfe3befea99f2aa66691b5021313bae2cad0a25008)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/HANDOFF-usage-upgrade-20261009.md section
  2 (SHA-256 d009d908af6785fd19866b83821313d65165ed0169737ab72bcd70c04539fdd5)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/R3-aac-20261009.md section 1 (SHA-256
  6f7d0b33ae6d648e8bc1aa88bf4cab0ebbe1540e5aeec723e062217e5eb04449)
- Concepts/usage-redesign/src/js/54-w-accounts.js, 15-film.js, 40-board.js (the redesigned Accounts room,
  Live film and board; source-lineage-only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/d-plans-REPORT.md
  (SHA-256 5bee3a9fc5d56005e873dabdc44edccc0ae2ab2a62bbab6742431951568f7fe7; every account in Plans &
  limits and the reset truth)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/d-switch-REPORT.md
  (SHA-256 30eab667e56fdaf329c6bfa1a137f3ff2947cea903b811eae7b5208379a1291a; per-provider auto-switch
  on the Accounts room)
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-10-glyph-catalog-addendum/README.md, SHA-256 3d0497f01c878e8aa6f99fa8f602b9b3dbf887aead2a24d62c12969bd47a1d31
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-usage-warn-hold--LANDING.md,
  SHA-256 5357dc0dd60b0e08548f4dab5d5359662ee0ea0f159f7201a25577067372c238 (source lineage; not native
  certification)
preserved_exact_tokens: ["new reading pending", "(active)", "no history", "Subscriptions and plans", "Pay as you go", "Free and your own", "Not set up", "Not installed", "Use this account", "supports_manual_set_active", "cmd.account.select_profile", "ai.accounts.multi-account-switching", "ai.accounts.hard-switch-level", "cmd.settings.transaction.preview", "cmd.settings.transaction.apply", "scope=provider", "+11 pts vs norm", "31% left", "Live / Paused", "Play the next hour", "Back to now", "Demo time", "Tidy", "preset_id"]
negative_constraints:
  - Do not rename, regroup or reorder providers on the Usage page apart from the Settings catalog, and do not invent a provider window.
  - Do not show only the active account of a provider that has several, or drop an account to fit a plate.
  - Do not show 0% or the old percentage for a window whose reset has passed without a new reading, and do not add or average readings across accounts.
  - Do not keep a Usage copy of an auto-switch value or decide a switch in Usage.
  - Do not show a clock to running out, a runway or a time left at the current pace.
  - Do not let Paused stop collection, refresh, alerts or accounting, and do not give Live / Paused a command or a setting.
  - Do not give a demo control a command, setting, wiring row, persisted key or test gate, or count a demo reading.
  - Do not dispatch a move command per card for Tidy or gravity, and do not add a Usage, export or alert command.
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-186): live readings and Play the next hour also run on dashboard boards, per board, under the same idle rule."
owner_hints: [Plans/usage-feature.md, Plans/Multi-Account.md, Plans/FinalGUISpec.md, Plans/Widget_System.md]

```

ContractRef: ContractName:Plans/Decision_Log.md#DL-173, ContractName:Plans/Decision_Log.md#DL-174, ContractName:Plans/Decision_Log.md#DL-175, ContractName:Plans/Decision_Log.md#DL-176, ContractName:Plans/Decision_Log.md#DL-177, ContractName:Plans/Multi-Account.md#MA-049, ContractName:Plans/Multi-Account.md#MA-073, ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/Settings_System.md#SSYS-018, ContractName:Plans/Settings_System.md#SSYS-044, ContractName:Plans/Widget_System.md#WS-019, ContractName:Plans/Widget_System.md#WS-020, ContractName:Plans/assistant-chat-design.md#ACD-474, ContractName:Plans/DRY_Rules.md#DR-038, ContractName:Plans/FinalGUISpec.md#F3-628

### UF-108 - Usage History Is Kept And Loads From Rollups

```yaml
plan_unit_id: UF-108
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  DL-270, Jared's card 7 note. The Usage page and every usage widget read redb rollups that update as each
  usage.event lands; nothing on them scans raw events. usage.event records are exempt from raw-event pruning: they
  stay in seglog's cold tier and in SP-341's Parquet archive, where SQL can query them. Daily usage totals per
  account, provider and model are kept forever. This amends Problem 5's 90-day raw-event window, which no longer
  applies to usage.event. usage.jsonl is retired as a live file (SP-339). Jared, 2026-10-31, verbatim: "Do we need
  to tie the usage data to this?  In my work on AAC, the usage data takes a long time to load and doesn’t keep its
  data, I know there is a lot of data there so just want to make sure that is accounted for."
gui_related: true
gui_classification_reason: "Usage loads from rollups and keeps its full history."
split_recommended: false
depends_on: [UF-107, SP-339, SP-341]
unblocks: []
acceptance_criteria:
  - "No usage view or widget scans raw usage events."
  - "No usage.event is pruned."
  - "Daily usage totals per account, provider and model are kept forever."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: usage_history_loss_or_slow_load
reasoning_tier: high
context_scope: dl270_usage_history
implementation_surfaces:
  - "Plans/usage-feature.md"
  - "Plans/storage-plan.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answer-replies-2026-10-31.json, SHA-256 c51138b79bba5efa55662f3cd7ef04bd67f8afc6c9dc76fb34e42d1de99d0db4 (the reply to the card 7 note)"
preserved_exact_tokens:
  - "usage.event"
  - "usage.jsonl"
  - "Do we need to tie the usage data to this?  In my work on AAC, the usage data takes a long time to load and doesn’t keep its data, I know there is a lot of data there so just want to make sure that is accounted for."
negative_constraints:
  - "Do not prune usage.event records."
  - "Do not serve usage windows from raw scans."
owner_hints:
  - "Plans/usage-feature.md"
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/storage-plan.md#SP-341, ContractName:Plans/storage-plan.md#SP-339
