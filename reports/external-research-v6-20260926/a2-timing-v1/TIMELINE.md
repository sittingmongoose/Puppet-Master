# A1/A2 read-only timing diagnosis

A2 remains **FAIL/INCOMPLETE** (6 acknowledgements, 12 snapshots, 15 pairwise overlaps in one marker batch). A1 remains failed. This extraction neither attaches a Store nor rescores either run. The single newer-work check found a clean branch and local/remote HEAD at `158140cb425fe3c4ceaa3eef1715ce66126e4c8a`.

**New evidence: A2's parent model tasks recorded four HTTP 503 errors with 60,000-ms retry delays.** Three retries reached their next opening-stream boundary after **180.023499 seconds combined**; the fourth was cancelled after 13.905108 seconds of its scheduled wait. These are task-ID-matched journal intervals, not inferred throttling. They explain a large measured component inside the slow response intervals; backend queueing, compute and the reason for the 503s remain unknown. [Retry records](evidence/retry-intervals.json)

All offsets below use each run's recorded phase start: A1 `1790625309.2463663` (execution clock, not its earlier orchestration start), A2 `1790701385.2851405` (Go). Journal timestamps are epoch microseconds, MSP item timestamps epoch milliseconds, trace timestamps UTC. Exact IDs, per-call intervals and source line/hash references are in the [model chronology](evidence/model-chronology-qualified.json) and [tool/host chronology](evidence/tool-host-chronology.json).

## Requests and the batches they produced

| Run / response ID | Parent admission → model completion, phase seconds | Reported duration | Committed batch | Input / output / reasoning / cache-read tokens |
|---|---:|---:|---|---:|
| A1 `resp_6abac6214818a349e9d542df` | 2.366 → 14.378 | 12.008s | 9 template Reads | 20,675 / 901 / 384 / 0 |
| A1 `resp_6abac62dc8c2086278d64fff` | 14.875 → 40.769 | 25.890s | 6 payload Writes | 24,758 / 2,518 / 534 / 20,593 |
| A2 `resp_6abbef69b6b6716cafb04848` | 6.619 → 36.682 | 30.057s | 9 template Reads | 20,677 / 691 / 200 / 0 |
| A2 `resp_6abbf007792c41c8de60403b` | 37.239 → 206.241 | 168.997s | 6 payload Writes | 24,574 / 2,904 / 926 / 20,593 |
| A2 `resp_6abbf068448adf4253684528` | 206.762 → 290.888 | 84.121s | 6 marker Writes | 27,975 / 540 / 94 / 0 |

Batch associations use `assistant_tool_calls_committed.response_id`, not the position of a duration in an array. A2's successful request IDs, respectively, are `f01e5ca4-9330-4c0b-b89c-fd51b7ae6c79`, `32fe6697-35f0-4e7c-bd33-b96181f1bf42`, and `19d07a6e-70cb-491a-8535-14ffe88f8aad`. A2 session/run are `01a0ee1e-ce2c-70e3-8379-280f794f1f1d` / `01a0ee1e-cf34-737a-bbb3-b6300d2899dd`; A1 session/run are `01a0e995-e9c2-7091-9e95-d05e89632941` / `01a0e995-eab4-74c2-8412-3bc844449a26`.

`durationMs` is the native completed-parent-response counter. Outer trace admission/terminal durations differ slightly (A2 30.077, 169.016, 84.138s) and must not replace it. These outer parent windows are disjoint in this capture; children and host polling overlap them. The response sum 283.175s and first-two comparison 199.054s versus A1's 37.898s are descriptive, not pure reasoning time or a controlled speed ratio. Reasoning tokens are already within output accounting, not additional tokens.

The payload model task `01a0ee1f-47a4-7ee2-9c13-d48d74adadb1` recorded 503 request IDs `44830e36-bb14-4f9c-a65d-cb9c1f20b5e0` and `9bad18f6-f423-4825-b3d8-575a181111f7`; scheduled-retry→next-opening intervals were 60.009965s and 60.006065s. The marker task `01a0ee21-ddd6-7560-99b9-b0d631236db4` recorded `d44cd366-65db-45bc-98f0-5ee908b32ac7`, then 60.007469s to reopening. These waits are **inside** the corresponding response intervals, not added to them. A1 has no corresponding parent retry-status records in its bound capture.

## First output, children and delivery

A2 directly recorded response-created boundaries at +34.144, +191.687 and +288.338s. The earliest exposed parent MSP items were +36.726 (toolCall), +191.697 (reasoning) and +290.926s (toolCall). Thus tool-item visibility is not a first generated-token measurement. Successful streams reported 83, 17 and 131ms to first wire event; that counter starts at the stream boundary, not model admission. Generic trace first-SSE lines lack request IDs: their parent assignments in the mechanical extraction are contextual, explicitly qualified, not independent proof of first-token latency. Native turn `timeToFirstTokenMs=185245` has unestablished exact semantics here. No queue/compute/first-token decomposition is claimed.

A2 reminder item intervals were +6.566–206.653 (`6a38b86d-24eb-49c9-82b4-00d94dc0843a`), +206.700–291.287 (`fd48871a-9f36-4eb8-a59c-6d421b69bc80`), and +291.336–306.730s (`eeb225c2-220a-4503-b3ac-b5265e883785`, cancelled). The first child also has a traced 30s outer-attempt failure and 1s scheduled retry. Item duration is not child compute occupancy; child model-attempt terminals and item completion differ. A1's first reminder spans +2.321–41.114s; the second starts +41.151s and has a traced cancellation but no MSP item completion. These overlap parent work and cannot be added to it or presumed to block it.

| Delivery boundary | A1 phase seconds | A2 phase seconds |
|---|---:|---:|
| Read batch commit → final terminal → result | 14.385 → 14.714 → 14.759 | 36.691 → 37.087 → 37.142 |
| Payload batch commit → final terminal → result | 40.776 → 41.065 → 41.102 | 206.249 → 206.594 → 206.640 |
| Marker batch commit → final terminal → result | Never occurred | 290.896 → 291.230 → 291.274 |
| Receipt publications | None | 291.300–291.377, all six |
| Receipt Reads | None | None |

All A2 marker intervals overlap pairwise (15 pairs, not 15 trials). Receipt observations show state and snapshots before publication. There is no separately instrumented acceptance timestamp: marker-result→receipt gaps (26.7–103.2ms) include polling, validation and publication. No seventh finding or revision is invented. All native Reads in both journals address the nine templates.

## Cancellation and separate host clocks

After the markers, A2 parent step `…:3:1`, task `01a0ee23-2873-7cc2-a42f-7fb89c101b18`, was admitted at +291.398s. Request `8c1f1555-c5d6-4899-adee-abcc1090b809` returned 503 at +292.814s and scheduled 60s. The cap was logged at +306.679s (300.3 native seconds). Task cancellation was recorded at +306.719s; trace outer terminal at +306.724s. No fourth completed response, receipt Read or new tool batch was committed. This identifies the unfinished model step without reconstructing its intended answer. Clean session end was recorded at +321.736s; the existing shutdown grace remains included.

| Host boundary / interval | A1 | A2 |
|---|---:|---:|
| Staging to driver launch | 1.248s | 2.939s |
| Driver + receiver interval | 39.945s | 319.020s |
| Receiver-core accumulated time (overlapping) | 0.745s | 16.482s |
| Pre-audit elapsed → execution/freeze terminal | 41.195 → 41.323s | 321.962 → 322.094s |
| First publication confirmation from phase start | 398.609s | 391.010s |
| Final late accounting confirmation | Separate prior record | 526.361s |

The pre-audit→terminal gap bounds audit plus final manifest/report work; it is not an isolated audit runtime. A1 additionally had 464.246s orchestration before its execution clock (862.856s to first confirmation). A2's first publication was 1.010s late; execution→first-confirmation took 68.917s. A2 late-accounting preparation was +523.068s, with its VM final confirmation +526.361s now source-pinned. Neither elapsed receiver CPU nor overlapping reminder intervals imply recoverable wall-time savings. A2's 493 settled polls had zero projection publications; that remains partial evidence only.

## Append-only accounting erratum and limits

The single permitted lookup found an exact-session A2 process trace (SHA-256 `9fc81deaf3cdd8076a56a4b108af85c3135048a32c604a4a4421af3e6582bf8d`). It was not captured inside the original run root. The frozen usage addendum's unknown physical-attempt fields remain unchanged. The newly located trace directly contains **11 provider attempt records**; adjacent ID-bearing model admissions and task retry records support a **7-parent / 4-child contextual partition**, although the provider lines themselves lack IDs. A2 has four parent outer steps (3 completed, 1 cancelled) and four child outer attempts across three reminder items. Child/cancelled tokens and whole-run tokens remain unknown. “No retry” in the original result refers to no host redispatch/replacement; internal native retries did occur. No cause such as throttling, quota, or provider capacity is established by HTTP 503 alone.

[Source identities and preservation check](SOURCE_PINS.json) bind all cited artifacts. All 117 original A1/A2 run files remain byte-identical; raw traces stay on the VM. Child provider request IDs and token totals unavailable in these bound artifacts are not reconstructed.
