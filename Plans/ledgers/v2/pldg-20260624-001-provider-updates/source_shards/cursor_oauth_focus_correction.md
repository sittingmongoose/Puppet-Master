# Cursor OAuth Focus Correction

- ledger_id: `pldg-20260624-001-provider-updates`
- created_at_utc: `2026-06-25T15:22:50Z`
- source_ref: `chat:cursor-oauth-focus-not-api`
- scope: Ledger-only planning evidence. Do not edit canonical Plans from this shard.

## User correction

Jared said: `We should be focused on the oauth method, not the api.`

Preserved exact tokens:
- `We should be focused on the oauth method, not the api.`
- `oauth method`
- `not the api`

## Planning disposition

Accepted. The previous route-specific clarification remains true, but the planning priority changes:

- Cursor primary route for this feature should focus on the OAuth/browser-login/session method used by the Cursor app and ordinary interactive Cursor Agent CLI.
- API-key / SDK / local OpenAI-compatible bridge routes are secondary, fallback, or source-lineage evidence unless Jared later explicitly asks to make them primary.
- The `composer-api` and Cursor SDK research remains useful for understanding capabilities and adapter shape, but it should not drive the first Cursor provider plan.
- The verification blocker for Cursor should move toward proving the OAuth/session route locally end-to-end: `cursor-agent login`, `cursor-agent status` / `whoami`, model visibility, and a minimal prompt using the logged-in session.
- The API-key blocker must not block compile of the OAuth-focused Cursor route unless the API route remains an accepted deliverable in that compile scope.

## Negative constraints

- Do not compile Cursor with SDK/API-key/local bridge as the primary route.
- Do not require a Cursor API key as the main condition for Cursor OAuth-route support.
- Do not let `composer-api` adapter proof override the user preference to focus on OAuth.
- Do not let the OAuth focus erase the route-specific auth taxonomy; API routes still exist, but are not the focus.
- Do not claim OAuth-route support until local end-to-end prompt execution works through the logged-in Cursor session.

`gui_related`: `false`; this is provider/auth routing and verification policy, not GUI/UI/visual presentation.
