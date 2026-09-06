# T49 Assistant Settings source update

Do not edit TestPMConcept.html directly. Rebuild this delivery from source:

    python Concepts/pm7-tools/build_testpm_assistant_settings.py
    python Concepts/pm7-tools/build_testpm_assistant_settings.py --check

The checkpoint builder verifies base/TestPMConcept-assistant-settings-base.html against assistant_settings_checkpoint.json, applies assistant_settings_source.py and its JS/CSS/contract inputs, parses all 26 scripts, and checks every non-Settings script against the checkpoint byte-for-byte. A changed checkpoint fails; never silently repin it.

T49 is also registered after T48 in build_pm7.py. The normal upstream full pipeline currently fails BEFORE T49 in the existing T45 guided-tour command-delta guard. No tour guards/choreography were altered. The checkpoint lane is reproducible source generation, not a direct-output patch or evidence that the full pipeline passed. Full upstream acceptance remains with the tour/build owner.

General → Assistant has Presentation, Back Seat Driver, Agent lineups and Scheduling defaults. AI & Providers → Back Seat Driver projects the same exact Settings values. Working activity reuses general.interaction.working-activity-style with Orbit / Step Rail Simple; old key/value aliases are explicit. Five new roster/stage projection rows are proposed in the separate v2 Plans packet and are not yet canonical inventory admissions. Runtime/daemon persistence and application to active runs are not certified by these fixtures.

The replacement includes a complete modified build_pm7.py for the recorded baseline. If that file has newer unrelated local changes, use the supplied source diff/preimage manifest to merge the T49 import/transform/provenance rather than overwriting that newer work.
