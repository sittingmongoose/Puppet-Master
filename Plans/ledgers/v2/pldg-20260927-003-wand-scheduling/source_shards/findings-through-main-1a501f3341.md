# Findings compiled by this ledger

Each record is one NOW line of register group B4 (`Plans/Scheduling_and_Quota_Resume.md`) from the impact register
frozen at `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md`
(SHA-256 `71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493`), compiled from the design spec frozen at
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`
(SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`). Every `Repairs` sentence names only
PlanUnits this branch changed, and each is a compile target of the record's own queue item. In-place prose
amendments that sit outside any PlanUnit are named after the sentence. B-SQR-08 is record-only (decision
`dec-007`), B-SQR-05 waited on card p12 (question `q-001`) and is compiled in the closure wave as Record 7 now that
the owner has answered it (DL-136), and B-SQR-09 is the companion task (question `q-002`).

## Record 1 — SQR-01 (card grammar): The scheduled-message card had one flat form and a status badge

The v4 card section listed six visible states with truthful actions but gave them one card shape, and the v3 card
grammar asked for a "primary status badge `Scheduled` or `Held`". The redesign gives each state its form: a future
bubble for `Scheduled`, a decision bubble for `Held` (a message missed under `hold` is `Held` with a missed reason,
not a seventh state), and one-line receipts for the other four, each beginning with its state word, with the state
shown as a glyph and the word. The clock ring and every countdown must derive from server-owned time.

Repairs SQR-012. In place, the SMSG-001..003 card section now states the forms, the missed-as-Held rule and the
state-word rule; the v3 APR-028 section replaces the badge with the glyph and word and keeps receipts from repeating
the text; and the SMSG-012..018 restart paragraph adds that countdowns and clock rings derive from `scheduled_at`
and server time.

## Record 2 — SQR-02 (dock lines): Scheduling had no in-chat summary surface

The owner document had no sentence about what scheduling shows when its cards are off-screen. The redesign adds a
needs-you line for held messages and a lowest-priority "Coming up" line to the shared dock above the composer, and
forbids a second strip, quota strip or checkbox. The dock itself belongs to the chat design; this owner only
supplies the lines.

Repairs SQR-012. The footer summary pill's coexistence is not decided here.

## Record 3 — SQR-03 (commands): Card actions, Build At and the composer precondition did not map cleanly

The catalog precondition `composer_not_empty` does not fit a sheet with its own editable text; "Send now" on a
missed message had no stated command; one Build At click needed both `cmd.chat.plan.schedule_build` and
`cmd.execution_window.create`, two free dispatches that could leave half a schedule; and "Cancel schedule" had no
stated target. The spec's action table resolves all four without a new command.

Repairs SQR-013 and CDRY-008. In place, the section 3 commands table now carries `schedule_text_not_empty`, the
`reschedule_to` update, the window riding inside `AssistantPlanScheduleRequest`, Use V<n> as an explicit
reschedule, Cancel schedule by `schedule_id` and the five source surfaces; the Schedule Message and Build At
sections of section 3 state the sheet as the one commit and the one-command Build At.

## Record 4 — SQR-04 (manager): The manager's filter words and grouping were not the redesign's

The v3 manager section gave every category the status filter "Active, Paused, Completed, Failed, Expired" and
implied the policy tab was filterable. The redesign keeps the stored values, labels them in plain words, maps each
label onto owner states, groups Scheduled Messages as an agenda, adds a focused view in the same sheet, and states
that Resume & Safety Policy is not a list.

Repairs SQR-014. In place, the v3 APR-027 filtering bullet names the three filterable tabs, the new labels and the
policy tab's exclusion. After blind review R-03 both name the stored values: Active, Paused, Completed, Failed and
Expired kept, Held and Canceled added, All for no filter (lead ruling `dec-009`).

## Record 5 — SQR-06 (Build At): The Plan-card schedule line, the shown grace and the overnight receipt had no owner text

Canon named `Outside execution window`, `Paused` and `Waiting for Usage` as secondary truth but did not say the
schedule line leads with them, did not say that a value shown on the Build At sheet must be the value recorded, and
had no owner for the overnight receipt, the night journal or the "since you were last here" digest. This owner now
writes one occurrence summary per window occurrence, once, and the three surfaces read it.

Repairs SQR-015 and SQR-016. In place, the section 3 Build At section points to both units.

## Record 6 — SQR-07 (labels): Stored scheduling values had no fixed display labels

The missed policy, next-window resume and wind-down were specified only as stored values and Settings defaults.
The redesign fixes per-surface labels ("Send as soon as I'm back" for a message, "Build at the next chance" for a
build, "Keep going next time", "Wrap-up time") without renaming a value or a Settings key; the Settings rows stay
out of scope.

Repairs SQR-017. In place, the section 1 Settings boundary and the section 3 missed-time paragraph name the labels
and point to the unit. SQR-017 also lists timezone choices with the device zone first and as the default, UTC never
the default (DESIGN-SPEC 8.7, G-33: "The device zone comes first, and is the default."; lead ruling
`dec-010`, blind review R-09). After R-07 the Settings boundary sentence binds only the scheduling sheets,
cards and Schedule Manager.

## Record 7 — SQR-05 (automation pause): The promised Pause all automations control had no canon

The redesign promised that "Pause all automations" always wins and showed the switch read-only in the Schedule
Manager's Resume & Safety Policy tab, while canon latched `user_stop_epoch` per run only, so no project-wide pause
existed and the promise could not be kept. The owner answered card p12 (E-19) with option A, recorded as DL-136: one
project-wide switch that stops every scheduled send and scheduled build until the user turns it back on. It is a
user manual stop at project scope that ranks with user manual Pause, is set and cleared only by
`cmd.runtime.automation_pause.set`, is cleared only by the user, and is never cleared or bypassed by an automatic
mechanism or a new schedule.

Repairs SQR-018, SQR-001, SQR-006 and ATS-064. In place, outside any PlanUnit: section 1 precedence item 2 and a new
paragraph after the `user_stop_epoch` paragraph; the section 3 shared eligibility list (the
`project_automation_paused` clause); the section 3 exact commands table (the `cmd.runtime.automation_pause.set` row);
the section 3 Events section (`runtime.automation_pause_changed`, now thirteen events); the section 5 negative tests;
the Wand Modules Redesign Addendum intro; and three sentences in `Plans/Assistant_Plan_Runtime.md` section 3, "Build
With Crew and Build At", that pauses a scheduled `PlanRun` at its next safe boundary while the switch is on.

After blind review cycle 1 (R-01, R-02, R-04, R-05, R-06, R-10): the one dispatch of a user's Send now is
exempt from `project_automation_paused` and leaves the switch on; work the user starts directly, including
an explicit user resume of one run, acts; a message the switch held follows its missed policy once at
switch-off; a per-run latch refuses with `manual_stop_latched` while the switch records
`project_automation_paused`; and ATS-064 checks each of these.
