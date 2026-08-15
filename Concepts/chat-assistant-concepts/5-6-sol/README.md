# Puppet Master Assistant Chat — 5.6 Sol

This folder is the sole authored workspace for the 5.6 Sol Assistant Chat creative bakeoff entry.

Authority and scope:

- The attached creative packet and current user instructions govern this concept family.
- `Plans/**` remains canonical product truth; this folder records provisional impact only.
- PMConcept7 and ConceptHub are read-only functional evidence.
- No other Assistant Chat model folder may be inspected or used as inspiration.
- Every concept page visibly carries `data-concept-model="5.6 Sol"`.

Architecture:

- `index.html` is the comparison workspace.
- `window-01.html` through `window-08.html` isolate the eight window concepts.
- `thread-01.html` through `thread-08.html` isolate the eight thread concepts.
- `shared/` owns semantic state, host contracts, primitive interaction utilities, themes, and the deterministic demo controller.
- `windows/` and `threads/` own concept-specific composition and motion.
- `data/` contains six checked-in fixture inputs: the supplied baseline and matrix, the deep extension and legacy scenario, and exact local copies of the correction packet's Revision-2 scenario and trigger contracts.
- The required root reports record provisional integration impact; `evidence/` contains browser receipts, curated frames, and the contact sheet.

The concept pages are functional prototypes. They do not implement or claim production runtime ownership.

## Run and verify

Serve the repository root, then open `index.html` through that server. The comparison selectors independently choose any window and thread concept, so all 64 same-model pairings are available without reloading.

```text
python3 -m http.server 0 --bind 127.0.0.1 --directory /mnt/Cursor/PuppetMaster

SOL_BROWSER=firefox \
SOL_REPORT_PATH=/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/evidence/browser-acceptance-firefox.json \
SOL_SCREENSHOT_DIR=/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/evidence/frames \
node /mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/tests/browser-acceptance.mjs \
http://127.0.0.1:<printed-port>/Concepts/chat-assistant-concepts/5-6-sol/index.html

SOL_BROWSER=chromium \
SOL_REPORT_PATH=/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/evidence/browser-acceptance-chromium.json \
SOL_SCREENSHOT_DIR=/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/evidence/chromium-frames \
node /mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/tests/browser-acceptance.mjs \
file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/index.html

SOL_BROWSER=chromium \
SOL_CHECK_NAME='all entry pages boot with exact model label' \
SOL_REPORT_PATH=/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/evidence/browser-acceptance-chromium-http.json \
SOL_SCREENSHOT_DIR=/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/evidence/chromium-http-frames \
node /mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/tests/browser-acceptance.mjs \
http://127.0.0.1:<printed-port>/Concepts/chat-assistant-concepts/5-6-sol/index.html

python3 /mnt/Cursor/PuppetMaster/Concepts/ConceptHub/validate.py /mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol
```

Firefox runs through isolated geckodriver over loopback HTTP. Chromium runs through an isolated Chrome DevTools Protocol session from the checked-in `file:` entry and reads only the same six checked-in JSON fixtures through the narrow file-only XHR loader. Both complete lanes passed the same 33-check suite with 115 captures, zero console errors, and zero runtime exceptions. The separate Chromium loopback-HTTP boot probe timed out before fixture readiness and is recorded as 0/1; Chromium-over-HTTP is not claimed. All three raw receipts remain separate, and `evidence/browser-acceptance.json` summarizes without flattening the failed diagnostic into the passing complete-lane aggregate.

Review `evidence/contact-sheet.html` and `evidence/direct-visual-inspection.json` for the visual record. Every one of the 115 current canonical Firefox PNGs received one-at-a-time original-resolution inspection. The 512 baseline, 896 feature-state, 432 continuous-resize, and other large matrices remain automated geometry/state coverage rather than individual human image reviews. The current Chromium captures were not added to the direct-inspection count. The selected feature-matrix host is coverage-only and is not a winner recommendation.

## Slint boundary

This workspace contains working HTML, CSS, and JavaScript prototype code only. Its state partitioning, stable IDs, causal motion markers, final-state reduced motion, and geometry contracts are intended as Slint 1.17.1 translation guidance. “Slint-portable” does not mean native Slint: this is not Slint source, a compiled Slint component, a drop-in port, or production runtime evidence.
