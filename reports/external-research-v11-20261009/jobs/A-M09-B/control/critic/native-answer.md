# Native answer — ER11 A-M09-B control/critic (verbatim export, predeclared fallback)

Assignment: independently inspect the complete research-stage draft, original brief, revealed
exact plan (P1–P6) and governing primary evidence; challenge consequential facts/defaults/
conditions, discovery/alternatives, every P disposition, omissions, false corrections/rejections
and validation applicability; save critique.md (material vs minor findings) and source-map.json;
no premium evaluator access, no candidate repair outside the assigned recipe. All five dispatched
goal-loop tickets completed and independently verified before this answer.

## Scientific result

The draft is sound at its core: every one of its five disputes with the thin plan (P2 "latest
dependencies", P3 stdout/HTML-as-proof, P4 execution-time data resolution, P5 exit-code green
badge, P6 deferred annotations) rests on captured primary evidence, and no false correction or
rejection was found. Its two most load-bearing facts — jupyter-resource-usage displays but does
not enforce MEM_LIMIT/CPU_LIMIT (cgroups never mentioned, PSS-else-RSS), and nbval's per-cell
pytest model ("Each cell is taken as a test, a cell that doesn't reproduce the expected output
will fail", strict vs `#NBVAL_CHECK_OUTPUT`-marked lax mode, regex sanitize files) — were
re-fetched live by this stage at 2026-10-09T18:52:30Z and match the predecessor captures
verbatim. All 24 verify-log rows: 21 supported, 3 clearly-labeled inferences, 0 unsupported.

Four material findings stand against the draft's text, none against its evidence:

1. **MF1 (S05, S06):** Alternative B's "no uploaded-notebook access problem by construction"
   overstates its captures — the WASM sources establish browser-only execution and static
   hosting, not security isolation of untrusted notebook code running in the reviewer's browser.
   The advantage must be downgraded to inference with the untrusted-execution question named.
2. **MF2 (brief; S04, S10, S11):** the brief's "preserve authorship" clause is never explicitly
   disposed of under O4; annotations are covered thoroughly, attribution only by silence. Git
   history plausibly absorbs it (with rebase/squash caveats), but the draft never says so.
3. **MF3 (S01):** storage substrate is a real user decision the draft's §5 omits — S01's own
   archival hosts (Zenodo/Figshare/Dataverse/Software Heritage) mean a DOI-resolvable submission
   need not be a git repository, which challenges P1's unconditioned "already-covered".
4. **MF4 (S08, live re-fetch):** the lax verification contract has an unstated fabrication window:
   unmarked cells are error-checked only, so drifted/fabricated outputs confined to unmarked cells
   pass lax cleanly; V1 as designed has no unmarked-fabrication arm, and lax badge semantics
   should disclose the unchecked share of cells.

Seven minor findings (uncited S05 support-window policy, S08 pytest-xdist constraint, S09 GPU
resource traits; "builds from git repositories" wording slightly exceeding S01; jupytext
annotation-survival presented as captured rather than inferred; a missed S12 "DOI resolution via
REST APIs" corroboration for P4; the P4 user decision embedded inside a correction disposition).
Four critic demands were flagged invalid rather than enforced: demanding runtime execution of
V1–V6 (no runtime exists; O6 separates proposed from executed), re-fetching all 13 sources on a
minutes-old registry, repairing the candidate in place (assignment forbids it), and gating on
gVisor/Firecracker-class sandbox evidence (outside the brief's scope; honestly recorded absent).

## Deliverables (this directory, all written before stage deadline 18:59:55.426080Z)

- `critique.md` (18:57:12Z) — full material/minor/invalid-demand critique, 1,422 words.
- `source-map.json` (18:59:45Z) — 13 immutable inherited IDs, no rebind (per-ID URL/locator
  equality with the research registry verified), critic re-observations of S03/S08 with
  `critic_recheck` blocks.
- `sources/` — INDEX.md plus two new bounded re-check evidence files (S03, S08).
- `verify-log.md` (18:53:09Z) — 24-row claim-level verification with the two independent
  re-fetches cited by URL and access timestamp.
- `ingest-notes.md` (18:50:31Z) — all declared inputs read with paths.
- `goal-lifecycle.md` — observable lifecycle record; unexposed fields UNKNOWN; no handwritten
  receipt JSON; usage/billing unobserved = null.

Uncertainty carried: 11 of 13 sources rest on same-day predecessor captures (18:31–18:42Z) rather
than fresh re-fetches; MF1–MF4 concern what the draft's text claims relative to its captures, not
new claims about the tools themselves.
