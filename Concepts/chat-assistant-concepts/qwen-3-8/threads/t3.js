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
        '<button class="pmq-btn pmq-btn-primary" type="button" data-qsubmit>Submit</button>' +
      "</div>";
    zoneEl.appendChild(card);
    window.PMIcons.hydrate(card);

    const slideEl = card.querySelector("[data-qslide]");
    const ticksEl = card.querySelector("[data-ticks]");
    const numEl = card.querySelector("[data-qnum]");
    const prevBtn = card.querySelector("[data-qprev]");
    const nextBtn = card.querySelector("[data-qnext]");
    const skipBtn = card.querySelector("[data-qskip]");
    const submitBtn = card.querySelector("[data-qsubmit]");
    let curQ = api.q;
    let lastIdx = -1;

    /* Progress: one small tick per question — filled when answered, accent
       for the current one. */
    function paintTicks(q, idx) {
      ticksEl.innerHTML = q.questions.map((x, i) =>
        '<span class="pmq-t3q-tick' + (i === idx ? " pmq-here" : "") + (api.isAnswered(x) ? " pmq-answered" : "") + '"></span>').join("");
    }

    function paintChrome(q, idx) {
      const last = idx >= q.questions.length - 1;
      const numText = (idx + 1) + " of " + q.questions.length;
      if (numEl.textContent !== numText) api.A.crossfadeNum(numEl, numText);
      prevBtn.disabled = idx === 0;
      nextBtn.hidden = last;
      skipBtn.hidden = last;
      submitBtn.hidden = !last;
      submitBtn.disabled = !api.valid();
    }

    function renderSlide(q, idx) {
      slideEl.innerHTML = questSlideHtml(api, q.questions[idx]);
      window.PMIcons.hydrate(slideEl);
    }

    function refreshOptions(q, idx) {
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
      paintTicks(q, idx);
      paintChrome(q, idx);
      if (idx !== lastIdx) {
        const dir = lastIdx >= 0 ? (idx > lastIdx ? 1 : -1) : 0;
        lastIdx = idx;
        renderSlide(q, idx);
        if (dir && !api.reduced()) {
          try {
            slideEl.animate(
              [{ opacity: 0, transform: "translateX(" + 6 * dir + "px)" }, { opacity: 1, transform: "none" }],
              { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
            );
          } catch (e) {}
        }
      } else {
        refreshOptions(q, idx);
      }
    }

    card.addEventListener("click", e => {
      const question = curQ.questions[api.index()];
      const opt = e.target.closest("[data-opt]");
      if (opt) { api.select(question, opt.dataset.opt); return; }
      if (e.target.closest("[data-qcancel]")) { api.cancel(); return; }
      if (e.target.closest("[data-qprev]")) { api.prev(); return; }
      if (e.target.closest("[data-qnext]")) { api.next(); return; }
      if (e.target.closest("[data-qskip]")) { api.skip(); return; }
      if (e.target.closest("[data-qsubmit]")) { if (api.valid()) api.submit(); return; }
    });

    card.addEventListener("input", e => {
      if (e.target.matches("[data-free]")) api.setFree(curQ.questions[api.index()], e.target.value);
    });

    update(api.q, api.index());

    /* Entrance: slide 8px in from the right + fade. */
    if (!api.reduced()) {
      try {
        card.animate(
          [{ opacity: 0, transform: "translateX(8px)" }, { opacity: 1, transform: "none" }],
          { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        );
      } catch (e) {}
    }

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
        if (ro) ro.disconnect();
        zoneEl.style.minHeight = "";
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
