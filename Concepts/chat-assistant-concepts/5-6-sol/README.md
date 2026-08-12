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
- `data/` contains the supplied baseline fixture plus 5.6 Sol extensions.
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
http://127.0.0.1:<printed-port>/Concepts/chat-assistant-concepts/5-6-sol/

SOL_BROWSER=chromium \
SOL_REPORT_PATH=/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/evidence/browser-acceptance-chromium.json \
SOL_SCREENSHOT_DIR=/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/evidence/chromium-frames \
node /mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/tests/browser-acceptance.mjs \
file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol/

python3 /mnt/Cursor/PuppetMaster/Concepts/ConceptHub/validate.py /mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5-6-sol
```

Firefox runs through isolated geckodriver over loopback HTTP. Chromium runs through an isolated Chrome DevTools Protocol session against the same checked-in concept using a `file:` URL because this host's Chromium renderer fails before requesting even a trivial loopback page. The narrow `file:` loader in `shared/state.js` uses local XHR only for the same four checked-in JSON fixtures; HTTP continues to use `fetch`. The two engine receipts remain separate, and `evidence/browser-acceptance.json` summarizes them without disguising the transport difference.

Review `evidence/contact-sheet.html` and `evidence/direct-visual-inspection.json` for the 55-frame canonical visual record. Every canonical Firefox frame received direct original-resolution inspection; 12 representative Chromium frames received a separate parity spot-check. The 512 baseline and 896 feature-state matrices are automated geometry/state coverage, not individually human-reviewed images. The selected feature-matrix host is coverage-only and is not a winner recommendation.
