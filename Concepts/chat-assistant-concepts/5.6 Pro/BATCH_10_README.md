# Batch 10 — Revert Last Agent Edit

Start **Demo Studio → Guided Revert workflows**. Choose **Undo one complete agent turn** or **Protect a later user edit**. Both begin before an edit; the explicitly labeled example action actually changes an isolated, in-memory text workspace.

The ordinary feature is available from the changed-response card, its message overflow menu, the file document, and **Wand → Workflows → Revert Last Agent Edit**. Close the guide to use those product actions independently.

## Whole-turn reversal

The example agent modifies `src/checkout.js`, creates `src/checkout-label.js`, and deletes `src/legacy-label.js`. An unrelated user note remains outside the manifest. Preview shows all three inverse operations without writing. Cancel invalidates its confirmation token without changing files. A new confirmation rechecks all paths, exact text, absence/existence, and revisions; a single staged map replacement reverses the complete turn and checks the result. The conversation is not rewound or deleted.

## Protect a later edit

Open the initially valid preview, then use the gallery-labeled **Simulate later user edit** control. It really changes the currency comment from USD to EUR after preview. Confirm refuses the entire reversal: no partial file changes and no destructive force option. Check again shows the exact current conflict. **Keep current files** closes the attempt as `kept`, not `reverted`. Both flows retain inspectable decision history, export their actual JSON record, and Replay into a fresh workspace.

## Owner and proof boundary

`revert-protocol.js` owns private workspaces, before/after manifests, preview tokens, and receipts. It exposes a local `cmd.chat.revert` dispatcher. Existing Revert action IDs delegate to this owner; the old flag-only scripted gallery seed cannot mint a completed reversal. `revert-demo-batch10.js` only sets up examples, drives labeled example actions, and projects the owner state. Public getters return defensive copies. Old feature-state projections are not mutation authority.

The implementation rejects stale/canceled preview tokens, cross-scope actions, changed worktrees, resets, newer agent turns, and no-file turns. A repeated confirmation returns its prior receipt without repeating the inverse. Per-path revisions detect a later edit even when the text is subsequently changed back. Unrelated edits are preserved. Current file state is distinguished from the historical verified receipt after subsequent edits.

This is **local text-workspace behavior**, not a native FileSafe adapter or production command bus. Atomicity means one synchronous in-memory map replacement, not disk atomicity. Binary files, symlinks, file modes, native rename transactions, real repository writes, providers, crash recovery, and persistent reload are not implemented. Export is a real local JSON download, not a live share service. No auto-merge, partial undo, or force overwrite is provided.

## Rebuild and repeat the checks

```sh
python build.py
python build.py --check
python tests/b10/run.py verify --outdir /tmp/pm-b10-verify
python tests/b10/run.py regressions --outdir /tmp/pm-b10-regressions
python tests/b10/run.py record-whole --outdir /tmp/pm-b10-media
python tests/b10/run.py record-conflict --outdir /tmp/pm-b10-media
python tests/b10/run.py timing-whole --outdir /tmp/pm-b10-media
python tests/b10/run.py timing-conflict --outdir /tmp/pm-b10-media
python tests/b10/run.py frames --outdir /tmp/pm-b10-media
```

The QA scripts were exercised on Linux with Python Playwright, Chromium at `/usr/bin/chromium`, Pillow, FFmpeg/ffprobe, and Xvfb. The launcher does not install anything. Functional regressions can run concurrently; recording and timing comparisons must run without the regression browsers. Newly generated contact-sheet flags remain false until someone actually inspects those new images.

## Scope and evidence

This is cumulative Batches 1–10, based on the delivered Batch 9 ZIP rather than replacing it with an older repository HTML. Both generated HTML files must remain byte-identical. The reference-layout rollback and ten protected animation sources are preserved. TestPMConcept, Settings, onboarding, Plans, and governance are outside this replacement.

`BATCH_10_CHECKPOINT.json` records the executed totals, exact source hash, review extent, and open findings. `BATCH_10_COVERAGE_DELTA.json` covers only the bounded Revert row. Historical batch reports remain historical evidence; they are not current whole-product acceptance. The full feature/demo campaign, native implementation, arbitrary mid-scroll Activity-pill occlusion, and general motion/performance acceptance remain open.

## Navigation-test environment limitation

The test browser blocked both direct `file://` and loopback HTTP navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`, before the application loaded. Those launch checks are **not passes**. Functional tests and recordings loaded the complete, hash-pinned standalone using browser `set_content`; no browser policy was changed or bypassed. Direct navigation on the user’s browser remains unverified by this checkpoint.
