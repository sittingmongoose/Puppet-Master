# Terminal tab kind: rules and numbers for canon (D11-D20)

From the terminal concept build (branch `concept/home-terminal-20261009`). Written for the Plans thread. Every number
here is what the concept does; "measured" means it was measured on the machine named, never estimated. Where canon
needs a number the concept cannot measure (native throughput), the target from `research-terminal-engines-ide.md` E3 is
given and labelled "target". Section numbers are stable; later installments add to them.

## 1. Chrome (D11, D12)

| Rule | Value |
|---|---|
| Sessions | One session per tab. Split makes a new panel beside this one with the same folder and shell profile (`cmd.workspace_layout.split` with `{kind: 'terminal', profile, cwd}`, direction `auto`; More menu adds "Split down"). |
| Header row | The host's shared row (CONTRACT.md section 5): 30 px tall, 24 px targets, 12 px text (11 px secondary facts), labels at body width 520 px or more, icons with hover tags below, hidden below 150 px body height. No terminal-specific thresholds. |
| Header row content | Left: folder (monospace, `~` for home), branch (when the folder is in a repository), the running command and its elapsed time `m:ss` (only while a command runs; the command is cut at 48 characters with an ellipsis, full text in the hover tag). Right: Find, Split, Maximize (Restore when maximized), More. |
| Tab label | `<process> · <folder>`: the foreground program, else `ssh` inside an SSH session, else the shell name; folder is the last path component. A failed last command adds its exit code (host mark); an agent-driven terminal shows the agent's square mark; a running process sets `busy`. Hover tag: label, "(ended)" when the session ended, "· <agent> is driving". |
| No bottom bar | Nothing below the screen. |
| No internal ids | Session ids, nonces and tab ids never appear as text. |
| Session ended | An inline row: "Session ended" (with "with exit code N" when non-zero), Restart, Close tab. The screen dims to 72 % opacity. Enter in the ended terminal restarts it. |
| Restored after reload | A restored tab gets a new session and says so ("This terminal was restored. Its earlier session ended when the page reloaded; this is a new session."). Never a fake live PTY (F3-226, F3-228). |
| Closing a running terminal | `canClose` shows an inline row: "Close this terminal? <process> is still running and will be stopped." Close terminal / Keep it open. |
| Notices | Inline rows above the screen, never modals: 30 px minimum height, 12 px text, 24 px text buttons, no side stripes. Warning tone is a tinted surface. |
| Gutter | 20 px wide (18 px when the body is under 400 px wide), one glyph per prompt line, never a stripe. Glyph 12 px; hit target 20 x 24 px. |
| Scrollbar | 14 px wide (10 px under 400 px), the editor minimap's language: a viewport box (2 px radius, 1 px border), command marks as short heat strips (55 % width, neutral), failed commands as full-width strips in the failure colour, find matches as 45 % strips in the search colour, the current match in the link colour. Marks widen on hover. |
| Sticky command header | When the top of the view is inside a command's output, a one-line header shows that command's prompt line and its state (Running, Exit 0, Exit N); clicking it jumps to the command. Height: one cell + 8 px. Hidden below 150 px body height and in the alternate screen. |

## 2. More menu (exact items, in order)

New terminal ▸ (zsh, bash, pwsh, ssh devbox) · Split down · — · Appearance... · Text size ▸ (Bigger, Smaller, Reset) ·
— · Copy mode · Quick select · Select all · Clear · Clear scrollback · Plain-text buffer · — · Agent input ▸ (Ask each
time; one row per agent allowed here, each revokes) · Send signal ▸ (Interrupt SIGINT, Terminate SIGTERM, Kill
SIGKILL) · Restart session.

Context menu on the screen (right click; Shift+right click when a program reports the mouse): Open in editor / Open
link and Copy path / Copy link (on a link) · Copy · Paste · Select all · Find · Clear.

Command-mark menu (click a gutter glyph): a header row with the command, its state, duration and who typed it ("You
typed this", "Builder typed this") · Copy command · Copy output · Rerun · Insert command (without Enter) · Open output
in an editor tab · Select output.

## 3. Keyboard (terminal-scoped; macOS in brackets)

| Action | Keys |
|---|---|
| Find | Ctrl+Shift+F (Cmd+F). In the bar: Enter previous (upward), Shift+Enter next, Alt+C case, Alt+W whole word, Alt+R regex, Esc closes |
| Copy / Paste | Ctrl+Shift+C / Ctrl+Shift+V (Cmd+C / Cmd+V) |
| Select all | (Cmd+A); menu on other platforms |
| Previous / next command | Ctrl+Up / Ctrl+Down (Cmd+Up / Cmd+Down) |
| Scroll a page | Shift+PageUp / Shift+PageDown |
| Top / bottom | Ctrl+Shift+Home / Ctrl+Shift+End (Cmd+Home / Cmd+End) |
| Copy mode | Ctrl+Shift+X (Cmd+Shift+X). Inside: arrows or h j k l, w b e, 0 $, g G, PageUp/PageDown or Ctrl+U/Ctrl+D, v (select), V (lines), Ctrl+V (block), y or Enter (copy and leave), / (find), Esc or q (leave) |
| Quick select | Ctrl+Shift+E (Cmd+Shift+E). Labels over URLs, paths, hashes and IP addresses in view; a label copies, Shift+label inserts at the prompt, Alt+label opens; Esc cancels |
| Plain-text buffer | Alt+F2. Inside: Ctrl+Up / Ctrl+Down move between commands, Esc returns |
| Text size | Ctrl+= / Ctrl+- / Ctrl+0 (Cmd+= / Cmd+- / Cmd+0) |
| Clear | Ctrl+Shift+K (Cmd+K) |
| Split | Ctrl+Shift+5 (Cmd+D) |

Given back to the host while a terminal is focused (CONTRACT.md section 9): Alt+1..9, Alt+Shift+1..9, Alt+arrows,
Alt+Shift+arrows, Ctrl+PageUp/PageDown, Ctrl+Shift+PageUp/PageDown, Ctrl+\\ and Ctrl+Shift+\\ (Ctrl+\\ is SIGQUIT in
shells; programs that need it get it from Send signal), Shift+Escape, F6 and Shift+F6, Ctrl+Shift+Space,
Ctrl+Shift+backtick, Ctrl+Tab, and the browser stand-ins Alt+T, Alt+W, Alt+Shift+T and Alt+backtick. The shell loses
zsh's Alt+digit arguments, Alt+arrow word moves (Ctrl+Left/Right still move by word) and Alt+T / Alt+W; that is the
accepted cost. Every other Ctrl+key belongs to the shell (Ctrl+W, Ctrl+K, Ctrl+T ...).

Links (D7): Ctrl+click (Cmd+click) opens a file reference in the panel's preview tab, a Ctrl+double-click keeps it,
Ctrl+Alt+click opens it in a new panel; a plain click selects text, as in every terminal. URLs open a Browser tab.
"Open output in an editor tab" opens a buffer, never a preview.

## 4. Fonts (D17)

All are terminal faces: never mirrored into PM Symbols; box-drawing (U+2500-257F), block elements (U+2580-259F),
braille (U+2800-28FF), powerline (U+E0B0-E0BF) and sextants (U+1FB00-1FB3B) are drawn by the terminal, so no patched
font is needed. Files and SHA-256 in `fonts/SOURCE.md`.

| Family | Role | Licence | File (woff2) | Bytes | Axes |
|---|---|---|---|---|---|
| JetBrains Mono | the code face in every look (editor and terminal) | OFL-1.1 | `pmt-jetbrains-mono-latin-var.woff2` (the PM NieR Mono bytes, duplicated: 31 KB) | 31,432 | wght 400-800 |
| JetBrains Mono Italic | italic | OFL-1.1 | `pmt-jetbrains-mono-latin-var-italic.woff2` | 42,964 | wght 100-800 |
| VT323 | Retro default | OFL-1.1 | `pmt-vt323-latin-400.woff2` | 17,936 | none |
| Sixtyfour | Retro raster option (motion-free CRT look from its own axes) | OFL-1.1 | `pmt-sixtyfour-latin-var.woff2` | 4,236 | SCAN -53-100, BLED 0-100 |
| Atkinson Hyperlegible Mono | accessibility | OFL-1.1 | `pmt-atkinson-hyperlegible-mono-latin-var.woff2` + italic | 17,752 + 19,084 | wght 200-800 |
| Departure Mono | Retro option | OFL-1.1 (the v1.500 release ships the SIL OFL, not MIT) | `pmt-departure-mono-400.woff2` | 22,496 | none |

Total 155,900 bytes before base64. Default sizes and line heights per face (CSS px): JetBrains Mono 13 / 1.30,
Atkinson 13 / 1.35, VT323 19 / 1.05, Departure Mono 13.75 / 1.20, Sixtyfour 10 / 1.45, system monospace 13 / 1.30.

## 5. Colour schemes (D15)

34 schemes: 27 third-party in 13 families plus 7 PM originals. Each third-party scheme was read from the project's
own terminal port pinned to a commit (`schemes/SOURCES.md` has every URL and SHA-256); every licence file is in
`schemes/`. Not bundled: the iTerm2-Color-Schemes collection (no single licence; import covers it), Modus (GPL-3.0).

| Family | Schemes | Licence |
|---|---|---|
| Puppet Master originals | PM Phosphor Green, PM Phosphor Amber, PM Paper Teletype, PM YoRHa Parchment, PM YoRHa Ink, PM High Contrast Light, PM High Contrast Dark | PM-authored |
| Catppuccin | Latte, Frappé, Macchiato, Mocha | MIT |
| Tokyo Night | Day, Storm, Night | Apache-2.0 |
| One Half | Light, Dark | MIT |
| Rosé Pine | Dawn, Moon, Main | MIT |
| Solarized | Light, Dark | MIT |
| Gruvbox | Light, Dark | MIT |
| Dracula | Dark | MIT |
| Nord | Dark | MIT |
| Kanagawa | Wave, Lotus | MIT |
| Everforest | Light, Dark | MIT |
| Flexoki | Light, Dark | MIT |
| GitHub | Light, Dark | MIT |
| Ayu | Mirage | MIT |

"Follow theme" defaults (light / dark): Friendly Catppuccin Latte / Mocha; Glass Tokyo Night Day / Storm (drawn at
70 % / 74 % opacity over the shell's existing glass blur: the terminal adds no backdrop blur, F3-431); Retro PM Paper
Teletype / PM Phosphor Green (Amber is the sibling); Basic One Half Light / Dark; NieR PM YoRHa Parchment / Ink.
"Switch with light and dark" (default on) swaps a chosen scheme for its family's other appearance.

Minimum-contrast floor: default 4.5:1, choices Off, 3:1, 4.5:1, 7:1. Applied per cell to the text colour against its
cell background by moving OKLab lightness only (hue and chroma kept); block elements, powerline and sextant glyphs are
exempt (they are shapes that meet their neighbours). Selection uses the scheme's selection text colour.

Import formats: iTerm2 `.itermcolors`, Windows Terminal JSON (one scheme or a settings.json `schemes` list), kitty
`.conf`, Ghostty theme, Alacritty TOML (and the legacy YAML), base16 and base24 YAML, Xresources. 256 KB input cap,
no evaluation, fixed error messages that never echo the file.

## 6. Appearance model (D15)

Four layers, resolved field by field: look defaults ("Follow theme") < app (`terminal.<field>`) < project
(`terminal.project.<field>`, written only by Settings) < this tab. The popover writes "This terminal" or "All
terminals". Everything applies live; no field has a restart badge. Fields (settings key `terminal.<name>`):

`scheme` (follow | id), `schemePair` (true), `minContrast` (4.5), `font` (follow | jetbrains-mono | atkinson | vt323 |
departure | sixtyfour | system), `fontSize`, `fontWeight` (400), `lineHeight`, `letterSpacing` (0), `ligatures`
(true), `boldBright` (false), `cursorShape` (follow | block | bar | underline), `cursorBlink` (true), `cursorTrail`
(follow | off | soft | glow | phosphor | trace), `background` (follow | theme | solid | gradient | image), `bgColor`,
`bgGradient` (dusk | dawn | deep | paper), `bgImage` (hills | grid | paper | custom), `bgImageData`, `bgDim` (0.45),
`bgBlur` (0 px; baked once into the image, never a backdrop blur), `opacity` (Glass), `padding` (8 px horizontal;
vertical is 60 % of it), `effects` (follow | off | custom), `scanlines`, `scanStrength` (0.30), `glow`, `glowStrength`
(0.45), `crt` (false), `curvature` (0.08), `burnIn` (true within Full CRT), `noise` (0.035), `flicker` (false),
`flickerAmount` (0.02, capped 0.03), `inactiveDim`, `smoothScroll`, `bell` (follow | visual | off), `stickyHeader`
(true), `copyOnSelect` (false), `sixtyfourScan`, `sixtyfourBleed`.

Cell geometry: a cell is an integer number of device pixels: `devW = round((advance + letterSpacing) * dpr)`,
`devH = round(fontPx * lineHeight * dpr)` (never less than 90 % of the font's ascent + descent), baseline centred.
The padding colour is the cell background, so the sub-cell remainder never shows a stripe.

## 7. Images (D14) - protocol scope and limits

All three protocols at once: kitty graphics (direct, file, temporary-file and shared-memory transmission; chunking;
ids, numbers and placement ids; placements with source rects, cell boxes and pixel offsets; relative placements;
the three z tiers; every delete selector; Unicode placeholders; animation frames, control and compose; queries),
sixel, and iTerm2 inline images (single and multipart).

| Limit | Value |
|---|---|
| Image store per screen buffer | 320 MiB of decoded RGBA (`w x h x 4`); main and alternate screens each have one. Over quota: images without placements first, then transient (`N=1`), then least recently used |
| Animation frames | a separate pool of 5 x 320 MiB per buffer (kitty keeps these on disk; the native port should too) |
| One image | at most 10,000 px a side; at most 64 MiB of decoded payload per transmission in the concept (kitty allows 400 MB; the native port may raise it) |
| Escape sequence caps | APC (one kitty command) 8 MiB; OSC (iTerm2) 24 MiB; DCS (sixel) 24 MiB; a sequence over its cap is dropped and kitty gets `EFBIG` |
| iTerm2 | 1 MiB per `FilePart`, 16 MiB of base64 per image, height at most 255 rows, width at most the columns right of the cursor |
| Sixel | 10,000 x 10,000 px, 16,777,216 pixels, 1024 colour registers (private per image), 16 MiB of data; DECSDM (mode 80) set = no scrolling, image at the top-left, cursor stays; 8452 puts the cursor right of the image |
| File and shared-memory names | at most 2048 bytes |
| Relative placements | 8 levels |
| Fastest animation frame shown | 20 ms (50 fps) |

Security (the 2026-09-14 kitty hardening, all of it): file media accept regular files only; the resolved path is checked
before opening: `/proc`, `/sys` and `/dev` (except `/dev/shm`) are refused; symlinks are followed and loops fail; every
read failure of any file medium (missing, unreadable, not regular, sensitive, shorter than claimed) gets exactly
`EBADF:Failed to read image file`; temporary files are deleted only inside `/tmp` or `/dev/shm` and only when the path
contains `tty-graphics-protocol`; shared memory is unlinked after reading. Remote (SSH) sessions and commands an agent
typed may use direct transmission only (file media get the same `EBADF`). Every error reply is a fixed string that
never echoes anything the program sent: `EINVAL:Invalid graphics command`, `ENOENT:Image not found`, `ENODATA:Insufficient
image data`, `EFBIG:Too much data`, `ENOSPC:Storage quota exceeded`, `ENOMEM:Image too large`, `EBADPNG:Image could not
be decoded`, `EILSEQ:Continuation for an upload that is not in progress`, `ETOODEEP`, `ECYCLE`, `ENOPARENT`.

Composition per renderer: paint order is default background, images with z below -1,073,741,824, cell backgrounds,
images with negative z, text and drawn glyphs, decorations, selection and cursor, images with z of 0 or more.
Unicode-placeholder images are drawn in their cells at the under-text tier. Images anchor to the cell they were placed
on: they scroll with it, follow it when the grid reflows, clip to the tab, and go when the screen is cleared or their
lines leave scrollback. Text written over a sixel or iTerm2 image cuts the image out of those cells. Images never enter
saved scrollback or backups. While an image decodes or a file is read, later output waits, so text after an image
always lands after it.

Accessible buffer and agent reads: an image is described as `[image W×H px]` (with ", animated"); a Unicode-placeholder
run as `[image]`. Image animation pauses under Reduced Motion and while the terminal is hidden.

## 8. Agents (D18)

| State | Row text | Actions |
|---|---|---|
| Driving | "<agent> is driving this terminal · step N of M · <label>" | Take over, Interrupt, Stop |
| Paused (after a take-over) | "You took over. <agent> is paused and has been told." | Hand back, Stop <agent> |
| Permission | "<agent> wants to type in this terminal: `<command>`" | Allow once, Always allow here, Deny |
| Secret input | "Password needed. Only you can answer this prompt; <agent> is waiting." | Type it (focuses the terminal) |

Rules the session enforces: one writer at a time; any human keystroke in an agent-driven terminal takes over at once
and the agent's next write is refused as `preempted`; an agent cannot type into a terminal a human opened without a
grant (Allow once lasts one command); a secret prompt refuses all agent input (`secret_input`) and turns the cursor
into a padlock; Interrupt sends SIGINT to the foreground job; Stop ends the agent's run and returns the lease to the
human; agent-opened terminals land as background tabs with the hollow-square mark and never take focus (D8). Every
command record carries `by`; the gutter shows a square mark on agent-typed commands and the mark menu says who typed
it. Shell-integration marks carry a per-terminal secret (`OSC 133;...;pmn=<secret>`, `OSC 6973;<secret>;E;<base64
command line>`, `OSC 6973;<secret>;W;<who>`): a mark without it is plain output. Agent reads return rendered text with
a read state (`final` for a finished command), never raw bytes, never images.
