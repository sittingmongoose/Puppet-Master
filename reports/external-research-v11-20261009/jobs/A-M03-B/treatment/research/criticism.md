# Criticism — S09 plugin-workbench (A-M03-B / treatment / research)

Critic pass, method M03 v1: fresh independent critic reviewing the researcher's `discovery.md` (frozen) and `draft.md`, then writing the complete `final.md`. Critique time: 2026-10-09 ~19:45 UTC. Every critique point below carries an explicit disposition and a preservation statement. `discovery.md` is frozen post-reveal and is critiqued but not rewritten; `draft.md` is superseded by `final.md`, which is the complete self-contained deliverable (O5).

## C1 — P4's "preview/commit parity" success criterion is asserted but not mechanized
**Criticism.** The draft requires "the preview diff the user approved matches the committed result" but never says how parity is established or what happens when it fails. As written it is a slogan, not a criterion: a commit that appends an operation and a preview that rendered a diff are different computations; nothing in the draft detects divergence (e.g., a non-deterministic extension) between them.
**Disposition: accepted with modification.** The final defines the mechanism: commit appends the operation to the log and *materializes the result by replay*; the replayed result must equal the previewed diff byte-for-field, and equality failure is a first-class outcome ("extension produced different output on re-run — non-deterministic"), quarantining the commit. Where replay is impossible (see C2), parity is checked by direct comparison of stored output against preview instead, and the non-determinism is recorded in the project log.
**Preserved regardless:** the criterion's intent (commit = what was previewed), the operation-log routing, and the draft's statement that undo needs no extension cooperation.

## C2 — The draft never decides whether the dataset is *derived from the log* or *stored beside the log*
**Criticism.** Draft §4 (P4) says "the dataset view is a function of the log" but P4's carried-forward text also says "validate output, then append". Both cannot be the source of truth. If the log is the only truth, a non-deterministic extension breaks materialization; if output is stored raw, the log is decoration and replay/export claims weaken.
**Disposition: accepted.** The final fixes a single source of truth with a defined fallback: the operation log is authoritative; on commit the host materializes by replay and stores a *snapshot* alongside for undo speed and corruption recovery, with the snapshot's provenance (which log positions it covers) recorded. For extensions that fail replay-parity (C1), the snapshot becomes the recorded truth and the operation is flagged non-replayable — export then warns that the recipe alone cannot reproduce the dataset. This preserves the brief's reproducibility promise *honestly*, including its limits.
**Preserved:** OpenRefine-derived pattern (history as extractable JSON re-appliable to other projects), the privacy condition on exported history carrying earlier data states.

## C3 — "Most librarian cleaning tasks are expressible declaratively" is an uncited design hypothesis stated as fact
**Criticism.** Discovery §1 and draft §2 (P1) assert the declarative tier covers "most" real transformations. No source in the evidence base measures the task distribution; this is the load-bearing justification for the tiered architecture's default path and it is currently an overclaim.
**Disposition: accepted — relabel as hypothesis, keep the tier.** The final keeps the declarative default tier (its safety property is independent of the coverage claim: what *is* expressible declaratively is safe by construction) and explicitly labels the coverage estimate a design hypothesis, adding a proposed validation: classify a sample of public librarian cleaning recipes (e.g., Library Carpentry OpenRefine lesson operations) as declaratively expressible or not, and report the fraction. Tuning the tier boundary is then an evidence-driven decision, not a settled one.
**Preserved:** the tiering itself; JSONata's guardrail description; the sandboxed code tier as exception.

## C4 — "De-facto open tool" characterizes OpenRefine's adoption beyond the evidence
**Criticism.** The evidence shows OpenRefine is domain-adjacent, actively released, and richly documented; it does not establish "de-facto" market status. Scientific discipline: characterize only what was observed.
**Disposition: accepted.** The final says "the most prominent domain-adjacent open tool in the evidence gathered for this pass" and grounds every OpenRefine statement in what the fetched pages actually said (extension surface with no stated security model; extractable operation history; release chain). No adoption claim is carried forward.
**Preserved:** all OpenRefine findings that rest on the fetched text.

## C5 — P2's table disposition "Correction (partially rejected)" is muddy for an "exact per-P disposition" requirement
**Criticism.** O4 demands exact dispositions from a closed set. "Partially rejected" is not in the set. The underlying judgment is precise and should be stated precisely: the *clause as written* (path arguments passed to extensions) is rejected; its *intent* (a defined data-in/data-out interface) is corrected into a content-passing interface with a capability-directory fallback for oversized collections.
**Disposition: accepted.** In the final, P2 carries one primary disposition — **rejected as written, corrected in intent** — with the two halves spelled out. Same treatment applied where any P mixes categories (P3, P4, P5, P6): one primary disposition first, refinements labeled after.
**Preserved:** the full reasoning and every condition attached to P2.

## C6 — Offline export lacks a concrete bundle definition
**Criticism.** The brief names "offline export" as a requirement; the draft discusses privacy and "recipe + data" but never defines what an export bundle contains, so reproducibility promises about exports are unfalsifiable.
**Disposition: accepted.** The final defines the bundle: (a) current dataset snapshot (format declared), (b) operation-history recipe JSON (per-project, with extension IDs and pinned versions), (c) a manifest with content checksums and the workbench/extension version matrix, (d) an explicit field recording whether history (and therefore earlier data states) is included. The privacy condition attaches to (d), per SRC-12's own warning about archives containing earlier states.
**Preserved:** the privacy condition and the recipe format's kinship with OpenRefine's extractable operation JSON.

## C7 — "Compare" is a brief obligation the thin plan never touches; the draft buries it as an optional capability
**Criticism.** The brief's first sentence includes "compare small metadata collections"; the revealed plan's six clauses say nothing about comparison. Draft §6 lists a compare-mode as "optional capability... proposed only," which understates an obligation-level item.
**Disposition: accepted with modification.** The final carries an explicit scope note: comparison is a brief obligation with no P-clause coverage; the operation-log architecture yields it naturally (replay the same recipe over two imported collections and diff), but no plan clause commits to it, so it is recorded as a plan-coverage gap for the build stage to scope — not silently absorbed, not invented into the plan.
**Preserved:** the replay-based mechanism sketch.

## C8 — Timeout/memory numbers would be invented if added; draft correctly abstains — keep abstaining, but define the knob
**Criticism.** Nothing in the evidence base supports specific default budgets (e.g., "2s preview"). A final that shipped numbers as findings would overreach; a final that ships no knob at all under-specifies P3's correction.
**Disposition: accepted with modification.** The final states the policy (per-invocation wall-clock + memory ceiling + output cap; separate preview and commit budgets; limits reported to the user on breach) and marks concrete defaults as tunable build-stage decisions informed by proposed validation 1, not as research findings. The QuickJS interrupt-handler/`JS_SetMemoryLimit` and Extism "runtime limiters and timers" evidence justifies *feasibility*, not magnitudes.
**Preserved:** P3's primary disposition and all units/semantics.

## C9 — Live-docs dependency drift is in the source map but invisible in the draft's conclusions
**Criticism.** Several load-bearing sources (Deno permissions, Wasmtime book, OpenRefine docs, Figma docs, JSONata docs) are unversioned live pages; the source map records this, but the draft's design conclusions cite them without carrying the caveat forward. A reader of the draft alone could treat them as stable references.
**Disposition: accepted.** The final repeats the drift caveat at the point of use: mechanism *concepts* (deny-by-default; no-ambient-authority; capability FS) are stable enough to design against; *exact flags, field names, and version strings must be re-verified at build time*, and the two places where exact strings were load-bearing (Extism manifest fields — unverified, docs 404; wasmtime affected/patched versions — quoted verbatim from the advisory) are flagged accordingly.
**Preserved:** the verbatim advisory version strings; the Extism unverified flag.

## C10 — Uncertainty item "what 'extension scripts' covers" is more consequential than its position suggests
**Criticism.** Draft §7 item 7 reads as a footnote, but the answer changes P1's correction materially: "scripts" run via an OS shell pull in interpreters, PATH lookups, and environment variables — each an authority leak channel that a manifest-declared entry point (declared interpreter, bundled runtime, no ambient env) would close. If extensions are arbitrary executables, P1's correction must additionally prohibit shell invocation strings and require a declared, checksummed artifact.
**Disposition: accepted.** The final promotes this to a first-class condition on the P1 design: extensions are declared artifacts (manifest: entry point, runtime/interpreter, version, checksum), never shell strings; the unresolved question (whether the thin plan intended raw executables) is kept in the uncertainty register with its consequence stated.
**Preserved:** the original uncertainty as an uncertainty.

## C11 — Discovery and draft quality checks that passed
Recorded so the final's provenance is explicit: all six plan clauses appear verbatim in the draft and will in the final; every SRC-ID cited resolves in `source-map.json`; discovery is byte-identical to the reveal script's frozen hash; executed vs proposed separation is present and honest (no runtime claims); privacy, platform, and release-failure evidence are all retained. **Disposition: none required — preserved as is.**

## Ledger of dispositions
C1 accepted-with-modification · C2 accepted · C3 accepted-with-modification · C4 accepted · C5 accepted · C6 accepted · C7 accepted-with-modification · C8 accepted-with-modification · C9 accepted · C10 accepted · C11 preserved. Nothing rejected for preservation failure; nothing parked. `final.md` incorporates all accepted points.
