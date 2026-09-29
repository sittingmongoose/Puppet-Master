# Findings for the active owner-answer compile

Historical source index: `Plans/ledgers/v2/pldg-20260927-005-wand-chat-gui-contract/source_shards/findings-through-main-1a501f3341.md`, SHA-256 `00b042815ad2927943a28319bba5f5737d5e5457396f0742f9c427def5fcf9eb`, preserves exact findings bytes from `origin/main` commit `1a501f334128f88bf94191dd1dd3fdd0b3a5c24c`. Prior atoms, decisions, corrections, events and compile queue items remain intact and retain token enforcement. Only the findings below claim current repairs against that base.

## Owner-answer compile scope — 2026-09-29

Earlier records describe already-landed historical compiles. The new records below alone claim changes against current origin/main for this Part B compile; the historical claims are archived byte-for-byte below and are not new repairs against this base.

## Record 58 — QA-05: Close the duplicate BSD status pairing

Source: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c); approved recommendation #05, DL-138.

Confirmed unchanged: Up to date / Caught up, Double-checking / Finding held and Paused: usage limit reached / Quota paused. Ledger pldg-20260927-002 q-005 already answered this in dec-012; DL-138 closes the duplicate without editing owner prose.

Duplicate closure only. Confirms unchanged F3-571 from ledger pldg-20260927-002 q-005 and dec-012; no current repair is claimed.

## Record 59 — QA-22: Adopt the bundled theme and NieR fonts

Source: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c); approved recommendation #22, DL-138.

Adopt Inter for Basic/Glass, Poppins with Nunito fallback for Friendly, IBM Plex Mono for Retro, and bundled PM NieR Sans/M PLUS 1 and PM NieR Mono/JetBrains Mono for NieR Mode with exact variable ranges and filenames. Retire the old current font names; preserve switching rules and local bundling.

Repairs F3-077, F3-430.

## Record 60 — QA-23: Set the editor split minimum chat width

Source: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c); approved recommendation #23, DL-138.

Set the chat pane minimum beside an open document to 360 px, keeping card S width based on its own content box. APR-038/APR-066 are legacy requirement labels owned by APR-014; the cumulative Chat prose changes too.

Repairs F3-569, APR-014.

## Record 61 — QA-24: Confirm theme motion scope

Source: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c); approved recommendation #24, DL-138.

Theme durations govern sheets and card-owned changes; transcript entrances keep shared timing/order, and opted-out wand cards get no second family entrance.

Repairs ACD-475, F3-566.

## Record 62 — QA-25: Persist the project ELI5 default

Source: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c); approved recommendation #25, DL-138.

The existing ELI5 default has project scope persisted through Settings SSYS-028; resolution stays chat override then project then app. This authorization supersedes the earlier pending-Settings instruction. Inventory companion remains a separate phase.

Repairs ACD-484, F3-581, SSYS-028.

## Record 63 — QA-06: Accept scheduled card Time-family compatibility

Source: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c); approved recommendation #06, DL-138.

Accept SQR-012 internal card layout and schedule time zone inside the ACD-469 Time family; the family phrase does not override Scheduling ownership.

Repairs ACD-469.

## Record 64 — QA-18: Finalize saved reply rule notes and draft-only fixes

Source: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c); approved recommendation #18, DL-138.

Use persisted AMS-053 outcomes; mixed results are one Missed-first line. Ask for a fix uses the existing draft-only action with a taught_rule_check source variant and empty-composer refusal, without sending or executing.

Repairs ACD-477, F3-579.

## Record 65 — QA-14: Store the Crew Auto thread override

Source: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c); approved recommendation #14, DL-138.

Persist nullable crew_auto_override on existing thread metadata, where absent/null inherits project and scope thread writes only the override. The related CWR-038 and Settings prose belong to their assigned owners.

Repairs ACD-076.

## Record 66 — QA-00: Record owner approval of all twenty-nine answers

Source: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c); approved recommendation #00, DL-138.

The integrator writes DL-138 with the exact owner quote, all twenty-nine recommended answers and the two-face NieR amendment, citing the answer file and SHA-256.

Repairs DL-138.

## Assigned companion follow-through — 2026-09-29

After all six prose witnesses passed and integrator released the phase, added ThreadCrewAutoOverride as a field-only schema of existing ACD-076 metadata (no durable family/key/writer/Settings value), four valid cases for true/false/null/absent, three one-constraint invalid cases and two ELI5 project-write exclusion negatives. Chat fixtures are 31 valid/55 invalid; focused shape check passes with exactly one failing constraint in each new negative. Runtime reopen persistence remains unproven.

## Settings and concept integration reported complete — 2026-09-29

Integrator reports the Settings companions complete: general.interaction.eli5-default has global and project scope with chat > project > app precedence; branching.crew.crew-auto-enabled defaults true, has global/project/run applicability and documents the existing thread-metadata override, with no new setting ID. Inventory validation exited 0. The current onboarding build republished Concepts/PMConcept7.html and Concepts/TestOpus5.5PmConcept.html; fresh build --check exited 0 and the tour passed all 7 scenarios. The inventory entries and generated output paths were inspected by this ledger author; validation/build/tour results are attributed to the integrator, not independently rerun here. This closes the Settings/inventory/PMConcept7 companion follow-up for questions #14/#25 only; it does not claim global companion, review, landing, runtime or governance completion.

## Blind compile review cycle 1 — source-preserving corrections

Reconciled the shared Event Authority and snapshot decisions, added the composer-only Reviewing exception to F3-571, and corrected the all-answers atom to GUI-related. The ELI5 app-default conflict is handled by the separately recorded owner resolution or open question.

Review source: `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/review-packets/ledger005-cycle1/findings.jsonl sha256:63a1be47cb298983309c3c249627273b4499bfd073dc02b03c4bf3785a6f515c`. Event `evt-025`, correction `cor-067`. These are fidelity repairs under the accepted answers; they create no runtime evidence or governance seal.

## DL-138 final compile review disposition

DL-138 prose and companion compile reviewed through the two-cycle cap; every finding is dispositioned in Plans/ledgers/v2/pldg-20260927-005-wand-chat-gui-contract/validation/blind_review_cycle2.json. Required deterministic checks pass except the explicitly allowed governance coverage errors and normal assistant checker exit 1 with errors empty. Open owner questions remain recorded; no native runtime or governance seal is claimed.

Event `evt-026`. Raw review source: `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/review-packets/ledger005-cycle2/findings.jsonl`; SHA-256 `e8426d95dc52327e226b3a9bb032a8b47ab3cc3912d9c0e30ddfc9cec83c670c`.
