# Shard 022: Product Onboarding and Guided Tour owner addendum (reconciled 2026-09-10)

Source: `Plans/Planning_Wizard.md`

Source lines: L1763-L2066

Source SHA256: `ac582b97a7bf56c06d7b7f9b6dc72ba773b4da659e1de5cd6c3872e2b541b0b0`

---

## Product Onboarding and Guided Tour owner addendum (reconciled 2026-09-10)

This addendum supersedes PWIZ-017's four-screen/provider-first choreography and the 2026-08-31 seven-stage Onboarding and five-chapter Guided Tour proposal. PWIZ-021 through PWIZ-023 retain their PlanUnit identities and source refs while carrying the current design below. Product Onboarding is a distinct pre-application state machine owned here; Installation/Deployment, Server Claim/Bootstrap, Discovery/Pairing/Remote Access, provider installation/authentication, Project registration/content movement, Source Control, updates, backup/restore, and Doctor retain their own engines. Planning Wizard receives the final setup handoff but is not the Onboarding state store. `Plans/product_onboarding_contracts.schema.json`, `Plans/guided_tour_contracts.schema.json`, and their fixtures are downstream machine-contract consumers: Onboarding's predecessor seven/nine-stage and no-current-`simple_path` values and both predecessor tour controllers are migration inputs, not current authority. For Guided Tour, the September 3 correction below and PWIZ-023 own Chat-first/Planning-final, default restoration or explicit Keep, and safe-step resume. The v3 tour schema materializes these static obligations; predecessor v2 values cannot override them, and v3 validity does not prove a durable adapter or native recovery.

### Product-design law — September 3 draft-first correction

Product Onboarding is a short, calm interruption of the live application, not a full-page substitute application or a provider-first gate. It uses one bounded modal over a theme-aware input-blocking scrim, clear outer margins, one dialog accessibility surface, focus containment, and exact Close/Escape return. Branches replace its interior; they do not create nested dialogs or duplicate owner Settings managers. Each scene has one dominant action and concise adult-language copy. PWIZ-024's four First Project source routes remain visible together; other secondary choices use progressive disclosure. Introduce Git, Jujutsu, service names, NAS, SSH, account details, and topology only when the selected path makes them useful. Advanced detail is optional and consumes the exact owner surface with return context.

The semantic dependency graph is owned once by `Plans/product_onboarding_contracts.schema.json#/$defs/main_stage_order`. Its eleven ordered stages are:

1. `welcome` — explain the outcome; offer Get Started and visible Skip.
2. `simple_path` — choose ordinary guided setup or connection to an existing Puppet Master; choosing changes only local state.
3. `first_project` — choose Start a new project, Open a folder here, Bring one from online, or Restore a backup; record source/name/destination intent without creating a Project or folder.
4. `source_control_setup` — local Safe History and an optional online copy are independent. Show only relevant source choices and, when necessary for the chosen source, the bounded just-in-time source-account flow below.
5. `server_storage_client` — independently resolve where work runs, where files live, and the current Client; validate selected locations without moving or creating content.
6. `remote_access_setup` — record the relevant private access plan or an explicit skip; do not claim a route already exists.
7. `review_setup_plan` — show the chosen source-to-destination/work-computer route, name, settings-copy summary, source-account state, privacy consequences, skips, and unresolved checks. Edit returns to the affected draft choice and retains later choices that remain valid. The final context-specific Create Project, Add Project, or Restore Project action confirms the exact current draft; it is the one Project commit boundary.
8. `automatic_preparation` — observe the selected existing owner command and its required child results after the commit click. The Project becomes usable only from its actual listed/persisted owner result and receipts; acceptance alone is not completion.
9. `provider_setup` — with that actual committed Project in context, offer Choose what powers Puppet Master. Reuse detected usable accounts and copied routes first; broad AI provider work never precedes Project commit.
10. `free_models_setup` — offer the explicit optional Set Up Free Models continuation after the paid-provider prompt, including after Skip. It stays inside Onboarding and delegates to the existing underlying provider/account/model owners.
11. `ready` — present the truthful handoff, Enter Puppet Master, and optional Guided Tour. It does not certify skipped/failed work or start Goals, Plans, agents, provider requests, or builds.

These are dependency stages, not a requirement to render eleven equally complex screens. Hide irrelevant controls, not prerequisites; progress describes the actual applicable journey. `connect_existing_stage_order` retains the exact six-stage welcome/simple_path/remote_access_setup/review_setup_plan/automatic_preparation/ready shortcut. It does not fabricate a first Project or silently execute omitted setup. An explicit `project_disposition=deferred` on the guided path uses `deferred_project_stage_order`, leaves `project_id` and commit proof absent, and defers both provider phases. Do not turn later/Skip into a fake Project identity or a provider-readiness claim.

### Reversible draft, Settings-owned copy, and precommit source access

The durable session stores one closed setup_draft choice snapshot, not merely an unresolved pointer or a raw plan body. Its canonical bytes, draft identity and revision match the queued/reviewed plan binding; continuation/return projections keep references rather than duplicate the choices. The durable draft has its own `project_draft_ref` and revision, separate from any `project_id`, and remains `planned_only=true`, `applied=false`, and `project_created=false`. Before commit it may cache selections, read current Project metadata, browse folders/source listings, validate names/paths/permissions/free space/reachability/compatibility, resolve Server/storage/sync choices, and render Settings-owner transfer previews. Bounded owner reads and selected-source authentication are explicit exceptions to the predecessor blanket no-owner-work-before-Review rule. They do not permit destination creation/population, history initialization, repository creation, clone/import, Settings apply, Project sync/backup binding, or broad provider/agent work.

Start like another Project? appears only while creating a new Project and at least one eligible existing source Project is available; opening an already registered Project, connect-existing and Project Later do not offer or apply a copy. Start fresh is the default, and eligible Projects are ordered by recent use and compatibility. A selected source renders a short Settings-owned preview; Choose settings optionally opens the same canonical category selector. Onboarding never owns a second group list or copy engine. `SSYS-007` and `SSYS-036` own exact eligible IDs, source and draft revisions, proposed values, provenance, exclusions, explicit-choice precedence, validation, expiry, destination rebind, rollback and readback. New explicit Project choices win over copied defaults. Accounts/routes copy only where that contract permits; credentials stay with their owner. An account unavailable on the selected Host retains the intended route and a truthful later setup action, never an invented replacement. Files, history, Goals, Plans, and later source changes remain independent.

`ui.onboarding.open_owner_flow` before commit requires a current `onboarding_precommit_authorization`, an exact owner request/hash, selected source, draft/revision, permission/capability/consent refs, Server/Host/Environment, initiating active Client, return focus, expiry, and continuation generation. `owner_phase=read_only_preflight` permits only the admitted read-only owner request. `owner_phase=selected_source_auth` permits only authentication or verified official-page navigation necessary for that selected source. It does not open the full provider manager or ask about unrelated AI accounts. The owner must validate actual request semantics and authenticate the referenced fences; a structurally valid authorization value is not authority.

Source sign-in and official signup-page navigation reuse `cmd.auth_profile.sign_in` and `cmd.auth_profile.open_official_page`. The Auth owner supplies the narrowly bounded first-time source variant in `MACS-005` when no account/profile exists and the route requires no external CLI. It allocates real account/profile identity only after verification. Do not fabricate an installation, account, or Project to satisfy an older request schema. `cmd.integration.connection.add` and shared `cmd.authentication.start` currently require a real Project context and are not precommit shortcuts. Project-scoped connection activation/binding remains in the approved owner chain after identity reservation. Protected authentication remains human-only, ephemeral, non-recordable/non-inspectable, secret-owner controlled, and bound to the initiating active Client.

### One reviewed owner commit, then simple provider setup

Before enabling the final commit, revalidate stale source, path, account, Server, permission, capacity and compatibility checks and the Settings draft preview. Explain the exact changed choice instead of clearing unrelated draft work. The visible commit routes through Project System §3.1's existing exact command mapping, not `cmd.project.create`, a new Onboarding command, or a second generic wrapper. The Project-owned `onboarding_setup_binding` binds the reviewed plan/hash, draft identity/revision, explicit commit consent, preflight and optional Settings preview. Git clone, Jujutsu clone, SSH source and restore keep their distinct child owners and terminal receipt chains.

After the click, Project System may reserve the real never-reused identity needed by child owners. It lists the Project only after all required content/history/configuration/Settings work and readback have settled under the same commit, or rolls back/reports recovery failure without a half-ready row. Progress names the actual current phase; no percentage exists without an owner denominator. Idempotent replay returns the original owner result rather than creating another Project. The Project-owned `project_setup_commit_binding` is a read model over actual `ProjectActionResult` and terminal receipts, not a new physical receipt family or an Onboarding-written success flag.

`provider_setup` requires that exact binding and the actual Project ID. Show verified usable accounts automatically as Ready, prioritizing copied routes, then a small set of relevant choices with See all providers/search. Start with one account; Add another account is secondary. Keep distinct subscription/API billing pools visible in ordinary language, but never ask the user to choose SDK, ACP, bridge, headless mode, protocol, or telemetry adapter. Multiple internal adapters sharing one credential remain one visible account.

Detection is bounded/cached and prioritized by the selected Execution Host, copied routes, and likely installed products. Compatible installation plus usable credentials is verified and connected automatically; missing/expired credentials expose Sign In or Enter API Key. Only a selected canonical route requiring an external vendor CLI/host binary exposes explicit Install. It uses the vendor's official method, exact selected Host/Environment, provenance and compatibility verification before authentication; no silent first install or bundled CLI is inferred. Shipped SDK/bridge/runtime dependencies and API-only paths expose no provider-CLI Install control. The current provider/account catalog remains authoritative, not a second hard-coded Onboarding list. Ordinary actions Connect, Use This Installation, Use This Provider and Open Installer are absent.

Ready is derived from actual current owner account/route/entitlement/permission/capability and availability facts, not credential presence, cached installation, a timer, or UI selection. Usage may be exact, estimated, or unavailable; PM-observed usage does not become exact provider allowance. Multi-account setup never globally signs another account out. Remote install/auth still targets the selected Host and returns safely through the authorized Client. Free Models consumes `MS-118` through `MS-122`, preserves paid-first defaults and explicit saved top-10 ordering, and never creates its own credentials, silently reorders the list, or revives `cmd.onboarding.free_models.*`.

### Typed actions, persistence, and owner routing

The exact thirteen local IDs remain `ui.onboarding.start`, `ui.onboarding.next`, `ui.onboarding.back`, `ui.onboarding.close`, `ui.onboarding.skip`, `ui.onboarding.defer`, `ui.onboarding.open_details`, `ui.onboarding.more_ways`, `ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`, `ui.onboarding.run_automatic_preparation`, `ui.onboarding.choose_first_project`, and `ui.onboarding.finish`. New choices and phase fields use these same typed requests/results; no peer `cmd.onboarding.*`, help, provider, free-model, draft-commit, or Project wrapper command is introduced. A local choice/disclosure is not owner dispatch. Each explicit owner action has one exact existing command/owner route and its current permission/idempotency/return binding.

The v2 session, continuation, request/result, projection and migration contracts own phase persistence. They preserve path, applicable stage/history, draft identity/revision, queued/reviewed plan/hash, active owner phase, actual commit binding, provider/free-model progress and owner-result refs, continuation generation and exact focus. `pm.product_onboarding.action_result.v2` remains `applied|disabled|rejected` with closed local effects. Every local result has `owner_mutation_claimed=false` and no production receipt; actual effects and receipts belong to the owner result referenced by the continuation. Disabled/rejected actions dispatch nothing. Same-frame acknowledgement is not owner completion.

Before commit, Back edits the reversible draft. During a pending owner commit, cancellation/recovery is owner-controlled. After commit, Back never returns to an uncommitted draft or uncreates the Project; Free Models may return to provider setup, while later Project edits use the existing Project/Settings owner. Close/Escape persists a resumable non-completed session and returns focus. Skipping an optional provider phase is distinct from skipping the whole session. The visible escape copy is Skip, Close, and Skip Tour; retained `ui.onboarding.defer`/Do this later compatibility preserves the exact continuation without an extra mandatory visible action. Resume restores the draft before commit, or the unfinished provider phase with the same actual Project after commit. Reopening, rerunning, closing a branch, Client loss and navigation never replay or cancel completed owner work by implication.

Inline SVG `?` controls reuse `ui.onboarding.open_details`: stage disclosure uses `toggle_stage_details` with null scope/selection, and choice help uses `toggle_choice_explanation`, exact current stage, stable help-topic ref and expanded state. Both are ephemeral, same-stage, owner-route-free, keyboard reachable and accessibility linked; they persist no session and expose no protected content.

`pm.product_onboarding.automatic_preparation_owner_projection.v2` observes the approved Project/setup owner chain, not broad provider setup. It fences the exact reviewed revision/hash and next projection generation; stale/out-of-order work cannot replace a current projection or advance. Close/resume/reload re-observes the same owner operation/dedupe identity. Browser-concept fixtures are not production owner work, readiness, native execution, or receipts.

Durable state contains the closed bounded setup_draft user-choice snapshot, stable identities and owner refs, never raw keys/tokens/codes, authentication URLs, profile roots, transcripts, protected browser content or copied secrets. SP-252 consumes the existing onboarding_state family under its v3 session key with a deterministically bundled v2 owner value; this changes no physical-family/retention denominator and proves no native store or migration. Standalone authorization/preview/commit-binding values do not register physical families. Migration retains four-screen, five-stage, seven-stage and now nine-stage inputs only as lineage. Uncommitted drafts return to a fresh unconfirmed review; already committed rows resume provider setup only after their exact actual Project commit/owner refs are revalidated and recorded per-row in the disposition manifest. The migration's global null-review defaults describe unresolved drafts and do not fabricate approval for committed rows. Exact source/disposition/stage/path/committed-resume counts and the sole Storage migration receipt are mandatory; `owner_work_replayed=false`.

### Motion, responsiveness, Slint portability, and accessibility

The motion storyboard is restrained and cinematic: the interruptible opening hero assembles the Puppet Master identity into the workspace and settles once in approximately `1.2-1.5 seconds`; step transitions use `420-560 ms`; element choreography uses a `60-80 ms` stagger; microinteractions use `120-220 ms`; and the success moment settles in approximately `700 ms`. These durations describe visual completion only: every action acknowledges in the same frame, input is enabled immediately, and navigation never waits for animation. Use bounded opacity, translation, scale, clipping/masking, and vector layers with continuity of position and visual focus between stages. All transitions are interruptible, reversible, resize-safe, theme-switch-safe, and finish immediately at the correct semantic state on navigation, suspension, or interruption. The outgoing visual layer is always inert, stripped of duplicate IDs, and excluded from the focus census while it animates. Friendly, Basic, and Glass use distinct material-appropriate cinematic easing; Retro uses dedicated deliberate stepped opacity/translation keyframes, hard cuts, and compact pixel/terminal-style reveals without scale choreography. Decorative work stops when hidden/off-screen. Reduced Motion uses an immediate state change or a very short opacity settle while preserving hierarchy; low-resource mode removes ambient/prewarm work without removing choices or receipts. These essentials must be portable to Slint 1.17.1 properties, models, timelines, transforms, opacity, vector shapes, and clipping; DOM measurement, browser physics, Canvas/WebGL, heavy SVG filters, or blur-dependent storytelling cannot be required.

Every stage has a programmatic heading, path-correct progress derived from the applicable eleven-stage dependency graph, explicit deferred-project path, or six-stage connect-existing shortcut, concise description, one primary action, keyboard-reachable secondary action, persistent Back/Close/Escape semantics, visible focus, non-color state, and an announcement for async phase changes. Focus never moves because a background projection refreshes. Long/localized copy wraps without clipping; narrow layouts stack visually distinct choices while preserving primary-before-secondary order. A screen reader receives stage, decision, review-confirmation boundary, current owner work, wait reason, errors, and return outcome without decorative narration. Inline SVG help controls have stable accessible names and descriptions and never rely on hover alone.

### Guided Tour real-application contract — September 3 newbie-first correction

Guided Tour teaches through successful actions in this exact chapter order: Assistant Chat/Teacher -> workspace -> Planning Wizard. This accepted September 3 correction supersedes the September 1 Usage-first/Chat-final film and its no-resume/keep-Chat terminal rules; it does not revive the older five-chapter controller. It runs in the real application, never a tooltip carousel or parallel demo. The top controls contain `ELI5`, `Pause`, and always-available `Skip Tour`. A brief comfort introduction explains ELI5 and the Settings-owned Reduced Motion preference without becoming a separate chapter or requiring a Settings detour. ELI5 changes explanation detail; Guided Tour MUST NOT invent a separate Reduced Motion toggle.

The current chapter IDs are `chat_teacher`, `workspace`, and `planning_wizard`; stable step IDs belong to those chapters, with an optional non-action introduction. Assistant Chat opens first through its existing shell control. The learner selects Teacher, sends the supplied question `What happens before Puppet Master changes my files?` through the real composer, sees the local answer stream in that same conversation, and applies ELI5 to the same answer. The thread is labeled `Guided example`. ELI5 uses clearer adult language, shorter structure, and less assumed knowledge; forced analogies or baby talk are not required. The real Chat owner owns the messages and reply; the Tour controller stores refs, not chat content. Normal Chat send and ELI5 retain their domain owners; a local tour fixture must never fall through to a provider-backed send or claim a production receipt.

Workspace practice explains page navigation and panels, then asks for a real Chat move/dock and a real widget add, move, resize, or focus action. Manual practice and `Show Me` use the same mounted owner handler and success predicate. Every important action first brings its target into view, explains one outcome, offers Try it and visible Show Me, and acknowledges the observed result. Show Me adds interruptible pre-cue, visible travel, destination reaction, and settle around that handler; timers, narration, screenshot substitution, a second mutation implementation, and generic Next never satisfy an action checkpoint.

Planning Wizard owns at least half of meaningful actions and meaningful dwell time. It opens through its visible route; the local book-club practice goal becomes three outcomes (next meeting, current book, how to join). The learner answers who may update the meeting and book, can read why shared sign-in/editing depends on that answer, reviews outcomes/decisions/assumptions/unresolved choices, and edits one answer. Only the affected shared-access consequence changes; unaffected outcomes retain their identity and position. `I’m not sure yet` remains unresolved, never an implicit denial of shared access or a completed decision. The current real Wizard names and modes apply; example controls are scoped fixtures, not a replacement planning engine. Finish lands on the real Planning Wizard with the committed Project selected, removes the practice surface, and starts no live work. Tour completion does not grant approval or create a second approval fence.

The exact current typed tour actions are `ui.guided_tour.start`, `ui.guided_tour.next`, `ui.guided_tour.show_me`, `ui.guided_tour.back`, `ui.guided_tour.pause`, `ui.guided_tour.resume`, `ui.guided_tour.skip`, `ui.guided_tour.focus_route`, `ui.guided_tour.toggle_eli5`, `ui.guided_tour.finish`, and `ui.guided_tour.replay`. `focus_route` changes only the mounted application's visible page/focus; `show_me` orchestrates the current action rather than becoming its domain command. `next`/`back` move through valid story state but cannot satisfy required practice. `finish` carries the layout disposition, defaulting to `restore`; `keep` requires an explicit user selection, never an inferred default. This parameter does not revive separate `ui.guided_tour.restore_layout` or `ui.guided_tour.keep_layout` actions. Those predecessor tokens and `ui.guided_tour.toggle_reduced_motion` remain retired. Assistant Chat reuses `cmd.persona.select`, `cmd.chat.send`, and `cmd.chat.eli5.set`; concept-local `ui.assistant_chat.select_persona`, `ui.assistant_chat.send`, and `ui.assistant_chat.toggle_eli5` must not become competing production commands.

At start, Guided Tour captures stable owner refs for the pre-tour layout and Chat state (thread/selection, exact placeholder, draft, and focus), keeping docked and undocked views on shared state. Skip cancels tour choreography, restores the captured layout/Chat state, and returns focus to the initiating control or restored page heading without leaving a partial draft. Finish restores temporary state by default, or retains the demonstrated layout only after explicit Keep selection, then lands on Planning Wizard. Restoration failure is recoverable and cannot be reported as completed. Close/reload can resume the last safe step using a bounded checkpoint of session/Project/step identities, completed predicates, layout-owner snapshot ref, effective explanation mode, and revision; it stores no raw conversation, credential, or transient animation geometry. Resume revalidates owner state and returns to the earliest unsatisfied prerequisite without replaying domain work. Pause stops decorative work/subscriptions; Replay starts a fresh session. Settings exposes Replay Guided Tour separately from Run Onboarding Again and Doctor.

Every scene heading receives programmatic focus when that scene settles. Each callout measures its actual target after layout, clamps the callout and pointer to the usable viewport, and remeasures after page change, resize, scaling, localization, panel movement, or target geometry change. A missing or unreachable target pauses with a plain recovery action instead of pointing at empty space or auto-completing. Callouts do not steal focus from the heading or the learner's required control. Protected authentication content is excluded.

Tour motion preserves cause/effect through bounded interruptible pre-cue, travel, arrival, and settle. User action, resize, reversal, Skip, route return, or effective preference change lands in the correct semantic state. Reduced Motion retains sequence, focus, announcements, and action parity through restrained state transitions without long travel. Hidden/collapsed surfaces stop decorative work and duplicate subscriptions. All eight themes receive intentional materials, focus, contrast, and motion. Background interaction is blocked only where it would invalidate the current action. Low-resource or squeezed layouts retain every choice and recover honestly from an unreachable target.

Onboarding acceptance now requires the v2 eleven-stage dependency graph, unchanged six-stage connect shortcut, explicit Project-deferred path, Settings-owner draft preview/rebind/rollback, fenced first-time and existing-source authentication, one idempotent owner commit, postcommit provider/Free Models continuation, no-secret resume and predecessor migration, and exact thirteen-action request/result/return coverage. Static schemas and the named phase/draft-transfer tests establish value consistency only; six-width/eight-theme rendering, native owner dispatch, durability, restart, security, focus/accessibility, motion and full journeys remain unproved. This reconciles the separate September 3 Onboarding owner obligations without claiming that the unchanged concept or native application implements them.

Tour acceptance requires the current Chat -> workspace -> Planning sequence, every manual and Show Me path with shared owner predicates, measured zero provider requests and usage increments, same-answer ELI5, planning action/dwell shares of at least one half, a real answer edit with visible specific consequence, restore/default versus explicit Keep, safe checkpoint recovery, missing-target and restoration-failure negatives, keyboard/focus/geometry checks, all eight themes, constrained widths, and Reduced Motion. The historical v2 schemas/fixtures and their ten-action/Usage-first/Chat-final/no-resume assertions are superseded migration inputs. The current v3 schema and Final GUI consumer enforce the replacement static obligations and reject those predecessors; passing them cannot establish native/runtime, durable recovery, or visual acceptance. Checkpoint references and revalidation records require real owner implementations before they can be used as runtime evidence.

### PWIZ-021 - Product Onboarding draft-first state machine and connect-existing shortcut

```yaml
plan_unit_id: PWIZ-021
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: Product Onboarding owns the reversible draft-first eleven-stage semantic dependency graph and the
  unchanged six-stage connect-existing shortcut. Before the context-specific reviewed commit, only bounded read-only
  preflight and individually consented selected-source authentication may run. Project System commits the selected
  existing owner command and required child receipts once, including Settings-owned exact-ID copy/rebind and readback,
  before broad provider setup. The actual committed Project then enters provider_setup, optional free_models_setup
  and truthful Ready. Explicit Project deferral skips both provider phases without inventing a Project. UI choreography
  remains thirteen typed local actions, never an Onboarding backend or command family.
gui_related: true
gui_classification_reason: Defines the complete visible first-run flow, branching, copy density, actions, and state
  presentation.
depends_on:
- SIR-003
- PSB-001
- SRV-001
- SRV-004
- RAS-001
- BRS-001
- PJCT-001
- SCS-011
- SSYS-007
- SSYS-036
- PJCT-007
- MACS-005
- MS-122
unblocks: []
acceptance_criteria:
- The eleven exact ordered stage IDs consume product_onboarding_contracts.schema.json main_stage_order; Final GUI
  uses the same definitions. These are dependencies, not eleven forced equally complex screens.
- Connect-existing retains the exact six-stage shortcut, omits hidden Project/provider work, and claims Ready only
  from its reviewed usable owner route.
- The guided deferred-project path is explicit and has no Project identity/commit binding or provider-readiness
  claim.
- Before commit, selections, Project metadata/folder/source browsing, bounded read-only checks, and Settings draft
  previews leave no Project, destination files, history, repository, clone, sync or Settings mutation.
- Selected-source authentication is just-in-time, separately permission/consent/currentness/Client fenced, owner
  verified, and unrelated to broad AI-provider setup.
- Review shows source, destination, work computer, name, copy summary, privacy, skips and stale checks; Edit retains
  later still-valid choices.
- Create Project, Add Project or Restore Project commits the exact reviewed draft/hash through Project System 3.1,
  never cmd.project.create or cmd.source_control.repository.init.
- Project registration is listed/persisted only after required child-owner results and Settings readback; acknowledgement,
  provisional identity, partial work and cancelled/failed work are not completion.
- Idempotent replay returns the same committed Project and owner results; provider_setup requires the exact real
  Project binding.
- Detected usable accounts and copied routes appear first and become Ready after current owner verification without
  Connect/Use This Installation/Use This Provider/Open Installer.
- Only selected external vendor CLI paths offer explicit official-source Install on the selected Host; API/SDK/shipped
  dependency paths never invent a provider-CLI Install.
- Free Models is optional inside Onboarding after the paid-provider prompt, including after Skip; underlying account
  records and saved explicit model order remain canonical.
- Every local action preserves exact revision/generation/return context and never claims a production receipt or
  native owner success.
- Back is reversible before commit and cannot uncreate a committed Project; Close/resume preserves draft or unfinished
  provider phase, and optional skip differs from whole-session Skip.
- Help/disclosures are bounded ephemeral typed local actions; source and provider owner commands remain separately
  typed and permission bound.
- Ready starts no Goals, Plans, agents, builds or provider requests; optional Guided Tour follows PWIZ-023.
validation_surfaces:
- Plans/product_onboarding_contracts.schema.json
- Plans/product_onboarding_contract_fixtures.json
- tests/test_pm_onboarding_phases.py
- tests/test_pm_settings_draft_transfer.py
- future native owner-routing, restart, accessibility and visual/motion receipts; not_run
risk_class: onboarding_parallel_owner_or_overloaded_first_run
reasoning_tier: high
context_scope: product_onboarding_owner_and_flow
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/product_onboarding_contracts.schema.json
node_compile_hint:
  mode: product_onboarding_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_report:register-settings-onboarding.md#1E
- source_report:register-fullthread.md#R-063
- source_packet:PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/01_CANONICAL_NEWBIE_FLOW.md
- source_packet:PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/02_PROJECT_DRAFT_COPY_AND_COMMIT.md
- source_packet:PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/03_SIMPLE_PROVIDER_SETUP_AFTER_PROJECT.md
negative_constraints:
- Do not create a Project, destination, history, repository, clone/import, Settings apply, sync/backup binding or
  broad provider work before the reviewed commit.
- Do not treat selected-source auth consent as broad provider, repository or Project authority.
- Do not fabricate Project/account/profile/installation identities or copy secrets.
- Do not add an Onboarding engine, command family, wrapper command, second Settings copy catalog or Free Models
  credential model.
- Do not restore provider-first/four/five/seven/nine-stage predecessors as current producers.
- Do not synthesize readiness or progress from time, cache or UI state.
- Do not turn the modal into a full-page route or nested-modal manager.
- Do not claim native/runtime, recovery, security, visual or motion proof from static fixtures.
```

### PWIZ-022 - Product Onboarding motion, accessibility, and migration

```yaml
plan_unit_id: PWIZ-022
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: Product Onboarding uses one bounded modal window over the visibly preserved live application, bounded
  interruptible Slint-portable motion, deterministic Reduced Motion and low-resource equivalents, exact path-correct
  progress and keyboard/focus/Back/Close/Escape semantics, no-secret revisioned persistence, and receipt-backed
  migration from legacy provider-first, five-stage, seven-stage and predecessor nine-stage records without fabricating
  review or replaying owner mutations; already committed rows resume only after real Project-owner revalidation;
  it never becomes a full-page route or nested-modal owner branch.
gui_related: true
gui_classification_reason: Defines user-visible motion, responsive layout, focus, copy, error, resume, and migration
  behavior.
depends_on:
- PWIZ-021
unblocks: []
acceptance_criteria:
- The setup flow remains one bounded modal with explicit outer margin, modal chrome, an input-blocking scrim that
  also inerts late-mounted body siblings, exactly one dialog accessibility surface named by the active stage or
  branch, an inert/ID-clean outgoing visual layer, focus containment, and exact initiating-control return (or verified
  active-application-tab return for automatic first-run open) across desktop, narrow, and short windows.
- 'Progress and accessibility announcements use the exact active path denominator: the current eleven-stage semantic
  graph, its explicit Project-deferred variant, and six-stage connect-existing shortcut.'
- Close dismisses without completion, Skip records an explicit skipped session, Defer persists the exact resumable
  continuation before dismissal, and Details remains an ephemeral same-stage disclosure with no owner command.
- The modal adds no route-history or breadcrumb chrome; typed Back remains local to its bounded stage/branch presentation.
- The approximately `1.2-1.5 second` hero, `420-560 ms` step transitions, `60-80 ms` choreography stagger, `120-220
  ms` microinteractions, approximately `700 ms` success settle, same-frame acknowledgement, interruption, reversal,
  resize, theme-switch, Retro stepped treatment, and reduced-motion settle are deterministic; the modal entrance
  keeps its layout bounds fixed and uses opacity/clipping so cross-family theme changes cannot push it outside the
  required outer margin.
- Focus and screen-reader output follow semantic stage state and never background refresh order; the modal releases
  inertness before Guided Tour starts, and a failed Tour start restores the transferred application focus target
  without claiming a successful handoff.
- Legacy migration preserves decisions, warnings, and valid owner receipts, maps unresolved work into the nine-/six-stage
  draft, requires an unconfirmed Review Setup Plan, and never reruns owner work.
- The one-time domain migration receipt references the canonical storage migration receipt and reports exact accepted,
  stale, dropped, quarantined, per-stage, and per-path counts without storing secret bytes.
validation_surfaces:
- Concepts/pm7-tools/onboarding_cinematic_source.py static assertions
- Concepts/pm7-tools/verify/onboarding_cinematic.mjs browser-concept verifier
- future native six-width visual fixtures
- Reduced Motion traces
- keyboard and screen-reader fixtures
- legacy migration fixtures
- tests/test_pm_onboarding_phases.py
risk_class: onboarding_motion_or_resume_state_loss
reasoning_tier: high
context_scope: onboarding_presentation_and_persistence
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/product_onboarding_contracts.schema.json
node_compile_hint:
  mode: onboarding_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_report:wave3-lane2.md#S0098
negative_constraints:
- Do not block input on animation.
- Do not require browser-only effects.
- Do not overwrite saved Project or application layout.
- Do not migrate an unresolved draft directly into confirmed Review or Automatic Preparation; do not replay completed
  Project work when a verified committed row resumes provider setup.
```

### PWIZ-023 - Guided Tour newbie-first real-application practice

```yaml
plan_unit_id: PWIZ-023
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Guided Tour is an optional Onboarding handoff in exact Assistant Chat/Teacher, workspace, Planning Wizard order.
  The learner sends the supplied local question, reads Teacher's same-conversation answer, and applies ELI5 to it;
  moves Chat and performs a real widget action; then describes the book-club goal, answers a meaningful question,
  reviews the plan, edits an answer, and sees the specific consequence before the approval boundary. Planning owns
  at least half of meaningful actions and dwell time. Try it and Show Me share each mounted owner's handler and
  success predicate. Tour state never grants approval or starts work. ELI5, Pause, Skip, Back, safe-step resume,
  Settings-owned Reduced Motion, measured callouts, and focused headings remain usable. Skip restores captured state;
  Finish restores temporary layout by default or keeps it only on explicit selection, then lands on the real
  Planning Wizard with the committed Project selected. Both predecessor controllers remain source lineage only.
gui_related: true
gui_classification_reason: Defines the three-chapter practice flow, real-application interactions, motion, controls, callouts, focus, and exit state.
depends_on: [PWIZ-021, ACD-431]
unblocks: []
acceptance_criteria:
  - The exact chapter order is `chat_teacher`, `workspace`, `planning_wizard`; neither the five-chapter controller nor Usage-first/Chat-final v2 is current.
  - The top controls place `ELI5` beside `Pause` and `Skip Tour`, and the short opening explains ELI5 and Reduced Motion together.
  - Reduced Motion uses the effective preference; adjustment routes to Settings and there is no Guided Tour-specific motion toggle.
  - Chat opens first; the supplied question is sent through the real composer, the deterministic answer streams in the same labeled conversation, and ELI5 rewrites that answer without changing its facts.
  - Manual and Show Me practice share the same existing owner action and success predicate for Chat movement and a real widget action; choreography never invents success.
  - Planning Wizard receives at least half of meaningful actions and dwell time, including goal, outcomes, meaningful answer, why, review, answer edit, and the specific shared-access consequence with unaffected outcomes held still.
  - Unknown editor access remains unresolved; the tour uses the real Wizard names/modes and ends before approval with no work started.
  - The deterministic novice reply never silently falls back to a provider, model, token, or AI plan.
  - Every scene heading receives programmatic focus, and every callout measures, clamps, and remeasures its actual target across resize, scale, localization, movement, and route changes.
  - Skip is always available and restores layout, Chat state, and focus; Finish defaults to restoration, accepts Keep only by explicit selection, and lands on the real Planning Wizard with the committed Project selected.
  - Close/reload resumes the last safe checkpoint after owner-state revalidation without replaying work; checkpoints carry stable refs and never raw chat content, secrets, or transient animation geometry.
  - Reduced Motion, low-resource, missing-target, squeezed-layout, interruption, process-exit, and replay states are covered.
validation_surfaces: [Plans/guided_tour_contracts.schema.json, Plans/guided_tour_contract_fixtures.json, real-application action observation, callout geometry, focus, Skip-restore, and completion-layout fixtures]
risk_class: tour_fake_shell_or_layout_loss
reasoning_tier: high
context_scope: guided_tour_newbie_first_real_application
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/guided_tour_contracts.schema.json]
node_compile_hint: {mode: guided_tour_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:register-settings-onboarding.md#O-07"
  - "source_report:wave3-lane2.md#S0095"
  - "source_packet:PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/04_GUIDED_TOUR_REBUILD.md"
  - "source_packet:PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/05_DEMO_SCRIPT_AND_COPY_STANDARD.md"
  - "source_packet:PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/06_IMPLEMENTATION_ACCEPTANCE_AND_IMPACTS.md"
negative_constraints: [Do not restore either predecessor controller., Do not restore ui.guided_tour.restore_layout or ui.guided_tour.keep_layout as separate current actions., Do not build a tooltip carousel or parallel demo., Do not use provider credentials or tokens., Do not fabricate action success., Do not add a Guided Tour-specific Reduced Motion toggle., Do not let callouts escape the viewport or point at stale geometry., Do not keep a demonstrated layout without explicit selection., Do not leave a partial composer draft after Skip., Do not expose protected authentication content., Do not promote local page/focus presentation into a domain command or handler., Do not treat fixture completion as runtime certification or approval to begin work.]
```
