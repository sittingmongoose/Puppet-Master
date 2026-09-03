# Shard 018: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/Automated_Testing_System.md`

Source lines: L1633-L1873

Source SHA256: `d9088cb32285085b1df949842deb13a1346357974dd723292987bea02a7e9b0f`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run onboarding, Doctor/Health, Teacher handoff, and Planning Wizard landing acceptance coverage from bootstrap ledger `pldg-20260701-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### ATS-020 - Nine-Stage Product Onboarding, Three-Scene Guided Tour, And Doctor Acceptance Tests

```yaml
plan_unit_id: ATS-020
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated acceptance coverage enforces the exact nine-stage Product Onboarding main path
  `welcome`/`simple_path`/`first_project`/`source_control_setup`/`server_storage_client`/`remote_access_setup`/`review_setup_plan`/`automatic_preparation`/`ready`
  and the exact six-stage connect-existing shortcut
  `welcome`/`simple_path`/`remote_access_setup`/`review_setup_plan`/`automatic_preparation`/`ready`. Pre-review selections
  update only the local draft: no external owner work or network probe begins until the person confirms the current
  Review Setup Plan. Automatic Preparation dispatches the approved plan once through canonical owners and observes real
  results and receipts. Four-screen/provider-first, five-stage, and superseded seven-stage records migrate with
  path-correct counts, an unconfirmed Review, and no auto-confirmation or owner-work replay. Guided Tour is an ephemeral,
  optional, provider-free three-scene film in exact `usage`/`planning_wizard`/`chat_teacher` order. It observes the same
  Usage card hide and return, advances Try only from that card's exact mounted Options control, advances Planning only
  from the exact intent-chip handler result, and finishes through far-right Chat's real guide selector, `Teacher`
  selection, real composer, and deterministic local reply. Its exact ten typed actions exclude the retired
  restore/keep-layout and tour-owned Reduced Motion actions. Heading focus, clamped callouts, Skip restoration, Finish
  layout, Doctor/Health no-false-green, MCP/server degraded visibility, and FileSafe fail-closed readiness remain
  required. Static, browser-concept, native runtime, accessibility, motion-quality, and visual evidence remain distinct.
gui_related: true
gui_classification_reason: Validates the visible nine-/six-stage modal onboarding, optional three-scene tour, owner-return states, accessibility, errors, and truthful Doctor/Health presentation.
depends_on: [PWIZ-021, PWIZ-022, PWIZ-023, F3-520, F3-521, SRV-001, SRV-003, SRV-004, RAS-001, RAS-007, BRS-001, BRS-003, BRS-006, PJCT-001, ACD-431, T-088, T-089, MI-028, MI-029, F2-155]
unblocks: []
acceptance_criteria:
  - Tests verify the exact nine-stage main order `welcome`, `simple_path`, `first_project`, `source_control_setup`, `server_storage_client`, `remote_access_setup`, `review_setup_plan`, `automatic_preparation`, `ready` and exact path denominator nine.
  - Connect-existing tests verify the exact six-stage shortcut `welcome`, `simple_path`, `remote_access_setup`, `review_setup_plan`, `automatic_preparation`, `ready` and exact path denominator six; `first_project`, `source_control_setup`, and `server_storage_client` are omitted rather than silently executed.
  - Tests enforce the exact thirteen-action Onboarding census: ui.onboarding.start, ui.onboarding.next, ui.onboarding.back, ui.onboarding.close, ui.onboarding.skip, ui.onboarding.defer, ui.onboarding.open_details, ui.onboarding.more_ways, ui.onboarding.choose_simple_path, ui.onboarding.open_owner_flow, ui.onboarding.run_automatic_preparation, ui.onboarding.choose_first_project, and ui.onboarding.finish; `simple_path` and `ui.onboarding.choose_simple_path` are current visible behavior, and no missing or extra typed action passes.
  - Before person confirmation of the current `review_setup_plan` revision, every choice performs a local draft transition or cached read only; tests reject any network probe, owner route, owner operation, mutation, or production receipt before that fence.
  - First Project keeps new/open decisions visually distinct and progressively discloses less-common origins. Its selection queues canonical Project-owner intent; only a confirmed Review may dispatch `cmd.project.new_local {init_git:true}` through Project System, and tests reject `cmd.source_control.repository.init` as a request, alias, handler, or visible route.
  - Source Control tests state plainly that Safe History is local and verify independent `scm_backend_selection=git|jujutsu|null` and `forge_provider_selection=github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|forgejo|gitea|cursor_origin|none|null` axes, including Git/local-only, Git/online, Jujutsu/local-only, and Jujutsu/online cases. Git and Jujutsu never have service accounts, Forgejo and Gitea remain distinct products/adapters, and FileSafe complements rather than replaces the selected backend.
  - Existing-forge and signup selections queue only before Review. After confirmation, existing accounts route through connection and sign-in owners; people without accounts can open only the verified official signup page through protected AuthBrowserSession, then return for owner verification. Repository list/create, Git or Jujutsu clone/publish, and final Project registration follow the exact owner sequence and terminal results; Onboarding never claims to create an account.
  - Forgejo/Gitea Onboarding fixtures cover distinct named instances and provider-specific variants, HTTPS/API base paths, SSH URL/custom port, scoped private-CA and known-host proof refs, cached product/version/API-schema/Git/API/Actions/currentness refs, PAT by default, OAuth PKCE only with a registered instance flow, and no secret bytes. Pre-Review planning performs no network probe, sign-in, trust decision, credential use, repository operation, filesystem mutation, or automation dispatch.
  - "`server_storage_client` and `remote_access_setup` remain separate progressive stages on the main path; discovery alone never passes trust, explicit pairing is required, identity/certificate mismatch blocks, and restore preserves preview, preflight, verification, rollback, and default secret-exclusion requirements. Their pre-review selections do not begin owner work."
  - "`review_setup_plan` shows the current path, revision, queued choices, consequences, and approved-plan hash. `Confirm and prepare` is person-confirmed, rejects stale/unconfirmed/expanded plans, dispatches the approved work at most once, and adds no redundant confirmation step."
  - Automatic Preparation begins only after that confirmation, uses current owner projections and safe defaults, never silently invents probes or mutations across owner/security boundaries, and leaves provider/tool setup optional and deferrable.
  - Tests validate `pm.product_onboarding.automatic_preparation_owner_projection.v1` across pending/running/waiting/requires-input/blocked/failed/cancelled/recovery-required/ready states, denominator-bearing and indeterminate progress, exact session/path/local-backend/forge/target/current-review-revision/approved-plan-hash/continuation/generation fencing, and stale rejection without state replacement.
  - Close, Defer, resume, reload, branch return, and retry preserve `owner_operation_id`, `observable_work_id`, and `dedupe_key`; retry observes the same work, timers never invent progress or readiness, and browser-concept projections cannot carry production readiness, native execution, or a production receipt.
  - Provider tests keep installation separate from authentication, reject Connected or Logged in as Ready without owner proof, preserve credential-owner custody, and prove protected AuthBrowserSession content cannot be captured, persisted, exported, replayed, or exposed to agents/adapters.
  - First Project covers verified existing Project and start-fresh defaults plus queued open, create, clone, JJ, SSH, restore, skip, and optional Origin Preview selections without treating a path as Project identity; canonical owner routing begins only after Review confirmation.
  - Pre-review choices cause zero owner dispatches. A current Review confirmation causes at most one deduplicated dispatch per approved operation, and current terminal owner returns advance Automatic Preparation without repeated Continue/confirm clicks.
  - Ready asserts only completion of the selected Onboarding path, keeps skipped/incomplete owner work named, and makes Guided Tour secondary and optional; Guided Tour Finish keeps Chat at the far right, while Skip restores the exact captured pre-tour layout, composer placeholder, and focus.
  - Every authored Onboarding control has exactly one typed local ui.onboarding.* action, owner work uses that owner's canonical command and sole handler, and no cmd.onboarding.* command family or generic Onboarding mutation handler exists.
  - Request/result fixtures validate pm.product_onboarding.action_request.v1 and pm.product_onboarding.action_result.v1 for applied, disabled, and rejected outcomes; disabled/rejected outcomes have local_effect=none, no session/continuation write, no owner route/operation, no production receipt, and exact error/disabled reasons.
  - Every request keeps local_context closed to intent, review_confirmation, scope, branch_kind, branch_step, selection_ref, target_ref, owner_operation_ref, owner_branch_ref, expanded, start_tour, and recovery_condition; review_confirmation is null outside its gated cases, exact person-confirmed or previously-confirmed proof is required where owner work is admitted, and missing required fields, additional/arbitrary keys, raw payload copies, free-form control payloads, and secret-bearing values are rejected.
  - Tests separately cover more_ways setup/project disclosure (`toggle_setup_options` plus matching choice/scope and null branch) and branch-local update (`update_branch_state`, null choice, canonical branch), rejecting mixed or ambiguous combinations.
  - Tests separately cover whole-session Skip (`skip_product_onboarding`, product_onboarding, null choice -> session_skipped/skipped) and optional Project/Remote-Access Skip (`skip_optional_scope` plus matching choice/scope/branch -> optional_scope_skipped/active), rejecting cross-normalization and false global skipped state.
  - Defer must durably preserve exact path, stage, draft selections, review revision/confirmation state, independent local-backend and forge selections, active branch, bounded history, continuation generation, initiating Client, and return-focus identity before modal dismissal; resume restores that snapshot. Close is a non-completion dismissal with exact focus return, Skip records an explicit skipped session, and Details opens/closes ephemerally on the same stage with no persistence or owner command.
  - Every inline SVG `?` choice-help control reuses `ui.onboarding.open_details` with `intent=toggle_choice_explanation`, the exact stage scope, a stable help-topic selection ref, and exact expanded state; it is keyboard reachable, accessibility-linked, same-stage, ephemeral, non-persistent, and owner-route-free.
  - The packet candidates cmd.onboarding.back, cmd.onboarding.cancel, cmd.onboarding.continue, cmd.onboarding.defer, cmd.onboarding.finish, cmd.onboarding.open_details, cmd.onboarding.resume, and cmd.onboarding.skip are each rejected as commands, aliases, handlers, and production-wiring rows; the eleven UCC-106 command-era tokens retain their separate source-lineage count.
  - Durable migration tests cover provider-first/four-screen, predecessor-five-stage, and superseded-seven-stage inputs; map unresolved work into the correct nine-stage or six-stage draft; preserve admissible decisions, warnings, selection axes, and valid owner receipts; require an unconfirmed Review; report exact accepted/stale/dropped/quarantined, per-stage, and per-path counts; reference the sole Storage migration receipt; quarantine secret-bearing input; and never auto-confirm or replay installation, authentication, account/repository creation, publication, pairing, restore, Project, provider, Server, Remote Access, or source-control work. Guided Tour state is not persisted or migrated.
  - Back, Close, Skip, Do this later, Details, stale return, reconnect, interruption, reversal, resize, Reduced Motion, keyboard, focus, and screen-reader cases settle deterministically without false readiness; tests prove automatic first-run return prioritizes the genuinely active non-Home application tab before the Home fallback, exact explicit-initiator return, late-mounted body-sibling inertness and restoration, active stage/branch dialog naming, an inert outgoing layer with no duplicate IDs or focus candidates, transferred-and-cleared close-before-Tour focus ownership plus unavailable/throwing Tour fallback, distinct Basic/Friendly/Glass easing, fixed-bounds modal-window opacity/clipping across live cross-family theme changes, and Retro stepped opacity/translation keyframes with no scale; the flow remains one bounded modal and adds no browser-style Back/breadcrumb chrome.
  - Guided Tour tests enforce the exact three-scene denominator and order `usage`, `planning_wizard`, `chat_teacher`; the predecessor five-chapter/Chat-first/final-Planning sequence cannot satisfy current acceptance.
  - Usage Watch observes owner-confirmed hide and return of the same mounted card. Try advances only when the person opens that card's exact mounted Options control; narration, timers, generic Next, look-alike controls, and compact copy about move, resize, change, and hide cannot fabricate a performed checkpoint.
  - Planning Wizard advances only from the handler result for the exact highlighted plain-language intent chip on the real page; no redundant confirmation click is required.
  - Assistant Chat is placed at the far right before its scene; the person opens the real guide selector, selects `Teacher`, types and sends a supported message through the real composer, and receives a deterministic local novice reply in the same conversation with zero provider, model, token, network, or AI-plan use.
  - Tests enforce the exact ten-action Guided Tour census: ui.guided_tour.start, ui.guided_tour.next, ui.guided_tour.back, ui.guided_tour.pause, ui.guided_tour.resume, ui.guided_tour.skip, ui.guided_tour.focus_route, ui.guided_tour.toggle_eli5, ui.guided_tour.finish, and ui.guided_tour.replay. `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, and `ui.guided_tour.toggle_reduced_motion` are rejected as current requests, aliases, handlers, or compatibility actions.
  - The top controls place ELI5 beside Pause and Skip Tour. The opening Usage moment explains ELI5 and Reduced Motion together; the Tour reads the effective Settings-owned `general.visual.reduce-animations` preference and cannot write it or expose a tour-specific motion toggle or separate checkpoint.
  - Each scene heading receives programmatic focus. Callouts measure, clamp, and remeasure the mounted target across resize, scale, localization, movement, and route changes; stale or missing target geometry cannot advance the film.
  - Skip remains available and restores the exact captured layout, original composer placeholder with no partial draft, and return focus. Finish requires completed Teacher prerequisites, offers no restore-or-keep prompt, and keeps Chat at the far right.
  - Static schema/fixture gates, source-transform assertions, browser-concept verification, native Slint/runtime execution, accessibility certification, motion-quality review, and visual acceptance validate only their declared evidence layers and cannot substitute for one another.
  - The retained exact 128-row packet denominator (SH 12, ONB 28, TOUR 11, DOC 24, IMP 10, TST 7, PERF 13, SRV 6, RA 17) is predecessor evidence only: its ONB/Tour rows do not prove the current nine-/six-stage, three-scene, or ten-action contracts. Current acceptance uses path denominators nine and six plus Tour denominators three scenes and ten typed actions, with browser, static, native, runtime, accessibility, motion, and visual lanes reported separately.
  - Tests verify MCP/server unavailable rows and FileSafe fail-closed readiness remain visible Health/Doctor concerns when relevant.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-new-contracts-verify.py
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - Plans/guided_tour_contracts.schema.json
  - Plans/guided_tour_contract_fixtures.json
  - Concepts/pm7-tools/onboarding_cinematic_source.py static transform assertions
  - Concepts/pm7-tools/verify/onboarding_cinematic.mjs browser-concept verifier
  - Concepts/pm7-tools/guided_tour_source.py static transform assertions
  - Concepts/pm7-tools/verify/guided_tour.mjs browser-concept verifier
  - Concepts/pm7-tools/build_pm7.py final generated-artifact static gate
  - scratchpad/pm-integration-20260831/audits/onboarding-doctor-128-current-runner/audit_runner.py predecessor packet audit only, not current Onboarding/Tour acceptance
  - future native nine-/six-stage Product Onboarding GUI, request/result, review-confirmation fence, owner-return, durable-migration, and no-command-family acceptance suite
  - future native three-scene Guided Tour exact-control, callout, focus, Skip-restore, and Finish-layout acceptance suite
  - future Doctor/Health no-false-green fixture suite
risk_class: first_run_acceptance_gap
reasoning_tier: high
context_scope: nine_and_six_stage_onboarding_three_scene_tour_doctor_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - scratchpad/pm-integration-20260831/audits/onboarding-doctor-128-current-runner/audit_runner.py predecessor packet audit only
  - future Product Onboarding/Guided Tour/Health/Planning Wizard acceptance tests
node_compile_hint:
  mode: nine_and_six_stage_onboarding_three_scene_tour_acceptance_tests
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
  - Do not call this feature acceptance-covered without exact nine-stage main and six-stage connect-existing order/denominators, zero external owner work before person-confirmed current Review, independent local-backend/optional-forge coverage, current-review one-dispatch proof, optional/deferrable provider setup, typed choice help, path-correct durable migration, exact three-scene/ten-action Guided Tour coverage, owner-security, and Doctor no-false-green tests.
  - Do not restore the predecessor four-screen/provider-first, five-stage, seven-stage, or paid-provider-before-Free-Models choreography as current behavior.
  - Do not hide or bypass current `simple_path`, `server_storage_client`, or `review_setup_plan`, or silently execute stages omitted by the connect-existing shortcut.
  - Do not dispatch any network probe, owner route, mutation, or external work before person confirmation of the current Review Setup Plan revision.
  - Do not migrate a predecessor directly into a confirmed Review or Automatic Preparation state, auto-confirm it, replay owner work, or report counts against the wrong current path.
  - Do not register cmd.onboarding.* or treat a local ui.onboarding.* action as a semantic command.
  - Do not register, alias, normalize, wire, or assign a handler to any packet candidate cmd.onboarding.* token.
  - Do not treat Close as completion, Skip as completion, Defer as Skip, or Details as durable state or owner work.
  - Do not accept open-ended local_context, arbitrary/raw payload copies, secret-bearing values, or ambiguous more_ways/skip intent/scope/choice/branch combinations.
  - Do not add provider, advanced setup, or Guided Tour as a canonical Onboarding stage or gate.
  - Do not rerun owner work during migration or persist/migrate Guided Tour session state.
  - Do not restore the five-chapter or Chat-first Guided Tour, or accept any scene order other than `usage`, `planning_wizard`, `chat_teacher`.
  - Do not require separate Usage move, resize, change, hide, configure, or focus checkpoints; only the same-card Watch hide/return and exact mounted Options activation satisfy current Usage progression.
  - Do not advance Planning from narration, timers, generic Next, a look-alike, or anything other than the exact highlighted intent-chip handler result.
  - Do not complete Chat/Teacher without far-right Chat, the real guide selector, `Teacher`, a real-composer send, and the deterministic local same-conversation reply; do not use a provider, model, token budget, network, or AI plan.
  - Do not restore `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, or `ui.guided_tour.toggle_reduced_motion` as current requests, aliases, handlers, or compatibility actions.
  - Do not add a Guided Tour-specific Reduced Motion toggle or separate motion scene; the Tour only explains and honors the Settings-owned preference.
  - Do not let callouts escape the viewport, point at stale geometry, or bypass scene-heading focus.
  - Do not leave a partial composer draft, changed placeholder, changed layout, or lost focus after Skip; do not restore the old layout or move Chat away from the far right after Finish.
  - Do not treat the predecessor 128-row packet or its ONB 28/TOUR 11 slices as current nine-/six-stage or three-scene/ten-action acceptance.
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
