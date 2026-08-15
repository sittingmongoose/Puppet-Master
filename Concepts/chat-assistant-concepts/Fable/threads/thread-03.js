// Fable — Thread 03 "Ledgerline".
// Design thesis: the conversation is a ruled ledger. Every message is an entry
// on its own rule with a structural time gutter at the left; work appears as
// indented postings beneath the turn that opened them, and completed work
// reconciles into one balanced line. Questions are a form ledger — numbered
// lines with an answer column, filled in place.
// Motion thesis: entries unfold from their rule line (a vertical unfurl with a
// settle); postings tick in one by one; reconciliation compresses postings into
// their summary with a single closing movement.

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
  ensureCss("threads/thread-03.css");
  const s = ctx.store;

  const el = ctx.el;
  el.classList.add("fwt-column", "ft3-root");
  el.innerHTML = `
    <div class="fwt-scrollwrap">
      <div class="fwt-scroll pm-scroll ft3-scroll"><div class="ft3-ledger"></div></div>
    </div>
    <div class="fwt-composer-region ft3-composer-region"></div>`;

  const scrollEl = el.querySelector(".ft3-scroll");
  const scrollWrap = el.querySelector(".fwt-scrollwrap");
  const ledgerEl = el.querySelector(".ft3-ledger");
  const composerRegion = el.querySelector(".ft3-composer-region");
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
      ledgerEl.replaceChildren();
      const slice = transcriptSlice();
      if (slice.olderCount > 0) {
        const older = document.createElement("div");
        older.className = "fwt-older";
        older.innerHTML = `<span>${slice.olderCount} earlier entries on prior pages — search reads them all</span>`;
        const btn = document.createElement("button");
        btn.textContent = "Turn back";
        btn.addEventListener("click", () => slice.loadOlder());
        older.appendChild(btn);
        ledgerEl.appendChild(older);
      }
      for (const m of slice.messages) ledgerEl.appendChild(renderEntry(m));
      renderPostings();
      renderFormLedger();
    });
    renderLensBar();
    keeper.followIfAtBottom();
    requestAnimationFrame(() => { jump.hidden = keeper.atBottom; });
  }

  function renderEntry(m) {
    const entry = document.createElement("article");
    entry.className = "ft3-entry";
    entry.dataset.mid = m.id;
    entry.dataset.role = m.role;

    const gutter = document.createElement("div");
    gutter.className = "ft3-gutter";
    gutter.innerHTML = `<span class="ft3-tick" aria-hidden="true"></span><time class="ft3-time">${fmtTime(m.sentAt)}</time>`;

    const body = document.createElement("div");
    body.className = "ft3-entry-body";

    const label = document.createElement("div");
    label.className = "ft3-entry-label";
    const mark = lensMark(m);
    label.innerHTML = `<span class="ft3-party">${m.role === "user" ? "You" : "Fable"}</span>` +
      (mark ? `<span class="fwt-lens-flag" data-op="${mark}">${mark === "mute" ? "Muted" : mark === "focus" ? "Focused" : mark === "subcompact" ? "Subcompacted" : "Subcompact pending"}</span>` : "") +
      (m.redirect ? `<span class="fwt-redirect-flag">${icon("swap", 10)}<span>redirect</span></span>` : "") +
      (m.interrupted ? `<span class="fwt-redirect-flag">stopped</span>` : "");
    body.appendChild(label);

    const prose = document.createElement("div");
    prose.className = "ft3-prose";
    const long = isLongMessage(m);
    const expanded = isExpanded(m);
    prose.innerHTML = long && !expanded ? `<p>${escapeHtml(previewText(m)).replace(/\n/g, "<br>")}</p>` : bodyHtml(m);
    body.appendChild(prose);

    if (long) {
      const fold = document.createElement("button");
      fold.className = "ft3-fold";
      fold.textContent = expanded ? "Fold entry" : "Unfold full entry";
      fold.addEventListener("click", () => keeper.preserve(() => s.toggleMessageExpanded(m.id)));
      body.appendChild(fold);
    }

    for (const g of activityGroups(m)) body.appendChild(renderReconciled(m, g));

    const actions = document.createElement("div");
    actions.className = "ft3-actions";
    const rt = m.runtime || {};
    const canEdit = m.role === "user" && m.eligibleForEdit && isLastUser(m);
    const mk = (t, fn) => { const b = document.createElement("button"); b.textContent = t; b.addEventListener("click", fn); return b; };
    actions.append(
      mk("Copy", () => copyMessage(m)),
      ...(canEdit ? [mk("Edit", () => { s.setDraft(m.body); s.addReceipt({ kind: "edit", title: "Editing your message", detail: "Original entry stays on its rule." }); })] : []),
      meta(rt.provider), meta(rt.model), meta(workedLabel(false, rt.workedSeconds)),
      mk("More Info", (e) => openMoreInfo(e.currentTarget, m)),
      Object.assign(mk("Context", (e) => openMessageOps(e.currentTarget, m)), { className: "ft3-ops" }),
    );
    body.appendChild(actions);

    entry.append(gutter, body);
    return entry;
  }

  function meta(t) { const sp = document.createElement("span"); sp.className = "ft3-meta"; sp.textContent = t || ""; return sp; }
  function isLastUser(m) {
    const msgs = s.thread.messages;
    for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === "user") return msgs[i].id === m.id;
    return false;
  }

  // Reconciled historical work — one balanced line that reopens into postings.
  function renderReconciled(m, g) {
    const wrap = document.createElement("div");
    wrap.className = "ft3-reconciled";
    const key = m.id + ":" + g.kind;
    const open = !!s.view.expandedGroups[key];
    const head = document.createElement("button");
    head.className = "ft3-balance";
    head.setAttribute("aria-expanded", String(open));
    const label = g.kind === "activity" ? `${g.group.compactLabel} — reconciled in ${fmtDuration(g.group.workedSeconds)}`
      : g.kind === "thoughts" ? `Thought summary on record`
      : `${(g.record.questionsAndAnswers || []).length} questions answered`;
    head.innerHTML = `<span class="ft3-balance-rule" aria-hidden="true"></span><span class="ft3-balance-text">${escapeHtml(label)}</span><span class="ft3-balance-rule" aria-hidden="true"></span>`;
    head.addEventListener("click", () => keeper.preserve(() => s.toggleGroupExpanded(key)));
    wrap.appendChild(head);
    if (open) {
      const sheet = document.createElement("div");
      sheet.className = "ft3-postings";
      if (g.kind === "activity") {
        for (const st of g.group.stages) sheet.appendChild(postingLine(st.kind, st.label, fmtDuration(st.durationSeconds), st));
      } else if (g.kind === "thoughts") {
        for (const seg of g.segments) {
          const p = document.createElement("p");
          p.className = "ft3-posting-thought";
          p.textContent = seg.summary;
          sheet.appendChild(p);
        }
      } else {
        for (const qa of g.record.questionsAndAnswers) {
          const line = document.createElement("div");
          line.className = "ft3-posting";
          line.innerHTML = `<span class="ft3-posting-kind">Q</span><span class="ft3-posting-label">${escapeHtml(qa.question)}</span><span class="ft3-posting-val">${escapeHtml(qa.answer)}</span>`;
          sheet.appendChild(line);
        }
      }
      wrap.appendChild(sheet);
    }
    return wrap;
  }

  function postingLine(kind, label, val, st) {
    const line = document.createElement("div");
    line.className = "ft3-posting";
    let value = val;
    if (st && st.added != null) value = `+${st.added} / −${st.removed}`;
    line.innerHTML = `<span class="ft3-posting-kind">${escapeHtml(kind)}</span><span class="ft3-posting-label">${escapeHtml(label)}</span><span class="ft3-posting-val">${escapeHtml(value)}</span>`;
    if (st && st.items && st.items.length) {
      const items = document.createElement("div");
      items.className = "ft3-posting-items";
      items.textContent = st.items.join(" · ");
      line.appendChild(items);
    }
    return line;
  }

  // ---------- live postings ----------
  function renderPostings() {
    const existing = ledgerEl.querySelector(".ft3-live");
    if (existing) existing.remove();
    const w = workCluster();
    if (w.isEmpty) return;

    const live = document.createElement("section");
    live.className = "ft3-live";
    live.setAttribute("aria-label", "Open postings");

    const heading = document.createElement("div");
    heading.className = "ft3-live-heading";
    heading.innerHTML = `<span>Open postings</span><span class="ft3-live-rule" aria-hidden="true"></span>`;
    live.appendChild(heading);

    const lt = liveTurn();
    if (lt) {
      const line = document.createElement("div");
      line.className = "ft3-posting ft3-posting-active";
      line.innerHTML = `<span class="ft3-posting-kind">turn</span><span class="ft3-posting-label">${escapeHtml(lt.summary)}<span class="ft3-caret" aria-hidden="true"></span></span><span class="ft3-posting-val ft3-live-time">${fmtDuration(lt.workedSeconds)}</span>`;
      live.appendChild(line);
      // Live items post beneath the turn line and reconcile away on phase change.
      for (const item of lt.items) {
        const il = document.createElement("div");
        il.className = "ft3-posting ft3-posting-liveitem";
        il.innerHTML = `<span class="ft3-posting-kind">${escapeHtml(lt.phaseKind.replace(/_/g, " "))}</span><span class="ft3-posting-label">${escapeHtml(item.text)}</span><span class="ft3-posting-val">${escapeHtml(item.side || "")}</span>`;
        live.appendChild(il);
      }
    }
    if (w.goal) {
      const line = document.createElement("div");
      line.className = "ft3-posting";
      line.dataset.goal = w.goal.status;
      const phaseTxt = w.goal.phases ? `, phase ${(w.goal.phaseIndex || 0) + 1} of ${w.goal.phases.length} (${w.goal.phases[w.goal.phaseIndex || 0].toLowerCase()})` : "";
      line.innerHTML = `<span class="ft3-posting-kind">goal</span><span class="ft3-posting-label">${escapeHtml(w.goal.title)} — ${escapeHtml(w.goal.status)}${escapeHtml(phaseTxt)}${w.goal.replanApplied ? ", replanned" : ""}</span><span class="ft3-posting-val"></span>`;
      const ctrl = document.createElement("span");
      ctrl.className = "ft3-goal-ctrl";
      const btn = (t, ok, fn) => { const b = document.createElement("button"); b.textContent = t; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
      ctrl.append(
        btn("Pause", w.goal.status === "running", () => s.setGoalStatus("Paused")),
        btn("Resume", w.goal.status === "paused", () => s.setGoalStatus("Running")),
        btn("Stop", ["running", "paused", "blocked"].includes(w.goal.status), () => s.setGoalStatus("Stopped")),
      );
      line.querySelector(".ft3-posting-val").appendChild(ctrl);
      live.appendChild(line);
      if (w.goal.blocked) {
        const bl = document.createElement("div");
        bl.className = "ft3-posting ft3-posting-blocked";
        bl.innerHTML = `<span class="ft3-posting-kind">held</span><span class="ft3-posting-label">${escapeHtml(w.goal.blocked.cause)} — ${escapeHtml(w.goal.blocked.nextSafeAction)}</span><span class="ft3-posting-val"></span>`;
        live.appendChild(bl);
      }
    }
    if (w.todo) {
      for (const item of w.todo.items) {
        const line = document.createElement("div");
        line.className = "ft3-posting ft3-posting-todo";
        line.dataset.state = item.state;
        line.innerHTML = `<span class="ft3-posting-kind">task</span><span class="ft3-posting-label">${escapeHtml(item.label)}</span><span class="ft3-posting-val">${escapeHtml(TODO_STATE_LABELS[item.state] || item.state)}</span>`;
        live.appendChild(line);
      }
    }
    if (w.subagents) {
      for (const a of w.subagents.agents) {
        const line = document.createElement("div");
        line.className = "ft3-posting";
        line.dataset.agent = a.status;
        line.innerHTML = `<span class="ft3-posting-kind">agent</span><span class="ft3-posting-label">${escapeHtml(a.name)} — ${escapeHtml(a.currentActivity)}</span><span class="ft3-posting-val">${a.workedSeconds ? fmtDuration(a.workedSeconds) : ""}</span>`;
        live.appendChild(line);
      }
    }
    for (const d of w.diffs) {
      for (const f of d.files) {
        const line = document.createElement("button");
        line.className = "ft3-posting ft3-posting-diff";
        line.innerHTML = `<span class="ft3-posting-kind">edit</span><span class="ft3-posting-label">${escapeHtml(f.path)}</span><span class="ft3-posting-val"><span class="pmc-add">+${f.added}</span> <span class="pmc-del">−${f.removed}</span></span>`;
        line.addEventListener("click", () => s.openArtifact("art-diff"));
        live.appendChild(line);
      }
    }
    ledgerEl.appendChild(live);
  }

  // ---------- form ledger questionnaire ----------
  function renderFormLedger() {
    const existing = ledgerEl.querySelector(".ft3-form");
    if (existing) existing.remove();
    const { active } = questionnaireState();
    if (!active) return;

    const form = document.createElement("section");
    form.className = "ft3-form";

    if (active.status === "preparing" || active.status === "submitting") {
      form.innerHTML = `<div class="ft3-live-heading"><span>${active.status === "preparing" ? "Preparing questions" : "Posting answers"}</span><span class="ft3-live-rule ft3-rule-active" aria-hidden="true"></span></div>`;
      ledgerEl.appendChild(form);
      return;
    }

    const heading = document.createElement("div");
    heading.className = "ft3-live-heading";
    heading.innerHTML = `<span>${escapeHtml(active.title)}</span><span class="ft3-live-rule" aria-hidden="true"></span><span class="ft3-form-count">${active.questions.filter((q) => (q.selected && q.selected.length) || active.skipped[q.id]).length} of ${active.questions.length} filled</span>`;
    form.appendChild(heading);

    active.questions.forEach((q, i) => {
      const isCurrent = i === active.currentQuestionIndex;
      const lineWrap = document.createElement("div");
      lineWrap.className = "ft3-form-line";
      lineWrap.dataset.current = String(isCurrent);
      lineWrap.dataset.state = active.skipped[q.id] ? "skipped" : (q.selected && q.selected.length) ? "answered" : "open";

      const head = document.createElement("button");
      head.className = "ft3-form-q";
      head.innerHTML = `<span class="ft3-form-num">${i + 1}.</span><span class="ft3-form-prompt">${escapeHtml(q.prompt)}</span><span class="ft3-form-answercol">${escapeHtml(answerSummary(active, q))}</span>`;
      head.addEventListener("click", () => s.navigateQuestion(active.id, i));
      lineWrap.appendChild(head);

      if (isCurrent) {
        const fill = document.createElement("div");
        fill.className = "ft3-form-fill";
        if (q.kind === "freeform") {
          const ta = document.createElement("textarea");
          ta.className = "ft3-form-freeform pm-scroll";
          ta.placeholder = "Write on the line";
          ta.value = active.freeform[q.id] || "";
          ta.addEventListener("change", () => s.answerQuestion(active.id, q.id, ta.value));
          fill.appendChild(ta);
        } else {
          for (const opt of q.options) {
            const sel = (q.selected || []).includes(opt);
            const o = document.createElement("button");
            o.className = "ft3-form-opt";
            o.dataset.selected = String(sel);
            o.innerHTML = `<span class="ft3-opt-mark" aria-hidden="true">${sel ? icon("check", 11) : ""}</span><span>${escapeHtml(opt)}</span>`;
            o.addEventListener("click", () => s.answerQuestion(active.id, q.id, opt, { toggle: q.kind === "multi select" }));
            fill.appendChild(o);
          }
        }
        const nav = document.createElement("div");
        nav.className = "ft3-form-nav";
        const mkb = (t, ok, fn, cls) => { const b = document.createElement("button"); b.textContent = t; b.className = cls || ""; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
        nav.append(
          mkb(QUESTIONNAIRE_ACTIONS.skip, !active.skipped[q.id], () => s.skipQuestion(active.id, q.id)),
          ...(active.skipped[q.id] ? [mkb(QUESTIONNAIRE_ACTIONS.answerLater, true, () => s.unskipQuestion(active.id, q.id))] : []),
          mkb(QUESTIONNAIRE_ACTIONS.cancel, true, () => s.cancelQuestionnaire(active.id), "ft3-form-cancel"),
        );
        const post = document.createElement("button");
        post.className = "pm-btn";
        post.dataset.variant = "primary";
        const isLast = i === active.questions.length - 1;
        post.textContent = isLast ? "Post answers" : QUESTIONNAIRE_ACTIONS.next;
        post.addEventListener("click", () => {
          if (!isLast) return s.navigateQuestion(active.id, i + 1);
          const res = s.submitQuestionnaire(active.id);
          if (!res.ok && res.missing) {
            const firstMissing = active.questions.findIndex((x) => res.missing.includes(x.id));
            fill.insertAdjacentHTML("afterbegin", `<div class="ft3-form-error">Required lines are still blank — answer or skip them explicitly.</div>`);
            if (firstMissing >= 0) setTimeout(() => s.navigateQuestion(active.id, firstMissing), 900);
          }
        });
        nav.appendChild(post);
        fill.appendChild(nav);
        lineWrap.appendChild(fill);
      }
      form.appendChild(lineWrap);
    });
    ledgerEl.appendChild(form);
  }

  function answerSummary(active, q) {
    if (active.skipped[q.id]) return "skipped";
    if (q.kind === "freeform") return active.freeform[q.id] ? "written" : "";
    return (q.selected || []).join(", ");
  }

  function renderLensBar() {
    const pending = Object.values(s.lensState.selections).filter((v) => v === "subcompact-pending").length;
    lensBar.replaceChildren();
    if (!pending) return;
    const bar = document.createElement("div");
    bar.className = "fwt-lens-applybar";
    bar.innerHTML = `${icon("compress", 13)}<span>${pending} entries marked for Subcompact</span>`;
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
      const timeEl = ledgerEl.querySelector(".ft3-live-time");
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
