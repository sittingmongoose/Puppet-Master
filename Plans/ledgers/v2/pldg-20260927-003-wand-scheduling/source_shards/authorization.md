# Authorization and scope

Group G3 of the wand-modules canon compile: the redesign of the Puppet Master 5.6 Pro wand popups and their
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

Register lines B-SQR-01..B-SQR-09. Owner documents this group may edit, and no other:

- `Plans/Scheduling_and_Quota_Resume.md`

Reserved ID ranges (re-check the live maximum of each family on `origin/main` right before writing):

- SQR: `SQR-012..SQR-024`
- SMSG: `SMSG-019..SMSG-024`
- PSCHED: `PSCHED-015..PSCHED-018`

Only lines triaged NOW in the canon plan are compiled in this pass. A line triaged WAIT is recorded as an open
question naming its decision card; a line triaged OUT is not compiled.

## Closure wave (E-11/E-19/E-31), 2026-09-27

Jared answered decision card p12 (register E-19, "A \"Pause all automations\" switch") in chat on 2026-09-27,
approving option A, "Build a project-wide pause": one switch that stops every scheduled send and build until the
user turns it back on. The answer is recorded in
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json`, SHA-256
`33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5`, and in `Plans/Decision_Log.md` as DL-136.
Agent-relayed, not verifiable from inside this repository.

The answer releases the WAIT line B-SQR-05 and lifts the earlier fences on SQR-001, the section 1 `user_stop_epoch`
paragraph and the section 3 eligibility predicate only as far as E-19 needs. For this wave the lead also admitted,
for this group's own units only:

- `Plans/Assistant_Plan_Runtime.md`, a few sentences in section 3, "Build With Crew and Build At", so that Plan builds honour the project pause;
- `Plans/Automated_Testing_System.md`, one unit, `ATS-064`.

The fixed names used are the command `cmd.runtime.automation_pause.set` (project-scoped, payload `paused` true or
false) and the new SQR unit `SQR-018` from this ledger's reserved range.

## Blind review cycle 1, 2026-09-28

The blind form-driven review of this ledger (cycle 1 of at most 2) returned eleven findings, R-01..R-11. The canon
author repaired them inside the units and sections this ledger already edits: `Plans/Scheduling_and_Quota_Resume.md`
(section 1 precedence paragraph and Settings boundary, SQR-001, SQR-006, section 3 Build At and eligibility list,
section 5 negative tests, SMSG-012..018, v3 APR-027, SQR-012, SQR-014, SQR-015, SQR-018), the one
`Plans/Assistant_Plan_Runtime.md` section 3 paragraph admitted in the closure wave, and ATS-064. Lead rulings
from the design spec are `dec-009` (section 8.9) and `dec-010` (section 8.7, G-33), quoted from
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md` (SHA-256
`dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`). Nothing in `Plans/UI_Command_Catalog.md` or
`Plans/Wiring_Matrix.md` was edited.
