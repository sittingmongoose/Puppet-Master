(() => {
  const ID = "t1";

  const GOAL_LABELS = { running: "Running", paused: "Paused", blocked: "Blocked", stopped: "Stopped", complete: "Complete" };
  const SETTLE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  /* Measured-prose entrance: a calm settle — an 18px rise on a long ease-out
     so a mid-frame visibly reads as a paragraph being laid onto the page. */
  function enterMsg(el, index) {
    if (!window.PMAnim || window.PMAnim.reduced()) return;
    try {
      el.animate(
        [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }],
        { duration: 400, delay: Math.min(index * 40, 240), easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
      );
    } catch (e) {}
  }

  /* ---- questionnaire: a quiet prose card, one question at a time ---- */

  function questSlideHtml(api, question) {
    const ans = api.answer(question) || {};
    if (question.kind === "freeform") {
      return '<div class="pmq-t1q-prompt">' + api.esc(question.prompt) + "</div>" +
        '<textarea class="pmq-t1q-free" rows="3" spellcheck="true" placeholder="Add a note" data-free>' + api.esc(ans.draft || "") + "</textarea>";
    }
    const multi = question.kind === "multi select";
    const opts = question.options.map(o => {
      const on = (ans.selected || []).includes(o);
      return '<button class="pmq-t1q-opt' + (on ? " pmq-on" : "") + '" type="button" data-opt="' + api.esc(o) + '" aria-pressed="' + on + '">' +
        '<span class="pmq-t1q-dot' + (multi ? " pmq-t1q-dot-multi" : "") + '"></span>' +
        '<span class="pmq-t1q-opttext">' + api.esc(o) + "</span></button>";
    }).join("");
    return '<div class="pmq-t1q-prompt">' + api.esc(question.prompt) +
      (question.required ? "" : ' <span class="pmq-t1q-optional">Optional</span>') + "</div>" +
      '<div class="pmq-t1q-opts">' + opts + "</div>";
  }

  function questRenderer(zoneEl, api) {
    /* Causal lifecycle (video 04): the "Preparing questions…" pill comes
       first; the capsule rises in after a beat (at once under reduced
       motion). */
    const pillEl = api.reduced() ? null : api.preparePill();

    const el = document.createElement("div");
    el.className = "pmq-t1-quest";
    let lastIdx = api.index();
    let reviewing = false;
    el.innerHTML =
      '<div class="pmq-t1q-head">' +
        '<span class="pmq-t1q-prog">Question <span data-qnum>' + (lastIdx + 1) + " of " + api.q.questions.length + "</span></span>" +
        '<button class="pmq-t1q-x" type="button" data-qx aria-label="Cancel questionnaire" title="Cancel questionnaire">×</button>' +
      "</div>" +
      '<div class="pmq-t1q-view"><div class="pmq-t1q-slide">' + questSlideHtml(api, api.q.questions[lastIdx]) + "</div></div>" +
      '<div class="pmq-t1q-foot">' +
        '<button class="pmq-t1q-btn" type="button" data-qprev>Previous</button>' +
        '<span class="pmq-t1q-spacer"></span>' +
        '<button class="pmq-t1q-btn pmq-t1q-skip" type="button" data-qskip>Skip</button>' +
        '<button class="pmq-t1q-btn" type="button" data-qnext>Next</button>' +
        '<button class="pmq-t1q-btn" type="button" data-qback hidden>Back</button>' +
        '<button class="pmq-t1q-btn pmq-t1q-submit" type="button" data-qreview hidden>Review answers</button>' +
        '<button class="pmq-t1q-btn pmq-t1q-submit" type="button" data-qsubmit hidden>Submit</button>' +
      "</div>";

    let prepTimer = null;
    let dead = false;
    function mountCard() {
      prepTimer = null;
      if (dead) return;
      if (pillEl && pillEl.parentNode) pillEl.parentNode.removeChild(pillEl);
      zoneEl.appendChild(el);
      if (!api.reduced()) {
        try {
          el.animate(
            [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
            { duration: 340, easing: SETTLE_EASE, fill: "backwards" }
          );
        } catch (e) {}
      }
    }
    if (pillEl) prepTimer = setTimeout(mountCard, 350);
    else mountCard();

    const view = el.querySelector(".pmq-t1q-view");

    function chrome(q, idx) {
      const last = idx >= q.questions.length - 1;
      const progEl = el.querySelector(".pmq-t1q-prog");
      if (progEl) {
        if (reviewing && progEl.dataset.pmqState !== "review") {
          progEl.dataset.pmqState = "review";
          progEl.innerHTML = '<span data-qnum>Review</span>';
        } else if (!reviewing && progEl.dataset.pmqState === "review") {
          progEl.dataset.pmqState = "";
          progEl.innerHTML = 'Question <span data-qnum>' + (idx + 1) + " of " + q.questions.length + "</span>";
        }
      }
      const numCell = el.querySelector("[data-qnum]");
      const numText = reviewing ? "Review" : (idx + 1) + " of " + q.questions.length;
      if (numCell && numCell.textContent !== numText) api.A.crossfadeNum(numCell, numText);
      const prev = el.querySelector("[data-qprev]");
      const next = el.querySelector("[data-qnext]");
      const skip = el.querySelector("[data-qskip]");
      const back = el.querySelector("[data-qback]");
      const reviewBtn = el.querySelector("[data-qreview]");
      const submit = el.querySelector("[data-qsubmit]");
      if (reviewing) {
        if (prev) prev.hidden = true;
        if (next) next.hidden = true;
        if (skip) skip.hidden = true;
        if (reviewBtn) reviewBtn.hidden = true;
        if (back) back.hidden = false;
        if (submit) { submit.hidden = false; submit.disabled = !api.valid(); }
        return;
      }
      if (prev) prev.disabled = idx === 0;
      if (next) next.hidden = last;
      if (skip) skip.hidden = false;
      if (back) back.hidden = true;
      if (submit) submit.hidden = true;
      if (reviewBtn) { reviewBtn.hidden = !last; reviewBtn.disabled = !api.valid(); }
    }

    function refreshSlide(q, idx) {
      const question = q.questions[idx];
      const ans = api.answer(question) || {};
      if (question.kind === "freeform") {
        const ta = view.querySelector("[data-free]");
        if (ta && document.activeElement !== ta && ta.value !== (ans.draft || "")) ta.value = ans.draft || "";
        return;
      }
      view.querySelectorAll(".pmq-t1q-opt").forEach(opt => {
        const on = (ans.selected || []).includes(opt.dataset.opt);
        opt.classList.toggle("pmq-on", on);
        opt.setAttribute("aria-pressed", String(on));
      });
    }

    /* Old question fades up and out; the next rises into place — one calm
       beat, never a slide-show. */
    function swapSlide(html) {
      const old = view.querySelector(".pmq-t1q-slide");
      const incoming = document.createElement("div");
      incoming.className = "pmq-t1q-slide";
      incoming.innerHTML = html;
      if (api.reduced() || !old || typeof old.animate !== "function") {
        if (old) old.remove();
        view.appendChild(incoming);
        return;
      }
      view.appendChild(incoming);
      try {
        old.animate(
          [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-10px)" }],
          { duration: 200, easing: "cubic-bezier(0.4, 0, 1, 1)" }
        ).finished.then(() => { if (old.parentNode) old.remove(); }).catch(() => { if (old.parentNode) old.remove(); });
        incoming.animate(
          [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
          { duration: 260, easing: SETTLE_EASE }
        );
      } catch (e) { if (old.parentNode) old.remove(); }
    }
    function toSlide(q, idx) { swapSlide(questSlideHtml(api, q.questions[idx])); }

    /* Video 02 review: the answers read as quiet prose inside the capsule
       body; Back returns to the last question. */
    function enterReview() {
      if (reviewing) return;
      reviewing = true;
      swapSlide(api.reviewHtml());
      chrome(api.q, lastIdx);
    }
    function exitReview() {
      if (!reviewing) return;
      reviewing = false;
      swapSlide(questSlideHtml(api, api.q.questions[lastIdx]));
      chrome(api.q, lastIdx);
    }

    el.addEventListener("click", e => {
      const rev = e.target.closest("[data-revto]");
      if (rev) {
        const i = parseInt(rev.dataset.revto, 10);
        if (!isNaN(i)) {
          if (i === lastIdx) exitReview();
          else { reviewing = false; api.gotoQuestion(i); }
        }
        return;
      }
      if (e.target.closest("[data-qback]")) { exitReview(); return; }
      const question = api.q.questions[api.index()];
      const opt = e.target.closest("[data-opt]");
      if (opt) { api.select(question, opt.dataset.opt); return; }
      if (e.target.closest("[data-qx]")) { api.cancel(); return; }
      if (e.target.closest("[data-qprev]")) { api.prev(); return; }
      if (e.target.closest("[data-qnext]")) { api.next(); return; }
      if (e.target.closest("[data-qskip]")) { api.skip(); return; }
      if (e.target.closest("[data-qreview]")) { if (api.valid()) enterReview(); return; }
      if (e.target.closest("[data-qsubmit]")) { if (api.valid()) api.submit(); return; }
    });

    el.addEventListener("input", e => {
      if (e.target.matches("[data-free]")) api.setFree(api.q.questions[api.index()], e.target.value);
    });

    chrome(api.q, lastIdx);

    return {
      update(q, idx) {
        if (reviewing) {
          /* Any navigation back to a question index exits review. */
          if (idx !== lastIdx) {
            reviewing = false;
            swapSlide(questSlideHtml(api, q.questions[idx]));
            lastIdx = idx;
          }
          chrome(q, idx);
          return;
        }
        if (idx !== lastIdx) { toSlide(q, idx); lastIdx = idx; }
        else refreshSlide(q, idx);
        chrome(q, idx);
      },
      unmount() {
        dead = true;
        if (prepTimer) { clearTimeout(prepTimer); prepTimer = null; }
        if (pillEl && pillEl.parentNode) pillEl.parentNode.removeChild(pillEl);
        if (el.parentNode) el.parentNode.removeChild(el);
      }
    };
  }

  /* ---- work: one capsule strip line over a nested disclosure ---- */

  function workRender(container, key, wapi) {
    const d = wapi.data;
    const hasDiff = d.diffAdds > 0 || d.diffDels > 0;
    if (!d.goalStatus && !d.todoTotal && !d.agents && !hasDiff && !d.approvals && !d.warnings && !d.live && !d.grant && !d.capacity && !d.ops && !d.bsd && !d.attach) return;

    const segs = [];
    if (d.goalStatus) {
      segs.push('<span class="pmq-t1-wseg">Goal · <span class="pmq-t1-wval" data-wcell="goal">' +
        wapi.esc(d.goalPhase || GOAL_LABELS[d.goalStatus] || d.goalStatus) + "</span></span>");
    }
    if (d.todoTotal > 0) {
      segs.push('<span class="pmq-t1-wseg"><span class="pmq-t1-wval" data-wcell="todo">' +
        d.todoDone + " of " + d.todoTotal + "</span> tasks</span>");
    }
    if (d.agents > 0) {
      let ag = '<span class="pmq-t1-wval" data-wcell="agents">' + d.agents + "</span> agents";
      if (d.queued > 0) ag += ' · <span class="pmq-t1-wval pmq-t1-wsub" data-wcell="queued">' + d.queued + "</span> queued";
      if (d.blocked > 0) ag += ' · <span class="pmq-t1-wval pmq-t1-wsub" data-wcell="blocked">' + d.blocked + "</span> blocked";
      segs.push('<span class="pmq-t1-wseg">' + ag + "</span>");
    }
    if (hasDiff) {
      segs.push('<span class="pmq-t1-wseg"><span class="pmq-t1-wval pmq-t1-wadd" data-wcell="adds">+' + d.diffAdds +
        '</span> <span class="pmq-t1-wval pmq-t1-wdel" data-wcell="dels">−' + d.diffDels + "</span></span>");
    }
    if (d.approvals > 0) {
      segs.push('<span class="pmq-t1-wseg"><span class="pmq-t1-wval" data-wcell="approvals">' + d.approvals + "</span> approvals</span>");
    }
    if (d.warnings > 0) {
      segs.push('<span class="pmq-t1-wseg"><span class="pmq-t1-wval" data-wcell="warnings">' + d.warnings + "</span> warnings</span>");
    }
    if (d.grant) segs.push('<span class="pmq-t1-wseg">cross-project grant</span>');
    if (d.capacity > 0) segs.push('<span class="pmq-t1-wseg">capacity forecast</span>');
    if (d.ports > 0) segs.push('<span class="pmq-t1-wseg">port ' + d.ports + '</span>');
    if (d.bsd > 0) segs.push('<span class="pmq-t1-wseg">BSD ' + d.bsd + "</span>");
    if (d.attach > 0) segs.push('<span class="pmq-t1-wseg">' + d.attach + " attachments</span>");
    if (!segs.length) return;

    const s = wapi.store.thread(key);
    const open = s.expandedByIds["t1work"] === true;

    const cards = [];
    const goal = wapi.builders.goalCard(key);
    if (goal) cards.push(goal);
    const todo = wapi.builders.todoCard(key);
    if (todo) cards.push(todo);
    wapi.builders.subagentCards(key).forEach(c => cards.push(c));
    wapi.builders.diffCards(key).forEach(c => cards.push(c));
    const live = wapi.builders.activityLiveCard(key);
    if (live) cards.push(live);
    /* The strip quotes approval/warning counts, so their actionable cards must
       stay reachable inside the same disclosure. */
    wapi.builders.approvalCards(key).forEach(c => cards.push(c));
    wapi.builders.warningCards(key).forEach(c => cards.push(c));
    const grant = wapi.builders.grantCard(key);
    if (grant) cards.push(grant);
    wapi.builders.capacityCards(key).forEach(c => cards.push(c));
    wapi.builders.bsdCards(key).forEach(c => cards.push(c));
    wapi.builders.opsCards(key).forEach(c => cards.push(c));
    wapi.builders.attachmentResolutionCards(key).forEach(c => cards.push(c));
    wapi.builders.artifactCards(key).forEach(c => cards.push(c));
    const crew = wapi.builders.crewCard(key);
    if (crew) cards.push(crew);
    const interactive = cards.length > 0;

    const wrap = document.createElement("div");
    wrap.className = "pmq-t1-work";

    const caps = document.createElement(interactive ? "button" : "div");
    caps.className = "pmq-t1-workcaps";
    if (interactive) caps.type = "button";
    caps.innerHTML = segs.join("");
    wrap.appendChild(caps);

    if (interactive) {
      caps.setAttribute("aria-expanded", String(open));
      caps.addEventListener("click", () => {
        wapi.toggleSurface("t1work", () => wapi.store.mutate(() => { s.expandedByIds["t1work"] = !open; }));
      });
      const gw = document.createElement("div");
      gw.className = "pmq-gw" + (open ? " pmq-open" : "");
      gw.dataset.sid = "t1work";
      const gwi = document.createElement("div");
      gwi.className = "pmq-gwi";
      const body = document.createElement("div");
      body.className = "pmq-t1-workbody";
      cards.forEach(c => body.appendChild(c));
      gwi.appendChild(body);
      gw.appendChild(gwi);
      wrap.appendChild(gw);
      if (wapi.justOpened("t1work:" + key, open)) wapi.A.staggerIn(cards, { rise: 8, step: 30, cap: 220 });
    }

    container.appendChild(wrap);

    const morph = (name, id, text) => {
      const cell = wrap.querySelector('[data-wcell="' + name + '"]');
      if (cell && wapi.numChanged(id, text)) wapi.A.crossfadeNum(cell, text);
    };
    if (d.goalStatus) morph("goal", "t1goal:" + key, d.goalPhase || GOAL_LABELS[d.goalStatus] || d.goalStatus);
    if (d.todoTotal > 0) morph("todo", "t1todo:" + key, d.todoDone + " of " + d.todoTotal);
    if (d.agents > 0) {
      morph("agents", "t1agents:" + key, String(d.agents));
      if (d.queued > 0) morph("queued", "t1queued:" + key, String(d.queued));
      if (d.blocked > 0) morph("blocked", "t1blocked:" + key, String(d.blocked));
    }
    if (hasDiff) {
      morph("adds", "t1adds:" + key, "+" + d.diffAdds);
      morph("dels", "t1dels:" + key, "−" + d.diffDels);
    }
    if (d.approvals > 0) morph("approvals", "t1approvals:" + key, String(d.approvals));
    if (d.warnings > 0) morph("warnings", "t1warnings:" + key, String(d.warnings));
  }

  function mount(slotEl, ctx) {
    const handle = window.PMChatThreadKit.mount(slotEl, ctx, {
      structure: "prose",
      rootClass: "pmq-t1",
      enterMsg,
      surfacesPlacement: "inline",
      daySeparators: true,
      questRenderer,
      workRender,
      messageClass: () => "pmq-t1-msg",
      decorate(el, msg, api) {
        if (msg.role !== "assistant") return;
        const showMark = !api.prevMsg || api.prevMsg.role !== "assistant" ||
          api.fmt.dayKey(api.prevMsg.sentAt) !== api.fmt.dayKey(msg.sentAt);
        if (!showMark) return;
        const mark = document.createElement("span");
        mark.className = "pmq-role-mark";
        mark.textContent = (msg.runtime && msg.runtime.persona ? msg.runtime.persona + " · " : "") + "Assistant";
        el.querySelector(".pmq-msg-inner").prepend(mark);
      }
    });
    return handle;
  }

  window.PMChatThreads[ID] = { id: ID, label: window.PMChatRegistry.threadLabel(ID), mount };
})();
