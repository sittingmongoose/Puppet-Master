# Questionnaire Video: Frame-State Analysis

## Source

- File: `ScreenRecording_07-29-2026 19-42-23_1.mov`
- Duration: approximately 19.83 seconds
- Source dimensions: 1204 × 2492
- Source frame count reported by the container: 1190

Supporting evidence in this packet:

- `video_reference/questionnaire/contact_sheet_0_5s.jpg`
- `video_reference/questionnaire/keyframes/`
- `machine/videoTimeline.json`

The lower host strip containing items resembling Playbooks, Files, Create, and Dismiss appears to belong to the surrounding product. It should not automatically be treated as part of the questionnaire component.

The chronology consolidates unchanged frames. It describes observed behavior, not a required visual design.

## Initial visible structure

The questionnaire container includes:

- A question title.
- Progress shown as `1 of 4`.
- Previous and next navigation controls near progress.
- A close control.
- Four option rows.
- A freeform answer row.
- Skip.
- A primary forward action.

The container is a stable rounded surface during the recording.

## Timeline

### 0.0–6.4 seconds: question one

- The first question remains visible.
- The pointer moves across option rows.
- Rows receive subtle hover or focus emphasis.
- An answer is selected.
- The selected state remains visible.
- The outer container dimensions remain nearly unchanged.

### 6.5–8.0 seconds: question one to question two

- The next control is activated.
- Existing question content briefly clears, fades, or translates.
- The outer card remains in place.
- Question two appears.
- Progress changes to `2 of 4`.
- The first answer remains retained in state.

### 8.1–9.9 seconds: question three

- Navigation advances.
- Progress becomes `3 of 4`.
- The question presents scheduling or time choices.
- The card footprint and major control positions remain stable.

### 10.0–13.3 seconds: backward and forward review

- The user moves backward to question two and question one.
- The user then moves forward again.
- Previously selected answers remain visible.
- Content is replaced inside the same container rather than opening a stack of dialogs.
- The same transition behavior is reused in both directions.

### 13.8–15.8 seconds: question four

- Progress becomes `4 of 4`.
- Duration choices are visible.
- The final primary action appears unavailable before a valid answer is present.
- Skip remains available.

### 16.0–19.83 seconds: backward review from the final question

- The user navigates backward through earlier questions.
- Previously recorded answers remain retained.
- The stable card and transition pattern continue.

## Functionality demonstrated

The recording demonstrates:

- A stable questionnaire footprint.
- Multi-question pagination.
- Explicit progress.
- Backward and forward navigation.
- Answer retention.
- Option rows plus freeform response.
- Skip.
- Completion gating.
- A disabled or unavailable final action before valid completion.
- Content transitions inside one container rather than stacked dialogs.

## Additional lifecycle fixed by the user, not by the video

The production concept requirements add:

- Per-thread questionnaire queues.
- Oldest unresolved first.
- Only one visible at a time.
- Normal composer unavailable while the questionnaire is active.
- State retained across thread switching, restart, crash, pause, and docked/pop-out changes.
- No passive expiration.
- Skip affects only the current question.
- Cancel ends the entire current questionnaire.
- Submit completes the current questionnaire.
- A skipped question can be revisited before submission.
- The next queued questionnaire appears only after the current one resolves.
- Completed or cancelled question history remains inline and may collapse.
- Child-agent questions route through the parent rather than appearing as direct child questions.

## Functionality not established by the recording

The recording does not settle:

- The visual treatment of multiple queued questionnaires.
- Whole-questionnaire Cancel.
- Persistence after restart.
- Historical transcript compaction.
- Required-answer error treatment.
- Relationship to active Goal, Todo, subagent, diff, or activity state.
- Narrow-width presentation.
- Motion under reduced-motion preference.

## Use by concept agents

Treat the video as a functional baseline only. Do not copy its appearance, spacing, type, controls, or transition exactly.
