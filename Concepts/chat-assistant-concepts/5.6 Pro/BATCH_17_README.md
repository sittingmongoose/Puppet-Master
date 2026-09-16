# Batch 17 — Plan recovery and document views

## Delivery boundary

This is a source-backed HTML-concept implementation for review. Batch 16 is the supplied applied baseline. Batch 17 is not user-accepted; Batch 18 was not started. No native implementation, durable server behavior, governance closure, formal audit, or production readiness is asserted.

Upstream main was re-confirmed through the GitHub connector at `b66529d97e8c90c13b17dcfed52653a80908c543`. The package was developed in an isolated local snapshot worktree, not the user's shared checkout. No remote commit, staging change, or push was made. Use the guarded update, not an indiscriminate cumulative-folder copy, to integrate into a repository.

Final generated HTML SHA-256: `8d0f5293687fe2fd0d87508bbcaedb5253fca1372e39202b7e80588497300d0b`. Both generated files are byte-identical. The raw hash is authoritative for this delivery; the builder's normalized-text digest differs because the outputs contain CRLF bytes.

## Try the two ordinary-control workflows

Open `index.html` or `PM_Chat_Assistant_5.6_Pro_Standalone.html` in an ordinary browser. Open **Demo Studio**, then **Plan recovery & document views · Batch 17**.

**Recover without starting over:** prepares local inputs and a composer request, not a running Plan. Send, open the Plan, and explicitly Build. Normalization completes, then the retained rate-table lookup fails. The primary remains Building… with a separate Build failed explanation. An unrepaired Retry refuses. Open the calculation workspace, reconnect the original input, return to the Plan and Retry. A new attempt executes under the same PlanRun; the completed normalization is preserved. Independent validation produces a grand total of 9532 cents. Open the original output and export the separate execution report.

**Read the exact evidence:** prepares the document request. Send and open its Plan; exploring does not build it. Rich Text and Markdown resolve the same immutable structured revision. Inspect the table, chart, actual graph edges, Mermaid static fallback, code, checklist, sandboxed table filter, reference image, short video fixture and explicitly unavailable attachment. Publish a distinct source V2 in the workspace; the approved Plan still opens V1. Export exact Markdown or open the browser print document for PDF.

**Stop and revise:** on the failed/active Plan, More exposes Stop and revise. The safe-stopped V1 remains Building… with a Paused reason until the ordinary targeted composer accepts V2. V2 is ready, not automatically built. The old run is fenced; original document/output evidence remains accessible. A later explicit Build creates the new-version run through the shared To-Do restructure owner. Retry and building a later revision are different operations.

## What changed after the recovered checkpoint

The real available continuation was slice 5 plus a subsequent source-backed continuation, not the previously linked missing slice-9 ZIP. The recovered work was retained. New fail-before tests and repairs cover blank structured artifact rendering, unknown local stages, repeated schedule revisions, exact-version unavailable-embed re-export, safe-stop Build-label truth, stale stopped-revision authority after Resume, bound-Goal separation, revised-version To-Do admission/atomic rollback, and admission-epoch versus callback-epoch separation.

Plan, To-Do, Goal, Scheduling and Artifact owners retain their respective state. The local work adapter produces calculation outcomes and evidence; it does not write a private progress engine. No new production command IDs are minted. Existing handlers are concept/session-local adapters, not proof of native command registration or EventRecord emission.

## Rebuild and reproduce

From this concept directory:

```sh
python3 build.py
python3 tests/b17/run.py handlers --outdir /external/fresh-b17-handlers
python3 tests/b17/run.py surfaces --outdir /external/fresh-b17-surfaces
python3 tests/b17/run.py regressions --outdir /external/fresh-b17-regressions
python3 tests/b17/run.py record --outdir /external/fresh-b17-recordings
```

Use new output directories. Python Playwright and Chromium are required; the retained browser launchers use `/usr/bin/chromium`. Recordings also require Xvfb and ffmpeg. Tests use `set_content` to run the complete generated HTML, not screenshots or a rewritten test-only application. `tests/b17/diagnose.py --outdir /external/fresh-diagnosis` separately probes direct-content/file/HTTP loading without weakening browser policy.

Build delivery ZIPs with `tests/b17/package/build_packages.py` against the supplied B16 concept directory. Then test the actual ZIPs with `tests/b17/installer.py` and `tests/b17/package/check_cumulative.py`. Their external scratch repositories must not be committed or confused with delivered source.

The separate final verification report and delivery receipt contain executed results. This README is not a substitute for those receipts. Historical B01–B16 checkpoint files and B17 continuation notes are preserved history, not fresh passes for this build.

## Historical-test adaptations

The untouched original B01/B02 scripts remain in `tests/b10/qa`. B17's regression entry point creates an external corpus and applies only the two hash-pinned test adaptations in `tests/b17/legacy_current_contract.py`. `ADAPTATION.json` preserves original/adapted hashes and exact diffs. An unknown original hash refuses preparation. B01 now expects safe-stopped V1 to remain Building… with Paused secondary truth; B02 first proves approved-array immutability, then injects a detached corrupt binding so the original stale-draft and stale-dispatch refusals remain meaningful. No stale-state assertion is deleted.

The retained B15/B16 injected-fault drivers also assert immutable approved arrays before injecting a detached corrupt binding. B15's Goal-conflict Revise assertion is aligned with the same safe-stop rule. Raw failed historical runs are retained in separate evidence and are not rewritten to passing. The final regression reconciliation combines unchanged passing groups with complete, source-hash-bound reruns of the three affected scripts. It does not claim that the untouched historical suite passed verbatim.

Run the two adapted historical scripts alone with `python3 tests/b17/legacy_current_contract.py --outdir /external/fresh-b17-legacy`. This changes test expectations to the current owner, not the frozen runtime.

## Install safely

Extract the **guarded update** outside the repository. Its README explains default read-only preflight, explicit `--apply` with a new external backup, and rollback. Work in a trusted, quiescent isolated worktree. Unknown overlapping bytes or a missing required baseline refuse the entire preflight. There is no force-overwrite option. The installer does not run Git, stage, commit or push; a landing agent still needs current repository instructions and must review what to stage.

The cumulative ZIP is the full retained concept source/test corpus for rebuilding and continuation. It is not a whole-repository replacement. Absence from either archive is never a deletion instruction. All ten protected animation sources remain B16-byte-identical.

## Important limitations

- This is session-local browser behavior. There is no proof of durable restart, real-origin reload, cross-host continuation, provider execution or native Rust/Slint integration. The supplied browser policy refused file and localhost navigation; it was not disabled. Full HTTP Concept Hub integration and the official whole-Hub validator were not executed here. The added model-folder manifest is for integration, not a claim of full-Hub validation.
- The connector returned no readable `FinalGUISpec.md` body and rejected its raw-file fetch. Applicable current Plan, To-Do, Goal, Scheduling, Artifact, File Manager and command/wiring owner sections were read at the same pin. Complete Final GUI owner review remains an access limitation.
- Original full historical v3/v4 requirement wording is absent from this source transfer. `BATCH_17_COVERAGE.json` retains all 24 IDs and maps grouped current-owner clauses to bounded proof; it does not invent per-ID quotations or claim formal full-clause closure.
- Runtime `sha-demo` values are noncryptographic demo hashes; delivery SHA-256 values prove external byte custody, not production storage integrity.
- Revise is a local full-tree revision with a revision-note block, not an LLM rewriting arbitrary instructions. Local calculations are genuine but do not demonstrate replay safety for arbitrary filesystem/network side effects. Non-B17 adapters without a safe-stop outcome adapter may refuse revised-work replacement.
- Deep Plan's existing scoped ledger/PlanUnit presentation is retained; these two B17 demos are Regular Plans and do not establish new native Deep Plan provisioning or retention-GC proof.
- Mermaid is a retained static fallback, not a general Mermaid compiler. The interactive renderer is a bounded local table filter. Unknown renderers/origins are unavailable rather than silently trusted. The embedded image is labelled prior B16 reference; the two-second embedded video is fixture media, not verification evidence.
- The app opens an exact-version browser print document. The browser harness materializes that popup into PDF; the app does not claim it wrote the PDF to disk. Static fallbacks explicitly do not retain interactivity. Run history rows retain timestamped admission/failure events, not a production attempt event store.
- Installer evidence is Linux plus a portable Windows-reparse refusal shim, not native Windows/macOS execution. Whole-package crash atomicity and hostile filesystem/directory races remain outside the tested trusted-worktree boundary.
- Motion review is a named subset of consecutive frames plus representative full-resolution captures. A 60 fps encoder is not a guarantee of 60 fps UI rendering, and test-host load is not a native-device performance benchmark.
