import { escapeHtml, formatDuration, formatLocalTime, humanize } from "../shared/definitions.js";
import { icon } from "../shared/icons.js";
import { activeThread, stateTone, visibleMessages, workModel } from "../shared/selectors.js";
import { button, iconOnlyButton, renderChatHeader, renderComposer, renderMessageActions, renderMessageBody, renderMessageMetaPanel, renderQuestionData, renderSystemNotices, stateWord } from "../shared/primitives.js";

function messageDetails(message, ui) {
  return ui.threadViews[ui.activeThreadId]?.workExpanded?.[`meta-${message.id}`] ? renderMessageMetaPanel(message) : "";
}

function messageActivity(message, ui) {
  const group = message.activityGroup;
  if (!group) return "";
  const key = `message-activity-${group.id}`;
  const expanded = Boolean(ui.threadViews[ui.activeThreadId]?.workExpanded?.[key]);
  return `<section class="message-activity ${expanded ? "is-expanded" : ""}" aria-label="Completed message activity">
    <button type="button" class="activity-summary-toggle" data-action="toggle-work-group" data-value="${escapeHtml(key)}" aria-expanded="${expanded ? "true" : "false"}">
      <span>${stateWord(group.status)}</span><strong>${escapeHtml(group.compactLabel)}</strong><small>${escapeHtml(formatDuration(group.workedSeconds))}</small><em>${expanded ? "Hide activity history" : "Open activity history"}</em>
    </button>
    ${expanded ? `<div class="message-activity-stages">${group.stages.map((stage, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(stage.label)}</strong><p>${escapeHtml(stage.summary ?? `${stage.count ?? 0} recorded items`)}</p>${Array.isArray(stage.items) ? `<ul>${stage.items.slice(0, 6).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</div><time>${escapeHtml(formatDuration(stage.durationSeconds))}</time>${stateWord(stage.status)}</article>`).join("")}</div>` : ""}
  </section>`;
}

function thoughtDisclosure(message, ui) {
  if (!message.thoughtSegments?.length) return "";
  return `<section class="thought-disclosure" aria-label="Provider-exposed thought summaries">
    <header><div><span>Provider-exposed summaries</span><strong>Thought disclosure</strong></div>${button({ label: ui.thoughts.keepActiveOpen ? "Keep active open" : "Active collapsed", action: "thought-setting", pressed: ui.thoughts.keepActiveOpen, className: "text-button" })}</header>
    ${message.thoughtSegments.map((segment) => {
      const key = `thought-${segment.id}`;
      const manuallyExpanded = Boolean(ui.threadViews[ui.activeThreadId]?.workExpanded?.[key]);
      const expanded = manuallyExpanded || (segment.status === "active" && ui.thoughts.keepActiveOpen);
      return `<article class="thought-segment ${expanded ? "is-expanded" : ""}"><button type="button" data-action="toggle-work-group" data-value="${escapeHtml(key)}" aria-expanded="${expanded ? "true" : "false"}"><span>${stateWord(segment.status)}</span><strong>${escapeHtml(segment.label)}</strong><em>${expanded ? "Collapse summary" : "Open summary"}</em></button>${expanded ? `<p>${escapeHtml(segment.summary)}</p>` : ""}</article>`;
    }).join("")}
    <p class="thought-boundary">Only provider-exposed summaries are shown. Hidden reasoning is neither requested nor claimed.</p>
  </section>`;
}

function canonicalMessage(message, ui, bodyClass = "") {
  return `${renderMessageBody(message, ui, { longThreshold: 520 })}${renderMessageActions(message, ui)}${messageDetails(message, ui)}${messageActivity(message, ui)}${thoughtDisclosure(message, ui)}`;
}

function olderHistoryNotice(data, ui, messages) {
  const fullCount = (data.threadMap[ui.activeThreadId]?.messages?.length ?? 0) + (ui.addedMessages[ui.activeThreadId]?.length ?? 0);
  if (fullCount <= messages.length) return "";
  return `<button type="button" class="older-history-notice" data-action="open-popup" data-value="search">${icon("history")}<span><strong>${fullCount - messages.length} older stored messages remain indexed</strong><small>Search can load an exact range without instantiating the whole thread.</small></span></button>`;
}

function goalControls(goal, compact = false) {
  if (goal.cleared) return button({ label: "Start Goal", action: "goal-action", value: "start", iconName: "goal", className: "secondary-button" });
  const controls = [];
  controls.push(button({ label: goal.detailsOpen ? "Close details" : "View", action: "goal-action", value: "view", className: "text-button", pressed: Boolean(goal.detailsOpen) }));
  controls.push(button({ label: "Edit", action: "goal-action", value: "edit", className: "text-button" }));
  if (goal.state === "paused") controls.push(button({ label: "Resume", action: "goal-action", value: "resume", iconName: "play", className: "text-button" }));
  else if (!["stopped", "complete"].includes(goal.state)) controls.push(button({ label: "Pause", action: "goal-action", value: "pause", iconName: "pause", className: "text-button" }));
  if (goal.state === "blocked") controls.push(button({ label: "Recover", action: "goal-action", value: "recover", className: "text-button" }));
  controls.push(button({ label: "Replan", action: "goal-action", value: "replan", className: "text-button" }));
  controls.push(button({ label: "Stop", action: "goal-action", value: "stop", className: "text-button" }));
  controls.push(button({ label: "Clear", action: "goal-action", value: "clear", className: "text-button" }));
  return `<div class="goal-controls ${compact ? "is-compact" : ""}">${controls.join("")}</div>${goal.detailsOpen ? `<dl class="goal-detail"><div><dt>Objective</dt><dd>${escapeHtml(goal.objective)}</dd></div><div><dt>Phase</dt><dd>${escapeHtml(goal.phase)}</dd></div><div><dt>Progress</dt><dd>${goal.progress}%</dd></div><div><dt>Authority</dt><dd>Thread-local Goal state; parent retains stop and replan control.</dd></div></dl>` : ""}`;
}

function goalEdit(goal) {
  if (!goal.editing) return "";
  return `<form class="goal-edit-form" data-action-form="goal-edit"><label for="goal-objective-input">Updated objective</label><textarea id="goal-objective-input" data-role="goal-objective-input">${escapeHtml(goal.objective)}</textarea>${button({ label: "Save and replan", action: "goal-save-edit", className: "primary-button" })}</form>`;
}

function blockedGoalEvidence(goal) {
  if (goal.state !== "blocked") return "";
  return `<dl class="blocked-evidence"><div><dt>Cause</dt><dd>${escapeHtml(goal.blockedReason)}</dd></div><div><dt>Affected scope</dt><dd>Current verification phase</dd></div><div><dt>Attempted recovery</dt><dd>${escapeHtml(goal.attemptedRecovery)}</dd></div><div><dt>Why autonomy stopped</dt><dd>A required decision or evidence boundary cannot be crossed safely.</dd></div><div><dt>Next safe action</dt><dd>${escapeHtml(goal.nextSafeAction)}</dd></div></dl>`;
}

function todoRows(work, style = "rows") {
  return `<div class="todo-set todo-${style}">${work.todos.map((todo, index) => `<button type="button" class="todo-row tone-${stateTone(todo.state)}" data-action="todo-cycle" data-value="${escapeHtml(todo.id)}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(todo.label)}</strong>${stateWord(todo.state)}</button>`).join("")}${button({ label: "Add task", action: "todo-add", className: "text-button collection-action" })}</div>`;
}

function agentRows(work, style = "rows") {
  return `<div class="agent-set agent-${style}">${work.subagents.map((agent) => `<button type="button" class="agent-row tone-${stateTone(agent.state)}" data-action="subagent-cycle" data-value="${escapeHtml(agent.id)}"><span class="agent-role">${escapeHtml(agent.role)}</span><strong>${escapeHtml(agent.summary)}</strong><span>${escapeHtml(agent.route)}</span>${stateWord(agent.state)}<small>${escapeHtml(agent.elapsed)}</small></button>`).join("")}${button({ label: "Spawn child", action: "subagent-spawn", className: "text-button collection-action" })}</div>`;
}

function activityRows(work, style = "rows") {
  return `<div class="activity-set activity-${style}">${work.activity.map((activity, index) => `<div class="activity-entry"><button type="button" class="activity-row ${index + 1 === work.phase ? "is-current" : ""}" data-action="toggle-work-group" data-value="activity-${index}" aria-expanded="${work.expanded[`activity-${index}`] ? "true" : "false"}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(activity.domain)}</strong><p>${escapeHtml(activity.summary)}</p>${stateWord(activity.state)}</button>${work.expanded[`activity-${index}`] ? `<p class="activity-detail">Recorded as thread-local observable work. Source, elapsed state, and retained evidence remain inspectable without exposing hidden reasoning.</p>` : ""}</div>`).join("")}${button({ label: "Open current diff", action: "diff-open", className: "text-button collection-action" })}</div>`;
}

function resourceRows(work) {
  return `<div class="resource-set">${work.resources.map((resource) => `<button type="button" class="resource-row" data-action="resource-select" data-value="${escapeHtml(`${resource.kind}: ${resource.summary} · ${resource.action}`)}"><strong>${escapeHtml(resource.kind)}</strong><span>${escapeHtml(resource.summary)}</span>${stateWord(resource.state)}<small>${escapeHtml(resource.action)}</small></button>`).join("")}${work.resourceSelection ? `<p class="resource-selection"><strong>Selected resource</strong><span>${escapeHtml(work.resourceSelection)}</span></p>` : ""}</div>`;
}

function crewReadout(work, actionLabel = "Advance Crew wave") {
  return `<strong class="crew-state">${escapeHtml(work.crew.state)}</strong><p class="crew-capacity">${escapeHtml(work.crew.capacity)} · ${escapeHtml(work.crew.reserve)}</p>${button({ label: actionLabel, action: "crew-advance", className: "text-button crew-advance" })}`;
}

function questionPrelude(ui, className, label) {
  if (ui.question.phase === "preparing") return `<section class="question-surface ${className} question-preparing">${icon("question")}<div><span>${escapeHtml(label)}</span><strong>Preparing questions…</strong><p>The ordinary thread draft remains stored.</p></div></section>`;
  if (ui.question.phase === "submitting") return `<section class="question-surface ${className} question-submitting">${icon("sync")}<div><span>${escapeHtml(label)}</span><strong>Submitting answers…</strong><p>${escapeHtml(ui.question.receipt ?? "Answers are being committed once.")}</p></div>${button({ label: "Complete submission", action: "question-submitted", className: "secondary-button" })}</section>`;
  if (ui.question.phase === "cancelled" || ui.question.phase === "submitted") return `<section class="question-receipt ${className}">${icon(ui.question.phase === "submitted" ? "check" : "close")}<div><span>${escapeHtml(label)}</span><strong>${ui.question.phase === "submitted" ? "Questionnaire submitted" : "Questionnaire cancelled"}</strong><p>${escapeHtml(ui.question.receipt ?? "Historical record retained")}</p></div><div class="question-receipt-actions">${button({ label: "Open questions again", action: "question-phase", value: "open", className: "text-button" })}${ui.question.queue.length > 1 ? button({ label: "Next questionnaire", action: "question-next-queue", className: "secondary-button" }) : ""}</div></section>`;
  return "";
}

function questionOption(question, value, selected, mode = "single") {
  const action = mode === "multi" ? "question-toggle-answer" : "question-answer";
  return `<button type="button" class="question-option ${selected ? "is-selected" : ""}" data-action="${action}" data-value="${escapeHtml(value)}" aria-pressed="${selected ? "true" : "false"}"><span class="option-mark" aria-hidden="true"></span><span>${escapeHtml(value)}</span></button>`;
}

function questionInput(question, answer) {
  if (question.kind === "freeform") return `<label class="question-freeform"><span>Your answer</span><textarea data-role="question-freeform" placeholder="Type an answer">${escapeHtml(answer ?? "")}</textarea></label>`;
  if (question.kind === "multi select") return `<div class="question-options">${question.options.map((option) => questionOption(question, option, Array.isArray(answer) && answer.includes(option), "multi")).join("")}</div>`;
  return `<div class="question-options">${question.options.map((option) => questionOption(question, option, answer === option, "single")).join("")}</div>`;
}

function questionNavigation(ui, questionnaire, question, skipped, labels = {}) {
  const index = questionnaire.activeIndex ?? 0;
  const last = index === questionnaire.questions.length - 1;
  return `<footer class="question-navigation">
    ${button({ label: labels.cancel ?? "Cancel questionnaire", action: "question-cancel", className: "text-button" })}
    ${button({ label: skipped ? "Undo skip" : "Skip this question", action: "question-skip", className: "text-button", pressed: skipped })}
    <span class="question-spacer"></span>
    ${button({ label: labels.back ?? "Previous", action: "question-back", className: "secondary-button", disabled: index === 0, reason: "This is the first question" })}
    ${button({ label: last ? (labels.submit ?? "Submit answers") : (labels.next ?? "Next question"), action: last ? "question-submit" : "question-next", className: "primary-button" })}
  </footer>`;
}

function questionBase(ui) {
  const values = renderQuestionData(ui);
  if (!values.questionnaire || !values.question) return null;
  return values;
}

function renderEditionQuestion(ui) {
  const prelude = questionPrelude(ui, "edition-question", "Question chapter");
  if (prelude || ui.question.phase !== "open") return prelude;
  const q = questionBase(ui); if (!q) return "";
  return `<section class="question-surface edition-question"><header><div class="chapter-number">Q${q.questionnaire.activeIndex + 1}</div><div><span>Facing-page question · ${q.questionnaire.activeIndex + 1} of ${q.questionnaire.questions.length}</span><h3 id="question-prompt" data-focus-key="question-prompt" tabindex="-1">${escapeHtml(q.question.prompt)}</h3></div></header><aside class="answer-index">${q.questionnaire.questions.map((question, index) => `<span class="${index === q.questionnaire.activeIndex ? "is-current" : ""} ${ui.question.answers[question.id] != null || ui.question.skips[question.id] ? "is-recorded" : ""}">${String(index + 1).padStart(2, "0")}</span>`).join("")}</aside>${questionInput(q.question, q.answer)}${q.skipped ? '<p class="skip-receipt">This question is explicitly skipped. You can reverse the skip before submission.</p>' : ""}${ui.question.validation ? `<p class="validation-message">${escapeHtml(ui.question.validation)}</p>` : ""}${questionNavigation(ui, q.questionnaire, q.question, q.skipped, { next: "Turn page", back: "Previous page", submit: "Close and submit chapter" })}</section>`;
}

function renderScoreQuestion(ui) {
  const prelude = questionPrelude(ui, "score-question", "Question measure");
  if (prelude || ui.question.phase !== "open") return prelude;
  const q = questionBase(ui); if (!q) return "";
  return `<section class="question-surface score-question"><div class="score-clef">Q</div><header><span>MEASURE ${q.questionnaire.activeIndex + 1} / ${q.questionnaire.questions.length}</span><h3 id="question-prompt" data-focus-key="question-prompt" tabindex="-1">${escapeHtml(q.question.prompt)}</h3></header><div class="score-beats">${questionInput(q.question, q.answer)}</div><div class="score-key">${q.questionnaire.questions.map((question, index) => `<span class="${index === q.questionnaire.activeIndex ? "is-current" : ""}">${ui.question.skips[question.id] ? "SKIP" : ui.question.answers[question.id] != null ? "SET" : String(index + 1).padStart(2, "0")}</span>`).join("")}</div>${ui.question.validation ? `<p class="validation-message">${escapeHtml(ui.question.validation)}</p>` : ""}${questionNavigation(ui, q.questionnaire, q.question, q.skipped, { next: "Advance measure", back: "Return one measure", submit: "Resolve score" })}</section>`;
}

function renderTimeQuestion(ui) {
  const prelude = questionPrelude(ui, "time-question", "Question waypoint");
  if (prelude || ui.question.phase !== "open") return prelude;
  const q = questionBase(ui); if (!q) return "";
  return `<section class="question-surface time-question"><div class="waypoint-track">${q.questionnaire.questions.map((question, index) => `<span class="${index <= q.questionnaire.activeIndex ? "is-past" : ""} ${index === q.questionnaire.activeIndex ? "is-current" : ""}"><i></i>${index + 1}</span>`).join("")}</div><div class="waypoint-body"><span>WAYPOINT ${q.questionnaire.activeIndex + 1}</span><h3 id="question-prompt" data-focus-key="question-prompt" tabindex="-1">${escapeHtml(q.question.prompt)}</h3>${questionInput(q.question, q.answer)}${q.skipped ? '<p class="skip-receipt">Skipped at this waypoint; review remains available.</p>' : ""}${ui.question.validation ? `<p class="validation-message">${escapeHtml(ui.question.validation)}</p>` : ""}${questionNavigation(ui, q.questionnaire, q.question, q.skipped, { next: "Next waypoint", back: "Prior waypoint", submit: "Commit timeline" })}</div></section>`;
}

function renderBranchQuestion(ui) {
  const prelude = questionPrelude(ui, "branch-question", "Answer fork");
  if (prelude || ui.question.phase !== "open") return prelude;
  const q = questionBase(ui); if (!q) return "";
  return `<section class="question-surface branch-question"><div class="branch-spine"><span>SOURCE</span><i></i><strong>Q${q.questionnaire.activeIndex + 1}</strong><i></i><span>${q.skipped ? "SKIP" : q.answer != null ? "ANSWER" : "OPEN"}</span></div><div class="branch-leaf"><header><span>Answer fork ${q.questionnaire.activeIndex + 1} of ${q.questionnaire.questions.length}</span><h3 id="question-prompt" data-focus-key="question-prompt" tabindex="-1">${escapeHtml(q.question.prompt)}</h3></header>${questionInput(q.question, q.answer)}<p class="branch-note">Changing this answer before submission updates the draft. Re-answering a submitted questionnaire creates a sibling branch.</p>${ui.question.validation ? `<p class="validation-message">${escapeHtml(ui.question.validation)}</p>` : ""}${questionNavigation(ui, q.questionnaire, q.question, q.skipped, { next: "Follow this fork", back: "Return to prior fork", submit: "Create answer receipt" })}</div></section>`;
}

function renderWorkshopQuestion(ui) {
  const prelude = questionPrelude(ui, "workshop-question", "Pinned brief");
  if (prelude || ui.question.phase !== "open") return prelude;
  const q = questionBase(ui); if (!q) return "";
  return `<section class="question-surface workshop-question"><div class="brief-pin">${icon("pin")}</div><header><span>BRIEF ${q.questionnaire.activeIndex + 1} / ${q.questionnaire.questions.length}</span><h3 id="question-prompt" data-focus-key="question-prompt" tabindex="-1">${escapeHtml(q.question.prompt)}</h3><p>${q.question.required ? "Required before this brief can close" : "Optional detail"}</p></header><div class="brief-workarea">${questionInput(q.question, q.answer)}</div><aside class="brief-checklist">${q.questionnaire.questions.map((question, index) => `<p><span>${index + 1}</span><strong>${ui.question.skips[question.id] ? "Skipped" : ui.question.answers[question.id] != null ? "Answered" : index === q.questionnaire.activeIndex ? "On bench" : "Waiting"}</strong></p>`).join("")}</aside>${ui.question.validation ? `<p class="validation-message">${escapeHtml(ui.question.validation)}</p>` : ""}${questionNavigation(ui, q.questionnaire, q.question, q.skipped, { next: "Next brief", back: "Prior brief", submit: "File answer brief" })}</section>`;
}

function renderBraidedQuestion(ui) {
  const prelude = questionPrelude(ui, "braid-question", "Question strand");
  if (prelude || ui.question.phase !== "open") return prelude;
  const q = questionBase(ui); if (!q) return "";
  return `<section class="question-surface braid-question"><div class="question-strands" aria-hidden="true"><i></i><i></i><i></i></div><header><span>STRAND ${q.questionnaire.activeIndex + 1} OF ${q.questionnaire.questions.length}</span><h3 id="question-prompt" data-focus-key="question-prompt" tabindex="-1">${escapeHtml(q.question.prompt)}</h3></header><div class="braid-options">${questionInput(q.question, q.answer)}</div><div class="knot-index">${q.questionnaire.questions.map((question, index) => `<span class="${index === q.questionnaire.activeIndex ? "is-current" : ""} ${ui.question.answers[question.id] != null || ui.question.skips[question.id] ? "is-knotted" : ""}">${index + 1}</span>`).join("")}</div>${ui.question.validation ? `<p class="validation-message">${escapeHtml(ui.question.validation)}</p>` : ""}${questionNavigation(ui, q.questionnaire, q.question, q.skipped, { next: "Continue strand", back: "Trace back", submit: "Tie submission knot" })}</section>`;
}

function renderRelayQuestion(ui) {
  const prelude = questionPrelude(ui, "relay-question", "Parent checkpoint");
  if (prelude || ui.question.phase !== "open") return prelude;
  const q = questionBase(ui); if (!q) return "";
  return `<section class="question-surface relay-question"><header><div class="checkpoint-number">${q.questionnaire.activeIndex + 1}</div><div><span>PARENT CHECKPOINT · CHILD WAITING SAFELY</span><h3 id="question-prompt" data-focus-key="question-prompt" tabindex="-1">${escapeHtml(q.question.prompt)}</h3></div></header><div class="relay-gate"><span>REQUEST</span><i></i><div>${questionInput(q.question, q.answer)}</div><i></i><span>RETURN</span></div><p class="relay-receipt">The child does not question the user directly. The parent returns this answer with a bounded receipt.</p>${ui.question.validation ? `<p class="validation-message">${escapeHtml(ui.question.validation)}</p>` : ""}${questionNavigation(ui, q.questionnaire, q.question, q.skipped, { next: "Clear checkpoint", back: "Prior checkpoint", submit: "Return answers to parent" })}</section>`;
}

function renderQuietQuestion(ui) {
  const prelude = questionPrelude(ui, "quiet-question", "Question focus");
  if (prelude || ui.question.phase !== "open") return prelude;
  const q = questionBase(ui); if (!q) return "";
  return `<section class="question-surface quiet-question"><header><span>Question ${q.questionnaire.activeIndex + 1} of ${q.questionnaire.questions.length}</span><h3 id="question-prompt" data-focus-key="question-prompt" tabindex="-1">${escapeHtml(q.question.prompt)}</h3></header>${questionInput(q.question, q.answer)}<div class="quiet-answer-line">${q.questionnaire.questions.map((question, index) => `<span>${index + 1} ${ui.question.skips[question.id] ? "skipped" : ui.question.answers[question.id] != null ? "answered" : index === q.questionnaire.activeIndex ? "current" : "waiting"}</span>`).join("")}</div>${ui.question.validation ? `<p class="validation-message">${escapeHtml(ui.question.validation)}</p>` : ""}${questionNavigation(ui, q.questionnaire, q.question, q.skipped, { next: "Continue", back: "Back", submit: "Submit answers" })}</section>`;
}

function renderEditionWork(data, ui) {
  const work = workModel(data, ui); const goal = work.goal;
  return `<section class="work-composition edition-work"><header><span>WORK NOTES</span><strong>${escapeHtml(work.workingSummary)}</strong><time>${escapeHtml(formatDuration(work.workedSeconds))}</time></header><article class="work-note goal-note"><sup>1</sup><div><span>Goal · ${escapeHtml(goal.phase)}</span><h3>${escapeHtml(goal.objective)}</h3><div class="progress-rule"><i style="--progress:${goal.progress}%"></i></div>${stateWord(goal.state)}${goalControls(goal)}${goalEdit(goal)}${blockedGoalEvidence(goal)}</div></article><article class="work-note"><sup>2</sup><div><span>Tasks</span>${todoRows(work, "notes")}</div></article><article class="work-note"><sup>3</sup><div><span>Delegated review</span>${agentRows(work, "notes")}</div></article><article class="work-note"><sup>4</sup><div><span>Execution references</span>${activityRows(work, "notes")}<footer>${button({ label: "Advance live phase", action: "activity-advance", className: "text-button" })}${button({ label: "Update diff", action: "diff-update", className: "text-button" })}</footer></div></article><article class="work-note crew-note"><sup>5</sup><div><span>Crew cadence</span>${crewReadout(work, "Advance editorial wave")}</div></article></section>`;
}

function renderScoreWork(data, ui) {
  const work = workModel(data, ui); const goal = work.goal;
  return `<section class="work-composition score-work"><header><div class="work-clef">W</div><div><span>ACTIVE SCORE · ${escapeHtml(formatDuration(work.workedSeconds))}</span><strong>${escapeHtml(work.workingSummary)}</strong></div>${stateWord(goal.state)}</header><div class="score-stave goal-stave"><span>GOAL</span><div><strong>${escapeHtml(goal.objective)}</strong><p>${escapeHtml(goal.phase)} · ${goal.progress}%</p>${goalControls(goal, true)}${goalEdit(goal)}${blockedGoalEvidence(goal)}</div></div><div class="score-stave todo-stave"><span>TASKS</span>${todoRows(work, "staves")}</div><div class="score-stave agent-stave"><span>AGENTS</span>${agentRows(work, "staves")}</div><div class="score-stave activity-stave"><span>WORK</span>${activityRows(work, "staves")}</div><div class="score-stave crew-stave"><span>CREW</span><div>${crewReadout(work, "Count in next wave")}</div></div><footer>${button({ label: "Advance score", action: "activity-advance", className: "secondary-button" })}<span>Diff ${work.diff.files} files · +${work.diff.additions} −${work.diff.deletions}</span></footer></section>`;
}

function renderTimeWork(data, ui) {
  const work = workModel(data, ui); const goal = work.goal;
  return `<section class="work-composition time-work"><header><span>ELAPSED FIELD</span><strong>${escapeHtml(work.workingSummary)}</strong><time>${escapeHtml(formatDuration(work.workedSeconds))}</time></header><div class="time-band goal-band"><span>NOW</span><div><strong>${escapeHtml(goal.objective)}</strong><p>${escapeHtml(goal.phase)} · ${goal.progress}%</p>${stateWord(goal.state)}${goalControls(goal, true)}${goalEdit(goal)}${blockedGoalEvidence(goal)}</div></div>${work.activity.map((activity, index) => `<button type="button" class="time-band activity-band ${index + 1 === work.phase ? "is-current" : ""}" data-action="toggle-work-group" data-value="time-${index}"><span>+${index * 4}m</span><div><strong>${escapeHtml(activity.domain)}</strong><p>${escapeHtml(activity.summary)}</p>${stateWord(activity.state)}</div></button>`).join("")}<div class="time-band crew-band"><span>PARALLEL</span><div>${crewReadout(work, "Advance parallel wave")}</div></div><div class="time-parallel"><div><span>Tasks</span>${todoRows(work, "time")}</div><div><span>Agents</span>${agentRows(work, "time")}</div></div><footer>${button({ label: "Advance time field", action: "activity-advance", className: "secondary-button" })}</footer></section>`;
}

function renderBranchWork(data, ui) {
  const work = workModel(data, ui); const goal = work.goal;
  return `<section class="work-composition branch-work"><header><span>REVISION LAYERS</span><strong>${escapeHtml(work.workingSummary)}</strong>${stateWord(goal.state)}</header><div class="revision-spine"><span class="revision-node source">REQUEST</span><article><span>GOAL LAYER</span><h3>${escapeHtml(goal.objective)}</h3><p>${escapeHtml(goal.phase)} · ${goal.progress}%</p>${goalControls(goal)}${goalEdit(goal)}${blockedGoalEvidence(goal)}</article><span class="revision-node attempt">ATTEMPT</span><article><span>TASK LAYERS</span>${todoRows(work, "layers")}</article><span class="revision-node child">CHILD WORK</span><article><span>DELEGATION LAYERS</span>${agentRows(work, "layers")}</article><span class="revision-node evidence">EVIDENCE</span><article><span>RECOVERABLE GROUPS</span>${activityRows(work, "layers")}</article><span class="revision-node crew">CREW</span><article><span>PARENT-OWNED WAVES</span>${crewReadout(work, "Advance branch wave")}</article></div><footer>${button({ label: "Redirect active attempt", action: "branch-action", value: "redirect", className: "secondary-button" })}${button({ label: "Create sibling branch", action: "branch-action", value: "branch", className: "text-button" })}</footer></section>`;
}

function renderWorkshopWork(data, ui) {
  const work = workModel(data, ui); const goal = work.goal;
  return `<section class="work-composition workshop-work"><header><div><span>WORKBENCH</span><strong>${escapeHtml(work.workingSummary)}</strong></div><time>${escapeHtml(formatDuration(work.workedSeconds))}</time></header><div class="bench-object goal-drawer"><button type="button" data-action="toggle-work-group" data-value="workshop-goal"><span>Goal instrument</span><strong>${escapeHtml(goal.objective)}</strong>${stateWord(goal.state)}</button><div class="drawer-body"><p>${escapeHtml(goal.phase)} · ${goal.progress}%</p>${goalControls(goal)}${goalEdit(goal)}${blockedGoalEvidence(goal)}</div></div><div class="bench-grid"><section><span>Task instruments</span>${todoRows(work, "drawers")}</section><section><span>Agent instruments</span>${agentRows(work, "drawers")}</section><section><span>Object operations</span>${activityRows(work, "drawers")}</section><section><span>Runtime resources</span>${resourceRows(work)}</section><section class="crew-instrument"><span>Crew sequencer</span>${crewReadout(work, "Advance sequencer")}</section></div><footer>${button({ label: "Advance operation", action: "activity-advance", className: "secondary-button" })}${button({ label: "Update bench diff", action: "diff-update", className: "text-button" })}</footer></section>`;
}

function renderBraidedWork(data, ui) {
  const work = workModel(data, ui); const goal = work.goal;
  return `<section class="work-composition braided-work"><header><span>BRAIDED WORK</span><strong>${escapeHtml(work.workingSummary)}</strong><time>${escapeHtml(formatDuration(work.workedSeconds))}</time></header><div class="work-strand goal-strand"><span>GOAL</span><div><h3>${escapeHtml(goal.objective)}</h3><p>${escapeHtml(goal.phase)} · ${goal.progress}%</p>${stateWord(goal.state)}${goalControls(goal, true)}${goalEdit(goal)}${blockedGoalEvidence(goal)}</div></div><div class="work-strand todo-strand"><span>TASK</span>${todoRows(work, "strands")}</div><div class="work-strand agent-strand"><span>AGENT</span>${agentRows(work, "strands")}</div><div class="work-strand evidence-strand"><span>EVIDENCE</span>${activityRows(work, "strands")}</div><div class="synthesis-knot"><span>CREW KNOT</span>${crewReadout(work, "Advance Crew strands")}${button({ label: "Advance evidence strand", action: "activity-advance", className: "secondary-button" })}</div></section>`;
}

function renderRelayWork(data, ui) {
  const work = workModel(data, ui); const goal = work.goal;
  return `<section class="work-composition relay-work"><header><span>RELAY BOARD</span><strong>${escapeHtml(work.crew.state)}</strong><p>${escapeHtml(work.crew.capacity)} · ${escapeHtml(work.crew.reserve)}</p></header><div class="relay-course"><section class="relay-zone parent-zone"><span>01 / PARENT</span><h3>${escapeHtml(goal.objective)}</h3><p>${escapeHtml(goal.phase)} · ${goal.progress}%</p>${stateWord(goal.state)}${goalControls(goal, true)}${goalEdit(goal)}${blockedGoalEvidence(goal)}</section><section class="relay-zone task-zone"><span>02 / COURSE</span>${todoRows(work, "relay")}</section><section class="relay-zone handoff-zone"><span>03 / HANDOFFS</span>${agentRows(work, "relay")}</section><section class="relay-zone return-zone"><span>04 / RETURNS</span>${activityRows(work, "relay")}</section><section class="relay-zone synthesis-zone"><span>05 / SYNTHESIS</span><strong>${escapeHtml(work.workingSummary)}</strong><p>${escapeHtml(formatDuration(work.workedSeconds))}</p></section></div><footer>${button({ label: "Advance Crew wave", action: "crew-advance", className: "secondary-button" })}${button({ label: "Request another thread", action: "communication-action", value: "request", className: "text-button" })}</footer></section>`;
}

function renderQuietWork(data, ui) {
  const work = workModel(data, ui); const goal = work.goal;
  const open = Boolean(work.expanded["quiet-work-details"]);
  return `<section class="work-composition quiet-work"><div class="quiet-runline"><span>${escapeHtml(formatDuration(work.workedSeconds))}</span><strong>${escapeHtml(work.workingSummary)}</strong>${stateWord(work.active ? "running" : "complete")}${button({ label: open ? "Hide details" : "Details", action: "toggle-work-group", value: "quiet-work-details", className: "text-button", pressed: open })}</div>${open ? `<div class="quiet-work-register"><p><span>Goal</span><strong>${escapeHtml(goal.phase)}</strong><em>${goal.progress}% · ${escapeHtml(humanize(goal.state))}</em></p>${goalControls(goal, true)}${goalEdit(goal)}${blockedGoalEvidence(goal)}<div class="quiet-register-columns"><section><span>Tasks</span>${todoRows(work, "quiet")}</section><section><span>Agents</span>${agentRows(work, "quiet")}</section><section><span>Evidence</span>${activityRows(work, "quiet")}</section></div><div class="quiet-crew-line"><span>Crew</span>${crewReadout(work, "Advance wave")}</div><p class="quiet-diff-line"><span>Diff</span><strong>${work.diff.files} files</strong><em>+${work.diff.additions} −${work.diff.deletions}</em>${button({ label: "Open", action: "diff-open", className: "text-button" })}${button({ label: "Update", action: "diff-update", className: "text-button" })}</p></div>` : ""}</section>`;
}

function renderEditionMessages(data, ui) {
  const messages = visibleMessages(data, ui, 14);
  return `${olderHistoryNotice(data, ui, messages)}<div class="edition-messages">${messages.map((message, index) => `<article class="edition-message role-${message.role}" style="--motion-order:${Math.min(index, 6)}" id="message-${escapeHtml(message.id)}" tabindex="-1" data-message-id="${escapeHtml(message.id)}"><div class="edition-number">${String(index + 1).padStart(2, "0")}</div><header><span>${message.role === "user" ? "You" : "Assistant"}</span><time>${escapeHtml(formatLocalTime(message.sentAt))}</time></header>${canonicalMessage(message, ui)}</article>${index === Math.min(2, messages.length - 1) ? renderEditionQuestion(ui) : ""}${index === Math.min(5, messages.length - 1) ? renderEditionWork(data, ui) : ""}`).join("")}</div>`;
}

function renderScoreMessages(data, ui) {
  const messages = visibleMessages(data, ui, 14);
  return `${olderHistoryNotice(data, ui, messages)}<div class="score-messages">${messages.map((message, index) => `<article class="score-message role-${message.role}" style="--motion-order:${Math.min(index, 6)}" id="message-${escapeHtml(message.id)}" tabindex="-1" data-message-id="${escapeHtml(message.id)}"><div class="speaker-key"><span>${message.role === "user" ? "U" : "A"}</span><time>${escapeHtml(formatLocalTime(message.sentAt))}</time></div><div class="speaker-measure">${canonicalMessage(message, ui)}</div></article>${index === Math.min(2, messages.length - 1) ? renderScoreQuestion(ui) : ""}${index === Math.min(5, messages.length - 1) ? renderScoreWork(data, ui) : ""}`).join("")}</div>`;
}

function renderTimeMessages(data, ui) {
  const messages = visibleMessages(data, ui, 14);
  const start = new Date(messages[0]?.sentAt ?? Date.now()).getTime();
  return `${olderHistoryNotice(data, ui, messages)}<div class="time-messages">${messages.map((message, index) => { const offset = Math.max(0, Math.round((new Date(message.sentAt).getTime() - start) / 60000)); return `<article class="time-message role-${message.role}" style="--motion-order:${Math.min(index, 6)}" id="message-${escapeHtml(message.id)}" tabindex="-1" data-message-id="${escapeHtml(message.id)}"><div class="time-axis"><span>+${offset}m</span><i></i><small>${message.role === "user" ? "YOU" : "ASSISTANT"}</small></div><div class="time-prose">${canonicalMessage(message, ui)}</div></article>${index === Math.min(2, messages.length - 1) ? renderTimeQuestion(ui) : ""}${index === Math.min(5, messages.length - 1) ? renderTimeWork(data, ui) : ""}`; }).join("")}</div>`;
}

function renderBranchMessages(data, ui) {
  const messages = visibleMessages(data, ui, 14);
  return `${olderHistoryNotice(data, ui, messages)}<div class="branch-messages">${messages.map((message, index) => `<article class="branch-message role-${message.role}" style="--motion-order:${Math.min(index, 6)}" id="message-${escapeHtml(message.id)}" tabindex="-1" data-message-id="${escapeHtml(message.id)}"><div class="ancestry-joint"><i></i><span>${String(index + 1).padStart(2, "0")}</span></div><div class="branch-prose"><header><span>${message.role === "user" ? "Source request" : "Active answer"}</span><time>${escapeHtml(formatLocalTime(message.sentAt))}</time></header>${canonicalMessage(message, ui)}${index === 4 ? '<div class="branch-fold"><span>2 sibling answers</span><button type="button" data-action="branch-action" data-value="branch">Inspect ancestry</button></div>' : ""}</div></article>${index === Math.min(2, messages.length - 1) ? renderBranchQuestion(ui) : ""}${index === Math.min(5, messages.length - 1) ? renderBranchWork(data, ui) : ""}`).join("")}</div>`;
}

function renderWorkshopMessages(data, ui) {
  const messages = visibleMessages(data, ui, 14);
  return `${olderHistoryNotice(data, ui, messages)}<div class="workshop-messages">${messages.map((message, index) => `<article class="journal-entry role-${message.role}" style="--motion-order:${Math.min(index, 6)}" id="message-${escapeHtml(message.id)}" tabindex="-1" data-message-id="${escapeHtml(message.id)}"><header><span>${message.role === "user" ? "FIELD NOTE" : "ASSISTANT JOURNAL"}</span><time>${escapeHtml(formatLocalTime(message.sentAt))}</time></header>${canonicalMessage(message, ui)}</article>${index === Math.min(2, messages.length - 1) ? renderWorkshopQuestion(ui) : ""}${index === Math.min(5, messages.length - 1) ? renderWorkshopWork(data, ui) : ""}`).join("")}</div>`;
}

function renderBraidedMessages(data, ui) {
  const messages = visibleMessages(data, ui, 14);
  return `${olderHistoryNotice(data, ui, messages)}<div class="braided-messages">${messages.map((message, index) => `<article class="braid-message role-${message.role}" style="--motion-order:${Math.min(index, 6)}" id="message-${escapeHtml(message.id)}" tabindex="-1" data-message-id="${escapeHtml(message.id)}"><div class="strand-mark"><i></i><span>${message.role === "user" ? "HUMAN" : "ASSISTANT"}</span></div><div class="strand-prose">${canonicalMessage(message, ui)}</div></article>${index === Math.min(2, messages.length - 1) ? renderBraidedQuestion(ui) : ""}${index === Math.min(5, messages.length - 1) ? renderBraidedWork(data, ui) : ""}`).join("")}</div>`;
}

function renderRelayMessages(data, ui) {
  const messages = visibleMessages(data, ui, 14);
  return `${olderHistoryNotice(data, ui, messages)}<div class="relay-messages">${messages.map((message, index) => `<article class="relay-message role-${message.role}" style="--motion-order:${Math.min(index, 6)}" id="message-${escapeHtml(message.id)}" tabindex="-1" data-message-id="${escapeHtml(message.id)}"><div class="course-marker"><span>${String(index + 1).padStart(2, "0")}</span><i></i></div><div class="course-prose"><header><span>${message.role === "user" ? "PARENT REQUEST" : "PARENT SYNTHESIS"}</span><time>${escapeHtml(formatLocalTime(message.sentAt))}</time></header>${canonicalMessage(message, ui)}</div></article>${index === Math.min(2, messages.length - 1) ? renderRelayQuestion(ui) : ""}${index === Math.min(5, messages.length - 1) ? renderRelayWork(data, ui) : ""}`).join("")}</div>`;
}

function renderQuietMessages(data, ui) {
  const messages = visibleMessages(data, ui, 18);
  return `${olderHistoryNotice(data, ui, messages)}<div class="quiet-messages">${messages.map((message, index) => `<article class="quiet-message role-${message.role}" style="--motion-order:${Math.min(index, 6)}" id="message-${escapeHtml(message.id)}" tabindex="-1" data-message-id="${escapeHtml(message.id)}"><header><span>${message.role === "user" ? "You" : "Assistant"}</span><time>${escapeHtml(formatLocalTime(message.sentAt))}</time></header>${canonicalMessage(message, ui)}</article>${index === Math.min(3, messages.length - 1) ? renderQuietQuestion(ui) : ""}${index === Math.min(7, messages.length - 1) ? renderQuietWork(data, ui) : ""}`).join("")}</div>`;
}

const concepts = {
  "thread-01": { title: "Thread 01 · Edition", className: "thread-edition", renderMessages: renderEditionMessages },
  "thread-02": { title: "Thread 02 · Dialogue Score", className: "thread-score", renderMessages: renderScoreMessages },
  "thread-03": { title: "Thread 03 · Timefield", className: "thread-timefield", renderMessages: renderTimeMessages },
  "thread-04": { title: "Thread 04 · Branchbook", className: "thread-branchbook", renderMessages: renderBranchMessages },
  "thread-05": { title: "Thread 05 · Workshop", className: "thread-workshop", renderMessages: renderWorkshopMessages },
  "thread-06": { title: "Thread 06 · Braided", className: "thread-braided", renderMessages: renderBraidedMessages },
  "thread-07": { title: "Thread 07 · Relay", className: "thread-relay", renderMessages: renderRelayMessages },
  "thread-08": { title: "Thread 08 · Quiet Current", className: "thread-quiet", renderMessages: renderQuietMessages }
};

export function renderThreadConcept(data, ui) {
  const concept = concepts[ui.selectedThreadConcept] ?? concepts["thread-01"];
  const thread = activeThread(data, ui);
  let renderedMessages = concept.renderMessages(data, ui).replace(/id="message-([^"]+)" tabindex="-1"/g, 'id="message-$1" data-focus-key="message-$1" tabindex="-1"');
  if (ui.motionCue?.domain === "message" && ui.motionCue.messageId) {
    const marker = `data-message-id="${escapeHtml(ui.motionCue.messageId)}"`;
    renderedMessages = renderedMessages.replace(marker, `${marker} data-motion-state="${escapeHtml(ui.motionCue.state)}"`);
  }
  const questionMotion = ui.motionCue?.domain === "question" ? ` data-question-motion="${escapeHtml(ui.motionCue.state)}"` : "";
  const workMotion = ui.motionCue?.domain === "work" ? ` data-work-motion="${escapeHtml(ui.motionCue.state)}"` : "";
  return `<section class="thread-concept ${concept.className}" data-thread-concept="${escapeHtml(ui.selectedThreadConcept)}"${questionMotion}${workMotion}>
    ${renderChatHeader(data, ui, concept.title)}
    <div class="thread-sync-line"><span>${escapeHtml(ui.network.transport)}</span><span>${escapeHtml(ui.network.domain)}</span><span>${escapeHtml(ui.branch.message)}</span></div>
    <div class="transcript" data-role="transcript" data-scroll-key="transcript" aria-label="Conversation transcript for ${escapeHtml(thread.title)}">
      ${renderSystemNotices(ui)}
      ${renderedMessages}
      <div class="jump-latest">${button({ label: "Jump to latest", action: "jump-latest", className: "secondary-button" })}</div>
    </div>
    <footer class="composer-zone">${renderComposer(ui)}</footer>
  </section>`;
}
