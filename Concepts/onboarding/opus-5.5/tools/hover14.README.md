# hover14

Landing check for the two PMConcept7 hover bugs. The script is the 2026-10-15 collector (`hover14-collect.mjs` in the glyphs landing evidence), with the same three arguments.

```
node Concepts/onboarding/opus-5.5/tools/hover14.mjs <cdp-endpoint> <page-url> <output.json>
```

Start the browser yourself. This file only attaches over CDP. It does not launch Chrome. Playwright is `PM7_PLAYWRIGHT`, or `/home/sittingmongoose/pmt-dev/pw/node_modules/playwright-core` when that variable is unset. The script opens a 1920×1080 page and loads `<page-url>` itself.

Serve `Concepts/PMConcept7.html` and pass it as `PMConcept7.html?o55=off&pmu-flags=live:0`. On Nas1, `agent-browser start --url <page>` and use the returned `cdp_endpoint`; one browser; stop it when the run finishes. On the P1000, `gpu-browser start --host ubuntuserver --url about:blank`, navigate to the page at the Nas1 LAN address (the browser's localhost is the GPU host), `gpu-browser connect <id>`, then `gpu-browser stop <id>` and `gpu-browser purge <id>`.

## What pass means

The process exits 0 when `pass` is true. `pass` is true only when the report has exactly 14 cases, every check in every case is true, and the page reported no error. The cases are bug 1 (Usage card hover, leave to Settings, return) and bug 2 (project search under a resting pointer), for glass, retro, nier, basic, and friendly at full motion, plus basic and glass with reduced motion.

A score below 14/14 is a product result from that browser. On Nas1 software rendering, current main is 9/14: the five full-motion bug-1 cases fail because `#panel-usage` is given `pm8-page-in` with computed `animation: none`, so `animationend` never fires and `data-pm-page-transition` stays `running`. The hover engine treats that as a rest, and a longer wait does not clear it. The same script on the P1000 is 14/14. See the 2026-10-16 notes in the share folder.

## Paired main vs candidate

Landers run this script twice, once on the main build and once on the candidate, in the same kind of browser. The comparison passes when both reports contain 14 cases, the candidate has no page error and no run failure, and no check that passed on main fails on the candidate. A check that failed on main and passes on the candidate is an improvement, not a failure. Both sides may be 9/14 on Nas1 and the comparison still passes. That is the hover gate from the 2026-10-15 glyphs landing.
