# Shard 027: Bounded Seal Acceptance Addendum - 2026-09-17

Source: `Plans/Planning_Wizard.md`

Source lines: L2490-L2606

Source SHA256: `5673a4149f959c1dd608c94ecdcb4c46d1d339157b66937479bef94ddcd4bfb3`

---

## Bounded Seal Acceptance Addendum - 2026-09-17

This addendum records when a sealed plan is accepted, under `Plans/Decision_Log.md#DL-066`. It
amends the audit and repair loops that `PWIZ-006` and `PWIZ-011` own; it changes no validator,
creates no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files or
production build tasks, and it seals nothing by itself.

A seal is accepted when four things have happened, in order, and not before. The deterministic
checks pass. One scoped review runs, reading the rows the work under review touched together with
the canon needed to judge them, rather than the whole document. One bounded repair round addresses
that review's blocking findings -- the findings carrying `repair_required: true` and
`finding_level: blocker` -- and the repaired plan is sealed again. A re-review limited to the
affected rows, meaning the rows the repair changed and the rows it was supposed to change, finds no
blocking finding.

The repair round is one round. It works from the findings the review that preceded it produced; a
finding raised later belongs to a later review rather than to this one. The affected-rows re-review
exists to catch a repair that did not repair, or that broke something beside what it fixed. It is
not a fresh reading of the plan and it is not an opportunity to open a new subject.

Reviews do not converge, which is why the bound exists. On one arm of the Jev pilot's two-arm trial
a second fresh reviewer raised new should-fix items after the first reviewer's findings had already
been repaired; the repairs were real and so were the new items. The first reviewed seal on the new
harness found four defects, one introduced by the work under review and three already present before
it. A loop that ends when a reviewer stops finding things ends when the reviewers run out, not when
the plan is right.

Findings still standing at acceptance are recorded as open questions on the plan, each carrying its
severity and the citations the reviewer gave it. An open question does not block acceptance. It
stays visible, anyone may pick it up, and a later review that reads the same material and calls it
blocking makes it blocking from that point, which sends the plan round again. Nothing is closed by
being ignored, and no remaining finding is left off the plan.

`PASS_WITH_WARNINGS` remains terminal on the same footing it already had: the findings that make a
cycle `PASS_WITH_WARNINGS` rather than `PASS` are exactly the ones that become recorded open
questions. What this addendum changes is that acceptance no longer waits for a cycle that returns
`PASS`.

### PWIZ-028 - Bounded Acceptance Of A Sealed Plan

```yaml
plan_unit_id: PWIZ-028
unit_type: constraint
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Acceptance of a plan seal is bounded. A seal is accepted when the deterministic checks pass, one
  scoped review has run, one bounded repair round has addressed that review's blocking findings with
  a further seal, and a re-review limited to the affected rows finds no blocking finding. A scoped
  review reads the rows the work under review touched together with the canon needed to judge them,
  not the whole document. A bounded repair round is one round, working from the findings the
  preceding review produced; a finding raised later belongs to a later review. The affected-rows
  re-review covers the rows the repair changed and the rows it was supposed to change, and exists to
  catch a repair that did not repair or that broke something beside what it fixed; it is neither a
  fresh reading of the plan nor an opening for a new subject. Blocking findings are the findings
  carrying repair_required true and finding_level blocker. Findings that remain after the
  affected-rows re-review are recorded as open questions on the plan, each with its severity and its
  citations, and do not block acceptance unless a later review raises one of them to blocking, which
  sends the plan round again. Acceptance never requires a review that returns no findings, never
  proceeds on a review whose blocking findings were not repaired and re-reviewed, and never omits a
  remaining finding from the plan.
gui_related: false
gui_classification_reason: Seal acceptance and review bounding are planning governance timing, not visual presentation.
split_recommended: false
depends_on: [PWIZ-006, PWIZ-011]
unblocks: []
acceptance_criteria:
  - A seal is accepted only after the deterministic checks pass, one scoped review has run, one bounded repair round has addressed that review's blocking findings with a further seal, and an affected-rows re-review finds no blocking finding.
  - The scoped review reads the rows the work under review touched plus the canon needed to judge them, and no reviewer is required to read the whole document to produce it.
  - The repair round is one round, and a finding raised after it is carried to a later review rather than folded into it.
  - The affected-rows re-review covers the rows the repair changed and the rows it was supposed to change, and raises no new subject.
  - Every finding remaining after the affected-rows re-review appears on the plan as an open question carrying its severity and its citations.
  - A recorded open question does not block acceptance, and a later review may raise it to blocking, which returns the plan to the loop.
  - No acceptance waits for a review that returns no findings, and no acceptance proceeds on a review whose blocking findings were not repaired and re-reviewed.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - "python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix"
  - Manual review of the seal record, the scoped review, the repair round and the affected-rows re-review against this unit.
risk_class: unbounded_review_loop_or_suppressed_finding
reasoning_tier: high
context_scope: repo_governance
implementation_surfaces:
  - Plans/Planning_Wizard.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: seal_acceptance_bound
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-066
  - Plans/Planning_Wizard.md#PWIZ-006
  - Plans/Planning_Wizard.md#PWIZ-011
preserved_exact_tokens:
  - deterministic checks
  - scoped review
  - bounded repair round
  - affected rows
  - open questions
  - blocking finding
  - repair_required
  - finding_level
negative_constraints:
  - Do not accept a seal on a review whose blocking findings were not repaired and re-reviewed.
  - Do not withhold a recorded open question from the plan.
  - Do not require a review that returns no findings before a seal may be accepted.
  - Do not widen the affected-rows re-review into a fresh review of the whole plan.
  - Do not fold a finding raised after the repair round into that round instead of carrying it to a later review.
owner_hints:
  - Plans/Planning_Wizard.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
  - Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Plan_Document_System.md
