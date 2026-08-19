/* Emit the five adjudication files each concept must carry.
 *
 *   node tools/gen-candidates.js [--concepts=stem,stem]
 *
 * Four of the nine required evidence files are MEASUREMENTS and are produced by
 * tools/gen-evidence.js from a live run. These five are ADJUDICATION — what the
 * concept's behaviour would press on if it were built for real:
 *
 *   impact-register.json  candidate-command-delta.json  candidate-wiring-delta.json
 *   candidate-dry-delta.json  plan-owner-delta.md
 *
 * Most of that adjudication is deliberately identical across the seven concepts, and
 * saying so is the honest answer: they invoke the same semantic operations against the
 * same canon, so proposing seven different command sets would be an invention rather
 * than a finding. What genuinely differs per concept — route grammar, Home
 * composition, which archetypes are used, which DRY roles the presentation implies —
 * is carried in the CONCEPTS table below and threaded into each file.
 *
 * Every id emitted here is a CANDIDATE. The base packet is explicit that the exact
 * canonical names are adjudicated later against the real Command Catalog; nothing in
 * these files may be treated as canon, and this script never edits canon.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GENERATED = new Date().toISOString().slice(0, 10);
const PACKET = "PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18";

/* --------------------------------------------------------- per-concept facts */

const CONCEPTS = [
  {
    stem: "concept-05-directory-take-1",
    title: "Directory",
    source: "A1 Directory / Take 1",
    thesis: "Settings is a directory you can hold in your head.",
    home: "search, one attention block, then a two-column grid of destination cards over a compact text rail of the twelve areas",
    nav: "compact left text rail plus a card grid; the card expands in place into the area it names",
    manager: "roster at a fixed 280px with the selected object's form filling the rest of one pane; subpages are a quiet tab strip above the form",
    reveal: "the destination row lifts and takes a soft ring that fades once, originating at the row",
    narrow: "the rail pushes off-screen, the grid becomes one column, roster and form become two pushed pages",
    motion: "expand-and-transfer: the thing you pressed becomes the thing you get",
    density: "medium-tight, 13px body, 1.45 line height, 12px row rhythm"
  },
  {
    stem: "concept-06-directory-take-2",
    title: "Editorial",
    source: "A1 Directory / Take 2",
    thesis: "Settings reads like a well-set page.",
    home: "a single column of large editorial destination rows, each with a full sentence of description",
    nav: "a narrow, stable icon-and-label rail that never changes as you go deeper; sub-navigation nests inside the content sheet",
    manager: "a compact 44px roster and a restrained detail sheet measured to about 72 characters",
    reveal: "a marker in the left gutter beside the row and one slow underline sweep of its title",
    narrow: "a single-pane editorial push stack, each level a full page with a named Back",
    motion: "vertical slide in the reading direction",
    density: "airy, 14px body, 1.6 line height, 20px row rhythm"
  },
  {
    stem: "concept-07-compendium-workspace",
    title: "Compendium",
    source: "A2 Compendium Workspace / Take 1",
    thesis: "Settings is a reference work with a good index.",
    home: "search, Browse by area as a calm two-column grid, and a small Recently changed block",
    nav: "a left nav where All Settings is a first-class destination second only to Home, plus a faceted compendium",
    manager: "integrated list and detail where the detail carries a readable metadata block and an About this setting explanation",
    reveal: "the row lands with a contextual explanation panel beside it naming what it controls and that search brought you here",
    narrow: "facets collapse into a drawer and the detail pushes over the list",
    motion: "facets cross-fade in place so the list never jumps; detail pushes in from the right",
    density: "two rhythms on purpose — a dense compendium and calm domain pages"
  },
  {
    stem: "concept-08-directory-take-3",
    title: "Broadside",
    source: "A1 Directory / Take 3",
    thesis: "Settings is broad and approachable.",
    home: "search, one attention panel whose items carry inline fixes, then fewer and larger domain cards",
    nav: "a left rail plus a breadcrumb, with large cards as the main event at every width",
    manager: "provider summary as high-value status cards followed by an explicit quick-actions row, then subpages",
    reveal: "the destination card or field is highlighted in place with a soft halo and a found-from-search caption",
    narrow: "cards become one full-width column and stay large; nothing shrinks into pills",
    motion: "scale-and-settle: the pressed card scales slightly as the page changes under it",
    density: "spacious, 15px body, 1.55 line height, 24px block rhythm"
  },
  {
    stem: "concept-09-tome-tabs",
    title: "Codex",
    source: "Rethemed Tome Tabs",
    thesis: "Settings is a bound volume with chapter tabs, expressed entirely in Puppet Master's own materials.",
    home: "a broad central canvas with wide margins, search at the top of the canvas, and domain destinations as a two-column reading list",
    nav: "a persistent vertical edge tab strip, one tab per domain, joined to the canvas at the current tab",
    manager: "roster plus a tabbed detail page whose manager-local tabs are visually distinct from the domain edge tabs",
    reveal: "the edge tab activates, the page layer lifts, then the row takes a ring — three steps that explain where you were taken",
    narrow: "edge tabs become a controlled push navigation",
    motion: "layer depth: pages lift and settle on the z-axis with bounded shadow",
    density: "comfortable, 14px body, a measured 68-character column, wide canvas margins",
    retheme: {
      reference: "05_Tome_Tabs_LAYOUT_ONLY_RETHEME_REQUIRED.png",
      borrowed: ["persistent edge/chapter tabs for major domains", "layered page depth and stable page location",
        "a broad central reading canvas", "domain tabs plus manager-local tabs", "list/detail manager composition",
        "a stepwise copy flow"],
      removed: ["parchment and paper texture", "brass and gears", "sepia palette", "book ornament and rules",
        "skeuomorphic page edges and drop-shadow leaves", "medieval and fantasy wording", "decorative serif display faces"]
    }
  },
  {
    stem: "concept-10-command-suite",
    title: "Command",
    source: "Rethemed Command Suite",
    thesis: "Settings for someone who knows where they are going: keyboard first, panes left to right.",
    home: "a left command index of the twelve areas with keyboard hints, a project context block, an at-a-glance panel and a recently accessed list",
    nav: "multi-pane left-to-right drill-down, up to four panes at the widest widths, each pane separately scrollable",
    manager: "a compact but legible table with real column headers and the selected row's detail beneath it in the same pane",
    reveal: "the row is selected in the table and its editor opens directly beneath it, with the full path shown once above",
    narrow: "panes collapse to one with breadcrumb chips standing in for the panes that are off-screen",
    motion: "horizontal pane slide with the leftmost pane holding position",
    density: "compact tabular, 13px body, 32px rows, tabular numerals, vertical rules between panes",
    retheme: {
      reference: "06_Command_Suite_LAYOUT_ONLY_RETHEME_REQUIRED.png",
      borrowed: ["command-index navigation", "keyboard-first movement", "multi-pane left-to-right drill-down",
        "compact legible data tables", "direct path and status visibility", "an editor beneath or beside its context",
        "transactional copy panels"],
      removed: ["fake terminal chrome", "green monochrome", "CRT and scanline effects", "monospace body text",
        "code-only labels and slash-path labels as primary names", "ASCII box drawing"]
    }
  },
  {
    stem: "concept-11-tabbed-organizer",
    title: "Folio",
    source: "Rethemed Tabbed Organizer",
    thesis: "Settings is well-organised into tabs and sheets that never lose your place.",
    home: "a compact grid of category tiles above a Recent changes list showing what changed, where, when and by whom",
    nav: "top category tabs for the domains and a second row of sub-tabs inside a domain, ranked by size and weight",
    manager: "roster on the left and a detail on the right with its own third-level tab row",
    reveal: "the correct tab and sub-tab auto-select and the sheet slides in with the row ringed, inside the existing tab stack",
    narrow: "tab rows become a horizontally scrolling chip rail with the current chip pinned into view",
    motion: "sheet cross-slide while the tabs never move",
    density: "medium, 14px body, 40px roster rows, hierarchy through size and weight rather than colour",
    retheme: {
      reference: "07_Tabbed_Organizer_LAYOUT_ONLY_RETHEME_REQUIRED.png",
      borrowed: ["category tabs resembling a well-organised file system", "layered sheets that preserve location",
        "compact home categories and recent changes", "domain-level tabs and a related-manager strip",
        "provider roster with detail tabs", "deep-link results nested in the same page stack",
        "copy categories and source project in adjacent panes"],
      removed: ["literal paper and manila folders", "binder rings, staples and paper clips",
        "physical tab dividers and torn edges", "stacked-sheet drop shadows", "parchment and office-supply decoration"]
    }
  }
];

/* ------------------------------------------------------- shared adjudication */

/* Every semantic action the seven concepts can invoke, censused against the base
 * packet's candidate register before proposing anything. `status` is the finding. */
const COMMANDS = [
  { id: "cmd.settings.open", status: "reuse", family: "navigation", note: "Opening Settings is already a product command; the concepts are a surface for it, not a second entry point." },
  { id: "cmd.settings.navigate", status: "reuse", family: "navigation", note: "One command carrying the destination object, not one per level. The concepts' route grammar is its payload." },
  { id: "cmd.settings.search.focus", status: "reuse", family: "navigation" },
  { id: "cmd.settings.search.select_result", status: "reuse", family: "navigation", note: "Payload must be the immutable result id and the resolved destination object. Routing by rendered position is the defect this pass exists to remove." },
  { id: "cmd.settings.category.select", status: "alias", family: "navigation", note: "Candidate alias of cmd.settings.navigate with a domain destination; kept only if the catalog census finds existing callers." },
  { id: "cmd.settings.subcategory.select", status: "alias", family: "navigation", note: "Same: an alias of navigate with a page destination." },
  { id: "cmd.settings.setting.focus", status: "reuse", family: "navigation", note: "Focus and the locator highlight are one effect, not two commands." },
  { id: "cmd.settings.manager.open", status: "reuse", family: "navigation" },
  { id: "cmd.settings.bloom.open", status: "retire", family: "navigation", note: "The chip/bloom modal is the Settings contract these concepts supersede. Retire, keeping a compatibility alias to cmd.settings.navigate only if live callers exist." },
  { id: "cmd.settings.value.set", status: "reuse", family: "values", note: "Needs expected-revision fencing: two windows editing one Project is the changed-elsewhere fixture." },
  { id: "cmd.settings.default.restore", status: "reuse", family: "values" },
  { id: "cmd.settings.scope.inspect", status: "supersede", family: "values", note: "There is no user-facing scope in a Project-only design. What survives is an inspector for WHY a value is what it is — candidate cmd.settings.value.explain — covering managed, unavailable, automatic and not-configured. Recorded as a rename, not a new capability." },
  { id: "cmd.settings.value.explain", status: "candidate", family: "values", note: "Backs `Why this value?`. Read-only; returns origin, default, recommendation, restart requirement and availability reason." },
  { id: "cmd.settings.export", status: "reuse", family: "lifecycle" },
  { id: "cmd.settings.import.preview", status: "reuse", family: "lifecycle" },
  { id: "cmd.settings.import.apply", status: "reuse", family: "lifecycle" },
  { id: "cmd.settings.import.rollback", status: "reuse", family: "lifecycle" },
  { id: "cmd.settings.reset.preview", status: "reuse", family: "lifecycle" },
  { id: "cmd.settings.reset.apply", status: "reuse", family: "lifecycle" },
  { id: "cmd.settings.copy_from_project.preview", status: "reuse", family: "lifecycle", note: "Result must carry additions, replacements, unchanged, unavailable, conflicts and re-pointed account references as separate counts." },
  { id: "cmd.settings.copy_from_project.apply", status: "reuse", family: "lifecycle", note: "Atomic, restore-pointed, verified, receipted. No synchronisation follows it — there is deliberately no cmd.settings.link_projects." },
  { id: "cmd.settings.copy_from_project.rollback", status: "candidate", family: "lifecycle", note: "The register has import.rollback but no copy rollback. The copy receipt is rollback-capable, so the candidate is needed or copy.apply must reuse the restore-point command." },
  { id: "cmd.settings.restore_point.create", status: "candidate", family: "lifecycle", note: "Taken before any transaction. May resolve to an existing storage/backup owner command; flagged for census rather than assumed new." },
  { id: "cmd.provider.installation.scan", status: "reuse", family: "providers" },
  { id: "cmd.provider.installation.select", status: "reuse", family: "providers", note: "Binds by installation identity, never by PATH order." },
  { id: "cmd.provider.installation.install", status: "reuse", family: "providers", note: "Explicit user-triggered first acquisition from the official source for the exact host. Auto/On is not consent." },
  { id: "cmd.provider.installation.update", status: "reuse", family: "providers" },
  { id: "cmd.provider.installation.repair", status: "reuse", family: "providers" },
  { id: "cmd.provider.installation.rollback", status: "reuse", family: "providers" },
  { id: "cmd.provider.installation.verify", status: "reuse", family: "providers" },
  { id: "cmd.provider.installation.adopt", status: "candidate", family: "providers", note: "Adopting a detected installation. Must refuse when ownership cannot be established — the unknown-owner fixture is manual-only." },
  { id: "cmd.provider.connection.add", status: "reuse", family: "providers" },
  { id: "cmd.provider.connection.authenticate", status: "reuse", family: "providers", note: "Separate from installation, always." },
  { id: "cmd.provider.connection.reconnect", status: "reuse", family: "providers" },
  { id: "cmd.provider.catalog.refresh", status: "reuse", family: "providers", note: "Cached catalogue stays visible while refreshing; latest request wins." },
  { id: "cmd.model.favorite.set", status: "reuse", family: "providers" },
  { id: "cmd.model.alias.set", status: "reuse", family: "providers" },
  { id: "cmd.model.priority.set", status: "reuse", family: "providers" },
  { id: "cmd.model.visibility.set", status: "reuse", family: "providers" },
  { id: "cmd.usage.refresh", status: "preserve", family: "providers", note: "Owned by Usage. Settings calls it and renders the answer; it never computes a balance." },
  { id: "cmd.memory.open", status: "reuse", family: "memory_persona_crew" },
  { id: "cmd.memory.verify", status: "reuse", family: "memory_persona_crew" },
  { id: "cmd.memory.edit", status: "reuse", family: "memory_persona_crew" },
  { id: "cmd.memory.delete", status: "reuse", family: "memory_persona_crew" },
  { id: "cmd.memory.restore", status: "reuse", family: "memory_persona_crew" },
  { id: "cmd.persona.manage", status: "reuse", family: "memory_persona_crew" },
  { id: "cmd.crew.template.create", status: "reuse", family: "memory_persona_crew" },
  { id: "cmd.crew.template.update", status: "reuse", family: "memory_persona_crew" },
  { id: "cmd.crew.template.delete", status: "reuse", family: "memory_persona_crew" },
  { id: "cmd.permissions.rule.add", status: "reuse", family: "permissions" },
  { id: "cmd.permissions.rule.update", status: "reuse", family: "permissions" },
  { id: "cmd.permissions.rule.reorder", status: "reuse", family: "permissions" },
  { id: "cmd.permissions.rule.delete", status: "reuse", family: "permissions" },
  { id: "cmd.permissions.rule.test", status: "reuse", family: "permissions" },
  { id: "cmd.notifications.sound.upload", status: "reuse", family: "notifications" },
  { id: "cmd.notifications.sound.import_pack", status: "reuse", family: "notifications" },
  { id: "cmd.notifications.sound.preview", status: "reuse", family: "notifications" },
  { id: "cmd.notifications.sound.delete", status: "reuse", family: "notifications" },
  { id: "cmd.notifications.sound.export", status: "reuse", family: "notifications" },
  { id: "cmd.notifications.destination.test", status: "reuse", family: "notifications" },
  { id: "cmd.theme.create", status: "reuse", family: "appearance" },
  { id: "cmd.theme.import", status: "reuse", family: "appearance" },
  { id: "cmd.theme.export", status: "reuse", family: "appearance" },
  { id: "cmd.theme.preview", status: "reuse", family: "appearance" },
  { id: "cmd.theme.apply", status: "reuse", family: "appearance" },
  { id: "cmd.commands.custom.create", status: "reuse", family: "commands_shortcuts" },
  { id: "cmd.commands.custom.update", status: "reuse", family: "commands_shortcuts" },
  { id: "cmd.commands.custom.delete", status: "reuse", family: "commands_shortcuts" },
  { id: "cmd.commands.custom.dry_run", status: "reuse", family: "commands_shortcuts" },
  { id: "cmd.shortcuts.bind", status: "reuse", family: "commands_shortcuts" },
  { id: "cmd.shortcuts.reset", status: "reuse", family: "commands_shortcuts" },
  { id: "cmd.shortcuts.import", status: "reuse", family: "commands_shortcuts" },
  { id: "cmd.shortcuts.export", status: "reuse", family: "commands_shortcuts" },
  { id: "cmd.mcp.server.add", status: "reuse", family: "resources" },
  { id: "cmd.mcp.server.restart", status: "reuse", family: "resources" },
  { id: "cmd.lsp.server.add", status: "reuse", family: "resources" },
  { id: "cmd.lsp.server.restart", status: "reuse", family: "resources" },
  { id: "cmd.formatter.add", status: "reuse", family: "resources" },
  { id: "cmd.formatter.test", status: "reuse", family: "resources" },
  { id: "cmd.storage.backup.open", status: "reuse", family: "resources" },
  { id: "cmd.artifact.manager.open", status: "reuse", family: "resources" },
  { id: "cmd.doctor.check.run", status: "candidate", family: "diagnostics", note: "Doctor has no command in the register and is a required family. Read-only projection plus named repairs; each repair is an existing owner command, not a new one." },
  { id: "cmd.doctor.repair.start", status: "candidate", family: "diagnostics", note: "Dispatches to the owning subsystem's repair command. Must never silently fix; it opens an ObservableWork operation." },
  { id: "cmd.settings.owner.open", status: "candidate", family: "navigation", note: "The single hand-off used by all ten deferred named owners, carrying the owner name, the originating Settings destination and the return contract." },
  { id: "cmd.settings.close", status: "reuse", family: "navigation", note: "Returns to the surface that opened Settings, which is the origin the deep link recorded." }
];

const WIRING = [
  { source: "Universal search result chosen", command: "cmd.settings.search.select_result", owner: "Settings navigation",
    validation: "the immutable result id must still resolve; an id that no longer exists returns a kept-query notice rather than a guess",
    effect: "route change to the resolved destination object", observable: "none — navigation is synchronous",
    projection: "domain, page, manager, object, section and row selected, focus moved, one calm locator highlight",
    recovery: "Back restores both the query text and the chosen result" },
  { source: "Setting control changed", command: "cmd.settings.value.set", owner: "Settings value store",
    validation: "type and range check; permission and FileSafe where the value governs tool reach",
    effect: "value written for the current Project at an expected revision",
    observable: "none for a local write; an ObservableWork operation when the value triggers a restart or a probe",
    projection: "row state becomes Changed; the copy preview and All Settings counts move with it",
    recovery: "restore the default; a stale revision surfaces as the changed-elsewhere state rather than a silent overwrite" },
  { source: "`Why this value?`", command: "cmd.settings.value.explain", owner: "Settings value store",
    validation: "none — read-only", effect: "none",
    observable: "none", projection: "origin, default, recommendation, restart requirement and availability reason in Details",
    recovery: "n/a" },
  { source: "Manager opened", command: "cmd.settings.manager.open", owner: "the manager's own domain owner",
    validation: "availability of the manager on this host", effect: "lazy hydration of that manager only",
    observable: "hydration is not an operation; any probe it starts is",
    projection: "manager surface inside the same Settings shell, Project, breadcrumb, search, Back and Close retained",
    recovery: "Back returns to the owning domain" },
  { source: "Provider install / set up", command: "cmd.provider.installation.install", owner: "BinaryLocator and the shared integration lifecycle",
    validation: "explicit user action, exact host or environment, official source, publisher and architecture verification",
    effect: "installation staged, verified, activated and bound by identity",
    observable: "ObservableWork with named phases and a real denominator only where one exists",
    projection: "installation row moves from not present to in use; shadowed candidates named",
    recovery: "rollback to the previous generation; an unidentifiable owner stays manual-only" },
  { source: "Copy settings from another Project", command: "cmd.settings.copy_from_project.apply", owner: "Settings lifecycle",
    validation: "source readable, destination writable, preview still current",
    effect: "restore point, then one atomic write of the previewed values, then verification",
    observable: "ObservableWork with a counted denominator, cancellable before commit",
    projection: "receipt with counts and a rollback action; the two Projects remain independent",
    recovery: "verification failure rolls the whole transaction back and says so" },
  { source: "Deferred owner opened", command: "cmd.settings.owner.open", owner: "the named owner module",
    validation: "owner availability", effect: "hand-off with the originating destination and a continuation token",
    observable: "the owner's own operation, projected read-only in Settings",
    projection: "the owner's surface; Settings keeps the destination that opened it",
    recovery: "the owner returns to the exact Settings destination named in its return contract" },
  { source: "Doctor repair", command: "cmd.doctor.repair.start", owner: "the subsystem being repaired",
    validation: "the check must currently be failing; a passing check offers no repair",
    effect: "dispatch to the owning subsystem's existing repair command",
    observable: "ObservableWork, with a truthful terminal, degraded or recovery-required state",
    projection: "the check re-runs and reports its own result; Doctor never asserts success on the owner's behalf",
    recovery: "retry, or escalate to the named owner" }
];

const DRY = [
  { role: "RuntimeResourceGovernor", disposition: "preserved singular owner",
    detail: "Every operation the concepts open asks the one governor for a permit and renders the answer. No concept schedules, queues or admits work." },
  { role: "ObservableWork", disposition: "preserved singular owner",
    detail: "The only progress and wait projection. Determinate progress appears solely with a real denominator; otherwise an honest indeterminate state with a named wait reason." },
  { role: "BinaryLocator and installation lifecycle", disposition: "preserved singular owner",
    detail: "Detection, identity, binding, staging, verification and rollback of provider installations. Settings shows its answers and starts its operations; it never resolves a binary itself." },
  { role: "Provider readiness and Usage", disposition: "preserved singular owner",
    detail: "Readiness comes from the provider lifecycle, balances from Usage. Settings configures the boundary — what happens when included usage ends — and computes neither." },
  { role: "Project identity", disposition: "preserved singular owner",
    detail: "One Project is the subject of every editable value. The concepts show it as context and never as a selector." },
  { role: "AuthBrowserSession", disposition: "preserved singular owner",
    detail: "Human-only. No concept renders, drives or automates a sign-in surface; authentication is handed to the provider's own login." },
  { role: "SettingsInventoryProjection", disposition: "candidate shared headless component",
    detail: "The projection of the canonical inventory into domain, page, section, exposure and record kind. Data and semantics only — it draws nothing. Implemented here as shared2/pm2-inventory.js plus pm2-model.js." },
  { role: "SettingsSearchIndex", disposition: "candidate shared headless component",
    detail: "Immutable result ids, grouped bounded results, typo tolerance and destination objects. One index, seven completely different dropdowns." },
  { role: "SettingsDestination / route grammar", disposition: "candidate shared headless component",
    detail: "A destination is an object — domain, page, section, row, manager, object, subpage — not a string. Every concept parses and writes the same grammar and renders it differently." },
  { role: "ManagerSpec", disposition: "candidate shared headless component",
    detail: "What a manager contains, what each row means, which word describes a status, what an action claims to do. Each concept writes exactly one renderer against it, which is what stops forty-four managers becoming three hundred hand-written screens." },
  { role: "ProjectCopyTransaction", disposition: "candidate shared headless component",
    detail: "Preview, restore point, atomic apply, verification, receipt and rollback, with the credential-reference policy stated once." },
  { role: "SettingsStateFixtures", disposition: "candidate shared headless component",
    detail: "The nineteen deterministic situations, addressable from the route so a screen can be handed to someone else exactly." },
  { role: "SettingRow / ValueSourceBadge / AvailabilityReason", disposition: "concept-native presentation",
    detail: "The vocabulary is shared; the row is not. Each concept lays out title, explanation, control and status in its own rhythm." },
  { role: "SettingsWorkspaceShell / CategoryNavigation / SettingsSearch dropdown", disposition: "concept-native presentation",
    detail: "Deliberately seven different answers. Sharing these would collapse the bakeoff into one application in seven skins, which is the failure this pass exists to avoid." },
  { role: "ManagerShell / ResourceList / Detail", disposition: "concept-native presentation",
    detail: "Composition, entry, exit and motion are the concept's. Only the spec beneath them is shared." },
  { role: "SecretField / SecretReference", disposition: "candidate shared contract, concept-native rendering",
    detail: "The contract is absolute — secret material is never read, rendered or exported — and every concept renders the reference in its own idiom." }
];

const PLAN_OWNERS = [
  ["FinalGUISpec", "Settings gains a directory-and-workspace contract in place of the chip/bloom modal; the navigation, breadcrumb, Back and Close grammar all change with it."],
  ["settings inventory and schema", "Legacy `scope` metadata is projected to the current Project and is no longer an editing axis. `general.interaction.scope-labels` describes a capability a Project-only design does not have."],
  ["Models System / Multi-Account / CLI Bridged Providers / Provider OpenCode", "Provider manager density: connected state, selected account, models, usage-end behaviour, routing and setup answered first; credentials, installations, catalogues, limits and logs as coordinated subpages."],
  ["Binary Locator and installation lifecycle", "Installations are addressable objects with human identity first and resolved launcher, real path, owner and confidence in advanced detail. Unknown ownership is manual-only."],
  ["Assistant Memory / Personas / Goal Runtime / Orchestrator / Planning Wizard / PRD Builder", "Each is a manager family reachable from its owning domain and from search, with a concept-native archetype rather than a wall of rows."],
  ["Permissions / FileSafe", "Rule editing lives in a manager, and permission gates apply to setting writes that govern tool reach."],
  ["Commands / UI Command Catalog", "`cmd.settings.bloom.open` retires; navigation collapses onto one destination-carrying command; search selection must route by immutable result id."],
  ["MCP / Skills / Plugins / Tools / LSP / Formatters / File Manager / Testing", "Catalogue and roster archetypes, lazily hydrated and virtualized."],
  ["Worktrees / Git / GitHub / Containers / Registries", "Roster and read-only health projections inside Settings; the owning subsystems keep their operations."],
  ["Storage / Runtime Artifacts / Outputs", "Retention and cleanup are preview-and-confirm transactions with receipts."],
  ["Release / updates owner", "Application and content updates stay a named owner with a reachable insertion point and a stated return contract."],
  ["Usage", "Read-only snapshot in Settings; measurement, history and projection stay with Usage."]
];

const INVENTORY_IMPACTS = [
  { id: "legacy-scope-metadata", records: "308 records carry scope [global]; a further 246 carry mixed global/project/run/persona/account/provider",
    finding: "The current Project-only decision makes `scope` a provenance fact rather than an editing axis. The concepts project every record into the current Project and never render the field.",
    proposal: "Future schema pass: retain scope as non-user-facing provenance, or drop it, and remove the implication that a reader may choose one." },
  { id: "scope-labels-setting", records: "general.interaction.scope-labels — 'Show Where Settings Apply'",
    finding: "The record describes labelling each setting with Global/Project/Persona and which layer wins. In a Project-only design that capability has no surface.",
    proposal: "Adjudicate: retire the record, or restate it as 'explain why this value is what it is', which is the `Why this value?` affordance the concepts do implement." },
  { id: "settings-search-record", records: "general.interaction.settings-search — 'Search All Settings'",
    finding: "Already promises fuzzy search across every row including hidden ones. The concepts implement exactly that, plus the anchored dropdown and exact deep links the packet requires.",
    proposal: "No change to the record. Its description is the universal search contract and should be treated as canonical." },
  { id: "section-structure", records: "all 828",
    finding: "The inventory has 12 categories and 36 subgroups, but a subgroup can hold 75 records — too many for one readable page. The concepts cut each subgroup into 180 sections of four to eight adjacent related rows, derived from the record ids themselves.",
    proposal: "Future schema pass: carry a section id per record so the grouping is canon rather than derived, and so two surfaces cannot derive it differently." },
  { id: "exposure-ladder", records: "546 records are tier 'advanced', 282 'simple'",
    finding: "Two tiers are not enough to separate an advanced-but-ordinary option from a diagnostic switch. The concepts derive a four-step ladder — standard, advanced, expert, diagnostic — from the tier plus the record id.",
    proposal: "Future schema pass: make exposure explicit rather than inferred." }
];

/* ------------------------------------------------------------------- writers */

function write(stem, name, payload) {
  const dir = path.join(ROOT, stem);
  fs.mkdirSync(dir, { recursive: true });
  const body = typeof payload === "string" ? payload : JSON.stringify(payload, null, 1) + "\n";
  fs.writeFileSync(path.join(dir, name), body);
}

function commandDelta(c) {
  const families = {};
  COMMANDS.forEach((cmd) => { (families[cmd.family] || (families[cmd.family] = [])).push(cmd); });
  const counts = COMMANDS.reduce((acc, cmd) => { acc[cmd.status] = (acc[cmd.status] || 0) + 1; return acc; }, {});
  return {
    schema_id: "pm.settings_candidate_command_delta.v2",
    concept_id: c.stem,
    concept_title: "Opus 5 — " + c.title,
    model: "Opus 5",
    generated: GENERATED,
    packet: PACKET,
    censused_against: "authority/base_packet/CANDIDATE_COMMAND_ID_REGISTER.json",
    discipline: "Every interaction in this concept was matched to an existing candidate family before an id was proposed. Statuses are reuse, alias, retire, supersede, preserve and candidate. Nothing here is canon; the exact names are adjudicated later against the real Command Catalog.",
    note_on_sameness: "This adjudication is intentionally the same across concepts 05-11. The seven designs invoke the same semantic operations against the same canon; proposing seven different command sets would be invention, not a finding. What differs per concept is the ROUTE payload and the surface that raises the command, both recorded below.",
    summary: {
      actions_censused: COMMANDS.length,
      reuse: counts.reuse || 0,
      alias: counts.alias || 0,
      retire: counts.retire || 0,
      supersede: counts.supersede || 0,
      preserve: counts.preserve || 0,
      new_candidates: counts.candidate || 0
    },
    concept_specific: {
      route_grammar: ["#/home", "#/q/<query>[/<resultId>]", "#/d/<domainId>[/<pageId>[/<sectionId>[/<settingId>]]]",
        "#/m/<managerId>[/<objectId>[/<sectionKey>[/<rowId>]]]", "#/copy[/<step>]", "#/all[/<facetQuery>]",
        "optional ?s=<stateFixtureId> on any of them"],
      navigate_payload: "cmd.settings.navigate carries the destination object this concept parsed from the route, never a rendered index",
      raising_surfaces: {
        home: c.home,
        navigation: c.nav,
        manager: c.manager,
        exact_result: c.reveal
      }
    },
    families: Object.keys(families).map((f) => ({
      family: f,
      commands: families[f].map((cmd) => ({ id: cmd.id, status: cmd.status, note: cmd.note || null }))
    })),
    every_action_needs: [
      "canonical command id and owner",
      "typed payload, result and error",
      "current Project and object identity",
      "availability and disabled reason",
      "expected revision, idempotency, fencing and stale-result handling",
      "permission, FileSafe and confirmation",
      "persistence, event and receipt effect",
      "ObservableWork operation link",
      "cancellation, rollback, recovery and reconnect",
      "route, deep-link and focus effect",
      "GUI, natural-language, command-palette and automation equivalence",
      "production wiring evidence and a regression fixture"
    ]
  };
}

function wiringDelta(c) {
  return {
    schema_id: "pm.settings_candidate_wiring_delta.v2",
    concept_id: c.stem,
    model: "Opus 5",
    generated: GENERATED,
    packet: PACKET,
    rule: "UI source -> command -> canonical owner -> validation/permission -> state mutation or operation -> event/receipt/ObservableWork -> UI projection -> Usage/diagnostic attribution -> recovery/deep link",
    honesty_note: "This concept is a prototype. Nothing below is production wiring: local state and seeded receipts stand in for it, and that substitution is stated rather than implied. The traces record what the wiring WOULD have to be.",
    concept_specific: {
      route_state_machine: "explicit: home | query | domain | manager | copy | all, each with an optional state fixture, parsed into a destination object before anything renders",
      persistence_keys: "pm2:" + c.stem + ":v2 — changed values, manager edits, dismissed notices, copy receipts, the active fixture and the last route. In-flight operations are deliberately not persisted.",
      back_contract: "Back moves one Settings level out and names its destination; Escape closes popup, then detail or drawer, then one level out, and stops at Settings Home",
      narrow_contract: c.narrow
    },
    traces: WIRING,
    notifications_and_receipts: {
      inbox: "Every simulated operation emits one receipt into the shell's notification inbox through the single PMSim/PMWork path, so an operation can never appear twice or not at all.",
      receipt_contents: "operation, real call a production build would invoke, outcome word, timestamp, and the rollback action where one exists"
    },
    unresolved: [
      "Whether cmd.settings.copy_from_project.rollback is a new id or a reuse of the restore-point command is a census question, not a design question.",
      "Whether Doctor's repairs dispatch by command id or by a typed capability handle depends on how the owning subsystems already expose repair."
    ]
  };
}

function dryDelta(c) {
  return {
    schema_id: "pm.settings_candidate_dry_delta.v2",
    concept_id: c.stem,
    model: "Opus 5",
    generated: GENERATED,
    packet: PACKET,
    principle: "Share what a thing MEANS. Never share what it LOOKS like. A shared visible renderer would turn seven concepts into one application in seven skins, which is the failure this pass exists to remove.",
    concept_specific: {
      presentation_roles_this_concept_owns: [
        "Home composition — " + c.home,
        "Navigation geometry — " + c.nav,
        "Manager composition — " + c.manager,
        "Exact-result reveal — " + c.reveal,
        "Narrow-width transformation — " + c.narrow,
        "Motion metaphor — " + c.motion,
        "Density and typography — " + c.density
      ],
      shared_headless_modules_consumed: [
        "shared2/pm2-inventory.js", "shared2/pm2-model.js", "shared2/pm2-index.js", "shared2/pm2-route.js",
        "shared2/pm2-managers.js", "shared2/pm2-managers-extra.js", "shared2/pm2-copy.js",
        "shared2/pm2-states.js", "shared2/pm2-scale.js", "shared2/pm2-store.js",
        "shared/pm-manager-kit.js and shared/pm-data*.js (ManagerSpec sources only)",
        "shared/pm-work.js (ObservableWork and the one governor)", "shared/pm-sim.js", "shared/pm-virtual.js",
        "shared/pm-icons.js", "shared/pm-themes.css", "shared/pm-shell.css and shared/pm-shell.js (PM application chrome only)"
      ],
      no_second_owner: "This concept creates no scheduler, no progress owner, no balance calculator, no binary resolver and no second Project identity."
    },
    components: DRY,
    verification: "The manager-route matrix records, per manager, that the surface rendered is this concept's own and that no string in any spec names another concept page. The static suite fails the build if a concept file references opus-5-atlas/console/stack/ledger, another concept-NN page, or an iframe."
  };
}

function impactRegister(c) {
  return {
    schema_id: "pm.settings_concept_impact_register.v2",
    concept_id: c.stem,
    concept_title: "Opus 5 — " + c.title,
    source_family: c.source,
    model: "Opus 5",
    generated: GENERATED,
    packet: PACKET,
    thesis: c.thesis,
    reference_authority: c.retheme
      ? "layout only — the reference's visual skin is removed and rethemed to current Puppet Master"
      : "layout, hierarchy, navigation and density only — never pixels, colours, wording or data",
    retheme: c.retheme || null,
    plan_owner_impacts: PLAN_OWNERS.map((p) => ({ owner: p[0], impact: p[1] })),
    settings_inventory_impacts: INVENTORY_IMPACTS,
    settings_schema_impacts: [
      { id: "section-id", proposal: "Add a stable section id per record so page grouping is canon rather than derived." },
      { id: "exposure", proposal: "Replace the two-value tier with an explicit exposure ladder: standard, advanced, expert, diagnostic." },
      { id: "scope", proposal: "Demote scope to non-user-facing provenance, or drop it, now that every editable value belongs to the current Project." },
      { id: "record-kind", proposal: "Distinguish a persistent setting from a one-shot action; the inventory currently types both as records with `type: action` mixed among values." }
    ],
    command_id_impacts: { see: "candidate-command-delta.json", censused: COMMANDS.length },
    wiring_impacts: { see: "candidate-wiring-delta.json", traces: WIRING.length },
    dry_component_impacts: { see: "candidate-dry-delta.json", roles: DRY.length },
    schema_event_storage_impacts: [
      { id: "settings-changed-event", note: "A value write must emit an event carrying Project, setting id, previous and next value and revision, so a second window can show the changed-elsewhere state rather than silently overwriting." },
      { id: "copy-receipt", note: "The copy transaction needs a durable receipt with its restore point, counts and rollback capability. It is not an import receipt: the sources are two Projects, not a file." },
      { id: "restore-point", note: "Restore points taken by Settings transactions need a retention policy of their own, bounded and visible." }
    ],
    migration_supersession_impacts: [
      { id: "chip-bloom-contract", supersedes: "the PMConcept7 s4 chip rail, horizontal shelves and bloom modal", note: "Replaced by Home -> domain -> page -> manager inside one Settings shell, with a breadcrumb, Back and Close." },
      { id: "inherited-from-global", supersedes: "the 'Inheriting from Global' affordance in the current project settings modal", note: "No inheritance is exposed. Intrinsic managed and unavailable states remain, with their origin in Details." },
      { id: "collective-coverage", supersedes: "the August 8 rule that manager coverage could be collective across concepts and that shared_grammar counted", note: "Every concept demonstrates every non-deferred family itself." },
      { id: "index-position-routing", supersedes: "search that routes by grouped-array position", note: "Routing is by immutable result id and a resolved destination object only." }
    ],
    slint_port_impacts: [
      { id: "stable-ids", note: "Every model row, manager object and destination has a stable id; no view depends on array position." },
      { id: "virtualization", note: "Long lists go through a windowing helper that measures nothing itself and returns an index window plus two spacer heights — the same shape a Slint ListView viewport callback provides." },
      { id: "explicit-state-machines", note: "Routes, menus, drawers and transitions are explicit states, not CSS-only behaviour." },
      { id: "bounded-effects", note: "Blur and shadow are bounded and token-driven; reduced motion multiplies translate distances by zero rather than needing a second rule set." },
      { id: "no-dom-derived-semantics", note: "Layout is measured only to scroll an arrival into view; nothing about what a setting MEANS is read back out of the DOM." }
    ],
    test_fixtures: [
      "19 deterministic state fixtures, addressable as ?s=<id> on any route",
      "828 canonical inventory records with a seeded per-row demo state",
      "a provenance-marked synthetic fixture of 2,400 settings and large installation, tool, server and model rosters, off by default",
      "duplicate-label and typo search cases",
      "a copy transaction whose verification fails and rolls back"
    ],
    deferred_named_owners: [
      "Product Onboarding", "Installation / Deployment", "Server Claim / Bootstrap",
      "Servers / Execution Hosts / Clients", "Project Hosting & Files", "Remote Access",
      "Project Sync / Move", "Puppet Master application/content updates", "Full Server backup owner flow", "Usage"
    ],
    unresolved_questions: [
      "Whether the derived 180-section grouping should become canon, and if so who owns it.",
      "Whether `general.interaction.scope-labels` is retired or restated once Project-only is settled.",
      "Whether a copy rollback reuses the restore-point command or needs its own id.",
      "Whether Doctor is a Settings surface over other owners' checks, or an owner in its own right with its own catalogue."
    ]
  };
}

function planOwnerDelta(c) {
  const lines = [];
  lines.push("# Plan-owner delta — Opus 5 · " + c.title + " (" + c.stem + ")");
  lines.push("");
  lines.push("*" + c.thesis + "*");
  lines.push("");
  lines.push("Source family: **" + c.source + "**. The reference board is authority for layout, hierarchy,");
  lines.push("navigation and density only — never for pixels, colours, wording, provider names, counts or data.");
  if (c.retheme) {
    lines.push("");
    lines.push("## What was borrowed, and what was removed");
    lines.push("");
    lines.push("This reference is **layout-only**. Borrowed:");
    lines.push("");
    c.retheme.borrowed.forEach((b) => lines.push("- " + b + ";"));
    lines.push("");
    lines.push("Removed entirely and rebuilt from Puppet Master's own theme tokens, typography, icons, menus and motion:");
    lines.push("");
    c.retheme.removed.forEach((r) => lines.push("- " + r + ";"));
  }
  lines.push("");
  lines.push("## What this concept's shape presses on");
  lines.push("");
  lines.push("**" + c.nav + "** is the load-bearing decision. Everything below follows from it.");
  lines.push("");
  PLAN_OWNERS.forEach((p) => {
    lines.push("### " + p[0]);
    lines.push("");
    lines.push(p[1]);
    lines.push("");
  });
  lines.push("## Required supersessions");
  lines.push("");
  lines.push("- the old Settings chip / bloom / no-sidebar contract, which PMConcept7 still ships as the `s4-*`");
  lines.push("  hero, chip rail, horizontal shelves and modal editing panel;");
  lines.push("- the `Inheriting from Global` affordance in the current project settings modal — no inheritance is");
  lines.push("  exposed anywhere in this concept;");
  lines.push("- collective manager coverage and `shared_grammar` as a coverage status;");
  lines.push("- search that routes by grouped-array position.");
  lines.push("");
  lines.push("## What this concept deliberately does not own");
  lines.push("");
  lines.push("Measurement and balances (Usage), admission and scheduling (RuntimeResourceGovernor), progress and");
  lines.push("wait projection (ObservableWork), binary resolution and installation lifecycle (BinaryLocator), and");
  lines.push("the ten named owner modules reachable from System & Advanced. Each has a reachable insertion point,");
  lines.push("a named owner, a stated reason for being separate and a return contract — and no fabricated backend.");
  lines.push("");
  lines.push("## Presentation this concept owns alone");
  lines.push("");
  lines.push("| Axis | This concept |");
  lines.push("|---|---|");
  lines.push("| Home composition | " + c.home + " |");
  lines.push("| Navigation geometry | " + c.nav + " |");
  lines.push("| Manager composition | " + c.manager + " |");
  lines.push("| Exact-result reveal | " + c.reveal + " |");
  lines.push("| Narrow-width transformation | " + c.narrow + " |");
  lines.push("| Motion metaphor | " + c.motion + " |");
  lines.push("| Density and typography | " + c.density + " |");
  lines.push("");
  return lines.join("\n");
}

function main() {
  const only = process.argv.slice(2).find((a) => a.startsWith("--concepts="));
  const wanted = only ? only.slice("--concepts=".length).split(",") : null;
  let n = 0;
  CONCEPTS.forEach((c) => {
    if (wanted && wanted.indexOf(c.stem) < 0) return;
    write(c.stem, "impact-register.json", impactRegister(c));
    write(c.stem, "candidate-command-delta.json", commandDelta(c));
    write(c.stem, "candidate-wiring-delta.json", wiringDelta(c));
    write(c.stem, "candidate-dry-delta.json", dryDelta(c));
    write(c.stem, "plan-owner-delta.md", planOwnerDelta(c));
    n += 1;
  });
  process.stdout.write("candidate deltas written for " + n + " concepts\n");
}

main();
