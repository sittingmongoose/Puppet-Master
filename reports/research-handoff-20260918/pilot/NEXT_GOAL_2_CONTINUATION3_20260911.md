# Goal 2, continuation 3: unblock the launch gate without live per-request reconciliation (issued 2026-09-11)

Written by Jared's reviewer after the blocked report at `reports/jujutsu-research-2026-09-11/continuation2/`. Read `/mnt/Cursor/PuppetMaster/AGENTS.md` first; it overrides anything here that conflicts with it. This instruction runs only if Jared authorizes the allowance at the end.

## What the evidence shows

The blocked outcome was correct under the rules, and the evidence narrows the defect to one place. In the third repair's live qualification, Codex reported the request's usage natively, 12,141 input tokens of which 8,704 were cached and five output tokens, but the transport journal that the budget guard reads recorded zero usage receipts. The native runtime is reporting usage; the capture path between the native rollout and the journal is what fails. The same native records were already parsed successfully after the fact for the D4 accounting. The guard, correctly refusing to run blind, truncated eleven of twelve premium jobs in the first continuation within seventy seconds.

Two other things the failed continuation did establish: the review-stage batching change works, with reconciliation running at an average concurrency of 2.59 on three workers, and the enforceable per-job limits worked, with request 41 denied before dispatch.

## The change

Take live per-request reconciliation off the launch path. Spending is already bounded without it by the enforceable per-job limits and the admission grants.

- **Admission** uses captured usage plus the in-flight allowance from the brief: the observed per-job average for a stage once two jobs of that stage have reconciled usage in that arm, otherwise the fixed $12 fallback. Reconciliation of a job's usage happens at job end from the retained native rollout records, the same records the D4 accounting parsed. If a job's usage cannot be reconciled at job end, its $12 allowance is charged as unresolved and stays visible; it is never zero and never dropped.
- **Per-job limits remain the live bound**: 2,400 seconds, 40 model requests, cancellation at the next request boundary when captured plus in-flight allowances would exceed the arm's cap, recorded as budget-truncated.
- **Worst case is therefore known before launch**: twelve admissions times $12 is $144 per grant, inside both lifetime caps.
- **Live per-request capture becomes reporting, not a gate.** Fixing the receipt gap is worth one bounded attempt inside this same allowance, because the numbers are present in the native stream. If it is not fixed within that attempt, the continuation still runs, and the report says which jobs reconciled at job end and which are unresolved.

## Bounds

- One repair attempt, twenty minutes of workflow change, one live qualification of at most three real requests, independent offline review of the changed gate.
- Then run the continuation for both arms under the grants already recorded and unused: premium's second twelve admissions and four hours, hybrid's twelve admissions and four hours. Same frozen case `bc7569b3f5`, own-arm artifacts only, same code hashes and worker count for both arms, DL-043 and D5 outside every research input. Attempt reconciliation and comparison; report partial coverage if a limit stops an arm.
- Report per-stage wall time, summed job time and concurrency per arm, recall against the adjudicated union with shared, unique, unsupported and budget-truncated coverage, one cost line per arm, and the count of jobs whose usage reconciled at job end versus stayed unresolved.

## Allowance for Jared to confirm

Additional non-arm allowance for this continuation, covering the gate change, its review and qualification, and the adjudication and reporting of the increment: $80. Usage accumulates within this phase across retries and restarts. The lifetime captured caps of $250 premium and $100 hybrid are unchanged. The unused admission and time grants are consumed by this continuation and are not renewed by it.
