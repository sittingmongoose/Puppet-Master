# c4-ledger — Plan-Owner Delta (final cumulative packet, 2026-08-08)

Concept 4 of the fable Settings bakeoff. Records + inspector idiom; zero motion by identity. This file names the plan owners whose material this concept exercises, the supersessions it relies on, and the boundaries it confirms. Candidate IDs are provisional; canon is never minted here.

## Owners exercised

| Owner | What this concept exercises |
| --- | --- |
| `Plans/storage-plan.md` | Vault mode/path, usage by class, retention classes, legal hold, pressure states, quarantine, compaction, migration-when-idle, four backup kinds, restore points (incl. pending verification on `tank/backups`), test restore, encryption, cleanup categories + dry run. |
| `Plans/Runtime_Artifacts_Panel.md` / `Plans/Project_Output_Artifacts.md` | Artifact records, PM-owned vs provider-native identity, redaction lifecycle, retention expiry, receipts, open/reveal/export/clean. |
| `Plans/WorktreeGitImprovement.md` | Worktree records with leases, stale cleanup candidates, prune gating, test-before-merge, push policy, reflog recovery. |
| `Plans/GitHub_Integration.md` | Pinned workflows, readiness, runs + log excerpts, refresh, starter offer, account capability, panel boundary. |
| `Plans/Containers_Registry_and_Unraid.md` | Docker/Podman/Kubernetes human cards + component detail, cluster contexts, registries, cert-warning trust guidance, Unraid publishing. |
| `Plans/BinaryLocator_Spec.md` | Installation resolution chain, confidence levels, manual-only rule, discovery evidence. |
| `Plans/Release_Supply_Chain.md` | Update lifecycle states, verification checklist, rollback-on-failed-verify, both-direction history. |
| `Plans/FinalGUISpec.md` | Three-pane settings workspace, scrollspy, deep links, notices, themes, reduced motion, title-bar notification canon (via shared shell). |
| Settings inventory / schema owners | New packet rows rendered as ordinary records; transactional import model; restore-point references; receipt links. |
| `Plans/Models_System.md`, `Multi-Account`, `CLI_Bridged_Providers`, `Provider_OpenCode` | Provider/account/model/installation records, auth boundaries, OpenCode server record, free routes and catalogs, requested/effective role diffs. |
| Wiring matrix owner | Twelve candidate traces (`candidate-wiring-delta.json`), all honestly `concept_local_state: true`. |
| Server Backbone return (Post-Return Reconciliation v6) | Connected-server card, project card, hosts/environments/clients, the nine reserved destinations. |

## Supersessions relied on

- **Chip/bloom architecture** — superseded by destination index + record ledger; `cmd.settings.bloom.open` flagged retire.
- **`cmd.settings.open_storage_retention`** — this concept's own navigation overlap: supersedes into `cmd.settings.manager.open` with a `manager.storage` payload (the deep link `#/manager/manager.storage` is the canonical route).
- **`cmd.settings.open_notifications`** — same family supersession; in c4 the id resolves to an honest cross-concept receipt (c2 owns the surface).
- **Stale right-side-panel language** — the c4 inspector is a settings-internal pane under the left-rail canon, not the old right side panel.
- **`regular/yolo` coupling** — access modes are Full Access / Auto / Auto accept edits / Ask for approval everywhere.
- **`cmd.settings.category.reset` vs `cmd.settings.reset.apply{scope}`** — merge flagged in the command delta.

## Boundary confirmations

1. **The four backup kinds stay distinct.** Internal recovery snapshots, settings backups, project backups, and full Server backups render as separate kind records with different owners and schedules; nothing blurs them into one "backup" concept. The full-Server kind is the only part deferred (to `storage-plan.md`), and its reserved-destination record says so.
2. **Dry run never deletes.** `cmd.cleanup.dry_run` is report-only by contract; the demo's dry run mutates nothing, and Apply is a separate command gated behind an explicit caution confirmation. Legal holds and leases are command-level exclusions, not UI decoration.
3. **Leases protect worktrees.** The leased worktree (`Goal #142`) disables Prune with the lease reason shown; the cleanup dry run reports it skipped by name. No flow in this concept can touch a leased worktree.
4. **GitHub Actions operational depth stays in the panel.** Settings owns pinning, readiness, and setup; the boundary note renders inside the manager, and run/workflow records link out to the panel rather than growing operations UI.
5. **PM Browser Program vocabulary only.** The web manager uses *PM Browser Program*, *Expert Browser Program*, and the protected human-only sign-in session. Zero third-party browser-automation terms appear anywhere in this concept's files; the protected session exposes no recording toggle, agent takeover, or inspection surface, and expert capability is policy-driven with no master switch.
6. **WSL is optional and Off is healthy.** The WSL environment record renders with a muted "Off" word, an "Optional" chip, and copy stating Windows-native work is complete without it. Setup appears only on capability demand; nothing marks WSL Off as needing attention in any scenario.
7. **Server modules defer to named owners.** The nine reserved destinations each name their canonical owner and insertion contract ("Coming from …"); their inspectors state explicitly that the backend state machines are not invented here. Move Project / Change Project Files / Change Server / Add Server are receipts pointing at their owners.
8. **Forges connect, tools install.** The source-control manager enforces the install-vs-connect vocabulary: `Connect GitLab`, never `Install Bitbucket`; tool installs always name the exact host and environment (`Install Jujutsu on WSL Ubuntu`).
9. **Moved managers are receipts, not rebuilds.** Context & Instructions (→ c1), Skills/Plugins/Tools (→ c3), and Commands & Shortcuts (→ c3) exist here only as honest receipt records and search results with real cross-page links (`c1-atlas.html#/manager/manager.contextSources`, `c3-focus-stack.html#/manager/manager.skills`, `c3-focus-stack.html#/manager/manager.commands`); their old c4 render code was removed.

## Open question routed to owners

- `system.health.diagnostics-verbosity` (the deep-link probe row) is defined in the shared dataset but grafted into no taxonomy subcategory; c4's deep link falls back to the home all-records table + inspector. The settings inventory owner should assign its canonical sub.

## 2026-08-13 dependency correction

The full-thread performance decision register (omitted from the original packet, supplied by `PM_Settings_Dependency_and_Work_Correction_2026-08-13`) was reviewed in full against this concept. Boundary confirmations added:

- **RuntimeResourceGovernor** remains the only resource/admission owner; nothing in this concept models a second governor — demo staged transitions are UI projections, and the wiring delta's ObservableWork alignment block records how they map onto the register's operation-state grammar.
- **ObservableWork** is the sole progress/wait projection: determinate progress only with a real denominator (index rebuild now shows measured file counts; the scanning phase is honestly indeterminate), progress source declared, wait reasons from the waiting_* vocabulary.
- **Provider-CLI adjudication** (byte-identical to the original packet's copy, sha256 9425dce7…) re-verified: no bundling/pre-seeding/silent-acquisition implication anywhere in this concept's copy or fixtures; explicit official-source install offers with exact Host/Environment stand.
- **Lazy Settings opening model** (register section 20.2) verified with DOM evidence in the correction test pass; startup-scan copy corrected in the shared dataset (skills discovery).
- **Calibration gates** (register section 23) are recorded as implementation benchmarks, not demo claims.

