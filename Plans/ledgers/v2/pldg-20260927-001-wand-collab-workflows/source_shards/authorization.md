# Authorization and scope

Group G1 of the wand-modules canon compile: the redesign of the Puppet Master 5.6 Pro wand popups and their
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

Register lines B-CW-01..B-CW-29. Owner documents this group may edit, and no other:

- `Plans/Collaborative_Workflows.md`

Reserved ID ranges (re-check the live maximum of each family on `origin/main` right before writing):

- CWR: `CWR-018..CWR-039`
- EP (later wave, E-31 only): `EP-129..EP-131`

Only lines triaged NOW in the canon plan are compiled in this pass. A line triaged WAIT is recorded as an open
question naming its decision card; a line triaged OUT is not compiled.

## WAIT wave (2026-09-27)

Jared answered the wand-modules decision cards on 2026-09-27. The answers are recorded in
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256
`4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`, and in `Plans/Decision_Log.md` as DL-110..DL-134
(both sections, written by group G5). This ledger compiles the G1 WAIT lines whose answers those entries settle, and
only the settled parts, citing the DL id in each unit. Lines answered with a question (DL-126), unanswered cards
(p11, p12, p14) and the parts a DL entry routes to lead follow-up stay open questions. Card n05 (E-24) is compiled by
the FinalGUISpec owner, not here. The owner exclusions above still apply.

## Lead-rulings follow-up (2026-09-27)

Several answers recorded in `Plans/Decision_Log.md` left a part to the design lead (DL-112, DL-117, DL-120, DL-131), and card
p11 (E-15) was answered after the WAIT wave (option A, 2026-09-27T21:37:48Z; the lead's updated answer file has SHA-256
`d08c3551305290fafe43acaffd78d43f9f8d9cdb00a87e4d21bb34603a61969d` and is not yet frozen in the evidence directory, and no
Decision_Log entry records p11 yet). The design lead ruled on those parts on the owner's behalf, citing his answers. This
ledger compiles those rulings into `Plans/Collaborative_Workflows.md` only, as dated additions to existing units and
in-place section edits, plus the section 18 leftover of register line B-CW-04. The ELI5 answer (DL-126) is recorded as the
lead's proposed answer and is not compiled. Settings consequences (the `auto_enabled` default, where a chat's Crew Auto
override is stored, Crew Auto's at-once count) are recorded as follow-ups and not written here.

(Updated after blind review cycle 1: p11 has since been recorded as DL-135 in `Plans/Decision_Log.md`, and its answer is
frozen in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json`, SHA-256
`33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5`, record p11. CWR-038, section 5.3 and dec-037 cite them.)

## Closure wave (E-11/E-19/E-31) (2026-09-27)

Jared settled the last three wand-modules cards in chat on 2026-09-27. The answers are recorded in the lead's answer file,
evidence copy `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json`, SHA-256
`33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5`, and in `Plans/Decision_Log.md`: DL-126 amended with the
owner's resolution of card p08 (E-11), DL-136 for card p12 (E-19) and DL-137 for card p14 (E-31). This ledger compiles DL-137
(register lines B-CW-22 and B-CW-21) and the ELI5 disclosure of B-CW-25 (DL-126). DL-136 has no G1 register line. The closure
wave may edit `Plans/Collaborative_Workflows.md`, and its own new units in `Plans/Executor_Protocol.md` (EP-129..EP-131, after
EP-128, which stays untouched) and `Plans/Automated_Testing_System.md` (ATS-063). Pre-assigned ranges: EP-129..EP-131,
CWR-040..CWR-044, ATS-063. Settings stay out of scope: the project scope the ELI5 project default needs on
`general.interaction.eli5-default` is recorded as an open question, not written. Schema, fixture, wiring and gate companions
are task 2.

## Companion task and ATS-062 (recorded 2026-09-27, after blind review cycle 1)

Register line B-CW-29 assigns this group the collaborative schema and fixture companions as task 2, which `.claude/CLAUDE.md`
("How to compile a ledger") keeps separate from the prose. The companion was written after each wave's prose was final:
`Plans/collaborative_workflows_contracts.schema.json`, `Plans/collaborative_workflows_contract_fixtures.json`, the
`CONTRACT_PAIRS` entry in `scripts/pm-new-contracts-verify.py`, the section 12 pointer to the pair, and the registration unit
ATS-062 in `Plans/Automated_Testing_System.md` (events evt-010 and evt-019). ATS-062 is reserved to this ledger; it was the
live maximum plus one when written. The blind review found it had no authorizing record (R-01), so atom
`atom-g1-cw-29-companion`, correction cor-046, queue item queue-046 and decision dec-048 now record it. The pair still owes three
additions from the lead-rulings wave, which ATS-062 now says it does not yet prove: the `CrewAutoSetRequest` scope
(`project | thread`), the run's `stop_reason` (required exactly when the run is cancelled) and the `crew_auto_receipt` source
surface of `cmd.chat.crew_auto.open_config`. They are task 2 work, not owner questions.

## Blind review cycle 1 (2026-09-27)

One blind form-driven review read the compiled units (findings R-01..R-18, verdict fix_then_land). The repairs edit only this
ledger's units and sections in `Plans/Collaborative_Workflows.md` and `Plans/Automated_Testing_System.md`. Where the owner's
answers left a design choice, the design lead's approved spec decides it and the ruling is recorded as a decision quoting the
spec (dec-049 from DESIGN-SPEC section 7.6, dec-050 from sections 8.0 G-29 and 8.1). Mechanical and reference repairs are
recorded in dec-051. What still needs the owner or new facts is recorded as open questions q-030..q-034, none blocking landing.
This is cycle one of at most two.
