
## Research Progress - 2026-03-16 - concern-action confirmation and reversibility cluster

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Widget_System.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`
- `Plans/usage-feature.md`
- current ledger concern/action-policy clusters

### Key findings
- Existing docs already imply three distinct action classes, even though they do not name them centrally:
  - low-risk presentation actions may use no confirmation plus short undo windows
  - durable state transitions often require explicit confirmation or explicit rationale
  - destructive or topology-changing actions use stronger gating and are not true undo
- `Widget_System.md` is useful mainly as a negative precedent here:
  - widget removal is intentionally lightweight and reversible via a short local undo window
  - concern actions should NOT inherit that policy because concerns are canonical operational/governance records rather than ephemeral layout state
- `FinalGUISpec.md` reinforces the right asymmetry:
  - delete / rollback / repository creation / permission preset replacement all use confirmations because they create durable or side-effectful changes
  - annotation flow distinguishes runtime-progressed state (`addressed`) from user-controlled semantic closure (`resolved`)
  - dismissible banners are presentation-noise controls, not durable issue-state transitions
- That creates a cleaner concern action split:
  - `acknowledge` is closest to noise-control / ownership-signaling
  - `dismiss` is a durable semantic judgment and must not look like closing a toast
  - `resolve` is not one generic operation; it needs `resolution_kind`
  - `merge` / `split` / `supersede` are structural lineage edits, not ordinary state toggles
- The safest cross-cutting rule is:
  - concern actions never hard-delete canonical concern history in normal operation
  - concern "undo" should generally be implemented as compensating follow-up records (`reopened`, reverse-merge lineage, successor concern, etc.), not history erasure

### Impacted docs
- `Plans/FinalGUISpec.md`
- `Plans/Widget_System.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`
- future concern-specific record/action docs not yet written

### Contradictions / gaps surfaced
- There is still no canonical concern action matrix spanning:
  - confirmation level
  - rationale requirements
  - who may perform the action
  - reversibility model
  - lineage side effects
- Existing UI docs have many local confirmation examples, but nothing yet defines how durable concern actions should differ from:
  - dismissing a banner
  - removing a widget
  - resolving an annotation
  - deleting a file / run / skill
- Concern lifecycle is now fairly clear, but lifecycle alone is not enough:
  - `dismissed` without required rationale will look too much like a convenience close
  - `resolved` without required `resolution_kind` will collapse meaningful semantic differences
  - `merge` / `split` / `supersede` without dedicated action policy will create silent lineage ambiguity
- There is still no explicit rule for whether runtime/overseer actors may directly perform concern-state transitions versus only propose them through linked records.
  - This matters because `acknowledged` is plausibly actor-driven
  - but `dismissed`, manual `accepted_risk`, and some lineage edits likely need tighter authority

### Candidate fixes to carry forward
- Add a canonical concern action policy table with at least:
  - `action`
  - `allowed_actor_kinds`
  - `confirmation_level`
  - `rationale_required`
  - `resulting_status_or_lineage`
  - `reversibility`
  - `audit_fields`
- Recommended default policy:
  - `acknowledge`: confirmation `none`; rationale optional; reversibility `compensating_action_only` via explicit return to `active`
  - `resolve` from a linked canonical fix/recovery/patch outcome: confirmation `none` or `light`; rationale optional if the linked record is sufficient; reversibility `compensating_action_only` via `reopened`
  - `resolve` without linked canonical evidence, including `accepted_risk`: confirmation `strong`; rationale required; reversibility `compensating_action_only`
  - `dismiss`: confirmation `strong`; rationale required; reversibility `compensating_action_only` via explicit `reopened`
  - `reopen`: confirmation `none` or `light`; rationale optional but recommended when reopening a dismissed concern; reversibility `compensating_action_only`
  - `merge` / `split` / `supersede`: confirmation `strong`; rationale required; reversibility `compensating_action_only` through new lineage records, never silent history rewrite
- Reserve `hard_gate` for exceptional concern-affecting operations only:
  - admin repair
  - privacy/redaction paths
  - cross-run or cross-scope lineage rewrites that could materially change audit interpretation
- Treat "quiet" or temporary suppression as UI-notification behavior, not concern dismissal.
  - concern dismissal changes concern meaning/state
  - quieting only changes resurfacing behavior
- Treat `acknowledged` as escalation/noise control and ownership visibility, not semantic closure and not blocker removal by itself

### Do-not-forget details
- concern operations should likely be available from multiple surfaces (`Progress`, `Seams`, `Evidence`, `History`, `Ledger`, graph inspector), so the same action policy must survive different UI densities
- narrow surfaces must not compress `dismissed` and `resolved` into one generic "closed" action
- the audit trail should preserve who acknowledged/dismissed/resolved/reopened and why, even when the visible current state looks simple
- if a concern is currently tied to active blocked status, acknowledgment alone must not clear the block
- structural concern actions (`merge`, `split`, `supersede`) likely need guided flows rather than one-click menus because they change search/history/ledger interpretation

## Research Progress - 2026-03-16 - help system contract and concept-depth cluster

### Targeted docs read
- `Plans/Glossary.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/Personas.md`
- `Plans/Models_System.md`
- current ledger terminology/help clusters

### Key findings
- The app already has a strong authored-copy mechanism for `Expert` vs `ELI5` variants.
  - `FinalGUISpec.md`, `Personas.md`, and `Models_System.md` consistently require dual copy variants for tooltips/help strings
  - this is a copy-depth system, not yet a concept-governance system
- `Glossary.md` is still too small and too pre-rewrite to anchor the newer Orchestrator vocabulary.
  - it covers platform naming and a few shell/runtime terms
  - it does not yet carry the terms that now need stable cross-doc meaning in Orchestrator, Source Control, search, history, ledger, and help
- `Orchestrator_Page.md` and `Run_Graph_View.md` still expose the older execution ontology directly in user-facing labels (`Tiers`, `Phase/Task/Subtask`, `Overseer` wording as foreman shorthand).
  - this is not only a data-model drift problem
  - it is also a help/copy drift problem because the help system has no explicit rule for how legacy labels are retired or translated
- Current docs describe many tooltip-level affordances, but they do not separate:
  - quick inline label help
  - contextual explanation for a surface/object
  - canonical concept definition / glossary entry
- That missing depth model matters more now because several concepts are easy to misuse if reduced to a one-line tooltip:
  - `Feature Seam`
  - `Work Package`
  - `Weak Integration`
  - `Corroboration`
  - `Promotion`
  - `Graph Patch`
  - `historical` vs `superseded` vs `revoked`
  - `requested` vs `effective`
  - `lane` vs `worktree`
  - `History` vs `Ledger`

### Impacted docs
- `Plans/Glossary.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/Widget_System.md`
- future Orchestrator help-entry docs or copy inventories not yet written

### Contradictions / gaps surfaced
- The rewrite now depends on canonical terms that do not yet have canonical glossary ownership.
- The app has tooltip inventories, but not a rule for which concepts deserve:
  - glossary-only treatment
  - contextual help popovers/drawers
  - dedicated help entries
- ELI5/Expert currently risks becoming a synonym generator.
  - the safer rule is: simplify explanation depth, not canonical object names
  - for example, `Feature Seam` should remain the term in both modes even if the ELI5 explanation is plainer
- Narrow surfaces create special pressure:
  - Source Control is compact and worktree-first
  - graph badges / inspector chips are dense
  - small surfaces need compact labels plus deeper linked/contextual help, not renamed local jargon
- There is still no explicit help-linking rule for deep objects.
  - clicking or hovering a term/badge/state should know whether to show a short tooltip, a richer side explanation, or route to a dedicated help entry

### Candidate fixes to carry forward
- Define a three-depth help contract:
  - `inline help`: short tooltip / badge explainer / field helper text
  - `context help`: richer popover, side panel, or surface-local explainer with examples and related concepts
  - `canonical help entry`: dedicated glossary/help article for durable cross-surface concepts
- Add an anti-drift rule:
  - canonical term names do not change between Expert and ELI5
  - only the explanatory copy changes
- Recommended dedicated help-entry set for the rewrite:
  - `Feature Seam`
  - `Work Package`
  - `Package Overseer`
  - `Seam Overseer`
  - `Weak Integration`
  - `Promotion`
  - `Corroboration`
  - `Concern`
  - `Graph Patch`
  - `Graph Generation`
  - `Lane`
  - `requested vs effective`
  - `History vs Ledger`
  - `historical vs superseded vs revoked vs reopened`
- Recommended contextual-help-only set:
  - individual graph badges
  - narrow panel chips
  - trust-state chrome
  - widget-specific filter fields
  - per-surface action gating messages
- Expand `Glossary.md` so it becomes the owner for the stable term list, while longer help entries can explain:
  - why the object exists
  - how it relates to nearby objects
  - common misunderstandings
  - links to related concepts

### Do-not-forget details
- `History` and `Ledger` especially need precise help because they are easy to collapse into one generic “past activity” concept
- `lane` and `worktree` need asymmetric help across surfaces:
  - Orchestrator emphasizes lane as operational object
  - Source Control emphasizes worktree as concrete Git object
- search results, deep links, and inspector panes should reuse the same canonical term labels as help entries
- legacy `tier` wording still present in docs is now both a data-model risk and a user-copy/help migration risk

## Research Progress - 2026-03-16 - widget persistence and filter-boundary cluster

### Targeted docs read
