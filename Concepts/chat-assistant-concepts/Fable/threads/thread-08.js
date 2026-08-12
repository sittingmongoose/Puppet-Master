// Fable — Thread 08 "Choreograph".
// Design thesis: the transcript is a stage and every element has an entrance.
// Messages arrive on an arc with anticipation and settle; the active turn wears
// a satellite — a small disc that circles its edge while work runs, carries the
// working summary, and docks into the finished message as its "worked" badge.
// Questions play as a dealt hand: cards deal in from the bottom edge, answered
// cards tuck into a stack chip, and the stack fans back open for review.
// Motion thesis: authored arcs with anticipation/settle; the satellite's orbit
// is the single continuous motion and only while work is truly active.

import { store } from "../shared/store.js";
import { icon } from "../shared/icons.js";
import { ensureCss } from "../shared/contracts.js";
import { escapeHtml } from "../shared/popup.js";
import {
  transcriptSlice, isLongMessage, isExpanded, previewText, lensMark, copyMessage,
  workCluster, createScrollKeeper, questionnaireState, activityGroups, bodyHtml,
} from "../shared/thread-common.js";
import { createComposer, createSelectorRow, createDecisionStack, openMoreInfo, openMessageOps } from "../shared/components.js";
import { fmtDuration, fmtTime, workedLabel, JUMP_TO_LATEST, QUESTIONNAIRE_ACTIONS, TODO_STATE_LABELS } from "../shared/strings.js";

export function createThread(ctx) {
  ensureCss("threads/thread-base.css");
  ensureCss("threads/thread-08.css");
  const s = ctx.store;

  const el = ctx.el;
  el.classList.add("fwt-column", "ft8-root");
  el.innerHTML = `
    <div class="fwt-scrollwrap">
      <div class="fwt-scroll pm-scroll ft8-scroll"><div class="ft8-stagefloor"></div></div>
    </div>
    <div class="fwt-composer-region ft8-composer-region"></div>`;

  const scrollEl = el.querySelector(".ft8-scroll");
  const scrollWrap = el.querySelector(".fwt-scrollwrap");
  const floorEl = el.querySelector(".ft8-stagefloor");
  const composerRegion = el.querySelector(".ft8-composer-region");
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
      floorEl.replaceChildren();
      const slice = transcriptSlice();
      if (slice.olderCount > 0) {
        const older = document.createElement("div");
        older.className = "fwt-older";
        older.innerHTML = `<span>${slice.olderCount} earlier scenes wait in the wings</span>`;
        const btn = document.createElement("button");
        btn.textContent = "Call them back";
        btn.addEventListener("click", () => slice.loadOlder());
        older.appendChild(btn);
        floorEl.appendChild(older);
      }
      slice.messages.forEach((m, i) => floorEl.appendChild(renderFigure(m, i)));
      renderActiveTurn();
      renderDealtHand();
    });
    renderLensBar();
    keeper.followIfAtBottom();
    requestAnimationFrame(() => { jump.hidden = keeper.atBottom; });
  }

  function renderFigure(m, i) {
    const fig = document.createElement("article");
    fig.className = "ft8-figure";
    fig.dataset.mid = m.id;
    fig.dataset.role = m.role;
    fig.style.setProperty("--ft8-delay", `${Math.min(i * 16, 120)}ms`);

    const mark = lensMark(m);
    if (mark || m.redirect || m.interrupted) {
      const flags = document.createElement("div");
      flags.className = "ft8-flags";
      if (mark) flags.innerHTML += `<span class="fwt-lens-flag" data-op="${mark}">${mark === "mute" ? "Muted" : mark === "focus" ? "Focused" : mark === "subcompact" ? "Subcompacted" : "Pending"}</span>`;
      if (m.redirect) flags.innerHTML += `<span class="fwt-redirect-flag">redirect</span>`;
      if (m.interrupted) flags.innerHTML += `<span class="fwt-redirect-flag">stopped</span>`;
      fig.appendChild(flags);
    }

    const card = document.createElement("div");
    card.className = "ft8-card";

    const prose = document.createElement("div");
    prose.className = "ft8-prose";
    const long = isLongMessage(m);
    const expanded = isExpanded(m);
    prose.innerHTML = long && !expanded ? `<p>${escapeHtml(previewText(m)).replace(/\n/g, "<br>")}</p>` : bodyHtml(m);
    card.appendChild(prose);

    if (long) {
      const fold = document.createElement("button");
      fold.className = "ft8-fold";
      fold.textContent = expanded ? "Exit long form" : "Full performance";
      fold.addEventListener("click", () => keeper.preserve(() => s.toggleMessageExpanded(m.id)));
      card.appendChild(fold);
    }

    // Docked satellite badge on completed assistant turns with recorded work.
    const groups = activityGroups(m);
    if (m.role === "assistant" && (groups.length || m.activitySummary)) {
      const dock = document.createElement("button");
      dock.className = "ft8-docked";
      const key = m.id + ":dock";
      const open = !!s.view.expandedGroups[key];
      const label = groups.length && groups[0].kind === "activity"
        ? `${groups[0].group.compactLabel} · ${fmtDuration(groups[0].group.workedSeconds)}`
        : (m.activitySummary || "Worked");
      dock.innerHTML = `<span class="ft8-satellite ft8-satellite-docked" aria-hidden="true"></span><span>${escapeHtml(label)}</span>${groups.length ? icon(open ? "chevronUp" : "chevronDown", 10) : ""}`;
      if (groups.length) dock.addEventListener("click", () => keeper.preserve(() => s.toggleGroupExpanded(key)));
      card.appendChild(dock);
      if (open && groups.length) {
        const sheet = document.createElement("div");
        sheet.className = "ft8-dock-sheet";
        for (const g of groups) {
          if (g.kind === "activity") {
            for (const st of g.group.stages) {
              sheet.innerHTML += `<div class="ft8-dock-line"><span class="ft8-dock-kind">${escapeHtml(st.kind)}</span><span>${escapeHtml(st.label)}</span><span class="ft8-dock-side">${st.added != null ? `+${st.added} −${st.removed}` : fmtDuration(st.durationSeconds)}</span></div>`;
            }
          } else if (g.kind === "thoughts") {
            for (const seg of g.segments) sheet.innerHTML += `<p class="ft8-dock-thought">${escapeHtml(seg.summary)}</p>`;
          } else {
            for (const qa of g.record.questionsAndAnswers) sheet.innerHTML += `<div class="ft8-dock-line"><span class="ft8-dock-kind">Q</span><span>${escapeHtml(qa.question)} — <strong>${escapeHtml(qa.answer)}</strong></span></div>`;
          }
        }
        card.appendChild(sheet);
      }
    }
    fig.appendChild(card);

    const actions = document.createElement("div");
    actions.className = "ft8-actions";
    const rt = m.runtime || {};
    const canEdit = m.role === "user" && m.eligibleForEdit && isLastUser(m);
    const mk = (t, fn) => { const b = document.createElement("button"); b.textContent = t; b.addEventListener("click", fn); return b; };
    actions.append(
      mk("Copy", () => copyMessage(m)),
      ...(canEdit ? [mk("Edit", () => { s.setDraft(m.body); s.addReceipt({ kind: "edit", title: "Editing your message", detail: "The original stays on stage." }); })] : []),
      meta(rt.provider), meta(rt.model), meta(workedLabel(false, rt.workedSeconds)), meta(fmtTime(m.sentAt)),
      mk("More Info", (e) => openMoreInfo(e.currentTarget, m)),
      Object.assign(mk("Context", (e) => openMessageOps(e.currentTarget, m)), { className: "ft8-ops" }),
    );
    fig.appendChild(actions);
    return fig;
  }

  function meta(t) { const sp = document.createElement("span"); sp.className = "ft8-meta"; sp.textContent = t || ""; return sp; }
  function isLastUser(m) {
    const msgs = s.thread.messages;
    for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === "user") return msgs[i].id === m.id;
    return false;
  }

  // ---------- active turn with orbiting satellite ----------
  function renderActiveTurn() {
    const w = workCluster();
    if (!w.turn && w.isEmpty) return;
    const scene = document.createElement("section");
    scene.className = "ft8-active";

    if (w.turn) {
      const orbit = document.createElement("div");
      orbit.className = "ft8-orbit-frame";
      orbit.dataset.redirected = String(!!w.turn.redirected);
      orbit.innerHTML = `
        <span class="ft8-orbit-path" aria-hidden="true"><span class="ft8-satellite" aria-hidden="true"></span></span>
        <span class="ft8-orbit-summary">${escapeHtml(w.turn.summary)}</span>
        <span class="ft8-orbit-time">${fmtDuration(w.turn.workedSeconds)}</span>`;
      scene.appendChild(orbit);
    }

    if (w.goal || w.todo || w.subagents || w.diffs.length) {
      const troupe = document.createElement("div");
      troupe.className = "ft8-troupe";
      const open = s.view.expandedGroups["ft8:troupe"] !== false;

      const head = document.createElement("button");
      head.className = "ft8-troupe-head";
      const bits = [];
      if (w.goal) bits.push(`Goal ${w.goal.status}`);
      if (w.todo) bits.push(`${w.todo.items.filter((i) => i.state === "complete").length}/${w.todo.items.length} tasks`);
      if (w.subagents) bits.push(`${w.subagents.counts.working} performing`);
      if (w.diffs.length) bits.push(`${w.diffs.reduce((n, d) => n + d.files.length, 0)} files`);
      head.innerHTML = `${icon("crew", 12)}<span>${escapeHtml(bits.join(" · "))}</span>${icon(open ? "chevronDown" : "chevronUp", 10)}`;
      head.addEventListener("click", () => { s.view.expandedGroups["ft8:troupe"] = !open; s.emit("transcript-view"); });
      troupe.appendChild(head);

      if (open) {
        const body = document.createElement("div");
        body.className = "ft8-troupe-body";
        if (w.goal) {
          const g = document.createElement("div");
          g.className = "ft8-troupe-goal";
          g.dataset.status = w.goal.status;
          g.innerHTML = `<span class="ft8-goal-badge">${escapeHtml(w.goal.status)}</span><span class="ft8-goal-name">${escapeHtml(w.goal.title)}</span>`;
          const ctrl = document.createElement("span");
          ctrl.className = "ft8-goal-ctrl";
          const btn = (t, ok, fn) => { const b = document.createElement("button"); b.textContent = t; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
          ctrl.append(
            btn("Pause", w.goal.status === "running", () => s.setGoalStatus("Paused")),
            btn("Resume", w.goal.status === "paused", () => s.setGoalStatus("Running")),
            btn("Stop", ["running", "paused", "blocked"].includes(w.goal.status), () => s.setGoalStatus("Stopped")),
          );
          g.appendChild(ctrl);
          body.appendChild(g);
          if (w.goal.blocked) {
            body.innerHTML += `<div class="ft8-troupe-blocked">${escapeHtml(w.goal.blocked.cause)} — next safe: ${escapeHtml(w.goal.blocked.nextSafeAction)}</div>`;
          }
        }
        if (w.subagents) {
          const row = document.createElement("div");
          row.className = "ft8-dancers";
          for (const a of w.subagents.agents) {
            const d = document.createElement("div");
            d.className = "ft8-dancer";
            d.dataset.status = a.status;
            d.title = `${a.task} — ${a.currentActivity}${a.route ? ` · ${a.route}` : ""}`;
            d.innerHTML = `<span class="ft8-dancer-disc" aria-hidden="true"></span><span class="ft8-dancer-name">${escapeHtml(a.name)}</span><span class="ft8-dancer-act">${escapeHtml(a.currentActivity)}</span>`;
            row.appendChild(d);
          }
          body.appendChild(row);
        }
        if (w.todo) {
          const steps = document.createElement("div");
          steps.className = "ft8-steps";
          for (const item of w.todo.items) {
            const st = document.createElement("span");
            st.className = "ft8-step";
            st.dataset.state = item.state;
            st.title = `${TODO_STATE_LABELS[item.state] || item.state} — ${item.label}`;
            steps.appendChild(st);
          }
          body.appendChild(steps);
        }
        for (const d of w.diffs) {
          const line = document.createElement("button");
          line.className = "ft8-troupe-diff";
          line.innerHTML = `${icon("diff", 11)}<span>${escapeHtml(d.label)}</span>`;
          line.addEventListener("click", () => s.openArtifact("art-diff"));
          body.appendChild(line);
        }
        troupe.appendChild(body);
      }
      scene.appendChild(troupe);
    }
    floorEl.appendChild(scene);
  }

  // ---------- dealt-hand questionnaire ----------
  function renderDealtHand() {
    const { active } = questionnaireState();
    if (!active) return;
    const hand = document.createElement("section");
    hand.className = "ft8-hand";

    if (active.status === "preparing" || active.status === "submitting") {
      hand.innerHTML = `<div class="ft8-deal-note"><span class="ft8-satellite" aria-hidden="true"></span><span>${escapeHtml(active.status === "preparing" ? "Dealing questions…" : "Collecting the hand…")}</span></div>`;
      floorEl.appendChild(hand);
      return;
    }

    const reviewing = s.view.expandedGroups["ft8:fan"] === active.id;
    const q = active.questions[active.currentQuestionIndex];
    const answeredCount = active.questions.filter((x) => (x.selected && x.selected.length) || active.skipped[x.id]).length;

    const head = document.createElement("div");
    head.className = "ft8-hand-head";
    head.innerHTML = `<span class="ft8-hand-title">${escapeHtml(active.title)}</span>`;
    const stackChip = document.createElement("button");
    stackChip.className = "ft8-stack-chip";
    stackChip.innerHTML = `${icon("copy", 11)}<span>${answeredCount} in the stack</span>${icon(reviewing ? "chevronDown" : "chevronUp", 10)}`;
    stackChip.addEventListener("click", () => { s.view.expandedGroups["ft8:fan"] = reviewing ? null : active.id; s.emit("transcript-view"); });
    head.appendChild(stackChip);
    hand.appendChild(head);

    if (reviewing) {
      const fan = document.createElement("div");
      fan.className = "ft8-fan";
      active.questions.forEach((qq, i) => {
        const c = document.createElement("button");
        c.className = "ft8-fan-card";
        c.dataset.state = active.skipped[qq.id] ? "skipped" : (qq.selected && qq.selected.length) ? "answered" : "open";
        c.style.setProperty("--fan-i", String(i));
        c.innerHTML = `<span class="ft8-fan-num">${i + 1}</span><span class="ft8-fan-q">${escapeHtml(qq.prompt)}</span><span class="ft8-fan-a">${escapeHtml(active.skipped[qq.id] ? "Skipped" : qq.kind === "freeform" ? (active.freeform[qq.id] || "—") : (qq.selected || []).join(", ") || "—")}</span>`;
        c.addEventListener("click", () => { s.view.expandedGroups["ft8:fan"] = null; s.navigateQuestion(active.id, i); });
        fan.appendChild(c);
      });
      hand.appendChild(fan);
      const nav = document.createElement("div");
      nav.className = "ft8-hand-nav";
      const cancel = document.createElement("button");
      cancel.className = "ft8-navbtn ft8-navcancel";
      cancel.textContent = QUESTIONNAIRE_ACTIONS.cancel;
      cancel.addEventListener("click", () => s.cancelQuestionnaire(active.id));
      const submit = document.createElement("button");
      submit.className = "pm-btn";
      submit.dataset.variant = "primary";
      submit.textContent = QUESTIONNAIRE_ACTIONS.submit;
      submit.addEventListener("click", () => {
        const res = s.submitQuestionnaire(active.id);
        if (!res.ok) hand.insertAdjacentHTML("beforeend", `<div class="ft8-hand-error">Required cards still open — answer or skip them.</div>`);
      });
      nav.append(cancel, submit);
      hand.appendChild(nav);
    } else {
      const card = document.createElement("div");
      card.className = "ft8-deal-card";
      card.innerHTML = `<div class="ft8-deal-count">Card ${active.currentQuestionIndex + 1} of ${active.questions.length}</div>`;
      const prompt = document.createElement("p");
      prompt.className = "ft8-deal-prompt";
      prompt.textContent = q.prompt;
      card.appendChild(prompt);

      if (q.kind === "freeform") {
        const ta = document.createElement("textarea");
        ta.className = "ft8-deal-freeform pm-scroll";
        ta.placeholder = "Improvise";
        ta.value = active.freeform[q.id] || "";
        ta.addEventListener("change", () => s.answerQuestion(active.id, q.id, ta.value));
        card.appendChild(ta);
      } else {
        for (const opt of q.options) {
          const sel = (q.selected || []).includes(opt);
          const row = document.createElement("button");
          row.className = "ft8-deal-opt";
          row.dataset.selected = String(sel);
          row.innerHTML = `<span class="ft8-deal-spot" aria-hidden="true"></span><span>${escapeHtml(opt)}</span>`;
          row.addEventListener("click", () => s.answerQuestion(active.id, q.id, opt, { toggle: q.kind === "multi select" }));
          card.appendChild(row);
        }
      }
      if (active.skipped[q.id]) {
        const sk = document.createElement("div");
        sk.className = "ft8-deal-skipped";
        sk.innerHTML = `<span>Tucked away unanswered.</span>`;
        const undo = document.createElement("button");
        undo.textContent = "Bring it back";
        undo.addEventListener("click", () => s.unskipQuestion(active.id, q.id));
        sk.appendChild(undo);
        card.appendChild(sk);
      }

      const nav = document.createElement("div");
      nav.className = "ft8-hand-nav";
      const mkb = (t, ok, fn, cls) => { const b = document.createElement("button"); b.className = "ft8-navbtn " + (cls || ""); b.textContent = t; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
      const isLast = active.currentQuestionIndex === active.questions.length - 1;
      nav.append(
        mkb(QUESTIONNAIRE_ACTIONS.back, active.currentQuestionIndex > 0, () => s.navigateQuestion(active.id, active.currentQuestionIndex - 1)),
        mkb(QUESTIONNAIRE_ACTIONS.skip, !active.skipped[q.id], () => s.skipQuestion(active.id, q.id)),
        mkb(QUESTIONNAIRE_ACTIONS.cancel, true, () => s.cancelQuestionnaire(active.id), "ft8-navcancel"),
      );
      const fwd = document.createElement("button");
      fwd.className = "pm-btn";
      fwd.dataset.variant = "primary";
      fwd.textContent = isLast ? "Fan out and review" : QUESTIONNAIRE_ACTIONS.next;
      fwd.addEventListener("click", () => {
        if (isLast) { s.view.expandedGroups["ft8:fan"] = active.id; s.emit("transcript-view"); }
        else s.navigateQuestion(active.id, active.currentQuestionIndex + 1);
      });
      nav.appendChild(fwd);
      card.appendChild(nav);
      hand.appendChild(card);
    }
    floorEl.appendChild(hand);
  }

  function renderLensBar() {
    const pending = Object.values(s.lensState.selections).filter((v) => v === "subcompact-pending").length;
    lensBar.replaceChildren();
    if (!pending) return;
    const bar = document.createElement("div");
    bar.className = "fwt-lens-applybar";
    bar.innerHTML = `${icon("compress", 13)}<span>${pending} scenes marked for Subcompact</span>`;
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
      const timeEl = floorEl.querySelector(".ft8-orbit-time");
      if (timeEl && t && t.active) timeEl.textContent = fmtDuration(t.workedSeconds);
      const sum = floorEl.querySelector(".ft8-orbit-summary");
      if (sum && t && t.active && sum.textContent !== t.summary) sum.textContent = t.summary;
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
