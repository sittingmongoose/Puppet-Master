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

## Blind review cycle 1 (2026-09-27)

Blind form-driven review of ledger 004, cycle 1 of 2, findings R-01..R-10 (reviewer output findings.jsonl, SHA-256 b963f2283d0461f23aa30dd9506974e29623b688a91f9622a9be81d66f68e1e9; not frozen as evidence). Three should_fix findings were repaired in this ledger's own units (event evt-006, decision dec-009); seven note findings are open questions q-008..q-014. The UF-106 repair relies on canon already in Plans/Collaborative_Workflows.md (CWR-029 and the run states paragraph), compiled from the lead's DL-131 follow-up by ledger 001.

## Blind review cycle 1, lead pass (2026-09-27)

Canon lead's pass over the blind review cycle 1 open items of ledger 004 (2026-09-27). One lead ruling from the approved design spec (DESIGN-SPEC §8.10, /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)) compiled into AMS-049; record and reference hygiene in P-057, Personas §6 and the AMS addendum intro (event evt-007, decision dec-010, corrections corr-019..022). Nothing the spec or an owner answer does not state was compiled.

## DL-138 answer wave (2026-09-29)

Jared approved all 29 recommendations in /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c); DL-138 records the answer set. This phase compiles the owner prose and question closures listed below. Schema, fixture, gate and registry companions remain a separate pending phase. The prior source and review history above remains intact.

- q-006: Usage reads the effective hard cap; owner targets UF-106. Companion work remains pending.

- q-007: Rule check outcomes and fix action are specified; owner targets AMS-053, CWR-031. Companion work remains pending.

- q-008: Back Seat Driver uses canonical persona ID; owner targets P-057, BSD-022.

- q-009: Mixed rule checks show one Missed-first line; owner targets AMS-053.

- q-014: Each estimate figure follows its own basis; owner targets UF-104. Companion work remains pending.

The previous findings.md bytes from origin/main 1a501f3341 are archived at `Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage/source_shards/findings-through-main-1a501f3341.md`, SHA-256 `9fea1f6dc5792ecbe7a29948ff1f6ed7acfc87b457d4069c693aa563977dfa5d`. The active findings.md now states only DL-138 repair claims; historical records and lineage remain in the archive, and historical atom/queue/decision/event streams are unchanged.

## DL-138 companion phase (2026-09-29T22:53:13+00:00)

The owner-authorized second phase adds the typed schema/fixture companions after the required prose witness. DL-138 memory/usage companions compiled after prose witness: assistant memory schema and fixtures add saved rule_check_outcomes, typed Teach confirm/lock/revoke pairs and ArtifactExportResult; usage estimate schema and fixtures make cost and duration independently conditional on their own basis. Tagged taught-rule composer source is the Collaboration pair. Focused checks and repository-wide static checker pass. Blind review, aggregate gates, regeneration and governance remain outside this event. Static verification report: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/part-b-collab-contracts-verify.json (SHA-256 1d8bb7ea8c52f1cf808ad7e79e2c555e3f17c712742ee09efa82e578dcff7ff0). Full-ledger witness: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/part-b-004-witness-companion.log (SHA-256 b97e3af3e55b8898a9417dbc3e093a41bdb0cb32b1896e7f1d20316d9b87f714). This records no runtime, implementation, UI, performance or governance claim.

## Blind compile review cycle 1 — source-preserving corrections

Reconciled the shared BSD state/error and composer-table findings using existing typed owners, qualified UF-106 acceptance by the effective hard cap, retained event registration as approved but outstanding, and recorded the explicit after-Plans-landing snapshot/baseline policy. No invented stale_view enum replaces the existing stale_projection error.

Review source: `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/review-packets/ledger004-cycle1/findings.jsonl sha256:48681264c37cc4cc939000395935d6d20abe4b6094238d888b8881d2961a3e83`. Event `evt-011`, correction `cor-028`. These are fidelity repairs under the accepted answers; they create no runtime evidence or governance seal.

## DL-138 final compile review disposition

DL-138 prose and companion compile reviewed through the two-cycle cap; every finding is dispositioned in Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage/validation/blind_review_cycle2.json. Required deterministic checks pass except the explicitly allowed governance coverage errors and normal assistant checker exit 1 with errors empty. Open owner questions remain recorded; no native runtime or governance seal is claimed.

Event `evt-012`. Raw review source: `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/review-packets/ledger004-cycle2/findings.jsonl`; SHA-256 `dce23c0af1be91e3ded5f10cba3f913f42847de169762be9fc94515adbc3744b`.
