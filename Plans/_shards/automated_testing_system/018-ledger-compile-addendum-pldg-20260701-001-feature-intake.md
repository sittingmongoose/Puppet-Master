# Shard 018: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/Automated_Testing_System.md`

Source lines: L1633-L1893

Source SHA256: `3ef13d447ecc28cd9931d4472fb776d029a8834b40b70231783404619190f27c`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run onboarding, Doctor/Health, Teacher handoff, and Planning Wizard landing acceptance coverage from bootstrap ledger `pldg-20260701-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### ATS-020 - Draft And Commit Product Onboarding, Three-Scene Guided Tour, And Doctor Acceptance Tests

```yaml
plan_unit_id: ATS-020
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated acceptance consumes PWIZ-021's exact v2 main, connect-existing and explicit Project Later graphs.
  First Project selections persist an uncreated draft; Settings copy requires explicit source selection and owner preview.
  Only owner-authorized read-only preflight or necessary selected-source authentication may run before commit.
  Exact Review and PJCT-007 binding admit one Project-owner commit chain; actual listed/persisted Project and required
  owner results then admit paid-provider setup followed by Free Models, including after paid Skip. Close/resume/Back
  never undo or replay commit. Four-screen/provider-first, five-stage, seven-stage and predecessor nine-stage records
  migrate with path-correct counts and no auto-confirmation or owner-work replay; unresolved drafts return to unconfirmed
  Review, while genuinely committed rows require owner-revalidated per-row phase continuation. Guided Tour acceptance
  consumes PWIZ-023 and F3-521's September 3 newbie-first revision: optional local practice in exact
  `chat_teacher`/`workspace`/`planning_wizard` chapter order, shared manual/Show Me handlers and observed predicates,
  same-answer ELI5, at least half of meaningful actions and dwell in Planning, safe checkpoint recovery, and no work
  started. Its eleven typed tour actions include Show Me but exclude the separate retired restore/keep-layout and
  tour-owned Reduced Motion actions. Heading focus, clamped callouts, Skip restoration, default-restore/explicit-Keep Finish
  layout, Doctor/Health no-false-green, MCP/server degraded visibility, and FileSafe fail-closed readiness remain
  required. Static, browser-concept, native runtime, accessibility, motion-quality, and visual evidence remain distinct.
gui_related: true
gui_classification_reason: Validates modal onboarding, optional three-chapter tour, owner-return states, accessibility, errors, and truthful Doctor/Health presentation.
depends_on: [PWIZ-021, PWIZ-022, PWIZ-023, F3-520, F3-521, SRV-001, SRV-003, SRV-004, RAS-001, RAS-007, BRS-001, BRS-003, BRS-006, PJCT-001, ACD-431, T-088, T-089, MI-028, MI-029, F2-155]
unblocks: []
acceptance_criteria:
  - Tests consume the exact PWIZ-021 main_stage_order, connect_existing_stage_order and deferred_project_stage_order definitions, not a testing-owned roster. Main includes eleven semantic stages; explicit Project Later skips provider work without a fake Project and connect-existing retains its six-stage shortcut.
  - Connect-existing tests verify the exact six-stage shortcut `welcome`, `simple_path`, `remote_access_setup`, `review_setup_plan`, `automatic_preparation`, `ready` and exact path denominator six; `first_project`, `source_control_setup`, and `server_storage_client` are omitted rather than silently executed.
  - Tests enforce the exact thirteen-action Onboarding census: ui.onboarding.start, ui.onboarding.next, ui.onboarding.back, ui.onboarding.close, ui.onboarding.skip, ui.onboarding.defer, ui.onboarding.open_details, ui.onboarding.more_ways, ui.onboarding.choose_simple_path, ui.onboarding.open_owner_flow, ui.onboarding.run_automatic_preparation, ui.onboarding.choose_first_project, and ui.onboarding.finish; `simple_path` and `ui.onboarding.choose_simple_path` are current visible behavior, and no missing or extra typed action passes.
  - Precommit tests reject every owner dispatch except current owner-authorized read-only preflight or necessary selected-source authentication; actual owner request shape/hash, permission, capability, consent, source/draft/revision, Client/Host, focus and expiry are joined. Ref-shaped strings, detected accounts, stale sources or UI availability alone never authorize work.
  - First Project keeps new/open decisions visually distinct and progressively discloses less-common origins. Its selection queues canonical Project-owner intent; only a confirmed Review may dispatch `cmd.project.new_local {init_git:true}` through Project System, and tests reject `cmd.source_control.repository.init` as a request, alias, handler, or visible route.
  - Source Control tests state plainly that Safe History is local and verify independent `scm_backend_selection=git|jujutsu|null` and `forge_provider_selection=github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|forgejo|gitea|cursor_origin|none|null` axes, including Git/local-only, Git/online, Jujutsu/local-only, and Jujutsu/online cases. Git and Jujutsu never have service accounts, Forgejo and Gitea remain distinct products/adapters, and FileSafe complements rather than replaces the selected backend.
  - Selected-source first-time sign-in consumes MACS-005 with null pre-existing Project/profile/account/install identities and protected human consent; only the auth owner allocates verified identity. FGI-011 account/container listing has no phantom repository/Project and cannot create/bind/publish. Actual repository and content mutations remain in the exact reviewed Project-owner chain; Onboarding never claims account creation.
  - Forgejo/Gitea fixtures retain distinct instances/adapters, HTTPS/API base paths, SSH/custom port, scoped CA/known-host refs, product/version/API/Git/Actions currentness, PAT default and registered-flow-only OAuth PKCE. PWIZ-021's necessary-source read/auth admission is tested separately from forbidden precommit trust, repository mutation, filesystem write and automation; no secret bytes enter durable Onboarding state.
  - "Server/Storage/Client and Remote Access remain independent owner-routed stages. Read-only selected-route discovery is not pairing/trust; identity/certificate mismatch blocks, and restore retains preview/preflight/verification/rollback/default secret exclusion. The source-auth exception cannot bypass Server/Remote Access/Restore mutation fences."
  - "`review_setup_plan` shows the current path, revision, queued choices, consequences, and approved-plan hash. `Confirm and prepare` is person-confirmed, rejects stale/unconfirmed/expanded plans, dispatches the approved work at most once, and adds no redundant confirmation step."
  - Automatic Preparation begins only after that confirmation, uses current owner projections and safe defaults, never silently invents probes or mutations across owner/security boundaries, and leaves provider/tool setup optional and deferrable.
  - Tests validate `pm.product_onboarding.automatic_preparation_owner_projection.v2` across the owner-defined states/progress modes with exact session/draft/Project-commit/path/target/review/hash/continuation fences; stale results cannot replace state, and this phase cannot begin broad provider setup before actual Project commit.
  - Close, Defer, resume, reload, branch return, and retry preserve `owner_operation_id`, `observable_work_id`, and `dedupe_key`; retry observes the same work, timers never invent progress or readiness, and browser-concept projections cannot carry production readiness, native execution, or a production receipt.
  - Provider tests keep installation separate from authentication, reject Connected or Logged in as Ready without owner proof, preserve credential-owner custody, and prove protected AuthBrowserSession content cannot be captured, persisted, exported, replayed, or exposed to agents/adapters.
  - First Project covers verified existing Project and start-fresh defaults plus queued open, create, clone, JJ, SSH, restore, skip, and optional Origin Preview selections without treating a path as Project identity; canonical owner routing begins only after Review confirmation.
  - Draft choices cause zero mutation. Only exact precommit read/source-auth admission permits those existing owner commands; current Review permits at most one Project commit chain, and matching terminal results advance without repeated Continue/confirm clicks. Tests reject acknowledgement-only, unlisted/unpersisted, wrong-Project/hash and unsettled selected-Settings results as commit proof.
  - Ready asserts only completion of the selected Onboarding path, keeps skipped/incomplete owner work named, and makes Guided Tour secondary and optional; tour terminal behavior is validated against PWIZ-023's default restoration or explicit Keep followed by the real Planning Wizard, and exact Skip restoration.
  - Every authored Onboarding control has exactly one typed local ui.onboarding.* action, owner work uses that owner's canonical command and sole handler, and no cmd.onboarding.* command family or generic Onboarding mutation handler exists.
  - Request/result fixtures validate pm.product_onboarding.action_request.v2 and pm.product_onboarding.action_result.v2 for applied, disabled, and rejected outcomes; disabled/rejected outcomes have local_effect=none, no session/continuation write, no owner route/operation, and exact error/disabled reasons. All local results have no production receipt.
  - local_context consumes PWIZ-021's closed v2 required/null/gated fields and phase-specific preflight/commit proofs rather than a testing-owned field list; missing, extra, raw, ambiguous and secret-bearing fields fail closed. Exact actual request/result/draft joins are exercised in addition to shape validation.
  - Draft persistence tests validate every current Session through the deterministic offline existing-family bundle, bind the approved hash to actual bounded draft bytes, reject missing/tampered draft bodies, and fail schema/field/key drift in the standard contract gate. The physical-family and retention-policy denominators remain 88 and 24; this does not prove a native adapter.
  - Settings tests require source/draft revision, exact eligible/explicit setting sets, exclusions, expiry and preview hash, reject draft apply, and require actual Project rebind plus ordinary current apply. Paid-provider Skip still offers Free Models, both phases require actual commit, and Close/resume/Back preserve that Project and settled phases.
  - Tests separately cover more_ways setup/project disclosure (`toggle_setup_options` plus matching choice/scope and null branch) and branch-local update (`update_branch_state`, null choice, canonical branch), rejecting mixed or ambiguous combinations.
  - Tests separately cover whole-session Skip (`skip_product_onboarding`, product_onboarding, null choice -> session_skipped/skipped) and optional Project/Remote-Access Skip (`skip_optional_scope` plus matching choice/scope/branch -> optional_scope_skipped/active), rejecting cross-normalization and false global skipped state.
  - Defer must durably preserve exact path, stage, draft selections, review revision/confirmation state, independent local-backend and forge selections, active branch, bounded history, continuation generation, initiating Client, and return-focus identity before modal dismissal; resume restores that snapshot. Close is a non-completion dismissal with exact focus return, Skip records an explicit skipped session, and Details opens/closes ephemerally on the same stage with no persistence or owner command.
  - Every inline SVG `?` choice-help control reuses `ui.onboarding.open_details` with `intent=toggle_choice_explanation`, the exact stage scope, a stable help-topic selection ref, and exact expanded state; it is keyboard reachable, accessibility-linked, same-stage, ephemeral, non-persistent, and owner-route-free.
  - The packet candidates cmd.onboarding.back, cmd.onboarding.cancel, cmd.onboarding.continue, cmd.onboarding.defer, cmd.onboarding.finish, cmd.onboarding.open_details, cmd.onboarding.resume, and cmd.onboarding.skip are each rejected as commands, aliases, handlers, and production-wiring rows; the eleven UCC-106 command-era tokens retain their separate source-lineage count.
  - Migration tests cover four/five/seven/nine-stage predecessors using PWIZ-022/SP-252, preserve admissible choices/warnings/real owner results, quarantine secrets, return unresolved drafts to unconfirmed Review, and resume committed rows only with exact per-row revalidated Project/owner refs. Accepted/stale/dropped/quarantined/stage/path/committed-resume counts reconcile and reference the sole Storage migration receipt; nothing auto-confirms or replays domain work. Tour checkpoint rules remain separate under PWIZ-023.
  - Back, Close, Skip, Do this later, Details, stale return, reconnect, interruption, reversal, resize, Reduced Motion, keyboard, focus, and screen-reader cases settle deterministically without false readiness; tests prove automatic first-run return prioritizes the genuinely active non-Home application tab before the Home fallback, exact explicit-initiator return, late-mounted body-sibling inertness and restoration, active stage/branch dialog naming, an inert outgoing layer with no duplicate IDs or focus candidates, transferred-and-cleared close-before-Tour focus ownership plus unavailable/throwing Tour fallback, distinct Basic/Friendly/Glass easing, fixed-bounds modal-window opacity/clipping across live cross-family theme changes, and Retro stepped opacity/translation keyframes with no scale; the flow remains one bounded modal and adds no browser-style Back/breadcrumb chrome.
  - Guided Tour tests enforce the exact three-chapter order `chat_teacher`, `workspace`, `planning_wizard` and every current stable step; both predecessor controllers and v2's Usage-first/Chat-final expectations are migration inputs, not current acceptance.
  - Every important manual and Show Me path reaches the same mounted owner action and success predicate; tests include unrelated clicks, timers, generic Next, look-alikes, missing targets, state changes, repeated Show Me, and interruption during pre-cue/travel/arrival/settle. None may fabricate an action result.
  - Workspace tests verify real Chat movement with shared docked/undocked state and a real widget add/move/resize/focus result, reversible layout capture, exact Skip restoration, default Finish restoration, and explicit Keep.
  - Planning tests bind meaningful action and dwell shares to a declared step census and require both shares to be at least one half. The book-club goal, three outcomes, who-can-edit decision, why, assumptions/unresolved choices, review, genuine changed answer, specific shared-access consequence, final real-page landing with committed Project, and no-work-start boundary all require observed results. An unsure answer stays unresolved; clicking Edit alone cannot choose an answer or complete the edit.
  - Assistant Chat opens first; the real guide selector selects Teacher, the real composer sends the supplied question, a local answer streams in the same labeled conversation, and ELI5 changes that same answer. Tests measure zero provider requests and zero usage increment, not merely a hard-coded declaration.
  - Guided-example ownership survives Pause, later chapters, Finish, and Replay. Actual composer Enter/send and slash-command text remain on the deterministic local path; unrelated threads retain their existing handler. Interrupted or replaced local streams cannot append late chunks, clear another stream's busy state, replace the current lesson answer, or advance a different session/thread/step. Missing telemetry remains unavailable, never an inferred zero-use pass.
  - Tests enforce the eleven-action tour census owned by PWIZ-023, including ui.guided_tour.show_me. Separate ui.guided_tour.restore_layout, ui.guided_tour.keep_layout, and ui.guided_tour.toggle_reduced_motion actions remain rejected. Chat selection/send/ELI5 reuse cmd.persona.select, cmd.chat.send, and cmd.chat.eli5.set; local fixture adapters do not establish native handler registration or production receipts.
  - The top controls place ELI5 beside Pause and Skip Tour. The brief opening explains ELI5 and Reduced Motion; the Tour reads the effective Settings-owned general.visual.reduce-animations preference without writing it or adding a motion-toggle screen. Reduced Motion retains sequence/cause-and-effect and action parity.
  - Each scene heading receives programmatic focus. Callouts measure, clamp, and remeasure the mounted target across resize, scale, localization, movement, and route changes; stale or missing target geometry cannot advance the film.
  - Skip restores exact captured layout, Chat thread/selection/placeholder/draft, and focus. Finish requires current prerequisite predicates, restores temporary layout by default or honors explicit Keep, removes practice content, and lands on the real Planning Wizard without work. Restoration failure remains recoverable, never completed. Safe checkpoint tests revalidate owner state on Close/reload/resume, reject stale/secret-bearing records, return to the earliest unsatisfied prerequisite, and never replay domain work.
  - Restoration tests include panel size shares and dock dimensions, hidden-panel order, widget geometry, repeated failed-then-successful restoration against the original snapshot, and stale-revision/persistence-failure rejection by the existing resize owner. Explicit Keep applies only to layout; it does not retain practice content or claim restoration. Default restoration cannot substitute a factory reset or unchecked layout assignment.
  - Static schema/fixture gates, source-transform assertions, browser-concept verification, native Slint/runtime execution, accessibility certification, motion-quality review, and visual acceptance validate only their declared evidence layers and cannot substitute for one another.
  - The retained exact 128-row packet denominator (SH 12, ONB 28, TOUR 11, DOC 24, IMP 10, TST 7, PERF 13, SRV 6, RA 17) is predecessor evidence only. Neither its ONB/Tour slices nor the v2 three-scene/ten-action fixtures prove the current tour. Tour acceptance uses three chapters, eleven typed tour actions, the declared stable-step/action/dwell census, and separate browser/static/native/runtime/accessibility/motion/visual verdicts. Onboarding revision reconciliation remains a separate obligation.
  - Tests verify MCP/server unavailable rows and FileSafe fail-closed readiness remain visible Health/Doctor concerns when relevant.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-new-contracts-verify.py
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - tests/test_pm_onboarding_phases.py static phase/draft/actual-owner-input/commit/offline-storage checks only
  - tests/test_pm_settings_draft_transfer.py static explicit-copy/preview/rebind/exclusion checks only
  - python3 scripts/pm-onboarding-contracts.py --check
  - Plans/guided_tour_contracts.schema.json
  - Plans/guided_tour_contract_fixtures.json
  - tests/test_pm_guided_tour_v3_contracts.py static v3 positive/negative record coverage only
  - tests/test_pm_finalgui_tour_v3.py static shared-owner references and causal presentation mutations only
  - tests/test_pm_touch_closure_source.py source/action inventory and owner routing checks only
  - Concepts/pm7-tools/onboarding_cinematic_source.py static transform assertions
  - Concepts/pm7-tools/verify/onboarding_cinematic.mjs browser-concept verifier
  - Concepts/pm7-tools/guided_tour_source.py static transform assertions
  - Concepts/pm7-tools/verify/guided_tour.mjs browser-concept verifier
  - Concepts/pm7-tools/verify/guided_tour_practice_selftest.mjs pure local practice reducer tests only
  - Concepts/pm7-tools/verify/guided_tour_polish_checkpoint.mjs focused concept edit/copy/DOM-continuity checks only
  - Concepts/pm7-tools/verify/guided_tour_lifecycle_checkpoint.mjs scoped concept sequence, exit/retry, semantic resize, and local Teacher isolation checks only
  - Concepts/pm7-tools/build_pm7.py final generated-artifact static gate
  - scratchpad/pm-integration-20260831/audits/onboarding-doctor-128-current-runner/audit_runner.py
  - future Onboarding/Tour acceptance runner (the scratchpad runner above is predecessor-packet audit only and is not current acceptance)
  - future native PWIZ-021 v2 Product Onboarding GUI, draft/copy/preflight/source-auth/Project-commit/paid-free phases, durable continuation/migration and no-command-family acceptance suite
  - future native newbie-first Guided Tour manual/Show Me, safe-resume, callout, focus, Skip-restore, and Finish-layout acceptance suite
  - future Doctor/Health no-false-green fixture suite
risk_class: first_run_acceptance_gap
reasoning_tier: high
context_scope: onboarding_newbie_first_tour_doctor_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - scratchpad/pm-integration-20260831/audits/onboarding-doctor-128-current-runner/audit_runner.py
  - future Onboarding/Tour acceptance runner (predecessor-packet audit only)
  - future Product Onboarding/Guided Tour/Health/Planning Wizard acceptance tests
node_compile_hint:
  mode: onboarding_newbie_first_tour_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0007
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0008
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0016
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0037
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0038
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0042
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0043
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0045
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0046
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/doctor_onboarding_plan_review_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
source_atom_ids: [atom-0007, atom-0008, atom-0015, atom-0016, atom-0037, atom-0038, atom-0040, atom-0041, atom-0042, atom-0043, atom-0044, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0003, dec-0004, dec-0005, dec-0006, dec-0007, dec-0008]
preserved_exact_tokens:
  - "welcome"
  - "simple_path"
  - "first_project"
  - "source_control_setup"
  - "server_setup"
  - "server_storage_client"
  - "remote_access_setup"
  - "review_setup_plan"
  - "automatic_preparation"
  - "ready"
  - "usage"
  - "planning_wizard"
  - "chat_teacher"
  - "scm_backend_selection"
  - "forge_provider_selection"
  - "forgejo"
  - "gitea"
  - "forge_forgejo"
  - "forge_gitea"
  - "Start on this computer"
  - "Other setup options"
  - "Take the Guided Tour"
  - "Planning Wizard"
  - "ui.onboarding.*"
  - "ui.onboarding.start"
  - "ui.onboarding.next"
  - "ui.onboarding.back"
  - "ui.onboarding.close"
  - "ui.onboarding.skip"
  - "ui.onboarding.defer"
  - "ui.onboarding.open_details"
  - "ui.onboarding.more_ways"
  - "ui.onboarding.choose_simple_path"
  - "ui.onboarding.open_owner_flow"
  - "ui.onboarding.run_automatic_preparation"
  - "ui.onboarding.choose_first_project"
  - "ui.onboarding.finish"
  - "ui.guided_tour.start"
  - "ui.guided_tour.next"
  - "ui.guided_tour.back"
  - "ui.guided_tour.pause"
  - "ui.guided_tour.resume"
  - "ui.guided_tour.skip"
  - "ui.guided_tour.focus_route"
  - "ui.guided_tour.toggle_eli5"
  - "ui.guided_tour.finish"
  - "ui.guided_tour.replay"
  - "ui.guided_tour.restore_layout"
  - "ui.guided_tour.keep_layout"
  - "ui.guided_tour.toggle_reduced_motion"
  - "general.visual.reduce-animations"
  - "pm.product_onboarding.action_request.v1"
  - "pm.product_onboarding.action_result.v1"
  - "pm.product_onboarding.action_request.v2"
  - "pm.product_onboarding.action_result.v2"
  - "provider_setup"
  - "free_models_setup"
  - "pm.guided_tour.action_request.v2"
  - "pm.guided_tour.terminal_result.v2"
  - "local_context"
  - "skip_product_onboarding"
  - "skip_optional_scope"
  - "toggle_setup_options"
  - "update_branch_state"
  - "session_skipped"
  - "optional_scope_skipped"
  - "cmd.onboarding.*"
  - "cmd.onboarding.back"
  - "cmd.onboarding.cancel"
  - "cmd.onboarding.continue"
  - "cmd.onboarding.defer"
  - "cmd.onboarding.finish"
  - "cmd.onboarding.open_details"
  - "cmd.onboarding.resume"
  - "cmd.onboarding.skip"
  - "Connect Puppet Master to an AI provider"
  - "Set up a paid provider"
  - "Optional: Free Models"
  - "Fee models"
  - "You are ready to plan"
  - "Skip for now"
  - "Provider setup is not finished"
  - "Need help later? Ask Assistant Chat for Teacher. Try: 'What does this mean?' or 'Show me how to use this page.' Teacher explains the current screen from chat."
  - "onboarding_setup_state"
  - "Connected"
  - "Needs sign-in"
  - "Could not connect"
  - "Ready"
  - "Needs setup"
  - "Needs attention"
  - "hide if server fails"
  - "fail-closed"
negative_constraints:
  - Do not call this feature acceptance-covered without owner-current Onboarding path/denominator/fence tests, independent local-backend/optional-forge coverage, one-dispatch proof, optional provider setup, typed choice help, path-correct migration, current newbie-first Guided Tour manual/Show Me/checkpoint/terminal coverage, owner-security, and Doctor no-false-green tests.
  - Do not restore predecessor four-screen/provider-first, five-stage, seven-stage or nine-stage producers. Paid-provider then Free Models is now the accepted post-Project-commit order, including Free Models after paid Skip; it does not restore provider-first setup.
  - Do not hide or bypass current `simple_path`, `server_storage_client`, or `review_setup_plan`, or silently execute stages omitted by the connect-existing shortcut.
  - Do not widen narrowly authorized precommit reads/selected-source authentication into Project/repository/filesystem mutation, pairing/trust/enrollment, or broad provider setup; do not infer authorization from shape/ref/availability alone.
  - Do not migrate a predecessor directly into a confirmed Review or Automatic Preparation state, auto-confirm it, replay owner work, or report counts against the wrong current path.
  - Do not register cmd.onboarding.* or treat a local ui.onboarding.* action as a semantic command.
  - Do not register, alias, normalize, wire, or assign a handler to any packet candidate cmd.onboarding.* token.
  - Do not treat Close as completion, Skip as completion, Defer as Skip, or Details as durable state or owner work.
  - Do not accept open-ended local_context, arbitrary/raw payload copies, secret-bearing values, or ambiguous more_ways/skip intent/scope/choice/branch combinations.
  - Do not add provider, advanced setup, or Guided Tour as a canonical Onboarding stage or gate.
  - Do not replay owner work during migration/resume or persist raw Chat content, secrets, or transient geometry in the bounded tour checkpoint.
  - Do not retain either predecessor tour controller or accept chapter order other than `chat_teacher`, `workspace`, `planning_wizard`.
  - Do not replace real workspace practice with narration or treat a generic Options click as proof of a widget mutation.
  - Do not satisfy a required Planning action from narration, a timer, generic Next, a look-alike, or an Edit button that silently picks an answer.
  - Do not complete Chat/Teacher without its real selection/composer, deterministic same-conversation reply, same-answer ELI5, measured zero provider requests, and zero usage increment.
  - Do not restore `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, or `ui.guided_tour.toggle_reduced_motion` as current requests, aliases, handlers, or compatibility actions.
  - Do not add a Guided Tour-specific Reduced Motion toggle or separate motion scene; the Tour only explains and honors the Settings-owned preference.
  - Do not let callouts escape the viewport, point at stale geometry, or bypass scene-heading focus.
  - Do not leave partial Chat state or lost focus after Skip; do not keep a demonstrated layout without explicit selection, report failed restoration as complete, leave the practice surface over the final Wizard, or start work.
  - Do not treat predecessor packet counts or the v2 three-scene/ten-action fixtures as current acceptance.
  - Do not hide critical blockers just to make onboarding look simpler.
  - Do not treat `Connected` or `Logged in` as equivalent to Ready.
  - Do not let the Ready screen imply that skipped provider, Server, pairing, restore, Project, Doctor, or runtime work is complete.
  - Do not silently hide MCP/server degraded or unavailable rows from GUI/Doctor surfaces.
  - Do not allow stale FileSafe graceful-degradation wording to permit disabled guards as Ready.
  - Do not claim native runtime, native Slint, production persistence, accessibility certification, motion quality, or visual acceptance from schema, fixture, static, transform, or browser evidence.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```
