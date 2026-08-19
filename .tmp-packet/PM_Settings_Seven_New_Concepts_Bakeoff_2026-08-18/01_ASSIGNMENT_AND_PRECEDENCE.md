# Assignment, Precedence, and Non-Destructive Scope

## Model folders in this bakeoff

The current repository contains these model folders:

```text
5.6 Sol
CursorAuto
fable
glm-5-2
kimi
kimi-k3
Opus 5
Qwen 5.8
```

Each receiving agent works only in the folder assigned to that agent. The visible model label must match the existing folder/manifest convention and satisfy `data-concept-model` requirements.

## Preserve the original four

The original four concepts are historical evidence. Do not:

- edit their HTML, CSS, JavaScript, data, or concept-specific reports;
- rename or renumber them;
- change their visible behavior to make them appear fixed;
- remove them from the gallery or `concept-hub.json`;
- route new concepts through an old concept page;
- quietly replace their shared manager with a new one.

The model-folder gallery and `concept-hub.json` may be extended to list concepts 05–11. Any shared-module change must be additive/backward-compatible and regression-tested against concepts 01–04. Prefer new shared-v2 or concept-specific modules when an existing shared file would change old behavior.

## One complete system per concept

Every new concept must independently provide:

- Settings Home;
- prominent universal search;
- category/domain navigation;
- full Settings workspace;
- exact deep-link routing;
- all current Settings categories and all current inventory rows through browse/search;
- every required manager family;
- concept-native manager entry, layout, editing, and exit;
- project-only setting behavior;
- Copy Settings From Another Project;
- all eight themes and responsive behavior;
- deterministic demo states and functional controls.

A user must never leave one concept and land in another concept's manager. `shared_grammar` may describe a headless implementation contract, but it does not count as visible coverage.

## Precedence

Use this order when requirements conflict:

1. Direct decisions in this packet.
2. Direct user decisions in the August 13 correction register and final provider CLI adjudication.
3. August 8 cumulative packet.
4. Current canonical repository sources and inventory, except where this packet explicitly identifies a stale scope or bakeoff rule.
5. Reference images as layout inspiration only.

The current `settings_inventory.json` contains legacy scope metadata such as `global`. Do not expose that as an editing scope. Record the future inventory/schema impact in candidate reports; do not edit canon in this pass.
