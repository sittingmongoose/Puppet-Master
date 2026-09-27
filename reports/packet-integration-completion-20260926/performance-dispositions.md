# Performance dispositions: conditional `thread.branch` and provisional packet latency inputs

**Work item:** `performance-dispositions` (conditional thread branching and provisional calibration inputs) of [the packet integration completion](./README.md).
**Base:** `0a9f06969` (2026-09-26). Resolves open findings F1 and F2 from [the prior review](../concept-packet-integration-20260926/README.md) by owner adjudication. Packet prompts are source data; current `Plans/**` owners supersede superseded packet decisions; static/concept results certify no native runtime behavior.

## Disposition 1 — F1 `thread.branch`: DEFERRED / UNADMITTED (conditional clause not currently applicable)

**Decision.** The packet clause is **not currently applicable under current owner semantics and is deferred, unadmitted, and not retired**. No `cmd.thread.branch` command, alias, or handler is admitted, and none may be registered until the exact future admission gate below is satisfied. Admission was NOT inferred from the missing catalog spelling, and the clause is not recorded as dropped or retired — the packet's own qualifier is preserved.

**Reason (grounded in current owner evidence).**

- Current canon defines exactly three durable logical thread operations: `thread.request`, `thread.spawn`, and `thread.await` — `Plans/orchestrator-subagent-integration.md` "Durable orchestration and sustainable-capacity addendum (2026-08-13)" (operation identity, lineage, permission ceiling, ordering, restart disposition), `OSI-433`, `OSI-435`, and the central family `cmd.thread.request|spawn|await` (`Plans/UI_Command_Catalog.md:11487-11489`, `Plans/Commands_System.md:4067-4069`, outbox retry/cancel alongside).
- No owner prose establishes what an Orchestrator-level copy-on-write branch would target (branch of which thread state), its per-thread ordering/idempotency/restart identity, or its parent-lineage and permission-ceiling inheritance. An operation with no defined target identity and authority semantics cannot be admitted by inference.
- The packet source itself is conditional: `PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/02_FINAL_DECISION_REGISTER.md` §12 (lines 185-188) lists `thread.branch` among durable logical operations with "copy-on-write branching **where applicable**". Missing spelling in the catalog therefore proves neither mechanical drop nor retirement; it is not admission evidence in either direction.
- `cmd.chat.branch_from_restore` is **distinct**: an Assistant Chat restore-point application under `PD-RSP-08` (`Plans/assistant-chat-design.md:1226-1230`) that materializes a frozen conversation boundary into a new conversation `thread_id`/`branch_id` (catalog row `Plans/UI_Command_Catalog.md:8584`; one-handler wiring per `Plans/Commands_System.md:152`). It is already centrally registered for a different purpose and does not satisfy, substitute for, or pre-admit the Orchestrator clause.

**Exact future admission gate (all three, in order).**

1. A recorded owner adjudication in `Plans/orchestrator-subagent-integration.md` and `Plans/Shared_Integration_Runtime.md` naming a concrete orchestration need that request/spawn/await cannot express, and defining the branch target identity, per-thread ordering/idempotency/restart disposition, parent Goal/Plan/agent lineage, and child-equal-or-narrower permission-ceiling inheritance.
2. Central admission by the Commands owners: typed request/result contract, one `UI_Command_Catalog` row, one `Commands_System` row, one wiring row, one sole handler — registered there, never by the Orchestrator or Shared Runtime owners directly.
3. Restart/replay/duplicate-branch contract fixtures before any enablement.

**Recorded in:** the adjudication paragraph in the Durable orchestration addendum of `Plans/orchestrator-subagent-integration.md` (plus `OSI-433` source lineage now citing the packet decision register and preserved tokens `thread.branch`, "where applicable", "copy-on-write branching"), and a one-line applicability pointer in the "Commands, events, wiring, and GUI/reverse coverage" prose of `Plans/Shared_Integration_Runtime.md`.

**Deliberately not done:** no `UI_Command_Catalog.md`, `Commands_System.md`, or wiring edits; no schema, fixture, or handler invented to close the list; no retirement note.

## Disposition 2 — F2 six provisional packet latency figures: PRESERVED as versioned calibration input under SIR-017 (not thresholds, not claims)

**Decision.** The six packet figures are now preserved in canon as the versioned register **`packet-latency-calibration-inputs.v1`, revision 1 (2026-09-26)**, in dedicated calibration-input prose directly under `SIR-017` in `Plans/Shared_Integration_Runtime.md`. They are calibration starting points for the future benchmark profile — **not** SIR-017 acceptance thresholds, not pass/fail gates, not performance claims, and not measured results. SIR-017's `acceptance_criteria` are unchanged and still freeze no number; the packet framing is preserved verbatim: "All targets are implementation gates to calibrate, not claims of existing performance."

| Gate (P95 input) | Modern provisional input | Legacy provisional input |
|---|---|---|
| input-to-visible acknowledgment | ≤50 ms | ≤75 ms |
| pause/stop acknowledgment under saturation | ≤100 ms | ≤150 ms |
| provider fragment receive-to-paint | ≤50 ms | ≤100 ms |

Source: `PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/07_PERFORMANCE_PLATFORM_STORAGE_BENCHMARKS.md`, "Core latency/behavior gates" (lines 5-14); already cited in SIR-017 `source_lineage`.

**Tie to measured admission (recorded in the register).** A future hard gate may be produced only by the owner benchmark profile: a versioned scenario/profile/toolchain set with hardware and total-process-tree evidence per `Plans/Release_Supply_Chain.md:1019` ("benchmark scenario/profile/toolchain hashes and raw P50/P95/P99/worst/failure/soak receipts; no static substitution"), measured across the existing SIR-017 workload matrix — 1/10/50/200 logical threads, many named Plans, platform lanes, and the 24-hour soak included — reported per gate family as P50/P95/P99 plus worst-case and degraded/failure evidence. Calibration may move any figure in either direction from these inputs; **measured evidence plus explicit owner approval of that measured evidence is what admits a threshold, never packet inheritance**. No measurement exists today and none is claimed; this disposition fabricates nothing and replaces no current admission.

**Deliberately not done:** no numbers in `acceptance_criteria` or schema/fixtures; no benchmark run or runner claimed; no release-admission change.

## Genuine blockers

None. Both items were owner-side records resolvable inside the three owned files. Central catalog/wiring/semantic-validation companions and governance reseal remain with their own owners per the completion report's item statuses; no outside-owned change was found necessary for these dispositions.

Independent GPT-6 Sol high review accepted both dispositions and identified one metadata correction: the preserved branch tokens now occur in OSI-433 canonical text with the same deferred admission boundary. Root applied that narrow correction after the native producer completed. Required generated derivatives and landing checks remain batch work.
