# M03 Critic — independent review of researcher draft (S03 lab-notebooks)

Role: fresh independent critic. Read brief + discovery.md (frozen) + source-map.json/sources + revealed-plan.md + draft.md. No discovery rewrite. This file is substantive criticism; `final.md` is the complete final with explicit dispositions.

## Verdict
Draft is broadly correct in rejecting P2-latest, P4-live-URLs, P5-exit-only, P6-later, and in requiring locks+sandbox+pinning+full badge gate. Critic requires 9 fixes before final: 3 correctness gaps, 3 overclaim/precision fixes, 3 completeness additions. None require re-reveal; all are satisfiable from existing sources + explicit uncertainty.

## Correctness gaps (must fix in final)

C1. R provenance gap: draft pins R via base digest/rig + renv.lock + CRAN snapshot, but does not state that renv records R version yet `restore()` does not enforce/switch R, and pak-shaped DESCRIPTIONs change lock records. Without an explicit R-version assert at build + recorded `R --version`, a "green" R reproduction can pass on the wrong R. Fix: add R-version assert + record step to build gate and badge.

C2. Sandbox tier ambiguity: draft allows bubblewrap/nsjail fallback as "explicit weaker tier" but badge rule says weak-sandbox max amber only as a recommendation ("recommendation: no"). For untrusted uploads this leaves a green-on-weak-sandbox hole. Fix: harden to MUST: only runsc/gVisor (or stronger microVM where offered) may show green; weaker tiers max amber with tier label. Also require `--cap-drop=ALL`, no-new-privs, read-only root, no-net, PIDs+memory+CPU+wall-clock as a single named profile, not an à-la-carte list.

C3. Selected-result definition missing: draft asserts "output cell exists + hash matches" but never defines how the selected result is named (cell tag? Papermill parameter set? artifact path?). Without a selector (e.g. `result-id` = tagged cell + named artifact + parameter hash), two runs can both be "green" on different results. Fix: define `result-selector` (tags + params + artifact paths) recorded in RO-Crate and badge payload.

## Overclaim / precision fixes (must fix)

C4. ReviewNB "teams" claim: discovery correctly labels vendor team list as unverified; draft repeats ReviewNB without that caveat in one place. Fix: carry "vendor claim, not independently verified; free-for-OSS per vendor" into final wherever ReviewNB is recommended.

C5. Offline guarantee wording: draft says "Quarto embed-resources HTML ... but offline must be validated" — good — yet sketch step 6 could be read as "embed-resources implies offline". Combined with #9404, final must state: no flag implies offline; only a network-disabled open with zero requests passes. Also name the two-format rule (article vs reveal.js tested separately).

C6. WASM scope creep risk: draft correctly demotes WASM to preview, but lists Pyodide module gaps without stating the decisive ecology blockers (no sockets/threads/multiprocessing, CORS-bound fetches, R split). Final must state plainly: WASM preview is out of scope for reproduction proof and must never set badge state.

## Completeness additions (must add)

C7. Missing failure taxonomy: badge needs explicit machine-readable reasons (timeout vs OOM vs missing-output vs hash-mismatch vs pin-missing vs weak-sandbox vs offline-fail). Draft names the gate but not the codes. Add minimal enum + which validation covers each.

C8. Missing data-license path: P4 user decision names bundle-vs-manifest but final must state the safe default explicitly: default to manifest + verified-fetch script when license/size unknown; bundle bytes only when license permits and size fits. Never block review on missing bytes without a clear red/amber reason.

C9. Missing resource-default starting point: draft says caps "pending measurement" with no bootstrap. For a small academic group, final should give conservative starting defaults (e.g. per-run wall clock + per-cell timeout + memory/CPU/PIDs placeholders marked as defaults-to-tune) and require recording actuals. Without this, implementers will ship unconstrained or copy nbclient 30 s blindly.

## Preservation check (must retain in final)
- All six P dispositions with O4 labels; rejected subclauses ("latest", live URLs, exit-only green, "later") must stay rejected.
- Alternatives (server vs WASM vs no-exec; DataLad vs DVC vs manifest; Marimo vs Jupyter; Quarto vs nbconvert; SaaS vs self-hosted comments).
- Conditions, constraints, disagreement, uncertainty, and 10 proposed validations with executed-vs-proposed separation. No execution may be claimed.
- Source grounding: S01–S19; usage/billing null; no silent rebind.

## Disposition ledger (critic → final, explicit)
- C1 → FINAL §Badge+Build: add R-version assert/record. ACCEPTED.
- C2 → FINAL §Sandbox+Badge: harden weak-tier max amber to MUST; name single sandbox profile. ACCEPTED.
- C3 → FINAL §Result selector: add `result-selector` definition + crate/badge recording. ACCEPTED.
- C4 → FINAL §Review: add vendor-claim caveat each time ReviewNB recommended. ACCEPTED.
- C5 → FINAL §Export: "no flag implies offline" + two-format rule. ACCEPTED.
- C6 → FINAL §WASM: explicit never-sets-badge rule + decisive blockers. ACCEPTED.
- C7 → FINAL §Validations: add failure-code enum mapped to checks. ACCEPTED.
- C8 → FINAL §Data: safe default manifest-first. ACCEPTED.
- C9 → FINAL §Resources: conservative bootstrap defaults marked tunable + actuals recording. ACCEPTED.
- No critique items rejected; no draft findings dropped without replacement. All preservation items carried.
