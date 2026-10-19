# Live PM7 shell sources

Edit these files to change the shell. `tools/base_source.py` inserts the raw block bodies
into `shell.html`, in `manifest.json` order, without normalizing whitespace or line endings.
Style/script files contain only their block body; the skeleton owns their tags and markup.
Keep files UTF-8 with LF. Add a block's unique slot and manifest entry together.
`src/` and the feature packages still own their authored layers.

The one-time `tools/split_base.py --out <new-folder>` split reproduced the historical
`Concepts/Onboarding concepts/TestPMConcept.html` exactly: 7,444,795 bytes, SHA-256
`b3888fad4993f484ab4548e9ff212ec0042fa0a912947a7f316514db939326be`.
That page and pm7-tools/pm6-build are history; never regenerate this source tree from them.
This hash records the one-time split, not a frozen live input. The shell now includes folded
build edits. Removed legacy block files remain listed in `retired_blocks` for history; they
are not assembled. The four generator checks below are the ongoing publication guard.

Verify edits with `build_d_css.py --check`, `build.py --check`, `build_home.py --check`,
and `build_rail.py --check` in their respective tools folders. Never hand-edit generated pages.

## Windows source bytes

Use `git config --worktree core.autocrlf input` (or `false`; enable
`extensions.worktreeConfig` first). Existing CRLF files must be rematerialized as LF;
the approved helper is `python //TRUENAS/Cursor/share/puppet-master/2026-10-17-nas1-evacuation/lf-rematerialize.py`
on a clean checkout. The assembler refuses a literal CR, invalid UTF-8, or a UTF-8 BOM,
names the affected path, and never normalizes the input.

Eight bodies deliberately have no final LF. Preserve their EOF exactly; disable editor
"insert final newline" for those files. Neither the assembler nor the splitter adds one.

## Edit locations after Q18

- `shell.html`: shell markup, O55 body slot, wizard/orchestrator wrappers and surface attributes.
- `script/script-001.js`: first paint. Its project selection, Settings key, onboarding key,
  NieR parts and ground colors must agree with shell markup and `src/settings` when edited.
- `script/pm4-settings-js.js`: Settings engine outside the replaceable T50 bands. The band after
  `PM51_SETTINGS_REFRESH` and the provider/forge/event/sound fixture bands are replaced by the
  Settings fork; edit `src/settings/` for their live implementation.
- Other `script/` and `style/` files: the named shell blocks. The manifest also inserts the live
  `tools/motion_finish.js` directly, without duplicating that authored source.
- Doctor quiet actions: `src/settings/managers/55-doctor.js` (Settings step 0 owns this output).

The unconditional patches from `build.py`, `shell_motion.py` and `wizorch_layer.py` are folded.
The latter two tools and the four retired onboarding/tour block files remain historical only.
Use `python scripts/pm7-where.py '<snippet>'` to find the live source, then the four checks above.
The retired PM8 hover engine is removed; its shared pointermove dispatcher and live page-motion rules remain.

## Historical inline patch names

Published source comments retain the old patch names to preserve page bytes. Those names are
historical references, not current edit locations. Paths below are relative to this `base/` folder.

| Old inline name | Live implementation |
|---|---|
| `SETTINGS_EXPOSE` | `script/pm4-settings-js.js`: Settings transfer/staging bridge |
| `THEME_PREVIEW_PATCHES` | `script/pm4-settings-js.js`: `PM7_SETTINGS_TOME.applyPaint` |
| `first_paint_patches` | `script/script-001.js`: opening Project look, NieR and boot cover |
| `wizorch_layer.py` | `script/pm7-t46-systems-js.js`: scope loop; `script/pm6-js-orchestrator.js`: node chips; `shell.html`: wrappers and surface attributes |
| `shell_motion.py` | `script/pm6-js-globals.js`: pages; `script/pm-hover-tags-js.js`: tags/census; `script/pm7-t23-shell-adjustments.js`: status bar; `style/pm6-css-global.css`: motion styles |

Other folded motion groups live in `script/pm6-js-chat.js`, `script/pm6-js-panels.js`,
`script/script-020.js` and `script/script-038.js`. Use `scripts/pm7-where.py '<snippet>'`
from the repository root to locate the exact live block. Update the emitted historical comments
only in a later change that permits different published bytes.
