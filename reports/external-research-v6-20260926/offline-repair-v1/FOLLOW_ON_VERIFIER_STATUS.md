# Future flash verifier: NOT QUALIFIED FOR FOLLOW-ON VERIFIER USE

`V-FOLLOWON-1` remains OPEN and outside I1's execution graph. It is not an
additional prerequisite for the investigator-only comparison. No change to the
absence matcher, per-part decision semantics or whole-finding unresolved rule
is included in amendment I1-1.

The independent review at commit `cdedeb74792c651dcd0e8e275ae3b026b14ae4a7`
reports deterministic synthetic reproductions in which the old absence matcher
requires a corpus-absence packet for ordinary input behavior:

- Condition: “If a required file is missing, show an error and leave the input
  unchanged.”
- Proposed validation: “Supply an unsupported codec and check that its name
  appears in the error.”

Neither sentence claims absence of corpus evidence. The matcher overflags these
parts and makes the entire finding unresolved. The review's full probe bundle
was not attached here; these are attributed review findings, not a claim that
its original `reproduce_review.py` was rerun by this amendment.

Before any later paid flash-verifier integration, distinguish actual source-
absence assertions from conditional missing-data behavior, unsupported-input
handling, quoted examples and unexecuted proposals. Preserve honest unresolved
disputes. Do not build a universal natural-language classifier or hardcode case
answers. Source evidence and semantic judgment remain necessary; lint cannot
establish truth or exhaustive search.

The documented rule that any unresolved part holds the whole finding unresolved
is a separate design consideration. Explicitly keeping typed uncertainty keeps
the question as a question; it does not resolve it. Later tests should examine
that distinction without detaching essential conditions or default-confirming
the surrounding finding. This amendment does not change that rule.

I1 calls draft-only `render-current`; it does not run review assembly, the
absence matcher or the future verifier prompt. A later separate user go,
appropriate repair/testing and independent evaluation are still required before
follow-on verifier or end-to-end claims.
