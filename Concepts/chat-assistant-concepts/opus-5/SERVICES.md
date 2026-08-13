# SERVICES — Opus 5 Assistant Chat concept

Generated from the modules themselves: every global below was read out of `shared/*.js`, so this
file cannot drift from the code without the drift being visible here.

Every module is a `(function (global) { ... })(window)` IIFE exposing one or more globals, bound once
by `PMXWorkspace.boot()` and reached by concepts through `ctx.services.<key>` — never through the
global directly, per CONTRACT.md section 4. None of them touch the DOM outside their own surface.

| module | global | `ctx.services` key | members |
|---|---|---|---|
| `shared/access.js` | `PMXAccess` | `access` | 6 |
| `shared/approvals.js` | `PMXApprovals` | `approvals` | 9 |
| `shared/artifactpanel.js` | `PMXArtifactPanel` | — | 1 |
| `shared/artifacts.js` | `PMXArtifacts` | `artifacts` | 19 |
| `shared/attach.js` | `PMXAttach` | `attach` | 7 |
| `shared/bsd.js` | `PMXBsd` | `bsd` | 14 |
| `shared/compose.js` | `PMXCompose` | — | 1 |
| `shared/composer.js` | `PMXComposer` | — | 4 |
| `shared/contextadmit.js` | `PMXContextAdmit` | `contextAdmit` | 7 |
| `shared/data.js` | `PMXData` | — | 4 |
| `shared/demo.js` | `PMXDemo` | — | 5 |
| `shared/drafts.js` | `PMXDrafts` | `drafts` | 12 |
| `shared/editorhost.js` | `PMXEditorHost` | `editorHost` | 8 |
| `shared/headertools.js` | `PMXHeaderTools` | — | 2 |
| `shared/hoverglow.js` | `PMXHover` | — | 1 |
| `shared/hoverrow.js` | `PMXHoverRow` | — | 2 |
| `shared/hubbridge.js` | `PMXHubBridge` | — | 7 |
| `shared/icons.js` | `PMXIcons` | `icons` | 3 |
| `shared/lens.js` | `PMXLens` | `lens` | 14 |
| `shared/listwindow.js` | `PMXListWindow` | `listwindow` | 1 |
| `shared/moreinfo.js` | `PMXMoreInfo` | — | 2 |
| `shared/motion.js` | `PMXMotion` | `motion` | 24 |
| `shared/notify.js` | `PMXNotify` | `notify` | 8 |
| `shared/observable.js` | `PMXObservable` | `observable` | 17 |
| `shared/opsawareness.js` | `PMXOps` | `ops` | 10 |
| `shared/popup.js` | `PMXPopup` | `popup` | 7 |
| `shared/qflow.js` | `PMXQFlow` | `qflow` | 6 |
| `shared/questionnaire.js` | `PMXQuestionnaire` | `questionnaire` | 26 |
| `shared/reveal.js` | `PMXReveal` | — | 12 |
| `shared/route.js` | `PMXRoute` | `route` | 19 |
| `shared/runtime.js` | `PMXRuntime` | `runtime` | 9 |
| `shared/scroll.js` | `PMXScroll` | `scroll` | 2 |
| `shared/search.js` | `PMXSearch` | `search` | 8 |
| `shared/selectors.js` | `PMXSelectors` | — | 6 |
| `shared/shell.js` | `PMXShell` | — | 3 |
| `shared/spell.js` | `PMXSpell` | `spell` | 12 |
| `shared/store.js` | `PMXStore` | — | 2 |
| `shared/surfaces.js` | `PMXActivity` | `activity` | 3 |
| `shared/surfaces.js` | `PMXCapacity` | `capacity` | 2 |
| `shared/surfaces.js` | `PMXCrew` | `crew` | 5 |
| `shared/surfaces.js` | `PMXGoals` | `goals` | 5 |
| `shared/surfaces.js` | `PMXSurfaces` | `activity` | 13 |
| `shared/sync.js` | `PMXSync` | `sync` | 17 |
| `shared/threadhistory.js` | `PMXThreadHistory` | `threadHistory` | 23 |
| `shared/threadops.js` | `PMXThreadOps` | `threadOps` | 18 |
| `shared/toast.js` | `PMXToast` | `toast` | 2 |
| `shared/util.js` | `PMXUtil` | — | 16 |
| `shared/workspace.js` | `PMXWorkspace` | — | 5 |
| `shared/registry.js` | `PMX.registry`, `PMX.thread`, `PMX.window` | — | window/thread registration |

## Member lists

### `PMXAccess` — `shared/access.js`

The access profile is the authority ceiling for consequential effects. The conversation

`PROFILES`, `bind`, `get`, `set`, `effective`, `toolsFor`

### `PMXApprovals` — `shared/approvals.js`

One compact-decision object for four things that the packet describes separately but which

`bind`, `CLS_RANK`, `KINDS`, `ACTIONS`, `pending`, `raise`, `decide`, `detailsOf`, `clear`

### `PMXArtifactPanel` — `shared/artifactpanel.js`

Global: window.PMXArtifactPanel

`mount`

### `PMXArtifacts` — `shared/artifacts.js`

Global: window.PMXArtifacts -> ctx.services.artifacts

`bind`, `list`, `get`, `open`, `forceReady`, `frame`, `switchTo`, `retry`, `update`, `close`, `isOpen`, `activeId`, `stateOf`, `errorOf`, `scrollTop`, `reset`, `subscribe`, `LOAD_MS`, `UPDATE_MS`

### `PMXAttach` — `shared/attach.js`

The attachment resolver named by 05_ATTACHMENTS_PROVIDER_SETUP_SYNC_AND_NOTIFICATIONS.md:3-36.

`bind`, `resolve`, `route`, `reevaluate`, `of`, `remove`, `FIXTURE_FILES`

### `PMXBsd` — `shared/bsd.js`

Back Seat Driver state, and nothing else. `01_SELECTOR_ACCESS_BSD_AND_WARNINGS.md:75-107` gives

`STATES`, `MODES`, `SCOPES`, `bind`, `mode`, `scope`, `set`, `visualState`, `advice`, `dismiss`, `evaluate`, `noteTurnEnd`, `opId`, `stateLabel`

### `PMXCompose` — `shared/compose.js`

Mounts a (window, thread) pairing into a stage, and performs remounts

`create`

### `PMXComposer` — `shared/composer.js`

Mounted into whatever region the window concept designates, so behaviour is identical

`mount`, `PICKER_FILES`, `QUESTION_HINT`, `STATES`

### `PMXContextAdmit` — `shared/contextadmit.js`

The Context Lens ADMISSION RECEIPT, Compact Now, and prior-chat search.

`bind`, `receipt`, `removeAdmitted`, `compactNow`, `compactReceipt`, `priorChats`, `addPassage`

### `PMXData` — `shared/data.js`

Loads the supplied dataset and merges an additive extension over it.

`load`, `fmt`, `get`, `_normalize`

### `PMXDemo` — `shared/demo.js`

Global: window.PMXDemo

`bind`, `fire`, `families`, `fromHash`, `log`

### `PMXDrafts` — `shared/drafts.js`

Each thread has an independent durable draft: text, attachment references, and revision

`bind`, `get`, `setText`, `addAttachment`, `removeAttachment`, `commitRevision`, `revisions`, `restoreRevision`, `clear`, `archiveOnSend`, `flushAll`, `MAX_REVISIONS`

### `PMXEditorHost` — `shared/editorhost.js`

Routing only. Artifacts and browser previews open in editor tabs; this module never

`openArtifact`, `openBrowser`, `tabs`, `active`, `focus`, `close`, `subscribe`, `reset`

### `PMXHeaderTools` — `shared/headertools.js`

Search, Prior chats, Context Lens, Context ring, Environment, Sync state, More options, then

`mount`, `FOLD_WIDTH`

### `PMXHover` — `shared/hoverglow.js`

Writes --pmx-mx/--pmx-my on row surfaces so the wash in materials.css tracks

`destroy`

### `PMXHoverRow` — `shared/hoverrow.js`

Structural contract (from the Tastebook thread in PMConcept7, and locked by the handoff):

`build`, `copyFull`

### `PMXHubBridge` — `shared/hubbridge.js`

The ConceptHub embed contract. Concepts/ConceptHub/validate.py requires every page it drives in

`install`, `uninstall`, `announceReady`, `isInstalled`, `READY_MESSAGE`, `STATE_MESSAGE`, `WIDTH_MESSAGE`

### `PMXIcons` — `shared/icons.js`

NOTE ON POLICY: this file contains no emoji and no pictographic/emoji

`get`, `has`, `names`

### `PMXLens` — `shared/lens.js`

Mute, Focus, Subcompact, Turn Off. Mute and Focus apply immediately as the selection

`bind`, `attach`, `mode`, `setMode`, `toggleSelect`, `selection`, `isSelected`, `clear`, `apply`, `stateOf`, `rehydrate`, `effectiveHistory`, `remainingBudget`, `MAX_PER_APPLY`

### `PMXListWindow` — `shared/listwindow.js`

A bounded message-window renderer: the smallest thing that makes a ~700

`create`

### `PMXMoreInfo` — `shared/moreinfo.js`

More Info adds EXACT TIME information to the runtime information already shown compactly.

`open`, `build`

### `PMXMotion` — `shared/motion.js`

This file owns the motion VOCABULARY. The eight window concepts and eight thread concepts own the

`reduced`, `onChange`, `snapToEnd`, `collapseTo`, `swapText`, `swapTextInstant`, `enter`, `exit`, `afterTransition`, `supportsInterpolateSize`, `indefinite`, `arrive`, `questionPhase`, `condense`, `phaseStep`, `agentState`, `handoff`, `dockShift`, `panelSwap`, `submenu`, `stateFlip`, `consequence`, `catchUp`, `lineage`

### `PMXNotify` — `shared/notify.js`

THE BOUNDARY IS THE WHOLE POINT.

`MAX_ITEMS`, `bind`, `push`, `items`, `unread`, `markRead`, `open`, `isOpen`

### `PMXObservable` — `shared/observable.js`

The single truthful projection of in-flight work, named by SHARED_PROCESS_RULES.md as the

`STATES`, `bind`, `start`, `step`, `block`, `resume`, `finish`, `fail`, `cancel`, `get`, `active`, `all`, `byKind`, `isRunning`, `elapsedMs`, `subscribe`, `clear`

### `PMXOps` — `shared/opsawareness.js`

THE ONLY HOST AND ENVIRONMENT SURFACE IN CHAT.

`bind`, `conflicts`, `resolve`, `worktrees`, `ports`, `sessions`, `pressure`, `allowance`, `recovery`, `requestWorktree`

### `PMXPopup` — `shared/popup.js`

This motion contract is LOCKED by canon and is not open to redesign:

`attachRoot`, `open`, `close`, `closeAll`, `isOpen`, `current`, `openCount`

### `PMXQFlow` — `shared/qflow.js`

THE ACTION LAYER FOR QUESTIONNAIRES. RENDERS NOTHING. OWNS NO DOM.

`read`, `act`, `pending`, `claim`, `release`, `isAnswered`

### `PMXQuestionnaire` — `shared/questionnaire.js`

Global: window.PMXQuestionnaire -> ctx.services.questionnaire

`attach`, `activeFor`, `queueFor`, `historyFor`, `answer`, `skip`, `unskip`, `isSkipped`, `goTo`, `next`, `prev`, `canSubmit`, `submit`, `finishSubmit`, `cancel`, `prepare`, `settlePhase`, `currentIndex`, `atEnd`, `validate`, `isComposerLocked`, `PREPARE_MS`, `SUBMIT_MS`, `REASON_REQUIRED`, `REASON_CHOOSE_ONE`, `REASON_GONE`

### `PMXReveal` — `shared/reveal.js`

PRIMITIVES ONLY. This file used to own the entire question choreography for all eight thread

`measure`, `springHeight`, `stagger`, `clearStagger`, `oneShot`, `celebrate`, `changed`, `reject`, `ripple`, `capsule`, `keyFor`, `reduced`

### `PMXRoute` — `shared/route.js`

The provider / account / model catalog and the thread-local route state built on it.

`bind`, `providers`, `accounts`, `models`, `routeOf`, `setRoute`, `effort`, `supportsFast`, `effective`, `favorites`, `toggleFavorite`, `recents`, `noteUse`, `setupStateOf`, `setSetupState`, `settingsTarget`, `setupReason`, `SETUP_STATES`, `FAST_UNAVAILABLE_LINE`

### `PMXRuntime` — `shared/runtime.js`

It never interprets the user's text. The typed message is appended exactly as entered, a

`bind`, `send`, `stop`, `isActive`, `liveStatus`, `composerButtonState`, `onTick`, `reset`, `TICK_MS`

### `PMXScroll` — `shared/scroll.js`

Scroll-position service for a transcript container: semantic anchor

`attach`, `resolveScroller`

### `PMXSearch` — `shared/search.js`

There is exactly ONE Assistant Chat search bar. There is no second Context Lens search.

`bind`, `attach`, `index`, `query`, `groupByThread`, `openPopup`, `size`, `isBuilt`

### `PMXSelectors` — `shared/selectors.js`

The visible peer set is Persona, Route, Mode, Access, BSD — plus Worktree and Crew where

`mount`, `PERSONAS`, `MODES`, `WORKTREES`, `SCOPE_HINT`, `BROADEN_QUESTION`

### `PMXShell` — `shared/shell.js`

The fake Puppet Master shell shared by all eight window concepts. It exists only to

`mount`, `RAIL_ITEMS`, `NOT_IN_STUDY`

### `PMXSpell` — `shared/spell.js`

Passive, local, advisory spellcheck for the composer. The packet

`bind`, `check`, `replaceOnce`, `ignoreOnce`, `ignoreForDraft`, `addPersonal`, `addProject`, `canAddProject`, `setSource`, `enabledFor`, `setEnabledFor`, `skipRanges`

### `PMXStore` — `shared/store.js`

One plain object, shallow-diffed change keys, no proxy magic.

`create`, `defaultView`

### `PMXActivity` — `shared/surfaces.js`

Goal, Todo, subagents, diffs, and activity are SEPARATE underlying records even when a

`groupFor`, `stages`, `condenseLabel`

### `PMXCapacity` — `shared/surfaces.js`

Goal, Todo, subagents, diffs, and activity are SEPARATE underlying records even when a

`bind`, `forecast`

### `PMXCrew` — `shared/surfaces.js`

Goal, Todo, subagents, diffs, and activity are SEPARATE underlying records even when a

`bind`, `templates`, `of`, `start`, `stop`

### `PMXGoals` — `shared/surfaces.js`

Goal, Todo, subagents, diffs, and activity are SEPARATE underlying records even when a

`forThread`, `can`, `act`, `phaseOf`, `completionReceipt`

### `PMXSurfaces` — `shared/surfaces.js`

Goal, Todo, subagents, diffs, and activity are SEPARATE underlying records even when a

`bind`, `attach`, `activeFor`, `yieldForQuestion`, `goalFor`, `canAct`, `act`, `phaseOf`, `completionReceipt`, `activityGroupFor`, `activityStages`, `condenseLabel`, `subagentSummary`

### `PMXSync` — `shared/sync.js`

Offline transport, the send outbox, replay, and snapshot catch-up.

`TRANSPORTS`, `DOMAINS`, `STATUSES`, `bind`, `transport`, `domain`, `setTransport`, `setDomain`, `enqueue`, `outbox`, `remove`, `reconnect`, `replayed`, `serverWork`, `addServerWork`, `route`, `snapshot`

### `PMXThreadHistory` — `shared/threadhistory.js`

Mounted ONLY when the window provides a threadHistory region. Some windows own history

`mount`, `statusOf`, `STATUS`, `resolve`, `readState`, `readDensity`, `setState`, `setDensity`, `cycleDensity`, `isOpen`, `DEFAULT_FLOORS`, `registerFloors`, `floorsFor`, `applyTo`, `reasonNode`, `shellOf`, `shellsOf`, `SHELL_FIELDS`, `STATE_KEY`, `DENSITY_KEY`, `togglePin`, `pinButton`, `syncPinButton`

### `PMXThreadOps` — `shared/threadops.js`

The typed thread operations an authorized Assistant agent may perform across threads

`bind`, `related`, `readRange`, `request`, `awaitRequest`, `respond`, `resume`, `spawn`, `branch`, `rewind`, `createRestorePoint`, `restore`, `redirect`, `REQUEST_STATUSES`, `REDIRECT_PHASES`, `MAX_DEPTH`, `MAX_FANOUT`, `MAX_RANGE`

### `PMXToast` — `shared/toast.js`

PMX toast — Opus 5. Transient notice, theme-token styled, reduced-motion aware.

`show`, `clear`

### `PMXUtil` — `shared/util.js`

Small DOM + function-composition helpers used by every window and thread

`el`, `frag`, `on`, `delegate`, `debounce`, `throttle`, `rafBatch`, `esc`, `uid`, `clamp`, `fmtBytes`, `closest`, `setAttrs`, `empty`, `raf2`, `prefersReducedMotionMedia`

### `PMXWorkspace` — `shared/workspace.js`

Drives three surfaces from one implementation, chosen by <body data-pmx-mode>:

`boot`, `ready`, `THEMES`, `PRESETS`, `setPairing`

