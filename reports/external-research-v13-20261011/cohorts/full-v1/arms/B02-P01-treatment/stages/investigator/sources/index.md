# Source index

This index keeps the source IDs stable. The structured records, identity, exact URLs, access UTC, locator, observed operation, governing conditions/defaults/exceptions, and applicability are in [source-map.json](../source-map.json). Do not rebind an ID to a different page/version; add a new ID if the source changes.

## Normative and interpretation references

- [S-WCAG22-REC] [W3C WCAG 2.2 Recommendation, 12 Dec 2024](https://www.w3.org/TR/2024/REC-WCAG22-20241212/) — keyboard, no trap, character shortcuts, focus, status messages, names/roles/states, and color.
- [S-WCAG2ICT] [W3C WCAG2ICT Group Note](https://www.w3.org/TR/wcag2ict-22/) — informative interpretation for desktop software; not a normative standard.
- [S-WCAG-KEYBOARD] [Understanding Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard) and [S-WCAG-FOCUS] [Understanding Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).
- [S-WCAG-COLOR] [Understanding Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) and [S-WCAG-STATUS] [Understanding Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages).
- [S-APG-COMBO] [WAI-ARIA APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and [S-APG-DIALOG] [WAI-ARIA APG Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## Platform references

- [S-WIN-UIA] [Microsoft UI Automation Overview](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-uiautomationoverview).
- [S-GNOME-ACCESSIBILITY] [GNOME Developer Accessibility Guidance](https://developer.gnome.org/documentation/guidelines/accessibility.html) and [S-ORCA] [Orca introduction](https://help.gnome.org/orca/introduction.html).

## Product and repository references

- [S-VSCODE-UI] [VS Code user interface / Command Palette](https://code.visualstudio.com/docs/editing/getting-started/userinterface) and [S-VSCODE-SEARCH] [VS Code editor tutorial / fuzzy search](https://code.visualstudio.com/docs/editing/getting-started/editor-tutorial).
- [S-VSCODE-QUICKPICK-API] [VS Code Extension API: Quick Pick](https://code.visualstudio.com/api/references/vscode-api), [S-VSCODE-EXT-COMMANDS] [Commands guide](https://code.visualstudio.com/api/extension-guides/command/), [S-VSCODE-KEYBINDINGS] [Keyboard shortcuts and when-clause contexts](https://code.visualstudio.com/docs/configure/keybindings).
- [S-VSCODE-QUICKINPUT-SOURCE] [Pinned VS Code Quick Input source](https://github.com/microsoft/vscode/blob/9b463ccc1d17131640406ee961b4724c0ec75433/src/vs/platform/quickinput/common/quickInput.ts); [S-VSCODE-COMMANDS-SOURCE] [Pinned command palette provider](https://github.com/microsoft/vscode/blob/9b463ccc1d17131640406ee961b4724c0ec75433/src/vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.ts); [S-VSCODE-QUICKINPUT-TESTS] [Pinned Quick Input tests](https://github.com/microsoft/vscode/blob/9b463ccc1d17131640406ee961b4724c0ec75433/src/vs/platform/quickinput/test/browser/quickinput.test.ts).
- [S-VSCODE-REFRESH-PR] [VS Code PR #281303, specific proposed Quick Pick refresh commit](https://github.com/microsoft/vscode/pull/281303/files/36ea28f43b5b4ffdf8bed3db9ada14ecebb2d462); PR was open at access time, not treated as released.
- [S-VSCODE-NVDA-ISSUE] [VS Code issue #152291, NVDA focus regression and verified fix](https://github.com/microsoft/vscode/issues/152291).
- [S-CKEDITOR-ARCH] [CKEditor 5 core editor architecture](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/core-editor-architecture.html), [S-CKEDITOR-COMMANDS] [Command registration and state tutorial](https://ckeditor.com/docs/ckeditor5/latest/framework/tutorials/crash-course/commands.html), and [S-CKEDITOR-KEYSTROKE] [KeystrokeHandler API](https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_keystrokehandler-KeystrokeHandler.html).

The VS Code source snapshot is pinned to commit \`9b463ccc1d17131640406ee961b4724c0ec75433\`. Official product/API documentation and APG/platform pages are living documentation; each record captures the retrieval time and states that no immutable release version was published where applicable.

- [S-APG-MENU-DISABLED] [WAI-ARIA APG Menu and Menubar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) — menu items may remain focusable when disabled, but this rule is specific to menu semantics.
- [S-APG-KEYBOARD-DYNAMIC] [WAI-ARIA APG Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) and [S-WAI-ARIA-12] [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/) — discoverability/focus patterns and logical focus movement if a focused row is removed.
