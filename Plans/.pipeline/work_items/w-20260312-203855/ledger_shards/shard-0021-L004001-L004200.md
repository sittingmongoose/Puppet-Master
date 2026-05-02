  - ranked candidate(s)
  - winning candidate
  - concise selection reason
  - fallback reason when the preferred candidate is not the effective one
- Keep actor-type defaults stronger than stack hints.
- Reuse the Interview-style deterministic resolver pattern for other surfaces where possible.

### Do-not-forget details
- `auto` must never appear as an opaque state with no resolved Persona/reason.
- historical runs must preserve the resolved effective Persona and reason from the time of execution.
- corroboration/review personas should remain distinct from the original implementation persona whenever possible.

## Research Progress - 2026-03-16 - Help System Contract

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Glossary.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/Personas.md`
- `Plans/Multi-Account.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- The app already has a strong dual-copy rule:
  - app-level `Interaction Mode (Expert/ELI5)` controls authored help/tooltip/interviewer copy
  - chat-level `Chat ELI5` is separate and must not be conflated with app help copy
- The current help/copy contract is mostly tooltip-oriented.
- The rewrite now has enough complex concepts that tooltip-only help will be insufficient.
- At the same time, the canonical model is getting denser, so “simple help” must not mutate the underlying terms or invent alternate semantics.

### Recommended help-system split
- Strong recommendation:
  - distinguish:
    - `canonical term system`
    - `help entry system`
    - `contextual help system`
- Working interpretation:
  - `canonical term system`
    - stable object/state/action names used by docs/runtime/contracts
  - `help entry system`
    - dedicated explainer pages/cards for important concepts
  - `contextual help system`
    - inline tooltips, badges, hover copy, small “what is this?” affordances

### Core help principle
- Simple help must simplify explanation, not rename the model.
- Good rule:
  - keep canonical names stable
  - explain them more simply in ELI5 mode
  - do not create parallel “friendly” object names that drift away from contracts
- Example:
  - keep `Feature Seam`
  - ELI5/help can say “A feature seam is where related packages have to work together cleanly”
  - do not rename it to something unrelated like “Feature group” unless the product explicitly chooses a user-facing alias system later

### Which concepts need dedicated help entries
- Likely dedicated entries:
  - `Feature Seam`
  - `Work Package`
  - `Package Overseer`
  - `Seam Overseer`
  - `Weak Integration`
  - `Promotion`
  - `Corroboration`
  - `Graph Patch`
  - `Reopened`
  - `Revoked`
  - requested vs effective runtime identity
  - safe point vs restore point
  - lane vs worktree
  - concern lifecycle
- Reason:
  - these are core rewrite concepts that will appear in multiple surfaces and cannot be re-explained ad hoc every time

### Which concepts can stay contextual-only
- Good candidates for contextual help only:
  - local button affordances
  - simple counts/badges
  - one-surface-only controls whose meaning is already obvious from context
  - provider-specific caveats shown near the relevant controls

### Help entry structure direction
- Strong recommendation:
  - each dedicated help entry should have a small fixed template
- Good template fields:
  - canonical name
  - short definition
  - why it matters
  - what it is not
  - common related states/actions
  - related concepts
  - surface examples / where you see it
- This matters because many of these concepts are easy to confuse:
  - `lane` vs `worktree`
  - `safe point` vs `restore point`
  - `historical` vs `superseded`
  - `acknowledged` vs `dismissed` vs `resolved`

### Related-concept linking direction
- The help system should explicitly support related links.
- Important related clusters:
  - `Feature Seam` <-> `Work Package` <-> `Weak Integration` <-> `Seam Complete`
  - `Promotion` <-> `Revoked` <-> `Reopened`
  - `Corroboration` <-> `Concern` <-> `Review`
  - `Graph Patch` <-> `Generation Updated` <-> `Historical Path`
  - `Lane` <-> `Worktree` <-> `Cleanup Eligible` <-> `Archived/Removed`
  - `Requested` <-> `Effective` <-> `Skipped/Clamped`

### Expert / ELI5 layering direction
- Recommended rule:
  - expert and ELI5 variants should share the same concept skeleton
  - differ in phrasing density and assumptions, not in substance
- Good difference:
  - Expert:
    - precise, compact, system-model language
  - ELI5:
    - plain-language explanation and one concrete example
- Bad difference:
  - ELI5 introduces weaker or alternate semantics that would mislead about actual behavior

### Surface behavior direction
- `Settings`
  - tooltip/help heavy
  - good place for “what does this setting do?” and “what wins if multiple settings apply?”
- `Orchestrator`
  - concept-heavy contextual help
  - likely needs clickable help affordances on core concepts in `Seams`, `Progress`, and inspectors
- `History` / `Ledger`
  - exact records first, but should still offer concept help links for unfamiliar states/actions

### Glossary implication
- `Plans/Glossary.md` likely needs to become the canonical concept inventory backbone, even if richer help entries live elsewhere.
- Good split:
  - Glossary = canonical short definitions
  - Help entries = fuller explanations with examples and related links

### Contradictions / gaps surfaced
- The current dual-copy contract is strong for tooltip/help text, but not yet for a concept-help system.
- There is no clearly defined “which concepts deserve full help entries” policy yet.
- Without a help-entry contract, complex rewrite terms may end up redefined inconsistently across surfaces.

### Candidate fixes to carry forward
- Define a dedicated help-entry contract with a fixed structure and related-concept links.
- Keep canonical term names stable across Expert and ELI5.
- Use Glossary as the canonical short-definition inventory.
- Explicitly identify which rewrite concepts require full help entries versus contextual help only.

### Do-not-forget details
- app-level Expert/ELI5 remains independent from chat-style simplification
- simple help must not mutate runtime truth or contract semantics
- the more concepts become first-class records/objects, the more important stable related-concept linking becomes

## Research Progress - 2026-03-16 - Projects Page Blocked-Owner / Status Model

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`
- `Plans/usage-feature.md`
- `Plans/Multi-Account.md`

### Key findings
- The current Projects page contract is still fairly basic:
  - project name/path
  - language badges
  - last opened
  - orchestrator status (`idle/running/paused`)
  - health indicator
- Current project health indicators are mostly repo/config existence checks:
  - green = directory exists / repo intact / config valid
  - amber = stale config / missing optional files
  - red = missing directory / corrupt repo / critical config errors
- This is useful, but it does not express the newer operational state model:
  - blocked ownership
  - main reason the project needs attention
  - multi-account pressure
  - active-vs-historical run posture
  - background activity

### Recommended status split
- Strong recommendation:
  - separate:
    - `project health`
    - `project activity`
    - `project attention`
- Working interpretation:
  - `project health`
    - setup/integrity/config viability
  - `project activity`
    - whether runs are active/paused/queued/background
  - `project attention`
    - whether something actually needs user or operator action

### Recommended top-level project card fields
- Likely required fields:
  - project name
  - path
  - language/framework badges
  - activity status
  - attention status
