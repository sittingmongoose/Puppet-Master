# Selective reference-layout rollback

Rebuild the current published TestPMConcept through:

```sh
python3 Concepts/pm7-tools/build_testpm_layout_b06.py
python3 Concepts/pm7-tools/build_testpm_layout_b06.py --check
```

This lane pins the exact current `28d5fe439257f8dbdc297ae311d6769a6476ab01` HTML, not the older T48 checkpoint. It replaces only `pm50-manager-layout` from the authored assistant_narrow_source.css. All 29 script elements (26 JavaScript and 3 JSON) remain byte-identical, including Settings, inventory and tour scripts. All 892 settings and 21 concrete manager workspaces remain.

Do not run the older build_testpm_assistant_settings.py and overwrite newer content: it does not reproduce the current published baseline. Its unchanged failed --check is retained in evidence. The full upstream PM7 pipeline is not certified by this narrowly scoped builder. If later source waves are merged, reconcile their source/build lane rather than silently repinning this immutable checkpoint.

Removed: video-inspired flattened manager surfaces, forced single-column grids and flat section/row spacing. Preserved: native earlier card/grid styling, shared picker behavior, concise help/disclosures, no decorative left stripes, overflow protection, inventories, settings persistence implementation, all newer onboarding/tour behavior.
