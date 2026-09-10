# Batch 11 — ELI5 explanation preferences

Open `PM_Chat_Assistant_5.6_Pro_Standalone.html` and select **Demo Studio → Guided ELI5 workflows**.

## Installation: merge, never mirror

Merge this package's `Concepts` directory into the repository root and replace only the supplied files. Replace the supplied root `REPLACEMENT_MANIFEST.json`. Do not nest a second Concepts directory. **Never delete any repository file because it is absent from this archive or manifest.** The manifest is a delivery inventory, not a complete repository inventory. TestPMConcept, other prototype pages, onboarding, Settings, Plans and governance are excluded and must remain unchanged.

## Two workflows

**One conversation, simpler replies.** A project defaults to Off. Enable ELI5 only in its primary conversation, send the example question through the normal composer, and compare the sibling's standard reply. Returning to the primary keeps its reply, clears its sent composer draft, and opens the matching evidence tab. Inspect the exact expression and existing Plan; neither changes or starts work. Replay creates fresh demonstration identities while retaining the completed conversations.

**Return to the shared default.** A project defaults to On while its primary conversation explicitly selects Off. Send a question, then select Use default. Only the next reply becomes simpler. Let the project inherit application Off and send another question. Historical replies keep their original wording and captured preference. Code, existing Plan and artifact contents and identifiers remain unchanged.

The effective precedence is conversation override → project default → application default. Use default removes an override; it does not copy the current default into a new override. Defaults follow later changes only where they are inherited.

## Evidence and limits

These are **session-only preferences and supplied example replies**, not live model generation, durable Settings persistence, arbitrary semantic simplification, or native-runtime proof. The example's JavaScript expression is actually evaluated; its explanatory answer variants are authored fixtures. ELI5 does not select the Teacher Persona, change the model/runtime mode, or rewrite historical answers or work products.

The captured traces, test assertions, full hashes, per-frame acquisition timestamps, actual review notes and open performance limitations are recorded in the accompanying report/evidence bundle and `BATCH_11_CHECKPOINT.json`. Build checks do not substitute for functional or motion evidence. Earlier batch checkpoint files retain historical identities and are not fresh proof for changed HTML bytes.

## Reproduce

Dependencies are not automatically installed. This Linux QA launcher expects Python with Playwright and Pillow, Chromium at `/usr/bin/chromium`, and FFmpeg/ffprobe/Xvfb for recordings. It tests a copied concept and refuses an output directory inside the source tree.

```bash
python3 build.py --check
python3 tests/b11/run.py verify --outdir /tmp/pm-b11-verify
python3 tests/b11/run.py regressions --outdir /tmp/pm-b11-regression
python3 tests/b11/run.py record-override --outdir /tmp/pm-b11-media
python3 tests/b11/run.py record-inherit --outdir /tmp/pm-b11-media
python3 tests/b11/run.py timing-override --outdir /tmp/pm-b11-media
python3 tests/b11/run.py timing-inherit --outdir /tmp/pm-b11-media
python3 tests/b11/run.py frames --outdir /tmp/pm-b11-media
```

Recording acquisition targets 60 Hz and preserves actual timestamps; no frame interpolation or constant-rate duplication is applied. The `frames` operation decodes every frame and produces indexed sheets, but starts with review flags false. Newly generated recordings require fresh visual review. Browser frame callbacks and encoded frame counts do not establish fresh painting at every sample.

The restricted test environment blocks direct file navigation before application load. Test harnesses load the complete frozen HTML with `set_content`; opening the file directly on an unrestricted desktop remains a separate check.

## Continue

The next bounded checkpoint is **Batch 12 — Back Seat Driver**. See `DEMO_REMAINING_WORKLIST.json` for the 18-batch planning estimate after Batch 11, its exact source-row mapping and remaining proof obligations. This is a concept worklist, not an executable production WorkNode/Goal queue. No full APR-016/018, governance, native-runtime or whole-repository closure is asserted.
