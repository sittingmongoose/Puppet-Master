---
name: r9-goal-two-turn-atom
description: Run one prebound R9 atom through a two-turn native Goal handshake so the subject arrives only after Goal activation.
---

# R9 Goal Two-Turn Atom

The invoking message declares exactly one phase.

For `phase=activate`, the message contains only an exact Goal objective and review nonce; it contains no subject. After loading this file:

1. Call native `create_goal` once with the exact objective. Require an `active` receipt and retain its `threadId`.
2. Do not call any other tool, inspect subject material, complete the Goal, or do subject work.
3. Return only `ACTIVE:THREAD_ID`, replacing `THREAD_ID` with the receipt's exact thread ID.

For `phase=subject`, the same task already has the matching active Goal from its immediately preceding activation turn. The message contains one bite-size subject and the exact thread ID:

1. Do not create another Goal or call `get_goal`.
2. Solve only that subject and produce one token matching `^[A-Za-z0-9._:-]{1,48}$`.
3. Call `update_goal({status:"complete"})` once. Require the completed receipt to bind the same thread ID.
4. Return only the answer token.

Never retry, reuse the task for another atom, resend, relaunch, replace, delegate, call OMP, or claim qualification. A mismatch consumes this task and must not be repaired in it.
