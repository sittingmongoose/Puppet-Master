# Puppet Master Assistant 5.6 Pro — repair delivery v2

Open PM_Chat_Assistant_5.6_Pro_Standalone.html or index.html. Both are self-contained and byte-identical. The complete replacement ZIP merges its Concepts folder at repository root; it also contains generated TestPMConcept and its Settings source/build lane.

## Rebuild
    python build.py
    python build.py --check

Edit the feature source modules, not the generated HTML. Python and Node are needed for the supplied checks, not for opening the standalone.

## This revision
Restores the styled floating activity pill and clear transcript margins; pins item-specific previews; moves Context Lens into flow; adds full BSD configuration and shared main-model/Persona selectors for all collaborative flows; redesigns scheduling; opens exact plans in controllable left tabs; types and links work notices to actual recorded evidence or honest Work notes; preserves narrow History icons and Working design. Adds 27 scoped refinement demos under Demo Studio.

The original Working visual/motion files remain unchanged. The only exception in a Working module is the Step Rail Simple reset registration hook in variants-a.js: it now chains the prior owner once, rather than manually invoking it and then invoking it again through the registry. No Working markup/style/choreography was redesigned.

## Verification and limits
reports/assistant-polish-v2/ contains current hash-bound evidence: 329 Assistant browser assertions (including 192 layout cases and 27 gallery landings); 19 separate TestPM Settings assertions. All passed in the scoped harness. Captured screenshots were inspected for representative revised surfaces. These are concept tests, not native runtime certification.

Not completed: the full original feature-to-demo denominator, exhaustive 60fps recordings and every-frame visual acceptance, or persistent-origin reload (the browser harness uses opaque about:blank injection). Gallery landing is not a complete workflow outcome. Old reports elsewhere in the repository remain historical, not current acceptance.

TestPM Settings are generated from an immutable published checkpoint plus T49 because the unchanged upstream full pipeline currently fails a pre-existing T45 tour-command guard. See Concepts/pm7-tools/ASSISTANT_SETTINGS_V2.md in the repository-root delivery. The full pipeline is NOT claimed green.
