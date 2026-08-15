// Fable — Thread 06 "Counterweight".
// Design thesis: asymmetric balance. Your words are compact, right-anchored
// counters; the assistant answers in a full-measure editorial column. Metadata
// hangs as numbered footnotes under each editorial block. Work is the literal
// counterweight: a narrow right-hand column that fills opposite the text while
// work is active and empties into a footnote once it completes. Questions are a
// ballot — full-measure typographic rows with serif numerals.
// Motion thesis: balance shifts — weight enters one pan (right counters drop in,
// left column rises slightly), and completion returns the beam to level.

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
  ensureCss("threads/thread-06.css");
  const s = ctx.store;

  const el = ctx.el;
  el.classList.add("fwt-column", "ft6-root");
  el.innerHTML = `
    <div class="fwt-scrollwrap">
      <div class="fwt-scroll pm-scroll ft6-scroll"><div class="ft6-beam"></div></div>
    </div>
    <div class="fwt-composer-region ft6-composer-region"></div>`;

  const scrollEl = el.querySelector(".ft6-scroll");
  const scrollWrap = el.querySelector(".fwt-scrollwrap");
  const beamEl = el.querySelector(".ft6-beam");
  const composerRegion = el.querySelector(".ft6-composer-region");
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

  let footnoteCounter = 0;

  function render() {
    keeper.preserve(() => {
      beamEl.replaceChildren();
      footnoteCounter = 0;
      const slice = transcriptSlice();
      if (slice.olderCount > 0) {
        const older = document.createElement("div");
        older.className = "fwt-older";
        older.innerHTML = `<span>${slice.olderCount} earlier exchanges above the beam</span>`;
        const btn = document.createElement("button");
        btn.textContent = "Raise them";
        btn.addEventListener("click", () => slice.loadOlder());
        older.appendChild(btn);
        beamEl.appendChild(older);
      }
      for (const m of slice.messages) beamEl.appendChild(renderBlock(m));
      renderCounterweight();
      renderBallot();
    });
    renderLensBar();
    keeper.followIfAtBottom();
    requestAnimationFrame(() => { jump.hidden = keeper.atBottom; });
  }

  function renderBlock(m) {
    const isUser = m.role === "user";
    const block = document.createElement("article");
    block.className = "ft6-block";
    block.dataset.mid = m.id;
    block.dataset.role = m.role;

    const mark = lensMark(m);
    if (mark || m.redirect || m.interrupted) {
      const flags = document.createElement("div");
      flags.className = "ft6-flags";
      if (mark) flags.innerHTML += `<span class="fwt-lens-flag" data-op="${mark}">${mark === "mute" ? "Muted" : mark === "focus" ? "Focused" : mark === "subcompact" ? "Subcompacted" : "Pending"}</span>`;
      if (m.redirect) flags.innerHTML += `<span class="fwt-redirect-flag">redirect</span>`;
      if (m.interrupted) flags.innerHTML += `<span class="fwt-redirect-flag">stopped</span>`;
      block.appendChild(flags);
    }

    const noteNum = ++footnoteCounter;
    const body = document.createElement("div");
    body.className = "ft6-body";
    const prose = document.createElement("div");
    prose.className = "ft6-prose";
    const long = isLongMessage(m);
    const expanded = isExpanded(m);
    prose.innerHTML = (long && !expanded ? `<p>${escapeHtml(previewText(m)).replace(/\n/g, "<br>")}</p>` : bodyHtml(m));
    const supEl = document.createElement("sup");
    supEl.className = "ft6-note-ref";
    supEl.textContent = String(noteNum);
    const lastP = prose.querySelector("p:last-child");
    if (lastP) lastP.appendChild(supEl);
    body.appendChild(prose);

    if (long) {
      const fold = document.createElement("button");
      fold.className = "ft6-fold";
      fold.textContent = expanded ? "Condense" : "Read in full";
      fold.addEventListener("click", () => keeper.preserve(() => s.toggleMessageExpanded(m.id)));
      body.appendChild(fold);
    }

    for (const g of activityGroups(m)) body.appendChild(renderSettled(m, g));

    // Footnote line — the action row as a hanging footnote.
    const note = document.createElement("div");
    note.className = "ft6-footnote";
    const rt = m.runtime || {};
    const canEdit = isUser && m.eligibleForEdit && isLastUser(m);
    const mk = (t, fn) => { const b = document.createElement("button"); b.textContent = t; b.addEventListener("click", fn); return b; };
    const numSpan = document.createElement("span");
    numSpan.className = "ft6-footnote-num";
    numSpan.textContent = `${noteNum}.`;
    note.append(
      numSpan,
      mk("Copy", () => copyMessage(m)),
      ...(canEdit ? [mk("Edit", () => { s.setDraft(m.body); s.addReceipt({ kind: "edit", title: "Editing your message", detail: "Original counter stays on the beam." }); })] : []),
      meta(`${rt.provider || ""}, ${rt.model || ""}`),
      meta(workedLabel(false, rt.workedSeconds)),
      meta(fmtTime(m.sentAt)),
      mk("More Info", (e) => openMoreInfo(e.currentTarget, m)),
      mk("Context", (e) => openMessageOps(e.currentTarget, m)),
    );
    body.appendChild(note);

    block.appendChild(body);
    return block;
  }

  function meta(t) { const sp = document.createElement("span"); sp.className = "ft6-meta"; sp.textContent = t || ""; return sp; }
  function isLastUser(m) {
    const msgs = s.thread.messages;
    for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === "user") return msgs[i].id === m.id;
    return false;
  }

  function renderSettled(m, g) {
    const wrap = document.createElement("div");
    wrap.className = "ft6-settled";
    const key = m.id + ":" + g.kind;
    const open = !!s.view.expandedGroups[key];
    const head = document.createElement("button");
    head.className = "ft6-settled-head";
    const label = g.kind === "activity" ? `Work settled — ${g.group.compactLabel}, ${fmtDuration(g.group.workedSeconds)}`
      : g.kind === "thoughts" ? "Thought summary"
      : "Answered questions";
    head.innerHTML = `${icon("gauge", 11)}<span>${escapeHtml(label)}</span>${icon(open ? "chevronUp" : "chevronDown", 10)}`;
    head.addEventListener("click", () => keeper.preserve(() => s.toggleGroupExpanded(key)));
    wrap.appendChild(head);
    if (open) {
      const sheet = document.createElement("div");
      sheet.className = "ft6-settled-sheet";
      if (g.kind === "activity") {
        for (const st of g.group.stages) {
          sheet.innerHTML += `<div class="ft6-settled-line"><span class="ft6-settled-kind">${escapeHtml(st.kind)}</span><span>${escapeHtml(st.label)}</span><span class="ft6-settled-side">${st.added != null ? `+${st.added} −${st.removed}` : fmtDuration(st.durationSeconds)}</span></div>`;
        }
      } else if (g.kind === "thoughts") {
        for (const seg of g.segments) sheet.innerHTML += `<p class="ft6-settled-thought">${escapeHtml(seg.summary)}</p>`;
      } else {
        for (const qa of g.record.questionsAndAnswers) {
          sheet.innerHTML += `<div class="ft6-settled-line"><span class="ft6-settled-kind">Q</span><span>${escapeHtml(qa.question)}</span><span class="ft6-settled-side">${escapeHtml(qa.answer)}</span></div>`;
        }
      }
      wrap.appendChild(sheet);
    }
    return wrap;
  }

  // ---------- counterweight column ----------
  function renderCounterweight() {
    const w = workCluster();
    if (w.isEmpty) return;
    const row = document.createElement("section");
    row.className = "ft6-weight-row";

    const spacer = document.createElement("div");
    spacer.className = "ft6-weight-spacer";
    const pan = document.createElement("div");
    pan.className = "ft6-pan";

    const lt = liveTurn();
    if (lt) {
      const wt = document.createElement("div");
      wt.className = "ft6-weight ft6-weight-live";
      wt.innerHTML = `<span class="ft6-weight-label">${escapeHtml(lt.summary)}</span><span class="ft6-weight-val ft6-live-time">${fmtDuration(lt.workedSeconds)}</span>`;
      for (const item of lt.items) {
        const line = document.createElement("div");
        line.className = "ft6-weight-item";
        line.innerHTML = `<span>${escapeHtml(item.text)}</span>${item.side ? `<span class="ft6-weight-val">${escapeHtml(item.side)}</span>` : ""}`;
        wt.appendChild(line);
      }
      pan.appendChild(wt);
    }
    if (w.goal) {
      const wt = document.createElement("div");
      wt.className = "ft6-weight";
      wt.dataset.status = w.goal.status;
      const phaseTxt = w.goal.phases ? ` · ${escapeHtml(w.goal.phases[w.goal.phaseIndex || 0])} ${(w.goal.phaseIndex || 0) + 1}/${w.goal.phases.length}` : "";
      const replanTxt = w.goal.replanApplied ? " · replanned" : "";
      wt.innerHTML = `<span class="ft6-weight-label">${escapeHtml(w.goal.title)}</span><span class="ft6-weight-val">${escapeHtml(w.goal.status)}${phaseTxt}${replanTxt}</span>`;
      const ctrl = document.createElement("div");
      ctrl.className = "ft6-weight-ctrl";
      const btn = (t, ok, fn) => { const b = document.createElement("button"); b.textContent = t; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
      ctrl.append(
        btn("Pause", w.goal.status === "running", () => s.setGoalStatus("Paused")),
        btn("Resume", w.goal.status === "paused", () => s.setGoalStatus("Running")),
        btn("Stop", ["running", "paused", "blocked"].includes(w.goal.status), () => s.setGoalStatus("Stopped")),
      );
      wt.appendChild(ctrl);
      if (w.goal.blocked) {
        const bl = document.createElement("div");
        bl.className = "ft6-weight-blocked";
        bl.textContent = `${w.goal.blocked.cause}. Next safe action: ${w.goal.blocked.nextSafeAction}`;
        wt.appendChild(bl);
      }
      pan.appendChild(wt);
    }
    if (w.todo) {
      const wt = document.createElement("div");
      wt.className = "ft6-weight";
      const done = w.todo.items.filter((i) => i.state === "complete").length;
      wt.innerHTML = `<span class="ft6-weight-label">Tasks</span><span class="ft6-weight-val">${done}/${w.todo.items.length}</span>`;
      const bars = document.createElement("div");
      bars.className = "ft6-task-bars";
      for (const item of w.todo.items) {
        const bar = document.createElement("span");
        bar.className = "ft6-task-bar";
        bar.dataset.state = item.state;
        bar.title = `${TODO_STATE_LABELS[item.state] || item.state} — ${item.label}`;
        bars.appendChild(bar);
      }
      wt.appendChild(bars);
      pan.appendChild(wt);
    }
    if (w.subagents) {
      const wt = document.createElement("div");
      wt.className = "ft6-weight";
      const c = w.subagents.counts;
      wt.innerHTML = `<span class="ft6-weight-label">${escapeHtml(w.subagents.label)}</span><span class="ft6-weight-val">${c.working} working · ${c.complete} done${c.failed ? ` · ${c.failed} failed` : ""}${c.retrying ? ` · ${c.retrying} retrying` : ""}${c.blocked ? ` · ${c.blocked} blocked` : ""}${c.waiting ? ` · ${c.waiting} waiting` : ""}</span>`;
      for (const a of w.subagents.agents) {
        const line = document.createElement("div");
        line.className = "ft6-agent-line";
        line.dataset.status = a.status;
        line.innerHTML = `<span>${escapeHtml(a.name)}</span><span class="ft6-agent-act">${escapeHtml(a.currentActivity)}</span>`;
        wt.appendChild(line);
      }
      pan.appendChild(wt);
    }
    for (const d of w.diffs) {
      const wt = document.createElement("button");
      wt.className = "ft6-weight ft6-weight-diff";
      wt.innerHTML = `<span class="ft6-weight-label">${escapeHtml(d.label)}</span><span class="ft6-weight-val">${d.files.length} files</span>`;
      wt.addEventListener("click", () => s.openArtifact("art-diff"));
      pan.appendChild(wt);
    }

    row.append(spacer, pan);
    beamEl.appendChild(row);
  }

  // ---------- ballot questionnaire ----------
  function renderBallot() {
    const { active } = questionnaireState();
    if (!active) return;
    const sec = document.createElement("section");
    sec.className = "ft6-ballot";

    if (active.status === "preparing" || active.status === "submitting") {
      sec.innerHTML = `<div class="ft6-ballot-band">${escapeHtml(active.status === "preparing" ? "Preparing the ballot…" : "Weighing your answers…")}</div>`;
      beamEl.appendChild(sec);
      return;
    }

    const q = active.questions[active.currentQuestionIndex];
    sec.innerHTML = `
      <div class="ft6-ballot-head">
        <span class="ft6-ballot-title">${escapeHtml(active.title)}</span>
        <span class="ft6-ballot-count">${active.currentQuestionIndex + 1} / ${active.questions.length}</span>
      </div>`;
    const stage = document.createElement("div");
    stage.className = "ft6-ballot-stage";
    const prompt = document.createElement("p");
    prompt.className = "ft6-ballot-q";
    prompt.textContent = q.prompt;
    stage.appendChild(prompt);

    if (q.kind === "freeform") {
      const ta = document.createElement("textarea");
      ta.className = "ft6-ballot-freeform pm-scroll";
      ta.placeholder = "Write your position";
      ta.value = active.freeform[q.id] || "";
      ta.addEventListener("change", () => s.answerQuestion(active.id, q.id, ta.value));
      stage.appendChild(ta);
    } else {
      q.options.forEach((opt, i) => {
        const sel = (q.selected || []).includes(opt);
        const row = document.createElement("button");
        row.className = "ft6-ballot-opt";
        row.dataset.selected = String(sel);
        row.innerHTML = `<span class="ft6-ballot-numeral">${["i", "ii", "iii", "iv", "v", "vi"][i] || i + 1}</span><span class="ft6-ballot-text">${escapeHtml(opt)}</span><span class="ft6-ballot-check">${sel ? icon("check", 14) : ""}</span>`;
        row.addEventListener("click", () => s.answerQuestion(active.id, q.id, opt, { toggle: q.kind === "multi select" }));
        stage.appendChild(row);
      });
    }
    if (active.skipped[q.id]) {
      const sk = document.createElement("div");
      sk.className = "ft6-ballot-skipped";
      sk.innerHTML = `<span>Abstained.</span>`;
      const undo = document.createElement("button");
      undo.textContent = "Reconsider";
      undo.addEventListener("click", () => s.unskipQuestion(active.id, q.id));
      sk.appendChild(undo);
      stage.appendChild(sk);
    }
    sec.appendChild(stage);

    const nav = document.createElement("div");
    nav.className = "ft6-ballot-nav";
    const mkb = (t, ok, fn, cls) => { const b = document.createElement("button"); b.className = cls || ""; b.textContent = t; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
    const isLast = active.currentQuestionIndex === active.questions.length - 1;
    nav.append(
      mkb(QUESTIONNAIRE_ACTIONS.back, active.currentQuestionIndex > 0, () => s.navigateQuestion(active.id, active.currentQuestionIndex - 1)),
      mkb("Abstain", !active.skipped[q.id], () => s.skipQuestion(active.id, q.id)),
      mkb("Withdraw ballot", true, () => s.cancelQuestionnaire(active.id), "ft6-ballot-cancel"),
    );
    const primary = document.createElement("button");
    primary.className = "pm-btn";
    primary.dataset.variant = "primary";
    primary.textContent = isLast ? "Cast answers" : QUESTIONNAIRE_ACTIONS.next;
    primary.addEventListener("click", () => {
      if (!isLast) return s.navigateQuestion(active.id, active.currentQuestionIndex + 1);
      const res = s.submitQuestionnaire(active.id);
      if (!res.ok && res.missing) {
        const firstMissing = active.questions.findIndex((x) => res.missing.includes(x.id));
        stage.insertAdjacentHTML("afterbegin", `<div class="ft6-ballot-error">Required questions need an answer or an explicit abstention.</div>`);
        if (firstMissing >= 0) setTimeout(() => s.navigateQuestion(active.id, firstMissing), 900);
      }
    });
    nav.appendChild(primary);
    sec.appendChild(nav);
    beamEl.appendChild(sec);
  }

  function renderLensBar() {
    const pending = Object.values(s.lensState.selections).filter((v) => v === "subcompact-pending").length;
    lensBar.replaceChildren();
    if (!pending) return;
    const bar = document.createElement("div");
    bar.className = "fwt-lens-applybar";
    bar.innerHTML = `${icon("compress", 13)}<span>${pending} blocks marked for Subcompact</span>`;
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
      const timeEl = beamEl.querySelector(".ft6-live-time");
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
