# Findings compiled by this ledger

Each record is one NOW line of register group B3 (Back Seat Driver) from the impact register snapshot
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md` (SHA-256 `71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493`),
compiled from the design spec snapshot `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`
(SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`). It says what canon said, what the redesign needs,
and the unit the prose compile created. Only the NOW part of a partial line is compiled; the WAIT parts are open questions
q-001 to q-003. The record-only line B-BSD-09 is a decision with no owner edit, and B-BSD-06 is out of scope (Settings), so
neither has a record here.

## Record 1 — BSD-03 (margin note): The advisor note, its aside weight and its attribution

Canon §20 let an emitted finding appear as "an attributable BSD advice card or inline advisory", and §8 preserved
interrupting advice for a stopped run "as a visible card". The redesign never uses a card for BSD: an emitted finding is a
margin note at the step boundary with a kicker, a short title, a short body, a fine line naming the version and the
effective advisor, Why? and a dismissal control, and nits and cooldown notes collapse to a one-line aside that expands in
place. Canon's rule 7 of §8 and the §11 cooldown already name non-interrupting asides; nothing said how an aside looks or
how the note is attributed.

Repairs BSD-030. §20's advice paragraph and §8's stopped-run sentence now describe the note and point at the unit, which
supersedes the word "card" in the older units for presentation only. The dismissal control's command is left to q-003.

## Record 2 — BSD-08 (projection fields): One owner projection, a stamped weight, and one row key

The compact Context row and its nine states were canon, but no projection field said when the advisor last checked or how
far behind it is, three surfaces could keep their own status words, and nothing stopped a renderer deriving a note's weight
from the current cooldown, which re-weights old notes on replay. Three stage vocabularies existed in the concept.

Repairs BSD-031. §16 now adds `presentation_weight` to the finding record, stamped once at emission, and an owner-projection
paragraph with `context_state`, `last_checked_at` and `generations_behind` and one word table; the 2026-09-10 row mapping
is named the one projected key. The words of the table wait on q-001.

## Record 3 — BSD-02 (stale critical): The stale label keeps its tokens in data

The terminal-timeout rule required unreconfirmed critical advice to be "labeled stale and unreconfirmed" with its
generation. The redesign prints the generation as a version and a plain sentence that it was not re-checked, so the tokens
have to survive in the finding's data whatever words are printed, and the stale look has to differ from a current note.

Repairs BSD-032. §8's terminal-timeout paragraph and §20's stale sentence now say the tokens stay in data with
`raised_against_generation` and the note draws with a stale treatment; the printed words wait on q-001.

## Record 4 — BSD-05 (session controls): Assignment commands, Usage navigation and the transcript note surface

§17 listed the assignment commands and `cmd.bsd.open_usage` but did not bind the Pause, Resume and Stop advisor controls or
the safety-pause resume to them, the concept replaced Usage navigation with a local raw-data view, and the command family's
source surfaces did not include the transcript note that §20 describes.

Repairs BSD-033. §17 now carries the one-to-one mapping, says the open_usage row navigates to the Usage page and that no
local view substitutes, and names `bsd_note` as a source surface. The dismissal and catch-up release commands wait on q-003.

## Record 5 — BSD-07 (extra cost): The estimate comes from Usage history or says it depends

§21 said unknown cost stays unknown, but the configuration footer showed a fixed range as an estimate.

Repairs BSD-034. §21 now requires the Extra cost line to be computed from BSD Usage history, to read "Cost depends on the
work" without usable history or with unknown cost, and never to show zero for unknown.
