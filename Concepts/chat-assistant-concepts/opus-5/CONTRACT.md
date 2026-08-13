# PMX Composition Contract — Opus 5

**This file is frozen. Only the main agent changes it. If a module needs a change, report it — do not edit.**

Every window concept and every thread concept in this workspace is built against this contract. It is what makes any of the 8 thread concepts mountable inside any of the 8 window concepts (64 pairings).

---

## 0. Vocabulary

- **Window concept** — owns outer chrome, layout, thread-history placement, header-tool placement, work-surface placement, docked/pop-out geometry, and how space yields at 520 px. Owns **no** message rendering.
- **Thread concept** — owns message rendering, turn grouping, hover row, long-message collapse, and the inline treatment of activity, thought, subagent, diff, Goal, Todo, questionnaire, and Lens selection. Owns **no** outer chrome.
- **Region** — a DOM element a window exposes for someone else to render into.
- **Capability** — a named thing a window provides. Threads adapt when a capability is absent.

---

## 1. Registration

```js
PMX.window.register('w1', {
  name: 'Ledger',
  blurb: 'One-line pitch, plain sentence.',
  provides: ['threadHistory', 'workSurfaceHost', 'questionHost'],
  mount(root, ctx) { /* returns WindowInstance */ }
});

PMX.thread.register('t1', {
  name: 'Speaker Turns',
  blurb: 'One-line pitch, plain sentence.',
  wants: ['workSurfaceHost'],
  mount(regionEl, ctx) { /* returns ThreadInstance */ }
});
```

`id` must match the file basename prefix (`w1` → `windows/w1-ledger.js`).
`name` and `blurb` are user-facing prose: no emoji, no underscores, ordinary words.

---

## 2. WindowInstance (returned by `window.mount`)

```js
{
  regions: {
    transcript,        // REQUIRED — thread module mounts here. Must be a scroll container
                       //            or contain one the thread can find via ctx.services.scroll.
    composerHost,      // REQUIRED — shared composer mounts here.
    headerTools,       // REQUIRED — search / lens / context ring / selectors / more mount here.
    overlayRoot,       // REQUIRED — popup manager portals into this. Must not be inside a
                       //            clipping or transformed ancestor.
    threadHistory,     // OPTIONAL — null means the window renders history itself.
    workSurfaceHost,   // OPTIONAL — null means the thread renders work surfaces inline.
    questionHost,      // OPTIONAL — null means the thread renders the questionnaire inline.
    artifactHost       // OPTIONAL — null means the shell's sibling fallback host is used.
  },
  setWidth(px),                    // 520..1200, continuous
  setRail(open),                   // fake application rail open/closed. Independent of width.
  setMount(form),                  // 'docked' | 'popout'
  update(state, changed),          // changed = array of changed store keys
  destroy()                        // remove listeners, observers, timers, portalled nodes
}
```

**Required regions must never be null.** `compose.js` throws if one is missing — that is a mount smoke-test failure.

`data-pmx-window="wN"` is written on the **chat host**, not on the stage. Two things depend on that:
`PMXThreadHistory.resolve()` measures the chat width with `closest('[data-pmx-window]')`, which
measured the whole stage while the attribute sat there; and the application rail, dashboard and title
bar are shell scenery rather than part of the window concept, so the notification boundary
(title bar only) is only structurally assertable once they fall outside the attribute's subtree.
Window CSS is unaffected: every `wN-` element lives inside the chat host.

---

## 3. ThreadInstance (returned by `thread.mount`)

```js
{
  update(state, changed),
  destroy(),
  scrollToMessage(id, opts),   // opts: { highlight:bool, block:'center'|'nearest' }
  getAnchor(),                 // returns an opaque anchor token (see §6)
  setAnchor(token),
  setExpanded(msgId, bool),    // long-message prose expansion
  revealHidden(msgId, range)   // reveal a search hit inside collapsed content
}
```

---

## 4. `ctx` — identical for every module

No module reaches into globals. Everything arrives through `ctx`.

```js
{
  label: 'Opus 5',           // the literal visible model label. Render it.
  windowId, threadId,
  store,                     // see §5
  data,                      // normalized canonical demo data (read-only)
  capabilities,              // { threadHistory:bool, workSurfaceHost:bool, questionHost:bool }
  services: {
    popup, scroll, search, lens, questionnaire, drafts,
    runtime, activity, goals, surfaces, editorHost, motion, icons, toast, listwindow,
    artifacts, threadHistory,
    // packet services — see shared/SERVICES.md
    observable, route, access, bsd, approvals, contextAdmit, threadOps, ops,
    capacity, crew, attach, sync, spell, notify
  }
}
```

### Capability negotiation rule

If `ctx.capabilities.workSurfaceHost` is true, the thread renders Goal/Todo/subagent/diff/activity
into `regions.workSurfaceHost`. If false, it renders them inline in the transcript.
Same for `questionHost` and `threadHistory`. **A thread must work correctly either way.**

---

## 5. Store — the only source of truth

State is never read from the DOM. Geometry changes; semantic state does not.

```
ui:      theme, chatWidth, railOpen, reducedMotion, mount, windowId, threadId
session: activeThreadId, selectors{persona,model,mode,effort,worktree},
         search{query,scope,selectedId,focusId}, threadHistory{query,filter,scrollTop}
view[threadId]: {
  anchor, expanded{msgId:bool}, lens{mode,selection[],applied[]},
  questionnaire{activeId,index,answers,skipped,freeform},
  draft{text,attachments,revisions[]}, surfaces{goalExpanded,todoOpen,subagentOpen,diffOpen,activityOpen},
  thought{keepActiveOpen, expanded{}}, loadedFrom
}
```

API: `store.get(path)`, `store.set(path, value)`, `store.patch(obj)`, `store.subscribe(fn)`,
`store.snapshot()`, `store.rehydrate()`.

`subscribe` receives `(state, changedKeys)`. Modules must be cheap when `changedKeys` does not concern them.

---

## 6. Remount (docked ⇄ pop-out, concept swap)

`compose.js` performs, in order:

1. `anchor = threadInstance.getAnchor()` → write to `store.view[tid].anchor`
2. `threadInstance.destroy()`, `windowInstance.destroy()`
3. rebuild geometry (docked panel vs pop-out surface)
4. `window.mount()`, then `thread.mount(regions.transcript)`
5. restore from store, then `threadInstance.setAnchor(store.view[tid].anchor)`

Because step 1 reads only the store afterwards, **all 11 required state categories survive by
construction**: active thread, scroll anchor, draft + attachments, search query/scope/result/focus,
Lens mode/shaping/selection, questionnaire queue/index/answers/skips/freeform, Goal state +
expansion, Todo/subagent/diff/activity state, selectors, thread-history state, long-message expansion.

Anchor token shape: `{ msgId, offsetWithinMessage }`. Never a raw `scrollTop`.

---

## 7. CSS scoping — enforced by test

- Window CSS lives **only** under `[data-pmx-window="wN"]`. Classes prefixed `wN-`.
- Thread CSS lives **only** under `[data-pmx-thread="tN"]`. Classes prefixed `tN-`.
- Only `shared/*.css` may carry unprefixed rules.
- `tests/suite-policy.js` parses every concept CSS file and **fails any rule outside its own scope.**
- No Shadow DOM (breaks container-scoped `[data-theme]` and the in-page assertion runner).

---

## 8. Non-negotiable rendering rules

Every module obeys these. Each is an automated assertion.

1. **No emoji anywhere.** Interface symbols come from `ctx.services.icons` (inline SVG only).
2. **No colored left-side accent border** as selection, status, or active-state treatment.
3. **Human-readable prose.** No underscored internal enums in visible text. `waiting_for_parent`
   renders as `Waiting for parent`. Underscore allowed only inside a literal file name.
4. **Every scrollable surface** carries `class="pmx-scroll"`. No OS scrollbars.
5. **Hover row is a sibling below the message body**, never a descendant of the bubble:
   `.msg > .msg-body + .msg-hover-row`.
6. **Assistant hover row order:** Copy, Provider, Model, Working/Worked for, More Info.
   **User hover row:** Copy, Edit (only when eligible — absent, not disabled), Provider, Model,
   Working/Worked for, More Info.
7. **No Resend. No per-message Stop.** Stop belongs to the composer.
8. **Exact clock timestamps live in More Info**, not the compact row.
9. **Reasoning effort is reached through Model**, never a fourth peer selector.
10. **All popups go through `ctx.services.popup`** — single-overlay, corner-origin, click-activated.
11. **Every rAF/JS animation checks `ctx.services.motion.reduced()` and jumps to the final state.**
    The CSS `.01ms` override cannot stop a rAF loop.
12. **An indefinite animation is legal only while a live operation backs it.** The element carries
    `data-pmx-op="<id>"` and `ctx.services.observable.isRunning(id)` must be true. A pulse with no
    operation is a claim that something is happening with nothing behind it; the `motion` suite finds
    every infinitely animated element and fails any that is unbacked.

---

## 9. What a module must not do

- Read state from the DOM.
- Touch `document.documentElement` (theme is set on the stage container, not the root).
- Attach `document`-level listeners without removing them in `destroy()`.
- Import another concept's file.
- Depend on any file outside this folder.
- Assume it is the only instance on the page (the contact sheet mounts 8 at once).

## 12. Questions: forms differ, verbs do not

`shared/reveal.js` once owned the whole question choreography through `question(spec)` and
`afterRender(host, svc, tid, from)`. Both are deleted. They are the reason every thread concept's
questionnaire used to look and move identically, and no amount of per-concept CSS could recover the
difference while one function decided the entrance, the advance and the collapse.

What replaced them is a deliberate split:

- **`shared/reveal.js` is materials only** — `stagger`, `clearStagger`, `oneShot`, `springHeight`,
  `measure`, `reject`, `ripple`, `capsule`, `keyFor`, `reduced`, `changed`, `celebrate`. A concept composes
  these in its own order. There is no shared entrance any more, and adding one back is a contract breach.
- **`shared/qflow.js` -> `PMXQFlow` is the verb layer.** It renders nothing and owns no DOM.
  `read(svc, tid)` returns one coherent snapshot per render pass; `act(svc, tid, verb, arg)` covers
  `answer`, `answerAt`, `skip`, `unskip`, `goto`, `prev`, `next`, `submit`, `cancel` and returns
  `{ ok, reason, offenderIndex, resolved }`.

The line between them is what a concept may decide for itself:

| decision | owner |
| --- | --- |
| What the question looks like, where progress sits, how it enters and leaves | **the thread concept** |
| What a verb does to the store, and where a refusal belongs | **`PMXQFlow`** |

Three rules a concept must follow, each of which was a real defect before it was written down:

1. **Ask `PMXQFlow.pending(svc, tid)`, never `view[tid].surfacesYielded`.** Every concept's `update()`
   renders work surfaces before the question, so the flag is one render stale at exactly the moment it is
   read - which paints the whole cluster for a frame and appears to close whatever group the reader had open.
2. **Render a refusal at the field named by `offenderIndex`.** `submit()` reports the first offending
   question; showing its reason under the Submit button is the toast behaviour the packet forbids in
   different clothes. If the offender is a different question, travel to it and carry the reason across the
   one render that takes.
3. **Never reconstruct service keys.** The skip map is keyed by a NUL-delimited composite; ask
   `PMXQuestionnaire.isSkipped(qid, questionId)`. Read resolved flows through
   `PMXQuestionnaire.historyFor(threadId)` rather than reaching into the view slice.

### The yield rule

A pending question hides the **work surfaces** and keeps the **artifact handoff** - the handoff is the
work's product, not a work surface. Advice follows its host: it survives in t1, t3, t4 and t5, which each
give it a surface of its own, and yields with the cluster in t2, t6, t7 and t8, where advice IS a member of
the cluster (a chip in the run, a row in the exec log, a link inside the status card, a gutter dot sharing
the quiet line). Underneath, nothing is discarded: `yieldForQuestion` only flips a flag and
`PMXQFlow.release()` clears it on both submit and cancel, so the cluster returns with its open group intact.

The `forms` suite in `tests/suites.js` asserts all of this, including that no concept renders another
concept's question form.
