# Terminal tab kind: internal architecture (builders' contract)

Owner: the terminal concept thread (branch `concept/home-terminal-20261009`). This is the contract every file under
`Concepts/home-redesign/src/terminal/` is written against. The host contract is `Concepts/home-redesign/CONTRACT.md`
(panels thread); the binding decisions are D11-D20 in
`/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md`. `SPEC.md` (same folder) is the rule and
number list sent to the Plans thread. Where this file and DECISIONS.md disagree, DECISIONS.md wins.

The concept is HTML, but it is the design reference for a Slint (Skia) port and a Leptos web client, and DL-035 says
Puppet Master writes its own engine. So the concept is a real, small terminal: a VT parser, a cell grid with scrollback
and reflow, a canvas renderer that paints in the Skia paint order, and a simulated shell with a real line editor whose
programs emit real escape sequences (images included). Nothing is faked at the screen level.

## 1. Files

```
src/terminal/
  ARCHITECTURE.md  SPEC.md
  js/   00-core.js        namespace T, emitter, colour maths, wcwidth, base64, utils
        10-parser.js      VT500 state machine (Paul Williams), feeds a handler
        12-grid.js        Line, Buffer (scrollback, reflow), StyleTable, LinkTable
        14-terminal.js    T.Terminal: applies parser actions to buffers, modes, replies, OSC dispatch,
                          shell-integration marks (nonce-checked), commands log
        16-input.js       key and mouse encoding (xterm, kitty keyboard flags, bracketed paste)
        20-metrics.js     font loading, cell metrics per font/size/line height/letter spacing/DPR
        22-glyphs.js      procedural box drawing, blocks, shades, sextants, braille, powerline sprites
        24-renderer.js    T.Renderer: canvas paint, dirty rows, selection, cursor, decorations, image layers
        30-images.js      T.ImageStore: quotas, placements, kitty protocol, Unicode placeholders, animation
        31-kitty-diacritics.js  T.KITTY_DIACRITICS (row/column diacritics table)
        32-sixel.js       T.Sixel: decode (DCS q) and encode (for the simulated img2sixel)
        34-iterm.js       OSC 1337 File= (single and multipart) into the same store
        38-saved.js       saved scrollback: text, marks and images to IndexedDB, restore into a new session (T.Saved)
        40-schemes.js     scheme helpers (palette expansion, light/dark pairs, per-look defaults)
        41-schemes-data.js T.SCHEMES (generated from schemes/*.json; each scheme with its 17 editor colours)
        42-appearance.js  T.Appearance: layered model, resolution, contrast floor, settings registration, and the
                          catalog the code editor reads (editorTokens, palette, retroPhosphor; D27)
        44-import.js      T.SchemeImport: iTerm2, Windows Terminal, kitty, Ghostty, Alacritty, base16/24, Xresources
        50-fx-gl.js       T.FXGL: WebGL post-process (scanlines, glow, curvature, burn-in, noise, flicker, degauss)
        52-fx.js          T.FX: effect policy (focused only, idle stop, Reduced Motion, no-GPU), trail, bell
        60-vfs.js         T.VFS: the simulated machine's files (and shared memory)
        62-shell.js       T.Session + T.Shell: line discipline, line editor, prompt, history, completion, jobs
        64-programs.js    T.Programs: ls, git, cargo, npm, htop, image tools, sudo, ssh, colortest ...
        66-assets.js      T.Assets: procedural images (PNG/JPEG bytes, frames) for the image demos
        70-view.js        T.View: the tab body (gutter, canvas stack, scrollbar, sticky header, overlays)
        72-find.js        find overlay
        74-select.js      selection, copy mode, quick select hints, links
        76-popover.js     Appearance popover (T.AppearancePopover: the terminal's, and the editor's cut-down copy)
        78-agent.js       agent states (driving row, take over, permission, secret prompts, attribution)
        80-card.js        the chat's command card (PMT.card)
        90-kind.js        session registry, profiles, PM_HOME.registerKind('terminal'), window.PMT
  css/  00-fonts.css 10-view.css 20-overlays.css 30-looks.css 40-nier.css 50-fx.css 80-card.css (sorted, inlined)
  fonts/    woff2 + licence texts + SOURCE.md (DL-161 format)
  schemes/  <family>.json (raw, with source and licence) + LICENSE-<family>.txt + SOURCES.md; editor-syntax.json
            (the 17 editor syntax colours of every scheme, D27) + check_editor_syntax.py (its contrast gate)
  harness/  build_harness.py, mock-host.js, mock-host.css, harness.template.html, demos.js, labs, notes/, fixtures/,
            checks/ (node checks; the repository ignores every folder named tests/)
```

## 2. Assembly and code rules

- The layer concatenates `js/*.js` in sorted order into ONE function scope:
  `(function (PM_HOME) { 'use strict'; <files> })(window.PM_HOME)`. `harness/build_harness.py` does exactly the same,
  with `harness/mock-host.js` providing `window.PM_HOME`. So:
  - `00-core.js` declares `var T = {};` at the top level of that scope. Every other file is ONE block
    `(function () { ... })();` that reads and writes `T.<Name>` only. No other top-level declarations.
  - `window.PMT` is the public API, assigned in `90-kind.js` only.
- Plain ES2020, no modules, no libraries, no network. Must run in Chrome and Safari 16.4+. Do not use OffscreenCanvas
  for 2D work, `Array.prototype.at` is fine, `Intl.Segmenter` with a fallback.
- No emoji anywhere in source (the layer lint fails the build). A simulated program that prints an emoji builds it at
  runtime: `String.fromCodePoint(0x2728)`.
- CSS: class prefix `pmt-`, data attributes `data-pmt-*`, custom properties `--pmt-*`. Never `pill` in a class name,
  never `border-left`/`border-inline-start` 2 px or wider, no `:has(`, no viewport-width `@media` (use
  `@container pmw-body (...)`), no fully rounded capsules. Read the look from `html[data-theme]`,
  `html[data-o55-nier="on"]`, `html[data-motion="reduced"]`. Use the host tokens `--pmw-*`, `--pm-font-code`, and the
  page tokens (`--text-primary`, `--accent-*` ...) for chrome; the terminal's cell colours come only from the resolved
  scheme.
- No internal ids in any visible text (no session ids, tab ids, nonces).
- Hover: the screen root carries `data-pmh="off"`; header buttons get `data-pmh="icon"`.
- Overlays: menus through `api.menu(items, anchor)`; popovers and overlays inside the tab host only.

## 3. Core types (00-core.js, 12-grid.js)

### Colour encoding (one int)

| Value | Meaning |
|---|---|
| `0` | default (fg or bg of the scheme) |
| `0x100 + i` (256..511) | palette index `i` (0-255) |
| `0x1000000 \| rgb` | truecolor `0xRRGGBB` |

`T.color`: `hex(str) -> rgb int`, `css(rgb, alpha?)`, `rgb(r,g,b)`, `lum(rgb)` (WCAG relative luminance),
`contrast(a, b)`, `ensure(fg, bg, ratio) -> rgb` (moves fg's OKLab L until the ratio holds; never touches hue),
`mix(a, b, t)`, `palette256(ansi16) -> Uint32Array(256)` (16 + xterm cube + greys), `oklab`/`fromOklab`.

### Styles (`T.StyleTable`, interned)

`styles.id({fg, bg, ul, flags, link}) -> int` (0 is the default style); `styles.get(id)`.
`flags`: `BOLD 1, DIM 2, ITALIC 4, UL_MASK 0x38 (underline kind << 3: 1 single, 2 double, 3 curly, 4 dotted,
5 dashed), BLINK 0x40, INVERSE 0x80, INVISIBLE 0x100, STRIKE 0x200, OVERLINE 0x400`. `ul` is the underline colour,
`link` an id in `T.LinkTable` (`{uri, params}`, OSC 8).

### Lines and buffers

```
Line { id (monotonic int, never reused), cols,
       cp: Uint32Array   code point per cell (0 = empty; a wide char's second cell is 0 with SPACER),
       st: Uint32Array   style id per cell,
       fl: Uint8Array    WIDE 1, SPACER 2, GRAPHEME 4 (extra code points in gr), PROTECTED 8,
       gr: Map|null      col -> full grapheme string when GRAPHEME,
       wrapped: bool     this line soft-wraps into the next,
       ver: int          bumped on every change (renderer dirty check),
       mark: null | { cmd, kind: 'prompt'|'input'|'output'|'end' }   shell-integration mark (verified only) }
Buffer { cols, rows, lines: Line[] (scrollback then screen; the screen is the last `rows` lines),
         ybase (= lines.length - rows), trimmed (lines pruned from the top so far), cursor {x, y, pendingWrap},
         scrollTop, scrollBottom, isAlt, maxScrollback }
absolute line number = trimmed + index in lines
```

Reflow (primary screen only, on column change): logical lines are re-wrapped; marks, command references and image
anchors move with the cell they were on. `Buffer.resize` returns `{ remap, lineMap, gone }`: `remap` is
`(oldLine, col) -> {line, col}`, and `gone` is the lines the resize removed (scrollback overflow, lines cut below the
screen, blank lines popped below the cursor). `Terminal.resize` calls `images.onResize(remap, gone)` and then trims
`gone` (`_onTrim`). Buffers also have an `onRecycle(lines)` hook for lines a region scroll reuses, which the terminal
wires to the image store.

### Terminal (`T.Terminal`)

`new T.Terminal({ cols, rows, scrollback, nonce, cell: () => ({w, h}) })`; `term.write(str)`;
`term.resize(cols, rows)`; `term.on(event, fn)`. Events: `reply` (bytes for the program, e.g. DA1, DSR, kitty
replies), `title`, `cwd` (OSC 7), `bell`, `progress` ({state 0 none, 1 value, 2 error, 3 indeterminate, 4 paused,
value 0-100}, OSC 9;4), `notify` (OSC 777 / 99 / plain 9), `command` ({type: 'prompt'|'input'|'exec'|'end', cmd}),
`mode` (mouse tracking, bracketed paste, focus events, kitty keyboard flags, synchronized output), `alt` (entered or
left the alternate screen), `clipboard` (OSC 52 write, only honoured while focused), `dirty`.
Shell integration: `OSC 133 ; A|B|C|D[;exit] ; pmn=<nonce>` and `OSC 6973 ; <nonce> ; E ; <cmdline>` (PM-private:
exact command line) and `OSC 6973 ; <nonce> ; W ; <who>` (who typed it). A mark whose nonce does not match the
session's is output, never a boundary. `term.commands`: `[{ id, cmdline, cwd, by, exit, start, end, promptLine,
outputLine, endLine }]`.

## 4. The simulated machine (60-vfs.js, 62-shell.js, 64-programs.js, 66-assets.js)

### Sessions and the line discipline (`T.Session`, written by the terminal lead)

A session pairs one `T.Terminal` with one `T.Shell` over a simulated PTY. `session.input(data, by)` is a keystroke or
paste from the user or an agent; the line discipline does ONLCR on output, signal keys (Ctrl+C -> SIGINT to the
foreground job, Ctrl+Z, Ctrl+\\), cooked or raw input, echo off for secret reads.

### Program contract (`T.Programs`)

```
T.Programs['name'] = { run: async function (ctx) { ...; return exitCode; },
                       complete(args) -> string[] (optional), summary: 'one line' }
ctx.argv            ['name', ...args]
ctx.env             { HOME, USER, HOSTNAME, PWD, TERM: 'xterm-256color', COLORTERM: 'truecolor', TERM_PROGRAM:
                      'PuppetMaster', PM_AGENT (when an agent launched it), ... }
ctx.cwd, ctx.setCwd(path)
ctx.out(str)        write to the terminal ("\n" becomes "\r\n"); escape sequences pass through untouched
ctx.err(str)        same stream, unless the command line sends fd 2 elsewhere (`2>file`, `2>>file`, `2>&-`);
                    `2>&1` and `>&2` change nothing
ctx.sleep(ms)       resolves after ms; rejects with T.Signal('SIGINT'|...) when a signal arrives, unless trapped
ctx.signal          { aborted: bool, name }   ctx.onSignal(fn)   ctx.trap(name, bool)
ctx.setRaw(bool)    raw mode: keys arrive through ctx.readKey()
ctx.readKey()       Promise<string> (raw bytes of one key or paste)
ctx.readLine(prompt, { secret }) Promise<string>   secret: no echo, marks the session "secret input" (D18: only
                    the human can answer; an agent's input is refused)
ctx.size()          { cols, rows, cellW, cellH } (CSS px per cell, for image placement maths)
ctx.onResize(fn)
ctx.query(seq, { timeout, until }) Promise<string>  write `seq`, collect the terminal's reply bytes until `until`
                    (a RegExp) matches or the timeout (default 300 ms) passes
ctx.vfs             T.VFS (the remote host's VFS inside ssh)
ctx.remote          null | { host }   (file, temp-file and shared-memory image media are refused when remote)
ctx.by              'user' | 'agent:<name>'
ctx.session         the T.Session: per-terminal in-memory state (sudo's credential cache), never saved
ctx.enterRemote()   returns a function that ends it; while held the shell counts as remote for the file-media rule
                    (`ssh host cmd` uses it; pipeline stages after a remote one get it automatically)
ctx.assets          T.Assets
ctx.subshell(opts)  Promise<exitCode>: run an interactive shell inside this job (ssh uses it):
                    { host, user, vfs, remote: true, motd } ; it returns when that shell exits
ctx.isatty          false when the output is piped or redirected
ctx.stdin           null, or the text piped in from the previous command of a pipeline (grep, head, tail, wc, less)
```

Builtins belong to the shell, not to `T.Programs`: `cd pwd echo printf export unset alias history clear exit true
false type which source jobs fg kill sleep(ms granularity) env`. Everything else is a program.

### VFS (`T.VFS`)

`new T.VFS(seed)`; `resolve(cwd, path)`; `stat(path)` -> `{ type: 'file'|'dir'|'symlink'|'char'|'fifo'|'proc'|'sock',
size, mode, mtime, target? } | null`; `lstat`; `realpath(path)` (throws `ELOOP` after 40 hops); `list(dir)`;
`readText(path)`; `readBytes(path)` -> `Promise<Uint8Array>` (lazy asset files resolve through T.Assets); `write`,
`unlink`, `mkdir`, `symlink`; `shm.create(name, bytes)`, `shm.read(name)`, `shm.unlink(name)` (POSIX shared memory
names). Errors are `{ code: 'ENOENT'|'EISDIR'|'ELOOP'|'EACCES'|'EINVAL' }`. Seed: the `tastebook` project used across
the concept (`~/tastebook/api`: Cargo.toml, src/main.rs, src/router.rs, src/media/import.rs with a real line 128,
assets/*.png, docs/), `/tmp`, `/proc/self/environ`, `/dev/null`, a symlink loop under `/tmp/loop`.

### Assets (`T.Assets`)

`T.Assets.draw(name, w, h) -> HTMLCanvasElement`; `png(name, w, h) -> Promise<Uint8Array>`; `jpeg(...)`;
`rgba(name, w, h) -> Uint8ClampedArray`; `frames(name, w, h, n) -> [{ rgba, delayMs }]`. Names: `bench` (bar chart),
`chart` (line chart), `logo` (Puppet Master mark, no text), `photo` (a calm landscape), `spinner` (animation), `avatar`.
Drawn procedurally; nothing is fetched.

## 5. Rendering (20-metrics.js, 22-glyphs.js, 24-renderer.js)

Paint order per frame (the Skia order the native renderer will use):
1. cell backgrounds (merged runs) over the scheme background (or the background layer),
2. images with z below -1,073,741,824, then images with negative z,
3. text runs (per style run when ligatures are on; per cell otherwise), procedural glyph sprites for box drawing,
   blocks, shades, sextants, octants, braille and powerline,
4. decorations: underline kinds, strike, overline, link hover underline,
5. search highlights, selection, cursor,
6. images with z >= 0.

With ligatures on, text runs also split where the cell background changes, and each run is stretched to its cell span
so it never drifts off the grid. `renderer.defaults()` returns `{ fg, bg, cursor }`: the OSC 10/11/12 colours over the
scheme's, mapped on phosphor schemes; the view paints `--pmt-bg`, `--pmt-bg-solid` and `--pmt-fg` from it, and the
fx trail and the evicted-image placeholder use it too. DOM overlays under Full CRT place themselves with
`view.cellToOverlay(col, row)`, which goes through `fx.unmapPointer`.

Only dirty rows repaint (row `ver` vs the painted version, plus viewport and selection changes). The canvas is sized
in device pixels and snapped to them. Cell metrics: `cellW = ceil(advance(fontPx) * dpr) / dpr + letterSpacing`,
`cellH = round(fontPx * lineHeight * dpr) / dpr`.

## 6. Effects (50-fx-gl.js, 52-fx.js)

`T.FXGL.create(canvas)` -> `fx | null` (null when WebGL is missing or reports a major performance caveat: that is the
no-GPU path). `fx.render(sourceCanvas, params, nowMs)`; `fx.mapPointer(x, y, w, h)` -> `{x, y} | null` (the inverse
of the curvature warp, so selection works through it); `fx.animating(params, nowMs)` -> bool; `fx.dispose()`.
`params`: `{ scanlines: {on, strength, period}, glow: {on, strength, radius}, curvature: {on, amount},
bezel: {on}, vignette: {on, strength}, burnIn: {on, persistMs}, noise: {on, amount}, flicker: {on, amount},
degauss: {startMs} | null, dim: 0..1 }`. The policy module decides when to render: only the focused terminal
animates, at most 30 fps for ambient effects, stops after idle, everything that moves is off under Reduced Motion,
and the no-GPU path keeps only the CSS fallbacks (static scanlines, a CSS glow) and reports what it could not draw.

## 7. Chat command card (80-card.js)

`PMT.card(spec) -> HTMLElement`; `card.update(spec)`. `spec`: `{ command, cwd, status: 'running'|'ok'|'failed'|
'interrupted'|'waiting', exitCode, elapsedMs, startedAt, lines: string[] (plain text, no escapes), totalLines,
by: 'user'|'agent:<name>', onOpen, onRerun, onViewOutput, onToggle, expanded, failureLine }`. `failureLine` is
computed by the terminal from its command log (`PMT.cardSpec(session, command)` builds a whole spec), or by the chat with
`T.CommandCard.failureLineOf(lines)` as a fallback.

## 8. Public API (`window.PMT`, 90-kind.js)

`PMT.profiles()` -> `[{ id, label, detail, icon }]`; `PMT.open(spec)` (through `PM_HOME.open`); `PMT.card(spec)`;
`PMT.sessions()`; `PMT.agent` (agent driving API used by demos and the chat); `PMT.version`.

### The scheme catalog the editor shares (D27)

One catalog serves the terminal and the code editor. `schemes/*.json` and `schemes/editor-syntax.json` compile
(`python3 harness/compile_schemes.py`; `--check` fails when the output is stale) into `js/41-schemes-data.js`, where
every `T.SCHEMES` entry carries `editor: { kw, str, num, com, fn, ty, var, prop, op, pun, tag, attr, esc, mac, link,
head, code }` as `#rrggbb`. The compiler fails when a catalog id has no entry there, a token is missing or a value is
not hex. Imported and user schemes have no editor block; theirs comes from their ANSI 16 by a fixed map (n is the
ANSI index): kw 5, str 2, num 3, com 8, fn 4, ty 6, var foreground, prop 4, op foreground, pun foreground, tag 1,
attr 3, esc 6, mac 5, link 4, head 4, code 2 (`T.Appearance.EDITOR_FROM_ANSI`). So every scheme supplies all 17.

`PMT.Appearance` (over `T.Appearance`, 42-appearance.js); unknown scheme ids give `null`:
- `schemes()` -> `[{ id, name, mode: 'light'|'dark', pair }]`: every scheme, curated then imported and user ones;
  `pair` is the id "Switch with light and dark" swaps to, `null` when there is none.
- `editorTokens(schemeId)` -> `{ kw: '#rrggbb', ... }` (all 17, a copy) | `null`.
- `palette(schemeId)` -> `{ background, foreground, cursor, selection, ansi: [16] }` | `null`, as the catalog holds
  them; `cursor` falls back to the foreground and `selection` (the scheme's `selectionBackground`) to a quarter of the
  way from the background to the foreground, as the renderer does. The YoRHa schemes give their JSON values here; the
  NieR tokens they are built from at runtime are the editor's to read.
- `retroPhosphor()` -> `'green'|'amber'`: the Retro look's dark scheme. It has no store of its own: it is what Retro
  dark resolves to at the All terminals layers (`terminal.scheme` and `terminal.schemePair`, project over app). Choosing
  PM Phosphor Amber for All terminals makes it `'amber'`; Follow look, or any other scheme, reads `'green'`. A tab's own
  scheme never changes it. The editor only reads it.
- `on('retro-phosphor', fn)` -> unsubscribe function; `fn(value)` fires once each time that value changes (checked after
  every write to the app or project layer and every host settings event for `terminal.*`).

`PMT.AppearancePopover.open(anchor, { surface: 'editor'|'terminal', get, set, onClose })` -> `{ el, close, refresh }`
(`T.AppearancePopover`, 76-popover.js). `surface: 'terminal'` is the terminal's own popover (`View.openAppearance`
opens it with `{ view }`; it binds `T.Appearance` at the scope its switch shows). `surface: 'editor'` shows only the
colour scheme (with "Follow look" first, the default: the look's own scheme, and in Retro dark the phosphor
`retroPhosphor()` names), the font face (Follow look or a terminal font) and the size; no effects, cursor, trail,
background or scope rows. `get()` returns the editor's `{ scheme, font, size }` (`'follow'` for scheme and font when
the editor follows the look, `size` null for the default) and `set(key, value)` is called on each change with key
`'scheme'`, `'font'` or `'size'`; the editor persists them (`PM_HOME.settings` `editor.scheme`). The editor's copy is
the one overlay outside a tab host: it floats (fixed) in `#pmw-overlay` under `anchor`, right-aligned to it, and closes
on Escape, Done, its close button or a click outside, calling `onClose` once. Both copies use the same classes, so the
NieR paint in `40-nier.css` reaches both.
