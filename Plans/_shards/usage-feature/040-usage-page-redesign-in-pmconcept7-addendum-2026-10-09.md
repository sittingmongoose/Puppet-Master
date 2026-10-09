# Shard 040: Usage Page Redesign In PMConcept7 Addendum (2026-10-09)

Source: `Plans/usage-feature.md`

Source lines: L7295-L7355

Source SHA256: `35a14cdceb49882a49cf37ec14fba68466bf5f1a656744cce447177f14237bd3`

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
  The redesigned Usage page replaces the old one (DL-173) and keeps its thirteen rooms, its rail of rooms and its overall layout. No datum the previous page showed is dropped; adding is allowed, and a fact or series that was a static concept fixture stays in its natural widget, labelled as a fixture.
  One provider catalog: every provider name, mark, group and order on the page is the Settings provider catalog's (Settings > AI > Providers & Accounts): its display names, its three groups Subscriptions and plans, Pay as you go, and Free and your own, and its order. The page's providers and accounts are the Settings state's own roster, so the two pages always agree; usage facts (each window's use and limit, reset truth, source and freshness, pressure, cooldown and history) come from Usage projections keyed by provider id and account id. A provider's windows are those its Settings definition declares, and Usage invents none. A provider with no account or not yet set up shows as one compact line that says Not set up or Not installed, with a Set up in Settings action that dispatches cmd.settings.open with a typed Settings target, never as an empty card.
  Every account is shown (MA-049): the Accounts room and Plans & limits show one row or card per account, grouped by provider, including every account of the same provider (three ChatGPT / Codex accounts show as three), never only the active account. Each account shows its identity, plan, each window's use or headroom with its reset, its source and freshness, and whether it is the active account.
  The Accounts room acts in place through the real owners (DL-174). An account's "Use this account" control is labelled as an override, shows only where the provider's capability supports_manual_set_active is true, and dispatches cmd.account.select_profile; activating an account that is already past its provider's switch point asks first, as MA-073 sets out. Each provider with two or more accounts shows its Auto-switch toggle and switch level, which are the Settings rows ai.accounts.multi-account-switching and ai.accounts.hard-switch-level at that provider's scope: changing them on the card dispatches cmd.settings.transaction.preview and then cmd.settings.transaction.apply with scope=provider through the Settings owner (SSYS-044), and Settings and the card always show the same value; a provider without a value of its own shows, and runs on, the value MA-073 resolves for it. The provider's warning level and rest period show on its plate as read values and are edited in Settings, reached through Open in Settings. Open in Settings dispatches cmd.settings.open with target_type=setting. A provider with one account shows that auto-switch needs a second account instead of the controls. Every meter of a provider carries a notch at that provider's switch point, and each provider's auto-switch state is shown in plain words as MA-073 projects it; Usage decides no switch.
  Pace without countdowns (DL-175): pace is said in one unit everywhere, points ahead of or behind the usual pace (for example +11 pts vs norm). No clock to running out is shown, such as a time until a limit is reached, a runway or a time left at the current pace; headroom as a percentage (for example 31% left) is shown, month-end spend appears only as a labelled estimate, and reset times keep their own rules (UF-045). The rejection of RunOutProjection (DR-038) stands.
  Live readings (DL-177): the page is Live by default. While Live, Usage projection updates that arrive are applied in place, with one change moment per batch of updates and nothing moving between updates; updates that arrive while the page is not shown, during a gesture, an open menu, the inspector or a room change are held and applied together as one change once the hold ends. Paused holds arriving updates for display only and keeps the values shown with their freshness; it never stops collection, background refresh, alerts or accounting, and turning Live back on applies the latest values at once. The Live / Paused choice is a remembered view preference (UF-095 family live) with no command, setting, event or receipt; under Reduce Motion every change lands final at once.
  The concept's demo controls are lab-only (DL-177, on ACD-474's precedent; this classification is the coordinator's recommendation recorded in DL-177, which the owner has not yet decided), and this unit is the one owner of that disposition, to which UCC-147, the wiring units and the test suite point: Play the next hour, Back to now, the Demo time label, the concept's feature switches and query flags, and its demo reading cadence receive no command, setting, wiring row, persisted key or test gate, and nothing a demo clock shows is a Usage reading (UF-092).
  Board actions (DL-176): Tidy repacks the room's board on request, and every settled move, resize, preset change, hide or show lets cards float up into the holes above them, keeping their order (board gravity); WS-019 owns how both are previewed and resolved. Tidy and gravity each commit as one settled layout transaction with one receipt through one existing widget command as WS-019 sets out, with no move command per card and no new command. A size preset commits through cmd.widget.resize with its preset_id (WS-020), a chart type or option through cmd.widget.configure, and a widget's table export through cmd.usage.export with scope ledger; an alert's acknowledge or snooze uses the alert lifecycle owner's actions (F3-453). No Usage command, export command or alert command is added.
gui_related: true
gui_classification_reason: "The unit defines what the redesigned Usage page shows and does: the provider catalog, every account, the Accounts room's in-place actions, pace, Live readings, and the board actions."
depends_on: [DL-173, DL-174, DL-175, DL-176, DL-177, UF-045, UF-089, UF-092, UF-093, UF-095, UF-096, MA-049, MA-073, WS-019, WS-020, DR-038, ACD-474, SSYS-009, SSYS-018, SSYS-044, UCC-116]
unblocks: []
acceptance_criteria:
  - Every provider name, group and order on the page matches the Settings provider catalog, the page's roster is the Settings roster, every window shown is one the provider's Settings definition declares, and a provider not set up shows as one compact line with a Set up in Settings action.
  - The Accounts room and Plans & limits show every account of every provider, one row or card each, grouped by provider; a provider with three accounts shows three.
  - Use this account shows only where supports_manual_set_active is true, dispatches cmd.account.select_profile, and asks first when the account is past its provider's switch point.
  - A provider's Auto-switch toggle and switch level on the card and in Settings show the same value, changing either dispatches cmd.settings.transaction.preview then cmd.settings.transaction.apply with scope=provider, a provider with one account shows no switch controls, and every meter of a provider carries that provider's switch-point notch.
  - No clock to running out appears anywhere on the page; pace reads in points against the norm, headroom in percent, and month-end spend only as a labelled estimate.
  - The page is Live by default; Paused holds display updates without stopping collection, refresh, alerts or accounting; the choice survives reload and dispatches no command.
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
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/DECISIONS-20261009.md (SHA-256 fd8d2d8a092e97f2964331dfe3befea99f2aa66691b5021313bae2cad0a25008)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/HANDOFF-usage-upgrade-20261009.md section 2 (SHA-256 d009d908af6785fd19866b83821313d65165ed0169737ab72bcd70c04539fdd5)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/R3-aac-20261009.md section 1 (SHA-256 6f7d0b33ae6d648e8bc1aa88bf4cab0ebbe1540e5aeec723e062217e5eb04449)"
  - "Concepts/usage-redesign/src/js/54-w-accounts.js, 15-film.js, 40-board.js (the redesigned Accounts room, Live film and board; source-lineage-only)"
preserved_exact_tokens: ["Subscriptions and plans", "Pay as you go", "Free and your own", "Not set up", "Not installed", "Use this account", "supports_manual_set_active", "cmd.account.select_profile", "ai.accounts.multi-account-switching", "ai.accounts.hard-switch-level", "cmd.settings.transaction.preview", "cmd.settings.transaction.apply", "scope=provider", "+11 pts vs norm", "31% left", "Live / Paused", "Play the next hour", "Back to now", "Demo time", "Tidy", "preset_id"]
negative_constraints:
  - Do not rename, regroup or reorder providers on the Usage page apart from the Settings catalog, and do not invent a provider window.
  - Do not show only the active account of a provider that has several.
  - Do not keep a Usage copy of an auto-switch value or decide a switch in Usage.
  - Do not show a clock to running out, a runway or a time left at the current pace.
  - Do not let Paused stop collection, refresh, alerts or accounting, and do not give Live / Paused a command or a setting.
  - Do not give a demo control a command, setting, wiring row, persisted key or test gate, or count a demo reading.
  - Do not dispatch a move command per card for Tidy or gravity, and do not add a Usage, export or alert command.
owner_hints: [Plans/usage-feature.md, Plans/Multi-Account.md, Plans/FinalGUISpec.md, Plans/Widget_System.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-173, ContractName:Plans/Decision_Log.md#DL-174, ContractName:Plans/Decision_Log.md#DL-175, ContractName:Plans/Decision_Log.md#DL-176, ContractName:Plans/Decision_Log.md#DL-177, ContractName:Plans/Multi-Account.md#MA-049, ContractName:Plans/Multi-Account.md#MA-073, ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/Settings_System.md#SSYS-018, ContractName:Plans/Settings_System.md#SSYS-044, ContractName:Plans/Widget_System.md#WS-019, ContractName:Plans/Widget_System.md#WS-020, ContractName:Plans/assistant-chat-design.md#ACD-474, ContractName:Plans/DRY_Rules.md#DR-038, ContractName:Plans/FinalGUISpec.md#F3-628
