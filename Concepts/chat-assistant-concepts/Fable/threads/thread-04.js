// Fable — Thread 04 "Dossier".
// Design thesis: work files itself. Messages are folder cards with a corner tab;
// all live work collects into one case file with tabbed sections (Goal, Tasks,
// Agents, Changes) in a stable footprint; questionnaires are paged forms with a
// final review page before submission (video 2's review-and-reverse, taken
// further). Completed work becomes a labeled file that reopens by tab.
// Motion thesis: filing — cards slide into place along the stack axis, tabs
// switch content inside a fixed frame, and submission stamps the file shut.

import { store } from "../shared/store.js";
import { icon } from "../shared/icons.js";
import { ensureCss } from "../shared/contracts.js";
import { escapeHtml } from "../shared/popup.js";
import {
  transcriptSlice, isLongMessage, isExpanded, previewText, lensMark, copyMessage,
  workCluster, createScrollKeeper, questionnaireState, activityGroups, bodyHtml, liveTurn,
} from "../shared/thread-common.js";
import { createComposer, createSelectorRow, createDecisionStack, openMoreInfo, openMessageOps } from "../shared/components.js";
import { fmtDuration, fmtTime, workedLabel, JUMP_TO_LATEST, QUESTIONNAIRE_ACTIONS, TODO_STATE_LABELS } from "../shared/strings.js";

export function createThread(ctx) {
  ensureCss("threads/thread-base.css");
  ensureCss("threads/thread-04.css");
  const s = ctx.store;

  const el = ctx.el;
  el.classList.add("fwt-column", "ft4-root");
  el.innerHTML = `
    <div class="fwt-scrollwrap">
      <div class="fwt-scroll pm-scroll ft4-scroll"><div class="ft4-stack"></div></div>
    </div>
    <div class="fwt-composer-region ft4-composer-region"></div>`;

  const scrollEl = el.querySelector(".ft4-scroll");
  const scrollWrap = el.querySelector(".fwt-scrollwrap");
  const stackEl = el.querySelector(".ft4-stack");
  const composerRegion = el.querySelector(".ft4-composer-region");
  const keeper = createScrollKeeper(scrollEl);

  const decisions = document.createElement("div");
  createDecisionStack(decisions);
  const lensBar = document.createElement("div");
  const composerHost = document.createElement("div");
  const composer = createComposer(composerHost);
  const selectors = document.createElement("div");
  const selectorRow = createSelectorRow(ctx.selectorSlot || selectors, { compact: true });
  composerRegion.append(decisions, lensBar, composerHost);
  if (!ctx.selectorSlot) composerRegion.append(selectors);

  const jump = document.createElement("button");
  jump.className = "fwt-jump";
  jump.innerHTML = `${icon("chevronDown", 12)}<span>${JUMP_TO_LATEST}</span>`;
  jump.hidden = true;
  jump.addEventListener("click", () => keeper.jumpToLatest());
  scrollWrap.appendChild(jump);
  scrollEl.addEventListener("scroll", () => { jump.hidden = keeper.atBottom; }, { passive: true });

  function render() {
    keeper.preserve(() => {
      stackEl.replaceChildren();
      const slice = transcriptSlice();
      if (slice.olderCount > 0) {
        const older = document.createElement("div");
        older.className = "fwt-older";
        older.innerHTML = `<span>${slice.olderCount} earlier documents in the cabinet — search reads the whole file</span>`;
        const btn = document.createElement("button");
        btn.textContent = "Pull earlier";
        btn.addEventListener("click", () => slice.loadOlder());
        older.appendChild(btn);
        stackEl.appendChild(older);
      }
      for (const m of slice.messages) stackEl.appendChild(renderCard(m));
      renderCaseFile();
      renderQuestionnaire();
    });
    renderLensBar();
    keeper.followIfAtBottom();
    requestAnimationFrame(() => { jump.hidden = keeper.atBottom; });
  }

  function renderCard(m) {
    const card = document.createElement("article");
    card.className = "ft4-card";
    card.dataset.mid = m.id;
    card.dataset.role = m.role;

    const tab = document.createElement("div");
    tab.className = "ft4-card-tab";
    const mark = lensMark(m);
    tab.innerHTML = `<span class="ft4-tab-role">${m.role === "user" ? "You" : "Fable"}</span><time class="ft4-tab-time">${fmtTime(m.sentAt)}</time>` +
      (mark ? `<span class="fwt-lens-flag" data-op="${mark}">${mark === "mute" ? "Muted" : mark === "focus" ? "Focused" : mark === "subcompact" ? "Subcompacted" : "Pending"}</span>` : "") +
      (m.redirect ? `<span class="fwt-redirect-flag">redirect</span>` : "") +
      (m.interrupted ? `<span class="fwt-redirect-flag">stopped</span>` : "");
    card.appendChild(tab);

    const paper = document.createElement("div");
    paper.className = "ft4-paper";
    const prose = document.createElement("div");
    prose.className = "ft4-prose";
    const long = isLongMessage(m);
    const expanded = isExpanded(m);
    prose.innerHTML = long && !expanded ? `<p>${escapeHtml(previewText(m)).replace(/\n/g, "<br>")}</p>` : bodyHtml(m);
    paper.appendChild(prose);

    if (long) {
      const fold = document.createElement("button");
      fold.className = "ft4-fold";
      fold.textContent = expanded ? "Refold document" : "Open full document";
      fold.addEventListener("click", () => keeper.preserve(() => s.toggleMessageExpanded(m.id)));
      paper.appendChild(fold);
    }

    for (const g of activityGroups(m)) paper.appendChild(renderFiledGroup(m, g));
    card.appendChild(paper);

    const actions = document.createElement("div");
    actions.className = "ft4-actions";
    const rt = m.runtime || {};
    const canEdit = m.role === "user" && m.eligibleForEdit && isLastUser(m);
    const mk = (t, fn) => { const b = document.createElement("button"); b.textContent = t; b.addEventListener("click", fn); return b; };
    actions.append(
      mk("Copy", () => copyMessage(m)),
      ...(canEdit ? [mk("Edit", () => { s.setDraft(m.body); s.addReceipt({ kind: "edit", title: "Editing your message", detail: "The filed original stays in the dossier." }); })] : []),
      meta(rt.provider), meta(rt.model), meta(workedLabel(false, rt.workedSeconds)),
      mk("More Info", (e) => openMoreInfo(e.currentTarget, m)),
      Object.assign(mk("Context", (e) => openMessageOps(e.currentTarget, m)), { className: "ft4-ops" }),
    );
    card.appendChild(actions);
    return card;
  }

  function meta(t) { const sp = document.createElement("span"); sp.className = "ft4-meta"; sp.textContent = t || ""; return sp; }
  function isLastUser(m) {
    const msgs = s.thread.messages;
    for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === "user") return msgs[i].id === m.id;
    return false;
  }

  // Historical work — a closed file with tabs that reopen sections.
  function renderFiledGroup(m, g) {
    const wrap = document.createElement("div");
    wrap.className = "ft4-filed";
    const key = m.id + ":" + g.kind;
    const open = !!s.view.expandedGroups[key];
    const head = document.createElement("button");
    head.className = "ft4-filed-head";
    const label = g.kind === "activity" ? `Case record — ${g.group.compactLabel}, ${fmtDuration(g.group.workedSeconds)}`
      : g.kind === "thoughts" ? "Thought summary on file"
      : `Filed answers — ${(g.record.questionsAndAnswers || []).length} questions`;
    head.innerHTML = `${icon("drawer", 12)}<span>${escapeHtml(label)}</span>${icon(open ? "chevronUp" : "chevronDown", 10)}`;
    head.addEventListener("click", () => keeper.preserve(() => s.toggleGroupExpanded(key)));
    wrap.appendChild(head);
    if (open) {
      const sheet = document.createElement("div");
      sheet.className = "ft4-filed-sheet";
      if (g.kind === "activity") {
        for (const st of g.group.stages) {
          const line = document.createElement("div");
          line.className = "ft4-filed-line";
          line.innerHTML = `<span class="ft4-filed-kind">${escapeHtml(st.kind)}</span><span>${escapeHtml(st.label)}</span><span class="ft4-filed-side">${st.added != null ? `+${st.added} −${st.removed}` : fmtDuration(st.durationSeconds)}</span>`;
          sheet.appendChild(line);
        }
      } else if (g.kind === "thoughts") {
        for (const seg of g.segments) sheet.innerHTML += `<p class="ft4-filed-thought">${escapeHtml(seg.summary)}</p>`;
      } else {
        for (const qa of g.record.questionsAndAnswers) {
          sheet.innerHTML += `<div class="ft4-filed-line"><span class="ft4-filed-kind">Q</span><span>${escapeHtml(qa.question)}</span><span class="ft4-filed-side">${escapeHtml(qa.answer)}</span></div>`;
        }
      }
      wrap.appendChild(sheet);
    }
    return wrap;
  }

  // ---------- the case file (stable-footprint tabbed work cluster) ----------
  function renderCaseFile() {
    const existing = stackEl.querySelector(".ft4-case");
    if (existing) existing.remove();
    const w = workCluster();
    if (w.isEmpty) return;

    const tabs = [];
    if (w.goal) tabs.push("Goal");
    if (w.todo) tabs.push("Tasks");
    if (w.subagents) tabs.push("Agents");
    if (w.diffs.length) tabs.push("Changes");
    if (!tabs.length && !w.turn) return;

    const cur = s.view.expandedGroups["ft4:casetab"];
    const activeTab = tabs.includes(cur) ? cur : tabs[0];

    const file = document.createElement("section");
    file.className = "ft4-case";
    file.setAttribute("aria-label", "Case file");

    const lt = liveTurn();
    const spine = document.createElement("div");
    spine.className = "ft4-case-spine";
    spine.innerHTML = lt
      ? `<span class="ft4-case-live" aria-hidden="true"></span><span class="ft4-case-title">${escapeHtml(lt.summary)}</span><span class="ft4-case-time">${fmtDuration(lt.workedSeconds)}</span>`
      : `<span class="ft4-case-title">Open case</span>`;
    file.appendChild(spine);
    // Live phase detail files itself under the spine while the phase runs.
    if (lt && lt.items.length) {
      const strip = document.createElement("div");
      strip.className = "ft4-case-livefile";
      for (const item of lt.items) {
        strip.innerHTML += `<div class="ft4-filed-line"><span class="ft4-filed-kind">${escapeHtml(lt.phaseKind.replace(/_/g, " "))}</span><span>${escapeHtml(item.text)}</span>${item.side ? `<span class="ft4-filed-side">${escapeHtml(item.side)}</span>` : ""}</div>`;
      }
      file.appendChild(strip);
    }

    if (tabs.length) {
      const tabRow = document.createElement("div");
      tabRow.className = "ft4-case-tabs";
      for (const t of tabs) {
        const b = document.createElement("button");
        b.className = "ft4-case-tab";
        b.dataset.active = String(t === activeTab);
        b.textContent = t;
        b.addEventListener("click", () => { s.view.expandedGroups["ft4:casetab"] = t; s.emit("transcript-view"); });
        tabRow.appendChild(b);
      }
      file.appendChild(tabRow);

      const body = document.createElement("div");
      body.className = "ft4-case-body";
      if (activeTab === "Goal" && w.goal) {
        const phaseLine = w.goal.phases ? `<p class="ft4-goal-phase">Phase ${(w.goal.phaseIndex || 0) + 1} of ${w.goal.phases.length} — ${escapeHtml(w.goal.phases[w.goal.phaseIndex || 0])}${w.goal.replanApplied ? " · replanned" : ""}</p>` : (w.goal.replanApplied ? `<p class="ft4-goal-phase">Updated — replanned</p>` : "");
        body.innerHTML = `<div class="ft4-goal-line" data-status="${w.goal.status}"><span class="ft4-goal-status">${escapeHtml(w.goal.status)}</span><span class="ft4-goal-title">${escapeHtml(w.goal.title)}</span></div><p class="ft4-goal-obj">${escapeHtml(w.goal.objective)}</p>${phaseLine}`;
        if (w.goal.blocked) {
          body.innerHTML += `<div class="ft4-goal-blocked"><strong>Cause:</strong> ${escapeHtml(w.goal.blocked.cause)}<br><strong>Scope:</strong> ${escapeHtml(w.goal.blocked.scope)}<br><strong>Tried:</strong> ${escapeHtml(w.goal.blocked.attempted)}<br><strong>Why stopped:</strong> ${escapeHtml(w.goal.blocked.whyStopped)}<br><strong>Next safe action:</strong> ${escapeHtml(w.goal.blocked.nextSafeAction)}</div>`;
        }
        const ctrl = document.createElement("div");
        ctrl.className = "ft4-goal-ctrl";
        const btn = (t, ok, fn) => { const b = document.createElement("button"); b.textContent = t; if (!ok) { b.disabled = true; b.title = "Not available in this Goal state"; } else b.addEventListener("click", fn); return b; };
        ctrl.append(
          btn("Pause", w.goal.status === "running", () => s.setGoalStatus("Paused")),
          btn("Resume", w.goal.status === "paused", () => s.setGoalStatus("Running")),
          btn("Stop", ["running", "paused", "blocked"].includes(w.goal.status), () => s.setGoalStatus("Stopped")),
          btn("Edit", true, () => s.editGoal(w.goal.objective + " Include CLI account isolation.")),
          btn("Clear", ["stopped", "complete"].includes(w.goal.status), () => s.clearGoal()),
        );
        body.appendChild(ctrl);
        if (w.goal.pendingEdit) {
          const pe = document.createElement("div");
          pe.className = "ft4-goal-replan";
          pe.innerHTML = `<strong>Replan pending:</strong> ${escapeHtml(w.goal.pendingEdit.impact)} `;
          const apply = document.createElement("button");
          apply.className = "pm-btn";
          apply.dataset.variant = "primary";
          apply.textContent = "Apply replan";
          apply.addEventListener("click", () => s.confirmGoalEdit());
          pe.appendChild(apply);
          body.appendChild(pe);
        }
      } else if (activeTab === "Tasks" && w.todo) {
        for (const item of w.todo.items) {
          body.innerHTML += `<div class="ft4-task" data-state="${item.state}"><span class="ft4-task-box" aria-hidden="true"></span><span class="ft4-task-label">${escapeHtml(item.label)}</span><span class="ft4-task-state">${escapeHtml(TODO_STATE_LABELS[item.state] || item.state)}</span></div>`;
        }
      } else if (activeTab === "Agents" && w.subagents) {
        const c = w.subagents.counts;
        body.innerHTML += `<div class="ft4-agents-counts">${c.working} working · ${c.complete} complete · ${c.blocked} blocked${c.failed ? ` · ${c.failed} failed` : ""}${c.retrying ? ` · ${c.retrying} retrying` : ""} · ${c.waiting} waiting</div>`;
        for (const a of w.subagents.agents) {
          body.innerHTML += `<div class="ft4-agent" data-status="${a.status}"><span class="ft4-agent-name">${escapeHtml(a.name)}</span><span class="ft4-agent-task">${escapeHtml(a.task)}</span><span class="ft4-agent-act">${escapeHtml(a.currentActivity)}</span><span class="ft4-agent-side">${escapeHtml(a.route || "")}${a.workedSeconds ? ` · ${fmtDuration(a.workedSeconds)}` : ""}</span></div>`;
        }
        body.innerHTML += `<p class="ft4-case-note">Questions from children arrive through the parent — never directly.</p>`;
      } else if (activeTab === "Changes") {
        for (const d of w.diffs) {
          for (const f of d.files) {
            const line = document.createElement("button");
            line.className = "ft4-change";
            line.innerHTML = `<span class="ft4-change-path">${escapeHtml(f.path)}</span><span><span class="pmc-add">+${f.added}</span> <span class="pmc-del">−${f.removed}</span></span>`;
            line.addEventListener("click", () => s.openArtifact("art-diff"));
            body.appendChild(line);
          }
        }
      }
      file.appendChild(body);
    }
    stackEl.appendChild(file);
  }

  // ---------- paged questionnaire with review page ----------
  function renderQuestionnaire() {
    const existing = stackEl.querySelector(".ft4-qfile");
    if (existing) existing.remove();
    const { active, queued } = questionnaireState();
    if (!active) return;

    const file = document.createElement("section");
    file.className = "ft4-qfile";

    if (active.status === "preparing" || active.status === "submitting") {
      file.innerHTML = `<div class="ft4-qfile-band">${icon(active.status === "preparing" ? "question" : "send", 13)}<span>${active.status === "preparing" ? "Preparing a form for you…" : "Stamping and filing your answers…"}</span></div>`;
      stackEl.appendChild(file);
      return;
    }

    const total = active.questions.length;
    const onReview = s.view.expandedGroups["ft4:qreview"] === active.id;
    const idx = active.currentQuestionIndex;

    const head = document.createElement("div");
    head.className = "ft4-qfile-head";
    head.innerHTML = `<span class="ft4-qfile-title">${escapeHtml(active.title)}</span>` +
      `<span class="ft4-qfile-pages">${onReview ? "Review" : `Page ${idx + 1} of ${total}`}${queued.length ? ` · ${queued.length} form${queued.length > 1 ? "s" : ""} waiting` : ""}</span>`;
    file.appendChild(head);

    const pageTabs = document.createElement("div");
    pageTabs.className = "ft4-qpages";
    active.questions.forEach((q, i) => {
      const t = document.createElement("button");
      t.className = "ft4-qpage-tab";
      t.dataset.state = active.skipped[q.id] ? "skipped" : (q.selected && q.selected.length) ? "answered" : "open";
      t.dataset.current = String(!onReview && i === idx);
      t.textContent = String(i + 1);
      t.addEventListener("click", () => { s.view.expandedGroups["ft4:qreview"] = null; s.navigateQuestion(active.id, i); });
      pageTabs.appendChild(t);
    });
    const rev = document.createElement("button");
    rev.className = "ft4-qpage-tab ft4-qpage-review";
    rev.dataset.current = String(onReview);
    rev.textContent = "Review";
    rev.addEventListener("click", () => { s.view.expandedGroups["ft4:qreview"] = active.id; s.emit("transcript-view"); });
    pageTabs.appendChild(rev);
    file.appendChild(pageTabs);

    const page = document.createElement("div");
    page.className = "ft4-qpage";

    if (onReview) {
      const grid = document.createElement("div");
      grid.className = "ft4-qreview";
      active.questions.forEach((q, i) => {
        const row = document.createElement("button");
        row.className = "ft4-qreview-row";
        row.dataset.state = active.skipped[q.id] ? "skipped" : (q.selected && q.selected.length) ? "answered" : "open";
        row.innerHTML = `<span class="ft4-qreview-num">${i + 1}</span><span class="ft4-qreview-q">${escapeHtml(q.prompt)}</span><span class="ft4-qreview-a">${escapeHtml(active.skipped[q.id] ? "Skipped" : (q.kind === "freeform" ? (active.freeform[q.id] || "—") : (q.selected || []).join(", ") || "—"))}</span>`;
        row.addEventListener("click", () => { s.view.expandedGroups["ft4:qreview"] = null; s.navigateQuestion(active.id, i); });
        grid.appendChild(row);
      });
      page.appendChild(grid);
      const submitRow = document.createElement("div");
      submitRow.className = "ft4-qnav";
      const cancel = document.createElement("button");
      cancel.className = "ft4-qnavbtn ft4-qcancel";
      cancel.textContent = QUESTIONNAIRE_ACTIONS.cancel;
      cancel.addEventListener("click", () => s.cancelQuestionnaire(active.id));
      const submit = document.createElement("button");
      submit.className = "pm-btn";
      submit.dataset.variant = "primary";
      submit.textContent = "Submit form";
      submit.addEventListener("click", () => {
        const res = s.submitQuestionnaire(active.id);
        if (!res.ok && res.missing) {
          page.insertAdjacentHTML("afterbegin", `<div class="ft4-qerror">Required pages are blank — answer them or skip explicitly.</div>`);
        }
      });
      submitRow.append(cancel, submit);
      page.appendChild(submitRow);
    } else {
      const q = active.questions[idx];
      const prompt = document.createElement("p");
      prompt.className = "ft4-qprompt";
      prompt.textContent = q.prompt;
      page.appendChild(prompt);

      if (q.kind === "freeform") {
        const ta = document.createElement("textarea");
        ta.className = "ft4-qfreeform pm-scroll";
        ta.placeholder = "Write on this page";
        ta.value = active.freeform[q.id] || "";
        ta.addEventListener("change", () => s.answerQuestion(active.id, q.id, ta.value));
        page.appendChild(ta);
      } else {
        for (const opt of q.options) {
          const sel = (q.selected || []).includes(opt);
          const row = document.createElement("button");
          row.className = "ft4-qopt";
          row.dataset.selected = String(sel);
          row.innerHTML = `<span class="ft4-qopt-mark" aria-hidden="true">${sel ? icon("check", 12) : ""}</span><span>${escapeHtml(opt)}</span>`;
          row.addEventListener("click", () => s.answerQuestion(active.id, q.id, opt, { toggle: q.kind === "multi select" }));
          page.appendChild(row);
        }
      }
      if (active.skipped[q.id]) {
        const sk = document.createElement("div");
        sk.className = "ft4-qskipped";
        sk.innerHTML = `<span>This page is skipped.</span>`;
        const undo = document.createElement("button");
        undo.textContent = QUESTIONNAIRE_ACTIONS.answerLater;
        undo.addEventListener("click", () => s.unskipQuestion(active.id, q.id));
        sk.appendChild(undo);
        page.appendChild(sk);
      }

      const nav = document.createElement("div");
      nav.className = "ft4-qnav";
      const mkb = (t, ok, fn, cls) => { const b = document.createElement("button"); b.className = "ft4-qnavbtn " + (cls || ""); b.textContent = t; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
      nav.append(
        mkb(QUESTIONNAIRE_ACTIONS.back, idx > 0, () => s.navigateQuestion(active.id, idx - 1)),
        mkb(QUESTIONNAIRE_ACTIONS.skip, !active.skipped[q.id], () => s.skipQuestion(active.id, q.id)),
        mkb(QUESTIONNAIRE_ACTIONS.cancel, true, () => s.cancelQuestionnaire(active.id), "ft4-qcancel"),
      );
      const fwd = document.createElement("button");
      fwd.className = "pm-btn";
      fwd.dataset.variant = "primary";
      fwd.textContent = idx === total - 1 ? "Go to review" : QUESTIONNAIRE_ACTIONS.next;
      fwd.addEventListener("click", () => {
        if (idx === total - 1) { s.view.expandedGroups["ft4:qreview"] = active.id; s.emit("transcript-view"); }
        else s.navigateQuestion(active.id, idx + 1);
      });
      nav.appendChild(fwd);
      page.appendChild(nav);
    }
    file.appendChild(page);
    stackEl.appendChild(file);
  }

  function renderLensBar() {
    const pending = Object.values(s.lensState.selections).filter((v) => v === "subcompact-pending").length;
    lensBar.replaceChildren();
    if (!pending) return;
    const bar = document.createElement("div");
    bar.className = "fwt-lens-applybar";
    bar.innerHTML = `${icon("compress", 13)}<span>${pending} documents marked for Subcompact</span>`;
    const apply = document.createElement("button");
    apply.textContent = "Apply";
    apply.addEventListener("click", () => s.lensApplySubcompact());
    bar.appendChild(apply);
    lensBar.appendChild(bar);
  }

  const un = [
    s.on("transcript", (d) => { render(); if (d && d.jumpTo) keeper.scrollToMessage(d.jumpTo); }),
    s.on("transcript-view", render),
    s.on("thread", render),
    s.on("work", render),
    s.on("question", render),
    s.on("lens", render),
    s.on("turn-tick", () => {
      const t = s.turn;
      const timeEl = stackEl.querySelector(".ft4-case-time");
      if (timeEl && t && t.active) timeEl.textContent = fmtDuration(t.workedSeconds);
    }),
  ];

  render();
  keeper.jumpToLatest();
  requestAnimationFrame(() => { keeper.jumpToLatest(); jump.hidden = true; });
  setTimeout(() => { if (keeper.atBottom) keeper.jumpToLatest(); jump.hidden = keeper.atBottom; }, 420);

  return {
    el,
    destroy() {
      un.forEach((u) => u());
      composer.destroy();
      selectorRow.destroy();
    },
  };
}
