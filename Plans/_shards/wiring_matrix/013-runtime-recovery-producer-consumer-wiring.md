# Shard 013: Runtime Recovery Producer / Consumer Wiring

Source: `Plans/Wiring_Matrix.md`

Source lines: L320-L428

Source SHA256: `d0e6748a3fa3a920fc557eabe4c198ee2512b7948ff45642932f209e2ee2d566`

---

## Runtime Recovery Producer / Consumer Wiring
### Minimum required rows
The following rows are required for the promoted Section 15 feature set and the reconciled terminal/editor integration model.

| UI element / surface | UICommand ID | Producer | Consumer / handler | Required effect |
|---|---|---|---|---|
| Project switcher result row | `cmd.project.switch_active_tab` | Projects view / command palette | shell state controller | Switch active workspace tab to target project and recalc effective state |
| Project switcher alternate action | `cmd.project.open_in_new_workspace_tab` | Projects view / command palette | shell state controller | Open target project in a new workspace tab |
| Thread context hover `More Details` | `cmd.chat.open_thread_context_details` | chat header hover module | chat layout / editor-tab controller | Open or focus the canonical thread Context Detail Pane |
| Thread context click `Compact Now` | `cmd.chat.compact_context` | chat header Compact Now action | chat runtime controller | Dispatch only after explicit user choice; emit started/completed/failed events and return started, already_running, cancelled, no_op, degraded, unavailable, retry_scheduled, completed, or failed status |
| Goal button/chip/icon or slash `/goal` | `cmd.chat.goal.start` | Assistant Chat composer / Goal chip / slash-command dispatcher | Goal Runtime controller | Start visible Goal Mode from the current thread using the Goal Runtime event envelope; concrete Goal event names and payload schemas remain owner-registered in Goal_Runtime_System, Contracts_V0, and storage-plan |
| Goal status update icon, `/goal again`, or natural-language update request | `cmd.chat.goal.update` | Assistant Chat status/menu / composer / slash-command dispatcher | Goal Runtime controller | Submit an active-goal update through the Goal Runtime event envelope without inventing concrete payload schemas in Wiring_Matrix |
| Restore-and-branch CTA | `cmd.chat.branch_from_restore` | History / restore UI | thread/session controller | Create new thread/session branch from restore point |
| Browser toolbar `Open in Browser` | `cmd.browser.open_workspace_preview` | file preview / command palette / open action | browser-session controller | Create or focus the canonical `workspace_preview` browser session |
| Browser toolbar `Open in Detached Browser` | `cmd.browser.open_detached_preview` | file preview / command palette / open action | browser-session controller | Create or focus the canonical `detached_preview` browser session |
| Browser toolbar `Focus Browser` | `cmd.browser.focus_browser_tab` | browser chrome / command palette | browser-session controller | Focus the owning canonical browser session |
| Browser toolbar `Detach Browser` | `cmd.browser.detach_browser_tab` | browser chrome | browser-session controller | Convert the owning normal browsing session into detached presentation without inventing a new logical browser subject |
| Browser toolbar `Open DevTools` | `cmd.browser.open_devtools` | browser chrome / command palette | browser-session controller / DevTools host | Open DevTools for the focused browser session |
| Browser toolbar `Toggle DevTools Dock` | `cmd.browser.toggle_devtools_dock` | browser chrome / DevTools chrome | DevTools host | Switch the focused browser DevTools between docked layouts |
| Browser toolbar share button | `cmd.browser.share_with_agent` | browser chrome | browser context controller | Mark current browser subject shared with active thread |
| Browser toolbar revoke button | `cmd.browser.revoke_share_with_agent` | browser chrome / attention center | browser context controller | Clear shared-with-agent state |
| Browser toolbar `Pick Element for Chat` | `cmd.browser.pick_element_for_chat` | browser chrome | browser context controller | Capture explicit `browser_element_context` into composer-prep state |
| Browser toolbar `Add Selection to Chat` | `cmd.browser.add_selection_to_chat` | browser chrome | browser context controller | Capture explicit `browser_selection_context` into composer-prep state |
| Browser toolbar `Add Selection + Screenshot` | `cmd.browser.add_selection_screenshot_to_chat` | browser chrome | browser context controller / runtime-artifact controller | Capture browser context and screenshot evidence for chat |
| Browser toolbar `Add Selection + Full Screenshot` | `cmd.browser.add_selection_full_screenshot_to_chat` | browser chrome | browser context controller / runtime-artifact controller | Capture browser context and full screenshot evidence for chat |
| Browser toolbar `Add Screenshot to Chat` | `cmd.browser.add_screenshot_to_chat` | browser chrome | runtime-artifact controller / chat prep controller | Capture screenshot artifact and stage it for chat |
| Browser toolbar `Add Full Screenshot to Chat` | `cmd.browser.add_full_screenshot_to_chat` | browser chrome | runtime-artifact controller / chat prep controller | Capture full screenshot artifact and stage it for chat |
| Browser takeover prompt default action | `cmd.browser.take_over` | live browser takeover prompt | browser-session controller / runtime controller | Pause the live automation browser and keep the visible session in focus |
| Browser action `Pause Agent` | `cmd.browser.pause_agent` | browser chrome / automation banner | runtime controller | Pause the live automation run without reclassifying the browser session |
| Browser action `Let agent continue` | `cmd.browser.let_agent_continue` | live browser takeover prompt | runtime controller | Dismiss takeover without interrupting live automation |
| Browser action `Stop agent and keep browser` | `cmd.browser.stop_agent_keep_browser` | live browser takeover prompt | runtime controller / browser-session controller | Stop automation work while preserving the visible browser session |
| Browser action `Promote to Normal Browsing` | `cmd.browser.promote_to_normal_browsing` | browser chrome / automation banner | browser-session controller / storage controller | Promote eligible state into a normal browsing session and update restore behavior |
| Browser recovery banner `Reopen` | `cmd.browser.reopen` | browser recovery banner / attention center | browser-session controller | Recreate a recoverable browser session after failure |
| Browser recovery banner `Retry` | `cmd.browser.retry` | browser recovery banner / attention center | browser-session controller / runtime controller | Retry the failed browser launch or action path |
| Browser recovery banner `Keep Closed` | `cmd.browser.keep_closed` | browser recovery banner / attention center | browser-session controller | Keep the failed browser session closed while preserving auditability |
| Chat command card `Open in Terminal` | `cmd.terminal.open` | assistant chat command card | terminal workspace controller | Reveal the exact existing session, workgroup, leaf pane, or historical receipt bound to the referenced terminal runtime |
| Chat command card `Show Terminal` | `cmd.terminal.show` | assistant chat command card / derived runtime surfaces | terminal workspace controller | Focus the same live or historical terminal session already bound to the card context |
| Chat command card `Rerun in Terminal` | `cmd.terminal.rerun` | assistant chat command card | terminal workspace controller / process-host controller | Replay the command through the terminal launch context without collapsing it into show/focus |
| Terminal command card `Detach/Pop-Out` | `cmd.terminal.detach` | assistant chat command card / terminal surfaces | terminal workspace controller | Detach the referenced terminal session or pane while preserving terminal identity |
| Command palette `New Terminal` | `cmd.terminal.new_tab` | command palette / terminal header | terminal workspace controller / process-host controller | Create a new workgroup or new root terminal tab in the chosen section |
| Terminal workgroup pill | `cmd.terminal.activate_workgroup` | bottom workgroup strip | terminal workspace controller | Activate the target terminal workgroup and reveal its subtabs |
| Terminal subtab chip | `cmd.terminal.activate_subtab` | subtab row | terminal workspace controller | Focus the target leaf pane within the active workgroup |
| Terminal workgroup drag-reorder | `cmd.terminal.reorder_workgroup` | workgroup strip | terminal workspace controller | Reorder workgroups without changing leaf pane identity |
| Terminal subtab drag-reorder | `cmd.terminal.reorder_subtab` | subtab row | terminal workspace controller | Swap or reorder leaf panes inside the same workgroup tree |
| Terminal pane chrome `Split` | `cmd.terminal.split_pane` | terminal pane chrome | terminal workspace controller / process-host controller | Create a new leaf pane and bound terminal session with deterministic split direction |
| Terminal strip `Add Pane` | `cmd.terminal.add_leaf` | bottom strip action cluster | terminal workspace controller / process-host controller | Add a new leaf pane to the active workgroup |
| Terminal editor drop target | `cmd.terminal.embed_in_editor` | editor drop host | terminal workspace controller | Add the dropped pane reference to the editor terminal panel stack |
| Editor terminal panel close | `cmd.terminal.remove_from_editor` | editor terminal panel chrome | terminal workspace controller | Remove the pane reference from the editor stack without destroying the underlying terminal session |
| Editor terminal stack `Undock All` | `cmd.terminal.undock_all_from_editor` | editor terminal stack chrome | terminal workspace controller | Clear all editor panel references for the current stack |
| Output or Problems or Ports `Show Terminal` link | `cmd.terminal.focus_session` | derived runtime surfaces | terminal workspace controller | Focus the owning terminal session without spawning a duplicate shell |
| Terminal tab context `Move to Other Section` | `cmd.terminal.move_tab_to_section` | terminal tab context menu | terminal workspace controller | Move the tab between sections while preserving tab and session identity |
| Terminal tab inline rename | `cmd.terminal.rename_tab` | terminal tab chrome | terminal workspace controller | Update visible tab label without changing session identity |
| Terminal tab pin toggle | `cmd.terminal.pin_tab` | terminal tab chrome | terminal workspace controller | Toggle pin state and update bulk-close behavior |
| Terminal pane close affordance | `cmd.terminal.close_pane` | terminal pane chrome | terminal workspace controller | Close the pane and apply explicit termination policy if a live session is attached |
| Terminal tab close affordance | `cmd.terminal.close_tab` | terminal tab chrome | terminal workspace controller | Close the tab and its pane tree with explicit termination behavior when needed |
| Terminal toolbar `Clear` | `cmd.terminal.clear_scrollback` | terminal toolbar / command palette | terminal session controller | Clear retained scrollback without minting a new runtime identity |
| Terminal toolbar `Restart` | `cmd.terminal.restart_session` | terminal toolbar / recovery banner | terminal session controller / process-host controller | Replace the runtime with a new terminal session bound to the chosen pane or tab |
| Terminal toolbar `Terminate` | `cmd.terminal.terminate_session` | terminal toolbar | terminal session controller / process-host controller | Request graceful shutdown for the selected live session |
| Terminal recovery action `Kill` | `cmd.terminal.kill_session` | terminal toolbar / recovery banner | terminal session controller / process-host controller | Force termination for the selected live session |
| Terminal section header `Detach` | `cmd.terminal.detach_section` | terminal section header / command palette | shell layout controller | Present the chosen terminal section in a detached window without changing section identity |
| Detached terminal window `Reattach` | `cmd.terminal.reattach_section` | detached terminal window chrome | shell layout controller | Return the section to docked layout with preserved tab and pane state |
| Chat live-tool action | `cmd.dev.start_session` | chat action / toolbar | dev-session controller | Start dev session and route output to linked shell panes |
| Dev stop button | `cmd.dev.stop_session` | toolbar / ports / terminal | dev-session controller | Stop active dev session deterministically |
| Dev restart button | `cmd.dev.restart_session` | toolbar / ports / terminal | dev-session controller | Restart the dev session and refresh linked shell surfaces |
| Dev status row `Show Output` | `cmd.dev.show_output` | chat status row / toolbar | runtime-surfaces controller | Reveal Output linked to the owning dev session |
| Dev status row `Show Problems` | `cmd.dev.show_problems` | chat status row / toolbar | runtime-surfaces controller | Reveal Problems linked to the owning dev session |
| Dev status row `Show Ports` | `cmd.dev.show_ports` | chat status row / toolbar | runtime-surfaces controller | Reveal Ports linked to the owning dev session |
| Catalog install button | `cmd.catalog.install_item` | catalog UI | catalog lifecycle controller | Install target item and propagate subsystem effects |
| Catalog remove button | `cmd.catalog.remove_item` | catalog UI | catalog lifecycle controller | Remove item using subsystem-specific active-item rules |

Terminal wiring owner split: `Plans/Section15_MVP_Promoted_Features_Spec.md §3.14` owns terminal section/tab/pane/session identity, `/reveal` and focus behavior, interaction modes, shell-integration disclosure, lifecycle states, capability `/degradation`, and non-ship terminal-core rules; `storage-plan.md` owns `/runtime-queryable` persistence for `terminal_workspace_state`, `terminal_session_record`, `terminal_command_block`, `dev_session_record`, renderer state, shell-integration tier, capability degradations, restore outcome, and transcript-retention tier. `UI_Command_Catalog.md` and this Wiring Matrix expose the controller split between terminal workspace controller, terminal session controller, process-host controller, dev-session controller, and runtime-surfaces controller; restart or `/replacement` mints a new runtime identity only when the command says so.

Terminal workspace-structure commands must distinguish content-only actions from destructive workspace mutations: `replace-with-new-terminal` keeps the pane slot and attaches a new live-session `terminal_session_id`, `/close` removes pane/tab/section workspace structure only after user-visible `/escalation` and `/cleanup` rules, `/disconnected/review-only` and other non-live panes can be replaced without pretending the old session remains live, and clear or `/reset` affects terminal content without implying restart.

Terminal/editor wiring treats `Concepts/PMConcept.html` (`/PMConcept.html`) as GUI concept lineage only while preserving the command coverage implied by that concept. Wiring rows cover `/workgroup` activation, active-group `/subtab` focus, split-pane tree operations, editor-integrated multi-panel terminal stacks, pane/subtab/workgroup `/drop` payloads, `/center/right` strip regions, `/right` action clusters for split `/add/collapse`, visible gutters and `/resizers`, accent-led subtab focus, command-log removal, and the rule that split-parent opacity effects must not dim terminal grids during reorder or drag operations.

### Browser session, capture, and recovery wiring invariants

- `Plans/Wiring_Matrix.md` is the wiring SSOT for browser command producer/consumer rows; stale `Plans/newfeatures.md §15.18` and `/newfeatures.md` references are cross-reference cleanup lineage only, and the old `trust-tier`/`/trust-tier` matrix must not stand beside the current permission-layer `/capability-degradation` model.
- Browser runtime wiring assumes the CEF-class, tab-first, in-app `/browser` model: `workspace_preview` is the user-facing editor/browser session, `detached_preview` is the same subject in a detached-window when supported, `automation_session` is a visible `/watchable`, agent-driven, evidence-producing web-app/testing session, and `auth_session` is a separate visible `/device/browser` flow for site-specific auth with an isolated `/cookie` and storage boundary.
- `auth_session` is not general-purpose browsing state, is not auto-restored, must not auto-close or auto-complete on presumed success, and normal selection, `/copy/paste`, `/share`, and capture interactions remain available unless the normal permission-layer blocks them.
- Live `automation_session` direct user input routes through user-takeover wiring: prompt actions are `Take over and pause agent`, `Let agent continue`, and `Stop agent and keep browser`; default highlighted action is `Take over and pause agent`; user-takeover leaves no half-owned session, and `/stop/take-over` or `/stop/take` handling must pause, stop, or take over rather than silently auto-resume work.
- Browser capture is explicit, chip-based, share-to-chat, and non-auto-send: ordinary clicks do not inject `/context`; `/highlight/share-to-chat`, `/highlight/share`, `/highlighting`, `/highlight`, `/elements`, `/selection`, `/DOM`/DOM, URL, and source anchors create removable pending composer chips, allow multi-capture, and attach to an active `/thread` or open a new thread when needed.
- Browser capture commands include `Add Selection to Chat`, `Pick Element for Chat`, `Add Selection + Screenshot`, `Add Element + Screenshot`, standalone screenshots, and screenshot-with-selection variants; screenshot-with-selection defaults to clipped context while full viewport remains explicit; `/trace/video`, `/video/screenshot`, and `/download` artifacts route through Runtime Artifacts.
- DevTools is a concrete browser UX/tool contract: `Open DevTools` and `Toggle DevTools Dock` are user-visible wiring rows; `/tool` and advanced testing permissions allow when user explicitly opens DevTools or policy permits attach/open, and named actions remain first-class `/capability` paths instead of forcing arbitrary browser-code.
- Recovery wiring preserves URL, tabs, session class, `/originating` session identity, and completed trace/video/screenshot artifacts; `workspace_preview` can restore, eligible `detached_preview` follows its originating restored session, automation/auth never auto-resume active work, auth never auto-complete, attention-required recovery offers `Reopen`, `Retry`, or `Keep Closed`, and cross-platform CEF runtime `/install/update` failures surface `runtime_unavailable`/`/capability-degradation` rather than hidden fallback.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md

This section is normative and not an example/template section.
### Debug investigation minimum rows

The following rows are additionally required for Debug Mode and Investigation Context wiring.

| UI element / surface | UICommand ID | Producer | Consumer / handler | Required effect |
|---|---|---|---|---|
| Assistant mode strip `Debug` | `cmd.chat.mode` | chat header mode strip | session mode controller | switch the thread into Debug overlay and focus the active investigation or target picker |
| Slash command `/mode debug` | `cmd.chat.mode` | slash-command dispatcher | session mode controller | same canonical mode-switch behavior as the visible mode strip |
| Debug target picker button | `cmd.chat.open_debug_target_picker` | thread header / command palette | debug investigation controller | reveal canonical target discovery / rebinding flow |
| Investigation header `Export Bundle` | `cmd.chat.export_investigation_bundle` | Investigation Context card / Context Detail Pane | debug investigation controller / runtime-artifact controller | write bundle manifest and emit export event |
| Investigation item `Revoke` | `cmd.chat.revoke_investigation_item` | Investigation Context card / Context Detail Pane | debug investigation controller | mark the item revoked and exclude it from future prompt injection |
| Debug Automation banner `Approve` | `cmd.runtime.approve` | investigation banner / attention surface | runtime controller / permission controller | activate the requested run-scoped Debug Automation Profile |
| Debug Automation banner `Resume automation` | `cmd.runtime.resume_after_prerequisite` | investigation banner / attention surface | runtime controller / debug investigation controller | resume the current investigation automation from its paused step pointer after the prerequisite or handoff completes |
| Debug Automation banner `Retry this step` | `cmd.runtime.retry_now` | investigation banner / attention surface | runtime controller / debug investigation controller | retry the current paused investigation step or repro step without changing target, browser session, or investigation lineage |
| Debug Automation banner `Stop agent and keep browser` | `cmd.browser.stop_agent_keep_browser` | investigation banner / automation banner | runtime controller / browser-session controller | stop the agent automation while preserving the visible browser session for the current investigation |
| Debug Automation banner `Promote to normal browsing` | `cmd.browser.promote_to_normal_browsing` | investigation banner / automation banner | browser-session controller / storage controller / permission controller | promote eligible session state into normal browsing only after `explicit-confirmation`; do not silently promote the automation/auth session |
| Debug Automation banner `Cancel investigation` | `cmd.runtime.abort_run` | investigation banner / attention surface | runtime controller / debug investigation controller | cancel the current investigation run and record the investigation as `cancelled` with `stop_reason_code = investigation.cancelled_by_user` |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md
