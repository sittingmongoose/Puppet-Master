# 5.6 Sol — Final Settings Bakeoff Findings

These findings describe the four implemented concepts and the product architecture exercised by them. They do not select or recommend a winner.

## 1. The existing Sol foundation was worth preserving

The prior Sol work already contained a serious state/view/motion system: normalized Settings data, global search, exact navigation, browser deep links, scrollspy, responsive shell behavior, theme handling, reduced motion, and four materially different compositions. Replacing it with four new static mockups would have reduced fidelity.

The final pass therefore extends the architecture rather than flattening it. The major change is coverage: the original flagship managers now sit beside the complete assigned manager families, provider installation boundaries, lifecycle operations, deterministic review fixtures, persistence, and repository-facing impact artifacts.

## 2. Shared semantics do not require shared composition

The four concepts use the same semantic records and transaction contracts, but their visual systems remain distinct:

- **Index House** treats settings as addressable records with provenance and lineage.
- **Switchboard** treats settings as operational signals, stations, previews, and readiness state.
- **Wayfinder** treats settings as routes, prerequisites, checkpoints, verification, and recovery.
- **Ledger** treats settings as dense requested/effective records, receipts, histories, and comparisons.

This separation is important for a valid bakeoff. Differences are not limited to color, corner radius, or card arrangement. Each concept changes how the user understands location, causality, detail, and state transition.

## 3. Settings Home should orient before it manages

The most useful Home behavior is not a grid of every possible control. Home should answer:

- Where am I?
- What needs attention?
- What changed?
- What can I configure here?
- Which destination owns the next action?

All four concepts therefore use Home as a destination and readiness surface, then move detailed work into the Settings workspace or a manager. Compact notices carry an action and an owner destination; they do not become oversized warning cards.

## 4. Destination navigation should not be disguised filtering

Category pills are poorly suited to primary Settings navigation because they look temporary and filter-like. Stable Settings locations need address, current-location, keyboard, deep-link, and history semantics.

The concepts use directory entries, station rows, route checkpoints, or folio records. Search results resolve to the same destination model. This also makes narrow drill-in behavior and focus restoration predictable.

## 5. Search is a router, not an isolated text filter

Global Settings search is strongest when its result describes and opens an exact destination:

```text
screen -> category/subcategory -> setting
screen -> manager/tab -> resource/child
```

The implemented search supports fuzzy matching, typo fixtures, no-result state, keyboard traversal, exact destination metadata, and deep-link-compatible navigation. A Usage result navigates to the Settings-side provider snapshot or records a handoff to the Usage owner rather than pretending that Settings owns the complete Usage product.

## 6. Provider setup and provider installation must remain separate

The provider work revealed the most important architecture boundary in the pass. A provider family is not an executable, and an executable is not an authenticated account.

The durable model should retain separate identities for:

- provider family;
- account/profile;
- connection/authentication owner;
- entitlement/plan;
- model and capability evidence;
- executable installation;
- host/environment;
- discovery evidence;
- ownership confidence;
- update/rollback state.

This prevents several dangerous UX shortcuts:

- treating detected credentials as permission to install software;
- silently replacing an unknown installation;
- treating CLI-owned OAuth as Puppet Master direct OAuth;
- hiding a shadowed executable that may still affect invocation;
- presenting Free Models as an independent synthetic provider;
- dropping last-known-good catalogue data when refresh fails;
- changing captured in-flight routing when a future preference changes.

## 7. Provider installation needs an evidence-led workflow

The explicit installation workflow is most legible as:

```text
Detect -> Review official source -> Confirm explicit install -> Verify ownership/version -> Ready
```

Update and rollback are separate transactions. A failed verification should not collapse into a generic error banner; it should retain the prior version, show the failed step, explain what was preserved, and expose rollback or manual recovery.

Unknown ownership is not an invitation to take control. It should become manual-only until the user explicitly resolves it.

## 8. Requested and effective state should be a first-class grammar

Many Settings values are not simply On or Off. They may be inherited, managed, unsupported, unavailable, auto-selected, overridden for a project, or temporarily ineffective because of capacity, policy, authentication, or environment.

The concepts consistently separate:

- requested value;
- effective value;
- source/provenance;
- scope;
- reason;
- material effect;
- restart or reconnect requirement;
- recovery or owner destination.

This grammar is especially useful for model routing, testing capabilities, permissions, context policy, Appearance, and tooling.

## 9. Manager families should remain semantically distinct

MCP, Skills, Plugins, Tools, and Commands are related but not interchangeable. Combining them into a generic extensions screen erases different ownership, trust, lifecycle, and restart/reconnect behavior.

The Wayfinder concept keeps these families distinct while still showing dependencies among them. The same rule applies to:

- storage retention versus backup/restore;
- notification preview versus test delivery;
- provider setup versus executable installation;
- settings import/export versus Copy Settings From;
- source control versus worktree lifecycle;
- runtime artifacts versus project search index;
- cleanup versus retention policy.

## 10. Lifecycle operations need visible gates and receipts

Import, restore, reset, install, update, test, cleanup, theme, and sound-pack actions should not be single opaque buttons. The user needs to see what is being examined, what requires a choice, what will change, what is protected, and what recovery remains.

The transaction system therefore supports:

- staged progression;
- hard choice gates;
- validation before mutation;
- failure at a deterministic stage;
- rollback where meaningful;
- result receipts;
- return to the owning destination.

The import flow is a representative example: validation occurs before merge/replace selection, conflicts must be reviewed, sensitive values remain explicit, and completion is not reported before the choice gate is satisfied.

## 11. Local preview and external effect must be visibly different

This distinction matters for Notifications & Sounds and Appearance.

A sound preview is a local audition. A test send exercises a notification route. A theme preview is reversible and should not silently commit the theme. Custom TOML validation should show unsupported tokens and a safe fallback before apply.

Switchboard’s motion reinforces this boundary: preview choreography stays local to the preview station, while transactional state moves through a finite operational sequence.

## 12. Spellcheck should assist without becoming autocorrect

The spellcheck design keeps deliberate actions separate:

- Replace once;
- Ignore once;
- Ignore for draft;
- Add to Personal dictionary;
- Add to Project dictionary.

Technical content remains excluded: code, URLs, paths, commands, hashes, identifiers, structured data, literal text, and named models/providers/Personas/tools. No provider call or silent autocorrection is implied.

## 13. The deferred Server module needs an insertion contract, not invented behavior

The final packet requires awareness of the future Server architecture but not a speculative backend. Ledger therefore reserves explicit destinations for:

- Servers;
- Execution Hosts;
- Clients;
- Project Hosting & Files;
- Remote Access;
- Updates.

The shell demonstrates where those modules join Settings navigation, search, deep links, and ownership. It does not invent networking, host-selection, authentication, synchronization, or update state machines that belong to the later Server owner work.

## 14. Persistent review state materially improves concept evaluation

A Settings concept is difficult to evaluate when every refresh loses the exact state under review. Namespaced local persistence now retains navigation, manager state, selections, theme, density, motion preference, fixtures, provider state, and transaction history.

Persistence also needs a trustworthy reset. The final reset restores the entire authored baseline, not merely the current fixture or route. A regression test was added after browser testing exposed a theme-restoration defect in the first implementation.

## 15. Deterministic triggers are better than hidden demo assumptions

The 24 named triggers make required states reviewable without source edits or timing luck. This supports design review, browser automation, accessibility inspection, and eventual Slint parity.

A useful fixture contract contains:

- stable ID;
- destination;
- state mutation;
- visible status;
- primary action;
- recovery action;
- expected test probe;
- reset behavior.

The concepts expose these through both an in-page fixture tray and `PMSettingsDemo`.

## 16. Motion should explain causality, not decorate inactivity

The strongest motion sequences in this pass communicate one of five things:

- destination transfer;
- system reconciliation;
- transaction progress;
- preview versus commit;
- failure and recovery.

The four concepts therefore use different participant roles for the same semantic intent. This is more meaningful than applying one easing curve to four skins.

Film-level motion in a Settings product does not require constant spectacle. It requires careful staging, continuity, focus, restraint, and a clear final frame. Indefinite pulses, large glow fields, text shimmer, and delayed focus were intentionally avoided.

## 17. Reduced motion must preserve the same product state

Reduced motion is not a separate simplified application. The destination, transaction result, focus target, receipt, error, and recovery state must remain identical.

The implementation installs final geometry immediately and retains only restrained focus or opacity cues. The browser matrix checks all eight themes with reduced motion in every concept.

## 18. Narrow layouts should change mode rather than merely compress

The concepts use intentional responsive modes:

- wide multi-pane workspace;
- standard desktop workspace;
- narrow list/detail drill-in;
- very narrow destination-first mode;
- squeezed-height navigation and manager handling.

At narrow widths, secondary evidence becomes a drawer, inline section, or next-step destination. Controls are not simply squeezed until labels clip.

The tested width range is 520–2500 pixels, with additional long-copy, 135% text, RTL, coarse-pointer, and forced-color checks.

## 19. Impact analysis must remain provisional until owner adjudication

The six artifacts per concept deliberately distinguish concept evidence from canon. They identify probable owner docs, candidate command reuse, supersession, wiring, DRY candidates, and plan-owner impacts, but they do not edit those authorities.

The command census found 699 unique `cmd.*` tokens. Presence in the catalog is only a first filter. Semantic reuse still requires matching scope, persistence, validation, ownership, ObservableWork behavior, receipts, recovery, and Usage/diagnostic implications.

`cmd.settings.bloom.open` is consistently flagged for supersession or compatibility alias review because the final destination-navigation model replaces the old bloom/chip behavior.

## 20. Browser execution found a real defect that structural tests did not

State and architecture tests passed before the persistence profile cycle. Browser reload/reset testing then revealed that Reset Demo State returned Home and cleared fixtures but retained a restored theme.

The fix changed reset from a partial baseline operation to a complete authored-state restore and added a dedicated state regression test. This validates the value of running real profile persistence, not only isolated unit state.

## 21. Production boundaries remain explicit

The concepts simulate external operations. They do not authenticate real providers, install CLIs, update binaries, mutate files, send notifications, restore backups, operate containers, modify source control, invoke test tools, clean workspaces, or configure future Servers.

What is implemented is the complete interaction contract for design review:

- information architecture;
- state model;
- validation and choices;
- deterministic progress/failure/rollback;
- receipts;
- deep links;
- focus and keyboard behavior;
- responsive and reduced-motion behavior;
- candidate command, wiring, DRY, and Plan-owner impact.

That boundary keeps the bakeoff honest while making later implementation implications concrete.
