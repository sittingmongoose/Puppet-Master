# D2 independent source and patch review

Canonical patch disposition: PASS for planning fidelity at the snapshot below. No necessary canonical repair identified. Ledger semantic mapping and final receipt housekeeping also pass. This receipt does not claim runtime acceptance, successful gates, implementation, governance seal or D3–D5 completion.

Reviewed against the pre-patch acceptance map in acceptance-review.md and DL-035 accepted source authority. DL-037 records the additional actual answer “Keep for the same session”; the agent-input scope question remains unanswered. Nine canonical document diffs and 21 new PlanUnits were inspected. All 21 units carry gui_related and source lineage.

## Acceptance coverage

| Source | Owner and consumer result |
|---|---|
| P3 | SMPFS-158/F3-544/SSYS-034/ATS-047 preserve versioned requested/effective keyboard capability, nonmutating queries, bounded separate normal/alternate-screen stacks, chunk/reset/crash handling, one input owner and pinned platform/Slint/IME feasibility. Core support does not imply end-to-end input support. |
| P4 | SMPFS-159/F3-544/ATS-047 preserve capability-gated continuation/right prompts and rich properties, PM-owned parsing, malformed/forged/nested/opaque cases and no extra environment collection. |
| P5 | SMPFS-160/F3-544/ATS-047 preserve append/full/rolling/final classifications, source invocation/revision/offset identity, coherent reads under concurrent changes, settlement independent of previews, bounded backing and no fabricated continuity, PTY control or provider integration. Multiple-version retention remains held. |
| P6 | SMPFS-161/F3-545/SSYS-034/UCC-160/UIW-021/WM-052/ATS-047 preserve exact authenticated host opt-in, verified terminfo or disclosed conservative profile, failed/partial-write truth, ordinary SSH on decline and no local fallback or silent TERM override. |
| P7 | SMPFS-162/F3-546/ATS-047 preserve pane-local advisory progress, exclusive OSC 9;4 collision handling with no malformed notification fallthrough, authoritative command attribution boundaries, stale/opaque handling and no completion or taskbar authority. |
| P8 | SMPFS-163/F3-547/UCC-160/UIW-021/WM-052/ATS-047 preserve exact trustworthy source and eligible destination, no Enter or execution including multiline/control-bearing text, unavailable no-effect result if insertion safety cannot be guaranteed, no silent sanitization, coherent retained editor output and partial labels. No shell-history import or retention expansion. |
| P9 | SMPFS-164/F3-548/SSYS-034/UCC-160/UIW-021/WM-052/ATS-047 preserve redacted available provenance, unknowns, immutable current launch environment, pending-next-launch display and explicit existing restart creating replacement identity. No new collection or automatic relaunch. |
| P10 | SMPFS-165/F3-549/SSYS-034/UCC-160/UIW-021/WM-052/ATS-047 preserve idempotent enable/disable, blocked user typing/paste, continuing output, same-session unlock, existing close policy and independent emergency controls. DL-037 adds retention only for exact verified live identity across reconnect/PM reopen; replacement is unlocked and historical metadata is not liveness. Agent-input scope remains held. |
| P11 | SRV-015 remains evaluation-only: PM Server ownership, independently versioned compatibility/reconnect/no duplicate session evidence, separate supported lifetime/WSL2 evidence and no engine/host adoption, third-party code, automatic daemon installation or implicit local fallback. |

## Command and wiring review

Six stable candidate IDs have one semantic owner apiece. UCC-160 supplies all required metadata fields: direct domain actions use normalization.none, navigation wrappers use wrapper, aliases are null. The inspected metadata contract does not require direct owner references to become null. Retained output alone uses document/artifact OpenSubject; environment inspection uses an object route. Request/result identities and admission reference shared command owners; no private route schema, invented native handler or event is introduced.

The closed disabled-reason vocabulary matches the existing UCC strict overlay (lines 8227–8228). Candidate command_not_registered and subsequent handler_unavailable dispositions follow the existing UCC-158/UIW-019 boundary; they do not claim these controls work. WM-052 is explicitly planned wiring, not a production registry row. Existing restart is reused, and no progress-clear/mux command is invented.

## Ledger metadata adjudication

The standard ledger validator distinguishes optional target_doc/canonical_plan_targets from target_docs/compiled_owner_docs (scripts/pm-bootstrap-ledger-validate.py lines 447–503); at seal it broadens governance coverage to compiled owners (565 onward). For this unsealed compile, omission of target_doc on new multi-owner queue entries is acceptable if actual owner_doc, complete target_docs, source atoms and compiled PlanUnit IDs remain exact. Do not select a convenient covered consumer as a false primary owner. Preserve the historical coverage subset explicitly, separately enumerate missing governance coverage and all actual compiled outputs, and do not claim a standard-ledger pass closes the seal/config coverage gaps. No validator, shard config or lock edits are justified by this metadata issue.

## Canonical snapshot

Timestamp: 2026-09-09T04:46:50.392730+00:00

| File | SHA-256 | Reviewed new unit declaration lines |
|---|---|---|
| Plans/Section15_MVP_Promoted_Features_Spec.md | 7250d986422931f2b4e32230bbd652911a38b56120ce96766ead21d3553122e0 | SMPFS-158:10642, SMPFS-159:10721, SMPFS-160:10795, SMPFS-161:10869, SMPFS-162:10945, SMPFS-163:11023, SMPFS-164:11104, SMPFS-165:11180 |
| Plans/FinalGUISpec.md | 163f59e6716166790accad75b59e880c0932792df331d142bee0ec8bae42c253 | F3-544:37017, F3-545:37076, F3-546:37129, F3-547:37177, F3-548:37235, F3-549:37289 |
| Plans/Settings_System.md | b5700e07b47d6a7f3f8ec8cd72ea5795b3cea952a9b665edba383da877cd4cc4 | SSYS-034:1966 |
| Plans/Automated_Testing_System.md | d0ae60188cd3a5f898f77268b57da589bfbf5766c2d9930804cb5610af756664 | ATS-047:4146 |
| Plans/UI_Command_Catalog.md | 44bfbc2f88392a43fa83f1164477c1912f33d04e11e7c901e2817796cae38eb8 | UCC-160:12850 |
| Plans/UI_Wiring_Rules.md | 35dc95e70c8a3b7d86cf02fb52c65d67a065eaf833e656df940d4c8781cae661 | UIW-021:1530 |
| Plans/Wiring_Matrix.md | 54ce0ff4c4ff2f2695832d8a966358202e65d44c385045dac7c7381a82a2bd8a | WM-052:4346 |
| Plans/Server_System.md | 53e1316385dac62e624ec36d358911c42c2e79de21b116596d2a87130f93d429 | SRV-015:827 |
| Plans/Decision_Log.md | f2c3172403a8527d79557af92602a89f0d13a1cfeda3f58e5460c1824060fce5 | DL-037:2384 |

## Ledger projection review

Reviewed 2026-09-09T04:49:09.405213+00:00. Four state projections, compile queue, targeted D2 atom records, answered q-0002/dec-0004 and the source-shard correction agree. Narrow mechanical crosscheck confirms each new queue item’s atom output IDs and target_docs exactly match live canonical unit declarations: nine new compiled atoms, 21 unique new units, 11 historical-plus-current queue items and 11 actual owner/output documents. Two D1 prerequisite atoms remain accepted prose materializations. Agent-input q-0001 remains open; persistence is answered. Missing lock/shard coverage is explicitly disclosed, not claimed repaired.

Parent was asked to finish three receipt housekeeping fields: operating_capsule.next_action should reflect completed D2 compilation; latest_audit_ref should point to D2 instead of the D1 review; answered q-0002.presentation should no longer say awaiting an answer. These do not change the accepted feature mapping or canonical pass. No standard gate execution is claimed by this independent review.

Final receipt closure: independently confirmed all three housekeeping edits. current/handoff/compile_queue now cite the D2 independent review with pass status; operating capsule advances to verification/commit/report with only q-0001 pending; q-0002 presentation is answered and refers to DL-037. No required repair remains. Canonical PASS and ledger PASS are planning/source-lineage review results only.

## Final candidate-exclusion delta review

PASS, reviewed 2026-09-09T05:07:42.456174+00:00. The broad gate identified six catalog tokens whose handlerless-candidate prose was not represented in the wiring scraper input. UIW-019/UCC-158 and the three existing Working Notebook exact exclusions provide the existing owner convention. The validator (scripts/pm-plans-verify.py 3785–3793 and 4111–4115) mechanically matches exclusions; plain IDs match exactly, while wildcard/trailing-underscore patterns widen matching.

The actual support patch adds exactly the six UCC-160 terminal candidates to excluded_tokens and six corresponding per-token reasons. No exclusion is removed, no old note changes, and the old reason text is retained with an appended explanation. Existing Notebook entries are only reordered. Each reason requires candidate_not_registered/command_not_registered, no native handler or production registration claim, and atomic exclusion removal when command/handler admission and production wiring land. There are no duplicates or wildcard additions. None of the six tokens occurs anywhere in the production matrix; existing restart/reattach commands receive no new exclusion.

UCC-160, UIW-021 and WM-052 now carry matching exact-exclusion lifecycle acceptance and reference the support file. The other six reviewed canonical documents retain their prior SHA-256 values. The canonical snapshot table above has been refreshed for the three changed command/wiring owner documents. Ledger evt-0008 and corr-0002 faithfully record this machine-coverage correction and its non-registration limits. No validator change or broad gate repair is included. Targeted gate results belong to the parent receipt; this review supplies independent source/patch alignment only.

Current supporting-input hashes:

| Input | SHA-256 |
|---|---|
| Plans/Wiring_Matrix.production.exclusions.json | face26643f45358e3fca99ade0d36bdb0bdf4cd0b65c75df34265501b2bdec72 |
| Plans/Wiring_Matrix.production.json | 9f9843b2bba67e69d35258bfc16d190f2c3ba95fa07176cc1ba1f80a495ce42a |
| scripts/pm-plans-verify.py | 80d04f675c083ad39905c5690a9a58aaafcd11b0455b8c50a99ff21e0182b2f4 |
| Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/state/current.json | ee609f205a3d8c7a7792a8b82b1ddc8a0ce3f25f64e5034e0261e64e579cc3b0 |
| Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/state/handoff.json | f3574be56f0138a1f9e4b55d1376af36d3c8bf6c944c290426e9c3857dcef032 |
| Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/state/compile_queue.json | 719e1f30d17b0d7f12c5adee6ffd0b156659b92d725652faadfa6baa586312b2 |
| Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/corrections.jsonl | 250898b88b76c583e086c3cff8cb448d95eaff80abbed0eda07575269c9e7fa4 |
