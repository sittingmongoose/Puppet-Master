# Deferred Return Handoff — Usage — v6

**Timing:** preserve now; integrate only after the current Usage redesign and its Plan updates are finalized. Do not add another current concept iteration.

## 1. Attribution boundary

Usage owns measured provider/model/account/plan settlement and compact task attribution. It does not own scheduling, installations, browser execution, capture, Project Move, backup, update, Server connections, or resource governance.

Provider/model events may retain:

```text
Project / Home Server / Execution Host / Environment
provider / account / connection / product / model / plan
requested/effective route and helper purpose
Goal / Plan / thread / agent / Crew / subagent lineage
input/output/cache/reasoning tokens where supplied
actual cost, allowance, reset, overage, and source quality
provider-active, local-compute, wait, and maintenance timing
```

Only actual model/provider events contribute model tokens, provider quota, plan usage, or provider cost.

## 2. Local and maintenance work

These are not provider tokens or model charges:

- BrowserAction/Browser Program execution;
- built-in-browser CPU/GPU, representations, screenshots, video, traces, retries, and artifacts;
- Git/Jujutsu/SSH/source operations;
- installation/update/authentication probes;
- Tool Store work;
- Runtime/Cluster/Registry connection checks;
- Project Move, backup/restore, update, indexing, hydration, or reconnect traffic;
- container/Kubernetes execution unless it invokes a separately billed external service.

They may appear in linked diagnostics/performance evidence, not blended into token/cost totals.

## 3. Browser terminology correction

Use:

```text
one-action baseline
action batch
PM Browser Program
PM-native Expert Browser Program
external Project test command
optional external browser adapter
```

Remove `Playwright-shaped program` or any implication that Playwright is PM's browser runtime. A repository-owned Playwright suite is an external Project command whose actual model/provider calls, if any, are attributed normally.

## 4. Trust and privacy

Usage rows need stable identities, timestamps, source/freshness/currentness, and confidence. Do not embed raw URLs, DOM, cookies, tokens, authorization headers, screenshots, source paths, CLI profile paths, or secrets.

Provider readiness and usage telemetry availability are separate. Missing usage telemetry must not make an otherwise ready connection appear unauthenticated.

## 5. Later closure

After the finalized Usage concept returns, reconcile this attribution with its provider grouping, multi-account switching, free/unconfigured account hiding, budgets, thresholds, resets, overage, run-out projections, context ring/lens, and data-quality grammar. Then close commands, schemas, wiring, DRY, tests, and responsive GUI insertion. Do not implement from this preservation handoff alone.
