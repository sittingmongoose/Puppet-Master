# Critic source index — B02-P01-treatment

This stage’s [source-map.json](../source-map.json) preserves all investigator IDs and original identities. Critic checks are additive; no ID or URL has been silently rebound.

## Standards and interpretation

- [S-WCAG22-REC](https://www.w3.org/TR/2024/REC-WCAG22-20241212/) — dated W3C Recommendation; keyboard, focus, names/states, status messages and color.
- [S-WCAG2ICT](https://www.w3.org/TR/wcag2ict-22/) — informative Group Note, not a non-web conformance standard.
- [S-APG-COMBO](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), [S-APG-DIALOG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [S-APG-KEYBOARD-DYNAMIC](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), [S-WAI-ARIA-12](https://www.w3.org/TR/wai-aria-1.2/) — web patterns to adapt and validate.

## Platform sources

- [S-WIN-UIA](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-uiautomationoverview) — Windows providers, elements and control patterns.
- [S-GNOME-ACCESSIBILITY](https://developer.gnome.org/documentation/guidelines/accessibility.html) and [S-ORCA](https://help.gnome.org/orca/introduction.html) — AT-SPI and Orca/toolkit support.

## Product and repository comparisons

- [S-VSCODE-QUICKINPUT-SOURCE](https://github.com/microsoft/vscode/blob/9b463ccc1d17131640406ee961b4724c0ec75433/src/vs/platform/quickinput/common/quickInput.ts), [S-VSCODE-COMMANDS-SOURCE](https://github.com/microsoft/vscode/blob/9b463ccc1d17131640406ee961b4724c0ec75433/src/vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.ts), [S-VSCODE-QUICKINPUT-TESTS](https://github.com/microsoft/vscode/blob/9b463ccc1d17131640406ee961b4724c0ec75433/src/vs/platform/quickinput/test/browser/quickinput.test.ts) — pinned VS Code commit 9b463ccc1d17131640406ee961b4724c0ec75433.
- [S-VSCODE-QUICKPICK-API](https://code.visualstudio.com/api/references/vscode-api), [S-VSCODE-EXT-COMMANDS](https://code.visualstudio.com/api/extension-guides/command/), [S-VSCODE-KEYBINDINGS](https://code.visualstudio.com/docs/configure/keybindings) — living API/product documentation.
- [S-VSCODE-NVDA-ISSUE](https://github.com/microsoft/vscode/issues/152291) — bounded Windows/NVDA issue history.
- [S-CKEDITOR-ARCH](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/core-editor-architecture.html), [S-CKEDITOR-COMMANDS](https://ckeditor.com/docs/ckeditor5/latest/framework/tutorials/crash-course/commands.html), [S-CKEDITOR-KEYSTROKE](https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_keystrokehandler-KeystrokeHandler.html) — editor command-state comparators.

## Mismatched pointer retained

- [S-VSCODE-REFRESH-PR](https://github.com/microsoft/vscode/pull/281303/files/36ea28f43b5b4ffdf8bed3db9ada14ecebb2d462) is preserved as carried but marked mismatched/unusable: the PR title is an unrelated Quick Bar change and the linked commit is a merge of main. Do not cite it as a Quick Pick refresh precedent.

The target editor/repository was not supplied. None of these comparator records is target-code evidence. Full access times, observations, conditions and applicability are in source-map.json.
