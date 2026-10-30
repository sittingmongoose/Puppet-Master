# PM7 Plans lane — 2026-10-29

Branch: `t3/plans/pm7-plans-canon`. Current focused source head: `543a85e5ffd2da233ac4f7a55ed35afa31a6248a`. Lead: `pm7-build`.

**Steps 1–3 implemented.** W1–W9 canon and companions are pushed. Final full gates: **exit 1**. Dry landing: **exit 2 before integration; exact inventory guard now PASS**, **0 Plan-attribution blockers**, **0 infrastructure results**. Full/dry aggregate attribution was run at b22d48bec8; the late label-storage ruling is covered by focused checks at the current head. The inventory-page guard subsequently passed when the lead republished PM7 and this lane synced integration 543a85e5ff. No full aggregate rerun after that GUI integration is claimed. Step 4 and independent companion review wait for the lead’s merged-GUI signal. No landing, lock or reseal was performed.

## Coverage

| Work | Result |
|---|---|
| W1 | One brand/Pip kit, size tiers, app/tray/notification faces, 40 px title bar / 46 Glass, corrected tray precedence; F3-660 / DL-235 / DR-076. |
| W2 | Project box A, same-frame chip, five badge states, menu/row geometry, Ctrl Shift P and Ctrl/Cmd+Enter, stable Project/workspace command identity; F3-661 / CS-105 / UCC-209. |
| W3 | Complete onboarding Pip worlds, rail, rigs, gaze/props, tips/errors/routes, six sound kits and exact roots, gesture gates, Ready handoff; F3-663 / Planning Wizard. Tour remains under O11. |
| W4 | Shared individual-agent Pip, optional sheet/list/Orbit handoff, parts editor and exact 25-part registry/presets/defaults; F3-594 / ACD-507 / SSYS-056. |
| W5 | One indeterminate loader, context variants/periods, known-layout skeletons, determinate bars, item-state separation, NieR and Reduced Motion; F3-662 / DR-077. |
| W6 | Thread Processes; Agents/Processes/Resources panel; two status items; work/quit commands; D1–D14/G4; ProcessFacts, InputRequest, per-server samples, identity/permissions/delivery and view-local clear; F3-664/665 / ACD-505 / SIR-054. |
| W7 | Full-size Activity Detail without Pin, widen-then-cover, saved width ≥400 with no fixed maximum, separate History behavior and shared Glass plates; F3-637 / ACD-453/506 / SP-330 and schema/registry parity. Context-ring mechanism remains GUI-owned, with no invented diagnosis. |
| W8 | Named Demo Studio matrix, 42 events / 5 loops / six kits, Pip/parts, onboarding tips/errors and project/activity/Resources/quit recipes; F3-649 / DL-256. |
| W9 | 27 owner docs, 45 new PlanUnits, shared IDs, commands/local actions, production wiring, bindings, Touch, settings, glyphs, runtime/layout schemas, fixtures, glossary/help entries, count pins and regenerated shards/index. |

All recommendations are adopted in tagged canon for later corrections. `decision-map.json` maps all **76** packet/ruling/source IDs (including RM1 and D1–D14) to current owner units. No ledger compilation was used; compile witness is not applicable.

## Identities and counts

`IDS.md` is published in the build share and mirrored in this result bundle. Sequences: DL-235–256, F3-660–665, DR-076–078, SSYS-056–057, ACD-505–507, CS-105–106, UCC-209–211, WM-097, UIW-045, SIR-054 and G-031.

| Contract | Count / rule |
|---|---|
| Settings | 1011 rows; only `general.visual.pip-parts` and `general.interaction.status-bar-words` added. Per-Project persistence; inventory global scope remains applicability metadata. |
| Pip | 25 stable IDs / five groups / 24 default-on; app-voice off; Full, Quiet, Still, Plain use IDs internally, and Settings stores their shared-registry LABELS. Shared help and Size 1–6, total 61. |
| Status | 22 existing keys; no new key. Mood defaults and Memory/Scheduled/13-agent subsets preserved. |
| Bindings / production wiring | 464 bindings; 1269 wiring rows (11 new). |
| Touch | 707 rows / 137 profiles; all native proof residuals remain partial. |
| Derived | 2956 shards / 99 sources; 7236 PlanUnits / 96 indexed docs. |

Stop all reuses `cmd.work.stop`; Clear Finished is view-local; All projects is `ui.project_switcher.all_projects`, never the side-panel command. Explicit application scope uses project_id null; target ownership/Project/server/environment permissions remain authoritative.

## Review and corrections

Original Astra 19 and Muse 20 findings were accepted. Both follow-up sets were repaired. The capped final Astra recheck closes **all 21 prior rows** and raised N1–N3; lead explicitly requested direct fixes/proofs without another review. N1 current v2 storage mirror is synchronized and guarded for parity/above-760 acceptance; N2 fixture copy derives inventory membership; N3 PC4 no longer points to notebook unit ACD-451. Per-item responses are in `REVIEW-RESPONSES.md`.

The c2a3acc3b4 dry run returned 26 blocking rows from one stale full-thread dependency pin, repeated in both aggregate checks. Only ObservableWorkRecord changed among old definitions; all six definitions reachable by the Goal references are exactly unchanged. Two live Goal-realm dependency digests were refreshed. Exact stored-profile union checks pass for all three families; native realm, stored member wrappers and protected governance remain unchanged. This repair has a consistency guard and retained closure proof. N2’s purpose-only edit also required one Touch fixture-digest refresh; all command contracts/dispositions and every other fixture field are unchanged, with no native proof promotion.

## Verification and attribution

| Check | Result |
|---|---|
| PM7/canon | PASS at current label head; 15 schema cases (13 request/local plus 2 label-value), 4 identity, 11 runtime; count pins agree. |
| Direct correction / reference proofs | PASS: N1–N3 semantic + rg receipts; six unchanged Goal definitions; all three stored-profile unions; unchanged Settings command/disposition data. |
| Touch | PASS, 707 rows / 137 profiles, all native evidence residuals partial. |
| Shards / committed extraction | PASS, 2956 / 99. Clean current-label extraction passes, including regenerated inventory shards. |
| PlanUnit index | PASS generation, 7236 / 96. Required ignored full-checkout/audit inputs installed before indexing. |
| Standard full gates | Exit 1 at b22d48bec8; no new-contract, Touch, wiring or shard failure. Latest label-only correction passes focused checks per lead. |
| Dry landing, current baseline | Exit 2 at b22d48bec8: attribution has zero Plan blockers/zero infrastructure; inventory-page guard has since passed at current merged integration after the lead republished PM7. No full aggregate rerun is claimed after this GUI integration. |
| Review | All 21 prior rows closed; N1–N3 directly repaired per lead’s two-cycle cap; companion review follows Step4. |

At b22d48bec8, no new branch-owned non-staleness failure remained. The completed dry comparison reports 14778 on-branch staleness rows and 0 pre-existing rows. The three context-compaction GUI-fixture failures are unchanged baseline failures. There are 8 new non-staleness rows outside the branch: two old tail-shard references in protected Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json, repeated across graph/evidence checks. The old paths are storage_value_registry/579-lines-115418-115511.md and settings_inventory/127-lines-25128-25234.md under Plans/_shards. Reported for the assigned reseal; not hand-edited. Exact records are in verification.json/raw report.

Baseline currency and complete raw attribution are retained in `closed-dry-landing.json`. Governance staleness is the expected result of edited canon awaiting the separately assigned reseal; lead should request that reseal after integration. No baseline, Spec Lock, auto-decisions, `.evidence`, graph or migration snapshot was refreshed by this lane. Inherited main/reseal commits are excluded from lane authorship.

## Files and evidence

Owner prose: `00-plans-index`, `CLI_Bridged_Providers`, `Collaborative_Workflows`, `Commands_System`, `Crosswalk`, `DRY_Rules`, `Decision_Log`, `Executor_Protocol`, `FinalGUISpec`, `Glossary`, `Goal_Runtime_System`, `Planning_Wizard`, `Run_Graph_View`, `Run_Modes`, `Scheduling_and_Quota_Resume`, `Section15_MVP_Promoted_Features_Spec`, `Server_System`, `Settings_System`, `Shared_Integration_Runtime`, `ToDo_Runtime`, `UI_Command_Catalog`, `UI_Wiring_Rules`, `Widget_System`, `Wiring_Matrix`, `assistant-chat-design`, `assistant-memory-subsystem`, `storage-plan` (all under `Plans/`, `.md`).

Companions include PM7 request/result/local schema + fixtures, Pip registry, full/shared runtime schemas + fixtures, layout schema + fixtures/current storage mirror, glyph/catalog/bindings/wiring/Touch/settings data, current Settings fixture and two live schema-reference pins. Script changes are limited to count/closure validation in `pm-plans-verify.py`, `pm-touch-closure-verify.py`, `pm7-build-check.py`, `pm7-canon-check.py`, `pm_full_thread_semantics.py`. Derived files were regenerated, never hand-edited.

Raw retained checks: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-build-20261029/plans/`. Exact paths, commands, source commit and SHA-256 values are in `verification.json` in this result bundle.

| Artifact | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-build-20261029/plans/closed-run-gates.json` | `ca8f75e5966aacbb893fa75141a2b665741cdaa4acbefe7d6bcf546534573bec` |
| `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-build-20261029/plans/closed-dry-landing.json` | `5e00efc75d1ce41524752c2fe5f025e63855a70dde6ac4ec0209602b38aa17cf` |
| `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-build-20261029/plans/final-cycle-direct-fixes.json` | `eae45b9f7cc9667a2fa2ea6f70e817718c550136b52a9d25faa965b63dae1fa6` |
| `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-build-20261029/plans/schema-reference-closure-proof.json` | `c1b63a66ecdc454ebe66033f66bc0ef6d24e62bc31b6590c1addbaa146f0727f` |
| `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-build-20261029/plans/settings-disposition-pin-proof.json` | `cce5fa7208ce87c8546101c0eb244cceb6761bf9f4ffaf3b012f7a668e8c9a35` |
| `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-build-20261029/plans/label-committed-shards-check.log` | `7a03507e43cb3add9642f91b7fa80b6c98ba475af9dc3bab0b963b4ff6335f7f` |
| `reports/pm7-build-20261029/verification.json` | `cf05b77d08fd4eb073ff32dcc6982abc13429fb853257f5507192e82bd0e7fc0` |

## Step 4 inputs and open work

The generated-page inventory guard is resolved at synced integration 543a85e5ff: the lead republished PM7 and its exact builder check passes here. This lane’s earlier generation probe was restored without commit; no GUI source or generated-page edit was authored by this lane. The final 2026-10-30 label-storage ruling is already applied in inventory/prose/schema/value fixtures with all25 mappings equal to PM_PIP_PARTS; the lead requested focused checks and an immediate merge for chatpip.

- **Merge signal:** still pending. Align actual GUI names/control hosts and rerun affected checks after the lead merges lanes; independent companion review follows then.
- **Title input (A1/A3):** release icons and manifest are under the shared lane title/icons folder: app/puppet-master.ico, app/puppet-master.icns, app/png/16..1024.png, app/macos-1024.png, app/tile.svg; tray/macos and tray/windows state assets plus working-flip SVGs. New source names: pm7-brand-mark, .pm-brand-mark/.pm-brand-word, .app-name[data-mode=full|mark], .app-shell[data-tb-menu-open], pm7.home.unsaved. Reconcile paths with canon at Step4.
- **L1 word drop:** Plans working.panels already omits loading (27e2c815c4); guarded by pm7-build-check.py. Loader owns the code-catalog drop; verify the joined result at Step4.
- **Foundation names at f1e4ef8c38:** PMLogo; PM_PIP_LOADER; PM_WORK; PM_PIP_PARTS / PM_PIP_PARTS_STORE; O55.sound.pip. Preset IDs lowercase map to display names; `def` maps to default_enabled; `delivery` maps to completion_delivery. Latest canSendInput/answer, pending Restarting, trayFace and NieR diamond/ink fallback introduce no IDs.
- **Activity input at 52b68952ad:** no fixed saved-width maximum, centre floor 480, Activity reservation/drop/cover geometry and one Glass plate; source names PM56_HOST.reserveActivity/activityWidth, PMW.chatCol.activityW, narrow.state.act/actDropped, --pmw-chat-act-w, activity-panel.cover/data-layout. It reports no context-ring spec change; integration/GUI evidence closes C5.
- **B5 correction for Step4 (lead 2026-10-30):** badge means a Home tab with dirty buffers in the active Project. Home autosaves layout; the UI word is Unsaved changes. Align the B5 canon, binding and fixture wording when the GUI merge is supplied.
- **Source question corrections:** apply later Jared answers by their decision IDs; all other current recommendations are already canon.

No browsers, servers or media were created. Owned scratch archives/helpers and superseded logs were removed; retained checks/reviews are enumerated above.
