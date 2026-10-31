# Shared ELI5 gaps — resolved in canon by DL-259 (2026-10-31)

Jared’s ruling is applied. Wizard and Guided Tour share global `general.interaction.mode`, default `ELI5`, labelled **Plain English / Expert**, through existing Settings preview/apply. Bindings are `onboarding.interaction.mode` and `tour.interaction.mode`. PWIZ-022/023, UCC-175, CS-069, WM-041, UIW-015, onboarding/Tour contracts and fixtures now agree. `ui.guided_tour.toggle_eli5` is a compatibility local adapter, not a second preference. DL-126’s tips/help-only limit and no rewrite of replies remain. Final GUI source anchors follow the lead’s GUI-head signal.

The table below records the gaps before this amendment. The field audit has since been read; its real product corrections are included in DL-259. Historical snapshot line numbers remain locators for that audit, not current line pins.

---

# QA2 ELI5 additions — canon gap audit, 2026-10-30

Source: Jared's two additions relayed by `pm7-build` in this thread on 2026-10-30. Snapshot: Plans worktree based on `e7ff5d4a6e7d818d53a8cf08117780527681358f` with the current QA2 alignment edits. This memo records the next amendment; it does not hold the current QA2 commit or invent GUI IDs before onboarding supplies them.

| Location | What already exists | Gap / required amendment |
| --- | --- | --- |
| `Plans/settings_inventory.json`, `general.interaction.mode` | Global `ELI5` / `Expert`, default and recommended `ELI5`; label How the app talks to me. | Reuse this one state for both bars. The existing description also covers jargon/rare-control visibility. The new dual-copy requirement concerns tips/help and does not itself retire that existing behavior. No new setting. |
| `Plans/Planning_Wizard.md`, PWIZ-022 / PWIZ-023 | Onboarding hints and the Tour's ELI5 top control are specified. | No `general.interaction.mode` reference connects wizard and Tour. Add a wizard bar control, shared setting/default, explicit disclosure and dual-copy coverage of every onboarding `?` tip/help section, including FileSafe and differences among source-control services. |
| `Plans/product_onboarding_contracts.schema.json` and fixtures | Existing closed choice-help presentation, and 14 local actions; appearance preview is separately bounded. | No shared ELI5/Expert mode or default/control contract. Add the presentation/Settings binding using onboarding's final names, preserving closed native owner envelopes and existing commit boundaries. |
| `Plans/guided_tour_contracts.schema.json:678` and fixtures (`eli5.changes`) | Top control `ui.guided_tour.toggle_eli5`; currently pins `tour_narration_only`. | This conflicts with the new shared mode. Replace the independent-state assertion with the shared application setting while retaining no-rewrite/no-regeneration of the Teacher answer. Do not conflate chat reply ELI5. |
| `Plans/UI_Command_Catalog.md`, UCC-175:14773; `Plans/Commands_System.md`, CS-069 / CS-087 | Chat ELI5 and the onboarding action boundary already exist. | Catalog says Tour top-bar ELI5 changes narration only. Amend it and document the existing Settings transaction route for the shared bar choice after GUI names arrive; mint no per-bar setting or chat command alias. |
| `Plans/Wiring_Matrix.md`, WM-041:3571,3654; `Plans/UI_Wiring_Rules.md`, UIW-015; `Plans/pm7_control_bindings.json` | Typed onboarding/Tour route rules exist. | WM-041 explicitly pins `tour_narration_only`; UIW/bindings lack the shared wizard/Tour setting pair. Align prose, schemas/fixtures, bindings and source anchors with onboarding's final controls. |
| `Plans/Decision_Log.md`, DL-126:2609,11030,11048 | Expert/ELI5 dual copy is already limited to tooltips and help; switching chat ELI5 never rewrites earlier replies. | Preserve this limit. Expanded novice explanations live behind user-opened tips/help, not duplicate helper lines or screens. Add the dated source ruling when compiling the follow-up. |

Acceptance for the follow-up: both bars reflect the same `general.interaction.mode`; first use defaults to ELI5; changing one updates the other; every onboarding `?` and help section has useful ELI5 and technical text; disclosures stay closed until opened; no jargon knowledge is assumed in the ELI5 version; chat reply ELI5 and the original Tour answer remain unchanged. Final GUI control names and actual source-control field corrections are awaited from the lead/onboarding lane.

`lanes/onb-audit/FLOW-AND-FIELDS.md` was not present at this snapshot. The source-control service audit remains owned by that lane; this memo does not pre-empt its findings or add service fields.
