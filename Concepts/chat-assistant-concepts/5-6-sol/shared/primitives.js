import { ACCESS_OPTIONS, BSD_OPTIONS, SEARCH_SCOPES, escapeHtml, formatDuration, formatLocalTime, humanize } from "./definitions.js";
import { icon } from "./icons.js";
import { activeQuestion, activeQuestionnaire, highlightedExcerpt, routeModel, searchResults, selectedArtifact, stateTone, threadMessages, threadShells } from "./selectors.js";

export function button({ label, action, value = "", iconName = "", className = "", pressed = null, disabled = false, reason = "", focusKey = "" }) {
  const attrs = [
    `type="button"`,
    `class="button ${className}"`,
    `data-action="${escapeHtml(action)}"`,
    value !== "" ? `data-value="${escapeHtml(value)}"` : "",
    pressed == null ? "" : `aria-pressed="${pressed ? "true" : "false"}"`,
    disabled ? "disabled" : "",
    disabled && reason ? `title="${escapeHtml(reason)}"` : "",
    focusKey ? `data-focus-key="${escapeHtml(focusKey)}"` : ""
  ].filter(Boolean).join(" ");
  return `<button ${attrs}>${iconName ? icon(iconName) : ""}<span>${escapeHtml(label)}</span></button>`;
}

export function iconOnlyButton({ label, action, value = "", iconName, pressed = null, disabled = false, focusKey = "" }) {
  const attrs = [
    `type="button"`,
    `class="icon-button"`,
    `aria-label="${escapeHtml(label)}"`,
    `title="${escapeHtml(label)}"`,
    `data-action="${escapeHtml(action)}"`,
    value !== "" ? `data-value="${escapeHtml(value)}"` : "",
    pressed == null ? "" : `aria-pressed="${pressed ? "true" : "false"}"`,
    disabled ? "disabled" : "",
    focusKey ? `data-focus-key="${escapeHtml(focusKey)}"` : ""
  ].filter(Boolean).join(" ");
  return `<button ${attrs}>${icon(iconName)}</button>`;
}

export function stateWord(state, extra = "") {
  return `<span class="state-word tone-${stateTone(state)} ${extra}"><span class="state-shape" aria-hidden="true"></span>${escapeHtml(humanize(state))}</span>`;
}

export function renderMessageBody(message, ui, options = {}) {
  const full = String(message.body ?? "");
  const expanded = Boolean(ui.threadViews[ui.activeThreadId]?.longExpanded?.[message.id]);
  const long = full.length > (options.longThreshold ?? 430) || message.collapsedByDefault;
  const visible = long && !expanded ? `${full.slice(0, options.previewLength ?? 360).trimEnd()}…` : full;
  return `<div class="message-copy ${long && !expanded ? "is-collapsed" : ""}" data-canonical-length="${full.length}">
    <p>${escapeHtml(visible)}</p>
    ${long ? button({ label: expanded ? "Show less" : `Show all ${full.length.toLocaleString()} characters`, action: "toggle-long-message", value: message.id, className: "text-button long-toggle", focusKey: `message-${message.id}` }) : ""}
  </div>`;
}

export function renderMessageActions(message, ui) {
  const runtime = message.runtime ?? {};
  const worked = formatDuration(runtime.workedSeconds ?? 0);
  const eligibleEdit = message.role === "user" && message.eligibleForEdit;
  return `<div class="message-actions" aria-label="${escapeHtml(humanize(message.role))} message actions">
    ${button({ label: "Copy", action: "copy-message", value: message.id, iconName: "copy", className: "text-button" })}
    ${message.role === "user" ? button({ label: "Edit", action: "edit-message", value: message.id, iconName: "edit", className: "text-button", disabled: !eligibleEdit, reason: "Only the latest eligible user message can be edited" }) : ""}
    ${button({ label: ui.context.selectedMessages.includes(message.id) ? "Context selected" : "Context", action: "context-toggle-message", value: message.id, iconName: "context", pressed: ui.context.selectedMessages.includes(message.id), className: "text-button" })}
    <span class="meta-fragment">${escapeHtml(runtime.provider ?? "Provider unavailable")}</span>
    <span class="meta-fragment">${escapeHtml(runtime.model ?? "Model unavailable")}</span>
    <span class="meta-fragment">${message.deliveryState === "redirecting active turn" ? "Working for" : "Worked for"} ${worked}</span>
    ${button({ label: "More Info", action: "message-more-info", value: message.id, className: "text-button" })}
  </div>`;
}

export function renderMessageMetaPanel(message) {
  const runtime = message.runtime ?? {};
  return `<section class="message-more-info" aria-label="Message details">
    <dl>
      <div><dt>Sent</dt><dd>${escapeHtml(formatLocalTime(message.sentAt))}</dd></div>
      <div><dt>Worked</dt><dd>${escapeHtml(formatDuration(runtime.workedSeconds))}</dd></div>
      <div><dt>Total elapsed</dt><dd>${escapeHtml(formatDuration(runtime.totalElapsedSeconds))}</dd></div>
      <div><dt>Mode</dt><dd>${escapeHtml(runtime.mode ?? "Unavailable")}</dd></div>
      <div><dt>Provider</dt><dd>${escapeHtml(runtime.provider ?? "Unavailable")}</dd></div>
      <div><dt>Model</dt><dd>${escapeHtml(runtime.model ?? "Unavailable")}</dd></div>
      <div><dt>Effort</dt><dd>${escapeHtml(runtime.effort ?? "Unavailable")}</dd></div>
      <div><dt>Persona</dt><dd>${escapeHtml(runtime.persona ?? "None")}</dd></div>
      <div><dt>Tokens</dt><dd>${runtime.tokenCount == null ? "Unknown" : Number(runtime.tokenCount).toLocaleString()}</dd></div>
      <div><dt>Context</dt><dd>${runtime.contextUsed == null ? "Unknown" : `${Number(runtime.contextUsed).toLocaleString()} of ${Number(runtime.contextLimit ?? 0).toLocaleString()}`}</dd></div>
    </dl>
  </section>`;
}

export function renderComposer(ui) {
  const view = ui.threadViews[ui.activeThreadId];
  const questionOpen = ["preparing", "open", "submitting"].includes(ui.question.phase);
  if (questionOpen) {
    return `<div class="composer-held" data-focus-key="composer-held">
      ${icon("question")}
      <div><strong>Composer held for questions</strong><span>Your ordinary draft is saved and will return after this questionnaire.</span></div>
    </div>`;
  }
  const hasDraft = Boolean(view.draft.trim());
  const actionLabel = ui.agentActive && !hasDraft ? "Stop" : "Send";
  return `<form class="composer" data-action-form="composer" aria-label="Message composer">
    <label class="composer-label" for="composer-input">Message</label>
    <textarea id="composer-input" data-role="composer-input" data-focus-key="composer" rows="3" spellcheck="true" placeholder="Continue this thread">${escapeHtml(view.draft)}</textarea>
    <div class="composer-foot">
      <div class="composer-tools">
        ${iconOnlyButton({ label: "Attach a file", action: "attachment-menu", iconName: "attach" })}
        ${button({ label: `${view.draftHistory.length} revisions`, action: "open-popup", value: "draft-history", className: "text-button" })}
        <span class="spellcheck-note" title="Passive local spellcheck skips code, paths, URLs, hashes, and known identifiers">Local spellcheck</span>
      </div>
      <div class="composer-status">
        ${ui.network.transport !== "Live" ? stateWord(ui.network.transport) : ""}
        ${button({ label: actionLabel, action: "composer-primary", iconName: actionLabel === "Stop" ? "stop" : "send", className: `composer-primary ${actionLabel === "Stop" ? "is-stop" : ""}`, focusKey: "composer-primary" })}
      </div>
    </div>
  </form>`;
}

export function renderChatHeader(data, ui, conceptTitle) {
  return `<header class="chat-header">
    <div class="chat-identity">
      <span class="chat-kicker">${escapeHtml(conceptTitle)}</span>
      <strong>${escapeHtml((data.threadMap[ui.activeThreadId] ?? {}).title ?? "Assistant Chat")}</strong>
      <span class="thread-location">${escapeHtml((data.threadMap[ui.activeThreadId] ?? {}).project ?? "Project")}</span>
    </div>
    <div class="chat-header-actions">
      ${button({ label: "Search", action: "open-popup", value: "search", iconName: "search", className: "header-button", pressed: ui.popup === "search", focusKey: "search-trigger" })}
      ${button({ label: `${ui.context.ringPercent}%`, action: "open-popup", value: "context", iconName: "context", className: "header-button context-button", pressed: ui.popup === "context", focusKey: "context-trigger" })}
      ${button({ label: ui.route.model, action: "open-popup", value: "route", iconName: "route", className: "header-button route-button", pressed: ui.popup === "route", focusKey: "route-trigger" })}
      ${button({ label: ui.access.requested, action: "open-popup", value: "access", iconName: "shield", className: "header-button", pressed: ui.popup === "access", focusKey: "access-trigger" })}
      ${button({ label: `BSD ${ui.bsd.mode}`, action: "open-popup", value: "bsd", iconName: "bsd", className: `header-button bsd-${ui.bsd.state}`, pressed: ui.popup === "bsd", focusKey: "bsd-trigger" })}
      ${iconOnlyButton({ label: "More thread actions", action: "open-popup", value: "thread-more", iconName: "more", pressed: ui.popup === "thread-more", focusKey: "thread-more-trigger" })}
    </div>
  </header>`;
}

export function renderSearchPopup(data, ui) {
  const results = searchResults(data, ui);
  return `<section class="popup-card search-popup" role="dialog" aria-label="Search conversations">
    <header class="popup-header"><div><span class="popup-kicker">One search bar</span><strong>Search conversations</strong></div>${iconOnlyButton({ label: "Close search", action: "close-popup", iconName: "close", focusKey: "search-close" })}</header>
    <div class="scope-switch" role="radiogroup" aria-label="Search scope">
      ${SEARCH_SCOPES.map((scope) => button({ label: scope, action: "search-scope", value: scope, pressed: ui.search.scope === scope, className: "scope-option" })).join("")}
    </div>
    <label class="field-label" for="thread-search-input">Search stored history</label>
    <input id="thread-search-input" class="search-input" data-role="search-input" data-focus-key="search-input" value="${escapeHtml(ui.search.query)}" placeholder="Search complete stored messages">
    <div class="search-results" data-scroll-key="search-results">
      ${ui.search.query.trim() ? results.map((result) => `<button type="button" class="search-result" data-action="search-result" data-thread-id="${escapeHtml(result.threadId)}" data-message-id="${escapeHtml(result.messageId)}">
        <span>${escapeHtml(result.threadTitle)}</span><strong>${escapeHtml(humanize(result.role))}</strong><p>${highlightedExcerpt(result, ui.search.query)}</p>
      </button>`).join("") || '<div class="empty-state"><strong>No stored match</strong><span>Try another phrase or change the scope.</span></div>' : '<div class="empty-state"><strong>Search canonical history</strong><span>Unloaded messages remain indexed. Lens shaping does not change human search.</span></div>'}
    </div>
  </section>`;
}

export function renderRoutePopup(data, ui) {
  const selected = routeModel(data, ui);
  const providers = data.extension.route_catalog;
  const activeProvider = providers.find((provider) => provider.provider === ui.routeBrowse.provider) ?? providers[0];
  const activeAccount = activeProvider.accounts.find((account) => account.id === ui.routeBrowse.accountId) ?? activeProvider.accounts[0];
  return `<section class="popup-card route-popup" role="dialog" aria-label="Provider account and model route">
    <header class="popup-header"><div><span class="popup-kicker">Requested route</span><strong>${escapeHtml(ui.route.requested)}</strong></div>${iconOnlyButton({ label: "Close route picker", action: "close-popup", iconName: "close", focusKey: "route-close" })}</header>
    <div class="route-search-row"><input class="search-input" data-focus-key="route-search" aria-label="Search models" placeholder="Search provider, account, or model"><button type="button" class="favorite-button ${ui.route.favorite ? "is-favorite" : ""}" data-action="route-favorite">Favorite</button></div>
    <div class="route-stack" data-pane="${escapeHtml(ui.popupPane)}">
      <nav class="provider-rail" aria-label="Providers">${providers.map((provider) => `<button type="button" class="provider-choice ${provider.provider === activeProvider.provider ? "is-selected" : ""}" data-action="route-provider" data-value="${escapeHtml(provider.provider)}" title="${escapeHtml(provider.provider)}"><span>${escapeHtml(provider.provider.slice(0, 2).toUpperCase())}</span></button>`).join("")}</nav>
      <div class="route-pane account-pane"><span class="pane-title">Accounts and connections</span>${activeProvider.accounts.map((account) => `<button type="button" class="route-row ${account.id === activeAccount.id ? "is-selected" : ""}" data-action="route-account" data-provider="${escapeHtml(activeProvider.provider)}" data-account-id="${escapeHtml(account.id)}"><strong>${escapeHtml(account.label)}</strong><span>${escapeHtml(account.connection)}</span></button>`).join("")}</div>
      <div class="route-pane model-pane"><span class="pane-title">Models</span>${activeAccount.models.map((model) => `<button type="button" class="route-row ${model.id === ui.route.modelId ? "is-selected" : ""}" data-action="route-model" data-provider="${escapeHtml(activeProvider.provider)}" data-account-id="${escapeHtml(activeAccount.id)}" data-model-id="${escapeHtml(model.id)}" ${model.available ? "" : `aria-disabled="true"`}><strong>${escapeHtml(model.label)}</strong><span>${escapeHtml(model.available ? `${model.efforts.length} effort choices` : model.reason)}</span></button>`).join("")}</div>
    </div>
    <div class="route-tuning">
      <div><span class="pane-title">Effort</span><div class="segmented">${(selected?.model.efforts ?? [ui.route.effort]).map((effort) => button({ label: effort, action: "route-effort", value: effort, pressed: ui.route.effort === effort, className: "segment" })).join("")}</div></div>
      <div><span class="pane-title">Speed</span><div class="segmented">${(selected?.model.speeds ?? [ui.route.speed]).map((speed) => button({ label: speed, action: "route-speed", value: speed, pressed: ui.route.speed === speed, className: "segment" })).join("")}</div></div>
    </div>
    ${ui.route.warning ? `<div class="inline-warning">${icon("warning")}<span>${escapeHtml(ui.route.warning)}</span>${button({ label: "Open Provider Settings", action: "truthful-disabled", className: "text-button", disabled: true, reason: "Prototype records the deep link but does not own Provider Settings" })}</div>` : ""}
  </section>`;
}

export function renderContextPopup(ui) {
  return `<section class="popup-card context-popup" role="dialog" aria-label="Context Ring and Lens">
    <header class="popup-header"><div><span class="popup-kicker">Context Ring · ${ui.context.selectedMessages.length} message${ui.context.selectedMessages.length === 1 ? "" : "s"} selected</span><strong>${ui.context.ringPercent}% admitted</strong></div>${iconOnlyButton({ label: "Close context", action: "close-popup", iconName: "close", focusKey: "context-close" })}</header>
    <div class="context-meter" style="--context-percent:${ui.context.ringPercent}%"><span></span></div>
    <div class="context-columns"><div><span class="pane-title">Included</span>${ui.context.includedSources.map((source) => `<p>${icon("check")}<span>${escapeHtml(source)}</span></p>`).join("")}</div><div><span class="pane-title">Omitted</span>${ui.context.omittedSources.map((source) => `<p>${icon("close")}<span>${escapeHtml(source)}</span></p>`).join("")}</div></div>
    <div class="context-actions">${["Mute","Focus","Subcompact","Off"].map((mode) => button({ label: mode === "Off" ? "Turn Off" : mode, action: "context-mode", value: mode, pressed: ui.context.mode === mode, className: "segment" })).join("")}</div>
    <div class="context-receipts"><p><strong>Memory</strong><span>${escapeHtml(ui.context.memory)}</span></p><p><strong>Cache</strong><span>${escapeHtml(ui.context.cache)}</span></p>${ui.context.compactReceipt ? `<p><strong>Receipt</strong><span>${escapeHtml(ui.context.compactReceipt)}</span></p>` : ""}</div>
    <footer class="popup-footer">${button({ label: "Subcompact selection", action: "context-apply-subcompact", className: "secondary-button", disabled: ui.context.selectedMessages.length === 0, reason: "Select at least one message from the transcript" })}${button({ label: "Compact Now", action: "context-compact-now", className: "secondary-button" })}${button({ label: "More Details", action: "context-more-details", className: "text-button" })}</footer>
  </section>`;
}

export function renderAccessPopup(ui) {
  return `<section class="popup-card compact-popup" role="dialog" aria-label="Access profile">
    <header class="popup-header"><div><span class="popup-kicker">Access is separate from mode</span><strong>${escapeHtml(ui.access.requested)}</strong></div>${iconOnlyButton({ label: "Close access picker", action: "close-popup", iconName: "close", focusKey: "access-close" })}</header>
    <div class="option-list">${ACCESS_OPTIONS.map((option) => button({ label: option, action: "set-access", value: option, pressed: ui.access.requested === option, className: "option-row" })).join("")}</div>
    ${ui.access.limitation ? `<div class="effective-state"><span>Effective</span><strong>${escapeHtml(ui.access.effective)}</strong><p>${escapeHtml(ui.access.limitation)}</p></div>` : ""}
  </section>`;
}

export function renderBsdPopup(ui) {
  return `<section class="popup-card compact-popup" role="dialog" aria-label="Back Seat Driver">
    <header class="popup-header"><div><span class="popup-kicker">Read-only review</span><strong>BSD ${escapeHtml(ui.bsd.mode)}</strong></div>${iconOnlyButton({ label: "Close BSD picker", action: "close-popup", iconName: "close", focusKey: "bsd-close" })}</header>
    <div class="option-list">${BSD_OPTIONS.map((option) => button({ label: option, action: "set-bsd", value: option, pressed: ui.bsd.mode === option, className: "option-row" })).join("")}</div>
    <div class="bsd-state ${ui.bsd.state === "evaluating" ? "is-evaluating" : ""}">${stateWord(ui.bsd.state)}<p>${escapeHtml(ui.bsd.message)}</p><span>${escapeHtml(ui.bsd.scope)}</span></div>
  </section>`;
}

export function renderDraftHistoryPopup(ui) {
  const view = ui.threadViews[ui.activeThreadId];
  return `<section class="popup-card compact-popup" role="dialog" aria-label="Draft revision history">
    <header class="popup-header"><div><span class="popup-kicker">Thread-local draft</span><strong>Revision history</strong></div>${iconOnlyButton({ label: "Close draft history", action: "close-popup", iconName: "close", focusKey: "draft-close" })}</header>
    <div class="draft-list">${view.draftHistory.slice().reverse().map((revision) => `<button type="button" class="draft-revision" data-action="restore-draft" data-value="${escapeHtml(revision.id)}"><span>${escapeHtml(formatLocalTime(revision.savedAt))}</span><p>${escapeHtml(revision.text.slice(0, 120))}</p></button>`).join("") || '<div class="empty-state"><strong>No earlier revision</strong><span>Substantive local edits are stored here.</span></div>'}</div>
    <footer class="popup-footer">${button({ label: "Save current revision", action: "save-draft-revision", className: "secondary-button" })}${button({ label: "Clear current draft", action: "clear-draft", className: "text-button" })}</footer>
  </section>`;
}

export function renderThreadMorePopup(ui) {
  return `<section class="popup-card compact-popup" role="dialog" aria-label="Thread actions">
    <header class="popup-header"><div><span class="popup-kicker">Current conversation</span><strong>Thread actions</strong></div>${iconOnlyButton({ label: "Close thread actions", action: "close-popup", iconName: "close", focusKey: "thread-more-close" })}</header>
    <div class="option-list">
      ${button({ label: "Branch from here", action: "branch-action", value: "branch", iconName: "branch", className: "option-row" })}
      ${button({ label: "Create restore point", action: "branch-action", value: "restore", iconName: "restore", className: "option-row" })}
      ${button({ label: "Rewind conversation", action: "branch-action", value: "rewind", iconName: "history", className: "option-row" })}
      ${button({ label: "Request another thread", action: "communication-action", value: "request", iconName: "chat", className: "option-row" })}
      ${button({ label: "Spawn sibling thread", action: "communication-action", value: "spawn", iconName: "branch", className: "option-row" })}
      ${button({ label: "Export conversation", action: "truthful-disabled", iconName: "artifact", className: "option-row", disabled: true, reason: "Export is represented but not written by this prototype" })}
    </div>
  </section>`;
}

export function renderPopupLayer(data, ui) {
  if (!ui.popup) return "";
  let content = "";
  if (ui.popup === "search") content = renderSearchPopup(data, ui);
  if (ui.popup === "route") content = renderRoutePopup(data, ui);
  if (ui.popup === "context") content = renderContextPopup(ui);
  if (ui.popup === "access") content = renderAccessPopup(ui);
  if (ui.popup === "bsd") content = renderBsdPopup(ui);
  if (ui.popup === "draft-history") content = renderDraftHistoryPopup(ui);
  if (ui.popup === "thread-more") content = renderThreadMorePopup(ui);
  return `<div class="popup-layer" data-action="popup-backdrop"><div class="popup-anchor">${content}</div></div>`;
}

export function renderHistoryRows(data, ui, variant = "list") {
  const query = ui.historyFilter.trim().toLocaleLowerCase();
  const shells = threadShells(data, ui).filter((thread) => !query || thread.title.toLocaleLowerCase().includes(query) || thread.project.toLocaleLowerCase().includes(query));
  return `<div class="history-rows history-${variant}" data-scroll-key="history">${shells.map((thread, index) => `<button type="button" class="history-row ${thread.active ? "is-active" : ""} ${thread.pinned ? "is-pinned" : ""}" data-action="select-thread" data-value="${escapeHtml(thread.id)}" style="--row-index:${index}">
    <span class="history-title">${escapeHtml(thread.title)}</span>
    <span class="history-state">${escapeHtml(humanize(thread.state))}</span>
    <span class="history-meta">${thread.messageCount} messages${thread.hasDraft ? " · draft" : ""}${thread.archived ? " · archived" : ""}</span>
  </button>`).join("")}</div>`;
}

export function renderArtifactContent(data, ui, variant = "plate") {
  const artifact = selectedArtifact(data, ui);
  if (ui.artifact.state === "closed") return "";
  if (ui.artifact.state === "loading") return `<div class="artifact-loading"><span class="progress-line"></span><strong>Loading ${escapeHtml(artifact.title)}</strong><p>The transcript, draft, and selected source remain available.</p></div>`;
  if (ui.artifact.state === "error") return `<div class="artifact-error">${icon("error")}<strong>Artifact did not load</strong><p>${escapeHtml(ui.artifact.message)}</p>${button({ label: "Retry artifact", action: "artifact-retry", iconName: "sync", className: "secondary-button" })}</div>`;
  const preview = artifact.kind === "code file"
    ? `<pre class="artifact-code"><code>struct ThreadProjection {
    thread_id: ThreadId,
    requested_route: RouteRef,
    effective_route: RouteRef,
    outbox_cursor: Option&lt;Cursor&gt;,
}</code></pre>`
    : artifact.kind === "multi-file diff"
      ? `<div class="artifact-diff"><p><span>state.rs</span><strong>+54 −12</strong></p><p><span>projection.rs</span><strong>+39 −9</strong></p><p><span>replay_tests.rs</span><strong>+35 −10</strong></p></div>`
      : artifact.kind === "test screenshot"
        ? `<div class="artifact-visual"><div class="visual-mini-shell"><span></span><strong>520 px</strong><i></i></div><p>Pinned compact history and left artifact coexist with a readable Chat floor.</p></div>`
        : `<article class="artifact-report"><h3>Observed result</h3><p>${escapeHtml(artifact.summary)}</p><h3>Owner boundary</h3><p>Project-backed artifact identity and versioning remain owned by Artifact Service.</p></article>`;
  return `<div class="artifact-content artifact-${variant}">
    <header><div><span>${escapeHtml(humanize(artifact.kind))}</span><strong>${escapeHtml(artifact.title)}</strong></div>${stateWord(ui.artifact.state)}${iconOnlyButton({ label: "Close artifact", action: "artifact-close", iconName: "close" })}</header>
    <div class="artifact-version"><span>${escapeHtml(artifact.version)}</span><span>${escapeHtml(artifact.owner)}</span></div>
    ${preview}
    <footer>${button({ label: "Open in editor", action: "truthful-disabled", className: "secondary-button", disabled: true, reason: "Prototype demonstrates the owner handoff but does not launch the editor" })}${button({ label: "Reveal file", action: "truthful-disabled", className: "text-button", disabled: true, reason: "No real project file is associated with this fixture" })}</footer>
  </div>`;
}

export function renderSystemNotices(ui) {
  return `<div class="system-notices">
    ${ui.approval ? `<section class="decision-card approval-card ${ui.approval.state !== "pending" ? "is-resolved" : ""}">${icon("shield")}<div><span>Compact decision</span><strong>${escapeHtml(ui.approval.title)}</strong><p>${escapeHtml(ui.approval.summary)}</p>${ui.approval.evidenceOpen ? '<div class="decision-evidence">Owner: FileSafe · scope: one write · route unchanged · reversible through retained patch</div>' : ""}<footer>${button({ label: "Approve once", action: "approval-decision", value: "approved once", className: "primary-button" })}${button({ label: "Decline", action: "approval-decision", value: "declined", className: "secondary-button" })}${button({ label: "Details", action: "approval-details", className: "text-button" })}</footer></div></section>` : ""}
    ${ui.routeWarning ? `<section class="decision-card route-warning-card ${ui.routeWarning.state !== "pending" ? "is-resolved" : ""}">${icon("warning")}<div><span>Material route warning</span><strong>${escapeHtml(ui.routeWarning.title)}</strong><p>${escapeHtml(ui.routeWarning.detail)}</p><footer>${button({ label: "Continue here", action: "route-warning-decision", value: "continue", className: "primary-button" })}${button({ label: "Branch with new model", action: "route-warning-decision", value: "branch", className: "secondary-button" })}${button({ label: "Cancel route change", action: "route-warning-decision", value: "cancel", className: "text-button" })}</footer></div></section>` : ""}
    ${ui.attachmentResolution.state !== "none" ? `<section class="inline-system-card attachment-card">${icon("attach")}<div><span>Attachment route</span><strong>${escapeHtml(ui.attachmentResolution.label)}</strong><p>${escapeHtml(ui.attachmentResolution.detail)}</p></div></section>` : ""}
    ${ui.network.transport !== "Live" || ui.network.domain !== "Live" ? `<section class="inline-system-card network-card">${icon(ui.network.transport === "Offline" ? "offline" : "sync")}<div><span>${escapeHtml(ui.network.transport)} · ${escapeHtml(ui.network.domain)}</span><strong>${escapeHtml(ui.network.serverWork)}</strong><p>Transport health and domain synchronization are reported separately.</p><footer>${ui.network.transport === "Offline" ? button({ label: "Reconnect", action: "network-action", value: "reconnect", className: "secondary-button" }) : button({ label: "Replay queued commands", action: "network-action", value: "replay", className: "secondary-button" })}${button({ label: "Snapshot catch-up", action: "network-action", value: "snapshot", className: "text-button" })}</footer></div></section>` : ""}
  </div>`;
}

export function renderDemoController(data, ui) {
  if (!ui.demoControllerOpen) return "";
  const triggers = data.scenario.deterministic_triggers;
  return `<aside class="demo-controller" aria-label="Deterministic demo controller">
    <header><div><span>Prototype-only controller</span><strong>Deterministic states</strong></div>${iconOnlyButton({ label: "Close demo controller", action: "toggle-controller", iconName: "close", focusKey: "controller-close" })}</header>
    <p>This surface is outside proposed production Chat. Each trigger has a stable receipt and reset path.</p>
    <div class="trigger-grid" data-scroll-key="controller">${triggers.map((trigger) => `<button type="button" data-action="run-trigger" data-value="${escapeHtml(trigger)}">${escapeHtml(trigger.replaceAll("_", " "))}</button>`).join("")}</div>
    <section class="controller-receipts"><strong>Latest receipts</strong>${ui.triggerReceipts.slice(0, 6).map((receipt) => `<p><span>${escapeHtml(formatLocalTime(receipt.at))}</span>${escapeHtml(receipt.result)}</p>`).join("")}</section>
  </aside>`;
}

export function renderArtifactSwitcher(data, ui) {
  return `<div class="artifact-switcher" role="tablist" aria-label="Artifacts">${data.extension.artifacts.slice(0, 4).map((artifact) => `<button type="button" role="tab" aria-selected="${artifact.id === ui.artifact.selectedId ? "true" : "false"}" data-action="artifact-select" data-value="${escapeHtml(artifact.id)}">${escapeHtml(artifact.title)}</button>`).join("")}</div>`;
}

export function renderHistoryHeader(ui, title, subtitle = "Lightweight thread shells") {
  return `<header class="history-header"><div><span>${escapeHtml(subtitle)}</span><strong>${escapeHtml(title)}</strong></div><div>${ui.historyMode === "peek" ? button({ label: "Pin", action: "history-set", value: "pinned full", iconName: "pin", className: "text-button" }) : ""}${iconOnlyButton({ label: "Close history", action: "history-set", value: "closed", iconName: "close" })}</div></header>`;
}

export function renderHistoryFilter(ui) {
  return `<label class="history-filter"><span>Filter history</span><input data-role="history-filter" value="${escapeHtml(ui.historyFilter)}" placeholder="Filter thread titles"></label>`;
}

export function renderQuestionData(ui) {
  const questionnaire = activeQuestionnaire(ui);
  const question = activeQuestion(ui);
  return { questionnaire, question, answer: question ? ui.question.answers[question.id] : null, skipped: question ? Boolean(ui.question.skips[question.id]) : false };
}
