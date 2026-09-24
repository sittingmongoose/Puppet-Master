# PMConcept7 promotion review, 2026-09-24

STATUS: IN PROGRESS (steps 1-2 done; step 3 verifier runs and wave review under way)

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
