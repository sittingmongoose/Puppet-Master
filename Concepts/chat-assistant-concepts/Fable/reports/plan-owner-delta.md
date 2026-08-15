# Fable — Plan-Owner Delta

Per-owner impact of the Fable concept system. Owners marked *(not represented in
packet)* had no bundled PlanUnits in `machine/original_relevant_plan_units.json`;
their entries record boundary compliance only. No canonical document was edited.

## Owners with bundled units

### 1. Plans/assistant-chat-design.md (ACD-*)
- **Clarify** ACD-437..444: window-03 hosts the shared selector row inside its instrument band via a window-provided slot. Same component instance, same popup family, same single-overlay rule; only placement differs. If hosted placement becomes canon, add a hosted-slot clause.
- **Add** ACD-027..031: two new question-review compositions (Dossier review page; Choreograph stack/fan) preserving queue order, skip-reversal, submit gating, and historical records.
- **Clarify** ACD-100..129: eight compact-work compositions all project the shared operation records; in-place rewrite + condense-to-reopenable is honored in every one.
- **Clarify** ACD-151..168: subagent projections (agents/hands/dancers) show counts, per-child activity, status, elapsed; children never address the user directly — the parent questionnaire path is stated in three compositions.
- **Clarify** ACD-012: Edit is offered only on the latest eligible user message; no Resend anywhere; Stop is composer-only.
- **Conflict recorded** ACD-410 vs ACD-434 (`cmd.chat.focus_thread_usage`) — see true_open_decisions.

### 2. Plans/FinalGUISpec.md (F3-*)
- **Clarify** F3-422/423: jump-to-latest is a floating chip anchored to the scroll region; composer + selector row form the bottom group in seven concepts (deck-hosted in window-03). Width envelope (520/750/975/1200 + continuous) honored via `--fw-chat-width`.
- **Clarify** F3-424: all overlays use the single popup family with corner-origin sprout, in-place resize, collision flip, reduced-motion final state.
- **Clarify** F3-469/471/498: the quiet shell keeps the left Activity Bar + side-panel slot; chat width is independent of the rail; the workspace runs edge-to-edge under the Hub's 1440 preview canvas.

### 3. Plans/Goal_Runtime_System.md (GRS-*)
- **Clarify** GRS-002/005: one store-owned goal record; every rendering is a projection; state survives reload (persistence probe).
- **Clarify** GRS-012: completion emits a receipt through the shared receipt channel; no chat-local completion authority.
- **Clarify** GRS-019: blocked exposes cause, scope, attempted recovery, why autonomy stopped, and next safe action in all eight compositions.

## Owners without bundled units *(not represented in packet)*

4. **UI Command Catalog** — no canonical edits; candidate ids provisional (see candidate-command-delta.json); two alias collisions recorded for adjudication.
5. **Production Wiring Matrix** — no edits; closure chains recorded in candidate-wiring-delta.json.
6. **DRY owner contracts** — no edits; twenty shared-owner entries recorded in candidate-dry-delta.json.
7. **Permissions/FileSafe** — approvals render compact-decision/expandable-evidence with scope + persistence statements; deterministic gates stay external to prose.
8. **Usage / context owner** — ring is a projection; Compact Now emits a receipt; no chat-local cost model; capacity forecast rendered verbatim from owner data.
9. **Provider Manager / Integration Runtime** — setup states deep-link with preserved return context; no PM-direct OAuth for Claude/Antigravity CLIs; no silent installs.
10. **Multi-Account routing** — requested vs effective route retained and displayed truthfully with reason.
11. **Thread Service / Home Server** — server-owned durable state modeled: outbox, replay idempotency, snapshot catch-up, branch tree with parent pointers.
12. **Orchestrator** — capacity shown as sustainable pace (2 concurrent, 3 waves, reserve preserved); required roles never silently vanish; queue behind the window instead.
13. **Crew** — modeled as execution composition (roles, routes, waves, worktrees, synthesis note), never a Persona/mode/permission.
14. **Worktree Manager** — leases with owners shown; conflict warning preserves patches; no worktree removal from Chat.
15. **Artifact service** — Project-backed identity; open/reveal handoff receipts; opening never admits into model context.
16. **BrowserWorkspace owner** — PM-native vocabulary only (BrowserWorkspace, Browser Action, Browser Program, Expert Browser Program); no Playwright-facade language anywhere in UI or fixtures; auth sessions human-only (fixture states redacted lifecycle only).
17. **Test runtime** — compact pass/fail summary + failing names; no raw logs in transcript.
18. **DAP/debug owner** — one-line session state (paused at breakpoint + location) in ops summary.
19. **LSP owner** — not visually exercised beyond ops summary; recorded as untested surface in known-gaps.
20. **Eval sessions owner** — same as above.
21. **Media manager** — four attachment classes with bounded-transformation notes and lineage.
22. **Notification stack owner** — bell + count in title bar only; inline outcomes stay inline; no chat notification panel/stack/bell.
23. **Settings owner** — deep-link receipts only; spellcheck source policy named in menu copy; no settings surfaces rebuilt.
24. **Persona registry** — persona selector notes capsule boundary ("behavior, not authority"); no persona bodies in context claims.
25. **Assistant memory owner** — not visually exercised beyond Lens provenance wording; Working Set ceiling and Gist tiering not rendered; recorded in known-gaps.

## Provider-CLI final adjudication (correction packet 2026-08-13)

The restored `PROVIDER_CLI_FINAL_ADJUDICATION.md` governs. This concept system now implements and displays the adjudicated runtime-demand flow: requirement detected → inspect existing installations → **Provider Setup Required** → deep-link with preserved continuation token → explicit user-triggered **Install from the official source** (publisher/provenance/version/architecture/license/adapter verification copy) → **separate Authenticate** step → readiness verify → **resume only if the continuation is still current**, with stale-continuation rejection demonstrated. `Auto`/`On` maintain approved installations only; nothing acquires silently; no bundling or "Included with this Server" language exists anywhere in the folder (grep-audited). The adjudication's supersession list over `PM_Provider_CLI_Final_Policy_Return_Handoffs_2026-08-08` (baseline-eligibility clauses, `included_execution_baseline` route, caching/mirroring-as-normal-class, §8 copy, §9 rejection, and the Optimization/Shared-Integration-Runtime return statements) is recorded here for the owner; concept copy follows the stricter provider-specific rule. Unaffected classes honored: general four-class tool acquisition, CEF/Chromium bundled core, Git/Jujutsu baseline.

## Supersessions honored
Full Access supersedes Yolo (no yolo/regular anywhere) · PM-native Browser Program supersedes Playwright-facade language · server-first supersedes local-first (outbox/replay model) · left Activity Bar supersedes right-panel framing · passive questionnaire expiry stays retired · no Resend, no message-level Stop.
