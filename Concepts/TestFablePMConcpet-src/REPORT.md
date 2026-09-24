# Completion report — Newbie-first onboarding and Guided Tour (PMF)

Date: 2026-09-04. Target: `Concepts/TestFablePMConcpet.html` (fork of
`Concepts/TestPMConcept.html`; the original is untouched). Sources, tools and
evidence: `Concepts/TestFablePMConcpet-src/`.

## Files changed

- `Concepts/TestFablePMConcpet.html` — new file. The legacy blocks
  `pm7-onboarding-css`, `pm7-guided-tour-css`, `pm7-guided-tour-js`,
  `#pm7-onboarding` (+ resume button), `pm7-onboarding-js`, `#pm7-guided-tour`
  (+ resume/replay buttons) were removed (about 650 KB) and replaced by
  `pmf-onboarding-css`, `pmf-tour-css`, `#pmf-onboarding` + `pmf-onboarding-js`,
  `#pmf-tour` + `pmf-tour-js` between `PMF:*` marker comments.
- `Concepts/TestFablePMConcpet-src/**` — new: sources, assembler, drivers,
  research, evidence.

## What was built

### Onboarding (popup window over the live shell)

Flow, in the packet's dependency order, with conditional branches only:

1. Welcome (one thought, optional look picker: four families, light/dark).
2. Where the work runs: this computer (default, read-only preflight),
   a Puppet Master I already set up (network discovery, pairing code / QR,
   approval on the Server, then **This device is ready to meet your Puppet
   Master** with its Projects and **Create a Project** which enters the
   Project flow with the Server as the work computer), or another computer
   (two-step install guidance, restore a Server from backup, or use this
   computer for now).
3. How the Project begins: start something new / use work that already
   exists / restore.
4. New: name + folder (suggested, changeable) → **Start like another
   Project?** (only when eligible Projects exist; Start fresh default;
   preview from the transfer owner; optional Choose settings groups) →
   history (on by default) with optional online copy and just-in-time
   source-host sign-in or account creation (loopback flow with device-code
   fallback). Existing: folder on this computer / stored online (host pick,
   sign in, repository list) / another device (SSH default, discovery or
   typed address, one-time password to install a key, verified passwordless
   connection, device ID, folder pick). Restore: backup list.
5. Review with Edit links and a plain list of what the commit will do.
6. One late, idempotent, receipt-backed commit with truthful phases; the
   flaky scenario fails the online-copy phase once and offers Try again /
   Skip this part / Back with the same idempotency key.
7. Choose what powers Puppet Master: detected accounts become Ready
   automatically; others show exactly one of Install / Sign in / Enter API
   key; See all providers; add another account as secondary; Skip for now.
8. Set up free models (optional, toggles) or Skip.
9. You are set: Show me around (Guided Tour) or go straight to the Planning
   Wizard; Close.

Close persists the draft and the exact screen; reopening resumes with a
"Welcome back" banner and Start over. Back revises any pre-commit choice
without side effects. Closing after commit reopens at the provider phase
without recreating the Project. Settings' Run setup wizard replays it.

Art: one continuous marionette scene per theme family, light/dark palettes, a
stage platform, strings that draw on, objects lowered from the bar, bar tilt
toward the weight, cast shadows, entrance choreography, and a crossfade when
the look changes. Round two added texture and atmosphere per family: Friendly
has paper grain, layered drop shadows, drifting motes and blinking LEDs; Glass
has a travelling light sheen, halos behind every object and caustics on the
platform; Retro has phosphor bloom on the objects, a vignette, scanlines and a
rare flicker; Basic is a blueprint with dimension lines, a title block and
hatched shadows. The commit moment dims the stage while phases run, then the
spark descends from the bar onto the Project, the platform lights up once and
a ring travels outward; the pane draws its check mark. Reduced motion jumps
poses, crossfades, and disables all ambient loops.

The right pane has a per-family material system: Friendly (larger rounded
display type, dotted kickers, gradient primary button, soft elevation), Glass
(light sheen across the pane, glassy tiles and button highlight), Retro (mono
type with a blinking block cursor, `//` kickers, faint scanlines, hard shadows),
Basic (compact, hairline footer rule, accent bar kicker, flat controls).

### Guided Tour (live shell, 12 steps, three chapters)

Ask: open Assistant Chat (rail icon; the tour wraps `cmd.panel.switch`),
send the suggested Teacher question (local deterministic stream inside the real
chat stream, labelled Guided example), apply ELI5 (real toggle; the same bubble
morphs to the simpler answer). Arrange: drag Chat by its real grip to the left
dock (the shell's own drag engine, lifted clone and dock preview), add the
Approval queue widget through the real catalog. Plan (7 of 12 steps): open the
Planning Wizard tab, then a practice sheet mounted inside the Wizard page:
submit the book-club goal, watch it become three outcomes, answer "Who should
be able to update the meeting and book?" with Why this matters, review
outcomes / decisions / assumptions / still open behind the approval boundary,
edit the answer and watch only the affected items change, then the boundary
explanation. Every action step waits for its real success predicate and offers
Show Me, which pre-cues, travels a visible pointer, presses the real control,
and settles. Skip Tour is always present; a missing target yields a recovery
card; progress persists and resumes; the outro offers Keep this layout or
Restore my layout (snapshot taken at start). The tour records zero demo-engine
sends and zero provider requests (asserted by `tools/tourdrive.mjs`).

## Existing components and commands reused

- `PM_THEME.setFamily/setMode/set`; `PM_PAGES.go('wizard'|'dashboard')`.
- `PM_HOME_WORKSPACE.setSurfaceVisible('chat', …, 'cmd.panel.switch')`,
  `moveSurface` (restore), the surface grip `[data-pm-home-handle="chat"]`
  and the real pointer drag engine (`cmd.workspace_layout.move_surface`, dock
  bands, lifted clone, FLIP).
- Dashboard `#pm6DashAddBtn` (`dash.catalog.open`) and the catalog item
  `dash.add.approval_queue`.
- Chat panel: `.message-stream`, composer, `.toggle-eli5`, message markup.
- Page tab `#tab-wizard`, `#panel-wizard`.
- Settings entries `replay-onboarding` and `start-guided-tour` through the
  compat shims `PM7_ONBOARDING_CINEMATIC` and `PM7_GUIDED_TOUR`.
- Theme tokens, `data-reduced-motion`, the hover-tag opt-out
  `data-pm-hover-exempt`.

## New concept-local fixtures and command vocabulary

Recorded in `PMF_ONBOARDING.commands/receipts` and `PMF_TOUR.commands/receipts`:

- `ui.onboarding.open|next|back|edit|close|finish|skip_provider|sheet.open`
- `cmd.server.preflight|discover`, `cmd.client.pair.start`,
  `cmd.source_account.sign_in|list_repositories`,
  `cmd.remote_storage.discover|ssh.connect`, `cmd.settings_transfer.preview`,
  `cmd.provider.detect|install|sign_in|verify_key|free_models.enable`,
  `cmd.project.create|add|restore|open`
- receipts: `server.preflight`, `server.discover`, `client.pair`,
  `source_account.sign_in`, `remote_storage.ssh.connect`, `settings transfer
  preview`, `provider.*`, `project.commit` (`ok` / `partial`), `project.open`
- `ui.guided_tour.start|step|next|back|show_me|skip|finish`,
  `cmd.chat.send` (local fixture thread), `cmd.chat.eli5.apply`,
  `cmd.planning_wizard.submit_goal|answer` (practice),
  `cmd.workspace_layout.restore_snapshot`; receipts `guided_tour.step`,
  `guided_example.teacher`, `workspace.snapshot|restore`
- storage keys `pmf.onboarding.v1` (draft, screen, stack, completion,
  provider_done, scenario) and `pmf.tour.v1` (index, snapshot, completion)
- scenario fixtures: first-time user, returning user (3 Projects, Claude
  ready, Cursor signed out, Antigravity CLI missing), flaky network.

## Scenarios tested and evidence

`tools/matrix.mjs` (assertions, no page errors): remote pairing incl. code
entry; existing folder → Add Project commit; existing online with just-in-time
GitLab sign-in and no provider detection; NAS over SSH with a rejected then
accepted password; restore; flaky commit with retry reusing the idempotency
key; returning user with Start like another Project, preview, group
selection, and automatic Ready / Sign in / Install states; close and resume
before commit with the draft intact and Back through every screen without a
commit; provider Install → Sign in, bad then good API key, no Connect/Use/Open
Installer wording, skip provider then free models, finish → tour handoff;
close after commit → reopen at provider phase without recreating the Project;
Settings replay entries; 900px width without horizontal overflow; reduced
motion. `tools/tourdrive.mjs`: all 12 steps via Show Me, layout restore,
0 demo sends, 0 provider requests. Vision review: `evidence/th_*_sheet.png`
(four screens × eight themes), `flow_sheet.png`, `mx_sheet.png`,
`tour_sheet.png`, `tour_practice_sheet.png`, `tt_sheet.png` (tour × eight
themes). Frame-by-frame at 60fps-equivalent: `evidence/ob-open_sheet.png`
(entrance choreography), `ob-where-begin_sheet.png` (screen + art
transition), `tour-showme-open_sheet.png`, `tour-drag_sheet.png`,
`tour-consequence_sheet.png`, `tour-outcomes_sheet.png`.

## Production impacts for the later port

1. **Activity-bar Chat icon is inert in this build.** Real clicks on
   `.activity-bar .icon[title="Chat"]` do not toggle `#chatPanel`; the home
   workspace's reconcile listener never sees a change. The tour therefore
   wraps `cmd.panel.switch` when that icon is clicked. Production needs the
   icon (or a Show Chat command) to be the real control.
2. **Hover-tag controller (T47) swallows clicks on any control that was ever
   `disabled`.** It stamps `data-pm-hover-was-disabled` and blocks click /
   input events in capture phase even after re-enable. Both PMF modules use
   `aria-disabled` and `data-pm-hover-exempt`; the controller should clear the
   flag on re-enable and honour an opt-out for self-explaining surfaces.
3. **Global shell key handlers receive keystrokes typed into modal inputs**
   (a typed letter opened a shell menu whose outside-click closer then ate the
   next click). The onboarding stops key propagation; production modals need
   inert scoping.
4. **No widget-remove command** in the dashboard demo; tour layout restore
   removes the card node only and leaves the catalog's added flag. Add
   `cmd.dashboard.widget.remove`.
5. **Planning Wizard has no practice/fixture mode.** The tour mounts its own
   practice sheet inside `#panel-wizard`, styled to the Wizard. Production
   should let the Wizard run a local fixture (goal → outcomes → question →
   review → edit consequence) with its real components and names.
6. **Chat has no Teacher persona entry and no local-fixture send.** The tour
   appends labelled fixture messages to the real stream and streams words
   locally. Production: a `local_fixture` thread kind on `cmd.chat.send`, a
   Teacher persona, and an ELI5 transform that returns the fixture's ELI5 text.
7. **Settings Transfer, provider detection/install/sign-in/key verification,
   server discovery/pairing, source-host sign-in, NAS discovery/SSH key
   install, and Project commit** are fixtures with the shapes above; each must
   be routed to its canonical owner. The commit must stay idempotent and
   partial-failure safe (the fixture already models `partial` receipts).
8. **Theme tokens.** The art relies on eight authored `--pmf-*` token sets
   (sky, ground, ink, string, obj1-4, glow, shadow, on-accent). Either the
   theme owner adopts them or they stay module-local.
9. **Slint portability.** Poses, strings, tilt and entrance are plain data with
   per-frame interpolation (springs, steps, quintic); CSS uses transform and
   opacity only; SVG art is grouped per object per family. The tour's
   spotlight is an exponential-settle rect; the pointer path is a parametric
   arc; predicates are polled state checks.
10. **Doctor** is untouched; the states listed in the packet (copied settings
    referencing an unavailable account, missing CLI, expired sign-in,
    estimated quota) are represented in onboarding fixtures and receipts but
    not surfaced in Doctor.

## Alignment to F3-520 / F3-521 (2026-09-24)

The concept was built from the 2026-09-03 packet. The Plan units it feeds
(`F3-520` Product Onboarding, `F3-521` Guided Tour, `PWIZ-021`/`PWIZ-023`)
were reconciled on 2026-09-06 and are the current authority. Compared on
2026-09-24 after the PM7 promotion review flagged the same units:

Already matching: the eight-theme choice at welcome; a reversible uncreated
draft; review with Edit routes; one late Create/Add/Restore commit with
observed phases; provider setup after commit, then Free Models, then Ready;
tour chapter order `chat_teacher` -> `workspace` -> `planning_wizard`; Chat
opened through its real control; Try it and Show Me sharing one handler and
predicate; Planning owning at least half of actions and dwell; Skip restoring
the captured layout; Finish restoring by default or keeping on explicit
selection; reload resuming a checkpoint; no left-edge accent rail; no black or
empty flash.

Closed in this pass (branch `concept/testfable-align-20260924`):

- `ELI5` and `Pause` sit beside `Skip Tour` in the coach card header. ELI5
  swaps every scene's copy for a simpler variant and applies the same ELI5
  rewrite to the Teacher answer on screen (or reverts it); the ELI5 step's
  predicate accepts either control. Pause stops predicates and Show Me, keeps
  the spotlight and the mounted state, and Resume re-targets the same step.
- The opening scene calls out ELI5 and says Reduced Motion lives in Settings.
- Teacher has a discoverable beginner question library (eight questions with
  regular and ELI5 answers) under the suggested question; any of them
  satisfies the Teacher step and streams in the same labelled example thread.
- Automatic scene transitions focus the scene heading (`#pmft-title`), never
  a button.
- Receipt identifiers no longer appear in user-visible onboarding copy
  (receipts stay in `PMF_ONBOARDING.receipts`).
- Tools take `PMF_ROOT` / `PMF_FILE` so the assembler and drivers work on a
  worktree copy instead of the shared checkout.

Evidence (raw captures live on the evidence share, not in this repository):
  - `/mnt/Cursor/PuppetMaster-Evidence/tests/testfable-align-20260924/01_intro.png` sha256 `a7fcaa6dfe9e2065a62ac508db10007c5f35bbbc921cd71bffa13c2c0a0e20e1`
  - `/mnt/Cursor/PuppetMaster-Evidence/tests/testfable-align-20260924/02_intro_eli5.png` sha256 `977da50d79b49ede03e6084a82db451fa9e614080dbc5ab297a99b0a82f5681f`
  - `/mnt/Cursor/PuppetMaster-Evidence/tests/testfable-align-20260924/03_paused.png` sha256 `dd2a85487c6b286b65d6303b300b783435dd52a2a64bc63d0730606af7eccbde`
  - `/mnt/Cursor/PuppetMaster-Evidence/tests/testfable-align-20260924/04_library.png` sha256 `7ca25b46976b75c4019655644d750025f91cd5bfb1461180d575953c22448671`
  - `/mnt/Cursor/PuppetMaster-Evidence/tests/testfable-align-20260924/05_eli5_answer.png` sha256 `3ced128acc5b0976e93671e957946a37d72d9c2de1969b2d09228edab8dbcfdc`
  - `/mnt/Cursor/PuppetMaster-Evidence/tests/testfable-align-20260924/aligncheck.mjs` sha256 `fe26b1e541ad23b8157def5647edf133db8d1c98beddd58ecb0d56a8c1f8eff3`
  `tools/aligncheck.mjs` passes 14 of 14 assertions; `tools/tourdrive.mjs`
  completes all 12 steps via Show Me with 0 demo sends and 0 provider
  requests; `tools/matrix.mjs` passes 48 of 48 assertions over 15 scenarios
  with no page errors. The harness now waits for the committed state instead
  of a fixed delay, because the 2026-09-07 sweep lengthened the screen-exit
  transition and a timer-based click landed while the commit was still
  running (a harness race, not a product defect).

Still open, because they change the flow's shape and need a product decision:

1. **Stage order.** F3-520/PWIZ-021 define eleven dependency stages with an
   explicit `server_storage_client` stage (where work runs, where files live,
   current Client) after `source_control_setup`, and a `remote_access_setup`
   stage (private access plan or explicit skip) before review. This concept
   asks "Where should the work run?" first, folds storage into the Project
   path, and has no private-access stage on the main path.
2. **First Project routes.** F3-520 wants four equal aligned routes visible
   together (Start a new project, Open a folder here, Bring one from online,
   Restore a backup). This concept shows three and folds folder / online /
   another device under "Use work that already exists".
3. **Safe History vocabulary.** F3-520 names Safe History with Git
   recommended, Jujutsu as a no-account alternative, FileSafe recovery points,
   and the online copy as separate. This concept offers a single "Keep
   history" toggle without naming the engines.
4. **Project Later.** F3-520 defines a deferred-Project path with both
   provider phases deferred. This concept only offers "No Project for now" on
   the connect-existing Ready screen.
5. **Connect-existing shortcut.** PWIZ-021's six-stage shortcut includes
   `review_setup_plan` and `automatic_preparation`; this concept goes from
   pairing to Ready without a review step.

## Round-two evidence

`evidence/v3_welcome_sheet.png` and `evidence/v3_success_sheet.png` show the
textured art and the success card in all eight themes. `evidence/film_*.png`
are 60fps-equivalent contact sheets from the all-theme film pass (entrance,
where to begin transition, commit celebration, handoff to the tour) for a
spread of families; the full pass covered four motions in every theme with no
page errors. Regression after the round: 48 of 48 matrix assertions, the full
tour through Show Me with zero demo sends and zero provider requests, and the
assembler reproducing the concept byte for byte from this folder.

## Known limitations

- Concept simulation only: sign-in, install, pairing, SSH and commit are
  timers with declared outcomes; nothing claims an external success the
  scenario did not declare.
- Headless screencast caps near 15 fps; motion review used 4x slow-motion
  with the modules' time scale (real-time labels on the sheets). Headless
  Chrome here renders in software, so the Glass family's blur work was
  reduced (lighter backdrop blur, gradient ribbons instead of filtered blur)
  after the film pass showed dropped frames during the window entrance; a
  GPU-backed build should be checked with the same filmer.
- Not ported to PMConcept7; no Plans were rewritten; `TestPMConcept.html`
  is unchanged.
- The rail Chat icon problem (impact 1) means the first tour action succeeds
  only because the tour wraps the command.
