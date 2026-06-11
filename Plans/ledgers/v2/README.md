# Structured Bootstrap Ledgers v2

This directory contains file-backed machine ledgers for Puppet Master bootstrap planning.

## Authority

- `Plans/ledgers/v2/**` is source/planning state.
- Live non-pipeline `Plans/**` docs are canonical after compilation.
- Legacy `Plans/ledgers/work_items/**` and `working_ledger.md` files are source-lineage only.

## Layout

```text
Plans/ledgers/v2/
  ledger_registry.json
  schemas/
  write_cards/
  capsules/
  <ledger_id>/
    manifest.json
    events.jsonl
    records/
    state/
    indexes/
    validation/
    source_shards/
```

## Default operating files

Agents should resume from:

```text
state/handoff.json
state/current.json
state/open_items.json
state/operating_capsule.json
```

Do not read all events or shards by default.

## Record principle

Use design atoms during planning. Do not call every planning detail an obligation. The Plan Compiler later converts accepted atoms into PlanUnits.

Every design atom must include `gui_related: true|false`, inferred by the agent. The user does not need to label GUI work.

## GUI principle

`gui_related=true` means GUI/UI/screens/layout/styling/components/icons/SVGs/images/screenshots/user-visible visual presentation. Otherwise use `false`. Future WorkNodes inherit this boolean for model routing, but this ledger does not create WorkNodes.

## Completion principle

Agents may request completion. Validators certify completion. False completion is blocked by open questions, unclassified candidates, unresolved contradictions, open blockers, unsealed governance queues, and missing `gui_related` classification.
