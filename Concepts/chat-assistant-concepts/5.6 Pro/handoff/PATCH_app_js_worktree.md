# Patch requests → orchestrator (from Wave 3 — Menus, item 5)

## 1. Composer worktree button — LANDED (orchestrator, 2026-08-25)
`grep -c 'data-menu-anchor="worktree"' app.js` is now **0**, and `menus.js` has exactly one
live emitter. The interim `.composer-tools .selector-button[data-kind="worktree"]{display:none}`
guard has been **removed from `menus.css`** rather than left behind guarding a selector that
no longer exists.

## 2. Worktree menu rows from the fixture — REQUESTED, app.js-resident

`renderMenu()`'s worktree branch (currently **app.js:1201**) hardcodes four branch names and
four descriptions as string literals, while `data.js` carries `D.operational.worktrees`
(data.js:1871) with exactly those four ids plus `state`, `stateLabel`, `dirtyFiles`,
`conflicts`, `ahead`/`behind` and `path`. Four literals cannot express any of the four bind
states, which is the whole point of the new fixture — and the header control beside the menu
already reads all of it.

**Replace this one line** (unique in the file):

```js
    else if(m.type==='worktree') content=renderSimpleMenu('Worktree',[['main','Canonical branch'],['feature/query-index','Active query-performance work'],['concept/chat-5-6-pro','Assistant concept lab'],['review/query-benchmarks','Read-only benchmark review']],state.worktree,'set-worktree');
```

**with:**

```js
    /* Rows come from D.operational.worktrees, not from four string literals:
       the fixture covers unbound / bound-clean / bound-dirty / bound-conflict
       and a literal cannot express any of them. The description is composed
       from the STRUCTURED fields rather than from w.note, because several of
       the notes are authoring commentary aimed at whoever reads the fixture
       ("Deleting this thread must offer to keep the worktree") rather than
       copy for the person choosing a branch. */
    else if(m.type==='worktree') content=renderSimpleMenu('Worktree',
      (D.operational?.worktrees||[{id:state.worktree,stateLabel:'Current worktree'}]).map(w=>[w.id,[
        w.stateLabel||w.state,
        w.dirtyFiles?`${w.dirtyFiles} uncommitted file${w.dirtyFiles===1?'':'s'}`:'',
        w.conflicts&&w.conflicts.length?`${w.conflicts.length} conflicting file${w.conflicts.length===1?'':'s'}`:'',
        (w.ahead||w.behind)?`${w.ahead} ahead · ${w.behind} behind`:'',
        w.path||'no checkout yet'
      ].filter(Boolean).join(' · ')]),
      state.worktree,'set-worktree');
```

Rendered result (verified against the current fixture):

| row | description |
|---|---|
| `main` | Bound · clean · /srv/pm/worktrees/main |
| `feature/query-index` | Bound · uncommitted changes · 12 uncommitted files · 6 ahead · 1 behind · /srv/pm/worktrees/query-index |
| `concept/chat-5-6-pro` | Bound · conflict · 4 uncommitted files · 2 conflicting files · 14 ahead · 9 behind · /srv/pm/worktrees/chat-5-6-pro |
| `review/query-benchmarks` | Unbound · no checkout yet |

Notes for whoever applies it:
- `renderSimpleMenu` emits the second tuple element into
  `.menu-item .menu-copy span`, which is `white-space:normal`, so long rows wrap rather than
  truncate; the menu keeps its own `max-height`/`overflow:auto`.
- The fallback keeps the menu from rendering empty if `D.operational` is ever absent, and it
  says "Current worktree" rather than inventing a bind state.
- `esc()` is applied by `renderSimpleMenu` to both elements already.
- No change needed in `menus.css` / `menus.js`; `menus-verify.mjs`'s worktree assertions
  drive the menu through `[data-action="set-worktree"][data-value="<id>"]`, which this keeps.
