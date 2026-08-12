# Deferred Return Handoff — Assistant Chat — v6

**Timing:** preserve now; integrate only after the current Assistant Chat redesign and its Plan updates are finalized. Do not add another current concept iteration.

## Later insertion contract

Preserve the useful return material:

- durable `thread.search/read/spawn/request/await/branch` operations;
- stable operation/request IDs, inactive-thread inbox, idempotency, cycle/fan-out controls, cancellation, timeout, lineage, and receipts;
- thread-local provider/model/Persona/effort/access/context/worktree state;
- durable outbox, reconnect cursor, snapshot fallback, stream coalescing, and stale-result fencing;
- full history, Context Lens/Ring, Compact Now, rewind, restore, and branch lineage;
- compact Browser Program/testing/source-control tool cards with human progress and final evidence;
- multiple agents/threads/Goals watching or controlling independent sessions without ownership leakage;
- parent/child thread summaries and refs rather than full transcript duplication;
- attachment transformation and alternate-provider consent/lineage.

## Server-first correction

Chat is served by the Project Home Server. Switching Windows/Mac/web Clients against the same Home Server does not synchronize or migrate a thread; all Clients observe the same canonical thread state.

Do not add a Project or Server banner inside Chat because the active Project is already in the application shell. Connection, execution location, Project Move, and update state use shared bottom-status surfaces and compact deep links.

## Authentication/security correction

- Never ask users to paste secrets, tokens, or provider callback material into ordinary Chat.
- Setup actions invoke the canonical Integration Runtime/Onboarding/Settings command path.
- `AuthBrowserSession` is human-only and unavailable to agents, Goals, tools, MCP, Chat browser controls, screenshots, recordings, DOM capture, or network evidence.
- Ordinary browser sessions remain PM-native; there is no PM Playwright tool or Chat command family.

## Usage/context boundary

Human progress is not automatically model context. Tool cards render compact runtime projections; agents fetch details on demand. Local browser/tool/source execution does not become provider tokens or cost.

## Later closure

When the finalized Chat concept returns, reconcile GUI controls, commands, typed payload/result/error, events/receipts, production wiring, DRY owners, persistence, permissions, accessibility, responsive states, and deterministic test fixtures. Do not implement from this preservation handoff alone.
