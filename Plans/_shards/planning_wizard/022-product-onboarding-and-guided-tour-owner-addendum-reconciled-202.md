# Shard 022: Product Onboarding and Guided Tour owner addendum (reconciled 2026-09-01)

Source: `Plans/Planning_Wizard.md`

Source lines: L1763-L1967

Source SHA256: `e3bd3e17e5ca0dce00a6b7b6776eeec9d67cb2c4283fa8706b180dbfe4604dce`

---

## Product Onboarding and Guided Tour owner addendum (reconciled 2026-09-01)

This addendum supersedes PWIZ-017's four-screen/provider-first choreography and the 2026-08-31 seven-stage Onboarding and five-chapter Guided Tour proposal. PWIZ-021 through PWIZ-023 retain their PlanUnit identities and source refs while carrying the current design below. Product Onboarding is a distinct pre-application state machine owned here; Installation/Deployment, Server Claim/Bootstrap, Discovery/Pairing/Remote Access, provider installation/authentication, Project registration/content movement, Source Control, updates, backup/restore, and Doctor retain their own engines. Planning Wizard receives the final setup handoff but is not the Onboarding state store. `Plans/product_onboarding_contracts.schema.json`, `Plans/guided_tour_contracts.schema.json`, and their fixtures are downstream machine-contract consumers: Onboarding's seven-stage and no-current-`simple_path` values and both predecessor tour controllers are migration inputs, not current authority. For Guided Tour, the September 3 correction below and PWIZ-023 now own Chat-first/Planning-final, default restoration or explicit Keep, and safe-step resume; the conflicting v2 schema values cannot override that correction.

### Product-design law

Product Onboarding MUST feel simple, beautiful, cinematic, and calm. Each stage asks one decision, has one visually dominant CTA, and shows no more than two prominent choices. Additional valid choices live behind a clearly named secondary disclosure such as `More ways`; disclosure never changes a selection or starts work. Advanced configuration is not embedded in Onboarding: `Advanced settings` routes to the exact owner Settings manager and returns through the same continuation context. Before review confirmation, automatic detection is limited to safe cached projections. Copy is concise and human: visible headings and choices explain the outcome in ordinary language, while internal tool names, connection details, ports, package provenance, fingerprints, raw authentication state, and topology generations stay in Details. The primary copy never asks a beginner to understand source-control jargon or developer terminology.

The full nine-stage path and the connect-existing six-stage shortcut are presented in one bounded modal window over a theme-aware input-blocking scrim. The live Puppet Master application remains visibly present behind the modal so setup reads as a short guided interruption, never a full-page route or substitute application. Desktop layouts keep clear space around the modal. Narrow and short layouts may approach the viewport bounds only while retaining an explicit outer margin, modal border/chrome, one `role=dialog`/`aria-modal=true` accessibility surface, focus containment, and exact Close/Escape return to the initiating application control. Branches replace the modal interior only; they do not open a nested modal or full-page subflow.

The nine canonical stages, in exact order, are:

1. `welcome` (`Welcome`) — explain the outcome in one short sentence; dominant CTA `Get Started`; secondary `Skip`.
2. `simple_path` (`Choose your setup`) — choose either the ordinary guided setup or `Connect to an existing Puppet Master`. The choice is recorded locally and advances immediately; it performs no discovery, pairing, sign-in, installation, creation, or network work.
3. `first_project` (`First Project`) — on the ordinary path, choose `Start a new project` or `Open one I already have`; `Other project options` reveals less-common origins. This stage records the intended Project action but does not create, open, clone, restore, or register anything yet.
4. `source_control_setup` (`Safe History`) — on the ordinary path, explain that Safe History keeps recoverable versions on the selected work computer and that an online copy is separate and optional. Internal backend and service names may appear only in plain-language Details. The stage records the local-history and optional-online-copy plan but does not initialize, bind, clone, publish, authenticate, or create an online repository.
5. `server_storage_client` (`Where your work lives`) — on the ordinary path, choose in plain language where work runs, where its data is kept, and which device is being used now. Cached known choices may be suggested, but discovery, pairing, setup, restore, storage movement, and trust work remain deferred.
6. `remote_access_setup` (`Use it while away`) — on both paths, choose the safe supported private-access plan or `Not now`; public/manual details remain behind progressive disclosure. The stage records intent only and never claims that a route exists.
7. `review_setup_plan` (`Review your setup`) — on both paths, show one concise, editable summary of every selected action, skipped item, destination, privacy consequence, and what Puppet Master will do. `Confirm and prepare` is the sole setup-plan confirmation boundary. Before it is activated, Onboarding may persist only its local draft and read cached projections; it MUST NOT probe the network or dispatch installation, authentication, pairing, trust, restore, Project, history, online-copy, storage, Remote Access, provider, update, or other external owner work.
8. `automatic_preparation` (`Getting things ready`) — only after the current review is explicitly confirmed, dispatch the approved work through the canonical owners and observe their real progress, questions, results, and receipts. A question that only an owner can resolve may be shown here without silently expanding the confirmed plan. Protected authentication remains human-only and bound to the exact initiating active Client.
9. `ready` (`Ready`) — show a compact truthful completion state and one dominant `Enter Puppet Master` CTA. `Take the Guided Tour` is secondary and optional. Ready means only that the confirmed setup plan reached its truthful handoff; it does not claim skipped or failed owner work is healthy or complete.

The connect-existing shortcut uses exactly `welcome` -> `simple_path` -> `remote_access_setup` -> `review_setup_plan` -> `automatic_preparation` -> `ready`. After an explicit route choice, it may consume cached identity/setup projections, already-detected account or session status, known endpoints, and owner-bounded read-only nearby discovery for the selected existing Puppet Master. It records any connection or access work as part of the draft and skips `first_project`, `source_control_setup`, and `server_storage_client`; it never performs hidden authentication, pairing, configuration, or setup in place of the omitted stages. Review confirmation remains mandatory before any state-changing or protected operation begins.

Selecting a choice card records that choice in the local draft and advances to the next applicable stage immediately. It does not dispatch owner work. `Confirm and prepare` at `review_setup_plan` validates the current revision and dispatches the approved owner work exactly once through the fenced `OnboardingReturnContext`; `automatic_preparation` observes that work and advances only from current terminal results. Necessary trust, authentication, destructive, privacy, or restore questions remain explicit after confirmation, but an unchanged setup plan is never reconfirmed. Failed, cancelled, stale, or interrupted owner results stay in preparation with one plain-language recovery action.

`Back`, `Close`, `Skip`, `Do this later`, cancel, and resume are always responsive. `Close` is a non-completion dismissal: it closes the modal and restores the initiating focus without marking the session completed, skipped, deferred, or any owner Ready. `Skip` records the explicit `skipped` session outcome without asserting readiness. `Do this later` dispatches `ui.onboarding.defer`; it durably writes a resumable continuation snapshot containing the exact current stage, selected path, active owner branch, bounded stage history, revision, continuation generation, initiating Client, and return-focus identity before the modal closes. Resume restores that exact continuation rather than restarting or inferring a new path. `Details` is an ephemeral same-stage disclosure: opening or closing it writes no `OnboardingSession`, launches no owner route or command, and returns focus to its toggle. Rerun from Settings does not erase completed owner work. Browser/app/Client/Server/network round trips return to the initiating stage only when `expected_revision`, `continuation_generation`, and target identities still match. A stale return is rejected and shown as `This setup changed. Review the latest state.` No browser/route Back or breadcrumb chrome is added; the existing typed `Back` control changes only the bounded Onboarding stage/owner-branch presentation.

### Typed actions, persistence, and owner routing

The thirteen typed local UI action IDs remain `ui.onboarding.start`, `ui.onboarding.next`, `ui.onboarding.back`, `ui.onboarding.close`, `ui.onboarding.skip`, `ui.onboarding.defer`, `ui.onboarding.open_details`, `ui.onboarding.more_ways`, `ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`, `ui.onboarding.run_automatic_preparation`, `ui.onboarding.choose_first_project`, and `ui.onboarding.finish`. `ui.onboarding.choose_simple_path` is a current visible action at the current `simple_path` stage. Choice and navigation actions before review change only the local draft. `ui.onboarding.open_owner_flow` may dispatch setup owner work only from a current confirmed `review_setup_plan` revision, and `ui.onboarding.run_automatic_preparation` may begin only for that confirmed plan. No `cmd.onboarding.*` family is created. The packet candidate command tokens remain rejected as commands, aliases, and handlers.

`OnboardingSession`, `OnboardingReturnContext`, `OnboardingActionRequest`, `OnboardingActionResult`, and `OnboardingLegacyMigrationReceipt` are consumed from the product-onboarding machine contract. The session and continuation preserve the chosen `path_kind=guided_setup|connect_existing`, all nine current stage IDs, the exact six-stage shortcut, local Safe History and optional online-copy selections, review revision and confirmation state, and owner truth/receipts after dispatch. A request binds one typed action to its action instance, current path and stage, expected revision, continuation generation, bounded choice, normalized secret-free local context, actor, idempotency key, source surface, and return-focus identity. Before a matching review confirmation, any request carrying an owner route or external-work intent is rejected with no dispatch or write beyond the local draft. Whole-session Skip remains distinct from an optional Project or Remote Access choice.

Every inline SVG `?` explanation control reuses `ui.onboarding.open_details`; no tooltip-only, untyped click, or new help command is created. Stage Details uses `intent=toggle_stage_details`, `scope=null`, and `selection_ref=null`. Choice help uses `intent=toggle_choice_explanation`, `scope=<exact current stage>`, `selection_ref=<stable help_topic_id>`, and exact `expanded=true|false`. Both forms are ephemeral, same-stage, owner-route-free, non-persistent, keyboard reachable, and accessibility-linked to the option they explain. Help copy uses familiar examples and explains local Safe History, Git, Jujutsu, online copies, accounts, Servers, and Remote Access without assuming prior coding or IDE knowledge.

The canonical result is `pm.product_onboarding.action_result.v1`; it returns `applied|disabled|rejected`, exact before/after stage and session status, one closed local effect, whether the draft was written, an optional continuation snapshot, ephemeral Details state, optional post-review owner route/operation refs, error/disabled reason, focus return, revision, and continuation generation. Pre-review results require `owner_mutation_claimed=false`, no owner route, and no production receipt. Disabled and rejected results have `local_effect=none`, dispatch no owner route, carry no production receipt, and expose an exact error plus disabled reason. Applied `defer` requires the durable continuation write; applied `open_details` remains same-stage and non-persistent.

Automatic Preparation consumes one closed `pm.product_onboarding.automatic_preparation_owner_projection.v1` record rather than a page timer, synthetic checklist, or inferred percentage. The projection additionally binds the exact confirmed review revision and approved setup-plan hash. The accepting boundary independently compares every fence identity; an unconfirmed, stale, expanded, or mismatched plan cannot dispatch, replace the last accepted state, or advance the stage. Determinate progress requires an owner denominator and named progress source; otherwise the UI remains indeterminate and exposes no fabricated percentage. `ready` advances only after current accepted owner projections truthfully settle the confirmed plan. Close, Defer, resume, reload, and view changes preserve the same owner operations and observe them by dedupe key; retry re-observes rather than starts duplicates. Browser-concept fixtures never claim production owner work, readiness, native execution, or a production receipt.

Durable state stores only stable identities, owner refs, path, stage, local draft selections, decisions, review revision/confirmation/hash, continuation generation, bounded warnings, receipt refs, and layout/tour handoff refs. It stores no raw transcript, key, token, authentication URL/code, credential, profile root, broad local path, or protected authentication content. The one-time domain migration receipt references the canonical storage migration receipt and reports exact accepted, stale, dropped, quarantined, per-stage, and per-path counts with `owner_work_replayed=false`. Legacy four-screen/provider-first, five-stage, and superseded seven-stage records migrate by preserving completed decisions and receipts, mapping unresolved work to the first applicable current stage, and forcing review of the resulting draft; migration never auto-confirms review or replays owner work. The predecessor meaning of `simple_path` as non-current is retired: a compatible saved choice now maps to the current stage, while ambiguous rows remain warnings.

Owner routes remain strict across both phases: before review confirmation, Onboarding may request only owner-defined read-only Server endpoint discovery/projection and consume cached/already-detected owner state; this phase neither authenticates nor changes the discovered system, network, account, repository, route, or local machine and performs no live repository lookup. After confirmation, approved First Project, Safe History/online copy, Server/Storage/Client, Remote Access, restore, provider, and authentication intents dispatch only through their canonical owners, and `automatic_preparation` observes their `ObservableWork`, terminal results, and receipts. No choice silently dispatches state-changing work, and no second generic confirmation is synthesized after review. Onboarding never implements installer, package manager, pairing authority, history engine, online-service adapter, account creation, authentication broker, secret store, storage, route supervision, Project movement, backup/restore, update, health, or repair behavior.

### Motion, responsiveness, Slint portability, and accessibility

The motion storyboard is restrained and cinematic: the interruptible opening hero assembles the Puppet Master identity into the workspace and settles once in approximately `1.2-1.5 seconds`; step transitions use `420-560 ms`; element choreography uses a `60-80 ms` stagger; microinteractions use `120-220 ms`; and the success moment settles in approximately `700 ms`. These durations describe visual completion only: every action acknowledges in the same frame, input is enabled immediately, and navigation never waits for animation. Use bounded opacity, translation, scale, clipping/masking, and vector layers with continuity of position and visual focus between stages. All transitions are interruptible, reversible, resize-safe, theme-switch-safe, and finish immediately at the correct semantic state on navigation, suspension, or interruption. The outgoing visual layer is always inert, stripped of duplicate IDs, and excluded from the focus census while it animates. Friendly, Basic, and Glass use distinct material-appropriate cinematic easing; Retro uses dedicated deliberate stepped opacity/translation keyframes, hard cuts, and compact pixel/terminal-style reveals without scale choreography. Decorative work stops when hidden/off-screen. Reduced Motion uses an immediate state change or a very short opacity settle while preserving hierarchy; low-resource mode removes ambient/prewarm work without removing choices or receipts. These essentials must be portable to Slint 1.17.1 properties, models, timelines, transforms, opacity, vector shapes, and clipping; DOM measurement, browser physics, Canvas/WebGL, heavy SVG filters, or blur-dependent storytelling cannot be required.

Every stage has a programmatic heading, path-correct progress text (`Step n of 9` or `Step n of 6`), concise description, one primary action, keyboard-reachable secondary action, persistent Back/Close/Escape semantics, visible focus, non-color state, and an announcement for async phase changes. Focus never moves because a background projection refreshes. Long/localized copy wraps without clipping; narrow layouts stack visually distinct choices while preserving primary-before-secondary order. A screen reader receives stage, decision, review-confirmation boundary, current owner work, wait reason, errors, and return outcome without decorative narration. Inline SVG help controls have stable accessible names and descriptions and never rely on hover alone.

### Guided Tour real-application contract — September 3 newbie-first correction

Guided Tour teaches through successful actions in this exact chapter order: Assistant Chat/Teacher -> workspace -> Planning Wizard. This accepted September 3 correction supersedes the September 1 Usage-first/Chat-final film and its no-resume/keep-Chat terminal rules; it does not revive the older five-chapter controller. It runs in the real application, never a tooltip carousel or parallel demo. The top controls contain `ELI5`, `Pause`, and always-available `Skip Tour`. A brief comfort introduction explains ELI5 and the Settings-owned Reduced Motion preference without becoming a separate chapter or requiring a Settings detour. ELI5 changes explanation detail; Guided Tour MUST NOT invent a separate Reduced Motion toggle.

The current chapter IDs are `chat_teacher`, `workspace`, and `planning_wizard`; stable step IDs belong to those chapters, with an optional non-action introduction. Assistant Chat opens first through its existing shell control. The learner selects Teacher, sends the supplied question `What happens before Puppet Master changes my files?` through the real composer, sees the local answer stream in that same conversation, and applies ELI5 to the same answer. The thread is labeled `Guided example`. ELI5 uses clearer adult language, shorter structure, and less assumed knowledge; forced analogies or baby talk are not required. The real Chat owner owns the messages and reply; the Tour controller stores refs, not chat content. Normal Chat send and ELI5 retain their domain owners; a local tour fixture must never fall through to a provider-backed send or claim a production receipt.

Workspace practice explains page navigation and panels, then asks for a real Chat move/dock and a real widget add, move, resize, or focus action. Manual practice and `Show Me` use the same mounted owner handler and success predicate. Every important action first brings its target into view, explains one outcome, offers Try it and visible Show Me, and acknowledges the observed result. Show Me adds interruptible pre-cue, visible travel, destination reaction, and settle around that handler; timers, narration, screenshot substitution, a second mutation implementation, and generic Next never satisfy an action checkpoint.

Planning Wizard owns at least half of meaningful actions and meaningful dwell time. It opens through its visible route; the local book-club practice goal becomes three outcomes (next meeting, current book, how to join). The learner answers who may update the meeting and book, can read why shared sign-in/editing depends on that answer, reviews outcomes/decisions/assumptions/unresolved choices, and edits one answer. Only the affected shared-access consequence changes; unaffected outcomes retain their identity and position. `I’m not sure yet` remains unresolved, never an implicit denial of shared access or a completed decision. The current real Wizard names and modes apply; example controls are scoped fixtures, not a replacement planning engine. Finish lands on the real Planning Wizard with the committed Project selected, removes the practice surface, and starts no live work. Tour completion does not grant approval or create a second approval fence.

The exact current typed tour actions are `ui.guided_tour.start`, `ui.guided_tour.next`, `ui.guided_tour.show_me`, `ui.guided_tour.back`, `ui.guided_tour.pause`, `ui.guided_tour.resume`, `ui.guided_tour.skip`, `ui.guided_tour.focus_route`, `ui.guided_tour.toggle_eli5`, `ui.guided_tour.finish`, and `ui.guided_tour.replay`. `focus_route` changes only the mounted application's visible page/focus; `show_me` orchestrates the current action rather than becoming its domain command. `next`/`back` move through valid story state but cannot satisfy required practice. `finish` carries the layout disposition, defaulting to `restore`; `keep` requires an explicit user selection, never an inferred default. This parameter does not revive separate `ui.guided_tour.restore_layout` or `ui.guided_tour.keep_layout` actions. Those predecessor tokens and `ui.guided_tour.toggle_reduced_motion` remain retired. Assistant Chat reuses `cmd.persona.select`, `cmd.chat.send`, and `cmd.chat.eli5.set`; concept-local `ui.assistant_chat.select_persona`, `ui.assistant_chat.send`, and `ui.assistant_chat.toggle_eli5` must not become competing production commands.

At start, Guided Tour captures stable owner refs for the pre-tour layout and Chat state (thread/selection, exact placeholder, draft, and focus), keeping docked and undocked views on shared state. Skip cancels tour choreography, restores the captured layout/Chat state, and returns focus to the initiating control or restored page heading without leaving a partial draft. Finish restores temporary state by default, or retains the demonstrated layout only after explicit Keep selection, then lands on Planning Wizard. Restoration failure is recoverable and cannot be reported as completed. Close/reload can resume the last safe step using a bounded checkpoint of session/Project/step identities, completed predicates, layout-owner snapshot ref, effective explanation mode, and revision; it stores no raw conversation, credential, or transient animation geometry. Resume revalidates owner state and returns to the earliest unsatisfied prerequisite without replaying domain work. Pause stops decorative work/subscriptions; Replay starts a fresh session. Settings exposes Replay Guided Tour separately from Run Onboarding Again and Doctor.

Every scene heading receives programmatic focus when that scene settles. Each callout measures its actual target after layout, clamps the callout and pointer to the usable viewport, and remeasures after page change, resize, scaling, localization, panel movement, or target geometry change. A missing or unreachable target pauses with a plain recovery action instead of pointing at empty space or auto-completing. Callouts do not steal focus from the heading or the learner's required control. Protected authentication content is excluded.

Tour motion preserves cause/effect through bounded interruptible pre-cue, travel, arrival, and settle. User action, resize, reversal, Skip, route return, or effective preference change lands in the correct semantic state. Reduced Motion retains sequence, focus, announcements, and action parity through restrained state transitions without long travel. Hidden/collapsed surfaces stop decorative work and duplicate subscriptions. All eight themes receive intentional materials, focus, contrast, and motion. Background interaction is blocked only where it would invalidate the current action. Low-resource or squeezed layouts retain every choice and recover honestly from an unreachable target.

Onboarding acceptance for the preceding owner revision requires positive and negative fixtures for the exact nine-stage primary order and exact six-stage connect-existing order; a current visible `simple_path`; the hard no-side-effect-before-current-review-confirmation fence plus bounded pre-Review read-only discovery/projection; current-review one-dispatch behavior; migration of four-screen, five-stage, and superseded seven-stage records without auto-confirmation or replay; path-correct progress; no-secret persistence; keyboard/screen-reader/focus tests; six-width and eight-theme rendering; interruption/reversal/resize tests; and truthful Ready semantics. This Guided Tour correction does not silently reconcile the separate September 3 Onboarding migration.

Tour acceptance requires the current Chat -> workspace -> Planning sequence, every manual and Show Me path with shared owner predicates, measured zero provider requests and usage increments, same-answer ELI5, planning action/dwell shares of at least one half, a real answer edit with visible specific consequence, restore/default versus explicit Keep, safe checkpoint recovery, missing-target and restoration-failure negatives, keyboard/focus/geometry checks, all eight themes, constrained widths, and Reduced Motion. The v2 schemas/fixtures and their ten-action/Usage-first/Chat-final/no-resume assertions are migration inputs only until reconciled to this revision; passing them cannot establish current acceptance. Static schemas, fixtures, and browser concepts are not native runtime or visual-acceptance proof.

### PWIZ-021 - Product Onboarding nine-stage state machine and connect-existing shortcut

```yaml
plan_unit_id: PWIZ-021
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Product Onboarding owns the durable nine-stage
  welcome/simple_path/first_project/source_control_setup/server_storage_client/remote_access_setup/review_setup_plan/automatic_preparation/ready
  path and the exact six-stage welcome/simple_path/remote_access_setup/review_setup_plan/automatic_preparation/ready
  connect-existing shortcut. Pre-review choices update the local draft and may consume cached owner data, nearby/known
  Server endpoint projections, already-detected account/session status, and explicitly non-authenticating read-only
  discovery. Pairing, authentication, live repository lookup/creation/binding, restore execution, Server/network
  configuration, filesystem writes, and every other side effect remain deferred until the user confirms the current
  Review Setup Plan.
  Automatic Preparation then dispatches the approved
  plan once through canonical owners and observes real results and receipts. Visible copy remains concise and novice-safe,
  while internal implementation terms stay in plain-language Details. The superseded seven-stage flow is source lineage.
gui_related: true
gui_classification_reason: Defines the complete visible first-run flow, branching, copy density, actions, and state presentation.
depends_on: [SIR-003, PSB-001, SRV-001, SRV-004, RAS-001, BRS-001, PJCT-001, SCS-011]
unblocks: []
acceptance_criteria:
  - The nine exact stage IDs and order are `welcome`, `simple_path`, `first_project`, `source_control_setup`, `server_storage_client`, `remote_access_setup`, `review_setup_plan`, `automatic_preparation`, and `ready`.
  - The connect-existing shortcut is exactly `welcome`, `simple_path`, `remote_access_setup`, `review_setup_plan`, `automatic_preparation`, and `ready`; it omits, rather than silently executes, the three ordinary-path setup stages.
  - "`simple_path` and `ui.onboarding.choose_simple_path` are current visible behavior; their predecessor-only disposition is retired."
  - The four-screen/provider-first, five-stage, and seven-stage flows are migration/source lineage only and cannot drive current GUI order, stage counts, or progress text.
  - Before the current `review_setup_plan` revision is confirmed, choices perform local draft transitions and may consume cached owner data, already-detected account/session status, known endpoint projections, and owner-defined read-only Local/VPN or already-active Tailscale discovery that performs no authentication and changes no external state.
  - Installation, authentication, pairing, trust, restore, Project creation/open/registration, local-history setup, online-copy setup, Server, storage movement, Remote Access, provider, update, and all other external work remain deferred until review confirmation.
  - "`Confirm and prepare` validates the path, revision, choices, consequences, and approved-plan hash, then dispatches the approved work once; stale, unconfirmed, or expanded plans dispatch nothing."
  - First Project, Safe History/optional online copy, where-work-lives, Remote Access, restore, and provider work execute only through their canonical owners after confirmation.
  - Safe History is explained as recoverable versions on the selected work computer; an online copy is separately explained and optional, with implementation names confined to Details.
  - A remote protected-auth handoff opens and returns only through the initiating active Client; missing, inactive, disconnected, or mismatched Client identity blocks or interrupts it.
  - Automatic Preparation accepts only current owner projections bound to the confirmed review revision and approved-plan hash; it never synthesizes work, progress, results, receipts, or readiness.
  - Determinate progress requires an owner denominator and named progress source; resume/reload preserves owner operation identities and retry observes existing work instead of launching a duplicate.
  - Every Onboarding control emits one typed local UI action; no `cmd.onboarding.*` semantic command or generic Onboarding mutation handler exists.
  - Defer preserves exact path/stage/draft/review/history/focus continuation, Close is non-completing, Skip records an explicit skipped session, and Details is ephemeral and owner-work-free.
  - Disabled or rejected outcomes dispatch and persist no owner work, carry no production receipt, and expose one plain-language reason.
  - Reaching Ready never asserts skipped or failed owner readiness.
  - Guided Tour is secondary and optional and follows PWIZ-023's three-scene contract.
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Concepts/pm7-tools/onboarding_cinematic_source.py static assertions, Concepts/pm7-tools/verify/onboarding_cinematic.mjs browser-concept verifier, future native owner-routing and migration negative fixtures]
risk_class: onboarding_parallel_owner_or_overloaded_first_run
reasoning_tier: high
context_scope: product_onboarding_owner_and_flow
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/product_onboarding_contracts.schema.json]
node_compile_hint: {mode: product_onboarding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:register-settings-onboarding.md#1E"
  - "source_report:register-fullthread.md#R-063"
negative_constraints: [Do not create an onboarding-only backend., Do not expose more than two prominent choices., Do not restore a provider-first gate or the superseded seven-stage path., Do not hide or bypass the current simple_path or review_setup_plan stage., Do not authenticate, pair, enroll, perform a live repository lookup/create/bind, execute a restore, configure a Server or network, write a filesystem, or dispatch any other side effect before current review confirmation; do not misclassify bounded read-only Server discovery/projection as a side effect., Do not conflate local Safe History with an optional online copy., Do not expose unexplained source-control or developer jargon in primary copy., Do not use or mint cmd.source_control.repository.init., Do not add repeated confirmation after review., Do not synthesize Automatic Preparation work/progress/readiness from time or UI state., Do not register cmd.onboarding.* commands or packet candidate aliases/handlers., Do not turn the modal into a full-page route or add browser-style Back/breadcrumb chrome., Do not store secrets or protected authentication content., Do not claim native/runtime or visual proof from fixtures, static gates, or browser evidence.]
```

### PWIZ-022 - Product Onboarding motion, accessibility, and migration

```yaml
plan_unit_id: PWIZ-022
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: Product Onboarding uses one bounded modal window over the visibly preserved live application, bounded interruptible Slint-portable motion, deterministic Reduced Motion and low-resource equivalents, exact path-correct progress and keyboard/focus/Back/Close/Escape semantics, no-secret revisioned persistence, and receipt-backed migration from legacy provider-first, five-stage, and superseded seven-stage records without auto-confirming Review or replaying owner mutations; it never becomes a full-page route or nested-modal owner branch.
gui_related: true
gui_classification_reason: Defines user-visible motion, responsive layout, focus, copy, error, resume, and migration behavior.
depends_on: [PWIZ-021]
unblocks: []
acceptance_criteria:
  - The setup flow remains one bounded modal with explicit outer margin, modal chrome, an input-blocking scrim that also inerts late-mounted body siblings, exactly one dialog accessibility surface named by the active stage or branch, an inert/ID-clean outgoing visual layer, focus containment, and exact initiating-control return (or verified active-application-tab return for automatic first-run open) across desktop, narrow, and short windows.
  - Progress and accessibility announcements use the exact active path denominator: nine for guided setup and six for connect existing.
  - Close dismisses without completion, Skip records an explicit skipped session, Defer persists the exact resumable continuation before dismissal, and Details remains an ephemeral same-stage disclosure with no owner command.
  - The modal adds no route-history or breadcrumb chrome; typed Back remains local to its bounded stage/branch presentation.
  - The approximately `1.2-1.5 second` hero, `420-560 ms` step transitions, `60-80 ms` choreography stagger, `120-220 ms` microinteractions, approximately `700 ms` success settle, same-frame acknowledgement, interruption, reversal, resize, theme-switch, Retro stepped treatment, and reduced-motion settle are deterministic; the modal entrance keeps its layout bounds fixed and uses opacity/clipping so cross-family theme changes cannot push it outside the required outer margin.
  - Focus and screen-reader output follow semantic stage state and never background refresh order; the modal releases inertness before Guided Tour starts, and a failed Tour start restores the transferred application focus target without claiming a successful handoff.
  - Legacy migration preserves decisions, warnings, and valid owner receipts, maps unresolved work into the nine-/six-stage draft, requires an unconfirmed Review Setup Plan, and never reruns owner work.
  - The one-time domain migration receipt references the canonical storage migration receipt and reports exact accepted, stale, dropped, quarantined, per-stage, and per-path counts without storing secret bytes.
validation_surfaces: [Concepts/pm7-tools/onboarding_cinematic_source.py static assertions, Concepts/pm7-tools/verify/onboarding_cinematic.mjs browser-concept verifier, future native six-width visual fixtures, Reduced Motion traces, keyboard and screen-reader fixtures, legacy migration fixtures]
risk_class: onboarding_motion_or_resume_state_loss
reasoning_tier: high
context_scope: onboarding_presentation_and_persistence
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/product_onboarding_contracts.schema.json]
node_compile_hint: {mode: onboarding_presentation_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:wave3-lane2.md#S0098"
negative_constraints: [Do not block input on animation., Do not require browser-only effects., Do not overwrite saved Project or application layout., Do not migrate any predecessor record directly into confirmed Review or Automatic Preparation.]
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
