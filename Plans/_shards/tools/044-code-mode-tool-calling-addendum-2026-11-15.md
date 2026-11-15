# Shard 044: Code Mode Tool Calling Addendum - 2026-11-15

Source: `Plans/Tools.md`

Source lines: L13358-L13545

Source SHA256: `aaff2b674cb3de2e42c66c5694e2d4ba850c881291aaaed380d55017f530d2b5`

---

## Code Mode Tool Calling Addendum - 2026-11-15

This addendum records Jared's 2026-11-15 direction that production Puppet Master uses Code Mode for tool calls on every provider. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal.

**What Code Mode is.** The model does its work by writing JavaScript that calls Puppet Master tools, and sends that script as one tool call, instead of calling tools one provider tool call at a time. One script can read several files, filter the results and act on them without a provider round trip between each step.

**What was looked at.** Claude Code 2.1.325 ships this as an experimental mode that, on that version, runs only in its interactive terminal and refuses headless launches. OMP 18.20.2 has no mode of that name: it has an eval tool whose JavaScript cells call tools as `tool.<name>(…)` beside ordinary direct calls, and a separate Tool Calling Mode setting that carries tool calls in the model's text, in a dialect chosen for the model family, when the model has no provider-native tool calls. Puppet Master takes the script-calls-tools idea and the in-band carriage for models without native tool calls. It does not take Claude Code's auto-mode safety check, which reads each script once before it runs and does not check the tool calls the script then makes. The observations are in `/mnt/Cursor/PuppetMaster-Evidence/tests/code-mode-20261115/OBSERVATIONS.md` (SHA-256 `337e09ac2929163d17b05a0150cff4a6aa1963421802220929f7d85f376386ee`).

### T-188 - Code Mode Is The Requested Tool-Calling Mode For Every Provider

```yaml
plan_unit_id: T-188
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  In production Puppet Master the requested tool-calling mode of every provider route is Code Mode: the model writes
  JavaScript that calls Puppet Master tools and sends it as one script tool call, instead of calling tools one provider
  tool call at a time. The script runs in a JavaScript EvalSession owned by Shared Integration Runtime, and every tool
  the script calls is a nested Puppet Master tool call on the T-178 path. Every run records its requested and effective
  tool-calling mode. When the effective mode is not Code Mode the run uses ordinary tool calls and records one typed
  reason; it is never a silent fallback, and Code Mode is never reported as effective for a run whose tools were
  dispatched another way. A resumed session keeps the tool-calling mode it started with, and a change of mode on resume
  is recorded with its typed reason.
gui_related: false
gui_classification_reason: Runtime tool-dispatch mode and its recorded truth; presentation of the mode is owned elsewhere.
depends_on: [T-169, T-176, T-177, T-178]
unblocks: [T-189, T-190]
acceptance_criteria:
  - With no user action, a run on any provider route requests Code Mode, and its record shows requested and effective tool-calling mode.
  - A run whose effective mode is ordinary tool calls carries exactly one typed reason, and no surface describes that run as Code Mode.
  - Code Mode is unavailable, with a typed reason, whenever Shared Integration Runtime reports no product-approved JavaScript EvalSession for the exact Host/Environment.
  - Tools creates no second evaluator, kernel manager or script runtime for Code Mode.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: tool_calling_mode_truth_drift
reasoning_tier: high
context_scope: code_mode_tool_calling
implementation_surfaces:
  - Plans/Tools.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 'Jared, 2026-11-15: "I want to add to our plans to use that for puppet master for all providers. Like the production puppet master, once it is built, will use this for tool calls on all providers."'
  - /mnt/Cursor/PuppetMaster-Evidence/tests/code-mode-20261115/OBSERVATIONS.md sha256:337e09ac2929163d17b05a0150cff4a6aa1963421802220929f7d85f376386ee
source_atom_ids: []
preserved_exact_tokens:
  - Code Mode
  - requested and effective tool-calling mode
  - one script tool call
negative_constraints:
  - Do not treat Code Mode as a provider feature that only some providers have; Puppet Master owns the script runtime.
  - Do not report Code Mode as effective from configuration alone.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/CLI_Bridged_Providers.md
```

ContractRef: ContractName:Plans/Tools.md#T-178, ContractName:Plans/Tools.md#T-176, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/CLI_Bridged_Providers.md

### T-189 - Code Mode Carriage By Provider Execution Tier

```yaml
plan_unit_id: T-189
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  How the script tool reaches the model depends on who dispatches the run's tools. Under Host Tool Execution, where
  Puppet Master dispatches every tool, Puppet Master offers the script tool as a provider-native tool and describes
  the request-selected registry tools to the model as the script's callable catalog under T-176 materialization, rather
  than as one provider tool schema each. Where the selected model has no usable provider-native tool calls, the same
  script tool is carried as an in-band tool call in an owned dialect chosen for the model family; the T-169 admission
  gate applies unchanged, and text in which the model writes a tool result itself is discarded and never enters
  replayable history. Where the provider runs its own tool loop, in the Constrained and Provider-managed execution
  tiers, Puppet Master cannot place its script tool in that loop: it projects the provider's own code-mode switch only
  when the provider documents one and the launch qualifies, and it takes the effective mode from what the provider
  reports, never from the switch having been set.
gui_related: false
gui_classification_reason: Provider request shaping and execution-tier behaviour; not GUI implementation work.
depends_on: [T-169, T-176, T-188]
unblocks: []
acceptance_criteria:
  - Under Host Tool Execution a Code Mode request carries the script tool and does not also carry one provider tool schema per registry tool the script can call.
  - A model without provider-native tool calls can use Code Mode through an owned in-band dialect, and a tool result the model wrote itself never reaches replayable history.
  - A run in the Constrained or Provider-managed tier records Code Mode as effective only when the provider itself reported it.
  - A bridged Claude Code launch started headless records ordinary tool calls with a typed reason while that provider limits its Code Mode to the interactive terminal.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: code_mode_carriage_overclaim
reasoning_tier: high
context_scope: code_mode_tool_calling
implementation_surfaces:
  - Plans/Tools.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 'Jared, 2026-11-15: "I believe OMP uses this for its tool calls, so you could pull it in and see how it does it. (It may not be the best way)."'
  - /mnt/Cursor/PuppetMaster-Evidence/tests/code-mode-20261115/OBSERVATIONS.md sha256:337e09ac2929163d17b05a0150cff4a6aa1963421802220929f7d85f376386ee
source_atom_ids: []
preserved_exact_tokens:
  - Host Tool Execution
  - in-band tool call
  - owned dialect
negative_constraints:
  - Do not copy a provider's or another harness's dialect list, switch name or availability rules into canon as fixed facts; they are read from the provider at run time.
  - Do not claim Code Mode for a provider-run tool loop that Puppet Master cannot observe.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Models_System.md
```

ContractRef: ContractName:Plans/Tools.md#T-188, ContractName:Plans/Tools.md#T-169, ContractName:Plans/Tools.md#T-176, ContractName:Plans/CLI_Bridged_Providers.md

### T-190 - Code Mode Script Safety, Limits And Visibility

```yaml
plan_unit_id: T-190
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  A Code Mode script has no authority of its own. Every tool call it makes is checked at call time, with the argument
  values the script actually computed, by the same permission, approval, FileSafe, network and schema path as a direct
  call; reading the script once before it runs is never the safety check. A call that needs approval suspends the
  script at that call until the approval is answered, and a denied call returns the typed denial to the script. The
  script can call only the tools selected for the request, reaches files, network and credentials only through those
  tools, and runs inside its parent deadline with a bounded number of nested calls and bounded output; those limits are
  owned by Shared Integration Runtime, and output past the bound spills under T-177. Each nested call emits the same
  tool events, receipts and usage rollups as a direct call and also carries the script's operation identity, so the
  transcript shows the script and every tool call it made. Tools whose contract hands the turn to a person or to another
  agent, question and task, stay directly callable in Code Mode.
gui_related: false
gui_classification_reason: Backend authority, limit and evidence rules for nested tool calls; not GUI implementation work.
depends_on: [T-177, T-178, T-188]
unblocks: []
acceptance_criteria:
  - A script cannot make a tool call that the same request could not make as a direct call, including when the argument values are computed while the script runs.
  - An approval asked for inside a script suspends that script and is answered through the ordinary approval path; a denial reaches the script as a typed result.
  - Every nested call appears in the event log, receipts and usage rollups exactly as a direct call would, plus the script's operation identity.
  - A script that passes its deadline, nested-call bound or output bound ends with typed recovery evidence, not a success-shaped result.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: code_mode_policy_bypass
reasoning_tier: high
context_scope: code_mode_tool_calling
implementation_surfaces:
  - Plans/Tools.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 'Jared, 2026-11-15: "Like the production puppet master, once it is built, will use this for tool calls on all providers."'
  - /mnt/Cursor/PuppetMaster-Evidence/tests/code-mode-20261115/OBSERVATIONS.md sha256:337e09ac2929163d17b05a0150cff4a6aa1963421802220929f7d85f376386ee
source_atom_ids: []
preserved_exact_tokens:
  - checked at call time
  - operation identity
  - question and task
negative_constraints:
  - Do not accept a single pre-run read of the script as the permission or safety check for the calls it makes.
  - Do not give the script ambient filesystem, network or credential access outside the selected tools.
  - Do not hide nested tool calls behind one script row in events, receipts or usage.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Tools.md#T-188, ContractName:Plans/Tools.md#T-177, ContractName:Plans/Tools.md#T-178, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Permissions_System.md
