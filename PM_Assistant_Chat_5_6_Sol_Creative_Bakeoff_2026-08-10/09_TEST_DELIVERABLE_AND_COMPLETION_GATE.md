# Test, Deliverable, and Completion Gate

## Required deliverables

Inside `Concepts/chat-assistant-concepts/5-6-sol/`:

```text
index/comparison workspace
8 Chat-window concepts
8 Chat-thread concepts
64 compatible same-model pairings
concept-hub.json
shared theme/data/test infrastructure
model label on every concept
concept-theses.json
motion-storyboards.md
impact and gap registers
functional test report
visual matrix/contact sheets
```

Use the ConceptHub starter. Set width roles correctly. Run:

```text
python3 Concepts/ConceptHub/validate.py Concepts/chat-assistant-concepts/5-6-sol
```

Use an OS-assigned port (`0`), unique temporary browser profile/output, and never terminate a process you did not start.

## Functional completeness

Every visible control must:

- perform the represented action;
- open a functioning surface;
- or be visibly disabled with a truthful reason.

Hard failures include:

- console-only buttons;
- pin icon without geometry change;
- one question renderer reused across concepts;
- Goal controls that do not mutate fixture state;
- static Todo/subagent/diff/activity controls;
- artifact card that does not open the left workspace;
- empty diff/details surface;
- popup that cannot close;
- loading that never resolves;
- one showcase pairing while other pairings fail;
- duplicate offline sends;
- state leaking between threads;
- hidden or clipped controls.

## Automated pairing test

All 64 window/thread combinations must mount without exceptions, missing required host contracts, horizontal page overflow, or inaccessible composer/transcript.

## Mandatory behavior probes

### Pinned history

Open, peek, pin full, resize to force compact fallback, scroll, switch threads, dock/pop out, open artifact, restore width, unpin. Assert no transcript/composer overlap and a readable Chat floor.

### Questions

Preserve an ordinary draft, trigger prepare/open, answer, navigate back/forward, skip, revisit, exercise a second input type, required-answer error, cancel, retrigger, submit, show receipt/history, recover focus/draft. Repeat narrow and reduced motion.

### Compact work

Start Goal, create Todos, request children, queue capacity, advance search/read/tool/browser/test/edit/diff/verify, expand domains independently, block/recover, complete, condense, reopen evidence.

### Artifact workspace

Generate and open artifact left of Chat, preserve scroll/draft, switch artifacts, load/update/error/retry, pin history simultaneously, close/reopen and restore selection.

### Context and threads

Search current/all threads, exact jump into unloaded history, Mute/Focus/Subcompact, Compact Now, add/remove prior passage, request another thread, await, spawn, branch, rewind, restore, re-answer question sibling.

### Route/access/BSD

Select provider/account/model, effort and Normal/Fast without menu collapse, show requested/effective difference, switch access modes, effective Review limit, BSD scopes/states, compact approval, material route warning and branch choice.

### Attachments and operational awareness

Resolve native/transformed/alternate/unsupported; show cross-project grant, port/worktree conflict, test/debug/log/snapshot detail, provider capacity forecast, and no silent destructive action.

### Offline/server

Queue message offline, close/reopen client, reconnect, replay/snapshot, assert one send and server work continuation. Test domain sync failure separate from transport.

## Visual matrix

Test and record:

```text
8 themes
Reduced motion on/off
Chat widths 520 / 750 / 975 / 1200 and continuous resize
Activity Bar/side panel open/closed and pressure states
History closed/peek/pinned compact/pinned full
Artifact closed/loading/open/error
Chat docked/pop-out
Empty/ordinary/dense/very-long transcript
Goal running/paused/blocked/stopped/complete
Question open/history
Offline/reconnect/snapshot
Representative combined states
```

Every thread concept gets functional narrow and normal testing. Every major surface gets full-theme coverage in representative pairings. Record exact tested combinations and untested combinations.

## Direct visual inspection

Automated DOM checks are insufficient. Inspect rendered frames/contact sheets for:

- clipping and accidental wrapping;
- unreadably narrow conversation;
- nested-container overload;
- popup collision/z-index;
- scroll anchor shifts;
- theme contrast/token drift;
- motion layout instability;
- native scrollbar leakage;
- raw internal labels;
- emoji or colored left-edge accents;
- dead-looking controls;
- shallow demo data.

## Completion report

Report:

```text
files created/changed
8 window theses
8 thread theses
question solution per thread concept
activity/work solution per thread concept
history solution per window concept
artifact relationship per window concept
motion system and reduced-motion result
all demo triggers
functional and visual test commands/results
evidence paths
impact/gap summary
known limitations
```

Do not rank or recommend a winner.
