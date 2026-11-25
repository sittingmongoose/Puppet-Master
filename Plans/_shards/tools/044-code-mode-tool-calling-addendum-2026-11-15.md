# Shard 044: Code Mode Tool Calling Addendum - 2026-11-15

Source: `Plans/Tools.md`

Source lines: L13426-L13651

Source SHA256: `6bf31b611dd8e97cde68ed44dacddde22cce456ef5b95348899865d6fc5974fc`

---

## Code Mode Tool Calling Addendum - 2026-11-15

This addendum records Jared's 2026-11-15 direction that production Puppet Master uses Code Mode for tool calls on every provider. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal.

**What Code Mode is.** The model does its work by writing JavaScript that calls Puppet Master tools, and sends that script as one tool call, instead of calling tools one provider tool call at a time. One script can read several files, filter the results and act on them without a provider round trip between each step.

**What was looked at.** Claude Code 2.1.325 ships this as an experimental mode that, on that version, runs only in its interactive terminal and refuses headless launches. OMP 18.20.2 has no mode of that name: it has an eval tool whose JavaScript cells call tools as `tool.<name>(…)` beside ordinary direct calls, and a separate Tool Calling Mode setting that carries tool calls in the model's text: in its GLM dialect when Auto finds the model marked as having no provider-native tool calls, or always in a dialect the setting names. Puppet Master takes the script-calls-tools idea and the in-band carriage for models without native tool calls. It does not take Claude Code's auto-mode safety check, which reads each script once before it runs and does not check the tool calls the script then makes. The observations are in `/mnt/Cursor/PuppetMaster-Evidence/tests/code-mode-20261115/OBSERVATIONS.md` (SHA-256 `337e09ac2929163d17b05a0150cff4a6aa1963421802220929f7d85f376386ee`).

### T-188 - Code Mode Is The Requested Tool-Calling Mode For Every Provider

```yaml
plan_unit_id: T-188
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  In production Puppet Master the requested tool-calling mode of every provider route is Code Mode: the model writes
  JavaScript that calls Puppet Master tools and sends it as one script tool call, instead of calling tools one provider
  tool call at a time. The script runs in a JavaScript EvalSession owned by Shared Integration Runtime, with variable scope session,
  so a script's variables live only as long as the EvalSession that run uses, and every tool
  the script calls is a nested Puppet Master tool call on the T-178 path, permitted by the
  request's permission policy snapshot; Code Mode adds no opt-in step of its own. Tools marks the JavaScript EvalSession adapter
  supported for Code Mode, subject to the security owner. The script tool is offered on a run only when Shared
  Integration Runtime reports a product-approved JavaScript EvalSession for the exact Host/Environment, the request's
  policy admits the script tool, and the route can carry Puppet Master tools. Every run records its requested and effective
  tool-calling mode. Puppet Master owns the tools and the script runtime, so Code Mode does not depend on the provider
  having a code mode of its own. The effective mode is Code Mode, mixed or ordinary tool calls,
  where ordinary tool calls means the run was not offered the Puppet Master script tool; a run offered it that made
  no tool calls, or only the directly callable calls named in T-190, keeps Code Mode unless T-189 records the route as
  mixed. When it is not Code Mode the run records one typed reason, the first that applies
  of the execution shape named in T-189, no approved JavaScript EvalSession, policy, and provider-kept native tools;
  it is never a silent fallback, and Code Mode is never reported as effective
  for a run in which any tool other than the directly callable tools named in T-190 was dispatched another way. A resumed
  session requests Code Mode again like any other run, and an effective mode that differs from the session's earlier
  runs is recorded, with its typed reason when it is not Code Mode.
gui_related: false
gui_classification_reason: Runtime tool-dispatch mode and its recorded truth; presentation of the mode is owned elsewhere.
depends_on: [T-169, T-176, T-177, T-178]
unblocks: [T-189, T-190]
acceptance_criteria:
  - With no user action, a run on any provider route requests Code Mode, and its record shows requested and effective tool-calling mode.
  - A run whose effective mode is mixed or ordinary tool calls carries exactly one typed reason, and no surface describes that run as Code Mode.
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
  - 'Jared, 2026-11-15: "I believe the plan with puppet master is to own the tool calls, unlike T3. So Puppet master is more of a harness than T3 is. In that case, using the code mode method like claude code does, we should be able to do all tool calls that way for all providers right?"'
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

### T-189 - Code Mode Carriage By Provider Execution Shape

```yaml
plan_unit_id: T-189
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  When T-188's availability and policy gates admit the script tool, Puppet Master offers it through whichever channel
  carries Puppet Master tools on that route, and the directly callable tools named in T-190 travel on every route by
  the same channel as the script tool. If the script tool is not offered, the existing ordinary tool-call path is
  preserved, with T-188's effective-mode and typed-reason rules. Under
  Host Tool Execution on a direct API route whose Models_System tool_use capability is true it is a tool in
  the provider's tool-call API, and where it is false the owned in-band path below is used; on a bridged CLI under the HTE strategy it, and the directly callable tools named in T-190, travel through the
  Run_Modes hosted action loop as structured tool intents where its capability entry reports structured_tool_intents
  supported, otherwise as in-band tool calls, never as a provider tool_use; under
  the DAE strategy, where the CLI accepts Puppet Master tools through provider-native feature projection, it is a projected Puppet Master tool beside the CLI's own tools, so the run is mixed with the provider-kept native tools reason. When the script tool is offered, the request-selected registry tools other than the directly
  callable tools named in T-190 are described to the model as the
  script's callable catalog under T-176 materialization, rather than as one provider tool schema each. Wherever tool calls are carried
  in-band, including where the selected model's Models_System tool_use capability is false, the script tool and the
  directly callable tools named in T-190 are carried as in-band tool calls in an owned dialect that Tools selects for the model family and records on the run; the T-169 admission gate
  applies, with Puppet Master-minted call IDs standing in for provider IDs, and text in which the model
  writes a tool result itself is discarded and never enters replayable history. Where the script tool is offered and the provider keeps native tools that
  Puppet Master cannot disable, the script tool is not withdrawn, the provider's own tool calls stay outside Code
  Mode, and the run's effective mode is mixed. Where a provider accepts no Puppet Master tools at all, the effective
  mode is ordinary tool calls with a typed reason naming the execution shape, delegated or reasoning-only, and no
  Puppet Master tool call is counted for the run; that execution-shape reason is the one recorded when another
  reason would also apply. A provider's own code mode, where it has one, is a provider-native feature handled
  under the provider-native feature policy and is never what makes Code Mode effective.
gui_related: false
gui_classification_reason: Provider request shaping and execution-shape behaviour; not GUI implementation work.
depends_on: [T-169, T-176, T-188]
unblocks: []
acceptance_criteria:
  - Under Host Tool Execution a request on which the script tool is offered carries it and does not also carry one provider tool schema per registry tool the script can call; a request on which it is not offered keeps the ordinary tool-call path.
  - A model whose Models_System tool_use is false can use Code Mode through an owned in-band dialect, and a tool result the model wrote itself never reaches replayable history.
  - A bridged CLI under the HTE strategy on which the script tool is offered runs in Code Mode through the hosted action loop with no provider tool_use, unless the next criterion applies, whether or not that CLI has a code mode of its own; under the DAE strategy with the Puppet Master script tool offered, the run is recorded as mixed. The exception changes only the effective tool-calling mode label; under HTE, RM-021 still terminates the run on a provider-originated tool_use.
  - A run on which the script tool is offered, on a provider that keeps native tools Puppet Master could not disable, is recorded as mixed, never as Code Mode.
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
  - Do not copy a provider's or another harness's dialect list, switch name or availability rules into canon as fixed facts; tool-call support is read from the model's and provider's capability entries at run time, and the owned dialect is chosen by Tools.
  - Do not claim Code Mode for provider-native tool calls that Puppet Master did not dispatch.
  - Do not make Code Mode depend on a provider's own code mode being available.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Models_System.md
```

ContractRef: ContractName:Plans/Tools.md#T-188, ContractName:Plans/Tools.md#T-169, ContractName:Plans/Tools.md#T-176, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/Run_Modes.md

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
  script at that call until the approval is answered; where Permissions maps ask to deny because no person is
  available, the script receives that typed denial at once, and any denied call returns its typed denial to the script.
  Time spent waiting for an approval is approval_wait under the Contracts_V0 temporal taxonomy, attributed apart from
  local compute and external wait; it counts against the parent deadline, so an approval that outlasts the deadline
  ends the script with typed timeout evidence. The open approval request is closed as expired by its existing approval
  owner, retaining the pending request's original owner-selected identity and scope. Orchestrator-node requests
  retain their HITL blocked episode; application-scoped requests retain their PS-145 tool-request identity; other
  requests retain their existing approval contract. The earlier of the parent deadline and that request's owner-governed approval expiry
  applies; the existing typed expiry result is returned to the script when the approval timer ends first. The
  script can call only the tools selected for the request, reaches files, network and credentials only through those
  tools, and runs inside its parent deadline with bounded output; the deadline follows Tools deadline propagation, which is
  what bounds the script's nested calls, and the script's output bound and spill are the EvalSession's under Shared Integration Runtime; each nested tool's own
  output spills under T-177. Crossing the inline-output threshold uses the existing spill path and does not itself
  fail the script; crossing the EvalSession hard output-byte ceiling ends it with typed recovery evidence. Each nested call emits the same
  tool events, receipts and usage rollups as a direct call and also carries the script's operation identity, so the
  transcript shows the script and every tool call it made. Only question and task, whose
  contracts hand the turn to a person or to another agent, stay directly callable in Code Mode; they are not in the
  script's callable catalog, and calling them directly does not make the run mixed. The essential catalog search of
  T-176 is selected for every request on which the script tool is offered and in which it is policy_available, and is in the script's callable
  catalog; in Code Mode that is how T-176's directly available catalog search is reached.
gui_related: false
gui_classification_reason: Backend authority, limit and evidence rules for nested tool calls; not GUI implementation work.
depends_on: [T-176, T-177, T-178, T-188]
unblocks: []
acceptance_criteria:
  - A script cannot make a tool call that the same request could not make as a direct call, including when the argument values are computed while the script runs.
  - An approval asked for inside a script suspends that script and is answered through the ordinary approval path; a denial, including the immediate one when no person is available, reaches the script as a typed result.
  - Every nested call appears in the event log, receipts and usage rollups exactly as a direct call would, plus the script's operation identity.
  - A script that passes its deadline or the EvalSession hard output-byte ceiling ends with typed recovery evidence, not a success-shaped result.
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
  - Plans/Tools.md#T-178 and section 4.4 (a live EvalSession is never authority to widen tools, bypass approval or extend the parent deadline)
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

ContractRef: ContractName:Plans/Tools.md#T-188, ContractName:Plans/Tools.md#T-176, ContractName:Plans/Tools.md#T-177, ContractName:Plans/Tools.md#T-178, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Permissions_System.md#PS-145, ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md
