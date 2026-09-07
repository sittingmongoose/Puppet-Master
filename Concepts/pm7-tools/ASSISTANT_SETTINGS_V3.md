# TestPMConcept Settings — v3 source refinement

The generated TestPMConcept HTML is not hand-edited. `assistant_settings_source.py` consumes the existing immutable checkpoint via `build_testpm_assistant_settings.py`, then applies `assistant_narrow_source.py` and its JavaScript/CSS sources.

```sh
python Concepts/pm7-tools/build_testpm_assistant_settings.py
python Concepts/pm7-tools/build_testpm_assistant_settings.py --check
```

The refinement applies shared aligned-row presentation to manager output and preserves existing actions, Settings IDs, storage logic and the Orbit/Step Rail Simple setting. Statistic notes remain available in tooltips; longer section introductions remain in About disclosures. Model/Persona pickers, BSD controls and scheduling settings from the v2 source remain.

This is the dedicated checkpoint/T49 refinement lane, NOT a certification of the full upstream PM7 build. That pipeline was not rerun here; its earlier T45 issue remains unadjudicated. The dedicated generator verifies every non-Settings script against the immutable checkpoint and parses all scripts with Node.

The current measurement inventory has 21 top-level manager workspaces. Tests cover them at 590, 900 and 1440 pixels; not all nested manager actions or all themes were accepted. No live providers or backend services are involved.
