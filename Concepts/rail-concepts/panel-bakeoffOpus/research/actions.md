# GitHub Actions Side Panel — Design Brief

Column budget: 240px min / 380px default / 480px max (`Plans/FinalGUISpec.md:L551`, `Plans/FinalGUISpec.md:L628`, `Plans/FinalGUISpec.md:L968`). Content width after 8px `MD` padding (`Plans/FinalGUISpec.md:L609`): **224 / 364 / 464px**.

Panel ID `github_actions`, label `GitHub Actions`, purpose "GitHub-hosted workflows, runs, logs, dispatch, and admin settings" (`Plans/FinalGUISpec.md:L679`). It owns shell entry, label, palette surface ID, detachable state, and route-open for `Current Branch` / `Workflows` / `Settings`; `Plans/GitHub_Integration.md` owns the hosted workflow/admin semantics (`Plans/FinalGUISpec.md:L687`). Hosted Actions behavior "must not collapse back into Source Control" (`Plans/GitHub_Integration.md:L333`).

---

## 1. Required regions, canonical order

`Current Branch`, `Workflows`, and `Settings` are **stable subviews**, not stacked cards (`Plans/GitHub_Integration.md:L563`). Ownership splits cleanly: Current Branch owns branch-context readiness and run controls, Workflows owns inventory and run detail, Settings owns hosted admin state (`Plans/GitHub_Integration.md:L604`). Subviews must stay discoverable via a persistent visible subview affordance plus palette coverage (`Plans/FinalGUISpec.md:L723`).

| # | Region | Purpose | Default |
|---|---|---|---|
| 1 | **Header** (24px) | Label, detach grip, refresh, overflow | always visible (`Plans/FinalGUISpec.md:L820`, `Plans/FinalGUISpec.md:L950`) |
| 2 | **Account / capability strip** (one line) | Effective account + `requested ≠ effective` disclosure + switch reason | **collapsed to one line**; auto-expands only when requested ≠ effective, or blocked (`Plans/GitHub_API_Auth_and_Flows.md:L439`) |
| 3 | **Blocked banner** | Ordered `allowed_action_ids[]` + reason copy + active repo/branch context | shown only when blocked or `attention_required` (`Plans/GitHub_Integration.md:L1022`) |
| 4 | **Subview switcher** | `Current Branch` / `Workflows` / `Settings` | always visible; `Current Branch` default (`Plans/GitHub_Integration.md:L563`) |
| 5 | *(Current Branch)* **Readiness line** | Branch/worktree binding, readiness, observation freshness + transport | **open** (`Plans/GitHub_Integration.md:L716`) |
| 6 | *(Current Branch)* **Run list** | Virtualized run rows for the bound branch | **open** — the subview's body |
| 7 | *(Current Branch)* **Failure triage capsule** | Failing job/step, log excerpt, changed files, likely next action | **collapsed**, auto-expands on the selected failed run (`Plans/GitHub_Integration.md:L920`, `/collapsed` + `auto-expand` at `Plans/GitHub_Integration.md:L949-L950`) |
| 8 | *(Workflows)* **Pinned** | Pinned critical workflows + health badges | **open** (`Plans/GitHub_Integration.md:L616`) |
| 9 | *(Workflows)* **All workflows** | Full inventory + dispatch | **collapsed** below 380px |
| 10 | *(Settings)* **Secrets / variables / environments** | Names-only inventory + runner labels; hosted admin handoff | **collapsed** (`Plans/GitHub_Integration.md:L563`) |

Expansion, filter, selected-row, and restore state are panel-specific records, not global settings; Settings > Advanced owns generation/template controls and must not be mirrored here (`Plans/FinalGUISpec.md:L725`, `Plans/GitHub_Integration.md:L750`). On effective-account change the panel hard-refreshes or clears stale selections (`Plans/FinalGUISpec.md:L713`), and pins, last-opened run/job/log focus, and admin-readiness snapshots MUST be invalidated (`Plans/storage-plan.md:L1060`, `Plans/storage-plan.md:L8093`).

**The current build has no subview switcher.** `Concepts/PMConcept7.html:15503-15582` stacks five unconditional cards — auth, current branch, status checks, workflows, secrets — so `Current Branch` and `Settings` compete for the same 380px column simultaneously. That is the primary structural defect.

---

## 2. Ranked feature inventory

**P0 — visible at 240px.** Subview switcher (icon-only). Effective-account chip. Blocked banner with allowed actions. Current-branch readiness line with freshness. Run list. Run status. Rerun / Cancel on the selected run. Failure triage collapsed header.

**P1 — appears at 380px.** Pinned workflows with health badges. Dispatch button per workflow. Failure triage body (failing job/step, log excerpt, changed files, likely next action). Compare Last Success. Open in browser. Auto-refresh interval control. Status filter (`all` / `failed` / `running` / `success`, `Plans/storage-plan.md:L1049`).

**P2 — overflow menu or sheet only.** Secrets / variables / environments names-only inventory. Runner labels. Notification prefs (`notify_on_failure` default true, `notify_on_success` default false, `Plans/storage-plan.md:L1053-L1056`). Pin/unpin management and stale-pin cleanup. Requested-vs-effective full disclosure. Connect / Disconnect / reconnect-with-scope. Workflow authoring assistance (`Plans/GitHub_Integration.md:L973`) — Settings/workflow-editor territory, never inline in a 224px column.

---

## 3. Full command list

Wiring rows in `Plans/Wiring_Matrix.production.json`; all carry the standard 5-check production template (dispatcher registration with typed args, projected state selector **and disabled reason before dispatch**, dispatch evidence preserving `command_id`/`origin`/`correlation_id`/handler/result/receipt, typed payload-or-route disposition, and certification evidence). Preconditions below are from `Plans/UI_Command_Catalog.md:L589-L602`.

| Command | `ui_element_id` | Trigger | Preconditions | Destructive / gated |
|---|---|---|---|---|
| `cmd.actions.show` | `catalog.actions_show` | activity bar, palette | — | no |
| `cmd.actions.switch_subview` | `catalog.actions_switch_subview` | subview switcher | — | no |
| `cmd.actions.rerun` | `catalog.actions_rerun` | run row action / triage | `actions_panel_visible && selected_run` | **mutation** — requires fresh readiness |
| `cmd.actions.rerun_failed` | `catalog.actions_rerun_failed` | triage capsule | `… && selected_run && has_failed_jobs` | **mutation** |
| `cmd.actions.cancel` | `catalog.actions_cancel` | running run row | `… && selected_run && run_in_progress` | **destructive** |
| `cmd.actions.view_logs` | `catalog.actions_view_logs` | job row | `… && selected_job` | no — routes out |
| `cmd.actions.open_in_browser` | `catalog.actions_open_in_browser` | run overflow | `… && selected_run` | no |
| `cmd.github.actions.pin` | `catalog.github_actions_pin` | workflow row | `… && selected_workflow` | no (`cmd.actions.pin` is a compat alias) |
| `cmd.github.actions.unpin` | `catalog.github_actions_unpin` | pinned row | `… && pinned_workflow_selected` | no |
| `cmd.github.actions.open_run` | `catalog.github_actions_open_run` | run row Enter | `… && selected_run` | no — routed run detail |
| `cmd.github.actions.open_job` | `catalog.github_actions_open_job` | job row | `… && selected_run && selected_job` | no |
| `cmd.github.actions.open_step_logs` | `catalog.github_actions_open_step_logs` | failing-step row | `… && selected_job && selected_step` | no — routes to bottom zone |
| `cmd.github.actions.open_related_diff` | `catalog.github_actions_open_related_diff` | triage | `selected_run && related_diff_available` | no — label uncertainty |
| `cmd.github.actions.open_related_worktree` | `catalog.github_actions_open_related_worktree` | triage | `selected_run && related_worktree_available` | no — label uncertainty |
| `cmd.github.actions.compare_last_success` | `catalog.github_actions_compare_last_success` | triage | `… && selected_run` | no |
| `cmd.github.actions.validate_dispatch_readiness` | `catalog.github_actions_validate_dispatch_readiness` | before dispatch/rerun | `… && selected_workflow` | **gate** — stale readiness cannot authorize mutation |
| `cmd.github.actions.open_current_branch` | `catalog.github_actions_open_current_branch` | subview switcher | — | no |
| `cmd.github.actions.settings.open` | `catalog.github_actions_settings_open` | subview switcher | — | no |
| `cmd.github.actions.open_run_in_browser` / `.open_in_github` / `.open_run_diff` | `catalog.github_actions_open_run_in_browser` / `_open_in_github` / `_open_run_diff_canonical` | run overflow | — | no |
| `cmd.github.connect` | `catalog.github_connect` | account strip | — | **approval-gated** — OAuth device-code (`Plans/UI_Command_Catalog.md:L297-L310`) |
| `cmd.github.disconnect` | `catalog.github_disconnect` | overflow | — | **destructive** — deletes credential (`Plans/UI_Command_Catalog.md:L312-L321`) |

Compatibility-only, must not become a second namespace: `cmd.github_actions.show`, `.switch_subview`, `.rerun_workflow`, `.cancel_workflow`, `.pin_workflow`, `.open_run_log`, `.open_run_diff` (`Plans/UI_Command_Catalog.md:L608`).

Keyboard on run/job lists is mandatory: Up/Down, Enter, Escape, Home/End, type-ahead (`Plans/FinalGUISpec.md:L2131-L2134`); every control ≥24px (`Plans/FinalGUISpec.md:L2146`); state must be legible without color (`Plans/FinalGUISpec.md:L1237`).

---

## 4. Row anatomy

**Run row.** Identity = workflow name + run number; context = branch + age.

| String | chars |
|---|---|
| `CI — build + test` | 17 |
| `CI — build + test #312 · main · 2h ago` | 38 |
| `.github/workflows/release-please.yml` | 36 |
| `Build and push Docker image (linux/arm64)` | 41 |
| `dependabot/cargo/tokio-1.40.0` (branch) | 29 |
| `release-please--branches--main` (branch) | 30 |

224px at 12px UI text (~6.5px/char) fits **~34 characters** total — and that is before a 12px status dot and a status chip. The 38-char composite string is the *floor* of realistic, and 41-char job names are common. **Decision: two-line run row at 40px.** Line 1 = status glyph + workflow name, single-line, tail-ellipsis. Line 2 = `#312 · main · 2h` in dim 11px, middle-truncating the branch (`dependabot/…/tokio-1.40.0`) because branch prefix and version suffix both identify. The status **chip** is replaced by the leading glyph plus a text status token appended to line 2 — a chip plus a dot spends 60px encoding one fact twice.

The current build clips mid-word with no ellipsis: `CI — build + test #312 · main · 2h c` (`Concepts/PMConcept7.html:15521`). Every truncation must be an explicit ellipsis, never a clip.

Status vocabulary — run: `queued`, `running`, `success`, `failed`, `cancelled`, `blocked`, `attention_required` (`attention_required` is kept **distinct from** `blocked`, `Plans/GitHub_Integration.md:L1022`, `Plans/GitHub_Integration.md:L1062-L1063`). Observation: fresh / `stale` / `unknown` (`Plans/GitHub_Integration.md:L1528`). Pin health: `active`, stale, `/renamed` (`Plans/GitHub_Integration.md:L649`, `Plans/GitHub_Integration.md:L652`). Row actions: open run (Enter), rerun, cancel, overflow.

**Workflow row.** Identity = workflow display name, fallback to file path (36 chars). Metadata: pinned state, last-run health badge with provenance, dispatchability. Actions: dispatch, pin/unpin, open. Badge mapping for `/build/deploy` and `/deploy` plus noisy-workflow suppression and stale-pin warnings are owned here (`Plans/FinalGUISpec.md:L717`).

**Job row.** Identity = job name (41 chars observed). Metadata: status, duration, failing-step name. Actions: open job, open step logs.

**Key-value rows are banned in this panel.** `Concepts/PMConcept7.html:15507` renders `Scopes` / `repo, read:user, user:email` as a label-value pair; the value alone is 53 chars for a full scope set (`repo, workflow, read:org, user:email, admin:repo_hook`) and overruns its label at every width. Scopes render as wrapping chips or move to the overflow sheet.

---

## 5. Blocked / disabled / degraded states

**Two reason-code vocabularies exist and they do not reconcile — see §10.**

**(a) `GI-017` readiness taxonomy, verbatim, 14 codes** (`Plans/GitHub_Integration.md:L1047-L1060`): `actions_no_github_remote`, `actions_auth_required`, `actions_auth_expired`, `actions_missing_scope_runtime`, `actions_missing_scope_admin`, `actions_workflow_not_dispatchable`, `actions_missing_secret`, `actions_missing_variable`, `actions_missing_environment`, `actions_environment_review_required`, `actions_environment_wait_timer`, `actions_branch_rule_mismatch`, `actions_dispatch_input_invalid`, `actions_workflow_file_invalid`.

Required behavior: these are `actions_*` **details layered onto** shared blocked metadata and must not redefine `blocked_reason_code` (`Plans/GitHub_Integration.md:L1022`, `Plans/GitHub_Integration.md:L1065`). The panel must expose **ordered `allowed_action_ids[]`** and the active repo/branch context (`Plans/GitHub_Integration.md:L1061`), keep `attention_required` distinct from `blocked` (`Plans/GitHub_Integration.md:L1062-L1063`), never silently aggregate multiple worktrees into one branch stream, and resurface on meaningful state change rather than every scheduler tick (`Plans/GitHub_Integration.md:L1066-L1067`).

**(b) Actions Blocked Reason Table, verbatim, 7 codes with required copy** (`Plans/GitHub_Integration.md:L2091-L2099`):

| reason_code | severity | retryable | user message |
|---|---|---|---|
| `actions_auth_missing` | blocked | yes | Connect a GitHub account with Actions access. |
| `actions_auth_expired` | blocked | yes | Refresh GitHub authentication. |
| `actions_workflow_disabled` | blocked | no | Enable the workflow in GitHub before retrying. |
| `actions_branch_protected` | blocked | no | Branch policy blocks this action. |
| `actions_rate_limited` | warning | yes | GitHub rate limit is active; retry later. |
| `actions_runner_unavailable` | warning | yes | No runner is available for this workflow. |
| `actions_observation_stale` | warning | yes | Refresh workflow status before deciding. |

**(c) `GAAAF-005` host policy.** `github_host_policy` is `github.com_only` or `enterprise_allowed`. Under `github.com_only`, GHES repositories and GitHub Enterprise Server URLs get **deterministic disabled-state UX** — explicitly not "hidden fallback or accidental downgraded behavior" (`Plans/GitHub_API_Auth_and_Flows.md:L336`, `Plans/GitHub_API_Auth_and_Flows.md:L370`).

**(d) `GAAAF-014` scope blocking.** Missing scopes produce `blocked_reason_code = missing_scopes` with `missing_scopes[]`, `credential_ref`, `account_id`, `operation_ref`, and `allowed_action_ids[]` (`Plans/GitHub_API_Auth_and_Flows.md:L908`). Operation scopes are `repo`, `workflow`, `read:org`, `user:email`, `admin:repo_hook` (`Plans/GitHub_API_Auth_and_Flows.md:L907`).

**(e) `GI-021` lifecycle states, verbatim** (`Plans/GitHub_Integration.md:L1262-L1268`): `active`, `renamed_redirected`, `transferred`, `deleted`, `archived`, `remote_mismatch`, `historical_only`. Archived/deleted/historical-only disable mutation deterministically; capability limits show as **effective capability state, not hidden controls** — the canonical copy shapes are "can view runs but cannot dispatch" and "can dispatch but cannot manage secrets" (`Plans/GitHub_Integration.md:L1271-L1272`, `Plans/GitHub_Integration.md:L1275`).

**(f) Staleness.** Polling defaults `30000`ms active / `300000`ms idle; staleness begins after two missed polling intervals or one webhook delivery failure plus one failed poll; observations carry `observation_id`, `workflow_run_id`, `transport`, `observed_state`, `observed_at_utc`, `staleness_reason_code?` (`Plans/GitHub_Integration.md:L2073`). Stale readiness **cannot authorize** rerun, dispatch, or dependent Orchestrator steps (`Plans/GitHub_Integration.md:L803`), and absence of a fresh observation "MUST NOT by itself mark the workflow skipped/failed" (`Plans/GitHub_Integration.md:L1530`).

**The current build fails this section outright.** `Concepts/PMConcept7.html:15566` conveys a disabled Dispatch button through a native `title` attribute, and `Concepts/PMConcept7.html:15572` invents the reason code `not_configured`, which appears in **neither** vocabulary. Required instead: a persistent inline blocked row carrying the real code (`actions_missing_scope_runtime`), the table's user message, and the ordered `allowed_action_ids[]` as actual buttons.

---

## 7. Run / job / step depth, and the handoff

**The panel goes exactly two levels: run → job. It never renders a step log.**

- **Level 1 — run rows** in `Current Branch` (branch-bound) or under a workflow in `Workflows`. Virtualized.
- **Level 2 — job rows**, revealed by expanding one run in place. Job name, status, duration, and — when failed — the failing step *name only*.
- **Level 3 — steps: not a panel level.** The failure triage capsule names the failing job and step as text (`Plans/GitHub_Integration.md:L920`) and may show a short log excerpt, but `cmd.github.actions.open_step_logs` and `cmd.actions.view_logs` route **out** to the bottom runtime zone, which "remains terminal/output/problems/debug/ports territory" (`Plans/FinalGUISpec.md:L668`). Log excerpts in the capsule "are not canonical product state" (`Plans/GitHub_Integration.md:L957`).
- **Routed run-detail page** takes everything heavier: run impact mapping — branch/commit/PR, worktree, deploy chain, publish, readiness implications, artifacts — belongs to run detail and Orchestrator receipts, not the panel (`Plans/GitHub_Integration.md:L870`). Compare Last Success opens there too (`Plans/GitHub_Integration.md:L667`).

Run lists and job/step logs must define `initial_window`, `page_size`, `max_live_rows`, `max_in_memory_rows`, load-older behavior, filter-first rules, and pause plus follow / search / jump-to-latest (`Plans/FinalGUISpec.md:L721`). Since the panel does not host logs, only the run/job list budget lands here; follow/pause/jump-to-latest is the bottom zone's obligation.

---

## 8. Minimum viable 240px surface

Header (24px) · account chip, one line, glyph + handle only (18px) · subview switcher, three 24px icon segments with tooltips (24px) · readiness line: branch + freshness + transport glyph (18px) · run list, everything remaining · selected-run action bar: Rerun / Cancel / `…` (24px).

Total chrome: **108px**, plus the blocked banner when present (variable, 2-3 lines — it is never suppressed for space).

Cut at 240px: pinned health badges (kept as a glyph on the run row only), dispatch buttons (overflow), failure triage body (header line only, tap to route out), status checks, secrets/variables, notification prefs, auto-refresh control, all requested-vs-effective detail beyond the chip.

---

## 9. Three hardest layout constraints

1. **The blocked banner cannot be collapsed, and it is the largest element.** `GI-017` requires reason copy *plus* ordered `allowed_action_ids[]` *plus* active repo/branch context (`Plans/GitHub_Integration.md:L1022`, `Plans/GitHub_Integration.md:L1061`), and `GI-021` forbids hiding controls in favor of showing effective capability state (`Plans/GitHub_Integration.md:L1275`). A message like "Enable the workflow in GitHub before retrying." is 46 characters — two lines at 224px — before any action buttons. In the worst case it consumes a third of the panel and there is no legal way to shrink it.
2. **Three subviews, one column, and no tab-strip budget.** `Current Branch` / `Workflows` / `Settings` are stable subviews that must stay visibly discoverable (`Plans/GitHub_Integration.md:L563`, `Plans/FinalGUISpec.md:L723`), but the three labels total 36 characters — more than a 224px row holds alongside anything else. Icon-only segments at 24px are the only fit, which then requires tooltips and a palette route for discoverability parity.
3. **Every row carries identity plus branch plus status plus freshness in ~34 characters.** Run identity alone is 17-41 chars; adding `#312 · main · 2h` and a non-color status indicator (`Plans/FinalGUISpec.md:L1237`) exceeds one line at every width below 480px. Two-line rows solve legibility but halve list density, and `Plans/FinalGUISpec.md:L721` demands a windowing budget nobody has specified.

---

## 10. Open questions / spec gaps

1. **The two blocked vocabularies conflict.** `GI-017` (`Plans/GitHub_Integration.md:L1047-L1060`) and the Blocked Reason Table (`Plans/GitHub_Integration.md:L2091-L2099`) share exactly **one** code, `actions_auth_expired`. `actions_auth_required` vs `actions_auth_missing` and `actions_branch_rule_mismatch` vs `actions_branch_protected` are near-synonyms with different spellings; `actions_workflow_disabled`, `actions_rate_limited`, `actions_runner_unavailable`, `actions_observation_stale` appear only in the table; the other 12 `actions_*` codes appear only in `GI-017`. **13 of the 20 distinct codes have no user-facing message string at all**, and the union has no defined severity or retryability. This must be resolved before any blocked-state UI is built.
2. **No preconditions or disabled reasons in the wiring matrix.** All 33 Actions-related rows in `Plans/Wiring_Matrix.production.json` carry `preconditions: null` and `disabled_reason: null` — including `cmd.actions.cancel` — while each row's acceptance check demands a projected state selector *and disabled reason before dispatch*. The real preconditions exist only as prose in `Plans/UI_Command_Catalog.md:L589-L602` and are not machine-readable.
3. **The command-family table is duplicated verbatim.** `Plans/UI_Command_Catalog.md:L589-L602` and `Plans/UI_Command_Catalog.md:L615-L628` are the same 14 rows with `none` vs `—` in the Keybind column and one fewer rule in the second copy. Neither is marked canonical.
4. **`cmd.github.actions.validate_dispatch_readiness` has no trigger surface.** Readiness is "event-driven plus bounded refresh" on project, branch/worktree, workflow-file save, panel, dispatch-form, and admin CRUD events, and is "not timer-only and not manual-only" (`Plans/GitHub_Integration.md:L766`, `Plans/GitHub_Integration.md:L802`) — yet the wiring matrix places it on a "GitHub Actions dispatch readiness surface" that exists in no IA. Whether the panel shows a manual Refresh control is undecided.
5. **No windowing values.** `initial_window`, `page_size`, `max_live_rows`, `max_in_memory_rows` are required for Actions run lists (`Plans/FinalGUISpec.md:L721`) and are assigned numbers nowhere in `Plans/`.
6. **`cmd.github.actions.dispatch` is unnamed.** `catalog.github_actions_dispatch` maps to bare `cmd.github.actions` on a "GitHub Actions surface" in the wiring matrix, but no dispatch command appears in the catalog family table (`Plans/UI_Command_Catalog.md:L589-L602`) — even though dispatch capability disclosure, dispatch-form readiness, and `actions_dispatch_input_invalid` are all specified. The dispatch **input form** has no specified surface at all: inline in a 224px column, sheet, or routed page.
7. **`filter_status` and the blocked taxonomy do not compose.** Storage offers `"all" | "failed" | "running" | "success"` (`Plans/storage-plan.md:L1049`), which cannot express `blocked` or `attention_required` — the two states `GI-017` insists on keeping distinct.
8. **Pin capacity is unbounded.** `Plans/FinalGUISpec.md:L717` names "the over-pinning tradeoff" and noisy-workflow suppression as owned concerns, but no maximum pin count, no suppression threshold, and no stale-pin expiry interval is given — and `pinned_workflows: string[]` (`Plans/storage-plan.md:L1048`) imposes no limit. At 240px, four pins would consume the entire visible list.
