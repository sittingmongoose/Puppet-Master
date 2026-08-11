# Puppet Master Concept Rules

1. Work only in `Concepts/<topic>/<model-folder>/`. The folder name must include the model name from the prompt. One model gets one folder per topic.
2. Keep every requested concept in that folder. Do not reduce a many-concept request to one design.
3. Put the exact model name visibly at the top of every concept page using `data-concept-model="MODEL NAME"`.
4. PMConcept7 is the read-only baseline. Never edit PMConcept7, Plans, ConceptHub, or another model's folder.
5. Show enough simplified surrounding Puppet Master UI to judge context and spacing. Include relevant open, closed, narrow, and squeezed states. Keep that full shell visible in Hub previews; never remove its top or bottom bars for iframe/embed mode. The fake shell should stay visually quiet.
6. Make the important controls, variants, and configuration choices functional.
7. Support Friendly, Glass, Retro, and Basic themes in light and dark, plus reduced motion. Use SVGs, not emoji.
8. Create `concept-hub.json` at the model-folder root and keep it synchronized whenever a concept is added, renamed, or removed. List every concept plus the folder index/workspace; in a legacy folder, include all existing pages, not only new work. This manifest is the only Hub registration you edit; the Hub discovers it automatically. Set its width role to `page`, `panel`, `chat`, or `none`. Start from `Concepts/ConceptHub/starter/model-folder/`.
9. Test through the shared Hub. Use an OS-assigned port (`0`), a unique temporary browser profile/output folder, and never stop a process you did not start.
10. Before finishing, delete all temporary test and verification material: results, reports, screenshots, recordings/videos, traces, downloads, browser profiles, coverage, and generated output folders. Keep only files used by the concept or explicitly requested as deliverables.
11. Before finishing, run:
   `python3 Concepts/ConceptHub/validate.py Concepts/<topic>/<model-folder>`
