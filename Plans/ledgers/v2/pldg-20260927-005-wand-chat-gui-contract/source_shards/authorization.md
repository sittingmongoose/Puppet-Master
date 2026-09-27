# Authorization and scope

Group G5 of the wand-modules canon compile: the redesign of the Puppet Master 5.6 Pro wand popups and their
in-chat presentation. This authorization is an attributed summary written by the canon planner; it is not a verbatim
user quote. Every relay below is agent-relayed and not verifiable from inside this repository.

## Authority

Jared's instruction of 2026-09-27, relayed in the lead plan: after the downstream impact audit, do all of it except
Slint production, Demo Studio removal, the PMConcept7 port and Settings (Settings_System.md, the settings inventory,
and where "Save as my default" is stored). The plans canon compile is inside that scope. Recorded in
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/LEAD-PLAN.md`, SHA-256 `d53f3f802bb9dd7736f1acf36256f8b9b799025bf6ab5212880dc03087649e72`, as read on 2026-09-27.

## Sources (frozen snapshots, cite by path and SHA-256)

- Design spec (J-1/J-2 owner amendments and IMPACT amendments at the top): `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`, SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`.
- Impact register (group B is this compile): `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md`, SHA-256 `71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493`.
- Scoped plan (group A scoping and provisional decisions): `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/SCOPED-PLAN.md`, SHA-256 `c9addf49714572d4fbc32c9936c62391333c2994b8091fd4f0853b96b613bf8d`.
- Coordination with the Chat WOW thread (binding): `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/COORDINATION.md`, SHA-256 `0bbcd8a1649f0e90dd93a5a18966c7a344442a8a99d1bb714afe91f8d168f076`.
- Owner decision cards (pending answers): `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`.

## Scope of this ledger

Register lines B-ACD-01..B-ACD-14, B-FGS-01..B-FGS-23. Owner documents this group may edit, and no other:

- `Plans/assistant-chat-design.md`
- `Plans/FinalGUISpec.md`
- `Plans/Decision_Log.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/DRY_Rules.md`

Reserved ID ranges (re-check the live maximum of each family on `origin/main` right before writing):

- ACD: `ACD-476..ACD-495`
- F3: `F3-566..F3-590`
- DL (NOW): `DL-109..DL-111`
- DL (card answers, later wave): `DL-112..DL-140`
- UIW: `UIW-025..UIW-029`
- DR: `DR-044..DR-045`

Only lines triaged NOW in the canon plan are compiled in this pass. A line triaged WAIT is recorded as an open
question naming its decision card; a line triaged OUT is not compiled.

## Owner answers (WAIT wave, 2026-09-27)

Jared answered the decision cards on 2026-09-27. The answers are recorded in
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256
`4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f` (agent-relayed, not verifiable from inside this
repository), and in `Plans/Decision_Log.md` as DL-110 to DL-134 (the card answers took DL-110 and DL-111 as well,
which this ledger had held for NOW items and did not use). Answer record `n05` carries the lead's recorded check of
Slint 1.18.1 that Jared's conditional answer to E-24 asked for. This ledger compiles only the WAIT lines of G5 whose
card was answered with a choice or an instruction that fixes the behaviour; a card answered with a question (E-11),
an instruction that leaves the behaviour open (E-02, E-36), or no card at all (E-16(2), the minimum chat width)
stays an open question.

## Lead rulings and the late card answer (follow-up, 2026-09-27)

The design lead ruled on Jared's behalf, citing his answers, on the cards whose answers needed follow-up. The rulings
reached this ledger through the canon follow-up task (agent-relayed, not verifiable from inside this repository) and
are recorded as "Lead ruling applied" paragraphs in both Decision Log sections: E-18 (DL-112), E-22 (DL-113), E-36
(DL-116), E-37 (DL-117), E-02 (DL-120) and E-33 (DL-131). E-24 is resolved as solid popups over a flat scrim (DL-114).
E-11 stays open: the lead's answer to Jared's question is recorded in DL-126 as a proposal awaiting his confirmation,
and nothing compiles from it. Card p11 (E-15) was answered option A at 2026-09-27T21:37:48Z, after the first Decision
Log pass; its answer is in the lead's updated ANSWERS.json, SHA-256
`d08c3551305290fafe43acaffd78d43f9f8d9cdb00a87e4d21bb34603a61969d`, and is recorded as DL-135. The Evidence copy
cited above (SHA-256 `4f8d3b25…`) predates that answer.

## The DL-120 and DL-116 rulings compiled into owner prose (2026-09-27)

The lead's rulings on E-02 (DL-120) and E-36 (DL-116), already recorded above and in both Decision Log sections, are
compiled into this ledger's owner documents on the same authority; no new ruling was needed or made. DL-120: Crew
Auto is the assistant's permission to start a Crew, on by default for a project; a chat's check overrides it for that
chat; the Collaborative Workflows evaluator (CWR-021) stays the gate; Build With Crew stays the user's choice; the
per-chat "Allow Crews in this chat" switch is retired into the check. DL-116: "Followed" counts a rule only when it was
given to the assistant and the finished reply passed that rule's check (assistant-memory-subsystem AMS-053); a failed
check shows "Missed 1 of your rules" with a way to see which and ask for a fix; a check that could not run earns no
tick. The behaviour stays with its owners (Collaborative_Workflows CWR-004, CWR-021 and CWR-038; AMS-053), and this
ledger's units point to them. Questions q-013 and q-014 are closed by this compile. The project default of Crew Auto
being on is a Settings change and is not made here.
