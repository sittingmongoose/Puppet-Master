# 8. Detailed Demo Content and Interaction Probes

The current concepts do not contain enough realistic activity to judge their behavior, and too many interactions are visual-only. This pass must make the concept workspaces useful as product prototypes rather than screenshot galleries.

# A. Demo-content standard

## Thread inventory

Provide at least 15 credible project threads. They should not all be one-line placeholders. Use varied states such as:

```text
active
waiting for user
Goal running
Goal paused
blocked by approval
subagents working
completed with artifact
failed/retry available
archived
branched
```

Suggested subject matter includes:

- Settings provider manager redesign;
- Chat selector and access-mode work;
- Usage forecast and provider reset;
- MCP server setup;
- LSP or terminal configuration;
- Memory review;
- Persona audit;
- Planning Wizard topic review;
- PRD source extraction;
- worktree collision;
- port conflict;
- browser visual test;
- failed unit test and repair;
- attachment/video route decision;
- generated documentation or UI artifact;
- cross-thread research request;
- Crew review.

Do not use meaningless filler such as repeated “Looks good” messages. Thread titles, previews, timestamps, badges, and status should support the visible story.

## Active-thread depth

The showcase thread must contain enough back-and-forth to exercise scrolling and state continuity. Aim for at least 18 meaningful message/event entries, including:

1. a substantial user request;
2. an assistant acknowledgement or short plan;
3. a triggered question flow;
4. user answers and a durable answer receipt;
5. Goal start;
6. Todo creation;
7. project/thread/history retrieval;
8. grouped file/search/tool activity;
9. a resource or port collision;
10. subagent spawning;
11. at least one child completing and another queued or blocked;
12. a file/diff update;
13. a test or browser verification step;
14. an approval or route warning;
15. a generated artifact;
16. artifact opening in the left workspace;
17. final result summary;
18. follow-up user correction or branch action.

The content should be long enough to prove that pinned history, work surfaces, popups, and artifact panels do not break scrolling or obscure the conversation.

# B. Canonical demo story

Use `DEMO_SCENARIO_MANIFEST.json` and `DEMO_TRIGGER_CONTRACT.json` as portable story/state references. Adapt it to the workspace's existing demo-data format rather than replacing the workspace architecture.

The primary story is a Puppet Master settings/provider redesign task. It was chosen because it naturally exercises:

- Plans and repository reads;
- provider and model research;
- questions;
- Goal Mode;
- Todos;
- multiple agents;
- file edits and diffs;
- tests;
- resource collisions;
- artifacts;
- route and usage warnings.

Concepts may rewrite the prose to fit their style, but they must preserve comparable behavioral coverage.

# C. Demo-control harness

The concept workspace must expose a **review/demo control surface outside the production Chat UI**. It may be a development drawer, host-page panel, URL state selector, or another clearly separated test mechanism.

It must support repeatable controls for:

```text
reset scenario
open/close/pin/unpin history
switch history between full and compact pinned states
trigger next question flow
select/skip/cancel/submit questions
start/pause/resume/update/stop Goal
add/complete/reopen Todo
spawn/advance/complete/fail/stop subagent
advance grouped tool activity
create/update/open diff
open/close/switch left-side artifact
inject approval request
inject cache/provider warning
inject attachment incompatibility
inject worktree/port/test collision
trigger Compact Now
trigger cross-thread request and response
trigger active-turn redirect
set reduced motion
```

This control surface is not part of the proposed product toolbar. It exists so reviewers and automated tests can reliably reproduce states.

The same state must also be reachable through the visible product interaction when that interaction is part of the concept. For example, the demo harness may inject a question, but the user must answer it through the actual concept UI.

# D. Functional behavior requirements

Every visible interactive control in a showcased state must do one of the following:

- perform the represented state change;
- open a functioning menu/dialog/detail surface;
- be visibly disabled with a truthful reason.

The following are failures:

- buttons that only log to the console;
- pin icons that do not change geometry;
- question choices that cannot progress the flow;
- Goal controls that do not change Goal state;
- Todo checkboxes that do not update counts;
- subagent rows that cannot expand or change state;
- artifact cards that do not open the left workspace;
- diff controls that open empty surfaces;
- popups that cannot close;
- fake loading states that never resolve;
- controls that work only in one window/thread showcase pairing.

# E. Mandatory automated probes

Extend the workspace's existing test architecture. Names and implementation can differ, but the following behaviors must be asserted.

## 1. Pinned-history probe

1. Open history.
2. Pin it.
3. Assert visible pinned state and selected-thread state.
4. Assert no intersection with the message viewport or composer.
5. Assert chat width remains above the concept's declared minimum.
6. Scroll the thread and prove history remains pinned.
7. Switch threads and return; pin state persists.
8. Resize normal → narrow → normal; state transitions correctly.
9. Dock/pop out if supported; pin state and geometry remain valid.
10. Unpin; transient close behavior returns.

## 2. Question-flow probe

1. Put a draft in the composer.
2. Trigger a question flow.
3. Assert draft remains intact.
4. Answer the first question.
5. Skip another question.
6. Exercise the second input type.
7. Cancel and assert the entire flow ends cleanly.
8. Trigger again and submit.
9. Assert a durable answer receipt appears.
10. Assert focus and composer draft recover correctly.
11. Repeat under reduced motion and narrow width.

## 3. Compact-work probe

1. Start Goal.
2. Add Todos and update count.
3. Spawn at least two subagents.
4. Advance search/read/tool phases.
5. Create file edits and diff counts.
6. Run a test/verification phase.
7. Assert default compact state does not overwhelm the thread.
8. Expand each domain independently.
9. Assert only the chosen detail expands where the concept promises single-detail behavior.
10. Complete Goal and assert the work condenses into a durable result summary.
11. Reopen a completed phase and inspect its evidence.

## 4. Artifact-workspace probe

1. Trigger artifact generation.
2. Open the artifact from the thread.
3. Assert it appears to the left and outside the message/composer rectangle.
4. Assert chat scroll and draft do not reset.
5. Switch to a second artifact.
6. Exercise loading, ready, update, and error/retry.
7. Pin history simultaneously.
8. Assert history, artifact, and chat are all reachable and do not overlap.
9. Close and reopen the artifact; selection restores.

## 5. General interaction probe

- No uncaught JavaScript errors.
- No missing asset requests caused by the update.
- No focus trap after closing transient UI.
- Escape and outside-click behavior match persistence semantics.
- No body-scroll lock remains after closing a popup.
- No popup opens offscreen.
- No horizontal page scroll at supported sizes.
- No clipped, overlapping, or cutoff text.
- No pointer-capture or resizer remains stuck after release.
- No state leaks from one thread into another.
- No user-visible emoji or colored left accent border.

# F. Visual and motion matrix

Use the workspace's existing matrix, but ensure the new states are covered at:

```text
minimum supported width
normal chat width
wider workspace width
wide/pop-out width
```

Run all eight PM themes and reduced motion according to the existing concept rules. At minimum, every thread concept must be functionally exercised at narrow and normal widths; every major new surface must receive full-theme visual coverage in representative pairings.

Capture evidence for:

- pinned history;
- question open and selected states;
- compact and expanded work states;
- left artifact workspace;
- history plus artifact;
- Goal live and completed;
- reduced motion;
- loading/error states.

# G. Completion report

Report:

```text
files changed
existing bugs fixed
new demo controls
new thread/demo content
question renderer used by each concept
compact-work composition used by each concept
pinned-history solution used by each concept
artifact placement used by each concept
automated tests and exact results
visual matrix/contact-sheet locations
known limitations
canon/command/wiring/DRY/schema impacts
```

Do not claim completion while a required interaction remains static, broken, or implemented in only one showcase concept.
