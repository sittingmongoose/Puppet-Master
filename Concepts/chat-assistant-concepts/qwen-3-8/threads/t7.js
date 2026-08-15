(() => {
  const ID = "t7";

  const GRID_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  /* Single-detail chip memory, keyed by thread: survives the per-tick band
     rebuild, and holds at most ONE open chip per thread. */
  const openChip = Object.create(null);

  /* Surfaces-aloft entrance: messages drift up out of the transcript with a
     long, soft rise-and-settle (the surface band above already assembles with
     its own choreography). */
  function enterMsg(el, index) {
    if (!window.PMAnim || window.PMAnim.reduced()) return;
    try {
      el.animate(
        [{ opacity: 0, transform: "translateY(22px) scale(0.99)" }, { opacity: 1, transform: "none" }],
        { duration: 420, delay: Math.min(index * 40, 240), easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
      );
    } catch (e) {}
  }

  /* ---- questionnaire: a dock of numbered chips; the active chip grows into
         the full card inline within the wrapping dock row ---- */

  function questDockRenderer(zoneEl, api) {
    const q = api.q;
    const A = api.A;
    const esc = api.esc;
    let cur = api.index();
    let reviewing = false;
    let built = false;
    let dead = false;
    let timer = 0;

    let dock = null, grow = null, chips = [], numEl = null, bodyEl = null,
        prevBtn = null, skipBtn = null, nextBtn = null, reviewBtn = null, submitBtn = null;

    function slideHtml(x) {
      const ans = api.answer(x);
      let body = "";
      if (x.kind === "freeform") {
        body = '<textarea class="pmq-t7-qfree" rows="3" spellcheck="true" placeholder="Add a note" data-free>' + esc(ans.draft || "") + "</textarea>";
      } else {
        const multi = x.kind === "multi select";
        body = '<div class="pmq-t7-qopts">' + x.options.map(o => {
          const on = (ans.selected || []).includes(o);
          return '<button class="pmq-t7-qopt' + (on ? " pmq-on" : "") + '" type="button" data-opt="' + esc(o) + '" aria-pressed="' + on + '">' +
            '<span class="pmq-t7-qmark">' + (multi ? '<i data-ico="check"></i>' : "") + "</span><span>" + esc(o) + "</span></button>";
        }).join("") + "</div>";
      }
      return '<div class="pmq-t7-qprompt">' + esc(x.prompt) + (x.required ? "" : ' <span class="pmq-t7-qoptional">Optional</span>') + "</div>" + body;
    }

    function paintBody() {
      bodyEl.innerHTML = slideHtml(q.questions[cur]);
      window.PMIcons.hydrate(bodyEl);
    }

    /* Review page (video 02): the dock lists every answer as rows with
       per-question back links; Back + Submit sit in the dock footer. */
    function paintReview() {
      bodyEl.innerHTML = api.reviewHtml();
      prevBtn.hidden = false;
      skipBtn.hidden = true;
      nextBtn.hidden = true;
      reviewBtn.hidden = true;
      submitBtn.hidden = false;
      submitBtn.disabled = !api.valid();
    }

    function enterReview() {
      reviewing = true;
      paintReview();
    }

    function exitReview() {
      reviewing = false;
      paintBody();
      chrome(false);
    }

    function chrome(crossfade) {
      const last = cur >= q.questions.length - 1;
      chips.forEach((c, i) => {
        c.classList.toggle("pmq-here", i === cur);
        c.classList.toggle("pmq-answered", api.isAnswered(q.questions[i]));
        if (i === cur) c.setAttribute("aria-current", "step");
        else c.removeAttribute("aria-current");
      });
      const numText = (cur + 1) + " of " + q.questions.length;
      if (numEl && numEl.textContent !== numText) {
        if (crossfade) A.crossfadeNum(numEl, numText);
        else numEl.textContent = numText;
      }
      prevBtn.disabled = cur === 0;
      /* Skip stays visible on every question page (video 02). */
      skipBtn.hidden = false;
      nextBtn.hidden = last;
      reviewBtn.hidden = !last;
      reviewBtn.disabled = !api.valid();
      submitBtn.hidden = true;
    }

    /* Question change: swap content, interpolate the body bounds over 240ms. */
    function swapBody() {
      const hOld = bodyEl.offsetHeight;
      paintBody();
      chrome(true);
      if (api.reduced()) return;
      const hNew = bodyEl.offsetHeight;
      if (!hOld || Math.abs(hOld - hNew) < 2) return;
      try {
        bodyEl.style.overflow = "hidden";
        bodyEl.animate(
          [{ height: hOld + "px", opacity: 0.5 }, { height: hNew + "px", opacity: 1 }],
          { duration: 240, easing: GRID_EASE }
        ).finished.then(() => { bodyEl.style.overflow = ""; }).catch(() => { bodyEl.style.overflow = ""; });
      } catch (e) { bodyEl.style.overflow = ""; }
    }

    function build(pillEl) {
      if (dead) return;
      if (pillEl && pillEl.parentNode) pillEl.parentNode.removeChild(pillEl);

      dock = document.createElement("div");
      dock.className = "pmq-t7-quest";
      dock.innerHTML =
        '<div class="pmq-t7-qrow">' +
          q.questions.map((x, i) =>
            '<button class="pmq-t7-qchip" type="button" data-qchip="' + i + '" aria-label="Go to question ' + (i + 1) + '">' + (i + 1) + "</button>"
          ).join("") +
          api.gridWrap(true,
            '<div class="pmq-t7-qcard">' +
              '<div class="pmq-t7-qcard-head">' +
                '<i data-ico="question"></i>' +
                '<span class="pmq-t7-qcard-title">Question <span class="pmq-t7-qnum" data-qnum></span></span>' +
                '<button class="pmq-btn pmq-btn-icon pmq-t7-qcancel" type="button" data-qcancel aria-label="Cancel questionnaire"><i data-ico="close"></i></button>' +
              "</div>" +
              '<div class="pmq-t7-qbody" data-qbody></div>' +
              '<div class="pmq-t7-qfoot">' +
                '<button class="pmq-btn" type="button" data-qprev><i data-ico="chevRight" style="transform:scaleX(-1)"></i>Previous</button>' +
                '<button class="pmq-btn" type="button" data-qskip>Skip this question</button>' +
                '<button class="pmq-btn pmq-btn-primary" type="button" data-qnext>Next<i data-ico="chevRight"></i></button>' +
                '<button class="pmq-btn pmq-btn-primary" type="button" data-qreview>Review answers</button>' +
                '<button class="pmq-btn pmq-btn-primary" type="button" data-qsubmit>Submit</button>' +
              "</div>" +
            "</div>", "pmq-t7-qgrow", "t7quest") +
        "</div>";
      zoneEl.appendChild(dock);
      window.PMIcons.hydrate(dock);

      grow = dock.querySelector(".pmq-t7-qgrow");
      chips = Array.prototype.slice.call(dock.querySelectorAll(".pmq-t7-qchip"));
      numEl = dock.querySelector("[data-qnum]");
      bodyEl = dock.querySelector("[data-qbody]");
      prevBtn = dock.querySelector("[data-qprev]");
      skipBtn = dock.querySelector("[data-qskip]");
      nextBtn = dock.querySelector("[data-qnext]");
      reviewBtn = dock.querySelector("[data-qreview]");
      submitBtn = dock.querySelector("[data-qsubmit]");

      dock.addEventListener("click", e => {
        const rev = e.target.closest("[data-revto]");
        if (rev) { const to = +rev.dataset.revto; if (to === cur) exitReview(); else api.gotoQuestion(to); return; }
        const chip = e.target.closest("[data-qchip]");
        if (chip) { const to = +chip.dataset.qchip; if (to === cur) { if (reviewing) exitReview(); } else api.gotoQuestion(to); return; }
        if (e.target.closest("[data-qcancel]")) { api.cancel(); return; }
        if (e.target.closest("[data-qprev]")) {
          /* Back from the review page returns to the last question and
             exits review. */
          if (reviewing) { exitReview(); api.gotoQuestion(q.questions.length - 1); return; }
          api.prev(); return;
        }
        if (e.target.closest("[data-qnext]")) { api.next(); return; }
        if (e.target.closest("[data-qskip]")) { api.skip(); return; }
        if (e.target.closest("[data-qreview]")) { enterReview(); return; }
        if (e.target.closest("[data-qsubmit]")) { if (api.valid()) api.submit(); return; }
        const opt = e.target.closest("[data-opt]");
        if (opt) api.select(q.questions[cur], opt.dataset.opt);
      });
      dock.addEventListener("input", e => {
        if (e.target.matches("[data-free]")) api.setFree(q.questions[cur], e.target.value);
      });

      paintBody();
      chrome(false);
      built = true;

      /* Entrance: the chip row assembles first, then the active chip grows its
         card (grid-rows bounds interpolation, 240ms). */
      if (!api.reduced()) {
        A.staggerIn(chips, { rise: 6, duration: 260, step: 22, cap: 180 });
        const delay = Math.min(chips.length * 22, 180) + 120;
        grow.style.transition = "none";
        try {
          grow.animate(
            [{ gridTemplateRows: "0fr" }, { gridTemplateRows: "1fr" }],
            { duration: 240, delay: delay, easing: GRID_EASE, fill: "backwards" }
          ).finished.then(() => { grow.style.transition = ""; }).catch(() => { grow.style.transition = ""; });
        } catch (e) { grow.style.transition = ""; }
      }
    }

    /* Lifecycle (video 04): the shared "Preparing questions…" pill holds the
       zone first; the dock reveals after a short beat (the pill never paints
       under reduced motion — build resolves immediately). */
    const pill = api.preparePill();
    if (api.reduced()) build(pill);
    else timer = setTimeout(() => build(pill), 350);

    return {
      update(nq, idx) {
        if (!built) { cur = idx; return; }
        if (idx !== cur) {
          /* Any jump back onto a question (review back-links) exits review. */
          reviewing = false;
          cur = idx;
          swapBody();
          return;
        }
        if (reviewing) return;
        const x = q.questions[cur];
        if (x.kind !== "freeform") {
          const ans = api.answer(x);
          dock.querySelectorAll(".pmq-t7-qopt").forEach(o => {
            const on = (ans.selected || []).includes(o.dataset.opt);
            o.classList.toggle("pmq-on", on);
            o.setAttribute("aria-pressed", String(on));
          });
        }
        chrome(true);
      },
      unmount() {
        dead = true;
        clearTimeout(timer);
        if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
        if (dock && dock.parentNode) dock.parentNode.removeChild(dock);
      }
    };
  }

  /* ---- work surfaces: live-count chips in the aloft band; an opened chip
         grows to a full-width card holding the matching builder card ---- */

  function workBandRender(container, key, wapi) {
    const store = wapi.store;
    const esc = wapi.esc;
    const A = wapi.A;
    const d = wapi.data;
    const b = wapi.builders;

    const chips = [];
    if (d.goalStatus) chips.push({ id: "goal", ico: "goal", label: "goal\u00b7" + d.goalStatus, cards: () => [b.goalCard(key)] });
    if (d.todoTotal) chips.push({ id: "tasks", ico: "todo", label: "tasks " + d.todoDone + "/" + d.todoTotal, cards: () => [b.todoCard(key)] });
    if (d.agents) chips.push({ id: "agents", ico: "agents", label: "agents " + d.agents, cards: () => b.subagentCards(key) });
    if (d.diffFiles) chips.push({ id: "diff", ico: "diff", label: "diff +" + d.diffAdds + " \u2212" + d.diffDels, cards: () => b.diffCards(key) });
    const alerts = (d.approvals || 0) + (d.warnings || 0);
    if (alerts) chips.push({ id: "alerts", ico: "warn", label: "alerts " + alerts, cards: () => {
        const cards = b.approvalCards(key);
        const grant = b.grantCard(key);
        if (grant) cards.push(grant);
        b.capacityCards(key).forEach(c => cards.push(c));
        return cards.concat(b.warningCards(key));
      } });
    if (d.ops > 0) chips.push({ id: "ops", ico: "branch", label: "ops " + d.ops, cards: () => b.opsCards(key) });
    if (d.bsd > 0) chips.push({ id: "bsd", ico: "sparkle", label: "bsd " + d.bsd, cards: () => b.bsdCards(key) });
    if (d.attach > 0) chips.push({ id: "attach", ico: "attach", label: "attach " + d.attach, cards: () => b.attachmentResolutionCards(key) });
    const t7Arts = b.artifactCards(key);
    if (t7Arts.length) chips.push({ id: "artifacts", ico: "layers", label: "artifacts " + t7Arts.length, cards: () => b.artifactCards(key) });
    if (!chips.length) return;

    const open = openChip[key] || null;
    const first = wapi.justOpened("t7band:" + key, true);
    const els = [];

    chips.forEach(c => {
      const isOpen = open === c.id;
      const el = document.createElement("div");
      el.className = "pmq-surface pmq-t7-chip pmq-t7-chip-" + c.id + (isOpen ? " pmq-open" : "");
      el.innerHTML =
        '<button class="pmq-surface-head" type="button" data-t7toggle="' + c.id + '" aria-expanded="' + isOpen + '">' +
          '<i data-ico="' + c.ico + '"></i>' +
          '<span class="pmq-surface-title">' + esc(c.label) + "</span>" +
          '<i data-ico="' + (isOpen ? "collapse" : "expand") + '"></i>' +
        "</button>" +
        (isOpen ? wapi.gridWrap(true, '<div class="pmq-t7-chipcard"></div>', "pmq-t7-chipwrap", "t7c-" + c.id) : "");
      if (isOpen) {
        const holder = el.querySelector(".pmq-t7-chipcard");
        c.cards().forEach(card => { if (card) holder.appendChild(card); });
      }
      el.querySelector("[data-t7toggle]").addEventListener("click", () => {
        wapi.toggleSurface("t7c-" + c.id, () => store.mutate(() => {
          openChip[key] = openChip[key] === c.id ? null : c.id;
        }));
      });
      container.appendChild(el);
      els.push(el);
    });

    if (first && !A.reduced()) A.staggerIn(els, { rise: 6, duration: 280, step: 26, cap: 160 });
  }

  function mount(slotEl, ctx) {
    return window.PMChatThreadKit.mount(slotEl, ctx, {
      structure: "aloft",
      rootClass: "pmq-t7",
      enterMsg,
      surfacesPlacement: "band",
      messageClass: () => "pmq-t7-msg",
      questRenderer: questDockRenderer,
      workRender: workBandRender,
      decorate(el, msg, api) {
        if (msg.role !== "assistant") return;
        if (api.prevMsg && api.prevMsg.role === "assistant") return;
        const label = document.createElement("span");
        label.className = "pmq-t7-role";
        label.textContent = ((msg.runtime && msg.runtime.persona) ? msg.runtime.persona + " \u00b7 " : "") + "Assistant";
        el.querySelector(".pmq-msg-inner").prepend(label);
      }
    });
  }

  window.PMChatThreads[ID] = { id: ID, label: window.PMChatRegistry.threadLabel(ID), mount };
})();
