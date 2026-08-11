# AGENTS side panel — design brief

Net-new design. Current stub (`Concepts/PMConcept7.html:15819-15848`, 30 lines) is three hardcoded agent rows and an "Open Chat" button. Widths: **240 min / 380 default / 480 max**.

**Up front: this panel is genuinely under-specified and a large share of what follows is proposed, not cited.** The entire owner spec is 49 lines (`Plans/FinalGUISpec.md:L30373-L30421`) and says three things: mirror the subagent registry, list active *and* available subagents, provide lineage entrypoints. There is **no command family, no row contract, no status vocabulary, and no projection shape** for this surface anywhere in Plans. Wiring reality check confirms it: of 556 entries in `Plans/Wiring_Matrix.production.json`, **zero** carry a `Side panels > Agents` location. The nearest rows are 7 `cmd.persona.*` entries all located `Agent Config > Personas > *`, plus `cmd.runtime.open_remediation_lineage` (Orchestrator) and `cmd.git.worktree.focus_lineage` (Source Control). By comparison the Testing panel has 7 dedicated side-panel wiring rows. Everything in §4 marked *(proposed)* is mine.

Owner boundary, hard: **"The panel must not maintain its own subagent state; it mirrors the subagent registry"** (`Plans/FinalGUISpec.md:L30373-L30421`, negative constraint). Every row is a projection. No local edits, no local status.

**Boundary vs Agent-Config (do not conflate).** Agent-Config is a *Settings* surface (`Plans/FinalGUISpec.md:L1398-L1415`): it owns persona library CRUD, runtime preferences, skill refs, provider/model/account management, Default Crew config. It is where `cmd.persona.create/update/delete/duplicate/import/export/select` live. **The Agents panel owns neither definitions nor configuration — it owns the live and available *roster* and the route into lineage.** Concretely: Agent-Config answers "what is this persona and how is it configured"; Agents answers "what is running right now, what could I launch, and where did that child run come from". Any edit affordance in the Agents panel must route to Agent-Config, never mutate in place.

---

## 1. Required regions, canonical order

Only two are spec-mandated (active list, available list, lineage entrypoints — `Plans/FinalGUISpec.md:L30373-L30421`). The rest are proposed, derived from §7.19 Agent Activity, which is the closest cited behavioral contract.

| # | Region | Purpose | Source |
|---|--------|---------|--------|
| 1 | `active_runs` | Active child-run / subagent activity: status, owning thread, target, outcome. The panel's reason to exist. | `Plans/FinalGUISpec.md:L1720-L1728` (§7.19), `:L30373-L30421` |
| 2 | `blocked_and_remediation` (proposed) | Split out of region 1 because §7.19 demands a "clear distinction between running, queued, blocked, remediation, and completed", and blocked items are individually actionable and must not collapse (`Plans/FinalGUISpec.md:L3737-L3745`). | derived |
| 3 | `available_subagents` | Launchable registry entries not currently running. Spec says "active **and** available" — the roster half is mandated and is entirely missing from the stub. | `Plans/FinalGUISpec.md:L30373-L30421` |
| 4 | `recent_completed` (proposed) | Historical child-run activity with outcome. §7.19 requires "active and historical". | `Plans/FinalGUISpec.md:L1720-L1728` |
| 5 | `lineage_entrypoints` | Routes to agent lineage views. Not a list — an action attached to rows in 1, 2 and 4. | `Plans/FinalGUISpec.md:L30373-L30421` |

Regions 1, 2 and 4 are three projections of one activity list; implement as one virtualized list with sticky group headers, not three independent scrollers.

## 2. State machine

**Lifecycle, exact tokens** — `running`, `queued`, `blocked`, `remediation`, `completed` (`Plans/FinalGUISpec.md:L1720-L1728`; preserved as exact tokens in F3-147 at `Plans/FinalGUISpec.md:L11889-L11935`). These five are contractual; do not paraphrase, do not merge `blocked` into `failed`.

Proposed transitions (spec states the vocabulary, never the graph):

```
available ──launch──▶ queued ──▶ running ──┬──▶ completed (outcome: success | failure | cancelled)
                                            ├──▶ blocked ──┬──unblock──▶ running
                                            │              └──escalate──▶ remediation
                                            └──▶ remediation ──┬──▶ running   (retry within ceiling)
                                                               └──▶ blocked   (blocked_reason_code:
                                                                    remediation_ceiling_exceeded)
```

Cited anchors for the edges: remediation ceiling default 3, on exceed the node transitions to `blocked` with `blocked_reason_code: remediation_ceiling_exceeded`, remediation lineage stays visible, **no automatic retry after ceiling** (`Plans/FinalGUISpec.md:L3749-L3760`). Blocked is "a card-level state entered from `running` and returned to `running` on unblock"; `disconnected` and `restoring` are agent-session states that surface as `blocked` with a reason code (`Plans/FinalGUISpec.md:L3993-L3994`). So the panel needs **five lifecycle states plus two session sub-states rendered as blocked**.

**Registry resolution state (proposed, from cited rules).** Every registry entry must resolve to a Persona: "Each subagent entry resolves to a Persona through `persona_registry`" (`Plans/orchestrator-subagent-integration.md:L1157`), and the registries are mandatorily separate (`Plans/Personas.md:L356-L377`, `P-023` at `:L1676-L1727`). An `available_subagents` row therefore has a third state beyond available/running: **`unresolvable`** — the registry names it but no Persona resolves. Spec requires fail-fast on this: "Unknown subagent '[name]' in tier config. Available: [list]. Do not silently filter." (`Plans/orchestrator-subagent-integration.md:L1334`). Render it, disabled, with the resolution error. Do not hide it.

Also render **requested vs effective** identity where they diverge — the requested/effective runtime pipeline is canonical (`Plans/orchestrator-subagent-integration.md:L1157`, `:L1169`) and a silently substituted persona is exactly the kind of drift the panel exists to expose.

## 3. Ranked feature inventory

**P0 — 240px.** `active_runs` rows (status dot + subagent name + one-line context); blocked count badge that opens the blocked group; group headers for the five lifecycle states; `available_subagents` collapsed to a count row that expands; lineage action on every active/completed row.

**P1 — 380px.** Owning thread on active rows (§7.19 requires status, owning thread, target, outcome — all four); elapsed time; target ref; outcome chip on completed rows; blocked rows showing `blocked_reason_code` label + time since blocked + primary `allowed_action_ids[]` as buttons (the cited blocked-list row format, `Plans/FinalGUISpec.md:L3743`); available rows showing resolved Persona name and scope; filter control by lifecycle state.

**P2 — 480px / overflow / sheet.** Requested-vs-effective disclosure; remediation generation counter and lineage tree entry; per-row links to chat messages, artifacts, investigation records, review bundles (§7.19); the 5-item compact audit summary row format — operation label, short query/url/task preview, success/failure status, fallback note when present, source/page counts when present (`Plans/FinalGUISpec.md:L1729-L1747`); filter by event family, search by tool or operation, time-range query, drill-down, export (same source); protected_core / bundled / user-created provenance badges (`Plans/FinalGUISpec.md:L1398-L1415`).

**Explicitly out of scope.** Persona editing, crew configuration, tier overrides, disabled/required subagent lists, provider/model selection. All Agent-Config (`Plans/FinalGUISpec.md:L1398-L1415`; tier override and disabled/required list UI is specced at `Plans/orchestrator-subagent-integration.md:L1108-L1113`). Route, don't duplicate.

## 4. Command list — **none exist; all proposed**

Confirmed by inspection of all 556 `Plans/Wiring_Matrix.production.json` entries and by grep across `Plans/UI_Command_Catalog.md`: **there is no `cmd.agents.*` or `cmd.subagent.*` family.** The Agents panel currently has zero cataloged commands — not even an `open_panel` wrapper, which every other panel has (`cmd.testing.open_panel` exists at `Plans/UI_Command_Catalog.md:L8298-L8313`). This is the single largest gap in the brief.

Minimum proposed set, following the `cmd.<surface>.<verb>` convention and mirroring the Testing family's shape:

| Proposed command | Trigger element | Preconditions | Kind / flag |
|---|---|---|---|
| `cmd.agents.open_panel` | Activity bar icon | `panel_available` | `navigation_wrapper`. **Required for parity** — every panel in the inventory has one. |
| `cmd.agents.open_lineage` | Lineage action on any active/completed row | `subagent_lineage artifact exists for run` | `navigation_wrapper`. This is the one action F3-452 actually mandates. |
| `cmd.agents.open_activity` | Row body / "View all" | `child_run_exists` | `navigation_wrapper` → §7.19 Agent Activity surface |
| `cmd.agents.open_thread` | Owning-thread chip | `thread_id present` | `navigation_wrapper` |
| `cmd.agents.watch_run` | Active row | `run_status_queued_or_running` | `domain_action`, view-only |
| `cmd.agents.cancel_run` | Active row overflow | `run_status_queued_or_running && permission_allowed` | `domain_action`, **destructive — confirm required** |
| `cmd.agents.open_config` | Available row / edit affordance | `persona_resolved` | `navigation_wrapper` → Agent Config; enforces the "no local state" boundary |
| `cmd.agents.filter_state` | Group header / filter chip | none | `view_state` |
| `cmd.agents.open_blocked_action` | Blocked row action buttons | `allowed_action_ids[] non-empty` | wrapper over the owner-supplied action; **approval-gated per underlying action** |

Two notes on reuse instead of minting: (a) blocked-row actions should dispatch the existing `allowed_action_ids[]` (e.g. `cmd.orchestrator.replan_node`, `cmd.orchestrator.open_for_edit`, `cmd.orchestrator.abort_node` — `Plans/FinalGUISpec.md:L3755-L3758`) rather than a new agents-local family; (b) `cmd.runtime.open_remediation_lineage` already exists (wired to `Orchestrator > Blocked run actions`) and should be reused for remediation rows rather than duplicated. **Deliberately not proposed: a launch command.** Delegation is orchestrator-owned and aggressive-by-default (`Plans/orchestrator-subagent-integration.md:L1176`); a panel-local "launch subagent" button would breach the mirror-only constraint. If product wants one, it needs an owner decision first.

## 5. Row anatomy

**Available metadata is thin and partly undefined.** Registry names are "stable strings (kebab-case, e.g., `architect-reviewer`, `security-auditor`)" (`Plans/orchestrator-subagent-integration.md:L1337`). Per-row fields available with citation: requested/effective Persona id, scope, chat-selectable eligibility, child/subagent eligibility, protected/bundled status, prompt preview (`Plans/FinalGUISpec.md:L1398-L1415`); status, owning thread, target, outcome (`Plans/FinalGUISpec.md:L1720-L1728`); for lineage, the envelope fields `run_id`, `attempt_id`, `thread_id?`, `node_id?`, `summary?`, `producer_ref?`, `actor_ref?`, `projection_freshness`, `projection_health`, `routing_refs[]` (`Plans/runtime_artifact_subagent_lineage.schema.json`).

Worst realistic identity strings:
- `code-reviewer` = **13 chars** (short end)
- `security-auditor` = **16 chars**
- `architect-reviewer` = **18 chars**
- `rust-performance-auditor` = **24 chars** (user-created entry, plausible upper end for kebab-case)
- Owning thread: `Wizard stage 3 — requirements interview` = **39 chars** — user-authored, effectively unbounded
- Target: `wn_01J9ZQ8K3M7X / import-worker-suite` = **37 chars**
- Reason code: `remediation_ceiling_exceeded` = **28 chars** — longer than most agent names and must render in full on blocked rows

At 240px with a 24px status dot and a 24px row action, ~150px ≈ 20-22 chars at 13px. Registry names mostly fit; **owning thread and target never do** and are P1 second-line metadata. `remediation_ceiling_exceeded` needs its own line or a shortened human label with the code in the tooltip.

**Status vocabulary (exact):** `running`, `queued`, `blocked`, `remediation`, `completed`; plus `disconnected` and `restoring` rendered as blocked-with-reason. Outcome on completed rows: success / failure / cancelled (§7.19 requires outcome; the exact outcome token set for child runs is not specified — gap).

**Required row actions.** Active: lineage, open thread, watch, cancel (overflow). Blocked: primary `allowed_action_ids[]` as buttons, lineage. Completed: lineage, open artifacts/investigation/bundle links. Available: open in Agent Config.

## 6. Blocked and needs-authority presentation

Reuse the cited blocked contract rather than inventing one. Rows carry `blocked_reason_code` and `allowed_action_ids[]`; "blocked responses must be machine-actionable through `allowed_action_ids[]`" (`Plans/FinalGUISpec.md:L3984-L4005`). The cited blocked-list row format is: **node name, `blocked_reason_code` label, time since blocked, and the primary `allowed_action_ids[]` as action buttons** (`Plans/FinalGUISpec.md:L3743`) — adopt it verbatim for agent blocked rows.

Two rules that constrain layout hard:
1. **"Multiple concurrent blocked episodes MUST NOT be collapsed into a single notification — each blocked node is a distinct actionable item"** (`Plans/FinalGUISpec.md:L3745`). At 240px a stack of blocked rows each carrying 1-3 action buttons will dominate the panel. Resolution: a blocked count badge that opens a *filtered full-height list*, not an inline expansion that buries the active runs.
2. On remediation ceiling, show the "Remediation limit reached" state, keep the lineage entry visible, expose Replan / Manual fix / Abort node, and **permit no automatic retry affordance** (`Plans/FinalGUISpec.md:L3749-L3760`).

**`needs_authority`.** The token `needs_authority` does not exist in Plans. The nearest cited vocabulary is `blocked-needs-authority`, and it belongs to the *testing capability* projection set (`Plans/Automated_Testing_System.md:L83-L98`) — not to agents. For agents, authority/permission blocks should surface as `blocked` + a `blocked_reason_code` drawn from the permission owner's code family (e.g. `permission_denied`, `provider_unavailable` are cited exact labels at `Plans/FinalGUISpec.md:L4005`), with the escalation as an `allowed_action_ids[]` entry. **Do not mint an agents-local authority state.** Child runs inherit the parent permission ceiling and child `question` access is default-denied unless an owner policy opens it (`Plans/orchestrator-subagent-integration.md:L1178`), so authority blocks legitimately belong to the parent — the panel shows them and routes up.

## 7. Minimum viable 240px surface

1. **Header, 28px** — label + active count badge + blocked count badge (badge is a button, not decoration).
2. **Group: RUNNING** — up to 4 rows @ 32px: dot + registry name + elapsed. Name middle-elided.
3. **Group: BLOCKED** — collapsed to one row: "2 blocked" + open. Never inline-expanded at this width.
4. **Group: QUEUED / REMEDIATION** — one summary row each, count only.
5. **Group: AVAILABLE** — one row: "14 available" + expand to a full-height sheet.
6. **Group: RECENT** — 3 rows, outcome dot + name + relative time.
7. **Row tap = lineage.** At 240px there is no room for per-row action buttons; the row itself is the lineage entrypoint (the one mandated behavior), and everything else is long-press / overflow. Row and every badge stay ≥ 24px (`Plans/FinalGUISpec.md:L2144-L2147`); arrow/Enter/Escape/Home/End list navigation is required (`Plans/FinalGUISpec.md:L2129-L2135`), so the row must be a single focusable element with the lineage route as its default activation.

Per §12.2, "all extras behind overflow menu" is the sanctioned 240px pattern (`Plans/FinalGUISpec.md:L2081-L2090`).

## 8. The 3 hardest layout constraints

1. **Five lifecycle groups plus an available roster in one 240px column.** Six sections is more than Testing's five and the content is less compressible, because blocked rows carry mandatory action buttons that cannot collapse into a chip. Resolution: exactly one group is expanded at a time; the others are one-line count rows; blocked opens a filtered full-height view rather than expanding in place.
2. **"Active and available" are two different information shapes forced into one panel.** Active rows are time-varying, run-scoped, and lineage-bearing; available rows are static, registry-scoped, and config-bearing. They share almost no metadata and want opposite sort orders (recency vs alphabetical). Resolution: available is a collapsed, count-first section that expands to a sheet — never interleaved with active rows.
3. **Owning thread is user-authored and unbounded, but §7.19 requires it on every row.** `Wizard stage 3 — requirements interview` (39 chars) has no fixed prefix to elide and no stable discriminating segment, unlike a `::`-delimited test path. Resolution: thread is P1 second-line-only with head-truncation plus tooltip; at 240px it is dropped entirely and reachable via `cmd.agents.open_thread` from overflow.

## 9. Open questions / spec gaps — extensive

This panel needs owner decisions before it can be built to spec rather than to taste.

1. **No command family at all.** Zero `cmd.agents.*` in the catalog, zero wiring rows for `Side panels > Agents`. Every command in §4 is proposed. Highest-priority gap; without at least `cmd.agents.open_panel` and `cmd.agents.open_lineage` the panel has no dispatchable behavior.
2. **`subagent_lineage` has no minimum payload semantics — cited as a known gap.** `Plans/runtime_artifact_subagent_lineage.schema.json` declares `type_payload` as `{"type":"object","minProperties":1}` and nothing more. `Plans/Runtime_Artifacts_Panel.md:L116` states outright that "`subagent_lineage` still has no minimum payload semantics", and RAP-009 (`Plans/Runtime_Artifacts_Panel.md:L556`) preserves that as an accepted gap. **The lineage entrypoint is the one behavior F3-452 mandates, and its destination payload is undefined.** The panel can link to a lineage artifact but cannot render or summarize one.
3. **"Agent lineage views" are named but never defined.** The phrase appears only inside F3-452 itself (`Plans/FinalGUISpec.md:L30383`, `:L30392`) — there is no §7.x view spec for it, no route, no command. Is it §7.19 Agent Activity filtered by run, the remediation lineage tree, or a third surface? Unresolved.
4. **No subagent registry entry schema.** Nothing defines the fields of a registry entry. What exists: names are kebab-case stable strings, entries resolve to Personas, entries name "runnable delegated-subagent roles" and do not store prompt bodies (`Plans/orchestrator-subagent-integration.md:L1157`, `:L1337`; `Plans/Personas.md:L1676-L1727`). No description, no capability tags, no icon, no ordering. Row content for `available_subagents` is therefore unspecified.
5. **No child-run projection contract.** Nothing specifies how the panel obtains active child runs, at what freshness, with what scope (project? thread? run?), or what happens when the projection is `stale` / `degraded` / `unavailable` — even though `current` / `refreshing` / `stale` / `degraded` / `unavailable` are canonical projection states elsewhere (`Plans/FinalGUISpec.md:L1165-L1167`, §7.1) and `projection_freshness` / `projection_health` are required fields on the lineage artifact. The panel needs a stale/degraded presentation and has none.
6. **Outcome vocabulary for completed child runs is undefined.** §7.19 requires "outcome" but never enumerates it. Testing has an explicit 7-value status enum; agents has nothing comparable.
7. **`remediation` is a lifecycle state with no cited entry condition for subagents.** The ceiling behavior is specced for orchestrator *nodes* (`Plans/FinalGUISpec.md:L3747-L3760`); whether subagent child runs share that machine, or have their own, is unstated. §2's graph assumes they share it.
8. **Registry-vs-panel refresh semantics.** "Mirrors the subagent registry" with no local state — but the refresh trigger, cadence, and behavior on registry change mid-run are unspecified.
9. **Removed catalog names are ambiguous in the roster.** `project-manager`, `product-manager`, `context-manager` are "source-lineage/import-seed vocabulary only unless a future owner decision promotes a replacement" (`Plans/orchestrator-subagent-integration.md:L1113`). Should imported-but-unpromoted names appear in `available_subagents` as disabled rows, or be hidden? Recommend disabled-with-reason, consistent with the fail-fast-don't-silently-filter rule at `:L1334`.
