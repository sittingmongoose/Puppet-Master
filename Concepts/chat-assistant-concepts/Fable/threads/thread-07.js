// Fable — Thread 07 "Teletype".
// Design thesis: the thread is a wire feed. Everything sits on a monospaced
// grid: header lines announce each transmission (party, time), prose is set in
// a narrow mono-adjacent measure, and all system work shares ONE status line
// that rewrites itself in place — the wire never stacks status. Completed work
// rolls up into a numbered wire summary that can be replayed line by line.
// Questions arrive as a boxed form the wire prints field by field.
// Motion thesis: carriage returns — new lines feed up from the platen with a
// stepped (not eased) rhythm; the status line swaps text with a hard cut; the
// cursor block is the only continuous motion and only while receiving.

import { store } from "../shared/store.js";
import { icon } from "../shared/icons.js";
import { ensureCss } from "../shared/contracts.js";
import { escapeHtml } from "../shared/popup.js";
import {
  transcriptSlice, isLongMessage, isExpanded, previewText, lensMark, copyMessage,
  workCluster, createScrollKeeper, questionnaireState, activityGroups,
} from "../shared/thread-common.js";
import { createComposer, createSelectorRow, createDecisionStack, openMoreInfo, openMessageOps } from "../shared/components.js";
import { fmtDuration, fmtTime, workedLabel, JUMP_TO_LATEST, QUESTIONNAIRE_ACTIONS, TODO_STATE_LABELS } from "../shared/strings.js";

export function createThread(ctx) {
  ensureCss("threads/thread-base.css");
  ensureCss("threads/thread-07.css");
  const s = ctx.store;

  const el = ctx.el;
  el.classList.add("fwt-column", "ft7-root");
  el.innerHTML = `
    <div class="fwt-scrollwrap">
      <div class="fwt-scroll pm-scroll ft7-scroll"><div class="ft7-wire"></div></div>
    </div>
    <div class="ft7-statusband" hidden></div>
    <div class="fwt-composer-region ft7-composer-region"></div>`;

  const scrollEl = el.querySelector(".ft7-scroll");
  const scrollWrap = el.querySelector(".fwt-scrollwrap");
  const wireEl = el.querySelector(".ft7-wire");
  const statusband = el.querySelector(".ft7-statusband");
  const composerRegion = el.querySelector(".ft7-composer-region");
  const keeper = createScrollKeeper(scrollEl);

  const decisions = document.createElement("div");
  createDecisionStack(decisions);
  const lensBar = document.createElement("div");
  const composerHost = document.createElement("div");
  const composer = createComposer(composerHost, { skin: "ft7-composer" });
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
      wireEl.replaceChildren();
      const slice = transcriptSlice();
      if (slice.olderCount > 0) {
        const older = document.createElement("div");
        older.className = "fwt-older ft7-older";
        older.innerHTML = `<span>${slice.olderCount} earlier transmissions on the spool</span>`;
        const btn = document.createElement("button");
        btn.textContent = "Rewind spool";
        btn.addEventListener("click", () => slice.loadOlder());
        older.appendChild(btn);
        wireEl.appendChild(older);
      }
      for (const m of slice.messages) wireEl.appendChild(renderTransmission(m));
      renderForm();
    });
    renderStatusband();
    renderLensBar();
    keeper.followIfAtBottom();
    requestAnimationFrame(() => { jump.hidden = keeper.atBottom; });
  }

  function renderTransmission(m) {
    const t = document.createElement("article");
    t.className = "ft7-tx";
    t.dataset.mid = m.id;
    t.dataset.role = m.role;

    const head = document.createElement("div");
    head.className = "ft7-tx-head";
    const mark = lensMark(m);
    head.innerHTML =
      `<span class="ft7-tx-party">${m.role === "user" ? "YOU" : "FABLE"}</span>` +
      `<span class="ft7-tx-rule" aria-hidden="true"></span>` +
      `<span class="ft7-tx-time">${fmtTime(m.sentAt)}</span>` +
      (mark ? `<span class="fwt-lens-flag" data-op="${mark}">${mark === "mute" ? "Muted" : mark === "focus" ? "Focused" : mark === "subcompact" ? "Subcompacted" : "Pending"}</span>` : "") +
      (m.redirect ? `<span class="fwt-redirect-flag">redirect</span>` : "") +
      (m.interrupted ? `<span class="fwt-redirect-flag">stopped</span>` : "");
    t.appendChild(head);

    const body = document.createElement("div");
    body.className = "ft7-tx-body";
    const long = isLongMessage(m);
    const expanded = isExpanded(m);
    const text = long && !expanded ? previewText(m) : (m.body || "");
    body.innerHTML = escapeHtml(text).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>").replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`).join("");
    t.appendChild(body);

    if (long) {
      const fold = document.createElement("button");
      fold.className = "ft7-fold";
      fold.textContent = expanded ? "[- fold]" : `[+ ${Math.max(0, (m.body || "").length - 340)} more chars]`;
      fold.addEventListener("click", () => keeper.preserve(() => s.toggleMessageExpanded(m.id)));
      t.appendChild(fold);
    }

    for (const g of activityGroups(m)) t.appendChild(renderRollup(m, g));

    const actions = document.createElement("div");
    actions.className = "ft7-actions";
    const rt = m.runtime || {};
    const canEdit = m.role === "user" && m.eligibleForEdit && isLastUser(m);
    const mk = (tx, fn) => { const b = document.createElement("button"); b.textContent = tx; b.addEventListener("click", fn); return b; };
    actions.append(
      mk("copy", () => copyMessage(m)),
      ...(canEdit ? [mk("edit", () => { s.setDraft(m.body); s.addReceipt({ kind: "edit", title: "Editing your message", detail: "The wire keeps the original transmission." }); })] : []),
      meta(rt.provider), meta(rt.model), meta(workedLabel(false, rt.workedSeconds).toLowerCase()),
      mk("more info", (e) => openMoreInfo(e.currentTarget, m)),
      Object.assign(mk("context", (e) => openMessageOps(e.currentTarget, m)), { className: "ft7-ops" }),
    );
    t.appendChild(actions);
    return t;
  }

  function meta(t) { const sp = document.createElement("span"); sp.className = "ft7-meta"; sp.textContent = (t || "").toString(); return sp; }
  function isLastUser(m) {
    const msgs = s.thread.messages;
    for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === "user") return msgs[i].id === m.id;
    return false;
  }

  // Wire summary rollup — numbered lines, replayable.
  function renderRollup(m, g) {
    const wrap = document.createElement("div");
    wrap.className = "ft7-rollup";
    const key = m.id + ":" + g.kind;
    const open = !!s.view.expandedGroups[key];
    const head = document.createElement("button");
    head.className = "ft7-rollup-head";
    const label = g.kind === "activity" ? `${g.group.compactLabel} in ${fmtDuration(g.group.workedSeconds)}`
      : g.kind === "thoughts" ? "thought summary"
      : "answers on record";
    head.innerHTML = `<span class="ft7-rollup-mark">${open ? "▾" : "▸"}</span><span>WIRE SUMMARY — ${escapeHtml(label.toUpperCase())}</span>`;
    head.addEventListener("click", () => keeper.preserve(() => s.toggleGroupExpanded(key)));
    wrap.appendChild(head);
    if (open) {
      const sheet = document.createElement("div");
      sheet.className = "ft7-rollup-sheet";
      let n = 0;
      const line = (kind, text, side) => `<div class="ft7-roll-line"><span class="ft7-roll-num">${String(++n).padStart(2, "0")}</span><span class="ft7-roll-kind">${escapeHtml(kind)}</span><span class="ft7-roll-text">${escapeHtml(text)}</span><span class="ft7-roll-side">${escapeHtml(side || "")}</span></div>`;
      if (g.kind === "activity") {
        for (const st of g.group.stages) sheet.innerHTML += line(st.kind, st.label, st.added != null ? `+${st.added} -${st.removed}` : fmtDuration(st.durationSeconds));
      } else if (g.kind === "thoughts") {
        for (const seg of g.segments) sheet.innerHTML += line("thought", seg.summary, "");
      } else {
        for (const qa of g.record.questionsAndAnswers) sheet.innerHTML += line("answer", `${qa.question} — ${qa.answer}`, "");
      }
      wrap.appendChild(sheet);
    }
    return wrap;
  }

  // ---------- the single status line ----------
  function renderStatusband() {
    const w = workCluster();
    const hasStatus = !w.isEmpty;
    statusband.hidden = !hasStatus;
    if (!hasStatus) { statusband.replaceChildren(); return; }

    const open = !!s.view.expandedGroups["ft7:statusopen"];
    statusband.replaceChildren();

    const line = document.createElement("button");
    line.className = "ft7-statusline";
    const parts = [];
    if (w.turn) parts.push(`RCV ${w.turn.summary} ${fmtDuration(w.turn.workedSeconds)}`);
    if (w.goal) parts.push(`GOAL ${w.goal.status.toUpperCase()}`);
    if (w.todo) parts.push(`TASKS ${w.todo.items.filter((i) => i.state === "complete").length}/${w.todo.items.length}`);
    if (w.subagents) parts.push(`HANDS ${w.subagents.counts.working}W ${w.subagents.counts.complete}C${w.subagents.counts.blocked ? ` ${w.subagents.counts.blocked}B` : ""}`);
    if (w.diffs.length) parts.push(`EDITS ${w.diffs.reduce((n, d) => n + d.files.length, 0)}F`);
    line.innerHTML = `<span class="ft7-status-text">${escapeHtml(parts.join("  ·  "))}</span>${w.turn ? `<span class="ft7-cursor" aria-hidden="true"></span>` : ""}<span class="ft7-status-toggle">${open ? "close" : "open"}</span>`;
    line.addEventListener("click", () => { s.view.expandedGroups["ft7:statusopen"] = !open; s.emit("transcript-view"); });
    statusband.appendChild(line);

    if (open) {
      const panel = document.createElement("div");
      panel.className = "ft7-statuspanel";
      if (w.goal) {
        const gl = document.createElement("div");
        gl.className = "ft7-panel-line";
        gl.dataset.status = w.goal.status;
        gl.innerHTML = `<span class="ft7-roll-kind">goal</span><span class="ft7-roll-text">${escapeHtml(w.goal.title)} — ${escapeHtml(w.goal.objective)}</span>`;
        const ctrl = document.createElement("span");
        ctrl.className = "ft7-panel-ctrl";
        const btn = (t, ok, fn) => { const b = document.createElement("button"); b.textContent = `[${t}]`; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
        ctrl.append(
          btn("pause", w.goal.status === "running", () => s.setGoalStatus("Paused")),
          btn("resume", w.goal.status === "paused", () => s.setGoalStatus("Running")),
          btn("stop", ["running", "paused", "blocked"].includes(w.goal.status), () => s.setGoalStatus("Stopped")),
        );
        gl.appendChild(ctrl);
        panel.appendChild(gl);
        if (w.goal.blocked) {
          panel.innerHTML += `<div class="ft7-panel-line ft7-panel-blocked"><span class="ft7-roll-kind">held</span><span class="ft7-roll-text">${escapeHtml(w.goal.blocked.cause)} — next safe: ${escapeHtml(w.goal.blocked.nextSafeAction)}</span></div>`;
        }
      }
      if (w.todo) {
        for (const item of w.todo.items) {
          panel.innerHTML += `<div class="ft7-panel-line" data-tstate="${item.state}"><span class="ft7-roll-kind">task</span><span class="ft7-roll-text">${escapeHtml(item.label)}</span><span class="ft7-roll-side">${escapeHtml((TODO_STATE_LABELS[item.state] || item.state).toLowerCase())}</span></div>`;
        }
      }
      if (w.subagents) {
        for (const a of w.subagents.agents) {
          panel.innerHTML += `<div class="ft7-panel-line" data-astate="${a.status}"><span class="ft7-roll-kind">hand</span><span class="ft7-roll-text">${escapeHtml(a.name)} — ${escapeHtml(a.currentActivity)}</span><span class="ft7-roll-side">${escapeHtml(a.route || "")}</span></div>`;
        }
      }
      for (const d of w.diffs) {
        for (const f of d.files) {
          const b = document.createElement("button");
          b.className = "ft7-panel-line ft7-panel-diff";
          b.innerHTML = `<span class="ft7-roll-kind">edit</span><span class="ft7-roll-text">${escapeHtml(f.path)}</span><span class="ft7-roll-side">+${f.added} -${f.removed}</span>`;
          b.addEventListener("click", () => s.openArtifact("art-diff"));
          panel.appendChild(b);
        }
      }
      statusband.appendChild(panel);
    }
  }

  // ---------- boxed form questionnaire ----------
  function renderForm() {
    const { active } = questionnaireState();
    if (!active) return;
    const form = document.createElement("section");
    form.className = "ft7-form";

    if (active.status === "preparing" || active.status === "submitting") {
      form.innerHTML = `<div class="ft7-form-band">${escapeHtml(active.status === "preparing" ? "FORM INCOMING…" : "TRANSMITTING ANSWERS…")}<span class="ft7-cursor" aria-hidden="true"></span></div>`;
      wireEl.appendChild(form);
      return;
    }

    const q = active.questions[active.currentQuestionIndex];
    form.innerHTML = `
      <div class="ft7-form-frame">
        <div class="ft7-form-head">
          <span>${escapeHtml(active.title.toUpperCase())}</span>
          <span class="ft7-form-count">FIELD ${active.currentQuestionIndex + 1}/${active.questions.length}</span>
        </div>
        <div class="ft7-form-stage"></div>
        <div class="ft7-form-nav"></div>
      </div>`;
    const stage = form.querySelector(".ft7-form-stage");
    const prompt = document.createElement("p");
    prompt.className = "ft7-form-prompt";
    prompt.textContent = q.prompt;
    stage.appendChild(prompt);

    if (q.kind === "freeform") {
      const ta = document.createElement("textarea");
      ta.className = "ft7-form-freeform pm-scroll";
      ta.placeholder = "type response";
      ta.value = active.freeform[q.id] || "";
      ta.addEventListener("change", () => s.answerQuestion(active.id, q.id, ta.value));
      stage.appendChild(ta);
    } else {
      q.options.forEach((opt, i) => {
        const sel = (q.selected || []).includes(opt);
        const row = document.createElement("button");
        row.className = "ft7-form-opt";
        row.dataset.selected = String(sel);
        row.innerHTML = `<span class="ft7-opt-key">${i + 1}</span><span class="ft7-opt-box" aria-hidden="true">${sel ? icon("check", 10) : ""}</span><span>${escapeHtml(opt)}</span>`;
        row.addEventListener("click", () => s.answerQuestion(active.id, q.id, opt, { toggle: q.kind === "multi select" }));
        stage.appendChild(row);
      });
    }
    if (active.skipped[q.id]) {
      const sk = document.createElement("div");
      sk.className = "ft7-form-skipped";
      sk.innerHTML = `<span>FIELD SKIPPED</span>`;
      const undo = document.createElement("button");
      undo.textContent = "[restore]";
      undo.addEventListener("click", () => s.unskipQuestion(active.id, q.id));
      sk.appendChild(undo);
      stage.appendChild(sk);
    }

    const nav = form.querySelector(".ft7-form-nav");
    const mkb = (t, ok, fn, cls) => { const b = document.createElement("button"); b.className = "ft7-form-key " + (cls || ""); b.textContent = `[${t}]`; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
    const isLast = active.currentQuestionIndex === active.questions.length - 1;
    nav.append(
      mkb("back", active.currentQuestionIndex > 0, () => s.navigateQuestion(active.id, active.currentQuestionIndex - 1)),
      mkb("skip", !active.skipped[q.id], () => s.skipQuestion(active.id, q.id)),
      mkb("cancel form", true, () => s.cancelQuestionnaire(active.id), "ft7-key-cancel"),
      mkb(isLast ? "send form" : "next", true, () => {
        if (!isLast) return s.navigateQuestion(active.id, active.currentQuestionIndex + 1);
        const res = s.submitQuestionnaire(active.id);
        if (!res.ok && res.missing) {
          const firstMissing = active.questions.findIndex((x) => res.missing.includes(x.id));
          stage.insertAdjacentHTML("afterbegin", `<div class="ft7-form-error">REQUIRED FIELDS EMPTY — answer or skip each one.</div>`);
          if (firstMissing >= 0) setTimeout(() => s.navigateQuestion(active.id, firstMissing), 900);
        }
      }, "ft7-key-primary"),
    );
    wireEl.appendChild(form);
  }

  function renderLensBar() {
    const pending = Object.values(s.lensState.selections).filter((v) => v === "subcompact-pending").length;
    lensBar.replaceChildren();
    if (!pending) return;
    const bar = document.createElement("div");
    bar.className = "fwt-lens-applybar";
    bar.innerHTML = `${icon("compress", 13)}<span>${pending} transmissions marked for Subcompact</span>`;
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
    s.on("turn-tick", () => renderStatusband()),
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
