# PORT HANDOFF — Plans / Command / Wiring / DRY / Event / Storage / Deep-link side
## Target: `Concepts/usage-concepts/QwenUsageConcept/u11-prism.html`
Audit-only. No Plans file was edited. No canonical_text drafted. All ids below are **allocations to make**, not units that exist.

---

## 0. FACT VERIFICATION (do this before trusting the packet reports)

### 0.1 Next-free PlanUnit ids — VERIFIED, all contiguous, no gaps
Authoritative source is `plan_unit_id:` in the owner doc itself (not `.plan_index/`, which is stale — see 0.3).

| Prefix | Owner doc | count | max | NEXT FREE | prompt claim |
|---|---|---|---|---|---|
| UF | `Plans/usage-feature.md` | 91 | 091 | **UF-092** | ✅ |
| WS | `Plans/Widget_System.md` | 15 | 015 | **WS-016** | ✅ |
| UCC | `Plans/UI_Command_Catalog.md` | 145 | 145 | **UCC-146** | ✅ |
| WM | `Plans/Wiring_Matrix.md` | 43 | 043 | **WM-044** | ✅ |
| DR | `Plans/DRY_Rules.md` | 37 | 037 | **DR-038** | ✅ |
| SP | `Plans/storage-plan.md` | 247 | 247 | **SP-248** | ✅ |
| CS | `Plans/Commands_System.md` | 66 | 066 | **CS-067** | ✅ |
| MA | `Plans/Multi-Account.md` | 70 | 070 | **MA-071** | ✅ |
| CBP | `Plans/CLI_Bridged_Providers.md` | 29 | 029 | **CBP-030** | ✅ (index says 28 — index stale) |
| MS | `Plans/Models_System.md` | 137 | 137 | **MS-138** | ✅ (index says 136 — index stale) |

Additional prefixes this port needs (not in the prompt, verified the same way):

| Prefix | Owner doc | max | NEXT FREE |
|---|---|---|---|
| CV | `Plans/Contracts_V0.md` | 325 | **CV-326** |
| F3 | `Plans/FinalGUISpec.md` | 512 | **F3-513** |
| GRS | `Plans/Goal_Runtime_System.md` | 046 | **GRS-047** |
| SIR | `Plans/Shared_Integration_Runtime.md` | 013 | **SIR-014** |
| PSB | `Plans/Project_Sync_and_Backbone.md` | 003 | **PSB-004** |
| UIW | `Plans/UI_Wiring_Rules.md` | 011 | **UIW-012** |

Heading convention confirmed as `### <ID> - <Title>` + fenced ```yaml block, 28 canonical fields
(`acceptance_criteria, canonical_text, compatibility_only_notes, context_scope, depends_on,
gui_classification_reason, gui_related, implementation_surfaces, negative_constraints,
node_compile_hint, owner_boundary_notes, owner_doc, owner_hints, plan_unit_id,
preserved_contractrefs, preserved_exact_tokens, reasoning_tier, risk_class, schema_id,
source_doc_sha256, source_lineage, source_location, split_recommended,
stale_retired_dispositions, status, unblocks, unit_type, validation_surfaces`).

**Exception to flag:** `Shared_Integration_Runtime.md` (SIR-*) and `Project_Sync_and_Backbone.md`
(PSB-*) do **not** use the `### <ID> - <Title>` heading form — they carry bare ```yaml blocks under
a `## N. PlanUnits` section. A port unit added to either must match the host doc's local form, not
the `###` form, or the sharder will split it wrong.

### 0.2 Spec_Lock — THE PROMPT'S PREMISE IS PARTLY WRONG
`Plans/Spec_Lock.json` (`pm.spec_lock.v1`) pins **83 paths** under
`canonical_ssot_hashes.files[]` (`hash_alg: sha256`), and `spec_lock_update_protocol` requires
`requires_auto_decision: true` + `requires_evidence_bundle: true`
(canonical doc `Plans/Decision_Policy.md#spec-lock-update-protocol`).

**`Plans/usage-feature.md` is NOT pinned.** Editing it needs **no** Spec_Lock rehash.
Also unpinned: `Widget_System.md`, `storage-plan.md`, `Commands_System.md`,
`CLI_Bridged_Providers.md`, `UI_Wiring_Rules.md`, `Shared_Integration_Runtime.md`,
`Project_Sync_and_Backbone.md`, `Wiring_Matrix.production.json`,
`Wiring_Matrix.production.exclusions.json`, `event_family_registry.json`.

**Pinned (rehash required if edited):** `DRY_Rules.md`, `UI_Command_Catalog.md`,
`Wiring_Matrix.md`, `Contracts_V0.md`, `Multi-Account.md`, `Models_System.md`,
`FinalGUISpec.md`, `Goal_Runtime_System.md`, `storage_value_registry.json`,
`00-plans-index.md`.

**Pre-existing drift baseline: 26 of 83 pins already mismatch** on disk (57 match, 0 missing).
The drifting set already includes 9 of the 10 docs this port touches
(`00-plans-index.md, Contracts_V0.md, DRY_Rules.md, Goal_Runtime_System.md,
UI_Command_Catalog.md, FinalGUISpec.md, Models_System.md, Multi-Account.md,
Wiring_Matrix.md, storage_value_registry.json`, plus `assistant-chat-design.md`,
`Automated_Testing_System.md`, `sharding_config.json`, `Wiring_Matrix.schema.json`,
three `scripts/*.py`, and 6 other json). **`verify_spec_lock` is therefore a currently-failing
gate, and this port must not be blamed for it.** Record the pre-edit drift list in the change
budget or the port will look like it caused 26 failures.

### 0.3 `Plans/.plan_index/**` is STALE — regen before allocating
Index generated `2026-08-13 23:46`; canonical docs were edited `2026-08-14 04:00–05:00`.
Doc-vs-index drift (doc has it, index doesn't) in 13 docs:
`CBP-029, F2-209, F3-510/511/512, GRS-046, M-084, MS-137, P-056, PP-082, SMPFS-146,
SIR-013, ACD-447, N2-151, OSI-435`. Reverse drift (index has it, doc doesn't):
`0PI-060, PNC-007, SIR-001..012` (SIR reverse-drift is a heading-form artifact, see 0.1).
**`PSB-001..003` are absent from the index entirely** — the doc post-dates the last index run.
`Plans/_shards/**` regenerated `2026-08-15 03:16` and is newer than the docs, so shards are
current while the index is not.

### 0.4 The five deferred owner docs — NONE EXIST
The concept defers to five paths that are not in the repo. Real owners:

| Concept's claimed owner | Exists? | REAL OWNER DOC (+ prefix / anchor unit) |
|---|---|---|
| `Plans/Goal_Runtime.md` | **NO** | `Plans/Goal_Runtime_System.md` (GRS, 46 units; registered as canonical Goal-runtime owner in `00-plans-index.md:14`) |
| `Plans/Free_Models.md` | **NO** | `Plans/Models_System.md` **MS-118** "Free Models Wrapper Catalog And Route Readiness Identity" (`Models_System.md:8108`; the Free Models ledger is compiled into Models_System ownership, `:8106`) |
| `Plans/Notifications.md` | **NO** | split, no single doc: commands `Plans/UI_Command_Catalog.md` **UCC-103** "Notifications And Sounds Command Catalog" (`:7530`); wiring `Plans/Wiring_Matrix.md` **WM-039** (`:3251`); presentation + notification-routing policy `Plans/FinalGUISpec.md` (F3-405, and §"Notification routing policy" `:66`); destination payloads `Plans/Contracts_V0.md` **CV-298**; storage **SP-222**; permission **PS-124** |
| `Plans/Server_Project_Sync.md` | **NO** | `Plans/Project_Sync_and_Backbone.md` (**PSB-001..003**, sole owner per its `:3` authority line and `00-plans-index.md:473`) for Project/Vault sync + move + relocation; `Plans/Shared_Integration_Runtime.md` §6/§7 (**SIR-006 ThreadCommandOutbox, SIR-007 ProjectionReplayCoordinator**) for the offline outbox + reconnect/replay mechanics |
| `Plans/Storage_events.md` | **NO** | `Plans/storage-plan.md` (SP; owner of `#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe`, which is the declared `owner_doc` of `event_family_registry.json`) + `Plans/event_family_registry.json` + `Plans/storage_value_registry.json` + `Plans/Contracts_V0.md` |

---

## 1. PLAN OWNER DELTA TABLE

### 1.1 Resolving 19 rows vs 10 entries
Neither list is the delta. `reports/plan-owner-delta.md` has **19 rows** = every doc the concept
*touches* (10 with `deferred/named-owner`, 9 marked `demonstrated` with no owner deferral).
`reports/impact-register.json.plan_owner_impacts` has **10 entries** = only the
`deferred-named-owner` subset. The correct delta list is a third set: **owner docs that require an
actual PlanUnit or registry edit**. That set drops 9 of the 19 (consume-only surfaces that need no
edit), keeps 10 but **renames 5 of them to real docs** (§0.4), and **adds 8 owners neither report
names** (`Contracts_V0.md`, `UI_Command_Catalog.md`, `Commands_System.md`, `Wiring_Matrix.md`,
`Widget_System.md`, `storage-plan.md`, `DRY_Rules.md`, `Shared_Integration_Runtime.md`) plus 4
machine registries. Net: **16 doc owners + 4 registries**, not 19 and not 10.

### 1.2 The correct delta table

| # | Owner doc | Allocate | Contract each must carry (one line — NOT canonical_text) | Acceptance surface |
|---|---|---|---|---|
| 1 | `Plans/usage-feature.md` | **UF-092** | Usage page widget-host projection contract: the three-level disclosure ladder (`essentials \| standard \| advanced`) is presentation-only, never deletes an existing widget instance, and every widget cell inherits UF-085/UF-087 value-state + source + settlement + freshness. | new Usage-GUI fixture rows in `USAGE_GUI_REQUIRED_FIXTURE_TOKENS`; `validate-usage-gui-fixtures`; `pm-plan-index.py validate` |
| 2 | `Plans/usage-feature.md` | **UF-093** | Hierarchical stable-ID page scope (`scope:all`, comparison sets, family/account/connection/product/meter) is a *view narrowing* over UsageRecord identity, is not an account switch, and a vanished persisted scope id falls back to `scope:all` with disclosure. | scope-fallback fixture; `validate-usage-contract-drift` |
| 3 | `Plans/usage-feature.md` | **UF-094** | Usage-owned forecast projection: month-end cost forecast and per-run token/time forecast are labelled projections carrying `source_class`/`source_confidence`/`projection_freshness`; a forecast is never a quota run-out date and never a countdown. | forecast fixture; UF-085 negative-constraint regression ("do not fabricate reset countdowns") |
| 4 | `Plans/usage-feature.md` | **UF-095** | Capacity-envelope *consumption* boundary: Usage renders `hardMax/configuredPreferred/providerAdvertised/effectiveNow/predictedSustainable` as measured/advertised state and holds no admission authority. | paired with GRS-047; run-detail fixture |
| 5 | `Plans/usage-feature.md` | **amend UF-090 / UF-091** | Record that u11's `bsdEvents[]`, `operational[]` (8 kinds), `hosts[]`, `environments[]`, `validationFor`, `operationalRef`, `replayKind`, `roleLabel`, `runLineage` are the concept-side projection of already-canonical UF-090/UF-091 obligations, **not new canon** (see §8). | `pm-shared-runtime-contracts.py --self-test`; `pm-shared-runtime-storage-materialize.py check` |
| 6 | `Plans/Contracts_V0.md` | **CV-326** | Amends CV-200's `source_class` enum boundary and the value-state vocabulary for the u11 renames + the `pm_observed` / `measured` admissions or rejections (§5); declares u11's `vs/sourceClass/conf/settlement/billingRoute` compatibility-alias-only. | `validate-usage-contract-drift`; `pm-plan-index.py validate` |
| 7 | `Plans/Contracts_V0.md` | **CV-327** | Settings deep-link payload contract: closed `settings_route` envelope (`manager`, `section`, `focus_reason`, optional `account_id`/`continuation`) inside the existing `route_target` / OpenSubject model — **not** a second navigation stack (Crosswalk `:282` forbids that). | route/open fixture; `validate-wiring-matrix` |
| 8 | `Plans/UI_Command_Catalog.md` | **UCC-146** | Registers the two new usage commands + the alias adjudications + the rejected candidates (§2), following the UCC-143 alias pattern and the "New command IDs" table shape used by the PMConcept7 Home reconciliation (`UI_Command_Catalog.md:10900+`). | `validate-wiring-matrix`; `pm-plan-index.py validate` |
| 9 | `Plans/UI_Command_Catalog.md` | **amend UCC-116** | Adds the Usage deep-link/settings-reveal row and records that `cmd.account.select_profile` keeps its `account_switch_event` semantics and must not be dispatched for a view-scope change (§2.4). | UCC-116's four existing acceptance criteria + one new negative criterion |
| 10 | `Plans/Commands_System.md` | **CS-067** | Family semantics for the new usage commands using the CS-066 shared command envelope: typed request/result, CAS/idempotency, projected availability, closed disabled reasons, `event_effect = none_pending_event_authority`. | `pm-shared-runtime-command-contracts.py`; `pm-plan-index.py validate` |
| 11 | `Plans/Wiring_Matrix.md` | **WM-044** | Wiring obligations for the new/amended catalog rows: every row `expected_event_types: []` + `missing_event_registration` while Event Authority is `UNKNOWN_OPEN`; `route_open` rows carry the full `route_contract`; records obligations only and generates no wiring JSON (WM-039's own wording). | `validate-wiring-matrix`; `pm-plan-index.py validate` |
| 12 | `Plans/Widget_System.md` | **WS-016** | Usage-page widget host: hostability already granted by WS-002 ("Usage widgets"); this unit binds the 15 u11 widget types, the instance contract (layout/presentation/scope/time/content), duplicate-instance identity, and the `widget_layout:v1:usage` namespace under WS-009. | future Usage-widget fixture suite (WS-015 pattern); `run-gates` |
| 13 | `Plans/storage-plan.md` | **SP-248** | Registers the Usage view-state value family + the demo-shim disposition for `u11:disclosure` / `u11:scope` / `u11:settings` / `pmw:<pageId>` (§6). | `pm-shared-runtime-storage-materialize.py check`; `validate-case-l-non-event-materialization` |
| 14 | `Plans/DRY_Rules.md` | **DR-038** | Extends the command-name normalization boundary table (`:2109-2130`) with the 5 usage candidates and records the 18 candidate-role dispositions against the 16-row shared-runtime registry (§4). | `lint-contractrefs`; `run-gates` (DRY §7.1 six-step algorithm) |
| 15 | `Plans/Multi-Account.md` | **MA-071** | Account row priority + `lastUsedAt` + "Use next" (future work only, in-flight never re-routed) + "Open provider console" as an open/route action, all rendered from normalized projections per MA-069/`:5102`. | Multi-Account row fixture; `pm-plan-index.py validate` |
| 16 | `Plans/Models_System.md` | **MS-138** + **amend MS-118** | Requested-vs-effective model/account divergence display with `fallbackReason`; Free-model cooldown renders through MS-118's Free Models wrapper without minting a Free-Models quota ledger. | MS-118's Free Models catalog/routing fixtures |
| 17 | `Plans/CLI_Bridged_Providers.md` | **CBP-030** | ops-1 acquisition lineage (`explicit_user_setup`, official source, publisher-signed artifact, exact host/env binding) + the `setup_required` runtime-demand path returning a deep link + continuation token instead of a silent install. | `PROVIDER_CLI_FINAL_ADJUDICATION.md` conformance fixture; UF-085 `unblocks: CBP-027` chain |
| 18 | `Plans/FinalGUISpec.md` | **F3-513** | Usage-page composition for the widget host + context-ring compact module + the value-state chip vocabulary, referencing the F3 value-state matrix at `:28995`; head copy stays owned by UF-089. | 8×5 theme/width matrix evidence; `validate-gui-asset-policy` |
| 19 | `Plans/Goal_Runtime_System.md` | **GRS-047** | Goal Runtime retains admission/scheduling; Usage is a read-only consumer of the concurrency envelope and supplies no admission decision (mirrors `GRS:3149`). | Goal-runtime lineage fixtures; `validate-goal-runtime-event-fixtures` |
| 20 | `Plans/Shared_Integration_Runtime.md` | **SIR-014** (bare-yaml form) | Offline-outbox wait and reconnect/replay time partitions surface in Usage via `ThreadCommandOutbox` (SIR-006) and `ProjectionReplayCoordinator` (SIR-007) receipts; Usage joins by operation id and owns no transport state. | `pm-shared-runtime-contracts.py --self-test` |
| 21 | `Plans/Project_Sync_and_Backbone.md` | **PSB-004** (bare-yaml form) | Server-continuity-while-client-offline projection is readable by Usage as an operational record; slow load is never provider usage; PSB keeps sole sync/move authority. | PSB-001..003 acceptance chain; `pm-plan-index.py validate` after index regen |

### 1.3 Machine registries (not PlanUnits)

| Registry | Change | Note |
|---|---|---|
| `Plans/Wiring_Matrix.production.json` | +2 new rows, 3 amended (§3) | unpinned in Spec_Lock; `validate-wiring-matrix` |
| `Plans/Wiring_Matrix.production.exclusions.json` | +5 rejected/normalized tokens (§2) | unpinned; precedent: `cmd.context.receipt.open`, `cmd.debug.session.start` are already listed |
| `Plans/storage_value_registry.json` | +1..2 families (§6) | **pinned + already drifting** → rehash needed |
| `Plans/event_family_registry.json` | **NO CHANGE** (§5.4) | 39 families, zero usage.* — all new usage events stay unregistered |

### 1.4 Owner docs the concept lists that need NO edit (consume-only)
`Orchestrator_Page.md` (`:2355` already makes it a UsageRecord consumer), `Planning_Wizard.md`,
`PRD_Builder.md`, `Prompt_Pipeline.md` (owns stable-prefix planning per DRY `:2109`; u11 only
displays `stablePrefixId`/`cacheEpoch`), `assistant-chat-design.md` (`:23854` already owns the
context status module vocabulary), `Media_Generation_and_Capabilities.md`, `MCP_Integration.md`,
`Tools.md`, `Skills_System.md`, `Automated_Testing_System.md`, `Runtime_Artifacts_Panel.md`,
`Permissions_System.md`. These are the 9 "demonstrated"-only rows plus adjacents; recording them
as impacted owners inflates the delta and is the main defect in the 19-row table.

---

## 2. COMMAND ID DELTA

### 2.1 The DRY normalization rule actually says
`DRY_Rules.md:2109-2130` is titled "Shared-runtime command-name normalization boundary" and opens
"DRY normalization does not register commands or aliases." Its 9 rows show the operative pattern:
an **entity sub-namespaced under a domain is rejected in favour of `cmd.<domain>.<verb>_<object>`**
(`cmd.lsp.server.restart` → `cmd.lsp.restart_server`; `cmd.debug.session.start` →
`cmd.run_debug.start`; `cmd.context.receipt.open` → `cmd.nav.open_subject` /
`cmd.nav.open_usage_subject` *by subject kind*). It is **not** a blanket ban on three dotted
segments — `cmd.git.worktree.create`, `cmd.chat.context_lens.set_mode`, `cmd.docker.context.select`
and `cmd.settings.bloom.open` are live canonical three-segment ids. The distinguishing test is
whether the middle segment is a real sub-domain (git worktrees, context lens) or a smuggled entity
noun (`session`, `server`, `receipt`, `forecast`, `detail`). All five u11 candidates fail that test.

### 2.2 Per-id ruling

| # | Candidate id | Ruling | Normalized name | Ids needed |
|---|---|---|---|---|
| 1 | `cmd.usage.forecast.request` | **NEW, but normalize** — `forecast` is an entity noun (same shape as `cmd.debug.session.start`) | **`cmd.usage.request_forecast`** | **UCC-146** row; **CS-067** family semantics; **WM-044** obligation; new wiring row `catalog.usage_request_forecast`; reject-token entry for the dotted form |
| 2 | `cmd.provider.usage.open_management` | **NEW, but normalize** — `usage` is not a sub-domain of `provider`; follow the `cmd.nav.open_usage_subject` verb_object shape | **`cmd.provider.open_usage_management`** | **UCC-146** row; **CS-067**; **WM-044**; new wiring row `catalog.provider_open_usage_management`; reject-token entry for the dotted form |
| 3 | `cmd.usage.detail.open` | **REJECT — do not mint.** See §2.3 | resolve to **`cmd.nav.open_usage_subject`** (usage-event subjects) or **`cmd.chat.open_thread_context_details`** (thread-context surface) | exclusions entry only; adjudication recorded in **UCC-146** (UCC-143 pattern) |
| 4 | `cmd.usage.range.set` | **REJECT as a command — local view state.** §2.5 | if ever promoted: `cmd.usage.set_range` | exclusions entry; **UF-092** records it as widget config |
| 5 | `cmd.usage.filter.set` | **REJECT as a command — local view state.** §2.5 | if ever promoted: `cmd.usage.set_filter` | exclusions entry; **UF-092/UF-093** record it as widget/page config |
| 6 | `semantic.deep_link` (u11's internal call) | **NOT a command id** — `semantic.` is not a registered namespace and it is not in `cmd.*`. Must become a real command. | **`cmd.settings.reveal`** (§7) | **UCC-146**; **CS-067**; **CV-327** payload; new wiring row `catalog.settings_reveal` |

Reuse verbatim, no id work needed: `cmd.usage.refresh`, `cmd.usage.export` (UCC-116),
`cmd.account.select_profile` (UCC-116, **with the §2.4 restriction**), `cmd.provider.switch_route`
(UCC-116), `cmd.chat.compact_context`, `cmd.chat.open_thread_context_details`,
`cmd.chat.focus_thread_context_details`, `cmd.chat.close_thread_context_details`,
`cmd.nav.open_usage_subject` (UCC-109), `cmd.artifacts.show_in_usage`,
`cmd.artifacts.show_in_ledger`, `cmd.widget.{add,remove,move,resize,configure,reset_layout}`.

### 2.3 Ruling on `cmd.usage.detail.open` as an alias
The concept flags this as an unresolved conflict and recommends "keeping
`cmd.chat.open_thread_context_details` and retiring the alias". **Adjudicate it as a rejected
candidate, not an alias**, on three grounds:

1. `DRY_Rules.md:2109-2130` already resolved the identical shape: `cmd.context.receipt.open`
   normalizes **by subject kind** to `cmd.nav.open_subject` or `cmd.nav.open_usage_subject`. A
   command that opens a *usage detail* is exactly that case, so the canonical target for
   usage-event subjects is **`cmd.nav.open_usage_subject`**, not the chat command.
2. `UCC-109` + `WM-043` + `Wiring_Matrix.md:3334` already retired
   `cmd.chat.open_thread_usage` / `focus_thread_usage` / `close_thread_usage` as
   compatibility aliases that "must not appear as canonical production UICommand rows", and
   normalized legacy callers to `cmd.nav.open_usage_subject` **or** the thread Context Detail Pane
   family. Minting `cmd.usage.detail.open` would re-open a boundary that was closed once.
3. `cmd.chat.open_thread_context_details` is the right target only for the *thread-context pane*
   affordance (which is what u11 actually dispatches). It is not the right target for the run
   inspector or the ledger attempt row — those are usage-event subjects.

So: **two targets by subject kind, zero new ids.** `cmd.usage.detail.open` goes into
`Wiring_Matrix.production.exclusions.json` as an invalid candidate alongside
`cmd.context.receipt.open`, and UCC-146 records the split ruling in the UCC-143 form
("adjudicated as a rejected candidate; every usage-detail affordance routes
`cmd.nav.open_usage_subject` when a `usage_event_ref` exists and
`cmd.chat.open_thread_context_details` when the subject is the thread context pane").

### 2.4 Ruling on `cmd.account.select_profile` for a scope change — **CONTRACT VIOLATION, reject**
`u11-prism.html:940` (inside `applyScope()`) dispatches
`D.dispatch('cmd.account.select_profile', { scope: window.U11W.pageScope })` on every page-scope
pick, where `pageScope` ranges over `scope:all`, `cmp:coding-sprint`, and family/account/
connection/product/meter ids.

That is not what the command is. `UCC-116` defines `cmd.account.select_profile` as adopted
verbatim from Multi-Account with disabled reasons `auth_missing, auth_expired, profile_locked,
provider_unavailable, policy_denied`, empty-state copy id `accounts.empty.no_profiles`, and
"switches land in append-only `account_switch_event` history". The production row
`catalog.account_select_profile` is the only usage-adjacent row in the matrix with a non-empty
`expected_event_types: ["account_switch_event"]`.

Dispatching it for a read-only view filter would **write a fabricated account switch into
append-only history**, and would emit a registered domain event for a no-op. Ruling: **the Usage
page scope picker dispatches no command.** It is local view state (§2.5) persisted per §6 and
recorded in **UF-093**; **UCC-116 gains a negative criterion** forbidding the dispatch; a real
account switch initiated *from* Usage still uses `cmd.account.select_profile` with an account id
payload, never a `scope:` string.

### 2.5 Why `range.set` and `filter.set` stay local view state
Three independent reasons, all already in canon:
- **No canonical side effect.** UF-085's window model (`window_kind/window_label/window_scope`,
  `usage-feature.md:595-605`) makes 5h/24h/7d a *label over the same UsageRecord set*, not a state
  change. Re-bucketing a projection mutates nothing an owner owns.
- **The precedent is explicit.** `UI_Command_Catalog.md:10900+` (PMConcept7 Home reconciliation):
  "Opening the compact Home menu, either side flyout, a surface options popup … is disclosure-only
  and remains view-local. Selecting one leaf dispatches exactly one semantic command." And
  `Crosswalk.md:273` distinguishes "open/focus/navigate/deep-link" from "tab-local filter/sort/
  search changes" — the latter are explicitly not route/command events.
- **`Run_Graph_View.md:35`**: deep links do not preserve "ephemeral local widget state".
  Range/filter are exactly that.

They become commands only if they ever acquire a persisted cross-surface effect; then the names are
`cmd.usage.set_range` / `cmd.usage.set_filter`, never the dotted forms.

### 2.6 The 6 table entries that are never dispatched
`u11-data.js:1383-1402` declares a 16-entry toast table. Only 10 ids are actually dispatched
(`cmd.usage.refresh`, `cmd.usage.export`, `cmd.account.select_profile`,
`cmd.provider.switch_route`, `cmd.chat.compact_context`, `cmd.chat.open_thread_context_details`,
`cmd.chat.close_thread_context_details`, `cmd.widget.add`, `cmd.usage.forecast.request`,
`cmd.provider.usage.open_management`). **Never dispatched (6):**

| Never-dispatched id | Disposition for the port |
|---|---|
| `cmd.chat.focus_thread_context_details` | Canonical (row exists: `catalog.chat_focus_thread_context_details`). The concept's context pane opens and closes but never *focuses* an already-open pane. Port must wire a real focus path; **not** an id problem. |
| `cmd.widget.remove` | Canonical row exists. u11's widget engine mutates `_pmw.items` and writes `localStorage` directly without dispatching. Port must route removal through the command. |
| `cmd.widget.move` | Same — drag/reorder writes layout directly. |
| `cmd.widget.resize` | Same — corner resize writes layout directly. |
| `cmd.widget.configure` | Same — config sheet writes `cfg` directly. |
| `cmd.widget.reset_layout` | Same — reset clears the key directly. |

**This is the single most load-bearing gap on the command side.** Five of the six are
`cmd.widget.*` layout mutations that u11 performs by writing `localStorage` under
`pmw:<pageId>` (`u11-widgets.js:1083-1090`) with no dispatch. Under `UIW-012`/`WM-044` a persisted
layout change must go through the typed command with `expected_layout_revision` +
`idempotency_key` (the shape `cmd.workspace_layout.*` already uses per
`UI_Command_Catalog.md:10900+`). Declaring a command in a toast map is **not** wiring evidence — the
concept's own `candidate-command-delta.json` lists all 16 under `in_concept_dispatches`, which is
inaccurate for these 6. Fix the register or the port will inherit a false wiring claim.

---

## 3. WIRING DELTA

`Plans/Wiring_Matrix.production.json` = `pm.wiring_matrix.v0`, **725 entries**, keyed by
`ui_element_id`. Schema `$defs/WiringEntry` requires exactly these **13 fields**:

`ui_element_id, ui_location, ui_command_id, handler_location, expected_event_types,
acceptance_checks, evidence_required, state_selector, disabled_reason_projection,
effect_contract, accessibility_contract, test_evidence, event_test_requirements`

plus optional `request_schema_ref`, `result_schema_ref`, `route_contract`, `example`.
`effect_contract` requires `{effect_kind ∈ [event|receipt|route_open|ui_only|mixed], description,
receipt_or_event_refs}`. `accessibility_contract` requires `{role_or_semantics, keyboard_access,
focus_management, disabled_announcement}`. Each `test_evidence` item requires
`{test_id, evidence_kind, requirement}`. **`route_contract`, when present, requires all four of
`{route_target_required, open_subject_required,
route_target_object_kind_when_usage_event_ref, correlation_passthrough}`** — the existing
`catalog.nav_open_usage_subject` row carries a 19-name `correlation_passthrough` list that any new
usage route row must match.

### 3.1 Rows to ADD (3)

| New row key | ui_command_id | handler_location | effect_kind | route_contract? | expected_event_types |
|---|---|---|---|---|---|
| `catalog.usage_request_forecast` | `cmd.usage.request_forecast` | `handlers::usage::request_forecast` | `receipt` | no | **`[]`** |
| `catalog.provider_open_usage_management` | `cmd.provider.open_usage_management` | `handlers::provider::open_usage_management` | `route_open` | **yes** (external-target variant; `route_target_object_kind_when_usage_event_ref` still declared) | **`[]`** |
| `catalog.settings_reveal` | `cmd.settings.reveal` | `handlers::settings::reveal` | `route_open` | **yes** | **`[]`** |

All 13 fields must be authored for each. `state_selector` /
`disabled_reason_projection` follow the live convention
`state.commands.<snake_id>.availability` / `.disabled_reason`.
`evidence_required` must reuse the standing sentence
("Production certification requires render/control evidence, dispatcher fixture, typed
payload/result assertion, projected state selector, disabled-reason proof, receipt/event
assertion, accessibility check, and regression test evidence.").
`test_evidence` needs the four standard items (`.dispatcher` / `.state_projection` / `.effect` /
`.accessibility`) with `evidence_kind` ∈ `dispatcher_fixture, state_projection,
receipt_or_event_assertion, accessibility_regression`.

### 3.2 Rows to AMEND (4 existing usage-named rows + 6 widget rows)
The four usage-named rows the prompt cites — `catalog.usage_refresh`, `catalog.usage_export`,
`catalog.nav_open_usage_subject`, `catalog.artifacts_show_in_usage` — all currently have
`expected_event_types: []`. **Amend only their `ui_location`, `acceptance_checks`,
`accessibility_contract.role_or_semantics`, and `test_evidence` to name the u11 host surface**
(`catalog.usage_refresh.ui_location` is `"Usage page > Refresh"` and already carries the
PMConcept7 icon-only accessibility note — extend, don't replace).
Also amend `catalog.widget_{add,remove,move,resize,configure,reset_layout}` `ui_location` to
include the Usage page host (they are currently Dashboard-shaped), because §2.6 makes the Usage
page a second host for the same six commands. Do **not** create a second wiring row per command —
`WM-034` (catalog-owned wrapper normalization boundary) and `UCC-143` both forbid a second primary
row for one command.

### 3.3 Which rows need `expected_event_types` populated — **NONE, and that is the ruling**
`UI_Wiring_Rules.md:682` is explicit: "While Event Authority remains `UNKNOWN_OPEN`, every row has
`expected_event_types: []`, carries `missing_event_registration`, and proves that no unregistered
`EventRecord` is emitted." `Commands_System.md:4056`: such commands have
`event_effect = none_pending_event_authority`. `UI_Command_Catalog.md:11111`: "wiring must record
`missing_event_registration` rather than fabricate an expected event."

So all three new rows and all amended rows keep `expected_event_types: []`. Populating any of them
is a governance violation, not an improvement. The one usage-adjacent row that *does* carry an
event — `catalog.account_select_profile` → `["account_switch_event"]` — must **not** be reached by
the Usage scope picker (§2.4).

### 3.4 What Event Authority admission requires first
Denominator is `UNKNOWN_OPEN` (`DRY_Rules.md:2138-2142`; `Shared_Integration_Runtime.md:375`;
`storage-plan.md:17730`; `00-plans-index.md:35`), bound to external-custody evidence
`EA-27_PRODUCER_UNION_AND_DENOMINATOR.json`
(sha256 `644c6d0bc913eaed62f41e231fdb7e04f55d270549fcdede73a0869994111e47`) and
`EA-29_TERMINAL_FINDINGS…md` (sha256 `17820aef1b498acf2e5165bee106171ff1ef35a1b23fa67d0cc23e291a8ed7bf`),
with `CL-CRIT-EVENT-AUTHORITY-001` open. **Bulk registration is forbidden; every family is admitted
individually.** For one usage family to become emittable, all of the following must land first:

1. A new row in `Plans/event_family_registry.json.families[]` (currently 39 rows, revision
   `2026-08-04.1`, `unknown_event_disposition: quarantine_without_checkpoint_advance`) carrying
   `family_id, family_revision, event_type, scope_policy, semantic_owner_doc, payload_owner_doc,
   payload_schema_id, payload_schema_ref{path,json_pointer,schema_id},
   legacy{aliases, admitted_extensions, identity_json_pointers, referenced_event_id_pointer,
   redaction{mode,transform_id,transform_version}}, source_refs[], retention_policy_ref
   {registry_schema_id, policy_id, policy_version}`.
2. A concrete payload schema file under `Plans/event_payloads/usage/<name>.schema.json`.
3. A `retention_policy_ref` naming one of the 24 existing `retention_policies[]` policy ids
   (e.g. `RP-OPERATIONAL-2555D`, `RP-AUTHORITY-INDEFINITE`) — a new policy is its own change.
4. A `semantic_owner_doc` anchor that exists (`Plans/usage-feature.md#uf-0xx`).
5. Fresh `CL-CRIT-EVENT-AUTHORITY-001` reconciliation against current sources — the July union is
   a source-dated floor of ≥285 and is explicitly *not* currentness evidence.

Until then the correct wiring state for every new usage command is
`effect_kind: receipt` (or `route_open`), `expected_event_types: []`,
`missing_event_registration`. **Zero new events in this port.**

---

## 4. DRY DISPOSITION — all 18 candidate roles

Governing text: `DRY_Rules.md:2073-2146`. The registry is a **16-row** table of canonical shared
services with a "Prohibited peer names or roles" column, owned by
`Plans/Shared_Integration_Runtime.md`, anchored by **DR-037**. `:2109` (the paragraph following the
table): "Packet candidate roles that are absent from the table remain with their existing domain
owners … **A value type such as `ToolRecoveryEnvelope` is not a service.**" That sentence decides
most of this section: **none of the 18 u11 roles appears in the 16-row table, so none is admitted.**

`candidate-dry-delta.json` lists 18 roles (its own `roles[]` array; the impact-register's
`dry_component_impacts` lists only 9 — use the 18).

| # | Candidate role | Disposition | Justification |
|---|---|---|---|
| 1 | `UsageEventStore` | **(c) already owned** — `Plans/usage-feature.md` UF-085 (UsageRecord identity/dedupe) + `Plans/storage-plan.md` (persistence). | UF-085 is the single normalized accounting record with `dedupe_key`; a second "store" role is a prohibited peer of storage. |
| 2 | `UsageNormalizer` | **(c) already owned** — `Plans/usage-feature.md` UF-085/UF-086 + `Plans/Contracts_V0.md` CV-196/197/200. | UF-086 is the provider parser/fixture contract; CV-197 is the token-counting adapter. Normalization is a mapper contract, not a runtime service. |
| 3 | `SettlementResolver` | **(b) VALUE TYPE** → `usage-feature.md` (UF-085 `settlement_status` enum) + `Contracts_V0.md`. | `settlement_status` is a closed 6-value field on UsageRecord. "Resolver" names a field's derivation, not a shared peer. |
| 4 | `UsageDataQuality` | **(b) VALUE TYPE** → `usage-feature.md` UF-087 + `Contracts_V0.md` CV-200. | `value_state` / `source_class` / `source_confidence` / `source_authority` / `projection_freshness` / `projection_health` already exist as fields; note `source_confidence` is closed to `{high, medium, low, unknown}` by the `validate-usage-contract-drift` gate. |
| 5 | `UsageForecast` | **(b) VALUE TYPE, new** → `usage-feature.md` **UF-094**. | Verified: "forecast" appears exactly once in `usage-feature.md` (`:897`, cost-forecast/warning semantics) and nowhere else in Plans as an owned concept. Not in the 16-row table ⇒ stays with the Usage domain owner. |
| 6 | `CapacityProjection` | **(c) already owned** — `Plans/Goal_Runtime_System.md` (admission/scheduling) with a Usage read-only consumer unit **UF-095/GRS-047**. | `GRS:3149`: "Executor/runtime scheduler remains the canonical owner for … capacity". The shared-runtime peer for admission is `RuntimeResourceGovernor` (row 8), whose prohibited-peer column names "per-feature scheduler/admission governor" — a Usage-side capacity service would be exactly that. |
| 7 | `RouteReceipt` | **(c) already owned** — `Plans/Shared_Integration_Runtime.md` `ProviderDispatchAdmissionService` (row 14) + UF-085 `provider_attempt_ref`/`raw_payload_ref`. | Row 14's prohibited peers explicitly include "`PacketAdmissionReceipt`" and "second provider-permit family". A `RouteReceipt` service is that. |
| 8 | `CacheReceipt` | **(b) VALUE TYPE** → `usage-feature.md` UF-080 (cache usage envelope) / UF-081 + CV-196 buckets + CV-200 `cache_hit`/`cache_strategy`. | Cache facts are token buckets (`cache_read`, `cache_write`, `cache_write_1h`, `cache_write_ttl`) plus `counting_semantics`. Already fully typed. |
| 9 | `TimeBreakdown` | **(c) already owned** — `usage-feature.md` **UF-091** (`OperationalAttributionRecord` partitions) + `Shared_Integration_Runtime.md` `ObservableWork` (row 9). | UF-091 already names provider-active / local / resource / approval / offline-outbox / reconnect-replay-snapshot / maintenance / total partitions. Row 9's prohibited peers include "feature-local work/progress state machine". |
| 10 | `ProviderFamilyUsage` | **(b) VALUE TYPE** → `usage-feature.md` rollups + `Contracts_V0.md` CV-201 attribution tuple. | A rollup dimension over `(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)`. Not a service. |
| 11 | `AccountConnectionUsage` | **(c) already owned** — `Plans/Multi-Account.md` (`:5102` projection display rules, MA-069) + CV-199. | Multi-Account retains authentication and account identity per rows 1/2/4 delegation columns. |
| 12 | `HelperPurposeGroup` | **(b) VALUE TYPE** → `usage-feature.md` **UF-090** purpose taxonomy. | UF-090 already enumerates the purpose set (subagent, crew, vision, compression, web, approval, MCP, skill, title, probe, attachment, fallback, replay, BSD, conditional-rule). A "group" is a projection over that field. |
| 13 | `Goal/CrewUsage` | **(c) already owned** — `Goal_Runtime_System.md` + `Plans/orchestrator-subagent-integration.md`; Usage joins by lineage refs per UF-090. | Concept's own report says "never a second orchestrator" — agreed, and that means no role. |
| 14 | `MaintenanceActivity` | **(c) already owned** — `usage-feature.md` **UF-091** + registered storage family **`operational_attribution_record`** (redb, `materialized`, `owner_doc: Plans/usage-feature.md#UF-091`). | The concept marks this `present-new`; it is **not new**. The family already exists in `storage_value_registry.json`. Amend UF-091's kind list for the 8 u11 `operational[].kind` values instead of minting a role. |
| 15 | `ContextUsageDetail` | **(c) already owned** — `Plans/assistant-chat-design.md` (`:23854` context status module) + `Contracts_V0.md` CV-190/191/192/193 (Thread Usage Detail Surface Replacement, Compact Message Usage Row, Context Detail Editor Tab Paths). | CV-190 is literally "Thread Usage Detail Surface Replacement". A new role would duplicate it. |
| 16 | `UsageWidgetHost` | **(c) already owned — `Plans/Widget_System.md`.** See §4.1 | |
| 17 | `RunOutProjection` | **(b)/REJECT — see §4.2** | |
| 18 | `SourceFreshness` | **(b) VALUE TYPE** → `usage-feature.md` UF-087 (`projection_freshness`, `projection_health`, `observed_at_utc`/`last_updated`) + `Shared_Integration_Runtime.md` `OperationalAwarenessService` (row 11) for freshness labelling. | Row 11's prohibited peer is "Operational-awareness store that becomes a domain authority". A Usage-side freshness service would be that. |

**Net: 0 admissions to the shared-runtime registry. DR-038 records the 18 dispositions; it does not
extend the 16-row table.** `DR-037` stays the registry unit. This is the correct outcome: the
registry's own closing paragraph anticipates exactly this ("Packet candidate roles that are absent
from the table remain with their existing domain owners").

### 4.1 `UsageWidgetHost` justified against `Widget_System.md`
Three canonical facts settle it:
- **WS-002 "Widget Hostability Scope"**: "Widget composition is in scope only for Dashboard
  widgets, **Usage widgets**, and Orchestrator Progress widgets." Usage is already an authorized
  widget canvas — u11 is not inventing hostability.
- **WS-003 "Widget Owner Consumer Boundary"**: "Widget_System owns widget hostability, layout, and
  projection inheritance for Dashboard, **Usage**, and Orchestrator Progress; widgets consume
  stable projections and canonical records and do not define page semantics."
- **`DRY_Rules.md:2062`** (PMConcept7 Home owner boundary): "`Plans/Widget_System.md` owns Dashboard
  widget hostability and widget layout. Consumers cite these owners and do not re-declare the
  layout field shape or create a second Home state machine."

So a `UsageWidgetHost` *service* would be a prohibited feature-local peer of an existing owner.
What the port needs instead is **WS-016**: a Widget_System unit binding the 15 u11 widget types, the
instance contract, the duplicate-instance identity rule, and the layout namespace
`widget_layout:v1:usage` under **WS-009** (which already establishes
`widget_layout:v1:dashboard` and `orchestrator:progress` as separate namespaces).
**WS-015** ("Usage Widget Value-State Contract") is the value-state gate every u11 widget cell must
satisfy and is a required `depends_on`.

### 4.2 `RunOutProjection` — the declared gap, resolved
The concept reports `u11_owner: NONE`, `status: gap`, "No canonical `RunOutProjection` definition
exists in Plans/** or the concept set. FINDINGS U1 applies: `costs.forecastMonthMicro` is a
month-end forecast, not a run-out date. Needs an owner before production."

**Verified true and then some:** grepping Plans for `run-out|run out of|runout|depletion|exhaustion
date|time to exhaust` returns **zero hits** outside work-ledger prose. There is no canonical
run-out concept anywhere.

**Ruling: do not admit the role, and do not create the projection.** Reasons:
1. `:2109` — absent from the 16-row table ⇒ if it existed it would belong to the Usage domain
   owner, and it is a value type either way, not a service.
2. **UF-085 forbids the artifact itself**: negative constraint "Do not fabricate reset countdowns,
   remaining quota, or cost from status/login probes", and canonical text "missing reset signals,
   disabled buckets, missing cost, and missing quota render unknown/not exposed/disabled rather
   than **guessed countdowns** or zeroes." A "run-out date" derived from a month-end cost forecast
   is precisely a guessed countdown.
3. `usage-feature.md:352` (cooldown/reset display rule): authoritative provider `/reset` or
   `/cooldown` values outrank local counters; unknown values render `Unknown reset` /
   `Unknown cooldown end`, "never a fabricated countdown."

**Correct disposition:** `RunOutProjection` is **rejected as a role**. If a depletion signal is
genuinely wanted, it must be a distinct, provider-evidenced value type in **UF-094** — keyed to a
real `window_kind: rolling|fixed_reset|billing_cycle` reset boundary with
`source_class`/`source_confidence`, and rendered `unknown` absent that evidence. It must never be
derived from `forecastMonthMicro`. DR-038 records the rejection; UF-094 records the constraint.
This closes FINDINGS U1 with a negative ruling rather than a new owner.

---

## 5. EVENT SCHEMA DELTA

### 5.1 Field renames u11 → canon (mandatory before any owner-doc text)
Canonical anchors: **UF-085** (`usage-feature.md:5611`), **CV-196** (token buckets), **CV-199**
(attribution minima), **CV-200** (source/window/cache metadata), **CV-201** (attribution tuple).

| u11 field (`u11-data.js`) | Canonical name | Owner |
|---|---|---|
| `vs` | **`value_state`** | UF-087 / `FinalGUISpec.md:28995` value-state matrix |
| `sourceClass` | **`source_class`** | UF-085, CV-200 |
| `conf` | **`source_confidence`** | UF-085, CV-200 (closed `{high, medium, low, unknown}`) |
| *(absent in u11)* | **`source_authority`** — REQUIRED, u11 has no equivalent | UF-085, CV-200 |
| `settlement` | **`settlement_status`** | UF-085 |
| `billingRoute` | **not `cost_status`** → `entitlement_class` + `provider_route_kind` (+ `cost_status` for known/estimated/unknown) | CV-199, UF-085 |
| `costMicro` | **`cost_microdollars`** | UF-085 |
| `tokens.input` | **`input_total`** | CV-196 |
| `tokens.output` | **`output_total`** | CV-196 |
| `tokens.cacheRead` | **`cache_read`** | CV-196 |
| `tokens.cacheWrite` | **`cache_write`** (+ `cache_write_1h` / `cache_write_ttl` when exposed) | CV-196 |
| `tokens.reasoning` | **`reasoning/thoughts`** | CV-196 |
| *(absent)* | **`input_non_cached`, `output_visible`, `provider_total`, `context_estimate`, `counting_semantics`** — all REQUIRED first-class buckets, u11 omits them | CV-196, UF-085 |
| `eventId` | **`usage_event_ref`** / **`usage_record_id`** | UF-085 |
| `receiptRef` | **`provider_attempt_ref`** / `receipt_refs` / `raw_payload_ref` | UF-085 |
| `workId` | **`parent_usage_record_id`** (+ `run_id`/`thread_id`/`node_id`/`tool_call_id`) | UF-085, CV-199 |
| *(absent)* | **`dedupe_key`, `redaction_status`, `provider_payload_hash`** — REQUIRED | UF-085 |
| `requestedAccountId` / `effectiveAccountId` | requested/effective account model + `account_id`, `provider_account_id?` | CV-199, CV-201 |
| `startedAt` / `finishedAt` | **`observed_at_utc`** (+ `settled_at_utc?`, `adjusted_at_utc?`) | UF-085 |
| `failReason` | **`failure_class?`** / **`partial_reason?`** | UF-085 |
| `meta.projectionHealth` / `projectionFreshness` | **`projection_health`** / **`projection_freshness`** | UF-087 |
| `hostId` / `envId` | **`ExecutionHostId`** / **`ExecutionEnvironmentId`** | `Shared_Integration_Runtime.md` §3 |

**Gate hazard:** `validate-usage-contract-drift` fails on any `Plans/*.md` line containing
`input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cache_read_input_tokens,
cache_creation_input_tokens, cached_input_tokens, estimated_cost_microdollars,
final_cost_microdollars, cost_is_estimate, usage_source, usage_source_kind,
provider_usage_source_kind, provider_signal_confidence, UnifiedUsageRecord, reasoning_tokens`
unless the occurrence sits inside a `source_lineage` / `preserved_exact_tokens` /
`compatibility_only_notes` / `stale_retired_dispositions` yaml list, or in an allowed
compatibility/legacy/retired context window. **Every u11 camelCase field name must therefore be
written into `preserved_exact_tokens` or `compatibility_only_notes` — never into active
`canonical_text`.**

### 5.2 Enum comparisons — where u11 is narrower or wider

| Enum | u11 observed values | Canon | Verdict |
|---|---|---|---|
| `source_class` | `provider_reported, cli_reported, pm_observed, unknown, local_estimated` | UF-085: `provider_reported \| provider_header \| cli_reported \| local_estimated \| pricing_estimated \| unknown` | **BOTH.** WIDER: `pm_observed` is not canonical — either map it to `local_estimated` or admit it via **CV-326** with a stated meaning; it must not ship as an unregistered 7th value. NARROWER: u11 never demonstrates `provider_header` or `pricing_estimated`. |
| `settlement_status` | `observed, streaming_partial, settled, unknown` | UF-085: `observed \| streaming_partial \| settled \| adjusted \| failed \| unknown` | **NARROWER.** Missing `adjusted` and `failed`. Both are load-bearing (CV-205 cost-accumulation monotonic adjustments; WS-015 requires `adjusted` and `failed` as distinct display states). Fixtures required. |
| `source_confidence` | `high, medium, low, unknown` | `{high, medium, low, unknown}` — closed by the gate constant | **EXACT MATCH.** Only enum that already conforms. |
| `value_state` (`vs`) | `provider_reported, stale, measured, unknown, unavailable, disabled, estimated, not_exposed` | WS-015 / F3 matrix: `disabled, not_exposed, unknown, stale, estimated, hidden_byok, hidden_subscription, streaming_partial, adjusted, failed`, provider-reported zero, cache zero, cache unsupported | **BOTH, plus a category error.** WIDER/ILLEGAL: `provider_reported` is a `source_class` value leaking into `value_state`; `measured` and `unavailable` are unregistered. NARROWER: missing `hidden_byok`, `hidden_subscription`, `streaming_partial`, `adjusted`, `failed`. WS-015's acceptance criterion demands all of those render as **distinct** states. |
| `billingRoute` | declared `plan_included, api_billed, free, usage_pack, extra_balance, no_charge_observed, unknown`; only 4 fixtured (`plan_included, free, api_billed, usage_pack`) | no canonical `billing_route` field exists; nearest canon is `entitlement_class` + `provider_route_kind`, with `cost_status` separate | **WIDER — invents a field.** Must be decomposed, not renamed. `extra_balance` and `no_charge_observed` are declared-but-unfixtured (the concept admits this in its own `unresolved_questions`). |
| `purpose` | 17 fixtured of 18 declared | UF-090 enumerates the purpose set | **ALIGNED in intent**; UF-090's list must be amended for exact spelling. u11's `aliases_old_to_new` map (`main_work→user_work`, `specialist→subagent`, etc.) belongs in `compatibility_only_notes`. |
| `window_scope` | u11 has no `window_scope` | CV-200: **closed** to `provider \| account \| account+model \| org \| server_profile` | **MISSING.** u11's scope hierarchy (family/account/connection/product/meter) is a *view* scope, not `window_scope`; UF-093 must state they are different axes or the closed enum will be widened by accident. |
| `window_kind` | u11 has 5h/24h/7d as local widget config | `usage-feature.md:595`: `rolling \| fixed_reset \| billing_cycle \| session_only \| unknown` | **MISSING.** Ties back to §2.5 — labels, not commands, but they must carry `window_kind`. |
| `operational[].kind` | 8: `cli_update, offline_outbox, server_continuity, sound_preview, notification_test, backup, project_move, setup_required` | UF-091 `OperationalAttributionRecord`, closed in `Plans/shared_runtime_contracts.schema.json` | **WIDER than the schema.** UF-091's acceptance criterion 1 says the record "uses the closed value definition in `Plans/shared_runtime_contracts.schema.json`" — check the 8 kinds against it before amending. |
| `providerUsage` | `none, validation_only, unknown` | UF-091: operational-only never creates provider usage; model-backed work creates a separately linked record | **CONFORMS** — keep, and rename to a canonical field name in CV-326. |

### 5.3 New u11 fields with no canonical name
`bsd{}`, `attachment{}`, `validationFor`, `operationalRef`, `replayKind`, `roleLabel`,
`runLineage`, `fallbackReason`. **All eight are already *obligated* by UF-090/UF-091 but not
*named*.** UF-090 requires "BSD, subagent, vision, compression, web, approval, MCP, skill, title,
probe, attachment, and other helper calls" with "exact parent and operational lineage"; UF-091
requires BSD "trigger, assignment, cursor/prefix, route, cost, latency, emitted/suppressed/silent
outcome, failure/timeout/quota, and override scope". So these are **field-naming amendments to
existing accepted units**, not new canon — which is the single most important framing correction to
the concept's `event_schema_impacts` list (it presents them as "new optional fields").

### 5.4 Event Authority admission requirement — restated for the schema side
`event_family_registry.json` has **39 families and zero `usage.*` family**. Every usage event this
port could want is a fresh individual admission (§3.4). Concretely: the port ships **no** event.
`operational_attribution_record` and `bsd_runtime_record` are **redb value families** (already
`materialized` in `storage_value_registry.json`), not EventRecord families — that is the legal path
and the port should use it. `storage-plan.md:17959`: "no shared-runtime event is admitted by this
addendum." Same posture here.

---

## 6. STORAGE DELTA

### 6.1 PM7 baseline (verified)
PM7 persists `pm.theme`, `pm.themeFamily`, `pm.themeMode`, `pm.glassBg`, `pm.glassAlpha`, and the
`pm.homeWorkspaceLayout:v1:{project_id}:{workspace_tab_id}` family. **The precedent for all of
these is that they are demo shims, not canonical keys** — `F3-444` says verbatim: "The concept
localStorage names `pm.theme`, `pm.glassBg`, `pm.glassAlpha`, and `pm.activity_bar_order:v2` are
demo shims, not canonical keys: the canonical keys remain `theme:v1` and `activity_bar_order:v1`",
with a negative constraint against promoting them. `storage-plan.md:17813` does the same for the
layout key: canonical `home_workspace_layout.v1:{project_id}:{workspace_tab_id}` +
registered redb family `home_workspace_layout`, with the localStorage form named as
"the prototype's localStorage mirror".

**u11 adds four more shims:** `u11:disclosure`, `u11:scope`, `u11:settings`, and
`pmw:<pageId>` (one per widget page, `u11-widgets.js:1083`).

### 6.2 Required entries

| u11 shim key | Canonical key | Owner | redb family | Retention | Registry entries required |
|---|---|---|---|---|---|
| `u11:disclosure` | **`usage_disclosure_level:v1`** | `Plans/storage-plan.md` **SP-248** (+ UF-092 for meaning) | fold into **`usage_view_state`** (new) | **`RP-CONFIG-CURRENT`** | `storage_value_registry.json` family; `storage-plan.md` §key-table row + write frequency |
| `u11:scope` | **`usage_page_scope:v1:{project_id}`** | **SP-248** (+ UF-093) | `usage_view_state` | **`RP-CONFIG-CURRENT`** | same |
| `u11:settings` | **`usage_quick_controls:v1:{project_id}`** | **SP-248**; policy values themselves stay in `Plans/settings_inventory.json` (Usage is a consumer only) | `usage_view_state` | **`RP-CONFIG-CURRENT`** | same, **plus** a negative constraint that Usage never owns the policy |
| `pmw:<pageId>` | **`widget_layout:v1:usage`** | **`Plans/Widget_System.md` WS-009** (namespace) + **SP-248** (record) | existing `widget_layout` namespace family (do **not** mint a Usage-specific layout family) | **`RP-CONFIG-CURRENT`** | `storage-plan.md` row; **WS-016** binds the namespace |

`storage_value_registry.json` is `pm.storage_value_registry.v2`, **84 families**, and each family
requires the 26-key shape: `family_id, storage_kind, status, tier, key_shape,
compatibility_key_shapes, value_schema_id, value_schema_ref, owner_doc, producer, consumers,
schema_version, encoding, required_fields, optional_fields, nullable_fields, replay_behavior,
migration, migration_disposition, restore_disposition, retention_compaction,
retention_policy_ref, redaction_no_secret_rule, legacy_canonical_crosswalk_status,
recovery_disposition, value_schema`. Model the new family on **`home_workspace_layout`**
(`storage_kind: redb`, `tier: later_gui_or_feature_projection`, `encoding: json_canonical`,
`retention_policy_ref: RP-CONFIG-CURRENT`, and a `migration` string of the form "read the canonical
dotted key first, then the compatibility colon key through `StorageMigrationCoordinator`").

**Note the file is Spec_Lock-pinned and already drifting** → editing it needs a rehash + auto_decision + evidence bundle.

### 6.3 Retention — the 90-day claim
u11's `meta.retentionDays = 90` matches **UF-089**'s head copy ("history kept for 90 days") and
UF-085's raw-event retention default. That is *event/attempt* retention, governed by
`RP-OPERATIONAL-2555D` / the EventRecord retention assignment
(`RET-K37-ASSIGNMENT-001`, v1.0.0) — **not** by the four view-state keys above, which are
`RP-CONFIG-CURRENT` (current-value-only, no history). Keep the two retention stories separate in
SP-248 or the 90-day figure will be attached to the wrong family. The concept's
`storage_retention_impacts` conflates them.

### 6.4 What must NOT be persisted
UF-091's negative constraints plus the Home-layout precedent: no `AuthBrowserSession`, no secrets,
no unredacted payloads, no raw provider payloads in the value fields, and pointer-move/resize
preview frames are local-only and "never become storage writes, commands, or EventRecords"
(`storage-plan.md` PMConcept7 §). u11's direct `localStorage.setItem` on every layout mutation
(§2.6) violates the last one and is the storage-side twin of the missing `cmd.widget.*` dispatches.

---

## 7. SETTINGS DEEP-LINK CONTRACT

### 7.1 The four u11 payloads, verbatim

| # | Site | Payload |
|---|---|---|
| 1 | `u11-prism.html:1178` (quick-controls sheet → providers) | `{surface:'settings', manager:'providers', section:'routing', focus_reason:'usage_quick_controls'}` |
| 2 | `u11-prism.html:1179` (quick-controls sheet → "See all") | `{surface:'settings', manager:'usage', section:'usage_and_extra_usage', focus_reason:'see_all'}` |
| 3 | `u11-widgets.js:1224` (account row → Reconnect) | `{surface:'settings', manager:'providers', account_id:<id>, section:'routing', focus_reason:'reconnect'}` |
| 4 | `u11-data.js:806` → `u11-widgets.js:1249` (ops-8 setup_required) | `{surface:'settings', manager:'providers', section:'setup', focus_reason:'setup_required', continuation:'cont-8841'}` |

(There is a **fifth**, non-settings: `u11-rundetail.js:453`
`{surface:<goals|crew>, manager:<…>, goal_or_crew_id:<id>, focus_reason:'inspect_run'}` — that one
resolves to the existing `cmd.nav.open_subject` family and needs no new contract.)

All five funnel through `U11.deepLink()` (`u11-data.js:1409`), which logs
`{cmd:'semantic.deep_link', payload:dest}` and returns a toast. **`semantic.deep_link` is not a
command id, not a registered namespace, and appears nowhere in Plans.**

### 7.2 Reality check — both halves of the prompt's premise VERIFIED
- **PM7:** `Concepts/PMConcept7.html` contains **0** occurrences of `cmd.settings.` and **0**
  occurrences of `location.hash` / `window.location.hash`. No reveal API, no hash routing. Confirmed.
- **Plans:** a `cmd.settings.*` family **does** exist, but it is per-destination, not general:
  `cmd.settings.open_notifications` (17 hits, wiring row `catalog.settings_open_notifications`,
  `expected_event_types: ["settings.updated"]`), `cmd.settings.open_storage_retention` (8 hits, row
  `settings.storage_retention.open`), `cmd.settings.bloom.open`, `cmd.settings.category.reset`,
  `cmd.settings.suggestion.dismiss`, `cmd.settings.agent_rules.dry_method_default_guard.set`.
- **`focus_reason` has ZERO occurrences anywhere in `Plans/**`.** The entire concept's
  focus-reason vocabulary is unregistered.
- Deep-link routing canon lives in `Contracts_V0.md` (`route_target` / OpenSubject, `:371` "single
  canonical owner for runtime identity, concern/episode lifecycle, `route_target` primitives, and
  OpenSubject routing semantics") and `Crosswalk.md:282` ("Crosswalk must define one canonical
  internal route/target payload: `resume_url` is only one persisted serialized recovery deep-link
  transport form, not the hidden canonical navigation primitive. `OpenSubject` and `OpenFile` must
  live inside the same routing model rather than becoming separate navigation stacks").
  `Crosswalk.md:474` assigns `usage-feature.md` ownership of "`cost_usage` routing and
  `/deep-link/usage` identity behavior".

### 7.3 The contract to introduce

**One new command, not four.** Minting a command per destination is exactly the
"per-surface spaghetti" `Executor_Protocol.md:233` warns about, and the `cmd.settings.open_*` pairs
are already at the edge of that pattern.

- **Command id: `cmd.settings.reveal`** (two segments; verb `reveal`; consistent with
  `cmd.settings.open_notifications` while generalizing it).
- **Effect kind: `route_open`.** Per `Executor_Protocol.md:233`, "deep-link parameters may add
  presentation focus **only after canonical object identity is known**" — so the payload is a
  `route_target` + OpenSubject envelope first, and focus second.
- **Payload (`settings_route` envelope, to be typed in CV-327):**
  `route_target{object_kind:'settings_section', object_id:<canonical section id>}`,
  `open_subject`, `manager` (**closed enum** — `providers | usage | notifications | storage | …`,
  drawn from `Plans/settings_inventory.json`, not invented), `section` (canonical section id),
  `focus_reason` (**closed enum**; the four u11 values `usage_quick_controls | see_all |
  reconnect | setup_required` are the seed set and must be registered, not free text),
  `account_id?`, `continuation?` (opaque continuation token, no secrets — required by the
  `PROVIDER_CLI_FINAL_ADJUDICATION.md` setup_required path), `correlation_id`, `idempotency_key`.
- **`expected_event_types: []`** + `missing_event_registration` (§3.3). Note the two existing
  `cmd.settings.*` rows that *do* declare `settings.updated` are **mutation** commands; a reveal
  mutates nothing and must not borrow that event.
- **Wiring row `catalog.settings_reveal`** with a full `route_contract`
  (`route_target_required: true`, `open_subject_required: true`,
  `route_target_object_kind_when_usage_event_ref: "usage_event"`, and a `correlation_passthrough`
  list at least covering `source_class, source_confidence, source_authority, settlement_status,
  projection_freshness, projection_health, account_id, continuation`).

### 7.4 Owner split
| Layer | Owner | Unit |
|---|---|---|
| Command id + catalog row + disabled reasons | `Plans/UI_Command_Catalog.md` | **UCC-146** |
| Family semantics + typed envelope (CS-066 shape) | `Plans/Commands_System.md` | **CS-067** |
| `settings_route` payload type + closed `manager` / `focus_reason` enums | `Plans/Contracts_V0.md` | **CV-327** |
| Wiring obligation + `route_contract` | `Plans/Wiring_Matrix.md` | **WM-044** (+ the JSON row) |
| Settings destination identity (manager/section ids) | `Plans/FinalGUISpec.md` + `Plans/settings_inventory.json` | **F3-513** |
| Usage-side consumer rule ("Usage never mutates policy locally; every policy change reveals Settings") | `Plans/usage-feature.md` | **UF-092** |
| `/deep-link/usage` identity behavior (already owned) | `Plans/usage-feature.md` per `Crosswalk.md:474` | no new unit |

**`semantic.deep_link` goes into `Wiring_Matrix.production.exclusions.json`** as a
non-command concept token, next to `demo.toast` / `demo.reason` / `page.go`, which are already
listed there for exactly this reason.

---

## 8. MIGRATION / SUPERSESSION

### 8.1 What this port supersedes
| Superseded | By | Note |
|---|---|---|
| The concept's framing of `bsd`, `attachment`, `validationFor`, `operationalRef`, `replayKind`, `roleLabel`, `runLineage`, `fallbackReason`, `hostId`, `envId`, `tokens.cacheWrite` as **new** fields | **UF-090 + UF-091** (both `status: accepted`, added 2026-08-13) | They are field *names* for obligations that are already canon. `event-schema-delta.json`'s `new_fields_2026_08` block is stale and must be re-cast as an amendment, not an addition. |
| The concept's `MaintenanceActivity` "present-new" role | registered redb family **`operational_attribution_record`** (`owner_doc: Plans/usage-feature.md#UF-091`, `status: materialized`) | Storage already exists. Not new. |
| u11's `settlement` 4-value set | **UF-085**'s 6-value `settlement_status` | u11 is narrower; canon wins. |
| u11's `vs` value including `provider_reported` / `measured` | **WS-015** + `FinalGUISpec.md:28995` value-state matrix | Category error; canon wins. |
| u11's `billingRoute` as a first-class field | **CV-199** `entitlement_class` + UF-085 `provider_route_kind` + `cost_status` | Must decompose. |
| Direct `localStorage` layout writes + the toast-map "dispatch" claim | **`cmd.widget.*`** + `widget_layout:v1:usage` + `expected_layout_revision`/`idempotency_key` discipline | §2.6, §6.4. |
| `semantic.deep_link` | **`cmd.settings.reveal`** (§7) | |
| `cmd.usage.detail.open`, `cmd.usage.range.set`, `cmd.usage.filter.set`, `cmd.usage.forecast.request`, `cmd.provider.usage.open_management` (as written) | §2 rulings | Two normalize, three are rejected. |
| `cmd.account.select_profile` dispatched with a `{scope}` payload | **UCC-116** + `account_switch_event` | Hard violation; §2.4. |
| The concept's five deferred owner docs | the real owners in §0.4 | |
| u11's `ue-600→ue-650` / `ue-601→ue-651` / `ue-610→ue-652` renumbering | nothing in Plans | Concept-internal fixture ids; **must not appear in Plans at all** — they are demo lineage, and UF-085 requires immutable `usage_record_id` identity, so a renumbering story does not belong in canon. |

### 8.2 The UF-089 / usage-feature.md:6173 precedent — the recording mechanism
`usage-feature.md:6173` opens the **"PMConcept7 Concept Promotion Addendum - 2026-07-23"**, whose
header paragraph is the exact template to copy:

> "This addendum promotes user-approved PMConcept7 (ChatGuiUpdates2 workstreams, revs 4-9.2) Usage
> page head behaviors into canonical PlanUnits. `Concepts/PMConcept7.html` and
> `Concepts/ChatGuiUpdates2.md` remain illustrative source-lineage only. This addendum creates no
> WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated
> wiring rows, production build tasks, final manifests, or PNC-019 receipts."

**UF-089** (the single unit under it) demonstrates the six mechanisms the port must reuse:
1. **`source_lineage`** names the concept file explicitly as source-lineage-only
   (`"Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per
   Plans/usage-feature.md)"`) → the port writes
   `"Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II; source-lineage-only)"`
   plus the two packet paths.
2. **`preserved_exact_tokens`** carries the literal concept strings.
3. **`stale_retired_dispositions`** carries the dated retirement of what the concept replaces
   (UF-089: "The 'prominent Refresh action' presentation is retired per PMConcept7 rev 9 Usage
   head…"). Every §8.1 row needs one of these lines.
4. **`negative_constraints`** forbids hardcoding the fixture values (UF-089: "Do not hardcode
   Tastebook or the 5-minute/90-day figures as literal copy"). The port must forbid hardcoding
   u11's `ue-*`, `rcpt-*`, `ops-*`, `cont-8841`, `Tastebook`, and the 187.42M cost identity.
5. **`owner_boundary_notes`** points every borrowed surface at its real owner (UF-089:
   "Page-header layout and per-theme header boxes are owned by `Plans/FinalGUISpec.md` F3-462";
   "cmd.usage.refresh and cmd.usage.export command semantics are owned by
   `Plans/UI_Command_Catalog.md` (UCC-116); this unit registers no commands").
6. **`compatibility_only_notes`** carries the Slint-portability line, which every new GUI unit in
   this port needs (opaque precomputed surfaces, translate/opacity/height animations, no
   arbitrary-content backdrop blur, no SVG filters, precomputed color math).

Two additional precedents to mirror:
- **`UI_Command_Catalog.md`'s "PMConcept7 Home Workspace command reconciliation — 2026-08-04"**
  (`:10900+`) is the template for the command side: a "reuses existing where the owner contract
  already covers the action" paragraph, then a `| Command ID | Typed arguments and effect | Owner |`
  table for genuinely new ids, then the disclosure-only/one-leaf-one-command rule.
- **`UI_Command_Catalog.md`'s "PMConcept7 Deferred Token Hygiene Addendum - 2026-07-29"** is the
  template for rejected candidates: a `| Token | Disposition | Canonical target and notes |` table
  with dispositions `newly registered` / `parser-false-positive (generic family root)` / alias,
  each rejected token also written to `Wiring_Matrix.production.exclusions.json`.

Suggested addendum heading, matching the house form:
`## u11 Prism II Usage Concept Promotion Addendum - <date>` in `Plans/usage-feature.md`, with the
same no-WorkNodes/no-NodeSeeds/no-PNC-019 disclaimer sentence verbatim.

### 8.3 Scope-authority caveat to carry forward
`impact-register.json.scope_override` records that the concept was built under an in-session
authorization plus a `.claude/CLAUDE.md` amendment, with `"no_precedent"` stated explicitly
("In-prompt authorizations do not waive developer-level project context"). The current
`.claude/CLAUDE.md` in this repo reads `Allowed edits: Plans/**, Concepts/**, …`. The Plans-side
port is in scope, but the register's own `no_precedent` clause means the **Plans** edits still need
their own explicit instruction — this handoff does not carry it.

---

## 9. GOVERNANCE SEQUENCE

Ordered. Steps 0–2 are prerequisites the prompt's premise omits.

```bash
# --- 0. PRE-FLIGHT: capture the pre-existing failure baseline BEFORE any edit ---
python3 scripts/pm-plans-verify.py verify-spec-lock          # expect FAIL: 26/83 pins drift (§0.2)
python3 scripts/pm-plans-verify.py run-gates                 # record which of the 26 gates fail today
python3 scripts/pm-shard-plans.py --check                    # expect PASS (shards newer than docs)

# --- 1. REGEN THE STALE INDEX FIRST, then re-confirm next-free ids ---
python3 scripts/pm-plan-index.py generate                    # index is 5h stale (§0.3); PSB-001..003 missing
python3 scripts/pm-plan-index.py validate
#    re-run the §0.1 max-id check against the regenerated index; abort if any NEXT id moved

# --- 2. EDIT OWNER DOCS (canonical prose + yaml) — 16 docs, §1.2 order 1..21 ---
#    usage-feature.md (UF-092..095 + amend UF-090/091 + promotion addendum)
#    Contracts_V0.md (CV-326, CV-327)
#    UI_Command_Catalog.md (UCC-146 + amend UCC-116)
#    Commands_System.md (CS-067)
#    Wiring_Matrix.md (WM-044)
#    Widget_System.md (WS-016)
#    storage-plan.md (SP-248)
#    DRY_Rules.md (DR-038)
#    Multi-Account.md (MA-071); Models_System.md (MS-138 + amend MS-118)
#    CLI_Bridged_Providers.md (CBP-030); FinalGUISpec.md (F3-513)
#    Goal_Runtime_System.md (GRS-047)
#    Shared_Integration_Runtime.md (SIR-014, bare-yaml form)
#    Project_Sync_and_Backbone.md (PSB-004, bare-yaml form)
#    00-plans-index.md (registration lines for the new addenda)

# --- 3. EDIT THE MACHINE REGISTRIES ---
#    Wiring_Matrix.production.json            +3 rows, ~10 amended (13 fields each)
#    Wiring_Matrix.production.exclusions.json +6 tokens
#    storage_value_registry.json              +1 family (usage_view_state)
#    event_family_registry.json               NO CHANGE
python3 -m json.tool Plans/Wiring_Matrix.production.json > /dev/null
python3 scripts/pm-plans-verify.py json-syntax
python3 scripts/pm-plans-verify.py validate-wiring-matrix

# --- 4. GOVERNANCE UNLOCK + SPEC_LOCK REHASH (pinned docs only) ---
#    Pinned & touched: DRY_Rules.md, UI_Command_Catalog.md, Wiring_Matrix.md, Contracts_V0.md,
#      Multi-Account.md, Models_System.md, FinalGUISpec.md, Goal_Runtime_System.md,
#      storage_value_registry.json, 00-plans-index.md
#    NOT pinned (no rehash): usage-feature.md, Widget_System.md, storage-plan.md,
#      Commands_System.md, CLI_Bridged_Providers.md, Shared_Integration_Runtime.md,
#      Project_Sync_and_Backbone.md, Wiring_Matrix.production*.json, event_family_registry.json
#    Protocol (Plans/Decision_Policy.md#spec-lock-update-protocol) requires BOTH:
#      requires_auto_decision: true   -> append to Plans/auto_decisions.jsonl
#      requires_evidence_bundle: true -> emit the evidence wave
#    Do NOT silently absorb the 26 pre-existing drifts into this rehash — declare them.
python3 scripts/pm-plans-verify.py validate-auto-decisions
python3 scripts/pm-plans-verify.py verify-spec-lock

# --- 5. REGENERATE DERIVED OUTPUTS (never hand-edit) ---
python3 scripts/pm-shard-plans.py --generate
python3 scripts/pm-shard-plans.py --check
python3 scripts/pm-plan-index.py generate
python3 scripts/pm-plan-index.py validate

# --- 6. TARGETED USAGE GATES BEFORE THE FULL RUN ---
python3 scripts/pm-plans-verify.py validate-usage-contract-drift   # legacy-vocab trap, §5.1
python3 scripts/pm-plans-verify.py validate-usage-gui-fixtures
python3 scripts/pm-plans-verify.py lint-contractrefs
python3 scripts/pm-plans-verify.py lint-banned-phrases
python3 scripts/pm-plans-verify.py lint-path-refs
python3 scripts/pm-shared-runtime-contracts.py --self-test
python3 scripts/pm-shared-runtime-storage-materialize.py check

# --- 7. FULL GATES + EVIDENCE ---
python3 scripts/pm-plans-verify.py run-gates
python3 scripts/pm-plans-verify.py validate-evidence
```

### 9.1 Gate baseline
`run-gates` runs **exactly 26 subchecks** (`cmd_run_gates`, `scripts/pm-plans-verify.py:5997`):
`json_syntax, verify_spec_lock, validate_plan_graph, validate_auto_decisions, validate_evidence,
lint_contractrefs, lint_banned_phrases, lint_path_refs, check_project_artifact_requirements,
validate_plans_to_code_handoff_schema, validate_prd_planning_runtime_contracts,
validate_case_l_non_event_materialization, validate_implementation_readiness,
validate_plan_migration, validate_runtime_artifact_schemas,
validate_goal_runtime_event_fixtures, validate_project_output_fixtures,
validate_usage_gui_fixtures, validate_usage_contract_drift, validate_gui_asset_policy,
validate_web_capability_contracts, validate_filesafe_security_policy, validate_wiring_matrix,
validate_audit_closure, validate_audit_status_index, check_shards`.

The healthy baseline is documented as **24/26 with 2 pre-existing failures**. That figure is
consistent with what I can verify statically — `verify_spec_lock` **must** currently fail given
26/83 drifting pins (§0.2) — but I did not execute `run-gates` (audit scope), so **step 0 above is
mandatory: measure the baseline before editing, or the port will be blamed for pre-existing
failures.** The three gates most likely to move because of *this* port are
`validate_usage_contract_drift` (legacy vocabulary, §5.1), `validate_wiring_matrix` (13-field +
`route_contract` completeness, §3), and `check_shards` (must be re-generated after step 2).

### 9.2 Hard don'ts
- Never hand-edit `Plans/_shards/**` or `Plans/.plan_index/**` — regen-only per
  `sharding_config.json.artifact_policy`.
- Never edit `Plans/Spec_Lock.json` or `Plans/auto_decisions.jsonl` "during transfer without
  explicit governance unlock" (same policy block).
- Never populate `expected_event_types` (§3.3) and never add a family to
  `event_family_registry.json` (§3.4) in this port.
- Never write a u11 camelCase field name into active `canonical_text` (§5.1).
