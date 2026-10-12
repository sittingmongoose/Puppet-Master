# Independent critic review — D-P06 / D-R2-P02-control

## Scope and conclusion

I reviewed the full original brief, the full revealed plan, and the complete investigator `discovery.md`, `draft.md`, `source-map.json`, `plan-reveal.json`, and source index listed in `input-map.json`. I independently navigated the carried source index and reopened consequential primary sources recorded in this critic’s [`source-map.json`](source-map.json). I did not inspect other candidates, campaign history, unrelated files, or parent conversation.

The draft is substantively strong on capability boundaries, output safety, derived-text provenance, isolation alternatives, stale results, cleanup, and proposed-versus-executed validation. It preserves the original scope and does not choose a runtime. The main material gap is that the brief asks for repository paths and tests, while the evidence package names a test-suite authoring guide and broad directories but does not evaluate a concrete upstream test case relevant to the proposed limits, cleanup, extension host, or process behavior. The guide is correctly treated as a fixture pattern, not product proof. The draft is not ready to be treated as a final evidence package until that source-discovery gap is resolved.

No test, executable witness, host, real note/notebook, or downloaded code was run in this critic stage. The inherited draft also reports no executed checks. Its synthetic/adversarial cases remain proposed. Nothing in this review upgrades them to executed validation.

## Released-plan coverage and dispositions

| Plan area | Draft locator | Assessment |
|---|---|---|
| Capability transfer | “Exact released-plan dispositions,” §1 | **Revise.** Correctly rejects a raw path or notebook-root capability and makes the attachment handle host-mediated, read-only, short-lived, and job-bound; indirect references need separately granted handles. This aligns with the unrelated-notebook prohibition. |
| Output display | §1, “Prefer a declarative preview result” | **Reject direct active-markup display; prefer typed host rendering.** Rich executable output remains a conditional, higher-risk option. Sandboxed/unsandboxed `srcdoc`, opaque origin, IPC, and Electron caveats are appropriately distinguished (S-17, S-20, S-21). |
| Indexing/provenance | §1, “Index extracted text in a derived-content namespace” | **Revise.** Correctly rejects note-ID-only indexing and describes separate derived records, source/extension identity, status, user-facing labels, and complete-success publication. |
| Isolation and budgets | §2 | **Retain process isolation as a candidate; revise guarantees.** Direct-child kill is distinguished from process-tree containment; the draft compares Wasm, browser workers, and OS processes without choosing one. It includes per-job and aggregate limits but leaves numeric values to product decisions. Conditional source claims are generally scoped (S-01, S-02, S-06–S-09, S-19, S-24). |
| Cache identity | §2, “Reject: extension identifier plus input digest…”; §3 | **Reject the plan’s key; revise.** The proposed key includes source bytes/identity, configuration, immutable extension artifact, API/runtime/policy, and relevant display settings. Upgrade/disable/uninstall and historical display are distinguished. |
| Cleanup/recovery | §2, “Reject: process termination establishes cleanup ownership”; §4 check 6 | **Reject the plan’s inference; revise.** Host ownership, job roots, descendant termination, active-reader leases/generations, no-follow identity checks, and quarantine/retry are discussed. Concurrent-use cleanup is explicitly proposed for test. |
| Disable/upgrade/unavailable renderer | §3 | **Revise and preserve owner choice.** The note stays editable; stale/disabled/unavailable/failure states are visible; search and retention are explicit policy decisions. |
| Required validation | §4, proposed checks 1–6 | **Satisfies the plan as proposals.** Hung nested worker, active markup/indirect references, stale cache, uninstall, failed extraction, and concurrent cleanup each have synthetic test directions. No future host or real notebook is claimed tested. |

## Findings

### C-01 — Material incomplete: no concrete upstream test case was evaluated

**Draft locator:** “Scope and method,” final paragraph; `discovery.md` “Regression and test directions”; draft §4; source-map S-12. **Final locator:** none; this critic was instructed to review, not issue or repair a final. **Evidence:** the brief asks for relevant repository paths and tests. The inherited index cites the pinned WASI testsuite authoring guide, and the draft names directories such as `tests/rust/wasm32-wasip1` and `tests/rust/wasm32-wasip3`; the guide describes test organization and gives an illustrative filename, but the investigator did not identify or inspect a concrete existing test file/case. There are no concrete upstream Wasmtime tests for Store limits/fuel or host output and no concrete extension-host tests in the cited VS Code material. The proposed synthetic cases are not source discovery and are correctly labeled unrun. **Classification:** material incomplete. A follow-up should identify specific public test paths and explain the exact behavior each demonstrates, with repository version/commit and applicability; it must not imply the future host has been tested.

### C-02 — Unsupported policy assumption in one proposed test

**Draft locator:** §4, proposed check 4 (“new permission requests block until consent”); compare §3 permission-change paragraph and “Unresolved decisions and assumptions.” **Final locator:** none. **Evidence:** the brief requires users to know when previews come from different extension versions and the plan asks how changed permissions are communicated; the draft leaves consent UX unresolved. Neither the plan nor cited sources establish that each newly requested permission must block until consent. **Classification:** unsupported. Keep the assertion conditional on an owner-selected permission/consent policy; preserve the requirement to surface changed permissions before execution.

### C-03 — Minor wording: “cryptographically bound” is underspecified

**Draft locator:** §3, “An unavailable renderer may show a last preview only if it is cryptographically bound…” **Final locator:** none. **Evidence:** the cache-key proposal uses host-computed digests, but the draft does not state whether this phrase means digest equality, a signed record, authenticated storage, or another mechanism. The cited evidence establishes key inputs, not a signature/authenticity protocol. **Classification:** minor locator/wording. Prefer “the host verifies the cached record’s key against current source digest and exact extension/runtime identities,” and describe any storage-integrity requirement separately.

### C-04 — Honest unresolved external inputs

**Draft locator:** “Unresolved decisions and assumptions”; §§2–3. **Final locator:** none. **Evidence:** the brief specifies no supported OS/filesystem matrix, extension languages/file types, need for active content, network policy, quantitative CPU/memory/output budgets, stale-result retention period, or consent design. Platform-specific cleanup and isolation conclusions remain conditional; S-11 and runtime-specific examples cannot select a portable host boundary. **Classification:** honestly unresolved external input, not a critic defect. Preserve these as owner decisions; do not turn review advice into a runtime/framework choice or scope reduction.

## Evidence and applicability notes

- I directly checked WIT contracts; Wasmtime fuel/store limits and selected advisories; overlapping WASI preopens; WASI filesystem semantics; process kill/reap behavior; browser-origin sandboxing; Electron utility-process defaults; VS Code web-extension constraints; and SQLite transactions. The critic source map records exact URLs, inherited identities, versions/commits, locators, reviewer access windows, operations, conditions, and applicability.
- The investigator’s S-14 VS Code Extension Host evidence remains correctly marked as a search excerpt with a timed-out direct open. It is not a basis for a fine-grained correction.
- For S-01/S-02, docs.rs search output corroborated configuration claims but did not independently confirm the inherited 49.0.2 pin; one cached StoreLimitsBuilder result showed 49.0.1. This reviewer limitation is recorded without changing the inherited identity.
- The Wasmtime advisories are version/API/configuration-conditioned. The draft generally preserves those conditions and does not generalize them into proof that Wasmtime is categorically unsafe or safe.
- SQLite is only presented as a possible transactional mechanism; its single-writer and snapshot behavior is accurately stated. WASI cleanup is presented as a test-fixture pattern, not permission to clean arbitrary product paths.

## Final fidelity and check status

The draft preserves the brief’s prohibitions against unrestricted notebook access, ambient-privilege execution of extension markup, pathname-only cleanup inference, and loss of derived-text provenance. It keeps proposed validations separate from executions. Its strongest practical direction—typed output rendered by host-owned UI with explicit per-object capabilities, a separate provenance-bearing search record, exact cache identity, and visible stale/failed states—is a candidate design, not a final product decision. No check was executed by this critic; there is no sandbox scope to report.
