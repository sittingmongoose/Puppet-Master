# Batch 16 source review and repaired counterexamples

The review follows actual modules rather than generated HTML. `build.py` regenerates both HTML outputs; all ten animation files remain byte-identical to Batch 15.

## Correctness work

Graph validation now checks the complete candidate iteratively, including unknown and duplicate references, scope violations and cross-branch cycles. Stable items and work bindings are separate from mutable target/revision fences. Whole-list proposals cannot complete or omit active work. Restructuring preserves every retained/rebound binding, including earlier failed attempts; safe cancellation requires the owning receipt.

Transitions validate exact project/thread/Plan/run/current list/item/binding identity and accepted outcome evidence before writing. Every affected owner write uses the shared synchronous transaction journal. Projection observation is pure: repeated reads during failed admission do not leak a speculative stamp. Snapshot tests are explicitly in-memory, not durable restart tests.

## Actual integration defects found and repaired

1. An existing shared Activity projection did an O(n²) leaf scan even while To-Do rows were virtualized. It now consumes the indexed ToDoController leaf projection. Initial creation of 5,050 objects is still measurable work, not guaranteed frame-perfect motion.
2. Search-result collapse must respect user intent rather than always auto-expanding matched ancestry. Query-local collapsed state now coexists with persistent normal-tree expansion.
3. Review setup that asserted statuses without admitted work was changed to use a real scoped fixture artifact and the owner transition path. Its behavioral assertions were retained.
4. Replacing To-Do detail rendering initially lost the existing Review/Chat Room source links. They were restored, and the original source-navigation regressions rerun.
5. Older Plan demonstrations depended on timer-selected terminal statuses. B1 account selection now computes exact provider/account routing and checks reordering; the supplied BrainStorm example executes an actual browser Worker, discards an obsolete query result and measures the local fallback; the supplied Chat Room example creates standalone Search HTML and tests its actual DOM handlers. Unsupported arbitrary Plans remain unfinished with an explicit missing-executor reason.
6. A project-less older demo thread exposed a scope mismatch on created evidence artifacts. The shared resolved `pm` scope is now applied consistently.
7. Paused internal work dispatch is refused. New asynchronous tests begin with actual active admission, pause through the Goal handler, reject pre-pause callbacks, then resume the same work identity with a fresh callback fence. A failed Worker-result transition rolls back output, evidence, trace and To-Do state together.

## Proof boundaries

The supplied parallel order adapter uses actual local computation and independent output comparisons, but is not a general coding/model executor. The large hierarchy has 5,050 items but only one real final-item lookup; the rest are rendering fixtures. Browser Worker timings use two rows and one browser session, not a production benchmark or all target devices. Chat Room output checks are local frame tests, not deployed project or persistent-settings proof. Historical seeded examples are not newly executed work. No durable host-transfer, global Event Authority, native, formal-audit or user-acceptance claim follows from these tests.

## Frozen-source formatting note

The whitespace-only check reports one trailing source space in `todos.js:654`, also present in both generated HTML copies. This is a nonfunctional formatting warning, not a passing whitespace gate. The final functional, visual and archive checks use those exact frozen bytes; no post-evidence source normalization was performed.
