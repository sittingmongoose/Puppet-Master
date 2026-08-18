# Plan Owner Delta — concept-05-directory-take-1 (kimi-k3)

Date: 2026-08-18. Status: candidate delta only — **canon is not mutated** by this concept.

## What this concept does to scope

The legacy settings model distinguishes a `global` scope from project scope.
The bakeoff packet forbids rendering scope selectors, inheritance, linked
projects, profiles, or sync. Concept 05 therefore consumes the **v2 headless
projection** (`shared/v2/pm-v2-inventory.js`), which collapses every legacy
`global` row into the **current Project** demo model:

- Each of the 828 projected settings carries exactly one effective value, a
  `default`, a `recommended`, a `state` (`default | custom | managed |
  unavailable`), and a human `source`. The concept renders that projection
  verbatim and never re-derives precedence.
- Overrides written through `PM_V2_STORE.setValue` are **current-Project
  only** (per-concept localStorage namespace). There is no write path back
  into any global layer, and no UI implies one exists.
- Managed and unavailable states are shown with their reason lines; the row
  grammar never offers a " edit the global default " escape hatch.

## Inventory / schema impact

| Legacy shape | Projected shape in this concept | Owner of the projection |
| --- | --- | --- |
| `global` value + project value, merged at read time | One effective value per setting row | Shared v2 inventory (Plans projection, generated) |
| Scope selector on rows / pages | Removed by packet rule; state badge + "Why this value?" disclosure carries default / recommended / source instead | Concept 05 row grammar (presentation only) |
| Inheritance chain | Not rendered; Copy Settings From Another Project is a one-time transaction, not inheritance | Shared v2 copy engine |
| Sync / linked projects | Not rendered; the copy receipt states source and destination stay independent | Shared v2 copy engine |

No canon inventory rows were edited. The projection is a generated artifact;
regenerating it from `Plans/settings_inventory.json` remains the owning
pipeline's job.

## Affected Plan areas

1. **Settings inventory** — the 828-row projection is consumed as-is. If
   canon later reinstates multi-scope rows, the projection layer owns the
   merge, not the concept.
2. **Command Catalog** — `candidate-command-delta.json` maps 38 candidate
   command IDs this concept actually performs (navigation, values, lifecycle,
   providers, managers, operations). All are marked `reuse` of the base
   packet register; none are newly minted canon.
3. **Wiring Matrix** — `candidate-wiring-delta.json` proposes six routes:
   search-result open (immutable-ID only), manager deep link, copy apply,
   manager open, back, close.
4. **DRY owners** — `candidate-dry-delta.json` records `second_owner_created:
   false` everywhere: inventory, search, store, copy, objects, and the popup
   menu standard stay shared headless; only presentation is concept-native.
5. **Deferred named owners** — the 9 packet-named owners (Onboarding,
   Installation/Deployment, Server Claim, Servers, Hosting, Remote Access,
   Project Sync/Move, App Updates, Full Server backup) are rendered as
   truthful insertion-point shells under System & Advanced with owner name,
   insertion destination, and return contract. No backend state is
   fabricated for them.

## Candidate owners going forward

- **Projection semantics (global → current-Project)**: the shared v2 layer
  owner (Plans projection pipeline). Concepts must never grow a second copy.
- **Row grammar presentation**: each concept owns its own rendering; the
  badge/disclosure components remain shared standards (`pm-components.css`).
- **Copy transaction UI**: concept-native flow around the single shared
  engine; the engine owns diffing, atomicity, verification, and receipts.
- **Impact register closure**: `impact-register.json` lists the semantic
  action families with their candidate IDs; closure (typed
  payload/result/error, idempotency fencing, palette parity) belongs to the
  implementation pass, not this bakeoff.
