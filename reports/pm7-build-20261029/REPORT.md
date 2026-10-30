# PM7 Plans lane — 2026-10-29

Branch: `t3/plans/pm7-plans-canon`. Current focused source head: `e3f99b3992d0b8829a31993dc74ba04ec96a24c2` (Jared’s 2026-10-30 decisions). Lead: `pm7-build`.

**Steps 1–3 and all 57 Jared decision cards implemented.** W1–W9 canon and companions are pushed; the 2026-10-30 decision amendment passes all focused checks. Last full gates: **exit 1**. Dry landing: **exit 2 before integration; inventory guard PASS at 543a85e5ff; republish needed after A2 copy change**, **0 Plan-attribution blockers**, **0 infrastructure results**. Full/dry aggregate attribution was run at b22d48bec8; the late label-storage ruling is covered by focused checks at the current head. The inventory-page guard passed at integration 543a85e5ff. A2’s later inventory help-text amendment now needs the lead’s integration republish before that guard is claimed current. No full aggregate rerun after that GUI integration is claimed. Step 4 and independent companion review wait for the lead’s merged-GUI signal. No landing, lock or reseal was performed.

## Jared’s decisions — 2026-10-30

Source: decision packet README, “Jared’s answers (2026-10-30)”; all 57 cards are explicit Jared decisions in `decision-map.json`. This amendment is independent of the pending GUI merge and does not complete Step4.

| ID | Canon now requires |
|---|---|
| X3 B | Eyes through every NieR band, including static title/app/tray marks, at every size. |
| A2 B | Always-on tray while Puppet Master runs; minimize-to-tray controls Close only. §3.3 / F3-037 / F3-660 amended. |
| L8 B | Duplicate menu sprouts fixed in this build; DR-079 owns one implementation for every menu, including menus.js / PMU.menu / PMW.menu. |
| O2 A | Preserve the approved concept with implementation technique open; bounded shared life, solved strings and pause/fidelity rules remain. |
| O6 | No sound or theme change on look-tile hover; click or keyboard activation changes the theme. |
| O12 B | Creating Continue/Ready wait for owner completion and the last block landing; Reduced Motion settles instantly. F3-520 and Planning Wizard amended. |
| G1 B | Pin stays open across thread switches with the new thread’s data; unpinned detail closes. `ui.activity_detail.pin` / `chat.activity.pin` restore typed local catalog/wiring/binding/Touch coverage. |
| SND1 B | Sound lands on the tools’ measured numbers; Jared listens later in the product. LAND1’s final approval requirement remains. |

Prose preceded companions. **39 owner units** changed, with **DR-079 the only new unit** in this amendment; all original PlanUnits and unrelated metadata remain. The 138 unique decision-owner references resolve. The Pin adds seven schema cases and four thread-switch cases, one binding and one Touch row, without a new persisted setting, production mutation handler, event, receipt or native-proof promotion. All seven requested/focused generation and verification commands return 0. Raw checks and source fingerprints are listed in `verification.json`; committed source bytes match the proof.

Full aggregate/dry results below remain historical at b22d48bec8; they were not rerun for this focused decision amendment. No new prose-review cycle was requested. Independent companion review still follows Step4. Owned decision scratch is removed; no browser/server/recording, landing, lock or reseal was created.

## Coverage

| Work | Result |
|---|---|
| W1 | One brand/Pip kit, NieR eyes through every live/static band at every size (X3 B), always-on tray (A2 B), size tiers, app/tray/notification faces, 40 px title bar / 46 Glass, corrected tray precedence; F3-660 / DL-235 / DR-076. |
| W2 | Project box A, same-frame chip, five badge states, menu/row geometry, Ctrl Shift P and Ctrl/Cmd+Enter, stable Project/workspace command identity; F3-661 / CS-105 / UCC-209. |
| W3 | Complete onboarding Pip worlds, rail, rigs, gaze/props, tips/errors/routes, six sound kits and exact roots, gesture gates, click-only look changes with silent hover, Creating last-block wait and instant Reduced Motion (O6/O12 B), Ready handoff; F3-663 / Planning Wizard. Tour remains under O11. |
| W4 | Shared individual-agent Pip, optional sheet/list/Orbit handoff, parts editor and exact 25-part registry/presets/defaults; F3-594 / ACD-507 / SSYS-056. |
| W5 | One indeterminate loader, context variants/periods, known-layout skeletons, determinate bars, item-state separation, NieR and Reduced Motion; F3-662 / DR-077; L8 B adds DR-079’s single menu sprout owner. |
| W6 | Thread Processes; Agents/Processes/Resources panel; two status items; work/quit commands; D1–D14/G4; ProcessFacts, InputRequest, per-server samples, identity/permissions/delivery and view-local clear; F3-664/665 / ACD-505 / SIR-054. |
| W7 | Full-size Activity Detail with view-local Pin following new-thread data across switches (G1 B; unpinned closes), widen-then-cover, saved width ≥400 with no fixed maximum, separate History behavior and shared Glass plates; F3-637 / ACD-453/506 / SP-330 and schema/registry parity. Context-ring mechanism remains GUI-owned, with no invented diagnosis. |
| W8 | Named Demo Studio matrix, 42 events / 5 loops / six kits, Pip/parts, onboarding tips/errors and project/activity/Resources/quit recipes; F3-649 / DL-256. |
| W9 | 27 owner docs, 46 new PlanUnits, shared IDs, commands/local actions, production wiring, bindings, Touch, settings, glyphs, runtime/layout schemas, fixtures, glossary/help entries, count pins and regenerated shards/index. |

Jared answered all **57** packet cards on 2026-10-30: **49** confirm the recommendations and **8** change or clarify them. Their tagged canon and decision map now record his final rulings; no PM7 card remains pending. `decision-map.json` maps all **76** packet/ruling/source IDs (including RM1 and D1–D14) to current owner units. No ledger compilation was used; compile witness is not applicable.

## Identities and counts

`IDS.md` is published in the build share and mirrored in this result bundle. Sequences: DL-235–256, F3-660–665, DR-076–079, SSYS-056–057, ACD-505–507, CS-105–106, UCC-209–211, WM-097, UIW-045, SIR-054 and G-031.

| Contract | Count / rule |
|---|---|
| Settings | 1011 rows; only `general.visual.pip-parts` and `general.interaction.status-bar-words` added. Per-Project persistence; inventory global scope remains applicability metadata. |
| Pip | 25 stable IDs / five groups / 24 default-on; app-voice off; Full, Quiet, Still, Plain use IDs internally, and Settings stores their shared-registry LABELS. Shared help and Size 1–6, total 61. |
| Status | 22 existing keys; no new key. Mood defaults and Memory/Scheduled/13-agent subsets preserved. |
| Bindings / production wiring | 465 bindings; 1269 wiring rows (11 new). G1 Pin is local and adds no mutation row. |
| Touch | 708 rows / 137 profiles; all native proof residuals remain partial. |
| Derived | 2956 shards / 99 sources; 7237 PlanUnits / 96 indexed docs. |

Stop all reuses `cmd.work.stop`; Clear Finished is view-local; All projects is `ui.project_switcher.all_projects`, never the side-panel command. Explicit application scope uses project_id null; target ownership/Project/server/environment permissions remain authoritative.

## Review and corrections

Original Astra 19 and Muse 20 findings were accepted. Both follow-up sets were repaired. The capped final Astra recheck closes **all 21 prior rows** and raised N1–N3; lead explicitly requested direct fixes/proofs without another review. N1 current v2 storage mirror is synchronized and guarded for parity/above-760 acceptance; N2 fixture copy derives inventory membership; N3 PC4 no longer points to notebook unit ACD-451. Per-item responses are in `REVIEW-RESPONSES.md`.

The c2a3acc3b4 dry run returned 26 blocking rows from one stale full-thread dependency pin, repeated in both aggregate checks. Only ObservableWorkRecord changed among old definitions; all six definitions reachable by the Goal references are exactly unchanged. Two live Goal-realm dependency digests were refreshed. Exact stored-profile union checks pass for all three families; native realm, stored member wrappers and protected governance remain unchanged. This repair has a consistency guard and retained closure proof. N2’s purpose-only edit also required one Touch fixture-digest refresh; all command contracts/dispositions and every other fixture field are unchanged, with no native proof promotion.

## Verification and attribution

| Check | Result |
|---|---|
| PM7/canon | PASS at the decision source head; 22 schema cases, 4 Activity thread-switch, 4 identity and 11 runtime cases; label storage/count pins agree. |
| Direct correction / reference proofs | PASS: N1–N3 semantic + rg receipts; six unchanged Goal definitions; all three stored-profile unions; unchanged Settings command/disposition data. |
| Touch | PASS, 708 rows / 137 profiles, all native evidence residuals partial. |
| Shards / committed extraction | PASS generation/check at the decision head, 2956 / 99. The earlier committed label extraction remains historical; no new extraction run is claimed. |
| PlanUnit index | PASS generation and validation, 7237 / 96. Required ignored full-checkout/audit inputs installed before indexing. |
| Standard full gates | Exit 1 at b22d48bec8; no new-contract, Touch, wiring or shard failure. Latest label-only correction passes focused checks per lead. |
| Dry landing (historical) | Exit 2 at b22d48bec8: attribution has zero Plan blockers/zero infrastructure; inventory-page guard subsequently passed at 543a85e5ff; A2’s newer inventory help-text amendment needs an integration republish. No full aggregate rerun is claimed after this GUI integration. |
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
| `reports/pm7-build-20261029/verification.json` | `21af55ac352ee6894337ef117da3ae81158151d35b6922ad615629364c001682` |

## Step 4 inputs and open work

The generated-page inventory guard was resolved at synced integration 543a85e5ff, before the current A2 inventory help-text amendment: the lead republished PM7 and its exact builder check passed at that commit; it was not rerun after A2’s newer inventory description. This lane’s earlier generation probe was restored without commit; no GUI source or generated-page edit was authored by this lane. The final 2026-10-30 label-storage ruling is already applied in inventory/prose/schema/value fixtures with all25 mappings equal to PM_PIP_PARTS; the lead requested focused checks and an immediate merge for chatpip.

- **Merge signal:** still pending. Align actual GUI names/control hosts and rerun affected checks after the lead merges lanes; independent companion review follows then.
- **Title input (A1/A3):** release icons and manifest are under the shared lane title/icons folder: app/puppet-master.ico, app/puppet-master.icns, app/png/16..1024.png, app/macos-1024.png, app/tile.svg; tray/macos and tray/windows state assets plus working-flip SVGs. New source names: pm7-brand-mark, .pm-brand-mark/.pm-brand-word, .app-name[data-mode=full|mark], .app-shell[data-tb-menu-open], pm7.home.unsaved. Reconcile paths with canon at Step4.
- **L1 word drop:** Plans working.panels already omits loading (27e2c815c4); guarded by pm7-build-check.py. Loader owns the code-catalog drop; verify the joined result at Step4.
- **Foundation names at f1e4ef8c38:** PMLogo; PM_PIP_LOADER; PM_WORK; PM_PIP_PARTS / PM_PIP_PARTS_STORE; O55.sound.pip. Preset IDs lowercase map to display names; `def` maps to default_enabled; `delivery` maps to completion_delivery. Latest canSendInput/answer, pending Restarting, trayFace and NieR diamond/ink fallback introduce no IDs.
- **Activity input at 52b68952ad:** no fixed saved-width maximum, centre floor 480, Activity reservation/drop/cover geometry and one Glass plate; source names PM56_HOST.reserveActivity/activityWidth, PMW.chatCol.activityW, narrow.state.act/actDropped, --pmw-chat-act-w, activity-panel.cover/data-layout. It reports no context-ring spec change; integration/GUI evidence closes C5.
- **Sprout lane input (L8 B, mail 1030030102-679d):** reported owner window.PM6_SPROUT, base/script/pm7-sprout.js and base/style/pm7-sprout.css, blocks pm7-sprout-js/css. API open(el, afterOpen, anchor, opts), close(el, done), isOpen, aim, resize, bounce, keep, reduced; opt-in pm-sprout / pm-sprout-edge, pm56-menu-leaving, is-open/is-closing/is-size-bounce, six owner-written --pm6-sprout-* values. It reports title/base chat/Settings/rail/NieR/Usage/Home/5.6 consumers and one standalone source, with effective Reduced Motion, Animation speed, body.pm-resizing and NieR Slice gates. Reconcile DR-057/DR-058/ACD-439 against DR-079 at Step4. These names are lane-reported, not verified against the merged GUI here. **Residual:** the notification inbox .rs-panel reportedly retains a separate sprout; lead notified, no canonical exception or DRY closure accepted.
- **B5 correction for Step4 (lead 2026-10-30):** badge means a Home tab with dirty buffers in the active Project. Home autosaves layout; the UI word is Unsaved changes. Align the B5 canon, binding and fixture wording when the GUI merge is supplied.
- **Decision answers:** all 57 are applied in source e3f99b3992. L8 B / DR-079 and G1 B / ui.activity_detail.pin / chat.activity.pin are current; the old no-Pin/deferred-sprout/pre-landing-listening recommendations are superseded. No decision answer waits for Step4.
- **System status names received (activity 1030022012-4c7a):** ui.system_status.open/.close, statusbar.system_status, existing work.open_system_status (reuse instead of a duplicate work.panel.system_status) and system_status.service.open_settings. Their popover/owner-Settings route closure is queued for Step4; no new System status companion coverage is claimed in this amendment.
- **A2 inventory copy:** the minimize-to-tray description now says the tray is always present. Lead must republish PM7 in integration before claiming its inventory-page guard current.

No browsers, servers or media were created. Owned scratch archives/helpers and superseded logs were removed; retained checks/reviews are enumerated above.

## T3 restart checkpoint — 2026-10-30 01:15 UTC

Steps 1–3 and the verification bundle are committed/pushed through 1be9eb53f4; the tree had no uncommitted work when the restart warning arrived. No recording, browser or server is active; owned scratch is already removed. Current branch is t3/plans/pm7-plans-canon. No validation job or review is in progress.

Next: check pm-mail as pm7-plans and wait for pm7-build’s explicit full GUI-merge signal. Step4 is still pending. Then fetch/merge current integration, align companions with actual lane names/controls/APIs/assets, apply the deferred B5 dirty-buffer / Unsaved changes wording, verify the already-done Plans L1 word drop against joined code, and run affected checks. Pip label storage is already final/merged; do not switch it back to IDs. Independent companion review follows Step4 under the lead. No landing/reseal is authorized.
