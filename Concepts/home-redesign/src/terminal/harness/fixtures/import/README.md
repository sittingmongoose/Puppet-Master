# Colour-scheme import fixtures

Inputs for `harness/tests/import.test.mjs`, which tests `js/44-import.js` (`T.SchemeImport`, D15 "import of common
theme formats"). `expected.json` holds the result each file must give. It was written by hand from the colour values
below, not produced by running the parser.

## Licence of the colour values

Every well-formed fixture uses the canonical **Solarized** palette by Ethan Schoonover
(<https://ethanschoonover.com/solarized/>), MIT licence, Copyright (c) 2011 Ethan Schoonover. The files themselves
were written for this concept in each format's syntax. No third-party theme file was copied. The base16 and base24
fixtures use the slot assignment of the base16 "Solarized Dark" and "Solarized Light" schemes (aramisgithub, base16
schemes collection, MIT). The base24 extra slots (`base10`-`base17`) were chosen for this fixture from the same
Solarized values. The edge-case files `edge-wt-short-hex.json` and `edge-x11-colour-syntax.Xresources` use plain
values written for these tests.

Solarized terminal mapping used by the ANSI fixtures (the Solarized README's terminal table):

| ANSI | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| normal | base02 `#073642` | red `#dc322f` | green `#859900` | yellow `#b58900` | blue `#268bd2` | magenta `#d33682` | cyan `#2aa198` | base2 `#eee8d5` |
| bright | base03 `#002b36` | orange `#cb4b16` | base01 `#586e75` | base00 `#657b83` | base0 `#839496` | violet `#6c71c4` | base1 `#93a1a1` | base3 `#fdf6e3` |

Dark: background `#002b36`, foreground `#839496`, cursor `#93a1a1`, cursor text `#002b36`, selection `#073642` on
`#93a1a1`. Light: background `#fdf6e3`, foreground `#657b83`, cursor `#586e75`, cursor text `#fdf6e3`, selection
`#eee8d5` on `#586e75`.

## Files

| File | Format | What it covers |
| --- | --- | --- |
| `solarized-dark.itermcolors` | iTerm2 | sRGB colour space, alpha 1, unknown keys (`Link Color`, `<true/>`), XML comment |
| `solarized-light-p3.itermcolors` | iTerm2 | `P3` colour space (read as sRGB, warning), CRLF |
| `solarized-dark.json` | Windows Terminal | one scheme object, uppercase hex |
| `settings.json` | Windows Terminal | settings.json with BOM, CRLF, `//` and block comments, trailing commas, three schemes (first imported, the others named in a warning, one with markup in its name) |
| `solarized-dark.conf` | kitty | `## name:` header, `#` comments, mixed-case hex, unknown keys |
| `solarized-light.conf` | kitty | CRLF, `selection_foreground none` |
| `ghostty-solarized-dark` | Ghostty | no extension (detected by content), bare and quoted values, `palette = N=#hex` |
| `alacritty-solarized-dark.toml` | Alacritty TOML | `0x` hex, inline table, `[general]` with an array, `[[hints.enabled]]`, trailing comments |
| `alacritty-solarized-light.yml` | Alacritty legacy YAML | quoted `#` and `0x` hex, `CellForeground` |
| `base16-solarized-dark.yaml` | base16 | legacy flat form, bare hex |
| `base16-solarized-light.yaml` | base16 | tinted-theming form (`palette:`), BOM, `---`, comments |
| `base24-solarized-dark.yaml` | base24 | base24 bright mapping (`base12`-`base17`) |
| `solarized-dark.Xresources` | Xresources | `#define` macros, `*` and `URxvt` prefixes, `!` comments, an ignored `Emacs.` resource |
| `solarized-light.Xresources` | Xresources | `XTerm*vt100.` prefix, `rgb:` values, CRLF |
| `edge-kitty-missing-brights.conf` | kitty | ANSI 8-15 missing (normal colours reused, warning) |
| `edge-ghostty-missing-palette` | Ghostty | ANSI 3 missing (xterm default, warning) |
| `edge-wt-short-hex.json` | Windows Terminal | 3-digit hex (`#f80` is `#ff8800`) |
| `edge-x11-colour-syntax.Xresources` | Xresources | X11 `#rgb` (high nibble: `#123` is `#102030`), `#rrrgggbbb`, `#rrrrggggbbbb`, `rgb:h/hh/hhh/hhhh` scaling |
| `malformed-truncated.itermcolors` | iTerm2 | cut off mid-file: `syntax` |
| `malformed-unclosed-tag.itermcolors` | iTerm2 | mismatched tags: `syntax` |
| `malformed-binary.itermcolors` | - | NUL bytes: `binary` |
| `malformed-bad.json` | Windows Terminal | missing brace: `syntax` |
| `malformed-invalid-colours.json` | Windows Terminal | script and URL text as colours: `required` (and no input echoed) |
| `malformed-unterminated.toml` | Alacritty | unterminated string: `syntax` |
| `malformed-tab-indent.yaml` | base16 | tab indentation: `syntax` |
| `malformed-no-colours.txt` | - | prose: `format` |
| `malformed-comments-only.conf` | kitty | only comments: `nocolours` |
