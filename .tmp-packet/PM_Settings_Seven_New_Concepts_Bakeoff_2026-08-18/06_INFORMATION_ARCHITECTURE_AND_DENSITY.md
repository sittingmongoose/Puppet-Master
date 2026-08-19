# Information Architecture, Readability, and Density

Puppet Master may have thousands of settings. The raw registry must not become the visible menu tree.

## Registry-driven structure

Each item should resolve to metadata equivalent to:

```text
stable ID
domain
page/manager
section
record kind
exposure level
search terms
related destination
availability/state
canonical owner
```

Use the current `Plans/settings_inventory.json` as the real baseline. At the uploaded repository state it contains 828 settings across 12 categories. Do not replace those records with a smaller generated fixture. Synthetic records may be added only for scale/performance testing and must not masquerade as product inventory.

The architecture must accept future Settings additions without another navigation redesign.

## Browse hierarchy

Normal browsing should be:

```text
Settings Home
→ major domain
→ page or manager
→ object detail or advanced drawer
```

Avoid routine fourth- and fifth-level route replacement. Advanced evidence and object details should usually remain inside the workspace.

## Setting rows

A normal row shows:

- human title;
- one concise explanation;
- value/control;
- only the status needed to understand the current state.

Do not permanently repeat source, scope, revision, policy owner, requested/effective value, provenance, and diagnostic metadata on every row. Put advanced evidence behind `Why this value?`, Details, or a diagnostic drawer.

A visible group should usually contain roughly four to eight related settings before another heading, subpage, disclosure, or manager destination. Long explanations must wrap cleanly and remain readable.

## All Settings / Compendium

Every concept must provide a complete searchable long-tail index, even when it is not the concept's primary interaction. Useful filters include domain, record kind, exposure, changed-from-default/current-project state, managed/unavailable state, manager/action/diagnostic/workflow type, and attention state.

The All Settings view must be faceted and virtualized rather than a 828-row DOM dump.

## Human-facing language

No raw snake_case, internal enum names, IDs, or developer vocabulary in ordinary prose. Literal command IDs, filenames, schema fields, code tokens, and diagnostics may be shown where intentionally technical. Use SVG icons, not emoji. Avoid colored left-edge accent bars and generic AI-card patterns.
