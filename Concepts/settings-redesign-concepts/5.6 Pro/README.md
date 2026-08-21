# Puppet Master Assistant Chat 5.6 Pro Concept Lab

This folder is a **drop-in concept implementation** for:

```text
Concepts/settings-redesign-concepts/5.6 Pro/
```

It is intentionally isolated from production PMConcept7. The swappable renderers exist to evaluate and mix treatments before a final assistant design is selected and normalized into canonical Plans.

## Open the concept

Open `index.html` directly in a current Chromium-based browser, or serve the directory with any static file server. The final delivery also includes a self-contained standalone HTML file with CSS, data, audit inventory, and JavaScript inlined.

No package install, network request, provider login, or build process is required.

## Design foundation

Authority for this pass is:

1. Current conversation requirements.
2. The newest attached PMConcept7 Usage build for visual language, motion, interaction patterns, and eight themes.
3. The Dependency Path and Work Correction packet.
4. The original Creative Bakeoff packet.
5. Current live Plans.

The implementation retains PMConcept7’s compact, readable assistant grammar and focuses experimentation on the components that still need a product decision. It does not reuse the failed folio, stage, spine, timeline, architectural-concourse, or other unrelated concept metaphors.

## Concept structure

The lab contains eight curated complete recipes plus seven independently swappable component families, each with eight options:

1. Assistant body and composer
2. Thread history
3. Inline Working Animation
4. Chat Activity Bar
5. Activity Detail
6. Transcript
7. Question and decision surface

Changing a renderer does not reset the active thread, editor tabs, question state, artifact identity, panel widths, or selection state.

## Core review controls

### Concept Mixer

Use the mixer to select a curated recipe or replace any of the seven component families independently. The current combination remains visible so a preferred mix can be reproduced later.

### Demo Studio

Demo Studio exposes deterministic triggers instead of forcing the reviewer to wait for simulated work. The catalog includes:

- every Working Animation state;
- Goal lifecycle states and controls;
- Todo states;
- live, waiting, blocked, and completed subagents;
- exact file changes;
- Plan and Deep Plan creation, revision, approval, cancellation, and later Build;
- questionnaires, queued questions, permission requests, and conflict resolution;
- Mermaid;
- interactive dashboard;
- data explorer;
- architecture map;
- quiz;
- periodic-table capability explorer;
- flowchart;
- interactive chart;
- generated image;
- test evidence and document artifacts;
- context details and compaction states;
- thread-history and panel states.

The browser console also exposes `window.PM56_DEMO` for deterministic inspection. Stable methods include:

```js
PM56_DEMO.listTriggers()
PM56_DEMO.trigger(id)
PM56_DEMO.setTheme(themeId)
PM56_DEMO.setRecipe(recipeId)
PM56_DEMO.setOption(familyId, optionId)
PM56_DEMO.closeAll()
PM56_DEMO.auditInvariants()
```

## Key interaction behavior

### Thread history

- Pinned and visible by default.
- Independently resizable.
- Can be unpinned and reopened as a transient surface.
- Pinned, Recent, and Archived groups.
- Archived search and restore.
- Search-icon-triggered search surface.
- Animated status-to-More transition; row content never depends on hover for visibility.
- Pin, rename, fork, archive, restore, and related row actions.

### Menus and sidecars

All selectors use one collision-aware portal manager. Menus:

- are not clipped by assistant, history, composer, or editor parents;
- flip and clamp to the viewport;
- own internal scrolling at constrained heights;
- restore focus on close;
- use the PMConcept7 spring interaction language;
- keep sidecars mounted alongside the parent menu;
- animate sidecars from the correct lateral origin;
- keep their text and actions inside the usable viewport.

The selector row contains selected names only:

- Persona
- Model
- Mode
- Worktree
- Permissions

The wand contains Goal Mode, Crew, BSD, Context Lens, ELI5, and Thought Stream.

### Model picker

- Configured providers only.
- Favorites-first view.
- All view grouped by provider.
- Provider/account rail with SVG provider identity.
- Search and favorite toggles.
- Effort sidecar.
- Fast control only for supported models.
- Animated Fast indicator beside the selected model.
- No provider CLI installation or unconfigured-provider setup from chat.

### Inline Working Animation

The Working Animation remains inside the transcript and evolves in place through:

- preparing;
- thinking and permitted thought stream;
- file exploration;
- web search;
- web fetch;
- browser control;
- Bash;
- application/program control;
- MCP/tool execution;
- live subagents;
- file editing;
- browser testing;
- program testing;
- compiler/LSP analysis;
- debugging;
- rendering;
- validation;
- permission wait;
- recovery;
- completion.

Active subagents remain visually separate while working. Completed agents fold into the concise work receipt while their read-only threads remain available in the editor.

### Activity Bar and Activity Detail

The bar has five domains:

- Goal
- Todo
- Subagents
- Changes
- Artifacts

Plan is not an Activity Bar domain. A short Plan/Deep Plan summary appears in Activity Detail and opens the full artifact in the editor.

The detail surface can sprout transiently or pin into a real layout column. It has independent width and per-domain content.

### Plans and Deep Plans

A newly created Plan or Deep Plan:

1. opens in the editor;
2. leaves a durable compact card in the transcript;
3. summons Approve And Build, Revise, or Cancel;
4. preserves later View Plan and Build actions if the focused decision is cancelled.

Revise accepts written feedback and creates a visible new revision.

### Questions and decisions

Questionnaires do not passively expire. Close preserves answers, queue position, active question, and composer draft. The user controls the lifecycle through submit, skip, explicit cancel, later return, or thread deletion.

Questions, Plan decisions, permission requests, and conflict-resolution requests share a focused surface host but retain distinct typed behavior.

### Artifacts

Inline and editor-open fixtures include:

- Mermaid source/render;
- interactive visualizer dashboards;
- charts;
- data explorer;
- quiz;
- architecture map;
- periodic table;
- flowchart;
- generated image;
- Plan/Deep Plan;
- document/report;
- test evidence.

Every visual remains registered as an artifact and can reopen in the file editor.

## Themes and responsive review

All component options are themed for the eight current PMConcept7 theme families:

- Puppet Dark
- Midnight
- Graphite
- Ember
- Puppet Light
- Paper
- Glass Dark
- Glass Light

Review narrow, medium, wide, and ultrawide states. Panel pressure intentionally yields transient Activity Detail before crushing transcript readability; thread history becomes a transient overlay at the smallest widths while preserving the pinned-by-default first-use behavior.

## Audit material

`reports/` contains:

- `FINAL_AUDIT.md`
- `STATIC_AUDIT.md`
- `CRITICAL_BROWSER_AUDIT.md`
- `FINAL_BROWSER_CERTIFICATION.md`
- `MOTION_AUDIT.md`
- `PACKET_PLAN_DISPOSITION.md`
- `PLAN_GAPS.md`
- source and assistant-related Plan inventories
- machine-readable JSON results

`evidence/` contains screenshots, menu/sidecar states, trigger states, recipe/theme states, option states, motion recordings, frame-by-frame CSV files, and contact sheets.

The release packaging script is strict: final archive names are created only when the static, rendered-browser, and motion gates pass. The extended exploratory matrix remains included for additional diagnosis.

## Production follow-up

After selecting or mixing the preferred treatments:

1. record the chosen renderer IDs and motion treatments;
2. normalize the stable behavior in `reports/PLAN_GAPS.md` into canonical PlanUnits;
3. update graph/index/shard/evidence governance;
4. implement the selected design in native Rust/Slint;
5. repeat semantic, behavioral, visual, motion, and restoration acceptance on the native slice.

Accessibility is not part of this project’s concept acceptance or bootstrap routing criteria. Existing semantic labels may remain, but no accessibility requirement raises the required frontend agent tier or blocks this concept pass.
