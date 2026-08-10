# Subagent brief — building a panel design for PMConcept7 panel-prototype

You are building ONE design direction (B/C/D/E/F) for the PMConcept7 left-panel redesign prototype. A working Design A already exists. Your job: produce `design.css` + `design.js` for YOUR design in YOUR folder, following this brief exactly. Do not modify any other files.

## Location & files (yours to create)

- `Concepts/pm7-panel-protos/designs/<YOUR-FOLDER>/design.css`  — your design's styling
- `Concepts/pm7-panel-protos/designs/<YOUR-FOLDER>/design.js`   — your design's renderer

The prototype's `index.html` auto-loads `design.css` then `design.js` when your design is selected via the picker.

## Hard constraints (non-negotiable)

1. **NO native OS menus.** No `<select>`, no `<dialog>`, no `confirm()`/`prompt()`/`alert()`, no `oncontextmenu` (native). Anywhere you'd use a `<select>`, use the PM sprout menu instead (see "PM sprout menu" below).
2. **NO emojis.** SVG icons only.
3. **Must survive 220px panel width** (the min). Usable interior ≈ 140px after the 72px activity bar. Text must truncate (`overflow:hidden; text-overflow:ellipsis; white-space:nowrap`), never spill. Use flex with `min-width:0` on flex children.
4. **Must work across all 8 themes** without breaking. The design must consume CSS custom properties (tokens) from `css/proto-tokens.css` — never hardcode colors/sizes. Worst cases: `retro-dark` (2px borders, 0 radius) and `glass-dark` (14px radius, translucent). Use `var(--*)` everywhere.
5. **Slint 1.17.1 compatible in spirit.** Prefer flexbox columns/rows (→ Slint ColumnLayout/RowLayout), avoid CSS grid for the PRIMARY layout axis (grid is OK for tiny things like KV pairs since Slint has GridLayout), avoid `:has()`, `clamp()`, `aspect-ratio`, complex `backdrop-filter`. Standard `border-radius`, `box-shadow`, `transform`, `transition` are fine.
6. **Register your design** at the end of design.js:
   ```js
   window.PROTO_DESIGNS = window.PROTO_DESIGNS || {};
   window.PROTO_DESIGNS.<ID> = {
     id: '<ID>', name: '<Name>',
     render: function(panelId) { /* return HTML string */ }
   };
   ```

## The data you render (already loaded as window.PROTO_DATA)

`window.PROTO_DATA.DATA` has these keys, one per panel: `search`, `source`, `actions`, `docker`, `tests`, `agents`, `artifacts`. Your `render(panelId)` switches on `panelId` and returns the HTML for that panel using `PROTO_DATA.DATA[panelId]`. Read `js/proto-data.js` to see the EXACT shape — it is the single source of truth for sample data. Do not invent data fields; use what's there. Every panel must be implemented (all 7).

Panel list & sample-data summary (read proto-data.js for full detail):
- **search** — `index{engine,docs,lastIndexed,state}`, `scopes[]`, `defaultScope`, `query`, `results{total,files,files:[{path,count,hits:[{ln,html}]}]}`
- **source** — `branch`, `branches[]`, `changes{staged[],unstaged[]}` (each `{path,status,note}`), `commit{incoming,outgoing}`, `worktrees[{branch,owner,state,status,path,base,pr?}]`, `history[{sha,when,msg}]`, `stash[{name,label,files}]`
- **actions** — `connection{account,state,scopes[],missing[]}`, `branch`, `readiness`, `runs[{id,name,meta,status,branch,triage?{job,step,changed,log[],next}}]`, `workflows[{name,dispatchable,reason}]`, `secrets[]`
- **docker** — `runtime{context,state}`, `views[]`, `defaultView`, `containers[{name,image,status,ports,uptime}]`, `images[]`, `compose[{svc,image,status}]`, `scenarios[]`, `registries[]`, `build{target,tag,digest,...}`, `publish[{stage,label,state}]`
- **tests** — `policy`, `policyNote`, `lastRun{command,result,when,history}`, `sessions[{id,suite,cases,status,dur}]`
- **agents** — `active[{name,meta,status}]`, `note`
- **artifacts** — `filters[]`, `defaultFilter`, `rows[{family,type,label,status,prev,meta}]`, `investigation{id,title,chips[{label,ok}],steps[{role,type,label}]}`

## PM sprout menu (use this instead of <select>)

Markup pattern (a wrapper containing a trigger button + a `.pm6-tb-menu` panel of `.pm6-tb-menu-item`s). The engine in `js/proto-sprout.js` wires it via delegation — you just emit the markup:

```html
<div class="pm6-tb-menu-wrap" data-select="single"
     data-label-target="UNIQUE_LABEL_ID" data-action="cmd.git.switch_branch">
  <button type="button" class="YOUR-TRIGGER-CLASS" aria-haspopup="menu" aria-expanded="false">
    <span id="UNIQUE_LABEL_ID">current value</span>
    <span class="pm6-tb-chev" style="font-size:8px;opacity:.6">&#9662;</span>
  </button>
  <div class="pm6-tb-menu sprout-left" role="menu">
    <button type="button" class="pm6-tb-menu-item is-selected" data-value="opt1">
      <svg class="pm6-mi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      <span class="pm6-mi-label">Option 1</span>
    </button>
    <button type="button" class="pm6-tb-menu-item" data-value="opt2">…</button>
  </div>
</div>
```
- `data-select="single"` → engine marks the clicked item `.is-selected` and clears siblings.
- `data-label-target="ID"` → engine updates that element's textContent with the selected item's label on click.
- `data-action="cmd.x"` → engine toasts `cmd.x → value`.
- `sprout-left` class on the menu makes it open from the left edge (use for in-panel menus).
- `.pm6-mi-check` is a checkmark svg that shows only on `.is-selected` items.

For places that need a select: Search scope, Source branch, Docker view (if you don't use inline pills). Use a sprout menu.

## Helper utilities available (call from inline onclick)

- `PROTO_PICKER.toast(msg)` — show a toast (use for all action button clicks so the demo feels alive)
- `PROTO_THEME.set(themeId)` — switch theme

For toggles (disclosures, pills), inline onclick toggling a class is fine, e.g. `onclick="this.classList.toggle('active')"`.

## Design tokens you should use (from proto-tokens.css)

Spacing: `--xs 2px --sm 4px --md 8px --lg 12px --xl 16px`
Font sizes: `--fs-2xs 10 --fs-xs 11 --fs-sm 12 --fs-md 14 --fs-lg 16`
Colors: `--background --surface --surface-elevated --text-primary --text-secondary --text-muted --border --border-light --accent-primary --accent-blue/magenta/lime/orange/warning/error`
Graph states: `--graph-pending/running/passed/failed/planning/gating`
Radius: `--radius-xs/sm/md/lg/xl/pill` (theme-dependent!), `--border-radius`
Borders: `--border-width` (retro=2px, else 1px)
Motion: `--motion-fast/med/slow`, `--ease-out/spring/smooth/snap/default`
Mono: `var(--mono-font)`

Use `color-mix(in srgb, COLOR 18%, transparent)` for soft chip backgrounds — it works in the browser. (For Slint this gets precomputed.)

## Status → chip/dot mapping (be consistent)

- ok/success/pass/done/running-healthy → `--graph-passed`, dot `.ok`
- running/in-progress/restarting → `--graph-running`, dot `.run`
- failed/err → `--graph-failed`, dot `.fail`
- idle/waiting/pending/queued → `--graph-pending`, dot `.idle`

## Your design's philosophy (see your specific assignment)

[Each subagent gets a different philosophy — see the prompt you were given.]

## Verification before you finish

After writing both files, the prototype should load your design when its letter is clicked. Mentally trace: does it fit at 220px? Do texts truncate? Does every panel render? Are there any native `<select>`/`<dialog>`? (There must not be.) Then report done.
