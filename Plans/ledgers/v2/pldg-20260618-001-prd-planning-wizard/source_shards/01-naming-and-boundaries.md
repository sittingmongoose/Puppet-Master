# Naming, Product Boundaries, and Rejected Legacy Concepts

## SRC-NAMING

This source reconstruction records the accepted naming and product-boundary decisions from the design conversation.

Exact user corrections preserved:
- “Requirements Doc Builder should be called PRD Builder.”
- “Planning Wizard” is the agreed product name.
- Bootstrap material is for building Puppet Master in Codex and is different from the finished product.
- Superseded experimental planning-pipeline work did not succeed and must not become product architecture.

The finished product has two adjacent but distinct surfaces: PRD Builder creates an approved planning-intake PRD Pack; Planning Wizard converts approved intent into implementation-ready Plans and then hands an approved Plan Pack to Plan Compile.

## Accepted obligation inventory

### atom-0001: Rename Requirements Doc Builder to PRD Builder

The finished-product feature formerly called Requirements Doc Builder is named PRD Builder everywhere in user-facing UI and canonical product documentation.

- atom_type: `requirement`
- lane: `naming`
- gui_related: `true`
- exact_tokens: ["PRD Builder", "Requirements Doc Builder"]
- negative_constraints: ["Do not preserve Requirements Doc Builder as a current product feature name except in explicitly historical migration notes."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/FinalGUISpec.md", "Plans/00-plans-index.md"]

### atom-0002: Rename Chain Wizard and Plan Wizard to Planning Wizard

The canonical product name is Planning Wizard; Chain Wizard and Plan Wizard are stale names that must be retired from active product prose, UI, commands, events, and contracts.

- atom_type: `requirement`
- lane: `naming`
- gui_related: `true`
- exact_tokens: ["Planning Wizard", "Chain Wizard", "Plan Wizard"]
- negative_constraints: ["Do not use Chain Wizard or Plan Wizard as current terminology."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FinalGUISpec.md", "Plans/00-plans-index.md"]

### atom-0003: Requirements documents remain a generic input term

Requirements documents means arbitrary user-provided source documents; it is not the feature name and may include PRDs, notes, specifications, tickets, diagrams, and poorly formatted source material.

- atom_type: `requirement`
- lane: `naming`
- gui_related: `false`
- exact_tokens: ["requirements documents", "source documents"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Planning_Wizard.md"]

### atom-0004: PRD Builder and Planning Wizard are separate product stages

PRD Builder captures and normalizes planning-intake product intent; Planning Wizard consumes an approved PRD Pack or normalized requirements input and resolves implementation-ready planning.

- atom_type: `requirement`
- lane: `product_boundary`
- gui_related: `false`
- exact_tokens: ["planning-intake", "Approved PRD Pack", "implementation-ready planning"]
- negative_constraints: ["Do not collapse PRD Builder and Planning Wizard into one indistinguishable interview."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Planning_Wizard.md"]

### atom-0005: Bootstrap workflow is not finished-product runtime

Plans/bootstrap and Codex ledger-transfer workflows are development tooling for building Puppet Master and must remain distinct from the finished PRD Builder, Planning Wizard, Plan Compile, WorkNode, and Orchestrator runtime.

- atom_type: `requirement`
- lane: `product_boundary`
- gui_related: `false`
- exact_tokens: ["bootstrap workflow", "finished product"]
- negative_constraints: ["Do not expose bootstrap/Codex workflow artifacts as ordinary product UX or runtime contracts."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Planning_Wizard.md", "Plans/bootstrap/Bootstrap_Planning_Workflow.md"]

### atom-0006: Exclude superseded legacy planning-pipeline experiments

Superseded legacy planning-pipeline experiments are not an authority, dependency, implementation pattern, or product reference for this redesign; use Goal Runtime, the current v2 ledger, standardized Plan docs, current Auditor loop, and current Plan Compile contracts.

- atom_type: `negative_constraint`
- lane: `product_boundary`
- gui_related: `false`
- exact_tokens: ["Goal Runtime", "v2 ledger", "Auditor"]
- negative_constraints: ["Do not cite, restore, copy, or depend on superseded experimental planning-pipeline stages in canonical product Plans."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Planning_Wizard.md", "Plans/Goal_Runtime_System.md"]
