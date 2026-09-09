# SMPFS-017 bounded historical adjudication

**Final ruling: one added restrictive product decision, with a conflict against retained baseline routes.** Existing-first reveal and historical-state display remain restatements. Confidence is medium-high about the textual exclusivity and medium about its operational consequences. Reviewer A also found no scope/alias evidence and accepted the ruling. JSON structure, one unique added obligation and all evidence ranges were verified.

Evidence is limited to the frozen June `f46b0de9b241ec5eeb7a8ee8855c5f90e6b47f17` and July `75cc6d64a16cd9678a7e6e7fe910257055ec3316` Section 15 documents. Both hashes match `d5/source-freeze.json`. Original-body ranges 195–240 and 307–335 remain identical across snapshots. No new research, linked-owner acquisition, current Plans comparison or present product-approval inference was used. The completed SMPFS-091 adjudication is unchanged.

## Exact semantic delta

June 228 says explicit New Terminal, split and restart create new runtime identity. July 1695 says **only** explicit new/split/restart actions mint one. The former gives sufficient creation routes; the latter also makes them necessary. That exclusive creation policy is `SMPFS-017-O01`, classified `product_decision` and counted once.

This is not a new optional capability or a necessary correction. The baseline already protects existing identity during ordinary reveal/motion and separately preserves fresh-shell routes. Choosing an exclusive set of allowed creation actions changes that policy. No baseline correctness requirement makes the stronger restriction necessary.

## Both readings

The adopted reading takes July 1691–1695’s accepted requirement and explicit “only” seriously: all creation must pass through new/split/restart. Unlike an omitted qualifier in a loose taxonomy summary, this is an affirmative exclusion. The title’s reveal scope does not remove the counterexamples; both TTY-required routing and dev-artifact Open in Terminal are within that domain.

The alternative reading is plausible: the sentence begins with existing sessions first, July 218/235 preserve the exceptions, July 804 calls the conversion source-preserving, and July 1709 requires source preservation. “Only” might mean only within the ordinary presentation-only branch. Alternatively, a routed creation might already dispatch an explicit internal “new” action.

Neither that branch restriction nor that dispatch equivalence is stated in the bounded evidence. The narrower reading therefore requires an unstated qualification or alias. The retained source creates a conflict and uncertainty about intent; it does not silently erase the exclusive word.

## One policy, multiple affected routes

| Baseline route | Evidence in June and retained July body | Effect of literal July 1695 |
|---|---|---|
| TTY-required fresh shell | 218 preserves identity unless TTY-required routing requires a fresh interactive shell. | The route cannot independently create identity unless it is mapped to an allowed explicit action. |
| Dev artifact without a terminal | 235 says Open in Terminal creates a bound terminal when the dev session has none and now needs PTY interaction. | Conditional creation is blocked or must count as explicit new/split/restart; no alias or separate New Terminal user action is established. |
| Replacement or termination policy | 220 permits a new identity when an explicit termination policy, replacement, restart or New Terminal asks for it. | Some routes clearly overlap new/restart; any separate policy/replacement effect is uncertain and is corroborating evidence only. |

The first two rows demonstrate the same shared exclusive guard, so they do not count as two additions. The third row does not establish another independent restriction. No additional user confirmation, error behavior or removal workflow is inferred: “explicit” does not resolve user action versus internal dispatch.

A concrete semantic counterexample is an Open in Terminal request from a dev artifact with no terminal and an immediate PTY need. June 235 requires creation. July 1695 allows creation only from the three listed action classes. The frozen text does not establish that this Open in Terminal branch is one of those classes. This is a textual check, not runtime testing.

## Unit fields and preserved behavior

- July 1695’s existing-first and historical-display clauses restate June 225–227. New/split/restart still being creation routes restates June 228; only their exclusivity is added.
- July 1707–1710 provides addressability, preservation and no-executable-work acceptance. The affirmative preservation requirement supports the alternative interpretation but cannot make a conflicting exclusive requirement disappear.
- July 1722–1731 carries migration span S0014 and exact tokens. The span map was not acquired; it supplies no verified action alias.
- July 1733 repeats June 230’s adjacent-surface ownership constraint. Keeping creation owned by the terminal subsystem is not equivalent to permitting only three action classes.
- July 1734–1742 contains source links, empty compatibility/stale fields and owner hints. None supplies an exception or explicit retirement of the baseline routes.
- July 1688 and 1714–1721 describe terminal reveal scope. July 804 preserves the original owner/body context. These constrain interpretation but do not explicitly restrict “only” to ordinary presentation operations.

## Preservation, correctness and uncertainty

A baseline-preserving correction would remove or qualify the exclusive claim, or explicitly retain the existing exceptions. That reconciliation is distinct from the historical delta: the added restriction itself must not be relabeled necessary merely because it creates prose needing correction. No Plans change or new internal-dispatch design is made here.

A real internal new dispatcher could reconcile the routes operationally. Its existence cannot be inferred from these sources. The review therefore counts the visible exclusive policy, records the retained-body conflict, and limits claims about runtime breakage. It does not infer historical or present user approval.

Reviewer B found no exact evidence of an internal alias and agrees that one restrictive product decision, with multiple impacts, is the appropriate count. Reviewer A also found no scope/alias evidence and accepted the ruling. JSON structure, one unique added obligation and all evidence ranges were verified. Only the two assigned 017 adjudication artifacts were written; no staging or commits were performed.
