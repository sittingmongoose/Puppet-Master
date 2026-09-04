# Shard 008: GUI / PMConcept implementation-readiness repair addendum (2026-07-02)

Source: `Plans/FinalGUISpec.md`

Source lines: L1217-L1231

Source SHA256: `d5dd0b8f0f130cf3a4834576d4ac87136d579819ec48bf6b3f165ac4874adc2b`

---

## GUI / PMConcept implementation-readiness repair addendum (2026-07-02)

This addendum reconciles PMConcept with the final GUI implementation-readiness contract. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

PMConcept remains concept/source-lineage input only. `Plans/PMConcept_Control_Reconciliation.json` inventories PMConcept controls and marks each control as production-wiring-required, concept-only pending owner adjudication before promotion, concept fixture only, retired/re-scoped, or parser false positive. Production GUI implementation uses `Plans/Wiring_Matrix.production.json`, `Plans/UI_Command_Catalog.md`, and owner docs rather than PMConcept inline handlers, local state, colors, CSS classes, demo data, or fixed mock content.

The old fixed Project Setup through Plan Compile Configuration rail is not the Planning Wizard data model. Production Planning Wizard shows dynamic PlanningRun topic maps, impacted/stale/repair/final-review states, source and annotation projections, audit/repair activity, and final Approve And Build. Fixed phase labels may be used only as high-level progress grouping, not as a hardcoded workflow.

Approve And Build is the only ordinary final planning approval-to-PlanCompileRun launch authority. It dispatches `cmd.planning_wizard.approve_and_build`, carries the displayed final-review CAS/currentness inputs, writes `approval_cas_receipt`, publishes `PlanApproved`, creates or binds exactly one `PlanCompileRun` synchronously, and opens Orchestrator Plan Compile in pending-launch or durable-run state. No `START`, `BUILD`, or `Approve & Continue` control may create a second ordinary launch from the same approval inputs. Post-approval controls use scoped labels such as `Open Plan Compile`, `Open Build`, `Pause`, `Resume`, `Retry`, or `Approve Step` only when their command, disabled reason, receipt effect, and stale-projection behavior are defined.

Visible testing UI is required wherever testing policy or evidence is user-visible. Settings expose global and per-project testing capability rows with inherited/effective state and `Auto` / `On` / `Off`; visibility policy exposes `show_when_possible`; active sessions expose `Open`, `Watch`, collapse/detach/background, evidence inspection, and redaction inspection. Browser testing projections show navigation, clicks, form input, assertions, screenshots, console, network, and pass/fail progression. Native testing projections show live preview, hot reload, simulator, emulator, device stream, app window, interaction trace, screenshots, and logs when available and permitted.

Accessibility is part of implementation readiness. Production controls must have accessible names, semantic roles or native elements, keyboard parity, focus-visible behavior, tab/menu/disclosure state semantics, disabled reason text, and `aria-describedby` or equivalent reason association for disabled actions. PMConcept icon-only buttons, custom clickable `div`/`span` elements, and tab/menu patterns are visual lineage until these requirements are satisfied in wiring evidence.

Production fixtures and examples must not expose local machine paths, localhost URLs, demo database strings, sample secrets, raw account details, or misleading terminal/browser evidence as acceptance proof. Such PMConcept values are `concept_fixture_only`; production UI consumes project-scoped projected state, redacted display values, credential-store summaries, and evidence refs with redaction manifests.
