# Start Here — Usage Concept Update

This packet is the final cumulative replacement for every unused Usage delta/handoff from this thread.

It assumes the original Usage work already exists. Update that work rather than discarding its strongest concepts.

## Core ownership

```text
Settings
  Configures providers, accounts, connections, models, plans, continuation, limits, and policy.

Routing / Multi-Account
  Resolves requested/effective route and switching.

Usage
  Reports measured/provider-reported state, history, projections, forecasts, data quality, and receipts.
```

Usage must not create a second provider/account/settings system.

## Read order

1. `IMPLEMENTATION_PROMPT.md`
2. `01_PROVIDER_ACCOUNT_PLAN_AND_SETTLEMENT.md`
3. `02_EVENTS_ROUTES_HELPERS_CACHE_AND_CONTEXT.md`
4. `03_GOAL_CAPACITY_TIME_AND_OPERATIONAL_STATE.md`
5. `04_SERVER_NETWORK_MAINTENANCE_AND_DATA_QUALITY.md`
6. `05_GUI_CONTEXT_RING_DEMO_AND_TESTS.md`
7. `06_PLAN_COMMAND_WIRING_DRY_IMPACT.md`
8. machine-readable registers

## Scope

Update the existing Usage concepts/implementation in the currently authorized concept scope.

Do not edit PMConcept7, Plans, Settings concepts, Assistant Chat concepts, Commands, Wiring, or DRY owners unless the user separately authorizes that work.

Track all future canonical impacts in the supplied registers.
