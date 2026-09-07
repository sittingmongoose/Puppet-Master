# TestPMConcept Settings — v3 source refinement

The generated TestPMConcept HTML is not hand-edited. The complete `build_pm7.py` pipeline now combines the Settings repairs and Guided Tour lifecycle work with `assistant_settings_source.py`, `assistant_narrow_source.py`, and their JavaScript/CSS sources. Build a review candidate with the complete pipeline:

```sh
python3 Concepts/pm7-tools/build_pm7.py --outdir scratchpad/pm7-review --out scratchpad/pm7-review/TestPMConcept.html
```

The immutable-checkpoint lane below remains useful for reproducing the earlier isolated T49 refinement, but it excludes the subsequent sound, tour, and workspace-owner repairs. Use an explicit comparison output; do not use its default output to replace the current combined preview or silently repin its checkpoint.

```sh
python3 Concepts/pm7-tools/build_testpm_assistant_settings.py --out scratchpad/pm7-checkpoint-comparison.html
python3 Concepts/pm7-tools/build_testpm_assistant_settings.py --out scratchpad/pm7-checkpoint-comparison.html --check
```

The refinement applies shared aligned-row presentation to manager output and preserves existing actions, Settings IDs, storage logic and the Orbit/Step Rail Simple setting. Statistic notes remain available in tooltips; longer section introductions remain in About disclosures. Model/Persona pickers, BSD controls and scheduling settings from the v2 source remain.

The original T49 refinement did not rerun the full upstream pipeline. That historical limitation does not describe the September 7 combined build: `scratchpad/pm-tour-polish-20260906/build-17/build_report.json` records all five passing full-generator gates, with separate Settings, Planning, and lifecycle browser checkpoints for the same bytes. These are scoped concept checks, not full visual acceptance, governance closure, durable tour reload, or native Slint certification. The dedicated checkpoint generator still verifies every non-Settings script against its older immutable checkpoint and parses all scripts with Node.

The current measurement inventory has 21 top-level manager workspaces. Tests cover them at 590, 900 and 1440 pixels; not all nested manager actions or all themes were accepted. No live providers or backend services are involved.
