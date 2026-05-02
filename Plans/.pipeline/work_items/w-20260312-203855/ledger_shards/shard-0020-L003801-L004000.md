- Current settings/inheritance may still be shown elsewhere, but must not overwrite history.

### Candidate UI patterns
- In settings rows:
  - primary value + small origin badge
  - expandable disclosure shows full precedence chain
- In inspectors/detail:
  - two-column requested/effective block
  - support-status chips for controls
  - reason text below
- In compact surfaces:
  - only show deltas when there is a difference
  - otherwise keep the line short

### Contradictions / gaps surfaced
- Requested/effective is well defined in runtime docs, but inherited/override presentation is not unified across settings surfaces.
- Manual override lifecycle exists for Persona, but similar presentation rules are less explicit for provider/model/account/worker-policy overrides.
- Without a shared grammar, users will confuse:
  - current settings winner
  - requested run state
  - effective runtime result

### Candidate fixes to carry forward
- Define a shared override-display grammar for all runtime-related settings surfaces.
- Separate `source`, `requested`, and `effective` in UI language and data models.
- Add origin badges / precedence disclosure in Settings.
- Add requested/effective + support-state disclosure blocks in runtime/history surfaces.
- Extend the same model to worker policy, not just provider/model/persona/account.

### Do-not-forget details
- historical run views must stay frozen to historical requested/effective state
- compact surfaces should show deltas only when they matter
- provider-gap disclosure (`honored` / `skipped` / `clamped`) is a third concept, not just another word for override

## Research Progress - 2026-03-16 - Auto Persona Resolution Rules

### Targeted docs read
- `Plans/Personas.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/interview-subagent-integration.md`
- `Plans/Models_System.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/FinalGUISpec.md`

### Key findings
- The global requested-Persona precedence is already strong and should remain the backbone:
  - explicit manual/run override
  - scoped natural-language override
  - surface-specific explicit mapping
  - surface auto resolver candidate
  - config default
  - canonical fallback
- Orchestrator auto mode is already described as producing candidates from:
  - project context
  - language
  - domain
  - framework
  - tier level
  - operation type
- Interview already has a more explicit deterministic stage resolver.
- The remaining gap is mostly for Orchestrator and cross-surface explanation:
  - what exact hints influence auto choice
  - how actor/work-type biases differ
  - how fallback behaves when candidates are unavailable
  - how much of that reasoning is surfaced to the user without dumping internals

### Recommended resolver shape
- Strong recommendation:
  - keep one global precedence chain
  - but require each surface auto resolver to emit a deterministic ranked candidate set plus explanation metadata
- Candidate resolver inputs for Orchestrator should likely include:
  - actor type
    - package overseer
    - seam overseer
    - node worker
    - verifier/reviewer
    - corroborator
    - graph patch planner
    - recovery actor
  - work type / operation type
    - implementation
    - review
    - integration
    - corroboration
    - recovery
    - planning/patching
  - scope level
    - seam
    - package
    - node
    - attempt
  - project hints
    - language(s)
    - framework(s)
    - repo/domain traits
    - GUI-heavy vs backend-heavy vs infra-heavy indicators

### Deterministic input priority direction
- Good input priority inside the auto resolver:
  - hard requirement from plan/tier/surface contract
  - actor-type bias
  - operation-type bias
  - scope-level bias
  - language/framework/domain hints
  - project default tendencies
  - final fallback
- Important rule:
  - actor type and operation type should dominate stack hints
  - example:
    - a reviewer/reviewer-pass should not silently become a coding persona just because the repo is Rust-heavy
    - a seam overseer should not collapse into a narrow implementation persona just because a framework is detected

### Orchestrator-specific direction
- Likely high-level defaults:
  - package overseer
    - execution/governance persona biased toward package-local delivery and readiness truth
  - seam overseer
    - integration/governance persona biased toward cross-package integration truth
  - node worker
    - implementation persona biased by language/framework/work type
  - verifier/reviewer
    - review persona distinct from drafting/implementation persona
  - corroborator
    - review/challenge persona distinct from original claimer
  - recovery actor
    - troubleshooting/recovery persona
  - graph patch planner
    - planning/architecture persona
- The exact persona ids may still evolve, but the mapping policy should be explicit now.

### Fallback direction
- Recommended rule:
  - if the preferred candidate is unavailable after capability/provider/model filtering, fall through deterministically to the next candidate
  - do not block solely because a preferred Persona is unavailable
  - do record:
    - requested Persona
    - effective Persona
    - selection reason
    - skipped Persona controls where relevant
- Only hard requirements should force stronger handling.

### Clarification rule
- Keep the existing Prompt Pipeline rule:
  - if two same-tier candidates remain and the system cannot choose deterministically, ask for clarification rather than speculating
- For Orchestrator specifically:
  - this should probably be rare and usually resolved by actor type + operation type
  - but it is still important for ambiguous user-driven/manual natural-language requests

### Explanation / selection-reason direction
- The auto resolver should emit concise but structured reason text.
- Good explanation pattern:
  - `Package overseer default`
  - `Seam integration default`
  - `Node implementation match: Rust + backend`
  - `Review pass default`
  - `Recovery actor default`
  - `Provider fallback from preferred persona model`
- Recommendation:
  - one short primary reason for compact UI
  - optional expanded explanation listing the strongest contributing hints
- The UI should not expose a noisy “scored all candidates” explanation by default.

### Scope / override lifecycle direction
- Scoped overrides already have strong lifecycle rules:
  - `turn`
  - `session`
  - `run`
  - `task`
  - `subagent`
- Orchestrator work likely needs careful treatment of `task` / `run` / `subagent` scopes so:
  - package-level overrides do not leak across unrelated runs
  - subagent overrides do not accidentally become package defaults
  - historical runs keep their frozen effective Persona state

### Cross-surface consistency direction
- Interview already shows a good pattern:
  - deterministic stage resolver
  - questioning/drafting/review distinction
  - clear bias rules
- Orchestrator should gain the same clarity:
  - implementation
  - review
  - corroboration
  - governance
  - recovery
  - patch planning
- Chat/Interview/Builder/Orchestrator should still share the same effective resolution record and display grammar.

### Contradictions / gaps surfaced
- The global precedence chain is clear, but Orchestrator auto-resolver specifics are still too qualitative.
- Current docs mention project/language/domain/framework/tier/operation inputs but do not fully prioritize them.
- Without a sharper actor-type mapping, `auto` risks feeling arbitrary in the rewrite model where overseer roles are much more important.

### Candidate fixes to carry forward
- Define a deterministic Orchestrator auto-resolver matrix by:
  - actor type
  - operation type
  - scope
  - stack/domain hints
- Require each auto resolver to emit:
