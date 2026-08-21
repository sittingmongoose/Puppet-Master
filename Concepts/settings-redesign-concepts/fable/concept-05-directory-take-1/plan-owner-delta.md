# c05 Waypoint — Plan-owner delta (fable, seven-new-concepts bakeoff 2026-08-18)

Concept register only. Nothing here edits canon; the implementation audit adjudicates.
Built and verified 2026-08-20 (boot-check 12-route walk at 760/1280/2500, glass-light +
retro-dark, 48-check interactive driver, 22-case search matrix, 47-route manager matrix).

## 1. Owners touched

| Owner | Kind | One-line evidence |
| --- | --- | --- |
| Plans/FinalGUISpec.md | extends | Directory-first Home (search hero, one gated banner, compact attention block, twelve two-column destination cards, subdued utility footer) and the card-transfer motion contract: one measured clone journeys into the domain header, reduced motion cuts instantly, everything else is a restrained directional slide. |
| Plans/FinalGUISpec.md | extends | In-stage settings rail exists only below Home for cross-domain jumps; narrow widths drop it for push navigation with a named Back — the shell Activity Bar is never overlaid. |
| Plans/settings_inventory.json | conflicts | The rev-2 canonical probe id `system.health.diagnostics-verbosity` is absent from the 828-row inventory; the nearest real row is `system.health.platform-diagnostics`. Stale addresses render an honest not-found surface over closest matches, never a dead end. Census correction needed before harnesses cite the old id. |
| Plans/UI_Command_Catalog.md | extends | One `cmd.settings.navigate {dest}` family plus `cmd.settings.search {query}` covers every surface; per-destination `open_*` aliases and prev/next-manager verbs are flagged supersede/retire (candidate-command-delta.json). |
| Plans/CLI_Bridged_Providers.md | extends | Installation cards render selected/shadowed/manual-only with refusal reasons inline; ask-first Codex update and explicit official-source Cursor CLI setup (host choice, separate sign-in) run as truthful staged ops. |
| Plans/Models_System.md | extends | Models table renders context, catalog-evidenced modes, tool support, and requested-vs-effective routing with reasons inside the provider object page. |
| Plans/Multi-Account.md | extends | Accounts tab: health-worded status per account, sign-in ownership boundary verbatim from the shared resolver, priority/sticky/use-next behind Details. |
| Plans/Provider_OpenCode.md | extends | Server connection page: address, version, reachability, last handshake, server-supplied catalog, scoped-token-reference boundary; reconnect is a staged op. |
| Plans/storage-plan.md | extends | Copy Settings as a centered review-flow transaction over a dimmed workspace: source → categories with counts → preview (five kinds + item inspection + credential-by-reference note) → restore point → atomic verified apply → receipt with working rollback. |
| Plans/Permissions_System.md | extends | Managed-workspace renders the whole safety domain read-only with managed chips and policy origin in Details; permissions render as one preference document. |
| Plans/agent-rules-context.md | extends | Context & Instructions renders admitted/omitted-with-why and the precedence chain as evidence sections behind one destination. |
| Settings schema/registry | extends | Seven row states rendered distinctly; option display labels and numeric bounds belong on the setting record (currently store-side); tiered folds need a contract for surfacing hidden row states (this concept flags validation errors on the collapsed Advanced summary). |
| Wiring matrix owner | extends | Ten keystone traces registered (candidate-wiring-delta.json), all flagged concept_local_state. |

## 2. Supersessions demanded

1. **Global previous/next-manager navigation.** Managers are not slides. Waypoint ships no
   sequential manager affordance; Back is strictly one coherent level out and names its target.
2. **Per-destination open commands.** `cmd.settings.open_*` aliases collapse into
   `cmd.settings.navigate {dest}`; the dest object is exactly what PM2.route serializes.
3. **Scope selectors inside Settings.** Project-only: no Global/Project/Goal/Host controls
   anywhere; `legacyScope` metadata surfaces only as impact prose inside the row Details drawer.
4. **The stale rev-2 probe id.** `system.health.diagnostics-verbosity` must be re-minted in the
   inventory or retired from every harness contract; concepts should not be graded against an
   address that does not exist.

## 3. Boundary confirmations

- **Resource location is context, not scope.** Provider installations, servers, and accounts
  render where they live (host names, environments) with read-only health; choosing what this
  Project uses stays a Project setting.
- **No fabricated backends.** Deferred owner shells (nine) are reachable, named, read-only, and
  action-free; refusals (unknown-owner Ollama) return honest receipts; Close Settings returns a
  simulated receipt because no real app shell exists.
- **Search never hydrates managers.** The index is built from defs and data-only
  objects()/actions(); selecting a result performs the landing sequence against the lazily
  hydrated destination.
- **One progress owner.** All staged work renders through the single op strip from shared op
  events; determinate progress appears only with a real denominator.

## 4. Session-state note for the audit

URL-applied scenarios/fixtures run ephemeral (`persist:false`), so `store.get('scenario')`
diverges from `PM2.states.activeScenario()`. Waypoint mirrors scenario events into the session
cache via the router's own `_setSession` channel (no persistence). A first-class
`activeScenario` accessor on the store would remove this mirror for every concept.
