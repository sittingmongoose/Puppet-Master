# Reconciliation of internally contradictory findings — auditor pass, 2026-08-17

The completeness critic identified two places where the audit's own findings conflicted. Both are
resolved here against measured source, and the resolutions are applied in AUDIT_REPORT.md.

## 1. The "After included usage → Then" control — three findings, three different counts

A03-02, A03-03 and A10-03 all describe the same select at `u11-prism.html:1117-1124`, fed by
`afterIncludedOptions()` (`u11-prism.html:1083-1098`) over `D.continuation` (`u11-data.js:218-263`)
with three seeded overrides in `D.settingsDefaults.afterIncludedByProduct` (`u11-data.js:1161-1164`).
They quoted "9 of 12", "two of three" and "11 of 12" without stating a counting rule, so read together
they implied the audit did not know the blast radius.

Measured over all 12 continuation policies (script output preserved below):

| Count | What it actually counts |
|---|---|
| **2** | products where the key-collapse dedupe **silently drops a step**: `prod:alibaba-coding-plan` (loses the Extra Bundle) and `prod:codex-plus` (loses the saved reset) |
| **11** | products whose default option is an **unlabelled raw enum token** — 10 x `included`, 1 x `balance`; neither key exists in the label map, so `labels[key] \|\| key` falls through to the token |
| **9** | products that display the literal token `included` to the user (10 minus `prod:oc-go-plan`, whose seed override renders correctly as "Continue with free models") |
| **2 of 3** | seeded stored policies the control **cannot render at all**: `prod:codex-plus` = `credits` and `prod:claude-max` = `extra_usage` are not among that product's option keys, so the UI shows a policy other than the one stored |

All four numbers are correct. The three findings are therefore all true and none is redundant; they are
consolidated into one blocker in the report with the counting rule stated, and A10-03's wording is
corrected — it renders a **raw enum token instead of plain language** for 9 products, which is not the
same claim as "displays a wrong continuation".

```
product                        steps  opts  dropped default(raw?) seed          seedRenderable
prod:alibaba-coding-plan       4      3     1       included RAW   -            -
prod:alibaba-team-seats        3      3     0       included RAW   -            -
prod:codex-plus                4      3     1       included RAW   credits      NO
prod:codex-business            3      3     0       included RAW   -            -
prod:claude-max                3      3     0       included RAW   extra_usage  NO
prod:claude-api-payg           2      2     0       metered        -            -
prod:kimi-code-plan            3      3     0       included RAW   -            -
prod:oc-go-plan                3      3     0       included RAW   free_fallback yes
prod:oc-zen-balance            2      2     0       balance RAW    -            -
prod:zai-legacy-plan           2      2     0       included RAW   -            -
prod:zai-credit-plan           3      3     0       included RAW   -            -
prod:antigravity-baseline      2      2     0       included RAW   -            -
```

## 2. ue-609 parenting — the same fact confirmed on one axis and refuted on another

A08-05 (survived, major) and A04-09 (dropped as refuted) assert the identical defect about the identical
event. The auditor opened the source directly:

- `u11-data.js:698` — `{ eventId: 'ue-609', workId: 'work-4', bucket: 'validation', purpose: 'probe', ... }`
- `u11-data.js:312` — `{ id: 'work-4', kind: 'turn', label: 'Run integration tests', threadId: 'thread:t-88', ... }`
- `u11-data.js:399` — `ue-530` is also `workId: 'work-4'`, i.e. the genuine user turn's own attempt
- `u11-data.js:763` — the operational record carries `validationEventId: 'ue-609'`

So the Codex-CLI verification probe is parented to a **user turn** ("Run integration tests"), and the only
link to the maintenance operation that caused it runs the other way (operation -> event). The attempt
itself carries no `operationalRef`. **The fact is true; A04-09's refutation was wrong.** The defect is
reinstated as a single finding and the split verdict is disclosed rather than silently resolved.
