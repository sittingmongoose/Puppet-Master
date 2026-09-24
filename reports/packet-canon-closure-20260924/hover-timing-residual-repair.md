# Hover timing residual correction

HOVER-METADATA-001: corrected only TOUCH-HOVER-001's stale 900 ms claim to the current 1000 ms keyboard-focus dwell already required by Final GUI F3-523, the presentation schema and authored concept source. Immediate accessible descriptions remain separate from visual dwell. No GUI implementation or timing policy changed.

The cited browser verifier still asserts retired 1050/750/900/220 ms timings instead of current 1600/1100/1000/160 ms pointer residence/stationary intent/focus/departure timings. The revised residual explicitly preserves this verification gap, partial status and pending current-artifact/native/visual evidence. Browser verification repair and execution are not claimed here.

Verification: the focused regression passes; all 57 Touch source tests pass in 13.207 seconds. Independent read-only review found no blocking issues and reran the focused test. Static hover-schema review validates its positive and rejects seven authored negatives, including the 900 ms predecessor. No full browser or native runtime test was run.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `touch_closure/hover-edges-013.json`, SHA-256 `83f04fb4b30dfb163d5380481551372d69f9e37bd469ef0a933db9a0454df24b`.
- `browser_scm_performance/hover-residual-independent-review.json`, SHA-256 `1adbc16458a398cfe0ac9f23397f3dfba3f2ee80770834c89e3c88122c44683d`.

No owner prose, schema, governance binding, baseline, generated readiness or main branch changed.
