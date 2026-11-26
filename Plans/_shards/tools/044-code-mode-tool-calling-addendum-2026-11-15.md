# Shard 044: Code Mode Tool Calling Addendum - 2026-11-15

Source: `Plans/Tools.md`

Source lines: L13358-L13815

Source SHA256: `3de3905ee3815d6aed89d73cf7f3ca6395105936fda0c900bfd77e31e94d6b43`

---

## Code Mode Tool Calling Addendum - 2026-11-15

This addendum records Jared's 2026-11-15 direction that production Puppet Master uses Code Mode for tool calls on every provider. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal.

**Amended 2026-11-24.** Jared asked whether Code Mode can be turned off in Settings and directed that it must be. T-191 adds the Settings row and its meaning; T-188 and T-189 are amended so the requested mode follows that row. T-189 also adds the ordinary tool-call path on the routes that had none: in-band carriage of the request-selected tools, and their one-by-one projection under DAE. Jared was asked whether a run with Code Mode on that cannot be offered the script tool should get those paths too, and chose "Give the fallback the same direct calls" (2026-11-25), so they apply on every request on which the script tool is not offered, whatever the reason and however the offer changes during a run; under DAE a request is one prepared launch of the CLI process, as T-189 says. So a request that has an ordinary Puppet Master tool channel and is not offered the script tool is offered, directly, the tools materialized for that channel within T-176's bounds. A script that was offered and then fails keeps its existing typed failure. What a run records, its effective mode and typed reason, is defined once, in T-188. The typed reasons gain setting and not materialized. One acceptance criterion of T-190, on what a script may call, is reworded to compare admission of the call rather than whether the direct channel could carry it. Code Mode stays On by default.

**What Code Mode is.** The model does its work by writing JavaScript that calls Puppet Master tools, and sends that script as one tool call, instead of calling tools one provider tool call at a time. One script can read several files, filter the results and act on them without a provider round trip between each step.

**What was looked at.** Claude Code 2.1.325 ships this as an experimental mode that, on that version, runs only in its interactive terminal and refuses headless launches. OMP 18.20.2 has no mode of that name: it has an eval tool whose JavaScript cells call tools as `tool.<name>(…)` beside ordinary direct calls, and a separate Tool Calling Mode setting that carries tool calls in the model's text: in its GLM dialect when Auto finds the model marked as having no provider-native tool calls, or always in a dialect the setting names. Puppet Master takes the script-calls-tools idea and the in-band carriage for models without native tool calls. It does not take Claude Code's auto-mode safety check, which reads each script once before it runs and does not check the tool calls the script then makes. The observations are in `/mnt/Cursor/PuppetMaster-Evidence/tests/code-mode-20261115/OBSERVATIONS.md` (SHA-256 `337e09ac2929163d17b05a0150cff4a6aa1963421802220929f7d85f376386ee`).

### T-188 - Code Mode Is The Requested Tool-Calling Mode For Every Provider

```yaml
plan_unit_id: T-188
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  In production Puppet Master the requested tool-calling mode of every provider route is Code Mode, unless the Settings
  row of T-191 is Off for the run, in which case the run requests ordinary tool calls. In Code Mode the model writes
  JavaScript that calls Puppet Master tools and sends it as one script tool call, instead of calling tools one provider
  tool call at a time. The script runs in a JavaScript EvalSession owned by Shared Integration Runtime, with variable scope session,
  so a script's variables live only as long as the EvalSession that run uses, and every tool
  the script calls is a nested Puppet Master tool call on the T-178 path, permitted by the
  request's permission policy snapshot; Code Mode adds no opt-in step of its own. Tools marks the JavaScript EvalSession adapter
  supported for Code Mode, subject to the security owner. Puppet Master owns the tools and the script runtime, so Code
  Mode does not depend on the provider having a code mode of its own. The requested mode is decided once for the run.
  The offer of the script tool is decided for each request: it is offered on a request only when the run requests
  Code Mode, Shared Integration Runtime reports a product-approved JavaScript EvalSession for the exact
  Host/Environment, the request's policy admits the script tool, the request's route can carry Puppet Master
  tools, and the script tool itself, together with the essential catalog search that T-190 puts in its callable
  catalog where that search is policy-available, is materialized for the request under T-176's bounded materialization, so the
  offer is decided only when the request's tool materialization is final; under the DAE strategy a request is one prepared launch of the CLI process, as T-189 says. On a request on which it is not offered, for any reason, the request-selected tools travel by the route's
  ordinary tool-call path under T-189. A request counts for the record once Puppet Master has decided the offer for
  it, whether or not it is then sent to the provider. Every run records its requested and effective tool-calling mode. This unit
  alone defines the run's record, its effective mode and its typed reason, and derives both from the run's requests;
  T-189 and T-191 add no rule of their own for either. A run that did not request Code Mode always records ordinary tool
  calls with the typed reason setting, from its frozen preference alone, whether or not it reached a request. A run
  that requested Code Mode and ended before the offer was decided for any request, for example on a pre-dispatch
  budget stop, records its effective mode as not applicable, with no typed reason, and no surface describes it as
  Code Mode. For a run that requested Code Mode and had the offer decided for at least one request, the effective
  mode is exactly one of Code Mode, mixed and ordinary tool calls. It is ordinary tool calls when no request of the run was offered the script tool. It is mixed
  when at least one request was offered it and either the route selected for any counted request keeps native tools
  Puppet Master cannot disable, which T-189 names, or a Puppet Master tool other than the directly callable tools
  named in T-190 was dispatched on a request on which the script tool was not offered. It is Code Mode otherwise:
  for example, a run offered the script tool on every request, on a route that keeps no such tools, is Code Mode
  even if it made no tool calls, or only the directly callable calls named in T-190. When that mode is mixed or ordinary tool calls the run records exactly one typed reason: the one that comes first, in the order
  setting, execution shape, no approved JavaScript EvalSession, policy, not materialized, provider-kept native tools, among the reasons
  that count for the run. Each condition of the offer that a request does not meet is a reason that kept the script
  tool off that request: setting when the run did not request Code Mode, the execution shape named in T-189,
  delegated or reasoning-only, when the request's route cannot carry Puppet Master tools, the shape recorded being
  that of the earliest counted request with this reason when counted requests differ in shape, no approved JavaScript
  EvalSession when Shared Integration Runtime gives no positive report of a product-approved one for the exact
  Host/Environment, which covers a negative report, an unavailable owner and missing or stale approval evidence,
  with the owner's own diagnostics kept, policy when the request's policy does not admit the
  script tool, and not materialized when the script tool, or the essential catalog search its catalog must hold, is finally left out of the request by selection or materialization
  under section 1.0A and T-176 for any cause the earlier reasons do not explain, whatever that owner calls the
  omission (not_selected, budget_deferred, schema_unavailable); the detailed omission stays with T-176. For a run with ordinary tool calls, every reason that kept the script tool off any of its
  requests counts. For a mixed run, a reason that kept the script tool off a request counts only when a Puppet
  Master tool other than the directly callable tools named in T-190 was dispatched on that request, and
  provider-kept native tools counts when the route selected for any counted request keeps them, whether or not that
  request was then sent. So every run recorded as mixed or ordinary tool calls carries a typed reason, request-level
  admission diagnostics stay with their owners, and a run that requested Code Mode and is recorded as mixed or
  ordinary tool calls is never a silent fallback: the run's own status or stop entry in its transcript shows the effective mode and
  typed reason that this unit records for the run, whatever its requests did and whether or not any of them was
  sent or produced a turn, so the disclosure never depends on a particular request. Every other surface that shows the run's tool-calling mode shows
  them with it, while a run that did not request Code Mode is shown, where its tool-calling mode is shown at all, neutrally as T-191 says.
  Code Mode is never reported as effective for a run in which any tool other than the
  directly callable tools named in T-190 was dispatched another way. A new run in a resumed
  session or conversation reads T-191's row when it starts, like any other run; a run that continues under the same
  run ID after a pause, a prerequisite resume or a new attempt keeps the value it read when it started, and a child
  or subagent run and a follow-up run spawned by context rotation take their value as T-191 says. An effective mode that differs from the session's earlier
  runs is recorded, with its typed reason when it is mixed or ordinary tool calls; a not applicable record carries no reason.
gui_related: true
gui_classification_reason: Mixed unit. It defines the runtime tool-dispatch mode and its record, and it also requires the run's transcript status or stop entry, and every other surface that shows the tool-calling mode, to show a fallback's effective mode and typed reason. Split recommended when a GUI owner unit for the transcript takes the presentation rule; kept together here so the record and its one required disclosure cannot drift apart.
split_recommended: true
depends_on: [T-169, T-176, T-177, T-178]
unblocks: [T-189, T-190, T-191]
acceptance_criteria:
  - A run for which T-191's row resolves On, which is its default and needs no user action, requests Code Mode on any provider route, and its record shows requested and effective tool-calling mode.
  - A run for which T-191's row is Off requests ordinary tool calls, is offered the script tool on no request, and records effective mode ordinary tool calls with the typed reason setting, including a run that ended before its first request.
  - A run that requested Code Mode and ended before the offer was decided for any request records its effective mode as not applicable with no typed reason; a request whose offer was decided counts even if it was never sent to the provider.
  - A run whose effective mode is mixed or ordinary tool calls carries exactly one typed reason, and no surface describes that run as Code Mode.
  - A run that requested Code Mode and is recorded as mixed or ordinary tool calls shows that effective mode and typed reason on its own status or stop entry in the transcript, and on every other surface that shows its tool-calling mode. This holds whichever request contributed the reason and whether or not any request was sent or produced a turn, including a DAE launch that was prepared and never spawned, or spawned and ended before any provider turn. A run whose policy denies the script tool on every request shows ordinary tool calls with the reason policy when no earlier reason in the order counts, and with that earlier reason when one does, for example when there is also no positive report of an approved JavaScript EvalSession.
  - The script tool is not offered on a request for which Shared Integration Runtime gives no positive report of a product-approved JavaScript EvalSession for the exact Host/Environment, whether it reports none, is unavailable, or its approval evidence is missing or stale; that request's tools travel by the route's ordinary tool-call path under T-189, and a run that is ordinary or mixed records the typed reason no approved JavaScript EvalSession when that is the earliest counted reason in this unit's order.
  - A request with the row On, a positive report of an approved JavaScript EvalSession and policy admission, whose script tool is left out by selection or materialization under T-176 (not_selected, budget_deferred or schema_unavailable), is not offered the script tool; its request-selected tools travel by the ordinary path within the same bounds, and a run that is ordinary or mixed records the typed reason not materialized when that is the earliest counted reason in this unit's order. When both of these reasons count for one ordinary or mixed run under this unit's rules, it records no approved JavaScript EvalSession, the earlier of the two, when no still earlier reason counts, and only that. A reason that kept the script tool off a request counts for a mixed run only when a tool other than the directly callable ones was dispatched on that request, while provider-kept native tools counts by its own rule: with the script tool offered on a first request, no evaluator and no such dispatch on a second, and the script tool not materialized with such a dispatch on a third, on a route that keeps no native tools, the run records mixed with not materialized.
  - A run that requests Code Mode on a direct API route that keeps no native tools Puppet Master cannot disable, and is offered the script tool on its first requests but not on later ones because Shared Integration Runtime then reports no approved JavaScript EvalSession, records Code Mode when nothing, or only the directly callable tools named in T-190, was dispatched on the later requests, including when an ordinary call the model wrote there was rejected before dispatch, and mixed with the typed reason no approved JavaScript EvalSession when any other Puppet Master tool was dispatched on them.
  - The same run under the DAE strategy, on a CLI that accepts projected Puppet Master tools, or on any other route that keeps native tools Puppet Master cannot disable, records mixed in both cases, with the typed reason provider-kept native tools in the first case and no approved JavaScript EvalSession in the second.
  - A run whose only request had the script tool offered, on a route that keeps native tools Puppet Master cannot disable, and was stopped before that request was sent, records mixed with the typed reason provider-kept native tools.
  - A run that requested Code Mode whose first counted request is on a delegated route and whose second is on a reasoning-only route, neither able to carry Puppet Master tools, records ordinary tool calls with the execution-shape reason delegated, the shape of the earliest such request; each request keeps its own diagnostics.
  - T-189 and T-191 state no rule for the effective mode or the typed reason; every record they name is the one this unit derives.
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
  - 'Jared, 2026-11-24: "I want to check, is code mode an option in settings that can be turned off?  If not, it needs to be."'
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
  On a request on which T-188 offers the script tool, Puppet Master carries it by whichever channel carries Puppet
  Master tools on that route, and the directly callable tools named in T-190 travel by the same channel as the
  script tool. On a request on which it is not offered, for any reason, the request-selected tools travel by the
  route's ordinary tool-call path: the existing one where the route has one, and on the routes that had none, the
  in-band carriage and the DAE projection that this unit adds below. Under
  Host Tool Execution on a direct API route whose Models_System tool_use capability is true the script tool is a tool in
  the provider's tool-call API, and where it is false the owned in-band path below is used; on a bridged CLI under the HTE strategy it, and the directly callable tools named in T-190, travel through the
  Run_Modes hosted action loop as structured tool intents where its capability entry reports structured_tool_intents
  supported, otherwise as in-band tool calls, never as a provider tool_use; under
  the DAE strategy, where the CLI accepts Puppet Master tools through provider-native feature projection, it is a projected Puppet Master tool beside the CLI's own tools. When the script tool is offered, the request-selected registry tools other than the directly
  callable tools named in T-190 are described to the model as the
  script's callable catalog under T-176 materialization, rather than as one provider tool schema each. The in-band
  routes are the two just named: a direct API route under Host Tool Execution whose model's tool_use capability is
  false, and a bridged CLI under the HTE strategy whose capability entry does not report structured_tool_intents
  supported. On an in-band route the script tool and the
  directly callable tools named in T-190 are carried as in-band tool calls in an owned dialect that Tools selects for the model family and records on the run; the T-169 admission gate
  applies, with Puppet Master-minted call IDs standing in for provider IDs, and text in which the model
  writes a tool result itself is discarded and never enters replayable history. On a request on which the script
  tool is not offered, on an in-band route, the request-selected tools themselves are carried as
  in-band tool calls in that same owned dialect, under the same admission gate, call-ID and discarded-result rules;
  that is the ordinary tool-call path of such a route. On a direct API in-band route the result of an accepted
  in-band call, of the script tool or of an ordinary tool, goes back to the model in the next request, if one is
  admitted and sent with the same model family, carriage and owned dialect, as a Puppet
  Master-authored result in the owned dialect, tied to the Puppet Master-minted call ID, through the prompt
  transport that route permits, with its content shaped and replayed as Prompt_Pipeline's tool-result rules say, including where those rules
  keep a result's content from the model, and when no later request is
  sent the result and the stop keep their existing owners' handling, while any other later request, one whose model
  family, carriage or dialect differs, takes the settled call and result pair through Prompt_Pipeline's replay and compatibility
  rules, by the call's existing receipt, rather than in the old dialect; on
  a bridged CLI under HTE the hosted action loop returns the result as Run_Modes says. The carriage follows the route, not the model's
  tool_use flag alone: a bridged CLI under HTE that reports structured tool intents carries the request-selected
  tools as structured tool intents through the hosted action loop as before, a cooperative SDK or protocol route
  keeps returning tool intents to Puppet Master and a server bridge keeps its Puppet Master tool and MCP projection
  as CLI_Bridged_Providers describes those classes. A server bridge shows a request only the projection bound to
  that run's own provider session, so one run's offer never changes what another run is shown; where a bridge
  cannot keep runs apart in that way, for example because its tool configuration is shared by every run on the
  profile, the script tool is not offered through it to any run, and for a run that requested Code Mode that is T-188's not
  materialized reason unless an earlier reason counts. Every run on such a bridge uses the bridge's ordinary
  projection where the adapter can still present or filter the bounded ordinary selection for each request; where
  it cannot, that request is one on a route that cannot carry Puppet Master tools: it takes whichever fallback
  shape, delegated or reasoning-only, CLI_Bridged_Providers' fallback rules admit for it, that shape is its
  execution-shape reason, and where those rules admit neither the request is stopped before its offer is decided
  and counts nothing. T-188 derives each run's record from such a request by its own rules, so a run that did not
  request Code Mode still records setting, and the bridge's existing tier disclosure applies to every run on it. A DAE route follows the DAE sentences below,
  and a route that accepts no Puppet Master tools carries none. Each call travels by exactly one channel. Wherever
  this unit says the request-selected tools are carried or projected on an ordinary request, it means those the
  ordinary form materializes under T-176; a tool that owner defers or cannot materialize keeps its explicit
  omission or stop outcome. The
  essential catalog search of T-176, where it is policy-available, is selected through T-176's bounded bootstrap
  materialization, with that owner's omissions and stop outcomes, for every request that can carry
  Puppet Master tools, whether or not the script tool is offered: with the script tool it is in the callable
  catalog as T-190 says, and without it, it is carried directly like the other request-selected tools. Under the
  DAE strategy, on a request on which the script tool is not offered, where the CLI accepts Puppet Master
  tools through provider-native feature projection, the request-selected Puppet Master tools are projected one by one
  beside the CLI's own tools through that same projection, and Puppet Master dispatches each call with the same
  permission, approval, FileSafe, network and schema checks a script's call to that tool gets; that is the ordinary tool-call path of
  such a route, and the CLI's own jailed tools stay under the DAE restriction and reconciliation rules either way.
  Every Puppet Master tool call that reaches Puppet Master through the DAE projection, from a script or as a
  projected tool called directly, is dispatched inside the run's admitted DAE execution context: what it does to
  files and commands happens only in the run's jail under its execution identity, never directly in the canonical
  workspace, and reaches that workspace only through the scans and reconciliation Run_Modes keeps for DAE, with the
  Permissions-owned boundaries unchanged. Under the DAE strategy Puppet Master does not prepare the provider's
  requests; it prepares the CLI process, under DAE's deterministic pre-spawn restriction. So under DAE, for T-188
  and for this unit, a request is one prepared launch of the CLI process: the offer and the request-selected tools
  are decided when Puppet Master prepares the launch, before the process is spawned, and the launch counts for
  T-188 from that decision, whether or not the spawn then happens or the process ever sends a provider request; a
  stop before that decision counts nothing. A spawned process is shown exactly that projection for as long as it
  lives, and nothing in the projection is replaced while it runs. A change in the offer or in the selected tools
  takes effect at the run's next launch, under the run's existing attempt and recovery rules, and that launch is
  prepared from the conditions that hold then. Within a process, a script call made after the approved JavaScript EvalSession is gone
  fails with the evaluator-unavailable result that section 4.4 of this document and Shared Integration Runtime own,
  as it would after dispatch on any other route; nothing runs it elsewhere and no ordinary tool is added to a running process.
  So on any one route, a request of a run with the row On that is not offered the script tool and a request of a
  run with the row Off get the same ordinary carriage and the same bounded tool selection for the same inputs,
  however the offer changes during a run. Between a request that is offered the script tool and one that is not,
  what stays equal is tool authority and the call-time checks on the same admitted tool and inputs; which tools are
  materialized in each form stays subject to that form's own selection, schema and payload-budget limits under
  T-176, Prompt_Pipeline and Models_System, including their deferred and unavailable outcomes. A route keeps native tools that Puppet Master cannot disable, in the sense
  of T-188's record, where the provider has such tools, and under the DAE strategy, where the CLI's own tools run
  beside any projected Puppet Master tool; there the native tools alone never withdraw a script tool that T-188
  offers on a request, a request on which T-188 does not offer it carries none, and the provider's own tool calls
  stay outside Code Mode. Where a provider accepts no Puppet Master tools at all, the route cannot carry Puppet
  Master tools: its execution shape, delegated or reasoning-only, is T-188's execution-shape reason, and no
  Puppet Master tool call is counted on it. This unit adds no rule of its own for the effective mode or the
  typed reason; T-188 derives both from the run's requests. A provider's own code mode, where it has one, is a provider-native feature handled
  under the provider-native feature policy and is never what makes Code Mode effective.
gui_related: false
gui_classification_reason: Provider request shaping and execution-shape behaviour; not GUI implementation work.
depends_on: [T-169, T-176, T-188]
unblocks: [T-191]
acceptance_criteria:
  - Under Host Tool Execution a request on which the script tool is offered carries it and does not also carry one provider tool schema per registry tool the script can call; a request on which it is not offered keeps the ordinary tool-call path.
  - A model whose Models_System tool_use is false can use Code Mode through an owned in-band dialect on an in-band route, and a tool result the model wrote itself never reaches replayable history.
  - On a direct API in-band route, the result of an accepted in-band call, from a script or from an ordinary tool, is returned in the next request, if one is admitted and sent with the same model family, carriage and owned dialect, as a Puppet Master-authored result in the owned dialect carrying the Puppet Master-minted call ID, holding whatever content Prompt_Pipeline's tool-result rules admit for the model; where those rules keep the content from the model, what the model is shown for that call is what those rules say, and the settled call and result stay in history under their owners. When no later request is sent, the result and the stop keep their existing owners' handling; when the next request differs in model family, carriage or dialect, the settled call and result pair goes through Prompt_Pipeline's replay and compatibility rules instead.
  - Two runs on the same server-bridge profile, one with the row On and one with it Off, are each shown only their own projection. On a bridge that cannot keep them apart, neither is offered the script tool. Where that bridge can still present or filter each request's bounded selection, both runs use its ordinary projection, and with one counted request each, a positive report of an approved JavaScript EvalSession and policy admission, T-188 gives the run with the row Off ordinary tool calls with the reason setting and the run with the row On ordinary tool calls with the reason not materialized. Where the bridge cannot do that either, it carries no Puppet Master tools for that request and its tier disclosure is shown for both runs, and with one counted request each T-188 gives the run with the row Off ordinary tool calls with the reason setting and the run with the row On ordinary tool calls with the execution-shape reason of the fallback shape, delegated or reasoning-only, that CLI_Bridged_Providers admits for that request. Runs with more requests follow T-188.
  - On a request on which the script tool is not offered, for any reason, on an in-band route (a direct API route under Host Tool Execution whose model's tool_use capability is false, or a bridged CLI under the HTE strategy without supported structured tool intents), every Puppet Master tool call made on that request is an in-band tool call in the owned dialect, under the same admission gate; on a bridged CLI under HTE with supported structured tool intents the same calls are structured tool intents, never in-band.
  - Under the DAE strategy, on a request on which the script tool is not offered, for any reason, a CLI that accepts projected Puppet Master tools is offered each request-selected Puppet Master tool that the ordinary form materializes as its own projected tool, and Puppet Master dispatches each call with the checks a script's call to that tool gets.
  - A run offered the script tool on some requests and not on others carries, on every request that is sent and whose route can carry Puppet Master tools, that request's selected tool calls by the one channel this unit gives it. A request stopped before it is sent carries nothing and is recorded as T-188 says; a request on a route that accepts no Puppet Master tools carries none.
  - Under the DAE strategy, a projected Puppet Master tool that writes a file, called directly or from a script, changes only the run's jail, and the change reaches the canonical workspace only through DAE's scans and reconciliation.
  - Under the DAE strategy the tools a CLI process is shown are exactly those decided when its launch was prepared and are never replaced while it runs; when the offer or the selected tools change during a run, the next launch shows the new set, in both directions (script tool to one-by-one projection and back). T-188 counts each prepared launch as one request from the moment its offer is decided, including a launch whose spawn was then stopped or failed; a stop before that decision counts nothing.
  - Under the DAE strategy, a script call in a process whose approved JavaScript EvalSession is gone fails with the evaluator-unavailable result that Tools section 4.4 and Shared Integration Runtime own, and no ordinary tool is added to that process.
  - Where the essential catalog search of T-176 is policy-available, a request that can carry Puppet Master tools has it selected by T-176's bounded bootstrap path, with that owner's omissions and stop outcomes, in all three cases: the row On with the script tool offered (in the callable catalog), the row On with the script tool not offered (carried directly), and the row Off (carried directly).
  - A request that otherwise meets every condition for the script tool, whose policy-available essential catalog search cannot be materialized in the script's callable catalog, is not offered the script tool; it uses the ordinary form with that form's own omission or stop outcomes, the request's own omission reason is not materialized, and what that contributes to the run's record is T-188's to decide.
  - On a bridged CLI under the HTE strategy, a request on which the script tool is offered carries it through the hosted action loop with no provider tool_use, whether or not that CLI has a code mode of its own, and RM-021 still terminates the run on a provider-originated tool_use; under the DAE strategy, on a launch that is offered the script tool, it is a projected Puppet Master tool beside the CLI's own tools.
  - On a route that keeps native tools Puppet Master cannot disable, including a CLI's own tools under the DAE strategy, a request on which T-188 offers the script tool still carries it, a request on which T-188 does not offer it does not, and the provider's own tool calls stay outside Code Mode.
  - Every effective mode and typed reason on these routes is the one T-188 derives from the run's requests; this unit adds no rule for either.
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
  - 'Jared, 2026-11-25 (EST), answering the card "Should Code Mode''s fallback also get direct tool calls?": "Give the fallback the same direct calls".'
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
  - A script cannot make a tool call that the same request's selection and policy would not admit as a direct call: the normalized call and its arguments, including values computed while the script runs, pass the same admission checks at the shared T-178 boundary, with selection and policy held constant. Whether the route's direct channel could carry that call, its schema being offered there and its size, is the matter of T-189 and T-191, not of this test.
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

### T-191 - Code Mode Can Be Turned Off In Settings

```yaml
plan_unit_id: T-191
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Code Mode can be turned off in Settings. The ordinary setting row code.execution.code-mode in
  Plans/settings_inventory.json is a toggle labelled Code Mode, On by default, that can be set Everywhere and
  differ by Project, and Settings layering under Settings_System resolves it like any other inventory row. Its
  value is read once, when a run starts, and that run keeps it until it ends: changing the row applies from the next
  run that reads the row and never changes a run in progress, and a run that is paused and resumed under the same run ID, or given a
  new attempt, is still that run. Scheduled or delayed work takes the row's value in the same snapshot, at the same
  moment, as the rest of its requested configuration under its delayed-work owners (Run_Modes RM-053, Permissions
  PS-145, and SQR-019 of Scheduling_and_Quota_Resume), and its run uses that value when it is dispatched. A child or subagent run started by a run in progress uses the value its parent
  read, and a follow-up run spawned by context rotation continues the run it follows and uses that run's value, as
  Run_Modes has it inherit that run's mode, strategy, effective runtime state and a narrowed-or-equal tool-policy snapshot. On, the run requests Code Mode under T-188. Off, the run requests
  ordinary tool calls: Puppet Master does not offer the script tool or the script's callable catalog on any route or
  by any channel, including the in-band carriage and the DAE projection of T-189; the run uses the route's ordinary
  tool-call path, one channel for each call: the existing adapter-owned channel where the route has one, whichever
  adapter class of CLI_Bridged_Providers the route belongs to, for example
  the provider's tool-call API on a direct API route, tool intents returned to Puppet Master on a cooperative SDK
  or protocol route, Puppet Master tool and MCP projection on a server bridge, or structured tool intents through
  the hosted action loop on a bridged CLI under HTE; T-189's in-band
  carriage of the request-selected tools themselves on a route that carries Puppet Master tool calls in-band; and
  T-189's one-by-one projection of them on a DAE route whose CLI accepts projected Puppet Master tools. A route that
  accepts no Puppet Master tools carries none, On or Off. The run records
  requested and effective mode ordinary tool calls and the typed reason setting, as T-188's record gives them. The row
  changes only the requested mode and, through it, whether the script tool can be offered, how the request-selected
  tools are packaged for the route's one channel, as a script tool with its callable catalog or as individually
  callable tools, what T-188's record shows, and the
  differences listed below. The tools selected for
  the request, and each tool's own permission, approval, FileSafe, network and schema checks, deadline, events,
  receipt and usage rules, apply the same way in both modes, so the row changes no tool authority: in both modes
  the tools a run may call are bounded by what the request's policy snapshot allows, and each call gets the same checks.
  Within that ceiling each form selects and materializes under its own limits, as T-189 says, and the two ordinary
  paths, a request with the row Off and a request with the row On that lacks the script tool, get identical
  selections and omissions for identical inputs.
  With the row On, a request on which T-188 does not offer the script tool, for any reason, uses the same ordinary
  paths as a request of a run with the row Off, with the same bounded tool selection for the same inputs; the
  limits on what each form can materialize are T-189's. Tool execution records
  reflect the calls that ran, and the run's mode record is T-188's alone: with a script, T-190's script operation and nested-call attribution; and because a
  script can chain calls inside one provider round, the number of rounds a piece of work takes, where the run's
  tool-round ceiling falls, and the usage observed can differ between the two modes. A script can also pass a tool an
  argument it computed; an ordinary call carries only what the model writes out in one reply, so not every call a
  script made can be repeated as one ordinary call. The row governs Puppet Master's Code
  Mode only; a provider's own code mode stays a provider-native feature under the provider-native feature policy.
  Off is a choice, not a fault: no surface presents the Off preference, or the typed reason setting, as a fallback, a
  warning or a degraded run. No surface is required to show it: a surface that shows a run's tool-calling mode shows
  ordinary tool calls for such a run, with the reason setting where that surface shows reasons, and the run's
  status or stop entry need not mention it. Every other disclosure a run owes stays as its owner says, whatever the row's value:
  the execution tier and its limits, a delegated or reasoning-only fallback, model substitution and capability
  notices, and permission and safety notices.
gui_related: true
gui_classification_reason: Adds a visible, searchable Settings toggle and governs how its Off state is presented, as well as its runtime meaning.
depends_on: [T-188, T-189]
unblocks: []
acceptance_criteria:
  - Plans/settings_inventory.json holds exactly one row code.execution.code-mode, a toggle whose default is On; Settings renders and searches it from the inventory, with one manager home and no separately owned duplicate control. The ordinary All Settings entry of the same row, bound to the same value, is not a duplicate.
  - With the row Off for a run, no request of that run carries the script tool or the script's callable catalog on any route, and the run's record shows requested and effective ordinary tool calls with the typed reason setting.
  - Changing the row while a run is in progress or paused does not change that run, including after it resumes under the same run ID or gets a new attempt, and does not change a child or subagent run it starts afterwards or a follow-up run spawned by its context rotation; the next run that reads the row follows the new value.
  - A run dispatched from scheduled or delayed work uses the row value held in that work's frozen requested configuration, so a change to the row between scheduling and dispatch does not alter it; a quota or window resume of a run already started keeps the value under the same-run-ID rule.
  - With the row Off, the run is offered, through the route's ordinary channel where the route has one or T-189 adds one, each request-selected tool that the ordinary form materializes under T-176; a tool that T-176 defers or cannot materialize keeps that owner's explicit omission or stop outcome, and a request with the row On that lacks the script tool gets the same selection and the same omissions for the same inputs.
  - For any complete call to a tool that is materialized and admitted both in the script's callable catalog with the row On and in the ordinary form with the row Off, the permission, approval, FileSafe, network and schema decision is the same in both; for the directly callable tools named in T-190, where present in both, the decision on the same direct call is the same with the row On and Off. Both comparisons use the same request, policy snapshot, call-time inputs and answer to any approval prompt. With the row Off the script tool and its callable catalog are absent, and which tools each form materializes stays subject to that form's own limits under T-189, so a tool one form defers is outside this comparison; the script wrapper and nested identity on the records, the number of provider rounds and the observed usage may differ, and a call whose arguments only a script could supply is not required to be repeatable as one ordinary call.
  - With the row Off, on a route that carries Puppet Master tool calls in-band under T-189, every Puppet Master tool call the run makes is carried in-band, any request-selected tool that the ordinary form materializes can be called that way, and the run's record shows requested and effective ordinary tool calls with the typed reason setting.
  - With the row Off on a delegated or reasoning-only route, the run's record shows the typed reason setting and the route's own execution-tier disclosure is still shown.
  - On a route that carries Puppet Master tool calls in-band, or a DAE route that accepts projected Puppet Master tools, with no approved JavaScript EvalSession on any request of the run: a run with the row On and a run with the row Off are both offered, through T-189's added path, the same request-selected tools that the ordinary form materializes, with equal admission decisions; what each records and shows is T-188's and this unit's matter, not this comparison's; the permission, approval, FileSafe, network and schema decision on any call either run makes is the same for the same call-time inputs.
  - With the row Off, a run under the DAE strategy on a CLI that accepts projected Puppet Master tools is offered each request-selected Puppet Master tool that the ordinary form materializes as its own projected tool under T-189, and its record shows requested and effective ordinary tool calls with the typed reason setting.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plans-verify.py validate-settings-layering
  - python3 scripts/pm-plan-index.py validate
risk_class: code_mode_setting_truth_drift
reasoning_tier: high
context_scope: code_mode_tool_calling
implementation_surfaces:
  - Plans/Tools.md
  - Plans/settings_inventory.json
  - Plans/Settings_System.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 'Jared, 2026-11-24: "I want to check, is code mode an option in settings that can be turned off?  If not, it needs to be."'
  - Plans/Tools.md#T-188 and Plans/Tools.md#T-189 (requested and effective tool-calling mode, typed reasons, the preserved ordinary tool-call path)
  - 'Jared, 2026-11-25 (EST), answering the card "Should Code Mode''s fallback also get direct tool calls?": "Give the fallback the same direct calls".'
source_atom_ids: []
preserved_exact_tokens:
  - code.execution.code-mode
  - On by default
  - ordinary tool calls
negative_constraints:
  - Do not make the switch a hidden, debug-only, environment-variable or per-provider control; it is one ordinary Settings row.
  - Do not present the Off preference or the setting reason as an error, a fallback or a degraded state, and do not suppress any other disclosure a run owes because the row is Off.
  - Do not let the row change tool authority, which is the ceiling the request's policy snapshot allows, any permission, approval, FileSafe, network or schema decision, or the ordinary carriage and bounded tool selection that a request without the script tool gets; the script form and the ordinary form may select and materialize differently inside that ceiling under T-189.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
```

ContractRef: ContractName:Plans/Tools.md#T-188, ContractName:Plans/Tools.md#T-189, ContractName:Plans/Settings_System.md, ContractName:Plans/settings_inventory.json
