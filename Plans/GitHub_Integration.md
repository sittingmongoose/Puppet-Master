# GitHub Integration -- Spec


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Source Control and worktree handshake


### GitHub stable account identity


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
PUPPET MASTER -- GITHUB INTEGRATION SPEC

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).

LOCKED DECISIONS (DO NOT CHANGE IN THIS DOC):
- GitHub operations: GitHub API provider only; no external auth-shell dependency
- Default auth flow: OAuth device-code (realm: github_api)
- No secrets in seglog/redb/Tantivy or logs; secrets live only in OS credential store
- Local git operations use the local `git` binary (not the GitHub API)
- SSH remote execution: git commands run on the remote via SSH subprocess
- All interactive UI elements dispatch UICommand IDs; no business logic in the UI layer
-->

## Change Summary

- **2026-02-25:** Remediation pass for §B. Added conditional PR/Issues panel visibility
  behavior (optional surface with deterministic disabled state), expanded PR/Issues/Actions
  failure-state tables, and added explicit Actions run/log summary contract fields.
- **2026-02-25:** Initial creation. Covers IDE Git Panel (§A), GitHub API integration
  (§B), SSH Remote Dev Servers (§C), and no-wizard Project Management flows (§D).
  All decisions resolved deterministically; no open questions.

---

## SSOT References (DRY)

The following canonical documents govern this spec. This document MUST NOT redefine schemas or contracts owned by those sources; it adds the IDE UX layer on top of them.

ContractRef: ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2

| Reference | Purpose |
|---|---|
| `Plans/Spec_Lock.json` | Locked decisions (`github_operations`, `auth_model`) |
| `Plans/DRY_Rules.md` | DRY + ContractRef rule (canonical) |
| `Plans/Contracts_V0.md` | Canonical contracts: EventRecord, UICommand, AuthState |
| `Plans/Glossary.md` | Canonical terminology |
| `Plans/Decision_Policy.md` | Deterministic defaults; tie-break policy |
| `Plans/Architecture_Invariants.md` | INV-002 (no secrets in storage), INV-010 (naming), INV-003/004/011/012 (UI rules) |
| `Plans/GitHub_API_Auth_and_Flows.md` | GitHub auth contract and API call flows (SSOT for auth; this doc adds IDE UX layer only) |
| `Plans/WorktreeGitImprovement.md` | Git/worktree implementation details and gap fixes |
| `Plans/FileManager.md` | File Manager panel and IDE-style editor |
| `Plans/chain-wizard-flexibility.md` | Wizard/project intent-based workflow definitions |
| `Plans/UI_Command_Catalog.md` | Stable UI command IDs (canonical SSOT) |
| `Plans/Progression_Gates.md` | GATE-003 (invariants), GATE-009 (ContractRef), GATE-010 (wiring) |
| `Plans/Crosswalk.md` | Primitive ownership boundaries |
| `Plans/storage-plan.md` | redb/seglog/Tantivy storage rules |

> This document intentionally does **not** redefine `AuthState`, `AuthPolicy`, `AuthEvent`, GitHub device-code polling semantics, token storage rules, or GitHub API call contracts.
> Those are canonical in `Plans/GitHub_API_Auth_and_Flows.md` and `Plans/Contracts_V0.md`.

---

> **Anti-Drift Compliance:**
> - All operational statements require `ContractRef:` annotations (ContractRef: Plans/DRY_Rules.md, Plans/Progression_Gates.md#GATE-009).
> - Architecture invariants apply, especially secrets and naming (ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010).
> - Ambiguity resolved deterministically via `Plans/Decision_Policy.md` §2 (ContractRef: PolicyRule:Decision_Policy.md§2).
> - GitHub API operations use `github_api` realm only; not `copilot_github` (ContractRef: Plans/GitHub_API_Auth_and_Flows.md §auth-realm-split).
> - `github_api` and `copilot_github` tokens and `/state` are never cross-consumed; GitHub Copilot provider account switching must not change GitHub API, Git transport, or local worktree authority.

---

## Canonical owner and consumer reconciliation

This section reconciles GitHub integration consumer semantics with the canonical owner specifications in Plans/Contracts_V0.md, Plans/Executor_Protocol.md, and Plans/Models_System.md.

### Source Control and GitHub Actions surface split

GitHub Integration owns two distinct user-facing surfaces. **Source Control** is the Git-first repo/worktree surface for `Changes`, `History`, `Graph`, `Worktrees`, `Branches / Stash`, review/compare, conflicts, worktree-native recovery, and `/safe` local repo actions. **GitHub Actions** is the GitHub-hosted workflow/admin/runtime surface for workflow runs, logs, dispatch, workflow files, and repository Actions settings. The legacy `Git (GitHub)` wording is a migration alias only and must not collapse hosted Actions behavior back into Source Control.

Four GitHub-adjacent concepts stay separate. `GitHub Copilot` is a provider capability and is out of scope as a user-facing GitHub Integration GUI surface for this research pass. `GitHub API` is internal integration plumbing for GitHub-hosted features, not a visible GUI panel. `GitHub Actions` is the user-facing hosted workflow surface and may use the GitHub Actions VS Code extension as a functional parity baseline without copying its visual design. `Source Control` is the user-facing repo-control surface and may use VS Code Source Control as a functional parity baseline without copying its visual design.

Source Control is the canonical SCM panel contract, even when GitHub-hosted features are nearby. Its `Changes` subview includes staged/unstaged/untracked groups, diff preview mode, stage/unstage/discard/commit/push/pull/fetch/sync, stash flows, branch switch/create, incoming/outgoing status, `/committing`, `/outgoing`, `/fetch/pull/push`, merge-conflict handling with inline actions, and multiple SCM providers while Git remains built-in. `History`, `Graph`, and `Worktrees` are dedicated sub-tabs, not buried health/settings utilities; worktree review, recovery, and conflict flows deep-link back to this Source Control surface. The high-level Source Control ownership chain includes `/compare/stage/unstage/discard/stash/history/graph/worktrees` rather than scattering those git-native flows across chat, FileManager, or Progression Gates.

Source Control accordion section headers are interactive controls with `accessible-role: button` and `accessible-label: "{section_name}, {item_count} items, {expanded|collapsed}"`, where `section_name` is the visible section name and `item_count` is the current filtered count.

Source Control compare-target defaults are deterministic: opening a file diff from the unstaged list defaults to `index <-> working tree`; opening from the staged list defaults to `HEAD <-> index`; opening an untracked file defaults to `empty <-> working tree`; opening from commit history defaults to `selected commit <-> first parent`; and opening a conflicted file defaults to three-way conflict review with `base`, `ours`, `theirs`, and `result`.

Compare/open identity consumption and run-aware compare-origin forwarding: GitHub compare/open pivots carry canonical compare identity instead of reconstructing targets from local UI state. The `compare_origin` value is closed to `changes.unstaged`, `changes.staged`, `history.commit_parent`, `conflict.review`, `worktree.branch_compare`, `actions.run_commit_range`, `blocked.dirty_worktree`, and `recovery.safe_point_retry` for GitHub Integration consumers. Each origin records the relevant `project_id`, `repo_id`, `worktree_id`, branch/head/baseline or run commit-range refs, and owner run/node/attempt refs when available; if an origin cannot be revalidated, the UI opens review in a degraded historical mode or blocks mutation rather than silently substituting the current branch.

Project/repo/account scoping is explicit: cache, route, and recovery records key on `{project_id, selected_repo_id, effective github_api account}` plus `/repo/account` so GitHub Integration does not confuse cross-root or cross-account state. `selected_repo_id`, `provider_accounts`, and `provider_accounts.*` consume project-scoped `Plans/storage-plan.md` / `storage-plan.md` policy state; wizard-blocked recovery stores blocked-episode `detail_ref` attachments rather than a standalone integration object.

The multi-context Source Control model never assumes a single repo context: multi-lane execution may span worktrees, branches, or hosted refs pointing at different states, and GitHub Integration carries the active repo/worktree/run binding instead of flattening those contexts into one current branch.

Requested/effective identity propagation into GitHub docs: GitHub auth, admin, readiness, and history surfaces disclose requested versus effective execution identity by consuming `Plans/Contracts_V0.md` runtime identity fields. Source Control, GitHub Actions Current Branch, Workflows, Settings, run history, compare/review, and recovery views show Requested account, Requested binding, Effective account, Switch reason, and execution role whenever an account or hosted-admin capability affects availability, mutation authority, audit history, or recovery. GitHub Integration does not redefine those fields locally; it stores only the GitHub resource refs, capability/readiness refs, and route/open context needed to display and audit the same identity snapshot.

`Plans/GitHub_Integration.md` / `/GitHub_Integration.md` consumes `Plans/GitHub_API_Auth_and_Flows.md` / `/GitHub_API_Auth_and_Flows.md` identity and degraded-capability contracts in `/UI` surfaces so stable account identity, effective GitHub account, and degraded capability state stay visible in runtime/UI parity.

The owner-level gaps in GitHub Integration require live canonical repair or explicit retirement evidence before a row can be treated as transferred; annotations alone are not sufficient.

Identity display and audit records expose the stronger requested/effective/provider/account split as `/effective/provider/account` and `/record` views; non-runtime `/integration` and `/page/artifact` surfaces disclose the same identity snapshot instead of inventing local display-only account fields.

Search result routing in multi-run seams preserves `focused_run_id` or records an explicit user/runtime change to that focus; it must never switch focused run context silently.

`recovery.safe_point_retry` opens a confirmation before restore or retry mutation. The confirmation names the repo, worktree, branch, expected baseline/head, `safe_point_id`, affected files summary, owner run/node/attempt, and the action that will follow restore, such as `restore_safe_point_then_retry`; declining leaves the blocked episode unchanged. FileSafe remains the mutation guard owner, and `Plans/Contracts_V0.md` remains the owner for `safe_point.created`, `safe_point.restored`, and restore outcome events.

Run-aware `compare-origin` forwarding applies when GitHub Integration opens `/admin/readiness/history`, the Worktree topology view, or Dedicated review mode and guided conflict assistant: the surface preserves the same `compare_origin` payload, requested/effective identity snapshot, and origin-specific refs from Source Control or GitHub Actions into the opened review, conflict, safe-point retry, or run commit-range context.

The GitHub Actions IA has three stable subviews: `Current Branch`, `Workflows`, and `Settings`; `Current Branch / Workflows / Settings` is the SSOT split for hosted workflow/admin behavior, and the legacy route token `/Workflows/Settings` maps to the GitHub Actions Settings subview. `Current Branch` shows branch-scoped workflow readiness, latest runs, status checks, rerun/cancel/pin controls, and links back to Source Control branch state. `Workflows` owns workflow inventory, run history/detail, log follow, dispatch, `workflow_dispatch` forms, generated workflow visibility, and workflow authoring help. `Settings` owns Actions readiness and admin state, including secrets, variables, `/environments`, permissions, runner labels, pinned workflows, and capability/auth diagnostics. The legacy `/local-repo` and `Git (GitHub)` labels are compatibility entrypoints that route to Source Control for local repository state and GitHub Actions for hosted workflow state.

GitHub Integration owns GitHub Actions and hosted-repo ConfigKey schema details only for GitHub-specific Settings, readiness, workflow, admin, and source-control preferences. Shared storage key catalog rules remain imported from `Plans/storage-plan.md`, and ConfigKey entries here must not duplicate Contracts event names, Permissions policy schema, usage rollup logic, or FileSafe safe-point behavior.

`Pinned critical workflows` and `Critical workflow pinning / health badges` are owned by `GitHub Actions > Workflows`. Users can pin or unpin high-value workflows with `cmd.github.actions.pin` and `cmd.github.actions.unpin`; compatibility `cmd.actions.pin` aliases must resolve to the canonical commands. Pinned workflow records store workflow id/path/name, repo binding, branch/worktree context when relevant, health badge window, noisy-workflow suppression preference, `notify-on-failure` preference, and `/event/storage` provenance. `/build/deploy`, `/deploy`, release, and other critical workflow badges may appear in Current Branch, dashboards, receipts, and Orchestrator mirrors, but they link back to GitHub Actions as owner. `/tradeoffs`: over-pinning can turn the surface into noise, so pinned-workflow health badges must expose stale or `/renamed` workflow state and let the user unpin without hiding historical receipts.

`Replay from last known good` belongs to GitHub Actions failure triage and workflow history. It compares a failed run against the last successful run on the same workflow and branch, records the known-good run id, cached comparison target id, comparison window length, and `run-history` comparison command, and can `/include` commit diff, env, and `/config` metadata when the user enables those details. If no known-good run exists, the UI says so and offers same-branch history or manual compare selection. GitHub reruns use original commit/ref semantics; replay UI must not imply that a rerun tests the latest branch head unless a new dispatch actually occurs.

`Current Branch` semantics are explicit when multiple worktrees, branches, or background runs exist (`/branches/background`). The active branch/worktree binding is shown, background run status remains visible without stealing focus, and Actions readiness distinguishes requested admin/runtime action vs effective scopes, `/rate-limit/repo` linkage, and repository capability. Environment-gated readiness has canonical blocked reasons and recovery CTAs. Workflow generation/template defaults do not override live-admin state: workflow generation owns authored defaults, while live GitHub Actions Settings owns repository-level secrets, variables, environments, permissions, and runner state. Workflow generation vs `live-admin` precedence follows explicit source-of-truth rules: generated files are source-of-truth for authored workflow content, while hosted repository settings are source-of-truth for admin capability. `Settings > Advanced > CI / GitHub Actions` owns project-global workflow template defaults and generated YAML defaults only; `GitHub Actions > Current Branch` owns branch-context readiness plus run-trigger controls, `GitHub Actions > Workflows` owns workflow inventory and run detail, and `GitHub Actions > Settings` owns context-bound hosted admin state. Actions-specific recovery CTAs route to the owning subview rather than duplicating admin controls in Source Control or a project-global settings page. Repository-level Actions admin changes create durable audit receipts even when not tied to a run.

Actions readiness refreshes on project open, branch/worktree switch, `workflow-file` save, panel open, dispatch-form open, and pre-dispatch only when no fresher event-driven observation exists. Manual refresh remains available, but readiness is not timer-only and not `/timer` driven. The `Local-to-remote workflow loop` validates dispatchability before and after push by preserving required inputs, required secrets, branch eligibility, generated template mapping, cached `dispatch-form` state, `to-remote` status, and `/dispatch` readiness without persisting secret values. The `Actions-to-code correlation` pivot (`to-code`) links a run, `/job/step`, failing-step card, or failed check back to commit range, changed files, branch/worktree mapping, active worktree, source line context, and related Source Control review/diff context when available.

Actions readiness triggers are concrete: opening `GitHub Actions > Current Branch`, opening a dispatch form, opening `GitHub Actions > Settings`, saving a workflow file under `.github/workflows/`, changing worktree or branch context, and completing secrets/variables/environments CRUD all re-evaluate readiness before mutation. Readiness is event-driven plus bounded refresh, not timer-only and not manual-only. Stale readiness snapshots are visibly labeled stale and cannot authorize rerun, dispatch, or an Orchestrator step that depends on Actions dispatch or an Actions-gated release flow. Fixing Actions auth from any surface routes to `GitHub Actions > Settings`; `Current Branch` always reveals the active branch/worktree context; environment approval wait states are wait/blocked states rather than failures; manual workflow-file edits affect readiness without requiring template regeneration; and admin changes such as secret updates create durable receipts without storing secret values. Readiness stores `/status/last`, `admin-scope`, `hidden-value` handling, selected scope, and `cmd.github.actions.validate_dispatch_readiness`; when admin or `hosted-admin` scopes are missing, the GUI shows read-only inventory, browser handoff, and `/scope-based` limits rather than implying values can be read.

Actions-to-code correlation is a remediation bridge, not canonical proof by log parsing. Required state includes preferred diff target, auto-open failing file hints, show heuristic matches toggle, correlation confidence threshold, changed-files source preference, and auto-open nearest worktree toggle. Receipts for workflow runs, jobs, and steps join `run_id`, `/commits`, commit range, changed files, branch refs, worktree refs, and `/failing` step metadata. Commands include `cmd.github.actions.open_run`, `cmd.github.actions.open_job`, `cmd.github.actions.open_step_logs`, `cmd.github.actions.open_related_diff`, and `cmd.github.actions.open_related_worktree`; `cmd.github.actions.open_related_diff/open_related_worktree`, `/open_related_worktree`, `open_related_diff`, and `open_related_worktree` are canonical quick pivots from GitHub Actions into Source Control. `/event/storage` and `/events/storage` store the run/job/step ref, last-opened run/job/step focus, correlation candidates, selected branch-diff, and worktree mapping, but never turn log-to-file inference into canonical truth. Orchestrator blocked or failing workflow cards that cite workflow refs use this as the default remediation bridge. If exact file correlation is unavailable, fall back to commit range plus workflow file diff with an explicit uncertainty label; if there are multiple candidates, show candidate worktrees/commits rather than auto-opening one. `/tradeoffs`: log-to-file and monorepo attribution are probabilistic, especially after force-pushes, so heuristic matches must stay labeled.

`Run impact mapping` is owned by GitHub Actions run detail and mirrored by Orchestrator receipts. A run impact map shows `/branch/commit/PR`, branch, PR, worktree, container publish, deploy chain, and `Secrets / variables / environments readiness` implications for the selected run/job/step. Related objects may auto-pin only as view state, never as an `auto-write` to repository or workflow state. If mapping evidence is incomplete, GitHub Actions shows a `partial impact map` with the derived-artifacts toggle, preferred impact categories, retention boundary, and `/download` fallback instead of presenting heuristic linkage as complete truth.

GitHub Actions capability and readiness uses GitHub `APIs` for rerun, `/cancel/secrets/variables/environments`, workflow dispatch, logs, and related-diff pivots. Secret readiness is name/scope-based and scope-based; GitHub-hosted secret values are not value-inspection-based after creation, so `Secrets / variables readiness` reports missing names, scopes, and environment linkage rather than pretending to inspect secret values.

`Failure triage view` is the GitHub Actions run-detail GUI pane for compressing a failed run into the failing job, failing step, last relevant logs, changed files, likely next action, and retained metadata. It owns `step-log`, `fail-step`, `log-download`, job-level and step-level log access, `/collapsed` versus expanded log state, `auto-expand` failing-step behavior, and `/open-in-browser` fallback when logs are unavailable, truncated, or rate-limited. `/tiers` determine how much log detail is fetched by default before the user expands or downloads more evidence. `/events/storage` records the last failing run/job/step ref, log timestamp, truncation state, and downloaded artifact ref without treating log excerpts as canonical product state.

GitHub Actions repro loops share the Debug investigation budget rule: a strategy-tier change resets `repro_attempts_per_strategy_tier` only and does not reset `wall-clock` or `no-new-evidence` budgets.

`Replay from last known good` and failure comparison use `cmd.github.actions.compare_last_success`. The command records the baseline run id and exposes same-branch history, manual compare selection, and `/include` options for commit diff, environment, and `/config` metadata. If no prior success exists, the GUI says so rather than fabricating a known-good baseline.

`Workflow authoring assistance` is a GitHub Actions Settings and workflow-editor capability, not a generic YAML textarea. It provides `language-service` validation, completion, syntax hints, integrated docs, `remote-repo` support disclosure, `/proxy` behavior where provider access is mediated, and `/generation` links back to workflow template generation. The GUI may assist YAML authoring and preview `/apply`, but `/event/storage` must store validation/completion metadata only, not canonical workflow contents before the user accepts an edit.

Actions readiness blocked-state taxonomy is canonical. Candidate GitHub Actions readiness reason details include `actions_no_github_remote`, `actions_auth_required`, `actions_auth_expired`, `actions_missing_scope_runtime`, `actions_missing_scope_admin`, `actions_workflow_not_dispatchable`, `actions_missing_secret`, `actions_missing_variable`, `actions_missing_environment`, `actions_environment_review_required`, `actions_environment_wait_timer`, `actions_branch_rule_mismatch`, `actions_dispatch_input_invalid`, and `actions_workflow_file_invalid`. These hosted readiness details layer onto shared blocked payload metadata; they do not redefine `blocked_reason_code`, and `actions_auth_expired` maps to the shared `failure_class = auth_expired` posture when auth refresh cannot recover. Every blocked state exposes ordered `allowed_action_ids[]`, preserves the active workspace-tab repo/branch or detached HEAD context, and prevents the view from silently aggregating multiple worktrees into one branch stream.

`attention_required` and `blocked` remain distinct presentation and runtime states; resurfacing responds to meaningful state change, not every scheduler tick or unchanged hosted readiness refresh.

Hosted Git governance blockers use policy-specific reasons rather than a generic branch-rule mismatch. Direct push denied by protected branch or `branch-rule`, force-push denied, required PR or merge queue required, required status checks not satisfied, required signed commits or `/tags` not satisfiable by the current flow, and actor bypass not granted each produce distinct blocked reasons. This closes the governance blind-spot for retired or `/renamed` target lifecycle states where stale refs would otherwise look like ordinary branch mismatch. Each receipt records `policy_snapshot_ref`, original target ref/resource, whether a create-branch fallback or PR/hosted-flow handoff was offered, and whether the attempted mutation was left blocked or transformed into a governance-compliant fallback.

Source Control remains worktree-native. It exposes `/compare/lineage/recovery` pivots for each repo or worktree row, including review mode, conflict assistant, blocked-state presentation, and deep links to the Orchestrator lane/run/package context. Rerun, cancel, pin, and workflow-admin controls stay in GitHub Actions unless the Source Control row is only mirroring a deep link to the hosted owner.

The Source Control worktree topology view layers worktree ownership/status over branch lineage rather than duplicating a plain commit graph. It must show which worktree, branch, owner, and run/package context owns or blocks each topology row, while still allowing commit-graph navigation to remain a lower-level lineage tool.

Worktree safety and ownership are visible in Source Control. `Worktrees` rows show ownership badges, admin override policy, prune protection defaults, safe-point awareness, and `cmd.git.worktree.request_prune`, `cmd.git.worktree.release`, and `cmd.git.worktree.recover` actions; `Changes` shows warnings when the active worktree is blocked or owned elsewhere. Receipts and run state carry explicit worktree ownership references, Orchestrator run lifecycle claims/releases worktree ownership, recovery flows preserve lineage to blocked episodes, and restart recovery marks `unknown ownership` rather than silently unlocking a worktree when ownership cannot be resolved.

`strong` Source Control actions that may discard local state, remove artifacts or `/worktrees`, revoke accepted state, or materially change live execution show scope, consequence, and confirmation boundaries before execution.

`Worktrees` rows are first-class Source Control objects, not settings-only utilities. Each row preserves compare/open/recover/prune/lineage actions as `/open/recover/prune/lineage`, displays dirty plus `/conflict/orphaned/stale` state, and keeps recoverable lineage visible even when the row points to a historical or orphaned checkout. `Changes`, `History`, and `Graph` may deep-link into that row state, but Source Control remains the owner for GUI worktree recovery and compare review.

The Source Control Worktrees section uses single-column expandable rows in narrow panes. A compact row shows the theme worktree glyph, branch name, expand chevron, and status plus owner label (`Thread: <thread_title>`, `Orch: <tier_label>`, or `Manual`); expanded rows add Path, Base, Age, and actions for Open Files, Compare, Merge, Remove, Create PR, and Open Thread/Open Lane as applicable. The Worktrees filter bar offers `All | Threads | Orchestrator | Manual`, defaults to `All`, persists `worktree_filter` per project, and does not share that filter across projects. The Source Control accordion uses a two-level scroll model: expanded sections scroll internally under max-height while the outer accordion scrolls when combined sections exceed the panel; below narrow widths, filter controls may degrade to icon-only controls while preserving accessible labels.

Hosted-repo, remote, and workflow lifecycle states are first-class. GitHub Actions records `active`, `renamed_redirected`, `transferred`, `deleted`, `archived`, `remote_mismatch`, and workflow-level `historical_only` without collapsing them into a generic missing state. An archived repo is a canonical hosted-state reason: read-only history `/surfaces` remain available, mutating actions disable deterministically, and blocked-by-archive actions are marked historical/non-resumable (`/non-resumable`); `/recreate` remains disabled unless the repo later unarchives. Workflow receipts retain immutable workflow/run ids plus the last-known workflow path/display name, original hosted ref, and latest resolved ref when available. Deleted workflow definitions surface `historical_only` and never silently bind to a different current workflow with the same filename. Deep links reopen through the latest validated ref when it is safe; otherwise they show the historical target with a relink CTA.

Actions capability disclosure separates hosted-only mutation boundaries from local file editing. The UI can show can view runs but cannot dispatch, can dispatch but cannot manage secrets, and readiness checks are name/scope based and do not verify secret values. These limitations are shown as effective capability state, not as hidden controls.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Orchestrator_Page.md#Source Control boundary, ContractName:Plans/newtools.md, ContractName:Plans/FinalGUISpec.md

### Runtime status and owner cross-references

GitHub Integration is a consumer of runtime status, bridge classification, tool dispatch, FileSafe, and storage startup contracts. It keeps explicit `/cross-ref` anchors to `### HTTP/status to failure-class mapping`, `### 5.1 Universal kill conditions (all strategies)`, `### 5.2 HTE-specific kill conditions`, `### 8.3 Startup and shutdown`, `## 6. Potential problems and solutions`, and the historical `### 15.12 Integration Checklist` so Actions, Source Control, and hosted-repo controls do not invent local status taxonomies.

Hosted Git and GitHub Actions surfaces display canonical runtime outcomes from their owners. Legacy `stop.*` wording is stale or compatibility-only where it conflicts with the canonical `kill.*` family; pre-dispatch denial remains `kill.*`, post-response overrun remains `done.*`, and GitHub UI labels must not collapse those classes into generic failure.

Bridge-side GitHub flows consume provider-facade status mapping rather than redefining it locally: rate-limit and quota statuses preserve the failure-class mapping, bridge-side replay/cancel state keeps required usage-field attribution, and GitHub receipts keep `/path` plus `/status` evidence without discarding usage, account, model, or run identity.

Usage and cost displays mirrored into GitHub run, receipt, or readiness surfaces defer to `Plans/FinalGUISpec.md` for adaptive sub-dollar precision and `/truncation` display rules; GitHub Integration stores the relevant refs and status evidence rather than inventing alternate rounding.

Tool and storage gates apply before hosted mutation. GitHub Actions dispatch, rerun, cancel, secret/variable/environment mutation, and Source Control hosted actions must respect the Tools `/listener` and OAuth/listener failure semantics, FileSafe path checks, storage logical-root selection, startup lock-path, and read-only degraded state when the active store cannot safely open for writes.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

### Consumer propagation

**Route and open integration**:
- GitHub Integration is a consumer of route_target and OpenSubject semantics.
- When a route_target resolves to a GitHub resource (e.g., `github://owner/repo/file.md`), GitHub Integration interprets the path, fetches the resource, and emits it to the active route (local file, artifact storage, etc.).
- When an OpenSubject references a GitHub concern (e.g., `github://owner/repo/issues/123`), GitHub Integration opens the issue and propagates its metadata (title, labels, state) to the orchestrator's concern record for unified help/escalation.
- GitHub `/jump` and search-result routes reuse the stable object identity model already proven by `assistant-chat-design.md`; they carry the object route target through GitHub Integration instead of degrading into text-search, path-only, or page-local jump state.
- `Orchestrator_Page.md` references in GitHub Integration are same-file supersession pointers to the current Orchestrator owner surface, not evidence that an outdated page spec can override the live route, concern, or Source Control consumer contract.
- Graph patch flows use explicit `graph_patch_request` and `graph_patch_result` records: the request carries patch point, triggering `/concern` refs, requested structural change summary, affected generation, and requester identity before GitHub Integration exposes review or apply actions.
- GitHub HITL consumers treat `HITL`, request-centric `tier-boundary`, and older approval wording as compatibility inputs; live GitHub workflow actions project the blocked `/runtime` overlay with canonical blocked episode and allowed-action identity before approval or mutation.

**Approval scope in GitHub workflows**:
- GitHub Integration respects the active execution_unit_context's approval_scope.
- If approval_scope is 'require_approval' and a GitHub PR review is pending, the approval_id is tied to the GitHub PR review ID so resumption can query the PR status.
- GitHub check runs and CI status are tied to execution_unit_id so the orchestrator can correlate CI outcomes with execution units.

**Actions observation freshness**:
- GitHub Integration treats a scheduled workflow with no fresh observation as stale or unknown until GitHub reports a concrete run, skipped outcome, failed outcome, or missed-run signal.
- Absence of a fresh Actions observation MUST NOT by itself mark the workflow `skipped/failed`, and the resulting receipt keeps the shared `wait_state_class?`, `timeout_class?`, and observation timestamps from Plans/Contracts_V0.md.

**Generalized security carry-through**:
- Legacy target `GitHub_Integration.md ### C.3` is represented by this owner section after section compaction. FID-04 generalized security behavior applies to GitHub remote, SSH, Actions, and repository operations: no GitHub consumer flow may bypass FileSafe, permission, credential, redaction, or projection-trust gates merely because the action is initiated from a GitHub surface.
- Reserve `hard_gate` for exceptional concern-affecting operations: admin repair, privacy `/redaction`, cross-run lineage rewrites, and cross-scope lineage rewrites that could materially change audit interpretation.
- Remote path guard for `GitHub_Integration.md ### C.3`: all paths received from remote file-change notifications, dirty-staging writes, file watcher events, or `.gitmodules`/gitmodules parsing are canonicalized and validated with `starts_with(project_root)` or `starts_with(cache_root)` before filesystem use. This applies to all inbound path sources, not just submodule paths, and treats `cache_root`, `project_root`, `file-change`, and `dirty-staging` as security-relevant inputs.
- SSH remote execution and reconnect authority for `GitHub_Integration.md §C` is live in this owner section: GitHub remote operations use the remote SSH subprocess model, keep the 30s keepalive, allow one bounded auto-retry (`one-auto-retry` legacy token), then require explicit `Reconnect` before more remote execution or mutation. LSP and FileManager consumers may display the degraded state, but they do not redefine this reconnect budget.
- Remote-search is transport-only in GitHub Integration: hosted and SSH-backed remote flows consume the storage-owned staging, verification, and re-anchor rules in `Plans/storage-plan.md`, and do not define alternate remote-search layout, dirty-layer clearing, or search-snapshot authority locally.

### C.3 Remote Project Context

Remote Git/non-Git search acceleration is remote-admin/user-visible transport, not a fallback path. GitHub Integration owns remote cache/admin disclosure and consumes the storage-owned `/staging/verification/re-anchor/remote-admin` contract from `Plans/storage-plan.md`; no-silent-local-fallback remains mandatory.

### C.4 Tool & Provider Execution on Remote

Remote tool/provider execution uses the same GitHub remote context, remote SSH/reconnect budget, path guard, and storage verification anchors before mutating or reporting search/cache state.

**Account identity and GitHub permissions**:
- GitHub Integration consumes the runtime identity's GitHub_AuthContext (see Plans/GitHub_API_Auth_and_Flows.md).
- All GitHub API calls include the effective_account_id so the audit trail shows which account performed the operation.
- If a GitHub operation requires a different account context (e.g., cross-org access), GitHub Integration triggers a capability check through the runtime identity resolution flow, not a silent re-auth.

**Provider and model in GitHub context**:
- GitHub Integration may invoke providers (e.g., GitHub Copilot, GPT-4) as part of analysis (code review, test generation, etc.).
- Provider selection follows the scoped settings model in Plans/Models_System.md, with GitHub-specific precedence (e.g., prefer GitHub Copilot for GitHub-hosted code).
- Model selection is tied to the active Persona and execution_unit_type, not to the repository or organization.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Models_System.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

## Owner / Consumer Map

`Plans/GitHub_Integration.md` remains the owner doc for Source Control and GitHub Actions user-facing integration, hosted workflow/admin/runtime surfaces, Source Control worktree UI, GitHub route/open propagation, remote GitHub transport disclosure, and GitHub consumer safety carry-through. Cross-doc consumers must preserve the owner boundaries in the source body and ContractRefs rather than recreating GitHub-local auth, status, storage, FileSafe, model, or command contracts.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### GI-002 - Locked Decisions, SSOT, And Anti-Drift Boundary

```yaml
plan_unit_id: GI-002
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub Integration preserves canonical owner-section requirements, stable account identity, SSOT references, anti-drift compliance, github_api realm separation, no-secret storage, local git and SSH subprocess decisions, and UICommand dispatch boundaries while refusing to redefine contracts owned by GitHub API auth, Contracts, storage, or UI command catalogs.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: locked_decisions_ssot_antidrift_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0006
preserved_exact_tokens:
- github_api
- copilot_github
- seglog/redb/Tantivy
- local `git` binary
- SSH subprocess
- UICommand
- AuthState
- GitHub_API_Auth_and_Flows.md
- ContractRef
negative_constraints:
- This document MUST NOT redefine schemas or contracts owned by SSOT sources.
- github_api and copilot_github tokens and /state are never cross-consumed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GitHub_API_Auth_and_Flows owns auth contracts; Contracts_V0 owns EventRecord/UICommand/AuthState; storage-plan owns storage rules; UI_Command_Catalog owns stable UI command IDs.
owner_hints:
- Plans/GitHub_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2'
```

### GI-003 - Source Control And GitHub Actions Surface Boundary

```yaml
plan_unit_id: GI-003
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: 'GitHub Integration separates Source Control, GitHub Actions, GitHub Copilot, and GitHub API: Source Control owns Git-first repo/worktree GUI behavior, GitHub Actions owns hosted workflow/admin/runtime GUI behavior, GitHub API remains internal plumbing, and legacy Git (GitHub) labels cannot collapse hosted behavior into Source Control.'
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_control_github_actions_surface_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Source Control
- GitHub Actions
- Git (GitHub)
- GitHub Copilot
- GitHub API
- VS Code Source Control
- VS Code extension
negative_constraints:
- Hosted Actions behavior must not collapse back into Source Control.
- GitHub API is internal integration plumbing, not a visible GUI panel.
- Functional parity baselines must not copy visual design.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
split_recommendation_reason: GitHub_Integration-S0008 contains many surface, readiness, workflow, and worktree atoms split across GI-003 through GI-021.
```

### GI-004 - Source Control SCM Views, Accessibility, And Compare Defaults

```yaml
plan_unit_id: GI-004
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Source Control exposes Changes, History, Graph, Worktrees, Branches/Stash, diff preview, staging, commit, sync, stash, branch, incoming/outgoing, conflict, and multi-SCM provider behavior; accordion headers are accessible buttons and compare defaults are deterministic by origin.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_control_scm_views_accessibility_compare_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Changes
- History
- Graph
- Worktrees
- Branches / Stash
- 'accessible-role: button'
- accessible-label
- index <-> working tree
- HEAD <-> index
- empty <-> working tree
- selected commit <-> first parent
- three-way conflict review
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Source Control is the canonical SCM panel contract; git-native flows must not scatter across chat, FileManager, or Progression Gates.
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-005 - Compare-origin Routing And Multi-context Binding

```yaml
plan_unit_id: GI-005
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub compare/open pivots carry closed compare_origin identity, project/repo/worktree/run refs, account scoping, multi-lane context, and active repo/worktree/run binding instead of reconstructing targets from local UI state or flattening multiple contexts into a single branch.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: compare_origin_routing_multi_context_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- compare_origin
- changes.unstaged
- changes.staged
- history.commit_parent
- conflict.review
- worktree.branch_compare
- actions.run_commit_range
- blocked.dirty_worktree
- recovery.safe_point_retry
- project_id
- repo_id
- worktree_id
- selected_repo_id
negative_constraints:
- If an origin cannot be revalidated, the UI opens degraded historical mode or blocks mutation rather than silently substituting the current branch.
- The multi-context Source Control model never assumes a single repo context.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-006 - Requested Effective Identity Display And Audit Snapshot

```yaml
plan_unit_id: GI-006
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub auth, admin, readiness, history, Source Control, Actions subviews, run history, compare/review, and recovery surfaces disclose requested and effective execution identity by consuming runtime identity fields and storing only resource, capability, readiness, and route/open refs needed for the same audit snapshot.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: requested_effective_identity_display_audit_snapshot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Requested account
- Requested binding
- Effective account
- Switch reason
- execution role
- effective/provider/account
- record
- stable account identity
- degraded capability state
negative_constraints:
- GitHub Integration does not redefine runtime identity fields locally.
- Non-runtime /integration and /page/artifact surfaces must not invent local display-only account fields.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Consumes GitHub_API_Auth_and_Flows identity/degraded-capability contracts and Contracts_V0 runtime identity fields.
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-007 - Focus Preservation And Safe-point Retry Confirmation

```yaml
plan_unit_id: GI-007
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Search routing preserves focused_run_id, safe-point retry opens an explicit restore/retry confirmation with repo, worktree, branch, baseline/head, safe_point_id, affected files, owner run/node/attempt, and follow-up action, and run-aware compare-origin forwarding preserves identity and refs into review/conflict/safe-point contexts.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: focus_preservation_safe_point_retry_confirmation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- focused_run_id
- recovery.safe_point_retry
- safe_point_id
- restore_safe_point_then_retry
- safe_point.created
- safe_point.restored
- compare_origin
- Dedicated review mode
- guided conflict assistant
negative_constraints:
- Search result routing must never switch focused run context silently.
- Declining safe-point retry leaves the blocked episode unchanged.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FileSafe remains the mutation guard owner; Contracts_V0 owns safe_point.created, safe_point.restored, and restore outcome events.
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-008 - GitHub Actions IA And Settings ConfigKey Boundary

```yaml
plan_unit_id: GI-008
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub Actions has Current Branch, Workflows, and Settings as stable subviews, routes compatibility entrypoints to the correct owner surface, and owns only GitHub-specific Settings, readiness, workflow, admin, and source-control ConfigKey schema details while importing shared storage rules.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: github_actions_ia_settings_configkey_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Current Branch
- Workflows
- Settings
- /Workflows/Settings
- /local-repo
- Git (GitHub)
- ConfigKey
- secrets
- variables
- /environments
- runner labels
negative_constraints:
- ConfigKey entries here must not duplicate Contracts event names, Permissions policy schema, usage rollup logic, or FileSafe safe-point behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GitHub Actions > Current Branch owns branch-context readiness and run controls; Workflows owns inventory/run detail; Settings owns hosted admin state.
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-009 - Pinned Critical Workflows And Health Badge Provenance

```yaml
plan_unit_id: GI-009
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Pinned critical workflows are owned by GitHub Actions > Workflows, use canonical pin/unpin commands and compatibility aliases, store workflow/repo/branch/worktree/badge/preference/provenance records, and expose stale or renamed workflow state without hiding historical receipts.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: pinned_critical_workflows_health_badge_provenance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Pinned critical workflows
- Critical workflow pinning / health badges
- cmd.github.actions.pin
- cmd.github.actions.unpin
- cmd.actions.pin
- /event/storage
- /build/deploy
- /deploy
- /renamed
- notify-on-failure
negative_constraints:
- Pinned workflow health badges must expose stale or /renamed workflow state and let the user unpin without hiding historical receipts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-010 - Replay Last Known Good And Compare Last Success

```yaml
plan_unit_id: GI-010
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Replay from last known good belongs to GitHub Actions failure triage/history, compares failed runs against same-workflow same-branch successes, records baseline and comparison metadata, exposes compare options, and never implies rerun tests latest branch head unless a new dispatch occurs.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: replay_last_known_good_compare_last_success
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Replay from last known good
- known-good run id
- cached comparison target id
- comparison window length
- run-history
- cmd.github.actions.compare_last_success
- same-branch history
- manual compare selection
negative_constraints:
- GitHub reruns use original commit/ref semantics; replay UI must not imply a rerun tests latest branch head unless a new dispatch occurs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-011 - Current Branch Readiness And Live-admin Precedence

```yaml
plan_unit_id: GI-011
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Current Branch shows active branch/worktree binding, background run status, Actions readiness, admin/runtime scopes, rate-limit/repo linkage, capability, environment-gated wait/blocked states, and recovery CTAs while live GitHub Actions Settings remains source of truth for hosted admin state.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: current_branch_readiness_live_admin_precedence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Current Branch
- /branches/background
- /rate-limit/repo
- live-admin
- Settings > Advanced > CI / GitHub Actions
- environment-gated readiness
- wait/blocked states
- durable audit receipts
negative_constraints:
- Workflow generation/template defaults do not override live-admin state.
- Actions-specific recovery CTAs route to the owning subview rather than duplicating admin controls elsewhere.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-012 - Actions Readiness Refresh And Dispatch Capability Disclosure

```yaml
plan_unit_id: GI-012
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Actions readiness is event-driven plus bounded refresh on project, branch/worktree, workflow-file, panel, dispatch-form, and admin CRUD events; stale readiness cannot authorize mutation, dispatchability is validated without persisting secrets, and capability disclosure shows scope/value limits honestly.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: actions_readiness_refresh_dispatch_capability_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- workflow-file save
- dispatch-form
- event-driven plus bounded refresh
- cmd.github.actions.validate_dispatch_readiness
- hidden-value
- read-only inventory
- browser handoff
- /scope-based
- Local-to-remote workflow loop
- /dispatch
negative_constraints:
- Readiness is not timer-only and not manual-only.
- Stale readiness snapshots cannot authorize rerun, dispatch, or dependent Orchestrator steps.
- Secret values are not stored or value-inspected after creation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-013 - Actions To Code Correlation Bridge

```yaml
plan_unit_id: GI-013
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Actions-to-code correlation links runs, jobs, steps, failed checks, command pivots, commit ranges, changed files, branch/worktree refs, and related diffs/worktrees as a remediation bridge while labeling heuristic uncertainty and preserving candidate choices.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: actions_to_code_correlation_bridge
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- to-code
- cmd.github.actions.open_run
- cmd.github.actions.open_job
- cmd.github.actions.open_step_logs
- cmd.github.actions.open_related_diff
- cmd.github.actions.open_related_worktree
- /open_related_worktree
- /failing
- heuristic matches
negative_constraints:
- Actions-to-code correlation is a remediation bridge, not canonical proof by log parsing.
- If exact file correlation is unavailable, show uncertainty; if multiple candidates exist, show candidates rather than auto-opening one.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-014 - Run Impact Mapping Evidence Boundary

```yaml
plan_unit_id: GI-014
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Run impact mapping belongs to GitHub Actions run detail and Orchestrator receipts, shows branch/commit/PR, worktree, deploy chain, publish, and readiness implications, and marks incomplete evidence as partial rather than complete truth.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: run_impact_mapping_evidence_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Run impact mapping
- /branch/commit/PR
- deploy chain
- Secrets / variables / environments readiness
- partial impact map
- derived-artifacts toggle
- /download
- retention boundary
negative_constraints:
- Related objects may auto-pin only as view state, never as an auto-write to repository or workflow state.
- Heuristic linkage must not be presented as complete truth.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-015 - Failure Triage Log Access And Repro Budget

```yaml
plan_unit_id: GI-015
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Failure triage view compresses failed runs into failing job/step, logs, changed files, likely next action, metadata, log access/fallback state, tiered fetching, and stored refs while GitHub Actions repro loops follow Debug investigation budget reset rules.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: failure_triage_log_access_repro_budget
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Failure triage view
- step-log
- fail-step
- log-download
- /collapsed
- auto-expand
- /open-in-browser
- /tiers
- repro_attempts_per_strategy_tier
- wall-clock
- no-new-evidence
negative_constraints:
- Log excerpts are not canonical product state.
- A strategy-tier change resets repro_attempts_per_strategy_tier only and does not reset wall-clock or no-new-evidence budgets.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-016 - Workflow Authoring Assistance Metadata Boundary

```yaml
plan_unit_id: GI-016
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Workflow authoring assistance is a GitHub Actions Settings/workflow-editor capability with language-service validation, completion, docs, remote-repo disclosure, proxy mediation, generation links, and preview/apply behavior that stores metadata only before accepted edits.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: workflow_authoring_assistance_metadata_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- Workflow authoring assistance
- language-service
- remote-repo
- /proxy
- /generation
- preview /apply
- validation/completion metadata
negative_constraints:
- Workflow authoring assistance is not a generic YAML textarea.
- Event storage must store validation/completion metadata only, not canonical workflow contents before the user accepts an edit.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-017 - Actions Blocked-state Taxonomy And Attention Semantics

```yaml
plan_unit_id: GI-017
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Actions readiness blocked-state taxonomy uses canonical actions_* reason details layered onto shared blocked metadata, maps auth expiration to shared failure class, exposes ordered allowed actions and active repo/branch context, and keeps attention_required distinct from blocked.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: actions_blocked_state_taxonomy_attention_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- actions_no_github_remote
- actions_auth_required
- actions_auth_expired
- actions_missing_scope_runtime
- actions_missing_scope_admin
- actions_workflow_not_dispatchable
- actions_missing_secret
- actions_missing_variable
- actions_missing_environment
- actions_environment_review_required
- actions_environment_wait_timer
- actions_branch_rule_mismatch
- actions_dispatch_input_invalid
- actions_workflow_file_invalid
- allowed_action_ids[]
- attention_required
- blocked
negative_constraints:
- Hosted readiness details do not redefine blocked_reason_code.
- The view must not silently aggregate multiple worktrees into one branch stream.
- Resurfacing responds to meaningful state change, not every scheduler tick.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-018 - Hosted Git Governance Blockers And Policy Receipts

```yaml
plan_unit_id: GI-018
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Hosted Git governance blockers use policy-specific reasons and receipts for protected branch, force-push, required PR/merge queue/status/signed commit/tag, actor bypass, lifecycle, fallback, and mutation outcome instead of generic branch-rule mismatch.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: hosted_git_governance_blockers_policy_receipts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- branch-rule
- force-push
- merge queue
- required status checks
- signed commits
- /tags
- actor bypass
- policy_snapshot_ref
- create-branch fallback
- PR/hosted-flow handoff
negative_constraints:
- Hosted Git governance blockers use policy-specific reasons rather than a generic branch-rule mismatch.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-019 - Source Control Worktree Topology Ownership And Safety

```yaml
plan_unit_id: GI-019
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Source Control remains worktree-native with compare/lineage/recovery pivots, topology ownership over branch lineage, ownership badges, worktree safety warnings, run lifecycle claims/releases, restart recovery unknown ownership, and strong-action confirmations.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_control_worktree_topology_ownership_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- /compare/lineage/recovery
- Worktree topology view
- ownership badges
- admin override policy
- prune protection defaults
- safe-point awareness
- cmd.git.worktree.request_prune
- cmd.git.worktree.release
- cmd.git.worktree.recover
- unknown ownership
- strong
negative_constraints:
- Rerun, cancel, pin, and workflow-admin controls stay in GitHub Actions unless Source Control is mirroring a deep link.
- Strong Source Control actions show scope, consequence, and confirmation boundaries before execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-020 - Worktrees Responsive Row Layout And Project Filter

```yaml
plan_unit_id: GI-020
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Worktrees rows are first-class Source Control objects with narrow-pane single-column expandable rows, row labels, actions, per-project All/Threads/Orchestrator/Manual filter persistence, and two-level accordion scroll behavior.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: worktrees_responsive_row_layout_project_filter
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- single-column expandable rows
- theme worktree glyph
- 'Thread: <thread_title>'
- 'Orch: <tier_label>'
- Manual
- All | Threads | Orchestrator | Manual
- worktree_filter
- two-level scroll model
- icon-only controls
negative_constraints:
- Worktrees rows are first-class Source Control objects, not settings-only utilities.
- worktree_filter persists per project and does not share across projects.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-021 - Hosted Repo Workflow Lifecycle States And Capability Limits

```yaml
plan_unit_id: GI-021
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Hosted-repo, remote, and workflow lifecycle states are first-class, archived/deleted/historical-only states disable mutation deterministically, receipts retain immutable identifiers and refs, deep links reopen only through safe validated refs, and capability disclosure separates hosted-only mutation boundaries from local editing.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: hosted_repo_workflow_lifecycle_states_capability_limits
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0008
preserved_exact_tokens:
- active
- renamed_redirected
- transferred
- deleted
- archived
- remote_mismatch
- historical_only
- /non-resumable
- /recreate
- can view runs but cannot dispatch
- can dispatch but cannot manage secrets
negative_constraints:
- Deleted workflow definitions never silently bind to a different current workflow with the same filename.
- Capability limitations are shown as effective capability state, not hidden controls.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-022 - Runtime Outcome Taxonomy And Bridge Status Cross-refs

```yaml
plan_unit_id: GI-022
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub Integration consumes runtime status, bridge classification, tool dispatch, FileSafe, and storage startup contracts via explicit cross-ref anchors, displays canonical runtime outcomes, and treats legacy stop.* wording only as stale or compatibility input when it conflicts with kill.* and done.* families.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: runtime_outcome_taxonomy_bridge_status_crossrefs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0009
preserved_exact_tokens:
- HTTP/status to failure-class mapping
- Universal kill conditions
- HTE-specific kill conditions
- Startup and shutdown
- Potential problems and solutions
- Integration Checklist
- kill.*
- done.*
- stop.*
negative_constraints:
- Actions, Source Control, and hosted-repo controls must not invent local status taxonomies.
- GitHub UI labels must not collapse kill/done classes into generic failure.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
```

### GI-023 - Hosted Mutation Gates And Usage Cost Display Deferral

```yaml
plan_unit_id: GI-023
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Hosted mutation dispatch, rerun, cancel, admin mutation, and Source Control hosted actions respect Tools listener, OAuth/listener failure semantics, FileSafe path checks, storage logical roots/startup locks/read-only degradation, and usage/cost display rules owned by FinalGUISpec.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: hosted_mutation_gates_usage_cost_display_deferral
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0009
preserved_exact_tokens:
- Tools /listener
- OAuth/listener failure semantics
- FileSafe path checks
- storage logical-root selection
- startup lock-path
- read-only degraded state
- adaptive sub-dollar precision
- /truncation
negative_constraints:
- Hosted mutation must respect tool, file-safety, storage, and degraded-state gates before execution.
- GitHub Integration must not invent alternate usage rounding.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
```

### GI-024 - GitHub Route Open Resource Propagation And Object Jump Identity

```yaml
plan_unit_id: GI-024
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub Integration consumes route_target and OpenSubject semantics, resolves github:// resources and concerns into active routes and orchestrator concern records, preserves stable object identity for /jump/search-result routes, and treats Orchestrator references as supersession pointers rather than override evidence.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: github_route_open_resource_propagation_object_jump_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0010
preserved_exact_tokens:
- route_target
- OpenSubject
- github://owner/repo/file.md
- github://owner/repo/issues/123
- /jump
- stable object identity
- Orchestrator_Page.md
- same-file supersession pointers
negative_constraints:
- GitHub /jump and search-result routes must not degrade into text-search, path-only, or page-local jump state.
- Outdated page specs cannot override live route, concern, or Source Control consumer contracts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-025 - Graph Patch Review Records And Apply Exposure

```yaml
plan_unit_id: GI-025
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Graph patch flows use explicit graph_patch_request and graph_patch_result records carrying patch point, concern refs, structural change summary, affected generation, and requester identity before GitHub Integration exposes review or apply actions.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: graph_patch_review_records_apply_exposure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0010
preserved_exact_tokens:
- graph_patch_request
- graph_patch_result
- patch point
- triggering /concern refs
- requested structural change summary
- affected generation
- requester identity
- review or apply actions
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-026 - Approval HITL Compatibility And Actions Observation Freshness

```yaml
plan_unit_id: GI-026
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub workflow approval and observation consumers preserve approval_scope, approval_id, PR review ID, execution_unit_id, compatibility HITL/tier-boundary inputs, blocked runtime overlays, and wait/timeout timestamps while scheduled workflows remain stale or unknown until concrete hosted observation exists.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: approval_hitl_compatibility_actions_observation_freshness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0010
preserved_exact_tokens:
- approval_scope
- require_approval
- approval_id
- GitHub PR review ID
- execution_unit_id
- HITL
- tier-boundary
- blocked /runtime overlay
- wait_state_class?
- timeout_class?
- stale or unknown
negative_constraints:
- Absence of a fresh Actions observation MUST NOT by itself mark the workflow skipped/failed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-027 - Security Carry-through Path Guard SSH Reconnect And Remote Search Authority

```yaml
plan_unit_id: GI-027
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub remote, SSH, Actions, and repository operations carry FileSafe, permission, credential, redaction, projection-trust, hard_gate, remote path guard, SSH keepalive/reconnect, and storage-owned remote-search authority instead of bypassing gates or defining alternate remote search behavior locally.
gui_related: false
gui_classification_reason: This unit defines runtime, security, ownership, identity, or transport behavior, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: security_carrythrough_path_guard_ssh_reconnect_remote_search_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0010
preserved_exact_tokens:
- FID-04
- hard_gate
- starts_with(project_root)
- starts_with(cache_root)
- cache_root
- project_root
- file-change
- dirty-staging
- 30s keepalive
- one-auto-retry
- Reconnect
- remote-search
- staging, verification, and re-anchor
negative_constraints:
- No GitHub consumer flow may bypass FileSafe, permission, credential, redaction, or projection-trust gates merely because the action is initiated from a GitHub surface.
- Remote-search is transport-only in GitHub Integration and must not define alternate remote-search layout, dirty-layer clearing, or search-snapshot authority locally.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-028 - Remote Project Search Acceleration Disclosure

```yaml
plan_unit_id: GI-028
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Remote Git/non-Git search acceleration is remote-admin/user-visible transport; GitHub Integration owns remote cache/admin disclosure, consumes storage-owned staging/verification/re-anchor/remote-admin contracts, and keeps no-silent-local-fallback mandatory.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, GitHub Actions, readiness, workflow, routing, or remote-disclosure behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: remote_project_search_acceleration_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0011
preserved_exact_tokens:
- /staging/verification/re-anchor/remote-admin
- remote cache/admin disclosure
- no-silent-local-fallback
- remote Git/non-Git search acceleration
negative_constraints:
- Remote search acceleration is not a fallback path.
- no-silent-local-fallback remains mandatory.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
```

### GI-029 - Remote Tool Execution Context And Verification Anchors

```yaml
plan_unit_id: GI-029
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Remote tool/provider execution uses GitHub remote context, remote SSH/reconnect budget, path guard, and storage verification anchors before mutating or reporting search/cache state.
gui_related: false
gui_classification_reason: This unit defines runtime, security, ownership, identity, or transport behavior, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: remote_tool_execution_context_verification_anchors
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0012
preserved_exact_tokens:
- remote tool/provider execution
- remote SSH/reconnect budget
- path guard
- storage verification anchors
- search/cache state
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Models_System.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### GI-030 - Effective GitHub Account Capability Check And Provider Selection

```yaml
plan_unit_id: GI-030
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: GitHub Integration consumes GitHub_AuthContext, includes effective_account_id in API calls, uses runtime identity resolution for cross-account capability checks, and follows scoped provider/model settings tied to Persona and execution_unit_type rather than repository or organization.
gui_related: false
gui_classification_reason: This unit defines runtime, security, ownership, identity, or transport behavior, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad GI-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_integration_drift
reasoning_tier: standard
context_scope: github_integration_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: effective_github_account_capability_provider_selection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0012
preserved_exact_tokens:
- GitHub_AuthContext
- effective_account_id
- capability check
- runtime identity resolution flow
- GitHub Copilot
- GPT-4
- Plans/Models_System.md
- Persona
- execution_unit_type
negative_constraints:
- Cross-org access must trigger runtime identity capability checks, not silent re-auth.
- Model selection is tied to active Persona and execution_unit_type, not repository or organization.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/GitHub_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Models_System.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### GI-001 - GitHub Integration Source-Preserving Bridge Retired

```yaml
plan_unit_id: GI-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: The former GitHub_Integration doc-level source-preserving bridge is retired after Phase 2B atomized GitHub_Integration-S0002, S0004, S0006, and S0008 through S0012 into GI-002 through GI-030 and structurally dispositioned S0001, S0003, S0005, S0007, S0013, S0014, and S0016. GI-001 remains only as migration lineage for GitHub_Integration-S0015 and must not re-own atomized source coverage or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained GitHub Integration PlanUnits GI-002 through GI-030.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- GI-001 no longer uses source_preserving_planunit compile mode.
- GI-002 through GI-030 own product coverage for atomized GitHub Integration spans.
- Structural spans are explicit coverage dispositions, not product coverage owned by GI-001.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GitHub_Integration-S0015
preserved_exact_tokens:
- GI-001
- source_preserving_planunit
- source_preserving_bridge_retired
- GitHub_Integration-S0001
- GitHub_Integration-S0016
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- GI-001 must not re-own atomized GitHub_Integration product coverage.
- GI-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- GI-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The broad GitHub Integration source-preserving bridge was retired in Phase 2B batch 077.
owner_boundary_notes:
- GI-002 through GI-030 own atomized GitHub Integration product coverage.
- GitHub_Integration-S0015 maps only to retired bridge lineage.
owner_hints:
- Plans/GitHub_Integration.md
```

## Migration Coverage

Original hash: `3fd236bf9f6ce0c2780dc77e155b225db95206c07d8e83b7baa89d8fc939f8a3`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 077 atomized `GitHub_Integration-S0002`, `GitHub_Integration-S0004`, `GitHub_Integration-S0006`, and `GitHub_Integration-S0008` through `GitHub_Integration-S0012` into `GI-002` through `GI-030`, repeating dense source lineage where the original source span contains multiple safe atoms. `GitHub_Integration-S0001`, `GitHub_Integration-S0003`, `GitHub_Integration-S0005`, `GitHub_Integration-S0007`, `GitHub_Integration-S0013`, `GitHub_Integration-S0014`, and `GitHub_Integration-S0016` are structural or migration-history dispositions. `GitHub_Integration-S0015` maps to retired bridge lineage `GI-001`; `GI-001` no longer uses source-preserving compile mode, and `Plans/GitHub_Integration.md` has no remaining source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### GI-031 - Optional GitHub Promotion For Plans-To-Code Execution

```yaml
plan_unit_id: GI-031
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  GitHub integration is an optional promotion/output layer for plans-to-code execution. When configured, it handles auth, remote state, push, pull request creation, PR status, and GitHub Actions checks after local Executor/source-control receipts establish local truth. Local source-control/worktree state remains execution truth and local-only project completion must not require GitHub. GitHub receipts consume repo_id, branch/head state, baseline/head commits, changed files, PR refs, Action/check refs, conflicts, merge/promotion result, and rollback context from Executor and WorktreeGitImprovement.
  GitHub optional promotion records PR and GitHub Actions evidence only when configured.
gui_related: true
gui_classification_reason: PR, status, checks, and promotion results are user-visible GitHub/source-control surfaces.
depends_on: [GI-030, W-072, EP-100]
unblocks: [EP-103, RAP-029, POA-048]
acceptance_criteria:
  - Local source-control truth is established before GitHub promotion output.
  - GitHub is not required for local-only completion.
  - PR and GitHub Actions status are recorded only when configured and authenticated.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future GitHub promotion receipt validation
risk_class: github_required_for_local_completion
reasoning_tier: standard
context_scope: plans_to_code_github_promotion
implementation_surfaces: [Plans/GitHub_Integration.md, Plans/GitHub_API_Auth_and_Flows.md, Plans/Executor_Protocol.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: github_optional_promotion, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0038
  - pldg-20260617-001-plans-to-code-handoff:atom-0039
  - pldg-20260617-001-plans-to-code-handoff:dec-0015
preserved_exact_tokens:
  - "GitHub optional"
  - "PR"
  - "GitHub Actions"
  - "local source-control truth"
  - "merge_or_promotion_receipt"
negative_constraints:
  - Do not require GitHub for local-only project completion.
owner_hints:
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/Executor_Protocol.md
```

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### GI-032 - Optional GitHub, Repository Attachment, And Contribution PR Context

```yaml
plan_unit_id: GI-032
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: 'Project context supports greenfield, existing local project, existing Git repository, remote SSH project, and fork or external upstream contexts, with explicit repository and host facts. Planning intake can attach an existing local directory, Git repository, optional GitHub repository, or remote SSH host and project root, recording host, path, repository identity, currentness, and permissions. GitHub is optional for repository creation, fork, push, and PR workflows; local or remote Git and FileSafe remain valid without GitHub credentials, and repository/worktree state is execution truth. Clone, fork, repository creation, git init, remote changes, branch checkout or creation, worktree creation, commit, push, PR creation, stash, discard, reset, and protected-branch operations require the applicable permission policy and durable receipts. For greenfield work, Planning Wizard can create a directory, initialize Git, select
  an initial branch, create an empty or baseline initialization commit, and optionally connect or create a GitHub repository when explicitly authorized. Contribution PR mode records upstream and fork identities, base and head branches, contribution policy, compatibility expectations, required checks, commit policy, and optional PR delivery without conflating those with implementation truth.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/GitHub_Integration.md
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/GitHub_API_Auth_and_Flows.md
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0044
- pldg-20260618-001-prd-planning-wizard:atom-0068
- pldg-20260618-001-prd-planning-wizard:atom-0069
- pldg-20260618-001-prd-planning-wizard:atom-0070
- pldg-20260618-001-prd-planning-wizard:atom-0072
- pldg-20260618-001-prd-planning-wizard:atom-0076
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
source_atom_ids:
- atom-0044
- atom-0068
- atom-0069
- atom-0070
- atom-0072
- atom-0076
decision_refs:
- dec-0015
- dec-0014
correction_refs: []
preserved_exact_tokens:
- greenfield
- existing local project
- existing Git repository
- remote SSH
- fork or external upstream
- local path
- Git repository
- GitHub
- SSH
- GitHub optional
- execution truth
- authority
- receipt
- git init
- push
- PR creation
- baseline initialization commit
- upstream
- fork
- base branch
- head branch
- PR
negative_constraints:
- Do not block local-only planning or build completion solely because GitHub is unavailable.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/GitHub_Integration.md
- Plans/Permissions_System.md
- Plans/GitHub_API_Auth_and_Flows.md
- Plans/WorktreeGitImprovement.md
```

## Ledger Compile Addendum - pldg-20260622-001-fff

### GI-033 - Remote Git Cache Discovery Transport And Disclosure

```yaml
plan_unit_id: GI-033
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  GitHub Integration is a supporting consumer for remote Git/non-Git cache transport, disclosure, reconnect, staging/re-anchor, verification path, and no-silent-local-fallback alignment used by DiscoveryService. It consumes storage, worktree, FileSafe, and permission contracts for remote cache/admin disclosure and must not define an alternate discovery/search layout, alternate ranking policy, or product behavior owner for native discovery.
gui_related: true
gui_classification_reason: Remote/cache disclosure, reconnect, and admin states are user-visible integration surfaces.
depends_on: [GI-027, GI-028, GI-029, GI-032, SP-218, W-074, F2-191, PS-118]
unblocks: [ATS-011]
acceptance_criteria:
  - Remote Git/cache discovery disclosures align with storage/worktree/FileSafe/permission owner contracts.
  - GitHub Integration does not become the discovery behavior, search, or ranking owner.
  - No local substitution is presented as remote truth.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future remote cache disclosure tests.
  - Future no-local-substitution integration checks.
risk_class: remote_cache_consumer_drift
reasoning_tier: standard
context_scope: github_remote_discovery_consumer
implementation_surfaces: [Plans/GitHub_Integration.md, future remote Git cache adapter]
node_compile_hint: {mode: supporting_remote_cache_consumer, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0054
  - pldg-20260622-001-fff:atom-0061
  - pldg-20260622-001-fff:atom-0069
  - pldg-20260622-001-fff:atom-0079
  - pldg-20260622-001-fff:atom-0085
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:state/subagent_compile_proposals.json#Copernicus
source_atom_ids: [atom-0054, atom-0061, atom-0069, atom-0079, atom-0085, atom-0091]
preserved_exact_tokens: ["remote Git", "remote_cache", "SSH/reconnect", "verification paths", "staging/re-anchor", "no-silent-local-fallback", "alternate discovery/search layout"]
negative_constraints:
  - Do not define alternate discovery/search layout or ranking behavior in GitHub Integration.
  - Do not block local-only planning or build completion solely because GitHub is unavailable.
owner_hints: [Plans/GitHub_Integration.md, Plans/storage-plan.md, Plans/WorktreeGitImprovement.md, Plans/FileSafe.md, Plans/Permissions_System.md]
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### GI-034 - github_update_workflow

```yaml
plan_unit_id: GI-034
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: >-
  github_update_workflow (P1) is compiled as canonical Puppet Master intent for github_update_workflow: Add GitHubUpdateCurrentness and ReleaseTagVerifier The preserved PM gap/delta is: Need rate-limit-safe updater and release/action tag currentness guard The observed external-repo signal remains source-lineage evidence: OpenCode upgrade GitHub API 403 and stale github@latest action issues
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Unauthenticated/authenticated API fallback tests
- stale tag detection
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Unauthenticated/authenticated API fallback tests
- stale tag detection
risk_class: p1_security_release_supply_chain_hardening
reasoning_tier: standard
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/GitHub_Integration.md
- Plans/BinaryLocator_Spec.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: github_update_workflow
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0115
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0115
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0111/github_update_workflow@line=13
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0111/github_update_workflow
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:13
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0115
external_atom_id: extrepo-20260703-0111
source_row_id: github_update_workflow
priority: P1
finding_family: github_update_workflow
target_docs:
- Plans/GitHub_Integration.md
- Plans/BinaryLocator_Spec.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/GitHub_Integration.md
- Plans/BinaryLocator_Spec.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0111
- github_update_workflow
- P1
negative_constraints: []
observed_signal: OpenCode upgrade GitHub API 403 and stale github@latest action issues
pm_current_coverage: Broad GitHub/Auth/Setup surfaces exist
pm_gap_or_delta: Need rate-limit-safe updater and release/action tag currentness guard
proposal_or_recommendation: Add GitHubUpdateCurrentness and ReleaseTagVerifier
compile_disposition: create_new_planunit
```
