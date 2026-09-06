# Install repair v2

1. Back up your existing concept files.
2. Extract this ZIP. Merge its **Concepts** folder into the **Puppet-Master repository root**, replacing the supplied files. Do not drop it inside Concepts (that would create Concepts/Concepts).
3. Open Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html. Open Concepts/TestPMConcept.html for the Settings changes.

Both generated HTML files are included; no build is required merely to open them. To verify/rebuild:

    python "Concepts/chat-assistant-concepts/5.6 Pro/build.py" --check
    python Concepts/pm7-tools/build_testpm_assistant_settings.py --check

To regenerate, remove --check. The standalone's matching index.html and all source inputs are included. The TestPM checkpoint builder needs Python and Node. It does not need the rest of the repository to reproduce this Settings delivery.

Important: the recorded repository baseline is 4c88c0f01300cea36135b73eec96991d73969aa2. Newer unrelated changes, particularly build_pm7.py or TestPM onboarding work, must be merged rather than overwritten. SOURCE_DIFFS/ and REPLACEMENT_MANIFEST.json identify the baseline and exact edits. No files outside this explicit payload are to be deleted.

Normal full TestPM rebuilding remains blocked by the pre-existing T45 tour-command guard; the supplied pinned-checkpoint T49 lane is the reproducible delivery build. It does not certify the full upstream pipeline. See Concepts/pm7-tools/ASSISTANT_SETTINGS_V2.md.

Canonical Plans are intentionally not included as replacement files. Give PM_Assistant_Plans_Repair_Packet_v2.zip to the Plans agent instead of the earlier unsent packet. The revised packet is cumulative.

Evidence: 348 scoped browser assertions passed, not complete motion/runtime certification. Exhaustive every-demo 60fps/every-frame acceptance and persistent-origin reload remain open.
