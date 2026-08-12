// Fable — Thread 01 "Screenplay".
// Design thesis: a bubble-less typographic script. Speakers live in a small-caps
// margin column; prose owns the measure. System work reads as stage directions —
// bracketed, centered, updating in place. Questionnaires are inline form scenes
// with a stable footprint and lettered options.
// Motion thesis: print-like restraint. Messages rise a few pixels and settle;
// stage-direction text replaces in place; nothing slides sideways, nothing fades
// for decoration. Reduced motion = instant final states, same hierarchy.

import { store } from "../shared/store.js";
import { icon } from "../shared/icons.js";
import { ensureCss } from "../shared/contracts.js";
import { escapeHtml } from "../shared/popup.js";
import {
  transcriptSlice, isLongMessage, isExpanded, previewText, lensMark, copyMessage,
  workCluster, createScrollKeeper, questionnaireState, questionProgress, validateSubmit,
  activityGroups, bodyHtml,
} from "../shared/thread-common.js";
import { createComposer, createSelectorRow, createDecisionStack, openMoreInfo, openMessageOps } from "../shared/components.js";
import { fmtDuration, fmtTime, workedLabel, JUMP_TO_LATEST, QUESTIONNAIRE_ACTIONS, TODO_STATE_LABELS } from "../shared/strings.js";

export function createThread(ctx) {
  ensureCss("threads/thread-base.css");
  ensureCss("threads/thread-01.css");
  const { store: s } = ctx;

  const el = ctx.el;
  el.classList.add("fwt-column", "ft1-root");
  el.innerHTML = `
    <div class="fwt-scrollwrap"><div class="fwt-scroll pm-scroll ft1-scroll"><div class="ft1-script"></div></div></div>
    <div class="fwt-composer-region ft1-composer-region"></div>`;

  const scrollEl = el.querySelector(".ft1-scroll");
  const scrollWrap = el.querySelector(".fwt-scrollwrap");
  const scriptEl = el.querySelector(".ft1-script");
  const composerRegion = el.querySelector(".ft1-composer-region");
  const keeper = createScrollKeeper(scrollEl);

  // Composer region: decisions above, lens apply bar, composer, selector row below.
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

  // ---------- render ----------
  function render() {
    keeper.preserve(() => {
      scriptEl.replaceChildren();
      const slice = transcriptSlice();
      if (slice.olderCount > 0) {
        const older = document.createElement("div");
        older.className = "fwt-older";
        older.innerHTML = `<span>${slice.olderCount} earlier messages stay unloaded — search still covers them</span>`;
        const btn = document.createElement("button");
        btn.textContent = "Load earlier";
        btn.addEventListener("click", () => slice.loadOlder());
        older.appendChild(btn);
        scriptEl.appendChild(older);
      }
      for (const m of slice.messages) scriptEl.appendChild(renderMessage(m));
      renderWorkScene();
      renderQuestionScene();
    });
    renderLensBar();
    // Bottom-anchored content (work scene, questionnaire) may grow the page:
    // keep following if the reader was at the bottom, and resync the jump chip.
    keeper.followIfAtBottom();
    requestAnimationFrame(syncJump);
  }

  function renderMessage(m) {
    const row = document.createElement("article");
    row.className = "ft1-line";
    row.dataset.mid = m.id;
    row.dataset.role = m.role;

    const margin = document.createElement("div");
    margin.className = "ft1-margin";
    margin.innerHTML = `<span class="ft1-speaker">${m.role === "user" ? "You" : "Fable"}</span><span class="ft1-time">${fmtTime(m.sentAt)}</span>`;

    const body = document.createElement("div");
    body.className = "ft1-body";

    const mark = lensMark(m);
    const flags = document.createElement("div");
    flags.className = "ft1-flags";
    let hasFlags = false;
    if (mark) {
      flags.innerHTML += `<span class="fwt-lens-flag" data-op="${mark}">${mark === "mute" ? "Muted" : mark === "focus" ? "Focused" : mark === "subcompact" ? "Subcompacted" : "Subcompact pending"}</span>`;
      hasFlags = true;
    }
    if (m.redirect) { flags.innerHTML += `<span class="fwt-redirect-flag">${icon("swap", 10)}<span>redirect</span></span>`; hasFlags = true; }
    if (m.interrupted) { flags.innerHTML += `<span class="fwt-redirect-flag">stopped</span>`; hasFlags = true; }
    if (hasFlags) body.appendChild(flags);

    const prose = document.createElement("div");
    prose.className = "ft1-prose";
    const long = isLongMessage(m);
    const expanded = isExpanded(m);
    prose.dataset.mono = mark === "mute" ? "true" : "false";
    prose.innerHTML = long && !expanded ? bodyHtmlFromText(previewText(m)) : bodyHtml(m);
    body.appendChild(prose);

    if (long) {
      const toggle = document.createElement("button");
      toggle.className = "ft1-fold";
      toggle.innerHTML = expanded
        ? `${icon("chevronUp", 11)}<span>Collapse</span>`
        : `${icon("chevronDown", 11)}<span>Read the rest — ${Math.max(0, (m.body || "").length - 340)} more characters</span>`;
      toggle.addEventListener("click", () => keeper.preserve(() => s.toggleMessageExpanded(m.id)));
      body.appendChild(toggle);
    }

    for (const g of activityGroups(m)) body.appendChild(renderHistoryGroup(m, g));

    // Action row — sibling below the body, never a nested bubble.
    const actions = document.createElement("div");
    actions.className = "ft1-actions";
    const rt = m.runtime || {};
    const canEdit = m.role === "user" && m.eligibleForEdit && isLastUserMessage(m);
    actions.append(
      textAction("Copy", () => copyMessage(m)),
      ...(canEdit ? [textAction("Edit", () => {
        s.setDraft(m.body);
        s.addReceipt({ kind: "edit", title: "Editing your message", detail: "The original stays in history; sending creates a superseding turn." });
      })] : []),
      metaSpan(rt.provider),
      metaSpan(rt.model),
      metaSpan(workedLabel(false, rt.workedSeconds)),
      textAction("More Info", (e) => openMoreInfo(e.currentTarget, m)),
    );
    actions.addEventListener("contextmenu", (e) => { e.preventDefault(); openMessageOps(actions, m); });
    const opsBtn = textAction("Context", (e) => openMessageOps(e.currentTarget, m));
    opsBtn.classList.add("ft1-ops");
    actions.appendChild(opsBtn);
    body.appendChild(actions);

    row.append(margin, body);
    return row;
  }

  function bodyHtmlFromText(text) {
    return escapeHtml(text).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
  }

  function isLastUserMessage(m) {
    const msgs = s.thread.messages;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") return msgs[i].id === m.id;
    }
    return false;
  }

  function textAction(label, onClick) {
    const b = document.createElement("button");
    b.className = "ft1-action";
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }
  function metaSpan(text) {
    const sp = document.createElement("span");
    sp.className = "ft1-meta";
    sp.textContent = text || "";
    return sp;
  }

  // ---------- historical execution groups (condensed, reopenable) ----------
  function renderHistoryGroup(m, g) {
    const wrap = document.createElement("div");
    wrap.className = "ft1-direction-history";
    const key = m.id + ":" + g.kind;
    const open = !!s.view.expandedGroups[key];

    const head = document.createElement("button");
    head.className = "ft1-direction";
    head.setAttribute("aria-expanded", String(open));
    if (g.kind === "activity") {
      head.innerHTML = `<span class="ft1-direction-text">[ ${escapeHtml(g.group.compactLabel || "Work")} · ${fmtDuration(g.group.workedSeconds)} ]</span>`;
    } else if (g.kind === "thoughts") {
      head.innerHTML = `<span class="ft1-direction-text">[ ${escapeHtml(g.segments[0].label)} — provider-exposed summary ]</span>`;
    } else {
      head.innerHTML = `<span class="ft1-direction-text">[ ${escapeHtml(g.record.summary || "Questions answered")} ]</span>`;
    }
    head.addEventListener("click", () => keeper.preserve(() => s.toggleGroupExpanded(key)));
    wrap.appendChild(head);

    if (open) {
      const sheet = document.createElement("div");
      sheet.className = "ft1-direction-sheet";
      if (g.kind === "activity") {
        for (const st of g.group.stages) {
          const line = document.createElement("div");
          line.className = "ft1-stage-line";
          line.innerHTML = `<span class="ft1-stage-kind">${escapeHtml(st.kind)}</span><span class="ft1-stage-label">${escapeHtml(st.label)}</span><span class="ft1-stage-dur">${fmtDuration(st.durationSeconds)}</span>`;
          if (st.items && st.items.length) {
            const items = document.createElement("div");
            items.className = "ft1-stage-items";
            items.textContent = st.items.join(" · ");
            line.appendChild(items);
          }
          if (st.added != null) {
            const chg = document.createElement("span");
            chg.className = "ft1-stage-chg";
            chg.innerHTML = `<span class="pmc-add">+${st.added}</span> <span class="pmc-del">−${st.removed}</span>`;
            line.appendChild(chg);
          }
          sheet.appendChild(line);
        }
      } else if (g.kind === "thoughts") {
        for (const seg of g.segments) {
          const p = document.createElement("p");
          p.className = "ft1-thought";
          p.textContent = seg.summary;
          sheet.appendChild(p);
        }
      } else {
        for (const qa of g.record.questionsAndAnswers) {
          const line = document.createElement("div");
          line.className = "ft1-qa";
          line.innerHTML = `<span class="ft1-qa-q">${escapeHtml(qa.question)}</span><span class="ft1-qa-a">${escapeHtml(qa.answer)}</span>`;
          sheet.appendChild(line);
        }
      }
      wrap.appendChild(sheet);
    }
    return wrap;
  }

  // ---------- live work scene ----------
  function renderWorkScene() {
    const w = workCluster();
    const existing = scriptEl.querySelector(".ft1-scene");
    if (existing) existing.remove();
    if (w.isEmpty) return;

    const scene = document.createElement("section");
    scene.className = "ft1-scene";
    scene.setAttribute("aria-label", "Active work");

    if (w.turn) {
      const dir = document.createElement("div");
      dir.className = "ft1-direction ft1-direction-live";
      dir.innerHTML = `<span class="ft1-direction-text">[ ${escapeHtml(w.turn.summary)} — ${fmtDuration(w.turn.workedSeconds)} ]</span>`;
      scene.appendChild(dir);
    }

    if (w.goal) {
      scene.appendChild(sceneBlock("goal", `Goal — ${w.goal.title}`, (body) => {
        body.innerHTML = `<div class="ft1-goal-status" data-status="${w.goal.status}">${escapeHtml(cap(w.goal.status))}</div><p class="ft1-goal-obj">${escapeHtml(w.goal.objective)}</p>`;
        if (w.goal.pendingEdit) {
          const pe = document.createElement("div");
          pe.className = "ft1-goal-replan";
          pe.innerHTML = `<strong>Replan pending:</strong> ${escapeHtml(w.goal.pendingEdit.impact)}`;
          const confirm = document.createElement("button");
          confirm.className = "pm-btn";
          confirm.dataset.variant = "primary";
          confirm.textContent = "Apply replan";
          confirm.addEventListener("click", () => s.confirmGoalEdit());
          pe.appendChild(confirm);
          body.appendChild(pe);
        }
        if (w.goal.blocked) {
          const bl = document.createElement("div");
          bl.className = "ft1-goal-blocked";
          bl.innerHTML = `
            <div><strong>Cause</strong> ${escapeHtml(w.goal.blocked.cause)}</div>
            <div><strong>Scope</strong> ${escapeHtml(w.goal.blocked.scope)}</div>
            <div><strong>Tried</strong> ${escapeHtml(w.goal.blocked.attempted)}</div>
            <div><strong>Why stopped</strong> ${escapeHtml(w.goal.blocked.whyStopped)}</div>
            <div><strong>Next safe action</strong> ${escapeHtml(w.goal.blocked.nextSafeAction)}</div>`;
          body.appendChild(bl);
        }
        const controls = document.createElement("div");
        controls.className = "ft1-goal-controls";
        goalControl(controls, "Pause", w.goal.status === "running", () => s.setGoalStatus("Paused"));
        goalControl(controls, "Resume", w.goal.status === "paused", () => s.setGoalStatus("Running"));
        goalControl(controls, "Stop", ["running", "paused", "blocked"].includes(w.goal.status), () => s.setGoalStatus("Stopped"));
        goalControl(controls, "Edit", true, () => s.editGoal(w.goal.objective + " Include CLI account isolation."));
        goalControl(controls, "Clear", ["stopped", "complete"].includes(w.goal.status), () => s.clearGoal());
        body.appendChild(controls);
      }));
    }

    if (w.todo) {
      scene.appendChild(sceneBlock("todo", `Tasks — ${w.todo.items.filter((i) => i.state === "complete").length} of ${w.todo.items.length}`, (body) => {
        for (const item of w.todo.items) {
          const line = document.createElement("div");
          line.className = "ft1-todo-line";
          line.dataset.state = item.state;
          line.innerHTML = `<span class="ft1-todo-state">${escapeHtml(TODO_STATE_LABELS[item.state] || item.state)}</span><span class="ft1-todo-label">${escapeHtml(item.label)}</span>`;
          body.appendChild(line);
        }
      }));
    }

    if (w.subagents) {
      const c = w.subagents.counts;
      scene.appendChild(sceneBlock("subagents", `${w.subagents.label} — ${c.working} working · ${c.complete} complete${c.blocked ? ` · ${c.blocked} blocked` : ""}${c.waiting ? ` · ${c.waiting} waiting` : ""}`, (body) => {
        for (const a of w.subagents.agents) {
          const line = document.createElement("div");
          line.className = "ft1-agent-line";
          line.dataset.status = a.status;
          line.innerHTML = `
            <span class="ft1-agent-name">${escapeHtml(a.name)}</span>
            <span class="ft1-agent-activity">${escapeHtml(a.currentActivity)}</span>
            <span class="ft1-agent-side">${escapeHtml(a.route || "")}${a.workedSeconds ? ` · ${fmtDuration(a.workedSeconds)}` : ""}</span>`;
          body.appendChild(line);
        }
        const note = document.createElement("p");
        note.className = "ft1-scene-note";
        note.textContent = "Children never ask you directly — their questions arrive here through the parent.";
        body.appendChild(note);
      }));
    }

    for (const d of w.diffs) {
      scene.appendChild(sceneBlock("diff", `${d.label} — ${d.files.length} files`, (body) => {
        for (const f of d.files) {
          const line = document.createElement("div");
          line.className = "ft1-diff-line";
          line.innerHTML = `<span class="ft1-diff-path">${escapeHtml(f.path)}</span><span class="ft1-stage-chg"><span class="pmc-add">+${f.added}</span> <span class="pmc-del">−${f.removed}</span></span>`;
          line.addEventListener("click", () => s.openArtifact("art-diff"));
          body.appendChild(line);
        }
      }));
    }

    scriptEl.appendChild(scene);
  }

  function sceneBlock(key, heading, fill) {
    const block = document.createElement("div");
    block.className = "ft1-scene-block";
    const id = "scene:" + key;
    const open = s.view.expandedGroups[id] !== false;
    const head = document.createElement("button");
    head.className = "ft1-scene-head";
    head.setAttribute("aria-expanded", String(open));
    head.innerHTML = `<span class="ft1-scene-heading">${escapeHtml(heading.toUpperCase())}</span>${icon(open ? "chevronUp" : "chevronDown", 11)}`;
    head.addEventListener("click", () => keeper.preserve(() => {
      s.view.expandedGroups[id] = s.view.expandedGroups[id] === false ? true : false;
      s.emit("transcript-view");
    }));
    block.appendChild(head);
    if (open) {
      const body = document.createElement("div");
      body.className = "ft1-scene-body";
      fill(body);
      block.appendChild(body);
    }
    return block;
  }

  function goalControl(host, label, enabled, onClick) {
    const b = document.createElement("button");
    b.className = "ft1-action";
    b.textContent = label;
    if (!enabled) { b.disabled = true; b.title = "Not available in this Goal state"; }
    else b.addEventListener("click", onClick);
    host.appendChild(b);
  }

  function cap(w) { return w ? w[0].toUpperCase() + w.slice(1) : ""; }

  // ---------- questionnaire form scene ----------
  function renderQuestionScene() {
    const existing = scriptEl.querySelector(".ft1-form-scene");
    if (existing) existing.remove();
    const { active, queued } = questionnaireState();
    if (!active) return;

    const scene = document.createElement("section");
    scene.className = "ft1-form-scene";
    scene.setAttribute("aria-label", "Questions");

    if (active.status === "preparing") {
      scene.innerHTML = `<div class="ft1-direction ft1-direction-live"><span class="ft1-direction-text">[ Preparing questions… ]</span></div>`;
      scriptEl.appendChild(scene);
      return;
    }
    if (active.status === "submitting") {
      scene.innerHTML = `<div class="ft1-direction ft1-direction-live"><span class="ft1-direction-text">[ Submitting answers… ]</span></div>`;
      scriptEl.appendChild(scene);
      return;
    }

    const p = questionProgress(active);
    const q = active.questions[active.currentQuestionIndex];
    const missing = scene._missing || [];

    const head = document.createElement("div");
    head.className = "ft1-form-head";
    head.innerHTML = `<span class="ft1-form-title">${escapeHtml(active.title.toUpperCase())}</span><span class="ft1-form-progress">Question ${active.currentQuestionIndex + 1} of ${active.questions.length}${queued.length ? ` · ${queued.length} more waiting` : ""}</span>`;
    scene.appendChild(head);

    const stagebox = document.createElement("div");
    stagebox.className = "ft1-form-stage";

    const prompt = document.createElement("p");
    prompt.className = "ft1-form-prompt";
    prompt.textContent = q.prompt;
    stagebox.appendChild(prompt);

    if (q.kind === "freeform") {
      const ta = document.createElement("textarea");
      ta.className = "ft1-form-freeform pm-scroll";
      ta.placeholder = "Write your answer";
      ta.value = active.freeform[q.id] || "";
      ta.addEventListener("change", () => s.answerQuestion(active.id, q.id, ta.value));
      stagebox.appendChild(ta);
    } else {
      const letters = "ABCDEFGH";
      q.options.forEach((opt, i) => {
        const row = document.createElement("button");
        row.className = "ft1-form-option";
        const sel = (q.selected || []).includes(opt);
        row.dataset.selected = String(sel);
        row.innerHTML = `<span class="ft1-form-letter">${letters[i]}</span><span>${escapeHtml(opt)}</span>${sel ? icon("check", 13) : ""}`;
        row.addEventListener("click", () => s.answerQuestion(active.id, q.id, opt, { toggle: q.kind === "multi select" }));
        stagebox.appendChild(row);
      });
      if (q.kind === "multi select") {
        const hint = document.createElement("div");
        hint.className = "ft1-form-hint";
        hint.textContent = "Choose any that apply";
        stagebox.appendChild(hint);
      }
    }
    if (active.skipped[q.id]) {
      const skipped = document.createElement("div");
      skipped.className = "ft1-form-skipped";
      skipped.innerHTML = `<span>Skipped</span>`;
      const undo = document.createElement("button");
      undo.className = "ft1-action";
      undo.textContent = QUESTIONNAIRE_ACTIONS.answerLater;
      undo.addEventListener("click", () => s.unskipQuestion(active.id, q.id));
      skipped.appendChild(undo);
      stagebox.appendChild(skipped);
    }
    if (q.required && missingIds().includes(q.id)) {
      const err = document.createElement("div");
      err.className = "ft1-form-error";
      err.textContent = "This question needs an answer (or an explicit skip) before submitting.";
      stagebox.appendChild(err);
    }
    scene.appendChild(stagebox);

    const nav = document.createElement("div");
    nav.className = "ft1-form-nav";
    const back = navBtn(QUESTIONNAIRE_ACTIONS.back, active.currentQuestionIndex > 0, () => s.navigateQuestion(active.id, active.currentQuestionIndex - 1));
    const skip = navBtn(QUESTIONNAIRE_ACTIONS.skip, !active.skipped[q.id], () => s.skipQuestion(active.id, q.id));
    const cancel = navBtn(QUESTIONNAIRE_ACTIONS.cancel, true, () => s.cancelQuestionnaire(active.id));
    cancel.classList.add("ft1-form-cancel");
    const isLast = active.currentQuestionIndex === active.questions.length - 1;
    const primary = document.createElement("button");
    primary.className = "pm-btn";
    primary.dataset.variant = "primary";
    primary.textContent = isLast ? QUESTIONNAIRE_ACTIONS.submit : QUESTIONNAIRE_ACTIONS.next;
    primary.addEventListener("click", () => {
      if (!isLast) return s.navigateQuestion(active.id, active.currentQuestionIndex + 1);
      const res = s.submitQuestionnaire(active.id);
      if (!res.ok && res.missing) {
        scene._missingCache = res.missing;
        const firstMissing = active.questions.findIndex((x) => res.missing.includes(x.id));
        if (firstMissing >= 0) s.navigateQuestion(active.id, firstMissing);
      }
    });
    const dots = document.createElement("div");
    dots.className = "ft1-form-dots";
    active.questions.forEach((qq, i) => {
      const d = document.createElement("button");
      d.className = "ft1-form-dot";
      d.setAttribute("aria-label", `Go to question ${i + 1}`);
      d.dataset.state = active.skipped[qq.id] ? "skipped" : (qq.selected && qq.selected.length) ? "answered" : "open";
      d.dataset.current = String(i === active.currentQuestionIndex);
      d.addEventListener("click", () => s.navigateQuestion(active.id, i));
      dots.appendChild(d);
    });
    nav.append(back, skip, dots, cancel, primary);
    scene.appendChild(nav);
    scriptEl.appendChild(scene);

    function missingIds() {
      return scene._missingCache || [];
    }
  }

  function navBtn(label, enabled, onClick) {
    const b = document.createElement("button");
    b.className = "ft1-action";
    b.textContent = label;
    if (!enabled) b.disabled = true;
    else b.addEventListener("click", onClick);
    return b;
  }

  // ---------- lens apply bar ----------
  function renderLensBar() {
    const pending = Object.values(s.lensState.selections).filter((v) => v === "subcompact-pending").length;
    lensBar.replaceChildren();
    if (!pending) return;
    const bar = document.createElement("div");
    bar.className = "fwt-lens-applybar";
    bar.innerHTML = `${icon("compress", 13)}<span>${pending} message${pending > 1 ? "s" : ""} marked for Subcompact — Apply covers up to 25 at once</span>`;
    const apply = document.createElement("button");
    apply.textContent = "Apply";
    apply.addEventListener("click", () => s.lensApplySubcompact());
    bar.appendChild(apply);
    lensBar.appendChild(bar);
  }

  // ---------- events ----------
  const un = [
    s.on("transcript", (d) => { render(); if (d && (d.appended || d.jumpTo)) afterAppend(d); }),
    s.on("transcript-view", render),
    s.on("thread", render),
    s.on("work", render),
    s.on("question", render),
    s.on("lens", render),
    s.on("turn-tick", () => {
      const live = scriptEl.querySelector(".ft1-direction-live .ft1-direction-text");
      const turn = s.turn;
      if (live && turn && turn.active) live.textContent = `[ ${turn.summary} — ${fmtDuration(turn.workedSeconds)} ]`;
    }),
  ];

  function afterAppend(d) {
    if (d.jumpTo) keeper.scrollToMessage(d.jumpTo);
    else keeper.followIfAtBottom();
    syncJump();
  }
  function syncJump() { jump.hidden = keeper.atBottom; }

  render();
  // Land at the latest message once concept CSS has settled layout.
  keeper.jumpToLatest();
  requestAnimationFrame(() => { keeper.jumpToLatest(); syncJump(); });
  setTimeout(() => { if (keeper.atBottom) keeper.jumpToLatest(); syncJump(); }, 420);

  return {
    el,
    destroy() {
      un.forEach((u) => u());
      composer.destroy();
      selectorRow.destroy();
    },
  };
}
