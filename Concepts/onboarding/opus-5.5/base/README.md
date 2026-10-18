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
