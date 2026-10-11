# Colour schemes: sources and licences

Each scheme is read from its project's own official terminal port: Ghostty, kitty, Alacritty or Windows Terminal, in the
project's GitHub organisation, or the project's Xresources file (Solarized). Where the project ships no terminal port
(Everforest, Ayu Mirage), the value comes from the project's own colour source and the notes below say so. Every source
URL is pinned to a commit. The SHA-256 is of the exact file fetched with curl: the first 16 hex digits are in the table,
and the full value is in `<family>.json`. The full iTerm2-Color-Schemes collection is not bundled: it has no single
licence, and user import (T.SchemeImport) covers it.

`null` means the port does not set that colour. Nothing here invents a value; the runtime supplies its own fallback.

## Schemes

| Scheme | Appearance | Licence | Source (raw URL, pinned) | SHA-256 (first 16) |
|---|---|---|---|---|
| Catppuccin Latte | light | MIT | https://raw.githubusercontent.com/catppuccin/ghostty/b0b03ccee7ae8f16b13bd4fdfe267616defdb2b7/themes/catppuccin-latte.conf | `4be5760d759a90f0` |
| Catppuccin Frappé | dark | MIT | https://raw.githubusercontent.com/catppuccin/ghostty/b0b03ccee7ae8f16b13bd4fdfe267616defdb2b7/themes/catppuccin-frappe.conf | `fb090c112aaac0cc` |
| Catppuccin Macchiato | dark | MIT | https://raw.githubusercontent.com/catppuccin/ghostty/b0b03ccee7ae8f16b13bd4fdfe267616defdb2b7/themes/catppuccin-macchiato.conf | `b3c8cfbd5dc87250` |
| Catppuccin Mocha | dark | MIT | https://raw.githubusercontent.com/catppuccin/ghostty/b0b03ccee7ae8f16b13bd4fdfe267616defdb2b7/themes/catppuccin-mocha.conf | `fcdc0f045f68d7a8` |
| Tokyo Night Day | light | Apache-2.0 | https://raw.githubusercontent.com/folke/tokyonight.nvim/cdc07ac78467a233fd62c493de29a17e0cf2b2b6/extras/ghostty/tokyonight_day | `299cbfbe4442e5ee` |
| Tokyo Night Storm | dark | Apache-2.0 | https://raw.githubusercontent.com/folke/tokyonight.nvim/cdc07ac78467a233fd62c493de29a17e0cf2b2b6/extras/ghostty/tokyonight_storm | `0573784079bae89f` |
| Tokyo Night Night | dark | Apache-2.0 | https://raw.githubusercontent.com/folke/tokyonight.nvim/cdc07ac78467a233fd62c493de29a17e0cf2b2b6/extras/ghostty/tokyonight_night | `24ba9d48aa598db0` |
| One Half Light | light | MIT | https://raw.githubusercontent.com/sonph/onehalf/75eb2e97acd74660779fed8380989ee7891eec56/kitty/onehalf-light.conf | `d651149612f4948d` |
| One Half Dark | dark | MIT | https://raw.githubusercontent.com/sonph/onehalf/75eb2e97acd74660779fed8380989ee7891eec56/kitty/onehalf-dark.conf | `54dfb10334e02676` |
| Rosé Pine Dawn | light | MIT | https://raw.githubusercontent.com/rose-pine/ghostty/d8b4ec06e0cde80fb2bfbf59021ff0a332c77388/dist/rose-pine-dawn | `4b9d68bc9f5ed906` |
| Rosé Pine Moon | dark | MIT | https://raw.githubusercontent.com/rose-pine/ghostty/d8b4ec06e0cde80fb2bfbf59021ff0a332c77388/dist/rose-pine-moon | `09969baac980a7e1` |
| Rosé Pine Main | dark | MIT | https://raw.githubusercontent.com/rose-pine/ghostty/d8b4ec06e0cde80fb2bfbf59021ff0a332c77388/dist/rose-pine | `23075d6407b3e9f0` |
| Solarized Light | light | MIT | https://raw.githubusercontent.com/altercation/solarized/62f656a02f93c5190a8753159e34b385588d5ff3/xresources/solarized | `e08a83d94acc1380` |
| Solarized Dark | dark | MIT | https://raw.githubusercontent.com/altercation/solarized/62f656a02f93c5190a8753159e34b385588d5ff3/xresources/solarized | `e08a83d94acc1380` |
| Gruvbox Light | light | MIT | https://raw.githubusercontent.com/gruvbox-community/gruvbox-contrib/5bfe85a961d144376f9f9460f2b2a85343a0f0b3/kitty/gruvbox-light.conf | `e6fb1e5cf80b7040` |
| Gruvbox Dark | dark | MIT | https://raw.githubusercontent.com/gruvbox-community/gruvbox-contrib/5bfe85a961d144376f9f9460f2b2a85343a0f0b3/kitty/gruvbox-dark.conf | `4f15c259671d7e8a` |
| Dracula | dark | MIT | https://raw.githubusercontent.com/dracula/ghostty/b0e64590232331d9837c82cc1c5138e11ea39f76/dracula | `edc3e75c13daaeb3` |
| Nord | dark | MIT | https://raw.githubusercontent.com/nordtheme/alacritty/9949642f3903e8fcb62bfc03f09410e3d78440c2/src/nord.yaml | `7a26913d28f4c9b0` |
| Kanagawa Wave | dark | MIT | https://raw.githubusercontent.com/rebelot/kanagawa.nvim/bb85e4bfc8d89b0e62c8fa53ccdd13d12e2f77b3/extras/ghostty/kanagawa-wave | `f52da716fc190df8` |
| Kanagawa Lotus | light | MIT | https://raw.githubusercontent.com/rebelot/kanagawa.nvim/bb85e4bfc8d89b0e62c8fa53ccdd13d12e2f77b3/extras/ghostty/kanagawa-lotus | `522d21eabb45e6fc` |
| Everforest Light | light | MIT | https://raw.githubusercontent.com/sainnhe/everforest/85a86eb62409e3ec88713bff3d1b9d7374e112e4/autoload/everforest.vim | `4ddab3c8d96e2931` |
| Everforest Dark | dark | MIT | https://raw.githubusercontent.com/sainnhe/everforest/85a86eb62409e3ec88713bff3d1b9d7374e112e4/autoload/everforest.vim | `4ddab3c8d96e2931` |
| Flexoki Light | light | MIT | https://raw.githubusercontent.com/kepano/flexoki/8d723bac4a9ac46adfdf99d42155286977aac72a/kitty/flexoki_light.conf | `10c914e13591d500` |
| Flexoki Dark | dark | MIT | https://raw.githubusercontent.com/kepano/flexoki/8d723bac4a9ac46adfdf99d42155286977aac72a/kitty/flexoki_dark.conf | `8eeb0d3075093c7d` |
| GitHub Light | light | MIT | https://raw.githubusercontent.com/projekt0n/github-theme-contrib/a1c07099528be70b6273b13e2a19d5d2c3ce4661/themes/kitty/github_light.conf | `4ba0474329141972` |
| GitHub Dark | dark | MIT | https://raw.githubusercontent.com/projekt0n/github-theme-contrib/a1c07099528be70b6273b13e2a19d5d2c3ce4661/themes/kitty/github_dark.conf | `d67e35592228cf0b` |
| Ayu Mirage | dark | MIT | https://raw.githubusercontent.com/ayu-theme/vscode-ayu/d676974ebb245fa5a7ae4444027f72801017f1b6/ayu-mirage.json | `8ad0d5b3ea11c8bf` |

## Licences

Each `schemes/LICENSE-<slug>.txt` is the upstream licence file, copied byte for byte from the URL below.

| Family | Licence | Copyright line | Upstream licence file (pinned) | SHA-256 (first 16) |
|---|---|---|---|---|
| Catppuccin | MIT | Copyright (c) 2021 Catppuccin | https://raw.githubusercontent.com/catppuccin/ghostty/b0b03ccee7ae8f16b13bd4fdfe267616defdb2b7/LICENSE | `814096d2c34cc216` |
| Tokyo Night | Apache-2.0 | none in the licence text (null) | https://raw.githubusercontent.com/folke/tokyonight.nvim/cdc07ac78467a233fd62c493de29a17e0cf2b2b6/LICENSE | `c71d239df91726fc` |
| One Half | MIT | Copyright (c) 2019 Son A. Pham <sp@sonpham.me> | https://raw.githubusercontent.com/sonph/onehalf/75eb2e97acd74660779fed8380989ee7891eec56/LICENSE.txt | `bb4a23db094e79ed` |
| Rosé Pine | MIT | Copyright (c) Rosé Pine | https://raw.githubusercontent.com/rose-pine/ghostty/d8b4ec06e0cde80fb2bfbf59021ff0a332c77388/LICENSE | `b2ec9e48689252be` |
| Solarized | MIT | Copyright (c) 2011 Ethan Schoonover | https://raw.githubusercontent.com/altercation/solarized/62f656a02f93c5190a8753159e34b385588d5ff3/LICENSE | `494aefdabf86acce` |
| Gruvbox | MIT (upstream README: MIT/X11; text is the standard MIT licence) | Copyright (c) 2018 Pavel Pertsev | https://raw.githubusercontent.com/gruvbox-community/gruvbox/180ad85971343df68be3422a5630fa84e45a9ab2/LICENSE.md | `6d3c2ebc79cb645d` |
| Dracula | MIT | Copyright (c) 2023 Dracula Theme | https://raw.githubusercontent.com/dracula/ghostty/b0e64590232331d9837c82cc1c5138e11ea39f76/LICENSE | `2d58b85d277b33f4` |
| Nord | MIT | Copyright (c) 2016-present Sven Greb <development@svengreb.de> (https://www.svengreb.de) | https://raw.githubusercontent.com/nordtheme/alacritty/9949642f3903e8fcb62bfc03f09410e3d78440c2/license | `25ac8188d670bd2a` |
| Kanagawa | MIT | Copyright (c) 2021 Tommaso Laurenzi | https://raw.githubusercontent.com/rebelot/kanagawa.nvim/bb85e4bfc8d89b0e62c8fa53ccdd13d12e2f77b3/LICENSE | `dfce81e2e5bf5b5b` |
| Everforest | MIT | Copyright (c) 2019 sainnhe | https://raw.githubusercontent.com/sainnhe/everforest/85a86eb62409e3ec88713bff3d1b9d7374e112e4/LICENSE | `6504b9e62794cb58` |
| Flexoki | MIT | Copyright (c) 2023 Steph Ango | https://raw.githubusercontent.com/kepano/flexoki/8d723bac4a9ac46adfdf99d42155286977aac72a/LICENSE | `b0aeda2f9ebf5e09` |
| GitHub | MIT | Copyright (c) 2022 projekt0n̅ | https://raw.githubusercontent.com/projekt0n/github-theme-contrib/a1c07099528be70b6273b13e2a19d5d2c3ce4661/LICENSE | `f9ed4263a317570a` |
| Ayu | MIT | Copyright (c) 2016 Ike Kurghinyan | https://raw.githubusercontent.com/ayu-theme/vscode-ayu/d676974ebb245fa5a7ae4444027f72801017f1b6/LICENSE | `b2c797d3cd2f1c96` |

## Notes on individual sources

- **Catppuccin, Tokyo Night, Rosé Pine, Dracula, Kanagawa.** Ghostty theme files from each project's organisation.
- **One Half.** kitty files from sonph/onehalf. The ports in that repository disagree with each other, and the kitty values are used as read: light green is `#40a14f` here but `#50a14f` in the xfce4-terminal, gnome-terminal and mintty ports and in the Windows Terminal port; light bright black is `#383a42` here but `#4f525e` in the xfce4-terminal port; dark bright black is `#5d677a` here but `#282c34` in the xfce4-terminal and Windows Terminal ports. These ports set no cursor colour (null).
- **Solarized.** The 16 colours are the canonical values in `xresources/solarized`. That file has no selection or cursor-text colours (null). The light scheme applies the file's own commented "Light" block (base03 = `#fdf6e3`, base02 = `#eee8d5`, and so on), so light colour 0 is `#eee8d5` and colour 7 is `#073642`.
- **Gruvbox.** Medium contrast. The ports are the kitty files in gruvbox-community/gruvbox-contrib, the ports repository that the morhetz/gruvbox README names. morhetz/gruvbox-contrib (the original, same organisation) has no kitty files; gruvbox-community/gruvbox-contrib is its fork and has them. morhetz/gruvbox has no LICENSE file, so the licence is taken from gruvbox-community/gruvbox. Cross-check against morhetz/gruvbox `colors/gruvbox.vim` (Neovim terminal mapping): slots 1 to 14 match in both variants; slots 0 and 15 differ. Dark: port 0 `#3c3836` and 15 `#fbf1c7`, Vim 0 `#282828` (bg0) and 15 `#ebdbb2` (fg1). Light: port 0 `#ebdbb2` and 15 `#282828`, Vim 0 `#fbf1c7` and 15 `#3c3836`.
- **Nord.** The selection text is `CellForeground` in the port (each cell keeps its own colour), so `selectionForeground` is null.
- **Everforest.** sainnhe/everforest ships no terminal port. Values come from the medium palettes in `autoload/everforest.vim` (source column, sha above) and the Terminal mapping in `colors/everforest.vim` (SHA-256 `77c27d92c190b9dc...`). Background is bg0, foreground is fg, selection background is the Visual highlight (bg_visual), and the 16 colours follow the Terminal mapping, which repeats the normal colours in slots 8 to 15. The theme sets no cursor colour (reverse video), so cursor, cursorText and selectionForeground are null.
- **GitHub.** The default variants (`github_dark`, `github_light`) from projekt0n/github-theme-contrib kitty ports. The ports set no selection colours (null). cursorText is the port's keyword `cursor_text_color background`, resolved to the background colour. The dark background `#30363d` is the port's own value: github-theme-contrib sets the dark canvas to Primer gray-6. The same org's primitives for dark put the page background at gray-9, `#0d1117`. Check this before the scheme ships.
- **Ayu Mirage.** No Ghostty, kitty, Alacritty or Windows Terminal port exists in the ayu-theme organisation. The colours are the `terminal.*` values in ayu-theme/vscode-ayu `ayu-mirage.json`, the only explicit terminal colour set there. That file sets no cursor or selection colour (null). ayu-theme/ayu-colors `themes/mirage.yaml` has a terminal section that needs the project's generator to resolve (OKLab expressions), and its black (`0A0000`) differs from the VS Code value (`#171b24`). Not used. The copyright line is vscode-ayu's LICENSE; ayu-colors' LICENSE is also MIT (Konstantin Pschera).
- **Tokyo Night.** Apache-2.0. The licence text has no copyright line, so `copyright` is null.

