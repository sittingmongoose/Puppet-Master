# Puppet Master Assistant — Batch 16

This is the cumulative standalone HTML concept, retaining Batch 1–15 modules and tests. The Batch 16 delivery receipt and verification report define the final verification status; an implementation checkpoint alone does not.

## Open and exercise

Open `PM_Chat_Assistant_5.6_Pro_Standalone.html`. In Demo Studio, choose **To-Do graphs & progress · Batch 16**. Send the prepared request using the ordinary composer; dismiss the instructions. Use the existing Plan Build or Build as Goal, To-Do Activity, workspace, export and Goal controls.

**Parallel outputs** creates a CSV and customer summary from one supplied input, allows both leaves in progress, completes the later-listed summary first, and validates the files independently. **Refine a list** pauses a Plan-as-Goal, rebinds the active CSV item without changing its admitted work, exports unchanged Markdown during execution, then resumes. **Large hierarchy** preserves 50 parent groups and 5,000 leaves through virtualization, search and expand/collapse; only the final lookup executes.

Working activity remains Orbit by default. Demo Studio offers the existing **Step Rail Simple** preference. None of the protected animation files is replaced.

## Rebuild and tests

Edit modules, not generated HTML. Run `python3 build.py`. Both generated outputs must be identical. `--check` is a convenience; the delivery also tests deleting both outputs and comparing full raw bytes after rebuilding an actual extracted cumulative ZIP.

Prerequisites: Python 3, Node, Python Playwright and Chromium (`/usr/bin/chromium` in the retained Linux runners). Recording additionally uses Xvfb and FFmpeg/ffprobe. Nothing auto-installs.

```
python3 tests/b16/run.py core --outdir /outside/repo/b16-core
python3 tests/b16/run.py surfaces --outdir /outside/repo/b16-surfaces
python3 tests/b16/run.py regressions --outdir /outside/repo/b1-b15
python3 tests/b16/run.py record --outdir /outside/repo/b16-recordings
python3 tests/b16/installer.py --zip /path/pm-b16-guarded-update.zip --baseline /path/B15-source-root --outdir /outside/repo/installer-check
```

Use a fresh output directory for each attempt. Tests record failures and exact HTML hashes; stale attempts are not final evidence. Some older cumulative QA files were present in the supplied Batch 15 ZIP but absent from the pinned GitHub test tree. The cumulative source archive retains them.

Normal file navigation was blocked by this test environment; the complete generated HTML was loaded with `set_content`. This does not prove file-origin reload, durable restart or cross-host behavior. The actual exported HTML remains standalone; no test-driver code is embedded in it.

Frame decoding: `python3 tests/b16/frames.py --recordings /outside/recordings --outdir /outside/frames`. This produces evidence, not an automatic visual-review pass. Package tools are in `tests/b16/package/`; `check_cumulative.py` verifies the actual ZIP, deletes both extracted HTML files and raw-byte checks their clean rebuild.
