# Findings compiled by group G4 (wand-modules canon compile, 2026-09-27)

Source: impact register snapshot /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493); design spec /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de). One record per compiled register line; record-only and WAIT lines are in records/decisions.jsonl and records/questions.jsonl.

## Record 1 — AMS-01 (capsule preview display label): Capsule preview display label

The capsule preview ("What's in capsule now") is labelled "See what your next message will include". The Gist Review display name waits on p19 E-38.

Repairs AMS-047.

## Record 2 — AMS-03 (capsule preview counts notes only): Capsule preview counts notes only

The preview meter counts notes only against the 350-token capsule budget; rules never count against it.

Repairs AMS-018 and AMS-047.

## Record 3 — AMS-04 (out of date is a display group): Out of date is a display group

"Out of date" is a read-time display group of stale Verified gists, never a fourth verification_state.

Repairs AMS-014 and AMS-047.

## Record 4 — AMS-05 (in-chat memory traces): In-chat memory traces

"Noted" relaxes after 3 s, one Verified line per milestone, no noise when a note goes stale. The locked-rule decision line waits on p15 E-32.

Repairs AMS-047.

## Record 5 — AMS-07 (gist edit and half-life link): Gist Edit and half-life link

Edit is a versioned claim edit resetting to Unverified; half-life links to Settings through cmd.settings.open; cmd.chat.memory.edit has no GUI producer this wave. N-7 export waits on p15 E-32.

Repairs AMS-048.

## Record 6 — APR-01 (schedule line tokens and crew modes): Schedule line tokens and Crew modes

Secondary-truth tokens lead the Plan card schedule line; Build With Crew has plan-bound and scheduled modes.

Repairs APR-071.

## Record 7 — USE-01 (pre-start estimate contract): Pre-start estimate contract

A pre-start estimate contract owned by Usage, never a UsageRecord, always labelled, no figure without a basis.

Repairs UF-104.

## Record 8 — USE-02 (live run cost from usage_group_ref): Live run cost from usage_group_ref

Live cost from usage_group_ref with per-participant attribution; BSD usage separate. The effective limit waits on p16 E-33.

Repairs UF-105.
