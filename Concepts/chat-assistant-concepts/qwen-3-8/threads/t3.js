(() => {
  const ID = "t3";

  /* Working-margin entrance: the turn slides in from the left with a long
      ease while the right metadata gutter (the hover column, when the margin
      layout is active) unrolls with a scaleX draw from its left edge. */
  function enterMsg(el, index) {
    if (!window.PMAnim || window.PMAnim.reduced()) return;
    const delay = Math.min(index * 40, 240);
    try {
      el.animate(
        [{ opacity: 0, transform: "translateX(-20px)" }, { opacity: 1, transform: "none" }],
        { duration: 380, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
      );
      const gutter = el.querySelector(".pmq-msg-hover");
      if (gutter && typeof gutter.animate === "function") {
        gutter.animate(
          [{ transform: "scaleX(0)", transformOrigin: "left center" }, { transform: "scaleX(1)", transformOrigin: "left center" }],
          { duration: 360, delay: delay + 60, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
        );
      }
    } catch (e) {}
  }

  /* ---- questionnaire sidecar: one slide body shared by the option rows ---- */

  function questSlideHtml(api, question) {
    const ans = api.answer(question);
    let body = "";
    if (question.kind === "freeform") {
      body = '<textarea class="pmq-t3q-free" rows="3" spellcheck="true" placeholder="Add a note" data-free>' + api.esc(ans.draft || "") + "</textarea>";
    } else {
      const multi = question.kind === "multi select";
      body = '<div class="pmq-t3q-opts">' + question.options.map(o => {
        const on = (ans.selected || []).includes(o);
        return '<button class="pmq-t3q-opt' + (on ? " pmq-on" : "") + '" type="button" data-opt="' + api.esc(o) + '" aria-pressed="' + on + '">' +
          '<span class="pmq-t3q-opttick" aria-hidden="true"></span>' +
          '<span class="pmq-t3q-opttext">' + api.esc(o) + "</span>" +
          (multi ? '<i data-ico="check" class="pmq-t3q-optcheck"></i>' : "") + "</button>";
      }).join("") + "</div>";
    }
    return '<div class="pmq-t3q-prompt">' + api.esc(question.prompt) + (question.required ? "" : ' <span class="pmq-t3q-optional">Optional</span>') + "</div>" + body;
  }

  /* Sidecar inspector card. The renderer ALWAYS builds the same .pmq-t3-quest
     DOM; the container query in t3.css decides placement (right margin gutter
     at >= 900px container, inline full-width below). */
  function questRenderer(zoneEl, api) {
    /* Causal lifecycle (video 04): the "Preparing questions…" pill comes
       first; the sidecar slides in after a beat (at once under reduced
       motion). */
    const pillEl = api.reduced() ? null : api.preparePill();

    const card = document.createElement("div");
    card.className = "pmq-t3-quest";
    card.innerHTML =
      '<div class="pmq-t3q-head">' +
        '<i data-ico="question"></i>' +
        '<span class="pmq-t3q-title">Questionnaire</span>' +
        '<span class="pmq-t3q-num" data-qnum></span>' +
        '<button class="pmq-btn pmq-btn-icon pmq-t3q-cancel" type="button" data-qcancel aria-label="Cancel questionnaire"><i data-ico="close"></i></button>' +
      "</div>" +
      '<div class="pmq-t3q-body">' +
        '<span class="pmq-t3q-ticks" data-ticks aria-hidden="true"></span>' +
        '<div class="pmq-t3q-slide" data-qslide></div>' +
      "</div>" +
      '<div class="pmq-t3q-foot">' +
        '<button class="pmq-btn" type="button" data-qprev><i data-ico="chevRight" style="transform:scaleX(-1)"></i>Prev</button>' +
        '<button class="pmq-btn" type="button" data-qskip>Skip</button>' +
        '<span class="pmq-t3q-spacer"></span>' +
        '<button class="pmq-btn" type="button" data-qnext>Next<i data-ico="chevRight"></i></button>' +
        '<button class="pmq-btn" type="button" data-qback hidden><i data-ico="chevRight" style="transform:scaleX(-1)"></i>Back</button>' +
        '<button class="pmq-btn pmq-btn-primary" type="button" data-qreview hidden>Review answers</button>' +
        '<button class="pmq-btn pmq-btn-primary" type="button" data-qsubmit hidden>Submit</button>' +
      "</div>";

    const slideEl = card.querySelector("[data-qslide]");
    const ticksEl = card.querySelector("[data-ticks]");
    const numEl = card.querySelector("[data-qnum]");
    const prevBtn = card.querySelector("[data-qprev]");
    const nextBtn = card.querySelector("[data-qnext]");
    const skipBtn = card.querySelector("[data-qskip]");
    const backBtn = card.querySelector("[data-qback]");
    const reviewBtn = card.querySelector("[data-qreview]");
    const submitBtn = card.querySelector("[data-qsubmit]");
    let curQ = api.q;
    let lastIdx = -1;
    let reviewing = false;

    let prepTimer = null;
    let dead = false;
    function mountCard() {
      prepTimer = null;
      if (dead) return;
      if (pillEl && pillEl.parentNode) pillEl.parentNode.removeChild(pillEl);
      zoneEl.appendChild(card);
      window.PMIcons.hydrate(card);
      /* Entrance: slide 8px in from the right + fade. */
      if (!api.reduced()) {
        try {
          card.animate(
            [{ opacity: 0, transform: "translateX(8px)" }, { opacity: 1, transform: "none" }],
            { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
          );
        } catch (e) {}
      }
      reserve();
    }
    if (pillEl) prepTimer = setTimeout(mountCard, 350);
    else mountCard();

    /* Progress: one small tick per question — filled when answered, accent
       for the current one. */
    function paintTicks(q, idx) {
      ticksEl.innerHTML = q.questions.map((x, i) =>
        '<span class="pmq-t3q-tick' + (!reviewing && i === idx ? " pmq-here" : "") + (api.isAnswered(x) ? " pmq-answered" : "") + '"></span>').join("");
    }

    function paintChrome(q, idx) {
      const last = idx >= q.questions.length - 1;
      const numText = reviewing ? "Review" : (idx + 1) + " of " + q.questions.length;
      if (numEl.textContent !== numText) api.A.crossfadeNum(numEl, numText);
      if (reviewing) {
        prevBtn.hidden = true;
        nextBtn.hidden = true;
        skipBtn.hidden = true;
        reviewBtn.hidden = true;
        backBtn.hidden = false;
        submitBtn.hidden = false;
        submitBtn.disabled = !api.valid();
        return;
      }
      prevBtn.disabled = idx === 0;
      prevBtn.hidden = false;
      nextBtn.hidden = last;
      skipBtn.hidden = false;
      backBtn.hidden = true;
      submitBtn.hidden = true;
      reviewBtn.hidden = !last;
      reviewBtn.disabled = !api.valid();
    }

    function renderSlide(q, idx) {
      slideEl.innerHTML = reviewing ? api.reviewHtml() : questSlideHtml(api, q.questions[idx]);
      window.PMIcons.hydrate(slideEl);
    }

    function refreshOptions(q, idx) {
      if (reviewing) return;
      const question = q.questions[idx];
      if (question.kind === "freeform") return;
      const ans = api.answer(question);
      card.querySelectorAll(".pmq-t3q-opt").forEach(opt => {
        const on = (ans.selected || []).includes(opt.dataset.opt);
        opt.classList.toggle("pmq-on", on);
        opt.setAttribute("aria-pressed", String(on));
      });
    }

    function update(q, idx) {
      curQ = q;
      if (reviewing && idx !== lastIdx) {
        /* Navigation back to a question index exits review. */
        reviewing = false;
        lastIdx = idx;
        paintTicks(q, idx);
        paintChrome(q, idx);
        renderSlide(q, idx);
        return;
      }
      paintTicks(q, idx);
      paintChrome(q, idx);
      if (reviewing || idx !== lastIdx) {
        const dir = reviewing ? 0 : (lastIdx >= 0 ? (idx > lastIdx ? 1 : -1) : 0);
        lastIdx = idx;
        renderSlide(q, idx);
        if (dir && !api.reduced()) {
          try {
            slideEl.animate(
              [{ opacity: 0, transform: "translateX(" + 6 * dir + "px)" }, { opacity: 1, transform: "none" }],
              { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
            );
          } catch (e) {}
        } else if (reviewing && !api.reduced()) {
          try {
            slideEl.animate(
              [{ opacity: 0 }, { opacity: 1 }],
              { duration: 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
            );
          } catch (e) {}
        }
      } else {
        refreshOptions(q, idx);
      }
    }

    /* Video 02 review: the answers read as sidecar rows; Back returns to
       the last question. */
    function enterReview() {
      if (reviewing) return;
      reviewing = true;
      update(curQ, api.index());
    }
    function exitReview() {
      if (!reviewing) return;
      reviewing = false;
      lastIdx = -1; /* force the question slide to repaint */
      update(curQ, api.index());
    }

    card.addEventListener("click", e => {
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
      const question = curQ.questions[api.index()];
      const opt = e.target.closest("[data-opt]");
      if (opt) { api.select(question, opt.dataset.opt); return; }
      if (e.target.closest("[data-qcancel]")) { api.cancel(); return; }
      if (e.target.closest("[data-qprev]")) { api.prev(); return; }
      if (e.target.closest("[data-qnext]")) { api.next(); return; }
      if (e.target.closest("[data-qskip]")) { api.skip(); return; }
      if (e.target.closest("[data-qreview]")) { if (api.valid()) enterReview(); return; }
      if (e.target.closest("[data-qsubmit]")) { if (api.valid()) api.submit(); return; }
    });

    card.addEventListener("input", e => {
      if (e.target.matches("[data-free]")) api.setFree(curQ.questions[api.index()], e.target.value);
    });

    update(api.q, api.index());

    /* In the wide layout the card is absolute in the margin gutter, so the
       zone must reserve its height to keep the composer clear. */
    let ro = null;
    function reserve() {
      try {
        const abs = window.getComputedStyle(card).position === "absolute";
        zoneEl.style.minHeight = abs ? card.offsetHeight + 24 + "px" : "";
      } catch (e) {}
    }
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(reserve);
      ro.observe(card);
    }
    reserve();

    return {
      update,
      unmount() {
        dead = true;
        if (prepTimer) { clearTimeout(prepTimer); prepTimer = null; }
        if (ro) ro.disconnect();
        zoneEl.style.minHeight = "";
        if (pillEl && pillEl.parentNode) pillEl.parentNode.removeChild(pillEl);
        if (card.parentNode) card.parentNode.removeChild(card);
      }
    };
  }

  /* ---- margin ledger (workRender) ---- */

  function workRender(container, key, wapi) {
    const d = wapi.data;
    const domains = [];
    if (d.goalStatus) domains.push({ id: "goal", label: "goal", value: d.goalStatus, build: () => { const el = wapi.builders.goalCard(key); return el ? [el] : []; } });
    if (d.todoTotal) domains.push({ id: "tasks", label: "tasks", value: d.todoDone + "/" + d.todoTotal, build: () => { const el = wapi.builders.todoCard(key); return el ? [el] : []; } });
    if (d.agents) domains.push({ id: "agents", label: "agents", value: String(d.agents), build: () => wapi.builders.subagentCards(key) });
    if (d.diffFiles) domains.push({ id: "diff", label: "diff", value: "+" + d.diffAdds + " \u2212" + d.diffDels, build: () => wapi.builders.diffCards(key) });
    const t3Alerts = [];
    wapi.builders.approvalCards(key).forEach(c => t3Alerts.push(c));
    const grant = wapi.builders.grantCard(key);
    if (grant) t3Alerts.push(grant);
    wapi.builders.capacityCards(key).forEach(c => t3Alerts.push(c));
    wapi.builders.warningCards(key).forEach(c => t3Alerts.push(c));
    if (t3Alerts.length) domains.push({ id: "alerts", label: "alerts", value: String(t3Alerts.length), build: () => t3Alerts });
    if (d.ops > 0) domains.push({ id: "ops", label: "ops", value: String(d.ops), build: () => wapi.builders.opsCards(key) });
    if (d.bsd > 0) domains.push({ id: "bsd", label: "bsd", value: String(d.bsd), build: () => wapi.builders.bsdCards(key) });
    if (d.attach > 0) domains.push({ id: "attach", label: "attach", value: String(d.attach), build: () => wapi.builders.attachmentResolutionCards(key) });
    const t3Arts = wapi.builders.artifactCards(key);
    if (t3Arts.length) domains.push({ id: "artifacts", label: "artifacts", value: String(t3Arts.length), build: () => t3Arts });
    if (!domains.length) return;

    const s = wapi.store.thread(key);
    const wrap = document.createElement("div");
    wrap.className = "pmq-t3-work";
    const strip = document.createElement("div");
    strip.className = "pmq-t3w-strip";
    const panels = document.createElement("div");
    panels.className = "pmq-t3w-panels";
    wrap.appendChild(strip);
    wrap.appendChild(panels);

    domains.forEach(dom => {
      const open = s.expandedByIds["t3w:" + dom.id] === true;
      const row = document.createElement("button");
      row.type = "button";
      row.className = "pmq-t3w-row" + (open ? " pmq-open" : "");
      row.dataset.t3w = dom.id;
      row.setAttribute("aria-expanded", String(open));
      row.innerHTML =
        '<span class="pmq-t3w-key">' + dom.label + '</span><span class="pmq-t3w-dot">\u00b7</span>' +
        '<span class="pmq-t3w-val" data-t3wval>' + wapi.esc(dom.value) + "</span>" +
        '<i data-ico="chevRight" class="pmq-t3w-chev"></i>';
      strip.appendChild(row);

      const holder = document.createElement("div");
      holder.className = "pmq-t3w-panel";
      holder.innerHTML = wapi.gridWrap(open, "", "pmq-t3w-wrap", "t3w-" + dom.id);
      const gwi = holder.querySelector(".pmq-gwi");
      dom.build().forEach(el => gwi.appendChild(el));
      panels.appendChild(holder);

      row.addEventListener("click", () => {
        const isOpen = s.expandedByIds["t3w:" + dom.id] === true;
        wapi.toggleSurface("t3w-" + dom.id, () => wapi.store.mutate(() => { s.expandedByIds["t3w:" + dom.id] = !isOpen; }));
      });

      const valCell = row.querySelector("[data-t3wval]");
      if (wapi.numChanged("t3w-" + dom.id + ":" + key, dom.value)) wapi.A.crossfadeNum(valCell, dom.value);
    });

    window.PMIcons.hydrate(wrap);
    if (wapi.justOpened("t3work:" + key, true)) {
      wapi.A.staggerIn(strip.querySelectorAll(".pmq-t3w-row"), { rise: 4, step: 30, cap: 200 });
    }
    container.appendChild(wrap);

    /* The last turn's always-visible margin gutter can run past a short body
       (pre-existing margin behavior); keep the ledger clear of that overflow. */
    const msgs = container.querySelectorAll(".pmq-msg");
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg) {
      const gut = lastMsg.querySelector(".pmq-msg-hover");
      if (gut) {
        const over = gut.getBoundingClientRect().bottom - lastMsg.getBoundingClientRect().bottom;
        wrap.style.marginTop = (over > 4 ? Math.ceil(over) + 12 : 16) + "px";
      }
    }

    /* Surfaces outside the four ledger domains keep their ordinary inline
       treatment so nothing actionable is dropped. */
    const rest = [];
    wapi.builders.approvalCards(key).forEach(el => rest.push(el));
    wapi.builders.warningCards(key).forEach(el => rest.push(el));
    const live = wapi.builders.activityLiveCard(key);
    if (live) rest.push(live);
    const crew = wapi.builders.crewCard(key);
    if (crew) rest.push(crew);
    wapi.builders.artifactCards(key).forEach(el => rest.push(el));
    wapi.builders.questRecordCards(key).forEach(el => rest.push(el));
    if (rest.length) {
      const restWrap = document.createElement("div");
      restWrap.className = "pmq-surfaces pmq-t3w-rest";
      rest.forEach(el => restWrap.appendChild(el));
      container.appendChild(restWrap);
    }
  }

  function mount(slotEl, ctx) {
    const handle = window.PMChatThreadKit.mount(slotEl, ctx, {
      structure: "margin",
      rootClass: "pmq-t3",
      enterMsg,
      questRenderer,
      workRender,
      decorate(el, msg, api) {
        const inner = el.querySelector(".pmq-msg-inner");
        const role = document.createElement("span");
        role.className = "pmq-t3-role";
        if (msg.role === "user") {
          role.textContent = "You";
        } else {
          const rt = msg.runtime || {};
          role.textContent = rt.persona || "Assistant";
        }

        /* The body column owns the role label + prose; the hover row is its
           sibling so the wide-width working margin can bind to the BODY's top
           (absolute rail) instead of floating at the grid row's top. */
        const main = document.createElement("div");
        main.className = "pmq-t3-main";
        main.appendChild(role);
        Array.prototype.slice.call(inner.children).forEach(n => {
          if (!n.classList.contains("pmq-msg-hover")) main.appendChild(n);
        });
        inner.prepend(main);
      }
    });
    return handle;
  }

  window.PMChatThreads[ID] = { id: ID, label: window.PMChatRegistry.threadLabel(ID), mount };
})();
