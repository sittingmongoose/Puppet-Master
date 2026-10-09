# Shard 014: PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L703-L707

Source SHA256: `d2ec258bbb2a25788f82a6b8919d370b64470fcb03482d3774d92377ef92a8f5`

---

## PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

§0.1 update: `Concepts/PMConcept7.html` remains the primary concept input for wiring review, now carrying the integrated Cozy Shelves rail panels (File Manager, Search, Source Control, GitHub Actions, Docker, Testing, Agents, Runtime Artifacts per `Plans/FinalGUISpec.md` F3-497) and the Debug & Run panel with its fleshed bottom Debug tab (Run & Debug Revival, F3-482..F3-496). `Plans/CozyShelves_PM7_Control_Reconciliation.json` preserves the historical 2026-07-29 integrated-panel census, but it is not currentness evidence after the PM6/PM7 rebaseline; a true re-census is required before restoring any 100% command-coverage claim. `Plans/CozyShelves_Control_Reconciliation.json` remains the concept-phase census of the source-lineage `Concepts/rail-concepts/**` files and is current at its relocated `QwenRailConcepts/**` paths. Independently of the deferred PM7 census, the catalog and wiring rows retain the named command dispositions: the `cmd.run_debug.*` family is registered in the Run & Debug Revival Addendum and wired in `Plans/Wiring_Matrix.production.json` (rows `catalog.run_debug_*`), and `cmd.chat.open` is recorded as a compatibility alias of `cmd.chat.open_thread` (exclusions-registered, no second primary row). This note creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

§0.1 update 2026-10-09 (`Plans/Decision_Log.md#DL-162`, `#DL-163`): `Concepts/PMConcept7.html` remains the primary concept input for wiring review. Its rail panels and bottom Debug tab now carry the Polish design (`Plans/FinalGUISpec.md` F3-618 to F3-625), built into the page through the opus-5.5 build as a skin over the same shell panels: every shell control keeps its command id and its `data-demo-action` and `data-demo-arg`, and the Jujutsu view's five tabs (F3-623, F3-624) dispatch only existing `cmd.jujutsu.*`, `cmd.forge.review.*`, `cmd.file.open` and `ui.source_control.backup_history.open` ids, so the skin adds no wiring row and changes no census disposition. `Concepts/LeftRailPMConcept7.html` is the comparison copy (concepts A, B, C and "Original", the rail before Polish) and is not a wiring input. This note creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.
