(() => {
  const ID = "t6";

  function flatSnippet(text) {
    const flat = String(text || "").replace(/\s+/g, " ").trim();
    return flat.length > 96 ? flat.slice(0, 96).trimEnd() + "\u2026" : flat;
  }

  /* Dense-rows entrance: the row files in from the right with a long slide
     along the list axis, visibly settling onto the ledger. */
  function enterMsg(el, index) {
    if (!window.PMAnim || window.PMAnim.reduced()) return;
    try {
      el.animate(
        [{ opacity: 0, transform: "translateX(26px)" }, { opacity: 1, transform: "none" }],
        { duration: 380, delay: Math.min(index * 40, 240), easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
      );
    } catch (e) {}
  }

  /* ---- quest: highlighted dense-row block ----
     Header row [Q<i+1>/<n> · prompt] on an accent tint (no left border),
     one-line option rows below (row fill on select), tiny right-aligned
     actions. Advancing swaps the block content with a 150ms fade. One
     question visible; Skip skips one; Cancel ends the flow; the last
     question carries Submit, disabled until valid. */
  function questRenderer(zoneEl, api) {
    const q = api.q;

    const root = document.createElement("div");
    root.className = "pmq-t6q";
    root.innerHTML =
      '<div class="pmq-t6q-block">' +
        '<div class="pmq-t6q-head">' +
          '<span class="pmq-t6q-qn" data-qn></span>' +
          '<span class="pmq-t6q-prompt" data-qprompt></span>' +
        "</div>" +
        '<div class="pmq-t6q-body" data-qbody></div>' +
        '<div class="pmq-t6q-foot" data-qfoot></div>' +
      "</div>";
    zoneEl.appendChild(root);

    const qn = root.querySelector("[data-qn]");
    const promptEl = root.querySelector("[data-qprompt]");
    const bodyEl = root.querySelector("[data-qbody]");
    const footEl = root.querySelector("[data-qfoot]");
    let lastIdx = api.index();

    function bodyHtml(question) {
      const ans = api.answer(question);
      if (question.kind === "freeform") {
        return '<textarea class="pmq-t6q-free" rows="2" spellcheck="true" placeholder="Add a note" data-free>' + api.esc(ans.draft || "") + "</textarea>";
      }
      return '<div class="pmq-t6q-opts">' + question.options.map(o => {
        const on = (ans.selected || []).includes(o);
        return '<button class="pmq-t6q-opt' + (on ? " pmq-on" : "") + '" type="button" data-opt="' + api.esc(o) + '" aria-pressed="' + on + '">' +
          '<i data-ico="check"></i><span>' + api.esc(o) + "</span></button>";
      }).join("") + "</div>";
    }

    function footHtml(idx) {
      const last = idx >= q.questions.length - 1;
      return '<button class="pmq-btn pmq-t6q-btn" type="button" data-qprev' + (idx === 0 ? " disabled" : "") + ">Prev</button>" +
        (last ? "" : '<button class="pmq-btn pmq-t6q-btn" type="button" data-qskip>Skip</button>') +
        (last ? "" : '<button class="pmq-btn pmq-btn-primary pmq-t6q-btn" type="button" data-qnext>Next</button>') +
        (last ? '<button class="pmq-btn pmq-btn-primary pmq-t6q-btn" type="button" data-qsubmit' + (api.valid() ? "" : " disabled") + ">Submit</button>" : "") +
        '<button class="pmq-btn pmq-t6q-btn pmq-t6q-cancel" type="button" data-qcancel>Cancel</button>';
    }

    function paintContent(idx) {
      qn.textContent = "Q" + (idx + 1) + "/" + q.questions.length;
      promptEl.textContent = q.questions[idx].prompt;
      bodyEl.innerHTML = bodyHtml(q.questions[idx]);
      footEl.innerHTML = footHtml(idx);
      window.PMIcons.hydrate(bodyEl);
    }

    root.addEventListener("click", e => {
      const opt = e.target.closest("[data-opt]");
      if (opt) { api.select(q.questions[lastIdx], opt.dataset.opt); return; }
      if (e.target.closest("[data-qprev]")) { api.prev(); return; }
      if (e.target.closest("[data-qskip]")) { api.skip(); return; }
      if (e.target.closest("[data-qnext]")) { api.next(); return; }
      if (e.target.closest("[data-qcancel]")) { api.cancel(); return; }
      if (e.target.closest("[data-qsubmit]")) { api.submit(); return; }
    });

    root.addEventListener("input", e => {
      if (e.target.matches("[data-free]")) api.setFree(q.questions[lastIdx], e.target.value);
    });

    paintContent(lastIdx);

    return {
      update(nextQ, idx) {
        if (idx !== lastIdx) {
          lastIdx = idx;
          const block = root.querySelector(".pmq-t6q-block");
          /* Advance = content swap with a 150ms fade (75 out + 75 in). */
          if (api.reduced() || !block || typeof block.animate !== "function") { paintContent(idx); return; }
          try {
            block.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 75, easing: "ease-in" }).finished
              .then(() => {
                paintContent(idx);
                try { block.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 75, easing: "ease-out" }); } catch (e) {}
              })
              .catch(() => paintContent(idx));
          } catch (e) { paintContent(idx); }
          return;
        }
        /* Same question: refresh state in place so the textarea keeps focus. */
        const question = nextQ.questions[idx];
        if (question.kind !== "freeform") {
          const ans = api.answer(question);
          root.querySelectorAll(".pmq-t6q-opt").forEach(opt => {
            const on = (ans.selected || []).includes(opt.dataset.opt);
            opt.classList.toggle("pmq-on", on);
            opt.setAttribute("aria-pressed", String(on));
          });
        } else {
          const ta = root.querySelector("[data-free]");
          const ans = api.answer(question);
          if (ta && document.activeElement !== ta && ta.value !== (ans.draft || "")) ta.value = ans.draft || "";
        }
        const submit = root.querySelector("[data-qsubmit]");
        if (submit) submit.disabled = !api.valid();
      },
      unmount() {
        if (root.parentNode) root.parentNode.removeChild(root);
      }
    };
  }

  /* ---- work: ONE dense index row that opens a plate of builder cards ----
     The open state lives in the store (expandedByIds.t6work) so the per-tick
     rebuild recreates the row+plate in their committed state; the toggle is
     driven through the kit surface animation via sid "t6work". */
  function workRender(container, key, wapi) {
    const b = wapi.builders;
    const cards = [];
    const goal = b.goalCard(key);
    if (goal) cards.push(goal);
    const todo = b.todoCard(key);
    if (todo) cards.push(todo);
    cards.push(...b.subagentCards(key));
    cards.push(...b.diffCards(key));
    const live = b.activityLiveCard(key);
    if (live) cards.push(live);
    if (!cards.length) return;

    const d = wapi.data;
    const s = wapi.store.thread(key);
    const open = s.expandedByIds["t6work"] === true;

    const wrapEl = document.createElement("div");
    wrapEl.className = "pmq-t6work" + (open ? " pmq-open" : "");

    const row = document.createElement("button");
    row.type = "button";
    row.className = "pmq-t6work-row";
    row.setAttribute("aria-expanded", String(open));
    let segs = '<span class="pmq-t6work-tag">work</span>';
    if (d.goalStatus) segs += '<span class="pmq-t6work-seg">goal <b data-gst="' + wapi.esc(d.goalStatus) + '">' + wapi.esc(d.goalStatus) + "</b></span>";
    if (d.todoTotal) segs += '<span class="pmq-t6work-seg">tasks <b data-t6num="todo">' + d.todoDone + "/" + d.todoTotal + "</b></span>";
    if (d.agents) segs += '<span class="pmq-t6work-seg">agents <b data-t6num="agents">' + d.agents + "</b></span>";
    if (d.diffFiles) segs += '<span class="pmq-t6work-seg pmq-t6work-diffseg"><b class="pmq-diff-add" data-t6num="adds">+' + d.diffAdds +
      '</b><b class="pmq-diff-del" data-t6num="dels">\u2212' + d.diffDels + "</b></span>";
    row.innerHTML = segs;

    const gw = document.createElement("div");
    gw.className = "pmq-gw pmq-t6work-plate" + (open ? " pmq-open" : "");
    gw.dataset.sid = "t6work";
    const gwi = document.createElement("div");
    gwi.className = "pmq-gwi";
    const holder = document.createElement("div");
    holder.className = "pmq-t6work-cards";
    cards.forEach(c => holder.appendChild(c));
    gwi.appendChild(holder);
    gw.appendChild(gwi);

    row.addEventListener("click", e => {
      e.stopPropagation();
      wapi.toggleSurface("t6work", () => wapi.store.mutate(() => { s.expandedByIds["t6work"] = !open; }));
    });

    wrapEl.appendChild(row);
    wrapEl.appendChild(gw);
    container.appendChild(wrapEl);

    /* Live counts crossfade as the ledger ticks. */
    const cross = (sel, track, val, text) => {
      const cell = row.querySelector('[data-t6num="' + sel + '"]');
      if (cell && wapi.numChanged(track + ":" + key, val)) wapi.A.crossfadeNum(cell, text);
    };
    cross("todo", "t6work-todo", d.todoDone, d.todoDone + "/" + d.todoTotal);
    cross("agents", "t6work-agents", d.agents, String(d.agents));
    cross("adds", "t6work-adds", d.diffAdds, "+" + d.diffAdds);
    cross("dels", "t6work-dels", d.diffDels, "\u2212" + d.diffDels);
  }

  function mount(slotEl, ctx) {
    return window.PMChatThreadKit.mount(slotEl, ctx, {
      structure: "rows",
      rootClass: "pmq-t6",
      enterMsg,
      messageClass: () => "pmq-t6-msg",
      questRenderer,
      workRender,
      decorate(el, msg, api) {
        const st = api.store.thread(api.store.activeKey());
        const all = api.store.messages(api.store.activeKey());
        const isLatest = all.length && all[all.length - 1].id === msg.id;
        const key = "row:" + msg.id;
        const open = (key in st.expandedByIds) ? st.expandedByIds[key] === true : (isLatest || !!msg.stopped);
        el.classList.toggle("pmq-row-open", open);

        const inner = el.querySelector(".pmq-msg-inner");
        if (!inner || inner.querySelector(".pmq-t6-row")) return;

        const row = document.createElement("button");
        row.type = "button";
        row.className = "pmq-t6-row";
        row.setAttribute("aria-expanded", String(open));

        const role = document.createElement("span");
        role.className = "pmq-t6-role";
        role.textContent = msg.role === "user" ? "You" : "Assistant";

        const snip = document.createElement("span");
        snip.className = "pmq-t6-snip";
        snip.textContent = flatSnippet(msg.body);

        const meta = document.createElement("span");
        meta.className = "pmq-t6-meta";
        const dur = document.createElement("span");
        dur.className = "pmq-t6-dur";
        dur.textContent = api.fmt.dur((msg.runtime && msg.runtime.workedSeconds) || 0);
        const clock = document.createElement("span");
        clock.className = "pmq-t6-clock";
        clock.textContent = api.fmt.clock(msg.sentAt);
        meta.appendChild(dur);
        meta.appendChild(clock);

        row.appendChild(role);
        row.appendChild(snip);
        const shape = api.store.lensShapeOf(msg.id);
        if (shape) {
          const tag = document.createElement("span");
          tag.className = "pmq-t6-shape";
          tag.textContent = shape === "muted" ? "Muted" : "Subcompacted";
          row.appendChild(tag);
        }
        row.appendChild(meta);

        /* Grid-rows plate around the prose so expand/collapse interpolates
           0fr <-> 1fr in place. The per-tick rebuild recreates this wrapper
           in its committed state, so nothing replays; the click toggles the
           class directly (silent state write, no store emit) and the
           transition runs uninterrupted. */
        const gw = document.createElement("div");
        gw.className = "pmq-gw pmq-t6-plate" + (open ? " pmq-open" : "");
        const gwi = document.createElement("div");
        gwi.className = "pmq-gwi";
        ["pmq-body", "pmq-thoughts", "pmq-agroup", "pmq-cquest"].forEach(cls => {
          const node = inner.querySelector(":scope > ." + cls);
          if (node) gwi.appendChild(node);
        });
        gw.appendChild(gwi);

        row.addEventListener("click", e => {
          e.stopPropagation();
          const s = api.store.thread(api.store.activeKey());
          const willOpen = !el.classList.contains("pmq-row-open");
          if (s && s.expandedByIds) s.expandedByIds[key] = willOpen;
          el.classList.toggle("pmq-row-open", willOpen);
          gw.classList.toggle("pmq-open", willOpen);
          row.setAttribute("aria-expanded", String(willOpen));
        });

        inner.prepend(row);
        const hover = inner.querySelector(":scope > .pmq-msg-hover");
        inner.insertBefore(gw, hover || null);
      }
    });
  }

  window.PMChatThreads[ID] = { id: ID, label: window.PMChatRegistry.threadLabel(ID), mount };
})();
