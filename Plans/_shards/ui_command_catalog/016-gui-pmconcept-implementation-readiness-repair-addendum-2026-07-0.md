# Shard 016: GUI / PMConcept implementation-readiness repair addendum (2026-07-02)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L7889-L7952

Source SHA256: `23bf28ecc5cc3aab5bf8b9c4154d63c3762c27d7eeb85f98dd10331298d372a7`

---

## GUI / PMConcept implementation-readiness repair addendum (2026-07-02)

This addendum closes the GUI command-catalog defects from the PMConcept readiness report. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### Concrete PRD Builder, Planning Wizard, and Plan Compile command rows

The command family required by UCC-098 is concrete. Production GUI controls may not use the old fixed wizard rail, `Approve & Continue`, `START`, `BUILD`, or tab-switch handlers as substitutes for these command IDs.

| Command ID | Label / action | Required payload and guard summary | Receipt / event effect |
|---|---|---|---|
| `cmd.prd_builder.source.import` | Import PRD source | `project_id`, `source_ref`, import mode, authority snapshot, idempotency key; disabled when source is denied, too large, stale, or unsupported | PRD source import receipt and PRD projection refresh |
| `cmd.prd_builder.answer.upsert` | Save PRD answer | `prd_run_id`, question/section id, answer version, source refs, idempotency key; disabled when ledger sync is blocked | PRD answer receipt and projection update |
| `cmd.prd_builder.annotation.upsert` | Add/update annotation | document version, text anchor, action kind, selected text hash, source refs; disabled when anchor is stale and cannot remap | Annotation upsert receipt |
| `cmd.prd_builder.annotation.resolve` | Resolve annotation | annotation id, document version, resolution kind; disabled when annotation is already terminal or stale without remap | Annotation resolution receipt |
| `cmd.prd_builder.conflict.resolve` | Resolve PRD conflict | conflict id, chosen resolution, rationale, source refs; disabled when selected sources are stale or unavailable | Conflict-resolution receipt |
| `cmd.prd_builder.approve_for_planning_wizard` | Approve PRD for Planning Wizard | PRD Pack id/version/hash, source manifest hash, unresolved-warning acknowledgement, idempotency key; disabled when blocking conflicts or ledger sync failure exist | Approved PRD Pack snapshot and handoff receipt |
| `cmd.prd_builder.pack.reopen` | Reopen PRD Pack | approved pack id/version, reason, currentness proof; disabled when reopening would bypass immutable history | Reopen receipt and new draft identity |
| `cmd.planning_wizard.start` | Start Planning Wizard | approved PRD Pack ref or normalized requirements input, project context snapshot, testing policy snapshot | PlanningRun created/opened |
| `cmd.planning_wizard.topic.open` | Open topic | PlanningRun id, topic id, expected topic map version | Topic projection selected |
| `cmd.planning_wizard.topic.add` | Add topic | PlanningRun id, parent/dependency refs, label, source reason, topic map version | Topic added and topic map version advanced |
| `cmd.planning_wizard.topic.split` | Split topic | source topic id, split descriptors, affected refs, topic map version | Topic split receipt and impact propagation |
| `cmd.planning_wizard.topic.merge` | Merge topics | topic ids, target label, source reason, topic map version | Topic merge receipt and impact propagation |
| `cmd.planning_wizard.topic.rename` | Rename topic | topic id, new label, topic map version | Topic rename receipt |
| `cmd.planning_wizard.topic.reorder` | Reorder topic | topic id, before/after target, topic map version | Topic order receipt |
| `cmd.planning_wizard.topic.mark_impacted` | Mark topic impacted | topic id, impact reason, source refs, dependency refs | Topic impact receipt and stale projection |
| `cmd.planning_wizard.topic.defer` | Defer topic | topic id, deferral reason, dependency/currentness refs | Topic deferred receipt |
| `cmd.planning_wizard.topic.reopen` | Reopen topic | topic id, reason, currentness refs | Topic reopened receipt |
| `cmd.planning_wizard.amendment.accept` | Accept amendment | amendment id, source refs, affected topic refs, expected topic map version | Amendment accepted and impacted topics marked |
| `cmd.planning_wizard.approve_and_build` | Approve And Build | final-review CAS inputs for `project_id`, `planning_run_id`, PlanningRun revision, topic map version, `approved_plan_pack_id`, pack version/hash, project-context snapshot hash, PlanUnit index hash, acceptance-unit index hash, testing policy hash, final audit/closure hash, approval actor, and deterministic idempotency key | Atomically writes `approval_cas_receipt`, `PlanApproved`, and `PlanCompileRun_created_or_bound`; returns durable `plan_compile_run_id` synchronously |
| `cmd.plan_compile.pause` | Pause Plan Compile | PlanCompileRun id, current stage token, reason | Plan Compile pause receipt |
| `cmd.plan_compile.resume` | Resume Plan Compile | PlanCompileRun id, currentness token, recovery route | Plan Compile resume receipt |
| `cmd.plan_compile.cancel` | Cancel Plan Compile | PlanCompileRun id, cancellation reason, confirmation token | Plan Compile cancellation receipt |
| `cmd.plan_compile.retry` | Retry Plan Compile stage | PlanCompileRun id, failed stage id, currentness token | Stage retry receipt |
| `cmd.plan_compile.inspect_blocker` | Inspect blocker | PlanCompileRun id, blocker id, route target | Opens blocker inspector |
| `cmd.plan_compile.inspect_evidence` | Inspect evidence | PlanCompileRun id, evidence ref, redaction profile | Opens redacted evidence inspector |
| `cmd.plan_compile.inspect_assignment` | Inspect assignment | PlanCompileRun id, assignment id | Opens assignment inspector |
| `cmd.plan_compile.request_bounded_recompile` | Request bounded recompile | PlanCompileRun id, affected PlanUnit refs, reason, currentness token | Bounded recompile request receipt |
| `cmd.plan_compile.open_build` | Open Build | PlanCompileRun id, build/run identity, target artifact or route; disabled until `BuildStarted` or resulting build identity exists | Opens resulting build or build artifact route |

### Testing capability and visible-session command rows

Testing policy UI is a first-class command surface, not settings prose alone.

| Command ID | Label / action | Required payload and guard summary | Receipt / event effect |
|---|---|---|---|
| `cmd.testing.capability_policy.set` | Set testing capability policy | scope `global` or `project`, capability family, value `Auto` / `On` / `Off`, inheritance marker, authority snapshot; disabled when policy owner is unavailable or authority is missing | Effective testing policy receipt |
| `cmd.testing.visibility_policy.set` | Set testing visibility policy | scope, value including `show_when_possible`, redaction profile ref, background allowance | Visibility policy receipt |
| `cmd.testing.session.open` | Open visible test session | test session id, target surface, route, redaction profile | Visible session opened receipt |
| `cmd.testing.session.watch` | Watch visible test session | test session id, stream/session identity, fallback route | Watch receipt and live projection binding |
| `cmd.testing.session.background` | Continue testing in background | test session id, background reason, continuation policy | Background continuation receipt |
| `cmd.testing.session.redaction.inspect` | Inspect redaction/evidence | test session id, artifact/evidence refs, redaction profile | Redaction inspection route opened |

### PMConcept command aliases and retirements

| PMConcept token | Disposition |
|---|---|
| `cmd.chat.effort`, `cmd.chat.settings`, `cmd.chat.model`, `cmd.chat.mode`, `cmd.chat.open_debug_target_picker`, `cmd.chat.export_investigation_bundle`, `cmd.chat.revoke_investigation_item` | Cataloged command IDs for chat setting/debug routes; payloads carry thread/project/context scope and cannot mutate model/provider state without the owning settings contract. |
| `cmd.file.copy_full_path`, `cmd.file.copy_relative_path` | Cataloged compatibility wrappers over `cmd.file.copy_path` with `format = "absolute"` or `format = "relative"`; production UI may use either explicit wrapper if the wiring row declares the normalized copy-path payload. |
| `cmd.git.open_diff` | Compatibility alias for `cmd.git.diff_open`; production wiring records the alias and the canonical target. |
| `cmd.git.show_commit` | Compatibility alias for `cmd.source_control.history_open_commit`; production wiring records the alias and the canonical target. |
| `cmd.remote.reconnect`, `cmd.search.set_scope`, `cmd.search.previous_result`, `cmd.search.next_result`, `cmd.terminal.focus_session` | Cataloged command IDs required by existing PMConcept/wiring surfaces; terminal focus may normalize internally to any future shorter terminal-focus target only through explicit alias metadata. |
| `cmd.indexOf` | Parser false-positive from JavaScript and not a UICommand. |

`START`, `BUILD`, and `Approve & Continue` are retired as ordinary planning/build launch labels. `Approve And Build` is the only ordinary final planning approval-to-PlanCompileRun launch command. Post-approval runtime controls must use scoped commands such as `cmd.plan_compile.open_build`, `cmd.plan_compile.resume`, `cmd.runtime.approve`, or route/open commands with disabled reasons and receipt effects.
