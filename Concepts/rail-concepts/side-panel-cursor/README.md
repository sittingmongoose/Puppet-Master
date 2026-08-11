# Side-panel prototypes

Concept / source-lineage gallery for redesigning Puppet Master Activity Bar side panels.
**Does not edit** `Concepts/PMConcept7.html`. Promote a winner into pm6-build parts later.

## Open

From this folder:

```bash
python3 -m http.server 8943
```

Then open [http://127.0.0.1:8943/index.html](http://127.0.0.1:8943/index.html).

Use **port 8943** (not 8765) so this gallery does not collide with other local concept servers.

You can also open `index.html` via `file://`, but HTTP avoids some browser quirks with module loads.

## Verification (2026-07-24)

- **v8 chip fix:** `.sp-chip` inline-flex centered + `align-self:center`; fleet row centers chips while rail stretches; cache `?v=20260724v8`
- **v7 residual polish:** Narrow multi-CTA stacking under `data-panel-narrow`; stronger panel/variant host fade (~220ms); cache `?v=20260724v7`
- **v6 pickable pass:** Rewrote thin/clone labs into distinct concepts (path map, live tape, runtime sheet, watch HUD, filmstrip, policy inspector, swimlanes, handoff queue, capability matrix, type mosaic, freshness timeline, lookup, typed preview); stronger shell skins; narrow-panel via `data-panel-narrow`; cache `?v=20260724v6`
- **v5 density stress:** Comfortable/Crowded packs; default Crowded (~15 search files / ~40 hits, 18 containers, 19+ source changes, 28 artifacts). Density chips on proto bar.
- **v4 lab studio:** `labs/studio.html` — full left IDE shell; activity bar switches all 7 panels; per-panel variant chips; richer editor stub shared with shells; polish (motion/spacing/220px)
- Per-panel `labs/*.html` are thin wrappers into the same mount (`?panel=…`)
- Zero native `<select>`; sprout menus only

## What’s here

| Path | What |
|---|---|
| `shells/01`–`06` | Coherent Home shells — all 7 panels under one layout language |
| `labs/studio.html` | **Primary lab entry** — switch panels + variants in one shell |
| `labs/*.html` | Thin deep-links into studio for a starting panel |
| `_shared/` | Tokens (8 themes), sprout menus, panel renderers, chrome |

### Panels covered

Search · Source · Actions · Docker · Tests · Agents · Artifacts

### Layout languages

1. **Stacked Rail** — no nested cards; sticky rail + continuous list  
2. **Segment Strip** — segmented subviews; pure list body  
3. **Inspector Sheet** — list + in-panel bottom sheet  
4. **Command Toolbar** — icon toolbar + overflow sprout; pinned footer  
5. **Icon Spine** — vertical subview spine + content column  
6. **Focus Ladder** — one open accordion section at a time  

## Review checklist

- [ ] Readable at **220px**, **260px**, and **420px** (top-bar chips + drag resizer)
- [ ] Cycle all **8 themes** (Friendly/Glass/Retro/Basic × dark/light)
- [ ] No native `<select>` / OS menus — only PM sprout menus
- [ ] No emoji — SVG icons only
- [ ] Borders do not double-stack or clip text
- [ ] Feature affordances present (even if progressive-disclosure)

### Feature reminders (Plans)

- **Search:** find/replace, case/word/regex, scope, index rebuild/status, OpenFile rows  
- **Source:** Changes/History/Graph/Worktrees/Branches/Stash; staged/unstaged/untracked/conflicts; branch sprout; commit/push/pull/fetch/sync; worktree filters All|Threads|Orch|Manual; Conflict Assistant  
- **Actions:** Current Branch / Workflows / Settings; pin/health; triage/dispatch; waiting/blocked ≠ failure + recovery CTA  
- **Docker:** Containers/Images/Compose/Registries/Build/Publish + Networks/Volumes/Contexts/Kubernetes; Docker|Podman; row overflow  
- **Tests:** policy Auto/On/Off; run/watch/cancel/receipt; run_list / active detail / failures / artifacts; redaction; runtime ready/disabled  
- **Agents:** active + available registry; lineage entrypoints; no private state  
- **Artifacts:** type filter; identity rows; cost_usage → Ledger / Usage; gated/blocked rows stay visible  

Checklist refined from Plans packs ([Plans packs for panels](a9cab3f4-0c4d-4e9a-b6ea-667412dfa2c0)).

## Slint 1.17.1 port notes

- Sprout menus → `PopupWindow` with `close-on-click-outside`
- Lists → `ListView` / `Repeater` with elided `Text`
- Width → shell property `panel-w` (220–480 / 50vw)
- Themes → shared brush tokens; avoid backdrop blur *inside* panel surfaces
- Do not port HTML portals / `getBoundingClientRect` menu math as-is

## Regenerate pages

```bash
python3 Concepts/side-panel-protos/_shared/generate_pages.py
```

Edits to panel markup/behavior usually go in `_shared/panels.js` (and chrome/CSS), then refresh the browser.
