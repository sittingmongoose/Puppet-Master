# Landing check: open items after the 2026-09-24 follow-ups (owner: External Research thread)

State: main b3169c48d9 carries the three rules, L-05/L-07/L-08, the rules 2 and 3 text and the truncated-rise exceptions; landing check exit 0 against the baseline recorded at 792d2fb8b1.

1. Rule-file figure is stale. The truncation bullet in AGENTS.md and .claude/CLAUDE.md still quotes the first baseline ("8,800 of the 9,807"); after the reseal it is 2,582 failures in four subchecks never keyed, and the figure will move with every reseal. Fix: replace the figure with the non-numeric sentence already there ("the check prints which subchecks are truncated and how many failures that leaves unkeyed"). Needs Jared's explicit request; bundle with the next rule-file edit rather than landing alone.
2. L-07 pairing depends on two private helper names in scripts/pm-plans-verify.py; a rename silently disables pairing with a stated reason. Fix: one test that imports both helpers by the names the landing check uses, so a rename fails the test instead of quietly turning pairing off. Small branch; no rule-file text.
3. The timeout line's wording changed in the follow-ups. No action; any replay tooling that matched the old text should match the new.

## Added after the exports review (94ea73cfee, 2026-09-24)

Decision upheld: X-09, an export matches its aggregate subcheck only when every printed row's key is among the export's keys as multisets, not by total alone (the evidence L-07 already demands). The author's extra condition that the baseline must hold the subcheck's rows in full, else the "baseline sample" fallback, is part of the landed design; keying begins with the next --record-baseline, since 792d2fb8b1 holds the PRD contracts as a sample.

4. X-10: latent false block in the L-07 pairing when the audit-governance twin is keyed; repair is an optional keyed_rows argument in pair_validators.now(). Small branch, with open item 2 (helper-name test) in the same branch since both touch the pairing.
5. X-12: the "report it to Jared" advice printed on keyed staleness rows of regenerated shards should say what he is meant to do with them (nothing until the next reseal) or be dropped; decide with the next rule-text edit.
6. X-08: the rule sentence names only the total condition while the code also requires the baseline rows in full; one-line addition to the rule files, with Jared for explicit request (dispatching thread is asking).

## State after the exports landing (main 8bc8986484, 2026-09-25)

Landed: export keying (35 of 36 subchecks; audit-closure never keyed), multiset row match, baseline-rows-in-full condition, rule sentence verbatim in AGENTS.md and .claude/CLAUDE.md with the stale figure removed on Jared's request; 154 tests. Keying is live for the evidence and plan-graph subchecks at baseline 792d2fb8b1; the PRD contracts subcheck keys after the next --record-baseline. Items 1 and 3 above are closed by this landing. Still open: 2 (helper-name test), 4 (X-10), 5 (X-12), 6 (X-08, with Jared), and X-11 as recorded in ~/PM-Experiments/landing-check-exports-20260924/REPORT.md.
