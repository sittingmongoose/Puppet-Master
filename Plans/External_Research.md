# External Research

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Canonical sole owner of the external research capability: the research pipeline stages and their admitted inputs, the finding classes and the adjudicated union, how research results reach the user as decisions, the landing path for corrections and the wait for capabilities and product choices, research budget accounting and the limits the user sets, review configuration, per-topic latency, adjudication truthfulness, and run provenance. It does not own the chat artifact and decision-card surface (`Plans/assistant-chat-design.md`), the decision record itself (`Plans/Decision_Log.md`), ledger mechanics (`Plans/Planning_Ledger_System.md`), settings storage and inventory (`Plans/Settings_System.md`), usage accounting for ordinary model calls (`Plans/usage-feature.md`), provider routing (`Plans/Models_System.md`, `Plans/CLI_Bridged_Providers.md`), or any owner document the research subject matter happens to touch.

## 0. Scope

### Scope and product model

Puppet Master turns a user's idea, or their incomplete plans, into well-researched coherent plans by running an external research process over the product's own frozen plans and a product brief. The process reads the product's current promises, studies the subject outside those promises, reconciles the two, and returns a small number of classified findings: contradictions inside promises the product already makes, capabilities the product does not yet have, product choices only the user can make, and proposals that are unsupported or already covered.

External Research is a research capability, not an authority. It cannot change a plan, approve anything, or mark work complete. A finding becomes a change to canon only along one of two paths: a correction to an existing promise lands under a standing repair authorization after an independent review, or a capability or product choice waits for the user's answer and enters planning only after the user approves it. Nothing in this owner promises a capability that the September 2026 experiments did not exercise; every stage, bound and reported figure below cites the run that established it.

External Research owns:

- the pipeline stages, their order, and what each stage is allowed to read;
- the frozen-plans snapshot, the product brief, and the rule that no decision, answer or packet may enter a research input;
- the four finding classes, the adjudicated union, and the rule that an adjudicator never adds to the union;
- how a research result becomes a decision packet, delegating the surface to `Plans/assistant-chat-design.md` and the disposition record to `Plans/Decision_Log.md`;
- the landing path for corrections and the wait for capabilities and product choices;
- research budget accounting: captured usage, bounded in-flight allowance, job-end reconciliation from native records, per-job limits as the live bound, unresolved usage kept visible, lifetime caps per arm;
- the limits the user sets on a research topic and where they are stored;
- review configuration: one strong model with a turn budget sized to finish, the optional cheap breadth stage, and admissions as the reported bound;
- per-topic latency: the target, per-stage reporting, and concurrency;
- adjudication truthfulness: source verification of code facts, the same-family caveat, and a receipt per credit;
- run provenance: freeze hashes, runtime identity, output manifests, and quiesced telemetry before hashing.

It does not own:

- the chat artifact, the decision card, its four responses or the questionnaire reuse (`Plans/assistant-chat-design.md`);
- the recorded decision and its disposition (`Plans/Decision_Log.md`);
- ledger records, registry and validation (`Plans/Planning_Ledger_System.md`);
- settings values, inventory rows and their surfaces (`Plans/Settings_System.md`);
- usage capture, attribution and quota semantics for ordinary model calls (`Plans/usage-feature.md`);
- provider selection, capability resolution and CLI bridging (`Plans/Models_System.md`, `Plans/CLI_Bridged_Providers.md`);
- planning-run placement, topics, amendments and Approve And Build (`Plans/Planning_Wizard.md`);
- the subject-matter owners a finding names; a finding is delivered to them, never applied by this owner.

### Requirements for a valid research topic

A research topic requires one exact Project identity, one frozen plans snapshot identified by content hash, and one product brief. Without all three, the topic is unavailable with a typed reason, no research job is admitted, and no partial run is recorded as a result. Host-supplied metadata (identity, timestamps, runtime identity, policy generation) is filled in by the host and is not restated by the model.

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Settings_System.md

## 1. Ownership And Consumers

### Owner map

| Responsibility | Owner |
|---|---|
| Pipeline stages, admitted inputs, finding classes, union discipline, landing path, budget accounting, review configuration, latency, adjudication truthfulness, provenance | `Plans/External_Research.md` (this doc) |
| Decision artifact, one-at-a-time decision cards, the four responses, questionnaire reuse | `Plans/assistant-chat-design.md` |
| The recorded decision, its disposition and its re-ask suppression | `Plans/Decision_Log.md` (`DL-036`, `DL-043`) |
| Ledger records, registry, compile queue and ledger validation for a research landing | `Plans/Planning_Ledger_System.md` |
| Where a research flow sits in a planning run, topics, amendments, Approve And Build | `Plans/Planning_Wizard.md` |
| Research limit values, their inventory rows and their surfaces | `Plans/Settings_System.md` + `Plans/settings_inventory.json` |
| Usage capture, attribution, occupancy versus cumulative, quota | `Plans/usage-feature.md` |
| Model selection, effort, capability resolution, provider routing | `Plans/Models_System.md`, `Plans/CLI_Bridged_Providers.md` |
| Typed envelopes and shared contract conventions | `Plans/Contracts_V0.md` |
| Static contract-fixture validation family | `Plans/Automated_Testing_System.md` |
| Secret redaction and artifact sensitivity before any research artifact is written | `Plans/FileSafe.md` |
| Permission decisions and restriction propagation over research artifacts | `Plans/Permissions_System.md` |
| Physical persistence and retention of research artifacts | `Plans/storage-plan.md` |
| Visible presentation of research status and results | `Plans/FinalGUISpec.md` |
| Commands and wiring for research actions | `Plans/UI_Command_Catalog.md`, `Plans/UI_Wiring_Rules.md` |

### Consumers

Consumers that read research state through this owner's contracts: `Plans/assistant-chat-design.md` (packet artifact and decision cards), `Plans/Planning_Ledger_System.md` (the landing ledger for a research wave), `Plans/Settings_System.md` (the limits the user sets), `Plans/Planning_Wizard.md` (placement in a planning run), `Plans/Decision_Log.md` (dispositions), `Plans/usage-feature.md` (research spend within overall usage), `Plans/Automated_Testing_System.md` (static contract validation), and each subject-matter owner a finding names, which receives the finding and keeps its own gate.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Settings_System.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Contracts_V0.md

## 2. Canonical PlanUnits

### ERS-001 - External Research Ownership And Authority

```yaml
plan_unit_id: ERS-001
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "Plans/External_Research.md is the sole semantic owner of the external research capability: pipeline stages and admitted inputs, finding classes and the adjudicated union, how findings reach the user, the landing path for corrections and the wait for capabilities and product choices, budget accounting and user-set limits, review configuration, latency, adjudication truthfulness and run provenance. Research is a capability, never an authority: it cannot approve, verify, complete, schedule or land anything, and a finding changes canon only through a correction landing or an approved user decision. The decision surface is owned by assistant-chat-design, the recorded decision by Decision_Log, ledger mechanics by Planning_Ledger_System, limit values by Settings_System, usage semantics by usage-feature, and every subject-matter obligation by the owner the finding names."
gui_related: false
gui_classification_reason: Ownership and authority boundaries are runtime-agnostic specification; the user-visible research surfaces are specified in their UI owners.
split_recommended: false
depends_on: [DL-036, PDS-003]
unblocks: [ERS-002, ERS-003, ERS-004, ERS-005, ERS-006, ERS-007, ERS-008, ERS-009, ERS-010, ERS-011, ERS-012, ERS-013, ERS-014]
acceptance_criteria:
  - The doc defines the research pipeline, its classes, its bounds and its provenance without duplicating any existing owner's contract.
  - Every research consumer contract points here for semantics and to its own owner for mechanics.
  - No parallel decision recorder, ledger engine, usage ledger, settings store or subject-matter authority is created.
  - No research output is admissible as approval, verification, completion or authorization anywhere in the product.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: owner_drift
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/assistant-chat-design.md
  - Plans/Planning_Ledger_System.md
  - Plans/Settings_System.md
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/jujutsu-research-2026-09-11/README.md
  - reports/jujutsu-research-2026-09-11/continuation3/final/README.md
  - Plans/Decision_Log.md:DL-036
preserved_exact_tokens: ["external research", "finding", "union", "correction", "capability", "product choice"]
negative_constraints:
  - Do not create a second research, adjudication or finding authority in any other Plans doc.
  - Do not let a research finding approve, verify, complete, schedule or land anything.
  - Do not restate the decision-card contract, the ledger record contract or any settings row here.
owner_hints: [Plans/External_Research.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md, ContractName:Plans/Planning_Ledger_System.md

### ERS-002 - Pipeline Stages And Their Order

```yaml
plan_unit_id: ERS-002
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "An external research topic runs five research stages in order - discovery from the product brief, implementation study, history study, reconciliation against the frozen plans snapshot (`reconcile`), and comparison producing findings (`compare`) - followed by blind adjudication against a union, an independent review, and landing through a ledger. Discovery admits leads; implementation and history study admitted leads; reconciliation reads the frozen plans snapshot for the first time; comparison emits classified findings with the passages they cite. A stage that is not reached is unknown, never a negative finding, and a lead that no study or comparison job reached is reported as unreached rather than as absent evidence."
gui_related: false
gui_classification_reason: Stage order and admission are process specification; stage progress display belongs to the UI owners.
split_recommended: false
depends_on: [ERS-001]
unblocks: [ERS-003, ERS-004, ERS-012]
acceptance_criteria:
  - The five research stages run in the stated order and each stage records which leads it admitted.
  - Reconciliation is the first stage that reads the frozen plans snapshot.
  - Comparison output carries a class and at least one cited passage per finding.
  - Unreached leads and unperformed stages are reported as unknown, never as a finding of absence.
  - Adjudication, independent review and ledger landing follow the research stages and are separate from them.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: process_drift
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/external_research_contracts.schema.json
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation3/final/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md
preserved_exact_tokens: ["discovery", "implementation", "history", "reconcile", "compare", "adjudication", "independent review"]
negative_constraints:
  - Do not let reconciliation or comparison run before discovery has admitted leads.
  - Do not report an unreached lead as an absence of evidence.
  - Do not merge adjudication into a research stage or let a research stage score itself.
owner_hints: [Plans/External_Research.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Contracts_V0.md

### ERS-003 - Research Inputs And The Decision Leakage Boundary

```yaml
plan_unit_id: ERS-003
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "A research job admits exactly three input classes: the frozen plans snapshot identified by content hash, the product brief, and the job's own arm artifacts from earlier stages of the same topic. Recorded decisions, answered packets, decision sheets and any other record of what the user already chose are excluded from every research input, so a finding can never be an echo of an answer the product already holds. The frozen snapshot enters at reconciliation; discovery and the studies see the brief and their own artifacts only. Every input is recorded by path and SHA-256 in the run manifest, and a job whose declared inputs do not hash to the recorded values fails closed before dispatch."
gui_related: false
gui_classification_reason: Input admission and hashing are process and contract specification with no user-visible surface of their own.
split_recommended: false
depends_on: [ERS-002]
unblocks: [ERS-004, ERS-013, ERS-014]
acceptance_criteria:
  - A research job admits only the frozen plans snapshot, the product brief and its own arm artifacts.
  - No decision record, answered packet or decision sheet is readable from any research stage.
  - The frozen plans snapshot is admitted no earlier than reconciliation.
  - Every admitted input appears in the run manifest by path and SHA-256, and a hash disagreement stops the job before dispatch.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: research_input_leakage
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/external_research_contracts.schema.json
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation3/gate/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md
preserved_exact_tokens: ["frozen plans snapshot", "product brief", "arm artifacts", "fails closed"]
negative_constraints:
  - Do not admit a decision log, answer sheet or decision packet into any research stage.
  - Do not admit an unhashed or unrecorded input.
  - Do not let a research stage read another arm's artifacts.
owner_hints: [Plans/External_Research.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Decision_Log.md

### ERS-004 - Finding Classes And The Adjudicated Union

```yaml
plan_unit_id: ERS-004
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "Every research finding carries exactly one class: correction, a contradiction inside a promise the product already makes; capability, something the product does not yet do; product choice, a decision only the user can make; or unsupported_or_covered - in ordinary words, unsupported or already-covered - a proposal the product already owns or the evidence does not support. A topic's findings are adjudicated into one union, and a finding is credited to an arm only when a delivered assertion states the same proposition and cites the passage that supports it; a partial match is recorded as partial and never as a credit. A proposition outside the union is recorded as a candidate with its evidence, its classification and an explicit check against the expansions the union already rejected; adding a candidate to the union is the union owner's act, never the adjudicator's. unsupported_or_covered is a class of the union, not a false-positive rate."
gui_related: false
gui_classification_reason: Classification and union discipline are process semantics; how a class is labelled on screen belongs to the UI owners.
split_recommended: false
depends_on: [ERS-002, ERS-003]
unblocks: [ERS-005, ERS-006, ERS-007, ERS-013]
acceptance_criteria:
  - Every finding carries exactly one of correction, capability, product_choice or unsupported_or_covered.
  - A credit requires a delivered assertion stating the same proposition with a cited passage; partial matches are recorded separately.
  - An out-of-union proposition is recorded as a candidate with evidence, classification and a rejection check, and is not added to the union.
  - The unsupported_or_covered count is never reported as a false-positive rate.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: finding_classification_drift
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/external_research_contracts.schema.json
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation3/final/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/consolidated-candidates.json
preserved_exact_tokens: ["correction", "capability", "product choice", "unsupported or already-covered", "candidate", "union"]
negative_constraints:
  - Do not let an adjudicator add a proposition to the union.
  - Do not credit a finding without a cited passage stating the same proposition.
  - Do not report unsupported-or-covered counts as a false-positive rate or as a model ranking.
owner_hints: [Plans/External_Research.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Contracts_V0.md

### ERS-005 - Findings Reach The User As Decision Packets

```yaml
plan_unit_id: ERS-005
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "Research findings that need the user's answer are delivered as a decision packet under DL-036. This owner fills in DL-036's plain-language decision form for each item and adds what is research-specific: the union finding the item derives from, that finding's class, and the passages the finding cites. The form itself, the card contract, the response set, the artifact behaviour and the questionnaire reuse are owned by Decision_Log DL-036 and assistant-chat-design and are referenced here, never restated; the disposition record is owned by Decision_Log. A packet item is derived from exactly one union finding of class capability or product_choice."
gui_related: true
gui_classification_reason: The packet and its cards are user-visible chat content produced by this owner, even though the surface contract is owned elsewhere.
split_recommended: false
depends_on: [ERS-004, DL-036]
unblocks: [ERS-007]
acceptance_criteria:
  - Each packet item carries DL-036's decision form, filled in by this owner, plus its finding reference, class and cited passages.
  - Each packet item derives from exactly one union finding classed capability or product_choice.
  - The decision form, the card contract, the four responses, the artifact behaviour and the questionnaire reuse are referenced to DL-036 and assistant-chat-design, and no field list of theirs is reproduced here.
  - Status and disposition use text labels; no colored border bars or stripes and no emoji glyphs are produced by this owner.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: decision_review_flow_drift
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/assistant-chat-design.md
  - Plans/external_research_contracts.schema.json
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md:DL-036
  - Plans/Decision_Log.md:DL-043
  - reports/jujutsu-research-2026-09-11/d5/README.md
preserved_exact_tokens: ["decision packet", "product_choice", "text labels"]
negative_constraints:
  - Do not restate or vary the decision-card contract, its response set or the questionnaire reuse.
  - Do not auto-approve, auto-deny or answer a card on the user's behalf.
  - Do not use colored border bars, stripes or emoji glyphs in packet content.
  - Do not put a correction-class finding in a decision packet.
owner_hints: [Plans/External_Research.md, Plans/assistant-chat-design.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md

### ERS-006 - Correction Landing Under Standing Repair Authorization

```yaml
plan_unit_id: ERS-006
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "A finding classed correction lands without a new user decision, under the standing repair authorization, and only after three gates in order: a currentness re-check that re-reads every cited passage against live canon and re-adjudicates any passage that moved since the frozen snapshot; an independent review by an agent that ran no research job and scored no arm, whose verdict is recorded with the commit it reviewed; and a ledger that carries the correction, its evidence by path and SHA-256, and the owner PlanUnits it compiled to. A correction that a currentness re-check finds already covered is dropped with that reason recorded rather than landed. Where an obligation cannot be expressed in the contract surface, it lands as an owner obligation and the owner's validation_surfaces says so."
gui_related: false
gui_classification_reason: The landing path is a process and governance obligation with no user-visible surface of its own.
split_recommended: false
depends_on: [ERS-004]
unblocks: [ERS-007]
acceptance_criteria:
  - A correction lands only after a recorded currentness re-check, a recorded independent review by an agent that ran and scored no arm, and a registered ledger.
  - Every landed correction names its evidence by path and SHA-256 and the owner PlanUnits it compiled to.
  - A correction already covered in live canon is dropped with the reason recorded, not landed.
  - An obligation with no contract surface is landed as an owner obligation and disclosed in validation_surfaces.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-new-contracts-verify.py
risk_class: unreviewed_canon_change
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/Planning_Ledger_System.md
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md:DL-043
  - reports/jujutsu-research-2026-09-11/continuation3-landing/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md
preserved_exact_tokens: ["standing repair authorization", "currentness", "independent review", "ledger"]
negative_constraints:
  - Do not land a correction without a currentness re-check against live canon.
  - Do not accept a review by an agent that ran or scored any arm of the same topic.
  - Do not land a correction that live canon already covers.
  - Do not treat a static contract landing as runtime, security, performance or readiness evidence.
owner_hints: [Plans/External_Research.md, Plans/Planning_Ledger_System.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Decision_Log.md

### ERS-007 - Capabilities And Product Choices Wait For The User

```yaml
plan_unit_id: ERS-007
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "A finding classed capability or product_choice never lands under the repair authorization. It waits in a decision packet until the user answers it, and an approved answer makes the item accepted for planning as PlanUnits under the owners the finding names; execution follows the existing Approve And Build path. A denied or unanswered item changes no canon and is recorded so the same question is not asked again. An out-of-union candidate is not a packet item until the union owner admits it as a finding. A capability that the user has not approved may be described in an owner document only as a deferred or unapproved optional capability, never as a promise."
gui_related: false
gui_classification_reason: The wait rule is a process obligation; its user-visible expression is the decision card owned by assistant-chat-design.
split_recommended: false
depends_on: [ERS-004, ERS-005, ERS-006]
unblocks: []
acceptance_criteria:
  - No capability or product-choice finding changes canon before the user answers it.
  - An approved item authorizes planning under the named owners only; execution follows Approve And Build.
  - Denied and unanswered dispositions are recorded and suppress re-asking.
  - An out-of-union candidate is not presented as a packet item until the union owner admits it.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py
risk_class: unapproved_scope_expansion
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/Decision_Log.md
  - Plans/Planning_Wizard.md
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md:DL-043
  - reports/jujutsu-research-2026-09-11/continuation3-landing/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/consolidated-candidates.json
preserved_exact_tokens: ["accepted for planning", "unapproved optional capability", "Approve And Build"]
negative_constraints:
  - Do not land a capability or product choice under the repair authorization.
  - Do not describe an unapproved capability as a product promise.
  - Do not re-ask an item that already carries a disposition.
owner_hints: [Plans/External_Research.md, Plans/Decision_Log.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Decision_Log.md, ContractName:Plans/Planning_Wizard.md

### ERS-008 - Research Budget Accounting

```yaml
plan_unit_id: ERS-008
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "Research admission checks captured usage plus a bounded in-flight allowance plus retained unresolved charges against the arm's lifetime cap, before every model request. The in-flight allowance for a stage is that arm and stage's observed per-job average once two same-arm same-stage jobs have fully reconciled, and a fixed cold allowance before that. At job end, the runtime's own native usage records determine captured valuation; a terminal job that produced no complete native records retains its cold allowance as a separate unresolved charge that counts against the cap indefinitely and stays visible in every report. Captured usage is an upper-bound estimate, never a billed amount or a certified liability, and a runtime that reports no per-run cost is priced from its native per-response records at the published tariff, floored so captured usage is never recorded as zero."
gui_related: false
gui_classification_reason: Accounting semantics are specification; the usage surfaces that display them are owned by usage-feature and the UI owners.
split_recommended: false
depends_on: [ERS-002]
unblocks: [ERS-009]
acceptance_criteria:
  - Admission compares captured usage plus in-flight allowance plus unresolved charges against the lifetime cap before every model request.
  - A stage allowance switches from the cold allowance to the observed same-arm same-stage average only after two fully reconciled jobs.
  - Job-end valuation comes from native usage records, and an unreconciled terminal job retains a separate unresolved charge that remains visible.
  - Captured usage is labelled an estimate and is never presented as a billed amount or a certified total liability.
  - A response that has already happened is always recorded; only the next one can be denied.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: budget_accounting_defect
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/external_research_contracts.schema.json
  - Plans/usage-feature.md
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation3/gate/cost-policy.json
  - reports/jujutsu-research-2026-09-11/continuation3/gate/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/corrections.json
  - reports/jujutsu-research-2026-09-11/continuation4/README.md
preserved_exact_tokens: ["captured usage", "unresolved", "lifetime cap", "job-end", "native records"]
negative_constraints:
  - Do not present captured usage as a billed cash amount or a certified spend bound.
  - Do not drop an unresolved charge from a report once it has been retained.
  - Do not deny a response that already happened, and do not let job-end receipts outnumber the durable request count.
  - Do not count a runtime's stream blocks as model responses.
owner_hints: [Plans/External_Research.md, Plans/usage-feature.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md

### ERS-009 - The Limits The User Sets On A Research Topic

```yaml
plan_unit_id: ERS-009
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "The user sets four research limits: a per-topic cost cap, per-job limits on model responses and wall seconds, a lifetime cap per arm, and whether unresolved usage blocks further admission or only stays visible. The per-job limits are the live bound in practice: they, not the cost cap, are what ends a job that does not finish. In continuation 4 of the Jujutsu research they ended 33 of 80 jobs, 47 finished, and the cost cap ended none. Every limit is a Project-scoped settings value owned by Settings_System and its inventory; this owner fixes their meaning, their defaults and the rule that a job reports which limit ended it. A job's terminal record names in `bound_by` the limit that bound it, read from the runtime's own result record and the durable meter rather than from an adapter label, because an adapter may report any denial as a budget denial when the cause was the response ceiling."
gui_related: false
gui_classification_reason: Limit semantics are specification; the settings rows and their controls are owned by Settings_System and FinalGUI.
split_recommended: false
depends_on: [ERS-008]
unblocks: [ERS-010, ERS-012]
acceptance_criteria:
  - A research topic carries a per-topic cost cap, per-job response and time limits, a lifetime cap per arm, and an unresolved-usage disposition.
  - Every job's terminal record names the limit that bound it, derived from the runtime result record and the durable meter, not from an adapter label alone.
  - The limits are Project-scoped settings values registered by Settings_System, not values stored by this owner.
  - A response ceiling is read as at most N admitted with one response possibly already in flight.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: limit_misreporting
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/Settings_System.md
  - Plans/external_research_contracts.schema.json
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation3/gate/cost-policy.json
  - reports/jujutsu-research-2026-09-11/continuation4/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/corrections.json
preserved_exact_tokens: ["bound_by", "per-job limit", "lifetime cap", "unresolved usage"]
negative_constraints:
  - Do not report an adapter's generic budget label as the limit that bound a job.
  - Do not store research limit values outside the Settings owner.
  - Do not treat a per-job response ceiling as an exact count of responses produced.
owner_hints: [Plans/External_Research.md, Plans/Settings_System.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Settings_System.md

### ERS-010 - Review Configuration And The Turn Budget

```yaml
plan_unit_id: ERS-010
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "A topic's review stage runs one strong model with a turn budget sized to finish every job, because on identical inputs review models differ mainly in depth rather than in kind, which ERS-011's breadth measurement qualifies at the margin, and a turn-capped arm reports a ceiling, not a judgement. The measured basis is continuation 4: on one frozen case, an arm capped at 40 responses per job stopped 11 of its 12 jobs at the ceiling and reached 18 of the 110-finding union, while its own control - identical inputs, model, effort, admissions, workers and batching at a 160-response ceiling - finished all 12 jobs using 37 to 110 responses per job and reached 45, with the capped arm's findings a proper subset of the control's. A turn-capped arm's recall is never quoted as a model result, and its cost and duration are not comparable with an uncapped arm's. Admissions, not money or wall time, are the reported bound on recall, and the number of admitted leads is reported with every recall figure."
gui_related: false
gui_classification_reason: Review configuration is process specification; its reported figures appear through the research reporting surfaces owned elsewhere.
split_recommended: false
depends_on: [ERS-009]
unblocks: [ERS-011, ERS-013]
acceptance_criteria:
  - The review stage runs one strong model with a turn budget sized so every job reaches a designed stop rather than a response ceiling.
  - A job stopped by its response ceiling is reported as turn-capped and its recall is not quoted as a model result.
  - Recall is reported with the admitted-lead count that bounded it.
  - Capped and uncapped arms are never compared on cost or duration.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: review_configuration_drift
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/external_research_contracts.schema.json
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/README.md
  - PM-Experiments/research-audit-native-20260907/process-pilot-20260908/REVIEW_ADJUDICATION_20260916.md
preserved_exact_tokens: ["turn budget", "response ceiling", "turn-capped", "admissions", "proper subset"]
negative_constraints:
  - Do not quote a turn-capped arm's recall as a model quality result.
  - Do not compare cost or duration across arms that ran under different ceilings.
  - Do not report recall without the admitted-lead count that bounded it.
  - Do not generalize a single frozen case into a model ranking.
owner_hints: [Plans/External_Research.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Models_System.md

### ERS-011 - Optional Cheap Breadth Stage

```yaml
plan_unit_id: ERS-011
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "A topic may add an optional breadth stage on a cheap model alongside the strong review, for coverage the strong arm may not reach. Continuation 4 measured this on one frozen case: three cheap review arms reached 34, 36 and 40 of the 110-finding union for 0.53, 0.82 and 0.16 US dollars of captured usage, against 82.52 dollars for the uncapped strong arm's 45, and one of the three, at 0.82 dollars, held three findings no other review arm reached, so the review arms differ in depth and, at the margin, in kind. The breadth stage is additive only: its findings enter the same adjudication under the same crediting rule, it never replaces the strong review, and a cheap arm's disagreement with the strong arm is adjudicated against the source, not by model preference."
gui_related: false
gui_classification_reason: Stage composition is process specification with no surface of its own.
split_recommended: false
depends_on: [ERS-010]
unblocks: [ERS-012]
acceptance_criteria:
  - A breadth stage is optional, additive, and adjudicated under the same crediting rule as the strong review.
  - A breadth stage never replaces or overrides the strong review stage.
  - A disagreement between a breadth arm and the strong arm is resolved against the cited source.
  - Cheap-arm cost figures are reported as captured usage estimates with their own limits, not as a price of equivalent quality.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: review_configuration_drift
reasoning_tier: medium
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/external_research_contracts.schema.json
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/README.md
preserved_exact_tokens: ["breadth", "additive", "same crediting rule"]
negative_constraints:
  - Do not let a breadth stage replace, gate or override the strong review stage.
  - Do not resolve an arm disagreement by model preference instead of the cited source.
  - Do not present one frozen case's cheap-arm recall as a general equivalence.
owner_hints: [Plans/External_Research.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Models_System.md

### ERS-012 - Latency Target, Per-Stage Reporting And Concurrency

```yaml
plan_unit_id: ERS-012
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "The product target is 60 to 75 minutes per research topic with two to four agents working concurrently. Every run reports, per stage, the admission-to-terminal wall span, the summed job execution time including retries, and the average concurrency, and reports the same three for the whole run, so a slow run can be attributed to a stage rather than to the topic. The measured basis is continuation 4: a full five-stage pipeline on one frozen case ran in 6,378.3 seconds of wall time - 1 hour 46 minutes - at an average concurrency of 2.620, with discovery 595.1 s, implementation 1,889.2 s, history 2,079.6 s, reconcile 3,699.3 s and compare 658.3 s; its three reconcile jobs were cut at the 2,400-second per-job limit. Review-only arms over frozen research artifacts ran between 668.7 and 3,535.2 seconds. A run that exceeds the target reports which stage exceeded it and whether a per-job limit or admission cut the stage short."
gui_related: false
gui_classification_reason: Latency targets and reporting are process specification; their display belongs to the research reporting surfaces owned elsewhere.
split_recommended: false
depends_on: [ERS-002, ERS-009, ERS-011]
unblocks: []
acceptance_criteria:
  - The per-topic target is 60 to 75 minutes with two to four concurrent agents.
  - Every stage reports wall span, summed job time including retries, and average concurrency, and the run reports the same three.
  - A run over target names the stage responsible and whether a per-job limit or admission cut it short.
  - Reported latency figures name the run that produced them and are not generalized beyond it.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: latency_target_drift
reasoning_tier: medium
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/external_research_contracts.schema.json
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation4/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md
  - PM-Experiments/research-audit-native-20260907/process-pilot-20260908/BRIEF_GOAL3_RESEARCH_CANON_20260917.md
preserved_exact_tokens: ["60 to 75 minutes", "average concurrency", "wall", "summed job"]
negative_constraints:
  - Do not report a run duration without its stage breakdown and concurrency.
  - Do not present one run's stage timings as a general performance claim.
  - Do not exclude retries from summed job time.
owner_hints: [Plans/External_Research.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Contracts_V0.md

### ERS-013 - Adjudication Truthfulness

```yaml
plan_unit_id: ERS-013
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "An adjudication is truthful only when four obligations hold. Every credit names the delivered assertion and the exact passage it cites, so any reader can re-check the judgement against the artifacts instead of taking the adjudicator's word. Every code fact an arm asserts is verified against pinned source before it is credited or refused, and the verification records the file and lines read; an error asserted as fact, an error quarantined as an unverified inference with its verification step written down, and the overturning of a correct inherited framing are three distinct outcomes and are reported as such. When the adjudicator shares a model family with any arm it scores, that is disclosed in the adjudication and the disclosure names at least one check where the same family's arms were found wrong. An adjudicator that ran or scored an arm of the same topic may not adjudicate it."
gui_related: false
gui_classification_reason: Adjudication obligations are process specification with no user-visible surface of their own.
split_recommended: false
depends_on: [ERS-004, ERS-010]
unblocks: [ERS-014]
acceptance_criteria:
  - Every credit records the delivered assertion and the cited passage that supports it.
  - Every credited or refused code fact is verified against pinned source with the file and lines recorded.
  - A shared model family between adjudicator and any scored arm is disclosed, with at least one check where those arms were found wrong.
  - An agent that ran or scored an arm does not adjudicate the same topic.
  - Asserted errors, quarantined inferences and overturned correct framings are reported as distinct outcomes.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: adjudication_untruthfulness
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/external_research_contracts.schema.json
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/cross-arm.json
  - PM-Experiments/research-audit-native-20260907/process-pilot-20260908/REVIEW_ADJUDICATION_20260916.md
preserved_exact_tokens: ["credit", "cited passage", "pinned source", "same family", "quarantined"]
negative_constraints:
  - Do not credit a code fact that was not verified against pinned source.
  - Do not omit a shared-model-family disclosure.
  - Do not let an agent adjudicate a topic whose arms it ran or scored.
  - Do not report an asserted error and a quarantined inference as the same outcome.
owner_hints: [Plans/External_Research.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Automated_Testing_System.md

### ERS-014 - Run Provenance

```yaml
plan_unit_id: ERS-014
unit_type: requirement
status: accepted
owner_doc: Plans/External_Research.md
canonical_text: "Every research run is reproducible from its own records. The run manifest pins the protocol freeze hash and the hash of every protocol file the run validated against, so two runs sharing a protocol fingerprint provably ran identical code, and the freeze timestamp must precede every job the freeze governed. The run's runtime identity - binary path, self-reported version and binary hash - is captured at capability time from the installed binary, never declared, and the boundary check compares the hash so a runtime that changes between gate and run fails closed. Every frozen output tree carries a SHA-256 output manifest, and the freeze procedure quiesces the monitor and every other telemetry writer before hashing, because a heartbeat written after the freeze makes an otherwise identical tree fail re-hashing. A re-hash difference is reported with the exact files that differ and whether any assertion document is among them."
gui_related: false
gui_classification_reason: Provenance capture and hashing are process and contract specification with no user-visible surface of their own.
split_recommended: false
depends_on: [ERS-003, ERS-013]
unblocks: []
acceptance_criteria:
  - A run manifest pins the protocol freeze hash and each validated protocol file hash, and the freeze timestamp precedes every job it governed.
  - Runtime identity is read from the installed binary at capability time and compared at the boundary, failing closed on a mismatch.
  - Every frozen output tree carries a SHA-256 manifest, taken after the monitor and other telemetry writers are quiesced.
  - A re-hash difference names the exact differing files and states whether any assertion document differs.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: provenance_defect
reasoning_tier: high
context_scope: external_research
implementation_surfaces:
  - Plans/External_Research.md
  - Plans/external_research_contracts.schema.json
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation4/freeze-history.json
  - reports/jujutsu-research-2026-09-11/continuation4/runtime-identity.json
  - reports/jujutsu-research-2026-09-11/continuation4/output-manifests.json
  - reports/jujutsu-research-2026-09-11/continuation4/protocol-fingerprints.json
preserved_exact_tokens: ["protocol fingerprint", "runtime identity", "output manifest", "quiesce"]
negative_constraints:
  - Do not declare a runtime version instead of reading the installed binary.
  - Do not hash an output tree while a telemetry writer is still running.
  - Do not record a freeze timestamp later than a job the freeze governed.
  - Do not report a manifest re-hash difference without naming the differing files.
owner_hints: [Plans/External_Research.md]
```

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Contracts_V0.md

## 3. Contracts, Schemas, Events, Or Data Shapes

### Research job record

Strict schema: `Plans/external_research_contracts.schema.json` (`$defs.research_job_record`). Required: `schema_id`, `schema_version`, `research_job_id`, `topic_id`, `project_id`, `arm_id`, `stage` (`discovery|implementation|history|reconcile|compare`), `admitted_inputs[]` (each a `path` plus `sha256` plus `input_class` of `frozen_plans_snapshot|product_brief|arm_artifact`), `admitted_lead_count`, `max_model_responses`, `max_job_seconds`, `responses_admitted`, `elapsed_seconds`, `terminal_state` (`finished|responses|time|budget|other`), `bound_by` (`designed_stop|response_ceiling|job_time_limit|budget_cap|other`), `bound_by_source` (`runtime_result_record|durable_meter|both`), `assertions_saved`, `run_manifest_ref`. A `frozen_plans_snapshot` input is admissible only on `reconcile` and `compare`; no `admitted_inputs` entry may carry `input_class: decision_record`, which the closed enum forbids outright.

### Research finding record

`$defs.research_finding_record`. Required: `schema_id`, `schema_version`, `finding_id`, `topic_id`, `union_id`, `finding_class` (`correction|capability|product_choice|unsupported_or_covered`), `title`, `proposition`, `citations[]` (at least one; each a `source_path`, `locator` and `sha256`), `credit_state` (`credited|partial|refused|candidate`), `credited_job_ref`, `in_union`, `landing_path` (`repair_authorization|user_decision|none`). A finding with `finding_class: correction` takes `landing_path: repair_authorization`; `capability` and `product_choice` take `user_decision`; `unsupported_or_covered` takes `none`. `credit_state: candidate` requires `in_union: false` and a non-empty `rejection_check_refs[]`.

### Decision packet and decision card

`$defs.research_decision_packet` and `$defs.research_decision_card`. A packet requires `schema_id`, `schema_version`, `decision_packet_id`, `topic_id`, `project_id`, `artifact_ref`, `card_refs[]` (at least one), `presentation` (`one_at_a_time`), `status_label_mode` (`text_only`), `created_at_utc`. A card requires `schema_id`, `schema_version`, `decision_card_id`, `decision_packet_id`, `finding_ref`, `finding_class` (`capability|product_choice` only), `plain_name`, `question`, `why_it_came_up`, `what_you_get`, `what_it_costs`, `options[]` (at least two), `recommendation` (nullable), `allowed_responses` (exactly `["approve", "deny", "deny_with_changes", "ask_a_question"]`, in that order), `disposition` (`pending|approve|deny|deny_with_changes|ask_a_question`), `disposition_recorded_at_utc` (nullable). The response set, the artifact behaviour and the questionnaire reuse are `DL-036` and `Plans/assistant-chat-design.md`; this schema binds packet content to a union finding and forbids a correction-class item.

### Budget receipt

`$defs.research_budget_receipt`. Required: `schema_id`, `schema_version`, `budget_receipt_id`, `research_job_ref`, `arm_id`, `lifetime_cap_usd`, `captured_usage_usd`, `in_flight_allowance_usd`, `unresolved_usage_usd`, `allowance_basis` (`cold_allowance|same_arm_same_stage_average`), `reconciled_jobs_for_average`, `native_records_present`, `valuation_basis` (`native_usage_records|runtime_reported_cost|tariff_floor`), `estimate_disclaimer`, `admission_decision` (`admitted|denied`). `allowance_basis: same_arm_same_stage_average` requires `reconciled_jobs_for_average` of at least 2; `native_records_present: false` requires a positive `unresolved_usage_usd` and a `valuation_basis` of `tariff_floor`, because a job that produced no native record has nothing else to value. `estimate_disclaimer` is a single constant, so a receipt cannot be published without the statement that captured usage is an upper-bound estimate rather than a billed amount.

### Run manifest

`$defs.research_run_manifest`. Required: `schema_id`, `schema_version`, `run_manifest_id`, `topic_id`, `protocol_freeze_sha256`, `protocol_file_hashes` (object of file to SHA-256, at least one entry), `protocol_fingerprint`, `freeze_recorded_at_utc`, `first_job_started_at_utc`, `freeze_precedes_first_job`, `runtime_identity` (`binary_path`, `reported_version`, `binary_sha256`, `capture_basis` of `installed_binary_at_capability_time`), `output_tree_manifests[]` (each a `tree_path`, `manifest_sha256`, `telemetry_quiesced` constant true), `rehash_differences[]` (each a `path`, `reason`, `assertion_document`). Every timestamp matches a strict UTC pattern, so a malformed instant is rejected rather than published. `freeze_recorded_at_utc` must not be later than `first_job_started_at_utc`: the comparison of two values is not expressible in JSON Schema, so `freeze_precedes_first_job` is the representable form and is a constant true, and the comparison itself is an owner obligation stated in `ERS-014`. `capture_basis` admits only the installed-binary value, so a declared version cannot be expressed.

### Event candidates (disposition: not registered)

The following durable event families are specified as candidates with planned payload minima; none is registered in `Plans/event_family_registry.json` at this Plans stage, no handler exists, and no emission is claimed. Registration is runtime-wave work through the event authority. Until registered, any such event is unknown or quarantined per the registry's `unknown_event_disposition`.

| Planned event_type | Payload minima | Disposition |
|---|---|---|
| `external_research.topic_started` | topic_id, project_id, frozen snapshot sha256, brief ref | candidate_not_registered |
| `external_research.job_terminal` | research_job_id, stage, terminal_state, bound_by, responses_admitted | candidate_not_registered |
| `external_research.finding_classified` | finding_id, union_id, finding_class, credit_state | candidate_not_registered |
| `external_research.packet_delivered` | decision_packet_id, topic_id, card count | candidate_not_registered |
| `external_research.budget_denied` | research_job_id, arm_id, captured, allowance, unresolved, cap | candidate_not_registered |

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md

## 4. Integration Surfaces

| Surface | Integration | Owner of surface |
|---|---|---|
| Assistant Chat | Decision packet artifact and one-at-a-time decision cards with the four responses, per `DL-036` | `Plans/assistant-chat-design.md` |
| Decision Log | Recorded dispositions, re-ask suppression, the standing repair authorization's scope | `Plans/Decision_Log.md` |
| Planning Ledger | The landing ledger for a research wave: atoms, decisions, corrections, questions, compile queue | `Plans/Planning_Ledger_System.md` |
| Planning Wizard | Where a research flow sits in a planning run; approved items feed topics, amendments and Approve And Build | `Plans/Planning_Wizard.md` |
| Settings | Project-scoped research limits: per-topic cost cap, per-job response and time limits, lifetime cap per arm, unresolved-usage disposition | `Plans/Settings_System.md` + `Plans/settings_inventory.json` |
| Usage | Research spend inside overall usage: captured, unresolved, occupancy versus cumulative, helper attribution | `Plans/usage-feature.md` |
| Models and providers | Review-model selection, effort, capability resolution, one effective controller, honest unsupported states | `Plans/Models_System.md`, `Plans/CLI_Bridged_Providers.md` |
| FileSafe and Permissions | Redaction and sensitivity before a research artifact is written; restriction propagation over derived findings | `Plans/FileSafe.md`, `Plans/Permissions_System.md` |
| Storage | Persistence and retention of research artifacts, manifests and receipts | `Plans/storage-plan.md` |
| Automated Testing | Static contract-fixture validation family for this owner | `Plans/Automated_Testing_System.md` |
| FinalGUI, Commands and wiring | Visible research status and results; research commands and their wiring rows, fail-closed until production wiring exists | `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, `Plans/UI_Wiring_Rules.md` |

Subject-matter owners are recipients, not integration points: a finding is delivered to the owner it names, and that owner keeps its own gate, its own acceptance criteria and its own validation surfaces. This owner never edits another owner's canon.

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Settings_System.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/usage-feature.md

## 5. Validation And Acceptance

Static contract validation is materialized as `Plans/external_research_contracts.schema.json` plus 12 positive and 30 negative fixtures in `Plans/external_research_contract_fixtures.json`, registered as a pack pair in the closed `CONTRACT_PAIRS` manifest of `scripts/pm-new-contracts-verify.py`, which owns and reports that manifest's authored cardinality (named subcheck `validate-new-contracts` in `scripts/pm-plans-verify.py run-gates`) and registered as `ATS-054` in `Plans/Automated_Testing_System.md`. Static validation covers schema shape and explicitly encoded invariants only. Each negative fixture is a single mutation of a named positive, names the constraint it must fail in `rejects_for`, and says in `reason` why the product forbids it; the six record families carry 6, 7, 3, 5, 4 and 5 negatives respectively.

Runtime proof remains NOT_RUN: no research job, adjudication, packet delivery, budget denial or provenance check is executed by this owner's validation. The measured figures quoted in `ERS-010`, `ERS-011` and `ERS-012` are results of the September 2026 Jujutsu research continuations on one frozen case; they are the basis for the promises here, not a general performance claim, and are cited by path and SHA-256 in Section 8.

Two figures are deliberately left open rather than fixed here. Continuation 5 measures the review stages against the 75-minute target and re-measures admissions as the bound on recall; until it reports, `ERS-010` and `ERS-012` carry continuation 4's numbers with their run named, and the continuation-5 result is an open ledger question (`pldg-20260917-002-external-research-canon`, `q-001` and `q-002`) rather than a placeholder in canon text. When continuation 5 reports, those two units are re-adjudicated against it under the ordinary currentness rule in `ERS-006`.

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Automated_Testing_System.md

## 6. Plan-To-Node Readiness

This owner is specification-only: `node_compile_hint` on every unit sets `create_worknodes: false` and `create_nodeseeds: false`. No WorkNodes, NodeSeeds, candidates, executable build queues or activation receipts are created. Future WorkNode integration is described only as readiness metadata. PNC-019 and other runtime readiness blockers are neither unlocked nor claimed.

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Plan_To_Node_Compilation.md

## 7. Deferred, Retired, Compatibility, And Non-Goals

Non-goals: external research is not a decision authority, not a ledger, not a Plan, To-Do or Goal, not an execution receipt, not a rules source, not a completion gate, not a second usage ledger and not a settings store. It does not rank models: every recall, cost and duration figure here belongs to one frozen case and is reported with the limits that produced it. It does not certify spend: captured usage is an upper-bound estimate, never a billed amount. It does not repair another owner's canon; it delivers findings and the owners decide. It produces no colored border bars, stripes or emoji glyphs in any surface.

Deferred to explicitly authorized future runtime work: event family registration and payload schemas, native research runners and their adapters, production command and wiring rows, real storage materialization of research artifacts, the settings inventory rows for the four research limits, and every runtime proof layer listed in Section 5. Out-of-union candidates from continuation 4 remain candidates; none is admitted as a finding by this document.

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Plan_Document_System.md

## 8. Source Lineage And Governance

Source lineage for this owner is the September 2026 external research campaign and its published bundles, each cited by path and SHA-256 as read on 2026-09-17:

| Source | SHA-256 |
|---|---|
| `reports/jujutsu-research-2026-09-11/README.md` | `f5b76807ca163bfe31cabeb41ff401f23f7f9118ff3ad671d55c59bd98668c27` |
| `reports/jujutsu-research-2026-09-11/continuation3/final/README.md` | `fb775eb0f26ded27d835d8ecface357a3f1ab8a65adc612da5685bfd1e446e53` |
| `reports/jujutsu-research-2026-09-11/continuation3/gate/README.md` | `7b7dba73a1892ab920ec69b6e25a0a2c127780a03a6418d5ae1e014589a03b75` |
| `reports/jujutsu-research-2026-09-11/continuation3/gate/cost-policy.json` | `d096dac1ddd552aa1cfa026981151b2162c73070307ec4083beb90812edf1247` |
| `reports/jujutsu-research-2026-09-11/continuation3-landing/README.md` | `29dbe5b397a76fd60f37916d6662841a28980358333c326cb4919423886eba95` |
| `reports/jujutsu-research-2026-09-11/continuation4/README.md` | `cd82616315cb33466cfe5716c287bc6630d705b96011ccee02ab922c00461475` |
| `reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md` | `c07c545ddc4588b65ba95a28868a46a30406fc3d70439f55050c27ac51d46d87` |
| `reports/jujutsu-research-2026-09-11/continuation4/adjudication/cross-arm.json` | `04c6667ac9bd788fdc2a673f4b7b512682ecad1ddeeff017c3fce65f06d5318b` |
| `reports/jujutsu-research-2026-09-11/continuation4/adjudication/consolidated-candidates.json` | `f09790f1e3b83a3675043741707ebbdc50d4c10e01bea7fdfe9fc38bbe40879c` |
| `reports/jujutsu-research-2026-09-11/continuation4/corrections.json` | `65791bf0123199a97097e1dbdd2a08ef6f246e236fd13ad08d7753d855c2d1ec` |
| `reports/jujutsu-research-2026-09-11/continuation4/freeze-history.json` | `d58711ac3fbf0f621429e5076ab22fed125ed37232367d54904ef311711a7143` |
| `reports/jujutsu-research-2026-09-11/continuation4/runtime-identity.json` | `4263d70d78206e0b082619dd6a7e1f35311b1a399151d17684ccd71cf377f186` |
| `reports/jujutsu-research-2026-09-11/continuation4/output-manifests.json` | `ddd20a45398aeff7176a460b6a042d6cbf13a22c00f42dcb7f536a7e8ed1d429` |
| `reports/jujutsu-research-2026-09-11/continuation4/protocol-fingerprints.json` | `cd23bfaaf68d34110c79dff936f367e5d89028c7c8df4b6105eef478b229ab52` |
| `reports/jujutsu-research-2026-09-11/d5/README.md` | `28aca2dee2fee3cddd9f5df423c25aca44936b477e7465e9391621a882b275ea` |
| `PM-Experiments/research-audit-native-20260907/process-pilot-20260908/REVIEW_ADJUDICATION_20260916.md` (appended to after this reading; hash is the 2026-09-17 snapshot, not a frozen file) | `8a7358bcd7883c6d6f93a986a488f3504ac36e1716e960bdf7690b88f29d10ac` |
| `PM-Experiments/research-audit-native-20260907/process-pilot-20260908/BRIEF_GOAL3_RESEARCH_CANON_20260917.md` | `15f8004b938040ee34bf0c02ce600c18f098e713a7315ad0ac092bf88d006169` |
| `PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md` | `98c7c005b490904a33f1ec0ec88c6402db48f33ec7ce0cb82ee3d01cf87e7847` |

Paths beginning `PM-Experiments/` are rooted at `/mnt/Cursor/` and are experiment records outside this repository, kept there per the repository's evidence rules. The decision behaviour this owner delegates is recorded in `Plans/Decision_Log.md` as `DL-036` and `DL-043`; nothing in this document re-decides either.

Planning lineage is the ledger `Plans/ledgers/v2/pldg-20260917-002-external-research-canon/`, registered in `Plans/ledgers/v2/ledger_registry.json`. Continuation 5 had not reported when this document was written; its review-configuration and latency results are open ledger questions there, not placeholders here. Governance seal (Spec Lock, evidence bundles, plan graph, readiness artifacts) is a separate phase owned by the designated Plans agent, after canonical inputs stabilize.

ContractRef: ContractName:Plans/External_Research.md, ContractName:Plans/Decision_Log.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md
