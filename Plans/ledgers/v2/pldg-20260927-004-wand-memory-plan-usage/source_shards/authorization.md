# Authorization and scope

Group G4 of the wand-modules canon compile: the redesign of the Puppet Master 5.6 Pro wand popups and their
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

Register lines B-AMS-01..B-AMS-08, B-APR-01..02, B-PER-01..02, B-USE-01..02. Owner documents this group may edit, and no other:

- `Plans/assistant-memory-subsystem.md`
- `Plans/Assistant_Plan_Runtime.md`
- `Plans/Personas.md`
- `Plans/usage-feature.md`
- `Plans/Models_System.md`

Reserved ID ranges (re-check the live maximum of each family on `origin/main` right before writing):

- AMS: `AMS-047..AMS-056`
- APR: `APR-071..APR-075`
- P (later wave, E-35 only): `P-057..P-062`
- UF: `UF-104..UF-110`
- MS: `MS-140..MS-143`

Only lines triaged NOW in the canon plan are compiled in this pass. A line triaged WAIT is recorded as an open
question naming its decision card; a line triaged OUT is not compiled.

## WAIT wave authority (2026-09-27)

Jared answered the owner decision cards on 2026-09-27. The answers are recorded in `Plans/Decision_Log.md` (both sections) and the
answer records are frozen at `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`
(agent-relayed; not verifiable from inside this repository). This ledger compiles the answers to the cards its WAIT
lines named: DL-134 (p19, E-38), DL-130 (p15, E-32), DL-116 (n07, E-36), DL-133 (p18, E-35) and DL-131 (p16, E-33).
Where an answer left a definition to be written (DL-116 following, DL-131 the ending at the limit), only the decided
part compiles and the rest stays an open question. Of the held range `P-057..P-062`, P-057 and P-058 are used.

## Lead ruling authority (2026-09-27)

DL-116 left the definition of following to the Plans. The design lead ruled on it on the owner's behalf, citing his answer to card n07 (option B): a rule counts as followed when it was given to the assistant AND the finished reply passed that rule's check (the rule's testable statement compared with the reply); a failed check shows "Missed 1 of your rules" with a way to see which and ask for a fix; if no check could run, no tick. Author G46 compiled that ruling into AMS-053 (event evt-005, decision dec-008). The ruling reached the author in its task text and is not frozen as a file; the DL-116 entry in `Plans/Decision_Log.md` is G5's to annotate. AMS-053 uses the next free id of the reserved range `AMS-047..AMS-056`.
