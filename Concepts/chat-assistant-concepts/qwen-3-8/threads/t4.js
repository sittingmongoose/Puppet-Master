(() => {
  const ID = "t4";

  /* Session-spine entrance: the rail tick draws down from its top, then the
     body files in from the left with a visible slide-and-settle. */
  function enterMsg(el, index) {
    if (!window.PMAnim || window.PMAnim.reduced()) return;
    const delay = Math.min(index * 40, 240);
    try {
      const tick = el.querySelector(".pmq-t4-tick");
      if (tick && typeof tick.animate === "function") {
        tick.animate(
          [{ transform: "scaleY(0)", transformOrigin: "center top" }, { transform: "scaleY(1)", transformOrigin: "center top" }],
          { duration: 240, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
        );
      }
      el.animate(
        [{ opacity: 0, transform: "translateX(-16px) scale(0.985)" }, { opacity: 1, transform: "none" }],
        { duration: 400, delay: delay + 60, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
      );
    } catch (e) {}
  }

  /* ---- questionnaire slide body (shared shape for the spine card) ---- */

  function questSlideHtml(api, question) {
    const ans = api.answer(question);
    let body = "";
    if (question.kind === "freeform") {
      body = '<textarea class="pmq-t4q-free" rows="3" spellcheck="true" placeholder="Add a note" data-free>' + api.esc(ans.draft || "") + "</textarea>";
    } else {
      const multi = question.kind === "multi select";
      body = '<div class="pmq-t4q-opts">' + question.options.map(o => {
        const on = (ans.selected || []).includes(o);
        return '<button class="pmq-t4q-opt' + (on ? " pmq-on" : "") + '" type="button" data-opt="' + api.esc(o) + '" aria-pressed="' + on + '">' +
          '<span class="pmq-t4q-mark">' + (multi ? '<i data-ico="check"></i>' : "") + "</span>" +
          '<span class="pmq-t4q-opttext">' + api.esc(o) + "</span></button>";
      }).join("") + "</div>";
    }
    return '<div class="pmq-t4q-prompt">' + api.esc(question.prompt) + (question.required ? "" : ' <span class="pmq-t4q-optional">Optional</span>') + "</div>" + body;
  }

  /* Stepper on the rail: a highlighted spine node carries the question glyph,
     the card sits in the content lane joined by a dotted leader, and progress
     reads as vertical position along a mini rail of tick dots at the card's
     left edge. */
  function questRenderer(zoneEl, api) {
    const root = document.createElement("div");
    root.className = "pmq-t4-quest";
    root.innerHTML =
      '<div class="pmq-t4q-railcol">' +
        '<span class="pmq-t4q-node" data-qnode><i data-ico="question"></i></span>' +
      "</div>" +
      '<div class="pmq-t4q-lane">' +
        '<div class="pmq-t4q-card">' +
          '<div class="pmq-t4q-head">' +
            '<span class="pmq-t4q-title">Questionnaire</span>' +
            '<span class="pmq-t4q-num" data-qnum></span>' +
            '<button class="pmq-btn pmq-btn-icon pmq-t4q-cancel" type="button" data-qcancel aria-label="Cancel questionnaire"><i data-ico="close"></i></button>' +
          "</div>" +
          '<div class="pmq-t4q-body">' +
            '<span class="pmq-t4q-dots" data-dots aria-hidden="true"></span>' +
            '<div class="pmq-t4q-slide" data-qslide></div>' +
          "</div>" +
          '<div class="pmq-t4q-foot">' +
            '<button class="pmq-btn" type="button" data-qprev><i data-ico="chevRight" style="transform:scaleX(-1)"></i>Prev</button>' +
            '<button class="pmq-btn" type="button" data-qskip>Skip</button>' +
            '<span class="pmq-t4q-spacer"></span>' +
            '<button class="pmq-btn" type="button" data-qnext>Next<i data-ico="chevRight"></i></button>' +
            '<button class="pmq-btn pmq-btn-primary" type="button" data-qsubmit>Submit</button>' +
          "</div>" +
        "</div>" +
      "</div>";
    zoneEl.appendChild(root);
    window.PMIcons.hydrate(root);

    const cardEl = root.querySelector(".pmq-t4q-card");
    const slideEl = root.querySelector("[data-qslide]");
    const dotsEl = root.querySelector("[data-dots]");
    const numEl = root.querySelector("[data-qnum]");
    const prevBtn = root.querySelector("[data-qprev]");
    const nextBtn = root.querySelector("[data-qnext]");
    const skipBtn = root.querySelector("[data-qskip]");
    const submitBtn = root.querySelector("[data-qsubmit]");
    let curQ = api.q;
    let lastIdx = -1;

    /* Mini rail: 3-5 dots; each dot stands for one question (proportional
       positions when the questionnaire has more than five). */
    function dotMap(q) {
      const n = q.questions.length;
      const dots = Math.max(3, Math.min(5, n));
      const map = [];
      /* proportional positions keep every dot in range for any n (reduces to
         the identity map when dots === n) */
      for (let j = 0; j < dots; j++) map.push(n === 1 ? 0 : Math.round(j * (n - 1) / (dots - 1)));
      return map;
    }

    function paintDots(q, idx) {
      dotsEl.innerHTML = dotMap(q).map(qi => {
        const x = q.questions[qi];
        return '<span class="pmq-t4q-dot' + (qi === idx ? " pmq-here" : "") + (api.isAnswered(x) ? " pmq-answered" : "") + '"></span>';
      }).join("");
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
      root.querySelectorAll(".pmq-t4q-opt").forEach(opt => {
        const on = (ans.selected || []).includes(opt.dataset.opt);
        opt.classList.toggle("pmq-on", on);
        opt.setAttribute("aria-pressed", String(on));
      });
    }

    function update(q, idx) {
      curQ = q;
      paintDots(q, idx);
      paintChrome(q, idx);
      if (idx !== lastIdx) {
        const dir = lastIdx >= 0 ? (idx > lastIdx ? 1 : -1) : 0;
        lastIdx = idx;
        renderSlide(q, idx);
        if (dir && !api.reduced()) {
          try {
            slideEl.animate(
              [{ opacity: 0, transform: "translateX(" + -6 * dir + "px)" }, { opacity: 1, transform: "none" }],
              { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
            );
          } catch (e) {}
        }
      } else {
        refreshOptions(q, idx);
      }
    }

    root.addEventListener("click", e => {
      const question = curQ.questions[api.index()];
      const opt = e.target.closest("[data-opt]");
      if (opt) { api.select(question, opt.dataset.opt); return; }
      if (e.target.closest("[data-qcancel]")) { api.cancel(); return; }
      if (e.target.closest("[data-qprev]")) { api.prev(); return; }
      if (e.target.closest("[data-qnext]")) { api.next(); return; }
      if (e.target.closest("[data-qskip]")) { api.skip(); return; }
      if (e.target.closest("[data-qsubmit]")) { if (api.valid()) api.submit(); return; }
    });

    root.addEventListener("input", e => {
      if (e.target.matches("[data-free]")) api.setFree(curQ.questions[api.index()], e.target.value);
    });

    update(api.q, api.index());

    /* Entrance: the rail node pops first, then the card fades in from the
       left along its dotted leader. */
    if (!api.reduced()) {
      api.A.pop(root.querySelector("[data-qnode]"));
      try {
        cardEl.animate(
          [{ opacity: 0, transform: "translateX(-8px)" }, { opacity: 1, transform: "none" }],
          { duration: 300, delay: 130, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
        );
      } catch (e) {}
    }

    return {
      update,
      unmount() {
        if (root.parentNode) root.parentNode.removeChild(root);
      }
    };
  }

  /* ---- spine work nodes (workRender) ----
     Collapsed: constant-neutral nodes on the rail with tiny lane labels.
     Expansion: an inline panel in the content lane under the node. */

  function workRender(container, key, wapi) {
    const d = wapi.data;
    const domains = [];
    if (d.goalStatus) domains.push({ id: "goal", label: "Goal", value: d.goalStatus, build: () => { const el = wapi.builders.goalCard(key); return el ? [el] : []; } });
    if (d.todoTotal) domains.push({ id: "tasks", label: "Tasks", value: d.todoDone + "/" + d.todoTotal, build: () => { const el = wapi.builders.todoCard(key); return el ? [el] : []; } });
    if (d.agents) domains.push({ id: "agents", label: "Agents", value: String(d.agents), build: () => wapi.builders.subagentCards(key) });
    if (d.diffFiles) domains.push({ id: "diff", label: "Diff", value: "+" + d.diffAdds + " \u2212" + d.diffDels, build: () => wapi.builders.diffCards(key) });
    if (d.ops > 0) domains.push({ id: "ops", label: "Ops", value: String(d.ops), build: () => wapi.builders.opsCards(key) });
    if (d.bsd > 0) domains.push({ id: "bsd", label: "BSD", value: String(d.bsd), build: () => wapi.builders.bsdCards(key) });
    if (d.attach > 0) domains.push({ id: "attach", label: "Attach", value: String(d.attach), build: () => wapi.builders.attachmentResolutionCards(key) });
    if (d.capacity > 0) domains.push({ id: "capacity", label: "Capacity", value: String(d.capacity), build: () => wapi.builders.capacityCards(key) });

    /* Surfaces outside the spine domains keep their ordinary inline treatment
       in the content lane so nothing actionable is dropped. */
    const rest = [];
    wapi.builders.approvalCards(key).forEach(el => rest.push(el));
    const grant = wapi.builders.grantCard(key);
    if (grant) rest.push(grant);
    wapi.builders.warningCards(key).forEach(el => rest.push(el));
    const live = wapi.builders.activityLiveCard(key);
    if (live) rest.push(live);
    const crew = wapi.builders.crewCard(key);
    if (crew) rest.push(crew);
    wapi.builders.artifactCards(key).forEach(el => rest.push(el));
    wapi.builders.questRecordCards(key).forEach(el => rest.push(el));

    if (!domains.length && !rest.length) return;

    const s = wapi.store.thread(key);
    const wrap = document.createElement("div");
    wrap.className = "pmq-t4-work";

    domains.forEach(dom => {
      const open = s.expandedByIds["t4w:" + dom.id] === true;
      const block = document.createElement("div");
      block.className = "pmq-t4w-dom" + (open ? " pmq-open" : "");
      block.dataset.domain = dom.id;

      const row = document.createElement("button");
      row.type = "button";
      row.className = "pmq-t4w-row";
      row.setAttribute("aria-expanded", String(open));
      row.innerHTML =
        '<span class="pmq-t4w-node" aria-hidden="true"></span>' +
        '<span class="pmq-t4w-lane"><span class="pmq-t4w-label">' + dom.label + "</span>" +
        '<span class="pmq-t4w-val" data-t4wval>' + wapi.esc(dom.value) + "</span>" +
        '<i data-ico="' + (open ? "collapse" : "expand") + '" class="pmq-t4w-chev"></i></span>';
      block.appendChild(row);

      const holder = document.createElement("div");
      holder.className = "pmq-t4w-panel";
      holder.innerHTML = wapi.gridWrap(open, "", "pmq-t4w-wrap", "t4w-" + dom.id);
      const gwi = holder.querySelector(".pmq-gwi");
      dom.build().forEach(el => gwi.appendChild(el));
      block.appendChild(holder);
      wrap.appendChild(block);

      row.addEventListener("click", () => {
        const isOpen = s.expandedByIds["t4w:" + dom.id] === true;
        wapi.toggleSurface("t4w-" + dom.id, () => wapi.store.mutate(() => { s.expandedByIds["t4w:" + dom.id] = !isOpen; }));
      });

      const valCell = row.querySelector("[data-t4wval]");
      if (wapi.numChanged("t4w-" + dom.id + ":" + key, dom.value)) wapi.A.crossfadeNum(valCell, dom.value);
    });

    window.PMIcons.hydrate(wrap);
    if (wapi.justOpened("t4work:" + key, true)) {
      wapi.A.staggerIn(wrap.querySelectorAll(".pmq-t4w-row"), { rise: 4, step: 34, cap: 220 });
    }
    container.appendChild(wrap);

    if (rest.length) {
      const restWrap = document.createElement("div");
      restWrap.className = "pmq-surfaces pmq-t4w-rest";
      rest.forEach(el => restWrap.appendChild(el));
      container.appendChild(restWrap);
    }
  }

  function mount(slotEl, ctx) {
    const handle = window.PMChatThreadKit.mount(slotEl, ctx, {
      structure: "spine",
      rootClass: "pmq-t4",
      enterMsg,
      daySeparators: true,
      questRenderer,
      workRender,
      decorate(el, msg, api) {
        const inner = el.querySelector(".pmq-msg-inner");
        const rt = msg.runtime || {};
        const spine = document.createElement("div");
        spine.className = "pmq-t4-spine";
        const dur = rt.workedSeconds ? api.fmt.dur(rt.workedSeconds) : "";
        spine.innerHTML =
          '<span class="pmq-t4-tick"></span>' +
          '<span class="pmq-t4-time">' + api.fmt.clock(msg.sentAt) + "</span>" +
          (dur ? '<span class="pmq-t4-dur">' + api.fmt.esc(dur) + "</span>" : "");
        inner.prepend(spine);
      }
    });
    return handle;
  }

  window.PMChatThreads[ID] = { id: ID, label: window.PMChatRegistry.threadLabel(ID), mount };
})();
