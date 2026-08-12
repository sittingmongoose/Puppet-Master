# Puppet Master Assistant Chat Concept Handoff

## Purpose

This packet gives one design-and-build agent the evidence, fixed behavior, constraints, prototype data, and test contract needed to create a new Assistant Chat concept workspace. It deliberately does **not** prescribe a visual direction, layout, composition, metaphor, typography treatment, surface hierarchy, or original motion choreography.

Each agent is expected to make its own design decisions and produce an independent body of work.

## Assignment per agent

Each of the following agents receives the same packet and works in its own isolated concept folder:

- Qwen 3.8
- Opus 5
- Kimi K3
- Grok 4.5

Each agent produces:

- Eight chat-window concepts.
- Eight chat-thread concepts.
- A concept comparison workspace in which any of that agent's eight thread concepts can be mounted inside any of that agent's eight window concepts.
- A docked and pop-out form using the same semantic state.
- A theme-aware, width-testable, interactive prototype.
- A test and visual-audit report.
- A separate record of newly discovered specification, command, schema, wiring, and DRY Method gaps.

This exercise does not integrate a selected concept into `PMConcept7.html` and does not update canonical Plans.

## Important naming distinction

In this packet, **concept workspace**, **comparison workspace**, **index**, **dashboard**, and **workspace home** refer to the prototype gallery inspired by `Concepts/rail-concepts/`.

They do **not** refer to Puppet Master's actual Home page.

The comparison workspace itself changes with the selected theme and broadcasts that theme to all concepts.

## Source priority

When sources appear to disagree, use this order:

1. Explicit user requirements and supersessions recorded in this packet.
2. Fixed behavior recorded in `01_FIXED_REQUIREMENTS.md` and `machine/requirements.json`.
3. Current canonical Plans.
4. `Concepts/PMConcept7.html` as current concept evidence and interaction reference.
5. External research as neutral observation only.

External examples and both videos are not visual templates. They describe functionality and observed behavior.

## Two-stage use

### Stage 1: Plan Mode

Use the model-specific Plan Mode prompt in `prompts/`. The agent must read, inspect, parallelize analysis with subagents, and return a detailed plan and Todo list. It must not edit, write, generate assets, or begin implementation.

### Stage 2: Build Mode

After Plan Mode is reviewed, continue in the same thread using the model-specific Build Mode prompt. The agent then implements, tests, visually audits, and reports.

## Package map

- `01_FIXED_REQUIREMENTS.md` — complete fixed behavior, constraints, and open design space.
- `02_PLANS_CANON_AND_SUPERSESSIONS.md` — relevant plan ownership, current contracts, conflicts, and user supersessions.
- `03_ACTIVITY_VIDEO_ANALYSIS.md` — frame-state analysis of the compact execution/activity video.
- `04_QUESTIONNAIRE_VIDEO_ANALYSIS.md` — frame-state analysis of the questionnaire video.
- `05_EXTERNAL_CHAT_RESEARCH.md` — neutral synthesis of 31 chat and agent projects.
- `06_EXTERNAL_MOTION_RESEARCH.md` — neutral synthesis of 40 motion sources.
- `07_DEMO_DATA_CONTRACT.md` — shared data and fake-interaction behavior.
- `08_TESTING_AND_VISUAL_AUDIT.md` — required configuration and state coverage.
- `09_LATER_CANON_UPDATE_REGISTER.md` — issues the concept agents must record but must not repair.
- `10_PLAN_MODE_PROMPT_TEMPLATE.md` — generic Plan Mode template.
- `11_BUILD_MODE_PROMPT_TEMPLATE.md` — generic Build Mode template.
- `machine/requirements.json` — machine-readable requirements.
- `machine/testMatrix.json` — machine-readable test matrix.
- `machine/demoData.json` — 15 threads, 400 stored messages, scripted prototype replies, Goals, Todos, questions, subagents, diffs, artifacts, browser state, and draft recovery.
- `machine/relevantPlanUnits.json` — 128 relevant PlanUnits extracted from the supplied canonical index.
- `machine/sourceInventory.json` — internal, external chat, and external motion source inventory.
- `machine/videoTimeline.json` — machine-readable recording timelines.
- `video_reference/` — 0.5-second contact sheets and selected keyframes.
- `prompts/` — model-specific Plan Mode and Build Mode prompts.

## Isolation and ownership

Each agent should work only in its assigned folder:

- `Concepts/chat-assistant-concepts/qwen-3-8/`
- `Concepts/chat-assistant-concepts/opus-5/`
- `Concepts/chat-assistant-concepts/kimi-k3/`
- `Concepts/chat-assistant-concepts/grok-4-5/`

Do not modify:

- `Plans/**`
- `Concepts/PMConcept7.html`
- the UI Command Catalog
- the Wiring Matrix
- DRY Method contracts
- the parallel Usage-page redesign

## Central evaluation question

The prototype must make the human conversation easy to follow in the narrow chat widths most users will use, while keeping Goal state, Todo state, subagent work, diffs, activity, thought streams, questions, search, Context Lens, artifacts, and runtime details available and truthful.
