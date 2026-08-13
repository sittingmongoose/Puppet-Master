# HOOKS.md — DOM contract census (mechanical extraction from PMConcept4.html)

Scanned: `getElementById/querySelector/querySelectorAll` string literals in **24-js-main** (15090-16647), **25-js-terminal-demo** (16648-18707), **26-js-prd-annotations** (18708-20122); plus inline `on*=` handlers in HTML parts 11-23 that call functions defined in those scripts.

Verdicts: **MUST-EXIST** = cross-part dependency (JS in one part targets DOM in another) or listed contract id — the id/selector must survive every Wave-1 rewrite, appearing exactly once (ids). **internal** = defined and consumed inside the same part (safe if that part is rewritten as a unit). **DYNAMIC/unresolved** = selector built at runtime or target created by JS; keep the creating code intact.

## A. Known contract ids (always MUST-EXIST)

| id | defined-in part | notes |
|----|-----------------|-------|
| `#projectSettingsModal` | 15-page-projects | modal root; `.visible` class toggled |
| `#pmToastStack` | 22-html-status-toast | global toast container (window.toast) |
| `#bottomPanel` | 20-html-bottom-panel | terminal/bottom panel root |
| `#detachedTerminalWindow` | 22-html-status-toast | detached terminal floating window |
| `#terminalResizer` | 20-html-bottom-panel | bottom panel drag handle (also part-20 marker line) |
| `#tplThreadTerminalDemo` | 23-html-floating-chat | template cloned by PM_TERMINAL_DEMO |
| `#panel-artifacts` | 12-html-side-panels | page root |
| `#panel-dashboard` | 14-page-dashboard | page root |
| `#panel-docker` | 12-html-side-panels | page root |
| `#panel-files` | 12-html-side-panels | page root |
| `#panel-git` | 12-html-side-panels | page root |
| `#panel-orchestrator` | 17-page-orchestrator | page root |
| `#panel-projects` | 15-page-projects | page root |
| `#panel-run` | 12-html-side-panels | page root |
| `#panel-search` | 12-html-side-panels | page root |
| `#panel-settings` | 19-page-settings-shell | page root |
| `#panel-source` | 12-html-side-panels | page root |
| `#panel-usage` | 18-page-usage | page root |
| `#panel-wizard` | 16-page-wizard | page root |
| `#tab-dashboard` | 11-html-shell-open | page tab |
| `#tab-orchestrator` | 11-html-shell-open | page tab |
| `#tab-projects` | 11-html-shell-open | page tab |
| `#tab-settings` | 11-html-shell-open | page tab |
| `#tab-usage` | 11-html-shell-open | page tab |
| `#tab-wizard` | 11-html-shell-open | page tab |
| `#editorView`, `#editorPane1`, `#editorPane2`, `#editorPane2CodeArea`, `#editorSplitResizer`, `#editorDashResizer` | 14-page-dashboard | editor pane ids — heavily used by parts 24/25/26 (see section B) |
| `#pmSetTermFont`, `#pmSetTermLH` | NOT DEFINED in PMConcept4 (null-guarded reads at lines 16693-16694, 16711) | CLAIMABLE hooks: PM_TERMINAL_DEMO.applySettings() reads them if present (font-size px + line-height inputs). The settings agent may create them (exactly once each); no other agent may. |

## B. JS selector census (parts 24-26)

| selector | via | defined-in | referenced-by | ref lines | verdict |
|----------|-----|-----------|---------------|-----------|---------|
| `#ac-` | byId | (runtime-created / not in static HTML) | 25-js-terminal-demo | 18609 | DYNAMIC/unresolved |
| `#activityBar` | byId | 11-html-shell-open | 25-js-terminal-demo | 18397 | MUST-EXIST |
| `#approveBtn` | byId | (runtime-created / not in static HTML) | 26-js-prd-annotations | 18951 | DYNAMIC/unresolved |
| `#autoPulse` | byId | 14-page-dashboard | 25-js-terminal-demo | 18482 | MUST-EXIST |
| `#autoStatusText` | byId | 14-page-dashboard | 25-js-terminal-demo | 18481 | MUST-EXIST |
| `#automationBanner` | byId | 14-page-dashboard | 25-js-terminal-demo | 18450, 18480 | MUST-EXIST |
| `#automationBrowserTab` | byId | 14-page-dashboard | 25-js-terminal-demo | 18449, 18484, 18505 | MUST-EXIST |
| `#bottomPanel` | byId | 20-html-bottom-panel | 24-js-main, 25-js-terminal-demo | 16641, 18406 | MUST-EXIST |
| `#bottomTerminalHost` | byId | 20-html-bottom-panel | 24-js-main | 15887, 16604 | MUST-EXIST |
| `#browserAddressBar` | byId | 14-page-dashboard | 25-js-terminal-demo | 18452 | MUST-EXIST |
| `#browserConsolePane` | byId | 20-html-bottom-panel | 25-js-terminal-demo | 18564 | MUST-EXIST |
| `#browserEvidencePane` | byId | 20-html-bottom-panel | 25-js-terminal-demo | 18566 | MUST-EXIST |
| `#browserNetworkPane` | byId | 20-html-bottom-panel | 25-js-terminal-demo | 18565 | MUST-EXIST |
| `#browserPreviewTab` | byId | 14-page-dashboard | 25-js-terminal-demo | 18448, 18498 | MUST-EXIST |
| `#browserSessionBadge` | byId | 14-page-dashboard | 25-js-terminal-demo | 18451, 18483 | MUST-EXIST |
| `#browserTabContent` | byId | 14-page-dashboard | 25-js-terminal-demo, 26-js-prd-annotations | 18446, 20080 | MUST-EXIST |
| `#chatPanel` | byId | 21-html-chat-panel | 25-js-terminal-demo | 17926, 18204, 18354 | MUST-EXIST |
| `#chatResizer` | byId | 20-html-bottom-panel | 25-js-terminal-demo | 17927, 18203, 18358 | MUST-EXIST |
| `#collapseBottom` | byId | 20-html-bottom-panel | 24-js-main | 16644 | MUST-EXIST |
| `#configRsTab` | byId | 14-page-dashboard | 25-js-terminal-demo | 18447 | MUST-EXIST |
| `#contextDetailPane` | byId | 14-page-dashboard | 25-js-terminal-demo | 17582 | MUST-EXIST |
| `#dashGridMain` | byId | 14-page-dashboard | 25-js-terminal-demo | 18082 | MUST-EXIST |
| `#dashGridMetrics` | byId | 14-page-dashboard | 25-js-terminal-demo | 18083 | MUST-EXIST |
| `#dashGridMonitoring` | byId | 14-page-dashboard | 25-js-terminal-demo | 18084 | MUST-EXIST |
| `#dashboardView` | byId | 14-page-dashboard | 25-js-terminal-demo | 18057, 18362 | MUST-EXIST |
| `#drawer` | byId | (runtime-created / not in static HTML) | 26-js-prd-annotations | 18913 | DYNAMIC/unresolved |
| `#editorDashResizer` | byId | 14-page-dashboard | 25-js-terminal-demo | 18371 | MUST-EXIST |
| `#editorPane1` | byId | 14-page-dashboard | 25-js-terminal-demo, 26-js-prd-annotations | 18272, 18283, 20057 | MUST-EXIST |
| `#editorPane2` | byId | 14-page-dashboard | 25-js-terminal-demo, 26-js-prd-annotations | 18276, 20074 | MUST-EXIST |
| `#editorPane2CodeArea` | byId | 14-page-dashboard | 25-js-terminal-demo, 26-js-prd-annotations | 18445, 20079 | MUST-EXIST |
| `#editorSplitResizer` | byId | 14-page-dashboard | 25-js-terminal-demo | 17586, 17956 | MUST-EXIST |
| `#editorView` | byId | 14-page-dashboard | 24-js-main, 25-js-terminal-demo | 15892, 16216, 17583, 17953, 18264 | MUST-EXIST |
| `#exec-mock-content` | byId | 16-page-wizard | 26-js-prd-annotations | 18721 | MUST-EXIST |
| `#fileContextMenu` | byId | 12-html-side-panels | 26-js-prd-annotations | 19003, 19013 | MUST-EXIST |
| `#floatingChat` | byId | 23-html-floating-chat | 25-js-terminal-demo | 17941 | MUST-EXIST |
| `#orchDagPreview` | byId | 17-page-orchestrator | 25-js-terminal-demo | 18336 | MUST-EXIST |
| `#orchGraphDetailBody` | byId | 17-page-orchestrator | 25-js-terminal-demo | 18343 | MUST-EXIST |
| `#pane1Code` | byId | 14-page-dashboard | 26-js-prd-annotations | 20064 | MUST-EXIST |
| `#pane1Gutter` | byId | 14-page-dashboard | 26-js-prd-annotations | 20063 | MUST-EXIST |
| `#pane1Minimap` | byId | 14-page-dashboard | 26-js-prd-annotations | 20065 | MUST-EXIST |
| `#pane2Code` | byId | 14-page-dashboard | 26-js-prd-annotations | 20085 | MUST-EXIST |
| `#pane2Gutter` | byId | 14-page-dashboard | 26-js-prd-annotations | 20084 | MUST-EXIST |
| `#pane2Minimap` | byId | 14-page-dashboard | 26-js-prd-annotations | 20086 | MUST-EXIST |
| `#pill-` | byId | (runtime-created / not in static HTML) | 26-js-prd-annotations | 18718, 18728 | DYNAMIC/unresolved |
| `#pmBottomTermChrome` | byId | 20-html-bottom-panel | 24-js-main | 16275, 16628 | MUST-EXIST |
| `#pmEditorTerminalStack` | byId | 14-page-dashboard | 24-js-main | 15889, 16176 | MUST-EXIST |
| `#pmSetTermFont` | byId | (runtime-created / not in static HTML) | 25-js-terminal-demo | 16693, 16711 | DYNAMIC/unresolved |
| `#pmSetTermLH` | byId | (runtime-created / not in static HTML) | 25-js-terminal-demo | 16694 | DYNAMIC/unresolved |
| `#pmTermCenterOuter` | byId | 20-html-bottom-panel | 24-js-main | 16626 | MUST-EXIST |
| `#pmTerminalCenterWrap` | byId | 20-html-bottom-panel | 24-js-main | 16274, 16627 | MUST-EXIST |
| `#pmToastStack` | byId | 22-html-status-toast | 24-js-main | 15097 | MUST-EXIST |
| `#prd-mock-content` | byId | 16-page-wizard | 26-js-prd-annotations | 18709 | MUST-EXIST |
| `#resubmitBtn` | byId | (runtime-created / not in static HTML) | 26-js-prd-annotations | 18952, 18973 | DYNAMIC/unresolved |
| `#sidePanelSlot` | byId | 11-html-shell-open | 25-js-terminal-demo | 18378 | MUST-EXIST |
| `#themeSelect` | byId | 11-html-shell-open | 25-js-terminal-demo | 18669 | MUST-EXIST |
| `#tplThreadTerminalDemo` | byId | 23-html-floating-chat | 25-js-terminal-demo | 16828 | MUST-EXIST |
| `#wtCreateModal` | byId | (runtime-created / not in static HTML) | 25-js-terminal-demo | 17740, 17761 | DYNAMIC/unresolved |
| `#wtMergeModal` | byId | (runtime-created / not in static HTML) | 25-js-terminal-demo | 17806, 17827 | DYNAMIC/unresolved |
| `#orch-tab-plan_compile, .orch-tab[data-tab='plan_compile']` | qs | 17-page-orchestrator | 25-js-terminal-demo | 17936 | MUST-EXIST |
| `.` | qs | (runtime-created / not in static HTML) | 25-js-terminal-demo | 18028, 18029 | DYNAMIC/unresolved |
| `.activity-bar .icon[title="Chat"]` | qs | 11-html-shell-open | 25-js-terminal-demo | 17948, 17980, 17984, 17988 | MUST-EXIST |
| `.activity-bar .icon[title="Dashboard"]` | qs | 11-html-shell-open | 25-js-terminal-demo | 18058 | MUST-EXIST |
| `.context-lens-btn` | qs | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17703, 17717 | MUST-EXIST |
| `.context-lens-popover` | qs | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17704, 17718 | MUST-EXIST |
| `.drawer-content` | qs | 16-page-wizard | 26-js-prd-annotations | 18916 | MUST-EXIST |
| `.editor-code` | qs | 14-page-dashboard | 25-js-terminal-demo | 18296 | MUST-EXIST |
| `.editor-pane:not([style*="display: none"])` | qs | 14-page-dashboard | 25-js-terminal-demo | 17954 | MUST-EXIST |
| `.editor-tabs` | qs | 14-page-dashboard | 25-js-terminal-demo | 18286 | MUST-EXIST |
| `.editor-tabs .tab.active` | qs | 14-page-dashboard | 25-js-terminal-demo, 26-js-prd-annotations | 18598, 20103 | MUST-EXIST |
| `.editor-tabs .tab[data-file="` | qs | 14-page-dashboard | 26-js-prd-annotations | 20060, 20077 | MUST-EXIST |
| `.fm-wt-root-dropdown` | qs | (runtime-created / not in static HTML) | 25-js-terminal-demo | 17884 | DYNAMIC/unresolved |
| `.gated-text` | qs | 16-page-wizard | 26-js-prd-annotations | 18956 | MUST-EXIST |
| `.inspector-view.active` | qs | (runtime-created / not in static HTML) | 25-js-terminal-demo | 18425 | DYNAMIC/unresolved |
| `.minimap-canvas` | qs | 14-page-dashboard | 26-js-prd-annotations | 19968, 20099 | MUST-EXIST |
| `.minimap-viewport` | qs | 14-page-dashboard, 17-page-orchestrator | 26-js-prd-annotations | 19994, 20029 | MUST-EXIST |
| `.open-count` | qs | 16-page-wizard | 26-js-prd-annotations | 18920 | MUST-EXIST |
| `.orch-rungraph-node[data-node-id="` | qs | 17-page-orchestrator | 25-js-terminal-demo | 18340 | OPTIONAL (null-safe; pm6 graph replaces; W2 retargets) |
| `.page-tab[data-page='orchestrator']` | qs | 11-html-shell-open | 25-js-terminal-demo | 17933 | MUST-EXIST |
| `.pm-term-overflow-menu` | qs | (runtime-created / not in static HTML) | 24-js-main | 16292 | DYNAMIC/unresolved |
| `.settings-inspector-panel` | qs | (runtime-created / not in static HTML) | 25-js-terminal-demo | 18424 | DYNAMIC/unresolved |
| `.tab` | qs | 11-html-shell-open, 14-page-dashboard, 15-page-projects, 17-page-orchestrator, 18-page-usage, 20-html-bottom-panel, 25-js-terminal-demo | 25-js-terminal-demo | 18247 | MUST-EXIST |
| `.tab.dragging` | qs | 11-html-shell-open, 14-page-dashboard, 15-page-projects, 17-page-orchestrator, 18-page-usage, 20-html-bottom-panel, 25-js-terminal-demo | 25-js-terminal-demo | 18148, 18160 | MUST-EXIST |
| `.workflowHeaderTitle` | qs | (runtime-created / not in static HTML) | 25-js-terminal-demo | 17601 | DYNAMIC/unresolved |
| `.wt-bind-dropdown` | qs | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17734 | MUST-EXIST |
| `.wt-bind-label` | qs | (runtime-created / not in static HTML) | 25-js-terminal-demo | 17777, 17789, 17798, 17912 | DYNAMIC/unresolved |
| `input` | qs | (runtime-created / not in static HTML) | 25-js-terminal-demo | 17766 | DYNAMIC/unresolved |
| `#editorPane2 .editor-tabs .tab` | qsa | 14-page-dashboard | 25-js-terminal-demo | 18455, 18497 | MUST-EXIST |
| `.` | qsa | (runtime-created / not in static HTML) | 25-js-terminal-demo | 17686 | DYNAMIC/unresolved |
| `.ac-nav-item` | qsa | (runtime-created / not in static HTML) | 25-js-terminal-demo | 18602, 18606 | DYNAMIC/unresolved |
| `.ac-section` | qsa | (runtime-created / not in static HTML) | 25-js-terminal-demo | 18608 | DYNAMIC/unresolved |
| `.activity-bar .icon[data-target]` | qsa | 11-html-shell-open | 25-js-terminal-demo | 18376 | MUST-EXIST |
| `.bottom-tabs-left .tab` | qsa | 20-html-bottom-panel | 25-js-terminal-demo | 18531 | MUST-EXIST |
| `.browser-bottom-subtabs .subtab` | qsa | 20-html-bottom-panel | 25-js-terminal-demo | 18561 | MUST-EXIST |
| `.chat-dropdown-btn span` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17638 | MUST-EXIST |
| `.chat-dropdown-item[data-value]` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17644 | MUST-EXIST |
| `.chat-dropdown-popover` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17688 | MUST-EXIST |
| `.chat-stream-footer` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17678 | MUST-EXIST |
| `.chat-thread-item` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17594 | MUST-EXIST |
| `.chatFooterFiles` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17661 | MUST-EXIST |
| `.chatFooterProblems` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17669 | MUST-EXIST |
| `.chatFooterSubagents` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17653 | MUST-EXIST |
| `.chatHeaderTitle` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17607 | MUST-EXIST |
| `.chatModesBar` | qsa | (runtime-created / not in static HTML) | 25-js-terminal-demo | 17596 | DYNAMIC/unresolved |
| `.chatRoleBadge` | qsa | (runtime-created / not in static HTML) | 25-js-terminal-demo | 17606 | DYNAMIC/unresolved |
| `.chatWorkflowHeader` | qsa | (runtime-created / not in static HTML) | 25-js-terminal-demo | 17600 | DYNAMIC/unresolved |
| `.cl-mode-item` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17706, 17719 | MUST-EXIST |
| `.code-line.diff-added, .code-line.diff-modified, .code-line.diff-conflict` | qsa | (runtime-created / not in static HTML) | 26-js-prd-annotations | 20049 | DYNAMIC/unresolved |
| `.composer-chip .close-chip` | qsa | 21-html-chat-panel, 23-html-floating-chat, 25-js-terminal-demo, 26-js-prd-annotations | 25-js-terminal-demo | 18524 | MUST-EXIST |
| `.composer-chips-container` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo, 26-js-prd-annotations | 18520, 18876, 19050 | MUST-EXIST |
| `.context-lens-popover` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17698, 17727 | MUST-EXIST |
| `.dashboard-tabs` | qsa | 14-page-dashboard | 25-js-terminal-demo | 18064 | MUST-EXIST |
| `.editor-minimap` | qsa | 14-page-dashboard | 26-js-prd-annotations | 20098 | MUST-EXIST |
| `.editor-tabs` | qsa | 14-page-dashboard | 25-js-terminal-demo | 18144 | MUST-EXIST |
| `.editor-tabs .tab` | qsa | 14-page-dashboard | 25-js-terminal-demo, 26-js-prd-annotations | 18174, 18586, 20059 | MUST-EXIST |
| `.editor-tabs .tab.tab-focused` | qsa | 14-page-dashboard | 25-js-terminal-demo | 18593 | MUST-EXIST |
| `.editor-tabs .tab[data-tab-type="code"]` | qsa | 14-page-dashboard | 26-js-prd-annotations | 20076 | MUST-EXIST |
| `.exec-pill` | qsa | 16-page-wizard | 26-js-prd-annotations | 18727 | MUST-EXIST |
| `.inspector-view` | qsa | (runtime-created / not in static HTML) | 25-js-terminal-demo | 18430 | DYNAMIC/unresolved |
| `.lsp-registry-row` | qsa | (runtime-created / not in static HTML) | 26-js-prd-annotations | 19040 | DYNAMIC/unresolved |
| `.messageStream` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17595 | MUST-EXIST |
| `.minimap-heat-strip` | qsa | (runtime-created / not in static HTML) | 26-js-prd-annotations | 19967 | DYNAMIC/unresolved |
| `.mode` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17598 | MUST-EXIST |
| `.orch-rungraph-node, .orch-rungraph-row` | qsa | 17-page-orchestrator | 25-js-terminal-demo | 18338 | OPTIONAL (null-safe; pm6 graph replaces; W2 retargets) |
| `.orch-tab` | qsa | 17-page-orchestrator | 25-js-terminal-demo | 18677, 18683, 18690 | MUST-EXIST |
| `.orch-tab-content` | qsa | 17-page-orchestrator | 25-js-terminal-demo | 18685 | MUST-EXIST |
| `.page-settings .bento-card` | qsa | 19-page-settings-shell | 25-js-terminal-demo | 18644, 18664 | MUST-EXIST |
| `.page-settings .settings-tab` | qsa | 19-page-settings-shell | 25-js-terminal-demo | 18636, 18640 | MUST-EXIST |
| `.page-tab` | qsa | 11-html-shell-open | 25-js-terminal-demo | 18614, 18618, 18623 | MUST-EXIST |
| `.page-wizard` | qsa | 16-page-wizard | 25-js-terminal-demo | 17962 | MUST-EXIST |
| `.pane-container` | qsa | 14-page-dashboard, 20-html-bottom-panel | 24-js-main, 25-js-terminal-demo | 15881, 18107 | MUST-EXIST |
| `.pane-header-drag` | qsa | 14-page-dashboard, 20-html-bottom-panel | 25-js-terminal-demo | 18100 | MUST-EXIST |
| `.pendingInterventionBlock` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17614 | MUST-EXIST |
| `.pm-term-ctx-menu` | qsa | (runtime-created / not in static HTML) | 24-js-main | 15217 | DYNAMIC/unresolved |
| `.pm-term-dragging, .pm-term-drop-target, .pm-term-drop-hover, .pm-term-pane-drop-target` | qsa | (runtime-created / not in static HTML) | 24-js-main | 15894 | DYNAMIC/unresolved |
| `.pm-term-pane-resizer` | qsa | (runtime-created / not in static HTML) | 24-js-main | 16570 | DYNAMIC/unresolved |
| `.prd-pill` | qsa | 16-page-wizard | 26-js-prd-annotations | 18717 | MUST-EXIST |
| `.primary-content > .page` | qsa | 13-html-shell-mid | 25-js-terminal-demo | 18620 | MUST-EXIST |
| `.sc-tab` | qsa | (runtime-created / not in static HTML) | 26-js-prd-annotations | 19020 | DYNAMIC/unresolved |
| `.seg-btn` | qsa | 25-js-terminal-demo | 25-js-terminal-demo | 17832 | internal |
| `.selectable-doc` | qsa | 16-page-wizard | 26-js-prd-annotations | 18806 | MUST-EXIST |
| `.settings-inspector-panel` | qsa | (runtime-created / not in static HTML) | 25-js-terminal-demo | 18439 | DYNAMIC/unresolved |
| `.side-panel-view` | qsa | 12-html-side-panels | 25-js-terminal-demo | 18386 | MUST-EXIST |
| `.slash-command-menu` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17592 | MUST-EXIST |
| `.tab` | qsa | 11-html-shell-open, 14-page-dashboard, 15-page-projects, 17-page-orchestrator, 18-page-usage, 20-html-bottom-panel, 25-js-terminal-demo | 25-js-terminal-demo | 18068, 18165, 18233, 18288, 18590 | MUST-EXIST |
| `.tab:not(.dragging)` | qsa | 11-html-shell-open, 14-page-dashboard, 15-page-projects, 17-page-orchestrator, 18-page-usage, 20-html-bottom-panel, 25-js-terminal-demo | 25-js-terminal-demo | 18133 | MUST-EXIST |
| `.wizard-nav-connector` | qsa | 16-page-wizard | 25-js-terminal-demo | 17969 | MUST-EXIST |
| `.wizard-nav-step` | qsa | 16-page-wizard | 25-js-terminal-demo | 17963 | MUST-EXIST |
| `.wizard-step-panel` | qsa | 16-page-wizard | 25-js-terminal-demo | 17972 | MUST-EXIST |
| `.wt-bind-btn` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17774, 17786, 17796, 17910 | MUST-EXIST |
| `.wt-bind-dropdown` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17739, 17785, 17795, 17891 | MUST-EXIST |
| `.wt-current-label .wt-status-pill` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17918 | MUST-EXIST |
| `.wt-current-name` | qsa | 21-html-chat-panel, 23-html-floating-chat | 25-js-terminal-demo | 17917 | MUST-EXIST |

## C. Inline handler functions (HTML parts 11-23 -> functions defined in parts 24-26)

| function | defined-in | called from parts (inline on*=) | call-site lines |
|----------|-----------|--------------------------------|-----------------|
| `addBrowserChipToChat()` | 25-js-terminal-demo | 14-page-dashboard | 10582, 10583, 10584 |
| `addFileChipToChat()` | 26-js-prd-annotations | 12-html-side-panels | 9956 |
| `bindWorktree()` | 25-js-terminal-demo | 21-html-chat-panel, 23-html-floating-chat | 13832, 13833, 13834, 13835, 13836, 14386, 14387, 14388… |
| `clearContextLensMode()` | 25-js-terminal-demo | 21-html-chat-panel, 23-html-floating-chat | 13895, 14449 |
| `cycleBadge()` | 26-js-prd-annotations | 12-html-side-panels, 22-html-status-toast | 10260, 10264, 10268, 14360 |
| `filterSearchResults()` | 26-js-prd-annotations | 12-html-side-panels | 9984 |
| `filterWorktrees()` | 25-js-terminal-demo | 12-html-side-panels | 10105, 10106, 10107, 10108 |
| `handleTakeover()` | 25-js-terminal-demo | 14-page-dashboard | 10612, 10613, 10614 |
| `openContextDetailPane()` | 25-js-terminal-demo | 21-html-chat-panel, 23-html-floating-chat | 13856, 14410 |
| `openPRDBuilder()` | 25-js-terminal-demo | 16-page-wizard | 11454 |
| `selectContextLensMode()` | 25-js-terminal-demo | 21-html-chat-panel, 23-html-floating-chat | 13882, 13886, 13890, 14436, 14440, 14444 |
| `showCreateWorktreeModal()` | 25-js-terminal-demo | 12-html-side-panels, 21-html-chat-panel, 23-html-floating-chat | 10170, 13838, 14392 |
| `showExecMock()` | 26-js-prd-annotations | 16-page-wizard | 11778, 11779 |
| `showMergeModal()` | 25-js-terminal-demo | 12-html-side-panels | 10120, 10136 |
| `showPRDMock()` | 26-js-prd-annotations | 16-page-wizard | 11651, 11652, 11653 |
| `switchBottomTab()` | 25-js-terminal-demo | 20-html-bottom-panel | 13643, 13644, 13645, 13646, 13647, 13648 |
| `switchBrowserSubtab()` | 25-js-terminal-demo | 20-html-bottom-panel | 13722, 13723, 13724 |
| `switchEditorPane1Tab()` | 26-js-prd-annotations | 14-page-dashboard | 10536, 10537, 10538, 10539 |
| `switchEditorPane2CodeTab()` | 26-js-prd-annotations | 14-page-dashboard | 10552, 10553, 10554 |
| `switchEditorPane2Tab()` | 25-js-terminal-demo | 14-page-dashboard | 10555, 10560 |
| `switchToChatThread()` | 25-js-terminal-demo | 21-html-chat-panel, 23-html-floating-chat | 13925, 13939, 13954, 13968, 13982, 13996, 14010, 14129… |
| `toast()` | 24-js-main | 12-html-side-panels, 21-html-chat-panel, 22-html-status-toast, 23-html-floating-chat | 9942, 9943, 9945, 9946, 9948, 9949, 9952, 9953… |
| `toggleBottomBrowserTab()` | 25-js-terminal-demo | 14-page-dashboard | 10586 |
| `toggleContextLensDropdown()` | 25-js-terminal-demo | 21-html-chat-panel, 23-html-floating-chat | 13874, 14428 |
| `toggleFileManagerRoot()` | 25-js-terminal-demo | 12-html-side-panels | 9906 |
| `toggleSearchReplace()` | 26-js-prd-annotations | 12-html-side-panels | 9983 |
| `toggleWorktreeDropdown()` | 25-js-terminal-demo | 21-html-chat-panel, 23-html-floating-chat | 13826, 14380 |
| `unbindWorktree()` | 25-js-terminal-demo | 21-html-chat-panel, 23-html-floating-chat | 13839, 14393 |

Every one of these function names is a **MUST-EXIST global symbol**: if an HTML part keeps (or adds) an inline `on*=` handler naming it, the defining JS part must keep exporting it. check_hooks.py enforces this at assemble time.

## D. Id arguments passed inside inline handlers (string literal matches a defined id)

| id | defined-in | passed from parts | verdict |
|----|-----------|-------------------|---------|
| `#browserPermissionsPanel` | 14-page-dashboard | 14-page-dashboard | internal |
| `#contextDetailPane` | 14-page-dashboard | 14-page-dashboard | internal |
| `#ghSettings` | 16-page-wizard | 16-page-wizard | internal |
| `#pmCardRich` | 23-html-floating-chat | 23-html-floating-chat | internal |
| `#projectSettingsModal` | 15-page-projects | 15-page-projects | internal |

## E. Baseline duplicate ids (pre-existing in PMConcept4 — check_ids.py baseline)

| id | count | parts |
|----|-------|-------|
| `#' + nodeId + '` | 2 | 25-js-terminal-demo |
| `#1` | 2 | 17-page-orchestrator |
| `#2` | 2 | 17-page-orchestrator |
| `#2.1` | 2 | 17-page-orchestrator |
| `#2.2` | 2 | 17-page-orchestrator |
| `#2.3` | 2 | 17-page-orchestrator |

