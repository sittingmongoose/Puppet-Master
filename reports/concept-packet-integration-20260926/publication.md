# PMConcept7 publication from TestOpus (2026-09-26)

`Concepts/PMConcept7.html` is now published byte-identical from
`Concepts/TestOpus5.5PmConcept.html` (the leading GUI/interaction reference)
through its authored generator. No TestOpus UI/CSS/JS source was edited; no
Concepts file was deleted or pruned.

## Source chain

Pinned TestPM settings checkpoint → `build_testpm_settings_refresh.py` →
`TestPMConcept.html` (sha `f1bc81ae…`, matches the generator pin) →
opus-5.5 `build.py` → `TestOpus5.5PmConcept.html` → `PMConcept7.html`
(same bytes).

## Changed files (owned paths only)

- `Concepts/onboarding/opus-5.5/tools/build.py` — new `--publish-pm7` flag
  writes the built bytes to both `TestOpus5.5PmConcept.html` and
  `PMConcept7.html`; `--check` now also fails while `PMConcept7.html` is
  missing or differs by one byte. Check hardening (this Goal, `check()`
  only): `--check` now explicitly fails when
  `Concepts/TestOpus5.5PmConcept.html` is missing (previously skipped),
  and both outputs are compared as raw bytes
  (`TARGET.read_bytes()` / `PM7_TARGET.read_bytes()` vs
  `built.encode('utf-8')`) instead of `read_text`, so CRLF-only
  differences no longer pass despite the exact-byte claim. Existing
  stale/differs/missing-PM7 messages retained; no UI, concept, or other
  script changes.
- `Concepts/pm7-tools/build_pm7.py` — runs whose `--out` resolves to
  `Concepts/PMConcept7.html` abort (exit 2) unless the new
  `--allow-legacy-pm7-promotion` flag is passed. Base pin, block census,
  transforms, and gates are unchanged.
- `Concepts/onboarding/opus-5.5/README.md` — authority order corrected to
  user direction, then current canonical Plans; packet material (including
  attached instructions/prompts) is historical source only. Documents
  `--publish-pm7` and the parity check.
- `Concepts/pm7-tools/README.md` — new "PM7 publication" section; the old
  `--out Concepts/PMConcept7.html` promotion and the "promote only from
  build_pm7.py" status rule are marked superseded except with the explicit
  legacy flag. T33+ tail (old T44/T45/T50) retained for explicit
  historical output.
- `Concepts/PMConcept7.html` — replaced via the generator (was the old
  4,308,739-byte T42-stage artifact, sha `b019cf8d…`).

## Flags and compatibility

- Plain `build.py` still writes only TestOpus; plain `build.py --check`
  additionally enforces PM7 parity (new failure mode, intended).
- Plain `build_pm7.py --outdir <scratch>` is unaffected (historical output
  to scratch still works). Only targeting the canonical
  `Concepts/PMConcept7.html` now requires `--allow-legacy-pm7-promotion`.

## Checks run (this worktree, exact commands)

- `python3 Concepts/onboarding/opus-5.5/tools/build.py --check` → failed
  pre-publication with the new PM7 parity problem (check is live), then
  `check ok` after `--publish-pm7`.
- `python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7` run
  twice; identical output both times (deterministic).
- `cmp Concepts/TestOpus5.5PmConcept.html Concepts/PMConcept7.html` →
  identical.
- SHA-256 parity: both files
  `19df7d24369db6bd05d505cb21de5fe0c86cebc971c6c469c85c7defd775e460`
  (7,510,935 bytes). TestOpus bytes are unchanged from the pre-existing file.
- Node syntax sweep of the published file (same logic as the TestPM lane's
  `node_check`): 25 script blocks `node --check` clean, 3 JSON blocks parsed.
- `python3 Concepts/pm7-tools/build_pm7.py --outdir /tmp/pm7-historical-recheck
  --report` → 21/21 transforms ok, 5/5 gates pass
  (`legacy_pm7_promotion: false`); historical output sha
  `da8561f6…` (7,405,980 bytes), confirming the old tail differs from the
  selected design and the guard is load-bearing.
- Guard refusal: `--out Concepts/PMConcept7.html` without the legacy flag →
  exit 2 with redirect message, before any transform runs.
- `git status` shows only the five owned paths modified; TestOpus content
  unchanged (byte-identical rewrite, no git diff).

## Check-hardening verification (this Goal, exact commands)

Post-fix focused runs only; no broad campaign, no refactor, no
commit/push. Real concept files were never mutated for failure testing:
`--check` is read-only, and all negative probes monkeypatch `TARGET` /
`PM7_TARGET` to temp paths (both real outputs still dated 2026-09-26
20:27 UTC, 7,510,935 bytes).

- `python3 Concepts/onboarding/opus-5.5/tools/build.py --check` →
  `check ok`, exit 0 (positive, post-fix, real files).
- `python3 /tmp/o55_check_probe.py` → 9/9 passed, exit 0:
  positive both-byte-identical clean; TARGET-missing fails with
  `TestOpus5.5PmConcept.html is missing; run build.py`; PM7-missing
  fails with the existing missing message; TARGET one-byte flip fails
  stale; PM7 one-byte flip fails differs; TARGET CRLF-only fails stale
  while old `read_text == built` reads True (defect reproduced, now
  fixed); PM7 CRLF-only fails differs while old `read_text` reads True.
- Rerun captured: `python3 /tmp/o55_check_probe.py >
  /tmp/o55_check_probe.log 2>&1` → exit 0.

Probe evidence (SHA-256):

- `/tmp/o55_check_probe.py`
  `d36c5be81e3b3b68f9b81403c0edada9370551d3a44b14f306afa461ca04c678`
- `/tmp/o55_check_probe.log`
  `b8e3a2bb5afed8b22241e5fad66fef755375b07f004760948c1b75eb55c98c6e`
- Both probe files were subsequently preserved under
  `/mnt/Cursor/PuppetMaster-Evidence/scratch/concept-packet-integration-20260926/publication/`
  with the same hashes. That directory also retains `pm7_node_probe.py`
  (`f412d24e303d2a1ff1504be51b3d9468386a930043e3408df14ee303b27b9ef8`)
  and the historical `build_report.json`
  (`ccf8605c9736f01b673c31a0ed8350dbb079be378c5785b98292ec8ed480d800`).
- GPT-6 Sol high independently reviewed the publication and both bounded check
  fixes. Cycle 2 passes: missing either output, one-byte differences and
  CRLF-only differences are rejected; the live check and exact SHA parity pass.
  Two trailing-whitespace lines inherited from the selected HTML are preserved
  in both outputs; changing PMConcept7 alone would violate required parity.

## Remaining limitations

- No browser acceptance run (out of scope for this task); static gates and
  node syntax checks only.
- No Plans, governance, Spec Lock, evidence, registry, or shard changes.
- Historical generation used temporary scratch. Its report and the probe code
  are retained at the external evidence paths above; raw build artifacts are
  not committed to the repository.
- The maintained regression check is the extended `build.py --check` (the
  existing convention for these generators); no separate test file was added,
  per the disjoint-ownership constraint.
