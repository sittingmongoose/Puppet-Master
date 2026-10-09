# Verify log — critic independent verification (A-M09-B control/critic)

Written_utc: 2026-10-09T18:53:00Z. Method: every consequential draft claim cross-checked against the
predecessor's bounded evidence (`research/sources/S01–S13`) and, for the two most load-bearing facts,
re-fetched live from the primary source by this stage (independent access timestamps below).
Verdicts: **supported** (evidence matches the claim as written), **inference** (claim goes one step
beyond the capture but is consistent with it), **unsupported** (no captured evidence), **overstated**
(capture says less than the draft asserts).

## 1. Re-fetched primary sources (this stage's independent checks)

| Claim (draft §) | Primary URL | This stage's access (UTC) | Result |
|---|---|---|---|
| jupyter-resource-usage displays but does not enforce MEM_LIMIT/CPU_LIMIT; cgroups never mentioned; PSS-else-RSS (draft §2 P2, §3.2; S03) | https://github.com/jupyter-server/jupyter-resource-usage | 2026-10-09T18:52:30Z | **Confirmed verbatim**: "can display a memory limit (but not enforce it)"; CPU limit "does not enforce it"; no cgroup mention; "PSS whenever possible (Linux only)… default to RSS otherwise" |
| nbval treats each cell as a pytest test; non-reproducing output fails even with clean execution; --nbval vs --nbval-lax marker behavior; regex sanitize file (draft §2 P3, P5; S08) | https://github.com/computationalmodelling/nbval | 2026-10-09T18:52:30Z | **Confirmed verbatim**: "Each cell is taken as a test, a cell that doesn't reproduce the expected output will fail"; lax = errors-only except `#NBVAL_CHECK_OUTPUT` cells; `--nbval-sanitize-with` regex replace pairs |

## 2. P dispositions checked against predecessor evidence

| Draft claim / disposition | Evidence checked | Verdict | Note |
|---|---|---|---|
| P1 already-covered: repo2docker builds from source repositories (S01) | S01-repo2docker.md | supported | Evidence says "source code repositories"; git is implied by the GitHub/GitLab host list. Nuance, not an error. |
| P1 refinement: nbdime git integration, `nbdiff-web <commit> <commit>`, auto-resolves execution counters (S04) | S04-nbdime.md | supported | v4.0.4 stated; git-ref diffs since v0.3; counter auto-resolution both in evidence. |
| P1 paired twins: jupytext py:percent diffs "look like ordinary script diffs" (S11) | S11-jupytext.md | supported | README captures the plain-text diff benefit; quote is a paraphrase, consistent. |
| P2 correction: renv.lock pins version/source/hash; renv "not a panacea"; Docker suggested (S02) | S02-renv.md | supported | Exact quote and lockfile structure (R version, repos, per-package version/source/hash; GitHub ref+SHA) in evidence. |
| P2 rejection of "latest": MRAN retired 2023.06.0, pre-2018-12-07 snapshots gone; default R 4.2→4.4 in 2025.12.0; buildx in 2025.08.0 (S12) | S12-repo2docker-releases.md | supported | All three release facts match entry-for-entry. |
| P2 enforcement layer: KubeSpawner `*_guarantee`→requests, `*_limit`→limits, defaults None (S09) | S09-kubespawner.md | supported | Mapping and defaults verbatim; LocalProcessSpawner non-enforcement also in evidence (draft §3.2 relies on it correctly). |
| P3 correction: stdout/HTML is a record; nbval output comparison is the proof model; lax+sanitize absorbs nondeterminism (S08) | S08-nbval.md + live re-fetch | supported | Confirmed twice (evidence file and 18:52:30Z re-fetch). |
| P3: nbdime semantic output diffs (hide base64, image diffs) (S04) | S04-nbdime.md | supported | Both capabilities in evidence. |
| P3 condition: strict mode "demands deterministic notebooks" (S08) | S08-nbval.md | inference | Strict compares all outputs; the determinism demand is a direct reading, not a quote. Reasonable. |
| P4 correction: build-time archival resolution exists — Zenodo/Figshare/Dataverse/Software Heritage hosts (S01) | S01-repo2docker.md | supported | Host list verbatim in evidence. |
| P4: webR pre-bundles data onto the virtual filesystem for offline use (S06) | S06-webr.md | supported | "Mounting Filesystem Data" section captured. |
| P4 embedded user decision (large datasets, checksums variant) | — | inference | Policy judgment, draft labels it a user decision, not a discovery. Correctly labeled. |
| P5 rejection: exit-0 badge would pass drifted outputs; display vs enforcement conflated (S03, S08, S09) | S03/S08/S09 files + 2 live re-fetches | supported | The category-error pairing is the draft's synthesis; both halves independently confirmed. |
| P6 correction: ReviewNB cell-level threads synced to PR, resolution tracking, email notifications, free academic tier, self-hosted Docker (S10) | S10-reviewnb.md | supported | All elements in evidence; pricing matches source-map's single usage_billing entry. |
| P6: nbdime keeps conflicted notebooks valid/viewable (S04) | S04-nbdime.md | supported | In evidence. |
| P6 optional: jupytext gives annotations a textual home that survives export (S11) | S11-jupytext.md | inference | Text formats hold inputs/metadata only; "survives export" is a design inference consistent with the capture. |

## 3. Retained findings and validation proposals

| Draft claim | Evidence checked | Verdict | Note |
|---|---|---|---|
| §3.4 papermill parameterized execution, R among translator languages (S07) | S07-papermill.md | supported | Python, R, Julia, Scala translators in evidence. |
| §3.5 WASM bracket: JupyterLite browser-only, static hosting, Pyodide/Xeus Python + Xeus R kernel; limits (S05, S06) | S05-jupyterlite.md, S06-webr.md | supported | Coverage/memory limits and "API subject to change" both captured. |
| §3.6 noWorkflow trials: code hashes, file accesses, `%now_run`; Flask-dev-server and pip-drift caveats (S13) | S13-noworkflow.md | supported | Caveats match; draft correctly declines to claim service fitness. |
| §6 V3 cites releases 2025.12.0 vs 2026.04.0 (S12) | S12-repo2docker-releases.md | supported | Both versions exist in the captured chain. |
| §6 rOpenSci devguide 404 → peer-review claims stay uncited | source-map.json failed_fetches | supported | Consistent across discovery §4, draft §6, and the registry. |

## 4. Omissions and challenge candidates surfaced by this verification

1. **Minor omission (S05):** JupyterLite's support policy (only the two most recent core releases, 0.7.0/0.6.0) is captured in evidence but absent from the draft's Alternative B conditions — relevant to "lightweight path" maintenance risk. Minor.
2. **Minor omission (S08):** pytest-xdist `--dist loadscope` constraint on parallel nbval runs is uncited in the draft; relevant to a service that validates many submissions. Minor.
3. **Minor omission (S09):** `extra_resource_guarantees/limits` (e.g. GPU) uncited; relevant if ecology workloads need GPUs. Minor.
4. **Overstatement check (P1 wording):** "repo2docker builds from git repositories" — evidence says "source code repositories" and separately lists non-git archival hosts, which the draft itself uses for P4. Wording could mislead in isolation; not material because the draft elsewhere states the archival-host support.
5. **No false corrections found:** every alleged correction (P2 "latest", P3 proof standard, P4 timing, P5 badge, P6 sequencing) rests on captured primary evidence confirmed above; no disposition contradicts its cited source.
6. **Executed-checks honesty:** draft's claim that no product runtime ran matches the evidence kind (full-discovery, bounded excerpts only); nothing in sources/ suggests a runtime existed.

## 5. Verdict summary

- 24 rows checked: 21 supported, 3 inference (each correctly labeled in the draft as condition/decision/enhancement), 0 unsupported, 1 minor wording overstatement, 3 minor omissions, 0 false corrections or rejections.
- The two claims the whole P3/P5 analysis rests on were re-verified live at 18:52:30Z and match the predecessor captures word-for-word; no drift between captures is apparent.
