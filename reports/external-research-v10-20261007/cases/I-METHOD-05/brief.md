# I-METHOD-05 — Read-only PM shared-buffer and file-integrity review

## User brief

For Puppet Master, I want a research proposal for the shared editor-buffer workflow: a person
opens the same local file in two panes, edits and saves it, and may later recover an unsaved buffer
or encounter a file changed outside the app. Mixed line endings and large/read-only files are part
of the real use case. Research useful implementation mechanisms and failure histories that our
existing wording might not reveal. Compare them with the supplied frozen owner slice and propose
reviewable changes or optional improvements without changing product canon.

## Frozen scope

F-008, F-018, F-020, F-026, F-027, F-028 and F-082 plus the copied definitions/save/text prose. Adjacent FileSafe/LSP/storage/UI owners remain external boundaries; do not claim their absent contracts are defects.

The Rust + Slint desktop direction is a supplied product boundary for this PM slice.
Components are implementation subjects, not a license to resurrect the removed Iced app or
change the native framework. Preserve the owner slice's already-chosen products and modes.

## Complete research and proposal obligation

Research and propose a complete revision to this frozen sandbox plan. Begin open discovery
from the user need, before narrowing to plan comparison; the plan is neither a defect list nor
an exhaustive description of what to investigate. Select public primary sources yourself.
Investigate relevant existing products, analogous approaches, components and implementation
mechanisms; preserve useful negative findings and optional opportunities. The researcher chooses
the consequential component and source versions rather than inheriting an expected recommendation.

Inspect actual public component code at an immutable commit/release, including a governing
definition or caller needed to interpret the behavior. Tie consequential behavior claims to exact
paths/symbols and versions. Investigate a pertinent real issue through fix, regression evidence and
release applicability. If no pertinent issue history can be found, justify an equivalent concrete
implementation evolution using commit/release/test evidence and explain the limits; do not invent
an issue or claim a merged fix is shipped. The chosen component can be an existing plan candidate
or a discovered alternative. Documentation alone cannot replace the code obligation.

Compare the findings with every in-scope plan decision. Distinguish necessary corrections,
supported additions, optional opportunities, product choices, already-covered matters, rejected
leads and unresolved uncertainty. An already-covered disposition needs a precise plan reference
and source-supported applicability. Do not rewrite product constraints merely to fit a component.
Where a cross-reference is absent from the supplied bounded slice, state the dependency and limit
the conclusion rather than infer whole-project coverage.

A flash-family candidate critic must independently check the consequential sources, code/version
applicability, plan comparison and full user scope. The coordinator will prospectively select the
family, stage arrangement and exact artifact handoff. The final must visibly preserve criticism
dispositions, including disagreement or unresolved objections, whether revision is separate or
authored by the critic. No evaluator material is supplied or requested.

Deliver one complete proposed-change artifact: a coherent revised sandbox plan or replacement
sections covering all in-scope decisions, with a concise rationale and evidence references;
alternatives/options and the product decisions still needed; already-covered and rejected
dispositions; candidate criticism and its disposition; concrete validation proposals; and remaining
uncertainty. A list of research leads, a critique alone or a patch outline is incomplete. Distinguish
proposed checks from executed checks and describe what any executed witness actually establishes.
Use one authoritative authored artifact with linked evidence as needed; no four manually
synchronized catalogs are required. Do not claim the application was built or validated.

Compact obligation map (requirements, not an answer key):

| ID | Required work | Where it belongs in the final |
|---|---|---|
| O1 | Brief-led primary-source discovery beyond existing plan entries | Useful supported findings and negative/optional leads |
| O2 | Pinned component code and mechanism with governing context | Versioned behavior evidence and applicability |
| O3 | Pertinent issue/fix/regression/release or justified equivalent history | History evidence, affected conditions and limits |
| O4 | Complete in-scope plan comparison | Exact plan references and change/retain/option/uncertain dispositions |
| O5 | Flash-family substantive criticism | Criticism dispositions retained through finalization |
| O6 | Complete proposed-change artifact | Revised plan/sections, alternatives, already-covered matters, validation and uncertainty |

Research public sources only. Small isolated checks may be proposed or executed within the
coordinator's later authorized sandbox and allowance. Do not operate real infrastructure, upload
private data, contact third parties, change canonical Plans or create WorkNodes. No supplied plan
assumption is a scientific truth or evaluator expectation. The two arms receive identical frozen
inputs and full obligations. This brief specifies neither technique recipe nor family allocation
nor candidate budget; those are locked prospectively by the execution coordinator elsewhere.
