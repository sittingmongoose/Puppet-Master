# PMConcept7 promotion review, 2026-09-24

STATUS: IN PROGRESS (steps 1-2 done; verifier runs done; wave review being written)

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
