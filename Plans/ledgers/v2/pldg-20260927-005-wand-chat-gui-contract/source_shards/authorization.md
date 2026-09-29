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
and nothing compiles from it. (Superseded by the closure wave below: Jared confirmed the answer, DL-126 carries the Owner
resolution, and ELI5 compiles from it; dec-044, findings Records 41-43.) Card p11 (E-15) was answered option A at 2026-09-27T21:37:48Z, after the first Decision
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

## Closure wave: owner answers E-11, E-19 and E-31 (2026-09-27)

Jared settled the last three cards in chat on 2026-09-27. The answers are recorded in
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json`, SHA-256
`33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5` (agent-relayed, not verifiable from inside this
repository), and in `Plans/Decision_Log.md` by the closure wave's Decision Log author, not by this ledger.

- DL-126 (card p08, E-11, card SHA-256 `dab0b89fb497bbad7b64c1ec6b564036c1b2cfcf6b97344cd6184e034f557791`): Jared confirmed the
  design lead's answer to his question. ELI5 keeps a project-level default; a chat's own override replaces it for that chat;
  switching changes only later replies and never produces a second response; "Explain this reply simply" writes one extra reply
  only when asked; the popup with the quick dot; dual copy only for tooltips and help; the tour is re-pointed. Compiled here as
  ACD-484, F3-581 and ATS-065 with in-place amendments; q-001 is closed.
- DL-136 (card p12, E-19, option A, card SHA-256 `c7eaa3c2d9fd5ab08c974f68ec0fb9be955f5b66a7ebd73ad5cacf22e437b856`): a
  project-wide pause of scheduled sends and builds that only the user clears, through `cmd.runtime.automation_pause.set`.
  Record-only in this ledger; groups G3 and G6 compile it.
- DL-137 (card p14, E-31, option A, card SHA-256 `57721ff4987cf0671822f08ca373077083ba39fc7f8310a951b23b3cd630efca`): live
  helper text in running collaboration cards, reusing the reply streaming of EP-128; the finished message still lands once.
  Record-only in this ledger; group G1 compiles it.

Settings documents stay excluded by the owner. The project scope of `general.interaction.eli5-default` is recorded as q-015,
"Settings follow-up (out of scope for the wand-modules compile)". The guided tour re-point is the tour owner's obligation,
named in ACD-484 and recorded as q-016.

## Tour ELI5 re-point and the assistant chat contract pair (2026-09-27)

No new owner answer. The guided tour re-point is the obligation DL-126 (card p08, cost line "The tour needs re-pointing to the new
popup.") and ACD-484 name, recorded as q-016 in the closure wave; it is compiled here under the same approval. The assistant chat
contract pair is the companion that Commands_System and UI_Command_Catalog already route to (q-017). Remaining tour canon outside this
compile is q-018; the component capture list destination kind is q-019.

## Scope extensions after the first pass (recorded 2026-09-27, blind review cycle 1)

The scope section above lists the five owner documents of the first pass. Later waves of this ledger, each assigned by the design lead
in its task (agent-relayed, not verifiable from inside this repository), also edited these, and nothing else:

- `Plans/Automated_Testing_System.md`: new ATS-065 (the ELI5 acceptance checks of DL-126, closure wave, evt-011) and ATS-020 (the tour
  acceptance re-point, evt-014). Reserved ID range `ATS-065` (closure wave), recorded in `state/compile_queue.json`.
- `Plans/Planning_Wizard.md`: PWIZ-023 and its guided tour section prose (the tour re-point DL-126 and ACD-484 name, evt-012, evt-016).
- `Plans/Commands_System.md`: CS-087's companion sentence and registry (evt-014). CS-087 is a unit that ledger
  `pldg-20260927-006-wand-command-census` introduces on this branch; this ledger's amendment of it lands only together with that ledger.
- `Plans/00-plans-index.md`: one Change Summary entry registering the assistant chat contract pair (evt-014), prose outside any PlanUnit.

Basis: DL-126 (card p08, Jared's confirmed resolution) and the card's cost line ("The tour needs re-pointing to the new popup.") for the tour and ELI5 checks,
and the companion obligation q-017 for the contract pair pointers. atom-g5-t-tour-01's constraint against editing tour canon outside its
wave applied to that wave only; atom-g5-t-tour-02 re-pointed the Automated_Testing_System tour checks afterwards.

## Current authorization — owner answers, 2026-09-29

/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c) records Jared's approval of every recommended answer to all 29 questions, with the two NieR fonts amendment, now DL-138. This authorization supersedes the earlier Settings exclusion for the requested follow-ups and the Chat WOW no-edit instruction only for the scheduled-card compatibility and motion-scope confirmations. Assigned parallel agents may coordinate the owner documents; no production implementation or governance seal is authorized by this compile. Old scope statements above record their historical waves, not the active next action. Prose comes first; witness then separate companion work, blind review (maximum two cycles), regeneration and integrator landing follow.

Historical findings scope: Plans/ledgers/v2/pldg-20260927-005-wand-chat-gui-contract/source_shards/findings-through-main-1a501f3341.md (SHA-256 00b042815ad2927943a28319bba5f5737d5e5457396f0742f9c427def5fcf9eb) is a byte-preserving archive of the already-landed origin/main 1a501f3341 findings. Active findings name only this compile's repairs. This is source-memory maintenance, not a changed owner obligation or weakened validator. The full actual-ledger witness remains required.

## Post-witness companion release — 2026-09-29

The integrator explicitly released this phase after all six actual-ledger prose witnesses passed, including the Storage prose companion scope. This ledger's assigned companion outputs are `Plans/assistant_chat_contracts.schema.json`, `Plans/assistant_chat_contract_fixtures.json`. The scope permits static contracts and fixtures only; root owns shared gate pins, Settings inventory, regeneration and landing.

## Blind compile review cycle 1 — source-preserving corrections

Reconciled the shared Event Authority and snapshot decisions, added the composer-only Reviewing exception to F3-571, and corrected the all-answers atom to GUI-related. The ELI5 app-default conflict is handled by the separately recorded owner resolution or open question.

Review source: `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/review-packets/ledger005-cycle1/findings.jsonl sha256:63a1be47cb298983309c3c249627273b4499bfd073dc02b03c4bf3785a6f515c`. Event `evt-025`, correction `cor-067`. These are fidelity repairs under the accepted answers; they create no runtime evidence or governance seal.

## DL-138 final compile review disposition

DL-138 prose and companion compile reviewed through the two-cycle cap; every finding is dispositioned in Plans/ledgers/v2/pldg-20260927-005-wand-chat-gui-contract/validation/blind_review_cycle2.json. Required deterministic checks pass except the explicitly allowed governance coverage errors and normal assistant checker exit 1 with errors empty. Open owner questions remain recorded; no native runtime or governance seal is claimed.

Event `evt-026`. Raw review source: `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/review-packets/ledger005-cycle2/findings.jsonl`; SHA-256 `e8426d95dc52327e226b3a9bb032a8b47ab3cc3912d9c0e30ddfc9cec83c670c`.
