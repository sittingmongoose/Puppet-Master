# PMConcept7 promotion review, 2026-09-24

STATUS: BLOCKED - not promoted. The build and its five static gates pass and are deterministic, and every byte of the difference is attributed. But 7 items fail (T43, T45a, T45b against F3-521, T46 Doctor, T46F, DL-070, T50) and 5 are unclear (T44, T46P, T47, T48, cross-cutting evidence); see the review table. The branch carries this report only; `Concepts/PMConcept7.html` is unchanged.

Branch `concept/pm7-promotion-20260924`, worktree `~/pm-worktrees/pm7-promotion-20260924`, from `origin/main` `566970cb7b`.

## Task

Promote `Concepts/PMConcept7.html` from the pipeline under `Concepts/pm7-tools/` if, and only if, every gate passes and no item of the T44 to T50 wave fails review; otherwise record what blocks it.

1. Build into a scratch output and run the pipeline's verify gates.
2. Diff the scratch build against the checked-in artifact and attribute every difference to a pipeline step.
3. Review the wave against its own specifications and the Concepts contract in `Plans/FinalGUISpec.md`.
4. Promote or block.

## Starting facts

- Checked-in `Concepts/PMConcept7.html`: 4,308,739 bytes, SHA-256 `b019cf8dfed0e6d64f415bb5d71871d844cf58bbce16017ac82fb1e904ab0923`. The pipeline README's stage table lists that hash as the output "after T42". It was last written by `3e1842da40` (2026-09-02 00:19, "chore: save current project changes").
- Checked-in `Concepts/pm7-tools/build_report.json` records the 2026-08-27 identity build (no transforms, output = base `9dcde2a8...`). It does not describe the checked-in artifact.
- The pipeline registers 21 transforms, T33 to T50. A rebuild therefore ships T43 as well as T44 to T50.
- DL-070 (`2d51ff84af`, 2026-09-23) changed `home_workspace_source.py`, which T48 splices into the build.

## Step 1: scratch build and static gates

`python3 Concepts/pm7-tools/build_pm7.py --outdir <scratch>/pm7-build-1 --out <scratch>/pm7-build-1/PMConcept7.html`, run in the worktree at `566970cb7b`:

- 21 transforms (T33 to T50) all `ok`. Output 7,405,980 bytes, SHA-256 `da8561f63fe4979be5364445d9c4435d514e2b60abf5de067e611306b3247f5a`. Base pin ok (`7bbc1932...`, census 43 = 22 style + 21 script).
- The five static gates all PASS: `brace_balance` (33 style blocks), `css_vars_defined` (0 new undefined; 1 pre-existing in the base), `js_node_check` (29 script blocks, 3 non-JS skipped), `t45_final_contract`, `no_emoji` (0 banned glyphs, 585 warnings).
- A second clean build into a fresh directory is byte-identical (`cmp` clean); the two reports are equal apart from timestamp and output path. The build is deterministic.
- The build reads two inputs outside `Concepts/pm7-tools/`: `Plans/settings_inventory.json` (T44 records it as `canonical_inventory_sha256 e2919a4e...`) and the pinned K3 winner under `Concepts/settings-redesign-concepts/kimi-k3-polish/` (`winner_sha256 ee973df2...`). A later Plans edit to the inventory changes the artifact.

## Step 2: what separates the checked-in artifact from the rebuild

Method: every transform's output was kept stage by stage (a driver that imports `build_pm7.TRANSFORMS` and runs them in order), on the current base and on the pre-refresh base `9dcde2a8`. A variant run with `home_workspace_source.py` from `2d51ff84af^` isolates DL-070. The resulting chain was committed into a throwaway git repository in the session scratchpad: checked-in artifact, then each step, ending at the build output. `git blame` on the final file names the step that introduced every line. `git blame --reverse` on the checked-in file names the step that removed every line.

Anchors:
- The current pipeline on the old base reproduces the README's "after T33" hash exactly (`a88cdbb2...`). It first diverges at T34.
- The checked-in artifact was committed in `3e1842da40` in the same sweep that re-pinned the base to `7bbc1932`. It is the older base run through an older T33 to T42.

The chain and what each step contributes (lines of the final file introduced by the step; lines of the checked-in file removed by the step):

| Step | What it is | Final lines introduced | Bytes | Checked-in lines removed | Bytes |
|---|---|---:|---:|---:|---:|
| R1 | T34, T36 and T37 source revisions made after the artifact was built (5 hunks, below) | 25 | 1,167 | 6 | 433 |
| R2 | base pin refresh of 2026-09-01: Google Fonts preconnect/preload links replaced by a self-contained comment (1 hunk) | 3 | 229 | 6 | 1,038 |
| T43 | Usage live occupied-neighbour resize preview | 153 | 10,767 | 99 | 7,776 |
| T44 | Settings Tome Tabs | 7,016 | 762,627 | 2,198 | 437,641 |
| T45a | Product Onboarding | 2,136 | 503,114 | 0 | 0 |
| T45b | Guided Tour | 1,151 | 187,071 | 0 | 0 |
| T46 | operational systems / Doctor | 784 | 193,363 | 0 | 0 |
| T46F | forge / SCM / backup | 185 | 46,942 | 7 | 2,001 |
| T46P | full-thread performance | 377 | 28,523 | 64 | 3,139 |
| T47 | global hover tags | 859 | 74,054 | 0 | 0 |
| T48 | Home authored-source refresh, without DL-070 | 391 | 25,366 | 133 | 10,578 |
| DL-070 | terminal move leaves the vacated section empty (inside T48) | 6 | 710 | 34 | 2,452 |
| T49 | Assistant Settings | 174 | 788,483 | 0 | 0 |
| T50 | Settings managers refresh | 10,561 | 939,848 | 2 | 11 |
| | total | 23,821 | | 2,549 | |

Closure: the final file has 84,205 lines = 60,384 kept from the checked-in artifact + 23,821 introduced by the steps. The checked-in file has 62,931 lines = 60,382 kept + 2,549 removed by the steps. Both identities hold, so no line of the difference is unattributed. A single direct `git diff --numstat` reports 23,846 added and 2,572 deleted. The small gap is diff alignment of repeated lines (blank lines, closing braces), not unattributed content. Bytes introduced by a step count whole lines. A step that rewrites one long line the previous step wrote takes credit for all of it. That is why T49 shows 788,483 bytes against a net delta of +24,986.

R1 hunks (checked-in artifact against the current T33 to T42 on the old base):
1. T37 (`contrast_repairs_source.py`, revised in `4f0fedb98b` on 2026-09-03): new 11-line rule "Friendly title-bar search fields": transparent fill on the title-bar search pill and its pop input.
2. T34 (`usage_corrections_source.py`): the Usage provider-setup action calls `cmd.settings.open` with a `settings-route:usage-provider-setup` route payload instead of the retired `cmd.settings.bloom.open`.
3. to 5. T36 (`narrow_layout_source.py`): the page-tab ink resync is also set after responsive title-bar geometry changes (`ResizeObserver` and `resize` set `pageInkResyncPending`), plus its comment.

These three sources are unchanged in git since `3e1842da40` except T37. So the revisions of T34 and T36 were made between the artifact build and that sweep commit, with no finer history.

DL-070 isolated (pre-change source against current): exactly 5 hunks, all in `moveWorkgroupToHost` in `script#pm6-js-dashboard`. They remove the move-and-reseed block (`sourceReseeded`, `seededWorkgroup`, the seeded workgroup and session allocation), drop `source_reseeded` from the `cmd.terminal.move_workgroup` payload, remove the extra "projected" receipt, and add the DL-070 comment. The net change is -1,742 bytes. T49 and T50 carry these hunks unchanged to the final file.

Where each step lands, by the pipeline's own block segmenter: T44 in `script#pm4-settings-js` (5,688 lines) and `style#pm4-settings-css`; T45a in `pm7-onboarding-css/js`; T45b in `pm7-guided-tour-js/css`; T46 in `pm4-settings-js`, `pm7-t46-systems-*` and `pm7-t48-egolite-retained-contracts`; T46F in `pm7-t46f-*`; T46P across `pm6-js-globals`, `pm7-t46p-performance-*` and small edits in 8 other blocks; T47 in `pm-hover-tags-js/css`; T48 and DL-070 in `pm6-js-dashboard` and `pm6-css-dashboard`; T49 in `pm4-settings-js`, `pm49-assistant-settings-css` and `pm50-manager-layout`; T50 in `pm4-settings-js` (10,072 lines) and `pm51-settings-refresh`; T43 in the Usage script and `pm7-t29-usage-final`.

### Relation to the published preview `Concepts/TestPMConcept.html`

The published preview (`f1bc81ae...`, committed in `63bff67fb4` on 2026-09-10 through the T50 checkpoint lane) comes from the same transforms. Compared block by block with the build, 59 of 63 segments are byte-identical, the markup outside blocks included. Four differ:

| Block | Cause |
|---|---|
| `script#pm7-guided-tour-js` | the unpublished Guided Tour reload guard and its source follow-ups. The build's tour script is byte-identical to `scratchpad/pm-tour-polish-20260906/build-35/TourCandidate.html` (`c3a9620e...`), tour source `e61cee62...`. |
| `script#pm7-settings-data`, `script#pm4-settings-js` (+114 bytes each) | `Plans/settings_inventory.json` changed in `84070fd6f5` (2026-09-10), after the preview. It changes two Back Seat Driver descriptions (`safety.approvals.bsd-trigger-sensitivity`, `safety.approvals.bsd-catch-up-seconds`) and the embedded inventory hash, `be85c7f3...` to `e2919a4e...`. |
| `script#pm6-js-dashboard` (-1,742 bytes) | DL-070 only. The pre-DL-070 build's dashboard block is identical to the preview's. |

So, apart from the tour guard, two inventory descriptions and DL-070, the rebuild ships bytes that were already published and checkpointed in the preview lane.

## Step 1 (continued): the pipeline's verifiers against the exact candidate

Candidate: `<scratch>/candidate/PMConcept7.html`, SHA-256 `da8561f6...` (read-only copy of the build). Browser: `/usr/bin/google-chrome` 154, headless, driven over `file://` by the runners' own methods: `pm_cdp.mjs` pipe, or playwright-core 1.62.1 with `pathToFileURL`. Every result below names that SHA-256 in its own report.

| Runner | Scope | Result on `da8561f6` |
|---|---|---|
| `guided_tour_reload_checkpoint.mjs` | T45 tour reload guard (first real-browser run of this suite; it was only ever planned, never run, per `scratchpad/pm-tour-polish-20260906/browser-validation-35.json`) | PASS 36/36, 0 page errors, 0 requests |
| `guided_tour_lifecycle_checkpoint.mjs` | tour Show Me journey, Finish/Keep/restore, Teacher isolation | PASS 13/13 |
| `guided_tour_polish_checkpoint.mjs` (baseline = published `TestPMConcept.html`) | tour Planning edits; onboarding bands byte-identical to the preview | PASS 10/10 |
| `guided_tour_checkpoint_selftest.mjs` | 158 source-extracted controller checks, Node VM doubles | PASS 158/158. This includes `adoptCheckpointRecovery`, which `SETTINGS_REFRESH_README.md` still lists as failing (0 !== 1). That entry is stale. |
| `guided_tour_practice_selftest.mjs` | pure Planning practice reducer | PASS 9/9 |
| `settings_sound_preview_selftest.mjs` | sound helper | PASS 11/11 |
| `settings_refresh_checkpoint.mjs` | T50 manager kit: ≤6 tabs, one Advanced, flash metric, panels, dropdowns, Web Audio, 8 themes x 3 widths (96 cells) | PASS 17/17 |
| `settings_placement_checkpoint.mjs` | 892-id exactly-once placement walk | PASS 12/12 |
| `forge_backup_post_integration_checkpoint.mjs` | T46F bounded smoke | **FAIL**: 7 of 8 recorded checks pass. `backup_manager_overview_and_tab_census` fails, and the runner then aborts on a missing tab selector, so its last five checks never run. |
| `settings_polish_checkpoint.mjs` | the 2026-09-07 Settings regression | FAIL at check 3 (the retired top-bar CTA count). `SETTINGS_REFRESH_README.md` documents this as by design after T50; its surfaces moved to `settings_refresh_checkpoint.mjs`. |
| `build_testpm_settings_refresh.py --check` | the T50 lane reproduces the published preview `f1bc81ae` | PASS |
| `build_testpm_settings_refresh.py --parity <candidate>` | Settings blocks: T50 lane against the full pipeline | FAIL on `pm7-settings-data` and `pm4-settings-js`. The other four Settings blocks are identical. The whole difference is the `84070fd6f5` inventory change, proven by substitution: two descriptions, the placement of one `options` field (key order only), and the embedded inventory hash. The lane's pinned base predates that change. This is not a T50 defect. |

Repository checks listed in the README, run in the worktree:
- PASS: `validate-usage-gui-fixtures`, `validate-usage-contract-drift`, `validate-wiring-matrix`, `pm-shared-runtime-command-contracts.py validate`. The fixture validators needed `tests/fixtures` added to the sparse cone.
- FAIL: `validate-pm7-gui-fixtures`, with 3 context-compaction fixture failures. All three are in the landing baseline `75bcda93bc`. The validator reads Plans fixtures only, never the artifact, so promotion cannot change its result.

Not run: the provenance-bound runners. They cannot be run honestly here. `settings_transactions.mjs` (T44), `onboarding_cinematic.mjs` (T45a), `guided_tour.mjs` (T45b), `systems_integration.mjs`, `plugin_projection_matrix.mjs` and `backup_browser_scm_matrix.mjs` (T46/T46F), `full_thread_performance.mjs` (T46P), `hover_tags.mjs` (T47), `accessibility_visual_matrix.mjs` (all-theme), `home_workspace_matrix.mjs` (T48 and DL-070), and `smoke.mjs` all import `browser_verifier_provenance.mjs`. That harness rejects direct execution. It requires `browser_verifier_provenance_launcher.py`, which in turn requires a network-boundary receipt of class `independently_verified_os_process_boundary`: `loopback_only`, `non_loopback_egress_denied`, bound to the current network namespace. No such receipt can be truthfully issued here. `unshare -rn` fails (`kernel.apparmor_restrict_unprivileged_userns = 1`: writing `/proc/self/uid_map` is not permitted), and this process's namespace has a default route out through `ens3`. The harness also serves the artifact from an ephemeral `127.0.0.1` server by design, so the `file://` method does not apply. Loopback HTTP from headless Chrome does work here (a 51 ms probe), so the transport is not the blocker; the trust root is. I did not shim or bypass the harness. `systems_integration.mjs` additionally reads an untracked input, `scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/pm7-consumer-audit/pm7-consumer-audit.json`, which exists only in the shared checkout's untracked `scratchpad/`. The consolidated film (`final_campaign_capture.mjs`) and the PM6 pixel matrix were not run. The film is approval-gated evidence, and the README forbids the PM6 pixel matrix.

Direct probes (my own scripts over `file://`; they are not the pipeline's verifiers and are labelled so wherever used):
- `backup_probe.mjs`: T50's Backup manager has 4 tabs (Backup, Destinations, Restore, History). Of T46F's specified terms, only "Automatic backups", "Recovery Kit" and "Save Recovery Kit" are present; there are 0 `.pm7-backup-destination` cards.
- `dl070_probe.mjs`: reproduces the Home matrix case `terminal_new_section_recoverable` (same context, seed, onboarding dismissal and assertions). Details under DL-070 below.
- `pageswitch_probe.mjs`: samples the Dashboard-to-Settings page switch every frame.
- Applying today's T43 to the checked-in artifact reproduces `dc96d1f0...` exactly. That is the T43 audit's "probe4" build. Its full matrix is at `Plans/.audits/audit-20260830-001-pmconcept7-live-resize-preview/browser/runs/t43-probe4-full-matrix/report.json`, untracked, present only in the shared checkout.

## Step 3: review of the wave

Each item is checked against its own pipeline spec (`Concepts/pm7-tools/README.md`, `SETTINGS_REFRESH_README.md`, `ASSISTANT_SETTINGS_V2/V3.md`) and against the Concepts contract in `Plans/FinalGUISpec.md`. That contract is F3-513 and F3-518, the 2026-08-31 reconciliation addendum (F3-519 to F3-527), F3-528 to F3-530, F3-535 (USER-SETTINGS-MANAGER-REFRESH-20260908), and the Home terminal DL-070 amendment. The README's crediting rule applies: a verifier result counts only when its report names the reviewed SHA-256 (`da8561f6...`). "Direct probe" marks my own scripted observation, not a pipeline verifier.

| Item | Verdict | Evidence |
|---|---|---|
| Build, static gates, determinism | PASS | 5/5 gates. A second build is byte-identical. The attribution closes with no unattributed line. |
| T43 Usage live resize preview (shipped by the rebuild; outside T44-T50) | **FAIL** | Today's T43 applied to the checked-in artifact reproduces `dc96d1f0...` exactly. That is the audit's probe4 build. Its later, broader full matrix (`audit-20260830-001.../runs/t43-probe4-full-matrix/report.json`, 2026-08-30) failed 8 of 1,312 assertions: preview-to-accepted-settlement parity (1-3 px, Reduced Motion, 1440 and 680), cancel cleanup, and committed topology restore after reload. These are T43's core claims. No `audit_report.json` or verdict was ever recorded, although F3-513/F3-518 require one. The source has not changed since. Its runner is pinned to probe4 and cannot target this artifact unmodified, so it was not re-run. |
| T44 Settings Tome Tabs | UNCLEAR | Its verifiers `settings_transactions.mjs` (typed `cmd.settings.*` transactions, route/persistence) and `accessibility_visual_matrix.mjs` (geometry manifest, 8 themes, host widths) could not run. For: the transform's assertions pass. Direct probe: at host 1,315 px the rail is 250, top bar 62, index 168 with no document overflow; at host 1,147 px the rail is 215, matching the manifest band. The T50 checkpoints on this artifact pass, including the 350 px inspector and 8 themes x 3 widths. The addendum requires keyboard, screen-reader, focus, tooltip and reduced-motion acceptance for T44-T47; none of that exists for this artifact. |
| T45a Product Onboarding | **FAIL** | F3-520, amended in `b09294e44b` on 2026-09-11, requires PWIZ-021's eleven-stage main journey, with `provider_setup` and `free_models_setup` after Project commit and before `ready`. `onboarding_cinematic_source.py`, last changed 2026-09-06, hard-codes the nine-screen order (`order=['welcome',...,'ready']`, line 1143) and never mentions either stage. `build_pm7.py`'s `t45_final_contract` gate enforces exactly nine stages, and the artifact shows "1 of 9". So both the pipeline spec and its gate are behind canon. `onboarding_cinematic.mjs` could not run. For: the bands are byte-identical to the published preview, and the static T45 gate passes. |
| T45b Guided Tour | **FAIL** against F3-521, PASS against its own guard spec | For, on this artifact: reload 36/36, lifecycle 13/13, Planning 10/10, controller VM 158/158, practice 9/9. The unpublished-guard hold (browser suites plus regressions on the exact candidate) is now met. Against F3-521: (a) "Close/reload resumes a safe checkpoint after owner revalidation": the artifact deliberately fails closed after reload (`recovery_required`; the README says "not durable checkpoint recovery"), confirmed by the reload suite. (b) "Every one of the current 47 supported Teacher topics is discoverable through compact categories, search, or grouped sample questions": the built tour has 46 topics (its copy says "Teacher knows 46 built-in Puppet Master topics"), exposes 6 suggestions plus a 24-question library (30 in all), and has no search. Both are declared or visible gaps, not regressions; the checked-in artifact has no tour at all. `guided_tour.mjs` could not run. |
| T46 operational systems / Doctor / Plugins | **FAIL** for Doctor; UNCLEAR for the rest | Direct probe: after T50, the rendered Doctor is T50's own fixture (`managers/55-doctor.js`): 14 findings (7 ready, 4 need attention, 2 not set up, 1 unavailable), no `ui.doctor.*` control anywhere in the DOM, no `data-doctor-domain-ids`. F3-526 requires exactly 18 domains, 20 findings, a 15/1/4 remediation partition, and the eight `ui.doctor.*` local actions, which are also canonical in Commands_System and UI_Command_Catalog. T46's Doctor code is still loaded (`PM7_DOCTOR_*` globals) but is not what renders. Plugins: an opened plugin detail carries all 12 `cmd.agent_plugin.*` controls as `handler_unavailable`, meeting F3-525 in part. But the detail shows T50's sections, not the four progressive tabs, and generic Add, toggle and Remove paths are present; whether they mutate the fixture was not verified. `systems_integration.mjs`, `plugin_projection_matrix.mjs` and `backup_browser_scm_matrix.mjs` could not run. The transform's static census assertions pass (15/1/4, 12 commands, 8 plugin Doctor checks). |
| T46F forge / SCM / backup | **FAIL** | Its own checkpoint fails on this artifact: 7 of 8 recorded checks pass, `backup_manager_overview_and_tab_census` fails, and the runner aborts, leaving 5 checks unexecuted. Cause: T50 replaced T46F's 8-tab Backup manager with a 4-tab one. The 8-tab census is itself stale against F3-535 (at most 6 tabs), so the verifier needs reconciling. F3-528's content rules still bind, and the T50 manager breaks them. RecoveryKitHandoff must be "human-only, step-up protected ... absent from ... ordinary clipboard history". In T50 (`settings_refresh/managers/54-backup.js:225-236`), Save Recovery Kit is a plain dialog, and Copy Recovery Key is a plain confirm followed by `navigator.clipboard.writeText(...)` (example key). No step-up and no "No activation before approval" is presented. The forge and SCM checks that did run (Git and Jujutsu profiles, 8 automation profiles, typed-action closure) pass. |
| T46P full-thread performance | UNCLEAR | `full_thread_performance.mjs` could not run, and the README says its working report "retains failures". The Dashboard-to-Settings split-height transition (Settings pushed to about 420 px for up to about 570 ms) is present in this artifact. It is equally present in the checked-in artifact, so it predates the wave. |
| T47 global hover tags | UNCLEAR | `hover_tags.mjs` could not run. Static: the timing and geometry constants match F3-523 exactly (1600/1100 ms, 5 px, 1000 ms focus, 160 ms grace, 280 px max width, 8/8 px gap and margin), and the transform asserts them. |
| T48 Home authored-source refresh, without DL-070 | UNCLEAR | `home_workspace_matrix.mjs` could not run. The transform's assertions pass. The pipeline README is wrong about its own transform: it says the markup "remains untouched", but `home_workspace_refresh_source.py` replaces the markup with the authored markup, adding the Home-menu setup-wizard relaunch. The FinalGUISpec addendum allows that change. |
| DL-070 terminal move | **FAIL** (direct probe) | Direct probe reproducing matrix case `terminal_new_section_recoverable`. The DL-070 commit rewrote this case, but its message records only a static scratch rebuild, not a matrix run. Moved workgroup keeps its identity: `[null, "terminal_workgroup_build"]`. No new session or pane. The `cmd.terminal.move_workgroup` payload has no `source_reseeded` and carries `create_target_section: true`. The event carries `section_created`. Reset recovers one live, rendering, valid section. All of that matches DL-070. But the vacated section shows no guidance. `#bottomPanel` is stamped `data-pm-term-empty="true"`, yet no `.pm-home-terminal-empty-state` exists after the move, after 2 s, or after a resize. A mutation trace shows the note is added and removed in the same millisecond during the move. `projectTerminalRuntime` in `home_workspace_source.py` (about lines 2229-2236, "Any live workgroup sweeps it") creates it for the empty section, then sweeps it when projecting the live target section. So FinalGUISpec's "stays empty and reusable with its guidance state" is not visible, and the rewritten matrix case would fail on `note_visible`. |
| T49 Assistant Settings | PASS (scoped) | The Settings refresh and placement checkpoints pass on this artifact: 892/892 ids exactly once, BSD composed manager, no page errors. T50 retires T49's General > Assistant page. F3-535 and the addendum accept T50 as its successor, and T49's rows survive placement. The five T49 rows remain proposed, not canonical, as declared. |
| T50 Settings managers refresh | **FAIL** | Its own evidence passes: checkpoint 17/17, placement 12/12, lane `--check`. `--parity` differs only by the inventory change `84070fd6f5`. But T50 regresses canonical contracts it never re-specified. F3-535 changes presentation only, "without changing manager keys, routes, detail ids, or command ids". T50 drops the Doctor census and the eight `ui.doctor.*` actions (F3-526) and breaks the Recovery Kit handoff (F3-528). T46F's verifier fails on its Backup manager. |
| Cross-cutting evidence | UNCLEAR | The README promotion rule and F3-518/F3-524 require: exact-artifact browser evidence for every item; the all-theme, 18-width, full and Reduced Motion review; actual-pixel review; and the consolidated frame-reviewed film. The provenance-bound runners could not run here, and the film is approval-gated. F3-513 still cites base `9dcde2a8` and a `T33-T43` build path; the 2026-08-31 addendum marks that as predecessor lineage. |

## Step 4: decision

Not promoted. `Concepts/PMConcept7.html` and `Concepts/pm7-tools/build_report.json` are unchanged on this branch.

### What blocks the promotion

1. **DL-070 guidance.** The vacated terminal section shows no guidance: the note is created and swept in one render pass. Fix `projectTerminalRuntime` in `home_workspace_source.py` so an empty section keeps its note while another section is live. Then run `terminal_new_section_recoverable`.
2. **T50 against F3-526 (Doctor).** Restore the Doctor owner projection inside the T50 kit: 18 domains, 20 findings, the 15/1/4 partition, the eight `ui.doctor.*` actions. Or record an owner decision that changes F3-526.
3. **T50 against F3-528 (Recovery Kit).** Recovery Kit save and key copy need the human-only, step-up, no-ordinary-clipboard handoff. Separately, reconcile `forge_backup_post_integration_checkpoint.mjs` with F3-535's six-tab limit, so its five unexecuted checks can run.
4. **T45a against F3-520.** Either the eleven-stage journey (`provider_setup`, `free_models_setup` after commit), with the `t45_final_contract` gate updated to match, or an owner decision that keeps nine stages as a named residual.
5. **T45b against F3-521.** Resume after reload (the README declares it pending), and discoverability of every Teacher topic: 46 exist, 30 are surfaced, there is no search, and canon says 47. Implement both, or accept them as named residuals.
6. **T43.** Eight failed assertions in the latest full matrix of the identical source, and no audit verdict. Fix and re-run, or accept as a residual.
7. **Runs that could not happen here.** `settings_transactions`, `onboarding_cinematic`, `guided_tour`, `systems_integration`, `plugin_projection_matrix`, `backup_browser_scm_matrix`, `full_thread_performance`, `hover_tags`, `accessibility_visual_matrix` and `home_workspace_matrix` need a host where a loopback-only network-namespace receipt can truthfully be issued: unprivileged user namespaces allowed, or a root-configured namespace. `systems_integration.mjs` also needs its untracked `scratchpad/pm-integration-20260831/...` input committed or regenerated. The approval-gated film follows.

After the fixes, rebuild to scratch, re-run every verifier on the new exact SHA-256, and promote with a second clean build compared by `cmp`, as the README prescribes.

### Not blocking, recorded for the owners

- The Dashboard-to-Settings split-height page switch is pre-existing. The checked-in artifact has it too.
- `validate-pm7-gui-fixtures` fails on 3 context-compaction fixtures that are in the landing baseline. The validator never reads the artifact.
- The T50 lane's `--parity` failure is inventory drift. Its pinned base predates `84070fd6f5`.
- Stale pipeline documentation:
  - The README's T48 sentence on markup.
  - The README's T33-T43 stage table, which records old-base hashes.
  - The `SETTINGS_REFRESH_README.md` known limit about `guided_tour_checkpoint_selftest.mjs`, which now passes 158/158.
- Stale citations in FinalGUISpec F3-513 and F3-518: base hash `9dcde2a8`. Their `Plans/.audits/audit-20260829-001` and `-20260830-001` directories are untracked (present only in the shared checkout), and the latter has no `audit_report.json`. Plans were not edited here.

## Evidence

Raw evidence is at `/mnt/Cursor/PuppetMaster-Evidence/pm7-promotion-20260924/` (145 files, `SHA256SUMS` SHA-256 `eb9d3f2157b58d71ef5b32b247d91de8c2ca42aff099435de2a337447925fc24`). Key files and their SHA-256:

| File | SHA-256 |
|---|---|
| `candidate/PMConcept7.html` (the reviewed artifact) | `da8561f63fe4979be5364445d9c4435d514e2b60abf5de067e611306b3247f5a` |
| `verifiers-and-probes/tour-reload/guided-tour-reload-checkpoint.json` | `415936ac9d9f2b0a8239e779852b06ae1efee45d87d45c7a46375b32f642cb1d` |
| `verifiers-and-probes/tour-lifecycle/guided-tour-lifecycle-checkpoint.json` | `6370aaa722ef169fdcb1c4485548126ff9138fe72b339935379d272374931af3` |
| `verifiers-and-probes/tour-polish/guided-tour-polish-checkpoint.json` | `cc3bb3802ce6214b16f799de75e7bd663e675e75b01155c2939ddf0af25e5fdb` |
| `verifiers-and-probes/tour-checkpoint-unit.json` | `ca60e603f2069f45243357cc0d322aaa0fd07d9a69c279367148988a5dc25531` |
| `verifiers-and-probes/settings-refresh/settings-refresh-checkpoint.json` | `d8e03fa8fa1c8d35547d962a5c442ed5611e1fa70f4b14f755be9c14782772de` |
| `verifiers-and-probes/settings-placement/settings-placement-checkpoint.json` | `9a8db25bdf7f1c367184e7509af3c90b33686fff40771f8d728f0494206a70a3` |
| `verifiers-and-probes/forge-backup/forge-backup-fast-checkpoint.json` | `e62379421f7ac1adc469f9beede7148c8954c2ae2f084e8c1b8128b764ce558e` |
| `verifiers-and-probes/dl070-probe/dl070-probe.json` | `b926b06d0caf51f699208ad901c44a85fa175f6cffccbcddbb9d3404ed0756eb` |
| `verifiers-and-probes/pageswitch-probe/pageswitch-probe.json` (candidate) | `b6f1ce811c2a8ac904a33b649fcb539c0c962cdfe2e79f8ef7adc4e0b8f9da7a` |
| `verifiers-and-probes/pageswitch-probe-checkedin/pageswitch-probe.json` | `575ed01d943f607a7408a3262a5fc528728ef1f074cd3a05a1416692df76ea6e` |

The attribution chain is `attribution/chain.bundle`. It is a git bundle of the throwaway chain repository: `git clone` it, then `git blame PMConcept7.html`. The scripts that produced every result are in `scripts/`.
