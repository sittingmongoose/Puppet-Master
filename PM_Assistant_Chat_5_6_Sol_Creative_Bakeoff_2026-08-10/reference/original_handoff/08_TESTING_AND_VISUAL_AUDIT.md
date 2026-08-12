# Testing and Visual-Audit Contract

## 1. Testing is part of the deliverable

The concepts are interactive prototypes, not static illustrations. Completion requires functional tests, configuration coverage, screenshot evidence, and visual inspection.

Automated overflow checks alone are insufficient. The original rail-concepts work found visually poor states after geometry checks passed. The agent must inspect the rendered results.

Use subagents heavily for test execution and visual review. The main agent reconciles findings and owns the final completion claim.

The machine-readable matrix is in `machine/testMatrix.json`.

## 2. Core configuration matrix

Every core test uses:

### Eight themes

- Friendly Dark
- Friendly Light
- Retro Dark
- Retro Light
- Basic Light
- Basic Dark
- Glass Dark
- Glass Light

### Four Assistant Chat widths

- Minimum: 520 px
- Normal: 750 px
- Wider: 975 px
- Wide: 1200 px

This yields 32 theme-width configurations.

### Fake application rail

Every required configuration is reviewed with the fake left application rail:

- Open.
- Closed.

This creates 64 shell arrangements for each required concept pairing.

### Mounts

- Docked.
- Pop-out.

The mounts share semantic state. The test must exercise the transition between them.

## 3. Concept coverage

### Window concepts

Every one of the eight window concepts is tested with its default thread concept through all 32 theme-width configurations, with the fake application rail open and closed.

Docked and pop-out forms are both exercised.

### Thread concepts

Every one of the eight thread concepts is tested in at least one window concept through all 32 theme-width configurations. Two structurally different host windows are preferable: one that creates greater width pressure and one with a more spacious or different shell.

The thread concepts do not need a full visual audit inside all eight window concepts.

### All 64 pairings

Every one of the 64 within-agent window/thread pairings receives a lightweight automated mount smoke test:

- Module mounts.
- Demo data loads.
- No uncaught console error.
- Required top-level controls remain reachable.

A full manual visual review of all 64 pairings is not required.

## 4. Required feature-state suite

For the selected required host pairing, capture and visually inspect these states in all 32 theme-width configurations:

1. Baseline sustained conversation.
2. Long assistant message collapsed.
3. Long assistant message expanded.
4. Long user message collapsed.
5. Long user message expanded.
6. Active live activity summary.
7. Completed activity history collapsed.
8. Completed activity history expanded.
9. Questionnaire active.
10. Completed or cancelled questionnaire in transcript history.
11. Goal only.
12. Todo only.
13. Subagents only.
14. Diff only.
15. Goal plus Todo.
16. Goal plus Todo plus subagents plus diff.
17. Search with Current Thread selected.
18. Search with All Threads selected.
19. Context Lens selection mode.
20. Context Lens applied state.
21. Active thought stream collapsed.
22. Active thought stream expanded by setting.
23. Agent working with empty composer and Stop visible.
24. Agent working while the user has typed and Send visible.
25. Draft recovery after simulated restart.
26. Artifact shortcut and editor-tab handoff.
27. Exact jump into unloaded older history.
28. State restoration after docked/pop-out change.

The agent may consolidate screenshots when one image proves several states, but the report must map every state to evidence.

## 5. Functional interaction tests

### Message controls

Verify:

- Hover row is beneath the message body.
- Assistant row contains Copy, Provider, Model, duration, and More Info.
- User row contains conditional Edit in addition to the shared information.
- Resend does not appear.
- Stop does not appear under messages.
- More Info includes timestamp.
- Copy returns full content for collapsed messages.

### Long messages

Verify:

- Eligible messages collapse.
- Preview remains useful.
- Expand and collapse work.
- Scroll anchor remains stable.
- Search reveals a hidden match.
- Context Lens targets the canonical complete message.
- Manual state survives a docked/pop-out change.

### Composer

Verify:

- Spellcheck is enabled.
- Empty active composer shows Stop.
- Typing changes Stop to Send.
- Clearing the draft changes it back to Stop while work remains active.
- Send during active work does not trigger Stop.
- Stop interrupts the prewritten response sequence.
- Draft and attachments survive thread switching.
- Simulated restart restores the latest draft.
- Earlier draft revisions are recoverable.

### Search

Verify:

- One search bar only.
- Current Thread is default.
- All Threads groups results by thread.
- Results menu uses the standard popup family.
- Search includes unloaded older content.
- Cross-thread result selection switches threads.
- Exact-message focus works.
- A collapsed hidden-text result is revealed.
- A muted or Subcompacted message remains findable without changing its Lens state.

### Context Lens

Verify:

- Mute, Focus, Subcompact, and Turn Off.
- Multi-message selection.
- Mute and Focus immediate behavior.
- Subcompact explicit Apply.
- Twenty-five-message operation limit.
- State restoration after docked/pop-out change.
- Human search and agent retrieval use their distinct semantics.

### Goal

Verify:

- Goal surface absent when no Goal exists.
- Active Goal remains discoverable.
- View, expand, collapse, edit, pause, resume, stop, clear, tasks, subgoals, and evidence paths.
- Stop and Clear remain distinct.
- Material edit produces visible replan state.
- Exact blocker details appear in blocked state.
- Goal state persists when questions temporarily take visual priority.

### Dynamic work surfaces

Verify every required subset:

- Goal only.
- Todo only.
- Subagents only.
- Diff only.
- Goal plus Todo.
- Several active together.
- All active together.
- Questionnaire temporarily taking priority.

No inactive surface should reserve unnecessary permanent space.

### Questionnaire

Verify:

- Oldest unresolved questionnaire appears first.
- Second questionnaire stays queued.
- Normal composer is unavailable.
- Page navigation retains answers.
- Skip affects one question.
- A skipped question can be revisited.
- Cancel ends the whole current questionnaire.
- Submit completes valid state.
- Required unanswered questions block submission and are identifiable.
- Restart restores the exact unfinished state.
- The next queued questionnaire appears only after the current one resolves.
- Historical record remains inline and can collapse.

### Subagents

Verify:

- Collapsed aggregate counts.
- Active and completed indicators.
- Expanded one-line task and current activity.
- Human-readable statuses.
- Route to full details.
- Historical durability after completion.
- Parent-mediated question state.

### Activity and thoughts

Verify:

- Short current-action summary updates in place.
- Worked timer updates.
- Completed stages condense.
- Historical categories remain inspectable.
- Thought streams are collapsed by default.
- Current permitted thought can remain open by setting.
- It collapses after completion.
- No UI claims access to hidden reasoning.

### Artifacts and browser previews

Verify:

- Inline shortcut remains after opening.
- Editor tab opens.
- No required inline active state.
- Project path is retained.
- File explorer can open the artifact.
- Editor tab remains open when source message is virtualized away.
- Browser preview uses an editor tab.

### Thread history and long thread

Verify:

- At least 15 threads are present.
- Search, selection, pin, rename, archive, delete, export, branch, and restoration functions remain represented where required.
- Long thread renders a bounded viewport.
- Older history can load.
- Scrolling upward prevents forced auto-scroll.
- Jump to latest works.
- Expanding content preserves position.

## 6. Automated assertions

The automated suite must detect at minimum:

- Horizontal overflow.
- Text clipping.
- Unreadably compressed controls.
- Popup clipping by a scrolling ancestor.
- Popup placement outside the viewport.
- Popup hidden behind another layer.
- Operating-system scrollbar leakage.
- Console errors.
- Broken exact-message jump.
- Search missing stored older content.
- Lost scroll anchor.
- Lost state during docked/pop-out change.
- Broken Send/Stop state machine.
- Lost draft after simulated restart.
- Incorrect questionnaire queue order.
- Goal state loss.
- Emoji characters.
- Colored left-side accent-border selectors.
- User-facing underscored status labels.

## 7. Visual inspection criteria

Every screenshot set must be reviewed for:

- Whether the user and assistant exchange can be followed quickly.
- How much useful conversation is visible.
- Whether the narrowest width remains usable.
- Whether nested containment obscures hierarchy.
- Whether metadata competes with prose.
- Whether Goal, Todo, subagent, diff, and activity states collide.
- Whether questions overcrowd the window.
- Whether long-message controls are understandable.
- Whether search focus and Context Lens selection are visible.
- Whether popups feel attached to their triggers.
- Whether transitions cause layout jumps.
- Whether every theme feels complete rather than partially themed.
- Whether reduced motion reaches a stable final state.
- Whether the fake application rail exposes spacing defects.

## 8. Motion verification

For every motion-bearing interaction:

- Run with normal motion.
- Run with reduced motion.
- Check start state.
- Check intermediate clipping and stacking.
- Check final state.
- Check repeated opening and closing.
- Check interruption by another popup.
- Check at Minimum and Wide at a minimum, plus all core 32 configurations where the state is part of the required suite.

## 9. Required evidence output

The completed concept folder must include:

- Automated test results.
- Configuration coverage counts.
- Screenshot or contact-sheet evidence.
- Visual-audit findings and repairs.
- Remaining known issues.
- Mapping from required feature states to evidence.
- List of selected host pairings used for each thread concept.
- All-64-pairing smoke-test result.
- Reduced-motion result.
- Exact commands or steps used to run the workspace and tests.

A passing report must not claim completion merely because the page loads or no overflow is detected.
