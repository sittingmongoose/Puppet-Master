
## Research Progress - 2026-03-17 - Canonical route validation and rejection rules

### Targeted docs read
- `Plans/.pipeline/work_items/w-20260312-203855/working_ledger.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/FinalGUISpec.md`
- `Plans/storage-plan.md`

### Key findings
- The route layer now needs explicit invalid-combination rules.
- Canonical route validation rules are:
  - reject when `project_id` is missing
  - reject when no primary selector exists
  - reject when both `subject_id` and `object_kind/object_id` are supplied as competing primary selectors
  - reject when `object_kind` is present without `object_id`
  - reject when `object_id` is present without `object_kind`
  - reject when `inspector_target` is present but no object selector exists
  - reject when `tab_id` conflicts with `target_kind`
  - reject when `line` or `range` appears in `route_target`
  - reject when per-surface state appears in `route_target`
- `subject_id` routes are valid for content subjects only.
- `object_kind` routes are valid for non-subject objects only.
- The route layer must normalize legacy/special-case ids before validation rather than accepting them as ad hoc top-level fields.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Crosswalk.md`
  - `Plans/FinalGUISpec.md`

### Contradictions / gaps surfaced
- Current docs define plenty of positive rules, but almost no explicit invalid-combination rules.
- Without rejection rules, route producers will keep slipping local payload habits into the base contract.

### Candidate fixes to carry forward
- Add explicit route validation rules to `Contracts_V0.md`.
- State that invalid route payloads are contract failures, not “best effort” cases.
- Normalize before route construction, not during late destination-specific handling.

### Do-not-forget details
- A bounded contract needs rejection rules.
- Otherwise every bad payload becomes a precedent.

## Research Progress - 2026-03-17 - Exact `tab_id` role and vocabulary

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`
- `Plans/.pipeline/work_items/w-20260312-203855/working_ledger.md`

### Key findings
- `tab_id` is route focus refinement, not destination class and not object identity.
- The current high-value canonical vocabulary is:
  - Orchestrator:
    - `progress`
    - `seams`
    - `node_graph`
    - `evidence`
    - `history`
    - `ledger`
- `tab_id` should be used only when the destination surface itself contains stable first-class tabs that materially affect whether the target is visible.
- `tab_id` must not be used for:
  - side-panel subviews
  - browser tab ids
  - workspace tab ids
  - widget slots
  - compare-target variants

### Use rules
- `tab_id` is meaningful only with `target_kind = page_tab` or with a routed page whose visibility depends on a known stable tab family.
- `tab_id` does not replace `target_kind`.
- `tab_id` does not replace `inspector_target`.
- `tab_id` should stay absent when the destination surface can reveal the target without explicit tab forcing.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/Orchestrator_Page.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Command_Catalog.md`

### Contradictions / gaps surfaced
- Older docs still blur page tabs, panel subviews, workspace tabs, and browser tabs as if they were one kind of thing.
- `workspace_tab_id` and `browser_tab_id` remain real shell identities, but they are not canonical route `tab_id` values.

### Candidate fixes to carry forward
- Define `tab_id` as stable page-tab focus only.
- Start with the Orchestrator tab family as the first canonical enum set.
- Keep panel-subview and shell-tab identities outside the route base contract.

### Do-not-forget details
- `tab_id` is a routed page-focus field.
- It is not a generic “any tab anywhere” field.

## Research Progress - 2026-03-17 - Resolver-scope rules for scoped object identities

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/UI_Command_Catalog.md`

### Key findings
- Some object identities are globally simple.
- Some object identities are scoped and require resolver context.
- The canonical rule is:
  - base route contract stays small
  - resolver context comes from existing scope fields such as `project_id`, `focused_run_id`, and the destination’s canonical object store
- Scoped identity rules:
  - `blocked_episode`
    - `object_id = blocked_sequence`
    - resolver scope requires `focused_run_id`
    - resolver scope also requires node membership inside that run
  - `scheduler_pass`
    - `object_id = scheduler_pass_id`
    - resolver scope requires `focused_run_id`
  - `safe_point`
    - `object_id = safe_point_id`
    - resolver scope requires `focused_run_id`
  - `remediation`
    - `object_id = remediation_root_id`
    - resolver scope requires `focused_run_id`
  - `attempt`
    - `object_id = attempt_id`
    - resolver scope requires `focused_run_id`
- The route contract does not need to grow extra top-level scope ids for each of these families.
- Resolver logic must be responsible for applying the correct scoped lookup rules.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/storage-plan.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/Orchestrator_Page.md`

### Contradictions / gaps surfaced
- Current docs still sometimes imply that scoped runtime identities need bespoke top-level route fields.
- `blocked_episode` is the strongest example: the scope rule is real, but the contract should not expand into a blocked-episode-shaped payload family.

### Candidate fixes to carry forward
- Add scoped-identity resolver rules to `Contracts_V0.md`.
- Keep scoped runtime families object-first and resolver-backed.
- Do not add family-specific top-level route fields just because some ids are only unique within run scope.

### Do-not-forget details
- Small contract, strong resolver.
- That is the correct balance for scoped runtime identities.

## Research Progress - 2026-03-17 - Routing owner-doc adoption map

### Key findings
- The routing tranche is now structurally complete enough to map directly onto owner docs.
- The owner-doc adoption split is:
  - `Plans/Contracts_V0.md`
    - own `route_target`
    - own `OpenSubject`
    - own `target_kind`
    - own `object_kind`
    - own `inspector_target`
    - own selector precedence
    - own route validation and rejection rules
    - own scoped-resolver rules
    - own `resume_url` serialization rule
  - `Plans/Crosswalk.md`
    - declare primitive ownership for route-target / open-subject navigation
    - declare that storage and surface docs consume, not own, navigation identity
  - `Plans/UI_Command_Catalog.md`
    - classify commands as `shell_view`, `navigation_wrapper`, or `domain_action`
    - add wrapper/alias normalization metadata
    - normalize command payloads toward `route_target` and `OpenSubject`
  - `Plans/FinalGUISpec.md`
    - consume the route vocabulary
    - stop treating `resume_url` or page-local deep links as stronger than generic navigation
    - stop blurring tabs, subviews, shell state, and object identity
  - `Plans/FileManager.md`
    - keep `OpenFile` narrow
    - consume `OpenSubject`
    - stop reading path-open as the universal navigation primitive
  - `Plans/storage-plan.md`
    - persist refs like `resume_url`
    - persist route-adjacent state
    - stop owning canonical navigation identity
  - `Plans/usage-feature.md`
    - normalize `usage_event_ref` into `object_kind = usage_event`
  - `Plans/assistant-chat-design.md`
    - normalize wizard/message routes to object-first forms
    - keep deep-link step/message anchors secondary
  - `Plans/Run_Graph_View.md`
    - normalize scheduler/blocking/safe-point/remediation/attempt pivots through object-first route recipes
  - `Plans/Orchestrator_Page.md`
    - normalize seam/package/lane/worktree/concern/promotion/graph lineage pivots through object-first route recipes
  - `Plans/WorktreeGitImprovement.md`
    - consume worktree object routing rather than inventing a separate SCM-local navigation identity

### Impacted docs
