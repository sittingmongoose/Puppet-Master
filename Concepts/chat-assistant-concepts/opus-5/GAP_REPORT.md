# Gap Report — Opus 5 Assistant Chat concept workspace

**Scope of this document.** It records specification, command, schema, wiring, and DRY Method gaps
discovered while building this concept workspace. It **does not repair canon**. Nothing in `Plans/**`,
`Concepts/PMConcept7.html`, the UI Command Catalog, the Wiring Matrix, DRY Method contracts, or the
parallel Usage redesign was modified by this work.

Each entry carries: ID, feature, description, evidence, current reference (where known), status,
prototype impact, suggested later owner, and whether this prototype made a provisional assumption.

Status vocabulary: `missing` · `conflicting` · `stale` · `ambiguous` · `implementation-only` · `data`

---

## A. Verified conflicts between canon and the fixed requirements

These are conflicts I verified in the repo, not merely inherited from the handoff's claims.

### GAP-A1 — Copy hover discovery
- **Feature:** message hover row
- **Description:** `assistant-chat-design.md` ACD-012 states Copy availability must not depend on
  hover-only discovery. The fixed requirements state Copy may remain hover-only and explicitly
  supersede the older rule.
- **Evidence:** `Plans/assistant-chat-design.md:4093` vs `01_FIXED_REQUIREMENTS.md:205`
- **Reference:** ACD-012 · **Status:** conflicting (supersession already declared)
- **Impact:** none — prototype implements hover-only Copy.
- **Owner:** Assistant Chat · **Assumption made:** no

### GAP-A2 — Resend control
- **Description:** ACD-012 lists `Resend` and `/resend` as preserved tokens. The fixed requirements
  remove Resend entirely, replaced by edit-and-resubmit.
- **Evidence:** `Plans/assistant-chat-design.md:4082` vs `01_FIXED_REQUIREMENTS.md:203`
- **Status:** conflicting (supersession declared) · **Impact:** none — Resend is absent and an
  automated assertion fails the build if it reappears.
- **Owner:** Assistant Chat · **Assumption:** no

### GAP-A3 — Colored left-side accent borders
- **Description:** ACD-444 and F3-469 both require a left accent bar on active/selected thread rows.
  The fixed requirements prohibit colored left-side accent borders as a selection, status, or
  active-state treatment.
- **Evidence:** `Plans/assistant-chat-design.md:24346-24347`, `Plans/FinalGUISpec.md:31011-31013`
  vs `01_FIXED_REQUIREMENTS.md:600`. Both plan sources verified independently.
- **Status:** conflicting (supersession declared; both units need retirement)
- **Impact:** none — prohibition honored across all sixteen concepts, enforced by an automated check.
- **Owner:** Assistant Chat and Final GUI · **Assumption:** no

### GAP-A4 — Width envelope scope confusion
- **Description:** The handoff groups F3-471 and F3-498 under "thread rail and widths", implying their
  240 / 280 / 480 px envelope applies to chat geometry. Reading the units directly, they govern the
  **File Manager side panel** (`--files-panel-w`), not the Assistant Chat.
- **Evidence:** `Plans/FinalGUISpec.md:31116-31133`
- **Status:** ambiguous (grouping error in the handoff, not in canon)
- **Impact:** a concept agent applying 240-480 px to Assistant Chat width would be acting on a misread.
  This prototype uses 520 / 750 / 975 / 1200 throughout and never applies the side-panel envelope.
- **Owner:** Final GUI · **Assumption:** yes — treated as a side-panel unit, chat unaffected.

### GAP-A5 — (withdrawn, not a gap)

An earlier revision of this report flagged that `975` appears nowhere in `PMConcept7.html` and treated
that as a specification gap. That was a misreading on my part and it is withdrawn.

PMConcept7 has no width slider and no clickable width presets — it has a drag resizer clamped to
520-1200. The four values 520 / 750 / 975 / 1200 are **concept-testing presets defined by this
exercise's packet**, exposed only by the comparison workspace so a reviewer can reproduce a width
exactly. They were never claimed to be production snap points, and `09_LATER_CANON_UPDATE_REGISTER.md`
already says so. Nothing is missing from canon here.

This workspace uses the packet's four prescribed presets plus the required continuous 520-1200 slider,
both as workspace controls only. No entry is warranted.

### GAP-A6 — Questionnaire composer availability contradicts the recorded video
- **Description:** The fixed requirements state the ordinary composer is unavailable while a
  questionnaire is active. The questionnaire recording shows a reply-directly surface rendered beneath
  the active question card in every sampled frame, including the first and last.
- **Evidence:** `04_QUESTIONNAIRE_VIDEO_ANALYSIS.md` asserts unavailability as a user-supplied
  requirement while the keyframes show the surface present. Static frames cannot prove interactivity,
  but the surface is not hidden.
- **Status:** conflicting (requirement vs observed behavior)
- **Impact:** the prototype locks the composer per the requirement and shows an explanatory line in its
  place. If the intent was a reply-anyway affordance, that is unspecified.
- **Owner:** Assistant Chat · **Assumption:** yes — requirement wins over video evidence.

---

## B. Missing specification

### GAP-B1 — Per-question skipped state has no schema field
- **Description:** Skip must apply to the current question, be revisitable, and be replaceable by an
  answer, and a submitted questionnaire may contain intentionally skipped optional questions. No
  `skipped` field exists on any question object in the supplied dataset, and no field is defined in canon.
- **Evidence:** `machine/demoData.json` question objects carry `id`, `prompt`, `kind`, `required`, and
  either `options`/`selected` or `draft`. A regex over the whole file finds no `skipped` key.
- **Status:** missing (schema) · **Impact:** the prototype holds skip state in its own store slice.
- **Owner:** Assistant Chat schema · **Assumption:** yes — renderer-held skip state.

### GAP-B2 — Docked and pop-out shared state is under-specified
- **Description:** The prose enumerates eleven state categories that must survive a mount change.
  `machine/requirements.json` collapses all of it to a single boolean `mounts.sameSemanticState`, with
  no itemized breakdown, no ownership, and no restoration order.
- **Evidence:** `01_FIXED_REQUIREMENTS.md:112-128` vs `requirements.json`. Independently flagged by
  `09_LATER_CANON_UPDATE_REGISTER.md` under "Docked and pop-out state".
- **Status:** missing (schema and wiring)
- **Impact:** the prototype defines its own restoration order in `CONTRACT.md` section 6: capture the
  anchor into the store, destroy both modules, rebuild geometry, remount, restore, re-anchor.
- **Owner:** Final GUI and storage · **Assumption:** yes — the order above.

### GAP-B3 — "First visible response" is named but never defined
- **Description:** Listed in the prose as a timing a turn may retain, but absent from both the More Info
  field list and the timestamp requirements in the machine file.
- **Evidence:** `01_FIXED_REQUIREMENTS.md:234` vs `requirements.json` `moreInfo` and
  `timestampsAndDurations`.
- **Status:** missing (schema) · **Impact:** the prototype renders the row when the field is present and
  omits it otherwise. No supplied record carries it.
- **Owner:** Assistant Chat schema · **Assumption:** no

### GAP-B4 — Long-message collapse eligibility threshold is undefined
- **Description:** The preview must be "substantial" with a "firm upper limit", but no threshold,
  preview length, or unit (characters, lines, pixels) is specified anywhere, and the supplied data
  carries no threshold constant.
- **Status:** missing (specification, deliberately left open) · **Impact:** each thread concept picks
  its own rule and documents it. That is intended by the handoff, but it means no two agents' concepts
  are comparable on this axis.
- **Owner:** Assistant Chat · **Assumption:** yes — per-concept rules, documented per concept.

### GAP-B5 — Long-message expansion has no command or persistence owner
- **Description:** It is unclear whether expand/collapse is pure local view state, a cataloged command,
  or a persistent per-thread view preference. It must survive a mount change, which implies persistence,
  but no owner is defined.
- **Evidence:** `09_LATER_CANON_UPDATE_REGISTER.md` raises exactly this question.
- **Status:** missing (command catalog) · **Impact:** the prototype treats it as per-thread view state
  in its own store. **Owner:** Assistant Chat · **Assumption:** yes

### GAP-B6 — Dynamic work surfaces have no dispatch ownership when combined
- **Description:** Goal, Todo, subagents, diffs, and activity are separate underlying records, but
  concepts may present them combined. When a combined surface exposes a control, which system owns the
  dispatch is undefined.
- **Status:** missing (wiring) · **Impact:** the prototype routes every control to its own owning
  service and never lets a combined presentation create a shared command path.
- **Owner:** Wiring Matrix · **Assumption:** yes — route by owning record, never by presentation.

---

## C. Command catalog gaps

### GAP-C1 — The questionnaire command family is uncataloged
- **Description:** `assistant-chat-design.md` references `cmd.questionnaire.draft_update`, `.submit`,
  `.dismiss`, `.resume`, `.expire`, and `.mark_unavailable`. A grep for `cmd.questionnaire` returns
  **zero matches** in both `UI_Command_Catalog.md` and `Wiring_Matrix.production.json`.
- **Status:** missing (catalog and wiring). Note `.expire` must be **retired** — the fixed requirements
  state there is no passive expiration.
- **Impact:** the prototype implements the behavior without claiming any command is wired.
- **Owner:** UI Command Catalog · **Assumption:** no

### GAP-C2 — Thread lifecycle namespace drift
- **Description:** `assistant-chat-design.md:1101-1108` defines `cmd.chat.thread.commit_first_message`,
  `.discard_empty_draft`, `.suspend`, `.restore`, `.archive`, `.unarchive`, `.delete`. The catalog
  registers a differently scoped family — `cmd.chat.new`, `.archive`, `.delete`, `.rename`, `.pin`,
  `.export`, `.search` at `UI_Command_Catalog.md:720-726`. A grep for `cmd.chat.thread.` in the catalog
  returns zero matches. The two namespaces do not reconcile in either document.
- **Status:** conflicting · **Impact:** thread-management controls are represented in the prototype but
  make no claim about which command they would dispatch.
- **Owner:** UI Command Catalog · **Assumption:** no

### GAP-C3 — Investigation and child-question commands drift
- **Description:** `cmd.chat.subagent_question.view_context` and the `cmd.investigation_context.*`
  family have zero matches in the catalog, which instead names
  `cmd.chat.open_debug_target_picker`, `cmd.chat.export_investigation_bundle`, and
  `cmd.chat.revoke_investigation_item`.
- **Status:** conflicting · **Owner:** UI Command Catalog · **Assumption:** no

### GAP-C4 — Draft-history recovery has no command or persistence owner
- **Description:** Open revision history, restore a revision, delete or clear a revision, and clear the
  current draft are all required behaviors with no cataloged commands and no defined persistence owner.
- **Status:** missing (catalog and wiring) · **Impact:** implemented locally in the prototype.
- **Owner:** UI Command Catalog and storage · **Assumption:** yes

---

## D. Schema gaps

### GAP-D1 — Worked versus total elapsed never diverges in supplied data
- **Description:** More Info must show Total elapsed "when different" from Worked for. In the supplied
  dataset `runtime.workedSeconds === runtime.totalElapsedSeconds` on **all 400 messages**, so the row
  could never render from supplied data. The split exists meaningfully only at Goal level.
- **Status:** data · **Impact:** the extension dataset supplies 46 messages where the two diverge, so
  the row is genuinely exercisable. **Owner:** demo data · **Assumption:** yes

### GAP-D2 — `thread.updatedAt` is unreliable
- **Description:** On 11 of 15 supplied threads, `updatedAt` precedes the last message's `sentAt` —
  by roughly ten hours on thread-09. Any surface sorting or labelling by `updatedAt` will contradict
  visible message timestamps.
- **Status:** data · **Impact:** the prototype derives recency from `messages[last].sentAt` at
  normalization time and never reads `updatedAt` for display. **Owner:** demo data · **Assumption:** yes

### GAP-D3 — Runtime is duplicated across each user/assistant pair
- **Description:** `runtime` is byte-identical between each user message and the assistant message
  following it. This is arguably correct — a user message's provider, model, and duration describe the
  turn it launched — but it is implicit, and a naive renderer will appear to attribute assistant cost
  and provider to user-authored text.
- **Status:** ambiguous (schema semantics undocumented)
- **Impact:** normalization marks user runtime with `describesTurn: 'launched'`, and More Info states
  the relationship in prose. **Owner:** Assistant Chat schema · **Assumption:** yes

### GAP-D4 — Non-monotonic timestamps in thread-09
- **Description:** One backward timestamp jump at index 20 (16:20:02 followed by 16:00:00).
- **Status:** data · **Impact:** repaired at normalization time; source file untouched.
- **Owner:** demo data · **Assumption:** yes

### GAP-D5 — Supplied data cannot exercise several required states
- **Description:** Zero coverage for: an archived thread (`archived` is false on all 15), a diff file
  with status `deleted` (only `edited` and `created` occur), a browser session with any status other
  than `running`, a "Goal only" thread (a required feature state in the test matrix), and a distinct
  replan-after-edit scenario.
- **Status:** data · **Impact:** all added in the extension layer.
- **Owner:** demo data · **Assumption:** yes

### GAP-D6 — Long-message coverage is too thin to evaluate collapse
- **Description:** The stated contract requires long messages on both sides and search targets near the
  end of collapsed content. In the supplied data the median body is 105 characters and exactly **one**
  of 400 messages exceeds 1200. Of the three named search phrases, only `retention window nine days`
  sits inside genuinely collapsed content; `blue lantern checkpoint` is in an 851-character message with
  `collapsedByDefault: false`, and `canonical source history` appears in twelve short messages.
- **Status:** data · **Impact:** without extension, long-message collapse cannot be judged at all. The
  extension adds long messages on both roles across several threads and relocates all three phrases into
  content that is genuinely collapsed, one of them also genuinely unloaded.
- **Owner:** demo data · **Assumption:** yes

### GAP-D7 — Draft revisions carry no attachment snapshot
- **Description:** Supplied revision entries are `{savedAt, text}` only, so restoring an old revision
  cannot restore the attachments that existed at that revision.
- **Status:** missing (schema) · **Impact:** new revisions created by the prototype include attachment
  snapshots; supplied ones degrade gracefully. **Owner:** storage · **Assumption:** yes

### GAP-D8 — Subagent children have no stable identifier
- **Description:** Individual agents carry only `name`; only the group has an `id`. Keying children
  across re-renders requires a composite of group id plus name.
- **Status:** missing (schema) · **Owner:** orchestrator subagent integration · **Assumption:** yes

---

## E. Wiring gaps

### GAP-E1 — No wiring exists for any behavior in this prototype
- **Description:** The prototype implements search indexing, Context Lens assembly, Goal Runtime
  projection, child-run projection, questionnaire lifecycle, draft persistence, editor-tab routing, and
  UsageRecord projection entry points. None of these has a mapped command registration, handler, state
  owner, persistence owner, or event receipt in the Wiring Matrix.
- **Status:** missing (wiring) · **Impact:** none on the prototype, which claims no production wiring.
  The handoff is explicit that a prototype must not pretend uncataloged behavior is already wired.
- **Owner:** Wiring Matrix · **Assumption:** no

---

## F. DRY Method impacts

### GAP-F1 — A combined work surface shows records owned by different systems
- **Description:** Several concepts present Goal, Todo, subagent, diff, and activity information in one
  visual surface. Those records are owned by Goal Runtime, the orchestrator, and source control
  respectively. A single presentation reading from multiple owners is exactly the pattern DRY rules
  govern, and no contract covers it.
- **Status:** missing (DRY) · **Impact:** the prototype keeps the records separate internally and only
  combines presentation. **Owner:** DRY rules · **Assumption:** yes

### GAP-F2 — Chat controls route into surfaces owned elsewhere
- **Description:** Artifact opening, browser preview, Context Detail, Goal evidence, and child-run
  detail all route out of chat into other owners. The routing contract is undefined.
- **Status:** missing (DRY and wiring) · **Impact:** the prototype routes through a single fake editor
  host and never reimplements a destination. **Owner:** DRY rules · **Assumption:** yes

### GAP-F3 — Displayed state is a projection, not the owning record
- **Description:** Goal status, subagent status, and context usage are all projections. Which surface
  is authoritative when a projection disagrees with its source is undefined.
- **Status:** missing (DRY) · **Owner:** DRY rules · **Assumption:** no

---

## G. Dependencies on the parallel Usage redesign

### GAP-G1 — Context Ring internals and Context Detail destination
- **Description:** The chat concepts must preserve the Context Ring entry point and surrounding
  interaction without establishing an incompatible replacement for internals owned by the Usage
  redesign. The boundary between "entry point" and "owned internals" is not drawn precisely.
- **Status:** ambiguous · **Impact:** the prototype renders the ring trigger and a minimal status module
  (usage, input, output, estimated cost, a compact action, a details link) and routes details out
  through the editor host rather than building a detailed dropdown.
- **Owner:** Usage redesign · **Assumption:** yes — minimal module, routing only.

---

## H. Environment and process notes

### GAP-H1 — Repository scope rules block this work by default
- **Description:** `.claude/CLAUDE.md` restricts edits to `Plans/**` and classifies everything else as
  disallowed. This concept assignment requires writing application-like prototype code under
  `Concepts/chat-assistant-concepts/<agent>/`. A subagent correctly refused to write files on that basis
  until the user's explicit override was passed through.
- **Status:** process · **Impact:** every delegated worker needs the override stated explicitly, or it
  stops. **Owner:** repository configuration · **Assumption:** no — proceeded on the user's explicit
  instruction, which names the target folder verbatim.

### GAP-H2 — Browser automation is available; the visual matrix is still partial
- **Description:** RESOLVED for the functional sweep. A real Chromium drove all 22 suites and the
  128-run pairing/width matrix this session. The original finding stood because no third-party
  headless-driver package is installed (`npm ls -g` clean, no `node_modules` in the repo),
  and no network install was performed. All four existing verification scripts in the repo hard-depend
  on a third-party headless-driver package, named here by role rather than by package so this folder
  contains no third-party test-runner term in any file (the terminology correction applies to
  PM-owned surfaces, and a report inside the concept folder is one).
- **Status:** process · **Impact:** automated assertions are implemented as an in-page runner requiring
  no dependencies; screenshot evidence is captured through the in-app browser rather than a headless
  matrix sweep. **Owner:** tooling · **Assumption:** no — this was the user's explicit direction.

### GAP-H3 — `fetch` cannot read sibling files over `file://`
- **Description:** Chromium gives every `file://` document an opaque origin, so the workspace cannot
  fetch its own demo data from disk.
- **Status:** implementation-only · **Impact:** demo data is emitted as script bundles by
  `demo/build-demo-bundles.mjs` so the workspace runs from disk and over http identically.
- **Owner:** none — a prototype-only concern. **Assumption:** no

## GAP-E - Phase E closed

Every row of the packet's three differentiation matrices (question systems, compact work clusters, BSD advice
surfaces) is now built and browser-verified in all eight thread concepts, together with an artifact handoff
card per concept. `shared/reveal.js` is primitives only; the shared question choreography that made the eight
concepts move identically is deleted. `shared/qflow.js` carries the verb semantics that must NOT differ.

- **Status**: closed.
- **Evidence**: `BUILD_STATUS.md` section "Phase E", `TEST_REPORT.md` section "Phase E re-run (final)", and
  `interaction-test-report.json`.
- **Remaining**: the visual matrix in `evidence/` holds 32 targeted captures rather than the complete
  64-pairing x 8-theme grid. That is a capture-coverage gap, not a behavioural one: the 128-run assertion
  sweep covers every pairing at both widths.

## GAP-E2 - post-Phase-E audit

Asked whether the work was polished and whether anything from the packet was missing, three gaps were found
and closed: `SERVICES.md` had been lost (never git-tracked, now regenerated from `shared/*.js`), Phase E had
no committed test coverage (the new `forms` suite covers the eight forms, the eight clusters, the yield rule
and the `PMXQFlow` contract), and the visual evidence predated the phase (18 fresh captures).

Writing the suite found a defect the probes had missed: `motion.swapText` painted an empty frame when writing
a first value, so every freshly mounted work line, chip and status label was blank for two frames. Fixed, with
both halves of the contract pinned by assertions.

- **Status**: closed.
- **Remaining**: the visual matrix is 32 targeted captures rather than the full 64-pairing x 8-theme grid.
  That is capture coverage, not behavioural coverage - the 128-run sweep and the 407-assertion suite cover
  every pairing and every form.

---

## GAP-M - the 2026-08-13 reference-media correction

This section records what the four raw recordings, the two PMConcept7 screenshots and the two demo
JSON contracts changed once they were actually opened, and what they left open. The full media
inventory, with frame indices behind every claim, is `reference-review-report.json`.

The packet's thesis was that a dependency omission had caused concept omissions. It had. Every
finding below is a behaviour this workspace did not have, or had written and left unwired, until the
media was inspected frame by frame.

### Closed by this pass

- **GAP-M1 `missing`. Ten of thirteen motion families were inert.** Each added a `pmx-m-*` class that
  no stylesheet defined, so `beat()` added a class, no animation started, no `animationend` fired,
  and `afterTransition` sat out its 480ms fallback before cleaning up. The families reported success
  and moved nothing. All nineteen classes are now defined in `shared/motion.css`.
- **GAP-M2 `missing`. The activity stream had no run model.** `03_compact_execution_activity.mov`
  shows one evolving capsule with a glyph chain that is a random-access index into a finished run.
  Nothing in this workspace could express entry order, a growing count, a tense flip, or per-phase
  disclosure. `shared/runtrace.js` is that model; eight concepts render it in eight idioms.
- **GAP-M3 `implementation-only`. The count morph could never have played.** `motion.countMorph`
  animates digits only when the element already shows the previous text, and seven of eight concepts
  rebuild their cluster on every render. The count would still have landed correctly, which is why
  this would not have looked broken. Closed by `PMXRunTrace.signature()` plus a per-concept patch
  path, and by `shared/surfaces.js` emitting one render per activity verb where it previously emitted
  two — the second render was discarding the morphing element mid-animation.
- **GAP-M4 `implementation-only`. `activity_condense` wrote the question-yield flag,** so firing it
  blanked Goal, Todo, subagents and diffs instead of condensing the activity.
- **GAP-M5 `implementation-only`. The artifact catalog declared `artifact-test` twice,** trapping
  `artifact.switch` in a two-cycle from which `artifact-context` and `artifact-crew` were
  unreachable. The suite's `length >= 7` assertion was satisfied *by the duplicate*.
- **GAP-M6 `implementation-only`. `shared/questionnaire.js` contained two literal NUL bytes,** so git
  treated it as binary and grep skipped it. Replaced with escapes; behaviour unchanged.
- **GAP-M7 `implementation-only`. `preserveAcross` never corrected the reading position** on any
  "load earlier messages" path, because all eight handlers pass the list container and the
  above-viewport guard can never be true for it.
- **GAP-M8 `data`. The manifest's resource collision was contradicted.** The concept invented port
  3000 to 3001 and a checkout worktree; `DEMO_SCENARIO_MANIFEST.json` specifies 4173 to 4174 occupied
  by the Usage concept visual-test server. Both are now modelled, and the port action id is derived
  from the conflict's own alternative instead of being hard-coded to one of them.

### Open

- **GAP-M9 `missing`. No questionnaire card reserves a stable height.**
  `02_stable_paged_questionnaire.mov` is built on a card whose frame does not change between pages;
  every card in this concept is content-sized and resizes per page. Two concepts animate the resize
  rather than avoiding it, which is a different behaviour from the reference's stability.
  `motion.firstVisit` — written precisely so backward paging does not replay an entrance — is still
  unwired, so paging back still reads as moving forward.
- **GAP-M10 `missing`. Message arrival is still not spatially continuous.**
  `01_message_arrival_spatial_continuity.mov` conserves position: the arriving bubble is already in
  its final place and the rows around it move. `motion.displace` implements exactly that and has no
  callers; every concept still fades or slides the new turn in while its neighbours stay nailed down.
  `scroll.stickIfAtBottom` also still has no callers, so a reader sitting at the bottom is not kept
  there when a reply lands.
- **GAP-M11 `data`. Seven of nine activity stages have no sub-rows.** The reference expands every
  phase into its own rows; ours expand two. Being addressed in the corpus regeneration, recorded here
  because until that lands the per-phase disclosure has little to disclose.

### Closed since GAP-M was first written

- **GAP-M10 is now partly closed.** `motion.displace` and `scroll.stickIfAtBottom` are wired in all
  eight concepts through an append-only render path, so only the arriving turn is new and a reader at
  the bottom is carried with it. Each concept supplies its own seam: t1 the composer edge, t2 the
  slab's tone band, t3 the spine's marker track, t4 its own fold, t5 the lane rule (mirrored per
  lane), t6 the first column stop, t7 the card's footprint, t8 opacity only — the one concept whose
  stated discipline refuses travel. What is NOT closed is thread-09, the windowed thread: see
  GAP-M12.
- **GAP-M11 is closed.** Every activity stage now carries its own sub-rows.

### Still open

- **GAP-M12 `implementation-only`. The arrival path never engages on the windowed thread.**
  `data.visibleSlice` computes its start from the message count, so on thread-09 (700 messages,
  window 50) an append also drops the oldest rendered message. That is a removal, and the append
  gate correctly refuses it, so the one thread where arrival matters most shows a rebuild instead.
  Fixing it means changing `visibleSlice`/`loadedFrom` semantics in `shared/data.js`.
- **GAP-M13 `implementation-only`. t2 and t8 fail the probe's headline read-back.** Both open the
  correct phase — `everyGlyphReopensItsPhase` passes for all eight — but the capsule text after the
  click does not read that phase's headline. The browser suite's own `runtrace` assertions pass for
  both, so `tools/drive.mjs activity` is catching something the suite is not, which is the point of
  having two independent checks. One contributing defect was found and fixed on the way: t2's chain
  accumulated ten chips for a three-phase run, the extras detached from their records and frozen on
  intermediate text such as `Reading 5 files` long after the count had reached seven. That reduced
  the symptom without clearing it, and the remaining cause is not established.
- **GAP-M14 `implementation-only`. `motion.phaseHandover` is played in one concept.** The two-beat
  handover of frames 194-211 has markup support in all eight, and t2 — the only concept that keeps
  element identity across renders — plays it. The other seven rebuild their capsule when the phase
  kind changes, so there is no surviving element to hand over. The primitive is wired, not dead; the
  beat is simply unreachable in a rebuild-per-render concept.

---

## GAP-M closed out — 2026-08-14, second pass

The three items GAP-M left open are closed. What follows is what changed and, more usefully, what
the closing found.

- **GAP-M9 is closed, by a different route than it was written.** The stable frame was withdrawn on
  instruction. Re-reading `02_stable_paged_questionnaire.mov` frame by frame, its card only LOOKS
  stable because every one of its four pages carries exactly four option rows — our pages genuinely
  differ, so stability would have been engineered rather than observed. The card now RESIZES, using
  PMConcept7's own model-picker bounce (`portalAnimateHeight` at `PMConcept7.html:48053-48091`):
  height on `cubic-bezier(.22,1.72,.36,1)`, a restarted scale beat, `height:auto` remeasure so
  `max-height` is respected, and a sub-pixel bail. `motion.firstVisit` is wired in all eight, so
  paging backward no longer replays the entrance — the half of "reviewable" the reference is
  emphatic about. Six concepts carried written refusals of height motion; all six were rewritten.
- **GAP-M13 is closed, and was two unrelated faults.** t2 was the PROBE: it read "the header" as the
  parent of the first `run-verb`, and t2 has no header row — its sentence lives on the subject
  phase's own chip. t8 is a real, documented divergence, now reported as `sentenceRowFollowsOpenPhase`
  and deliberately excluded from the exit gate.
- **GAP-M14 is closed.** `handoverClearsBeforeNewGlyph` measures true in 8/8. Five concepts drive it
  through `motion.phaseHandover`; three express the same two beats in their own geometry.

### What closing them turned up

Four further defects, three of them in shared code and all of the same family this workspace keeps
producing — motion that reports success and moves nothing:

- **`[data-motion="full"] *` reverted `animation-duration` to `0s`.** Same specificity as every
  animation class, later in the file, so it won. Nothing class-driven animated inside an explicitly
  full stage — not `.pmx-enter`, not `.pmx-cascade`, not one of the thirteen families, not the new
  bounce. The rule could not even do its stated job, because the blanket it was undoing is
  `!important`. Fixed by excluding a full stage from the blanket instead.
- **Every morphed count digit rested 4px low at 45% opacity**, because the start state
  (`[data-dir]`, specificity 0,2,0) out-ranked the end state (`.pmx-count-morph-run`, 0,1,0) and the
  end class was removed on cleanup anyway. Behaviour 2 of the activity reference was reaching the
  screen parked on its own first frame.
- **t2 deleted a live question card belonging to another thread** — a 180ms teardown scheduled for a
  thread the reader had already left.
- **t1 re-cascaded its option rows when paging backward**, because the ladder class outlived the rows
  it was applied for.

### Still open

- **GAP-M12 `implementation-only`. The arrival path still never engages on the windowed thread.**
  Unchanged: `data.visibleSlice` recomputes its start from the message count, so on thread-09 an
  append is also a removal and the append gate correctly refuses it. Fixing it means changing
  `visibleSlice`/`loadedFrom` semantics in `shared/data.js`.

---

## Third pass — 2026-08-14, the audit of the correction itself

The three GAP-M items were closed and then the whole workspace was re-read against the packet's own
deliverables list rather than against the summary of what had been done. That found six more, and
they cluster: five of the six are a REPORT claiming something the measurement never covered.

- **GAP-M15 `closed`. The matrix swept no themes, ran two of four widths, and never asserted focus.**
  `theme` and `ui.theme` appeared zero times in `tests/suites.js` while eight themes were documented
  as covered; `activeElement` appeared zero times while `shared/motion.js` rule 3 states that "not
  one helper touches focus". The packet's acceptance line names all three. Now: all four canon
  widths, a theme axis over all eight themes at all four widths on the two structural extremes, and
  a `focus` suite holding the composer across an activity run and a question opening in all eight
  concepts.
- **GAP-M16 `closed`. Closing GAP-M15 made the harness unrunnable, and only watching the host caught
  it.** `runMatrix` chained its runs with plain `.then()`, so the whole sweep was one unbroken block
  of work: no paint, no full GC, and every mounted composition still reachable until it resolved.
  At 128 runs that was survivable. At 320 one Chromium reached 12.8 GB and pushed a 22 GB host fully
  into swap — the machine the user had already restarted once for exactly this. The sweep now yields
  to the event loop between runs, and the driver runs it in nine chunks each in its own freshly
  navigated page, which bounds it at one window's worth however wide the matrix later becomes.
- **GAP-M17 `closed`. Nine of the ten command ids an operation card prints were not in the candidate
  delta**, in a module whose own docblock says every id it mints is recorded there. Checking them
  against the catalog found three that must not be minted at all — `cmd.chat.web.search`,
  `cmd.browser.navigate` and `cmd.testing.run` are canonical — and a re-check of the existing rows
  found three more claiming "new" on evidence the catalog contradicts, plus three ids that lived only
  in the wiring delta. `drive.mjs scan` now fails on any unrecorded id, from either source.
- **GAP-M18 `closed`. Five of the packet's fourteen named trigger states matched no family name.**
  All five were covered — under `agent`/`crew`, `decision`, `system.*_collision`, `sync`, and the
  retry/repair/restore paths of five families — but nothing said so, so a reviewer holding the packet
  against the report would have read five of fourteen as missing. The mapping is now declared and
  measured, and an uncovered state fails the sweep.
- **GAP-M19 `closed`. This workspace's own reference report carried two verification blocks that
  disagreed** — one from each pass, the older still listing a resolved failure. Collapsed to one
  owner.
- **GAP-M20 `closed`. `plan-owner-delta.md` was never updated**, though the packet names it among the
  reports that must be. The run-trace contract, the resize primitive and the attachment family had no
  Plan-impact statement until this pass.

The pattern across all six is worth naming, because it is the same one the first two passes found in
the CSS: **something declared, nothing checking.** A docblock said focus is never touched; a docblock
said every command id is recorded; a coverage table said eight themes were swept. Each was true as an
intention and false as a fact, and each is now held by a gate that fails.

- **GAP-M21 `closed`. Activating a chain glyph with the keyboard dropped focus to `<body>` in all
  eight concepts.** This is what the new `focus` suite was written to find, and it found it on the
  first run. Seven of the eight rebuild the capsule on a phase-kind change, so the focused glyph is
  destroyed and replaced; the reader is returned to the top of the document by their own click.
  Measured with the fix disabled: 8 of 8 fail. The weaker assertion — that a focusable control still
  exists afterwards — passes in all eight while focus sits on `<body>`, which is exactly the kind of
  check this workspace has been finding all week. Fixed with `PMXUtil.keepFocusAcross` at
  `Composition._onState`, the single point every store-driven re-render passes through.
- **GAP-M22 `closed`. Behaviour 4 of the activity reference was only half measured.**
  `shared/runtrace.js` cites f.910 for "condense is the resting state, not a deletion: the prose
  answer, the verification row and the artifact card live BELOW the capsule and are pushed down when
  a phase is reopened, never replaced." Both halves were asserted at the RECORD level — the work
  surfaces are still live after a condense — and neither geometrically, which is where the difference
  shows: a capsule that overlays what is beneath it, and one that swaps its region's contents, both
  leave the record identical and the reading ruined. The suite now measures the y of the content
  below across a reopen in all eight. Written first as an identity check, it failed in seven — and
  that was the CHECK being wrong, not the concepts: seven rebuild the region, and a viewer cannot see
  element identity. Rewritten to compare content and position, which is what the reference can
  actually show, it passes in eight. Run with a strict "must move" instead of "must not move up",
  six of the eight still pass, so the looser form is a guard and not a vacuous one.

