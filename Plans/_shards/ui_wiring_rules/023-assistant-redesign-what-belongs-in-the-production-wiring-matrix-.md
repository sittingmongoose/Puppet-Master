# Shard 023: Assistant redesign: what belongs in the production wiring matrix (2026-09-03)

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1203-L1290

Source SHA256: `bb2048d39770ab3c8ab6bf24519c89ba8660de407a4bab5525e780f23cfec60a`

---

## Assistant redesign: what belongs in the production wiring matrix (2026-09-03)

`Plans/Wiring_Matrix.production.json` is the register of **registered
GUI → command → handler** wiring. Its schema requires every row to name a
`ui_command_id` matching `^cmd\.…`, and that requirement is load-bearing: a row
in this file asserts that a real command identity exists for the element.

A **view-local or owner-internal effect is therefore not a row here.** The
Assistant redesign initially carried sixteen such rows, each named
`(view-local intent) …` and each marked `proposed_census_required` in the source
packet — that is, explicitly *not* registered. They have been removed from the
production matrix. Their behaviour remains specified in their owner documents;
what they never had was a command identity, and inventing one to satisfy the
schema would have made this file claim a registration that does not exist.

The removed rows, with their owners:

| Packet row | Effect | Owner |
|---|---|---|
| W-001 | local ComposerBuffer update | `Plans/storage-plan.md` |
| W-012 | internal continuation evaluation | `Plans/Goal_Runtime_System.md` |
| W-021 | To-Do work binding | `Plans/ToDo_Runtime.md` |
| W-022 | To-Do transition | `Plans/ToDo_Runtime.md` |
| W-026 | existing questionnaire submit | `Plans/PRD_Builder.md` |
| W-027 | research capability request | `Plans/Collaborative_Workflows.md` |
| W-028 | BrainStorm vote action | `Plans/Collaborative_Workflows.md` |
| W-031 | Review internal result | `Plans/Collaborative_Workflows.md` |
| W-032 | Review vote action | `Plans/Collaborative_Workflows.md` |
| W-033 | Review finalize action | `Plans/Collaborative_Workflows.md` |
| W-037 | BSD internal trigger evaluator | `Plans/Back_Seat_Driver.md` |
| W-038 | BSD internal hold | `Plans/Back_Seat_Driver.md` |
| W-039 | BSD internal reconfirm | `Plans/Back_Seat_Driver.md` |
| W-048 | scheduling internal eligibility | `Plans/Scheduling_and_Quota_Resume.md` |
| W-050 | internal memory policy | `Plans/Assistant_Memory.md` |
| W-053 | internal title admission | `Plans/Assistant_Plan_Runtime.md` |

Two further corrections were made at the same time, and the rules behind them
apply to every future row:

- **A wiring row names one command, never a family.** `cmd.chat_room.promote_to_*`
  was expanded into the three commands the catalog actually carries:
  `promote_to_goal`, `promote_to_plan`, `promote_to_todo`.
- **`ui_element_id`'s first segment carries no underscore** (`^[a-z][a-z0-9]*`),
  so the redesign namespace is `assistant.redesign.…`, not `assistant_redesign.…`.
  The entry keys are unchanged; only the element identity is.

### Denominator note for `scripts/pm-touch-closure-verify.py`

That verifier pins `production_wiring_entry_count` to an exact expected value so
an unnoticed change to this file is caught. The redesign deliberately adds 41
rows, taking the file from 1066 to **1107** entries. The pin has **not** been
moved here: quietly editing a drift detector's expected value is the opposite of
what it is for. Updating it from 1066 to 1107 is a one-line owner decision that
should be made deliberately, and `validate_touch_closure` will keep reporting the
drift until it is.

### Handler-identity census (2026-09-03)

Every one of the redesign's 84 commands was censused against the handler identity
declared in `Plans/UI_Command_Catalog.md` and `Plans/Commands_System.md`. The two
catalogs agreed with each other on all 84; the wiring matrix did not, and now does.
**Result: 0 commands bound to more than one handler identity.**

What the census corrected:

- **43 wiring rows named a handler that the catalog does not declare.** They had
  been derived from the command's own namespace (`cmd.chat.todos.open` →
  `handlers::chat::todos_open`) rather than read from the catalog, which binds that
  command to its owner (`handlers::todo_runtime::todos_open`). Deriving a handler
  name from a command name is not a census; the catalog is the register and the
  rows now read it.
- **Two pre-Goal-V2 rows** (`catalog.chat_goal_start`, `catalog.chat_goal_update`)
  still pointed at `handlers::chat::goal_*` while the catalog had moved the binding
  to `handlers::goal_runtime::goal_*` under the simplified Goal runtime. Aligned.
- **`cmd.bsd.set`** was bound to both `handlers::back_seat_driver::set_mode` and the
  alias `handlers::bsd::set`, with a parallel `BSDModeSetRequest` contract family.
  `Plans/Back_Seat_Driver.md` §17 already said in prose that the alias must not be
  admitted and the existing binding wins; the catalog rows now match its own rule.
- **`cmd.settings.open`** carried the prose placeholder `existing Settings handler`,
  which is not an identity. Bound to `handlers::settings::open_route`.

One binding is **new and wants an owner's confirmation**: `cmd.chat.revert` had no
handler identity declared anywhere in either catalog, only prose saying it "routes
through the canonical FileSafe file-restore pipeline". Its wiring row carried the
placeholder `existing FileSafe handler`, which fails the handler pattern. It is now
`handlers::filesafe::restore_turn_manifest` — a name chosen to match the convention
and the command's documented behaviour, not one read from a register. If FileSafe's
owner spells it differently, this is the one place to change.
