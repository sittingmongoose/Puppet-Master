# Findings compiled by group G4 (wand-modules canon compile, 2026-09-27)

Source: impact register snapshot /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493); design spec /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de). One record per compiled register line; record-only and WAIT lines are in records/decisions.jsonl and records/questions.jsonl.

## Record 1 — AMS-01 (capsule preview display label): Capsule preview display label

The capsule preview ("What's in capsule now") is labelled "See what your next message will include". The Gist Review display name waits on p19 E-38.

Repairs AMS-047.

Superseded in part: the display name is answered (DL-134), see Record 9.

## Record 2 — AMS-03 (capsule preview counts notes only): Capsule preview counts notes only

The preview meter counts notes only against the 350-token capsule budget; rules never count against it.

Repairs AMS-018 and AMS-047.

## Record 3 — AMS-04 (out of date is a display group): Out of date is a display group

"Out of date" is a read-time display group of stale Verified gists, never a fourth verification_state.

Repairs AMS-014 and AMS-047.

## Record 4 — AMS-05 (in-chat memory traces): In-chat memory traces

"Noted" relaxes after 3 s, one Verified line per milestone, no noise when a note goes stale. The locked-rule decision line waits on p15 E-32.

Repairs AMS-047.

Superseded in part: the locked-rule decision line is answered (DL-130), see Records 10 and 16.

## Record 5 — AMS-07 (gist edit and half-life link): Gist Edit and half-life link

Edit is a versioned claim edit resetting to Unverified; half-life links to Settings through cmd.settings.open; cmd.chat.memory.edit has no GUI producer this wave. N-7 export waits on p15 E-32.

Repairs AMS-048.

Superseded in part: N-7 export is answered (DL-130), see Record 12.

## Record 6 — APR-01 (schedule line tokens and crew modes): Schedule line tokens and Crew modes

Secondary-truth tokens lead the Plan card schedule line; Build With Crew has plan-bound and scheduled modes.

Repairs APR-071.

## Record 7 — USE-01 (pre-start estimate contract): Pre-start estimate contract

A pre-start estimate contract owned by Usage, never a UsageRecord, always labelled, no figure without a basis.

Repairs UF-104.

## Record 8 — USE-02 (live run cost from usage_group_ref): Live run cost from usage_group_ref

Live cost from usage_group_ref with per-participant attribution; BSD usage separate. The effective limit waits on p16 E-33.

Repairs UF-105.

Superseded in part: the effective limit is answered (DL-131), see Record 14.

<!-- WAIT wave, 2026-09-27: register lines compiled from the owner's card answers recorded in Plans/Decision_Log.md. -->

## Record 9 — AMS-01 (gist review display name): Gist Review display name

On screen the panel reads "Notes it took"; "Gist Review" stays the canonical name in data (DL-134).

Repairs AMS-049.

## Record 10 — AMS-05 (locked-rule decision line): Locked-rule decision line

A proposal to change a locked rule earns one chat line and a Memory decision; the rule changes only by the user's edit (DL-130).

Repairs AMS-050.

## Record 11 — AMS-06 (taught rules included in a reply): Taught rules included in a reply

included_teaching_ids on the reply's context record; inclusion is never shown as "Followed"; the definition of following stays open (DL-116).

Repairs AMS-051.

Superseded in part: the definition of following is compiled in AMS-053, see Record 15.

## Record 12 — AMS-07 (memory export command): Memory export command

N-7 is registered as cmd.chat.memory.export {scope} through the artifact owner (DL-130).

Repairs AMS-052.

## Record 13 — PER-01 (team personas and grill me identity): Team Personas and Grill Me identity

The six team Personas are registered with stable IDs, product-manager's exclusion is superseded for team use, and Grill Me is a methodology Skill (DL-133).

Repairs P-048, P-057 and P-058.

## Record 14 — USE-02 (live cost against the effective limit): Live cost against the effective limit

A run's own time or cost limit overrides the general run limit and the live cost is shown against it; the ending at the limit stays open (DL-131).

Repairs UF-106.

Superseded in part: the ending at the limit points to CWR-029, see Record 16; only the hard ceiling stays open (q-006).

## Record 15 — AMS-06 (definition of following): What counts as following a taught rule

A rule is followed only when it was included for the reply and the finished reply passed the rule's check; a failed check shows "Missed 1 of your rules"; no check, no tick (DL-116, design lead ruling 2026-09-27).

Repairs AMS-051 and AMS-053.

<!-- Blind review cycle 1, 2026-09-27: repairs of the should_fix findings. -->

## Record 16 — BRG4-01, BRG4-02, BRG4-03 (blind review cycle 1 R-01..R-03): Limit ending, decision line, schedule-line token owner

UF-106 points a run's ending at its limit to CWR-029 and keeps only the hard ceiling open; AMS-050 is the one memory event that earns a decision line; APR-071 attributes Schedule needs update to the Build At notice, not PFAIL-002.

Repairs AMS-050, APR-071 and UF-106.

<!-- Blind review cycle 1, lead pass, 2026-09-27. -->

## Record 17 — BRG4-04, BRG4-06, BRG4-08, BRG4-09 (blind review cycle 1 lead pass): State labels, supersession, normalization, intro attribution

AMS-049 cites card p19's scope and DESIGN-SPEC §8.10 for keeping the verification_state words as labels; P-057 records that it supersedes P-048's product-manager exclusion only; Personas §6 lists the critical_advisor normalization; the AMS addendum intro attributes AMS-053 to the lead's ruling.

Repairs AMS-049 and P-057.
