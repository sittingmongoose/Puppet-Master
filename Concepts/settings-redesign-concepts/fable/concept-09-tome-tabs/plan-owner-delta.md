# concept-09-tome-tabs — Plan-owner delta (fable · 09 Chapters, bakeoff packet 2026-08-18)

Concept register only. Nothing here edits canon; the implementation audit adjudicates.

## 1. Owners touched

| Owner | Kind | One-line evidence |
| --- | --- | --- |
| Plans/FinalGUISpec.md | extends | Chapters navigation model: persistent right-edge chapter spine (Home + 12 numbered chapters) + layered page depth with slim named under-layer edges; peel/push as an explicit layer-stack state machine; narrow = spine top strip + full-width push. |
| Plans/FinalGUISpec.md | extends | Escape ladder popup → search dropdown → detail drawer → manager object detail → one layer out → stop at Home; manager tab switches use replaceState so browser Back always moves one Settings level. |
| Plans/settings_inventory.json | conflicts | Rev-2 probe id `system.health.diagnostics-verbosity` is not in the 828-row inventory; the concept answers it with an honest chapter notice. Also two fx.import-conflict ids (`permissions.approvals.rule-count`, `general.sounds.master-volume`) are not inventory rows. |
| Settings schema/registry | extends | Seven row states rendered from resolveRow/rowStates; typed notice→destination contract needed for the pm2-fx-* notices the Home attention list surfaces; collection-valued rows (list/keyvalue) need an editing grammar or a manager-owner marker. |
| Provider CLI plans (CLI-bridged providers) | extends | Answer-block-first provider pages with accounts/models/limits/routing/installs/setup/activity/advanced as manager-local tabs; unknown-owner Ollama renders a refusal reason in DOM text; ask-first Codex update; verification-failed→rolled-back Copilot history. |
| Project-copy policy owner | extends | Copy as four stacked step sheets (the concept's layer metaphor inside the transaction) with counts, per-category table, item inspection, credential-reference note, staged restore point, atomic verified apply, working rollback. |
| ObservableWork owner | extends | Concept drives bare op handles queued→running→done (indeterminate); determinate bars only with a real denominator (copy apply). No second progress owner. |
| Wiring matrix owner | extends | Ten keystone traces registered (candidate-wiring-delta.json), all flagged concept_local_state. |

## 2. Supersessions demanded

1. **Chip/bloom Settings contract** — superseded by the persistent chapter spine + layered canvas; `cmd.settings.bloom.open` flagged retire (compatibility alias only if telemetry shows callers).
2. **Global previous/next-manager navigation** — absent by design; managers are chapter destinations or search landings, never slides.
3. **Stale probe id** — `system.health.diagnostics-verbosity` replaced by `system.health.platform-diagnostics` in every c09 matrix; the stale id degrades honestly instead of crashing.

## 3. Boundary confirmations

- **Project-only.** Every editable row applies to Puppet Master; the header shows the Project as context, never a scope selector. legacyScope metadata appears only as history prose inside row Details.
- **Copy is a transaction, not a link.** One-time language throughout; source and destination stay independent; credential references only, with the shared no-secret note; rollback restores exactly.
- **Provider CLIs are acquired explicitly.** The Cursor CLI setup page is user-triggered, official-source (cursor.com/cli), exact host/environment, with sign-in as a separate step; unknown/ambiguous ownership stays manual-only (Ollama update refused with its reason).
- **Single owners stay single.** Ops render through PM2.states events; DRY state is a read-only projection in m.dry; the concept adds no governor, no progress owner, no loop breaker.
- **Deferred owners stay deferred.** Nine insertion shells name their owner, render the return contract, and expose zero actions.

## 4. Open questions for the audit

1. Home attention cap when fixture notices are active (currently may exceed the 2–4 baseline while overlays are on).
2. Object-detail history grammar: push (current) vs replace for roster selection.
3. `store.attention()` ignores URL-applied scenarios (persist:false never writes the store key); each concept re-derives from `PM2.states.activeScenario()`. Candidate shared fix: an active-scenario-aware attention() in pm2-store.
4. Should fixtures be constrained to real inventory ids?
