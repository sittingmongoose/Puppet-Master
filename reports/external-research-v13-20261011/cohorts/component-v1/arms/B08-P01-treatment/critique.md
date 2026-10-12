# Independent critique — B08-P01 treatment

## Review frame

I reviewed the permitted B08-P01 brief, plan, investigator draft, source index, and listed CPython/neighborhood copies. I expanded the queue docs, implementation, and regression-test ranges with the permitted source reader. The source index’s commit 8183fa5e3f78ca6ab862de7fb8b14f3d929421e0 is the official signed v3.13.9 release commit. I also checked the public pinned CPython source and cancellation guidance. The critique and final proposal were produced independently for this treatment arm; no other arm’s semantic conclusions were used.

I ran witnesses/queue_and_capacity_witness.py and preserved its source, exact command, full stdout and stderr, runtime, results, and limitations. The environment provides CPython 3.14.4, not 3.13.9. Therefore the execution is a bounded behavioral corroboration, while exact target-version claims are governed by the pinned 3.13.9 source, docs, and tests. I did not run the CPython test suite or any converter workload.

## Findings

The draft is directionally sound on the selected bounded queue, four workers, queue versus worker capacity, job outcomes, one task_done() per retrieved item, temporary output publication, graceful drain, sentinel compatibility, conditional workload estimates, and the need for application validation. Those claims are retained with sharper acceptance and lifecycle definitions.

The critical defect is its force-stop inference: immediate shutdown plus an empty queue and join() cannot establish success. CPython’s pinned docs say immediate shutdown drains waiting entries and reduces unfinished work; join() may then unblock without work being performed. Its implementation does that accounting. Its tests separately show that a retrieved item remains unfinished after the other waiting item is drained. The witness reproduces both cases: a queue containing only waiting work joins after that work is abandoned, and an active job acknowledged as cancelled plus an abandoned waiting job also joins with zero successes. The draft’s “Completed” summary and “double-count” rationale are rejected. Waiting items must be marked ABANDONED from the application ledger before immediate drain; active workers must report their actual outcome after cleanup; join() remains an accounting barrier only.

The draft also needs an explicit queue-acceptance boundary. qsize() omits workers, and put() can block before acceptance; concurrent submitters may retain payloads outside the 24 accepted queue/worker slots. The final proposal counts acceptance only after successful insertion and shows pending/rejected submissions separately. The stop operation must close the admission gate and shut down the queue in one event-loop turn so blocked submitters are rejected and already inserted jobs are drained or abandoned consistently.

The temp-output rule is retained and made operational: unique component-owned staging paths, validation before publication, explicit collision policy, cleanup on failure/cancellation, and a cleanup error visible in the outcome. The in-session ledger does not make filesystem publication crash-atomic; no crash-recovery claim is made. Likewise, asyncio cancellation is cooperative. A force-stop request cannot promise to terminate blocking loop code or an external child process; a still-running cancellation is reported as pending, and subprocess termination remains the separate adapter’s responsibility.

The 12-job/4-worker/2-second estimate is retained only in its declared homogeneous, independent, no-overhead domain. A separate discrete worker scheduler returned 6 seconds for 12 jobs and 2 jobs/second for 120 jobs. This validates the idealized schedule, not document-converter throughput. The final validation plan requires target-version application tests and representative workload measurement.

## Decision record

Detailed accept/amend/reject/keep/uncertain dispositions and primary evidence for every material draft claim are in criticism-dispositions.md. Final claim-to-source and claim-to-witness mappings, including source pins, hashes, locators, scope, and remaining uncertainty, are in source-map.json.
