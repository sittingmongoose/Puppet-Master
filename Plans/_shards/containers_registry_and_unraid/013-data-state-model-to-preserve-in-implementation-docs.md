# Shard 013: Data/state model to preserve in implementation docs

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L883-L933

Source SHA256: `fdbce2e83dc53773be18beff37e23dcc26b1e0ec557067d1ae39b9b20e162d2b`

---

## Data/state model to preserve in implementation docs


### Canonical scope split and blocked-outcome state

To keep GUI, orchestrator, storage, and post-publish behavior aligned, the following scope rules are normative:

- `Hide Docker Manager when not used in Project.` is a **global** setting; the older `Hide Docker Manage when not used in Project.` key is a migration alias only.
- Docker Manager navigation/dock/panel state is **project-scoped**.
- For project-centric surfaces, widget layouts are project-scoped with a limited global fallback only when no project is open.
- Shared `ca_profile` source state is **global** unless the project explicitly enables per-project override.
- Template-repo configuration and TemplateRepoStatus are **project-scoped**.
- Effective-auth snapshots are advisory cached state only until revalidation.
- Blocked remote side effects are first-class state transitions and MUST remain distinguishable from runtime failures in UI state, event state, and persisted results.

Implementation-facing docs should preserve the following state concepts so GUI, orchestration, and persistence agree on one model:
- Docker project detection state
- `Hide Docker Manager when not used in Project.` setting, with the legacy `Hide Docker Manage when not used in Project.` alias migrated on read
- requested auth mode
- effective auth capability set
- validated DockerHub account identity
- selected namespace and repository
- selected repository privacy for first-time creation
- push policy
- image/tag template defaults
- auto-generate Unraid XML toggle
- managed template-repo enabled toggle
- template-repo location / remote / branch state
- auto-push toggle
- template-repo dirty/committed/pushed status
- shared vs per-project `ca_profile.xml` scope
- uploaded image asset mode vs external URL mode

### Orchestrator-linked state vocabulary and help semantics

Docker Manager is a consumer of shared orchestrator/runtime vocabulary, not a separate owner for those terms. `Glossary.md`, `Crosswalk.md`, `Decision_Policy.md`, `00-plans-index.md`, and `plans-index` retain first-class ownership for definitions and routing boundaries such as Feature Seam, Work Package, package/seam overseers, promotion class, lane pool, contamination, safe point, restore point, rollback, and effective execution identity. Docker Manager copy and state preserve the boundary between execution truth, projections, and `/page` or widget/page UI-only overlays.

For orchestrator-linked rows, badges, receipts, disabled controls, and GUI help-entry text:
- `hard_gate` / HITL `/blocked` `remote-side-effect` actions use the canonical approval/blocked flow and cannot be bypassed by generic UI confirmation; Docker Manager may render the blocker, but must not downgrade it into local confirmation copy.
- `action-specific` confirmation rules remain distinct from HITL approval: create repository, push, rollback, cleanup, delete, and cluster mutation flows keep their own reversibility and confirmation evidence while non-bypassable `hard_gate` actions still use allowed action IDs rather than generic modals.
- The requested vs effective execution identity remains runtime-facing and auditable. Runtime facts and visible state preserve `requested`, `effective`, `selection_reason`, `/clamped`, `/switch`, `/switching`, `/auth/account`, `/persona/runtime`, `/provider/model`, `/model/variant/auth/account`, requested Persona, effective Persona, requested platform/model/variant/auth/account policy, effective platform/model/variant/auth/account, provider/auth/account selection flow, selection/switch reason, skipped vs honored/clamped Persona controls, and skipped/clamped controls. `requested_account_policy` is not a substitute for a user-selected `requested_account_id`; concrete account selection and fallback remain visible to provider, chat-thread, `/chat/SCM`, and SCM consumers.
- Runtime/projection events are classified as runtime-internal, operator-visible, or chat-thread resolution events. The multi-project, multi-account, and multi-worktree orchestration model scopes identity, `/projection/storage`, `/seam/package/node`, account selection, and account fallback by project, package, seam, node, account, and worktree instead of collapsing them into a single current context.
- Stale `tier_id` usage is migration-only compatibility state, not a coordination-state key for Docker Manager. Package, seam, lane, node, attempt, receipt, worktree, and runtime asset references remain the owner keys for new navigation and audit joins.
- `cmd.panel.switch` is shell-state only: it may choose Docker Manager as the panel/shell occupant, but object-bearing targeting must route through the shared route/open target contract instead of extending the panel-switch args shape. A `route-activation` request must not reuse destination-local state when doing so would obscure the requested target in `/GUI`.
- PM-owned SCM state is cross-surface state. Managed template repositories, active git operations, live-run artifact roots, and worktree recovery state register with Orchestrator, Source Control, `/Source`, and Docker Manager rather than remaining hidden in one surface; `Orchestrator_Page`, `Orchestrator_Page.md`, `/recovery`, `/worktree`, cross-surface lineage, `allowed_action_ids`, and `allowed_action_ids[]` stay visible where recovery and destination panels consume them.
- Requested/effective display groups use the exact labels `Requested`, `Effective`, `Reason`, `Support`, `Inherited from`, and `Overridden by` when Docker Manager explains inherited policy, project policy, user override, account fallback, or capability degradation.
- Help text must not flatten Feature Seam, Work Package, Weak Integration, Corroboration, Promotion, Graph Patch, Concern lifecycle, Lane vs Worktree, requested vs effective, safe point vs restore point, historical vs superseded vs revoked, or History vs Ledger into a one-line tooltip. Simple/Expert/ELI5, `/Expert/ELI5`, and `/tooltip` variants use stable canonical terminology, distinguish object vs state vs action, and explain why the state exists from canonical reason codes and evidence rather than panel-local prose.
- Dedicated help-entry candidates include Feature Seam, Work Package, Package Overseer, Seam Overseer, Weak Integration, Promotion, Corroboration, Concern, Graph Patch, Graph Generation, Lane, requested vs effective, History vs Ledger, and historical vs superseded vs revoked vs reopened.
- Contextual help is limited to local button affordances, simple counts or `/badges`, one-surface-only controls whose meaning is obvious from context, and provider-specific caveats shown near the relevant controls; it must not replace the canonical state vocabulary above.
- Runtime recovery copy keeps `safe-point`, `restore-point`, rollback, and contamination distinct across `/storage/UI`; a safe point is an execution recovery anchor, a restore point is user-facing saved-state/recovery vocabulary only where the owning UI/storage contract declares it, rollback is the explicit mutation outcome, and contamination is a governance/storage condition that affects reuse, retry, and promotion eligibility.
- Blocked payload normalization treats legacy `reason_code` and `recovery_options[]` as compatibility inputs while runtime-facing blocked payloads use canonical `blocked_reason_code`, `allowed_action_ids`, and `allowed_action_ids[]`.
