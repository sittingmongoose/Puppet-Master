# GUI, Context Ring, Demo, and Test Matrix

## Default information density

The default Usage view should answer:

```text
What am I using?
How much is left?
When does it reset?
What will happen next?
Which account/connection ran?
Am I likely to finish?
What consumed the most?
```

Expanded detail answers route, cache, helper, settlement, source, confidence, and maintenance questions.

## Accounts and providers

Hide unconfigured accounts and free-provider routes from ordinary Usage.

Group same-provider accounts. Make requested/effective differences clear without raw internal terminology.

## Context Ring/Lens integration

Use the improved compact context detail:

- correct source colors in the top bar;
- cache information inline near Compact Now/More Details;
- concise human labels;
- no `provider-reported`, `high`, or `medium` labels in ordinary context UI;
- no overly wide explanatory sentence;
- detail view can separate admitted sources, cache, and compaction.

## Existing Usage design requirements to preserve

```text
Plan resets/cooldowns
Cache hits
Used tokens
Input/output/reasoning/cache reads/writes
Per model/provider/account sorting
Date ranges/tables/graphs
Sessions/subagents
API cost versus plan cost versus combined
Overage/add-ons/packs
Burn rate
Run-out estimates
Thresholds/budgets/warnings
Multi-account switching/deep links
Focus and widget sizing
Theme/width responsiveness
```

Provider-specific wording replaces one universal budget UI.

## Demo fixtures

At minimum:

1. Codex plan reaches limit, then optional credits.
2. Alibaba Token Plan consumes an Extra Bundle.
3. Work account reaches limit; future work switches to Personal.
4. Text-only main model invokes separately settled vision helper.
5. Model change causes replay/cache reset.
6. Free model cooldown.
7. Background model validation consumes allowance.
8. Six required specialists run in three two-agent waves.
9. Provider data unavailable; PM shows estimate/confidence.
10. Requested/effective model differs.
11. BSD silent and advice calls.
12. Attachment transform.
13. CLI update waits for idle, verifies, rolls back.
14. Offline queued message and reconnect.
15. Server work continues while client offline.
16. Cross-project Goal.
17. Local sound preview and external notification test-send.
18. Unconfigured account absent from normal view.

## Themes and widths

Test the current Usage matrix across all themes and supported widths, including narrow and very wide arrangements. Preserve smooth widget move/resize without flashing, dead-space use, alignment, and context-detail behavior.

## Hard failures

- unknown displayed as zero;
- plan-included work shown as API-billed without evidence;
- Free Models without underlying route;
- helper calls hidden inside main model;
- maintenance counted as model tokens;
- account rows shown before setup;
- Usage mutates policy locally instead of deep-linking to Settings;
- route/settlement history rewritten by current aliases/settings;
- clipped labels, misaligned tracks, or dead controls.
