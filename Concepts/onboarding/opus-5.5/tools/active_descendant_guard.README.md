# active_descendant_guard

Lane check for the T2 build step: `active_descendant_rewrite.py` with its list `active_descendant_rules.json`.

```
node Concepts/onboarding/opus-5.5/tools/active_descendant_guard.mjs <cdp-endpoint> <page-url> <output.json> [rules.json]
```

## What the build step does

Blink files style invalidation by feature, not by compound. A rule of the form `<compound with .active> *` (or `:where(*)`, or `> *`) puts the class `active` into a whole-subtree invalidation set. Every `.active` toggle anywhere then restyles the toggled element's whole subtree. A page switch removes `.active` from the outgoing page, so the outgoing Home (~1,500 elements) was restyled inside the switch's layout (P1000 speed team, B1; 162 ms of the warm Settings entry on the P1000).

The last step of `build.build_text()` rewrites the 13 such rules in the finished page. Each `*` / `:where(*)` descendant becomes a `:where(...)` list of the classes and element types the rule reaches. The specificity is 0 either way. The two carriers that hold text only lose that arm. Only CSS inside real `<style>` elements is searched. In the published page each rule must match exactly once, through exactly one of its listed variants, or the build fails.

## The trap this guards

A list names today's descendants. A new class or element type added under one of these carriers, by markup or by script, would silently stop receiving the rule. The source of each rule carries a comment that points here.

## When to run it

- Before landing any change to `active_descendant_rules.json`.
- Before landing any change that adds descendants under these carriers: page tabs, Usage nav and range buttons, Orchestrator tabs, Settings domain and side links, rail rows and segment tabs, PMR menu items, and the NieR cursor carriers.
- Run it on the candidate page, paired with main the way hover14 is.

## How

Start the browser yourself; this file only attaches over CDP. Set `PM7_PLAYWRIGHT` to the directory of a `playwright-core` package (the script `require()`s it); when it is unset the script uses `/home/sittingmongoose/pmt-dev/pw/node_modules/playwright-core`, which exists on Nas1 only. On Nas1, use `agent-browser start --url about:blank` and pass its `cdp_endpoint`: one browser, and stop it when the run ends. Serve `Concepts/` and pass `.../PMConcept7.html`; the script adds `?o55=off`. A run takes about 11 minutes on Nas1.

## What pass means

The guard visits five looks (NieR Dark, Retro Dark, Glass Light, Friendly Light, Basic Dark). In each it visits six pages, every Settings chapter, every rail panel and file view, fixture PMR menus (every item kind and every icon the rail draws), a submenu and the More tray. In every state it compares `querySelectorAll(original)` with `querySelectorAll(replacement)` for every rule and every variant: first as the page is, then with each rule's dynamic state forced on all of its carriers at once (cursor-over, hover-on, active, selected, aria-checked, aria-selected and so on).

The process exits 0 when nothing differs, every dropped arm matched nothing, every rewritten rule matched at least once and the page reported no error. `missingFeatures` in the output names the class or tag a list lacks.

## Not covered: carriers this page never builds

Rules 0 and 6 also name `.palette-item`, `.chat-dropdown-item` and `.search-result-item`. PMConcept7 never creates any of them, so no state can exercise them, and their arms match nothing here:

- `.palette-item`: only Settings CSS styles it; no markup or script builds one.
- `.chat-dropdown-item`: the chat code keeps the name only in `PM6_LEGACY_MODE_CLASSES`, so the HOOKS.md presence probes still find it; no dropdown renders one.
- `.search-result-item`: `filterSearchResults` queries `#panel-search .search-result-item`, but no markup or script creates one.

The guard records `neverBuiltSeen`, the most of them found in any state; it must stay 0. If a future change starts building one of them, rule 0's and rule 6's forcing already covers it, and its open state belongs in this guard.
