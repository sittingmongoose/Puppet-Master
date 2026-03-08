## Assistant Planning UX Addendum (2026-03-08)

### 1. Assistant Chat planning controls

Assistant Chat planning controls must expose both **Plan** and **Deep Plan** as chat workflow choices.

Required controls:
- planning-mode selector entry for `Plan`
- planning-mode selector entry for `Deep Plan`
- `Plan Thoroughness (PT)` control visible when either planning overlay is active

PT control contract:
- control type: segmented control, dropdown, or equivalent compact selector
- canonical labels: `Light`, `Balanced`, `Comprehensive`
- default selection: `Balanced`
- Deep Plan and Plan share the same PT labels
- tooltip/help copy must explain that Deep Plan is more intensive than Plan at the same PT

### 2. Plan vs Deep Plan visible behavior

**Plan** UI expectations:
- plan panel remains visible in chat
- panel shows written plan summary + TODO list
- `Open in Editor` is available but not mandatory as the default landing surface

**Deep Plan** UI expectations:
- the resulting plan document opens automatically in an editor / preview-capable document surface
- the document is rendered using the shared markdown/mermaid pipeline
- the source remains canonical markdown / Mermaid text
- if the document is still a non-persisted draft, `open_source` uses a transient `generated://<artifact_id>` buffer

Required visible actions when applicable:
- `Continue Planning`
- `Open in Editor`
- `Execute`
- `Execute with Crew`
- `Queue Execution` (only when another run is active in the same thread)
- `Save As`
- `Use Chain Wizard` / `Add a new Feature or Enhancement` when recommended

### 3. Deep Plan review in editor / Embedded Document Pane

Deep Plan documents reuse the Embedded Document Pane note/revision contract.

Required behavior:
- highlight text -> `Add note`
- note markers in margin + note list/drawer
- `Resubmit with Notes` launches targeted revision for the plan document
- deterministic note re-anchoring after edits
- no silent note loss
- no automatic Multi-Pass Review requirement before plan approval/execution

The plan document may contain:
- headings
- lists / tables
- fenced code blocks
- Mermaid diagrams
- file paths / references
- validation and rollout notes

### 4. Assistant recommendation card for Chain Wizard

When Assistant Chat or Deep Plan recommends the Chain Wizard, show a visible recommendation card rather than silently switching surfaces.

Required card content:
- reason summary (for example: `This looks like a substantial feature/enhancement that would benefit from the interview + orchestrator flow.`)
- primary CTA: `Add a new Feature or Enhancement`
- secondary action: `Stay in Chat` / `Not now`

Optional supporting copy may mention:
- that the interview can prune irrelevant phases automatically
- that imported plan/chat context will be carried into the wizard

### 5. Post-acceptance wizard handoff surface

If the user accepts the recommendation:
- switch to the Chain Wizard / Interview flow
- show a visible imported-context banner (`Imported from Assistant Chat` or `Imported from Deep Plan`)
- show whether a plan artifact was included
- show the imported goal/scope summary

Recommended imported-context panel contents:
- user goal
- scope summary
- included plan yes/no
- open questions count
- `has_gui` hint when known

If a project is already active, the wizard should open on the preloaded feature/enhancement path rather than on a blank intent picker.

### 6. Non-goals

- Do not copy external GUI layout from OpenCode, Cursor, VSCode, or other tools.
- Do not auto-create repo files for planning artifacts without explicit user action.
- Do not silently redirect the user from chat into the wizard.

### 7. Acceptance criteria

- Assistant Chat visibly exposes both Plan and Deep Plan.
- PT is shown for both planning overlays using the canonical labels `Light`, `Balanced`, and `Comprehensive`.
- Deep Plan documents open in a preview-capable editor/document surface and support inline notes plus targeted revision.
- When the wizard is recommended, the user sees an explicit CTA and can decline without leaving chat.
- Accepting the CTA opens the Chain Wizard / Interview flow with visible imported context.
- Planning documents continue to use the shared markdown/mermaid rendering and source-canonical rules already defined elsewhere in the spec.

