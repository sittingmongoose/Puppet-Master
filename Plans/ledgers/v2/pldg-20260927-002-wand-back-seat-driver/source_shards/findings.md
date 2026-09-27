# Findings compiled by this ledger

Each record is one NOW line of register group B3 (Back Seat Driver) from the impact register snapshot
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md` (SHA-256 `71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493`),
compiled from the design spec snapshot `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`
(SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`). It says what canon said, what the redesign needs,
and the unit the prose compile created. Records 1 to 5 are the NOW wave; their WAIT parts were open questions q-001 to
q-003. Records 6 to 10 are the WAIT wave, compiled after Jared answered cards n01, p04 and p15 on 2026-09-27 (DL-110,
DL-122 and DL-130 in `Plans/Decision_Log.md`); q-001 to q-003 are answered, and q-004 and q-005 stay open. The record-only line B-BSD-09 is a decision with no owner edit, and B-BSD-06 is out of scope (Settings), so
neither has a record here.

## Record 1 — BSD-03 (margin note): The advisor note, its aside weight and its attribution

Canon §20 let an emitted finding appear as "an attributable BSD advice card or inline advisory", and §8 preserved
interrupting advice for a stopped run "as a visible card". The redesign never uses a card for BSD: an emitted finding is a
margin note at the step boundary with a kicker, a short title, a short body, a fine line naming the version and the
effective advisor, Why? and a dismissal control, and nits and cooldown notes collapse to a one-line aside that expands in
place. Canon's rule 7 of §8 and the §11 cooldown already name non-interrupting asides; nothing said how an aside looks or
how the note is attributed.

Repairs BSD-030. §20's advice paragraph and §8's stopped-run sentence now describe the note and point at the unit, which
supersedes the word "card" in the older units for presentation only. The dismissal control's command was left to q-003
(answered; see Record 8).

## Record 2 — BSD-08 (projection fields): One owner projection, a stamped weight, and one row key

The compact Context row and its nine states were canon, but no projection field said when the advisor last checked or how
far behind it is, three surfaces could keep their own status words, and nothing stopped a renderer deriving a note's weight
from the current cooldown, which re-weights old notes on replay. Three stage vocabularies existed in the concept.

Repairs BSD-031. §16 now adds `presentation_weight` to the finding record, stamped once at emission, and an owner-projection
paragraph with `context_state`, `last_checked_at` and `generations_behind` and one word table; the 2026-09-10 row mapping
is named the one projected key. The words of the table waited on q-001 (answered; see Record 9).

## Record 3 — BSD-02 (stale critical): The stale label keeps its tokens in data

The terminal-timeout rule required unreconfirmed critical advice to be "labeled stale and unreconfirmed" with its
generation. The redesign prints the generation as a version and a plain sentence that it was not re-checked, so the tokens
have to survive in the finding's data whatever words are printed, and the stale look has to differ from a current note.

Repairs BSD-032. §8's terminal-timeout paragraph and §20's stale sentence now say the tokens stay in data with
`raised_against_generation` and the note draws with a stale treatment; the printed words waited on q-001 (answered; see
Record 10).

## Record 4 — BSD-05 (session controls): Assignment commands, Usage navigation and the transcript note surface

§17 listed the assignment commands and `cmd.bsd.open_usage` but did not bind the Pause, Resume and Stop advisor controls or
the safety-pause resume to them, the concept replaced Usage navigation with a local raw-data view, and the command family's
source surfaces did not include the transcript note that §20 describes.

Repairs BSD-033. §17 now carries the one-to-one mapping, says the open_usage row navigates to the Usage page and that no
local view substitutes, and names `bsd_note` as a source surface. The dismissal and catch-up release commands waited on
q-003 (answered; see Record 8).

## Record 5 — BSD-07 (extra cost): The estimate comes from Usage history or says it depends

§21 said unknown cost stays unknown, but the configuration footer showed a fixed range as an estimate.

Repairs BSD-034. §21 now requires the Extra cost line to be computed from BSD Usage history, to read "Cost depends on the
work" without usable history or with unknown cost, and never to show zero for unknown.

## Record 6 — BSD-01 (status words): Plain words replace the three official status words

Canon printed `Caught up`, `Finding held` and `Quota paused` and preserved them as exact tokens of BSD-018; the redesign
wrote "Up to date", "Double-checking" and "Paused: usage limit reached". Jared chose plain words only and a matching change
to the Plans (card n01, recorded as DL-110), so the old words are superseded as printed words and kept as state names and
in data.

Repairs BSD-035. §20 now carries a plain-status-words paragraph and a truthfulness sentence that moves with the word, and
§16's owner-projection paragraph points at the unit. BSD-018 is left intact, with its tokens, as the name of the states.

## Record 7 — BSD-04 (details short form): BSD Context Details as three facts and native disclosures

Canon's §25 (APR-061) kept native metric cards for BSD in Context More Details after the 2026-09-08 rollback; the redesign
shows three plain facts and three native disclosures. Jared allowed the short list for these (card p04, recorded as
DL-122), as an exception scoped to the four collaboration kinds and BSD's details.

Repairs BSD-036. §25 gains a scoped-exception bullet for BSD's details only, and §20's Context Details paragraph now names
the short form and says every field it lists stays reachable inside a disclosure.

## Record 8 — BSD-05 (dismiss and don't wait): Two new commands for the transcript note

Canon's §9 describes a durable dismissal and §11 says every catch-up wait is user-abortable, but no command wrote either.
Jared added all seven proposed commands (card p15, recorded as DL-130), which include Dismiss advice and Don't wait.

Repairs BSD-037 and BSD-033. §17 gains the `cmd.bsd.finding.dismiss` and `cmd.bsd.catch_up.release` rows and says their
catalogue rows belong to the command census, §18 gains their two requests, §20's advice paragraph binds the dismissal
control, and the session-controls paragraph and BSD-033 now point at the new unit instead of an open question.

## Record 9 — BSD-08 (word table): The words of the one word table

The NOW wave created one word table keyed by `context_state` and left its words open. With DL-110 answered, the table
prints a plain word for each of the nine states, and a word may be followed only by plain facts from the projection.

Repairs BSD-035. The wording for an advisor the user paused is not decided by the card and is open question q-004; the
lead's confirmation of the pairing order is q-005.

## Record 10 — BSD-02 (stale label): The printed label of the stale critical note

The NOW wave kept `stale` and `unreconfirmed` in the finding's data and left the printed label to the word table. Under
DL-110's plain words, the note prints "About an earlier version (vN): not re-checked", the label the register line named.

Repairs BSD-035. §20's advice paragraph now says the stale note prints the plain label of that unit.
