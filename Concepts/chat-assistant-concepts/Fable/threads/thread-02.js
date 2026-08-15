// Fable — Thread 02 "Courier".
// Design thesis: messages are deliveries with visible spatial lineage. A sent
// message physically leaves the composer and travels up into its durable slot;
// nothing teleports. Live work is one evolving locus pill above the composer
// that changes phase in place and finally condenses into the reply's own
// "tools used" seam (videos 1 + 3).
// Motion thesis: carriage — a single vertical travel axis for deliveries, FLIP
// from the composer to the slot; the locus pill never moves, only transforms.

import { store } from "../shared/store.js";
import { icon } from "../shared/icons.js";
import { ensureCss } from "../shared/contracts.js";
import { escapeHtml } from "../shared/popup.js";
import {
  transcriptSlice, isLongMessage, isExpanded, previewText, lensMark, copyMessage,
  workCluster, createScrollKeeper, questionnaireState, questionProgress,
  activityGroups, bodyHtml, liveTurn, PHASE_KIND_ICONS,
} from "../shared/thread-common.js";
import { createComposer, createSelectorRow, createDecisionStack, openMoreInfo, openMessageOps } from "../shared/components.js";
import { fmtDuration, fmtTime, workedLabel, JUMP_TO_LATEST, QUESTIONNAIRE_ACTIONS, TODO_STATE_LABELS } from "../shared/strings.js";

export function createThread(ctx) {
  ensureCss("threads/thread-base.css");
  ensureCss("threads/thread-02.css");
  const s = ctx.store;

  const el = ctx.el;
  el.classList.add("fwt-column", "ft2-root");
  el.innerHTML = `
    <div class="fwt-scrollwrap">
      <div class="fwt-scroll pm-scroll ft2-scroll"><div class="ft2-lane"></div></div>
    </div>
    <div class="ft2-dockband"></div>
    <div class="fwt-composer-region ft2-composer-region"></div>`;

  const scrollEl = el.querySelector(".ft2-scroll");
  const scrollWrap = el.querySelector(".fwt-scrollwrap");
  const laneEl = el.querySelector(".ft2-lane");
  const dockband = el.querySelector(".ft2-dockband");
  const composerRegion = el.querySelector(".ft2-composer-region");
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

  // ---------- transcript ----------
  function render() {
    keeper.preserve(() => {
      laneEl.replaceChildren();
      const slice = transcriptSlice();
      if (slice.olderCount > 0) {
        const older = document.createElement("div");
        older.className = "fwt-older";
        older.innerHTML = `<span>${slice.olderCount} earlier deliveries stay sealed — search opens them</span>`;
        const btn = document.createElement("button");
        btn.textContent = "Unseal earlier";
        btn.addEventListener("click", () => slice.loadOlder());
        older.appendChild(btn);
        laneEl.appendChild(older);
      }
      for (const m of slice.messages) laneEl.appendChild(renderMessage(m));
    });
    renderDockband();
    renderLensBar();
    keeper.followIfAtBottom();
    requestAnimationFrame(() => { jump.hidden = keeper.atBottom; });
  }

  function renderMessage(m) {
    const row = document.createElement("article");
    row.className = "ft2-row";
    row.dataset.mid = m.id;
    row.dataset.role = m.role;

    const bubble = document.createElement("div");
    bubble.className = "ft2-bubble";

    const mark = lensMark(m);
    if (mark || m.redirect || m.interrupted) {
      const flags = document.createElement("div");
      flags.className = "ft2-flags";
      if (mark) flags.innerHTML += `<span class="fwt-lens-flag" data-op="${mark}">${mark === "mute" ? "Muted" : mark === "focus" ? "Focused" : mark === "subcompact" ? "Subcompacted" : "Subcompact pending"}</span>`;
      if (m.redirect) flags.innerHTML += `<span class="fwt-redirect-flag">${icon("swap", 10)}<span>redirect</span></span>`;
      if (m.interrupted) flags.innerHTML += `<span class="fwt-redirect-flag">stopped</span>`;
      bubble.appendChild(flags);
    }

    const prose = document.createElement("div");
    prose.className = "ft2-prose";
    const long = isLongMessage(m);
    const expanded = isExpanded(m);
    prose.innerHTML = long && !expanded ? `<p>${escapeHtml(previewText(m)).replace(/\n/g, "<br>")}</p>` : bodyHtml(m);
    bubble.appendChild(prose);

    if (long) {
      const fold = document.createElement("button");
      fold.className = "ft2-fold";
      fold.innerHTML = expanded ? `${icon("chevronUp", 11)}<span>Fold</span>` : `${icon("chevronDown", 11)}<span>Unfold full message</span>`;
      fold.addEventListener("click", () => keeper.preserve(() => s.toggleMessageExpanded(m.id)));
      bubble.appendChild(fold);
    }

    // Condensed tools seam inside the delivery (video 3 retrospect).
    for (const g of activityGroups(m)) bubble.appendChild(renderSeam(m, g));

    const actions = document.createElement("div");
    actions.className = "ft2-actions";
    const rt = m.runtime || {};
    const canEdit = m.role === "user" && m.eligibleForEdit && isLastUser(m);
    const mk = (label, fn) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.addEventListener("click", fn);
      return b;
    };
    actions.append(
      mk("Copy", () => copyMessage(m)),
      ...(canEdit ? [mk("Edit", () => { s.setDraft(m.body); s.addReceipt({ kind: "edit", title: "Editing your message", detail: "Original stays; sending supersedes." }); })] : []),
      span(`${rt.provider || ""}`),
      span(`${rt.model || ""}`),
      span(workedLabel(false, rt.workedSeconds)),
      mk("More Info", (e) => openMoreInfo(e.currentTarget, m)),
    );
    actions.addEventListener("contextmenu", (e) => { e.preventDefault(); openMessageOps(actions, m); });
    const ops = mk("Context", (e) => openMessageOps(e.currentTarget, m));
    ops.className = "ft2-ops";
    actions.append(ops);

    const stamp = document.createElement("span");
    stamp.className = "ft2-stamp";
    stamp.textContent = fmtTime(m.sentAt);

    row.append(bubble, actions, stamp);
    return row;
  }

  function span(text) { const sp = document.createElement("span"); sp.className = "ft2-meta"; sp.textContent = text; return sp; }
  function isLastUser(m) {
    const msgs = s.thread.messages;
    for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === "user") return msgs[i].id === m.id;
    return false;
  }

  function renderSeam(m, g) {
    const seam = document.createElement("div");
    seam.className = "ft2-seam";
    const key = m.id + ":" + g.kind;
    const open = !!s.view.expandedGroups[key];
    const head = document.createElement("button");
    head.className = "ft2-seam-head";
    head.setAttribute("aria-expanded", String(open));
    const label = g.kind === "activity" ? `${g.group.compactLabel} · ${fmtDuration(g.group.workedSeconds)}`
      : g.kind === "thoughts" ? `${g.segments[0].label} — summary`
      : (g.record.summary || "Questions answered");
    // Condensed icon strip (video 3): the phase-kind sequence rides on the seam.
    const strip = g.kind === "activity"
      ? `<span class="ft2-seam-strip" aria-hidden="true">${g.group.stages.map((st) => icon(PHASE_KIND_ICONS[st.kind] || "dot", 11)).join("")}</span>`
      : icon(g.kind === "thoughts" ? "eye" : "question", 12);
    head.innerHTML = `${strip}<span>${escapeHtml(label)}</span>${icon(open ? "chevronUp" : "chevronDown", 10)}`;
    head.addEventListener("click", () => keeper.preserve(() => s.toggleGroupExpanded(key)));
    seam.appendChild(head);
    if (open) {
      const body = document.createElement("div");
      body.className = "ft2-seam-body";
      if (g.kind === "activity") {
        for (const st of g.group.stages) {
          const line = document.createElement("div");
          line.className = "ft2-seam-line";
          line.innerHTML = `<span class="ft2-seam-kind">${escapeHtml(st.kind)}</span><span>${escapeHtml(st.label)}</span><span class="ft2-seam-dur">${fmtDuration(st.durationSeconds)}</span>`;
          body.appendChild(line);
          if (st.items && st.items.length) {
            const items = document.createElement("div");
            items.className = "ft2-seam-items";
            items.textContent = st.items.join(" · ");
            body.appendChild(items);
          }
        }
      } else if (g.kind === "thoughts") {
        for (const seg of g.segments) {
          const p = document.createElement("p");
          p.className = "ft2-seam-thought";
          p.textContent = seg.summary;
          body.appendChild(p);
        }
      } else {
        for (const qa of g.record.questionsAndAnswers) {
          const line = document.createElement("div");
          line.className = "ft2-seam-line";
          line.innerHTML = `<span class="ft2-seam-kind">Q</span><span>${escapeHtml(qa.question)} — <strong>${escapeHtml(qa.answer)}</strong></span>`;
          body.appendChild(line);
        }
      }
      seam.appendChild(body);
    }
    return seam;
  }

  // ---------- dockband: locus pill + questionnaire morph + work summary ----------
  function renderDockband() {
    dockband.replaceChildren();
    const w = workCluster();
    const { active } = questionnaireState();

    // Questionnaire morph takes priority in the band (video 4 lifecycle).
    if (active) { dockband.appendChild(renderQuestionMorph(active)); return; }

    const lt = liveTurn();
    if (lt) {
      const pill = document.createElement("div");
      pill.className = "ft2-locus";
      pill.dataset.redirected = String(lt.redirected);
      pill.innerHTML = `
        <span class="ft2-locus-ring" aria-hidden="true"></span>
        ${icon(PHASE_KIND_ICONS[lt.phaseKind] || "spark", 12)}
        <span class="ft2-locus-text">${escapeHtml(lt.summary)}</span>
        <span class="ft2-locus-time">${fmtDuration(lt.workedSeconds)}</span>`;
      dockband.appendChild(pill);
      // The delivery in progress: phase detail rows accumulate under the pill
      // and are replaced when the phase changes.
      if (lt.items.length) {
        const rows = document.createElement("div");
        rows.className = "ft2-locus-rows";
        for (const item of lt.items) {
          const r = document.createElement("div");
          r.className = "ft2-seam-line";
          r.innerHTML = `<span class="ft2-seam-kind">${escapeHtml((lt.phaseKind || "").replace(/_/g, " "))}</span><span>${escapeHtml(item.text)}</span>${item.side ? `<span class="ft2-seam-dur">${escapeHtml(item.side)}</span>` : ""}`;
          rows.appendChild(r);
        }
        dockband.appendChild(rows);
      }
    }

    if (!w.isEmpty && (w.goal || w.todo || w.subagents || w.diffs.length)) {
      dockband.appendChild(renderManifest(w));
    }
  }

  // The delivery manifest — Courier's compact work cluster.
  function renderManifest(w) {
    const man = document.createElement("div");
    man.className = "ft2-manifest";
    const open = s.view.expandedGroups["ft2:manifest"] !== false;

    const head = document.createElement("button");
    head.className = "ft2-manifest-head";
    const bits = [];
    if (w.goal) bits.push(`Goal ${w.goal.status}`);
    if (w.todo) bits.push(`${w.todo.items.filter((i) => i.state === "complete").length}/${w.todo.items.length} tasks`);
    if (w.subagents) bits.push(`${w.subagents.counts.working} working`);
    if (w.diffs.length) bits.push(`${w.diffs.reduce((n, d) => n + d.files.length, 0)} files changed`);
    head.innerHTML = `${icon("todo", 12)}<span>${escapeHtml(bits.join(" · "))}</span>${icon(open ? "chevronDown" : "chevronUp", 10)}`;
    head.addEventListener("click", () => { s.view.expandedGroups["ft2:manifest"] = !open; s.emit("transcript-view"); });
    man.appendChild(head);

    if (open) {
      const body = document.createElement("div");
      body.className = "ft2-manifest-body";
      if (w.goal) {
        const g = document.createElement("div");
        g.className = "ft2-mani-goal";
        g.dataset.status = w.goal.status;
        const phaseTxt = w.goal.phases ? ` · ${w.goal.phases[w.goal.phaseIndex || 0]} ${(w.goal.phaseIndex || 0) + 1}/${w.goal.phases.length}` : "";
        g.innerHTML = `<span class="ft2-mani-status">${escapeHtml(w.goal.status)}${escapeHtml(phaseTxt)}${w.goal.replanApplied ? " · replanned" : ""}</span><span class="ft2-mani-title">${escapeHtml(w.goal.title)}</span>`;
        const ctrl = document.createElement("span");
        ctrl.className = "ft2-mani-ctrl";
        const btn = (label, ok, fn) => { const b = document.createElement("button"); b.textContent = label; if (!ok) b.disabled = true; else b.addEventListener("click", fn); return b; };
        ctrl.append(
          btn("Pause", w.goal.status === "running", () => s.setGoalStatus("Paused")),
          btn("Resume", w.goal.status === "paused", () => s.setGoalStatus("Running")),
          btn("Stop", ["running", "paused", "blocked"].includes(w.goal.status), () => s.setGoalStatus("Stopped")),
        );
        g.appendChild(ctrl);
        if (w.goal.blocked) {
          const bl = document.createElement("div");
          bl.className = "ft2-mani-blocked";
          bl.innerHTML = `<strong>Blocked:</strong> ${escapeHtml(w.goal.blocked.cause)} — next safe action: ${escapeHtml(w.goal.blocked.nextSafeAction)}`;
          g.appendChild(bl);
        }
        body.appendChild(g);
      }
      if (w.todo) {
        const list = document.createElement("div");
        list.className = "ft2-mani-todos";
        for (const item of w.todo.items) {
          const li = document.createElement("span");
          li.className = "ft2-mani-todo";
          li.dataset.state = item.state;
          li.title = `${TODO_STATE_LABELS[item.state] || item.state} — ${item.label}`;
          li.innerHTML = `<span class="ft2-todo-tick" aria-hidden="true"></span><span>${escapeHtml(item.label)}</span>`;
          list.appendChild(li);
        }
        body.appendChild(list);
      }
      if (w.subagents) {
        const ag = document.createElement("div");
        ag.className = "ft2-mani-agents";
        for (const a of w.subagents.agents) {
          const line = document.createElement("div");
          line.className = "ft2-mani-agent";
          line.dataset.status = a.status;
          line.innerHTML = `<span class="ft2-agent-dotmark" aria-hidden="true"></span><span class="ft2-agent-name">${escapeHtml(a.name)}</span><span class="ft2-agent-act">${escapeHtml(a.currentActivity)}</span>`;
          ag.appendChild(line);
        }
        body.appendChild(ag);
      }
      for (const d of w.diffs) {
        const line = document.createElement("button");
        line.className = "ft2-mani-diff";
        line.innerHTML = `${icon("diff", 11)}<span>${escapeHtml(d.label)}</span><span class="ft2-seam-dur">${d.files.length} files</span>`;
        line.addEventListener("click", () => s.openArtifact("art-diff"));
        body.appendChild(line);
      }
      man.appendChild(body);
    }
    return man;
  }

  // ---------- questionnaire: pill that morphs into a card and back ----------
  function renderQuestionMorph(active) {
    const wrap = document.createElement("div");
    wrap.className = "ft2-qmorph";

    if (active.status === "preparing") {
      wrap.dataset.stage = "pill";
      wrap.innerHTML = `<div class="ft2-qpill">${icon("question", 13)}<span>Preparing questions…</span></div>`;
      return wrap;
    }
    if (active.status === "submitting") {
      wrap.dataset.stage = "pill";
      wrap.innerHTML = `<div class="ft2-qpill">${icon("send", 13)}<span>Submitting answers…</span></div>`;
      return wrap;
    }

    wrap.dataset.stage = "card";
    const q = active.questions[active.currentQuestionIndex];
    const card = document.createElement("div");
    card.className = "ft2-qcard";

    const head = document.createElement("div");
    head.className = "ft2-qcard-head";
    head.innerHTML = `<span class="ft2-qcard-title">${escapeHtml(active.title)}</span><span class="ft2-qcard-progress">${active.currentQuestionIndex + 1} of ${active.questions.length}</span>`;
    card.appendChild(head);

    const stage = document.createElement("div");
    stage.className = "ft2-qcard-stage";
    const prompt = document.createElement("p");
    prompt.className = "ft2-qcard-prompt";
    prompt.textContent = q.prompt;
    stage.appendChild(prompt);

    if (q.kind === "freeform") {
      const ta = document.createElement("textarea");
      ta.className = "ft2-qcard-freeform pm-scroll";
      ta.placeholder = "Type your answer";
      ta.value = active.freeform[q.id] || "";
      ta.addEventListener("change", () => s.answerQuestion(active.id, q.id, ta.value));
      stage.appendChild(ta);
    } else {
      for (const opt of q.options) {
        const sel = (q.selected || []).includes(opt);
        const row = document.createElement("button");
        row.className = "ft2-qopt";
        row.dataset.selected = String(sel);
        row.innerHTML = `<span class="ft2-qopt-radio" data-multi="${q.kind === "multi select"}" aria-hidden="true"></span><span>${escapeHtml(opt)}</span>`;
        row.addEventListener("click", () => s.answerQuestion(active.id, q.id, opt, { toggle: q.kind === "multi select" }));
        stage.appendChild(row);
      }
    }
    if (active.skipped[q.id]) {
      const sk = document.createElement("div");
      sk.className = "ft2-qskipped";
      sk.innerHTML = `<span>Skipped</span>`;
      const undo = document.createElement("button");
      undo.textContent = QUESTIONNAIRE_ACTIONS.answerLater;
      undo.addEventListener("click", () => s.unskipQuestion(active.id, q.id));
      sk.appendChild(undo);
      stage.appendChild(sk);
    }
    card.appendChild(stage);

    const nav = document.createElement("div");
    nav.className = "ft2-qnav";
    const back = mkNav(QUESTIONNAIRE_ACTIONS.back, active.currentQuestionIndex > 0, () => s.navigateQuestion(active.id, active.currentQuestionIndex - 1));
    // Video 2/4 refinement: once the current question holds an answer, Skip
    // yields its slot to the primary action.
    const answered = (q.selected || []).length > 0;
    const skip = mkNav(QUESTIONNAIRE_ACTIONS.skip, !active.skipped[q.id] && !answered, () => s.skipQuestion(active.id, q.id));
    if (answered) skip.classList.add("ft2-qskip-yielded");
    const cancel = mkNav(QUESTIONNAIRE_ACTIONS.cancel, true, () => s.cancelQuestionnaire(active.id));
    cancel.classList.add("ft2-qcancel");
    const isLast = active.currentQuestionIndex === active.questions.length - 1;
    const primary = document.createElement("button");
    primary.className = "pm-btn";
    primary.dataset.variant = "primary";
    primary.textContent = isLast ? QUESTIONNAIRE_ACTIONS.submit : QUESTIONNAIRE_ACTIONS.next;
    primary.addEventListener("click", () => {
      if (!isLast) return s.navigateQuestion(active.id, active.currentQuestionIndex + 1);
      const res = s.submitQuestionnaire(active.id);
      if (!res.ok && res.missing) {
        const firstMissing = active.questions.findIndex((x) => res.missing.includes(x.id));
        prompt.insertAdjacentHTML("beforebegin", `<div class="ft2-qerror">Required questions still need answers or explicit skips.</div>`);
        if (firstMissing >= 0) setTimeout(() => s.navigateQuestion(active.id, firstMissing), 900);
      }
    });
    const trail = document.createElement("div");
    trail.className = "ft2-qtrail";
    active.questions.forEach((qq, i) => {
      const seg = document.createElement("button");
      seg.className = "ft2-qtrail-seg";
      seg.setAttribute("aria-label", `Question ${i + 1}`);
      seg.dataset.state = active.skipped[qq.id] ? "skipped" : (qq.selected && qq.selected.length) ? "answered" : "open";
      seg.dataset.current = String(i === active.currentQuestionIndex);
      seg.addEventListener("click", () => s.navigateQuestion(active.id, i));
      trail.appendChild(seg);
    });
    nav.append(back, skip, trail, cancel, primary);
    card.appendChild(nav);
    wrap.appendChild(card);
    return wrap;
  }

  function mkNav(label, enabled, fn) {
    const b = document.createElement("button");
    b.className = "ft2-qnavbtn";
    b.textContent = label;
    if (!enabled) b.disabled = true;
    else b.addEventListener("click", fn);
    return b;
  }

  function renderLensBar() {
    const pending = Object.values(s.lensState.selections).filter((v) => v === "subcompact-pending").length;
    lensBar.replaceChildren();
    if (!pending) return;
    const bar = document.createElement("div");
    bar.className = "fwt-lens-applybar";
    bar.innerHTML = `${icon("compress", 13)}<span>${pending} marked for Subcompact</span>`;
    const apply = document.createElement("button");
    apply.textContent = "Apply";
    apply.addEventListener("click", () => s.lensApplySubcompact());
    bar.appendChild(apply);
    lensBar.appendChild(bar);
  }

  // ---------- delivery travel (FLIP from composer) ----------
  function animateDelivery(mid) {
    const rowEl = laneEl.querySelector(`[data-mid="${mid}"]`);
    if (!rowEl || document.documentElement.getAttribute("data-reduced-motion") === "1") return;
    const target = rowEl.getBoundingClientRect();
    const from = composerRegion.getBoundingClientRect();
    const dy = from.top - target.top;
    if (dy > 20 && dy < 900) {
      rowEl.animate(
        [{ transform: `translateY(${dy}px) scale(0.98)`, opacity: 0.7 }, { transform: "none", opacity: 1 }],
        { duration: 380, easing: "cubic-bezier(0.22, 0.9, 0.28, 1)" }
      );
    }
  }

  const un = [
    s.on("transcript", (d) => {
      render();
      // Smooth follow: the surrounding thread visibly yields while the new
      // delivery travels (video 1's shared-motion principle).
      if (d && d.appended) { keeper.followIfAtBottom(true); animateDelivery(d.appended); }
      if (d && d.jumpTo) keeper.scrollToMessage(d.jumpTo);
    }),
    s.on("transcript-view", render),
    s.on("thread", render),
    s.on("work", render),
    s.on("question", render),
    s.on("lens", render),
    s.on("turn-tick", () => {
      const t = s.turn;
      const timeEl = dockband.querySelector(".ft2-locus-time");
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
