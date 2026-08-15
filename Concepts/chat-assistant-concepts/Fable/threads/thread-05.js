// Fable — Thread 05 "Longhand".
// Design thesis: the conversation is one continuous manuscript. No bubbles, no
// cards: voices alternate as indented prose (your lines set in the accent ink),
// separated by asterism rules. System events are centered typographic rules;
// live work is a running marginal line under the latest paragraph. Questions
// arrive as an interview set into the manuscript — italic prompts answered in
// place — introduced by a preparing line that becomes the interview and later a
// closing line (video 4's lifecycle, in type instead of chrome).
// Motion thesis: handwriting pace — content lengthens the page; the only motion
// is the page growing and rules drawing themselves in; no lateral movement.

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
  ensureCss("threads/thread-05.css");
  const s = ctx.store;

  const el = ctx.el;
  el.classList.add("fwt-column", "ft5-root");
  el.innerHTML = `
    <div class="fwt-scrollwrap">
      <div class="fwt-scroll pm-scroll ft5-scroll"><div class="ft5-page"></div></div>
    </div>
    <div class="fwt-composer-region ft5-composer-region"></div>`;

  const scrollEl = el.querySelector(".ft5-scroll");
  const scrollWrap = el.querySelector(".fwt-scrollwrap");
  const pageEl = el.querySelector(".ft5-page");
  const composerRegion = el.querySelector(".ft5-composer-region");
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
      pageEl.replaceChildren();
      const slice = transcriptSlice();
      if (slice.olderCount > 0) {
        const older = document.createElement("div");
        older.className = "fwt-older";
        older.innerHTML = `<span>${slice.olderCount} earlier passages remain on previous leaves</span>`;
        const btn = document.createElement("button");
        btn.textContent = "Turn back the page";
        btn.addEventListener("click", () => slice.loadOlder());
        older.appendChild(btn);
        pageEl.appendChild(older);
      }
      slice.messages.forEach((m, i) => {
        pageEl.appendChild(renderPassage(m));
        if (i < slice.messages.length - 1) pageEl.appendChild(asterism());
      });
      renderRunningWork();
      renderInterview();
    });
    renderLensBar();
    keeper.followIfAtBottom();
    requestAnimationFrame(() => { jump.hidden = keeper.atBottom; });
  }

  function asterism() {
    const d = document.createElement("div");
    d.className = "ft5-asterism";
    d.setAttribute("aria-hidden", "true");
    d.innerHTML = "<span>·</span><span>·</span><span>·</span>";
    return d;
  }

  function renderPassage(m) {
    const passage = document.createElement("article");
    passage.className = "ft5-passage";
    passage.dataset.mid = m.id;
    passage.dataset.role = m.role;

    const mark = lensMark(m);
    if (mark || m.redirect || m.interrupted) {
      const flags = document.createElement("div");
      flags.className = "ft5-flags";
      if (mark) flags.innerHTML += `<span class="fwt-lens-flag" data-op="${mark}">${mark === "mute" ? "Muted" : mark === "focus" ? "Focused" : mark === "subcompact" ? "Subcompacted" : "Pending"}</span>`;
      if (m.redirect) flags.innerHTML += `<span class="fwt-redirect-flag">redirect</span>`;
      if (m.interrupted) flags.innerHTML += `<span class="fwt-redirect-flag">stopped</span>`;
      passage.appendChild(flags);
    }

    const prose = document.createElement("div");
    prose.className = "ft5-prose";
    const long = isLongMessage(m);
    const expanded = isExpanded(m);
    prose.innerHTML = long && !expanded ? `<p>${escapeHtml(previewText(m)).replace(/\n/g, "<br>")}</p>` : bodyHtml(m);
    passage.appendChild(prose);

    if (long) {
      const fold = document.createElement("button");
      fold.className = "ft5-fold";
      fold.textContent = expanded ? "Close the passage" : "Read the whole passage";
      fold.addEventListener("click", () => keeper.preserve(() => s.toggleMessageExpanded(m.id)));
      passage.appendChild(fold);
    }

    for (const g of activityGroups(m)) passage.appendChild(renderRecordRule(m, g));

    const actions = document.createElement("div");
    actions.className = "ft5-actions";
    const rt = m.runtime || {};
    const canEdit = m.role === "user" && m.eligibleForEdit && isLastUser(m);
    const mk = (t, fn) => { const b = document.createElement("button"); b.textContent = t; b.addEventListener("click", fn); return b; };
    actions.append(
      mk("Copy", () => copyMessage(m)),
      ...(canEdit ? [mk("Edit", () => { s.setDraft(m.body); s.addReceipt({ kind: "edit", title: "Editing your message", detail: "The manuscript keeps the original passage." }); })] : []),
      meta(`${rt.provider || ""} · ${rt.model || ""}`),
      meta(workedLabel(false, rt.workedSeconds)),
      meta(fmtTime(m.sentAt)),
      mk("More Info", (e) => openMoreInfo(e.currentTarget, m)),
      Object.assign(mk("Context", (e) => openMessageOps(e.currentTarget, m)), { className: "ft5-ops" }),
    );
    passage.appendChild(actions);
    return passage;
  }

  function meta(t) { const sp = document.createElement("span"); sp.className = "ft5-meta"; sp.textContent = t || ""; return sp; }
  function isLastUser(m) {
    const msgs = s.thread.messages;
    for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === "user") return msgs[i].id === m.id;
    return false;
  }

  // Historical work as a centered record rule that opens into set text.
  function renderRecordRule(m, g) {
    const wrap = document.createElement("div");
    wrap.className = "ft5-record";
    const key = m.id + ":" + g.kind;
    const open = !!s.view.expandedGroups[key];
    const head = document.createElement("button");
    head.className = "ft5-rule-line";
    const label = g.kind === "activity" ? `${g.group.compactLabel} — ${fmtDuration(g.group.workedSeconds)}`
      : g.kind === "thoughts" ? "thought summary"
      : "questions answered";
    head.innerHTML = `<span class="ft5-rule" aria-hidden="true"></span><span class="ft5-rule-text">${escapeHtml(label)}</span><span class="ft5-rule" aria-hidden="true"></span>`;
    head.addEventListener("click", () => keeper.preserve(() => s.toggleGroupExpanded(key)));
    wrap.appendChild(head);
    if (open) {
      const sheet = document.createElement("div");
      sheet.className = "ft5-record-sheet";
      if (g.kind === "activity") {
        for (const st of g.group.stages) {
          sheet.innerHTML += `<p class="ft5-record-line"><em>${escapeHtml(st.kind)}</em> — ${escapeHtml(st.label)}${st.added != null ? ` (+${st.added} −${st.removed})` : ""}, ${fmtDuration(st.durationSeconds)}.</p>`;
        }
      } else if (g.kind === "thoughts") {
        for (const seg of g.segments) sheet.innerHTML += `<p class="ft5-record-line">${escapeHtml(seg.summary)}</p>`;
      } else {
        for (const qa of g.record.questionsAndAnswers) {
          sheet.innerHTML += `<p class="ft5-record-line"><em>${escapeHtml(qa.question)}</em> — ${escapeHtml(qa.answer)}.</p>`;
        }
      }
      wrap.appendChild(sheet);
    }
    return wrap;
  }

  // ---------- running work (marginal running line + set-in work paragraphs) ----------
  function renderRunningWork() {
    const w = workCluster();
    if (w.isEmpty) return;
    const sec = document.createElement("section");
    sec.className = "ft5-running";

    const lt = liveTurn();
    if (lt) {
      const line = document.createElement("div");
      line.className = "ft5-rule-line ft5-rule-live";
      line.innerHTML = `<span class="ft5-rule" aria-hidden="true"></span><span class="ft5-rule-text">${escapeHtml(lt.summary.toLowerCase())} — <span class="ft5-live-time">${fmtDuration(lt.workedSeconds)}</span></span><span class="ft5-rule" aria-hidden="true"></span>`;
      sec.appendChild(line);
      // The manuscript writes the phase detail as an indented aside.
      if (lt.items.length) {
        const aside = document.createElement("p");
        aside.className = "ft5-live-aside";
        aside.innerHTML = lt.items.map((i) => escapeHtml(i.text) + (i.side ? ` (${escapeHtml(i.side)})` : "")).join("; ") + ".";
        sec.appendChild(aside);
      }
    }

    if (w.goal || w.todo || w.subagents || w.diffs.length) {
      const open = s.view.expandedGroups["ft5:workset"] !== false;
      const head = document.createElement("button");
      head.className = "ft5-rule-line";
      const bits = [];
      if (w.goal) bits.push(`the goal is ${w.goal.status}`);
      if (w.todo) bits.push(`${w.todo.items.filter((i) => i.state === "complete").length} of ${w.todo.items.length} tasks done`);
      if (w.subagents) bits.push(`${w.subagents.counts.working} hands at work`);
      if (w.diffs.length) bits.push(`${w.diffs.reduce((n, d) => n + d.files.length, 0)} files changed`);
      head.innerHTML = `<span class="ft5-rule" aria-hidden="true"></span><span class="ft5-rule-text">${escapeHtml(bits.join("; "))}</span><span class="ft5-rule" aria-hidden="true"></span>`;
      head.addEventListener("click", () => { s.view.expandedGroups["ft5:workset"] = !open; s.emit("transcript-view"); });
      sec.appendChild(head);

      if (open) {
        const set = document.createElement("div");
        set.className = "ft5-workset";
        if (w.goal) {
          const p = document.createElement("p");
          p.className = "ft5-work-par";
          p.dataset.status = w.goal.status;
          const phase = w.goal.phases ? ` Phase ${(w.goal.phaseIndex || 0) + 1} of ${w.goal.phases.length}, ${w.goal.phases[w.goal.phaseIndex || 0].toLowerCase()}.` : "";
          const replan = w.goal.replanApplied ? " The plan was just updated and revalidated." : "";
          p.innerHTML = `<strong>${escapeHtml(w.goal.title)}</strong> — ${escapeHtml(w.goal.objective)}${escapeHtml(phase)}${escapeHtml(replan)} `;
          const ctrl = document.createElement("span");
          ctrl.className = "ft5-work-ctrl";
          const btn = (t, ok, fn) => { const b = document.createElement("button"); b.textContent = t; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
          ctrl.append(
            btn("pause", w.goal.status === "running", () => s.setGoalStatus("Paused")),
            btn("resume", w.goal.status === "paused", () => s.setGoalStatus("Running")),
            btn("stop", ["running", "paused", "blocked"].includes(w.goal.status), () => s.setGoalStatus("Stopped")),
          );
          p.appendChild(ctrl);
          set.appendChild(p);
          if (w.goal.blocked) {
            set.innerHTML += `<p class="ft5-work-par ft5-work-blocked"><strong>Held:</strong> ${escapeHtml(w.goal.blocked.cause)}. Next safe action — ${escapeHtml(w.goal.blocked.nextSafeAction)}.</p>`;
          }
        }
        if (w.todo) {
          const p = document.createElement("p");
          p.className = "ft5-work-par";
          p.innerHTML = w.todo.items.map((i) => `<span class="ft5-task" data-state="${i.state}">${escapeHtml(i.label)}<sup>${escapeHtml(TODO_STATE_LABELS[i.state] || i.state)}</sup></span>`).join("; ") + ".";
          set.appendChild(p);
        }
        if (w.subagents) {
          const p = document.createElement("p");
          p.className = "ft5-work-par";
          p.innerHTML = w.subagents.agents.map((a) => `<span class="ft5-hand" data-status="${a.status}"><strong>${escapeHtml(a.name)}</strong>, ${escapeHtml(a.currentActivity.toLowerCase())}</span>`).join("; ") + ".";
          set.appendChild(p);
        }
        for (const d of w.diffs) {
          const p = document.createElement("button");
          p.className = "ft5-work-par ft5-work-diff";
          p.innerHTML = `${escapeHtml(d.label)}: ` + d.files.map((f) => `${escapeHtml(f.path)} (+${f.added} −${f.removed})`).join(", ") + ".";
          p.addEventListener("click", () => s.openArtifact("art-diff"));
          set.appendChild(p);
        }
        sec.appendChild(set);
      }
    }
    pageEl.appendChild(sec);
  }

  // ---------- the interview ----------
  function renderInterview() {
    const { active } = questionnaireState();
    if (!active) return;
    const sec = document.createElement("section");
    sec.className = "ft5-interview";

    if (active.status === "preparing") {
      sec.innerHTML = `<div class="ft5-rule-line ft5-rule-live"><span class="ft5-rule" aria-hidden="true"></span><span class="ft5-rule-text">gathering questions…</span><span class="ft5-rule" aria-hidden="true"></span></div>`;
      pageEl.appendChild(sec);
      return;
    }
    if (active.status === "submitting") {
      sec.innerHTML = `<div class="ft5-rule-line ft5-rule-live"><span class="ft5-rule" aria-hidden="true"></span><span class="ft5-rule-text">setting your answers into the record…</span><span class="ft5-rule" aria-hidden="true"></span></div>`;
      pageEl.appendChild(sec);
      return;
    }

    const q = active.questions[active.currentQuestionIndex];
    const head = document.createElement("div");
    head.className = "ft5-interview-head";
    head.innerHTML = `<span class="ft5-interview-title">${escapeHtml(active.title)}</span><span class="ft5-interview-count">${active.currentQuestionIndex + 1} of ${active.questions.length}</span>`;
    sec.appendChild(head);

    const stage = document.createElement("div");
    stage.className = "ft5-interview-stage";
    const prompt = document.createElement("p");
    prompt.className = "ft5-interview-q";
    prompt.textContent = q.prompt;
    stage.appendChild(prompt);

    if (q.kind === "freeform") {
      const ta = document.createElement("textarea");
      ta.className = "ft5-interview-freeform pm-scroll";
      ta.placeholder = "Answer in your own words";
      ta.value = active.freeform[q.id] || "";
      ta.addEventListener("change", () => s.answerQuestion(active.id, q.id, ta.value));
      stage.appendChild(ta);
    } else {
      const list = document.createElement("div");
      list.className = "ft5-interview-answers";
      for (const opt of q.options) {
        const sel = (q.selected || []).includes(opt);
        const a = document.createElement("button");
        a.className = "ft5-interview-a";
        a.dataset.selected = String(sel);
        a.innerHTML = `<span class="ft5-a-dash" aria-hidden="true">—</span><span>${escapeHtml(opt)}</span>`;
        a.addEventListener("click", () => s.answerQuestion(active.id, q.id, opt, { toggle: q.kind === "multi select" }));
        list.appendChild(a);
      }
      stage.appendChild(list);
    }
    if (active.skipped[q.id]) {
      const sk = document.createElement("p");
      sk.className = "ft5-interview-skipped";
      sk.innerHTML = `<em>Passed over for now.</em> `;
      const undo = document.createElement("button");
      undo.textContent = "Return to it";
      undo.addEventListener("click", () => s.unskipQuestion(active.id, q.id));
      sk.appendChild(undo);
      stage.appendChild(sk);
    }
    sec.appendChild(stage);

    const nav = document.createElement("div");
    nav.className = "ft5-interview-nav";
    const mkb = (t, ok, fn, cls) => { const b = document.createElement("button"); b.className = cls || ""; b.textContent = t; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
    const isLast = active.currentQuestionIndex === active.questions.length - 1;
    nav.append(
      mkb("previous", active.currentQuestionIndex > 0, () => s.navigateQuestion(active.id, active.currentQuestionIndex - 1)),
      mkb("pass over", !active.skipped[q.id], () => s.skipQuestion(active.id, q.id)),
      mkb("abandon the interview", true, () => s.cancelQuestionnaire(active.id), "ft5-interview-cancel"),
      mkb(isLast ? "set the answers" : "next", true, () => {
        if (!isLast) return s.navigateQuestion(active.id, active.currentQuestionIndex + 1);
        const res = s.submitQuestionnaire(active.id);
        if (!res.ok && res.missing) {
          const firstMissing = active.questions.findIndex((x) => res.missing.includes(x.id));
          stage.insertAdjacentHTML("afterbegin", `<p class="ft5-interview-error">Some required questions still wait for an answer or an explicit pass.</p>`);
          if (firstMissing >= 0) setTimeout(() => s.navigateQuestion(active.id, firstMissing), 900);
        }
      }, "ft5-interview-primary"),
    );
    sec.appendChild(nav);
    pageEl.appendChild(sec);
  }

  function renderLensBar() {
    const pending = Object.values(s.lensState.selections).filter((v) => v === "subcompact-pending").length;
    lensBar.replaceChildren();
    if (!pending) return;
    const bar = document.createElement("div");
    bar.className = "fwt-lens-applybar";
    bar.innerHTML = `${icon("compress", 13)}<span>${pending} passages marked for Subcompact</span>`;
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
      const timeEl = pageEl.querySelector(".ft5-live-time");
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
